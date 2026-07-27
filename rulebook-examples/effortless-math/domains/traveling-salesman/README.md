# Traveling Salesman — Semantic Geometry Starter

**Status:** Research program  
**Version:** 0.3.1  
**Current finite claim:** Gridville's five-stop cycle is reconstructed from inferred structural edges with `CandidateUsedAsAntecedent=false`, uses zero branch decisions, and is optimal for its declared finite instance by a witnessed degree-two lower-bound equality. No general solver or complexity claim is made.

The canonical object is not a solver and not a route. It is an executable dependency graph describing the city, selected stops, canonical weighted edges, supplied and reconstructed route witnesses, typed frontier obligations, local inference certificates, finite optimality certificates, constraint closure, neighborhood boundary states, and residual search.

## Sixty-thousand-foot object

```text
City
└── Neighborhood
    └── Address
        └── InstanceStop
            ├── TravelEdge
            ├── TourStop / TourLeg
            ├── LocalDegreeBound
            │     └── IncidentDominanceCheck
            ├── EdgeState / EdgeSupport
            └── ClusterBoundaryState

TSPInstance
├── InstanceLowerBound
├── DerivedEdgeSet
│   ├── ConnectedDegreeTwoCertificate
│   └── RouteReconstruction
├── CandidateTour
│   └── OptimalityCertificate
├── ConstraintRound / ConstraintDecision
├── FrontierObligation
└── SearchCertificate
```

`InstanceStops` selects addresses into a particular problem instance. `TravelEdges` makes connectivity first-class. A supplied candidate route is represented by ordered `TourStops` and edge-bound `TourLegs`; reconstructed routes are projected independently from certified inferred edge sets.

## Vocabulary

The pieces still to close are generally **frontier obligations**, not imported edges.

| Term | Meaning |
|---|---|
| Imported dependency | An external provider conclusion consumed without internal derivation in this domain. |
| Frontier obligation | Any open semantic edge, typed as inference, certificate, substrate, generalization, or residual search. |
| Kernel assumption | Trusted primitive input semantics recorded at the declared trust boundary. |
| Residual search | Explicit ambiguity remaining after all represented deterministic obligations reach closure. |

The active imported-dependency count is **zero**. Generated Postgres is a commissioned `SUBSTRATE_OBLIGATION`; the mathematical route-reconstruction obligation is also closed.

## Loops 577–596

| Loops | Closure |
|---:|---|
| 577–581 | City hierarchy, weighted graph, supplied route witness, validity, and search baseline. |
| 582–586 | Typed frontier, global cycle coverage, pair completeness, degree-two lower bound, and finite Gridville optimality. |
| 587 | Generated Postgres commissioning, database initialization, and Python/Postgres conformance. |
| 588–591 | Inference application spine, inferred edge union, connected degree-two certificate, and route reconstruction. |
| 592 | Derived search certificate. |
| 593 | Non-tight twin-triangles counterexample. |
| 594–595 | Degree-two forcing and forbidden-edge propagation. |
| 596 | Neighborhood boundary-state contraction. |

Every loop from 587 through 596 was first recorded as `PLANNED` with its before-state and closure criterion, then updated in the same canonical row with its after-state and completion disposition.

## Negative certificates

The rulebook rejects the duplicate-stop route:

```text
A → B → C → B → E → A
```

because `B` is duplicated and `D` is omitted. It also rejects a candidate with five unique visits and five locally legal legs but a duplicated `A→B` transition and missing `E→A` closure. A count-preserving graph with duplicated `A-B` and omitted `B-C` is rejected by canonical pair multiplicity.

Twin triangles provides the stronger counterexample:

```text
certified degree-two lower bound = 6
feasible candidate cost          = 24
selected components              = 2
proper subtours                  = 2
optimality proved                = false
```

Thus a sound local lower bound is not silently upgraded into tightness, connectivity, reconstruction, or optimality.

## Degree-two lower-bound geometry

Every Hamiltonian cycle uses two incident edges at every stop. The witnessed two cheapest incident costs for Gridville are:

```text
A: 2 + 3 = 5
B: 2 + 3 = 5
C: 3 + 3 = 6
D: 3 + 3 = 6
E: 3 + 3 = 6
```

Their sum is `28`. Every tour edge is counted at both endpoints, so every tour costs at least `28 / 2 = 14`. The represented Gridville cycle costs `14`, proving finite-instance optimality.

## Route reconstruction and search accounting

The local-bound supports derive these five distinct edges without consuming a candidate route:

```text
A-B, B-C, C-D, D-E, E-A
```

The rulebook certifies degree two at every required stop, one connected component, a four-edge spanning tree, and zero proper subtours. Deterministic ordering from the depot reconstructs:

```text
A → B → C → D → E → A
CandidateUsedAsAntecedent=false
```

The derived route-discovery accounting is:

```text
initial symmetry-reduced route classes   12
surviving reconstructed route classes     1
route-class contraction               12 → 1
branch decisions                           0
backtracks                                 0
residual ambiguity                         0
```

This is a finite structural result, not a claim about the general complexity of TSP.

## Constraint closure and neighborhood contraction

A sparse fixture executes degree-two forcing and selects five ring edges with no branch decisions. The next closure round forbids one chord by degree saturation and one edge by proper-subtour prevention, each with an explicit reason code.

For each three-stop twin-triangle neighborhood:

```text
6 directed internal orders → 3 undirected boundary states
```

For the paired composition:

```text
36 raw combinations → 9 contracted combinations
36 → 9
```

The contraction certificate is scoped to the represented symmetric three-stop clusters.

## Run

From this directory:

```bash
./start.sh validate   # canonical rulebook + Python substrate
./start.sh all        # validate -> effortless build -> Postgres -> conformance -> show
```

The local database is `erb_traveling_salesman`, unless `TSP_DB` explicitly overrides it.

## Honest frontier

The nearest open obligations are stronger component/crossing lower bounds, general neighborhood-state soundness beyond symmetric three-stop clusters, and explicit branching only after deterministic closure leaves positive residual ambiguity.

---

## Local transpiler bus (`localhost:4242`)

> **All 13 local transpilers live on `localhost:4242`.** Once you run
> `./start.sh` from the repo root, the ssotme-proxy exposes every repo-local
> transpiler — `rulebook-to-postgres`, `rulebook-to-python`, `rulebook-to-golang`,
> `rulebook-to-cobol`, `rulebook-to-owl`, and more — as first-class `ssotme://`
> routes any `effortless build` can call.

## Loops 587–596 — inference geometry and contraction

The rulebook records every loop first as PLANNED with a before-state and closure criterion, then preserves the after-state in the same row. Gridville is reconstructed from inferred edges with zero branch decisions; twin triangles preserves a sound non-tight lower bound and yields the first finite neighborhood boundary-state contraction certificate.

**Postgres commissioning: CLOSED.** Attempts 1–9 remain explicit blocked or failed execution rows. Retry 10 installed the pinned EffortlessAPI/cli archive with npm, generated Postgres and RuleSpeak, initialized `erb_traveling_salesman`, passed the complete Python/Postgres conformance surface, normalized PostgreSQL NUMERIC text through `Decimal`, and durably sealed the canonical certificate. Generated artifact hashes and all available failure/success transcripts are retained.


## Loops 597–610 — predicate convergence

The user prediction was recorded before execution: recurring TSP concepts would begin to collapse, while useful new terms would continue to be coined. This remains an empirical working prediction, not a theorem.

The experiment began with **32 recurring surface predicates** and derived an eight-predicate basis:

```text
MEMBERSHIP   INCIDENCE   CARDINALITY   ORDER
WEIGHT       COMMITMENT  CONNECTIVITY  PROVENANCE
```

```text
32 surface predicates → 8 primitives
semantic compression  = 75%
new primitives after loop 598 = 0
physical tables        = 45
```

The physical rulebook grew by five generic tables so that the old projections remain replayable. The active semantic basis did not grow after it was identified.

| Loop | Coined predicate | Reduction |
|---:|---|---|
| 597 | Convergence Prediction | Makes the prediction and baseline executable data. |
| 598 | Predicate Basis | Maps 32 surface names to eight primitives. |
| 599 | Commitment Lattice | Unifies selected, forced, forbidden, unknown, and superseded edge states. |
| 600 | Incidence Budget | Unifies degree checks, degree bounds, and degree forcing. |
| 601 | Defect Vector | Unifies incidence, connectivity, boundary, and cost gaps. |
| 602 | Cut Parity | Derives a positive even crossing demand. |
| 603 | Component Repair Bound | Composes local degree and global component repair costs. |
| 604 | Bound Sandwich | Collapses lower bound, upper witness, and equality rigidity. |
| 605 | Witness Normal Form | Makes supplied versus reconstructed a provenance distinction. |
| 606 | Boundary Signature | Makes cluster paths instances of the witness normal form. |
| 607 | Semantic Quotient | Explains 6→3 and 36→9 through an explicit equivalence relation. |
| 608 | Component Quotient | Unifies neighborhoods and graph components as boundary objects. |
| 609 | Closure Event | Unifies applications, rounds, supports, antecedents, and decisions. |
| 610 | Convergence Event | Certifies basis stability and records the residual kernel. |

Twin triangles now has a composed optimality proof:

```text
degree-two base                         6
mandatory crossings       2 × 10      +20
released internal edges   2 ×  1       -2
component-repair lower bound            24
feasible Hamiltonian cycle              24
------------------------------------------
finite-instance optimum                 24
```

The original degree-only lower bound of 6 remains preserved as a non-tight counterexample. The stronger conclusion comes from composing cut parity with a witnessed repair cost.

**Convergence status:** early empirical support for this represented TSP domain. It is not a universal theorem about mathematical vocabularies or computational complexity.


## Loops 611–623 — atoms, operators, and asymmetric fibers

The loop-610 eight-predicate basis was retained as a historical certificate and factored again. The current candidate basis is:

```text
ATOMS:      ATTACHMENT   VALUATION   WARRANT
OPERATORS:  CLOSURE      AGGREGATE   QUOTIENT   FIXPOINT
```

This is **90.63% surface-to-atom compression** from the original 32 recurring surface predicates. It remains empirical for the represented TSP domain, not a theorem of universal minimality.

The asymmetric four-stop stress fixture separates two reductions that were conflated by the three-stop triangles:

```text
24 directed Hamiltonian paths
        ↓ path-reversal quotient
12 unordered-boundary path classes
        ↓ minimum valuation within each boundary fiber
 6 surviving port-to-port states
```

No new physical table is introduced by loops 611–623. Historical projections remain replayable while the active semantic basis shrinks.


**Boundary Fiber.** The asymmetric stress fixture groups equal-port, equal-coverage paths into boundary fibers before minimum valuation selects the surviving representative.

**Coherence guardrail.** Convergence is not defined as monotonically decreasing tables, rows, or named predicates. Internalizing one opaque black box may temporarily expand the explicit DAG. The represented trend is toward greater reuse, clearer warrants, smaller opaque trust boundaries, and less residual ambiguity—not toward superficial brevity.


## Loops 624–646 — coherence convergence

This pass records the stronger prediction that convergence is movement toward coherent reusable geometry, **not** monotone shrinkage of tables, rows, or names.  Internalizing an opaque node may expand the explicit DAG while reducing semantic basis size and trust opacity.

### One typed arc and one warranted rewrite

```text
ATTACHMENT   VALUATION   WARRANT
      ↓ typed recoverable signatures
SEMANTIC_ARC(subject, label, target)

CLOSURE   FIXPOINT   AGGREGATE   QUOTIENT
      ↓ saturation / fiber-reduction modes
WARRANTED_REWRITE(input, rule, polarity, output, warrant)
```

Every registered historical and derived concept retains a typed recoverability expression.  The current represented basis is therefore:

```text
active relational atoms     1  (Semantic Arc)
active semantic operators   1  (Warranted Rewrite)
physical rulebook tables   45  (unchanged)
surface-to-atom reduction 96.88%
```

This is empirical coverage for the represented TSP domain.  It is not a theorem of minimality or universality.

### Three-region repair

Three cost-one local triangles produce a disconnected degree-two structure:

```text
local degree-two base                       9
quotient boundary demand      3 crossings
minimum crossing insertion     3 × 10     +30
necessary internal releases    3 ×  1      -3
------------------------------------------------
three-region repair lower bound              36
balanced-exchange cycle                      36
finite-instance optimum                      36
```

The **Boundary Handshake** derives three crossing edges from three quotient nodes of required boundary degree two.  A **Balanced Edge Exchange** adds three crossings and releases one internal edge per region while preserving degree two and connecting all nine stops.

### Optimal value versus optimal choice

The four-stop **Optimal Face** contains three symmetry-reduced Hamiltonian classes:

```text
A-B-C-D-A   cost 4   optimal
A-C-B-D-A   cost 4   optimal
A-B-D-C-A   cost 6   nonoptimal control
```

The optimum value four is certified, but the two optimal witnesses form a **Choice Orbit** of size two.  The **Branch Warrant** rejects mathematical branching for value proof; choosing one representative is conditional on an external tie-break policy.

**Coherence status:** one active arc, one active rewrite, unchanged physical table count, substantially more explicit witness machinery, three-region finite optimality at 36, optimal-face value 4, choice-orbit size 2, and zero mathematical branch decisions for value proof.


## Loops 647–710 — frozen-basis exact calibration

The semantic basis was frozen at loop 646:

```text
SEMANTIC_ARC(subject, label, target)
WARRANTED_REWRITE(input, rule, polarity, output, warrant)
```

Twelve deterministic held-out instances were fixed before exact analysis.  A depot-fixed, reversal-quotient oracle enumerated every feasible route class for instances through nine stops.  Oracle values are calibration evidence; they do not silently upgrade a structural proof status.

The campaign records separate coordinates for exactness gap, closure yield, value rigidity, choice entropy, defect support, repair potential, boundary demand, port compatibility, quotient width, residual kernel, branch necessity, and class/value/choice compression.

Local representational growth remains allowed when it replaces opacity.  The measured convergence target is a stable reusable basis, explicit warrants, exact recoverability, and a smaller typed residual kernel—not monotonically fewer rows.


## Loops 713–812 — TSPLIB search and cut ladder

A preregistered ten-instance external ladder compares constructive witnesses, exact MST-envelope path-state search, scaled-integer Held–Karp one-tree bounds, degree LPs, separated subtour cuts, and witnessed simple 2-matching comb cuts. The campaign closes value on **9 / 10** instances, proves **6 / 10** with the basic path-state engine under caps, and adds **zero** active semantic terms. Numerical LP certificates remain explicitly inside the SciPy/HiGHS trust boundary. See `testing/campaign-713-812/aggregate.json`.
