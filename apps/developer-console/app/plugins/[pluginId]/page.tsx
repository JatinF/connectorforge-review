import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Flash } from "@/components/flash";
import { BackendError, getPlugin } from "@/lib/backend";
import { readSession } from "@/lib/session";

export default async function PluginPage({
  params,
  searchParams,
}: {
  params: { pluginId: string };
  searchParams: { notice?: string; error?: string; code?: string; approval_id?: string };
}) {
  const session = readSession();
  if (!session) {
    redirect("/sign-in");
  }
  let plugin = null;
  let loadError = "";
  try {
    plugin = await getPlugin(session, params.pluginId);
  } catch (error) {
    loadError = error instanceof BackendError ? error.message : "The plugin could not be loaded.";
  }
  if (!loadError && !plugin) {
    notFound();
  }
  const writeScopes = plugin
    ? [...new Set(plugin.tools.filter((tool) => !tool.readOnlyHint).flatMap((tool) => tool.scopes))]
    : [];
  const readScopes = plugin
    ? [...new Set(plugin.tools.filter((tool) => tool.readOnlyHint).flatMap((tool) => tool.scopes))]
    : [];
  const allScopes = [...new Set([...(readScopes), ...writeScopes])];
  return (
    <section>
      <p>
        <Link href="/">Marketplace</Link>
      </p>
      <div className="mt-4">
        <Flash notice={searchParams.notice} error={searchParams.error || loadError} code={searchParams.code} />
      </div>
      {plugin ? (
        <>
          <h1 className="mt-4 text-3xl font-semibold">{plugin.name}</h1>
          <p className="mt-3 max-w-3xl">{plugin.summary}</p>
          <dl className="mt-4 grid gap-3 border border-black p-4 sm:grid-cols-2">
            <div>
              <dt className="font-semibold">Plugin id</dt>
              <dd>{plugin.plugin_id}</dd>
            </div>
            <div>
              <dt className="font-semibold">Latest version</dt>
              <dd>{plugin.version}</dd>
            </div>
            <div>
              <dt className="font-semibold">Status</dt>
              <dd>{plugin.status}</dd>
            </div>
            <div>
              <dt className="font-semibold">Compatibility</dt>
              <dd>{plugin.compatibility.join(", ")} in-process. Remote MCP is not running.</dd>
            </div>
            <div>
              <dt className="font-semibold">Publisher organization</dt>
              <dd>{plugin.publisher_tenant}</dd>
            </div>
            <div>
              <dt className="font-semibold">This organization</dt>
              <dd>
                {plugin.installed ? `Installed. Scopes: ${plugin.granted_scopes.join(", ") || "none"}.` : "Not installed."}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-sm">
            The catalog returns the latest version only. Version history is not exposed by the API.
          </p>
          <h2 className="mt-8 text-2xl font-semibold">Tools</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse border border-black text-left text-sm">
              <thead>
                <tr>
                  <th className="border border-black px-2 py-2" scope="col">Tool</th>
                  <th className="border border-black px-2 py-2" scope="col">Effect</th>
                  <th className="border border-black px-2 py-2" scope="col">Scopes</th>
                  <th className="border border-black px-2 py-2" scope="col">Description</th>
                </tr>
              </thead>
              <tbody>
                {plugin.tools.map((tool) => (
                  <tr key={tool.name}>
                    <th className="border border-black px-2 py-2 font-medium" scope="row">{tool.name}</th>
                    <td className="border border-black px-2 py-2">{tool.readOnlyHint ? "Read-only" : "Write, approval required"}</td>
                    <td className="border border-black px-2 py-2">{tool.scopes.join(", ")}</td>
                    <td className="border border-black px-2 py-2">{tool.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h2 className="mt-8 text-2xl font-semibold">Organization installation</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            <form action="/api/installations" method="post">
              <input name="plugin_id" type="hidden" value={plugin.plugin_id} />
              <input name="action" type="hidden" value="install" />
              <button className="border border-black px-3 py-2" type="submit">
                Install read access
              </button>
            </form>
            {allScopes.length > 0 ? (
              <form action="/api/installations" method="post">
                <input name="plugin_id" type="hidden" value={plugin.plugin_id} />
                <input name="action" type="hidden" value="install" />
                <input name="scopes" type="hidden" value={allScopes.join(",")} />
                <button className="border border-black bg-black px-3 py-2 text-white" type="submit">
                  Install read and write access
                </button>
              </form>
            ) : null}
            <form action="/api/installations" method="post">
              <input name="plugin_id" type="hidden" value={plugin.plugin_id} />
              <input name="action" type="hidden" value="uninstall" />
              <button className="border border-black px-3 py-2" type="submit">
                Uninstall
              </button>
            </form>
          </div>
          <p className="mt-2 text-sm">Read access sends no scope list, so the API grants its default read scopes.</p>
          {plugin.tools.some((tool) => !tool.readOnlyHint) ? (
            <form action="/api/approvals" method="post" className="mt-6 border border-black p-4">
              <h2 className="text-xl font-semibold">Request a write approval</h2>
              <p className="mt-2 text-sm">
                The API returns an approval id to this subject. It does not offer a queue listing. A different person
                in {session.tenantId} enters that id on the admin page.
              </p>
              <label className="mt-3 block text-sm font-semibold" htmlFor="tool">
                Write tool
              </label>
              <select className="mt-1 border border-black px-2 py-2" id="tool" name="tool">
                {plugin.tools.filter((tool) => !tool.readOnlyHint).map((tool) => (
                  <option key={tool.name} value={tool.name}>
                    {tool.name}
                  </option>
                ))}
              </select>
              <input name="plugin_id" type="hidden" value={plugin.plugin_id} />
              <button className="ml-3 border border-black px-3 py-2" type="submit">
                Request approval
              </button>
              {searchParams.approval_id ? (
                <p className="mt-3">
                  Approval id <strong>{searchParams.approval_id}</strong>
                </p>
              ) : null}
            </form>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
