# Claims System — Ross-style Business Rules

## What this is for

This rulebook was built for a specific reader — Ronald Ross, the business-rules / SBVR figure — who hand-corrected an earlier draft of these exact five rules. The rulebook re-encodes his corrections as live, executable structure. The narrow pitch: a reader given only the formulas and field types can recover the rules, the typing decisions, and the one case that proves the "iff" point — the meaning is legible in the structure, not buried in code or comments.

---

## The keystone case: claim-D

claim-D is the reason DR-5 is "only if," not "iff."

**claim-D:** Bob's incident (broken window), no additional claimant, flagged for manual review.

- `IsValid = true` — all four conditions are met.
- `IsApprovable = false` — valid, but held for review.

If `IsApprovable` were defined as "iff valid," claim-D would be approvable. It isn't. That gap — valid yet not approvable — is the concrete proof that these are two different concepts and the rule cannot be "iff." The dataset was built around this case.

---

## The Five Ross Corrections

| # | Rule | Correction |
|---|------|-----------|
| DR-1 | Active policy | Demoted from a derived "system rule" to raw ground truth on `Policies.IsActive`. Being active is a business *state* — a fact about the policy, not a rule that derives from other facts. |
| DR-2 | High-risk claimant | "A claimant **must be considered high-risk if** incident count exceeds 2." Not "when." The `if` marks a definitional rule, not a process trigger. |
| DR-3 | Claimant of record | A **priority ordering** — (1) additional claimant if present; (2) incident claimant. Not "additional claimant, otherwise/else incident claimant." The ordering is the rule; "else" makes it sound procedural. |
| DR-4 | Valid claim | An explicit **conjunction of declarative conditions** with a nested disjunction. See fields below. |
| DR-5 | Approvable | "**Only if** valid (and not flagged for review)" — validity is necessary, not sufficient. "Iff valid" would wrongly equate the two concepts. claim-D is the proof. |

---

## Entities

### Policies
A coverage agreement. `IsActive` is a raw field — ground truth, not derived.

`CountOfCoveredClaimants` (aggregation) is present to show a rollup exists; no validity rule consumes it.

### Claimants
A person linked to incidents. `IsHighRisk` (DR-2) derives from `CountOfIncidents > 2`. This named rule is carried forward into Claims via a `ClaimantOfRecordIsHighRisk` lookup so `IsValid` references the rule by name rather than restating the threshold.

### Incidents
An event or loss that gives rise to a claim. Each incident names exactly one claimant.

### Claims
`IsValid` and `IsApprovable` are computed, never entered.

**IsValid** requires ALL of:
1. `ReferencesIncident` — the claim names an incident
2. `OR(IncidentClaimantPolicyActive, AdditionalClaimantPolicyActive)` — at least one active policy
3. `IF(HasAdditionalClaimant, AdditionalClaimantFavoriteColor = "red", TRUE)` — color condition when an additional claimant exists
4. `NOT(ClaimantOfRecordIsHighRisk)` — the claimant of record is not high-risk (references DR-2, not a restated threshold)

**IsApprovable** requires: `IsValid AND NOT(IsFlaggedForReview)`

---

## Dataset

Each row exercises a specific branch. "Deciding factor (field value)" quotes the stored `ValidityDecidingFactor` / `ApprovabilityDecidingFactor` field exactly.

| Claim | Verdict | Deciding factor (field value) |
|-------|---------|-------------------------------|
| claim-A | Approvable | "Valid — all conditions met" |
| claim-B | Not approvable | "Claimant of record is high-risk (DR-2)" — Carol has 3 incidents |
| claim-C | Not approvable | "Additional claimant's favorite color is not red" — Alice's is Blue |
| **claim-D** | **Valid, not approvable** | `IsValid`: "Valid — all conditions met" / `IsApprovable`: "Valid, but flagged for review" — **the keystone case** |
| claim-E | Approvable | Dave's policy is lapsed; Bob (additional claimant, Red) has an active policy — the disjunction fires on the second branch |

---

## Open interpretation (DR-4, condition 2)

The original correction read "the *incident* is active," which is incoherent against the schema (incidents carry no active state). The current reading — "at least one of the incident claimant's or the additional claimant's policy is active" — is the sensible interpretation. It is an interpretation, not a transcription. This should be confirmed with the reviewer before the rulebook is treated as settled.

---

## Open design question (DR-2 and DR-4 threshold)

DR-4's fourth condition now references `ClaimantOfRecordIsHighRisk` (the named DR-2 rule) rather than the raw `CountOfIncidents < 3` comparison. This eliminates the duplicate threshold. But the underlying question is definitional: is the validity threshold *the same concept* as high-risk, or a coincidentally shared number that might diverge?

- If the same → the current design (reference DR-2) is correct and DRY.
- If different → restore the separate `CountOfIncidents`-based condition in `IsValid` and give it its own name. The threshold would then live in two places intentionally.

This is a question for the reviewer. The current rulebook chooses "same concept."

---

## What is structural vs. what is annotated

The executable semantics (priority-IF, `AND(IsValid, NOT(flagged))`, raw-vs-calculated field typing) are recoverable from the formulas and field types alone. The attribution ("this was Ross's correction") rides along in `Description` fields and `__meta__.ross_corrections`. Both are present — but they are different kinds of information. Stripping the prose notes and re-generating would yield the same rules, without knowing where they came from.

---

## RuleSpeak output

After `effortless build`, open [rulespeak/rulespeak.html](rulespeak/rulespeak.html) to read every rule in plain English, traceable to its formula.

## App

`app/` is a small Express + React app that reads **only** the `vw_*` views of
`erb_ross_style_business_rules`. The primary screen is a claims desk: one card per
Claim showing incident, incident claimant, additional claimant, claimant of record,
the review flag, the `IsValid` / `IsApprovable` verdicts with their deciding-factor
text, and (expandable) every derived rule column beside the rule's RuleSpeak
wording from the hub's field descriptions. Tabs show Policies, Claimants and
Incidents, plus an "All views" browser.

```bash
./start.sh        # web http://localhost:43104 · API http://localhost:43304/api/views
```

---

## Local transpiler bus (`localhost:4242`)

> **All 13 local transpilers live on `localhost:4242`.** Start the bus with
> `./start.sh` from `ssotme-proxy/` at the repo root (it is root
> infrastructure again — see the root rulebook's `LegacyRunnerCapabilities`).
> The ssotme-proxy then exposes every repo-local transpiler —
> `postgres-calculated-to-rulebook`, `rulebook-to-python`, `rulebook-to-golang`,
> `rulebook-to-cobol`, `rulebook-to-owl`, and more — as first-class `ssotme://`
> routes any `effortless build` can call.
