# Effortless Math — Current Research Status

This file is the short current pointer. The long `RESEARCH_HANDOFF.md` is historical context; its loop-710 boundary is superseded by the consolidation state described here.

## Loop definition

A loop is exactly one change to the parsed semantic object of a canonical rulebook.

```text
canonical rulebook semantic object changed   => loop
canonical rulebook semantic object unchanged => not a loop
```

UI/UX, glue code, generated projections, provider adapters, workflow and build repairs, benchmark execution, reports, packaging, and documentation are not loops unless the same change also changes the canonical rulebook object. The durable protocol is `docs/LOOP_PROTOCOL.md`.

## Consolidated TSP boundary

On `agent/tsp_consolidation`, the single canonical TSP ledger is:

```text
canonical loop range       577–812
canonical loop rows             236
loop continuity                 PASS
generated views                   45
active semantic atoms              1
active semantic operators          1
new active terms, 713–812           0
```

The canonical ledger is the `TSPLoops` table in:

```text
domains/traveling-salesman/
  effortless-rulebook/traveling-salesman-rulebook.json
```

Loops 713–812 are no longer merely an open PR or local bundle. They are present in that same ledger and have checked-in campaign evidence, ordered closure commits, real Effortless generation, generated Postgres recreation, and Python/Postgres conformance.

## Provider-local historical labels

The historical labels 813–1532 are reserved but are not canonical loop identifiers. Their physical bundles are content-addressed in `research-campaigns/_alignment/local-artifact-inventory.json`, but those archives are absent from this repository. They cannot be promoted from summaries alone.

Promotion requires:

```text
restore the content-addressed source archive
→ compare every iteration's parsed rulebook object
→ classify genuine semantic deltas as loops
→ ingest those deltas in development order
→ run the real Effortless build
→ recreate generated Postgres
→ run peer conformance and independent replay
```

Provider execution or timing iterations with no rulebook semantic delta remain experiments, not loops. The first unambiguous new loop number is reserved as 1533 so the historical labels are never reused.

## Authoritative consolidation evidence

Read these in order:

1. `domains/traveling-salesman/problem-contract.json` — current claims, acceptance surface, loop semantics, and evidence boundary.
2. `domains/traveling-salesman/testing/consolidation/campaign-classification.json` — canonical versus provider-local classification.
3. `domains/traveling-salesman/testing/consolidation/loop-history-audit.json` — ordered Git/rulebook audit and the recorded historical preregistration exception.
4. `domains/traveling-salesman/testing/consolidation/toolchain-lock.json` — pinned CLI, transpilers, database, runtime, and numerical-provider identities.
5. `domains/traveling-salesman/testing/consolidation/artifact-lifecycle.json` — current, historical, superseded, rejected, and unverified-provider-local semantics.
6. `domains/traveling-salesman/testing/consolidation/build-certificate.json` — authoritative consolidated build, generated-tree, database-load, conformance, and replay result.
7. `shared-kernels/semantic-orchestration/DOMAIN_CONTRACT.md` — boundary for reusable provider/orchestration machinery.

A current build claim is valid only when `build-certificate.json` has `status: PASS` and its certified input digest still matches the repository state.

## Claim boundary

The repository contains finite exact TSP results, witnessed lower bounds and cuts, exact benchmark replay, and empirical provider-performance evidence. It does not claim a new general TSP algorithm, state-of-the-art solver performance, universal semantic acceleration, polynomial TSP normalization, or `P = NP`.
