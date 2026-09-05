# Rulebook to PostgreSQL Script Generation Report

**Schema:** `public`
**Database:** `demo`
**Timestamp:** 2026-06-20 00:47:38 UTC

## Parsing Rulebook

Found **34** tables in rulebook


  - **AutoimmuneDiseases** (13 fields, 3 records)
  - **DiseaseStages** (9 fields, 6 records)
  - **Tissues** (6 fields, 5 records)
  - **OmicsModalities** (7 fields, 8 records)
  - **FederatedDatasets** (10 fields, 4 records)
  - **VariantTypes** (7 fields, 5 records)
  - **Individuals** (33 fields, 7 records)
  - **GenomicVariants** (15 fields, 7 records)
  - **OmicsAssays** (17 fields, 21 records)
  - **EvidenceItems** (21 fields, 21 records)
  - **CohortReplications** (15 fields, 21 records)
  - **NegativeControlTests** (11 fields, 14 records)
  - **EnvironmentalExposures** (11 fields, 1 records)
  - **Treatments** (13 fields, 1 records)
  - **ClinicalPhenotypes** (15 fields, 1 records)
  - **CausalMechanisms** (32 fields, 7 records)
  - **EpistaticInteractions** (11 fields, 1 records)
  - **CounterfactualTrajectories** (12 fields, 1 records)
  - **IndividualPredictions** (33 fields, 7 records)
  - **CalibrationBins** (12 fields, 35 records)
  - **InterventionTargets** (12 fields, 6 records)
  - **Axioms** (6 fields, 15 records)
  - **TestsForSuccess** (7 fields, 10 records)
  - **Features** (6 fields, 10 records)
  - **OpenQuestions** (7 fields, 4 records)
  - **NonGoals** (5 fields, 5 records)
  - **GlossaryTerms** (5 fields, 6 records)
  - **EffortlessLoops** (14 fields, 10 records)
  - **RoutingAndNavigation** (44 fields, 23 records)
  - **StateMachines** (17 fields, 1 records)
  - **MachineStates** (16 fields, 7 records)
  - **StateTransitionRules** (18 fields, 9 records)
  - **StateTransitions** (17 fields, 26 records)
  - **SubjectStateInstances** (19 fields, 33 records)

Generated **34** table definitions with **249** raw fields (mode=check-add)
Generated **364** calculation functions
Generated **34** views
Enabled RLS on **34** tables
Generated insert statements for **341** records
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

