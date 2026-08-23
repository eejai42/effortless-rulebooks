# English Execution Substrate

English prose documentation generated from the Effortless Rulebook using LLM-assisted Natural Language Generation.

## Current Status

**Implemented and functional.** The injector uses LLM APIs (OpenAI or Anthropic) to generate English documentation from the rulebook schema. The test runner uses an LLM to read the generated documentation and infer computed values, demonstrating round-trip verification.

Current test score: **~85%** - Some edge cases are misinterpreted by the LLM reader.

## Model Tiers

The substrate supports configurable model tiers to balance accuracy vs cost:

| Tier | OpenAI Model | Anthropic Model | Description |
|------|--------------|-----------------|-------------|
| smart | gpt-4o | claude-sonnet-4 | Highest accuracy, slowest, most expensive |
| medium | gpt-4o-mini | claude-3.5-haiku | Balanced accuracy and cost (default) |
| cheap | gpt-3.5-turbo | claude-3-haiku | Fastest/cheapest, less reliable |

Configure via `--tier` flag or `LLM_TIER` environment variable.

## Architecture: Deterministic Structure + Stochastic Content

This substrate follows the same pattern as all other ERB substrates:

```
┌─────────────────────────────────────────────────────────────┐
│                    inject-into-english.py                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   1. Load rulebook JSON (structured data)                   │
│                          ↓                                  │
│   2. DETERMINISTIC: Create document skeleton                │
│      - Fixed sections: Glossary, Specification, Profiles    │
│      - Fixed headings, tables, formatting                   │
│                          ↓                                  │
│   3. STOCHASTIC (LLM): For EACH piece of content:          │
│      - Call LLM to generate prose for ONE predicate         │
│      - Call LLM to generate prose for ONE candidate         │
│      - Call LLM to generate prose for ONE formula           │
│                          ↓                                  │
│   4. Assemble: Insert LLM outputs into deterministic slots  │
│                          ↓                                  │
│   5. Output: specification.md, glossary.md, profiles.md     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Key Principle: LLM as Content Generator, Not Structure Generator

**WRONG approach (what we must NOT do):**
```python
# DON'T: Write static prose directly
content = """
Name is the URL slug for the workflow.
DisplayName is the human-readable title.
"""
```

**CORRECT approach (what we MUST do):**
```python
# DO: Call LLM for each piece of content
for predicate in predicates:
    prompt = f"""
    Given this predicate from the ERB rulebook:
    Name: {predicate['name']}
    Formula: {predicate['formula']}

    Write a 2-3 sentence human-readable explanation of what this predicate means.
    """
    explanation = get_llm_response(prompt)
    glossary[predicate['name']] = explanation
```

## Document Generation Process

### 1. Glossary Generation

For each predicate in the schema:
```
┌────────────────────────────────────────┐
│ Input: predicate name, formula, type   │
│              ↓                         │
│ LLM Prompt: "Explain this predicate    │
│             in plain English..."       │
│              ↓                         │
│ Output: Human-readable definition      │
└────────────────────────────────────────┘
```

### 2. Record Profile Generation

For each record in the domain:
```
┌────────────────────────────────────────┐
│ Input: record data (all fields)        │
│              ↓                         │
│ LLM Prompt: "Given these properties,   │
│             explain how the calculated │
│             fields are derived..."     │
│              ↓                         │
│ Output: Prose explanation paragraph    │
└────────────────────────────────────────┘
```

### 3. Formula Explanation Generation

For each calculated field:
```
┌────────────────────────────────────────┐
│ Input: formula, dependencies           │
│              ↓                         │
│ LLM Prompt: "Explain this formula      │
│             as step-by-step English    │
│             instructions..."           │
│              ↓                         │
│ Output: Algorithm in plain English     │
└────────────────────────────────────────┘
```

## Testing: Round-Trip Verification

The test proves the English is accurate by having an LLM read it back:

```
┌─────────────────────────────────────────────────────────────┐
│                       take-test.py                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   1. Load the generated English documents                   │
│                          ↓                                  │
│   2. For each record in blank-test.json:                │
│      - Feed English spec + record data to LLM            │
│      - Ask LLM to compute values based on English rules     │
│                          ↓                                  │
│   3. Write inferred values to test-answers.json            │
│                          ↓                                  │
│   4. Orchestrator compares to answer-key.json              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

If the generated English is clear and accurate, the LLM reader should be able to reproduce the correct computed values.

## Generated Files

| File | Description |
|------|-------------|
| `specification.md` | **GENERATED** - LLM-generated formula explanations with deterministic structure |
| `glossary.md` | **GENERATED** - LLM-generated predicate definitions with deterministic format |
| `record-profiles.md` | **GENERATED** - LLM-generated reasoning for each candidate |
| `test-answers.json` | **GENERATED** - Test execution results for grading |
| `test-results.md` | **GENERATED** - Human-readable test report |

## Source Files (Not Cleaned)

| File | Description |
|------|-------------|
| `inject-into-english.py` | LLM-powered documentation generator |
| `inject-substrate.sh` | Shell wrapper for orchestration |
| `take-test.py` | Test runner using LLM round-trip verification |
| `take-test.sh` | Shell wrapper for test runner |
| `README.md` | This documentation |

## Cleaning

To remove all generated files:

```bash
python3 inject-into-english.py --clean
```

This will remove:
- `specification.md`
- `glossary.md`
- `record-profiles.md`
- `test-answers.json`
- `test-results.md`

## Why This Matters

This approach ensures:

1. **Reproducibility** - Same rulebook always produces same document structure
2. **Testability** - We can verify the English accurately describes the logic
3. **Traceability** - Each piece of English maps to a specific rulebook element
4. **Consistency** - LLM generates each piece following the same pattern

The English substrate proves that natural language can be a valid "execution substrate" when the prose is generated systematically from structured data.

## Running

```bash
# Generate English documentation (requires OPENAI_API_KEY or ANTHROPIC_API_KEY)
python3 inject-into-english.py

# Run tests (LLM reads documentation and infers values)
./take-test.sh

# Use a specific tier
python3 inject-into-english.py --tier smart
```

## Source

Generated from: `effortless-rulebook/effortless-rulebook.json`
