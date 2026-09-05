# Rulebook to PostgreSQL Script Generation Report

**Schema:** `public`
**Database:** `demo`
**Timestamp:** 2026-09-05 04:46:28 UTC

## Parsing Rulebook

Found **4** tables in rulebook


  - **Policies** (5 fields, 3 records)
  - **Claimants** (8 fields, 5 records)
  - **Incidents** (5 fields, 7 records)
  - **Claims** (18 fields, 5 records)

Generated **4** table definitions with **14** raw fields (mode=check-add)
Generated **29** calculation functions
Generated **4** views
Enabled RLS on **4** tables
Generated insert statements for **20** records
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

