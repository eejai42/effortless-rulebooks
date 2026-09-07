# nakedclaude-v1

Rulebook generated from Airtable base 'v1: NakedClaude Demo'.

**Rulebook:** [`effortless-rulebook/nakedclaude-v1-rulebook.json`](effortless-rulebook/nakedclaude-v1-rulebook.json) — 1 tables: `Customers`.

## Run it

```bash
cd toy-rulebooks/nakedclaude-v1
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
