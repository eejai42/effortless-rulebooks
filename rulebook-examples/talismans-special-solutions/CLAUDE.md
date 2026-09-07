# Talisman's Special Solutions — Effortless Project

<!-- rulebook-authoritative-banner -->
## Authoritative Source: `effortless-rulebook/talismans-special-solutions-rulebook.json` is HEAD

For this project, **`effortless-rulebook/talismans-special-solutions-rulebook.json` is the single, authoritative source of truth.** Edit it directly. All other artifacts (Postgres SQL, Python, Go, Excel, OWL, etc.) are mechanically derived from it via `effortless build`.

### Rulebook-first: no Airtable in this project

This is a **rulebook-first** project. There is no Airtable base, no `airtabletorulebook` transpiler, and no `rulebooktoairtable` reverse-sync. The rulebook JSON is the one and only source of truth. Edit it directly. There is nothing to pull from or push to — the file IS the spec.

**Rule for Claude / any agent operating in this project:** do not suggest, add, or invoke any Airtable transpilers or sync commands. This project does not use Airtable at any layer.
### Never silently revert `talismans-special-solutions-rulebook.json`

**Treat `effortless-rulebook/talismans-special-solutions-rulebook.json` as sacred.** It contains human-authored business rules and CANNOT be casually overwritten. Before running any command that could touch this file — `effortless build`, `effortless airtabletorulebook`, any transpiler that writes to it, any sync script, any `git checkout`/`git restore` against it — first run `git status` / `git diff` on it.

- If the file has uncommitted changes that you (the agent) did NOT just make this turn, **stop**. Ask the user before proceeding.
- It is only acceptable to let a regeneration touch this file when you are certain the *only* uncommitted edits in it are ones you just made in the current turn.
- This applies to every `**/effortless-rulebook/talismans-special-solutions-rulebook.json` in this repo, not just the project-local one.

There is no upstream to "restore from." The JSON is the upstream.

<!-- /rulebook-authoritative-banner -->

This folder is a **self-contained Effortless Rulebook (ERB) project**. The rulebook is the single source of truth. All other artifacts (Postgres, Python, Go, substrates) are mechanically derived from it.

## Aim for RIGHT — always most faithful to the original 4-part series

The North Star for this demo is **fidelity to Jessica Talisman's *Intentional Arrangement* 4-part
series** (the NTWF workflow ontology). When something is ambiguous, the tie-breaker is not "what is
easiest to ship" or "what makes the badge green" — it is **"what is most faithful to the article."**
Always aim for *right*. Do not paper over a gap with a plausible-looking patch; fix the underlying
model so it actually tells the article's story.

### Every entity a competency question references MUST be materialized in the UI

A competency question is only honestly "answered" when the **thing it talks about is visible on the
board.** CQ8 asks *"what datasets does the review consume, and which AI processed them?"* — so the
**dataset must be a real, named node a user can see** (in the Graph lens, attached to its consuming
step and the AI agent), not a phantom that lives only inside the CQ card's answer string. If a CQ
references an entity (a dataset, an artifact, a gate, a role) that is **drawn nowhere**, that is a
bug: the "simulate" button mutates something invisible, so the user sees nothing change and cannot
reason about the failure. The fix is to **materialize the entity**, not to tweak the button.

Concrete checklist when adding or repairing a CQ + its Simulate scenario:

1. **Materialize** every entity the CQ names as a visible node/chip/row in at least one lens.
2. **Make the simulate a visible cut** — the edit must change something the user can *watch* move
   (an edge breaks, a node orphans, a badge flips), not just a string deep in a disclosure.
3. **Encode the real expectation in the resolver** — pass/fail must mean the question's actual
   answer holds. Beware vacuously-true checks (`[].every(...)` is `true`): "no datasets consumed"
   must read **red**, not green.
4. **Edit the authoritative side of an inverse pair.** For an `owl:inverseOf` relationship the
   reasoner asserts BOTH sides, so clearing only one side is re-derived (resurrected) from the
   other and the simulate "does nothing." Either clear BOTH sides, or (preferred) make the back-ref
   derived-only (`DERIVED_INVERSE_BACKREFS` in `app/backend/reasoner/abox_from_json.py`, the
   `fromDelegatesTo`/`consumedBySteps` pattern) so the single forward FK is the editable source.

## All seed data is MOCK data. Every build resets it. That is the whole point.

There is **no "production vs. non-production" data** in this rulebook. *Everything* in the `data`
arrays is mock/demo data. The seed data is not "test data sitting next to real data" — it is the
authoritative content of the domain, and the dev database is a clean slate on every build.

- The dev Postgres bootstrap runs with `drop_all=true` (`mode=drop-all`, `stage=dev` — see
  `effortless.json` and `postgres-bootstrap/reset-rulebook-db.sh`). So **`reset-rulebook-db.sh` drops and recreates
  everything, then reloads exactly the rulebook seed data**, on every `effortless build`. Nothing
  you typed into the dev DB by hand survives a build — and that is intended.
- The **only** difference between this dev instance and a hypothetical production instance is the
  destructive reset: in production you would **add** rows (no drop); here you **drop and reload**.
  The same rulebook, the same mock rows, could legitimately exist in production as starter / training
  data. There is nothing "fake" about it that production would reject.
- **Corollary: no rulebook seed row is "sacred" in the way the *file* is.** The file (its rules and
  structure) is sacred — see the banner above; never silently revert it. But the *rows* exist to
  tell a story, and curating them (adding, removing, or rewriting mock rows to tell a better,
  complete, tip-to-tail story) is normal, expected work — not data loss. Do not preserve junk or
  filler rows out of misplaced caution. The "perfect" seed data is the data that tells the whole
  story: every class, every property, every state, exercised by real connected rows.

If you ever feel tempted to write a migration, an `ALTER TABLE`, or a "preserve existing data"
guard for the dev DB, stop: the dev DB is regenerated from the rulebook from scratch every build.
Edit the rulebook and rebuild.

## What This Demonstrates

This rulebook models **NTWF** — the workflow ontology from Jessica Talisman's *Intentional
Arrangement* series — as **one curated worked example**, the *Production Deployment Workflow*:

- **Role–agent separation (Heuristic 2)**: steps assign to Roles; Roles are filled by exactly one
  agent (human, AI, or pipeline). Personnel/model changes are one edge, not a rewrite.
- **Three disjoint agent types**: `HumanAgents`, `AIAgents`, `AutomatedPipelines` (mutually disjoint).
- **Approval gate as a step subtype**: `ApprovalGates` specializes a `WorkflowStep` via a 1:1 FK —
  a real subtype, not a collapsed node.
- **First-class step→step ordering**: `StepPrecedence` edges model the transitive `precedesStep`
  (4 asserted edges → 10-pair closure, including the never-asserted 1→5).
- **Delegation/escalation chain**: `Roles.DelegatesTo` (Release Manager → VP Engineering → CTO).
- **PROV provenance + DCAT datasets**: five artifacts in a `wasDerivedFrom` chain; one dataset.
- **SKOS controlled vocabularies**: workflow status + agent capability schemes.
- **Aggregations & boolean derivations**: `COUNTIFS` rollups, including conditional counts over
  *derived* child fields (e.g. counting steps where the calculated `IsExecutedByAI` is true).
- **Transitive closure (first-class)**: `ntwf:precedesStep` and `ntwf:delegatesTo` are materialized
  by the `rulebook-to-postgres` `closure` field type as `WITH RECURSIVE` views
  (`vw_step_precedence_closure`, `vw_roles_closure`) — asserted edges + inferred reachability, each
  row tagged `is_inferred` / `hop_distance`. This is what makes the article's headline inference fire.
- **Load-bearing lookups**: `INDEX/MATCH` lookups resolve the role→agent indirection and the
  gate→role→approver chain that the competency questions depend on. The project is **not** lookup-free
  (an earlier revision was); full article coverage made a small set of lookups load-bearing. It is
  **not** many-to-many anywhere; the model is a strict DAG (junction tables like `StepPrecedence`
  express what would otherwise be many-to-many).

## Rulebook

**Location:** `effortless-rulebook/talismans-special-solutions-rulebook.json`

This is the canonical specification for the domain. It defines:
- Entity schemas (tables with fields)
- Field types (text, number, select, date, FK/reverse-FK, etc.)
- Calculated fields (formulas, lookups, aggregations)
- Seed data (test data for conformance)

## Editing

Edit `effortless-rulebook/talismans-special-solutions-rulebook.json` directly. Then rebuild:

```bash
effortless build
```

## Building

```bash
effortless build
```

This runs all enabled transpilers and generates:
- `execution-substrates/postgres/`: SQL (views + base tables)
- `execution-substrates/python/`: Python dataclasses + computed fields
- `execution-substrates/golang/`: Go structs + business logic
- And 10+ other substrates (Excel, OWL, UML, etc.)

## Testing

From the project root:

```bash
./start.sh
# or
bash orchestration/orchestrate.sh
```

This:
1. Generates answer keys from the rulebook seed data
2. Injects the rulebook into all substrates
3. Grades each substrate against the answer key
4. Produces a conformance report

All substrates should produce identical results.

## Regenerating the answer key (Postgres is the oracle)

**The answer key is computed by a substrate, never re-derived in Python.** The
conformance answer key lives in `testing/answer-keys/*.json` and is read from the
rulebook's stored computed values. Those values come from **Postgres** — the
reference substrate with no expressivity gaps — and are written back into the
rulebook. When you change a formula, a raw seed value, or add a calc/lookup/
aggregation field, the stored computed values (and therefore the answer key) go
stale until you refresh them.

**Refresh them with one command:**

```bash
cd postgres-bootstrap
bash regenerate-answer-keys.sh
```

This is self-contained and safe to run anytime against the current rulebook. It:

1. Spins up an **ephemeral throwaway database** (`erb_<domain>_keygen_<pid>`),
   leaving the dev DB `erb_talismans_special_solutions` untouched.
2. Builds the schema + `vw_*` views into it (`reset-rulebook-db.sh`) — Postgres computes
   every calc / lookup / aggregation / closure value.
3. Exports `SELECT * FROM vw_<entity>` for every entity (`pull-from-postgres.sh`
   — it queries the **views**, not base tables, so the export carries the
   computed columns).
4. Writes the **whole view row** (raws + computed) back into the rulebook's
   `data[]` arrays, via the `postgres-calculated-to-rulebook` tool run with
   `ERB_WRITE_COMPUTED=true`. (Its default mode syncs raws only; the flag is
   what makes it adopt computed values — the whole point of the refresh.)
5. Regenerates `testing/answer-keys/*.json` from the now-fresh rulebook.
6. Drops the temp DB.

**The `effortless build -id` path:** `-id` means "include disabled". The
`postgres-calculated-to-rulebook` transpiler is `IsDisabled: true` in
`effortless.json` so a routine build never silently rewrites the rulebook.
Running `effortless build -id` from `postgres-bootstrap/` runs it (against the
dev DB). `regenerate-answer-keys.sh` is the preferred path because it is
hermetic (temp DB) and drives the full cycle including step 5.

**Doctrine (why it works this way):**

- The **view IS the contract** (see repo `CLAUDE.md`). `vw_<entity>` already has
  every computed column populated by the SQL the transpiler emitted from the
  formulas. Refreshing the answer key = reading the view, not re-running a
  formula engine.
- The Python formula engine in `orchestration/` is a **cross-check that warns**,
  never an oracle that fails the build. If it can't evaluate a formula (an
  unimplemented function, or a time-dependent `NOW()` it can't reproduce against
  the substrate's clock), it keeps the Postgres-adopted value and notes drift —
  it does not overwrite or hard-fail. A genuinely *missing* value (no substrate
  answer at all) still raises, so no silent blanks.
- The refresh **only changes computed values** in the rulebook. Raws, formulas,
  and schema are never touched. `regenerate-answer-keys.sh` refuses to run if the
  rulebook already has uncommitted changes, so the resulting diff is always
  attributable.

## Key Files

| File | Purpose |
|------|---------|
| `effortless.json` | Project config + transpiler settings |
| `CLAUDE.md` | This file |
| `effortless-rulebook/talismans-special-solutions-rulebook.json` | The rulebook (SSoT) |
| `README.md` | Narrative: what this domain models |
| `execution-substrates/*/` | Generated: do not edit |

## Philosophy

The rulebook is a **declarative specification** of business logic. It is:

- **Implementation-agnostic**: express once, run everywhere (Postgres, Python, Go, etc.)
- **Temporally trackable**: the rulebook file is version-controlled; every schema change is a commit
- **Conformance-testable**: all substrates compute identically (verified by test suite)
- **Hub-and-spokes**: the rulebook is the hub; Postgres, Python, Go, etc. are spokes

**Do not hardcode logic in substrates.** If you're tempted to write imperative code in the generated files, the rule likely belongs in the rulebook as a Formula, Lookup, or Aggregation.

## Common Tasks

### Add a new entity (table)

Edit `talismans-special-solutions-rulebook.json`: add a new top-level object with `schema` and `data` properties. Then `effortless build`.

### Add a calculated field

Edit the table's field list in `talismans-special-solutions-rulebook.json`: add a field with `type: "formula"` or `"lookup"` or `"aggregation"`. Then `effortless build`.

### Change seed data

Edit the `data` section of a table in `talismans-special-solutions-rulebook.json`. Then rebuild to regenerate answer keys and test files.

### Debug a formula

The rulebook uses **Excel-compatible formulas**: `IF()`, `AND()`, `CONCAT()`, `SUM()`, etc. Check the formula syntax against the Excel spec. Conformance tests will catch mismatches across substrates.

---

**The rulebook is the specification. Everything else is derived.**
