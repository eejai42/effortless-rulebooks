// One table, all its columns. Each column shows its type, a one-line explanation
// (the formula's English, or its RuleSpeak® rule — following the global toggle),
// and links into that column's full DAG page. Reached by clicking a table name
// anywhere, or from the tables index.

import { useMemo } from "react";
import type { ReactNode } from "react";
import {
  tableColumns,
  tableDescription,
  tableExists,
} from "../lib/dagResolver.ts";
import type { FieldNode } from "../lib/types.ts";
import { humanizeField, renderEnglish } from "../lib/renderEnglish.ts";
import { tryParseFormula } from "../lib/formula.ts";
import { ruleSpeakForField, renderRuleMarkdown } from "../lib/rulespeak.ts";
import { useDocElements, useDocElementClasses } from "../lib/dagPrefs.ts";
import {
  RoutingContext,
  mergeRouting,
  useFieldLink,
  useTableLink,
} from "../lib/routingContext.tsx";
import type { ExplainerDagRouting } from "../lib/routingContext.tsx";
import { TypeBadge, typeTone } from "../components/TypeBadge.tsx";
import { ExplainerHeader } from "../components/ExplainerHeader.tsx";

export interface TablePageProps {
  table: string;
  routing?: ExplainerDagRouting;
}

export function TablePage({ table, routing }: TablePageProps): JSX.Element {
  const merged = useMemo(() => mergeRouting(routing), [routing]);
  return (
    <RoutingContext.Provider value={merged}>
      <TablePageInner table={table} />
    </RoutingContext.Provider>
  );
}

function TablePageInner({ table }: { table: string }): JSX.Element {
  const exists = useMemo(() => tableExists(table), [table]);
  const columns = useMemo(() => (exists ? tableColumns(table) : []), [exists, table]);
  const description = useMemo(() => (exists ? tableDescription(table) : ""), [exists, table]);
  // `show-<key>` classes so each column's one-line explanation reflects the gear.
  const pageClasses = useDocElementClasses();

  if (!exists) {
    return (
      <div className="dag-page">
        <ExplainerHeader crumbs={[{ index: true }, table]} />
        <div className="muted">Table “{table}” not found in the rulebook.</div>
      </div>
    );
  }

  const derived = columns.filter(
    (c) => c.type === "calculated" || c.type === "lookup" || c.type === "aggregation",
  ).length;

  return (
    <div className={`dag-page ${pageClasses}`}>
      <ExplainerHeader crumbs={[{ index: true }, table]} />

      <header className="dag-hero dag-hero-calc">
        <div className="dag-hero-meta">
          <span className="dag-pill">{columns.length} columns</span>
          {derived > 0 && <span className="dag-pill dag-pill-calc">{derived} derived</span>}
        </div>
        <h1 className="dag-title">{table}</h1>
        <p className="dag-subtitle">
          <span className="dag-subtitle-human">{humanizeField(table)}</span>
        </p>
        {description && <p className="dag-description">{description}</p>}
      </header>

      <section className="dag-section">
        <h2 className="dag-section-title">
          ▼ Columns <span className="dag-count">{columns.length}</span>
        </h2>
        <p className="dag-section-lead muted">
          Click any column to trace how it is computed, down to ground truth.
        </p>
        <div className="dag-col-list">
          {columns.map((c) => (
            <ColumnRow key={`${c.table}.${c.field}`} node={c} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ColumnRow({ node }: { node: FieldNode }): JSX.Element {
  // The column line is a single one-liner, so it shows the FIRST enabled narration
  // in the gear (rulespeak → english → formula → description), then falls back to a
  // structural note. This keeps the row compact while still reflecting the gear.
  const docs = useDocElements();
  const FieldLink = useFieldLink();
  const TableLink = useTableLink();
  const tone = typeTone(node.type);
  const isRel = node.type === "relationship" && !!node.relatedTo;

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

  const explanation: ReactNode = (() => {
    if (docs.rulespeak && ruleSpeak?.rule) {
      return <span className="dag-col-rule dag-col-rulespeak">{renderRuleMarkdown(ruleSpeak.rule)}.</span>;
    }
    if (docs.english && english) return <span className="dag-col-rule">{english}.</span>;
    if (docs.formula && node.formula) return <span className="dag-col-rule dag-col-formula"><code>{node.formula}</code></span>;
    if (docs.desc && node.description) return <span className="dag-col-desc">{node.description}</span>;
    // Structural fallback so a row is never blank when its preferred element is off.
    if (ruleSpeak?.rule)
      return <span className="dag-col-rule dag-col-rulespeak">{renderRuleMarkdown(ruleSpeak.rule)}.</span>;
    if (english) return <span className="dag-col-rule">{english}.</span>;
    if (node.description) return <span className="dag-col-desc">{node.description}</span>;
    if (node.type === "raw")
      return <span className="dag-col-desc muted">Ground truth · datatype {node.datatype}</span>;
    if (node.type === "relationship")
      return <span className="dag-col-desc muted">Relationship</span>;
    return null;
  })();

  const head = (
    <span className="dag-col-head">
      <TypeBadge type={node.type} size="sm" />
      <span className="dag-col-name">{node.field}</span>
      <span className="dag-col-human">{humanizeField(node.field)}</span>
      {node.nullable && <span className="dag-pill dag-pill-muted dag-col-null">nullable</span>}
    </span>
  );

  // Relationship columns get a sibling link to the table they point at — kept
  // OUTSIDE the field anchor (anchors can't legally nest). The field link still
  // drills into the relationship cell's own DAG page; the chip jumps to the
  // related table's page.
  if (isRel) {
    return (
      <div className={`dag-col dag-col-rel-wrap dag-col-${tone}`}>
        <FieldLink table={node.table} field={node.field} className="dag-col-rel-main">
          {head}
          {explanation}
        </FieldLink>
        <TableLink table={node.relatedTo as string} className="dag-col-rel-target">
          → {node.relatedTo}
        </TableLink>
      </div>
    );
  }

  return (
    <FieldLink table={node.table} field={node.field} className={`dag-col dag-col-${tone}`}>
      {head}
      {explanation}
    </FieldLink>
  );
}
