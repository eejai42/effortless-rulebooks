// AST → plain-English sentence. The goal is that the rendered sentence reads
// like the business rule. We aggressively pattern-match common shapes
// (IF / SUMIFS / COUNTIFS / AND / OR / NOT / comparisons / arithmetic) and
// fall back to a generic functional description otherwise.

import type { Node, BinOp } from "./formula.ts";

export interface RenderCtx {
  // Convert a ref to its human form. Default: just the field name.
  refLabel?(table: string | null, field: string): string;
}

const defaultRefLabel = (_table: string | null, field: string) => humanizeField(field);

export function renderEnglish(node: Node, ctx: RenderCtx = {}): string {
  const refLabel = ctx.refLabel ?? defaultRefLabel;
  const sentence = render(node, { refLabel }, true);
  return capitalize(sentence.trim());
}

function render(node: Node, ctx: Required<RenderCtx>, top: boolean): string {
  switch (node.kind) {
    case "ref":
      return ctx.refLabel(node.table, node.field);
    case "num":
      return formatNumber(node.value);
    case "str":
      return `"${node.value}"`;
    case "bool":
      return node.value ? "yes" : "no";
    case "unary":
      return `negative ${render(node.arg, ctx, false)}`;
    case "binop":
      return renderBinop(node.op, node.left, node.right, ctx, top);
    case "call":
      return renderCall(node, ctx, top);
  }
}

function renderBinop(
  op: BinOp,
  left: Node,
  right: Node,
  ctx: Required<RenderCtx>,
  top: boolean,
): string {
  const l = render(left, ctx, false);
  const r = render(right, ctx, false);
  switch (op) {
    case "+": return parenthesize(`${l} plus ${r}`, top);
    case "-": return parenthesize(`${l} minus ${r}`, top);
    case "*": return parenthesize(`${l} times ${r}`, top);
    case "/": return parenthesize(`${l} divided by ${r}`, top);
    case "&": return parenthesize(`${l} joined with ${r}`, top);
    case "=":
      // Differentiate equality on strings ("is") from numeric equality
      if (right.kind === "str") return `${l} is ${r}`;
      return `${l} equals ${r}`;
    case "<>": return `${l} is not ${r}`;
    case "<":  return `${l} is less than ${r}`;
    case ">":  return `${l} is greater than ${r}`;
    case "<=": return `${l} is at most ${r}`;
    case ">=": return `${l} is at least ${r}`;
  }
}

function renderCall(node: Extract<Node, { kind: "call" }>, ctx: Required<RenderCtx>, top: boolean): string {
  const fn = node.fn;
  const args = node.args;

  // ── IF(cond, then, else) ────────────────────────────────────────────
  if (fn === "IF" && args.length >= 2) {
    const cond = args[0];
    const t = args[1];
    const f = args.length >= 3 ? args[2] : null;
    const tIsTrue = isBoolLiteral(t, true);
    const fIsFalse = f == null || isBoolLiteral(f, false);
    const tIsFalse = isBoolLiteral(t, false);
    const fIsTrue = f != null && isBoolLiteral(f, true);
    // Common pattern: =IF(condition, TRUE, FALSE) → just the condition.
    if (tIsTrue && fIsFalse) return `true when ${render(cond, ctx, false)}`;
    if (tIsFalse && fIsTrue) return `true when not ${render(cond, ctx, false)}`;
    // Otherwise: full if/else sentence.
    if (f == null) return `if ${render(cond, ctx, false)} then ${render(t, ctx, false)}`;
    return `if ${render(cond, ctx, false)} then ${render(t, ctx, false)}, otherwise ${render(f, ctx, false)}`;
  }

  // ── SUMIFS(target, key1, val1, key2, val2, ...) ─────────────────────
  if (fn === "SUMIFS" && args.length >= 1) {
    return renderRollup("sum of", args[0], args.slice(1), ctx);
  }

  // ── COUNTIFS(key1, val1, key2, val2, ...) ───────────────────────────
  if (fn === "COUNTIFS") {
    // No explicit target — the first key arg's table is what we're counting.
    return renderCountIfs(args, ctx);
  }

  // ── AVERAGEIFS(target, key, val, ...) ───────────────────────────────
  if (fn === "AVERAGEIFS" && args.length >= 1) {
    return renderRollup("average", args[0], args.slice(1), ctx);
  }

  // ── MINIFS / MAXIFS ─────────────────────────────────────────────────
  if ((fn === "MINIFS" || fn === "MAXIFS") && args.length >= 1) {
    const verb = fn === "MINIFS" ? "smallest" : "largest";
    return renderRollup(verb, args[0], args.slice(1), ctx);
  }

  // ── INDEX(T!{{X}}, MATCH({{K}}, T!{{Name}}, 0))  ── classic lookup ──
  // A lookup reads as "the <targetField> of the linked <thing>", naming the related
  // entity by the FK field that points at it (the relationship), never as a "row".
  if (fn === "INDEX" && args.length === 2 && args[0].kind === "ref"
      && args[1].kind === "call" && args[1].fn === "MATCH"
      && args[1].args.length >= 2) {
    const target = args[0]; // T!{{X}}
    const match = args[1];
    const key = match.args[0];
    const fieldName = ctx.refLabel(target.table, target.field);
    // Prefer naming the related thing by the FK field (the relationship name), e.g.
    // INDEX(Jurisdictions!State, MATCH(Clients!Jurisdiction, …)) → "the state of the
    // linked jurisdiction". Fall back to the singular target table, then "linked record".
    if (key.kind === "ref") {
      const linked = humanizeField(key.field);
      return `the ${fieldName} of the linked ${linked}`;
    }
    const linked = target.table ? singularize(humanizeField(target.table)) : "linked record";
    return `the ${fieldName} of the linked ${linked}`;
  }

  // ── AND / OR / NOT ──────────────────────────────────────────────────
  if (fn === "AND" && args.length > 0) {
    return joinList(args.map((a) => render(a, ctx, false)), "and");
  }
  if (fn === "OR" && args.length > 0) {
    return joinList(args.map((a) => render(a, ctx, false)), "or");
  }
  if (fn === "NOT" && args.length === 1) {
    return `not ${render(args[0], ctx, false)}`;
  }
  if (fn === "XOR" && args.length === 2) {
    return `exactly one of ${render(args[0], ctx, false)} or ${render(args[1], ctx, false)}`;
  }

  // ── String functions ────────────────────────────────────────────────
  if (fn === "LOWER" && args.length === 1) return `${render(args[0], ctx, false)} lowercased`;
  if (fn === "UPPER" && args.length === 1) return `${render(args[0], ctx, false)} uppercased`;
  if (fn === "TRIM" && args.length === 1) return `${render(args[0], ctx, false)} with surrounding whitespace removed`;
  if (fn === "LEN" && args.length === 1) return `the length of ${render(args[0], ctx, false)}`;
  if (fn === "CONCAT" || fn === "CONCATENATE") {
    return joinList(args.map((a) => render(a, ctx, false)), "joined with");
  }
  if (fn === "SUBSTITUTE" && args.length >= 3) {
    return `${render(args[0], ctx, false)} with “${unquote(render(args[1], ctx, false))}” replaced by “${unquote(render(args[2], ctx, false))}”`;
  }
  if (fn === "LEFT" && args.length >= 2) return `the first ${render(args[1], ctx, false)} characters of ${render(args[0], ctx, false)}`;
  if (fn === "RIGHT" && args.length >= 2) return `the last ${render(args[1], ctx, false)} characters of ${render(args[0], ctx, false)}`;
  if (fn === "MID" && args.length >= 3) return `${render(args[1], ctx, false)} characters of ${render(args[0], ctx, false)} starting at position ${render(args[2], ctx, false)}`;

  // ── Math/numeric ────────────────────────────────────────────────────
  if (fn === "ABS" && args.length === 1) return `the absolute value of ${render(args[0], ctx, false)}`;
  if (fn === "ROUND" && args.length >= 1) {
    const digits = args[1] ? `to ${render(args[1], ctx, false)} decimal places` : "to the nearest whole number";
    return `${render(args[0], ctx, false)} rounded ${digits}`;
  }
  if (fn === "FLOOR" && args.length >= 1) return `${render(args[0], ctx, false)} rounded down`;
  if (fn === "CEILING" && args.length >= 1) return `${render(args[0], ctx, false)} rounded up`;
  if (fn === "MIN") return `the smallest of ${joinList(args.map((a) => render(a, ctx, false)), "and")}`;
  if (fn === "MAX") return `the largest of ${joinList(args.map((a) => render(a, ctx, false)), "and")}`;
  if (fn === "SUM") return `the sum of ${joinList(args.map((a) => render(a, ctx, false)), "and")}`;
  if (fn === "AVERAGE") return `the average of ${joinList(args.map((a) => render(a, ctx, false)), "and")}`;

  // ── Null/blank handling ─────────────────────────────────────────────
  if (fn === "ISBLANK" && args.length === 1) return `${render(args[0], ctx, false)} is blank`;
  if (fn === "ISERROR" && args.length === 1) return `${render(args[0], ctx, false)} has an error`;
  if (fn === "IFERROR" && args.length >= 2) {
    return `${render(args[0], ctx, false)}, or ${render(args[1], ctx, false)} if that has an error`;
  }
  if (fn === "COALESCE") {
    return `the first of ${joinList(args.map((a) => render(a, ctx, false)), "or")} that isn't blank`;
  }

  // ── Date functions ──────────────────────────────────────────────────
  if (fn === "TODAY" && args.length === 0) return "today";
  if (fn === "NOW" && args.length === 0) return "now";
  if (fn === "DATEDIFF" && args.length >= 2) {
    const unit = args[2] ? unquote(render(args[2], ctx, false)) : "days";
    return `the ${unit} between ${render(args[0], ctx, false)} and ${render(args[1], ctx, false)}`;
  }
  if (fn === "DATEADD" && args.length >= 3) {
    const unit = unquote(render(args[2], ctx, false));
    return `${render(args[1], ctx, false)} ${unit} after ${render(args[0], ctx, false)}`;
  }

  // ── Fallback: <fn>(args) read literally ─────────────────────────────
  const literal = `${fn.toLowerCase()}(${args.map((a) => render(a, ctx, false)).join(", ")})`;
  return literal;
}

// "Sum of <target> across all <T> whose <Key> is <Val>, and <Key> is <Val>, ..."
// Target is a ref like Accounts!{{CurrentBalance}}; its table tells us what
// we're rolling up over. Condition keys with the same table prefix get that
// prefix stripped (already implied by "across all <T>").
function renderRollup(
  verb: string,
  target: Node,
  pairs: Node[],
  ctx: Required<RenderCtx>,
): string {
  const targetLabel = render(target, ctx, false);
  const rollupTable = target.kind === "ref" ? target.table : null;
  const condBody = renderConditionPairs(pairs, ctx, rollupTable);
  if (rollupTable) {
    return condBody
      ? `${verb} ${targetLabel} across all ${rollupTable} whose ${condBody}`
      : `${verb} ${targetLabel} across all ${rollupTable}`;
  }
  return condBody ? `${verb} ${targetLabel} where ${condBody}` : `${verb} ${targetLabel}`;
}

// COUNTIFS — the first key's table is what we're counting.
function renderCountIfs(args: Node[], ctx: Required<RenderCtx>): string {
  if (args.length === 0) return "count of matching records";
  const firstKey = args[0];
  const table = firstKey.kind === "ref" ? firstKey.table : null;
  const condBody = renderConditionPairs(args, ctx, table);
  if (table) {
    return condBody
      ? `count of ${table} whose ${condBody}`
      : `count of ${table}`;
  }
  return condBody ? `count of matching records where ${condBody}` : "count of matching records";
}

// Render alternating (key, val) pairs. If `dropTable` matches the key's
// table, strip it (the outer phrase already says "across all <T>").
// {{Name}} as a value is the primary-key self-reference → "this one"
// (the subject itself — never described as a "row").
function renderConditionPairs(
  args: Node[],
  ctx: Required<RenderCtx>,
  dropTable: string | null,
): string | null {
  if (args.length === 0) return null;
  const pairs: string[] = [];
  for (let i = 0; i + 1 < args.length; i += 2) {
    const key = args[i];
    const val = args[i + 1];
    const keyLabel = key.kind === "ref" && key.table && key.table === dropTable
      ? ctx.refLabel(null, key.field)
      : render(key, ctx, false);
    const valLabel = val.kind === "ref" && val.table === null && val.field === "Name"
      ? "this one"
      : render(val, ctx, false);
    pairs.push(`${keyLabel} is ${valLabel}`);
  }
  if (pairs.length === 0) return null;
  return joinList(pairs, "and");
}

function joinList(items: string[], conj: string): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conj} ${items[1]}`;
  return items.slice(0, -1).join(", ") + `, ${conj} ${items[items.length - 1]}`;
}

function isBoolLiteral(n: Node, value: boolean): boolean {
  return n.kind === "bool" && n.value === value;
}

function parenthesize(s: string, top: boolean): string {
  return top ? s : `(${s})`;
}

function unquote(s: string): string {
  return s.replace(/^"(.*)"$/, "$1");
}

function formatNumber(n: number): string {
  // Money-ish if large; bare integer if integer; decimal otherwise.
  if (Number.isInteger(n) && Math.abs(n) >= 1000) {
    return n.toLocaleString("en-US");
  }
  return String(n);
}

function capitalize(s: string): string {
  if (!s) return s;
  return s[0].toUpperCase() + s.slice(1);
}

// "CumulativeBalance" → "cumulative balance" — used by default refLabel.
export function humanizeField(field: string): string {
  return field
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .toLowerCase();
}

// Naive depluralization for naming a related thing from its table name, so a
// lookup reads "the state of the linked jurisdiction" rather than "...jurisdictions".
// Mirrors the RuleSpeak® engine's Singular() just enough for table names.
function singularize(term: string): string {
  if (!term) return term;
  if (/ies$/i.test(term)) return term.replace(/ies$/i, "y");
  if (/(ses|xes|zes)$/i.test(term)) return term.slice(0, -2);
  if (/s$/i.test(term) && !/ss$/i.test(term)) return term.slice(0, -1);
  return term;
}
