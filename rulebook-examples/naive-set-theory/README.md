# naive-set-theory

Rulebook formalizing naive set theory with three-valued (Strong Kleene) membership and Rule 12 (NULL membership), which dissolves Russell's paradox into a single ungrounded membership fact.

**Rulebook:** [`effortless-rulebook/effortless-rulebook.json`](effortless-rulebook/effortless-rulebook.json) — 7 tables: `TruthValues`, `Connectives`, `TruthTableRows`, `SetRules`, `Sets`, `MembershipFacts`, `EvaluationSteps`.

## Run it

```bash
cd rulebook-examples/naive-set-theory
./start.sh
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
