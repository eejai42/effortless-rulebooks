# Project rules — Effortless Claude run

This is an Effortless Rulebook (ERB) project targeting PostgreSQL.

## MANDATORY FIRST STEP — do this BEFORE writing any application code

Run these commands in order. Do NOT invoke any skills — just execute the
commands directly. The pipeline is mechanical: run it, trust it, move on.

```bash
# 1. Initialize project (from project root)
effortless init
effortless -addSetting baseId=<BASE_ID>

# 2. Pull rulebook from Airtable
mkdir -p effortless-rulebook && cd effortless-rulebook
effortless -install airtable-to-rulebook -p baseId=<BASE_ID> -account airtable -o effortless-rulebook.json
effortless build

# 3. Generate SQL from rulebook
mkdir -p ../postgres && cd ../postgres
effortless -install rulebook-to-postgres -i ../effortless-rulebook/effortless-rulebook.json
effortless build

# 4. Fix DB name and run
# Edit postgres/reset-rulebook-db.sh → set DB_NAME="naked-effortless-effortless-db"
chmod +x reset-rulebook-db.sh && ./reset-rulebook-db.sh
```

That's it. Once reset-rulebook-db.sh succeeds, your database has `vw_*` views ready
to query. Move immediately to writing application code.

## Key convention: view naming

Every Airtable table `Foo` becomes a PostgreSQL view `vw_foo` (lowercase,
prefixed with `vw_`). The view columns match the Airtable field names in
snake_case. **You do not need to read the generated SQL files** — just
query `vw_<tablename>` with the columns you expect from the specification.

## Hard rules
- DO NOT modify Airtable in any way (no REST API writes, no OMNI, no
  Playwright). Treat the Airtable schema as read-only.
- DO NOT hand-write DDL/SQL schema. All schema comes from `effortless build`.
- DO NOT leave background processes running after you finish.
- DO NOT invoke skills or read generated SQL files during setup. Trust the
  pipeline output and move on to app code.

## What you SHOULD do
- Read from `vw_*` views, never from base tables.
- Include `effortless build` in your `start.sh` for reproducibility.
- If you need to confirm view columns, run a quick
  `psql -d <dbname> -c "\d vw_<table>"` — don't load skills for this.

## Required deliverables
- A working Effortless pipeline (effortless.json, effortless-rulebook/,
  postgres/) that can regenerate the database from scratch.
- Source code for a node/vite-react app using the generated views.
- A `start.sh` at the repo root that brings the whole app up end-to-end:
  runs `effortless build`, runs `reset-rulebook-db.sh`, installs deps, starts the
  backend + frontend. The grader will run `./start.sh` to test.

## When you are done
- Stop. Exit. Do not leave dev servers running.
