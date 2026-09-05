# Effortless Rulesbooks — Effortless Project

<!-- rulebook-authoritative-banner -->
## Authoritative Source: `effortless-rulebook/effortless-rulebooks-rulebook.json` is HEAD

For this project, **`effortless-rulebook/effortless-rulebooks-rulebook.json` is the single, authoritative source of truth.** Edit it directly. All other artifacts (Postgres SQL, Python, Go, Excel, OWL, etc.) are mechanically derived from it via `effortless build`.

### Airtable pull is disabled by default

The `airtabletorulebook` transpiler in `effortless.json` is set to `IsDisabled: true` / `Enabled: false` so that **a routine `effortless build` will never silently overwrite your JSON edits with whatever is in Airtable**.

If you want to re-enable Airtable pull as the source of truth for a single build, you must do it explicitly and with intent:

1. Confirm with the user that the rulebook JSON should be overwritten from Airtable.
2. Either:
   - Run the transpiler one-off:
     ```bash
     effortless airtabletorulebook -o effortless-rulebook/effortless-rulebooks-rulebook.json -account airtable -p "view=Grid view"
     ```
   - Or flip `IsDisabled` back to `false` in `effortless.json`, run `effortless build`, then flip it back to `true`.

**Default rule for Claude / any agent operating in this project:** treat the JSON as authoritative; do not enable or invoke `airtabletorulebook` without explicit user consent on that specific turn. Memory or "we usually pull from Airtable" is not consent — every pull must be a fresh, in-context decision.
### Never silently revert `effortless-rulebooks-rulebook.json`

**Treat `effortless-rulebook/effortless-rulebooks-rulebook.json` as sacred.** It contains human-authored business rules and CANNOT be casually overwritten. Before running any command that could touch this file — `effortless build`, `effortless airtabletorulebook`, any transpiler that writes to it, any sync script, any `git checkout`/`git restore` against it — first run `git status` / `git diff` on it.

- If the file has uncommitted changes that you (the agent) did NOT just make this turn, **stop**. Ask the user before proceeding.
- It is only acceptable to let a regeneration touch this file when you are certain the *only* uncommitted edits in it are ones you just made in the current turn.
- This applies to every `**/effortless-rulebook/effortless-rulebooks-rulebook.json` in this repo, not just the project-local one.

There is no upstream to "restore from." The JSON is the upstream.

<!-- /rulebook-authoritative-banner -->

This folder is a **self-contained Effortless Rulebook (ERB) project**. The rulebook is the single source of truth. All other artifacts (Postgres, Python, Go, substrates) are mechanically derived from it.

## Rulebook

**Location:** `effortless-rulebook/effortless-rulebooks-rulebook.json`

This is a **meta-ontology**: the ERB project describing itself. Tables:

| Table | Description |
|-------|-------------|
| `ProjectMetadata` | Top-level project identity and architecture |
| `ExecutionSubstrates` | Runtime environments (Python, Go, Postgres, OWL, etc.) |
| `OrchestrationComponents` | Scripts that coordinate substrate generation and testing |
| `AirtableIntegration` | Tools that sync between Airtable and the rulebook |
| `TestingFramework` | Conformance test scripts and answer-key generators |
| `RulebookDomains` | The example ontologies included in the repo |
| `CoreDataFlows` | The key data pipelines (Airtable → rulebook → substrates → tests) |
| `ProjectConfiguration` | Config files (.env, effortless.json, docker-compose.yml, etc.) |
| `Dependencies` | External tools and libraries required to run the project |

## App

**Location:** `app/`

A React + Express Postgres table browser. Run with:

```bash
cd app && npm install && npm run dev
```

Serves a sidebar of tables/views and a grid of rows for whichever table is selected.

## Editing

### Option 1: Direct (no Airtable)

Edit `effortless-rulebook/effortless-rulebooks-rulebook.json` directly. Then rebuild:

```bash
effortless build
```

### Option 2: Reverse-sync (rulebook → Airtable)

If you've edited the rulebook directly and want to push back to Airtable:

```bash
effortless rulebooktoairtable
```

## Key Files

| File | Purpose |
|------|---------|
| `effortless.json` | Project config + transpiler settings |
| `CLAUDE.md` | This file |
| `effortless-rulebook/effortless-rulebooks-rulebook.json` | The rulebook (SSoT) |
| `app/` | React + Express Postgres table browser |
| `execution-substrates/*/` | Generated: do not edit |

---

**The rulebook is the specification. Everything else is derived.**
