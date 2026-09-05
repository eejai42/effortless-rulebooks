<!-- DERIVED ARTIFACT — DO NOT EDIT BY HAND -->
<!-- Source: https://raw.githubusercontent.com/EffortlessAPI/effortless-skills/main/skills/effortless-workflow/SKILL.md -->
<!-- Mirrored by: docs/skills/clone-skills.sh -->
<!-- Update: cd effortless-platform && effortless clone-skills -->

---
name: effortless-workflow
description: >
  Use when making changes to an ERB project — modifying effortless-rulebook.json
  directly, editing via Airtable when connected, or running effortless build.
  `effortless-rulebook.json` is the hub/SSoT; Airtable, LLM-direct edits, and
  reverse-sync are peer input spokes. Covers the input-spoke options and permission
  checkpoints.

  **Scope (load gate):** Effortless projects only — project root must contain `effortless.json` AND a CLAUDE.md identifying the project as ERB methodology. Do NOT load otherwise.
audience: customer
---

# ERB Change Workflow

**Format:** Standard JSON + Single Line Leaves.

## Ask before modifying the hub or rebuilding

Before modifying `effortless-rulebook.json` (directly, via Airtable, reverse-sync, or any other input spoke), or running `effortless build`, ask the user. These operations change the hub and cascade through every output spoke — the developer should be choosing when that cascade fires, not discovering it after the fact.

The developer is always in charge. This skill's role is to make sure Claude defers on consequential actions, not to invent prohibitions.

## Local-dev Postgres is regenerated, not migrated

The local Postgres DB is recreated from scratch on every `effortless build` via `init-db.sh` (drop + recreate). That means a `migrations/` folder, a migrations tracking table, or an incremental `ALTER TABLE` would run once and then be wiped on the next build — they don't fail, they just don't *persist*. (Bases-hosted DBs are a different deployment shape with different mechanics; covered below.)

So for local-dev schema, RLS, calculated fields, or seed data, the path that survives builds is to edit the hub. There are several input spokes, all writing to the same hub — pick by ergonomics:

1. **Edit `effortless-rulebook.json` directly** (with permission) → `effortless build`. Often the simplest path — the rulebook is JSON and edits are surgical.
2. **Edit via Airtable** (when the project is Airtable-connected) → `effortless build` pulls Airtable into the rulebook, then regenerates downstream.
3. **Edit the rulebook directly, then reverse-sync to Airtable** so the human-friendly editing surface stays in step → `effortless build -id` from `push-to-airtable/`, then normal `effortless build` from root.
4. **Add a customization** — for substrate-specific SQL the rulebook's field model can't express (auth tenants, JWT helpers, role GRANTs, indexes). Prefer an `ERBCustomizations` row, so the SQL travels with the rulebook; a hand-edited `*b-customize-*.sql` file also works. Neither defines tables or columns — see `effortless-sql`.

Patterns that *look* like persistence but don't survive a rebuild:

- `CREATE TABLE` / `ALTER TABLE` / `DROP TABLE` / `INSERT INTO ...` against the local DB by hand — wiped on next build.
- A file under `postgres/migrations/` on a local-dev project — wiped on next build.
- Inserting into a `migrations` / `schema_migrations` tracking table — wiped on next build.
- Editing a generated `0*.sql` file — overwritten on next build.

**The internalized redirect:** if the answer feels like "write a migration," the answer is **"edit the rulebook (directly, or via Airtable if connected) and rerun `effortless build`."** Say that sentence to yourself before reaching for SQL.

### Bases is the exception

`bases.effortlessapi.com`-hosted databases (tell: `BASES_DATABASE_URL` in `.env.example`, or the project's CLAUDE.md has the "Bases is migration-only" block) can't be dropped + recreated, so they *do* use migrations — applied via `postgres/apply-migration.sh`, not `psql` directly. Even there, schema still originates in the hub; the migration file is a delivery mechanism for a hub delta, not a place to author schema from scratch. See `effortless-bases`.

**Quick check before touching Postgres:** no `BASES_DATABASE_URL` and no "Bases is migration-only" block in CLAUDE.md → local-dev path → migrations don't persist.

## Input Spokes for Editing the Hub

The hub is `effortless-rulebook.json`. Every workflow below mutates that hub —
they differ only in *how* the mutation gets there. Pick by project shape and
ergonomics, not by historical preference.

### Spoke 1: Rulebook-direct (LLM + ERB + Postgres)

The cleanest path, and the default for new LLM-driven projects. The rulebook is
JSON — LLMs edit it natively.

If `minimize-rulebook` is registered, orient with the derived files in order —
`read-me-1st.txt` → `schema.min.json` → `schema.json` — instead of jumping to
the full rulebook or `derived-data.json` (see `effortless-query` for the full
escalation ladder). For the edit itself, prefer a small script (python/jq) that
loads the full JSON, mutates the target table/field, and writes it back, over
reading the whole file into context and hand-editing tokens — the mutation is
the same either way, but code avoids paying for the read.

1. **Edit `effortless-rulebook.json` directly** (with permission). Add/modify table objects, fields, formulas, lookups.
2. **`effortless build`** — regenerates every enabled output spoke (Postgres SQL, RuleSpeak® at `rulespeak/rulespeak.html`, etc.).
3. If the project is also Airtable-connected and you want the human-friendly view in step: reverse-sync (Spoke 3) before the build.

```
LLM / hand-edit (you edit here)
    |
    v
effortless-rulebook.json  ← THE HUB
    |  rulebook-to-postgres, rulebook-to-*
    v
All output spokes (regenerated)
```

### Spoke 2: An upstream grid (Airtable / Excel / …) — optional

Use when the project has wired an upstream surface (e.g. `airtable-to-rulebook`)
and the human prefers that grid's UI for editing schema/data. Airtable is one such
surface, a sibling of Excel and Notion — one good input spoke, never the SSoT. The
recipe below uses Airtable; other surfaces follow the same shape with their own
`*-to-rulebook` transpiler.

1. **Modify Airtable** — Add/change fields, data, or formulas in the base. Key resolution, the `-account airtable` flag, and the API/OMNI split live in `effortless-airtable` / `effortless-airtable-omni`. If no API key is available, tell the user — they may set it or make the change in the Airtable UI.
2. **`effortless build`** from the project root — `airtable-to-rulebook` pulls Airtable into the hub, then downstream transpilers regenerate every output spoke. Mandatory after every Airtable modification.

```
Airtable (you edit here)
    |  airtable-to-rulebook
    v
effortless-rulebook.json  ← THE HUB (updated)
    |  rulebook-to-postgres, etc.
    v
All output spokes (regenerated)
```

### Spoke 3: Reverse-sync (rulebook → Airtable)

For Airtable-connected projects, when it's more practical to edit the JSON
directly but you still want Airtable mirrored.

1. **Edit `effortless-rulebook.json` directly** — Make your changes in the JSON hub
2. **Push changes back to Airtable** — Run `effortless build -id` from the `effortless-rulebook/push-to-airtable/` subfolder
   - The `-id` flag tells effortless to include disabled transpilers — `rulebook-to-airtable` is typically disabled in `effortless.json` because reverse-sync is opt-in
   - This must be run directly from the `push-to-airtable/` subfolder, not from the project root
3. **Then run the normal build** — `effortless build` from project root to regenerate downstream files

```
effortless-rulebook.json  ← THE HUB (you edit here)
    |  rulebook-to-airtable (via build -id from push-to-airtable/)
    v
Airtable (mirrored back, for human convenience)
    |  then normal: effortless build from root
    v
All output spokes (regenerated)
```

## Permission Checkpoints

Ask the user before any of these — they affect the hub or trigger cascading regeneration, and the developer should be choosing when that happens:
- Editing `effortless-rulebook.json`
- Modifying Airtable schema or data (via API or any other method)
- Running `effortless build` (from root or any subfolder)
- Running any individual transpiler

## "Just add a small table" — where it actually belongs

When the user says "make a Foo table" / "add a Bar entity" / "I need an X table", the home that survives builds is the hub. Edit `effortless-rulebook.json` directly (or via Airtable, if connected), then `effortless build` regenerates `public.foo` + `vw_foo`.

A few near-cousins that won't persist for a *business* entity on local-dev:

- Hand-writing the table in `01b-customize-schema.sql` — the edit persists (that file is never overwritten), but the table gets no view, no calculated fields, no RuleSpeak and no Explainer DAG. Tables belong in the rulebook; `01b` is for indexes.
- Writing a migration file or `CREATE TABLE app.users (...)` against the local DB — wiped on next `init-db.sh` (see the local-dev-Postgres section above).

## Don't drive git on the user's behalf

Effortless skills are read-only with respect to git. Before `effortless build`, check the tree with
`git status --porcelain` (read-only); if non-obvious changes are present, **ask the user for permission
to build** — they may want to commit or stash first so the resulting diff cleanly isolates the regenerated
output from hand-written follow-ons. After the build, do NOT auto-commit; leave the dirty tree for the
user to commit when they choose.

(Exception: `effortless-setup-postgres` performs one-time bootstrap commits during initial project
creation — that flow is explicitly authorized to drive git. Nothing else is.)

## When an input spoke is blocked, ask — don't reroute silently

If the input spoke you started with can't complete the change (e.g., Airtable API
can't create formula fields, no API key, project isn't Airtable-connected at all):

1. Pause and surface the blocker — don't silently switch to editing generated files (those edits are ephemeral anyway, so the apparent fix would evaporate on the next build).
2. Lay out the alternatives so the user can choose:
   - **Rulebook-direct**: edit `effortless-rulebook.json` directly, then `effortless build`
   - **Airtable UI**: user makes the change in Airtable's UI, then runs `effortless build`
   - **Reverse-sync**: edit the JSON directly, push to Airtable via `effortless build -id` from `push-to-airtable/`, then `effortless build`
   - **`ERBCustomizations` rows** (in the rulebook) for SQL the hub's field model doesn't express
3. Wait for direction before proceeding.

---

## See also

- `effortless-orchestrator` — for the bigger mental model and the schema-change decision tree this skill operationalizes.
- `effortless-loop` — for the iterative cycle every spoke produces.
- `effortless-rulespeak` — default plain-English sibling (`rulespeak/rulespeak.html`) on every new rulebook and every build.
- `effortless-airtable` / `effortless-airtable-omni` — for *how* to make the change via the Airtable spoke (API vs OMNI).
- `effortless-pipeline` — for the `-id` flag mechanics referenced in the reverse-sync spoke.
- `effortless-sql` — for the rule that `*b-customize-*.sql` is the ONLY hand-edited surface, and never for business entities.
