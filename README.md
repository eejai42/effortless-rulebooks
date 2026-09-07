# Effortless Rulebooks

**The rulebook is the software. Everything else is a rendering of it.**

`effortless-rulebook.json` is a typed grid of entities, fields, relationships, and formulas — a business's actual meaning, written down once as structured data instead of scattered across code, docs, and tribal knowledge. Postgres, Python, Go, COBOL, Excel, OWL, ARM64, plain English, and more are not "generated code" downstream of that rulebook. They are **derivations** of it — the way a compiled binary is a derivation of source, or a rendered PDF is a derivation of a document. Delete every one of them, keep only the rulebook, and the whole system comes back, because the rulebook was never a spec you code from — it *is* the code, held in a form every substrate can read.

This repository is both the proof of that claim and the platform that runs it: a real multi-backend formula compiler, a CLI orchestrator, and an honest, machine-checked conformance matrix across every substrate — plus **[40 governed demo projects](#the-catalog)** exercising that same rulebook-first discipline. Two axes matter most for the demos:

- **Breadth — [toy-rulebooks/acme-llc](toy-rulebooks/acme-llc/).** A deliberately small domain run through all 17 registered substrates — Postgres, Python, Go, COBOL, Excel, OWL, English, and more — every one graded against the same answer key. The question this answers isn't "can it model a business," it's "do 17 completely different runtimes compute the same result from the same rulebook."
- **Depth — [rulebook-examples/effortless-banking](rulebook-examples/effortless-banking/) and [rulebook-examples/causal-autoimmune-architecture](rulebook-examples/causal-autoimmune-architecture/).** Two unrelated, real-complexity domains built from the same primitives: a commercial bank's loan-origination lifecycle (underwriting state machine, covenant monitoring, risk-grade migration, segregation-of-duties, branching approvals) and a systems-medicine ontology of causal chains in autoimmune disease (39 tables, OWL + Postgres substrates, a German rulespeak track). Banking and medicine share no domain vocabulary — what they share is the modeling discipline underneath.

## Start here

```bash
./start.sh
```

Boots the CLI orchestrator menu: pick a project, build it, run its registered substrates, grade conformance against the answer key, and open the report. This is the load-bearing entry point — the compiler, the transpiler bus, and the conformance harness all run through it.

```bash
./start.sh --portal
```

Boots the React root explorer (`http://localhost:42440`) together with the generated rulebook editor (Postgres + API + UI) it reads from — a browsable, guided view over everything the CLI does: the project catalog, the skill routing graph, consistency findings, and a `/conformance` page that can trigger the same harness runs and show their history. It is the secondary, web-based view of the same pipeline — not a second product.

## The compiler and the honest conformance matrix

`orchestration/formula_parser.py` is a real, from-scratch formula compiler: an Excel-dialect tokenizer, an AST, and backends that emit working Python, Go, and COBOL from the same parsed formula tree, plus a 24-function interpreter used by substrates that execute rather than transpile. `execution-substrates/` holds one directory per target runtime — Python, Go, COBOL, ARM64 binary, CSV, Excel, PlantUML/UML, OWL/RDF, plain English, and more — each with its own `inject-into-<technology>.py` and `take-test.py`/`.sh` harness.

The reason this isn't just an assertion is that every substrate is graded, not vouched for: each is executed against the same blank inputs, checked field-by-field against a locally-designated answer key, and the pass/fail matrix is the receipt. Several substrates carry explicit guard docstrings that refuse to let the harness fake a pass — the COBOL injector's guard, for instance, states plainly that it only emits COBOL for scalar fields on one entity, and that adding a second entity will provably drop its score. That constraint is recorded and enforced, not hidden. This is what makes an LLM-authored transpiler for substrate #18 trustworthy without a human reading its output line by line: if it doesn't reproduce the same answer key as every other substrate, the table says so by name, and a guard says exactly where the honest boundary is.

Here is the latest run against [toy-rulebooks/acme-llc](toy-rulebooks/acme-llc/), the platform's breadth witness:

| Substrate | Score | Passing |
|---|---|---|
| binary | 100% | ✅ |
| cobol | 100% | ✅ |
| csv | 100% | ✅ |
| effortless-csv | 100% | ✅ |
| effortless-entity-framework | 100% | ✅ |
| effortless-postgres | 100% | ✅ |
| effortless-xlsx | 100% | ✅ |
| english | 100% | ✅ |
| explain-dag | 100% | ✅ |
| golang | 100% | ✅ |
| owl | 100% | ✅ |
| postgres | 100% | ✅ |
| python | 100% | ✅ |
| uml | 100% | ✅ |
| xlsx | 100% | ✅ |
| yaml | 100% | ✅ |

17 of 17 substrates conformant. Same business rules, same answer, seventeen different runtimes — Postgres, Python, Go, COBOL, Excel, OWL, English, and more all agree with the same rulebook-derived answer key. The full per-substrate tradeoffs (expressiveness, determinism, whether it can serve as the answer key) are rulebook rows too: `ExecutionSubstrates` / `SubstrateTradeoffs` in [the governing rulebook](effortless-rulebook/effortless-rulebook.json).

Runs are triggerable on demand — from the CLI's `[T]` test action, the root explorer's **[/conformance](http://localhost:42440/conformance)** page, or `python3 scripts/run-conformance.py <project>` — and every run is recorded as first-class rulebook rows (`ConformanceRuns` / `ConformanceResults`), the same way slot witnesses are, not a markdown file nobody reruns. The underlying per-substrate reports (`execution-substrates/*/test-results.md`) are the raw, substrate-by-substrate evidence behind those rows.

## Watch the repository tour

[![Show Me One That Works — watch the Effortless Rulebooks repository tour](assets/effortless-rulebooks-repository-tour-player.png)](https://www.youtube.com/watch?v=6qmuGTx9VgY)

▶ [**Play: Show Me One That Works. Here Are 40. | Effortless Rulebooks Tour**](https://www.youtube.com/watch?v=6qmuGTx9VgY)

An eight-minute tour, for someone who has never heard of this, of what "the rulebook is the code" looks like end to end. It opens the smallest project, [customer-fullname](toy-rulebooks/customer-fullname/), where three columns are typed and a fourth is a rule, then follows that single line through one build into a Postgres function, a view, and a plain-English sentence. From there it measures the real range: [star-trek](toy-rulebooks/star-trek/) at 11 tables and about a thousand rows, [simpsons-paradox](rulebook-examples/simpsons-paradox/) at 40 tables and 8,764 rows with 411 of its 699 fields calculated rather than typed. It shows that projects register whatever substrates they want (two for one, eighteen for another) and closes on the read, run, change, build loop and the one sentence that hands the whole thing to a coding agent.

## This is not a code generator

That distinction isn't rhetorical — it's the one property that makes the whole approach hold together, and it's easy to miss:

> A conventional generator only adds. You remove a field from the spec, and the generated column lingers in every downstream artifact until someone notices the drift by hand. **`effortless build` is convergent, not additive**: additions appear, removals disappear, renames propagate — in every substrate, on every build. That two-way property is what lets the rulebook stay authoritative. A one-way generator's output silently outlives its spec; a convergent one can't.

This is recorded as a load-bearing rule in the platform's own rulebook (`framing-012`, severity `critical`) precisely because it's the mistake this project itself has made and corrected before. The related axioms, also enforced structurally rather than by convention:

| Axiom | What it means |
|---|---|
| **Rulebook is the IR** | The JSON is the portable intermediate representation. Every artifact is mechanically derivable from it — none is hand-maintained in parallel. |
| **No privileged substrate** | Postgres, Python, Go, OWL, COBOL, English — every substrate is a peer projection. None is "the real implementation" that the others approximate. |
| **Build is convergent, not additive** | Downstream artifacts mirror the rulebook's *current* state, never an accumulation of its past states. |
| **Fail loudly, never fall back** | A missing file or value is an error with the exact expected path — never a silent default or a second guessed location. |
| **Rulebook is a complete spec** | No accompanying source and no separate documentation is needed — a frontier LLM can answer any question about the domain, or implement it faithfully in a new language, from the rulebook alone. |

→ Full 13-axiom ledger, with every historical framing mistake it corrects: `OntologyAxioms` / `FramingInvariants` in [the governing rulebook](effortless-rulebook/effortless-rulebook.json).

Two other measurable receipts, on top of the conformance matrix above:

- **[Abstract Derivative Percentage (ADP)](docs/features/README.ADP.md)** — `effortless -clean` deletes every derivative artifact; `effortless build` restores them; the LOC delta is ADP. A pure scaffold starts near 100%; a typical ERB project lands at 60–80% derivative, 20–40% genuinely hand-written (transactions, auth, workflow, I/O — the parts that are not calculated fields and were never claimed to be).
- **[ExplainDAG](docs/features/README.explain-dag.md)** — for any derived value, a complete witnessed derivation graph: which inputs, which operations, what value at each step, generated before any production code runs. Per-fact provenance, not reconstructed from logs after the fact.

## The conjecture underneath

The empirical claim above rests on a stronger theoretical one: the **Conceptual Model Completeness Conjecture (CMCC)** — that Schema, Data, Lookups, Aggregations, and Formulas (SDLAF), over a bitemporal ACID DAG, are sufficient to express any finitely-computable, design-time semantic, without sidecar code or a bespoke grammar. It's falsifiable by construction: produce one sentence describing such a semantic that doesn't decompose into SDLAF, and the conjecture has a counterexample. None has survived attempt so far.

- [Executive summary](https://medium.com/effortlessapi/executive-summary-the-conceptual-model-completeness-conjecture-cmcc-5490fadaa73e)
- [CMCC vs. traditional Model-Driven Engineering](https://medium.com/@eejai42/why-the-conceptual-model-completeness-conjecture-cmcc-transcends-traditional-model-driven-241ba020031a) — MDE's thirty-year track record of underdelivering is the correct prior to bring here; this is the argument for why CMCC's substrate-equivalence claim is checked empirically (the conformance harness above) rather than merely asserted
- [As a universal computational framework (Zenodo)](https://zenodo.org/records/15252466)
- [The ssotme:// protocol](https://github.com/SSoTme) — the open transpiler registry that operationalizes CMCC: any tool that speaks the protocol can consume a rulebook without understanding any other substrate's output

## The catalog

The repo's own rulebook, [effortless-rulebook/effortless-rulebook.json](effortless-rulebook/effortless-rulebook.json), governs the whole thing — including the root's own platform infrastructure (the orchestrator, the transpiler bus, the substrates, the conformance harness). It lists every governed demo project (toy and example alike), the canonical project shape, strict filesystem/manifest witnesses, consistency rules and findings, the skill catalog, and the delivery programme. Readiness, toy/example classification, and misfiling are derived formulas exposed by generated `vw_*` columns — never recomputed or hand-asserted in app code.

The active continuation is [Platform Explorer and Repository Consistency Plan](PLATFORM-EXPLORER-PLAN.md) — see its 2026-09-07 note for the reversal that restored the orchestrator, transpiler bus, and conformance harness to the repo root after a brief staging period.

---

## The shape

Every governed project — the root included — fills the same slots:

| Slot | Where |
|---|---|
| Build manifest | `effortless.json` |
| The hub (single source of truth) | `effortless-rulebook/effortless-rulebook.json` **or** `effortless-rulebook/<slug>-rulebook.json` — both are valid |
| Project metadata | the `__meta__` table inside the rulebook |
| Story | `README.md`, ending with the *Local transpiler bus* section |
| Doctrine marker | `CLAUDE.md` (required of showcase examples) |
| Plain-English rules | `rulespeak/` via `rulebook-to-rulespeak` |
| Reference substrate | `postgres/` via `rulebook-to-postgres` + `reset-rulebook-db.sh` (examples) |
| Editor | `effortless-rulebook/edit-rulebook.sh` via `effortless-rulebook-editor` (examples) |
| An app that reads the views | `app/`, `web/`, `server/` … (examples) |
| Run story | `start.sh` (root, toys, and examples) |

`ProjectLayoutSlots` is the authoritative contract and `ProjectSlotWitnesses` records one strict observation per governed project and slot. The resulting `vw_rulebook_domains` columns derive coverage, readiness, toy/example classification, and misfiling.

## The map

```
effortless-rulebooks/                    ← the platform IS the repo; itself a project
├── effortless.json
├── effortless-rulebook/effortless-rulebook.json   ← the ONE governing rulebook
├── orchestration/  ssotme-proxy/  execution-substrates/  testing/   ← the compiler, the bus, the substrates, the harness
├── app/                                 ← the React explorer (./start.sh --portal)
├── rulespeak/  postgres/  progress-report/  docs/  ← this project's outputs
├── rulebook-examples/<slug>/            ← fully implemented showcase projects
└── toy-rulebooks/<slug>/                ← projects that implement a piece or two
```

Two physical folders, one concept, for the demos: in the rulebook they are all project rows. `Kind` declares whether a project is the root, a toy or an example; `Area` records physical placement only. `IsFullyImplemented`, `ReadinessState`, `ExpectedArea`, and `IsMisfiled` are derived from witnessed slots against the declared kind.

## Working with any project

```bash
cd <project>                      # the root, an example, a toy — same commands
effortless build                  # regenerate every registered output from the rulebook
./start.sh                        # cleanly (re)start the declared local experience
```

Edit the rulebook JSON; everything else is derived. Read computed values from the `vw_<table>` views, never recompute them.

At the repository root, refresh and validate project conformance with:

```bash
python3 scripts/scan-project-slots.py effortless-rulebook/effortless-rulebook.json .
scripts/validate-rulebook.py effortless-rulebook/effortless-rulebook.json
```

The scan records exact failures as findings and exits nonzero for malformed or ambiguous project artifacts.
The root build's final step runs `scripts/init-root-db.sh` against the explicit
`erb_effortless_rulebooks` database. On a first checkout, create that empty local
database once with `createdb erb_effortless_rulebooks`; the build fails loudly if
it is absent and never uses the generated `demo` default.

## Where the repo's health lives

After `effortless build` at the root, the database `erb_effortless_rulebooks` holds the governing rulebook's views:

- `vw_project_metadata` — one row with findings/rule/programme fields plus `layout_slot_count` and `fully_implemented_count`.
- `vw_rulebook_domains` — one row per governed project with `slot_coverage_percent`, `required_slot_coverage_percent`, `is_fully_implemented`, `is_toy_by_coverage`, `readiness_state`, `is_misfiled`, `open_finding_count`, and `consistency_grade`.
- `vw_project_layout_slots` and `vw_project_slot_witnesses` — the canonical contract and exact observed pass/gap evidence.
- `vw_project_launch_profiles` and `vw_project_local_services` — exact working directories, commands, experiences, localhost URLs, and health contracts.
- `vw_consistency_findings` — the sweep work queue, with a derived `priority` (P1/P2/P3).
- `vw_conformance_runs` and `vw_conformance_results` — the cross-substrate conformance history behind the numbers in [The compiler and the honest conformance matrix](#the-compiler-and-the-honest-conformance-matrix) above.
- `vw_execution_substrates` and `vw_substrate_tradeoffs` — the per-substrate expressiveness/maturity/tradeoff rows behind the conformance matrix.
- `progress-report/progress-report/progress-report.html` — the delivery report rendered from the story corpus.

## Skills

The `effortless-*` Claude skill suite is modeled in the root rulebook (`ClaudeSkills`, `SkillRoutes`) and mirrored into [docs/skills/](docs/skills/) on every build. Load `effortless-orchestrator` first in any project here.

---

## Local transpiler bus (`localhost:4242`)

> **All 13 local transpilers live on `localhost:4242`.** Start the bus with
> `./start.sh` from `ssotme-proxy/` at the repo root. The ssotme-proxy then
> exposes every repo-local transpiler — `postgres-calculated-to-rulebook`,
> `rulebook-to-python`, `rulebook-to-golang`, `rulebook-to-cobol`,
> `rulebook-to-owl`, and more — as first-class `ssotme://` routes any
> `effortless build` can call.

This is the current launch path. The effortless CLI is absorbing the bus (`effortless serve`, refactor Step 12); until then `ssotme-proxy/` at the repo root is the live bus.
