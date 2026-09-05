<!-- DERIVED ARTIFACT — DO NOT EDIT BY HAND -->
<!-- Source: /Users/eejai42/.claude/skills/effortless-loop/SKILL.md -->
<!-- Mirrored by: docs/skills/clone-skills.sh -->
<!-- Update: cd effortless-platform && effortless clone-skills -->

---
name: effortless-loop
description: >
  Use whenever the user mentions "the loop", "a turn of the loop", "do a turn",
  "rebuild the rulebook", "update the app to match the rules", or any
  reference to the iterative ERB development cycle. This is the
  CHANGE-RULE → REBUILD → CONSUME-VIEWS workflow that makes ERB feel effortless.
  Load this skill on first mention so you understand what the user expects to happen.

  **Scope (load gate):** Effortless projects only — project root must contain `effortless.json` AND a CLAUDE.md identifying the project as ERB methodology. Do NOT load otherwise.
audience: customer
---

# The Effortless Loop

The loop is the iterative ERB development cycle — the **core workflow** that makes ERB feel effortless compared to hand-coding without the rulebook (a mode called **"naked Claude"** — every layer of schema, migration, DTO, ORM model, API serializer, and client type written and maintained by hand). When the user mentions the loop in any form, they are invoking this entire mental model — load this skill so you respond in the right paradigm.

> **"Naked Claude"** (used in passing throughout this skill): coding without
> the rulebook — i.e. hand-writing every schema/migration/DTO/serializer
> layer instead of generating them from a single rulebook source. The
> loop's whole purpose is to eliminate that mode.

## The Loop

```
   1. CHANGE THE RULE (once, in the hub — effortless-rulebook.json, the SSoT)
      directly (LLM/hand-edit, the default), or via Airtable/reverse-sync
      if the project opted into one of those as a sibling input spoke.
            |
            v
   2. effortless build  (one command)
            |
            v
   3. EVERY DOWNSTREAM LAYER UPDATES AUTOMATICALLY
      - effortless-rulebook.json (the hub, now updated)
      - postgres/01-05*.sql (tables, functions, views, seed data)
      - ODXML schema
      - C#/Go/Python/etc. base classes, ORM context, sync services
            |
            v
   4. APP CODE (server, client) JUST CONSUMES THE GENERATED VIEWS
      - reads from vw_* views
      - treats calculated fields (e.g. is_stopped) as opaque
      - NEVER reimplements business logic that lives in the rulebook
            |
            v
   5. NEXT TURN OF THE LOOP — repeat from step 1
```

## Why it's "effortless"

A single rule change propagates through every layer with **zero hand-written migrations, DTOs, ORM updates, API serializers, or client types**. The business logic ("a customer is stopped when CurrentColor is Red") lives in **exactly one place** — the rulebook hub → generated SQL function → exposed in the view as `is_stopped`. The app just reads `is_stopped`. If the rule flips ("now Green means stopped"), the loop runs once and *no app code changes*.

Compare to **naked Claude** (defined above — hand-coding every layer): the same change requires editing a migration, seed data, DTO, ORM model, API serializer, client type, and client logic — and probably missing one and shipping a bug. The loop exists specifically to eliminate that class of failure.

## Phrases that mean "do a turn of the loop"

When the user says any of these, they expect the same sequence of actions:

- *"Do a turn of the loop"* / *"Run the loop"* / *"Take a turn"*
- *"Rebuild the rulebook"*
- *"Update the app to match the current rules"*
- *"Re-sync everything"*
- *"Push the rule change through"*
- *"Make the app reflect the new schema"*

All of these mean: **propagate the current rulebook state through every downstream layer, then update only the app's schema-surface code.** (If the project is Airtable-connected, the build pulls Airtable into the rulebook first.)

## What "do a turn of the loop" actually entails

0. **Pre-build: check the tree first.** Run `git status --porcelain` (read-only).
   If non-empty, **pause and ask the user for permission to build** — they may want to commit or stash first
   so the resulting diff cleanly isolates the build output. Do not offer to commit, stash, or `git add`
   anything yourself; the user owns their git state. Once the user gives the go-ahead (or the tree is clean),
   proceed.
1. **Run `effortless build`** from the project root. This is atomic — fire and forget.
   Do NOT read the generated files afterwards. (Ask permission first if your project's CLAUDE.md requires it.)
   **Do NOT commit the output yourself.** The user will commit when they choose to. You may proceed with the
   rest of the loop on the dirty tree the build just produced — but do not run `git add`, `git commit`, or
   any other git write command.
2. **Run `init-db.sh`** if the project has a postgres target — this **drops and recreates the database from scratch** using the freshly generated SQL. This is a full regeneration, not an incremental migration; it's also why ERB local-dev projects don't have a `migrations/` folder. (Bases-hosted DBs are the exception; never run `init-db.sh` against bases.)
3. **Query the rulebook for schema changes** — use a lightweight one-liner to see what
   tables/fields exist now (see `effortless-query`). Do NOT read generated SQL files.
   Or use `psql -c "\d vw_tablename"` to see the current view columns.
   Or — even better — use `git diff -- effortless-rulebook/effortless-rulebook.json` (read-only)
   against the unstaged build output. This is the highest-fidelity view of what changed.
4. **Update the app code only where it touches the schema surface** — column names that changed, new fields the UI now needs to display, removed tables to clean up references to. **Never reimplement** rule logic in the app; consume the calculated fields from the view as opaque truth.
5. **Restart the app** — run `./start.sh` from the project root.

## Always Build After Hub Changes

Whenever the rulebook hub is modified — directly, or via a connected input spoke (Airtable, reverse-sync) — run `effortless build` to propagate the change. Without the build, the generated code is stale and the app drifts out of sync with the hub. The developer is in charge of *when* to build; this skill's role is to make sure the build doesn't get forgotten.

## Things that look like progress but bypass the loop

Each of these "works" in the moment and then quietly costs you later. Knowing
*why* each one fails lets you spot them in disguise.

- **Writing a migration to make a schema change persist.** On local-dev ERB projects, `init-db.sh` drops and recreates the DB on every build — so a migration file / `migrations` tracking table / incremental `ALTER TABLE` would run once and then get wiped on the next build. The change *appears* to stick until the next rebuild. The loop-friendly version: edit the hub → `effortless build`. (Bases-hosted DBs are the one exception, and even there schema still originates in the hub — see `effortless-workflow` and `effortless-bases`.)
- **Reimplementing a rule in the client** — e.g. computing `isStopped = customer.color === 'Red'` in JS instead of reading `customer.is_stopped` from the view. The rule now lives in two places; the next time it changes in the hub, the client silently goes wrong. The loop's whole value is one-place-only.
- **Hand-editing generated files** — `postgres/01-05*.sql`, `dotnet/.../BaseClasses/*.cs`, etc. Edits are fine for testing a hypothesis, but `effortless build` overwrites them. For persistence: edit the hub. For substrate-specific SQL the hub's field model can't express, use a customization — an `ERBCustomizations` row (preferred) or a `*b-customize-*` file, which is never overwritten once created (see `effortless-sql`).
- **Adding columns/fields directly in SQL or C#** — same mechanic. Changes that originate in the hub survive every build; changes in generated files don't.
- **Reasoning from a stale build** — if you've changed the hub since the last `effortless build`, the generated code on disk is out of date. Rebuild before drawing conclusions from it.
- **Skipping the build and editing generated SQL "just this once."** There is no "just this once." The next `effortless build` erases it and the bug returns. The "just this once" framing is itself the tell — if it sounds reasonable, you've already taken the wrong turn. Always go around the loop.
- **Editing an output spoke as if it were the source** — Postgres SQL, Go, Python, OWL, XLSX are *outputs*. The hub is `effortless-rulebook.json`. Edits to outputs are ephemeral by design.

## See also

- `effortless-orchestrator` — the big-picture mental model; references this skill for the loop itself.
- `effortless-workflow` — editing the hub directly (default) vs. an optional connected input spoke.
- `effortless-pipeline` — the mechanics of `effortless build` itself.
- `effortless-airtable` / `effortless-airtable-omni` — *how* to make the rule change via the Airtable spoke, only if the project opted in. For rulebook-direct (the default), just edit the JSON.
- `effortless-sql` — verifying step 3's generated output and using `*b-customize-*` overrides correctly.

## TL;DR for future-you

If the user says "the loop" and you're not sure what to do: **load this skill, then run a turn of it.** Don't ask the user to explain. The loop is a workflow, not a string.
