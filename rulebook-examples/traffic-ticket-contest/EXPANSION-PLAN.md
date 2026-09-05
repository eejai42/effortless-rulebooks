# Traffic-Ticket-Contest — Rulebook Expansion Plan (10 Effortless Loops)

> **Goal:** Before building any app, expand `traffic-ticket-contest-rulebook.json` into a
> FULLY-specified, internally-consistent, buildable spec for a traffic-ticket-contest
> platform — *inspired by* IUI's density but 100% traffic-ticket domain. Nothing
> underpopulated, nothing under-specified. The rulebook is the SSoT; the eventual
> `app/backend` + `app/frontend` will be derivable from it.
>
> **Mode:** Autonomous. 10 loops in ~120 min. Each loop = sub-agent does the work →
> `effortless build` → verify → **git commit** → compress context → next loop.
> Sub-agents preserve the orchestrator's context across the whole run.

## Operating rules (every loop obeys these)

1. **SSoT = the rulebook JSON.** Edit it via an idempotent Python author script under
   `scripts/` (follow the established `.author-data.py` pattern: documented FK conventions,
   `audit()` helper, `--dry-run`, merge-by-id, 2-space indent + trailing newline). NEVER
   hand-edit 800-row tables. One script per loop: `scripts/loop-NN-<topic>.py`.
2. **FK convention (verified):** a relationship value = the TARGET row's `Name` natural key
   (lower-kebab) = PK with type-prefix stripped. Citations→`lower(CitationNumber)` (`tc-2026-0002`),
   Drivers→`lower(LicenseNumber)` (`d1234567`), Jurisdictions→`lower(Code)` (`ca-la`),
   ViolationTypes→`lower(Code)` (`cvc-22350`), AppUsers→`AppUserId` (`representative-example`).
   New tables follow the same rule. Validate FKs both directions every loop (watcher may
   rewrite them — re-read after build).
3. **Merge-by-id, never clobber.** Existing rows are sacred. Only add rows / fill empty
   fields / add new schema fields. Re-running a loop script = 0 changes.
4. **Build every loop:** `effortless build` from the project dir. The `airtabletorulebook`
   pull stays disabled (won't overwrite JSON). Confirm DDL/views/inserts regenerate and the
   build completes. Spot-check the live DB `erb_traffic_ticket_contest`.
5. **Internal consistency is the prime directive.** Every loop ends with a consistency
   sweep: every feature has SourceText+RuleRefs+a nav row; every nav row has PrimaryTable/
   PrimaryView that exist; every APIEndpoint subject table exists; every RuleRef resolves to
   a BusinessRule; every state-machine transition's from/to states exist; every test case
   points at a real feature/endpoint/rule. Print residuals; 0 unresolved is the gate.
6. **Roles are 4:** admin, manager, representative, external-llm. Use those everywhere
   (RoleVisibility, per-role CRUD).
7. **Commit cadence:** after each loop's build+verify passes, `git add -A && git commit` on
   branch `refactor-rulebook-as-hub` with a descriptive message (Co-Authored-By trailer).
   Then compress context and start the next loop fresh.
8. **No app code this run.** Pure rulebook/spec expansion (devops/nav/consistency/features/
   tables/inferences). The app comes after.

## Domain canon (the traffic-ticket world we are specifying)

- **Actors / roles:** Driver (cited motorist, external), Representative (advocate who contests
  on the driver's behalf), Manager (team lead), Admin (system), External-LLM (3rd-party read).
- **Core entities (exist):** ViolationTypes, Jurisdictions, JurisdictionRules, Drivers,
  Citations, Hearings, Payments, CaseEvents.
- **Lifecycles (4 machines):** citation-lifecycle, contest-track, payment-track, license-track.
- **Packages (6):** citations (domain), core, platform-meta, access-control, state-machines,
  assistant.
- **The story:** a citation is issued → driver responds (pay or contest) → if contested, a
  hearing track runs → determination → payment/penalty and license-point consequences →
  deadlines drive a work queue. This is the narrative every feature/rule/test must cohere to.

## The 10 Loops

Each loop is self-contained, builds, verifies, commits. Ordered so later loops depend on
earlier ones (rules before refs, states before transitions, features before tests).

### Loop 1 — Feature SourceText + RuleRefs + provenance (the spine)
Fill all 75 `ERBFeatures` rows: rich multi-sentence `SourceText` (the design decision /
spec narrative, traffic-ticket framed), `RuleRefs` (CSV of BusinessRule RuleCodes the
feature implements), `SourceFiles` (point at our docs: `README.md`, `rulespeak/rulespeak.md`,
`EXPANSION-PLAN.md`). Also set `Route`/`RoutePath`/`RelativePath` for every feature that
renders a screen. **Density bar:** each SourceText ≥ 3 sentences, names the tables/views it
touches and the user action it enables. Add new features if the platform clearly needs them
(don't stop at 75 — go to town). Build, verify every RuleRef resolves once Loop 2 exists
(Loop 1 may forward-reference rule codes; Loop 2 guarantees they exist).

### Loop 2 — Business Rules library (complete + linked)
Expand `BusinessRules` + `BusinessRuleCategories` to a full numbered rule library covering the
whole domain: intake/validation, contest eligibility, deadline computation, fee/penalty math,
license-point accrual, hearing scheduling, determination effects, RBAC/redaction, licensing.
Each rule: `RuleCode` (e.g. `TT-INTAKE-01`), `Title`, `Description` (the actual rule, precise),
`Category`, `SchemaLocation` (table.field it governs). Backfill so every `RuleRefs` from Loop 1
resolves. Build, verify feature↔rule linkage = 100%.

### Loop 3 — PlatformNaviation: the complete route map
Expand `PlatformNaviation` from 22 → full app nav tree (top-level worlds + every screen):
every domain list/detail (Citations, Drivers, Hearings, Payments, ViolationTypes,
Jurisdictions, CaseEvents), every platform-admin screen (Roles, Users, Features, Packages,
Tables, RouteDesigner, Endpoints, Glossary, BusinessRules, Branding, StateMachines, Dashboard,
ExplainerDAG). Each row: `Route`, `RouteKey`, `ParentRouteKey`, `NavLevel`, `RoleVisibility`,
**`PrimaryTable`**, **`PrimaryView`** (`vw_*`), `IconHint`, `PinToTop`, `IsDynamic`,
`BuildPhase`, `HandlerBaseName`, per-role CRUD, `BusinessRuleRefs`. **Navigation continuity:**
every feature with a screen has a matching nav row and vice-versa; every PrimaryTable/View
exists. Build, verify nav↔feature↔view consistency.

### Loop 4 — APIEndpoints: every non-CRUD action (the verbs)
Enumerate every traffic-ticket action as an `APIEndpoints` row: `POST /api/citations/:id/contest`,
`/issue-determination`, `/dismiss`; `POST /api/payments/:id/checkout`, `/refund`;
`POST /api/hearings/:id/schedule`, `/reschedule`, `/record-outcome`; `POST /api/citations/:id/advance-state`;
license-point recompute; assistant chat; export; etc. Each: `HttpMethod`, `Path`, `EndpointType`
(action/rpc/report), `SubjectTableName`, `TriggersStateMachine`, `RoleVisibility`, `WhereClause`
(domain-correct row scoping, e.g. driver sees only own citations), `Status`. Build, verify each
subject table + triggered machine exists.

### Loop 5 — State machines: finish all 4 completely
Complete citation-lifecycle, contest-track, payment-track, license-track: every `MachineStates`
(initial/terminal flags, entry actions), every `StateTransitionRules` (from→to, the triggering
action/endpoint, guard condition, who may fire, RuleRefs), and representative `StateTransitions`
(example logged transitions) + `SubjectStateInstances` (current state per sample subject). Make
guards reference BusinessRules. Build, verify no transition references a missing state; every
machine has exactly one initial + ≥1 terminal; transition triggers map to APIEndpoints.

### Loop 6 — Test surface: create the 8 tables + full conformance corpus
Create the missing tables (`TestCategory`, `TestSurface`, `TestTechnology`, `TestCase`,
`TestExpectation`, plus `TestRun`/`TestResult`/`TestResultAssertion` as empty result sinks
with schema). Populate `TestCase` densely: one+ per feature, per APIEndpoint, per state
transition, per business rule — each with `TestExpectation` rows (given/when/then, expected
view output, expected state, expected permission outcome). Link every test to its
feature/endpoint/rule. Build, verify every TestCase target resolves; coverage report
(features/endpoints/rules with ≥1 test).

### Loop 7 — Per-screen display hints (new ScreenLayouts + FieldDisplayHints tables)
Add first-class tables encoding UI design decisions as DATA (not code): `ScreenLayouts`
(one per nav screen: layout kind list/detail/split/dashboard/wizard, primary view, sections),
`ScreenSections` (sections within a screen), `FieldDisplayHints` (per table.field: label,
widget kind, format, visibility-by-role, sort/filter/searchable, column order, redaction).
Populate for every domain + admin screen. This is what lets the future frontend render
generically. Build, verify every hint's table.field exists and every screen maps to a nav row.

### Loop 8 — Domain data depth (make the world real)
Deepen seed data so the app has a believable dataset: more Citations/Drivers/Hearings/Payments/
CaseEvents/JurisdictionRules, plus DriverLicensePoints history, FeeSchedules, DeadlineRules,
ContestGrounds catalogs — add any related tables the rules/features imply. Every calc/lookup/
aggregation field must have inputs that exercise it. Build, verify aggregations/lookups
populate in `vw_*`, no null calc columns that should compute.

### Loop 9 — DevOps + meta + glossary + inferences
Fill `__meta__` (tagline, motif, use_cases, signature_rows, journal_seed), expand
`GlossaryTerms`/`GlossaryCategories` to cover every domain term used in features/rules,
populate `ERBVersions`/`ERBCustomizations` to narrate the build history, `AiModels`/
`ModelPricingVersions`/`AssistantTurns` sample telemetry. Add any inferred/derived tables that
make the spec self-describing (e.g. a `BuildPhases` table if BuildPhase ints want names).
Build, verify meta renders, glossary covers all jargon (grep features/rules for terms not in
glossary).

### Loop 10 — Grand consistency pass + completeness critic
No new scope — a ruthless audit + backfill loop. Run a full cross-table integrity report:
every FK resolves both ways; every feature has SourceText+RuleRefs+nav+screen+≥1 test; every
endpoint/transition/rule is reachable and tested; every glossary term used is defined; no empty
required fields anywhere; per-role CRUD coherent (no field grants its table denies). Fix every
gap found. Final `effortless build`, full DB spot-check, regenerate rulespeak/explain-dag.
Commit as the capstone.

## Per-loop sub-agent protocol (how the orchestrator runs each loop)

For loop N the orchestrator spawns ONE general-purpose sub-agent with:
- This plan file path + the loop's section.
- The rulebook path, the established `.author-data.py` pattern, the FK convention.
- Instruction: write `scripts/loop-NN-<topic>.py` (idempotent, dry-run first), run dry-run,
  fix until counts/FKs/residuals are clean, then WRITE, then `effortless build`, then verify
  (DB counts + consistency sweep), and RETURN a concise structured report: rows added per
  table, build result, consistency residuals (must be 0), and a one-line commit message.
- The orchestrator: reads the report, if clean → `git add -A && git commit`, else spawns a
  fix sub-agent. Then compresses context and proceeds to loop N+1.

## Verification gates (every loop)
1. `python3 scripts/loop-NN-*.py --dry-run` → counts as expected, FK unresolved = 0, residuals = 0.
2. JSON parses.
3. `effortless build` completes (postgres + python + explain-dag + rulespeak); new DDL/views/
   inserts present.
4. Live DB `erb_traffic_ticket_contest` row counts match the rulebook.
5. Consistency sweep for that loop's domain = 0 unresolved.
6. `RelatedTo` keys preserved (watcher additions not clobbered).
7. Commit created.

## Risks / guardrails
- **Watcher** auto-stages + FK-normalizes mid-run: always re-read the rulebook at the start of
  each loop's script; never assume in-memory state from a prior loop.
- **Don't catalog `_meta`/`__meta__`** as tables; **do** keep ERBTables/ERBFields catalog in
  sync — when a loop adds a new table (Loops 6,7,8,9), it must also add that table's ERBTables
  row + ERBFields rows (reuse `scripts/author-platform-catalog.py`'s generator logic, or call
  it at loop end). Self-description must stay complete.
- **Stale customization SQL** (`*b-customize-*`) may error on build; that's pre-existing — note
  it, don't let it block, but if a loop's data makes it relevant, fix the customization to match.
- **Token budget:** sub-agents do the heavy lifting; orchestrator only reads compact reports +
  commits. Compress between loops.
