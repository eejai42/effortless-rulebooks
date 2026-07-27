# CLAUDE.md — Traveling Salesman Research Domain

Read and obey the repository root `CLAUDE.md`, `../../CLAUDE.md`, and `../../docs/LOOP_PROTOCOL.md` first. This file adds TSP-specific constraints.

## Category boundary

This is a mathematical optimization research domain. Do not add admin-portal, user, generic orchestration, or platform tables here. Provider execution and benchmark provenance may be represented only when they are TSP-domain evidence; reusable orchestration belongs in a sibling/shared domain.

## Canonical semantic asset

```text
effortless-rulebook/traveling-salesman-rulebook.json
```

The rulebook is the only canonical semantic IR. The Postgres schema, functions, views, RuleSpeak narrative, Python models, solver adapters, benchmark reports, workflows, and any UI are projections or evidence. Never create a parallel route-status, proof-status, campaign-status, or loop registry.

## Loop identity and ledger

A TSP loop is exactly one change to the parsed semantic object of the canonical TSP rulebook.

```text
TSP rulebook semantic object changed   => TSP loop
TSP rulebook semantic object unchanged => not a TSP loop
```

UI/UX, glue code, generated SQL, solver adapters, workflows, build repairs, tests, benchmark execution, reports, and documentation do not receive loop numbers unless they also change the canonical rulebook. Formatting-only rewrites are not loops when parsed-object equality holds.

All TSP loops belong in the single `TSPLoops` table in the canonical rulebook. Do not maintain authoritative loop rows in test JSON, campaign summaries, Git branches, commit messages, or prose. Those artifacts must point back to canonical loop IDs.

Loop order is immutable and reflects the order in which the conceptual model developed. Do not renumber or silently collapse distinct historical semantic changes. Do not promote code-only iterations into semantic loops. When older evidence used the word “loop” for a non-rulebook change, preserve the artifact but classify it as an experiment or implementation iteration in the consolidated ledger.

A rulebook change creates a loop; it closes only after cumulative validation, the real Effortless build, generated Postgres recreation, peer conformance, loop-specific evidence replay, and provenance capture. If a historical loop lacked a contemporaneous build, record that honestly and close it through the ordered consolidated replay rather than inventing historical evidence.

## Scope and source-of-truth doctrine

Do not copy a “current loops” list into this file. Determine the current semantic boundary from the canonical `TSPLoops` rows and the build certificate at HEAD. Prose summaries are allowed only when they are generated or explicitly reconciled against those rows.

The represented domain includes finite weighted TSP instances, city/neighborhood/address semantics, route and lower-bound witnesses, closure and search certificates, semantic-basis experiments, exact calibration, public benchmark provenance, and native-provider execution evidence. Every claim remains scoped to its represented instances and warrants.

## Status doctrine

Never conflate:

```text
canonical rulebook truth
!= open-PR or branch evidence
!= local delivery bundle
!= conversation-level hypothesis
!= verified experimental result

an imported dependency
!= an internal frontier obligation
!= a kernel assumption
!= residual search

a supplied route is structurally valid
!= the route is optimal
!= a solver found the route
!= route-discovery search was eliminated
!= a general TSP algorithm
!= P = NP
```

Use **imported dependency** only when the domain consumes an external provider conclusion. Use **frontier obligation** for an open semantic edge inside this domain, typed as `INFERENCE_OBLIGATION`, `CERTIFICATE_OBLIGATION`, `SUBSTRATE_OBLIGATION`, `GENERALIZATION_OBLIGATION`, or `RESIDUAL_SEARCH`.

A candidate may be marked optimal only from a passing finite-instance certificate with an explicit warrant. Exact enumeration, state search, LP/MILP relaxation, cutting planes, and native solver results are evidence substrates; none silently upgrades a finite claim into a universal one.

## Search and provider doctrine

Search is the final stage, not the first. Every represented inference or provider method must declare, as applicable:

- soundness and proof warrant;
- completeness boundary;
- runtime and memory measurement boundary;
- applicability;
- certificate type;
- provider and version identity;
- benchmark/data provenance;
- branch, cut, and residual accounting.

Effortless is the compiler. Do not recreate rulebook-to-SQL or rulebook-to-RuleSpeak translation in a solver adapter. A provider adapter may translate an accepted semantic artifact into a native constraint, cut, warm start, branch priority, or solve request, then return typed evidence.

## Build and reproducibility

The local database is:

```text
erb_traveling_salesman
```

Reads come only from generated `vw_*` views. Writes and seed loading go through base tables via generated SQL. Do not hand-edit generated `00`–`05` SQL files.

Use the real pipeline:

```bash
./start.sh validate
./start.sh build
./start.sh db
./start.sh test
```

A consolidated HEAD must additionally verify:

- pre-build and post-build parsed rulebook equality, or a documented semantic mutation;
- canonical loop continuity and uniqueness;
- alignment among the rulebook, problem contract, reports, and test evidence;
- generated Postgres and RuleSpeak tree identities;
- CLI commit and resolved transpiler identities;
- Postgres, Python, numerical-library, and native-provider versions;
- benchmark source and checksum provenance;
- independent replay of every accepted finite claim;
- no uncommitted build drift after formatting generated inputs as required.

The build must fail loudly if the rulebook, generated initializer, `effortless` CLI, `psql`, formatter, provider, evidence artifact, or declared provenance value is missing or inconsistent.

## Documentation discipline

READMEs and narrative reports are projections. Reconcile them only after the canonical rulebook, generated artifacts, tests, and certificates are final. The final documentation commit must not change the rulebook or any executable claim.

The success metric is coherent semantic closure with replayable evidence, not merely finding a route or producing a fast timing.
