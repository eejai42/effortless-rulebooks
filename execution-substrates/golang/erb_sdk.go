// ERB SDK - Go Implementation (GENERATED - DO NOT EDIT)
// ======================================================
// Generated from: effortless-rulebook/effortless-rulebook.json
//
// This file contains structs and calculation functions
// for all tables defined in the rulebook.

package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strconv"
)

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

// boolVal safely dereferences a *bool, returning false if nil
func boolVal(b *bool) bool {
	if b == nil {
		return false
	}
	return *b
}

// stringVal safely dereferences a *string, returning "" if nil
func stringVal(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

// nilIfEmpty returns nil for empty strings, otherwise a pointer to the string
func nilIfEmpty(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

// intToString safely converts a *int to string, returning "" if nil
func intToString(i *int) string {
	if i == nil {
		return ""
	}
	return strconv.Itoa(*i)
}

// boolToString converts a bool to "true" or "false"
func boolToString(b bool) string {
	if b {
		return "true"
	}
	return "false"
}

// FlexibleString is a type that can unmarshal from both string and number JSON values
// This is needed for aggregation fields that return 0 (int) when empty or string values
type FlexibleString string

func (f *FlexibleString) UnmarshalJSON(data []byte) error {
	// First try as string
	var s string
	if err := json.Unmarshal(data, &s); err == nil {
		*f = FlexibleString(s)
		return nil
	}
	// Try as number
	var n float64
	if err := json.Unmarshal(data, &n); err == nil {
		// Convert number to string, but treat 0 as empty
		if n == 0 {
			*f = FlexibleString("0")
		} else {
			*f = FlexibleString(fmt.Sprintf("%v", n))
		}
		return nil
	}
	return fmt.Errorf("cannot unmarshal %s into FlexibleString", string(data))
}

// String returns the underlying string value
func (f FlexibleString) String() string {
	return string(f)
}

// =============================================================================
// WORKFLOWS TABLE
// Table: Workflows
// =============================================================================

// Workflow represents a row in the Workflows table
// Table: Workflows
type Workflow struct {
	WorkflowId string `json:"workflow_id"`
	Title *string `json:"title"` // Human-readable name for the workflow. Maps to dct:title per Dublin Core.
	Description *string `json:"description"` // Detailed description of the workflow purpose and scope. Maps to dct:description per Dublin Core.
	Created *string `json:"created"` // Date the workflow was created. Maps to dct:created per Dublin Core.
	Modified *string `json:"modified"` // Date the workflow was last modified. Maps to dct:modified. Used to identify stale workflows per NTWF CQ5.
	Identifier *string `json:"identifier"` // External reference identifier (e.g., ticket number). Maps to dct:identifier. Join key to operational systems.
	WorkflowSteps *string `json:"workflow_steps"` // Steps contained in this workflow. Inverse of IsStepOf. Maps to ntwf:hasStep.
	CountOfWorkflowSteps *int `json:"count_of_workflow_steps"` // Count of steps in this workflow. Aggregation over IsStepOf relationship.
}

// =============================================================================
// WORKFLOWSTEPS TABLE
// Table: WorkflowSteps
// =============================================================================

// WorkflowStep represents a row in the WorkflowSteps table
// Table: WorkflowSteps
type WorkflowStep struct {
	WorkflowStepId string `json:"workflow_step_id"`
	Label *string `json:"label"` // Human-readable name for the step. Maps to rdfs:label.
	SequencePosition *int `json:"sequence_position"` // Ordinal position in workflow sequence. Maps to ntwf:sequencePosition (functional). Supports positional ordering queries.
	RequiresHumanApproval *bool `json:"requires_human_approval"` // Whether this step requires a human agent. Maps to ntwf:requiresHumanApproval. Answers NTWF CQ3.
	IsStepOf *string `json:"is_step_of"` // Parent workflow containing this step. Inverse of WorkflowSteps. Maps to ntwf:isStepOf.
	AssignedRole *string `json:"assigned_role"` // Role responsible for this step. Maps to ntwf:assignedRole (functional). Implements role-agent separation.
	IsStepOfTitle *string `json:"is_step_of_title"` // Denormalized lookup of parent workflow title.
	IsStepOfDescription *string `json:"is_step_of_description"` // Denormalized lookup of parent workflow description.
	IsStepOfIdentifier *string `json:"is_step_of_identifier"` // Denormalized lookup of parent workflow external identifier.
	AssignedRoleLabel *string `json:"assigned_role_label"` // Denormalized lookup of assigned role label.
	AssignedRoleComment *string `json:"assigned_role_comment"` // Denormalized lookup of assigned role comment/description.
	AssignedRoleFilledBy *string `json:"assigned_role_filled_by"` // Denormalized lookup of agent currently filling the assigned role.
}

// =============================================================================
// ROLES TABLE
// Table: Roles
// =============================================================================

// Role represents a row in the Roles table
// Table: Roles
type Role struct {
	RoleId string `json:"role_id"`
	Label *string `json:"label"` // Human-readable name for the role. Maps to rdfs:label.
	Comment *string `json:"comment"` // Description of the role's responsibilities. Maps to rdfs:comment.
	FilledBy *string `json:"filled_by"` // Agent currently filling this role. Maps to ntwf:filledBy. The change-management triple - update this when personnel change.
	WorkflowSteps *string `json:"workflow_steps"` // Steps assigned to this role. Inverse of AssignedRole.
	CountOfWorkflowSteps *int `json:"count_of_workflow_steps"` // Count of workflow steps assigned to this role.
	FilledByName *string `json:"filled_by_name"` // Denormalized lookup of agent name (foaf:name) filling this role.
	FilledByMBox *string `json:"filled_by_m_box"` // Denormalized lookup of agent email (foaf:mbox) filling this role.
	DelegatesTo *string `json:"delegates_to"` // Role to escalate to when this role's agent is unavailable. Maps to ntwf:delegatesTo. Enables delegation chain queries.
}

// =============================================================================
// HUMANAGENTS TABLE
// Table: HumanAgents
// =============================================================================

// HumanAgent represents a row in the HumanAgents table
// Table: HumanAgents
type HumanAgent struct {
	HumanAgentId string `json:"human_agent_id"`
	Name *string `json:"name"` // Full name of the person. Maps to foaf:name per FOAF ontology.
	Mbox *string `json:"mbox"` // Email address of the person. Maps to foaf:mbox per FOAF ontology. Used for contact and identity resolution.
	Roles *string `json:"roles"` // Roles filled by this agent. Inverse of FilledBy.
	CountOfRoles *int `json:"count_of_roles"` // Count of roles currently filled by this agent.
}
