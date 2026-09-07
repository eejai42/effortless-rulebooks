# Witnessed Inference Test Harness

> **Demonstration of inference structure, not validated clinical decision support.**

## The north star (what this app actually IS — keep refining)

This is **not a CRUD UI**. It is a **diagnostic inference engine validated by a witnessed test
harness**, whose payoff is a **doctor-style writeup per patient, derived from raw facts alone**.

- **The harness is the home screen.** Running the app shows this suite in the browser: categories
  (DAG levels / the four gates) → specific tests, mostly **red** today, going **green** as the model
  is built out. (Served by `GET /api/harness`, rendered by the React app.)
- **Build the model until it "just works."** Only raw facts go in per patient; the model derives the
  whole chain to the keystone and reaches the correct conclusion for all 7 — no hand-entered answers.
- **The real output is a diagnosis, not a screen.** A passing run *produces* a per-patient writeup
  (Markdown now → `diagnosis.pdf` once green): *"presented with… tests xyz confirmed abc… therefore
  C."* Served by `GET /api/diagnosis/:predictionId`. It needs no UI to be valuable.
- **End state:** 7 patients' raw facts → correct keystone → a clean witnessed writeup for each.
- **The LLM is the intake clerk + the lab — never the diagnostician.** It does exactly two things,
  both at the **leaf/observation layer only:** (1) interpret the intake facts (history → raw rows:
  ancestry, allele freqs, presenting facts), and (2) produce the case's *synthetic-but-transparent*
  test results (effect sizes/SEs, replication signs/p-values, permutation effect sizes,
  calibration-bin coverage). It never computes a higher-order inference — no ZStat, no gate, no
  keystone, no diagnosis. **Everything above the leaves is the deterministic, fully-witnessed
  inference graph.** The trust boundary is a *line in the DAG*: any field with a formula is the
  model's; any raw-input field is the LLM's (or a human's). Every value it emits is an **editable
  knob** and every formula is correctable in place (like a spreadsheet cell), so a wrong fact is
  *nudged*, not re-prompted. Witness it as three panels: input case text → extracted leaf
  observations **with per-fact provenance back into the text** → deterministic diagnosis + four-gate
  trace. The two halves (extraction vs. derivation) are independently checkable — which is what
  defeats *"a hallucination laundered through a deterministic function."*

See the project `CLAUDE.md` ("What this app actually IS") for the canonical framing.

---

This is the **red-green contract for the whole admin app** (Loop 0.5, run *before* Loop 1).
It asserts the **entire** `IsClinicallyActionable` inference DAG — every derived node, from raw
observations up to the keystone — for all **seven** oracle patients (A–G), **by hitting the app's
own API**. A node is "surfaced in the app" only when its endpoint serves the oracle value and its
test goes green.

## Why it is RED today (on purpose)

Every inference-surface endpoint in `server/index.js` returns **501 Not Implemented**. So all
tests fail with *"App does not yet surface this node (HTTP 501)"*. That is the point: the tests are
**load-bearing** — Loops 1–5 turn them green by wiring one endpoint at a time to read `vw_*`.

Run them:

```bash
cd admin-app
npm install
npm test          # 296 tests, currently 0 pass / 296 fail (all 501)
```

The DB must be up (`postgres/reset-rulebook-db.sh` from the project root). Health (`/api/health`) is the one
wired endpoint, so the harness can boot the app; everything else is 501.

## What each test carries (the three things you asked for)

1. **Raw test facts** — the leaf OBSERVATIONS the node bottoms out in (allele freq, ZStat inputs,
   replication sign/p/ancestry, permutation effect size, calibration coverage, cryptic flag). The
   only hand-entered inputs anywhere in the model.
2. **Witnessed line of reasoning** — the expert-verifiable derivation from
   `bootstrap/derivation-spec.md` §3, printed in every test name and every failure message. A domain
   expert can confirm the inference is sound *without trusting the code*.
3. **Expected derived value** — the ground truth, captured live from the `vw_*` views and frozen in
   `tests/oracle/dag-oracle.js`. This is the oracle; do **not** edit it to make a test pass.

## Levels (bottom-up, matching the DAG)

| File | Level | Asserts |
|---|---|---|
| `L0-variant.test.js`       | L0/L1 | `IsCausalCandidate` on raw allele-freq + ASE |
| `L1-atoms.test.js`         | L1    | evidence / replication / control / calibration leaf derivations |
| `L3-L2-mechanism.test.js`  | L2/L3 | mechanism aggregations + `IsCausalArchitectureNode` / `IsAncestryTransportable` |
| `L4-individual.test.js`    | L4    | individual rollups (confirmed nodes, cross-ancestry nodes, leakage/holdout) |
| `L5-prediction-scalars.test.js` | L5 | causal mass, `PredictedValue`, `CalibratedUncertainty`, flags |
| `L6-gates.test.js`         | L6    | the four gates + keystone == AND(gates) cross-check |
| `L7-keystone.test.js`      | L7    | `IsClinicallyActionable`, all 7 patients |
| `L7-cohort.test.js`        | L7    | the cohort list: exactly {A, G} actionable as a set |

## The oracle (coverage matrix)

Each failing patient fails on **exactly one** gate; each gate is exercised by a passing **and** a
failing case:

| Patient | Deciding gate | actionable |
|---|---|:--:|
| A Ana Reyes      | all pass            | **TRUE**  |
| B Bili Okafor    | calibration         | FALSE |
| C Chen Wei       | spurious mechanism  | FALSE |
| D Diego Santos   | cryptic relatedness | FALSE |
| E Esi Mensah     | falsifiability      | FALSE |
| F Faisal Haidar  | ancestry transport  | FALSE |
| G Grace Lin      | transport passes    | **TRUE**  |

## How the loops consume this

- **Loop 1** wires `/api/cohort` + `/api/predictions/:id` → turns L7, L6, L5 green.
- **Loop 3** wires `/api/mechanisms/:id(/evidence|/replications|/controls)`,
  `/api/predictions/:id/calibration`, `/api/individuals/:id`, `/api/variants/:id` → turns
  L3/L2, L4, L1, L0 green.

When a future loop changes a rule, the oracle in `dag-oracle.js` must be **deliberately re-captured**
from `vw_*` as part of that rule-change — never silently edited to chase green.
