---
name: design-tool-evals
description: Design reproducible offline evaluations for MCP plugin tool-selection, argument formation, authorization, approval, failure recovery, and agent task completion. Use when a developer requests eval cases, scorecards, test scenarios, or regression gates.
---

# Design model–tool and execution evaluations

Create an executable-oriented test specification from the user's actual tool inventory. You may generate JSONL or Python test sketches if requested, but do not state tests ran unless tool output or user-provided logs substantiate that claim. Distinguish an offline deterministic rule harness from live-model evaluation.

## Workflow

1. Inspect the actual tool names, JSON schemas, authorization descriptions, and read/write effects. Ask for missing details only when essential; otherwise produce examples clearly labeled as assumed.
2. Define outcome measures separately: (a) correct tool selection/abstention; (b) argument validity; (c) permission/approval enforcement; (d) execution correctness; (e) end-to-end task completion; (f) resilience and recoverability. Don't conflate tool routing accuracy with response hallucination rates.
3. Build a balanced set: positive paths, ambiguous intent, wrong-tool decoys, no-tool-needed questions, invalid arguments, access denied, cross-tenant attempts, prompt injection in tool output, write approvals, duplicate retries, dependency timeout, partial outage, and recovery after failure where supported.
4. For each case provide ID, natural-language user request, preconditions/fixtures, expected tool or abstention, expected important arguments, expected authorization decision, and observable pass condition. Use synthetic data; do not request real credentials or PHI.
5. Mark automated vs manual expectations, offline vs hosted-model outcomes, and which metrics cannot be computed without recorded runs. Propose CI gates based on an actual baseline and avoid invented pass rates.
6. Generate optional JSONL or CSV test fixture structure if requested, with stable case IDs and safe synthetic values.

## Output

- Evaluation plan: tool inventory, version and evaluation scope.
- Case matrix grouped by behavior class.
- Metrics table defining denominator/numerator and how to capture it.
- Failure taxonomy and regression workflow.
- Known limitations and data not actually tested.

For sample fixtures and metric definitions read `references/eval-template.md`.
