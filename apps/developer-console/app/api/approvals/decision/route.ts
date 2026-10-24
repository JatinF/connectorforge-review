import { decideApproval } from "@/lib/backend";
import { failureRedirect, isSession, redirectTo, requireSession } from "@/lib/form";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = requireSession(request);
  if (!isSession(session)) {
    return session;
  }
  const form = await request.formData();
  const approvalId = String(form.get("approval_id") ?? "").trim();
  const decision = String(form.get("decision") ?? "");
  if (!approvalId) {
    return redirectTo(request, "/admin", { error: "Enter the approval id returned to the requester." });
  }
  try {
    const result = await decideApproval(session, approvalId, decision);
    return redirectTo(request, "/admin", {
      notice: `${result.approval_id} is ${result.status}.`,
    });
  } catch (error) {
    return failureRedirect(request, "/admin", error);
  }
}
