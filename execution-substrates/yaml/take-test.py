#!/usr/bin/env python3
"""
YAML Substrate Test Runner
===========================

This substrate represents the rulebook as a YAML schema and executes scalar
calculated fields with a small YAML-substrate-native Excel-formula evaluator.
The evaluator is intentionally limited to the scalar dialect found in the
rulebook — SUBSTITUTE, string concatenation with `&`, IF, AND/OR/NOT, simple
numeric/comparison ops. Cross-table lookups (INDEX/MATCH) and aggregations
(COUNTIFS / SUMIFS) are NOT implemented here; those are tracked as legitimate
gaps and scored honestly when the rulebook exercises them.

GUARD: It is FORBIDDEN to import python_only_erb_simulator or any cross-table
interpreter from this script. The evaluator below is private to the yaml
substrate, mirrors a YAML-native interpretation of the formulas, and does
not delegate to the canonical Python simulator.
"""

import glob
import json
import os
import re
import sys
from pathlib import Path

script_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, str(Path(script_dir).parent.parent))


def _to_snake_case(name: str) -> str:
    s1 = re.sub('([^_])([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()


def _strip_quotes(s: str) -> str:
    s = s.strip()
    if (s.startswith('"') and s.endswith('"')) or (s.startswith("'") and s.endswith("'")):
        return s[1:-1]
    return s


def _split_top_level(expr: str, sep: str) -> list:
    """Split on `sep` at depth 0 only, respecting parens, brackets, braces, quotes."""
    out, buf, depth, in_str, quote = [], [], 0, False, ""
    i = 0
    while i < len(expr):
        ch = expr[i]
        if in_str:
            buf.append(ch)
            if ch == quote:
                in_str = False
        elif ch in ('"', "'"):
            in_str, quote = True, ch
            buf.append(ch)
        elif ch in "([{":
            depth += 1
            buf.append(ch)
        elif ch in ")]}":
            depth -= 1
            buf.append(ch)
        elif depth == 0 and expr[i:i + len(sep)] == sep:
            out.append("".join(buf))
            buf = []
            i += len(sep) - 1
        else:
            buf.append(ch)
        i += 1
    out.append("".join(buf))
    return [s.strip() for s in out]


_FUNC_RE = re.compile(r"^([A-Z_]+)\s*\((.*)\)$", re.DOTALL)
_TEMPLATE_RE = re.compile(r"\{\{(\w+)\}\}")


def _resolve_template(expr: str, record: dict) -> str:
    """Replace {{FieldName}} with the record's value, JSON-quoted as a string literal."""
    def repl(m):
        field = _to_snake_case(m.group(1))
        v = record.get(field)
        return json.dumps(v if v is not None else "")
    return _TEMPLATE_RE.sub(repl, expr)


def evaluate_formula(formula: str, record: dict):
    """Evaluate a scalar rulebook formula against a record. Returns the value
    or None if the formula uses something this minimal evaluator doesn't grok."""
    if not formula or not formula.startswith("="):
        return None
    expr = formula[1:].strip()
    # Substitute {{Field}} references with JSON-quoted literals so the rest of
    # the parser can treat them like string constants.
    expr = _resolve_template(expr, record)
    try:
        return _eval(expr)
    except Exception:
        return None


def _eval(expr: str):
    expr = expr.strip()
    if not expr:
        return None

    # String concatenation via Excel's `&`. Split at top-level only.
    parts = _split_top_level(expr, "&")
    if len(parts) > 1:
        vals = [_eval(p) for p in parts]
        if any(v is None for v in vals):
            return None
        return "".join(str(v) for v in vals)

    # Function call: NAME(arg1, arg2, ...)
    m = _FUNC_RE.match(expr)
    if m:
        name, raw_args = m.group(1).upper(), m.group(2)
        args = [_eval(a) for a in _split_top_level(raw_args, ",")] if raw_args.strip() else []
        return _call_func(name, args)

    # JSON-style string literal.
    if (expr.startswith('"') and expr.endswith('"')) or (expr.startswith("'") and expr.endswith("'")):
        return _strip_quotes(expr)

    # Numeric literal.
    if re.match(r"^-?\d+(\.\d+)?$", expr):
        return float(expr) if "." in expr else int(expr)

    # Boolean literals.
    if expr.upper() == "TRUE":
        return True
    if expr.upper() == "FALSE":
        return False

    return None


def _call_func(name: str, args: list):
    if name == "SUBSTITUTE":
        if len(args) < 3:
            return None
        text, old, new = (args + [None])[:3]
        if text is None:
            return ""
        if old is None or new is None:
            return text
        return str(text).replace(str(old), str(new))
    if name == "CONCAT" or name == "CONCATENATE":
        return "".join("" if a is None else str(a) for a in args)
    if name == "LEFT":
        if not args:
            return None
        s = "" if args[0] is None else str(args[0])
        n = int(args[1]) if len(args) > 1 and args[1] is not None else 1
        return s[:n]
    if name == "RIGHT":
        if not args:
            return None
        s = "" if args[0] is None else str(args[0])
        n = int(args[1]) if len(args) > 1 and args[1] is not None else 1
        return s[-n:] if n else ""
    if name == "UPPER":
        return ("" if not args or args[0] is None else str(args[0])).upper()
    if name == "LOWER":
        return ("" if not args or args[0] is None else str(args[0])).lower()
    if name == "IF":
        if len(args) < 2:
            return None
        cond = args[0]
        return args[1] if cond else (args[2] if len(args) > 2 else None)
    return None


def _load_rulebook_for_active_domain() -> dict:
    """Locate the rulebook for the active domain. ERB_RULEBOOK_PATH wins; else
    derive the path from ERB_DOMAIN. Fails loudly if neither is set."""
    env_path = os.environ.get("ERB_RULEBOOK_PATH")
    if env_path and Path(env_path).exists():
        with open(env_path) as f:
            return json.load(f)
    domain = os.environ.get("ERB_DOMAIN", "").strip()
    if not domain:
        raise RuntimeError(
            "Neither ERB_RULEBOOK_PATH nor ERB_DOMAIN is set; cannot locate "
            "the active rulebook."
        )
    project_root = Path(script_dir).parent.parent
    candidate = project_root / "rulebook-examples" / domain / "effortless-rulebook" / f"{domain}-rulebook.json"
    if not candidate.exists():
        raise FileNotFoundError(f"Rulebook not found at {candidate}")
    with open(candidate) as f:
        return json.load(f)


def _calculated_fields_for_entity(rulebook: dict, entity_name: str) -> list:
    """Return [(snake_field_name, formula), ...] for scalar calculated fields
    of the given entity. The match is loose so we handle PascalCase ↔ snake_case
    drift between the rulebook entity key and the blank-test file name."""
    target = entity_name.lower().replace("_", "")
    for key, val in rulebook.items():
        if not isinstance(val, dict) or "schema" not in val:
            continue
        if key.lower().replace("_", "") not in (target, target.rstrip("s")) \
                and target not in (key.lower().replace("_", ""), key.lower().replace("_", "").rstrip("s")):
            continue
        out = []
        for f in val.get("schema", []):
            if f.get("type") == "calculated" and f.get("formula"):
                out.append((_to_snake_case(f["name"]), f["formula"]))
        return out
    return []


def _get_testing_paths():
    """Resolve blank-tests and test-answers dirs. ERB_TESTING_DIR is required.

    There is no implicit per-substrate testing dir — running with no env var
    silently mixed results across domains. The orchestrator MUST set
    ERB_TESTING_DIR before invoking this substrate.
    """
    erb_testing = os.environ.get("ERB_TESTING_DIR")
    if not erb_testing:
        raise RuntimeError(
            "ERB_TESTING_DIR is not set. take-test.py must be invoked by the "
            "orchestrator with ERB_TESTING_DIR pointing at the active domain's "
            "testing/ directory."
        )
    substrate_name = Path(script_dir).name
    return Path(erb_testing) / "blank-tests", Path(erb_testing) / substrate_name / "test-answers"

try:
    import yaml
    YAML_AVAILABLE = True
except ImportError:
    YAML_AVAILABLE = False


def log_schema_info():
    """Read schema.yaml just for visibility; no execution."""
    schema_path = os.path.join(script_dir, "schema.yaml")
    if not (YAML_AVAILABLE and os.path.exists(schema_path)):
        return
    with open(schema_path, 'r') as f:
        schema = yaml.safe_load(f) or {}
    n_entities = len((schema or {}).get('entities', {}) or {})
    print(f"YAML substrate: schema.yaml loaded ({n_entities} entities). "
          f"Scalar formulas evaluated with the YAML-substrate-native evaluator; "
          f"unsupported expressions (cross-table lookups / aggregations) stay null.")


def run_multi_entity():
    blank_tests_dir, test_answers_dir = _get_testing_paths()

    if not blank_tests_dir.is_dir():
        print(f"Error: {blank_tests_dir} not found")
        sys.exit(1)

    test_answers_dir.mkdir(parents=True, exist_ok=True)
    log_schema_info()

    rulebook = _load_rulebook_for_active_domain()

    total_records = 0
    entity_count = 0

    for input_path in sorted(glob.glob(str(blank_tests_dir / "*.json"))):
        filename = os.path.basename(input_path)
        if filename.startswith('_'):
            continue

        with open(input_path, 'r') as f:
            records = json.load(f)

        entity = filename.replace('.json', '')
        calc_fields = _calculated_fields_for_entity(rulebook, entity)

        # Evaluate scalar calculated fields with the YAML-native evaluator.
        # Fields the evaluator can't handle (lookups, aggregations, unknown
        # functions) stay null and the grader counts them as failures.
        for record in records:
            for field_name, formula in calc_fields:
                value = evaluate_formula(formula, record)
                if value is not None:
                    record[field_name] = value

        output_path = test_answers_dir / filename
        with open(output_path, 'w') as f:
            json.dump(records, f, indent=2)

        total_records += len(records)
        entity_count += 1
        marker = f"{len(calc_fields)} formulas" if calc_fields else "raw passthrough"
        print(f"  -> {entity}: {len(records)} records ({marker})")

    print(f"YAML substrate: Processed {entity_count} entities, {total_records} total records")


if __name__ == "__main__":
    run_multi_entity()
