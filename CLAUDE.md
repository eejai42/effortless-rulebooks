# Avoid Silent Fallbacks

The defining property of a bad fallback is that it **substitutes a plausible-looking value for a real failure, so the failure stays invisible.** The canonical anti-pattern: the spec says `add(2, 2)` should return `4`, but when the real computation errors out, the code catches the exception and returns a hardcoded `19` (or `0`, or `{}`, or the last value it happened to see) so the caller "always succeeds." The caller never learns anything broke. This is the worst kind of bug — the system stays green while producing nonsense.

It is not about simple vs. complex operations. It is about whether a failure is allowed to **surface** or whether it gets papered over.

Concrete shapes to refuse:

- `try/except` that swallows a missing file, DB error, or parse failure and returns a default.
- `if not os.path.exists(p): return {}` instead of raising.
- "Check the new path; if it isn't there, check the legacy path" — silently accepting either.
- Any "safe default" returned in place of an error from the real path.
- Hand-rolled retry loops that eventually return a stale or placeholder value when the real call keeps failing.

If the real path fails, **raise**, with the exact thing that was expected. Failing loudly is the only way the bug surfaces.

## Defaults derived from the SSoT are NOT fallbacks

A **default** computed from the single source of truth is fine — even encouraged. The thing that makes a fallback bad is that it silently substitutes a *guess* for the right value. A default derived from the active domain (passed in via `ERB_DOMAIN`) is not a guess; it's the deterministically-correct value computed from the SSoT. Other environment variables just exist for override.

- ✅ `os.environ.get("DATABASE_URL") or f"postgresql://postgres@localhost:5432/erb_{ERB_DOMAIN.replace('-','_')}"` — the default IS the right answer (matches the formula in `orchestrate.sh`); DATABASE_URL only overrides.
- ✅ `os.environ.get("ERB_TESTING_DIR") or f"{repo_root}/rulebook-examples/{ERB_DOMAIN}/testing"` — same shape.
- ❌ `os.environ.get("DATABASE_URL") or "postgresql://postgres@localhost:5432/postgres"` — defaults to a generic DB that has nothing to do with the active domain. This is the kind of fallback that masks bugs as 100% conformance.
- ❌ `path or "/some/legacy/location"` when the active path is missing — guessing.

The test: if your default would still be correct after the env var was unset by accident, it's a default. If it would silently run against the wrong thing, it's a fallback — delete it and fail loudly instead.

---

# No defensive locks around `effortless build`

The `effortless` CLI (ssotme:// client) handles its own locking. Do not add coordination machinery on top of it: no advisory locks, no mutexes, no per-domain "rebuild in progress" gates, no scripts trying to orchestrate which files get changed when "just in case." When a build / CRUD / rebuild / schema PATCH needs to happen, just run it. If two things conflict, the underlying tool fails loudly and the user sees the real error.

---

# `start.sh` is the restart story. Don't invent a kill-then-start ritual.

`./start.sh` (and the `run-web-portal.sh` it dispatches to) **always** kills whatever is on its ports before booting. That is its primary purpose — see `run-web-portal.sh`'s "Kill anything already on the ports (clean restart)" block. Restart is one command.

When code changes need to be picked up by a running server, the answer is `./start.sh` (or the relevant variant). Never:

- Call the running instance "old code" or imply the user has stale bits in memory.
- Ask the user to `kill <pid>` first, or to run `lsof` to find the PID.
- Tell the user the changes "will be picked up on next restart" as if restarts were a thing they need to choreograph.

If a port collision matters, trust start.sh to handle it. If start.sh is missing or broken for a particular project, fix start.sh — don't route around it.

---

# No bespoke caches without an invalidation contract

A **bespoke cache** is one written by hand in application code: read a value from the SSoT, stash it in a sidecar dict / file / Redis / module-level variable, return the sidecar on subsequent reads, and never seriously design when it gets refreshed. This is the cache version of the hallucinated-fallback anti-pattern — it returns a value that *was* right at some point but might now be wrong, and the caller has no way to tell. "2+2=4" quietly becomes "2+3=4" because nobody designed the refresh.

Refuse this. If a value can be computed live from the SSoT, **compute it live.** That is what the views, formulas, and generated code exist for.

## Principled materialization IS allowed (and encouraged when it earns its keep)

There is a real exception, and it is categorically different from a bespoke cache: when a derived computation is genuinely expensive AND its upstream is stable (an N² join over a sealed input, an immutable mathematical object, etc.), it is fine to materialize the result — **as long as the materialization is driven from the SSoT, not invented by hand.**

The CMCC-native way to express this is **as data in the rulebook itself, in a first-class table** — not as an ad-hoc JSON property smuggled onto a field-schema object. The exact table shape is a per-use-case decision (a `MaterializedFields` table when granularity is per-field; a `MaterializedEntities` table when granularity is per-table; some other table when neither fits). The transpiler then reads that table like any other rulebook table and emits the matview + refresh function from those rows.

Do NOT invent a sibling key on field objects (`"cache": "matview"`, `"materialized": true`, etc.). The rulebook describes its own internal-state details *as rows*, the same way `__meta__` does and the same way every other concept in CMCC does. If materialization deserves to exist, it deserves a table.

The shape that qualifies as principled materialization:

- A first-class rulebook table enumerates the materialized field/entity, plus the refresh contract (eager-on-write / on-demand / scheduled) as data in that row.
- A transpiler emits the cache and its refresh function from that table, alongside the live view.
- The formula remains the single source of truth; the cache is purely derived infrastructure, regeneratable from the rulebook.

The distinguishing test: **if you deleted the cache, could the SSoT + the transpiler regenerate it identically?** If yes, it's principled materialization. If no, it's a bespoke cache — refuse it.

A Postgres materialized view emitted by a transpiler reading a rulebook table is fine. A hand-written `_cache = {}` in a Python module that nobody can audit is not.

**Rule for agents:** if you find yourself reaching for a lock or an ad-hoc cache to make an operation "safer," stop. Default answer is *don't build that*. Principled materialization is a separate, sanctioned mechanism, expressed as data in a rulebook table — and even then, only build it when the user has confirmed there is real, measured perf pain that justifies the extra class of derived field.

---

# The view IS the contract. Read from `vw_<entity>`. Do not re-derive anything.

Every rulebook compiles to a Postgres view (`vw_customers`, `vw_projects`, …) whose columns are exactly the entity's fields — raw columns sit next to calc/lookup/aggregation columns, all populated by SQL functions the transpiler emitted from the rulebook formulas. **The view's row IS the row.** Reading from it is opening a door and walking in. The whole point of the substrate is that the formula has already run.

When an app, the admin portal, a script, a notebook — anything — wants to display a row, the read is one line: `SELECT * FROM vw_<entity> WHERE <pk> = $1`, then render the row. There is nothing else to do. The `name` column already contains what `=SUBSTITUTE({{EmailAddress}}, "@", "-")` computed. The `full_name` column already contains what the formula concatenated. No formula evaluator. No regex over `{{Field}}` references. No "if calc value is null, fall back to col 0." If the view returns a value, that's the answer. If the view doesn't exist or the query fails, **raise** — same doctrine as Avoid Silent Fallbacks above.

Concrete shapes to refuse:

- A JS / Python formula parser that walks `=SUBSTITUTE(...)` / `=CONCAT(...)` / `=INDEX/MATCH(...)` at read time. The transpiler already emitted SQL that does this. Hand-rolling it again is building a parallel substrate.
- A JS / Python "lookup resolver" that finds FK targets by scanning JSON `data` arrays. The view already has the lookup column. Select it.
- An "effective name" / "first non-null column" / "fall back to PK" helper that paints *something* into a slot when a calc value is missing. If the calc value is missing, the read path is wrong — it's reading the rulebook JSON instead of the view. Fix the read path; do not invent the value.
- "Rebake calc values into the JSON `data` array on every write" as a way to make JSON reads return calc values. The JSON is for schema + raw seed data + replay. Reads of computed values come from the view, full stop.
- Counting children with `rows.filter(r => r[fk] === parent.pk).length` in app code. Use `SELECT COUNT(*) FROM <child_table> WHERE <fk> = $1`.

The simple test before writing any code that touches a calc/lookup/aggregation field at runtime: **am I about to re-compute something the view already has a column for?** If yes, stop and `SELECT` it instead. The view is the contract.

This applies recursively: if the admin portal needs a row's display name, it queries `vw_<entity>.name`. If a notebook script needs an Initials value, it queries `vw_<entity>.initials`. If a Python integration needs FullName, it queries `vw_<entity>.full_name`. There is no scenario in which app code has a legitimate reason to interpret a formula string from the rulebook — that's the transpiler's job, the transpiler already did it, and the output is sitting in a column in the view.

`firstStringValue(row)` over a *view row* is fine — that's looking at already-computed values and picking the first one. A hand-rolled DAG walker that descends through formula text and lookup chains to figure out what a cell *would have been* is not — that's reimplementing the substrate badly.

---

# THE PROJECT RULEBOOK ≠ A DEMO RULEBOOK

**This repo is a project that WRAPS a bunch of demo rulebooks. The project rulebook is the PARENT. The demo rulebooks are CHILDREN. They are NEVER mixed.**

- The **project rulebook** is `./effortless-platform/effortless-rulebook/effortless-rulebook.json`. It describes ERB itself — the orchestration tool, the admin portal, the build pipeline, the conformance testing framework. Things like `UserRoles`, `AppUsers`, `AppPermissions`, `AppNavigation`, `AppScreens`, `AppAPIs`, `AddToolCatalog`, `BuildPipeline`, `AdminPortalRuntime` belong **here and only here**. They are about *the wrapper*. (See `./effortless-platform/README.md` — the platform folder is the wrapper "eating its own dog food.")
- The **demo rulebooks** are `./rulebook-examples/<domain>/effortless-rulebook/<domain>-rulebook.json`. Each one describes ONE business domain (acme-llc's customers, star-trek's episodes, talisman-basic's tasks, etc.). They contain **only that domain's tables**. They never contain portal config.

The admin portal reads portal config from the **project rulebook** (always). It reads the active demo's domain data from the **demo rulebook** for whichever domain the request names. These are two separate file reads, two separate concerns. Never merge them. Never put portal entities in a demo rulebook. Never put a domain's business tables in the project rulebook.

**If you find portal-config tables (`UserRoles` / `AppUsers` / etc.) in a demo rulebook, that is a bug — remove them and put them where they belong (the project rulebook). If you find a domain's business tables (`Customers`, `Episodes`, etc.) in the project rulebook, same bug — remove them.**

---

# THE ADMIN PORTAL ≠ A DOMAIN (same category error, different surface)

**The admin portal is like Microsoft Word. A domain (acme-llc, star-trek, talisman-basic, etc.) is like a .docx document.** Word's install directory is not named after any document. A document is not named after the app. They are categorically different things and must never be mixed in any identifier — DB name, file path, function name, env var, table prefix, anything.

**Database naming (enforced):**
- `erb_admin_portal` — the admin portal's own database. **Singular.** Holds portal config (`AppUsers`, `AppRoles`, `AppNav`, etc.). The word `admin` appears here and **only** here. Never with a domain suffix.
- `erb_<domain>` — per-domain document database (`erb_acme_llc`, `erb_star_trek`, `erb_talisman_basic`, …). Holds that domain's business data. The word `admin` **never** appears in these names.

**Forbidden pattern: `erb_admin_<domain>`.** This is the category-error red flag. If you see it in code, the code is wrong. If you are about to write it, stop — the naming itself proves you have conflated the app with a document.

The admin portal opens two connections for two different reasons:
1. To `erb_admin_portal` — to read/write its own state (which user is logged in, navigation, etc.).
2. To `erb_<domain>` — to edit the document currently open (the domain named in the request).

Two connections. Two purposes. Two categories. Same logic as the rulebook split above.

**Rule for agents:** When CLAUDE.md declares a category boundary and the code appears to cross it, the code is the suspect — not the doctrine. Flag it as "this looks like a category-error bug in the code" rather than reporting it as fact. Do not pattern-match on bad names and assume they describe reality.

---

# Every process names its own domain explicitly

There is no project-wide "active domain" scratchpad. The admin portal UI carries the domain in the URL (`/developer/:domain/...`) and every API call passes it via `?domain=`. CLI tools (`orchestrate.sh`, `build-all-domains.sh`, every substrate's `take-test.py`, `test-orchestrator.py`, `rebuild-on-trigger.sh`) read the domain from the `ERB_DOMAIN` environment variable, which the caller must set explicitly. `orchestrate.sh` keeps the picked domain in a shell variable for the lifetime of its menu loop and exports it as `ERB_DOMAIN` to any child it spawns.

**Rule for agents:**

- The authoritative signal for "which demo does this turn concern" is **the user's message** — a name they typed, a URL they pasted, a row/table list they pasted. Trust that. If absent, ask.
- When a turn requires acting on a domain via the CLI (running `orchestrate.sh`, a substrate test, anything driven from a terminal), prefix the command with `ERB_DOMAIN=<slug>` rather than poking at any shared state.
- Concurrent UI tabs on different demos are fine; each call carries its own `?domain=`.

---

# Effortlessly Invariant Rulesbooks (ERB)

## Two categorically different kinds of rulebooks live in this repo

There are **two** kinds of rulebook here and they are NOT the same thing. Confusing them will break the project.

### 1. The top-level orchestration rulebook — the admin tool itself

- **Path (literal, fixed):** `./effortless-platform/effortless-rulebook/effortless-rulebook.json`
- **What it is:** The rulebook describing the ERB orchestration repo / admin tool itself. Hand-edited, built with `effortless build` run from inside `./effortless-platform/`. The admin app IS its own admin tool — no second-level wrapper.
- **Code that operates on it:** `tag-commit.sh`, `effortless-platform/admin-portal/server.js`, `orchestration/rulebook-cache.py`, `orchestration/cache-manager.py`, `effortless-platform/ssotme-proxy/server.py`, `effortless-platform/effortless.json`. These use the literal path.
- Do not rewrite these to look up the active demo. They are *categorically* not about the demos.
- **Why under `effortless-platform/`:** the platform folder is the wrapper "eating its own dog food" — the admin portal, postgres scripts, ssotme-proxy, the meta-rulebook and its own `effortless.json` live there together because they are *one* effortless project that happens to manage all the other ones. They are NOT required to run the tooling itself. See `./effortless-platform/README.md`.

### 2. The per-project demo rulebooks — what the orchestration manages

- **Path:** `./rulebook-examples/<project>/effortless-rulebook/<project>-rulebook.json`
- **What they are:** Example ontologies. Every subdirectory of `rulebook-examples/` that contains a `<project>-rulebook.json` IS a demo. There is no curated "canonical subset" — do not enumerate a partial list and treat it as authoritative; the filesystem is authoritative. The entire orchestration website/process/repo exists to manage *all* of these.
- **Code that operates on them:** `orchestration/orchestrate.sh` (via `get_domain_rulebook_path`), `orchestration/shared.py` (`get_rulebook_path`), all `execution-substrates/*/inject-into-*.py`, all `execution-substrates/*/take-test.py`, `orchestration/generate-report.py`, `orchestration/test-orchestrator.py`, `devops/rebuild-on-trigger.sh`. These resolve the active demo via the `ERB_DOMAIN` environment variable (or `ERB_RULEBOOK_PATH` when the exact rulebook file is named directly).
- **Filename is `<project>-rulebook.json`**, NOT `effortless-rulebook.json`. Each project's `effortless.json` carries `-o <project>-rulebook.json` accordingly.

#### Intentional structural exceptions

One subdir under `rulebook-examples/` deliberately carries no `<project>-rulebook.json`:

- `volunteer-shift-scheduler-demo/` — a demo-app scaffold that consumes `volunteer-shift-scheduler/`'s rulebook.

This is **not** a demo and is not in any "demos with a rulebook" denominator. Do not flag it as missing.

One subdir under `toy-rulebooks/` deliberately carries no `<project>-rulebook.json`:

- `naked-claude-vs-effortless-claude/` — an experiment tree comparing LLM behavior with and without ERB grounding (not an ontology itself).

#### Required transpilers for every new example project

Every new demo added under `rulebook-examples/` must include a `rulebooktorulespeak` entry in its `effortless.json` `ProjectTranspilers` array. This is not optional — rulespeak is the human-readable narrative output for every domain and must be available on all demos. The entry shape is:

```json
{
  "IsSSoTTranspiler": false,
  "Name": "rulebooktorulespeak",
  "RelativePath": "/rulespeak",
  "CommandLine": "rulebook-to-rulespeak -i ../effortless-rulebook/<project>-rulebook.json",
  "IsDisabled": false
}
```

Replace `<project>` with the directory/slug name. If you create a new example project and do not add this entry, that is a bug.

#### Required "Local transpiler bus" pointer in every example README

Every demo's `README.md` must end with a `## Local transpiler bus (` `localhost:4242` `)` section that points readers at the ssotme-proxy — the local HTTP server on `localhost:4242` that `./start.sh` boots from the repo root and that serves all 13 repo-local transpilers (`rulebook-to-postgres`, `rulebook-to-python`, `rulebook-to-golang`, `rulebook-to-cobol`, `rulebook-to-owl`, etc.) as first-class `ssotme://` routes any `effortless build` can call. Use this exact block (append it as the last section of the README):

```markdown
---

## Local transpiler bus (`localhost:4242`)

> **All 13 local transpilers live on `localhost:4242`.** Once you run
> `./start.sh` from the repo root, the ssotme-proxy exposes every repo-local
> transpiler — `rulebook-to-postgres`, `rulebook-to-python`, `rulebook-to-golang`,
> `rulebook-to-cobol`, `rulebook-to-owl`, and more — as first-class `ssotme://`
> routes any `effortless build` can call.
```

The transpiler count and route list are authoritative in `effortless-platform/ssotme-proxy/server.py` (the `TRANSPILERS` registry). If you add or remove a route there, update the count ("13") in this block across all demo READMEs to match. If you create a new example project without this section, that is a bug.

### Rules for agents

- Before changing any code that references a rulebook path, decide which of the two categories above the code belongs to. There is no "smart fallback" that handles both.
- The top-level path is a fixed literal. Never rewrite it to read the active domain.
- Per-project rulebook paths must be resolved dynamically — never hardcode `effortless-rulebook.json` for them. Use `get_domain_rulebook_path` (bash) or `get_rulebook_path()` (python).
- When creating a new example project, always include the `rulebooktorulespeak` transpiler entry (see above).

## `__meta__` table doctrine (applies to every rulebook — demos AND the platform)

Every rulebook in this repo carries its project-level metadata in a first-class `__meta__` table — same `{schema, data}` shape as every business table. Standard schema is the typed-row hybrid: `MetaKey` (string PK), `Name` (calculated, mirrors `MetaKey`), `ValueType` (`'string'|'object'|'array'`), `StringValue` (nullable), `JsonValue` (nullable JSON-encoded string). Defined in `orchestration/migrate-meta-to-table.py`.

Rules for agents:

- **Demos:** the `__meta__` table is the single home for project-level metadata. There is no other location — no root-level `_meta` object, no parallel sidecar.
- **Platform rulebook:** the `__meta__` table coexists with the promoted first-class narrative tables (`CMCCSummary`, `ProjectGoal`, `ArchitecturalHighlight`, `WriteThroughInvariant`, `PortalCliParity`, `BootstrapStory`, `DeveloperJourney`, `ResilienceClaim`). Those exist because each one earns its own table. **`__meta__` is the overflow bucket** for project-level metadata that does NOT deserve a table of its own — presentation hints (`tagline`, `motif`, `motif_palette`), reception-desk content (`description_rich`, `use_cases`, `signature_rows`, `journal_seed`), substrate-witness chips, etc.
- **Upgrade path:** any stray meta-data found in a rulebook JSON outside the table protocol (e.g. a legacy `_meta` object at the root) is to be promoted into the `__meta__` table — never left orphaned outside the protocol. Known structured keys may additionally be promoted to their own first-class table on the platform; everything else lands in `__meta__`. This is enforced by `orchestration/migrate-meta-to-table.py` (demos) and `orchestration/migrate-platform-meta.py` (platform, which routes mapped keys to first-class tables and unmapped keys to `__meta__`).
- **Reading:** Python consumers walk `rb["__meta__"]["data"]` like any other table. JS consumers import `metaAsObject(rb)` from `effortless-platform/admin-portal/client/src/rulebookMeta.js`, which folds the typed rows back to `{tagline, motif, use_cases, ...}`. Both work the same on the platform rulebook and on every demo rulebook.

**Coverage:** every `<project>-rulebook.json` in `rulebook-examples/` has a `__meta__` table. The platform rulebook has one too. There is no "partial coverage" status to track — if you find a rulebook without `__meta__`, that is a bug, not a typical state. Do not author docs that quote a partial fraction of demos with `__meta__`; quote either "all" or name the specific bug.

## Authoritative Source: rulebook JSON is HEAD

For every project (the top-level repo AND every `rulebook-examples/<project>/`), the rulebook JSON is the single, authoritative source of truth. Edit it directly. All other artifacts (Postgres SQL, Python, Go, Excel, OWL, etc.) are mechanically derived via `effortless build`.

### Airtable pull is disabled by default

The `airtabletorulebook` transpiler in each project's `effortless.json` is set to `IsDisabled: true` so a routine `effortless build` will never silently overwrite JSON edits with whatever is in Airtable.

If you want to re-enable Airtable pull for a single build, do it explicitly:

1. Confirm with the user that the rulebook JSON should be overwritten from Airtable.
2. Either run the transpiler one-off, or flip `IsDisabled` to `false` in `effortless.json`, run `effortless build`, then flip it back to `true`.

Default rule: treat the JSON as authoritative; do not invoke `airtabletorulebook` without explicit user consent on that specific turn.

### Never silently revert a rulebook JSON

Treat each rulebook JSON as sacred — it contains human-authored business rules. Before running any command that could touch the file (`effortless build`, `airtabletorulebook`, any sync script, any `git checkout`/`git restore`), run `git status` / `git diff` on it first.

- If the file has uncommitted changes you did NOT just make this turn, **stop** and ask before proceeding.
- It is only acceptable to let a regeneration touch this file when the only uncommitted edits in it are ones you just made this turn.

There is no upstream to "restore from." The JSON is the upstream.

## Architecture Overview

**Three Effortless tools** form a hub-and-spokes around Airtable: **airtable-to-rulebook**, **rulebook-to-postgres**, **rulebook-to-airtable**. The rulebook is a disposable IR.

**Expressiveness is a per-substrate property, and it is recorded as data — not a Postgres-vs-everyone-else tier.** The platform rulebook's `ExecutionSubstrates` table has an `Expressive` column whose value is `full`, `partial-formula`, or `shape-only` for each substrate, plus a `Maturity` column (`reference-quality` / `demonstrating` / `prototype`). That table is the single source of truth for "what can this substrate express" — read it, don't assert a hierarchy from memory.

- **No substrate is privileged.** Postgres is not "the only complete one." Many substrates are fully expressive (`Expressive: full`) — Postgres, Python, Go, Excel, Entity Framework, the Explain-DAG, and others. Postgres is the *reference-quality* answer key for convenience, not the ceiling of what the method or the other substrates can express.
- **The Effortless tools are all expressively complete.** The licensed `rulebook-to-*` Effortless tools (under `licensed-effortless-tools/`) fully support complex aggregations, multi-table lookups/JOINs, window/GROUP-BY aggregations, recursive/closure formulas, and all formula types.
- **A few OPEN reference injectors are intentionally partial — on purpose, and that is not a limitation of the demo, the conformance set, or the method.** Some open-source substrates under `execution-substrates/` are `partial-formula` (e.g. ARM64 binary, OWL) or `shape-only` (e.g. CSV, PlantUML). They exist to prove the rulebook is portable to wildly different targets *cheaply* — a CSV substrate is shape-only because CSV has no formula engine, not because ERB "doesn't support" the formula. Their partialness is a fact about that one target, recorded in its `Expressive` cell, and it says nothing about the breadth of the rulebook, the catalog (~30 domains, most fully expressive), or any other substrate.

**Never write "Postgres has no limitations; other substrates have demonstration gaps," "the open demo runs on a shallow/limited formula vocabulary," or any phrasing that lists recursion / window-aggregations / multi-table joins as unsupported in the open demo.** That framing is wrong and was the root cause of repeated LLM misreadings. When you need to state what a substrate can express, quote its `Expressive` value from the `ExecutionSubstrates` table.

Three-layer architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    RULEBOOK (Core)                      │
│   - Single source of truth for all business logic       │
│   - Entity schemas with field types and descriptions    │
│   - Formulas for calculated fields (Excel-style)        │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  ORCHESTRATION                          │
│   - orchestrate.sh: BUILD = generate + test + regen +   │
│                    open report (always; no skips)       │
│   - shared.py: Common utilities                         │
│   - formula_parser.py: Parses Excel-style formulas      │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              EXECUTION SUBSTRATES                       │
│              execution-substrates/*/                    │
│   - Each substrate MUST have: inject-substrate.sh,      │
│     take-test.sh, create-substrate-report.sh            │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              CONFORMANCE TESTING                        │
│   - Tests prove all substrates compute identically      │
│   - Reports regenerate AND open on every build          │
└─────────────────────────────────────────────────────────┘
```

## Build = generate + test + regen report + open. ALWAYS.

There is no "build without testing." There is no "regenerate the report without running tests." The menu has one rebuild path:

- **[B] BUILD** runs all transpilers, then runs every substrate's conformance test, then regenerates `orchestration-report.html`, then opens it.
- **[1-9] (individual transpiler)** runs that one transpiler, then runs that substrate's conformance test, then regenerates the report, then opens it.

There is no `[T]est` menu option. Testing is part of build. If a substrate has no `take-test.sh`, that is a bug to fix — not a case to handle.

## Key Principles

1. **Rulebook is the source of truth** — never hardcode business logic in substrates.
2. **Modify injectors, not generated files** — `inject-into-*.py` scripts generate the code.
3. **Formula semantics are Excel-compatible** — IF(), AND(), OR(), CONCAT(), LEFT(), RIGHT(), etc.
4. **Every substrate must pass the same tests** — conformance ensures identical results.

## ssotme-proxy (localhost:4242)

`ssotme-proxy` is a local HTTP server that makes the repo's injector scripts behave like first-class ssotme:// transpilers. It IS the mechanism, not a wrapper.

### Wire protocol

Each transpiler is a route:

```
POST http://localhost:4242/rulebook-to-python
POST http://localhost:4242/rulebook-to-postgres
POST http://localhost:4242/airtable-to-rulebook
```

The server runs the corresponding injector with:
- `ERB_RULEBOOK_PATH` — input rulebook path
- `ERB_OUTPUT_DIR` — output folder (e.g. `acme-llc/python/`)

### Installing a transpiler into a project

The `effortless` CLI handles registration — never edit `effortless.json` by hand to add transpiler entries:

```bash
cd rulebook-examples/acme-llc/python/
effortless -install http://localhost:4242/rulebook-to-python \
    -i ../effortless-rulebook/acme-llc-rulebook.json
```

---

# Making a video about a demo? Load the `effortless-video` skill.

Videos about these rulebooks are **not** produced in this repo. They live in the
sibling multi-video producer:

```
../effortless-vid-01-full-name/videos/<NN-slug>/
```

Each video is itself an Effortless project — a rulebook (`Storyboards → Acts →
Scenes → Clips → Assets`) that gets rendered. The story is changed by editing
that rulebook and running `effortless build`, never by hand-editing
`STORYBOARD.md` or reaching into `server/*.mjs`.

**Whenever the user asks to make / storyboard / script / render a video about a
demo here, invoke the `effortless-video` skill first.** The reference-quality
example is `videos/03-closure` (Transitive Closure, Made Obvious) — read its
`ANIMATION-SPEC.md` before authoring a new one.
