<!-- GENERATED FILE — DO NOT EDIT. -->
<!-- Source: effortless-platform/effortless-rulebook/effortless-rulebook.json (table: `FuzzyGradingProviders`) -->
<!-- Regenerate with: cd effortless-platform && effortless build -->

# Fuzzy Grading — LLM Providers

LLM providers usable for fuzzy grading of the English substrate — the ONLY non-deterministic substrate. All other substrates execute formulas deterministically; English requires an LLM to interpret prose into computed values. Use low temperature (0.1) for repeatability.

| Provider | Model | Env Var | Determinism | Typical Accuracy | Speed (relative) | Local? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| OpenAI | GPT-4o | OPENAI_API_KEY | non-deterministic | ~85% on rulebook English specs | 2-3 orders of magnitude slower | — | Default provider for llm-fuzzy-grader.py. |
| Anthropic | Claude Sonnet | ANTHROPIC_API_KEY | non-deterministic | ~85% on rulebook English specs | 2-3 orders of magnitude slower | — | Alternative to OpenAI. Comparable accuracy on this task. |
| Ollama (local) | Llama 3.2 | — | non-deterministic | lower than hosted models | 3-4 orders of magnitude slower on CPU; less on GPU | ✓ | Runs against localhost:11434. Useful for offline / no-cost runs at the cost of accuracy. |
