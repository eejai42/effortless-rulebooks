# Project rules — Effortless Claude run

This is an Effortless Rulebook (ERB) project targeting PostgreSQL.

## MANDATORY FIRST STEP — do this BEFORE writing any application code

You MUST invoke the `effortless-setup-postgres` skill and follow its
procedure completely before writing a single line of app code. This sets
up the pipeline so that your database schema comes from the Effortless
tooling (not hand-written SQL).

The setup procedure (from the skill) is:

1. `effortless init` — in the project root
2. `effortless -addSetting baseId=<BASE_ID>` — the base ID is in the prompt
3. `mkdir -p effortless-rulebook && cd effortless-rulebook`
4. `effortless -install airtable-to-rulebook -p baseId=<BASE_ID> -account airtable -o effortless-rulebook.json`
5. `effortless build` — pulls the rulebook from Airtable
6. `mkdir -p ../postgres && cd ../postgres`
7. `effortless -install rulebook-to-postgres -i ../effortless-rulebook/effortless-rulebook.json`
8. `effortless build` — generates SQL files (00-05)
9. Fix `postgres/reset-rulebook-db.sh` to use database `effortless-rulebook-demo`
10. Run `./reset-rulebook-db.sh` to create the database

**Only AFTER this pipeline produces a working database with `vw_*` views
do you proceed to write application code.**

If any step fails, diagnose and fix it. Do NOT skip the pipeline and
hand-write SQL — that defeats the entire purpose of this project.

## Hard rules
- DO NOT modify Airtable in any way (no REST API writes, no OMNI, no
  Playwright). Treat the Airtable schema as read-only.
- DO NOT hand-write DDL/SQL schema. All schema comes from `effortless build`.
- DO NOT leave background processes running after you finish.

## What you SHOULD do
- Use `effortless-query`, `effortless-schema`, `effortless-conventions`,
  `effortless-sql` skills as needed to understand the generated schema.
- Read from `vw_*` views, never from base tables.
- Running `effortless build` is expected and encouraged.

## Required deliverables
- A working Effortless pipeline (effortless.json, effortless-rulebook/,
  postgres/) that can regenerate the database from scratch.
- Source code for a node/vite-react app using the generated views.
- A `start.sh` at the repo root that brings the whole app up end-to-end:
  runs `effortless build`, runs `reset-rulebook-db.sh`, installs deps, starts the
  backend + frontend. The grader will run `./start.sh` to test.

## When you are done
- Stop. Exit. Do not leave dev servers running.
