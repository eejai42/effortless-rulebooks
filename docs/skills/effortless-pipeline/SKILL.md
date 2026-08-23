<!-- DERIVED ARTIFACT — DO NOT EDIT BY HAND -->
<!-- Source: https://raw.githubusercontent.com/effortlessapi/effortless-claude/main/skills/effortless-pipeline/SKILL.md -->
<!-- Mirrored by: docs/skills/clone-skills.sh -->
<!-- Update: cd effortless-platform && effortless clone-skills -->

---
name: effortless-pipeline
description: >
  Use when working with the ERB build pipeline — effortless.json configuration,
  transpiler catalog, effortless build commands, the -id flag, transpiler
  installation, or understanding how the build flows from the rulebook hub
  through to generated code.

  **Scope (load gate):** Effortless projects only — project root must contain `effortless.json` AND a CLAUDE.md identifying the project as ERB methodology. Do NOT load otherwise.
audience: customer
---

# The effortless.json Build Pipeline

## Structure

```json
{
  "Name": "Project Name",
  "Description": "Optional description",
  "ProjectSettings": [
    { "Name": "project-name", "Value": "my-project" }
  ],
  "ProjectTranspilers": [
    {
      "Name": "rulebooktopostgres",
      "RelativePath": "/postgres",
      "CommandLine": "rulebook-to-postgres -i ../effortless-rulebook/effortless-rulebook.json",
      "IsDisabled": false
    }
  ]
}
```

The example above is a Rulebook-First project: the rulebook is authored directly
and projected to Postgres. A project that opted into an upstream surface adds an
*input-spoke* transpiler too — e.g. `airtable-to-rulebook` (plus a `baseId` and
`_apikey_` in `ProjectSettings`) for Airtable. See "Finding the Base ID and API Key"
below for that case.

## Key Transpilers

| Transpiler | Direction | What It Does |
|------------|-----------|-------------|
| `minimize-rulebook` | JSON -> JSON (derived) | Generates an escalation ladder next to the rulebook: `read-me-1st.txt` → `schema.min.json` → `schema.json` → `data.json` (data rows, on-demand only). Register it FIRST in `ProjectTranspilers` (before the output spokes). See `effortless-query` for the read order. |
| `airtable-to-rulebook` | Airtable -> JSON | Pulls schema + data from Airtable base into `effortless-rulebook.json` |
| `rulebook-to-postgres` | JSON -> SQL | Generates all `00`-`05` SQL files from the rulebook |
| `rulebook-to-sql-server` | JSON -> T-SQL | Same `00`-`05` layout for SQL Server (`sql-server/`) |
| `rulebook-to-airtable` | JSON -> Airtable | Pushes rulebook back to an Airtable base (reverse sync) |
| `init-db` | SQL -> Postgres | Runs `init-db.sh` to bootstrap the database |
| `json-hbars-transform` | JSON + Handlebars -> Docs | Generates documentation (README.SCHEMA.md etc.) |
| `rulebook-to-xlsx` | JSON -> Excel | Generates spreadsheet export |
| `rulebook-to-rulespeak` | JSON -> Markdown + HTML | Plain-English RuleSpeak® (`rulespeak/rulespeak.html`, `rulespeak.md`) — **default whenever a rulebook is created** |
| `airtable-to-odxml` | Airtable -> ODXML | Generates XML metadata for .NET |
| `odxml-to-csharp-pocos` | ODXML -> C# | Generates Entity Framework classes |

## Finding the Base ID and API Key (Airtable-connected projects only)

Only relevant if the project opted into Airtable as an input spoke. The full
mechanics live in `effortless-airtable`; the short version:

1. **Base ID**: `effortless.json` -> `ProjectSettings` -> `baseId`. The canonical location all airtable-facing tools read from.
2. **API Key** (priority order): `AIRTABLE_API_KEY` env -> `~/.ssotme/ssotme.key` (`APIKeys.airtable`) -> `effortless.json` -> `ProjectSettings._apikey_`.
3. **Setting the API Key**: `effortless -setAccountAPIKey airtable=patXXXXXXXX.XXXXXXXX`

## Running a Build

```bash
effortless build       # Runs all enabled transpilers in order (from project root)
effortless build -id   # Runs ALL transpilers, INCLUDING disabled ones
```

### Builds Are Atomic — Zero Context Cost

**`effortless build` is a fire-and-forget operation.** It deterministically regenerates
files from the rulebook. After running it:

- Do NOT read the generated files to "verify" or "understand" them
- Do NOT load skills to interpret build output
- Do NOT cat SQL files into your context window
- **Before building, check the tree.** Run `git status --porcelain` (read-only). If non-obvious changes
  are present, pause and ask the user for permission to build — they may want to commit or stash first
  so the resulting diff cleanly isolates the build output.
- **Do NOT commit on the user's behalf.** After the build completes, the working tree will be dirty
  with regenerated files. That's fine — leave it for the user to commit when they choose. Don't run
  `git add`, `git commit`, or any other git write command. Effortless skills only ever read git
  (`git status`, `git diff`, `git log`), they don't drive it.
- Then proceed to use the views in app code

The correct mental model: `effortless build` is like `npm install` — you run it and
trust that it worked. You don't read `node_modules/` afterwards.

If you need schema information AFTER a build, query the rulebook with a targeted
one-liner (see `effortless-query`) or run `psql -c "\d vw_tablename"`.

---

- **From project root**: `effortless build` reads `effortless.json` and runs each enabled transpiler in its `RelativePath` directory. Disabled transpilers (`"IsDisabled": true`) are skipped.
- **From a subfolder**: `effortless build` can also be run from any subfolder that contains its own `effortless.json` or is referenced as a `RelativePath`. This is how you run a specific transpiler in isolation.
- **The `-id` flag** (include disabled): Forces execution of all transpilers, even those marked `"IsDisabled": true`. This is essential for the reverse-sync workflow (rulebook → Airtable), where `rulebook-to-airtable` is intentionally disabled during normal builds but needs to run when mirroring hub edits back to Airtable.

**Example: Pushing rulebook changes back to Airtable:**
```bash
cd effortless-rulebook/push-to-airtable/
effortless build -id    # Runs rulebook-to-airtable (normally disabled)
```

## Installing Effortless Transpilers

Transpilers are installed using the `effortless` CLI with the `-install` flag. **CRITICAL: each tool MUST be installed from the directory where its output is expected.** The exact syntax is:

```bash
effortless -install <transpiler-name> -p param1=value1 -i input-file.txt -o output-file.json
```

The installed transpiler configuration is stored in `effortless.json` under `ProjectTranspilers`, recording:
- `RelativePath` — the folder the install was run from (relative to project root)
- `CommandLine` — the full command with all flags

### Standard Tool Installation Paths

Each tool MUST be installed from its designated directory. The output spokes
below are the common core; the input-spoke transpilers are optional and only
appear in a project that opted into an upstream surface:

```bash
# --- output spokes (regenerate from the hub) ---
# From /postgres/
effortless -install rulebook-to-postgres -i ../effortless-rulebook/effortless-rulebook.json

# From /sql-server/
effortless -install rulebook-to-sql-server -i ../effortless-rulebook/effortless-rulebook.json

# From /docs/
effortless -install rulebook-to-docs

# --- input spokes (optional — only if seeding the hub from an upstream surface) ---
# From /bootstrap/
effortless -install raw-text-to-rulebook -i requirements.txt -o bootstrap-rulebook.json

# From /effortless-rulebook/   (Airtable-connected projects only)
effortless -install airtable-to-rulebook -o effortless-rulebook.json -account airtable

# From /effortless-rulebook/push-to-airtable/   (Airtable-connected projects only)
# ** THIS TOOL MUST BE DISABLED — not run by default **
effortless -install rulebook-to-airtable -i ../effortless-rulebook.json -account airtable
```

**Critical (Airtable-connected projects):** The `rulebook-to-airtable` tool in `push-to-airtable/` must be disabled (`"IsDisabled": true`) so it is NOT run during a normal `effortless build`. It is only invoked explicitly with `effortless build -id` for reverse-sync (rulebook hub → Airtable mirror). Every airtable-facing tool MUST include `-account airtable` so the CLI sends the API key from `~/.ssotme/ssotme.key`.

## Pipeline Flow

```
Airtable Base (optional input spoke)
    |  airtable-to-rulebook
    v
effortless-rulebook.json  ← THE HUB / SSoT
    |                    |                    |
    |  rulebook-to-      |  rulebook-to-      |  json-hbars-
    |  postgres          |  xlsx              |  transform
    v                    v                    v
postgres/            output.xlsx          README.SCHEMA.md
(00-05 SQL files)
    |  init-db
    v
Running PostgreSQL Database
```

Other input spokes can also write to the hub — LLM-direct edits, hand edits, or
reverse-sync — and any of them feed the same downstream transpilers. Airtable is one
optional input, not the source of truth.

## Two deployment shapes — and only one of them uses migrations

The pipeline above ends at the same generated SQL regardless of where it lands. What differs is **how that SQL is applied to a live DB**:

| Shape | How schema is applied | Has `migrations/`? | Has migrations tracking table? |
|-------|----------------------|--------------------|---------------------------------|
| **Local-dev Postgres** (default) | `init-db.sh` drops + recreates the DB on every build | NO | NO |
| **Bases** (`bases.effortlessapi.com`) | `postgres/apply-migration.sh` applies one delta file at a time | YES (`postgres/migrations/`) | YES (`.applied.log`) |

**Schema still originates in the rulebook on both paths.** Bases doesn't author schema in migration files — it *delivers* rulebook deltas to a DB that can't be dropped. Never author business entities directly in a migration file; never write a migration on a local-dev project.

If the project has no `BASES_DATABASE_URL` and no "Bases is migration-only" block in CLAUDE.md, you're on the local-dev shape: **no migrations, ever.** See `effortless-workflow` "NO MIGRATIONS" for the canonical rule.

## Multi-Substrate Architecture

The rulebook is **substrate-agnostic**. The same JSON generates equivalent implementations across:

| Substrate | Generated From | Role |
|-----------|---------------|------|
| **PostgreSQL** | `rulebook-to-postgres` | Primary reference (deterministic, full formula coverage) |
| **Python** | `inject-into-python.py` | Dataclasses + calc methods |
| **Go** | `inject-into-golang.py` | Structs + business logic |
| **Excel/XLSX** | `rulebook-to-xlsx` | Native spreadsheet formulas |
| **C# / .NET** | `odxml-to-csharp-pocos` | Entity Framework classes |
| **OWL/RDF** | `inject-into-owl.py` | Semantic web ontology |
| **YAML** | `inject-into-yaml.py` | LLM-friendly serialization |
| **UML** | `inject-into-uml.py` | PlantUML entity-relationship diagrams |

**Key principle:** No execution substrate defines truth; all substrates merely project and compute from the rulebook.

### Conformance Testing
- **Blank test**: Load data with calculated fields set to NULL
- **Execute**: Each substrate computes the calculated fields
- **Grade**: Compare output to answer-key. All deterministic substrates must match exactly.

For a runnable demonstration with 11+ substrates including ARM64, COBOL, OWL/SHACL, and English prose, see `effortless-rulebooks`.

---

## The ssotme:// Protocol — Why This Pipeline Has the Shape It Has

The `effortless` CLI is the local driver of a broader open architecture: the
**ssotme:// protocol** ([github.com/SSoTme](https://github.com/SSoTme)). Understanding
the protocol clarifies why the pipeline is shaped the way it is.

### The Protocol in One Paragraph

A transpiler is a self-contained tool that consumes one well-defined input
artifact and produces one well-defined output artifact. Transpilers are
**registered** (not bundled) — `effortless -install <name>` clones a transpiler
from its source repo, records its `RelativePath` and `CommandLine` in
`effortless.json`, and from then on `effortless build` runs each registered
transpiler in order. The protocol is what makes the catalog **open** — anyone
can publish a transpiler that joins the pipeline, and any substrate the
community cares about becomes a generation target.

### Why It's a Protocol, Not a Monorepo

A monorepo would couple every substrate to a single release cadence and a
single maintainer's priorities. A protocol-shaped registry makes substrates
**peripheral** — they can evolve independently, be authored by different teams,
and be added or dropped per-project via `effortless.json` without touching the
core CLI or the rulebook IR. This is the operational analogue of the CMCC
claim that substrates are interchangeable peripherals (see `effortless-cmcc`).

### What the Protocol Guarantees

- **The IR is the contract.** Every transpiler agrees on `effortless-rulebook.json`
  as input (or some derivative of it). The IR shape is the only thing all
  transpilers must respect.
- **Determinism.** Same rulebook in → same artifact out. No transpiler is
  allowed to be order-dependent or environment-dependent in ways that defeat
  reproducibility.
- **Conformance.** When multiple transpilers target executable substrates, the
  conformance suite (see `effortless-rulebooks`) is the gate that proves they
  all compute the same answers.

### What the Protocol Does NOT Guarantee

- It does not guarantee that an arbitrary third-party transpiler is correct.
  Trust is earned by passing the conformance suite, not by being installable.
- It does not guarantee performance equivalence across substrates — only
  semantic equivalence (same answers).
- It does not constrain how a transpiler is implemented internally — only its
  IR contract and its determinism.

### When You Care About the Protocol vs. Just `effortless build`

Most of the time, you don't. `effortless build` Just Works. You only need the
protocol layer when:

- Adding a new substrate to a project (registering a transpiler from a different
  directory than the standard ones).
- Debugging why a transpiler isn't producing what you expect (is it the
  rulebook, the transpiler, or the registration?).
- Authoring a new transpiler. (If this is the work you're doing, the protocol
  is the contract you're implementing against.)

For the catalog of public transpilers and their source repos, see `effortless-ecosystem`.

---

## See also

- `effortless-orchestrator` — canonical Token Discipline (atomic builds); this skill restates the rule from the pipeline angle.
- `effortless-cli` — for the CLI flags and command surface that drive the pipeline.
- `effortless-setup-postgres` — for the canonical first-run install order (which transpiler from which directory).
- `effortless-workflow` — for choosing input spokes (rulebook-direct, Airtable, reverse-sync) and when `-id` is appropriate.
- `effortless-loop` — for the iterative dev cycle the pipeline supports.
- `effortless-cmcc` — the conjecture that justifies the substrate-equivalence stance.
- `effortless-rulebooks` — the empirical demonstration of multi-substrate equivalence.
- `effortless-ecosystem` — the catalog of public transpiler repos and the orgs that maintain them.

---

## Magic-links refactor (v0.2)

> See [../../MAGIC_LINKS_REFACTOR.md](../../MAGIC_LINKS_REFACTOR.md) §5 for the canonical v0.2 magic-links contract.

New build modes from plan 04 (rulebook-to-postgres):
- Default `check-don't-drop` (transpiler param `mode=check-add`): re-runs are safe; preserves data; runs all `NN[b]?-*.sql` files in lex order; re-runs `install-magic-links.sql` first. (NOTE: full SQL emission for check-add is Phase 2.5; the init-db.sh-side changes are live.)
- Nuclear (`drop-all=true`): localhost only; the transpiler refuses for stage in {staging, prod}.
- `.sql.disabled` skip: rename `04b-customize-policies.sql` → `.sql.disabled` to opt out for one build; init-db.sh logs `[SKIP]`.

Always run with `check-don't-drop` against any base you didn't create in the same conversation. Nuclear is opt-in via the user typing it explicitly.
