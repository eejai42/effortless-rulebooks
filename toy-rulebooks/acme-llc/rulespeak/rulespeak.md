# 📘 ACME, LLC — RuleSpeak®

_Smallest viable rulebook with a calculated field — the "Hello, formulas" tutorial._

> Declarative business rules rendered from the rulebook. Every statement
> below expresses truth in the business domain — it is neither a procedure
> nor an imperative. The rulebook's formulas are the single source of truth;
> this document is their plain-language reading.

## 1 Business Vocabulary

| Term | Description | Narrative Comment |
|------|-------------|-------------------|
| **Customer** | A customer is identified by its name. | — |
| Name | Computed as the email address with every “@” replaced by a hyphen. | _Identifier for the customer._ |
| Email Address | A defined attribute. | _The customer's email address_ |
| First Name | A defined attribute. | _First Name of the customer - used to make the full name_ |
| Last Name | A defined attribute. | _Last Name of the customer - used to make the full name_ |
| Full Name | Computed as the first name, followed by a space, followed by the last name. | _Full name is computed from the first and last name of the customer_ |

## 3 Operative Rules

_No operative rules yet. Required fields and foreign keys imply structural
`must`-rules automatically; to declare semantic obligations (`must` / `must not` / `should`), add a **Constraints** table whose rows point at
boolean calculated fields. See the tool README for the column contract._

## 4 Definitional Rules

_All statements express truth in the business domain; they are neither
procedures nor imperatives. "iff" is avoided in favor of "only if" so a
one-directional necessity is not mistaken for an equivalence. A
**⚠︎ mechanical** chip marks a rule whose deterministic wording is faithful
but clunky — a flag for an optional downstream reword pass, not a defect._

| ID | Declarative rule |
|----|------------------|
| **DR-1 Name** | A customer's name is computed as the email address with every “@” replaced by a hyphen. |
| **DR-2 Full Name** | A customer's full name is computed as the first name, followed by a space, followed by the last name. |

## 5 Traceability to Schema

_The expression column is the rule's definition in RuleSpeak® notation —
the same logic the rulebook stores, written for a business reader._

| Schema element | Kind | Expression |
|----------------|------|------------|
| **Customers.Name** | formula | `Replace(EmailAddress, "@", "-")` |
| **Customers.FullName** | formula | `FirstName & " " & LastName` |

---

_This document is rendered in **RuleSpeak®**, the declarative business-rule
notation created by **Ronald G. Ross**, and follows the conventions of
**SBVR** (Semantics of Business Vocabulary and Business Rules). With thanks to
Ronald G. Ross for RuleSpeak® and his foundational work on business rules —
[www.RonRoss.info](https://www.RonRoss.info)._
