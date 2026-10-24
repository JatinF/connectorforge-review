import { addFeedback } from "@/lib/backend";
import { failureRedirect, isSession, redirectTo, requireSession } from "@/lib/form";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = requireSession(request);
  if (!isSession(session)) {
    return session;
  }
  const form = await request.formData();
  const kind = String(form.get("kind") ?? "");
  const body = String(form.get("body") ?? "");
  try {
    await addFeedback(session, kind, body);
    return redirectTo(request, "/developer", { notice: "Feedback saved for this organization." });
  } catch (error) {
    return failureRedirect(request, "/developer", error);
  }
}
