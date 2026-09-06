# 📘 Customer Full Name — RuleSpeak®

_Hello World: a Customers table whose FullName is a calculated field over FirstName and LastName, demonstrating basic schema and calculated fields._

> Declarative business rules rendered from the rulebook. Every statement
> below expresses truth in the business domain — it is neither a procedure
> nor an imperative. The rulebook's formulas are the single source of truth;
> this document is their plain-language reading.

## 1 Business Vocabulary

| Term | Description | Narrative Comment |
|------|-------------|-------------------|
| **Customer** | A customer is identified by its name. | — |
| First Name | A defined attribute. | _First Name of the customer_ |
| Last Name | A defined attribute. | _Last Name of the customer_ |
| Name | Computed as the last name, followed by a comma followed by a space, followed by the first name. | _Full name: first and last_ |
| Initials | Computed as the first 1 character(s) of the first name, followed by the first 1 character(s) of the last name. | _First letter of the first and last name_ |

## 3 Operative Rules

_Operative rules state what the business **obliges**, **prohibits**, or
advises (**should**). Structural rules come from required fields and foreign keys;
semantic rules come from the Constraints table, each keyed on a boolean the rulebook
already computes (cross-referenced as DR-N in the Definitional Rules below)._

### Structural Constraints (from the schema)

- A customer **must** have a first name and a last name.

## 4 Definitional Rules

_All statements express truth in the business domain; they are neither
procedures nor imperatives. "iff" is avoided in favor of "only if" so a
one-directional necessity is not mistaken for an equivalence. A
**⚠︎ mechanical** chip marks a rule whose deterministic wording is faithful
but clunky — a flag for an optional downstream reword pass, not a defect._

| ID | Declarative rule |
|----|------------------|
| **DR-1 Name** | A customer's name is computed as the last name, followed by a comma followed by a space, followed by the first name. |
| **DR-2 Initials** | A customer's initials is computed as the first 1 character(s) of the first name, followed by the first 1 character(s) of the last name. |

## 5 Traceability to Schema

_The expression column is the rule's definition in RuleSpeak® notation —
the same logic the rulebook stores, written for a business reader._

| Schema element | Kind | Expression |
|----------------|------|------------|
| **Customers.Name** | formula | `LastName & ", " & FirstName` |
| **Customers.Initials** | formula | `Left(FirstName, 1) & Left(LastName, 1)` |

---

_This document is rendered in **RuleSpeak®**, the declarative business-rule
notation created by **Ronald G. Ross**, and follows the conventions of
**SBVR** (Semantics of Business Vocabulary and Business Rules). With thanks to
Ronald G. Ross for RuleSpeak® and his foundational work on business rules —
[www.RonRoss.info](https://www.RonRoss.info)._
