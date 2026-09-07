# volunteer-shift-scheduler-demo

A scaffold that consumes its sibling `volunteer-shift-scheduler` rulebook. It deliberately carries no rulebook of its own and is flagged `IsIntentionalException` in the root rulebook.

## Run it

```bash
cd toy-rulebooks/volunteer-shift-scheduler-demo
./start.sh
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
