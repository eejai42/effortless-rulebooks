import { useState } from "react";
import { Link } from "react-router-dom";
import { fetchRows, fetchOne, num, setFindingStatus } from "../api.js";
import { useTables } from "../hooks.js";
import { Async, Panel, Pill, DataTable, Progress, Stat, ExternalLink } from "../components.jsx";

export function Consistency() {
  const [statusFilter, setStatusFilter] = useState("open");
  const [ruleFilter, setRuleFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [version, setVersion] = useState(0);
  const [closing, setClosing] = useState(null); // { id, error? }
  const state = useTables(["ConsistencyRules", "ConsistencyFindings", "RulebookDomains", "ProjectMetadata"], async () => {
    const [rules, findings, domains, meta] = await Promise.all([
      fetchRows("ConsistencyRules"),
      fetchRows("ConsistencyFindings"),
      fetchRows("RulebookDomains"),
      fetchOne("ProjectMetadata", "project_id", "erb-001"),
    ]);
    const slugByDomain = Object.fromEntries(domains.map((d) => [d.domain_id, d.slug]));
    return {
      rules: [...rules].sort((a, b) => Number(Boolean(b.is_sweep_priority)) - Number(Boolean(a.is_sweep_priority)) || num(b.open_finding_count) - num(a.open_finding_count)),
      findings,
      domains: [...domains].sort((a, b) => num(b.open_finding_count) - num(a.open_finding_count) || a.slug.localeCompare(b.slug)),
      slugByDomain,
      meta,
    };
  }, version);

  async function close(id, status) {
    setClosing({ id });
    try {
      await setFindingStatus(id, status);
      setClosing(null);
      setVersion((v) => v + 1); // re-read every derived score from the views
    } catch (error) {
      setClosing({ id, error: error.message });
    }
  }

  return (
    <Async state={state} what="consistency">
      {({ rules, findings, domains, slugByDomain, meta }) => {
        const statuses = [...new Set(findings.map((f) => f.status))].sort();
        const visible = findings
          .filter((f) => (statusFilter === "all" ? true : f.status === statusFilter))
          .filter((f) => (ruleFilter ? f.rule_code === ruleFilter : true))
          .filter((f) => (projectFilter ? f.domain === projectFilter : true))
          .sort((a, b) => String(a.priority).localeCompare(String(b.priority)) || a.consistency_finding_id.localeCompare(b.consistency_finding_id));
        return (
          <>
            <section className="hero compact">
              <p className="eyebrow">Health · consistency</p>
              <h1>Consistency is pruned by working findings to zero</h1>
              <p className="summary">
                Rules compare the canonical shape with what the filesystem scan witnessed. Every violation is a finding
                row; fixed findings keep their history. Priority, sole-blocker and last-mile flags are rulebook formulas.
                Closing a finding here writes its status into the rulebook and the base table; scanner-derived findings
                close only by re-running the scan.
              </p>
              <nav className="subnav">
                <Link className="active" to="/consistency">Consistency</Link>
                <Link to="/progress">Progress</Link>
              </nav>
            </section>

            <div className="stats">
              <Stat label="Open findings" value={meta.open_finding_total} />
              <Stat label="Rules satisfied" value={`${meta.satisfied_rule_count} / ${meta.consistency_rule_count}`} />
              <Stat label="Clean projects" value={`${meta.clean_domain_count} / ${meta.domain_count}`} />
              <Stat label="Repository consistent" value={<Pill value={meta.is_repo_consistent} tone={meta.is_repo_consistent ? "good" : "warn"} />} />
            </div>

            <Panel eyebrow="Rules" title="Consistency rules">
              <DataTable
                rows={rules}
                rowKey="consistency_rule_id"
                columns={[
                  { key: "rule_code", label: "Code", render: (r) => <button className="linkbtn" onClick={() => setRuleFilter(ruleFilter === r.rule_code ? "" : r.rule_code)}><code>{r.rule_code}</code></button> },
                  { key: "statement", label: "Rule" },
                  { key: "severity", label: "Severity", render: (r) => <Pill value={r.severity} /> },
                  { key: "open_finding_count", label: "Open", render: (r) => <Pill value={r.open_finding_count} tone={num(r.open_finding_count) ? "warn" : "good"} /> },
                  { key: "resolution_percent", label: "Resolved", render: (r) => <><Progress percent={r.resolution_percent} /> {Math.round(num(r.resolution_percent) ?? 0)}%</> },
                  { key: "rule_state", label: "State", render: (r) => <Pill value={r.rule_state} /> },
                  { key: "is_sweep_priority", label: "Sweep", render: (r) => (r.is_sweep_priority ? <Pill value="priority" tone="bad" /> : "—") },
                ]}
              />
            </Panel>

            <Panel eyebrow="Per project" title="Open findings by project">
              <div className="chips">
                {domains
                  .filter((d) => num(d.open_finding_count) > 0)
                  .map((d) => (
                    <button key={d.domain_id} className={`chip${projectFilter === d.domain_id ? " active" : ""}`} onClick={() => setProjectFilter(projectFilter === d.domain_id ? "" : d.domain_id)}>
                      {d.slug} <strong>{d.open_finding_count}</strong>
                    </button>
                  ))}
              </div>
            </Panel>

            <Panel
              eyebrow="Work queue"
              title="Findings"
              actions={
                <div className="filters">
                  <label>
                    Status{" "}
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                      <option value="all">all</option>
                      {statuses.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Project{" "}
                    <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
                      <option value="">all</option>
                      {[...domains].sort((a, b) => a.slug.localeCompare(b.slug)).map((d) => (
                        <option key={d.domain_id} value={d.domain_id}>{d.slug}</option>
                      ))}
                    </select>
                  </label>
                  {ruleFilter && (
                    <button className="linkbtn" onClick={() => setRuleFilter("")}>
                      clear rule filter <code>{ruleFilter}</code>
                    </button>
                  )}
                </div>
              }
            >
              <DataTable
                rows={visible}
                rowKey="consistency_finding_id"
                empty="No findings match the current filter."
                columns={[
                  { key: "priority", label: "Priority", render: (f) => <Pill value={f.priority} /> },
                  { key: "rule_code", label: "Rule", render: (f) => <code>{f.rule_code}</code> },
                  { key: "domain", label: "Project", render: (f) => (f.domain && slugByDomain[f.domain] ? <Link to={`/projects/${slugByDomain[f.domain]}`}>{slugByDomain[f.domain]}</Link> : <span className="muted">{f.is_repo_scope ? "repository" : "—"}</span>) },
                  { key: "detail", label: "Detail" },
                  { key: "status", label: "Status", render: (f) => <Pill value={f.status} /> },
                  { key: "flags", label: "Flags", render: (f) => <>{f.is_sole_blocker && <Pill value="sole blocker" tone="bad" />} {f.is_last_mile && <Pill value="last mile" tone="info" />}</> },
                  {
                    key: "action",
                    label: "Close",
                    render: (f) => {
                      if (!f.is_open) return <span className="muted">—</span>;
                      if (!f.is_hand_closable) return <span className="muted">re-run <code>scripts/scan-project-slots.py</code></span>;
                      const busy = closing && closing.id === f.consistency_finding_id;
                      return (
                        <span className="actions">
                          <button className="chip" disabled={Boolean(closing)} onClick={() => close(f.consistency_finding_id, "fixed")}>{busy && !closing.error ? "closing…" : "mark fixed"}</button>{" "}
                          <button className="chip" disabled={Boolean(closing)} onClick={() => close(f.consistency_finding_id, "accepted-exception")}>accept exception</button>
                          {busy && closing.error && <span className="error-inline">{closing.error}</span>}
                        </span>
                      );
                    },
                  },
                ]}
              />
            </Panel>
          </>
        );
      }}
    </Async>
  );
}

export function ProgressPage() {
  const state = useTables(["BuildPhases", "ERBPackages", "ERBFeatures", "UserStories", "AcceptanceCriteria", "ProjectMetadata", "LegacyRunnerCapabilities"], async () => {
    const [phases, packages, features, stories, criteria, meta, capabilities] = await Promise.all([
      fetchRows("BuildPhases"),
      fetchRows("ERBPackages"),
      fetchRows("ERBFeatures"),
      fetchRows("UserStories"),
      fetchRows("AcceptanceCriteria"),
      fetchOne("ProjectMetadata", "project_id", "erb-001"),
      fetchRows("LegacyRunnerCapabilities"),
    ]);
    return {
      capabilities: [...capabilities].sort((a, b) => a.decision.localeCompare(b.decision) || a.title.localeCompare(b.title)),
      phases: [...phases].sort((a, b) => num(a.phase_number) - num(b.phase_number)),
      packages: [...packages].sort((a, b) => num(a.sort_order) - num(b.sort_order)),
      features,
      stories: [...stories].sort((a, b) => a.user_story_id.localeCompare(b.user_story_id)),
      criteria,
      meta,
    };
  });

  return (
    <Async state={state} what="progress">
      {({ phases, packages, features, stories, criteria, meta, capabilities }) => (
        <>
          <section className="hero compact">
            <p className="eyebrow">Health · progress</p>
            <h1>The delivery programme</h1>
            <p className="summary">
              Phases, packages, features, stories and acceptance criteria are rows; done percentages, drift and
              progress state are formulas. The generated progress report is built from the same rows.
            </p>
            <nav className="subnav">
              <Link to="/consistency">Consistency</Link>
              <Link className="active" to="/progress">Progress</Link>
            </nav>
          </section>

          <div className="stats">
            <Stat label="Programme progress" value={`${Math.round(num(meta.programme_progress_percent) ?? 0)}%`} />
            <Stat label="Stories done" value={`${meta.done_story_total} / ${meta.story_total}`} />
            <Stat label="Phases" value={meta.phase_count} />
            <Stat label="Generated report" value={<ExternalLink href="/generated/progress-report/progress-report.html">open</ExternalLink>} hint="written by rulebook-to-progress-report" />
          </div>

          <Panel eyebrow="Phases" title="Build phases">
            <DataTable
              rows={phases}
              rowKey="build_phase_id"
              columns={[
                { key: "phase_number", label: "#", width: "3rem" },
                { key: "title", label: "Phase" },
                { key: "summary", label: "Summary" },
                { key: "phase_state", label: "State", render: (r) => <Pill value={r.phase_state} /> },
                { key: "story_count", label: "Stories" },
                { key: "weighted_done_percent", label: "Weighted done", render: (r) => <><Progress percent={r.weighted_done_percent} /> {Math.round(num(r.weighted_done_percent) ?? 0)}%</> },
              ]}
            />
          </Panel>

          <Panel eyebrow="Packages" title="Delivery packages">
            <DataTable
              rows={packages}
              rowKey="erb_package_id"
              columns={[
                { key: "title", label: "Package" },
                { key: "phase_title", label: "Phase" },
                { key: "feature_count", label: "Features" },
                { key: "story_count", label: "Stories" },
                { key: "done_percent", label: "Done", render: (r) => <><Progress percent={r.done_percent} /> {Math.round(num(r.done_percent) ?? 0)}%</> },
                { key: "package_state", label: "State", render: (r) => <Pill value={r.package_state} /> },
              ]}
            />
          </Panel>

          <Panel eyebrow="Legacy runner" title="Succession ledger">
            <p className="muted">
              The orchestrator, transpiler bus, execution substrates, and conformance harness were briefly staged at
              <code> rulebook-examples/legacy-runner/</code> (2026-08-30 to 2026-09-07) before that demotion was
              reversed — they are root infrastructure again. This ledger records the capability-by-capability
              decision: restored to root, or (the admin portal only) retired outright.
            </p>
            <div className="stats">
              <Stat label="Capabilities" value={meta.runner_capability_count} />
              <Stat label="Decided" value={`${meta.decided_capability_count} / ${meta.runner_capability_count}`} />
              <Stat label="Successor wired" value={`${meta.resolved_capability_count} / ${meta.runner_capability_count}`} />
              <Stat label="Succession complete" value={<Pill value={meta.is_runner_succession_complete} tone={meta.is_runner_succession_complete ? "good" : "info"} />} />
            </div>
            <DataTable
              rows={capabilities}
              rowKey="legacy_runner_capability_id"
              columns={[
                { key: "title", label: "Capability", render: (c) => <><strong>{c.title}</strong><br /><span className="muted"><code>{c.runner_path}</code></span></> },
                { key: "decision", label: "Decision", render: (c) => <Pill value={c.decision} tone={{ promote: "good", separate: "info", replace: "neutral", retire: "warn" }[c.decision]} /> },
                { key: "destination", label: "Successor" },
                { key: "capability_state", label: "State", render: (c) => <Pill value={c.capability_state} tone={c.capability_state === "resolved" ? "good" : c.capability_state === "decided" ? "info" : "bad"} /> },
                { key: "dependents", label: "Dependents" },
              ]}
            />
          </Panel>

          {packages.map((pkg) => {
            const pkgFeatures = features.filter((f) => f.erb_package === pkg.erb_package_id);
            if (!pkgFeatures.length) return null;
            return (
              <Panel key={pkg.erb_package_id} eyebrow={pkg.title} title="Features and stories">
                {pkgFeatures.map((feature) => {
                  const featureStories = stories.filter((s) => s.feature === feature.erb_feature_id);
                  return (
                    <details key={feature.erb_feature_id} className="feature">
                      <summary>
                        <strong>{feature.title}</strong> <Pill value={feature.feature_state} /> <span className="muted">{feature.story_count} stories · {Math.round(num(feature.done_percent) ?? 0)}% done</span>
                      </summary>
                      <p className="muted">{feature.summary}</p>
                      <DataTable
                        rows={featureStories}
                        rowKey="user_story_id"
                        empty="No stories under this feature."
                        columns={[
                          { key: "req_id", label: "Story", render: (s) => <code>{s.req_id}</code> },
                          { key: "story_text", label: "Text" },
                          { key: "status", label: "Status", render: (s) => <Pill value={s.status} /> },
                          { key: "progress_state", label: "Progress", render: (s) => <Pill value={s.progress_state} /> },
                          { key: "criteria", label: "Criteria", render: (s) => <CriteriaList criteria={criteria.filter((c) => c.user_story === s.user_story_id)} /> },
                          { key: "has_status_drift", label: "Drift", render: (s) => (s.has_status_drift ? <Pill value="drift" tone="warn" /> : "—") },
                        ]}
                      />
                    </details>
                  );
                })}
              </Panel>
            );
          })}
        </>
      )}
    </Async>
  );
}

function CriteriaList({ criteria }) {
  if (!criteria.length) return <span className="muted">none</span>;
  return (
    <ul className="criteria">
      {criteria.map((c) => (
        <li key={c.acceptance_criterion_id}>
          <Pill value={c.criterion_state} tone={c.is_met ? "good" : "neutral"} /> {c.criterion}
        </li>
      ))}
    </ul>
  );
}
