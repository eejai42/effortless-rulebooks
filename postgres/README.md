# Rulebook to PostgreSQL Script Generation Report

**Schema:** `public`
**Database:** `demo`
**Timestamp:** 2026-08-31 04:56:37 UTC

## Parsing Rulebook

Found **32** tables in rulebook


  - **ProjectMetadata** (40 fields, 1 records)
  - **OntologyAxioms** (19 fields, 13 records)
  - **FramingInvariants** (19 fields, 13 records)
  - **PlatformFeatures** (23 fields, 17 records)
  - **RulebookSourceSpokes** (13 fields, 6 records)
  - **RulebookDomains** (56 fields, 41 records)
  - **RulebookFlavors** (34 fields, 27 records)
  - **FieldTypeTaxonomy** (14 fields, 5 records)
  - **FormulaDialects** (16 fields, 2 records)
  - **DemoNarratives** (21 fields, 7 records)
  - **Glossary** (16 fields, 74 records)
  - **RulebookTags** (15 fields, 18 records)
  - **FlavorTags** (13 fields, 129 records)
  - **ClaudeSkills** (31 fields, 37 records)
  - **BuildPhases** (28 fields, 5 records)
  - **EffortClasses** (11 fields, 3 records)
  - **DeliveryDisciplines** (13 fields, 6 records)
  - **ERBPackages** (21 fields, 7 records)
  - **ERBFeatureCategories** (18 fields, 14 records)
  - **ERBFeatures** (18 fields, 30 records)
  - **UserStories** (27 fields, 53 records)
  - **AcceptanceCriteria** (16 fields, 106 records)
  - **ConsistencyRules** (24 fields, 19 records)
  - **ConsistencyFindings** (24 fields, 160 records)
  - **MobileNavTabs** (17 fields, 5 records)
  - **MobileRoutes** (29 fields, 31 records)
  - **SkillRoutes** (16 fields, 45 records)
  - **ProjectLayoutSlots** (18 fields, 18 records)
  - **ProjectSlotWitnesses** (23 fields, 738 records)
  - **CMCCSummary** (8 fields, 1 records)
  - **ProjectGoal** (8 fields, 1 records)
  - **ArchitecturalHighlight** (8 fields, 1 records)

Generated **32** table definitions with **203** raw fields (mode=check-add)
Generated **554** calculation functions
Generated **32** views
Enabled RLS on **32** tables
Generated insert statements for **1633** records
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

