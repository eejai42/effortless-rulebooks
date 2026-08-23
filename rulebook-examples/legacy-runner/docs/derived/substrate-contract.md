<!-- GENERATED FILE — DO NOT EDIT. -->
<!-- Source: effortless-platform/effortless-rulebook/effortless-rulebook.json (table: `SubstrateContractPhases`) -->
<!-- Regenerate with: cd effortless-platform && effortless build -->

# Substrate Contract — Inject / Execute / Grade

The three-phase contract every execution substrate implements. Inject is structural (schema → SDK), Execute is functional (compute), Grade is comparison. All three are 100% domain-agnostic — they translate whatever the rulebook defines without knowing what it means. Together with EvaluationSteps (the substeps within each phase) and EvaluationArtifacts (the JSON files that flow between phases), this forms the full evaluation subgraph: Phase → Steps → Artifacts.

## Phase 1: Inject

**Input.** effortless-rulebook.json (schema + formulas)

**Output.** Runnable substrate artifact (SDK / schema / workbook / ontology / DDL)

**Script pattern.** `execution-substrates/<technology>/inject-into-<technology>.py`

Reads the rulebook schema and generates entity structures (1:1 with entities) plus computation functions (1:1 with computed columns). When the rulebook changes, re-running the injector regenerates the substrate artifact — the injector itself never changes.

_Why domain-agnostic:_ The injector script must contain ZERO domain words (no 'language', 'workflow', 'syntax', 'customer'). It only translates generic rulebook structures into target-language constructs.

## Phase 2: Execute

**Input.** blank-test.json (raw fields + null computed fields)

**Output.** test-answers.json (all fields, including computed)

**Script pattern.** `execution-substrates/<technology>/take-test.{py,go,sh}`

Reads blank-test.json, populates the generated entity structures, calls the generated Calc*() functions to fill in computed columns, emits test-answers.json.

_Why domain-agnostic:_ The test runner does NOT know what fields mean. It just unmarshals JSON, calls the generated functions, and remarshal the result. Same main() pattern works for every rulebook.

## Phase 3: Grade

**Input.** test-answers.json (substrate output) + answer-key.json (from rulebook seed data)

**Output.** test-results.md (per-substrate) + all-tests-results.md (aggregate)

**Script pattern.** `orchestration/test-orchestrator.py`

Field-by-field, row-by-row comparison of every substrate's test-answers.json against the canonical answer-key.json derived from the rulebook seed data. No substrate holds a privileged position; answer keys come from the rulebook, not from any one substrate.

_Why domain-agnostic:_ The grader compares JSON structures. It has no opinion about which fields exist or what they mean — disagreement is reported field-by-field.

