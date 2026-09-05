<!-- DERIVED ARTIFACT — DO NOT EDIT BY HAND -->
<!-- Source: ClaudeSkills table in effortless-platform/effortless-rulebook/effortless-rulebook.json -->
<!-- Regenerate: cd effortless-platform && effortless platform-rulebook-to-docs -->
<!-- Skill mirrors: cd effortless-platform && effortless clone-skills -->

# Claude Skills — The ERB Learning Curve, Pre-Encoded

Before ERB, every developer had to teach their LLM the conventions from scratch: PascalCase table names, how FK slugs work, what the Effortless loop is, when to use `vw_*` views vs base tables, how `effortless build` sequences transpilers. That learning curve used to cost hours to days per project.

Skills pre-encode that learning once. Load a skill and the LLM already knows the conventions, the pipeline mechanics, the formula semantics. The rulebook is the subject matter; the skills are the curriculum. Without the rulebook there is nothing for the skills to operate on. Without the skills the LLM has to rediscover the conventions by trial and error.

Each skill file below is a live mirror pulled from the [effortless-skills](https://github.com/EffortlessAPI/effortless-skills) repo (renamed from effortless-claude) by `clone-skills.sh`. The files in `docs/skills/*/SKILL.md` are **derived** — do not edit them here; edit the source and re-run the clone.

---

## Skills highlighted in the README

These are the skills most directly useful when working with this repo:

| Skill | Category | When to use |
|---|---|---|
| [/effortless-cmcc](effortless-cmcc/SKILL.md) | theory | Grounding any evaluative "why" question about ERB in the CMCC conjecture |
| [/effortless-orchestrator](effortless-orchestrator/SKILL.md) | pipeline | Top-level driver for Airtable-sourced ERB builds |
| [/effortless-workflow](effortless-workflow/SKILL.md) | pipeline | Making changes to any ERB project — the canonical edit cycle |
| [/effortless-loop](effortless-loop/SKILL.md) | pipeline | The CHANGE-RULE → REBUILD → CONSUME-VIEWS iterative cycle |
| [/effortless-bootstrap](effortless-bootstrap/SKILL.md) | setup | Bootstrapping a new effortless project from raw requirements |
| [/effortless-conventions](effortless-conventions/SKILL.md) | modeling | Naming rules, DAG structure, PascalCase, FK patterns |
| [/effortless-setup-postgres](effortless-setup-postgres/SKILL.md) | setup | Setting up a Postgres-backed ERB project from an Airtable base |
| [/effortless-rulebooks](effortless-rulebooks/SKILL.md) | modeling | Empirical proof that CMCC works — conformance suite, ExplainDAG |
| [/effortless-react-explainer-dag](effortless-react-explainer-dag/SKILL.md) | features | Adding the React DAG visualization to any ERB project |

---

## Full skill catalog

| Skill | Category | Audience | Summary |
|---|---|---|---|
| [/effortless-airtable](effortless-airtable/SKILL.md) | data | customer | Schema and data changes via the Airtable API in an ERB project |
| [/effortless-airtable-omni](effortless-airtable-omni/SKILL.md) | data | customer | Airtable schema changes the API cannot handle — formula, lookup, rollup fields |
| [/effortless-bases](effortless-bases/SKILL.md) | setup | customer | Spin up a Postgres base |
| [/effortless-bootstrap](effortless-bootstrap/SKILL.md) | setup | customer | Bootstrap a new effortless project from raw text or requirements |
| [/effortless-skills-updates](effortless-skills-updates/SKILL.md) | ecosystem | customer | Checking and applying updates to the effortless-skills skill set |
| [/effortless-cli](effortless-cli/SKILL.md) | tooling | customer | Installing, updating, and using the `effortless` CLI binary |
| [/effortless-cmcc](effortless-cmcc/SKILL.md) | theory | customer | The CMCC conjecture — the theoretical floor under all ERB tooling |
| [/effortless-conventions](effortless-conventions/SKILL.md) | modeling | customer | ERB naming conventions, DAG structure rules, FK patterns |
| [/effortless-diagnostics](effortless-diagnostics/SKILL.md) | tooling | customer | Diagnosing ERB project health, validating DAG integrity |
| [/effortless-ecosystem](effortless-ecosystem/SKILL.md) | ecosystem | customer | What repos exist in the effortless/SSoTme ecosystem and how they fit together |
| [/effortless-excel-export](effortless-excel-export/SKILL.md) | features | customer | Adding live Excel export to any ERB project backed by Postgres |
| [/effortless-init](effortless-init/SKILL.md) | setup | customer | Initializing a new effortless project |
| [/effortless-loop](effortless-loop/SKILL.md) | pipeline | customer | The iterative CHANGE-RULE → REBUILD → CONSUME-VIEWS cycle |
| [/effortless-magic-links](effortless-magic-links/SKILL.md) | features | general | Passwordless email-code auth for any Postgres-backed project |
| [/effortless-mcp](effortless-mcp/SKILL.md) | tooling | customer | The Effortless MCP server — exposes ~54 transpiler tools to any MCP agent |
| [/effortless-orchestrator](effortless-orchestrator/SKILL.md) | pipeline | customer | Top-level orchestrator for Airtable-sourced ERB builds |
| [/effortless-pipeline](effortless-pipeline/SKILL.md) | pipeline | customer | The ERB build pipeline — effortless.json, transpilers, sequencing |
| [/effortless-query](effortless-query/SKILL.md) | tooling | customer | Querying an effortless-rulebook.json file |
| [/effortless-rationale](effortless-rationale/SKILL.md) | theory | customer | Explaining and defending ERB/CMCC to skeptics |
| [/effortless-react-explainer-dag](effortless-react-explainer-dag/SKILL.md) | features | customer | Adding the React DAG visualization to any ERB project |
| [/effortless-rulebooks](effortless-rulebooks/SKILL.md) | modeling | customer | Empirical proof that CMCC works — conformance suite, ExplainDAG, multi-substrate equivalence |
| [/effortless-schema](effortless-schema/SKILL.md) | modeling | customer | The structure of effortless-rulebook.json — field types, formula syntax, _meta |
| [/effortless-setup-postgres](effortless-setup-postgres/SKILL.md) | setup | customer | Setting up an ERB project with Postgres from an existing Airtable base |
| [/effortless-sql](effortless-sql/SKILL.md) | data | customer | Working with ERB-generated SQL — vw_* views, generated files, SQL function patterns |
| [/effortless-ssotme-protocol](effortless-ssotme-protocol/SKILL.md) | pipeline | customer | Writing and editing effortless.json transpiler entries |
| [/effortless-workflow](effortless-workflow/SKILL.md) | pipeline | customer | Making changes to an ERB project — the canonical edit cycle |

---

> Individual skill files in `docs/skills/*/SKILL.md` are derived mirrors. Run `./docs/skills/clone-skills.sh` (or `cd effortless-platform && effortless clone-skills`) to pull fresh copies from [effortless-skills](https://github.com/EffortlessAPI/effortless-skills) (renamed from effortless-claude).
