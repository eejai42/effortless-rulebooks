<!-- DERIVED ARTIFACT — DO NOT EDIT BY HAND -->
<!-- Source: /Users/eejai42/.claude/skills/effortless-loop/SKILL.md -->
<!-- Mirrored by: docs/skills/clone-skills.sh -->
<!-- Update: cd effortless-platform && effortless clone-skills -->

---
name: effortless-loop
description: >
  Use whenever the user mentions "the loop", "a turn of the loop", "do a turn",
  "rebuild the rulebook", "update the app to match the rules", or any
  reference to the iterative ERB development cycle.

  Covers TWO distinct workflows, disambiguated inside:
  (1) the BUILD loop — CHANGE-RULE → REBUILD → CONSUME-VIEWS, the cycle that
  makes ERB feel effortless; and
  (2) the INFERENCE loop — "do 5 loops", "do 3 loops", "N loops", "another
  loop", "add higher-order inferences", "add calculated fields", "enrich the
  rulebook". One loop = ONE ORDER of inference applied BREADTH-FIRST across
  EVERY table — never 8 levels deep on one axis while other tables stay raw.
  A loop count ("do 5 loops") always means this second sense.

  Load this skill on first mention so you respond in the right paradigm.

  **Scope (load gate):** Effortless projects only — project root must contain `effortless.json` AND a CLAUDE.md identifying the project as ERB methodology. Do NOT load otherwise.
audience: customer
---

# The Effortless Loop

Also called the Leopold loop, after Ben Leopold, our first beta tester.

The loop is the iterative ERB development cycle — the **core workflow** that makes ERB feel effortless compared to hand-coding without the rulebook (a mode called **"naked Claude"** — every layer of schema, migration, DTO, ORM model, API serializer, and client type written and maintained by hand). When the user mentions the loop in any form, they are invoking this entire mental model — load this skill so you respond in the right paradigm.

> **"Naked Claude"** (used in passing throughout this skill): coding without
> the rulebook — i.e. hand-writing every schema/migration/DTO/serializer
> layer instead of generating them from a single rulebook source. The
> loop's whole purpose is to eliminate that mode.

## Two senses of "loop" — disambiguate FIRST

The word "loop" means one of two different things. Read the sentence and pick:

| The user says | They mean | Go to |
|---|---|---|
| "do a turn of the loop", "rebuild", "push the rule change through", "re-sync" | **Build loop** — propagate the *current* rulebook through every downstream layer | the sections below |
| "do 5 loops", "do 3 loops", "N loops", "another loop", "do a loop of inferences", "add higher-order inferences" | **Inference loop** — enrich the rulebook with N successive *orders* of derived fields | **§ The Inference Loop**, next |

A **count** ("do 5 loops") almost always means the inference loop. A build is
not something you do 5 times in a row.

---

# The Inference Loop (when the user says "do N loops")

**One loop = one complete order of inference applied breadth-first across
EVERY table.** It is *not* one field, and it is *not* one more link on
whichever chain is already deepest.

```
   LOOP 1: add order-1 inferences to EVERY table
           (each derives only from raw fields)
             |
             v
   LOOP 2: add order-2 inferences to EVERY table
           (each derives from order-1 facts produced in loop 1)
             |
             v
   LOOP 3: ... and so on. N loops = N orders, everywhere.
```

## The cardinal rule: breadth before depth

> **Never take one axis 8 levels deep while other tables sit at order 0.**

An 8-deep chain on `SpecSections` next to a `ChannelKinds` table with nothing
but raw columns is a **failed** set of loops, no matter how clever the deep
chain is. The deep chain is over-fitted and the untouched tables are inert
data the DAG cannot reason about.

Before declaring a loop complete, run the balance check (below). If any table
gained nothing this pass, the loop is **not** done — go back and find the
order-N fact that table can support.

## What each loop actually does

For loop N, visit **every table in the rulebook** and ask:

1. **What can this table now know**, given only facts that exist at order N-1?
2. If the answer is "nothing, it has no inputs" — that is the signal a
   **structural fact is missing**, not permission to skip the table. Add the
   raw field or FK that unlocks it (see below), then derive from it.
3. Add 1–3 fields. Resist adding ten; a loop is a thin, wide layer.
4. Label every field's `Description` with its order: `"Order N. ..."`.

## Loop 1 is special: it earns the right to infer

Order-1 fields derive from raw data — so if a table has no usable raw
structure, loop 1 must **create** it. Typical moves:

- **Materialize an implicit FK.** A dotted `SectionNumber` like `7.1.3`
  encodes a parent; a `ParentSection` relationship makes it real. Text that
  names another table's key (`APH_E008` in a requirement) is a latent edge.
- **Decompose a collapsed list.** `AddressingFieldsRaw = "to, cc, bcc"` is a
  sub-graph flattened into a string — at minimum count it; better, normalize it.
- **Promote a hand-asserted flag to a derived one.** A raw `IsTerminal`
  boolean is unverifiable; once transitions are modeled it becomes
  `COUNTIFS(outbound) = 0` and the rulebook can *check* the spec.

## Beware the plausible proxy

When a structural fact is missing, it is tempting to infer it from something
correlated and easy — string length, a substring, an ordinal. These *look*
like inferences and quietly encode noise.

> Real example from this project: `IsDeepCitation = LEN(Citation) > 22`, meant
> to detect deeply-nested sections. But citation length also varies with
> **keyword length**, so `MUST NOT` in a top-level section scored the same as
> `MAY` in a deep one. It fed `ReviewPriority` (which *doubles* on the flag),
> and **82 of 166 requirements — 49% — were classified wrong.** The fix was to
> model the real thing: a `Depth` field parsed from the dotted section number.

**Rule:** if a derived field is a *stand-in* for a structural fact, add the
structural fact instead. Prefer a new raw/FK field in loop 1 over a clever
formula that approximates it.

## The 1-hop rule makes breadth mandatory

Formulas resolve in exactly **one hop** (see `effortless-schema`). A fact two
tables away cannot be reached by a chained formula — it must be
**materialized at each hop** as a first-class field. So "get value X onto
table A" is *inherently* a multi-loop, multi-table job: derive it on B in loop
N, then read it from A in loop N+1. Breadth-first passes are not a style
preference; they are how a 1-hop DAG is built at all.

## Balance check — run this after every loop

Compute each field's order (raw = 0; derived = 1 + max order of its
references) and report the spread per table:

```bash
python3 - <<'EOF'
import json,re,collections
d=json.load(open('effortless-rulebook/effortless-rulebook.json'))
T={k:v for k,v in d.items() if isinstance(v,dict) and 'schema' in v}
nodes={}; deps=collections.defaultdict(set)
for t,v in T.items():
    for f in v['schema']: nodes[(t,f['name'])]=f
for (t,n),f in nodes.items():
    fm=f.get('formula') or ''
    for m in re.finditer(r'(\w+)!\{\{(\w+)\}\}',fm): deps[(t,n)].add((m.group(1),m.group(2)))
    for m in re.finditer(r'\{\{(\w+)\}\}',re.sub(r'\w+!\{\{\w+\}\}','',fm)): deps[(t,n)].add((t,m.group(1)))
print('MISSING:',[ (k,x) for k,ds in deps.items() for x in ds if x not in nodes] or 'none')
memo={}
def order(x):
    if x in memo: return memo[x]
    memo[x]=0; f=nodes[x]
    if f['type']=='raw' or not f.get('formula'): return 0
    o=1+max([order(m) for m in deps[x] if m in nodes] or [0]); memo[x]=o; return o
for t in T:
    os=[order((t,f['name'])) for f in T[t]['schema']]
    print(f'{t:22s} max={max(os)} spread={dict(sorted(collections.Counter(os).items()))}')
EOF
```

Read the output against these **pass/fail criteria**:

- **FAIL — a table's `max` is still 0** after loop 1. It is inert; it has no
  derived facts at all. Fix before moving on.
- **FAIL — `max` spread across tables exceeds ~3 orders.** One axis is
  running away from the rest. Stop deepening it; bring the others up.
- **FAIL — `MISSING` is non-empty.** A formula references a field that does
  not exist; the build will emit nothing for it.
- **PASS** — every table advanced this loop, and the deepest table is within
  ~2–3 orders of the shallowest.

Also confirm **no field is orphaned**: if a loop's fix makes an older field
unreferenced (as rebasing depth did to `CitationLength`), delete it or give it
a consumer. Dead derived fields are misleading.

## Verify, then report honestly

- The DAG must stay **acyclic** and every `RelatedTo` must resolve.
- Run `effortless build`. **A clean build is necessary but not sufficient** —
  on a project whose only transpiler is the rulebook-editor, formulas are not
  compiled to SQL, so syntax errors surface later. Check formula functions
  against the supported list in `effortless-schema` (e.g. `ISNUMBER` is **not**
  supported; use the `LEN`/`SUBSTITUTE` length-delta idiom to test for a substring).
- **Spot-check the values**, not just the syntax. Simulate a few formulas in
  Python against the `data` arrays and confirm the numbers are sensible.
- Where an edge is lossy, **say so in the field `Description`** rather than
  letting a downstream field quietly misreport. A single-valued FK extracted
  from prose that names several targets will drop the extras — document it and
  note the junction table that would fix it.

## Anti-patterns specific to the inference loop

- **Depth-first on the interesting table.** The most common failure. Ask "which
  table gained nothing?" before "what else can this table tell me?"
- **Counting fields instead of orders.** Ten order-1 fields on one table is
  still *one* loop's worth of depth — and zero loops for every other table.
- **Deriving from a field added in the same loop.** That is order N+1 wearing
  loop N's label. Each loop consumes only the *previous* loop's output.
- **Inventing raw data to make an inference possible.** Adding a *derived*
  structural fact (parsing `Depth` out of an existing `SectionNumber`) is
  correct. Fabricating *asserted* values the source document does not state is
  not — extract them from the spec, or leave the table for a later loop and
  say why.

---

# The Build Loop

## The Loop

```
   1. CHANGE THE RULE (once, in the hub — effortless-rulebook.json, the SSoT)
      directly (LLM/hand-edit, the default), or via Airtable/reverse-sync
      if the project opted into one of those as a sibling input spoke.
            |
            v
   2. effortless build  (one command)
            |
            v
   3. EVERY DOWNSTREAM LAYER UPDATES AUTOMATICALLY
      - effortless-rulebook.json (the hub, now updated)
      - postgres/01-05*.sql (tables, functions, views, seed data)
      - ODXML schema
      - C#/Go/Python/etc. base classes, ORM context, sync services
            |
            v
   4. APP CODE (server, client) JUST CONSUMES THE GENERATED VIEWS
      - reads from vw_* views
      - treats calculated fields (e.g. is_stopped) as opaque
      - NEVER reimplements business logic that lives in the rulebook
            |
            v
   5. NEXT TURN OF THE LOOP — repeat from step 1
```

## Why it's "effortless"

A single rule change propagates through every layer with **zero hand-written migrations, DTOs, ORM updates, API serializers, or client types**. The business logic ("a customer is stopped when CurrentColor is Red") lives in **exactly one place** — the rulebook hub → generated SQL function → exposed in the view as `is_stopped`. The app just reads `is_stopped`. If the rule flips ("now Green means stopped"), the loop runs once and *no app code changes*.

Compare to **naked Claude** (defined above — hand-coding every layer): the same change requires editing a migration, seed data, DTO, ORM model, API serializer, client type, and client logic — and probably missing one and shipping a bug. The loop exists specifically to eliminate that class of failure.

## Phrases that mean "do a turn of the loop"

When the user says any of these, they expect the same sequence of actions:

- *"Do a turn of the loop"* / *"Run the loop"* / *"Take a turn"*
- *"Rebuild the rulebook"*
- *"Update the app to match the current rules"*
- *"Re-sync everything"*
- *"Push the rule change through"*
- *"Make the app reflect the new schema"*

All of these mean: **propagate the current rulebook state through every downstream layer, then update only the app's schema-surface code.** (If the project is Airtable-connected, the build pulls Airtable into the rulebook first.)

## What "do a turn of the loop" actually entails

0. **Pre-build: check the tree first.** Run `git status --porcelain` (read-only).
   If non-empty, **pause and ask the user for permission to build** — they may want to commit or stash first
   so the resulting diff cleanly isolates the build output. Do not offer to commit, stash, or `git add`
   anything yourself; the user owns their git state. Once the user gives the go-ahead (or the tree is clean),
   proceed.
1. **Run `effortless build`** from the project root. This is atomic — fire and forget.
   Do NOT read the generated files afterwards. (Ask permission first if your project's CLAUDE.md requires it.)
   **Do NOT commit the output yourself.** The user will commit when they choose to. You may proceed with the
   rest of the loop on the dirty tree the build just produced — but do not run `git add`, `git commit`, or
   any other git write command.
2. **Run `init-db.sh`** if the project has a postgres target — this **drops and recreates the database from scratch** using the freshly generated SQL. This is a full regeneration, not an incremental migration; it's also why ERB local-dev projects don't have a `migrations/` folder. (Bases-hosted DBs are the exception; never run `init-db.sh` against bases.)
3. **Query the rulebook for schema changes** — use a lightweight one-liner to see what
   tables/fields exist now (see `effortless-query`). Do NOT read generated SQL files.
   Or use `psql -c "\d vw_tablename"` to see the current view columns.
   Or — even better — use `git diff -- effortless-rulebook/effortless-rulebook.json` (read-only)
   against the unstaged build output. This is the highest-fidelity view of what changed.
4. **Update the app code only where it touches the schema surface** — column names that changed, new fields the UI now needs to display, removed tables to clean up references to. **Never reimplement** rule logic in the app; consume the calculated fields from the view as opaque truth.
5. **Restart the app** — run `./start.sh` from the project root.

## Always Build After Hub Changes

Whenever the rulebook hub is modified — directly, or via a connected input spoke (Airtable, reverse-sync) — run `effortless build` to propagate the change. Without the build, the generated code is stale and the app drifts out of sync with the hub. The developer is in charge of *when* to build; this skill's role is to make sure the build doesn't get forgotten.

## Things that look like progress but bypass the loop

Each of these "works" in the moment and then quietly costs you later. Knowing
*why* each one fails lets you spot them in disguise.

- **Writing a migration to make a schema change persist.** On local-dev ERB projects, `init-db.sh` drops and recreates the DB on every build — so a migration file / `migrations` tracking table / incremental `ALTER TABLE` would run once and then get wiped on the next build. The change *appears* to stick until the next rebuild. The loop-friendly version: edit the hub → `effortless build`. (Bases-hosted DBs are the one exception, and even there schema still originates in the hub — see `effortless-workflow` and `effortless-bases`.)
- **Reimplementing a rule in the client** — e.g. computing `isStopped = customer.color === 'Red'` in JS instead of reading `customer.is_stopped` from the view. The rule now lives in two places; the next time it changes in the hub, the client silently goes wrong. The loop's whole value is one-place-only.
- **Hand-editing generated files** — `postgres/01-05*.sql`, `dotnet/.../BaseClasses/*.cs`, etc. Edits are fine for testing a hypothesis, but `effortless build` overwrites them. For persistence: edit the hub, or use the `*b-customize-*` files (see `effortless-sql`) for things the hub can't model.
- **Adding columns/fields directly in SQL or C#** — same mechanic. Changes that originate in the hub survive every build; changes in generated files don't.
- **Reasoning from a stale build** — if you've changed the hub since the last `effortless build`, the generated code on disk is out of date. Rebuild before drawing conclusions from it.
- **Skipping the build and editing generated SQL "just this once."** There is no "just this once." The next `effortless build` erases it and the bug returns. The "just this once" framing is itself the tell — if it sounds reasonable, you've already taken the wrong turn. Always go around the loop.
- **Editing an output spoke as if it were the source** — Postgres SQL, Go, Python, OWL, XLSX are *outputs*. The hub is `effortless-rulebook.json`. Edits to outputs are ephemeral by design.

## See also

- `effortless-orchestrator` — the big-picture mental model; references this skill for the loop itself.
- `effortless-workflow` — editing the hub directly (default) vs. an optional connected input spoke.
- `effortless-pipeline` — the mechanics of `effortless build` itself.
- `effortless-airtable` / `effortless-airtable-omni` — *how* to make the rule change via the Airtable spoke, only if the project opted in. For rulebook-direct (the default), just edit the JSON.
- `effortless-sql` — verifying step 3's generated output and using `*b-customize-*` overrides correctly.

## TL;DR for future-you

If the user says "the loop" and you're not sure what to do: **load this skill, then run a turn of it.** Don't ask the user to explain. The loop is a workflow, not a string.
