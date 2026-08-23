"""
ERB Calculation Library (GENERATED - DO NOT EDIT)
=================================================
Generated from: effortless-rulebook/acme-llc-rulebook.json

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
# CUSTOMERS CALCULATIONS
# Table: Customers
# =============================================================================

# Level 1

def calc_customers_name(email_address):
    """
    Identifier for the customers.
    
    Formula: =SUBSTITUTE({{EmailAddress}}, "@", "-")
    """
    return ((email_address or "").replace('@', '-'))

def calc_customers_full_name(last_name, first_name):
    """
    Full name is computed from the first and last name of the customer
    
    Formula: ={{LastName}} & ", " & {{FirstName}}
    """
    return (str(last_name or "") + ', ' + str(first_name or ""))


def compute_customers_fields(record: dict) -> dict:
    """
    Compute all calculated fields for Customers.
    
    Table: Customers
    """
    result = dict(record)

    # Level 1 calculations
    result['name'] = calc_customers_name(result.get('email_address'))
    result['full_name'] = calc_customers_full_name(result.get('last_name'), result.get('first_name'))

    # Convert empty strings to None for string fields
    for key in ['name', 'full_name']:
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

    if entity_lower == 'customers':
        return compute_customers_fields(record)
    else:
        # Unknown entity - return record unchanged (no error)
        return dict(record)

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

    The simulator must operate on the same domain the orchestrator chose;
    there is no implicit per-substrate testing dir.
    """
    import os
    erb = os.environ.get("ERB_TESTING_DIR")
    if not erb:
        raise RuntimeError(
            "ERB_TESTING_DIR is not set. python_only_erb_simulator must be "
            "invoked by the orchestrator with ERB_TESTING_DIR pointing at the "
            "active domain's testing/ directory."
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
