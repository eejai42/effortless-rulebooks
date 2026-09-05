<!-- DERIVED ARTIFACT — DO NOT EDIT BY HAND -->
<!-- Source: https://raw.githubusercontent.com/EffortlessAPI/effortless-skills/main/skills/effortless-bootstrap/SKILL.md -->
<!-- Mirrored by: docs/skills/clone-skills.sh -->
<!-- Update: cd effortless-platform && effortless clone-skills -->

---
name: effortless-bootstrap
description: >
  Use when the user wants to bootstrap a new effortless project from raw text,
  requirements, or a description of a platform. Also known as the "Shadle steps"
  or "effortless-shadle-steps". Covers the full pipeline from raw input text
  through vocabulary extraction, glossary, narrative, mock data, schema
  normalization, to a populated effortless-rulebook.json (optionally mirrored to
  Airtable for teams that want a grid).

  **Scope (load gate):** Effortless projects, OR when the user explicitly asks to bootstrap a new Effortless project from raw text/requirements.
audience: customer
---

# Effortless Bootstrap — The Shadle Steps

This skill describes the full bootstrap process for turning raw requirements or platform descriptions into a formal `effortless-rulebook.json`. This is how a new project goes from "here's what we're building" to "we're in the effortless loop."

The whole pipeline targets the **rulebook hub** — that's the destination (Rulebook-First, the best-practice default). If the team wants a human-friendly grid, Airtable is one optional surface you can populate from the rulebook afterward (a sibling of Excel/Notion); it's never a required step.

## User-facing documentation discipline

Throughout this bootstrap — especially in any README or narrative description generated for the client — **lead with what the system does, not how it was built.**

The rulebook, any upstream-surface integration (Airtable/Excel), calculated fields, and DAG structure are implementation details. They belong in CLAUDE.md and developer guides, not in user-facing materials. When generating glossaries, narratives, or mockups, focus on the business vocabulary and workflows, not the ERB infrastructure.

## Overview

The bootstrap is a structured pipeline that progressively formalizes raw input:

```
Raw Text Input
    |
    v
Word Extraction (every word used to describe the platform)
    |
    v
Domain Vocabulary (trimmed to domain-specific terms only)
    |
    v
Glossary (grouped by area, 1-2 sentences per term)
    |
    v
Narrative Description (uses every vocabulary word)
    |
    v
Mock Data & Scenarios (exercises every business rule)
    |
    v
Normalized Schema (formal structure for every element)
    |
    v
effortless-rulebook.json  ← THE HUB / SSoT
    (DAG-structured; every vocab word appears; descriptions on every
     table + field; seeded with mock data; extended with 1st/2nd/
     higher-order inferences into a comprehensive DAG)
    |
    v
Now in the loop
```

Everything from the normalized schema onward is authored **directly in the
rulebook JSON** — descriptions, mock data, and the full inference DAG. LLMs edit
the rulebook natively, so there's no round-trip through an external tool.

> **Optional — mirror to a grid.** If the team wants Airtable (or Excel) as a
> human-friendly review surface, populate it *from* the finished rulebook via
> `rulebook-to-airtable` (reverse-sync). That's a downstream convenience, not a
> bootstrap step. The older flow that built tables in Airtable via OMNI first and
> then pulled them back with `airtable-to-rulebook` still works for
> Airtable-connected projects — see the optional appendix at the end — but it's no
> longer the recommended path.

## Step-by-Step

### Step 1: Word Extraction

Split the raw input text by word so that **every word** used to describe the platform is listed. This is an exhaustive, uncurated list.

### Step 2: Domain Vocabulary

Trim the word list down to **just domain-specific words** — terms that are unique or meaningful within this particular platform. Remove generic English words, articles, prepositions, etc.

### Step 3: Glossary

Create a `glossary.md` with the domain vocabulary:
- **Grouped by area** (e.g., "User Management", "Billing", "Workflow")
- **1-2 sentences per vocabulary word** defining its meaning in the platform context
- This formally defines the **vocabulary for the entire platform**

### Step 4: Narrative Description

Using **every one of those vocabulary words**, generate a narrative description of the platform. This is a comprehensive prose description that exercises the full vocabulary and describes how the platform works end-to-end.

### Step 5: Mock Data and Scenarios

Using every vocabulary word and the features described in the narrative:
- Create **mock data** for each entity
- Create **scenarios** that exercise each business rule and requirement
- These scenarios validate that the schema can support every use case

### Step 6: Normalized Schema

Combine the glossary, narrative, and mock data to generate a **rough schema** for every element of the platform. This is a first-pass structural definition.

### Step 7: effortless-rulebook.json

Create an `effortless-rulebook.json` based on the normalized schema:
- Must follow all ERB conventions (PascalCase tables, Name formula, DAG structure, no many-to-many)
- **Every vocabulary word must appear in at least 1 place** within the rulebook (as a table name, field name, description, or data value)
- See `effortless-conventions` and `effortless-schema` skills for structural requirements

### Step 8: Descriptions on every table and field

In the rulebook JSON, give **every table and every field** a `Description`. This
is part of the schema, not an afterthought — descriptions are what make the
generated docs, the LLM's future edits, and any downstream grid legible.

### Step 9: Seed mock data

Populate the rulebook's `data` arrays with the mock data and scenarios from
Step 5, so a fresh `effortless build` produces a DB you can actually exercise.

### Step 10: Extend the model into a comprehensive DAG

Add the inference layers directly in the rulebook:
- **1st-order inferences** — direct lookups and calculations from raw fields
- **2nd-order inferences** — calculations that depend on 1st-order fields
- **Higher-order inferences** — progressively derived fields creating a comprehensive DAG

This builds out the full analytical power of the rulebook. LLMs are strong at this
— formulas, lookups, and rollups are just fields in the JSON.

### Step 10.5 — Rulebook editor (recommended default, not required)

Before entering the loop, install **effortless-rulebook-editor** (see that
skill for why) — the human-readable sanity check for the rulebook you just
authored, plus an instant DB, API, and admin UI:

```bash
cd effortless-rulebook
effortless -install effortless-rulebook-editor \
  -i effortless-rulebook.json \
  -p rulebookPath=effortless-rulebook.json \
  -p dockerfilePath=docker/Dockerfile
bash edit-rulebook.sh
```

Both `-p` params are **required**: without them the tool emits `edit-rulebook.sh`
and `docker/` into the project root, where the script bind-mounts the whole repo.
See `effortless-rulebook-editor` for why.

**No-Docker alternative:** `effortless-rulespeak` for the same documentation
as static files:

```bash
mkdir -p rulespeak && cd rulespeak
effortless -install rulebook-to-rulespeak -i ../effortless-rulebook/effortless-rulebook.json
cd .. && effortless build
```

### Step 11: You're in the loop

With the rulebook seeded and the DAG built out, `effortless build` projects it to
Postgres (and every other output spoke). Future changes flow in via direct edits
to the rulebook JSON (the default), or — if the project opted into one — an
Airtable/Excel input spoke, each followed by `effortless build`.

---

## Optional appendix — building the schema in Airtable first (legacy path)

Only for Airtable-connected projects whose team prefers to author in the grid.
This is no longer the recommended path (Rulebook-First above is), but it still
works. It replaces Steps 8–11 above with an Airtable round-trip:

1. **OMNI prompts for initial tables** — per table, create the `Name` formula
   (`SUBSTITUTE(LOWER({Label}), " ", "-")`) and the fields that build that compound
   key. Only these structural fields at first. See `effortless-airtable-omni`.
2. **Create tables via OMNI** — `node ~/.claude/skills/effortless-airtable-omni/omni-send.mjs <baseId> '<per-table prompt>'`.
3. **Add descriptions + mock data via the Airtable REST API** — see `effortless-airtable` for the `PATCH .../fields/{id}` and record-create calls.
4. **Extend the model** in Airtable (lookups/rollups via OMNI, scalars via the API).
5. **Pull the grid into the hub** — `cd effortless-rulebook/ && effortless airtable-to-rulebook -account airtable -o effortless-rulebook.json`. This establishes Airtable as a connected *input spoke*; the rulebook is still the SSoT.

## CLI Tool for Bootstrap

The `raw-text-to-rulebook` transpiler can generate a rough (not guaranteed internally consistent) starting-point rulebook:

```bash
cd bootstrap/
effortless -install raw-text-to-rulebook -i requirements.txt -o bootstrap-rulebook.json
effortless build
```

This output is a **starting point** — it needs to be reviewed, normalized, and extended through the Shadle steps above before it becomes a production rulebook.

## Artifacts Produced

| Artifact | Location | Purpose |
|----------|----------|---------|
| Word list | `bootstrap/words.txt` | Every word from the raw input |
| Domain vocabulary | `bootstrap/vocabulary.txt` | Domain-specific terms only |
| Glossary | `bootstrap/glossary.md` | Formal definitions grouped by area |
| Narrative | `bootstrap/narrative.md` | Full prose description using all vocab |
| Mock data | `bootstrap/mock-data/` | Test data and scenarios |
| Bootstrap rulebook | `bootstrap/bootstrap-rulebook.json` | Rough first-pass rulebook |
| Final rulebook | `effortless-rulebook/effortless-rulebook.json` | Production rulebook (the hub / SSoT) |
| Rulebook editor | `effortless-rulebook/edit-rulebook.sh` | Instant DB/API/admin UI + rule docs (recommended default) |
| RuleSpeak (no-Docker alt) | `rulespeak/rulespeak.html` | Plain-English rules, static files |

## See also

- `effortless-cli` — the `-install` and build commands used throughout.
- `effortless-conventions` — naming and DAG rules the rulebook must follow.
- `effortless-schema` — JSON structure the rulebook must conform to.
- `effortless-loop` — what you enter at Step 11 once the rulebook hub is seeded.
- `effortless-rulebook-editor` — Step 10.5's recommended default: instant DB/API/admin UI.
- `effortless-rulespeak` — Step 10.5's no-Docker alternative for a static plain-English sibling.
- `effortless-setup-postgres` — for projects that target Postgres, run once the rulebook is in place.
- `effortless-airtable` / `effortless-airtable-omni` — *only* for the optional Airtable-first appendix path.

## LOCALHOST MODE — read before doing anything

Before any magic-links / bases work, check whether `MAGICLINK_BASE_URL` is set to a `http://localhost:*` URL (or the operator said "use the local dev stack" / "localhost"). If so, follow [MAGIC_LINKS_REFACTOR.md §13](../../MAGIC_LINKS_REFACTOR.md#13-localhost-mode--opt-in-via-env-vars) — production URLs become localhost URLs, the magic-link email loop is replaced by debug code `424242`, and bases registration goes against the local bases server.

Operator quick-ref in localhost mode:
- magiclink server: `http://localhost:4787` (admin UI at `/`)
- bases server:     `http://localhost:4788` (admin UI at `/`)
- unified dash:     `http://localhost:4789`
- env file:         `magic-links-refactor/test-env/dev/.env` — `source` it before any curl recipe; gives you `OWNER_JWT`, `MAGICLINK_BASE_URL`, `BASES_BASE_URL`, etc.

Up-check (run before assuming the stack is live):
```
curl -fsS http://localhost:4787/install-magic-links/v1.sql >/dev/null && echo "magiclink up" || echo "magiclink DOWN"
curl -fsS http://localhost:4788/health >/dev/null && echo "bases up" || echo "bases DOWN"
```
If down, run `bash magic-links-refactor/test-env/scripts/dev-stack-up.sh`.
