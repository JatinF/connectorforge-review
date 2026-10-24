import { expect, test, type Page } from "@playwright/test";

let approvalId = "";

test.describe.configure({ mode: "serial" });

test("fixture session stays off the browser payload", async ({ page }) => {
  await page.goto("/sign-in");
  const anonymous = await page.request.get("/api/session");
  expect(anonymous.status()).toBe(401);
  await signIn(page, "Continue as Casey");
  const session = await page.request.get("/api/session");
  const body = await session.text();
  expect(body).toContain("SYN-USER-CASEY");
  expect(body).not.toContain("dev-publisher-north");
  expect(body).not.toContain("dev-member");
  await expect(page.getByText("Database sqlite")).toBeVisible();
  await expect(page.getByText("Deployment NO-GO")).toBeVisible();
  await expect(page.getByText("PostgreSQL not-run")).toBeVisible();
});

test("publisher browses, filters, and installs for the organization", async ({ page }) => {
  await signIn(page, "Continue as Casey");
  await expect(page.getByRole("link", { name: "Issue Tracker" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Team Calendar" })).toBeVisible();
  await page.getByLabel("Search").fill("calendar");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(page.getByRole("link", { name: "Team Calendar" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Issue Tracker" })).toHaveCount(0);
  await page.screenshot({ path: "docs/screenshots/marketplace.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("link", { name: "Marketplace" })).toBeVisible();
  await page.screenshot({ path: "docs/screenshots/marketplace-mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/plugins/issue-tracker");
  await page.getByRole("button", { name: "Install read and write access" }).click();
  await expect(page.getByText("Installed. Scopes: tickets.read, tickets.write.")).toBeVisible();
  await page.getByLabel("Write tool").selectOption("create_issue");
  await page.getByRole("button", { name: "Request approval" }).click();
  const idText = await page.getByText(/Approval id SYN-APR-\d+/).innerText();
  approvalId = idText.match(/SYN-APR-\d+/)?.[0] ?? "";
  expect(approvalId).toMatch(/^SYN-APR-\d+$/);
  await page.screenshot({ path: "docs/screenshots/plugin-detail.png", fullPage: true });
});

test("administrator approves another subject and records policy", async ({ page }) => {
  await signIn(page, "Continue as Elen");
  await page.goto("/admin");
  await page.getByLabel("Approval id").fill(approvalId);
  await page.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByText(`${approvalId} is approved.`)).toBeVisible();
  await page.getByLabel("Plugin").selectOption("knowledge-search");
  await page.getByLabel("Permission").selectOption("false");
  await page.getByRole("button", { name: "Save policy" }).click();
  await expect(page.getByText("knowledge-search is blocked for SYN-ORG-NORTH.")).toBeVisible();
  await page.getByLabel("Search audit events").fill("approval_decision");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByRole("cell", { name: "approval_decision" })).toBeVisible();
  await page.screenshot({ path: "docs/screenshots/admin.png", fullPage: true });
  const forged = await page.request.post("/api/allowlist", {
    form: { plugin_id: "issue-tracker", allowed: "true", organization: "SYN-ORG-WEST" },
  });
  expect(forged.ok()).toBeTruthy();
  expect(await forged.text()).toContain("issue-tracker is allowed for SYN-ORG-NORTH.");
  expect(await forged.text()).not.toContain("SYN-ORG-WEST");
});

test("another organization does not inherit the installation", async ({ page }) => {
  await signIn(page, "Continue as Wes");
  await page.goto("/plugins/issue-tracker");
  await expect(page.getByText("Not installed.")).toBeVisible();
  await page.goto("/admin");
  await expect(page.getByText("missing scope audit.read")).toBeVisible();
});

test("member cannot publish and the publisher can", async ({ page }) => {
  await signIn(page, "Continue as Mira", true);
  await page.goto("/developer");
  await page.getByRole("button", { name: "Publish version" }).click();
  await expect(page.getByText("missing scope plugins.publish")).toBeVisible();
  await signIn(page, "Continue as Casey");
  await page.goto("/developer");
  await page.getByRole("button", { name: "Publish version" }).click();
  await expect(page.getByText("Published status-notes 1.0.0.")).toBeVisible();
  await page.getByRole("button", { name: "Publish version" }).click();
  await expect(page.getByText("version already exists")).toBeVisible();
  await page.getByLabel("Manifest JSON").fill("{");
  await page.getByRole("button", { name: "Publish version" }).click();
  await expect(page.getByText("Manifest JSON is invalid.")).toBeVisible();
  await page.getByRole("button", { name: "Save feedback" }).click();
  await expect(
    page.locator("p").filter({ hasText: "The install button label was unclear during onboarding." }),
  ).toBeVisible();
  await page.screenshot({ path: "docs/screenshots/developer.png", fullPage: true });
});

test("self-approval is refused by the API", async ({ page }) => {
  await signIn(page, "Continue as Mira", true);
  await page.goto("/plugins/issue-tracker");
  await page.getByLabel("Write tool").selectOption("create_issue");
  await page.getByRole("button", { name: "Request approval" }).click();
  const idText = await page.getByText(/Approval id SYN-APR-\d+/).innerText();
  const ownId = idText.match(/SYN-APR-\d+/)?.[0] ?? "";
  await signIn(page, "Continue as Mira (self-approval probe)");
  await page.goto("/admin");
  await page.getByLabel("Approval id").fill(ownId);
  await page.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByText("requester cannot approve")).toBeVisible();
});

test("evaluation page shows the recorded offline suite", async ({ page }) => {
  await signIn(page, "Continue as Casey");
  await page.goto("/evaluations");
  await expect(definition(page, "Cases")).toHaveText("189");
  await expect(definition(page, "Passing rows")).toHaveText("189");
  await expect(definition(page, "Unexpected mismatches")).toHaveText("0");
  await expect(page.getByText("33.7375")).toBeVisible();
  await expect(page.getByText("Hosted-model evaluation is not-run.")).toBeVisible();
  await expect(page.getByText("no regression delta")).toBeVisible();
  await page.getByLabel("Kind").selectOption("task");
  await page.getByRole("button", { name: "Filter cases" }).click();
  await expect(page.getByRole("row", { name: /task-list-issues/ })).toBeVisible();
  await page.screenshot({ path: "docs/screenshots/evaluations.png", fullPage: true });
});

function definition(page: Page, term: string) {
  return page.locator("dl > div").filter({ hasText: new RegExp(`^${term}`) }).locator("dd");
}

async function signIn(page: Page, buttonName: string, exactMember = false) {
  await page.goto("/sign-in");
  await page.getByRole("button", { name: buttonName, exact: exactMember || buttonName.includes("probe") }).click();
  await expect(page.getByRole("heading", { name: "Marketplace" })).toBeVisible();
}
