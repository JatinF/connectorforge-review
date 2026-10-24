# ConnectorForge Review

Skills-only plugin marketplace for ChatGPT and Codex. Version 0.1.0 reviews MCP tool definitions you supply, designs offline agent–tool evaluations, and checks plugin package claims. It has no MCP server and does not scan a live service.

## Install from GitHub

In **Add plugin marketplace**:

| Field | Value |
|---|---|
| Source | `JatinF/connectorforge-review` |
| Git ref | `main` |
| Sparse paths | leave empty |

Then install **ConnectorForge Review** from that marketplace. Git ref `v0.1.0` selects the published release. Git ref `main` follows later commits.

The catalog is `.agents/plugins/marketplace.json`. The plugin package is `plugins/connectorforge-review/`. Leave Sparse paths empty so that folder is included in the checkout.

The skills-only package is also attached to the public release [v0.1.0](https://github.com/JatinF/connectorforge-review/releases/tag/v0.1.0). `plugin.json` is at the root of `connectorforge-review-v0.1.0.zip`. Its sha256 is `8306be3e4206b8b23f5c0b16ca366c670d3331cd72f938aaea50aff5fb626ed8`.

This repository and that release are the public distribution channel. A directory listing exists only after the package is uploaded, approved, and published. Installs and feedback from developers outside this project are not recorded here.

A connector change is reviewed in https://github.com/JatinF/connectorforge. This skills repository does not load connector code. No outside connector pull request is open.

## Developer console

The Next.js console lives in `apps/developer-console`. It calls the separate ConnectorForge API at https://github.com/JatinF/connectorforge. Setup, screenshots, and limitations are in `apps/developer-console/README.md`.
