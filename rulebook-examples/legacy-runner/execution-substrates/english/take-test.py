#!/usr/bin/env python3
"""
Take test for the English execution substrate.

The English substrate "executes" the rulebook by handing the LLM the
LLM-generated English specification plus the blank-test data for every
entity, then asking it to fill in every null derived field — scalar,
lookup, and aggregation — in one shot.

Why one-shot: the test data is tiny (~5KB total across all entities) and
the spec is small (~7KB), so the LLM can see all the cross-table joins it
needs without per-entity batching. Per-entity prompts cripple the substrate
because lookups and aggregations reference sibling tables the LLM never
sees.

Inputs:
  - ./specification.md          (English spec, produced by inject-into-english.py)
  - ../../testing/blank-tests/  (one *.json per entity with derived fields nulled)

Output:
  - ./test-answers/*.json       (one per entity, with derived fields filled in)
"""

import argparse
import glob as glob_module
import json
import os
import sys
from pathlib import Path

SKIP_ALL_CONFIRMATIONS = False
script_dir = Path(__file__).parent.resolve()
sys.path.insert(0, str(script_dir.parent.parent))

DEFAULT_MODEL = os.environ.get("LLM_MODEL", "gpt-4o-mini")


def call_llm(prompt: str, skip_confirmation: bool = False) -> str:
    try:
        import openai
    except ImportError:
        print("Error: openai package not installed (pip install openai)")
        sys.exit(1)

    if not os.environ.get("OPENAI_API_KEY"):
        print("Error: OPENAI_API_KEY not set")
        sys.exit(1)

    prompt_lines = prompt.split("\n")
    print("=" * 60)
    print("PROMPT (first 2 lines):")
    for line in prompt_lines[:2]:
        print(f"  {line[:100]}")
    print(f"  ... ({len(prompt_lines)} total lines, {len(prompt)} chars)")
    print("=" * 60)

    if not skip_confirmation and not SKIP_ALL_CONFIRMATIONS and sys.stdin.isatty():
        print(f"\n  This will call OpenAI ({DEFAULT_MODEL}).")
        try:
            resp = input("  Proceed with LLM call? [y/N]: ").strip().lower()
            if resp not in ("y", "yes"):
                print("  Skipping LLM call.")
                return "{}"
        except (EOFError, KeyboardInterrupt):
            print("\n  Skipping LLM call.")
            return "{}"

    print(f"Calling OpenAI ({DEFAULT_MODEL})... please wait...")
    sys.stdout.flush()

    client = openai.OpenAI()
    response = client.chat.completions.create(
        model=DEFAULT_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=16384,
    )
    text = response.choices[0].message.content

    out_lines = text.split("\n")
    print("=" * 60)
    print("RESPONSE (first 2 lines):")
    for line in out_lines[:2]:
        print(f"  {line[:100]}")
    print(f"  ... ({len(out_lines)} total lines, {len(text)} chars)")
    print("=" * 60)
    sys.stdout.flush()
    return text


def load_spec() -> str:
    spec_path = script_dir / "specification.md"
    if not spec_path.exists():
        print(f"ERROR: specification.md not found at {spec_path}")
        print("Run inject-into-english.py first.")
        sys.exit(1)
    spec = spec_path.read_text(encoding="utf-8")
    print(f"  Loaded specification.md ({len(spec)} chars)")
    return spec


def load_all_blank_tests(blank_tests_dir: Path) -> dict:
    """Load every entity's blank-test JSON into one dict keyed by entity snake_case."""
    bundle = {}
    for path in sorted(glob_module.glob(str(blank_tests_dir / "*.json"))):
        name = os.path.basename(path).replace(".json", "")
        if name.startswith("_"):
            continue
        with open(path, "r", encoding="utf-8") as f:
            bundle[name] = json.load(f)
    return bundle


def build_prompt(specification: str, bundle: dict) -> str:
    return f"""You are taking a test. Follow the English specification below to fill in
every null derived field in the test data. The data spans multiple tables and many
of the derived fields are cross-table (lookups into another table, or aggregations
counting rows in another table) — so the WHOLE data bundle is provided in one shot
and you should resolve those joins yourself using the rules in the specification.

---

# SPECIFICATION

{specification}

---

# TEST DATA

The data below is a JSON object keyed by entity name (snake_case). Each value is
an array of records. Derived fields are currently `null`; fill them in following
the specification. Leave every non-null field exactly as it appears.

```json
{json.dumps(bundle, indent=2)}
```

---

# INSTRUCTIONS

1. Read the specification carefully — it documents every derived field across every
   entity, including cross-table lookups and aggregations.
2. Resolve cross-table joins by looking up rows in the relevant entity's array
   inside the same JSON bundle above. Do NOT invent data.
3. For every record in every entity, replace each null derived field with the
   correctly computed value.
4. Booleans must be `true` / `false` (lowercase, unquoted). Integers must be
   numbers (no quotes). Strings must be quoted.
5. If a value genuinely cannot be computed, leave it as `null` — but try first.
6. Preserve the structure exactly: same entity keys, same record order, same
   field names (snake_case).

Return ONLY valid JSON — a single object with the same shape as the input bundle,
no Markdown fences, no commentary.
"""


def extract_json(text: str):
    """Best-effort JSON object extraction from the LLM response."""
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    t = text.strip()
    if t.startswith("```json"):
        t = t[7:]
    elif t.startswith("```"):
        t = t[3:]
    t = t.strip()
    if t.endswith("```"):
        t = t[:-3]
    t = t.strip()

    start = t.find("{")
    end = t.rfind("}")
    if start != -1 and end != -1:
        try:
            return json.loads(t[start : end + 1])
        except json.JSONDecodeError as e:
            print(f"JSON parse error: {e}")
            print(f"First 300 chars: {t[start:start+300]}")
    return None


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


def main():
    global SKIP_ALL_CONFIRMATIONS
    parser = argparse.ArgumentParser()
    parser.add_argument("--no-confirm", action="store_true")
    args = parser.parse_args()
    if args.no_confirm:
        SKIP_ALL_CONFIRMATIONS = True

    blank_tests_dir, test_answers_dir = _get_testing_paths()
    test_answers_dir.mkdir(parents=True, exist_ok=True)

    print("=" * 70)
    print("English Execution Substrate - One-Shot All-Entities LLM Run")
    print("=" * 70)
    print()

    spec = load_spec()
    bundle = load_all_blank_tests(blank_tests_dir)
    if not bundle:
        print(f"ERROR: no blank-test files found in {blank_tests_dir}")
        sys.exit(1)

    total_records = sum(len(rs) for rs in bundle.values())
    print(f"  Loaded {len(bundle)} entities, {total_records} records total")
    for entity, rows in bundle.items():
        print(f"    - {entity}: {len(rows)} records")
    print()

    prompt = build_prompt(spec, bundle)
    response = call_llm(prompt)
    answers = extract_json(response)

    if not isinstance(answers, dict):
        print("ERROR: LLM did not return a JSON object. Falling back to passthrough.")
        answers = bundle

    # Write each entity's records, preserving every input row even if the LLM
    # dropped or reshaped some entities. Anything missing falls through to the
    # blank-test row so the grader can still score it (as failures).
    filled_total = 0
    for entity, blank_rows in bundle.items():
        llm_rows = answers.get(entity)
        if not isinstance(llm_rows, list) or len(llm_rows) != len(blank_rows):
            if llm_rows is None:
                print(f"  WARN: LLM omitted entity '{entity}'; writing blank-tests as-is")
                out_rows = blank_rows
            else:
                print(
                    f"  WARN: LLM returned {len(llm_rows) if isinstance(llm_rows, list) else '?'} "
                    f"rows for '{entity}', expected {len(blank_rows)}; padding/truncating"
                )
                out_rows = list(llm_rows) if isinstance(llm_rows, list) else []
                if len(out_rows) < len(blank_rows):
                    out_rows.extend(blank_rows[len(out_rows):])
                else:
                    out_rows = out_rows[: len(blank_rows)]
        else:
            out_rows = llm_rows

        out_path = test_answers_dir / f"{entity}.json"
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(out_rows, f, indent=2)

        # Count non-null derived fields filled in (anything that was null in
        # blank_rows and is now not-null in out_rows).
        for blank_rec, out_rec in zip(blank_rows, out_rows):
            for k, v in blank_rec.items():
                if v is None and out_rec.get(k) is not None:
                    filled_total += 1

        print(f"  -> {entity}: {len(out_rows)} records written")

    print()
    print("=" * 70)
    print(f"English substrate: filled {filled_total} derived fields across {len(bundle)} entities")
    print("=" * 70)


if __name__ == "__main__":
    main()
