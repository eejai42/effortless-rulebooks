<!-- DERIVED ARTIFACT — DO NOT EDIT BY HAND -->
<!-- Source: https://raw.githubusercontent.com/effortlessapi/effortless-claude/main/skills/effortless-setup-sql-server/SKILL.md -->
<!-- Mirrored by: docs/skills/clone-skills.sh -->
<!-- Update: cd effortless-platform && effortless clone-skills -->

---
name: effortless-setup-sql-server
description: >
  Use when setting up an Effortless project with SQL Server as the execution
  substrate — installing `rulebook-to-sql-server`, generating T-SQL under
  `sql-server/`, running `init-db.sh` via sqlcmd, and wiring an Express app
  to `mssql`. Mirrors `effortless-setup-postgres` for the SQL Server path.

  Triggers: "rulebook-to-sql-server", "sql-server transpiler", "setup SQL
  Server", "switch from Postgres to SQL Server", "mssql demo app", "sqlcmd
  init-db".

  **Scope (load gate):** Effortless projects with `effortless.json` + ERB
  CLAUDE.md, OR when the user explicitly asks to install/use
  rulebook-to-sql-server.
audience: customer
---

# Effortless Setup: SQL Server from the Rulebook

> **Token Discipline:** Same as Postgres — `effortless build` is atomic. Do
> not read generated `sql-server/*.sql` into context to "verify"; query live
> views with `sqlcmd` if needed.

> **NO MIGRATIONS on local-dev SQL Server.** Schema changes go through the
> rulebook → `effortless build` → `init-db.sh`. The local DB is rebuilt from
> generated T-SQL on every build (check-add / idempotent scripts, not delta
> migrations). See `effortless-workflow`.

## What `rulebook-to-sql-server` does

Remote transpiler: `effortless rulebook-to-sql-server` (catalog:
`effortless/effortless/rulebook-to-sql-server`).

**Input:** `effortless-rulebook/effortless-rulebook.json` (the hub).

**Output:** `sql-server/` — T-SQL projection of the rulebook:

| File | Purpose |
|------|---------|
| `00-bootstrap.sql` | DB bootstrap |
| `01-drop-and-create-tables.sql` | Raw columns only (check-add, idempotent) |
| `02-create-functions.sql` | `calc_*()` / lookup / aggregation as T-SQL functions |
| `03-create-views.sql` | `vw_*` views (raw + calculated columns) |
| `04-create-policies.sql` | Row-level security (security policies + predicate functions) |
| `05-insert-data.sql` | `MERGE` seed data from rulebook |
| `99-fk-constraints.sql` | FK enforcement (skipped unless `EFFORTLESS_ENFORCE_FKS=true`) |
| `*b-customize-*.sql` | Hand-edited customization slots; seeded once, never overwritten |
| `init-db.sh` | Runs all `NN[b]?-*.sql` in lex order via **sqlcmd** |

Default generation mode: **check-add** (stage **dev**) — safe re-runs; does
not drop columns. Functions use `CREATE OR ALTER`; data uses `MERGE`.

## Prerequisites

- `effortless` CLI installed and logged in — see `effortless-cli`
- **SQL Server** reachable (Docker: `mcr.microsoft.com/mssql/server:2022-latest`
  on port **1433** is the usual dev path)
- **`sqlcmd`** on PATH (`brew install sqlcmd` on macOS — the Go-based client
  supports legacy `-S -U -P -C -b -I -i` flags that `init-db.sh` uses)

Preflight:

```bash
command -v effortless >/dev/null && effortless -version
command -v sqlcmd    >/dev/null && sqlcmd --version
docker ps 2>/dev/null | grep -i 1433 || echo "check SQL Server on :1433"
```

## GOLDEN RULE — `cd` into `/sql-server/` before `-install`

```bash
mkdir -p sql-server && cd sql-server
effortless -install rulebook-to-sql-server -i ../effortless-rulebook/effortless-rulebook.json
cd ..
```

Wrong cwd dumps SQL into the project root and registers the wrong
`RelativePath` in `effortless.json`.

### Version pinning

List versions: `effortless -listVersions rulebook-to-sql-server`

If the latest remote image times out ("Timed out waiting for cook"), pin a
known-good version:

```bash
cd sql-server
effortless -install rulebook-to-sql-server/v2026.06.17.2006 -i ../effortless-rulebook/effortless-rulebook.json
```

Upgrade later: `effortless -upgrade rulebook-to-sql-server` (from project
root).

## Setup — run in order

### 1. Install transpiler (above)

Verify: `sql-server/00-bootstrap.sql` exists; `effortless.json` has
`RelativePath: /sql-server` + `rulebooktosqlserver` entry.

### 2. Patch `init-db.sh` defaults

Before first run, set the project DB name and SA password in
`sql-server/init-db.sh`:

```bash
DEFAULT_CONN="sqlserver://sa:<SA_PASSWORD>@localhost:1433/<dbname>"
```

The transpiler ships a generic default — overwriting it is **this skill's
job**, not a transpiler bug.

### 3. Create the database (first time)

SQL Server does not auto-create the DB. Either let `00-bootstrap.sql` handle
it, or:

```bash
sqlcmd -S localhost,1433 -U sa -P '<SA_PASSWORD>' -C -Q "CREATE DATABASE <dbname>"
```

### 4. Run init

```bash
cd sql-server && chmod +x init-db.sh && ./init-db.sh && cd ..
```

Connection URL override:

```bash
./init-db.sh 'sqlserver://sa:pass@localhost:1433/mydb'
```

### 5. Register `init-db.sh` as a build step

From inside `/sql-server/`:

```bash
cd sql-server
effortless -install -exec ./init-db.sh
cd ..
```

Manual fallback entry in `effortless.json`:

```json
{
  "Name": "initdbsqlserver",
  "RelativePath": "/sql-server",
  "CommandLine": "-exec ./init-db.sh",
  "IsDisabled": false
}
```

After this, `effortless build` regenerates T-SQL **then** runs `init-db.sh`.

### 6. Disable Postgres spokes (when switching substrates)

Set `"IsDisabled": true` on `rulebooktopostgres` and `initdb` entries whose
`RelativePath` is `/postgres`. Only one active DB init should run per build.

## Wiring the Express API

Replace `pg` with **`mssql`**. Default connection:

```
DATABASE_URL=sqlserver://sa:pass@localhost:1433/dbname
```

| Concern | Postgres | SQL Server |
|---------|----------|------------|
| Placeholders | `$1`, `$2` | `@name` via `.input('name', val)` |
| Read path | `vw_*` | `vw_*` (same rule — see `effortless-sql`) |
| Writes | base tables | base tables |
| Booleans in calcs | `true`/`false` | often `'1'`/`'0'` nvarchar — normalize in API |
| `SUM()` on calc cols | works | may need `CAST(... AS DECIMAL(38,10))` |
| Dashboard filters | `is_active = true` | `is_active = '1'` |

See [REFERENCE.md](REFERENCE.md) for a minimal `db.ts` helper and known
idempotency fixes.

## Verifying (lightweight)

```bash
sqlcmd -S localhost,1433 -U sa -P '<pass>' -C -d <dbname> -Q "SELECT TOP 3 name, size_category FROM vw_plots"
```

Do **not** `cat sql-server/02-create-functions.sql` into context.

## See also

- `effortless-setup-postgres` — Postgres counterpart
- `effortless-pipeline` — `ProjectTranspilers` / `-install` / `build`
- `effortless-sql` — read `vw_*`, never base tables; `*b-customize-*` files
- `effortless-loop` — edit rulebook → build → consume views
- [REFERENCE.md](REFERENCE.md) — RLS idempotency, app wiring, troubleshooting
