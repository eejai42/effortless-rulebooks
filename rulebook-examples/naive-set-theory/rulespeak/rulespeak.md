# 📘 Three-Valued Naive Set Theory — RuleSpeak®

_Rulebook formalizing naive set theory with three-valued (Strong Kleene) membership and Rule 12 (NULL membership), which dissolves Russell's paradox into a single ungrounded membership fact._

> Declarative business rules rendered from the rulebook. Every statement
> below expresses truth in the business domain — it is neither a procedure
> nor an imperative. The rulebook's formulas are the single source of truth;
> this document is their plain-language reading.

## 1 Business Vocabulary

| Term | Description | Narrative Comment |
|------|-------------|-------------------|
| **Truth Value** | The three truth values a membership question or condition can take: True, False, or NULL. Admitting NULL makes membership a partial, non-bivalent semantics rather than the classical two-valued one; bivalence is recovered wherever a definition is grounded. | — |
| Name | The same as its truth value ID. | _Display alias for the truth value._ |
| Symbol | A defined attribute. | _Single-letter symbol: T, F, or N._ |
| Glyph | A defined attribute. | _Logical glyph for the value._ |
| Rank | A defined attribute. | _Strong Kleene order used by min/max: True=1, NULL=0, False=-1._ |
| Is Classical | True when at least one of the following holds: the truth value ID is “true” or the truth value ID is “false”. | _True for the two bivalent values (True/False); False for NULL._ |
| Is Undefined | True when the truth value ID is “null”. | _True only for NULL, the undefined value meaning 'does not converge'._ |
| Count of Facts | The number of membership facts related to the truth value. | _How many membership facts resolve to this value._ |
| Facts With Value | A defined attribute. | _Membership facts that resolve to this truth value._ |
| **Connective** | Logical connectives whose Strong Kleene (K3) truth tables define how NULL propagates. This is the 'gap' route (NULL where evaluation fails to converge), the sibling of paraconsistent 'glut' logics, and it follows Kripke's fixed-point grounding. | — |
| Name | The same as its connective ID. | _Display alias._ |
| Symbol | A defined attribute. | _Operator glyph (not / and / or)._ |
| Arity | A defined attribute. | _Number of inputs: 1 for negation, 2 for conjunction/disjunction._ |
| Kleene Rule | A defined attribute. | _How the K3 output is computed (negate / min / max over ranks)._ |
| Count of Truth Table Rows | The number of truth table rows related to the connective. | _Rows in this connective's truth table._ |
| Truth Table Rows | A defined attribute. | _The truth-table rows belonging to this connective._ |
| **Truth Table Row** | One row per input combination per connective: the Strong Kleene semantics, stored as data. | — |
| Connective | A defined attribute. | _The connective this row defines._ |
| Left Input | A defined attribute. | _Left/sole input truth value._ |
| Right Input | A defined attribute. | _Right input truth value; null for the unary negation._ |
| Output | A defined attribute. | _Resulting truth value for this input combination._ |
| Output Symbol | Taken from the linked output. | _Symbol of the output value._ |
| Name | Computed as the connective, followed by “: ”, followed by the left input, followed by “ , ”, followed by the right input, followed by “ -> ”, followed by the output. | _Readable row, e.g. 'negation: null -> null'._ |
| **Set Rule** | The twelve structural rules of the theory: the eleven classical naive rules plus the missing Rule 12. | — |
| Rule Number | A defined attribute. | _Ordinal 1-12._ |
| Title | A defined attribute. | _Short rule title._ |
| Statement | A defined attribute. | _Full statement of the rule._ |
| Name | Computed as “R”, followed by the rule number. | _Display alias 'R<n>'._ |
| Is Classical | True when the rule number is at most 11. | _True for the eleven classical rules (R1-R11)._ |
| Is the Missing Rule | True when the rule number is 12. | _True only for Rule 12, the rule naive set theory never wrote down._ |
| **Set** | The universe of sets under discussion. Each set is identified by a slug and defined by a membership condition. | — |
| Label | A defined attribute. | _Human notation for the set, e.g. '{a}', 'R', '∅'._ |
| Condition Expression | A defined attribute. | _The membership condition (the predicate / definition) phi defining the set._ |
| Is Self Referential | True when an empty string. | _Whether the condition refers to the set's own membership._ |
| Name | The same as its set ID. | _Display alias._ |
| Is Russell Set | True when the set ID is “russell-set”. | _Flags the Russell set R = { x \| x not-in x }._ |
| Count of Memberships | The number of membership facts related to the set. | _Number of recorded membership facts where this set is the container._ |
| Count of Null Memberships | The number of the set's membership facts that have a membership value of “null”. | _Membership facts on this set that are ungrounded (NULL)._ |
| Memberships | A defined attribute. | _Membership facts for which this set is the container._ |
| **Membership Fact** | The core relation: each fact is a question 'Element in Container' carrying its three-valued answer. | — |
| Element | A defined attribute. | _The candidate member (itself a set)._ |
| Container | A defined attribute. | _The set being asked about._ |
| Membership Value | A defined attribute. | _The three-valued answer to Element in Container._ |
| Name | Computed as the element, followed by “ ∈ ”, followed by the container. | _Readable fact, e.g. 'russell-set ∈ russell-set'._ |
| Container Label | Taken from the linked container. | _Notation of the container set._ |
| Membership Value Symbol | Taken from the linked membership value. | _Symbol (T/F/N) of the answer._ |
| Is Bivalent | True when the membership fact's membership value is a classical. | _Whether the answer is one of the classical values (not NULL)._ |
| Is Null | True when the membership value is “null”. | _True when the fact is ungrounded (NULL)._ |
| Is Grounded | True when it is not the case that the membership value is “null”. | _True when the fact settles to True or False._ |
| Count of Evaluation Steps | The number of evaluation steps related to the membership fact. | _Number of evaluation trials recorded for this fact._ |
| Evaluation Steps | A defined attribute. | _The fixed-point evaluation trials for this fact._ |
| **Evaluation Step** | Strong Kleene fixed-point evaluation of the Russell fact: each trial value fed through phi = not(R in R). Only NULL is stable, dissolving the Russell paradox into a single ungrounded fixed point. | — |
| Membership Fact | A defined attribute. | _The fact being evaluated._ |
| Step Order | A defined attribute. | _Trial order (1,2,3)._ |
| Trial Value | A defined attribute. | _The truth value assumed for R in R before applying phi._ |
| Resulting Value | A defined attribute. | _The value phi = not(R in R) yields under that assumption._ |
| Name | Computed as “try ”, followed by the trial value. | _Readable trial._ |
| Is Stable | True when the trial value is the resulting value. | _True when the trial reproduces itself (a fixed point)._ |
| Outcome | Determined by priority: “stable fixed point” if the trial value is the resulting value; in all other cases, “contradiction”. | _'stable fixed point' or 'contradiction'._ |

## 2 Fact Types

- a **truth value** may reference one **membership fact**
- a **truth table row** references exactly one **connective**
- a **truth table row** references exactly one **truth value**
- a **set** may reference one **membership fact**
- a **membership fact** references exactly one **set**
- a **membership fact** references exactly one **truth value**
- an **evaluation step** references exactly one **membership fact**
- an **evaluation step** references exactly one **truth value**

## 3 Operative Rules

_Operative rules state what the business **obliges**, **prohibits**, or
advises (**should**). Structural rules come from required fields and foreign keys;
semantic rules come from the Constraints table, each keyed on a boolean the rulebook
already computes (cross-referenced as DR-N in the Definitional Rules below)._

### Structural Constraints (from the schema)

- A truth value **must** have a symbol, a glyph, and a rank.
- A connective **must** have a symbol, an arity, and a kleene rule.
- A truth table row **must** reference exactly one connective.
- A truth table row **must** reference exactly one truth value as its left input.
- A truth table row **must** reference exactly one truth value as its output.
- A set rule **must** have a rule number, a title, and a statement.
- A set **must** have a label and a condition expression, and record whether it is a self referential.
- A membership fact **must** reference exactly one set as its element.
- A membership fact **must** reference exactly one set as its container.
- A membership fact **must** reference exactly one truth value as its membership value.
- An evaluation step **must** reference exactly one membership fact.
- An evaluation step **must** reference exactly one truth value as its trial value.
- An evaluation step **must** reference exactly one truth value as its resulting value.
- An evaluation step **must** have a step order.

## 4 Definitional Rules

_All statements express truth in the business domain; they are neither
procedures nor imperatives. "iff" is avoided in favor of "only if" so a
one-directional necessity is not mistaken for an equivalence. A
**⚠︎ mechanical** chip marks a rule whose deterministic wording is faithful
but clunky — a flag for an optional downstream reword pass, not a defect._

| ID | Declarative rule |
|----|------------------|
| **DR-1 Name** | A truth value's name is the same as its truth value ID. |
| **DR-2 Is Classical** | A truth value is considered a classical if at least one of the following holds: the truth value ID is “true” or the truth value ID is “false”. |
| **DR-3 Is Undefined** | A truth value is considered undefined if the truth value ID is “null”. |
| **DR-4 Count of Facts** | A truth value's count of facts is the number of membership facts related to the truth value. |
| **DR-5 Name** | A connective's name is the same as its connective ID. |
| **DR-6 Count of Truth Table Rows** | A connective's count of truth table rows is the number of truth table rows related to the connective. |
| **DR-7 Output Symbol** | A truth table row's output symbol — taken from the linked output. |
| **DR-8 Name** | A truth table row's name is computed as the connective, followed by “: ”, followed by the left input, followed by “ , ”, followed by the right input, followed by “ -> ”, followed by the output. |
| **DR-9 Name** | A set rule's name is computed as “R”, followed by the rule number. |
| **DR-10 Is Classical** | A set rule is considered a classical if the rule number is at most 11. |
| **DR-11 Is the Missing Rule** | A set rule is considered the-missing-rule if the rule number is 12. |
| **DR-12 Name** | A set's name is the same as its set ID. |
| **DR-13 Is Russell Set** | A set is considered a russell set if the set ID is “russell-set”. |
| **DR-14 Count of Memberships** | A set's count of memberships is the number of membership facts related to the set. |
| **DR-15 Count of Null Memberships** | A set's count of null memberships is the number of the set's membership facts that have a membership value of “null”. |
| **DR-16 Name** | A membership fact's name is computed as the element, followed by “ ∈ ”, followed by the container. |
| **DR-17 Container Label** | A membership fact's container label — taken from the linked container. |
| **DR-18 Membership Value Symbol** | A membership fact's membership value symbol — taken from the linked membership value. |
| **DR-19 Is Bivalent** | A membership fact's is bivalent is true when the membership fact's membership value is a classical. |
| **DR-20 Is Null** | A membership fact is considered a null if the membership value is “null”. |
| **DR-21 Is Grounded** | A membership fact is considered grounded if it is not the case that the membership value is “null”. |
| **DR-22 Count of Evaluation Steps** | A membership fact's count of evaluation steps is the number of evaluation steps related to the membership fact. |
| **DR-23 Name** | An evaluation step's name is computed as “try ”, followed by the trial value. |
| **DR-24 Is Stable** | An evaluation step is considered stable if the trial value is the resulting value. |
| **DR-25 Outcome** | The evaluation step's outcome is determined by the following priority:<br>1. “stable fixed point”, if the trial value is the resulting value;<br>2. in all other cases, “contradiction”. |

## 5 Traceability to Schema

_The expression column is the rule's definition in RuleSpeak® notation —
the same logic the rulebook stores, written for a business reader._

| Schema element | Kind | Expression |
|----------------|------|------------|
| **TruthValues.Name** | formula | `TruthValueId` |
| **TruthValues.IsClassical** | formula | `Or(TruthValueId = "true", TruthValueId = "false")` |
| **TruthValues.IsUndefined** | formula | `If(TruthValueId = "null", True(), False())` |
| **TruthValues.CountOfFacts** | rollup | `Count(MembershipFacts via MembershipValue)` |
| **Connectives.Name** | formula | `ConnectiveId` |
| **Connectives.CountOfTruthTableRows** | rollup | `Count(TruthTableRows via Connective)` |
| **TruthTableRows.OutputSymbol** | lookup | `Lookup(TruthValues.Symbol via Output)` |
| **TruthTableRows.Name** | formula | `Connective & ": " & LeftInput & If(RightInput = "", "", " , " & RightInput) & " -> " & Output` |
| **SetRules.Name** | formula | `"R" & RuleNumber` |
| **SetRules.IsClassical** | formula | `If(RuleNumber <= 11, True(), False())` |
| **SetRules.IsTheMissingRule** | formula | `If(RuleNumber = 12, True(), False())` |
| **Sets.Name** | formula | `SetId` |
| **Sets.IsRussellSet** | formula | `If(SetId = "russell-set", True(), False())` |
| **Sets.CountOfMemberships** | rollup | `Count(MembershipFacts via Container)` |
| **Sets.CountOfNullMemberships** | rollup | `Count(MembershipFacts via Container)` |
| **MembershipFacts.Name** | formula | `Element & " ∈ " & Container` |
| **MembershipFacts.ContainerLabel** | lookup | `Lookup(Sets.Label via Container)` |
| **MembershipFacts.MembershipValueSymbol** | lookup | `Lookup(TruthValues.Symbol via MembershipValue)` |
| **MembershipFacts.IsBivalent** | lookup | `Lookup(TruthValues.IsClassical via MembershipValue)` |
| **MembershipFacts.IsNull** | formula | `If(MembershipValue = "null", True(), False())` |
| **MembershipFacts.IsGrounded** | formula | `If(MembershipValue = "null", False(), True())` |
| **MembershipFacts.CountOfEvaluationSteps** | rollup | `Count(EvaluationSteps via MembershipFact)` |
| **EvaluationSteps.Name** | formula | `"try " & TrialValue` |
| **EvaluationSteps.IsStable** | formula | `If(TrialValue = ResultingValue, True(), False())` |
| **EvaluationSteps.Outcome** | formula | `If(TrialValue = ResultingValue, "stable fixed point", "contradiction")` |

---

_This document is rendered in **RuleSpeak®**, the declarative business-rule
notation created by **Ronald G. Ross**, and follows the conventions of
**SBVR** (Semantics of Business Vocabulary and Business Rules). With thanks to
Ronald G. Ross for RuleSpeak® and his foundational work on business rules —
[www.RonRoss.info](https://www.RonRoss.info)._
