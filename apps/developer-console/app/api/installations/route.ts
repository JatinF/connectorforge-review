import { installPlugin, uninstallPlugin } from "@/lib/backend";
import { failureRedirect, isSession, redirectTo, requireSession } from "@/lib/form";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = requireSession(request);
  if (!isSession(session)) {
    return session;
  }
  const form = await request.formData();
  const pluginId = String(form.get("plugin_id") ?? "");
  const action = String(form.get("action") ?? "install");
  const returnTo = `/plugins/${encodeURIComponent(pluginId)}`;
  if (!pluginId) {
    return redirectTo(request, "/", { error: "Choose a plugin." });
  }
  try {
    if (action === "uninstall") {
      await uninstallPlugin(session, pluginId);
      return redirectTo(request, returnTo, { notice: "Uninstalled for this organization." });
    }
    const scopeField = String(form.get("scopes") ?? "");
    const scopes = scopeField ? scopeField.split(",").map((item) => item.trim()).filter(Boolean) : null;
    await installPlugin(session, pluginId, scopes);
    return redirectTo(request, returnTo, {
      notice: scopes ? "Installed with the scopes you submitted." : "Installed with the API default read scopes.",
    });
  } catch (error) {
    return failureRedirect(request, returnTo, error);
  }
}
