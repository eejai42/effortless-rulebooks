# Skills as LLM Force Multiplier

> **The rulebook gives the LLM something to operate on; the skills give it the instructions for how to operate — together they replace a learning curve that previously cost weeks.**

Before ERB, every developer had to teach their LLM the conventions from scratch. Skills pre-encode that learning — naming rules, pipeline mechanics, formula semantics, the Effortless loop — so the LLM arrives already trained. The rulebook is the subject matter; the skills are the curriculum. Without the rulebook there is nothing for the skills to operate on. Without the skills the LLM has to rediscover the conventions by trial and error.

This is also what makes the skills section of this repo non-obvious: the skills aren't documentation for humans. They are loadable instruction sets that make an LLM competent in ERB the moment it loads them, rather than competent after it has read through every file in the repo and made a dozen mistakes. The learning curve that used to be a barrier is now a file you can curl.

---

This is a stub README. The formal source of truth for this feature is row `feature-017` in the `PlatformFeatures` table of [`effortless-platform/effortless-rulebook/effortless-rulebook.json`](../../effortless-platform/effortless-rulebook/effortless-rulebook.json). Edit through the admin portal (Home → Platform Features) or directly in the rulebook; this file MUST conform to that row.

## See also

- [Claude Skills catalog](../skills/README.md) — the full list of skills with categories and when to use each
- [What is non-linguistic?](../what-is-non-linguistic.md) — why the rulebook is self-describing to both LLMs and transpilers
- [Rulebook is a complete spec](README.complete-spec.md) — the downstream consequence: any LLM or transpiler can answer questions about the domain from the rulebook alone
- [clone-skills.sh](../skills/clone-skills.sh) — the script that pulls live skill mirrors into docs/skills/
