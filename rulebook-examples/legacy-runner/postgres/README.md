# Rulebook to PostgreSQL Script Generation Report

**Schema:** `public`
**Database:** `demo`
**Timestamp:** 2026-05-25 02:44:25 UTC

## Parsing Rulebook

Found **19** tables in rulebook


  - **ProjectMetadata** (8 fields, 1 records)
  - **ExecutionSubstrates** (9 fields, 10 records)
  - **OrchestrationComponents** (6 fields, 9 records)
  - **RulebookSourceSpokes** (7 fields, 6 records)
  - **SsotmeProxy** (5 fields, 13 records)
  - **TestingFramework** (5 fields, 4 records)
  - **RulebookDomains** (8 fields, 8 records)
  - **CoreDataFlows** (6 fields, 9 records)
  - **ProjectConfiguration** (6 fields, 12 records)
  - **Dependencies** (6 fields, 11 records)
  - **AppUsers** (6 fields, 3 records)
  - **UserRoles** (9 fields, 2 records)
  - **AppPermissions** (6 fields, 24 records)
  - **AppNavigation** (8 fields, 18 records)
  - **AppScreens** (9 fields, 16 records)
  - **AppAPIs** (7 fields, 33 records)
  - **AddToolCatalog** (8 fields, 15 records)
  - **BuildPipeline** (5 fields, 8 records)
  - **AdminPortalRuntime** (7 fields, 4 records)

Generated **19** table definitions with **124** raw fields (mode=check-add)
Generated **0** calculation functions
Generated **19** views
Enabled RLS on **19** tables
Generated insert statements for **206** records
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
- `init-db.sh` - Database initialization script

