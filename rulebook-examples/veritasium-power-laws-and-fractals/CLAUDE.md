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

The hub is `effortless-rulebook/effortless-rulebook.json` (moved from the pre-canonical `ssot/ERB_*.json` on 2026-09-05; the old model name is kept in `__meta__` as `legacy_model_name`). Project metadata lives only in the `__meta__` table. The database is `erb_veritasium_power_laws_and_fractals`, recreated by the root `init-db.sh` wrapper on every build because the generated SQL is check-add. Do not hand-edit `postgres/init-db.sh`: the transpiler preserves an existing copy, and the hand-edited relic that lived there ignored `DATABASE_URL` and loaded a different database.

`rulebook-to-postgres` does not translate `NULLIF`; the 14 ratio fields that use it read as NULL from their views (see `postgres/errors.txt`). Rewrite them with `IF({{X}} = 0, ...)` when the formulas are next touched.

## Loop

```bash
effortless build   # regenerate every registered output from the rulebook
./start.sh         # start the local experience declared in the root rulebook's launch profile
```
