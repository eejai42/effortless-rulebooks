// The DAG explorer page. The host app routes /dag/:table/:field to this
// component, passing `table` and `field` as props, plus optional routing
// callbacks (FieldLink, onBack).
//
// Reads like a dictionary entry: this cell's one-line function, with each
// vocabulary word linked to its own one-line function, all the way down to
// ground truth.

import { useMemo } from "react";
import type { ReactNode } from "react";
import { resolveDag } from "../lib/dagResolver.ts";
import type { DagResponse, FieldNode, FieldType } from "../lib/types.ts";
import { humanizeField, renderEnglish } from "../lib/renderEnglish.ts";
import { tryParseFormula } from "../lib/formula.ts";
import {
  ruleSpeakForField,
  obligationsForField,
  renderRuleMarkdown,
  renderRuleRich,
  linkifyText,
} from "../lib/rulespeak.ts";
import type { RuleSpeakRef, RuleNode } from "../lib/rulespeak.ts";
import { RuleTree } from "../components/RuleTree.tsx";
import { useDocElementClasses } from "../lib/dagPrefs.ts";
import { FormulaText } from "../components/FormulaText.tsx";
import { FieldChip } from "../components/FieldChip.tsx";
import { TypeBadge, typeGlyph, typeTone } from "../components/TypeBadge.tsx";
import { ExplainerHeader } from "../components/ExplainerHeader.tsx";
import {
  RoutingContext,
  mergeRouting,
  useFieldLink,
  useTableLink,
} from "../lib/routingContext.tsx";
import type {
  ExplainerDagRouting,
  FieldLinkProps,
  TableLinkProps,
} from "../lib/routingContext.tsx";

export type { ExplainerDagRouting, FieldLinkProps, TableLinkProps };

export interface FieldDagProps {
  table: string;
  field: string;
  routing?: ExplainerDagRouting;
}

export function FieldDag(props: FieldDagProps): JSX.Element {
  const { table, field, routing } = props;
  const merged = useMemo(() => mergeRouting(routing), [routing]);
  return (
    <RoutingContext.Provider value={merged}>
      <FieldDagInner table={table} field={field} />
    </RoutingContext.Provider>
  );
}

function FieldDagInner({ table, field }: { table: string; field: string }): JSX.Element {
  const dag = useMemo<DagResponse | null>(() => resolveDag(table, field), [table, field]);
  // `show-<key>` classes for the gear's enabled doc-elements; the CSS in dag.css
  // reveals the matching `.elem-<key>` blocks below. Computed synchronously, so
  // the first paint already reflects the remembered choices (no flash).
  const pageClasses = useDocElementClasses();

  // The baked RuleSpeak® rule for this field (rendered at transpile time by the
  // shared rulebook-rulespeak-core engine) + any deontic obligations keyed on it.
  const ruleSpeak = useMemo(() => ruleSpeakForField(table, field), [table, field]);
  const obligations = useMemo(() => obligationsForField(table, field), [table, field]);

  const upstreamLookup = useMemo(() => {
    if (!dag) return {};
    const m: Record<string, FieldNode> = {};
    for (const n of dag.upstream) m[`${n.table}.${n.field}`] = n;
    m[`${dag.table}.${dag.field}`] = dag;
    return m;
  }, [dag]);

  const englishSentence = useMemo(() => {
    if (!dag?.formula) return null;
    const ast = tryParseFormula(dag.formula);
    if (!ast) return null;
    try {
      return renderEnglish(ast);
    } catch { return null; }
  }, [dag?.formula]);

  if (!dag) {
    return (
      <div className="dag-page">
        <ExplainerHeader crumbs={[{ index: true }, { table }, field]} />
        <div className="muted">Field not found in rulebook.</div>
      </div>
    );
  }

  // The fields this rule references, with the humanized labels used in the prose.
  // Drives clickable refs in the RuleSpeak® and English views (the formula view has
  // its own chips). renderRef turns one matched label into a drill-in chip.
  const refs = ruleSpeak?.refs ?? [];
  const renderRef = (r: RuleSpeakRef, matched: string, key: number) => (
    <FieldChip
      key={`ref-${key}`}
      table={r.table}
      field={r.field}
      node={upstreamLookup[`${r.table}.${r.field}`]}
      variant="inline"
      pageTable={dag.table}
    >
      {matched}
    </FieldChip>
  );

  return (
    <div className={`dag-page ${pageClasses}`}>
      {/* Home + back + the gear (six independent doc-element toggles). The table
          crumb links to that table's page, so you can hop up to the table. */}
      <ExplainerHeader crumbs={[{ index: true }, { table: dag.table }, dag.field]} />
      <Hero dag={dag} />

      {dag.type === "raw" || dag.type === "relationship" ? (
        <GroundTruthCard datatype={dag.datatype} type={dag.type} relatedTo={dag.relatedTo} />
      ) : (
        // Derived field. Each narration is an INDEPENDENT doc-element wrapped in
        // its own `.elem-<key>` block — the gear shows any combination at once
        // (all three stacked, or just one). CSS gates visibility; each card still
        // states its own empty case honestly (a formula-less roll-up has a
        // RuleSpeak® rule but no formula / English sentence, so those say so).
        <>
          <div className="elem elem-rulespeak">
            <RuleSpeakCard
              rule={ruleSpeak?.rule ?? null}
              structure={ruleSpeak?.structure ?? null}
              kind={ruleSpeak?.kind ?? dag.type}
              mechanical={ruleSpeak?.mechanical ?? false}
              obligations={obligations}
              refs={refs}
              renderRef={renderRef}
              hasFormula={!!dag.formula}
            />
          </div>
          <div className="elem elem-english">
            <EnglishCard english={englishSentence} refs={refs} renderRef={renderRef} kind={dag.type} />
          </div>
          <div className="elem elem-formula">
            <FormulaCard
              formula={dag.formula}
              table={dag.table}
              lookup={upstreamLookup}
              kind={dag.type}
            />
          </div>
        </>
      )}

      {dag.upstream.length > 0 && (
        <div className="elem elem-inputs">
          <InputsSection upstream={dag.upstream} />
        </div>
      )}

      <div className="elem elem-consumers">
        <ConsumersSection direct={dag.downstream} transitive={dag.consumerTransitive} />
      </div>

      {dag.leaves.length > 0 && (
        <div className="elem elem-inputs">
          <LeavesSection leaves={dag.leaves} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────

function Hero({ dag }: { dag: DagResponse }): JSX.Element {
  const tone = typeTone(dag.type);
  const TableLink = useTableLink();
  return (
    <header className={`dag-hero dag-hero-${tone}`}>
      <div className="dag-hero-meta">
        <TypeBadge type={dag.type} />
        {dag.depth > 0 && (
          <span className="dag-pill dag-pill-depth">
            {dag.depth === 1 ? "1 hop from ground truth" : `${dag.depth} hops from ground truth`}
          </span>
        )}
        <span className="dag-pill">{dag.datatype}</span>
        {dag.nullable && <span className="dag-pill dag-pill-muted">nullable</span>}
      </div>
      <h1 className="dag-title">{dag.field}</h1>
      <p className="dag-subtitle">
        {/* The owning table is always a link up to its page — the entity this
            cell belongs to, one click away from any field. */}
        <TableLink table={dag.table} className="dag-subtitle-table dag-subtitle-table-link">
          {dag.table}
        </TableLink>
        {" · "}
        <span className="dag-subtitle-human">{humanizeField(dag.field)}</span>
      </p>

      {dag.description && (
        <p className="dag-description elem elem-desc">{dag.description}</p>
      )}
    </header>
  );
}

function GroundTruthCard({
  datatype, type, relatedTo,
}: {
  datatype: string;
  type: FieldType;
  relatedTo?: string | null;
}): JSX.Element {
  const TableLink = useTableLink();
  return (
    <section className="dag-card dag-gt">
      <div className="dag-gt-glyph">{typeGlyph(type)}</div>
      <div>
        <h3 className="dag-gt-title">
          {type === "relationship" ? "Relationship pointer" : "Ground truth"}
        </h3>
        <p className="dag-gt-body">
          {type === "relationship" ? (
            relatedTo ? (
              <>This field is a pointer to{" "}
                <TableLink table={relatedTo} className="dag-gt-rel-link">
                  {relatedTo}
                </TableLink>
                . It is not derived from anything else — it&rsquo;s the link
                the rest of the DAG hangs off.</>
            ) : (
              <>This field is a pointer to another table. It is not derived from
                anything else — it&rsquo;s the link the rest of the DAG hangs off.</>
            )
          ) : (
            <>This cell is a leaf. It is <em>written</em> directly to the
              database (datatype <code>{datatype}</code>) and is not computed
              from anything else. Everything else upstream eventually traces
              back to values like this one.</>
          )}
        </p>
        {type === "relationship" && relatedTo && (
          <p className="dag-gt-rel-cta">
            <TableLink table={relatedTo} className="dag-gt-rel-btn">
              Open {relatedTo} →
            </TableLink>
          </p>
        )}
      </div>
    </section>
  );
}

// Formula view: the raw spreadsheet-style formula, every field a clickable chip.
// A formula-less roll-up (e.g. a structural aggregation) honestly says it has no
// formula here rather than rendering a blank box.
function FormulaCard({
  formula, table, lookup, kind,
}: {
  formula: string | null;
  table: string;
  lookup: Record<string, FieldNode>;
  kind: string;
}): JSX.Element {
  return (
    <section className="dag-card dag-formula">
      <h3 className="dag-card-title">This cell is the value of one one-line function</h3>

      {formula ? (
        <>
          <div className="dag-formula-syntax">
            <span className="dag-formula-label">As a formula</span>
            <div className="dag-formula-code">
              <FormulaText formula={formula} table={table} lookup={lookup} />
            </div>
          </div>
          <p className="dag-formula-hint muted">
            Each chip is itself a one-line function. Click any chip to drill in.
          </p>
        </>
      ) : (
        <p className="dag-english-text muted">
          This {kind} has no spreadsheet formula — it is a roll-up defined
          structurally over a relationship. Switch to <strong>RuleSpeak®</strong> to
          see how it&rsquo;s defined.
        </p>
      )}
    </section>
  );
}

// English view: the formula read as a plain sentence ("True when …"), with each
// referenced field a clickable in-prose link (drill into its DAG). A formula-less
// roll-up has no formula to read aloud, so it says so and points to RuleSpeak®.
function EnglishCard({
  english, refs, renderRef, kind,
}: {
  english: string | null;
  refs: RuleSpeakRef[];
  renderRef: (r: RuleSpeakRef, matched: string, key: number) => ReactNode;
  kind: string;
}): JSX.Element {
  return (
    <section className="dag-card dag-formula">
      <h3 className="dag-card-title">This cell is the value of one one-line function</h3>
      {english ? (
        <>
          <div className="dag-english">
            <span className="dag-english-label">In English</span>
            <p className="dag-english-text">{linkifyText(english, refs, renderRef)}.</p>
          </div>
          <p className="dag-formula-hint muted">
            Each underlined field is itself a one-line function. Click any to drill in.
          </p>
        </>
      ) : (
        <p className="dag-english-text muted">
          This {kind} has no spreadsheet formula to read as a sentence — it is a
          roll-up defined structurally over a relationship. Switch to{" "}
          <strong>RuleSpeak®</strong> to see how it&rsquo;s defined.
        </p>
      )}
    </section>
  );
}

function InputsSection({ upstream }: { upstream: FieldNode[] }): JSX.Element {
  return (
    <section className="dag-section">
      <h2 className="dag-section-title">
        ▼ Inputs <span className="dag-count">{upstream.length}</span>
      </h2>
      <p className="dag-section-lead muted">Fields this one-line function calls.</p>
      <div className="dag-input-grid">
        {upstream.map((u) => (
          <InputCard key={`${u.table}.${u.field}`} node={u} />
        ))}
      </div>
    </section>
  );
}

function InputCard({ node }: { node: FieldNode }): JSX.Element {
  const tone = typeTone(node.type);
  const FieldLink = useFieldLink();

  // The input card always prefers the baked RuleSpeak® rule (the headline reading),
  // falling back to the formula-English so a field with no rendered rule still reads.
  const ruleSpeak = useMemo(
    () => ruleSpeakForField(node.table, node.field),
    [node.table, node.field],
  );
  const english = useMemo(() => {
    if (!node.formula) return null;
    const ast = tryParseFormula(node.formula);
    if (!ast) return null;
    try { return renderEnglish(ast); } catch { return null; }
  }, [node.formula]);

  const ruleNode: ReactNode | null =
    ruleSpeak?.rule ? renderRuleMarkdown(ruleSpeak.rule) : null;

  return (
    <FieldLink
      table={node.table}
      field={node.field}
      className={`dag-input dag-input-${tone}`}
    >
      <span className="dag-input-head">
        <TypeBadge type={node.type} size="sm" />
        <span className="dag-input-name">{node.field}</span>
        <span className="dag-input-table">{node.table}</span>
      </span>
      {ruleNode
        ? <span className="dag-input-english dag-input-rulespeak">{ruleNode}</span>
        : english && <span className="dag-input-english">{english}.</span>}
      {!ruleNode && !english && node.description && <span className="dag-input-desc">{node.description}</span>}
      {!ruleNode && !english && !node.description && node.type === "raw" && (
        <span className="dag-input-desc muted">Ground truth · datatype {node.datatype}</span>
      )}
    </FieldLink>
  );
}

// The RuleSpeak® counterpart of FormulaCard: the same node, narrated as a
// declarative rule (rendered at transpile time by the shared engine) instead of
// as a formula. Any deontic obligations keyed on this field appear beneath it.
function RuleSpeakCard({
  rule, structure, kind, mechanical, obligations, refs, renderRef,
  hasFormula = true,
}: {
  rule: string | null;
  structure: RuleNode | null;
  kind: string;
  mechanical: boolean;
  obligations: { constraintKey: string; severity: string; markdown: string }[];
  refs: RuleSpeakRef[];
  renderRef: (r: RuleSpeakRef, matched: string, key: number) => ReactNode;
  // Whether this field has an underlying Excel formula. Drives the footer
  // wording so we don't claim "the same logic the formula encodes" for a
  // structural aggregation that has no formula.
  hasFormula?: boolean;
}): JSX.Element {
  return (
    <section className="dag-card dag-rulespeak">
      <h3 className="dag-card-title">This cell is the value of one declarative rule</h3>

      {rule ? (
        <div className="dag-english dag-rs-rule">
          <span className="dag-english-label">
            In RuleSpeak®
            {mechanical && (
              <span className="dag-rs-mech" title="Faithful but clunky wording — a flag for an optional reword pass">
                {" "}⚠︎ mechanical
              </span>
            )}
          </span>
          {/* Priority ladders & multi-condition rules render as a nested outline;
              plain single-sentence rules render inline. Both keep clickable refs. */}
          {structure
            ? <div className="dag-english-text"><RuleTree node={structure} refs={refs} renderRef={renderRef} /></div>
            : <p className="dag-english-text">{renderRuleRich(rule, refs, renderRef)}.</p>}
        </div>
      ) : (
        <p className="dag-english-text muted">
          No declarative rule was rendered for this {kind} field.
        </p>
      )}

      {obligations.length > 0 && (
        <div className="dag-rs-obligations">
          <span className="dag-english-label">Obligations</span>
          <ul className="dag-rs-obl-list">
            {obligations.map((o) => (
              <li key={o.constraintKey} className={`dag-rs-obl dag-rs-obl-${o.severity || "hard"}`}>
                {renderRuleMarkdown(o.markdown)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="dag-formula-hint muted">
        {hasFormula
          ? "This is the same logic the formula encodes, written as a business rule — rendered from the rulebook by the shared RuleSpeak® engine."
          : "Rendered from the rulebook by the shared RuleSpeak® engine."}
      </p>
    </section>
  );
}

function ConsumersSection({
  direct, transitive,
}: {
  direct: FieldNode[];
  transitive: { table: string; field: string }[];
}): JSX.Element {
  const transitiveOnly = transitive.filter(
    (t) => !direct.some((d) => d.table === t.table && d.field === t.field),
  );

  if (direct.length === 0 && transitive.length === 0) {
    return (
      <section className="dag-section">
        <h2 className="dag-section-title">▼ Consumers <span className="dag-count">0</span></h2>
        <p className="muted">Nothing else in the rulebook references this cell yet.</p>
      </section>
    );
  }

  return (
    <section className="dag-section">
      <h2 className="dag-section-title">
        ▼ Consumers
        <span className="dag-count">{direct.length} direct</span>
        {transitiveOnly.length > 0 && (
          <span className="dag-count dag-count-muted">+{transitiveOnly.length} transitive</span>
        )}
      </h2>
      <p className="dag-section-lead muted">Fields whose one-line function calls this one.</p>

      {direct.length > 0 && (
        <div className="dag-pill-row">
          {direct.map((d) => (
            <FieldChip key={`${d.table}.${d.field}`} table={d.table} field={d.field} node={d} variant="pill" />
          ))}
        </div>
      )}

      {transitiveOnly.length > 0 && (
        <details className="dag-transitive">
          <summary>Show {transitiveOnly.length} transitive consumers (downstream of downstream)</summary>
          <div className="dag-pill-row dag-pill-row-faded">
            {transitiveOnly.map((t) => (
              <FieldChip key={`${t.table}.${t.field}`} table={t.table} field={t.field} variant="pill" />
            ))}
          </div>
        </details>
      )}
    </section>
  );
}

function LeavesSection({ leaves }: { leaves: FieldNode[] }): JSX.Element {
  return (
    <section className="dag-section dag-section-leaves">
      <h2 className="dag-section-title">
        ▼ Ground truth at the leaves <span className="dag-count">{leaves.length}</span>
      </h2>
      <p className="dag-section-lead muted">
        Ultimately, this cell&rsquo;s value depends on these raw values. Editing any
        of these and rebuilding propagates here automatically.
      </p>
      <div className="dag-pill-row">
        {leaves.map((l) => (
          <FieldChip key={`${l.table}.${l.field}`} table={l.table} field={l.field} node={l} variant="pill" />
        ))}
      </div>
    </section>
  );
}

// Returned for completeness; not used here since we removed row-value display.
// Kept exported so Phase B's row-value adapter can re-use it.
export function _formatScalar(v: unknown, datatype: string): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  if (typeof v === "number") {
    if (datatype === "number" && Math.abs(v) >= 100) {
      return v.toLocaleString("en-US", { style: "currency", currency: "USD" });
    }
    return v.toLocaleString("en-US");
  }
  if (datatype === "date" && typeof v === "string") {
    return v.slice(0, 10);
  }
  return String(v);
}

// Silence unused-import warning for ReactNode in older TS configs.
type _RN = ReactNode;
