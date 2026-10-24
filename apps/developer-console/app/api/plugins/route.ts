import { deprecatePlugin, publishPlugin } from "@/lib/backend";
import { failureRedirect, isSession, redirectTo, requireSession } from "@/lib/form";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = requireSession(request);
  if (!isSession(session)) {
    return session;
  }
  const form = await request.formData();
  const action = String(form.get("action") ?? "publish");
  if (action === "deprecate") {
    const pluginId = String(form.get("plugin_id") ?? "");
    try {
      await deprecatePlugin(session, pluginId);
      return redirectTo(request, "/developer", { notice: `${pluginId} is deprecated.` });
    } catch (error) {
      return failureRedirect(request, "/developer", error);
    }
  }
  const raw = String(form.get("manifest") ?? "");
  let manifest: unknown;
  try {
    manifest = JSON.parse(raw);
  } catch {
    return redirectTo(request, "/developer", { error: "Manifest JSON is invalid.", code: "invalid" });
  }
  try {
    const result = (await publishPlugin(session, manifest)) as { plugin_id: string; version: string };
    return redirectTo(request, "/developer", {
      notice: `Published ${result.plugin_id} ${result.version}.`,
    });
  } catch (error) {
    return failureRedirect(request, "/developer", error);
  }
}
