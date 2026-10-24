import { requestApproval } from "@/lib/backend";
import { failureRedirect, isSession, redirectTo, requireSession } from "@/lib/form";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = requireSession(request);
  if (!isSession(session)) {
    return session;
  }
  const form = await request.formData();
  const pluginId = String(form.get("plugin_id") ?? "");
  const tool = String(form.get("tool") ?? "");
  const returnTo = `/plugins/${encodeURIComponent(pluginId)}`;
  try {
    const result = await requestApproval(session, pluginId, tool, {});
    return redirectTo(request, returnTo, {
      notice: `Approval ${result.approval_id} is ${result.status}. Give this id to a different person in ${session.tenantId}.`,
      approval_id: result.approval_id,
    });
  } catch (error) {
    return failureRedirect(request, returnTo, error);
  }
}
