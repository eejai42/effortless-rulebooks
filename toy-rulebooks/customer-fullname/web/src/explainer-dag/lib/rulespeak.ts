// Thin accessor over the baked RuleSpeak® data (embedded-rulespeak.ts).
//
// The rule SENTENCES themselves are produced at transpile time by the shared
// rulebook-rulespeak-core C# engine — the SAME engine rulebook-to-rulespeak uses
// to render its markdown document. Nothing here re-derives rule logic; this file
// only looks the pre-rendered strings up by "Table.Field" and lets the FieldDag
// page render them when the user toggles narration to RuleSpeak® mode.

import {
  rulespeakFields,
  rulespeakObligations,
  rulespeakStructural,
} from "../embedded-rulespeak.ts";
import type {
  RuleSpeakFieldRule,
  RuleSpeakObligation,
  RuleSpeakRef,
  RuleNode,
} from "../embedded-rulespeak.ts";

export type { RuleSpeakFieldRule, RuleSpeakObligation, RuleSpeakRef, RuleNode };

// The definitional RuleSpeak® rule for one derived field, or null if the field is
// raw / a relationship / otherwise has no rendered rule.
export function ruleSpeakForField(
  table: string,
  field: string,
): RuleSpeakFieldRule | null {
  return rulespeakFields[`${table}.${field}`] ?? null;
}

// Deontic obligations (must / must not / should) whose Entity resolves to `table`.
// Empty until the rulebook gains a Constraints table.
export function obligationsForEntity(table: string): RuleSpeakObligation[] {
  if (!rulespeakObligations.length) return [];
  // Constraints declare Entity as a (possibly pluralized / humanized) name; match
  // leniently against the table's name so authors aren't forced into one spelling.
  const norm = (s: string) => s.replace(/[^a-z0-9]/gi, "").toLowerCase();
  const singular = (s: string) => s.replace(/ies$/i, "y").replace(/s$/i, "");
  const target = norm(singular(table));
  return rulespeakObligations.filter(
    (o) => norm(singular(o.entity)) === target,
  );
}

// Obligations that specifically key on this field (Predicate === field) — the
// strongest tie between a DAG node and an operative rule.
export function obligationsForField(
  table: string,
  field: string,
): RuleSpeakObligation[] {
  return obligationsForEntity(table).filter((o) => o.predicate === field);
}

// Structural "must"-rules (required fields / FKs) implied for a table.
export function structuralRulesForTable(table: string): string[] {
  return rulespeakStructural[table] ?? [];
}

// Render the inline markdown emphasis our rule strings use (**bold**, *italic*)
// into React nodes — small + dependency-free so the explainer stays self-contained.
// Recognizes the RuleSpeak® keywords we bold (must / must not / should / only if).
import type { ReactNode } from "react";
import { Fragment, createElement } from "react";

export function renderRuleMarkdown(md: string): ReactNode {
  // Split on **…** and *…* runs, keeping the delimiters' content.
  const parts: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(md)) !== null) {
    if (m.index > last) parts.push(md.slice(last, m.index));
    if (m[1] !== undefined) {
      parts.push(createElement("strong", { key: key++, className: "dag-rs-kw" }, m[1]));
    } else if (m[2] !== undefined) {
      parts.push(createElement("em", { key: key++ }, m[2]));
    }
    last = re.lastIndex;
  }
  if (last < md.length) parts.push(md.slice(last));
  return createElement(Fragment, null, ...parts);
}

// ── Linkify field references inside rendered prose ──────────────────────────
//
// The RuleSpeak® rule (and its English transliteration) is plain prose, but every
// field it mentions appears with the SAME humanized label the engine baked into
// `refs`. We linkify by scanning the text for those exact labels as whole-word
// substrings (LONGEST label first, so "client readiness avg" wins over "client"),
// and hand each match to `renderRef` — which the page turns into a drill-in chip.
//
// `renderRef(ref, text, key)` returns the node for one matched reference.
export function linkifyText(
  text: string,
  refs: RuleSpeakRef[],
  renderRef: (ref: RuleSpeakRef, matched: string, key: number) => ReactNode,
): ReactNode {
  if (!refs.length || !text) return text;
  // Longest labels first so a longer label isn't pre-empted by a shorter substring.
  const sorted = [...refs]
    .filter((r) => r.label && r.label.length > 0)
    .sort((a, b) => b.label.length - a.label.length);
  if (!sorted.length) return text;

  const out: ReactNode[] = [];
  let rest = text;
  let key = 0;
  // Greedy left-to-right scan: at each position, take the earliest match among all
  // labels; ties broken by longest (sorted order). Avoids overlapping replacements.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let bestIdx = -1;
    let bestRef: RuleSpeakRef | null = null;
    for (const r of sorted) {
      const idx = indexOfWord(rest, r.label);
      if (idx >= 0 && (bestIdx === -1 || idx < bestIdx)) {
        bestIdx = idx;
        bestRef = r;
        if (idx === 0) break; // can't do better than position 0
      }
    }
    if (bestIdx === -1 || !bestRef) {
      out.push(rest);
      break;
    }
    if (bestIdx > 0) out.push(rest.slice(0, bestIdx));
    const matched = rest.slice(bestIdx, bestIdx + bestRef.label.length);
    out.push(renderRef(bestRef, matched, key++));
    rest = rest.slice(bestIdx + bestRef.label.length);
  }
  return createElement(Fragment, null, ...out);
}

// Whole-word, case-insensitive index of `needle` in `hay` (word boundaries so
// "rate" doesn't match inside "rating"). Returns -1 if not found.
function indexOfWord(hay: string, needle: string): number {
  const lc = hay.toLowerCase();
  const target = needle.toLowerCase();
  let from = 0;
  while (from <= lc.length - target.length) {
    const idx = lc.indexOf(target, from);
    if (idx < 0) return -1;
    const before = idx === 0 ? "" : lc[idx - 1];
    const after = idx + target.length >= lc.length ? "" : lc[idx + target.length];
    const boundaryBefore = before === "" || !/[a-z0-9]/i.test(before);
    const boundaryAfter = after === "" || !/[a-z0-9]/i.test(after);
    if (boundaryBefore && boundaryAfter) return idx;
    from = idx + 1;
  }
  return -1;
}

// Render a rule string with BOTH markdown emphasis AND clickable field refs.
// Markdown is split first; ref-linkification runs inside the plain-text segments
// (emphasis runs like "**must**" are keywords, never field names, so they're left
// alone). `renderRef` is supplied by the page (→ a FieldChip).
export function renderRuleRich(
  md: string,
  refs: RuleSpeakRef[],
  renderRef: (ref: RuleSpeakRef, matched: string, key: number) => ReactNode,
): ReactNode {
  const parts: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  const pushText = (s: string) => {
    if (s) parts.push(createElement(Fragment, { key: `t${key++}` }, linkifyText(s, refs, renderRef)));
  };
  while ((m = re.exec(md)) !== null) {
    if (m.index > last) pushText(md.slice(last, m.index));
    if (m[1] !== undefined) {
      parts.push(createElement("strong", { key: `k${key++}`, className: "dag-rs-kw" }, m[1]));
    } else if (m[2] !== undefined) {
      parts.push(createElement("em", { key: `e${key++}` }, m[2]));
    }
    last = re.lastIndex;
  }
  if (last < md.length) pushText(md.slice(last));
  return createElement(Fragment, null, ...parts);
}
