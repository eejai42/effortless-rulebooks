<!-- DERIVED ARTIFACT — DO NOT EDIT BY HAND -->
<!-- Source: https://raw.githubusercontent.com/effortlessapi/effortless-claude/main/skills/effortless-demo-app/SKILL.md -->
<!-- Mirrored by: docs/skills/clone-skills.sh -->
<!-- Update: cd effortless-platform && effortless clone-skills -->

---
name: effortless-demo-app
description: >
  Use when the user wants to spin up a complete Effortless POC demo app from
  a one- or two-sentence domain description — no Airtable, no Shadle steps,
  just the fastest path from "make this an effortless demo for X" to a
  running Express + Vite SPA backed by a Postgres-generated rulebook with a
  multi-hop calculated-field DAG that the UI exercises end-to-end.

  Triggers: "make this an effortless demo for …", "build an effortless POC
  for …", "spin up a demo app for …", "effortless demo app", "quick
  effortless demo of …".

  **Scope (load gate):** Loads only on explicit user request for a demo app.
  Does NOT require a marked Effortless project — this skill *creates* one.
audience: customer
---

# Effortless Demo App — one-line description to running POC

The fastest possible path from a 1-2 sentence domain description to a fully
functional demo app: rulebook-first Postgres, Express + Vite SPA, dev login
for 2-3 roles, multi-hop calculated-field DAG, mock data that "flexes"
every inference, and deep routing so F5 always works.

For **demos and POCs**, not production. No Airtable, no magic-links, no
Shadle steps, no migration tooling.

## User-facing documentation discipline

**README and user-facing docs must read as if you have never heard of Effortless, DAGs, or the effortless loop.**

Imagine handing the README to a business analyst who just wants to use the app. They don't know what a rulebook is, they don't know what a DAG is, and the word "multi-hop" means nothing to them. Write for that person.

**Banned words / phrases in the README (except in a clearly-marked dev-only section at the very end):**


| ❌ Never write               | ✅ Write instead                                                         |
| --------------------------- | ----------------------------------------------------------------------- |
| DAG                         | *(just don't draw it — show the cascade in a "try this" walkthrough)*   |
| calculated field            | *derived value*, *is calculated automatically*, *updates automatically* |
| rulebook                    | *(invisible — it's the implementation)*                                 |
| multi-hop                   | *(just describe what changes what, in plain English)*                   |
| the loop                    | *"to add or change a field"*, *"modifying the app"*                     |
| ERB / Effortless Rulebook   | *(invisible in user sections)*                                          |
| inference chain / inference | *(just say what updates when)*                                          |
| transpiler                  | *(invisible)*                                                           |
| SSoT                        | *(invisible)*                                                           |
| DAG order                   | *(invisible)*                                                           |


Instead of drawing the DAG, describe the **cascade in domain language**: *"Changing a line item's amount instantly updates the report total, which determines whether the High Value badge appears on the manager's queue."* That sentence conveys the same information without any jargon.

The "Next 10 turns of the loop" section in the README MUST be called **"What to add next"** (or a domain-appropriate variant like "Next 10 enhancements"). The word "loop" should never appear in the README. Each suggestion should describe the business change ("add a Category field to line items so managers can filter by type"), not the technical mechanism.

ERB methodology, DAG diagrams, and transpiler details belong only in CLAUDE.md and in an optional **"How This Was Built"** section clearly labeled as a developer reference, placed at the very end of the README after all user-facing content.

Examples:

- ❌ *"A minimal Effortless POC showing a multi-hop approval workflow. The entire schema — calculated fields, SQL views, seed data — is generated from effortless-rulebook/effortless-rulebook.json. The DAG: FirstName → EmployeeName (1st-order), TotalAmount → IsOverBudget (2nd-order flag)..."*
- ✅ *"An expense approval tool for small teams. Employees submit expense reports; totals and approval status update automatically; managers see a real-time queue of reports needing action. A report is flagged for escalation when it is both over budget and not yet approved — no manual tracking required."*

## Speed discipline (read this first)

This skill exists because demos should be FAST. Target: first
`effortless build` invocation within ~30 seconds of the user request,
working app within a few minutes. The most common failure mode is
noodling — exploring, re-reading skills, re-checking the same directory,
authoring the rulebook in two passes, retrying `init-db.sh` four times
with incremental tweaks. Don't.

`**effortless.json` is NEVER hand-written.** It is generated by `effortless -init`
and maintained by the CLI. If you are ever tempted to write or edit `effortless.json`
directly — stop. Use `effortless -install` to add transpilers instead.

**The bootstrap path is deterministic. Just run it:**

1. `mkdir <project> && cd <project> && git init`
2. `mkdir effortless-rulebook`
3. `effortless -init` — generates `effortless.json`. Never write this file by hand.
4. `effortless -install rulebook-to-postgres -o /postgres` — installs the transpiler
5. Install the init-db exec tool so `effortless build` runs `init-db.sh` automatically.
  The tool entry needs `RelativePath: "/postgres"` and `CommandLine: "-exec init-db.sh"`.
   Use the CLI — consult `effortless-cli` skill for the exact install command if needed.
6. **Load `effortless-schema` skill**, then write `effortless-rulebook/effortless-rulebook.json`
  **completely in one Write call** — full schema, mock data, all entities.
7. **Install RuleSpeak® (DEFAULT)** — load **effortless-rulespeak**, then:
  `mkdir -p rulespeak && cd rulespeak && effortless -install rulebook-to-rulespeak -i ../effortless-rulebook/effortless-rulebook.json && cd ..`
8. Write `CLAUDE.md` and `start.sh`. NOT `effortless.json` — that was generated in step 3.
9. `effortless build` — **run it the moment you've decided to.** Regenerates
  `rulespeak/rulespeak.html` (+ `.md`); if postgres is wired, also regenerates
  `postgres/` AND runs `init-db.sh`. Do not pre-flight with `ls`, ToolSearch, or
   "let me first check…".

**Don't do** (specific noodling patterns observed in real sessions):

- Repeated `ls` / `head` / `wc` / `cat` of the parent project dir
"looking for patterns" — you already have the patterns in this skill
- Loading the seven prerequisite skills sequentially in seven separate
turns. If you need them, load in parallel; better, only load the
ones a specific step actually requires
- AskUserQuestion to "confirm scope" before doing anything — if the
user gave you a domain, start; if they didn't, ask ONCE with the
pick-for-me options and proceed
- Writing the rulebook, pausing to "think", then rewriting it. Hold
the design in your head, then emit it once
- Running `effortless -install <transpiler>` more than once. If it
fails, read the error before re-running with tweaks
- `chmod +x init-db.sh` defensively — the transpiler emits it
executable. Only chmod if the actual error says permission denied
- Loading the `effortless-demo-app` skill twice
- Running ToolSearch for transpiler names during bootstrap — irrelevant to first-build

**Ask-before-building exception:** outside this demo skill, you should
generally confirm before running `effortless build` (it drops the DB).
**Inside this skill, do not ask** — the user invoked the demo flow,
which means they want the build to happen. Only ask if a non-default
choice (e.g. wiping an existing DB with the same name) actually needs
their input.

A single brief "running build now" status line is fine. A paragraph
of deliberation is not.

## Load supporting skills lazily, not up front

Do NOT preload all seven supporting skills before starting. The bootstrap
path in "Speed discipline" above doesn't need them. Load on demand:

- `effortless-schema` — **required** before authoring the rulebook
(step C); it defines the JSON shape, field types, and formula syntax
- `effortless-setup-postgres` / `effortless-pipeline` — only if the  
build fails in a way that needs pipeline-level debugging
- `effortless-loop` — only when documenting the edit→build  
loop in the README
- `effortless-conventions` — only if you hit a naming/DAG question you
can't answer from this skill
- `effortless-sql` — only when wiring server-side queries

Skip entirely for demos: `effortless-airtable`*, `effortless-bootstrap`
(Shadle steps), `effortless-magic-links`, `effortless-bases`,
`effortless-orchestrator` (its content is summarized inline here),
`effortless-explainer-dag` (on-demand only — user must explicitly ask).

## The loop — canonical 4 steps

Every feature change follows exactly this order. No exceptions.

1. **Update the rulebook** — edit `effortless-rulebook/effortless-rulebook.json`
2. **`effortless build`** — regenerates `postgres/` SQL and automatically runs
  `init-db.sh` (drops + recreates the DB with new schema + seed data)
3. **Update the app** — change server routes and/or web UI if the new field
  needs an editor or display
4. **Re-run the app and test** — `./start.sh`, confirm the cascade works

If the DB doesn't update after `effortless build`, the init-db exec tool
wasn't installed in step B — fix that, don't run `init-db.sh` manually.

## Invariants (do these, don't ask about them)

1. Postgres + rulebook-direct (no Airtable). The SSoT is
  `effortless-rulebook/effortless-rulebook.json` — the hub. Demo apps are
   the canonical **LLM + ERB + Postgres** shape: an LLM tends the JSON hub
   directly, `effortless build` generates the Postgres substrate.
2. Stack: Express (`server/`) + Vite + React + React Router (`web/`).
3. Dev login: `X-User-Email` stub auth, login page reads `/api/dev-users`
  and lets the user click any seeded identity. 2-3 roles.
4. Every page has its own route — F5 always lands the user on the same
  page. Role-guarded routes use `<Navigate replace />`, never
   conditional rendering.
5. The first role listed is the **fully-wired primary** role. Other
  roles get a labeled placeholder page that describes what they'd see.
6. README first, with a short narrative + a "try this" walkthrough.
7. The rulebook MUST include 3–5 entities, 1–2 inferences per entity
  minimum, and at least one **2–3 hop inference chain** (raw →
   1st-order calc → 2nd-order calc → optional 3rd-order).
8. The raw fields that feed the DAG must be editable in the UI, so the
  user can watch cascading recomputation live.
9. Mock data flexes every inference. For every boolean/threshold rule
  (e.g. `IsFoo = TotalBar > 100`), seed at least one row on each side
   of the threshold. For every enum-producing rule, seed one row per
   enum value.

## If the user didn't give you a domain

Offer to pick. Use `AskUserQuestion` with four options — three concrete
one-sentence POC suggestions plus a "type your own" option. The
suggestions should be small, distinct domains with obvious multi-hop
inference chains. Vary them across runs; examples of the *shape* of a
good suggestion (don't reuse these verbatim):

- "A small auto-body shop tracking parts and basic inventory transactions."
- "A neighborhood library tracking books, borrowers, and overdue fees."
- "A community garden tracking plots, plantings, and harvest yields."

Anything where you can sketch a 2–3 hop DAG in your head works.

## Questions to ask

Default to **zero questions** if the user gave you a domain. Pick
reasonable defaults for everything in the "Decision defaults" table
and infer the entities + inference chain from the domain. Only ask
when a choice meaningfully changes the schema AND you can't pick a
sensible default. If you must ask, do it in a **single**
`AskUserQuestion` batch up front, then proceed without further
prompts unless something is later truly ambiguous.

What you typically need to nail down:

- **Project directory name** — propose 2-3 kebab-case options from
the description, mark one as "(Recommended)".
- **The 2-3 roles** — propose role names and a one-line description of
each. Confirm which is the primary/admin role (fully wired).
- **Entities + the inference chain** — list the entities you intend to
model and, in plain English, the chain you intend to encode (e.g.
"raw `Quantity` and `UnitPrice` → calc `LineTotal` → aggregated to
parent → `OrderTotal` → thresholded → `IsLargeOrder`"). Ask the user
to confirm or adjust.
- **Scope choices the domain makes ambiguous** — e.g. is there a time
dimension (do we need a calendar)? Are there multiple physical
locations or just one? Are there sub-types within a main entity?
Don't ask about things you can default reasonably; do ask about
things that meaningfully shape the schema.

Skip questions about UI library, styling, ports, test framework, build
tooling — those are decided by the defaults table below.

## The FK / lookup pattern (canonical)

Every entity in the rulebook follows this shape:

- **First raw field: `<Entity>Id`** — the **singular** entity name + `Id`. E.g. `ThingId`
  (not `ThingsId`), `WidgetId`, `UserId`. In mock data, use human-friendly slug-style
  values (`"acme-corp"`, `"step-01"`) — they make seed data readable and debuggable.
  In production the substrate may replace these with UUIDs; the rulebook doesn't care.
- **`Name` is a calculated display alias**, not the stored PK and not used in lookups.
  Simple tables: `Name = ={{<Entity>Id}}`. Compound tables: `Name = ={{OrderNumber}} & "-" & {{Status}}`.
- **FK columns** are named after the related entity (singular, no "Id" suffix):
  `Widgets.Thing` holds the value of `Things.ThingId`. Not `Widgets.ThingId`.
- **Lookups always MATCH on `<Entity>Id`** — never on `Name`:
  `=INDEX(Things!{{Color}}, MATCH(Widgets!{{Thing}}, Things!{{ThingId}}, 0))`
  The MATCH column is always the stored identifier. The INDEX column is whatever
  field you want to retrieve. `Name` is never used in either position.
- **Chained lookups** work transparently: `Widgets.ThingCategoryName` can pull
  `Things.CategoryName`, which is itself a lookup.

Aggregations go the **other** way: on `Things` you might write
`TotalWidgetSpend = SUMIFS(Widgets!{{LineTotal}}, Widgets!{{Thing}}, {{ThingId}})`.

Calculated fields on Widgets that need a related field reference the
lookup (`{{ThingPrice}}`), not the related entity directly.

**Cross-table SQL is forbidden in customize files.** If a relationship
you need isn't expressible as a rulebook lookup, the answer is to add
the lookup to the rulebook — never to write a `LEFT JOIN` in
`03b-customize-views.sql` or a cross-table subquery in app code. The
whole point of `vw_`* is that it's join-free.

## Pitfalls baked into the rulebook generator

These are non-obvious things that will bite if you don't plan for them:

1. **Field-name inference can override declared `datatype`.** Names
  containing tokens like `*Time`, `*Date`, `*Period`, `*HHMM`, `*_at`
   may be coerced to `DATE` or `TIMESTAMPTZ` in the generated SQL even
   if you wrote `datatype: "string"`. If you need a free-text
   time-like field, use a neutral name (e.g. `ClockLabel`,
   `StartsAt` for a real datetime, `BillingTag` instead of
   `BillingPeriod`).
2. `**Name` is calculated; base tables don't have a `name` column.**
  The PK column on the base table is `<table>_id`. INSERT/UPDATE/
   DELETE must target `<table>_id`. The view re-derives `name` from
   its formula every read. Application writes only touch raw columns.
3. **Calculated PK formulas must compose from TEXT.** If `Name` uses
  `CONCAT(...)` of fields where one is coerced to DATE/TIMESTAMPTZ,
   the resulting string in the view won't match string FK values
   stored elsewhere (`CONCAT` on a timestamp emits
   `"2026-05-01 00:00:00-05"`, not `"2026-05-01"`). Workaround: add
   a raw `<Thing>Key` field, set it server-side to the desired slug,
   and make `Name = ={{<Thing>Key}}`.
4. **Don't put `LEFT JOIN` in a `Views` ERBCustomizations row.** If a lookup
  isn't resolving, the bug is in the rulebook FK pattern (almost
   always: FK column holds a `Name` value instead of a `<Entity>Id`
   value), not something to paper over with a JOIN view. The
   `customize-`* files are for additive views/columns/functions that
   honor the join-free `vw_`* discipline — not an escape hatch for
   broken lookups. Same goes for cross-table subqueries in app code:
   if you're writing `WHERE x IN (SELECT y FROM other_view)` to scope
   results, add a (possibly chained) lookup column instead and filter
   on that.
5. **No native VLOOKUP in calculated formulas.** Cross-table reads
  happen via the FK/lookup pattern above (lookups follow the
   relationship FK) or via `SUMIFS`/`COUNTIFS` aggregations going the
   other direction. Calculated fields on a row only see fields on
   that same row (including lookups).

## Process — A through Z

Use `TodoWrite` to track these. Stop and verify at each checkpoint
before moving on.

### A. Plan

1. Read the user's description; if missing, offer the "pick for me"
  options described above.
2. Sketch the entities (3–5) and the inference chain on paper /
  internally. Confirm the chain has 2–3 hops.
3. Ask the questions you need (see "Questions to ask").

### B. Scaffold

1. In `<project-dir>/`, initialize the effortless project using the CLI:
  - `effortless -init` — generates `effortless.json`. **Do NOT create or edit
   `effortless.json` manually** — it is owned by the CLI.
  - `effortless -install rulebook-to-postgres -o /postgres` — adds the
  rulebook-to-postgres transpiler outputting to `/postgres`.
  - Install the init-db exec tool so every `effortless build` automatically runs
  `init-db.sh`. The tool entry needs `RelativePath: "/postgres"` and
  `CommandLine: "-exec init-db.sh"`. Use the CLI to install it.
  - `CLAUDE.md` (project conventions — rulebook-direct, no Airtable, no migrations, etc.).
  **The first line under the H1 MUST explicitly mark this as an
  Effortless demo project** so future Claude sessions auto-load
  the `effortless-demo-app` skill (and the standard ERB skills)
  when working in this directory. Use exactly this marker line:
  `> **Project type:** Effortless demo app (rulebook-first Postgres POC). Use the \`effortless-demo-app skill for any
  work in this repo — schema edits, turns of the loop, new pages,
  mock data, README updates.` Also include the standard ERB marker sentence ("This project follows the Effortless Rulebook (ERB) methodology…") so the project-only effortless-* skills load via their scope gate.
  - `start.sh` — see **effortless-init** Step 5: hard-coded odd `API_PORT`,
  even `UI_PORT = API_PORT + 1`; `./start.sh` kills both ports and restarts
  API + SPA; optional `build` / `db` subcommands only.
2. Pick a **random odd port** (e.g. `8731`) once per project — never use
  shared defaults like `3000`, `5173`, or `6164`.

### C. Rulebook

1. **Load `effortless-schema` before writing the rulebook.** That
  skill is the canonical source for the JSON structure — top-level
   keys, table objects, field schema, field types (raw / calculated
   / lookup / relationship / aggregation), datatypes, formula
   syntax, and the `_meta` section. Don't author the rulebook from
   memory or by pattern-matching another project — load the schema
   skill and follow it. This is the one supporting skill that
   actually *is* required for the rulebook step.
2. Author `effortless-rulebook/effortless-rulebook.json`:
  - Entities in **DAG order** — leaf tables first, then dependents.
  - For each entity: a `<Entity>Id` raw field (singular entity name + Id, slug-style in mock data);
  a `Name` calculated display alias (`={{<Entity>Id}}` or compound formula);
  the raw fields; the FK fields + their lookups (see pattern above);
  calculated fields (1st/2nd/3rd-order); any aggregations from related tables.
  - Mock data: for every boolean/threshold/enum rule, seed rows that
  produce each possible output. The dashboard for the primary role
  should show a mix of states out of the box.

### D. Build the DB

1. `effortless build` (regenerates `postgres/`).
2. **Immediately patch `postgres/init-db.sh` to use this project's DB
  name.** The transpiler ships a sensible generic default
   (`DEFAULT_CONN=postgresql://postgres@localhost:5432/demo` + header
   `# demo - Database Initialization Script`) — that default is fine
   for the transpiler but WRONG once it lands in a named project.
   Leaving `demo` in place means anyone running `./init-db.sh` with no
   `DATABASE_URL` set will silently target a `demo` DB unrelated to
   this project. This skill *creates* a named project, so it is THIS
   skill's job to overwrite the default — do not file a bug against
   the transpiler. Before doing anything else:
  - `sed`/Edit `DEFAULT_CONN` → `postgresql://postgres@localhost:5432/<db>`
  - Update the header comment line to `# <db> - Database Initialization Script`
   Re-apply on every regeneration if the transpiler stomps it back.
   Same `<db>` should be the `DATABASE_URL` default in `start.sh`.
3. Drop+create the DB:
  `psql -U postgres -h localhost -c "DROP DATABASE IF EXISTS <db>"`
   then `CREATE DATABASE`.
4. `chmod +x postgres/init-db.sh && DATABASE_URL=... ./postgres/init-db.sh`.
5. Quick verification: one `psql -c "SELECT … FROM vw_<table>"` that
  shows a calculated field rendering with the seed data — cheap
    proof the DAG works.

### E. Hello-world web app (BEFORE the server)

The point of doing the web app first — even as a stub — is so the
user sees *something running in a browser* very early in the demo.

1. Scaffold `web/`:
  - `web/package.json` (react, react-router-dom, vite,
  `@vitejs/plugin-react`).
    - `web/vite.config.ts` — `server.port = UI_PORT` (even), proxy `/api` to
    `http://localhost:API_PORT` (odd). Hard-code the same pair as `start.sh`.
    - `web/index.html`, `web/src/main.tsx`, `web/src/App.tsx` that
    renders a literal **"**** — coming soon"** placeholder
    with a one-line description of the domain. No routing, no
    data fetching, no auth. Just text.
    - Add `node_modules/`, `dist/`, `.vite/` to `.gitignore` (append
    to the project-root `.gitignore` that already has `.ssotme/`).
2. `start.sh` per **effortless-init** Step 5 (if not already present).
3. Run `./start.sh`, then **open the App URL** in the browser (the
  assistant should print both `http://localhost:<API_PORT>` and
  `http://localhost:<UI_PORT>` lines). Confirm the "coming soon"
  placeholder renders before moving on.
    This is the first time the user sees *anything* — make it count.

### F. RuleSpeak® (plain-English rules doc)

**Already wired in bootstrap step 7** — do not skip or repeat unless the
transpiler entry is missing from `effortless.json`.

After the first `effortless build`, confirm:

- `rulespeak/rulespeak.html` — primary human deliverable (open in browser)
- `rulespeak/rulespeak.md` — same content in markdown

List `rulespeak/` in the repo layout in `CLAUDE.md`. Optionally mention the
HTML in README under a developer-reference section.

**Do not** install `rulebook-to-explainer-dag` during POC bootstrap unless the
user explicitly asks for in-app field provenance. For that, load
**`effortless-explainer-dag`** on demand.

### G. Server

1. `server/package.json` (express, pg, tsx, typescript). Use
  `tsx watch src/index.ts` (not plain `tsx`) so the server
    auto-restarts on edits — there's no reason to manually bounce
    it during a demo.
2. `server/src/index.ts` (single file):
  - `pg` Pool connecting as `postgres` (no RLS for demos).
    - Auth middleware: read `X-User-Email`, look up `vw_users`,
    attach `req.me`.
    - Public route: `GET /api/dev-users` (the login picker).
    - For each table: `GET /api/<table>s`, `GET /api/<table>s/:id`,
    `PATCH /api/<table>s/:id` for the editable raw fields.
    - Reads hit `vw_`* views (with calculated/aggregated columns).
    Writes hit base tables, only touching raw columns, keyed on
    `<table>_id`.
    - Role-filter in the route handlers from `req.me.role`.
3. Boot it via `./start.sh`; curl `http://localhost:<API_PORT>/healthz` and one
  read+patch+read cycle showing the cascade.

### H. Flesh out the real UI

Replace the "coming soon" placeholder with the real app.

1. `web/src/`:
  - `main.tsx` → `<BrowserRouter><App /></BrowserRouter>`.
    - `App.tsx`: load `/api/me` once, render `<Login>` if 401, else
    `<Shell>` with a `<Routes>` block — one `<Route>` per page.
    Role-guarded routes redirect via `<Navigate to="/" replace />`.
    - `Shell.tsx` + `nav.ts`: sidebar nav, grouped, role-specific via
    `navFor(role)`.
    - `Login.tsx`: fetch `/api/dev-users`, render clickable identities
    grouped by role.
    - `lib/api.ts`: `fetch` wrapper that adds `X-User-Email`.
    - `lib/useApi.ts`: `useEffect`-based hook with a `reload()`
    callback so edits can refresh the view.
    - `pages/`:
      - **Primary role**: dashboard with calculated/aggregated stats,
      list pages, detail pages, and **edit forms for the raw fields users
      actually change**.
      - **Other roles**: a single `Placeholder.tsx` page that
      describes the role's intended view and links back to the
      primary role's home for the demo.
    - `styles.css`: hand-rolled, minimal.
2. `npx tsc --noEmit` to confirm typecheck.
3. Confirm the SPA: log in as primary role, make a business-meaningful
  edit (change an amount, flip a status, update a quantity), watch the
    dependent values update on the next read.

### I. README

1. Write `README.md` with these sections **in this order**:
  - **Two-paragraph narrative opening** — what the app does and who uses it,
  in plain English. Business angle only; zero methodology. (E.g., "An
  expense approval tool for small teams..." NOT "An Effortless POC showing
  multi-hop calculated fields...")
    - **How it works** — 2–3 concrete sentences describing how one piece of data
    flows into another, in domain language. E.g. "Changing a line item's
    amount updates the report total, which determines whether the report is
    flagged as over-budget. An over-budget report that hasn't been approved
    appears in the manager's escalation queue." Never use: DAG, calculated
    field, multi-hop, inference chain, rulebook.
    - **Quick start** (`./start.sh` — prints API and App URLs).
    - **Dev login table** (emails + roles + one-line description of each).
    - **"Try this" walkthrough** — 4–6 steps in domain language showing the
    cascade end-to-end. E.g. "Sign in as Alice → open a submitted report →
    change a line item amount to $800 → sign out and sign in as Bob → find
    Alice's report in Pending Approvals — notice it is now flagged."
    - **Repo layout** — file tree with one-line descriptions.
    - **Modifying this app** — plain-English instructions for adding a field or
    changing a rule: "edit the rulebook, run `./start.sh build`, run
    `./start.sh db`". Do NOT call this "the loop". Do NOT mention
    "calculated fields" or "rulebook-to-postgres transpiler".
    - **What to add next** — the 10 enhancement suggestions (see G.1 below).
    - **Known limitations** — stub auth, no RLS, placeholder roles, no tests.
    - **How This Was Built** *(optional, clearly marked as a developer reference)*
    — placed last; the only section where ERB/rulebook/DAG terminology is
    permitted. Clearly label it "Developer reference" so a non-technical
    reader skips it.

### G.1 The "What to add next" suggestions

The first-build demo is just the start. The README must include a numbered
list of 10 concrete, *suggested* enhancements the user could pick from. Don't
implement them — list them. After the README is written, surface this list to
the user and ask which (one, several, or all in order) they want to actually
build.

**The section is called "What to add next"** (or a domain-appropriate variant
like "Next 10 enhancements", "Ideas for the next feature", etc.). The phrase
"the loop" MUST NOT appear anywhere in the README. Internally, each
suggestion is one loop turn — but the README reader doesn't need to know that.

Rules for the list:

- Each item describes a **business change** in plain English. Never describe
the technical mechanism ("add a calculated field", "rulebook-only", "add a
lookup"). Instead say what the user will *see*: "Line items get a Category
drop-down (travel, meals, supplies). The manager's queue shows a breakdown
by category."
- **Alternate / mix two flavors**, roughly half and half:
  - **Data-only changes** — a new rule, threshold, flag, or formula where
  the UI stays the same because the new value just appears in the existing
  display. Tag these `[no UI change needed]`.
  - **New feature changes** — a new entity, a new field with an editor, a new
  page or role concept. Tag these `[adds a page / field / editor]`.
- Order from smallest change to largest.
- Each entry: one-line title + one sentence describing what the user will
experience + the tag.
- These are *suggestions*, not a roadmap. The user picks.

Example shape (illustrative, not domain-specific):

```
1. Round totals to 2 decimal places — amounts always display as dollars and cents. [no UI change needed]
2. Add a tax rate — each line item shows a tax amount; the order total includes tax. [no UI change needed]
3. Flag high-value orders — orders over $1000 get a "High Value" badge on the queue. [no UI change needed]
4. Add a Discount entity — managers can attach a discount to any order; totals adjust. [adds a page / field / editor]
...
```

After writing the README, the assistant's hand-back message should
include this list inline and explicitly ask which enhancements to build next.

### J. Smoke test before declaring done

1. `./start.sh` boots cleanly (kills stale ports, restarts API + SPA, prints both URLs).
2. Login picker shows all seeded identities; signing in as the
  primary role lands on a populated dashboard.
3. Making a business-meaningful edit (change an amount, approve a
  request, update a quantity) visibly updates the dependent values
    on the next read.
4. Hitting a primary-only route as a placeholder role redirects to
  `/`.
5. Hard-refresh (F5) on a deep URL re-renders the same page.

If any check fails, fix it before reporting back.

## Decision defaults (don't ask, just do)


| Thing                  | Default                                                            |
| ---------------------- | ------------------------------------------------------------------ |
| Ports                  | Hard-coded odd `API_PORT` (e.g. `8731`); `UI_PORT = API_PORT + 1` in `start.sh`, server, and Vite |
| DB name                | snake_case of project name                                         |
| Test runner            | none — manual smoke tests are enough for a demo                    |
| Styling                | hand-rolled CSS in `web/src/styles.css`, no UI framework           |
| State management       | React `useState` + the `useApi` hook                               |
| Forms                  | local `useState`, `PATCH` on submit                                |
| Number/date formatting | small `lib/fmt.ts` helpers                                         |
| Calendar               | FullCalendar React (only if the domain has a time dimension)       |
| FK enforcement         | leave `99-fk-constraints.sql` skipped                              |
| RLS                    | enabled by generator but no policies; server connects as superuser |
| TypeScript `strict`    | yes                                                                |


## What success looks like

When you hand back to the user, they should be able to:

1. Run one command and have a working app open in the browser.
2. Sign in as the primary role and see a dashboard with at least one
  calculated/aggregated business value.
3. Make a business-meaningful edit and see the downstream totals,
  flags, and summaries reflect it (on the next read or one obvious
   refresh).
4. Sign in as a placeholder role and see a labeled stub page with a
  working role switch back.
5. Read the README and understand the domain, the key derived values,
  and the "try this" walkthrough in under two minutes.
6. See a **"What to add next"** list of 10 concrete suggestions at the
  bottom of the README — described in business language, not ERB
   methodology — and pick which one(s) to build next.

If any of those don't work, you're not done.