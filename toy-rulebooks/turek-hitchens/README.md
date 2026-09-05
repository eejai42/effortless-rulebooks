# Rulebook — *Does God Exist?* (Hitchens vs. Turek, VCU)

A formal **Effortless Rulebook (ERB)** built from the VCU debate transcript, capturing the debate's structure **and every philosophical concept raised**. Produced by running the transcript through the **Shadle steps** (the `effortless-bootstrap` pipeline), Rulebook-First.

## The Shadle steps, as applied here

| Step | Artifact | What it did |
|---|---|---|
| 1 · Word extraction | `bootstrap/words.txt` | **3,038 unique tokens** — exhaustive, uncurated, pulled from the full transcript (21,910 word tokens) |
| 2 · Domain vocabulary | `bootstrap/vocabulary.txt` | trimmed to **181 domain terms** (philosophy of religion), each attested in the transcript |
| 3 · Glossary | `bootstrap/glossary.md` | every term defined, grouped by area |
| 4 · Narrative | `bootstrap/narrative.md` | prose using the full vocabulary, end-to-end |
| 5 · Mock data & scenarios | `bootstrap/mock-data/scenarios.md` | 10 scenarios exercising each inference rule |
| 6 · Normalized schema | `bootstrap/normalized-schema.md` | 10-table DAG design, FKs, depth-tagged inferences |
| 7 · Rulebook JSON | `effortless-rulebook/effortless-rulebook.json` | the hub — all 181 vocab terms present |
| 8 · Descriptions | (in the JSON) | every table and every field carries a `Description` |
| 9 · Seed data | (in the JSON) | 181 rows across 11 tables |
| 10 · Inference DAG | (in the JSON) | 1°/2°/3° calculated + aggregation fields |
| 11 · Effortless loop | — | rulebook hub seeded; wire `effortless.json` to project to Postgres + other substrates |

## The model (10 domain tables + `__meta__`, 181 rows)

`Debaters` · `Worldviews` · `Arguments` · `Premises` · `Evidence` · `Concepts` · `Claims` · `Rebuttals` · `Thinkers` · `Quotations` (+ the transpiler-ignored `__meta__` project-metadata table)

It is a clean DAG (1-to-many only, no cycles, no many-to-many). The derived layer chains three deep:
**Rebuttal → `Claim.RebuttalCount` (1°) → `Argument.TotalRebuttals` (2°) → `Argument.IsContested` (3°).**

## Validation (all passing)

- ✅ Valid JSON, ERB-conformant (PascalCase plural tables, `Name` = slug formula, `Description` on every field)
- ✅ Foreign-key referential integrity (every relationship resolves to a parent `Name`)
- ✅ Acyclic table-level dependency graph
- ✅ Unique computed `Name` per table
- ✅ **181/181 vocabulary terms present** in the rulebook

## Derived scoreboard (computing the inference DAG)

| Argument | premises | evidence | developed | rebuttals | contested |
|---|--:|--:|:--:|--:|:--:|
| Cosmological | 3 | 5 | ✓ | 1 | ✓ |
| Teleological (parent) | 0 | 0 | – | 1 | ✓ |
| · Fine-Tuning | 3 | 0 | ✓ | 1 | ✓ |
| · Design of Life | 3 | 1 | ✓ | 1 | ✓ |
| Moral | 3 | 0 | ✓ | 3 | ✓ |
| From Reason | 0 | 0 | – | 1 | ✓ |
| From Mathematics | 0 | 0 | – | 0 | – |
| From Free Will | 0 | 0 | – | 0 | – |
| From Consciousness | 0 | 0 | – | 0 | – |
| Poor Design (H) | 2 | 1 | ✓ | 0 | – |
| Deism-Theism Gap (H) | 2 | 0 | ✓ | 1 | ✓ |
| Morality Without God (H) | 3 | 0 | ✓ | 1 | ✓ |
| Religion Poisons Everything (H) | 0 | 0 | – | 1 | ✓ |

Turek: 9 arguments, 9 claims, 16 thinkers cited · Hitchens: 4 arguments, 8 claims, 19 thinkers cited.
**Hostile witnesses** (cited against their own sympathies): Jastrow, Dawkins, Crick, Hoyle, Wickramasinghe, Weinberg, Provine, Dennett. The full-transcript re-run also adds the cross-examination on abortion/contraception (a Turek claim drawing Hitchens's "nature is the greater abortion provider" rebuttal) and three new Hitchens authorities — Francis Collins, William Gladstone, and Omar Khayyam.

## Notes

- **Copyright:** `Quotations` store paraphrased *gists*, never long verbatim text.
- **Editorial:** the `data` is one defensible reading of the transcript (which premises belong to which argument, which claims drew rebuttals). It's meant to be tended — edit the rulebook and rebuild, the same as any ERB project.

---

## Local transpiler bus (`localhost:4242`)

> **All 13 local transpilers live on `localhost:4242`.** Start the bus with
> `./start.sh` from `rulebook-examples/legacy-runner/ssotme-proxy/` (it is being
> separated into its own project; see the root rulebook's `LegacyRunnerCapabilities`).
> The ssotme-proxy then exposes every repo-local transpiler —
> `postgres-calculated-to-rulebook`, `rulebook-to-python`, `rulebook-to-golang`,
> `rulebook-to-cobol`, `rulebook-to-owl`, and more — as first-class `ssotme://`
> routes any `effortless build` can call.
