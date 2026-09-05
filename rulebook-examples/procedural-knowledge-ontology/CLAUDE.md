# procedural-knowledge-ontology — Effortless Rulebook Project

This project follows the **Effortless Rulebook (ERB) methodology**. The rulebook is the single source of truth. All other artifacts are mechanically derived from it.

## Agents do not move branches. Ever.

**`git checkout`, `git merge`, `git pull`, `git rebase`, and `git reset` require the user's explicit say-so on that specific turn.** Committing to the branch you are already on is fine and needs no permission. Moving between branches does not.

This rule exists because it already went wrong: an agent switched this checkout from `pko-bootstrap` to `main` (a *different project's* branch — TSP), leaving `./start.sh` reporting `missing effortless-rulebook/procedural-knowledge-ontology-rulebook.json` and the user reasonably believing the entire domain had been destroyed. Nothing had been lost; the work was one `git checkout pko-bootstrap` away. A separate `Merge branch 'main' into pko-bootstrap` pulled four unrelated TSP commits into the PKO branch.

Multiple agents work this repo concurrently. A branch switch under another agent — or under the user — is indistinguishable from catastrophic data loss until someone reads the reflog.

- Before reporting anything as missing or lost, run `git rev-parse --abbrev-ref HEAD`, `git reflog`, and `git log --all --oneline -- <path>`. Commits are almost never gone; the checkout is on the wrong branch.
- Never say "everything is gone" from an `ls` alone.
- Do not delete stashes or prune dangling commits. Other agents park work there.

## Concurrent writes to the rulebook

The rulebook JSON is a contended file — other agents write it mid-session, and a watcher auto-commits.

- Write it with `json.dump(..., indent=1, ensure_ascii=False)`. **The file uses 1-space indent**; `indent=2` reflows all ~130k lines and will clobber a concurrent agent's work on the next merge.
- Re-read immediately before every write. Insert only your own top-level keys; never rewrite the whole document from a stale read.
- Verify row counts **after** committing, via `git show HEAD:<path>`. Verifying before the commit is worthless here — a concurrent rebuild already emptied eight seeded tables between verification and commit once.
- Keep seed scripts idempotent so a lost write is simply re-appliable.

## Rulebook

**Location:** `effortless-rulebook/procedural-knowledge-ontology-rulebook.json`

65 tables encoding procedural knowledge, structurally aligned to the **Procedural Knowledge Ontology (PKO) 2.0.0** (`https://w3id.org/pko/2.0.0`) and its industry module 2.0.0.

The defining structural commitment: **procedure specifications and procedure executions are separate tables.** `Procedures` says what should happen; `ProcedureExecutions` records what did. They are linked by `pko:hasExecutedProcedure`, never merged.

## The witness layer — every derived field traces to a role's question

The model specifies obligations precisely. What it originally could not do was **witness their breach**: requirements, verifications, exceptions, and communication policies were all stated with real precision, and in each case the execution-side counterpart that would catch a violation was missing.

The witness layer fixes that, and records *why* each fix exists:

```
WitnessLoops -> RoleQuestions -> RulebookFields
    ^               ^                  ^
  loop N      asked by a Role   InventedForQuestion FK
```

- **`WitnessLoops`** — one row per expansion round. Each loop's questions are ones that only became askable because of the previous loop's predicates; the `Premise` records that.
- **`RoleQuestions`** — one row per question a named role wants answered, in the role's own voice, with `WhyItMatters` and the substrate-computed `WitnessedAnswer`.
- **`RulebookFields`** — a complete census of every field. Fields invented to answer a question carry `InventedForQuestion`; the ~490 that predate the exercise carry null, because inventing retroactive motivations for them would be fabrication.

**Rules for agents:**

- The catalog is **derived, never hand-maintained**. Run `tools/reconcile_field_catalog.py` after any schema change; `--check` exits non-zero on drift. Authored provenance (`InventedForQuestion`) is preserved across reconciliation.
- A new derived field should have a question behind it. If you cannot name the role that wants it, ask whether it belongs.
- **Non-vacuity is the acceptance bar.** A boolean that is all-true or all-false over the seed data states nothing about the procedures — it looks like a working column and is not evidence. `tools/verify_witnesses.sh` reports every witness's distribution and flags the ones that cannot discriminate.

### Verified transpiler defects — read before writing any formula

A **green build is not evidence that a formula ran.**

1. **`IIF` is not supported.** It emits a warning comment, returns NULL, and the build still reports success. Seven committed predicates were silently dead this way, and four witnesses read "vacuously false" when the formula had never run. Use `IF(cond, a, b)`. `verify_witnesses.sh` now hard-fails on any "Formula translation failed" in the generated SQL, and `apply_witness_spec.py` rejects `IIF` at authoring time.
2. **A lookup whose `MATCH` key is a string literal generates no function** while the view that calls it is still emitted — green build, dead database. Match on a relationship column.
3. **Multi-criteria `COUNTIFS` silently drops the 2nd+ criteria.** Use the composite-key echo: `IF(cond, {{ParentFk}}, "")` on the child, then a single-criterion `COUNTIFS` against that column.
4. `INDEX/MATCH` only matches the target table's **primary key**.
5. `VALUE(LEFT("20:00", 2))` does not translate — the transpiler casts the string to a timestamp and the view errors on load. Store the integer.

### Time-dependent witnesses use a modeled instant, not the wall clock

`EvaluationContexts` holds the instant the model is judged against, as data. Freshness, overdue, and validity answers are therefore reproducible: asking the same question tomorrow gives the same answer. Before this, `IsFresh` read all-false purely because hours had passed since the seed data was authored, and `IsOverdue` could not fire at all. **A witness whose value depends on when you look at it is not evidence.**

### Violations are seeded, proven, then remediated in model

To show a witness can fire, the violation is seeded, the column is confirmed red, and then the model is remediated *in model* — the documented exception is invoked, the change request approved, the knowledge gap resolved. **The violating rows stay.** Deleting them would destroy the evidence; the arc from breach to resolution is the story. See the `KnowledgeGaps` rows with `Status=Resolved`.

## Building

```bash
effortless build      # runs rulebook-to-rulespeak -> rulespeak/, rulebook-to-postgres
                      # -> postgres-bootstrap/, then ./init-db.sh
./init-db.sh          # DROP + CREATE erb_procedural_knowledge_ontology, then load it
./start.sh            # validate + regenerate all projections + run tests
```

### Loading the database

`./init-db.sh` at the project root **drops and recreates**
`erb_procedural_knowledge_ontology` (`WITH (FORCE)`) and then execs
`postgres-bootstrap/init-db.sh`, which loads a freshly created, empty database
to completion in one run — consistency rule cr-20: no step may require schema a
later step creates. The load runs in three phases:

1. **Phase A — `00`–`05[b]`**: tables, `calc_*` functions, `vw_*` views,
   RLS-enable, seed data, plus the `NNb-customize-*` seams.
2. **Phase B — regenerate `06-access-control.sql`**: `tools/generate_access_ddl.py`
   first installs the fixed `app.jwt_*` accessor prelude, then `EXPLAIN`s every
   policy predicate against its real `public.<table>` and intersects every
   granted column with the real `vw_*` columns — the schema Phase A just
   created. An invalid predicate aborts the load here, before any security DDL
   is applied. This is strict validation, not a fallback.
3. **Phase C — `06+`**: the access-control DDL (roles, RLS policies, role
   schemas and narrowed views); `99-fk-constraints.sql` stays opt-in
   (`EFFORTLESS_ENFORCE_FKS=true`).

`postgres-bootstrap/init-db.sh` was emitted `overwrite: Never` by the pinned
transpiler and is project-owned: the phase ordering lives there. Before this,
the generator ran before Phase A and a fresh database could never load — the
root wrapper created the database but never dropped it, and `01-*.sql` is
check-add, so rows whose PKs were removed from the rulebook survived every
init. The fresh-load proof: 82 `vw_*` views, 194 RLS policies, 194 role views.

`./start.sh` is the restart story for this domain. It has no server — its deliverables are documents — so start.sh validates the rulebook, regenerates every projection, exercises the BPM process-export adapter, and runs the tests. `./start.sh validate|test|open` narrow that.

## The access-control layer — security expressed as rulebook data

Row-, field- and table-level security is modelled as data, and the Postgres DDL
that enforces it is generated from that data. Eight tables:

```
AccessPrincipals -> AccessPolicies  (vertical cut: which ROWS, via RLS)
       |          -> FieldGrants    (horizontal cut: which COLUMNS)
       |          -> RoleSchemas -> RoleSchemaViews (the emitted views)
       +-> AppUsers -> PrincipalAssignments (who may act as whom)
                    -> IssuedTokens (mint audit)
AccessDenialTests   (the witnesses: proof a policy actually refuses)
```

**The capability that matters:** a policy predicate may call a `calc_*`
function, so a one-line policy can cut on a field derived many hops down the
DAG — `USING (public.calc_change_requests_is_open(change_request_id))`. The
policy stays simple while the semantics stay as deep as the model.

**Two cuts, two mechanisms.** RLS on `public.*` decides which rows. The
principal's own schema — the ONLY entry on its `search_path` — decides which
tables and columns. A field with no grant is *absent* from the view, not
blanked in it: selecting it raises `column does not exist`.

### Verified substrate facts — do not re-derive these from memory

1. **Calc functions must be `SECURITY DEFINER` + `row_security = off`.** They
   are pure derivations over the whole dataset; a policy predicate calls them.
   Without this they return NULL for a non-superuser and every policy silently
   denies every row — enforcement that looks green and enforces nothing. The
   generator marks all ~1280 of them. Safety rests on their shape: they take a
   primary key and return a scalar. **Never write a calc function that takes
   arbitrary input and returns rows** — that would be a leak.
2. **Ownership-chaining does not survive the `calc_*` hop.** A role view over
   `vw_*` owned by postgres still fails `permission denied`. Principals need
   real `SELECT` on `public`; RLS is what makes that safe.
3. **A predicate that sub-selects its own table** raises `infinite recursion
   detected in policy for relation`. The generator refuses to emit one.
4. **Policy identifiers contain hyphens** and must be quoted, or Postgres reads
   them as operators.

### The write path is long on purpose

Editing a policy writes to the rulebook; a separate rebuild applies it:

```
integrity check -> effortless build -> init-db.sh (regenerates 06-access-control.sql)
                -> denial witnesses          ~14s
```

There is no incremental "just add this one policy" shortcut, because that
shortcut is how the database and the model start to disagree. Edits and rebuild
are separate endpoints so a failed save cannot half-apply security.

### Acceptance bar

`tools/verify_access_control.sh` — 11 assertions through the HTTP API, must be
11/11. `tools/run_denial_witnesses.py` — the witnesses, run by `start.sh`.

**Denial tests need positive controls.** A suite that only tests denials cannot
distinguish a working policy from one that denies everything. Four of the nine
witnesses assert a row the principal *is* entitled to. And a test naming a row
that does not exist passes for the wrong reason — every `ForbiddenRowId` is
verified to exist before the test counts.

| Tool | Purpose |
|---|---|
| `tools/generate_access_ddl.py` | Emits `postgres-bootstrap/06-access-control.sql`. Runs in Phase B of `init-db.sh`, after `00`–`05` exist: installs the `app.jwt_*` accessors, validates every predicate with `EXPLAIN` against the live DB and refuses to emit if any fails; intersects granted columns against live view columns (the catalog can be ahead of the DB). |
| `tools/run_denial_witnesses.py` | Runs the witnesses as each principal, writes results back from the substrate. |
| `tools/check_rulebook_integrity.py` | Gates transpiler-defect classes: relationship-with-`formula`, `IIF`, multi-criteria `COUNTIFS`, non-PK `INDEX/MATCH`. |
| `tools/verify_access_control.sh` | The acceptance test. |

**Relationship fields carry `RelatedTo`, never `formula`.** With a `formula`
the transpiler emits `SELECT (TargetTable)::text` — a function that fails at
call time while the build stays green. Seventeen fields were silently corrupted
this way. `check_rulebook_integrity.py` now catches it.

## Three categories of semantic mapping — keep them distinct

Every table's semantics are recorded as data in the `SemanticMappings` table. When editing, preserve the distinction:

| `MappingRelation` | Meaning |
|---|---|
| `exact` | A native PKO 2.0.0 term (`pko:Procedure`, `pko:Transition`, …) |
| aligned | A reused external standard (P-Plan, PROV-O, DCAT, DCMI, OWL-Time, PRO, Metadata4Ing, ODRL) |
| `extension` | NOT defined by PKO — carries an explicit `urn:effortless:pko-extension#` IRI |

Do not relabel an extension as `exact` to make the model look more PKO-native. `KnowledgeFragments`, `ElicitationSessions`, `KnowledgeGaps`, `StewardshipAssignments`, and `OperationalBindings` are deliberately extensions. See `PKO-ALIGNMENT.md`.

## Why the relational shape is not a semantic downgrade

PKO is graph-shaped; an ERB rulebook is an acyclic structural graph. Many-to-many and repeated semantics are promoted to first-class junction/event entities — `StepTransitions`, `StepActions`, `StepFunctions`, `StepTools`, `StepRequirements`, `ProcedureVersionLinks`, `RoleAssignments`. This preserves the relationship while keeping the canonical model a DAG. Do not "simplify" these back into embedded lists.

## Key Files

| File | Purpose |
|------|---------|
| `effortless.json` | Project config + transpiler pipeline |
| `CLAUDE.md` | This file |
| `effortless-rulebook/procedural-knowledge-ontology-rulebook.json` | The rulebook (SSoT) |
| `start.sh` | Validate + regenerate projections + test |
| `PKO-ALIGNMENT.md` | Exact / aligned / extension mapping tables |
| `NOTICE.md` | PKO attribution and non-endorsement |
| `schemas/pko-erb-profile-1.0.0.schema.json` | The ERB-PKO profile |
| `tools/pko_rulebook_tool.py` | Validator + the four document projectors |
| `tools/verify_witnesses.sh` | **The gate.** Rebuild + reload + report every witness's distribution; fails on translation errors, load errors, or catalog drift |
| `tools/reconcile_field_catalog.py` | Derives `RulebookFields` from the real schemas; `--check` fails on drift |
| `tools/apply_witness_spec.py` | Applies one role's question/predicate spec to the rulebook |
| `tools/extract_computed_answers.py` | Reads computed witness values out of Postgres back into `RoleQuestions.WitnessedAnswer` |
| `WITNESS-LOOPS.md` | The multi-loop plan, decisions, and verified transpiler defects |
| `tools/bpm_process_export_to_pko.py` | Inbound adapter: BPM process-export format -> PKO rulebook |
| `examples/bpm-vendor-payment.json` | Sample foreign-format input for the adapter |
| `generated/*` | Generated projections — do not edit |
| `rulespeak/rulespeak.html` | Generated by `effortless build` |

Do not edit generated files. Edit the rulebook and rebuild.

## Attribution

PKO was created by Valentina Anita Carriero, Mario Scrocca, Ilaria Baroni, Antonia Azzini, and Irene Celino (CC BY 4.0). This domain aligns to PKO; it is not an official PKO distribution and implies no endorsement. Keep the demo neutral — see `NOTICE.md`.

## Local transpiler bus (`localhost:4242`)

> **All 13 local transpilers live on `localhost:4242`.** Once you run
> `./start.sh` from the repo root, the ssotme-proxy exposes every repo-local
> transpiler — `rulebook-to-postgres`, `rulebook-to-python`, `rulebook-to-golang`,
> `rulebook-to-cobol`, `rulebook-to-owl`, and more — as first-class `ssotme://`
> routes any `effortless build` can call.
