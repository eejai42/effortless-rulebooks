import { Link } from "react-router-dom";
import { fetchRows, fetchOne, num } from "../api.js";
import { useTables } from "../hooks.js";
import { Async, Panel, Stat, Pill, DataTable, Definition, Progress, ExternalLink } from "../components.jsx";

export function Home() {
  const state = useTables(["ProjectMetadata", "CMCCSummary", "BuildPhases", "RulebookDomains"], async () => {
    const [meta, cmcc, phases, domains] = await Promise.all([
      fetchOne("ProjectMetadata", "project_id", "erb-001"),
      fetchRows("CMCCSummary"),
      fetchRows("BuildPhases"),
      fetchRows("RulebookDomains"),
    ]);
    return { meta, cmcc, phases: [...phases].sort((a, b) => num(a.phase_number) - num(b.phase_number)), domains };
  });

  return (
    <Async state={state} what="the platform overview">
      {({ meta, cmcc, phases, domains }) => (
        <>
          <section className="hero">
            <p className="eyebrow">The repo is the platform</p>
            <h1>{meta.name}</h1>
            <p className="summary">{meta.purpose}</p>
            <div className="cta-row">
              <Link className="button" to="/getting-started">
                Get started
              </Link>
              <Link className="button ghost" to="/projects">
                Browse projects
              </Link>
              <Link className="button ghost" to="/about-the-rulebook">
                How the rulebook governs
              </Link>
            </div>
          </section>

          <div className="stats">
            <Stat label="Governed projects" value={meta.domain_count} to="/projects" />
            <Stat label="Fully implemented" value={meta.fully_implemented_count} hint="derived from slot witnesses" to="/examples" />
            <Stat label="Open findings" value={meta.open_finding_total} to="/consistency" />
            <Stat label="Programme progress" value={`${Math.round(num(meta.programme_progress_percent) ?? 0)}%`} to="/progress" />
            <Stat label="Repository consistent" value={<Pill value={meta.is_repo_consistent} tone={meta.is_repo_consistent ? "good" : "warn"} />} to="/consistency" />
          </div>

          <Panel eyebrow="Architecture" title="How the repository is laid out">
            <p>{meta.architecture}</p>
            <Definition
              items={[
                ["Entry point", <code>{meta.entry_point}</code>],
                ["Repository root", meta.repository_root ? <code>{meta.repository_root}</code> : null],
                ["Skills catalogued", meta.skill_count],
                ["Consistency rules", meta.consistency_rule_count],
                ["Layout slots", meta.layout_slot_count],
              ]}
            />
          </Panel>

          {cmcc.map((section) => (
            <Panel key={section.cmcc_summary_id} eyebrow={section.section_label} title={section.name}>
              <p className="prose">{section.description}</p>
            </Panel>
          ))}

          <Panel eyebrow="Programme" title="Delivery phases" actions={<Link to="/progress">All progress →</Link>}>
            <DataTable
              rows={phases}
              rowKey="build_phase_id"
              columns={[
                { key: "phase_number", label: "#", width: "3rem" },
                { key: "title", label: "Phase" },
                { key: "phase_state", label: "State", render: (r) => <Pill value={r.phase_state} /> },
                { key: "story_count", label: "Stories" },
                { key: "done_percent", label: "Done", render: (r) => <><Progress percent={r.done_percent} /> {Math.round(num(r.done_percent) ?? 0)}%</> },
              ]}
            />
          </Panel>

          <Panel eyebrow="Projects" title="Readiness at a glance" actions={<Link to="/projects">All projects →</Link>}>
            <ReadinessStrip domains={domains} />
          </Panel>
        </>
      )}
    </Async>
  );
}

// Displays each project's derived readiness_state as a chip. Grouping is display
// only: the state itself is the rulebook's formula.
function ReadinessStrip({ domains }) {
  const order = ["root-ready", "example-ready", "example-incomplete", "toy", "intentional-exception"];
  const states = [...new Set(domains.map((d) => d.readiness_state))].sort((a, b) => order.indexOf(a) - order.indexOf(b));
  return (
    <div className="chip-groups">
      {states.map((s) => (
        <div key={s} className="chip-group">
          <Pill value={s} />
          <div className="chips">
            {domains
              .filter((d) => d.readiness_state === s)
              .sort((a, b) => a.slug.localeCompare(b.slug))
              .map((d) => (
                <Link key={d.domain_id} className="chip" to={`/projects/${d.slug}`}>
                  {d.slug}
                </Link>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function GettingStarted() {
  const state = useTables(["ProjectLaunchProfiles", "ProjectLocalServices", "RulebookSourceSpokes"], async () => {
    const [profile, services, spokes] = await Promise.all([
      fetchOne("ProjectLaunchProfiles", "domain", "domain-root"),
      fetchRows("ProjectLocalServices"),
      fetchRows("RulebookSourceSpokes"),
    ]);
    return {
      profile,
      services: services.filter((s) => s.launch_profile === profile.project_launch_profile_id).sort((a, b) => num(a.sort_order) - num(b.sort_order)),
      spokes,
    };
  });

  return (
    <Async state={state} what="the getting-started guide">
      {({ profile, services, spokes }) => (
        <>
          <section className="hero compact">
            <p className="eyebrow">Getting started</p>
            <h1>From clone to running root in four steps</h1>
            <p className="summary">
              The root of this repository is itself an Effortless project. Its <code>./start.sh</code> is the
              entry point; it starts the generated rulebook editor, the view-backed API, and this explorer.
            </p>
          </section>

          <Panel eyebrow="Step 1" title="Prerequisites">
            <ul className="checklist">
              <li><strong>Docker</strong> with the daemon running: the generated editor stack runs in a container.</li>
              <li><strong>Node.js and npm</strong>: this explorer is a Vite + React app.</li>
              <li><strong>PostgreSQL client tools</strong> (<code>psql</code>, <code>createdb</code>): the root loads its own views locally.</li>
              <li><strong>The <code>effortless</code> CLI</strong>: every project is rebuilt with <code>effortless build</code>.</li>
            </ul>
            <pre><code>{`# macOS prerequisites
brew install node postgresql
# the effortless CLI (npm package wrapping a .NET 8 binary; needs dotnet 8 + Node 20+)
mkdir -p ~/.effortless
git clone --depth 1 https://github.com/effortlessapi/cli ~/.effortless/cli
cd ~/.effortless/cli && npm install -g .
effortless -version`}</code></pre>
            {profile.prerequisite_notes && <p className="muted">{profile.prerequisite_notes}</p>}
          </Panel>

          <Panel eyebrow="Step 2" title="Start the root">
            <pre><code>{`cd ${profile.working_directory === "." ? "effortless-rulebooks" : profile.working_directory}
${profile.start_command}`}</code></pre>
            <p>{profile.experience_description}</p>
            <DataTable
              rows={services}
              rowKey="project_local_service_id"
              columns={[
                { key: "service_role", label: "Service" },
                { key: "local_url", label: "URL", render: (r) => <ExternalLink href={r.local_url} /> },
                { key: "health_url", label: "Health", render: (r) => (r.health_url ? <ExternalLink href={r.health_url} /> : "—") },
              ]}
            />
          </Panel>

          <Panel eyebrow="Step 3" title="Open the generated editor">
            <p>
              The editor at <ExternalLink href="http://localhost:42442" /> is generated from the root rulebook. Browse any
              table, edit raw fields, and watch the calculated columns update in Postgres. Its API is discoverable at{" "}
              <ExternalLink href="http://localhost:42441/api/docs" />, and every read is a <code>vw_*</code> view.
            </p>
          </Panel>

          <Panel eyebrow="Step 4" title="Run a first project">
            <p>
              Every governed project has the same shape and the same contract: <code>cd</code> into it and run{" "}
              <code>./start.sh</code>. The <Link to="/projects">projects list</Link> shows each one's exact command, what it
              starts, and a live link whenever its modeled service answers a health check.
            </p>
            <pre><code>{`cd rulebook-examples/effortless-banking
./start.sh`}</code></pre>
          </Panel>

          <Panel eyebrow="How editing works" title="Rulebook first, everything else derived">
            <p>
              The rulebook JSON is the single source of truth. Edit it directly (or through an input surface) and run{" "}
              <code>effortless build</code>; Postgres, RuleSpeak, the editor, and this app are regenerated or refreshed from it.
            </p>
            <DataTable
              rows={spokes}
              rowKey="spoke_id"
              columns={[
                { key: "surface_label", label: "Surface" },
                { key: "direction", label: "Direction", render: (r) => <Pill value={r.direction} tone="neutral" /> },
                { key: "purpose", label: "Purpose" },
              ]}
            />
          </Panel>
        </>
      )}
    </Async>
  );
}

export function AboutRulebook() {
  const state = useTables(["ProjectMetadata", "OntologyAxioms", "FramingInvariants", "ProjectLayoutSlots", "ConsistencyRules"], async () => {
    const [meta, axioms, invariants, slots, rules] = await Promise.all([
      fetchOne("ProjectMetadata", "project_id", "erb-001"),
      fetchRows("OntologyAxioms"),
      fetchRows("FramingInvariants"),
      fetchRows("ProjectLayoutSlots"),
      fetchRows("ConsistencyRules"),
    ]);
    return { meta, axioms, invariants, slots, rules };
  });

  return (
    <Async state={state} what="the rulebook overview">
      {({ meta, axioms, invariants, slots, rules }) => (
        <>
          <section className="hero compact">
            <p className="eyebrow">About the rulebook</p>
            <h1>The root rulebook governs the repository</h1>
            <p className="summary">
              One rulebook models every governed project, the canonical project shape, what the filesystem actually
              witnessed, the rules that compare the two, and the delivery programme. Readiness, coverage, misfiling and
              finding priority are formulas in that rulebook; this app only displays their columns.
            </p>
          </section>

          <div className="stats">
            <Stat label="Layout slots" value={meta.layout_slot_count} hint="the canonical shape" />
            <Stat label="Consistency rules" value={meta.consistency_rule_count} to="/consistency" />
            <Stat label="Rules satisfied" value={meta.satisfied_rule_count} />
            <Stat label="Rule compliance" value={`${Math.round(num(meta.rule_compliance_percent) ?? 0)}%`} />
          </div>

          <Panel eyebrow="Canonical shape" title="Project layout slots">
            <p className="muted">
              Every governed project is witnessed against these slots. Which slots are required depends on whether the
              row is the root, an example, or a toy.
            </p>
            <DataTable
              rows={[...slots].sort((a, b) => a.project_layout_slot_id.localeCompare(b.project_layout_slot_id))}
              rowKey="project_layout_slot_id"
              columns={[
                { key: "title", label: "Slot" },
                { key: "kind", label: "Kind", render: (r) => <Pill value={r.kind} tone="neutral" /> },
                { key: "pattern", label: "Pattern", render: (r) => <code>{r.pattern}</code> },
                { key: "required_for_example", label: "Example", render: (r) => <Pill value={Boolean(r.required_for_example)} /> },
                { key: "required_for_toy", label: "Toy", render: (r) => <Pill value={Boolean(r.required_for_toy)} /> },
                { key: "coverage_percent", label: "Coverage", render: (r) => <><Progress percent={r.coverage_percent} /> {Math.round(num(r.coverage_percent) ?? 0)}%</> },
                { key: "slot_health", label: "Health", render: (r) => <Pill value={r.slot_health} /> },
              ]}
            />
          </Panel>

          <Panel eyebrow="Foundations" title="Ontology axioms">
            {axioms.map((a) => (
              <article key={a.axiom_id} className="card">
                <header>
                  <h3>{a.short_name}</h3>
                  <Pill value={a.status} /> <Pill value={a.guard_state} />
                </header>
                <p>{a.statement}</p>
                {a.why && <p className="muted"><strong>Why:</strong> {a.why}</p>}
                {a.implication && <p className="muted"><strong>Implication:</strong> {a.implication}</p>}
              </article>
            ))}
          </Panel>

          <Panel eyebrow="Guardrails" title="Framing invariants">
            <DataTable
              rows={invariants}
              rowKey="invariant_id"
              columns={[
                { key: "wrong_framing", label: "Wrong framing" },
                { key: "correct_framing", label: "Correct framing" },
                { key: "severity", label: "Severity", render: (r) => <Pill value={r.severity} /> },
                { key: "axiom_short_name", label: "Axiom" },
                { key: "enforcement_state", label: "Enforcement", render: (r) => <Pill value={r.enforcement_state} /> },
              ]}
            />
          </Panel>

          <Panel eyebrow="Rules" title="Consistency rules derived from the shape" actions={<Link to="/consistency">Findings queue →</Link>}>
            <DataTable
              rows={[...rules].sort((a, b) => a.rule_code.localeCompare(b.rule_code))}
              rowKey="consistency_rule_id"
              columns={[
                { key: "rule_code", label: "Code", render: (r) => <code>{r.rule_code}</code> },
                { key: "statement", label: "Rule" },
                { key: "severity", label: "Severity", render: (r) => <Pill value={r.severity} /> },
                { key: "rule_state", label: "State", render: (r) => <Pill value={r.rule_state} /> },
                { key: "open_finding_count", label: "Open" },
              ]}
            />
          </Panel>
        </>
      )}
    </Async>
  );
}
