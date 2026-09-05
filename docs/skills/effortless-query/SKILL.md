<!-- DERIVED ARTIFACT — DO NOT EDIT BY HAND -->
<!-- Source: https://raw.githubusercontent.com/EffortlessAPI/effortless-skills/main/skills/effortless-query/SKILL.md -->
<!-- Mirrored by: docs/skills/clone-skills.sh -->
<!-- Update: cd effortless-platform && effortless clone-skills -->

---
name: effortless-query
description: >
  Use when querying an effortless-rulebook.json file — listing tables, extracting
  schema without data, finding FK relationships, inspecting calculated fields and
  formulas. Activates for any project with effortless-rulebook.json or
  effortless-rulebook/ directory.

  **Scope (load gate):** Effortless projects only — project root must contain `effortless.json` AND a CLAUDE.md identifying the project as ERB methodology. Do NOT load otherwise.
audience: customer
---

# Querying the Effortless Rulebook

## CRITICAL: This Is Your ONLY Source of Schema Truth

**The rulebook is the single source of truth. NEVER read generated files (SQL, Go,
Python, etc.) to understand the schema.** Those files are projections — the rulebook
is the source. Query it with targeted one-liners that produce minimal output.

### Check for derived rulebooks first — climb the ladder, don't jump to the bottom

If `minimize-rulebook` is registered in `effortless.json`'s `ProjectTranspilers`,
the rulebook folder has increasingly high-fidelity derived files sitting right next
to `effortless-rulebook.json`. **Always start at the top and only go one rung
lower if the current file didn't answer the question:**

1. `*.derived-read-me-1st.txt` — just table/field names, one line per table.
   Read this FIRST, always. It's a complete map of the model in ~30 lines.
2. `*.derived-schema.min.json` — schema without data, most compact form.
3. `*.derived-schema.json` — schema without data, full fidelity (descriptions,
   formulas, datatypes).
4. Full `effortless-rulebook.json` — only if you genuinely need something the
   schema files don't carry.
5. `*.derived-data.json` — **on demand only.** This is the one file with actual
   data rows; never read it just to "get a sense of things." Reach for it only
   when the task requires seeing real row values.

These exist because a `minimizerulebook` transpiler ran at the top of the build.
Prefer reading these directly (they're small) over running a python one-liner
against the full `effortless-rulebook.json` — it's less work for the same answer.
Only fall back to the one-liners below if no derived files exist for this project,
or if you need to write/mutate the rulebook (writing should go through code, not
by reading tokens into context — see `effortless-workflow`).

If no derived files exist for this project, ask the user whether to install
`minimize-rulebook` — it makes querying and diffing far more token-efficient.

**For planning specifically, the minimized schema is usually the whole job.**
Adding a field, tracing a DAG dependency, deciding where a new table hooks
in, sanity-checking a relationship — all of that can be reasoned about from
`*.derived-schema.min.json` alone, without ever opening `*.derived-data.json`.
Only implementation/debugging work that needs to see actual row values
requires climbing further down the ladder to real data.

### Token Discipline

> The canonical Token Discipline statement lives in `effortless-orchestrator`.
> This section restates the rule from the rulebook-querying angle: **never read
> the full `effortless-rulebook.json` — query it.**

The rulebook JSON can be megabytes (it includes data rows). The targeted queries
below extract ONLY what you need:

- **List tables**: ~5 lines of output
- **Show one table's schema**: ~10-30 lines
- **Find relationships**: ~5-20 lines

These queries cost almost nothing. Reading the full file costs thousands of tokens
that then pollute your context for the entire rest of the conversation.

### The Pattern

```
Need schema info? → Run a one-liner query → Get 10-30 lines → Done
```

**NEVER:**
- `cat effortless-rulebook.json` (full file into context)
- `Read` the rulebook file directly
- Read generated SQL/Go/Python to understand schema
- Load the full JSON "to get a sense of things"

**ALWAYS:**
- Use the python one-liner queries below
- Or `psql -c "\d vw_tablename"` if the database is running
- Extract ONLY the specific table/field you need

## Common Queries

### List All Tables

```bash
cat effortless-rulebook.json | python3 -c "
import sys,json; d=json.load(sys.stdin)
skip={'\$schema','Name','Description','_meta'}
for k in d:
  if k not in skip and isinstance(d[k],dict) and 'schema' in d[k]:
    fields=d[k]['schema']
    print(f'  {k}: {len(fields)} fields, {len(d[k].get(\"data\",[]))} rows')
"
```

### Show Schema for One Table

```bash
cat effortless-rulebook.json | python3 -c "
import sys,json; d=json.load(sys.stdin)
for f in d['TableName']['schema']:
  print(f'  {f[\"name\"]:30s} {f[\"type\"]:15s} {f[\"datatype\"]:10s} {f.get(\"Description\",\"\")[:60]}')
"
```

### Find All FK Relationships

```bash
cat effortless-rulebook.json | python3 -c "
import sys,json; d=json.load(sys.stdin)
for k,v in d.items():
  if isinstance(v,dict) and 'schema' in v:
    for f in v['schema']:
      if f['type']=='relationship':
        print(f'  {k}.{f[\"name\"]} -> {f[\"RelatedTo\"]}')
"
```

### Find All Calculated Fields and Formulas

```bash
cat effortless-rulebook.json | python3 -c "
import sys,json; d=json.load(sys.stdin)
for k,v in d.items():
  if isinstance(v,dict) and 'schema' in v:
    for f in v['schema']:
      if f['type'] in ('calculated','aggregation','lookup'):
        print(f'  {k}.{f[\"name\"]} ({f[\"type\"]}): {f.get(\"formula\",\"\")}')
"
```

### Count Tables and Fields Summary

```bash
cat effortless-rulebook.json | python3 -c "
import sys,json; d=json.load(sys.stdin)
tables=[(k,v) for k,v in d.items() if isinstance(v,dict) and 'schema' in v]
print(f'{len(tables)} tables, {sum(len(v[\"schema\"]) for k,v in tables)} total fields')
for k,v in tables:
  raw=len([f for f in v['schema'] if f['type']=='raw'])
  calc=len([f for f in v['schema'] if f['type'] in ('calculated','lookup','aggregation')])
  rel=len([f for f in v['schema'] if f['type']=='relationship'])
  print(f'  {k}: {raw} raw, {calc} derived, {rel} relationships')
"
```

---

## See also

- `effortless-orchestrator` — canonical Token Discipline; this skill provides the queries it refers to.
- `effortless-schema` — for what each field type / datatype actually means in the JSON.
- `effortless-sql` — for `psql -c "\d vw_tablename"` as the post-build alternative when the DB is up.
- `effortless-diagnostics` — for the same query patterns applied to validation (broken FKs, DAG cycles).
