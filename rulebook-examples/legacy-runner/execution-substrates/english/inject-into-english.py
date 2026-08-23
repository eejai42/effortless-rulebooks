#!/usr/bin/env python3
"""
Generate English documentation from ANY Effortless Rulebook.

ARCHITECTURE: Generic Rulebook -> English Specification (LLM-Driven)
====================================================================
This substrate reads the effortless-rulebook.json and uses an LLM to generate:
1. specification.md - Plain English explanation of all calculated fields

The core insight: Let the LLM do the work. Instead of writing formula parsers,
just send the rulebook JSON to the LLM and ask it to write the specification.

REGENERATION POLICY:
- Default: regenerate when the rulebook is newer than specification.md (or spec missing)
- --regenerate: force regeneration regardless of mtimes
- If no LLM API key is available: leave whatever specification.md exists in place and
  exit with a warning. There is no repo-committed cache to restore from - the English
  spec is always derived from the rulebook on every run where the LLM is reachable.
"""

import sys
import os
import argparse
import json
from pathlib import Path

# Add project root to path for shared imports
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from orchestration.shared import load_rulebook, get_candidate_name_from_cwd, handle_clean_arg

# Colors
YELLOW = '\033[1;33m'
GREEN = '\033[0;32m'
CYAN = '\033[0;36m'
DIM = '\033[2m'
NC = '\033[0m'

_erb_rulebook = os.environ.get("ERB_RULEBOOK_PATH")
if not _erb_rulebook:
    raise RuntimeError(
        "ERB_RULEBOOK_PATH is not set. inject-into-english.py is per-project — "
        "it MUST be invoked with ERB_RULEBOOK_PATH pointing at the active "
        "domain's <domain>-rulebook.json. Do not run this script standalone."
    )
RULEBOOK_PATH = Path(_erb_rulebook)
if not RULEBOOK_PATH.exists():
    raise FileNotFoundError(
        f"Rulebook not found at ERB_RULEBOOK_PATH={RULEBOOK_PATH}. "
        "Pass the exact path; this script never substitutes a different one."
    )


def has_api_key(provider: str = "openai") -> bool:
    """Check if API key is available for the given provider."""
    if provider == "openai":
        return bool(os.environ.get("OPENAI_API_KEY"))
    elif provider == "anthropic":
        return bool(os.environ.get("ANTHROPIC_API_KEY"))
    return False


def rulebook_is_newer_than_spec(spec_path: Path) -> bool:
    """True if the rulebook has been updated since the spec was last written."""
    if not spec_path.exists():
        return True
    if not RULEBOOK_PATH.exists():
        return False
    return RULEBOOK_PATH.stat().st_mtime > spec_path.stat().st_mtime


# =============================================================================
# MODEL TIER CONFIGURATION
# =============================================================================

MODEL_TIERS = {
    "smart": {
        "openai": "gpt-4o",
        "anthropic": "claude-sonnet-4-20250514",
        "description": "Most capable models - highest accuracy, slowest, most expensive"
    },
    "medium": {
        "openai": "gpt-4o-mini",
        "anthropic": "claude-3-5-haiku-20241022",
        "description": "Balanced models - good accuracy, moderate speed/cost"
    },
    "cheap": {
        "openai": "gpt-3.5-turbo",
        "anthropic": "claude-3-haiku-20240307",
        "description": "Budget models - faster/cheaper but less reliable"
    },
}

DEFAULT_TIER = os.environ.get("LLM_TIER", "medium")
DEFAULT_PROVIDER = os.environ.get("LLM_PROVIDER", "openai")


def get_model_for_tier(tier: str, provider: str) -> str:
    """Get the model name for a given tier and provider."""
    if tier not in MODEL_TIERS:
        print(f"Warning: Unknown tier '{tier}', using 'medium'")
        tier = "medium"
    return MODEL_TIERS[tier].get(provider, MODEL_TIERS[tier]["openai"])


def get_llm_response(prompt: str, provider: str = None, tier: str = None) -> str:
    """Get a response from the LLM."""
    provider = provider or DEFAULT_PROVIDER
    tier = tier or DEFAULT_TIER
    model = get_model_for_tier(tier, provider)

    print(f"  Calling {provider.upper()} ({model})...")
    sys.stdout.flush()

    try:
        if provider == "openai":
            import openai
            client = openai.OpenAI()
            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,  # Lower temp for more consistent outputs
                max_tokens=4096,
            )
            return response.choices[0].message.content
        elif provider == "anthropic":
            import anthropic
            client = anthropic.Anthropic()
            response = client.messages.create(
                model=model,
                max_tokens=4096,
                temperature=0.3,
                messages=[{"role": "user", "content": prompt}],
            )
            return response.content[0].text
        else:
            raise ValueError(f"Unknown provider: {provider}")
    except Exception as e:
        print(f"Warning: LLM call failed: {e}")
        return f"[LLM generation failed: {e}]"


# =============================================================================
# LLM-DRIVEN SPECIFICATION GENERATION
# =============================================================================

def generate_specification(rulebook: dict, provider: str = None, tier: str = None) -> str:
    """Use LLM to generate plain English specification from rulebook."""

    provider = provider or DEFAULT_PROVIDER
    tier = tier or DEFAULT_TIER

    rulebook_name = rulebook.get('Name', 'Untitled Rulebook')

    prompt = f"""You are a technical writer creating a specification document.

Given this rulebook JSON, write a clear English specification document that explains
how to compute each calculated field.

RULEBOOK:
```json
{json.dumps(rulebook, indent=2)}
```

Write a specification document in Markdown format that includes:

1. A title and brief overview of what this rulebook does
2. For each entity:
   - List the input fields (type="raw") with their names, types, and descriptions
   - For EVERY derived field — including type="calculated", type="lookup",
     AND type="aggregation" — explain in plain English exactly how to compute it:
     - For "calculated" fields: describe the computation from this entity's own inputs.
     - For "lookup" fields: name the foreign table, the join key on each side, and
       which column to return. E.g. "RoleName comes from the Roles table: find the
       Roles row where Roles.RoleId equals this Employee's Role, then return its Name."
     - For "aggregation" fields: name the source table, the filter predicate, and the
       aggregation (count/sum/etc). E.g. "CountOfEmployees counts the rows in Employees
       where Employees.Role equals this Role's RoleId."
     - Include the original formula for reference.
     - Provide a concrete example using data from the rulebook if available.

The specification should be clear enough that someone could follow it to compute
the correct values for every derived field — scalar, lookup, AND aggregation —
without seeing the original formulas.

IMPORTANT: Focus on the actual content of this specific rulebook ("{rulebook_name}").
Do not include generic boilerplate about "language classification" or unrelated domains."""

    print(f"  Generating specification via LLM...")
    return get_llm_response(prompt, provider, tier)


# =============================================================================
# MAIN
# =============================================================================

def main():
    GENERATED_FILES = [
        'test-results.md',
        'specification.md',
    ]

    if '--clean' in sys.argv:
        if handle_clean_arg(GENERATED_FILES, "English substrate: Removes test-results.md and specification.md."):
            return 0

    parser = argparse.ArgumentParser(
        description="Generate English specification from any Effortless Rulebook (LLM-driven)"
    )
    parser.add_argument(
        "--tier", "-t",
        choices=["smart", "medium", "cheap"],
        default=DEFAULT_TIER,
        help=f"Model intelligence tier (default: {DEFAULT_TIER})"
    )
    parser.add_argument(
        "--provider", "-p",
        choices=["openai", "anthropic"],
        default=DEFAULT_PROVIDER,
        help=f"LLM provider (default: {DEFAULT_PROVIDER})"
    )
    parser.add_argument(
        "--regenerate", "-r",
        action="store_true",
        help="Force regeneration regardless of rulebook/spec mtimes"
    )
    parser.add_argument(
        "--no-prompt",
        action="store_true",
        help="Skip the interactive LLM-confirmation prompt"
    )

    args = parser.parse_args()

    candidate_name = get_candidate_name_from_cwd()
    provider = args.provider
    spec_file = Path("specification.md")

    # ------------------------------------------------------------------
    # Decide whether regeneration is needed.
    #   - --regenerate: always regenerate
    #   - default: regenerate iff rulebook is newer than spec (or spec missing)
    # ------------------------------------------------------------------
    needs_regen = args.regenerate or rulebook_is_newer_than_spec(spec_file)

    if not needs_regen:
        print(f"\n{DIM}specification.md is up to date (rulebook not newer). Skipping.{NC}")
        return 0

    # ------------------------------------------------------------------
    # LLM reachability check. If no API key, leave spec untouched.
    # There is no repo-committed cache to substitute — the spec is
    # deterministically derived from the rulebook whenever the LLM is
    # reachable, so stale-but-present is the honest offline behavior.
    # ------------------------------------------------------------------
    if not has_api_key(provider):
        print(f"\n{YELLOW}No API key found for {provider.upper()}.{NC}")
        if spec_file.exists():
            print(f"  {DIM}Leaving existing specification.md in place (it may be stale).{NC}")
            print(f"  {DIM}Set {provider.upper()}_API_KEY to regenerate from the current rulebook.{NC}")
            return 2
        print(f"  {YELLOW}No specification.md exists and LLM is unreachable.{NC}")
        print(f"  {DIM}Set {provider.upper()}_API_KEY to generate a specification.{NC}")
        return 2

    # ------------------------------------------------------------------
    # Generate via LLM
    # ------------------------------------------------------------------
    print(f"Generating {candidate_name} substrate...")

    try:
        rulebook = load_rulebook()
        rulebook_name = rulebook.get('Name', 'Unknown')
        print(f"  Loaded rulebook: {rulebook_name}")
    except FileNotFoundError as e:
        print(f"Error: {e}")
        return 1

    print("\n=== Generating Specification (LLM-driven) ===")

    if not args.no_prompt and sys.stdin.isatty():
        model = get_model_for_tier(args.tier, args.provider)
        print(f"\n  This will call {args.provider.upper()} ({model}) to generate the specification.")
        try:
            response = input("  Proceed with LLM call? [y/N]: ").strip().lower()
            if response not in ('y', 'yes'):
                print("  Skipping LLM call.")
                return 2
        except (EOFError, KeyboardInterrupt):
            print("\n  Skipping LLM call.")
            return 2

    spec_content = generate_specification(rulebook, args.provider, args.tier)
    with open("specification.md", 'w', encoding='utf-8') as f:
        f.write(spec_content)
    print("  Created specification.md")

    print(f"\nDone generating {candidate_name} substrate.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
