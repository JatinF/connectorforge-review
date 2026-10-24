import Link from "next/link";
import { redirect } from "next/navigation";

import { Flash } from "@/components/flash";
import { BackendError, getCatalog } from "@/lib/backend";
import { filterPlugins } from "@/lib/filter-plugins";
import { readSession } from "@/lib/session";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; installed?: string; error?: string; notice?: string; code?: string };
}) {
  const session = readSession();
  if (!session) {
    redirect("/sign-in");
  }
  let plugins: Awaited<ReturnType<typeof getCatalog>>["plugins"] = [];
  let loadError = "";
  try {
    const catalog = await getCatalog(session, searchParams.q ?? "");
    plugins = filterPlugins(catalog.plugins, {
      category: searchParams.category,
      installed: searchParams.installed,
    });
  } catch (error) {
    loadError = error instanceof BackendError ? error.message : "The catalog could not be loaded.";
  }
  const shownCategories = ["Operations", "Knowledge", "Calendar", "Notes"];
  return (
    <section>
      <h1 className="text-3xl font-semibold">Marketplace</h1>
      <p className="mt-3 max-w-3xl">
        Plugins registered in the ConnectorForge API for {session.tenantId}. Installation is stored for this
        organization. Search text is applied by the API.
      </p>
      <div className="mt-4">
        <Flash notice={searchParams.notice} error={searchParams.error || loadError} code={searchParams.code} />
      </div>
      <form className="mt-6 grid gap-3 border border-black p-4 md:grid-cols-4" method="get">
        <div>
          <label className="block text-sm font-semibold" htmlFor="q">
            Search
          </label>
          <input className="mt-1 w-full border border-black px-2 py-2" defaultValue={searchParams.q ?? ""} id="q" name="q" type="search" />
        </div>
        <div>
          <label className="block text-sm font-semibold" htmlFor="category">
            Category
          </label>
          <select className="mt-1 w-full border border-black px-2 py-2" defaultValue={searchParams.category ?? "all"} id="category" name="category">
            <option value="all">All</option>
            {shownCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold" htmlFor="installed">
            Installation
          </label>
          <select className="mt-1 w-full border border-black px-2 py-2" defaultValue={searchParams.installed ?? "all"} id="installed" name="installed">
            <option value="all">Any</option>
            <option value="installed">Installed</option>
            <option value="available">Not installed</option>
          </select>
        </div>
        <div className="flex items-end">
          <button className="border border-black bg-black px-3 py-2 text-white" type="submit">
            Apply filters
          </button>
        </div>
      </form>
      {plugins.length === 0 && !loadError ? (
        <p className="mt-6 border border-black p-4">No plugins match this search.</p>
      ) : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {plugins.map((plugin) => (
            <li key={plugin.plugin_id} className="border border-black p-4">
              <p className="text-sm">{plugin.category}</p>
              <h2 className="text-xl font-semibold">
                <Link href={`/plugins/${plugin.plugin_id}`}>{plugin.name}</Link>
              </h2>
              <p className="mt-2">{plugin.summary}</p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="font-semibold">Version</dt>
                  <dd>{plugin.version}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Status</dt>
                  <dd>{plugin.status}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Installation</dt>
                  <dd>{plugin.installed ? "Installed" : "Not installed"}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Publisher org</dt>
                  <dd>{plugin.publisher_tenant}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
