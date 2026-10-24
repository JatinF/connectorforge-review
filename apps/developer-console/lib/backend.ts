import "server-only";

import { tokenForRole } from "./roles";
import type {
  ApiFailure,
  AuditEvent,
  Catalog,
  CatalogPlugin,
  FeedbackItem,
  Health,
  SessionProfile,
} from "./types";

export class BackendError extends Error {
  status: number;
  code: string;

  constructor(failure: ApiFailure) {
    super(failure.message);
    this.status = failure.status;
    this.code = failure.code;
  }
}

export function apiBase(): string {
  return process.env.CONNECTORFORGE_API_URL ?? "http://127.0.0.1:8765";
}

async function request(path: string, init: RequestInit, token?: string): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(new URL(path, apiBase()), {
      ...init,
      headers: {
        accept: "application/json",
        ...(init.body ? { "content-type": "application/json" } : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(init.headers ?? {}),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new BackendError({
      status: 503,
      code: "unreachable",
      message: `ConnectorForge API at ${apiBase()} did not respond. Start the API process and set CONNECTORFORGE_API_URL.`,
    });
  }
  const text = await response.text();
  const body = text ? (JSON.parse(text) as { error?: string; message?: string }) : {};
  if (!response.ok) {
    throw new BackendError({
      status: response.status,
      code: body.error ?? "error",
      message: body.message ?? "The API refused the request.",
    });
  }
  return body;
}

function authed(session: SessionProfile, path: string, init: RequestInit = {}) {
  return request(path, init, tokenForRole(session.roleId));
}

export function getHealth(): Promise<Health> {
  return request("/healthz", { method: "GET" }) as Promise<Health>;
}

export function getCatalog(session: SessionProfile, query = ""): Promise<Catalog> {
  const path = query ? `/v1/catalog?q=${encodeURIComponent(query)}` : "/v1/catalog";
  return authed(session, path, { method: "GET" }) as Promise<Catalog>;
}

export async function getPlugin(session: SessionProfile, pluginId: string): Promise<CatalogPlugin | null> {
  const catalog = await getCatalog(session);
  return catalog.plugins.find((plugin) => plugin.plugin_id === pluginId) ?? null;
}

export function installPlugin(session: SessionProfile, pluginId: string, scopes: string[] | null) {
  return authed(session, "/v1/installations", {
    method: "POST",
    body: JSON.stringify(scopes ? { plugin_id: pluginId, scopes } : { plugin_id: pluginId }),
  });
}

export function uninstallPlugin(session: SessionProfile, pluginId: string) {
  return authed(session, `/v1/installations/${encodeURIComponent(pluginId)}`, { method: "DELETE" });
}

export function publishPlugin(session: SessionProfile, manifest: unknown) {
  return authed(session, "/v1/plugins", {
    method: "POST",
    body: JSON.stringify(manifest),
  });
}

export function deprecatePlugin(session: SessionProfile, pluginId: string) {
  return authed(session, `/v1/plugins/${encodeURIComponent(pluginId)}/deprecate`, { method: "POST" });
}

export function setAllowlist(session: SessionProfile, pluginId: string, allowed: boolean) {
  return authed(session, `/v1/orgs/${encodeURIComponent(session.tenantId)}/allowlist`, {
    method: "POST",
    body: JSON.stringify({ plugin_id: pluginId, allowed }),
  }) as Promise<{ organization: string; plugin_id: string; allowed: boolean }>;
}

export function requestApproval(
  session: SessionProfile,
  pluginId: string,
  tool: string,
  argumentsValue: Record<string, unknown>,
) {
  return authed(session, "/v1/approvals", {
    method: "POST",
    body: JSON.stringify({ plugin_id: pluginId, tool, arguments: argumentsValue }),
  }) as Promise<{ approval_id: string; status: string }>;
}

export function decideApproval(session: SessionProfile, approvalId: string, decision: string) {
  return authed(session, `/v1/approvals/${encodeURIComponent(approvalId)}/decision`, {
    method: "POST",
    body: JSON.stringify({ decision }),
  }) as Promise<{ approval_id: string; status: string }>;
}

export function getAudit(session: SessionProfile) {
  return authed(session, "/v1/audit", { method: "GET" }) as Promise<{ events: AuditEvent[] }>;
}

export function addFeedback(session: SessionProfile, kind: string, body: string) {
  return authed(session, "/v1/feedback", {
    method: "POST",
    body: JSON.stringify({ kind, body }),
  });
}

export function getFeedback(session: SessionProfile) {
  return authed(session, "/v1/feedback", { method: "GET" }) as Promise<{
    feedback: FeedbackItem[];
    priorities: Record<string, number>;
  }>;
}
