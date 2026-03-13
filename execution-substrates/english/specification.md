# Specification Document for Jessica Talisman - BASIC Ontology Parts 1-3

## Overview
This rulebook provides a structured framework for managing workflows, workflow steps, approval gates, roles, and departments within an organization. It includes calculated fields that derive meaningful insights from raw data, enabling efficient workflow management and reporting. 

## Workflows

### Input Fields
1. **WorkflowId**
   - **Type:** String
   - **Description:** Unique identifier for the workflow.

2. **DisplayName**
   - **Type:** String
   - **Description:** Human-readable name for the workflow.

3. **WorkflowSteps**
   - **Type:** String
   - **Description:** Reference to the steps that make up the workflow.

### Calculated Fields
1. **Name**
   - **Description:** This field generates a machine-friendly name for the workflow, which is used for programmatic reference and URL slug generation.
   - **Computation:** Convert the `DisplayName` to lowercase and replace spaces with hyphens.
   - **Formula:** `=SUBSTITUTE(LOWER({{DisplayName}}), " ", "-")`
   - **Example:** If `DisplayName` is "Performance Review", then `Name` will be "performance-review".

2. **CountOfNonProposedSteps**
   - **Description:** This field counts the number of steps associated with the workflow, which helps in analyzing workflow complexity.
   - **Computation:** Count the number of entries in `WorkflowSteps` that match the current `WorkflowId`.
   - **Formula:** `=COUNTIFS(WorkflowSteps!{{Workflow}}, Workflows!{{WorkflowId}})`
   - **Example:** If the `WorkflowSteps` for "performance-review" contains three steps, then `CountOfNonProposedSteps` will be 3.

3. **HasMoreThan1Step**
   - **Description:** This boolean field indicates whether the workflow has more than one step.
   - **Computation:** Check if `CountOfNonProposedSteps` is greater than 1.
   - **Formula:** `={{CountOfNonProposedSteps}} > 1`
   - **Example:** If `CountOfNonProposedSteps` is 3, then `HasMoreThan1Step` will be `true`.

## WorkflowSteps

### Input Fields
1. **WorkflowStepId**
   - **Type:** String
   - **Description:** Unique identifier for the workflow step.

2. **DisplayName**
   - **Type:** String
   - **Description:** Human-readable name for the workflow step.

3. **Workflow**
   - **Type:** String
   - **Description:** Foreign key to the parent workflow.

### Calculated Fields
1. **Name**
   - **Description:** This field generates a machine-friendly name for the workflow step.
   - **Computation:** Convert the `DisplayName` to lowercase and replace spaces with hyphens.
   - **Formula:** `=SUBSTITUTE(LOWER({{DisplayName}}), " ", "-")`
   - **Example:** If `DisplayName` is "Submit Request", then `Name` will be "submit-request".

## ApprovalGates

### Input Fields
1. **ApprovalGateId**
   - **Type:** String
   - **Description:** Unique identifier for the approval gate.

2. **DisplayName**
   - **Type:** String
   - **Description:** Human-readable name for the approval gate.

### Calculated Fields
1. **Name**
   - **Description:** This field generates a machine-friendly name for the approval gate.
   - **Computation:** Convert the `DisplayName` to lowercase and replace spaces with hyphens.
   - **Formula:** `=SUBSTITUTE(LOWER({{DisplayName}}), " ", "-")`
   - **Example:** If `DisplayName` is "Manager Approval", then `Name` will be "manager-approval".

## Roles

### Input Fields
1. **RoleId**
   - **Type:** String
   - **Description:** Unique identifier for the role.

2. **DisplayName**
   - **Type:** String
   - **Description:** Human-readable name for the role.

### Calculated Fields
1. **Name**
   - **Description:** This field generates a lowercase name for the role.
   - **Computation:** Convert the `DisplayName` to lowercase.
   - **Formula:** `=LOWER({{DisplayName}})`
   - **Example:** If `DisplayName` is "Admin", then `Name` will be "admin".

## Departments

### Input Fields
1. **DepartmentId**
   - **Type:** String
   - **Description:** Unique identifier for the department.

2. **DisplayName**
   - **Type:** String
   - **Description:** Human-readable name for the department.

### Calculated Fields
1. **Name**
   - **Description:** This field generates a machine-friendly name for the department.
   - **Computation:** Convert the `DisplayName` to lowercase and replace spaces with hyphens.
   - **Formula:** `=SUBSTITUTE(LOWER({{DisplayName}}), " ", "-")`
   - **Example:** If `DisplayName` is "Human Resources", then `Name` will be "human-resources".

This specification document outlines the necessary calculations for derived fields within the "Jessica Talisman - BASIC Ontology Parts 1-3" rulebook, providing a clear guide for implementation.