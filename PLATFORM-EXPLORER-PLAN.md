# Platform Explorer and Repository Consistency Plan

**Status:** active continuation plan  
**Recorded:** 2026-08-30  
**Starting point:** commit `596716bf` (`PARTIAL FABLE REFACTOR`)  
**Purpose:** make the next session self-sufficient; the prior Claude/Fable transcript is historical evidence, not required reading.

## Decision

The repository root is the new platform experience.

We are promoting:

1. the root governing rulebook;
2. its generated rulebook editor, API, Postgres views, RuleSpeak, and progress report;
3. a custom root React application that explains and explores the entire repository; and
4. a universal `./start.sh` contract for the root project and every governed toy and example.

We are retiring `rulebook-examples/legacy-runner/`. It is transitional code, not the future platform and not a showcase to extend. Capabilities that are still valuable must be deliberately promoted to the root project or separated into an explicitly owned tool before the runner is removed. Removal is a later, separately approved action.

The root experience is primarily a guide and explorer. It helps a visitor:

- understand Effortless, ERB, CMCC, SDLAF, and the loop;
- install prerequisites and get started;
- browse the skills and their routing relationships;
- browse toys and fully implemented examples;
- understand what each project demonstrates;
- see how to run each project;
- follow a direct localhost link when a project is actually running;
- inspect consistency findings and implementation progress; and
- open the generated rulebook editor when they want to inspect or edit the governing model.

## What already exists

The partial refactor established useful foundations:

- `effortless-rulebook/effortless-rulebook.json` is the root governing hub.
- `effortless.json` registers RuleSpeak, the rulebook editor, the progress report, and Postgres generation.
- Generated root `postgres/`, `rulespeak/`, and `progress-report/` outputs exist.
- The rulebook already models projects, skills, skill routes, consistency rules and findings, delivery stories, and a mobile route proposal.
- Most former platform and orchestration files were moved into `rulebook-examples/legacy-runner/`.
- Root `README.md` and `CLAUDE.md` establish “the repo is the platform.”

At the Phase 1 handoff, this was not yet the completed architecture:

- there is no root `start.sh`;
- there is no custom root React application;
- `start.sh` is not yet universal across governed projects;
- the legacy runner is still present and still owns active behavior;
- the filesystem slot model described by current doctrine is not fully implemented in the committed rulebook;
- toy/example readiness is not yet reliably derived from witnessed conformance;
- legacy paths and assumptions remain;
- the existing mobile route data has not been implemented as an application; and
- the consistency findings have been recorded but not worked to zero.

## Audited issues (2026-08-30 baseline, verified against `596716bf`)

Facts below were checked directly (filesystem, rulebook queries, live Postgres); fold them into the phases rather than rediscovering them.

**Working tree at audit time.** Only `README.md`, `CLAUDE.md` (modified) and this file (untracked) were dirty. That statement is historical context, not current status; always inspect the actual working tree before continuing.

**Model / rulebook**

- Baseline at `596716bf`: `ProjectLayoutSlots` and `ProjectSlotWitnesses` were absent from the 31-table root rulebook even though doctrine described them as existing. Phase 0 corrected the claim; Phase 1 has now added the tables and regenerated a 33-table rulebook.
- The prior scratchpad's scanner/validator ideas have been promoted as strict root-owned `scripts/scan-project-slots.py` and `scripts/validate-rulebook.py`. The promoted scanner adds the root as a governed project, makes `start.sh` universal, rejects unmodeled directories, records malformed artifacts explicitly, preserves finding history, and never probes legacy paths.
- Phase 0 baseline after reconciliation: 40 `RulebookDomains` rows, 18 rules, 69 findings, 52 stories, and 101 criteria. Stories US-046 through US-052 and rules cr-17/cr-18 formalized the revised scope. Phase 1 adds root row `domain-root`, rule cr-19, story US-053, 18 layout slots, and 738 project-slot witnesses.
- `MobileNavTabs` / `MobileRoutes` still carry the old `/m/*` surface (5 tabs, 31 routes, every `Screen` null); reconcile to the §3 route list in the rulebook before any app code.

**Phase 1 witness snapshot.** The strict 2026-08-30 scan covers 41 governed rows x 18 slots. It currently derives 1 fully implemented project, 9 toys, 28 incomplete examples, 1 incomplete root, 2 intentional exceptions, 23 misfiled projects, and 87 required-slot gaps. The original Veritasium `effortless.json` was verified byte-for-byte against its GitHub source, preserved as `test-data/legacy-effortless-project-config.json`, and replaced by a canonical manifest converted from the source repository's `ssotme.json`; the strict scan now exits successfully.

The root build now has an explicit `init-db` step through `scripts/init-root-db.sh`, targets `erb_effortless_rulebooks` without using the generated `demo` default, and has been verified live: 18 slot rows, 738 witness rows, 41 governed project rows, and the root readiness row are queryable from `vw_*`. Live verification exposed a transpiler trap where `IF(...)` nested as an `AND`/`OR` predicate becomes text; the formulas, validator, doctrine, and fixed cr-15 finding now record the boolean-expression form.

**Build / substrate**

- `erb_effortless_rulebooks` **does not exist**; the root project has never loaded Postgres. Root `effortless.json` registers rulespeak, editor, progress-report and `rulebook-to-postgres` but **no init-db/execute step**.
- Generated root `postgres/init-db.sh:18` has `DEFAULT_CONN=postgresql://postgres@localhost:5432/demo` — a wrong-database default that violates the silent-fallback doctrine. It must target `erb_effortless_rulebooks` when the init step is wired.
- `erb_admin_portal` is stale: it still holds the pre-split 59-table build, including root catalog tables (`rulebook_domains`, `consistency_findings`, `claude_skills`). The generated `01-*.sql` is check-add (`CREATE TABLE IF NOT EXISTS`, no DROPs, even with `-p drop_all=true`), so **both** databases need `dropdb`/`createdb` before their next init-db; stale rows otherwise survive and silently pollute rollups.
- `clone-skills` is registered **nowhere**: it was removed from the runner manifest and `docs/skills/clone-skills.sh` was repointed at the root rulebook, but it was never added to root `effortless.json` — the skills mirror will not refresh on any build.
- `rulebook-to-progress-report` resolves only through a machine-local override (`effortless -setToolUrl rulebook-to-progress-report=http://localhost:30052`; tool source `Versioned-Stable-SSoTme-Tools/tools/effortless/rulebook-to-progress-report`, local `start.sh`, port 30052). Its cpln workloads are unreachable and it is not on the tools server by name. Reproducibility gap on any other machine until it is published.
- Formula-dialect traps that will silently corrupt Phase 1 derivations if forgotten: `ISBLANK` mistranslates to NULL; `COALESCE({{X}}, "") <> ""` compiles to an always-true test (use bare `{{X}} <> ""` / `{{X}} = ""`); `COUNTIFS` drops the second criteria pair (use a 0/1 child flag + `SUMIFS`); `INDEX/MATCH` only matches on the target's `<Entity>Id` from a local FK.
- Editor conflict with doctrine: the root rulebook carries `__meta__` (required by the meta-table doctrine), but the generated editor stack treats `__meta__` as reserved and reports it as a broken view — §2's "`GET /api/view-health` must pass" cannot hold until the editor tool is fixed or the requirement is scoped to business tables.

**Startup baseline**

- There is no root `start.sh`. 25 of the 40 project directories have some `start.sh`; none have been checked against the §4 contract; 15 have nothing.
- The runner's split-aware portal overlay (merged loader/saver in `admin-portal/server.js`, `TOP_DB_NAME = "erb_effortless_rulebooks"`) parses but has never been booted post-refactor; per this plan it is migration baseline, not architecture.
- The runner's Docker repoints (compose `context: ../..`, Dockerfile `WORKDIR /app/rulebook-examples/legacy-runner`) have never been exercised.

**Phase 2 outcome (2026-08-31).** The root and every non-exception governed
project now have an executable `start.sh`; the strict scanner records 41
governed rows x 22 slots = 902 witnesses. The five startup slots (executable,
syntax, restart, URL declaration, and health contract) have zero implementation
gaps and every generated `cr-17` startup finding is fixed. The governing
rulebook now holds 41 `ProjectLaunchProfiles` rows and 40
`ProjectLocalServices` rows, including explicit root explorer, editor UI, and
editor API services. Root startup was smoke-tested at `:42440`, `:42441`, and
`:42442`, without a legacy-runner dependency. The generated editor still
misclassifies the deliberately transpiler-ignored `__meta__` table as a missing
`vw_meta`; root startup therefore validates every business view and accepts
only that exact, loudly reported reserved-table exclusion. Any other broken
view still fails startup.

## Target architecture

### 1. Root rulebook: the model and programme of record

The root rulebook describes the repository as a conceptual system:

- every governed project;
- the canonical project contract;
- witnessed filesystem and launch conformance;
- toys versus fully implemented examples;
- concepts, glossary, axioms, and invariants;
- skills and skill routes;
- getting-started journeys;
- consistency rules and findings;
- delivery stories and acceptance criteria;
- application navigation; and
- the retirement state of the legacy runner.

Calculated facts remain calculated in the rulebook and are consumed from generated `vw_*` views. The React app must not reproduce classification, coverage, readiness, counts, formulas, lookup resolution, or finding priority in JavaScript.

This Markdown file records the architectural decision and implementation sequence. Before implementation status is reported, its revised scope must be reconciled into the root rulebook's `UserStories` and `AcceptanceCriteria`. Thereafter, generated views and the progress report are the authoritative status source; this file must not grow hand-maintained percentages.

### 2. Generated rulebook editor: the editing surface

The generated root editor remains the general-purpose inspection and editing surface.

- UI: `http://localhost:42442`
- API: `http://localhost:42441`
- API discovery starts at `GET /api/docs`.
- API health must pass `GET /api/view-health`.
- The custom React app reads the editor's generated API or another equally direct view-backed root API.
- Editing remains rulebook-first; the custom app does not become a second schema or formula engine.

### 3. Root React app: the public local experience

Create the custom application under `app/` at the repository root.

Its initial route surface should include:

- `/` — platform overview and the shortest successful getting-started path;
- `/getting-started` — prerequisites, CLI setup, root startup, editor, and first project;
- `/concepts` and `/concepts/:concept` — ERB, CMCC, SDLAF, the loop, views, rules, and glossary;
- `/skills` and `/skills/:skill` — skill catalog, load gates, routes, and related skills;
- `/projects` — all governed projects;
- `/toys` — projects currently classified as toys;
- `/examples` — projects currently classified as fully implemented examples;
- `/projects/:slug` — project purpose, concepts demonstrated, rulebook, RuleSpeak, readiness, findings, launch instructions, and local link;
- `/consistency` — repository and project consistency views plus the findings work queue;
- `/progress` — programme, phases, stories, acceptance criteria, and generated report;
- `/tools` — editor, generated API, CLI, local transpilers, and setup diagnostics; and
- `/about-the-rulebook` — how the root rulebook governs and explains the repository.

The existing mobile navigation rows are input to this design, not an obligation to preserve stale labels. Reconcile them with the routes above in the rulebook before implementation. The resulting application must work at phone width without a separate `/m` implementation unless testing proves a separate shell is necessary.

### 4. `./start.sh`: the universal launch contract

Every governed project must have an executable `./start.sh`, including:

- the repository root;
- every direct project under `rulebook-examples/`; and
- every direct project under `toy-rulebooks/`.

Intentional container directories that are not projects must be modeled as explicit exceptions rather than silently skipped.

The contract is:

1. Run it from that project's root.
2. It starts or cleanly restarts the project's intended local experience.
3. It fails loudly when a required file, executable, database, port, or generated artifact is unavailable.
4. It never searches a chain of new and legacy locations.
5. It prints the project name, what it started, and every usable localhost URL.
6. It owns restart behavior for its declared ports; users are not given a separate kill ritual.
7. It uses the project's explicit configuration and rulebook path.
8. It is syntax-checked and smoke-tested as part of conformance.

Projects without a custom application may explicitly designate the generated rulebook editor as their intended experience. That is a project decision encoded by its script/configuration, not a runtime fallback.

The root `./start.sh` becomes the repository entry point. It will start the root React app and the view-backed services the app requires, print the root app and editor URLs, and must not delegate platform ownership to the legacy runner.

### 5. Launch information and localhost links

The root app must explain how to run every project even when that project is stopped.

Model a first-class launch contract in the root rulebook rather than scraping shell text in the browser. The contract must identify, at minimum:

- project;
- working directory;
- start command (normally `./start.sh`);
- experience description;
- primary localhost URL, when the project has one;
- optional health URL; and
- prerequisite or setup notes.

The project detail screen always shows the explicit command and notes.

A direct localhost link is shown as available only when:

1. the URL is explicitly modeled for that project; and
2. a real health/status request confirms the service is reachable.

If health fails, show “not running” and the exact start command. Do not substitute another URL, another project, cached status, or a plausible-looking success state.

The first version explains and links; it does not need to launch arbitrary child processes from the browser. A later explicit local-control feature may invoke a project's `start.sh` through a root-owned backend, but only after its permissions and process lifecycle are designed.

## Canonical consistency contract

The canonical project shape must be represented as rows in the root rulebook and witnessed against the filesystem. At minimum, every governed project requires:

- `effortless.json`;
- `effortless-rulebook/` with exactly one designated hub JSON, named either `effortless-rulebook.json` or `<slug>-rulebook.json`;
- a typed `__meta__` table in the hub;
- `README.md`;
- `CLAUDE.md`;
- `rulebooktorulespeak` registered;
- generated or buildable RuleSpeak output; and
- executable `start.sh`.

Additional readiness slots can distinguish a toy from a fully implemented example:

- Postgres generation and an initialization path;
- generated rulebook editor;
- a view-backed custom application;
- tests or conformance evidence;
- launch health metadata;
- mobile usability;
- complete getting-started instructions; and
- no open blocking consistency findings.

`Area` records the physical folder. “Toy,” “example-ready,” coverage, and misfiling are derived from witnessed facts and rulebook formulas. Application code only displays those derived columns.

The scanner must:

- discover direct governed project directories deterministically;
- fail on ambiguous hub files or malformed manifests;
- record one witness per project/slot;
- preserve finding history, marking resolved findings `fixed` rather than deleting them;
- model intentional exceptions explicitly; and
- never treat a missing project or file as an empty result.

## Legacy-runner retirement

Effective immediately:

- do not add platform features to `legacy-runner`;
- do not make the root app depend on its admin portal;
- do not preserve its two-rulebook runtime overlay as the new architecture; and
- treat its documentation as historical unless a capability is explicitly promoted.

Before removal, inventory each capability and choose one outcome:

- **promote** — move the capability under root ownership because the new platform still needs it;
- **separate** — make it an independently named project/tool with its own rulebook and `start.sh`;
- **replace** — satisfy the need through the generated editor/API or root app; or
- **retire** — record why it is no longer needed.

The inventory must cover at least:

- admin portal;
- ssotme proxy/local transpiler bus;
- CLI orchestration menu;
- cross-project build tooling;
- execution substrates;
- conformance harness and reports;
- diagnostics and research artifacts; and
- devops scripts.

No legacy-runner file is deleted merely because this plan says “retire.” Deletion happens only after there are no required dependents, history or artifacts have an agreed home, and the user gives explicit consent.

## Implementation sequence

### Phase 0 — Reconcile the handoff

- [x] Add the revised retirement, root explorer, universal `start.sh`, and launch-link requirements to root `UserStories` and `AcceptanceCriteria`.
- [x] Correct doctrine that currently describes unimplemented slot tables or classifications as complete.
- [x] Record `legacy-runner` as transitional/retiring rather than a future showcase.
- [x] Remove stale architectural claims without erasing historical evidence.

### Phase 1 — Make repository conformance real

- [x] Add or complete `ProjectLayoutSlots` and `ProjectSlotWitnesses`.
- [x] Implement a deterministic slot scanner under a root-owned `scripts/` directory.
- [x] Scan every direct toy and example project plus the root; 738 witnesses were recorded and the strict command exits successfully.
- [x] Derive coverage, readiness, toy/example classification, misfiling, and finding priority in the rulebook.
- [x] Regenerate and verify Postgres views and the progress report against the live `erb_effortless_rulebooks` database.
- [x] Expose the derived columns through generated `vw_*` views so the Phase 3 root app can consume them without recomputation.

### Phase 2 — Establish universal startup

- [x] Define launch information in the root rulebook.
- [x] Add root `start.sh`.
- [x] Add or repair `start.sh` in every governed toy and example.
- [x] Make each script print its declared localhost URLs.
- [x] Add syntax, executable-bit, restart, and health witnesses.
- [x] Turn every missing or broken startup contract into a consistency finding.

### Phase 3 — Build the root explorer

- [x] Scaffold the root React app under `app/` (minimal Phase 2 launch shell; explorer routes remain Phase 3).
- [ ] Connect it to the generated, view-backed root API.
- [ ] Implement responsive shell and primary navigation.
- [ ] Implement getting-started and concepts.
- [ ] Implement skill catalog and skill-route detail.
- [ ] Implement project lists, toy/example views, and project detail.
- [ ] Implement launch instructions and health-gated localhost links.
- [ ] Implement consistency and progress surfaces.
- [ ] Link prominently to the generated editor and RuleSpeak.

### Phase 4 — Promote or retire runner capabilities

- [ ] Complete the legacy capability inventory.
- [ ] Move only capabilities accepted into the target architecture.
- [ ] Remove all root dependencies on the runner.
- [ ] Update all README and tool references from runner-owned startup to root-owned startup.
- [ ] Mark retirement acceptance criteria complete.
- [ ] Request explicit consent before deleting the legacy-runner project.

### Phase 5 — Work findings to zero

- [ ] Run the slot scan after every structural change.
- [ ] Fix findings project by project.
- [ ] Mark witnessed findings fixed; do not delete their history.
- [ ] Verify every root-app classification and count against a generated view.
- [ ] Finish only when the rulebook's derived consistency state says the repository conforms.

## Definition of done

The programme is complete when all of the following are witnessed:

- `./start.sh` at the root starts the root explorer and required view-backed services.
- Every governed toy and example has a working `./start.sh`.
- A new visitor can install prerequisites, start the root, open the editor, and run a first project without reading source code.
- The root app browses concepts, skills, toys, examples, projects, consistency, and progress.
- Every project detail page contains exact launch instructions.
- Local links appear only for explicitly modeled, reachable services.
- All rulebook-derived facts shown in the app come from `vw_*` fields.
- Toy/example readiness and consistency are derived from witnessed slots.
- No active root feature depends on the legacy admin portal or its rulebook overlay.
- The legacy runner has been promoted, separated, replaced, or retired capability by capability.
- Blocking consistency findings are zero according to the generated root view.
- The app is usable at phone width and its routes are deep-linkable.
- Root README and doctrine describe the architecture that actually runs.

## Next-session entry point

Start here, not in the historical chat:

1. Read this file, root `CLAUDE.md`, and `effortless.json`.
2. Check `git status` and the diff of the root rulebook before any command that can touch it.
3. Query the root rulebook narrowly for `UserStories`, `AcceptanceCriteria`, `ConsistencyRules`, `ConsistencyFindings`, `RulebookDomains`, and mobile route tables.
4. Ask permission before editing the root rulebook or running `effortless build`.
5. Phases 0–2 are complete. The launch shell, generated editor/API, 41 launch profiles, 40 local services, and 902 slot witnesses are green; generated startup findings are zero. Next reconcile the stale `/m/*` route model, then implement the Phase 3 explorer against the generated views. Do not recompute classifications or launch facts already exposed by the rulebook.
