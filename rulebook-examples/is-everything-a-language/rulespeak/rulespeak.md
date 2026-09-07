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
| Hockett Assessed Count | The number of hockett assessments related to the language candidate. | _How many of Hockett's design features this candidate has a published assessment for. Zero means nobody has assessed it, which is not the same as failing._ |
| Hockett Yes Count | The total is yes flag across the hockett assessments related to the language candidate. | _How many assessed design features this candidate satisfies outright._ |
| Is Hockett Assessed | True when the hockett assessed count is greater than 0. | _TRUE once this candidate has at least one published design-feature assessment._ |
| Hockett Score | Determined by priority: “not assessed” if the hockett assessed count is 0; in all other cases, the hockett yes count, followed by “ of ”, followed by the hockett assessed count. | _The design-feature tally as text, reading "not assessed" rather than "0" when there is no published assessment. A hand-written Postgres function used to sum eleven bio_has_* columns that were never in the rulebook, so every candidate silently scored zero; this field replaces it._ |
| Hockett Vs Gate | Determined by priority: an empty string if the hockett assessed count is 0; “The eight-clause gate says language; Hockett's features hold for only ”, followed by the hockett yes count, followed by “ of ”, followed by the hockett assessed count, followed by a period if all of the following hold: the predicted answer flag is set and the hockett yes count is less than the hockett assessed count; “Hockett's features all hold, and the eight-clause gate says not a language.” if all of the following hold: the predicted answer flag is not set and the hockett yes count is the hockett assessed count; in all other cases, an empty string. | _Names the disagreement, in English, when the eight-clause gate and Hockett's design features reach opposite conclusions. Empty when they agree or when the candidate is unassessed._ |
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
| **Hockett Feature** | A hockett feature is identified by its name. | — |
| Name | A defined attribute. | _The design feature's name, as Hockett gives it._ |
| Feature Number | A defined attribute. | _Hockett's own numbering, 1 through 13, then 14 through 16 for the 1968 additions._ |
| Definition | A defined attribute. | _What the feature asserts, in plain English._ |
| Is Original Thirteen | True when an empty string. | _TRUE for the thirteen features of the 1960 paper; FALSE for the three added in 1968._ |
| Source | A defined attribute. | _Citation for the feature list._ |
| Assessment Count | The number of hockett assessments related to the hockett feature. | _How many candidates have been assessed against this feature._ |
| Yes Count | The total is yes flag across the hockett assessments related to the hockett feature. | _How many assessed candidates satisfy this feature outright._ |
| **Hockett Assessment** | A hockett assessment is identified by its name and is related to a language candidate and a hockett feature. | — |
| Name | Computed as the language candidate, followed by “ / ”, followed by the hockett feature. | _Logical key: the candidate and the feature being assessed._ |
| Language Candidate | A defined attribute. | _FK to the candidate being assessed._ |
| Hockett Feature | A defined attribute. | _FK to the design feature being applied._ |
| Verdict | A defined attribute. | _Yes, No, Partial or Unknown. Partial and Unknown exist because the published assessments hedge, and flattening a hedge into a boolean would bury a judgement call in the data._ |
| Verbatim Assessment | A defined attribute. | _The source's exact wording for this cell, so every resolution to Verdict stays auditable._ |
| Source Citation | A defined attribute. | _Where this cell came from, including which column._ |
| Mapping Note | A defined attribute. | _Empty when this candidate corresponds exactly to the source's column. Otherwise, how the two differ and how far the row should be trusted._ |
| Is Yes Flag | True when the verdict is “Yes”. | _1 when the verdict is an outright Yes, else 0. Summed by the rollups on LanguageCandidates and HockettFeatures._ |
| **ERB Customization** | An ERB customization is identified by its name. | — |
| Name | A defined attribute. | — |
| Title | A defined attribute. | — |
| SQL Code | A defined attribute. | — |
| SQL Target | A defined attribute. | — |
| Customization Type | A defined attribute. | — |

## 2 Fact Types

- a **hockett assessment** references exactly one **language candidate**
- a **hockett assessment** references exactly one **hockett feature**

## 3 Operative Rules

_Operative rules state what the business **obliges**, **prohibits**, or
advises (**should**). Structural rules come from required fields and foreign keys;
semantic rules come from the Constraints table, each keyed on a boolean the rulebook
already computes (cross-referenced as DR-N in the Definitional Rules below)._

### Structural Constraints (from the schema)

- A hockett assessment **must** reference exactly one language candidate.
- A hockett assessment **must** reference exactly one hockett feature.

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
| **DR-9 Hockett Assessed Count** | A language candidate's hockett assessed count is the number of hockett assessments related to the language candidate. |
| **DR-10 Hockett Yes Count** | A language candidate's hockett yes count is the total is yes flag across the hockett assessments related to the language candidate. |
| **DR-11 Is Hockett Assessed** | A language candidate is considered hockett-assessed if the hockett assessed count is greater than 0. |
| **DR-12 Hockett Score** | The language candidate's hockett score is determined by the following priority:<br>1. “not assessed”, if the hockett assessed count is 0;<br>2. in all other cases, the hockett yes count, followed by “ of ”, followed by the hockett assessed count. |
| **DR-13 Hockett Vs Gate** | The language candidate's hockett vs gate is determined by the following priority:<br>1. an empty string, if the hockett assessed count is 0;<br>2. “The eight-clause gate says language; Hockett's features hold for only ”, followed by the hockett yes count, followed by “ of ”, followed by the hockett assessed count, followed by a period, if all of the following hold: the predicted answer flag is set and the hockett yes count is less than the hockett assessed count;<br>3. “Hockett's features all hold, and the eight-clause gate says not a language.”, if all of the following hold: the predicted answer flag is not set and the hockett yes count is the hockett assessed count;<br>4. in all other cases, an empty string. |
| **DR-14 Assessment Count** | A hockett feature's assessment count is the number of hockett assessments related to the hockett feature. |
| **DR-15 Yes Count** | A hockett feature's yes count is the total is yes flag across the hockett assessments related to the hockett feature. |
| **DR-16 Name** | A hockett assessment's name is computed as the language candidate, followed by “ / ”, followed by the hockett feature. |
| **DR-17 Is Yes Flag** | A hockett assessment is considered a yes flag if the verdict is “Yes”. |

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
| **LanguageCandidates.HockettAssessedCount** | rollup | `Count(HockettAssessments via LanguageCandidate)` |
| **LanguageCandidates.HockettYesCount** | rollup | `Sum(HockettAssessments.IsYesFlag via LanguageCandidate)` |
| **LanguageCandidates.IsHockettAssessed** | formula | `HockettAssessedCount > 0` |
| **LanguageCandidates.HockettScore** | formula | `If(HockettAssessedCount = 0, "not assessed", HockettYesCount & " of " & HockettAssessedCount)` |
| **LanguageCandidates.HockettVsGate** | formula | `If(HockettAssessedCount = 0, "", If(And(PredictedAnswer, HockettYesCount < HockettAssessedCount), "The eight-clause gate says language; Hockett's features hold for only " & HockettYesCount & " of " & HockettAssessedCount & ".", If(And(Not(PredictedAnswer), HockettYesCount = HockettAssessedCount), "Hockett's features all hold, and the eight-clause gate says not a language.", "")))` |
| **HockettFeatures.AssessmentCount** | rollup | `Count(HockettAssessments via HockettFeature)` |
| **HockettFeatures.YesCount** | rollup | `Sum(HockettAssessments.IsYesFlag via HockettFeature)` |
| **HockettAssessments.Name** | formula | `LanguageCandidate & " / " & HockettFeature` |
| **HockettAssessments.IsYesFlag** | formula | `If(Verdict = "Yes", 1, 0)` |

---

_This document is rendered in **RuleSpeak®**, the declarative business-rule
notation created by **Ronald G. Ross**, and follows the conventions of
**SBVR** (Semantics of Business Vocabulary and Business Rules). With thanks to
Ronald G. Ross for RuleSpeak® and his foundational work on business rules —
[www.RonRoss.info](https://www.RonRoss.info)._
