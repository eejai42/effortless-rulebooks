# PKO-Native Procedural Knowledge Rulebook

This directory is a concrete proof of the architecture:

```text
source representation
    -> one canonical PKO-native Effortless Rulebook
        -> natural-language procedure documentation
        -> financial SOPs
        -> email/SMS policies
        -> governance handbook
        -> any existing Effortless execution substrate
```

The canonical asset is [`effortless-rulebook/procedural-knowledge-ontology-rulebook.json`](effortless-rulebook/procedural-knowledge-ontology-rulebook.json). It is an Effortless Rulebook whose structural model is aligned to the **Procedural Knowledge Ontology (PKO) 2.0.0** and its **industry module 2.0.0**.

- PKO core version IRI: `https://w3id.org/pko/2.0.0`
- PKO industry version IRI: `https://w3id.org/pko/industry/2.0.0`
- ERB-PKO profile: `schemas/pko-erb-profile-1.0.0.schema.json`
- Canonical rulebook release: `1.0.0`

## What is represented

The single rulebook includes:

- procedure specifications and separately modeled executions;
- procedure versions, lifecycle status changes, steps, transitions, alternatives, and fallbacks;
- human actions, software functions, tools, requirements, and verifications;
- agents, stable roles, and time-bounded role assignments;
- resources, provenance, operational records, and live data bindings;
- errors, issue occurrences, questions, feedback, FAQs, and explanations;
- tacit, implicit, explicit, and situated knowledge;
- practitioner elicitation, rationales, exceptions, and known knowledge gaps;
- stewardship, authority, change requests, periodic reviews, and semantic versioning;
- communities of practice, mentorship, retrospectives, and learning evidence;
- financial-control semantics and email/SMS communication policy semantics.

The mock data contains two complete procedure families:

1. **Quarter-End Financial Close**
2. **Workforce Policy Change and Employee Notification**

## Every derived field exists because a named role asked a question

The model was always good at *specifying* obligations and bad at *witnessing*
their breach. A requirement could say "the preparer may not be the final
approver" and nothing evaluated it; a communication policy could require
consent and nothing could tell a lawful send from an unlawful one.

Three tables record the fix and its provenance:

```text
WitnessLoops -> RoleQuestions -> RulebookFields
    ^               ^                  ^
  loop N      asked by a Role   InventedForQuestion FK
```

Each of the twelve roles in the model — the controller, the CFO, the process
steward, the knowledge authority, employment counsel, the notification
pipeline, the variance-review AI — asks questions in its own voice, and every
predicate invented to answer one traces back through `InventedForQuestion`.
Fields that predate the exercise carry null rather than a fabricated
motivation.

Some of what the witnesses found, all from data that was already in the model:

| Witness | Reading |
|---|---|
| `Requirements.IsInoperativeControl` | 6 of 13 blocking controls bound to steps with **zero** satisfaction records ever — structurally incapable of failing |
| `Requirements.HasComputedWitness` | only 4 of 13 requirements have any computed predicate evaluating them |
| `StepExecutions.ProceededPastBlockingControl` | the reconciliation step closed with a 7-year evidence-retention control unsatisfied |
| `VerificationOutcomes.IsUnbackedObservation` | a reconciliation reported PASS with no workpaper attached |
| `MessageDeliveries.IsConsentViolation` | an SMS delivered to a recipient who never consented — while correctly *not* flagging the send that was properly suppressed |
| `StepTransitions.IsUnwalkedRecoveryPath` | 4 recovery paths never once exercised, including the route taken when reconciliation fails |
| `KnowledgeFragments.IsUndefendableTacitClaim` | tacit know-how whose only source has no current role assignment |
| `RoleAssignments.IsHumanToNonHumanHandover` | an AI agent took over a control function from a named human, on a date, with the approving authority recorded |

Two rules keep this honest:

- **Non-vacuity.** A boolean that is all-true or all-false over the seed data
  states nothing about the procedures. `tools/verify_witnesses.sh` reports every
  witness's distribution and flags the ones that cannot discriminate.
- **Violations are seeded, proven, then remediated *in model*.** The violating
  rows stay — deleting them would destroy the evidence — with the exception
  invoked and the knowledge gap resolved alongside. The arc is the story.

```bash
tools/verify_witnesses.sh            # rebuild, reload, report every witness
python3 tools/reconcile_field_catalog.py --check   # catalog drift is an error
```

## Native PKO versus the ERB-PKO extension

The project does not relabel every enterprise concept as PKO.

Exact PKO, P-Plan, PROV-O, DCAT, DCMI, OWL-Time, PRO, Metadata4Ing, and ODRL mappings are recorded in the `SemanticMappings` table. Concepts that PKO 2.0.0 does not define directly—such as `KnowledgeFragment`, `ElicitationSession`, `KnowledgeGap`, `StewardshipAssignment`, and `OperationalBinding`—are explicitly identified as `urn:effortless:pko-extension:*`.

See [`PKO-ALIGNMENT.md`](PKO-ALIGNMENT.md).

## Run it

```bash
./start.sh            # validate + regenerate every projection + run the tests
./start.sh validate   # validate only
./start.sh test       # tests only
./start.sh open       # full loop, then open the generated documentation
```

`./start.sh` is the one command for this domain. It has no server — the deliverables are documents — so start.sh validates the rulebook, regenerates all projections, exercises the BPM process-export adapter end-to-end, and runs the conformance tests.

Separately, the standard ERB build produces the plain-English RuleSpeak rendering via the published transpiler:

```bash
effortless build      # -> rulespeak/rulespeak.html + rulespeak.md
```

### Running the steps individually

No third-party Python packages are required.

```bash
# Validate the canonical rulebook
./bin/pko-rulebook-validate   -i effortless-rulebook/procedural-knowledge-ontology-rulebook.json

# Generate full human-readable procedure documentation
./bin/pko-rulebook-to-natural-language-docs   -i effortless-rulebook/procedural-knowledge-ontology-rulebook.json   -o generated/natural-language-docs.md

# Generate a finance-specific SOP
./bin/pko-rulebook-to-financial-sops   -i effortless-rulebook/procedural-knowledge-ontology-rulebook.json   -o generated/financial-sops.md

# Generate channel-specific employee email/SMS policies
./bin/pko-rulebook-to-text-email-policies   -i effortless-rulebook/procedural-knowledge-ontology-rulebook.json   -o generated/text-email-policies.md

# Generate governance and knowledge-health documentation
./bin/pko-rulebook-to-governance   -i effortless-rulebook/procedural-knowledge-ontology-rulebook.json   -o generated/governance.md
```

The generated Markdown files are disposable projections. Edit the rulebook, not the projection.

## One adapter unlocks every projection

[`tools/bpm_process_export_to_pko.py`](tools/bpm_process_export_to_pko.py) is a deliberately simple example of a source adapter.

```bash
./bin/bpm-process-export-to-pko   -i examples/bpm-vendor-payment.json   -o generated/bpm-imported-pko-rulebook.json

./bin/pko-rulebook-to-financial-sops   -i generated/bpm-imported-pko-rulebook.json   -o generated/bpm-financial-sops.md
```

The adapter maps a BPM process into the same canonical PKO rulebook tables:

- process -> `Procedures` + `ProcedureVersions`
- activity -> `Steps`
- edge -> `StepTransitions`
- role and assignee -> `Roles`, `Agents`, and `RoleAssignments`
- control -> `Requirements` + `StepRequirements`
- rationale -> `Rationales`
- exception -> `Exceptions`

Once that mapping exists, the imported process immediately gains every PKO projection above, plus the broader Effortless substrate matrix.

## Validation contract

The validator checks:

- ERB table and field conventions;
- unique stored identifiers and referential integrity;
- acyclic table relationships;
- calculated `Name` aliases;
- exact PKO 2.0.0 profile references;
- specification/execution separation;
- required semantic mappings;
- explicit coverage of the procedural-knowledge goals listed above.

The current canonical rulebook passes the validation contract. See [`generated/validation-report.md`](generated/validation-report.md).

## Tests

```bash
./start.sh test
# or: python3 -m unittest discover -s tests -v
```

## Attribution and status

PKO was created by Valentina Anita Carriero, Mario Scrocca, Ilaria Baroni, Antonia Azzini, and Irene Celino and is published under CC BY 4.0. This experiment references and aligns to PKO; it is not an official PKO distribution and does not imply endorsement by PKO's authors, Jessica Talisman, or any other third party.

See [`NOTICE.md`](NOTICE.md).

---

## Local transpiler bus (`localhost:4242`)

> **All 13 local transpilers live on `localhost:4242`.** Start the bus with
> `./start.sh` from `ssotme-proxy/` at the repo root (it is root
> infrastructure again — see the root rulebook's `LegacyRunnerCapabilities`).
> The ssotme-proxy then exposes every repo-local transpiler —
> `postgres-calculated-to-rulebook`, `rulebook-to-python`, `rulebook-to-golang`,
> `rulebook-to-cobol`, `rulebook-to-owl`, and more — as first-class `ssotme://`
> routes any `effortless build` can call.
