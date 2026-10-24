# ConnectorForge Review

Skills-only plugin marketplace for ChatGPT and Codex. Version 0.1.0 reviews MCP tool definitions you supply, designs offline agent–tool evaluations, and checks plugin package claims. It has no MCP server and does not scan a live service.

## Install from GitHub

In **Add plugin marketplace**:

| Field | Value |
|---|---|
| Source | `JatinF/connectorforge-review` |
| Git ref | `main` |
| Sparse paths | leave empty |

Then install **ConnectorForge Review** from that marketplace.

The catalog is `.agents/plugins/marketplace.json`. The plugin package is `plugins/connectorforge-review/`. Leave Sparse paths empty so that folder is included in the checkout.

This repository is the Git install source. A public directory listing exists only after the package is uploaded, approved, and published.

## Developer console

The Next.js console lives in `apps/developer-console`. It calls the separate ConnectorForge API at https://github.com/JatinF/connectorforge. Setup, screenshots, and limitations are in `apps/developer-console/README.md`.
