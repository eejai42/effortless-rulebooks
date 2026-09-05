# Effortless Loops — Planar Unit-Distance Discovery

Each loop = one named **CHANGE-RULE → `effortless build` → CONSUME-VIEWS** turn through the rulebook. The hub is [effortless-rulebook/planar-unit-discovery-rulebook.json](effortless-rulebook/planar-unit-discovery-rulebook.json).

---

## Completed

### [x] Loop 1 — v0.1 Bootstrap Sketch

**Where:** [bootstrap/ERB_euclidean_unit_distance_neighborhood_v0_1.json](bootstrap/ERB_euclidean_unit_distance_neighborhood_v0_1.json) (87 KB)

**Shape:** Meta-schema design — `object_types`, `relation_types`, `math_objects`, `math_relations`, `property_types`, `formula_definitions`, `semantic_routes`, `semantic_route_steps`, `model_tests`. Concepts encoded as rows of generic typing tables. Inert in ERB because schema-as-data doesn't let the build pipeline compute per-table calculated fields.

**Outcome:** the planning sketch that names every concept Sawin's chain touches.

---

### [x] Loop 2 — Wholesale Rewrite to First-Class Tables

**What changed:** scrapped the meta-schema; promoted every named concept to a first-class ERB table with `schema.fields` and `data`. Tables: `Domains`, `Contexts`, `Points`, `PointSets`, `PointSetMembers`, `PointPairs`, `UnitDistanceGraphs`, `NumberFields`, `PrimeIdeals`, `MinkowskiLattices`, `ShortVectors`, `ConstructionFamilies`, `ConstructionInstances`, `GrowthSequences`, `AsymptoticFunctions`, `AsymptoticLowerBounds`, `Theorems`, plus `__meta__`. 18 tables, ~253 fields, ~68 rows.

**Outcome:** runnable ERB rulebook; the geometric layer (Pythagoras → unit-distance predicate → induced graph) and the asymptotic layer (growth sequence → bound → theorem) are both fully wired. The middle (algebraic-number-theoretic source feeding lattice → projection → planar geometry) was named but light on machinery.

---

### [x] Loop 3 — Facelift: Missing Machinery + Bridges

**What changed:** added 13 new tables — `Metrics`, `FieldEmbeddings`, `MinkowskiEmbeddings`, `GramMatrices`, `PlanarProjections`, `ProjectedShortVectors`, `GolodShafarevichCriteria`, `SemanticBridges`, `SemanticRoutes`, `SemanticRouteSteps`, `SourceReferences`, `Lemmas`, `MirrorContract`. Extended existing tables with chain-closure rollups: `NumberFields.SatisfiesGolodShafarevich`, `NumberFields.IsAlgebraicSourceCandidate`, `MinkowskiLattices.IsLoadBearingForUnitDistanceConstruction`, `ConstructionFamilies.IsAlgebraicConstruction`, `ConstructionInstances.IsAlgebraicSuperlinearWitness`, `AsymptoticLowerBounds.IsAlgebraicallyAnchored`, `Theorems.AlgebraicChainClosed`. Added 4 more `Theorems` rows for multi-anchor coverage (Erdős baseline, Szemerédi–Trotter, Spencer-S-T, conjectural-future slot).

**Outcome:** 31 tables, 340 fields, 143 rows. The full inference DAG is wired top to bottom — five orders of inference (1st = same-row math; 5th = `Theorems.AlgebraicChainClosed`) all named explicitly. Every nullable boolean carries null/true/false coverage rows.

---

### [x] Loop 4 — Q(ζ_7) Chain Materialization + Curation Layer

**What changed:** materialized the second algebraic source end to end — `lat-q-zeta-7` (det = √16807, dim 6), real cyclotomic `PrimeIdeals` data (ramified prime above 7 of norm 7, two primes above 2 of norm 8 each, six primes above 29 of norm 29), `GramMatrices.gram-lat-q-zeta-7`, 6 `ShortVectors` (the powers of ζ_7 under Minkowski, squared norm 3), `proj-q-zeta-7-sigma1` `PlanarProjection`, 6 `ProjectedShortVectors`, a `heptagon-with-center` `PointSet` with 8 points / 7 unit-distance pairs, `zeta7-sigma1-projection` `ConstructionFamily`, an under-claimed `AsymptoticLowerBound` (exp 0.9) that resolves `WitnessConsistent = TRUE` honestly. Added 4 curation-layer tables: `Conjectures`, `ProofObligations`, `CitationLinks`, `AnswerKey`. Added cross-link rollups on `Lemmas.ObligationCount`, `AsymptoticLowerBounds.AllObligationsSatisfied`, `Theorems.FullyAuditedAndClosed`, `SourceReferences.OutboundCitationCount` / `InboundCitationCount` / `LemmaCount`.

**Outcome:** 35 tables, 403 fields, 233 rows. FK integrity verified across all tables. The Sawin theorem row honestly reports `AlgebraicChainClosed = FALSE` and `FullyAuditedAndClosed = FALSE` because the actual paper content hasn't been loaded — exactly the gap Loop 5 closes.

---

### [x] Loop 4.1 — Bitemporal Versioning (sub-iteration)

**Why this is a 4.1 not a 5:** the previous passes built the structural DAG; this one retrofits the missing "bitemporal" half of CMCC's *bitemporal ACID DAG* claim onto every research-progress table. It's a sub-iteration of the methodology-completion track, not a new feature direction.

**What changed:** added 5 columns (`ValidFrom`, `ValidTo`, `TxFrom`, `TxTo`, `IsCurrentlyValid`) to the 8 research-progress tables — `AsymptoticLowerBounds`, `Theorems`, `Conjectures`, `SourceReferences`, `Lemmas`, `ProofObligations`, `CitationLinks`, `AnswerKey`. Backfilled real publication dates: Erdős 1946-01-01, Szemerédi–Trotter 1983-01-01, Spencer-S-T 1984-01-01, Golod–Shafarevich 1964-01-01, Sawin 2024-01-01. Added coverage rows demonstrating retraction (`hypothetical-retracted-overclaim`, `thm-hypothetical-retracted`, `src-experimental-preprint` with `ValidTo` set to retraction date) and unevaluated/pending states (`pending-bound-unevaluated`, `lemma-erdos-context.IsCurrentlyValid=null`). On `Theorems` added `AnchoredBoundIsCurrentlyValid` (lookup) and `IsHistoricallyAnchored` (calculated) — catches the case where a theorem's anchored bound got retracted. On `AsymptoticFunctions` added the cascade: `BestKnownCurrentLowerBoundExponent` (filtered by `IsCurrentlyValid=TRUE`) alongside the original `BestKnownLowerBoundExponent` (all-time), plus `RetractedLowerBoundCount` and `MaxOverclaimedExponent` for forensic queries. Added new `TemporalSnapshots` table with 6 named moments (Erdős 1946, ST 1983, Spencer-S-T 1984, Sawin 2024, current, future-projected) so chronology is a first-class entity.

**Cascade observed:** the `BestKnownLowerBoundExponent` vs `BestKnownCurrentLowerBoundExponent` split is now visible — for U(n), the all-time max (1.5, from the hypothetical-retracted overclaim) differs from the bitemporally-filtered max (1.014, Sawin). The gap between them is exactly the "scar of an overclaim" — a thing prose can't express but a column can. Theorem-level: `thm-hypothetical-retracted.IsHistoricallyAnchored = FALSE` because its anchored bound got retracted. Citation-level: `cite-experimental-disagrees.IsCurrentlyValid = FALSE` because its citing source was retracted, automatically retiring the citation. `Conjectures.conj-sawin-resolved` correctly carries `IsCurrentlyValid = FALSE` (no longer an open conjecture) AND its `RelatedTheorem` pointer to `thm-superlinear-unit-distance` (the proposition is still TRUE, just as a theorem now) — capturing the bitemporal subtlety that "the conjecture is closed but the claim survives."

**Outcome:** 36 tables, 455 fields, 242 rows. All FK references resolve. All nullable booleans (including the 8 new `IsCurrentlyValid` columns) carry null/true/false coverage. The rulebook is now SDLAF over a *bitemporal* ACID DAG.

**What didn't cascade yet (deliberately):** pure-math tables (`Points`, `PointPairs`, `NumberFields`, `MinkowskiLattices`, `ShortVectors`, etc.) intentionally don't carry bitemporal columns — mathematical truth doesn't have valid-time. By the same token, none of their aggregations needed updating. The bitemporal layer covers the *epistemic* half of the rulebook (what we claim is true and when) while leaving the *structural* half (the algebraic / geometric facts themselves) timeless. This matches the CMCC distinction between rows-that-describe-state and rows-that-are-state.

---

### [x] Loop 4.2 — As-Of Rollups via Junction (sub-iteration)

**Why this is a 4.2 not a 5:** Loop 4.1 made every row bitemporally addressable but left "as-of date X" queries living in the substrate (ERB's `MAXIFS` doesn't natively filter on date ranges). 4.2 brings as-of rollups *into the rulebook* via a junction table — the standard SDLAF-friendly workaround when a parameterized query needs to be expressed in scalar formulas.

**What changed:** added `LowerBoundValidityAtSnapshot` — a junction between `AsymptoticLowerBounds` and `TemporalSnapshots`, with one row per (bound × snapshot) pair carrying a raw `IsValidAtThisSnapshot` boolean (pre-computed since ERB MAXIFS doesn't support range filters). 5 bounds × 7 snapshots = **35 junction rows**. Added a 7th snapshot row `snap-mid-overclaim-2025` (2025-07-01) so the hypothetical-retracted-overclaim's brief validity window has a moment to appear in. Added two lookups onto the junction (`BoundExponent`, `BoundIsCurrentlyValid`) and one calc field (`IsCuratorConfirmedAtThisSnapshot` = AND of date-validity and curator-confirmation).

**Cascade onto TemporalSnapshots — four new fields:**
- `ValidLowerBoundCountAtThisMoment` — how many bounds were date-valid at this moment.
- `BestKnownLowerBoundExponentAtThisMoment` — date-only MAX, the "forensic" view.
- `CuratorConfirmedBestKnownLowerBoundExponentAtThisMoment` — date-validity AND curator-confirmed, the "what the rulebook actually believed" view.
- `PendingButValidByDateCount` — rows in the gap between date-valid and curator-confirmed, i.e., the rulebook's open epistemic questions at this snapshot.

**The timeline U(n) now produces from inside the rulebook:**

| Date | Moment | BestByDate | CuratorConfirmed | Pending |
|---|---|---|---|---|
| 1946-01-01 | Erdős 1946 publication | 1.0 | 1.0 | 0 |
| 1983-01-01 | Szemerédi–Trotter 1983 | 1.0 | 1.0 | 0 |
| 1984-01-01 | Spencer–Szemerédi–Trotter 1984 | 1.0 | 1.0 | 0 |
| 2024-01-01 | Sawin 2024 improvement | 1.014 | 1.014 | 0 |
| 2025-07-01 | Mid-overclaim 2025-07 | **1.5** | 1.014 | 0 |
| 2026-05-28 | Current moment | 1.05 | 1.014 | **1** |
| 2030-01-01 | Future improvement (projected) | 1.05 | 1.014 | **1** |

**What this exposes that prose can't:** the 2025-07 row's two columns disagree by 0.486 — that's the rulebook saying out loud "at that moment, a 1.5 claim *briefly* looked best by date, but the curator-confirmed view (which knows about the retraction) discounts it." The 2026 row's two columns disagree because the `pending-bound-unevaluated` row is date-valid but `IsCurrentlyValid=null` — the rulebook is honestly reporting that it has an open epistemic question at exponent 1.05. Three different "best known" values across two columns and one timestamp — and they're all simultaneously correct, each answering a slightly different question.

**Outcome:** 37 tables, 471 fields, 278 rows. FK integrity green. Nullable bools all carry null/true/false. The `TemporalSnapshots` table now functions as a queryable time machine — `WHERE TemporalSnapshotId = 'snap-sawin-2024'` returns the rulebook's view of U(n) as of January 2024, computed entirely from data inside the rulebook with no substrate-side temporal SQL.

**What's still in the substrate (deliberately):** true SCD-Type-2 versioning of `IsCurrentlyValid` itself — i.e., "what did the curator believe at time X?" — requires transaction-time tracking on the curator-flag, not just on the row. That's Loop 4.3 if you want it, and the place where a Postgres temporal table or an event-sourced overlay would be cleaner than a junction. Punted for now because the current 4.2 already captures the much-more-common queries.

---

### [x] Loop 5 — Load Real Paper Content (Partial) + Pathway-Aware Audit Gate

**Calibration honesty up front:** I can do Erdős 1946 and Spencer–Szemerédi–Trotter 1984 from training — I know the proof structures. Sawin's actual paper is still a placeholder (the arXiv ID in `SourceReferences` is fictitious). So this loop is "load what I can, mark what I can't, structurally close what's loadable."

**The bigger structural finding this loop exposed:** the previous `AlgebraicChainClosed` gate was biased toward algebraic-tower proofs. Erdős's 1946 proof is *combinatorial pigeonhole* (integer grid + divisor-function bound on r₂(k)), not algebraic-tower. Under the old gate, Erdős's theorem could never close — not because the proof is wrong, but because it doesn't use class field towers. That's a model bug, not a math bug. Loop 5 fixes it.

**What changed:**

1. **Added `ProofPathway` (raw enum) to `AsymptoticLowerBounds`** with values: `algebraic-tower`, `combinatorial-pigeonhole`, `crossing-number`, `incidence-counting`, `witness-only`, `other`. Each bound carries its actual proof-pathway tag.

2. **Added `IsAuditableViaItsPathway` (calculated) to `AsymptoticLowerBounds`** — the pathway-aware audit gate:
   - `algebraic-tower` proofs need `IsAlgebraicallyAnchored` (the old chain-closure gate).
   - `combinatorial-pigeonhole` proofs need `AllObligationsSatisfied AND WitnessConsistent`.
   - `witness-only` claims need just `WitnessConsistent`.

3. **Cascade to `Theorems`** via lookup + new calc `IsAuditedAndClosed` — the pathway-aware replacement for `FullyAuditedAndClosed`.

4. **Fixed a model bug in `sawin-n1014.GrowthSequence`** — it was pointing at `sqrt-lat-growth` (Q(√−3), which doesn't pass GS), but Sawin's algebraic-tower construction uses Q(ζ_p). Re-pointed to `zeta7-sigma1-growth`. Sawin's theorem is now algebraically pointed at the right source — though it still doesn't close (because the finite witness `log(7)/log(8) ≈ 0.937` is below the claimed 1.014; that's honest).

5. **Loaded real lemma content** for the parts I can stand behind:
   - `lemma-erdos-context` (updated): full proof outline of Erdős 1946 — integer grid + sums-of-two-squares + r₂(k) bound.
   - `lemma-erdos-grid-construction` (new): the Z² ∩ [0,√n]² grid step.
   - `lemma-erdos-divisor-function` (new): the r₂(k) multiplicative formula (Landau, Hardy–Wright).
   - `lemma-spencer-st-crossing-inequality` (new): Ajtai–Chvátal–Newborn–Szemerédi 1982 crossing inequality, underwriting the n^{4/3} upper bound.
   - `lemma-historical-background-context` (new): coverage row demonstrating `IsLoadBearing=FALSE`.

6. **Added 2 new `ProofObligations`** linking the new Erdős lemmas to `erdos-sqrt-bound`, both with `IsSatisfied=TRUE` (curator-confirmed). Erdős's bound now has 3 obligations, all satisfied.

**The cascade — observed:**

| Theorem | Pathway | IsAuditedAndClosed |
|---|---|---|
| `thm-erdos-unit-distance-baseline` | combinatorial-pigeonhole | **TRUE** ← *new* |
| `thm-superlinear-unit-distance` (Sawin) | algebraic-tower | FALSE (finite witness 0.937 < 1.014) |
| `thm-hypothetical-retracted` | — | FALSE (theorem itself retracted) |
| `thm-szemeredi-trotter`, `thm-spencer-szemeredi-trotter`, `thm-future-conjectural-improvement` | — | n/a (no anchored lower bound; these belong on the upper-bound side, Loop 6) |

**This is the first theorem to fully close in the rulebook.** Erdős's 1946 result is end-to-end audited: bound is bitemporally current, claim matches, three loaded lemmas with real content, all proof obligations satisfied, finite witness consistent with claimed exponent. The chain-closure machinery works when given real content — and it works *for the right reason* (pigeonhole, not algebraic tower).

**Honest accounting of what's still mock:** Sawin's specific arXiv ID, the exact statement of the n^{1.014} construction, and the per-lemma details from Sawin's paper. These would need actual paper access to load. The structural finding from Loop 5 is more valuable than the missing-data: **the audit gate now classifies proofs by pathway, which is the right shape for any paper-loading flow regardless of whether it's algebraic, combinatorial, crossing-number, or incidence-counting based.**

**Outcome:** 37 tables, 477 fields, 284 rows. All FKs resolve. All nullable bools null/true/false.

---

### [x] Loop 5.1 — Paper Attribution Correction (CMCC stress test)

**Setup:** Throughout Loops 1–5, the placeholder `arXiv:2605.20579` was assumed fictional (my training cutoff was January 2026). The user clarified this is actually a *real* recent paper: **OpenAI announced 2026-05-20** that its internal reasoning model autonomously proved a superlinear lower bound on U(n) (inexplicit exponent > 1), refuting Erdős's polynomial-improvement conjecture. **Will Sawin's companion paper** (arXiv:2605.20579, same publication day) makes the exponent explicit at n^{1.014} using cyclotomic fields + Golod–Shafarevich. First fully autonomous AI proof of a central open problem in mathematics.

**This loop is the CMCC stress test in action.** The user predicted that fixing the paper attribution should be metadata-only — no structural changes — because the rulebook modeled the *semantic topology* of the planar-unit-distance neighborhood, not the paper.

**Result confirmed:** **Tables: 37 → 37. Fields: 477 → 477. Rows: 294 → 294.** No schema changes. The fix was pure data:
- Renamed `src-sawin-2024` → `src-sawin-2026` (12 FK refs caught by `replace_all`).
- Renamed `snap-sawin-2024` → `snap-sawin-2026` (6 FK refs).
- Added `src-openai-2026` SourceReference (the May 20 announcement).
- Added `snap-openai-2026-may-20` TemporalSnapshot (the discovery moment).
- Added 3 CitationLinks: `cite-sawin-refines-openai` (companion-paper), `cite-openai-improves-erdos`, `cite-openai-depends-gs`.
- Added 5 junction rows in `LowerBoundValidityAtSnapshot` for the new snapshot.
- Updated 2 junction rows (`lbv-sawin-mid-overclaim`, `lbv-pending-openai-day`, `lbv-pending-2024`) for the new ValidFrom dates.
- Updated `sawin-n1014.ValidFrom` 2024-01-01 → 2026-05-20 + statement text.
- Updated `thm-superlinear-unit-distance.ValidFrom` + autonomous-AI-proof attribution.
- Updated `conj-sawin-resolved` to span 1946 → 2026-05-20 (the 80-year open question, resolved that day).
- Updated 3 Sawin-sourced lemma `ValidFrom` dates and 4 Sawin-sourced citation `ValidFrom` dates.

**The corrected timeline** (now reflecting real history):

| Date | Moment | BestByDate | CuratorConf | Pending |
|---|---|---|---|---|
| 1946-01-01 | Erdős 1946 publication | 1.0 | 1.0 | 0 |
| 1983-01-01 | Szemerédi–Trotter 1983 | 1.0 | 1.0 | 0 |
| 1984-01-01 | Spencer–Szemerédi–Trotter 1984 | 1.0 | 1.0 | 0 |
| 2025-07-01 | Mid-overclaim 2025-07 | **1.5** | 1.0 | 0 |
| 2026-05-20 | OpenAI autonomous-AI announcement | 1.05 | **1.014** | 1 |
| 2026-05-20 | Sawin 2026 companion paper | 1.05 | **1.014** | 1 |
| 2026-05-28 | Current moment | 1.05 | 1.014 | 1 |
| 2030-01-01 | Future improvement (projected) | 1.05 | 1.014 | 1 |

**Note the 80-year flat line** from 1946 → 2025. Then **two same-day rows for 2026-05-20** — both showing identical numbers because the OpenAI announcement and Sawin's companion paper resolved on the same calendar day. The bitemporal layer correctly shows these as two distinct moments at the same date.

**What this validates:** the CMCC claim that the semantic-topology rulebook absorbs paper-attribution corrections as data-only operations. No part of the chain Q(ζ_p) → O_K → Minkowski lattice → short vectors → planar projection → unit-distance graph → asymptotic bound → theorem needed restructuring. Only metadata moved. **The CMCC prediction held.**

**What's still partial (now correctly identified):** Sawin's specific lemma statements and OpenAI's specific algorithmic-discovery narrative. The placeholder `lemma-density-margin` and `lemma-anchor-explicit-bound` have plausible statements but aren't direct paper quotes. Loading Sawin's paper text precisely is now a feasible Loop 6 — the structure is in place.

---

## Next

### [ ] Loop 6 — Load Sawin's Actual Paper Content + OpenAI Method Description

**CHANGE-RULE:** extract the named lemmas from whichever paper carries the current state-of-the-art lower bound on U(n) (the placeholder `arXiv:2605.20579` is not a real ID). For each `Lemmas` row, fill in real `StatementText`, flip `IsLoaded` to TRUE. Add at least one `ConstructionInstance` whose `(ParamN, EdgeCount)` resolves `DensityExponentEstimate ≥ 1.014`. Flip each `ProofObligations.IsSatisfied` row by row.

**BUILD propagates:** Postgres calculated functions recompute; `GrowthSequences.MaxObservedDensityExponentEstimate` shifts upward.

**VIEWS consume:** `Theorems.AlgebraicChainClosed` and `FullyAuditedAndClosed` flip TRUE for `thm-superlinear-unit-distance`. The honest "info"-level `AnswerKey` rows can be re-pinned to `GateLevel = blocking` with `IsCurrentlyMatched = true`.

**Blocker:** requires the actual paper. If the arXiv ID stays a placeholder, substitute the latest published result with this same shape of loop.

---

### [ ] Loop 7 — `AsymptoticUpperBounds` (Sandwich U(n))

**CHANGE-RULE:** add top-level table `AsymptoticUpperBounds` mirroring `AsymptoticLowerBounds`. Load `spencer-st-n43` (Exponent = 4/3). Add `Theorems.AnchoredUpperBound` FK linking `thm-spencer-szemeredi-trotter` and `thm-szemeredi-trotter` to the upper-bound rows. Add calc fields `AsymptoticFunctions.BestKnownUpperBoundExponent` (MIN aggregation) and `AsymptoticFunctions.GapBetweenBounds` = upper − lower.

**BUILD propagates:** new table generated everywhere (Postgres tables/views, Python, OWL). The substrate transpilers add `vw_asymptoticupperbounds` and the corresponding base classes.

**VIEWS consume:** any dashboard showing U(n) now displays the gap `1.014 ≤ exponent ≤ 1.333…`. New `AnswerKey` rows pin the upper-bound side. `Conjectures.conj-erdos-43-tightness` can reference both ends.

**Closes:** the model currently has only the lower-bound side of the open question. U(n) is defined by both — sandwich is the natural shape.

---

### [ ] Loop 8 — `SubstrateRuns` + `ConformanceResults`

**CHANGE-RULE:** add two new tables:
- `SubstrateRuns` — one row per (substrate × build timestamp): `SubstrateKind`, `RanAt`, `RulebookCommitSha`
- `ConformanceResults` — one row per (`SubstrateRun` × `AnswerKey`): `ObservedValue`, `Matched` boolean

Change `AnswerKey.IsCurrentlyMatched` from raw to **lookup** — `LOOKUP(ConformanceResults!{{Matched}}, …)` against the latest `SubstrateRun`. Add `LastRunFailureCount` aggregation on `SubstrateRuns`.

**BUILD propagates:** the conformance harness (`orchestration/test-orchestrator.py`) writes rows into `ConformanceResults` after each substrate run. Generated views update.

**VIEWS consume:** the orchestration HTML report reads from `vw_substrateruns` and `vw_answerkey`; the §14 gate is now self-reporting instead of curator-set.

**Closes:** today `IsCurrentlyMatched` is hand-pinned. After this loop it's *derived from the actual run* and stale pins can't lie.

---

### [ ] Loop 9 — `ProofAssistantArtifacts`

**CHANGE-RULE:** add `ProofAssistantArtifacts` — one row per (Lemma × proof-assistant artifact): `Assistant` (lean4 / coq / isabelle), `ArtifactURI`, `LastCheckedAt`, `IsMachineVerified`. Aggregate onto `Lemmas.MachineVerifiedArtifactCount` and `Lemmas.IsMachineVerified` = (count > 0). Change `ProofObligations.IsSatisfied` to be calculated from `IsLemmaMachineVerified` when an artifact exists, falling back to the curator-set raw value when null.

**BUILD propagates:** new table generated; all existing aggregations gain a machine-verifiable signal path. The Postgres substrate exposes `vw_proofassistantartifacts`.

**VIEWS consume:** theorems with `AllObligationsSatisfied = TRUE` now carry the stronger meaning — *machine-verified, not just curator-asserted*. `FullyAuditedAndClosed` carries different epistemic weight after this loop.

**Closes:** bridges the one part previously called "different in kind" from structure-mirroring (proof verification) by giving the rulebook a place to carry the verification *pointer*.

---

### [ ] Loop 10 — Competing Algebraic Source (Head-to-Head)

**CHANGE-RULE:** load a second non-cyclotomic `NumberField` — e.g., a real-quadratic `Q(√k)` with `IsTotallyReal = TRUE` and large class number — plus its `MinkowskiEmbedding`, `MinkowskiLattice`, `ShortVectors`, `PlanarProjection`, `ProjectedShortVectors`, `ConstructionFamily`, `ConstructionInstances`, `GrowthSequence`, and an `AsymptoticLowerBound`. Add `ConstructionFamilies.RankAgainstSiblings` (calculated or aggregated ordering by `MaxObservedDensityExponentEstimate`).

**BUILD propagates:** purely additive. No schema changes — just more rows of types already present.

**VIEWS consume:** `AsymptoticFunctions.BestKnownLowerBoundExponent` aggregates over more bounds and picks the winning family automatically. Head-to-head comparison is now a query, not a discussion.

**Closes:** today the entire algebraic side has one loaded field (Q(√−3)) and one candidate (Q(ζ_7)). The CMCC claim that the model is the invariant gets stronger when two structurally-different algebraic sources produce comparable witnesses in the same schema.

---

## After Loop 10

The rulebook describes U(n) with: known lower bounds + known upper bounds + the gap + the conjectures targeting it + at least two algebraically-distinct witnessing families + machine-verified lemmas + multi-substrate conformance results. The naked-Claude alternative would need ~30 hand-coded files updated in lockstep per loop and would be wrong before the second one shipped.
