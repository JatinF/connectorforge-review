export type RawEvalCase = {
  id: string;
  kind: string;
  expected: string;
  actual: string;
  match: boolean;
  latency_ms: number;
  safety: boolean;
  held_out: boolean;
};

export type RawEvalArtifact = {
  evidence: string;
  router: string;
  hosted_model: string;
  case_count: number;
  selection_case_count: number;
  task_case_count: number;
  held_out_case_count: number;
  safety_case_count: number;
  tool_selection_rate: number;
  tool_selection_precision: number;
  held_out_selection_rate: number;
  task_success_rate: number;
  safety_pass_rate: number;
  unexpected_count: number;
  outcome_counts: Record<string, number>;
  failure_categories: Record<string, number>;
  duration_ms: number;
  latency_ms: { p50: number; p95: number; max: number };
  platform: string;
  python: string;
  cases: RawEvalCase[];
};

export type RecordedRun = {
  commit: string;
  label: string;
  source: string;
};

export const RECORDED_RUNS: RecordedRun[] = [
  {
    commit: "c290e9daa9601cdbf07b9ec509d3dd8d136eb868",
    label: "Recorded offline keyword-router run",
    source: "JatinF/connectorforge benchmarks/eval_baseline.json",
  },
];

export function summarizeEval(artifact: RawEvalArtifact) {
  const failing = artifact.cases.filter((item) => !item.match);
  const kindCounts: Record<string, number> = {};
  for (const item of artifact.cases) {
    kindCounts[item.kind] = (kindCounts[item.kind] ?? 0) + 1;
  }
  return {
    artifact,
    kindCounts,
    passingCases: artifact.cases.length - failing.length,
    failingCases: failing.length,
    failing,
    countsAgree: artifact.cases.length === artifact.case_count && failing.length === artifact.unexpected_count,
    regressionDelta: null as null,
    hostedModelRan: artifact.hosted_model !== "not-run",
  };
}

export function filterCases(
  cases: RawEvalCase[],
  filters: { kind?: string; result?: string; q?: string },
): RawEvalCase[] {
  const needle = (filters.q ?? "").trim().toLowerCase();
  return cases.filter((item) => {
    if (filters.kind && filters.kind !== "all" && item.kind !== filters.kind) {
      return false;
    }
    if (filters.result === "pass" && !item.match) {
      return false;
    }
    if (filters.result === "fail" && item.match) {
      return false;
    }
    if (needle && !`${item.id} ${item.expected} ${item.actual}`.toLowerCase().includes(needle)) {
      return false;
    }
    return true;
  });
}
