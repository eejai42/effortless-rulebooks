<!-- DERIVED ARTIFACT — DO NOT EDIT BY HAND -->
<!-- Source: https://raw.githubusercontent.com/EffortlessAPI/effortless-skills/main/skills/effortless-airtable-omni/SKILL.md -->
<!-- Mirrored by: docs/skills/clone-skills.sh -->
<!-- Update: cd effortless-platform && effortless clone-skills -->

---
name: effortless-airtable-omni
description: >
  Use ONLY for Airtable schema changes that the API cannot handle — formula fields,
  lookup fields, rollup fields, and new table creation (which requires the Name formula).
  All scalar field changes and CRUD operations go through the Airtable API directly.
  Only relevant if the project is Airtable-connected (see the "Is this an Airtable
  project?" gate in `effortless-airtable`); otherwise this is a Rulebook-First project
  and this skill does not apply.

  **Scope (load gate):** Effortless projects only — project root must contain `effortless.json` AND a CLAUDE.md identifying the project as ERB methodology, AND the project must be Airtable-connected. Do NOT load otherwise.
audience: customer
deprecated_skill_names:
  - effortless-omni-prompt
---

# Airtable OMNI — For Non-Scalar Schema Changes Only

> Not sure if this project is Airtable-connected? Run the "Is this an Airtable
> project?" check in `effortless-airtable` first. If it isn't, this skill doesn't
> apply — the project is Rulebook-First and edits go to the hub directly.

> **Load-bearing axiom: OMNI is an escape hatch, not the default.**
> Most Airtable work goes through the REST API (see `effortless-airtable`).
> Reach for OMNI only when the API can't do the thing — formula fields,
> lookups, rollups, or a new table that needs a `Name` formula.

## When to Use OMNI vs the API

OMNI is an **escape hatch**, not the default. Most Airtable work goes through the API directly (see `effortless-airtable` skill). OMNI is only needed for operations the API cannot perform.

### Use the Airtable API directly for:
- **Scalar field changes** — adding/modifying singleLineText, number, checkbox, singleSelect, multipleSelects, date, dateTime, email, url, multilineText, multipleRecordLinks (FKs)
- **All CRUD operations** — creating, reading, updating, deleting records
- **Field renaming and descriptions**
- **Anything in the `effortless-airtable` skill**

### Use OMNI (this skill) ONLY for:
- **Formula fields** — cannot be created or modified via API
- **Lookup fields** — cannot be created via API
- **Rollup fields** — cannot be created via API
- **New table creation** — because every ERB table needs a Name formula (`SUBSTITUTE(LOWER({LabelField}), " ", "-")`) which requires OMNI

**Rule of thumb:** If the field type is in the Airtable REST API's `POST /fields` endpoint, use the API. If not, use OMNI.

---

## The Name Formula Pattern

Every ERB table's first field is `Name` — a formula that creates a lowercase, dash-separated compound key from the human-readable label field:

```
SUBSTITUTE(LOWER({DisplayName}), " ", "-")
```

For multi-source keys, nest SUBSTITUTE for special characters:
```
LOWER(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE({DisplayName}, " ", "-"), "/", "-"), "&", "-"))
```

If the label field is itself computed (e.g., `CONCATENATE({FirstName}, " ", {LastName})`), inline it:
```
LOWER(SUBSTITUTE(CONCATENATE({FirstName}, " ", {LastName}), " ", "-"))
```

This formula **can only be created via OMNI** — the API does not support formula field creation.

---

## Two Interaction Modes

### Mode 1: Human-in-the-Loop (Generate Prompts)

Generate OMNI prompts for the user to paste manually. Use when the user wants to review before executing, or when Playwright isn't available.

**Always split into two files:**

**`OMNI-PROMPT-PART1.md`** — New tables with raw fields + linked records + Name formula only:
```markdown
## Table: {TableName}

**Description:** {one-liner}

**Name formula:** `LOWER(SUBSTITUTE({DisplayName}, " ", "-"))`

### Fields
- **{FieldName}** ({type}): {description}
- **{FKField}** (Link to another record -> {TargetTable}): {description}
```

Exclude: `{Table}Id` fields, formula fields (other than Name), lookups, rollups.

**`OMNI-PROMPT-PART2.md`** — Lookups and formulas, broken up by table (OMNI works on one table at a time):
```markdown
## {TableName} — Computed Fields

### Lookups
- **{FieldName}** (Lookup): Through `{LinkedRecordField}` -> {TargetTable}.`{TargetField}`

### Formulas
- **{FieldName}** (Formula): `{AirtableFormulaExpression}`
```

DAG order within Part 2: raw-field formulas first, then lookups, then formulas that depend on lookups.

End Part 2 with an exclusion table for MANY-side rollups that were omitted.

### Mode 2: Playwright-Driven (Automated)

Launch a headed Chrome browser and drive OMNI directly. Use for automated execution of computed-field creation.

This skill includes a bundled script: **`omni-send.mjs`** (in the same directory as this SKILL.md).

#### Prerequisites

Before `omni-send.mjs` will run end-to-end, all of these must be true:

1. **Node 18+ on PATH.** The script uses ESM (`.mjs`) and modern syntax.
   `node --version` should report ≥ 18. If the user is still on Node 16,
   point them at `effortless-cli` — the same Node 20 guidance applies.
2. **Playwright + a Chromium browser.** Project-local install is preferred so
   the script runs reliably from `~/.claude/skills/effortless-airtable-omni/`:
   ```bash
   npx playwright --version 2>/dev/null \
     || { npm install -D playwright && npx playwright install chromium; }
   ```
   If you'd rather install globally, `npm i -g playwright && npx playwright install chromium`
   is fine — just be aware that some `npm` configurations restrict global installs.
3. **A headed display.** The script launches Chrome **headed** on purpose —
   the user logs in once and inspects what OMNI is doing afterwards. On a
   headless server (CI, remote SSH), it will fail or hang waiting for
   interaction. macOS / Linux desktops / WSLg are the supported environments.
4. **A persistent profile dir.** Default is `/tmp/airtable-omni-profile`.
   The first run requires the user to log in to Airtable manually inside that
   browser session; subsequent runs reuse the same profile and skip login.
   Never delete that directory unless the user has explicitly asked to log out.
5. **Network access to airtable.com.** The script navigates to
   `https://airtable.com/<baseId>` and times out (with a debug screenshot)
   if Airtable is blocked or auth-walled.
6. **A valid Airtable base id.** Pull from `effortless.json`:
   ```bash
   cat effortless.json | jq -r '.ProjectSettings[] | select(.Name == "baseId") | .Value'
   ```

If any of these are missing, **stop and tell the user** before running the
script — OMNI failures with broken prerequisites usually waste an entire
debug cycle.

#### Getting the Base ID

```bash
cat effortless.json | jq -r '.ProjectSettings[] | select(.Name == "baseId") | .Value'
```

#### Usage

The script lives at `~/.claude/skills/effortless-airtable-omni/omni-send.mjs`. Invoke it with:

```bash
# First run — log in to Airtable (session persists at /tmp/airtable-omni-profile)
node ~/.claude/skills/effortless-airtable-omni/omni-send.mjs <baseId> --login

# Send a prompt to OMNI
node ~/.claude/skills/effortless-airtable-omni/omni-send.mjs <baseId> 'Add a Formula field called "Name" with formula: LOWER(SUBSTITUTE({DisplayName}, " ", "-"))'

# Take a screenshot of current Airtable state
node ~/.claude/skills/effortless-airtable-omni/omni-send.mjs <baseId> --screenshot
```

**Output convention:**
- **stdout** — OMNI's response text (or screenshot path). This is what Claude should read.
- **stderr** — progress/debug logging. Not parsed, just for visibility.
- **Exit 0** — success. **Exit 1** — error. **Exit 2** — login required.

The script leaves the browser open after each prompt so the user can inspect. Kill it with Ctrl+C or `pkill -f omni-send` before sending the next prompt.

#### How It Works

1. Launches a **headed** Chrome with a persistent profile (login survives across runs)
2. Navigates to `https://airtable.com/<baseId>` (uses `domcontentloaded` — Airtable never reaches `networkidle`)
3. Opens OMNI via `[aria-label*="Omni"]` or `[aria-label*="AI"]`
4. Sends the prompt via `textarea[placeholder*="Ask"]`
5. Auto-clicks confirmation buttons (`button:has-text("Yes,")`) if OMNI asks
6. Polls for response stability (3 seconds of no change = done)
7. Outputs response to stdout, saves screenshot to `omni-result.png`

#### Confirmed Selectors (as of 2026-04)

| Element | Selector | Notes |
|---------|----------|-------|
| OMNI button | `[aria-label*="Omni"]` or `[aria-label*="AI"]` | Left sidebar |
| OMNI input | `textarea[placeholder*="Ask"]` | The prompt textarea |
| Confirmation | `button:has-text("Yes,")` | OMNI asks before schema changes |

These **will drift** as Airtable's UI evolves. When they break, the script dumps visible elements and saves a debug screenshot — adapt from there.

#### Granular Strategy for Computed Fields

Send one computed field at a time. More reliable than batching:

```bash
# Formula
node ~/.claude/skills/effortless-airtable-omni/omni-send.mjs $BASE_ID \
  'For the table "Orders", add a Formula field called "Name" with formula: LOWER(SUBSTITUTE({OrderNumber}, " ", "-"))'

# Lookup
node ~/.claude/skills/effortless-airtable-omni/omni-send.mjs $BASE_ID \
  'For the table "Orders", add a Lookup field called "CustomerEmail" that looks up "Email" through the "Customer" linked record.'
```

Workflow:
1. Get the base ID from `effortless.json`
2. Ensure login: `node omni-send.mjs <baseId> --login`
3. Send one field request at a time
4. Read stdout for OMNI's response, verify success
5. Kill the browser, send the next field
6. Repeat

#### Important Rules

1. **Never automate Airtable login** — the user handles it via the persistent profile
2. **Always headed** — the user must see and be able to intervene
3. **Selectors will break** — the script dumps debug info when they do; adapt accordingly
4. **Leave the browser open** — the user may want to inspect
5. **Rate limits** — kill and re-launch between prompts; 2-3 second natural delay
6. **Always run `effortless build` after Airtable changes** — after any OMNI operation that modifies Airtable schema, run `effortless build` so the Airtable spoke is pulled into the rulebook hub and downstream output spokes are regenerated. **Exception:** skip the build if you are in the middle of a batch of changes mirroring rulebook updates back to Airtable (reverse-sync) — in that case, wait until all Airtable changes are complete, then build once at the end.

---

## Airtable Formula Syntax

| Pattern | Airtable Syntax |
|---------|----------------|
| Field reference | `{FieldName}` (single braces) |
| Not equal | `!=` (not `<>`) |
| Blank check | `{Field} = BLANK()` (not `ISBLANK()`) |
| Date difference | `DATETIME_DIFF({Date1}, {Date2}, 'days')` |
| String concat | `CONCATENATE()` or `&` |
| No `=` prefix | Formulas do NOT start with `=` |
| TODAY | `TODAY()` works |
| Boolean logic | `AND()`, `OR()`, `NOT()`, `IF()` all work |

## ERB Field Rules for OMNI Prompts

1. **Table names are PascalCase** — `ShaclShapes`, NOT `shacl_shapes`
2. **`Name` is ALWAYS the first field** — formula: `SUBSTITUTE(LOWER({LabelField}), " ", "-")`
3. **`DisplayName` (or `Title`/`Label`)** comes next — the human-readable identifier
4. **NEVER include `{Entity}Id` fields** — surrogate keys are managed off-screen
5. **Links use singular PascalCase**: `Schema | link:SDCSchemas`
6. **Boolean fields MUST be specified as Checkbox type** — when telling OMNI to create a boolean/true-false field, always say "Checkbox field", never just "boolean". Example: `Add a Checkbox field called "IsActive"` (not `Add a boolean field called "IsActive"`). Airtable's native type for booleans is Checkbox.

---

## See also

- `effortless-airtable` — the **default** for everything OMNI is overkill for: scalar fields, FK links, CRUD.
- `effortless-conventions` — for the `Name` formula, PascalCase, and singular-FK rules every OMNI prompt must follow.
- `effortless-bootstrap` — for the multi-table OMNI prompt pattern (Part 1 raw + links, Part 2 lookups + formulas).
- `effortless-workflow` — for the permission checkpoints around any Airtable schema change.
- `effortless-orchestrator` — for the schema-change decision tree that decides between API and OMNI.
