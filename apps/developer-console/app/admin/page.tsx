import { redirect } from "next/navigation";

import { Flash } from "@/components/flash";
import { BackendError, getAudit, getCatalog } from "@/lib/backend";
import { readSession } from "@/lib/session";
import type { AuditEvent, CatalogPlugin } from "@/lib/types";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { notice?: string; error?: string; code?: string; audit_q?: string };
}) {
  const session = readSession();
  if (!session) {
    redirect("/sign-in");
  }
  let plugins: CatalogPlugin[] = [];
  let events: AuditEvent[] = [];
  let loadError = "";
  try {
    plugins = (await getCatalog(session)).plugins;
  } catch (error) {
    loadError = error instanceof BackendError ? error.message : "The catalog could not be loaded.";
  }
  try {
    events = (await getAudit(session)).events;
  } catch (error) {
    const message = error instanceof BackendError ? error.message : "The audit log could not be loaded.";
    loadError = loadError ? `${loadError} ${message}` : message;
  }
  const needle = (searchParams.audit_q ?? "").trim().toLowerCase();
  const visible = events.filter((event) => {
    if (!needle) {
      return true;
    }
    return `${event.action} ${event.actor} ${event.plugin_id} ${event.tool_name} ${event.outcome}`.toLowerCase().includes(needle);
  });
  return (
    <section>
      <h1 className="text-3xl font-semibold">Admin console</h1>
      <p className="mt-3 max-w-3xl">
        Allowlist changes and approval decisions are sent to the API with this session. The organization id is taken
        from the server session, not from the form. A missing permission, another organization, or a self-approval is
        refused by the API.
      </p>
      <div className="mt-4">
        <Flash notice={searchParams.notice} error={searchParams.error || loadError} code={searchParams.code} />
      </div>
      <form action="/api/allowlist" method="post" className="mt-6 border border-black p-4">
        <h2 className="text-xl font-semibold">Organization policy</h2>
        <p className="mt-2 text-sm">Applies to {session.tenantId}. The catalog API does not return the current allow flag, so the saved result and the audit row are the evidence.</p>
        <label className="mt-3 block text-sm font-semibold" htmlFor="policy_plugin">
          Plugin
        </label>
        <select className="mt-1 border border-black px-2 py-2" id="policy_plugin" name="plugin_id">
          {plugins.map((plugin) => (
            <option key={plugin.plugin_id} value={plugin.plugin_id}>
              {plugin.name}
            </option>
          ))}
        </select>
        <label className="mt-3 block text-sm font-semibold" htmlFor="allowed">
          Permission
        </label>
        <select className="mt-1 border border-black px-2 py-2" id="allowed" name="allowed">
          <option value="true">Allow</option>
          <option value="false">Block</option>
        </select>
        <button className="ml-3 border border-black px-3 py-2" type="submit">
          Save policy
        </button>
      </form>
      <form action="/api/approvals/decision" method="post" className="mt-6 border border-black p-4">
        <h2 className="text-xl font-semibold">Approval decision</h2>
        <p className="mt-2 text-sm">
          There is no approval-list endpoint. Enter the id returned to the requester. The API checks organization,
          pending state, and that the approver is a different subject.
        </p>
        <label className="mt-3 block text-sm font-semibold" htmlFor="approval_id">
          Approval id
        </label>
        <input className="mt-1 w-full border border-black px-2 py-2" id="approval_id" name="approval_id" />
        <div className="mt-3 flex flex-wrap gap-3">
          <button className="border border-black bg-black px-3 py-2 text-white" name="decision" type="submit" value="approve">
            Approve
          </button>
          <button className="border border-black px-3 py-2" name="decision" type="submit" value="reject">
            Reject
          </button>
        </div>
      </form>
      <form className="mt-8 flex flex-wrap items-end gap-3" method="get">
        <div className="grow">
          <label className="block text-sm font-semibold" htmlFor="audit_q">
            Search audit events
          </label>
          <input className="mt-1 w-full border border-black px-2 py-2" defaultValue={searchParams.audit_q ?? ""} id="audit_q" name="audit_q" type="search" />
        </div>
        <button className="border border-black px-3 py-2" type="submit">
          Search
        </button>
      </form>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse border border-black text-left text-sm">
          <thead>
            <tr>
              <th className="border border-black px-2 py-2" scope="col">Id</th>
              <th className="border border-black px-2 py-2" scope="col">Actor</th>
              <th className="border border-black px-2 py-2" scope="col">Action</th>
              <th className="border border-black px-2 py-2" scope="col">Plugin</th>
              <th className="border border-black px-2 py-2" scope="col">Tool</th>
              <th className="border border-black px-2 py-2" scope="col">Outcome</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((event) => (
              <tr key={event.audit_id}>
                <td className="border border-black px-2 py-2">{event.audit_id}</td>
                <td className="border border-black px-2 py-2">{event.actor}</td>
                <td className="border border-black px-2 py-2">{event.action}</td>
                <td className="border border-black px-2 py-2">{event.plugin_id}</td>
                <td className="border border-black px-2 py-2">{event.tool_name}</td>
                <td className="border border-black px-2 py-2">{event.outcome}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {events.length === 0 && !loadError ? <p className="mt-3">No audit events are stored for this organization.</p> : null}
    </section>
  );
}
