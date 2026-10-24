import { setAllowlist } from "@/lib/backend";
import { failureRedirect, isSession, redirectTo, requireSession } from "@/lib/form";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = requireSession(request);
  if (!isSession(session)) {
    return session;
  }
  const form = await request.formData();
  const pluginId = String(form.get("plugin_id") ?? "");
  const allowed = String(form.get("allowed") ?? "") === "true";
  try {
    const result = await setAllowlist(session, pluginId, allowed);
    return redirectTo(request, "/admin", {
      notice: `${result.plugin_id} is ${result.allowed ? "allowed" : "blocked"} for ${result.organization}.`,
    });
  } catch (error) {
    return failureRedirect(request, "/admin", error);
  }
}
