import "server-only";

import { NextResponse } from "next/server";

import { BackendError } from "./backend";
import { readSession } from "./session";
import type { SessionProfile } from "./types";

export function redirectTo(request: Request, path: string, params: Record<string, string> = {}) {
  const current = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? current.host;
  const proto = request.headers.get("x-forwarded-proto") ?? current.protocol.replace(":", "");
  const url = new URL(path, `${proto}://${host}`);
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }
  return NextResponse.redirect(url, 303);
}

export function requireSession(request: Request): SessionProfile | NextResponse {
  const session = readSession();
  if (!session) {
    return redirectTo(request, "/sign-in", { error: "Sign in before using the console." });
  }
  return session;
}

export function isSession(value: SessionProfile | NextResponse): value is SessionProfile {
  return !(value instanceof NextResponse);
}

export function failureRedirect(request: Request, path: string, error: unknown) {
  const message = error instanceof BackendError ? error.message : "The console could not complete that action.";
  const code = error instanceof BackendError ? error.code : "error";
  return redirectTo(request, path, { error: message, code });
}
