# JTO - v3 Rulebook Specification

## Overview
The JTO - v3 rulebook provides a structured approach to managing workflows, workflow steps, roles, and human agents within an operational context. It defines how to compute various calculated fields based on raw input data, facilitating the tracking and management of workflows and their associated components.

## Workflows Entity

### Input Fields
1. **WorkflowId**
   - **Type:** string
   - **Description:** Unique identifier for the workflow.

2. **Title**
   - **Type:** string
   - **Description:** Human-readable name for the workflow.

3. **Description**
   - **Type:** string
   - **Description:** Detailed description of the workflow's purpose and scope.

4. **Created**
   - **Type:** datetime
   - **Description:** Date the workflow was created.

5. **Modified**
   - **Type:** datetime
   - **Description:** Date the workflow was last modified.

6. **Identifier**
   - **Type:** string
   - **Description:** External reference identifier (e.g., ticket number).

7. **WorkflowSteps**
   - **Type:** string
   - **Description:** Steps contained in this workflow.

### Calculated Field
#### CountOfWorkflowSteps
- **Description:** This field counts the number of steps associated with the workflow.
- **Calculation Explanation:** To compute the count of workflow steps, you will count the number of entries in the `WorkflowSteps` field that match the current `WorkflowId`. This is done using a conditional count function that checks if the `IsStepOf` field in the `WorkflowSteps` table matches the `WorkflowId` of the current workflow.
- **Formula:** `=COUNTIFS(WorkflowSteps!{{IsStepOf}}, Workflows!{{WorkflowId}})`
- **Example:** For the workflow with `WorkflowId` "production-deployment-workflow", it has three steps: "legal-review", "risk-assessment", and "release-approval". Thus, `CountOfWorkflowSteps` would be 3.

## WorkflowSteps Entity

### Input Fields
1. **WorkflowStepId**
   - **Type:** string
   - **Description:** Unique identifier for the workflow step.

2. **Label**
   - **Type:** string
   - **Description:** Human-readable name for the step.

3. **SequencePosition**
   - **Type:** integer
   - **Description:** Ordinal position in the workflow sequence.

4. **RequiresHumanApproval**
   - **Type:** boolean
   - **Description:** Indicates if this step requires human approval.

5. **IsStepOf**
   - **Type:** string
   - **Description:** Parent workflow containing this step.

6. **AssignedRole**
   - **Type:** string
   - **Description:** Role responsible for this step.

### Calculated Fields
#### IsStepOfTitle
- **Description:** This field provides a denormalized lookup of the parent workflow's title.
- **Calculation Explanation:** The title is retrieved by matching the `IsStepOf` field (which contains the `WorkflowId`) with the `WorkflowId` in the Workflows table and returning the corresponding `Title`.
- **Formula:** `=INDEX(Workflows!{{Title}}, MATCH(WorkflowSteps!{{IsStepOf}}, Workflows!{{WorkflowId}}, 0))`
- **Example:** For the step with `IsStepOf` "production-deployment-workflow", the `IsStepOfTitle` would return "Production Deployment Workflow".

#### IsStepOfDescription
- **Description:** This field provides a denormalized lookup of the parent workflow's description.
- **Calculation Explanation:** Similar to `IsStepOfTitle`, this field retrieves the description by matching the `IsStepOf` field with the `WorkflowId` in the Workflows table.
- **Formula:** `=INDEX(Workflows!{{Description}}, MATCH(WorkflowSteps!{{IsStepOf}}, Workflows!{{WorkflowId}}, 0))`
- **Example:** For the step with `IsStepOf` "production-deployment-workflow", the `IsStepOfDescription` would return "End-to-end workflow for deploying software releases to production, including risk analysis, legal clearance, and release approval."

#### IsStepOfIdentifier
- **Description:** This field provides a denormalized lookup of the parent workflow's external identifier.
- **Calculation Explanation:** This is computed by matching the `IsStepOf` field with the `WorkflowId` in the Workflows table and returning the corresponding `Identifier`.
- **Formula:** `=INDEX(Workflows!{{Identifier}}, MATCH(WorkflowSteps!{{IsStepOf}}, Workflows!{{WorkflowId}}, 0))`
- **Example:** For the step with `IsStepOf` "production-deployment-workflow", the `IsStepOfIdentifier` would return "WF-PROD-001".

#### AssignedRoleLabel
- **Description:** This field provides a denormalized lookup of the label for the assigned role.
- **Calculation Explanation:** The label is retrieved by matching the `AssignedRole` field with the `RoleId` in the Roles table and returning the corresponding `Label`.
- **Formula:** `=INDEX(Roles!{{Label}}, MATCH(WorkflowSteps!{{AssignedRole}}, Roles!{{RoleId}}, 0))`
- **Example:** For the step with `AssignedRole` "risk-analyst", the `AssignedRoleLabel` would return "Risk Analyst".

#### AssignedRoleComment
- **Description:** This field provides a denormalized lookup of the comment/description for the assigned role.
- **Calculation Explanation:** Similar to `AssignedRoleLabel`, this field retrieves the comment by matching the `AssignedRole` field with the `RoleId` in the Roles table.
- **Formula:** `=INDEX(Roles!{{Comment}}, MATCH(WorkflowSteps!{{AssignedRole}}, Roles!{{RoleId}}, 0))`
- **Example:** For the step with `AssignedRole` "risk-analyst", the `AssignedRoleComment` would return "Role responsible for risk assessment. In full ontology, filled by AI agent."

#### AssignedRoleFilledBy
- **Description:** This field provides a denormalized lookup of the agent currently filling the assigned role.
- **Calculation Explanation:** This is computed by matching the `AssignedRole` field with the `RoleId` in the Roles table and returning the corresponding `FilledBy`.
- **Formula:** `=INDEX(Roles!{{FilledBy}}, MATCH(WorkflowSteps!{{AssignedRole}}, Roles!{{RoleId}}, 0))`
- **Example:** For the step with `AssignedRole` "release-manager", the `AssignedRoleFilledBy` would return "maria-gonzalez".

## Roles Entity

### Input Fields
1. **RoleId**
   - **Type:** string
   - **Description:** Unique identifier for the role.

2. **Label**
   - **Type:** string
   - **Description:** Human-readable name for the role.

3. **Comment**
   - **Type:** string
   - **Description:** Description of the role's responsibilities.

4. **FilledBy**
   - **Type:** string
   - **Description:** Agent currently filling this role.

5. **WorkflowSteps**
   - **Type:** string
   - **Description:** Steps assigned to this role.

### Calculated Field
#### CountOfWorkflowSteps
- **Description:** This field counts the number of workflow steps assigned to this role.
- **Calculation Explanation:** To compute this count, you will count the number of entries in the `WorkflowSteps` table where the `AssignedRole` matches the current `RoleId`.
- **Formula:** `=COUNTIFS(WorkflowSteps!{{AssignedRole}}, Roles!{{RoleId}})`
- **Example:** For the role with `RoleId` "release-manager", it is assigned to one step: "release-approval". Thus, `CountOfWorkflowSteps` would be 1.

## HumanAgents Entity

### Input Fields
1. **HumanAgentId**
   - **Type:** string
   - **Description:** Unique identifier for the human agent.

2. **Name**
   - **Type:** string
   - **Description:** Full name of the person.

3. **Mbox**
   - **Type:** string
   - **Description:** Email address of the person.

4. **Roles**
   - **Type:** string
   - **Description:** Roles filled by this agent.

### Calculated Field
#### CountOfRoles
- **Description:** This field counts the number of roles currently filled by this agent.
- **Calculation Explanation:** To compute this count, you will count the number of entries in the `Roles` table where the `FilledBy` matches the current `HumanAgentId`.
- **Formula:** `=COUNTIFS(Roles!{{FilledBy}}, HumanAgents!{{HumanAgentId}})`
- **Example:** For the agent with `HumanAgentId` "maria-gonzalez", she fills one role: "release-manager". Thus, `CountOfRoles` would be 1.

This specification document provides a detailed guide for computing the calculated fields based on the raw input fields defined in the JTO - v3 rulebook. By following these instructions, one can accurately derive the necessary values without needing to reference the original formulas directly.