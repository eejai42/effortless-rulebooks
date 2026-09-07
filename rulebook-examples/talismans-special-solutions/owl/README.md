# Talisman's Special Solutions — OWL substrate

A **reasoner-grade OWL ontology** generated from the Talisman's Special Solutions rulebook,
plus a SPARQL-backed API and a conformance suite that proves the OWL reasoner
computes **identically to Postgres**.

This is not "JSON with angle brackets." Foreign keys are real `owl:ObjectProperty`
edges between individuals; ordering and delegation are `owl:TransitiveProperty`
relations a reasoner *closes*; the three agent types are `owl:disjointWith`. The
headline NTWF inference — `step-1 precedesStep step-5`, never asserted — is
**derived by the reasoner**, and it matches the `WITH RECURSIVE` answer the
Postgres views compute from the same rulebook.

> **Generated, not authored.** Everything in `src/` is emitted from
> `effortless-rulebook/talismans-special-solutions-rulebook.json` by
> `../../execution-substrates/owl/inject-into-owl.py` (run via `effortless build`).
> Edit the rulebook, not these files.

## Layout

```
owl/
  src/
    ontology.owl        TBox — classes, object/datatype properties, OWL axioms
    individuals.ttl     ABox — the Production Deployment workflow as individuals
    rules.shacl.ttl     SHACL-SPARQL rules computing the calculated/lookup fields
  graph.py              loads src/, runs SHACL→fixpoint + OWL-RL, exposes helpers
  api.py                FastAPI: competency questions over the reasoned graph
  test/
    conformance_test.py OWL ⟷ Postgres equivalence (Postgres is the answer key)
  run.sh                reason | test | api | all
  README.md             this file
```

## The two reasoners (and why both)

`graph.py` composes two engines, each doing what it is good at:

1. **SHACL-SPARQL rules** (`rules.shacl.ttl`) compute the *calculated / lookup*
   fields — `RelativePath`, `Iri`, `ExecutingAgentType`, the staleness booleans,
   the `COUNTIFS` rollups. These have a dependency chain (a child's `RelativePath`
   needs its parent's first), so the rule engine is iterated to a **fixpoint**
   (re-run until the triple count stabilises — converges in a handful of passes).

2. **OWL-RL** (`owlrl`) then computes the *ontological* closure — transitive
   `precedesStep` / `delegatesTo`, `inverseOf` reverse edges, class membership.
   This is what fires the article's headline inferences.

## Identity: the `Iri` is a path

Every individual's IRI is **derived from its place in the DAG**, not a bare
primary key. The rulebook computes a `RelativePath`
(`workflows/production-deployment/steps/prod-deploy-step-1`) by reaching up the
structural-parent chain one hop per table, and an `Iri` (the dash form). The OWL
substrate computes the *same* `Iri` via chained SHACL rules; Postgres computes it
via lookup/calc columns. CQ4 asserts they are byte-identical. Because the path
encodes the full ancestry, the identity is globally unique by construction — no
cross-table key collisions.

## Competency questions (answered by the reasoner)

| CQ | Question | Endpoint |
|----|----------|----------|
| CQ1 | Which steps does step *X* precede (transitively)? | `GET /steps/{id}/precedes` |
| CQ1 | The full precedence closure | `GET /precedence/closure` |
| CQ2 | Full delegation chain for a role | `GET /roles/{id}/delegates-to` |
| CQ3 | Which agent (and type) fills a role? | `GET /roles/{id}/filled-by` |
| —  | The disjoint agent classes | `GET /ontology/disjoint-classes` |

## Running

```bash
# from this directory
./run.sh reason     # print the headline inferences (closure, delegation, disjoint)
./run.sh test       # OWL ⟷ Postgres conformance (needs erb_talismans_special_solutions up)
./run.sh api        # serve the API on :8077
./run.sh all        # reason + test
```

The conformance test requires the domain Postgres database. Build it from the
rulebook first:

```bash
cd ../postgres-bootstrap
DATABASE_URL="postgresql://postgres@localhost:5432/erb_talismans_special_solutions" \
  ERB_DOMAIN=talismans-special-solutions bash ./reset-rulebook-db.sh
```

## Namespaces

| Prefix | URI |
|--------|-----|
| `erb:` | `http://example.org/erb#` (the generated ontology) |
| `owl:` | `http://www.w3.org/2002/07/owl#` |
| `sh:`  | `http://www.w3.org/ns/shacl#` |
| `rdfs:`| `http://www.w3.org/2000/01/rdf-schema#` |

The class/property local names mirror the rulebook tables and fields
(`erb:WorkflowSteps`, `erb:precedesStep`, `erb:filledByHumanAgent`, …). The
`rdfs:comment` on each carries the rulebook's own description, including the NTWF
/ OWL mapping notes (`owl:TransitiveProperty`, `owl:FunctionalProperty`,
`owl:disjointWith`).

## What conformance proves

`./run.sh test` grades the OWL reasoner against Postgres (the answer key) on:

- **CQ1** — the step-precedence transitive closure is the *same set of pairs*,
  including the never-asserted long-range pair.
- **CQ2** — the delegation chain closure is identical.
- **CQ3** — every role resolves to the same filling agent and agent type.
- **CQ4** — the path-derived `Iri` is identical for the deepest-nested entities.

Same rulebook, two engines built from completely different paradigms (a
description-logic reasoner vs. relational SQL views), identical answers.

---

## Local transpiler bus (`localhost:4242`)

> **All 13 local transpilers live on `localhost:4242`.** Start the bus with
> `./start.sh` from `rulebook-examples/legacy-runner/ssotme-proxy/` (it is being
> separated into its own project; see the root rulebook's `LegacyRunnerCapabilities`).
> The ssotme-proxy then exposes every repo-local transpiler —
> `postgres-calculated-to-rulebook`, `rulebook-to-python`, `rulebook-to-golang`,
> `rulebook-to-cobol`, `rulebook-to-owl`, and more — as first-class `ssotme://`
> routes any `effortless build` can call.
