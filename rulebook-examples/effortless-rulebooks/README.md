# Effortless Rulesbooks

**A meta-ontology: the ERB project describing itself.**

This example demonstrates the ERB pattern on its own architecture — the rulebook models the very system that builds it.

## What It Models

| Table | Rows | Key Fields |
|-------|------|------------|
| `ProjectMetadata` | 1 | Name, Purpose, Architecture, RepositoryRoot |
| `ExecutionSubstrates` | 10 | Technology, RelativePath, InjectorScript, IsProduction, Status |
| `OrchestrationComponents` | ~6 | FilePath, Language, Purpose, Dependencies |
| `AirtableIntegration` | ~4 | FilePath, Purpose, Role |
| `TestingFramework` | ~5 | FilePath, Purpose, Scope |
| `RulebookDomains` | 7 | ComplexityLevel, TableCount, KeyFeatures |
| `CoreDataFlows` | 5 | Steps, Triggers, Outputs |
| `ProjectConfiguration` | ~8 | FileName, Format, MaintainedBy |
| `Dependencies` | ~10 | Version, Type, Required |

## App

A React + Express table browser for browsing the Postgres database generated from this rulebook.

```bash
cd app && npm install && npm run dev
```

## Quick Start

```bash
effortless build
```

Generates Postgres DDL, Python dataclasses, Go structs, and more from the rulebook.

## Why This Is Interesting

Most ontologies model external domains (customers, orders, media). This one models the tool itself — the substrates, the orchestration, the tests. It proves the ERB pattern is domain-agnostic: if you can describe it in tables and formulas, ERB can generate it.

---

## Local transpiler bus (`localhost:4242`)

> **All 13 local transpilers live on `localhost:4242`.** Start the bus with
> `./start.sh` from `rulebook-examples/legacy-runner/ssotme-proxy/` (it is being
> separated into its own project; see the root rulebook's `LegacyRunnerCapabilities`).
> The ssotme-proxy then exposes every repo-local transpiler —
> `postgres-calculated-to-rulebook`, `rulebook-to-python`, `rulebook-to-golang`,
> `rulebook-to-cobol`, `rulebook-to-owl`, and more — as first-class `ssotme://`
> routes any `effortless build` can call.
