# 📘 PKO-Native Procedural Knowledge Rulebook — RuleSpeak®

_A canonical Effortless Rulebook profile aligned to the Procedural Knowledge Ontology (PKO) 2.0.0. It represents procedure specifications separately from executions and includes versioning, status changes, steps, transitions, actions, software functions, tools, requirements, verifications, resources, agents, roles in time, issues, errors, questions, feedback, FAQs, explanations, governance, tacit/implicit/explicit knowledge capture, operational data bindings, learning, and communication policy projections. PKO-native terms are mapped exactly; enterprise knowledge-governance additions are explicitly identified as ERB-PKO extensions._

> Declarative business rules rendered from the rulebook. Every statement
> below expresses truth in the business domain — it is neither a procedure
> nor an imperative. The rulebook's formulas are the single source of truth;
> this document is their plain-language reading.

## 1 Business Vocabulary

| Term | Description | Narrative Comment |
|------|-------------|-------------------|
| **Rulebook Releas** | Version ledger for the canonical ERB-PKO rulebook itself. This is distinct from PKO Procedure versioning. | — |
| Name | Computed as the rulebook version, followed by “ / PKO ”, followed by the pko core version iri. | _Human-readable calculated display alias for the RulebookReleases row._ |
| Rulebook Version | A defined attribute. | _Semantic version of this canonical rulebook release._ |
| Profile Version | A defined attribute. | _Version of the ERB-PKO profile schema._ |
| Profile Schema Path | A defined attribute. | _Repository-relative path to the ERB-PKO JSON profile schema._ |
| Pko Core Version Iri | A defined attribute. | _Exact version IRI of the PKO core ontology used by this release._ |
| Pko Industry Version Iri | A defined attribute. | _Exact version IRI of the PKO industry module used by this release._ |
| Issued At | A defined attribute. | _Timestamp at which this rulebook release was issued._ |
| Status | A defined attribute. | _Release status such as Draft, Candidate, or Published._ |
| Changelog | A defined attribute. | _Human-readable semantic changelog for this release._ |
| Is Current | True when an empty string. | _TRUE only for the current rulebook release._ |
| **Ontology Profile** | Versioned ontology and vocabulary dependencies. PKO mappings always identify the exact profile and version. | — |
| Name | Computed as the label, followed by a space, followed by the version. | _Human-readable calculated display alias for the OntologyProfiles row._ |
| Label | A defined attribute. | _Human-readable ontology or vocabulary name._ |
| Version | A defined attribute. | _Referenced release or specification version._ |
| Version Iri | A defined attribute. | _Exact version IRI or normative specification URI._ |
| Namespace Iri | A defined attribute. | _Namespace used for class/property IRIs._ |
| License | A defined attribute. | _License or standards body attribution._ |
| Scope | A defined attribute. | _How the profile is used in this rulebook._ |
| **Evaluation Context** | The instant this rulebook's time-dependent witnesses are evaluated against. Modeled as data rather than wall-clock so every freshness, overdue, and validity answer is reproducible and auditable: asking the same question tomorrow yields the same answer. Exactly one row carries IsCurrent. | — |
| Name | Computed as the label, followed by “ @ ”, followed by the as of instant. | _Human-readable calculated display alias for the EvaluationContexts row._ |
| Label | A defined attribute. | _What this evaluation instant represents._ |
| As of Instant | A defined attribute. | _The instant all time-dependent witnesses are evaluated against._ |
| Is Current | True when an empty string. | _TRUE for the single active evaluation context._ |
| Rationale | A defined attribute. | _Why this instant was chosen._ |
| Semantic Type Iri | A defined attribute. | _Extension class IRI._ |
| **Organization** | Organizations that own, adopt, govern, or execute procedures. Maps to prov:Organization. | — |
| Name | The same as its display name. | _Human-readable calculated display alias for the Organizations row._ |
| Display Name | A defined attribute. | _Organization's human-readable name._ |
| Organization Type | A defined attribute. | _Type such as Company, Department, Vendor, or Regulator._ |
| External Identifier | A defined attribute. | _Identifier in an operational directory or master-data system._ |
| Semantic Type Iri | A defined attribute. | _Exact RDF class IRI for the organization._ |
| **Agent** | Human and software agents that create, modify, approve, or execute procedural knowledge. Maps to prov:Agent. | — |
| Name | The same as its display name. | _Human-readable calculated display alias for the Agents row._ |
| Display Name | A defined attribute. | _Agent's human-readable name._ |
| Agent Kind | A defined attribute. | _Human, AIAgent, AutomatedPipeline, Organization, or another explicit agent category._ |
| Organization | A defined attribute. | _Organization to which the agent belongs._ |
| Contact Address | A defined attribute. | _Contact address when applicable._ |
| Version or Employment Key | A defined attribute. | _Model version, pipeline release, or employment assignment key._ |
| Count of Current Role Assignments | The number of role assignments related to the agent. | _How many role assignments this agent currently holds. Counts only CURRENT assignments via the CurrentAgentKey echo — counting all assignments would report a departed agent as engaged forever._ |
| Is Still Engaged | True when the count of current role assignments is greater than 0. | _TRUE when this agent currently holds at least one role in the organization._ |
| Decision Count | The number of agent decision records related to the agent. | _Total decisions this agent has recorded._ |
| Overridden Decision Count | The number of agent decision records related to the agent. | _Decisions by this agent that a human corrected or reversed._ |
| Override Rate Percent | Determined by priority: 0 if the decision count is 0; in all other cases, the overridden decision count times 100 divided by the decision count. | _Percentage of this agent's decisions that were overridden by a human._ |
| Is Non Human | True when it is not the case that the agent kind is “Human”. | _TRUE when this agent is an AI agent or an automated pipeline._ |
| Boundary Violation Count | The number of agent decision records related to the agent. | _Number of decisions by this agent that violated an authority boundary._ |
| Is Operating Outside Boundary | True when the boundary violation count is greater than 0. | _TRUE when this agent has made at least one decision an authority boundary forbids._ |
| Draft Decision Count | The number of agent decision records related to the agent. | _Number of drafting decisions this agent has made._ |
| Overridden Draft Count | The number of agent decision records related to the agent. | _Number of this agent's drafting decisions a human corrected or reversed._ |
| Draft Rewrite Rate Percent | Determined by priority: 0 if the draft decision count is 0; in all other cases, the overridden draft count times 100 divided by the draft decision count. | _Percentage of this agent's drafting output that a human rewrote._ |
| Semantic Type Iri | A defined attribute. | _Exact semantic type IRI used when projecting the agent._ |
| **Role** | Stable organizational functions separated from the agents that currently fill them. Maps to pro:Role. | — |
| Name | The same as its label. | _Human-readable calculated display alias for the Roles row._ |
| Label | A defined attribute. | _Human-readable role label._ |
| Organization | A defined attribute. | _Organization that owns the role._ |
| Current Agent | A defined attribute. | _Current agent filling the role; history is retained in RoleAssignments._ |
| Current Agent Kind | Taken from the linked current agent. | _Agent category of the current role filler._ |
| Responsibility | A defined attribute. | _Accountability and responsibility assigned to the role._ |
| Active Assignment Count | The number of role assignments related to the role. | _Total number of assignment rows ever recorded against this role._ |
| Currently Covered Assignment Count | The number of role assignments related to the role. | _Number of assignment rows for this role that are in force right now._ |
| Has No Current Holder | True when the currently covered assignment count is 0. | _TRUE when no assignment currently covers this role — the role is uncovered._ |
| Count of Awaited Decisions | The number of change requests related to the role. | _How many change requests name this role as the deciding authority._ |
| Current Assignment | A defined attribute. | _The RoleAssignments id of the assignment by which this role is currently held. Deliberately a raw identifier, not a relationship: RoleAssignments already points at Roles, so an FK back would make the two mutually dependent and this rulebook must stay acyclic._ |
| Current Assignment Valid From | Taken from the linked current assignment. | _Start of the currently-in-force assignment for this role._ |
| Is Non Human Held | True when it is not the case that the current agent kind is “Human”. | _TRUE when the role's current agent is an AI agent or automated pipeline._ |
| Is Ungoverned Non Human Role | True when all of the following hold: the non human held flag is set and the no current holder flag is set. | _TRUE when a role is pointed at a non-human agent but has no assignment row granting it._ |
| Departed Assignment Count | The number of role assignments related to the role. | _How many assignments to this role have ended._ |
| Has Lost a Holder | True when the departed assignment count is greater than 0. | _Whether anyone has ever departed this role._ |
| Is Vacated Role | True when all of the following hold: the lost a holder flag is set and the no current holder flag is set. | _A role somebody departed and that nobody currently covers._ |
| Ungrounded Boundary Count | The number of authority boundaries related to the role. | _How many boundaries constrain this role on lapsed authority._ |
| Is Governed by Lapsed Authority | True when the ungrounded boundary count is greater than 0. | _TRUE when at least one constraint on this role rests on knowledge that is no longer valid._ |
| Unescalated Refusal Count | The number of send intents related to the role. | _How many refusals this role should have been told about and was not._ |
| Unauthorized Enforcement Assignment Count | The number of role assignments related to the role. | _How many current assignments of this role are unauthorized enforcement assignments._ |
| Is Ungoverned Enforcement Role | True when the unauthorized enforcement assignment count is greater than 0. | _TRUE when a role that enforces controls on others is held with no recorded authorization._ |
| Semantic Type Iri | A defined attribute. | _Exact semantic type IRI for the role._ |
| **Role Assignment** | Time-bounded records of agents holding roles. Maps to pro:RoleInTime and preserves assignment history instead of overwriting it. | — |
| Name | Computed as the role, followed by “ @ ”, followed by the valid from. | _Human-readable calculated display alias for the RoleAssignments row._ |
| Role | A defined attribute. | _Role held during the assignment._ |
| Agent | A defined attribute. | _Agent holding the role._ |
| Valid From | A defined attribute. | _Start of the assignment's valid-time interval._ |
| Valid to | A defined attribute. | _End of the assignment's valid-time interval; null means open-ended._ |
| Reason | A defined attribute. | _Rationale for the assignment or reassignment._ |
| Status | A defined attribute. | _Active, Superseded, Planned, or Revoked._ |
| Evaluation Context | A defined attribute. | _The evaluation context this assignment's currency is judged under._ |
| As of Instant | Taken from the linked evaluation context. | _The evaluation instant this assignment's currency is judged against._ |
| Is Current | True when all of the following hold: the valid from is at most the as of instant and at least one of the following holds: the valid to is blank or the valid to is greater than the as of instant. | _TRUE when the assignment is valid now._ |
| Current Agent Key | Determined by priority: the agent if the current flag is set; in all other cases, an empty string. | _Echoes the Agent id only while this assignment is current; empty otherwise. Lets a parent count CURRENT assignments with a single-criterion COUNTIFS, which is the only shape this transpiler translates correctly._ |
| Is Currently Valid | True when all of the following hold: the status is “Active” and at least one of the following holds: the valid to is blank or the valid to is greater than the as of instant. | _TRUE when this role assignment is active and has not lapsed._ |
| Agent Role Key | Determined by priority: the agent, followed by “|”, followed by the role if the currently valid flag is set; in all other cases, an empty string. | _Composite agent+role key, emitted only for currently-valid assignments._ |
| Has Departed | True when all of the following hold: the valid to has a value and the valid to is at most the as of instant. | _TRUE when this role assignment has ended — the agent no longer holds the role._ |
| Covers Now | True when all of the following hold: the status is “Active”; the valid from is at most the as of instant; and at least one of the following holds: the valid to is blank or the valid to is greater than the as of instant. | _TRUE when this assignment is both status-Active and inside its valid-time window right now._ |
| Role When Covering | Determined by priority: the role if the covers now flag is set; in all other cases, an empty string. | _Echoes the role id when this assignment is currently in force, blank otherwise._ |
| Agent Kind | Taken from the linked agent. | _Whether the agent holding this assignment is Human, AIAgent, or AutomatedPipeline._ |
| Is Non Human Assignment | True when it is not the case that the agent kind is “Human”. | _TRUE when this assignment places a non-human agent into the role._ |
| Supersedes Assignment | A defined attribute. | _The assignment this one replaced, if any._ |
| Predecessor Agent Kind | Taken from the linked supersedes assignment. | _Agent kind of the assignment this one superseded._ |
| Is Human to Non Human Handover | True when all of the following hold: the predecessor agent kind is “Human” and the non human assignment flag is set. | _TRUE when this assignment handed a role from a human to a non-human agent._ |
| Approving Authority Role | A defined attribute. | _Role that approved this assignment._ |
| Authorizing Change Request | A defined attribute. | _Change request under which this assignment was approved._ |
| Is Unauthorized Non Human Assignment | True when all of the following hold: the non human assignment flag is set and the approving authority flag is not set. | _TRUE when a non-human agent holds this role with no approving authority recorded at all. An authority named without a change request is still an authority; the separate WasAuthorizedByChangeRequest column carries that weaker distinction._ |
| Was Authorized by Change Request | True when all of the following hold: the approving authority flag is set and the authorizing change request has a value. | _TRUE when this assignment's authorization is traceable to a change request, not merely to a named role. The stronger form of authorization, kept separate so the weaker one is not silently reported as unauthorized._ |
| Decision Count | The number of agent decision records related to the role assignment. | _Decisions made under this assignment._ |
| Overridden Decision Count | The number of agent decision records related to the role assignment. | _Decisions made under this assignment that a human corrected or reversed._ |
| Override Rate Percent | Determined by priority: 0 if the decision count is 0; in all other cases, the overridden decision count times 100 divided by the decision count. | _Percentage of decisions under this assignment that a human overrode._ |
| Predecessor Override Rate Percent | Taken from the linked supersedes assignment. | _Override rate of the assignment this one superseded._ |
| Quality Regressed Vs Predecessor | True when all of the following hold: the supersedes assignment has a value and the override rate percent is greater than the predecessor override rate percent. | _TRUE when this assignment is overridden by humans more often than the assignment it replaced._ |
| Departed Role Key | Determined by priority: the role if the departed flag is set; in all other cases, an empty string. | _Composite-key echo: the role this assignment covered when the assignment has ended, blank otherwise._ |
| Minimum Decisions for Comparison | A defined attribute. | _The number of decisions below which an override-rate comparison is not considered evidentially meaningful for this role._ |
| Predecessor Decision Count | Taken from the linked supersedes assignment. | _How many decisions the superseded assignment produced._ |
| Has Sufficient Sample | True when the decision count is at least the minimum decisions for comparison. | _TRUE when this assignment has produced enough decisions for its override rate to mean anything._ |
| Predecessor Has Sufficient Sample | True when the predecessor decision count is at least the minimum decisions for comparison. | _TRUE when the predecessor assignment produced enough decisions to compare against._ |
| Comparison is Evidentially Sound | True when all of the following hold: the sufficient sample flag is set and the predecessor has sufficient sample flag is set. | _TRUE when both sides of the override-rate comparison rest on adequate samples._ |
| Single Override Swing Percent | Determined by priority: 100 divided by the decision count if the decision count is greater than 0; in all other cases, 0. | _How many percentage points one additional override would move this assignment's rate. The fragility of the number._ |
| Quality Verdict is Unsupported | True when all of the following hold: the comparison is evidentially sound flag is not set and the quality regressed vs predecessor flag is not set. | _TRUE when a quality verdict is being reported for this assignment on a sample too small to support it._ |
| Is Unmeasured Automation Handover | True when all of the following hold: the human to non human handover flag is set and the comparison is evidentially sound flag is not set. | _TRUE when a human-to-machine handover is operating without a statistically meaningful quality comparison behind it._ |
| Error Correction Count | The number of agent decision records related to the role assignment. | _How many of this assignment's decisions were overridden because they were wrong._ |
| Error Rate Percent | Determined by priority: the error correction count times 100 divided by the decision count if the decision count is greater than 0; in all other cases, 0. | _Percentage of this assignment's decisions overridden as errors -- the override rate with reserved-judgment overrides removed._ |
| Authorization Decided At | A defined attribute. | _When the approving authority actually granted this assignment. Empty when no authorization was ever recorded._ |
| Authorization Reviewed At | A defined attribute. | _When the authorization for this assignment was last re-examined._ |
| Authorization Review Cadence Days | A defined attribute. | _How often this assignment's authorization is promised to be re-examined._ |
| Has Dated Authorization | True when all of the following hold: the approving authority role has a value and the authorization decided at has a value. | _TRUE when this assignment carries both a named approving authority and the date they granted it._ |
| Days Since Authorization Review | Determined by priority: the number of days from the authorization reviewed at to the as of instant if the authorization reviewed at has a value; in all other cases, the number of days from the valid from to the as of instant. | _How long since this assignment's authorization was last re-examined._ |
| Authorization is Overdue for Review | True when all of the following hold: the authorization review cadence days is greater than 0 and the days since authorization review is greater than the authorization review cadence days. | _TRUE when the promised re-examination interval has elapsed without a review._ |
| Is Standing Unreviewed Automation | True when all of the following hold: the covers now flag is set and all of the following hold: the non human assignment flag is set and the authorization is overdue for review flag is set. | _TRUE when a currently-active non-human assignment has been running past its authorization review date._ |
| Is Unconditioned Automation Handover | True when all of the following hold: the human to non human handover flag is set and the authorization review cadence days is 0. | _TRUE when a human-to-machine handover was authorized with no promised review cadence at all -- granted once, permanently._ |
| Max Tolerable Error Rate Percent | A defined attribute. | _The error rate at or above which this assignment must stop making decisions unaided._ |
| Exceeds Tolerable Error Rate | True when all of the following hold: the max tolerable error rate percent is greater than 0 and the error rate percent is at least the max tolerable error rate percent. | _TRUE when this assignment's error rate has reached the threshold set when it was authorized._ |
| Boundary Violation Count for Assignment | The number of agent decision records related to the role assignment. | _How many decisions under this assignment violated an authority boundary._ |
| Has Any Boundary Violation | True when the boundary violation count for assignment is greater than 0. | _TRUE when any decision under this assignment crossed a boundary it was forbidden to cross._ |
| Has Ungrounded Governing Boundary | True when the role assignment's role is a governed by lapsed authority. | _TRUE when at least one boundary constraining this assignment's role rests on lapsed knowledge._ |
| Suspension Condition Met | True when at least one of the following holds: the exceeds tolerable error rate flag is set or at least one of the following holds: the any boundary violation flag is set or the ungrounded governing boundary flag is set. | _TRUE when any pre-declared condition requiring this assignment to stop deciding unaided has been met._ |
| Is Operating Under Met Suspension Condition | True when all of the following hold: the suspension condition met flag is set and all of the following hold: the covers now flag is set and the non human assignment flag is set. | _TRUE when a suspension condition has been met and the assignment is nonetheless still active and still deciding._ |
| Has Declared Suspension Condition | True when the max tolerable error rate percent is greater than 0. | _TRUE when this assignment has any pre-declared condition under which it must stop at all._ |
| Has Approving Authority | True when the approving authority role has a value. | _TRUE when a role is recorded as having approved this assignment._ |
| Has Authorizing Change Request | True when the authorizing change request has a value. | _TRUE when a change request is recorded as the governance vehicle for this assignment._ |
| Is Enforcement Role | True when an empty string. | _Whether this role's function is to enforce controls on other agents' actions._ |
| Is Unauthorized Enforcement Agent | True when all of the following hold: the enforcement role flag is set and the unauthorized non human assignment flag is set. | _TRUE when a non-human agent enforces controls on others while holding no recorded authorization of its own._ |
| Governance Evidence Count | Computed as the count of the following that hold: the approving authority flag is set and the authorizing change request flag is set. | _How many independent governance artifacts back this assignment: an approving role, an authorizing change request._ |
| Unauthorized Enforcement Role Key | Determined by priority: the role if the unauthorized non human assignment flag is set; in all other cases, an empty string. | _Echoes the role only for non-human assignments nobody authorized; empty otherwise._ |
| Semantic Type Iri | A defined attribute. | _Exact class IRI for the assignment event._ |
| **Community of Practice** | Socio-technical communities that transmit and maintain procedural knowledge. Explicit ERB-PKO extension. | — |
| Name | The same as its label. | _Human-readable calculated display alias for the CommunitiesOfPractice row._ |
| Label | A defined attribute. | _Community's human-readable name._ |
| Organization | A defined attribute. | _Organization hosting the community._ |
| Steward Role | A defined attribute. | _Role accountable for convening and maintaining the community._ |
| Purpose | A defined attribute. | _Shared practice and knowledge-transfer purpose._ |
| Cadence | A defined attribute. | _Meeting or practice cadence._ |
| Semantic Type Iri | A defined attribute. | _Extension class IRI._ |
| **Mentorship** | Time-bounded apprenticeship relationships that intentionally transfer situated procedural knowledge. Explicit ERB-PKO extension. | — |
| Name | Computed as the mentor agent, followed by “ -> ”, followed by the learner agent. | _Human-readable calculated display alias for the Mentorships row._ |
| Community of Practice | A defined attribute. | _Community in which the mentorship operates._ |
| Mentor Agent | A defined attribute. | _Experienced practitioner serving as mentor._ |
| Learner Agent | A defined attribute. | _Practitioner learning the procedure._ |
| Valid From | A defined attribute. | _Mentorship start._ |
| Valid to | A defined attribute. | _Mentorship end._ |
| Learning Objective | A defined attribute. | _Procedural capability to be transferred._ |
| Evidence of Completion | A defined attribute. | _Evidence showing completion or competence._ |
| Semantic Type Iri | A defined attribute. | _Extension class IRI._ |
| **Procedure Type** | Controlled values used by pko:hasProcedureType. | — |
| Name | The same as its label. | _Human-readable calculated display alias for the ProcedureTypes row._ |
| Label | A defined attribute. | _Procedure type label._ |
| Definition | A defined attribute. | _Definition and scope of the procedure type._ |
| Semantic Type Iri | A defined attribute. | _Exact class IRI for procedure types._ |
| **Procedure** | Abstract, discoverable procedures. Each version is represented separately in ProcedureVersions. Maps to pko:Procedure and dcat:Resource. | — |
| Name | The same as its title. | _Human-readable calculated display alias for the Procedures row._ |
| Title | A defined attribute. | _Human-readable title; maps to dcterms:title._ |
| Procedure Type | A defined attribute. | _Procedure type; maps to pko:hasProcedureType._ |
| Owner Organization | A defined attribute. | _Organization that owns the procedure._ |
| Adopted by Organization | A defined attribute. | _Organization that adopts the procedure; maps to pko:isAdoptedBy._ |
| Purpose | A defined attribute. | _Desired outcome and scope of the procedure._ |
| Target | A defined attribute. | _Thing or population on which the procedure acts; maps to pko:hasProcedureTarget._ |
| Is Template | True when an empty string. | _TRUE when the procedure is a reusable template; maps to pko:isTemplate._ |
| Current Version Key | A defined attribute. | _Current version identifier, mirrored structurally by ProcedureVersions.IsCurrent._ |
| Semantic Type Iri | A defined attribute. | _Exact PKO class IRI._ |
| **Procedure Version** | Versioned procedure specifications. Maps to pko:Procedure plus DCAT version relations and PKO versionNumber/newVersionMotivation/changelogDescription. | — |
| Name | The same as its title. | _Human-readable calculated display alias for the ProcedureVersions row._ |
| Procedure | A defined attribute. | _Abstract procedure of which this is a version._ |
| Version Number | A defined attribute. | _Version number; maps to pko:versionNumber._ |
| Title | A defined attribute. | _Version-specific title._ |
| Status | A defined attribute. | _PKO procedure status individual: Draft, Validation, Approval, Approved, Deprecated, or Archived._ |
| Issued At | A defined attribute. | _Issue timestamp; maps to dcterms:issued._ |
| Modified At | A defined attribute. | _Last semantic modification; maps to dcterms:modified._ |
| Created by Agent | A defined attribute. | _Agent that created the version; maps to dcterms:creator._ |
| Modified by Agent | A defined attribute. | _Agent that last modified the version; maps to pko:wasModifiedBy._ |
| New Version Motivation | A defined attribute. | _Reason for the new version; maps to pko:newVersionMotivation._ |
| Changelog Description | A defined attribute. | _Semantic change description; maps to pko:changelogDescription._ |
| Is Current | True when an empty string. | _TRUE when this is the current version._ |
| Count of Steps | The number of steps related to the procedure version. | _Number of steps in this version._ |
| Count of Open Knowledge Gaps | The number of the procedure version's knowledge gaps that have a status of “Open”. | _Open knowledge gaps for this version._ |
| Is Ready for Execution | True when all of the following hold: the status is “Approved”; the count of steps is greater than 0; and the count of open knowledge gaps is 0. | _TRUE when approved, populated, and free of blocking knowledge gaps._ |
| Specified Step Count | The number of steps related to the procedure version. | _How many steps the specification defines for this version._ |
| Overdue Review Count | The number of review events related to the procedure version. | _How many reviews of this procedure version are past due._ |
| Open Change Request Count | The number of change requests related to the procedure version. | _How many change requests are open against this version._ |
| Open High Severity Gap Count | The number of knowledge gaps related to the procedure version. | _How many high-severity knowledge gaps are open against this version._ |
| Is Fit to Execute | True when all of the following hold: the status is “Approved”; the overdue review count is 0; the open change request count is 0; and the open high severity gap count is 0. | _TRUE when this version is approved, current on review, and carries no open change request or high-severity gap._ |
| Steward Review Cadence Days | The total review cadence days across the stewardship assignments related to the procedure version. | _The review cadence promised by this version's stewardship assignment, in days. Summed because a version has at most one active steward; this is the hop that lets ReviewEvents resolve the promise via a primary-key match._ |
| Count of Stewardship Assignments | The number of stewardship assignments related to the procedure version. | _How many stewardship assignments of any vintage point at this version._ |
| Has Any Steward | True when the count of stewardship assignments is greater than 0. | _TRUE if any stewardship assignment has ever named this version._ |
| Is Live | True when at least one of the following holds: the status is “Approved” or the status is “Published”. | _TRUE when this version is in a state where somebody could execute it._ |
| Is Unstewarded | True when the any steward flag is not set. | _TRUE when no stewardship assignment names this version._ |
| Is Live and Unstewarded | True when all of the following hold: the live flag is set and the unstewarded flag is set. | _TRUE when an executable version has nobody accountable for keeping it healthy._ |
| Count of Open Blocking Gaps | The number of knowledge gaps related to the procedure version. | _How many open blocking gaps stand against this version._ |
| Has Open Blocking Gap | True when the count of open blocking gaps is greater than 0. | _TRUE when at least one open blocking gap stands against this version._ |
| Is Live With Blocking Gap | True when all of the following hold: the live flag is set and the open blocking gap flag is set. | _TRUE when an executable version carries an unresolved blocking knowledge gap._ |
| Should Not Be Executable | True when all of the following hold: the ready for execution flag is set and the open blocking gap flag is set. | _TRUE when the model says this version is ready to execute while a blocking gap is open against it._ |
| Count of Unapproved Reliance Fragments | The number of knowledge fragments related to the procedure version. | _How many unapproved claims this version is relying on._ |
| Runs on Unapproved Knowledge | True when the count of unapproved reliance fragments is greater than 0. | _TRUE when this version depends on at least one claim the knowledge authority has not approved._ |
| Count of Overdue Gaps | The number of knowledge gaps related to the procedure version. | _How many acknowledged unknowns against this version have outlived their tolerance._ |
| Count of Change Requests | The number of change requests related to the procedure version. | _How many change requests have ever been raised against this version._ |
| Count of Review Events | The number of review events related to the procedure version. | _How many review events have ever been recorded against this version._ |
| Has Governance Record | True when at least one of the following holds: the count of change requests is greater than 0 or the count of review events is greater than 0. | _TRUE when at least one change request or review event exists for this version._ |
| Evaluation Context | A defined attribute. | _The evaluation context this row's time-dependent witnesses are judged under._ |
| As of Instant | Taken from the linked evaluation context. | _The evaluation instant this row's time-dependent witnesses are judged against._ |
| Days Since Modified | Computed as the number of days from the modified at to the as of instant. | _Days since this version's content was last changed._ |
| Days Since Last Review | An aggregated value computed across the procedure version's related records. | _Days since the most recent review of this version._ |
| Was Modified Since Last Review | True when the days since modified is less than the days since last review. | _TRUE when the version was edited more recently than it was reviewed._ |
| Modifier is Authority | The agent kind of the procedure version's modified by agent. | _The kind of agent that last modified this version._ |
| Has Unwitnessed Change | True when all of the following hold: the live flag is set and the was modified since last review flag is set. | _TRUE when a live version's current content postdates every review it has had._ |
| Count of Stale Fragments | The number of knowledge fragments related to the procedure version. | _How many supporting claims have outlived this version's review cadence._ |
| Knowledge is Staler Than Cadence | True when the count of stale fragments is greater than 0. | _TRUE when this version rests on at least one claim older than its own review cadence._ |
| Compound Fragile Fragment Count | The number of knowledge fragments related to the procedure version. | _How many compound-fragile knowledge fragments this version rests on._ |
| Rests on Compound Fragile Knowledge | True when all of the following hold: the live flag is set and the compound fragile fragment count is greater than 0. | _A live procedure version resting on at least one knowledge fragment that carries three or more decay signals._ |
| Concentrated Witness Session Count | The number of elicitation sessions related to the procedure version. | _How many concentrated single-witness sessions underwrite this version's knowledge base._ |
| Knowledge Base is Concentrated | True when all of the following hold: the live flag is set and the concentrated witness session count is greater than 0. | _A live version where at least one single-witness session alone underwrites three or more of its live claims._ |
| Machine Consumed Unapproved Count | The number of knowledge fragments related to the procedure version. | _How many unapproved claims this version feeds directly to software-assigned steps._ |
| Feeds Unapproved Knowledge to Machines | True when all of the following hold: the live flag is set and the machine consumed unapproved count is greater than 0. | _A live version that hands unapproved knowledge to a step no human is positioned to review._ |
| Genuinely Overdue Fragment Count | The number of knowledge fragments related to the procedure version. | _How many of this version's claims are overdue by actual review record rather than by inference._ |
| Awaited Decision Count | The number of change requests related to the procedure version. | _How many decisions are pending against this live version._ |
| Scoped Open Blocking Gap Count | The number of knowledge gaps related to the procedure version. | _How many open blocking gaps belong to THIS version, correctly scoped._ |
| Is Blocked on Pending Decision | True when all of the following hold: the awaited decision count is greater than 0 and the scoped open blocking gap count is greater than 0. | _A live version carrying both an undecided change request and an open blocking gap — the gap cannot close until the decision lands._ |
| Unexercised Human Gate Count | The number of steps related to the procedure version. | _How many of this version's human-only gates have never been approached by software._ |
| Ai Boundary is Unevidenced | True when all of the following hold: the live flag is set and the unexercised human gate count is greater than 0. | _A live version whose human-only gates rest on assertion rather than on any observed attempt by software._ |
| Load Bearing Unapproved Count | The number of knowledge fragments related to the procedure version. | _How many high-blast-radius unapproved claims this version rests on._ |
| Unlanded Decision Count | The number of change requests related to the procedure version. | _How many decided-but-unimplemented change requests hold this version's fitness down._ |
| Unrehearsed Control Entry Count | The number of step transitions related to the procedure version. | _How many unrehearsed control entries exist in this procedure version._ |
| Has Unrehearsed Control Entry | True when the unrehearsed control entry count is greater than 0. | _Whether this live version has at least one blocking control that is only reachable by a path nobody has ever walked._ |
| Is Live With Unrehearsed Control | True when all of the following hold: the live flag is set and the unrehearsed control entry flag is set. | _A version that is live for execution while carrying at least one never-rehearsed blocking control entry._ |
| Cadence Breach Count | The number of review events related to the procedure version. | _How many review events on this version are past their promised cadence._ |
| Is in Cadence Breach | True when the cadence breach count is greater than 0. | _Whether this version currently has at least one review event past the cadence its steward promised._ |
| Has Decision in Flight | True when the open change request count is greater than 0. | _Whether this version has at least one change request that is still open._ |
| Is Unremediated Cadence Breach | True when all of the following hold: the in cadence breach flag is set and the decision in flight flag is not set. | _A cadence breach with no open change request against the version — a broken promise with no response in motion._ |
| Is Managed Cadence Breach | True when all of the following hold: the in cadence breach flag is set and the decision in flight flag is set. | _A cadence breach where a change request is at least open against the version._ |
| Governance is Silent | True when all of the following hold: the live flag is set and the governance record flag is not set. | _A live version with neither a change request nor a review event ever recorded against it._ |
| Valid Fragment Count | The number of knowledge fragments related to the procedure version. | _How many currently-valid knowledge fragments are attached to this version._ |
| Still Owns Valid Knowledge | True when the valid fragment count is greater than 0. | _Whether this version still holds at least one knowledge fragment that is currently valid._ |
| Incoming Supersession Count | The number of procedure version links related to the procedure version. | _How many other versions declare that they supersede this one._ |
| Is Still Referenced | True when the incoming supersession count is greater than 0. | _Whether any other version points at this one through a supersession link._ |
| Is Load Bearing Orphan | True when all of the following hold: the unstewarded flag is set and at least one of the following holds: the still owns valid knowledge flag is set or the still referenced flag is set. | _An unstewarded version that is still referenced by a supersession link or still owns currently-valid knowledge — nobody is accountable for it and something still depends on it._ |
| Is Cleanly Retired | True when all of the following hold: the unstewarded flag is set; the still owns valid knowledge flag is not set; and the still referenced flag is not set. | _An unstewarded version that nothing depends on — a genuine, safe retirement._ |
| Stalled Implementation Count | The number of change requests related to the procedure version. | _How many approved-but-unimplemented change requests are stalled against this version._ |
| Is Held Unfit by Landed Decisions | True when all of the following hold: the fit to execute flag is not set and the stalled implementation count is greater than 0. | _A version reading unfit to execute specifically because approved changes have not been marked implemented._ |
| Undeclared Control Kind Count | The number of steps related to the procedure version. | _How many steps in this version have not declared a control kind._ |
| Control Taxonomy is Incomplete | True when the undeclared control kind count is greater than 0. | _Whether this version contains any step whose control kind is unstated — meaning role-based and id-based control predicates cannot be trusted to cover it._ |
| Has Approved Change Request | True when the approved change request count is greater than 0. | _TRUE when at least one change request against this version has been approved._ |
| Approved Change Request Count | The number of change requests related to the procedure version. | _How many change requests against this version have been approved._ |
| Unwatched Unowned Control Count | The number of requirements related to the procedure version. | _How many blocking controls in the model are neither computed nor owned._ |
| Semantic Type Iri | A defined attribute. | _Exact PKO class IRI._ |
| **Procedure Version Link** | Directed links between versioned procedures. Maps to dcat:previousVersion/dcat:hasVersion and pko:nextVersion. | — |
| Name | Computed as the previous procedure version, followed by “ -> ”, followed by the next procedure version. | _Human-readable calculated display alias for the ProcedureVersionLinks row._ |
| Previous Procedure Version | A defined attribute. | _Earlier version._ |
| Next Procedure Version | A defined attribute. | _Later version._ |
| Relation Iri | A defined attribute. | _Exact version relation IRI._ |
| Change Summary | A defined attribute. | _Summary of semantic change across the edge._ |
| Superseded Version Key | Determined by priority: the previous procedure version if the relation iri is “https://w3id.org/pko#nextVersion”; in all other cases, an empty string. | _Echoes the superseded (previous) version id for rows that express a next-version relation. Supersession is carried by RelationIri here, not by a separate link-kind column._ |
| **Procedure Status Change** | Lifecycle events that move a procedure version between PKO statuses. Maps to pko:ChangeOfStatus, fromStatus, toStatus, and prov:atTime. | — |
| Name | Computed as the procedure version, followed by “: ”, followed by the from status, followed by “ -> ”, followed by the to status. | _Human-readable calculated display alias for the ProcedureStatusChanges row._ |
| Procedure Version | A defined attribute. | _Procedure version whose status changed._ |
| From Status | A defined attribute. | _Previous PKO status._ |
| To Status | A defined attribute. | _New PKO status._ |
| Changed At | A defined attribute. | _Time of change; maps to prov:atTime._ |
| Changed by Agent | A defined attribute. | _Agent responsible for the change._ |
| Motivation | A defined attribute. | _Reason for changing status._ |
| Semantic Type Iri | A defined attribute. | _Exact PKO class IRI._ |
| **Step** | Version-scoped units of work. Atomic steps map to pplan:Step; composite steps map to pplan:MultiStep. The specification is never conflated with execution. | — |
| Name | Computed as the step number, followed by “. ”, followed by the title. | _Human-readable calculated display alias for the Steps row._ |
| Procedure Version | A defined attribute. | _Procedure version containing the step; maps to pko:hasStep/pplan:isStepOfPlan._ |
| Step Number | A defined attribute. | _Stable sequence label; maps to pko:stepNumber._ |
| Title | A defined attribute. | _Human-readable step title._ |
| Step Kind | A defined attribute. | _Atomic or MultiStep._ |
| Assigned Role | A defined attribute. | _Role responsible for the step._ |
| Assigned Role Label | Taken from the linked assigned role. | _Resolved role label._ |
| Assigned Agent Kind | The current agent kind of the step's assigned role. | _Current role-filler category._ |
| Instruction | A defined attribute. | _Normative step instruction._ |
| Expected Duration Minutes | A defined attribute. | _Expected duration represented as an OWL-Time duration in semantic projections._ |
| Expertise Level | A defined attribute. | _PKO expertise level: Junior, Senior, Expert, or Master._ |
| Requires Human Confirmation | True when an empty string. | _TRUE when a human must confirm the step; maps to pko:wasConfirmedBy at execution._ |
| Blocking Requirement Count | The number of step requirements related to the step. | _How many blocking requirements the specification attaches to this step._ |
| Stale Binding Count | The number of operational bindings related to the step. | _How many operational bindings for this step are currently outside their freshness SLA._ |
| Authoritative Stale Count | The number of operational bindings related to the step. | _How many authoritative bindings for this step are currently stale._ |
| Available Exception Count | The number of exceptions related to the step. | _How many active exceptions the specification defines for this step._ |
| Declared Verification Count | The number of step verifications related to the step. | _How many verifications the specification declares for this step._ |
| Is Preparation Step | True when at least one of the following holds: the assigned role is “finance-analyst” or the assigned role is “variance-review-agent”. | _TRUE for steps whose assigned role produces the work product rather than reviewing it._ |
| Is Approval Step | True when at least one of the following holds: the assigned role is “controller” or the assigned role is “cfo”. | _TRUE for steps whose assigned role is an approval authority._ |
| Stale Authoritative Binding Count | The number of operational bindings related to the step. | _Number of authoritative bindings for this step that are past their freshness SLA._ |
| Inputs are Fresh | True when the stale authoritative binding count is 0. | _TRUE when no authoritative binding for this step is stale._ |
| Is Software Assigned | True when at least one of the following holds: the assigned agent kind is “AIAgent” or the assigned agent kind is “AutomatedPipeline”. | _TRUE when this step is specified to be performed by software rather than a person._ |
| Is Human Approval Gate | True when all of the following hold: the software assigned flag is not set and at least one of the following holds: the step ID is “policy-05” or the step ID is “close-06”. | _TRUE for the steps that exist specifically to place a human commitment between drafting and delivery._ |
| Gate Held by Human | True when all of the following hold: the human approval gate flag is set and the assigned agent kind is “Human”. | _TRUE when a designated approval gate is in fact assigned to a human role._ |
| Binding Boundary Count | The number of authority boundaries related to the step. | _Number of authority boundaries currently binding at this step._ |
| Assigned Role is Ungoverned | True when the step's assigned role is an ungoverned non human role. | _Whether this step's assigned role is a non-human role with no governing assignment._ |
| Unusable Binding Count | The number of operational bindings related to the step. | _Number of bindings at this step that are unapproved or stale._ |
| All Sources Usable | True when the unusable binding count is 0. | _TRUE when every binding at this step is an approved, fresh source._ |
| Control Kind | A defined attribute. | _What kind of control this step is: Preparation, Approval, LegalReview, Verification, Extraction, Publication, Retrospective, or None. That policy-04 is a legal review is a property OF policy-04, not of a formula that happens to name it; storing it as data makes downstream predicates portable to procedures that do not exist yet._ |
| Unwarranted Boundary Count | The number of authority boundaries related to the step. | _How many boundaries governing this step are being enforced without a valid ratifying claim._ |
| Is Governed by Unwarranted Boundary | True when the unwarranted boundary count is greater than 0. | _Whether this step's constraints on machine authority rest on a claim that is no longer valid._ |
| Software Execution Count | The number of step executions related to the step. | _How many times a software agent has actually executed this step._ |
| Has Been Approached by Software | True when the software execution count is greater than 0. | _Whether any software agent has ever executed this step._ |
| Is Unexercised Human Gate | True when all of the following hold: the human approval gate flag is set and the been approached by software flag is not set. | _A human-only approval gate that no software agent has ever attempted — the control is asserted, not demonstrated._ |
| Is Demonstrated Human Gate | True when all of the following hold: the human approval gate flag is set; the been approached by software flag is set; and the gate held by human flag is set. | _A human gate that software has actually reached and that a human nevertheless held._ |
| Unexercised Gate Version Key | Determined by priority: the procedure version if the unexercised human gate flag is set; in all other cases, an empty string. | _Composite-key echo: this step's procedure version when the step is an unexercised human gate, blank otherwise._ |
| Has Declared Control Kind | True when the control kind has a value. | _Whether this step declares what kind of control it is._ |
| Undeclared Control Version Key | Determined by priority: an empty string if the declared control kind flag is set; in all other cases, the procedure version. | _Composite-key echo: this step's procedure version when the step has no declared control kind, blank otherwise._ |
| Approval Step is Software Assigned | True when all of the following hold: the control kind is “Approval” and the software assigned flag is set. | _An approval-kind step whose assigned role is currently held by an AI agent or automated pipeline._ |
| Unwitnessed Blocking Count | The number of step requirements related to the step. | _How many blocking controls bound to this step have no computed witness._ |
| Semantic Type Iri | A defined attribute. | _Exact P-Plan class IRI._ |
| **Step Transition** | Directed control-flow edges represented as first-class pko:Transition instances with fromStep/toStep and next/alternative/fallback semantics. | — |
| Name | Computed as the from step, followed by “ -> ”, followed by the to step. | _Human-readable calculated display alias for the StepTransitions row._ |
| Procedure Version | A defined attribute. | _Procedure version whose control flow owns the transition._ |
| From Step | A defined attribute. | _Source step; maps to pko:fromStep._ |
| To Step | A defined attribute. | _Destination step; maps to pko:toStep._ |
| Transition Kind | A defined attribute. | _Next, Alternative, or Fallback._ |
| Condition | A defined attribute. | _Condition under which the edge is taken._ |
| Priority | A defined attribute. | _Evaluation priority when several outgoing edges exist._ |
| Is Recovery Path | True when at least one of the following holds: the transition kind is “Fallback” or the transition kind is “Alternative”. | _TRUE when this transition is a non-default path taken because something went wrong._ |
| Count of From Step Executions | The number of step executions related to the step transition. | _How many times the step this transition leaves from has actually been executed._ |
| Count of to Step Executions | The number of step executions related to the step transition. | _How many times the step this transition arrives at has actually been executed._ |
| Has Reachable Origin | True when the count of from step executions is greater than 0. | _TRUE when the origin step of this transition has been executed at least once._ |
| Has Reachable Target | True when the count of to step executions is greater than 0. | _TRUE when the destination step of this transition has been executed at least once._ |
| Is Never Exercised | True when it is not the case that all of the following hold: the reachable origin flag is set and the reachable target flag is set. | _TRUE when at least one end of this transition has never appeared in any step execution._ |
| Is Untested Recovery Path | True when all of the following hold: the recovery path flag is set and the never exercised flag is set. | _TRUE for a Fallback or Alternative transition whose endpoints show no execution evidence._ |
| Count of Observed Traversals | The number of observed transitions related to the step transition. | _How many times this exact transition has actually been traversed._ |
| Has Been Traversed | True when the count of observed traversals is greater than 0. | _TRUE when this transition has been walked at least once._ |
| Is Unwalked Recovery Path | True when all of the following hold: the recovery path flag is set and the been traversed flag is not set. | _TRUE for a Fallback/Alternative transition with zero recorded traversals._ |
| Target Blocking Requirement Count | Taken from the linked to step. | _How many blocking requirements are attached to the step this transition lands on._ |
| Target Carries Blocking Control | True when the target blocking requirement count is greater than 0. | _Whether the destination step of this transition carries at least one blocking control._ |
| Is Unrehearsed Control Entry | True when all of the following hold: the unwalked recovery path flag is set and the target carries blocking control flag is set. | _A recovery path that has never been traversed and that leads into a step carrying a blocking control._ |
| Unrehearsed Control Version Key | Determined by priority: the procedure version if the unrehearsed control entry flag is set; in all other cases, an empty string. | _Composite-key echo: this transition's procedure version when it is an unrehearsed control entry, blank otherwise._ |
| Semantic Type Iri | A defined attribute. | _Exact PKO class IRI._ |
| **Action** | Human actions required by steps. Maps to pko:Action and pko:requiresAction. | — |
| Name | The same as its label. | _Human-readable calculated display alias for the Actions row._ |
| Label | A defined attribute. | _Action label._ |
| Definition | A defined attribute. | _Normative definition of the action._ |
| Semantic Type Iri | A defined attribute. | _Exact PKO class IRI._ |
| **Function** | Software or algorithmic functions required by steps. Maps to pko:Function and pko:requiresFunction. | — |
| Name | The same as its label. | _Human-readable calculated display alias for the Functions row._ |
| Label | A defined attribute. | _Function label._ |
| Definition | A defined attribute. | _Deterministic or AI-assisted behavior._ |
| Implementation Key | A defined attribute. | _Operational implementation or model key._ |
| Semantic Type Iri | A defined attribute. | _Exact PKO class IRI._ |
| **Tool** | Tools required to execute steps. Maps to m4ing:Tool and pko:requiresTool. | — |
| Name | The same as its label. | _Human-readable calculated display alias for the Tools row._ |
| Label | A defined attribute. | _Tool label._ |
| Purpose | A defined attribute. | _Operational purpose._ |
| Semantic Type Iri | A defined attribute. | _Exact semantic class IRI._ |
| **Step Action** | Many-to-many Step/Action semantics normalized into a first-class ERB junction table. | — |
| Name | Computed as the step, followed by “ / ”, followed by the action. | _Human-readable calculated display alias for the StepActions row._ |
| Step | A defined attribute. | _Step side of the relationship._ |
| Action | A defined attribute. | _Action side of the relationship._ |
| **Step Function** | Many-to-many Step/Function semantics normalized into an ERB junction table. | — |
| Name | Computed as the step, followed by “ / ”, followed by the function. | _Human-readable calculated display alias for the StepFunctions row._ |
| Step | A defined attribute. | _Step side of the relationship._ |
| Function | A defined attribute. | _Function side of the relationship._ |
| **Step Tool** | Many-to-many Step/Tool semantics normalized into an ERB junction table. | — |
| Name | Computed as the step, followed by “ / ”, followed by the tool. | _Human-readable calculated display alias for the StepTools row._ |
| Step | A defined attribute. | _Step side of the relationship._ |
| Tool | A defined attribute. | _Tool side of the relationship._ |
| **Requirement** | Normative requirements applied to procedures, steps, or transitions. Maps to pko:Requirement and pko:hasRequirement. | — |
| Name | The same as its label. | _Human-readable calculated display alias for the Requirements row._ |
| Label | A defined attribute. | _Requirement label._ |
| Requirement Type | A defined attribute. | _Controlled requirement type; maps to pko:hasRequirementType._ |
| Statement | A defined attribute. | _Normative requirement statement._ |
| Rationale | A defined attribute. | _Why the requirement exists._ |
| Is Blocking | True when an empty string. | _TRUE when unsatisfied requirement blocks execution or approval._ |
| Satisfaction Record Count | The number of requirement satisfactions related to the requirement. | _How many times this requirement has ever been evaluated against an execution._ |
| Step Binding Count | The number of step requirements related to the requirement. | _How many steps the specification binds this requirement to._ |
| Is Bound to Any Step | True when the step binding count is greater than 0. | _TRUE when at least one step carries this requirement._ |
| Has Ever Been Evaluated | True when the satisfaction record count is greater than 0. | _TRUE when this requirement has at least one satisfaction record in the model._ |
| Negative Outcome Count | The number of requirement satisfactions related to the requirement. | _How many times this requirement has ever produced a less-than-satisfied outcome._ |
| Is Inoperative Control | True when all of the following hold: the blocking flag is set; the bound to any step flag is set; and the ever been evaluated flag is not set. | _TRUE for a blocking requirement that is attached to a step in the specification but has never once been evaluated on any execution._ |
| Is Decorative Control | True when all of the following hold: the blocking flag is set and the bound to any step flag is not set. | _TRUE for a blocking requirement that is not attached to any step at all._ |
| Has Computed Witness | True when an empty string. | _Whether a computed predicate in this rulebook evaluates this requirement, as opposed to it being satisfied by human assertion only._ |
| Witness Field Name | A defined attribute. | _The fully-qualified Table.Field of the predicate that computes this requirement, when one exists._ |
| Has Ever Produced Negative | True when the negative outcome count is greater than 0. | _TRUE when this requirement has at least once been scored as anything other than Satisfied._ |
| Is Unfalsified Control | True when all of the following hold: the blocking flag is set; the ever been evaluated flag is set; and the ever produced negative flag is not set. | _TRUE for a blocking control that HAS been evaluated at least once and has never returned a negative result._ |
| Claims a Witness Field | True when the witness field name has a value. | _TRUE when this requirement names a field it claims computes it._ |
| Named Witness Field Exists | True when the requirement's witness field name is derived. | _TRUE when the field named in WitnessFieldName actually exists in the field catalog AND is a derived (calculated/lookup/aggregation) field._ |
| Derived Has Computed Witness | True when all of the following hold: the claims a witness field flag is set and the named witness field exists flag is set. | _Whether this requirement genuinely has a computed witness, derived from the field catalog rather than asserted._ |
| Witness Claim is Unverified | True when it is not the case that the has computed witness is the derived has computed witness. | _TRUE when the hand-typed HasComputedWitness flag disagrees with what the field catalog says._ |
| Is Unwitnessed Blocking Control | True when all of the following hold: the blocking flag is set and the derived has computed witness flag is not set. | _TRUE for a blocking control with no verified computed witness behind it._ |
| Witness Fire Count | The same as its negative outcome count. | _How many times this requirement's evaluation has returned a non-Satisfied result._ |
| Witness Has Never Fired | True when all of the following hold: the computed witness flag is set and the witness fire count is 0. | _TRUE for a requirement that has a computed witness which has never once returned a negative result._ |
| Evaluation Sample Size | The same as its satisfaction record count. | _How many times this requirement has been evaluated at all._ |
| Has Meaningful Sample | True when the evaluation sample size is at least the minimum sample for assurance. | _TRUE when this requirement has been evaluated often enough that a clean record is informative._ |
| Minimum Sample for Assurance | A defined attribute. | _The number of clean evaluations this control must accumulate before its silence counts as evidence._ |
| Is Untested Witness | True when all of the following hold: the witness has never fired flag is set and the meaningful sample flag is not set. | _TRUE for a witness that has never fired and has not been exercised enough for that silence to mean anything._ |
| Is Evidenced Holding Control | True when all of the following hold: the witness has never fired flag is set and the meaningful sample flag is set. | _TRUE for a witness that has never fired across a sample large enough for that to constitute evidence._ |
| Control Assurance State | Determined by priority: “Decorative” if the bound to any step flag is not set; “Inoperative” if the ever been evaluated flag is not set; “Asserted” if the computed witness flag is not set; “Demonstrated” if the witness fire count is greater than 0; “Holding” if the meaningful sample flag is set; in all other cases, “Untested”. | _One of Decorative, Inoperative, Asserted, Demonstrated, Holding, or Untested — the single control-health verdict for this requirement._ |
| Unexercised Binding Count | The number of step requirements related to the requirement. | _How many of this control's step bindings have never been evaluated._ |
| Witness is Partially Scoped | True when all of the following hold: the computed witness flag is set and the unexercised binding count is greater than 0. | _TRUE when a control has a computed witness but at least one of its step bindings has never been exercised by it._ |
| Accountable Role | A defined attribute. | _The role answerable for this control operating as designed._ |
| Accountable Agent | The current agent of the requirement's accountable role. | _The person currently holding the accountable role for this control._ |
| Has Named Owner | True when the accountable role has a value. | _TRUE when a role has been named as accountable for this control._ |
| Is Orphaned Blocking Control | True when all of the following hold: the blocking flag is set and the named owner flag is not set. | _TRUE for a blocking control with nobody named as accountable for it._ |
| Is Unwatched and Unowned | True when all of the following hold: the blocking flag is set; the computed witness flag is not set; and the named owner flag is not set. | _TRUE for a blocking control that nothing computes and nobody owns._ |
| Attestation Exposure Note | Determined by priority: an empty string if the blocking flag is not set; “Unwatched and unowned: exposure defaults to the signatory.” if the unwatched and unowned flag is set; “Witnessed but unowned: no named accountability.” if the orphaned blocking control flag is set; “Owned but unwitnessed: rests on human judgement.” if the computed witness flag is not set; in all other cases, an empty string. | _States, per control, what kind of exposure attesting to it creates._ |
| Unwatched Unowned Flag | Determined by priority: “unwatched-unowned” if the unwatched and unowned flag is set; in all other cases, an empty string. | _Constant marker echoed when this control is both unwatched and unowned._ |
| Semantic Type Iri | A defined attribute. | _Exact PKO class IRI._ |
| **Step Requirement** | Many-to-many Step/Requirement semantics normalized into an ERB junction table. | — |
| Name | Computed as the step, followed by “ / ”, followed by the requirement. | _Human-readable calculated display alias for the StepRequirements row._ |
| Step | A defined attribute. | _Step side of the relationship._ |
| Requirement | A defined attribute. | _Requirement side of the relationship._ |
| Requirement is Blocking | True when the linked requirement is blocking. | _Whether this spec-side step/requirement binding names a blocking control._ |
| Blocking Step Key | Determined by priority: the step if the requirement is blocking flag is set; in all other cases, an empty string. | _Echoes the Step id only when the bound requirement is blocking; empty otherwise._ |
| Step When Blocking | Determined by priority: the step if the requirement is blocking flag is set; in all other cases, an empty string. | _Echoes the step id when the bound requirement is blocking, blank otherwise._ |
| Requirement Lacks Witness | True when the step requirement's requirement is an unwitnessed blocking control. | _Whether the requirement bound at this step is a blocking control with no computed witness._ |
| Unwitnessed Step Key | Determined by priority: the step if the requirement lacks witness flag is set; in all other cases, an empty string. | _Echoes the step id when the requirement bound here has no computed witness._ |
| Satisfaction Count for Binding | The number of requirement satisfactions related to the step requirement. | _How many times this specific (step, requirement) binding has been evaluated in any execution._ |
| Binding Was Ever Exercised | True when the satisfaction count for binding is greater than 0. | _TRUE when this specific (step, requirement) pair has been evaluated at least once._ |
| Is Unexercised Blocking Binding | True when all of the following hold: the requirement is blocking flag is set and the binding was ever exercised flag is not set. | _TRUE for a blocking control bound to a step where it has never actually been evaluated._ |
| Unexercised Binding Requirement Key | Determined by priority: the requirement if the unexercised blocking binding flag is set; in all other cases, an empty string. | _Echoes the requirement id when this binding has never been exercised._ |
| **Step Verification** | Verification definitions attached to steps. Maps to pko:StepVerification and pko:SignalVerification. | — |
| Name | Computed as the step, followed by “ / ”, followed by the verification kind. | _Human-readable calculated display alias for the StepVerifications row._ |
| Step | A defined attribute. | _Step whose execution is verified; maps to pko:hasStepVerification._ |
| Verification Kind | A defined attribute. | _SignalVerification, ApprovalVerification, ProvenanceVerification, or another documented kind._ |
| Signal Identifier | A defined attribute. | _Signal or evidence key; maps to pko:signalIdentifier for signal verifications._ |
| Expected Signal Value | A defined attribute. | _Expected value; maps to pko:expectedSignalValue._ |
| Instruction | A defined attribute. | _How to verify the step._ |
| Semantic Type Iri | A defined attribute. | _Exact PKO or extension class IRI._ |
| **Rationale** | First-class rationale statements explaining why procedural commitments and design decisions exist. Explicit ERB-PKO extension, represented as prov:Entity/dcat:Resource in projections. | — |
| Name | The same as its title. | _Human-readable calculated display alias for the Rationales row._ |
| Procedure Version | A defined attribute. | _Version justified by the rationale._ |
| Step | A defined attribute. | _Optional step justified by the rationale._ |
| Title | A defined attribute. | _Rationale title._ |
| Statement | A defined attribute. | _Reasoned explanation._ |
| Status | A defined attribute. | _Draft, Reviewed, Approved, or Superseded._ |
| Authority Role | A defined attribute. | _Role authorized to approve the rationale._ |
| Semantic Type Iri | A defined attribute. | _Extension class IRI._ |
| **Exception** | Documented exceptions, fallbacks, and alternative handling. Aligns structurally with PKO fallback/alternative steps and requirements; the exception record itself is an ERB-PKO extension. | — |
| Name | The same as its condition. | _Human-readable calculated display alias for the Exceptions row._ |
| Procedure Version | A defined attribute. | _Procedure version containing the exception._ |
| Trigger Step | A defined attribute. | _Step at which the exception becomes relevant._ |
| Condition | A defined attribute. | _Exception condition._ |
| Handling | A defined attribute. | _Required handling and guardrails._ |
| Approval Role | A defined attribute. | _Role that approves use of the exception._ |
| Fallback Role | A defined attribute. | _Role or function that executes fallback handling._ |
| Status | A defined attribute. | _Active, Draft, Retired, or Superseded._ |
| Active Exception Step Key | Determined by priority: the trigger step if the status is “Active”; in all other cases, an empty string. | _Echoes the TriggerStep id only for exceptions currently in Active status._ |
| Semantic Type Iri | A defined attribute. | _Extension class IRI._ |
| **Resource** | Documents, datasets, APIs, templates, images, manuals, and operational records referenced by procedures. Maps to dcat:Resource. | — |
| Name | The same as its title. | _Human-readable calculated display alias for the Resources row._ |
| Title | A defined attribute. | _Resource title; maps to dcterms:title._ |
| Resource Kind | A defined attribute. | _Document, Dataset, API, Template, OperationalRecord, Image, Video, or another declared type._ |
| External Uri | A defined attribute. | _Resolvable or organization-internal resource identifier._ |
| Created At | A defined attribute. | _Creation time; maps to dcterms:created._ |
| Modified At | A defined attribute. | _Modification time; maps to dcterms:modified._ |
| Description | A defined attribute. | _Resource description; maps to dcterms:description._ |
| Approval Status | A defined attribute. | _Approved, Draft, Deprecated, or Unvetted._ |
| Is Approved Source | True when the approval status is “Approved”. | _TRUE when this resource is an approved source._ |
| Semantic Type Iri | A defined attribute. | _Exact semantic class IRI._ |
| **Procedure Resource** | Links versioned procedures to supporting resources using PKO/dcterms provenance relations. | — |
| Name | Computed as the procedure version, followed by “ / ”, followed by the resource. | _Human-readable calculated display alias for the ProcedureResources row._ |
| Procedure Version | A defined attribute. | _Procedure version._ |
| Resource | A defined attribute. | _Referenced or source resource._ |
| Relation | A defined attribute. | _wasExtractedFrom, references, generated, used, or another declared relation._ |
| Relation Iri | Determined by priority: “https://w3id.org/pko#wasExtractedFrom” if the relation is “wasExtractedFrom”; in all other cases, “http://purl.org/dc/terms/references”. | _Exact semantic property IRI for the relation._ |
| **Elicitation Session** | Structured knowledge-elicitation events involving practitioners and knowledge engineers. Explicit ERB-PKO extension, modeled as prov:Activity. | — |
| Name | Computed as the method, followed by “ / ”, followed by the started at. | _Human-readable calculated display alias for the ElicitationSessions row._ |
| Procedure Version | A defined attribute. | _Procedure version whose knowledge was elicited._ |
| Method | A defined attribute. | _Interview, shadowing, workshop, observation, document analysis, or another method._ |
| Started At | A defined attribute. | _Start time; maps to prov:startedAtTime._ |
| Ended At | A defined attribute. | _End time; maps to prov:endedAtTime._ |
| Practitioner Agent | A defined attribute. | _Domain practitioner providing knowledge._ |
| Facilitator Agent | A defined attribute. | _Person facilitating elicitation._ |
| Summary | A defined attribute. | _What was learned and captured._ |
| Status | A defined attribute. | _Draft, Reviewed, Approved, or Rejected._ |
| Evaluation Context | A defined attribute. | _The evaluation context this row's time-dependent witnesses are judged under._ |
| As of Instant | Taken from the linked evaluation context. | _The evaluation instant this row's time-dependent witnesses are judged against._ |
| Days Since Elicited | Computed as the number of days from the ended at to the as of instant. | _Days elapsed since this elicitation session concluded._ |
| Is Single Witness Method | True when at least one of the following holds: the method is “Shadowing” or the method is “PractitionerInterview”. | _TRUE when this session captured one practitioner's account rather than a group's._ |
| Practitioner is Still Engaged | True when the linked practitioner agent is still engaged. | _Whether the practitioner whose knowledge this session captured still holds a role here._ |
| Valid Fragments Produced | The number of knowledge fragments related to the elicitation session. | _How many currently-valid knowledge fragments this one session produced._ |
| Is High Yield Session | True when the valid fragments produced is at least 3. | _A session that alone underwrites three or more currently-valid claims._ |
| Is Concentrated Single Witness | True when all of the following hold: the single witness method flag is set and the high yield session flag is set. | _One unrepeated session with one witness that underwrites three or more live claims._ |
| Is Stale Concentrated Witness | True when all of the following hold: the concentrated single witness flag is set and the days since elicited is greater than 180. | _A concentrated single-witness session more than 180 days old — matching the single-witness expiry horizon loop 1 already established._ |
| Concentrated Session Version Key | Determined by priority: the procedure version if the concentrated single witness flag is set; in all other cases, an empty string. | _Composite-key echo: this session's procedure version when the session is a concentrated single witness, blank otherwise._ |
| Semantic Type Iri | A defined attribute. | _Class IRI used in semantic projection._ |
| **Knowledge Fragment** | Explicit records of tacit, implicit, explicit, and situated procedural knowledge. This is an ERB-PKO extension represented as provenance-bearing dcat:Resource instances. | — |
| Name | Computed as the knowledge form, followed by “: ”, followed by the first 60 character(s) of the statement. | _Human-readable calculated display alias for the KnowledgeFragments row._ |
| Procedure Version | A defined attribute. | _Procedure version informed by the fragment._ |
| Step | A defined attribute. | _Optional step to which the fragment applies._ |
| Knowledge Form | A defined attribute. | _Tacit, Implicit, Explicit, SituatedJudgment, LessonLearned, or another declared form._ |
| Statement | A defined attribute. | _Captured knowledge statement._ |
| Elicitation Session | A defined attribute. | _Optional elicitation session that produced the fragment._ |
| Source Agent | A defined attribute. | _Practitioner or source agent._ |
| Confidence | A defined attribute. | _Low, Medium, or High confidence._ |
| Valid From | A defined attribute. | _Start of the fragment's valid-time interval._ |
| Valid to | A defined attribute. | _End of the fragment's valid-time interval._ |
| Status | A defined attribute. | _Draft, Reviewed, Approved, Rejected, or Superseded._ |
| Owner Role | A defined attribute. | _Role accountable for maintaining the fragment._ |
| Evaluation Context | A defined attribute. | _The evaluation context this row's time-dependent witnesses are judged under._ |
| As of Instant | Taken from the linked evaluation context. | _The evaluation instant this row's time-dependent witnesses are judged against._ |
| Is Currently Valid | True when all of the following hold: the valid from is at most the as of instant; at least one of the following holds: the valid to is blank or the valid to is greater than the as of instant; and the status is “Approved”. | _TRUE when the fragment is approved and valid now._ |
| Source Agent is Still Engaged | True when the linked source agent is still engaged. | _Whether the agent who is the source of this claim still holds a role here._ |
| Source Agent Kind | Taken from the linked source agent. | _Whether the source of this claim is a Human, an AIAgent, or an AutomatedPipeline._ |
| Has Human Source | True when the source agent kind is “Human”. | _TRUE when the claim originates from a human practitioner rather than software._ |
| Has Orphaned Provenance | True when all of the following hold: the currently valid flag is set and the source agent is still engaged flag is not set. | _TRUE when we still rely on this claim but the agent who gave it to us no longer holds a role here._ |
| Is Undefendable Tacit Claim | True when all of the following hold: the orphaned provenance flag is set and at least one of the following holds: the knowledge form is “Tacit” or the knowledge form is “SituatedJudgment”. | _TRUE when an orphaned claim is of a kind that lives in a person's head rather than in a document._ |
| Is Approved | True when the status is “Approved”. | _TRUE when this claim has passed knowledge-authority approval._ |
| Is Within Validity Window | True when all of the following hold: the valid from is at most the as of instant and at least one of the following holds: the valid to is blank or the valid to is greater than the as of instant. | _TRUE when this claim's stated validity window contains the present moment._ |
| Is Relied Upon | True when all of the following hold: the step has a value and the within validity window flag is set. | _TRUE when this claim is attached to a specific step and is inside its validity window — i.e. it is operationally in play._ |
| Step Procedure Version Status | Taken from the linked step. | _The procedure version owning the step this claim is attached to._ |
| Is Attached to Live Version | True when the linked procedure version is live. | _Whether the procedure version this claim belongs to is currently executable._ |
| Is Unapproved But Relied on | True when all of the following hold: the relied upon flag is set; the attached to live version flag is set; and the approved flag is not set. | _TRUE when a live procedure is acting on a claim that has not been approved by the knowledge authority._ |
| Evidence Age Days | The days since elicited of the knowledge fragment's elicitation session. | _Age in days of the elicitation session this claim came from._ |
| Has Recorded Elicitation | True when the elicitation session has a value. | _TRUE when this claim traces to a recorded elicitation session._ |
| Is From Single Witness | True when the knowledge fragment's elicitation session is a single witness method. | _Whether this claim rests on a single practitioner's account._ |
| Evidence Expiry Days | Determined by priority: 180 if the from single witness flag is set; in all other cases, 365. | _How many days this claim's evidence is trusted for, given how it was gathered._ |
| Evidence Has Expired | True when all of the following hold: the recorded elicitation flag is set and the evidence age days is greater than the evidence expiry days. | _TRUE when the evidence behind this claim is older than we trust evidence of its kind to be._ |
| Owner Agent | The current agent of the knowledge fragment's owner role. | _The agent currently holding the role that owns this claim._ |
| Is Awaiting Approval | True when the status is “Reviewed”. | _TRUE when this claim has been reviewed but not yet approved._ |
| Owner is Me | True when the owner role is “hr-policy-owner”. | _TRUE when the People Policy Owner role owns this claim._ |
| Is My Unfinished Approval | True when all of the following hold: the owner is me flag is set and the awaiting approval flag is set. | _TRUE when a claim I own has been reviewed and is waiting on my approval._ |
| Is Invoked by an Exception | The number of exceptions related to the knowledge fragment. | _How many documented exception handlers trigger on the same step this claim is attached to._ |
| Has Operational Reliance | True when the is invoked by an exception is greater than 0. | _TRUE when an exception handler exists on the step this claim governs._ |
| Is Unapproved and Operationally Live | True when all of the following hold: the my unfinished approval flag is set and the operational reliance flag is set. | _TRUE when a claim awaiting my approval is already being acted on through a documented exception path._ |
| Age Days | Computed as the number of days from the valid from to the as of instant. | _Days since this claim became valid._ |
| Is Low Confidence | True when at least one of the following holds: the confidence is “Medium” or the confidence is “Low”. | _TRUE when this claim was recorded with less than high confidence._ |
| Owning Version Cadence Days | The steward review cadence days of the knowledge fragment's procedure version. | _The review cadence promised for the version this claim supports._ |
| Exceeds Owning Cadence | True when the age days is greater than the owning version cadence days. | _TRUE when this claim is older than the review cadence promised for the version it supports._ |
| Is Aging Low Confidence Claim | True when all of the following hold: the exceeds owning cadence flag is set and the low confidence flag is set. | _TRUE when a claim we were never sure about has also outlived its version's review cadence._ |
| Owner Role Agent Kind | The current agent kind of the knowledge fragment's owner role. | _Agent kind of whoever currently holds the role that owns this knowledge fragment._ |
| Is Human Owned | True when the owner role agent kind is “Human”. | _TRUE when the owning role is currently held by a human._ |
| Is Ai Validated by Ai | True when all of the following hold: it is not the case that the source agent kind is “Human” and the human owned flag is not set. | _TRUE when knowledge came from a non-human source AND is owned by a non-human-held role._ |
| Review Cadence Days | The steward review cadence days of the knowledge fragment's procedure version. | _The review cadence promised for the procedure version this fragment supports, resolved via ProcedureVersions because INDEX/MATCH only matches a target primary key._ |
| Is Overdue for Review | True when all of the following hold: the currently valid flag is set and the age days is greater than the review cadence days. | _TRUE when a currently-valid fragment has gone longer than its stewardship cadence without review._ |
| Predates Current Role Holder | True when all of the following hold: the owner role agent kind has a value and the valid from is less than the owner role assignment valid from. | _TRUE when this knowledge became valid before the current holder of its owning role took the role._ |
| Owner Role Assignment Valid From | The current assignment valid from of the knowledge fragment's owner role. | _When the current holder of the owning role took that role._ |
| Last Reviewed At | A defined attribute. | _When this fragment was last actually reviewed and reaffirmed by its owning role. Null when it has never been reviewed since authoring. IsOverdueForReview infers recency from ValidFrom, which records when the claim became TRUE, not when anyone last looked at it. Those are different events, and the inference is deliberately left in place under its own name rather than silently rewritten to fall back on this column._ |
| Fragility Signal Count | Computed as the count of the following that hold: the from single witness flag is set; the overdue for review flag is set; the low confidence flag is set; and the operational reliance flag is set. | _How many of the four loop-1 decay signals are simultaneously true for this fragment: single witness, overdue for review, low confidence, operational reliance._ |
| Is Compound Fragile | True when the fragility signal count is at least 3. | _A fragment carrying at least three of the four decay signals at once._ |
| Is Single Point of Failure | True when all of the following hold: the from single witness flag is set and the operational reliance flag is set. | _A claim that rests on exactly one person's word and that an active exception handler actually routes cases against._ |
| Is Expiring Single Point of Failure | True when all of the following hold: the single point of failure flag is set and the overdue for review flag is set. | _A single-sourced, operationally relied-upon claim that is also past its review date._ |
| Compound Fragile Version Key | Determined by priority: the procedure version if the compound fragile flag is set; in all other cases, an empty string. | _Composite-key echo: this fragment's procedure version when the fragment is compound-fragile, blank otherwise._ |
| Valid Fragment Session Key | Determined by priority: the elicitation session if the currently valid flag is set; in all other cases, an empty string. | _Composite-key echo: the elicitation session behind this fragment when the fragment is currently valid, blank otherwise._ |
| Consuming Step is Software Assigned | True when the linked step is software assigned. | _Whether the step that consumes this fragment is assigned to an AI agent or an automated pipeline._ |
| Consuming Step Agent Kind | The assigned agent kind of the knowledge fragment's step. | _The kind of agent currently holding the role assigned to the step that consumes this fragment._ |
| Is Unapproved and Machine Consumed | True when all of the following hold: the unapproved but relied on flag is set and the consuming step is software assigned flag is set. | _An unapproved claim that a software-assigned step actually relies on — executed literally, with no human in position to notice it is wrong._ |
| Is Unapproved and Human Consumed | True when all of the following hold: the unapproved but relied on flag is set and the consuming step is software assigned flag is not set. | _An unapproved claim relied on by a human-assigned step — a reviewable risk rather than a silent one._ |
| Machine Consumed Unapproved Version Key | Determined by priority: the procedure version if the unapproved and machine consumed flag is set; in all other cases, an empty string. | _Composite-key echo: this fragment's procedure version when the fragment is unapproved and machine-consumed, blank otherwise._ |
| Has Review Record | True when the last reviewed at has a value. | _Whether this fragment has ever had an actual review recorded, as opposed to merely having a ValidFrom date._ |
| Days Since Actual Review | Determined by priority: the number of days from the last reviewed at to the as of instant if the review record flag is set; in all other cases, 0. | _Days elapsed since this fragment was last actually reviewed. Zero when no review has ever been recorded — read this only alongside HasReviewRecord, never on its own._ |
| Is Unreviewed Since Authoring | True when all of the following hold: the currently valid flag is set and the review record flag is not set. | _A currently-valid claim that nobody has ever reviewed since it was written._ |
| Is Genuinely Overdue | True when all of the following hold: the currently valid flag is set; the review record flag is set; and the days since actual review is greater than the review cadence days. | _A valid claim whose LAST ACTUAL REVIEW is older than the cadence its owning version promised._ |
| Review Recency is Inferred | True when all of the following hold: the overdue for review flag is set and the review record flag is not set. | _A fragment reported overdue by the loop-1 inference purely because no review has ever been recorded — the number is an artifact of missing data, not evidence of neglect._ |
| Inference Disagrees With Record | True when all of the following hold: the review record flag is set; the overdue for review flag is set; and the genuinely overdue flag is not set. | _A fragment the ValidFrom inference calls overdue but which was in fact reviewed inside its cadence — a false positive in the loop-1 predicate, now provable._ |
| Genuinely Overdue Version Key | Determined by priority: the procedure version if the genuinely overdue flag is set; in all other cases, an empty string. | _Composite-key echo: this fragment's procedure version when the fragment is genuinely overdue, blank otherwise._ |
| Ratified Boundary Count | The number of authority boundaries related to the knowledge fragment. | _How many currently-binding authority boundaries this fragment ratifies._ |
| Reliance Surface Count | Computed as the is invoked by an exception plus the ratified boundary count. | _Total number of distinct downstream dependents on this claim: exception handlers plus ratified authority boundaries._ |
| Days Awaiting My Approval | Determined by priority: the number of days from the valid from to the as of instant if the my unfinished approval flag is set; in all other cases, 0. | _How long a claim of mine has been sitting at Reviewed without my approval. Zero when the claim is not mine or is already decided._ |
| Is High Blast Radius Unapproved | True when all of the following hold: the unapproved and operationally live flag is set and the reliance surface count is greater than 1. | _An unapproved, operationally live claim of mine with more than one distinct downstream dependent._ |
| Is Long Unapproved | True when all of the following hold: the my unfinished approval flag is set and the days awaiting my approval is greater than 30. | _A claim that has waited on my signature for more than thirty days._ |
| Unapproved Load Bearing Version Key | Determined by priority: the procedure version if the high blast radius unapproved flag is set; in all other cases, an empty string. | _Composite-key echo: this fragment's procedure version when it is a high-blast-radius unapproved claim, blank otherwise._ |
| Owner Role is Vacated | True when the linked owner role is a vacated role. | _Whether the role that owns this claim is currently vacated._ |
| Is Orphaned by Role | True when all of the following hold: the currently valid flag is set and the owner role is vacated flag is set. | _A currently-valid claim whose owning role nobody holds — accountable to a vacancy._ |
| Valid Fragment Version Key | Determined by priority: the procedure version if the currently valid flag is set; in all other cases, an empty string. | _Composite-key echo: this fragment's owning procedure version when the fragment is currently valid, blank otherwise._ |
| Semantic Type Iri | A defined attribute. | _Extension class IRI._ |
| **Knowledge Gap** | Known unknowns and missing procedural coverage. Explicit ERB-PKO extension used to govern scope and prevent silent incompleteness. | — |
| Name | Computed as the severity, followed by “: ”, followed by the first 60 character(s) of the statement. | _Human-readable calculated display alias for the KnowledgeGaps row._ |
| Procedure Version | A defined attribute. | _Affected procedure version._ |
| Step | A defined attribute. | _Affected step._ |
| Statement | A defined attribute. | _What is not yet known or represented._ |
| Severity | A defined attribute. | _Low, Medium, High, or Critical._ |
| Blocking Kind | A defined attribute. | _Blocking or NonBlocking._ |
| Status | A defined attribute. | _Open, Investigating, Resolved, AcceptedRisk, or Closed._ |
| Owner Role | A defined attribute. | _Role responsible for resolving the gap._ |
| Identified At | A defined attribute. | _Time the gap was identified._ |
| Resolution Plan | A defined attribute. | _Resolution plan or final resolution._ |
| Is Open | True when at least one of the following holds: the status is “Open” or the status is “Investigating”. | _TRUE when the gap remains open._ |
| Open Gap Version Key | Determined by priority: the procedure version if all of the following hold: the open flag is set and the severity is “High”; in all other cases, an empty string. | _Echoes the ProcedureVersion id for open high-severity knowledge gaps._ |
| Is Blocking | True when the blocking kind is “Blocking”. | _TRUE when this gap is declared blocking rather than informational._ |
| Is Open and Blocking | True when all of the following hold: the open flag is set and the blocking flag is set. | _TRUE when this gap is both unresolved and declared blocking._ |
| Evaluation Context | A defined attribute. | _The evaluation context this row's time-dependent witnesses are judged under._ |
| As of Instant | Taken from the linked evaluation context. | _The evaluation instant this row's time-dependent witnesses are judged against._ |
| Days Open | Determined by priority: the number of days from the identified at to the as of instant if the open flag is set; in all other cases, 0. | _Days this gap has been unresolved, or zero once closed._ |
| Tolerance Days | Determined by priority: 30 if the severity is “High”; 90 if the severity is “Medium”; in all other cases, 180. | _How long a gap of this severity may remain open before it becomes a governance failure in its own right._ |
| Is Overdue Gap | True when the days open is greater than the tolerance days. | _TRUE when this acknowledged unknown has outlived the tolerance for its severity._ |
| Owner Agent | The current agent of the knowledge gap's owner role. | _The agent currently holding the role that owns resolving this gap._ |
| Owner is Still Engaged | True when the linked owner agent is still engaged. | _Whether the agent responsible for closing this gap still holds a role here._ |
| Has Resolution Plan | True when the resolution plan has a value. | _TRUE when someone has written down how this gap would be closed._ |
| Is Abandoned Unknown | True when all of the following hold: the overdue gap flag is set and at least one of the following holds: the resolution plan flag is not set or the owner is still engaged flag is not set. | _TRUE when an overdue gap has either no plan or no living owner — an admission of ignorance that nobody is acting on._ |
| Open Blocking Gap Version Key | Determined by priority: the procedure version if the open and blocking flag is set; in all other cases, an empty string. | _Composite-key echo: this gap's procedure version when the gap is both open and blocking, blank otherwise._ |
| Owner Role is Vacated | True when the linked owner role is a vacated role. | _Whether the role that owns this gap is currently vacated._ |
| Is Ownerless Open Gap | True when all of the following hold: the open flag is set and the owner role is vacated flag is set. | _An open gap whose owning role nobody currently holds — an acknowledged unknown with nobody accountable for closing it._ |
| Semantic Type Iri | A defined attribute. | _Extension class IRI._ |
| **FA Q** | Frequently asked procedural questions. Maps to pko:FrequentlyAskedQuestion, question, answer, hasFAQCategory, and hasFAQTarget. | — |
| Name | The same as its question. | _Human-readable calculated display alias for the FAQs row._ |
| Procedure Version | A defined attribute. | _Procedure version addressed by the FAQ._ |
| Step | A defined attribute. | _Optional step targeted by the FAQ._ |
| Category | A defined attribute. | _FAQ category._ |
| Target Kind | A defined attribute. | _Procedure, Step, Tool, Resource, or Execution._ |
| Question | A defined attribute. | _FAQ question; maps to pko:question._ |
| Answer | A defined attribute. | _Approved answer; maps to pko:answer._ |
| Semantic Type Iri | A defined attribute. | _Exact PKO class IRI._ |
| **Explanation** | Explainable derivation artifacts associated with procedural decisions. Maps to pko:Explanation and pko:hasExplanation. | — |
| Name | The same as its title. | _Human-readable calculated display alias for the Explanations row._ |
| Procedure Version | A defined attribute. | _Procedure version explained._ |
| Step | A defined attribute. | _Step explained._ |
| Title | A defined attribute. | _Explanation title._ |
| Description | A defined attribute. | _What the explanation traces._ |
| Semantic Type Iri | A defined attribute. | _Exact PKO class IRI._ |
| **Procedure Execution** | Concrete enactments of procedure specifications. Maps to pko:ProcedureExecution and remains separate from ProcedureVersions. | — |
| Name | Computed as the procedure version, followed by “ / ”, followed by the context. | _Human-readable calculated display alias for the ProcedureExecutions row._ |
| Procedure Version | A defined attribute. | _Exact procedure specification executed; maps to pko:hasExecutedProcedure._ |
| Execution Status | A defined attribute. | _PKO execution status: InProgress, Completed, Paused, or Cancelled._ |
| Started At | A defined attribute. | _Execution start; maps to prov:startedAtTime._ |
| Ended At | A defined attribute. | _Execution end; maps to prov:endedAtTime._ |
| Executed by Agent | A defined attribute. | _Agent accountable for the overall execution; maps to pko:wasExecutedBy._ |
| Context | A defined attribute. | _Execution-specific scope or target._ |
| Operational Record Uri | A defined attribute. | _Identifier in the operational execution system._ |
| Expected Step Count | The specified step count of the procedure execution's procedure version. | _How many steps this execution was supposed to perform._ |
| Completed Step Count | The number of step executions related to the procedure execution. | _How many steps of this execution actually reached Completed._ |
| Control Breach Count | The number of step executions related to the procedure execution. | _Total step executions in this run that carry at least one control breach._ |
| Late Step Count | The number of step executions related to the procedure execution. | _How many steps in this execution ran long._ |
| Is Structurally Complete | True when the completed step count is at least the expected step count. | _TRUE when every specified step of the procedure version reached Completed in this execution._ |
| Diverged From Specification | True when at least one of the following holds: the structurally complete flag is not set or the control breach count is greater than 0. | _TRUE when the execution either skipped specified steps or carried at least one control breach._ |
| All Blocking Controls Evaluated | True when the unevaluated blocking total is 0. | _TRUE when every blocking requirement bound to every step of this execution received a satisfaction record._ |
| Unevaluated Blocking Total | The number of step executions related to the procedure execution. | _How many step executions in this run left at least one blocking control unevaluated._ |
| Separation of Duties Held | True when the separation violation count is 0. | _TRUE when no agent both prepared and approved within this execution._ |
| Separation Violation Count | The number of step executions related to the procedure execution. | _Number of segregation-of-duties violations in this execution._ |
| Is Attestation Ready | True when all of the following hold: the structurally complete flag is set; the diverged from specification flag is not set; the all blocking controls evaluated flag is set; and the separation of duties held flag is set. | _TRUE only when every step completed, no control breached, every blocking control was actually evaluated, and segregation of duties held._ |
| Attestation Blocker Summary | Determined by priority: an empty string if the attestation ready flag is set; “Incomplete: specified steps did not all complete.” if the structurally complete flag is not set; “Segregation of duties violated.” if the separation violation count is greater than 0; “Blocking controls were never evaluated.” if the unevaluated blocking total is greater than 0; in all other cases, “Control breach recorded on one or more steps.”. | _Names the highest-severity reason the attestation cannot be signed, or empty when it can._ |
| Executed Version is Fit | True when the procedure execution's procedure version is a fit to execute. | _Whether the procedure version this execution ran against is currently fit to execute._ |
| Signed Against Unfit Version | True when all of the following hold: the execution status is “Completed” and the executed version is fit flag is not set. | _TRUE when a completed execution was run against a procedure version the organization no longer stands behind._ |
| Asserted Only Control Count | The number of requirement satisfactions related to the procedure execution. | _How many blocking controls in this execution passed on human assertion alone._ |
| Assurance is Mostly Asserted | True when the asserted only control count is greater than 0. | _TRUE when any blocking control in this execution passed without a computed witness behind it._ |
| Unreachable Handling Failure Count | The number of message deliveries related to the procedure execution. | _Number of deliveries in this execution where unreachable handling was wrong -- either fabricated acknowledgement or no exception invoked._ |
| Retention Breach Count | The number of message deliveries related to the procedure execution. | _Number of transmitted messages in this execution whose text we no longer hold despite an active retention obligation._ |
| Cleared Legal Review Count | The number of step executions related to the procedure execution. | _How many passed legal reviews exist for this execution._ |
| Has Cleared Legal Review | True when the cleared legal review count is greater than 0. | _TRUE when legal review has passed for this execution._ |
| Abandoned Failure Count | The number of message deliveries related to the procedure execution. | _Number of failed deliveries in this run that nobody picked up._ |
| Delivered Count | The number of message deliveries related to the procedure execution. | _Number of confirmed-delivered messages in this run._ |
| Total Delivery Attempt Count | The number of message deliveries related to the procedure execution. | _Total delivery records of any status for this run._ |
| Has Abandoned Failures | True when the abandoned failure count is greater than 0. | _TRUE when this run has any untriaged delivery failure._ |
| Mishandled Refusal Count | The number of send intents related to the procedure execution. | _Number of gate refusals in this run that were either overridden or silently dropped._ |
| Unclean Step Count | The number of step executions related to the procedure execution. | _Number of step executions in this run that were not clean._ |
| Ran Clean | True when the unclean step count is 0. | _TRUE when every step execution in this run was clean._ |
| Count of Approval Executions | The number of step executions related to the procedure execution. | _How many human approval gates were executed in this run._ |
| Has Human Approval | True when the count of approval executions is greater than 0. | _TRUE when at least one human approval gate was executed in this run._ |
| Count of Delivery Executions | The number of step executions related to the procedure execution. | _How many times the send step ran in this execution._ |
| Has Delivered | True when the count of delivery executions is greater than 0. | _TRUE when this run has sent communications to employees._ |
| Delivered Without Approval | True when all of the following hold: the delivered flag is set and the human approval flag is not set. | _TRUE when a run sent employee communications without executing a human approval gate._ |
| Invalid Approval Count | The number of requirement satisfactions related to the procedure execution. | _Number of approval-type requirements in this run that are incomplete or non-human-evaluated._ |
| Approval Chain is Complete | True when the invalid approval count is 0. | _TRUE when every approval-type requirement in this run is fully satisfied by a human._ |
| Vacuously Clean Step Count | The number of step executions related to the procedure execution. | _How many steps in this run were clean only because nothing checked them._ |
| Preparation Step Count | The number of step executions related to the procedure execution. | _How many preparation steps this execution actually ran._ |
| Approval Step Count | The number of step executions related to the procedure execution. | _How many approval steps this execution actually ran._ |
| Separation Was Testable | True when all of the following hold: the preparation step count is greater than 0 and the approval step count is greater than 0. | _TRUE when this execution contained both a preparation step and an approval step, so segregation of duties had an opportunity to fail._ |
| Separation Held Under Test | True when all of the following hold: the separation was testable flag is set and the separation of duties held flag is set. | _TRUE only when segregation of duties both could have failed and did not._ |
| Separation is Vacuously Green | True when all of the following hold: the separation of duties held flag is set and the separation was testable flag is not set. | _TRUE when the segregation control reports as held on a run where it could not have failed._ |
| Separation Assurance Note | Determined by priority: “Violated: same agent prepared and approved.” if the separation violation count is greater than 0; “Not tested: this run had no preparation/approval pair.” if the separation is vacuously green flag is set; in all other cases, “Held under test.”. | _The sentence that goes into the control narrative for this execution._ |
| Ungoverned Divergence Count | The number of step executions related to the procedure execution. | _How many steps in this run departed from spec with nothing authorising the departure._ |
| Divergence Was Fully Governed | True when all of the following hold: the diverged from specification flag is set and the ungoverned divergence count is 0. | _TRUE when this run departed from specification and every departure was authorised._ |
| Computedly Witnessed Control Count | The number of requirement satisfactions related to the procedure execution. | _How many blocking controls in this run were cleared by something computed._ |
| Evaluated Control Count | Computed as the computedly witnessed control count plus the asserted only control count. | _Total blocking controls actually evaluated in this run, computed and asserted together._ |
| Computed Assurance Ratio | Determined by priority: 0 if the evaluated control count is 0; in all other cases, the computedly witnessed control count divided by the evaluated control count. | _The fraction of evaluated blocking controls in this run that rest on a computed witness rather than a human assertion._ |
| Interested Party Assertion Count | The number of requirement satisfactions related to the procedure execution. | _How many controls in this run were cleared by assertion from someone with an interest in the outcome._ |
| Assurance Grade | Determined by priority: “None: no blocking control was evaluated.” if the evaluated control count is 0; “Weak: at least one control rests on an interested-party assertion.” if the interested party assertion count is greater than 0; “Thin: most controls rest on human assertion.” if the computed assurance ratio is less than 0.5; “Mixed: computed and asserted controls.” if the computed assurance ratio is less than 1; in all other cases, “Computed: every evaluated control has a witness.”. | _Names the quality of the assurance behind this execution, worst case first._ |
| Attestation Would Be Weakly Based | True when all of the following hold: the attestation ready flag is set and at least one of the following holds: the interested party assertion count is greater than 0 or the computed assurance ratio is less than 0.5. | _TRUE when the model says I may sign, but the basis for that permission is mostly or partly unwitnessed assertion._ |
| Independent Human Observation Count | The number of verification outcomes related to the procedure execution. | _How many verifications in this run were independently observed by a human with evidence attached._ |
| Has Any Independent Observation | True when the independent human observation count is greater than 0. | _TRUE when at least one verification in this run was independently observed by a human._ |
| Self Attested Approval Count | The number of step executions related to the procedure execution. | _How many approval steps in this run rested on self-attestation._ |
| Assurance Chain is Circular | True when all of the following hold: the self attested approval count is greater than 0 and the any independent observation flag is not set. | _TRUE when every approval in this run rests on self-attestation and no independent human observation exists anywhere in it._ |
| Latest Attestation Instant | The largest signed at across the attestations related to the procedure execution. | _The most recent signature instant for this execution._ |
| Has Been Attested | True when the attestation count is greater than 0. | _TRUE when someone has signed for this execution._ |
| Attestation Count | The number of attestations related to the procedure execution. | _How many signatures exist against this execution._ |
| Post Attestation Score Count | The number of requirement satisfactions related to the procedure execution. | _How many controls were scored after this execution was signed._ |
| Basis Changed After Signature | True when all of the following hold: the been attested flag is set and the post attestation score count is greater than 0. | _TRUE when controls this attestation depended on were scored after the signature was given._ |
| Requires Re Attestation | True when all of the following hold: the basis changed after signature flag is set and the attestation ready flag is not set. | _TRUE when the basis changed after signature AND the execution no longer reads as attestable._ |
| Intended Recipient Count | The number of send intents related to the procedure execution. | _How many sends this campaign proposed to make._ |
| Reached Recipient Count | The number of send intents related to the procedure execution. | _How many of those sends actually left our systems._ |
| Silently Dropped Count | The number of send intents related to the procedure execution. | _How many intended recipients disappeared from this campaign with no record._ |
| Delivery Yield Percent | Determined by priority: the reached recipient count times 100 divided by the intended recipient count if the intended recipient count is greater than 0; in all other cases, 0. | _Percentage of intended recipients who actually received the communication._ |
| Campaign Silently Lost Audience | True when the silently dropped count is greater than 0. | _TRUE when a campaign lost intended recipients without producing any record of the loss._ |
| Unrecorded Refusal Count | The number of send intents related to the procedure execution. | _How many sends this execution refused without recording the refusal anywhere._ |
| Has Unrecorded Refusals | True when the unrecorded refusal count is greater than 0. | _TRUE when this run contains at least one refusal that left no trace anywhere._ |
| Independently Confirmed Intent Count | The number of send intents related to the procedure execution. | _How many of this execution's send decisions were corroborated by a delivery record._ |
| Send Decisions are Entirely Self Witnessed | True when all of the following hold: the intended recipient count is greater than 0 and the independently confirmed intent count is 0. | _TRUE when no send decision in this run was confirmed by anything other than the pipeline itself._ |
| Semantic Type Iri | A defined attribute. | _Exact PKO class IRI._ |
| **Step Execution** | Concrete executions of specified steps. Maps to pko:StepExecution, hasExecutedStep, includesStepExecution, and nextStepExecution. | — |
| Name | Computed as the procedure execution, followed by “ / ”, followed by the step. | _Human-readable calculated display alias for the StepExecutions row._ |
| Procedure Execution | A defined attribute. | _Parent procedure execution._ |
| Step | A defined attribute. | _Specified step executed; maps to pko:hasExecutedStep._ |
| Executed by Agent | A defined attribute. | _Agent executing the step; maps to pko:wasExecutedBy._ |
| Execution Status | A defined attribute. | _InProgress, Completed, Paused, Cancelled, or Failed._ |
| Started At | A defined attribute. | _Execution start._ |
| Ended At | A defined attribute. | _Execution end._ |
| Verification Result | A defined attribute. | _PASS, WARN, FAIL, or PENDING._ |
| Deviation | A defined attribute. | _Observed deviation from the specification._ |
| Actual Duration Minutes | Determined by priority: 0 if the ended at is blank; in all other cases, the number of minutes from the started at to the ended at. | _Observed duration in minutes._ |
| Expected Duration Minutes | Taken from the linked step. | _Expected duration from the specification._ |
| Is Late | True when the actual duration minutes is greater than the expected duration minutes. | _TRUE when actual duration exceeds expected duration._ |
| Blocking Unmet Count | The number of the step execution's requirement satisfactions that are blocking and unmets. | _How many blocking requirements attached to this step execution are recorded as not fully satisfied._ |
| Blocking Unmet Count Safe | The number of requirement satisfactions related to the step execution. | _Count of blocking-but-unmet requirements on this step execution, computed via the single-criterion key so no criterion is dropped._ |
| Proceeded Past Blocking Control | True when all of the following hold: the execution status is “Completed” and the blocking unmet count safe is greater than 0. | _TRUE when a step execution reached Completed even though a blocking requirement on it was never fully satisfied._ |
| Expected Blocking Count | The blocking requirement count of the step execution's step. | _How many blocking requirements this execution's step was supposed to have evaluated._ |
| Evaluated Blocking Count | The number of requirement satisfactions related to the step execution. | _How many blocking requirements actually received a satisfaction record on this step execution, at any level._ |
| Unevaluated Blocking Count | Computed as the expected blocking count minus the evaluated blocking count. | _Blocking requirements that were bound to this step but never assessed on this execution._ |
| Has Unevaluated Blocking Control | True when the unevaluated blocking count is greater than 0. | _TRUE when at least one blocking control bound to this step was never evaluated on this execution._ |
| Stale Authoritative Source Count | Taken from the linked step. | _Number of stale authoritative sources bound to the step this execution ran._ |
| Ran on Stale Authoritative Source | True when the stale authoritative source count is greater than 0. | _TRUE when this execution's step depends on at least one authoritative source that is outside its freshness SLA._ |
| Has Deviation Note | True when the deviation has a value. | _TRUE when a human recorded some deviation narrative on this execution._ |
| Is Late and Unexplained | True when all of the following hold: the late flag is set and the deviation note flag is not set. | _TRUE when the execution exceeded its expected duration and no deviation was recorded._ |
| Available Exception Count for Step | Taken from the linked step. | _How many active exceptions were available to this execution's step._ |
| Had Uninvoked Exception Available | True when all of the following hold: the late and unexplained flag is set and the available exception count for step is greater than 0. | _TRUE when an execution ran long with no explanation despite the specification defining an active exception for exactly that situation._ |
| Expected Verification Count | The declared verification count of the step execution's step. | _How many verifications this execution was supposed to perform._ |
| Performed Verification Count | The number of verification outcomes related to the step execution. | _How many verification outcomes were actually recorded against this execution._ |
| Skipped Verification Count | Computed as the expected verification count minus the performed verification count. | _Declared verifications with no recorded outcome on this execution._ |
| Has Skipped Verification | True when the skipped verification count is greater than 0. | _TRUE when a declared verification was never performed on this execution._ |
| Claims Pass Without Evidence | True when all of the following hold: the verification result is “PASS” and the skipped verification flag is set. | _TRUE when an execution asserts PASS while at least one declared verification has no recorded outcome._ |
| Step is Preparation | True when the linked step is a preparation step. | _Whether this execution ran a preparation step._ |
| Step is Approval | True when the step execution's step is an approval step. | _Whether this execution ran an approval step._ |
| Preparer Agent Key | Determined by priority: the procedure execution, followed by “|”, followed by the executed by agent if the step is preparation flag is set; in all other cases, an empty string. | _Composite execution+agent key, emitted only for preparation steps._ |
| Approver Agent Key | Determined by priority: the procedure execution, followed by “|”, followed by the executed by agent if the step is approval flag is set; in all other cases, an empty string. | _Composite execution+agent key, emitted only for approval steps._ |
| Prepared by This Agent Count | The number of step executions related to the step execution. | _On an approval row, how many preparation steps in the SAME procedure execution were run by this same agent._ |
| Violates Separation of Duties | True when all of the following hold: the step is approval flag is set and the prepared by this agent count is greater than 0. | _TRUE when the agent approving this step also prepared work earlier in the same procedure execution._ |
| Required Role for Step | The assigned role of the step execution's step. | _The role the specification assigns to this step._ |
| Executor Role Key | Computed as the executed by agent, followed by “|”, followed by the required role for step. | _The agent+role pair that would need to exist as a valid assignment for this execution to be properly authorized._ |
| Executor Authority Count | The number of role assignments related to the step execution. | _How many currently-valid role assignments grant this executor the role their step required._ |
| Executor Held Required Role | True when the executor authority count is greater than 0. | _TRUE when the executing agent holds a currently-valid assignment to the role the step required._ |
| Is Unauthorized Approval | True when all of the following hold: the step is approval flag is set and the executor held required role flag is not set. | _TRUE when an approval step was executed by an agent who does not hold the required approving role._ |
| Completed Execution Key | Determined by priority: the procedure execution if the execution status is “Completed”; in all other cases, an empty string. | _Echoes the parent execution id only for completed steps._ |
| Control Breach Execution Key | Determined by priority: the procedure execution if at least one of the following holds: the proceeded past blocking control flag is set; the violates separation of duties flag is set; the unauthorized approval flag is set; or the claims pass without evidence flag is set; in all other cases, an empty string. | _Echoes the parent execution id when this step execution carries ANY control breach._ |
| Late Execution Key | Determined by priority: the procedure execution if the late flag is set; in all other cases, an empty string. | _Echoes the parent execution id only for steps that ran past their expected duration._ |
| Executor Agent Kind | Taken from the linked executed by agent. | _Human, AIAgent, or AutomatedPipeline — what kind of agent actually ran this step._ |
| Executor is Human | True when the executor agent kind is “Human”. | _TRUE when a human executed this step._ |
| Step Requires Human Confirmation | True when the linked step requires human confirmation. | _Whether the specification requires this step to be human-confirmed._ |
| Non Human Ran Human Step | True when all of the following hold: the step requires human confirmation flag is set and the executor is human flag is not set. | _TRUE when a step requiring human confirmation was executed by an AI agent or automated pipeline._ |
| Non Human Approval | True when all of the following hold: the step is approval flag is set and the executor is human flag is not set. | _TRUE when an approval-authority step was executed by a non-human agent, regardless of the RequiresHumanConfirmation flag._ |
| Unevaluated Blocking Execution Key | Determined by priority: the procedure execution if the unevaluated blocking control flag is set; in all other cases, an empty string. | _Echoes the parent execution id when this step left a blocking control unevaluated._ |
| Separation Violation Execution Key | Determined by priority: the procedure execution if the violates separation of duties flag is set; in all other cases, an empty string. | _Echoes the parent execution id when this step execution violates segregation of duties._ |
| Self Witnessed Verification Count | The number of verification outcomes related to the step execution. | _How many of this execution's verifications were observed by the same agent who ran the step._ |
| Unbacked Verification Count | The number of verification outcomes related to the step execution. | _How many verifications on this execution recorded a matching signal with no retained evidence artifact._ |
| Approval Rests on Self Attestation | True when all of the following hold: the step is approval flag is set and at least one of the following holds: the self witnessed verification count is greater than 0 or the skipped verification flag is set. | _TRUE when an approval step's verification was either self-witnessed by the approver or never performed at all._ |
| Exception Invocation Count | The number of exception invocations related to the step execution. | _How many specified exceptions were invoked during this step execution._ |
| Ran Under Exception | True when the exception invocation count is greater than 0. | _TRUE when this execution invoked at least one specified exception._ |
| Is Completed | True when the execution status is “Completed”. | _TRUE when this step execution reached a completed state._ |
| Is Verification Passed | True when the verification result is “PASS”. | _TRUE only when this step execution's verification actually passed. PENDING and FAIL are both not-passed._ |
| Is Legal Review Step | True when the step is “policy-04”. | _TRUE for executions of the legal and privacy review step._ |
| Cleared Legal Review Key | Determined by priority: the procedure execution if all of the following hold: the legal review step flag is set and the verification passed flag is set; in all other cases, an empty string. | _Carries the execution id only when this row is a PASSED legal review; empty string otherwise._ |
| Assigned Role | Taken from the linked step. | _The role the specification assigns to this step._ |
| Role Current Agent | Taken from the linked assigned role. | _The agent currently designated to hold the step's assigned role._ |
| Executor is Designated Agent | True when the executed by agent is the role current agent. | _TRUE when the agent that executed the step is the agent currently designated for the step's role._ |
| Inputs Were Fresh At Run | True when the step execution's step is a fresh. | _Freshness verdict for the step this execution ran._ |
| Ran on Stale Inputs | True when all of the following hold: the execution status is “Completed” and the inputs were fresh at run flag is not set. | _TRUE when an execution completed even though its step's authoritative inputs are stale._ |
| Unresolved Issue Count | The number of issue occurrences related to the step execution. | _Number of unresolved issue occurrences recorded against this execution._ |
| Has Deviation | True when the deviation has a value. | _TRUE when a deviation from the specification was recorded._ |
| Is Clean | True when all of the following hold: the verification result is “PASS”; the deviation flag is not set; the unresolved issue count is 0; and the late flag is not set. | _TRUE when this execution passed verification, deviated from nothing, left no open issue, and finished on time._ |
| Procedure Execution When Unclean | Determined by priority: an empty string if the clean flag is set; in all other cases, the procedure execution. | _Echoes the parent execution id when this step execution is not clean, blank otherwise._ |
| Evaluated Requirement Count | The number of requirement satisfactions related to the step execution. | _Number of requirements actually scored against this execution._ |
| Required Blocking Count | The blocking requirement count of the step execution's step. | _Number of blocking requirements the specification demands for this step._ |
| Has Unevaluated Blocking Requirement | True when the evaluated requirement count is less than the required blocking count. | _TRUE when fewer requirements were scored than the step has blocking requirements._ |
| Executing Agent Kind | Taken from the linked executed by agent. | _The kind of agent that actually performed this step execution._ |
| Was Executed by Software | True when at least one of the following holds: the executing agent kind is “AIAgent” or the executing agent kind is “AutomatedPipeline”. | _TRUE when software actually performed this step._ |
| Step is Software Assigned | True when the linked step is software assigned. | _Whether the step being executed was specified as a software step._ |
| Software Did Human Work | True when all of the following hold: the was executed by software flag is set and the step is software assigned flag is not set. | _TRUE when software performed a step the procedure specified for a human._ |
| Is Approval Execution | True when the step execution's step is a human approval gate. | _Whether this execution is of a designated human approval gate._ |
| Is Verified | True when all of the following hold: the verification result has a value; the verification result is not “PENDING”; and the verification result is not “FAIL”. | _TRUE when this execution recorded a positive verification outcome._ |
| Unconfirmed Non Human Decision Count | The number of agent decision records related to the step execution. | _Number of material non-human decisions in this execution that no human confirmed._ |
| Requires Human Confirmation | True when the linked step requires human confirmation. | _Whether the specification requires human confirmation for this step._ |
| Human Confirmation Missing | True when all of the following hold: the requires human confirmation flag is set and the unconfirmed non human decision count is greater than 0. | _TRUE when a step requiring human confirmation contains unconfirmed material non-human decisions._ |
| Drafted From Unusable Source | True when all of the following hold: the execution status is “Completed” and the inputs were usable flag is not set. | _TRUE when a drafting execution completed despite an unapproved or stale source at its step._ |
| Inputs Were Usable | True when the step execution's step is all sources usable. | _Source-usability verdict for the step this execution ran._ |
| Software Execution Step Key | Determined by priority: the step if the was executed by software flag is set; in all other cases, an empty string. | _Composite-key echo: the step this execution ran when it was carried out by software, blank otherwise._ |
| Step Control Kind | Taken from the linked step. | _The control kind of the step this execution ran._ |
| Unfalsified Clearance Count | The number of requirement satisfactions related to the step execution. | _How many of this step's blocking clearances came from controls that have never once failed._ |
| All Clearances are Unfalsified | True when all of the following hold: the evaluated blocking count is greater than 0 and the unfalsified clearance count is at least the evaluated blocking count. | _TRUE when every blocking control evaluated on this step is one that has never returned a negative result._ |
| Stale At Run Count | The number of binding observations related to the step execution. | _How many authoritative sources this step read that were already out of SLA when it read them._ |
| Was Stale When I Ran It | True when the stale at run count is greater than 0. | _TRUE when this execution consumed at least one authoritative source that was stale at the time of reading._ |
| Staleness Answer is Tense Dependent | True when it is not the case that the was stale when i ran it is the ran on stale authoritative source. | _TRUE when the as-of-now staleness verdict disagrees with the as-of-run verdict for the same step._ |
| Has Any Declared Check | True when at least one of the following holds: the expected verification count is greater than 0 or the expected blocking count is greater than 0. | _TRUE when the specification declared at least one verification or one blocking requirement for this step._ |
| Performed Check Count | Computed as the performed verification count plus the evaluated blocking count. | _Total number of checks actually carried out on this execution, verifications plus blocking-control evaluations._ |
| Declared Check Count | Computed as the expected verification count plus the expected blocking count. | _Total number of checks the specification called for on this step._ |
| Is Unchecked by Design | True when the declared check count is 0. | _TRUE when the specification asked for no verification and no blocking control on this step at all._ |
| Is Vacuously Clean | True when all of the following hold: the clean flag is set and the unchecked by design flag is set. | _TRUE when this execution reads clean and nothing was ever declared that could have made it read otherwise._ |
| Is Substantively Clean | True when all of the following hold: the clean flag is set; the performed check count is at least the declared check count; and the declared check count is greater than 0. | _TRUE when this execution is clean AND every declared check was actually performed._ |
| Vacuously Clean Execution Key | Determined by priority: the procedure execution if the vacuously clean flag is set; in all other cases, an empty string. | _Echoes the parent execution id when this step is vacuously clean._ |
| Uncorroborated Pass Count | The number of verification outcomes related to the step execution. | _How many of this step's passing verifications were observed by the executor with no evidence attached._ |
| Evidence Position is Weak | True when all of the following hold: the performed verification count is greater than 0 and the uncorroborated pass count is at least the performed verification count. | _TRUE when every verification performed on this step was an uncorroborated self-witnessed pass._ |
| Preparation Execution Key | Determined by priority: the procedure execution if the step is preparation flag is set; in all other cases, an empty string. | _Echoes the parent execution id when this step execution is a preparation step._ |
| Approval Execution Key | Determined by priority: the procedure execution if the step is approval flag is set; in all other cases, an empty string. | _Echoes the parent execution id when this step execution is an approval step._ |
| Has Governing Instrument | True when at least one of the following holds: the ran under exception flag is set or the approved change coverage flag is set. | _TRUE when this step's departure from spec is covered by an invoked exception or an approved change request against its procedure version._ |
| Has Approved Change Coverage | True when the step execution's version of step has an approved change request. | _Whether the procedure version this step belongs to has an approved change request that could account for a departure._ |
| Version of Step | The procedure version of the step execution's step. | _The procedure version this step execution's specification step belongs to._ |
| Is Ungoverned Divergence | True when all of the following hold: at least one of the following holds: the deviation flag is set; the late flag is set; or the proceeded past blocking control flag is set and the governing instrument flag is not set. | _TRUE when this step departed from specification and no exception or approved change covers it._ |
| Ungoverned Divergence Execution Key | Determined by priority: the procedure execution if the ungoverned divergence flag is set; in all other cases, an empty string. | _Echoes the parent execution id when this step diverged without governance._ |
| Self Attested Approval Execution Key | Determined by priority: the procedure execution if the approval rests on self attestation flag is set; in all other cases, an empty string. | _Echoes the parent execution id when this approval rested on self-attestation._ |
| Semantic Type Iri | A defined attribute. | _Exact PKO class IRI._ |
| **Requirement Satisfaction** | Execution-time evaluations of requirements. Maps to pko:RequirementSatisfaction, refersToRequirement, and hasRequirementSatisfactionLevel. | — |
| Name | Computed as the requirement, followed by “ / ”, followed by the satisfaction level. | _Human-readable calculated display alias for the RequirementSatisfactions row._ |
| Step Execution | A defined attribute. | _Execution being evaluated._ |
| Requirement | A defined attribute. | _Requirement evaluated._ |
| Satisfaction Level | A defined attribute. | _NotEvaluated, NotSatisfied, PartiallySatisfied, or Satisfied._ |
| Evidence | A defined attribute. | _Evidence supporting the evaluation._ |
| Evaluated by Agent | A defined attribute. | _Agent that evaluated satisfaction._ |
| Evaluated At | A defined attribute. | _Evaluation timestamp._ |
| Requirement is Blocking | True when the linked requirement is blocking. | _Whether the requirement being evaluated on this satisfaction row is a blocking control._ |
| Is Fully Satisfied | True when the satisfaction level is “Satisfied”. | _TRUE only when the requirement is recorded as fully Satisfied. PartiallySatisfied, Unsatisfied, Waived, and blank are all FALSE._ |
| Is Blocking and Unmet | True when all of the following hold: the requirement is blocking flag is set and the fully satisfied flag is not set. | _TRUE when a blocking requirement is recorded at anything less than fully Satisfied. This is the control-failure witness at the requirement grain._ |
| Blocking Unmet Step Key | Determined by priority: the step execution if the blocking and unmet flag is set; in all other cases, an empty string. | _Echoes the parent StepExecution id only when this row is a blocking-unmet violation; empty string otherwise._ |
| Blocking Satisfaction Step Key | Determined by priority: the step execution if the requirement is blocking flag is set; in all other cases, an empty string. | _Echoes the parent StepExecution id when this satisfaction row concerns a blocking requirement._ |
| Negative Outcome Requirement Key | Determined by priority: the requirement if the fully satisfied flag is not set; in all other cases, an empty string. | _Echoes the Requirement id only when this evaluation came out at less than fully Satisfied._ |
| Evaluator Agent Kind | Taken from the linked evaluated by agent. | _What kind of agent evaluated this requirement satisfaction._ |
| Non Human Evaluated Human Control | True when all of the following hold: the requirement is blocking flag is set and the evaluator agent kind is not “Human”. | _TRUE when a blocking requirement was evaluated by a non-human agent._ |
| Requirement Has Computed Witness | True when the linked requirement has a computed witness. | _Whether the requirement this row evaluates has a computed witness behind it._ |
| Is Asserted Only | True when all of the following hold: the requirement is blocking flag is set; the fully satisfied flag is set; and the requirement has computed witness flag is not set. | _TRUE when a blocking requirement is recorded as Satisfied purely on human assertion, with no computed predicate behind it._ |
| Asserted Only Execution Key | Determined by priority: the parent procedure execution if the asserted only flag is set; in all other cases, an empty string. | _Echoes the grandparent procedure execution id for assertion-only satisfactions._ |
| Parent Procedure Execution | Taken from the linked step execution. | _The procedure execution this satisfaction ultimately belongs to._ |
| Step Execution When Scored | Determined by priority: the step execution if the satisfaction level has a value; in all other cases, an empty string. | _Echoes the step-execution id when a satisfaction level was actually recorded, blank otherwise._ |
| Is Human Evaluated | True when the evaluator agent kind is “Human”. | _TRUE when a human evaluated this requirement satisfaction._ |
| Requirement is Approval Type | Taken from the linked requirement. | _The requirement's type, e.g. Approval, Control, Privacy._ |
| Is Invalid Approval | True when all of the following hold: the requirement is approval type is “Approval” and at least one of the following holds: the fully satisfied flag is not set or the human evaluated flag is not set. | _TRUE when an approval-type requirement is not fully satisfied, or was not evaluated by a human._ |
| Procedure Execution of Satisfaction | Taken from the linked step execution. | _The run this satisfaction belongs to._ |
| Run When Invalid Approval | Determined by priority: the procedure execution of satisfaction if the invalid approval flag is set; in all other cases, an empty string. | _Echoes the run id when this is an invalid approval, blank otherwise._ |
| Requirement is Unfalsified | True when the requirement satisfaction's requirement is an unfalsified control. | _Whether the requirement behind this satisfaction record has never once returned a negative result._ |
| Is Clearance by Unfalsified Control | True when all of the following hold: the fully satisfied flag is set; the requirement is blocking flag is set; and the requirement is unfalsified flag is set. | _TRUE when this record cleared a step against a blocking control that has never produced a negative outcome._ |
| Unfalsified Clearance Step Key | Determined by priority: the step execution if the clearance by unfalsified control flag is set; in all other cases, an empty string. | _Echoes the step execution id when this clearance came from an unfalsified control._ |
| Spec Step of Execution | Taken from the linked step execution. | _The specification step behind the step execution this satisfaction was recorded against._ |
| Binding Key | The step requirement ID of the requirement satisfaction's requirement satisfaction ID. | _The StepRequirements binding this satisfaction record exercised._ |
| Scored Step Executor Agent | The executed by agent of the requirement satisfaction's step execution. | _The agent who executed the step this satisfaction record scores._ |
| Evaluator is Step Executor | True when the evaluated by agent is the scored step executor agent. | _TRUE when the agent who scored this control is the same agent who performed the step being scored._ |
| Run Owner Agent | The executed by agent of the requirement satisfaction's parent procedure execution. | _The agent accountable for the whole procedure execution this satisfaction sits inside._ |
| Evaluator Owns the Run | True when the evaluated by agent is the run owner agent. | _TRUE when the agent scoring this control is the agent accountable for the execution it belongs to._ |
| Is Interested Party Assertion | True when all of the following hold: the asserted only flag is set and at least one of the following holds: the evaluator is step executor flag is set or the evaluator owns the run flag is set. | _TRUE when a blocking control's only evidence is an assertion made by someone with an interest in the outcome._ |
| Has Written Evidence | True when the evidence has a value. | _TRUE when this satisfaction record carries any evidence text at all._ |
| Is Bare Assertion | True when all of the following hold: the asserted only flag is set and the written evidence flag is not set. | _TRUE when a blocking control was cleared with no computed witness and no written justification._ |
| Interested Assertion Execution Key | Determined by priority: the parent procedure execution if the interested party assertion flag is set; in all other cases, an empty string. | _Echoes the parent execution id when this record is an interested-party assertion._ |
| Is Computedly Witnessed | True when all of the following hold: the requirement is blocking flag is set and the requirement has computed witness flag is set. | _TRUE when this record scores a blocking control that has a computed witness behind it._ |
| Computed Witness Execution Key | Determined by priority: the parent procedure execution if the computedly witnessed flag is set; in all other cases, an empty string. | _Echoes the parent execution id when this control was computationally witnessed._ |
| Step Executor Agent | The executed by agent of the requirement satisfaction's step execution. | _The agent who executed the step this satisfaction record scores._ |
| Was Scored After Attestation | True when the number of minutes from the attestation instant for run to the evaluated at is greater than 0. | _TRUE when this control was scored after the run it belongs to had already been attested._ |
| Attestation Instant for Run | The latest attestation instant of the requirement satisfaction's parent procedure execution. | _When the parent execution was attested, if it has been._ |
| Post Attestation Score Execution Key | Determined by priority: the parent procedure execution if the was scored after attestation flag is set; in all other cases, an empty string. | _Echoes the parent execution id when this control was scored after signature._ |
| Semantic Type Iri | A defined attribute. | _Exact PKO class IRI._ |
| **Error** | Reusable error definitions encountered during execution. Maps to pko:Error, errorCode, and errorCause. | — |
| Name | Computed as the error code, followed by “ - ”, followed by the label. | _Human-readable calculated display alias for the Errors row._ |
| Label | A defined attribute. | _Error label._ |
| Error Code | A defined attribute. | _Error code; maps to pko:errorCode._ |
| Error Cause | A defined attribute. | _Known or suspected cause; maps to pko:errorCause._ |
| Semantic Type Iri | A defined attribute. | _Exact PKO class IRI._ |
| **Issue Occurrence** | Concrete issue events during execution. Maps to pko:IssueOccurrence, hasEncounteredError, wasEncounteredBy, issueCause, and issueSolution. | — |
| Name | Computed as the error, followed by “ @ ”, followed by the occurred at. | _Human-readable calculated display alias for the IssueOccurrences row._ |
| Step Execution | A defined attribute. | _Step execution during which the issue occurred._ |
| Error | A defined attribute. | _Error encountered._ |
| Encountered by Agent | A defined attribute. | _Agent that encountered or reported the issue._ |
| Occurred At | A defined attribute. | _Occurrence time._ |
| Issue Cause | A defined attribute. | _Execution-specific cause; maps to pko:issueCause._ |
| Issue Solution | A defined attribute. | _Applied solution; maps to pko:issueSolution._ |
| Status | A defined attribute. | _Open, Monitoring, Resolved, or Closed._ |
| Is Unresolved | True when at least one of the following holds: the status is “Open”; the status is “Investigating”; or the status is “Monitoring”. | _TRUE when this issue occurrence has not been closed out._ |
| Step Execution When Unresolved | Determined by priority: the step execution if the unresolved flag is set; in all other cases, an empty string. | _Echoes the step-execution id when the issue is unresolved, blank otherwise._ |
| Semantic Type Iri | A defined attribute. | _Exact PKO class IRI._ |
| **User Question** | Questions asked by agents during execution. Maps to pko:UserQuestionOccurrence, questionByUser, wasAskedBy, and isQuestionAddressedBy. | — |
| Name | Computed as the first 70 character(s) of the question text. | _Human-readable calculated display alias for the UserQuestions row._ |
| Step Execution | A defined attribute. | _Execution context for the question._ |
| Asked by Agent | A defined attribute. | _Agent asking the question._ |
| Asked At | A defined attribute. | _Question time._ |
| Question Text | A defined attribute. | _Question text; maps to pko:questionByUser._ |
| Resolved by Faq | A defined attribute. | _FAQ used to resolve the question._ |
| Addressed by Resource | A defined attribute. | _Resource that addressed the question._ |
| Status | A defined attribute. | _Open, Answered, Escalated, or Closed._ |
| Semantic Type Iri | A defined attribute. | _Exact PKO class IRI._ |
| **User Feedback** | Feedback supplied by users about a procedure or execution. Maps to pko:UserFeedbackOccurrence, feedbackOnProcedureExecution, and wasProvidedBy. | — |
| Name | Computed as the disposition, followed by “: ”, followed by the first 60 character(s) of the feedback text. | _Human-readable calculated display alias for the UserFeedback row._ |
| Procedure Execution | A defined attribute. | _Execution receiving feedback._ |
| Provided by Agent | A defined attribute. | _Agent providing feedback._ |
| Provided At | A defined attribute. | _Feedback time._ |
| Feedback Text | A defined attribute. | _Feedback statement._ |
| Disposition | A defined attribute. | _Accepted, Rejected, UnderReview, or Deferred._ |
| Change Request Key | A defined attribute. | _Related change request identifier._ |
| Semantic Type Iri | A defined attribute. | _Exact PKO class IRI._ |
| **Stewardship Assignment** | Separates ongoing stewardship from authority to approve semantic commitments. Explicit ERB-PKO governance extension. | — |
| Name | Computed as the procedure version, followed by “ / steward=”, followed by the steward role. | _Human-readable calculated display alias for the StewardshipAssignments row._ |
| Procedure Version | A defined attribute. | _Governed procedure version._ |
| Steward Role | A defined attribute. | _Role responsible for health, review, and maintenance._ |
| Authority Role | A defined attribute. | _Role authorized to approve semantic changes._ |
| Valid From | A defined attribute. | _Start of stewardship interval._ |
| Valid to | A defined attribute. | _End of stewardship interval._ |
| Review Cadence Days | A defined attribute. | _Required review cadence._ |
| Count of Review Events | The number of review events related to the stewardship assignment. | _How many review events have ever been recorded for the procedure version this assignment stewards._ |
| Has Ever Been Reviewed | True when the count of review events is greater than 0. | _TRUE if at least one review event exists for the stewarded procedure version._ |
| Evaluation Context | A defined attribute. | _The evaluation context this row's time-dependent witnesses are judged under._ |
| As of Instant | Taken from the linked evaluation context. | _The evaluation instant this row's time-dependent witnesses are judged against._ |
| Is Current Assignment | True when all of the following hold: the valid from is at most the as of instant and at least one of the following holds: the valid to is blank or the valid to is greater than the as of instant. | _TRUE when this stewardship assignment is in force right now._ |
| Semantic Type Iri | A defined attribute. | _Extension class IRI._ |
| **Change Request** | Governed requests for semantic or operational change, anchored to a procedure version and authority. Explicit ERB-PKO extension. | — |
| Name | The same as its title. | _Human-readable calculated display alias for the ChangeRequests row._ |
| Procedure Version | A defined attribute. | _Procedure version affected._ |
| Title | A defined attribute. | _Change title._ |
| Change Kind | A defined attribute. | _Defect, Enhancement, NewRequirement, DataOperation, or BreakingChange._ |
| Status | A defined attribute. | _Draft, UnderReview, Approved, Rejected, Implemented, or Closed._ |
| Requested by Agent | A defined attribute. | _Agent requesting the change._ |
| Authority Role | A defined attribute. | _Role authorized to approve the change._ |
| Requested At | A defined attribute. | _Request time._ |
| Decided At | A defined attribute. | _Decision time._ |
| Impact Assessment | A defined attribute. | _Expected effect on commitments, data, projections, and tests._ |
| Is Open | True when all of the following hold: at least one of the following holds: the status is “Draft”; the status is “UnderReview”; or the status is “Approved” and the implemented at is blank. | _TRUE while the change request is still outstanding. An Approved request stays open until ImplementedAt records that it actually landed — approval is a decision, not an outcome._ |
| Open Change Version Key | Determined by priority: the procedure version if the open flag is set; in all other cases, an empty string. | _Echoes the ProcedureVersion id only for change requests still open._ |
| Is Decided | True when the decided at has a value. | _TRUE when a decision timestamp has been recorded._ |
| Evaluation Context | A defined attribute. | _The evaluation context this row's time-dependent witnesses are judged under._ |
| As of Instant | Taken from the linked evaluation context. | _The evaluation instant this row's time-dependent witnesses are judged against._ |
| Days Pending | Determined by priority: the number of days from the requested at to the decided at if the decided flag is set; in all other cases, the number of days from the requested at to the as of instant. | _Days from request to decision, or to now if still undecided._ |
| Is Still Pending | True when all of the following hold: the open flag is set and the decided flag is not set. | _TRUE when the request is in an open status and has no decision recorded._ |
| Is Stalled | True when all of the following hold: the still pending flag is set and the days pending is greater than 14. | _TRUE when an undecided change request has been pending more than fourteen days._ |
| Authority Agent | The current agent of the change request's authority role. | _The agent currently holding the authority role that owes a decision on this request._ |
| Requester is Authority | True when the requested by agent is the authority agent. | _TRUE when the agent who raised the request is also the agent who decides it._ |
| Awaits Authority Decision | True when all of the following hold: the status is “UnderReview” and the decided flag is not set. | _TRUE when this request is formally before its authority and no decision has been recorded._ |
| Authority Role Label | Taken from the linked authority role. | _Human-readable label of the role that owes a decision._ |
| Touches Live Version | True when the linked procedure version is live. | _Whether the version this request would alter is currently executable._ |
| Is Live Decision Backlog | True when all of the following hold: the awaits authority decision flag is set and the touches live version flag is set. | _TRUE when a decision I owe is blocking a change to a procedure currently in production._ |
| Blocks an Open Gap | True when all of the following hold: the live decision backlog flag is set and the change kind is “Enhancement”. | _TRUE when an undecided request against a live version is the kind that exists to close a known gap._ |
| Implemented At | A defined attribute. | _When the approved change was actually applied to the procedure version. Null until it lands. Distinct from DecidedAt, which records only that the authority ruled. Approval and implementation are separate events; conflating them is what left IsOpen with no terminal state._ |
| Backlog Version Key | Determined by priority: the procedure version if the live decision backlog flag is set; in all other cases, an empty string. | _Composite-key echo: this request's procedure version when it is live decision backlog, blank otherwise._ |
| Is My Pending Decision | True when all of the following hold: the authority role is “hr-policy-owner” and the awaits authority decision flag is set. | _A change request awaiting a decision that is mine personally to make._ |
| Is My Blocking Backlog | True when all of the following hold: the my pending decision flag is set and the blocks an open gap flag is set. | _A decision waiting on me that is holding an open gap on a live procedure._ |
| Is My Overdue Backlog | True when all of the following hold: the my blocking backlog flag is set and the days pending is greater than 14. | _A blocking decision that has waited on me for more than two weeks._ |
| Is Implemented | True when the implemented at has a value. | _Whether the approved change has actually been applied._ |
| Is My Decided Request | True when all of the following hold: the authority role is “hr-policy-owner” and the decided flag is set. | _A change request I have personally ruled on._ |
| Is My Decided But Unlanded | True when all of the following hold: the my decided request flag is set and the implemented flag is not set. | _A decision I have made that has not yet been applied — still counted against me by the loop-1 open-request measure._ |
| Decision Latency Days | Determined by priority: the number of days from the requested at to the decided at if the decided flag is set; in all other cases, 0. | _How many days I took to rule, once ruled. Zero when undecided — read only alongside IsDecided._ |
| Implementation Latency Days | Determined by priority: the number of days from the decided at to the implemented at if the implemented flag is set; in all other cases, 0. | _How many days elapsed between my ruling and the change actually landing. Zero when not yet implemented._ |
| Delay is Downstream of Me | True when all of the following hold: the my decided but unlanded flag is set and the decision latency days is at most 14. | _A request I decided promptly that is nevertheless still outstanding because nobody has implemented it._ |
| Unlanded Version Key | Determined by priority: the procedure version if the my decided but unlanded flag is set; in all other cases, an empty string. | _Composite-key echo: this request's procedure version when I have decided it but it has not landed, blank otherwise._ |
| Is Approved Not Implemented | True when all of the following hold: the status is “Approved” and the implemented flag is not set. | _A change request the authority approved but that has not yet been applied._ |
| Days Since Approval | Determined by priority: the number of days from the decided at to the as of instant if the decided flag is set; in all other cases, 0. | _How many days have elapsed since the authority decided this request. Zero when undecided._ |
| Is Stalled Implementation | True when all of the following hold: the approved not implemented flag is set and the days since approval is greater than 14. | _An approved change request that has sat unimplemented for more than two weeks._ |
| Stalled Implementation Version Key | Determined by priority: the procedure version if the stalled implementation flag is set; in all other cases, an empty string. | _Composite-key echo: this request's procedure version when its implementation is stalled, blank otherwise._ |
| Approved Version Key | Determined by priority: the procedure version if the approved decision flag is set; in all other cases, an empty string. | _Echoes the target version id when this change request was approved._ |
| Is Approved Decision | True when the status is “Approved”. | _TRUE when this change request was decided in the affirmative._ |
| Semantic Type Iri | A defined attribute. | _Extension class IRI._ |
| **Review Event** | Periodic governance reviews that test competency coverage, staleness, and semantic integrity. Explicit ERB-PKO extension represented as prov:Activity. | — |
| Name | Computed as the procedure version, followed by “ / ”, followed by the review kind. | _Human-readable calculated display alias for the ReviewEvents row._ |
| Procedure Version | A defined attribute. | _Reviewed procedure version._ |
| Review Kind | A defined attribute. | _Review type._ |
| Reviewed At | A defined attribute. | _Review timestamp._ |
| Reviewed by Agent | A defined attribute. | _Reviewing agent._ |
| Outcome | A defined attribute. | _Passed, PassedWithChange, Failed, or Deferred._ |
| Related Change Request | A defined attribute. | _Change request produced or considered._ |
| Next Review Due | A defined attribute. | _Next required review._ |
| Evaluation Context | A defined attribute. | _The evaluation context this row's time-dependent witnesses are judged under._ |
| As of Instant | Taken from the linked evaluation context. | _The evaluation instant this row's time-dependent witnesses are judged against._ |
| Is Overdue | True when the next review due is less than the as of instant. | _TRUE when review is overdue._ |
| Overdue Version Key | Determined by priority: the procedure version if the overdue flag is set; in all other cases, an empty string. | _Echoes the ProcedureVersion id only when this review is past its next-due date._ |
| Promised Cadence Days | The steward review cadence days of the review event's procedure version. | _The review cadence promised for this procedure version, resolved via ProcedureVersions because INDEX/MATCH can only match a target table primary key._ |
| Days Since Reviewed | Computed as the number of days from the reviewed at to the as of instant. | _Elapsed days since this review actually happened._ |
| Exceeds Promised Cadence | True when the days since reviewed is greater than the promised cadence days. | _TRUE when more days have elapsed since this review than the stewardship assignment promised as a cadence._ |
| Cadence Drift Days | Computed as the days since reviewed minus the promised cadence days. | _Signed drift: positive means we are past the promised cadence by this many days; negative means we are still inside it._ |
| Promise and Behavior Disagree | True when all of the following hold: the exceeds promised cadence flag is set and the overdue flag is not set. | _TRUE when the promised cadence has been blown but the hand-entered NextReviewDue still says we are fine._ |
| Cadence Breach Version Key | Determined by priority: the procedure version if the exceeds promised cadence flag is set; in all other cases, an empty string. | _Composite-key echo: this review event's procedure version when the promised cadence has been exceeded, blank otherwise._ |
| Semantic Type Iri | A defined attribute. | _Class IRI used in projection._ |
| **Learning Activity** | Learning, retrospective, tabletop, and onboarding activities that convert execution experience into maintained knowledge. Explicit ERB-PKO extension represented as prov:Activity. | — |
| Name | Computed as the activity kind, followed by “ / ”, followed by the occurred at. | _Human-readable calculated display alias for the LearningActivities row._ |
| Community of Practice | A defined attribute. | _Community hosting the activity._ |
| Procedure Version | A defined attribute. | _Procedure version practiced or reviewed._ |
| Activity Kind | A defined attribute. | _Retrospective, TabletopExercise, Onboarding, Drill, or Apprenticeship._ |
| Occurred At | A defined attribute. | _Activity time._ |
| Facilitator Agent | A defined attribute. | _Facilitator._ |
| Outcome | A defined attribute. | _Knowledge or competence produced._ |
| Evidence Resource | A defined attribute. | _Evidence or material produced._ |
| Semantic Type Iri | A defined attribute. | _Class IRI used in projection._ |
| **Operational Binding** | Live bindings between procedural semantics and operational data/resources. Explicit ERB-PKO extension using DCAT/DCMI/PROV identifiers. | — |
| Name | Computed as the step, followed by “ / ”, followed by the record or schema key. | _Human-readable calculated display alias for the OperationalBindings row._ |
| Procedure Version | A defined attribute. | _Procedure version using the binding._ |
| Step | A defined attribute. | _Step using the binding._ |
| Resource | A defined attribute. | _Bound operational resource._ |
| Access Mode | A defined attribute. | _Read, Write, ReadWrite, Subscribe, or Publish._ |
| Record or Schema Key | A defined attribute. | _Operational record, table, event, or schema key._ |
| Last Observed At | A defined attribute. | _Most recent successful observation._ |
| Freshness Sla Minutes | A defined attribute. | _Maximum allowed data age._ |
| Is Authoritative | True when an empty string. | _TRUE when the binding is authoritative for the represented fact._ |
| Evaluation Context | A defined attribute. | _The evaluation context this row's time-dependent witnesses are judged under._ |
| As of Instant | Taken from the linked evaluation context. | _The evaluation instant this row's time-dependent witnesses are judged against._ |
| Age Minutes | Computed as the number of minutes from the last observed at to the as of instant. | _Current observed age._ |
| Is Fresh | True when the age minutes is at most the freshness sla minutes. | _TRUE when within freshness SLA._ |
| Stale Binding Step Key | Determined by priority: the step if the fresh flag is not set; in all other cases, an empty string. | _Echoes the bound Step id only when the binding is outside its freshness SLA._ |
| Authoritative Stale Step Key | Determined by priority: the step if all of the following hold: the fresh flag is not set and the authoritative flag is set; in all other cases, an empty string. | _Echoes the bound Step id only when an AUTHORITATIVE binding is stale._ |
| Is Stale and Authoritative | True when all of the following hold: the authoritative flag is set and the fresh flag is not set. | _TRUE when an authoritative binding has aged past its freshness SLA._ |
| Step When Stale | Determined by priority: the step if the stale and authoritative flag is set; in all other cases, an empty string. | _Echoes the step id when this authoritative binding is stale, blank otherwise._ |
| Resource is Approved | True when the operational binding's resource is an approved source. | _Whether the resource behind this binding is an approved source._ |
| Is Usable for Drafting | True when all of the following hold: the resource is approved flag is set and the fresh flag is set. | _TRUE when this binding points at an approved source that is still inside its freshness SLA._ |
| Step When Unusable | Determined by priority: an empty string if the usable for drafting flag is set; in all other cases, the step. | _Echoes the step id when this binding is NOT usable for drafting, blank otherwise._ |
| Semantic Type Iri | A defined attribute. | _Extension class IRI._ |
| **Communication Policy** | Channel-specific communication policy projected from the same canonical procedure. Uses ODRL-style policy semantics plus ERB-PKO channel constraints. | — |
| Name | Computed as the channel, followed by “ policy / ”, followed by the procedure version. | _Human-readable calculated display alias for the CommunicationPolicies row._ |
| Procedure Version | A defined attribute. | _Procedure version governing the channel._ |
| Channel | A defined attribute. | _Email, SMS, Push, Postal, or another declared channel._ |
| Audience Rule | A defined attribute. | _Rule that identifies eligible recipients._ |
| Consent Required | True when an empty string. | _Whether active consent is required._ |
| Quiet Hours Start | A defined attribute. | _Recipient-local quiet-hours start._ |
| Quiet Hours End | A defined attribute. | _Recipient-local quiet-hours end._ |
| Max Message Length | A defined attribute. | _Maximum message length for one unit._ |
| Max Segments | A defined attribute. | _Maximum number of channel segments._ |
| Retention Days | A defined attribute. | _Retention period for rendered messages and delivery records._ |
| Approval Role | A defined attribute. | _Role approving the channel policy._ |
| Required Content | A defined attribute. | _Content that every message must include._ |
| Authority Statement | A defined attribute. | _Which artifact is authoritative._ |
| Status | A defined attribute. | _Draft, Active, Suspended, or Retired._ |
| Consent Violation Count | The number of the communication policy's message deliveries that are consent violations. | _Number of consent violations attributable to this channel policy._ |
| Quiet Hours Start Hour | A defined attribute. | _The hour (0-23) at which the quiet window opens. Stored rather than parsed from QuietHoursStart: VALUE(LEFT(...)) does not translate — the transpiler casts the "20:00" string to a timestamp and the view errors. The sending system already knows this number, so modeling it as a parse would dress a broken derivation up as a rule._ |
| Quiet Hours End Hour | A defined attribute. | _Numeric hour 0-23 at which quiet hours end. Seeded 8 for comm-sms-policy, 0 for comm-email-policy._ |
| Quiet Hours Violation Count | The number of message deliveries related to the communication policy. | _Number of transmitted messages that breached this policy's quiet-hours window._ |
| Required Opt Out Phrase | A defined attribute. | _The exact opt-out phrase every message on this channel must contain. Seeded 'Reply STOP' for comm-sms-policy, empty string for comm-email-policy._ |
| Is Active Policy | True when the status is “Active”. | _TRUE only when this channel policy is in Active status._ |
| Semantic Type Iri | A defined attribute. | _ODRL Policy class IRI._ |
| **Message Template** | Approved channel templates projected from the canonical rulebook without becoming a second source of policy meaning. | — |
| Name | Computed as the communication policy, followed by “ / ”, followed by the locale. | _Human-readable calculated display alias for the MessageTemplates row._ |
| Communication Policy | A defined attribute. | _Channel policy governing the template._ |
| Resource | A defined attribute. | _Template resource._ |
| Subject Template | A defined attribute. | _Subject template where supported._ |
| Body Template | A defined attribute. | _Body template._ |
| Locale | A defined attribute. | _Locale or language tag._ |
| Status | A defined attribute. | _Draft, Approved, Retired, or Superseded._ |
| Policy Max Message Length | Taken from the linked communication policy. | _Per-segment character limit inherited from the governing channel policy._ |
| Policy Max Segments | Taken from the linked communication policy. | _Maximum permitted segment count from the governing channel policy._ |
| Body Template Length | Computed as the length of the body template. | _Character length of the raw template body before variable substitution._ |
| Is Template Over Length | True when the body template length is greater than the policy max message length. | _TRUE when the template body alone already exceeds the single-segment limit before any variables are substituted in._ |
| Valid Approval Count | The number of template approvals related to the message template. | _Number of properly-authorized approvals on record for this template._ |
| Has Valid Approval | True when the valid approval count is greater than 0. | _TRUE when at least one properly-authorized approval exists for this template._ |
| Is Claiming Unbacked Approval | True when all of the following hold: the status is “Approved” and the valid approval flag is not set. | _TRUE when a template's Status says Approved but no properly-authorized approval record backs it. The phantom-approval witness._ |
| Current Body Hash | A defined attribute. | _Digest of the template's current body text, maintained whenever the body is edited._ |
| Last Approved Body Hash | Taken from the linked last valid approval. | _Digest of the body text as it stood at the most recent valid approval._ |
| Last Valid Approval | A defined attribute. | _The TemplateApprovals id of the approval this template is currently sendable under. Deliberately a raw identifier, not a relationship: TemplateApprovals already points at MessageTemplates, so declaring an FK back would make the two tables mutually dependent and the rulebook is required to stay acyclic. The value is still resolved by INDEX/MATCH in LastApprovedBodyHash._ |
| Has Body Drifted | True when all of the following hold: the last approved body hash has a value and the current body hash is not the last approved body hash. | _TRUE when the template body no longer matches what was approved._ |
| Is Sendable Under Approval | True when all of the following hold: the status is “Approved” and all of the following hold: the valid approval flag is set and the body drifted flag is not set. | _TRUE only when the template is marked Approved, has a properly-authorized approval, AND its body still matches what was approved._ |
| Drifted Send Count | The number of message deliveries related to the message template. | _How many messages went out from this template while it was not validly sendable._ |
| Unanswered Delivery Count | The number of message deliveries related to the message template. | _How many transmitted messages from this template drew no acknowledgement._ |
| Transmitted Delivery Count | The number of message deliveries related to the message template. | _How many deliveries using this template were actually transmitted._ |
| Template Draws No Response | True when all of the following hold: the transmitted delivery count is greater than 0 and the unanswered delivery count is the transmitted delivery count. | _TRUE when every transmitted message from this template went unacknowledged._ |
| Last Approval At | The decided at of the message template's last valid approval. | _When this template's currently-governing approval was decided._ |
| Semantic Type Iri | A defined attribute. | _Resource class IRI._ |
| **Semantic Mapping** | Machine-readable alignment from ERB table/field paths to exact PKO or reused ontology terms. Extension mappings are never presented as native PKO. | — |
| Name | Computed as the source path, followed by “ -> ”, followed by the target iri. | _Human-readable calculated display alias for the SemanticMappings row._ |
| Source Path | A defined attribute. | _ERB table, field, or discriminator path._ |
| Mapping Kind | A defined attribute. | _class, objectProperty, datatypeProperty, individual, or rule._ |
| Target Iri | A defined attribute. | _Exact target semantic IRI._ |
| Mapping Relation | A defined attribute. | _exact, aligned, subclass, subproperty, or extension._ |
| Ontology Profile | A defined attribute. | _Versioned ontology profile containing the target term._ |
| Notes | A defined attribute. | _Mapping semantics and boundaries._ |
| **Witness Loop** | One row per role-question expansion loop. Each loop poses questions that only became askable because of the previous loop's predicates. | — |
| Name | Computed as “Loop ”, followed by the loop number, followed by “: ”, followed by the title. | _Human-readable calculated display alias for the WitnessLoops row._ |
| Loop Number | A defined attribute. | _Ordinal of this expansion loop. Loop 1 is the founding set of role questions._ |
| Title | A defined attribute. | _Short title for what this loop set out to make askable._ |
| Premise | A defined attribute. | _Why this loop's questions became askable. For loop N>1 this names the loop N-1 predicates that made them possible._ |
| Started At | A defined attribute. | _Time this loop began._ |
| Completed At | A defined attribute. | _Time this loop was committed. Null while in progress._ |
| Question Count | The number of role questions related to the witness loop. | _How many role questions were posed in this loop._ |
| Is Complete | True when the completed at has a value. | _TRUE once the loop has been committed._ |
| Fields After | A defined attribute. | _Total fields in the rulebook after this loop completed._ |
| Derived After | A defined attribute. | _Derived fields after this loop completed._ |
| Witnessed After | A defined attribute. | _Fields invented for a role question after this loop completed._ |
| Semantic Type Iri | A defined attribute. | _Extension class IRI._ |
| **Role Question** | One row per question a named role wants answered. Every invented predicate in this rulebook traces back to one of these. | — |
| Name | Computed as the asking role, followed by “: ”, followed by the first 60 character(s) of the question text. | _Human-readable calculated display alias for the RoleQuestions row._ |
| Asking Role | A defined attribute. | _The role that wants this question answered._ |
| Witness Loop | A defined attribute. | _The expansion loop in which this question was posed._ |
| Question Text | A defined attribute. | _The question in the role's own words._ |
| Why It Matters | A defined attribute. | _What goes wrong in the real world when this question cannot be answered._ |
| Answerable Before | True when an empty string. | _TRUE if the model could already answer this before its loop ran. FALSE means the loop had to invent predicates for it._ |
| Predicate Count | The number of rulebook fields related to the role question. | _How many fields were invented to answer this question._ |
| Is Answered | True when the predicate count is greater than 0. | _TRUE when at least one predicate exists to answer this question._ |
| Witnessed Answer | A defined attribute. | _The current reading of this question's predicates, extracted from the substrate after the loop ran: which witness columns fire, on how many rows out of how many. Written by tools/extract_computed_answers.py from values Postgres computed — never recomputed in Python. This is what lets a later loop plan against materialized answers instead of imagined ones._ |
| Semantic Type Iri | A defined attribute. | _Extension class IRI._ |
| **Rulebook Field** | A complete census of every field in this rulebook. Reconciled from the real schemas by tools/reconcile_field_catalog.py — never hand-maintained. Fields invented by a witness loop carry an InventedForQuestion FK. | — |
| Name | Computed as the target table, followed by a period, followed by the field name. | _Human-readable calculated display alias for the RulebookFields row._ |
| Target Table | A defined attribute. | _The table this field lives on._ |
| Field Name | A defined attribute. | _The field's name within its table._ |
| Field Type | A defined attribute. | _raw, calculated, lookup, relationship, or aggregation._ |
| Datatype | A defined attribute. | _The field's declared datatype._ |
| Formula | A defined attribute. | _The field's formula when it is derived. Null for raw and relationship fields._ |
| Invented for Question | A defined attribute. | _The role question that motivated this field's existence. Null for fields that predate the witness-loop exercise._ |
| Is Derived | True when at least one of the following holds: the field type is “calculated”; the field type is “lookup”; or the field type is “aggregation”. | _TRUE when this field is computed rather than stored._ |
| Is Witness | True when the invented for question has a value. | _TRUE when this field exists because a role asked a question. These are the fields the witness loops added._ |
| Semantic Type Iri | A defined attribute. | _Extension class IRI._ |
| **Test Suite** | Groups of conformance checks. Rollups here are computed from TestCases, so the board's headline is itself a derived field. | — |
| Name | The same as its label. | _Human-readable calculated display alias for the TestSuites row._ |
| Label | A defined attribute. | _Display name for this suite._ |
| Test Count | The number of test cases related to the test suite. | _How many checks belong to this suite._ |
| Pass Count | The number of test cases related to the test suite. | _How many checks passed on the last run._ |
| Blocking Fail Count | The number of test cases related to the test suite. | _How many blocking checks failed. This is the number that must be zero for the board to be green._ |
| Is Green | True when the blocking fail count is 0. | _TRUE when no blocking check is failing. Advisory warnings do not break the board._ |
| Semantic Type Iri | A defined attribute. | _Extension class IRI._ |
| **Test Cas** | The conformance suite, as data. One row per check, naming what it checks and — where applicable — the role question whose answer it defends. tools/run_test_suite.py executes these rows and writes the outcome back; it invents no checks of its own. | — |
| Name | Computed as the test kind, followed by “: ”, followed by the subject. | _Human-readable calculated display alias for the TestCases row._ |
| Test Kind | A defined attribute. | _What class of check this is. One of: structural (the rulebook's own shape), formula-translates (the transpiler emitted a real function, not a NULL stub), view-loads (the view exists and is queryable), fk-resolves (every FK value names a real row), witness-discriminates (a boolean witness can distinguish cases in this data), witness-fires (a specific witness reads TRUE on at least one row), provenance (every invented field traces to a question), catalog-sync (RulebookFields matches the real schemas), question-answered (a role question has at least one predicate answering it), invariant (a domain rule that must hold), remediation (a seeded violation was resolved in model rather than deleted)._ |
| Subject | A defined attribute. | _What is under test — a Table.Field, a table, a view, or a question id._ |
| Target Table | A defined attribute. | _The table this check reads, when it reads one._ |
| Target Field | A defined attribute. | _The field this check reads, when it reads one._ |
| Assertion | A defined attribute. | _What must be true, stated so a human can judge the verdict without reading code._ |
| Defends Question | A defined attribute. | _The role question whose answer this check protects. Null for checks that defend the model's structure rather than a specific question._ |
| Suite | A defined attribute. | _The suite this check belongs to._ |
| Severity | A defined attribute. | _blocking — a failure means the model is stating something false; advisory — a failure means the model cannot state something it should be able to. Vacuity is advisory by design: a witness that cannot fire on this seed is not necessarily wrong, and forcing it red would create pressure to fabricate data._ |
| Is Blocking | True when the severity is “blocking”. | _TRUE when a failure of this check means the model is asserting something false._ |
| Last Outcome | A defined attribute. | _PASS, WARN, FAIL, or SKIP from the most recent run. Written by tools/run_test_suite.py from the substrate — never hand-edited._ |
| Last Detail | A defined attribute. | _The observed reading behind LastOutcome, e.g. a fire count or the error text._ |
| Last Run At | A defined attribute. | _When this check last ran._ |
| Is Passing | True when the last outcome is “PASS”. | _TRUE when the last run passed outright._ |
| Is Failing | True when the last outcome is “FAIL”. | _TRUE when the last run failed. A blocking failure means the model is asserting something false._ |
| Needs Attention | True when all of the following hold: the failing flag is set and the blocking flag is set. | _TRUE when this check failed and its failure means the model is wrong. This is the number that must be zero._ |
| Passing Suite Key | Determined by priority: the suite if the passing flag is set; in all other cases, an empty string. | _Echoes the suite id only for checks that passed; empty otherwise. Single-criterion COUNTIFS key._ |
| Needs Attention Suite Key | Determined by priority: the suite if the needs attention flag is set; in all other cases, an empty string. | _Echoes the suite id only for blocking checks that failed; empty otherwise. Single-criterion COUNTIFS key._ |
| Semantic Type Iri | A defined attribute. | _Extension class IRI._ |
| **ERB Version** | Standard ERB semantic version history. | — |
| Base ID | A defined attribute. | _Source base identifier._ |
| Name | A defined attribute. | _Version label._ |
| Message | A defined attribute. | _Version message._ |
| Notes | A defined attribute. | _Version notes._ |
| Commit Date | A defined attribute. | _Commit timestamp._ |
| Is Published | True when an empty string. | _Publication flag._ |
| **ERB Customization** | Explicit customization seams; empty because the canonical model is expressed in the rulebook. | — |
| Name | A defined attribute. | _Customization file name._ |
| Title | A defined attribute. | _Customization title._ |
| SQL Code | A defined attribute. | _Customization SQL._ |
| SQL Target | A defined attribute. | _Target substrate._ |
| Customization Type | A defined attribute. | _Customization category._ |
| **Exception Invocation** | ExceptionInvocations (added by witness loop 1). | — |
| Name | Computed as the step execution, followed by “ / ”, followed by the exception. | _Human-readable calculated display alias._ |
| Step Execution | A defined attribute. | _The execution during which the exception was invoked._ |
| Exception | A defined attribute. | _The specified exception that was invoked._ |
| Invoked by Agent | A defined attribute. | _Agent who invoked the exception._ |
| Approved by Agent | A defined attribute. | _Agent who approved the invocation. Must satisfy the exception's ApprovalRole._ |
| Invoked At | A defined attribute. | _When the exception was invoked._ |
| Handling Applied | A defined attribute. | _What was actually done, in the invoker's words._ |
| Expected Handling | Taken from the linked exception. | _The handling the specification prescribes._ |
| Required Approval Role | Taken from the linked exception. | _The role the specification requires to approve this exception._ |
| Required Approval Role Holder | The current agent of the exception invocation's required approval role. | _The agent who currently holds the role that must approve this exception._ |
| Approval Role Matches | True when the approved by agent is the required approval role holder. | _TRUE when the agent who approved is the holder of the role the exception requires._ |
| Is Approved | True when the approved by agent has a value. | _TRUE when an approver was recorded at all._ |
| Is Improperly Approved | True when at least one of the following holds: the approved flag is not set or the approval role matches flag is not set. | _TRUE when an exception was invoked without an approver, or approved by an agent who does not hold the required role._ |
| Invoker Agent Kind | Taken from the linked invoked by agent. | _What kind of agent invoked the exception._ |
| Invoker Also Prepared Key | Computed as the parent procedure execution, followed by “|”, followed by the approved by agent. | _Composite execution+approver key, in the same key space as StepExecutions.PreparerAgentKey._ |
| Parent Procedure Execution | Taken from the linked step execution. | _The procedure execution this invocation belongs to._ |
| Approver Prepared Count | The number of step executions related to the exception invocation. | _How many preparation steps in the same execution were run by the agent who approved this exception._ |
| Delegated to Preparer | True when the approver prepared count is greater than 0. | _TRUE when an exception routed approval authority to an agent who prepared work in the same execution._ |
| Is Ungoverned Invocation | True when at least one of the following holds: the improperly approved flag is set or the delegated to preparer flag is set. | _TRUE when an exception was invoked without proper role authority, or routed authority to the preparer._ |
| Semantic Type Iri | A defined attribute. | _Extension IRI — PKO does not define exception invocation._ |
| **Verification Outcome** | VerificationOutcomes (added by witness loop 1). | — |
| Name | Computed as the step execution, followed by “ / ”, followed by the step verification. | _Human-readable calculated display alias._ |
| Step Execution | A defined attribute. | _The execution during which the verification was performed._ |
| Step Verification | A defined attribute. | _The declared verification being performed._ |
| Observed Signal Value | A defined attribute. | _The value the signal actually read at verification time._ |
| Observed by Agent | A defined attribute. | _Agent who observed the signal._ |
| Observed At | A defined attribute. | _When the signal was observed._ |
| Evidence Uri | A defined attribute. | _Pointer to the retained artifact backing the observation._ |
| Expected Signal Value | Taken from the linked step verification. | _The value the specification expects._ |
| Signal Identifier | Taken from the linked step verification. | _Which signal this outcome concerns._ |
| Signal Matches Expected | True when the observed signal value is the expected signal value. | _TRUE when the observed value equals the expected value._ |
| Has Evidence | True when the evidence uri has a value. | _TRUE when a retained artifact backs this observation._ |
| Is Unbacked Observation | True when all of the following hold: the signal matches expected flag is set and the evidence flag is not set. | _TRUE when a verification was recorded as matching but no evidence artifact was retained._ |
| Is Self Witnessed | True when the observed by agent is the step executor agent. | _TRUE when the agent who observed the verification signal is the same agent who executed the step being verified._ |
| Step Executor Agent | The executed by agent of the verification outcome's step execution. | _The agent who executed the step this verification outcome concerns._ |
| Self Witnessed Step Key | Determined by priority: the step execution if the self witnessed flag is set; in all other cases, an empty string. | _Echoes the StepExecution id only for self-witnessed verifications._ |
| Unbacked Step Key | Determined by priority: the step execution if the unbacked observation flag is set; in all other cases, an empty string. | _Echoes the StepExecution id when a verification matched but retained no evidence._ |
| Is Self Witnessed and Unbacked | True when all of the following hold: the self witnessed flag is set and the evidence flag is not set. | _TRUE when the executor observed their own passing signal and attached no evidence._ |
| Is Uncorroborated Pass | True when all of the following hold: the signal matches expected flag is set and the self witnessed and unbacked flag is set. | _TRUE when a PASSING signal was self-observed with no evidence behind it._ |
| Uncorroborated Pass Step Key | Determined by priority: the step execution if the uncorroborated pass flag is set; in all other cases, an empty string. | _Echoes the step execution id when this outcome is an uncorroborated pass._ |
| Observer is Non Human | True when the linked observed by agent is a non human. | _Whether the agent who recorded this observation is non-human. Agents has no PrimaryRole column and an FK from Agents back to Roles would create a table cycle, so the independence question is answered by agent kind rather than by role._ |
| Observer is Independent of Executor | True when the self witnessed flag is not set. | _TRUE when someone other than the step's executor recorded the observation._ |
| Is Independent Human Observation | True when all of the following hold: the observer is non human flag is not set; the self witnessed flag is not set; and the evidence flag is set. | _TRUE when a human other than the step's executor observed this signal and attached evidence._ |
| Independent Observation Execution Key | Determined by priority: the parent procedure execution of outcome if the independent human observation flag is set; in all other cases, an empty string. | _Echoes the parent execution id when this is an independent human observation._ |
| Parent Procedure Execution of Outcome | Taken from the linked step execution. | _The procedure execution this verification outcome belongs to._ |
| Semantic Type Iri | A defined attribute. | _Extension IRI — PKO 2.0.0 has no execution-side verification outcome class._ |
| **Observed Transition** | The proxy above cannot tell a walked fallback from a happy-path step that happens to share an endpoint. PKO models Transition as a first-class thing; its execution counterpart is missing. Without a table that records WHICH transition a step execution arrived by, 'has this fallback ever been walked' is permanently unanswerable rather than merely unanswered. This is an extension (urn:effortless:pko-extension#ObservedTransition), not a native PKO term. | — |
| Name | Computed as the step transition, followed by “ @ ”, followed by the observed at. | _Human-readable calculated display alias._ |
| Procedure Execution | A defined attribute. | _The procedure execution during which this transition was traversed._ |
| Step Transition | A defined attribute. | _The specification-level transition that was actually taken._ |
| Arriving Step Execution | A defined attribute. | _The step execution that this traversal produced._ |
| Observed At | A defined attribute. | _When the traversal occurred._ |
| Trigger Reason | A defined attribute. | _Why this path rather than the default was taken._ |
| Semantic Type Iri | A defined attribute. | _Extension class IRI._ |
| **Recipient** | Recipients (added by witness loop 1). | — |
| Name | The same as its display name. | _Human-readable calculated display alias for the Recipients row._ |
| Display Name | A defined attribute. | _Employee display name as carried in the consent registry._ |
| Organization | A defined attribute. | _Organization the recipient belongs to._ |
| Email Address | A defined attribute. | _Corporate email address; empty string when the recipient has no valid corporate email._ |
| Mobile Number | A defined attribute. | _Mobile number in E.164 form; empty string when no mobile number is on file._ |
| Sms Consent Status | A defined attribute. | _Consent state as observed in the consent registry: Granted, Revoked, or NeverGiven._ |
| Sms Consent At | A defined attribute. | _Timestamp at which the current SMS consent state took effect._ |
| Consent Binding | A defined attribute. | _Operational binding through which this consent state was observed._ |
| Has Sms Consent | True when the sms consent status is “Granted”. | _TRUE only when the recipient's SMS consent state is Granted._ |
| Is Email Reachable | True when the email address has a value. | _TRUE when a corporate email address is on file for this recipient._ |
| Is Sms Reachable | True when the mobile number has a value. | _TRUE when a mobile number is on file for this recipient._ |
| Is Unreachable | True when all of the following hold: the email reachable flag is not set and the sms reachable flag is not set. | _TRUE when the recipient has neither an email address nor a mobile number -- the exc-unreachable trigger condition._ |
| Is Communicationally Stranded | True when all of the following hold: the sms reachable flag is not set and the email reachable flag is not set. | _TRUE when every channel we hold for this person is either non-consenting or unreachable, so no lawful route exists at all._ |
| Semantic Type Iri | A defined attribute. | _Extension IRI; recipients are not a PKO 2.0.0 native class._ |
| **Message Delivery** | MessageDeliveries (added by witness loop 1). | — |
| Name | Computed as the recipient, followed by “ / ”, followed by the message template, followed by “ / ”, followed by the sent at. | _Human-readable calculated display alias for the MessageDeliveries row._ |
| Procedure Execution | A defined attribute. | _The procedure execution this send was performed under._ |
| Step Execution | A defined attribute. | _The step execution that performed the send._ |
| Recipient | A defined attribute. | _Who the message was sent to._ |
| Message Template | A defined attribute. | _Template that was rendered for this send._ |
| Sent by Agent | A defined attribute. | _Agent that performed the send._ |
| Rendered Body | A defined attribute. | _The exact body text that was transmitted, after variable substitution._ |
| Sent At | A defined attribute. | _Transmission timestamp._ |
| Sent At Local Hour | A defined attribute. | _Hour of day 0-23 in the RECIPIENT's local timezone at transmission. Stored raw because recipient-local time is what the quiet-hours rule is written against and it is not derivable from SentAt alone._ |
| Delivery Status | A defined attribute. | _Sent, Delivered, Failed, Suppressed, or Bounced._ |
| Suppression Reason | A defined attribute. | _When DeliveryStatus is Suppressed, why; empty string otherwise._ |
| Invoked Exception | A defined attribute. | _Documented exception invoked for this delivery, when one was._ |
| Acknowledged At | A defined attribute. | _When the recipient acknowledged; null when not acknowledged._ |
| Policy Channel | The communication policy of the message delivery's message template. | _The communication policy governing the template that was sent._ |
| Channel Name | Taken from the linked policy channel. | _Channel (Email, SMS) of the policy this delivery went out under._ |
| Policy Requires Consent | True when the message delivery's policy channel is consent required. | _Whether the governing policy requires active consent for this channel._ |
| Recipient Has Sms Consent | True when the linked recipient has a sms consent. | _Whether the recipient of this delivery had SMS consent on file._ |
| Was Actually Transmitted | True when at least one of the following holds: the delivery status is “Sent” or at least one of the following holds: the delivery status is “Delivered” or the delivery status is “Bounced”. | _TRUE when the message actually left our systems. Suppressed and Failed messages never reached the carrier._ |
| Is Consent Violation | True when all of the following hold: the was actually transmitted flag is set and all of the following hold: the policy requires consent flag is set and the recipient has sms consent flag is not set. | _TRUE when a message was actually transmitted on a consent-required channel to a recipient without consent. This is the TCPA witness._ |
| Consent Violation Policy Key | Determined by priority: the policy channel if the consent violation flag is set; in all other cases, an empty string. | _Carries the policy id only on rows that are consent violations; empty string otherwise._ |
| Policy Quiet Hours Start Hour | Taken from the linked policy channel. | _Quiet-hours start hour (0-23) from the governing policy._ |
| Policy Quiet Hours End Hour | Taken from the linked policy channel. | _Quiet-hours end hour (0-23) from the governing policy._ |
| Policy Has Quiet Hours | True when the policy quiet hours start hour is not the policy quiet hours end hour. | _TRUE when the governing policy actually declares a quiet-hours window. comm-email-policy has 00:00-00:00, meaning no window._ |
| Quiet Window Wraps Midnight | True when the policy quiet hours start hour is greater than the policy quiet hours end hour. | _TRUE when the quiet window crosses midnight (20:00 -> 08:00 does)._ |
| Is Inside Quiet Window | True when the OR of the sent at local hour is at least the policy quiet hours start hour and the sent at local hour is less than the policy quiet hours end hour if the quiet window wraps midnight flag is set, in all other cases the AND of the sent at local hour is at least the policy quiet hours start hour and the sent at local hour is less than the policy quiet hours end hour. | _TRUE when the recipient-local send hour falls inside the declared quiet window, handling the midnight wrap correctly._ |
| Is Quiet Hours Violation | True when all of the following hold: the was actually transmitted flag is set and all of the following hold: the policy has quiet hours flag is set and the inside quiet window flag is set. | _TRUE when a message was actually transmitted inside a declared quiet-hours window. The quiet-hours witness._ |
| Quiet Hours Violation Policy Key | Determined by priority: the policy channel if the quiet hours violation flag is set; in all other cases, an empty string. | _Carries the policy id only on quiet-hours violations; empty string otherwise._ |
| Recipient is Unreachable | True when the linked recipient is unreachable. | _Whether the recipient has neither email nor mobile on file -- the exc-unreachable trigger._ |
| Is Acknowledged | True when the acknowledged at has a value. | _TRUE when an acknowledgement timestamp is recorded for this delivery._ |
| Invoked Exception Condition | Taken from the linked invoked exception. | _The documented condition of the exception invoked on this delivery, if any._ |
| Has Unreachable Exception Invoked | True when the invoked exception is “exc-unreachable”. | _TRUE when the documented unreachable-recipient exception was formally invoked on this delivery._ |
| Is Fabricated Acknowledgement | True when all of the following hold: the recipient is unreachable flag is set and the acknowledged flag is set. | _TRUE when an acknowledgement is recorded for a recipient we could not reach. This is the misrepresentation witness._ |
| Is Unhandled Unreachable | True when all of the following hold: the recipient is unreachable flag is set and the unreachable exception invoked flag is not set. | _TRUE when a recipient was unreachable but no documented exception was invoked -- the case fell on the floor silently._ |
| Unreachable Failure Key | Determined by priority: the procedure execution if at least one of the following holds: the fabricated acknowledgement flag is set or the unhandled unreachable flag is set; in all other cases, an empty string. | _Carries the execution id on any unreachable-handling failure; empty string otherwise._ |
| Policy Retention Days | Taken from the linked policy channel. | _Retention commitment in days inherited from the governing channel policy._ |
| Evaluation Context | A defined attribute. | _The evaluation context this row's time-dependent witnesses are judged under._ |
| As of Instant | Taken from the linked evaluation context. | _The evaluation instant this row's time-dependent witnesses are judged against._ |
| Age Days | Computed as the number of days from the sent at to the as of instant. | _Days elapsed since transmission._ |
| Is Within Retention Window | True when the age days is at most the policy retention days. | _TRUE while this delivery is still inside its committed retention period._ |
| Has Rendered Body | True when the rendered body has a value. | _TRUE when the exact transmitted text is still held on this record._ |
| Is Evidence Required | True when all of the following hold: the was actually transmitted flag is set and the within retention window flag is set. | _TRUE when we are still obliged to hold this message's text._ |
| Is Retention Breach | True when all of the following hold: the evidence required flag is set and the rendered body flag is not set. | _TRUE when we are obliged to hold the message text and do not. The evidentiary-gap witness._ |
| Retention Breach Execution Key | Determined by priority: the procedure execution if the retention breach flag is set; in all other cases, an empty string. | _Carries the execution id on retention breaches; empty string otherwise._ |
| Sending Step Execution Step | Taken from the linked step execution. | _Which procedure step this delivery was performed under._ |
| Execution Has Cleared Legal Review | True when the linked procedure execution has a cleared legal review. | _Whether legal review had passed for the execution this delivery belongs to._ |
| Is Unreviewed Send | True when all of the following hold: the was actually transmitted flag is set and the execution has cleared legal review flag is not set. | _TRUE when a message was transmitted under an execution whose legal review had not passed. The ungated-send witness._ |
| Rendered Body Length | Computed as the length of the rendered body. | _Character length of the exact text that was actually transmitted._ |
| Policy Max Message Length At Send | Taken from the linked policy channel. | _The per-segment limit that governed this specific send._ |
| Segment Count | Determined by priority: 0 if the rendered body length is 0; 1 if the rendered body length is at most the policy max message length at send; in all other cases, the rendered body length divided by the policy max message length at send rounded up to 0 decimal place(s). | _How many channel segments the transmitted text occupied._ |
| Policy Max Segments At Send | Taken from the linked policy channel. | _The segment ceiling that governed this specific send._ |
| Is Over Segment Limit | True when all of the following hold: the was actually transmitted flag is set and the segment count is greater than the policy max segments at send. | _TRUE when a transmitted message split into more segments than the policy permits. The oversize witness._ |
| Template Has Valid Approval | True when the linked message template has a valid approval. | _Whether the template used for this delivery had a properly-authorized approval._ |
| Is Unapproved Send | True when all of the following hold: the was actually transmitted flag is set and the template has valid approval flag is not set. | _TRUE when a message was transmitted using a template with no valid approval behind it._ |
| Policy Required Opt Out Phrase | Taken from the linked policy channel. | _The opt-out phrase required for this delivery's channel._ |
| Policy Requires Opt Out | True when the policy required opt out phrase has a value. | _TRUE when the governing channel policy declares a required opt-out phrase at all._ |
| Opt Out Phrase Position | Computed as the position of the policy required opt out phrase within the rendered body. | _Character position at which the required opt-out phrase appears in the transmitted text; 0 when absent._ |
| Has Opt Out Phrase | True when the opt out phrase position is greater than 0. | _TRUE when the required opt-out phrase appears anywhere in the transmitted text._ |
| Is Opt Out in First Segment | True when all of the following hold: the opt out phrase flag is set and the opt out phrase position is at most the policy max message length at send. | _TRUE when the opt-out phrase falls inside the first segment, where it is guaranteed to be read._ |
| Is Missing Required Opt Out | True when all of the following hold: the was actually transmitted flag is set and all of the following hold: the policy requires opt out flag is set and the opt out phrase flag is not set. | _TRUE when a transmitted message on an opt-out-required channel did not contain the phrase at all. The hard witness._ |
| Is Opt Out At Risk of Truncation | True when all of the following hold: the was actually transmitted flag is set and all of the following hold: the policy requires opt out flag is set and all of the following hold: the opt out phrase flag is set and the opt out in first segment flag is not set. | _TRUE when the opt-out phrase is present but sits beyond the first segment, where carrier truncation or out-of-order delivery can hide it. The soft witness._ |
| Is Failed Delivery | True when at least one of the following holds: the delivery status is “Failed” or the delivery status is “Bounced”. | _TRUE when the message left our systems but did not land._ |
| Is Suppressed | True when the delivery status is “Suppressed”. | _TRUE when we deliberately chose not to transmit._ |
| Is Triaged | True when the invoked exception has a value. | _TRUE when some documented exception was formally invoked on this delivery -- i.e. a human or a rule picked it up._ |
| Is Abandoned Failure | True when all of the following hold: the failed delivery flag is set and the triaged flag is not set. | _TRUE when a delivery failed and no documented exception was invoked. The abandoned-bounce witness._ |
| Abandoned Failure Execution Key | Determined by priority: the procedure execution if the abandoned failure flag is set; in all other cases, an empty string. | _Carries the execution id on abandoned failures; empty string otherwise._ |
| Reached Execution Key | Determined by priority: the procedure execution if the delivery status is “Delivered”; in all other cases, an empty string. | _Carries the execution id on confirmed-delivered messages; empty string otherwise._ |
| Template Was Sendable | True when the message delivery's message template is a sendable under approval. | _Whether the template used for this delivery was fully sendable under a current, matching approval._ |
| Is Drifted Send | True when all of the following hold: the was actually transmitted flag is set and the template was sendable flag is not set. | _TRUE when a message was transmitted from a template that was not validly sendable at the time. The drift witness._ |
| Drifted Send Template Key | Determined by priority: the message template if the drifted send flag is set; in all other cases, an empty string. | _Carries the template id on drifted sends; empty string otherwise._ |
| Was Sent Outside Business Hours | True when at least one of the following holds: the sent at local hour is less than 8 or the sent at local hour is greater than 18. | _TRUE when this message landed before 08:00 or after 18:00 in the recipient's local time._ |
| Was Delivered and Unanswered | True when all of the following hold: the was actually transmitted flag is set and the acknowledged flag is not set. | _TRUE when a message actually reached someone and no acknowledgement came back._ |
| Is Poorly Timed Unanswered | True when all of the following hold: the was delivered and unanswered flag is set and the was sent outside business hours flag is set. | _TRUE when an unanswered message was delivered outside business hours -- a timing hypothesis for the silence._ |
| Is Well Timed Unanswered | True when all of the following hold: the was delivered and unanswered flag is set and the was sent outside business hours flag is not set. | _TRUE when a message was delivered at a reasonable hour and still drew no response._ |
| Unanswered Template Key | Determined by priority: the message template if the was delivered and unanswered flag is set; in all other cases, an empty string. | _The template id when this delivery went unanswered, otherwise empty string._ |
| Transmitted Template Key | Determined by priority: the message template if the was actually transmitted flag is set; in all other cases, an empty string. | _The template id when this delivery actually reached someone._ |
| Approving Agent At Send | A defined attribute. | _The agent whose approval authorized this specific transmission, frozen at send time._ |
| Approving Role At Send | A defined attribute. | _The role that agent held when they approved, frozen at send time._ |
| Approval Decided At Send | A defined attribute. | _When the relied-upon approval was granted, frozen at send time._ |
| Approval Preceded Send | True when all of the following hold: the approval decided at send has a value and the sent at is greater than the approval decided at send. | _TRUE when the approval we relied on was granted before the message went out._ |
| Has Frozen Approval Evidence | True when all of the following hold: the approving agent at send has a value and the approval decided at send has a value. | _TRUE when this delivery carries a complete frozen record of who authorized it and when._ |
| Provenance is Live Derived | True when the frozen approval evidence flag is not set. | _TRUE when we have no frozen evidence and the only available answer comes from recomputing against today's template state._ |
| Current Last Approval At | Taken from the linked message template. | _The template's most recent approval time as it stands NOW, for comparison against what was approved at send._ |
| Template Reapproved Since Send | True when all of the following hold: the current last approval at has a value and the current last approval at is greater than the sent at. | _TRUE when the template has picked up a newer approval since this message was transmitted._ |
| Is Unprovable Approval Claim | True when all of the following hold: the provenance is live derived flag is set and all of the following hold: the template reapproved since send flag is set and the template has valid approval flag is set. | _TRUE when we assert this send was approved, hold no frozen evidence, and the template has been re-approved since. The claim cannot be substantiated from the record._ |
| Reminder Sent At | A defined attribute. | _When I sent a follow-up reminder about this unacknowledged message. Empty when I never did._ |
| Reminder Count | A defined attribute. | _How many reminders I have sent for this delivery._ |
| Has Sent Reminder | True when the reminder count is greater than 0. | _TRUE when at least one reminder went out for this delivery._ |
| Acknowledgement is Outstanding | True when all of the following hold: the was actually transmitted flag is set and all of the following hold: the evidence required flag is set and the acknowledged flag is not set. | _TRUE when a message actually reached someone, carried an acknowledgement obligation, and has not been acknowledged._ |
| Outstanding Age Days | Determined by priority: the number of days from the sent at to the as of instant if the acknowledgement is outstanding flag is set; in all other cases, 0. | _How long this acknowledgement has been outstanding._ |
| Is Unchased Acknowledgement | True when all of the following hold: the acknowledgement is outstanding flag is set and all of the following hold: the outstanding age days is greater than 7 and the sent reminder flag is not set. | _TRUE when an acknowledgement has been outstanding for more than 7 days and I have never sent a reminder._ |
| Is Exhausted Follow Up | True when all of the following hold: the acknowledgement is outstanding flag is set and the reminder count is at least 3. | _TRUE when I have sent three or more reminders and still have no acknowledgement -- the point at which this stops being my work and becomes a human escalation._ |
| Needs Human Escalation | True when all of the following hold: the exhausted follow up flag is set and the unreachable exception invoked flag is not set. | _TRUE when follow-up is exhausted and no exception has been invoked to close out the obligation._ |
| Semantic Type Iri | A defined attribute. | _Extension IRI; per-recipient delivery events are not a PKO 2.0.0 native class._ |
| **Template Approval** | TemplateApprovals (added by witness loop 1). | — |
| Name | Computed as the message template, followed by “ / ”, followed by the decision, followed by “ / ”, followed by the decided at. | _Human-readable calculated display alias for the TemplateApprovals row._ |
| Message Template | A defined attribute. | _Template this decision applies to._ |
| Decided by Agent | A defined attribute. | _Agent who made the approval decision._ |
| Decided in Role | A defined attribute. | _Role the agent was acting in when deciding._ |
| Decision | A defined attribute. | _Approved, Rejected, or Withdrawn._ |
| Decided At | A defined attribute. | _When the decision was recorded._ |
| Approved Body Hash | A defined attribute. | _Digest of the exact template body that was approved, so later edits are detectable._ |
| Notes | A defined attribute. | _Approver's rationale or conditions._ |
| Is Approval Decision | True when the decision is “Approved”. | _TRUE when this decision row is an approval rather than a rejection or withdrawal._ |
| Template Policy | The communication policy of the template approval's message template. | _The communication policy governing the template being approved._ |
| Required Approval Role | Taken from the linked template policy. | _The role the governing policy designates as approver -- communications-manager for both current policies._ |
| Is Decided by Required Role | True when the decided in role is the required approval role. | _TRUE when the approving role matches the role the policy designates._ |
| Valid Approval Template Key | Determined by priority: the message template if all of the following hold: the approval decision flag is set and the decided by required role flag is set; in all other cases, an empty string. | _Carries the template id only on approvals made by the correct role; empty string otherwise._ |
| Semantic Type Iri | A defined attribute. | _Extension IRI; template approval events are not a PKO 2.0.0 native class._ |
| **Send Intent** | SendIntents (added by witness loop 1). | — |
| Name | Computed as the recipient, followed by “ / ”, followed by the message template, followed by “ / intent”. | _Human-readable calculated display alias for the SendIntents row._ |
| Procedure Execution | A defined attribute. | _Execution this send intent belongs to._ |
| Step Execution | A defined attribute. | _Step execution evaluating this intent._ |
| Recipient | A defined attribute. | _Intended recipient._ |
| Message Template | A defined attribute. | _Template the pipeline intends to render and send._ |
| Proposed Body | A defined attribute. | _The fully rendered text the pipeline intends to transmit, before transmission._ |
| Proposed Send At Local Hour | A defined attribute. | _Hour 0-23 in the recipient's local timezone at which the pipeline intends to transmit._ |
| Evaluated At | A defined attribute. | _When the pipeline evaluated the gates for this intent._ |
| Resulting Delivery | A defined attribute. | _The delivery record produced from this intent, whether transmitted or suppressed._ |
| Intent Policy | The communication policy of the send intent's message template. | _The communication policy governing the template this intent would send._ |
| Intent Channel | Taken from the linked intent policy. | _Channel this intent would transmit on._ |
| Policy is Active | True when the send intent's intent policy is an active policy. | _Whether the governing policy is currently Active rather than Draft, Suspended, or Retired._ |
| Intent Requires Consent | True when the send intent's intent policy is consent required. | _Whether the governing policy requires consent for this channel._ |
| Recipient Has Channel Consent | True when the send intent's recipient has a sms consent. | _Whether the intended recipient has active SMS consent on record._ |
| Consent Gate Passed | True when at least one of the following holds: the intent requires consent flag is not set or the recipient has channel consent flag is set. | _TRUE when either the channel does not require consent, or the recipient has granted it._ |
| Recipient is Sms Reachable | True when the linked recipient is sms reachable. | _Whether a mobile number is on file for the intended recipient._ |
| Recipient is Email Reachable | True when the linked recipient is email reachable. | _Whether an email address is on file for the intended recipient._ |
| Reachability Gate Passed | True when the recipient is sms reachable if the intent channel is “SMS”, in all other cases the recipient is email reachable. | _TRUE when the recipient is reachable on the channel this intent would use._ |
| Permission Gate Passed | True when all of the following hold: the policy is active flag is set and all of the following hold: the consent gate passed flag is set and the reachability gate passed flag is set. | _TRUE when the policy is active, consent is satisfied, and the recipient is reachable on this channel. The channel-permission gate._ |
| Intent Quiet Start Hour | The quiet hours start hour of the send intent's intent policy. | _Quiet-hours start hour from the governing policy._ |
| Intent Quiet End Hour | The quiet hours end hour of the send intent's intent policy. | _Quiet-hours end hour from the governing policy._ |
| Intent Policy Has Quiet Hours | True when the intent quiet start hour is not the intent quiet end hour. | _TRUE when the governing policy declares a real quiet-hours window._ |
| Intent Quiet Window Wraps | True when the intent quiet start hour is greater than the intent quiet end hour. | _TRUE when the quiet window crosses midnight._ |
| Intent is Inside Quiet Window | True when the OR of the proposed send at local hour is at least the intent quiet start hour and the proposed send at local hour is less than the intent quiet end hour if the intent quiet window wraps flag is set, in all other cases the AND of the proposed send at local hour is at least the intent quiet start hour and the proposed send at local hour is less than the intent quiet end hour. | _TRUE when the proposed recipient-local send hour falls inside the forbidden window._ |
| Timing Gate Passed | True when at least one of the following holds: the intent policy has quiet hours flag is not set or the intent is inside quiet window flag is not set. | _TRUE when transmitting now is permitted on timing grounds. The timing gate._ |
| Hours Until Window Opens | Determined by priority: 0 if the timing gate passed flag is set; the intent quiet end hour minus the proposed send at local hour if the proposed send at local hour is less than the intent quiet end hour; in all other cases, 24 minus the proposed send at local hour plus the intent quiet end hour. | _How many hours the pipeline must defer before transmission becomes permitted; 0 when already permitted._ |
| Intent Max Message Length | Taken from the linked intent policy. | _Per-segment character limit from the governing policy._ |
| Intent Max Segments | Taken from the linked intent policy. | _Segment ceiling from the governing policy._ |
| Proposed Body Length | A defined attribute. | _Character count of ProposedBody, written by the pipeline at render time._ |
| Proposed Segment Count | A defined attribute. | _Number of channel segments ProposedBody will occupy, computed by the pipeline at render time._ |
| Length Gate Passed | True when all of the following hold: the proposed body length is greater than 0 and the proposed segment count is at most the intent max segments. | _TRUE when the proposed text is non-empty and fits within the segment ceiling._ |
| Intent Required Opt Out Phrase | Taken from the linked intent policy. | _Opt-out phrase the governing policy requires in every message on this channel._ |
| Proposed Opt Out Position | A defined attribute. | _Character position of the required opt-out phrase within ProposedBody; 0 when absent. Written by the pipeline at render time._ |
| Opt Out Gate Passed | True when at least one of the following holds: the intent required opt out phrase is blank or all of the following hold: the proposed opt out position is greater than 0 and the proposed opt out position is at most the intent max message length. | _TRUE when no opt-out is required, or the required phrase is present within the first segment._ |
| Content Gate Passed | True when all of the following hold: the length gate passed flag is set and the opt out gate passed flag is set. | _TRUE when the proposed text satisfies every content rule of the governing channel policy._ |
| Template is Sendable | True when the send intent's message template is a sendable under approval. | _Whether the template carries a current, properly-authorized, non-drifted approval._ |
| Execution Has Legal Clearance | True when the send intent's procedure execution has a cleared legal review. | _Whether legal review has passed for the execution this intent belongs to._ |
| Intent Approval Role | Taken from the linked intent policy. | _The role the governing policy designates as the approving authority._ |
| Approval Role Agent Kind | The current agent kind of the send intent's intent approval role. | _Whether the agent currently filling the designated approval role is Human, AIAgent, or AutomatedPipeline._ |
| Approval is Human | True when the approval role agent kind is “Human”. | _TRUE when the designated approval role is currently held by a human agent._ |
| Authorization Gate Passed | True when all of the following hold: the template is sendable flag is set and all of the following hold: the execution has legal clearance flag is set and the approval is human flag is set. | _TRUE only when the template is validly approved, legal review has cleared, and the approving role is held by a human. The authorization gate._ |
| Is Cleared to Send | True when all of the following hold: the permission gate passed flag is set and all of the following hold: the timing gate passed flag is set and all of the following hold: the content gate passed flag is set and the authorization gate passed flag is set. | _TRUE only when all four gates pass. THE single column the pipeline reads before transmitting._ |
| Blocking Gate Name | Determined by priority: an empty string if the cleared to send flag is set; “Permission” if the permission gate passed flag is not set; “Timing” if the timing gate passed flag is not set; “Content” if the content gate passed flag is not set; in all other cases, “Authorization”. | _Names the first gate that refused, for the suppression reason; empty string when cleared._ |
| Has Resulting Delivery | True when the resulting delivery has a value. | _TRUE when this intent produced a delivery record of any status._ |
| Resulting Delivery Was Transmitted | True when the send intent's resulting delivery was actually transmitted. | _Whether the delivery produced from this intent actually left our systems._ |
| Is Overridden Refusal | True when all of the following hold: the cleared to send flag is not set and all of the following hold: the resulting delivery flag is set and the resulting delivery was transmitted flag is set. | _TRUE when a gate refused and the message was transmitted regardless. The override witness._ |
| Is Silently Dropped | True when all of the following hold: the cleared to send flag is not set and the resulting delivery flag is not set. | _TRUE when a gate refused and no delivery record of any kind was produced -- the recipient vanished from the run._ |
| Resulting Delivery Exception | The invoked exception of the send intent's resulting delivery. | _The documented exception invoked on the delivery produced from this intent, if any._ |
| Refusal Cited an Exception | True when the resulting delivery exception has a value. | _TRUE when the suppression produced by this refusal cited a documented exception._ |
| Is Properly Handled Refusal | True when all of the following hold: the cleared to send flag is not set and all of the following hold: the resulting delivery flag is set and all of the following hold: the resulting delivery was transmitted flag is not set and the refusal cited an exception flag is set. | _TRUE when a refusal correctly resulted in a non-transmitted delivery record citing a documented exception. The positive witness._ |
| Refusal Failure Execution Key | Determined by priority: the procedure execution if at least one of the following holds: the overridden refusal flag is set or the silently dropped flag is set; in all other cases, an empty string. | _Carries the execution id on any mishandled refusal; empty string otherwise._ |
| Intent Execution Key | The same as its procedure execution. | _The procedure execution id for every intent, used as the campaign rollup key._ |
| Delivered Intent Execution Key | Determined by priority: the procedure execution if all of the following hold: the resulting delivery flag is set and the resulting delivery was transmitted flag is set; in all other cases, an empty string. | _The execution id when this intent actually reached a person, otherwise empty string._ |
| Dropped Intent Execution Key | Determined by priority: the procedure execution if the silently dropped flag is set; in all other cases, an empty string. | _The execution id when this intent was refused and left no record at all._ |
| My Approval Was in Force | True when the template is sendable flag is set. | _TRUE when the template carried a valid approval at the moment this intent was evaluated._ |
| Refused on Approved Content | True when all of the following hold: the my approval was in force flag is set and the content gate passed flag is not set. | _TRUE when the pipeline refused an intent on content grounds even though the template was approved._ |
| Refused on Opt Out Only | True when all of the following hold: the opt out gate passed flag is not set and the length gate passed flag is set. | _TRUE when the only content failure was a missing or mispositioned opt-out phrase._ |
| Refusal Was on My Rules | True when all of the following hold: the cleared to send flag is not set and at least one of the following holds: the content gate passed flag is not set or the timing gate passed flag is not set. | _TRUE when the refusal came from a communications rule I own -- content, length, opt-out, quiet hours._ |
| Refusal Was Outside My Control | True when all of the following hold: the cleared to send flag is not set and at least one of the following holds: the permission gate passed flag is not set or the authorization gate passed flag is not set. | _TRUE when the refusal came from consent, reachability, or authorization -- none of which I can fix by editing a template._ |
| Approver Was Notified | True when an empty string. | _Whether the approving human was informed that this intent was refused._ |
| Is Unreported Refusal on My Rules | True when all of the following hold: the refusal was on my rules flag is set and the approver was notified flag is not set. | _TRUE when a refusal I own and could have fixed was never surfaced to me._ |
| Is Approval Overridden Silently | True when all of the following hold: the refused on approved content flag is set and the approver was notified flag is not set. | _TRUE when the pipeline overrode a valid human approval on content grounds and told nobody._ |
| Alternate Channel Intent | A defined attribute. | _The follow-up intent raised on a different channel after this one was refused. Stored as a raw identifier rather than an FK: SendIntents pointing at SendIntents would make the table self-referential in a way the DAG contract does not allow here._ |
| Has Alternate Channel Attempt | True when the alternate channel intent has a value. | _TRUE when a follow-up intent on another channel was raised for this refused send._ |
| Alternate Attempt Was Cleared | True when the send intent's alternate channel intent is a cleared to send. | _Whether the follow-up intent itself passed all gates._ |
| Is Refused With No Alternative | True when all of the following hold: the cleared to send flag is not set and the alternate channel attempt flag is not set. | _TRUE when a send was refused and no attempt was ever made on any other channel._ |
| Exception Prescribed an Alternative | True when all of the following hold: the refusal cited an exception flag is set and the resulting delivery exception has a value. | _TRUE when the documented exception for this refusal prescribes a different-channel send as the correct handling._ |
| Prescribed Handling Was Performed | True when all of the following hold: the exception prescribed an alternative flag is set and all of the following hold: the alternate channel attempt flag is set and the alternate attempt was cleared flag is set. | _TRUE when the exception prescribed an alternate channel and an alternate intent was actually raised and cleared._ |
| Is Suppression Without Remedy | True when all of the following hold: the exception prescribed an alternative flag is set and the prescribed handling was performed flag is not set. | _TRUE when we cited an exception that prescribed an alternate channel and then never performed it._ |
| Refusal Recorded At | A defined attribute. | _When this refusal was written to a durable record. Empty when no record was ever emitted._ |
| Refusal Notified Role | A defined attribute. | _The role informed that this send was refused._ |
| Has Durable Refusal Record | True when the refusal recorded at has a value. | _TRUE when this refusal was written down somewhere a human can find it._ |
| Refusal Was Escalated | True when the refusal notified role has a value. | _TRUE when a specific role was notified of this refusal._ |
| Is Unrecorded Refusal | True when all of the following hold: the silently dropped flag is set and all of the following hold: the durable refusal record flag is not set and the refusal cited an exception flag is not set. | _TRUE when I refused a send and produced no delivery record, no refusal record, and no exception. The refusal left no trace of any kind._ |
| Is Unescalated Refusal | True when all of the following hold: the cleared to send flag is not set and the refusal was escalated flag is not set. | _TRUE when a refusal was recorded but no human role was ever told._ |
| Unescalated Refusal Role Key | Determined by priority: the refusal notified role if the unrecorded refusal flag is set; in all other cases, an empty string. | _Echoes the role that should have been told about this refusal, but only when the refusal went unrecorded. Empty otherwise._ |
| Unrecorded Refusal Execution Key | Determined by priority: the procedure execution if the unrecorded refusal flag is set; in all other cases, an empty string. | _Echoes the parent procedure execution only for refusals nobody recorded; empty otherwise._ |
| Retry Intent | A defined attribute. | _The intent I raised when the quiet window reopened for this deferred send. Raw identifier rather than an FK: a SendIntents self-reference is not expressible as a relationship without making the table depend on itself._ |
| Was Deferred on Timing | True when all of the following hold: the timing gate passed flag is not set and all of the following hold: the permission gate passed flag is set and the content gate passed flag is set. | _TRUE when the timing gate is the reason this intent did not clear, and every other gate passed._ |
| Evaluation Context | A defined attribute. | _The evaluation context this row's time-dependent witnesses are judged under._ |
| As of Instant | Taken from the linked evaluation context. | _The evaluation instant this row's time-dependent witnesses are judged against._ |
| Window Has Since Reopened | True when all of the following hold: the hours until window opens is greater than 0 and the number of hours from the evaluated at to the as of instant is greater than the hours until window opens. | _TRUE when enough time has passed since evaluation that the quiet window this intent hit must have closed._ |
| Has Retry Attempt | True when the retry intent has a value. | _TRUE when a retry intent was raised for this deferred send._ |
| Retry Was Cleared | True when the send intent's retry intent is a cleared to send. | _Whether the retry intent itself passed all gates._ |
| Is Abandoned Deferral | True when all of the following hold: the was deferred on timing flag is set and all of the following hold: the window has since reopened flag is set and the retry attempt flag is not set. | _TRUE when a send was deferred for timing, the window has since reopened, and no retry was ever raised. A deferral silently converted into a cancellation._ |
| Deferral Age Hours | Computed as the number of hours from the evaluated at to the as of instant. | _How long this deferred intent has been sitting since evaluation._ |
| Is Stale Deferral | True when all of the following hold: the was deferred on timing flag is set and the deferral age hours is greater than 24. | _TRUE when a deferred send has been waiting more than 24 hours -- longer than any quiet window can justify._ |
| Evaluating Role Assignment | A defined attribute. | _The RoleAssignments id under which the pipeline evaluated this send intent. Raw rather than an FK because SendIntents already sits downstream of the execution graph and an added edge to RoleAssignments is not needed to resolve it._ |
| Enforced by Unauthorized Agent | True when the send intent's evaluating role assignment is an unauthorized enforcement agent. | _Whether the gate decision on this intent was made by an agent holding an unauthorized enforcement assignment._ |
| Consent Input Was Resolvable | True when the recipient consent status raw has a value. | _TRUE when the recipient's consent state was actually retrievable, as opposed to absent and read as a refusal._ |
| Recipient Consent Status Raw | The sms consent status of the send intent's recipient. | _The recipient's consent status as a string: Granted, Revoked, NeverGiven, or empty if no consent record exists at all._ |
| Policy Input Was Resolvable | True when the intent policy has a value. | _TRUE when a governing communication policy was actually found for this intent._ |
| All Gate Inputs Resolved | True when all of the following hold: the consent input was resolvable flag is set and the policy input was resolvable flag is set. | _TRUE when every input my gates depend on was actually retrievable._ |
| Is Unevaluable Refusal | True when all of the following hold: the cleared to send flag is not set and the all gate inputs resolved flag is not set. | _TRUE when I refused a send but at least one gate input could not be resolved -- so I do not actually know whether the rule was violated or merely unreadable._ |
| Gate Result Was Independently Confirmed | True when an empty string. | _Whether any agent other than me verified this gate outcome._ |
| Is Self Witnessed Decision | True when the gate result was independently confirmed flag is not set. | _TRUE when the entire decision to send or refuse rests solely on my own computation, unconfirmed by anything else._ |
| Is Independently Confirmed | True when all of the following hold: the resulting delivery flag is set and the resulting delivery was transmitted flag is set. | _TRUE when this intent's decision was corroborated by an actual delivery record rather than resting solely on the pipeline's own say-so._ |
| Independently Confirmed Execution Key | Determined by priority: the procedure execution if the independently confirmed flag is set; in all other cases, an empty string. | _Echoes the parent execution only for independently confirmed intents; empty otherwise._ |
| Semantic Type Iri | A defined attribute. | _Extension IRI; pre-send intents are not a PKO 2.0.0 native class._ |
| **Agent Decision Record** | AgentDecisionRecords (added by witness loop 1). | — |
| Name | Computed as the deciding agent, followed by “: ”, followed by the first 60 character(s) of the decision summary. | _Human-readable calculated display alias for the AgentDecisionRecords row._ |
| Step Execution | A defined attribute. | _Step execution during which the decision was made._ |
| Deciding Agent | A defined attribute. | _Agent that made the decision._ |
| Decision Kind | A defined attribute. | _Classification, Prioritization, Draft, Suppression, Escalation, or Posting._ |
| Decision Summary | A defined attribute. | _What the agent decided, in one sentence._ |
| Decided At | A defined attribute. | _When the decision was made._ |
| Materiality Band | A defined attribute. | _BelowThreshold, Material, or Escalated._ |
| Human Disposition | A defined attribute. | _Accepted, Corrected, Reversed, or NotReviewed._ |
| Reviewed by Agent | A defined attribute. | _Human agent that dispositioned the decision._ |
| Reviewed At | A defined attribute. | _When a human dispositioned the decision._ |
| Was Overridden | True when at least one of the following holds: the human disposition is “Corrected” or the human disposition is “Reversed”. | _TRUE when a human corrected or reversed this decision._ |
| Was Reviewed | True when all of the following hold: the human disposition has a value and the human disposition is not “NotReviewed”. | _TRUE when a human actually dispositioned this decision._ |
| Deciding Agent Kind | Taken from the linked deciding agent. | _Whether the deciding agent is Human, AIAgent, or AutomatedPipeline._ |
| Deciding Agent When Overridden | Determined by priority: the deciding agent if the was overridden flag is set; in all other cases, an empty string. | _Echoes the deciding agent id when the decision was overridden, blank otherwise._ |
| Under Role Assignment | A defined attribute. | _Role assignment in force when the decision was made; anchors the decision to one side of a handover._ |
| Role Assignment When Scored | Determined by priority: the under role assignment if the under role assignment has a value; in all other cases, an empty string. | _Echoes the governing role assignment when one is recorded, blank otherwise._ |
| Role Assignment When Overridden | Determined by priority: the under role assignment if the was overridden flag is set; in all other cases, an empty string. | _Echoes the governing role assignment when the decision was overridden, blank otherwise._ |
| Step of Decision | Taken from the linked step execution. | _The specified step at which this decision was made._ |
| Boundary Match Key | Computed as the step of decision, followed by “|”, followed by the deciding agent kind, followed by “|”, followed by the decision kind. | _Composite key of step, deciding agent kind, and decision kind for this decision._ |
| Matching Boundary Count | The number of authority boundaries related to the agent decision record. | _Number of authority boundaries this decision matches._ |
| Violated Authority Boundary | True when the matching boundary count is greater than 0. | _TRUE when this decision matches an authority boundary that forbids it._ |
| Reviewer Agent Kind | Taken from the linked reviewed by agent. | _Agent kind of the reviewer, if any._ |
| Has Human Confirmation | True when all of the following hold: the reviewer agent kind is “Human”; the human disposition has a value; and the human disposition is not “NotReviewed”. | _TRUE when a human agent actually dispositioned this decision._ |
| Needs Human Confirmation | True when all of the following hold: it is not the case that the deciding agent kind is “Human” and at least one of the following holds: the materiality band is “Material” or the materiality band is “Escalated”. | _TRUE when a non-human agent made a material or escalated decision._ |
| Is Unconfirmed Non Human Decision | True when all of the following hold: the needs human confirmation flag is set and the human confirmation flag is not set. | _TRUE when a material non-human decision was never confirmed by a human._ |
| Step Execution When Unconfirmed | Determined by priority: the step execution if the unconfirmed non human decision flag is set; in all other cases, an empty string. | _Echoes the step-execution id when the decision is an unconfirmed non-human material decision, blank otherwise._ |
| Agent When Boundary Violated | Determined by priority: the deciding agent if the violated authority boundary flag is set; in all other cases, an empty string. | _Echoes the deciding agent id when the decision violated a boundary, blank otherwise._ |
| Review Latency Minutes | Determined by priority: 0 if the reviewed at is blank; in all other cases, the number of minutes from the decided at to the reviewed at. | _Minutes between the decision and its human disposition; 0 when never reviewed. Declared number, not integer: DATETIME_DIFF returns a numeric and an integer cast makes the entire view fail on read._ |
| Is Draft Kind | True when at least one of the following holds: the decision kind is “Draft” or the decision kind is “Commitment”. | _TRUE when this decision produced text — the drafter's own output class._ |
| Agent When Draft Overridden | Determined by priority: the deciding agent if all of the following hold: the draft kind flag is set and the was overridden flag is set; in all other cases, an empty string. | _Echoes the deciding agent id when a drafting decision was overridden, blank otherwise._ |
| Agent When Draft | Determined by priority: the deciding agent if the draft kind flag is set; in all other cases, an empty string. | _Echoes the deciding agent id when the decision produced text, blank otherwise._ |
| Override Reason Kind | A defined attribute. | _Why the human changed my output: ErrorCorrection, JudgmentReserved, PolicyChange, or empty when not overridden._ |
| Is Error Correction | True when all of the following hold: the was overridden flag is set and the override reason kind is “ErrorCorrection”. | _TRUE when the override corrected something I got wrong._ |
| Is Reserved Judgment Override | True when all of the following hold: the was overridden flag is set and the override reason kind is “JudgmentReserved”. | _TRUE when the override was a human exercising authority the procedure always reserved to them._ |
| Override Reason is Recorded | True when all of the following hold: the was overridden flag is set and the override reason kind has a value. | _TRUE when an override carries a stated reason._ |
| Is Unexplained Override | True when all of the following hold: the was overridden flag is set and the override reason is recorded flag is not set. | _TRUE when my output was changed and nobody recorded why._ |
| Error Correction Role Assignment Key | Determined by priority: the under role assignment if the error correction flag is set; in all other cases, an empty string. | _The role assignment id when this decision was overridden as an error correction, otherwise empty._ |
| Boundary Violation Role Assignment Key | Determined by priority: the under role assignment if the violated authority boundary flag is set; in all other cases, an empty string. | _Echoes the role assignment this decision was made under, but only when the decision violated an authority boundary. Empty otherwise._ |
| Semantic Type Iri | A defined attribute. | _Extension class IRI for an agent decision record._ |
| **Delivered Communication** | Everything above is a proxy for the real question, which is instance-level: THIS message, to THIS recipient, rendered from THIS template, authorized by THIS approval. The model has MessageTemplates and CommunicationPolicies as specifications and no record of a single thing ever sent. Without an instance table, 'can I show that what was sent matched what I approved' is permanently unanswerable rather than merely unanswered — and it is the question a disputing employee actually asks. Extension term (urn:effortless:pko-extension#DeliveredCommunication); PKO has no native class for a delivered artifact instance. | — |
| Name | Computed as the channel, followed by “ -> ”, followed by the recipient key, followed by “ @ ”, followed by the sent at. | _Human-readable calculated display alias._ |
| Procedure Execution | A defined attribute. | _The run that produced this delivery._ |
| Sending Step Execution | A defined attribute. | _The policy-07 step execution that sent it._ |
| Authorizing Step Execution | A defined attribute. | _The human approval gate execution that authorized this content. Null means nobody approved it._ |
| Message Template | A defined attribute. | _The approved template this delivery was rendered from._ |
| Channel | A defined attribute. | _Email or SMS._ |
| Recipient Key | A defined attribute. | _Opaque recipient identifier; no personal data in the rulebook._ |
| Sent At | A defined attribute. | _When the message was dispatched._ |
| Rendered Content Hash | A defined attribute. | _Hash of the exact bytes delivered, for comparison against the approved rendering._ |
| Approved Content Hash | A defined attribute. | _Hash of the content as it stood at the approval gate._ |
| Delivery Status | A defined attribute. | _Provider-reported delivery outcome._ |
| Semantic Type Iri | A defined attribute. | _Extension class IRI._ |
| Has Authorization | True when the authorizing step execution has a value. | _TRUE when this delivery names the approval that authorized it._ |
| Content Matches Approval | True when the rendered content hash is the approved content hash. | _TRUE when the bytes delivered are the bytes approved._ |
| Authorized At | The ended at of the delivered communication's authorizing step execution. | _When the authorizing approval completed._ |
| Was Approved Before Sending | True when the authorized at is at most the sent at. | _TRUE when the approval preceded the send._ |
| Is Defensible | True when all of the following hold: the authorization flag is set; the content matches approval flag is set; and the was approved before sending flag is set. | _TRUE when this delivery can be defended in a dispute: authorized, unaltered, and approved beforehand._ |
| **Authority Boundary** | AuthorityBoundaries (added by witness loop 1). | — |
| Name | Computed as the forbidden agent kind, followed by “ may not ”, followed by the forbidden decision kind. | _Human-readable calculated display alias for the AuthorityBoundaries row._ |
| Step | A defined attribute. | _Step at which the boundary applies._ |
| Forbidden Agent Kind | A defined attribute. | _Agent kind that may not perform the forbidden decision kind: Human, AIAgent, or AutomatedPipeline._ |
| Forbidden Decision Kind | A defined attribute. | _Decision kind forbidden to that agent kind at this step._ |
| Ratified by Knowledge Fragment | A defined attribute. | _Knowledge fragment that states the boundary._ |
| Enforcing Requirement | A defined attribute. | _Requirement under which the boundary is enforced, if any._ |
| Authority Role | A defined attribute. | _Role accountable for the boundary._ |
| Valid From | A defined attribute. | _Start of the boundary's valid-time interval._ |
| Valid to | A defined attribute. | _End of the boundary's valid-time interval; null means open-ended._ |
| Status | A defined attribute. | _Approved, Proposed, or Retired._ |
| Evaluation Context | A defined attribute. | _The evaluation context this boundary's currency is judged under._ |
| As of Instant | Taken from the linked evaluation context. | _The evaluation instant this boundary is judged against._ |
| Is Currently Binding | True when all of the following hold: the status is “Approved”; the valid from is at most the as of instant; and at least one of the following holds: the valid to is blank or the valid to is greater than the as of instant. | _TRUE when this boundary is approved and inside its valid-time window right now._ |
| Ratifying Fragment is Valid | True when the authority boundary's ratified by knowledge fragment is currently valid. | _Whether the knowledge fragment that ratified this boundary is still valid._ |
| Step When Binding | Determined by priority: the step if the currently binding flag is set; in all other cases, an empty string. | _Echoes the step id when this boundary is currently binding, blank otherwise._ |
| Boundary Match Key | Computed as the step, followed by “|”, followed by the forbidden agent kind, followed by “|”, followed by the forbidden decision kind. | _Composite key of step, forbidden agent kind, and forbidden decision kind._ |
| Violation Count | The number of agent decision records related to the authority boundary. | _Number of recorded decisions that this boundary forbids._ |
| Is Untested | True when all of the following hold: the currently binding flag is set and the violation count is 0. | _TRUE when a binding boundary has never been triggered by any recorded decision._ |
| Has Ratifying Fragment | True when the ratified by knowledge fragment has a value. | _TRUE when this boundary names a knowledge fragment as its justification. FALSE means the rule constrains behaviour on nobody's recorded authority — strictly worse than resting on an expired claim, and previously invisible because the ratification lookup returned NULL._ |
| Is Unwarranted | True when all of the following hold: the currently binding flag is set and at least one of the following holds: the ratifying fragment flag is not set or the ratifying fragment is valid flag is not set. | _TRUE when a binding constraint on authority rests on no ratifying claim at all, or on one that is no longer valid. Either way the rule is being enforced without a live justification._ |
| Ratifying Fragment is Overdue | True when the authority boundary's ratified by knowledge fragment is an overdue for review. | _Whether the fragment ratifying this boundary is past its review date._ |
| Ratifying Fragment is Single Witness | True when the authority boundary's ratified by knowledge fragment is a from single witness. | _Whether the fragment ratifying this boundary rests on a single witness._ |
| Warrant is Thin | True when all of the following hold: the currently binding flag is set and at least one of the following holds: the ratifying fragment is overdue flag is set or the ratifying fragment is single witness flag is set. | _A binding boundary whose ratifying knowledge is either overdue for review or single-sourced — still valid, but weakly warranted._ |
| Is Unwarranted and Untested | True when all of the following hold: the unwarranted flag is set and the untested flag is set. | _A boundary whose ratification has lapsed and which no agent decision has ever been evaluated against — we cannot show it works and we cannot show why it exists._ |
| Unwarranted Boundary Step Key | Determined by priority: the step if the unwarranted flag is set; in all other cases, an empty string. | _Composite-key echo: the step this boundary governs when the boundary is unwarranted, blank otherwise._ |
| Ratifying Fragment Key | Determined by priority: the ratified by knowledge fragment if the currently binding flag is set; in all other cases, an empty string. | _Composite-key echo: the fragment ratifying this boundary when the boundary is currently binding, blank otherwise._ |
| Ratifying Fragment Status | Taken from the linked ratified by knowledge fragment. | _The status string of the knowledge fragment that ratifies this boundary: Approved, Reviewed, Draft, or empty._ |
| Ratification Lapsed | True when all of the following hold: the ratifying fragment flag is set and the ratifying fragment is valid flag is not set. | _TRUE when this boundary names a ratifying fragment and that fragment is no longer valid._ |
| Binds Despite Lapsed Ratification | True when all of the following hold: the currently binding flag is set and the ratification lapsed flag is set. | _TRUE when a boundary is still enforced against agents while the knowledge that authorized it has lapsed._ |
| Is Ungrounded and Untested | True when all of the following hold: the binds despite lapsed ratification flag is set and the untested flag is set. | _TRUE when a boundary has lapsed ratification AND has never once been exercised -- so neither its authority nor its operation has ever been demonstrated._ |
| Constrained Role Assignment Key | Determined by priority: the authority role if the binds despite lapsed ratification flag is set; in all other cases, an empty string. | _The role id this boundary constrains, emitted only when the boundary is ungrounded._ |
| Semantic Type Iri | A defined attribute. | _Extension class IRI for an authority boundary._ |
| **Binding Observation** | BindingObservations (added by witness loop 2). | — |
| Name | Computed as the step execution, followed by “ / ”, followed by the binding observation ID. | _Human-readable calculated display alias for the BindingObservations row._ |
| Step Execution | A defined attribute. | _The step execution during which this binding was read._ |
| Operational Binding | A defined attribute. | _The spec-side binding this observation instantiates._ |
| Observed Source Timestamp | A defined attribute. | _The LastObservedAt value the source actually carried at run time, captured then and never recomputed._ |
| Read At | A defined attribute. | _When the step execution actually read this binding._ |
| Sla Minutes At Run | The freshness sla minutes of the binding observation's operational binding. | _The freshness SLA declared for this binding._ |
| Age At Run Minutes | Computed as the number of minutes from the observed source timestamp to the read at. | _How old the source data was at the instant the step read it._ |
| Was Stale At Run | True when all of the following hold: the authoritative binding flag is set and the age at run minutes is greater than the sla minutes at run. | _TRUE when an authoritative source was already outside its SLA at the moment the step consumed it._ |
| Is Authoritative Binding | True when the linked operational binding is authoritative. | _Whether the binding observed is the authoritative source for its record key._ |
| Stale At Run Step Key | Determined by priority: the step execution if the was stale at run flag is set; in all other cases, an empty string. | _Echoes the step execution id when the source was stale at run time._ |
| **Attestation** | Attestations (added by witness loop 2). | — |
| Name | Computed as the procedure execution, followed by “ / ”, followed by the attestation ID. | _Human-readable calculated display alias for the Attestations row._ |
| Procedure Execution | A defined attribute. | _The execution being attested to._ |
| Signed by Agent | A defined attribute. | _The human who signed._ |
| Signed At | A defined attribute. | _The instant of signature._ |
| Assurance Grade At Signing | A defined attribute. | _The AssuranceGrade string as the model reported it at the moment of signature, captured then and never recomputed._ |
| Version Was Fit At Signing | True when an empty string. | _Whether the executed procedure version was fit to execute at the moment of signature._ |
| Version is Fit Now | True when the attestation's procedure execution is a fit. | _Whether the executed version reads as fit today._ |
| Fitness Verdict Has Drifted | True when it is not the case that the version was fit at signing is the version is fit now. | _TRUE when the fitness of the signed version reads differently today than it did at signature._ |
| Assurance Grade Now | Taken from the linked procedure execution. | _The AssuranceGrade the model reports for this execution today._ |
| Assurance Grade Has Drifted | True when it is not the case that the assurance grade at signing is the assurance grade now. | _TRUE when the assurance behind this signature is described differently now than it was at signature._ |
| Would Not Survive Restatement | True when at least one of the following holds: the fitness verdict has drifted flag is set or the assurance grade has drifted flag is set. | _TRUE when re-deriving this attestation today would not reproduce what the model said when it was signed._ |
| **App Role Profile** | One row per role, carrying how that role is presented: its accent colour, its 128x128 icon, and the login-card copy. Presentation is data, so the app never hardcodes a colour or a label per role. | — |
| Name | Computed as the display label, followed by “ (”, followed by the role kind, followed by “)”. | _Human-readable calculated display alias for the AppRoleProfiles row._ |
| Role | A defined attribute. | _The role this presentation profile describes._ |
| Display Label | A defined attribute. | _Label shown on the login card and in the app chrome._ |
| Role Kind | A defined attribute. | _human or software. Drives the login-card silhouette and the icon plate shape._ |
| Accent Color | A defined attribute. | _Hex accent colour. Distinctive per role; used for chrome, the left-nav active state, and the icon plate._ |
| Icon Mark | A defined attribute. | _Name of the geometric mark drawn on this role's icon. Colour is never the only signal — the mark discriminates in greyscale._ |
| Icon Png Base64 | A defined attribute. | _128x128 PNG icon for this role, base64-encoded, no data: prefix. Rendered on the login card and beside the role name throughout the app._ |
| Pitch | A defined attribute. | _One line of login-card copy: what this role opens the app to do, in that role's own terms._ |
| Sort Order | A defined attribute. | _Display order on the login screen. Human roles first, then software roles._ |
| Route Count | The number of app routes related to the app role profile. | _How many routes this role has._ |
| Semantic Type Iri | A defined attribute. | _Semantic type IRI for this row. An extension: PKO does not model application presentation._ |
| **App Nav Group** | The left-navigation section headers. A route names the group it appears under; the nav renders the groups its active role actually uses. | — |
| Name | The same as its group label. | _Human-readable calculated display alias for the AppNavGroups row._ |
| Group Label | A defined attribute. | _Section header text rendered in the left navigation._ |
| Route Count | The number of app routes related to the app nav group. | _How many routes sit under this nav group across all roles._ |
| Semantic Type Iri | A defined attribute. | _Semantic type IRI for this row. An extension: PKO does not model navigation._ |
| **App Route** | One row per screen in the role-navigated application, as /{role}/{dashboard}/{entity...}. Each carries its purpose in the owning role's voice and brief layout hints, so a later build session has the brief without re-deriving it. Shared detail routes have no owning role. | — |
| Name | Computed as the route name, followed by “ — ”, followed by the route path. | _Human-readable calculated display alias for the AppRoutes row._ |
| Route Path | A defined attribute. | _The URL path, /{role}/{dashboard}/{entity...}. Shared detail routes live under /shared/ because the same entity serves every role._ |
| Route Name | A defined attribute. | _Short label. This is the left-nav text._ |
| Surface | A defined attribute. | _domain \| maintainer. Domain routes belong to the twelve accountable Roles. Maintainer routes are the model's own instrumentation (Admin, Explorer) and deliberately have no owning role — 'admin' is not a role anyone is accountable in._ |
| Owning Role | A defined attribute. | _The role whose navigation contains this route. Null for shared routes reachable from several roles._ |
| Nav Group | A defined attribute. | _Left-nav section this route appears under. Null for detail routes reached by drill-down rather than from the nav._ |
| Nav Order | A defined attribute. | _Sort order within the nav group._ |
| Route Kind | A defined attribute. | _dashboard \| workspace \| detail \| index \| action. Detail routes carry path parameters and are not in the nav._ |
| Purpose | A defined attribute. | _What the role does here, in that role's own voice. This is the brief for the build session._ |
| Layout Hints | A defined attribute. | _Brief layout direction: the shape of the screen, what leads, and what must not be collapsed or implied._ |
| Is in Nav | True when the nav group has a value. | _Whether this route appears in the left navigation. Detail routes do not._ |
| Is Shared | True when all of the following hold: the owning role is blank and the surface is “domain”. | _Whether this route is shared across domain roles rather than owned by one. A maintainer route is not shared — it belongs to a different surface entirely._ |
| Is Maintainer | True when the surface is “maintainer”. | _Whether this route is model instrumentation rather than a domain workspace. Maintainer routes are reached from the login page's maintainer section, not from a role card._ |
| Question Count | The number of app route questions related to the app route. | _How many role questions this route helps answer._ |
| Reference Count | The number of app route references related to the app route. | _How many other routes this route links to._ |
| Answers No Question | True when all of the following hold: the question count is 0; the is shared is false; the is maintainer is false; and the route kind is not “index”. | _A domain route owned by a role that answers no role question. Not automatically wrong, but it should be justified. Maintainer routes are excluded: they answer questions about the model itself, which are not RoleQuestions and must not be fabricated as such._ |
| Semantic Type Iri | A defined attribute. | _Semantic type IRI for this row. An extension: PKO models procedures, not the applications that display them._ |
| **App Route Question** | Junction: which RoleQuestions each route helps answer. Deliberately many-to-many — a question is answered across several routes and a route serves several questions. It is not, and should not become, 1:1. | — |
| Name | Computed as the route, followed by “ answers ”, followed by the question. | _Human-readable calculated display alias for the AppRouteQuestions row._ |
| Route | A defined attribute. | _The route that helps answer the question._ |
| Question | A defined attribute. | _The role question this route helps answer._ |
| Semantic Type Iri | A defined attribute. | _Semantic type IRI for this row. An extension._ |
| **App Route Reference** | Junction: which other routes a route links to. This is the navigation graph between screens, kept as rows rather than embedded lists so the canonical model stays a DAG. | — |
| Name | Computed as the from route, followed by “ -> ”, followed by the to route. | _Human-readable calculated display alias for the AppRouteReferences row._ |
| From Route | A defined attribute. | _The route that links out._ |
| To Route | A defined attribute. | _The route being linked to._ |
| Semantic Type Iri | A defined attribute. | _Semantic type IRI for this row. An extension._ |
| **Rulebook Table** | Census of every table in this rulebook. The table-level counterpart to RulebookFields, and the anchor every access policy points at. Derived by tools/reconcile_field_catalog.py -- never hand-maintained. | — |
| Table Name | A defined attribute. | _Stored logical identifier: the rulebook table name, e.g. 'Procedures'._ |
| Name | The same as its table name. | _Human-readable calculated display alias._ |
| Physical Table | A defined attribute. | _snake_case Postgres base table name emitted by rulebook-to-postgres._ |
| Physical View | A defined attribute. | _snake_case Postgres view name (vw_*) carrying the computed columns._ |
| Subject Area | A defined attribute. | _Coarse grouping used to organise role schemas, e.g. 'execution', 'governance'._ |
| Is Extension | True when an empty string. | _True when this table is an ERB extension rather than a native/aligned PKO term._ |
| Field Count | The number of rulebook fields related to the rulebook table. | _Number of catalogued fields on this table._ |
| Policy Count | The number of access policies related to the rulebook table. | _Number of access policies targeting this table._ |
| Is Unsecured | True when the policy count is 0. | _True when RLS is enabled but no policy targets the table, so every principal sees zero rows. A fail-closed table nobody has granted access to._ |
| Semantic Type Iri | A defined attribute. | _Semantic type IRI._ |
| **Access Principal** | Security principals -- the identities policies attach to. A principal is the console persona a person logs in as; it maps many-to-one onto a domain Role, so 'who may see this row' is expressed once against the domain vocabulary while the UI keeps its own persona names. Each principal owns exactly one Postgres role and one Postgres schema. | — |
| Name | The same as its label. | _Human-readable calculated display alias._ |
| Label | A defined attribute. | _Display label shown in the console role picker._ |
| Domain Role | A defined attribute. | _Domain role whose authority this principal exercises._ |
| Pg Role Name | A defined attribute. | _Postgres role name this principal authenticates as, e.g. 'pko_controller'._ |
| Schema Name | A defined attribute. | _Postgres schema that is this principal's entire visible world, e.g. 'pko_controller'._ |
| Is Administrator | True when an empty string. | _True when this principal may read every table and edit access policy._ |
| Organization Scope | Taken from the linked domain role. | _Organization inherited from the domain role; the default tenancy boundary for row predicates._ |
| Role Label | Taken from the linked domain role. | _Label of the domain role, for display._ |
| Policy Count | The number of access policies related to the access principal. | _Number of row policies granted to this principal._ |
| Grant Count | The number of field grants related to the access principal. | _Number of field grants held by this principal._ |
| Visible Table Count | The number of role schema views related to the access principal. | _Number of tables exposed in this principal's schema._ |
| Has No Access | True when the policy count is 0. | _True when the principal holds no policies at all, so its schema is empty and it can read nothing. Fail-closed by construction._ |
| Is Over Privileged | True when all of the following hold: the administrator flag is not set and the visible table count is at least 74. | _True when a non-administrator principal can reach every table in the rulebook -- an admin-equivalent principal that was never declared as one._ |
| Semantic Type Iri | A defined attribute. | _Semantic type IRI._ |
| **Access Policy** | Row-level security policies: the VERTICAL cut. One row per principal x table x command, carrying the predicate that decides which rows are visible. RowPredicate is emitted verbatim into a Postgres USING clause, so it may call any SECURITY DEFINER calc_* function and therefore reference inference fields many hops down the DAG. | — |
| Name | Computed as the principal, followed by a space, followed by the command, followed by a space, followed by the target table. | _Human-readable calculated display alias._ |
| Principal | A defined attribute. | _Principal this policy grants to._ |
| Target Table | A defined attribute. | _Rulebook table this policy guards._ |
| Command | A defined attribute. | _SQL command the policy governs: SELECT, INSERT, UPDATE, DELETE or ALL._ |
| Row Predicate | A defined attribute. | _SQL boolean expression emitted into USING(...). Empty means all rows of the table. Must not sub-select the guarded table -- Postgres raises infinite recursion; route such predicates through a SECURITY DEFINER function instead._ |
| Check Predicate | A defined attribute. | _SQL boolean expression emitted into WITH CHECK(...) for write commands. Empty reuses RowPredicate._ |
| Rationale | A defined attribute. | _Why this principal is entitled to these rows, in the granting authority's words._ |
| References Inference | True when an empty string. | _True when RowPredicate calls a calc_* function, i.e. the cut depends on a derived field rather than a stored column._ |
| Is Write Command | True when at least one of the following holds: the command is “INSERT”; the command is “UPDATE”; the command is “DELETE”; or the command is “ALL”. | _True when this policy governs a mutating command._ |
| Is Unrestricted | True when the row predicate is blank. | _True when the policy carries no predicate, exposing every row of the target table to the principal._ |
| Principal is Admin | True when the access policy's principal is an administrator. | _Whether the granted principal is an administrator._ |
| Is Unrestricted Non Admin Grant | True when all of the following hold: the unrestricted flag is set and the principal is admin flag is not set. | _True when a non-administrator principal is granted an unrestricted policy -- a whole-table exposure that no row predicate narrows. The single highest-signal privilege-escalation witness in the model._ |
| Is Unwitnessed Write | True when all of the following hold: the write command flag is set and the denial test count is 0. | _True when a write policy has no denial test proving it refuses out-of-scope rows. An untested write grant is an assertion, not evidence._ |
| Denial Test Count | The number of access denial tests related to the access policy. | _Number of denial tests seeded against this policy._ |
| Semantic Type Iri | A defined attribute. | _Semantic type IRI._ |
| **Field Grant** | Field-level grants: the HORIZONTAL cut. One row per principal x field. A field with no grant row is not filtered from the principal's view -- it is absent from it, so the column does not exist as far as that principal's SQL is concerned. | — |
| Name | Computed as the principal, followed by “ -> ”, followed by the target field. | _Human-readable calculated display alias._ |
| Principal | A defined attribute. | _Principal receiving the grant._ |
| Target Field | A defined attribute. | _Catalogued field being exposed._ |
| Can Read | True when an empty string. | _True when the principal may read this field._ |
| Can Write | True when an empty string. | _True when the principal may write this field._ |
| Mask Strategy | A defined attribute. | _How the value is presented when read: 'plain', 'redacted' or 'hashed'._ |
| Field Table | The target table of the field grant's target field. | _Table the granted field belongs to._ |
| Field Name | Taken from the linked target field. | _Name of the granted field._ |
| Field is Derived | True when the linked target field is derived. | _Whether the granted field is a derived (calculated/lookup/aggregation) field._ |
| Is Writable Derived Field | True when all of the following hold: the can write flag is set and the field is derived flag is set. | _True when a derived field has been granted write access. Derived fields are computed by the substrate and cannot be written -- such a grant is incoherent and must be corrected._ |
| Is Masked | True when all of the following hold: the mask strategy is not “plain” and the mask strategy has a value. | _True when the value is transformed rather than shown verbatim._ |
| Grant Key When Readable | Determined by priority: the principal, followed by “|”, followed by the field table if the can read flag is set; in all other cases, an empty string. | _Composite echo of principal and table, blank unless readable. Enables single-criterion COUNTIFS rollups of readable columns per principal per table, per the documented multi-criteria COUNTIFS defect._ |
| Semantic Type Iri | A defined attribute. | _Semantic type IRI._ |
| **Role Schema** | One Postgres schema per principal -- the principal's entire visible world. The schema is the only entry on that principal's search_path, so a table absent from it cannot be named at all. | — |
| Name | The same as its schema name. | _Human-readable calculated display alias._ |
| Principal | A defined attribute. | _Principal that owns this schema._ |
| Schema Name | A defined attribute. | _Postgres schema name, e.g. 'pko_controller'._ |
| Search Path | The same as its schema name. | _search_path set for this principal's sessions. The principal's own schema only -- public is deliberately excluded so base tables cannot be named._ |
| Is Sealed | True when an empty string. | _True when the principal may not create objects in its own schema._ |
| View Count | The number of role schema views related to the role schema. | _Number of views exposed in this schema._ |
| Is Empty Schema | True when the view count is 0. | _True when the schema exposes no views, so the principal can read nothing at all._ |
| Semantic Type Iri | A defined attribute. | _Semantic type IRI._ |
| **Role Schema View** | The emitted views: one per principal x table. ColumnList is DERIVED from FieldGrants, so toggling a single grant changes the emitted DDL with no second edit anywhere. This is what makes an admin's save reshape the database without touching UI code. | — |
| Name | Computed as the schema name, followed by a period, followed by the view name. | _Human-readable calculated display alias._ |
| Role Schema | A defined attribute. | _Schema this view is emitted into._ |
| Principal | A defined attribute. | _Principal that will read this view._ |
| Target Table | A defined attribute. | _Rulebook table this view exposes._ |
| View Name | A defined attribute. | _Unqualified view name inside the principal's schema, e.g. 'procedures'._ |
| Schema Name | Taken from the linked role schema. | _Schema name, from the owning RoleSchemas row._ |
| Source View | The physical view of the role schema view's target table. | _Underlying computed view this narrows, e.g. 'vw_procedures'._ |
| Grant Key | Computed as the principal, followed by “|”, followed by the target table. | _Composite key matching FieldGrants.GrantKeyWhenReadable, used to roll up this view's readable column count._ |
| Column Count | The number of field grants related to the role schema view. | _Number of columns exposed, derived live from the principal's readable field grants. Change one grant and this view's shape changes._ |
| Table Field Count | Taken from the linked target table. | _Total catalogued fields on the target table._ |
| Is Full Width | True when all of the following hold: the column count is greater than 0 and the column count is at least the table field count. | _True when every field on the table is exposed, so the horizontal cut removes nothing._ |
| Is Degenerate View | True when the column count is 0. | _True when the view exposes zero columns -- an emitted view that cannot be selected from. A generator that emits this has produced invalid DDL._ |
| Semantic Type Iri | A defined attribute. | _Semantic type IRI._ |
| **Jwt Claim Mapping** | Maps verified JWT claims onto the SQL accessors row predicates call. Magic-links is the notary: it asserts only that the bearer controls an email address. This table records how that verified email, and any additional claims, become values a policy can test. | — |
| Name | Computed as the claim name, followed by “ -> ”, followed by the SQL accessor. | _Human-readable calculated display alias._ |
| Claim Name | A defined attribute. | _Claim key as it appears in the verified JWT payload, e.g. 'email'._ |
| SQL Accessor | A defined attribute. | _SQL function a policy calls to read the claim, e.g. 'app.jwt_email()'._ |
| Is Reserved Claim | True when an empty string. | _True for claims magic-links controls and an app cannot override: email, iss, iat, nbf, exp, sub, tenant_id._ |
| Maps to Principal | True when an empty string. | _True when this claim is what resolves the caller to an AccessPrincipals row._ |
| Description2 | A defined attribute. | _What the claim asserts and who vouches for it._ |
| Usage Count | The number of access policies related to the jwt claim mapping. | _Number of policies whose predicate calls this accessor._ |
| Semantic Type Iri | A defined attribute. | _Semantic type IRI._ |
| **Access Denial Test** | Denial witnesses. A policy with no failing case seeded against it is an assertion, not evidence -- the same acceptance bar the rest of this rulebook holds. Each row names a principal, a query, and the row that MUST NOT come back, so a policy that silently stops enforcing is caught by a red test rather than by an incident. | — |
| Name | Computed as the principal, followed by “ must not see ”, followed by the forbidden row ID. | _Human-readable calculated display alias._ |
| Target Policy | A defined attribute. | _Policy this test exercises._ |
| Principal | A defined attribute. | _Principal the query runs as._ |
| Target Table | A defined attribute. | _Table queried._ |
| Forbidden Row ID | A defined attribute. | _Primary key of the row that must be invisible to this principal._ |
| Expected Visible | True when an empty string. | _False for a denial test: the row must not appear. True asserts a row the principal is entitled to does appear._ |
| Observed Visible | True when an empty string. | _What the substrate actually returned on the last run. Written back by the verifier, never hand-set._ |
| Last Run At | A defined attribute. | _When this test was last executed against Postgres._ |
| Has Run | True when the last run at has a value. | _True once the test has been executed at least once._ |
| Is Passing | True when the observed visible is the expected visible. | _True when observed visibility matches expectation._ |
| Is Leak | True when all of the following hold: the expected visible flag is not set and the observed visible flag is set. | _True when a row that must be invisible was returned. A confirmed access-control breach._ |
| Is Unproven | True when the run flag is not set. | _True when the test has never run, so it proves nothing regardless of how it is written._ |
| Rationale | A defined attribute. | _Why this row must (or must not) be visible, and which predicate it exercises._ |
| Is Positive Control | True when the expected visible flag is set. | _True when this test asserts a row the principal IS entitled to. A denial suite with no positive controls cannot distinguish a working policy from one that denies everything._ |
| Forbidden Table | A defined attribute. | _For a table-absence witness: the table that must NOT exist in this principal's schema. Selecting it must raise 'relation does not exist', not return zero rows._ |
| Forbidden Column | A defined attribute. | _For a column-absence witness: the column that must NOT exist in this principal's view. Selecting it must raise 'column does not exist', not return null._ |
| Semantic Type Iri | A defined attribute. | _Semantic type IRI._ |
| **App User** | Sign-in identities. One row per person or automation that can authenticate. EmailAddress is what a verified token asserts; everything else about the caller is resolved from here inside the database, never trusted from the token. | — |
| Name | The same as its display name. | _Human-readable calculated display alias._ |
| Email Address | A defined attribute. | _Verified email. The one claim magic-links vouches for, and the join key from a token back to this row._ |
| Display Name | A defined attribute. | _Name shown in the console._ |
| Linked Agent | A defined attribute. | _Domain agent this sign-in identity corresponds to._ |
| Is Enabled | True when an empty string. | _False disables sign-in without deleting the identity or its history._ |
| Agent Kind | Taken from the linked linked agent. | _Whether the linked agent is Human, AIAgent or AutomatedPipeline._ |
| Organization | Taken from the linked linked agent. | _Organization inherited from the linked agent; the tenancy claim baked into issued tokens._ |
| Assignment Count | The number of principal assignments related to the app user. | _Number of principals this user may act as._ |
| Has No Principal | True when the assignment count is 0. | _True when the user may act as no principal at all, so a successfully verified token still grants nothing. Authentication without authorization._ |
| Holds Multiple Principals | True when the assignment count is greater than 1. | _True when the user may act as more than one principal, so the principal cannot be inferred from the email alone and must be chosen explicitly at sign-in._ |
| Is Non Human Sign in | True when at least one of the following holds: the agent kind is “AIAgent” or the agent kind is “AutomatedPipeline”. | _True when a non-human agent has a sign-in identity. Pipelines and AI agents authenticate too, and their tokens are scoped exactly like a person's._ |
| Semantic Type Iri | A defined attribute. | _Semantic type IRI._ |
| **Principal Assignment** | Which principals a user may act as. The authorization half of sign-in: a verified email proves who you are, this table decides what you may become. A user with two assignments picks one at sign-in, and the choice is verified here rather than accepted from the client. | — |
| Name | Computed as the app user, followed by “ as ”, followed by the principal. | _Human-readable calculated display alias._ |
| App User | A defined attribute. | _Sign-in identity being granted._ |
| Principal | A defined attribute. | _Principal the user may act as._ |
| Is Default | True when an empty string. | _True for the principal selected when the user does not name one._ |
| Granted Rationale | A defined attribute. | _Why this user may act as this principal._ |
| Principal is Admin | True when the principal assignment's principal is an administrator. | _Whether the assigned principal is an administrator._ |
| User Organization | Taken from the linked app user. | _Organization of the signing-in user._ |
| Principal Organization | The organization scope of the principal assignment's principal. | _Organization of the principal being assumed._ |
| Is Cross Organization Grant | True when all of the following hold: the user organization has a value; the principal organization has a value; and the user organization is not the principal organization. | _True when a user is allowed to act as a principal in a different organization. Legitimate for shared-service roles, but it crosses the tenancy boundary and should be deliberate rather than accidental._ |
| Semantic Type Iri | A defined attribute. | _Semantic type IRI._ |
| **Issued Token** | Audit trail of every token minted. A token records which user signed in, which principal they chose, and the claims that were joined from the database at mint time -- so a later question of 'what could this session see' is answerable from data rather than reconstruction. | — |
| Name | Computed as the app user, followed by “ as ”, followed by the principal, followed by “ @ ”, followed by the issued at. | _Human-readable calculated display alias._ |
| App User | A defined attribute. | _Identity that signed in._ |
| Principal | A defined attribute. | _Principal the token authorises._ |
| Issued At | A defined attribute. | _When the token was minted._ |
| Expires At | A defined attribute. | _When the token stops being accepted._ |
| Issuer | A defined attribute. | _Who minted it: 'dev-mint' locally, or the magic-links tenant URL in production._ |
| Subject Claim | A defined attribute. | _The 'sub' claim: the AppUserId the bearer is asserted to be._ |
| Claims Snapshot | A defined attribute. | _JSON of the additional claims joined from the database at mint time._ |
| Is Dev Minted | True when the issuer is “dev-mint”. | _True when issued by the local dev minter rather than a real magic-links tenant. Dev tokens are genuine RS256 tokens with a genuine keypair; they simply skip the email round-trip._ |
| Semantic Type Iri | A defined attribute. | _Semantic type IRI._ |

## 2 Fact Types

- an **agent** may reference one **organization**
- a **role** may reference one **organization**
- a **role** may reference one **agent**
- a **role assignment** may reference one **role**
- a **role assignment** may reference one **agent**
- a **role assignment** may reference one **evaluation context**
- a **role assignment** may reference one **role assignment**
- a **role assignment** may reference one **change request**
- a **community of practice** may reference one **organization**
- a **community of practice** may reference one **role**
- a **mentorship** may reference one **community of practice**
- a **mentorship** may reference one **agent**
- a **procedure** may reference one **procedure type**
- a **procedure** may reference one **organization**
- a **procedure version** may reference one **procedure**
- a **procedure version** may reference one **agent**
- a **procedure version** may reference one **evaluation context**
- a **procedure version link** may reference one **procedure version**
- a **procedure status change** may reference one **procedure version**
- a **procedure status change** may reference one **agent**
- a **step** may reference one **procedure version**
- a **step** may reference one **role**
- a **step transition** may reference one **procedure version**
- a **step transition** may reference one **step**
- a **step action** may reference one **step**
- a **step action** may reference one **action**
- a **step function** may reference one **step**
- a **step function** may reference one **function**
- a **step tool** may reference one **step**
- a **step tool** may reference one **tool**
- a **requirement** may reference one **role**
- a **step requirement** may reference one **step**
- a **step requirement** may reference one **requirement**
- a **step verification** may reference one **step**
- a **rationale** may reference one **procedure version**
- a **rationale** may reference one **step**
- a **rationale** may reference one **role**
- an **exception** may reference one **procedure version**
- an **exception** may reference one **step**
- an **exception** may reference one **role**
- a **procedure resource** may reference one **procedure version**
- a **procedure resource** may reference one **resource**
- an **elicitation session** may reference one **procedure version**
- an **elicitation session** may reference one **agent**
- an **elicitation session** may reference one **evaluation context**
- a **knowledge fragment** may reference one **procedure version**
- a **knowledge fragment** may reference one **step**
- a **knowledge fragment** may reference one **elicitation session**
- a **knowledge fragment** may reference one **agent**
- a **knowledge fragment** may reference one **role**
- a **knowledge fragment** may reference one **evaluation context**
- a **knowledge gap** may reference one **procedure version**
- a **knowledge gap** may reference one **step**
- a **knowledge gap** may reference one **role**
- a **knowledge gap** may reference one **evaluation context**
- an **FA q** may reference one **procedure version**
- an **FA q** may reference one **step**
- an **explanation** may reference one **procedure version**
- an **explanation** may reference one **step**
- a **procedure execution** may reference one **procedure version**
- a **procedure execution** may reference one **agent**
- a **step execution** may reference one **procedure execution**
- a **step execution** may reference one **step**
- a **step execution** may reference one **agent**
- a **requirement satisfaction** may reference one **step execution**
- a **requirement satisfaction** may reference one **requirement**
- a **requirement satisfaction** may reference one **agent**
- an **issue occurrence** may reference one **step execution**
- an **issue occurrence** may reference one **error**
- an **issue occurrence** may reference one **agent**
- a **user question** may reference one **step execution**
- a **user question** may reference one **agent**
- a **user question** may reference one **FA q**
- a **user question** may reference one **resource**
- a **user feedback** may reference one **procedure execution**
- a **user feedback** may reference one **agent**
- a **stewardship assignment** may reference one **procedure version**
- a **stewardship assignment** may reference one **role**
- a **stewardship assignment** may reference one **evaluation context**
- a **change request** may reference one **procedure version**
- a **change request** may reference one **agent**
- a **change request** may reference one **role**
- a **change request** may reference one **evaluation context**
- a **review event** may reference one **procedure version**
- a **review event** may reference one **agent**
- a **review event** may reference one **change request**
- a **review event** may reference one **evaluation context**
- a **learning activity** may reference one **community of practice**
- a **learning activity** may reference one **procedure version**
- a **learning activity** may reference one **agent**
- a **learning activity** may reference one **resource**
- an **operational binding** may reference one **procedure version**
- an **operational binding** may reference one **step**
- an **operational binding** may reference one **resource**
- an **operational binding** may reference one **evaluation context**
- a **communication policy** may reference one **procedure version**
- a **communication policy** may reference one **role**
- a **message template** may reference one **communication policy**
- a **message template** may reference one **resource**
- a **semantic mapping** may reference one **ontology profile**
- a **role question** may reference one **role**
- a **role question** may reference one **witness loop**
- a **rulebook field** may reference one **role question**
- a **test cas** may reference one **role question**
- a **test cas** may reference one **test suite**
- an **exception invocation** may reference one **step execution**
- an **exception invocation** may reference one **exception**
- an **exception invocation** may reference one **agent**
- a **verification outcome** may reference one **step execution**
- a **verification outcome** may reference one **step verification**
- a **verification outcome** may reference one **agent**
- an **observed transition** references exactly one **procedure execution**
- an **observed transition** references exactly one **step transition**
- an **observed transition** may reference one **step execution**
- a **recipient** may reference one **organization**
- a **recipient** may reference one **operational binding**
- a **message delivery** may reference one **procedure execution**
- a **message delivery** may reference one **step execution**
- a **message delivery** may reference one **recipient**
- a **message delivery** may reference one **message template**
- a **message delivery** may reference one **agent**
- a **message delivery** may reference one **exception**
- a **message delivery** may reference one **evaluation context**
- a **template approval** may reference one **message template**
- a **template approval** may reference one **agent**
- a **template approval** may reference one **role**
- a **send intent** may reference one **procedure execution**
- a **send intent** may reference one **step execution**
- a **send intent** may reference one **recipient**
- a **send intent** may reference one **message template**
- a **send intent** may reference one **message delivery**
- a **send intent** may reference one **role**
- a **send intent** may reference one **evaluation context**
- an **agent decision record** may reference one **step execution**
- an **agent decision record** may reference one **agent**
- an **agent decision record** may reference one **role assignment**
- a **delivered communication** references exactly one **procedure execution**
- a **delivered communication** may reference one **step execution**
- a **delivered communication** may reference one **message template**
- an **authority boundary** may reference one **step**
- an **authority boundary** may reference one **knowledge fragment**
- an **authority boundary** may reference one **requirement**
- an **authority boundary** may reference one **role**
- an **authority boundary** may reference one **evaluation context**
- a **binding observation** may reference one **step execution**
- a **binding observation** may reference one **operational binding**
- an **attestation** may reference one **procedure execution**
- an **attestation** may reference one **agent**
- an **app role profile** may reference one **role**
- an **app route** may reference one **role**
- an **app route** may reference one **app nav group**
- an **app route question** may reference one **app route**
- an **app route question** may reference one **role question**
- an **app route reference** may reference one **app route**
- an **access principal** may reference one **role**
- an **access policy** may reference one **access principal**
- an **access policy** may reference one **rulebook table**
- a **field grant** may reference one **access principal**
- a **field grant** may reference one **rulebook field**
- a **role schema** may reference one **access principal**
- a **role schema view** may reference one **role schema**
- a **role schema view** may reference one **access principal**
- a **role schema view** may reference one **rulebook table**
- an **access denial test** may reference one **access policy**
- an **access denial test** may reference one **access principal**
- an **access denial test** may reference one **rulebook table**
- an **app user** may reference one **agent**
- a **principal assignment** may reference one **app user**
- a **principal assignment** may reference one **access principal**
- an **issued token** may reference one **app user**
- an **issued token** may reference one **access principal**

## 3 Operative Rules

_Operative rules state what the business **obliges**, **prohibits**, or
advises (**should**). Structural rules come from required fields and foreign keys;
semantic rules come from the Constraints table, each keyed on a boolean the rulebook
already computes (cross-referenced as DR-N in the Definitional Rules below)._

### Structural Constraints (from the schema)

- An evaluation context **must** have an as of instant.
- A witness loop **must** have a loop number.
- An observed transition **must** reference exactly one procedure execution.
- An observed transition **must** reference exactly one step transition.
- A delivered communication **must** reference exactly one procedure execution.
- An app route **must** have a route path and a surface.
- A rulebook table **must** have a table name.

## 4 Definitional Rules

_All statements express truth in the business domain; they are neither
procedures nor imperatives. "iff" is avoided in favor of "only if" so a
one-directional necessity is not mistaken for an equivalence. A
**⚠︎ mechanical** chip marks a rule whose deterministic wording is faithful
but clunky — a flag for an optional downstream reword pass, not a defect._

| ID | Declarative rule |
|----|------------------|
| **DR-1 Name** | A rulebook releas's name is computed as the rulebook version, followed by “ / PKO ”, followed by the pko core version iri. |
| **DR-2 Name** | An ontology profile's name is computed as the label, followed by a space, followed by the version. |
| **DR-3 Name** | An evaluation context's name is computed as the label, followed by “ @ ”, followed by the as of instant. |
| **DR-4 Name** | An organization's name is the same as its display name. |
| **DR-5 Name** | An agent's name is the same as its display name. |
| **DR-6 Count of Current Role Assignments** | An agent's count of current role assignments is the number of role assignments related to the agent. |
| **DR-7 Is Still Engaged** | An agent is considered still-engaged if the count of current role assignments is greater than 0. |
| **DR-8 Decision Count** | An agent's decision count is the number of agent decision records related to the agent. |
| **DR-9 Overridden Decision Count** | An agent's overridden decision count is the number of agent decision records related to the agent. |
| **DR-10 Override Rate Percent** | The agent's override rate percent is determined by the following priority:<br>1. 0, if the decision count is 0;<br>2. in all other cases, the overridden decision count times 100 divided by the decision count. |
| **DR-11 Is Non Human** | An agent is considered a non human if it is not the case that the agent kind is “Human”. |
| **DR-12 Boundary Violation Count** | An agent's boundary violation count is the number of agent decision records related to the agent. |
| **DR-13 Is Operating Outside Boundary** | An agent is considered an operating outside boundary if the boundary violation count is greater than 0. |
| **DR-14 Draft Decision Count** | An agent's draft decision count is the number of agent decision records related to the agent. |
| **DR-15 Overridden Draft Count** | An agent's overridden draft count is the number of agent decision records related to the agent. |
| **DR-16 Draft Rewrite Rate Percent** | The agent's draft rewrite rate percent is determined by the following priority:<br>1. 0, if the draft decision count is 0;<br>2. in all other cases, the overridden draft count times 100 divided by the draft decision count. |
| **DR-17 Name** | A role's name is the same as its label. |
| **DR-18 Current Agent Kind** | A role's current agent kind — taken from the linked current agent. |
| **DR-19 Active Assignment Count** | A role's active assignment count is the number of role assignments related to the role. |
| **DR-20 Currently Covered Assignment Count** | A role's currently covered assignment count is the number of role assignments related to the role. |
| **DR-21 Has No Current Holder** | A role is considered to have no current holder if the currently covered assignment count is 0. |
| **DR-22 Count of Awaited Decisions** | A role's count of awaited decisions is the number of change requests related to the role. |
| **DR-23 Current Assignment Valid From** | A role's current assignment valid from — taken from the linked current assignment. |
| **DR-24 Is Non Human Held** | A role is considered a non human held if it is not the case that the current agent kind is “Human”. |
| **DR-25 Is Ungoverned Non Human Role** | A role is considered an ungoverned non human role if all of the following hold: the non human held flag is set and the no current holder flag is set. |
| **DR-26 Departed Assignment Count** | A role's departed assignment count is the number of role assignments related to the role. |
| **DR-27 Has Lost a Holder** | A role is considered to have a lost a holder if the departed assignment count is greater than 0. |
| **DR-28 Is Vacated Role** | A role is considered a vacated role if all of the following hold: the lost a holder flag is set and the no current holder flag is set. |
| **DR-29 Ungrounded Boundary Count** | A role's ungrounded boundary count is the number of authority boundaries related to the role. |
| **DR-30 Is Governed by Lapsed Authority** | A role is considered a governed by lapsed authority if the ungrounded boundary count is greater than 0. |
| **DR-31 Unescalated Refusal Count** | A role's unescalated refusal count is the number of send intents related to the role. |
| **DR-32 Unauthorized Enforcement Assignment Count** | A role's unauthorized enforcement assignment count is the number of role assignments related to the role. |
| **DR-33 Is Ungoverned Enforcement Role** | A role is considered an ungoverned enforcement role if the unauthorized enforcement assignment count is greater than 0. |
| **DR-34 Name** | A role assignment's name is computed as the role, followed by “ @ ”, followed by the valid from. |
| **DR-35 As of Instant** | A role assignment's as of instant — taken from the linked evaluation context. |
| **DR-36 Is Current** | A role assignment is considered a current if all of the following hold: the valid from is at most the as of instant and at least one of the following holds: the valid to is blank or the valid to is greater than the as of instant. |
| **DR-37 Current Agent Key** | The role assignment's current agent key is determined by the following priority:<br>1. the agent, if the current flag is set;<br>2. in all other cases, an empty string. |
| **DR-38 Is Currently Valid** | A role assignment is considered currently-valid if all of the following hold: the status is “Active” and at least one of the following holds: the valid to is blank or the valid to is greater than the as of instant. |
| **DR-39 Agent Role Key** | The role assignment's agent role key is determined by the following priority:<br>1. the agent, followed by “|”, followed by the role, if the currently valid flag is set;<br>2. in all other cases, an empty string. |
| **DR-40 Has Departed** | A role assignment is considered to have departed if all of the following hold: the valid to has a value and the valid to is at most the as of instant. |
| **DR-41 Covers Now** | A role assignment is considered to cover a now if all of the following hold: the status is “Active”; the valid from is at most the as of instant; and at least one of the following holds: the valid to is blank or the valid to is greater than the as of instant. |
| **DR-42 Role When Covering** | The role assignment's role when covering is determined by the following priority:<br>1. the role, if the covers now flag is set;<br>2. in all other cases, an empty string. |
| **DR-43 Agent Kind** | A role assignment's agent kind — taken from the linked agent. |
| **DR-44 Is Non Human Assignment** | A role assignment is considered a non human assignment if it is not the case that the agent kind is “Human”. |
| **DR-45 Predecessor Agent Kind** | A role assignment's predecessor agent kind — taken from the linked supersedes assignment. |
| **DR-46 Is Human to Non Human Handover** | A role assignment is considered a human to non human handover if all of the following hold: the predecessor agent kind is “Human” and the non human assignment flag is set. |
| **DR-47 Is Unauthorized Non Human Assignment** | A role assignment is considered an unauthorized non human assignment if all of the following hold: the non human assignment flag is set and the approving authority flag is not set. |
| **DR-48 Was Authorized by Change Request** | A role assignment is considered to have been authorized by change request if all of the following hold: the approving authority flag is set and the authorizing change request has a value. |
| **DR-49 Decision Count** | A role assignment's decision count is the number of agent decision records related to the role assignment. |
| **DR-50 Overridden Decision Count** | A role assignment's overridden decision count is the number of agent decision records related to the role assignment. |
| **DR-51 Override Rate Percent** | The role assignment's override rate percent is determined by the following priority:<br>1. 0, if the decision count is 0;<br>2. in all other cases, the overridden decision count times 100 divided by the decision count. |
| **DR-52 Predecessor Override Rate Percent** | A role assignment's predecessor override rate percent — taken from the linked supersedes assignment. |
| **DR-53 Quality Regressed Vs Predecessor** | A role assignment is flagged quality regressed vs predecessor if all of the following hold: the supersedes assignment has a value and the override rate percent is greater than the predecessor override rate percent. |
| **DR-54 Departed Role Key** | The role assignment's departed role key is determined by the following priority:<br>1. the role, if the departed flag is set;<br>2. in all other cases, an empty string. |
| **DR-55 Predecessor Decision Count** | A role assignment's predecessor decision count — taken from the linked supersedes assignment. |
| **DR-56 Has Sufficient Sample** | A role assignment is considered to have a sufficient sample if the decision count is at least the minimum decisions for comparison. |
| **DR-57 Predecessor Has Sufficient Sample** | A role assignment is flagged predecessor has sufficient sample if the predecessor decision count is at least the minimum decisions for comparison. |
| **DR-58 Comparison is Evidentially Sound** | A role assignment is flagged comparison is evidentially sound if all of the following hold: the sufficient sample flag is set and the predecessor has sufficient sample flag is set. |
| **DR-59 Single Override Swing Percent** | The role assignment's single override swing percent is determined by the following priority:<br>1. 100 divided by the decision count, if the decision count is greater than 0;<br>2. in all other cases, 0. |
| **DR-60 Quality Verdict is Unsupported** | A role assignment is flagged quality verdict is unsupported if all of the following hold: the comparison is evidentially sound flag is not set and the quality regressed vs predecessor flag is not set. |
| **DR-61 Is Unmeasured Automation Handover** | A role assignment is considered an unmeasured automation handover if all of the following hold: the human to non human handover flag is set and the comparison is evidentially sound flag is not set. |
| **DR-62 Error Correction Count** | A role assignment's error correction count is the number of agent decision records related to the role assignment. |
| **DR-63 Error Rate Percent** | The role assignment's error rate percent is determined by the following priority:<br>1. the error correction count times 100 divided by the decision count, if the decision count is greater than 0;<br>2. in all other cases, 0. |
| **DR-64 Has Dated Authorization** | A role assignment is considered to have a dated authorization if all of the following hold: the approving authority role has a value and the authorization decided at has a value. |
| **DR-65 Days Since Authorization Review** | The role assignment's days since authorization review is determined by the following priority:<br>1. the number of days from the authorization reviewed at to the as of instant, if the authorization reviewed at has a value;<br>2. in all other cases, the number of days from the valid from to the as of instant. |
| **DR-66 Authorization is Overdue for Review** | A role assignment is flagged authorization is overdue for review if all of the following hold: the authorization review cadence days is greater than 0 and the days since authorization review is greater than the authorization review cadence days. |
| **DR-67 Is Standing Unreviewed Automation** | A role assignment is considered a standing unreviewed automation if all of the following hold: the covers now flag is set and all of the following hold: the non human assignment flag is set and the authorization is overdue for review flag is set. |
| **DR-68 Is Unconditioned Automation Handover** | A role assignment is considered an unconditioned automation handover if all of the following hold: the human to non human handover flag is set and the authorization review cadence days is 0. |
| **DR-69 Exceeds Tolerable Error Rate** | A role assignment is considered to exceed a tolerable error rate if all of the following hold: the max tolerable error rate percent is greater than 0 and the error rate percent is at least the max tolerable error rate percent. |
| **DR-70 Boundary Violation Count for Assignment** | A role assignment's boundary violation count for assignment is the number of agent decision records related to the role assignment. |
| **DR-71 Has Any Boundary Violation** | A role assignment is considered to have any boundary violation if the boundary violation count for assignment is greater than 0. |
| **DR-72 Has Ungrounded Governing Boundary** | A role assignment's has ungrounded governing boundary is true when the role assignment's role is a governed by lapsed authority. |
| **DR-73 Suspension Condition Met** | A role assignment is flagged suspension condition met if at least one of the following holds: the exceeds tolerable error rate flag is set or at least one of the following holds: the any boundary violation flag is set or the ungrounded governing boundary flag is set. |
| **DR-74 Is Operating Under Met Suspension Condition** | A role assignment is considered an operating under met suspension condition if all of the following hold: the suspension condition met flag is set and all of the following hold: the covers now flag is set and the non human assignment flag is set. |
| **DR-75 Has Declared Suspension Condition** | A role assignment is considered to have a declared suspension condition if the max tolerable error rate percent is greater than 0. |
| **DR-76 Has Approving Authority** | A role assignment is considered to have an approving authority if the approving authority role has a value. |
| **DR-77 Has Authorizing Change Request** | A role assignment is considered to have an authorizing change request if the authorizing change request has a value. |
| **DR-78 Is Unauthorized Enforcement Agent** | A role assignment is considered an unauthorized enforcement agent if all of the following hold: the enforcement role flag is set and the unauthorized non human assignment flag is set. |
| **DR-79 Governance Evidence Count** | A role assignment's governance evidence count is computed as the count of the following that hold: the approving authority flag is set and the authorizing change request flag is set. |
| **DR-80 Unauthorized Enforcement Role Key** | The role assignment's unauthorized enforcement role key is determined by the following priority:<br>1. the role, if the unauthorized non human assignment flag is set;<br>2. in all other cases, an empty string. |
| **DR-81 Name** | A community of practice's name is the same as its label. |
| **DR-82 Name** | A mentorship's name is computed as the mentor agent, followed by “ -> ”, followed by the learner agent. |
| **DR-83 Name** | A procedure type's name is the same as its label. |
| **DR-84 Name** | A procedure's name is the same as its title. |
| **DR-85 Name** | A procedure version's name is the same as its title. |
| **DR-86 Count of Steps** | A procedure version's count of steps is the number of steps related to the procedure version. |
| **DR-87 Count of Open Knowledge Gaps** | A procedure version's count of open knowledge gaps is the number of the procedure version's knowledge gaps that have a status of “Open”. |
| **DR-88 Is Ready for Execution** | A procedure version is considered a ready for execution if all of the following hold: the status is “Approved”; the count of steps is greater than 0; and the count of open knowledge gaps is 0. |
| **DR-89 Specified Step Count** | A procedure version's specified step count is the number of steps related to the procedure version. |
| **DR-90 Overdue Review Count** | A procedure version's overdue review count is the number of review events related to the procedure version. |
| **DR-91 Open Change Request Count** | A procedure version's open change request count is the number of change requests related to the procedure version. |
| **DR-92 Open High Severity Gap Count** | A procedure version's open high severity gap count is the number of knowledge gaps related to the procedure version. |
| **DR-93 Is Fit to Execute** | A procedure version is considered a fit to execute if all of the following hold: the status is “Approved”; the overdue review count is 0; the open change request count is 0; and the open high severity gap count is 0. |
| **DR-94 Steward Review Cadence Days** | A procedure version's steward review cadence days is the total review cadence days across the stewardship assignments related to the procedure version. |
| **DR-95 Count of Stewardship Assignments** | A procedure version's count of stewardship assignments is the number of stewardship assignments related to the procedure version. |
| **DR-96 Has Any Steward** | A procedure version is considered to have any steward if the count of stewardship assignments is greater than 0. |
| **DR-97 Is Live** | A procedure version is considered live if at least one of the following holds: the status is “Approved” or the status is “Published”. |
| **DR-98 Is Unstewarded** | A procedure version is considered unstewarded if the any steward flag is not set. |
| **DR-99 Is Live and Unstewarded** | A procedure version is considered live-and-unstewarded if all of the following hold: the live flag is set and the unstewarded flag is set. |
| **DR-100 Count of Open Blocking Gaps** | A procedure version's count of open blocking gaps is the number of knowledge gaps related to the procedure version. |
| **DR-101 Has Open Blocking Gap** | A procedure version is considered to have an open blocking gap if the count of open blocking gaps is greater than 0. |
| **DR-102 Is Live With Blocking Gap** | A procedure version is considered a live with blocking gap if all of the following hold: the live flag is set and the open blocking gap flag is set. |
| **DR-103 Should Not Be Executable** | A procedure version is considered to require not be executable if all of the following hold: the ready for execution flag is set and the open blocking gap flag is set. |
| **DR-104 Count of Unapproved Reliance Fragments** | A procedure version's count of unapproved reliance fragments is the number of knowledge fragments related to the procedure version. |
| **DR-105 Runs on Unapproved Knowledge** | A procedure version is considered to run on unapproved knowledge if the count of unapproved reliance fragments is greater than 0. |
| **DR-106 Count of Overdue Gaps** | A procedure version's count of overdue gaps is the number of knowledge gaps related to the procedure version. |
| **DR-107 Count of Change Requests** | A procedure version's count of change requests is the number of change requests related to the procedure version. |
| **DR-108 Count of Review Events** | A procedure version's count of review events is the number of review events related to the procedure version. |
| **DR-109 Has Governance Record** | A procedure version is considered to have a governance record if at least one of the following holds: the count of change requests is greater than 0 or the count of review events is greater than 0. |
| **DR-110 As of Instant** | A procedure version's as of instant — taken from the linked evaluation context. |
| **DR-111 Days Since Modified** | A procedure version's days since modified is computed as the number of days from the modified at to the as of instant. |
| **DR-112 Days Since Last Review** | A procedure version's days since last review is an aggregated value computed across the procedure version's related records. |
| **DR-113 Was Modified Since Last Review** | A procedure version is considered to have been modified since last review if the days since modified is less than the days since last review. |
| **DR-114 Modifier is Authority** | A procedure version's modifier is authority is the agent kind of the procedure version's modified by agent. |
| **DR-115 Has Unwitnessed Change** | A procedure version is considered to have an unwitnessed change if all of the following hold: the live flag is set and the was modified since last review flag is set. |
| **DR-116 Count of Stale Fragments** | A procedure version's count of stale fragments is the number of knowledge fragments related to the procedure version. |
| **DR-117 Knowledge is Staler Than Cadence** | A procedure version is flagged knowledge is staler than cadence if the count of stale fragments is greater than 0. |
| **DR-118 Compound Fragile Fragment Count** | A procedure version's compound fragile fragment count is the number of knowledge fragments related to the procedure version. |
| **DR-119 Rests on Compound Fragile Knowledge** | A procedure version is considered to rest on compound fragile knowledge if all of the following hold: the live flag is set and the compound fragile fragment count is greater than 0. |
| **DR-120 Concentrated Witness Session Count** | A procedure version's concentrated witness session count is the number of elicitation sessions related to the procedure version. |
| **DR-121 Knowledge Base is Concentrated** | A procedure version is flagged knowledge base is concentrated if all of the following hold: the live flag is set and the concentrated witness session count is greater than 0. |
| **DR-122 Machine Consumed Unapproved Count** | A procedure version's machine consumed unapproved count is the number of knowledge fragments related to the procedure version. |
| **DR-123 Feeds Unapproved Knowledge to Machines** | A procedure version is considered to feed an unapproved knowledge to machines if all of the following hold: the live flag is set and the machine consumed unapproved count is greater than 0. |
| **DR-124 Genuinely Overdue Fragment Count** | A procedure version's genuinely overdue fragment count is the number of knowledge fragments related to the procedure version. |
| **DR-125 Awaited Decision Count** | A procedure version's awaited decision count is the number of change requests related to the procedure version. |
| **DR-126 Scoped Open Blocking Gap Count** | A procedure version's scoped open blocking gap count is the number of knowledge gaps related to the procedure version. |
| **DR-127 Is Blocked on Pending Decision** | A procedure version is considered a blocked on pending decision if all of the following hold: the awaited decision count is greater than 0 and the scoped open blocking gap count is greater than 0. |
| **DR-128 Unexercised Human Gate Count** | A procedure version's unexercised human gate count is the number of steps related to the procedure version. |
| **DR-129 Ai Boundary is Unevidenced** | A procedure version is flagged ai boundary is unevidenced if all of the following hold: the live flag is set and the unexercised human gate count is greater than 0. |
| **DR-130 Load Bearing Unapproved Count** | A procedure version's load bearing unapproved count is the number of knowledge fragments related to the procedure version. |
| **DR-131 Unlanded Decision Count** | A procedure version's unlanded decision count is the number of change requests related to the procedure version. |
| **DR-132 Unrehearsed Control Entry Count** | A procedure version's unrehearsed control entry count is the number of step transitions related to the procedure version. |
| **DR-133 Has Unrehearsed Control Entry** | A procedure version is considered to have an unrehearsed control entry if the unrehearsed control entry count is greater than 0. |
| **DR-134 Is Live With Unrehearsed Control** | A procedure version is considered a live with unrehearsed control if all of the following hold: the live flag is set and the unrehearsed control entry flag is set. |
| **DR-135 Cadence Breach Count** | A procedure version's cadence breach count is the number of review events related to the procedure version. |
| **DR-136 Is in Cadence Breach** | A procedure version is considered in-cadence-breach if the cadence breach count is greater than 0. |
| **DR-137 Has Decision in Flight** | A procedure version is considered to have a decision in flight if the open change request count is greater than 0. |
| **DR-138 Is Unremediated Cadence Breach** | A procedure version is considered an unremediated cadence breach if all of the following hold: the in cadence breach flag is set and the decision in flight flag is not set. |
| **DR-139 Is Managed Cadence Breach** | A procedure version is considered a managed cadence breach if all of the following hold: the in cadence breach flag is set and the decision in flight flag is set. |
| **DR-140 Governance is Silent** | A procedure version is flagged governance is silent if all of the following hold: the live flag is set and the governance record flag is not set. |
| **DR-141 Valid Fragment Count** | A procedure version's valid fragment count is the number of knowledge fragments related to the procedure version. |
| **DR-142 Still Owns Valid Knowledge** | A procedure version is flagged still owns valid knowledge if the valid fragment count is greater than 0. |
| **DR-143 Incoming Supersession Count** | A procedure version's incoming supersession count is the number of procedure version links related to the procedure version. |
| **DR-144 Is Still Referenced** | A procedure version is considered still-referenced if the incoming supersession count is greater than 0. |
| **DR-145 Is Load Bearing Orphan** | A procedure version is considered a load bearing orphan if all of the following hold: the unstewarded flag is set and at least one of the following holds: the still owns valid knowledge flag is set or the still referenced flag is set. |
| **DR-146 Is Cleanly Retired** | A procedure version is considered cleanly-retired if all of the following hold: the unstewarded flag is set; the still owns valid knowledge flag is not set; and the still referenced flag is not set. |
| **DR-147 Stalled Implementation Count** | A procedure version's stalled implementation count is the number of change requests related to the procedure version. |
| **DR-148 Is Held Unfit by Landed Decisions** | A procedure version is considered a held unfit by landed decisions if all of the following hold: the fit to execute flag is not set and the stalled implementation count is greater than 0. |
| **DR-149 Undeclared Control Kind Count** | A procedure version's undeclared control kind count is the number of steps related to the procedure version. |
| **DR-150 Control Taxonomy is Incomplete** | A procedure version is flagged control taxonomy is incomplete if the undeclared control kind count is greater than 0. |
| **DR-151 Has Approved Change Request** | A procedure version is considered to have an approved change request if the approved change request count is greater than 0. |
| **DR-152 Approved Change Request Count** | A procedure version's approved change request count is the number of change requests related to the procedure version. |
| **DR-153 Unwatched Unowned Control Count** | A procedure version's unwatched unowned control count is the number of requirements related to the procedure version. |
| **DR-154 Name** | A procedure version link's name is computed as the previous procedure version, followed by “ -> ”, followed by the next procedure version. |
| **DR-155 Superseded Version Key** | The procedure version link's superseded version key is determined by the following priority:<br>1. the previous procedure version, if the relation iri is “https://w3id.org/pko#nextVersion”;<br>2. in all other cases, an empty string. |
| **DR-156 Name** | A procedure status change's name is computed as the procedure version, followed by “: ”, followed by the from status, followed by “ -> ”, followed by the to status. |
| **DR-157 Name** | A step's name is computed as the step number, followed by “. ”, followed by the title. |
| **DR-158 Assigned Role Label** | A step's assigned role label — taken from the linked assigned role. |
| **DR-159 Assigned Agent Kind** | A step's assigned agent kind is the current agent kind of the step's assigned role. |
| **DR-160 Blocking Requirement Count** | A step's blocking requirement count is the number of step requirements related to the step. |
| **DR-161 Stale Binding Count** | A step's stale binding count is the number of operational bindings related to the step. |
| **DR-162 Authoritative Stale Count** | A step's authoritative stale count is the number of operational bindings related to the step. |
| **DR-163 Available Exception Count** | A step's available exception count is the number of exceptions related to the step. |
| **DR-164 Declared Verification Count** | A step's declared verification count is the number of step verifications related to the step. |
| **DR-165 Is Preparation Step** | A step is considered a preparation step if at least one of the following holds: the assigned role is “finance-analyst” or the assigned role is “variance-review-agent”. |
| **DR-166 Is Approval Step** | A step is considered an approval step if at least one of the following holds: the assigned role is “controller” or the assigned role is “cfo”. |
| **DR-167 Stale Authoritative Binding Count** | A step's stale authoritative binding count is the number of operational bindings related to the step. |
| **DR-168 Inputs are Fresh** | A step is considered to input are fresh if the stale authoritative binding count is 0. |
| **DR-169 Is Software Assigned** | A step is considered software-assigned if at least one of the following holds: the assigned agent kind is “AIAgent” or the assigned agent kind is “AutomatedPipeline”. |
| **DR-170 Is Human Approval Gate** | A step is considered a human approval gate if all of the following hold: the software assigned flag is not set and at least one of the following holds: the step ID is “policy-05” or the step ID is “close-06”. |
| **DR-171 Gate Held by Human** | A step is flagged gate held by human if all of the following hold: the human approval gate flag is set and the assigned agent kind is “Human”. |
| **DR-172 Binding Boundary Count** | A step's binding boundary count is the number of authority boundaries related to the step. |
| **DR-173 Assigned Role is Ungoverned** | A step's assigned role is ungoverned is true when the step's assigned role is an ungoverned non human role. |
| **DR-174 Unusable Binding Count** | A step's unusable binding count is the number of operational bindings related to the step. |
| **DR-175 All Sources Usable** | A step is flagged all sources usable if the unusable binding count is 0. |
| **DR-176 Unwarranted Boundary Count** | A step's unwarranted boundary count is the number of authority boundaries related to the step. |
| **DR-177 Is Governed by Unwarranted Boundary** | A step is considered a governed by unwarranted boundary if the unwarranted boundary count is greater than 0. |
| **DR-178 Software Execution Count** | A step's software execution count is the number of step executions related to the step. |
| **DR-179 Has Been Approached by Software** | A step is considered to have a been approached by software if the software execution count is greater than 0. |
| **DR-180 Is Unexercised Human Gate** | A step is considered an unexercised human gate if all of the following hold: the human approval gate flag is set and the been approached by software flag is not set. |
| **DR-181 Is Demonstrated Human Gate** | A step is considered a demonstrated human gate if all of the following hold: the human approval gate flag is set; the been approached by software flag is set; and the gate held by human flag is set. |
| **DR-182 Unexercised Gate Version Key** | The step's unexercised gate version key is determined by the following priority:<br>1. the procedure version, if the unexercised human gate flag is set;<br>2. in all other cases, an empty string. |
| **DR-183 Has Declared Control Kind** | A step is considered to have a declared control kind if the control kind has a value. |
| **DR-184 Undeclared Control Version Key** | The step's undeclared control version key is determined by the following priority:<br>1. an empty string, if the declared control kind flag is set;<br>2. in all other cases, the procedure version. |
| **DR-185 Approval Step is Software Assigned** | A step is flagged approval step is software assigned if all of the following hold: the control kind is “Approval” and the software assigned flag is set. |
| **DR-186 Unwitnessed Blocking Count** | A step's unwitnessed blocking count is the number of step requirements related to the step. |
| **DR-187 Name** | A step transition's name is computed as the from step, followed by “ -> ”, followed by the to step. |
| **DR-188 Is Recovery Path** | A step transition is considered a recovery path if at least one of the following holds: the transition kind is “Fallback” or the transition kind is “Alternative”. |
| **DR-189 Count of From Step Executions** | A step transition's count of from step executions is the number of step executions related to the step transition. |
| **DR-190 Count of to Step Executions** | A step transition's count of to step executions is the number of step executions related to the step transition. |
| **DR-191 Has Reachable Origin** | A step transition is considered to have a reachable origin if the count of from step executions is greater than 0. |
| **DR-192 Has Reachable Target** | A step transition is considered to have a reachable target if the count of to step executions is greater than 0. |
| **DR-193 Is Never Exercised** | A step transition is considered never-exercised if it is not the case that all of the following hold: the reachable origin flag is set and the reachable target flag is set. |
| **DR-194 Is Untested Recovery Path** | A step transition is considered an untested recovery path if all of the following hold: the recovery path flag is set and the never exercised flag is set. |
| **DR-195 Count of Observed Traversals** | A step transition's count of observed traversals is the number of observed transitions related to the step transition. |
| **DR-196 Has Been Traversed** | A step transition is considered to have been traversed if the count of observed traversals is greater than 0. |
| **DR-197 Is Unwalked Recovery Path** | A step transition is considered an unwalked recovery path if all of the following hold: the recovery path flag is set and the been traversed flag is not set. |
| **DR-198 Target Blocking Requirement Count** | A step transition's target blocking requirement count — taken from the linked to step. |
| **DR-199 Target Carries Blocking Control** | A step transition is flagged target carries blocking control if the target blocking requirement count is greater than 0. |
| **DR-200 Is Unrehearsed Control Entry** | A step transition is considered an unrehearsed control entry if all of the following hold: the unwalked recovery path flag is set and the target carries blocking control flag is set. |
| **DR-201 Unrehearsed Control Version Key** | The step transition's unrehearsed control version key is determined by the following priority:<br>1. the procedure version, if the unrehearsed control entry flag is set;<br>2. in all other cases, an empty string. |
| **DR-202 Name** | An action's name is the same as its label. |
| **DR-203 Name** | A function's name is the same as its label. |
| **DR-204 Name** | A tool's name is the same as its label. |
| **DR-205 Name** | A step action's name is computed as the step, followed by “ / ”, followed by the action. |
| **DR-206 Name** | A step function's name is computed as the step, followed by “ / ”, followed by the function. |
| **DR-207 Name** | A step tool's name is computed as the step, followed by “ / ”, followed by the tool. |
| **DR-208 Name** | A requirement's name is the same as its label. |
| **DR-209 Satisfaction Record Count** | A requirement's satisfaction record count is the number of requirement satisfactions related to the requirement. |
| **DR-210 Step Binding Count** | A requirement's step binding count is the number of step requirements related to the requirement. |
| **DR-211 Is Bound to Any Step** | A requirement is considered a bound to any step if the step binding count is greater than 0. |
| **DR-212 Has Ever Been Evaluated** | A requirement is considered to have ever been evaluated if the satisfaction record count is greater than 0. |
| **DR-213 Negative Outcome Count** | A requirement's negative outcome count is the number of requirement satisfactions related to the requirement. |
| **DR-214 Is Inoperative Control** | A requirement is considered an inoperative control if all of the following hold: the blocking flag is set; the bound to any step flag is set; and the ever been evaluated flag is not set. |
| **DR-215 Is Decorative Control** | A requirement is considered a decorative control if all of the following hold: the blocking flag is set and the bound to any step flag is not set. |
| **DR-216 Has Ever Produced Negative** | A requirement is considered to have ever produced negative if the negative outcome count is greater than 0. |
| **DR-217 Is Unfalsified Control** | A requirement is considered an unfalsified control if all of the following hold: the blocking flag is set; the ever been evaluated flag is set; and the ever produced negative flag is not set. |
| **DR-218 Claims a Witness Field** | A requirement is considered to claim a witness field if the witness field name has a value. |
| **DR-219 Named Witness Field Exists** | A requirement's named witness field exists is true when the requirement's witness field name is derived. |
| **DR-220 Derived Has Computed Witness** | A requirement is flagged derived has computed witness if all of the following hold: the claims a witness field flag is set and the named witness field exists flag is set. |
| **DR-221 Witness Claim is Unverified** | A requirement is considered to witnes claim is unverified if it is not the case that the has computed witness is the derived has computed witness. |
| **DR-222 Is Unwitnessed Blocking Control** | A requirement is considered an unwitnessed blocking control if all of the following hold: the blocking flag is set and the derived has computed witness flag is not set. |
| **DR-223 Witness Fire Count** | A requirement's witness fire count is the same as its negative outcome count. |
| **DR-224 Witness Has Never Fired** | A requirement is considered to witnes has never fired if all of the following hold: the computed witness flag is set and the witness fire count is 0. |
| **DR-225 Evaluation Sample Size** | A requirement's evaluation sample size is the same as its satisfaction record count. |
| **DR-226 Has Meaningful Sample** | A requirement is considered to have a meaningful sample if the evaluation sample size is at least the minimum sample for assurance. |
| **DR-227 Is Untested Witness** | A requirement is considered an untested witness if all of the following hold: the witness has never fired flag is set and the meaningful sample flag is not set. |
| **DR-228 Is Evidenced Holding Control** | A requirement is considered an evidenced holding control if all of the following hold: the witness has never fired flag is set and the meaningful sample flag is set. |
| **DR-229 Control Assurance State** | The requirement's control assurance state is determined by the following priority:<br>1. “Decorative”, if the bound to any step flag is not set;<br>2. “Inoperative”, if the ever been evaluated flag is not set;<br>3. “Asserted”, if the computed witness flag is not set;<br>4. “Demonstrated”, if the witness fire count is greater than 0;<br>5. “Holding”, if the meaningful sample flag is set;<br>6. in all other cases, “Untested”. |
| **DR-230 Unexercised Binding Count** | A requirement's unexercised binding count is the number of step requirements related to the requirement. |
| **DR-231 Witness is Partially Scoped** | A requirement is considered to witnes is partially scoped if all of the following hold: the computed witness flag is set and the unexercised binding count is greater than 0. |
| **DR-232 Accountable Agent** | A requirement's accountable agent is the current agent of the requirement's accountable role. |
| **DR-233 Has Named Owner** | A requirement is considered to have a named owner if the accountable role has a value. |
| **DR-234 Is Orphaned Blocking Control** | A requirement is considered an orphaned blocking control if all of the following hold: the blocking flag is set and the named owner flag is not set. |
| **DR-235 Is Unwatched and Unowned** | A requirement is considered unwatched-and-unowned if all of the following hold: the blocking flag is set; the computed witness flag is not set; and the named owner flag is not set. |
| **DR-236 Attestation Exposure Note** | The requirement's attestation exposure note is determined by the following priority:<br>1. an empty string, if the blocking flag is not set;<br>2. “Unwatched and unowned: exposure defaults to the signatory.”, if the unwatched and unowned flag is set;<br>3. “Witnessed but unowned: no named accountability.”, if the orphaned blocking control flag is set;<br>4. “Owned but unwitnessed: rests on human judgement.”, if the computed witness flag is not set;<br>5. in all other cases, an empty string. |
| **DR-237 Unwatched Unowned Flag** | The requirement's unwatched unowned flag is determined by the following priority:<br>1. “unwatched-unowned”, if the unwatched and unowned flag is set;<br>2. in all other cases, an empty string. |
| **DR-238 Name** | A step requirement's name is computed as the step, followed by “ / ”, followed by the requirement. |
| **DR-239 Requirement is Blocking** | A step requirement's requirement is blocking when the linked requirement is blocking. |
| **DR-240 Blocking Step Key** | The step requirement's blocking step key is determined by the following priority:<br>1. the step, if the requirement is blocking flag is set;<br>2. in all other cases, an empty string. |
| **DR-241 Step When Blocking** | The step requirement's step when blocking is determined by the following priority:<br>1. the step, if the requirement is blocking flag is set;<br>2. in all other cases, an empty string. |
| **DR-242 Requirement Lacks Witness** | A step requirement's requirement lacks witness is true when the step requirement's requirement is an unwitnessed blocking control. |
| **DR-243 Unwitnessed Step Key** | The step requirement's unwitnessed step key is determined by the following priority:<br>1. the step, if the requirement lacks witness flag is set;<br>2. in all other cases, an empty string. |
| **DR-244 Satisfaction Count for Binding** | A step requirement's satisfaction count for binding is the number of requirement satisfactions related to the step requirement. |
| **DR-245 Binding Was Ever Exercised** | A step requirement is flagged binding was ever exercised if the satisfaction count for binding is greater than 0. |
| **DR-246 Is Unexercised Blocking Binding** | A step requirement is considered unexercised-blocking-binding if all of the following hold: the requirement is blocking flag is set and the binding was ever exercised flag is not set. |
| **DR-247 Unexercised Binding Requirement Key** | The step requirement's unexercised binding requirement key is determined by the following priority:<br>1. the requirement, if the unexercised blocking binding flag is set;<br>2. in all other cases, an empty string. |
| **DR-248 Name** | A step verification's name is computed as the step, followed by “ / ”, followed by the verification kind. |
| **DR-249 Name** | A rationale's name is the same as its title. |
| **DR-250 Name** | An exception's name is the same as its condition. |
| **DR-251 Active Exception Step Key** | The exception's active exception step key is determined by the following priority:<br>1. the trigger step, if the status is “Active”;<br>2. in all other cases, an empty string. |
| **DR-252 Name** | A resource's name is the same as its title. |
| **DR-253 Is Approved Source** | A resource is considered an approved source if the approval status is “Approved”. |
| **DR-254 Name** | A procedure resource's name is computed as the procedure version, followed by “ / ”, followed by the resource. |
| **DR-255 Relation Iri** | The procedure resource's relation iri is determined by the following priority:<br>1. “https://w3id.org/pko#wasExtractedFrom”, if the relation is “wasExtractedFrom”;<br>2. in all other cases, “http://purl.org/dc/terms/references”. |
| **DR-256 Name** | An elicitation session's name is computed as the method, followed by “ / ”, followed by the started at. |
| **DR-257 As of Instant** | An elicitation session's as of instant — taken from the linked evaluation context. |
| **DR-258 Days Since Elicited** | An elicitation session's days since elicited is computed as the number of days from the ended at to the as of instant. |
| **DR-259 Is Single Witness Method** | An elicitation session is considered a single witness method if at least one of the following holds: the method is “Shadowing” or the method is “PractitionerInterview”. |
| **DR-260 Practitioner is Still Engaged** | An elicitation session's practitioner is still engaged when the linked practitioner agent is still engaged. |
| **DR-261 Valid Fragments Produced** | An elicitation session's valid fragments produced is the number of knowledge fragments related to the elicitation session. |
| **DR-262 Is High Yield Session** | An elicitation session is considered a high yield session if the valid fragments produced is at least 3. |
| **DR-263 Is Concentrated Single Witness** | An elicitation session is considered a concentrated single witness if all of the following hold: the single witness method flag is set and the high yield session flag is set. |
| **DR-264 Is Stale Concentrated Witness** | An elicitation session is considered a stale concentrated witness if all of the following hold: the concentrated single witness flag is set and the days since elicited is greater than 180. |
| **DR-265 Concentrated Session Version Key** | The elicitation session's concentrated session version key is determined by the following priority:<br>1. the procedure version, if the concentrated single witness flag is set;<br>2. in all other cases, an empty string. |
| **DR-266 Name** | A knowledge fragment's name is computed as the knowledge form, followed by “: ”, followed by the first 60 character(s) of the statement. |
| **DR-267 As of Instant** | A knowledge fragment's as of instant — taken from the linked evaluation context. |
| **DR-268 Is Currently Valid** | A knowledge fragment is considered currently-valid if all of the following hold: the valid from is at most the as of instant; at least one of the following holds: the valid to is blank or the valid to is greater than the as of instant; and the status is “Approved”. |
| **DR-269 Source Agent is Still Engaged** | A knowledge fragment's source agent is still engaged when the linked source agent is still engaged. |
| **DR-270 Source Agent Kind** | A knowledge fragment's source agent kind — taken from the linked source agent. |
| **DR-271 Has Human Source** | A knowledge fragment is considered to have a human source if the source agent kind is “Human”. |
| **DR-272 Has Orphaned Provenance** | A knowledge fragment is considered to have an orphaned provenance if all of the following hold: the currently valid flag is set and the source agent is still engaged flag is not set. |
| **DR-273 Is Undefendable Tacit Claim** | A knowledge fragment is considered an undefendable tacit claim if all of the following hold: the orphaned provenance flag is set and at least one of the following holds: the knowledge form is “Tacit” or the knowledge form is “SituatedJudgment”. |
| **DR-274 Is Approved** | A knowledge fragment is considered approved if the status is “Approved”. |
| **DR-275 Is Within Validity Window** | A knowledge fragment is considered a within validity window if all of the following hold: the valid from is at most the as of instant and at least one of the following holds: the valid to is blank or the valid to is greater than the as of instant. |
| **DR-276 Is Relied Upon** | A knowledge fragment is considered a relied upon if all of the following hold: the step has a value and the within validity window flag is set. |
| **DR-277 Step Procedure Version Status** | A knowledge fragment's step procedure version status — taken from the linked step. |
| **DR-278 Is Attached to Live Version** | A knowledge fragment's is attached to live version when the linked procedure version is live. |
| **DR-279 Is Unapproved But Relied on** | A knowledge fragment is considered an unapproved but relied on if all of the following hold: the relied upon flag is set; the attached to live version flag is set; and the approved flag is not set. |
| **DR-280 Evidence Age Days** | A knowledge fragment's evidence age days is the days since elicited of the knowledge fragment's elicitation session. |
| **DR-281 Has Recorded Elicitation** | A knowledge fragment is considered to have a recorded elicitation if the elicitation session has a value. |
| **DR-282 Is From Single Witness** | A knowledge fragment's is from single witness is true when the knowledge fragment's elicitation session is a single witness method. |
| **DR-283 Evidence Expiry Days** | The knowledge fragment's evidence expiry days is determined by the following priority:<br>1. 180, if the from single witness flag is set;<br>2. in all other cases, 365. |
| **DR-284 Evidence Has Expired** | A knowledge fragment is flagged evidence has expired if all of the following hold: the recorded elicitation flag is set and the evidence age days is greater than the evidence expiry days. |
| **DR-285 Owner Agent** | A knowledge fragment's owner agent is the current agent of the knowledge fragment's owner role. |
| **DR-286 Is Awaiting Approval** | A knowledge fragment is considered an awaiting approval if the status is “Reviewed”. |
| **DR-287 Owner is Me** | A knowledge fragment is flagged owner is me if the owner role is “hr-policy-owner”. |
| **DR-288 Is My Unfinished Approval** | A knowledge fragment is considered a my unfinished approval if all of the following hold: the owner is me flag is set and the awaiting approval flag is set. |
| **DR-289 Is Invoked by an Exception** | A knowledge fragment's is invoked by an exception is the number of exceptions related to the knowledge fragment. |
| **DR-290 Has Operational Reliance** | A knowledge fragment is considered to have an operational reliance if the is invoked by an exception is greater than 0. |
| **DR-291 Is Unapproved and Operationally Live** | A knowledge fragment is considered unapproved-and-operationally-live if all of the following hold: the my unfinished approval flag is set and the operational reliance flag is set. |
| **DR-292 Age Days** | A knowledge fragment's age days is computed as the number of days from the valid from to the as of instant. |
| **DR-293 Is Low Confidence** | A knowledge fragment is considered a low confidence if at least one of the following holds: the confidence is “Medium” or the confidence is “Low”. |
| **DR-294 Owning Version Cadence Days** | A knowledge fragment's owning version cadence days is the steward review cadence days of the knowledge fragment's procedure version. |
| **DR-295 Exceeds Owning Cadence** | A knowledge fragment is considered to exceed an owning cadence if the age days is greater than the owning version cadence days. |
| **DR-296 Is Aging Low Confidence Claim** | A knowledge fragment is considered an aging low confidence claim if all of the following hold: the exceeds owning cadence flag is set and the low confidence flag is set. |
| **DR-297 Owner Role Agent Kind** | A knowledge fragment's owner role agent kind is the current agent kind of the knowledge fragment's owner role. |
| **DR-298 Is Human Owned** | A knowledge fragment is considered human-owned if the owner role agent kind is “Human”. |
| **DR-299 Is Ai Validated by Ai** | A knowledge fragment is considered an ai validated by ai if all of the following hold: it is not the case that the source agent kind is “Human” and the human owned flag is not set. |
| **DR-300 Review Cadence Days** | A knowledge fragment's review cadence days is the steward review cadence days of the knowledge fragment's procedure version. |
| **DR-301 Is Overdue for Review** | A knowledge fragment is considered an overdue for review if all of the following hold: the currently valid flag is set and the age days is greater than the review cadence days. |
| **DR-302 Predates Current Role Holder** | A knowledge fragment is considered to predate a current role holder if all of the following hold: the owner role agent kind has a value and the valid from is less than the owner role assignment valid from. |
| **DR-303 Owner Role Assignment Valid From** | A knowledge fragment's owner role assignment valid from is the current assignment valid from of the knowledge fragment's owner role. |
| **DR-304 Fragility Signal Count** | A knowledge fragment's fragility signal count is computed as the count of the following that hold: the from single witness flag is set; the overdue for review flag is set; the low confidence flag is set; and the operational reliance flag is set. |
| **DR-305 Is Compound Fragile** | A knowledge fragment is considered a compound fragile if the fragility signal count is at least 3. |
| **DR-306 Is Single Point of Failure** | A knowledge fragment is considered a single point of failure if all of the following hold: the from single witness flag is set and the operational reliance flag is set. |
| **DR-307 Is Expiring Single Point of Failure** | A knowledge fragment is considered an expiring single point of failure if all of the following hold: the single point of failure flag is set and the overdue for review flag is set. |
| **DR-308 Compound Fragile Version Key** | The knowledge fragment's compound fragile version key is determined by the following priority:<br>1. the procedure version, if the compound fragile flag is set;<br>2. in all other cases, an empty string. |
| **DR-309 Valid Fragment Session Key** | The knowledge fragment's valid fragment session key is determined by the following priority:<br>1. the elicitation session, if the currently valid flag is set;<br>2. in all other cases, an empty string. |
| **DR-310 Consuming Step is Software Assigned** | A knowledge fragment's consuming step is software assigned when the linked step is software assigned. |
| **DR-311 Consuming Step Agent Kind** | A knowledge fragment's consuming step agent kind is the assigned agent kind of the knowledge fragment's step. |
| **DR-312 Is Unapproved and Machine Consumed** | A knowledge fragment is considered unapproved-and-machine-consumed if all of the following hold: the unapproved but relied on flag is set and the consuming step is software assigned flag is set. |
| **DR-313 Is Unapproved and Human Consumed** | A knowledge fragment is considered unapproved-and-human-consumed if all of the following hold: the unapproved but relied on flag is set and the consuming step is software assigned flag is not set. |
| **DR-314 Machine Consumed Unapproved Version Key** | The knowledge fragment's machine consumed unapproved version key is determined by the following priority:<br>1. the procedure version, if the unapproved and machine consumed flag is set;<br>2. in all other cases, an empty string. |
| **DR-315 Has Review Record** | A knowledge fragment is considered to have a review record if the last reviewed at has a value. |
| **DR-316 Days Since Actual Review** | The knowledge fragment's days since actual review is determined by the following priority:<br>1. the number of days from the last reviewed at to the as of instant, if the review record flag is set;<br>2. in all other cases, 0. |
| **DR-317 Is Unreviewed Since Authoring** | A knowledge fragment is considered unreviewed-since-authoring if all of the following hold: the currently valid flag is set and the review record flag is not set. |
| **DR-318 Is Genuinely Overdue** | A knowledge fragment is considered a genuinely overdue if all of the following hold: the currently valid flag is set; the review record flag is set; and the days since actual review is greater than the review cadence days. |
| **DR-319 Review Recency is Inferred** | A knowledge fragment is flagged review recency is inferred if all of the following hold: the overdue for review flag is set and the review record flag is not set. |
| **DR-320 Inference Disagrees With Record** | A knowledge fragment is flagged inference disagrees with record if all of the following hold: the review record flag is set; the overdue for review flag is set; and the genuinely overdue flag is not set. |
| **DR-321 Genuinely Overdue Version Key** | The knowledge fragment's genuinely overdue version key is determined by the following priority:<br>1. the procedure version, if the genuinely overdue flag is set;<br>2. in all other cases, an empty string. |
| **DR-322 Ratified Boundary Count** | A knowledge fragment's ratified boundary count is the number of authority boundaries related to the knowledge fragment. |
| **DR-323 Reliance Surface Count** | A knowledge fragment's reliance surface count is computed as the is invoked by an exception plus the ratified boundary count. |
| **DR-324 Days Awaiting My Approval** | The knowledge fragment's days awaiting my approval is determined by the following priority:<br>1. the number of days from the valid from to the as of instant, if the my unfinished approval flag is set;<br>2. in all other cases, 0. |
| **DR-325 Is High Blast Radius Unapproved** | A knowledge fragment is considered high-blast-radius-unapproved if all of the following hold: the unapproved and operationally live flag is set and the reliance surface count is greater than 1. |
| **DR-326 Is Long Unapproved** | A knowledge fragment is considered long-unapproved if all of the following hold: the my unfinished approval flag is set and the days awaiting my approval is greater than 30. |
| **DR-327 Unapproved Load Bearing Version Key** | The knowledge fragment's unapproved load bearing version key is determined by the following priority:<br>1. the procedure version, if the high blast radius unapproved flag is set;<br>2. in all other cases, an empty string. |
| **DR-328 Owner Role is Vacated** | A knowledge fragment's owner role is vacated when the linked owner role is a vacated role. |
| **DR-329 Is Orphaned by Role** | A knowledge fragment is considered an orphaned by role if all of the following hold: the currently valid flag is set and the owner role is vacated flag is set. |
| **DR-330 Valid Fragment Version Key** | The knowledge fragment's valid fragment version key is determined by the following priority:<br>1. the procedure version, if the currently valid flag is set;<br>2. in all other cases, an empty string. |
| **DR-331 Name** | A knowledge gap's name is computed as the severity, followed by “: ”, followed by the first 60 character(s) of the statement. |
| **DR-332 Is Open** | A knowledge gap is considered open if at least one of the following holds: the status is “Open” or the status is “Investigating”. |
| **DR-333 Open Gap Version Key** | The knowledge gap's open gap version key is determined by the following priority:<br>1. the procedure version, if all of the following hold: the open flag is set and the severity is “High”;<br>2. in all other cases, an empty string. |
| **DR-334 Is Blocking** | A knowledge gap is considered blocking if the blocking kind is “Blocking”. |
| **DR-335 Is Open and Blocking** | A knowledge gap is considered open-and-blocking if all of the following hold: the open flag is set and the blocking flag is set. |
| **DR-336 As of Instant** | A knowledge gap's as of instant — taken from the linked evaluation context. |
| **DR-337 Days Open** | The knowledge gap's days open is determined by the following priority:<br>1. the number of days from the identified at to the as of instant, if the open flag is set;<br>2. in all other cases, 0. |
| **DR-338 Tolerance Days** | The knowledge gap's tolerance days is determined by the following priority:<br>1. 30, if the severity is “High”;<br>2. 90, if the severity is “Medium”;<br>3. in all other cases, 180. |
| **DR-339 Is Overdue Gap** | A knowledge gap is considered an overdue gap if the days open is greater than the tolerance days. |
| **DR-340 Owner Agent** | A knowledge gap's owner agent is the current agent of the knowledge gap's owner role. |
| **DR-341 Owner is Still Engaged** | A knowledge gap's owner is still engaged when the linked owner agent is still engaged. |
| **DR-342 Has Resolution Plan** | A knowledge gap is considered to have a resolution plan if the resolution plan has a value. |
| **DR-343 Is Abandoned Unknown** | A knowledge gap is considered an abandoned unknown if all of the following hold: the overdue gap flag is set and at least one of the following holds: the resolution plan flag is not set or the owner is still engaged flag is not set. |
| **DR-344 Open Blocking Gap Version Key** | The knowledge gap's open blocking gap version key is determined by the following priority:<br>1. the procedure version, if the open and blocking flag is set;<br>2. in all other cases, an empty string. |
| **DR-345 Owner Role is Vacated** | A knowledge gap's owner role is vacated when the linked owner role is a vacated role. |
| **DR-346 Is Ownerless Open Gap** | A knowledge gap is considered an ownerless open gap if all of the following hold: the open flag is set and the owner role is vacated flag is set. |
| **DR-347 Name** | An FA q's name is the same as its question. |
| **DR-348 Name** | An explanation's name is the same as its title. |
| **DR-349 Name** | A procedure execution's name is computed as the procedure version, followed by “ / ”, followed by the context. |
| **DR-350 Expected Step Count** | A procedure execution's expected step count is the specified step count of the procedure execution's procedure version. |
| **DR-351 Completed Step Count** | A procedure execution's completed step count is the number of step executions related to the procedure execution. |
| **DR-352 Control Breach Count** | A procedure execution's control breach count is the number of step executions related to the procedure execution. |
| **DR-353 Late Step Count** | A procedure execution's late step count is the number of step executions related to the procedure execution. |
| **DR-354 Is Structurally Complete** | A procedure execution is considered a structurally complete if the completed step count is at least the expected step count. |
| **DR-355 Diverged From Specification** | A procedure execution is flagged diverged from specification if at least one of the following holds: the structurally complete flag is not set or the control breach count is greater than 0. |
| **DR-356 All Blocking Controls Evaluated** | A procedure execution is flagged all blocking controls evaluated if the unevaluated blocking total is 0. |
| **DR-357 Unevaluated Blocking Total** | A procedure execution's unevaluated blocking total is the number of step executions related to the procedure execution. |
| **DR-358 Separation of Duties Held** | A procedure execution is flagged separation of duties held if the separation violation count is 0. |
| **DR-359 Separation Violation Count** | A procedure execution's separation violation count is the number of step executions related to the procedure execution. |
| **DR-360 Is Attestation Ready** | A procedure execution is considered an attestation ready if all of the following hold: the structurally complete flag is set; the diverged from specification flag is not set; the all blocking controls evaluated flag is set; and the separation of duties held flag is set. |
| **DR-361 Attestation Blocker Summary** | The procedure execution's attestation blocker summary is determined by the following priority:<br>1. an empty string, if the attestation ready flag is set;<br>2. “Incomplete: specified steps did not all complete.”, if the structurally complete flag is not set;<br>3. “Segregation of duties violated.”, if the separation violation count is greater than 0;<br>4. “Blocking controls were never evaluated.”, if the unevaluated blocking total is greater than 0;<br>5. in all other cases, “Control breach recorded on one or more steps.”. |
| **DR-362 Executed Version is Fit** | A procedure execution's executed version is fit is true when the procedure execution's procedure version is a fit to execute. |
| **DR-363 Signed Against Unfit Version** | A procedure execution is flagged signed against unfit version if all of the following hold: the execution status is “Completed” and the executed version is fit flag is not set. |
| **DR-364 Asserted Only Control Count** | A procedure execution's asserted only control count is the number of requirement satisfactions related to the procedure execution. |
| **DR-365 Assurance is Mostly Asserted** | A procedure execution is flagged assurance is mostly asserted if the asserted only control count is greater than 0. |
| **DR-366 Unreachable Handling Failure Count** | A procedure execution's unreachable handling failure count is the number of message deliveries related to the procedure execution. |
| **DR-367 Retention Breach Count** | A procedure execution's retention breach count is the number of message deliveries related to the procedure execution. |
| **DR-368 Cleared Legal Review Count** | A procedure execution's cleared legal review count is the number of step executions related to the procedure execution. |
| **DR-369 Has Cleared Legal Review** | A procedure execution is considered to have a cleared legal review if the cleared legal review count is greater than 0. |
| **DR-370 Abandoned Failure Count** | A procedure execution's abandoned failure count is the number of message deliveries related to the procedure execution. |
| **DR-371 Delivered Count** | A procedure execution's delivered count is the number of message deliveries related to the procedure execution. |
| **DR-372 Total Delivery Attempt Count** | A procedure execution's total delivery attempt count is the number of message deliveries related to the procedure execution. |
| **DR-373 Has Abandoned Failures** | A procedure execution is considered to have an abandoned failures if the abandoned failure count is greater than 0. |
| **DR-374 Mishandled Refusal Count** | A procedure execution's mishandled refusal count is the number of send intents related to the procedure execution. |
| **DR-375 Unclean Step Count** | A procedure execution's unclean step count is the number of step executions related to the procedure execution. |
| **DR-376 Ran Clean** | A procedure execution is flagged ran clean if the unclean step count is 0. |
| **DR-377 Count of Approval Executions** | A procedure execution's count of approval executions is the number of step executions related to the procedure execution. |
| **DR-378 Has Human Approval** | A procedure execution is considered to have a human approval if the count of approval executions is greater than 0. |
| **DR-379 Count of Delivery Executions** | A procedure execution's count of delivery executions is the number of step executions related to the procedure execution. |
| **DR-380 Has Delivered** | A procedure execution is considered to have delivered if the count of delivery executions is greater than 0. |
| **DR-381 Delivered Without Approval** | A procedure execution is flagged delivered without approval if all of the following hold: the delivered flag is set and the human approval flag is not set. |
| **DR-382 Invalid Approval Count** | A procedure execution's invalid approval count is the number of requirement satisfactions related to the procedure execution. |
| **DR-383 Approval Chain is Complete** | A procedure execution is flagged approval chain is complete if the invalid approval count is 0. |
| **DR-384 Vacuously Clean Step Count** | A procedure execution's vacuously clean step count is the number of step executions related to the procedure execution. |
| **DR-385 Preparation Step Count** | A procedure execution's preparation step count is the number of step executions related to the procedure execution. |
| **DR-386 Approval Step Count** | A procedure execution's approval step count is the number of step executions related to the procedure execution. |
| **DR-387 Separation Was Testable** | A procedure execution is flagged separation was testable if all of the following hold: the preparation step count is greater than 0 and the approval step count is greater than 0. |
| **DR-388 Separation Held Under Test** | A procedure execution is flagged separation held under test if all of the following hold: the separation was testable flag is set and the separation of duties held flag is set. |
| **DR-389 Separation is Vacuously Green** | A procedure execution is flagged separation is vacuously green if all of the following hold: the separation of duties held flag is set and the separation was testable flag is not set. |
| **DR-390 Separation Assurance Note** | The procedure execution's separation assurance note is determined by the following priority:<br>1. “Violated: same agent prepared and approved.”, if the separation violation count is greater than 0;<br>2. “Not tested: this run had no preparation/approval pair.”, if the separation is vacuously green flag is set;<br>3. in all other cases, “Held under test.”. |
| **DR-391 Ungoverned Divergence Count** | A procedure execution's ungoverned divergence count is the number of step executions related to the procedure execution. |
| **DR-392 Divergence Was Fully Governed** | A procedure execution is flagged divergence was fully governed if all of the following hold: the diverged from specification flag is set and the ungoverned divergence count is 0. |
| **DR-393 Computedly Witnessed Control Count** | A procedure execution's computedly witnessed control count is the number of requirement satisfactions related to the procedure execution. |
| **DR-394 Evaluated Control Count** | A procedure execution's evaluated control count is computed as the computedly witnessed control count plus the asserted only control count. |
| **DR-395 Computed Assurance Ratio** | The procedure execution's computed assurance ratio is determined by the following priority:<br>1. 0, if the evaluated control count is 0;<br>2. in all other cases, the computedly witnessed control count divided by the evaluated control count. |
| **DR-396 Interested Party Assertion Count** | A procedure execution's interested party assertion count is the number of requirement satisfactions related to the procedure execution. |
| **DR-397 Assurance Grade** | The procedure execution's assurance grade is determined by the following priority:<br>1. “None: no blocking control was evaluated.”, if the evaluated control count is 0;<br>2. “Weak: at least one control rests on an interested-party assertion.”, if the interested party assertion count is greater than 0;<br>3. “Thin: most controls rest on human assertion.”, if the computed assurance ratio is less than 0.5;<br>4. “Mixed: computed and asserted controls.”, if the computed assurance ratio is less than 1;<br>5. in all other cases, “Computed: every evaluated control has a witness.”. |
| **DR-398 Attestation Would Be Weakly Based** | A procedure execution is flagged attestation would be weakly based if all of the following hold: the attestation ready flag is set and at least one of the following holds: the interested party assertion count is greater than 0 or the computed assurance ratio is less than 0.5. |
| **DR-399 Independent Human Observation Count** | A procedure execution's independent human observation count is the number of verification outcomes related to the procedure execution. |
| **DR-400 Has Any Independent Observation** | A procedure execution is considered to have any independent observation if the independent human observation count is greater than 0. |
| **DR-401 Self Attested Approval Count** | A procedure execution's self attested approval count is the number of step executions related to the procedure execution. |
| **DR-402 Assurance Chain is Circular** | A procedure execution is flagged assurance chain is circular if all of the following hold: the self attested approval count is greater than 0 and the any independent observation flag is not set. |
| **DR-403 Latest Attestation Instant** | A procedure execution's latest attestation instant is the largest signed at across the attestations related to the procedure execution. |
| **DR-404 Has Been Attested** | A procedure execution is considered to have been attested if the attestation count is greater than 0. |
| **DR-405 Attestation Count** | A procedure execution's attestation count is the number of attestations related to the procedure execution. |
| **DR-406 Post Attestation Score Count** | A procedure execution's post attestation score count is the number of requirement satisfactions related to the procedure execution. |
| **DR-407 Basis Changed After Signature** | A procedure execution is considered to basi a changed after signature if all of the following hold: the been attested flag is set and the post attestation score count is greater than 0. |
| **DR-408 Requires Re Attestation** | A procedure execution is considered to require a re attestation if all of the following hold: the basis changed after signature flag is set and the attestation ready flag is not set. |
| **DR-409 Intended Recipient Count** | A procedure execution's intended recipient count is the number of send intents related to the procedure execution. |
| **DR-410 Reached Recipient Count** | A procedure execution's reached recipient count is the number of send intents related to the procedure execution. |
| **DR-411 Silently Dropped Count** | A procedure execution's silently dropped count is the number of send intents related to the procedure execution. |
| **DR-412 Delivery Yield Percent** | The procedure execution's delivery yield percent is determined by the following priority:<br>1. the reached recipient count times 100 divided by the intended recipient count, if the intended recipient count is greater than 0;<br>2. in all other cases, 0. |
| **DR-413 Campaign Silently Lost Audience** | A procedure execution is flagged campaign silently lost audience if the silently dropped count is greater than 0. |
| **DR-414 Unrecorded Refusal Count** | A procedure execution's unrecorded refusal count is the number of send intents related to the procedure execution. |
| **DR-415 Has Unrecorded Refusals** | A procedure execution is considered to have an unrecorded refusals if the unrecorded refusal count is greater than 0. |
| **DR-416 Independently Confirmed Intent Count** | A procedure execution's independently confirmed intent count is the number of send intents related to the procedure execution. |
| **DR-417 Send Decisions are Entirely Self Witnessed** | A procedure execution is flagged send decisions are entirely self witnessed if all of the following hold: the intended recipient count is greater than 0 and the independently confirmed intent count is 0. |
| **DR-418 Name** | A step execution's name is computed as the procedure execution, followed by “ / ”, followed by the step. |
| **DR-419 Actual Duration Minutes** | The step execution's actual duration minutes is determined by the following priority:<br>1. 0, if the ended at is blank;<br>2. in all other cases, the number of minutes from the started at to the ended at. |
| **DR-420 Expected Duration Minutes** | A step execution's expected duration minutes — taken from the linked step. |
| **DR-421 Is Late** | A step execution is considered a late if the actual duration minutes is greater than the expected duration minutes. |
| **DR-422 Blocking Unmet Count** | A step execution's blocking unmet count is the number of the step execution's requirement satisfactions that are blocking and unmets. |
| **DR-423 Blocking Unmet Count Safe** | A step execution's blocking unmet count safe is the number of requirement satisfactions related to the step execution. |
| **DR-424 Proceeded Past Blocking Control** | A step execution is flagged proceeded past blocking control if all of the following hold: the execution status is “Completed” and the blocking unmet count safe is greater than 0. |
| **DR-425 Expected Blocking Count** | A step execution's expected blocking count is the blocking requirement count of the step execution's step. |
| **DR-426 Evaluated Blocking Count** | A step execution's evaluated blocking count is the number of requirement satisfactions related to the step execution. |
| **DR-427 Unevaluated Blocking Count** | A step execution's unevaluated blocking count is computed as the expected blocking count minus the evaluated blocking count. |
| **DR-428 Has Unevaluated Blocking Control** | A step execution is considered to have an unevaluated blocking control if the unevaluated blocking count is greater than 0. |
| **DR-429 Stale Authoritative Source Count** | A step execution's stale authoritative source count — taken from the linked step. |
| **DR-430 Ran on Stale Authoritative Source** | A step execution is flagged ran on stale authoritative source if the stale authoritative source count is greater than 0. |
| **DR-431 Has Deviation Note** | A step execution is considered to have a deviation note if the deviation has a value. |
| **DR-432 Is Late and Unexplained** | A step execution is considered late-and-unexplained if all of the following hold: the late flag is set and the deviation note flag is not set. |
| **DR-433 Available Exception Count for Step** | A step execution's available exception count for step — taken from the linked step. |
| **DR-434 Had Uninvoked Exception Available** | A step execution is flagged had uninvoked exception available if all of the following hold: the late and unexplained flag is set and the available exception count for step is greater than 0. |
| **DR-435 Expected Verification Count** | A step execution's expected verification count is the declared verification count of the step execution's step. |
| **DR-436 Performed Verification Count** | A step execution's performed verification count is the number of verification outcomes related to the step execution. |
| **DR-437 Skipped Verification Count** | A step execution's skipped verification count is computed as the expected verification count minus the performed verification count. |
| **DR-438 Has Skipped Verification** | A step execution is considered to have a skipped verification if the skipped verification count is greater than 0. |
| **DR-439 Claims Pass Without Evidence** | A step execution is considered to claim a pass without evidence if all of the following hold: the verification result is “PASS” and the skipped verification flag is set. |
| **DR-440 Step is Preparation** | A step execution's step is preparation when the linked step is a preparation step. |
| **DR-441 Step is Approval** | A step execution's step is approval is true when the step execution's step is an approval step. |
| **DR-442 Preparer Agent Key** | The step execution's preparer agent key is determined by the following priority:<br>1. the procedure execution, followed by “|”, followed by the executed by agent, if the step is preparation flag is set;<br>2. in all other cases, an empty string. |
| **DR-443 Approver Agent Key** | The step execution's approver agent key is determined by the following priority:<br>1. the procedure execution, followed by “|”, followed by the executed by agent, if the step is approval flag is set;<br>2. in all other cases, an empty string. |
| **DR-444 Prepared by This Agent Count** | A step execution's prepared by this agent count is the number of step executions related to the step execution. |
| **DR-445 Violates Separation of Duties** | A step execution is considered to violate a separation of duties if all of the following hold: the step is approval flag is set and the prepared by this agent count is greater than 0. |
| **DR-446 Required Role for Step** | A step execution's required role for step is the assigned role of the step execution's step. |
| **DR-447 Executor Role Key** | A step execution's executor role key is computed as the executed by agent, followed by “|”, followed by the required role for step. |
| **DR-448 Executor Authority Count** | A step execution's executor authority count is the number of role assignments related to the step execution. |
| **DR-449 Executor Held Required Role** | A step execution is flagged executor held required role if the executor authority count is greater than 0. |
| **DR-450 Is Unauthorized Approval** | A step execution is considered an unauthorized approval if all of the following hold: the step is approval flag is set and the executor held required role flag is not set. |
| **DR-451 Completed Execution Key** | The step execution's completed execution key is determined by the following priority:<br>1. the procedure execution, if the execution status is “Completed”;<br>2. in all other cases, an empty string. |
| **DR-452 Control Breach Execution Key** | The step execution's control breach execution key is determined by the following priority:<br>1. the procedure execution, if at least one of the following holds: the proceeded past blocking control flag is set; the violates separation of duties flag is set; the unauthorized approval flag is set; or the claims pass without evidence flag is set;<br>2. in all other cases, an empty string. |
| **DR-453 Late Execution Key** | The step execution's late execution key is determined by the following priority:<br>1. the procedure execution, if the late flag is set;<br>2. in all other cases, an empty string. |
| **DR-454 Executor Agent Kind** | A step execution's executor agent kind — taken from the linked executed by agent. |
| **DR-455 Executor is Human** | A step execution is flagged executor is human if the executor agent kind is “Human”. |
| **DR-456 Step Requires Human Confirmation** | A step execution's step requires human confirmation when the linked step requires human confirmation. |
| **DR-457 Non Human Ran Human Step** | A step execution is flagged non human ran human step if all of the following hold: the step requires human confirmation flag is set and the executor is human flag is not set. |
| **DR-458 Non Human Approval** | A step execution is flagged non human approval if all of the following hold: the step is approval flag is set and the executor is human flag is not set. |
| **DR-459 Unevaluated Blocking Execution Key** | The step execution's unevaluated blocking execution key is determined by the following priority:<br>1. the procedure execution, if the unevaluated blocking control flag is set;<br>2. in all other cases, an empty string. |
| **DR-460 Separation Violation Execution Key** | The step execution's separation violation execution key is determined by the following priority:<br>1. the procedure execution, if the violates separation of duties flag is set;<br>2. in all other cases, an empty string. |
| **DR-461 Self Witnessed Verification Count** | A step execution's self witnessed verification count is the number of verification outcomes related to the step execution. |
| **DR-462 Unbacked Verification Count** | A step execution's unbacked verification count is the number of verification outcomes related to the step execution. |
| **DR-463 Approval Rests on Self Attestation** | A step execution is flagged approval rests on self attestation if all of the following hold: the step is approval flag is set and at least one of the following holds: the self witnessed verification count is greater than 0 or the skipped verification flag is set. |
| **DR-464 Exception Invocation Count** | A step execution's exception invocation count is the number of exception invocations related to the step execution. |
| **DR-465 Ran Under Exception** | A step execution is flagged ran under exception if the exception invocation count is greater than 0. |
| **DR-466 Is Completed** | A step execution is considered completed if the execution status is “Completed”. |
| **DR-467 Is Verification Passed** | A step execution is considered verification-passed if the verification result is “PASS”. |
| **DR-468 Is Legal Review Step** | A step execution is considered a legal review step if the step is “policy-04”. |
| **DR-469 Cleared Legal Review Key** | The step execution's cleared legal review key is determined by the following priority:<br>1. the procedure execution, if all of the following hold: the legal review step flag is set and the verification passed flag is set;<br>2. in all other cases, an empty string. |
| **DR-470 Assigned Role** | A step execution's assigned role — taken from the linked step. |
| **DR-471 Role Current Agent** | A step execution's role current agent — taken from the linked assigned role. |
| **DR-472 Executor is Designated Agent** | A step execution is flagged executor is designated agent if the executed by agent is the role current agent. |
| **DR-473 Inputs Were Fresh At Run** | A step execution's inputs were fresh at run is true when the step execution's step is a fresh. |
| **DR-474 Ran on Stale Inputs** | A step execution is flagged ran on stale inputs if all of the following hold: the execution status is “Completed” and the inputs were fresh at run flag is not set. |
| **DR-475 Unresolved Issue Count** | A step execution's unresolved issue count is the number of issue occurrences related to the step execution. |
| **DR-476 Has Deviation** | A step execution is considered to have a deviation if the deviation has a value. |
| **DR-477 Is Clean** | A step execution is considered a clean if all of the following hold: the verification result is “PASS”; the deviation flag is not set; the unresolved issue count is 0; and the late flag is not set. |
| **DR-478 Procedure Execution When Unclean** | The step execution's procedure execution when unclean is determined by the following priority:<br>1. an empty string, if the clean flag is set;<br>2. in all other cases, the procedure execution. |
| **DR-479 Evaluated Requirement Count** | A step execution's evaluated requirement count is the number of requirement satisfactions related to the step execution. |
| **DR-480 Required Blocking Count** | A step execution's required blocking count is the blocking requirement count of the step execution's step. |
| **DR-481 Has Unevaluated Blocking Requirement** | A step execution is considered to have an unevaluated blocking requirement if the evaluated requirement count is less than the required blocking count. |
| **DR-482 Executing Agent Kind** | A step execution's executing agent kind — taken from the linked executed by agent. |
| **DR-483 Was Executed by Software** | A step execution is considered to have been executed by software if at least one of the following holds: the executing agent kind is “AIAgent” or the executing agent kind is “AutomatedPipeline”. |
| **DR-484 Step is Software Assigned** | A step execution's step is software assigned when the linked step is software assigned. |
| **DR-485 Software Did Human Work** | A step execution is flagged software did human work if all of the following hold: the was executed by software flag is set and the step is software assigned flag is not set. |
| **DR-486 Is Approval Execution** | A step execution's is approval execution is true when the step execution's step is a human approval gate. |
| **DR-487 Is Verified** | A step execution is considered verified if all of the following hold: the verification result has a value; the verification result is not “PENDING”; and the verification result is not “FAIL”. |
| **DR-488 Unconfirmed Non Human Decision Count** | A step execution's unconfirmed non human decision count is the number of agent decision records related to the step execution. |
| **DR-489 Requires Human Confirmation** | A step execution's requires human confirmation when the linked step requires human confirmation. |
| **DR-490 Human Confirmation Missing** | A step execution is flagged human confirmation missing if all of the following hold: the requires human confirmation flag is set and the unconfirmed non human decision count is greater than 0. |
| **DR-491 Drafted From Unusable Source** | A step execution is flagged drafted from unusable source if all of the following hold: the execution status is “Completed” and the inputs were usable flag is not set. |
| **DR-492 Inputs Were Usable** | A step execution's inputs were usable is true when the step execution's step is all sources usable. |
| **DR-493 Software Execution Step Key** | The step execution's software execution step key is determined by the following priority:<br>1. the step, if the was executed by software flag is set;<br>2. in all other cases, an empty string. |
| **DR-494 Step Control Kind** | A step execution's step control kind — taken from the linked step. |
| **DR-495 Unfalsified Clearance Count** | A step execution's unfalsified clearance count is the number of requirement satisfactions related to the step execution. |
| **DR-496 All Clearances are Unfalsified** | A step execution is flagged all clearances are unfalsified if all of the following hold: the evaluated blocking count is greater than 0 and the unfalsified clearance count is at least the evaluated blocking count. |
| **DR-497 Stale At Run Count** | A step execution's stale at run count is the number of binding observations related to the step execution. |
| **DR-498 Was Stale When I Ran It** | A step execution is considered to have been stale when i ran it if the stale at run count is greater than 0. |
| **DR-499 Staleness Answer is Tense Dependent** | A step execution is considered to stalenes an answer is tense dependent if it is not the case that the was stale when i ran it is the ran on stale authoritative source. |
| **DR-500 Has Any Declared Check** | A step execution is considered to have any declared check if at least one of the following holds: the expected verification count is greater than 0 or the expected blocking count is greater than 0. |
| **DR-501 Performed Check Count** | A step execution's performed check count is computed as the performed verification count plus the evaluated blocking count. |
| **DR-502 Declared Check Count** | A step execution's declared check count is computed as the expected verification count plus the expected blocking count. |
| **DR-503 Is Unchecked by Design** | A step execution is considered an unchecked by design if the declared check count is 0. |
| **DR-504 Is Vacuously Clean** | A step execution is considered a vacuously clean if all of the following hold: the clean flag is set and the unchecked by design flag is set. |
| **DR-505 Is Substantively Clean** | A step execution is considered a substantively clean if all of the following hold: the clean flag is set; the performed check count is at least the declared check count; and the declared check count is greater than 0. |
| **DR-506 Vacuously Clean Execution Key** | The step execution's vacuously clean execution key is determined by the following priority:<br>1. the procedure execution, if the vacuously clean flag is set;<br>2. in all other cases, an empty string. |
| **DR-507 Uncorroborated Pass Count** | A step execution's uncorroborated pass count is the number of verification outcomes related to the step execution. |
| **DR-508 Evidence Position is Weak** | A step execution is flagged evidence position is weak if all of the following hold: the performed verification count is greater than 0 and the uncorroborated pass count is at least the performed verification count. |
| **DR-509 Preparation Execution Key** | The step execution's preparation execution key is determined by the following priority:<br>1. the procedure execution, if the step is preparation flag is set;<br>2. in all other cases, an empty string. |
| **DR-510 Approval Execution Key** | The step execution's approval execution key is determined by the following priority:<br>1. the procedure execution, if the step is approval flag is set;<br>2. in all other cases, an empty string. |
| **DR-511 Has Governing Instrument** | A step execution is considered to have a governing instrument if at least one of the following holds: the ran under exception flag is set or the approved change coverage flag is set. |
| **DR-512 Has Approved Change Coverage** | A step execution's has approved change coverage is true when the step execution's version of step has an approved change request. |
| **DR-513 Version of Step** | A step execution's version of step is the procedure version of the step execution's step. |
| **DR-514 Is Ungoverned Divergence** | A step execution is considered an ungoverned divergence if all of the following hold: at least one of the following holds: the deviation flag is set; the late flag is set; or the proceeded past blocking control flag is set and the governing instrument flag is not set. |
| **DR-515 Ungoverned Divergence Execution Key** | The step execution's ungoverned divergence execution key is determined by the following priority:<br>1. the procedure execution, if the ungoverned divergence flag is set;<br>2. in all other cases, an empty string. |
| **DR-516 Self Attested Approval Execution Key** | The step execution's self attested approval execution key is determined by the following priority:<br>1. the procedure execution, if the approval rests on self attestation flag is set;<br>2. in all other cases, an empty string. |
| **DR-517 Name** | A requirement satisfaction's name is computed as the requirement, followed by “ / ”, followed by the satisfaction level. |
| **DR-518 Requirement is Blocking** | A requirement satisfaction's requirement is blocking when the linked requirement is blocking. |
| **DR-519 Is Fully Satisfied** | A requirement satisfaction is considered fully-satisfied if the satisfaction level is “Satisfied”. |
| **DR-520 Is Blocking and Unmet** | A requirement satisfaction is considered a blocking and unmet if all of the following hold: the requirement is blocking flag is set and the fully satisfied flag is not set. |
| **DR-521 Blocking Unmet Step Key** | The requirement satisfaction's blocking unmet step key is determined by the following priority:<br>1. the step execution, if the blocking and unmet flag is set;<br>2. in all other cases, an empty string. |
| **DR-522 Blocking Satisfaction Step Key** | The requirement satisfaction's blocking satisfaction step key is determined by the following priority:<br>1. the step execution, if the requirement is blocking flag is set;<br>2. in all other cases, an empty string. |
| **DR-523 Negative Outcome Requirement Key** | The requirement satisfaction's negative outcome requirement key is determined by the following priority:<br>1. the requirement, if the fully satisfied flag is not set;<br>2. in all other cases, an empty string. |
| **DR-524 Evaluator Agent Kind** | A requirement satisfaction's evaluator agent kind — taken from the linked evaluated by agent. |
| **DR-525 Non Human Evaluated Human Control** | A requirement satisfaction is flagged non human evaluated human control if all of the following hold: the requirement is blocking flag is set and the evaluator agent kind is not “Human”. |
| **DR-526 Requirement Has Computed Witness** | A requirement satisfaction's requirement has computed witness when the linked requirement has a computed witness. |
| **DR-527 Is Asserted Only** | A requirement satisfaction is considered an asserted only if all of the following hold: the requirement is blocking flag is set; the fully satisfied flag is set; and the requirement has computed witness flag is not set. |
| **DR-528 Asserted Only Execution Key** | The requirement satisfaction's asserted only execution key is determined by the following priority:<br>1. the parent procedure execution, if the asserted only flag is set;<br>2. in all other cases, an empty string. |
| **DR-529 Parent Procedure Execution** | A requirement satisfaction's parent procedure execution — taken from the linked step execution. |
| **DR-530 Step Execution When Scored** | The requirement satisfaction's step execution when scored is determined by the following priority:<br>1. the step execution, if the satisfaction level has a value;<br>2. in all other cases, an empty string. |
| **DR-531 Is Human Evaluated** | A requirement satisfaction is considered human-evaluated if the evaluator agent kind is “Human”. |
| **DR-532 Requirement is Approval Type** | A requirement satisfaction's requirement is approval type — taken from the linked requirement. |
| **DR-533 Is Invalid Approval** | A requirement satisfaction is considered an invalid approval if all of the following hold: the requirement is approval type is “Approval” and at least one of the following holds: the fully satisfied flag is not set or the human evaluated flag is not set. |
| **DR-534 Procedure Execution of Satisfaction** | A requirement satisfaction's procedure execution of satisfaction — taken from the linked step execution. |
| **DR-535 Run When Invalid Approval** | The requirement satisfaction's run when invalid approval is determined by the following priority:<br>1. the procedure execution of satisfaction, if the invalid approval flag is set;<br>2. in all other cases, an empty string. |
| **DR-536 Requirement is Unfalsified** | A requirement satisfaction's requirement is unfalsified is true when the requirement satisfaction's requirement is an unfalsified control. |
| **DR-537 Is Clearance by Unfalsified Control** | A requirement satisfaction is considered a clearance by unfalsified control if all of the following hold: the fully satisfied flag is set; the requirement is blocking flag is set; and the requirement is unfalsified flag is set. |
| **DR-538 Unfalsified Clearance Step Key** | The requirement satisfaction's unfalsified clearance step key is determined by the following priority:<br>1. the step execution, if the clearance by unfalsified control flag is set;<br>2. in all other cases, an empty string. |
| **DR-539 Spec Step of Execution** | A requirement satisfaction's spec step of execution — taken from the linked step execution. |
| **DR-540 Binding Key** | A requirement satisfaction's binding key is the step requirement ID of the requirement satisfaction's requirement satisfaction ID. |
| **DR-541 Scored Step Executor Agent** | A requirement satisfaction's scored step executor agent is the executed by agent of the requirement satisfaction's step execution. |
| **DR-542 Evaluator is Step Executor** | A requirement satisfaction is flagged evaluator is step executor if the evaluated by agent is the scored step executor agent. |
| **DR-543 Run Owner Agent** | A requirement satisfaction's run owner agent is the executed by agent of the requirement satisfaction's parent procedure execution. |
| **DR-544 Evaluator Owns the Run** | A requirement satisfaction is flagged evaluator owns the run if the evaluated by agent is the run owner agent. |
| **DR-545 Is Interested Party Assertion** | A requirement satisfaction is considered an interested party assertion if all of the following hold: the asserted only flag is set and at least one of the following holds: the evaluator is step executor flag is set or the evaluator owns the run flag is set. |
| **DR-546 Has Written Evidence** | A requirement satisfaction is considered to have a written evidence if the evidence has a value. |
| **DR-547 Is Bare Assertion** | A requirement satisfaction is considered a bare assertion if all of the following hold: the asserted only flag is set and the written evidence flag is not set. |
| **DR-548 Interested Assertion Execution Key** | The requirement satisfaction's interested assertion execution key is determined by the following priority:<br>1. the parent procedure execution, if the interested party assertion flag is set;<br>2. in all other cases, an empty string. |
| **DR-549 Is Computedly Witnessed** | A requirement satisfaction is considered computedly-witnessed if all of the following hold: the requirement is blocking flag is set and the requirement has computed witness flag is set. |
| **DR-550 Computed Witness Execution Key** | The requirement satisfaction's computed witness execution key is determined by the following priority:<br>1. the parent procedure execution, if the computedly witnessed flag is set;<br>2. in all other cases, an empty string. |
| **DR-551 Step Executor Agent** | A requirement satisfaction's step executor agent is the executed by agent of the requirement satisfaction's step execution. |
| **DR-552 Was Scored After Attestation** | A requirement satisfaction is considered to have been scored after attestation if the number of minutes from the attestation instant for run to the evaluated at is greater than 0. |
| **DR-553 Attestation Instant for Run** | A requirement satisfaction's attestation instant for run is the latest attestation instant of the requirement satisfaction's parent procedure execution. |
| **DR-554 Post Attestation Score Execution Key** | The requirement satisfaction's post attestation score execution key is determined by the following priority:<br>1. the parent procedure execution, if the was scored after attestation flag is set;<br>2. in all other cases, an empty string. |
| **DR-555 Name** | An error's name is computed as the error code, followed by “ - ”, followed by the label. |
| **DR-556 Name** | An issue occurrence's name is computed as the error, followed by “ @ ”, followed by the occurred at. |
| **DR-557 Is Unresolved** | An issue occurrence is considered unresolved if at least one of the following holds: the status is “Open”; the status is “Investigating”; or the status is “Monitoring”. |
| **DR-558 Step Execution When Unresolved** | The issue occurrence's step execution when unresolved is determined by the following priority:<br>1. the step execution, if the unresolved flag is set;<br>2. in all other cases, an empty string. |
| **DR-559 Name** | A user question's name is computed as the first 70 character(s) of the question text. |
| **DR-560 Name** | A user feedback's name is computed as the disposition, followed by “: ”, followed by the first 60 character(s) of the feedback text. |
| **DR-561 Name** | A stewardship assignment's name is computed as the procedure version, followed by “ / steward=”, followed by the steward role. |
| **DR-562 Count of Review Events** | A stewardship assignment's count of review events is the number of review events related to the stewardship assignment. |
| **DR-563 Has Ever Been Reviewed** | A stewardship assignment is considered to have ever been reviewed if the count of review events is greater than 0. |
| **DR-564 As of Instant** | A stewardship assignment's as of instant — taken from the linked evaluation context. |
| **DR-565 Is Current Assignment** | A stewardship assignment is considered a current assignment if all of the following hold: the valid from is at most the as of instant and at least one of the following holds: the valid to is blank or the valid to is greater than the as of instant. |
| **DR-566 Name** | A change request's name is the same as its title. |
| **DR-567 Is Open** | A change request is considered open if all of the following hold: at least one of the following holds: the status is “Draft”; the status is “UnderReview”; or the status is “Approved” and the implemented at is blank. |
| **DR-568 Open Change Version Key** | The change request's open change version key is determined by the following priority:<br>1. the procedure version, if the open flag is set;<br>2. in all other cases, an empty string. |
| **DR-569 Is Decided** | A change request is considered decided if the decided at has a value. |
| **DR-570 As of Instant** | A change request's as of instant — taken from the linked evaluation context. |
| **DR-571 Days Pending** | The change request's days pending is determined by the following priority:<br>1. the number of days from the requested at to the decided at, if the decided flag is set;<br>2. in all other cases, the number of days from the requested at to the as of instant. |
| **DR-572 Is Still Pending** | A change request is considered still-pending if all of the following hold: the open flag is set and the decided flag is not set. |
| **DR-573 Is Stalled** | A change request is considered stalled if all of the following hold: the still pending flag is set and the days pending is greater than 14. |
| **DR-574 Authority Agent** | A change request's authority agent is the current agent of the change request's authority role. |
| **DR-575 Requester is Authority** | A change request is flagged requester is authority if the requested by agent is the authority agent. |
| **DR-576 Awaits Authority Decision** | A change request is considered to await an authority decision if all of the following hold: the status is “UnderReview” and the decided flag is not set. |
| **DR-577 Authority Role Label** | A change request's authority role label — taken from the linked authority role. |
| **DR-578 Touches Live Version** | A change request's touches live version when the linked procedure version is live. |
| **DR-579 Is Live Decision Backlog** | A change request is considered a live decision backlog if all of the following hold: the awaits authority decision flag is set and the touches live version flag is set. |
| **DR-580 Blocks an Open Gap** | A change request is considered to block an open gap if all of the following hold: the live decision backlog flag is set and the change kind is “Enhancement”. |
| **DR-581 Backlog Version Key** | The change request's backlog version key is determined by the following priority:<br>1. the procedure version, if the live decision backlog flag is set;<br>2. in all other cases, an empty string. |
| **DR-582 Is My Pending Decision** | A change request is considered a my pending decision if all of the following hold: the authority role is “hr-policy-owner” and the awaits authority decision flag is set. |
| **DR-583 Is My Blocking Backlog** | A change request is considered a my blocking backlog if all of the following hold: the my pending decision flag is set and the blocks an open gap flag is set. |
| **DR-584 Is My Overdue Backlog** | A change request is considered a my overdue backlog if all of the following hold: the my blocking backlog flag is set and the days pending is greater than 14. |
| **DR-585 Is Implemented** | A change request is considered implemented if the implemented at has a value. |
| **DR-586 Is My Decided Request** | A change request is considered a my decided request if all of the following hold: the authority role is “hr-policy-owner” and the decided flag is set. |
| **DR-587 Is My Decided But Unlanded** | A change request is considered my-decided-but-unlanded if all of the following hold: the my decided request flag is set and the implemented flag is not set. |
| **DR-588 Decision Latency Days** | The change request's decision latency days is determined by the following priority:<br>1. the number of days from the requested at to the decided at, if the decided flag is set;<br>2. in all other cases, 0. |
| **DR-589 Implementation Latency Days** | The change request's implementation latency days is determined by the following priority:<br>1. the number of days from the decided at to the implemented at, if the implemented flag is set;<br>2. in all other cases, 0. |
| **DR-590 Delay is Downstream of Me** | A change request is flagged delay is downstream of me if all of the following hold: the my decided but unlanded flag is set and the decision latency days is at most 14. |
| **DR-591 Unlanded Version Key** | The change request's unlanded version key is determined by the following priority:<br>1. the procedure version, if the my decided but unlanded flag is set;<br>2. in all other cases, an empty string. |
| **DR-592 Is Approved Not Implemented** | A change request is considered approved-not-implemented if all of the following hold: the status is “Approved” and the implemented flag is not set. |
| **DR-593 Days Since Approval** | The change request's days since approval is determined by the following priority:<br>1. the number of days from the decided at to the as of instant, if the decided flag is set;<br>2. in all other cases, 0. |
| **DR-594 Is Stalled Implementation** | A change request is considered a stalled implementation if all of the following hold: the approved not implemented flag is set and the days since approval is greater than 14. |
| **DR-595 Stalled Implementation Version Key** | The change request's stalled implementation version key is determined by the following priority:<br>1. the procedure version, if the stalled implementation flag is set;<br>2. in all other cases, an empty string. |
| **DR-596 Approved Version Key** | The change request's approved version key is determined by the following priority:<br>1. the procedure version, if the approved decision flag is set;<br>2. in all other cases, an empty string. |
| **DR-597 Is Approved Decision** | A change request is considered an approved decision if the status is “Approved”. |
| **DR-598 Name** | A review event's name is computed as the procedure version, followed by “ / ”, followed by the review kind. |
| **DR-599 As of Instant** | A review event's as of instant — taken from the linked evaluation context. |
| **DR-600 Is Overdue** | A review event is considered an overdue if the next review due is less than the as of instant. |
| **DR-601 Overdue Version Key** | The review event's overdue version key is determined by the following priority:<br>1. the procedure version, if the overdue flag is set;<br>2. in all other cases, an empty string. |
| **DR-602 Promised Cadence Days** | A review event's promised cadence days is the steward review cadence days of the review event's procedure version. |
| **DR-603 Days Since Reviewed** | A review event's days since reviewed is computed as the number of days from the reviewed at to the as of instant. |
| **DR-604 Exceeds Promised Cadence** | A review event is considered to exceed a promised cadence if the days since reviewed is greater than the promised cadence days. |
| **DR-605 Cadence Drift Days** | A review event's cadence drift days is computed as the days since reviewed minus the promised cadence days. |
| **DR-606 Promise and Behavior Disagree** | A review event is flagged promise and behavior disagree if all of the following hold: the exceeds promised cadence flag is set and the overdue flag is not set. |
| **DR-607 Cadence Breach Version Key** | The review event's cadence breach version key is determined by the following priority:<br>1. the procedure version, if the exceeds promised cadence flag is set;<br>2. in all other cases, an empty string. |
| **DR-608 Name** | A learning activity's name is computed as the activity kind, followed by “ / ”, followed by the occurred at. |
| **DR-609 Name** | An operational binding's name is computed as the step, followed by “ / ”, followed by the record or schema key. |
| **DR-610 As of Instant** | An operational binding's as of instant — taken from the linked evaluation context. |
| **DR-611 Age Minutes** | An operational binding's age minutes is computed as the number of minutes from the last observed at to the as of instant. |
| **DR-612 Is Fresh** | An operational binding is considered a fresh if the age minutes is at most the freshness sla minutes. |
| **DR-613 Stale Binding Step Key** | The operational binding's stale binding step key is determined by the following priority:<br>1. the step, if the fresh flag is not set;<br>2. in all other cases, an empty string. |
| **DR-614 Authoritative Stale Step Key** | The operational binding's authoritative stale step key is determined by the following priority:<br>1. the step, if all of the following hold: the fresh flag is not set and the authoritative flag is set;<br>2. in all other cases, an empty string. |
| **DR-615 Is Stale and Authoritative** | An operational binding is considered stale-and-authoritative if all of the following hold: the authoritative flag is set and the fresh flag is not set. |
| **DR-616 Step When Stale** | The operational binding's step when stale is determined by the following priority:<br>1. the step, if the stale and authoritative flag is set;<br>2. in all other cases, an empty string. |
| **DR-617 Resource is Approved** | An operational binding's resource is approved is true when the operational binding's resource is an approved source. |
| **DR-618 Is Usable for Drafting** | An operational binding is considered usable-for-drafting if all of the following hold: the resource is approved flag is set and the fresh flag is set. |
| **DR-619 Step When Unusable** | The operational binding's step when unusable is determined by the following priority:<br>1. an empty string, if the usable for drafting flag is set;<br>2. in all other cases, the step. |
| **DR-620 Name** | A communication policy's name is computed as the channel, followed by “ policy / ”, followed by the procedure version. |
| **DR-621 Consent Violation Count** | A communication policy's consent violation count is the number of the communication policy's message deliveries that are consent violations. |
| **DR-622 Quiet Hours Violation Count** | A communication policy's quiet hours violation count is the number of message deliveries related to the communication policy. |
| **DR-623 Is Active Policy** | A communication policy is considered an active policy if the status is “Active”. |
| **DR-624 Name** | A message template's name is computed as the communication policy, followed by “ / ”, followed by the locale. |
| **DR-625 Policy Max Message Length** | A message template's policy max message length — taken from the linked communication policy. |
| **DR-626 Policy Max Segments** | A message template's policy max segments — taken from the linked communication policy. |
| **DR-627 Body Template Length** | A message template's body template length is computed as the length of the body template. |
| **DR-628 Is Template Over Length** | A message template is considered a template over length if the body template length is greater than the policy max message length. |
| **DR-629 Valid Approval Count** | A message template's valid approval count is the number of template approvals related to the message template. |
| **DR-630 Has Valid Approval** | A message template is considered to have a valid approval if the valid approval count is greater than 0. |
| **DR-631 Is Claiming Unbacked Approval** | A message template is considered a claiming unbacked approval if all of the following hold: the status is “Approved” and the valid approval flag is not set. |
| **DR-632 Last Approved Body Hash** | A message template's last approved body hash — taken from the linked last valid approval. |
| **DR-633 Has Body Drifted** | A message template is considered to have body drifted if all of the following hold: the last approved body hash has a value and the current body hash is not the last approved body hash. |
| **DR-634 Is Sendable Under Approval** | A message template is considered a sendable under approval if all of the following hold: the status is “Approved” and all of the following hold: the valid approval flag is set and the body drifted flag is not set. |
| **DR-635 Drifted Send Count** | A message template's drifted send count is the number of message deliveries related to the message template. |
| **DR-636 Unanswered Delivery Count** | A message template's unanswered delivery count is the number of message deliveries related to the message template. |
| **DR-637 Transmitted Delivery Count** | A message template's transmitted delivery count is the number of message deliveries related to the message template. |
| **DR-638 Template Draws No Response** | A message template is flagged template draws no response if all of the following hold: the transmitted delivery count is greater than 0 and the unanswered delivery count is the transmitted delivery count. |
| **DR-639 Last Approval At** | A message template's last approval at is the decided at of the message template's last valid approval. |
| **DR-640 Name** | A semantic mapping's name is computed as the source path, followed by “ -> ”, followed by the target iri. |
| **DR-641 Name** | A witness loop's name is computed as “Loop ”, followed by the loop number, followed by “: ”, followed by the title. |
| **DR-642 Question Count** | A witness loop's question count is the number of role questions related to the witness loop. |
| **DR-643 Is Complete** | A witness loop is considered a complete if the completed at has a value. |
| **DR-644 Name** | A role question's name is computed as the asking role, followed by “: ”, followed by the first 60 character(s) of the question text. |
| **DR-645 Predicate Count** | A role question's predicate count is the number of rulebook fields related to the role question. |
| **DR-646 Is Answered** | A role question is considered answered if the predicate count is greater than 0. |
| **DR-647 Name** | A rulebook field's name is computed as the target table, followed by a period, followed by the field name. |
| **DR-648 Is Derived** | A rulebook field is considered derived if at least one of the following holds: the field type is “calculated”; the field type is “lookup”; or the field type is “aggregation”. |
| **DR-649 Is Witness** | A rulebook field is considered a witness if the invented for question has a value. |
| **DR-650 Name** | A test suite's name is the same as its label. |
| **DR-651 Test Count** | A test suite's test count is the number of test cases related to the test suite. |
| **DR-652 Pass Count** | A test suite's pass count is the number of test cases related to the test suite. |
| **DR-653 Blocking Fail Count** | A test suite's blocking fail count is the number of test cases related to the test suite. |
| **DR-654 Is Green** | A test suite is considered a green if the blocking fail count is 0. |
| **DR-655 Name** | A test cas's name is computed as the test kind, followed by “: ”, followed by the subject. |
| **DR-656 Is Blocking** | A test cas is considered blocking if the severity is “blocking”. |
| **DR-657 Is Passing** | A test cas is considered passing if the last outcome is “PASS”. |
| **DR-658 Is Failing** | A test cas is considered failing if the last outcome is “FAIL”. |
| **DR-659 Needs Attention** | A test cas is considered to need an attention if all of the following hold: the failing flag is set and the blocking flag is set. |
| **DR-660 Passing Suite Key** | The test cas's passing suite key is determined by the following priority:<br>1. the suite, if the passing flag is set;<br>2. in all other cases, an empty string. |
| **DR-661 Needs Attention Suite Key** | The test cas's needs attention suite key is determined by the following priority:<br>1. the suite, if the needs attention flag is set;<br>2. in all other cases, an empty string. |
| **DR-662 Name** | An exception invocation's name is computed as the step execution, followed by “ / ”, followed by the exception. |
| **DR-663 Expected Handling** | An exception invocation's expected handling — taken from the linked exception. |
| **DR-664 Required Approval Role** | An exception invocation's required approval role — taken from the linked exception. |
| **DR-665 Required Approval Role Holder** | An exception invocation's required approval role holder is the current agent of the exception invocation's required approval role. |
| **DR-666 Approval Role Matches** | An exception invocation is flagged approval role matches if the approved by agent is the required approval role holder. |
| **DR-667 Is Approved** | An exception invocation is considered approved if the approved by agent has a value. |
| **DR-668 Is Improperly Approved** | An exception invocation is considered improperly-approved if at least one of the following holds: the approved flag is not set or the approval role matches flag is not set. |
| **DR-669 Invoker Agent Kind** | An exception invocation's invoker agent kind — taken from the linked invoked by agent. |
| **DR-670 Invoker Also Prepared Key** | An exception invocation's invoker also prepared key is computed as the parent procedure execution, followed by “|”, followed by the approved by agent. |
| **DR-671 Parent Procedure Execution** | An exception invocation's parent procedure execution — taken from the linked step execution. |
| **DR-672 Approver Prepared Count** | An exception invocation's approver prepared count is the number of step executions related to the exception invocation. |
| **DR-673 Delegated to Preparer** | An exception invocation is flagged delegated to preparer if the approver prepared count is greater than 0. |
| **DR-674 Is Ungoverned Invocation** | An exception invocation is considered an ungoverned invocation if at least one of the following holds: the improperly approved flag is set or the delegated to preparer flag is set. |
| **DR-675 Name** | A verification outcome's name is computed as the step execution, followed by “ / ”, followed by the step verification. |
| **DR-676 Expected Signal Value** | A verification outcome's expected signal value — taken from the linked step verification. |
| **DR-677 Signal Identifier** | A verification outcome's signal identifier — taken from the linked step verification. |
| **DR-678 Signal Matches Expected** | A verification outcome is flagged signal matches expected if the observed signal value is the expected signal value. |
| **DR-679 Has Evidence** | A verification outcome is considered to have an evidence if the evidence uri has a value. |
| **DR-680 Is Unbacked Observation** | A verification outcome is considered an unbacked observation if all of the following hold: the signal matches expected flag is set and the evidence flag is not set. |
| **DR-681 Is Self Witnessed** | A verification outcome is considered self-witnessed if the observed by agent is the step executor agent. |
| **DR-682 Step Executor Agent** | A verification outcome's step executor agent is the executed by agent of the verification outcome's step execution. |
| **DR-683 Self Witnessed Step Key** | The verification outcome's self witnessed step key is determined by the following priority:<br>1. the step execution, if the self witnessed flag is set;<br>2. in all other cases, an empty string. |
| **DR-684 Unbacked Step Key** | The verification outcome's unbacked step key is determined by the following priority:<br>1. the step execution, if the unbacked observation flag is set;<br>2. in all other cases, an empty string. |
| **DR-685 Is Self Witnessed and Unbacked** | A verification outcome is considered self-witnessed-and-unbacked if all of the following hold: the self witnessed flag is set and the evidence flag is not set. |
| **DR-686 Is Uncorroborated Pass** | A verification outcome is considered an uncorroborated pass if all of the following hold: the signal matches expected flag is set and the self witnessed and unbacked flag is set. |
| **DR-687 Uncorroborated Pass Step Key** | The verification outcome's uncorroborated pass step key is determined by the following priority:<br>1. the step execution, if the uncorroborated pass flag is set;<br>2. in all other cases, an empty string. |
| **DR-688 Observer is Non Human** | A verification outcome's observer is non human when the linked observed by agent is a non human. |
| **DR-689 Observer is Independent of Executor** | A verification outcome is flagged observer is independent of executor if the self witnessed flag is not set. |
| **DR-690 Is Independent Human Observation** | A verification outcome is considered an independent human observation if all of the following hold: the observer is non human flag is not set; the self witnessed flag is not set; and the evidence flag is set. |
| **DR-691 Independent Observation Execution Key** | The verification outcome's independent observation execution key is determined by the following priority:<br>1. the parent procedure execution of outcome, if the independent human observation flag is set;<br>2. in all other cases, an empty string. |
| **DR-692 Parent Procedure Execution of Outcome** | A verification outcome's parent procedure execution of outcome — taken from the linked step execution. |
| **DR-693 Name** | An observed transition's name is computed as the step transition, followed by “ @ ”, followed by the observed at. |
| **DR-694 Name** | A recipient's name is the same as its display name. |
| **DR-695 Has Sms Consent** | A recipient is considered to have a sms consent if the sms consent status is “Granted”. |
| **DR-696 Is Email Reachable** | A recipient is considered email-reachable if the email address has a value. |
| **DR-697 Is Sms Reachable** | A recipient is considered sms-reachable if the mobile number has a value. |
| **DR-698 Is Unreachable** | A recipient is considered unreachable if all of the following hold: the email reachable flag is not set and the sms reachable flag is not set. |
| **DR-699 Is Communicationally Stranded** | A recipient is considered communicationally-stranded if all of the following hold: the sms reachable flag is not set and the email reachable flag is not set. |
| **DR-700 Name** | A message delivery's name is computed as the recipient, followed by “ / ”, followed by the message template, followed by “ / ”, followed by the sent at. |
| **DR-701 Policy Channel** | A message delivery's policy channel is the communication policy of the message delivery's message template. |
| **DR-702 Channel Name** | A message delivery's channel name — taken from the linked policy channel. |
| **DR-703 Policy Requires Consent** | A message delivery's policy requires consent is true when the message delivery's policy channel is consent required. |
| **DR-704 Recipient Has Sms Consent** | A message delivery's recipient has sms consent when the linked recipient has a sms consent. |
| **DR-705 Was Actually Transmitted** | A message delivery is considered to have been actually transmitted if at least one of the following holds: the delivery status is “Sent” or at least one of the following holds: the delivery status is “Delivered” or the delivery status is “Bounced”. |
| **DR-706 Is Consent Violation** | A message delivery is considered a consent violation if all of the following hold: the was actually transmitted flag is set and all of the following hold: the policy requires consent flag is set and the recipient has sms consent flag is not set. |
| **DR-707 Consent Violation Policy Key** | The message delivery's consent violation policy key is determined by the following priority:<br>1. the policy channel, if the consent violation flag is set;<br>2. in all other cases, an empty string. |
| **DR-708 Policy Quiet Hours Start Hour** | A message delivery's policy quiet hours start hour — taken from the linked policy channel. |
| **DR-709 Policy Quiet Hours End Hour** | A message delivery's policy quiet hours end hour — taken from the linked policy channel. |
| **DR-710 Policy Has Quiet Hours** | A message delivery is flagged policy has quiet hours if the policy quiet hours start hour is not the policy quiet hours end hour. |
| **DR-711 Quiet Window Wraps Midnight** | A message delivery is flagged quiet window wraps midnight if the policy quiet hours start hour is greater than the policy quiet hours end hour. |
| **DR-712 Is Inside Quiet Window** | A message delivery is considered an inside quiet window if the OR of the sent at local hour is at least the policy quiet hours start hour and the sent at local hour is less than the policy quiet hours end hour if the quiet window wraps midnight flag is set, in all other cases the AND of the sent at local hour is at least the policy quiet hours start hour and the sent at local hour is less than the policy quiet hours end hour. |
| **DR-713 Is Quiet Hours Violation** | A message delivery is considered a quiet hours violation if all of the following hold: the was actually transmitted flag is set and all of the following hold: the policy has quiet hours flag is set and the inside quiet window flag is set. |
| **DR-714 Quiet Hours Violation Policy Key** | The message delivery's quiet hours violation policy key is determined by the following priority:<br>1. the policy channel, if the quiet hours violation flag is set;<br>2. in all other cases, an empty string. |
| **DR-715 Recipient is Unreachable** | A message delivery's recipient is unreachable when the linked recipient is unreachable. |
| **DR-716 Is Acknowledged** | A message delivery is considered acknowledged if the acknowledged at has a value. |
| **DR-717 Invoked Exception Condition** | A message delivery's invoked exception condition — taken from the linked invoked exception. |
| **DR-718 Has Unreachable Exception Invoked** | A message delivery is considered to have unreachable exception invoked if the invoked exception is “exc-unreachable”. |
| **DR-719 Is Fabricated Acknowledgement** | A message delivery is considered a fabricated acknowledgement if all of the following hold: the recipient is unreachable flag is set and the acknowledged flag is set. |
| **DR-720 Is Unhandled Unreachable** | A message delivery is considered unhandled-unreachable if all of the following hold: the recipient is unreachable flag is set and the unreachable exception invoked flag is not set. |
| **DR-721 Unreachable Failure Key** | The message delivery's unreachable failure key is determined by the following priority:<br>1. the procedure execution, if at least one of the following holds: the fabricated acknowledgement flag is set or the unhandled unreachable flag is set;<br>2. in all other cases, an empty string. |
| **DR-722 Policy Retention Days** | A message delivery's policy retention days — taken from the linked policy channel. |
| **DR-723 As of Instant** | A message delivery's as of instant — taken from the linked evaluation context. |
| **DR-724 Age Days** | A message delivery's age days is computed as the number of days from the sent at to the as of instant. |
| **DR-725 Is Within Retention Window** | A message delivery is considered a within retention window if the age days is at most the policy retention days. |
| **DR-726 Has Rendered Body** | A message delivery is considered to have a rendered body if the rendered body has a value. |
| **DR-727 Is Evidence Required** | A message delivery is considered evidence-required if all of the following hold: the was actually transmitted flag is set and the within retention window flag is set. |
| **DR-728 Is Retention Breach** | A message delivery is considered a retention breach if all of the following hold: the evidence required flag is set and the rendered body flag is not set. |
| **DR-729 Retention Breach Execution Key** | The message delivery's retention breach execution key is determined by the following priority:<br>1. the procedure execution, if the retention breach flag is set;<br>2. in all other cases, an empty string. |
| **DR-730 Sending Step Execution Step** | A message delivery's sending step execution step — taken from the linked step execution. |
| **DR-731 Execution Has Cleared Legal Review** | A message delivery's execution has cleared legal review when the linked procedure execution has a cleared legal review. |
| **DR-732 Is Unreviewed Send** | A message delivery is considered an unreviewed send if all of the following hold: the was actually transmitted flag is set and the execution has cleared legal review flag is not set. |
| **DR-733 Rendered Body Length** | A message delivery's rendered body length is computed as the length of the rendered body. |
| **DR-734 Policy Max Message Length At Send** | A message delivery's policy max message length at send — taken from the linked policy channel. |
| **DR-735 Segment Count** | The message delivery's segment count is determined by the following priority:<br>1. 0, if the rendered body length is 0;<br>2. 1, if the rendered body length is at most the policy max message length at send;<br>3. in all other cases, the rendered body length divided by the policy max message length at send rounded up to 0 decimal place(s). |
| **DR-736 Policy Max Segments At Send** | A message delivery's policy max segments at send — taken from the linked policy channel. |
| **DR-737 Is Over Segment Limit** | A message delivery is considered an over segment limit if all of the following hold: the was actually transmitted flag is set and the segment count is greater than the policy max segments at send. |
| **DR-738 Template Has Valid Approval** | A message delivery's template has valid approval when the linked message template has a valid approval. |
| **DR-739 Is Unapproved Send** | A message delivery is considered an unapproved send if all of the following hold: the was actually transmitted flag is set and the template has valid approval flag is not set. |
| **DR-740 Policy Required Opt Out Phrase** | A message delivery's policy required opt out phrase — taken from the linked policy channel. |
| **DR-741 Policy Requires Opt Out** | A message delivery is flagged policy requires opt out if the policy required opt out phrase has a value. |
| **DR-742 Opt Out Phrase Position** | A message delivery's opt out phrase position is computed as the position of the policy required opt out phrase within the rendered body. |
| **DR-743 Has Opt Out Phrase** | A message delivery is considered to have an opt out phrase if the opt out phrase position is greater than 0. |
| **DR-744 Is Opt Out in First Segment** | A message delivery is considered an opt out in first segment if all of the following hold: the opt out phrase flag is set and the opt out phrase position is at most the policy max message length at send. |
| **DR-745 Is Missing Required Opt Out** | A message delivery is considered a missing required opt out if all of the following hold: the was actually transmitted flag is set and all of the following hold: the policy requires opt out flag is set and the opt out phrase flag is not set. |
| **DR-746 Is Opt Out At Risk of Truncation** | A message delivery is considered an opt out at risk of truncation if all of the following hold: the was actually transmitted flag is set and all of the following hold: the policy requires opt out flag is set and all of the following hold: the opt out phrase flag is set and the opt out in first segment flag is not set. |
| **DR-747 Is Failed Delivery** | A message delivery is considered a failed delivery if at least one of the following holds: the delivery status is “Failed” or the delivery status is “Bounced”. |
| **DR-748 Is Suppressed** | A message delivery is considered suppressed if the delivery status is “Suppressed”. |
| **DR-749 Is Triaged** | A message delivery is considered triaged if the invoked exception has a value. |
| **DR-750 Is Abandoned Failure** | A message delivery is considered an abandoned failure if all of the following hold: the failed delivery flag is set and the triaged flag is not set. |
| **DR-751 Abandoned Failure Execution Key** | The message delivery's abandoned failure execution key is determined by the following priority:<br>1. the procedure execution, if the abandoned failure flag is set;<br>2. in all other cases, an empty string. |
| **DR-752 Reached Execution Key** | The message delivery's reached execution key is determined by the following priority:<br>1. the procedure execution, if the delivery status is “Delivered”;<br>2. in all other cases, an empty string. |
| **DR-753 Template Was Sendable** | A message delivery's template was sendable is true when the message delivery's message template is a sendable under approval. |
| **DR-754 Is Drifted Send** | A message delivery is considered a drifted send if all of the following hold: the was actually transmitted flag is set and the template was sendable flag is not set. |
| **DR-755 Drifted Send Template Key** | The message delivery's drifted send template key is determined by the following priority:<br>1. the message template, if the drifted send flag is set;<br>2. in all other cases, an empty string. |
| **DR-756 Was Sent Outside Business Hours** | A message delivery is considered to have been sent outside business hours if at least one of the following holds: the sent at local hour is less than 8 or the sent at local hour is greater than 18. |
| **DR-757 Was Delivered and Unanswered** | A message delivery is considered to have been delivered and unanswered if all of the following hold: the was actually transmitted flag is set and the acknowledged flag is not set. |
| **DR-758 Is Poorly Timed Unanswered** | A message delivery is considered poorly-timed-unanswered if all of the following hold: the was delivered and unanswered flag is set and the was sent outside business hours flag is set. |
| **DR-759 Is Well Timed Unanswered** | A message delivery is considered well-timed-unanswered if all of the following hold: the was delivered and unanswered flag is set and the was sent outside business hours flag is not set. |
| **DR-760 Unanswered Template Key** | The message delivery's unanswered template key is determined by the following priority:<br>1. the message template, if the was delivered and unanswered flag is set;<br>2. in all other cases, an empty string. |
| **DR-761 Transmitted Template Key** | The message delivery's transmitted template key is determined by the following priority:<br>1. the message template, if the was actually transmitted flag is set;<br>2. in all other cases, an empty string. |
| **DR-762 Approval Preceded Send** | A message delivery is flagged approval preceded send if all of the following hold: the approval decided at send has a value and the sent at is greater than the approval decided at send. |
| **DR-763 Has Frozen Approval Evidence** | A message delivery is considered to have a frozen approval evidence if all of the following hold: the approving agent at send has a value and the approval decided at send has a value. |
| **DR-764 Provenance is Live Derived** | A message delivery is flagged provenance is live derived if the frozen approval evidence flag is not set. |
| **DR-765 Current Last Approval At** | A message delivery's current last approval at — taken from the linked message template. |
| **DR-766 Template Reapproved Since Send** | A message delivery is flagged template reapproved since send if all of the following hold: the current last approval at has a value and the current last approval at is greater than the sent at. |
| **DR-767 Is Unprovable Approval Claim** | A message delivery is considered an unprovable approval claim if all of the following hold: the provenance is live derived flag is set and all of the following hold: the template reapproved since send flag is set and the template has valid approval flag is set. |
| **DR-768 Has Sent Reminder** | A message delivery is considered to have a sent reminder if the reminder count is greater than 0. |
| **DR-769 Acknowledgement is Outstanding** | A message delivery is flagged acknowledgement is outstanding if all of the following hold: the was actually transmitted flag is set and all of the following hold: the evidence required flag is set and the acknowledged flag is not set. |
| **DR-770 Outstanding Age Days** | The message delivery's outstanding age days is determined by the following priority:<br>1. the number of days from the sent at to the as of instant, if the acknowledgement is outstanding flag is set;<br>2. in all other cases, 0. |
| **DR-771 Is Unchased Acknowledgement** | A message delivery is considered an unchased acknowledgement if all of the following hold: the acknowledgement is outstanding flag is set and all of the following hold: the outstanding age days is greater than 7 and the sent reminder flag is not set. |
| **DR-772 Is Exhausted Follow Up** | A message delivery is considered an exhausted follow up if all of the following hold: the acknowledgement is outstanding flag is set and the reminder count is at least 3. |
| **DR-773 Needs Human Escalation** | A message delivery is considered to need a human escalation if all of the following hold: the exhausted follow up flag is set and the unreachable exception invoked flag is not set. |
| **DR-774 Name** | A template approval's name is computed as the message template, followed by “ / ”, followed by the decision, followed by “ / ”, followed by the decided at. |
| **DR-775 Is Approval Decision** | A template approval is considered an approval decision if the decision is “Approved”. |
| **DR-776 Template Policy** | A template approval's template policy is the communication policy of the template approval's message template. |
| **DR-777 Required Approval Role** | A template approval's required approval role — taken from the linked template policy. |
| **DR-778 Is Decided by Required Role** | A template approval is considered a decided by required role if the decided in role is the required approval role. |
| **DR-779 Valid Approval Template Key** | The template approval's valid approval template key is determined by the following priority:<br>1. the message template, if all of the following hold: the approval decision flag is set and the decided by required role flag is set;<br>2. in all other cases, an empty string. |
| **DR-780 Name** | A send intent's name is computed as the recipient, followed by “ / ”, followed by the message template, followed by “ / intent”. |
| **DR-781 Intent Policy** | A send intent's intent policy is the communication policy of the send intent's message template. |
| **DR-782 Intent Channel** | A send intent's intent channel — taken from the linked intent policy. |
| **DR-783 Policy is Active** | A send intent's policy is active is true when the send intent's intent policy is an active policy. |
| **DR-784 Intent Requires Consent** | A send intent's intent requires consent is true when the send intent's intent policy is consent required. |
| **DR-785 Recipient Has Channel Consent** | A send intent's recipient has channel consent is true when the send intent's recipient has a sms consent. |
| **DR-786 Consent Gate Passed** | A send intent is flagged consent gate passed if at least one of the following holds: the intent requires consent flag is not set or the recipient has channel consent flag is set. |
| **DR-787 Recipient is Sms Reachable** | A send intent's recipient is sms reachable when the linked recipient is sms reachable. |
| **DR-788 Recipient is Email Reachable** | A send intent's recipient is email reachable when the linked recipient is email reachable. |
| **DR-789 Reachability Gate Passed** | A send intent is flagged reachability gate passed if the recipient is sms reachable if the intent channel is “SMS”, in all other cases the recipient is email reachable. |
| **DR-790 Permission Gate Passed** | A send intent is flagged permission gate passed if all of the following hold: the policy is active flag is set and all of the following hold: the consent gate passed flag is set and the reachability gate passed flag is set. |
| **DR-791 Intent Quiet Start Hour** | A send intent's intent quiet start hour is the quiet hours start hour of the send intent's intent policy. |
| **DR-792 Intent Quiet End Hour** | A send intent's intent quiet end hour is the quiet hours end hour of the send intent's intent policy. |
| **DR-793 Intent Policy Has Quiet Hours** | A send intent is flagged intent policy has quiet hours if the intent quiet start hour is not the intent quiet end hour. |
| **DR-794 Intent Quiet Window Wraps** | A send intent is flagged intent quiet window wraps if the intent quiet start hour is greater than the intent quiet end hour. |
| **DR-795 Intent is Inside Quiet Window** | A send intent is flagged intent is inside quiet window if the OR of the proposed send at local hour is at least the intent quiet start hour and the proposed send at local hour is less than the intent quiet end hour if the intent quiet window wraps flag is set, in all other cases the AND of the proposed send at local hour is at least the intent quiet start hour and the proposed send at local hour is less than the intent quiet end hour. |
| **DR-796 Timing Gate Passed** | A send intent is flagged timing gate passed if at least one of the following holds: the intent policy has quiet hours flag is not set or the intent is inside quiet window flag is not set. |
| **DR-797 Hours Until Window Opens** | The send intent's hours until window opens is determined by the following priority:<br>1. 0, if the timing gate passed flag is set;<br>2. the intent quiet end hour minus the proposed send at local hour, if the proposed send at local hour is less than the intent quiet end hour;<br>3. in all other cases, 24 minus the proposed send at local hour plus the intent quiet end hour. |
| **DR-798 Intent Max Message Length** | A send intent's intent max message length — taken from the linked intent policy. |
| **DR-799 Intent Max Segments** | A send intent's intent max segments — taken from the linked intent policy. |
| **DR-800 Length Gate Passed** | A send intent is flagged length gate passed if all of the following hold: the proposed body length is greater than 0 and the proposed segment count is at most the intent max segments. |
| **DR-801 Intent Required Opt Out Phrase** | A send intent's intent required opt out phrase — taken from the linked intent policy. |
| **DR-802 Opt Out Gate Passed** | A send intent is flagged opt out gate passed if at least one of the following holds: the intent required opt out phrase is blank or all of the following hold: the proposed opt out position is greater than 0 and the proposed opt out position is at most the intent max message length. |
| **DR-803 Content Gate Passed** | A send intent is flagged content gate passed if all of the following hold: the length gate passed flag is set and the opt out gate passed flag is set. |
| **DR-804 Template is Sendable** | A send intent's template is sendable is true when the send intent's message template is a sendable under approval. |
| **DR-805 Execution Has Legal Clearance** | A send intent's execution has legal clearance is true when the send intent's procedure execution has a cleared legal review. |
| **DR-806 Intent Approval Role** | A send intent's intent approval role — taken from the linked intent policy. |
| **DR-807 Approval Role Agent Kind** | A send intent's approval role agent kind is the current agent kind of the send intent's intent approval role. |
| **DR-808 Approval is Human** | A send intent is flagged approval is human if the approval role agent kind is “Human”. |
| **DR-809 Authorization Gate Passed** | A send intent is flagged authorization gate passed if all of the following hold: the template is sendable flag is set and all of the following hold: the execution has legal clearance flag is set and the approval is human flag is set. |
| **DR-810 Is Cleared to Send** | A send intent is considered a cleared to send if all of the following hold: the permission gate passed flag is set and all of the following hold: the timing gate passed flag is set and all of the following hold: the content gate passed flag is set and the authorization gate passed flag is set. |
| **DR-811 Blocking Gate Name** | The send intent's blocking gate name is determined by the following priority:<br>1. an empty string, if the cleared to send flag is set;<br>2. “Permission”, if the permission gate passed flag is not set;<br>3. “Timing”, if the timing gate passed flag is not set;<br>4. “Content”, if the content gate passed flag is not set;<br>5. in all other cases, “Authorization”. |
| **DR-812 Has Resulting Delivery** | A send intent is considered to have a resulting delivery if the resulting delivery has a value. |
| **DR-813 Resulting Delivery Was Transmitted** | A send intent's resulting delivery was transmitted is true when the send intent's resulting delivery was actually transmitted. |
| **DR-814 Is Overridden Refusal** | A send intent is considered an overridden refusal if all of the following hold: the cleared to send flag is not set and all of the following hold: the resulting delivery flag is set and the resulting delivery was transmitted flag is set. |
| **DR-815 Is Silently Dropped** | A send intent is considered silently-dropped if all of the following hold: the cleared to send flag is not set and the resulting delivery flag is not set. |
| **DR-816 Resulting Delivery Exception** | A send intent's resulting delivery exception is the invoked exception of the send intent's resulting delivery. |
| **DR-817 Refusal Cited an Exception** | A send intent is flagged refusal cited an exception if the resulting delivery exception has a value. |
| **DR-818 Is Properly Handled Refusal** | A send intent is considered a properly handled refusal if all of the following hold: the cleared to send flag is not set and all of the following hold: the resulting delivery flag is set and all of the following hold: the resulting delivery was transmitted flag is not set and the refusal cited an exception flag is set. |
| **DR-819 Refusal Failure Execution Key** | The send intent's refusal failure execution key is determined by the following priority:<br>1. the procedure execution, if at least one of the following holds: the overridden refusal flag is set or the silently dropped flag is set;<br>2. in all other cases, an empty string. |
| **DR-820 Intent Execution Key** | A send intent's intent execution key is the same as its procedure execution. |
| **DR-821 Delivered Intent Execution Key** | The send intent's delivered intent execution key is determined by the following priority:<br>1. the procedure execution, if all of the following hold: the resulting delivery flag is set and the resulting delivery was transmitted flag is set;<br>2. in all other cases, an empty string. |
| **DR-822 Dropped Intent Execution Key** | The send intent's dropped intent execution key is determined by the following priority:<br>1. the procedure execution, if the silently dropped flag is set;<br>2. in all other cases, an empty string. |
| **DR-823 My Approval Was in Force** | A send intent is flagged my approval was in force only if the send intent is flagged template is sendable. |
| **DR-824 Refused on Approved Content** | A send intent is flagged refused on approved content if all of the following hold: the my approval was in force flag is set and the content gate passed flag is not set. |
| **DR-825 Refused on Opt Out Only** | A send intent is flagged refused on opt out only if all of the following hold: the opt out gate passed flag is not set and the length gate passed flag is set. |
| **DR-826 Refusal Was on My Rules** | A send intent is flagged refusal was on my rules if all of the following hold: the cleared to send flag is not set and at least one of the following holds: the content gate passed flag is not set or the timing gate passed flag is not set. |
| **DR-827 Refusal Was Outside My Control** | A send intent is flagged refusal was outside my control if all of the following hold: the cleared to send flag is not set and at least one of the following holds: the permission gate passed flag is not set or the authorization gate passed flag is not set. |
| **DR-828 Is Unreported Refusal on My Rules** | A send intent is considered an unreported refusal on my rules if all of the following hold: the refusal was on my rules flag is set and the approver was notified flag is not set. |
| **DR-829 Is Approval Overridden Silently** | A send intent is considered an approval overridden silently if all of the following hold: the refused on approved content flag is set and the approver was notified flag is not set. |
| **DR-830 Has Alternate Channel Attempt** | A send intent is considered to have an alternate channel attempt if the alternate channel intent has a value. |
| **DR-831 Alternate Attempt Was Cleared** | A send intent's alternate attempt was cleared is true when the send intent's alternate channel intent is a cleared to send. |
| **DR-832 Is Refused With No Alternative** | A send intent is considered refused-with-no-alternative if all of the following hold: the cleared to send flag is not set and the alternate channel attempt flag is not set. |
| **DR-833 Exception Prescribed an Alternative** | A send intent is flagged exception prescribed an alternative if all of the following hold: the refusal cited an exception flag is set and the resulting delivery exception has a value. |
| **DR-834 Prescribed Handling Was Performed** | A send intent is flagged prescribed handling was performed if all of the following hold: the exception prescribed an alternative flag is set and all of the following hold: the alternate channel attempt flag is set and the alternate attempt was cleared flag is set. |
| **DR-835 Is Suppression Without Remedy** | A send intent is considered a suppression without remedy if all of the following hold: the exception prescribed an alternative flag is set and the prescribed handling was performed flag is not set. |
| **DR-836 Has Durable Refusal Record** | A send intent is considered to have a durable refusal record if the refusal recorded at has a value. |
| **DR-837 Refusal Was Escalated** | A send intent is flagged refusal was escalated if the refusal notified role has a value. |
| **DR-838 Is Unrecorded Refusal** | A send intent is considered an unrecorded refusal if all of the following hold: the silently dropped flag is set and all of the following hold: the durable refusal record flag is not set and the refusal cited an exception flag is not set. |
| **DR-839 Is Unescalated Refusal** | A send intent is considered an unescalated refusal if all of the following hold: the cleared to send flag is not set and the refusal was escalated flag is not set. |
| **DR-840 Unescalated Refusal Role Key** | The send intent's unescalated refusal role key is determined by the following priority:<br>1. the refusal notified role, if the unrecorded refusal flag is set;<br>2. in all other cases, an empty string. |
| **DR-841 Unrecorded Refusal Execution Key** | The send intent's unrecorded refusal execution key is determined by the following priority:<br>1. the procedure execution, if the unrecorded refusal flag is set;<br>2. in all other cases, an empty string. |
| **DR-842 Was Deferred on Timing** | A send intent is considered to have been deferred on timing if all of the following hold: the timing gate passed flag is not set and all of the following hold: the permission gate passed flag is set and the content gate passed flag is set. |
| **DR-843 As of Instant** | A send intent's as of instant — taken from the linked evaluation context. |
| **DR-844 Window Has Since Reopened** | A send intent is flagged window has since reopened if all of the following hold: the hours until window opens is greater than 0 and the number of hours from the evaluated at to the as of instant is greater than the hours until window opens. |
| **DR-845 Has Retry Attempt** | A send intent is considered to have a retry attempt if the retry intent has a value. |
| **DR-846 Retry Was Cleared** | A send intent's retry was cleared is true when the send intent's retry intent is a cleared to send. |
| **DR-847 Is Abandoned Deferral** | A send intent is considered an abandoned deferral if all of the following hold: the was deferred on timing flag is set and all of the following hold: the window has since reopened flag is set and the retry attempt flag is not set. |
| **DR-848 Deferral Age Hours** | A send intent's deferral age hours is computed as the number of hours from the evaluated at to the as of instant. |
| **DR-849 Is Stale Deferral** | A send intent is considered a stale deferral if all of the following hold: the was deferred on timing flag is set and the deferral age hours is greater than 24. |
| **DR-850 Enforced by Unauthorized Agent** | A send intent's enforced by unauthorized agent is true when the send intent's evaluating role assignment is an unauthorized enforcement agent. |
| **DR-851 Consent Input Was Resolvable** | A send intent is flagged consent input was resolvable if the recipient consent status raw has a value. |
| **DR-852 Recipient Consent Status Raw** | A send intent's recipient consent status raw is the sms consent status of the send intent's recipient. |
| **DR-853 Policy Input Was Resolvable** | A send intent is flagged policy input was resolvable if the intent policy has a value. |
| **DR-854 All Gate Inputs Resolved** | A send intent is flagged all gate inputs resolved if all of the following hold: the consent input was resolvable flag is set and the policy input was resolvable flag is set. |
| **DR-855 Is Unevaluable Refusal** | A send intent is considered an unevaluable refusal if all of the following hold: the cleared to send flag is not set and the all gate inputs resolved flag is not set. |
| **DR-856 Is Self Witnessed Decision** | A send intent is considered a self witnessed decision if the gate result was independently confirmed flag is not set. |
| **DR-857 Is Independently Confirmed** | A send intent is considered independently-confirmed if all of the following hold: the resulting delivery flag is set and the resulting delivery was transmitted flag is set. |
| **DR-858 Independently Confirmed Execution Key** | The send intent's independently confirmed execution key is determined by the following priority:<br>1. the procedure execution, if the independently confirmed flag is set;<br>2. in all other cases, an empty string. |
| **DR-859 Name** | An agent decision record's name is computed as the deciding agent, followed by “: ”, followed by the first 60 character(s) of the decision summary. |
| **DR-860 Was Overridden** | An agent decision record is considered to have been overridden if at least one of the following holds: the human disposition is “Corrected” or the human disposition is “Reversed”. |
| **DR-861 Was Reviewed** | An agent decision record is considered to have been reviewed if all of the following hold: the human disposition has a value and the human disposition is not “NotReviewed”. |
| **DR-862 Deciding Agent Kind** | An agent decision record's deciding agent kind — taken from the linked deciding agent. |
| **DR-863 Deciding Agent When Overridden** | The agent decision record's deciding agent when overridden is determined by the following priority:<br>1. the deciding agent, if the was overridden flag is set;<br>2. in all other cases, an empty string. |
| **DR-864 Role Assignment When Scored** | The agent decision record's role assignment when scored is determined by the following priority:<br>1. the under role assignment, if the under role assignment has a value;<br>2. in all other cases, an empty string. |
| **DR-865 Role Assignment When Overridden** | The agent decision record's role assignment when overridden is determined by the following priority:<br>1. the under role assignment, if the was overridden flag is set;<br>2. in all other cases, an empty string. |
| **DR-866 Step of Decision** | An agent decision record's step of decision — taken from the linked step execution. |
| **DR-867 Boundary Match Key** | An agent decision record's boundary match key is computed as the step of decision, followed by “|”, followed by the deciding agent kind, followed by “|”, followed by the decision kind. |
| **DR-868 Matching Boundary Count** | An agent decision record's matching boundary count is the number of authority boundaries related to the agent decision record. |
| **DR-869 Violated Authority Boundary** | An agent decision record is flagged violated authority boundary if the matching boundary count is greater than 0. |
| **DR-870 Reviewer Agent Kind** | An agent decision record's reviewer agent kind — taken from the linked reviewed by agent. |
| **DR-871 Has Human Confirmation** | An agent decision record is considered to have a human confirmation if all of the following hold: the reviewer agent kind is “Human”; the human disposition has a value; and the human disposition is not “NotReviewed”. |
| **DR-872 Needs Human Confirmation** | An agent decision record is considered to need a human confirmation if all of the following hold: it is not the case that the deciding agent kind is “Human” and at least one of the following holds: the materiality band is “Material” or the materiality band is “Escalated”. |
| **DR-873 Is Unconfirmed Non Human Decision** | An agent decision record is considered an unconfirmed non human decision if all of the following hold: the needs human confirmation flag is set and the human confirmation flag is not set. |
| **DR-874 Step Execution When Unconfirmed** | The agent decision record's step execution when unconfirmed is determined by the following priority:<br>1. the step execution, if the unconfirmed non human decision flag is set;<br>2. in all other cases, an empty string. |
| **DR-875 Agent When Boundary Violated** | The agent decision record's agent when boundary violated is determined by the following priority:<br>1. the deciding agent, if the violated authority boundary flag is set;<br>2. in all other cases, an empty string. |
| **DR-876 Review Latency Minutes** | The agent decision record's review latency minutes is determined by the following priority:<br>1. 0, if the reviewed at is blank;<br>2. in all other cases, the number of minutes from the decided at to the reviewed at. |
| **DR-877 Is Draft Kind** | An agent decision record is considered a draft kind if at least one of the following holds: the decision kind is “Draft” or the decision kind is “Commitment”. |
| **DR-878 Agent When Draft Overridden** | The agent decision record's agent when draft overridden is determined by the following priority:<br>1. the deciding agent, if all of the following hold: the draft kind flag is set and the was overridden flag is set;<br>2. in all other cases, an empty string. |
| **DR-879 Agent When Draft** | The agent decision record's agent when draft is determined by the following priority:<br>1. the deciding agent, if the draft kind flag is set;<br>2. in all other cases, an empty string. |
| **DR-880 Is Error Correction** | An agent decision record is considered an error correction if all of the following hold: the was overridden flag is set and the override reason kind is “ErrorCorrection”. |
| **DR-881 Is Reserved Judgment Override** | An agent decision record is considered a reserved judgment override if all of the following hold: the was overridden flag is set and the override reason kind is “JudgmentReserved”. |
| **DR-882 Override Reason is Recorded** | An agent decision record is flagged override reason is recorded if all of the following hold: the was overridden flag is set and the override reason kind has a value. |
| **DR-883 Is Unexplained Override** | An agent decision record is considered an unexplained override if all of the following hold: the was overridden flag is set and the override reason is recorded flag is not set. |
| **DR-884 Error Correction Role Assignment Key** | The agent decision record's error correction role assignment key is determined by the following priority:<br>1. the under role assignment, if the error correction flag is set;<br>2. in all other cases, an empty string. |
| **DR-885 Boundary Violation Role Assignment Key** | The agent decision record's boundary violation role assignment key is determined by the following priority:<br>1. the under role assignment, if the violated authority boundary flag is set;<br>2. in all other cases, an empty string. |
| **DR-886 Name** | A delivered communication's name is computed as the channel, followed by “ -> ”, followed by the recipient key, followed by “ @ ”, followed by the sent at. |
| **DR-887 Has Authorization** | A delivered communication is considered to have an authorization if the authorizing step execution has a value. |
| **DR-888 Content Matches Approval** | A delivered communication is flagged content matches approval if the rendered content hash is the approved content hash. |
| **DR-889 Authorized At** | A delivered communication's authorized at is the ended at of the delivered communication's authorizing step execution. |
| **DR-890 Was Approved Before Sending** | A delivered communication is considered to have been approved before sending if the authorized at is at most the sent at. |
| **DR-891 Is Defensible** | A delivered communication is considered defensible if all of the following hold: the authorization flag is set; the content matches approval flag is set; and the was approved before sending flag is set. |
| **DR-892 Name** | An authority boundary's name is computed as the forbidden agent kind, followed by “ may not ”, followed by the forbidden decision kind. |
| **DR-893 As of Instant** | An authority boundary's as of instant — taken from the linked evaluation context. |
| **DR-894 Is Currently Binding** | An authority boundary is considered currently-binding if all of the following hold: the status is “Approved”; the valid from is at most the as of instant; and at least one of the following holds: the valid to is blank or the valid to is greater than the as of instant. |
| **DR-895 Ratifying Fragment is Valid** | An authority boundary's ratifying fragment is valid is true when the authority boundary's ratified by knowledge fragment is currently valid. |
| **DR-896 Step When Binding** | The authority boundary's step when binding is determined by the following priority:<br>1. the step, if the currently binding flag is set;<br>2. in all other cases, an empty string. |
| **DR-897 Boundary Match Key** | An authority boundary's boundary match key is computed as the step, followed by “|”, followed by the forbidden agent kind, followed by “|”, followed by the forbidden decision kind. |
| **DR-898 Violation Count** | An authority boundary's violation count is the number of agent decision records related to the authority boundary. |
| **DR-899 Is Untested** | An authority boundary is considered untested if all of the following hold: the currently binding flag is set and the violation count is 0. |
| **DR-900 Has Ratifying Fragment** | An authority boundary is considered to have a ratifying fragment if the ratified by knowledge fragment has a value. |
| **DR-901 Is Unwarranted** | An authority boundary is considered unwarranted if all of the following hold: the currently binding flag is set and at least one of the following holds: the ratifying fragment flag is not set or the ratifying fragment is valid flag is not set. |
| **DR-902 Ratifying Fragment is Overdue** | An authority boundary's ratifying fragment is overdue is true when the authority boundary's ratified by knowledge fragment is an overdue for review. |
| **DR-903 Ratifying Fragment is Single Witness** | An authority boundary's ratifying fragment is single witness is true when the authority boundary's ratified by knowledge fragment is a from single witness. |
| **DR-904 Warrant is Thin** | An authority boundary is flagged warrant is thin if all of the following hold: the currently binding flag is set and at least one of the following holds: the ratifying fragment is overdue flag is set or the ratifying fragment is single witness flag is set. |
| **DR-905 Is Unwarranted and Untested** | An authority boundary is considered unwarranted-and-untested if all of the following hold: the unwarranted flag is set and the untested flag is set. |
| **DR-906 Unwarranted Boundary Step Key** | The authority boundary's unwarranted boundary step key is determined by the following priority:<br>1. the step, if the unwarranted flag is set;<br>2. in all other cases, an empty string. |
| **DR-907 Ratifying Fragment Key** | The authority boundary's ratifying fragment key is determined by the following priority:<br>1. the ratified by knowledge fragment, if the currently binding flag is set;<br>2. in all other cases, an empty string. |
| **DR-908 Ratifying Fragment Status** | An authority boundary's ratifying fragment status — taken from the linked ratified by knowledge fragment. |
| **DR-909 Ratification Lapsed** | An authority boundary is flagged ratification lapsed if all of the following hold: the ratifying fragment flag is set and the ratifying fragment is valid flag is not set. |
| **DR-910 Binds Despite Lapsed Ratification** | An authority boundary is considered to bind a despite lapsed ratification if all of the following hold: the currently binding flag is set and the ratification lapsed flag is set. |
| **DR-911 Is Ungrounded and Untested** | An authority boundary is considered ungrounded-and-untested if all of the following hold: the binds despite lapsed ratification flag is set and the untested flag is set. |
| **DR-912 Constrained Role Assignment Key** | The authority boundary's constrained role assignment key is determined by the following priority:<br>1. the authority role, if the binds despite lapsed ratification flag is set;<br>2. in all other cases, an empty string. |
| **DR-913 Name** | A binding observation's name is computed as the step execution, followed by “ / ”, followed by the binding observation ID. |
| **DR-914 Sla Minutes At Run** | A binding observation's sla minutes at run is the freshness sla minutes of the binding observation's operational binding. |
| **DR-915 Age At Run Minutes** | A binding observation's age at run minutes is computed as the number of minutes from the observed source timestamp to the read at. |
| **DR-916 Was Stale At Run** | A binding observation is considered to have been stale at run if all of the following hold: the authoritative binding flag is set and the age at run minutes is greater than the sla minutes at run. |
| **DR-917 Is Authoritative Binding** | A binding observation's is authoritative binding when the linked operational binding is authoritative. |
| **DR-918 Stale At Run Step Key** | The binding observation's stale at run step key is determined by the following priority:<br>1. the step execution, if the was stale at run flag is set;<br>2. in all other cases, an empty string. |
| **DR-919 Name** | An attestation's name is computed as the procedure execution, followed by “ / ”, followed by the attestation ID. |
| **DR-920 Version is Fit Now** | An attestation's version is fit now is true when the attestation's procedure execution is a fit. |
| **DR-921 Fitness Verdict Has Drifted** | An attestation is considered to fitnes verdict has drifted if it is not the case that the version was fit at signing is the version is fit now. |
| **DR-922 Assurance Grade Now** | An attestation's assurance grade now — taken from the linked procedure execution. |
| **DR-923 Assurance Grade Has Drifted** | An attestation is flagged assurance grade has drifted if it is not the case that the assurance grade at signing is the assurance grade now. |
| **DR-924 Would Not Survive Restatement** | An attestation is flagged would not survive restatement if at least one of the following holds: the fitness verdict has drifted flag is set or the assurance grade has drifted flag is set. |
| **DR-925 Name** | An app role profile's name is computed as the display label, followed by “ (”, followed by the role kind, followed by “)”. |
| **DR-926 Route Count** | An app role profile's route count is the number of app routes related to the app role profile. |
| **DR-927 Name** | An app nav group's name is the same as its group label. |
| **DR-928 Route Count** | An app nav group's route count is the number of app routes related to the app nav group. |
| **DR-929 Name** | An app route's name is computed as the route name, followed by “ — ”, followed by the route path. |
| **DR-930 Is in Nav** | An app route is considered in-nav if the nav group has a value. |
| **DR-931 Is Shared** | An app route is considered shared if all of the following hold: the owning role is blank and the surface is “domain”. |
| **DR-932 Is Maintainer** | An app route is considered a maintainer if the surface is “maintainer”. |
| **DR-933 Question Count** | An app route's question count is the number of app route questions related to the app route. |
| **DR-934 Reference Count** | An app route's reference count is the number of app route references related to the app route. |
| **DR-935 Answers No Question** | An app route is considered to answer no question if all of the following hold: the question count is 0; the is shared is false; the is maintainer is false; and the route kind is not “index”. |
| **DR-936 Name** | An app route question's name is computed as the route, followed by “ answers ”, followed by the question. |
| **DR-937 Name** | An app route reference's name is computed as the from route, followed by “ -> ”, followed by the to route. |
| **DR-938 Name** | A rulebook table's name is the same as its table name. |
| **DR-939 Field Count** | A rulebook table's field count is the number of rulebook fields related to the rulebook table. |
| **DR-940 Policy Count** | A rulebook table's policy count is the number of access policies related to the rulebook table. |
| **DR-941 Is Unsecured** | A rulebook table is considered unsecured if the policy count is 0. |
| **DR-942 Name** | An access principal's name is the same as its label. |
| **DR-943 Organization Scope** | An access principal's organization scope — taken from the linked domain role. |
| **DR-944 Role Label** | An access principal's role label — taken from the linked domain role. |
| **DR-945 Policy Count** | An access principal's policy count is the number of access policies related to the access principal. |
| **DR-946 Grant Count** | An access principal's grant count is the number of field grants related to the access principal. |
| **DR-947 Visible Table Count** | An access principal's visible table count is the number of role schema views related to the access principal. |
| **DR-948 Has No Access** | An access principal is considered to have no access if the policy count is 0. |
| **DR-949 Is Over Privileged** | An access principal is considered over-privileged if all of the following hold: the administrator flag is not set and the visible table count is at least 74. |
| **DR-950 Name** | An access policy's name is computed as the principal, followed by a space, followed by the command, followed by a space, followed by the target table. |
| **DR-951 Is Write Command** | An access policy is considered a write command if at least one of the following holds: the command is “INSERT”; the command is “UPDATE”; the command is “DELETE”; or the command is “ALL”. |
| **DR-952 Is Unrestricted** | An access policy is considered unrestricted if the row predicate is blank. |
| **DR-953 Principal is Admin** | An access policy's principal is admin is true when the access policy's principal is an administrator. |
| **DR-954 Is Unrestricted Non Admin Grant** | An access policy is considered an unrestricted non admin grant if all of the following hold: the unrestricted flag is set and the principal is admin flag is not set. |
| **DR-955 Is Unwitnessed Write** | An access policy is considered an unwitnessed write if all of the following hold: the write command flag is set and the denial test count is 0. |
| **DR-956 Denial Test Count** | An access policy's denial test count is the number of access denial tests related to the access policy. |
| **DR-957 Name** | A field grant's name is computed as the principal, followed by “ -> ”, followed by the target field. |
| **DR-958 Field Table** | A field grant's field table is the target table of the field grant's target field. |
| **DR-959 Field Name** | A field grant's field name — taken from the linked target field. |
| **DR-960 Field is Derived** | A field grant's field is derived when the linked target field is derived. |
| **DR-961 Is Writable Derived Field** | A field grant is considered a writable derived field if all of the following hold: the can write flag is set and the field is derived flag is set. |
| **DR-962 Is Masked** | A field grant is considered masked if all of the following hold: the mask strategy is not “plain” and the mask strategy has a value. |
| **DR-963 Grant Key When Readable** | The field grant's grant key when readable is determined by the following priority:<br>1. the principal, followed by “|”, followed by the field table, if the can read flag is set;<br>2. in all other cases, an empty string. |
| **DR-964 Name** | A role schema's name is the same as its schema name. |
| **DR-965 Search Path** | A role schema's search path is the same as its schema name. |
| **DR-966 View Count** | A role schema's view count is the number of role schema views related to the role schema. |
| **DR-967 Is Empty Schema** | A role schema is considered an empty schema if the view count is 0. |
| **DR-968 Name** | A role schema view's name is computed as the schema name, followed by a period, followed by the view name. |
| **DR-969 Schema Name** | A role schema view's schema name — taken from the linked role schema. |
| **DR-970 Source View** | A role schema view's source view is the physical view of the role schema view's target table. |
| **DR-971 Grant Key** | A role schema view's grant key is computed as the principal, followed by “|”, followed by the target table. |
| **DR-972 Column Count** | A role schema view's column count is the number of field grants related to the role schema view. |
| **DR-973 Table Field Count** | A role schema view's table field count — taken from the linked target table. |
| **DR-974 Is Full Width** | A role schema view is considered a full width if all of the following hold: the column count is greater than 0 and the column count is at least the table field count. |
| **DR-975 Is Degenerate View** | A role schema view is considered a degenerate view if the column count is 0. |
| **DR-976 Name** | A jwt claim mapping's name is computed as the claim name, followed by “ -> ”, followed by the SQL accessor. |
| **DR-977 Usage Count** | A jwt claim mapping's usage count is the number of access policies related to the jwt claim mapping. |
| **DR-978 Name** | An access denial test's name is computed as the principal, followed by “ must not see ”, followed by the forbidden row ID. |
| **DR-979 Has Run** | An access denial test is considered to have a run if the last run at has a value. |
| **DR-980 Is Passing** | An access denial test is considered passing if the observed visible is the expected visible. |
| **DR-981 Is Leak** | An access denial test is considered a leak if all of the following hold: the expected visible flag is not set and the observed visible flag is set. |
| **DR-982 Is Unproven** | An access denial test is considered an unproven if the run flag is not set. |
| **DR-983 Is Positive Control** | An access denial test is considered a positive control only if the access denial test is flagged expected visible. |
| **DR-984 Name** | An app user's name is the same as its display name. |
| **DR-985 Agent Kind** | An app user's agent kind — taken from the linked linked agent. |
| **DR-986 Organization** | An app user's organization — taken from the linked linked agent. |
| **DR-987 Assignment Count** | An app user's assignment count is the number of principal assignments related to the app user. |
| **DR-988 Has No Principal** | An app user is considered to have no principal if the assignment count is 0. |
| **DR-989 Holds Multiple Principals** | An app user is considered to hold a multiple principals if the assignment count is greater than 1. |
| **DR-990 Is Non Human Sign in** | An app user is considered a non human sign in if at least one of the following holds: the agent kind is “AIAgent” or the agent kind is “AutomatedPipeline”. |
| **DR-991 Name** | A principal assignment's name is computed as the app user, followed by “ as ”, followed by the principal. |
| **DR-992 Principal is Admin** | A principal assignment's principal is admin is true when the principal assignment's principal is an administrator. |
| **DR-993 User Organization** | A principal assignment's user organization — taken from the linked app user. |
| **DR-994 Principal Organization** | A principal assignment's principal organization is the organization scope of the principal assignment's principal. |
| **DR-995 Is Cross Organization Grant** | A principal assignment is considered a cross organization grant if all of the following hold: the user organization has a value; the principal organization has a value; and the user organization is not the principal organization. |
| **DR-996 Name** | An issued token's name is computed as the app user, followed by “ as ”, followed by the principal, followed by “ @ ”, followed by the issued at. |
| **DR-997 Is Dev Minted** | An issued token is considered dev-minted if the issuer is “dev-mint”. |

## 5 Traceability to Schema

_The expression column is the rule's definition in RuleSpeak® notation —
the same logic the rulebook stores, written for a business reader._

| Schema element | Kind | Expression |
|----------------|------|------------|
| **RulebookReleases.Name** | formula | `RulebookVersion & " / PKO " & PkoCoreVersionIri` |
| **OntologyProfiles.Name** | formula | `Label & " " & Version` |
| **EvaluationContexts.Name** | formula | `Label & " @ " & AsOfInstant` |
| **Organizations.Name** | formula | `DisplayName` |
| **Agents.Name** | formula | `DisplayName` |
| **Agents.CountOfCurrentRoleAssignments** | rollup | `Count(RoleAssignments via CurrentAgentKey)` |
| **Agents.IsStillEngaged** | formula | `CountOfCurrentRoleAssignments > 0` |
| **Agents.DecisionCount** | rollup | `Count(AgentDecisionRecords via DecidingAgent)` |
| **Agents.OverriddenDecisionCount** | rollup | `Count(AgentDecisionRecords via DecidingAgentWhenOverridden)` |
| **Agents.OverrideRatePercent** | formula | `If(DecisionCount = 0, 0, OverriddenDecisionCount * 100 / DecisionCount)` |
| **Agents.IsNonHuman** | formula | `Not(AgentKind = "Human")` |
| **Agents.BoundaryViolationCount** | rollup | `Count(AgentDecisionRecords via AgentWhenBoundaryViolated)` |
| **Agents.IsOperatingOutsideBoundary** | formula | `BoundaryViolationCount > 0` |
| **Agents.DraftDecisionCount** | rollup | `Count(AgentDecisionRecords via AgentWhenDraft)` |
| **Agents.OverriddenDraftCount** | rollup | `Count(AgentDecisionRecords via AgentWhenDraftOverridden)` |
| **Agents.DraftRewriteRatePercent** | formula | `If(DraftDecisionCount = 0, 0, OverriddenDraftCount * 100 / DraftDecisionCount)` |
| **Roles.Name** | formula | `Label` |
| **Roles.CurrentAgentKind** | lookup | `Lookup(Agents.AgentKind via CurrentAgent)` |
| **Roles.ActiveAssignmentCount** | rollup | `Count(RoleAssignments via Role)` |
| **Roles.CurrentlyCoveredAssignmentCount** | rollup | `Count(RoleAssignments via RoleWhenCovering)` |
| **Roles.HasNoCurrentHolder** | formula | `CurrentlyCoveredAssignmentCount = 0` |
| **Roles.CountOfAwaitedDecisions** | rollup | `Count(ChangeRequests via AuthorityRole)` |
| **Roles.CurrentAssignmentValidFrom** | lookup | `Lookup(RoleAssignments.ValidFrom via CurrentAssignment)` |
| **Roles.IsNonHumanHeld** | formula | `Not(CurrentAgentKind = "Human")` |
| **Roles.IsUngovernedNonHumanRole** | formula | `And(IsNonHumanHeld, HasNoCurrentHolder)` |
| **Roles.DepartedAssignmentCount** | rollup | `Count(RoleAssignments via DepartedRoleKey)` |
| **Roles.HasLostAHolder** | formula | `DepartedAssignmentCount > 0` |
| **Roles.IsVacatedRole** | formula | `And(HasLostAHolder, HasNoCurrentHolder)` |
| **Roles.UngroundedBoundaryCount** | rollup | `Count(AuthorityBoundaries via ConstrainedRoleAssignmentKey)` |
| **Roles.IsGovernedByLapsedAuthority** | formula | `UngroundedBoundaryCount > 0` |
| **Roles.UnescalatedRefusalCount** | rollup | `Count(SendIntents via UnescalatedRefusalRoleKey)` |
| **Roles.UnauthorizedEnforcementAssignmentCount** | rollup | `Count(RoleAssignments via UnauthorizedEnforcementRoleKey)` |
| **Roles.IsUngovernedEnforcementRole** | formula | `UnauthorizedEnforcementAssignmentCount > 0` |
| **RoleAssignments.Name** | formula | `Role & " @ " & ValidFrom` |
| **RoleAssignments.AsOfInstant** | lookup | `Lookup(EvaluationContexts.AsOfInstant via EvaluationContext)` |
| **RoleAssignments.IsCurrent** | formula | `And(ValidFrom <= AsOfInstant, Or(ValidTo = "", ValidTo > AsOfInstant))` |
| **RoleAssignments.CurrentAgentKey** | formula | `If(IsCurrent, Agent, "")` |
| **RoleAssignments.IsCurrentlyValid** | formula | `And(Status = "Active", Or(ValidTo = "", ValidTo > AsOfInstant))` |
| **RoleAssignments.AgentRoleKey** | formula | `If(IsCurrentlyValid, Agent & "\|" & Role, "")` |
| **RoleAssignments.HasDeparted** | formula | `And(ValidTo <> "", ValidTo <= AsOfInstant)` |
| **RoleAssignments.CoversNow** | formula | `And(Status = "Active", ValidFrom <= AsOfInstant, Or(ValidTo = "", ValidTo > AsOfInstant))` |
| **RoleAssignments.RoleWhenCovering** | formula | `If(CoversNow, Role, "")` |
| **RoleAssignments.AgentKind** | lookup | `Lookup(Agents.AgentKind via Agent)` |
| **RoleAssignments.IsNonHumanAssignment** | formula | `Not(AgentKind = "Human")` |
| **RoleAssignments.PredecessorAgentKind** | lookup | `Lookup(RoleAssignments.AgentKind via SupersedesAssignment)` |
| **RoleAssignments.IsHumanToNonHumanHandover** | formula | `And(PredecessorAgentKind = "Human", IsNonHumanAssignment)` |
| **RoleAssignments.IsUnauthorizedNonHumanAssignment** | formula | `And(IsNonHumanAssignment, Not(HasApprovingAuthority))` |
| **RoleAssignments.WasAuthorizedByChangeRequest** | formula | `And(HasApprovingAuthority, AuthorizingChangeRequest <> "")` |
| **RoleAssignments.DecisionCount** | rollup | `Count(AgentDecisionRecords via RoleAssignmentWhenScored)` |
| **RoleAssignments.OverriddenDecisionCount** | rollup | `Count(AgentDecisionRecords via RoleAssignmentWhenOverridden)` |
| **RoleAssignments.OverrideRatePercent** | formula | `If(DecisionCount = 0, 0, OverriddenDecisionCount * 100 / DecisionCount)` |
| **RoleAssignments.PredecessorOverrideRatePercent** | lookup | `Lookup(RoleAssignments.OverrideRatePercent via SupersedesAssignment)` |
| **RoleAssignments.QualityRegressedVsPredecessor** | formula | `And(SupersedesAssignment <> "", OverrideRatePercent > PredecessorOverrideRatePercent)` |
| **RoleAssignments.DepartedRoleKey** | formula | `If(HasDeparted, Role, "")` |
| **RoleAssignments.PredecessorDecisionCount** | lookup | `Lookup(RoleAssignments.DecisionCount via SupersedesAssignment)` |
| **RoleAssignments.HasSufficientSample** | formula | `DecisionCount >= MinimumDecisionsForComparison` |
| **RoleAssignments.PredecessorHasSufficientSample** | formula | `PredecessorDecisionCount >= MinimumDecisionsForComparison` |
| **RoleAssignments.ComparisonIsEvidentiallySound** | formula | `And(HasSufficientSample, PredecessorHasSufficientSample)` |
| **RoleAssignments.SingleOverrideSwingPercent** | formula | `If(DecisionCount > 0, 100 / DecisionCount, 0)` |
| **RoleAssignments.QualityVerdictIsUnsupported** | formula | `And(Not(ComparisonIsEvidentiallySound), Not(QualityRegressedVsPredecessor))` |
| **RoleAssignments.IsUnmeasuredAutomationHandover** | formula | `And(IsHumanToNonHumanHandover, Not(ComparisonIsEvidentiallySound))` |
| **RoleAssignments.ErrorCorrectionCount** | rollup | `Count(AgentDecisionRecords via ErrorCorrectionRoleAssignmentKey)` |
| **RoleAssignments.ErrorRatePercent** | formula | `If(DecisionCount > 0, ErrorCorrectionCount * 100 / DecisionCount, 0)` |
| **RoleAssignments.HasDatedAuthorization** | formula | `And(ApprovingAuthorityRole <> "", AuthorizationDecidedAt <> "")` |
| **RoleAssignments.DaysSinceAuthorizationReview** | formula | `If(AuthorizationReviewedAt <> "", DaysBetween(AsOfInstant, AuthorizationReviewedAt), DaysBetween(AsOfInstant, ValidFrom))` |
| **RoleAssignments.AuthorizationIsOverdueForReview** | formula | `And(AuthorizationReviewCadenceDays > 0, DaysSinceAuthorizationReview > AuthorizationReviewCadenceDays)` |
| **RoleAssignments.IsStandingUnreviewedAutomation** | formula | `And(CoversNow, And(IsNonHumanAssignment, AuthorizationIsOverdueForReview))` |
| **RoleAssignments.IsUnconditionedAutomationHandover** | formula | `And(IsHumanToNonHumanHandover, AuthorizationReviewCadenceDays = 0)` |
| **RoleAssignments.ExceedsTolerableErrorRate** | formula | `And(MaxTolerableErrorRatePercent > 0, ErrorRatePercent >= MaxTolerableErrorRatePercent)` |
| **RoleAssignments.BoundaryViolationCountForAssignment** | rollup | `Count(AgentDecisionRecords via BoundaryViolationRoleAssignmentKey)` |
| **RoleAssignments.HasAnyBoundaryViolation** | formula | `BoundaryViolationCountForAssignment > 0` |
| **RoleAssignments.HasUngroundedGoverningBoundary** | lookup | `Lookup(Roles.IsGovernedByLapsedAuthority via Role)` |
| **RoleAssignments.SuspensionConditionMet** | formula | `Or(ExceedsTolerableErrorRate, Or(HasAnyBoundaryViolation, HasUngroundedGoverningBoundary))` |
| **RoleAssignments.IsOperatingUnderMetSuspensionCondition** | formula | `And(SuspensionConditionMet, And(CoversNow, IsNonHumanAssignment))` |
| **RoleAssignments.HasDeclaredSuspensionCondition** | formula | `MaxTolerableErrorRatePercent > 0` |
| **RoleAssignments.HasApprovingAuthority** | formula | `ApprovingAuthorityRole <> ""` |
| **RoleAssignments.HasAuthorizingChangeRequest** | formula | `AuthorizingChangeRequest <> ""` |
| **RoleAssignments.IsUnauthorizedEnforcementAgent** | formula | `And(IsEnforcementRole, IsUnauthorizedNonHumanAssignment)` |
| **RoleAssignments.GovernanceEvidenceCount** | formula | `If(HasApprovingAuthority, 1, 0) + If(HasAuthorizingChangeRequest, 1, 0)` |
| **RoleAssignments.UnauthorizedEnforcementRoleKey** | formula | `If(IsUnauthorizedNonHumanAssignment, Role, "")` |
| **CommunitiesOfPractice.Name** | formula | `Label` |
| **Mentorships.Name** | formula | `MentorAgent & " -> " & LearnerAgent` |
| **ProcedureTypes.Name** | formula | `Label` |
| **Procedures.Name** | formula | `Title` |
| **ProcedureVersions.Name** | formula | `Title` |
| **ProcedureVersions.CountOfSteps** | rollup | `Count(Steps via ProcedureVersion)` |
| **ProcedureVersions.CountOfOpenKnowledgeGaps** | rollup | `Count(KnowledgeGaps via ProcedureVersion)` |
| **ProcedureVersions.IsReadyForExecution** | formula | `And(Status = "Approved", CountOfSteps > 0, CountOfOpenKnowledgeGaps = 0)` |
| **ProcedureVersions.SpecifiedStepCount** | rollup | `Count(Steps via ProcedureVersion)` |
| **ProcedureVersions.OverdueReviewCount** | rollup | `Count(ReviewEvents via OverdueVersionKey)` |
| **ProcedureVersions.OpenChangeRequestCount** | rollup | `Count(ChangeRequests via OpenChangeVersionKey)` |
| **ProcedureVersions.OpenHighSeverityGapCount** | rollup | `Count(KnowledgeGaps via OpenGapVersionKey)` |
| **ProcedureVersions.IsFitToExecute** | formula | `And(Status = "Approved", OverdueReviewCount = 0, OpenChangeRequestCount = 0, OpenHighSeverityGapCount = 0)` |
| **ProcedureVersions.StewardReviewCadenceDays** | rollup | `Sum(StewardshipAssignments.ReviewCadenceDays via ProcedureVersion)` |
| **ProcedureVersions.CountOfStewardshipAssignments** | rollup | `Count(StewardshipAssignments via ProcedureVersion)` |
| **ProcedureVersions.HasAnySteward** | formula | `CountOfStewardshipAssignments > 0` |
| **ProcedureVersions.IsLive** | formula | `Or(Status = "Approved", Status = "Published")` |
| **ProcedureVersions.IsUnstewarded** | formula | `Not(HasAnySteward)` |
| **ProcedureVersions.IsLiveAndUnstewarded** | formula | `And(IsLive, IsUnstewarded)` |
| **ProcedureVersions.CountOfOpenBlockingGaps** | rollup | `Count(KnowledgeGaps via IsOpenAndBlocking)` |
| **ProcedureVersions.HasOpenBlockingGap** | formula | `CountOfOpenBlockingGaps > 0` |
| **ProcedureVersions.IsLiveWithBlockingGap** | formula | `And(IsLive, HasOpenBlockingGap)` |
| **ProcedureVersions.ShouldNotBeExecutable** | formula | `And(IsReadyForExecution, HasOpenBlockingGap)` |
| **ProcedureVersions.CountOfUnapprovedRelianceFragments** | rollup | `Count(KnowledgeFragments via IsUnapprovedButReliedOn)` |
| **ProcedureVersions.RunsOnUnapprovedKnowledge** | formula | `CountOfUnapprovedRelianceFragments > 0` |
| **ProcedureVersions.CountOfOverdueGaps** | rollup | `Count(KnowledgeGaps via IsOverdueGap)` |
| **ProcedureVersions.CountOfChangeRequests** | rollup | `Count(ChangeRequests via ProcedureVersion)` |
| **ProcedureVersions.CountOfReviewEvents** | rollup | `Count(ReviewEvents via ProcedureVersion)` |
| **ProcedureVersions.HasGovernanceRecord** | formula | `Or(CountOfChangeRequests > 0, CountOfReviewEvents > 0)` |
| **ProcedureVersions.AsOfInstant** | lookup | `Lookup(EvaluationContexts.AsOfInstant via EvaluationContext)` |
| **ProcedureVersions.DaysSinceModified** | formula | `DaysBetween(AsOfInstant, ModifiedAt)` |
| **ProcedureVersions.DaysSinceLastReview** | rollup | `DaysBetween(AsOfInstant, Max(ReviewEvents.ReviewedAt via ProcedureVersion))` |
| **ProcedureVersions.WasModifiedSinceLastReview** | formula | `DaysSinceModified < DaysSinceLastReview` |
| **ProcedureVersions.ModifierIsAuthority** | lookup | `Lookup(Agents.AgentKind via ModifiedByAgent)` |
| **ProcedureVersions.HasUnwitnessedChange** | formula | `And(IsLive, WasModifiedSinceLastReview)` |
| **ProcedureVersions.CountOfStaleFragments** | rollup | `Count(KnowledgeFragments via ExceedsOwningCadence)` |
| **ProcedureVersions.KnowledgeIsStalerThanCadence** | formula | `CountOfStaleFragments > 0` |
| **ProcedureVersions.CompoundFragileFragmentCount** | rollup | `Count(KnowledgeFragments via CompoundFragileVersionKey)` |
| **ProcedureVersions.RestsOnCompoundFragileKnowledge** | formula | `And(IsLive, CompoundFragileFragmentCount > 0)` |
| **ProcedureVersions.ConcentratedWitnessSessionCount** | rollup | `Count(ElicitationSessions via ConcentratedSessionVersionKey)` |
| **ProcedureVersions.KnowledgeBaseIsConcentrated** | formula | `And(IsLive, ConcentratedWitnessSessionCount > 0)` |
| **ProcedureVersions.MachineConsumedUnapprovedCount** | rollup | `Count(KnowledgeFragments via MachineConsumedUnapprovedVersionKey)` |
| **ProcedureVersions.FeedsUnapprovedKnowledgeToMachines** | formula | `And(IsLive, MachineConsumedUnapprovedCount > 0)` |
| **ProcedureVersions.GenuinelyOverdueFragmentCount** | rollup | `Count(KnowledgeFragments via GenuinelyOverdueVersionKey)` |
| **ProcedureVersions.AwaitedDecisionCount** | rollup | `Count(ChangeRequests via BacklogVersionKey)` |
| **ProcedureVersions.ScopedOpenBlockingGapCount** | rollup | `Count(KnowledgeGaps via OpenBlockingGapVersionKey)` |
| **ProcedureVersions.IsBlockedOnPendingDecision** | formula | `And(AwaitedDecisionCount > 0, ScopedOpenBlockingGapCount > 0)` |
| **ProcedureVersions.UnexercisedHumanGateCount** | rollup | `Count(Steps via UnexercisedGateVersionKey)` |
| **ProcedureVersions.AiBoundaryIsUnevidenced** | formula | `And(IsLive, UnexercisedHumanGateCount > 0)` |
| **ProcedureVersions.LoadBearingUnapprovedCount** | rollup | `Count(KnowledgeFragments via UnapprovedLoadBearingVersionKey)` |
| **ProcedureVersions.UnlandedDecisionCount** | rollup | `Count(ChangeRequests via UnlandedVersionKey)` |
| **ProcedureVersions.UnrehearsedControlEntryCount** | rollup | `Count(StepTransitions via UnrehearsedControlVersionKey)` |
| **ProcedureVersions.HasUnrehearsedControlEntry** | formula | `UnrehearsedControlEntryCount > 0` |
| **ProcedureVersions.IsLiveWithUnrehearsedControl** | formula | `And(IsLive, HasUnrehearsedControlEntry)` |
| **ProcedureVersions.CadenceBreachCount** | rollup | `Count(ReviewEvents via CadenceBreachVersionKey)` |
| **ProcedureVersions.IsInCadenceBreach** | formula | `CadenceBreachCount > 0` |
| **ProcedureVersions.HasDecisionInFlight** | formula | `OpenChangeRequestCount > 0` |
| **ProcedureVersions.IsUnremediatedCadenceBreach** | formula | `And(IsInCadenceBreach, Not(HasDecisionInFlight))` |
| **ProcedureVersions.IsManagedCadenceBreach** | formula | `And(IsInCadenceBreach, HasDecisionInFlight)` |
| **ProcedureVersions.GovernanceIsSilent** | formula | `And(IsLive, Not(HasGovernanceRecord))` |
| **ProcedureVersions.ValidFragmentCount** | rollup | `Count(KnowledgeFragments via ValidFragmentVersionKey)` |
| **ProcedureVersions.StillOwnsValidKnowledge** | formula | `ValidFragmentCount > 0` |
| **ProcedureVersions.IncomingSupersessionCount** | rollup | `Count(ProcedureVersionLinks via SupersededVersionKey)` |
| **ProcedureVersions.IsStillReferenced** | formula | `IncomingSupersessionCount > 0` |
| **ProcedureVersions.IsLoadBearingOrphan** | formula | `And(IsUnstewarded, Or(StillOwnsValidKnowledge, IsStillReferenced))` |
| **ProcedureVersions.IsCleanlyRetired** | formula | `And(IsUnstewarded, Not(StillOwnsValidKnowledge), Not(IsStillReferenced))` |
| **ProcedureVersions.StalledImplementationCount** | rollup | `Count(ChangeRequests via StalledImplementationVersionKey)` |
| **ProcedureVersions.IsHeldUnfitByLandedDecisions** | formula | `And(Not(IsFitToExecute), StalledImplementationCount > 0)` |
| **ProcedureVersions.UndeclaredControlKindCount** | rollup | `Count(Steps via UndeclaredControlVersionKey)` |
| **ProcedureVersions.ControlTaxonomyIsIncomplete** | formula | `UndeclaredControlKindCount > 0` |
| **ProcedureVersions.HasApprovedChangeRequest** | formula | `ApprovedChangeRequestCount > 0` |
| **ProcedureVersions.ApprovedChangeRequestCount** | rollup | `Count(ChangeRequests via ApprovedVersionKey)` |
| **ProcedureVersions.UnwatchedUnownedControlCount** | rollup | `Count(Requirements via UnwatchedUnownedFlag)` |
| **ProcedureVersionLinks.Name** | formula | `PreviousProcedureVersion & " -> " & NextProcedureVersion` |
| **ProcedureVersionLinks.SupersededVersionKey** | formula | `If(RelationIri = "https://w3id.org/pko#nextVersion", PreviousProcedureVersion, "")` |
| **ProcedureStatusChanges.Name** | formula | `ProcedureVersion & ": " & FromStatus & " -> " & ToStatus` |
| **Steps.Name** | formula | `StepNumber & ". " & Title` |
| **Steps.AssignedRoleLabel** | lookup | `Lookup(Roles.Label via AssignedRole)` |
| **Steps.AssignedAgentKind** | lookup | `Lookup(Roles.CurrentAgentKind via AssignedRole)` |
| **Steps.BlockingRequirementCount** | rollup | `Count(StepRequirements via BlockingStepKey)` |
| **Steps.StaleBindingCount** | rollup | `Count(OperationalBindings via StaleBindingStepKey)` |
| **Steps.AuthoritativeStaleCount** | rollup | `Count(OperationalBindings via AuthoritativeStaleStepKey)` |
| **Steps.AvailableExceptionCount** | rollup | `Count(Exceptions via ActiveExceptionStepKey)` |
| **Steps.DeclaredVerificationCount** | rollup | `Count(StepVerifications via Step)` |
| **Steps.IsPreparationStep** | formula | `Or(AssignedRole = "finance-analyst", AssignedRole = "variance-review-agent")` |
| **Steps.IsApprovalStep** | formula | `Or(AssignedRole = "controller", AssignedRole = "cfo")` |
| **Steps.StaleAuthoritativeBindingCount** | rollup | `Count(OperationalBindings via StepWhenStale)` |
| **Steps.InputsAreFresh** | formula | `StaleAuthoritativeBindingCount = 0` |
| **Steps.IsSoftwareAssigned** | formula | `Or(AssignedAgentKind = "AIAgent", AssignedAgentKind = "AutomatedPipeline")` |
| **Steps.IsHumanApprovalGate** | formula | `And(Not(IsSoftwareAssigned), Or(StepId = "policy-05", StepId = "close-06"))` |
| **Steps.GateHeldByHuman** | formula | `And(IsHumanApprovalGate, AssignedAgentKind = "Human")` |
| **Steps.BindingBoundaryCount** | rollup | `Count(AuthorityBoundaries via StepWhenBinding)` |
| **Steps.AssignedRoleIsUngoverned** | lookup | `Lookup(Roles.IsUngovernedNonHumanRole via AssignedRole)` |
| **Steps.UnusableBindingCount** | rollup | `Count(OperationalBindings via StepWhenUnusable)` |
| **Steps.AllSourcesUsable** | formula | `UnusableBindingCount = 0` |
| **Steps.UnwarrantedBoundaryCount** | rollup | `Count(AuthorityBoundaries via UnwarrantedBoundaryStepKey)` |
| **Steps.IsGovernedByUnwarrantedBoundary** | formula | `UnwarrantedBoundaryCount > 0` |
| **Steps.SoftwareExecutionCount** | rollup | `Count(StepExecutions via SoftwareExecutionStepKey)` |
| **Steps.HasBeenApproachedBySoftware** | formula | `SoftwareExecutionCount > 0` |
| **Steps.IsUnexercisedHumanGate** | formula | `And(IsHumanApprovalGate, Not(HasBeenApproachedBySoftware))` |
| **Steps.IsDemonstratedHumanGate** | formula | `And(IsHumanApprovalGate, HasBeenApproachedBySoftware, GateHeldByHuman)` |
| **Steps.UnexercisedGateVersionKey** | formula | `If(IsUnexercisedHumanGate, ProcedureVersion, "")` |
| **Steps.HasDeclaredControlKind** | formula | `ControlKind <> ""` |
| **Steps.UndeclaredControlVersionKey** | formula | `If(HasDeclaredControlKind, "", ProcedureVersion)` |
| **Steps.ApprovalStepIsSoftwareAssigned** | formula | `And(ControlKind = "Approval", IsSoftwareAssigned)` |
| **Steps.UnwitnessedBlockingCount** | rollup | `Count(StepRequirements via UnwitnessedStepKey)` |
| **StepTransitions.Name** | formula | `FromStep & " -> " & ToStep` |
| **StepTransitions.IsRecoveryPath** | formula | `Or(TransitionKind = "Fallback", TransitionKind = "Alternative")` |
| **StepTransitions.CountOfFromStepExecutions** | rollup | `Count(StepExecutions via Step)` |
| **StepTransitions.CountOfToStepExecutions** | rollup | `Count(StepExecutions via Step)` |
| **StepTransitions.HasReachableOrigin** | formula | `CountOfFromStepExecutions > 0` |
| **StepTransitions.HasReachableTarget** | formula | `CountOfToStepExecutions > 0` |
| **StepTransitions.IsNeverExercised** | formula | `Not(And(HasReachableOrigin, HasReachableTarget))` |
| **StepTransitions.IsUntestedRecoveryPath** | formula | `And(IsRecoveryPath, IsNeverExercised)` |
| **StepTransitions.CountOfObservedTraversals** | rollup | `Count(ObservedTransitions via StepTransition)` |
| **StepTransitions.HasBeenTraversed** | formula | `CountOfObservedTraversals > 0` |
| **StepTransitions.IsUnwalkedRecoveryPath** | formula | `And(IsRecoveryPath, Not(HasBeenTraversed))` |
| **StepTransitions.TargetBlockingRequirementCount** | lookup | `Lookup(Steps.BlockingRequirementCount via ToStep)` |
| **StepTransitions.TargetCarriesBlockingControl** | formula | `TargetBlockingRequirementCount > 0` |
| **StepTransitions.IsUnrehearsedControlEntry** | formula | `And(IsUnwalkedRecoveryPath, TargetCarriesBlockingControl)` |
| **StepTransitions.UnrehearsedControlVersionKey** | formula | `If(IsUnrehearsedControlEntry, ProcedureVersion, "")` |
| **Actions.Name** | formula | `Label` |
| **Functions.Name** | formula | `Label` |
| **Tools.Name** | formula | `Label` |
| **StepActions.Name** | formula | `Step & " / " & Action` |
| **StepFunctions.Name** | formula | `Step & " / " & Function` |
| **StepTools.Name** | formula | `Step & " / " & Tool` |
| **Requirements.Name** | formula | `Label` |
| **Requirements.SatisfactionRecordCount** | rollup | `Count(RequirementSatisfactions via Requirement)` |
| **Requirements.StepBindingCount** | rollup | `Count(StepRequirements via Requirement)` |
| **Requirements.IsBoundToAnyStep** | formula | `StepBindingCount > 0` |
| **Requirements.HasEverBeenEvaluated** | formula | `SatisfactionRecordCount > 0` |
| **Requirements.NegativeOutcomeCount** | rollup | `Count(RequirementSatisfactions via NegativeOutcomeRequirementKey)` |
| **Requirements.IsInoperativeControl** | formula | `And(IsBlocking, IsBoundToAnyStep, Not(HasEverBeenEvaluated))` |
| **Requirements.IsDecorativeControl** | formula | `And(IsBlocking, Not(IsBoundToAnyStep))` |
| **Requirements.HasEverProducedNegative** | formula | `NegativeOutcomeCount > 0` |
| **Requirements.IsUnfalsifiedControl** | formula | `And(IsBlocking, HasEverBeenEvaluated, Not(HasEverProducedNegative))` |
| **Requirements.ClaimsAWitnessField** | formula | `WitnessFieldName <> ""` |
| **Requirements.NamedWitnessFieldExists** | lookup | `Lookup(RulebookFields.IsDerived via WitnessFieldName)` |
| **Requirements.DerivedHasComputedWitness** | formula | `And(ClaimsAWitnessField, NamedWitnessFieldExists)` |
| **Requirements.WitnessClaimIsUnverified** | formula | `Not(HasComputedWitness = DerivedHasComputedWitness)` |
| **Requirements.IsUnwitnessedBlockingControl** | formula | `And(IsBlocking, Not(DerivedHasComputedWitness))` |
| **Requirements.WitnessFireCount** | formula | `NegativeOutcomeCount` |
| **Requirements.WitnessHasNeverFired** | formula | `And(HasComputedWitness, WitnessFireCount = 0)` |
| **Requirements.EvaluationSampleSize** | formula | `SatisfactionRecordCount` |
| **Requirements.HasMeaningfulSample** | formula | `EvaluationSampleSize >= MinimumSampleForAssurance` |
| **Requirements.IsUntestedWitness** | formula | `And(WitnessHasNeverFired, Not(HasMeaningfulSample))` |
| **Requirements.IsEvidencedHoldingControl** | formula | `And(WitnessHasNeverFired, HasMeaningfulSample)` |
| **Requirements.ControlAssuranceState** | formula | `If(Not(IsBoundToAnyStep), "Decorative", If(Not(HasEverBeenEvaluated), "Inoperative", If(Not(HasComputedWitness), "Asserted", If(WitnessFireCount > 0, "Demonstrated", If(HasMeaningfulSample, "Holding", "Untested")))))` |
| **Requirements.UnexercisedBindingCount** | rollup | `Count(StepRequirements via UnexercisedBindingRequirementKey)` |
| **Requirements.WitnessIsPartiallyScoped** | formula | `And(HasComputedWitness, UnexercisedBindingCount > 0)` |
| **Requirements.AccountableAgent** | lookup | `Lookup(Roles.CurrentAgent via AccountableRole)` |
| **Requirements.HasNamedOwner** | formula | `AccountableRole <> ""` |
| **Requirements.IsOrphanedBlockingControl** | formula | `And(IsBlocking, Not(HasNamedOwner))` |
| **Requirements.IsUnwatchedAndUnowned** | formula | `And(IsBlocking, Not(HasComputedWitness), Not(HasNamedOwner))` |
| **Requirements.AttestationExposureNote** | formula | `If(Not(IsBlocking), "", If(IsUnwatchedAndUnowned, "Unwatched and unowned: exposure defaults to the signatory.", If(IsOrphanedBlockingControl, "Witnessed but unowned: no named accountability.", If(Not(HasComputedWitness), "Owned but unwitnessed: rests on human judgement.", ""))))` |
| **Requirements.UnwatchedUnownedFlag** | formula | `If(IsUnwatchedAndUnowned, "unwatched-unowned", "")` |
| **StepRequirements.Name** | formula | `Step & " / " & Requirement` |
| **StepRequirements.RequirementIsBlocking** | lookup | `Lookup(Requirements.IsBlocking via Requirement)` |
| **StepRequirements.BlockingStepKey** | formula | `If(RequirementIsBlocking, Step, "")` |
| **StepRequirements.StepWhenBlocking** | formula | `If(RequirementIsBlocking, Step, "")` |
| **StepRequirements.RequirementLacksWitness** | lookup | `Lookup(Requirements.IsUnwitnessedBlockingControl via Requirement)` |
| **StepRequirements.UnwitnessedStepKey** | formula | `If(RequirementLacksWitness, Step, "")` |
| **StepRequirements.SatisfactionCountForBinding** | rollup | `Count(RequirementSatisfactions via BindingKey)` |
| **StepRequirements.BindingWasEverExercised** | formula | `SatisfactionCountForBinding > 0` |
| **StepRequirements.IsUnexercisedBlockingBinding** | formula | `And(RequirementIsBlocking, Not(BindingWasEverExercised))` |
| **StepRequirements.UnexercisedBindingRequirementKey** | formula | `If(IsUnexercisedBlockingBinding, Requirement, "")` |
| **StepVerifications.Name** | formula | `Step & " / " & VerificationKind` |
| **Rationales.Name** | formula | `Title` |
| **Exceptions.Name** | formula | `Condition` |
| **Exceptions.ActiveExceptionStepKey** | formula | `If(Status = "Active", TriggerStep, "")` |
| **Resources.Name** | formula | `Title` |
| **Resources.IsApprovedSource** | formula | `ApprovalStatus = "Approved"` |
| **ProcedureResources.Name** | formula | `ProcedureVersion & " / " & Resource` |
| **ProcedureResources.RelationIri** | formula | `If(Relation = "wasExtractedFrom", "https://w3id.org/pko#wasExtractedFrom", "http://purl.org/dc/terms/references")` |
| **ElicitationSessions.Name** | formula | `Method & " / " & StartedAt` |
| **ElicitationSessions.AsOfInstant** | lookup | `Lookup(EvaluationContexts.AsOfInstant via EvaluationContext)` |
| **ElicitationSessions.DaysSinceElicited** | formula | `DaysBetween(AsOfInstant, EndedAt)` |
| **ElicitationSessions.IsSingleWitnessMethod** | formula | `Or(Method = "Shadowing", Method = "PractitionerInterview")` |
| **ElicitationSessions.PractitionerIsStillEngaged** | lookup | `Lookup(Agents.IsStillEngaged via PractitionerAgent)` |
| **ElicitationSessions.ValidFragmentsProduced** | rollup | `Count(KnowledgeFragments via ValidFragmentSessionKey)` |
| **ElicitationSessions.IsHighYieldSession** | formula | `ValidFragmentsProduced >= 3` |
| **ElicitationSessions.IsConcentratedSingleWitness** | formula | `And(IsSingleWitnessMethod, IsHighYieldSession)` |
| **ElicitationSessions.IsStaleConcentratedWitness** | formula | `And(IsConcentratedSingleWitness, DaysSinceElicited > 180)` |
| **ElicitationSessions.ConcentratedSessionVersionKey** | formula | `If(IsConcentratedSingleWitness, ProcedureVersion, "")` |
| **KnowledgeFragments.Name** | formula | `KnowledgeForm & ": " & Left(Statement, 60)` |
| **KnowledgeFragments.AsOfInstant** | lookup | `Lookup(EvaluationContexts.AsOfInstant via EvaluationContext)` |
| **KnowledgeFragments.IsCurrentlyValid** | formula | `And(ValidFrom <= AsOfInstant, Or(ValidTo = "", ValidTo > AsOfInstant), Status = "Approved")` |
| **KnowledgeFragments.SourceAgentIsStillEngaged** | lookup | `Lookup(Agents.IsStillEngaged via SourceAgent)` |
| **KnowledgeFragments.SourceAgentKind** | lookup | `Lookup(Agents.AgentKind via SourceAgent)` |
| **KnowledgeFragments.HasHumanSource** | formula | `SourceAgentKind = "Human"` |
| **KnowledgeFragments.HasOrphanedProvenance** | formula | `And(IsCurrentlyValid, Not(SourceAgentIsStillEngaged))` |
| **KnowledgeFragments.IsUndefendableTacitClaim** | formula | `And(HasOrphanedProvenance, Or(KnowledgeForm = "Tacit", KnowledgeForm = "SituatedJudgment"))` |
| **KnowledgeFragments.IsApproved** | formula | `Status = "Approved"` |
| **KnowledgeFragments.IsWithinValidityWindow** | formula | `And(ValidFrom <= AsOfInstant, Or(ValidTo = "", ValidTo > AsOfInstant))` |
| **KnowledgeFragments.IsReliedUpon** | formula | `And(Step <> "", IsWithinValidityWindow)` |
| **KnowledgeFragments.StepProcedureVersionStatus** | lookup | `Lookup(Steps.ProcedureVersion via Step)` |
| **KnowledgeFragments.IsAttachedToLiveVersion** | lookup | `Lookup(ProcedureVersions.IsLive via ProcedureVersion)` |
| **KnowledgeFragments.IsUnapprovedButReliedOn** | formula | `And(IsReliedUpon, IsAttachedToLiveVersion, Not(IsApproved))` |
| **KnowledgeFragments.EvidenceAgeDays** | lookup | `Lookup(ElicitationSessions.DaysSinceElicited via ElicitationSession)` |
| **KnowledgeFragments.HasRecordedElicitation** | formula | `ElicitationSession <> ""` |
| **KnowledgeFragments.IsFromSingleWitness** | lookup | `Lookup(ElicitationSessions.IsSingleWitnessMethod via ElicitationSession)` |
| **KnowledgeFragments.EvidenceExpiryDays** | formula | `If(IsFromSingleWitness, 180, 365)` |
| **KnowledgeFragments.EvidenceHasExpired** | formula | `And(HasRecordedElicitation, EvidenceAgeDays > EvidenceExpiryDays)` |
| **KnowledgeFragments.OwnerAgent** | lookup | `Lookup(Roles.CurrentAgent via OwnerRole)` |
| **KnowledgeFragments.IsAwaitingApproval** | formula | `Status = "Reviewed"` |
| **KnowledgeFragments.OwnerIsMe** | formula | `OwnerRole = "hr-policy-owner"` |
| **KnowledgeFragments.IsMyUnfinishedApproval** | formula | `And(OwnerIsMe, IsAwaitingApproval)` |
| **KnowledgeFragments.IsInvokedByAnException** | rollup | `Count(Exceptions via TriggerStep)` |
| **KnowledgeFragments.HasOperationalReliance** | formula | `IsInvokedByAnException > 0` |
| **KnowledgeFragments.IsUnapprovedAndOperationallyLive** | formula | `And(IsMyUnfinishedApproval, HasOperationalReliance)` |
| **KnowledgeFragments.AgeDays** | formula | `DaysBetween(AsOfInstant, ValidFrom)` |
| **KnowledgeFragments.IsLowConfidence** | formula | `Or(Confidence = "Medium", Confidence = "Low")` |
| **KnowledgeFragments.OwningVersionCadenceDays** | lookup | `Lookup(ProcedureVersions.StewardReviewCadenceDays via ProcedureVersion)` |
| **KnowledgeFragments.ExceedsOwningCadence** | formula | `AgeDays > OwningVersionCadenceDays` |
| **KnowledgeFragments.IsAgingLowConfidenceClaim** | formula | `And(ExceedsOwningCadence, IsLowConfidence)` |
| **KnowledgeFragments.OwnerRoleAgentKind** | lookup | `Lookup(Roles.CurrentAgentKind via OwnerRole)` |
| **KnowledgeFragments.IsHumanOwned** | formula | `OwnerRoleAgentKind = "Human"` |
| **KnowledgeFragments.IsAiValidatedByAi** | formula | `And(Not(SourceAgentKind = "Human"), Not(IsHumanOwned))` |
| **KnowledgeFragments.ReviewCadenceDays** | lookup | `Lookup(ProcedureVersions.StewardReviewCadenceDays via ProcedureVersion)` |
| **KnowledgeFragments.IsOverdueForReview** | formula | `And(IsCurrentlyValid, AgeDays > ReviewCadenceDays)` |
| **KnowledgeFragments.PredatesCurrentRoleHolder** | formula | `And(OwnerRoleAgentKind <> "", ValidFrom < OwnerRoleAssignmentValidFrom)` |
| **KnowledgeFragments.OwnerRoleAssignmentValidFrom** | lookup | `Lookup(Roles.CurrentAssignmentValidFrom via OwnerRole)` |
| **KnowledgeFragments.FragilitySignalCount** | formula | `If(IsFromSingleWitness, 1, 0) + If(IsOverdueForReview, 1, 0) + If(IsLowConfidence, 1, 0) + If(HasOperationalReliance, 1, 0)` |
| **KnowledgeFragments.IsCompoundFragile** | formula | `FragilitySignalCount >= 3` |
| **KnowledgeFragments.IsSinglePointOfFailure** | formula | `And(IsFromSingleWitness, HasOperationalReliance)` |
| **KnowledgeFragments.IsExpiringSinglePointOfFailure** | formula | `And(IsSinglePointOfFailure, IsOverdueForReview)` |
| **KnowledgeFragments.CompoundFragileVersionKey** | formula | `If(IsCompoundFragile, ProcedureVersion, "")` |
| **KnowledgeFragments.ValidFragmentSessionKey** | formula | `If(IsCurrentlyValid, ElicitationSession, "")` |
| **KnowledgeFragments.ConsumingStepIsSoftwareAssigned** | lookup | `Lookup(Steps.IsSoftwareAssigned via Step)` |
| **KnowledgeFragments.ConsumingStepAgentKind** | lookup | `Lookup(Steps.AssignedAgentKind via Step)` |
| **KnowledgeFragments.IsUnapprovedAndMachineConsumed** | formula | `And(IsUnapprovedButReliedOn, ConsumingStepIsSoftwareAssigned)` |
| **KnowledgeFragments.IsUnapprovedAndHumanConsumed** | formula | `And(IsUnapprovedButReliedOn, Not(ConsumingStepIsSoftwareAssigned))` |
| **KnowledgeFragments.MachineConsumedUnapprovedVersionKey** | formula | `If(IsUnapprovedAndMachineConsumed, ProcedureVersion, "")` |
| **KnowledgeFragments.HasReviewRecord** | formula | `LastReviewedAt <> ""` |
| **KnowledgeFragments.DaysSinceActualReview** | formula | `If(HasReviewRecord, DaysBetween(AsOfInstant, LastReviewedAt), 0)` |
| **KnowledgeFragments.IsUnreviewedSinceAuthoring** | formula | `And(IsCurrentlyValid, Not(HasReviewRecord))` |
| **KnowledgeFragments.IsGenuinelyOverdue** | formula | `And(IsCurrentlyValid, HasReviewRecord, DaysSinceActualReview > ReviewCadenceDays)` |
| **KnowledgeFragments.ReviewRecencyIsInferred** | formula | `And(IsOverdueForReview, Not(HasReviewRecord))` |
| **KnowledgeFragments.InferenceDisagreesWithRecord** | formula | `And(HasReviewRecord, IsOverdueForReview, Not(IsGenuinelyOverdue))` |
| **KnowledgeFragments.GenuinelyOverdueVersionKey** | formula | `If(IsGenuinelyOverdue, ProcedureVersion, "")` |
| **KnowledgeFragments.RatifiedBoundaryCount** | rollup | `Count(AuthorityBoundaries via RatifyingFragmentKey)` |
| **KnowledgeFragments.RelianceSurfaceCount** | formula | `IsInvokedByAnException + RatifiedBoundaryCount` |
| **KnowledgeFragments.DaysAwaitingMyApproval** | formula | `If(IsMyUnfinishedApproval, DaysBetween(AsOfInstant, ValidFrom), 0)` |
| **KnowledgeFragments.IsHighBlastRadiusUnapproved** | formula | `And(IsUnapprovedAndOperationallyLive, RelianceSurfaceCount > 1)` |
| **KnowledgeFragments.IsLongUnapproved** | formula | `And(IsMyUnfinishedApproval, DaysAwaitingMyApproval > 30)` |
| **KnowledgeFragments.UnapprovedLoadBearingVersionKey** | formula | `If(IsHighBlastRadiusUnapproved, ProcedureVersion, "")` |
| **KnowledgeFragments.OwnerRoleIsVacated** | lookup | `Lookup(Roles.IsVacatedRole via OwnerRole)` |
| **KnowledgeFragments.IsOrphanedByRole** | formula | `And(IsCurrentlyValid, OwnerRoleIsVacated)` |
| **KnowledgeFragments.ValidFragmentVersionKey** | formula | `If(IsCurrentlyValid, ProcedureVersion, "")` |
| **KnowledgeGaps.Name** | formula | `Severity & ": " & Left(Statement, 60)` |
| **KnowledgeGaps.IsOpen** | formula | `Or(Status = "Open", Status = "Investigating")` |
| **KnowledgeGaps.OpenGapVersionKey** | formula | `If(And(IsOpen, Severity = "High"), ProcedureVersion, "")` |
| **KnowledgeGaps.IsBlocking** | formula | `BlockingKind = "Blocking"` |
| **KnowledgeGaps.IsOpenAndBlocking** | formula | `And(IsOpen, IsBlocking)` |
| **KnowledgeGaps.AsOfInstant** | lookup | `Lookup(EvaluationContexts.AsOfInstant via EvaluationContext)` |
| **KnowledgeGaps.DaysOpen** | formula | `If(IsOpen, DaysBetween(AsOfInstant, IdentifiedAt), 0)` |
| **KnowledgeGaps.ToleranceDays** | formula | `If(Severity = "High", 30, If(Severity = "Medium", 90, 180))` |
| **KnowledgeGaps.IsOverdueGap** | formula | `DaysOpen > ToleranceDays` |
| **KnowledgeGaps.OwnerAgent** | lookup | `Lookup(Roles.CurrentAgent via OwnerRole)` |
| **KnowledgeGaps.OwnerIsStillEngaged** | lookup | `Lookup(Agents.IsStillEngaged via OwnerAgent)` |
| **KnowledgeGaps.HasResolutionPlan** | formula | `ResolutionPlan <> ""` |
| **KnowledgeGaps.IsAbandonedUnknown** | formula | `And(IsOverdueGap, Or(Not(HasResolutionPlan), Not(OwnerIsStillEngaged)))` |
| **KnowledgeGaps.OpenBlockingGapVersionKey** | formula | `If(IsOpenAndBlocking, ProcedureVersion, "")` |
| **KnowledgeGaps.OwnerRoleIsVacated** | lookup | `Lookup(Roles.IsVacatedRole via OwnerRole)` |
| **KnowledgeGaps.IsOwnerlessOpenGap** | formula | `And(IsOpen, OwnerRoleIsVacated)` |
| **FAQs.Name** | formula | `Question` |
| **Explanations.Name** | formula | `Title` |
| **ProcedureExecutions.Name** | formula | `ProcedureVersion & " / " & Context` |
| **ProcedureExecutions.ExpectedStepCount** | lookup | `Lookup(ProcedureVersions.SpecifiedStepCount via ProcedureVersion)` |
| **ProcedureExecutions.CompletedStepCount** | rollup | `Count(StepExecutions via CompletedExecutionKey)` |
| **ProcedureExecutions.ControlBreachCount** | rollup | `Count(StepExecutions via ControlBreachExecutionKey)` |
| **ProcedureExecutions.LateStepCount** | rollup | `Count(StepExecutions via LateExecutionKey)` |
| **ProcedureExecutions.IsStructurallyComplete** | formula | `CompletedStepCount >= ExpectedStepCount` |
| **ProcedureExecutions.DivergedFromSpecification** | formula | `Or(Not(IsStructurallyComplete), ControlBreachCount > 0)` |
| **ProcedureExecutions.AllBlockingControlsEvaluated** | formula | `UnevaluatedBlockingTotal = 0` |
| **ProcedureExecutions.UnevaluatedBlockingTotal** | rollup | `Count(StepExecutions via UnevaluatedBlockingExecutionKey)` |
| **ProcedureExecutions.SeparationOfDutiesHeld** | formula | `SeparationViolationCount = 0` |
| **ProcedureExecutions.SeparationViolationCount** | rollup | `Count(StepExecutions via SeparationViolationExecutionKey)` |
| **ProcedureExecutions.IsAttestationReady** | formula | `And(IsStructurallyComplete, Not(DivergedFromSpecification), AllBlockingControlsEvaluated, SeparationOfDutiesHeld)` |
| **ProcedureExecutions.AttestationBlockerSummary** | formula | `If(IsAttestationReady, "", If(Not(IsStructurallyComplete), "Incomplete: specified steps did not all complete.", If(SeparationViolationCount > 0, "Segregation of duties violated.", If(UnevaluatedBlockingTotal > 0, "Blocking controls were never evaluated.", "Control breach recorded on one or more steps."))))` |
| **ProcedureExecutions.ExecutedVersionIsFit** | lookup | `Lookup(ProcedureVersions.IsFitToExecute via ProcedureVersion)` |
| **ProcedureExecutions.SignedAgainstUnfitVersion** | formula | `And(ExecutionStatus = "Completed", Not(ExecutedVersionIsFit))` |
| **ProcedureExecutions.AssertedOnlyControlCount** | rollup | `Count(RequirementSatisfactions via AssertedOnlyExecutionKey)` |
| **ProcedureExecutions.AssuranceIsMostlyAsserted** | formula | `AssertedOnlyControlCount > 0` |
| **ProcedureExecutions.UnreachableHandlingFailureCount** | rollup | `Count(MessageDeliveries via UnreachableFailureKey)` |
| **ProcedureExecutions.RetentionBreachCount** | rollup | `Count(MessageDeliveries via RetentionBreachExecutionKey)` |
| **ProcedureExecutions.ClearedLegalReviewCount** | rollup | `Count(StepExecutions via ClearedLegalReviewKey)` |
| **ProcedureExecutions.HasClearedLegalReview** | formula | `ClearedLegalReviewCount > 0` |
| **ProcedureExecutions.AbandonedFailureCount** | rollup | `Count(MessageDeliveries via AbandonedFailureExecutionKey)` |
| **ProcedureExecutions.DeliveredCount** | rollup | `Count(MessageDeliveries via ReachedExecutionKey)` |
| **ProcedureExecutions.TotalDeliveryAttemptCount** | rollup | `Count(MessageDeliveries via ProcedureExecution)` |
| **ProcedureExecutions.HasAbandonedFailures** | formula | `AbandonedFailureCount > 0` |
| **ProcedureExecutions.MishandledRefusalCount** | rollup | `Count(SendIntents via RefusalFailureExecutionKey)` |
| **ProcedureExecutions.UncleanStepCount** | rollup | `Count(StepExecutions via ProcedureExecutionWhenUnclean)` |
| **ProcedureExecutions.RanClean** | formula | `UncleanStepCount = 0` |
| **ProcedureExecutions.CountOfApprovalExecutions** | rollup | `Count(StepExecutions via IsApprovalExecution)` |
| **ProcedureExecutions.HasHumanApproval** | formula | `CountOfApprovalExecutions > 0` |
| **ProcedureExecutions.CountOfDeliveryExecutions** | rollup | `Count(StepExecutions via Step)` |
| **ProcedureExecutions.HasDelivered** | formula | `CountOfDeliveryExecutions > 0` |
| **ProcedureExecutions.DeliveredWithoutApproval** | formula | `And(HasDelivered, Not(HasHumanApproval))` |
| **ProcedureExecutions.InvalidApprovalCount** | rollup | `Count(RequirementSatisfactions via RunWhenInvalidApproval)` |
| **ProcedureExecutions.ApprovalChainIsComplete** | formula | `InvalidApprovalCount = 0` |
| **ProcedureExecutions.VacuouslyCleanStepCount** | rollup | `Count(StepExecutions via VacuouslyCleanExecutionKey)` |
| **ProcedureExecutions.PreparationStepCount** | rollup | `Count(StepExecutions via PreparationExecutionKey)` |
| **ProcedureExecutions.ApprovalStepCount** | rollup | `Count(StepExecutions via ApprovalExecutionKey)` |
| **ProcedureExecutions.SeparationWasTestable** | formula | `And(PreparationStepCount > 0, ApprovalStepCount > 0)` |
| **ProcedureExecutions.SeparationHeldUnderTest** | formula | `And(SeparationWasTestable, SeparationOfDutiesHeld)` |
| **ProcedureExecutions.SeparationIsVacuouslyGreen** | formula | `And(SeparationOfDutiesHeld, Not(SeparationWasTestable))` |
| **ProcedureExecutions.SeparationAssuranceNote** | formula | `If(SeparationViolationCount > 0, "Violated: same agent prepared and approved.", If(SeparationIsVacuouslyGreen, "Not tested: this run had no preparation/approval pair.", "Held under test."))` |
| **ProcedureExecutions.UngovernedDivergenceCount** | rollup | `Count(StepExecutions via UngovernedDivergenceExecutionKey)` |
| **ProcedureExecutions.DivergenceWasFullyGoverned** | formula | `And(DivergedFromSpecification, UngovernedDivergenceCount = 0)` |
| **ProcedureExecutions.ComputedlyWitnessedControlCount** | rollup | `Count(RequirementSatisfactions via ComputedWitnessExecutionKey)` |
| **ProcedureExecutions.EvaluatedControlCount** | formula | `ComputedlyWitnessedControlCount + AssertedOnlyControlCount` |
| **ProcedureExecutions.ComputedAssuranceRatio** | formula | `If(EvaluatedControlCount = 0, 0, ComputedlyWitnessedControlCount / EvaluatedControlCount)` |
| **ProcedureExecutions.InterestedPartyAssertionCount** | rollup | `Count(RequirementSatisfactions via InterestedAssertionExecutionKey)` |
| **ProcedureExecutions.AssuranceGrade** | formula | `If(EvaluatedControlCount = 0, "None: no blocking control was evaluated.", If(InterestedPartyAssertionCount > 0, "Weak: at least one control rests on an interested-party assertion.", If(ComputedAssuranceRatio < 0.5, "Thin: most controls rest on human assertion.", If(ComputedAssuranceRatio < 1, "Mixed: computed and asserted controls.", "Computed: every evaluated control has a witness."))))` |
| **ProcedureExecutions.AttestationWouldBeWeaklyBased** | formula | `And(IsAttestationReady, Or(InterestedPartyAssertionCount > 0, ComputedAssuranceRatio < 0.5))` |
| **ProcedureExecutions.IndependentHumanObservationCount** | rollup | `Count(VerificationOutcomes via IndependentObservationExecutionKey)` |
| **ProcedureExecutions.HasAnyIndependentObservation** | formula | `IndependentHumanObservationCount > 0` |
| **ProcedureExecutions.SelfAttestedApprovalCount** | rollup | `Count(StepExecutions via SelfAttestedApprovalExecutionKey)` |
| **ProcedureExecutions.AssuranceChainIsCircular** | formula | `And(SelfAttestedApprovalCount > 0, Not(HasAnyIndependentObservation))` |
| **ProcedureExecutions.LatestAttestationInstant** | rollup | `Max(Attestations.SignedAt via ProcedureExecution)` |
| **ProcedureExecutions.HasBeenAttested** | formula | `AttestationCount > 0` |
| **ProcedureExecutions.AttestationCount** | rollup | `Count(Attestations via ProcedureExecution)` |
| **ProcedureExecutions.PostAttestationScoreCount** | rollup | `Count(RequirementSatisfactions via PostAttestationScoreExecutionKey)` |
| **ProcedureExecutions.BasisChangedAfterSignature** | formula | `And(HasBeenAttested, PostAttestationScoreCount > 0)` |
| **ProcedureExecutions.RequiresReAttestation** | formula | `And(BasisChangedAfterSignature, Not(IsAttestationReady))` |
| **ProcedureExecutions.IntendedRecipientCount** | rollup | `Count(SendIntents via IntentExecutionKey)` |
| **ProcedureExecutions.ReachedRecipientCount** | rollup | `Count(SendIntents via DeliveredIntentExecutionKey)` |
| **ProcedureExecutions.SilentlyDroppedCount** | rollup | `Count(SendIntents via DroppedIntentExecutionKey)` |
| **ProcedureExecutions.DeliveryYieldPercent** | formula | `If(IntendedRecipientCount > 0, ReachedRecipientCount * 100 / IntendedRecipientCount, 0)` |
| **ProcedureExecutions.CampaignSilentlyLostAudience** | formula | `SilentlyDroppedCount > 0` |
| **ProcedureExecutions.UnrecordedRefusalCount** | rollup | `Count(SendIntents via UnrecordedRefusalExecutionKey)` |
| **ProcedureExecutions.HasUnrecordedRefusals** | formula | `UnrecordedRefusalCount > 0` |
| **ProcedureExecutions.IndependentlyConfirmedIntentCount** | rollup | `Count(SendIntents via IndependentlyConfirmedExecutionKey)` |
| **ProcedureExecutions.SendDecisionsAreEntirelySelfWitnessed** | formula | `And(IntendedRecipientCount > 0, IndependentlyConfirmedIntentCount = 0)` |
| **StepExecutions.Name** | formula | `ProcedureExecution & " / " & Step` |
| **StepExecutions.ActualDurationMinutes** | formula | `If(EndedAt = "", 0, DaysBetween(EndedAt, StartedAt))` |
| **StepExecutions.ExpectedDurationMinutes** | lookup | `Lookup(Steps.ExpectedDurationMinutes via Step)` |
| **StepExecutions.IsLate** | formula | `ActualDurationMinutes > ExpectedDurationMinutes` |
| **StepExecutions.BlockingUnmetCount** | rollup | `Count(RequirementSatisfactions via StepExecution)` |
| **StepExecutions.BlockingUnmetCountSafe** | rollup | `Count(RequirementSatisfactions via BlockingUnmetStepKey)` |
| **StepExecutions.ProceededPastBlockingControl** | formula | `And(ExecutionStatus = "Completed", BlockingUnmetCountSafe > 0)` |
| **StepExecutions.ExpectedBlockingCount** | lookup | `Lookup(Steps.BlockingRequirementCount via Step)` |
| **StepExecutions.EvaluatedBlockingCount** | rollup | `Count(RequirementSatisfactions via BlockingSatisfactionStepKey)` |
| **StepExecutions.UnevaluatedBlockingCount** | formula | `ExpectedBlockingCount - EvaluatedBlockingCount` |
| **StepExecutions.HasUnevaluatedBlockingControl** | formula | `UnevaluatedBlockingCount > 0` |
| **StepExecutions.StaleAuthoritativeSourceCount** | lookup | `Lookup(Steps.AuthoritativeStaleCount via Step)` |
| **StepExecutions.RanOnStaleAuthoritativeSource** | formula | `StaleAuthoritativeSourceCount > 0` |
| **StepExecutions.HasDeviationNote** | formula | `Deviation <> ""` |
| **StepExecutions.IsLateAndUnexplained** | formula | `And(IsLate, Not(HasDeviationNote))` |
| **StepExecutions.AvailableExceptionCountForStep** | lookup | `Lookup(Steps.AvailableExceptionCount via Step)` |
| **StepExecutions.HadUninvokedExceptionAvailable** | formula | `And(IsLateAndUnexplained, AvailableExceptionCountForStep > 0)` |
| **StepExecutions.ExpectedVerificationCount** | lookup | `Lookup(Steps.DeclaredVerificationCount via Step)` |
| **StepExecutions.PerformedVerificationCount** | rollup | `Count(VerificationOutcomes via StepExecution)` |
| **StepExecutions.SkippedVerificationCount** | formula | `ExpectedVerificationCount - PerformedVerificationCount` |
| **StepExecutions.HasSkippedVerification** | formula | `SkippedVerificationCount > 0` |
| **StepExecutions.ClaimsPassWithoutEvidence** | formula | `And(VerificationResult = "PASS", HasSkippedVerification)` |
| **StepExecutions.StepIsPreparation** | lookup | `Lookup(Steps.IsPreparationStep via Step)` |
| **StepExecutions.StepIsApproval** | lookup | `Lookup(Steps.IsApprovalStep via Step)` |
| **StepExecutions.PreparerAgentKey** | formula | `If(StepIsPreparation, ProcedureExecution & "\|" & ExecutedByAgent, "")` |
| **StepExecutions.ApproverAgentKey** | formula | `If(StepIsApproval, ProcedureExecution & "\|" & ExecutedByAgent, "")` |
| **StepExecutions.PreparedByThisAgentCount** | rollup | `Count(StepExecutions via PreparerAgentKey)` |
| **StepExecutions.ViolatesSeparationOfDuties** | formula | `And(StepIsApproval, PreparedByThisAgentCount > 0)` |
| **StepExecutions.RequiredRoleForStep** | lookup | `Lookup(Steps.AssignedRole via Step)` |
| **StepExecutions.ExecutorRoleKey** | formula | `ExecutedByAgent & "\|" & RequiredRoleForStep` |
| **StepExecutions.ExecutorAuthorityCount** | rollup | `Count(RoleAssignments via AgentRoleKey)` |
| **StepExecutions.ExecutorHeldRequiredRole** | formula | `ExecutorAuthorityCount > 0` |
| **StepExecutions.IsUnauthorizedApproval** | formula | `And(StepIsApproval, Not(ExecutorHeldRequiredRole))` |
| **StepExecutions.CompletedExecutionKey** | formula | `If(ExecutionStatus = "Completed", ProcedureExecution, "")` |
| **StepExecutions.ControlBreachExecutionKey** | formula | `If(Or(ProceededPastBlockingControl, ViolatesSeparationOfDuties, IsUnauthorizedApproval, ClaimsPassWithoutEvidence), ProcedureExecution, "")` |
| **StepExecutions.LateExecutionKey** | formula | `If(IsLate, ProcedureExecution, "")` |
| **StepExecutions.ExecutorAgentKind** | lookup | `Lookup(Agents.AgentKind via ExecutedByAgent)` |
| **StepExecutions.ExecutorIsHuman** | formula | `ExecutorAgentKind = "Human"` |
| **StepExecutions.StepRequiresHumanConfirmation** | lookup | `Lookup(Steps.RequiresHumanConfirmation via Step)` |
| **StepExecutions.NonHumanRanHumanStep** | formula | `And(StepRequiresHumanConfirmation, Not(ExecutorIsHuman))` |
| **StepExecutions.NonHumanApproval** | formula | `And(StepIsApproval, Not(ExecutorIsHuman))` |
| **StepExecutions.UnevaluatedBlockingExecutionKey** | formula | `If(HasUnevaluatedBlockingControl, ProcedureExecution, "")` |
| **StepExecutions.SeparationViolationExecutionKey** | formula | `If(ViolatesSeparationOfDuties, ProcedureExecution, "")` |
| **StepExecutions.SelfWitnessedVerificationCount** | rollup | `Count(VerificationOutcomes via SelfWitnessedStepKey)` |
| **StepExecutions.UnbackedVerificationCount** | rollup | `Count(VerificationOutcomes via UnbackedStepKey)` |
| **StepExecutions.ApprovalRestsOnSelfAttestation** | formula | `And(StepIsApproval, Or(SelfWitnessedVerificationCount > 0, HasSkippedVerification))` |
| **StepExecutions.ExceptionInvocationCount** | rollup | `Count(ExceptionInvocations via StepExecution)` |
| **StepExecutions.RanUnderException** | formula | `ExceptionInvocationCount > 0` |
| **StepExecutions.IsCompleted** | formula | `ExecutionStatus = "Completed"` |
| **StepExecutions.IsVerificationPassed** | formula | `VerificationResult = "PASS"` |
| **StepExecutions.IsLegalReviewStep** | formula | `Step = "policy-04"` |
| **StepExecutions.ClearedLegalReviewKey** | formula | `If(And(IsLegalReviewStep, IsVerificationPassed), ProcedureExecution, "")` |
| **StepExecutions.AssignedRole** | lookup | `Lookup(Steps.AssignedRole via Step)` |
| **StepExecutions.RoleCurrentAgent** | lookup | `Lookup(Roles.CurrentAgent via AssignedRole)` |
| **StepExecutions.ExecutorIsDesignatedAgent** | formula | `ExecutedByAgent = RoleCurrentAgent` |
| **StepExecutions.InputsWereFreshAtRun** | lookup | `Lookup(Steps.InputsAreFresh via Step)` |
| **StepExecutions.RanOnStaleInputs** | formula | `And(ExecutionStatus = "Completed", Not(InputsWereFreshAtRun))` |
| **StepExecutions.UnresolvedIssueCount** | rollup | `Count(IssueOccurrences via StepExecutionWhenUnresolved)` |
| **StepExecutions.HasDeviation** | formula | `Deviation <> ""` |
| **StepExecutions.IsClean** | formula | `And(VerificationResult = "PASS", Not(HasDeviation), UnresolvedIssueCount = 0, Not(IsLate))` |
| **StepExecutions.ProcedureExecutionWhenUnclean** | formula | `If(IsClean, "", ProcedureExecution)` |
| **StepExecutions.EvaluatedRequirementCount** | rollup | `Count(RequirementSatisfactions via StepExecutionWhenScored)` |
| **StepExecutions.RequiredBlockingCount** | lookup | `Lookup(Steps.BlockingRequirementCount via Step)` |
| **StepExecutions.HasUnevaluatedBlockingRequirement** | formula | `EvaluatedRequirementCount < RequiredBlockingCount` |
| **StepExecutions.ExecutingAgentKind** | lookup | `Lookup(Agents.AgentKind via ExecutedByAgent)` |
| **StepExecutions.WasExecutedBySoftware** | formula | `Or(ExecutingAgentKind = "AIAgent", ExecutingAgentKind = "AutomatedPipeline")` |
| **StepExecutions.StepIsSoftwareAssigned** | lookup | `Lookup(Steps.IsSoftwareAssigned via Step)` |
| **StepExecutions.SoftwareDidHumanWork** | formula | `And(WasExecutedBySoftware, Not(StepIsSoftwareAssigned))` |
| **StepExecutions.IsApprovalExecution** | lookup | `Lookup(Steps.IsHumanApprovalGate via Step)` |
| **StepExecutions.IsVerified** | formula | `And(VerificationResult <> "", VerificationResult <> "PENDING", VerificationResult <> "FAIL")` |
| **StepExecutions.UnconfirmedNonHumanDecisionCount** | rollup | `Count(AgentDecisionRecords via StepExecutionWhenUnconfirmed)` |
| **StepExecutions.RequiresHumanConfirmation** | lookup | `Lookup(Steps.RequiresHumanConfirmation via Step)` |
| **StepExecutions.HumanConfirmationMissing** | formula | `And(RequiresHumanConfirmation, UnconfirmedNonHumanDecisionCount > 0)` |
| **StepExecutions.DraftedFromUnusableSource** | formula | `And(ExecutionStatus = "Completed", Not(InputsWereUsable))` |
| **StepExecutions.InputsWereUsable** | lookup | `Lookup(Steps.AllSourcesUsable via Step)` |
| **StepExecutions.SoftwareExecutionStepKey** | formula | `If(WasExecutedBySoftware, Step, "")` |
| **StepExecutions.StepControlKind** | lookup | `Lookup(Steps.ControlKind via Step)` |
| **StepExecutions.UnfalsifiedClearanceCount** | rollup | `Count(RequirementSatisfactions via UnfalsifiedClearanceStepKey)` |
| **StepExecutions.AllClearancesAreUnfalsified** | formula | `And(EvaluatedBlockingCount > 0, UnfalsifiedClearanceCount >= EvaluatedBlockingCount)` |
| **StepExecutions.StaleAtRunCount** | rollup | `Count(BindingObservations via StaleAtRunStepKey)` |
| **StepExecutions.WasStaleWhenIRanIt** | formula | `StaleAtRunCount > 0` |
| **StepExecutions.StalenessAnswerIsTenseDependent** | formula | `Not(WasStaleWhenIRanIt = RanOnStaleAuthoritativeSource)` |
| **StepExecutions.HasAnyDeclaredCheck** | formula | `Or(ExpectedVerificationCount > 0, ExpectedBlockingCount > 0)` |
| **StepExecutions.PerformedCheckCount** | formula | `PerformedVerificationCount + EvaluatedBlockingCount` |
| **StepExecutions.DeclaredCheckCount** | formula | `ExpectedVerificationCount + ExpectedBlockingCount` |
| **StepExecutions.IsUncheckedByDesign** | formula | `DeclaredCheckCount = 0` |
| **StepExecutions.IsVacuouslyClean** | formula | `And(IsClean, IsUncheckedByDesign)` |
| **StepExecutions.IsSubstantivelyClean** | formula | `And(IsClean, PerformedCheckCount >= DeclaredCheckCount, DeclaredCheckCount > 0)` |
| **StepExecutions.VacuouslyCleanExecutionKey** | formula | `If(IsVacuouslyClean, ProcedureExecution, "")` |
| **StepExecutions.UncorroboratedPassCount** | rollup | `Count(VerificationOutcomes via UncorroboratedPassStepKey)` |
| **StepExecutions.EvidencePositionIsWeak** | formula | `And(PerformedVerificationCount > 0, UncorroboratedPassCount >= PerformedVerificationCount)` |
| **StepExecutions.PreparationExecutionKey** | formula | `If(StepIsPreparation, ProcedureExecution, "")` |
| **StepExecutions.ApprovalExecutionKey** | formula | `If(StepIsApproval, ProcedureExecution, "")` |
| **StepExecutions.HasGoverningInstrument** | formula | `Or(RanUnderException, HasApprovedChangeCoverage)` |
| **StepExecutions.HasApprovedChangeCoverage** | lookup | `Lookup(ProcedureVersions.HasApprovedChangeRequest via VersionOfStep)` |
| **StepExecutions.VersionOfStep** | lookup | `Lookup(Steps.ProcedureVersion via Step)` |
| **StepExecutions.IsUngovernedDivergence** | formula | `And(Or(HasDeviation, IsLate, ProceededPastBlockingControl), Not(HasGoverningInstrument))` |
| **StepExecutions.UngovernedDivergenceExecutionKey** | formula | `If(IsUngovernedDivergence, ProcedureExecution, "")` |
| **StepExecutions.SelfAttestedApprovalExecutionKey** | formula | `If(ApprovalRestsOnSelfAttestation, ProcedureExecution, "")` |
| **RequirementSatisfactions.Name** | formula | `Requirement & " / " & SatisfactionLevel` |
| **RequirementSatisfactions.RequirementIsBlocking** | lookup | `Lookup(Requirements.IsBlocking via Requirement)` |
| **RequirementSatisfactions.IsFullySatisfied** | formula | `SatisfactionLevel = "Satisfied"` |
| **RequirementSatisfactions.IsBlockingAndUnmet** | formula | `And(RequirementIsBlocking, Not(IsFullySatisfied))` |
| **RequirementSatisfactions.BlockingUnmetStepKey** | formula | `If(IsBlockingAndUnmet, StepExecution, "")` |
| **RequirementSatisfactions.BlockingSatisfactionStepKey** | formula | `If(RequirementIsBlocking, StepExecution, "")` |
| **RequirementSatisfactions.NegativeOutcomeRequirementKey** | formula | `If(Not(IsFullySatisfied), Requirement, "")` |
| **RequirementSatisfactions.EvaluatorAgentKind** | lookup | `Lookup(Agents.AgentKind via EvaluatedByAgent)` |
| **RequirementSatisfactions.NonHumanEvaluatedHumanControl** | formula | `And(RequirementIsBlocking, EvaluatorAgentKind <> "Human")` |
| **RequirementSatisfactions.RequirementHasComputedWitness** | lookup | `Lookup(Requirements.HasComputedWitness via Requirement)` |
| **RequirementSatisfactions.IsAssertedOnly** | formula | `And(RequirementIsBlocking, IsFullySatisfied, Not(RequirementHasComputedWitness))` |
| **RequirementSatisfactions.AssertedOnlyExecutionKey** | formula | `If(IsAssertedOnly, ParentProcedureExecution, "")` |
| **RequirementSatisfactions.ParentProcedureExecution** | lookup | `Lookup(StepExecutions.ProcedureExecution via StepExecution)` |
| **RequirementSatisfactions.StepExecutionWhenScored** | formula | `If(SatisfactionLevel <> "", StepExecution, "")` |
| **RequirementSatisfactions.IsHumanEvaluated** | formula | `EvaluatorAgentKind = "Human"` |
| **RequirementSatisfactions.RequirementIsApprovalType** | lookup | `Lookup(Requirements.RequirementType via Requirement)` |
| **RequirementSatisfactions.IsInvalidApproval** | formula | `And(RequirementIsApprovalType = "Approval", Or(Not(IsFullySatisfied), Not(IsHumanEvaluated)))` |
| **RequirementSatisfactions.ProcedureExecutionOfSatisfaction** | lookup | `Lookup(StepExecutions.ProcedureExecution via StepExecution)` |
| **RequirementSatisfactions.RunWhenInvalidApproval** | formula | `If(IsInvalidApproval, ProcedureExecutionOfSatisfaction, "")` |
| **RequirementSatisfactions.RequirementIsUnfalsified** | lookup | `Lookup(Requirements.IsUnfalsifiedControl via Requirement)` |
| **RequirementSatisfactions.IsClearanceByUnfalsifiedControl** | formula | `And(IsFullySatisfied, RequirementIsBlocking, RequirementIsUnfalsified)` |
| **RequirementSatisfactions.UnfalsifiedClearanceStepKey** | formula | `If(IsClearanceByUnfalsifiedControl, StepExecution, "")` |
| **RequirementSatisfactions.SpecStepOfExecution** | lookup | `Lookup(StepExecutions.Step via StepExecution)` |
| **RequirementSatisfactions.BindingKey** | lookup | `Lookup(StepRequirements.StepRequirementId via RequirementSatisfactionId)` |
| **RequirementSatisfactions.ScoredStepExecutorAgent** | lookup | `Lookup(StepExecutions.ExecutedByAgent via StepExecution)` |
| **RequirementSatisfactions.EvaluatorIsStepExecutor** | formula | `EvaluatedByAgent = ScoredStepExecutorAgent` |
| **RequirementSatisfactions.RunOwnerAgent** | lookup | `Lookup(ProcedureExecutions.ExecutedByAgent via ParentProcedureExecution)` |
| **RequirementSatisfactions.EvaluatorOwnsTheRun** | formula | `EvaluatedByAgent = RunOwnerAgent` |
| **RequirementSatisfactions.IsInterestedPartyAssertion** | formula | `And(IsAssertedOnly, Or(EvaluatorIsStepExecutor, EvaluatorOwnsTheRun))` |
| **RequirementSatisfactions.HasWrittenEvidence** | formula | `Evidence <> ""` |
| **RequirementSatisfactions.IsBareAssertion** | formula | `And(IsAssertedOnly, Not(HasWrittenEvidence))` |
| **RequirementSatisfactions.InterestedAssertionExecutionKey** | formula | `If(IsInterestedPartyAssertion, ParentProcedureExecution, "")` |
| **RequirementSatisfactions.IsComputedlyWitnessed** | formula | `And(RequirementIsBlocking, RequirementHasComputedWitness)` |
| **RequirementSatisfactions.ComputedWitnessExecutionKey** | formula | `If(IsComputedlyWitnessed, ParentProcedureExecution, "")` |
| **RequirementSatisfactions.StepExecutorAgent** | lookup | `Lookup(StepExecutions.ExecutedByAgent via StepExecution)` |
| **RequirementSatisfactions.WasScoredAfterAttestation** | formula | `DaysBetween(EvaluatedAt, AttestationInstantForRun) > 0` |
| **RequirementSatisfactions.AttestationInstantForRun** | lookup | `Lookup(ProcedureExecutions.LatestAttestationInstant via ParentProcedureExecution)` |
| **RequirementSatisfactions.PostAttestationScoreExecutionKey** | formula | `If(WasScoredAfterAttestation, ParentProcedureExecution, "")` |
| **Errors.Name** | formula | `ErrorCode & " - " & Label` |
| **IssueOccurrences.Name** | formula | `Error & " @ " & OccurredAt` |
| **IssueOccurrences.IsUnresolved** | formula | `Or(Status = "Open", Status = "Investigating", Status = "Monitoring")` |
| **IssueOccurrences.StepExecutionWhenUnresolved** | formula | `If(IsUnresolved, StepExecution, "")` |
| **UserQuestions.Name** | formula | `Left(QuestionText, 70)` |
| **UserFeedback.Name** | formula | `Disposition & ": " & Left(FeedbackText, 60)` |
| **StewardshipAssignments.Name** | formula | `ProcedureVersion & " / steward=" & StewardRole` |
| **StewardshipAssignments.CountOfReviewEvents** | rollup | `Count(ReviewEvents via ProcedureVersion)` |
| **StewardshipAssignments.HasEverBeenReviewed** | formula | `CountOfReviewEvents > 0` |
| **StewardshipAssignments.AsOfInstant** | lookup | `Lookup(EvaluationContexts.AsOfInstant via EvaluationContext)` |
| **StewardshipAssignments.IsCurrentAssignment** | formula | `And(ValidFrom <= AsOfInstant, Or(ValidTo = "", ValidTo > AsOfInstant))` |
| **ChangeRequests.Name** | formula | `Title` |
| **ChangeRequests.IsOpen** | formula | `And(Or(Status = "Draft", Status = "UnderReview", Status = "Approved"), ImplementedAt = "")` |
| **ChangeRequests.OpenChangeVersionKey** | formula | `If(IsOpen, ProcedureVersion, "")` |
| **ChangeRequests.IsDecided** | formula | `DecidedAt <> ""` |
| **ChangeRequests.AsOfInstant** | lookup | `Lookup(EvaluationContexts.AsOfInstant via EvaluationContext)` |
| **ChangeRequests.DaysPending** | formula | `If(IsDecided, DaysBetween(DecidedAt, RequestedAt), DaysBetween(AsOfInstant, RequestedAt))` |
| **ChangeRequests.IsStillPending** | formula | `And(IsOpen, Not(IsDecided))` |
| **ChangeRequests.IsStalled** | formula | `And(IsStillPending, DaysPending > 14)` |
| **ChangeRequests.AuthorityAgent** | lookup | `Lookup(Roles.CurrentAgent via AuthorityRole)` |
| **ChangeRequests.RequesterIsAuthority** | formula | `RequestedByAgent = AuthorityAgent` |
| **ChangeRequests.AwaitsAuthorityDecision** | formula | `And(Status = "UnderReview", Not(IsDecided))` |
| **ChangeRequests.AuthorityRoleLabel** | lookup | `Lookup(Roles.Label via AuthorityRole)` |
| **ChangeRequests.TouchesLiveVersion** | lookup | `Lookup(ProcedureVersions.IsLive via ProcedureVersion)` |
| **ChangeRequests.IsLiveDecisionBacklog** | formula | `And(AwaitsAuthorityDecision, TouchesLiveVersion)` |
| **ChangeRequests.BlocksAnOpenGap** | formula | `And(IsLiveDecisionBacklog, ChangeKind = "Enhancement")` |
| **ChangeRequests.BacklogVersionKey** | formula | `If(IsLiveDecisionBacklog, ProcedureVersion, "")` |
| **ChangeRequests.IsMyPendingDecision** | formula | `And(AuthorityRole = "hr-policy-owner", AwaitsAuthorityDecision)` |
| **ChangeRequests.IsMyBlockingBacklog** | formula | `And(IsMyPendingDecision, BlocksAnOpenGap)` |
| **ChangeRequests.IsMyOverdueBacklog** | formula | `And(IsMyBlockingBacklog, DaysPending > 14)` |
| **ChangeRequests.IsImplemented** | formula | `ImplementedAt <> ""` |
| **ChangeRequests.IsMyDecidedRequest** | formula | `And(AuthorityRole = "hr-policy-owner", IsDecided)` |
| **ChangeRequests.IsMyDecidedButUnlanded** | formula | `And(IsMyDecidedRequest, Not(IsImplemented))` |
| **ChangeRequests.DecisionLatencyDays** | formula | `If(IsDecided, DaysBetween(DecidedAt, RequestedAt), 0)` |
| **ChangeRequests.ImplementationLatencyDays** | formula | `If(IsImplemented, DaysBetween(ImplementedAt, DecidedAt), 0)` |
| **ChangeRequests.DelayIsDownstreamOfMe** | formula | `And(IsMyDecidedButUnlanded, DecisionLatencyDays <= 14)` |
| **ChangeRequests.UnlandedVersionKey** | formula | `If(IsMyDecidedButUnlanded, ProcedureVersion, "")` |
| **ChangeRequests.IsApprovedNotImplemented** | formula | `And(Status = "Approved", Not(IsImplemented))` |
| **ChangeRequests.DaysSinceApproval** | formula | `If(IsDecided, DaysBetween(AsOfInstant, DecidedAt), 0)` |
| **ChangeRequests.IsStalledImplementation** | formula | `And(IsApprovedNotImplemented, DaysSinceApproval > 14)` |
| **ChangeRequests.StalledImplementationVersionKey** | formula | `If(IsStalledImplementation, ProcedureVersion, "")` |
| **ChangeRequests.ApprovedVersionKey** | formula | `If(IsApprovedDecision, ProcedureVersion, "")` |
| **ChangeRequests.IsApprovedDecision** | formula | `Status = "Approved"` |
| **ReviewEvents.Name** | formula | `ProcedureVersion & " / " & ReviewKind` |
| **ReviewEvents.AsOfInstant** | lookup | `Lookup(EvaluationContexts.AsOfInstant via EvaluationContext)` |
| **ReviewEvents.IsOverdue** | formula | `NextReviewDue < AsOfInstant` |
| **ReviewEvents.OverdueVersionKey** | formula | `If(IsOverdue, ProcedureVersion, "")` |
| **ReviewEvents.PromisedCadenceDays** | lookup | `Lookup(ProcedureVersions.StewardReviewCadenceDays via ProcedureVersion)` |
| **ReviewEvents.DaysSinceReviewed** | formula | `DaysBetween(AsOfInstant, ReviewedAt)` |
| **ReviewEvents.ExceedsPromisedCadence** | formula | `DaysSinceReviewed > PromisedCadenceDays` |
| **ReviewEvents.CadenceDriftDays** | formula | `DaysSinceReviewed - PromisedCadenceDays` |
| **ReviewEvents.PromiseAndBehaviorDisagree** | formula | `And(ExceedsPromisedCadence, Not(IsOverdue))` |
| **ReviewEvents.CadenceBreachVersionKey** | formula | `If(ExceedsPromisedCadence, ProcedureVersion, "")` |
| **LearningActivities.Name** | formula | `ActivityKind & " / " & OccurredAt` |
| **OperationalBindings.Name** | formula | `Step & " / " & RecordOrSchemaKey` |
| **OperationalBindings.AsOfInstant** | lookup | `Lookup(EvaluationContexts.AsOfInstant via EvaluationContext)` |
| **OperationalBindings.AgeMinutes** | formula | `DaysBetween(AsOfInstant, LastObservedAt)` |
| **OperationalBindings.IsFresh** | formula | `AgeMinutes <= FreshnessSlaMinutes` |
| **OperationalBindings.StaleBindingStepKey** | formula | `If(Not(IsFresh), Step, "")` |
| **OperationalBindings.AuthoritativeStaleStepKey** | formula | `If(And(Not(IsFresh), IsAuthoritative), Step, "")` |
| **OperationalBindings.IsStaleAndAuthoritative** | formula | `And(IsAuthoritative, Not(IsFresh))` |
| **OperationalBindings.StepWhenStale** | formula | `If(IsStaleAndAuthoritative, Step, "")` |
| **OperationalBindings.ResourceIsApproved** | lookup | `Lookup(Resources.IsApprovedSource via Resource)` |
| **OperationalBindings.IsUsableForDrafting** | formula | `And(ResourceIsApproved, IsFresh)` |
| **OperationalBindings.StepWhenUnusable** | formula | `If(IsUsableForDrafting, "", Step)` |
| **CommunicationPolicies.Name** | formula | `Channel & " policy / " & ProcedureVersion` |
| **CommunicationPolicies.ConsentViolationCount** | rollup | `Count(MessageDeliveries via PolicyChannel)` |
| **CommunicationPolicies.QuietHoursViolationCount** | rollup | `Count(MessageDeliveries via QuietHoursViolationPolicyKey)` |
| **CommunicationPolicies.IsActivePolicy** | formula | `Status = "Active"` |
| **MessageTemplates.Name** | formula | `CommunicationPolicy & " / " & Locale` |
| **MessageTemplates.PolicyMaxMessageLength** | lookup | `Lookup(CommunicationPolicies.MaxMessageLength via CommunicationPolicy)` |
| **MessageTemplates.PolicyMaxSegments** | lookup | `Lookup(CommunicationPolicies.MaxSegments via CommunicationPolicy)` |
| **MessageTemplates.BodyTemplateLength** | formula | `Len(BodyTemplate)` |
| **MessageTemplates.IsTemplateOverLength** | formula | `BodyTemplateLength > PolicyMaxMessageLength` |
| **MessageTemplates.ValidApprovalCount** | rollup | `Count(TemplateApprovals via ValidApprovalTemplateKey)` |
| **MessageTemplates.HasValidApproval** | formula | `ValidApprovalCount > 0` |
| **MessageTemplates.IsClaimingUnbackedApproval** | formula | `And(Status = "Approved", Not(HasValidApproval))` |
| **MessageTemplates.LastApprovedBodyHash** | lookup | `Lookup(TemplateApprovals.ApprovedBodyHash via LastValidApproval)` |
| **MessageTemplates.HasBodyDrifted** | formula | `And(LastApprovedBodyHash <> "", CurrentBodyHash <> LastApprovedBodyHash)` |
| **MessageTemplates.IsSendableUnderApproval** | formula | `And(Status = "Approved", And(HasValidApproval, Not(HasBodyDrifted)))` |
| **MessageTemplates.DriftedSendCount** | rollup | `Count(MessageDeliveries via DriftedSendTemplateKey)` |
| **MessageTemplates.UnansweredDeliveryCount** | rollup | `Count(MessageDeliveries via UnansweredTemplateKey)` |
| **MessageTemplates.TransmittedDeliveryCount** | rollup | `Count(MessageDeliveries via TransmittedTemplateKey)` |
| **MessageTemplates.TemplateDrawsNoResponse** | formula | `And(TransmittedDeliveryCount > 0, UnansweredDeliveryCount = TransmittedDeliveryCount)` |
| **MessageTemplates.LastApprovalAt** | lookup | `Lookup(TemplateApprovals.DecidedAt via LastValidApproval)` |
| **SemanticMappings.Name** | formula | `SourcePath & " -> " & TargetIri` |
| **WitnessLoops.Name** | formula | `"Loop " & LoopNumber & ": " & Title` |
| **WitnessLoops.QuestionCount** | rollup | `Count(RoleQuestions via WitnessLoop)` |
| **WitnessLoops.IsComplete** | formula | `CompletedAt <> ""` |
| **RoleQuestions.Name** | formula | `AskingRole & ": " & Left(QuestionText, 60)` |
| **RoleQuestions.PredicateCount** | rollup | `Count(RulebookFields via InventedForQuestion)` |
| **RoleQuestions.IsAnswered** | formula | `PredicateCount > 0` |
| **RulebookFields.Name** | formula | `TargetTable & "." & FieldName` |
| **RulebookFields.IsDerived** | formula | `Or(FieldType = "calculated", FieldType = "lookup", FieldType = "aggregation")` |
| **RulebookFields.IsWitness** | formula | `InventedForQuestion <> ""` |
| **TestSuites.Name** | formula | `Label` |
| **TestSuites.TestCount** | rollup | `Count(TestCases via Suite)` |
| **TestSuites.PassCount** | rollup | `Count(TestCases via PassingSuiteKey)` |
| **TestSuites.BlockingFailCount** | rollup | `Count(TestCases via NeedsAttentionSuiteKey)` |
| **TestSuites.IsGreen** | formula | `BlockingFailCount = 0` |
| **TestCases.Name** | formula | `TestKind & ": " & Subject` |
| **TestCases.IsBlocking** | formula | `Severity = "blocking"` |
| **TestCases.IsPassing** | formula | `LastOutcome = "PASS"` |
| **TestCases.IsFailing** | formula | `LastOutcome = "FAIL"` |
| **TestCases.NeedsAttention** | formula | `And(IsFailing, IsBlocking)` |
| **TestCases.PassingSuiteKey** | formula | `If(IsPassing, Suite, "")` |
| **TestCases.NeedsAttentionSuiteKey** | formula | `If(NeedsAttention, Suite, "")` |
| **ExceptionInvocations.Name** | formula | `StepExecution & " / " & Exception` |
| **ExceptionInvocations.ExpectedHandling** | lookup | `Lookup(Exceptions.Handling via Exception)` |
| **ExceptionInvocations.RequiredApprovalRole** | lookup | `Lookup(Exceptions.ApprovalRole via Exception)` |
| **ExceptionInvocations.RequiredApprovalRoleHolder** | lookup | `Lookup(Roles.CurrentAgent via RequiredApprovalRole)` |
| **ExceptionInvocations.ApprovalRoleMatches** | formula | `ApprovedByAgent = RequiredApprovalRoleHolder` |
| **ExceptionInvocations.IsApproved** | formula | `ApprovedByAgent <> ""` |
| **ExceptionInvocations.IsImproperlyApproved** | formula | `Or(Not(IsApproved), Not(ApprovalRoleMatches))` |
| **ExceptionInvocations.InvokerAgentKind** | lookup | `Lookup(Agents.AgentKind via InvokedByAgent)` |
| **ExceptionInvocations.InvokerAlsoPreparedKey** | formula | `ParentProcedureExecution & "\|" & ApprovedByAgent` |
| **ExceptionInvocations.ParentProcedureExecution** | lookup | `Lookup(StepExecutions.ProcedureExecution via StepExecution)` |
| **ExceptionInvocations.ApproverPreparedCount** | rollup | `Count(StepExecutions via PreparerAgentKey)` |
| **ExceptionInvocations.DelegatedToPreparer** | formula | `ApproverPreparedCount > 0` |
| **ExceptionInvocations.IsUngovernedInvocation** | formula | `Or(IsImproperlyApproved, DelegatedToPreparer)` |
| **VerificationOutcomes.Name** | formula | `StepExecution & " / " & StepVerification` |
| **VerificationOutcomes.ExpectedSignalValue** | lookup | `Lookup(StepVerifications.ExpectedSignalValue via StepVerification)` |
| **VerificationOutcomes.SignalIdentifier** | lookup | `Lookup(StepVerifications.SignalIdentifier via StepVerification)` |
| **VerificationOutcomes.SignalMatchesExpected** | formula | `ObservedSignalValue = ExpectedSignalValue` |
| **VerificationOutcomes.HasEvidence** | formula | `EvidenceUri <> ""` |
| **VerificationOutcomes.IsUnbackedObservation** | formula | `And(SignalMatchesExpected, Not(HasEvidence))` |
| **VerificationOutcomes.IsSelfWitnessed** | formula | `ObservedByAgent = StepExecutorAgent` |
| **VerificationOutcomes.StepExecutorAgent** | lookup | `Lookup(StepExecutions.ExecutedByAgent via StepExecution)` |
| **VerificationOutcomes.SelfWitnessedStepKey** | formula | `If(IsSelfWitnessed, StepExecution, "")` |
| **VerificationOutcomes.UnbackedStepKey** | formula | `If(IsUnbackedObservation, StepExecution, "")` |
| **VerificationOutcomes.IsSelfWitnessedAndUnbacked** | formula | `And(IsSelfWitnessed, Not(HasEvidence))` |
| **VerificationOutcomes.IsUncorroboratedPass** | formula | `And(SignalMatchesExpected, IsSelfWitnessedAndUnbacked)` |
| **VerificationOutcomes.UncorroboratedPassStepKey** | formula | `If(IsUncorroboratedPass, StepExecution, "")` |
| **VerificationOutcomes.ObserverIsNonHuman** | lookup | `Lookup(Agents.IsNonHuman via ObservedByAgent)` |
| **VerificationOutcomes.ObserverIsIndependentOfExecutor** | formula | `Not(IsSelfWitnessed)` |
| **VerificationOutcomes.IsIndependentHumanObservation** | formula | `And(Not(ObserverIsNonHuman), Not(IsSelfWitnessed), HasEvidence)` |
| **VerificationOutcomes.IndependentObservationExecutionKey** | formula | `If(IsIndependentHumanObservation, ParentProcedureExecutionOfOutcome, "")` |
| **VerificationOutcomes.ParentProcedureExecutionOfOutcome** | lookup | `Lookup(StepExecutions.ProcedureExecution via StepExecution)` |
| **ObservedTransitions.Name** | formula | `StepTransition & " @ " & ObservedAt` |
| **Recipients.Name** | formula | `DisplayName` |
| **Recipients.HasSmsConsent** | formula | `SmsConsentStatus = "Granted"` |
| **Recipients.IsEmailReachable** | formula | `EmailAddress <> ""` |
| **Recipients.IsSmsReachable** | formula | `MobileNumber <> ""` |
| **Recipients.IsUnreachable** | formula | `And(Not(IsEmailReachable), Not(IsSmsReachable))` |
| **Recipients.IsCommunicationallyStranded** | formula | `And(Not(IsSmsReachable), Not(IsEmailReachable))` |
| **MessageDeliveries.Name** | formula | `Recipient & " / " & MessageTemplate & " / " & SentAt` |
| **MessageDeliveries.PolicyChannel** | lookup | `Lookup(MessageTemplates.CommunicationPolicy via MessageTemplate)` |
| **MessageDeliveries.ChannelName** | lookup | `Lookup(CommunicationPolicies.Channel via PolicyChannel)` |
| **MessageDeliveries.PolicyRequiresConsent** | lookup | `Lookup(CommunicationPolicies.ConsentRequired via PolicyChannel)` |
| **MessageDeliveries.RecipientHasSmsConsent** | lookup | `Lookup(Recipients.HasSmsConsent via Recipient)` |
| **MessageDeliveries.WasActuallyTransmitted** | formula | `Or(DeliveryStatus = "Sent", Or(DeliveryStatus = "Delivered", DeliveryStatus = "Bounced"))` |
| **MessageDeliveries.IsConsentViolation** | formula | `And(WasActuallyTransmitted, And(PolicyRequiresConsent, Not(RecipientHasSmsConsent)))` |
| **MessageDeliveries.ConsentViolationPolicyKey** | formula | `If(IsConsentViolation, PolicyChannel, "")` |
| **MessageDeliveries.PolicyQuietHoursStartHour** | lookup | `Lookup(CommunicationPolicies.QuietHoursStartHour via PolicyChannel)` |
| **MessageDeliveries.PolicyQuietHoursEndHour** | lookup | `Lookup(CommunicationPolicies.QuietHoursEndHour via PolicyChannel)` |
| **MessageDeliveries.PolicyHasQuietHours** | formula | `PolicyQuietHoursStartHour <> PolicyQuietHoursEndHour` |
| **MessageDeliveries.QuietWindowWrapsMidnight** | formula | `PolicyQuietHoursStartHour > PolicyQuietHoursEndHour` |
| **MessageDeliveries.IsInsideQuietWindow** | formula | `If(QuietWindowWrapsMidnight, Or(SentAtLocalHour >= PolicyQuietHoursStartHour, SentAtLocalHour < PolicyQuietHoursEndHour), And(SentAtLocalHour >= PolicyQuietHoursStartHour, SentAtLocalHour < PolicyQuietHoursEndHour))` |
| **MessageDeliveries.IsQuietHoursViolation** | formula | `And(WasActuallyTransmitted, And(PolicyHasQuietHours, IsInsideQuietWindow))` |
| **MessageDeliveries.QuietHoursViolationPolicyKey** | formula | `If(IsQuietHoursViolation, PolicyChannel, "")` |
| **MessageDeliveries.RecipientIsUnreachable** | lookup | `Lookup(Recipients.IsUnreachable via Recipient)` |
| **MessageDeliveries.IsAcknowledged** | formula | `AcknowledgedAt <> ""` |
| **MessageDeliveries.InvokedExceptionCondition** | lookup | `Lookup(Exceptions.Condition via InvokedException)` |
| **MessageDeliveries.HasUnreachableExceptionInvoked** | formula | `InvokedException = "exc-unreachable"` |
| **MessageDeliveries.IsFabricatedAcknowledgement** | formula | `And(RecipientIsUnreachable, IsAcknowledged)` |
| **MessageDeliveries.IsUnhandledUnreachable** | formula | `And(RecipientIsUnreachable, Not(HasUnreachableExceptionInvoked))` |
| **MessageDeliveries.UnreachableFailureKey** | formula | `If(Or(IsFabricatedAcknowledgement, IsUnhandledUnreachable), ProcedureExecution, "")` |
| **MessageDeliveries.PolicyRetentionDays** | lookup | `Lookup(CommunicationPolicies.RetentionDays via PolicyChannel)` |
| **MessageDeliveries.AsOfInstant** | lookup | `Lookup(EvaluationContexts.AsOfInstant via EvaluationContext)` |
| **MessageDeliveries.AgeDays** | formula | `DaysBetween(AsOfInstant, SentAt)` |
| **MessageDeliveries.IsWithinRetentionWindow** | formula | `AgeDays <= PolicyRetentionDays` |
| **MessageDeliveries.HasRenderedBody** | formula | `RenderedBody <> ""` |
| **MessageDeliveries.IsEvidenceRequired** | formula | `And(WasActuallyTransmitted, IsWithinRetentionWindow)` |
| **MessageDeliveries.IsRetentionBreach** | formula | `And(IsEvidenceRequired, Not(HasRenderedBody))` |
| **MessageDeliveries.RetentionBreachExecutionKey** | formula | `If(IsRetentionBreach, ProcedureExecution, "")` |
| **MessageDeliveries.SendingStepExecutionStep** | lookup | `Lookup(StepExecutions.Step via StepExecution)` |
| **MessageDeliveries.ExecutionHasClearedLegalReview** | lookup | `Lookup(ProcedureExecutions.HasClearedLegalReview via ProcedureExecution)` |
| **MessageDeliveries.IsUnreviewedSend** | formula | `And(WasActuallyTransmitted, Not(ExecutionHasClearedLegalReview))` |
| **MessageDeliveries.RenderedBodyLength** | formula | `Len(RenderedBody)` |
| **MessageDeliveries.PolicyMaxMessageLengthAtSend** | lookup | `Lookup(CommunicationPolicies.MaxMessageLength via PolicyChannel)` |
| **MessageDeliveries.SegmentCount** | formula | `If(RenderedBodyLength = 0, 0, If(RenderedBodyLength <= PolicyMaxMessageLengthAtSend, 1, Roundup(RenderedBodyLength / PolicyMaxMessageLengthAtSend, 0)))` |
| **MessageDeliveries.PolicyMaxSegmentsAtSend** | lookup | `Lookup(CommunicationPolicies.MaxSegments via PolicyChannel)` |
| **MessageDeliveries.IsOverSegmentLimit** | formula | `And(WasActuallyTransmitted, SegmentCount > PolicyMaxSegmentsAtSend)` |
| **MessageDeliveries.TemplateHasValidApproval** | lookup | `Lookup(MessageTemplates.HasValidApproval via MessageTemplate)` |
| **MessageDeliveries.IsUnapprovedSend** | formula | `And(WasActuallyTransmitted, Not(TemplateHasValidApproval))` |
| **MessageDeliveries.PolicyRequiredOptOutPhrase** | lookup | `Lookup(CommunicationPolicies.RequiredOptOutPhrase via PolicyChannel)` |
| **MessageDeliveries.PolicyRequiresOptOut** | formula | `PolicyRequiredOptOutPhrase <> ""` |
| **MessageDeliveries.OptOutPhrasePosition** | formula | `Find(PolicyRequiredOptOutPhrase, RenderedBody)` |
| **MessageDeliveries.HasOptOutPhrase** | formula | `OptOutPhrasePosition > 0` |
| **MessageDeliveries.IsOptOutInFirstSegment** | formula | `And(HasOptOutPhrase, OptOutPhrasePosition <= PolicyMaxMessageLengthAtSend)` |
| **MessageDeliveries.IsMissingRequiredOptOut** | formula | `And(WasActuallyTransmitted, And(PolicyRequiresOptOut, Not(HasOptOutPhrase)))` |
| **MessageDeliveries.IsOptOutAtRiskOfTruncation** | formula | `And(WasActuallyTransmitted, And(PolicyRequiresOptOut, And(HasOptOutPhrase, Not(IsOptOutInFirstSegment))))` |
| **MessageDeliveries.IsFailedDelivery** | formula | `Or(DeliveryStatus = "Failed", DeliveryStatus = "Bounced")` |
| **MessageDeliveries.IsSuppressed** | formula | `DeliveryStatus = "Suppressed"` |
| **MessageDeliveries.IsTriaged** | formula | `InvokedException <> ""` |
| **MessageDeliveries.IsAbandonedFailure** | formula | `And(IsFailedDelivery, Not(IsTriaged))` |
| **MessageDeliveries.AbandonedFailureExecutionKey** | formula | `If(IsAbandonedFailure, ProcedureExecution, "")` |
| **MessageDeliveries.ReachedExecutionKey** | formula | `If(DeliveryStatus = "Delivered", ProcedureExecution, "")` |
| **MessageDeliveries.TemplateWasSendable** | lookup | `Lookup(MessageTemplates.IsSendableUnderApproval via MessageTemplate)` |
| **MessageDeliveries.IsDriftedSend** | formula | `And(WasActuallyTransmitted, Not(TemplateWasSendable))` |
| **MessageDeliveries.DriftedSendTemplateKey** | formula | `If(IsDriftedSend, MessageTemplate, "")` |
| **MessageDeliveries.WasSentOutsideBusinessHours** | formula | `Or(SentAtLocalHour < 8, SentAtLocalHour > 18)` |
| **MessageDeliveries.WasDeliveredAndUnanswered** | formula | `And(WasActuallyTransmitted, Not(IsAcknowledged))` |
| **MessageDeliveries.IsPoorlyTimedUnanswered** | formula | `And(WasDeliveredAndUnanswered, WasSentOutsideBusinessHours)` |
| **MessageDeliveries.IsWellTimedUnanswered** | formula | `And(WasDeliveredAndUnanswered, Not(WasSentOutsideBusinessHours))` |
| **MessageDeliveries.UnansweredTemplateKey** | formula | `If(WasDeliveredAndUnanswered, MessageTemplate, "")` |
| **MessageDeliveries.TransmittedTemplateKey** | formula | `If(WasActuallyTransmitted, MessageTemplate, "")` |
| **MessageDeliveries.ApprovalPrecededSend** | formula | `And(ApprovalDecidedAtSend <> "", SentAt > ApprovalDecidedAtSend)` |
| **MessageDeliveries.HasFrozenApprovalEvidence** | formula | `And(ApprovingAgentAtSend <> "", ApprovalDecidedAtSend <> "")` |
| **MessageDeliveries.ProvenanceIsLiveDerived** | formula | `Not(HasFrozenApprovalEvidence)` |
| **MessageDeliveries.CurrentLastApprovalAt** | lookup | `Lookup(MessageTemplates.LastApprovalAt via MessageTemplate)` |
| **MessageDeliveries.TemplateReapprovedSinceSend** | formula | `And(CurrentLastApprovalAt <> "", CurrentLastApprovalAt > SentAt)` |
| **MessageDeliveries.IsUnprovableApprovalClaim** | formula | `And(ProvenanceIsLiveDerived, And(TemplateReapprovedSinceSend, TemplateHasValidApproval))` |
| **MessageDeliveries.HasSentReminder** | formula | `ReminderCount > 0` |
| **MessageDeliveries.AcknowledgementIsOutstanding** | formula | `And(WasActuallyTransmitted, And(IsEvidenceRequired, Not(IsAcknowledged)))` |
| **MessageDeliveries.OutstandingAgeDays** | formula | `If(AcknowledgementIsOutstanding, DaysBetween(AsOfInstant, SentAt), 0)` |
| **MessageDeliveries.IsUnchasedAcknowledgement** | formula | `And(AcknowledgementIsOutstanding, And(OutstandingAgeDays > 7, Not(HasSentReminder)))` |
| **MessageDeliveries.IsExhaustedFollowUp** | formula | `And(AcknowledgementIsOutstanding, ReminderCount >= 3)` |
| **MessageDeliveries.NeedsHumanEscalation** | formula | `And(IsExhaustedFollowUp, Not(HasUnreachableExceptionInvoked))` |
| **TemplateApprovals.Name** | formula | `MessageTemplate & " / " & Decision & " / " & DecidedAt` |
| **TemplateApprovals.IsApprovalDecision** | formula | `Decision = "Approved"` |
| **TemplateApprovals.TemplatePolicy** | lookup | `Lookup(MessageTemplates.CommunicationPolicy via MessageTemplate)` |
| **TemplateApprovals.RequiredApprovalRole** | lookup | `Lookup(CommunicationPolicies.ApprovalRole via TemplatePolicy)` |
| **TemplateApprovals.IsDecidedByRequiredRole** | formula | `DecidedInRole = RequiredApprovalRole` |
| **TemplateApprovals.ValidApprovalTemplateKey** | formula | `If(And(IsApprovalDecision, IsDecidedByRequiredRole), MessageTemplate, "")` |
| **SendIntents.Name** | formula | `Recipient & " / " & MessageTemplate & " / intent"` |
| **SendIntents.IntentPolicy** | lookup | `Lookup(MessageTemplates.CommunicationPolicy via MessageTemplate)` |
| **SendIntents.IntentChannel** | lookup | `Lookup(CommunicationPolicies.Channel via IntentPolicy)` |
| **SendIntents.PolicyIsActive** | lookup | `Lookup(CommunicationPolicies.IsActivePolicy via IntentPolicy)` |
| **SendIntents.IntentRequiresConsent** | lookup | `Lookup(CommunicationPolicies.ConsentRequired via IntentPolicy)` |
| **SendIntents.RecipientHasChannelConsent** | lookup | `Lookup(Recipients.HasSmsConsent via Recipient)` |
| **SendIntents.ConsentGatePassed** | formula | `Or(Not(IntentRequiresConsent), RecipientHasChannelConsent)` |
| **SendIntents.RecipientIsSmsReachable** | lookup | `Lookup(Recipients.IsSmsReachable via Recipient)` |
| **SendIntents.RecipientIsEmailReachable** | lookup | `Lookup(Recipients.IsEmailReachable via Recipient)` |
| **SendIntents.ReachabilityGatePassed** | formula | `If(IntentChannel = "SMS", RecipientIsSmsReachable, RecipientIsEmailReachable)` |
| **SendIntents.PermissionGatePassed** | formula | `And(PolicyIsActive, And(ConsentGatePassed, ReachabilityGatePassed))` |
| **SendIntents.IntentQuietStartHour** | lookup | `Lookup(CommunicationPolicies.QuietHoursStartHour via IntentPolicy)` |
| **SendIntents.IntentQuietEndHour** | lookup | `Lookup(CommunicationPolicies.QuietHoursEndHour via IntentPolicy)` |
| **SendIntents.IntentPolicyHasQuietHours** | formula | `IntentQuietStartHour <> IntentQuietEndHour` |
| **SendIntents.IntentQuietWindowWraps** | formula | `IntentQuietStartHour > IntentQuietEndHour` |
| **SendIntents.IntentIsInsideQuietWindow** | formula | `If(IntentQuietWindowWraps, Or(ProposedSendAtLocalHour >= IntentQuietStartHour, ProposedSendAtLocalHour < IntentQuietEndHour), And(ProposedSendAtLocalHour >= IntentQuietStartHour, ProposedSendAtLocalHour < IntentQuietEndHour))` |
| **SendIntents.TimingGatePassed** | formula | `Or(Not(IntentPolicyHasQuietHours), Not(IntentIsInsideQuietWindow))` |
| **SendIntents.HoursUntilWindowOpens** | formula | `If(TimingGatePassed, 0, If(ProposedSendAtLocalHour < IntentQuietEndHour, IntentQuietEndHour - ProposedSendAtLocalHour, 24 - ProposedSendAtLocalHour + IntentQuietEndHour))` |
| **SendIntents.IntentMaxMessageLength** | lookup | `Lookup(CommunicationPolicies.MaxMessageLength via IntentPolicy)` |
| **SendIntents.IntentMaxSegments** | lookup | `Lookup(CommunicationPolicies.MaxSegments via IntentPolicy)` |
| **SendIntents.LengthGatePassed** | formula | `And(ProposedBodyLength > 0, ProposedSegmentCount <= IntentMaxSegments)` |
| **SendIntents.IntentRequiredOptOutPhrase** | lookup | `Lookup(CommunicationPolicies.RequiredOptOutPhrase via IntentPolicy)` |
| **SendIntents.OptOutGatePassed** | formula | `Or(IntentRequiredOptOutPhrase = "", And(ProposedOptOutPosition > 0, ProposedOptOutPosition <= IntentMaxMessageLength))` |
| **SendIntents.ContentGatePassed** | formula | `And(LengthGatePassed, OptOutGatePassed)` |
| **SendIntents.TemplateIsSendable** | lookup | `Lookup(MessageTemplates.IsSendableUnderApproval via MessageTemplate)` |
| **SendIntents.ExecutionHasLegalClearance** | lookup | `Lookup(ProcedureExecutions.HasClearedLegalReview via ProcedureExecution)` |
| **SendIntents.IntentApprovalRole** | lookup | `Lookup(CommunicationPolicies.ApprovalRole via IntentPolicy)` |
| **SendIntents.ApprovalRoleAgentKind** | lookup | `Lookup(Roles.CurrentAgentKind via IntentApprovalRole)` |
| **SendIntents.ApprovalIsHuman** | formula | `ApprovalRoleAgentKind = "Human"` |
| **SendIntents.AuthorizationGatePassed** | formula | `And(TemplateIsSendable, And(ExecutionHasLegalClearance, ApprovalIsHuman))` |
| **SendIntents.IsClearedToSend** | formula | `And(PermissionGatePassed, And(TimingGatePassed, And(ContentGatePassed, AuthorizationGatePassed)))` |
| **SendIntents.BlockingGateName** | formula | `If(IsClearedToSend, "", If(Not(PermissionGatePassed), "Permission", If(Not(TimingGatePassed), "Timing", If(Not(ContentGatePassed), "Content", "Authorization"))))` |
| **SendIntents.HasResultingDelivery** | formula | `ResultingDelivery <> ""` |
| **SendIntents.ResultingDeliveryWasTransmitted** | lookup | `Lookup(MessageDeliveries.WasActuallyTransmitted via ResultingDelivery)` |
| **SendIntents.IsOverriddenRefusal** | formula | `And(Not(IsClearedToSend), And(HasResultingDelivery, ResultingDeliveryWasTransmitted))` |
| **SendIntents.IsSilentlyDropped** | formula | `And(Not(IsClearedToSend), Not(HasResultingDelivery))` |
| **SendIntents.ResultingDeliveryException** | lookup | `Lookup(MessageDeliveries.InvokedException via ResultingDelivery)` |
| **SendIntents.RefusalCitedAnException** | formula | `ResultingDeliveryException <> ""` |
| **SendIntents.IsProperlyHandledRefusal** | formula | `And(Not(IsClearedToSend), And(HasResultingDelivery, And(Not(ResultingDeliveryWasTransmitted), RefusalCitedAnException)))` |
| **SendIntents.RefusalFailureExecutionKey** | formula | `If(Or(IsOverriddenRefusal, IsSilentlyDropped), ProcedureExecution, "")` |
| **SendIntents.IntentExecutionKey** | formula | `ProcedureExecution` |
| **SendIntents.DeliveredIntentExecutionKey** | formula | `If(And(HasResultingDelivery, ResultingDeliveryWasTransmitted), ProcedureExecution, "")` |
| **SendIntents.DroppedIntentExecutionKey** | formula | `If(IsSilentlyDropped, ProcedureExecution, "")` |
| **SendIntents.MyApprovalWasInForce** | formula | `TemplateIsSendable` |
| **SendIntents.RefusedOnApprovedContent** | formula | `And(MyApprovalWasInForce, Not(ContentGatePassed))` |
| **SendIntents.RefusedOnOptOutOnly** | formula | `And(Not(OptOutGatePassed), LengthGatePassed)` |
| **SendIntents.RefusalWasOnMyRules** | formula | `And(Not(IsClearedToSend), Or(Not(ContentGatePassed), Not(TimingGatePassed)))` |
| **SendIntents.RefusalWasOutsideMyControl** | formula | `And(Not(IsClearedToSend), Or(Not(PermissionGatePassed), Not(AuthorizationGatePassed)))` |
| **SendIntents.IsUnreportedRefusalOnMyRules** | formula | `And(RefusalWasOnMyRules, Not(ApproverWasNotified))` |
| **SendIntents.IsApprovalOverriddenSilently** | formula | `And(RefusedOnApprovedContent, Not(ApproverWasNotified))` |
| **SendIntents.HasAlternateChannelAttempt** | formula | `AlternateChannelIntent <> ""` |
| **SendIntents.AlternateAttemptWasCleared** | lookup | `Lookup(SendIntents.IsClearedToSend via AlternateChannelIntent)` |
| **SendIntents.IsRefusedWithNoAlternative** | formula | `And(Not(IsClearedToSend), Not(HasAlternateChannelAttempt))` |
| **SendIntents.ExceptionPrescribedAnAlternative** | formula | `And(RefusalCitedAnException, ResultingDeliveryException <> "")` |
| **SendIntents.PrescribedHandlingWasPerformed** | formula | `And(ExceptionPrescribedAnAlternative, And(HasAlternateChannelAttempt, AlternateAttemptWasCleared))` |
| **SendIntents.IsSuppressionWithoutRemedy** | formula | `And(ExceptionPrescribedAnAlternative, Not(PrescribedHandlingWasPerformed))` |
| **SendIntents.HasDurableRefusalRecord** | formula | `RefusalRecordedAt <> ""` |
| **SendIntents.RefusalWasEscalated** | formula | `RefusalNotifiedRole <> ""` |
| **SendIntents.IsUnrecordedRefusal** | formula | `And(IsSilentlyDropped, And(Not(HasDurableRefusalRecord), Not(RefusalCitedAnException)))` |
| **SendIntents.IsUnescalatedRefusal** | formula | `And(Not(IsClearedToSend), Not(RefusalWasEscalated))` |
| **SendIntents.UnescalatedRefusalRoleKey** | formula | `If(IsUnrecordedRefusal, RefusalNotifiedRole, "")` |
| **SendIntents.UnrecordedRefusalExecutionKey** | formula | `If(IsUnrecordedRefusal, ProcedureExecution, "")` |
| **SendIntents.WasDeferredOnTiming** | formula | `And(Not(TimingGatePassed), And(PermissionGatePassed, ContentGatePassed))` |
| **SendIntents.AsOfInstant** | lookup | `Lookup(EvaluationContexts.AsOfInstant via EvaluationContext)` |
| **SendIntents.WindowHasSinceReopened** | formula | `And(HoursUntilWindowOpens > 0, DaysBetween(AsOfInstant, EvaluatedAt) > HoursUntilWindowOpens)` |
| **SendIntents.HasRetryAttempt** | formula | `RetryIntent <> ""` |
| **SendIntents.RetryWasCleared** | lookup | `Lookup(SendIntents.IsClearedToSend via RetryIntent)` |
| **SendIntents.IsAbandonedDeferral** | formula | `And(WasDeferredOnTiming, And(WindowHasSinceReopened, Not(HasRetryAttempt)))` |
| **SendIntents.DeferralAgeHours** | formula | `DaysBetween(AsOfInstant, EvaluatedAt)` |
| **SendIntents.IsStaleDeferral** | formula | `And(WasDeferredOnTiming, DeferralAgeHours > 24)` |
| **SendIntents.EnforcedByUnauthorizedAgent** | lookup | `Lookup(RoleAssignments.IsUnauthorizedEnforcementAgent via EvaluatingRoleAssignment)` |
| **SendIntents.ConsentInputWasResolvable** | formula | `RecipientConsentStatusRaw <> ""` |
| **SendIntents.RecipientConsentStatusRaw** | lookup | `Lookup(Recipients.SmsConsentStatus via Recipient)` |
| **SendIntents.PolicyInputWasResolvable** | formula | `IntentPolicy <> ""` |
| **SendIntents.AllGateInputsResolved** | formula | `And(ConsentInputWasResolvable, PolicyInputWasResolvable)` |
| **SendIntents.IsUnevaluableRefusal** | formula | `And(Not(IsClearedToSend), Not(AllGateInputsResolved))` |
| **SendIntents.IsSelfWitnessedDecision** | formula | `Not(GateResultWasIndependentlyConfirmed)` |
| **SendIntents.IsIndependentlyConfirmed** | formula | `And(HasResultingDelivery, ResultingDeliveryWasTransmitted)` |
| **SendIntents.IndependentlyConfirmedExecutionKey** | formula | `If(IsIndependentlyConfirmed, ProcedureExecution, "")` |
| **AgentDecisionRecords.Name** | formula | `DecidingAgent & ": " & Left(DecisionSummary, 60)` |
| **AgentDecisionRecords.WasOverridden** | formula | `Or(HumanDisposition = "Corrected", HumanDisposition = "Reversed")` |
| **AgentDecisionRecords.WasReviewed** | formula | `And(HumanDisposition <> "", HumanDisposition <> "NotReviewed")` |
| **AgentDecisionRecords.DecidingAgentKind** | lookup | `Lookup(Agents.AgentKind via DecidingAgent)` |
| **AgentDecisionRecords.DecidingAgentWhenOverridden** | formula | `If(WasOverridden, DecidingAgent, "")` |
| **AgentDecisionRecords.RoleAssignmentWhenScored** | formula | `If(UnderRoleAssignment <> "", UnderRoleAssignment, "")` |
| **AgentDecisionRecords.RoleAssignmentWhenOverridden** | formula | `If(WasOverridden, UnderRoleAssignment, "")` |
| **AgentDecisionRecords.StepOfDecision** | lookup | `Lookup(StepExecutions.Step via StepExecution)` |
| **AgentDecisionRecords.BoundaryMatchKey** | formula | `StepOfDecision & "\|" & DecidingAgentKind & "\|" & DecisionKind` |
| **AgentDecisionRecords.MatchingBoundaryCount** | rollup | `Count(AuthorityBoundaries via BoundaryMatchKey)` |
| **AgentDecisionRecords.ViolatedAuthorityBoundary** | formula | `MatchingBoundaryCount > 0` |
| **AgentDecisionRecords.ReviewerAgentKind** | lookup | `Lookup(Agents.AgentKind via ReviewedByAgent)` |
| **AgentDecisionRecords.HasHumanConfirmation** | formula | `And(ReviewerAgentKind = "Human", HumanDisposition <> "", HumanDisposition <> "NotReviewed")` |
| **AgentDecisionRecords.NeedsHumanConfirmation** | formula | `And(Not(DecidingAgentKind = "Human"), Or(MaterialityBand = "Material", MaterialityBand = "Escalated"))` |
| **AgentDecisionRecords.IsUnconfirmedNonHumanDecision** | formula | `And(NeedsHumanConfirmation, Not(HasHumanConfirmation))` |
| **AgentDecisionRecords.StepExecutionWhenUnconfirmed** | formula | `If(IsUnconfirmedNonHumanDecision, StepExecution, "")` |
| **AgentDecisionRecords.AgentWhenBoundaryViolated** | formula | `If(ViolatedAuthorityBoundary, DecidingAgent, "")` |
| **AgentDecisionRecords.ReviewLatencyMinutes** | formula | `If(ReviewedAt = "", 0, DaysBetween(ReviewedAt, DecidedAt))` |
| **AgentDecisionRecords.IsDraftKind** | formula | `Or(DecisionKind = "Draft", DecisionKind = "Commitment")` |
| **AgentDecisionRecords.AgentWhenDraftOverridden** | formula | `If(And(IsDraftKind, WasOverridden), DecidingAgent, "")` |
| **AgentDecisionRecords.AgentWhenDraft** | formula | `If(IsDraftKind, DecidingAgent, "")` |
| **AgentDecisionRecords.IsErrorCorrection** | formula | `And(WasOverridden, OverrideReasonKind = "ErrorCorrection")` |
| **AgentDecisionRecords.IsReservedJudgmentOverride** | formula | `And(WasOverridden, OverrideReasonKind = "JudgmentReserved")` |
| **AgentDecisionRecords.OverrideReasonIsRecorded** | formula | `And(WasOverridden, OverrideReasonKind <> "")` |
| **AgentDecisionRecords.IsUnexplainedOverride** | formula | `And(WasOverridden, Not(OverrideReasonIsRecorded))` |
| **AgentDecisionRecords.ErrorCorrectionRoleAssignmentKey** | formula | `If(IsErrorCorrection, UnderRoleAssignment, "")` |
| **AgentDecisionRecords.BoundaryViolationRoleAssignmentKey** | formula | `If(ViolatedAuthorityBoundary, UnderRoleAssignment, "")` |
| **DeliveredCommunications.Name** | formula | `Channel & " -> " & RecipientKey & " @ " & SentAt` |
| **DeliveredCommunications.HasAuthorization** | formula | `AuthorizingStepExecution <> ""` |
| **DeliveredCommunications.ContentMatchesApproval** | formula | `RenderedContentHash = ApprovedContentHash` |
| **DeliveredCommunications.AuthorizedAt** | lookup | `Lookup(StepExecutions.EndedAt via AuthorizingStepExecution)` |
| **DeliveredCommunications.WasApprovedBeforeSending** | formula | `AuthorizedAt <= SentAt` |
| **DeliveredCommunications.IsDefensible** | formula | `And(HasAuthorization, ContentMatchesApproval, WasApprovedBeforeSending)` |
| **AuthorityBoundaries.Name** | formula | `ForbiddenAgentKind & " may not " & ForbiddenDecisionKind` |
| **AuthorityBoundaries.AsOfInstant** | lookup | `Lookup(EvaluationContexts.AsOfInstant via EvaluationContext)` |
| **AuthorityBoundaries.IsCurrentlyBinding** | formula | `And(Status = "Approved", ValidFrom <= AsOfInstant, Or(ValidTo = "", ValidTo > AsOfInstant))` |
| **AuthorityBoundaries.RatifyingFragmentIsValid** | lookup | `Lookup(KnowledgeFragments.IsCurrentlyValid via RatifiedByKnowledgeFragment)` |
| **AuthorityBoundaries.StepWhenBinding** | formula | `If(IsCurrentlyBinding, Step, "")` |
| **AuthorityBoundaries.BoundaryMatchKey** | formula | `Step & "\|" & ForbiddenAgentKind & "\|" & ForbiddenDecisionKind` |
| **AuthorityBoundaries.ViolationCount** | rollup | `Count(AgentDecisionRecords via BoundaryMatchKey)` |
| **AuthorityBoundaries.IsUntested** | formula | `And(IsCurrentlyBinding, ViolationCount = 0)` |
| **AuthorityBoundaries.HasRatifyingFragment** | formula | `RatifiedByKnowledgeFragment <> ""` |
| **AuthorityBoundaries.IsUnwarranted** | formula | `And(IsCurrentlyBinding, Or(Not(HasRatifyingFragment), Not(RatifyingFragmentIsValid)))` |
| **AuthorityBoundaries.RatifyingFragmentIsOverdue** | lookup | `Lookup(KnowledgeFragments.IsOverdueForReview via RatifiedByKnowledgeFragment)` |
| **AuthorityBoundaries.RatifyingFragmentIsSingleWitness** | lookup | `Lookup(KnowledgeFragments.IsFromSingleWitness via RatifiedByKnowledgeFragment)` |
| **AuthorityBoundaries.WarrantIsThin** | formula | `And(IsCurrentlyBinding, Or(RatifyingFragmentIsOverdue, RatifyingFragmentIsSingleWitness))` |
| **AuthorityBoundaries.IsUnwarrantedAndUntested** | formula | `And(IsUnwarranted, IsUntested)` |
| **AuthorityBoundaries.UnwarrantedBoundaryStepKey** | formula | `If(IsUnwarranted, Step, "")` |
| **AuthorityBoundaries.RatifyingFragmentKey** | formula | `If(IsCurrentlyBinding, RatifiedByKnowledgeFragment, "")` |
| **AuthorityBoundaries.RatifyingFragmentStatus** | lookup | `Lookup(KnowledgeFragments.Status via RatifiedByKnowledgeFragment)` |
| **AuthorityBoundaries.RatificationLapsed** | formula | `And(HasRatifyingFragment, Not(RatifyingFragmentIsValid))` |
| **AuthorityBoundaries.BindsDespiteLapsedRatification** | formula | `And(IsCurrentlyBinding, RatificationLapsed)` |
| **AuthorityBoundaries.IsUngroundedAndUntested** | formula | `And(BindsDespiteLapsedRatification, IsUntested)` |
| **AuthorityBoundaries.ConstrainedRoleAssignmentKey** | formula | `If(BindsDespiteLapsedRatification, AuthorityRole, "")` |
| **BindingObservations.Name** | formula | `StepExecution & " / " & BindingObservationId` |
| **BindingObservations.SlaMinutesAtRun** | lookup | `Lookup(OperationalBindings.FreshnessSlaMinutes via OperationalBinding)` |
| **BindingObservations.AgeAtRunMinutes** | formula | `DaysBetween(ReadAt, ObservedSourceTimestamp)` |
| **BindingObservations.WasStaleAtRun** | formula | `And(IsAuthoritativeBinding, AgeAtRunMinutes > SlaMinutesAtRun)` |
| **BindingObservations.IsAuthoritativeBinding** | lookup | `Lookup(OperationalBindings.IsAuthoritative via OperationalBinding)` |
| **BindingObservations.StaleAtRunStepKey** | formula | `If(WasStaleAtRun, StepExecution, "")` |
| **Attestations.Name** | formula | `ProcedureExecution & " / " & AttestationId` |
| **Attestations.VersionIsFitNow** | lookup | `Lookup(ProcedureExecutions.ExecutedVersionIsFit via ProcedureExecution)` |
| **Attestations.FitnessVerdictHasDrifted** | formula | `Not(VersionWasFitAtSigning = VersionIsFitNow)` |
| **Attestations.AssuranceGradeNow** | lookup | `Lookup(ProcedureExecutions.AssuranceGrade via ProcedureExecution)` |
| **Attestations.AssuranceGradeHasDrifted** | formula | `Not(AssuranceGradeAtSigning = AssuranceGradeNow)` |
| **Attestations.WouldNotSurviveRestatement** | formula | `Or(FitnessVerdictHasDrifted, AssuranceGradeHasDrifted)` |
| **AppRoleProfiles.Name** | formula | `DisplayLabel & " (" & RoleKind & ")"` |
| **AppRoleProfiles.RouteCount** | rollup | `Count(AppRoutes via OwningRole)` |
| **AppNavGroups.Name** | formula | `GroupLabel` |
| **AppNavGroups.RouteCount** | rollup | `Count(AppRoutes via NavGroup)` |
| **AppRoutes.Name** | formula | `RouteName & " — " & RoutePath` |
| **AppRoutes.IsInNav** | formula | `NavGroup <> ""` |
| **AppRoutes.IsShared** | formula | `And(OwningRole = "", Surface = "domain")` |
| **AppRoutes.IsMaintainer** | formula | `Surface = "maintainer"` |
| **AppRoutes.QuestionCount** | rollup | `Count(AppRouteQuestions via Route)` |
| **AppRoutes.ReferenceCount** | rollup | `Count(AppRouteReferences via FromRoute)` |
| **AppRoutes.AnswersNoQuestion** | formula | `And(QuestionCount = 0, IsShared = FALSE, IsMaintainer = FALSE, RouteKind <> "index")` |
| **AppRouteQuestions.Name** | formula | `Route & " answers " & Question` |
| **AppRouteReferences.Name** | formula | `FromRoute & " -> " & ToRoute` |
| **RulebookTables.Name** | formula | `TableName` |
| **RulebookTables.FieldCount** | rollup | `Count(RulebookFields via TargetTable)` |
| **RulebookTables.PolicyCount** | rollup | `Count(AccessPolicies via TargetTable)` |
| **RulebookTables.IsUnsecured** | formula | `PolicyCount = 0` |
| **AccessPrincipals.Name** | formula | `Label` |
| **AccessPrincipals.OrganizationScope** | lookup | `Lookup(Roles.Organization via DomainRole)` |
| **AccessPrincipals.RoleLabel** | lookup | `Lookup(Roles.Label via DomainRole)` |
| **AccessPrincipals.PolicyCount** | rollup | `Count(AccessPolicies via Principal)` |
| **AccessPrincipals.GrantCount** | rollup | `Count(FieldGrants via Principal)` |
| **AccessPrincipals.VisibleTableCount** | rollup | `Count(RoleSchemaViews via Principal)` |
| **AccessPrincipals.HasNoAccess** | formula | `PolicyCount = 0` |
| **AccessPrincipals.IsOverPrivileged** | formula | `And(Not(IsAdministrator), VisibleTableCount >= 74)` |
| **AccessPolicies.Name** | formula | `Principal & " " & Command & " " & TargetTable` |
| **AccessPolicies.IsWriteCommand** | formula | `Or(Command = "INSERT", Command = "UPDATE", Command = "DELETE", Command = "ALL")` |
| **AccessPolicies.IsUnrestricted** | formula | `RowPredicate = ""` |
| **AccessPolicies.PrincipalIsAdmin** | lookup | `Lookup(AccessPrincipals.IsAdministrator via Principal)` |
| **AccessPolicies.IsUnrestrictedNonAdminGrant** | formula | `And(IsUnrestricted, Not(PrincipalIsAdmin))` |
| **AccessPolicies.IsUnwitnessedWrite** | formula | `And(IsWriteCommand, DenialTestCount = 0)` |
| **AccessPolicies.DenialTestCount** | rollup | `Count(AccessDenialTests via TargetPolicy)` |
| **FieldGrants.Name** | formula | `Principal & " -> " & TargetField` |
| **FieldGrants.FieldTable** | lookup | `Lookup(RulebookFields.TargetTable via TargetField)` |
| **FieldGrants.FieldName** | lookup | `Lookup(RulebookFields.FieldName via TargetField)` |
| **FieldGrants.FieldIsDerived** | lookup | `Lookup(RulebookFields.IsDerived via TargetField)` |
| **FieldGrants.IsWritableDerivedField** | formula | `And(CanWrite, FieldIsDerived)` |
| **FieldGrants.IsMasked** | formula | `And(MaskStrategy <> "plain", MaskStrategy <> "")` |
| **FieldGrants.GrantKeyWhenReadable** | formula | `If(CanRead, Principal & "\|" & FieldTable, "")` |
| **RoleSchemas.Name** | formula | `SchemaName` |
| **RoleSchemas.SearchPath** | formula | `SchemaName` |
| **RoleSchemas.ViewCount** | rollup | `Count(RoleSchemaViews via RoleSchema)` |
| **RoleSchemas.IsEmptySchema** | formula | `ViewCount = 0` |
| **RoleSchemaViews.Name** | formula | `SchemaName & "." & ViewName` |
| **RoleSchemaViews.SchemaName** | lookup | `Lookup(RoleSchemas.SchemaName via RoleSchema)` |
| **RoleSchemaViews.SourceView** | lookup | `Lookup(RulebookTables.PhysicalView via TargetTable)` |
| **RoleSchemaViews.GrantKey** | formula | `Principal & "\|" & TargetTable` |
| **RoleSchemaViews.ColumnCount** | rollup | `Count(FieldGrants via GrantKeyWhenReadable)` |
| **RoleSchemaViews.TableFieldCount** | lookup | `Lookup(RulebookTables.FieldCount via TargetTable)` |
| **RoleSchemaViews.IsFullWidth** | formula | `And(ColumnCount > 0, ColumnCount >= TableFieldCount)` |
| **RoleSchemaViews.IsDegenerateView** | formula | `ColumnCount = 0` |
| **JwtClaimMappings.Name** | formula | `ClaimName & " -> " & SqlAccessor` |
| **JwtClaimMappings.UsageCount** | rollup | `Count(AccessPolicies via RowPredicate)` |
| **AccessDenialTests.Name** | formula | `Principal & " must not see " & ForbiddenRowId` |
| **AccessDenialTests.HasRun** | formula | `LastRunAt <> ""` |
| **AccessDenialTests.IsPassing** | formula | `ObservedVisible = ExpectedVisible` |
| **AccessDenialTests.IsLeak** | formula | `And(Not(ExpectedVisible), ObservedVisible)` |
| **AccessDenialTests.IsUnproven** | formula | `Not(HasRun)` |
| **AccessDenialTests.IsPositiveControl** | formula | `ExpectedVisible` |
| **AppUsers.Name** | formula | `DisplayName` |
| **AppUsers.AgentKind** | lookup | `Lookup(Agents.AgentKind via LinkedAgent)` |
| **AppUsers.Organization** | lookup | `Lookup(Agents.Organization via LinkedAgent)` |
| **AppUsers.AssignmentCount** | rollup | `Count(PrincipalAssignments via AppUser)` |
| **AppUsers.HasNoPrincipal** | formula | `AssignmentCount = 0` |
| **AppUsers.HoldsMultiplePrincipals** | formula | `AssignmentCount > 1` |
| **AppUsers.IsNonHumanSignIn** | formula | `Or(AgentKind = "AIAgent", AgentKind = "AutomatedPipeline")` |
| **PrincipalAssignments.Name** | formula | `AppUser & " as " & Principal` |
| **PrincipalAssignments.PrincipalIsAdmin** | lookup | `Lookup(AccessPrincipals.IsAdministrator via Principal)` |
| **PrincipalAssignments.UserOrganization** | lookup | `Lookup(AppUsers.Organization via AppUser)` |
| **PrincipalAssignments.PrincipalOrganization** | lookup | `Lookup(AccessPrincipals.OrganizationScope via Principal)` |
| **PrincipalAssignments.IsCrossOrganizationGrant** | formula | `And(UserOrganization <> "", PrincipalOrganization <> "", UserOrganization <> PrincipalOrganization)` |
| **IssuedTokens.Name** | formula | `AppUser & " as " & Principal & " @ " & IssuedAt` |
| **IssuedTokens.IsDevMinted** | formula | `Issuer = "dev-mint"` |

---

_This document is rendered in **RuleSpeak®**, the declarative business-rule
notation created by **Ronald G. Ross**, and follows the conventions of
**SBVR** (Semantics of Business Vocabulary and Business Rules). With thanks to
Ronald G. Ross for RuleSpeak® and his foundational work on business rules —
[www.RonRoss.info](https://www.RonRoss.info)._
