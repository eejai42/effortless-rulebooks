# 📘 Talisman's Special Solutions — RuleSpeak®

_The NTWF (Talisman's Special Solutions Workflow) ontology from Jessica Talisman's 'Intentional Arrangement' series, modeled as a relational rulebook. One curated worked example — the Production Deployment Workflow — exercises every class, property, and competency question: three disjoint agent types (human / AI / pipeline), role-vs-agent separation, a delegation/escalation chain, an approval gate as a step subtype, step-to-step transitive ordering, a PROV provenance chain over artifacts, and DCAT dataset consumption. Every competency question is answered by a derived column or a transitive-closure view (no sidecar code); a small set of load-bearing INDEX/MATCH lookups resolves the role-to-agent and gate-to-role-to-approver chains the questions depend on._

> Declarative business rules rendered from the rulebook. Every statement
> below expresses truth in the business domain — it is neither a procedure
> nor an imperative. The rulebook's formulas are the single source of truth;
> this document is their plain-language reading.

## 1 Business Vocabulary

| Term | Description | Narrative Comment |
|------|-------------|-------------------|
| **Workflow** | A workflow is identified by its name and is related to optionally a workflow status concept (its workflow status). | — |
| Relative Path | Computed as “workflows/”, followed by the workflow ID. | _Stable, DAG-derived location for this Workflow row. Root segment 'workflows' + the row's primary key. No leading slash so the Iri swap is a clean 1:1 substitution. The relational analogue of a REST resource path; unique by construction across the whole model._ |
| Iri | Computed as the relative path with every a slash replaced by a hyphen. | _Opaque stable identifier (the dash-form of RelativePath). Because RelativePath has no leading slash, this is a clean SUBSTITUTE of '/' for '-'. The OWL transpiler mints each individual's IRI from this value (erb:<Iri>), so identity is path-derived and globally unique — no cross-table primary-key collisions._ |
| Name | Computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | _Short machine-friendly name for the workflow. Used for programmatic reference and URL slug generation._ |
| Display Name | A defined attribute. | — |
| Title | A defined attribute. | _Human-readable title of the workflow. Maps to dct:title from Dublin Core. Example: 'Production Deployment Workflow'._ |
| Description | A defined attribute. | _Detailed description of the workflow's purpose and scope. Maps to dct:description from Dublin Core. Should explain what business goal the workflow achieves._ |
| Identifier | A defined attribute. | _External system identifier for cross-referencing. Maps to dct:identifier from Dublin Core. This is the join key back to document management systems, ticket systems, or other operational systems._ |
| Modified | A defined attribute. | _Last modification timestamp. Maps to dct:modified from Dublin Core. Critical for answering CQ5: 'Which workflows haven't been reviewed or updated in twelve months?'_ |
| Created | A defined attribute. | _Creation timestamp. Maps to dct:created from Dublin Core. Records when the workflow was first defined._ |
| Staleness Threshold Months | A defined attribute. | _The governance POLICY (in months): the full review cadence after which this workflow's compliance documentation is formally out of date. The docs go stale exactly when this review age is exceeded — IsStale fires the instant MonthsSinceModified passes this policy line, with no deferral. The article hardcodes the CQ5 question at twelve months ('which workflows haven't been reviewed in twelve months'); promoting that threshold to a raw, editable field makes the policy itself a fact in the SSoT rather than a constant buried in the IsStale formula — so an org can set a 6-month or 18-month review cadence and the staleness verdict recomputes. Defaults to 12 to match the article._ |
| Workflow Status | A defined attribute. | _FK to WorkflowStatusConcepts. Captures the current lifecycle state of the workflow (draft, active, deprecated, archived). Maps to the SKOS CBox status vocabulary._ |
| Workflow Steps | A defined attribute. | _Reference to workflow steps. Represents the ntwf:hasStep relationship linking workflows to their constituent steps._ |
| Count of Non Proposed Steps | The number of workflow steps related to the workflow. | _Calculated count of workflow steps in this workflow. Useful for workflow complexity analysis and reporting._ |
| Has More Than1 Step | True when the count of non proposed steps is greater than 1. | — |
| Count AI Steps | The number of the workflow's workflow steps that are executed by AI. | _Number of steps in this workflow executed by an AIAgent (rollup over WorkflowSteps.IsExecutedByAI). This is the 'AI-executed' half of the article's CQ3 ('which steps are executed by AI agents') — counted against AIAgent individuals specifically, not the deterministic AutomatedPipeline, which is a disjoint agent type. Also drives the business-payoff query (a workflow is a compliance risk when an AI agent runs a step). Worked example: 2 (the AI risk-assessment step and the AI post-deployment health report)._ |
| Count Human Steps | The number of the workflow's workflow steps that are executed by humans. | _Number of steps executed by a HumanAgent (rollup over WorkflowSteps.IsExecutedByHuman). The 'who actually runs this step' count — distinct from CountHumanRequiredSteps, which counts steps that demand a human decision (requiresHumanApproval). Worked example: 2 (the legal-review step and the release approval gate)._ |
| Count Human Required Steps | The number of the workflow's workflow steps that require a human approval. | _Number of steps that require a human decision (rollup over WorkflowSteps.RequiresHumanApproval). This is the 'human-required' half of the article's CQ3 ('which require a human decision'), answered — as the article notes — by a single FILTER on requiresHumanApproval. Worked example: 2 (the legal-review step and the release approval gate)._ |
| Count Approval Consistency Violations | The number of the workflow's workflow steps that are approval consistency violation. | _Number of steps that require human approval but are not human-filled (rollup over WorkflowSteps.ApprovalConsistencyViolation). The clean ABox witness: this is 0 for the Production Deployment workflow. A non-zero value is the relational signal of a Suite-4 consistency violation._ |
| Has Consistency Violation | True when the count approval consistency violations is greater than 0. | _TRUE iff at least one step breaks the human-approval consistency rule (CountApprovalConsistencyViolations > 0). The boolean witness of model integrity: a clean ABox holds it FALSE. This is what makes a broken rule a first-class input to the compliance verdict — a workflow with any consistency violation cannot be COMPLIANT._ |
| Has AI Agent Step | True when the count AI steps is greater than 0. | _TRUE iff at least one step in this workflow is executed by an AIAgent. The structural half of the article's business payoff query._ |
| Months Since Modified | Computed as the number of months from the modified to the current date and time. ⚠︎ mechanical <!-- rulespeak:reword --> | _Whole months since this workflow was last modified (dct:modified), measured live against NOW(). Drives CQ5 staleness. NOW() is seeded deterministically during conformance so test answers stay stable._ |
| Is Stale | True when the months since modified is greater than the staleness threshold months. | _TRUE iff the workflow's compliance documentation is past its review policy — i.e. the review age in months exceeds the policy line: MonthsSinceModified > StalenessThresholdMonths. With the default the docs go stale at 12 months. Staleness fires the instant the review comes due — there is no renewal window or deferral. This is the article's CQ5 condition ('which workflows haven't been reviewed in twelve months') stated directly against the editable policy field._ |
| Is Stale and Has AI Agent | True when all of the following hold: the stale flag is set and the AI agent step flag is set. | _The article's headline business question, as one boolean: a workflow that is BOTH stale (not reviewed in 12 months) AND has an AI-executed step — the highest compliance risk. Joins the metadata layer (dct:modified) with the accountability layer (filledBy → AIAgent) the way the closing SPARQL demo does, but as a single derived column._ |
| Count Derivation Links | The number of the workflow's workflow artifacts that have a derivation parent. | _Number of prov:wasDerivedFrom links among this workflow's artifacts (rollup over WorkflowArtifacts.HasDerivationParent). Answers the lineage half of CQ4: 5 artifacts form a chain with 4 derivation links._ |
| Count Legal Owned Steps | The number of the workflow's workflow steps that are legal-owned. | _Number of steps in this workflow whose owning department is Legal (rollup over WorkflowSteps.IsLegalOwned). CQ7: exactly one Legal-owned step in the Production Deployment workflow._ |
| Count Engineering Owned Steps | The number of the workflow's workflow steps that are engineering-owned. | _Number of steps whose owning department is Engineering (rollup over WorkflowSteps.IsEngineeringOwned). Feeds CQ7's Engineering-involvement check._ |
| Involves Engineering and Legal | True when all of the following hold: the count engineering owned steps is greater than 0 and the count legal owned steps is greater than 0. | _TRUE iff this workflow has at least one Engineering-owned step AND at least one Legal-owned step. Answers CQ7 ('which workflows involve both engineering and legal') as a single boolean — the Production Deployment workflow qualifies (4 Engineering steps + 1 Legal step)._ |
| Count Inferred Precedence Pairs | The number of vw step precedence closure related to the workflow. | _Number of step-ordering pairs that the transitive closure of ntwf:precedesStep INFERRED (rollup over the closure view vw_step_precedence_closure where is_inferred = TRUE). The article's signature count: 6 of the 10 closure pairs were never asserted — including step-1 -> step-5. NOTE: this single-workflow model has exactly one Workflow, so the global closure view is wholly this workflow's; the COUNTIFS is unfiltered because every precedence edge belongs to the Production Deployment DAG._ |
| Count Asserted Precedence Pairs | The number of vw step precedence closure related to the workflow. | _Number of step-ordering pairs that were directly ASSERTED as ntwf:precedesStep edges (rollup over vw_step_precedence_closure where is_inferred = FALSE) — the hop-1 rows. The article's 4 asserted edges. Together with CountInferredPrecedencePairs (6) this sums to the 10-pair closure, making CountOfPrecedenceClosurePairs an honest asserted+inferred total rather than an unconditional count. Single-workflow note as on CountInferredPrecedencePairs: the global closure view is this workflow's._ |
| Count of Precedence Closure Pairs | Computed as the count asserted precedence pairs plus the count inferred precedence pairs. | _Total number of step-ordering pairs in the transitive closure of ntwf:precedesStep = asserted (4) + inferred (6) = 10. The article's headline closure cardinality, witnessing that the 4 asserted edges over a 5-step chain close to all 10 (i<j) pairs. Computed as CountAssertedPrecedencePairs + CountInferredPrecedencePairs so the total is provably the sum of the two halves, not a separate unconditional view count that could silently drift from them._ |
| Count Roles With Bad Filler Cardinality | The number of roles related to the workflow. | _Number of roles that do NOT have exactly one filledBy arm set (rollup over Roles.HasExactlyOneFiller = FALSE). The three agent classes are owl:disjointWith one another and ntwf:filledBy is functional, so a clean ABox has 0 such roles — this is the Suite-1 functional/disjointness witness as a single integer. A non-zero value is the relational signal of the Suite-4 disjointness violation (a role filled by two agent classes, or by none). NOTE: this single-workflow model has exactly one Workflow and every Role participates in it, so the count is over all roles; a multi-workflow model would scope it through a role→workflow path._ |
| Count Agent Type Changes | The number of role assignments related to the workflow. | _Number of filledBy assignment periods that changed the agent CLASS of a role (rollup over RoleAssignments.IsAgentTypeChange = TRUE). NTWF governance distinguishes a same-class personnel/model swap from an agent-type transition; this counts the latter. NOTE: single-workflow model — every Role participates in the one workflow, so the count is over all assignment history; a multi-workflow model would scope it through a role→workflow path._ |
| Count Compliance Audit Changes | The number of role assignments related to the workflow. | _Number of filledBy assignment periods that took a previously AI-executed binding and reassigned it to a human (rollup over RoleAssignments.RequiresComplianceAudit = TRUE). NTWF governance treats this as a data operation with compliance implications: changing the agent type of a step from ntwf:AIAgent to ntwf:HumanAgent. Each such row must carry when (ValidFrom) and why (Reason). NOTE: single-workflow scoping as above._ |
| Count Approval Gate Steps | The number of the workflow's workflow steps that are approval gates. | _Number of this workflow's steps that are approval gates. >0 means the workflow has a blocking approval checkpoint; used by Cq2Satisfied to require that the gate exists before asking whether it has a human approver._ |
| Count Gates Without Human Approver | The number of approval gates related to the workflow. | _Number of approval gates with no resolved human approver (gate role not filled by a HumanAgent). Single-workflow model, so this global count is wholly this workflow's. Drives Cq2Satisfied (= a gate exists AND none lack a human approver)._ |
| Count Workflow Artifacts | The number of workflow artifacts related to the workflow. | _Total artifacts produced by this workflow. With CountDerivationLinks (artifacts that have a wasDerivedFrom parent) this lets Cq4Satisfied check the provenance chain is intact: every artifact but the single origin has a parent._ |
| Count Roles With Escalation Violation | The number of roles related to the workflow. | _Number of roles that own an approval gate yet escalate to no one (Roles.EscalationViolation). Single-workflow model, so this global count applies to this workflow. Drives Cq6Satisfied (=0): the model's own native escalation-completeness invariant, replacing any hardcoded 'must reach the CTO' check._ |
| Count Unconsumed Datasets | The number of datasets related to the workflow. | _Number of datasets not consumed by any step (Datasets.IsConsumed = FALSE). Single-workflow model, so this global count applies to this workflow. Drives Cq8Satisfied (=0)._ |
| Cq1 Satisfied | True when the count of precedence closure pairs is the count of non proposed steps times the count of non proposed steps minus 1 divided by 2. | _CQ1 satisfied: the step-ordering closure is a TOTAL order — its pair count equals n*(n-1)/2 for n steps, so every pair of steps is comparable and 'the order' is well-defined. Purely structural; no asserted literal._ |
| Cq2 Satisfied | True when all of the following hold: the count approval gate steps is greater than 0 and the count gates without human approver is 0. | _CQ2 satisfied: the workflow has an approval gate AND every gate resolves to a human approver. Derived from the gate->role->filler chain; no hardcoded approver name._ |
| Cq3 Satisfied | True when the consistency violation flag is not set. | _CQ3 satisfied: the AI-vs-human assignment is consistent — no step that requires a human decision is executed by a non-human (no ApprovalConsistencyViolation). Derived from the model's own consistency invariant._ |
| Cq4 Satisfied | True when the count derivation links is the count workflow artifacts minus 1. | _CQ4 satisfied: the wasDerivedFrom provenance chain is intact — every artifact but the single origin has a derivation parent. Structural; breaks the instant any derivation edge is cut._ |
| Cq5 Satisfied | True when the stale flag is not set. | _CQ5 satisfied: the workflow's compliance docs are within the review policy (not stale). Reads the existing IsStale verdict; flips when the review age passes StalenessThresholdMonths._ |
| Cq6 Satisfied | True when the count roles with escalation violation is 0. | _CQ6 satisfied: no gate-owning role escalates to nobody — every approval gate has a complete escalation path. Uses the model's native EscalationViolation invariant; 'the top' is the delegation apex, derived, not a hardcoded CTO name._ |
| Cq7 Satisfied | True when the involves engineering and legal flag is set. | _CQ7 satisfied: the workflow involves BOTH Engineering-owned and Legal-owned steps. Reads the existing InvolvesEngineeringAndLegal boolean._ |
| Cq8 Satisfied | True when the count unconsumed datasets is 0. | _CQ8 satisfied: every dataset the workflow declares is actually consumed by a step. Flips when a dataset is detached._ |
| **Workflow Step** | A workflow step is identified by its name and is related to optionally a workflow; optionally a role (its assigned role); optionally a dataset (its consumes dataset); optionally a workflow artifact (its produces artifacts); optionally a workflow artifact (its requires artifacts); optionally an approval gate; optionally a step precedence (its precedes); and optionally a step precedence (its preceded by). | — |
| Parent Path | The relative path of the workflow step's workflow. | _Helper: the Workflows parent's RelativePath, pulled across the Workflow FK. Exists so RelativePath can concatenate the '/steps/' segment using only local-field '&' concat (the transpiler compiles a lookup as a pure passthrough, not a lookup+concat)._ |
| Relative Path | Computed as the parent path, followed by “/steps/”, followed by the workflow step ID. | _Stable, DAG-derived location: this row nests under its Workflows parent. Concatenates the parent's path (ParentPath) with '/steps/' + this row's primary key. The DAG performs the recursion — one hop per table via ParentPath — so the full ancestry is encoded without a recursive formula. Unique by construction._ |
| Iri | Computed as the relative path with every a slash replaced by a hyphen. | _Opaque stable identifier (the dash-form of RelativePath). Because RelativePath has no leading slash, this is a clean SUBSTITUTE of '/' for '-'. The OWL transpiler mints each individual's IRI from this value (erb:<Iri>), so identity is path-derived and globally unique — no cross-table primary-key collisions._ |
| Name | Computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | — |
| Display Name | A defined attribute. | — |
| Workflow | A defined attribute. | _Forward foreign key to the parent workflow (ntwf:isStepOf) — the authoritative stored link from step to its containing workflow; every per-workflow rollup (CountOfNonProposedSteps, the department-owned counts, etc.) reads it. This IS the stored column, not a derived inverse: isReversed is false._ |
| Preceding Step Count | The number of vw step precedence closure related to the workflow step. | _Number of steps that TRANSITIVELY precede this step in the ntwf:precedesStep ordering — a rollup over the closure view vw_step_precedence_closure counting rows whose to_id is this step (i.e. this step's ancestors). On the linear Production Deployment chain: 0,1,2,3,4. Derived purely from the asserted StepPrecedence edges via their transitive closure; nothing is hand-entered. SequencePosition is this + 1._ |
| Inferred Sequence Position | Computed as the preceding step count plus 1. | _The step's ordinal position INFERRED purely from the StepPrecedence edges: 1 + PrecedingStepCount (one plus the number of steps that transitively precede it in vw_step_precedence_closure). On the linear Production Deployment chain: 1,2,3,4,5 — no integer is typed; it is a projection of the asserted ordering edges. This is the DEFAULT position; SequencePositionOverride can pin a different value where the inference is ambiguous (e.g. a branch produces ties). Maps to ntwf:inferredSequencePosition (an effortless extension of the article's ordering)._ |
| Sequence Position Override | A defined attribute. | _OPTIONAL hand-asserted ordinal position — the article's pure ntwf:sequencePosition functional datatype property, preserved as an override slot. NULL on the linear Production Deployment chain (the inference is unambiguous, so nothing is pinned). When set, it wins over InferredSequencePosition in the resolved SequencePosition — this is how a modeler recovers the owl:FunctionalProperty 'exactly one distinct position per step' guarantee on a partial order / branch where the inferred rank would tie. Maps to ntwf:sequencePosition (the article's asserted functional property)._ |
| Sequence Position | Determined by priority: the sequence position override if the sequence position override has a value; in all other cases, the inferred sequence position. | _The effective ordinal position used everywhere (views, UI, competency questions): the hand-asserted SequencePositionOverride when present, otherwise the edge-derived InferredSequencePosition. IF(SequencePositionOverride <> "", SequencePositionOverride, InferredSequencePosition). This is the honest resolution of the two ways order can be stated: the inference is the default computed from the SSoT (the StepPrecedence edges), and an explicit override only overrides — never a silent guess. On the Production Deployment chain all overrides are null, so this equals InferredSequencePosition = 1,2,3,4,5. Maps to ntwf:sequencePosition for consumers._ |
| Assigned Role | A defined attribute. | _Foreign key to the Role responsible for executing this step. Maps to ntwf:assignedRole (owl:FunctionalProperty — exactly one role per step). Critical for implementing Heuristic 2 (role-agent separation): steps point to roles, not directly to agents._ |
| Requires Human Approval | True when an empty string. | _Boolean flag indicating whether a human agent must fill the assigned role. Maps to ntwf:requiresHumanApproval. Enables answering CQ3: 'Which steps require human decisions vs. AI execution?'_ |
| Step Duration Minutes | A defined attribute. | _Expected duration of this step in minutes. Maps to ntwf:stepDurationMinutes (datatype property, not functional). Enables SLA and throughput analysis._ |
| Consumes Dataset | A defined attribute. | _FK to Datasets. Records which DCAT dataset this step consumes as input. Kept separate from artifact consumption to preserve DCAT metadata semantics (consumesDataset vs. requiresArtifact)._ |
| Produces Artifacts | A defined attribute. | _Back-reference to WorkflowArtifacts produced by this step. Inverse of WorkflowArtifacts.ProducedByStep (ntwf:producesArtifact / prov:wasGeneratedBy)._ |
| Requires Artifacts | A defined attribute. | _FK to WorkflowArtifact(s) this step CONSUMES as input. Maps to ntwf:requiresArtifact (aligned to prov:used). Kept distinct from producesArtifact (prov:generated) and from consumesDataset (dcat:Dataset) so the input/output and artifact/dataset semantics stay separate. Inverse is WorkflowArtifacts.RequiredBySteps._ |
| Approval Gate | A defined attribute. | _Back-reference to the ApprovalGate subtype row that specializes this step, if any. Inverse of ApprovalGates.WorkflowStep. A step has zero or one approval gate; when present, the gate adds escalationThresholdHours and marks the step as a blocking decision checkpoint. This models ntwf:ApprovalGate rdfs:subClassOf WorkflowStep as a shared-key 1:1 specialization rather than collapsing two DAG nodes into one._ |
| Precedes | A defined attribute. | _Back-reference to StepPrecedence edges where this step is the FromStep (the predecessor). Inverse of StepPrecedence.FromStep. Together with PrecededBy, lets you walk the ntwf:precedesStep ordering in both directions._ |
| Preceded by | A defined attribute. | _Back-reference to StepPrecedence edges where this step is the ToStep (the successor). Inverse of StepPrecedence.ToStep. Part of the ntwf:precedesStep transitive ordering relationship._ |
| Executing Human Agent | The filled by human agent of the workflow step's assigned role. | _The HumanAgent (if any) that executes this step, resolved through ntwf:assignedRole → ntwf:filledBy (the HumanAgent arm). Load-bearing lookup: it follows the role→agent indirection the article relies on, so a step knows its executing agent without per-step agent bindings._ |
| Executing AI Agent | The filled by AI agent of the workflow step's assigned role. | _The AIAgent (if any) that executes this step, resolved through ntwf:assignedRole → ntwf:filledBy (the AIAgent arm). One of the three polymorphic filledBy arms._ |
| Executing Automated Pipeline | The filled by automated pipeline of the workflow step's assigned role. | _The AutomatedPipeline (if any) that executes this step, resolved through ntwf:assignedRole → ntwf:filledBy (the AutomatedPipeline arm)._ |
| Executing Agent Type | Determined by priority: “HumanAgent” if the executing human agent has a value; “AIAgent” if the executing AI agent has a value; “AutomatedPipeline” if the executing automated pipeline has a value; in all other cases, an empty string. | _Which of the three disjoint agent classes executes this step (HumanAgent / AIAgent / AutomatedPipeline), derived from whichever filledBy arm the assigned role has set. Answers the typing half of CQ3 ('which steps are executed by AI agents, and which require a human decision')._ |
| Is Executed by AI | True when the executing AI agent has a value. | _TRUE when this step's assigned role is filled by an AIAgent. Feeds CQ3 and the business payoff query (stale workflows with AI-executed steps)._ |
| Is Executed by Human | True when the executing human agent has a value. | _TRUE when this step's assigned role is filled by a HumanAgent. Feeds CQ3's human-vs-AI step split._ |
| Is Approval Gate | True when the approval gate has a value. | _TRUE when this step is specialized by an ApprovalGate subtype row (its ApprovalGate back-reference is set). An approval gate carries escalationThresholdHours and, when it stalls, activates the gate role's delegatesTo escalation chain. Rolls up into Roles.FillsApprovalGate, which marks the role that must have a complete escalation path (CQ6)._ |
| Approval Consistency Violation | True when all of the following hold: the requires human approval flag is set and the executing human agent is blank. | _Detectable-error witness: TRUE iff this step requires human approval (RequiresHumanApproval) yet its assigned role is NOT filled by a HumanAgent. In the OWL ABox this is the rule that only a HumanAgent may fill a role on a requiresHumanApproval step; a clean ABox yields FALSE for every step. This is the relational equivalent of the Suite-4 disjointness/consistency check._ |
| Approval is Human Filled | True when the executing human agent has a value, or else the requires human approval flag is not set. | _Positive form of the human-only-gate rule: TRUE iff this step's human-approval obligation is satisfied — either the step does not require human approval (vacuously satisfied), or it does and its assigned role is filled by a HumanAgent. The clean Production Deployment ABox yields TRUE for every step. This is the affirmative complement of ApprovalConsistencyViolation: the two are always opposite when approval is required, and this one is additionally TRUE on steps that need no approval._ |
| Owning Department | The owned by of the workflow step's assigned role. | _The department that owns this step's assigned role, resolved through AssignedRole → Roles.OwnedBy. Lets a workflow report which departments its steps touch (CQ7: 'which workflows involve both Engineering and Legal, and at what steps do they intersect')._ |
| Is Legal Owned | True when the owning department is “ntwf-legal-dept”. | _TRUE iff this step's owning department is Legal. Rolls up to CQ7's count of Legal-owned steps (exactly one in the Production Deployment workflow)._ |
| Is Engineering Owned | True when the owning department is “ntwf-engineering”. | _TRUE iff this step's owning department is Engineering. Rolls up to CQ7's Engineering-involvement check._ |
| **Approval Gate** | An approval gate is identified by its name and is related to optionally a workflow step. | — |
| Parent Path | The relative path of the approval gate's workflow step. | _Helper: the WorkflowSteps parent's RelativePath, pulled across the WorkflowStep FK. Exists so RelativePath can concatenate the '/approval-gates/' segment using only local-field '&' concat (the transpiler compiles a lookup as a pure passthrough, not a lookup+concat)._ |
| Relative Path | Computed as the parent path, followed by “/approval-gates/”, followed by the approval gate ID. | _Stable, DAG-derived location: this row nests under its WorkflowSteps parent. Concatenates the parent's path (ParentPath) with '/approval-gates/' + this row's primary key. The DAG performs the recursion — one hop per table via ParentPath — so the full ancestry is encoded without a recursive formula. Unique by construction._ |
| Iri | Computed as the relative path with every a slash replaced by a hyphen. | _Opaque stable identifier (the dash-form of RelativePath). Because RelativePath has no leading slash, this is a clean SUBSTITUTE of '/' for '-'. The OWL transpiler mints each individual's IRI from this value (erb:<Iri>), so identity is path-derived and globally unique — no cross-table primary-key collisions._ |
| Name | Computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | — |
| Display Name | A defined attribute. | — |
| Workflow Step | A defined attribute. | _1:1 FK to the WorkflowStep this gate specializes (subtype shared key). This is the relational expression of ntwf:ApprovalGate rdfs:subClassOf WorkflowStep: the gate row adds escalationThresholdHours to its step. Inverse is WorkflowSteps.ApprovalGate._ |
| Escalation Threshold Hours | A defined attribute. | _Integer number of hours that may elapse on a pending gate before the ntwf:delegatesTo chain activates. Maps to ntwf:escalationThresholdHours. Domain applies only to ApprovalGate individuals — which is exactly why the gate is its own subtype table and this attribute does not live on every WorkflowStep._ |
| Gate Role | The assigned role of the approval gate's workflow step. | _The role responsible for this gate's underlying step, resolved through WorkflowStep → WorkflowSteps.AssignedRole. First hop of the CQ2 chain (gate → role → approver)._ |
| Gate Approver Human | The filled by human agent of the approval gate's gate role. | _The human agent who approves at this gate, resolved through the two-hop chain gate → GateRole → Roles.FilledByHumanAgent. Answers CQ2 ('who is responsible for approving a production deployment') directly: the release-approval gate resolves to the Release Manager role, filled by Maria Gonzalez._ |
| Has Human Approver | True when the gate approver human has a value. | _TRUE iff this approval gate resolves to a human approver (its gate role is filled by a HumanAgent). Rolls up into Workflows.CountGatesWithoutHumanApprover, which CQ2's satisfaction reads._ |
| **Step Precedence** | A step precedence is identified by its name and is related to a workflow step (its from step) and a workflow step (its to step). | — |
| Parent Path | The relative path of the step precedence's from step. | _Helper: the WorkflowSteps parent's RelativePath, pulled across the FromStep FK. Exists so RelativePath can concatenate the '/precedence/' segment using only local-field '&' concat (the transpiler compiles a lookup as a pure passthrough, not a lookup+concat)._ |
| Relative Path | Computed as the parent path, followed by “/precedence/”, followed by the step precedence ID. | _Stable, DAG-derived location: this row nests under its WorkflowSteps parent. Concatenates the parent's path (ParentPath) with '/precedence/' + this row's primary key. The DAG performs the recursion — one hop per table via ParentPath — so the full ancestry is encoded without a recursive formula. Unique by construction._ |
| Iri | Computed as the relative path with every a slash replaced by a hyphen. | _Opaque stable identifier (the dash-form of RelativePath). Because RelativePath has no leading slash, this is a clean SUBSTITUTE of '/' for '-'. The OWL transpiler mints each individual's IRI from this value (erb:<Iri>), so identity is path-derived and globally unique — no cross-table primary-key collisions._ |
| Name | Computed as the from step, followed by “ -> ”, followed by the to step. | _Human-readable edge label derived from its endpoints. Mirrors the FromStep -> ToStep direction._ |
| From Step | A defined attribute. | _FK to the predecessor WorkflowStep — the step that comes BEFORE. The source of the ntwf:precedesStep edge. Inverse is WorkflowSteps.Precedes._ |
| To Step | A defined attribute. | _FK to the successor WorkflowStep — the step that comes AFTER. The target of the ntwf:precedesStep edge. Inverse is WorkflowSteps.PrecededBy._ |
| Precedes Step Closure | A defined attribute. | _Transitive closure of ntwf:precedesStep (an owl:TransitiveProperty). The 4 asserted edges (1→2, 2→3, 3→4, 4→5) imply the full 10-pair ordering closure — including the never-asserted step-1 → step-5. Materialized by the transpiler as the view vw_step_precedence_closure(from_id, to_id, hop_distance, is_inferred): 4 asserted (hop 1) + 6 inferred rows. This is the article's headline inference made to fire, not seeded._ |
| **Role** | A role is identified by its name and is related to optionally an agent capability concept (its has capability); optionally a human agent (its filled by human agent); optionally an AI agent (its filled by AI agent); optionally an automated pipeline (its filled by automated pipeline); optionally a department (its owned by); optionally another role (its delegates to); and optionally another role (its from delegates to). | — |
| Relative Path | Computed as “roles/”, followed by the role ID. | _Stable, DAG-derived location for this Role row. Root segment 'roles' + the row's primary key. No leading slash so the Iri swap is a clean 1:1 substitution. The relational analogue of a REST resource path; unique by construction across the whole model._ |
| Iri | Computed as the relative path with every a slash replaced by a hyphen. | _Opaque stable identifier (the dash-form of RelativePath). Because RelativePath has no leading slash, this is a clean SUBSTITUTE of '/' for '-'. The OWL transpiler mints each individual's IRI from this value (erb:<Iri>), so identity is path-derived and globally unique — no cross-table primary-key collisions._ |
| Name | Computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | — |
| Display Name | A defined attribute. | — |
| Label | A defined attribute. | _Human-readable display name. Maps to rdfs:label. Per Heuristic 6: if you cannot write a clear label, you do not yet understand the concept well enough to model it._ |
| Comment | A defined attribute. | _Detailed description of the role's responsibilities and scope. Maps to rdfs:comment. Should define what the role covers, what it excludes, and how it differs from adjacent roles._ |
| Has Capability | A defined attribute. | _FK to AgentCapabilityConcepts. Declares the capability this role requires of its filler. Maps to ntwf:hasCapability. Enables CQ: 'Which roles require AI-specific capabilities?'_ |
| Filled by Human Agent | A defined attribute. | _One arm of the polymorphic ntwf:filledBy relationship: FK to the HumanAgent that fills this role today. Exactly one of FilledByHumanAgent / FilledByAIAgent / FilledByAutomatedPipeline is set per role (filledBy is functional; the three agent types are owl:disjointWith each other). Roles whose capability requires human judgment or legal review must use this arm._ |
| Filled by AI Agent | A defined attribute. | _One arm of the polymorphic ntwf:filledBy relationship: FK to the AIAgent that fills this role today. Exactly one filledBy arm is set per role. An AIAgent may fill probabilistic-capability roles (e.g. risk analysis) but never a role whose step has requiresHumanApproval._ |
| Filled by Automated Pipeline | A defined attribute. | _One arm of the polymorphic ntwf:filledBy relationship: FK to the AutomatedPipeline that fills this role today. Exactly one filledBy arm is set per role. Pipelines fill deterministic execution roles (e.g. CI/CD)._ |
| Owned by | A defined attribute. | _Foreign key to the Department that owns this role. Maps to ntwf:ownedBy (owl:FunctionalProperty). Enables answering CQ7: 'Which workflows involve both Engineering and Legal?'_ |
| Delegates to | A defined attribute. | _Foreign key to the next Role in the escalation chain. Maps to ntwf:delegatesTo (traversable via the SPARQL property path delegatesTo+). Enables answering CQ6: 'What happens when the Release Manager / VP of Engineering is unavailable?'_ |
| Workflow Steps | A defined attribute. | _Back-reference to workflow steps assigned to this role. Inverse of WorkflowSteps.AssignedRole._ |
| From Delegates to | A defined attribute. | _Back-reference: the Role that delegates TO this role (one step up the escalation chain). Inverse of Roles.DelegatesTo._ |
| Role Assignments | A defined attribute. | _Back-reference to the temporal filledBy history for this role (every validity period, current and retained). Inverse of RoleAssignments.Role._ |
| Delegation Closure | A defined attribute. | _Transitive closure of ntwf:delegatesTo over the self-referential DelegatesTo FK. The asserted escalation edges (Release Manager → VP Engineering, VP Engineering → CTO) imply the never-asserted reachability Release Manager → CTO. Materialized as vw_roles_closure(from_id, to_id, hop_distance, is_inferred). This is the SQL equivalent of the SPARQL delegatesTo+ property path._ |
| Filled by Arm Count | Computed as the count of the following that hold: the filled by human agent has a value; the filled by AI agent has a value; and the filled by automated pipeline has a value. | _Number of polymorphic ntwf:filledBy arms set on this role (of FilledByHumanAgent / FilledByAIAgent / FilledByAutomatedPipeline). Should always be exactly 1 — mirroring filledBy being functional and the three agent types being mutually disjoint._ |
| Has Exactly One Filler | True when the filled by arm count is 1. | _Disjointness/functional witness: TRUE iff exactly one filledBy arm is set. The three agent classes are owl:disjointWith one another and ntwf:filledBy is functional, so a clean ABox has this TRUE for every role. Setting two arms (a role filled by both a human and an AI) is the Suite-4 disjointness violation — here it flips this to FALSE._ |
| Filler Type | Determined by priority: “HumanAgent” if the filled by human agent has a value; “AIAgent” if the filled by AI agent has a value; “AutomatedPipeline” if the filled by automated pipeline has a value; in all other cases, an empty string. | _Which disjoint agent class fills this role (HumanAgent / AIAgent / AutomatedPipeline), from whichever filledBy arm is set. Lets the delegation-chain query confirm CQ6's 'zero AI agents in the escalation chain'._ |
| Fills Approval Gate | The number of the role's workflow steps that are approval gates. | _Number of this role's assigned WorkflowSteps that are approval gates (rollup over WorkflowSteps.IsApprovalGate). Greater than zero marks a role that owns a blocking decision checkpoint and therefore MUST have a complete delegatesTo escalation path — the precondition for EscalationViolation. Worked example: 1 for the Release Manager (who fills the Release Approval Gate), 0 for every other role._ |
| Escalation Violation | True when all of the following hold: the fills approval gate is greater than 0 and the delegates to is blank. | _Detectable-error witness: TRUE iff this role owns an approval gate (FillsApprovalGate > 0) yet has no escalation target (DelegatesTo is blank). A gate can stall and must be escalable up the delegatesTo chain; a gate role with no one to escalate to is a broken escalation. A clean ABox yields FALSE for every role. This is the role-side analogue of WorkflowSteps.ApprovalConsistencyViolation, and the witness CQ6's escalation chain depends on._ |
| **Role Assignment** | A role assignment is identified by its name and is related to a role; optionally a human agent (its filled by human agent); optionally an AI agent (its filled by AI agent); and optionally an automated pipeline (its filled by automated pipeline). | — |
| Parent Path | The relative path of the role assignment's role. | _Helper: the Roles parent's RelativePath, pulled across the Role FK. Exists so RelativePath can concatenate the '/assignments/' segment using only local-field '&' concat._ |
| Relative Path | Computed as the parent path, followed by “/assignments/”, followed by the role assignment ID. | _Stable, DAG-derived location: this assignment nests under its Role parent. Concatenates the parent's path (ParentPath) with '/assignments/' + this row's primary key. Unique by construction._ |
| Iri | Computed as the relative path with every a slash replaced by a hyphen. | _Opaque stable identifier (the dash-form of RelativePath). The OWL transpiler mints each individual's IRI from this value (erb:<Iri>), so identity is path-derived and globally unique._ |
| Name | Computed as the role, followed by “ [”, followed by the valid from, followed by “ -> ”, followed by “open” if the valid to is blank, in all other cases the valid to, followed by “]”. | _Human-readable label for this assignment period: the role and the validity window._ |
| Role | A defined attribute. | _FK to the Role this assignment binds an agent to. The subject of the historical ntwf:filledBy triple._ |
| Filled by Human Agent | A defined attribute. | _One arm of the polymorphic filledBy binding for this assignment period: FK to the HumanAgent who filled the role during this window. Exactly one filler arm is set per assignment._ |
| Filled by AI Agent | A defined attribute. | _One arm of the polymorphic filledBy binding: FK to the AIAgent who filled the role during this window. Exactly one filler arm is set per assignment._ |
| Filled by Automated Pipeline | A defined attribute. | _One arm of the polymorphic filledBy binding: FK to the AutomatedPipeline that filled the role during this window. Exactly one filler arm is set per assignment._ |
| Valid From | A defined attribute. | _Start of the validity period for this filledBy binding (inclusive). A retained/versioned triple carries the validity period. ISO date._ |
| Valid to | A defined attribute. | _End of the validity period for this filledBy binding (exclusive). Blank means the binding is still current — this is the live ntwf:filledBy value mirrored on Roles. A non-blank value means the binding was superseded; the row is retained (not deleted) to preserve provenance._ |
| Reason | A defined attribute. | _The WHY of the change: the audit record must reflect when that transition happened and why. e.g. 'initial assignment', 'departure / backfill', 'model upgrade', 'compliance reassignment to human'._ |
| Prior Filler Type | A defined attribute. | _The agent class (HumanAgent / AIAgent / AutomatedPipeline) of the binding this assignment SUPERSEDED, or blank for the first assignment of a role. Lets the agent-type-change audit (AIAgent -> HumanAgent) be witnessed without re-deriving from the prior row._ |
| Filler Type | Determined by priority: “HumanAgent” if the filled by human agent has a value; “AIAgent” if the filled by AI agent has a value; “AutomatedPipeline” if the filled by automated pipeline has a value; in all other cases, an empty string. | _Which agent class filled the role during this period, derived from the three filler arms. Mirrors Roles.FillerType but for the historical binding._ |
| Is Current | True when the valid to is blank. | _TRUE iff this is the live binding (ValidTo is blank). The set of IsCurrent rows reproduces exactly the current Roles.FilledBy* values; the rest are retained history. The old triple is never deleted — closed rows stay, only IsCurrent flips._ |
| Was Active As of Audit Date | True when all of the following hold: the valid from is at most “2026-03-01” and at least one of the following holds: the valid to is blank or the valid to is greater than “2026-03-01”. | _NTWF's signature temporal query: 'which agent was executing this step on March 1, 2026?'. TRUE iff this binding's validity period contains 2026-03-01 (ValidFrom <= the date AND (ValidTo blank OR ValidTo > the date)). ISO dates compare lexically. The single row that is TRUE for a given role names the agent active on the audit date — answerable only because history is retained._ |
| Is Agent Type Change | True when all of the following hold: the prior filler type has a value and the prior filler type is not the filler type. | _TRUE iff this assignment changed the agent CLASS of the role (PriorFillerType set and different from FillerType). NTWF distinguishes a plain personnel/model swap (same class) from an agent-type transition, which carries compliance weight._ |
| Requires Compliance Audit | True when all of the following hold: the prior filler type has a value; the prior filler type is “AIAgent”; and the filler type is “HumanAgent”. | _Changing the agent type of a step from ntwf:AIAgent to ntwf:HumanAgent is a data operation with compliance implications. TRUE iff this assignment took a previously AI-executed binding and reassigned it to a human — the exact transition NTWF governance says the audit record must capture (when + why)._ |
| **Department** | A department is identified by its name. | — |
| Relative Path | Computed as “departments/”, followed by the department ID. | _Stable, DAG-derived location for this Department row. Root segment 'departments' + the row's primary key. No leading slash so the Iri swap is a clean 1:1 substitution. The relational analogue of a REST resource path; unique by construction across the whole model._ |
| Iri | Computed as the relative path with every a slash replaced by a hyphen. | _Opaque stable identifier (the dash-form of RelativePath). Because RelativePath has no leading slash, this is a clean SUBSTITUTE of '/' for '-'. The OWL transpiler mints each individual's IRI from this value (erb:<Iri>), so identity is path-derived and globally unique — no cross-table primary-key collisions._ |
| Name | Computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | _Human-readable display name of the department. Should match organizational terminology for stakeholder communication._ |
| Title | A defined attribute. | _Formal organizational title of the department. Maps to schema:name / dct:title._ |
| Display Name | A defined attribute. | _Machine-friendly name for programmatic reference._ |
| Roles | A defined attribute. | _Back-reference to roles owned by this department. Inverse of Roles.OwnedBy._ |
| **Human Agent** | A human agent is identified by its name. | — |
| Relative Path | Computed as “human-agents/”, followed by the human agent ID. | _Stable, DAG-derived location for this HumanAgent row. Root segment 'human-agents' + the row's primary key. No leading slash so the Iri swap is a clean 1:1 substitution. The relational analogue of a REST resource path; unique by construction across the whole model._ |
| Iri | Computed as the relative path with every a slash replaced by a hyphen. | _Opaque stable identifier (the dash-form of RelativePath). Because RelativePath has no leading slash, this is a clean SUBSTITUTE of '/' for '-'. The OWL transpiler mints each individual's IRI from this value (erb:<Iri>), so identity is path-derived and globally unique — no cross-table primary-key collisions._ |
| Name | A defined attribute. | _Full name of the person. Maps to foaf:name. Note: FOAF's name property is appropriate for persons, not for software systems (which use schema:name)._ |
| Display Name | A defined attribute. | — |
| Mbox | A defined attribute. | _Email address of the person. Maps to foaf:mbox. Used for notifications and organizational directory integration._ |
| Roles | A defined attribute. | _Back-reference to roles currently filled by this agent. Inverse of Roles.FilledByHumanAgent._ |
| Role Assignments | A defined attribute. | _Back-reference to historical filledBy assignment periods in which this human filled a role. Inverse of RoleAssignments.FilledByHumanAgent._ |
| **AI Agent** | An AI agent is identified by its name and is related to optionally a workflow artifact (its attributed artifacts). | — |
| Relative Path | Computed as “ai-agents/”, followed by the AI agent ID. | _Stable, DAG-derived location for this AIAgent row. Root segment 'ai-agents' + the row's primary key. No leading slash so the Iri swap is a clean 1:1 substitution. The relational analogue of a REST resource path; unique by construction across the whole model._ |
| Iri | Computed as the relative path with every a slash replaced by a hyphen. | _Opaque stable identifier (the dash-form of RelativePath). Because RelativePath has no leading slash, this is a clean SUBSTITUTE of '/' for '-'. The OWL transpiler mints each individual's IRI from this value (erb:<Iri>), so identity is path-derived and globally unique — no cross-table primary-key collisions._ |
| Name | A defined attribute. | _Display name of the AI agent. Maps to schema:name (not foaf:name, which is for persons)._ |
| Title | A defined attribute. | _Descriptive title of the AI agent's function._ |
| Display Name | A defined attribute. | — |
| Model Version | A defined attribute. | _Version string of the AI model. Maps to ntwf:modelVersion. Makes AI-produced artifacts auditable at the version level. The domain declaration means this property applies only to AIAgent individuals._ |
| Deployed on | A defined attribute. | _Deployment date of this AI model version. The NTWF graph doubles as an AI system registry: 'risk-classifier-v2.4.1 was deployed on 2026-01-10'. Sourced from the AI system registry feed via the shared Dublin Core contract (dct:date)._ |
| Roles | A defined attribute. | _Back-reference to roles currently filled by this AI agent. Inverse of Roles.FilledByAIAgent._ |
| Role Assignments | A defined attribute. | _Back-reference to historical filledBy assignment periods filled by this AI agent. Inverse of RoleAssignments.FilledByAIAgent._ |
| Attributed Artifacts | A defined attribute. | _Back-reference to WorkflowArtifacts attributed to this AI agent (prov:wasAttributedTo). Inverse of WorkflowArtifacts.AttributedToAIAgent. First leg of the 'blast radius' traversal._ |
| Count Attributed Artifacts | The number of workflow artifacts related to the AI agent. | _'Blast radius', leg 1: how many artifacts are attributed to this AI agent (prov:wasAttributedTo). Counts WorkflowArtifacts whose AttributedToAIAgent is this agent._ |
| Count Impacted Workflows | The number of the AI agent's workflow artifacts that have a producing workflow. | _'Blast radius', summarized: the number of distinct workflows reachable from this agent's attributed artifacts (each artifact is produced by a step that belongs to a workflow). With one workflow in the worked example, an upgrade to an agent that produced any artifact has a blast radius of 1 workflow. Counts artifacts attributed to this agent that resolve to a workflow._ |
| **Automated Pipeline** | An automated pipeline is identified by its name. | — |
| Relative Path | Computed as “automated-pipelines/”, followed by the automated pipeline ID. | _Stable, DAG-derived location for this AutomatedPipeline row. Root segment 'automated-pipelines' + the row's primary key. No leading slash so the Iri swap is a clean 1:1 substitution. The relational analogue of a REST resource path; unique by construction across the whole model._ |
| Iri | Computed as the relative path with every a slash replaced by a hyphen. | _Opaque stable identifier (the dash-form of RelativePath). Because RelativePath has no leading slash, this is a clean SUBSTITUTE of '/' for '-'. The OWL transpiler mints each individual's IRI from this value (erb:<Iri>), so identity is path-derived and globally unique — no cross-table primary-key collisions._ |
| Name | A defined attribute. | _Display name of the pipeline. Maps to schema:name (appropriate for software systems, unlike foaf:name which is for persons)._ |
| Description | A defined attribute. | _Description of what the pipeline does and its execution semantics (deterministic, no probabilistic output)._ |
| Display Name | A defined attribute. | — |
| Roles | A defined attribute. | _Back-reference to roles currently filled by this pipeline. Inverse of Roles.FilledByAutomatedPipeline._ |
| Role Assignments | A defined attribute. | _Back-reference to historical filledBy assignment periods filled by this pipeline. Inverse of RoleAssignments.FilledByAutomatedPipeline._ |
| **Workflow Status Concept** | SKOS controlled vocabulary for workflow lifecycle states (ntwf:WorkflowStatusScheme). Part of the CBox. Concepts are shared across all workflows. | — |
| Relative Path | Computed as “concepts/workflow-status/”, followed by the concept ID. | _Stable, DAG-derived location for this WorkflowStatusConcept row. Root segment 'concepts/workflow-status' + the row's primary key. No leading slash so the Iri swap is a clean 1:1 substitution. The relational analogue of a REST resource path; unique by construction across the whole model._ |
| Iri | Computed as the relative path with every a slash replaced by a hyphen. | _Opaque stable identifier (the dash-form of RelativePath). Because RelativePath has no leading slash, this is a clean SUBSTITUTE of '/' for '-'. The OWL transpiler mints each individual's IRI from this value (erb:<Iri>), so identity is path-derived and globally unique — no cross-table primary-key collisions._ |
| Pref Label | A defined attribute. | _Preferred human-readable label. Maps to skos:prefLabel._ |
| Alt Label | A defined attribute. | _Alternative label or synonym. Maps to skos:altLabel._ |
| Definition | A defined attribute. | _Formal definition of the concept. Maps to skos:definition._ |
| Scope Note | A defined attribute. | _Usage guidance for the concept. Maps to skos:scopeNote._ |
| Workflows | A defined attribute. | _Back-reference to workflows currently in this status. Inverse of Workflows.WorkflowStatus._ |
| **Agent Capability Concept** | SKOS controlled vocabulary for agent capability types (ntwf:AgentCapabilityScheme). Roles declare which capability their filler must have (ntwf:hasCapability). Part of the CBox. | — |
| Relative Path | Computed as “concepts/agent-capability/”, followed by the concept ID. | _Stable, DAG-derived location for this AgentCapabilityConcept row. Root segment 'concepts/agent-capability' + the row's primary key. No leading slash so the Iri swap is a clean 1:1 substitution. The relational analogue of a REST resource path; unique by construction across the whole model._ |
| Iri | Computed as the relative path with every a slash replaced by a hyphen. | _Opaque stable identifier (the dash-form of RelativePath). Because RelativePath has no leading slash, this is a clean SUBSTITUTE of '/' for '-'. The OWL transpiler mints each individual's IRI from this value (erb:<Iri>), so identity is path-derived and globally unique — no cross-table primary-key collisions._ |
| Pref Label | A defined attribute. | _Preferred label. Maps to skos:prefLabel._ |
| Alt Label | A defined attribute. | _Alternative label. Maps to skos:altLabel._ |
| Definition | A defined attribute. | _Formal definition. Maps to skos:definition._ |
| Scope Note | A defined attribute. | _Usage guidance. Maps to skos:scopeNote._ |
| Roles | A defined attribute. | _Back-reference to roles requiring this capability. Inverse of Roles.HasCapability._ |
| **Artifact Type Concept** | SKOS controlled vocabulary for artifact type (ntwf artifact-type scheme). Part of the CBox; NTWF names a CBox concept scheme for artifact types alongside workflow status and agent capabilities. Each artifact is classified via dct:type into one of these concepts. | — |
| Relative Path | Computed as “concepts/artifact-type/”, followed by the concept ID. | _Stable, DAG-derived location for this concept row. Root segment 'concepts/artifact-type' + the row's primary key._ |
| Iri | Computed as the relative path with every a slash replaced by a hyphen. | _Opaque stable identifier (the dash-form of RelativePath). The OWL transpiler mints each individual's IRI from this value._ |
| Pref Label | A defined attribute. | _Preferred human-readable label. Maps to skos:prefLabel._ |
| Alt Label | A defined attribute. | _Alternative label or synonym. Maps to skos:altLabel._ |
| Definition | A defined attribute. | _Formal definition of the concept. Maps to skos:definition._ |
| Scope Note | A defined attribute. | _Usage note clarifying boundaries. Maps to skos:scopeNote._ |
| Workflow Artifacts | A defined attribute. | _Back-reference to WorkflowArtifacts classified under this concept. Inverse of WorkflowArtifacts.ArtifactType._ |
| **Dataset** | DCAT datasets consumed by workflow steps. The NTWF mapping of dcat:Dataset. Kept separate from WorkflowArtifacts to preserve DCAT metadata semantics (dcat:Dataset vs. prov:Entity). Answers CQ8: 'What datasets does the review consume, and which AI processed them?' | — |
| Relative Path | Computed as “datasets/”, followed by the dataset ID. | _Stable, DAG-derived location for this Dataset row. Root segment 'datasets' + the row's primary key. No leading slash so the Iri swap is a clean 1:1 substitution. The relational analogue of a REST resource path; unique by construction across the whole model._ |
| Iri | Computed as the relative path with every a slash replaced by a hyphen. | _Opaque stable identifier (the dash-form of RelativePath). Because RelativePath has no leading slash, this is a clean SUBSTITUTE of '/' for '-'. The OWL transpiler mints each individual's IRI from this value (erb:<Iri>), so identity is path-derived and globally unique — no cross-table primary-key collisions._ |
| Title | A defined attribute. | _Human-readable dataset name. Maps to dct:title._ |
| Identifier | A defined attribute. | _External system identifier. Maps to dct:identifier. Used for cross-referencing with data catalogs._ |
| Modified | A defined attribute. | _Last modification timestamp. Maps to dct:modified._ |
| Distribution URL | A defined attribute. | _URL of the data distribution. Maps to dcat:Distribution. The access endpoint for the dataset._ |
| Consumed by Steps | A defined attribute. | _Back-reference to WorkflowSteps that consume this dataset. Inverse of WorkflowSteps.ConsumesDataset. Marked isReversed so every substrate DERIVES it from the forward FK (a reverse lookup over WorkflowSteps.ConsumesDataset) instead of storing it — keeping the two sides from drifting when the forward FK is edited._ |
| Is Consumed | True when the consumed by steps has a value. | _TRUE iff some workflow step consumes this dataset (ConsumedBySteps is set). Rolls up into Workflows.CountUnconsumedDatasets, which CQ8's satisfaction reads._ |
| **Workflow Artifact** | Artifacts produced and consumed by workflow steps. The NTWF WorkflowArtifact class — prov:Entity + schema:CreativeWork. The DerivedFromArtifact self-FK encodes the prov:wasDerivedFrom provenance chain; ProducedByStep maps prov:wasGeneratedBy; the AttributedTo* arms map prov:wasAttributedTo to the responsible agent. | — |
| Parent Path | The relative path of the workflow artifact's produced by step. | _Helper: the WorkflowSteps parent's RelativePath, pulled across the ProducedByStep FK. Exists so RelativePath can concatenate the '/artifacts/' segment using only local-field '&' concat (the transpiler compiles a lookup as a pure passthrough, not a lookup+concat)._ |
| Relative Path | Computed as the parent path, followed by “/artifacts/”, followed by the artifact ID. | _Stable, DAG-derived location: this row nests under its WorkflowSteps parent. Concatenates the parent's path (ParentPath) with '/artifacts/' + this row's primary key. The DAG performs the recursion — one hop per table via ParentPath — so the full ancestry is encoded without a recursive formula. Unique by construction._ |
| Iri | Computed as the relative path with every a slash replaced by a hyphen. | _Opaque stable identifier (the dash-form of RelativePath). Because RelativePath has no leading slash, this is a clean SUBSTITUTE of '/' for '-'. The OWL transpiler mints each individual's IRI from this value (erb:<Iri>), so identity is path-derived and globally unique — no cross-table primary-key collisions._ |
| Title | A defined attribute. | _Human-readable artifact name. Maps to dct:title._ |
| Identifier | A defined attribute. | _External system identifier. Maps to dct:identifier._ |
| Artifact Type | A defined attribute. | _FK to the ArtifactTypeConcepts SKOS concept classifying this artifact. Maps to dct:type. The CBox defines a concept scheme for artifact types._ |
| Created | A defined attribute. | _Creation timestamp. Maps to dct:created._ |
| Produced by Step | A defined attribute. | _FK to the WorkflowStep that produced this artifact. Maps to prov:wasGeneratedBy. Inverse of WorkflowSteps.ProducesArtifacts._ |
| Required by Steps | A defined attribute. | _Back-reference to the WorkflowStep(s) that consume this artifact as input (ntwf:requiresArtifact / prov:used). Inverse of WorkflowSteps.RequiresArtifacts._ |
| Derived From Artifact | A defined attribute. | _Self-FK to the artifact this one was derived from. Maps to prov:wasDerivedFrom. Enables the full provenance chain query (CQ4)._ |
| Attributed to Human Agent | A defined attribute. | _FK to HumanAgent responsible for this artifact. One arm of prov:wasAttributedTo (exactly one AttributedTo arm is set per artifact, mirroring the disjoint agent types)._ |
| Attributed to AI Agent | A defined attribute. | _FK to AIAgent responsible for this artifact. One arm of prov:wasAttributedTo._ |
| Attributed to Automated Pipeline | A defined attribute. | _FK to AutomatedPipeline responsible for this artifact. One arm of prov:wasAttributedTo._ |
| Producing Agent Type | Determined by priority: “HumanAgent” if the attributed to human agent has a value; “AIAgent” if the attributed to AI agent has a value; “AutomatedPipeline” if the attributed to automated pipeline has a value; in all other cases, an empty string. | _Which disjoint agent class produced this artifact (HumanAgent / AIAgent / AutomatedPipeline), from whichever prov:wasAttributedTo arm is set. Lets CQ4 report which kind of agent each artifact in the lineage came from._ |
| Has Derivation Parent | True when the derived from artifact has a value. | _TRUE iff this artifact was derived from another (prov:wasDerivedFrom is set). Counting these across the chain gives CQ4's '4 derivation links among 5 artifacts' — every artifact except the first has a parent._ |
| Produced by Workflow | Taken from the linked produced by step. | _The workflow this artifact belongs to, resolved through ProducedByStep → WorkflowSteps.Workflow (artifact → producing step → workflow). Lets workflow-level rollups (e.g. CountDerivationLinks) aggregate artifacts without a redundant direct FK._ |
| Has Producing Workflow | True when the produced by workflow has a value. | _TRUE iff this artifact resolves to a producing workflow (ProducedByWorkflow is set). Lets the AIAgents blast-radius rollup (CountImpactedWorkflows) count only artifacts that reach a workflow, since COUNTIFS needs a boolean criterion column._ |
| Derivation Closure | A defined attribute. | _Transitive closure of prov:wasDerivedFrom over the self-referential DerivedFromArtifact FK. The asserted single-step derivation edges (Legal Clearance was derived from Risk Report, Release Authorization from Legal Clearance, …) imply the never-asserted reachability (Post-Deployment Report transitively wasDerivedFrom Risk Report). Materialized as vw_workflow_artifacts_closure(from_id, to_id, hop_distance, is_inferred). This is the artifact-lineage analogue of vw_step_precedence_closure and vw_roles_closure — the SAME closure construct as step ordering and role escalation, just over a different relation, so a broken link surfaces as a missing reachability pair exactly like a dropped precedence edge._ |
| **Governance Role** | A governance role is identified by its name and is related to optionally a change log (its approved changes). | — |
| Relative Path | Computed as “governance-roles/”, followed by the governance role ID. | _Stable, DAG-derived location for this GovernanceRole row. Root segment 'governance-roles' + the row's primary key._ |
| Iri | Computed as the relative path with every a slash replaced by a hyphen. | _Opaque stable identifier (the dash-form of RelativePath). The OWL transpiler mints each individual's IRI from this value._ |
| Name | Computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | _Slug form of the display name._ |
| Display Name | A defined attribute. | _Human-readable name of the governance role (e.g. 'Steward', 'Authority')._ |
| Kind | A defined attribute. | _Which of the two NTWF governance kinds this is: 'Steward' or 'Authority'._ |
| Responsibilities | A defined attribute. | _What this role is responsible for. Steward: monitor drift, track external dependency updates, field user questions, maintain documentation, keep the validation suite current. Authority: approve changes to CBox/ABox/TBox; decide how and where a change is made._ |
| Approval Scope | A defined attribute. | _The boxes this role may approve changes to (CBox/ABox/TBox), or 'none' for a Steward — who can identify that a change is needed but cannot approve it._ |
| Held by | A defined attribute. | _The person or function holding this role. The steward is naturally whoever owns the engineering knowledge infrastructure; authority sits with the workflow governance function that owns the modeled domain. Under 500 people, one person may hold both._ |
| Can Approve Changes | True when the kind is “Authority”. | _TRUE iff this governance role carries approval power (Kind = 'Authority'). A Steward returns FALSE — a steward making TBox/ABox changes without authority review is a single point of failure._ |
| Approved Changes | A defined attribute. | _Back-reference to ChangeLog entries this governance role approved. Inverse of ChangeLog.ApprovedBy._ |
| **Change Log** | A change log is identified by its name and is related to optionally a governance role (its approved by). | — |
| Relative Path | Computed as “change-log/”, followed by the change log ID. | _Stable, DAG-derived location for this ChangeLog row. Root segment 'change-log' + the row's primary key._ |
| Iri | Computed as the relative path with every a slash replaced by a hyphen. | _Opaque stable identifier (the dash-form of RelativePath)._ |
| Name | Computed as the version, followed by “ (”, followed by the change date, followed by “)”. | _Human-readable label: the version and date of this change._ |
| Version | A defined attribute. | _The release version number this change shipped in (semantic versioning MAJOR.MINOR.PATCH). NTWF is currently at 1.1.0._ |
| Change Date | A defined attribute. | _The date of the change. One of the four facts NTWF governance requires every change-log entry to record._ |
| Change Kind | A defined attribute. | _Semantic-versioning class of the change: 'patch' (documentation/label/comment only, formal model unchanged), 'minor' (additive — new classes/properties/CBox concepts, backward compatible), or 'major' (breaking — class removed/renamed, domain/range change invalidating ABox triples, or a new disjointness axiom)._ |
| Motivating Question | A defined attribute. | _The competency question that motivated the change. One of the four facts NTWF governance requires. Empty if the change was driven by an external-dependency update rather than a CQ._ |
| Terms Affected | A defined attribute. | _The ontology terms (classes/properties/concepts) the change added, removed, or modified. One of the four facts NTWF governance requires._ |
| Rationale | A defined attribute. | _Why the change was made. NTWF governance requires every TBox/ABox modification to be logged with its rationale._ |
| Approved by | A defined attribute. | _FK to the GovernanceRole (an Authority) that approved this change. Changes to CBox/ABox/TBox require authority review; a steward identifying a need is not enough._ |
| Is Breaking Change | True when the change kind is “major”. | _TRUE iff this is a major (breaking) change (ChangeKind = 'major') — requires explicit update, re-validation, and migration planning for any system on the prior version._ |
| Is Backward Compatible | True when at least one of the following holds: the change kind is “patch” or the change kind is “minor”. | _TRUE iff systems on the prior version keep working against this release (ChangeKind is 'patch' or 'minor'). Patch and minor increments preserve backward compatibility; only major breaks it._ |
| **Vocabulary Reconciliation** | A vocabulary reconciliation is identified by its name. | — |
| Relative Path | Computed as “reconciliations/”, followed by the reconciliation ID. | _Stable, DAG-derived location for this reconciliation row. Root segment 'reconciliations' + the row's primary key._ |
| Iri | Computed as the relative path with every a slash replaced by a hyphen. | _Opaque stable identifier (the dash-form of RelativePath)._ |
| Name | Computed as the deprecated term, followed by “ owl:sameAs ”, followed by the replacement term. | _Human-readable label: the sameAs relation between the deprecated term and its NTWF replacement._ |
| Deprecated Term | A defined attribute. | _The borrowed/deprecated term being reconciled (e.g. foaf:name)._ |
| Replacement Term | A defined attribute. | _The NTWF-namespaced replacement term (e.g. ntwf:name)._ |
| Reconciliation Relation | A defined attribute. | _The OWL relation asserting equivalence. NTWF uses owl:sameAs._ |
| Source Standard | A defined attribute. | _The external standard the deprecated term came from (PROV-O, FOAF, Dublin Core, DCAT, Schema.org)._ |
| Introduced in Version | A defined attribute. | _The NTWF release version in which this reconciliation shipped. Re-homing a term triggers a version bump._ |
| Rationale | A defined attribute. | _Why the term was re-homed (e.g. upstream deprecation; semantic-alignment shift)._ |
| **Scenario** | A scenario is identified by its name. | — |
| Relative Path | Computed as “scenarios/”, followed by the scenario ID. | _DAG-derived location for this Scenario row: root segment 'scenarios' + the primary key._ |
| Iri | Computed as the relative path with every a slash replaced by a hyphen. | _Opaque stable identifier (dash-form of RelativePath)._ |
| Name | Computed as the lower-cased label with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | _Slug form of the human label._ |
| Label | A defined attribute. | _Human-readable button label for this scenario in the picker._ |
| Icon | A defined attribute. | _A single emoji shown beside the label in the picker._ |
| Explanation | A defined attribute. | _Plain-language description of what this scenario changes and what the reasoner will derive as a result. Shown in the floating scenario picker so the user knows what each preset does before applying it._ |
| Sort Order | A defined attribute. | _Display order in the picker (ascending)._ |
| Is Reset | True when an empty string. | _True for the single 'restore baseline' scenario; the picker styles it as a secondary action._ |
| Edits | A defined attribute. | _JSON-encoded ordered list of raw-fact assignments this scenario applies. Each item is {class, id\|match, set:{field:value,...}} where 'class' is a rulebook table (camelCase keys on the raw store), 'id' targets a row by its *Id primary key (or 'match':'first' for the singleton Workflow), and 'set' is the raw fields to assign. The backend replays this list against the active raw store, then re-reasons — the scenario NEVER sets a derived field. This is the single source of truth for what each demo scenario does; the app's picker and the apply endpoint both read it from here (same JSON-on-a-first-class-table pattern as __meta__'s JsonValue)._ |
| **Competency Question** | The article's literal acceptance suite — the eight leadership/competency questions the NTWF worked example must answer (Talisman, Intentional Arrangement, CQ1-CQ8). First-class data, not hardcoded UI strings: each row names the question, the substrate-computed field that ANSWERS it (TargetTable/TargetField, for cross-substrate traceability and the explainer-DAG drilldown), the answer kind, and the asserted ExpectedAnswer used to grade pass/fail. The live answer is always READ from the named computed column — never recomputed — so the CQ scoreboard is a projection of the model like every other lens. This is the CMCC-native home for the competency questions: the article treats them as acceptance criteria traceable to the rulebook, so they live in the rulebook. | — |
| Relative Path | Computed as “competency-questions/”, followed by the competency question ID. | _Stable, DAG-derived location for this CompetencyQuestion row. Root segment 'competency-questions' + the row's primary key. No leading slash so the Iri swap is a clean 1:1 substitution._ |
| Iri | Computed as the relative path with every a slash replaced by a hyphen. | _Opaque stable identifier (the dash-form of RelativePath). The OWL transpiler mints each individual's IRI from this value (erb:<Iri>), so identity is path-derived and globally unique._ |
| Name | Computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | _Slug form of the DisplayName, for stable cross-reference. Mirrors the Name idiom used by the controlled-vocabulary tables._ |
| Number | A defined attribute. | _The canonical 1-8 ordering of the competency questions as listed in the article / README._ |
| Display Name | A defined attribute. | _Short human label for the question (e.g. 'Steps and order')._ |
| Question Text | A defined attribute. | _The full competency question, verbatim from the article's acceptance suite._ |
| Target Table | A defined attribute. | _The entity whose computed field answers this question. Together with TargetField it pins the answer to a real column in the substrate, so the scoreboard reads the answer (never recomputes it) and the explainer-DAG drilldown lands on the exact derivation._ |
| Target Field | A defined attribute. | _The substrate-computed field on TargetTable that answers this question (calc / lookup / aggregation / closure). The CQ scoreboard wraps the live answer in a DagCell(TargetTable, TargetField) so a click opens its inference graph._ |
| Answer Kind | A defined attribute. | _'scalar' when the answer is a single value graded by equality with ExpectedAnswer; 'list' when the answer is a collection graded as answerable (non-empty / matches the asserted shape)._ |
| Expected Answer | A defined attribute. | _The asserted correct answer for the seed worked example. For scalar questions the live computed value must equal this to score a pass; for list questions this is the canonical summary the rendered collection is checked against. Authored here so pass/fail is (substrate-computed value) vs (rulebook-asserted expectation) — a real conformance check, not UI logic._ |
| Satisfied Field | A defined attribute. | _Name of the boolean column on Workflows that computes whether this CQ is satisfied (e.g. Cq6Satisfied). The scoreboard reads pass/fail straight from this substrate-computed column — the acceptance criterion lives in the rulebook as a derived field, never as app-side logic. Mirrors TargetTable/TargetField for the answer._ |
| Explanation | A defined attribute. | _One-sentence note on how this question resolves through the model — the FK / formula chain a presenter can narrate._ |
| Sort Order | A defined attribute. | _Display order in the scoreboard. Mirrors Number for now; kept separate so the list can be re-sequenced without renumbering the canonical CQ ids._ |
| Is Active | True when an empty string. | _Whether this competency question is shown in the scoreboard. All eight are active in the worked example._ |
| Simulate Scenario | A defined attribute. | _FK to the Scenario the card's 'Simulate' button applies to demonstrate this competency question live. Points at the minimal raw-fact edit that moves THIS question's answer in isolation where one exists; for cq-2 it points at 'ai-release-manager', which also ripples to cq-3 (the gate approver is itself a step executor, so the two answers cannot be perturbed independently). The full set of questions each scenario moves — trigger vs ripple — is enumerated in the ScenarioCQEffects junction; this is just the one the button fires. Inverse-ish of ScenarioCQEffects but kept as a direct FK so the UI has a single answer._ |
| **Scenario CQ Effect** | A scenario CQ effect is identified by its name and is related to a scenario and a competency question. | — |
| Relative Path | Computed as “scenario-cq-effects/”, followed by the scenario CQ effect ID. | _DAG-derived location: 'scenario-cq-effects/' + the row's primary key._ |
| Iri | Computed as the relative path with every a slash replaced by a hyphen. | _Opaque stable identifier (dash-form of RelativePath)._ |
| Name | Computed as the lower-cased scenario CQ effect ID with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | _Slug label, mirrors the primary key._ |
| Scenario | A defined attribute. | _FK to the Scenario whose raw-fact edits cause this effect. The 'many effects belong to one scenario' side: a single scenario can move several competency questions._ |
| Competency Question | A defined attribute. | _FK to the CompetencyQuestion whose live answer this scenario moves. The 'many effects belong to one question' side: a question can be exercised by several scenarios._ |
| Effect Kind | A defined attribute. | _'trigger' = this scenario was authored to move this question (the point of the demo). 'ripple' = the question also moves as an unavoidable side effect of the same raw edit. The ripple rows are the pedagogical payload: they show answers that are structurally coupled and cannot be perturbed independently._ |
| Note | A defined attribute. | _One-line, human-readable account of how this scenario moves this question's answer (qualitative — the actual value is read live from the substrate, never stored here)._ |
| Sort Order | A defined attribute. | _Display order._ |
| **Conformance Test** | A conformance test is identified by its name. | — |
| Relative Path | Computed as “conformance-tests/”, followed by the conformance test ID. | _DAG-derived location for this test row: root segment 'conformance-tests' + the primary key._ |
| Iri | Computed as the relative path with every a slash replaced by a hyphen. | _Slug IRI for this row, derived from RelativePath._ |
| Name | Computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | _Machine name derived from the display name._ |
| Display Name | A defined attribute. | _Human-readable test title shown in the admin console and run logs._ |
| Feature Ref | A defined attribute. | _Comma-separated FEATURE-COVERAGE.md ids this test witnesses (e.g. 'II-3,CQ2'). The traceability link from the article's feature inventory to an executable assertion._ |
| Section | A defined attribute. | _Grouping for display: 'Sweep', 'Part I'..'Part IV', 'Closure', 'Mutation'._ |
| Test Kind | A defined attribute. | _How the harness executes this test. 'sweep' = every row+field of TargetRef table vs the answer key; 'field-match' = one row's field vs the answer key; 'closure-contains' = a from→to pair must appear in the engine's computed transitive closure (Expect names the closure and pair); 'engines-agree' = zero value-class disagreements between the two engines; 'mutation' = apply Expect.edits to an in-memory copy of the seed facts, re-reason, and check Expect.assert — the store is NEVER written._ |
| Target Ref | A defined attribute. | _What the test reads: 'Entity' (whole table), 'Entity/pk' (one row) or 'Entity/pk#Field' (one value). Slash/hash form on purpose — these are spec references, not foreign keys._ |
| Expect | A defined attribute. | _Kind-specific JSON spec. Empty for sweep/field-match/engines-agree — there the ORACLE is the answer key (testing/answer-keys), never a value hardcoded here (a literal would go stale; the key regenerates). closure-contains: {closure, from, to}. mutation: {edits:[{class,id,set:{camelRawField:value}}], assert:[{class,id,field,equals}]} — same edits shape as Scenarios.Edits._ |
| Explanation | A defined attribute. | _Why this test exists — what feature of the model it flexes, in one sentence._ |
| Sort Order | A defined attribute. | _Display/run order within the suite._ |
| Is Enabled | True when an empty string. | _Disabled tests are listed but not executed (parked, not deleted — the list stays the complete spec)._ |

## 2 Fact Types

- a **workflow** may reference one **workflow status concept**
- a **workflow step** may reference one **workflow**
- a **workflow step** may reference one **role**
- a **workflow step** may reference one **dataset**
- a **workflow step** may reference one **workflow artifact**
- a **workflow step** may reference one **approval gate**
- a **workflow step** may reference one **step precedence**
- an **approval gate** may reference one **workflow step**
- a **step precedence** references exactly one **workflow step**
- a **role** may reference one **agent capability concept**
- a **role** may reference one **human agent**
- a **role** may reference one **AI agent**
- a **role** may reference one **automated pipeline**
- a **role** may reference one **department**
- a **role** may reference one **role**
- a **role assignment** references exactly one **role**
- a **role assignment** may reference one **human agent**
- a **role assignment** may reference one **AI agent**
- a **role assignment** may reference one **automated pipeline**
- an **AI agent** may reference one **workflow artifact**
- a **dataset** may reference one **workflow step**
- a **workflow artifact** may reference one **artifact type concept**
- a **workflow artifact** may reference one **workflow step**
- a **workflow artifact** may reference one **workflow artifact**
- a **workflow artifact** may reference one **human agent**
- a **workflow artifact** may reference one **AI agent**
- a **workflow artifact** may reference one **automated pipeline**
- a **governance role** may reference one **change log**
- a **change log** may reference one **governance role**
- a **competency question** may reference one **scenario**
- a **scenario CQ effect** references exactly one **scenario**
- a **scenario CQ effect** references exactly one **competency question**

## 2b Reachability Rules

_A reachability rule is a transitive closure: relationships that hold not only
directly but through any chain of the same relationship. The asserted edges are
the single source of truth; the inferred edges are necessary consequences of them._

- **Precedes Step Closure** — one step precedence is reachable from another by the **precedes step** relationship
  when the second can be reached from the first by following one or more **precedes step** edges
  (from its from step to its to step), whether directly asserted or reached transitively.
  - An edge is **asserted** when it exists directly in the step precedence; it is **inferred**
    when no direct edge states it but it follows from a chain of asserted edges.
  - The **hop distance** of a reachable pair is the length of the shortest such chain
    (1 for a directly-asserted edge).
  - _Transitive closure of ntwf:precedesStep (an owl:TransitiveProperty). The 4 asserted edges (1→2, 2→3, 3→4, 4→5) imply the full 10-pair ordering closure — including the never-asserted step-1 → step-5. Materialized by the transpiler as the view vw_step_precedence_closure(from_id, to_id, hop_distance, is_inferred): 4 asserted (hop 1) + 6 inferred rows. This is the article's headline inference made to fire, not seeded._
- **Delegation Closure** — one role is reachable from another by the **delegation** relationship
  when the second can be reached from the first by following one or more **delegation** edges
  (from its source to its delegates to), whether directly asserted or reached transitively.
  - An edge is **asserted** when it exists directly in the roles; it is **inferred**
    when no direct edge states it but it follows from a chain of asserted edges.
  - The **hop distance** of a reachable pair is the length of the shortest such chain
    (1 for a directly-asserted edge).
  - _Transitive closure of ntwf:delegatesTo over the self-referential DelegatesTo FK. The asserted escalation edges (Release Manager → VP Engineering, VP Engineering → CTO) imply the never-asserted reachability Release Manager → CTO. Materialized as vw_roles_closure(from_id, to_id, hop_distance, is_inferred). This is the SQL equivalent of the SPARQL delegatesTo+ property path._
- **Derivation Closure** — one workflow artifact is reachable from another by the **derivation** relationship
  when the second can be reached from the first by following one or more **derivation** edges
  (from its source to its derived from artifact), whether directly asserted or reached transitively.
  - An edge is **asserted** when it exists directly in the workflow artifacts; it is **inferred**
    when no direct edge states it but it follows from a chain of asserted edges.
  - The **hop distance** of a reachable pair is the length of the shortest such chain
    (1 for a directly-asserted edge).
  - _Transitive closure of prov:wasDerivedFrom over the self-referential DerivedFromArtifact FK. The asserted single-step derivation edges (Legal Clearance was derived from Risk Report, Release Authorization from Legal Clearance, …) imply the never-asserted reachability (Post-Deployment Report transitively wasDerivedFrom Risk Report). Materialized as vw_workflow_artifacts_closure(from_id, to_id, hop_distance, is_inferred). This is the artifact-lineage analogue of vw_step_precedence_closure and vw_roles_closure — the SAME closure construct as step ordering and role escalation, just over a different relation, so a broken link surfaces as a missing reachability pair exactly like a dropped precedence edge._

## 3 Operative Rules

_Operative rules state what the business **obliges**, **prohibits**, or
advises (**should**). Structural rules come from required fields and foreign keys;
semantic rules come from the Constraints table, each keyed on a boolean the rulebook
already computes (cross-referenced as DR-N in the Definitional Rules below)._

### Structural Constraints (from the schema)

- A step precedence **must** reference exactly one workflow step as its from step.
- A step precedence **must** reference exactly one workflow step as its to step.
- A role assignment **must** reference exactly one role.
- A role assignment **must** have a valid from.
- A workflow status concept **must** have a pref label.
- An agent capability concept **must** have a pref label.
- An artifact type concept **must** have a pref label.
- A dataset **must** have a title.
- A workflow artifact **must** have a title.
- A scenario **must** have a label and an edits.
- A competency question **must** have a number, a display name, a question text, a target table, a target field, an answer kind, and an expected answer.
- A scenario CQ effect **must** reference exactly one scenario.
- A scenario CQ effect **must** reference exactly one competency question.
- A scenario CQ effect **must** have an effect kind.
- A conformance test **must** have a display name, a section, a test kind, and a sort order, and record whether it is enabled.

## 4 Definitional Rules

_All statements express truth in the business domain; they are neither
procedures nor imperatives. "iff" is avoided in favor of "only if" so a
one-directional necessity is not mistaken for an equivalence. A
**⚠︎ mechanical** chip marks a rule whose deterministic wording is faithful
but clunky — a flag for an optional downstream reword pass, not a defect._

| ID | Declarative rule |
|----|------------------|
| **DR-1 Relative Path** | A workflow's relative path is computed as “workflows/”, followed by the workflow ID. |
| **DR-2 Iri** | A workflow's iri is computed as the relative path with every a slash replaced by a hyphen. |
| **DR-3 Name** | A workflow's name is computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-4 Count of Non Proposed Steps** | A workflow's count of non proposed steps is the number of workflow steps related to the workflow. |
| **DR-5 Has More Than1 Step** | A workflow is considered to have a more than1 step if the count of non proposed steps is greater than 1. |
| **DR-6 Count AI Steps** | A workflow's count AI steps is the number of the workflow's workflow steps that are executed by AI. |
| **DR-7 Count Human Steps** | A workflow's count human steps is the number of the workflow's workflow steps that are executed by humans. |
| **DR-8 Count Human Required Steps** | A workflow's count human required steps is the number of the workflow's workflow steps that require a human approval. |
| **DR-9 Count Approval Consistency Violations** | A workflow's count approval consistency violations is the number of the workflow's workflow steps that are approval consistency violation. |
| **DR-10 Has Consistency Violation** | A workflow is considered to have a consistency violation if the count approval consistency violations is greater than 0. |
| **DR-11 Has AI Agent Step** | A workflow is considered to have an AI agent step if the count AI steps is greater than 0. |
| **DR-12 Months Since Modified** | A workflow's months since modified is computed as the number of months from the modified to the current date and time. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-13 Is Stale** | A workflow is considered a stale if the months since modified is greater than the staleness threshold months. |
| **DR-14 Is Stale and Has AI Agent** | A workflow is considered a stale and has AI agent if all of the following hold: the stale flag is set and the AI agent step flag is set. |
| **DR-15 Count Derivation Links** | A workflow's count derivation links is the number of the workflow's workflow artifacts that have a derivation parent. |
| **DR-16 Count Legal Owned Steps** | A workflow's count legal owned steps is the number of the workflow's workflow steps that are legal-owned. |
| **DR-17 Count Engineering Owned Steps** | A workflow's count engineering owned steps is the number of the workflow's workflow steps that are engineering-owned. |
| **DR-18 Involves Engineering and Legal** | A workflow is considered to involve an engineering and legal if all of the following hold: the count engineering owned steps is greater than 0 and the count legal owned steps is greater than 0. |
| **DR-19 Count Inferred Precedence Pairs** | A workflow's count inferred precedence pairs is the number of vw step precedence closure related to the workflow. |
| **DR-20 Count Asserted Precedence Pairs** | A workflow's count asserted precedence pairs is the number of vw step precedence closure related to the workflow. |
| **DR-21 Count of Precedence Closure Pairs** | A workflow's count of precedence closure pairs is computed as the count asserted precedence pairs plus the count inferred precedence pairs. |
| **DR-22 Count Roles With Bad Filler Cardinality** | A workflow's count roles with bad filler cardinality is the number of roles related to the workflow. |
| **DR-23 Count Agent Type Changes** | A workflow's count agent type changes is the number of role assignments related to the workflow. |
| **DR-24 Count Compliance Audit Changes** | A workflow's count compliance audit changes is the number of role assignments related to the workflow. |
| **DR-25 Count Approval Gate Steps** | A workflow's count approval gate steps is the number of the workflow's workflow steps that are approval gates. |
| **DR-26 Count Gates Without Human Approver** | A workflow's count gates without human approver is the number of approval gates related to the workflow. |
| **DR-27 Count Workflow Artifacts** | A workflow's count workflow artifacts is the number of workflow artifacts related to the workflow. |
| **DR-28 Count Roles With Escalation Violation** | A workflow's count roles with escalation violation is the number of roles related to the workflow. |
| **DR-29 Count Unconsumed Datasets** | A workflow's count unconsumed datasets is the number of datasets related to the workflow. |
| **DR-30 Cq1 Satisfied** | A workflow is flagged cq1 satisfied if the count of precedence closure pairs is the count of non proposed steps times the count of non proposed steps minus 1 divided by 2. |
| **DR-31 Cq2 Satisfied** | A workflow is flagged cq2 satisfied if all of the following hold: the count approval gate steps is greater than 0 and the count gates without human approver is 0. |
| **DR-32 Cq3 Satisfied** | A workflow is flagged cq3 satisfied if the consistency violation flag is not set. |
| **DR-33 Cq4 Satisfied** | A workflow is flagged cq4 satisfied if the count derivation links is the count workflow artifacts minus 1. |
| **DR-34 Cq5 Satisfied** | A workflow is flagged cq5 satisfied if the stale flag is not set. |
| **DR-35 Cq6 Satisfied** | A workflow is flagged cq6 satisfied if the count roles with escalation violation is 0. |
| **DR-36 Cq7 Satisfied** | A workflow is flagged cq7 satisfied only if the workflow is considered to involve an engineering and legal. |
| **DR-37 Cq8 Satisfied** | A workflow is flagged cq8 satisfied if the count unconsumed datasets is 0. |
| **DR-38 Parent Path** | A workflow step's parent path is the relative path of the workflow step's workflow. |
| **DR-39 Relative Path** | A workflow step's relative path is computed as the parent path, followed by “/steps/”, followed by the workflow step ID. |
| **DR-40 Iri** | A workflow step's iri is computed as the relative path with every a slash replaced by a hyphen. |
| **DR-41 Name** | A workflow step's name is computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-42 Preceding Step Count** | A workflow step's preceding step count is the number of vw step precedence closure related to the workflow step. |
| **DR-43 Inferred Sequence Position** | A workflow step's inferred sequence position is computed as the preceding step count plus 1. |
| **DR-44 Sequence Position** | The workflow step's sequence position is determined by the following priority:<br>1. the sequence position override, if the sequence position override has a value;<br>2. in all other cases, the inferred sequence position. |
| **DR-45 Executing Human Agent** | A workflow step's executing human agent is the filled by human agent of the workflow step's assigned role. |
| **DR-46 Executing AI Agent** | A workflow step's executing AI agent is the filled by AI agent of the workflow step's assigned role. |
| **DR-47 Executing Automated Pipeline** | A workflow step's executing automated pipeline is the filled by automated pipeline of the workflow step's assigned role. |
| **DR-48 Executing Agent Type** | The workflow step's executing agent type is determined by the following priority:<br>1. “HumanAgent”, if the executing human agent has a value;<br>2. “AIAgent”, if the executing AI agent has a value;<br>3. “AutomatedPipeline”, if the executing automated pipeline has a value;<br>4. in all other cases, an empty string. |
| **DR-49 Is Executed by AI** | A workflow step is considered an executed by AI if the executing AI agent has a value. |
| **DR-50 Is Executed by Human** | A workflow step is considered an executed by human if the executing human agent has a value. |
| **DR-51 Is Approval Gate** | A workflow step is considered an approval gate if the approval gate has a value. |
| **DR-52 Approval Consistency Violation** | A workflow step is flagged approval consistency violation if all of the following hold: the requires human approval flag is set and the executing human agent is blank. |
| **DR-53 Approval is Human Filled** | A workflow step is flagged approval is human filled if the executing human agent has a value, or else the requires human approval flag is not set. |
| **DR-54 Owning Department** | A workflow step's owning department is the owned by of the workflow step's assigned role. |
| **DR-55 Is Legal Owned** | A workflow step is considered legal-owned if the owning department is “ntwf-legal-dept”. |
| **DR-56 Is Engineering Owned** | A workflow step is considered engineering-owned if the owning department is “ntwf-engineering”. |
| **DR-57 Parent Path** | An approval gate's parent path is the relative path of the approval gate's workflow step. |
| **DR-58 Relative Path** | An approval gate's relative path is computed as the parent path, followed by “/approval-gates/”, followed by the approval gate ID. |
| **DR-59 Iri** | An approval gate's iri is computed as the relative path with every a slash replaced by a hyphen. |
| **DR-60 Name** | An approval gate's name is computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-61 Gate Role** | An approval gate's gate role is the assigned role of the approval gate's workflow step. |
| **DR-62 Gate Approver Human** | An approval gate's gate approver human is the filled by human agent of the approval gate's gate role. |
| **DR-63 Has Human Approver** | An approval gate is considered to have a human approver if the gate approver human has a value. |
| **DR-64 Parent Path** | A step precedence's parent path is the relative path of the step precedence's from step. |
| **DR-65 Relative Path** | A step precedence's relative path is computed as the parent path, followed by “/precedence/”, followed by the step precedence ID. |
| **DR-66 Iri** | A step precedence's iri is computed as the relative path with every a slash replaced by a hyphen. |
| **DR-67 Name** | A step precedence's name is computed as the from step, followed by “ -> ”, followed by the to step. |
| **DR-68 Relative Path** | A role's relative path is computed as “roles/”, followed by the role ID. |
| **DR-69 Iri** | A role's iri is computed as the relative path with every a slash replaced by a hyphen. |
| **DR-70 Name** | A role's name is computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-71 Filled by Arm Count** | A role's filled by arm count is computed as the count of the following that hold: the filled by human agent has a value; the filled by AI agent has a value; and the filled by automated pipeline has a value. |
| **DR-72 Has Exactly One Filler** | A role is considered to have an exactly one filler if the filled by arm count is 1. |
| **DR-73 Filler Type** | The role's filler type is determined by the following priority:<br>1. “HumanAgent”, if the filled by human agent has a value;<br>2. “AIAgent”, if the filled by AI agent has a value;<br>3. “AutomatedPipeline”, if the filled by automated pipeline has a value;<br>4. in all other cases, an empty string. |
| **DR-74 Fills Approval Gate** | A role's fills approval gate is the number of the role's workflow steps that are approval gates. |
| **DR-75 Escalation Violation** | A role is flagged escalation violation if all of the following hold: the fills approval gate is greater than 0 and the delegates to is blank. |
| **DR-76 Parent Path** | A role assignment's parent path is the relative path of the role assignment's role. |
| **DR-77 Relative Path** | A role assignment's relative path is computed as the parent path, followed by “/assignments/”, followed by the role assignment ID. |
| **DR-78 Iri** | A role assignment's iri is computed as the relative path with every a slash replaced by a hyphen. |
| **DR-79 Name** | A role assignment's name is computed as the role, followed by “ [”, followed by the valid from, followed by “ -> ”, followed by “open” if the valid to is blank, in all other cases the valid to, followed by “]”. |
| **DR-80 Filler Type** | The role assignment's filler type is determined by the following priority:<br>1. “HumanAgent”, if the filled by human agent has a value;<br>2. “AIAgent”, if the filled by AI agent has a value;<br>3. “AutomatedPipeline”, if the filled by automated pipeline has a value;<br>4. in all other cases, an empty string. |
| **DR-81 Is Current** | A role assignment is considered a current if the valid to is blank. |
| **DR-82 Was Active As of Audit Date** | A role assignment is considered to have been active as of audit date if all of the following hold: the valid from is at most “2026-03-01” and at least one of the following holds: the valid to is blank or the valid to is greater than “2026-03-01”. |
| **DR-83 Is Agent Type Change** | A role assignment is considered an agent type change if all of the following hold: the prior filler type has a value and the prior filler type is not the filler type. |
| **DR-84 Requires Compliance Audit** | A role assignment is considered to require a compliance audit if all of the following hold: the prior filler type has a value; the prior filler type is “AIAgent”; and the filler type is “HumanAgent”. |
| **DR-85 Relative Path** | A department's relative path is computed as “departments/”, followed by the department ID. |
| **DR-86 Iri** | A department's iri is computed as the relative path with every a slash replaced by a hyphen. |
| **DR-87 Name** | A department's name is computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-88 Relative Path** | A human agent's relative path is computed as “human-agents/”, followed by the human agent ID. |
| **DR-89 Iri** | A human agent's iri is computed as the relative path with every a slash replaced by a hyphen. |
| **DR-90 Relative Path** | An AI agent's relative path is computed as “ai-agents/”, followed by the AI agent ID. |
| **DR-91 Iri** | An AI agent's iri is computed as the relative path with every a slash replaced by a hyphen. |
| **DR-92 Count Attributed Artifacts** | An AI agent's count attributed artifacts is the number of workflow artifacts related to the AI agent. |
| **DR-93 Count Impacted Workflows** | An AI agent's count impacted workflows is the number of the AI agent's workflow artifacts that have a producing workflow. |
| **DR-94 Relative Path** | An automated pipeline's relative path is computed as “automated-pipelines/”, followed by the automated pipeline ID. |
| **DR-95 Iri** | An automated pipeline's iri is computed as the relative path with every a slash replaced by a hyphen. |
| **DR-96 Relative Path** | A workflow status concept's relative path is computed as “concepts/workflow-status/”, followed by the concept ID. |
| **DR-97 Iri** | A workflow status concept's iri is computed as the relative path with every a slash replaced by a hyphen. |
| **DR-98 Relative Path** | An agent capability concept's relative path is computed as “concepts/agent-capability/”, followed by the concept ID. |
| **DR-99 Iri** | An agent capability concept's iri is computed as the relative path with every a slash replaced by a hyphen. |
| **DR-100 Relative Path** | An artifact type concept's relative path is computed as “concepts/artifact-type/”, followed by the concept ID. |
| **DR-101 Iri** | An artifact type concept's iri is computed as the relative path with every a slash replaced by a hyphen. |
| **DR-102 Relative Path** | A dataset's relative path is computed as “datasets/”, followed by the dataset ID. |
| **DR-103 Iri** | A dataset's iri is computed as the relative path with every a slash replaced by a hyphen. |
| **DR-104 Is Consumed** | A dataset is considered consumed if the consumed by steps has a value. |
| **DR-105 Parent Path** | A workflow artifact's parent path is the relative path of the workflow artifact's produced by step. |
| **DR-106 Relative Path** | A workflow artifact's relative path is computed as the parent path, followed by “/artifacts/”, followed by the artifact ID. |
| **DR-107 Iri** | A workflow artifact's iri is computed as the relative path with every a slash replaced by a hyphen. |
| **DR-108 Producing Agent Type** | The workflow artifact's producing agent type is determined by the following priority:<br>1. “HumanAgent”, if the attributed to human agent has a value;<br>2. “AIAgent”, if the attributed to AI agent has a value;<br>3. “AutomatedPipeline”, if the attributed to automated pipeline has a value;<br>4. in all other cases, an empty string. |
| **DR-109 Has Derivation Parent** | A workflow artifact is considered to have a derivation parent if the derived from artifact has a value. |
| **DR-110 Produced by Workflow** | A workflow artifact's produced by workflow — taken from the linked produced by step. |
| **DR-111 Has Producing Workflow** | A workflow artifact is considered to have a producing workflow if the produced by workflow has a value. |
| **DR-112 Relative Path** | A governance role's relative path is computed as “governance-roles/”, followed by the governance role ID. |
| **DR-113 Iri** | A governance role's iri is computed as the relative path with every a slash replaced by a hyphen. |
| **DR-114 Name** | A governance role's name is computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-115 Can Approve Changes** | A governance role is considered able to approve changes if the kind is “Authority”. |
| **DR-116 Relative Path** | A change log's relative path is computed as “change-log/”, followed by the change log ID. |
| **DR-117 Iri** | A change log's iri is computed as the relative path with every a slash replaced by a hyphen. |
| **DR-118 Name** | A change log's name is computed as the version, followed by “ (”, followed by the change date, followed by “)”. |
| **DR-119 Is Breaking Change** | A change log is considered a breaking change if the change kind is “major”. |
| **DR-120 Is Backward Compatible** | A change log is considered backward-compatible if at least one of the following holds: the change kind is “patch” or the change kind is “minor”. |
| **DR-121 Relative Path** | A vocabulary reconciliation's relative path is computed as “reconciliations/”, followed by the reconciliation ID. |
| **DR-122 Iri** | A vocabulary reconciliation's iri is computed as the relative path with every a slash replaced by a hyphen. |
| **DR-123 Name** | A vocabulary reconciliation's name is computed as the deprecated term, followed by “ owl:sameAs ”, followed by the replacement term. |
| **DR-124 Relative Path** | A scenario's relative path is computed as “scenarios/”, followed by the scenario ID. |
| **DR-125 Iri** | A scenario's iri is computed as the relative path with every a slash replaced by a hyphen. |
| **DR-126 Name** | A scenario's name is computed as the lower-cased label with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-127 Relative Path** | A competency question's relative path is computed as “competency-questions/”, followed by the competency question ID. |
| **DR-128 Iri** | A competency question's iri is computed as the relative path with every a slash replaced by a hyphen. |
| **DR-129 Name** | A competency question's name is computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-130 Relative Path** | A scenario CQ effect's relative path is computed as “scenario-cq-effects/”, followed by the scenario CQ effect ID. |
| **DR-131 Iri** | A scenario CQ effect's iri is computed as the relative path with every a slash replaced by a hyphen. |
| **DR-132 Name** | A scenario CQ effect's name is computed as the lower-cased scenario CQ effect ID with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-133 Relative Path** | A conformance test's relative path is computed as “conformance-tests/”, followed by the conformance test ID. |
| **DR-134 Iri** | A conformance test's iri is computed as the relative path with every a slash replaced by a hyphen. |
| **DR-135 Name** | A conformance test's name is computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |

## 5 Traceability to Schema

_The expression column is the rule's definition in RuleSpeak® notation —
the same logic the rulebook stores, written for a business reader._

| Schema element | Kind | Expression |
|----------------|------|------------|
| **Workflows.RelativePath** | formula | `"workflows/" & WorkflowId` |
| **Workflows.Iri** | formula | `Replace(RelativePath, "/", "-")` |
| **Workflows.Name** | formula | `Replace(Lower(DisplayName), " ", "-")` |
| **Workflows.CountOfNonProposedSteps** | rollup | `Count(WorkflowSteps via Workflow)` |
| **Workflows.HasMoreThan1Step** | formula | `CountOfNonProposedSteps > 1` |
| **Workflows.CountAISteps** | rollup | `Count(WorkflowSteps via Workflow)` |
| **Workflows.CountHumanSteps** | rollup | `Count(WorkflowSteps via Workflow)` |
| **Workflows.CountHumanRequiredSteps** | rollup | `Count(WorkflowSteps via Workflow)` |
| **Workflows.CountApprovalConsistencyViolations** | rollup | `Count(WorkflowSteps via Workflow)` |
| **Workflows.HasConsistencyViolation** | formula | `CountApprovalConsistencyViolations > 0` |
| **Workflows.HasAIAgentStep** | formula | `CountAISteps > 0` |
| **Workflows.MonthsSinceModified** | formula | `DaysBetween(Now(), Modified)` |
| **Workflows.IsStale** | formula | `MonthsSinceModified > StalenessThresholdMonths` |
| **Workflows.IsStaleAndHasAIAgent** | formula | `And(IsStale, HasAIAgentStep)` |
| **Workflows.CountDerivationLinks** | rollup | `Count(WorkflowArtifacts via ProducedByWorkflow)` |
| **Workflows.CountLegalOwnedSteps** | rollup | `Count(WorkflowSteps via Workflow)` |
| **Workflows.CountEngineeringOwnedSteps** | rollup | `Count(WorkflowSteps via Workflow)` |
| **Workflows.InvolvesEngineeringAndLegal** | formula | `And(CountEngineeringOwnedSteps > 0, CountLegalOwnedSteps > 0)` |
| **Workflows.CountInferredPrecedencePairs** | rollup | `Count(vw_step_precedence_closure via IsInferred)` |
| **Workflows.CountAssertedPrecedencePairs** | rollup | `Count(vw_step_precedence_closure via IsInferred)` |
| **Workflows.CountOfPrecedenceClosurePairs** | formula | `CountAssertedPrecedencePairs + CountInferredPrecedencePairs` |
| **Workflows.CountRolesWithBadFillerCardinality** | rollup | `Count(Roles via HasExactlyOneFiller)` |
| **Workflows.CountAgentTypeChanges** | rollup | `Count(RoleAssignments via IsAgentTypeChange)` |
| **Workflows.CountComplianceAuditChanges** | rollup | `Count(RoleAssignments via RequiresComplianceAudit)` |
| **Workflows.CountApprovalGateSteps** | rollup | `Count(WorkflowSteps via Workflow)` |
| **Workflows.CountGatesWithoutHumanApprover** | rollup | `Count(ApprovalGates via HasHumanApprover)` |
| **Workflows.CountWorkflowArtifacts** | rollup | `Count(WorkflowArtifacts via ProducedByWorkflow)` |
| **Workflows.CountRolesWithEscalationViolation** | rollup | `Count(Roles via EscalationViolation)` |
| **Workflows.CountUnconsumedDatasets** | rollup | `Count(Datasets via IsConsumed)` |
| **Workflows.Cq1Satisfied** | formula | `CountOfPrecedenceClosurePairs = CountOfNonProposedSteps * CountOfNonProposedSteps - 1 / 2` |
| **Workflows.Cq2Satisfied** | formula | `And(CountApprovalGateSteps > 0, CountGatesWithoutHumanApprover = 0)` |
| **Workflows.Cq3Satisfied** | formula | `Not(HasConsistencyViolation)` |
| **Workflows.Cq4Satisfied** | formula | `CountDerivationLinks = CountWorkflowArtifacts - 1` |
| **Workflows.Cq5Satisfied** | formula | `Not(IsStale)` |
| **Workflows.Cq6Satisfied** | formula | `CountRolesWithEscalationViolation = 0` |
| **Workflows.Cq7Satisfied** | formula | `InvolvesEngineeringAndLegal` |
| **Workflows.Cq8Satisfied** | formula | `CountUnconsumedDatasets = 0` |
| **WorkflowSteps.ParentPath** | lookup | `Lookup(Workflows.RelativePath via Workflow)` |
| **WorkflowSteps.RelativePath** | formula | `ParentPath & "/steps/" & WorkflowStepId` |
| **WorkflowSteps.Iri** | formula | `Replace(RelativePath, "/", "-")` |
| **WorkflowSteps.Name** | formula | `Replace(Lower(DisplayName), " ", "-")` |
| **WorkflowSteps.PrecedingStepCount** | rollup | `Count(vw_step_precedence_closure via ToId)` |
| **WorkflowSteps.InferredSequencePosition** | formula | `PrecedingStepCount + 1` |
| **WorkflowSteps.SequencePosition** | formula | `If(SequencePositionOverride <> "", SequencePositionOverride, InferredSequencePosition)` |
| **WorkflowSteps.ExecutingHumanAgent** | lookup | `Lookup(Roles.FilledByHumanAgent via AssignedRole)` |
| **WorkflowSteps.ExecutingAIAgent** | lookup | `Lookup(Roles.FilledByAIAgent via AssignedRole)` |
| **WorkflowSteps.ExecutingAutomatedPipeline** | lookup | `Lookup(Roles.FilledByAutomatedPipeline via AssignedRole)` |
| **WorkflowSteps.ExecutingAgentType** | formula | `If(Not(Isblank(ExecutingHumanAgent)), "HumanAgent", If(Not(Isblank(ExecutingAIAgent)), "AIAgent", If(Not(Isblank(ExecutingAutomatedPipeline)), "AutomatedPipeline", "")))` |
| **WorkflowSteps.IsExecutedByAI** | formula | `Not(Isblank(ExecutingAIAgent))` |
| **WorkflowSteps.IsExecutedByHuman** | formula | `Not(Isblank(ExecutingHumanAgent))` |
| **WorkflowSteps.IsApprovalGate** | formula | `Not(Isblank(ApprovalGate))` |
| **WorkflowSteps.ApprovalConsistencyViolation** | formula | `And(RequiresHumanApproval, Isblank(ExecutingHumanAgent))` |
| **WorkflowSteps.ApprovalIsHumanFilled** | formula | `If(RequiresHumanApproval, Not(Isblank(ExecutingHumanAgent)), TRUE)` |
| **WorkflowSteps.OwningDepartment** | lookup | `Lookup(Roles.OwnedBy via AssignedRole)` |
| **WorkflowSteps.IsLegalOwned** | formula | `OwningDepartment = "ntwf-legal-dept"` |
| **WorkflowSteps.IsEngineeringOwned** | formula | `OwningDepartment = "ntwf-engineering"` |
| **ApprovalGates.ParentPath** | lookup | `Lookup(WorkflowSteps.RelativePath via WorkflowStep)` |
| **ApprovalGates.RelativePath** | formula | `ParentPath & "/approval-gates/" & ApprovalGateId` |
| **ApprovalGates.Iri** | formula | `Replace(RelativePath, "/", "-")` |
| **ApprovalGates.Name** | formula | `Replace(Lower(DisplayName), " ", "-")` |
| **ApprovalGates.GateRole** | lookup | `Lookup(WorkflowSteps.AssignedRole via WorkflowStep)` |
| **ApprovalGates.GateApproverHuman** | lookup | `Lookup(Roles.FilledByHumanAgent via GateRole)` |
| **ApprovalGates.HasHumanApprover** | formula | `Not(Isblank(GateApproverHuman))` |
| **StepPrecedence.ParentPath** | lookup | `Lookup(WorkflowSteps.RelativePath via FromStep)` |
| **StepPrecedence.RelativePath** | formula | `ParentPath & "/precedence/" & StepPrecedenceId` |
| **StepPrecedence.Iri** | formula | `Replace(RelativePath, "/", "-")` |
| **StepPrecedence.Name** | formula | `FromStep & " -> " & ToStep` |
| **Roles.RelativePath** | formula | `"roles/" & RoleId` |
| **Roles.Iri** | formula | `Replace(RelativePath, "/", "-")` |
| **Roles.Name** | formula | `Replace(Lower(DisplayName), " ", "-")` |
| **Roles.FilledByArmCount** | formula | `If(Not(Isblank(FilledByHumanAgent)), 1, 0) + If(Not(Isblank(FilledByAIAgent)), 1, 0) + If(Not(Isblank(FilledByAutomatedPipeline)), 1, 0)` |
| **Roles.HasExactlyOneFiller** | formula | `FilledByArmCount = 1` |
| **Roles.FillerType** | formula | `If(Not(Isblank(FilledByHumanAgent)), "HumanAgent", If(Not(Isblank(FilledByAIAgent)), "AIAgent", If(Not(Isblank(FilledByAutomatedPipeline)), "AutomatedPipeline", "")))` |
| **Roles.FillsApprovalGate** | rollup | `Count(WorkflowSteps via AssignedRole)` |
| **Roles.EscalationViolation** | formula | `And(FillsApprovalGate > 0, Isblank(DelegatesTo))` |
| **RoleAssignments.ParentPath** | lookup | `Lookup(Roles.RelativePath via Role)` |
| **RoleAssignments.RelativePath** | formula | `ParentPath & "/assignments/" & RoleAssignmentId` |
| **RoleAssignments.Iri** | formula | `Replace(RelativePath, "/", "-")` |
| **RoleAssignments.Name** | formula | `Role & " [" & ValidFrom & " -> " & If(Isblank(ValidTo), "open", ValidTo) & "]"` |
| **RoleAssignments.FillerType** | formula | `If(Not(Isblank(FilledByHumanAgent)), "HumanAgent", If(Not(Isblank(FilledByAIAgent)), "AIAgent", If(Not(Isblank(FilledByAutomatedPipeline)), "AutomatedPipeline", "")))` |
| **RoleAssignments.IsCurrent** | formula | `Isblank(ValidTo)` |
| **RoleAssignments.WasActiveAsOfAuditDate** | formula | `And(ValidFrom <= "2026-03-01", Or(Isblank(ValidTo), ValidTo > "2026-03-01"))` |
| **RoleAssignments.IsAgentTypeChange** | formula | `And(Not(Isblank(PriorFillerType)), PriorFillerType <> FillerType)` |
| **RoleAssignments.RequiresComplianceAudit** | formula | `And(Not(Isblank(PriorFillerType)), PriorFillerType = "AIAgent", FillerType = "HumanAgent")` |
| **Departments.RelativePath** | formula | `"departments/" & DepartmentId` |
| **Departments.Iri** | formula | `Replace(RelativePath, "/", "-")` |
| **Departments.Name** | formula | `Replace(Lower(DisplayName), " ", "-")` |
| **HumanAgents.RelativePath** | formula | `"human-agents/" & HumanAgentId` |
| **HumanAgents.Iri** | formula | `Replace(RelativePath, "/", "-")` |
| **AIAgents.RelativePath** | formula | `"ai-agents/" & AIAgentId` |
| **AIAgents.Iri** | formula | `Replace(RelativePath, "/", "-")` |
| **AIAgents.CountAttributedArtifacts** | rollup | `Count(WorkflowArtifacts via AttributedToAIAgent)` |
| **AIAgents.CountImpactedWorkflows** | rollup | `Count(WorkflowArtifacts via AttributedToAIAgent)` |
| **AutomatedPipelines.RelativePath** | formula | `"automated-pipelines/" & AutomatedPipelineId` |
| **AutomatedPipelines.Iri** | formula | `Replace(RelativePath, "/", "-")` |
| **WorkflowStatusConcepts.RelativePath** | formula | `"concepts/workflow-status/" & ConceptId` |
| **WorkflowStatusConcepts.Iri** | formula | `Replace(RelativePath, "/", "-")` |
| **AgentCapabilityConcepts.RelativePath** | formula | `"concepts/agent-capability/" & ConceptId` |
| **AgentCapabilityConcepts.Iri** | formula | `Replace(RelativePath, "/", "-")` |
| **ArtifactTypeConcepts.RelativePath** | formula | `"concepts/artifact-type/" & ConceptId` |
| **ArtifactTypeConcepts.Iri** | formula | `Replace(RelativePath, "/", "-")` |
| **Datasets.RelativePath** | formula | `"datasets/" & DatasetId` |
| **Datasets.Iri** | formula | `Replace(RelativePath, "/", "-")` |
| **Datasets.IsConsumed** | formula | `Not(Isblank(ConsumedBySteps))` |
| **WorkflowArtifacts.ParentPath** | lookup | `Lookup(WorkflowSteps.RelativePath via ProducedByStep)` |
| **WorkflowArtifacts.RelativePath** | formula | `ParentPath & "/artifacts/" & ArtifactId` |
| **WorkflowArtifacts.Iri** | formula | `Replace(RelativePath, "/", "-")` |
| **WorkflowArtifacts.ProducingAgentType** | formula | `If(Not(Isblank(AttributedToHumanAgent)), "HumanAgent", If(Not(Isblank(AttributedToAIAgent)), "AIAgent", If(Not(Isblank(AttributedToAutomatedPipeline)), "AutomatedPipeline", "")))` |
| **WorkflowArtifacts.HasDerivationParent** | formula | `Not(Isblank(DerivedFromArtifact))` |
| **WorkflowArtifacts.ProducedByWorkflow** | lookup | `Lookup(WorkflowSteps.Workflow via ProducedByStep)` |
| **WorkflowArtifacts.HasProducingWorkflow** | formula | `Not(Isblank(ProducedByWorkflow))` |
| **GovernanceRoles.RelativePath** | formula | `"governance-roles/" & GovernanceRoleId` |
| **GovernanceRoles.Iri** | formula | `Replace(RelativePath, "/", "-")` |
| **GovernanceRoles.Name** | formula | `Replace(Lower(DisplayName), " ", "-")` |
| **GovernanceRoles.CanApproveChanges** | formula | `Kind = "Authority"` |
| **ChangeLog.RelativePath** | formula | `"change-log/" & ChangeLogId` |
| **ChangeLog.Iri** | formula | `Replace(RelativePath, "/", "-")` |
| **ChangeLog.Name** | formula | `Version & " (" & ChangeDate & ")"` |
| **ChangeLog.IsBreakingChange** | formula | `ChangeKind = "major"` |
| **ChangeLog.IsBackwardCompatible** | formula | `Or(ChangeKind = "patch", ChangeKind = "minor")` |
| **VocabularyReconciliations.RelativePath** | formula | `"reconciliations/" & ReconciliationId` |
| **VocabularyReconciliations.Iri** | formula | `Replace(RelativePath, "/", "-")` |
| **VocabularyReconciliations.Name** | formula | `DeprecatedTerm & " owl:sameAs " & ReplacementTerm` |
| **Scenarios.RelativePath** | formula | `"scenarios/" & ScenarioId` |
| **Scenarios.Iri** | formula | `Replace(RelativePath, "/", "-")` |
| **Scenarios.Name** | formula | `Replace(Lower(Label), " ", "-")` |
| **CompetencyQuestions.RelativePath** | formula | `"competency-questions/" & CompetencyQuestionId` |
| **CompetencyQuestions.Iri** | formula | `Replace(RelativePath, "/", "-")` |
| **CompetencyQuestions.Name** | formula | `Replace(Lower(DisplayName), " ", "-")` |
| **ScenarioCQEffects.RelativePath** | formula | `"scenario-cq-effects/" & ScenarioCQEffectId` |
| **ScenarioCQEffects.Iri** | formula | `Replace(RelativePath, "/", "-")` |
| **ScenarioCQEffects.Name** | formula | `Replace(Lower(ScenarioCQEffectId), " ", "-")` |
| **ConformanceTests.RelativePath** | formula | `"conformance-tests/" & ConformanceTestId` |
| **ConformanceTests.Iri** | formula | `Replace(RelativePath, "/", "-")` |
| **ConformanceTests.Name** | formula | `Replace(Lower(DisplayName), " ", "-")` |

---

_This document is rendered in **RuleSpeak®**, the declarative business-rule
notation created by **Ronald G. Ross**, and follows the conventions of
**SBVR** (Semantics of Business Vocabulary and Business Rules). With thanks to
Ronald G. Ross for RuleSpeak® and his foundational work on business rules —
[www.RonRoss.info](https://www.RonRoss.info)._
