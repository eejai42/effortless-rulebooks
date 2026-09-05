# 📘 ross-style-business-rules — RuleSpeak®

_A small, complete claims model demonstrating declarative business rules rendering themselves as RuleSpeak and tracing down to ground truth. Five rules incorporate Ronald Ross's corrections: (1) policy 'active' is ground truth, not a derived system rule; (2) high-risk uses 'must be considered ... if', not 'when'; (3) claimant of record is a priority ordering, never 'otherwise/else'; (4) valid claim is a conjunction of declarative conditions; (5) approvable is 'only if valid' (necessary, not sufficient) — not 'iff'._

> Declarative business rules rendered from the rulebook. Every statement
> below expresses truth in the business domain — it is neither a procedure
> nor an imperative. The rulebook's formulas are the single source of truth;
> this document is their plain-language reading.

## 1 Business Vocabulary

| Term | Description | Narrative Comment |
|------|-------------|-------------------|
| **Policy** | A coverage agreement. Whether a policy is active is a fact about the policy (ground truth), recorded by the system — not a derived rule. | — |
| Name | The same as its policy ID. | _Logical primary key — mirrors PolicyId so every row is addressable by Name._ |
| Policyholder Name | A defined attribute. | _Name of the policyholder._ |
| Is Active | True when an empty string. | _Ground truth: whether the policy is currently in force. Per R. Ross: being active is a business STATE — a fact about the policy — not a derived business rule. The system's 'Is Active' indicator merely records this fact, so it lives at the leaves, not in a rule._ |
| Count of Covered Claimants | The number of claimants related to the policy. | _Number of claimants whose current policy is this one._ |
| **Claimant** | A person linked to incidents and (optionally) to claims. Carries a current policy, a favorite color, and a derived incident count. | — |
| Name | The same as its claimant name. | _Logical primary key — mirrors ClaimantName so every row is addressable by Name._ |
| Claimant Name | A defined attribute. | _Display name of the claimant._ |
| Favorite Color | A defined attribute. | _The claimant's favorite color (a single-select attribute)._ |
| Policy | A defined attribute. | _The claimant's current policy (foreign key to Policies)._ |
| Count of Incidents | The number of incidents related to the claimant. | _The number of incidents whose claimant is this claimant._ |
| Is High Risk | True when the count of incidents is greater than 2. | _A claimant must be considered high-risk if the claimant's incident count exceeds 2. (Ross: 'must be considered ... if'; '>2' means 3 or more.)_ |
| Policy is Active | True when the linked policy is active. | _Whether the claimant's current policy is active (ground truth carried over from the policy)._ |
| **Incident** | An event or loss that can give rise to a claim. Each incident involves exactly one claimant of record at the incident level. | — |
| Name | The same as its incident ID. | _Logical primary key — mirrors IncidentId so every row is addressable by Name._ |
| Incident Description | A defined attribute. | _Short description of the incident._ |
| Claimant | A defined attribute. | _The claimant involved in this incident (foreign key to Claimants via ClaimantId)._ |
| Incident Claimant Name | Taken from the linked claimant. | _Name of the incident's claimant (for readability)._ |
| **Claim** | A request to have an incident evaluated under a policy. Validity and approvability are computed, never entered. | — |
| Name | The same as its claim ID. | _Logical primary key — mirrors ClaimId so every row is addressable by Name._ |
| Incident | A defined attribute. | _The incident this claim references (exactly one; foreign key to Incidents via IncidentId)._ |
| Additional Claimant | A defined attribute. | _An optional second claimant linked to the same claim (foreign key to Claimants via ClaimantId)._ |
| Is Flagged for Review | True when an empty string. | _Ground truth: whether the claim has been flagged for manual review (e.g., possible fraud). A claim can be valid yet still be held here — which is exactly why 'approvable' is 'only if valid', not 'iff valid'._ |
| References Incident | True when the incident has a value. | _A claim references an incident when its incident is present._ |
| Has Additional Claimant | True when the additional claimant has a value. | _A claim has an additional claimant when one is present._ |
| Incident Claimant | Taken from the linked incident. | _The claimant of the referenced incident._ |
| Claimant of Record | Determined by priority: the additional claimant if the additional claimant flag is set; in all other cases, the incident claimant. | _The claimant of record for a claim is determined by priority: (1) the additional claimant, if one exists; (2) otherwise the incident's claimant. Per R. Ross: expressed as a priority ordering, not an 'otherwise/else' procedure — the ordering is the rule._ |
| Incident Claimant Policy Active | True when the linked incident claimant is active. | _Whether the incident claimant's current policy is active._ |
| Additional Claimant Policy Active | True when the linked additional claimant is active. | _Whether the additional claimant's current policy is active (false when there is no additional claimant)._ |
| Additional Claimant Favorite Color | Taken from the linked additional claimant. | _The additional claimant's favorite color (blank when there is no additional claimant)._ |
| Claimant of Record Incident Count | The count of incidents of the claim's claimant of record. | _The incident count of the claimant of record._ |
| Claimant of Record is High Risk | True when the linked claimant of record is high risk. | _Whether the claimant of record is high-risk (DR-2). Carries the named rule — IsValid references this field rather than re-deriving the threshold inline, keeping the '> 2 incidents' definition in exactly one place._ |
| Is Valid | True when all of the following hold: the references incident flag is set; at least one of the following holds: the incident claimant policy active flag is set or the additional claimant policy active flag is set; at least one of the following holds: the additional claimant flag is not set or the additional claimant favorite color is “red”; and the claimant of record is high risk flag is not set. | _All of the following must be true for a claim to be considered valid: it references an incident; at least one of the incident claimant's or the additional claimant's current policy is active; if an additional claimant exists, that claimant's favorite color is red; and the claimant of record is not high-risk (DR-2). Note: DR-4's fourth condition intentionally references the named high-risk rule rather than restating the incident-count threshold._ |
| Validity Deciding Factor | Determined by priority: “Valid — all conditions met” if the valid flag is set; “No incident referenced” if the references incident flag is not set; “No active policy on incident claimant or additional claimant” if it is not the case that at least one of the following holds: the incident claimant policy active flag is set or the additional claimant policy active flag is set; “Additional claimant's favorite color is not red” if all of the following hold: the additional claimant flag is set and the additional claimant favorite color is not “red”; “Claimant of record is high-risk (DR-2)” if the claimant of record is high risk flag is set; in all other cases, “Undetermined”. | _Names the single deciding reason for a claim's validity verdict — the first unmet condition, or that all conditions are met._ |
| Is Approvable | True when all of the following hold: the valid flag is set and the flagged for review flag is not set. | _A claim may be considered approvable only if it is valid and not flagged for review. Per R. Ross: 'only if', not 'if and only if' — validity is necessary but not sufficient. Stating it as 'iff' would wrongly make 'valid' and 'approvable' the same concept._ |
| Approvability Deciding Factor | Determined by priority: “Approvable” if the approvable flag is set; “Not approvable — claim is not valid” if the valid flag is not set; “Valid, but flagged for review” if the flagged for review flag is set; in all other cases, “Undetermined”. | _Names the single deciding reason for a claim's approvability verdict._ |

## 3 Operative Rules

_Operative rules state what the business **obliges**, **prohibits**, or
advises (**should**). Structural rules come from required fields and foreign keys;
semantic rules come from the Constraints table, each keyed on a boolean the rulebook
already computes (cross-referenced as DR-N in the Definitional Rules below)._

### Structural Constraints (from the schema)

- A policy **must** have a policyholder name, and record whether it is active.
- A claimant **must** have a claimant name and a favorite color.
- An incident **must** have an incident description and a claimant.
- A claim **must** have an incident, and record whether it is a flagged for review.

## 4 Definitional Rules

_All statements express truth in the business domain; they are neither
procedures nor imperatives. "iff" is avoided in favor of "only if" so a
one-directional necessity is not mistaken for an equivalence. A
**⚠︎ mechanical** chip marks a rule whose deterministic wording is faithful
but clunky — a flag for an optional downstream reword pass, not a defect._

| ID | Declarative rule |
|----|------------------|
| **DR-1 Name** | A policy's name is the same as its policy ID. |
| **DR-2 Count of Covered Claimants** | A policy's count of covered claimants is the number of claimants related to the policy. |
| **DR-3 Name** | A claimant's name is the same as its claimant name. |
| **DR-4 Count of Incidents** | A claimant's count of incidents is the number of incidents related to the claimant. |
| **DR-5 Is High Risk** | A claimant is considered high-risk if the count of incidents is greater than 2. |
| **DR-6 Policy is Active** | A claimant's policy is active when the linked policy is active. |
| **DR-7 Name** | An incident's name is the same as its incident ID. |
| **DR-8 Incident Claimant Name** | An incident's incident claimant name — taken from the linked claimant. |
| **DR-9 Name** | A claim's name is the same as its claim ID. |
| **DR-10 References Incident** | A claim is considered to reference an incident if the incident has a value. |
| **DR-11 Has Additional Claimant** | A claim is considered to have an additional claimant if the additional claimant has a value. |
| **DR-12 Incident Claimant** | A claim's incident claimant — taken from the linked incident. |
| **DR-13 Claimant of Record** | The claim's claimant of record is determined by the following priority:<br>1. the additional claimant, if the additional claimant flag is set;<br>2. in all other cases, the incident claimant. |
| **DR-14 Incident Claimant Policy Active** | A claim's incident claimant policy active when the linked incident claimant is active. |
| **DR-15 Additional Claimant Policy Active** | A claim's additional claimant policy active when the linked additional claimant is active. |
| **DR-16 Additional Claimant Favorite Color** | A claim's additional claimant favorite color — taken from the linked additional claimant. |
| **DR-17 Claimant of Record Incident Count** | A claim's claimant of record incident count is the count of incidents of the claim's claimant of record. |
| **DR-18 Claimant of Record is High Risk** | A claim's claimant of record is high risk when the linked claimant of record is high risk. |
| **DR-19 Is Valid** | A claim is considered valid if all of the following hold: the references incident flag is set; at least one of the following holds: the incident claimant policy active flag is set or the additional claimant policy active flag is set; at least one of the following holds: the additional claimant flag is not set or the additional claimant favorite color is “red”; and the claimant of record is high risk flag is not set. |
| **DR-20 Validity Deciding Factor** | The claim's validity deciding factor is determined by the following priority:<br>1. “Valid — all conditions met”, if the valid flag is set;<br>2. “No incident referenced”, if the references incident flag is not set;<br>3. “No active policy on incident claimant or additional claimant”, if it is not the case that at least one of the following holds: the incident claimant policy active flag is set or the additional claimant policy active flag is set;<br>4. “Additional claimant's favorite color is not red”, if all of the following hold: the additional claimant flag is set and the additional claimant favorite color is not “red”;<br>5. “Claimant of record is high-risk (DR-2)”, if the claimant of record is high risk flag is set;<br>6. in all other cases, “Undetermined”. |
| **DR-21 Is Approvable** | A claim is considered approvable if all of the following hold: the valid flag is set and the flagged for review flag is not set. |
| **DR-22 Approvability Deciding Factor** | The claim's approvability deciding factor is determined by the following priority:<br>1. “Approvable”, if the approvable flag is set;<br>2. “Not approvable — claim is not valid”, if the valid flag is not set;<br>3. “Valid, but flagged for review”, if the flagged for review flag is set;<br>4. in all other cases, “Undetermined”. |

## 5 Traceability to Schema

_The expression column is the rule's definition in RuleSpeak® notation —
the same logic the rulebook stores, written for a business reader._

| Schema element | Kind | Expression |
|----------------|------|------------|
| **Policies.Name** | formula | `PolicyId` |
| **Policies.CountOfCoveredClaimants** | rollup | `Count(Claimants via Policy)` |
| **Claimants.Name** | formula | `ClaimantName` |
| **Claimants.CountOfIncidents** | rollup | `Count(Incidents via Claimant)` |
| **Claimants.IsHighRisk** | formula | `CountOfIncidents > 2` |
| **Claimants.PolicyIsActive** | lookup | `Iferror(Lookup(Policies.IsActive via Policy), FALSE)` |
| **Incidents.Name** | formula | `IncidentId` |
| **Incidents.IncidentClaimantName** | lookup | `Iferror(Lookup(Claimants.ClaimantName via Claimant), "")` |
| **Claims.Name** | formula | `ClaimId` |
| **Claims.ReferencesIncident** | formula | `Incident <> ""` |
| **Claims.HasAdditionalClaimant** | formula | `AdditionalClaimant <> ""` |
| **Claims.IncidentClaimant** | lookup | `Iferror(Lookup(Incidents.Claimant via Incident), "")` |
| **Claims.ClaimantOfRecord** | formula | `If(HasAdditionalClaimant, AdditionalClaimant, IncidentClaimant)` |
| **Claims.IncidentClaimantPolicyActive** | lookup | `Iferror(Lookup(Claimants.PolicyIsActive via IncidentClaimant), FALSE)` |
| **Claims.AdditionalClaimantPolicyActive** | lookup | `Iferror(Lookup(Claimants.PolicyIsActive via AdditionalClaimant), FALSE)` |
| **Claims.AdditionalClaimantFavoriteColor** | lookup | `Iferror(Lookup(Claimants.FavoriteColor via AdditionalClaimant), "")` |
| **Claims.ClaimantOfRecordIncidentCount** | lookup | `Iferror(Lookup(Claimants.CountOfIncidents via ClaimantOfRecord), 0)` |
| **Claims.ClaimantOfRecordIsHighRisk** | lookup | `Iferror(Lookup(Claimants.IsHighRisk via ClaimantOfRecord), FALSE)` |
| **Claims.IsValid** | formula | `And(ReferencesIncident, Or(IncidentClaimantPolicyActive, AdditionalClaimantPolicyActive), Or(Not(HasAdditionalClaimant), Lower(AdditionalClaimantFavoriteColor) = "red"), Not(ClaimantOfRecordIsHighRisk))` |
| **Claims.ValidityDecidingFactor** | formula | `If(IsValid, "Valid — all conditions met", If(Not(ReferencesIncident), "No incident referenced", If(Not(Or(IncidentClaimantPolicyActive, AdditionalClaimantPolicyActive)), "No active policy on incident claimant or additional claimant", If(And(HasAdditionalClaimant, Lower(AdditionalClaimantFavoriteColor) <> "red"), "Additional claimant's favorite color is not red", If(ClaimantOfRecordIsHighRisk, "Claimant of record is high-risk (DR-2)", "Undetermined")))))` |
| **Claims.IsApprovable** | formula | `And(IsValid, Not(IsFlaggedForReview))` |
| **Claims.ApprovabilityDecidingFactor** | formula | `If(IsApprovable, "Approvable", If(Not(IsValid), "Not approvable — claim is not valid", If(IsFlaggedForReview, "Valid, but flagged for review", "Undetermined")))` |

---

_This document is rendered in **RuleSpeak®**, the declarative business-rule
notation created by **Ronald G. Ross**, and follows the conventions of
**SBVR** (Semantics of Business Vocabulary and Business Rules). With thanks to
Ronald G. Ross for RuleSpeak® and his foundational work on business rules —
[www.RonRoss.info](https://www.RonRoss.info)._
