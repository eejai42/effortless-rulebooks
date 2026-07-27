# Semantic orchestration shared-kernel contract

## Purpose

Reusable execution orchestration belongs outside every mathematical problem rulebook. This shared-kernel boundary is the intended home for provider registration, capability discovery, solve-plan state, artifact lifecycle, evidence routing, and acceptance decisions that apply across optimization domains.

The traveling-salesman rulebook may describe TSP mathematics and TSP-scoped evidence. It must not acquire generic provider, job, queue, deployment, tenancy, or workflow tables merely because a TSP experiment used them.

## Architecture boundary

```text
mathematical rulebook
    -> Effortless compiler
    -> generated semantic substrate
    -> semantic-orchestration shared kernel
    -> purpose-built provider adapter
    -> native solver
    -> typed evidence artifact
    -> mathematical rulebook acceptance gate
```

The shared kernel coordinates work; it does not redefine mathematical semantics. Effortless remains the rulebook compiler. Provider adapters translate accepted semantic artifacts into native constraints, cuts, warm starts, branch priorities, or solve requests and return typed evidence. They do not recreate rulebook-to-SQL or rulebook-to-RuleSpeak compilation.

## Candidate canonical entities

A future rulebook for this shared kernel may represent:

- providers and immutable provider versions;
- capabilities and declared applicability;
- benchmark/data sources and content identities;
- solve plans and ordered plan steps;
- state transitions and transition warrants;
- input, intermediate, output, and verification artifacts;
- artifact lifecycle states: current, historical, superseded, rejected;
- execution attempts and environment identities;
- measurements with warm/cold and machine-local boundaries;
- evidence claims, independent checks, disagreements, and acceptance decisions.

These are candidate entities, not yet canonical tables. Introducing the shared-kernel rulebook is itself a semantic loop in that domain and requires its own build and conformance campaign.

## Required state machine

A solve request should move only through explicit states such as:

```text
PROPOSED
-> VALIDATED
-> COMPILED
-> DISPATCHED
-> EXECUTED
-> EVIDENCE_CAPTURED
-> INDEPENDENTLY_CHECKED
-> ACCEPTED | REJECTED | BLOCKED
```

Every transition must record its warrant, actor/provider identity, source artifact hashes, produced artifact hashes, and failure disposition. Retrying an execution is an attempt, not a mathematical loop, unless the canonical mathematical rulebook changes.

## Artifact lifecycle

Every artifact must be classified explicitly:

- **CURRENT** — the artifact certified for the present source commit and toolchain lock;
- **HISTORICAL** — a valid artifact for an earlier loop or source commit;
- **SUPERSEDED** — retained for provenance but replaced by a newer accepted artifact;
- **REJECTED** — preserved evidence that failed validation or conformance;
- **UNVERIFIED_PROVIDER_LOCAL** — content-addressed evidence not yet ingested and independently replayed.

A bare top-level hash must never imply “current.” Current status comes from a certificate naming the source commit, semantic input digest, toolchain identity, generated outputs, commands, and independent checks.

## Acceptance boundary

A provider result is not canonical mathematical truth merely because execution succeeded. Acceptance requires:

1. the provider input to be derived from an accepted semantic artifact;
2. the provider/version and data provenance to be pinned or recorded;
3. the returned witness, bound, cut, or measurement to be replayed at its declared trust level;
4. all relevant mathematical and substrate invariants to pass;
5. the canonical problem rulebook to receive a deliberate semantic change when the conceptual model changes;
6. the real Effortless build and generated database conformance to pass after that change.

## TSP enforcement

The TSP consolidation validator rejects generic orchestration tables in the TSP rulebook. TSP may retain domain-specific inference rules, execution evidence, benchmark provenance, and mathematical certificates, but generic provider/plan/transition/artifact machinery must be implemented here or in another sibling shared domain.
