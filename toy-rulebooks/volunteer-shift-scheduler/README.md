# volunteer-shift-scheduler

Coverage status, volunteer load (under/ok/over), and event-level A–F staffing grade all fall out automatically.

**Rulebook:** [`effortless-rulebook/volunteer-shift-scheduler-rulebook.json`](effortless-rulebook/volunteer-shift-scheduler-rulebook.json) — 4 tables: `Events`, `Volunteers`, `Shifts`, `Assignments`.

## Run it

```bash
cd toy-rulebooks/volunteer-shift-scheduler
./start.sh
```

## Rebuild

```bash
effortless build   # regenerates every registered output from the rulebook
```

---

## Local transpiler bus (`localhost:4242`)

> **All 13 local transpilers live on `localhost:4242`.** Start the bus with
> `./start.sh` from `rulebook-examples/legacy-runner/ssotme-proxy/` (it is being
> separated into its own project; see the root rulebook's `LegacyRunnerCapabilities`).
> The ssotme-proxy then exposes every repo-local transpiler —
> `postgres-calculated-to-rulebook`, `rulebook-to-python`, `rulebook-to-golang`,
> `rulebook-to-cobol`, `rulebook-to-owl`, and more — as first-class `ssotme://`
> routes any `effortless build` can call.
