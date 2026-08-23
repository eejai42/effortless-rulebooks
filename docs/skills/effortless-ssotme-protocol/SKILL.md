<!-- DERIVED ARTIFACT — DO NOT EDIT BY HAND -->
<!-- Source: https://raw.githubusercontent.com/effortlessapi/effortless-claude/main/skills/effortless-ssotme-protocol/SKILL.md -->
<!-- Mirrored by: docs/skills/clone-skills.sh -->
<!-- Update: cd effortless-platform && effortless clone-skills -->

---
name: effortless-ssotme-protocol
description: >
  Use when writing or editing effortless.json files, registering transpilers,
  or explaining the ssotme:// protocol. This is the canonical reference for the
  exact effortless.json schema — load it any time you are about to emit a
  ProjectTranspilers entry or a full effortless.json payload. Prevents the
  most common hallucination errors: wrong key names (Transpilers vs
  ProjectTranspilers), invented fields, wrong CLI flag shapes.

  **Scope (load gate):** Any Effortless project. Load proactively before
  emitting any effortless.json content, even partial snippets.
audience: customer
---

# The ssotme:// Protocol — Canonical Reference

## What ssotme:// Is

`ssotme://` is an **open transpiler registry protocol** hosted under
[github.com/SSoTme](https://github.com/SSoTme). The `effortless` CLI is its
local driver. Think of it as the HTTP layer of the effortless stack — for
anyone running effortless-claude, this protocol is the operating system.

A **transpiler** = one well-defined input artifact → one well-defined output
artifact. Transpilers are **registered, not bundled**. `effortless -install
<name>` clones a transpiler from its source repo, writes its registration into
`effortless.json`, and from then on `effortless build` runs each registered
transpiler in order.

The **IR** (`effortless-rulebook.json`) is the contract. Every transpiler must
respect its shape. Same rulebook in → same artifact out (determinism).

---

## The effortless.json Schema — Exact Field Names

This is the canonical schema. Every field name here is exact and case-sensitive.
Do not invent fields that are not listed here.

```json
{
  "Name": "project-name",
  "Description": "Optional human description",
  "SSoTmeProjectId": "uuid-here",
  "ShowHidden": false,
  "ShowAllFiles": false,
  "CurrentPath": "",
  "SSoTmeProjectFiles": null,
  "ProjectSettings": [
    { "Name": "project-name",  "Value": "my-project" }
  ],
  "ProjectTranspilers": [
    {
      "IsSSoTTranspiler": false,
      "Name": "rulebooktopostgres",
      "RelativePath": "/postgres",
      "CommandLine": "rulebook-to-postgres -i ../effortless-rulebook/effortless-rulebook.json",
      "IsDisabled": false,
      "LastVersionUsed": "v2026.04.23.1357",
      "LastUrl": "https://...",
      "Enabled": true,
      "Description": "Generate Postgres SQL from the rulebook"
    }
  ]
}
```

*(An Airtable-connected project additionally carries a `baseId` + `_apikey_` in
`ProjectSettings` and an `airtabletorulebook` input-spoke entry. Airtable is one
optional surface, a sibling of Excel/Notion — not a required part of the schema.)*

### Valid fields on a transpiler entry

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `Name` | string | YES | camelCase, no spaces, matches transpiler name |
| `RelativePath` | string | YES | Path from project root where transpiler runs. Leading `/` is conventional |
| `CommandLine` | string | YES | Full CLI invocation including all flags |
| `IsDisabled` | boolean | YES | `true` = skipped by `effortless build`; `false` = runs |
| `IsSSoTTranspiler` | boolean | no | Usually `false`; set by CLI on install |
| `Enabled` | boolean | no | Redundant with `IsDisabled`; written by CLI, not you |
| `Description` | string | no | Human-readable label |
| `LastVersionUsed` | string | no | Written by CLI after a run; do not invent |
| `LastUrl` | string | no | Written by CLI after a run; do not invent |

### Fields that DO NOT EXIST — never emit these

- ~~`Transpilers`~~ → correct key is **`ProjectTranspilers`**
- ~~`Inputs`~~ → use `-i` flag in `CommandLine`
- ~~`Outputs`~~ → use `-o` flag in `CommandLine`
- ~~`InputFile`~~ → does not exist
- ~~`OutputFile`~~ → does not exist
- ~~`Parameters`~~ → use `-p key=value` in `CommandLine`
- ~~`Type`~~ → does not exist
- ~~`Version`~~ → does not exist
- ~~`Source`~~ → does not exist
- ~~`Target`~~ → does not exist
- ~~`TranspilerName`~~ → field is just `Name`

---

## Transpiler Registration — How It Actually Works

The `effortless -install` command is the only correct way to register a
transpiler. **CRITICAL: run it from the directory where the transpiler's output
should land.**

```bash
effortless -install <transpiler-name> [flags]
```

### Common flags

| Flag | Meaning |
|------|---------|
| `-i <file>` | Input file path |
| `-o <file>` | Output file path |
| `-p key=value` | Parameter (repeatable) |
| `-account airtable` | Use Airtable API key from `~/.ssotme/ssotme.key` |
| `-w <ms>` | Timeout in milliseconds |

### Standard installation paths and commands

```bash
# --- output spokes (the common core) ---
# From /postgres/
effortless -install rulebook-to-postgres -i ../effortless-rulebook/effortless-rulebook.json

# From /docs/
effortless -install rulebook-to-docs

# --- input spokes (optional — only if seeding the hub from an upstream surface) ---
# From /bootstrap/
effortless -install raw-text-to-rulebook -i requirements.txt -o bootstrap-rulebook.json

# From /effortless-rulebook/   (Airtable-connected projects only)
effortless -install airtable-to-rulebook -o effortless-rulebook.json -account airtable

# From /effortless-rulebook/push-to-airtable/   (Airtable-connected projects only)
# *** MUST be disabled — reverse-sync only, never runs in normal build ***
effortless -install rulebook-to-airtable -i ../effortless-rulebook.json -account airtable
```

Every airtable-facing tool MUST include `-account airtable`. If wired, the
`rulebook-to-airtable` transpiler MUST have `"IsDisabled": true` after install —
set it manually if the CLI doesn't. It runs only via `effortless build -id`.

---

## Running the Build

```bash
effortless build       # Runs all transpilers where IsDisabled = false
effortless build -id   # Runs ALL transpilers, including disabled ones
```

`effortless build` is **fire-and-forget** — treat it like `npm install`. Do not
read generated files afterwards to verify. Do not cat SQL into context.

---

## The IR Contract

`effortless-rulebook.json` is the hub. Every transpiler either:
- **Reads** it as input (output spokes: postgres, xlsx, docs, airtable reverse-sync), or
- **Writes** it as output (input spokes: LLM direct edits — the default — plus optional raw-text-to-rulebook, airtable-to-rulebook, etc.)

No transpiler may change the IR shape. If your transpiler needs more data, add
fields to the rulebook, not to `effortless.json`.

---

## Protocol Guarantees

- **Determinism**: Same rulebook → same artifact, always.
- **Conformance**: Executable substrates that pass the conformance suite compute identical answers.
- **Open catalog**: Anyone can publish a transpiler. The protocol doesn't gate on org membership.

## Protocol Does NOT Guarantee

- Correctness of arbitrary third-party transpilers (conformance suite is the gate).
- Performance equivalence across substrates (only semantic equivalence).
- Any constraints on how a transpiler is implemented internally.

---

## Why a Protocol, Not a Monorepo

A monorepo couples every substrate to one release cadence and one maintainer's
priorities. A protocol-shaped registry keeps substrates **peripheral** —
independent evolution, different authors, added/dropped per project via
`effortless.json` without touching the core CLI or the rulebook IR.

This is the operational analogue of the CMCC claim: substrates are
interchangeable peripherals. The rulebook is the only thing that matters.

---

## Two Orgs

| Org | Owns |
|-----|------|
| **SSoTme** | Foundational tooling: CLI, ssotme:// protocol, transpiler seeds |
| **effortlessapi** | Methodology layer: rulebooks, magic-links, bases, effortless-claude skills |

---

## See Also

- `effortless-pipeline` — build flow, `-id` flag, deployment shapes (local vs Bases)
- `effortless-cli` — full CLI flag surface
- `effortless-workflow` — when to use which input spoke
- `effortless-cmcc` — the conjecture behind substrate interchangeability
- `effortless-ecosystem` — catalog of public transpiler repos
