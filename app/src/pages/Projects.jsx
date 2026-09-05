import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchRows, fetchOne, probe, num } from "../api.js";
import { useTables } from "../hooks.js";
import { Async, Panel, Pill, DataTable, Definition, Progress, ExternalLink, Stat } from "../components.jsx";

const MODES = {
  all: {
    title: "All governed projects",
    eyebrow: "Projects",
    blurb: "Every project row in RulebookDomains, including the root and the retiring legacy runner. Readiness, area mismatch and coverage are derived columns.",
    keep: () => true,
  },
  toys: {
    title: "Toys",
    eyebrow: "Projects · toys",
    blurb: "Projects whose derived readiness state is toy: they implement a piece of the puzzle on purpose and are graded against the toy slot set.",
    keep: (d) => d.readiness_state === "toy",
  },
  examples: {
    title: "Fully implemented examples",
    eyebrow: "Projects · examples",
    blurb: "Projects whose derived readiness state is example-ready: every required slot for a fully implemented example is witnessed.",
    keep: (d) => d.readiness_state === "example-ready",
  },
};

export function Projects({ mode = "all" }) {
  const cfg = MODES[mode];
  const state = useTables(["RulebookDomains", "ProjectLaunchProfiles", "ProjectMetadata"], async () => {
    const [domains, profiles, meta] = await Promise.all([
      fetchRows("RulebookDomains"),
      fetchRows("ProjectLaunchProfiles"),
      fetchOne("ProjectMetadata", "project_id", "erb-001"),
    ]);
    const profileByDomain = Object.fromEntries(profiles.map((p) => [p.domain, p]));
    return { domains: [...domains].sort((a, b) => a.slug.localeCompare(b.slug)), profileByDomain, meta };
  });

  return (
    <Async state={state} what="projects">
      {({ domains, profileByDomain, meta }) => (
        <>
          <section className="hero compact">
            <p className="eyebrow">{cfg.eyebrow}</p>
            <h1>{cfg.title}</h1>
            <p className="summary">{cfg.blurb}</p>
            <nav className="subnav">
              <Link className={mode === "all" ? "active" : ""} to="/projects">All</Link>
              <Link className={mode === "examples" ? "active" : ""} to="/examples">Examples</Link>
              <Link className={mode === "toys" ? "active" : ""} to="/toys">Toys</Link>
            </nav>
          </section>

          {mode === "all" && (
            <div className="stats">
              <Stat label="Governed projects" value={meta.domain_count} />
              <Stat label="Fully implemented" value={meta.fully_implemented_count} />
              <Stat label="Flagged toys" value={meta.toy_domain_count} hint="IsToy flag on the row" />
              <Stat label="Clean projects" value={meta.clean_domain_count} hint="no open findings" />
              <Stat label="Consistency" value={`${Math.round(num(meta.consistency_percent) ?? 0)}%`} />
            </div>
          )}

          <Panel>
            <DataTable
              rows={domains.filter(cfg.keep)}
              rowKey="domain_id"
              empty="No project currently has this derived readiness state."
              columns={[
                { key: "slug", label: "Project", render: (d) => <Link to={`/projects/${d.slug}`}><strong>{d.slug}</strong></Link> },
                { key: "purpose", label: "Purpose", render: (d) => <span className="clamp">{d.purpose}</span> },
                { key: "area", label: "Area", render: (d) => <><code>{d.area}</code>{d.is_misfiled && <> <Pill value="misfiled" tone="warn" /></>}</> },
                { key: "readiness_state", label: "Readiness", render: (d) => <Pill value={d.readiness_state} /> },
                { key: "required_slot_coverage_percent", label: "Required slots", render: (d) => <><Progress percent={d.required_slot_coverage_percent} /> {Math.round(num(d.required_slot_coverage_percent) ?? 0)}%</> },
                { key: "open_finding_count", label: "Open findings", render: (d) => <Pill value={d.open_finding_count} tone={num(d.open_finding_count) ? "warn" : "good"} /> },
                { key: "start", label: "Run", render: (d) => (profileByDomain[d.domain_id] ? <code>{profileByDomain[d.domain_id].start_command}</code> : <span className="muted">—</span>) },
              ]}
            />
          </Panel>
        </>
      )}
    </Async>
  );
}

export function ProjectDetail() {
  const { slug } = useParams();
  const state = useTables(["RulebookDomains", "ProjectLaunchProfiles", "ProjectLocalServices", "ProjectSlotWitnesses", "ProjectLayoutSlots", "ConsistencyFindings", "DemoNarratives", slug], async () => {
    const domain = await fetchOne("RulebookDomains", "slug", slug);
    const [profiles, services, witnesses, slots, findings, narratives] = await Promise.all([
      fetchRows("ProjectLaunchProfiles"),
      fetchRows("ProjectLocalServices"),
      fetchRows("ProjectSlotWitnesses"),
      fetchRows("ProjectLayoutSlots"),
      fetchRows("ConsistencyFindings"),
      fetchRows("DemoNarratives"),
    ]);
    const profile = profiles.find((p) => p.domain === domain.domain_id) || null;
    const slotById = Object.fromEntries(slots.map((s) => [s.project_layout_slot_id, s]));
    return {
      domain,
      profile,
      services: profile ? services.filter((s) => s.launch_profile === profile.project_launch_profile_id).sort((a, b) => num(a.sort_order) - num(b.sort_order)) : [],
      witnesses: witnesses.filter((w) => w.domain === domain.domain_id).sort((a, b) => a.slot.localeCompare(b.slot)),
      slotById,
      findings: findings.filter((f) => f.domain === domain.domain_id).sort((a, b) => String(a.priority).localeCompare(String(b.priority)) || a.consistency_finding_id.localeCompare(b.consistency_finding_id)),
      narratives: narratives.filter((n) => n.related_domain_id === domain.domain_id).sort((a, b) => num(a.order) - num(b.order)),
    };
  });

  return (
    <Async state={state} what={`project ${slug}`}>
      {({ domain, profile, services, witnesses, slotById, findings, narratives }) => (
        <>
          <section className="hero compact">
            <p className="eyebrow">
              <Link to="/projects">Projects</Link> / <code>{domain.area}</code>
            </p>
            <h1>{domain.domain_name || domain.slug}</h1>
            <p className="summary">{domain.purpose}</p>
            <p>
              <Pill value={domain.readiness_state} /> <Pill value={domain.conformance_band} tone="neutral" /> <Pill value={domain.consistency_grade} tone="neutral" />{" "}
              {domain.is_misfiled && <Pill value={`misfiled: expected ${domain.expected_area}`} tone="warn" />}
              {domain.is_intentional_exception && <Pill value="intentional exception" tone="neutral" />}
            </p>
          </section>

          <div className="stats">
            <Stat label="Required-slot coverage" value={`${Math.round(num(domain.required_slot_coverage_percent) ?? 0)}%`} />
            <Stat label="Slot coverage (all)" value={`${Math.round(num(domain.slot_coverage_percent) ?? 0)}%`} />
            <Stat label="Required gaps" value={domain.required_gap_count} />
            <Stat label="Open findings" value={domain.open_finding_count} />
            <Stat label="Tables in rulebook" value={domain.table_count} />
          </div>

          <Panel eyebrow="Run it" title="Launch instructions">
            {profile ? (
              <>
                <pre><code>{`cd ${profile.working_directory}\n${profile.start_command}`}</code></pre>
                <p>{profile.experience_description}</p>
                {profile.prerequisite_notes && <p className="muted"><strong>Before you start:</strong> {profile.prerequisite_notes}</p>}
                <Definition
                  items={[
                    ["Experience kind", <Pill value={profile.experience_kind} tone="neutral" />],
                    ["Launch contract complete", <Pill value={Boolean(profile.is_launch_contract_complete)} />],
                  ]}
                />
                <ServiceList services={services} />
              </>
            ) : (
              <p className="muted">No launch profile is modeled for this project, so no start command or local link can be shown.</p>
            )}
          </Panel>

          <Panel eyebrow="What it demonstrates" title="Concepts and features">
            <Definition
              items={[
                ["Key features", domain.key_features],
                ["Complexity", domain.complexity_level],
                ["Progression note", domain.progression_note],
                ["Parent domain", domain.parent_domain_id ? <Link to={`/projects/${domain.parent_domain_id.replace(/^domain-/, "")}`}>{domain.parent_domain_id}</Link> : null],
                ["Rulebook", domain.rulebook_path ? <code>{domain.rulebook_path}</code> : <span className="muted">none witnessed</span>],
                ["Expected rulebook path", domain.expected_rulebook_path ? <code>{domain.expected_rulebook_path}</code> : null],
                ["Folder", <code>{domain.relative_path}</code>],
              ]}
            />
            {narratives.length > 0 && (
              <DataTable
                rows={narratives}
                rowKey="narrative_id"
                columns={[
                  { key: "narrative_name", label: "Narrative" },
                  { key: "step_name", label: "Step" },
                  { key: "what_happens", label: "What happens" },
                  { key: "key_lesson", label: "Lesson" },
                  { key: "story_state", label: "State", render: (r) => <Pill value={r.story_state} /> },
                ]}
              />
            )}
          </Panel>

          <Panel eyebrow="Conformance" title="Slot witnesses">
            <p className="muted">
              What the strict filesystem scan found for each canonical slot. Required-here and gap are derived from the
              slot's requirement flags and this project's area.
            </p>
            <DataTable
              rows={witnesses}
              rowKey="project_slot_witness_id"
              columns={[
                { key: "slot", label: "Slot", render: (w) => slotById[w.slot]?.title ?? w.slot },
                { key: "is_required_here", label: "Required", render: (w) => <Pill value={Boolean(w.is_required_here)} /> },
                { key: "witness_state", label: "State", render: (w) => <Pill value={w.witness_state} tone={w.witness_state === "filled" ? "good" : w.witness_state === "gap" ? "warn" : "neutral"} /> },
                { key: "witnessed_path", label: "Witnessed", render: (w) => (w.witnessed_path ? <code>{w.witnessed_path}</code> : <span className="muted">{w.witnessed_detail || "—"}</span>) },
                { key: "is_blocking_gap", label: "Blocking", render: (w) => (w.is_blocking_gap ? <Pill value="blocking" tone="bad" /> : "—") },
              ]}
            />
          </Panel>

          <Panel eyebrow="Consistency" title="Findings for this project" actions={<Link to="/consistency">Whole queue →</Link>}>
            <DataTable
              rows={findings}
              rowKey="consistency_finding_id"
              empty="No findings recorded for this project."
              columns={[
                { key: "priority", label: "Priority", render: (f) => <Pill value={f.priority} /> },
                { key: "rule_code", label: "Rule", render: (f) => <code>{f.rule_code}</code> },
                { key: "detail", label: "Detail" },
                { key: "status", label: "Status", render: (f) => <Pill value={f.status} /> },
                { key: "detected_on", label: "Detected" },
              ]}
            />
          </Panel>
        </>
      )}
    </Async>
  );
}

// A localhost link is shown as live only when (1) the URL is modeled for this
// project and (2) the explorer's dev server just reached it. Otherwise the row
// says "not running" and the start command above is the answer.
function ServiceList({ services }) {
  if (!services.length) return <p className="muted">No local services are modeled for this launch profile.</p>;
  return (
    <DataTable
      rows={services}
      rowKey="project_local_service_id"
      columns={[
        { key: "service_role", label: "Service", render: (s) => <>{s.service_role}{s.is_primary_flag ? <> <Pill value="primary" tone="info" /></> : null}</> },
        { key: "local_url", label: "Modeled URL", render: (s) => <code>{s.local_url}</code> },
        { key: "health", label: "Live", render: (s) => <LiveLink service={s} /> },
      ]}
    />
  );
}

function LiveLink({ service }) {
  const [result, setResult] = useState({ status: "probing" });
  const target = service.health_url || service.local_url;
  useEffect(() => {
    let cancelled = false;
    setResult({ status: "probing" });
    if (!target) {
      setResult({ status: "unmodeled" });
      return undefined;
    }
    probe(target)
      .then((r) => !cancelled && setResult({ status: r.ok ? "up" : "down", detail: r.status ? `HTTP ${r.status}` : r.error }))
      .catch((error) => !cancelled && setResult({ status: "down", detail: error.message }));
    return () => {
      cancelled = true;
    };
  }, [target]);

  if (result.status === "unmodeled") return <span className="muted">no URL modeled</span>;
  if (result.status === "probing") return <span className="muted">checking…</span>;
  if (result.status === "up")
    return (
      <>
        <Pill value="running" tone="good" /> <ExternalLink href={service.local_url}>open</ExternalLink>
      </>
    );
  return (
    <>
      <Pill value="not running" tone="neutral" /> <span className="muted">{result.detail}</span>
    </>
  );
}
