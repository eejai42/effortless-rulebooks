#!/usr/bin/env python3
"""Fail-loud validation for an explicitly named Effortless rulebook."""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


DERIVED_TYPES = {"calculated", "lookup", "aggregation"}
RAW_TYPES = {"raw", "relationship"}
NON_TABLE_KEYS = {"$schema", "Name", "Description", "_meta"}


def contains_nested_call(expression: str, outer_names: tuple[str, ...], inner_name: str) -> bool:
    upper = expression.upper()
    for outer_name in outer_names:
        marker = f"{outer_name}("
        start = 0
        while (index := upper.find(marker, start)) != -1:
            depth = 1
            cursor = index + len(marker)
            while cursor < len(upper) and depth:
                if upper[cursor] == "(":
                    depth += 1
                elif upper[cursor] == ")":
                    depth -= 1
                cursor += 1
            if depth == 0 and f"{inner_name}(" in upper[index + len(marker) : cursor - 1]:
                return True
            start = index + len(marker)
    return False


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("rulebook", type=Path, help="Rulebook JSON to validate")
    return parser.parse_args()


def main() -> None:
    path = parse_args().rulebook.resolve(strict=True)
    with path.open(encoding="utf-8") as handle:
        rulebook = json.load(handle)
    if not isinstance(rulebook, dict):
        raise SystemExit(f"Expected a JSON object: {path}")

    tables = {
        name: value
        for name, value in rulebook.items()
        if name not in NON_TABLE_KEYS
        and isinstance(value, dict)
        and "schema" in value
        and "data" in value
    }
    problems: list[str] = []

    def schema_field(table_name: str, field_name: str) -> dict[str, Any] | None:
        for candidate in tables[table_name]["schema"]:
            if candidate.get("name") == field_name:
                return candidate
        return None

    def primary_key(table_name: str) -> str | None:
        for candidate in tables[table_name]["schema"]:
            if candidate.get("type") == "raw":
                return candidate.get("name")
        return None

    primary_keys: dict[str, str] = {}
    primary_values: dict[str, set[Any]] = {}
    for table_name, table in tables.items():
        if not isinstance(table["schema"], list) or not isinstance(table["data"], list):
            problems.append(f"{table_name}: schema and data must both be arrays")
            continue
        pk = primary_key(table_name)
        if pk is None:
            problems.append(f"{table_name}: no raw primary-key field")
            continue
        primary_keys[table_name] = pk
        values = [row.get(pk) for row in table["data"]]
        if any(value is None for value in values):
            problems.append(f"{table_name}.{pk}: null primary-key value")
        duplicates = sorted(
            value for value, count in Counter(values).items() if count > 1
        )
        if duplicates:
            problems.append(f"{table_name}.{pk}: duplicate values {duplicates}")
        primary_values[table_name] = set(values)

    graph: dict[str, set[str]] = defaultdict(set)
    for table_name, table in tables.items():
        source_pk = primary_keys.get(table_name)
        for definition in table["schema"]:
            if definition.get("type") != "relationship" or definition.get("isReversed"):
                continue
            field_name = definition.get("name")
            target = definition.get("RelatedTo")
            if target not in tables:
                problems.append(
                    f"{table_name}.{field_name}: RelatedTo target does not exist: {target}"
                )
                continue
            inverse = definition.get("InverseField")
            if inverse and schema_field(target, inverse) is None:
                problems.append(
                    f"{table_name}.{field_name}: inverse field is missing: {target}.{inverse}"
                )
            if target != table_name:
                graph[table_name].add(target)
            for row in table["data"]:
                value = row.get(field_name)
                if value is None:
                    if not definition.get("nullable", True):
                        problems.append(
                            f"{table_name}.{field_name}: null FK in {source_pk}={row.get(source_pk)!r}"
                        )
                    continue
                if value == "":
                    problems.append(
                        f"{table_name}.{field_name}: empty-string FK in {source_pk}={row.get(source_pk)!r}"
                    )
                elif value not in primary_values.get(target, set()):
                    problems.append(
                        f"{table_name}.{field_name}: dangling FK {value!r} in {source_pk}={row.get(source_pk)!r}"
                    )

    state = {table_name: 0 for table_name in tables}

    def visit(table_name: str, stack: list[str]) -> None:
        state[table_name] = 1
        stack.append(table_name)
        for target in graph[table_name]:
            if state[target] == 1:
                cycle = stack[stack.index(target) :] + [target]
                problems.append("table cycle: " + " -> ".join(cycle))
            elif state[target] == 0:
                visit(target, stack)
        stack.pop()
        state[table_name] = 2

    for table_name in tables:
        if state[table_name] == 0:
            visit(table_name, [])

    nodes: dict[tuple[str, str], dict[str, Any]] = {}
    dependencies: dict[tuple[str, str], set[tuple[str, str]]] = defaultdict(set)
    for table_name, table in tables.items():
        for definition in table["schema"]:
            field_name = definition.get("name")
            if not isinstance(field_name, str):
                problems.append(f"{table_name}: field without a string name")
                continue
            nodes[(table_name, field_name)] = definition

    for node, definition in nodes.items():
        table_name, field_name = node
        formula = definition.get("formula")
        field_type = definition.get("type")
        if "Formula" in definition:
            problems.append(f"{table_name}.{field_name}: capital-F Formula key")
        if field_type in DERIVED_TYPES and not formula:
            problems.append(f"{table_name}.{field_name}: {field_type} without formula")
            continue
        if formula is None:
            continue
        if not isinstance(formula, str) or not formula.startswith("="):
            problems.append(f"{table_name}.{field_name}: formula must start with =")
            continue
        if "ISBLANK" in formula:
            problems.append(f"{table_name}.{field_name}: unsupported ISBLANK")
        if re.search(
            r'COALESCE\(\{\{\w+\}\},\s*""\)\s*(?:=|<>)\s*""',
            formula,
        ):
            problems.append(
                f"{table_name}.{field_name}: COALESCE-wrapped blank check is mistranslated"
            )
        if contains_nested_call(formula, ("AND", "OR"), "IF"):
            problems.append(
                f"{table_name}.{field_name}: IF used as a boolean predicate inside AND/OR"
            )
        if re.search(r"(?<!\{)\{[A-Za-z]\w*\}(?!\})", formula):
            problems.append(f"{table_name}.{field_name}: single-brace field reference")
        for match in re.finditer(r"(\w+)!\{\{(\w+)\}\}", formula):
            dependencies[node].add((match.group(1), match.group(2)))
        local_formula = re.sub(r"\w+!\{\{\w+\}\}", "", formula)
        for match in re.finditer(r"\{\{(\w+)\}\}", local_formula):
            dependencies[node].add((table_name, match.group(1)))

    for node, referenced in dependencies.items():
        for dependency in referenced:
            if dependency not in nodes:
                problems.append(
                    f"{node[0]}.{node[1]}: missing reference {dependency[0]}.{dependency[1]}"
                )

    memo: dict[tuple[str, str], int] = {}
    visiting: set[tuple[str, str]] = set()

    def inference_order(node: tuple[str, str]) -> int:
        if node in memo:
            return memo[node]
        if node in visiting:
            problems.append(f"field cycle reaches {node[0]}.{node[1]}")
            return 0
        visiting.add(node)
        definition = nodes[node]
        if definition.get("type") in RAW_TYPES or not definition.get("formula"):
            order = 0
        else:
            order = 1 + max(
                (
                    inference_order(dependency)
                    for dependency in dependencies[node]
                    if dependency in nodes
                ),
                default=0,
            )
        visiting.remove(node)
        memo[node] = order
        return order

    for node, definition in nodes.items():
        if definition.get("type") not in DERIVED_TYPES:
            continue
        computed = inference_order(node)
        declared = re.match(r"Order (\d+)\.", definition.get("Description", ""))
        if declared is None:
            problems.append(
                f"{node[0]}.{node[1]}: derived Description lacks Order N."
            )
        elif int(declared.group(1)) != computed:
            problems.append(
                f"{node[0]}.{node[1]}: declared order {declared.group(1)}, computed {computed}"
            )

    if problems:
        for problem in problems:
            print(f"ERROR: {problem}")
        raise SystemExit(f"Rulebook validation failed with {len(problems)} problem(s).")

    raw_count = sum(
        1 for definition in nodes.values() if definition.get("type") in RAW_TYPES
    )
    derived_count = len(nodes) - raw_count
    max_order = max((inference_order(node) for node in nodes), default=0)
    print(
        f"OK: {len(tables)} tables, {len(nodes)} fields "
        f"({raw_count} raw/relationship, {derived_count} derived), max order {max_order}."
    )


if __name__ == "__main__":
    main()
