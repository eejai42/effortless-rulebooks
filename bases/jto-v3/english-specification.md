# Specification Document for Jessica's Ontology Series-v3 Rulebook

## Overview
This rulebook defines the structure and calculations for workflows, workflow steps, roles, and human agents within the context of "Jessica's Ontology Series-v3." It provides a schema for managing workflows, detailing the relationships between workflows, their steps, the roles involved, and the human agents filling those roles. This document outlines how to compute calculated fields based on raw input data.

## Workflows

### Input Fields
1. **WorkflowId**
   - **Type:** String
   - **Description:** Unique identifier for the workflow.

2. **Title**
   - **Type:** String
   - **Description:** Human-readable name for the workflow.

3. **Description**
   - **Type:** String
   - **Description:** Detailed description of the workflow's purpose and scope.

4. **Created**
   - **Type:** Datetime
   - **Description:** Date the workflow was created.

5. **Modified**
   - **Type:** Datetime
   - **Description:** Date the workflow was last modified.

6. **Identifier**
   - **Type:** String
   - **Description:** External reference identifier (e.g., ticket number).

7. **WorkflowSteps**
   - **Type:** String
   - **Description:** Steps contained in this workflow.

### Calculated Field
- **CountOfWorkflowSteps**
  - **Description:** This field counts the number of steps associated with the workflow.
  - **Computation Explanation:** To compute the count of workflow steps, count all entries in the `WorkflowSteps` table where the `IsStepOf` field matches the `WorkflowId` of the current workflow.
  - **Formula:** `=COUNTIFS(WorkflowSteps!{{IsStepOf}}, Workflows!{{WorkflowId}})`
  - **Example:** For the workflow with `WorkflowId` "production-deployment-workflow," there are three steps ("legal-review," "risk-assessment," "release-approval"). Thus, `CountOfWorkflowSteps` would be 3.

## Workflow Steps

### Input Fields
1. **WorkflowStepId**
   - **Type:** String
   - **Description:** Unique identifier for the workflow step.

2. **Label**
   - **Type:** String
   - **Description:** Human-readable name for the step.

3. **SequencePosition**
   - **Type:** Integer
   - **Description:** Ordinal position in the workflow sequence.

4. **RequiresHumanApproval**
   - **Type:** Boolean
   - **Description:** Indicates if this step requires human approval.

5. **IsStepOf**
   - **Type:** String
   - **Description:** Parent workflow containing this step.

6. **AssignedRole**
   - **Type:** String
   - **Description:** Role responsible for this step.

### Calculated Fields
- **IsStepOfTitle**
  - **Description:** Denormalized lookup of the parent workflow's title.
  - **Computation Explanation:** Find the title of the workflow that corresponds to the `IsStepOf` field by matching it with the `WorkflowId` in the Workflows table.
  - **Formula:** `=INDEX(Workflows!{{Title}}, MATCH(WorkflowSteps!{{IsStepOf}}, Workflows!{{WorkflowId}}, 0))`
  - **Example:** For the step with `IsStepOf` "production-deployment-workflow," the title would be "Production Deployment Workflow."

- **IsStepOfDescription**
  - **Description:** Denormalized lookup of the parent workflow's description.
  - **Computation Explanation:** Similar to `IsStepOfTitle`, but retrieves the description instead.
  - **Formula:** `=INDEX(Workflows!{{Description}}, MATCH(WorkflowSteps!{{IsStepOf}}, Workflows!{{WorkflowId}}, 0))`
  - **Example:** The description for the step with `IsStepOf` "production-deployment-workflow" would be "End-to-end workflow for deploying software releases to production, including risk analysis, legal clearance, and release approval."

- **IsStepOfIdentifier**
  - **Description:** Denormalized lookup of the parent workflow's external identifier.
  - **Computation Explanation:** Retrieve the identifier of the workflow that corresponds to the `IsStepOf` field.
  - **Formula:** `=INDEX(Workflows!{{Identifier}}, MATCH(WorkflowSteps!{{IsStepOf}}, Workflows!{{WorkflowId}}, 0))`
  - **Example:** For the step with `IsStepOf` "production-deployment-workflow," the identifier would be "WF-PROD-001."

- **AssignedRoleLabel**
  - **Description:** Denormalized lookup of the assigned role's label.
  - **Computation Explanation:** Find the label of the role by matching the `AssignedRole` field with the `RoleId` in the Roles table.
  - **Formula:** `=INDEX(Roles!{{Label}}, MATCH(WorkflowSteps!{{AssignedRole}}, Roles!{{RoleId}}, 0))`
  - **Example:** For the step with `AssignedRole` "risk-analyst," the label would be "Risk Analyst."

- **AssignedRoleComment**
  - **Description:** Denormalized lookup of the assigned role's comment/description.
  - **Computation Explanation:** Similar to `AssignedRoleLabel`, but retrieves the comment instead.
  - **Formula:** `=INDEX(Roles!{{Comment}}, MATCH(WorkflowSteps!{{AssignedRole}}, Roles!{{RoleId}}, 0))`
  - **Example:** For the step with `AssignedRole` "risk-analyst," the comment would be "Role responsible for risk assessment. In full ontology, filled by AI agent."

- **AssignedRoleFilledBy**
  - **Description:** Denormalized lookup of the agent currently filling the assigned role.
  - **Computation Explanation:** Retrieve the agent's ID filling the role by matching the `AssignedRole` with the `RoleId` in the Roles table.
  - **Formula:** `=INDEX(Roles!{{FilledBy}}, MATCH(WorkflowSteps!{{AssignedRole}}, Roles!{{RoleId}}, 0))`
  - **Example:** For the step with `AssignedRole` "release-manager," the filled by agent would be "maria-gonzalez."

## Roles

### Input Fields
1. **RoleId**
   - **Type:** String
   - **Description:** Unique identifier for the role.

2. **Label**
   - **Type:** String
   - **Description:** Human-readable name for the role.

3. **Comment**
   - **Type:** String
   - **Description:** Description of the role's responsibilities.

4. **FilledBy**
   - **Type:** String
   - **Description:** Agent currently filling this role.

### Calculated Fields
- **CountOfWorkflowSteps**
  - **Description:** Count of workflow steps assigned to this role.
  - **Computation Explanation:** Count all entries in the `WorkflowSteps` table where the `AssignedRole` matches the `RoleId` of the current role.
  - **Formula:** `=COUNTIFS(WorkflowSteps!{{AssignedRole}}, Roles!{{RoleId}})`
  - **Example:** For the role "release-manager," there is one step ("release-approval"), so `CountOfWorkflowSteps` would be 1.

## Human Agents

### Input Fields
1. **HumanAgentId**
   - **Type:** String
   - **Description:** Unique identifier for the human agent.

2. **Name**
   - **Type:** String
   - **Description:** Full name of the person.

3. **Mbox**
   - **Type:** String
   - **Description:** Email address of the person.

### Calculated Fields
- **CountOfRoles**
  - **Description:** Count of roles currently filled by this agent.
  - **Computation Explanation:** Count all entries in the `Roles` table where the `FilledBy` matches the `HumanAgentId` of the current agent.
  - **Formula:** `=COUNTIFS(Roles!{{FilledBy}}, HumanAgents!{{HumanAgentId}})`
  - **Example:** For "Maria Gonzalez," who fills the "release-manager" role, `CountOfRoles` would be 1.

This specification provides a comprehensive guide to computing calculated fields within the "Jessica's Ontology Series-v3" rulebook, ensuring accurate data management and reporting.