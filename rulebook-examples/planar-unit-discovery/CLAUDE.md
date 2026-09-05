# planar-unit-discovery — doctrine

This project follows the Effortless Rulebook (ERB) methodology. Load the `effortless-orchestrator` skill first. The repo-wide doctrine lives in the root `CLAUDE.md`; this file covers what is specific to this project.

## `effortless-rulebook/planar-unit-discovery-rulebook.json` is HEAD

**`effortless-rulebook/planar-unit-discovery-rulebook.json` is the single, authoritative source of truth for this project.** Edit it directly; everything else (Postgres SQL, RuleSpeak, the generated editor stack, any app) is derived by `effortless build`. Never edit generated output; trace a wrong artifact back to the rulebook entry that produced it.

Before any command that could touch the rulebook (`effortless build`, any sync, any `git checkout`/`restore` against it), run `git status` / `git diff` on it. If it carries uncommitted edits you did not make this turn, stop and ask. There is no upstream to restore from.

## What this project is

Planar unit-distance discovery: the rulebook is the territory (points, distances, unit-distance relations and the structures that emerge from them); an AI's discovery is INPUT described in rulebook vocabulary, never encoded as a formula. `LEOPOLD_LOOPS.md` and `bootstrap/` record how the rulebook was grown turn by turn.

## Shape

This is an ordinary governed project of the effortless-rulebooks repository: `effortless.json`, the hub under `effortless-rulebook/`, a typed `__meta__` table, this file, a README ending with the *Local transpiler bus* section, and an executable `./start.sh` that starts the project's intended local experience and prints its URLs. Readiness and consistency are derived in the root rulebook from witnessed slots; do not hand-assert them here.

## App

`app/` (Express `server.js` on `:43303`, Vite/React on `:43103`, launched by `./start.sh`) is the project's local experience against database `erb_planar_unit_discovery` (default `PGDATABASE`, derived from the slug). It reads views only — `SELECT * FROM vw_<entity>`, optionally `WHERE <fk> = $1` — and displays view columns verbatim; it never recomputes a derived field, and a view that fails is surfaced as a 500 / on-screen error rather than worked around. Every view answers `SELECT *` (2026-09-05): the `Name` formulas that concatenated with `-`/`/` were rewritten with `CONCAT`, and the 49 `LOOKUP(...)` fields were rewritten as `INDEX(Target!{{Field}}, MATCH({{LocalFK}}, Target!{{TargetId}}, 0))`, the only lookup shape the transpiler translates. Keep new formulas in those shapes.

## Loop

```bash
effortless build   # regenerate every registered output from the rulebook
./start.sh         # start the local experience declared in the root rulebook's launch profile
```
