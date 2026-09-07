# effortless-rulebooks — doctrine

This repo follows the Effortless Rulebook (ERB) methodology. Load the `effortless-orchestrator` skill first.

## Active continuation

**2026-09-07 reversal.** The 2026-08-30 refactor demoted the CLI orchestrator, the `ssotme-proxy` transpiler bus, the execution-substrate conformance harness, and the honest hard-domain conformance matrix to `rulebook-examples/legacy-runner/`, staged for eventual separation/replacement, while a new root (React explorer + generated editor + a 37-table governing rulebook) took over the repo root. That demotion is reversed: the compiler, the CLI, and the witnessed cross-substrate conformance evidence are the single most differentiating thing in this repo, and burying them behind "no longer privileged, gets no new platform features" doctrine language made external review more skeptical of the repo even though nothing in the engineering had regressed. `rulebook-examples/legacy-runner/` no longer exists as a directory — its entire contents (orchestration, ssotme-proxy, execution-substrates, testing, transpilers, devops, diagnostics, research-campaigns, execution-substrate-gt-explorer, xlsx, plus loose config/docs) moved back up to the literal repo root via `git mv`, and its rulebook was hand-merged into the root's own `effortless-rulebook/effortless-rulebook.json` (legacy's `legacy-runner-rulebook.json` is retired). The old admin portal (`admin-portal/`, `run-web-portal.sh`, and its rulebook tables `AppUsers`/`UserRoles`/`AppPermissions`/`AppNavigation`/`AppScreens`/`AppAPIs`/`RoleScreenHints`/`ClickTargets`/`AdminPortalRuntime`) was deleted outright, not archived — the React explorer is its full replacement. `./start.sh` now launches the CLI orchestrator menu by default; `./start.sh --portal` launches the React explorer + generated rulebook editor (the one web experience for the repo). See `LegacyRunnerCapabilities` in the root rulebook for the capability-by-capability record of what was reversed and why.

# THE REPO IS THE PLATFORM, AND THE PLATFORM IS A PROJECT

There is no privileged child folder among the demos: every governed subdirectory of `rulebook-examples/` and `toy-rulebooks/` is an ordinary Effortless project, all with **the same shape**, so any effortless-rulebook-project viewer/editor can open any of them. The repo root is also an Effortless project (`effortless.json` + `effortless-rulebook/effortless-rulebook.json`) — and unlike those demos, the root additionally IS the platform: the CLI orchestrator (`./start.sh`, `orchestration/orchestrate.sh`), the `ssotme-proxy` transpiler bus (`:4242`), the execution-substrate conformance harness, the generated rulebook editor, and the React explorer (`./start.sh --portal`) all live here.

**The root rulebook governs — including its own platform infrastructure.** `./effortless-rulebook/effortless-rulebook.json` is the single governing rulebook for the whole repo. It models every governed demo project (`RulebookDomains`), the canonical shape (`ProjectLayoutSlots`), strict filesystem/manifest observations (`ProjectSlotWitnesses`), consistency rules and witnessed violations (`ConsistencyRules`, `ConsistencyFindings`), the delivery programme (`UserStories`… — the `rulebook-to-progress-report` contract), the skill catalog (`ClaudeSkills`, `SkillRoutes`), the route proposal, AND (since the 2026-09-07 reversal) the root's own platform infrastructure: `ExecutionSubstrates`, `SubstrateTradeoffs`, `SsotmeProxy`, `TestingFramework`, `SubstrateContractPhases`, `EvaluationSteps`, `EvaluationArtifacts`, `OrchestrationComponents`, `CoreDataFlows`, `Dependencies`, `AddToolCatalog`, `BuildPipeline`, `FuzzyGradingProviders`, and narrative singletons (`PortalCliParity`, `WriteThroughInvariant`, `BootstrapStory`, `DeveloperJourney`, `ResilienceClaim`). Coverage, readiness, toy/example classification, misfiling, and finding priority are rulebook formulas exposed by generated `vw_*` columns; never recompute or hand-assert them.

**Child rulebooks describe one demo project each.** `rulebook-examples/<slug>/effortless-rulebook/…` describes that domain and nothing else. A domain's business tables never go in the root rulebook; the root's catalog tables (`RulebookDomains`, `RulebookFlavors`, `Glossary`…) and platform-infrastructure tables never go in a demo.

## The canonical project shape

The authoritative list is `ProjectLayoutSlots` in the root rulebook. The universal slots are: `effortless.json`; `effortless-rulebook/` holding the hub named **either** `effortless-rulebook.json` **or** `<slug>-rulebook.json` (both valid — the protocol does not dictate one; the folder disambiguates); a `__meta__` table; `README.md` ending with the *Local transpiler bus* section; `CLAUDE.md`; `rulebooktorulespeak` registered; and an executable `start.sh`. **The `start.sh` requirement applies to the root, every toy, and every example.** The root and fully implemented examples additionally require `rulebooktopostgres` + an init-db step, the `effortless-rulebook-editor`, and an app that reads the views.

`rulebook-examples/` and `toy-rulebooks/` are two physical folders for one concept. They are all project rows: `Area` records the witnessed folder and `Kind` (root | toy | example) is the **declared** classification, a statement of intent that a file count cannot change. `IsFullyImplemented` and `ReadinessState` are derived from slot witnesses against the declared kind; `IsMisfiled` means the folder disagrees with the declaration. To re-classify a project, change its `Kind` and move the folder.

Two containers deliberately carry no rulebook and are flagged `IsIntentionalException`: `toy-rulebooks/naked-claude-vs-effortless-claude/` (an experiment tree) and `toy-rulebooks/volunteer-shift-scheduler-demo/` (a scaffold consuming its sibling's rulebook).

## Consistency governance

Inconsistency is pruned by working `ConsistencyFindings` to zero — not by editing prose. When you discover a repeatable trap, the fix goes to a place the whole team sees: a rule row + finding rows in the root rulebook, a guard in code, or this file. When you fix a finding, mark its `Status` `fixed` (never delete witnessed rows); when a rule was wrong, correct the rule and record that as a `cr-15` finding. Re-run `python3 scripts/scan-project-slots.py effortless-rulebook/effortless-rulebook.json .` after moving or creating projects; it refreshes `ProjectSlotWitnesses`, preserves finding history, and exits nonzero on malformed or ambiguous project artifacts.

**Do not close findings through the editor's save path.** The generated editor's `POST /api/save-changes` rewrites the whole rulebook (keys reordered, every derived column baked into `data`; finding cr-21-01). Close hand-recorded findings with `scripts/mark-finding-fixed.py` or the root explorer's work queue on `/consistency`, which runs that script and then PATCHes the editor's base table so the views recompute at once. A rule's `IsScannerDerived` flag decides which findings may be closed by hand; the rest close only by re-running the scan.

Every new project must register `rulebooktorulespeak` and end its README with this block (count matches the runner's `ssotme-proxy` registry):

```markdown
---

## Local transpiler bus (`localhost:4242`)

> **All 13 local transpilers live on `localhost:4242`.** Start the bus with
> `./start.sh` from `ssotme-proxy/` at the repo root (it is root
> infrastructure again — see the root rulebook's `LegacyRunnerCapabilities`).
> The ssotme-proxy then exposes every repo-local transpiler —
> `postgres-calculated-to-rulebook`, `rulebook-to-python`, `rulebook-to-golang`,
> `rulebook-to-cobol`, `rulebook-to-owl`, and more — as first-class `ssotme://`
> routes any `effortless build` can call.
```

## Rulebook JSON is HEAD

For every project the rulebook JSON is the single authoritative source. Edit it directly; everything else is derived by `effortless build`. `airtabletorulebook` stays `IsDisabled: true` everywhere; re-enable only with explicit consent for one build. Before any command that could touch a rulebook (`effortless build`, any sync, any `git checkout`/`restore`), run `git status`/`git diff` on it — if it carries uncommitted edits you did not make this turn, stop and ask. There is no upstream to restore from.

The `__meta__` table (typed rows: `MetaKey`, calculated `Name`, `ValueType`, `StringValue`, `JsonValue`) is the only home for project-level metadata in every rulebook. No root-level `_meta`; stray metadata is promoted into the table.

# Avoid silent fallbacks

A bad fallback substitutes a plausible-looking value for a real failure so the failure stays invisible. Refuse: `try/except` that swallows a missing file/DB/parse error and returns a default; `if not exists: return {}`; "check the new path, then the legacy path"; retry loops that end in a placeholder. If the real path fails, **raise** with the exact thing that was expected.

A **default derived from the SSoT is not a fallback**: `os.environ.get("DATABASE_URL") or f"postgresql://postgres@localhost:5432/erb_{slug.replace('-','_')}"` is the deterministically-correct value; the env var only overrides. The test: if your default would still be correct after the env var vanished, it's a default; if it would silently run against the wrong thing, delete it and fail loudly.

# No defensive locks around `effortless build`

The `effortless` CLI handles its own locking. No advisory locks, mutexes, "rebuild in progress" gates, or scripts choreographing file changes "just in case". Run the build; if two things conflict the tool fails loudly.

# No bespoke caches without an invalidation contract

Never stash an SSoT value in a sidecar dict/file/variable with no designed refresh. If a value can be computed live from the SSoT, compute it live — that is what the views and formulas exist for. Principled materialization (an expensive, stable derivation) is allowed only as **data in a first-class rulebook table** that a transpiler reads to emit the matview and its refresh function — never as an ad-hoc key on a field object, and only after real measured pain. The test: could the SSoT + transpiler regenerate the cache identically? If not, refuse it.

# The view IS the contract

Every rulebook compiles to `vw_<entity>` views whose columns are exactly the entity's fields, computed by SQL the transpiler emitted from the formulas. To display a row: `SELECT * FROM vw_<entity> WHERE <pk> = $1`. No formula evaluator in app code, no lookup resolver over JSON `data`, no "first non-null column" helper, no `rows.filter(...).length` counts, no re-baking calc values into JSON. If the view is missing or the query fails, raise. Before writing code that touches a calc/lookup/aggregation field at runtime ask: *am I about to recompute something the view already has a column for?* If yes, `SELECT` it.

# Every process names its project explicitly

There is no repo-wide "active project" scratchpad. The user's message names the project (a slug, a URL, a pasted table); if absent, ask. CLI work (`orchestration/orchestrate.sh` and everything it shells out to) sets `ERB_DOMAIN=<slug>`; the React explorer carries `?domain=`.

# Formula dialect — traps the transpiler will not report

`rulebook-to-postgres` builds stay green while mistranslating these. Never use them:

- `ISBLANK(x)` → emitted as `NULL`. Blank-check with bare `{{X}} <> ""` / `{{X}} = ""` (null-safe). **Do not wrap in `COALESCE({{X}}, "")`** — that makes every blank-check always true.
- `COUNTIFS` with a second criteria pair → the second pair is dropped (you get the total count). Use a 0/1 flag on the child plus `SUMIFS` by the FK.
- Do not use `IF(...)` as a boolean predicate nested inside `AND(...)` / `OR(...)`; it is emitted as text. Rewrite the condition as boolean `AND`/`OR`, and reserve `IF` for producing the final number or string.
- `INDEX/MATCH` must match on the target's `<Entity>Id`, from a local FK field. No `MATCH(TRUE(), …)`.
- All references are 1 hop. Flatten a 2-hop need into a field at each hop.
- `{{Field}}` refs, lowercase `formula` key, `CONCAT(...)`/`&` for strings, `ROUND(x, n)` with both args.
- `NULLIF(...)` is not translated (the field reads NULL, and inside an aggregation it is emitted as a bare identifier that breaks the whole view). Guard with `IF({{Denominator}} = 0, 0, ...)`.
- Single-argument `COUNTIF(Child!{{FK}}, {{Id}})` is mis-emitted; write `COUNTIFS(Child!{{FK}}, Parent!{{Id}})`.
- Bare `LOOKUP(Target!{{Field}}, Local!{{FK}}, Target!{{Id}})` is not translated; write `INDEX(Target!{{Field}}, MATCH({{FK}}, Target!{{Id}}, 0))`.
- A string formula such as `={{A}}-{{B}}` or `={{A}}/{{B}}` is parsed as arithmetic and emits invalid SQL; use `CONCAT({{A}}, "-", {{B}})`.

Every generated `vw_*` view must answer `SELECT *`; the database loads even when a `calc_*` body is invalid, because SQL-function bodies are checked at call time. After a build, probe every view (`SELECT count(*) FROM vw_x`) before trusting it. `rulebook-to-postgres` emits `postgres/reset-rulebook-db.sh` as the real, fully-regenerated destructive dev-reset script (it is NOT preserved across builds — every rebuild overwrites it in full); it also still emits a legacy `postgres/init-db.sh` compatibility shim that execs into `reset-rulebook-db.sh`, which will be removed once every consumer has migrated. Reference `reset-rulebook-db.sh` directly in new code, not `init-db.sh`.

Both generated scripts routinely come back **without the executable bit set** — this is expected, not a bug to chase: `reset-rulebook-db.sh` and `init-db.sh` are both `Never`-overwrite (as of the transpiler's 2026-09-07 build; before that, `init-db.sh` had wrongly been flipped to `Always`, which is a separate, now-fixed regression), but the CLI's clean pass still deletes and recreates a `Never` file on every build whenever its on-disk content is unchanged (so a relocated file can follow a path move instead of leaking an orphan copy) — and a fresh file from that recreate never carries the old executable bit. **Always invoke them via `bash <script>` (e.g. `bash init-db.sh`), never `./<script>` directly** — that fails with "permission denied" whenever the bit didn't survive the last build, which in practice is most builds.

`effortless -exec`/`-execute` is not a safe substitute for `bash <script>` on the currently-installed CLI (`ssotme`/`@effortlessapi/cli` v2026-06-09.06.13): its argument parser re-tokenizes the entire `-execute "..."` value word-by-word, so any token inside it that starts with `-` or `/` collides with the CLI's own option parser (e.g. `-execute "bash init-db.sh --help"` fails with `Unknown option "-help"`; an absolute path fails the same way). It also produced no visible output at all when given a bare `-execute "bash init-db.sh"` with no arguments, unlike running `bash init-db.sh` directly. Until a fixed CLI ships, use `bash <script>` directly, not `-exec`.

The generated `01-*.sql` runs in check-add mode (`CREATE TABLE IF NOT EXISTS`, no `DROP`) even with `drop_all=true`, so rows whose PKs were removed from the rulebook survive a plain init. The root's `scripts/init-root-db.sh` therefore drops and recreates `erb_effortless_rulebooks` on every build; in child projects, `dropdb`/`createdb` before `init-db` after renaming or removing PKs. Keep `rulebooktopostgres` **unpinned** (`[latest]`) — a stale pin to a decommissioned host silently broke every build once.

The generated editor container builds its API with cloud tools (`rulebook-to-node-postgres-api` among them); when Control Plane is unhealthy it boots "degraded" with no API and the explorer's `/api` proxy answers 502. Run the tool locally (its `start.sh` under `Versioned-Stable-SSoTme-Tools/tools/effortless/`), then inside the container `docker exec <id> effortless -setUrl rulebook-to-node-postgres-api=http://host.docker.internal:<port>` and `touch /tmp/rebuild-trigger`; the override lives only in that container. Read `GET /__boot/errors` on the UI port to see which step failed.

The generated editor container watches the rulebook, but Docker Desktop does not reliably propagate host file events into the bind mount: after a host-side edit the editor API can keep serving stale rows with `build-status` reporting nothing. The root's `init-root-db.sh` touches the container's `/tmp/rebuild-trigger` after every init; do the same (`docker exec <id> touch /tmp/rebuild-trigger`) in any project whose editor looks stale. The regenerated `edit-rulebook.sh` also assigns **random host ports** unless `RULEBOOK_EDITOR_API_PORT` / `_UI_PORT` / `_PG_PORT` are set; a `start.sh` that declares fixed ports must pin them (the root's does) and must find the container by published port, not by name.

# Publishing / hosting transpiler tools

Never invent a publish procedure; see the global CLAUDE.md. `rulebook-to-progress-report` is published (`v2026.09.05.0210 [latest]`) and resolves by bare name; while developing it, run it locally (`Versioned-Stable-SSoTme-Tools/tools/effortless/rulebook-to-progress-report/start.sh`, port 30052) and `effortless -setUrl rulebook-to-progress-report=http://localhost:30052` (stored in `~/.effortless/tool_urls.json`; undo with `effortless -removeUrl`). Control Plane now rejects a `PORT` env entry in `cpln/workload.yaml` when the container port is set; the runtime injects `PORT`, so delete the entry from any tool's template before publishing it. A fresh workload can fail its first health check while the image is pulled; `cpln workload force-redeployment <name> --gvc ssotme-tools` brings it up.

# The orchestrator, the transpiler bus, and the conformance harness are root infrastructure

`orchestration/` (the CLI menu, `orchestrate.sh`), `ssotme-proxy/` (the transpiler bus on `:4242`), `execution-substrates/` (every injector + take-test harness), and `testing/` (the conformance framework) live at the repo root. They are not a legacy artifact kept alongside the "real" root — they ARE the root's platform infrastructure, restored there by the 2026-09-07 reversal after a brief 2026-08-30 staging at `rulebook-examples/legacy-runner/` (now deleted; see "Active continuation" above). `LegacyRunnerCapabilities` in the root rulebook records what was staged for replacement/separation and what was restored, with an honest rationale on each row — update that table, never prose, when a decision changes. The admin portal these capabilities once supported is gone for good (deleted, not restored); the React explorer (`./start.sh --portal`) is its permanent replacement. Do not make the explorer depend on a second admin portal or a two-rulebook overlay — there is exactly one rulebook governing this repo.

# Making a video about a project? Load the `effortless-video` skill.

Videos live in the sibling producer repo (`../effortless-vid-01-full-name/videos/<NN-slug>/`); each is an Effortless project whose story is changed by editing its rulebook and running `effortless build`. Invoke the skill first; the reference example is `videos/03-closure`.

After a repository-tour video is published, its collection README must show a
large clickable player card, not a bare text link. GitHub strips YouTube
iframes, so store the video's finished hero thumbnail under the collection's
`assets/`, add a centered YouTube-style play glyph (red rounded rectangle with
a white triangle), and wrap that local image in the real YouTube watch URL:

```markdown
[![Watch the repository tour](assets/<video>-player.png)](https://www.youtube.com/watch?v=<real-id>)
```

The sibling producer's shared brand rulebook owns the reusable series themes:
Toy videos use `gen-hero-thumbnail.py --theme toy`; full rulebook-example videos
use `--theme rulebook`. Publish first and use the returned ID. Never insert a
placeholder URL or use `img.youtube.com` in the README.
