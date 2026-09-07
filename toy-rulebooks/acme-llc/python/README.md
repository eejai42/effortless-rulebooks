# Rulebook to PostgreSQL Script Generation Report

**Schema:** `public`
**Database:** `demo`
**Timestamp:** 2026-06-06 07:23:55 UTC

## Parsing Rulebook

Found **3** tables in rulebook

Skipped emitting **ERBVersions** (emit_erb_internals=false; bases-only).
Skipped emitting **ERBCustomizations** (emit_erb_internals=false; bases-only).

  - **Customers** (7 fields, 3 records)

## ERB Customizations

  - **03a-customize-schema.sql** (865 bytes)
  - **03b-customize-functions.sql** (646 bytes)
  - **03c-customize-views.sql** (619 bytes)
  - **03d-customize-rls.sql** (635 bytes)
  - **03e-customize-data.sql** (628 bytes)

Generated **1** table definitions with **4** raw fields (mode=check-add)
Generated **3** calculation functions
Generated **1** views
Enabled RLS on **1** tables
Generated insert statements for **3** records
## Script Generation Complete

Generated files:
- `00-bootstrap.sql` - Bootstrap (overwrite Never); includes commented-out drop-all script
- `01-drop-and-create-tables.sql` - Drop and recreate tables with raw fields and FK indexes
- `01b-customize-schema.sql` - User customizations for schema
- `02-create-functions.sql` - Create calculation functions
- `02b-customize-functions.sql` - User customizations for functions
- `03-create-views.sql` - Create views with calculated fields
- `03b-customize-views.sql` - User customizations for views
- `04-create-policies.sql` - Create RLS policies
- `04b-customize-policies.sql` - User customizations for RLS policies
- `05-insert-data.sql` - Insert data from rulebook
- `05b-customize-data.sql` - User customizations for seed data
- `99-fk-constraints.sql` - FK constraints (skipped unless EFFORTLESS_ENFORCE_FKS=true)
- `reset-rulebook-db.sh` - Database initialization script

