# Causal Autoimmune Architecture — a deterministic diagnosis from raw facts alone

> **Demonstration of explainable clinical decision-support structure, not validated biology or
> medical advice.** The application makes a recommendation and its derivation visible down to the
> accepted facts, but a domain expert must still judge whether its formulas, thresholds, and medical
> terms are meaningful. All patient data is synthetic.

## Watch the repository tour

[![The AI Didn't Make the Decision — watch the Causal Autoimmunity architecture tour](assets/causal-autoimmune-architecture-repository-tour-player.png)](https://www.youtube.com/watch?v=dNoe_yQuWSg)

▶ [**Play: The AI Didn't Make the Decision. The Rulebook Did. | Causal Autoimmunity**](https://www.youtube.com/watch?v=dNoe_yQuWSg)

The revised video follows the complete trust boundary: a doctor writes the case notes, a language
model extracts fourteen invariant facts, and the rulebook deterministically computes fifty-eight
higher-order inferences, four evidence gates, and the actionable recommendation. It explains exactly
why Diego fails despite otherwise strong evidence, follows one changed fact through a live-recomputing
DAG, opens the keystone's formula without clipping it, and shows how a medical negative control breaks
patient-level correlation while preserving the measurements.

## What this demonstrates

A grand-challenge prompt usually treated as the canonical case for one enormous opaque model — *infer
the complete causal architecture of a heterogeneous autoimmune disease from a million-person
multi-omic cohort, distinguish true causal variants from confounded ones, survive population
stratification and cryptic relatedness, produce falsifiable mechanisms, and predict onset / severity /
treatment-response in ancestries absent from training, with calibrated uncertainty and no reliance on
spurious correlations.*

This repo is **not an attempt to solve that.** It is a demonstration of a narrower, sharper claim:

> **Even a problem this complex has a *trusted layer* that can be expressed as inspectable structure
> rather than code — and once it is structure, the vocabulary of the domain becomes portable,
> transparent, and interchangeable. Building that geometry is a matter of hours, not months.**

The whole problem is reduced to **one falsifiable boolean** — is a prediction *clinically actionable* —
computed by a calculated-field DAG ([an Effortless Rulebook](https://github.com/effortlessapi)) that
bottoms out only in raw observations. Two things make that more than a slogan, and they're the two
things the challenge text actually asks for:

- **The verdict is reached for the right reason on both sides of the line.** The same machine says
  *actionable* for some patients and *not actionable* for others, and it names the **single deciding
  reason** each time. Nothing is hand-entered; there is no field anyone can set to make the answer come
  out a particular way.
- **The trust boundary is a line in the graph, not a promise.** Everything above the raw leaves —
  every Z-statistic, every gate, the keystone — is a pure, inspectable formula. The judgment that
  would otherwise hide inside a model is externalized into editable cells and open formulas you can
  read and correct.

A clinical reviewer of the first version made one fair, substantive observation: it adjudicated
*whether the evidence was trustworthy*, which is not the same as modeling *whether the disease is
progressing*. That was the right next thing to build — so the platform now also runs the disease itself
as a **state machine derived from raw longitudinal labs**, and a patient can be **clearly progressing
while the prediction is correctly judged untrustworthy.** (The full audit and the response to it are
preserved verbatim in [`THE-ORIGINAL-CHALLENGE.md`](THE-ORIGINAL-CHALLENGE.md).)

> **What the platform actually does, feature by feature:** [`PLATFORM_FEATURES.md`](PLATFORM_FEATURES.md)
> is a factual catalog of every capability — each with its category, priority, and the **exact clause of
> the original challenge it addresses** (the quoted phrase plus its file/line/character position, so the
> UI can show it as a hover tip). It is **derived** from the `Features` rows in the rulebook, so it can
> never drift from what is actually built.
>
> Those features are built from a small set of **inference families** — the kinds of derivation the DAG
> performs: **lookup / FK resolution**, **aggregation rollups**, **higher-order inference** (gates over
> gates), **state-machine derivation**, **transitive closure** (reachability inferred from sparse edges),
> **predicate-gated narrative**, and **cross-substrate conformance**. The catalog opens with this
> overview (derived from the `InferenceKinds` rows), each family grounded in field types that exist in
> the rulebook today.

> **The one honest bound, stated once.** Everything here is **synthetic, transparent data — a proof of
> *shape*, not validated biology.** Nothing claims to have discovered or validated a real causal
> autoimmune mechanism. The checkable claim is narrower: the *auditable structure* real biology would
> slot into — evidence gating, disease-state progression, treatment-line reasoning, and the
> corpus-level surface where discovery is expressed — demonstrably exists on one model with every value
> visible and correctable, and each layer was **additive into the same DAG** in hours rather than a
> second system bolted on. What stays out of scope is the part that needs a real multi-omic corpus and
> real causal inference; the [coverage map](#coverage-map--what-is-modeled-vs-represented-only-as-vocabulary)
> at the end says exactly which is which.

## The one fact everything reduces to

`IndividualPrediction.IsClinicallyActionable` is **computed, never entered**. It is `TRUE` only when
**all four** derived gates hold:

1. **Causally grounded** — rests on ≥1 confirmed causal mechanism (`CausalConfidence ≥ 0.7`,
   experimentally falsifiable, non-spurious).
2. **Well calibrated** — for this patient's ancestry × disease, predicted probabilities match observed
   rates with enough held-out coverage. No coverage ⇒ the gate fails. Equity is *structural*, not promised.
3. **Not spurious** — replicated across cohorts, survived permutation controls, drew on ≥2 omics
   modalities, and the patient carries no cryptic-relatedness leakage.
4. **Ancestry-generalizable** — a holdout ancestry is actionable **only** if the mechanism was
   *measured to replicate in a different ancestry*. Holdout status alone is never enough.

Every gate bottoms out **only in raw observations** — allele frequencies, measured effect sizes and
standard errors, replication p-values and effect signs, permutation effect sizes, calibration-bin
coverage counts, ancestry labels, a cryptic-relatedness flag. **There is no field a curator can set
to make the diagnosis come out right.**

## The receipts: same machine, both verdicts, named reason

A diagnostic engine that only ever says "actionable" proves nothing. The demonstration is that the
**same deterministic DAG** lands on either side and names the **single deciding gate** — five of seven
patients fail, each on exactly one gate:

| Patient | Ancestry | Actionable | The single deciding reason |
|---|---|:--:|---|
| A | European (in-training)        | **TRUE**  | All gates pass — confirmed IRF5→IFN node, calibrated, not spurious, in-training. |
| B | European (in-training)        | FALSE | **Calibration** — same mechanism as A, but all five reliability bins have coverage of only 7–14 (<20) ⇒ uncertainty collapses. |
| C | East Asian (in-training)      | FALSE | **Spurious mechanism** — STAT4 replication sign-flips and a negative control fails to collapse. |
| D | European (in-training)        | FALSE | **Cryptic relatedness** — fully confirmed + well-calibrated, but a relatedness leakage flag is set. |
| E | African (in-training)         | FALSE | **Falsifiability** — qualified, replicated CTLA4 mechanism, but zero intervention targets exist. |
| F | Indigenous American (holdout) | FALSE | **Ancestry transport** — confirmed IL23R node, but all replications ran in the same ancestry. |
| G | Indigenous American (holdout) | **TRUE**  | The positive twin of F — same setup, but IL23R replicated in European *and* East-Asian cohorts. |

Every gate is exercised by both a passing and a failing case. The build verifies against exactly this
oracle; it is not asserted by hand.

## The second layer: from an *evidence gate* to a *disease-state simulator*

The reviewer's point was that adjudicating whether evidence is trustworthy answers *should we believe
this prediction*, not *is this patient's disease actually progressing* — an evidence gate, not a
disease-state simulator. So the platform now models the disease itself, and the move is the same one as
before: **a disease *progressing* is a state machine whose transitions fire on raw longitudinal
observations**, with the current state derived, never entered. The point worth noting is the *cost*:
this whole second layer was **additive into the same DAG, built in hours, and the harness stayed
green** — which is the thing a point-in-time coverage score can't see. (A clause-by-clause map of what
is modeled versus represented only as vocabulary is the
[coverage map](#coverage-map--what-is-modeled-vs-represented-only-as-vocabulary) at the end.)

1. **Disease progresses as a witnessed state machine** (`lupus-nephritis-progression`):
   `PresymptomaticAutoimmunity → SerologicActive → EarlyNephritis → RenalFlareRisk → BiopsyIndicated`.
   The **current state is DERIVED purely from raw serology leaves** — rising anti-dsDNA + falling
   complement + proteinuria + urinary sediment — never hand-set. Same line in the DAG: the labs are
   the LLM's/clinician's, the state is the model's. **Bitemporal dwell-time** (`DwellDays`,
   EnteredAt/ExitedAt occupancy) answers the audit's "how long has the patient been in this state."
2. **A clinical course, computed.** Diego Santos: *"transitioning toward early lupus nephritis, rising
   anti-dsDNA, falling complement, at renal-flare risk, biopsy-indicated"* — every clause is a derived
   field off his serology series, with a derived `SledaiScore` (12, High/flare). Not a summary anyone
   typed; the sentence falls out of the numbers.
3. **A treatment line, with one stated reason.** A derived `RecommendedTreatmentLine` +
   single `TreatmentLineDecidingFactor`: **mycophenolate** (active nephritis → induction),
   **anifrolumab** (type-I-IFN pathway), **belimumab** (autoantibody-driven), **secukinumab**
   (IL-17/23) — differentiated by the confirmed-mechanism pathway and the disease state, not by a label.
4. **The two layers can disagree — and that's the point.** Diego is
   `progression_vs_actionability_disagree = TRUE`: the disease-state simulator says he **is
   progressing** (BiopsyIndicated, high activity) while the actionability gate says the prediction
   is **NOT actionable** (cryptic-relatedness leakage). The system can therefore say *"clearly
   progressing and needs attention, but the causal-mechanism prediction isn't trustworthy enough for
   targeted therapy"* — a sentence an evidence gate alone structurally cannot produce, and the clearest
   proof that disease-state and evidence-trust are genuinely independent layers.

The broader disease vocabulary a physician expects — lupus nephritis, NPSLE, cutaneous lupus, sero±RA,
erosive disease, axial PsA, enthesitis, dactylitis, uveitis, IBD overlap, organ damage, flare patterns,
treatment lines, SLEDAI/DAS28 — lives in the hub (`DiseaseDomainConcepts`), each carrying an honest
`ModelingStatus` (deep-DAG / schema / vocabulary) so the depth of each concept is **checkable by grep,
not by trust**: what is deeply derived says so, and what is only named says so too. The home harness
leads with the disease-state categories (L11 disease-state, L11b progression, L5d treatment-line) —
**738/738 green**, with the original keystone verdicts unchanged.

### Discovery is corpus-level

The hardest part of the problem isn't gating one patient's evidence — it's **discovering** a pattern
across a population. A single chart never discovers a mechanism; a signal that recurs across many
patients does. So the platform derives that too: the rising-anti-dsDNA / falling-complement serology
trajectory that precedes nephritis surfaces as an **emergent cluster** — a per-patient
`IsInPreNephriticSignatureCluster` rolled up from each person's raw serology series, with **no label
assigned to anyone**. On the synthetic cohort the cluster lands cleanly (6 of 12), and it *perfectly
separates* the active/progressing patients from the quiescent ones: membership **emerges** from the
population's raw data and tracks the disease, rather than being painted on. It's the *shape* of
corpus-level discovery — still synthetic, not a validated finding — surfaced on the top-level **Cohort
discovery** board (the disease-state map, the signature scatter with the derived cluster drawn as a
halo, the disagreement board, and the treatment-line distribution, all reading derived fields).

## The architecture — and why the LLM never gets a vote

```
case details (natural language)  →  [ LLM: intake clerk + lab ]  →  leaf observations  →  [ rulebook DAG ]  →  deterministic diagnosis
        messy, human                  intake facts + test results       (the two bottom        trusted, pure        + four-gate trace
                                   └────── trust boundary ──────┘         rows only)
```

The LLM does **exactly two things, both at the leaf/observation layer only** — the un-alarming roles
that already exist in medicine:

1. **Interpret the intake facts** the way a doctor/nurse does — history → raw observation rows
   (ancestry, allele frequencies, the case's presenting facts).
2. **Produce the case's test results** — the "labs come back" values: measured effect sizes/SEs,
   replication signs/p-values, permutation effect sizes, calibration-bin coverage. These are *fake*
   (the case is invented) but **transparent**: every number is visible, sourced to the case, and
   editable.

That is the entire LLM surface. It never computes a higher-order inference — no ZStat, no
`IsQualifiedEvidence`, no `CausalConfidence`, no gate, no keystone, no diagnosis. **Everything above
the leaves is the deterministic, fully-witnessed inference graph.** The trust boundary isn't a vibe —
it's a *line in the DAG:* any field with a formula belongs to the model; any raw-input field is the
LLM's (or a human's). The LLM is the intake clerk and the lab; it is never the diagnostician.

The obvious objection is: *"you didn't remove the model's judgment, you moved it down a layer —
that's a hallucination laundered through a deterministic function."* The answer is structural:

- **Every choice the LLM makes is a literal knob.** Each value it emits is an editable field in the
  admin UI. The model's judgment is fully externalized — it can't hide. A wrong effect size is
  *nudged*, not re-prompted.
- **Every formula is inspectable and correctable in place, like a spreadsheet cell** — without
  touching the rest of the DAG; the change re-derives and propagates only as far as it should.
- **The reasoning lives in the open DAG, not in the model.** The LLM is demoted to a replaceable,
  fully-overridable transcriber.

So the system is **"an auditable, correctable derivation with an LLM as an overridable front-end,"**
not "an LLM that diagnoses." Witness it as **three independently-checkable panels**:

1. the **input** case text,
2. the **extracted raw facts**, each with a provenance pointer back into the text
   (`ZStat 3.1 ← "effect 0.42, SE 0.13 in the discovery cohort"`) — a human checks the *extraction*
   was faithful, separately from trusting the verdict,
3. the **derived diagnosis + four-gate trace** — deterministic, every step auditable.

The two halves (extraction vs. derivation) are verifiable independently — which is precisely what
defeats the laundering objection.

> **Honest bound.** "Without touching the rest of the DAG" holds for editing a field's *value or
> formula body* — that stays within its dependency subtree. Changing a field's *type* or its *place
> in the dependency graph* can ripple. The spreadsheet analogy is exact and exactly bounded: editing
> a cell is local; restructuring what-depends-on-what is not.

## How it's built

This is an **Effortless Rulebook (ERB)**: one JSON hub (`effortless-rulebook/effortless-rulebook.json`)
projected into a Postgres substrate by `effortless build`. The causal-inference logic lives entirely
in the calculated-field DAG, built bottom-up:

- **Evidence layer** — `EvidenceItems` derive `ZStat` and `IsQualifiedEvidence` per (mechanism × assay).
- **Replication & control layer** — `CohortReplications` derive sign-concordant reproduction (and
  whether it happened in a *different* ancestry); `NegativeControlTests` derive permutation collapse.
- **Mechanism layer** — `CausalMechanisms` aggregate to `CausalConfidence`,
  `IsExperimentallyFalsifiable`, `IsSpuriousDerived`, `ReplicatesAcrossCohorts`,
  `IsAncestryTransportable` → `IsCausalArchitectureNode`.
- **Individual & prediction layers** — roll up confirmed nodes and causal mass, then derive
  `PredictedValue`, `CalibratedUncertainty`, the four gates, and the keystone.

The full breadth of the problem (every omics modality, disease stages, epistasis, counterfactual
trajectories) is represented as ontology context but kept **deliberately off the keystone's dependency
path**, so the core inference stays minimal, auditable, and testable.

**On portability — the honest version.** This demo targets **one** substrate (Postgres). *This
autoimmune model has not been run through 17 substrates* — and nothing here should be read as
claiming it has. The multi-substrate claim is the **framework's**, not this model's: that a single
rulebook IR projects *identically* into many substrates (Postgres, Python, Go, English, OWL, Excel,
ARM64, COBOL, …) is demonstrated on the **framework's own conformance suite**, in the sibling
receipts repo — borrowed credibility, labeled as borrowed.

The strongest backing receipt for the *reasoning/portability* axis is the recursive transitive
closure cross-checked against a real OWL-RL + SHACL reasoner, in the Talisman example:

- **Postgres closure** — [`vw_step_precedence_closure`](https://github.com/effortlessapi/effortless-rulebooks/blob/main/rulebook-examples/talismans-special-solutions/postgres-bootstrap/03-create-views.sql)
  is a cycle-safe `WITH RECURSIVE` CTE: 4 asserted `precedesStep` edges (an `owl:TransitiveProperty`)
  close to all 10 ordering pairs — including the never-asserted step-1 → step-5 — each row tagged
  `is_inferred` / `hop_distance`.
- **OWL substrate** — the same closure computed independently by
  [`reason.py`](https://github.com/effortlessapi/effortless-rulebooks/blob/main/rulebook-examples/talismans-special-solutions/app/backend/reasoner/reason.py):
  SHACL rules run to a fixpoint, then an OWL-RL deductive closure for the transitive/inverse
  properties.
- **The referee** — the
  [conformance harness / orchestration report](https://github.com/effortlessapi/effortless-rulebooks/blob/main/rulebook-examples/talismans-special-solutions/orchestration-report.html)
  flags the instant the two derivations diverge. Agreement *is* the proof they're one object;
  divergence is the alarm.

That repo's standing bet — which we mirror here, scoped to this model's finite, design-time
questions — is: *produce one competency question the OWL / RDF / SHACL stack can answer but the
rulebook cannot express one layer up.* The one genuine boundary is honest and named: **open-world
entailment** is where substrates legitimately diverge, and the framework surfaces it as **failing
conformance rows, not hidden** — a substrate that lags is less mature for that feature, never "more
real." For the closed-world, design-time reasoning this model actually does, Postgres is the
answer-key oracle.

The point of *this* project isn't the substrate count. It's that the **trusted layer is structure**
— and once the domain's reasoning is structure rather than code, it is *projectable at all*:
portable, transparent, and interchangeable, instead of re-implemented (and re-drifted) in each
language a hospital, a regulator, and a researcher separately need.

**On transitive closure — the in-repo receipt.** The disease-progression machines
(`lupus-nephritis-progression`, `diagnosis-lifecycle`) store progression as sparsely-asserted
`FromState → ToState` edges. A single `closure` field on `StateTransitionRules` materializes
`vw_state_transition_rules_closure` — a cycle-safe `WITH RECURSIVE` view — and emits
`progression a owl:TransitiveProperty` in the OWL projection. From the 14 asserted edges, **both**
substrates independently derive the same 32 reachability pairs, including the never-asserted
`PresymptomaticAutoimmunity → BiopsyIndicated` (4 hops, `is_inferred`) — the autoimmune analogue of
the Talisman `step-1 → step-5` receipt. The closure is **load-bearing, not decorative**:
`MachineStates.ReachableStateCount` (and the per-patient `Individuals.ReachableStatesAhead`) consume
it to answer a graph-reachability question the linear severity rank *cannot* reproduce — because the
remission branch makes both `Quiescent` (rank 0) and `BiopsyIndicated` (rank 5) terminal sinks with
0 reachable-ahead, a value non-monotonic in the rank. Re-run the proof:
`python3 admin-app/tests/conformance/progression_closure_conformance.py` — it cross-checks the
OWL-RL deductive closure against the Postgres recursive CTE and asserts the load-bearing property.

## Run it

```bash
./start.sh build           # effortless build → regenerates the Postgres substrate
cd postgres && ./reset-rulebook-db.sh # create + seed the local database
cd ../admin-app && npm install && npm test   # the witnessed red→green inference harness
```

The app's home page **is** the witnessed red/green harness tree — every DAG node, for all seven
patients, asserted against the app's own API. Nodes go green as each endpoint is wired to read the
`vw_*` views. A passing run produces a per-patient, doctor-style diagnosis writeup as its artifact.

See [`PLATFORM_FEATURES.md`](PLATFORM_FEATURES.md) for the full capability catalog — every feature
with its category, priority, and the **exact challenge clause it addresses** (quoted phrase + file,
line, and character position into [`THE-ORIGINAL-CHALLENGE.md`](THE-ORIGINAL-CHALLENGE.md), the source
for the in-app hover tips). That file is **derived** from the `Features` rows in the rulebook and
regenerated on every `effortless build`.

See `admin-app/tests/README.md` for the harness contract, `CLAUDE.md` for the running north star,
and `EFFORTLESS_LOOPS.md` for the build loop.

## Coverage map — what is modeled vs. represented only as vocabulary

> Everything the audit named that is DERIVED or MODELED is in the model. What remains below is the
> deliberately-not-built surface: concepts present as a TYPE/slot the model can talk about
> (**VOCABULARY**), or things that need real multi-omic data / real causal inference and are
> represented only as a slot with no validated claim (**OUT-OF-SCOPE**).
>
> The disease-state simulator (progression machine + SLEDAI), the treatment-line recommendation, the
> disagreement counter-example, and the **emergent corpus-level serology-signature cluster** are all
> DERIVED and live — so they are no longer listed here. The cluster (`IsInPreNephriticSignatureCluster`
> / `SignatureStrength`, 6/12 with perfect active-vs-quiescent separation) demonstrates the *shape* of
> corpus-level discovery; what stays OUT-OF-SCOPE is **real** causal discovery/validation from a real
> multi-omic corpus.

| Challenge phrase | Status | Slot |
|---|---|---|
| clinical workflow (referral→differential→workup→classification→baseline-severity→treatment-choice→monitoring→flare-mgmt→AE-surveillance→outcomes) | VOCABULARY | workflow states; workup/monitoring are where raw leaves enter |
| deep adverse-event surveillance | VOCABULARY | `adverse-event-surveillance` |
| repeat expansions, mobile-element insertions, somatic mosaicism, mitochondrial variation, epigenetic inheritance | VOCABULARY | named in challenge + glossary; would be additional `VariantTypes` rows |
| assortative mating, batch effects, missing tissues, measurement error, ascertainment bias, shifting environments | VOCABULARY | named stressor types (only `OmicsAssays.MeasurementErrorScore` is wired as a leaf) |
| cell-state-specific effects, 3D enhancer–promoter, chromatin conformation | VOCABULARY / OUT-OF-SCOPE | `OmicsModalities`/`Tissues` represent the slot; no real single-cell/Hi-C data |
| counterfactual trajectories without randomized perturbation | VOCABULARY / OUT-OF-SCOPE | `CounterfactualTrajectories` (sparse); real counterfactual causal inference not done. (NB: the *emergent serology-signature cluster* IS now derived — that's discovery-shape, not counterfactual inference.) |
| omics/data-modality breadth (phased T2T genomes, pangenome graphs, scRNA/ATAC, proteomics, metabolomics, methylomes, Hi-C, immune repertoires, microbiomes, exposures) | OUT-OF-SCOPE (as real data) | `OmicsModalities`/`OmicsAssays`/`Tissues`/`EnvironmentalExposures`/`FederatedDatasets` are shaped to receive them; PoC uses synthetic values, not a real corpus |

---

## Local transpiler bus (`localhost:4242`)

> **All 13 local transpilers live on `localhost:4242`.** Start the bus with
> `./start.sh` from `rulebook-examples/legacy-runner/ssotme-proxy/` (it is being
> separated into its own project; see the root rulebook's `LegacyRunnerCapabilities`).
> The ssotme-proxy then exposes every repo-local transpiler —
> `postgres-calculated-to-rulebook`, `rulebook-to-python`, `rulebook-to-golang`,
> `rulebook-to-cobol`, `rulebook-to-owl`, and more — as first-class `ssotme://`
> routes any `effortless build` can call.
