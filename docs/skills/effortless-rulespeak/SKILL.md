<!-- DERIVED ARTIFACT — DO NOT EDIT BY HAND -->
<!-- Source: https://raw.githubusercontent.com/EffortlessAPI/effortless-skills/main/skills/effortless-rulespeak/SKILL.md -->
<!-- Mirrored by: docs/skills/clone-skills.sh -->
<!-- Update: cd effortless-platform && effortless clone-skills -->

---
name: effortless-rulespeak
description: >
  Use when generating plain-English RuleSpeak® documentation from an
  effortless-rulebook.json — declarative business rules, vocabulary, fact
  types, definitional rules (DR-n), and traceability back to formulas.
  Installs `rulebook-to-rulespeak` and emits `rulespeak/rulespeak.md` and
  `rulespeak/rulespeak.html` on every build.

  **The no-Docker alternative to `effortless-rulebook-editor`**, which
  produces this same plain-English documentation automatically and is the
  recommended default for most projects (see that skill). Reach for this
  skill instead when the project wants portable static HTML/MD files, or
  doesn't want a Docker container running.

  Triggers: "generate rulespeak", "rulebook-to-rulespeak", "english rules
  document", "plain language rules", "business rules doc from rulebook",
  "rulespeak.md", "create a rulebook", "write a rulebook for".

  **Scope (load gate):** Effortless projects with a rulebook hub, OR any
  task that creates a new rulebook (load alongside effortless-schema).
  Does not require Airtable. For interactive in-app field provenance, use
  effortless-explainer-dag on demand instead.
audience: customer
---

# Effortless RuleSpeak® — rulebook → plain English

`rulebook-to-rulespeak` renders `effortless-rulebook.json` into **RuleSpeak®** —
a declarative, business-readable document of the same rules the formulas encode.
Every calculated, lookup, and aggregation field becomes a definitional rule;
relationships become fact types; tables become vocabulary.

This is the **lightweight, no-Docker way to get a human-readable sibling** of
a new rulebook. `effortless-rulebook-editor` produces the same content
automatically as part of its container and is the recommended default —
reach for this skill instead when you want portable static files or don't
want Docker running.

For **clickable in-app field exploration** (hover cards, DAG pages), load
**effortless-explainer-dag** separately when the user asks — that is optional,
not part of the standard rulebook-creation path.

## Recommended on rulebook creation (when not using effortless-rulebook-editor)

Whenever you create or first populate a rulebook hub — regardless of whether
Postgres, an app, or Airtable comes next — and you're not already covered by
an installed `effortless-rulebook-editor`:

1. **Install** (once per project, skip if `effortless.json` already has
   `rulebooktorulespeak`):

```bash
mkdir -p rulespeak
cd rulespeak
effortless -install rulebook-to-rulespeak -i ../effortless-rulebook/effortless-rulebook.json
cd ..
```

2. **Build** from project root:

```bash
effortless build
# or: ./start.sh build
```

3. **Verify** both outputs exist:

```
rulespeak/rulespeak.html   ← open in browser (primary human deliverable)
rulespeak/rulespeak.md     ← same content, markdown
```

4. **Tell the user** where to read the rules in English (`rulespeak/rulespeak.html`).

This is how humans sanity-check what the JSON encodes, even for "just a
rulebook."

Parent skills that mention this as the no-Docker option: **effortless-init**
(Step 3.5), **effortless-bootstrap** (after Step 10), **effortless-demo-app**
(bootstrap step 7), **effortless-setup-postgres** (after rulebook is in
place).

## Install (reference)

Expected `ProjectTranspilers` entry:

```json
{
  "Name": "rulebooktorulespeak",
  "RelativePath": "/rulespeak",
  "CommandLine": "rulebook-to-rulespeak -i ../effortless-rulebook/effortless-rulebook.json",
  "IsDisabled": false
}
```

## Build

```bash
effortless build
# or
./start.sh build
```

Output (regenerated on every build):

| File | Purpose |
|------|---------|
| `rulespeak/rulespeak.html` | Browser-readable RuleSpeak® (prefer this when handing off) |
| `rulespeak/rulespeak.md` | Same content in markdown |

## What the document contains

| Section | Content |
|---------|---------|
| **Business Vocabulary** | One term per table + derived fields |
| **Fact Types** | Cardinality from relationships |
| **Operative Rules** | Structural `must` / `must not` / `should` (from schema + optional `Constraints` table) |
| **Definitional Rules** | `DR-n` rows — one per calculated/lookup/aggregation field |
| **Traceability to Schema** | Each derived field mapped back to its formula (the hub SSoT) |

## After rulebook edits

RuleSpeak® is an **output spoke** — it regenerates on every `effortless build`.
After any hub change, rebuild; do not hand-edit `rulespeak/*`.

## Optional: semantic obligations

For deontic rules beyond schema flags (`nullable:false`), add a **`Constraints`**
table to the rulebook. Each row points at a boolean calculated field on an entity
and annotates it with `MustBeTrue` / `MustNotBeTrue` / `ShouldBeTrue`. See the
`rulebook-to-rulespeak` tool README (`UsingRulespeakConstraints.md`) for the full
column contract.

## See also

- `effortless-rulebook-editor` — the recommended default (see top of this file).
- `effortless-explainer-dag` — on-demand in-app DAG + hover RuleSpeak® (not default)
- `effortless-pipeline` — transpiler install paths and build order
- `effortless-schema` — load before authoring the rulebook JSON
- `effortless-init` — Step 3.5 wires RuleSpeak® after the hub exists
