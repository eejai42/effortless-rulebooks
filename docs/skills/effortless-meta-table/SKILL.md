<!-- DERIVED ARTIFACT — DO NOT EDIT BY HAND -->
<!-- Source: https://raw.githubusercontent.com/EffortlessAPI/effortless-skills/main/skills/effortless-meta-table/SKILL.md -->
<!-- Mirrored by: docs/skills/clone-skills.sh -->
<!-- Update: cd effortless-platform && effortless clone-skills -->

---
name: effortless-meta-table
description: >
  Use when a rulebook needs a general-purpose, global name/value settings entity
  — the `__meta__` table. This is the one place for "random"/global/third-party/
  configuration values, choices, parameters, thresholds, and reusable phrase atoms
  that do not belong to any domain entity. It is a deliberately transpiler-IGNORED
  bag of key/value rows (NOT the `_meta` conversion-metadata section, and NOT a
  domain table). Triggers: "add a __meta__ table", "global settings table",
  "key/value config in the rulebook", "where do I put global parameters/phrases/
  thresholds", "a settings entity that won't generate a Postgres table".

  **Scope (load gate):** Effortless projects only — project root must contain `effortless.json` AND a CLAUDE.md identifying the project as ERB methodology. Do NOT load otherwise.
audience: customer
---

# The `__meta__` table — global name/value settings entity

## What it is

`__meta__` is a **general-purpose, global key/value settings entity** that lives in
the rulebook hub alongside the real tables, but is **deliberately ignored by the
transpilers**. It is the single home for everything that is *global* and does not
belong to a domain entity:

- random / global / third-party values
- configuration, choices, parameters
- thresholds and bands (the numeric atoms)
- reusable phrase atoms (literal language reused across rows)

It is just **general-purpose, global name/value configuration data. That's it.**

## What it is NOT

- **NOT the `_meta` section.** `_meta` (single underscore, no trailing) is the
  transpiler's conversion-metadata blob (`_CMCC_Summary`, `_conversion_metadata`).
  `__meta__` (double underscore both sides) is a *data entity you author* — rows of
  settings. They coexist; keep them separate.
- **NOT a domain table.** It has no FKs into it, nothing aggregates over it, it is
  not part of the DAG. It is a flat lookup bag.
- **NOT business logic.** Per-case decisions (which band applies, which sentence to
  emit) live in **calculated fragment fields on the relevant domain row**, which
  *reference* `__meta__` by key. `__meta__` holds the reusable *pieces*, never the
  case logic. (CMCC/SDLAF: a fragment is one spreadsheet-cell formula reading sibling
  fields + `__meta__` keys; no joins, no group-bys.)

## Why the double underscore — it makes the entity transpiler-ignored

Top-level rulebook keys whose name starts with `_` are treated by the transpilers as
**metadata, not tables**, and are skipped:

| Transpiler | Treats `__meta__` as a table? |
|---|---|
| `rulebook-to-postgres` | **No** — no table, no `vw_`, nothing generated |
| `rulebook-to-rulespeak` | **No** — not documented as a fact type |
| `json-hbars-transform` (plan) | **No** — not iterated as an entity |
| `rulebook-to-explainer-dag` | Embeds the rulebook JSON verbatim, so the *rows* ride along as data, but it is **not** rendered as a DAG entity node |

So `__meta__` gets the leading-underscore "ignore me" treatment **on purpose**: it is
global config that should never become a substrate table. If you ever need it
queryable from Postgres, that is a different requirement — give it a normal PascalCase
key (e.g. `GlobalSettings`) instead and accept that it generates `global_settings` +
`vw_global_settings` like any table. The whole point of `__meta__` is to be *ignored*.

## Shape

A flat key/value table object placed just before the `_meta` section:

```json
"__meta__": {
  "Description": "Global settings: the one place for random/global/third-party/configuration values, choices, parameters, thresholds, and reusable phrase atoms. Distinct from the `_meta` conversion-metadata section. Deliberately ignored by transpilers (leading underscore). Each row is one key/value setting; domain-row fragment fields reference these keys so common values/language are authored once.",
  "schema": [
    { "name": "MetaKey",    "datatype": "string", "type": "raw", "nullable": false, "Description": "Stable unique key (kebab or dotted). Fragments reference it by this key." },
    { "name": "Category",   "datatype": "string", "type": "raw", "nullable": false, "Description": "Grouping, e.g. phrase | band-threshold | band-vocabulary | parameter | choice | third-party | report-config." },
    { "name": "Value",      "datatype": "string", "type": "raw", "nullable": false, "Description": "Value as text; numbers/booleans stored as strings (see ValueType)." },
    { "name": "ValueType",  "datatype": "string", "type": "raw", "nullable": false, "Description": "How to read Value: string | number | boolean | json | phrase." },
    { "name": "Description","datatype": "string", "type": "raw", "nullable": false, "Description": "What this setting is for and where it is referenced." },
    { "name": "Source",     "datatype": "string", "type": "raw", "nullable": true,  "Description": "Provenance: case author, clinical convention, third-party doc, build-seed." }
  ],
  "data": [
    { "MetaKey": "phrase.presented-with", "Category": "phrase", "Value": "The patient presented with", "ValueType": "phrase", "Description": "Literal global opener reused across every case.", "Source": "convention" },
    { "MetaKey": "band.temperature.normal-high", "Category": "band-threshold", "Value": "99.5", "ValueType": "number", "Description": "Upper bound (degF) of the normal-temperature band.", "Source": "convention" },
    { "MetaKey": "band.temperature.text.light-fever", "Category": "band-vocabulary", "Value": "a light fever", "ValueType": "phrase", "Description": "Language for the light-fever band.", "Source": "convention" }
  ]
}
```

> Minimal `MetaKey` + `Value` is enough; `Category`/`ValueType`/`Description`/`Source`
> are recommended so the bag stays self-documenting. Drop a calculated `Name`
> (`={{MetaKey}}`) only if some surface needs a display label — it is optional since
> nothing generates from this entity.

## The pattern it enables: reusable atoms here, case logic on the row

`__meta__` holds the **reusable atoms**; the **contextual, case-by-case decision**
lives in a calculated fragment field on the domain row. Example — a patient's
temperature narrative is decided *on the patient row*, choosing among band phrases
stored in `__meta__`:

- `__meta__`: `band.temperature.normal-high = 99.5`, `band.temperature.fever-high = 100.5`,
  `band.temperature.text.normal = "a normal temperature"`, `…text.light-fever`, `…text.severe-fever`.
- `Individuals.TemperatureNarrative` (calculated, on the row): bands the row's own
  `{{TemperatureF}}` against the thresholds and emits the matching phrase.

This keeps language **DRY** (authored once in `__meta__`) while the *choice* stays
**contextual and per-case** — not a globally imposed template.

## How to add one

1. Confirm the project is an ERB project (load gate).
2. Ask permission before editing the rulebook (it is the SSoT).
3. Add the `__meta__` table object to `effortless-rulebook/effortless-rulebook.json`,
   placed just before the `_meta` conversion-metadata section.
4. `effortless build`. Expect **no** new Postgres table/view for `__meta__` — that is
   correct. Verify with `psql -c "\dt *meta*"` returning nothing for `__meta__`, while
   your real tables are present.
5. Reference its keys from calculated fragment fields on domain rows; never put case
   logic in `__meta__` itself.

## See also
- `effortless-schema` — the `_meta` conversion section (the thing `__meta__` is NOT).
- `effortless-conventions` — naming/DAG/FK rules for the *real* tables.
- `effortless-rulespeak` — how rules surface as plain English (ignores `__meta__`).
