# 📘 ERB Self-Describing Rulebook — RuleSpeak®

_The rulebook that describes the ERB project itself — the platform eating its own dog food._

> Declarative business rules rendered from the rulebook. Every statement
> below expresses truth in the business domain — it is neither a procedure
> nor an imperative. The rulebook's formulas are the single source of truth;
> this document is their plain-language reading.

## 1 Business Vocabulary

| Term | Description | Narrative Comment |
|------|-------------|-------------------|
| **Project Metadata** | Project overview | — |
| Name | A defined attribute. | _Effortlessly Invariant Rulesbooks (ERB)_ |
| Purpose | A defined attribute. | _Demonstrate that a single declarative rulebook can generate working code in multiple execution substrates (Python, Go, SQL, etc.) that all produce identical results_ |
| Architecture | A defined attribute. | _Hub-and-spokes around Airtable; rulebook is the disposable IR_ |
| Repository Root | A defined attribute. | _effortlessly-invariant-rulesbooks/_ |
| **Execution Substrate** | Runtime environments that execute business rules derived from the rulebook | — |
| Name | A defined attribute. | _Human-readable substrate name_ |
| Technology | A defined attribute. | _Language/platform (PostgreSQL, Python, Go, Excel, OWL, PlantUML, etc.)_ |
| Relative Path | A defined attribute. | _Path within repo: execution-substrates/{technology}/_ |
| Injector Script | A defined attribute. | _Code generation script: inject-into-{technology}.py_ |
| Test Script | A defined attribute. | _Conformance test script: take-test.py_ |
| Is Production | True when an empty string. | _True if backed by an official Effortless tool; false if local implementation_ |
| Status | A defined attribute. | _Operational status (active, proof-of-concept, deprecated)_ |
| Description | A defined attribute. | _Purpose and capabilities_ |
| **Orchestration Component** | Central orchestration logic that coordinates rulebook loading, injection, and testing | — |
| Name | A defined attribute. | — |
| File Path | A defined attribute. | _Relative path from repo root_ |
| Language | A defined attribute. | — |
| Purpose | A defined attribute. | — |
| Dependencies | A defined attribute. | _Comma-separated list of other components_ |
| **Airtable Integration** | Airtable as input spoke: schema + data source pulled into rulebook | — |
| Name | A defined attribute. | — |
| File Path | A defined attribute. | — |
| Purpose | A defined attribute. | — |
| Role | A defined attribute. | _input (pull from Airtable), output (push to Airtable), or bidirectional_ |
| **Testing Framework** | Conformance testing: prove all substrates compute identically | — |
| Name | A defined attribute. | — |
| File Path | A defined attribute. | — |
| Purpose | A defined attribute. | — |
| Scope | A defined attribute. | _global (all substrates) or per-substrate_ |
| **Rulebook Domain** | Customer ontologies: each domain has its own rulebook + substrate generation | — |
| Domain Name | A defined attribute. | — |
| Relative Path | A defined attribute. | _rulebook-examples/{domain}/ — each domain is a self-contained Effortless project_ |
| Rulebook Path | A defined attribute. | _Path to effortless-rulebook.json within domain_ |
| Complexity Level | A defined attribute. | _minimal, moderate, advanced, or philosophical_ |
| Table Count | A defined attribute. | — |
| Key Features | A defined attribute. | _Comma-separated: string concat, relationships, aggregations, IF logic, meta-ontology, etc._ |
| Purpose | A defined attribute. | — |
| **Core Data Flow** | End-to-end flows from rulebook to execution and testing | — |
| Name | A defined attribute. | — |
| Steps | A defined attribute. | _Pipe-delimited sequence of steps_ |
| Triggers | A defined attribute. | _When this flow runs_ |
| Outputs | A defined attribute. | _Artifacts produced_ |
| **Project Configuration** | Configuration files and their purposes | — |
| File Name | A defined attribute. | — |
| File Path | A defined attribute. | — |
| Format | A defined attribute. | — |
| Purpose | A defined attribute. | — |
| Maintained by | A defined attribute. | _human (manual edits) or tool (auto-generated)_ |
| **Dependency** | External tools and their roles | — |
| Name | A defined attribute. | — |
| Version | A defined attribute. | — |
| Type | A defined attribute. | _Language, tool, service, or external API_ |
| Purpose | A defined attribute. | — |
| Required | True when an empty string. | — |

## 3 Operative Rules

_Operative rules state what the business **obliges**, **prohibits**, or
advises (**should**). Structural rules come from required fields and foreign keys;
semantic rules come from the Constraints table, each keyed on a boolean the rulebook
already computes (cross-referenced as DR-N in the Definitional Rules below)._

### Structural Constraints (from the schema)

- A project metadata **must** have a name and a purpose.
- An execution substrate **must** have a name, a technology, a relative path, and an injector script, and record whether it is a production.
- An orchestration component **must** have a name, a file path, a language, and a purpose.
- An airtable integration **must** have a name, a purpose, and a role.
- A testing framework **must** have a name, a file path, and a purpose.
- A rulebook domain **must** have a domain name, a relative path, and a rulebook path.
- A core data flow **must** have a name and a steps.
- A project configuration **must** have a file name, a file path, a format, and a purpose.
- A dependency **must** have a name, a type, and a purpose, and record whether it is required.

## 4 Definitional Rules

_All statements express truth in the business domain; they are neither
procedures nor imperatives. "iff" is avoided in favor of "only if" so a
one-directional necessity is not mistaken for an equivalence. A
**⚠︎ mechanical** chip marks a rule whose deterministic wording is faithful
but clunky — a flag for an optional downstream reword pass, not a defect._

| ID | Declarative rule |
|----|------------------|
| — | _This rulebook defines no calculated fields; all data is raw._ |

---

_This document is rendered in **RuleSpeak®**, the declarative business-rule
notation created by **Ronald G. Ross**, and follows the conventions of
**SBVR** (Semantics of Business Vocabulary and Business Rules). With thanks to
Ronald G. Ross for RuleSpeak® and his foundational work on business rules —
[www.RonRoss.info](https://www.RonRoss.info)._
