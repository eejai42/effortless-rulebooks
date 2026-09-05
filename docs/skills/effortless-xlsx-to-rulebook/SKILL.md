<!-- DERIVED ARTIFACT — DO NOT EDIT BY HAND -->
<!-- Source: https://raw.githubusercontent.com/EffortlessAPI/effortless-skills/main/skills/effortless-xlsx-to-rulebook/SKILL.md -->
<!-- Mirrored by: docs/skills/clone-skills.sh -->
<!-- Update: cd effortless-platform && effortless clone-skills -->

---
name: effortless-xlsx-to-rulebook
description: >
  Use when authoring or converting an Excel/Google Sheets spreadsheet into an
  effortless-rulebook.json — either by hand (LLM-direct authoring from a sheet
  the user describes or pastes) or via the `xlsx-to-rulebook` transpiler.
  Triggers: "convert this spreadsheet to a rulebook", "turn this Excel sheet
  into a rulebook", "this used to be a spreadsheet", "port this Google Sheet",
  "xlsx-to-rulebook", "why doesn't this formula work in the rulebook", a
  formula that worked in Excel/Sheets failing at `effortless build` time,
  any INDEX/MATCH/VLOOKUP-shaped formula being carried over from a sheet, or
  a column whose cells hold a comma/semicolon-delimited list, a JSON
  blob/object, or any other collapsed sub-graph that should decompose into
  first-class rows/tables.

  **Scope (load gate):** Effortless projects only — project root must contain
  `effortless.json` AND a CLAUDE.md identifying the project as ERB
  methodology. Do NOT load otherwise.
audience: customer
---

# Converting a Spreadsheet Into a Rulebook

A rulebook's formula dialect is **deliberately close to Excel** — same
functions (`IF`, `AND`, `COUNTIFS`, `INDEX`/`MATCH`, etc.), same general
shape (`={{Field}}` references instead of `A1`-style cell refs). That
similarity is a feature: most spreadsheet logic ports over almost verbatim.
But the resemblance stops at the substrate boundary, and the gaps are exactly
where a straight copy-paste from a real spreadsheet breaks. This skill is the
gap list — know these before porting a sheet, not after a failed build.

## The gap that will actually bite you: 1 hop only

**A spreadsheet can chain lookups indefinitely.** `VLOOKUP` into a sheet that
itself `VLOOKUP`s into a third sheet is completely normal Excel/Sheets style
— nobody who built the original spreadsheet was thinking about hop counts.
**A rulebook cannot.** Every `lookup`/`aggregation` field crosses exactly
**one** FK edge, current table to one directly-related table. See
`effortless-schema`'s "Hard limit: 1 hop only" for the mechanical detail and
`effortless-cmcc`'s anti-pattern checklist for why this is load-bearing (it's
the DAG/SDLAF discipline holding, not a missing feature).

**What this looks like when you hit it while porting a sheet:** a formula
like *"look up this row's category, then look up that category's default
price"* is two hops (`Item -> Category -> DefaultPrice`) and will not
transpile as a single formula. Two symptoms, both mean the same thing:
- The build silently produces no function for that field (the transpiler's
  `INDEX/MATCH` parser only recognizes the same-row-FK shape and returns
  null on anything else) — the failure surfaces later, confusingly, as a
  missing-function error in a *different* build step.
- Or the transpiler reports it directly (see the errors.txt convention noted
  in `effortless-publish-tool`/`effortless-pipeline`) instead of failing
  silently, once that reporting is in place.

**The fix is always to flatten, never to force the join:**
1. Add the intermediate fact as its own field on the *middle* table, one hop
   from where it actually lives (`Category.DefaultPrice`, a plain lookup).
2. Reference that new field from the original table, one hop from the middle
   table (`Item.CategoryDefaultPrice`, another plain lookup).

Now two 1-hop fields exist where one imagined 2-hop formula didn't. This is
usually *more* rows of rulebook JSON than the spreadsheet had formula, and
that's fine — SDLAF wants the intermediate fact to be a first-class field,
not something threaded through a query at read time.

## Other Excel → rulebook gaps

| Spreadsheet habit | Rulebook reality |
|---|---|
| `VLOOKUP`/`HLOOKUP`/`XLOOKUP` across arbitrary ranges | Only `INDEX`/`MATCH` in the same-row-FK shape (`MATCH({{LocalFK}}, Table!{{IdField}}, 0)`) is supported — see `effortless-schema`. |
| A1-style cell references (`Sheet2!B7`) | No cell addressing at all. Every reference is a named field: `{{FieldName}}` (same row) or `Table!{{Field}}` (related table, 1 hop). |
| A formula referencing a specific row by position (`OFFSET`, `INDIRECT`, hardcoded row numbers) | Not expressible — rulebook formulas are row-relative and declarative, never positional. Re-derive the value as a `lookup`/`aggregation` keyed by an actual FK relationship instead. |
| Helper columns / scratch sheets used purely to stage an intermediate calculation | This is usually fine — it maps directly to a `calculated` field. The distinction that matters is hop count, not "was this a helper column." |
| Array formulas / `SUMPRODUCT` doing a multi-condition, multi-table rollup in one cell | Only expressible if every condition resolves within 1 hop. If the conditions span 2+ related tables, flatten per the pattern above before writing the formula. |
| Circular references (rare, but some legacy sheets have iterative-calc mode on) | Hard error — the rulebook is a DAG, cycles are never allowed. `effortless-conventions` covers this at the table level too (no many-to-many). |
| Merged cells / formatting-as-data (e.g. color coding meaning something) | Not portable at all — formatting isn't data. If a color means something ("red = overdue"), that's a missing `raw`/`calculated` field the sheet never made explicit; add it. |
| A named range spanning multiple tables' worth of concept (e.g. one "Lookup" tab backing several relationships) | Split it: one rulebook table per real entity. A single junk-drawer lookup tab in Excel usually hides 2–3 real entities once you ask "what is each row actually *of*." |
| A single cell holding a collapsed sub-graph — a comma/semicolon-delimited enum list, a JSON object/array pasted into a cell, a "tags" or "notes" column encoding several facts in one string | Decompose it into first-class rows/tables, same as everything else. See "Collapsed sub-graphs in a single cell" below. |

## Collapsed sub-graphs in a single cell

Spreadsheets have no native way to express "this cell is actually several
related facts," so authors collapse them into one cell by convention instead:
a `Tags` column with `"urgent, needs-review, blocked"`, a `Contacts` column
with `"alice@x.com; bob@x.com"`, a `Metadata` column holding a hand-typed
JSON blob (`{"color":"red","priority":2}`), or a consistently-shaped
mini-record packed into a delimited string. Excel has no opinion on this —
it's just text in a cell. A rulebook does: **SDLAF has no "opaque blob"
primitive.** Schema, Data, Lookups, Aggregations, and Formulas are the whole
vocabulary, and every one of them presupposes the thing being modeled is
already a named field or a named table — not a string a downstream reader
has to re-parse to find the facts hiding inside it. See `effortless-cmcc` for
why: an unparsed delimited list or embedded JSON blob is exactly the kind of
"design-time semantics that didn't factor into SDLAF" the conjecture predicts
shouldn't survive contact with the substrate, because the facts inside it
*are* expressible (they're finite, they're known at design time) — they're
just not yet witnessed as their own rows.

**The fix is the same move as flattening a 2-hop lookup: promote the hidden
structure to a first-class citizen of the DAG.**

- **Delimited enum list in one cell** (`"urgent, needs-review, blocked"` on a
  `Ticket` row) → this is a hidden many-to-many, which means a junction table
  per `effortless-conventions`: a `Tags` table (one row per distinct tag) and
  a `TicketTags` junction table (one row per ticket-tag pairing), never a
  `SPLIT()`-and-hope formula trying to fake set membership out of a string.
- **Consistent JSON object pasted into a cell** (`{"color":"red","priority":2}`
  repeated, same shape, down a column) → each key becomes its own `raw`
  field on the table, or — if the object represents a related concept in its
  own right rather than scalar attributes of the row it's on — its own
  related table with a proper FK back, per the same "what is each row
  actually *of*" test used for junk-drawer lookup tabs.
- **JSON array in a cell** (a list of sub-records, not just scalars) → almost
  always a missed child table. One rulebook row per array element, FK'd back
  to the parent row, the same as any other 1-to-many the sheet never made
  explicit because a single cell was standing in for a whole related table.

The test is always the same one used elsewhere in this skill: **ask what
each hidden piece actually *is*, not how it happens to be encoded.** A
comma-separated list is encoding a set of related rows. A repeated JSON
shape is encoding a table the sheet never got its own tab. Once decomposed,
these are ordinary raw fields, lookups, and relationships — nothing about
them is special after decomposition; the entire fix is refusing to leave
them collapsed.

## Practical porting workflow

1. **Identify the real entities first**, independent of how the sheet is
   laid out. A sheet's tab structure often reflects presentation, not the
   underlying DAG — see `effortless-conventions` for table-naming and
   junction-table guidance (a many-to-many-shaped tab becomes a real junction
   entity, never a raw pivot). This includes entities hiding *inside* a
   single cell, not just across tabs — see "Collapsed sub-graphs in a single
   cell" above.
2. **Port raw columns as `raw` fields, formulas as `calculated`/`lookup`/
   `aggregation` fields**, matching the type table in `effortless-schema`.
3. **For every formula that crosses a table boundary, count the hops before
   transcribing it.** 1 hop: port directly, matching the `INDEX/MATCH` or
   `*IFS` shape. 2+ hops: flatten per the pattern above — this is the single
   most common reason a sheet-to-rulebook port fails a build.
4. **Build, don't assume.** `effortless build` (see `effortless-loop`) is the
   actual arbiter of whether a formula is expressible. A formula that reads
   fine doesn't guarantee the transpiler accepts its shape — verify via
   `effortless-diagnostics`'s view-health check, not by eyeballing the JSON.

## See also

- `effortless-schema` — the formula dialect itself, including the full
  "Hard limit: 1 hop only" rule this skill exists to help you avoid hitting.
- `effortless-conventions` — table/FK/DAG rules that shape how sheet tabs
  become rulebook tables.
- `effortless-cmcc` — why the 1-hop limit is a CMCC/SDLAF discipline, not a
  tooling gap; the anti-pattern checklist covers this alongside other
  violations.
- `effortless-diagnostics` — verifying a freshly-ported rulebook actually
  builds clean (view-health, broken FK targets).
- `effortless-loop` — the edit → build → verify cycle to run after each
  batch of ported tables, rather than porting the whole sheet blind and
  debugging one giant build failure at the end.
