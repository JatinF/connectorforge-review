import { NextResponse } from "next/server";

import { redirectTo } from "@/lib/form";
import { profileForRole } from "@/lib/roles";
import { openSession, readSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

export const dynamic = "force-dynamic";

export function GET() {
  const session = readSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({
    authenticated: true,
    subject: session.subject,
    tenantId: session.tenantId,
    role: session.role,
    scopes: session.scopes,
  });
}

export async function POST(request: Request) {
  const form = await request.formData();
  const roleId = String(form.get("role") ?? "");
  if (!profileForRole(roleId)) {
    return redirectTo(request, "/sign-in", { error: "Choose a listed fixture role." });
  }
  const id = openSession(roleId);
  if (!id) {
    return redirectTo(request, "/sign-in", { error: "Choose a listed fixture role." });
  }
  const response = redirectTo(request, "/");
  response.cookies.set(SESSION_COOKIE, id, sessionCookieOptions());
  return response;
}
