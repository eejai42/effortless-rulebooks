# Rulebook to PostgreSQL Script Generation Report

**Schema:** `public`
**Database:** `demo`
**Timestamp:** 2026-09-05 04:34:41 UTC

## Parsing Rulebook

Found **36** tables in rulebook


  - **Domains** (5 fields, 6 records)
  - **Contexts** (6 fields, 3 records)
  - **Points** (6 fields, 15 records)
  - **PointSets** (11 fields, 3 records)
  - **PointSetMembers** (4 fields, 15 records)
  - **PointPairs** (19 fields, 18 records)
  - **UnitDistanceGraphs** (8 fields, 3 records)
  - **NumberFields** (20 fields, 2 records)
  - **PrimeIdeals** (8 fields, 8 records)
  - **MinkowskiLattices** (21 fields, 2 records)
  - **ShortVectors** (8 fields, 10 records)
  - **ConstructionFamilies** (12 fields, 3 records)
  - **ConstructionInstances** (12 fields, 5 records)
  - **GrowthSequences** (7 fields, 3 records)
  - **AsymptoticFunctions** (10 fields, 1 records)
  - **AsymptoticLowerBounds** (30 fields, 5 records)
  - **Theorems** (30 fields, 6 records)
  - **Metrics** (10 fields, 5 records)
  - **FieldEmbeddings** (10 fields, 6 records)
  - **MinkowskiEmbeddings** (10 fields, 4 records)
  - **GramMatrices** (12 fields, 5 records)
  - **PlanarProjections** (17 fields, 5 records)
  - **ProjectedShortVectors** (17 fields, 11 records)
  - **GolodShafarevichCriteria** (12 fields, 3 records)
  - **SemanticBridges** (12 fields, 8 records)
  - **SemanticRoutes** (12 fields, 5 records)
  - **SemanticRouteSteps** (10 fields, 15 records)
  - **SourceReferences** (17 fields, 8 records)
  - **Lemmas** (16 fields, 10 records)
  - **MirrorContract** (9 fields, 7 records)
  - **Conjectures** (20 fields, 5 records)
  - **ProofObligations** (17 fields, 9 records)
  - **CitationLinks** (16 fields, 10 records)
  - **AnswerKey** (19 fields, 14 records)
  - **TemporalSnapshots** (12 fields, 8 records)
  - **LowerBoundValidityAtSnapshot** (12 fields, 40 records)

Generated **36** table definitions with **230** raw fields (mode=check-add)
Generated **305** calculation functions
Generated **36** views
Enabled RLS on **36** tables
Generated insert statements for **286** records
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

