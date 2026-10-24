export type ToolSpec = {
  name: string;
  description: string;
  scopes: string[];
  readOnlyHint: boolean;
  destructiveHint?: boolean;
};

export type CatalogPlugin = {
  plugin_id: string;
  name: string;
  summary: string;
  category: string;
  version: string;
  status: string;
  compatibility: string[];
  tools: ToolSpec[];
  installed: boolean;
  granted_scopes: string[];
  publisher_tenant: string;
};

export type Catalog = {
  plugins: CatalogPlugin[];
  count: number;
};

export type AuditEvent = {
  audit_id: number;
  tenant_id: string;
  actor: string;
  action: string;
  plugin_id: string;
  tool_name: string;
  outcome: string;
  detail: string;
};

export type FeedbackItem = {
  feedback_id: number;
  tenant_id: string;
  actor: string;
  kind: string;
  body: string;
};

export type Health = {
  status: string;
  version: string;
  customer_cloud: string;
  database: string;
  deployment_decision: string;
  gates: Record<string, string>;
};

export type SessionProfile = {
  roleId: string;
  subject: string;
  tenantId: string;
  role: string;
  scopes: string[];
};

export type ApiFailure = {
  status: number;
  code: string;
  message: string;
};
