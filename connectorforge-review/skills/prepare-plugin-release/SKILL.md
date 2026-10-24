---
name: prepare-plugin-release
description: Review a ChatGPT or Codex plugin package for truthful public listing claims, developer documentation, permission disclosure, packaging, and review readiness. Use for private-to-public release planning or package QA.
---

# Prepare an honest plugin release

Review package content that has actually been supplied, never infer a deployed service from source code or a ZIP. Check whether the package is skills-only, remotely hosted MCP, or mixed. A public MCP plugin requires a stable real HTTPS MCP endpoint; a private URL or OAuth stub is not production authentication. Distinguish created, privately installed, draft uploaded, submitted for review, approved, and publicly published.

## Checklist

1. Inventory root `plugin.json`, optional `mcp.json`, skill files and included assets; validate versions and paths against public schema.
2. Verify listing claims against capabilities; note missing authentication, tools, outside users, recovery, or marketplace features without inventing them.
3. Check listing fields: clear display name, subtitle <=30 characters, category from supported list, accurate defaults, actual icon files, verified developer identity.
4. Identify publication dependencies from `references/release-checklist.md`. Skills-only package validation does not require the four listing URL fields. A directory listing still needs a published privacy policy and a support contact. Never accept placeholder URLs.
5. For remote servers: verify stable endpoint, actual auth, meaningful tool schemas and accurate readOnly/openWorld/destructive annotations, test cases, reviewer access, demo recording, and operator reliability. A skills-only plugin does not require MCP tool review cases, a server endpoint, demo, or reviewer credentials.
6. Prepare truthful positive and negative user examples, reviewer notes and release notes. Never claim review results not observed.
7. Separate package readiness from dashboard-level verification and legal attestations. Do not submit or attest on behalf of a publisher without their authorization.

## Output

Return status per item: `Ready`, `Needs work`, `Blocked`, or `Not applicable`, cite concrete file fields/lines when available, and list the next minimum actions. Link official developer documentation when accessible. Handle any credentials privately; do not put them in review examples or public plugin files.

Read `references/release-checklist.md` for exact package data required.
