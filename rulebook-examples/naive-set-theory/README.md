# naive-set-theory

Rulebook formalizing naive set theory with three-valued (Strong Kleene) membership and Rule 12 (NULL membership), which dissolves Russell's paradox into a single ungrounded membership fact.

**Rulebook:** [`effortless-rulebook/effortless-rulebook.json`](effortless-rulebook/effortless-rulebook.json) — 7 tables: `TruthValues`, `Connectives`, `TruthTableRows`, `SetRules`, `Sets`, `MembershipFacts`, `EvaluationSteps`.

## App

`app/` is an Express + React explorer that reads only the `vw_*` views of `erb_naive_set_theory`. One screen tells the story: the eight sets with their derived columns, a membership matrix of every `MembershipFacts` row (the single **N** cell is the ungrounded Russell fact `R ∈ R`, `is_null = ✓`), the Strong Kleene truth tables rendered from `TruthTableRows` per connective, the twelve `SetRules` with Rule 12 called out as the missing rule, and the `EvaluationSteps` fixed-point walk-through. A second tab browses every view as a raw table.

```bash
cd rulebook-examples/naive-set-theory
./reset-rulebook-db.sh   # once: load postgres/*.sql into erb_naive_set_theory
./start.sh     # web http://localhost:43102 · API http://localhost:43302/api/views
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
