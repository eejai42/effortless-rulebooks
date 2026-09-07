# naive-set-theory — doctrine

This project follows the Effortless Rulebook (ERB) methodology. Load the `effortless-orchestrator` skill first. The repo-wide doctrine lives in the root `CLAUDE.md`; this file covers what is specific to this project.

## `effortless-rulebook/effortless-rulebook.json` is HEAD

**`effortless-rulebook/effortless-rulebook.json` is the single, authoritative source of truth for this project.** Edit it directly; everything else (Postgres SQL, RuleSpeak, the generated editor stack, any app) is derived by `effortless build`. Never edit generated output; trace a wrong artifact back to the rulebook entry that produced it.

Before any command that could touch the rulebook (`effortless build`, any sync, any `git checkout`/`restore` against it), run `git status` / `git diff` on it. If it carries uncommitted edits you did not make this turn, stop and ask. There is no upstream to restore from.

## What this project is

A rulebook formalizing naive set theory with three-valued (Strong Kleene) membership. Rule 12 (NULL membership) dissolves Russell's paradox into a single ungrounded membership fact. The source notes (`narrative.md`, `glossary.md`, `scenarios.md`, the transcript and article) are inputs the rulebook vocabulary describes; the rulebook is the oracle, not the prose.

## Shape

This is an ordinary governed project of the effortless-rulebooks repository: `effortless.json`, the hub under `effortless-rulebook/`, a typed `__meta__` table, this file, a README ending with the *Local transpiler bus* section, and an executable `./start.sh` that starts the project's intended local experience and prints its URLs. Readiness and consistency are derived in the root rulebook from witnessed slots; do not hand-assert them here.

## App

`app/` (Express `server.js` on port 43302, Vite + React on port 43102, launched by `./start.sh`) reads views only: every value on screen is a column of a `vw_*` view in `erb_naive_set_theory` (`PGDATABASE` overrides). It never recomputes a derived value in JS and never falls back silently; a missing view or unreachable database is a 500 that names what was expected, shown in the UI. The rulebook-to-postgres output is loaded with `./reset-rulebook-db.sh`.

## Loop

```bash
effortless build   # regenerate every registered output from the rulebook
./start.sh         # start the local experience declared in the root rulebook's launch profile
```
