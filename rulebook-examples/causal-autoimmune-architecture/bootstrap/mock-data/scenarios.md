# Mock Data Scenarios — the test oracle for `IsClinicallyActionable`

> **Demonstration of inference structure, not validated clinical decision support.**
> Real loci/HLA/drug names and literature-aligned thresholds (`../clinical-reference.md`) are used
> only to make the synthetic story plausible.

Seven named patients. Each is constructed so the **derived** keystone
`IndividualPredictions.IsClinicallyActionable` comes out to a known value **for a known reason** —
and each failing patient fails on **exactly one** of the four gates. Two patients pass (one in-training,
one ancestry-holdout-that-transports), so every gate is exercised by both a passing and a failing case.

Nothing below is entered as a conclusion. The only inputs are **observations** — allele frequencies,
measured effect sizes/standard errors, replication p-values and effect signs, permutation effect sizes,
calibration-bin coverage counts, ancestry labels, and a cryptic-relatedness flag.

## The four gates (all derived)

| Gate | Field | Passes when… |
|---|---|---|
| Causally grounded | `RestsOnConfirmedMechanism` / `PredictedValue > 0` | ≥1 confirmed `IsCausalArchitectureNode` (confident ≥0.7, falsifiable, non-spurious) |
| Well calibrated | `CalibratedUncertainty >= 0.7` | reliability bins have coverage ≥20 and gap ≤0.1 for this ancestry × disease |
| Not spurious | `NOT HasSpuriousCorrelationFlag` | rests on a confirmed mechanism AND no cryptic-relatedness leakage |
| Ancestry-generalizable | `IsAncestryTransportSafe` | in-training (vacuous) OR holdout with ≥1 cross-ancestry-replicated node |

## The patients

| # | Patient | Ancestry | Expected `IsClinicallyActionable` | Why (the single deciding gate) |
|---|---------|----------|:---:|--------------------------------|
| A | **Ana Reyes** | European (in-training) | **TRUE** | All gates pass: confirmed IRF5→IFN node, well-calibrated, not spurious, in-training. |
| B | **Bili Okafor** | European (in-training) | **FALSE** | **Calibration** — identical confirmed mechanism to A, but reliability bins have coverage 8 (<20) ⇒ `CalibratedUncertainty = 0`. |
| C | **Chen Wei** | East Asian (in-training) | **FALSE** | **Spurious mechanism** — STAT4 edge replication sign-flips (only 1 concordant) and one negative control does not collapse (perm 0.5 > 0.1) ⇒ `IsSpuriousDerived` ⇒ not a node. |
| D | **Diego Santos** | European (in-training) | **FALSE** | **Cryptic relatedness** — fully confirmed mechanism and good calibration, but `HasCrypticRelatednessFlag = TRUE` ⇒ `HasSpuriousCorrelationFlag` at the prediction. |
| E | **Esi Mensah** | African (in-training) | **FALSE** | **Falsifiability** — qualified, replicated, control-surviving CTLA4 mechanism, but **zero** intervention targets ⇒ `IsExperimentallyFalsifiable = FALSE` ⇒ not a node. |
| F | **Faisal Haidar** | Indigenous American (holdout) | **FALSE** | **Ancestry transport** — confirmed IL23R node, but all replications ran in the same (Indigenous-American) ancestry ⇒ `CountCrossAncestryConcordant = 0` ⇒ not transportable to an absent-from-training ancestry. |
| G | **Grace Lin** | Indigenous American (holdout) | **TRUE** | The positive twin of F: same setup, but the IL23R effect **replicated in European and East-Asian cohorts** ⇒ `IsAncestryTransportable` ⇒ actionable despite holdout status. |

## Coverage matrix

```
              causally-   calibrated  not-spurious  ancestry-
              grounded                (mech+cryptic) transport
A (pass)         ✓            ✓            ✓             ✓ (vacuous)   => TRUE
B (calib)        ✓            ✗            ✓             ✓             => FALSE
C (spurious)     ✗            ✓            ✗ (mech)      ✓             => FALSE
D (cryptic)      ✓            ✓            ✗ (cryptic)   ✓             => FALSE
E (falsifiab.)   ✗            ✓            ✗ (no node)   ✓             => FALSE
F (transport)    ✓            ✓            ✓             ✗             => FALSE
G (transp pass)  ✓            ✓            ✓             ✓ (measured)  => TRUE
```

## How to verify after `effortless build`

```sql
SELECT individualpredictionid,
       isclinicallyactionable,
       ishighconfidenceprediction,    -- calibration ∧ not-spurious
       isfalsifiabilitybacked,
       isancestrytransportsafe,
       predictedvalue,
       calibrateduncertainty,
       patientstratificationtier
FROM vw_individualpredictions
ORDER BY individualpredictionid;
```

Expected: `pred-a` and `pred-g` → `isclinicallyactionable = true`; `pred-b, pred-c, pred-d, pred-e, pred-f` → `false`.
The build verification step asserts exactly this oracle.

## Sparse / unused ontology (kept as context, not gating)

`EnvironmentalExposures`, `Treatments`, `ClinicalPhenotypes`, `EpistaticInteractions`,
`CounterfactualTrajectories`, and the methylome / Hi-C / single-cell modality rows hold one
"(context only)" row each. They represent the breadth of the problem statement but are deliberately
off the keystone's dependency path (see the anti-hallucination rule in `../../EFFORTLESS_LOOPS.md`).
