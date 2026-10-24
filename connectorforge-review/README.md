# ConnectorForge Review

Skills-only plugin for developers who review MCP tool definitions, design offline agent–tool evaluations, and check a plugin package before directory submission.

Version 0.1.0 does not include an MCP server. It does not connect to ConnectorForge, scan a live service, run hosted-model evaluations, validate authentication, or certify security.

## Skills

- `audit-mcp-tools` reviews tool manifests the user supplies for permission, approval, tenant, and annotation gaps.
- `design-tool-evals` writes offline evaluation cases and metric definitions. It does not report a pass rate unless the user supplies run logs.
- `prepare-plugin-release` checks packaging and listing claims. It does not upload, attest, or publish.

## Listing

Display name: ConnectorForge Review. Category: Developer Tools. Icon: `assets/connectorforge-icon.png` (512×512).

This package omits `review` and `mcp.json` because it contains only skills. It does not include a reviewer account, an OAuth client, a demo video, or website, support, privacy, and terms URLs. Those four URL fields are optional for skills-only package validation. A published directory listing still needs the publisher's verified identity, a published privacy policy, and a support contact.

This folder is the upload draft. It is not a directory listing.

OpenAI guidance: https://developers.openai.com/plugins/deploy/submission
