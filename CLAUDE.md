# effortless-rulebooks — doctrine

This repo follows the Effortless Rulebook (ERB) methodology. Load the `effortless-orchestrator` skill first.

## Active continuation

Read `PLATFORM-EXPLORER-PLAN.md` before continuing the 2026-08-30 refactor. The target is the root governing rulebook + generated editor + a custom root React explorer, with `./start.sh` required for the root and every governed toy/example. `rulebook-examples/legacy-runner/` is transitional and being retired capability by capability; do not add new platform features to it. Current references to its portal or transpiler bus describe the migration baseline, not the target architecture.

# THE REPO IS THE PLATFORM, AND THE PLATFORM IS A PROJECT

There is no privileged child folder. The repo root is an Effortless project (`effortless.json` + `effortless-rulebook/effortless-rulebook.json`); every governed subdirectory of `rulebook-examples/` and `toy-rulebooks/` is an Effortless project. They all have **the same shape**, so any effortless-rulebook-project viewer/editor can open any of them. The former platform currently lives at `rulebook-examples/legacy-runner/` only as a retirement staging area.

**The root rulebook governs.** `./effortless-rulebook/effortless-rulebook.json` is the parent. It models every governed project including the root (`RulebookDomains`), the canonical shape (`ProjectLayoutSlots`), strict filesystem/manifest observations (`ProjectSlotWitnesses`), consistency rules and witnessed violations (`ConsistencyRules`, `ConsistencyFindings`), the delivery programme (`UserStories`… — the `rulebook-to-progress-report` contract), the skill catalog (`ClaudeSkills`, `SkillRoutes`), and the route proposal. Coverage, readiness, toy/example classification, misfiling, and finding priority are rulebook formulas exposed by generated `vw_*` columns; never recompute or hand-assert them.

**Child rulebooks describe one project each.** `rulebook-examples/<slug>/effortless-rulebook/…` describes that domain and nothing else. The legacy runner's rulebook describes the runner (portal users/roles/navigation/screens/APIs, proxy routes, substrates, contract phases). Portal config never goes in a demo; a domain's business tables never go in the root rulebook; the root's catalog tables (`RulebookDomains`, `RulebookFlavors`, `Glossary`…) never go in the runner.

## The canonical project shape

The authoritative list is `ProjectLayoutSlots` in the root rulebook. The universal slots are: `effortless.json`; `effortless-rulebook/` holding the hub named **either** `effortless-rulebook.json` **or** `<slug>-rulebook.json` (both valid — the protocol does not dictate one; the folder disambiguates); a `__meta__` table; `README.md` ending with the *Local transpiler bus* section; `CLAUDE.md`; `rulebooktorulespeak` registered; and an executable `start.sh`. **The `start.sh` requirement applies to the root, every toy, and every example.** The root and fully implemented examples additionally require `rulebooktopostgres` + an init-db step, the `effortless-rulebook-editor`, and an app that reads the views.

`rulebook-examples/` and `toy-rulebooks/` are two physical folders for one concept. They are all project rows and `Area` records the witnessed folder. `IsToyByCoverage`, `IsFullyImplemented`, `ReadinessState`, `ExpectedArea`, and `IsMisfiled` are derived from slot witnesses; folder placement is not proof of implementation status.

Two containers deliberately carry no rulebook and are flagged `IsIntentionalException`: `toy-rulebooks/naked-claude-vs-effortless-claude/` (an experiment tree) and `toy-rulebooks/volunteer-shift-scheduler-demo/` (a scaffold consuming its sibling's rulebook).

## Consistency governance

Inconsistency is pruned by working `ConsistencyFindings` to zero — not by editing prose. When you discover a repeatable trap, the fix goes to a place the whole team sees: a rule row + finding rows in the root rulebook, a guard in code, or this file. When you fix a finding, mark its `Status` `fixed` (never delete witnessed rows); when a rule was wrong, correct the rule and record that as a `cr-15` finding. Re-run `python3 scripts/scan-project-slots.py effortless-rulebook/effortless-rulebook.json .` after moving or creating projects; it refreshes `ProjectSlotWitnesses`, preserves finding history, and exits nonzero on malformed or ambiguous project artifacts.

Every new project must register `rulebooktorulespeak` and end its README with this block (count matches the runner's `ssotme-proxy` registry):

```markdown
---

## Local transpiler bus (`localhost:4242`)

> **All 13 local transpilers live on `localhost:4242`.** Once you run
> `./start.sh` from `rulebook-examples/legacy-runner/`, the ssotme-proxy exposes every repo-local
> transpiler — `rulebook-to-postgres`, `rulebook-to-python`, `rulebook-to-golang`,
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

There is no repo-wide "active project" scratchpad. The user's message names the project (a slug, a URL, a pasted table); if absent, ask. CLI work in the legacy runner sets `ERB_DOMAIN=<slug>`; the portal carries `?domain=`.

# Formula dialect — traps the transpiler will not report

`rulebook-to-postgres` builds stay green while mistranslating these. Never use them:

- `ISBLANK(x)` → emitted as `NULL`. Blank-check with bare `{{X}} <> ""` / `{{X}} = ""` (null-safe). **Do not wrap in `COALESCE({{X}}, "")`** — that makes every blank-check always true.
- `COUNTIFS` with a second criteria pair → the second pair is dropped (you get the total count). Use a 0/1 flag on the child plus `SUMIFS` by the FK.
- Do not use `IF(...)` as a boolean predicate nested inside `AND(...)` / `OR(...)`; it is emitted as text. Rewrite the condition as boolean `AND`/`OR`, and reserve `IF` for producing the final number or string.
- `INDEX/MATCH` must match on the target's `<Entity>Id`, from a local FK field. No `MATCH(TRUE(), …)`.
- All references are 1 hop. Flatten a 2-hop need into a field at each hop.
- `{{Field}}` refs, lowercase `formula` key, `CONCAT(...)`/`&` for strings, `ROUND(x, n)` with both args.

The generated `01-*.sql` runs in check-add mode (`CREATE TABLE IF NOT EXISTS`, no `DROP`) even with `drop_all=true`, so rows whose PKs were removed from the rulebook survive a plain init. The root's `scripts/init-root-db.sh` therefore drops and recreates `erb_effortless_rulebooks` on every build; in child projects, `dropdb`/`createdb` before `init-db` after renaming or removing PKs. Keep `rulebooktopostgres` **unpinned** (`[latest]`) — a stale pin to a decommissioned host silently broke every build once.

The generated editor container watches the rulebook, but Docker Desktop does not reliably propagate host file events into the bind mount: after a host-side edit the editor API can keep serving stale rows with `build-status` reporting nothing. The root's `init-root-db.sh` touches the container's `/tmp/rebuild-trigger` after every init; do the same (`docker exec <id> touch /tmp/rebuild-trigger`) in any project whose editor looks stale. The regenerated `edit-rulebook.sh` also assigns **random host ports** unless `RULEBOOK_EDITOR_API_PORT` / `_UI_PORT` / `_PG_PORT` are set; a `start.sh` that declares fixed ports must pin them (the root's does) and must find the container by published port, not by name.

# Publishing / hosting transpiler tools

Never invent a publish procedure; see the global CLAUDE.md. `rulebook-to-progress-report` is not yet resolvable by bare name: run it locally (`Versioned-Stable-SSoTme-Tools/tools/effortless/rulebook-to-progress-report/start.sh`, port 30052) and `effortless -setToolUrl rulebook-to-progress-report=http://localhost:30052`; undo with `effortless -removeUrl`.

# The legacy runner

`rulebook-examples/legacy-runner/` is being retired. Its portal, orchestration, proxy, substrates, conformance, diagnostics, and devops capabilities must each be promoted, separated, replaced, or consciously retired under `PLATFORM-EXPLORER-PLAN.md`. Do not make the new root app depend on its admin portal or two-rulebook overlay, and do not add new platform features there. No runner files are deleted until dependents have an agreed home and the user gives explicit consent.

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
