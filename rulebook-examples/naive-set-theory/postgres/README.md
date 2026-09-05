# Rulebook to PostgreSQL Script Generation Report

**Schema:** `public`
**Database:** `demo`
**Timestamp:** 2026-09-05 04:34:35 UTC

## Parsing Rulebook

Found **7** tables in rulebook


  - **TruthValues** (9 fields, 3 records)
  - **Connectives** (7 fields, 3 records)
  - **TruthTableRows** (7 fields, 21 records)
  - **SetRules** (7 fields, 12 records)
  - **Sets** (9 fields, 8 records)
  - **MembershipFacts** (12 fields, 10 records)
  - **EvaluationSteps** (8 fields, 3 records)

Generated **7** table definitions with **20** raw fields (mode=check-add)
Generated **35** calculation functions
Generated **7** views
Enabled RLS on **7** tables
Generated insert statements for **60** records
## Script Generation Complete

Generated files:
- `00-bootstrap.sql` - Bootstrap (overwrite Never); includes commented-out drop-all script
- `01-drop-and-create-tables.sql` - Drop and recreate tables with raw fields and FK indexes
- `02-create-functions.sql` - Create calculation functions
- `03-create-views.sql` - Create views with calculated fields
- `04-create-policies.sql` - Create RLS policies
- `05-insert-data.sql` - Insert data from rulebook
- `99-fk-constraints.sql` - FK constraints (skipped unless EFFORTLESS_ENFORCE_FKS=true)
- `init-db.sh` - Database initialization script

