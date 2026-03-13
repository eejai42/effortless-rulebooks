# Effortless Rulebook

### Generated from:

> This builds ssotme tools including those that are disabled which regenerates this file.

```
$ cd ./docs
$ ssotme -build -id
```


> Rulebook generated from Airtable base 'Jessica Talisman - BASIC Ontology Parts 1-3'.

**Model ID:** ``

---

## Formal Arguments

The following logical argument establishes that "language" can be formalized as a computable classification, and demonstrates that not everything qualifies as a language under this definition.


## Execution Substrates

The following formats have been evaluated as execution substrates for this rulebook.

See the `execution-substrates/` directory for available format implementations.

---

## Table Schemas

### Table: Workflows

> Table: Workflows

#### Schema

| Field | Type | Data Type | Nullable | Description |
|-------|------|-----------|----------|-------------|
| `WorkflowId` | raw | string | No | - |
| `Name` | calculated | string | Yes | Short machine-friendly name for the workflow. Used for programmatic reference and URL slug generation. |
| `DisplayName` | raw | string | Yes | - |
| `Title` | raw | string | Yes | Human-readable title of the workflow. Maps to dct:title from Dublin Core. Example: 'Production Deployment Workflow', 'Employee Onboarding'. |
| `Color` | raw | string | Yes | - |
| `Description` | raw | string | Yes | Detailed description of the workflow's purpose and scope. Maps to dct:description from Dublin Core. Should explain what business goal the workflow achieves. |
| `Identifier` | raw | string | Yes | External system identifier for cross-referencing. Maps to dct:identifier from Dublin Core. This is the join key back to document management systems, ticket systems, or other operational systems. |
| `Modified` | raw | datetime | Yes | Last modification timestamp. Maps to dct:modified from Dublin Core. Critical for answering CQ5: 'Which workflows haven't been reviewed or updated in twelve months?' |
| `WorkflowSteps` | relationship | string | Yes | Reference to workflow steps. Represents the ntwf:hasStep relationship linking workflows to their constituent steps. |
| `CountOfNonProposedSteps` | aggregation | integer | Yes | Calculated count of workflow steps in this workflow. Useful for workflow complexity analysis and reporting. |
| `HasMoreThan1Step` | calculated | boolean | Yes | - |

**Formula for `Name`:**
```
=SUBSTITUTE(LOWER({{DisplayName}}), " ", "-")
```

**Formula for `CountOfNonProposedSteps`:**
```
=COUNTIFS(WorkflowSteps!{{Workflow}}, Workflows!{{WorkflowId}})
```

**Formula for `HasMoreThan1Step`:**
```
={{CountOfNonProposedSteps}} > 1
```


#### Sample Data (15 records)

| Field | Value |
|-------|-------|
| `WorkflowId` | performance-review |
| `Name` | performance-review |
| `Title` | Annual Performance Review |
| `Description` | Structured workflow for conducting annual employee performance evaluations. |
| `Identifier` | WF-PRV-007 |
| `Modified` | 2024-05-15 |
| `WorkflowSteps` | system-notification-sent, step-2, recwwXHLqxKPhj6Mt |
| `CountOfNonProposedSteps` | 3 |
| `DisplayName` | Performance Review |
| `HasMoreThan1Step` | true |
| `Color` | red |

---

### Table: WorkflowSteps

> Table: WorkflowSteps

#### Schema

| Field | Type | Data Type | Nullable | Description |
|-------|------|-----------|----------|-------------|
| `WorkflowStepId` | raw | string | No | - |
| `Name` | calculated | string | Yes | - |
| `DisplayName` | raw | string | Yes | - |
| `Workflow` | relationship | string | Yes | Foreign key to the parent workflow. Represents the inverse of ntwf:hasStep, enabling navigation from step to its containing workflow (ntwf:isStepOf). |
| `SequencePosition` | raw | integer | Yes | Integer ordinal position of the step within its workflow. Maps to ntwf:sequencePosition, declared as owl:FunctionalProperty (each step has exactly one position). Enables positional queries. |
| `AssignedRole` | relationship | string | Yes | Foreign key to the Role responsible for executing this step. Maps to ntwf:assignedRole. Critical for implementing Heuristic 2 (role-agent separation): steps point to roles, not directly to agents. |
| `RequiresHumanApproval` | raw | boolean | Yes | Boolean flag indicating whether a human agent must fill the assigned role. Maps to ntwf:requiresHumanApproval. Enables answering CQ3: 'Which steps require human decisions vs. AI execution?' |
| `ApprovalGate` | relationship | string | Yes | Foreign key to ApprovalGate if this step is a decision checkpoint. When populated, indicates this step blocks workflow execution until explicit authorization is given. |
| `PrecededBySteps` | relationship | string | Yes | Reference to steps that must complete before this step can execute. Part of the ntwf:precedesStep transitive ordering relationship. |

**Formula for `Name`:**
```
=SUBSTITUTE(LOWER({{DisplayName}}), " ", "-")
```


#### Sample Data (20 records)

| Field | Value |
|-------|-------|
| `WorkflowStepId` | submit-request |
| `Name` | submit-request |
| `Workflow` | onboarding |
| `SequencePosition` | 1 |
| `AssignedRole` | administrator |
| `RequiresHumanApproval` | true |
| `ApprovalGate` | initial-review |
| `PrecededBySteps` | step-1 |
| `DisplayName` | Submit Request |

---

### Table: ApprovalGates

> Table: ApprovalGates

#### Schema

| Field | Type | Data Type | Nullable | Description |
|-------|------|-----------|----------|-------------|
| `ApprovalGateId` | raw | string | No | - |
| `Name` | calculated | string | Yes | - |
| `DisplayName` | raw | string | Yes | - |
| `WorkflowSteps` | relationship | string | Yes | Back-reference to workflow steps that use this approval gate. Enables finding all steps requiring this specific gate. |
| `EscalationThresholdHours` | raw | integer | Yes | Integer number of hours that may elapse on a pending gate before the ntwf:delegatesTo chain activates. Maps to ntwf:escalationThresholdHours. Domain applies only to ApprovalGate individuals. |

**Formula for `Name`:**
```
=SUBSTITUTE(LOWER({{DisplayName}}), " ", "-")
```


#### Sample Data (11 records)

| Field | Value |
|-------|-------|
| `ApprovalGateId` | initial-review |
| `Name` | initial-review |
| `WorkflowSteps` | submit-request |
| `EscalationThresholdHours` | 0 |
| `DisplayName` | Initial Review |

---

### Table: PrecedesSteps

> Table: PrecedesSteps

#### Schema

| Field | Type | Data Type | Nullable | Description |
|-------|------|-----------|----------|-------------|
| `PrecedesStepId` | raw | string | No | - |
| `Name` | raw | string | Yes | Ordinal sequence number for the relationship. Used for sorting and display. |
| `WorkflowStep` | relationship | string | Yes | Foreign key to the step that comes BEFORE. The source of the 'precedes' relationship. |
| `DisplayName` | calculated | string | Yes | - |
| `StepNumber` | raw | integer | Yes | - |

**Formula for `DisplayName`:**
```
="Step-" & {{StepNumber}}
```


#### Sample Data (16 records)

| Field | Value |
|-------|-------|
| `PrecedesStepId` | step-1 |
| `Name` | step-1 |
| `WorkflowStep` | submit-request |
| `StepNumber` | 1 |
| `DisplayName` | Step-1 |

---

### Table: Roles

> Table: Roles

#### Schema

| Field | Type | Data Type | Nullable | Description |
|-------|------|-----------|----------|-------------|
| `RoleId` | raw | string | No | - |
| `Name` | calculated | string | Yes | - |
| `DisplayName` | raw | string | Yes | - |
| `Label` | raw | string | Yes | Human-readable display name. Maps to rdfs:label. Per Heuristic 6: if you cannot write a clear label, you do not yet understand the concept well enough to model it. |
| `Comment` | raw | string | Yes | Detailed description of the role's responsibilities and scope. Maps to rdfs:comment. Should define what the role covers, what it excludes, and how it differs from adjacent roles. |
| `FilledByHumanAgent` | relationship | string | Yes | - |
| `FilledByAIAgent` | relationship | string | Yes | - |
| `FilledByAutomatedPipeline` | relationship | string | Yes | - |
| `OwnedBy` | relationship | string | Yes | Foreign key to the Department that owns this role. Maps to ntwf:ownedBy (owl:FunctionalProperty). Enables answering CQ7: 'Which workflows involve both Engineering and Legal?' |
| `DelegatesTo` | relationship | string | Yes | Foreign key to the fallback Role in an escalation chain. Maps to ntwf:delegatesTo. Enables answering CQ6: 'What happens when the VP of Engineering is unavailable?' |
| `WorkflowSteps` | relationship | string | Yes | Back-reference to workflow steps assigned to this role. Inverse of WorkflowSteps.AssignedRole. |
| `FromDelegatesTo` | relationship | string | Yes | - |

**Formula for `Name`:**
```
=LOWER({{DisplayName}})
```


#### Sample Data (15 records)

| Field | Value |
|-------|-------|
| `RoleId` | administrator |
| `Name` | administrator |
| `Label` | Admin |
| `Comment` | Has full access to all system features and settings. |
| `FilledByHumanAgent` | agent-001 |
| `FilledByAIAgent` | ava |
| `FilledByAutomatedPipeline` | lead-notification-pipeline |
| `OwnedBy` | human-resources |
| `WorkflowSteps` | submit-request |
| `FromDelegatesTo` | editor |
| `DisplayName` | Administrator |
| `DelegatesTo` |  |

---

### Table: Departments

> Table: Departments

#### Schema

| Field | Type | Data Type | Nullable | Description |
|-------|------|-----------|----------|-------------|
| `DepartmentId` | raw | string | No | - |
| `Name` | calculated | string | Yes | Human-readable display name of the department. Should match organizational terminology for stakeholder communication. |
| `Title` | raw | string | Yes | Human-readable display name of the department. Should match organizational terminology for stakeholder communication. |
| `DisplayName` | raw | string | Yes | Machine-friendly name for programmatic reference. |
| `Roles` | relationship | string | Yes | Back-reference to roles owned by this department. Inverse of Roles.OwnedBy. |

**Formula for `Name`:**
```
=SUBSTITUTE(LOWER({{DisplayName}}), " ", "-")
```


#### Sample Data (15 records)

| Field | Value |
|-------|-------|
| `DepartmentId` | human-resources |
| `Name` | human-resources |
| `Roles` | administrator |
| `DisplayName` | Human Resources |
| `Title` | HR Department |

---

### Table: HumanAgents

> Table: HumanAgents

#### Schema

| Field | Type | Data Type | Nullable | Description |
|-------|------|-----------|----------|-------------|
| `HumanAgentId` | raw | string | No | - |
| `Name` | raw | string | Yes | Full name of the person. Maps to foaf:name. Note: FOAF's name property is appropriate for persons, not for software systems (which use schema:name). |
| `DisplayName` | raw | string | Yes | - |
| `Mbox` | raw | string | Yes | Email address of the person. Maps to foaf:mbox. Used for notifications and organizational directory integration. |
| `Roles` | relationship | string | Yes | Back-reference to roles currently filled by this agent. Inverse of Roles.FilledBy_HumanAgent. |


#### Sample Data (15 records)

| Field | Value |
|-------|-------|
| `HumanAgentId` | agent-001 |
| `Name` | agent_001 |
| `DisplayName` | Alice Johnson |
| `Mbox` | alice.johnson@example.com |
| `Roles` | administrator |

---

### Table: AIAgents

> Table: AIAgents

#### Schema

| Field | Type | Data Type | Nullable | Description |
|-------|------|-----------|----------|-------------|
| `AIAgentId` | raw | string | No | - |
| `Name` | raw | string | Yes | Display name of the AI agent. Maps to schema:name (not foaf:name, which is for persons). |
| `Title` | raw | string | Yes | - |
| `DisplayName` | raw | string | Yes | - |
| `ModelVersion` | raw | string | Yes | Version string of the AI model. Maps to ntwf:modelVersion. Makes AI-produced artifacts auditable at the version level. The domain declaration means this property applies only to AIAgent individuals. |
| `Roles` | relationship | string | Yes | Back-reference to roles currently filled by this AI agent. Inverse of Roles.FilledBy_AIAgent. |


#### Sample Data (15 records)

| Field | Value |
|-------|-------|
| `AIAgentId` | ava |
| `Name` | Ava |
| `DisplayName` | Ava |
| `ModelVersion` | GPT-4.0 |
| `Roles` | administrator |
| `Title` | CustomerSupportBot |

---

### Table: AutomatedPipelines

> Table: AutomatedPipelines

#### Schema

| Field | Type | Data Type | Nullable | Description |
|-------|------|-----------|----------|-------------|
| `AutomatedPipelineId` | raw | string | No | - |
| `Name` | raw | string | Yes | Display name of the pipeline. Maps to schema:name (appropriate for software systems, unlike foaf:name which is for persons). |
| `Description` | raw | string | Yes | - |
| `DisplayName` | raw | string | Yes | - |
| `Roles` | relationship | string | Yes | Back-reference to roles currently filled by this pipeline. Inverse of Roles.FilledBy_AutomatedPipeline. |


#### Sample Data (15 records)

| Field | Value |
|-------|-------|
| `AutomatedPipelineId` | lead-notification-pipeline |
| `Name` | lead-notification-pipeline |
| `DisplayName` | Lead Notification Pipeline |
| `Roles` | administrator |
| `Description` | Salesforce to Slack Lead Alert |

---


## Metadata

**Summary:** Airtable export with schema-first type mapping: Schemas, Data, Relationships (FK links), Lookups (INDEX/MATCH), Aggregations (SUMIFS/COUNTIFS/Rollups), and Calculated fields (formulas) in Excel dialect. Field types are determined from Airtable's schema metadata FIRST (no coercion), with intelligent fallback to formula/data analysis only when schema is unavailable.

### Conversion Details

| Property | Value |
|----------|-------|
| Source Base ID | `applThn0rikpCR9C3` |
| Table Count | 9 |
| Tool Version | 2.0.0 |
| Export Mode | schema_first_type_mapping |
| Field Type Mapping | checkbox→boolean, number→number/integer, multipleRecordLinks→relationship, multipleLookupValues→lookup, rollup→aggregation, count→aggregation, formula→calculated |

### Type Inference

- **Enabled:** true
- **Priority:** airtable_metadata (NO COERCION) → formula_analysis → reference_resolution → data_analysis (fallback only)
- **Airtable Type Mapping:** checkbox→boolean, singleLineText→string, multilineText→string, number→number/integer, datetime→datetime, singleSelect→string, email→string, url→string, phoneNumber→string
- **Data Coercion Hierarchy:** Only used as fallback when Airtable schema unavailable: datetime → number → integer → boolean → base64 → json → string
- **Nullable Support:** true
- **Error Value Handling:** #NUM!, #ERROR!, #N/A, #REF!, #DIV/0!, #VALUE!, #NAME? are treated as NULL

---

*Generated from effortless-rulebook.json*

