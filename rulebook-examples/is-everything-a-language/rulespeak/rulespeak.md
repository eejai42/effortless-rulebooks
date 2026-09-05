# 📘 Is Everything a Language? — RuleSpeak®

_Semiotic candidates evaluated by formula — shows substrate-equality holds for non-CRUD ontologies too._

> Declarative business rules rendered from the rulebook. Every statement
> below expresses truth in the business domain — it is neither a procedure
> nor an imperative. The rulebook's formulas are the single source of truth;
> this document is their plain-language reading.

## 1 Business Vocabulary

| Term | Description | Narrative Comment |
|------|-------------|-------------------|
| **Language Candidate** | A language candidate is identified by its name. | — |
| Name | A defined attribute. | _Name of the language candidate being classified._ |
| Is Language | True when an empty string. | _The test answer that is intended to match the Family Feud answer to be "correct"._ |
| Has Grammar | True when the has syntax is true. | _Does this candidate have a Grammar?  Generally follows candidates that have syntax also have grammar._ |
| Has Syntax | True when an empty string. | _Does this language candidate have syntax and/or grammar?_ |
| Can Be Held | True when an empty string. | _Is this candidate physical/material.  I.e. could it at least theoretically "be held"?_ |
| Question | Computed as “Is ”, followed by the name, followed by “ a language?”. | _Question that 100 random people could be asked, family feud style._ |
| Predicted Answer | True when all of the following hold: the syntax flag is set; the parsed flag is set; the description of flag is set; the linear decoding pressure flag is set; the resolves to an AST flag is set; the stable ontology reference flag is set; the can be held flag is not set; and the identity flag is not set. | _The predicted answer as the top most popular answer among those in the family feud polling pool._ |
| Prediction Predicates | Computed as “Has Syntax” if the syntax flag is set, in all other cases “No Syntax”, followed by “ & ”, followed by “Requires Parsing” if the parsed flag is set, in all other cases “No Parsing Neede”, followed by “ & ”, followed by “Describes the thing” if the description of flag is set, in all other cases “Is the Thing”, followed by “ & ”, followed by “Has Linear Decoding Pressure” if the linear decoding pressure flag is set, in all other cases “No Decoding Pressure”, followed by “ & ”, followed by “Resolves to AST” if the resolves to an AST flag is set, in all other cases “No AST”, followed by a comma followed by a space, followed by “Is Stable Ontology” if the stable ontology reference flag is set, in all other cases “Not 'Ontology'”, followed by “ AND ”, followed by “Can Be Held” if the can be held flag is set, in all other cases “Can't Be Held”, followed by a comma followed by a space, followed by “Has Identity” if the identity flag is set, in all other cases “Has no Identity”. | — |
| Prediction Fail | Computed as the name, followed by a space, followed by “Is” if the predicted answer flag is set, in all other cases “Isn't”, followed by “ a Family Feud Language, but ”, followed by “Is” if the language flag is set, in all other cases “Is Not”, followed by “ marked as a 'Language Candidate.'”, followed by “ - Open World vs. Closed World Conflict.”. | _If the family feud answer does not match the chosen language candidates status then this explains what did not match. t also flags (in english) mismatch where a candidate is marked as BOTH open AND closed world which does not make sense._ |
| Category | A defined attribute. | _The general high level category of the candidate._ |
| Has Identity | True when an empty string. | _Could this thing be assigned a guid, unique in the universe that would identify it globally?  Like a drivers license or social security number for a person._ |
| Is Parsed | True when an empty string. | _Is the knowledge/information encoded in a form that requires parsing before meaning can be extracted?_ |
| Resolves to an AST | True when an empty string. | _Is the knowledge/information encoded in a form that requires parsing before meaning can be extracted?_ |
| Has Linear Decoding Pressure | True when an empty string. | — |
| Is Stable Ontology Reference | True when an empty string. | — |
| Is Live Ontology Editor | True when an empty string. | — |
| Is Open World | True when an empty string. | — |
| Is Closed World | True when an empty string. | — |
| Is Description of | True when the distance from concept is greater than 1. | — |
| Distance From Concept | A defined attribute. | — |
| Is Open Closed World Conflicted | True when all of the following hold: the open world flag is set and the closed world flag is set. | — |
| Dimensionality While Editing | A defined attribute. | — |
| Relationship to Concept | Determined by priority: “IsMirrorOf” if the distance from concept is 1; in all other cases, “IsDescriptionOf”. | — |
| Model Object Facility Layer | A defined attribute. | — |
| Sort Order | A defined attribute. | — |
| **Is Everything a Language** | An is everything a language is identified by its name. | — |
| Name | A defined attribute. | — |
| Argument Name | A defined attribute. | — |
| Argument Category | A defined attribute. | — |
| Step Type | A defined attribute. | — |
| Statement | A defined attribute. | — |
| Formalization | A defined attribute. | — |
| Related Candidate Name | A defined attribute. | — |
| Related Candidate ID | A defined attribute. | — |
| Evidence From Rulebook | A defined attribute. | — |
| Notes | A defined attribute. | — |
| **ERB Customization** | An ERB customization is identified by its name. | — |
| Name | A defined attribute. | — |
| Title | A defined attribute. | — |
| SQL Code | A defined attribute. | — |
| SQL Target | A defined attribute. | — |
| Customization Type | A defined attribute. | — |

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
| **DR-1 Has Grammar** | A language candidate is considered to have a grammar if the has syntax is true. |
| **DR-2 Question** | A language candidate's question is computed as “Is ”, followed by the name, followed by “ a language?”. |
| **DR-3 Predicted Answer** | A language candidate is flagged predicted answer if all of the following hold: the syntax flag is set; the parsed flag is set; the description of flag is set; the linear decoding pressure flag is set; the resolves to an AST flag is set; the stable ontology reference flag is set; the can be held flag is not set; and the identity flag is not set. |
| **DR-4 Prediction Predicates** | A language candidate's prediction predicates is computed as “Has Syntax” if the syntax flag is set, in all other cases “No Syntax”, followed by “ & ”, followed by “Requires Parsing” if the parsed flag is set, in all other cases “No Parsing Neede”, followed by “ & ”, followed by “Describes the thing” if the description of flag is set, in all other cases “Is the Thing”, followed by “ & ”, followed by “Has Linear Decoding Pressure” if the linear decoding pressure flag is set, in all other cases “No Decoding Pressure”, followed by “ & ”, followed by “Resolves to AST” if the resolves to an AST flag is set, in all other cases “No AST”, followed by a comma followed by a space, followed by “Is Stable Ontology” if the stable ontology reference flag is set, in all other cases “Not 'Ontology'”, followed by “ AND ”, followed by “Can Be Held” if the can be held flag is set, in all other cases “Can't Be Held”, followed by a comma followed by a space, followed by “Has Identity” if the identity flag is set, in all other cases “Has no Identity”. |
| **DR-5 Prediction Fail** | A language candidate's prediction fail is computed as the name, followed by a space, followed by “Is” if the predicted answer flag is set, in all other cases “Isn't”, followed by “ a Family Feud Language, but ”, followed by “Is” if the language flag is set, in all other cases “Is Not”, followed by “ marked as a 'Language Candidate.'”, followed by “ - Open World vs. Closed World Conflict.”. |
| **DR-6 Is Description of** | A language candidate is considered a description of if the distance from concept is greater than 1. |
| **DR-7 Is Open Closed World Conflicted** | A language candidate is considered open-closed-world-conflicted if all of the following hold: the open world flag is set and the closed world flag is set. |
| **DR-8 Relationship to Concept** | The language candidate's relationship to concept is determined by the following priority:<br>1. “IsMirrorOf”, if the distance from concept is 1;<br>2. in all other cases, “IsDescriptionOf”. |

## 5 Traceability to Schema

_The expression column is the rule's definition in RuleSpeak® notation —
the same logic the rulebook stores, written for a business reader._

| Schema element | Kind | Expression |
|----------------|------|------------|
| **LanguageCandidates.HasGrammar** | formula | `HasSyntax = True()` |
| **LanguageCandidates.Question** | formula | `"Is " & Name & " a language?"` |
| **LanguageCandidates.PredictedAnswer** | formula | `And(HasSyntax, IsParsed, IsDescriptionOf, HasLinearDecodingPressure, ResolvesToAnAST, IsStableOntologyReference, Not(CanBeHeld), Not(HasIdentity))` |
| **LanguageCandidates.PredictionPredicates** | formula | `If(HasSyntax, "Has Syntax", "No Syntax") & " & " & If(IsParsed, "Requires Parsing", "No Parsing Neede") & " & " & If(IsDescriptionOf, "Describes the thing", "Is the Thing") & " & " & If(HasLinearDecodingPressure, "Has Linear Decoding Pressure", "No Decoding Pressure") & " & " & If(ResolvesToAnAST, "Resolves to AST", "No AST") & ", " & If(IsStableOntologyReference, "Is Stable Ontology", "Not 'Ontology'") & " AND " & If(CanBeHeld, "Can Be Held", "Can't Be Held") & ", " & If(HasIdentity, "Has Identity", "Has no Identity")` |
| **LanguageCandidates.PredictionFail** | formula | `If(Not(PredictedAnswer = IsLanguage), Name & " " & If(PredictedAnswer, "Is", "Isn't") & " a Family Feud Language, but " & If(IsLanguage, "Is", "Is Not") & " marked as a 'Language Candidate.'", "") & If(IsOpenClosedWorldConflicted, " - Open World vs. Closed World Conflict.", "")` |
| **LanguageCandidates.IsDescriptionOf** | formula | `DistanceFromConcept > 1` |
| **LanguageCandidates.IsOpenClosedWorldConflicted** | formula | `And(IsOpenWorld, IsClosedWorld)` |
| **LanguageCandidates.RelationshipToConcept** | formula | `If(DistanceFromConcept = 1, "IsMirrorOf", "IsDescriptionOf")` |

---

_This document is rendered in **RuleSpeak®**, the declarative business-rule
notation created by **Ronald G. Ross**, and follows the conventions of
**SBVR** (Semantics of Business Vocabulary and Business Rules). With thanks to
Ronald G. Ross for RuleSpeak® and his foundational work on business rules —
[www.RonRoss.info](https://www.RonRoss.info)._
