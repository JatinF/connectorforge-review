import { redirect } from "next/navigation";

import artifactJson from "@/evidence/eval_baseline.json";
import { filterCases, RECORDED_RUNS, summarizeEval, type RawEvalArtifact } from "@/lib/eval-report";
import { readSession } from "@/lib/session";

const PAGE_SIZE = 40;

export default function EvaluationsPage({
  searchParams,
}: {
  searchParams: { kind?: string; result?: string; q?: string; page?: string };
}) {
  const session = readSession();
  if (!session) {
    redirect("/sign-in");
  }
  const report = summarizeEval(artifactJson as RawEvalArtifact);
  const artifact = report.artifact;
  const filtered = filterCases(artifact.cases, searchParams);
  const page = Math.max(1, Number(searchParams.page ?? "1") || 1);
  const start = (page - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  return (
    <section>
      <h1 className="text-3xl font-semibold">Evaluation dashboard</h1>
      <p className="mt-3 max-w-3xl">
        These figures are the recorded offline keyword-router suite. Hosted-model evaluation is {artifact.hosted_model}.
        A matching case means the router produced the labeled outcome. Expected denials and approval stops are passing
        cases in that suite, not production incidents.
      </p>
      {!report.countsAgree ? (
        <p role="alert" className="mt-4 border border-black p-4">
          The artifact header does not match the case rows. Treat the file as inconsistent evidence.
        </p>
      ) : null}
      <dl className="mt-6 grid gap-3 border border-black p-4 sm:grid-cols-3">
        <div>
          <dt className="font-semibold">Cases</dt>
          <dd>{artifact.case_count}</dd>
        </div>
        <div>
          <dt className="font-semibold">Passing rows</dt>
          <dd>{report.passingCases}</dd>
        </div>
        <div>
          <dt className="font-semibold">Unexpected mismatches</dt>
          <dd>{report.failingCases}</dd>
        </div>
        <div>
          <dt className="font-semibold">Selection rate</dt>
          <dd>{artifact.tool_selection_rate}</dd>
        </div>
        <div>
          <dt className="font-semibold">Selection precision</dt>
          <dd>{artifact.tool_selection_precision}</dd>
        </div>
        <div>
          <dt className="font-semibold">Task success</dt>
          <dd>{artifact.task_success_rate}</dd>
        </div>
        <div>
          <dt className="font-semibold">Safety pass</dt>
          <dd>{artifact.safety_pass_rate}</dd>
        </div>
        <div>
          <dt className="font-semibold">Duration ms</dt>
          <dd>{artifact.duration_ms}</dd>
        </div>
        <div>
          <dt className="font-semibold">Latency p50 / p95 / max</dt>
          <dd>
            {artifact.latency_ms.p50} / {artifact.latency_ms.p95} / {artifact.latency_ms.max}
          </dd>
        </div>
      </dl>
      <h2 className="mt-8 text-2xl font-semibold">Recorded runs</h2>
      <p className="mt-2 text-sm">One artifact is stored. There is no earlier run here, so no regression delta is shown.</p>
      <ul className="mt-3">
        {RECORDED_RUNS.map((run) => (
          <li key={run.commit} className="border border-black p-3">
            {run.label}. {run.source}. Commit {run.commit}. Router {artifact.router}. Platform {artifact.platform}. Python {artifact.python}.
          </li>
        ))}
      </ul>
      <h2 className="mt-8 text-2xl font-semibold">Expected task outcomes</h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {Object.entries(artifact.outcome_counts).map(([name, count]) => (
          <li key={name} className="border border-black px-3 py-2 text-sm">
            {name}: {count}
          </li>
        ))}
      </ul>
      <h2 className="mt-8 text-2xl font-semibold">Case rows</h2>
      <form className="mt-3 grid gap-3 border border-black p-4 md:grid-cols-4" method="get">
        <div>
          <label className="block text-sm font-semibold" htmlFor="kind">Kind</label>
          <select className="mt-1 w-full border border-black px-2 py-2" defaultValue={searchParams.kind ?? "all"} id="kind" name="kind">
            <option value="all">All</option>
            {Object.keys(report.kindCounts).map((kind) => (
              <option key={kind} value={kind}>
                {kind} ({report.kindCounts[kind]})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold" htmlFor="result">Result</label>
          <select className="mt-1 w-full border border-black px-2 py-2" defaultValue={searchParams.result ?? "all"} id="result" name="result">
            <option value="all">All</option>
            <option value="pass">Match</option>
            <option value="fail">Mismatch</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold" htmlFor="case_q">Case id</label>
          <input className="mt-1 w-full border border-black px-2 py-2" defaultValue={searchParams.q ?? ""} id="case_q" name="q" type="search" />
        </div>
        <div className="flex items-end">
          <button className="border border-black px-3 py-2" type="submit">Filter cases</button>
        </div>
      </form>
      <p className="mt-3 text-sm">
        Showing {rows.length} of {filtered.length}. Page {page} of {pages}.
      </p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse border border-black text-left text-sm">
          <thead>
            <tr>
              <th className="border border-black px-2 py-2" scope="col">Id</th>
              <th className="border border-black px-2 py-2" scope="col">Kind</th>
              <th className="border border-black px-2 py-2" scope="col">Expected</th>
              <th className="border border-black px-2 py-2" scope="col">Actual</th>
              <th className="border border-black px-2 py-2" scope="col">Match</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id}>
                <th className="border border-black px-2 py-2 font-medium" scope="row">{item.id}</th>
                <td className="border border-black px-2 py-2">{item.kind}</td>
                <td className="border border-black px-2 py-2">{item.expected}</td>
                <td className="border border-black px-2 py-2">{item.actual}</td>
                <td className="border border-black px-2 py-2">{item.match ? "Match" : "Mismatch"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
