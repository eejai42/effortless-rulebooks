import { useState } from "react";
import { Link } from "react-router-dom";
import { fetchRows, num, runConformance } from "../api.js";
import { useTables } from "../hooks.js";
import { Async, Panel, Pill, DataTable, Stat } from "../components.jsx";

// Cross-substrate conformance harness results as first-class rows — the promoted
// destination for LegacyRunnerCapabilities row cap-conformance-harness. The harness
// itself (rulebook-examples/legacy-runner/orchestration/test-orchestrator.py) still
// does the work; this page only reads ConformanceRuns/ConformanceResults through
// the generated views and can trigger scripts/run-conformance.py for a new run.
export function Conformance() {
  const [slug, setSlug] = useState("");
  const [version, setVersion] = useState(0);
  const [running, setRunning] = useState(null); // { error? }

  const state = useTables(["RulebookDomains", "ConformanceRuns", "ConformanceResults"], async () => {
    const [domains, runs, results] = await Promise.all([
      fetchRows("RulebookDomains"),
      fetchRows("ConformanceRuns"),
      fetchRows("ConformanceResults"),
    ]);
    return {
      domains: [...domains].sort((a, b) => a.slug.localeCompare(b.slug)),
      runs: [...runs].sort((a, b) => new Date(b.ran_on) - new Date(a.ran_on)),
      results,
    };
  }, version);

  async function trigger(targetSlug) {
    setRunning({ slug: targetSlug });
    try {
      await runConformance(targetSlug);
      setRunning(null);
      setVersion((v) => v + 1); // re-read every derived score from the views
    } catch (error) {
      setRunning({ slug: targetSlug, error: error.message });
    }
  }

  return (
    <Async state={state} what="conformance">
      {({ domains, runs, results }) => {
        const activeSlug = slug || domains[0]?.slug || "";
        const activeDomain = domains.find((d) => d.slug === activeSlug);
        const domainRuns = activeDomain ? runs.filter((r) => r.domain === activeDomain.domain_id) : [];
        const latestRun = domainRuns[0];
        const latestResults = latestRun ? results.filter((r) => r.run === latestRun.conformance_run_id).sort((a, b) => a.substrate_name.localeCompare(b.substrate_name)) : [];
        const busy = running && running.slug === activeSlug && !running.error;

        return (
          <>
            <section className="hero compact">
              <p className="eyebrow">Health · conformance</p>
              <h1>Every substrate graded against the same rulebook</h1>
              <p className="summary">
                The cross-substrate conformance harness runs each project's execution substrates against answer keys
                generated straight from its rulebook, then records one ConformanceRuns row per invocation and one
                ConformanceResults row per substrate. Scores, pass counts and status are rulebook formulas read from
                the views — nothing here is recomputed client-side. The runner keeps the harness itself and its
                markdown report as the legacy view.
              </p>
              <nav className="subnav">
                <Link to="/consistency">Consistency</Link>
                <Link to="/progress">Progress</Link>
                <Link className="active" to="/conformance">Conformance</Link>
              </nav>
            </section>

            <Panel
              eyebrow="Project"
              title="Pick a project"
              actions={
                <div className="filters">
                  <label>
                    Project{" "}
                    <select value={activeSlug} onChange={(e) => setSlug(e.target.value)}>
                      {domains.map((d) => (
                        <option key={d.domain_id} value={d.slug}>{d.slug}</option>
                      ))}
                    </select>
                  </label>
                  <button className="chip" disabled={Boolean(running && !running.error)} onClick={() => trigger(activeSlug)}>
                    {busy ? "running…" : "Run conformance"}
                  </button>
                  {running && running.slug === activeSlug && running.error && (
                    <span className="error-inline">{running.error}</span>
                  )}
                </div>
              }
            >
              <p className="muted">
                Runs <code>scripts/run-conformance.py {activeSlug}</code> against{" "}
                <code>{activeDomain?.relative_path}</code>: invokes the existing harness, reads its{" "}
                <code>testing/_substrate_results.json</code>, records the rows below, then runs{" "}
                <code>effortless build</code> so the views pick them up. This can take a while — the harness runs
                every registered substrate.
              </p>
            </Panel>

            {!latestRun && (
              <Panel eyebrow="Latest run" title="No conformance runs recorded yet">
                <p className="muted">Click "Run conformance" above to record the first run for this project.</p>
              </Panel>
            )}

            {latestRun && (
              <>
                <div className="stats">
                  <Stat label="Latest run" value={new Date(latestRun.ran_on).toLocaleString()} />
                  <Stat label="Substrates" value={latestRun.total_substrates} />
                  <Stat label="Passing" value={`${latestRun.passing_substrate_count} / ${latestRun.total_substrates}`} />
                  <Stat label="Overall score" value={`${Math.round(num(latestRun.overall_score) ?? 0)}%`} />
                  <Stat label="Status" value={<Pill value={latestRun.overall_status} tone={latestRun.overall_status === "all-passing" ? "good" : "warn"} />} />
                </div>

                <Panel eyebrow="Latest run" title="Pass / fail matrix">
                  <DataTable
                    rows={latestResults}
                    rowKey="conformance_result_id"
                    columns={[
                      { key: "substrate_name", label: "Substrate", render: (r) => <code>{r.substrate_name}</code> },
                      { key: "status", label: "Status", render: (r) => <Pill value={r.status} /> },
                      { key: "score", label: "Score", render: (r) => `${Math.round(num(r.score) ?? 0)}%` },
                      { key: "fields_tested", label: "Fields", render: (r) => `${r.fields_passed ?? "—"} / ${r.fields_tested ?? "—"}` },
                      { key: "duration_seconds", label: "Duration", render: (r) => (r.duration_seconds != null ? `${Number(r.duration_seconds).toFixed(1)}s` : "—") },
                      { key: "is_passing", label: "Passing", render: (r) => <Pill value={r.is_passing} /> },
                    ]}
                  />
                </Panel>
              </>
            )}

            <Panel eyebrow="History" title="Runs for this project">
              <DataTable
                rows={domainRuns}
                rowKey="conformance_run_id"
                empty="No runs recorded for this project yet."
                columns={[
                  { key: "ran_on", label: "Ran on", render: (r) => new Date(r.ran_on).toLocaleString() },
                  { key: "total_substrates", label: "Substrates" },
                  { key: "passing_substrate_count", label: "Passing", render: (r) => `${r.passing_substrate_count} / ${r.total_substrates}` },
                  { key: "overall_score", label: "Score", render: (r) => `${Math.round(num(r.overall_score) ?? 0)}%` },
                  { key: "overall_status", label: "Status", render: (r) => <Pill value={r.overall_status} tone={r.overall_status === "all-passing" ? "good" : "warn"} /> },
                ]}
              />
            </Panel>
          </>
        );
      }}
    </Async>
  );
}
