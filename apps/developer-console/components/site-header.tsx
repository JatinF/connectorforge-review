import Link from "next/link";

import { getHealth } from "@/lib/backend";
import { roleChoice } from "@/lib/roles-public";
import { readSession } from "@/lib/session";
import type { Health } from "@/lib/types";

const LINKS = [
  { href: "/", label: "Marketplace" },
  { href: "/developer", label: "Developer" },
  { href: "/admin", label: "Admin" },
  { href: "/evaluations", label: "Evaluations" },
];

export async function SiteHeader() {
  const session = readSession();
  const choice = session ? roleChoice(session.roleId) : undefined;
  let health: Health | null = null;
  let healthError = "";
  try {
    health = await getHealth();
  } catch (error) {
    healthError = error instanceof Error ? error.message : "API health check failed.";
  }
  return (
    <header className="border-b border-black">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div>
          <p className="text-xs uppercase tracking-widest">ConnectorForge</p>
          <p className="text-lg font-semibold">Developer Console</p>
        </div>
        <nav aria-label="Console">
          <ul className="flex flex-wrap gap-2">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link className="inline-block border border-black px-3 py-2 text-sm" href={link.href}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {session ? (
          <form action="/api/sign-out" method="post" className="flex items-center gap-3">
            <p className="text-sm">
              <span className="font-semibold">{choice?.person ?? session.subject}</span>
              <span className="block">{session.tenantId}</span>
            </p>
            <button className="border border-black px-3 py-2 text-sm" type="submit">
              Sign out
            </button>
          </form>
        ) : (
          <Link className="border border-black bg-black px-3 py-2 text-sm text-white" href="/sign-in">
            Sign in
          </Link>
        )}
      </div>
      <p className="border-t border-black px-4 py-2 text-sm">
        {health ? (
          <>
            API {health.version}. Database {health.database}. Deployment {health.deployment_decision}. PostgreSQL{" "}
            {health.gates.postgres}. Hosted model {health.gates["hosted-model-run"]}. External OAuth{" "}
            {health.gates["external-oauth-provider"]}.
          </>
        ) : (
          healthError
        )}
      </p>
    </header>
  );
}
