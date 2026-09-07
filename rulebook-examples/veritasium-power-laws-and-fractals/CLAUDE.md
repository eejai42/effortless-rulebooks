# veritasium-power-laws-and-fractals — doctrine

This project follows the Effortless Rulebook (ERB) methodology. Load the `effortless-orchestrator` skill first. The repo-wide doctrine lives in the root `CLAUDE.md`; this file covers what is specific to this project.

## `effortless-rulebook/effortless-rulebook.json` is HEAD

**`effortless-rulebook/effortless-rulebook.json` is the single, authoritative source of truth for this project.** Edit it directly; everything else (Postgres SQL, RuleSpeak, the generated editor stack, any app) is derived by `effortless build`. Never edit generated output; trace a wrong artifact back to the rulebook entry that produced it.

Before any command that could touch the rulebook (`effortless build`, any sync, any `git checkout`/`restore` against it), run `git status` / `git diff` on it. If it carries uncommitted edits you did not make this turn, stop and ask. There is no upstream to restore from.

## What this project is

The Veritasium power-laws-and-fractals video modeled as a data object: the canonical example of the video-as-data-object shape, with Python and Go generators, a physics model, test data and a conformance protocol (`TESTING-PROTOCOL.md`). This tree mirrors the upstream repository `eejai42/veritasiums-power-laws-and-fractals`.

## Shape

This is an ordinary governed project of the effortless-rulebooks repository: `effortless.json`, the hub under `effortless-rulebook/`, a typed `__meta__` table, this file, a README ending with the *Local transpiler bus* section, and an executable `./start.sh` that starts the project's intended local experience and prints its URLs. Readiness and consistency are derived in the root rulebook from witnessed slots; do not hand-assert them here.

## Layout

The hub is `effortless-rulebook/effortless-rulebook.json` (moved from the pre-canonical `ssot/ERB_*.json` on 2026-09-05; the old model name is kept in `__meta__` as `legacy_model_name`). Project metadata lives only in the `__meta__` table. The database is `erb_veritasium_power_laws_and_fractals`, recreated by the root `reset-rulebook-db.sh` wrapper on every build because the generated SQL is check-add. Do not hand-edit `postgres/reset-rulebook-db.sh`: the transpiler preserves an existing copy, and the hand-edited relic that lived there ignored `DATABASE_URL` and loaded a different database.

`rulebook-to-postgres` has no `NULLIF` and mis-emits single-argument `COUNTIF`: the 14 ratio fields are written `IF({{denominator}} = 0, 0, …)` (they read 0, not NULL, at a zero denominator) and `system_stats.PointCount` is a `COUNTIFS`. Keep it that way; every view must answer `SELECT *`.

## App

`app/` is the view-backed app that `./start.sh` launches: `app/server.js` (Express + pg, port 43305) and a Vite + React UI (port 43105, proxying `/api`), against database `erb_veritasium_power_laws_and_fractals` (`PG*` env vars override). It reads views only — `GET /api/views`, `GET /api/views/:name`, and a few `WHERE system = $1` domain routes over `vw_systems`, `vw_system_stats`, `vw_scales`, `vw_observed_scales` — and never recomputes a derived value in JS; nulls (including the untranslated `NULLIF` ratio fields) render as `—`. `SELECT *` on `vw_system_stats` currently raises because the generated `calc_system_stats_point_count()` emits a bare `NULLIF`; the app surfaces that error rather than hiding it. The former interactive CLI lab menu (orchestrator, substrates, visualizer) is preserved unchanged as `./lab.sh`.

## Loop

```bash
effortless build   # regenerate every registered output from the rulebook
./start.sh         # start the view-backed app (API :43305, UI :43105)
./lab.sh           # legacy interactive multi-substrate lab menu
```
