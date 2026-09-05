# 📘 Planar Unit-Distance Discovery — RuleSpeak®

_A CMCC semantic mirror of the planar unit-distance theorem neighborhood. Every mathematical object that participates in the chain from Q to U(n) is promoted to its OWN first-class table, and every intermediate quantity (distance squared, edge count, density exponent, witness-consistency check, bound exponent, anchor match) is a first-class calculated/lookup/aggregation field on the entity to which it belongs. Nothing is hidden in a property bag, an expression tree, or a generic relation row. The Pythagorean test: if a mathematician would name it, it has its own column._

> Declarative business rules rendered from the rulebook. Every statement
> below expresses truth in the business domain — it is neither a procedure
> nor an imperative. The rulebook's formulas are the single source of truth;
> this document is their plain-language reading.

## 1 Business Vocabulary

| Term | Description | Narrative Comment |
|------|-------------|-------------------|
| **Domain** | A domain is identified by its name. | — |
| Name | Computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | — |
| Display Name | A defined attribute. | — |
| Role in Model | A defined attribute. | — |
| Description | A defined attribute. | — |
| **Context** | A context is identified by its name. | — |
| Name | Computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | — |
| Display Name | A defined attribute. | — |
| Kind | A defined attribute. | — |
| Assumptions JSON | A defined attribute. | — |
| Description | A defined attribute. | — |
| **Point** | A point is identified by its name and is related to a context. | — |
| Name | Computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | — |
| Display Name | A defined attribute. | — |
| X | A defined attribute. | — |
| Y | A defined attribute. | — |
| Context | A defined attribute. | _Which mathematical context the coordinates are interpreted in._ |
| **Point Set** | A point set is identified by its name and is related to a point set member (its members) and a point pair (its pairs). | — |
| Name | Computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | — |
| Display Name | A defined attribute. | — |
| Description | A defined attribute. | — |
| Members | A defined attribute. | — |
| Pairs | A defined attribute. | — |
| Point Count | The number of point set members related to the point set. | _n in U(n)._ |
| Unit Distance Pair Count | The number of the point set's point pairs that are unit distances. | _e(G(P)) — the number of edges in the induced unit-distance graph._ |
| Max Possible Edges | Computed as the point count times the point count minus 1 divided by 2. | _n choose 2 — the trivial upper bound on UnitDistancePairCount._ |
| Edge Density | Computed as the unit distance pair count divided by the max possible edges. | _Fraction of point pairs that are unit pairs._ |
| Density Exponent Estimate | Computed as the logarithm of the unit distance pair count divided by the logarithm of the point count. | _The exponent c such that UnitDistancePairCount ≈ PointCount^c. Lower bounds for U(n) are claims that this exponent is ≥ some target for arbitrarily large PointCount._ |
| **Point Set Member** | A point set member is identified by its name and is related to a point set and a point. | — |
| Name | Computed as the point set divided by the point. | — |
| Point Set | A defined attribute. | — |
| Point | A defined attribute. | — |
| **Point Pair** | A point pair is identified by its name and is related to a point set; a point (its point a); and a point (its point b). | — |
| Name | Computed as the point set divided by the point a minus the point b. | — |
| Point Set | A defined attribute. | — |
| Point a | A defined attribute. | — |
| Point B | A defined attribute. | — |
| Point AX | The x of the point pair's point a. | _Lookup of PointA.X._ |
| Point AY | The y of the point pair's point a. | — |
| Point BX | The x of the point pair's point b. | — |
| Point BY | The y of the point pair's point b. | — |
| Delta X | Computed as the point BX minus the point AX. | — |
| Delta Y | Computed as the point BY minus the point AY. | — |
| Delta X Squared | Computed as the delta x raised to the power of 2. | — |
| Delta Y Squared | Computed as the delta y raised to the power of 2. | — |
| Distance Squared | Computed as the delta x squared plus the delta y squared. | _Pythagoras, made explicit. Promoted because every downstream check uses it directly._ |
| Distance | Computed as the square root of the distance squared. | — |
| Tolerance | A defined attribute. | _Numerical tolerance for the unit-distance check._ |
| Distance From Unit | Computed as the absolute value of the distance squared minus 1. | — |
| Is Unit Distance | True when the distance from unit is at most the tolerance. | _The unit-distance predicate — the entire problem turns on this boolean._ |
| Description | A defined attribute. | _Free-text annotation for this row._ |
| **Unit Distance Graph** | A unit distance graph is identified by its name and is related to a point set. | — |
| Name | Computed as the point set minus the graph. | — |
| Point Set | A defined attribute. | — |
| Vertex Count | The point count of the unit distance graph's point set. | — |
| Edge Count | The unit distance pair count of the unit distance graph's point set. | — |
| Max Possible Edges | Computed as the vertex count times the vertex count minus 1 divided by 2. | — |
| Edge Density | Computed as the edge count divided by the max possible edges. | — |
| Density Exponent Estimate | Computed as the logarithm of the edge count divided by the logarithm of the vertex count. | _Witness for the exponent in U(n) ≥ n^c, finite-sample._ |
| **Number Field** | A number field is identified by its name. | — |
| Name | Computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | — |
| Display Name | A defined attribute. | — |
| Defining Polynomial | A defined attribute. | — |
| Degree | A defined attribute. | — |
| Discriminant | A defined attribute. | — |
| Class Number | A defined attribute. | — |
| Signature Real Embeddings | A defined attribute. | _r_1: number of real embeddings._ |
| Signature Complex Embeddings | A defined attribute. | _r_2: number of complex-conjugate pairs._ |
| Ambient Lattice Dimension | Computed as the signature real embeddings plus 2 times the signature complex embeddings. | _The R-dimension of the Minkowski embedding image._ |
| Is Totally Real | True when the signature complex embeddings is 0. | — |
| Is Totally Complex | True when the signature real embeddings is 0. | — |
| Is PID | True when the class number is 1. | _Ring of integers is a principal ideal domain iff class number is 1._ |
| Prime Ideals | A defined attribute. | — |
| Small Norm Prime Ideal Count | The number of the number field's prime ideals that are small norms. | _How many prime ideals fall below the small-norm threshold. Drives multiplicity in construction families._ |
| Golod Shafarevich Passing Count | The number of the number field's golod shafarevich criteria that satisfie a golod shafarevich tower. | _Aggregation count of GolodShafarevichCriteria rows for this field that satisfy the GS tower inequality. Used as the bridge from raw GS parameters to a per-field boolean._ |
| Satisfies Golod Shafarevich | True when the golod shafarevich passing count is greater than 0. | _TRUE if some GolodShafarevichCriteria row for this field passes the tower inequality. This is the gate that determines whether the field is a candidate algebraic source for many short vectors._ |
| Is Algebraic Source Candidate | True when all of the following hold: the satisfies golod shafarevich flag is set and the small norm prime ideal count is greater than 0. | _TRUE when the field both satisfies GS and has at least one small-norm prime ideal — the two-condition algebraic precondition for producing a Minkowski lattice with many short vectors._ |
| Field Embedding Count | The number of field embeddings related to the number field. | _How many field embeddings (real or complex) are explicitly loaded for this field. Sanity check: should equal SignatureRealEmbeddings + SignatureComplexEmbeddings._ |
| Field Embedding Count Matches Signature | True when the field embedding count is the signature real embeddings plus the signature complex embeddings. | _Read-time integrity check: did we load every embedding the signature claims to exist?_ |
| **Prime Ideal** | A prime ideal is identified by its name and is related to a number field. | — |
| Name | Computed as the number field divided by the generator description. | — |
| Number Field | A defined attribute. | — |
| Generator Description | A defined attribute. | — |
| Norm | A defined attribute. | — |
| Norm Threshold | A defined attribute. | _Per-prime threshold for the 'small norm' classification._ |
| Is Small Norm | True when the norm is at most the norm threshold. | — |
| Splits Completely | True when an empty string. | _Whether the prime in Q splits completely in O_K. Nullable: null when splitting behavior has been named but not yet computed._ |
| **Minkowski Lattice** | A minkowski lattice is identified by its name and is related to a number field and a planar projection (its projections). | — |
| Name | Computed as the number field minus the lattice. | — |
| Number Field | A defined attribute. | — |
| Dimension | The ambient lattice dimension of the minkowski lattice's number field. | — |
| Field Discriminant | Taken from the linked number field. | — |
| Determinant | A defined attribute. | — |
| Determinant Squared | Computed as the determinant raised to the power of 2. | — |
| Absolute Field Discriminant | Computed as the absolute value of the field discriminant. | — |
| Determinant Squared Equals Discriminant | True when the absolute value of the determinant squared minus the absolute field discriminant is less than 0.0001. | _Classical identity: covolume(O_K)^2 = \|disc(K)\|. Promoted as a first-class sanity check the model verifies on read._ |
| Gram Matrix JSON | A defined attribute. | _JSON-encoded Gram matrix. Matrix algebra is held opaque because ERB formulas are scalar; downstream substrates that support matrices may extend this._ |
| Short Vector Threshold Squared | A defined attribute. | — |
| Short Vectors | A defined attribute. | — |
| Short Vector Count | The number of the minkowski lattice's short vectors that are shorts. | — |
| Source Field Degree | Taken from the linked number field. | _The degree [K:Q] of the source field, surfaced on the lattice for downstream chain checks._ |
| Source Field Satisfies Golod Shafarevich | True when the linked number field is satisfies golod shafarevich. | _The single most important upstream gate. TRUE means the field-side ingredient (GS tower) is satisfied — a necessary condition for the lattice to carry enough short vectors for a superlinear unit-distance construction._ |
| Source Field is Algebraic Source Candidate | True when the linked number field is an algebraic source candidate. | — |
| Projections | A defined attribute. | — |
| Projection Count | The number of planar projections related to the minkowski lattice. | _How many distinct planar projections have been registered from this lattice._ |
| Has Any Planar Projection | True when the projection count is greater than 0. | _TRUE if any planar projection has been registered — the geometry-side leg of the bridge from lattice to plane._ |
| Is Load Bearing for Unit Distance Construction | True when all of the following hold: the source field is algebraic source candidate flag is set; the short vector count is greater than 0; and the any planar projection flag is set. | _TRUE when the lattice has a GS-satisfying source field, at least one short vector, and at least one planar projection — i.e. it is positioned to feed a ConstructionFamily that produces unit-distance witnesses._ |
| Description | A defined attribute. | _Free-text annotation for this row._ |
| **Short Vector** | A short vector is identified by its name and is related to a minkowski lattice. | — |
| Name | Computed as the minkowski lattice divided by the coords JSON. | — |
| Minkowski Lattice | A defined attribute. | — |
| Coords JSON | A defined attribute. | — |
| Norm Squared | A defined attribute. | — |
| Threshold Squared | The short vector threshold squared of the short vector's minkowski lattice. | — |
| Is Short | True when the norm squared is at most the threshold squared. | — |
| Description | A defined attribute. | _Free-text annotation for this row._ |
| **Construction Family** | A construction family is identified by its name and is related to optionally a number field (its source number field); optionally a minkowski lattice (its source minkowski lattice); and a construction instance (its instances). | — |
| Name | Computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | — |
| Display Name | A defined attribute. | — |
| Description of Nth Member | A defined attribute. | — |
| Source Number Field | A defined attribute. | — |
| Source Minkowski Lattice | A defined attribute. | — |
| Instances | A defined attribute. | — |
| Instance Count | The number of construction instances related to the construction family. | — |
| Source Field Satisfies Golod Shafarevich | True when the linked source number field is satisfies golod shafarevich. | _The GS-satisfaction of the source field, inherited via SourceNumberField. Null if the family is non-algebraic (no source field set)._ |
| Source Lattice is Load Bearing | True when the construction family's source minkowski lattice is a load bearing for unit distance construction. | — |
| Is Algebraic Construction | True when all of the following hold: the source field satisfies golod shafarevich flag is set and the source lattice is load bearing flag is set. | _TRUE iff the family's algebraic upstream is GS-passing AND its lattice has a projection + short vectors. Non-algebraic families (random points, ad-hoc geometric tricks) will be FALSE._ |
| Description | A defined attribute. | _Free-text annotation for this row._ |
| **Construction Instance** | A construction instance is identified by its name and is related to a construction family and a point set. | — |
| Name | Computed as the value of ConstructionFamily-nParamN. | — |
| Construction Family | A defined attribute. | — |
| Param N | A defined attribute. | — |
| Point Set | A defined attribute. | — |
| Point Count | Taken from the linked point set. | — |
| Edge Count | The unit distance pair count of the construction instance's point set. | — |
| Density Exponent Estimate | Taken from the linked point set. | — |
| Param N Matches Point Count | True when the param n is the point count. | _Sanity check: did the n-th instance actually produce n points?_ |
| Family is Algebraic | True when the construction instance's construction family is an algebraic construction. | _Surfaces the family-level algebraic-construction flag onto each instance so per-row checks can see it._ |
| Is Explicit Superlinear | True when the density exponent estimate is greater than 1. | _TRUE if this single finite instance already exhibits log(edges)/log(points) > 1 — a per-instance witness that the family is achieving superlinear edge growth at this n._ |
| Is Algebraic Superlinear Witness | True when all of the following hold: the family is algebraic flag is set and the explicit superlinear flag is set. | _A single instance that is both (a) coming from an algebraically valid family AND (b) finitely superlinear. This is the most direct per-row evidence we have that the algebra is producing the geometry._ |
| **Growth Sequence** | A growth sequence is identified by its name and is related to a construction family. | — |
| Name | Computed as the construction family minus the growth. | — |
| Construction Family | A defined attribute. | — |
| Observed Instance Count | The number of construction instances related to the growth sequence. | — |
| Max Param N | The largest param n across the construction instances related to the growth sequence. | — |
| Max Edge Count | The largest edge count across the construction instances related to the growth sequence. | — |
| Max Observed Density Exponent Estimate | The largest density exponent estimate across the construction instances related to the growth sequence. | — |
| **Asymptotic Function** | An asymptotic function is identified by its name and is related to an asymptotic lower bound (its lower bounds). | — |
| Name | Computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | — |
| Display Name | A defined attribute. | — |
| Definition Text | A defined attribute. | — |
| Lower Bounds | A defined attribute. | — |
| Lower Bound Count | The number of asymptotic lower bounds related to the asymptotic function. | — |
| Best Known Lower Bound Exponent | The largest exponent across the asymptotic lower bounds related to the asymptotic function. | _ALL-TIME best lower-bound exponent across every loaded row, including retracted ones. Useful for forensic queries; usually NOT what you want for 'what does the rulebook currently believe'._ |
| Best Known Current Lower Bound Exponent | The largest exponent across the asymptotic function's asymptotic lower bounds that are currently-valid. | _Bitemporally-filtered best lower-bound exponent: only counts bounds where IsCurrentlyValid=TRUE. This is what 'best known' actually means under the bitemporal discipline. Retracted overclaims, withdrawn preprints, and pending-evaluation rows are excluded._ |
| Retracted Lower Bound Count | The number of the asymptotic function's asymptotic lower bounds that are not currently-valid. | _How many lower-bound rows for this function have been retracted/superseded. Cumulative scar count._ |
| Max Overclaimed Exponent | The largest exponent across the asymptotic function's asymptotic lower bounds that are not currently-valid. | _Highest exponent that was once claimed but is no longer current. Forensic indicator of overclaim history._ |
| **Asymptotic Lower Bound** | An asymptotic lower bound is identified by its name and is related to an asymptotic function and optionally a growth sequence. | — |
| Name | Computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | — |
| Display Name | A defined attribute. | — |
| Asymptotic Function | A defined attribute. | — |
| Growth Sequence | A defined attribute. | — |
| Exponent | A defined attribute. | — |
| Coefficient | A defined attribute. | — |
| Statement Text | A defined attribute. | — |
| Source Citation | A defined attribute. | — |
| Is Explicit | True when an empty string. | _True if the exponent is named numerically (e.g. 1.014), false if only existential ('some ε > 0')._ |
| Is Superlinear | True when the exponent is greater than 1. | — |
| Exceeds Trivial Linear Bound | True when the exponent is at least 1. | — |
| Witnessed by Max Density Exponent | The max observed density exponent estimate of the asymptotic lower bound's growth sequence. | — |
| Witness Consistent | True when the witnessed by max density exponent is at least the exponent. | _Finite-sample sanity check: do the family's observed instances achieve at least the claimed exponent? FALSE means either more instances are needed or the claim is wrong for this family._ |
| Witness Source Family | The construction family of the asymptotic lower bound's growth sequence. | _Surfaces the ConstructionFamily backing this bound's witness, two FK hops upstream._ |
| Witness Family is Algebraic | True when the asymptotic lower bound's witness source family is an algebraic construction. | _TRUE iff the family providing this bound's finite witness is an algebraic construction with GS-passing source field. Distinguishes 'algebraically-anchored bound' from 'bound with a generic geometric witness'._ |
| Is Algebraically Anchored | True when all of the following hold: the witness consistent flag is set; the witness family is algebraic flag is set; and the superlinear flag is set. | _TRUE when (a) the finite witness is consistent with the claimed exponent, (b) the witness family is algebraic-source, and (c) the claim itself is superlinear. This is the cleanest single-cell answer to 'does this bound carry the algebraic ladder all the way through?'_ |
| Obligation Count | The number of proof obligations related to the asymptotic lower bound. | — |
| Satisfied Obligation Count | The number of the asymptotic lower bound's proof obligations that are satisfied. | — |
| Open Obligation Count | The number of the asymptotic lower bound's proof obligations that are not satisfied. | — |
| All Obligations Satisfied | True when the satisfied obligation count is the obligation count. | _TRUE iff every proof obligation referencing this bound is satisfied. FALSE means at least one obligation is unsatisfied or unevaluated._ |
| Valid From | A defined attribute. | _ISO date when this claim first entered valid-time (typically the publication date of the paper that asserts it)._ |
| Valid to | A defined attribute. | _ISO date when this claim left valid-time (retraction, withdrawal). Null = still valid in the real world._ |
| Tx From | A defined attribute. | _ISO date when this row was first recorded in the rulebook (transaction-time audit start)._ |
| Tx to | A defined attribute. | _ISO date when this row was logically removed from the rulebook. Null = still present in current transaction._ |
| Is Currently Valid | True when an empty string. | _Bitemporal current-validity flag. TRUE = claim is still considered valid; FALSE = superseded/withdrawn; null = not yet evaluated. Drives every 'current best known' aggregation in the asymptotic layer._ |
| Proof Pathway | A defined attribute. | _How the bound is proven. One of: 'algebraic-tower' (Sawin-style, via class field towers + Minkowski lattices), 'combinatorial-pigeonhole' (Erdős 1946, via integer-grid + divisor-function argument), 'crossing-number' (via crossing-number inequality), 'incidence-counting' (via point-line incidence bounds), 'witness-only' (finite-sample claim with no asymptotic proof), 'other'._ |
| Is Algebraic Tower Proof | True when the proof pathway is “algebraic-tower”. | — |
| Is Combinatorial Proof | True when the proof pathway is “combinatorial-pigeonhole”. | — |
| Is Auditable Via Its Pathway | True when at least one of the following holds: all of the following hold: the algebraic tower proof flag is set and the algebraically anchored flag is set; all of the following hold: the combinatorial proof flag is set; the all obligations satisfied flag is set; and the witness consistent flag is set; or all of the following hold: the proof pathway is “witness-only” and the witness consistent flag is set. | _Pathway-appropriate audit gate. Algebraic-tower proofs need IsAlgebraicallyAnchored; combinatorial-pigeonhole proofs need obligations satisfied + finite witness consistent; witness-only claims just need WitnessConsistent. Fixes the bias of the older AlgebraicChainClosed gate, which would mis-rule Erdős's pigeonhole proof as 'not closed' simply because it doesn't use class field towers._ |
| **Theorem** | A theorem is identified by its name and is related to an asymptotic function and an asymptotic lower bound (its anchored lower bound). | — |
| Name | Computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | — |
| Display Name | A defined attribute. | — |
| Statement Text | A defined attribute. | — |
| Is Anchor | True when an empty string. | — |
| Is Proven | True when an empty string. | — |
| Proof Citation | A defined attribute. | — |
| Asymptotic Function | A defined attribute. | — |
| Anchored Lower Bound | A defined attribute. | — |
| Anchored Bound Exponent | Taken from the linked anchored lower bound. | — |
| Anchored Bound is Superlinear | True when the linked anchored lower bound is a superlinear. | — |
| Claimed Exponent | A defined attribute. | _The exponent the theorem statement claims, recorded redundantly so the read-time check below can compare it against the bound's recorded exponent._ |
| Anchor Matches Bound Exponent | True when the absolute value of the claimed exponent minus the anchored bound exponent is less than 0.0001. | _Read-time integrity check that the theorem and its anchored bound agree on the exponent._ |
| Anchored Bound Witness Consistent | True when the linked anchored lower bound is witness consistent. | _Surfaces the bound-level finite-witness consistency onto the theorem row._ |
| Anchored Bound is Algebraically Anchored | True when the linked anchored lower bound is algebraically anchored. | _Surfaces the bound-level algebraic-anchoring onto the theorem row._ |
| Algebraic Chain Closed | True when all of the following hold: the anchor matches bound exponent flag is set; the anchored bound is superlinear flag is set; the anchored bound witness consistent flag is set; and the anchored bound is algebraically anchored flag is set. | _THE ladder check. TRUE iff (a) the theorem's claimed exponent matches the anchored bound, (b) the bound is superlinear, (c) the finite witness is consistent with the claim, (d) the witness family is algebraic with GS-passing source. When this is TRUE for a row, the entire chain from number field to theorem is closed in the rulebook._ |
| Applies to Function | The display name of the theorem's asymptotic function. | _Human-readable name of the function the theorem talks about. Multi-anchor support — different theorems anchor different functions in the same neighborhood._ |
| Is Unit Distance Theorem | True when the asymptotic function is “u-n”. | _TRUE if this theorem is about U(n). Other anchors in this neighborhood (Szemerédi–Trotter, etc.) are about different functions._ |
| Anchored Bound All Obligations Satisfied | True when the linked anchored lower bound is all obligations satisfied. | _Surfaces the anchored bound's full-obligation status onto the theorem row._ |
| Anchored Bound Open Obligation Count | Taken from the linked anchored lower bound. | — |
| Fully Audited and Closed | True when all of the following hold: the algebraic chain closed flag is set and the anchored bound all obligations satisfied flag is set. | _The final, fully-paranoid theorem-level gate: the algebraic chain is closed AND every proof obligation against the anchored bound is satisfied. TRUE means the theorem row is end-to-end witnessed in the rulebook with no open obligations._ |
| Valid From | A defined attribute. | _ISO date this theorem was first established (proof publication date for proven; statement date for unproven anchors)._ |
| Valid to | A defined attribute. | — |
| Tx From | A defined attribute. | — |
| Tx to | A defined attribute. | — |
| Is Currently Valid | True when an empty string. | _TRUE for current valid theorems; FALSE for retracted/disproven; null for unevaluated._ |
| Anchored Bound is Currently Valid | True when the linked anchored lower bound is currently valid. | _Surfaces the anchored bound's current-validity onto the theorem. If the anchored bound got retracted, this goes FALSE — and the theorem either needs re-anchoring or also needs retraction._ |
| Is Historically Anchored | True when all of the following hold: the is currently valid is true and the anchored bound is currently valid is true. | _TRUE iff both the theorem and its anchored bound are currently valid. Bitemporally-aware version of the older AlgebraicChainClosed gate — catches the case where a theorem's anchored bound has been retracted._ |
| Anchored Bound is Auditable Via Its Pathway | True when the linked anchored lower bound is an auditable via its pathway. | _Surfaces the anchored bound's pathway-appropriate audit gate onto the theorem._ |
| Is Audited and Closed | True when all of the following hold: the historically anchored flag is set and the anchored bound is auditable via its pathway flag is set. | _The pathway-aware replacement for FullyAuditedAndClosed. TRUE iff the theorem is bitemporally valid, its anchored bound is bitemporally valid, AND the anchored bound passes its OWN pathway's audit gate (algebraic chain for Sawin-style; obligations+witness for Erdős-style pigeonhole). Erdős's theorem closes here even though the older algebraic-only gate said it couldn't._ |
| **Metric** | A metric is identified by its name and is related to optionally a context (its ambient context). | — |
| Name | Computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | — |
| Display Name | A defined attribute. | — |
| Ambient Context | A defined attribute. | — |
| Metric Kind | A defined attribute. | _One of: euclidean, lattice-gram, taxicab, cosine-similarity, experimental._ |
| Definition Text | A defined attribute. | — |
| Is Euclidean | True when the metric kind is “euclidean”. | — |
| Is Lattice Gram | True when the metric kind is “lattice-gram”. | — |
| Satisfies Triangle Inequality | True when an empty string. | _Nullable: TRUE for genuine metrics, FALSE for similarity-only functions, null for unevaluated experimental rows._ |
| Description | A defined attribute. | — |
| **Field Embedding** | A field embedding is identified by its name and is related to a number field. | — |
| Name | Computed as the number field divided by the embedding type minus the index in signature. | — |
| Number Field | A defined attribute. | — |
| Embedding Type | A defined attribute. | _One of: 'real' or 'complex'._ |
| Index in Signature | A defined attribute. | _1-based index within the signature._ |
| Target Space Dim | A defined attribute. | _1 for real, 2 for complex._ |
| Is Real Embedding | True when the target space dim is 1. | — |
| Is Complex Embedding | True when the target space dim is 2. | — |
| Has Conjugate Pair in Field | True when an empty string. | _Null for real embeddings (concept doesn't apply); TRUE for complex embeddings whose conjugate is in K; FALSE for hypothetical degenerate complex embeddings without their partner._ |
| Description | A defined attribute. | — |
| **Minkowski Embedding** | A minkowski embedding is identified by its name and is related to a number field and optionally a minkowski lattice (its target lattice). | — |
| Name | Computed as the number field minus the minkowski minus the embedding. | — |
| Number Field | A defined attribute. | — |
| Target Lattice | A defined attribute. | _Nullable: the field may have a defined embedding map even if the materialised lattice row isn't loaded yet._ |
| Ambient Dimension | The ambient lattice dimension of the minkowski embedding's number field. | — |
| Target Lattice Dimension | Taken from the linked target lattice. | — |
| Dimension Match | True when the ambient dimension is the target lattice dimension. | — |
| Is Canonical | True when an empty string. | _TRUE if this is the canonical Minkowski embedding._ |
| Preserves Additive Structure | True when an empty string. | _Nullable: TRUE for canonical embeddings, FALSE for non-additive maps, null for unevaluated experimental rows._ |
| Description | A defined attribute. | — |
| **Gram Matrice** | A gram matrice is identified by its name and is related to a minkowski lattice. | — |
| Name | Computed as the minkowski lattice minus the gram. | — |
| Minkowski Lattice | A defined attribute. | — |
| Dimension | Taken from the linked minkowski lattice. | — |
| Lattice Determinant | Taken from the linked minkowski lattice. | — |
| Matrix JSON | A defined attribute. | — |
| Is Symmetric | True when an empty string. | — |
| Is Positive Definite | True when an empty string. | — |
| Is Diagonal | True when an empty string. | — |
| Rank Deficient | True when an empty string. | — |
| Encodes Valid Lattice Metric | True when all of the following hold: the symmetric flag is set and the positive definite flag is set. | _TRUE iff G is symmetric and positive-definite — the algebraic conditions for G to induce a genuine metric._ |
| Description | A defined attribute. | — |
| **Planar Projection** | A planar projection is identified by its name and is related to a minkowski lattice (its source lattice) and a context (its target context). | — |
| Name | Computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | — |
| Display Name | A defined attribute. | — |
| Source Lattice | A defined attribute. | — |
| Target Context | A defined attribute. | — |
| Projection Kind | A defined attribute. | _One of: 'first-two-coords', 'rotation-scale', 'rational-affine', 'isometric-embedding'._ |
| Scaling Factor | A defined attribute. | — |
| Rotation Degrees | A defined attribute. | — |
| Is Scaling Preserving | True when the scaling factor is 1. | — |
| Is Isometric | True when an empty string. | — |
| Preserves Unit Distance | True when an empty string. | _TRUE if vectors of squared-norm 1 in the lattice map to unit-distance vectors in R^2._ |
| Projected Short Vectors | A defined attribute. | — |
| Projected Short Vector Count | The number of projected short vectors related to the planar projection. | — |
| Unit Distance Vector Count | The number of the planar projection's projected short vectors that project to unit distance vector. | _How many projected short vectors land at squared-norm 1 — i.e. survive as unit-distance witnesses. The geometric yield of the algebra-to-plane bridge._ |
| Unit Distance Vector Yield | Computed as the unit distance vector count divided by the projected short vector count. | _Fraction of projected short vectors that are unit-distance witnesses._ |
| Source Lattice is Load Bearing | True when the planar projection's source lattice is a load bearing for unit distance construction. | — |
| Description | A defined attribute. | — |
| **Projected Short Vector** | A projected short vector is identified by its name and is related to a short vector and a planar projection. | — |
| Name | Computed as the short vector divided by the planar projection. | — |
| Short Vector | A defined attribute. | — |
| Planar Projection | A defined attribute. | — |
| Projected X | A defined attribute. | — |
| Projected Y | A defined attribute. | — |
| Projected X Squared | Computed as the projected x raised to the power of 2. | — |
| Projected Y Squared | Computed as the projected y raised to the power of 2. | — |
| Projected Norm Squared | Computed as the projected x squared plus the projected y squared. | _<π(v), π(v)> — the LHS of the planar-unit target equation._ |
| Source Norm Squared | Taken from the linked short vector. | — |
| Source is Short | True when the projected short vector's short vector is a short. | — |
| Unit Tolerance | A defined attribute. | — |
| Distance Squared From Unit | Computed as the absolute value of the projected norm squared minus 1. | — |
| Projects to Unit Distance Vector | True when the distance squared from unit is at most the unit tolerance. | _THE planar-unit target equation: <π(v), π(v)> = 1. This is the equation Sawin's construction is solving — every TRUE row is one solution._ |
| Is Valid Witness | True when all of the following hold: the source is short flag is set and the projects to unit distance vector flag is set. | _The two-sided certificate: source vector is short (algebraic side) AND projection has squared norm 1 (geometric side)._ |
| Norm Preserved Under Projection | True when the absolute value of the source norm squared minus the projected norm squared is less than the unit tolerance. | _TRUE if the projection preserved the squared norm on this vector — locally isometric._ |
| Description | A defined attribute. | — |
| **Golod Shafarevich Criteria** | A golod shafarevich criteria is identified by its name and is related to a number field and optionally a source reference. | — |
| Name | Computed as the number field minus the gs. | — |
| Number Field | A defined attribute. | — |
| Minimal Generator Count d | A defined attribute. | _The 'd' in the GS inequality._ |
| Relation Count r | A defined attribute. | _The 'r' in the GS inequality._ |
| Field Degree | Taken from the linked number field. | — |
| Criterion Threshold | Computed as the minimal generator count d raised to the power of 2 divided by 4. | _d^2/4. The bound that r must exceed._ |
| Relation Count Exceeds Threshold | True when the relation count r is greater than the criterion threshold. | — |
| Satisfies Golod Shafarevich Tower | True when the relation count exceeds threshold flag is set. | _TRUE iff r > d^2/4 — the GS inequality is satisfied and K has an infinite class field tower._ |
| Passes Criterion | True when an empty string. | _Curator override (nullable). Null means 'use calculated SatisfiesGolodShafarevichTower'._ |
| Source Reference | A defined attribute. | — |
| Description | A defined attribute. | — |
| **Semantic Bridge** | A semantic bridge is identified by its name and is related to a domain (its from domain) and a domain (its to domain). | — |
| Name | Computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | — |
| Display Name | A defined attribute. | — |
| From Domain | A defined attribute. | — |
| To Domain | A defined attribute. | — |
| Bridge Kind | A defined attribute. | _One of: embedding, projection, induction, aggregation, anchor, analogy._ |
| From Concept Table | A defined attribute. | — |
| To Concept Table | A defined attribute. | — |
| Is Load Bearing | True when an empty string. | _TRUE if removing the bridge breaks the chain to the theorem; FALSE for analogy-only; null when unclassified._ |
| Is Closed | True when an empty string. | _TRUE if every row in FromConceptTable has a witness in ToConceptTable; null when not checked._ |
| Is Analogy | True when the bridge kind is “analogy”. | — |
| Description | A defined attribute. | — |
| **Semantic Route** | A semantic route is identified by its name and is related to a semantic route step (its steps). | — |
| Name | Computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | — |
| Display Name | A defined attribute. | — |
| Start Concept | A defined attribute. | — |
| End Concept | A defined attribute. | — |
| Steps | A defined attribute. | — |
| Step Count | The number of semantic route steps related to the semantic route. | — |
| Is Full Spine | True when an empty string. | — |
| Ends At Theorem Anchor | True when an empty string. | — |
| Validated Step Count | The number of the semantic route's semantic route steps that are validated. | — |
| All Steps Validated | True when the validated step count is the step count. | _TRUE iff every step on the route has IsValidated=TRUE._ |
| Description | A defined attribute. | — |
| **Semantic Route Step** | A semantic route step is identified by its name and is related to a semantic route and optionally a semantic bridge (its bridge used). | — |
| Name | Computed as the semantic route minus the step order. | — |
| Semantic Route | A defined attribute. | — |
| Step Order | A defined attribute. | — |
| From Concept | A defined attribute. | — |
| To Concept | A defined attribute. | — |
| Bridge Used | A defined attribute. | _Null when this step is an intra-domain FK hop; set when crossing domains._ |
| Bridge is Load Bearing | True when the linked bridge used is load bearing. | — |
| Is Validated | True when an empty string. | _Curator-set: TRUE if verified, FALSE if known broken, null if not yet evaluated._ |
| Description | A defined attribute. | — |
| **Source Reference** | A source reference is identified by its name. | — |
| Name | Computed as the lower-cased short label with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | — |
| Short Label | A defined attribute. | — |
| Full Citation | A defined attribute. | — |
| URL | A defined attribute. | — |
| Year | A defined attribute. | — |
| Is Arxiv | True when an empty string. | — |
| Is Published | True when an empty string. | — |
| Lemma Count | The number of lemmas related to the source reference. | — |
| Outbound Citation Count | The number of citation links related to the source reference. | _How many other sources this one cites._ |
| Inbound Citation Count | The number of citation links related to the source reference. | _How many other sources cite this one — a crude influence metric._ |
| Valid From | A defined attribute. | _ISO publication date — the moment this source becomes citable._ |
| Valid to | A defined attribute. | _ISO retraction date (if any). Null = still in good standing._ |
| Tx From | A defined attribute. | — |
| Tx to | A defined attribute. | — |
| Is Currently Valid | True when an empty string. | _TRUE if the source is still in good standing; FALSE if retracted; null if standing not yet evaluated._ |
| Description | A defined attribute. | — |
| **Lemma** | A lemma is identified by its name and is related to a source reference. | — |
| Name | Computed as the lower-cased label with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | — |
| Label | A defined attribute. | — |
| Source Reference | A defined attribute. | — |
| Statement Text | A defined attribute. | — |
| Feeds Object Table | A defined attribute. | — |
| Feeds Object ID | A defined attribute. | — |
| Is Loaded | True when an empty string. | _TRUE if the lemma's content has been turned into data; FALSE if known but not loaded; null if unevaluated._ |
| Is Load Bearing | True when an empty string. | — |
| Obligation Count | The number of proof obligations related to the lemma. | _How many bounds depend on this lemma._ |
| Valid From | A defined attribute. | _ISO date this lemma was first asserted (inherits from SourceReference)._ |
| Valid to | A defined attribute. | — |
| Tx From | A defined attribute. | — |
| Tx to | A defined attribute. | — |
| Is Currently Valid | True when an empty string. | _TRUE if the lemma is still considered valid; FALSE if refuted/retracted; null if unevaluated._ |
| Description | A defined attribute. | — |
| **Mirror Contract** | A mirror contract is identified by its name. | — |
| Name | Computed as the lower-cased rule label with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | — |
| Rule Label | A defined attribute. | — |
| Rule Statement | A defined attribute. | — |
| Rule Kind | A defined attribute. | _One of: load, describe, derive, gate, reject._ |
| Applies to Scope | A defined attribute. | — |
| Is Binding on Agents | True when an empty string. | _TRUE if agents must follow this rule; FALSE if deprecated; null if under discussion._ |
| Is Rejection Rule | True when the rule kind is “reject”. | — |
| Description | A defined attribute. | — |
| **Conjecture** | A conjecture is identified by its name and is related to an asymptotic function (its target function); optionally a source reference (its proposed by); optionally a source reference (its resolution citation); and optionally a theorem (its related theorem). | — |
| Name | Computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | — |
| Display Name | A defined attribute. | — |
| Statement Text | A defined attribute. | — |
| Target Function | A defined attribute. | — |
| Conjectured Exponent | A defined attribute. | _The exponent the conjecture asserts. Null when the conjecture is non-exponent (e.g., a structural claim)._ |
| Is Conjectural Upper Bound | True when an empty string. | — |
| Is Conjectural Lower Bound | True when an empty string. | — |
| Proposed by | A defined attribute. | — |
| Is Resolved | True when an empty string. | _TRUE if proved/disproved; FALSE if explicitly still open; null when status hasn't been classified._ |
| Resolved As | A defined attribute. | _One of: 'proved', 'disproved', 'withdrawn'. Null when not resolved._ |
| Resolution Citation | A defined attribute. | — |
| Related Theorem | A defined attribute. | _If this conjecture resolved into a theorem, the theorem row is here._ |
| Is Still Open | True when the is resolved is false. | _TRUE only when IsResolved is explicitly FALSE. Null IsResolved propagates to non-TRUE._ |
| Valid From | A defined attribute. | _ISO date this conjecture was first proposed._ |
| Valid to | A defined attribute. | _ISO date this conjecture left open status (resolved or withdrawn). Null = still open._ |
| Tx From | A defined attribute. | — |
| Tx to | A defined attribute. | — |
| Is Currently Valid | True when an empty string. | _TRUE iff the conjecture is still an OPEN question. Resolved or withdrawn ⇒ FALSE. Null = unevaluated. NOTE: this is bitemporal-status, NOT the truth of the underlying proposition — a conjecture-that-became-a-theorem has IsCurrentlyValid=FALSE here but the proposition itself is now TRUE in Theorems._ |
| Description | A defined attribute. | — |
| **Proof Obligation** | A proof obligation is identified by its name and is related to an asymptotic lower bound (its parent bound) and a lemma (its required lemma). | — |
| Name | Computed as the parent bound divided by the required lemma. | — |
| Parent Bound | A defined attribute. | — |
| Required Lemma | A defined attribute. | — |
| Obligation Kind | A defined attribute. | _One of: 'necessary', 'sufficient', 'auxiliary'._ |
| Is Necessary | True when the obligation kind is “necessary”. | — |
| Is Satisfied | True when an empty string. | _TRUE if the curator has confirmed the lemma justifies its part of the bound; FALSE if known gap; null if unevaluated._ |
| Is Lemma Loaded | True when the linked required lemma is loaded. | — |
| Is Lemma Load Bearing | True when the linked required lemma is load bearing. | — |
| Bound Claimed Exponent | Taken from the linked parent bound. | — |
| Is Currently Open | True when the is satisfied is false. | _TRUE only if explicitly FALSE — i.e. a known gap._ |
| Valid From | A defined attribute. | — |
| Valid to | A defined attribute. | — |
| Tx From | A defined attribute. | — |
| Tx to | A defined attribute. | — |
| Is Currently Valid | True when an empty string. | — |
| Description | A defined attribute. | — |
| **Citation Link** | A citation link is identified by its name and is related to a source reference (its citing source) and a source reference (its cited source). | — |
| Name | Computed as the citing source minus the cites minus the cited source. | — |
| Citing Source | A defined attribute. | — |
| Cited Source | A defined attribute. | — |
| Citation Kind | A defined attribute. | _One of: 'extends', 'improves', 'cites-for-context', 'depends-on', 'disagrees-with'._ |
| Is Load Bearing | True when an empty string. | _TRUE if removing the cited source breaks the citing source's proof; FALSE for context-only; null when unclassified._ |
| Is Dependency | True when the citation kind is “depends-on”. | — |
| Is Improvement | True when the citation kind is “improves”. | — |
| Citing Year | Taken from the linked citing source. | — |
| Cited Year | Taken from the linked cited source. | — |
| Valid From | A defined attribute. | _ISO date this citation became real (matches the citing source's publication date)._ |
| Valid to | A defined attribute. | — |
| Tx From | A defined attribute. | — |
| Tx to | A defined attribute. | — |
| Is Currently Valid | True when an empty string. | _TRUE iff both the citing and cited sources are themselves still currently valid; FALSE if either has been retracted; null if unevaluated._ |
| Description | A defined attribute. | — |
| **Answer Key** | An answer key is identified by its name. | — |
| Name | Computed as the target table divided by the target row ID divided by the target field. | — |
| Target Table | A defined attribute. | — |
| Target Row ID | A defined attribute. | — |
| Target Field | A defined attribute. | — |
| Data Type | A defined attribute. | _One of: 'string', 'number', 'boolean'._ |
| Expected String | A defined attribute. | — |
| Expected Number | A defined attribute. | — |
| Expected Boolean | True when an empty string. | — |
| Tolerance | A defined attribute. | _Numeric tolerance for floating-point comparisons. Null for exact-match._ |
| Gate Level | A defined attribute. | _One of: 'blocking', 'warning', 'info'._ |
| Is Blocking | True when the gate level is “blocking”. | — |
| Is Currently Matched | True when an empty string. | _TRUE if the most recent substrate run matched the expected value; FALSE if it didn't; null if not yet run._ |
| Valid From | A defined attribute. | _ISO date when this expected-value pin was first asserted._ |
| Valid to | A defined attribute. | _ISO date when this pin was retired/changed._ |
| Tx From | A defined attribute. | — |
| Tx to | A defined attribute. | — |
| Is Currently Valid | True when an empty string. | _TRUE if the pin is still the active expected value; FALSE if superseded by a newer pin; null if unevaluated._ |
| Description | A defined attribute. | — |
| **Temporal Snapshot** | A temporal snapshot is identified by its name and is related to optionally a source reference (its anchoring source reference). | — |
| Name | Computed as the lower-cased label with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | — |
| Label | A defined attribute. | — |
| Snapshot Date | A defined attribute. | _ISO date for the moment this snapshot captures._ |
| Description | A defined attribute. | — |
| Is Historical | True when an empty string. | _TRUE for past moments; FALSE for the current moment; null for future-projected moments._ |
| Anchoring Source Reference | A defined attribute. | _The source whose publication date pins this moment, when applicable._ |
| Valid Lower Bound Count At This Moment | The number of the temporal snapshot's lower bound validity at snapshot that are valid at this snapshots. | _How many AsymptoticLowerBound rows were considered valid at this moment, per the bitemporal columns._ |
| Best Known Lower Bound Exponent At This Moment | The largest bound exponent across the temporal snapshot's lower bound validity at snapshot that are valid at this snapshots. | _Date-only as-of rollup: MAX exponent of bounds bitemporally valid at this snapshot, including unevaluated/pending rows. Use this for forensic 'what would have looked best at this moment'._ |
| Curator Confirmed Best Known Lower Bound Exponent At This Moment | The largest bound exponent across the temporal snapshot's lower bound validity at snapshot that are curator confirmed at this snapshots. | _Stricter as-of rollup: MAX exponent of bounds BOTH bitemporally valid at this snapshot AND curator-confirmed (IsCurrentlyValid=TRUE on the bound itself). This is what the rulebook actually believed at this moment — excludes pending/unevaluated rows that just happen to be in their valid-time interval._ |
| Pending But Valid by Date Count | The number of lower bound validity at snapshot related to the temporal snapshot. | _Rows that are bitemporally valid here but the curator hasn't ruled on yet — i.e., the rulebook's open epistemic questions at this snapshot._ |
| Bounds Validated or Retracted This Moment | The number of lower bound validity at snapshot related to the temporal snapshot. | _Total junction rows for this snapshot — should equal the count of all AsymptoticLowerBound rows (a closure check)._ |
| **Lower Bound Validity At Snapshot** | A lower bound validity at snapshot is identified by its name and is related to an asymptotic lower bound and a temporal snapshot. | — |
| Name | Computed as the asymptotic lower bound minus the at minus the temporal snapshot. | — |
| Asymptotic Lower Bound | A defined attribute. | — |
| Temporal Snapshot | A defined attribute. | — |
| Bound Exponent | Taken from the linked asymptotic lower bound. | — |
| Bound Valid From | Taken from the linked asymptotic lower bound. | — |
| Bound Valid to | Taken from the linked asymptotic lower bound. | — |
| Snapshot Date | Taken from the linked temporal snapshot. | — |
| Is Valid At This Snapshot | True when an empty string. | _TRUE iff the bound's [ValidFrom, ValidTo) interval contains the SnapshotDate. Pre-computed since ERB MAXIFS doesn't support range filters; substrate-side temporal queries can re-derive this if needed._ |
| Bound is Currently Valid | True when the linked asymptotic lower bound is currently valid. | _Surfaces the bound's curator-set IsCurrentlyValid onto the junction. Distinguishes 'bitemporally valid by date' from 'curator-confirmed valid'._ |
| Is Curator Confirmed At This Snapshot | True when all of the following hold: the valid at this snapshot flag is set and the bound is currently valid is true. | _Stricter than IsValidAtThisSnapshot: TRUE iff the bound is BOTH within its valid-time interval at this snapshot AND has been curator-confirmed (IsCurrentlyValid=TRUE). Excludes pending/unevaluated rows from 'as-of' rollups._ |
| Description | A defined attribute. | _Free-text annotation for this row._ |

## 2 Fact Types

- a **point** references exactly one **context**
- a **point set** references exactly one **point set member**
- a **point set** references exactly one **point pair**
- a **point set member** references exactly one **point set**
- a **point set member** references exactly one **point**
- a **point pair** references exactly one **point set**
- a **point pair** references exactly one **point**
- a **unit distance graph** references exactly one **point set**
- a **prime ideal** references exactly one **number field**
- a **minkowski lattice** references exactly one **number field**
- a **minkowski lattice** references exactly one **planar projection**
- a **short vector** references exactly one **minkowski lattice**
- a **construction family** may reference one **number field**
- a **construction family** may reference one **minkowski lattice**
- a **construction family** references exactly one **construction instance**
- a **construction instance** references exactly one **construction family**
- a **construction instance** references exactly one **point set**
- a **growth sequence** references exactly one **construction family**
- an **asymptotic function** references exactly one **asymptotic lower bound**
- an **asymptotic lower bound** references exactly one **asymptotic function**
- an **asymptotic lower bound** may reference one **growth sequence**
- a **theorem** references exactly one **asymptotic function**
- a **theorem** references exactly one **asymptotic lower bound**
- a **metric** may reference one **context**
- a **field embedding** references exactly one **number field**
- a **minkowski embedding** references exactly one **number field**
- a **minkowski embedding** may reference one **minkowski lattice**
- a **gram matrice** references exactly one **minkowski lattice**
- a **planar projection** references exactly one **minkowski lattice**
- a **planar projection** references exactly one **context**
- a **projected short vector** references exactly one **short vector**
- a **projected short vector** references exactly one **planar projection**
- a **golod shafarevich criteria** references exactly one **number field**
- a **golod shafarevich criteria** may reference one **source reference**
- a **semantic bridge** references exactly one **domain**
- a **semantic route** references exactly one **semantic route step**
- a **semantic route step** references exactly one **semantic route**
- a **semantic route step** may reference one **semantic bridge**
- a **lemma** references exactly one **source reference**
- a **conjecture** references exactly one **asymptotic function**
- a **conjecture** may reference one **source reference**
- a **conjecture** may reference one **theorem**
- a **proof obligation** references exactly one **asymptotic lower bound**
- a **proof obligation** references exactly one **lemma**
- a **citation link** references exactly one **source reference**
- a **temporal snapshot** may reference one **source reference**
- a **lower bound validity at snapshot** references exactly one **asymptotic lower bound**
- a **lower bound validity at snapshot** references exactly one **temporal snapshot**

## 3 Operative Rules

_Operative rules state what the business **obliges**, **prohibits**, or
advises (**should**). Structural rules come from required fields and foreign keys;
semantic rules come from the Constraints table, each keyed on a boolean the rulebook
already computes (cross-referenced as DR-N in the Definitional Rules below)._

### Structural Constraints (from the schema)

- A domain **must** have a display name, a role in model, and a description.
- A context **must** have a display name, a kind, an assumptions JSON, and a description.
- A point **must** reference exactly one context.
- A point **must** have a display name, a x, and a y.
- A point set **must** reference exactly one point set member as its members.
- A point set **must** reference exactly one point pair as its pairs.
- A point set **must** have a display name and a description.
- A point set member **must** reference exactly one point set.
- A point set member **must** reference exactly one point.
- A point pair **must** reference exactly one point set.
- A point pair **must** reference exactly one point as its point a.
- A point pair **must** reference exactly one point as its point b.
- A point pair **must** have a tolerance.
- A unit distance graph **must** reference exactly one point set.
- A number field **must** reference exactly one prime ideal.
- A number field **must** have a display name, a defining polynomial, a degree, a discriminant, a class number, a signature real embeddings, and a signature complex embeddings.
- A prime ideal **must** reference exactly one number field.
- A prime ideal **must** have a generator description, a norm, and a norm threshold.
- A minkowski lattice **must** reference exactly one number field.
- A minkowski lattice **must** reference exactly one short vector.
- A minkowski lattice **must** reference exactly one planar projection as its projections.
- A minkowski lattice **must** have a determinant, a gram matrix JSON, and a short vector threshold squared.
- A short vector **must** reference exactly one minkowski lattice.
- A short vector **must** have a coords JSON and a norm squared.
- A construction family **must** reference exactly one construction instance as its instances.
- A construction family **must** have a display name and a description of nth member.
- A construction instance **must** reference exactly one construction family.
- A construction instance **must** reference exactly one point set.
- A construction instance **must** have a param n.
- A growth sequence **must** reference exactly one construction family.
- An asymptotic function **must** reference exactly one asymptotic lower bound as its lower bounds.
- An asymptotic function **must** have a display name and a definition text.
- An asymptotic lower bound **must** reference exactly one asymptotic function.
- An asymptotic lower bound **must** have a display name, an exponent, a coefficient, a statement text, a source citation, a valid from, a tx from, and a proof pathway, and record whether it is an explicit.
- A theorem **must** reference exactly one asymptotic function.
- A theorem **must** reference exactly one asymptotic lower bound as its anchored lower bound.
- A theorem **must** have a display name, a statement text, a proof citation, a claimed exponent, a valid from, and a tx from, and record whether it is an anchor and whether it is a proven.
- A metric **must** have a display name, a metric kind, and a definition text.
- A field embedding **must** reference exactly one number field.
- A field embedding **must** have an embedding type, an index in signature, and a target space dim.
- A minkowski embedding **must** reference exactly one number field.
- A minkowski embedding **must** record whether it is a canonical.
- A gram matrice **must** reference exactly one minkowski lattice.
- A gram matrice **must** have a matrix JSON, and record whether it is symmetric.
- A planar projection **must** reference exactly one minkowski lattice as its source lattice.
- A planar projection **must** reference exactly one context as its target context.
- A planar projection **must** reference exactly one projected short vector.
- A planar projection **must** have a display name, a projection kind, a scaling factor, and a rotation degrees.
- A projected short vector **must** reference exactly one short vector.
- A projected short vector **must** reference exactly one planar projection.
- A projected short vector **must** have a projected x, a projected y, and a unit tolerance.
- A golod shafarevich criteria **must** reference exactly one number field.
- A golod shafarevich criteria **must** have a minimal generator count d and a relation count r.
- A semantic bridge **must** reference exactly one domain as its from domain.
- A semantic bridge **must** reference exactly one domain as its to domain.
- A semantic bridge **must** have a display name, a bridge kind, a from concept table, and a to concept table.
- A semantic route **must** reference exactly one semantic route step as its steps.
- A semantic route **must** have a display name, a start concept, and an end concept.
- A semantic route step **must** reference exactly one semantic route.
- A semantic route step **must** have a step order, a from concept, and a to concept.
- A source reference **must** have a short label, a full citation, a valid from, and a tx from.
- A lemma **must** reference exactly one source reference.
- A lemma **must** have a label, a statement text, a feeds object table, a valid from, and a tx from.
- A mirror contract **must** have a rule label, a rule statement, a rule kind, and an applies to scope.
- A conjecture **must** reference exactly one asymptotic function as its target function.
- A conjecture **must** have a display name, a statement text, a valid from, and a tx from, and record whether it is a conjectural upper bound and whether it is a conjectural lower bound.
- A proof obligation **must** reference exactly one asymptotic lower bound as its parent bound.
- A proof obligation **must** reference exactly one lemma as its required lemma.
- A proof obligation **must** have an obligation kind, a valid from, and a tx from.
- A citation link **must** reference exactly one source reference as its citing source.
- A citation link **must** reference exactly one source reference as its cited source.
- A citation link **must** have a citation kind, a valid from, and a tx from.
- An answer key **must** have a target table, a target row ID, a target field, a data type, a gate level, a valid from, and a tx from.
- A temporal snapshot **must** have a label, a snapshot date, and a description.
- A lower bound validity at snapshot **must** reference exactly one asymptotic lower bound.
- A lower bound validity at snapshot **must** reference exactly one temporal snapshot.
- A lower bound validity at snapshot **must** record whether it is a valid at this snapshot.

## 4 Definitional Rules

_All statements express truth in the business domain; they are neither
procedures nor imperatives. "iff" is avoided in favor of "only if" so a
one-directional necessity is not mistaken for an equivalence. A
**⚠︎ mechanical** chip marks a rule whose deterministic wording is faithful
but clunky — a flag for an optional downstream reword pass, not a defect._

| ID | Declarative rule |
|----|------------------|
| **DR-1 Name** | A domain's name is computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-2 Name** | A context's name is computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-3 Name** | A point's name is computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-4 Name** | A point set's name is computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-5 Point Count** | A point set's point count is the number of point set members related to the point set. |
| **DR-6 Unit Distance Pair Count** | A point set's unit distance pair count is the number of the point set's point pairs that are unit distances. |
| **DR-7 Max Possible Edges** | A point set's max possible edges is computed as the point count times the point count minus 1 divided by 2. |
| **DR-8 Edge Density** | A point set's edge density is computed as the unit distance pair count divided by the max possible edges. |
| **DR-9 Density Exponent Estimate** | A point set's density exponent estimate is computed as the logarithm of the unit distance pair count divided by the logarithm of the point count. |
| **DR-10 Name** | A point set member's name is computed as the point set divided by the point. |
| **DR-11 Name** | A point pair's name is computed as the point set divided by the point a minus the point b. |
| **DR-12 Point AX** | A point pair's point AX is the x of the point pair's point a. |
| **DR-13 Point AY** | A point pair's point AY is the y of the point pair's point a. |
| **DR-14 Point BX** | A point pair's point BX is the x of the point pair's point b. |
| **DR-15 Point BY** | A point pair's point BY is the y of the point pair's point b. |
| **DR-16 Delta X** | A point pair's delta x is computed as the point BX minus the point AX. |
| **DR-17 Delta Y** | A point pair's delta y is computed as the point BY minus the point AY. |
| **DR-18 Delta X Squared** | A point pair's delta x squared is computed as the delta x raised to the power of 2. |
| **DR-19 Delta Y Squared** | A point pair's delta y squared is computed as the delta y raised to the power of 2. |
| **DR-20 Distance Squared** | A point pair's distance squared is computed as the delta x squared plus the delta y squared. |
| **DR-21 Distance** | A point pair's distance is computed as the square root of the distance squared. |
| **DR-22 Distance From Unit** | A point pair's distance from unit is computed as the absolute value of the distance squared minus 1. |
| **DR-23 Is Unit Distance** | A point pair is considered a unit distance if the distance from unit is at most the tolerance. |
| **DR-24 Name** | A unit distance graph's name is computed as the point set minus the graph. |
| **DR-25 Vertex Count** | A unit distance graph's vertex count is the point count of the unit distance graph's point set. |
| **DR-26 Edge Count** | A unit distance graph's edge count is the unit distance pair count of the unit distance graph's point set. |
| **DR-27 Max Possible Edges** | A unit distance graph's max possible edges is computed as the vertex count times the vertex count minus 1 divided by 2. |
| **DR-28 Edge Density** | A unit distance graph's edge density is computed as the edge count divided by the max possible edges. |
| **DR-29 Density Exponent Estimate** | A unit distance graph's density exponent estimate is computed as the logarithm of the edge count divided by the logarithm of the vertex count. |
| **DR-30 Name** | A number field's name is computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-31 Ambient Lattice Dimension** | A number field's ambient lattice dimension is computed as the signature real embeddings plus 2 times the signature complex embeddings. |
| **DR-32 Is Totally Real** | A number field is considered a totally real if the signature complex embeddings is 0. |
| **DR-33 Is Totally Complex** | A number field is considered a totally complex if the signature real embeddings is 0. |
| **DR-34 Is PID** | A number field is considered a PID if the class number is 1. |
| **DR-35 Small Norm Prime Ideal Count** | A number field's small norm prime ideal count is the number of the number field's prime ideals that are small norms. |
| **DR-36 Golod Shafarevich Passing Count** | A number field's golod shafarevich passing count is the number of the number field's golod shafarevich criteria that satisfie a golod shafarevich tower. |
| **DR-37 Satisfies Golod Shafarevich** | A number field is considered to satisfie a golod shafarevich if the golod shafarevich passing count is greater than 0. |
| **DR-38 Is Algebraic Source Candidate** | A number field is considered an algebraic source candidate if all of the following hold: the satisfies golod shafarevich flag is set and the small norm prime ideal count is greater than 0. |
| **DR-39 Field Embedding Count** | A number field's field embedding count is the number of field embeddings related to the number field. |
| **DR-40 Field Embedding Count Matches Signature** | A number field is flagged field embedding count matches signature if the field embedding count is the signature real embeddings plus the signature complex embeddings. |
| **DR-41 Name** | A prime ideal's name is computed as the number field divided by the generator description. |
| **DR-42 Is Small Norm** | A prime ideal is considered a small norm if the norm is at most the norm threshold. |
| **DR-43 Name** | A minkowski lattice's name is computed as the number field minus the lattice. |
| **DR-44 Dimension** | A minkowski lattice's dimension is the ambient lattice dimension of the minkowski lattice's number field. |
| **DR-45 Field Discriminant** | A minkowski lattice's field discriminant — taken from the linked number field. |
| **DR-46 Determinant Squared** | A minkowski lattice's determinant squared is computed as the determinant raised to the power of 2. |
| **DR-47 Absolute Field Discriminant** | A minkowski lattice's absolute field discriminant is computed as the absolute value of the field discriminant. |
| **DR-48 Determinant Squared Equals Discriminant** | A minkowski lattice is flagged determinant squared equals discriminant if the absolute value of the determinant squared minus the absolute field discriminant is less than 0.0001. |
| **DR-49 Short Vector Count** | A minkowski lattice's short vector count is the number of the minkowski lattice's short vectors that are shorts. |
| **DR-50 Source Field Degree** | A minkowski lattice's source field degree — taken from the linked number field. |
| **DR-51 Source Field Satisfies Golod Shafarevich** | A minkowski lattice's source field satisfies golod shafarevich when the linked number field is satisfies golod shafarevich. |
| **DR-52 Source Field is Algebraic Source Candidate** | A minkowski lattice's source field is algebraic source candidate when the linked number field is an algebraic source candidate. |
| **DR-53 Projection Count** | A minkowski lattice's projection count is the number of planar projections related to the minkowski lattice. |
| **DR-54 Has Any Planar Projection** | A minkowski lattice is considered to have any planar projection if the projection count is greater than 0. |
| **DR-55 Is Load Bearing for Unit Distance Construction** | A minkowski lattice is considered a load bearing for unit distance construction if all of the following hold: the source field is algebraic source candidate flag is set; the short vector count is greater than 0; and the any planar projection flag is set. |
| **DR-56 Name** | A short vector's name is computed as the minkowski lattice divided by the coords JSON. |
| **DR-57 Threshold Squared** | A short vector's threshold squared is the short vector threshold squared of the short vector's minkowski lattice. |
| **DR-58 Is Short** | A short vector is considered a short if the norm squared is at most the threshold squared. |
| **DR-59 Name** | A construction family's name is computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-60 Instance Count** | A construction family's instance count is the number of construction instances related to the construction family. |
| **DR-61 Source Field Satisfies Golod Shafarevich** | A construction family's source field satisfies golod shafarevich when the linked source number field is satisfies golod shafarevich. |
| **DR-62 Source Lattice is Load Bearing** | A construction family's source lattice is load bearing is true when the construction family's source minkowski lattice is a load bearing for unit distance construction. |
| **DR-63 Is Algebraic Construction** | A construction family is considered an algebraic construction if all of the following hold: the source field satisfies golod shafarevich flag is set and the source lattice is load bearing flag is set. |
| **DR-64 Name** | A construction instance's name is computed as the value of ConstructionFamily-nParamN. |
| **DR-65 Point Count** | A construction instance's point count — taken from the linked point set. |
| **DR-66 Edge Count** | A construction instance's edge count is the unit distance pair count of the construction instance's point set. |
| **DR-67 Density Exponent Estimate** | A construction instance's density exponent estimate — taken from the linked point set. |
| **DR-68 Param N Matches Point Count** | A construction instance is flagged param n matches point count if the param n is the point count. |
| **DR-69 Family is Algebraic** | A construction instance's family is algebraic is true when the construction instance's construction family is an algebraic construction. |
| **DR-70 Is Explicit Superlinear** | A construction instance is considered an explicit superlinear if the density exponent estimate is greater than 1. |
| **DR-71 Is Algebraic Superlinear Witness** | A construction instance is considered an algebraic superlinear witness if all of the following hold: the family is algebraic flag is set and the explicit superlinear flag is set. |
| **DR-72 Name** | A growth sequence's name is computed as the construction family minus the growth. |
| **DR-73 Observed Instance Count** | A growth sequence's observed instance count is the number of construction instances related to the growth sequence. |
| **DR-74 Max Param N** | A growth sequence's max param n is the largest param n across the construction instances related to the growth sequence. |
| **DR-75 Max Edge Count** | A growth sequence's max edge count is the largest edge count across the construction instances related to the growth sequence. |
| **DR-76 Max Observed Density Exponent Estimate** | A growth sequence's max observed density exponent estimate is the largest density exponent estimate across the construction instances related to the growth sequence. |
| **DR-77 Name** | An asymptotic function's name is computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-78 Lower Bound Count** | An asymptotic function's lower bound count is the number of asymptotic lower bounds related to the asymptotic function. |
| **DR-79 Best Known Lower Bound Exponent** | An asymptotic function's best known lower bound exponent is the largest exponent across the asymptotic lower bounds related to the asymptotic function. |
| **DR-80 Best Known Current Lower Bound Exponent** | An asymptotic function's best known current lower bound exponent is the largest exponent across the asymptotic function's asymptotic lower bounds that are currently-valid. |
| **DR-81 Retracted Lower Bound Count** | An asymptotic function's retracted lower bound count is the number of the asymptotic function's asymptotic lower bounds that are not currently-valid. |
| **DR-82 Max Overclaimed Exponent** | An asymptotic function's max overclaimed exponent is the largest exponent across the asymptotic function's asymptotic lower bounds that are not currently-valid. |
| **DR-83 Name** | An asymptotic lower bound's name is computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-84 Is Superlinear** | An asymptotic lower bound is considered a superlinear if the exponent is greater than 1. |
| **DR-85 Exceeds Trivial Linear Bound** | An asymptotic lower bound is considered to exceed a trivial linear bound if the exponent is at least 1. |
| **DR-86 Witnessed by Max Density Exponent** | An asymptotic lower bound's witnessed by max density exponent is the max observed density exponent estimate of the asymptotic lower bound's growth sequence. |
| **DR-87 Witness Consistent** | An asymptotic lower bound is considered to witnes a consistent if the witnessed by max density exponent is at least the exponent. |
| **DR-88 Witness Source Family** | An asymptotic lower bound's witness source family is the construction family of the asymptotic lower bound's growth sequence. |
| **DR-89 Witness Family is Algebraic** | An asymptotic lower bound's witness family is algebraic is true when the asymptotic lower bound's witness source family is an algebraic construction. |
| **DR-90 Is Algebraically Anchored** | An asymptotic lower bound is considered algebraically-anchored if all of the following hold: the witness consistent flag is set; the witness family is algebraic flag is set; and the superlinear flag is set. |
| **DR-91 Obligation Count** | An asymptotic lower bound's obligation count is the number of proof obligations related to the asymptotic lower bound. |
| **DR-92 Satisfied Obligation Count** | An asymptotic lower bound's satisfied obligation count is the number of the asymptotic lower bound's proof obligations that are satisfied. |
| **DR-93 Open Obligation Count** | An asymptotic lower bound's open obligation count is the number of the asymptotic lower bound's proof obligations that are not satisfied. |
| **DR-94 All Obligations Satisfied** | An asymptotic lower bound is flagged all obligations satisfied if the satisfied obligation count is the obligation count. |
| **DR-95 Is Algebraic Tower Proof** | An asymptotic lower bound is considered an algebraic tower proof if the proof pathway is “algebraic-tower”. |
| **DR-96 Is Combinatorial Proof** | An asymptotic lower bound is considered a combinatorial proof if the proof pathway is “combinatorial-pigeonhole”. |
| **DR-97 Is Auditable Via Its Pathway** | An asymptotic lower bound is considered an auditable via its pathway if at least one of the following holds: all of the following hold: the algebraic tower proof flag is set and the algebraically anchored flag is set; all of the following hold: the combinatorial proof flag is set; the all obligations satisfied flag is set; and the witness consistent flag is set; or all of the following hold: the proof pathway is “witness-only” and the witness consistent flag is set. |
| **DR-98 Name** | A theorem's name is computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-99 Anchored Bound Exponent** | A theorem's anchored bound exponent — taken from the linked anchored lower bound. |
| **DR-100 Anchored Bound is Superlinear** | A theorem's anchored bound is superlinear when the linked anchored lower bound is a superlinear. |
| **DR-101 Anchor Matches Bound Exponent** | A theorem is flagged anchor matches bound exponent if the absolute value of the claimed exponent minus the anchored bound exponent is less than 0.0001. |
| **DR-102 Anchored Bound Witness Consistent** | A theorem's anchored bound witness consistent when the linked anchored lower bound is witness consistent. |
| **DR-103 Anchored Bound is Algebraically Anchored** | A theorem's anchored bound is algebraically anchored when the linked anchored lower bound is algebraically anchored. |
| **DR-104 Algebraic Chain Closed** | A theorem is flagged algebraic chain closed if all of the following hold: the anchor matches bound exponent flag is set; the anchored bound is superlinear flag is set; the anchored bound witness consistent flag is set; and the anchored bound is algebraically anchored flag is set. |
| **DR-105 Applies to Function** | A theorem's applies to function is the display name of the theorem's asymptotic function. |
| **DR-106 Is Unit Distance Theorem** | A theorem is considered a unit distance theorem if the asymptotic function is “u-n”. |
| **DR-107 Anchored Bound All Obligations Satisfied** | A theorem's anchored bound all obligations satisfied when the linked anchored lower bound is all obligations satisfied. |
| **DR-108 Anchored Bound Open Obligation Count** | A theorem's anchored bound open obligation count — taken from the linked anchored lower bound. |
| **DR-109 Fully Audited and Closed** | A theorem is flagged fully audited and closed if all of the following hold: the algebraic chain closed flag is set and the anchored bound all obligations satisfied flag is set. |
| **DR-110 Anchored Bound is Currently Valid** | A theorem's anchored bound is currently valid when the linked anchored lower bound is currently valid. |
| **DR-111 Is Historically Anchored** | A theorem is considered historically-anchored if all of the following hold: the is currently valid is true and the anchored bound is currently valid is true. |
| **DR-112 Anchored Bound is Auditable Via Its Pathway** | A theorem's anchored bound is auditable via its pathway when the linked anchored lower bound is an auditable via its pathway. |
| **DR-113 Is Audited and Closed** | A theorem is considered audited-and-closed if all of the following hold: the historically anchored flag is set and the anchored bound is auditable via its pathway flag is set. |
| **DR-114 Name** | A metric's name is computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-115 Is Euclidean** | A metric is considered an euclidean if the metric kind is “euclidean”. |
| **DR-116 Is Lattice Gram** | A metric is considered a lattice gram if the metric kind is “lattice-gram”. |
| **DR-117 Name** | A field embedding's name is computed as the number field divided by the embedding type minus the index in signature. |
| **DR-118 Is Real Embedding** | A field embedding is considered real-embedding if the target space dim is 1. |
| **DR-119 Is Complex Embedding** | A field embedding is considered complex-embedding if the target space dim is 2. |
| **DR-120 Name** | A minkowski embedding's name is computed as the number field minus the minkowski minus the embedding. |
| **DR-121 Ambient Dimension** | A minkowski embedding's ambient dimension is the ambient lattice dimension of the minkowski embedding's number field. |
| **DR-122 Target Lattice Dimension** | A minkowski embedding's target lattice dimension — taken from the linked target lattice. |
| **DR-123 Dimension Match** | A minkowski embedding is flagged dimension match if the ambient dimension is the target lattice dimension. |
| **DR-124 Name** | A gram matrice's name is computed as the minkowski lattice minus the gram. |
| **DR-125 Dimension** | A gram matrice's dimension — taken from the linked minkowski lattice. |
| **DR-126 Lattice Determinant** | A gram matrice's lattice determinant — taken from the linked minkowski lattice. |
| **DR-127 Encodes Valid Lattice Metric** | A gram matrice is considered to encode valid lattice metric if all of the following hold: the symmetric flag is set and the positive definite flag is set. |
| **DR-128 Name** | A planar projection's name is computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-129 Is Scaling Preserving** | A planar projection is considered scaling-preserving if the scaling factor is 1. |
| **DR-130 Projected Short Vector Count** | A planar projection's projected short vector count is the number of projected short vectors related to the planar projection. |
| **DR-131 Unit Distance Vector Count** | A planar projection's unit distance vector count is the number of the planar projection's projected short vectors that project to unit distance vector. |
| **DR-132 Unit Distance Vector Yield** | A planar projection's unit distance vector yield is computed as the unit distance vector count divided by the projected short vector count. |
| **DR-133 Source Lattice is Load Bearing** | A planar projection's source lattice is load bearing is true when the planar projection's source lattice is a load bearing for unit distance construction. |
| **DR-134 Name** | A projected short vector's name is computed as the short vector divided by the planar projection. |
| **DR-135 Projected X Squared** | A projected short vector's projected x squared is computed as the projected x raised to the power of 2. |
| **DR-136 Projected Y Squared** | A projected short vector's projected y squared is computed as the projected y raised to the power of 2. |
| **DR-137 Projected Norm Squared** | A projected short vector's projected norm squared is computed as the projected x squared plus the projected y squared. |
| **DR-138 Source Norm Squared** | A projected short vector's source norm squared — taken from the linked short vector. |
| **DR-139 Source is Short** | A projected short vector's source is short is true when the projected short vector's short vector is a short. |
| **DR-140 Distance Squared From Unit** | A projected short vector's distance squared from unit is computed as the absolute value of the projected norm squared minus 1. |
| **DR-141 Projects to Unit Distance Vector** | A projected short vector is considered to project to unit distance vector if the distance squared from unit is at most the unit tolerance. |
| **DR-142 Is Valid Witness** | A projected short vector is considered a valid witness if all of the following hold: the source is short flag is set and the projects to unit distance vector flag is set. |
| **DR-143 Norm Preserved Under Projection** | A projected short vector is flagged norm preserved under projection if the absolute value of the source norm squared minus the projected norm squared is less than the unit tolerance. |
| **DR-144 Name** | A golod shafarevich criteria's name is computed as the number field minus the gs. |
| **DR-145 Field Degree** | A golod shafarevich criteria's field degree — taken from the linked number field. |
| **DR-146 Criterion Threshold** | A golod shafarevich criteria's criterion threshold is computed as the minimal generator count d raised to the power of 2 divided by 4. |
| **DR-147 Relation Count Exceeds Threshold** | A golod shafarevich criteria is flagged relation count exceeds threshold if the relation count r is greater than the criterion threshold. |
| **DR-148 Satisfies Golod Shafarevich Tower** | A golod shafarevich criteria is considered to satisfie a golod shafarevich tower only if the golod shafarevich criteria is flagged relation count exceeds threshold. |
| **DR-149 Name** | A semantic bridge's name is computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-150 Is Analogy** | A semantic bridge is considered an analogy if the bridge kind is “analogy”. |
| **DR-151 Name** | A semantic route's name is computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-152 Step Count** | A semantic route's step count is the number of semantic route steps related to the semantic route. |
| **DR-153 Validated Step Count** | A semantic route's validated step count is the number of the semantic route's semantic route steps that are validated. |
| **DR-154 All Steps Validated** | A semantic route is flagged all steps validated if the validated step count is the step count. |
| **DR-155 Name** | A semantic route step's name is computed as the semantic route minus the step order. |
| **DR-156 Bridge is Load Bearing** | A semantic route step's bridge is load bearing when the linked bridge used is load bearing. |
| **DR-157 Name** | A source reference's name is computed as the lower-cased short label with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-158 Lemma Count** | A source reference's lemma count is the number of lemmas related to the source reference. |
| **DR-159 Outbound Citation Count** | A source reference's outbound citation count is the number of citation links related to the source reference. |
| **DR-160 Inbound Citation Count** | A source reference's inbound citation count is the number of citation links related to the source reference. |
| **DR-161 Name** | A lemma's name is computed as the lower-cased label with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-162 Obligation Count** | A lemma's obligation count is the number of proof obligations related to the lemma. |
| **DR-163 Name** | A mirror contract's name is computed as the lower-cased rule label with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-164 Is Rejection Rule** | A mirror contract is considered a rejection rule if the rule kind is “reject”. |
| **DR-165 Name** | A conjecture's name is computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-166 Is Still Open** | A conjecture is considered still-open if the is resolved is false. |
| **DR-167 Name** | A proof obligation's name is computed as the parent bound divided by the required lemma. |
| **DR-168 Is Necessary** | A proof obligation is considered a necessary if the obligation kind is “necessary”. |
| **DR-169 Is Lemma Loaded** | A proof obligation's is lemma loaded when the linked required lemma is loaded. |
| **DR-170 Is Lemma Load Bearing** | A proof obligation's is lemma load bearing when the linked required lemma is load bearing. |
| **DR-171 Bound Claimed Exponent** | A proof obligation's bound claimed exponent — taken from the linked parent bound. |
| **DR-172 Is Currently Open** | A proof obligation is considered currently-open if the is satisfied is false. |
| **DR-173 Name** | A citation link's name is computed as the citing source minus the cites minus the cited source. |
| **DR-174 Is Dependency** | A citation link is considered a dependency if the citation kind is “depends-on”. |
| **DR-175 Is Improvement** | A citation link is considered an improvement if the citation kind is “improves”. |
| **DR-176 Citing Year** | A citation link's citing year — taken from the linked citing source. |
| **DR-177 Cited Year** | A citation link's cited year — taken from the linked cited source. |
| **DR-178 Name** | An answer key's name is computed as the target table divided by the target row ID divided by the target field. |
| **DR-179 Is Blocking** | An answer key is considered blocking if the gate level is “blocking”. |
| **DR-180 Name** | A temporal snapshot's name is computed as the lower-cased label with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-181 Valid Lower Bound Count At This Moment** | A temporal snapshot's valid lower bound count at this moment is the number of the temporal snapshot's lower bound validity at snapshot that are valid at this snapshots. |
| **DR-182 Best Known Lower Bound Exponent At This Moment** | A temporal snapshot's best known lower bound exponent at this moment is the largest bound exponent across the temporal snapshot's lower bound validity at snapshot that are valid at this snapshots. |
| **DR-183 Curator Confirmed Best Known Lower Bound Exponent At This Moment** | A temporal snapshot's curator confirmed best known lower bound exponent at this moment is the largest bound exponent across the temporal snapshot's lower bound validity at snapshot that are curator confirmed at this snapshots. |
| **DR-184 Pending But Valid by Date Count** | A temporal snapshot's pending but valid by date count is the number of lower bound validity at snapshot related to the temporal snapshot. |
| **DR-185 Bounds Validated or Retracted This Moment** | A temporal snapshot's bounds validated or retracted this moment is the number of lower bound validity at snapshot related to the temporal snapshot. |
| **DR-186 Name** | A lower bound validity at snapshot's name is computed as the asymptotic lower bound minus the at minus the temporal snapshot. |
| **DR-187 Bound Exponent** | A lower bound validity at snapshot's bound exponent — taken from the linked asymptotic lower bound. |
| **DR-188 Bound Valid From** | A lower bound validity at snapshot's bound valid from — taken from the linked asymptotic lower bound. |
| **DR-189 Bound Valid to** | A lower bound validity at snapshot's bound valid to — taken from the linked asymptotic lower bound. |
| **DR-190 Snapshot Date** | A lower bound validity at snapshot's snapshot date — taken from the linked temporal snapshot. |
| **DR-191 Bound is Currently Valid** | A lower bound validity at snapshot's bound is currently valid when the linked asymptotic lower bound is currently valid. |
| **DR-192 Is Curator Confirmed At This Snapshot** | A lower bound validity at snapshot is considered a curator confirmed at this snapshot if all of the following hold: the valid at this snapshot flag is set and the bound is currently valid is true. |

## 5 Traceability to Schema

_The expression column is the rule's definition in RuleSpeak® notation —
the same logic the rulebook stores, written for a business reader._

| Schema element | Kind | Expression |
|----------------|------|------------|
| **Domains.Name** | formula | `Replace(Lower(DisplayName), " ", "-")` |
| **Contexts.Name** | formula | `Replace(Lower(DisplayName), " ", "-")` |
| **Points.Name** | formula | `Replace(Lower(DisplayName), " ", "-")` |
| **PointSets.Name** | formula | `Replace(Lower(DisplayName), " ", "-")` |
| **PointSets.PointCount** | rollup | `Count(PointSetMembers via PointSet)` |
| **PointSets.UnitDistancePairCount** | rollup | `Count(PointPairs via PointSet)` |
| **PointSets.MaxPossibleEdges** | formula | `PointCount * PointCount - 1 / 2` |
| **PointSets.EdgeDensity** | formula | `UnitDistancePairCount / MaxPossibleEdges` |
| **PointSets.DensityExponentEstimate** | formula | `Log(UnitDistancePairCount) / Log(PointCount)` |
| **PointSetMembers.Name** | formula | `PointSet / Point` |
| **PointPairs.Name** | formula | `PointSet / PointA - PointB` |
| **PointPairs.PointAX** | lookup | `Lookup(Points.X via PointA)` |
| **PointPairs.PointAY** | lookup | `Lookup(Points.Y via PointA)` |
| **PointPairs.PointBX** | lookup | `Lookup(Points.X via PointB)` |
| **PointPairs.PointBY** | lookup | `Lookup(Points.Y via PointB)` |
| **PointPairs.DeltaX** | formula | `PointBX - PointAX` |
| **PointPairs.DeltaY** | formula | `PointBY - PointAY` |
| **PointPairs.DeltaXSquared** | formula | `Power(DeltaX, 2)` |
| **PointPairs.DeltaYSquared** | formula | `Power(DeltaY, 2)` |
| **PointPairs.DistanceSquared** | formula | `DeltaXSquared + DeltaYSquared` |
| **PointPairs.Distance** | formula | `Sqrt(DistanceSquared)` |
| **PointPairs.DistanceFromUnit** | formula | `Abs(DistanceSquared - 1)` |
| **PointPairs.IsUnitDistance** | formula | `DistanceFromUnit <= Tolerance` |
| **UnitDistanceGraphs.Name** | formula | `PointSet - graph` |
| **UnitDistanceGraphs.VertexCount** | lookup | `Lookup(PointSets.PointCount via PointSet)` |
| **UnitDistanceGraphs.EdgeCount** | lookup | `Lookup(PointSets.UnitDistancePairCount via PointSet)` |
| **UnitDistanceGraphs.MaxPossibleEdges** | formula | `VertexCount * VertexCount - 1 / 2` |
| **UnitDistanceGraphs.EdgeDensity** | formula | `EdgeCount / MaxPossibleEdges` |
| **UnitDistanceGraphs.DensityExponentEstimate** | formula | `Log(EdgeCount) / Log(VertexCount)` |
| **NumberFields.Name** | formula | `Replace(Lower(DisplayName), " ", "-")` |
| **NumberFields.AmbientLatticeDimension** | formula | `SignatureRealEmbeddings + 2 * SignatureComplexEmbeddings` |
| **NumberFields.IsTotallyReal** | formula | `SignatureComplexEmbeddings = 0` |
| **NumberFields.IsTotallyComplex** | formula | `SignatureRealEmbeddings = 0` |
| **NumberFields.IsPID** | formula | `ClassNumber = 1` |
| **NumberFields.SmallNormPrimeIdealCount** | rollup | `Count(PrimeIdeals via NumberField)` |
| **NumberFields.GolodShafarevichPassingCount** | rollup | `Count(GolodShafarevichCriteria via NumberField)` |
| **NumberFields.SatisfiesGolodShafarevich** | formula | `GolodShafarevichPassingCount > 0` |
| **NumberFields.IsAlgebraicSourceCandidate** | formula | `And(SatisfiesGolodShafarevich, SmallNormPrimeIdealCount > 0)` |
| **NumberFields.FieldEmbeddingCount** | rollup | `Count(FieldEmbeddings via NumberField)` |
| **NumberFields.FieldEmbeddingCountMatchesSignature** | formula | `FieldEmbeddingCount = SignatureRealEmbeddings + SignatureComplexEmbeddings` |
| **PrimeIdeals.Name** | formula | `NumberField / GeneratorDescription` |
| **PrimeIdeals.IsSmallNorm** | formula | `Norm <= NormThreshold` |
| **MinkowskiLattices.Name** | formula | `NumberField - lattice` |
| **MinkowskiLattices.Dimension** | lookup | `Lookup(NumberFields.AmbientLatticeDimension via NumberField)` |
| **MinkowskiLattices.FieldDiscriminant** | lookup | `Lookup(NumberFields.Discriminant via NumberField)` |
| **MinkowskiLattices.DeterminantSquared** | formula | `Power(Determinant, 2)` |
| **MinkowskiLattices.AbsoluteFieldDiscriminant** | formula | `Abs(FieldDiscriminant)` |
| **MinkowskiLattices.DeterminantSquaredEqualsDiscriminant** | formula | `Abs(DeterminantSquared - AbsoluteFieldDiscriminant) < 0.0001` |
| **MinkowskiLattices.ShortVectorCount** | rollup | `Count(ShortVectors via MinkowskiLattice)` |
| **MinkowskiLattices.SourceFieldDegree** | lookup | `Lookup(NumberFields.Degree via NumberField)` |
| **MinkowskiLattices.SourceFieldSatisfiesGolodShafarevich** | lookup | `Lookup(NumberFields.SatisfiesGolodShafarevich via NumberField)` |
| **MinkowskiLattices.SourceFieldIsAlgebraicSourceCandidate** | lookup | `Lookup(NumberFields.IsAlgebraicSourceCandidate via NumberField)` |
| **MinkowskiLattices.ProjectionCount** | rollup | `Count(PlanarProjections via SourceLattice)` |
| **MinkowskiLattices.HasAnyPlanarProjection** | formula | `ProjectionCount > 0` |
| **MinkowskiLattices.IsLoadBearingForUnitDistanceConstruction** | formula | `And(SourceFieldIsAlgebraicSourceCandidate, ShortVectorCount > 0, HasAnyPlanarProjection)` |
| **ShortVectors.Name** | formula | `MinkowskiLattice / CoordsJSON` |
| **ShortVectors.ThresholdSquared** | lookup | `Lookup(MinkowskiLattices.ShortVectorThresholdSquared via MinkowskiLattice)` |
| **ShortVectors.IsShort** | formula | `NormSquared <= ThresholdSquared` |
| **ConstructionFamilies.Name** | formula | `Replace(Lower(DisplayName), " ", "-")` |
| **ConstructionFamilies.InstanceCount** | rollup | `Count(ConstructionInstances via ConstructionFamily)` |
| **ConstructionFamilies.SourceFieldSatisfiesGolodShafarevich** | lookup | `Lookup(NumberFields.SatisfiesGolodShafarevich via SourceNumberField)` |
| **ConstructionFamilies.SourceLatticeIsLoadBearing** | lookup | `Lookup(MinkowskiLattices.IsLoadBearingForUnitDistanceConstruction via SourceMinkowskiLattice)` |
| **ConstructionFamilies.IsAlgebraicConstruction** | formula | `And(SourceFieldSatisfiesGolodShafarevich, SourceLatticeIsLoadBearing)` |
| **ConstructionInstances.Name** | formula | `ConstructionFamily-nParamN` |
| **ConstructionInstances.PointCount** | lookup | `Lookup(PointSets.PointCount via PointSet)` |
| **ConstructionInstances.EdgeCount** | lookup | `Lookup(PointSets.UnitDistancePairCount via PointSet)` |
| **ConstructionInstances.DensityExponentEstimate** | lookup | `Lookup(PointSets.DensityExponentEstimate via PointSet)` |
| **ConstructionInstances.ParamNMatchesPointCount** | formula | `ParamN = PointCount` |
| **ConstructionInstances.FamilyIsAlgebraic** | lookup | `Lookup(ConstructionFamilies.IsAlgebraicConstruction via ConstructionFamily)` |
| **ConstructionInstances.IsExplicitSuperlinear** | formula | `DensityExponentEstimate > 1` |
| **ConstructionInstances.IsAlgebraicSuperlinearWitness** | formula | `And(FamilyIsAlgebraic, IsExplicitSuperlinear)` |
| **GrowthSequences.Name** | formula | `ConstructionFamily - growth` |
| **GrowthSequences.ObservedInstanceCount** | rollup | `Count(ConstructionInstances via ConstructionFamily)` |
| **GrowthSequences.MaxParamN** | rollup | `Max(ConstructionInstances.ParamN via ConstructionFamily)` |
| **GrowthSequences.MaxEdgeCount** | rollup | `Max(ConstructionInstances.EdgeCount via ConstructionFamily)` |
| **GrowthSequences.MaxObservedDensityExponentEstimate** | rollup | `Max(ConstructionInstances.DensityExponentEstimate via ConstructionFamily)` |
| **AsymptoticFunctions.Name** | formula | `Replace(Lower(DisplayName), " ", "-")` |
| **AsymptoticFunctions.LowerBoundCount** | rollup | `Count(AsymptoticLowerBounds via AsymptoticFunction)` |
| **AsymptoticFunctions.BestKnownLowerBoundExponent** | rollup | `Max(AsymptoticLowerBounds.Exponent via AsymptoticFunction)` |
| **AsymptoticFunctions.BestKnownCurrentLowerBoundExponent** | rollup | `Max(AsymptoticLowerBounds.Exponent via AsymptoticFunction)` |
| **AsymptoticFunctions.RetractedLowerBoundCount** | rollup | `Count(AsymptoticLowerBounds via AsymptoticFunction)` |
| **AsymptoticFunctions.MaxOverclaimedExponent** | rollup | `Max(AsymptoticLowerBounds.Exponent via AsymptoticFunction)` |
| **AsymptoticLowerBounds.Name** | formula | `Replace(Lower(DisplayName), " ", "-")` |
| **AsymptoticLowerBounds.IsSuperlinear** | formula | `Exponent > 1` |
| **AsymptoticLowerBounds.ExceedsTrivialLinearBound** | formula | `Exponent >= 1` |
| **AsymptoticLowerBounds.WitnessedByMaxDensityExponent** | lookup | `Lookup(GrowthSequences.MaxObservedDensityExponentEstimate via GrowthSequence)` |
| **AsymptoticLowerBounds.WitnessConsistent** | formula | `WitnessedByMaxDensityExponent >= Exponent` |
| **AsymptoticLowerBounds.WitnessSourceFamily** | lookup | `Lookup(GrowthSequences.ConstructionFamily via GrowthSequence)` |
| **AsymptoticLowerBounds.WitnessFamilyIsAlgebraic** | lookup | `Lookup(ConstructionFamilies.IsAlgebraicConstruction via WitnessSourceFamily)` |
| **AsymptoticLowerBounds.IsAlgebraicallyAnchored** | formula | `And(WitnessConsistent, WitnessFamilyIsAlgebraic, IsSuperlinear)` |
| **AsymptoticLowerBounds.ObligationCount** | rollup | `Count(ProofObligations via ParentBound)` |
| **AsymptoticLowerBounds.SatisfiedObligationCount** | rollup | `Count(ProofObligations via ParentBound)` |
| **AsymptoticLowerBounds.OpenObligationCount** | rollup | `Count(ProofObligations via ParentBound)` |
| **AsymptoticLowerBounds.AllObligationsSatisfied** | formula | `SatisfiedObligationCount = ObligationCount` |
| **AsymptoticLowerBounds.IsAlgebraicTowerProof** | formula | `ProofPathway = "algebraic-tower"` |
| **AsymptoticLowerBounds.IsCombinatorialProof** | formula | `ProofPathway = "combinatorial-pigeonhole"` |
| **AsymptoticLowerBounds.IsAuditableViaItsPathway** | formula | `Or(And(IsAlgebraicTowerProof, IsAlgebraicallyAnchored), And(IsCombinatorialProof, AllObligationsSatisfied, WitnessConsistent), And(ProofPathway = "witness-only", WitnessConsistent))` |
| **Theorems.Name** | formula | `Replace(Lower(DisplayName), " ", "-")` |
| **Theorems.AnchoredBoundExponent** | lookup | `Lookup(AsymptoticLowerBounds.Exponent via AnchoredLowerBound)` |
| **Theorems.AnchoredBoundIsSuperlinear** | lookup | `Lookup(AsymptoticLowerBounds.IsSuperlinear via AnchoredLowerBound)` |
| **Theorems.AnchorMatchesBoundExponent** | formula | `Abs(ClaimedExponent - AnchoredBoundExponent) < 0.0001` |
| **Theorems.AnchoredBoundWitnessConsistent** | lookup | `Lookup(AsymptoticLowerBounds.WitnessConsistent via AnchoredLowerBound)` |
| **Theorems.AnchoredBoundIsAlgebraicallyAnchored** | lookup | `Lookup(AsymptoticLowerBounds.IsAlgebraicallyAnchored via AnchoredLowerBound)` |
| **Theorems.AlgebraicChainClosed** | formula | `And(AnchorMatchesBoundExponent, AnchoredBoundIsSuperlinear, AnchoredBoundWitnessConsistent, AnchoredBoundIsAlgebraicallyAnchored)` |
| **Theorems.AppliesToFunction** | lookup | `Lookup(AsymptoticFunctions.DisplayName via AsymptoticFunction)` |
| **Theorems.IsUnitDistanceTheorem** | formula | `AsymptoticFunction = "u-n"` |
| **Theorems.AnchoredBoundAllObligationsSatisfied** | lookup | `Lookup(AsymptoticLowerBounds.AllObligationsSatisfied via AnchoredLowerBound)` |
| **Theorems.AnchoredBoundOpenObligationCount** | lookup | `Lookup(AsymptoticLowerBounds.OpenObligationCount via AnchoredLowerBound)` |
| **Theorems.FullyAuditedAndClosed** | formula | `And(AlgebraicChainClosed, AnchoredBoundAllObligationsSatisfied)` |
| **Theorems.AnchoredBoundIsCurrentlyValid** | lookup | `Lookup(AsymptoticLowerBounds.IsCurrentlyValid via AnchoredLowerBound)` |
| **Theorems.IsHistoricallyAnchored** | formula | `And(IsCurrentlyValid = TRUE, AnchoredBoundIsCurrentlyValid = TRUE)` |
| **Theorems.AnchoredBoundIsAuditableViaItsPathway** | lookup | `Lookup(AsymptoticLowerBounds.IsAuditableViaItsPathway via AnchoredLowerBound)` |
| **Theorems.IsAuditedAndClosed** | formula | `And(IsHistoricallyAnchored, AnchoredBoundIsAuditableViaItsPathway)` |
| **Metrics.Name** | formula | `Replace(Lower(DisplayName), " ", "-")` |
| **Metrics.IsEuclidean** | formula | `MetricKind = "euclidean"` |
| **Metrics.IsLatticeGram** | formula | `MetricKind = "lattice-gram"` |
| **FieldEmbeddings.Name** | formula | `NumberField / EmbeddingType - IndexInSignature` |
| **FieldEmbeddings.IsRealEmbedding** | formula | `TargetSpaceDim = 1` |
| **FieldEmbeddings.IsComplexEmbedding** | formula | `TargetSpaceDim = 2` |
| **MinkowskiEmbeddings.Name** | formula | `NumberField - minkowski - embedding` |
| **MinkowskiEmbeddings.AmbientDimension** | lookup | `Lookup(NumberFields.AmbientLatticeDimension via NumberField)` |
| **MinkowskiEmbeddings.TargetLatticeDimension** | lookup | `Lookup(MinkowskiLattices.Dimension via TargetLattice)` |
| **MinkowskiEmbeddings.DimensionMatch** | formula | `AmbientDimension = TargetLatticeDimension` |
| **GramMatrices.Name** | formula | `MinkowskiLattice - gram` |
| **GramMatrices.Dimension** | lookup | `Lookup(MinkowskiLattices.Dimension via MinkowskiLattice)` |
| **GramMatrices.LatticeDeterminant** | lookup | `Lookup(MinkowskiLattices.Determinant via MinkowskiLattice)` |
| **GramMatrices.EncodesValidLatticeMetric** | formula | `And(IsSymmetric, IsPositiveDefinite)` |
| **PlanarProjections.Name** | formula | `Replace(Lower(DisplayName), " ", "-")` |
| **PlanarProjections.IsScalingPreserving** | formula | `ScalingFactor = 1` |
| **PlanarProjections.ProjectedShortVectorCount** | rollup | `Count(ProjectedShortVectors via PlanarProjection)` |
| **PlanarProjections.UnitDistanceVectorCount** | rollup | `Count(ProjectedShortVectors via PlanarProjection)` |
| **PlanarProjections.UnitDistanceVectorYield** | formula | `UnitDistanceVectorCount / ProjectedShortVectorCount` |
| **PlanarProjections.SourceLatticeIsLoadBearing** | lookup | `Lookup(MinkowskiLattices.IsLoadBearingForUnitDistanceConstruction via SourceLattice)` |
| **ProjectedShortVectors.Name** | formula | `ShortVector / PlanarProjection` |
| **ProjectedShortVectors.ProjectedXSquared** | formula | `Power(ProjectedX, 2)` |
| **ProjectedShortVectors.ProjectedYSquared** | formula | `Power(ProjectedY, 2)` |
| **ProjectedShortVectors.ProjectedNormSquared** | formula | `ProjectedXSquared + ProjectedYSquared` |
| **ProjectedShortVectors.SourceNormSquared** | lookup | `Lookup(ShortVectors.NormSquared via ShortVector)` |
| **ProjectedShortVectors.SourceIsShort** | lookup | `Lookup(ShortVectors.IsShort via ShortVector)` |
| **ProjectedShortVectors.DistanceSquaredFromUnit** | formula | `Abs(ProjectedNormSquared - 1)` |
| **ProjectedShortVectors.ProjectsToUnitDistanceVector** | formula | `DistanceSquaredFromUnit <= UnitTolerance` |
| **ProjectedShortVectors.IsValidWitness** | formula | `And(SourceIsShort, ProjectsToUnitDistanceVector)` |
| **ProjectedShortVectors.NormPreservedUnderProjection** | formula | `Abs(SourceNormSquared - ProjectedNormSquared) < UnitTolerance` |
| **GolodShafarevichCriteria.Name** | formula | `NumberField - gs` |
| **GolodShafarevichCriteria.FieldDegree** | lookup | `Lookup(NumberFields.Degree via NumberField)` |
| **GolodShafarevichCriteria.CriterionThreshold** | formula | `Power(MinimalGeneratorCount_d, 2) / 4` |
| **GolodShafarevichCriteria.RelationCountExceedsThreshold** | formula | `RelationCount_r > CriterionThreshold` |
| **GolodShafarevichCriteria.SatisfiesGolodShafarevichTower** | formula | `RelationCountExceedsThreshold` |
| **SemanticBridges.Name** | formula | `Replace(Lower(DisplayName), " ", "-")` |
| **SemanticBridges.IsAnalogy** | formula | `BridgeKind = "analogy"` |
| **SemanticRoutes.Name** | formula | `Replace(Lower(DisplayName), " ", "-")` |
| **SemanticRoutes.StepCount** | rollup | `Count(SemanticRouteSteps via SemanticRoute)` |
| **SemanticRoutes.ValidatedStepCount** | rollup | `Count(SemanticRouteSteps via SemanticRoute)` |
| **SemanticRoutes.AllStepsValidated** | formula | `ValidatedStepCount = StepCount` |
| **SemanticRouteSteps.Name** | formula | `SemanticRoute - StepOrder` |
| **SemanticRouteSteps.BridgeIsLoadBearing** | lookup | `Lookup(SemanticBridges.IsLoadBearing via BridgeUsed)` |
| **SourceReferences.Name** | formula | `Replace(Lower(ShortLabel), " ", "-")` |
| **SourceReferences.LemmaCount** | rollup | `Count(Lemmas via SourceReference)` |
| **SourceReferences.OutboundCitationCount** | rollup | `Count(CitationLinks via CitingSource)` |
| **SourceReferences.InboundCitationCount** | rollup | `Count(CitationLinks via CitedSource)` |
| **Lemmas.Name** | formula | `Replace(Lower(Label), " ", "-")` |
| **Lemmas.ObligationCount** | rollup | `Count(ProofObligations via RequiredLemma)` |
| **MirrorContract.Name** | formula | `Replace(Lower(RuleLabel), " ", "-")` |
| **MirrorContract.IsRejectionRule** | formula | `RuleKind = "reject"` |
| **Conjectures.Name** | formula | `Replace(Lower(DisplayName), " ", "-")` |
| **Conjectures.IsStillOpen** | formula | `IsResolved = FALSE` |
| **ProofObligations.Name** | formula | `ParentBound / RequiredLemma` |
| **ProofObligations.IsNecessary** | formula | `ObligationKind = "necessary"` |
| **ProofObligations.IsLemmaLoaded** | lookup | `Lookup(Lemmas.IsLoaded via RequiredLemma)` |
| **ProofObligations.IsLemmaLoadBearing** | lookup | `Lookup(Lemmas.IsLoadBearing via RequiredLemma)` |
| **ProofObligations.BoundClaimedExponent** | lookup | `Lookup(AsymptoticLowerBounds.Exponent via ParentBound)` |
| **ProofObligations.IsCurrentlyOpen** | formula | `IsSatisfied = FALSE` |
| **CitationLinks.Name** | formula | `CitingSource - cites - CitedSource` |
| **CitationLinks.IsDependency** | formula | `CitationKind = "depends-on"` |
| **CitationLinks.IsImprovement** | formula | `CitationKind = "improves"` |
| **CitationLinks.CitingYear** | lookup | `Lookup(SourceReferences.Year via CitingSource)` |
| **CitationLinks.CitedYear** | lookup | `Lookup(SourceReferences.Year via CitedSource)` |
| **AnswerKey.Name** | formula | `TargetTable / TargetRowId / TargetField` |
| **AnswerKey.IsBlocking** | formula | `GateLevel = "blocking"` |
| **TemporalSnapshots.Name** | formula | `Replace(Lower(Label), " ", "-")` |
| **TemporalSnapshots.ValidLowerBoundCountAtThisMoment** | rollup | `Count(LowerBoundValidityAtSnapshot via TemporalSnapshot)` |
| **TemporalSnapshots.BestKnownLowerBoundExponentAtThisMoment** | rollup | `Max(LowerBoundValidityAtSnapshot.BoundExponent via TemporalSnapshot)` |
| **TemporalSnapshots.CuratorConfirmedBestKnownLowerBoundExponentAtThisMoment** | rollup | `Max(LowerBoundValidityAtSnapshot.BoundExponent via TemporalSnapshot)` |
| **TemporalSnapshots.PendingButValidByDateCount** | rollup | `Count(LowerBoundValidityAtSnapshot via TemporalSnapshot)` |
| **TemporalSnapshots.BoundsValidatedOrRetractedThisMoment** | rollup | `Count(LowerBoundValidityAtSnapshot via TemporalSnapshot)` |
| **LowerBoundValidityAtSnapshot.Name** | formula | `AsymptoticLowerBound - at - TemporalSnapshot` |
| **LowerBoundValidityAtSnapshot.BoundExponent** | lookup | `Lookup(AsymptoticLowerBounds.Exponent via AsymptoticLowerBound)` |
| **LowerBoundValidityAtSnapshot.BoundValidFrom** | lookup | `Lookup(AsymptoticLowerBounds.ValidFrom via AsymptoticLowerBound)` |
| **LowerBoundValidityAtSnapshot.BoundValidTo** | lookup | `Lookup(AsymptoticLowerBounds.ValidTo via AsymptoticLowerBound)` |
| **LowerBoundValidityAtSnapshot.SnapshotDate** | lookup | `Lookup(TemporalSnapshots.SnapshotDate via TemporalSnapshot)` |
| **LowerBoundValidityAtSnapshot.BoundIsCurrentlyValid** | lookup | `Lookup(AsymptoticLowerBounds.IsCurrentlyValid via AsymptoticLowerBound)` |
| **LowerBoundValidityAtSnapshot.IsCuratorConfirmedAtThisSnapshot** | formula | `And(IsValidAtThisSnapshot, BoundIsCurrentlyValid = TRUE)` |

---

_This document is rendered in **RuleSpeak®**, the declarative business-rule
notation created by **Ronald G. Ross**, and follows the conventions of
**SBVR** (Semantics of Business Vocabulary and Business Rules). With thanks to
Ronald G. Ross for RuleSpeak® and his foundational work on business rules —
[www.RonRoss.info](https://www.RonRoss.info)._
