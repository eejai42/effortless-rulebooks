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

`rulebook-examples/legacy-runner/` is the way the platform used to run every project. It stays: an ordinary governed example, graded like every other, with a working `./start.sh`, never privileged and never scheduled for deletion. Its *platform roles* pass to successors recorded in the root rulebook's `LegacyRunnerCapabilities` table (the root explorer, the generated editor, and the effortless CLI's local transpiler host). Do not add platform features to it.

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
- `rulebook-to-progress-report` resolves only through a machine-local override (`effortless -setToolUrl rulebook-to-progress-report=http://localhost:30052`; tool source `Versioned-Stable-SSoTme-Tools/tools/effortless/rulebook-to-progress-report`, local `start.sh`, port 30052). Its cpln workloads are unreachable and it is not on the tools server by name. Reproducibility gap on any other machine until it is published. *(Resolved 2026-09-05: published as `v2026.09.05.0210 [latest]`; the root build now resolves it by bare name.)*
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

**Phase 3 outcome (2026-09-04).** The root explorer is implemented under `app/`
against the generated API and verified by a headless sweep of all 14 modeled
routes plus a not-found route at 1280px and 375px: every page renders view data,
no page scrolls horizontally, and no console errors. All five navigation groups
derive `shippable`; the live root project page shows its three services as
`running` with links, and stopped projects show `not running` with their start
command. Stories US-026, US-028 to US-035, US-048 to US-050 are done and their
criteria met; US-052 is one third done (the explorer has no runner dependency).
Programme progress moved from 50% to 68%. Three traps surfaced and were defused
in code: the regenerated editor launcher now assigns random host ports unless
pinned, so root `start.sh` pins `RULEBOOK_EDITOR_*_PORT` and resolves the
per-project container by published port; the check-add SQL let removed rows
survive, so `scripts/init-root-db.sh` recreates `erb_effortless_rulebooks`;
and Docker Desktop does not propagate host file events into the editor's
bind mount, so the same script touches the container's `/tmp/rebuild-trigger`
after every init. Remaining gaps: the `Name` of the `ProjectMetadata` row still
reads "Effortlessly Invariant Rulesbooks" while the rulebook is named
"Effortless Rulebooks". (`rulebook-to-progress-report` was published on 2026-09-05
and resolves by bare name.)

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
- the succession state of the legacy runner (which surface now owns each of its platform roles).

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

## Legacy-runner succession

Decided 2026-09-04 after a first attempt to physically separate the bus was reverted (see Phase 4).

- The runner is a permanent `rulebook-examples/` project: the legacy view of the same pipeline the explorer now shows visually. Its CLI menu, bus, substrates, harness and portal stay in place and keep working.
- Nothing under it is deleted. "Retire" in the ledger means *no platform role any more*, not removal.
- The effortless CLI is absorbing the transpiler bus (`../effortless-cli/docs/refactor-plan/step-12-local-transpiler-host.md`: `effortless serve`, `effortless-tools/<name>/`, bare-name resolution). When Step 12 lands, each injector becomes a `script` tool, the 26 child manifests drop their `http://localhost:4242/...` URLs, and the runner's `ssotme-proxy` becomes the legacy bus rather than the live one.
- Orchestration is the explorer's job: pick a project, see its launch contract, see conformance and consistency from the views. Substrate conformance results should become rulebook rows the explorer displays; the runner's harness stays runnable as the legacy view.
- Every capability's successor is a row in `LegacyRunnerCapabilities`; `vw_project_metadata.is_runner_succession_complete` says when all successors are wired.

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

- [x] Scaffold the root React app under `app/`.
- [x] Reconcile the stale `/m/*` route model: `MobileNavTabs` now holds 5 navigation groups and `MobileRoutes` the 14 §3 routes; `Screen` names the implementing component (`scripts/migrate-phase3-explorer-routes.py`).
- [x] Connect it to the generated, view-backed root API (Vite proxies `/api` to `:42441`; every read is `GET /api/tables/<Table>`).
- [x] Implement responsive shell and primary navigation (top bar at desktop width, bottom tab bar under 760px, both rendered from the navigation rows).
- [x] Implement getting-started and concepts.
- [x] Implement skill catalog and skill-route detail.
- [x] Implement project lists, toy/example views, and project detail.
- [x] Implement launch instructions and health-gated localhost links (server-side probe restricted to `http://localhost` URLs; failure renders "not running" plus the exact start command).
- [x] Implement consistency and progress surfaces (findings queue filterable by status, rule, and project).
- [x] Link prominently to the generated editor, API docs, RuleSpeak, and the progress report.

### Phase 4 — Name the successor of every runner capability

- [x] Complete the capability inventory: `LegacyRunnerCapabilities` holds 12 rows with decision, successor, rationale, status and dependents (`scripts/migrate-phase4-runner-inventory.py`); `ProjectMetadata` derives `IsRunnerInventoryComplete` and `IsRunnerSuccessionComplete`.
- [x] Remove all root dependencies on the runner: root `start.sh`, the explorer and the root pipeline reference nothing under `legacy-runner/`.
- [x] Make the README *Local transpiler bus* block truthful: it names the bus's own launcher (`legacy-runner/ssotme-proxy/start.sh`), since neither the root nor the runner `start.sh` starts the bus.
- [x] Fix two proxy rigidities found while testing: it now serves projects under `toy-rulebooks/` (20 toys had enabled routes it refused) and accepts a hub named `effortless-rulebook.json`.
- [x] Reverted: a physical move of the bus, substrates, formula core and harness into a separate `transpiler-bus/` project (commit `0338a1f2`, reverted the same day). It broke the runner's menu and duplicated what CLI Step 12 will do properly.
- [ ] When CLI Step 12 lands: convert the injectors to `effortless-tools/` script tools, repoint the 26 child manifests to bare names, flip the bus/substrate/formula-core rows to `done`.
- [x] Model substrate conformance results as root rulebook rows the explorer displays; flip the harness row to `done`. `ConformanceRuns`/`ConformanceResults` record each harness invocation; `/conformance` in the root explorer shows the pass/fail matrix and can trigger a new run via `scripts/run-conformance.py` (2026-09-06).

### Phase 5 — Work findings to zero

- [x] Run the slot scan after every structural change (`scripts/scan-project-slots.py`; hand findings close through `scripts/mark-finding-fixed.py`, new ones enter through `scripts/record-finding.py`).
- [x] Fix findings project by project. Passes A–E (2026-09-05) took open findings from 128 to 15 and example-ready projects from 1 to 11: criticals (second hubs, empty nested `.git`), committed scratch, transpiler names, READMEs and the bus block everywhere, canonical shape for the structurally off projects (hub placement, manifests, `__meta__`, top-level keys, legacy `ssotme.json`, CLAUDE.md), and editor / Postgres / init-db slots across the examples.
- [x] Mark witnessed findings fixed; do not delete their history (156 fixed, 6 accepted-exception as of 2026-09-05).
- [x] Verify every root-app classification and count against a generated view.
- [x] Finish only when the rulebook's derived consistency state says the repository conforms. Reached 2026-09-05: 0 open findings, `is_repo_consistent` true, 16 example-ready. The last seven closed by: view-backed apps for is-everything-a-language, naive-set-theory, planar-unit-discovery, ross-style-business-rules and veritasium (each `app/` on 4310x/4330x, launch profiles repointed); PKO's three-phase init (cr-20-01); publishing `rulebook-to-progress-report` (cr-16-02) and the progress-report skill (cr-16-03).
- [x] Decided 2026-09-05: toy-versus-example is declared (`RulebookDomains.Kind`, `scripts/migrate-phase5-declared-kind.py`), not derived from coverage. `IsMisfiled` now means folder ≠ declaration; 0 misfiled. Stories reconciled the same day (`scripts/migrate-phase5-reconcile-stories.py`): 49 done, 1 in progress, 4 todo (flavor cards, unused tags, skills drift check, SkillRoutes generator), no status drift.
- [x] US-036 done (2026-09-05): the `/consistency` work queue closes hand-recorded findings in place. The explorer's dev server runs `scripts/mark-finding-fixed.py` (rulebook JSON stays HEAD, diff-minimal) and PATCHes the editor's base table so `vw_rulebook_domains` and `vw_project_metadata` recompute on the next read. `ConsistencyRules.IsScannerDerived` (cr-17, cr-19) is the modeled fact that decides which findings the queue may close; scanner-derived ones close only by re-running the scan (`scripts/migrate-phase5-findings-queue.py`). Note `is_repo_consistent` reads false while any domain carries an open finding, minor or not; whether it should key on blocking findings only is an open rule decision.
- [ ] Four findings stay open because their fix is outside this repo. cr-21-01 (2026-09-05): the generated editor's `POST /api/save-changes` rewrites the whole rulebook (keys reordered, derived columns baked into `data`, 64k diff lines for one field); never commit its output. The other three: cr-16-04 (rulebook-to-postgres rejects PKO's derived-key lookups; PKO's SQL is frozen at the retired v2026.07.11 build), cr-16-05 (rulebook-to-rulespeak-de resolves to a dead host; republish it), cr-16-09 (Control Plane health checks failing for .NET tools scaling from zero since 2026-09-05 17:00 UTC; progress-report runs via the local :30052 override meanwhile).

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
- Every legacy-runner capability names its successor surface; the runner remains an ordinary governed example.
- Blocking consistency findings are zero according to the generated root view.
- The app is usable at phone width and its routes are deep-linkable.
- Root README and doctrine describe the architecture that actually runs.

## Next-session entry point

Start here, not in the historical chat:

1. Read this file, root `CLAUDE.md`, and `effortless.json`.
2. Check `git status` and the diff of the root rulebook before any command that can touch it.
3. Query the root rulebook narrowly for `UserStories`, `AcceptanceCriteria`, `ConsistencyRules`, `ConsistencyFindings`, `RulebookDomains`, and mobile route tables.
4. Ask permission before editing the root rulebook or running `effortless build`.
5. Phases 0–4 are complete (2026-09-04); two Phase 4 items wait on CLI Step 12. `./start.sh` at the root boots the editor on pinned ports and the explorer at `:42440`; 41 launch profiles, 40 local services, 902 slot witnesses, 5 navigation groups and 14 routes are green. Phase 5 reached zero open findings on 2026-09-05. Remaining call: the misfiling formula (22 toys grade as examples by coverage; either move them or make toy/example a declared attribute). Nothing under `legacy-runner/` is deleted; it is a permanent example. Do not recompute classifications or launch facts already exposed by the rulebook.
