# Control rubric and evidence levels

| Control | Evidence to look for | Blocking test |
|---|---|---|
| Tool contract | Clear operation, typed schema, required fields, no arbitrary execution parameters | Malformed argument rejected |
| Read/write annotation | Accurate `readOnlyHint`, `openWorldHint`, `destructiveHint` | Metadata and actual effects agree |
| Identity | Server verifies authenticated principal | No token is denied |
| Tenant scope | Server filters tenant from trusted auth context, not client-controlled org_id | Org A cannot read/write Org B |
| Least privilege | Tool requires minimal read/write scope | Read token denied write |
| High-risk approval | Server verifies non-model, fresh, action-bound approval | Missing, expired, wrong approver blocked |
| Injection | Retrieved tool output treated as data | Embedded 'ignore instructions' has no authority |
| Robustness | Timeouts, safe retries, idempotency, bounded pagination | Duplicate request no duplicate write |
| Observability | Log actor, tool, tenant, operation result; redact sensitive fields | Query correlation ID finds audit event |

Evidence levels: (A) tested deployed behavior; (B) test/code evidence supplied; (C) architecture description; (D) assertion only. Report each accurately. A static manifest audit cannot confirm A.

Example finding:
**High — tenant identifier accepted from untrusted arguments.** Evidence: `org_id` is a user-supplied tool field and no server-side principal/tenant check is documented. Risk: cross-tenant access. Fix: derive tenant from validated credential claims and verify target ownership. Test: an Org A credential requesting an Org B record must fail with no data disclosed.
