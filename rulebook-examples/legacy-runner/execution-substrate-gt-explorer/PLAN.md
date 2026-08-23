# ERB × Glamorous Toolkit: Dual Halves of the Comprehension Problem

Classical model-driven engineering tried to unify software at both the specification
and the runtime, and collapsed under the weight. The Effortless Rulebook
(ERB — github.com/effortlessapi/effortless-rulebooks) and Glamorous Toolkit each
picked one half and made it coherent. ERB unifies at the **specification**: one
canonical IR (`rulebook.json`), eleven peer execution substrates, conformance graded
field-by-field against the Airtable oracle. GT unifies at the **runtime**: one
reflective object substrate with plural, cheap, disposable molded views over it.
They are duals, not competitors, and the pair closes a loop neither closes alone.

## SDLAF → GT: cheap transliteration

Lowering an ERB rulebook into GT is mechanical. Schema becomes Pharo classes. Data
becomes instances. Lookups, Aggregations, and Lambda Functions become methods. The
derivation DAG becomes the method-dependency graph. GT drops in alongside the
existing peers in `execution-substrates/` as `execution-substrates/gt/`, with a
matching `inject-into-gt.py` that emits an image and a `take-test.*` that writes
`test-answers/<entity>.json` in the same schema every other substrate produces. It
becomes the exploratory-debugger peer — the one substrate where you can mold
ad-hoc views over any node in the inference DAG for any record, mid-execution.
Output conformance grades it exactly like the others.

## GT → SDLAF: discovery to specification

The inverse direction is where the leverage lives. Lifting imperative code to a
declarative rulebook is generally hard, but GT's reflective substrate makes it
dramatically more tractable than any other starting point: ASTs, live referents,
and execution traces are all machine-readable. Every custom GT view is already an
implicit SDLAF fragment — it names fields, navigations, rollups, derivations. The
practical filter is "pure and DAG-shaped *and* intended as contract." The first is
mechanical; the second is the human judgment call at the center of ERB — most GT
views are disposable scaffolding and should stay that way, but the ones that
graduate arrive with execution traces, concrete data, and stated purpose that feed
conformance tests almost for free.

This makes GT and Airtable complementary authoring surfaces for the same IR:
Airtable for domains you already understand crisply enough to state the rules;
GT for domains you have to understand by inspecting their behavior. Discovery
surface plus authoring surface, both converging on `rulebook.json`.

## The witnessed-DAG upgrade

ERB today grades conformance at the output level: did substrate-X produce the
same flat values as the Airtable oracle? That's black-box. Two substrates can
match answer keys while reasoning entirely differently — bugs cancel silently on
small test sets. The existing `execution-substrates/explain-dag/` already defines
the stronger check (`erb.explain_instance.v1`: witnessed derivation DAGs per
record). The upgrade: **promote that schema from one substrate's artifact to the
common witness format every generator-bound substrate serializes to**.

Most substrates are already generator-bound. Python, Go, Postgres, XLSX, YAML,
CSV, OWL — their implementations are emitted by `inject-*.py` from the rulebook
template, which means the isomorphism of emitted artifact to template AST is a
generator invariant, not a runtime hope. The XLSX formula `=$D2 & " " & $E2` in
cell F2 is the same AST as the Go expression `stringVal(tc.FirstName) + " " +
stringVal(tc.LastName)` and the rulebook's `CONCAT(FirstName, " ", LastName)` —
the only variance across substrates is leaf-binding form (cell ref vs. struct
field vs. template variable), which is exactly the one thing the generator picks
per substrate. Let each `inject-*.py` stamp template-position labels into the
artifact it emits (sidecar mapping; Postgres witnessing columns; XLSX cell
labels; Go comments). Witnessing at test time becomes "read labeled storage."

This splits conformance into two cleanly-named tests:

**Generator-fidelity** conformance is structural, at rest: parse the emitted
artifact, diff its AST against the rulebook template node-for-node, fail on
mismatch — no data, no evaluation required. Catches `inject-into-xlsx.py`
accidentally lowering `CONCAT(A," ",B)` as `CONCAT(B," ",A)`, before a single
record is loaded.

**Engine-semantic** conformance is witnessed-value comparison at corresponding
template positions over real records. Catches Postgres's null semantics vs.
Excel's three-valued logic vs. Go's coercion defaults — the sneaky differences
that today's flat-output check only catches when they happen to not cancel on
the test set.

## GT as the native home for cross-substrate diffing

Once every substrate ships a witnessed DAG indexed by the same template positions,
cross-substrate diffing becomes a textbook moldable-views workload — and GT is
the obvious home for it. One pane per substrate's witnessed DAG for a given
record. Click any template node, see the N witnessed values side-by-side.
Auto-highlight disagreements. Drill from a Postgres node into instrumented SQL
and EXPLAIN plan; from a Go node into the generated function AST; from an XLSX
node into the cell formula and its dependency chain. Each substrate's derivation
becomes a first-class GT object; the cross-substrate diff is the mold that
composes them. That's the artifact the architecture of this repo has been
implying all along — currently scoped down to one substrate's
`test-explanations/*.jsonl`, waiting to be the cross-cutting format.

## Why the pairing works

ERB and GT correctly diagnosed the same underlying problem — software
comprehension — and independently built dual halves of the same solution. ERB
is cold, checked, reproducible; GT is hot, moldable, stateful. ERB banks
understanding in stateless rulebooks that survive any image; GT builds
understanding in a living image that no rulebook can reproduce. The image drift
that looks like a cost from ERB's vantage is actually the gradient that makes
the pairing load-bearing: you build understanding in GT's studio, and you bank
it in ERB's ledger.

Put together: Airtable and GT feed the IR from two directions (authoring and
discovery); `inject-*.py` lowers the IR into eleven-plus generator-bound
substrates; witnessed DAGs from each substrate grade generator-fidelity and
engine-semantic conformance independently; GT visualizes the full cross-substrate
derivation landscape as moldable views. Two projects, each solving the half of
classical MDE the other didn't, closing the loop on each other.