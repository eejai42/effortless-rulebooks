<!-- DERIVED ARTIFACT — DO NOT EDIT BY HAND -->
<!-- Source: https://raw.githubusercontent.com/effortlessapi/effortless-claude/main/skills/effortless-diagnostics/SKILL.md -->
<!-- Mirrored by: docs/skills/clone-skills.sh -->
<!-- Update: cd effortless-platform && effortless clone-skills -->

---
name: effortless-diagnostics
description: >
  Use when diagnosing ERB project health — validating DAG integrity, checking for
  broken FK targets, finding JOIN anti-patterns in application code, migrating
  legacy code from base table reads to view reads, or running diagnostic queries.

  **Scope (load gate):** Effortless projects only — project root must contain `effortless.json` AND a CLAUDE.md identifying the project as ERB methodology. Do NOT load otherwise.
audience: customer
---

# ERB Diagnostics & Migration

Most "bugs" in an ERB project are **hub/spoke drift** — a rule exists in the
hub but a generated spoke hasn't been rebuilt to match, or a piece of app code
has gone out of sync with the view it consumes. The queries below help you
spot that state, not assign blame.

## Diagnostic Queries Against the Rulebook (start here — cheapest)

### Validate DAG (check for missing FK targets)

```bash
cat effortless-rulebook.json | python3 -c "
import sys,json; d=json.load(sys.stdin)
tables={k for k,v in d.items() if isinstance(v,dict) and 'schema' in v}
for k,v in d.items():
  if isinstance(v,dict) and 'schema' in v:
    for f in v['schema']:
      if f['type']=='relationship' and f.get('RelatedTo') not in tables:
        print(f'  BROKEN FK: {k}.{f[\"name\"]} -> {f.get(\"RelatedTo\")} (not found)')
"
```

## Diagnostic Queries Against Generated Code (secondary)

```bash
# Find JOIN anti-patterns in Go code
grep -r "JOIN" cmd/api/*.go | grep -v "// " | wc -l
# Should be ~0 for a healthy codebase

# Find base table reads
grep -rE "FROM (bids|rfps|companies|contacts|documents)\s" cmd/api/*.go
# Should mostly be INSERTs, UPDATEs, DELETEs

# Find view usage
grep -r "FROM vw_" cmd/api/*.go | wc -l
# Should be high - this is where reads happen
```

---

## Migration Path for Legacy Code

When fixing JOIN anti-patterns:

1. Identify what fields the JOIN is fetching
2. Verify those fields exist in the source view (check the rulebook first)
3. Remove the JOIN, select from the view directly
4. If a field is missing, extend the hub (rulebook-direct or via Airtable) so it shows up in the next build's view — patching the app to recompute it duplicates the rule

### Before
```go
rows, _ := db.Query(`
    SELECT b.bid_id, b.rfp, c.company_name, r.title
    FROM bids b
    JOIN companies c ON b.submitted_by_vendor = c.companie_id
    JOIN rfps r ON b.rfp = r.rfp_id
    WHERE b.bid_id = $1`, bidID)
```

### After
```go
rows, _ := db.Query(`
    SELECT bid_id, rfp, company_name, rfp_title
    FROM vw_bids
    WHERE bid_id = $1`, bidID)
```

---

## See also

- `effortless-query` — for the rulebook one-liners these diagnostics rely on.
- `effortless-sql` — for the "always read from `vw_*`" rule and the two customization mechanisms.
- `effortless-conventions` — for the DAG / FK rules that define what "broken" means.
- `effortless-workflow` — for the input-spoke options when a diagnostic finds a missing field (hub-direct, Airtable, reverse-sync) and why those persist while generated-file edits don't.
