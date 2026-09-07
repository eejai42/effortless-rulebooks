#!/usr/bin/env python3
# =============================================================================
# LLM FUZZY GRADER
# =============================================================================
# Reusable tool for substrates without native computation capability.
# Uses an LLM to interpret human-readable specifications and infer what the
# computed values SHOULD be, based purely on the instructions/output.
#
# This introduces a "fuzzy evaluation layer" that bridges the gap between
# documentation-only substrates and executable substrates.
# =============================================================================

import json
import os
import sys
import argparse
from pathlib import Path
from typing import Optional

# =============================================================================
# CONFIGURATION
# =============================================================================

# Computed columns that the LLM should attempt to infer
COMPUTED_COLUMNS = [
    "family_feud_mismatch",
    "family_fued_question",
    "top_family_feud_answer",
    "has_grammar",
    "relationship_to_concept",
]

# Primary key field
PRIMARY_KEY = "language_candidate_id"

# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
TESTING_DIR = os.path.join(PROJECT_ROOT, "testing")
ANSWER_KEY_PATH = os.path.join(TESTING_DIR, "answer-key.json")
BLANK_TEST_PATH = os.path.join(TESTING_DIR, "blank-test.json")


# =============================================================================
# LLM PROVIDERS
# =============================================================================

def get_llm_response(prompt: str, provider: str = "openai") -> str:
    """
    Get a response from an LLM provider.

    Supported providers:
    - openai: Uses OpenAI's GPT models
    - anthropic: Uses Anthropic's Claude models
    - ollama: Uses local Ollama models
    """
    if provider == "openai":
        return _call_openai(prompt)
    elif provider == "anthropic":
        return _call_anthropic(prompt)
    elif provider == "ollama":
        return _call_ollama(prompt)
    else:
        raise ValueError(f"Unknown LLM provider: {provider}")


def _call_openai(prompt: str) -> str:
    """Call OpenAI API"""
    try:
        import openai
        client = openai.OpenAI()
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,  # Low temperature for deterministic outputs
        )
        return response.choices[0].message.content
    except ImportError:
        raise ImportError("openai package not installed. Run: pip install openai")
    except Exception as e:
        raise RuntimeError(f"OpenAI API error: {e}")


def _call_anthropic(prompt: str) -> str:
    """Call Anthropic API"""
    try:
        import anthropic
        client = anthropic.Anthropic()
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.content[0].text
    except ImportError:
        raise ImportError("anthropic package not installed. Run: pip install anthropic")
    except Exception as e:
        raise RuntimeError(f"Anthropic API error: {e}")


def _call_ollama(prompt: str) -> str:
    """Call local Ollama API"""
    try:
        import requests
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3.2",
                "prompt": prompt,
                "stream": False,
            }
        )
        return response.json()["response"]
    except ImportError:
        raise ImportError("requests package not installed. Run: pip install requests")
    except Exception as e:
        raise RuntimeError(f"Ollama API error: {e}")


# =============================================================================
# SUBSTRATE SPECIFICATION LOADERS
# =============================================================================

def load_substrate_specification(substrate_dir: str) -> dict:
    """
    Load all relevant specification files from a substrate directory.

    Returns a dict with:
    - specification_text: Combined text of all specification files
    - file_list: List of files loaded
    - substrate_type: Type of substrate (english, docx, uml, owl, rdf)
    """
    substrate_path = Path(substrate_dir)
    substrate_name = substrate_path.name

    spec_files = {
        "english": ["specification.md", "glossary.md", "candidate-profiles.md"],
        "docx": ["specification.docx"],  # Will need special handling
        "uml": ["class-diagram.puml", "er-diagram.mmd"],
        "owl": ["ontology.owl", "rules.swrl", "individuals.owl"],
        "rdf": ["schema.ttl", "data.ttl", "rules.shacl"],
    }

    # Determine substrate type
    substrate_type = None
    for stype in spec_files:
        if stype in substrate_name.lower():
            substrate_type = stype
            break

    if not substrate_type:
        # Try to detect by files present
        for stype, files in spec_files.items():
            for f in files:
                if (substrate_path / f).exists():
                    substrate_type = stype
                    break
            if substrate_type:
                break

    if not substrate_type:
        substrate_type = "unknown"

    # Load specification text from available files
    spec_text_parts = []
    files_loaded = []

    # Try common files first
    common_files = [
        "README.md",
        "specification.md",
        "glossary.md",
        "candidate-profiles.md",
        "schema.ttl",
        "ontology.owl",
        "rules.swrl",
        "class-diagram.puml",
        "er-diagram.mmd",
    ]

    for filename in common_files:
        filepath = substrate_path / filename
        if filepath.exists() and filepath.suffix in [".md", ".ttl", ".owl", ".swrl", ".puml", ".mmd"]:
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                    spec_text_parts.append(f"=== {filename} ===\n{content}")
                    files_loaded.append(filename)
            except Exception as e:
                print(f"Warning: Could not read {filename}: {e}")

    return {
        "specification_text": "\n\n".join(spec_text_parts),
        "file_list": files_loaded,
        "substrate_type": substrate_type,
    }


# =============================================================================
# LLM INFERENCE ENGINE
# =============================================================================

def build_inference_prompt(
    specification: dict,
    blank_test: list,
    answer_key: list,
    candidate_record: dict,
) -> str:
    """
    Build a prompt that asks the LLM to infer computed field values
    based purely on the substrate's specification/output.

    The prompt includes:
    - The substrate specification (prose, ontology, diagram definitions, etc.)
    - The structure of computed columns
    - A single candidate record to evaluate
    - Examples from the answer key for context
    """

    # Get example records from answer key (first 3)
    examples = answer_key[:3] if len(answer_key) >= 3 else answer_key

    prompt = f"""You are evaluating whether a substrate specification correctly describes how to compute derived fields.

## Substrate Specification

The following is the specification/documentation from the substrate:

{specification["specification_text"]}

## Computed Columns to Infer

Based PURELY on the specification above, determine what values these computed columns should have:

{json.dumps(COMPUTED_COLUMNS, indent=2)}

## Field Definitions

The computed columns are defined as follows:
- `family_fued_question`: A string in the format "Is [name] a language?"
- `top_family_feud_answer`: Boolean - true if the candidate satisfies all language criteria
- `family_feud_mismatch`: String describing any mismatch between computed and expected, or null if no mismatch
- `has_grammar`: String representation of has_syntax field (e.g., "True" or "False")
- `relationship_to_concept`: "IsMirrorOf" if distance_from_concept=1, else "IsDescriptionOf"

## Example Records (for reference)

Here are example records showing the expected format:

```json
{json.dumps(examples, indent=2, default=str)}
```

## Candidate to Evaluate

Based on the specification above, infer the computed column values for this candidate:

```json
{json.dumps(candidate_record, indent=2, default=str)}
```

## Instructions

1. Read the specification carefully
2. For each computed column, determine what value it SHOULD have based on the specification
3. Return ONLY a valid JSON object with the computed column values

Respond with ONLY a JSON object in this format (no other text):
```json
{{
    "family_fued_question": "...",
    "top_family_feud_answer": true/false,
    "family_feud_mismatch": "..." or null,
    "has_grammar": "True" or "False",
    "relationship_to_concept": "IsMirrorOf" or "IsDescriptionOf"
}}
```
"""
    return prompt


def extract_json_from_response(response: str) -> dict:
    """Extract JSON from LLM response, handling markdown code blocks."""
    import re

    # Try to find JSON in code blocks first
    json_match = re.search(r'```(?:json)?\s*\n?(.*?)\n?```', response, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group(1))
        except json.JSONDecodeError:
            pass

    # Try to parse the entire response as JSON
    try:
        return json.loads(response)
    except json.JSONDecodeError:
        pass

    # Try to find any JSON-like structure
    json_match = re.search(r'\{[^{}]*\}', response, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group(0))
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Could not extract JSON from response: {response[:200]}...")


def infer_computed_values(
    specification: dict,
    blank_test: list,
    answer_key: list,
    candidate_record: dict,
    provider: str = "openai",
) -> dict:
    """
    Use an LLM to infer what the computed values should be for a candidate,
    based purely on the substrate specification.
    """
    prompt = build_inference_prompt(specification, blank_test, answer_key, candidate_record)

    response = get_llm_response(prompt, provider)

    try:
        return extract_json_from_response(response)
    except ValueError as e:
        print(f"Warning: {e}")
        return {}


# =============================================================================
# FUZZY GRADING
# =============================================================================

def grade_fuzzy(
    substrate_dir: str,
    provider: str = "openai",
    sample_size: Optional[int] = None,
    verbose: bool = False,
) -> dict:
    """
    Perform fuzzy grading of a non-computational substrate.

    Process:
    1. Load the substrate's specification/documentation
    2. Load the blank test and answer key
    3. For each candidate, use LLM to infer what values SHOULD be
    4. Compare LLM-inferred values against answer key
    5. Return grading results

    Args:
        substrate_dir: Path to the substrate directory
        provider: LLM provider to use (openai, anthropic, ollama)
        sample_size: If set, only grade this many records (for testing)
        verbose: Print detailed progress

    Returns:
        Dict with grading results
    """
    print(f"Loading specification from {substrate_dir}...")
    specification = load_substrate_specification(substrate_dir)

    if not specification["specification_text"]:
        return {
            "error": "No specification files found",
            "substrate": Path(substrate_dir).name,
        }

    print(f"  Loaded {len(specification['file_list'])} files: {', '.join(specification['file_list'])}")

    # Load test data
    print("Loading test data...")
    with open(BLANK_TEST_PATH, 'r') as f:
        blank_test = json.load(f)

    with open(ANSWER_KEY_PATH, 'r') as f:
        answer_key = json.load(f)

    # Index answer key by primary key
    answer_key_by_pk = {str(r[PRIMARY_KEY]): r for r in answer_key}

    # Optionally sample for testing
    if sample_size:
        blank_test = blank_test[:sample_size]

    print(f"Grading {len(blank_test)} candidates using {provider}...")

    results = {
        "substrate": Path(substrate_dir).name,
        "substrate_type": specification["substrate_type"],
        "provider": provider,
        "total_records": len(blank_test),
        "total_fields_tested": 0,
        "fields_passed": 0,
        "fields_failed": 0,
        "failures": [],
        "llm_inferences": [],
    }

    for i, candidate in enumerate(blank_test):
        pk = str(candidate[PRIMARY_KEY])
        expected = answer_key_by_pk.get(pk, {})

        if verbose:
            print(f"  [{i+1}/{len(blank_test)}] Processing {candidate.get('name', pk)}...")

        try:
            inferred = infer_computed_values(
                specification, blank_test, answer_key, candidate, provider
            )
        except Exception as e:
            print(f"    Error inferring values: {e}")
            inferred = {}

        results["llm_inferences"].append({
            PRIMARY_KEY: pk,
            "inferred": inferred,
        })

        # Compare inferred vs expected
        for field in COMPUTED_COLUMNS:
            results["total_fields_tested"] += 1

            expected_val = expected.get(field)
            inferred_val = inferred.get(field)

            # Normalize for comparison
            if str(expected_val).lower() == str(inferred_val).lower():
                results["fields_passed"] += 1
            else:
                results["fields_failed"] += 1
                results["failures"].append({
                    PRIMARY_KEY: pk,
                    "field": field,
                    "expected": expected_val,
                    "inferred": inferred_val,
                })

    score = (results["fields_passed"] / results["total_fields_tested"] * 100) if results["total_fields_tested"] > 0 else 0
    results["score"] = score

    return results


def write_fuzzy_test_answers(results: dict, substrate_dir: str):
    """
    Write a test-answers.json file based on LLM inferences.
    This allows the fuzzy grader to integrate with the standard orchestrator.
    """
    substrate_path = Path(substrate_dir)
    answers_path = substrate_path / "test-answers.json"

    # Load blank test as base
    with open(BLANK_TEST_PATH, 'r') as f:
        test_answers = json.load(f)

    # Index inferences by primary key
    inferences_by_pk = {
        str(inf[PRIMARY_KEY]): inf["inferred"]
        for inf in results.get("llm_inferences", [])
    }

    # Apply inferences
    for record in test_answers:
        pk = str(record[PRIMARY_KEY])
        inferred = inferences_by_pk.get(pk, {})
        for field in COMPUTED_COLUMNS:
            if field in inferred:
                record[field] = inferred[field]

    with open(answers_path, 'w') as f:
        json.dump(test_answers, f, indent=2, default=str)

    print(f"Wrote {answers_path}")
    return answers_path


def generate_fuzzy_report(results: dict, substrate_dir: str):
    """Generate a detailed fuzzy grading report."""
    substrate_path = Path(substrate_dir)
    report_path = substrate_path / "fuzzy-grading-report.md"

    total = results["total_fields_tested"]
    passed = results["fields_passed"]
    failed = results["fields_failed"]
    score = results.get("score", 0)

    lines = [
        f"# Fuzzy Grading Report: {results['substrate']}",
        "",
        "## Overview",
        "",
        "This report shows the results of LLM-based fuzzy grading. The LLM reads the",
        "substrate's specification/documentation and attempts to infer what the computed",
        "field values SHOULD be, based purely on the instructions.",
        "",
        "## Configuration",
        "",
        f"| Setting | Value |",
        f"|---------|-------|",
        f"| Substrate Type | {results.get('substrate_type', 'unknown')} |",
        f"| LLM Provider | {results.get('provider', 'unknown')} |",
        f"| Total Records | {results['total_records']} |",
        "",
        "## Summary",
        "",
        f"| Metric | Value |",
        f"|--------|-------|",
        f"| Total Fields Tested | {total} |",
        f"| Passed | {passed} |",
        f"| Failed | {failed} |",
        f"| Score | {score:.1f}% |",
        "",
    ]

    if results.get("error"):
        lines.extend([
            "## Error",
            "",
            f"```",
            results["error"],
            f"```",
            "",
        ])

    if results["failures"]:
        lines.extend([
            "## Failures",
            "",
            "These are cases where the LLM's inference did not match the expected answer.",
            "This could indicate:",
            "- The specification is unclear or incomplete",
            "- The LLM misinterpreted the specification",
            "- The specification describes different logic than what was expected",
            "",
            f"| {PRIMARY_KEY} | Field | Expected | LLM Inferred |",
            f"|---------------|-------|----------|--------------|",
        ])

        for failure in results["failures"][:50]:
            pk = failure[PRIMARY_KEY]
            field = failure["field"]
            expected = str(failure["expected"])[:30]
            inferred = str(failure["inferred"])[:30]
            lines.append(f"| {pk} | {field} | {expected} | {inferred} |")

        if len(results["failures"]) > 50:
            lines.append(f"| ... | ... | ({len(results['failures']) - 50} more) | ... |")

        lines.append("")

    lines.extend([
        "## Interpretation",
        "",
        "A high score indicates that the specification clearly describes the computation",
        "in a way that an LLM can follow. A low score may indicate:",
        "",
        "1. The specification needs more detail about formula logic",
        "2. The specification uses different terminology than the answer key",
        "3. The LLM struggles with this particular format (ontology, diagrams, etc.)",
        "",
        "---",
        "",
        "*Generated by llm-fuzzy-grader.py*",
    ])

    with open(report_path, 'w') as f:
        f.write('\n'.join(lines))

    print(f"Wrote {report_path}")
    return report_path


# =============================================================================
# CLI
# =============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="LLM-based fuzzy grader for non-computational substrates"
    )
    parser.add_argument(
        "substrate_dir",
        help="Path to the substrate directory to grade"
    )
    parser.add_argument(
        "--provider", "-p",
        choices=["openai", "anthropic", "ollama"],
        default="openai",
        help="LLM provider to use (default: openai)"
    )
    parser.add_argument(
        "--sample", "-s",
        type=int,
        help="Only grade this many records (for testing)"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Print detailed progress"
    )
    parser.add_argument(
        "--write-answers", "-w",
        action="store_true",
        help="Write test-answers.json based on LLM inferences"
    )

    args = parser.parse_args()

    # Resolve substrate directory
    substrate_dir = args.substrate_dir
    if not os.path.isabs(substrate_dir):
        # Try relative to project root
        substrate_dir = os.path.join(PROJECT_ROOT, "execution-substrates", substrate_dir)

    if not os.path.isdir(substrate_dir):
        print(f"Error: Substrate directory not found: {substrate_dir}")
        sys.exit(1)

    # Run fuzzy grading
    results = grade_fuzzy(
        substrate_dir,
        provider=args.provider,
        sample_size=args.sample,
        verbose=args.verbose,
    )

    # Generate report
    generate_fuzzy_report(results, substrate_dir)

    # Optionally write test-answers.json
    if args.write_answers:
        write_fuzzy_test_answers(results, substrate_dir)

    # Print summary
    print()
    print("=" * 60)
    print(f"FUZZY GRADING RESULTS: {results['substrate']}")
    print("=" * 60)
    print(f"Provider: {results.get('provider', 'unknown')}")
    print(f"Records: {results['total_records']}")
    print(f"Fields Tested: {results['total_fields_tested']}")
    print(f"Passed: {results['fields_passed']}")
    print(f"Failed: {results['fields_failed']}")
    print(f"Score: {results.get('score', 0):.1f}%")
    print("=" * 60)

    # Exit with appropriate code
    if results.get("error"):
        sys.exit(2)
    elif results["fields_failed"] > 0:
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()
