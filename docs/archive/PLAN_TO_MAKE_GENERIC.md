# Plan: Make English Substrate Generic

## Current Problem

The `inject-into-english.py` is hardcoded for the "Is Everything a Language?" rulebook:
- References `LanguageCandidates` entity directly
- References `IsEverythingALanguage` entity
- Hardcoded language classification criteria
- Hardcoded prompts about "language classification"

This means when you switch to a different rulebook (e.g., "DEMO: Customer FullName"), the English substrate still generates documentation about "language classification" instead of the actual domain.
# Plan: Make English Substrate Generic (Simplified)

## Core Insight

**Let the LLM do the work.** Instead of writing a formula parser to convert `={{LastName}} & ", " & {{FirstName}}` into English, just send the rulebook JSON to the LLM and ask it to write the English specification.

## Architecture

```
┌─────────────────────┐      ┌─────────────────────┐      ┌─────────────────────┐
│  effortless-        │      │  specification.md   │      │  test-answers/      │
│  rulebook.json      │─LLM─▶│  (English spec)     │─LLM─▶│  *.json             │
└─────────────────────┘      └─────────────────────┘      └─────────────────────┘
        INJECT STEP                                           TAKE TEST STEP
```

**Two LLM calls, zero formula parsing.**

## Files to Modify

### 1. `inject-into-english.py` - Simplify drastically

**Current:** 425 lines with regex formula parsing, pattern matching, manual English generation.

**New:** ~50-80 lines. Just:
1. Load `effortless-rulebook.json`
2. Send to LLM with prompt: "Write an English specification for this rulebook"
3. Save response as `specification.md`

```python
def generate_specification(rulebook: dict, provider: str, tier: str) -> str:
    """Use LLM to generate plain English specification from rulebook."""

    prompt = f"""You are a technical writer. Given this rulebook JSON, write a clear
English specification document that explains how to compute each calculated field.

For each entity with calculated fields:
1. List the input fields and their types
2. For each calculated field, explain in plain English exactly how to compute it
3. Include examples where helpful

The specification should be clear enough that someone could follow it to compute
the correct values.

RULEBOOK:
```json
{json.dumps(rulebook, indent=2)}
```

Write the specification in Markdown format."""

    return get_llm_response(prompt, provider, tier)
```

**What gets deleted:**
- `parse_formula()` - regex formula parsing
- `formula_to_plain_english()` - pattern matching for &, IF, CONCATENATE, etc.
- Manual string building in `generate_specification()`
- All the edge case handling

### 2. `take-test.py` - Already correct

The current implementation already:
- Loads `specification.md` (the English spec)
- Loads blank tests from `testing/blank-tests/*.json`
- Uses LLM to compute values based on the English specification
- Outputs to `test-answers/*.json`

**No changes needed** - this file is already generic and LLM-driven.

### 3. `glossary.md` - Optional, consider removing

The glossary is redundant if the specification is well-written. Consider:
- Option A: Remove glossary generation entirely (specification.md has everything)
- Option B: Keep it but also LLM-generate it (same pattern as specification)

## What This Eliminates

| Removed Code | Why Not Needed |
|--------------|----------------|
| `parse_formula()` | LLM reads formulas natively |
| `formula_to_plain_english()` | LLM explains formulas better than regex |
| Pattern matching for `&`, `IF`, `+`, etc. | LLM handles all formula types |
| Edge case handling | LLM generalizes naturally |
| ~350 lines of code | Replaced by ~30 lines + LLM prompt |

## Testing

After implementation:
1. Run `./orchestrate.sh` and select English substrate
2. Check that `specification.md` correctly describes the formulas in plain English
3. Run take-test and verify computed values are correct

## Implementation Checklist

- [x] Rewrite `inject-into-english.py` to use LLM for specification generation
- [x] Remove all formula parsing code
- [x] Decide on glossary.md (removed - specification.md has everything)
- [x] Test with Customer FullName rulebook
- [x] Verify the two-step LLM flow works end-to-end
