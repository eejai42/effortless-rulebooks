import { Link, useParams } from "react-router-dom";
import { fetchRows, fetchOne } from "../api.js";
import { useTables } from "../hooks.js";
import { Async, Panel, Pill, DataTable, Definition } from "../components.jsx";

const TERM_ORDER = ["tier-1", "tier-2", "tier-3"];

export function Concepts() {
  const state = useTables(["Glossary", "OntologyAxioms", "FramingInvariants", "CMCCSummary"], async () => {
    const [terms, axioms, invariants, cmcc] = await Promise.all([
      fetchRows("Glossary"),
      fetchRows("OntologyAxioms"),
      fetchRows("FramingInvariants"),
      fetchRows("CMCCSummary"),
    ]);
    return { terms, axioms, invariants, cmcc };
  });

  return (
    <Async state={state} what="concepts">
      {({ terms, axioms, invariants, cmcc }) => {
        const categories = [...new Set(terms.map((t) => t.category))].sort();
        return (
          <>
            <section className="hero compact">
              <p className="eyebrow">Concepts</p>
              <h1>The vocabulary of Effortless Rulebooks</h1>
              <p className="summary">
                ERB, CMCC, SDLAF, the loop, views, rules and the glossary. Every entry is a row in the root rulebook's{" "}
                <code>Glossary</code>, <code>OntologyAxioms</code> or <code>FramingInvariants</code> table.
              </p>
            </section>

            {cmcc.map((section) => (
              <Panel key={section.cmcc_summary_id} eyebrow={section.section_label} title={section.name}>
                <p className="prose">{section.description}</p>
              </Panel>
            ))}

            <Panel eyebrow="Axioms" title="Load-bearing axioms">
              <ul className="linklist">
                {axioms.map((a) => (
                  <li key={a.axiom_id}>
                    <Link to={`/concepts/${a.axiom_id}`}>{a.short_name}</Link> <Pill value={a.guard_state} />
                    <p className="muted">{a.statement}</p>
                  </li>
                ))}
              </ul>
            </Panel>

            {categories.map((cat) => (
              <Panel key={cat} eyebrow="Glossary" title={cat}>
                <ul className="linklist">
                  {terms
                    .filter((t) => t.category === cat)
                    .sort((a, b) => TERM_ORDER.indexOf(a.glossary_tier) - TERM_ORDER.indexOf(b.glossary_tier) || a.term.localeCompare(b.term))
                    .map((t) => (
                      <li key={t.term_id}>
                        <Link to={`/concepts/${t.term_id}`}>{t.term}</Link> <Pill value={t.glossary_tier} tone="neutral" />
                        {t.has_implementation && <Pill value={t.implementation_kind} tone="info" />}
                        <p className="muted">{t.definition}</p>
                      </li>
                    ))}
                </ul>
              </Panel>
            ))}

            <Panel eyebrow="Framing" title="Invariants: wrong framing vs. correct framing">
              <DataTable
                rows={invariants}
                rowKey="invariant_id"
                columns={[
                  { key: "category", label: "Category" },
                  { key: "wrong_framing", label: "Wrong" },
                  { key: "correct_framing", label: "Correct" },
                  { key: "severity", label: "Severity", render: (r) => <Pill value={r.severity} /> },
                ]}
              />
            </Panel>
          </>
        );
      }}
    </Async>
  );
}

// One concept: a glossary term (glo-*) or an axiom (ax-*). The id decides the table.
export function ConceptDetail() {
  const { concept } = useParams();
  const isAxiom = concept.startsWith("ax-");
  const state = useTables([isAxiom ? "OntologyAxioms" : "Glossary", concept], async () => {
    if (isAxiom) {
      const [axiom, invariants] = await Promise.all([fetchOne("OntologyAxioms", "axiom_id", concept), fetchRows("FramingInvariants")]);
      return { axiom, invariants: invariants.filter((i) => i.violated_axiom_id === concept) };
    }
    const term = await fetchOne("Glossary", "term_id", concept);
    return { term };
  });

  return (
    <Async state={state} what={`concept ${concept}`}>
      {({ axiom, invariants, term }) =>
        axiom ? (
          <>
            <section className="hero compact">
              <p className="eyebrow">
                <Link to="/concepts">Concepts</Link> / Axiom
              </p>
              <h1>{axiom.short_name}</h1>
              <p className="summary">{axiom.statement}</p>
            </section>
            <Panel title="Details">
              <Definition
                items={[
                  ["Status", <Pill value={axiom.status} />],
                  ["Why", axiom.why],
                  ["Implication", axiom.implication],
                  ["Guard state", <Pill value={axiom.guard_state} />],
                  ["Invariants guarding it", axiom.invariant_count],
                  ["Platform features shipped", `${axiom.shipped_feature_count} of ${axiom.feature_count}`],
                  ["Load-bearing", <Pill value={Boolean(axiom.is_load_bearing)} />],
                ]}
              />
            </Panel>
            <Panel title="Framing invariants that enforce this axiom">
              <DataTable
                rows={invariants}
                rowKey="invariant_id"
                empty="No invariant references this axiom."
                columns={[
                  { key: "wrong_framing", label: "Wrong" },
                  { key: "correct_framing", label: "Correct" },
                  { key: "why", label: "Why" },
                  { key: "severity", label: "Severity", render: (r) => <Pill value={r.severity} /> },
                ]}
              />
            </Panel>
          </>
        ) : (
          <>
            <section className="hero compact">
              <p className="eyebrow">
                <Link to="/concepts">Concepts</Link> / {term.category}
              </p>
              <h1>{term.term}</h1>
              <p className="summary">{term.definition}</p>
            </section>
            <Panel title="Details">
              <Definition
                items={[
                  ["Tier", <Pill value={term.glossary_tier} tone="neutral" />],
                  ["Implemented as", term.implemented_as ? <code>{term.implemented_as}</code> : null],
                  ["Implementation kind", term.implementation_kind],
                  ["Aliases", term.aliases],
                  ["Notes", term.notes],
                  ["Term quality", <Pill value={term.term_quality} />],
                  ["Anchored", <Pill value={Boolean(term.is_anchored)} />],
                ]}
              />
            </Panel>
          </>
        )
      }
    </Async>
  );
}

export function Skills() {
  const state = useTables(["ClaudeSkills", "SkillRoutes"], async () => {
    const [skills, routes] = await Promise.all([fetchRows("ClaudeSkills"), fetchRows("SkillRoutes")]);
    return { skills: [...skills].sort((a, b) => a.skill_id.localeCompare(b.skill_id)), routes };
  });

  return (
    <Async state={state} what="the skill catalog">
      {({ skills, routes }) => {
        const categories = [...new Set(skills.map((s) => s.category))].sort();
        return (
          <>
            <section className="hero compact">
              <p className="eyebrow">Skills</p>
              <h1>The Claude skill catalog</h1>
              <p className="summary">
                Each skill is a row in <code>ClaudeSkills</code>; the arrows between them are rows in{" "}
                <code>SkillRoutes</code>. Hub, leaf and isolated classifications are rulebook formulas. Load gates say
                when a skill may activate at all.
              </p>
            </section>

            <Panel eyebrow="Routing" title="How skills route to each other">
              <DataTable
                rows={[...routes].sort((a, b) => a.from_skill.localeCompare(b.from_skill) || a.to_skill.localeCompare(b.to_skill))}
                rowKey="skill_route_id"
                columns={[
                  { key: "from_skill", label: "From", render: (r) => <Link to={`/skills/${r.from_skill}`}>{r.from_skill}</Link> },
                  { key: "to_skill", label: "To", render: (r) => <Link to={`/skills/${r.to_skill}`}>{r.to_skill}</Link> },
                  { key: "route_reason", label: "Why" },
                  { key: "edge_class", label: "Edge", render: (r) => <Pill value={r.edge_class} tone={r.is_stale ? "bad" : "neutral"} /> },
                ]}
              />
            </Panel>

            {categories.map((cat) => (
              <Panel key={cat} eyebrow="Category" title={cat}>
                <DataTable
                  rows={skills.filter((s) => s.category === cat)}
                  rowKey="skill_id"
                  columns={[
                    { key: "slash_command", label: "Skill", render: (r) => <Link to={`/skills/${r.skill_id}`}><code>{r.slash_command}</code></Link> },
                    { key: "one_line_summary", label: "Summary" },
                    { key: "skill_role", label: "Role", render: (r) => <Pill value={r.skill_role} tone="neutral" /> },
                    { key: "catalog_state", label: "State", render: (r) => <Pill value={r.catalog_state} /> },
                    { key: "is_entry_point", label: "Entry point", render: (r) => <Pill value={Boolean(r.is_entry_point)} /> },
                  ]}
                />
              </Panel>
            ))}
          </>
        );
      }}
    </Async>
  );
}

export function SkillDetail() {
  const { skill } = useParams();
  const state = useTables(["ClaudeSkills", "SkillRoutes", skill], async () => {
    const [row, routes, skills] = await Promise.all([fetchOne("ClaudeSkills", "skill_id", skill), fetchRows("SkillRoutes"), fetchRows("ClaudeSkills")]);
    const byId = Object.fromEntries(skills.map((s) => [s.skill_id, s]));
    return {
      row,
      outbound: routes.filter((r) => r.from_skill === skill),
      inbound: routes.filter((r) => r.to_skill === skill),
      byId,
    };
  });

  return (
    <Async state={state} what={`skill ${skill}`}>
      {({ row, outbound, inbound, byId }) => (
        <>
          <section className="hero compact">
            <p className="eyebrow">
              <Link to="/skills">Skills</Link> / {row.category}
            </p>
            <h1>
              <code>{row.slash_command}</code>
            </h1>
            <p className="summary">{row.one_line_summary}</p>
            <p>
              <Pill value={row.catalog_state} /> <Pill value={row.skill_role} tone="neutral" /> {row.is_entry_point && <Pill value="entry point" tone="info" />}{" "}
              {row.is_deprecated && <Pill value="deprecated" />}
            </p>
          </section>

          <Panel title="Load gate">
            <p className="prose">{row.load_gate || <span className="muted">No load gate recorded.</span>}</p>
          </Panel>

          <Panel title="Details">
            <Definition
              items={[
                ["Audience", row.audience],
                ["Status", <Pill value={row.status} />],
                ["Local mirror", row.local_mirror_path ? <code>{row.local_mirror_path}</code> : null],
                ["Clone URL", row.clone_url ? <a href={row.clone_url}>{row.clone_url}</a> : null],
                ["Outbound routes", row.outbound_route_count],
                ["Inbound routes", row.inbound_route_count],
                ["Route degree", row.route_degree],
                ["Catalog label", row.catalog_label],
                ["Needs catalog action", <Pill value={Boolean(row.needs_catalog_action)} tone={row.needs_catalog_action ? "warn" : "good"} />],
              ]}
            />
          </Panel>

          <Panel title="Routes to">
            <DataTable
              rows={outbound}
              rowKey="skill_route_id"
              empty="This skill does not route onward."
              columns={[
                { key: "to_skill", label: "Skill", render: (r) => <Link to={`/skills/${r.to_skill}`}><code>{byId[r.to_skill]?.slash_command ?? r.to_skill}</code></Link> },
                { key: "route_reason", label: "When" },
                { key: "edge_class", label: "Edge", render: (r) => <Pill value={r.edge_class} tone={r.is_stale ? "bad" : "neutral"} /> },
              ]}
            />
          </Panel>

          <Panel title="Routed from">
            <DataTable
              rows={inbound}
              rowKey="skill_route_id"
              empty="No skill routes here."
              columns={[
                { key: "from_skill", label: "Skill", render: (r) => <Link to={`/skills/${r.from_skill}`}><code>{byId[r.from_skill]?.slash_command ?? r.from_skill}</code></Link> },
                { key: "route_reason", label: "When" },
                { key: "edge_class", label: "Edge", render: (r) => <Pill value={r.edge_class} tone={r.is_stale ? "bad" : "neutral"} /> },
              ]}
            />
          </Panel>
        </>
      )}
    </Async>
  );
}

