# Effortless Math Research Handoff

> [!IMPORTANT]
> ## SUPERSEDED CURRENT-STATE NOTICE
>
> This document is retained as historical research context. Its original loop-710 and open-PR boundaries describe the repository at the time it was written; they are not the current state.
>
> On `agent/tsp_consolidation`, the canonical TSP ledger is now 577–812 with 236 rows in one `TSPLoops` table. A loop is exactly one change to the parsed canonical rulebook semantic object. UI/UX, generated projections, provider adapters, workflows, build repairs, benchmarks, reports, and packaging are not loops unless that rulebook object changes.
>
> The historical provider-iteration labels 813–1532 are reserved but noncanonical because their physical source archives are absent from this repository and their per-change rulebook deltas cannot yet be audited. Read `RESEARCH_CURRENT_STATUS.md`, `docs/LOOP_PROTOCOL.md`, the TSP `problem-contract.json`, and `testing/consolidation/` before using the historical narrative below.

## CMCC, Traveling Salesman, Predicate Invention, Semantic Orchestration, and the Protocol for Continuing the Work

**Repository:** `EffortlessAPI/effortless-rulebooks`  
**Canonical branch reviewed:** `main`  
**Canonical branch head reviewed:** `f8500bafa1b57152bfe30720ed7a5d551523eb95`  
**Canonical TSP rulebook boundary:** loops `577–710`  
**Current canonical TSP build status:** `PASS`  
**Date of this handoff:** 2026-07-20  
**Purpose:** replace a very long research conversation with a durable, auditable starting point for a new conversation.

---

# 1. Read this first

The most important fact in this document is the boundary between **canonical repository truth** and **conversation-level exploration**.

The canonical Traveling Salesman domain on `main` currently ends at loop **710**. It is represented in:

```text
rulebook-examples/effortless-math/domains/traveling-salesman/
  effortless-rulebook/traveling-salesman-rulebook.json
```

That rulebook has been passed through the real Effortless toolchain. The current build certificate says:

```text
status                                  PASS
canonical loop surface                  710 | 134 rows
physical generated views                45
Postgres projection files               17
database                                erb_traveling_salesman
rulebook used as generation input       true
database loaded from generated output   true
```

The actual executed path was:

```text
canonical rulebook
        ↓
./start.sh build
        ↓
Effortless CLI
        ↓
minimize-rulebook
rulebook-to-postgres
rulebook-to-rulespeak
        ↓
generated Postgres schema/functions/views/data
        ↓
./start.sh db
        ↓
erb_traveling_salesman
        ↓
./start.sh test
        ↓
Python/Postgres conformance
```

The successful certificate is stored at:

```text
rulebook-examples/effortless-math/domains/traveling-salesman/
  testing/effortless-build-status.json
```

The generated database is therefore once again a projection of the canonical rulebook, rather than a parallel hand-maintained implementation.

## 1.1 What is not canonical

The conversation later discussed and sometimes packaged additional campaigns beyond loop 710, including exact-search, wall-clock, orchestration, solver-assistance, persistent-provider, and cross-domain ideas. Some of that work appears in open PR #5 or in local delivery bundles produced during the conversation. Much of it was never ingested into the canonical rulebook and never passed through the current Effortless→Postgres→conformance gate.

Therefore:

```text
conversation claim
≠ repository evidence
≠ canonical rulebook row
≠ generated Postgres fact
≠ independently replayed result
```

Do not cite loops `711+` as canonical merely because the conversation contains detailed prose or numbers. Treat them as one of:

```text
PROPOSED
PROVIDER_LOCAL_EVIDENCE
UNINGESTED_BUNDLE
OPEN_PR_EVIDENCE
HYPOTHESIS
```

until they are reviewed, represented in the rulebook, built by Effortless, loaded into Postgres, and independently replayed.

This document deliberately preserves the valuable ideas from the later conversation while refusing to upgrade their evidentiary status.

---

# 2. The research program in one page

The broad research question is:

> Can large mathematical and computational objects be represented as executable semantic structures whose conclusions emerge from witnessed relationships, invariants, and transformations rather than opaque theorem or solver invocations?

The working CMCC hypothesis is empirical:

> Large mathematical or computational objects frequently admit a reusable semantic decomposition into a relatively small set of structural primitives and transformations.

The project does **not** claim that CMCC is proved.

The project does **not** claim that Fermat’s Last Theorem has been independently reproved.

The project does **not** claim `P = NP`.

The project does **not** claim a new general TSP algorithm.

The project does explore whether:

```text
named theorem / named algorithm / named domain object
                ↓
objects + relations + constraints + witnesses
                ↓
reusable inference geometry
                ↓
certificates, projections, and specialized runtimes
```

The core architectural decision is:

> The canonical artifact is the rulebook, not the prose proof, generated SQL, Python program, database, or solver implementation.

The core operational decision is:

> The rulebook does not need to be the fastest final runtime. It needs to be the trustworthy semantic and orchestration surface from which specialized runtimes can be selected or generated.

---

# 3. The canonical architecture

The current architecture should be understood as five separate layers.

## 3.1 Layer A — Canonical semantic rulebook

The rulebook stores the meaning:

```text
objects
relationships
constraints
witnesses
inference rules
case partitions
trust boundaries
frontier obligations
counterfactuals
invariants
execution contracts
historical loop records
```

For the TSP domain, the canonical asset is:

```text
domains/traveling-salesman/
  effortless-rulebook/traveling-salesman-rulebook.json
```

The rulebook is standard JSON with single-line leaf records after formatting. The formatter is required after hand edits and after builds because the transpiler may rewrite or expand rulebook JSON during normalization.

## 3.2 Layer B — Effortless compiler/toolchain

Effortless is the compiler. Do not rebuild it inside the research domain.

The current TSP project declares these transpilers in `effortless.json`:

```text
minimize-rulebook
rulebook-to-postgres
rulebook-to-rulespeak
```

The CLI is installed from the pinned commit archive:

```text
https://github.com/EffortlessAPI/cli/archive/
1551cb82d5a8992ad09e4c82d08e28493f92f7b4.tar.gz
```

The pinned CLI version is `2026-06-09.06.13`.

The compiler is trusted to perform the extensive, already-developed work of translating rulebook semantics into:

```text
schema
foreign keys
calculation functions
lookup functions
views
seed data
initialization scripts
human-readable RuleSpeak
```

The research should not duplicate that work in ad hoc SQL generation.

## 3.3 Layer C — Generated Postgres semantic substrate

Postgres is the default executable editing and checking surface.

It is valuable because it makes the represented geometry queryable and composable:

```text
SELECT represented objects
JOIN relationships
inspect derived facts
query open frontier obligations
compare witnesses
replay invariant results
observe state transitions
```

The database is generated and loaded through:

```bash
./start.sh build
./start.sh db
```

The database name is:

```text
erb_traveling_salesman
```

Reads are expected to go through generated `vw_*` views. Generated `00`–`05` SQL should not be hand-maintained as a second source of truth.

## 3.4 Layer D — Independent peer verifier

Python is not the canonical database generator.

`reference_model.py` consumes raw rulebook rows and independently evaluates a selected semantic surface, including:

```text
graph normalization
canonical edge-pair uniqueness
candidate-cycle validity
local degree-bound witnesses
instance lower bounds
finite optimality certificates
search metrics
```

`testing/take-test.py` compares those Python results with generated Postgres views.

This gives us:

```text
rulebook
   ├── generated Postgres interpretation
   └── independent Python interpretation

agreement required
```

Conformance does not prove that the shared semantics are mathematically complete. Two implementations can agree on the same conceptual omission. Soundness still requires counterexamples, exact finite oracles where appropriate, proof obligations, and eventually stronger formal substrates.

## 3.5 Layer E — Specialized external runtimes

The major conceptual pivot in the conversation was:

> The geometry is where we represent and understand the problem. It is not necessarily where the final numerical search must run.

A mature architecture should allow:

```text
rulebook / Postgres semantic model
        ↓
structural inference and orchestration
        ↓
compiled advice or provider contract
        ↓
HiGHS / Gurobi / CP-SAT / SAT / Rust / C++ / another native runtime
        ↓
result evidence
        ↓
independent verification and acceptance
```

Examples of compiled advice include:

```text
valid initial cuts
cut priorities
candidate edges
warm starts
branching priorities
subproblem boundaries
state quotients
provider selection
artifact retention or invalidation
```

The rulebook should govern the semantics and trust status of these artifacts. The native solver should perform the numerical work it is designed to perform.

---

# 4. Rulebook DNA and epistemic discipline

The research only remains credible if statuses are never silently promoted.

## 4.1 Permanent distinctions

These are different forever:

```text
parent removed
parent decomposed
parent derived
parent internalized
fully internalized for scope
foundational
```

For optimization, these are also different:

```text
supplied route is valid
route was constructed by the system
route is optimal for one finite instance
optimal value is known
an optimal witness is known
an optimal representative is unique
search was avoided
search was merely moved to another provider
```

And these are different:

```text
semantic fact is valid
operational artifact is useful
artifact is accepted by one provider
artifact shortens wall clock
artifact generalizes to held-out data
```

## 4.2 Trust is data

Every result should record:

```text
scope
version
hypotheses
provider
antecedents
certificate type
status
remaining frontier
artifact hashes
measurement environment
```

Trust should shrink only through explicit witnessed closure. It must never disappear accidentally because a build is green or a theorem name was replaced by smaller theorem names.

## 4.3 Loops are semantic revisions

A loop is not merely a commit or a prose note.

A loop should contain:

```text
LoopId
LoopOrder
Status before execution
BeforeState
PlannedClosureCriterion
Execution evidence
AfterState
WitnessSummary
CompletionDisposition
```

After the repository history was squash-merged, it became clear that the canonical loop history belongs in the rulebook ledger, not in the existence of one Git commit per loop.

Git history is useful provenance. It is not the canonical mathematical history.

---

# 5. What the TSP domain currently represents

The domain began with a city-scale ontology:

```text
City
└── Neighborhood
    └── Address
        └── InstanceStop
            ├── TravelEdge
            ├── TourStop
            ├── TourLeg
            ├── local inference witnesses
            └── boundary states
```

`InstanceStop` separates a physical address from its membership in one TSP instance.

`TravelEdge` makes connectivity first-class.

A supplied tour is represented as ordered `TourStop` rows and edge-bound `TourLeg` rows rather than an opaque route string.

The broader represented structure includes:

```text
TSPInstance
├── graph normalization
├── candidate tours
├── local degree bounds
├── instance lower bounds
├── inferred edge sets
├── connected degree-two certificates
├── route reconstruction
├── optimality certificates
├── constraint rounds and decisions
├── neighborhood boundary states
├── exact finite calibration rows
├── search certificates
└── frontier obligations
```

The current canonical contract is `RESEARCH_PROGRAM`.

The active imported dependency count is zero for the represented TSP domain. This does not make all general TSP mathematics internalized. It means the represented finite contracts do not currently consume external theorem-provider rows as active imports.

---

# 6. Compressed history of canonical loops 577–710

This section replaces many turns of conversation with the durable conceptual progression.

## 6.1 Loops 577–581 — initial representation

The first five loops established:

```text
577  City → Neighborhood → Address hierarchy
578  finite weighted graph normalization
579  ordered route witness
580  positive and negative supplied-tour validation
581  explicit residual-search baseline
```

The important initial discipline was:

```text
valid supplied route
≠ optimal route
≠ route discovered by the system
≠ general solver
```

## 6.2 Loops 582–586 — certificate hardening and finite optimality

The next five loops closed defects found during review:

```text
582  typed frontier obligations
583  one-in/one-out global cycle coverage
584  canonical unordered edge-pair multiplicity
585  degree-two local-to-global lower bound
586  finite optimality by lower-bound equality
```

Gridville’s five-stop instance has a witnessed lower bound:

```text
A: two cheapest incident costs = 2 + 3 = 5
B:                              2 + 3 = 5
C:                              3 + 3 = 6
D:                              3 + 3 = 6
E:                              3 + 3 = 6

sum = 28
count each tour edge twice
lower bound = 28 / 2 = 14
```

The represented route has cost 14, so it is optimal for that finite instance.

## 6.3 Loops 587–596 — generated substrate, inference spine, and contraction

These loops established:

```text
587  generated Postgres commissioning
588  first-class inference applications and antecedents
589  inferred edge-set construction
590  connected degree-two certificate
591  route reconstruction without supplied candidate antecedent
592  derived search accounting
593  non-tight twin-triangle counterexample
594  degree-two forcing
595  forbidden-edge propagation
596  neighborhood boundary-state contraction
```

The route:

```text
A → B → C → D → E → A
```

is reconstructed from inferred edges with:

```text
CandidateUsedAsAntecedent = false
```

Twin triangles prevents overgeneralization:

```text
sound degree-two lower bound = 6
selected structure           = two disconnected cycles
feasible Hamiltonian tour    = 24
```

Therefore:

```text
sound lower bound
≠ tight lower bound
≠ connected tour
≠ optimality certificate
```

## 6.4 Loops 597–610 — first predicate-convergence pass

The working prediction was recorded:

> Repeated TSP concepts will begin to collapse onto a smaller reusable basis while useful derived predicates continue to be invented.

Thirty-two recurring surface predicates were mapped onto an eight-predicate basis:

```text
MEMBERSHIP
INCIDENCE
CARDINALITY
ORDER
WEIGHT
COMMITMENT
CONNECTIVITY
PROVENANCE
```

Coined derived terms included:

```text
Commitment Lattice
Incidence Budget
Defect Vector
Cut Parity
Component Repair Bound
Bound Sandwich
Witness Normal Form
Boundary Signature
Semantic Quotient
Component Quotient
Closure Event
Convergence Event
```

The conceptual observation was not that the number of names monotonically decreases.

It was:

```text
useful derived vocabulary may grow
while the proposed primitive basis stabilizes or shrinks
```

Twin triangles gained a stronger composed lower bound:

```text
degree-two base                       6
mandatory crossings        2 × 10   +20
released internal edges    2 × 1     -2
----------------------------------------
component-repair lower bound          24
feasible witness                       24
```

The original non-tight degree-only bound remained preserved.

## 6.5 Loops 611–623 — atom/operator factorization

The eight predicates were factored into candidate relational atoms and operators:

```text
ATOMS
  ATTACHMENT
  VALUATION
  WARRANT

OPERATORS
  CLOSURE
  AGGREGATE
  QUOTIENT
  FIXPOINT
```

An asymmetric four-stop neighborhood demonstrated two distinct reductions:

```text
24 directed Hamiltonian paths
        ↓ reversal quotient
12 path classes
        ↓ minimum valuation in each boundary fiber
 6 surviving boundary states
```

This coined or sharpened:

```text
Boundary Port
Boundary Fiber
Fiber Minimum
```

The important guardrail was:

> Conceptual convergence does not require monotone physical shrinkage. Replacing one opaque box with explicit witnessed machinery may temporarily grow the DAG while reducing semantic opacity.

## 6.6 Loops 624–646 — one typed arc and one warranted rewrite

The candidate atoms collapsed to one typed relation:

```text
SEMANTIC_ARC(subject, label, target)
```

The candidate operators collapsed to one transformation shape:

```text
WARRANTED_REWRITE(input, rule, polarity, output, warrant)
```

Historical concepts remain recoverable through typed labels, target sorts, rule identities, and warrants. This is not an untyped “everything is a triple” claim.

A three-region fixture added:

```text
Boundary Handshake
Region Repair Equation
Balanced Edge Exchange
```

An optimal-face fixture separated:

```text
unique optimum value
≠ unique optimal witness
```

Two equal-value tours formed a choice orbit. Mathematical branching for value proof was rejected because the value was already closed. Selecting one representative would require an external policy.

## 6.7 Loops 647–710 — frozen-basis finite calibration

The basis was frozen at:

```text
SEMANTIC_ARC
WARRANTED_REWRITE
```

Twelve held-out finite instances through nine stops were fixed before exact analysis.

A depot-fixed, reversal-quotient exact oracle enumerated every feasible route class for calibration.

The exact oracle is explicitly not a structural proof.

The canonical summary records:

```text
held-out instances              12
exact oracle coverage           100%
value closed structurally        5
route closed structurally        3
value-relevant branch required   7
maximum exact route classes   2520
new primitive growth             0
```

This calibration demonstrated that:

```text
value closure
route reconstruction
choice multiplicity
residual value uncertainty
```

are separate coordinates.

---

# 7. The strongest canonical conceptual distinctions

These are the distinctions most worth carrying into other domains.

## 7.1 Value / witness / choice

```text
optimum value known
≠ attaining witness constructed
≠ unique representative selected
```

This prevents unnecessary search after the mathematical value question is already answered.

## 7.2 Local validity / global closure

```text
all local degree constraints satisfied
≠ one globally connected tour
```

This generalizes to many domains:

```text
all clauses locally satisfiable under fragments
≠ global SAT witness

all jobs locally schedulable
≠ globally feasible schedule

all package constraints pairwise compatible
≠ globally consistent dependency solution
```

## 7.3 Semantic validity / operational utility

```text
artifact is mathematically valid
≠ artifact speeds up a provider
```

This distinction became central during later solver-orchestration discussions and should be made canonical in the next domain.

## 7.4 Residual multiplicity / residual uncertainty

```text
multiple surviving witnesses
≠ unresolved objective value
```

The system should type the residue:

```text
value-relevant
feasibility-relevant
connectivity defect
policy-relevant choice
provenance-only multiplicity
```

## 7.5 Search / deterministic closure

Search should begin only after represented deterministic inferences reach a fixed point.

A branch should state what it is intended to resolve:

```text
proof branch
witness branch
choice branch
```

A branch without a declared unresolved defect is not well justified.

---

# 8. The major architectural pivot: semantic optimization compiler

The conversation initially asked whether Effortless could become a TSP solver.

The more promising question became:

> Can a semantic representation discover reusable structural knowledge and compile that knowledge into advice or specialized components that make existing solvers perform less work?

This suggests the following architecture:

```text
Rulebook
  canonical meaning and scientific protocol
        ↓
Effortless compiler
  generated Postgres and other projections
        ↓
Semantic orchestration
  provider choice, artifact admission, state transitions,
  evidence requirements, retention and invalidation
        ↓
Purpose-built adapters
  translate accepted semantic artifacts into native provider inputs
        ↓
Existing native solver
  performs numerical search
        ↓
Evidence envelope
        ↓
Independent verification
        ↓
Canonical acceptance or rejection
```

A concise project description is:

> Effortless Math explores a semantic optimization compiler: a rulebook-governed system that discovers reusable structural knowledge and compiles it into specialized execution strategies for existing solvers.

The rulebook is the IR and scientific record.

Effortless is the compiler.

Postgres is the default semantic execution and inspection surface.

Native solvers remain native solvers.

---

# 9. Do not rebuild the Effortless compiler

The `rulebook-to-postgres` tool has already absorbed extensive development and testing effort.

The research layer should rely on it for:

```text
schema generation
relationship materialization
formula compilation
lookup generation
view generation
data loading
execution ordering
```

Do not write a replacement rulebook-to-SQL compiler inside TSP, Python adapters, or a new orchestration prototype.

Purpose-built code is appropriate at a different boundary:

```text
valid semantic artifact
        ↓
small provider adapter
        ↓
solver-native object
```

Examples:

```text
rulebook cut certificate → HiGHS row constraint
rulebook branch warrant  → solver branch priority
rulebook warm start       → provider incumbent API
rulebook region state     → specialized DP kernel
rulebook clause family    → SAT assumptions or learned clause seed
```

The adapter should not recreate the semantic database or compiler.

---

# 10. Verified current build and how it was repaired

A real build was run after the conversation raised concerns that the rulebook might no longer be driving the database.

## 10.1 First failure: validator depended on unsquashed Git history

The semantic validators passed, but an older calibration verifier required one Git commit subject per historical loop.

The TSP history had intentionally been squash-merged, so the verifier failed with a missing-commit assertion.

The repair was to declare the canonical loop history in the rulebook ledger and validate the retained evidence rather than requiring old commit subjects to remain in `main` history.

This established:

```text
canonical history = TSPLoops ledger + evidence
not
canonical history = one Git commit per loop forever
```

## 10.2 Second failure: executable bit lost during squash

The next build reached the execution stage but failed because `start.sh` was no longer executable.

The file mode was restored.

## 10.3 Final successful path

The successful run installed the pinned CLI, validated the rulebook, built the projections, recreated Postgres, and ran conformance.

The generation log records:

```text
minimize-rulebook completed
rulebook-to-postgres completed
395 calculation/lookup functions generated
rulebook-to-rulespeak completed
```

The conformance result was:

```text
graph substrate agreement             19 / 19
tour substrate agreement              24 / 24
local-bound substrate agreement      109 / 109
instance-bound substrate agreement    16 / 16
optimality-certificate agreement      12 / 12
tour invariants                         8 / 8
graph invariants                        2 / 2
search substrate agreement              2 / 2
frontier obligations                   34 total
imported obligations                    0
closed obligations                     32
```

The current durable commit containing the verified generated projection is:

```text
8ca99fa822022a81bf94761df8f10e61300f399c
Verify TSP rulebook through Effortless build and generated Postgres
```

The subsequent main-branch cleanup commit is:

```text
f8500bafa1b57152bfe30720ed7a5d551523eb95
Run canonical TSP Effortless build and generated Postgres conformance
```

---

# 11. Current codebase map

A new conversation should begin by reading these files in order.

## 11.1 Domain instructions

```text
rulebook-examples/effortless-math/CLAUDE.md
rulebook-examples/effortless-math/domains/traveling-salesman/CLAUDE.md
```

Important current observation: both instruction files contain historical sections that no longer fully describe the current loop boundary. The TSP-specific file still lists loops 577–586 as the current loop list and describes already-closed frontier items as immediate work.

Treat those stale sections as documentation debt. Continue obeying the durable doctrines:

```text
rulebook is canonical
no parallel status registry
generated SQL is not hand-maintained
fail loudly
read vw_* views
search is final, not first
```

## 11.2 Canonical rulebook

```text
domains/traveling-salesman/
  effortless-rulebook/traveling-salesman-rulebook.json
```

Current canonical facts:

```text
highest loop              710
loop rows                 134
physical tables            45
active relational atom      1
active semantic operator    1
```

## 11.3 Project configuration

```text
domains/traveling-salesman/effortless.json
```

It declares the minimizer, Postgres generator, and RuleSpeak generator.

Important reproducibility issue: the CLI archive is pinned, but the build log shows the CLI resolving a newer cloud `rulebook-to-postgres` transpiler version than the `LastVersionUsed` value stored in `effortless.json`.

The latest successful log used:

```text
rulebook-to-postgres v2026.07.19.1238
```

while `effortless.json` records an earlier `LastVersionUsed` value.

Therefore, the toolchain is not yet fully content-pinned merely because the CLI commit is pinned. A future loop should record and, if supported, pin the actual transpiler versions or service digests used by each build.

## 11.4 Control panel

```text
domains/traveling-salesman/start.sh
```

Commands:

```text
validate
build
db
test
show
contract
all
```

The intended complete path is:

```bash
./start.sh all
```

## 11.5 Problem contract

```text
domains/traveling-salesman/problem-contract.json
```

Current version: `0.7.0`.

It records claims, nonclaims, loop summaries, execution substrates, evidence, and artifact hashes.

Important documentation drift: the TSP README still declares version `0.3.1`, while the problem contract declares `0.7.0`.

Important artifact drift: several historical projection hashes in `problem-contract.json` do not equal the newest build certificate’s generated tree hash. The problem contract mixes historical loop-specific hashes with a top-level hash that can become stale after a new build.

A future reconciliation loop should either:

```text
update current build hashes automatically
```

or:

```text
make every hash explicitly historical and version-addressed
```

so there is no ambiguous “current projection” field.

## 11.6 Independent Python substrate

```text
domains/traveling-salesman/scripts/reference_model.py
```

The module states explicitly that the rulebook is canonical and Python is an independent execution substrate.

## 11.7 Postgres/Python conformance

```text
domains/traveling-salesman/testing/take-test.py
```

This test derives expected evolving counts from raw rulebook rows instead of maintaining another answer ledger.

## 11.8 Build certificate and logs

```text
domains/traveling-salesman/testing/effortless-build-status.json
domains/traveling-salesman/testing/effortless-build-generation.log
domains/traveling-salesman/testing/effortless-build-postgres-load.log
domains/traveling-salesman/testing/effortless-build-conformance.log
```

## 11.9 Build workflow

```text
.github/workflows/verify-tsp-effortless-build.yml
```

The workflow installs the pinned CLI, runs validation, generates projections, recreates Postgres, runs conformance, records hashes, and commits the result.

It can be run manually. It also has a trigger-file path for controlled runs.

## 11.10 Open PR #5

PR #5 is open and currently describes evidence through loops 912.

It is not the canonical TSP rulebook state.

Before merging or superseding it:

1. inspect every changed file;
2. separate actual scripts and result rows from conversation-generated summaries;
3. rerun the methods under the current build protocol;
4. assign canonical loop numbers without collisions;
5. ingest only evidence that survives replay;
6. rebuild with Effortless;
7. load generated Postgres;
8. run conformance;
9. squash the publication history if desired, while preserving the loop ledger in data.

---

# 12. What happened after loop 710 in the conversation

The later conversation generated several valuable experimental designs:

```text
exact MST-envelope search
Held–Karp comparisons
subtour-elimination relaxation
comb cuts
wall-clock attribution
solver provider orchestration
state machines
artifact admission
accepted-cut memory
persistent model reuse
cross-domain semantic compilation
```

It also produced detailed numerical claims and local downloadable bundles.

However, the assistant later acknowledged that some campaign descriptions were presented as completed work without a reliable execution basis. The current repository audit confirms that the canonical rulebook stops at 710 and the open PR does not establish the later campaigns as current generated facts.

Therefore, preserve the **questions and designs**, not the unverified conclusions.

## 12.1 Valuable hypotheses to retest

These hypotheses are worth real experiments:

### H1 — Semantic advice can accelerate an unchanged native solver

Compare:

```text
same provider
same machine
same instances
same limits

baseline
versus
baseline + rulebook-derived advice
```

### H2 — Accepted proof artifacts can be reusable across related solves

Examples:

```text
valid cuts across weight changes on fixed topology
verified incumbents
state quotients
region boundary states
branch priorities
```

### H3 — Artifact validity and artifact utility require separate predicates

A cut may be valid forever but harmful to wall clock on a particular provider run.

### H4 — Orchestration can be represented independently of provider implementation

The rulebook should record:

```text
what must be solved
what provider can do
what artifacts are admissible
what state transition is legal
what evidence is required
```

without embedding HiGHS or Gurobi implementation details into the canonical ontology.

### H5 — The ontology will continue to converge

Temporary explicit growth is allowed when a black box is replaced by smaller, witnessed concepts.

The expected trend is:

```text
more explicit evidence
more derived predicates
smaller opaque trust boundaries
stable or shrinking primitive basis
clearer cross-domain connective tissue
```

These hypotheses are not current results. They are the next research program.

---

# 13. The recommended cross-domain pivot

The next campaign should loosen the city/neighborhood ontology and test whether the semantic machinery survives unrelated search domains.

A reasonable first set is:

```text
Traveling Salesman / routing
SAT / constraint satisfaction
Job-shop scheduling
Dependency or package resolution
```

Other candidates include:

```text
MIPLIB-style mixed-integer optimization
MiniZinc challenge problems
graph coloring
set cover
vehicle routing
workflow planning
```

The point is not to build four new solvers.

The point is to compare four semantic geometries.

For each domain, ask:

```text
What is an object?
What is a relation?
What is a constraint?
What is a witness?
What is a defect?
What is a repair?
What is a bound?
What is a quotient?
What is a branch warrant?
What evidence can be retained?
What invalidates retained evidence?
```

The working prediction is that ontological, taxonomic, and semantic distinctions will become clearer, and that the connective tissue will emerge through predicates required to make the domains share one orchestration contract.

---

# 14. A proposed generic orchestration domain

Do not place platform/orchestration tables into the TSP rulebook if the domain instructions prohibit it.

Create a sibling domain or shared kernel, for example:

```text
domains/semantic-orchestration/
```

or:

```text
shared-kernels/semantic-orchestration/
```

The exact location should respect the repository’s domain/platform boundary.

## 14.1 Candidate canonical entities

```text
ProblemKind
ProblemInstance
Dataset
DatasetVersion
BenchmarkCase
BenchmarkSplit
Provider
ProviderVersion
Capability
SolveContract
SolvePlan
SolveStage
StateTransitionRule
SolveRun
Artifact
ArtifactType
ArtifactEligibility
ArtifactAdmission
ProviderInvocation
ProviderResult
EvidenceEnvelope
IndependentCheck
AcceptanceDecision
Measurement
Claim
FrontierObligation
```

## 14.2 Candidate solve state machine

```text
DECLARED
→ PLANNED
→ PREPARED
→ PROVIDER_BOUND
→ RUNNING
→ CANDIDATE
→ VERIFIED
→ ACCEPTED
```

Alternative terminal states:

```text
REJECTED
FAILED
ABORTED
SUPERSEDED
```

Every transition needs:

```text
from state
to state
rule
antecedents
actor/provider
warrant
created artifact
evidence
```

## 14.3 Candidate artifact lifecycle

```text
PROPOSED
→ VALIDATED
→ ELIGIBLE
→ ADMITTED
→ COMPILED
→ INJECTED
→ MEASURED
→ RETAINED
```

Alternative states:

```text
REJECTED
RETIRED
INVALIDATED
SUPERSEDED
```

This lifecycle captures the critical distinction:

```text
mathematically valid
≠ eligible in current scope
≠ admitted for this provider
≠ injected successfully
≠ operationally beneficial
≠ retained for future runs
```

## 14.4 Provider contract

A provider should declare:

```text
ProviderId
Version
ProblemKindsSupported
InputArtifactTypes
OutputArtifactTypes
ExactnessClaims
Determinism
RuntimeEnvironment
ResourceLimits
EvidenceFormat
IndependentVerificationContract
```

The rulebook should not trust a provider’s self-reported `optimal` status without independent acceptance checks appropriate to the domain.

---

# 15. Benchmark and dataset discipline

The next work must rely more heavily on real, external datasets.

Every benchmark dataset should have first-class provenance.

## 15.1 Dataset record

```text
DatasetId
Name
Domain
SourcePublisher
SourceLocation
SourceVersion
AcquiredAt
License
RawArtifactHash
NormalizedArtifactHash
ParserVersion
NormalizationRules
KnownIssueLedger
```

## 15.2 Benchmark case record

```text
BenchmarkCaseId
DatasetVersion
ProblemKind
InstanceName
Dimension
Metric or semantics
KnownOptimum
KnownOptimumStatus
KnownOptimumSource
Train / development / holdout / external replication
Predeclared before execution?
```

Known optimum status should distinguish:

```text
published import
independently recomputed exact value
certified structural theorem
best known value only
unknown
```

## 15.3 Experiment record

```text
ExperimentId
PreregistrationHash
CodeCommit
RulebookHash
EffortlessCLICommit
TranspilerVersions
ProviderVersions
MachineDescription
OperatingSystem
CPU
Memory
ThreadCount
Seed
Warm or cold process
Timeout
MeasurementStartBoundary
MeasurementEndBoundary
```

## 15.4 Timing doctrine

Wall-clock claims must define exactly what is timed.

For example:

```text
model construction
artifact compilation
provider initialization
native solve
postprocessing
independent verification
```

Report both:

```text
end-to-end elapsed
provider-only elapsed
```

Do not reset the timer inside an iterative solver loop and then call the final iteration time the total solve time.

Record timeouts as censored results, not as completed observations.

## 15.5 Evaluation design

Prefer paired comparisons:

```text
same instance
same provider
same resource limit
same machine
same process condition
baseline vs semantic assistance
```

Freeze the rulebook, provider configuration, and selector before holdout execution.

Retain negative results.

---

# 16. The next 50-loop research program

The user’s latest intended pivot was to spend approximately 50 loops answering whether semantic knowledge can be compiled into useful executable structure across domains.

A disciplined version follows.

## Loops 711–715 — repository and evidence reconciliation

Do not blindly reuse the old numbering if PR #5 still owns those numbers. Reconcile the namespace first.

Tasks:

```text
inventory PR #5
classify each artifact
close or supersede stale claims
choose next available canonical loop order
record this handoff as historical context, not a theorem
```

## Loops 716–725 — generic benchmark and orchestration schema

Represent:

```text
Dataset
DatasetVersion
BenchmarkCase
Provider
Capability
SolvePlan
SolveState
Artifact
EvidenceEnvelope
Measurement
```

Close only after Effortless generates the Postgres projection and the database loads.

## Loops 726–735 — TSP adapter as first provider

Use the existing TSP domain as one consumer of the generic orchestration contract.

Do not move TSP semantics into the orchestration domain.

Represent provider invocation and result acceptance.

## Loops 736–745 — second domain

Choose a small, well-sourced SAT or scheduling benchmark.

Represent the same orchestration state machine without adding a new platform primitive unless the existing model genuinely cannot express the distinction.

## Loops 746–755 — third and fourth domains

Add dependency resolution and one additional constraint domain.

Measure ontology reuse and new-term pressure.

## Loops 756–765 — first compiled-advice comparison

For one domain, compare:

```text
native provider baseline
versus
native provider + rulebook-derived artifact
```

The result is meaningful only if:

```text
same solver
same problem
same correctness result
actual measured runtime
held-out benchmark
```

The loop count is a planning aid, not a requirement to manufacture fifty conclusions. Fewer meaningful loops are preferable to filler.

---

# 17. Loop closure protocol from now on

A loop may be marked `CLOSED` only when all applicable stages pass.

```text
1. Record PLANNED row and before-state.
2. Change the canonical rulebook.
3. Format the rulebook.
4. Run canonical semantic validation.
5. Run actual Effortless build.
6. Confirm generated artifacts exist.
7. Recreate Postgres from generated SQL.
8. Run Postgres/Python or other peer conformance.
9. Run the declared benchmark or experiment.
10. Run independent evidence verification.
11. Record after-state, witness, hashes, and nonclaims.
12. Mark the loop CLOSED.
13. Commit or squash as repository policy dictates.
```

If a stage fails:

```text
Status = BLOCKED or FAILED
FailingStage = explicit
Partial evidence retained
No completion claim
```

## 17.1 Build gate

At minimum:

```bash
./start.sh validate
./start.sh build
./start.sh db
./start.sh test
```

or:

```bash
./start.sh all
```

## 17.2 Clean-diff gate

Because the build can rewrite the rulebook and generated artifacts:

```text
capture pre-build rulebook hash
run build
format rulebook
capture post-build rulebook hash
explain any semantic change
```

A build should not silently mutate the canonical semantic object.

## 17.3 Toolchain identity gate

Record:

```text
CLI commit
resolved transpiler versions
transpiler URLs or content identities
Postgres version
Python version
provider versions
```

Pinning only the CLI is not sufficient if the CLI resolves changing remote transpilers.

---

# 18. Current codebase strengths

The current repository has several strong properties.

## 18.1 Canonical rulebook is real

The TSP rulebook is not merely prose. It successfully generates a substantial Postgres projection.

## 18.2 Generated substrate is checked independently

Python and Postgres agree across graph, tour, bound, certificate, invariant, search, and frontier surfaces.

## 18.3 Trust distinctions are represented

The domain distinguishes:

```text
imported dependency
frontier obligation
kernel assumption
residual search
```

and:

```text
valid route
optimal route
reconstructed route
exact calibration
```

## 18.4 Negative certificates exist

The domain includes duplicate-stop, missing-transition, duplicate-edge-pair, disconnected-subtour, and non-tight-bound cases.

## 18.5 Predicate invention is versioned

Conceptual convergence is represented as an empirical program rather than a universal theorem.

## 18.6 Build failures are informative

The recent recovery exposed two real repository defects—history coupling and file mode loss—and repaired them transparently.

---

# 19. Current codebase weaknesses and cleanup opportunities

## 19.1 Documentation drift

Examples:

```text
README version 0.3.1
problem contract version 0.7.0
TSP CLAUDE.md current-loop list ends at 586
immediate frontier describes already-closed work
```

Add a reconciliation loop.

## 19.2 Workflow and migration clutter

The repository contains many historical TSP workflows, triggers, retry scripts, payload fragments, and versioned migration scripts.

Preserve useful evidence, but reduce the active operational surface to:

```text
one canonical validator
one full Effortless build workflow
one benchmark runner per active campaign
one explicit failure archive
```

## 19.3 Artifact-hash ambiguity

Historical and current hashes are mixed in the problem contract. Make current versus historical explicit.

## 19.4 Toolchain pinning is incomplete

The CLI is pinned, but remote transpilers may resolve to newer versions. Record and, where possible, pin the resolved transpiler identities.

## 19.5 Build may rewrite canonical input

Add pre/post semantic hash and object-equality checks.

## 19.6 Open PR #5 is stale relative to canonical main

Audit, rebase, split, or close it. Do not merge its prose claims without replay.

## 19.7 TSP domain should not absorb platform orchestration

The domain’s own instructions prohibit generic orchestration/platform tables. Create a sibling/shared domain.

## 19.8 One-arc/one-rewrite is highly expressive

Expressibility is not enough to demonstrate compression.

Measure:

```text
new conclusions per new primitive
reuse across domains
rule length
exception count
held-out prediction
residual ambiguity reduction
```

---

# 20. Working glossary for the next conversation

## Canonical architecture terms

```text
Rulebook
Projection
Execution substrate
Provider
Certificate
Trust boundary
Frontier obligation
Invariant
Counterfactual
Semantic Arc
Warranted Rewrite
```

## High-value optimization distinctions

```text
Bound Sandwich
Value / Witness / Choice Split
Witness Gap
Dual Value / Witness Shape Split
Search-State Quotient
Branch Warrant
Proof Branch
Witness Branch
Choice Branch
Boundary Fiber
Fiber Minimum
Contiguity Warrant
```

Some terms in this list arose after the canonical boundary or were frozen only in conversation-level planning. Before treating any term as canonical, verify that it exists in the current rulebook’s concept registry.

Standard literature methods should keep their standard names:

```text
Held–Karp
one-tree bound
assignment relaxation
subtour-elimination constraint
comb inequality
branch-and-bound
branch-and-cut
2-opt
3-opt
```

Do not rename established algorithms merely to increase the invented vocabulary.

---

# 21. Questions the new conversation should answer

The next conversation should begin with repository inspection, then answer these questions in order.

## 21.1 Repository truth

```text
What is current main HEAD?
What is highest canonical loop?
Does the full Effortless build still pass?
Does generated Postgres still match the peer verifier?
What PRs or bundles remain unintegrated?
```

## 21.2 Ontology

```text
Which current TSP concepts are domain-specific?
Which are generic optimization concepts?
Which are generic scientific-workflow concepts?
Where should generic orchestration live in the repository?
```

## 21.3 Compilation

```text
What semantic artifact can be compiled into a native provider input?
What exact provider API consumes it?
What validity warrant is required?
What independent evidence proves the provider result?
```

## 21.4 Cross-domain reuse

```text
Does the same solve state machine work for SAT?
Scheduling?
Dependency resolution?
Which predicates survive unchanged?
Which new predicates are genuinely necessary?
```

## 21.5 Scientific leverage

```text
Does semantic assistance reduce wall clock on external held-out data?
Which artifact caused the reduction?
What is the cost of compiling and maintaining the artifact?
When does it hurt?
What invalidates it?
```

---

# 22. A ready-to-use prompt for the new conversation

Copy the following into a new conversation.

```text
We are continuing the Effortless Math / CMCC research program in:

https://github.com/EffortlessAPI/effortless-rulebooks

Start by reading:

rulebook-examples/effortless-math/RESEARCH_HANDOFF.md
rulebook-examples/effortless-math/CLAUDE.md
rulebook-examples/effortless-math/domains/traveling-salesman/CLAUDE.md
rulebook-examples/effortless-math/domains/traveling-salesman/problem-contract.json
rulebook-examples/effortless-math/domains/traveling-salesman/effortless.json
rulebook-examples/effortless-math/domains/traveling-salesman/start.sh
rulebook-examples/effortless-math/domains/traveling-salesman/scripts/reference_model.py
rulebook-examples/effortless-math/domains/traveling-salesman/testing/take-test.py
rulebook-examples/effortless-math/domains/traveling-salesman/testing/effortless-build-status.json

Re-analyze the current main branch rather than trusting conversation history.

The canonical TSP boundary is loop 710 unless the repository proves otherwise.
Do not treat PR #5 or old local campaign bundles as canonical without replay.

The current architectural thesis is:

1. The rulebook is the canonical semantic IR.
2. Effortless is the compiler; do not rebuild rulebook-to-SQL.
3. Generated Postgres is the default semantic execution and checking surface.
4. Python is an independent peer verifier, not the canonical database generator.
5. Native solvers may execute numerical work outside Postgres.
6. Generic orchestration should be represented in a sibling/shared rulebook domain.
7. A loop closes only after actual Effortless build, generated DB load, conformance, benchmark execution, and independent evidence verification.

The next research objective is to create a generic semantic-orchestration and benchmark-provenance model, then test it across TSP, SAT, job-shop scheduling, and dependency resolution using real external datasets.

First report:

- current repository state;
- build status;
- stale or conflicting documentation;
- open PR and unintegrated evidence status;
- proposed location and initial schema for the generic orchestration domain;
- a small first loop plan that preserves the build gate.
```

---

# 23. Compact mental model

When uncertain, return to this diagram:

```text
                 CANONICAL MEANING
                       │
                       ▼
                    Rulebook
                       │
                       ▼
              Effortless compiler
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
      Postgres      RuleSpeak    other projections
          │
          ▼
 semantic inspection, validation,
 orchestration, and evidence ledger
          │
          ▼
 compiled provider contract / advice
          │
          ▼
  native specialized runtime or solver
          │
          ▼
 candidate evidence
          │
          ▼
 independent verification
          │
          ▼
 accepted result + retained frontier
```

The rulebook should explain the solve.

The native provider should execute the computationally appropriate portion.

The evidence boundary should prevent a provider from promoting its own result without verification.

---

# 24. Final assessment

The durable result of the long conversation is not that a new general TSP solver has been proved.

It is that the project now has a credible architectural thesis:

> A canonical semantic model can expose reusable inference geometry, compile it through a mature toolchain into an executable semantic substrate, and potentially use that structure to orchestrate specialized external runtimes without making those runtimes canonical.

The current repository demonstrates the first half of that thesis through loop 710:

```text
rulebook
→ actual Effortless build
→ generated Postgres
→ independent conformance
→ finite structural TSP certificates
→ predicate-convergence experiment
→ held-out exact calibration
```

The next work must demonstrate the second half under stricter scientific controls:

```text
generic orchestration rulebook
→ real external benchmark registry
→ native provider adapters
→ same-solver paired comparisons
→ independent evidence acceptance
→ cross-domain predicate reuse
```

The project should now optimize for:

```text
coherence
reproducibility
attribution
external validity
honest failure
```

not for the raw number of loops or the most dramatic runtime claim.

---

# 25. Repository source map for this handoff

The principal source files used to reconstruct the current state are:

```text
rulebook-examples/effortless-math/CLAUDE.md
rulebook-examples/effortless-math/domains/traveling-salesman/CLAUDE.md
rulebook-examples/effortless-math/domains/traveling-salesman/README.md
rulebook-examples/effortless-math/domains/traveling-salesman/problem-contract.json
rulebook-examples/effortless-math/domains/traveling-salesman/effortless.json
rulebook-examples/effortless-math/domains/traveling-salesman/start.sh
rulebook-examples/effortless-math/domains/traveling-salesman/scripts/validate_rulebook.py
rulebook-examples/effortless-math/domains/traveling-salesman/scripts/reference_model.py
rulebook-examples/effortless-math/domains/traveling-salesman/testing/take-test.py
rulebook-examples/effortless-math/domains/traveling-salesman/testing/effortless-build-status.json
rulebook-examples/effortless-math/domains/traveling-salesman/testing/effortless-build-generation.log
rulebook-examples/effortless-math/domains/traveling-salesman/testing/effortless-build-postgres-load.log
rulebook-examples/effortless-math/domains/traveling-salesman/testing/effortless-build-conformance.log
.github/workflows/validate-tsp-domain.yml
.github/workflows/verify-tsp-effortless-build.yml
```

Relevant repository commits:

```text
cefcdc6090dbbf92419bcb32453b5e9ea666ab7a
  squashed TSP semantic research history

8ca99fa822022a81bf94761df8f10e61300f399c
  verified Effortless build and generated Postgres

f8500bafa1b57152bfe30720ed7a5d551523eb95
  current main cleanup after canonical build run
```

Relevant open work:

```text
PR #5
  evidence and claims beyond the canonical loop-710 boundary;
  audit before ingestion or merge
```
