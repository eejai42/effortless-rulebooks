# Effortless Math — Executable Theorem Network Starter

`effortless-math` is a proposed sibling project to `effortless-rulebooks`. It applies the same hub-and-spoke principle to mathematical theorem networks:

> theorem statements, hypotheses, proof obligations, imported edges, witnesses, invariants, counterfactuals, revisions, and conclusions are structural data; databases, programs, prose, ontologies, spreadsheets, DAGs, and proof-assistant skeletons are projections.

## Starting state

- Fermat's Last Theorem is the deeply modeled flagship application theorem.
- Seven foundation theorems are first-class provider contracts.
- The source migration state is Fermat Witness Lab v21.
- The network currently derives one conditional contradiction while trusting seven provider theorems.
- No provider is labeled fully internalized.

## Canonical source of truth

The starter SSoT is:

```text
effortless-rulebook/effortless-math-rulebook.json
```

The v21 SQLite database and ZIP are immutable migration answer keys, not competing sources of truth after migration is accepted.

## The eight theorem domains

1. `fermats-last-theorem` — flagship consumer.
2. `analytic-prime-distribution` — provider.
3. `hilbert-specialization` — provider.
4. `mazur-modular-curve-arithmetic` — provider.
5. `global-deformation-duality` — provider.
6. `modular-curve-cohomological-comparison` — provider.
7. `universal-level-lowering` — provider.
8. `solvable-artin-automorphy` — provider.

## First command

From this directory:

```bash
python scripts/validate_starter.py
```

When integrated into `effortless-rulebooks`, use the domain explicitly:

```bash
ERB_DOMAIN=effortless-math effortless build
```

Read `docs/MIGRATION_PLAN.md`, `docs/TRUST_MODEL.md`, and `CLAUDE.md` before making semantic changes.

## What Claude should build first

1. Make the starter rulebook valid under the current host-repo schema and migrations.
2. Run a blank build through Postgres, RuleSpeak, OWL, and ExplainDAG.
3. Reproduce the v21 answer-key counts and contradiction trace.
4. Implement a generic provider-certificate resolver.
5. Keep FLT conditional on seven providers.
6. Only then begin expanding one provider theorem.

## What this is not

- not a claim of a zero-import proof of FLT;
- not a numerical simulator that approximates truth;
- not permission to turn sourced theorems into PASS rows;
- not a second hand-written implementation beside the rulebook.

---

## Local transpiler bus (`localhost:4242`)

> **All 13 local transpilers live on `localhost:4242`.** Start the bus with
> `./start.sh` from `rulebook-examples/legacy-runner/ssotme-proxy/` (it is being
> separated into its own project; see the root rulebook's `LegacyRunnerCapabilities`).
> The ssotme-proxy then exposes every repo-local transpiler —
> `postgres-calculated-to-rulebook`, `rulebook-to-python`, `rulebook-to-golang`,
> `rulebook-to-cobol`, `rulebook-to-owl`, and more — as first-class `ssotme://`
> routes any `effortless build` can call.
