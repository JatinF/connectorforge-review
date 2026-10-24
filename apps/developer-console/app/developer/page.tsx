import { redirect } from "next/navigation";

import { Flash } from "@/components/flash";
import { BackendError, getCatalog, getFeedback } from "@/lib/backend";
import { readSession } from "@/lib/session";
import type { CatalogPlugin, FeedbackItem } from "@/lib/types";

const STATUS_NOTES = `{
  "plugin_id": "status-notes",
  "connector_key": "status-notes",
  "name": "Status Notes",
  "summary": "Read synthetic status notes for the caller org.",
  "category": "Notes",
  "version": "1.0.0",
  "tools": [
    {
      "name": "list_notes",
      "description": "List status notes in the caller org.",
      "scopes": ["notes.read"],
      "readOnlyHint": true,
      "destructiveHint": false
    }
  ]
}`;

export default async function DeveloperPage({
  searchParams,
}: {
  searchParams: { notice?: string; error?: string; code?: string };
}) {
  const session = readSession();
  if (!session) {
    redirect("/sign-in");
  }
  const canPublish = session.scopes.includes("plugins.publish");
  let plugins: CatalogPlugin[] = [];
  let feedback: FeedbackItem[] = [];
  let loadError = "";
  try {
    plugins = (await getCatalog(session)).plugins;
    feedback = (await getFeedback(session)).feedback;
  } catch (error) {
    loadError = error instanceof BackendError ? error.message : "Developer data could not be loaded.";
  }
  return (
    <section>
      <h1 className="text-3xl font-semibold">Developer portal</h1>
      <p className="mt-3 max-w-3xl">
        Publishing is accepted only when the API grants plugins.publish. Schema checks run in the API. This page can
        publish the in-process connectors only: issue-tracker, knowledge-search, team-calendar, and status-notes.
      </p>
      <p className="mt-2">{canPublish ? "This session can publish." : "This session cannot publish. The API will refuse a submit."}</p>
      <div className="mt-4">
        <Flash notice={searchParams.notice} error={searchParams.error || loadError} code={searchParams.code} />
      </div>
      <form action="/api/plugins" method="post" className="mt-6 border border-black p-4">
        <h2 className="text-xl font-semibold">Register a version</h2>
        <label className="mt-3 block text-sm font-semibold" htmlFor="manifest">
          Manifest JSON
        </label>
        <textarea className="mt-1 h-64 w-full border border-black p-2 font-mono text-sm" defaultValue={STATUS_NOTES} id="manifest" name="manifest" spellCheck={false} />
        <ul className="mt-3 list-disc pl-5 text-sm">
          <li>plugin_id matches connector_key and an in-process connector.</li>
          <li>version is major.minor.patch. Repeating a version returns a conflict.</li>
          <li>Tool names must match the connector. Write tools set destructiveHint.</li>
          <li>Compatibility reported by the catalog is mcp for the in-process server.</li>
        </ul>
        <button className="mt-4 border border-black bg-black px-3 py-2 text-white" type="submit">
          Publish version
        </button>
      </form>
      <form action="/api/plugins" method="post" className="mt-6 border border-black p-4">
        <h2 className="text-xl font-semibold">Deprecate</h2>
        <input name="action" type="hidden" value="deprecate" />
        <label className="mt-3 block text-sm font-semibold" htmlFor="plugin_id">
          Plugin id
        </label>
        <input className="mt-1 w-full border border-black px-2 py-2" id="plugin_id" name="plugin_id" />
        <button className="mt-3 border border-black px-3 py-2" type="submit">
          Deprecate plugin
        </button>
      </form>
      <h2 className="mt-8 text-2xl font-semibold">Registered plugins</h2>
      <ul className="mt-3 grid gap-3">
        {plugins.map((plugin) => (
          <li key={plugin.plugin_id} className="border border-black p-3 text-sm">
            {plugin.name} {plugin.version} · {plugin.status} · {plugin.compatibility.join(", ")}
          </li>
        ))}
      </ul>
      <form action="/api/feedback" method="post" className="mt-8 border border-black p-4">
        <h2 className="text-xl font-semibold">Testing feedback</h2>
        <label className="mt-3 block text-sm font-semibold" htmlFor="kind">
          Kind
        </label>
        <input className="mt-1 w-full border border-black px-2 py-2" id="kind" name="kind" defaultValue="onboarding" />
        <label className="mt-3 block text-sm font-semibold" htmlFor="body">
          Notes
        </label>
        <textarea className="mt-1 h-24 w-full border border-black p-2" id="body" name="body" defaultValue="The install button label was unclear during onboarding." />
        <button className="mt-3 border border-black px-3 py-2" type="submit">
          Save feedback
        </button>
      </form>
      <h2 className="mt-8 text-2xl font-semibold">Feedback for this organization</h2>
      {feedback.length === 0 ? <p className="mt-3">No feedback is stored for this organization.</p> : null}
      <ul className="mt-3 grid gap-3">
        {feedback.map((item) => (
          <li key={item.feedback_id} className="border border-black p-3">
            <p className="text-sm font-semibold">{item.kind}</p>
            <p>{item.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
