# Glossary — Causal Autoimmune Architecture Platform

> **Demonstration of inference structure, not validated clinical decision support.**

Vocabulary organized by whether a term is **load-bearing** (on the dependency path of the keystone `IndividualPredictions.IsClinicallyActionable`) or **context** (kept to represent the breadth of the problem statement, but deliberately not gating the keystone — see the anti-hallucination rule in `../EFFORTLESS_LOOPS.md`).

---

## Part 1 — Load-bearing terms (each maps to a derived field)

### The keystone
**clinically actionable** — `IndividualPredictions.IsClinicallyActionable`. The single terminal boolean:
TRUE only when a prediction is causally grounded, well calibrated, not spurious, and ancestry-generalizable.

### Evidence layer
**evidence item** — `EvidenceItems`: one measured support signal for a mechanism, from one omics assay.
**effect size / standard error** — raw observations on an evidence item; their ratio is the derived **Z-stat**.
**qualified evidence** — `EvidenceItems.IsQualifiedEvidence`: clean assay, real support arm, Z-stat ≥ 2, confound-controlled.
**confound-controlled** — analysis adjusted for both ancestry PCs and batch (`IsConfoundControlled`).
**cross-modality** — evidence from a different omics modality; ≥2 supporting modalities required for a non-spurious mechanism.
**high-quality assay** — `OmicsAssays.IsHighQualityAssay`: derived from a low `MeasurementErrorScore`.

### Replication & control layer
**cohort replication** — `CohortReplications`: a re-test of a mechanism in another federated cohort.
**replicated at nominal significance** — derived from the re-test's p-value and effect sign.
**cross-ancestry concordant** — replicated AND in a different ancestry than discovery: the transportability atom.
**negative-control test** — `NegativeControlTests`: a permutation/stratification control; a true causal signal **collapses** under it (`IsSurvived`).
**survives negative controls** — at least one control run and all collapsed within the null band.

### Mechanism layer
**causal mechanism** — `CausalMechanisms`: a variant-or-exposure → phenotype edge.
**causal confidence** — `CausalConfidence`: derived bounded blend of qualified-evidence count, modality breadth, replication rate, and control survival.
**experimentally falsifiable** — `IsExperimentallyFalsifiable`: a measurable qualified effect plus a named perturbable intervention target.
**spurious (derived)** — `IsSpuriousDerived`: not replicated, or fails controls, or <2 modalities, or purely pleiotropic.
**causal architecture node** — `IsCausalArchitectureNode`: a confirmed edge (confident ≥0.7, falsifiable, non-spurious, variant- or exposure-grounded).
**ancestry-transportable** — `IsAncestryTransportable`: a confirmed node whose effect replicated in ≥1 different ancestry.
**pleiotropy** — observed property (`HasPleiotropy`) that, alone, marks a mechanism as not cleanly causal.

### Individual & prediction layer
**confirmed causal nodes** — per-individual count and summed confidence (`CausalArchitectureScore` basis).
**predicted value** — `PredictedValue`: derived risk magnitude (0–10) from validated causal mass only — rides mechanism, not ancestry correlation.
**calibration bin** — `CalibrationBins`: a reliability-curve bin seeded from held-out coverage for this individual's ancestry × disease.
**calibrated uncertainty** — `CalibratedUncertainty`: derived reliability (HIGH = trustworthy); 0 when coverage is absent.
**cryptic relatedness** — observed leakage flag (`HasCrypticRelatednessFlag`) that forces a spurious prediction.
**spurious correlation flag** — `HasSpuriousCorrelationFlag`: derived — no confirmed mechanism OR cryptic-relatedness leakage.
**ancestry holdout** — `IsAncestryHoldout`: individual's ancestry absent from training (`IsAncestryAbsentFromTraining`).
**ancestry-transport-safe** — `IsAncestryTransportSafe`: holdout requires a measured cross-ancestry node; in-training is vacuously safe.
**patient stratification tier** — `PatientStratificationTier`: High / Moderate / Low-Risk Pathway from the derived `PredictedValue`.

### Cohort primitives
**individual** — `Individuals`: a cohort participant with ancestry, age, and observed leakage flags.
**ancestry** — population label used for transport and calibration matching.
**federated dataset** — `FederatedDatasets`: a privacy-preserving cohort node where replications run.
**genomic variant** — `GenomicVariants`: a variant call; `IsCausalCandidate` derived from rarity + allele-specific expression.
**allele frequency** — raw observation; `< 0.01` ⇒ rare (gnomAD convention).
**allele-specific expression** — observed differential allelic transcript output; required for a causal-candidate variant.

---

## Part 2 — Context terms (kept, NOT gating the keystone)

These represent the full breadth of the problem statement and remain as sparse ontology / future evidence inputs. They are deliberately off the keystone's dependency path so the core inference stays minimal and testable.

**omics modalities** — RNA-seq, single-cell RNA-seq, ATAC-seq, proteomics, microbiome (load-bearing as assay quality + modality breadth); **methylome, chromatin-conformation (Hi-C), long-read genomes, metabolomics, immune-receptor repertoires, mitochondrial variation, somatic mosaicism** (present as modality/variant rows, not yet wired into evidence).

**disease context** — autoimmune disease, disease stages (presymptomatic/active/remission), tissues, clinical phenotypes, severity scores, immune dysfunction. Observed clinical context; could later supply outcome labels but the keystone is mechanism- and calibration-driven.

**genetics breadth** — coding variants, repeat expansions, mobile-element insertions, HLA haplotypes, structural variants, de novo mutations, epigenetic inheritance, rare-variant burden, higher-order epistasis. Represented as variant types / epistatic-interaction context.

**other influences** — environmental exposures, gene–environment–microbiome interactions, maternal & developmental effects, treatment-induced changes, counterfactual trajectories, feedback. Held as context rows.

**bias/quality vocabulary** — population stratification, assortative mating, batch effects, measurement error, ascertainment bias, shifting environments. Of these, **measurement error** (assay quality), **cryptic relatedness**, **confounding/stratification** (negative controls), and **ancestry portability** (transport gate) are load-bearing; the rest are context.

**outcomes vocabulary** — disease onset, severity, treatment response, adverse effects, individualized prevention, presymptomatic diagnosis, gene-/cell-based therapies, clinical trials. The platform predicts onset risk as `PredictedValue`; the other prediction types are representable but seeded sparsely.

---

## Part 3 — v2 disease-domain depth (response to the v1 audit)

> The v1 audit ("an evidence-adjudication layer, not a disease-state simulator") named a specific list of disease-domain concepts and clinical-workflow stages as **absent**. v2 adds every one of them to the hub as a first-class `DiseaseDomainConcepts` row, with an honest `ModelingStatus`: **deep-dag** (carries a witnessed inference DAG), **schema** (first-class schema + data + derived fields), or **vocabulary** (present as a stressor/concept type). Grep the rulebook for any of these terms — they are no longer absent. See `V2-RESPONSE-PROPOSAL.md`.

**disease-state simulator vs evidence gate** — the audit's central distinction. v1 = the *evidence gate* (`IsClinicallyActionable`, per-patient). v2 adds the *disease-state simulator*: disease modeled as a **witnessed state machine** whose transitions fire on raw longitudinal observations, with derived current-state and **bitemporal dwell-time**.

**load-bearing (deep-dag) v2 concepts** — `lupus-nephritis` (progression machine driven by rising anti-dsDNA + falling complement + proteinuria → renal-flare-risk → biopsy-indicated), `treatment-line-selection` (MMF vs belimumab vs anifrolumab + single deciding reason), `disease-activity-score` (SLEDAI/DAS28 derived from raw components, not hand-entered). These are the doctor's own two worked examples, made to compute.

**schema-level v2 concepts** — neuropsychiatric lupus, cutaneous lupus, organ damage (SLICC-style), seropositive/seronegative RA, erosive disease, axial PsA, enthesitis, dactylitis, uveitis, IBD overlap, flare pattern, treatment line. First-class phenotype subtypes / progression axes.

**clinical-workflow vocabulary** — referral, differential, workup, classification, baseline-severity, treatment-choice, monitoring, flare-management, adverse-event-surveillance, outcomes. Present as the states of a clinical-workflow machine; the workup/monitoring states are where the raw leaves enter.
