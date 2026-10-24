import { ROLE_CHOICES } from "@/lib/roles-public";

import { Flash } from "@/components/flash";

export default function SignInPage({
  searchParams,
}: {
  searchParams: { error?: string; code?: string };
}) {
  return (
    <section className="max-w-3xl">
      <h1 className="text-3xl font-semibold">Sign in</h1>
      <p className="mt-3">
        This console uses a local fixture session. The browser receives an opaque cookie. Fixture bearer tokens stay
        on the server. The ConnectorForge OAuth code exchange is a test stub and is not used here. Production identity,
        PKCE, and an external provider are not running.
      </p>
      <div className="mt-4">
        <Flash error={searchParams.error} code={searchParams.code} />
      </div>
      <ul className="mt-6 grid gap-4">
        {ROLE_CHOICES.map((choice) => (
          <li key={choice.id} className="border border-black p-4">
            <h2 className="text-xl font-semibold">
              {choice.person} · {choice.organization}
            </h2>
            <p className="mt-1 text-sm">{choice.role}</p>
            <p className="mt-2">{choice.summary}</p>
            <form action="/api/session" method="post" className="mt-3">
              <input name="role" type="hidden" value={choice.id} />
              <button className="border border-black bg-black px-3 py-2 text-white" type="submit">
                Continue as {choice.person}
                {choice.id === "self" ? " (self-approval probe)" : ""}
              </button>
            </form>
          </li>
        ))}
      </ul>
    </section>
  );
}
