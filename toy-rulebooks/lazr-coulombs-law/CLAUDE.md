# Lazr Coulomb's Law — Effortless Rulebook Project

This is an **Effortless Rulebook (ERB)** project. The SSoT is
`effortless-rulebook/effortless-rulebook.json`. It is generated into Postgres
SQL under `postgres/` and loaded into a local Postgres DB by `init-db.sh`. The
rulebook is edited directly (Rulebook-First, the best-practice default); if the
project opted into an upstream surface (Airtable / Excel / Notion), that surface
is one optional input spoke pulled into the rulebook via its `*-to-rulebook`
transpiler.

When working in this project, load the relevant `effortless-*` skills:

- `effortless-orchestrator` — overview / entry point
- `effortless-setup-postgres` — initial setup (already run for this project)
- `effortless-workflow` — making changes (edit the hub → build)
- `effortless-loop` — CHANGE-RULE → REBUILD → CONSUME-VIEWS cycle
- `effortless-sql` — `vw_*` view / function patterns; never read base tables
- `effortless-query` — querying the rulebook JSON
- `effortless-conventions` — naming, FK, DAG rules
- `effortless-pipeline` — `effortless build` pipeline + `effortless.json`
- `effortless-cli` — CLI flags / commands

## NO MIGRATIONS — read before touching Postgres

This project's local Postgres DB is **regenerated from scratch on every
`effortless build`** via `init-db.sh` (drop + recreate). There is no
`migrations/` folder, no migrations tracking table, no incremental SQL
deltas in this paradigm.

**To change schema, RLS, calculated fields, or seed data:**
1. Edit the rulebook (or the Airtable/Excel/etc. surface, if the project is
   connected to one).
2. Run `effortless build`.
3. The DB is wiped and rebuilt. Done.

**Never on this DB:**
- Run `CREATE TABLE` / `ALTER TABLE` / `DROP TABLE` against the local DB.
- Create files under `postgres/migrations/` (folder shouldn't exist for a
  local-dev project).
- Insert into a `migrations` (or `schema_migrations`) tracking table.
- Edit generated `0*.sql` files in `postgres/` (they get overwritten).

**The redirect:** if the answer feels like "write a migration," the
answer is **"edit the rulebook and rerun `effortless build`."**

## Build discipline (applies every time)

`effortless build` regenerates `effortless-rulebook/` and `postgres/` and
DROPS + re-inits the local Postgres DB. Hand-edits in those folders will
be lost.

Effortless skills are **read-only with respect to git** — they may run
`git status`, `git diff`, `git log`, but never `git add`, `git commit`, or
any other write command. Around every `effortless build`:

1. **Before:** run `git status --porcelain` (read-only). If non-empty,
   **pause and ask the user for permission to build** — they may want to
   commit or stash first so the resulting diff cleanly isolates the build
   output.
2. **Run** `effortless build`.
3. **After:** the tree will be dirty with regenerated files. Leave it for
   the user to commit when they choose. Do not auto-commit on their behalf.

## See also

- `effortless-orchestrator` — for the canonical Token Discipline + the bigger mental model.
- `effortless-cli` — for installing / updating / using the `effortless` CLI binary.
- `effortless-pipeline` — for the install / build commands.
- `effortless-loop` — for the iterative cycle once setup is done.
