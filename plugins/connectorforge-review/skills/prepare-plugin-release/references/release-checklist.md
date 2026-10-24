# Plugin release QA

Package: Agent Plugins `plugin.json` with `$schema` `https://agent-plugins.org/schemas/1.0.0/plugin.schema.json`, a semantic version, and skills at `skills/<name>/SKILL.md`. Portable packages discover `skills/` automatically. Do not add `.codex-plugin/plugin.json` when `extensions.com.openai` is present; that file replaces the extension instead of merging with it.

Skills-only: omit `extensions.com.openai.review` and `mcp.json`. Do not set `requires_local_executor`. The ZIP does not need a hosted MCP URL, OAuth client, reviewer test account, or demo video. Adding an MCP server later to a published skills-only plugin is not currently supported, so include MCP in the first ZIP only when the product calls a stable public HTTPS server.

MCP-backed: declare one remote HTTPS streamable HTTP server in the initial ZIP. Initial review then needs five positive cases, three negative cases, a demo recording URL, and reviewer credentials entered in the portal, never in the ZIP.

Listing limits: display name and subtitle at most 30 characters; long description at most 4000; up to three unique starter prompts at most 128 characters each; category from the dashboard list, such as Developer Tools. Square logo and composer icon, at least 48 by 48 pixels, at most 5 MiB. `capabilities` may be `[]` when the plugin has none.

URLs: skills-only metadata validation does not require `websiteURL`, `supportURL`, `privacyPolicyURL`, or `termsOfServiceURL`. MCP review requires all four as live HTTPS URLs for the same publisher. Directory guidelines still require a published privacy policy and a customer support contact before a public listing. Do not invent placeholder domains.

Evidence: list only functions present in the package. Do not fabricate adoption, model accuracy, security certification, or third-party integrations. Label an offline plan separately from a hosted-model run, and source separately from a deployed service.

Stages the publisher completes: upload the draft, finish publisher verification and automated checks, submit for review, then publish after approval. A prepared ZIP is none of those stages.

See https://developers.openai.com/plugins/deploy/submission and https://developers.openai.com/plugins/plugin-guidelines.
