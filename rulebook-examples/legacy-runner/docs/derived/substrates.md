<!-- GENERATED FILE — DO NOT EDIT. -->
<!-- Source: effortless-platform/effortless-rulebook/effortless-rulebook.json (table: `ExecutionSubstrates`) -->
<!-- Regenerate with: cd effortless-platform && effortless build -->

# Execution Substrates

Runtime environments that execute business rules derived from the rulebook

| ID | Name | Tech | Maturity | Determinism | Answer Key? | Expressive | Runtime | Path |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| substrate-001 | Binary (ARM64) | ARM64 Assembly | prototype | deterministic | — | partial-formula | binary | execution-substrates/binary/ |
| substrate-002 | Python | Python | demonstrating | deterministic | ✓ | full | text-emit | execution-substrates/python/ |
| substrate-003 | Go | Go | demonstrating | deterministic | ✓ | full | text-emit | execution-substrates/golang/ |
| substrate-004 | PostgreSQL | PostgreSQL | reference-quality | deterministic | ✓ | full | database | licensed-effortless-tools/postgres/ |
| substrate-005 | CSV | CSV | demonstrating | deterministic | — | shape-only | text-emit | execution-substrates/csv/ |
| substrate-006 | Excel | Excel | reference-quality | deterministic | ✓ | full | spreadsheet | licensed-effortless-tools/xlsx/ |
| substrate-007 | PlantUML | PlantUML | demonstrating | deterministic | — | shape-only | docs | execution-substrates/uml/ |
| substrate-008 | OWL/RDF | OWL/RDF | demonstrating | deterministic | — | partial-formula | graph | execution-substrates/owl/ |
| substrate-009 | Explain DAG | JSON | demonstrating | deterministic | — | full | graph | execution-substrates/explain-dag/ |
| substrate-010 | Entity Framework | C#/.NET | reference-quality | deterministic | ✓ | full | text-emit | licensed-effortless-tools/entity-framework-dotnet/ |
