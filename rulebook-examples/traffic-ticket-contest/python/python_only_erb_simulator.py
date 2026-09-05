"""
ERB Calculation Library (GENERATED - DO NOT EDIT)
=================================================
Generated from: effortless-rulebook/traffic-ticket-contest-rulebook.json

PYTHON SUBSTRATE ONLY. Importing this module from any other substrate
is cheating. That substrate must execute the rulebook in its own native
semantics (its $ENGINE). The whole point of ERB conformance is that each
substrate computes calculated, lookup, and aggregation fields by
interpreting/compiling the rulebook itself — not by calling out to a
Python simulator. If a substrate cannot natively compute a field, it must
leave it null and accept the 0 score for that field.

This file contains:
  - Generated calc_* functions for calculated (scalar) fields
  - Generated compute_*_fields(record) dispatchers per entity
  - The compute_all_calculated_fields(record, entity_name) entry point
  - Hand-written compute_lookups() and compute_aggregations() — the
    INDEX/MATCH and COUNTIFS/SUMIFS interpreters. These used to live in
    orchestration/shared.py where any substrate could import them, which
    let 7 substrates report 100% without executing anything native. They
    now live inside the Python-only fence by design.
"""

import json
import re
from pathlib import Path
from typing import Optional, Any

from orchestration.shared import (
    to_snake_case,
    get_entity_schema,
    get_lookup_fields,
    get_aggregation_fields,
)


# =============================================================================
# BUSINESSRULES CALCULATIONS
# =============================================================================

# Level 1

def calc_business_rules_name(rule_code):
    """
    Logical key — lowercased rule code.
    
    Formula: =LOWER(SUBSTITUTE({{RuleCode}}, " ", "-"))
    """
    return ((((rule_code or "").replace(' ', '-')) or "").lower())


def compute_business_rules_fields(record: dict) -> dict:
    """Compute all calculated fields for BusinessRules."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_business_rules_name(result.get('rule_code'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# BUSINESSRULECATEGORIES CALCULATIONS
# =============================================================================

# Level 1

def calc_business_rule_categories_name(business_rule_category_id):
    """
    Echoes BusinessRuleCategoryId.
    
    Formula: ={{BusinessRuleCategoryId}}
    """
    return business_rule_category_id


def compute_business_rule_categories_fields(record: dict) -> dict:
    """Compute all calculated fields for BusinessRuleCategories."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_business_rule_categories_name(result.get('business_rule_category_id'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# GLOSSARYCATEGORIES CALCULATIONS
# =============================================================================

# Level 1

def calc_glossary_categories_name(glossary_category_id):
    """
    Echoes GlossaryCategoryId.
    
    Formula: ={{GlossaryCategoryId}}
    """
    return glossary_category_id


def compute_glossary_categories_fields(record: dict) -> dict:
    """Compute all calculated fields for GlossaryCategories."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_glossary_categories_name(result.get('glossary_category_id'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# GLOSSARYTERMS CALCULATIONS
# =============================================================================

# Level 1

def calc_glossary_terms_name(term):
    """
    Logical key — lowercased dash-form of the term.
    
    Formula: =LOWER(SUBSTITUTE({{Term}}, " ", "-"))
    """
    return ((((term or "").replace(' ', '-')) or "").lower())


def compute_glossary_terms_fields(record: dict) -> dict:
    """Compute all calculated fields for GlossaryTerms."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_glossary_terms_name(result.get('term'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# ROLES CALCULATIONS
# =============================================================================

# Level 1

def calc_roles_name(role_id):
    """
    Echoes RoleId.
    
    Formula: ={{RoleId}}
    """
    return role_id


def compute_roles_fields(record: dict) -> dict:
    """Compute all calculated fields for Roles."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_roles_name(result.get('role_id'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# AUDITLOGENTRIES CALCULATIONS
# =============================================================================

# Level 1

def calc_audit_log_entries_is_override_action(action_type):
    """
    Calculated flag — TRUE when this audit log entry represents a manager override action (vs a routine action).
    
    Formula: =IF(LOWER({{ActionType}} & "") = "override", TRUE(), FALSE())
    """
    return (True if ((((str(action_type or "") + '') or "").lower()) == 'override') else False)


def calc_audit_log_entries_entry_age_hours():
    """ERROR: Could not parse formula: =DATETIME_DIFF(NOW(), {{Timestamp}}, 'hours')
    Error: Unknown function: DATETIME_DIFF
    """
    raise NotImplementedError("Formula parsing failed")


# Level 2


def calc_audit_log_entries_name():
    """ERROR: Could not parse formula: =LOWER(SUBSTITUTE("audit-" & {{Citation}} & "-" & DATETIME_FORMAT({{Timestamp}}, "YYYY-MM-DDTHH-mm-ss") & "-" & {{ActionType}}, " ", "-"))
    Error: Unknown function: DATETIME_FORMAT
    """
    raise NotImplementedError("Formula parsing failed")



def compute_audit_log_entries_fields(record: dict) -> dict:
    """Compute all calculated fields for AuditLogEntries."""
    result = dict(record)

    # Level 1 calculations
    result['is_override_action'] = calc_audit_log_entries_is_override_action(result.get('action_type'))
    result['entry_age_hours'] = calc_audit_log_entries_entry_age_hours(result.get('timestamp'))

    # Level 2 calculations
    result['name'] = calc_audit_log_entries_name(result.get('citation'), result.get('timestamp'), result.get('action_type'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# PLATFORMNAVIATION CALCULATIONS
# =============================================================================

# Level 1

def calc_platform_naviation_name(display_name):
    """Formula: =SUBSTITUTE(LOWER({{DisplayName}}), " ", "-")"""
    return ((((display_name or "").lower()) or "").replace(' ', '-'))


def calc_platform_naviation_admin_can_create():
    """ERROR: Could not parse formula: =IF({{AdminCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("C",{{AdminCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_platform_naviation_admin_can_read():
    """ERROR: Could not parse formula: =IF({{AdminCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("R",{{AdminCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_platform_naviation_admin_can_update():
    """ERROR: Could not parse formula: =IF({{AdminCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("U",{{AdminCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_platform_naviation_admin_can_delete():
    """ERROR: Could not parse formula: =IF({{AdminCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("D",{{AdminCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_platform_naviation_manager_can_create():
    """ERROR: Could not parse formula: =IF({{ManagerCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("C",{{ManagerCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_platform_naviation_manager_can_read():
    """ERROR: Could not parse formula: =IF({{ManagerCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("R",{{ManagerCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_platform_naviation_manager_can_update():
    """ERROR: Could not parse formula: =IF({{ManagerCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("U",{{ManagerCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_platform_naviation_manager_can_delete():
    """ERROR: Could not parse formula: =IF({{ManagerCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("D",{{ManagerCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_platform_naviation_representative_can_create():
    """ERROR: Could not parse formula: =IF({{RepresentativeCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("C",{{RepresentativeCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_platform_naviation_representative_can_read():
    """ERROR: Could not parse formula: =IF({{RepresentativeCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("R",{{RepresentativeCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_platform_naviation_representative_can_update():
    """ERROR: Could not parse formula: =IF({{RepresentativeCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("U",{{RepresentativeCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_platform_naviation_representative_can_delete():
    """ERROR: Could not parse formula: =IF({{RepresentativeCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("D",{{RepresentativeCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_platform_naviation_external_llm_can_create():
    """ERROR: Could not parse formula: =IF({{ExternalLlmCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("C",{{ExternalLlmCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_platform_naviation_external_llm_can_read():
    """ERROR: Could not parse formula: =IF({{ExternalLlmCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("R",{{ExternalLlmCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_platform_naviation_external_llm_can_update():
    """ERROR: Could not parse formula: =IF({{ExternalLlmCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("U",{{ExternalLlmCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_platform_naviation_external_llm_can_delete():
    """ERROR: Could not parse formula: =IF({{ExternalLlmCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("D",{{ExternalLlmCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_platform_naviation_depth():
    """ERROR: Could not parse formula: =IF({{ParentRouteKey}}=BLANK(), 0, LEN({{RouteKey}}) - LEN(SUBSTITUTE({{RouteKey}}, ".", "")))
    Error: Unknown function: LEN
    """
    raise NotImplementedError("Formula parsing failed")


def calc_platform_naviation_full_path(route):
    """
    Calculated — canonical role-agnostic URL path (equals Route). The SPA renders this under each permitted role as /:role + FullPath and resolves it only when that role's *CanRead is true; the role is an implicit prefix, never stored on the row.
    
    Formula: ={{Route}}
    """
    return route

def calc_platform_naviation_handler_base_name(route_key):
    """
    Calculated — space-delimited form of the dotted RouteKey (dots and hyphens become spaces), e.g. 'library rules detail'. The client PascalCases this and prefixes the viewer role to derive the handler component deterministically: {Role} + PascalCase(HandlerBaseName) -> e.g. AdminLibraryRulesDetail, RepresentativeLibraryRulesDetail. No per-role handler is stored; edge cases get their own single-role route row instead.
    
    Formula: =SUBSTITUTE(SUBSTITUTE({{RouteKey}}, ".", " "), "-", " ")
    """
    return ((((route_key or "").replace('.', ' ')) or "").replace('-', ' '))


def compute_platform_naviation_fields(record: dict) -> dict:
    """Compute all calculated fields for PlatformNaviation."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_platform_naviation_name(result.get('display_name'))
    result['admin_can_create'] = calc_platform_naviation_admin_can_create(result.get('admin_crud'))
    result['admin_can_read'] = calc_platform_naviation_admin_can_read(result.get('admin_crud'))
    result['admin_can_update'] = calc_platform_naviation_admin_can_update(result.get('admin_crud'))
    result['admin_can_delete'] = calc_platform_naviation_admin_can_delete(result.get('admin_crud'))
    result['manager_can_create'] = calc_platform_naviation_manager_can_create(result.get('manager_crud'))
    result['manager_can_read'] = calc_platform_naviation_manager_can_read(result.get('manager_crud'))
    result['manager_can_update'] = calc_platform_naviation_manager_can_update(result.get('manager_crud'))
    result['manager_can_delete'] = calc_platform_naviation_manager_can_delete(result.get('manager_crud'))
    result['representative_can_create'] = calc_platform_naviation_representative_can_create(result.get('representative_crud'))
    result['representative_can_read'] = calc_platform_naviation_representative_can_read(result.get('representative_crud'))
    result['representative_can_update'] = calc_platform_naviation_representative_can_update(result.get('representative_crud'))
    result['representative_can_delete'] = calc_platform_naviation_representative_can_delete(result.get('representative_crud'))
    result['external_llm_can_create'] = calc_platform_naviation_external_llm_can_create(result.get('external_llm_crud'))
    result['external_llm_can_read'] = calc_platform_naviation_external_llm_can_read(result.get('external_llm_crud'))
    result['external_llm_can_update'] = calc_platform_naviation_external_llm_can_update(result.get('external_llm_crud'))
    result['external_llm_can_delete'] = calc_platform_naviation_external_llm_can_delete(result.get('external_llm_crud'))
    result['depth'] = calc_platform_naviation_depth(result.get('parent_route_key'), result.get('route_key'))
    result['full_path'] = calc_platform_naviation_full_path(result.get('route'))
    result['handler_base_name'] = calc_platform_naviation_handler_base_name(result.get('route_key'))

    # Convert empty strings to None for string fields
    for key in ['name', 'full_path', 'handler_base_name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# JURISDICTIONS CALCULATIONS
# =============================================================================

# Level 1

def calc_jurisdictions_name(state):
    """Formula: =LOWER({{State}}) & "-us" """
    return (str(((state or "").lower()) if ((state or "").lower()) is not None else "") + '-us')

def calc_jurisdictions_relative_path(jurisdiction_id):
    """
    Concrete relative URL for this jurisdiction's explorer/detail page. Self-contained (no route-table lookup) so it is always populated. Anywhere a jurisdiction is referenced, link to this path.
    
    Formula: ="/library/jurisdictions/" & {{JurisdictionId}}
    """
    return ('/library/jurisdictions/' + str(jurisdiction_id or ""))

# Level 2

def calc_jurisdictions_is_root_jurisdiction(parent_jurisdiction):
    """Formula: =IF({{ParentJurisdiction}}=BLANK(), TRUE(), FALSE())"""
    return (True if (parent_jurisdiction == None) else False)


def compute_jurisdictions_fields(record: dict) -> dict:
    """Compute all calculated fields for Jurisdictions."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_jurisdictions_name(result.get('state'))
    result['relative_path'] = calc_jurisdictions_relative_path(result.get('jurisdiction_id'))

    # Level 2 calculations
    result['is_root_jurisdiction'] = calc_jurisdictions_is_root_jurisdiction(result.get('parent_jurisdiction'))

    # Convert empty strings to None for string fields
    for key in ['name', 'relative_path']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# JURISDICTIONSOURCEDOCUMENTS CALCULATIONS
# =============================================================================

# Level 1

def calc_jurisdiction_source_documents_name(title):
    """Formula: =SUBSTITUTE(LOWER({{Title}}), " ", "-")"""
    return ((((title or "").lower()) or "").replace(' ', '-'))

def calc_jurisdiction_source_documents_relative_path(jurisdiction_source_document_id):
    """
    Concrete relative URL for this document's detail page in the portal.
    
    Formula: ="/library/jurisdiction-docs/" & {{JurisdictionSourceDocumentId}}
    """
    return ('/library/jurisdiction-docs/' + str(jurisdiction_source_document_id or ""))


def compute_jurisdiction_source_documents_fields(record: dict) -> dict:
    """Compute all calculated fields for JurisdictionSourceDocuments."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_jurisdiction_source_documents_name(result.get('title'))
    result['relative_path'] = calc_jurisdiction_source_documents_relative_path(result.get('jurisdiction_source_document_id'))

    # Convert empty strings to None for string fields
    for key in ['name', 'relative_path']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# JURISDICTIONRULES CALCULATIONS
# =============================================================================

# Level 1

def calc_jurisdiction_rules_name(rule_number):
    """Formula: =SUBSTITUTE(LOWER({{RuleNumber}}), " ", "-")"""
    return ((((rule_number or "").lower()) or "").replace(' ', '-'))

def calc_jurisdiction_rules_relative_path(jurisdiction_rule_id):
    """
    Concrete relative URL for this rule's detail page. Self-contained (dedicated /library/jurisdiction-rules/ space) so it never collides with the business-rule library at /library/rules. Anywhere a jurisdiction rule is referenced, link to this path.
    
    Formula: ="/library/jurisdiction-rules/" & {{JurisdictionRuleId}}
    """
    return ('/library/jurisdiction-rules/' + str(jurisdiction_rule_id or ""))

# Level 2

def calc_jurisdiction_rules_is_federal(jurisdiction_type):
    """Formula: =IF({{JurisdictionType}} = "Country", TRUE(), FALSE())"""
    return (True if (jurisdiction_type == 'Country') else False)


def compute_jurisdiction_rules_fields(record: dict) -> dict:
    """Compute all calculated fields for JurisdictionRules."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_jurisdiction_rules_name(result.get('rule_number'))
    result['relative_path'] = calc_jurisdiction_rules_relative_path(result.get('jurisdiction_rule_id'))

    # Level 2 calculations
    result['is_federal'] = calc_jurisdiction_rules_is_federal(result.get('jurisdiction_type'))

    # Convert empty strings to None for string fields
    for key in ['name', 'relative_path']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# APPUSERS CALCULATIONS
# =============================================================================

# Level 1

def calc_app_users_name_redacted(name):
    """
    Redacted (masked) view of Name. Redacted roles read this instead of Name.
    
    Formula: ={{Name}}
    """
    return name

def calc_app_users_email_address_redacted(email_address):
    """
    Redacted (masked) view of EmailAddress. Redacted roles read this instead of EmailAddress.
    
    Formula: ={{EmailAddress}}
    """
    return email_address


def compute_app_users_fields(record: dict) -> dict:
    """Compute all calculated fields for AppUsers."""
    result = dict(record)

    # Level 1 calculations
    result['name_redacted'] = calc_app_users_name_redacted(result.get('name'))
    result['email_address_redacted'] = calc_app_users_email_address_redacted(result.get('email_address'))

    # Convert empty strings to None for string fields
    for key in ['name_redacted', 'email_address_redacted']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# SITEBRANDING CALCULATIONS
# =============================================================================

# Level 1

def calc_site_branding_name(site_branding_id):
    """
    Echoes SiteBrandingId.
    
    Formula: ={{SiteBrandingId}}
    """
    return site_branding_id


def compute_site_branding_fields(record: dict) -> dict:
    """Compute all calculated fields for SiteBranding."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_site_branding_name(result.get('site_branding_id'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# REFERENCEDOCUMENTS CALCULATIONS
# =============================================================================

# Level 1

def calc_reference_documents_name(reference_document_id):
    """
    Echoes ReferenceDocumentId.
    
    Formula: ={{ReferenceDocumentId}}
    """
    return reference_document_id

def calc_reference_documents_is_appeal_board_decision(library):
    """
    TRUE when Library = appeal-board-decisions.
    
    Formula: ={{Library}}="appeal-board-decisions" 
    """
    return (library == 'appeal-board-decisions')


def compute_reference_documents_fields(record: dict) -> dict:
    """Compute all calculated fields for ReferenceDocuments."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_reference_documents_name(result.get('reference_document_id'))
    result['is_appeal_board_decision'] = calc_reference_documents_is_appeal_board_decision(result.get('library'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# STATEMACHINES CALCULATIONS
# =============================================================================

# Level 1

def calc_state_machines_name(state_machine_id):
    """
    Echoes StateMachineId.
    
    Formula: ={{StateMachineId}}
    """
    return state_machine_id


def compute_state_machines_fields(record: dict) -> dict:
    """Compute all calculated fields for StateMachines."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_state_machines_name(result.get('state_machine_id'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# MACHINESTATES CALCULATIONS
# =============================================================================

# Level 1

def calc_machine_states_name(machine_state_id):
    """
    Echoes MachineStateId.
    
    Formula: ={{MachineStateId}}
    """
    return machine_state_id


def compute_machine_states_fields(record: dict) -> dict:
    """Compute all calculated fields for MachineStates."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_machine_states_name(result.get('machine_state_id'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# STATETRANSITIONRULES CALCULATIONS
# =============================================================================

# Level 1

def calc_state_transition_rules_name(state_transition_rule_id):
    """
    Echoes StateTransitionRuleId.
    
    Formula: ={{StateTransitionRuleId}}
    """
    return state_transition_rule_id

# Level 2

def calc_state_transition_rules_is_forward_edge(to_state_key):
    """
    TRUE when ToState is not the machine's initial state.
    
    Formula: =NOT({{ToStateKey}}="draft")
    """
    return (not (to_state_key == 'draft'))


def compute_state_transition_rules_fields(record: dict) -> dict:
    """Compute all calculated fields for StateTransitionRules."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_state_transition_rules_name(result.get('state_transition_rule_id'))

    # Level 2 calculations
    result['is_forward_edge'] = calc_state_transition_rules_is_forward_edge(result.get('to_state_key'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# STATETRANSITIONS CALCULATIONS
# =============================================================================

# Level 1

def calc_state_transitions_name(state_transition_id):
    """
    Echoes StateTransitionId.
    
    Formula: ={{StateTransitionId}}
    """
    return state_transition_id

def calc_state_transitions_is_forward(to_state_key):
    """
    Generalizes the old =NOT(ToStage="DRAFT"): TRUE when ToStateKey is not the machine's initial state.
    
    Formula: =AND(NOT({{ToStateKey}}="draft"),NOT({{ToStateKey}}="new"),NOT({{ToStateKey}}="pending"),NOT({{ToStateKey}}="open"),NOT({{ToStateKey}}="issued"))
    """
    return ((not (to_state_key == 'draft')) and (not (to_state_key == 'new')) and (not (to_state_key == 'pending')) and (not (to_state_key == 'open')) and (not (to_state_key == 'issued')))


def compute_state_transitions_fields(record: dict) -> dict:
    """Compute all calculated fields for StateTransitions."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_state_transitions_name(result.get('state_transition_id'))
    result['is_forward'] = calc_state_transitions_is_forward(result.get('to_state_key'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# WORKQUEUEITEMS CALCULATIONS
# =============================================================================

# Level 1

def calc_work_queue_items_name(work_queue_item_id):
    """
    Echoes WorkQueueItemId.
    
    Formula: ={{WorkQueueItemId}}
    """
    return work_queue_item_id


def calc_work_queue_items_due_in_days():
    """ERROR: Could not parse formula: =DATETIME_DIFF({{DueDate}}, TODAY(), 'days')
    Error: Unknown function: DATETIME_DIFF
    """
    raise NotImplementedError("Formula parsing failed")


# Level 2

def calc_work_queue_items_is_overdue(due_in_days):
    """
    TRUE when DueInDays < 0.
    
    Formula: =IF({{DueInDays}}=BLANK(),FALSE(),{{DueInDays}}<0)
    """
    return (False if (due_in_days == None) else (due_in_days < 0))

def calc_work_queue_items_urgency_bucket(due_in_days):
    """
    URGENT (overdue or due today) / DUE_3_DAYS / UPCOMING / FOLLOW_UP (no due date).
    
    Formula: =IF({{DueInDays}}=BLANK(),"follow-up",IF({{DueInDays}}<=0,"urgent",IF({{DueInDays}}<=3,"due-3-days","upcoming")))
    """
    return ('follow-up' if (due_in_days == None) else ('urgent' if (due_in_days <= 0) else ('due-3-days' if (due_in_days <= 3) else 'upcoming')))

# Level 3

def calc_work_queue_items_is_urgent(urgency_bucket):
    """
    TRUE when UrgencyBucket = URGENT.
    
    Formula: ={{UrgencyBucket}}="urgent" 
    """
    return (urgency_bucket == 'urgent')


def compute_work_queue_items_fields(record: dict) -> dict:
    """Compute all calculated fields for WorkQueueItems."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_work_queue_items_name(result.get('work_queue_item_id'))
    result['due_in_days'] = calc_work_queue_items_due_in_days(result.get('due_date'))

    # Level 2 calculations
    result['is_overdue'] = calc_work_queue_items_is_overdue(result.get('due_in_days'))
    result['urgency_bucket'] = calc_work_queue_items_urgency_bucket(result.get('due_in_days'))

    # Level 3 calculations
    result['is_urgent'] = calc_work_queue_items_is_urgent(result.get('urgency_bucket'))

    # Convert empty strings to None for string fields
    for key in ['name', 'urgency_bucket']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# AIMODELS CALCULATIONS
# =============================================================================

# Level 1

def calc_ai_models_name(ai_model_id):
    """
    Echoes AiModelId.
    
    Formula: ={{AiModelId}}
    """
    return ai_model_id


def compute_ai_models_fields(record: dict) -> dict:
    """Compute all calculated fields for AiModels."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_ai_models_name(result.get('ai_model_id'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# MODELPRICINGVERSIONS CALCULATIONS
# =============================================================================

# Level 1

def calc_model_pricing_versions_name(model_pricing_version_id):
    """
    Echoes ModelPricingVersionId.
    
    Formula: ={{ModelPricingVersionId}}
    """
    return model_pricing_version_id


def compute_model_pricing_versions_fields(record: dict) -> dict:
    """Compute all calculated fields for ModelPricingVersions."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_model_pricing_versions_name(result.get('model_pricing_version_id'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# ASSISTANTTURNS CALCULATIONS
# =============================================================================

# Level 1

def calc_assistant_turns_name(assistant_turn_id):
    """
    Echoes AssistantTurnId.
    
    Formula: ={{AssistantTurnId}}
    """
    return assistant_turn_id


def calc_assistant_turns_total_tokens():
    """ERROR: Could not parse formula: ={{InputTokens}}+{{OutputTokens}}
    Error: '+'
    """
    raise NotImplementedError("Formula parsing failed")



def calc_assistant_turns_billable_input_tokens():
    """ERROR: Could not parse formula: ={{InputTokens}}-{{CachedInputTokens}}
    Error: '-'
    """
    raise NotImplementedError("Formula parsing failed")


# Level 2


def calc_assistant_turns_input_cost():
    """ERROR: Could not parse formula: =(({{BillableInputTokens}}*{{InputPricePerMTok}})+({{CachedInputTokens}}*{{CachedInputPricePerMTok}}))/1000000
    Error: '*'
    """
    raise NotImplementedError("Formula parsing failed")



def calc_assistant_turns_output_cost():
    """ERROR: Could not parse formula: =({{OutputTokens}}*{{OutputPricePerMTok}})/1000000
    Error: '*'
    """
    raise NotImplementedError("Formula parsing failed")



def calc_assistant_turns_total_cost():
    """ERROR: Could not parse formula: ={{InputCost}}+{{OutputCost}}
    Error: '+'
    """
    raise NotImplementedError("Formula parsing failed")



def compute_assistant_turns_fields(record: dict) -> dict:
    """Compute all calculated fields for AssistantTurns."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_assistant_turns_name(result.get('assistant_turn_id'))
    result['total_tokens'] = calc_assistant_turns_total_tokens(result.get('input_tokens'), result.get('output_tokens'))
    result['billable_input_tokens'] = calc_assistant_turns_billable_input_tokens(result.get('input_tokens'), result.get('cached_input_tokens'))

    # Level 2 calculations
    result['input_cost'] = calc_assistant_turns_input_cost(result.get('billable_input_tokens'), result.get('input_price_per_m_tok'), result.get('cached_input_tokens'), result.get('cached_input_price_per_m_tok'))
    result['output_cost'] = calc_assistant_turns_output_cost(result.get('output_tokens'), result.get('output_price_per_m_tok'))
    result['total_cost'] = calc_assistant_turns_total_cost(result.get('input_cost'), result.get('output_cost'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# PLATFORMS CALCULATIONS
# =============================================================================

# Level 1

def calc_platforms_name(platform_id):
    """
    Echoes PlatformId.
    
    Formula: ={{PlatformId}}
    """
    return platform_id


def compute_platforms_fields(record: dict) -> dict:
    """Compute all calculated fields for Platforms."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_platforms_name(result.get('platform_id'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# ERBPACKAGES CALCULATIONS
# =============================================================================

# Level 1

def calc_erb_packages_name(erb_package_id):
    """
    Echoes ERBPackageId.
    
    Formula: ={{ERBPackageId}}
    """
    return erb_package_id

# Level 2


def calc_erb_packages_feature_count():
    """ERROR: Could not parse formula: =COUNT({{ERBFeatures}})
    Error: Unknown function: COUNT
    """
    raise NotImplementedError("Formula parsing failed")



def calc_erb_packages_shipped_feature_count():
    """ERROR: Could not parse formula: =COUNTIF({{ERBFeatures.Status}}, "shipped")
    Error: Unknown function: COUNTIF
    """
    raise NotImplementedError("Formula parsing failed")



def compute_erb_packages_fields(record: dict) -> dict:
    """Compute all calculated fields for ERBPackages."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_erb_packages_name(result.get('erb_package_id'))

    # Level 2 calculations
    result['feature_count'] = calc_erb_packages_feature_count(result.get('erb_features'))
    result['shipped_feature_count'] = calc_erb_packages_shipped_feature_count(result.get('erb_features._status'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# ERBFEATURESTATUSES CALCULATIONS
# =============================================================================

# Level 1

def calc_erb_feature_statuses_name(erb_feature_status_id):
    """
    Echoes ERBFeatureStatusId.
    
    Formula: ={{ERBFeatureStatusId}}
    """
    return erb_feature_status_id


def compute_erb_feature_statuses_fields(record: dict) -> dict:
    """Compute all calculated fields for ERBFeatureStatuses."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_erb_feature_statuses_name(result.get('erb_feature_status_id'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# ERBFEATURECATEGORIES CALCULATIONS
# =============================================================================

# Level 1

def calc_erb_feature_categories_name(erb_feature_category_id):
    """
    Echoes ERBFeatureCategoryId.
    
    Formula: ={{ERBFeatureCategoryId}}
    """
    return erb_feature_category_id


def compute_erb_feature_categories_fields(record: dict) -> dict:
    """Compute all calculated fields for ERBFeatureCategories."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_erb_feature_categories_name(result.get('erb_feature_category_id'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# ERBFEATURES CALCULATIONS
# =============================================================================

# Level 1

def calc_erb_features_name(erb_feature_id):
    """
    Echoes ERBFeatureId.
    
    Formula: ={{ERBFeatureId}}
    """
    return erb_feature_id

# Level 2

def calc_erb_features_relative_path(route_path, erb_feature_id):
    """
    Concrete relative URL for this row — the route template with its :param(s) substituted by this row's own id(s).
    
    Formula: =SUBSTITUTE({{RoutePath}}, ":featureId", {{ERBFeatureId}})
    """
    return ((route_path or "").replace(':featureId', erb_feature_id))


def compute_erb_features_fields(record: dict) -> dict:
    """Compute all calculated fields for ERBFeatures."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_erb_features_name(result.get('erb_feature_id'))

    # Level 2 calculations
    result['relative_path'] = calc_erb_features_relative_path(result.get('route_path'), result.get('erb_feature_id'))

    # Convert empty strings to None for string fields
    for key in ['name', 'relative_path']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# ERBTABLES CALCULATIONS
# =============================================================================

# Level 1

def calc_erb_tables_name(erb_table_id):
    """
    Echoes ERBTableId.
    
    Formula: ={{ERBTableId}}
    """
    return erb_table_id


def calc_erb_tables_admin_can_create():
    """ERROR: Could not parse formula: =IF({{AdminCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("C",{{AdminCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_erb_tables_admin_can_read():
    """ERROR: Could not parse formula: =IF({{AdminCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("R",{{AdminCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_erb_tables_admin_can_update():
    """ERROR: Could not parse formula: =IF({{AdminCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("U",{{AdminCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_erb_tables_admin_can_delete():
    """ERROR: Could not parse formula: =IF({{AdminCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("D",{{AdminCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_erb_tables_manager_can_create():
    """ERROR: Could not parse formula: =IF({{ManagerCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("C",{{ManagerCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_erb_tables_manager_can_read():
    """ERROR: Could not parse formula: =IF({{ManagerCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("R",{{ManagerCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_erb_tables_manager_can_update():
    """ERROR: Could not parse formula: =IF({{ManagerCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("U",{{ManagerCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_erb_tables_manager_can_delete():
    """ERROR: Could not parse formula: =IF({{ManagerCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("D",{{ManagerCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_erb_tables_representative_can_create():
    """ERROR: Could not parse formula: =IF({{RepresentativeCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("C",{{RepresentativeCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_erb_tables_representative_can_read():
    """ERROR: Could not parse formula: =IF({{RepresentativeCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("R",{{RepresentativeCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_erb_tables_representative_can_update():
    """ERROR: Could not parse formula: =IF({{RepresentativeCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("U",{{RepresentativeCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_erb_tables_representative_can_delete():
    """ERROR: Could not parse formula: =IF({{RepresentativeCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("D",{{RepresentativeCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_erb_tables_external_llm_can_create():
    """ERROR: Could not parse formula: =IF({{ExternalLlmCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("C",{{ExternalLlmCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_erb_tables_external_llm_can_read():
    """ERROR: Could not parse formula: =IF({{ExternalLlmCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("R",{{ExternalLlmCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_erb_tables_external_llm_can_update():
    """ERROR: Could not parse formula: =IF({{ExternalLlmCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("U",{{ExternalLlmCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_erb_tables_external_llm_can_delete():
    """ERROR: Could not parse formula: =IF({{ExternalLlmCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("D",{{ExternalLlmCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def compute_erb_tables_fields(record: dict) -> dict:
    """Compute all calculated fields for ERBTables."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_erb_tables_name(result.get('erb_table_id'))
    result['admin_can_create'] = calc_erb_tables_admin_can_create(result.get('admin_crud'))
    result['admin_can_read'] = calc_erb_tables_admin_can_read(result.get('admin_crud'))
    result['admin_can_update'] = calc_erb_tables_admin_can_update(result.get('admin_crud'))
    result['admin_can_delete'] = calc_erb_tables_admin_can_delete(result.get('admin_crud'))
    result['manager_can_create'] = calc_erb_tables_manager_can_create(result.get('manager_crud'))
    result['manager_can_read'] = calc_erb_tables_manager_can_read(result.get('manager_crud'))
    result['manager_can_update'] = calc_erb_tables_manager_can_update(result.get('manager_crud'))
    result['manager_can_delete'] = calc_erb_tables_manager_can_delete(result.get('manager_crud'))
    result['representative_can_create'] = calc_erb_tables_representative_can_create(result.get('representative_crud'))
    result['representative_can_read'] = calc_erb_tables_representative_can_read(result.get('representative_crud'))
    result['representative_can_update'] = calc_erb_tables_representative_can_update(result.get('representative_crud'))
    result['representative_can_delete'] = calc_erb_tables_representative_can_delete(result.get('representative_crud'))
    result['external_llm_can_create'] = calc_erb_tables_external_llm_can_create(result.get('external_llm_crud'))
    result['external_llm_can_read'] = calc_erb_tables_external_llm_can_read(result.get('external_llm_crud'))
    result['external_llm_can_update'] = calc_erb_tables_external_llm_can_update(result.get('external_llm_crud'))
    result['external_llm_can_delete'] = calc_erb_tables_external_llm_can_delete(result.get('external_llm_crud'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# ERBFIELDS CALCULATIONS
# =============================================================================

# Level 1

def calc_erb_fields_name(erb_field_id):
    """
    Echoes ERBFieldId.
    
    Formula: ={{ERBFieldId}}
    """
    return erb_field_id

def calc_erb_fields_is_calculated(field_type):
    """
    TRUE for calculated/lookup/aggregation (read-only at the data layer).
    
    Formula: =OR({{FieldType}}="calculated",{{FieldType}}="lookup",{{FieldType}}="aggregation")
    """
    return ((field_type == 'calculated') or (field_type == 'lookup') or (field_type == 'aggregation'))


def calc_erb_fields_admin_can_create():
    """ERROR: Could not parse formula: =IF({{AdminCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("C",{{AdminCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_erb_fields_admin_can_read():
    """ERROR: Could not parse formula: =IF({{AdminCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("R",{{AdminCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_erb_fields_admin_can_update():
    """ERROR: Could not parse formula: =IF({{AdminCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("U",{{AdminCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_erb_fields_admin_can_delete():
    """ERROR: Could not parse formula: =IF({{AdminCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("D",{{AdminCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_erb_fields_manager_can_create():
    """ERROR: Could not parse formula: =IF({{ManagerCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("C",{{ManagerCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_erb_fields_manager_can_read():
    """ERROR: Could not parse formula: =IF({{ManagerCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("R",{{ManagerCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_erb_fields_manager_can_update():
    """ERROR: Could not parse formula: =IF({{ManagerCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("U",{{ManagerCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_erb_fields_manager_can_delete():
    """ERROR: Could not parse formula: =IF({{ManagerCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("D",{{ManagerCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_erb_fields_representative_can_create():
    """ERROR: Could not parse formula: =IF({{RepresentativeCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("C",{{RepresentativeCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_erb_fields_representative_can_read():
    """ERROR: Could not parse formula: =IF({{RepresentativeCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("R",{{RepresentativeCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_erb_fields_representative_can_update():
    """ERROR: Could not parse formula: =IF({{RepresentativeCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("U",{{RepresentativeCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_erb_fields_representative_can_delete():
    """ERROR: Could not parse formula: =IF({{RepresentativeCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("D",{{RepresentativeCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_erb_fields_external_llm_can_create():
    """ERROR: Could not parse formula: =IF({{ExternalLlmCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("C",{{ExternalLlmCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_erb_fields_external_llm_can_read():
    """ERROR: Could not parse formula: =IF({{ExternalLlmCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("R",{{ExternalLlmCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_erb_fields_external_llm_can_update():
    """ERROR: Could not parse formula: =IF({{ExternalLlmCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("U",{{ExternalLlmCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def calc_erb_fields_external_llm_can_delete():
    """ERROR: Could not parse formula: =IF({{ExternalLlmCRUD}}=BLANK(),BLANK(),NOT(ISERROR(FIND("D",{{ExternalLlmCRUD}}))))
    Error: Unknown function: ISERROR
    """
    raise NotImplementedError("Formula parsing failed")



def compute_erb_fields_fields(record: dict) -> dict:
    """Compute all calculated fields for ERBFields."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_erb_fields_name(result.get('erb_field_id'))
    result['is_calculated'] = calc_erb_fields_is_calculated(result.get('field_type'))
    result['admin_can_create'] = calc_erb_fields_admin_can_create(result.get('admin_crud'))
    result['admin_can_read'] = calc_erb_fields_admin_can_read(result.get('admin_crud'))
    result['admin_can_update'] = calc_erb_fields_admin_can_update(result.get('admin_crud'))
    result['admin_can_delete'] = calc_erb_fields_admin_can_delete(result.get('admin_crud'))
    result['manager_can_create'] = calc_erb_fields_manager_can_create(result.get('manager_crud'))
    result['manager_can_read'] = calc_erb_fields_manager_can_read(result.get('manager_crud'))
    result['manager_can_update'] = calc_erb_fields_manager_can_update(result.get('manager_crud'))
    result['manager_can_delete'] = calc_erb_fields_manager_can_delete(result.get('manager_crud'))
    result['representative_can_create'] = calc_erb_fields_representative_can_create(result.get('representative_crud'))
    result['representative_can_read'] = calc_erb_fields_representative_can_read(result.get('representative_crud'))
    result['representative_can_update'] = calc_erb_fields_representative_can_update(result.get('representative_crud'))
    result['representative_can_delete'] = calc_erb_fields_representative_can_delete(result.get('representative_crud'))
    result['external_llm_can_create'] = calc_erb_fields_external_llm_can_create(result.get('external_llm_crud'))
    result['external_llm_can_read'] = calc_erb_fields_external_llm_can_read(result.get('external_llm_crud'))
    result['external_llm_can_update'] = calc_erb_fields_external_llm_can_update(result.get('external_llm_crud'))
    result['external_llm_can_delete'] = calc_erb_fields_external_llm_can_delete(result.get('external_llm_crud'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# APIENDPOINTS CALCULATIONS
# =============================================================================

# Level 1

def calc_api_endpoints_name(api_endpoint_id):
    """
    Echoes APIEndpointId.
    
    Formula: ={{APIEndpointId}}
    """
    return api_endpoint_id


def compute_api_endpoints_fields(record: dict) -> dict:
    """Compute all calculated fields for APIEndpoints."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_api_endpoints_name(result.get('api_endpoint_id'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# SUBJECTSTATEINSTANCES CALCULATIONS
# =============================================================================

# Level 1

def calc_subject_state_instances_name(subject_state_instance_id):
    """
    Echoes SubjectStateInstanceId.
    
    Formula: ={{SubjectStateInstanceId}}
    """
    return subject_state_instance_id


def calc_subject_state_instances_is_current():
    """ERROR: Could not parse formula: =ISBLANK({{ExitedAt}})
    Error: Unknown function: ISBLANK
    """
    raise NotImplementedError("Formula parsing failed")


def calc_subject_state_instances_has_complete_lineage(sequence_index):
    """
    TRUE when the PriorInstance chain walks back to SequenceIndex=1 (the initial state occupancy). Validates lineage completeness.
    
    Formula: ={{SequenceIndex}}>=1
    """
    return (sequence_index >= 1)


def compute_subject_state_instances_fields(record: dict) -> dict:
    """Compute all calculated fields for SubjectStateInstances."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_subject_state_instances_name(result.get('subject_state_instance_id'))
    result['is_current'] = calc_subject_state_instances_is_current(result.get('exited_at'))
    result['has_complete_lineage'] = calc_subject_state_instances_has_complete_lineage(result.get('sequence_index'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# VIOLATIONTYPES CALCULATIONS
# =============================================================================

# Level 1

def calc_violation_types_name(code):
    """
    Kebab-cased PK derived from the violation code (e.g. 'CVC-22350' -> 'cvc-22350').
    
    Formula: =SUBSTITUTE(LOWER({{Code}}), " ", "-")
    """
    return ((((code or "").lower()) or "").replace(' ', '-'))

# Level 2

def calc_violation_types_is_school_eligible_by_cap(points, traffic_school_point_cap):
    """
    Whether this violation's points fall at or below the jurisdiction's traffic-school point cap (jurisdiction rule applied to the violation).
    
    Formula: =IF({{Points}} <= {{TrafficSchoolPointCap}}, TRUE, FALSE)
    """
    return (True if (points <= traffic_school_point_cap) else False)


def compute_violation_types_fields(record: dict) -> dict:
    """Compute all calculated fields for ViolationTypes."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_violation_types_name(result.get('code'))

    # Level 2 calculations
    result['is_school_eligible_by_cap'] = calc_violation_types_is_school_eligible_by_cap(result.get('points'), result.get('traffic_school_point_cap'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# DRIVERS CALCULATIONS
# =============================================================================

# Level 1

def calc_drivers_name(license_number):
    """
    Kebab-cased PK derived from the license number (e.g. 'D1234567' -> 'd1234567').
    
    Formula: =SUBSTITUTE(LOWER({{LicenseNumber}}), " ", "-")
    """
    return ((((license_number or "").lower()) or "").replace(' ', '-'))

def calc_drivers_full_name(last_name, first_name):
    """
    Display name, last-comma-first.
    
    Formula: ={{LastName}} & ", " & {{FirstName}}
    """
    return (str(last_name or "") + ', ' + str(first_name or ""))

# Level 2

def calc_drivers_license_status(active_points, suspension_threshold, warning_threshold):
    """
    License-points state machine for the driver: Suspended at/above the suspension threshold, Warning at/above the warning threshold, otherwise Valid.
    
    Formula: =IF({{ActivePoints}} >= {{SuspensionThreshold}}, "Suspended", IF({{ActivePoints}} >= {{WarningThreshold}}, "Warning", "Valid"))
    """
    return ('Suspended' if (active_points >= suspension_threshold) else ('Warning' if (active_points >= warning_threshold) else 'Valid'))


def compute_drivers_fields(record: dict) -> dict:
    """Compute all calculated fields for Drivers."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_drivers_name(result.get('license_number'))
    result['full_name'] = calc_drivers_full_name(result.get('last_name'), result.get('first_name'))

    # Level 2 calculations
    result['license_status'] = calc_drivers_license_status(result.get('active_points'), result.get('suspension_threshold'), result.get('warning_threshold'))

    # Convert empty strings to None for string fields
    for key in ['name', 'full_name', 'license_status']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# CITATIONS CALCULATIONS
# =============================================================================

# Level 1

def calc_citations_name(citation_number):
    """
    Kebab-cased PK derived from the citation number (e.g. 'TC-2026-0001' -> 'tc-2026-0001').
    
    Formula: =SUBSTITUTE(LOWER({{CitationNumber}}), " ", "-")
    """
    return ((((citation_number or "").lower()) or "").replace(' ', '-'))

# Level 2


def calc_citations_response_due_date():
    """ERROR: Could not parse formula: ={{IssuedOn}} + {{DaysToRespond}}
    Error: '+'
    """
    raise NotImplementedError("Formula parsing failed")



def calc_citations_days_until_response_due():
    """ERROR: Could not parse formula: =DAYS({{ResponseDueDate}}, {{AsOfDate}})
    Error: Unknown function: DAYS
    """
    raise NotImplementedError("Formula parsing failed")



def calc_citations_is_response_overdue():
    """ERROR: Could not parse formula: =IF(AND(ISBLANK({{RespondedOn}}), {{AsOfDate}} > {{ResponseDueDate}}), TRUE, FALSE)
    Error: Unknown function: ISBLANK
    """
    raise NotImplementedError("Formula parsing failed")



def calc_citations_contest_status():
    """ERROR: Could not parse formula: =IF(NOT({{ContestRequested}}), "NotContested", IF({{CountOfHearings}} = 0, "HearingRequested", IF(OR({{LatestHearingOutcome}} = "Pending", ISBLANK({{LatestHearingOutcome}})), "Scheduled", "Heard")))
    Error: Unknown function: ISBLANK
    """
    raise NotImplementedError("Formula parsing failed")


def calc_citations_is_dismissed(latest_hearing_outcome):
    """
    True when the latest hearing outcome dismissed the citation.
    
    Formula: =IF({{LatestHearingOutcome}} = "Dismissed", TRUE, FALSE)
    """
    return (True if (latest_hearing_outcome == 'Dismissed') else False)

def calc_citations_is_guilty(latest_hearing_outcome, is_response_overdue, contest_requested):
    """
    True when the driver is liable: either found guilty/upheld at hearing, or defaulted by missing the response deadline without contesting.
    
    Formula: =IF(OR({{LatestHearingOutcome}} = "Guilty", {{LatestHearingOutcome}} = "Upheld", AND({{IsResponseOverdue}}, NOT({{ContestRequested}}))), TRUE, FALSE)
    """
    return (True if ((latest_hearing_outcome == 'Guilty') or (latest_hearing_outcome == 'Upheld') or ((is_response_overdue is True) and (contest_requested is not True))) else False)


def calc_citations_amount_due_usd():
    """ERROR: Could not parse formula: =IF({{IsDismissed}}, 0, IF({{IsPaymentLate}}, {{BaseFineUsd}} * (1 + {{LatePenaltyPct}}), {{BaseFineUsd}}))
    Error: '+'
    """
    raise NotImplementedError("Formula parsing failed")



def calc_citations_payment_due_date():
    """ERROR: Could not parse formula: =DATEVALUE({{ResponseDueDate}}) + {{DaysToPayAfterRuling}}
    Error: Unknown function: DATEVALUE
    """
    raise NotImplementedError("Formula parsing failed")



def calc_citations_is_payment_late():
    """ERROR: Could not parse formula: =IF(AND({{IsGuilty}}, ISBLANK({{PaidOn}}), {{AsOfDate}} > {{PaymentDueDate}}), TRUE, FALSE)
    Error: Unknown function: ISBLANK
    """
    raise NotImplementedError("Formula parsing failed")



def calc_citations_is_in_collections():
    """ERROR: Could not parse formula: =IF(AND({{IsPaymentLate}}, {{AsOfDate}} > DATEVALUE({{PaymentDueDate}}) + {{DaysLateToCollections}}), TRUE, FALSE)
    Error: Unknown function: DATEVALUE
    """
    raise NotImplementedError("Formula parsing failed")



def calc_citations_payment_status():
    """ERROR: Could not parse formula: =IF({{IsDismissed}}, "NotOwed", IF(NOT(ISBLANK({{PaidOn}})), "Paid", IF({{IsInCollections}}, "Collections", IF({{IsPaymentLate}}, "Late", IF({{IsGuilty}}, "Due", "Pending")))))
    Error: Unknown function: ISBLANK
    """
    raise NotImplementedError("Formula parsing failed")


def calc_citations_effective_points(is_guilty, is_dismissed, violation_points):
    """
    License points this citation actually contributes to the driver: the violation's points if the driver is liable and not dismissed, otherwise 0. Drives the driver's ActivePoints rollup.
    
    Formula: =IF(AND({{IsGuilty}}, NOT({{IsDismissed}})), {{ViolationPoints}}, 0)
    """
    return (violation_points if ((is_guilty is True) and (is_dismissed is not True)) else 0)


def calc_citations_citation_status():
    """ERROR: Could not parse formula: =IF(OR(NOT(ISBLANK({{PaidOn}})), {{IsDismissed}}), "Closed", IF(OR({{LatestHearingOutcome}} = "Guilty", {{LatestHearingOutcome}} = "Upheld", AND({{IsResponseOverdue}}, NOT({{ContestRequested}}))), "Adjudicated", IF(AND({{ContestRequested}}, {{CountOfHearings}} > 0), "InContest", IF(NOT(ISBLANK({{RespondedOn}})), "Responded", "Issued"))))
    Error: Unknown function: ISBLANK
    """
    raise NotImplementedError("Formula parsing failed")



def compute_citations_fields(record: dict) -> dict:
    """Compute all calculated fields for Citations."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_citations_name(result.get('citation_number'))

    # Level 2 calculations
    result['response_due_date'] = calc_citations_response_due_date(result.get('issued_on'), result.get('days_to_respond'))
    result['days_until_response_due'] = calc_citations_days_until_response_due(result.get('response_due_date'), result.get('as_of_date'))
    result['is_response_overdue'] = calc_citations_is_response_overdue(result.get('responded_on'), result.get('as_of_date'), result.get('response_due_date'))
    result['contest_status'] = calc_citations_contest_status(result.get('contest_requested'), result.get('count_of_hearings'), result.get('latest_hearing_outcome'))
    result['is_dismissed'] = calc_citations_is_dismissed(result.get('latest_hearing_outcome'))
    result['is_guilty'] = calc_citations_is_guilty(result.get('latest_hearing_outcome'), result.get('is_response_overdue'), result.get('contest_requested'))
    result['amount_due_usd'] = calc_citations_amount_due_usd(result.get('is_dismissed'), result.get('is_payment_late'), result.get('base_fine_usd'), result.get('late_penalty_pct'))
    result['payment_due_date'] = calc_citations_payment_due_date(result.get('response_due_date'), result.get('days_to_pay_after_ruling'))
    result['is_payment_late'] = calc_citations_is_payment_late(result.get('is_guilty'), result.get('paid_on'), result.get('as_of_date'), result.get('payment_due_date'))
    result['is_in_collections'] = calc_citations_is_in_collections(result.get('is_payment_late'), result.get('as_of_date'), result.get('payment_due_date'), result.get('days_late_to_collections'))
    result['payment_status'] = calc_citations_payment_status(result.get('is_dismissed'), result.get('paid_on'), result.get('is_in_collections'), result.get('is_payment_late'), result.get('is_guilty'))
    result['effective_points'] = calc_citations_effective_points(result.get('is_guilty'), result.get('is_dismissed'), result.get('violation_points'))
    result['citation_status'] = calc_citations_citation_status(result.get('paid_on'), result.get('is_dismissed'), result.get('latest_hearing_outcome'), result.get('is_response_overdue'), result.get('contest_requested'), result.get('count_of_hearings'), result.get('responded_on'))

    # Convert empty strings to None for string fields
    for key in ['name', 'contest_status', 'payment_status', 'citation_status']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# HEARINGS CALCULATIONS
# =============================================================================

# Level 1

def calc_hearings_name(hearing_number):
    """
    Kebab-cased PK derived from the hearing reference number.
    
    Formula: =SUBSTITUTE(LOWER({{HearingNumber}}), " ", "-")
    """
    return ((((hearing_number or "").lower()) or "").replace(' ', '-'))


def compute_hearings_fields(record: dict) -> dict:
    """Compute all calculated fields for Hearings."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_hearings_name(result.get('hearing_number'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# PAYMENTS CALCULATIONS
# =============================================================================

# Level 1

def calc_payments_name(payment_number):
    """
    Kebab-cased PK derived from the payment reference number.
    
    Formula: =SUBSTITUTE(LOWER({{PaymentNumber}}), " ", "-")
    """
    return ((((payment_number or "").lower()) or "").replace(' ', '-'))


def compute_payments_fields(record: dict) -> dict:
    """Compute all calculated fields for Payments."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_payments_name(result.get('payment_number'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# CASEEVENTS CALCULATIONS
# =============================================================================

# Level 1

def calc_case_events_name(event_number):
    """
    Kebab-cased PK derived from the event reference number.
    
    Formula: =SUBSTITUTE(LOWER({{EventNumber}}), " ", "-")
    """
    return ((((event_number or "").lower()) or "").replace(' ', '-'))


def compute_case_events_fields(record: dict) -> dict:
    """Compute all calculated fields for CaseEvents."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_case_events_name(result.get('event_number'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# __META__ CALCULATIONS
# =============================================================================

# Level 1

def calc___meta___name(meta_key):
    """
    Mirrors MetaKey as the row's Name.
    
    Formula: ={{MetaKey}}
    """
    return meta_key


def compute___meta___fields(record: dict) -> dict:
    """Compute all calculated fields for __meta__."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc___meta___name(result.get('meta_key'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# TESTCATEGORY CALCULATIONS
# =============================================================================

# Level 1

def calc_test_category_name(test_category_id):
    """
    Echoes TestCategoryId.
    
    Formula: ={{TestCategoryId}}
    """
    return test_category_id


def compute_test_category_fields(record: dict) -> dict:
    """Compute all calculated fields for TestCategory."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_test_category_name(result.get('test_category_id'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# TESTSURFACE CALCULATIONS
# =============================================================================

# Level 1

def calc_test_surface_name(test_surface_id):
    """
    Echoes TestSurfaceId.
    
    Formula: ={{TestSurfaceId}}
    """
    return test_surface_id


def compute_test_surface_fields(record: dict) -> dict:
    """Compute all calculated fields for TestSurface."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_test_surface_name(result.get('test_surface_id'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# TESTTECHNOLOGY CALCULATIONS
# =============================================================================

# Level 1

def calc_test_technology_name(test_technology_id):
    """
    Echoes TestTechnologyId.
    
    Formula: ={{TestTechnologyId}}
    """
    return test_technology_id


def compute_test_technology_fields(record: dict) -> dict:
    """Compute all calculated fields for TestTechnology."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_test_technology_name(result.get('test_technology_id'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# TESTCASE CALCULATIONS
# =============================================================================

# Level 1

def calc_test_case_name(test_case_id):
    """
    Echoes TestCaseId.
    
    Formula: ={{TestCaseId}}
    """
    return test_case_id


def compute_test_case_fields(record: dict) -> dict:
    """Compute all calculated fields for TestCase."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_test_case_name(result.get('test_case_id'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# TESTEXPECTATION CALCULATIONS
# =============================================================================

# Level 1

def calc_test_expectation_name(test_expectation_id):
    """
    Echoes TestExpectationId.
    
    Formula: ={{TestExpectationId}}
    """
    return test_expectation_id


def compute_test_expectation_fields(record: dict) -> dict:
    """Compute all calculated fields for TestExpectation."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_test_expectation_name(result.get('test_expectation_id'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# TESTRUN CALCULATIONS
# =============================================================================

# Level 1

def calc_test_run_name(test_run_id):
    """
    Echoes TestRunId.
    
    Formula: ={{TestRunId}}
    """
    return test_run_id


def compute_test_run_fields(record: dict) -> dict:
    """Compute all calculated fields for TestRun."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_test_run_name(result.get('test_run_id'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# TESTRESULT CALCULATIONS
# =============================================================================

# Level 1

def calc_test_result_name(test_result_id):
    """
    Echoes TestResultId.
    
    Formula: ={{TestResultId}}
    """
    return test_result_id


def compute_test_result_fields(record: dict) -> dict:
    """Compute all calculated fields for TestResult."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_test_result_name(result.get('test_result_id'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# TESTRESULTASSERTION CALCULATIONS
# =============================================================================

# Level 1

def calc_test_result_assertion_name(test_result_assertion_id):
    """
    Echoes TestResultAssertionId.
    
    Formula: ={{TestResultAssertionId}}
    """
    return test_result_assertion_id


def compute_test_result_assertion_fields(record: dict) -> dict:
    """Compute all calculated fields for TestResultAssertion."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_test_result_assertion_name(result.get('test_result_assertion_id'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# SCREENLAYOUTS CALCULATIONS
# =============================================================================

# Level 1

def calc_screen_layouts_name(screen_layout_id):
    """
    Echoes ScreenLayoutId.
    
    Formula: ={{ScreenLayoutId}}
    """
    return screen_layout_id


def compute_screen_layouts_fields(record: dict) -> dict:
    """Compute all calculated fields for ScreenLayouts."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_screen_layouts_name(result.get('screen_layout_id'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# SCREENSECTIONS CALCULATIONS
# =============================================================================

# Level 1

def calc_screen_sections_name(screen_section_id):
    """
    Echoes ScreenSectionId.
    
    Formula: ={{ScreenSectionId}}
    """
    return screen_section_id


def compute_screen_sections_fields(record: dict) -> dict:
    """Compute all calculated fields for ScreenSections."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_screen_sections_name(result.get('screen_section_id'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# FIELDDISPLAYHINTS CALCULATIONS
# =============================================================================

# Level 1

def calc_field_display_hints_name(field_display_hint_id):
    """
    Echoes FieldDisplayHintId.
    
    Formula: ={{FieldDisplayHintId}}
    """
    return field_display_hint_id


def compute_field_display_hints_fields(record: dict) -> dict:
    """Compute all calculated fields for FieldDisplayHints."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_field_display_hints_name(result.get('field_display_hint_id'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# FEESCHEDULES CALCULATIONS
# =============================================================================

# Level 1

def calc_fee_schedules_name(fee_schedule_id):
    """
    Echoes FeeScheduleId.
    
    Formula: ={{FeeScheduleId}}
    """
    return fee_schedule_id


def compute_fee_schedules_fields(record: dict) -> dict:
    """Compute all calculated fields for FeeSchedules."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_fee_schedules_name(result.get('fee_schedule_id'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# DEADLINERULES CALCULATIONS
# =============================================================================

# Level 1

def calc_deadline_rules_name(deadline_rule_id):
    """
    Echoes DeadlineRuleId.
    
    Formula: ={{DeadlineRuleId}}
    """
    return deadline_rule_id


def compute_deadline_rules_fields(record: dict) -> dict:
    """Compute all calculated fields for DeadlineRules."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_deadline_rules_name(result.get('deadline_rule_id'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# CONTESTGROUNDS CALCULATIONS
# =============================================================================

# Level 1

def calc_contest_grounds_name(contest_ground_id):
    """
    Echoes ContestGroundId.
    
    Formula: ={{ContestGroundId}}
    """
    return contest_ground_id


def compute_contest_grounds_fields(record: dict) -> dict:
    """Compute all calculated fields for ContestGrounds."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_contest_grounds_name(result.get('contest_ground_id'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# DRIVERLICENSEPOINTS CALCULATIONS
# =============================================================================

# Level 1

def calc_driver_license_points_name(driver_license_point_id):
    """
    Echoes DriverLicensePointId.
    
    Formula: ={{DriverLicensePointId}}
    """
    return driver_license_point_id


def compute_driver_license_points_fields(record: dict) -> dict:
    """Compute all calculated fields for DriverLicensePoints."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_driver_license_points_name(result.get('driver_license_point_id'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result

# =============================================================================
# BUILDPHASES CALCULATIONS
# =============================================================================

# Level 1

def calc_build_phases_name(build_phase_id):
    """
    Echoes BuildPhaseId.
    
    Formula: ={{BuildPhaseId}}
    """
    return build_phase_id


def compute_build_phases_fields(record: dict) -> dict:
    """Compute all calculated fields for BuildPhases."""
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_build_phases_name(result.get('build_phase_id'))

    # Convert empty strings to None for string fields
    for key in ['name']:
        if result.get(key) == '':
            result[key] = None

    return result


# =============================================================================
# DISPATCHER FUNCTION
# =============================================================================

def compute_all_calculated_fields(record: dict, entity_name: str = None) -> dict:
    """
    Compute all calculated fields for a record.
    
    This is the main entry point for computing calculated fields.
    It routes to the appropriate entity-specific compute function.
    
    Args:
        record: The record dict with raw field values
        entity_name: Entity name (snake_case or PascalCase)
    
    Returns:
        Record dict with calculated fields filled in
    """
    if entity_name is None:
        # No entity specified - return record unchanged
        return dict(record)

    # Normalize to snake_case to support "LineItem", "line_item", "line-item"
    entity_lower = entity_name.lower().replace('-', '_')

    if entity_lower == 'business_rules':
        return compute_business_rules_fields(record)
    elif entity_lower == 'business_rule_categories':
        return compute_business_rule_categories_fields(record)
    elif entity_lower == 'glossary_categories':
        return compute_glossary_categories_fields(record)
    elif entity_lower == 'glossary_terms':
        return compute_glossary_terms_fields(record)
    elif entity_lower == 'roles':
        return compute_roles_fields(record)
    elif entity_lower == 'audit_log_entries':
        return compute_audit_log_entries_fields(record)
    elif entity_lower == 'platform_naviation':
        return compute_platform_naviation_fields(record)
    elif entity_lower == 'jurisdictions':
        return compute_jurisdictions_fields(record)
    elif entity_lower == 'jurisdiction_source_documents':
        return compute_jurisdiction_source_documents_fields(record)
    elif entity_lower == 'jurisdiction_rules':
        return compute_jurisdiction_rules_fields(record)
    elif entity_lower == 'app_users':
        return compute_app_users_fields(record)
    elif entity_lower == 'site_branding':
        return compute_site_branding_fields(record)
    elif entity_lower == 'reference_documents':
        return compute_reference_documents_fields(record)
    elif entity_lower == 'state_machines':
        return compute_state_machines_fields(record)
    elif entity_lower == 'machine_states':
        return compute_machine_states_fields(record)
    elif entity_lower == 'state_transition_rules':
        return compute_state_transition_rules_fields(record)
    elif entity_lower == 'state_transitions':
        return compute_state_transitions_fields(record)
    elif entity_lower == 'work_queue_items':
        return compute_work_queue_items_fields(record)
    elif entity_lower == 'ai_models':
        return compute_ai_models_fields(record)
    elif entity_lower == 'model_pricing_versions':
        return compute_model_pricing_versions_fields(record)
    elif entity_lower == 'assistant_turns':
        return compute_assistant_turns_fields(record)
    elif entity_lower == 'platforms':
        return compute_platforms_fields(record)
    elif entity_lower == 'erb_packages':
        return compute_erb_packages_fields(record)
    elif entity_lower == 'erb_feature_statuses':
        return compute_erb_feature_statuses_fields(record)
    elif entity_lower == 'erb_feature_categories':
        return compute_erb_feature_categories_fields(record)
    elif entity_lower == 'erb_features':
        return compute_erb_features_fields(record)
    elif entity_lower == 'erb_tables':
        return compute_erb_tables_fields(record)
    elif entity_lower == 'erb_fields':
        return compute_erb_fields_fields(record)
    elif entity_lower == 'api_endpoints':
        return compute_api_endpoints_fields(record)
    elif entity_lower == 'subject_state_instances':
        return compute_subject_state_instances_fields(record)
    elif entity_lower == 'violation_types':
        return compute_violation_types_fields(record)
    elif entity_lower == 'drivers':
        return compute_drivers_fields(record)
    elif entity_lower == 'citations':
        return compute_citations_fields(record)
    elif entity_lower == 'hearings':
        return compute_hearings_fields(record)
    elif entity_lower == 'payments':
        return compute_payments_fields(record)
    elif entity_lower == 'case_events':
        return compute_case_events_fields(record)
    elif entity_lower == '__meta__':
        return compute___meta___fields(record)
    elif entity_lower == 'test_category':
        return compute_test_category_fields(record)
    elif entity_lower == 'test_surface':
        return compute_test_surface_fields(record)
    elif entity_lower == 'test_technology':
        return compute_test_technology_fields(record)
    elif entity_lower == 'test_case':
        return compute_test_case_fields(record)
    elif entity_lower == 'test_expectation':
        return compute_test_expectation_fields(record)
    elif entity_lower == 'test_run':
        return compute_test_run_fields(record)
    elif entity_lower == 'test_result':
        return compute_test_result_fields(record)
    elif entity_lower == 'test_result_assertion':
        return compute_test_result_assertion_fields(record)
    elif entity_lower == 'screen_layouts':
        return compute_screen_layouts_fields(record)
    elif entity_lower == 'screen_sections':
        return compute_screen_sections_fields(record)
    elif entity_lower == 'field_display_hints':
        return compute_field_display_hints_fields(record)
    elif entity_lower == 'fee_schedules':
        return compute_fee_schedules_fields(record)
    elif entity_lower == 'deadline_rules':
        return compute_deadline_rules_fields(record)
    elif entity_lower == 'contest_grounds':
        return compute_contest_grounds_fields(record)
    elif entity_lower == 'driver_license_points':
        return compute_driver_license_points_fields(record)
    elif entity_lower == 'build_phases':
        return compute_build_phases_fields(record)
    else:
        raise KeyError(f"compute_all_calculated_fields called with unknown entity {entity_name!r}. "f"Known entities in this generated erb_calc.py: ['business_rules', 'business_rule_categories', 'glossary_categories', 'glossary_terms', 'roles', 'audit_log_entries', 'platform_naviation', 'jurisdictions', 'jurisdiction_source_documents', 'jurisdiction_rules', 'app_users', 'site_branding', 'reference_documents', 'state_machines', 'machine_states', 'state_transition_rules', 'state_transitions', 'work_queue_items', 'ai_models', 'model_pricing_versions', 'assistant_turns', 'platforms', 'erb_packages', 'erb_feature_statuses', 'erb_feature_categories', 'erb_features', 'erb_tables', 'erb_fields', 'api_endpoints', 'subject_state_instances', 'violation_types', 'drivers', 'citations', 'hearings', 'payments', 'case_events', '__meta__', 'test_category', 'test_surface', 'test_technology', 'test_case', 'test_expectation', 'test_run', 'test_result', 'test_result_assertion', 'screen_layouts', 'screen_sections', 'field_display_hints', 'fee_schedules', 'deadline_rules', 'contest_grounds', 'driver_license_points', 'build_phases']. "f"Check that the rulebook used to generate this file matches the data being computed.")

# =============================================================================
# INDEX/MATCH LOOKUP INTERPRETER (PYTHON SIMULATOR — DO NOT CALL FROM OTHER SUBSTRATES)
# =============================================================================


def parse_index_match_formula(formula: str) -> tuple:
    """
    Parse an INDEX/MATCH formula to extract the lookup components.

    Formula format: =INDEX(Table!{{FieldToReturn}}, MATCH(CurrentTable!{{KeyField}}, Table!{{PrimaryKeyField}}, 0))
    Returns: (lookup_table, return_field, key_field, pk_field) or all None.
    """
    pattern = r"=INDEX\((\w+)!\{\{(\w+)\}\},\s*MATCH\(\w+!\{\{(\w+)\}\},\s*(\w+)!\{\{(\w+)\}\},\s*0\)\)"
    match = re.match(pattern, formula)
    if match:
        return (match.group(1), match.group(2), match.group(3), match.group(5))
    return (None, None, None, None)


def parse_countifs_formula(formula: str) -> tuple:
    """Parse =COUNTIFS(RelatedTable!{{LookupField}}, CurrentTable!{{MatchField}})."""
    pattern = r"=COUNTIFS\((\w+)!\{\{(\w+)\}\},\s*\w+!\{\{(\w+)\}\}\)"
    match = re.match(pattern, formula)
    if match:
        return (match.group(1), match.group(2), match.group(3))
    return (None, None, None)


def parse_sumifs_formula(formula: str) -> tuple:
    """Parse =SUMIFS(RelatedTable!{{SumField}}, RelatedTable!{{CriteriaField}}, CurrentTable!{{MatchField}})."""
    pattern = r"=SUMIFS\((\w+)!\{\{(\w+)\}\},\s*(\w+)!\{\{(\w+)\}\},\s*\w+!\{\{(\w+)\}\}\)"
    match = re.match(pattern, formula)
    if match:
        return (match.group(1), match.group(2), match.group(4), match.group(5))
    return (None, None, None, None)


def _get_testing_dir(project_root: Path) -> Path:
    """Return the active domain's testing/ dir. ERB_TESTING_DIR is required.

    The injector runs at build time and must operate on the same domain the
    orchestrator chose. There is no implicit per-substrate testing dir.
    """
    import os
    erb = os.environ.get("ERB_TESTING_DIR")
    if not erb:
        raise RuntimeError(
            "ERB_TESTING_DIR is not set. inject-into-python.py must be invoked "
            "by the orchestrator with ERB_TESTING_DIR pointing at the active "
            "domain's testing/ directory."
        )
    return Path(erb)


def load_related_data(project_root: Path, related_table: str) -> list:
    """
    Load data from testing/answer-keys for a related table; falls back to blank-tests.
    Prefers answer-keys so that aggregations referencing computed fields in related
    tables resolve correctly.
    """
    snake_name = to_snake_case(related_table)
    testing_dir = _get_testing_dir(project_root)

    answer_keys_path = testing_dir / "answer-keys" / f"{snake_name}.json"
    if answer_keys_path.exists():
        with open(answer_keys_path, "r", encoding="utf-8") as f:
            return json.load(f)

    blank_tests_path = testing_dir / "blank-tests" / f"{snake_name}.json"
    if blank_tests_path.exists():
        with open(blank_tests_path, "r", encoding="utf-8") as f:
            return json.load(f)

    return []


def compute_lookups(records: list, entity_name: str, rulebook: dict, project_root: Path) -> list:
    """INDEX/MATCH lookup interpreter. PYTHON SIMULATOR ONLY."""
    schema = get_entity_schema(rulebook, entity_name)
    lookup_fields = get_lookup_fields(schema)

    if not lookup_fields:
        return records

    related_data_cache = {}

    for field in lookup_fields:
        field_name = field.get("name")
        formula = field.get("formula", "")
        snake_field_name = to_snake_case(field_name)

        lookup_table, return_field, key_field, pk_field = parse_index_match_formula(formula)

        if not lookup_table:
            continue

        if lookup_table not in related_data_cache:
            related_data_cache[lookup_table] = load_related_data(project_root, lookup_table)

        related_records = related_data_cache[lookup_table]
        snake_return_field = to_snake_case(return_field)
        snake_key_field = to_snake_case(key_field)
        snake_pk_field = to_snake_case(pk_field)

        lookup_map = {}
        for related_record in related_records:
            pk_value = related_record.get(snake_pk_field)
            if pk_value is not None:
                lookup_map[pk_value] = related_record.get(snake_return_field)

        for record in records:
            key_value = record.get(snake_key_field)
            if key_value is not None and key_value in lookup_map:
                record[snake_field_name] = lookup_map[key_value]
            else:
                record[snake_field_name] = None

    return records


def compute_aggregations(records: list, entity_name: str, rulebook: dict, project_root: Path) -> list:
    """COUNTIFS / SUMIFS aggregation interpreter. PYTHON SIMULATOR ONLY."""
    schema = get_entity_schema(rulebook, entity_name)
    agg_fields = get_aggregation_fields(schema)

    if not agg_fields:
        return records

    related_data_cache = {}

    for field in agg_fields:
        field_name = field.get("name")
        formula = field.get("formula", "")
        snake_field_name = to_snake_case(field_name)

        related_table, lookup_field, match_field = parse_countifs_formula(formula)

        if related_table:
            if related_table not in related_data_cache:
                related_data_cache[related_table] = load_related_data(project_root, related_table)

            related_records = related_data_cache[related_table]
            snake_lookup_field = to_snake_case(lookup_field)
            snake_match_field = to_snake_case(match_field)

            count_map = {}
            for related_record in related_records:
                lookup_value = related_record.get(snake_lookup_field)
                if lookup_value is not None:
                    count_map[lookup_value] = count_map.get(lookup_value, 0) + 1

            for record in records:
                match_value = record.get(snake_match_field)
                if match_value is not None:
                    record[snake_field_name] = count_map.get(match_value, 0)
                else:
                    record[snake_field_name] = 0
            continue

        related_table, sum_field, criteria_field, match_field = parse_sumifs_formula(formula)

        if related_table:
            if related_table not in related_data_cache:
                related_data_cache[related_table] = load_related_data(project_root, related_table)

            related_records = related_data_cache[related_table]
            snake_sum_field = to_snake_case(sum_field)
            snake_criteria_field = to_snake_case(criteria_field)
            snake_match_field = to_snake_case(match_field)

            is_distinct = "distinct" in field_name.lower()

            related_pk_field = to_snake_case(related_table[:-1] + "Id")
            pk_to_record = {}
            for rec in related_records:
                pk_val = rec.get(related_pk_field)
                if pk_val:
                    pk_to_record[pk_val] = rec

            relationship_field = None
            for f in schema:
                if f.get("type") == "relationship" and f.get("RelatedTo") == related_table:
                    relationship_field = to_snake_case(f.get("name"))
                    break

            for record in records:
                match_value = record.get(snake_match_field)
                values = []
                has_any_match = False

                if relationship_field and relationship_field in record and record[relationship_field]:
                    rel_ids = [rid.strip() for rid in str(record[relationship_field]).split(",") if rid.strip()]
                    for rel_id in rel_ids:
                        rel_rec = pk_to_record.get(rel_id)
                        if rel_rec:
                            criteria_value = rel_rec.get(snake_criteria_field)
                            if criteria_value == match_value:
                                has_any_match = True
                                sum_value = rel_rec.get(snake_sum_field)
                                if sum_value is not None and sum_value != "" and sum_value != 0:
                                    str_value = str(sum_value)
                                    if is_distinct:
                                        if str_value not in values:
                                            values.append(str_value)
                                    else:
                                        values.append(str_value)
                                else:
                                    values.append("")
                else:
                    sorted_records = sorted(
                        related_records,
                        key=lambda r: r.get("sequence_position", 0) if r.get("sequence_position") is not None else 0,
                    )
                    for related_record in sorted_records:
                        criteria_value = related_record.get(snake_criteria_field)
                        if criteria_value == match_value:
                            has_any_match = True
                            sum_value = related_record.get(snake_sum_field)
                            if sum_value is not None and sum_value != "" and sum_value != 0:
                                str_value = str(sum_value)
                                if is_distinct:
                                    if str_value not in values:
                                        values.append(str_value)
                                else:
                                    values.append(str_value)

                non_empty_values = [v for v in values if v]
                if non_empty_values:
                    if is_distinct:
                        record[snake_field_name] = ", ".join(non_empty_values)
                    else:
                        record[snake_field_name] = ", ".join(values)
                elif has_any_match:
                    record[snake_field_name] = 0
                elif is_distinct:
                    record[snake_field_name] = ""
                else:
                    record[snake_field_name] = 0

    return records
