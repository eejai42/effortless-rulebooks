<!-- DERIVED ARTIFACT — DO NOT EDIT BY HAND -->
<!-- Source: https://raw.githubusercontent.com/EffortlessAPI/effortless-skills/main/skills/effortless-rulebooks/SKILL.md -->
<!-- Mirrored by: docs/skills/clone-skills.sh -->
<!-- Update: cd effortless-platform && effortless clone-skills -->

---
name: effortless-rulebooks
description: >
  Use when the user wants empirical proof that CMCC actually works — show me the
  receipts, does this run in code, ExplainDAG, witnessed inference graph,
  conformance testing, answer-key.json, the rulebooks repo, "is-everything-a-language",
  StarTrek demo, Jessica Talisman workflow, multi-substrate equivalence, ARM64 +
  COBOL substrate, or any request to demonstrate that the conjecture holds in a
  runnable way. Also use when the user asks "what's in the effortless-rulebooks
  repo" or links to github.com/effortlessapi/effortless-rulebooks.

  **Scope (load gate):** Loads when the user asks for empirical proof of CMCC / wants to see ExplainDAG / asks about the effortless-rulebooks repo. Does not require a marked Effortless project.
audience: customer
---

# Effortless Rulebooks — The Conjecture, Made Runnable

> **Load-bearing axiom: Substrates are interchangeable peripherals; the conformance
> suite is the gate.** [effortless-rulebooks](https://github.com/effortlessapi/effortless-rulebooks)
> is the falsifier-in-a-box for CMCC: one rulebook, eleven-plus substrates, one
> answer-key. Same inputs → same outputs, or that substrate failed (not the rulebook).

Repo: https://github.com/effortlessapi/effortless-rulebooks

This skill exists so I can hand someone runnable evidence instead of arguing.
When CMCC is challenged, this is the receipt I reach for.

## What the Repo Is

A single `effortless-rulebook.json` (in this repo, originally seeded from an
Airtable grid) is projected into 11+ wildly different execution substrates. An
`answer-key.json` defines the expected outputs for every calculated field across a
known dataset. Each substrate is conformance-tested against that answer key,
field-by-field.

The architecture is the literal embodiment of "the rulebook is the invariant,
substrates are coordinate projections":

```
       editing surface (rulebook-direct, or an optional Airtable/Excel grid)
                        |
                  (e.g. airtable-to-rulebook, if seeded from a grid)
                        v
              effortless-rulebook.json   <-- the invariant / hub
                        |
   ┌──────┬──────┬──────┼──────┬──────┬──────┬──────┐
   v      v      v      v      v      v      v      v
 Python  Go   Postgres XLSX  OWL/  ARM64 COBOL English  ExplainDAG
                              SHACL                       (witnessed)
                        |
                  answer-key.json   <-- the falsifier
```

## Why the Substrate List Is Load-Bearing

It is tempting to read "11 substrates" as quantity. The point is **diversity**.
Python and Go are isomorphic — they prove nothing on their own. The list
matters because no two of these substrates share runtimes, type systems,
evaluation strategies, or even computational metaphors:

| Substrate | What its presence proves |
|---|---|
| **Python (dataclasses)** | Imperative high-level expressibility. Baseline. |
| **Go (structs)** | Statically-typed compiled equivalence. |
| **PostgreSQL (functions + views)** | Set-theoretic / relational equivalence. The reference implementation for formula coverage. |
| **XLSX (Excel formulas)** | The ancestral substrate is itself a generation target — closing the loop. |
| **OWL / SWRL** | Description-logic / open-world semantic-web equivalence. |
| **SHACL** | Constraint-based shape validation equivalence. |
| **ARM64 / x86 assembly** | Equivalence at the *computational floor*. If the rulebook compiles to assembly that produces the same answers, the rulebook isn't hiding behind any abstraction. |
| **COBOL** | Legacy enterprise substrate. Demonstrates the rulebook is not coupled to modern ergonomics. |
| **English prose** | Documentation-as-substrate. Collapses the doc/code drift problem by construction. |
| **ExplainDAG (witnessed inference)** | Reasoning-as-data. See its own section below — this is the substrate I'd point at first. |
| **YAML / CSV / UML** | Format-shifted projections of the same model. |

If all of these produce the same answers for the same inputs, the rulebook is
the invariant and the substrates are interchangeable. That is CMCC's structural
claim, made physically demonstrable rather than argued.

## ExplainDAG — The Substrate That Changes the Audit Story

ExplainDAG is not a generated *program*. It is a generated *trace of reasoning* —
a per-fact, witnessed inference graph that records, for every derived value:

1. **Which rule fired** to produce this value.
2. **What witnesses** (input rows, lookup targets, intermediate calculations) the
   rule consumed.
3. **What that rule's witnesses, in turn, derive from** — recursively, all the
   way down to raw data.

The implication is the part that matters:

- **"Why is this number what it is?"** stops being archaeology (git blame +
  log spelunking + reconstructing intent from execution paths) and becomes a
  **query against a static artifact**.
- **Audit, regulation, and reversibility** become first-class. The provenance
  is part of the output, not a logfile that may or may not have captured what
  you needed.
- **Hallucination defense** for downstream LLMs. If a model is shown the
  ExplainDAG alongside a derived value, it can't quietly assert a different
  derivation — the witnesses are right there.

ExplainDAG is the bitemporal-ACID-DAG substrate's audit story made physical.
Most codebases throw provenance away as a matter of course. ERB keeps it,
because the conjecture says it's recoverable from the model.

## The Conformance Gate (the actual falsifier)

`answer-key.json` is the ground truth. Every substrate, after projection, must
produce field-for-field matching outputs against the answer key. Mismatch = that
substrate's transpiler is wrong, **not** the rulebook.

This is the gate that turns "the rulebook is the invariant" from a slogan into
a measurable property. If the user wants proof, this is the proof: clone, run,
diff against the answer key, observe equivalence.

## Included Rulebooks (what each one demonstrates)

- **CustomerDemo** — minimal. String concatenation across substrates. Useful as
  a smoke test.
- **Jessica Talisman's Workflow (BASIC + ADVANCED)** — 9-table enterprise
  workflow with delegation. Demonstrates that a real organizational ontology
  decomposes cleanly into SDLAF.
- **StarTrek** — moderate complexity, hierarchical media catalog. Useful for
  showing lookup/aggregation chains across multiple levels.
- **is-everything-a-language** — the philosophical meta-ontology. 33 entities
  classifying domains as languages. The rulebook for the framing that supports
  English-as-a-substrate.

## Running a Substrate (the one-liner I want handy)

```bash
git clone https://github.com/effortlessapi/effortless-rulebooks
cd effortless-rulebooks
# pick a rulebook + substrate, run its generator, then diff against answer-key.json
```

(Per-substrate run instructions live in the repo's README. When the user wants
to actually run one, defer to the repo — don't reproduce its instructions here
where they would rot.)

## When To Use This Skill

- User asks "does this actually work?" or "show me proof" → this repo + the
  conformance suite is the answer.
- User asks about ExplainDAG, witnessed inference, or audit/provenance → the
  ExplainDAG section above.
- User pushes back on substrate-independence ("but you really need to write
  some code somewhere") → the substrate matrix above. ARM64 + COBOL + English
  is the load-bearing diversity.
- User wants to see a domain modeled in CMCC end-to-end → point them at the
  appropriate included rulebook (StarTrek for catalog-shaped, Jessica Talisman
  for workflow-shaped, is-everything-a-language for meta).

## What Belongs *In* the Rulebooks Repo vs. an ERB Project

The rulebooks repo is **demonstration**. It is not a dependency of a normal ERB
project. Don't tell users to "install effortless-rulebooks" as part of project
setup. It exists to be cloned and inspected when proof is wanted, and to be the
regression suite that keeps the transpilers honest.

## See also

- `effortless-cmcc` — the conjecture this repo demonstrates.
- `effortless-rationale` — when to deploy these receipts in a skeptic-facing
  argument.
- `effortless-pipeline` — the ssotme:// transpiler architecture that makes the
  multi-substrate generation possible.
- `effortless-ecosystem` — the broader catalog of effortless / SSoTme repos.
