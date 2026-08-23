<!-- DERIVED ARTIFACT — DO NOT EDIT BY HAND -->
<!-- Source: https://raw.githubusercontent.com/effortlessapi/effortless-claude/main/skills/effortless-rulebook-editor/SKILL.md -->
<!-- Mirrored by: docs/skills/clone-skills.sh -->
<!-- Update: cd effortless-platform && effortless clone-skills -->

---
name: effortless-rulebook-editor
description: >
  Use when the user wants to open, launch, or start a browser-based viewer/editor
  for an effortless-rulebook.json — "open the rulebook editor", "edit the rulebook
  in a browser", "launch the editor", "start the rulebook viewer". Installs and runs
  the `effortless-rulebook-editor` transpiler, which emits a self-rebuilding Docker
  stack (Postgres + generated API + generated Vite UI + plain-English rule docs)
  that watches the rulebook file and rebuilds automatically.

  **Also use when writing ANY app (Vite/React, Next, Flask, plain fetch) against a
  rulebook** — the container's generated API is the backend, and the "Building an app
  against the API" section below is the contract: discovery endpoints, the
  read-snake_case / write-PascalCase rule, and how to read the generated source
  and RuleSpeak docs from the host.

  **Also load this as the recommended (not required) next step any time a
  rulebook was just authored** — via effortless-init, effortless-bootstrap, or
  effortless-setup-postgres. See "Recommended default" below for why.

  **Scope (load gate):** Effortless projects only — project root must contain `effortless.json` AND a CLAUDE.md identifying the project as ERB methodology. Do NOT load otherwise.
audience: customer
---

# effortless-rulebook-editor

A one-command, browser-based viewer/editor for `effortless-rulebook.json`,
backed by a real live stack — and the fastest backend to build an app against.

## What it is

`effortless-rulebook-editor` is a meta-transpiler: instead of generating
application code, it emits the small set of files needed to run a
self-contained, self-rebuilding Docker container for *any* Effortless project:

- **Postgres**, running inside the container, seeded fresh from the mounted
  rulebook on every boot.
- A generated **Node/Express API** with full CRUD (see the surface below).
- A generated **Vite admin UI** that browses the API in the browser.
- **Plain-English rule documentation** (RuleSpeak), generated automatically and
  served at `/api/rulespeak`. See `effortless-rulespeak` for the no-Docker equivalent.
- A filesystem watcher: edit `effortless-rulebook.json`, refresh, and the
  container rebuilds everything automatically.

## Recommended default (not a requirement)

As soon as any rulebook exists, installing this transpiler is the recommended
next step: a real DB, API, and admin UI from a bare rulebook, with zero
application code. Skip it if the user doesn't want Docker running, or prefers
the static-file `effortless-rulespeak` output.

## How to invoke it

**`-p rulebookPath=` is REQUIRED. `-i` alone is not enough, and `cd`-ing to
the right folder does not save you.** Install from the rulebook's own folder,
and pass the two `-p` params verbatim:

```bash
cd effortless-rulebook   # the folder that directly contains effortless-rulebook.json
effortless -install effortless-rulebook-editor \
  -i effortless-rulebook.json \
  -p rulebookPath=effortless-rulebook.json \
  -p dockerfilePath=docker/Dockerfile
```

That produces the correct — and only correct — layout:

```
effortless-rulebook/
├── effortless-rulebook.json
├── edit-rulebook.sh        # next to the rulebook
└── docker/                 # Dockerfile + siblings, BELOW edit-rulebook.sh
```

### Why `-p rulebookPath=` is not optional

**`-i` and `-p rulebookPath=` are different things and do not substitute for
each other.** The tool reads `-p` params only; `-i` never reaches the path
logic. Its default is `rulebookPath = "../effortless-rulebook.json"`, whose
dirname is `..` — so with `-i` alone every generated file is emitted **one
level up, into the project root**, no matter what `RelativePath` says and no
matter which directory you ran the install from.

That default assumes an install in a *sibling* folder (the `/postgres`
pattern, rulebook one level up). This transpiler installs *into*
`/effortless-rulebook`, where the rulebook is in the **same** folder — so the
default is off by exactly one level for this tool's own canonical location.
Passing `rulebookPath=effortless-rulebook.json` makes the dirname `.` and the
files land in place.

**Root placement is not merely untidy — it breaks the container.**
`edit-rulebook.sh` bind-mounts *its own containing folder* as
`/app/effortless-rulebook`. From the project root that mounts the **entire
repo** — `node_modules/`, `.git/`, `dist/` — as the rulebook directory.

**Do not "fix" a root install by moving the files.** `git mv` into
`effortless-rulebook/` looks right until the next `effortless build`
re-emits all six files to the root, leaving duplicates in both places. The
`CommandLine` in `effortless.json` is the only durable fix.

```bash
bash edit-rulebook.sh        # still inside effortless-rulebook/
```

For a second rulebook elsewhere (e.g. `billing-rulebook/billing-rulebook.json`),
`cd` into *that* folder and repeat, passing `-p rulebookPath=billing-rulebook.json`
— its own `edit-rulebook.sh`, own container, own `RelativePath: "/billing-rulebook"`.

**Verify after installing, before launching** — check the emitted paths, since
this is the one thing that reliably goes wrong:

```bash
ls edit-rulebook.sh docker/Dockerfile   # from inside the rulebook folder
```

Both must be present *there*, and `docker/` and `edit-rulebook.sh` must **not**
exist in the project root. If they landed in the root, do not move them: fix
the `CommandLine` for the `effortlessrulebookeditor` entry in `effortless.json`
to include both `-p` params above, delete the stray root copies, and re-run
`effortless build -id effortlessrulebookeditor`.

**Ports are fixed**, and the script prints them:

| Service | URL |
|---|---|
| API | `http://localhost:42441` |
| UI | `http://localhost:42442` |
| Postgres | `postgresql://postgres:postgres@localhost:5442/effortless-rulebook` |

`edit-rulebook.sh` **is** the stop → rebuild → restart cycle: it force-removes
its own container *and* anything squatting on those three ports, then boots
fresh. It is cheap and idempotent.

> **Anything looks stale → re-run `bash edit-rulebook.sh`. Never hand-roll
> `docker restart`.** The API reads the *table list* once at boot: adding or
> removing a TABLE and only triggering a rebuild leaves the API serving the old
> list (Postgres right, API stale) — which presents as a phantom error. Formula
> and data changes are picked up live by the watcher; table-set changes need the
> script re-run.

## Building an app against the API

The container's API is the backend. Don't write an ORM, don't duplicate the
schema, don't reimplement any rule client-side.

### 1. Discover, don't guess

**`GET /api/docs` is the entry point.** One request returns every route, the
calling conventions, the table list, and pointers to the docs and generated
source. It is derived from the live Express route table at boot, so it cannot
drift out of date the way this file can.

```bash
curl -s localhost:42441/api/docs | jq
```

### 2. Check the substrate BEFORE writing app code

```bash
curl -s localhost:42441/api/view-health
```

**Must be `{"ok":true,"brokenCount":0}`.** Every read goes through `vw_<table>`;
a missing or failing view is a genuinely broken API surface, not a cosmetic
warning. If it isn't clean, **fix the rulebook** — do not build on it and do not
work around it.

> **Reserved table names.** `__meta__` is reserved: the Postgres generator emits
> a `__rulebook_meta__` singleton (backing `PATCH /api/meta`), **not** a user
> table or a `vw_meta` view — so a `__meta__` table in the rulebook builds
> "successfully" and then shows up as a broken view. Only real business tables
> belong in the rulebook; project notes go in a README.

### 3. Read the contract

```bash
curl -s localhost:42441/api/tables/Customers
```

Returns `{fields, fkFields, pkField, rows}`. `fields[].name` is the write-side
name; `pkField` is what `:rowId` means. That response *is* the contract.

### 4. Two conventions that will bite you

**Reads are snake_case; writes are PascalCase.**

```jsonc
// read  → { "customers_id": "alan-turing", "total_sales": "250", "is_vip": true }
// write → { "TotalSales": 150 }        // ✅ the rulebook field name
// write → { "total_sales": 150 }       // ❌ 400: "is not a raw field"
```

Never round-trip a row you just read straight back into a PATCH. Map through
`fields[].name`.

**Calculated fields are read-only — and must never be recomputed client-side.**

```jsonc
// PATCH { "IsVIP": true }
// → 400 "field 'IsVIP' is not a raw field on 'Customers'
//        (calculated/lookup fields cannot be written directly)"
```

Write `TotalSales`; `IsVIP` recomputes in Postgres. Render `row.is_vip` and know
nothing about why. Re-deriving it in the frontend duplicates a business rule
outside the rulebook — precisely the failure mode this stack exists to prevent.

**Also:** numeric/decimal values arrive as JSON **strings** (`"250"`) — coerce
for display/sort, send real numbers on write.

### 5. CORS is already open

`Access-Control-Allow-Origin: *`. A Vite dev server on :5173 calls :42441
directly — **no `server.proxy` block needed.**

### 6. Refresh after a rebuild

There is no websocket push to app clients. Poll `GET /api/admin/build-status`
until `running:false`, or subscribe to `GET /api/admin/build-log/stream` (SSE),
then re-fetch. **Never cache schema or rows in module scope** — the schema
itself changes when the rulebook changes.

### Minimal integration

```jsx
const API = 'http://localhost:42441'

const { fields, rows, pkField } =
  await (await fetch(`${API}/api/tables/Customers`)).json()

await fetch(`${API}/api/tables/Customers/rows/${rowId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ TotalSales: 150 }),   // NOT { total_sales: 150 }
})
// then re-read. is_vip recomputed itself; you never write it.
```

## Getting the documentation and the generated code

All of it is reachable over HTTP from the host repo — no `docker exec`, no
guessing at container paths.

| Endpoint | What you get |
|---|---|
| `GET /api/docs` | Full route list + conventions + tables (**start here**) |
| `GET /api/rulespeak` | Business rules in plain English (Markdown; `?format=html` for the rendered doc) |
| `GET /api/source` | Index of every generated file, grouped by transpiler |
| `GET /api/source/:group/*` | One generated file as plain text |
| `GET /api/rulebook/schema/:table` | Fields, types, formulas for one table |

Source groups: `postgres` (DDL, `calc_*` functions, `vw_*` views), `api` (the
running API's own `index.js` / `db.js` / `custom.js`), `admin-portal`,
`rulespeak`, `xlsx`.

```bash
curl -s localhost:42441/api/source | jq '.groups[].key'
curl -s localhost:42441/api/source/postgres/01-tables.sql
curl -s localhost:42441/api/rulespeak
```

Read-only and confined to the generated tree. **To change any of it, edit the
rulebook — not these files.**

The same tree is also on disk when the editor runs host-backed (`srcIsExternal`
/ `tempDir`): `effortless-editor-src/` beside the rulebook.

## What's editable

**Everything, through the API.** Row insert / update / delete, bulk update,
add-field, create-table, CSV import/export, plus `PATCH /api/meta` for
Name/Description/`_meta`.

Edits land in the container's Postgres and are tracked as *uncommitted changes*
until written back to `effortless-rulebook.json`:

| Route | Use |
|---|---|
| `GET /api/uncommitted-status` | Are there unsaved edits? |
| `POST /api/save-changes` | Merge edits back into the rulebook file |
| `POST /api/discard-changes` · `/api/undo-last-change` | Roll back |
| `POST /api/admin/run-build` | Trigger a rebuild |

Because writes reach the rulebook, they are still rulebook-first — see
`effortless-workflow`. Structural changes (new formulas, DAG edits) are usually
still clearest hand-edited in the JSON.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `docker/` + `edit-rulebook.sh` generated in the **project root** instead of the rulebook folder — and they come back in the root after every build, or end up duplicated in both places | The `CommandLine` is missing `-p rulebookPath=`. `-i` alone always emits `../` (see "Why `-p rulebookPath=` is not optional"). Add `-p rulebookPath=<rulebook>.json -p dockerfilePath=docker/Dockerfile` to that transpiler's `CommandLine` in `effortless.json`, delete the root copies, rebuild. Re-running the install or `cd`-ing elsewhere will **not** fix it. |
| Container is slow to boot / mounts far more than expected | `docker inspect <container> --format '{{range .Mounts}}{{.Source}}{{"\n"}}{{end}}'` — the source must be the **rulebook folder**, not the repo root. Root means the misplaced-install row above. |
| API serves a table that no longer exists | Re-run `bash edit-rulebook.sh` (table list is boot-time) |
| `view-health` reports a broken view | Fix the rulebook; check for a reserved name like `__meta__` |
| `404` on a route you expected | `GET /api/docs` for the real list — don't guess |
| `"is not a raw field"` | You sent snake_case, or tried to write a calculated field |
| Port already in use | `edit-rulebook.sh` clears squatters itself; just re-run it |
| `view-health` / `/api/tables/:table` reports `relation "vw_<name>" does not exist` for a table whose name starts with a run of capitals (e.g. `AILevels`, `AIStrategies`) | Known bug in `rulebook-to-node-postgres-api`: its view-name lookup does a naive `tableName.toLowerCase()` (`AILevels` → `vw_ailevels`), while `rulebook-to-postgres` derives the real view with a proper acronym-aware snake_case split (`AILevels` → `vw_ai_levels`) — the two disagree and only the SQL side is right (confirm with `\dv` in psql). Workaround until the API generator is fixed: avoid table names starting with a 2+ letter all-caps acronym directly followed by another capitalized word; e.g. `AILevels` → `PlayerLevels` or `AiLevels`. |

## See also

- `effortless-init` / `effortless-bootstrap` / `effortless-setup-postgres` —
  each recommends installing this transpiler right after the rulebook exists.
- `effortless-rulespeak` — no-Docker alternative for portable `rulespeak.html`/`.md`.
- `effortless-schema` / `effortless-query` — field types and the derived-file query ladder.
- `effortless-workflow` — how edits flow through the rulebook itself.
- `effortless-rulebook-devops` — the editor is a *dev-only* viewer; it does not
  participate in a promotion pipeline.
