# TSP Research Evidence Alignment

## Purpose

This directory reconciles the fragmented TSP research history after several squash merges, provider-local campaigns, Git bundles, and one-off publication workflows.

The controlling distinction is:

```text
present on main
≠ provider-local evidence preserved in a bundle
≠ ingested into the canonical TSP rulebook
≠ regenerated through Effortless
≠ independently accepted as a canonical result
```

## GitHub state after reconciliation

The following work is now on `main`:

- PR #2 / #3 / #4: canonical TSP semantic-geometry work through loop 710, subsequently squash-aligned.
- The real Effortless build recovery and generated Postgres/Python conformance certificate.
- PR #5: exact-search and wall-clock research evidence through the represented 711–912 campaign boundary, including GR17/GR21 scripts, result rows, the 713–812 campaign payload/workflow, and readable 813–912 campaign summaries.
- PR #6: the long-form Effortless Math research handoff and continuation protocol.

The canonical TSP rulebook itself still ends at loop **710**. That is intentional. Merging provider evidence does not silently promote it into canonical mathematical state.

## Provider-local evidence not yet ingested into the rulebook

The conversation produced additional complete local campaign repositories:

| Range | Campaign | Final local commit | Status |
|---:|---|---|---|
| 713–812 | exact-search calibration | `164d89d266c05966aa092841d97098e1f29d1820` | partially published through PR #5; full local bundle retained |
| 813–912 | wall-clock campaign | `804e19636b3f3017708bc940a2f09312dee28105` | readable summaries published through PR #5; full local bundle retained |
| 913–932 | solve-orchestration state machine | `0b5caa44f5652017517f75599a263db6803b9567` | local provider evidence |
| 933–1032 | recurrent-cut solver assistance | `efacdfe55cb4e7d42825acda656d17436c140f15` | local provider evidence |
| 1033–1532 | persistent-provider replication | `3b25a07a07e6d582d44dee048bb8574349eeadad` | local provider evidence |

The local cumulative repository contains 821 ordered campaign commits and 1,207 source/evidence files. Exact archive names, byte sizes, and SHA-256 digests are recorded in `local-artifact-inventory.json`.

## Important scientific boundary

The later campaigns include scripts, loop ledgers, raw measurements, summaries, and validation certificates. They are valuable evidence, but they are not yet canonical rulebook facts. Canonical promotion requires:

```text
review provider-local source and evidence
→ choose the semantic rows that belong in the rulebook
→ record planned loops and trust boundaries
→ edit the canonical rulebook
→ run the actual Effortless build
→ load the generated Postgres projection
→ run peer conformance and independent replay
→ record the resulting certificate
```

Until that happens, cite loops 913–1532 as provider-local campaign evidence, not as the current generated TSP database surface.

## High-level findings preserved from the local campaigns

### Loops 913–932 — solve orchestration

A provider-independent solve state machine was modeled:

```text
DECLARED → PLANNED → PREPARED → RUNNING
         → CANDIDATE → VERIFIED → ACCEPTED
```

with `REJECTED` and `FAILED` terminal alternatives. The rulebook/Postgres layer remained the semantic and checking surface while numerical solving stayed in an external HiGHS provider.

### Loops 933–1032 — accepted proof-artifact memory

The orchestration layer tested valid neighborhood cuts and recurrence-filtered subtour cuts across repeated fixed-topology solves. The strongest provider-local policy combined represented neighborhood cuts with cuts recurring across prior accepted proofs. The campaign also retained negative results: broad cumulative replay was inferior to recurrence-filtered memory, and a first learned selector did not beat the simpler all-region policy.

### Loops 1033–1532 — persistent native provider

The provider-local campaign compared a cold exact HiGHS model with a persistent fixed-topology model that retained accepted subtour constraints, updated objective coefficients, and supplied the previous independently verified tour as a MIP start. The campaign includes a timing erratum correcting an earlier timer-reset bug, paired generated-city and external-topology holdouts, factorial attribution, raw evidence acceptance, and explicit nonclaims.

These findings require canonical ingestion and fresh execution before being promoted beyond provider-local status.

## Why the work looked lost

Three things happened at once:

1. hundreds of research commits were intentionally squash-merged;
2. canonical loop history remained in the rulebook rather than in Git commit subjects;
3. later campaigns were packaged as local Git bundles and delivery archives but were never fully pushed into the canonical repository.

The squash did not erase the canonical 577–710 rulebook data. The later 913–1532 campaign repositories, however, really were outside GitHub. This alignment record makes that gap explicit instead of pretending those campaigns were already on `main`.

## Current aligned next step

Do not start another large campaign yet. First ingest the provider-local orchestration vocabulary and benchmark provenance into an appropriate shared/sibling rulebook domain, then run the real Effortless build. The first ingestion should be small enough to audit end-to-end.
