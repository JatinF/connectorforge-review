import "server-only";

import { randomBytes } from "crypto";
import { cookies } from "next/headers";

import { profileForRole } from "./roles";
import type { SessionProfile } from "./types";

export const SESSION_COOKIE = "cfc_session";

type StoredSession = {
  roleId: string;
};

const globalStore = globalThis as typeof globalThis & {
  __connectorforgeConsoleSessions?: Map<string, StoredSession>;
};

const sessions = globalStore.__connectorforgeConsoleSessions ?? new Map<string, StoredSession>();
globalStore.__connectorforgeConsoleSessions = sessions;

export function openSession(roleId: string): string | null {
  if (!profileForRole(roleId)) {
    return null;
  }
  const id = randomBytes(24).toString("hex");
  sessions.set(id, { roleId });
  return id;
}

export function closeSession(id: string): void {
  sessions.delete(id);
}

export function readSession(): SessionProfile | null {
  const id = cookies().get(SESSION_COOKIE)?.value;
  if (!id) {
    return null;
  }
  const stored = sessions.get(id);
  if (!stored) {
    return null;
  }
  return profileForRole(stored.roleId);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: false,
  };
}
