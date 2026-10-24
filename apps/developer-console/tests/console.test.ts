import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import artifact from "../evidence/eval_baseline.json";
import { filterCases, summarizeEval, type RawEvalArtifact } from "../lib/eval-report";
import { filterPlugins } from "../lib/filter-plugins";
import { ROLE_CHOICES } from "../lib/roles-public";
import type { CatalogPlugin } from "../lib/types";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("recorded evaluation artifact matches its header", () => {
  const report = summarizeEval(artifact as RawEvalArtifact);
  assert.equal(report.countsAgree, true);
  assert.equal(report.artifact.case_count, 189);
  assert.equal(report.artifact.hosted_model, "not-run");
  assert.equal(report.artifact.duration_ms, 33.7375);
  assert.equal(report.failingCases, 0);
  assert.equal(report.hostedModelRan, false);
  assert.equal(report.regressionDelta, null);
  const text = JSON.stringify(artifact);
  assert.equal(text.includes("SYN-CF-SECRET"), false);
  assert.equal(text.includes("SYN-MARKER-ORG-WEST"), false);
  assert.equal(filterCases(report.artifact.cases, { kind: "task" }).length, report.artifact.task_case_count);
});

test("marketplace filters keep organization results from the API", () => {
  const plugins = [
    plugin("issue-tracker", "Operations", true),
    plugin("team-calendar", "Calendar", false),
  ];
  assert.deepEqual(
    filterPlugins(plugins, { category: "Calendar", installed: "all" }).map((item) => item.plugin_id),
    ["team-calendar"],
  );
  assert.deepEqual(
    filterPlugins(plugins, { installed: "installed" }).map((item) => item.plugin_id),
    ["issue-tracker"],
  );
});

test("public role list and browser source do not contain fixture tokens", () => {
  const publicText = JSON.stringify(ROLE_CHOICES);
  assert.equal(publicText.includes("dev-publisher-north"), false);
  assert.equal(publicText.includes("dev-admin-north"), false);
  const offenders: string[] = [];
  for (const file of walk(path.join(root, "app")).concat(walk(path.join(root, "components")))) {
    const text = readFileSync(file, "utf8");
    if (text.includes("dev-publisher-north") || text.includes("dev-member-north") || text.includes("dev-admin-north") || text.includes("dev-self-north")) {
      offenders.push(path.relative(root, file));
    }
    if (text.includes('"use client"') && (text.includes("@/lib/roles") || text.includes("@/lib/backend") || text.includes("@/lib/session"))) {
      offenders.push(path.relative(root, file));
    }
  }
  assert.deepEqual(offenders, []);
});

function plugin(id: string, category: string, installed: boolean): CatalogPlugin {
  return {
    plugin_id: id,
    name: id,
    summary: "",
    category,
    version: "1.0.0",
    status: "published",
    compatibility: ["mcp"],
    tools: [],
    installed,
    granted_scopes: [],
    publisher_tenant: "SYN-ORG-NORTH",
  };
}

function walk(directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory)) {
    const full = path.join(directory, entry);
    if (statSync(full).isDirectory()) {
      files.push(...walk(full));
    } else if (full.endsWith(".ts") || full.endsWith(".tsx")) {
      files.push(full);
    }
  }
  return files;
}
