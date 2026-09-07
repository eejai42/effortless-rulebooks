# guessing-game

Number-guessing game tracking guesses, hints, and best-score records per player.

**Rulebook:** [`effortless-rulebook/guessing-game-rulebook.json`](effortless-rulebook/guessing-game-rulebook.json) — 2 tables: `形状`, `边`.

## Run it

```bash
cd toy-rulebooks/guessing-game
./start.sh
```

## Rebuild

```bash
effortless build   # regenerates every registered output from the rulebook
```

---

## Local transpiler bus (`localhost:4242`)

> **All 13 local transpilers live on `localhost:4242`.** Start the bus with
> `./start.sh` from `ssotme-proxy/` at the repo root (it is root
> infrastructure again — see the root rulebook's `LegacyRunnerCapabilities`).
> The ssotme-proxy then exposes every repo-local transpiler —
> `postgres-calculated-to-rulebook`, `rulebook-to-python`, `rulebook-to-golang`,
> `rulebook-to-cobol`, `rulebook-to-owl`, and more — as first-class `ssotme://`
> routes any `effortless build` can call.
