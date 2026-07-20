-- ============================================================================
-- 99-fk-constraints.sql — FK CONSTRAINTS (off by default)
-- ============================================================================
-- Demos must never fail on FK violations, so init-db.sh SKIPS this file
-- unless EFFORTLESS_ENFORCE_FKS=true is set in the environment.
--
--   EFFORTLESS_ENFORCE_FKS=true bash init-db.sh    # apply constraints
--   bash init-db.sh                                # leave them documented but unenforced
--
-- The rulebook always documents the FK relationships, and 01-drop-and-create-tables.sql
-- always installs the supporting indexes inline. This file just declares the actual
-- enforcement. Idempotent: every constraint is dropped if present, then added.
-- ============================================================================

-- Agents
ALTER TABLE agents DROP CONSTRAINT IF EXISTS fk_agents_organization;
ALTER TABLE agents ADD CONSTRAINT fk_agents_organization
  FOREIGN KEY (organization) REFERENCES organizations (organization_id);

-- Roles
ALTER TABLE roles DROP CONSTRAINT IF EXISTS fk_roles_organization;
ALTER TABLE roles ADD CONSTRAINT fk_roles_organization
  FOREIGN KEY (organization) REFERENCES organizations (organization_id);
ALTER TABLE roles DROP CONSTRAINT IF EXISTS fk_roles_current_agent;
ALTER TABLE roles ADD CONSTRAINT fk_roles_current_agent
  FOREIGN KEY (current_agent) REFERENCES agents (agent_id);
ALTER TABLE roles DROP CONSTRAINT IF EXISTS fk_roles_current_assignment;
ALTER TABLE roles ADD CONSTRAINT fk_roles_current_assignment
  FOREIGN KEY (current_assignment) REFERENCES role_assignments (role_assignment_id);

-- RoleAssignments
ALTER TABLE role_assignments DROP CONSTRAINT IF EXISTS fk_role_assignments_role;
ALTER TABLE role_assignments ADD CONSTRAINT fk_role_assignments_role
  FOREIGN KEY (role) REFERENCES roles (role_id);
ALTER TABLE role_assignments DROP CONSTRAINT IF EXISTS fk_role_assignments_agent;
ALTER TABLE role_assignments ADD CONSTRAINT fk_role_assignments_agent
  FOREIGN KEY (agent) REFERENCES agents (agent_id);
ALTER TABLE role_assignments DROP CONSTRAINT IF EXISTS fk_role_assignments_evaluation_context;
ALTER TABLE role_assignments ADD CONSTRAINT fk_role_assignments_evaluation_context
  FOREIGN KEY (evaluation_context) REFERENCES evaluation_contexts (evaluation_context_id);
ALTER TABLE role_assignments DROP CONSTRAINT IF EXISTS fk_role_assignments_supersedes_assignment;
ALTER TABLE role_assignments ADD CONSTRAINT fk_role_assignments_supersedes_assignment
  FOREIGN KEY (supersedes_assignment) REFERENCES role_assignments (role_assignment_id);
ALTER TABLE role_assignments DROP CONSTRAINT IF EXISTS fk_role_assignments_approving_authority_role;
ALTER TABLE role_assignments ADD CONSTRAINT fk_role_assignments_approving_authority_role
  FOREIGN KEY (approving_authority_role) REFERENCES roles (role_id);
ALTER TABLE role_assignments DROP CONSTRAINT IF EXISTS fk_role_assignments_authorizing_change_request;
ALTER TABLE role_assignments ADD CONSTRAINT fk_role_assignments_authorizing_change_request
  FOREIGN KEY (authorizing_change_request) REFERENCES change_requests (change_request_id);

-- CommunitiesOfPractice
ALTER TABLE communities_of_practice DROP CONSTRAINT IF EXISTS fk_communities_of_practice_organization;
ALTER TABLE communities_of_practice ADD CONSTRAINT fk_communities_of_practice_organization
  FOREIGN KEY (organization) REFERENCES organizations (organization_id);
ALTER TABLE communities_of_practice DROP CONSTRAINT IF EXISTS fk_communities_of_practice_steward_role;
ALTER TABLE communities_of_practice ADD CONSTRAINT fk_communities_of_practice_steward_role
  FOREIGN KEY (steward_role) REFERENCES roles (role_id);

-- Mentorships
ALTER TABLE mentorships DROP CONSTRAINT IF EXISTS fk_mentorships_community_of_practice;
ALTER TABLE mentorships ADD CONSTRAINT fk_mentorships_community_of_practice
  FOREIGN KEY (community_of_practice) REFERENCES communities_of_practice (community_of_practice_id);
ALTER TABLE mentorships DROP CONSTRAINT IF EXISTS fk_mentorships_mentor_agent;
ALTER TABLE mentorships ADD CONSTRAINT fk_mentorships_mentor_agent
  FOREIGN KEY (mentor_agent) REFERENCES agents (agent_id);
ALTER TABLE mentorships DROP CONSTRAINT IF EXISTS fk_mentorships_learner_agent;
ALTER TABLE mentorships ADD CONSTRAINT fk_mentorships_learner_agent
  FOREIGN KEY (learner_agent) REFERENCES agents (agent_id);

-- Procedures
ALTER TABLE procedures DROP CONSTRAINT IF EXISTS fk_procedures_procedure_type;
ALTER TABLE procedures ADD CONSTRAINT fk_procedures_procedure_type
  FOREIGN KEY (procedure_type) REFERENCES procedure_types (procedure_type_id);
ALTER TABLE procedures DROP CONSTRAINT IF EXISTS fk_procedures_owner_organization;
ALTER TABLE procedures ADD CONSTRAINT fk_procedures_owner_organization
  FOREIGN KEY (owner_organization) REFERENCES organizations (organization_id);
ALTER TABLE procedures DROP CONSTRAINT IF EXISTS fk_procedures_adopted_by_organization;
ALTER TABLE procedures ADD CONSTRAINT fk_procedures_adopted_by_organization
  FOREIGN KEY (adopted_by_organization) REFERENCES organizations (organization_id);
ALTER TABLE procedures DROP CONSTRAINT IF EXISTS fk_procedures_current_version_key;
ALTER TABLE procedures ADD CONSTRAINT fk_procedures_current_version_key
  FOREIGN KEY (current_version_key) REFERENCES procedure_versions (procedure_version_id);

-- ProcedureVersions
ALTER TABLE procedure_versions DROP CONSTRAINT IF EXISTS fk_procedure_versions_procedure;
ALTER TABLE procedure_versions ADD CONSTRAINT fk_procedure_versions_procedure
  FOREIGN KEY (procedure) REFERENCES procedures (procedure_id);
ALTER TABLE procedure_versions DROP CONSTRAINT IF EXISTS fk_procedure_versions_created_by_agent;
ALTER TABLE procedure_versions ADD CONSTRAINT fk_procedure_versions_created_by_agent
  FOREIGN KEY (created_by_agent) REFERENCES agents (agent_id);
ALTER TABLE procedure_versions DROP CONSTRAINT IF EXISTS fk_procedure_versions_modified_by_agent;
ALTER TABLE procedure_versions ADD CONSTRAINT fk_procedure_versions_modified_by_agent
  FOREIGN KEY (modified_by_agent) REFERENCES agents (agent_id);
ALTER TABLE procedure_versions DROP CONSTRAINT IF EXISTS fk_procedure_versions_evaluation_context;
ALTER TABLE procedure_versions ADD CONSTRAINT fk_procedure_versions_evaluation_context
  FOREIGN KEY (evaluation_context) REFERENCES evaluation_contexts (evaluation_context_id);

-- ProcedureVersionLinks
ALTER TABLE procedure_version_links DROP CONSTRAINT IF EXISTS fk_procedure_version_links_previous_procedure_version;
ALTER TABLE procedure_version_links ADD CONSTRAINT fk_procedure_version_links_previous_procedure_version
  FOREIGN KEY (previous_procedure_version) REFERENCES procedure_versions (procedure_version_id);
ALTER TABLE procedure_version_links DROP CONSTRAINT IF EXISTS fk_procedure_version_links_next_procedure_version;
ALTER TABLE procedure_version_links ADD CONSTRAINT fk_procedure_version_links_next_procedure_version
  FOREIGN KEY (next_procedure_version) REFERENCES procedure_versions (procedure_version_id);

-- ProcedureStatusChanges
ALTER TABLE procedure_status_changes DROP CONSTRAINT IF EXISTS fk_procedure_status_changes_procedure_version;
ALTER TABLE procedure_status_changes ADD CONSTRAINT fk_procedure_status_changes_procedure_version
  FOREIGN KEY (procedure_version) REFERENCES procedure_versions (procedure_version_id);
ALTER TABLE procedure_status_changes DROP CONSTRAINT IF EXISTS fk_procedure_status_changes_changed_by_agent;
ALTER TABLE procedure_status_changes ADD CONSTRAINT fk_procedure_status_changes_changed_by_agent
  FOREIGN KEY (changed_by_agent) REFERENCES agents (agent_id);

-- Steps
ALTER TABLE steps DROP CONSTRAINT IF EXISTS fk_steps_procedure_version;
ALTER TABLE steps ADD CONSTRAINT fk_steps_procedure_version
  FOREIGN KEY (procedure_version) REFERENCES procedure_versions (procedure_version_id);
ALTER TABLE steps DROP CONSTRAINT IF EXISTS fk_steps_assigned_role;
ALTER TABLE steps ADD CONSTRAINT fk_steps_assigned_role
  FOREIGN KEY (assigned_role) REFERENCES roles (role_id);

-- StepTransitions
ALTER TABLE step_transitions DROP CONSTRAINT IF EXISTS fk_step_transitions_procedure_version;
ALTER TABLE step_transitions ADD CONSTRAINT fk_step_transitions_procedure_version
  FOREIGN KEY (procedure_version) REFERENCES procedure_versions (procedure_version_id);
ALTER TABLE step_transitions DROP CONSTRAINT IF EXISTS fk_step_transitions_from_step;
ALTER TABLE step_transitions ADD CONSTRAINT fk_step_transitions_from_step
  FOREIGN KEY (from_step) REFERENCES steps (step_id);
ALTER TABLE step_transitions DROP CONSTRAINT IF EXISTS fk_step_transitions_to_step;
ALTER TABLE step_transitions ADD CONSTRAINT fk_step_transitions_to_step
  FOREIGN KEY (to_step) REFERENCES steps (step_id);

-- StepActions
ALTER TABLE step_actions DROP CONSTRAINT IF EXISTS fk_step_actions_step;
ALTER TABLE step_actions ADD CONSTRAINT fk_step_actions_step
  FOREIGN KEY (step) REFERENCES steps (step_id);
ALTER TABLE step_actions DROP CONSTRAINT IF EXISTS fk_step_actions_action;
ALTER TABLE step_actions ADD CONSTRAINT fk_step_actions_action
  FOREIGN KEY ("action") REFERENCES actions (action_id);

-- StepFunctions
ALTER TABLE step_functions DROP CONSTRAINT IF EXISTS fk_step_functions_step;
ALTER TABLE step_functions ADD CONSTRAINT fk_step_functions_step
  FOREIGN KEY (step) REFERENCES steps (step_id);
ALTER TABLE step_functions DROP CONSTRAINT IF EXISTS fk_step_functions_function;
ALTER TABLE step_functions ADD CONSTRAINT fk_step_functions_function
  FOREIGN KEY (function) REFERENCES functions (function_id);

-- StepTools
ALTER TABLE step_tools DROP CONSTRAINT IF EXISTS fk_step_tools_step;
ALTER TABLE step_tools ADD CONSTRAINT fk_step_tools_step
  FOREIGN KEY (step) REFERENCES steps (step_id);
ALTER TABLE step_tools DROP CONSTRAINT IF EXISTS fk_step_tools_tool;
ALTER TABLE step_tools ADD CONSTRAINT fk_step_tools_tool
  FOREIGN KEY (tool) REFERENCES tools (tool_id);

-- Requirements
ALTER TABLE requirements DROP CONSTRAINT IF EXISTS fk_requirements_witness_field_name;
ALTER TABLE requirements ADD CONSTRAINT fk_requirements_witness_field_name
  FOREIGN KEY (witness_field_name) REFERENCES rulebook_fields (rulebook_field_id);
ALTER TABLE requirements DROP CONSTRAINT IF EXISTS fk_requirements_accountable_role;
ALTER TABLE requirements ADD CONSTRAINT fk_requirements_accountable_role
  FOREIGN KEY (accountable_role) REFERENCES roles (role_id);

-- StepRequirements
ALTER TABLE step_requirements DROP CONSTRAINT IF EXISTS fk_step_requirements_step;
ALTER TABLE step_requirements ADD CONSTRAINT fk_step_requirements_step
  FOREIGN KEY (step) REFERENCES steps (step_id);
ALTER TABLE step_requirements DROP CONSTRAINT IF EXISTS fk_step_requirements_requirement;
ALTER TABLE step_requirements ADD CONSTRAINT fk_step_requirements_requirement
  FOREIGN KEY (requirement) REFERENCES requirements (requirement_id);

-- StepVerifications
ALTER TABLE step_verifications DROP CONSTRAINT IF EXISTS fk_step_verifications_step;
ALTER TABLE step_verifications ADD CONSTRAINT fk_step_verifications_step
  FOREIGN KEY (step) REFERENCES steps (step_id);

-- Rationales
ALTER TABLE rationales DROP CONSTRAINT IF EXISTS fk_rationales_procedure_version;
ALTER TABLE rationales ADD CONSTRAINT fk_rationales_procedure_version
  FOREIGN KEY (procedure_version) REFERENCES procedure_versions (procedure_version_id);
ALTER TABLE rationales DROP CONSTRAINT IF EXISTS fk_rationales_step;
ALTER TABLE rationales ADD CONSTRAINT fk_rationales_step
  FOREIGN KEY (step) REFERENCES steps (step_id);
ALTER TABLE rationales DROP CONSTRAINT IF EXISTS fk_rationales_authority_role;
ALTER TABLE rationales ADD CONSTRAINT fk_rationales_authority_role
  FOREIGN KEY (authority_role) REFERENCES roles (role_id);

-- Exceptions
ALTER TABLE exceptions DROP CONSTRAINT IF EXISTS fk_exceptions_procedure_version;
ALTER TABLE exceptions ADD CONSTRAINT fk_exceptions_procedure_version
  FOREIGN KEY (procedure_version) REFERENCES procedure_versions (procedure_version_id);
ALTER TABLE exceptions DROP CONSTRAINT IF EXISTS fk_exceptions_trigger_step;
ALTER TABLE exceptions ADD CONSTRAINT fk_exceptions_trigger_step
  FOREIGN KEY (trigger_step) REFERENCES steps (step_id);
ALTER TABLE exceptions DROP CONSTRAINT IF EXISTS fk_exceptions_approval_role;
ALTER TABLE exceptions ADD CONSTRAINT fk_exceptions_approval_role
  FOREIGN KEY (approval_role) REFERENCES roles (role_id);
ALTER TABLE exceptions DROP CONSTRAINT IF EXISTS fk_exceptions_fallback_role;
ALTER TABLE exceptions ADD CONSTRAINT fk_exceptions_fallback_role
  FOREIGN KEY (fallback_role) REFERENCES roles (role_id);

-- ProcedureResources
ALTER TABLE procedure_resources DROP CONSTRAINT IF EXISTS fk_procedure_resources_procedure_version;
ALTER TABLE procedure_resources ADD CONSTRAINT fk_procedure_resources_procedure_version
  FOREIGN KEY (procedure_version) REFERENCES procedure_versions (procedure_version_id);
ALTER TABLE procedure_resources DROP CONSTRAINT IF EXISTS fk_procedure_resources_resource;
ALTER TABLE procedure_resources ADD CONSTRAINT fk_procedure_resources_resource
  FOREIGN KEY (resource) REFERENCES resources (resource_id);

-- ElicitationSessions
ALTER TABLE elicitation_sessions DROP CONSTRAINT IF EXISTS fk_elicitation_sessions_procedure_version;
ALTER TABLE elicitation_sessions ADD CONSTRAINT fk_elicitation_sessions_procedure_version
  FOREIGN KEY (procedure_version) REFERENCES procedure_versions (procedure_version_id);
ALTER TABLE elicitation_sessions DROP CONSTRAINT IF EXISTS fk_elicitation_sessions_practitioner_agent;
ALTER TABLE elicitation_sessions ADD CONSTRAINT fk_elicitation_sessions_practitioner_agent
  FOREIGN KEY (practitioner_agent) REFERENCES agents (agent_id);
ALTER TABLE elicitation_sessions DROP CONSTRAINT IF EXISTS fk_elicitation_sessions_facilitator_agent;
ALTER TABLE elicitation_sessions ADD CONSTRAINT fk_elicitation_sessions_facilitator_agent
  FOREIGN KEY (facilitator_agent) REFERENCES agents (agent_id);
ALTER TABLE elicitation_sessions DROP CONSTRAINT IF EXISTS fk_elicitation_sessions_evaluation_context;
ALTER TABLE elicitation_sessions ADD CONSTRAINT fk_elicitation_sessions_evaluation_context
  FOREIGN KEY (evaluation_context) REFERENCES evaluation_contexts (evaluation_context_id);

-- KnowledgeFragments
ALTER TABLE knowledge_fragments DROP CONSTRAINT IF EXISTS fk_knowledge_fragments_procedure_version;
ALTER TABLE knowledge_fragments ADD CONSTRAINT fk_knowledge_fragments_procedure_version
  FOREIGN KEY (procedure_version) REFERENCES procedure_versions (procedure_version_id);
ALTER TABLE knowledge_fragments DROP CONSTRAINT IF EXISTS fk_knowledge_fragments_step;
ALTER TABLE knowledge_fragments ADD CONSTRAINT fk_knowledge_fragments_step
  FOREIGN KEY (step) REFERENCES steps (step_id);
ALTER TABLE knowledge_fragments DROP CONSTRAINT IF EXISTS fk_knowledge_fragments_elicitation_session;
ALTER TABLE knowledge_fragments ADD CONSTRAINT fk_knowledge_fragments_elicitation_session
  FOREIGN KEY (elicitation_session) REFERENCES elicitation_sessions (elicitation_session_id);
ALTER TABLE knowledge_fragments DROP CONSTRAINT IF EXISTS fk_knowledge_fragments_source_agent;
ALTER TABLE knowledge_fragments ADD CONSTRAINT fk_knowledge_fragments_source_agent
  FOREIGN KEY (source_agent) REFERENCES agents (agent_id);
ALTER TABLE knowledge_fragments DROP CONSTRAINT IF EXISTS fk_knowledge_fragments_owner_role;
ALTER TABLE knowledge_fragments ADD CONSTRAINT fk_knowledge_fragments_owner_role
  FOREIGN KEY (owner_role) REFERENCES roles (role_id);
ALTER TABLE knowledge_fragments DROP CONSTRAINT IF EXISTS fk_knowledge_fragments_evaluation_context;
ALTER TABLE knowledge_fragments ADD CONSTRAINT fk_knowledge_fragments_evaluation_context
  FOREIGN KEY (evaluation_context) REFERENCES evaluation_contexts (evaluation_context_id);

-- KnowledgeGaps
ALTER TABLE knowledge_gaps DROP CONSTRAINT IF EXISTS fk_knowledge_gaps_procedure_version;
ALTER TABLE knowledge_gaps ADD CONSTRAINT fk_knowledge_gaps_procedure_version
  FOREIGN KEY (procedure_version) REFERENCES procedure_versions (procedure_version_id);
ALTER TABLE knowledge_gaps DROP CONSTRAINT IF EXISTS fk_knowledge_gaps_step;
ALTER TABLE knowledge_gaps ADD CONSTRAINT fk_knowledge_gaps_step
  FOREIGN KEY (step) REFERENCES steps (step_id);
ALTER TABLE knowledge_gaps DROP CONSTRAINT IF EXISTS fk_knowledge_gaps_owner_role;
ALTER TABLE knowledge_gaps ADD CONSTRAINT fk_knowledge_gaps_owner_role
  FOREIGN KEY (owner_role) REFERENCES roles (role_id);
ALTER TABLE knowledge_gaps DROP CONSTRAINT IF EXISTS fk_knowledge_gaps_evaluation_context;
ALTER TABLE knowledge_gaps ADD CONSTRAINT fk_knowledge_gaps_evaluation_context
  FOREIGN KEY (evaluation_context) REFERENCES evaluation_contexts (evaluation_context_id);

-- FAQs
ALTER TABLE faqs DROP CONSTRAINT IF EXISTS fk_faqs_procedure_version;
ALTER TABLE faqs ADD CONSTRAINT fk_faqs_procedure_version
  FOREIGN KEY (procedure_version) REFERENCES procedure_versions (procedure_version_id);
ALTER TABLE faqs DROP CONSTRAINT IF EXISTS fk_faqs_step;
ALTER TABLE faqs ADD CONSTRAINT fk_faqs_step
  FOREIGN KEY (step) REFERENCES steps (step_id);

-- Explanations
ALTER TABLE explanations DROP CONSTRAINT IF EXISTS fk_explanations_procedure_version;
ALTER TABLE explanations ADD CONSTRAINT fk_explanations_procedure_version
  FOREIGN KEY (procedure_version) REFERENCES procedure_versions (procedure_version_id);
ALTER TABLE explanations DROP CONSTRAINT IF EXISTS fk_explanations_step;
ALTER TABLE explanations ADD CONSTRAINT fk_explanations_step
  FOREIGN KEY (step) REFERENCES steps (step_id);

-- ProcedureExecutions
ALTER TABLE procedure_executions DROP CONSTRAINT IF EXISTS fk_procedure_executions_procedure_version;
ALTER TABLE procedure_executions ADD CONSTRAINT fk_procedure_executions_procedure_version
  FOREIGN KEY (procedure_version) REFERENCES procedure_versions (procedure_version_id);
ALTER TABLE procedure_executions DROP CONSTRAINT IF EXISTS fk_procedure_executions_executed_by_agent;
ALTER TABLE procedure_executions ADD CONSTRAINT fk_procedure_executions_executed_by_agent
  FOREIGN KEY (executed_by_agent) REFERENCES agents (agent_id);

-- StepExecutions
ALTER TABLE step_executions DROP CONSTRAINT IF EXISTS fk_step_executions_procedure_execution;
ALTER TABLE step_executions ADD CONSTRAINT fk_step_executions_procedure_execution
  FOREIGN KEY (procedure_execution) REFERENCES procedure_executions (procedure_execution_id);
ALTER TABLE step_executions DROP CONSTRAINT IF EXISTS fk_step_executions_step;
ALTER TABLE step_executions ADD CONSTRAINT fk_step_executions_step
  FOREIGN KEY (step) REFERENCES steps (step_id);
ALTER TABLE step_executions DROP CONSTRAINT IF EXISTS fk_step_executions_executed_by_agent;
ALTER TABLE step_executions ADD CONSTRAINT fk_step_executions_executed_by_agent
  FOREIGN KEY (executed_by_agent) REFERENCES agents (agent_id);

-- RequirementSatisfactions
ALTER TABLE requirement_satisfactions DROP CONSTRAINT IF EXISTS fk_requirement_satisfactions_step_execution;
ALTER TABLE requirement_satisfactions ADD CONSTRAINT fk_requirement_satisfactions_step_execution
  FOREIGN KEY (step_execution) REFERENCES step_executions (step_execution_id);
ALTER TABLE requirement_satisfactions DROP CONSTRAINT IF EXISTS fk_requirement_satisfactions_requirement;
ALTER TABLE requirement_satisfactions ADD CONSTRAINT fk_requirement_satisfactions_requirement
  FOREIGN KEY (requirement) REFERENCES requirements (requirement_id);
ALTER TABLE requirement_satisfactions DROP CONSTRAINT IF EXISTS fk_requirement_satisfactions_evaluated_by_agent;
ALTER TABLE requirement_satisfactions ADD CONSTRAINT fk_requirement_satisfactions_evaluated_by_agent
  FOREIGN KEY (evaluated_by_agent) REFERENCES agents (agent_id);

-- IssueOccurrences
ALTER TABLE issue_occurrences DROP CONSTRAINT IF EXISTS fk_issue_occurrences_step_execution;
ALTER TABLE issue_occurrences ADD CONSTRAINT fk_issue_occurrences_step_execution
  FOREIGN KEY (step_execution) REFERENCES step_executions (step_execution_id);
ALTER TABLE issue_occurrences DROP CONSTRAINT IF EXISTS fk_issue_occurrences_error;
ALTER TABLE issue_occurrences ADD CONSTRAINT fk_issue_occurrences_error
  FOREIGN KEY (error) REFERENCES errors (error_id);
ALTER TABLE issue_occurrences DROP CONSTRAINT IF EXISTS fk_issue_occurrences_encountered_by_agent;
ALTER TABLE issue_occurrences ADD CONSTRAINT fk_issue_occurrences_encountered_by_agent
  FOREIGN KEY (encountered_by_agent) REFERENCES agents (agent_id);

-- UserQuestions
ALTER TABLE user_questions DROP CONSTRAINT IF EXISTS fk_user_questions_step_execution;
ALTER TABLE user_questions ADD CONSTRAINT fk_user_questions_step_execution
  FOREIGN KEY (step_execution) REFERENCES step_executions (step_execution_id);
ALTER TABLE user_questions DROP CONSTRAINT IF EXISTS fk_user_questions_asked_by_agent;
ALTER TABLE user_questions ADD CONSTRAINT fk_user_questions_asked_by_agent
  FOREIGN KEY (asked_by_agent) REFERENCES agents (agent_id);
ALTER TABLE user_questions DROP CONSTRAINT IF EXISTS fk_user_questions_resolved_by_faq;
ALTER TABLE user_questions ADD CONSTRAINT fk_user_questions_resolved_by_faq
  FOREIGN KEY (resolved_by_faq) REFERENCES faqs (faq_id);
ALTER TABLE user_questions DROP CONSTRAINT IF EXISTS fk_user_questions_addressed_by_resource;
ALTER TABLE user_questions ADD CONSTRAINT fk_user_questions_addressed_by_resource
  FOREIGN KEY (addressed_by_resource) REFERENCES resources (resource_id);

-- UserFeedback
ALTER TABLE user_feedback DROP CONSTRAINT IF EXISTS fk_user_feedback_procedure_execution;
ALTER TABLE user_feedback ADD CONSTRAINT fk_user_feedback_procedure_execution
  FOREIGN KEY (procedure_execution) REFERENCES procedure_executions (procedure_execution_id);
ALTER TABLE user_feedback DROP CONSTRAINT IF EXISTS fk_user_feedback_provided_by_agent;
ALTER TABLE user_feedback ADD CONSTRAINT fk_user_feedback_provided_by_agent
  FOREIGN KEY (provided_by_agent) REFERENCES agents (agent_id);
ALTER TABLE user_feedback DROP CONSTRAINT IF EXISTS fk_user_feedback_change_request_key;
ALTER TABLE user_feedback ADD CONSTRAINT fk_user_feedback_change_request_key
  FOREIGN KEY (change_request_key) REFERENCES change_requests (change_request_id);

-- StewardshipAssignments
ALTER TABLE stewardship_assignments DROP CONSTRAINT IF EXISTS fk_stewardship_assignments_procedure_version;
ALTER TABLE stewardship_assignments ADD CONSTRAINT fk_stewardship_assignments_procedure_version
  FOREIGN KEY (procedure_version) REFERENCES procedure_versions (procedure_version_id);
ALTER TABLE stewardship_assignments DROP CONSTRAINT IF EXISTS fk_stewardship_assignments_steward_role;
ALTER TABLE stewardship_assignments ADD CONSTRAINT fk_stewardship_assignments_steward_role
  FOREIGN KEY (steward_role) REFERENCES roles (role_id);
ALTER TABLE stewardship_assignments DROP CONSTRAINT IF EXISTS fk_stewardship_assignments_authority_role;
ALTER TABLE stewardship_assignments ADD CONSTRAINT fk_stewardship_assignments_authority_role
  FOREIGN KEY (authority_role) REFERENCES roles (role_id);
ALTER TABLE stewardship_assignments DROP CONSTRAINT IF EXISTS fk_stewardship_assignments_evaluation_context;
ALTER TABLE stewardship_assignments ADD CONSTRAINT fk_stewardship_assignments_evaluation_context
  FOREIGN KEY (evaluation_context) REFERENCES evaluation_contexts (evaluation_context_id);

-- ChangeRequests
ALTER TABLE change_requests DROP CONSTRAINT IF EXISTS fk_change_requests_procedure_version;
ALTER TABLE change_requests ADD CONSTRAINT fk_change_requests_procedure_version
  FOREIGN KEY (procedure_version) REFERENCES procedure_versions (procedure_version_id);
ALTER TABLE change_requests DROP CONSTRAINT IF EXISTS fk_change_requests_requested_by_agent;
ALTER TABLE change_requests ADD CONSTRAINT fk_change_requests_requested_by_agent
  FOREIGN KEY (requested_by_agent) REFERENCES agents (agent_id);
ALTER TABLE change_requests DROP CONSTRAINT IF EXISTS fk_change_requests_authority_role;
ALTER TABLE change_requests ADD CONSTRAINT fk_change_requests_authority_role
  FOREIGN KEY (authority_role) REFERENCES roles (role_id);
ALTER TABLE change_requests DROP CONSTRAINT IF EXISTS fk_change_requests_evaluation_context;
ALTER TABLE change_requests ADD CONSTRAINT fk_change_requests_evaluation_context
  FOREIGN KEY (evaluation_context) REFERENCES evaluation_contexts (evaluation_context_id);

-- ReviewEvents
ALTER TABLE review_events DROP CONSTRAINT IF EXISTS fk_review_events_procedure_version;
ALTER TABLE review_events ADD CONSTRAINT fk_review_events_procedure_version
  FOREIGN KEY (procedure_version) REFERENCES procedure_versions (procedure_version_id);
ALTER TABLE review_events DROP CONSTRAINT IF EXISTS fk_review_events_reviewed_by_agent;
ALTER TABLE review_events ADD CONSTRAINT fk_review_events_reviewed_by_agent
  FOREIGN KEY (reviewed_by_agent) REFERENCES agents (agent_id);
ALTER TABLE review_events DROP CONSTRAINT IF EXISTS fk_review_events_related_change_request;
ALTER TABLE review_events ADD CONSTRAINT fk_review_events_related_change_request
  FOREIGN KEY (related_change_request) REFERENCES change_requests (change_request_id);
ALTER TABLE review_events DROP CONSTRAINT IF EXISTS fk_review_events_evaluation_context;
ALTER TABLE review_events ADD CONSTRAINT fk_review_events_evaluation_context
  FOREIGN KEY (evaluation_context) REFERENCES evaluation_contexts (evaluation_context_id);

-- LearningActivities
ALTER TABLE learning_activities DROP CONSTRAINT IF EXISTS fk_learning_activities_community_of_practice;
ALTER TABLE learning_activities ADD CONSTRAINT fk_learning_activities_community_of_practice
  FOREIGN KEY (community_of_practice) REFERENCES communities_of_practice (community_of_practice_id);
ALTER TABLE learning_activities DROP CONSTRAINT IF EXISTS fk_learning_activities_procedure_version;
ALTER TABLE learning_activities ADD CONSTRAINT fk_learning_activities_procedure_version
  FOREIGN KEY (procedure_version) REFERENCES procedure_versions (procedure_version_id);
ALTER TABLE learning_activities DROP CONSTRAINT IF EXISTS fk_learning_activities_facilitator_agent;
ALTER TABLE learning_activities ADD CONSTRAINT fk_learning_activities_facilitator_agent
  FOREIGN KEY (facilitator_agent) REFERENCES agents (agent_id);
ALTER TABLE learning_activities DROP CONSTRAINT IF EXISTS fk_learning_activities_evidence_resource;
ALTER TABLE learning_activities ADD CONSTRAINT fk_learning_activities_evidence_resource
  FOREIGN KEY (evidence_resource) REFERENCES resources (resource_id);

-- OperationalBindings
ALTER TABLE operational_bindings DROP CONSTRAINT IF EXISTS fk_operational_bindings_procedure_version;
ALTER TABLE operational_bindings ADD CONSTRAINT fk_operational_bindings_procedure_version
  FOREIGN KEY (procedure_version) REFERENCES procedure_versions (procedure_version_id);
ALTER TABLE operational_bindings DROP CONSTRAINT IF EXISTS fk_operational_bindings_step;
ALTER TABLE operational_bindings ADD CONSTRAINT fk_operational_bindings_step
  FOREIGN KEY (step) REFERENCES steps (step_id);
ALTER TABLE operational_bindings DROP CONSTRAINT IF EXISTS fk_operational_bindings_resource;
ALTER TABLE operational_bindings ADD CONSTRAINT fk_operational_bindings_resource
  FOREIGN KEY (resource) REFERENCES resources (resource_id);
ALTER TABLE operational_bindings DROP CONSTRAINT IF EXISTS fk_operational_bindings_evaluation_context;
ALTER TABLE operational_bindings ADD CONSTRAINT fk_operational_bindings_evaluation_context
  FOREIGN KEY (evaluation_context) REFERENCES evaluation_contexts (evaluation_context_id);

-- CommunicationPolicies
ALTER TABLE communication_policies DROP CONSTRAINT IF EXISTS fk_communication_policies_procedure_version;
ALTER TABLE communication_policies ADD CONSTRAINT fk_communication_policies_procedure_version
  FOREIGN KEY (procedure_version) REFERENCES procedure_versions (procedure_version_id);
ALTER TABLE communication_policies DROP CONSTRAINT IF EXISTS fk_communication_policies_approval_role;
ALTER TABLE communication_policies ADD CONSTRAINT fk_communication_policies_approval_role
  FOREIGN KEY (approval_role) REFERENCES roles (role_id);

-- MessageTemplates
ALTER TABLE message_templates DROP CONSTRAINT IF EXISTS fk_message_templates_communication_policy;
ALTER TABLE message_templates ADD CONSTRAINT fk_message_templates_communication_policy
  FOREIGN KEY (communication_policy) REFERENCES communication_policies (communication_policy_id);
ALTER TABLE message_templates DROP CONSTRAINT IF EXISTS fk_message_templates_resource;
ALTER TABLE message_templates ADD CONSTRAINT fk_message_templates_resource
  FOREIGN KEY (resource) REFERENCES resources (resource_id);
ALTER TABLE message_templates DROP CONSTRAINT IF EXISTS fk_message_templates_last_valid_approval;
ALTER TABLE message_templates ADD CONSTRAINT fk_message_templates_last_valid_approval
  FOREIGN KEY (last_valid_approval) REFERENCES template_approvals (template_approval_id);

-- SemanticMappings
ALTER TABLE semantic_mappings DROP CONSTRAINT IF EXISTS fk_semantic_mappings_ontology_profile;
ALTER TABLE semantic_mappings ADD CONSTRAINT fk_semantic_mappings_ontology_profile
  FOREIGN KEY (ontology_profile) REFERENCES ontology_profiles (ontology_profile_id);

-- RoleQuestions
ALTER TABLE role_questions DROP CONSTRAINT IF EXISTS fk_role_questions_asking_role;
ALTER TABLE role_questions ADD CONSTRAINT fk_role_questions_asking_role
  FOREIGN KEY (asking_role) REFERENCES roles (role_id);
ALTER TABLE role_questions DROP CONSTRAINT IF EXISTS fk_role_questions_witness_loop;
ALTER TABLE role_questions ADD CONSTRAINT fk_role_questions_witness_loop
  FOREIGN KEY (witness_loop) REFERENCES witness_loops (witness_loop_id);

-- RulebookFields
ALTER TABLE rulebook_fields DROP CONSTRAINT IF EXISTS fk_rulebook_fields_invented_for_question;
ALTER TABLE rulebook_fields ADD CONSTRAINT fk_rulebook_fields_invented_for_question
  FOREIGN KEY (invented_for_question) REFERENCES role_questions (role_question_id);

-- TestCases
ALTER TABLE test_cases DROP CONSTRAINT IF EXISTS fk_test_cases_defends_question;
ALTER TABLE test_cases ADD CONSTRAINT fk_test_cases_defends_question
  FOREIGN KEY (defends_question) REFERENCES role_questions (role_question_id);
ALTER TABLE test_cases DROP CONSTRAINT IF EXISTS fk_test_cases_suite;
ALTER TABLE test_cases ADD CONSTRAINT fk_test_cases_suite
  FOREIGN KEY (suite) REFERENCES test_suites (test_suite_id);

-- ExceptionInvocations
ALTER TABLE exception_invocations DROP CONSTRAINT IF EXISTS fk_exception_invocations_step_execution;
ALTER TABLE exception_invocations ADD CONSTRAINT fk_exception_invocations_step_execution
  FOREIGN KEY (step_execution) REFERENCES step_executions (step_execution_id);
ALTER TABLE exception_invocations DROP CONSTRAINT IF EXISTS fk_exception_invocations_exception;
ALTER TABLE exception_invocations ADD CONSTRAINT fk_exception_invocations_exception
  FOREIGN KEY (exception) REFERENCES exceptions (exception_id);
ALTER TABLE exception_invocations DROP CONSTRAINT IF EXISTS fk_exception_invocations_invoked_by_agent;
ALTER TABLE exception_invocations ADD CONSTRAINT fk_exception_invocations_invoked_by_agent
  FOREIGN KEY (invoked_by_agent) REFERENCES agents (agent_id);
ALTER TABLE exception_invocations DROP CONSTRAINT IF EXISTS fk_exception_invocations_approved_by_agent;
ALTER TABLE exception_invocations ADD CONSTRAINT fk_exception_invocations_approved_by_agent
  FOREIGN KEY (approved_by_agent) REFERENCES agents (agent_id);

-- VerificationOutcomes
ALTER TABLE verification_outcomes DROP CONSTRAINT IF EXISTS fk_verification_outcomes_step_execution;
ALTER TABLE verification_outcomes ADD CONSTRAINT fk_verification_outcomes_step_execution
  FOREIGN KEY (step_execution) REFERENCES step_executions (step_execution_id);
ALTER TABLE verification_outcomes DROP CONSTRAINT IF EXISTS fk_verification_outcomes_step_verification;
ALTER TABLE verification_outcomes ADD CONSTRAINT fk_verification_outcomes_step_verification
  FOREIGN KEY (step_verification) REFERENCES step_verifications (step_verification_id);
ALTER TABLE verification_outcomes DROP CONSTRAINT IF EXISTS fk_verification_outcomes_observed_by_agent;
ALTER TABLE verification_outcomes ADD CONSTRAINT fk_verification_outcomes_observed_by_agent
  FOREIGN KEY (observed_by_agent) REFERENCES agents (agent_id);

-- ObservedTransitions
ALTER TABLE observed_transitions DROP CONSTRAINT IF EXISTS fk_observed_transitions_procedure_execution;
ALTER TABLE observed_transitions ADD CONSTRAINT fk_observed_transitions_procedure_execution
  FOREIGN KEY (procedure_execution) REFERENCES procedure_executions (procedure_execution_id);
ALTER TABLE observed_transitions DROP CONSTRAINT IF EXISTS fk_observed_transitions_step_transition;
ALTER TABLE observed_transitions ADD CONSTRAINT fk_observed_transitions_step_transition
  FOREIGN KEY (step_transition) REFERENCES step_transitions (step_transition_id);
ALTER TABLE observed_transitions DROP CONSTRAINT IF EXISTS fk_observed_transitions_arriving_step_execution;
ALTER TABLE observed_transitions ADD CONSTRAINT fk_observed_transitions_arriving_step_execution
  FOREIGN KEY (arriving_step_execution) REFERENCES step_executions (step_execution_id);

-- Recipients
ALTER TABLE recipients DROP CONSTRAINT IF EXISTS fk_recipients_organization;
ALTER TABLE recipients ADD CONSTRAINT fk_recipients_organization
  FOREIGN KEY (organization) REFERENCES organizations (organization_id);
ALTER TABLE recipients DROP CONSTRAINT IF EXISTS fk_recipients_consent_binding;
ALTER TABLE recipients ADD CONSTRAINT fk_recipients_consent_binding
  FOREIGN KEY (consent_binding) REFERENCES operational_bindings (operational_binding_id);

-- MessageDeliveries
ALTER TABLE message_deliveries DROP CONSTRAINT IF EXISTS fk_message_deliveries_procedure_execution;
ALTER TABLE message_deliveries ADD CONSTRAINT fk_message_deliveries_procedure_execution
  FOREIGN KEY (procedure_execution) REFERENCES procedure_executions (procedure_execution_id);
ALTER TABLE message_deliveries DROP CONSTRAINT IF EXISTS fk_message_deliveries_step_execution;
ALTER TABLE message_deliveries ADD CONSTRAINT fk_message_deliveries_step_execution
  FOREIGN KEY (step_execution) REFERENCES step_executions (step_execution_id);
ALTER TABLE message_deliveries DROP CONSTRAINT IF EXISTS fk_message_deliveries_recipient;
ALTER TABLE message_deliveries ADD CONSTRAINT fk_message_deliveries_recipient
  FOREIGN KEY (recipient) REFERENCES recipients (recipient_id);
ALTER TABLE message_deliveries DROP CONSTRAINT IF EXISTS fk_message_deliveries_message_template;
ALTER TABLE message_deliveries ADD CONSTRAINT fk_message_deliveries_message_template
  FOREIGN KEY (message_template) REFERENCES message_templates (message_template_id);
ALTER TABLE message_deliveries DROP CONSTRAINT IF EXISTS fk_message_deliveries_sent_by_agent;
ALTER TABLE message_deliveries ADD CONSTRAINT fk_message_deliveries_sent_by_agent
  FOREIGN KEY (sent_by_agent) REFERENCES agents (agent_id);
ALTER TABLE message_deliveries DROP CONSTRAINT IF EXISTS fk_message_deliveries_invoked_exception;
ALTER TABLE message_deliveries ADD CONSTRAINT fk_message_deliveries_invoked_exception
  FOREIGN KEY (invoked_exception) REFERENCES exceptions (exception_id);
ALTER TABLE message_deliveries DROP CONSTRAINT IF EXISTS fk_message_deliveries_evaluation_context;
ALTER TABLE message_deliveries ADD CONSTRAINT fk_message_deliveries_evaluation_context
  FOREIGN KEY (evaluation_context) REFERENCES evaluation_contexts (evaluation_context_id);

-- TemplateApprovals
ALTER TABLE template_approvals DROP CONSTRAINT IF EXISTS fk_template_approvals_message_template;
ALTER TABLE template_approvals ADD CONSTRAINT fk_template_approvals_message_template
  FOREIGN KEY (message_template) REFERENCES message_templates (message_template_id);
ALTER TABLE template_approvals DROP CONSTRAINT IF EXISTS fk_template_approvals_decided_by_agent;
ALTER TABLE template_approvals ADD CONSTRAINT fk_template_approvals_decided_by_agent
  FOREIGN KEY (decided_by_agent) REFERENCES agents (agent_id);
ALTER TABLE template_approvals DROP CONSTRAINT IF EXISTS fk_template_approvals_decided_in_role;
ALTER TABLE template_approvals ADD CONSTRAINT fk_template_approvals_decided_in_role
  FOREIGN KEY (decided_in_role) REFERENCES roles (role_id);

-- SendIntents
ALTER TABLE send_intents DROP CONSTRAINT IF EXISTS fk_send_intents_procedure_execution;
ALTER TABLE send_intents ADD CONSTRAINT fk_send_intents_procedure_execution
  FOREIGN KEY (procedure_execution) REFERENCES procedure_executions (procedure_execution_id);
ALTER TABLE send_intents DROP CONSTRAINT IF EXISTS fk_send_intents_step_execution;
ALTER TABLE send_intents ADD CONSTRAINT fk_send_intents_step_execution
  FOREIGN KEY (step_execution) REFERENCES step_executions (step_execution_id);
ALTER TABLE send_intents DROP CONSTRAINT IF EXISTS fk_send_intents_recipient;
ALTER TABLE send_intents ADD CONSTRAINT fk_send_intents_recipient
  FOREIGN KEY (recipient) REFERENCES recipients (recipient_id);
ALTER TABLE send_intents DROP CONSTRAINT IF EXISTS fk_send_intents_message_template;
ALTER TABLE send_intents ADD CONSTRAINT fk_send_intents_message_template
  FOREIGN KEY (message_template) REFERENCES message_templates (message_template_id);
ALTER TABLE send_intents DROP CONSTRAINT IF EXISTS fk_send_intents_resulting_delivery;
ALTER TABLE send_intents ADD CONSTRAINT fk_send_intents_resulting_delivery
  FOREIGN KEY (resulting_delivery) REFERENCES message_deliveries (message_delivery_id);
ALTER TABLE send_intents DROP CONSTRAINT IF EXISTS fk_send_intents_alternate_channel_intent;
ALTER TABLE send_intents ADD CONSTRAINT fk_send_intents_alternate_channel_intent
  FOREIGN KEY (alternate_channel_intent) REFERENCES send_intents (send_intent_id);
ALTER TABLE send_intents DROP CONSTRAINT IF EXISTS fk_send_intents_refusal_notified_role;
ALTER TABLE send_intents ADD CONSTRAINT fk_send_intents_refusal_notified_role
  FOREIGN KEY (refusal_notified_role) REFERENCES roles (role_id);
ALTER TABLE send_intents DROP CONSTRAINT IF EXISTS fk_send_intents_retry_intent;
ALTER TABLE send_intents ADD CONSTRAINT fk_send_intents_retry_intent
  FOREIGN KEY (retry_intent) REFERENCES send_intents (send_intent_id);
ALTER TABLE send_intents DROP CONSTRAINT IF EXISTS fk_send_intents_evaluation_context;
ALTER TABLE send_intents ADD CONSTRAINT fk_send_intents_evaluation_context
  FOREIGN KEY (evaluation_context) REFERENCES evaluation_contexts (evaluation_context_id);
ALTER TABLE send_intents DROP CONSTRAINT IF EXISTS fk_send_intents_evaluating_role_assignment;
ALTER TABLE send_intents ADD CONSTRAINT fk_send_intents_evaluating_role_assignment
  FOREIGN KEY (evaluating_role_assignment) REFERENCES role_assignments (role_assignment_id);

-- AgentDecisionRecords
ALTER TABLE agent_decision_records DROP CONSTRAINT IF EXISTS fk_agent_decision_records_step_execution;
ALTER TABLE agent_decision_records ADD CONSTRAINT fk_agent_decision_records_step_execution
  FOREIGN KEY (step_execution) REFERENCES step_executions (step_execution_id);
ALTER TABLE agent_decision_records DROP CONSTRAINT IF EXISTS fk_agent_decision_records_deciding_agent;
ALTER TABLE agent_decision_records ADD CONSTRAINT fk_agent_decision_records_deciding_agent
  FOREIGN KEY (deciding_agent) REFERENCES agents (agent_id);
ALTER TABLE agent_decision_records DROP CONSTRAINT IF EXISTS fk_agent_decision_records_reviewed_by_agent;
ALTER TABLE agent_decision_records ADD CONSTRAINT fk_agent_decision_records_reviewed_by_agent
  FOREIGN KEY (reviewed_by_agent) REFERENCES agents (agent_id);
ALTER TABLE agent_decision_records DROP CONSTRAINT IF EXISTS fk_agent_decision_records_under_role_assignment;
ALTER TABLE agent_decision_records ADD CONSTRAINT fk_agent_decision_records_under_role_assignment
  FOREIGN KEY (under_role_assignment) REFERENCES role_assignments (role_assignment_id);

-- DeliveredCommunications
ALTER TABLE delivered_communications DROP CONSTRAINT IF EXISTS fk_delivered_communications_procedure_execution;
ALTER TABLE delivered_communications ADD CONSTRAINT fk_delivered_communications_procedure_execution
  FOREIGN KEY (procedure_execution) REFERENCES procedure_executions (procedure_execution_id);
ALTER TABLE delivered_communications DROP CONSTRAINT IF EXISTS fk_delivered_communications_sending_step_execution;
ALTER TABLE delivered_communications ADD CONSTRAINT fk_delivered_communications_sending_step_execution
  FOREIGN KEY (sending_step_execution) REFERENCES step_executions (step_execution_id);
ALTER TABLE delivered_communications DROP CONSTRAINT IF EXISTS fk_delivered_communications_authorizing_step_execution;
ALTER TABLE delivered_communications ADD CONSTRAINT fk_delivered_communications_authorizing_step_execution
  FOREIGN KEY (authorizing_step_execution) REFERENCES step_executions (step_execution_id);
ALTER TABLE delivered_communications DROP CONSTRAINT IF EXISTS fk_delivered_communications_message_template;
ALTER TABLE delivered_communications ADD CONSTRAINT fk_delivered_communications_message_template
  FOREIGN KEY (message_template) REFERENCES message_templates (message_template_id);

-- AuthorityBoundaries
ALTER TABLE authority_boundaries DROP CONSTRAINT IF EXISTS fk_authority_boundaries_step;
ALTER TABLE authority_boundaries ADD CONSTRAINT fk_authority_boundaries_step
  FOREIGN KEY (step) REFERENCES steps (step_id);
ALTER TABLE authority_boundaries DROP CONSTRAINT IF EXISTS fk_authority_boundaries_ratified_by_knowledge_fragment;
ALTER TABLE authority_boundaries ADD CONSTRAINT fk_authority_boundaries_ratified_by_knowledge_fragment
  FOREIGN KEY (ratified_by_knowledge_fragment) REFERENCES knowledge_fragments (knowledge_fragment_id);
ALTER TABLE authority_boundaries DROP CONSTRAINT IF EXISTS fk_authority_boundaries_enforcing_requirement;
ALTER TABLE authority_boundaries ADD CONSTRAINT fk_authority_boundaries_enforcing_requirement
  FOREIGN KEY (enforcing_requirement) REFERENCES requirements (requirement_id);
ALTER TABLE authority_boundaries DROP CONSTRAINT IF EXISTS fk_authority_boundaries_authority_role;
ALTER TABLE authority_boundaries ADD CONSTRAINT fk_authority_boundaries_authority_role
  FOREIGN KEY (authority_role) REFERENCES roles (role_id);
ALTER TABLE authority_boundaries DROP CONSTRAINT IF EXISTS fk_authority_boundaries_evaluation_context;
ALTER TABLE authority_boundaries ADD CONSTRAINT fk_authority_boundaries_evaluation_context
  FOREIGN KEY (evaluation_context) REFERENCES evaluation_contexts (evaluation_context_id);

-- BindingObservations
ALTER TABLE binding_observations DROP CONSTRAINT IF EXISTS fk_binding_observations_step_execution;
ALTER TABLE binding_observations ADD CONSTRAINT fk_binding_observations_step_execution
  FOREIGN KEY (step_execution) REFERENCES step_executions (step_execution_id);
ALTER TABLE binding_observations DROP CONSTRAINT IF EXISTS fk_binding_observations_operational_binding;
ALTER TABLE binding_observations ADD CONSTRAINT fk_binding_observations_operational_binding
  FOREIGN KEY (operational_binding) REFERENCES operational_bindings (operational_binding_id);

-- Attestations
ALTER TABLE attestations DROP CONSTRAINT IF EXISTS fk_attestations_procedure_execution;
ALTER TABLE attestations ADD CONSTRAINT fk_attestations_procedure_execution
  FOREIGN KEY (procedure_execution) REFERENCES procedure_executions (procedure_execution_id);
ALTER TABLE attestations DROP CONSTRAINT IF EXISTS fk_attestations_signed_by_agent;
ALTER TABLE attestations ADD CONSTRAINT fk_attestations_signed_by_agent
  FOREIGN KEY (signed_by_agent) REFERENCES agents (agent_id);

-- AppRoleProfiles
ALTER TABLE app_role_profiles DROP CONSTRAINT IF EXISTS fk_app_role_profiles_role;
ALTER TABLE app_role_profiles ADD CONSTRAINT fk_app_role_profiles_role
  FOREIGN KEY (role) REFERENCES roles (role_id);

-- AppRoutes
ALTER TABLE app_routes DROP CONSTRAINT IF EXISTS fk_app_routes_owning_role;
ALTER TABLE app_routes ADD CONSTRAINT fk_app_routes_owning_role
  FOREIGN KEY (owning_role) REFERENCES roles (role_id);
ALTER TABLE app_routes DROP CONSTRAINT IF EXISTS fk_app_routes_nav_group;
ALTER TABLE app_routes ADD CONSTRAINT fk_app_routes_nav_group
  FOREIGN KEY (nav_group) REFERENCES app_nav_groups (app_nav_group_id);

-- AppRouteQuestions
ALTER TABLE app_route_questions DROP CONSTRAINT IF EXISTS fk_app_route_questions_route;
ALTER TABLE app_route_questions ADD CONSTRAINT fk_app_route_questions_route
  FOREIGN KEY (route) REFERENCES app_routes (app_route_id);
ALTER TABLE app_route_questions DROP CONSTRAINT IF EXISTS fk_app_route_questions_question;
ALTER TABLE app_route_questions ADD CONSTRAINT fk_app_route_questions_question
  FOREIGN KEY (question) REFERENCES role_questions (role_question_id);

-- AppRouteReferences
ALTER TABLE app_route_references DROP CONSTRAINT IF EXISTS fk_app_route_references_from_route;
ALTER TABLE app_route_references ADD CONSTRAINT fk_app_route_references_from_route
  FOREIGN KEY (from_route) REFERENCES app_routes (app_route_id);
ALTER TABLE app_route_references DROP CONSTRAINT IF EXISTS fk_app_route_references_to_route;
ALTER TABLE app_route_references ADD CONSTRAINT fk_app_route_references_to_route
  FOREIGN KEY (to_route) REFERENCES app_routes (app_route_id);

-- AccessPrincipals
ALTER TABLE access_principals DROP CONSTRAINT IF EXISTS fk_access_principals_domain_role;
ALTER TABLE access_principals ADD CONSTRAINT fk_access_principals_domain_role
  FOREIGN KEY (domain_role) REFERENCES roles (role_id);

-- AccessPolicies
ALTER TABLE access_policies DROP CONSTRAINT IF EXISTS fk_access_policies_principal;
ALTER TABLE access_policies ADD CONSTRAINT fk_access_policies_principal
  FOREIGN KEY (principal) REFERENCES access_principals (access_principal_id);
ALTER TABLE access_policies DROP CONSTRAINT IF EXISTS fk_access_policies_target_table;
ALTER TABLE access_policies ADD CONSTRAINT fk_access_policies_target_table
  FOREIGN KEY (target_table) REFERENCES rulebook_tables (rulebook_tables_id);

-- FieldGrants
ALTER TABLE field_grants DROP CONSTRAINT IF EXISTS fk_field_grants_principal;
ALTER TABLE field_grants ADD CONSTRAINT fk_field_grants_principal
  FOREIGN KEY (principal) REFERENCES access_principals (access_principal_id);
ALTER TABLE field_grants DROP CONSTRAINT IF EXISTS fk_field_grants_target_field;
ALTER TABLE field_grants ADD CONSTRAINT fk_field_grants_target_field
  FOREIGN KEY (target_field) REFERENCES rulebook_fields (rulebook_field_id);

-- RoleSchemas
ALTER TABLE role_schemas DROP CONSTRAINT IF EXISTS fk_role_schemas_principal;
ALTER TABLE role_schemas ADD CONSTRAINT fk_role_schemas_principal
  FOREIGN KEY (principal) REFERENCES access_principals (access_principal_id);

-- RoleSchemaViews
ALTER TABLE role_schema_views DROP CONSTRAINT IF EXISTS fk_role_schema_views_role_schema;
ALTER TABLE role_schema_views ADD CONSTRAINT fk_role_schema_views_role_schema
  FOREIGN KEY (role_schema) REFERENCES role_schemas (role_schema_id);
ALTER TABLE role_schema_views DROP CONSTRAINT IF EXISTS fk_role_schema_views_principal;
ALTER TABLE role_schema_views ADD CONSTRAINT fk_role_schema_views_principal
  FOREIGN KEY (principal) REFERENCES access_principals (access_principal_id);
ALTER TABLE role_schema_views DROP CONSTRAINT IF EXISTS fk_role_schema_views_target_table;
ALTER TABLE role_schema_views ADD CONSTRAINT fk_role_schema_views_target_table
  FOREIGN KEY (target_table) REFERENCES rulebook_tables (rulebook_tables_id);

-- AccessDenialTests
ALTER TABLE access_denial_tests DROP CONSTRAINT IF EXISTS fk_access_denial_tests_target_policy;
ALTER TABLE access_denial_tests ADD CONSTRAINT fk_access_denial_tests_target_policy
  FOREIGN KEY (target_policy) REFERENCES access_policies (access_policy_id);
ALTER TABLE access_denial_tests DROP CONSTRAINT IF EXISTS fk_access_denial_tests_principal;
ALTER TABLE access_denial_tests ADD CONSTRAINT fk_access_denial_tests_principal
  FOREIGN KEY (principal) REFERENCES access_principals (access_principal_id);
ALTER TABLE access_denial_tests DROP CONSTRAINT IF EXISTS fk_access_denial_tests_target_table;
ALTER TABLE access_denial_tests ADD CONSTRAINT fk_access_denial_tests_target_table
  FOREIGN KEY (target_table) REFERENCES rulebook_tables (rulebook_tables_id);

-- AppUsers
ALTER TABLE app_users DROP CONSTRAINT IF EXISTS fk_app_users_linked_agent;
ALTER TABLE app_users ADD CONSTRAINT fk_app_users_linked_agent
  FOREIGN KEY (linked_agent) REFERENCES agents (agent_id);

-- PrincipalAssignments
ALTER TABLE principal_assignments DROP CONSTRAINT IF EXISTS fk_principal_assignments_app_user;
ALTER TABLE principal_assignments ADD CONSTRAINT fk_principal_assignments_app_user
  FOREIGN KEY (app_user) REFERENCES app_users (app_user_id);
ALTER TABLE principal_assignments DROP CONSTRAINT IF EXISTS fk_principal_assignments_principal;
ALTER TABLE principal_assignments ADD CONSTRAINT fk_principal_assignments_principal
  FOREIGN KEY (principal) REFERENCES access_principals (access_principal_id);

-- IssuedTokens
ALTER TABLE issued_tokens DROP CONSTRAINT IF EXISTS fk_issued_tokens_app_user;
ALTER TABLE issued_tokens ADD CONSTRAINT fk_issued_tokens_app_user
  FOREIGN KEY (app_user) REFERENCES app_users (app_user_id);
ALTER TABLE issued_tokens DROP CONSTRAINT IF EXISTS fk_issued_tokens_principal;
ALTER TABLE issued_tokens ADD CONSTRAINT fk_issued_tokens_principal
  FOREIGN KEY (principal) REFERENCES access_principals (access_principal_id);

-- 192 FK constraint(s) declared (off unless EFFORTLESS_ENFORCE_FKS=true).
