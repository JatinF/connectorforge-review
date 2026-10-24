import "server-only";

import { roleChoice } from "./roles-public";
import type { SessionProfile } from "./types";

const FIXTURE_TOKENS: Record<string, string> = {
  publisher: "dev-publisher-north",
  member: "dev-member-north",
  admin: "dev-admin-north",
  west: "dev-member-west",
  self: "dev-self-north",
};

const PROFILES: Record<string, Omit<SessionProfile, "roleId">> = {
  publisher: {
    subject: "SYN-USER-CASEY",
    tenantId: "SYN-ORG-NORTH",
    role: "developer",
    scopes: ["catalog.read", "plugins.publish", "plugins.install", "tools.invoke", "approvals.request"],
  },
  member: {
    subject: "SYN-USER-MIRA",
    tenantId: "SYN-ORG-NORTH",
    role: "member",
    scopes: ["catalog.read", "plugins.install", "tools.invoke", "approvals.request"],
  },
  admin: {
    subject: "SYN-USER-ELEN",
    tenantId: "SYN-ORG-NORTH",
    role: "admin",
    scopes: ["catalog.read", "org.admin", "approvals.decide", "audit.read"],
  },
  west: {
    subject: "SYN-USER-WES",
    tenantId: "SYN-ORG-WEST",
    role: "member",
    scopes: ["catalog.read", "plugins.install", "tools.invoke", "approvals.request"],
  },
  self: {
    subject: "SYN-USER-MIRA",
    tenantId: "SYN-ORG-NORTH",
    role: "admin",
    scopes: ["catalog.read", "org.admin", "approvals.decide", "audit.read"],
  },
};

export function tokenForRole(roleId: string): string {
  const token = FIXTURE_TOKENS[roleId];
  if (!token) {
    throw new Error("unknown role");
  }
  return token;
}

export function profileForRole(roleId: string): SessionProfile | null {
  const profile = PROFILES[roleId];
  if (!profile || !roleChoice(roleId)) {
    return null;
  }
  return { roleId, ...profile };
}
