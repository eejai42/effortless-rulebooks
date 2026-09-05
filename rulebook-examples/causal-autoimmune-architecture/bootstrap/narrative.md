# Narrative — Causal Autoimmune Architecture Platform

> **Demonstration of inference structure, not validated clinical decision support.** Gene, HLA, drug,
> and threshold names are real and literature-aligned (see `clinical-reference.md`) only so the synthetic
> data reads plausibly. Nothing here should be used for any clinical purpose.

## What this platform does — in one sentence

Given a patient's **observed facts** — which variants they carry and at what allele frequency, which
omics assays measured a signal and how noisy each was, whether those signals **replicated** in other
cohorts and **survived negative controls**, and how well the risk model is **calibrated** for that
patient's ancestry — the platform **derives** a single answer: **is a risk prediction for this patient
clinically actionable?** That answer is the keystone fact `IndividualPrediction.IsClinicallyActionable`,
and it is **computed**, never entered.

## The one fact everything reduces to

`IsClinicallyActionable` is `TRUE` for a patient's prediction only when **all four** of these derived
gates hold:

1. **Causally grounded** — the prediction rests on at least one *confirmed causal mechanism*: a
   variant-or-exposure→phenotype edge whose `CausalConfidence` (itself derived by aggregating qualified
   multi-omic evidence, replication rate, and negative-control survival) clears 0.7, that is
   *experimentally falsifiable* (a perturbable intervention target exists), and that is *not spurious*.
2. **Well calibrated** — for this patient's ancestry × disease, the model's predicted probabilities match
   observed event rates across reliability bins with enough held-out coverage. Absent coverage ⇒ zero
   calibration ⇒ gate fails. This is what makes equity *structural*, not promised.
3. **Not spurious** — the mechanism replicated across cohorts, survived stratification/permutation
   controls, drew on ≥2 omics modalities, and the patient carries no cryptic-relatedness leakage.
4. **Ancestry-generalizable** — if the patient's ancestry was absent from training, the prediction is
   actionable **only** if its mechanism's effect was **measured to replicate in a different ancestry**.
   Holdout status alone is never enough; transport must be an observed fact.

Everything load-bearing in the rulebook is a node on the path to this one boolean. Each gate bottoms out
**only in raw observations** — allele frequencies, measured effect sizes and standard errors, replication
p-values and effect signs, permutation effect sizes, calibration-bin coverage counts, ancestry labels.
There is no field a curator can set to "make the diagnosis come out right."

## How the rulebook achieves it

The platform is an Effortless Rulebook: one JSON hub (`effortless-rulebook.json`) projected into a Postgres
substrate by `effortless build`. The causal-inference logic lives entirely in the **calculated-field DAG**,
built bottom-up:

- **Evidence layer.** `EvidenceItems` records one measured support signal per (mechanism × assay): its
  effect size, standard error, whether it was confound-controlled, and which omics modality it came from.
  Each item derives a `ZStat` and an `IsQualifiedEvidence` flag (clean assay, real support arm,
  signal-to-noise ≥ 2, confound-controlled).
- **Replication & control layer.** `CohortReplications` re-tests each mechanism in other federated cohorts
  (deriving whether it reproduced the predicted sign at significance, and whether that happened in a
  *different ancestry*). `NegativeControlTests` derive whether the signal *collapses* under permutation —
  as a true causal effect should.
- **Mechanism layer.** `CausalMechanisms` aggregates its children into `CausalConfidence`,
  `IsExperimentallyFalsifiable`, `IsSpuriousDerived`, `ReplicatesAcrossCohorts`, and
  `IsAncestryTransportable`, combining to `IsCausalArchitectureNode` — a confirmed causal edge.
- **Individual layer.** `Individuals` count their confirmed nodes and sum their causal mass.
- **Prediction layer.** `IndividualPredictions` derive `PredictedValue` (from causal mass, not ancestry
  correlation), `CalibratedUncertainty` (from `CalibrationBins`), `HasSpuriousCorrelationFlag`, the four
  gate booleans, `PatientStratificationTier`, and finally the keystone `IsClinicallyActionable`.

The admin app's job is to make this tangible: enter one patient's **facts**, and the DAG returns the full
prediction panel — the keystone boolean, the risk tier, the derived onset/severity/response/adverse values,
and a breakdown of which of the four gates passed or failed and why.

## What's kept as context but is not load-bearing

The full breadth of the problem is represented in the ontology — every omics modality (long-read genomes,
ATAC-seq, methylome, Hi-C/chromatin-conformation, proteomics, metabolomics, immune-receptor repertoires,
microbiome, mtDNA, somatic mosaicism), disease stages, clinical phenotypes, epistatic interactions, and
counterfactual trajectories. These remain as domain context and future evidence inputs, but they are
**deliberately not on the keystone's dependency path**, so the core inference stays minimal, auditable, and
testable. The anti-hallucination rule (see `EFFORTLESS_LOOPS.md`) keeps it that way: anything that is
*both* absent from `problem-to-solve.md` *and* not load-bearing toward the keystone is pruned each loop.

## Success criterion

The platform succeeds when, for a set of specific patients with specific observed facts, the rulebook
**derives the right `IsClinicallyActionable` for the right reason** — passing when every gate is satisfied,
and failing on exactly the gate that should fail (poor calibration, spurious mechanism, cryptic relatedness,
no falsifiable target, or an untransportable holdout ancestry). Those patients are specified in
`mock-data/scenarios.md`, and the build is verified against their expected outcomes.
