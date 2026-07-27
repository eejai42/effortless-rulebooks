# 📘 Effortless Banking — RuleSpeak

_Community-bank commercial RM platform — loans, deposits, covenants, BSA/AML._

> Declarative business rules rendered from the rulebook. Every statement
> below expresses truth in the business domain — it is neither a procedure
> nor an imperative. The rulebook's formulas are the single source of truth;
> this document is their plain-language reading.

## 1 Business Vocabulary

| Term | Description | Narrative Comment |
|------|-------------|-------------------|
| **User** | Bank employees: relationship managers, underwriters, branch bankers, and admins. Used for portfolio assignment, audit trails, and segregation-of-duties enforcement. | — |
| Name | Computed as the lower-cased full name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | _Kebab-cased compound primary key derived from FullName._ |
| Is RM | True when the role is “RM”. | _True when Role = 'RM' (relationship manager)._ |
| Is Underwriter | True when the role is “Underwriter”. | _True when Role = 'Underwriter'._ |
| Is Branch Banker | True when the role is “BranchBanker”. | _True when Role = 'BranchBanker'._ |
| Is Admin | True when the role is “Admin”. | _True when Role = 'Admin'._ |
| Count of Portfolio Businesses | The number of businesses related to the user. | _Number of Businesses whose RelationshipManager is this user._ |
| Count of Originated Loans | The number of loans related to the user. | _Number of Loans this user originated as the RM of record._ |
| Count of Underwritten Loans | The number of loans related to the user. | _Number of Loans this user underwrote._ |
| **Business** | Small-business customers (and prospects) of the bank. Central entity: BeneficialOwners, Contacts, Accounts, Loans, Documents, and Interactions all hang off a Business. BusinessProfile information (legal name, structure, NAICS code) lives directly on this table. | — |
| Name | Computed as the lower-cased legal name with every a space replaced by a hyphen with every a period replaced by an empty string. ⚠︎ mechanical <!-- rulespeak:reword --> | _Kebab-cased compound PK derived from LegalName (punctuation stripped)._ |
| Relationship Manager Label | The full name of the business's relationship manager. | _Display label of the assigned RM, pulled from Users._ |
| Is Customer | True when the status is “Customer”. | _True when Status = 'Customer'._ |
| Is Prospect | True when the status is “Prospect”. | _True when Status = 'Prospect'._ |
| Was Referred | True when the referral source is set. | _True when this business was referred in by another business._ |
| Count of Beneficial Owners | The number of beneficial owners related to the business. | _Number of BeneficialOwner rows attached._ |
| Count of Contacts | The number of contacts related to the business. | _Number of Contact rows attached._ |
| Count of Accounts | The number of accounts related to the business. | _Number of Account rows attached._ |
| Count of Loans | The number of loans related to the business. | _Number of Loan rows attached._ |
| Count of Interactions | The number of interactions related to the business. | _Number of Interaction rows attached (the activity feed)._ |
| Count of Documents | The number of documents related to the business. | _Number of Documents attached directly to this Business._ |
| Total Deposit Balance USD | The total current balance USD across the accounts related to the business. | _Sum of CurrentBalanceUsd across this Business's Accounts._ |
| Total Loan Principal USD | The total principal USD across the loans related to the business. | _Sum of PrincipalUsd across this Business's Loans._ |
| Count of Classified Loans | The number of the business's loans that are classified assets. | _Number of Loans on this Business whose risk grade is substandard or worse (>=7)._ |
| Has Classified Loan | True when the count of classified loans is greater than 0. | _True when at least one loan on this Business is a classified asset._ |
| Beneficial Owners At CDD Threshold | The number of the business's beneficial owners that meet a CDD threshold. | _Count of BeneficialOwners meeting FinCEN's 25% threshold or marked as the control person._ |
| Meets CDD Rule | True when the beneficial owners at CDD threshold is greater than 0. | _True when CDD beneficial-ownership collection is satisfied: at least one owner crosses the 25% threshold, or a control person is designated._ |
| Portfolio Priority | Determined by priority: “High” if the classified loan flag is set; “Medium” if at least one of the following holds: the meets CDD rule flag is not set; the prospect flag is set; or the count of loans is 0; in all other cases, “Low”. | _Higher-order: portfolio-management priority bucket for this business. 'High' when classified loan present, 'Medium' when CDD or onboarding incomplete or no loans yet, otherwise 'Low'._ |
| **Beneficial Owner** | Individuals owning 25%+ of a Business plus designated control persons, per FinCEN's CDD rule. PII (SSN, DOB, address) is stored encrypted at rest via field-level encryption. | — |
| Name | Computed as the business, followed by a hyphen, followed by the lower-cased full name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | _Kebab-cased compound PK: {Business}-{FullName slug}._ |
| Business Label | The legal name of the beneficial owner's business. | _Display label of the parent Business._ |
| Meets25 Percent Threshold | True when the ownership percentage is at least 25. | _True when OwnershipPercentage >= 25._ |
| Meets CDD Threshold | True when at least one of the following holds: the meets25 percent threshold flag is set or the control person flag is set. | _True when this row counts toward CDD compliance: meets 25% OR is the control person._ |
| **Contact** | Non-owner individuals associated with a Business: officers, AP clerks, authorized signers, additional points of contact. Distinct from BeneficialOwners (which carries PII/CDD weight). | — |
| Name | Computed as the business, followed by a hyphen, followed by the lower-cased full name with every a space replaced by a hyphen, followed by a hyphen, followed by the lower-cased title with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | _Kebab-cased compound PK: {Business}-{FullName slug}-{Title slug}._ |
| Business Label | The legal name of the contact's business. | _Display label of the parent Business._ |
| Is Officer | True when the contact type is “Officer”. | _True when ContactType = 'Officer'._ |
| Is AP Clerk | True when the contact type is “APClerk”. | _True when ContactType = 'APClerk'._ |
| **Account** | Deposit accounts the Business holds at the bank (checking, savings, money market). Balances feed GlobalCashFlow during credit analysis. TreasuryServices enrollment flags (ACH, Wire, Card) are stored per-account. | — |
| Name | Computed as the business, followed by a hyphen, followed by the lower-cased account type, followed by a hyphen, followed by the account number last4. | _Kebab-cased compound PK: {Business}-{AccountType}-{Last4}._ |
| Business Label | The legal name of the account's business. | _Display label of the parent Business._ |
| Treasury Service Count | Computed as the count of the following that hold: the ACH flag is set; the wire flag is set; and the card flag is set. | _Number of treasury services enrolled on this account._ |
| Has Any Treasury Service | True when the treasury service count is greater than 0. | _True when at least one treasury service is enrolled._ |
| **Loan** | Credit facilities extended to a Business, tracked from inquiry through funding, servicing, and payoff. RiskRating is denormalized here for fast reads; every change is captured in RiskRatingHistory. | — |
| Name | Computed as the lower-cased loan number with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | _Kebab-cased PK derived from LoanNumber (e.g. 'L-0051' -> 'l-0051')._ |
| Business Label | The legal name of the loan's business. | _Display label of the borrower Business._ |
| Business NAICS Code | Taken from the linked business. | _NAICS code of the borrower Business (concentration analytics)._ |
| Originating RM Label | The full name of the loan's originating RM. | _Display label of the originating RM._ |
| Underwriter is Admin | True when the loan's underwriter is an admin. | _True when the loan's underwriter holds the Admin role (looked up from Users.IsAdmin)._ |
| Is Funded | True when the underwriting stage is “Funded”. | _True when UnderwritingStage = 'Funded'._ |
| Is Classified Asset | True when the risk rating is at least 7. | _True when RiskRating is substandard (7) or worse._ |
| DSCR in Band | True when the DSCR (a missing value counts as 0) is at least 1.20. | _True when DSCR meets or exceeds the 1.20 minimum band._ |
| LTV in Band | True when the LTV (a missing value counts as 0) is at most 0.80. | _True when LTV is at or below 0.80, or null (unsecured)._ |
| Segregation of Duties Ok | True when it is not the case that the originating RM is the underwriter. | _True when the originating RM and the underwriter are different Users (segregation-of-duties check)._ |
| Count of Covenants | The number of covenants related to the loan. | _Number of Covenants attached to this loan._ |
| Count of Breached Covenants | The number of the loan's covenants that are breached. | _Number of Covenants currently in Breached status on this loan._ |
| Count of Risk Rating History | The number of risk rating history related to the loan. | _Number of RiskRatingHistory rows for this loan._ |
| Count of Documents | The number of documents related to the loan. | _Number of Documents attached directly to this Loan._ |
| Has Breached Covenant | True when the count of breached covenants is greater than 0. | _True when at least one covenant is in breach._ |
| On Watchlist | True when at least one of the following holds: the classified asset flag is set or the breached covenant flag is set. | _Higher-order: on the watchlist when the loan is a classified asset OR has any breached covenant._ |
| Health Score | Computed as the count of the following that hold: the DSCR in band flag is set; the LTV in band flag is set; the classified asset flag is not set; and the breached covenant flag is not set. | _Higher-order composite health score (0-4): +1 for DscrInBand, +1 for LtvInBand, +1 for NOT IsClassifiedAsset, +1 for NOT HasBreachedCovenant._ |
| **Covenant** | Conditions attached to a Loan that must be tested on a recurring schedule (e.g. minimum DSCR each quarter). CovenantMonitoring runs the tickler calendar ahead of NextTestDate; breaches surface as SystemEvent Interactions. | — |
| Name | Computed as the loan, followed by a hyphen, followed by the lower-cased covenant type with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | _Kebab-cased compound PK: {Loan}-{CovenantType slug}._ |
| Loan Label | The loan number of the covenant's loan. | _Display label of the parent Loan._ |
| Loan Business | Taken from the linked loan. | _Business of the parent Loan (chained lookup)._ |
| Is Breached | True when the status is “Breached”. | _True when Status = 'Breached'._ |
| Has Active Waiver | True when the current waiver through is set. | _True when CurrentWaiverThrough is set (waiver is on file)._ |
| **Risk Rating History** | Time-series of risk-grade changes on a Loan. Regulators audit rating drift, so every migration is captured here. AnnualReview also writes a row even when the grade is reaffirmed unchanged. | — |
| Name | Computed as the loan, followed by a hyphen, followed by the TEXT of the effective date and “yyyy-mm-dd”, followed by “-grade-”, followed by the TEXT of the new grade and “0”. | _Kebab-cased compound PK: {Loan}-{EffectiveDate}-grade-{NewGrade}._ |
| Loan Label | The loan number of the risk rating history's loan. | _Display label of the parent Loan._ |
| Changed by User Label | The full name of the risk rating history's changed by user. | _Display label of the user who recorded the change._ |
| Grade Delta | Computed as the new grade minus the prior grade (a missing value counts as the new grade). | _NewGrade - PriorGrade (positive = downgrade in this scale); equals 0 on initial rating._ |
| Is Downgrade | True when the grade delta is greater than 0. | _True when the migration represents a downgrade (higher grade number = worse risk)._ |
| Is Initial Rating | True when the prior grade (a missing value counts as 0) is 0. | _True when this is the loan's first rating row (no PriorGrade)._ |
| Crossed Classified Threshold | True when all of the following hold: the prior grade (a missing value counts as 0) is less than 7 and the new grade is at least 7. | _Higher-order: true when this migration is the moment a loan crossed from non-classified to classified (PriorGrade < 7 and NewGrade >= 7)._ |
| **Document** | Files in the DocumentVault. A document attaches to either a Business (tax returns, formation docs) or a Loan (note, security agreement, appraisal). Both FKs are nullable so a document can hang off the appropriate parent. | — |
| Name | Computed as the lower-cased filename with every a space replaced by a hyphen with every a period replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | _Kebab-cased PK derived from the filename._ |
| Business Label | The legal name of the document's business. | _Display label of the attached Business (if any)._ |
| Loan Label | The loan number of the document's loan. | _Display label of the attached Loan (if any)._ |
| Uploaded by User Label | The full name of the document's uploaded by user. | _Display label of the uploader (if known)._ |
| Attached to | Determined by priority: “Loan” if the loan is set; “Business” if the business is set; in all other cases, “Orphan”. | _Which parent this document hangs off: 'Loan', 'Business', or 'Orphan' (neither set)._ |
| From Customer Portal | True when the uploaded via is “BusinessClientPortal”. | _True when uploaded by the customer themselves via the BusinessClientPortal._ |
| **Interaction** | Unified activity-log feed for a Business. An Interaction is intentionally generic: InteractionType discriminates Note, Call, Visit, Task, Meeting, or SystemEvent. Covenant breaches, document requests, and other machine actions are written as SystemEvent interactions so they appear in the same stream as human-logged activity. | — |
| Name | Computed as the business, followed by a hyphen, followed by the TEXT of the interaction date and “yyyy-mm-dd”, followed by a hyphen, followed by the lower-cased interaction type, followed by a hyphen, followed by the lower-cased subject with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | _Kebab-cased compound PK: {Business}-{InteractionDate}-{InteractionType slug}-{Subject slug}._ |
| Business Label | The legal name of the interaction's business. | _Display label of the parent Business._ |
| User Label | The full name of the interaction's user. | _Display label of the logging user (if any)._ |
| Is System Event | True when the interaction type is “SystemEvent”. | _True for system-generated rows._ |
| Is Task | True when the interaction type is “Task”. | _True for Task-type rows._ |
| From Customer | True when the source is “BusinessClientPortal”. | _True when sourced from the BusinessClientPortal (customer-originated)._ |
| Is Covenant Event | True when all of the following hold: the system event flag is set and the subject mentions “covenant”. | _Higher-order: true when this is a covenant-related system event (subject contains 'covenant')._ |

## 2 Fact Types

- a **business** references exactly one **user**
- a **business** may reference one **business**
- a **beneficial owner** references exactly one **business**
- a **contact** references exactly one **business**
- an **account** references exactly one **business**
- a **loan** references exactly one **business**
- a **loan** references exactly one **user**
- a **covenant** references exactly one **loan**
- a **risk rating history** references exactly one **loan**
- a **risk rating history** references exactly one **user**
- a **document** may reference one **business**
- a **document** may reference one **loan**
- a **document** may reference one **user**
- an **interaction** references exactly one **business**
- an **interaction** may reference one **user**

## 3 Operative Rules

_Operative rules state what the business **obliges**, **prohibits**, or
advises (**should**). Structural rules come from required fields and foreign keys;
semantic rules come from the Constraints table, each keyed on a boolean the rulebook
already computes (cross-referenced as DR-N in the Definitional Rules below)._

### Structural Constraints (from the schema)

- A user **must** have a full name, a role, and an email.
- A business **must** reference exactly one user as its relationship manager.
- A business **must** have a legal name, a business structure, an NAICS code, and a status.
- A beneficial owner **must** reference exactly one business.
- A beneficial owner **must** have a full name, a date of birth, an SSN, an address, and an ownership percentage, and record whether it is a control person.
- A contact **must** reference exactly one business.
- A contact **must** have a full name, a title, and a contact type, and record whether it is an authorized signer.
- An account **must** reference exactly one business.
- An account **must** have an account type, an account number last4, a current balance USD, and an opened at, and record whether it has an ACH, whether it has a wire, and whether it has a card.
- A loan **must** reference exactly one business.
- A loan **must** reference exactly one user as its originating RM.
- A loan **must** reference exactly one user as its underwriter.
- A loan **must** have a loan number, a loan purpose, a principal USD, a rate pct, a term months, an underwriting stage, a risk rating, a risk rating label, and an originated at.
- A covenant **must** reference exactly one loan.
- A covenant **must** have a covenant type, a test frequency, a next test date, and a status.
- A risk rating history **must** reference exactly one loan.
- A risk rating history **must** reference exactly one user as its changed by user.
- A risk rating history **must** have an effective date, a new grade, and a reason.
- A document **must** have a filename, a document type, and an uploaded at, and record whether it is ocr indexed.
- An interaction **must** reference exactly one business.
- An interaction **must** have an interaction type, a subject, and an interaction date.

### BSA/AML (CDD)

- **biz-cdd** *(hard)* — A business **must** have a beneficial owners at CDD threshold of more than 0.
  - _On violation:_ “Beneficial-ownership (CDD) collection is incomplete: no owner crosses the 25% threshold and no control person is designated.”
  - _Source:_ FinCEN CDD Rule, 31 CFR 1010.230
  - _Keys on:_ Meets CDD Rule (see DR-25).

### Credit Policy

- **loan-dscr** *(override)* — A loan **must** have a DSCR of at least 1.20 *(waivable by an authorized approver)*.
  - _On violation:_ “DSCR is below the 1.20 minimum; a credit-committee waiver is required to fund.”
  - _Source:_ Internal Credit Policy §2.1 (DSCR floor)
  - _Keys on:_ DSCR in Band (see DR-46).
- **loan-ltv** *(override)* — A loan **must** have an LTV of at most 0.80 *(waivable by an authorized approver)*.
  - _On violation:_ “LTV exceeds the 0.80 ceiling; a credit-committee waiver is required to fund.”
  - _Source:_ Internal Credit Policy §2.2 (LTV ceiling)
  - _Keys on:_ LTV in Band (see DR-47).

### Portfolio Monitoring

- **loan-watchlist** *(advisory)* — A loan **should** satisfy that at least one of the following holds: the classified asset flag is set or the breached covenant flag is set.
  - _On violation:_ “This loan is a classified asset or has a breached covenant but is not flagged on the watchlist.”
  - _Source:_ Internal Portfolio Risk Procedure §6 (watchlist)
  - _Keys on:_ On Watchlist (see DR-54).

### Segregation of Duties

- **loan-sod** *(hard)* — A loan **must not** be funded by the same user who originated it: the originating relationship manager and the underwriter must be different users.
  - _On violation:_ “The same user originated and underwrote this loan — segregation of duties is violated.”
  - _Source:_ Internal Credit Policy §4.2

## 4 Definitional Rules

_All statements express truth in the business domain; they are neither
procedures nor imperatives. "iff" is avoided in favor of "only if" so a
one-directional necessity is not mistaken for an equivalence. A
**⚠︎ mechanical** chip marks a rule whose deterministic wording is faithful
but clunky — a flag for an optional downstream reword pass, not a defect._

| ID | Declarative rule |
|----|------------------|
| **DR-1 Name** | A user's name is computed as the lower-cased full name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-2 Is RM** | A user is considered an RM if the role is “RM”. |
| **DR-3 Is Underwriter** | A user is considered an underwriter if the role is “Underwriter”. |
| **DR-4 Is Branch Banker** | A user is considered a branch banker if the role is “BranchBanker”. |
| **DR-5 Is Admin** | A user is considered an admin if the role is “Admin”. |
| **DR-6 Count of Portfolio Businesses** | A user's count of portfolio businesses is the number of businesses related to the user. |
| **DR-7 Count of Originated Loans** | A user's count of originated loans is the number of loans related to the user. |
| **DR-8 Count of Underwritten Loans** | A user's count of underwritten loans is the number of loans related to the user. |
| **DR-9 Name** | A business's name is computed as the lower-cased legal name with every a space replaced by a hyphen with every a period replaced by an empty string. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-10 Relationship Manager Label** | A business's relationship manager label is the full name of the business's relationship manager. |
| **DR-11 Is Customer** | A business is considered a customer if the status is “Customer”. |
| **DR-12 Is Prospect** | A business is considered a prospect if the status is “Prospect”. |
| **DR-13 Was Referred** | A business is considered to have been referred if the referral source is set. |
| **DR-14 Count of Beneficial Owners** | A business's count of beneficial owners is the number of beneficial owners related to the business. |
| **DR-15 Count of Contacts** | A business's count of contacts is the number of contacts related to the business. |
| **DR-16 Count of Accounts** | A business's count of accounts is the number of accounts related to the business. |
| **DR-17 Count of Loans** | A business's count of loans is the number of loans related to the business. |
| **DR-18 Count of Interactions** | A business's count of interactions is the number of interactions related to the business. |
| **DR-19 Count of Documents** | A business's count of documents is the number of documents related to the business. |
| **DR-20 Total Deposit Balance USD** | A business's total deposit balance USD is the total current balance USD across the accounts related to the business. |
| **DR-21 Total Loan Principal USD** | A business's total loan principal USD is the total principal USD across the loans related to the business. |
| **DR-22 Count of Classified Loans** | A business's count of classified loans is the number of the business's loans that are classified assets. |
| **DR-23 Has Classified Loan** | A business is considered to have a classified loan if the count of classified loans is greater than 0. |
| **DR-24 Beneficial Owners At CDD Threshold** | A business's beneficial owners at CDD threshold is the number of the business's beneficial owners that meet a CDD threshold. |
| **DR-25 Meets CDD Rule** | A business is considered to meet a CDD rule if the beneficial owners at CDD threshold is greater than 0. |
| **DR-26 Portfolio Priority** | The business's portfolio priority is determined by the following priority:<br>1. “High”, if the classified loan flag is set;<br>2. “Medium”, if at least one of the following holds: the meets CDD rule flag is not set; the prospect flag is set; or the count of loans is 0;<br>3. in all other cases, “Low”. |
| **DR-27 Name** | A beneficial owner's name is computed as the business, followed by a hyphen, followed by the lower-cased full name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-28 Business Label** | A beneficial owner's business label is the legal name of the beneficial owner's business. |
| **DR-29 Meets25 Percent Threshold** | A beneficial owner is flagged meets25 percent threshold if the ownership percentage is at least 25. |
| **DR-30 Meets CDD Threshold** | A beneficial owner is considered to meet a CDD threshold if at least one of the following holds: the meets25 percent threshold flag is set or the control person flag is set. |
| **DR-31 Name** | A contact's name is computed as the business, followed by a hyphen, followed by the lower-cased full name with every a space replaced by a hyphen, followed by a hyphen, followed by the lower-cased title with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-32 Business Label** | A contact's business label is the legal name of the contact's business. |
| **DR-33 Is Officer** | A contact is considered an officer if the contact type is “Officer”. |
| **DR-34 Is AP Clerk** | A contact is considered an AP clerk if the contact type is “APClerk”. |
| **DR-35 Name** | An account's name is computed as the business, followed by a hyphen, followed by the lower-cased account type, followed by a hyphen, followed by the account number last4. |
| **DR-36 Business Label** | An account's business label is the legal name of the account's business. |
| **DR-37 Treasury Service Count** | An account's treasury service count is computed as the count of the following that hold: the ACH flag is set; the wire flag is set; and the card flag is set. |
| **DR-38 Has Any Treasury Service** | An account is considered to have any treasury service if the treasury service count is greater than 0. |
| **DR-39 Name** | A loan's name is computed as the lower-cased loan number with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-40 Business Label** | A loan's business label is the legal name of the loan's business. |
| **DR-41 Business NAICS Code** | A loan's business NAICS code — taken from the linked business. |
| **DR-42 Originating RM Label** | A loan's originating RM label is the full name of the loan's originating RM. |
| **DR-43 Underwriter is Admin** | A loan's underwriter is admin is true when the loan's underwriter is an admin. |
| **DR-44 Is Funded** | A loan is considered funded if the underwriting stage is “Funded”. |
| **DR-45 Is Classified Asset** | A loan is considered a classified asset if the risk rating is at least 7. |
| **DR-46 DSCR in Band** | A loan is flagged DSCR in band if the DSCR (a missing value counts as 0) is at least 1.20. |
| **DR-47 LTV in Band** | A loan is flagged LTV in band if the LTV (a missing value counts as 0) is at most 0.80. |
| **DR-48 Segregation of Duties Ok** | A loan is flagged segregation of duties ok if it is not the case that the originating RM is the underwriter. |
| **DR-49 Count of Covenants** | A loan's count of covenants is the number of covenants related to the loan. |
| **DR-50 Count of Breached Covenants** | A loan's count of breached covenants is the number of the loan's covenants that are breached. |
| **DR-51 Count of Risk Rating History** | A loan's count of risk rating history is the number of risk rating history related to the loan. |
| **DR-52 Count of Documents** | A loan's count of documents is the number of documents related to the loan. |
| **DR-53 Has Breached Covenant** | A loan is considered to have a breached covenant if the count of breached covenants is greater than 0. |
| **DR-54 On Watchlist** | A loan is flagged on watchlist if at least one of the following holds: the classified asset flag is set or the breached covenant flag is set. |
| **DR-55 Health Score** | A loan's health score is computed as the count of the following that hold: the DSCR in band flag is set; the LTV in band flag is set; the classified asset flag is not set; and the breached covenant flag is not set. |
| **DR-56 Name** | A covenant's name is computed as the loan, followed by a hyphen, followed by the lower-cased covenant type with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-57 Loan Label** | A covenant's loan label is the loan number of the covenant's loan. |
| **DR-58 Loan Business** | A covenant's loan business — taken from the linked loan. |
| **DR-59 Is Breached** | A covenant is considered breached if the status is “Breached”. |
| **DR-60 Has Active Waiver** | A covenant is considered to have an active waiver if the current waiver through is set. |
| **DR-61 Name** | A risk rating history's name is computed as the loan, followed by a hyphen, followed by the TEXT of the effective date and “yyyy-mm-dd”, followed by “-grade-”, followed by the TEXT of the new grade and “0”. |
| **DR-62 Loan Label** | A risk rating history's loan label is the loan number of the risk rating history's loan. |
| **DR-63 Changed by User Label** | A risk rating history's changed by user label is the full name of the risk rating history's changed by user. |
| **DR-64 Grade Delta** | A risk rating history's grade delta is computed as the new grade minus the prior grade (a missing value counts as the new grade). |
| **DR-65 Is Downgrade** | A risk rating history is considered a downgrade if the grade delta is greater than 0. |
| **DR-66 Is Initial Rating** | A risk rating history is considered initial-rating if the prior grade (a missing value counts as 0) is 0. |
| **DR-67 Crossed Classified Threshold** | A risk rating history is flagged crossed classified threshold if all of the following hold: the prior grade (a missing value counts as 0) is less than 7 and the new grade is at least 7. |
| **DR-68 Name** | A document's name is computed as the lower-cased filename with every a space replaced by a hyphen with every a period replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-69 Business Label** | A document's business label is the legal name of the document's business. |
| **DR-70 Loan Label** | A document's loan label is the loan number of the document's loan. |
| **DR-71 Uploaded by User Label** | A document's uploaded by user label is the full name of the document's uploaded by user. |
| **DR-72 Attached to** | The document's attached to is determined by the following priority:<br>1. “Loan”, if the loan is set;<br>2. “Business”, if the business is set;<br>3. in all other cases, “Orphan”. |
| **DR-73 From Customer Portal** | A document is flagged from customer portal if the uploaded via is “BusinessClientPortal”. |
| **DR-74 Name** | An interaction's name is computed as the business, followed by a hyphen, followed by the TEXT of the interaction date and “yyyy-mm-dd”, followed by a hyphen, followed by the lower-cased interaction type, followed by a hyphen, followed by the lower-cased subject with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-75 Business Label** | An interaction's business label is the legal name of the interaction's business. |
| **DR-76 User Label** | An interaction's user label is the full name of the interaction's user. |
| **DR-77 Is System Event** | An interaction is considered a system event if the interaction type is “SystemEvent”. |
| **DR-78 Is Task** | An interaction is considered a task if the interaction type is “Task”. |
| **DR-79 From Customer** | An interaction is flagged from customer if the source is “BusinessClientPortal”. |
| **DR-80 Is Covenant Event** | An interaction is considered a covenant event if all of the following hold: the system event flag is set and the subject mentions “covenant”. |

## 5 Traceability to Schema

_The expression column is the rule's definition in RuleSpeak notation —
the same logic the rulebook stores, written for a business reader._

| Schema element | Kind | Expression |
|----------------|------|------------|
| **Users.Name** | formula | `Replace(Lower(FullName), " ", "-")` |
| **Users.IsRM** | formula | `Role = "RM"` |
| **Users.IsUnderwriter** | formula | `Role = "Underwriter"` |
| **Users.IsBranchBanker** | formula | `Role = "BranchBanker"` |
| **Users.IsAdmin** | formula | `Role = "Admin"` |
| **Users.CountOfPortfolioBusinesses** | rollup | `Count(Businesses via RelationshipManager)` |
| **Users.CountOfOriginatedLoans** | rollup | `Count(Loans via OriginatingRm)` |
| **Users.CountOfUnderwrittenLoans** | rollup | `Count(Loans via Underwriter)` |
| **Businesses.Name** | formula | `Replace(Replace(Lower(LegalName), " ", "-"), ".", "")` |
| **Businesses.RelationshipManagerLabel** | lookup | `Lookup(Users.FullName via RelationshipManager)` |
| **Businesses.IsCustomer** | formula | `Status = "Customer"` |
| **Businesses.IsProspect** | formula | `Status = "Prospect"` |
| **Businesses.WasReferred** | formula | `Not(Coalesce(ReferralSource, "") = "")` |
| **Businesses.CountOfBeneficialOwners** | rollup | `Count(BeneficialOwners via Business)` |
| **Businesses.CountOfContacts** | rollup | `Count(Contacts via Business)` |
| **Businesses.CountOfAccounts** | rollup | `Count(Accounts via Business)` |
| **Businesses.CountOfLoans** | rollup | `Count(Loans via Business)` |
| **Businesses.CountOfInteractions** | rollup | `Count(Interactions via Business)` |
| **Businesses.CountOfDocuments** | rollup | `Count(Documents via Business)` |
| **Businesses.TotalDepositBalanceUsd** | rollup | `Sum(Accounts.CurrentBalanceUsd via Business)` |
| **Businesses.TotalLoanPrincipalUsd** | rollup | `Sum(Loans.PrincipalUsd via Business)` |
| **Businesses.CountOfClassifiedLoans** | rollup | `Count(Loans via Business)` |
| **Businesses.HasClassifiedLoan** | formula | `CountOfClassifiedLoans > 0` |
| **Businesses.BeneficialOwnersAtCddThreshold** | rollup | `Count(BeneficialOwners via Business)` |
| **Businesses.MeetsCddRule** | formula | `BeneficialOwnersAtCddThreshold > 0` |
| **Businesses.PortfolioPriority** | formula | `If(HasClassifiedLoan, "High", If(Or(Not(MeetsCddRule), IsProspect, CountOfLoans = 0), "Medium", "Low"))` |
| **BeneficialOwners.Name** | formula | `Business & "-" & Replace(Lower(FullName), " ", "-")` |
| **BeneficialOwners.BusinessLabel** | lookup | `Lookup(Businesses.LegalName via Business)` |
| **BeneficialOwners.Meets25PercentThreshold** | formula | `OwnershipPercentage >= 25` |
| **BeneficialOwners.MeetsCddThreshold** | formula | `Or(Meets25PercentThreshold, IsControlPerson)` |
| **Contacts.Name** | formula | `Business & "-" & Replace(Lower(FullName), " ", "-") & "-" & Replace(Lower(Title), " ", "-")` |
| **Contacts.BusinessLabel** | lookup | `Lookup(Businesses.LegalName via Business)` |
| **Contacts.IsOfficer** | formula | `ContactType = "Officer"` |
| **Contacts.IsApClerk** | formula | `ContactType = "APClerk"` |
| **Accounts.Name** | formula | `Business & "-" & Lower(AccountType) & "-" & AccountNumberLast4` |
| **Accounts.BusinessLabel** | lookup | `Lookup(Businesses.LegalName via Business)` |
| **Accounts.TreasuryServiceCount** | formula | `If(HasAch, 1, 0) + If(HasWire, 1, 0) + If(HasCard, 1, 0)` |
| **Accounts.HasAnyTreasuryService** | formula | `TreasuryServiceCount > 0` |
| **Loans.Name** | formula | `Replace(Lower(LoanNumber), " ", "-")` |
| **Loans.BusinessLabel** | lookup | `Lookup(Businesses.LegalName via Business)` |
| **Loans.BusinessNaicsCode** | lookup | `Lookup(Businesses.NaicsCode via Business)` |
| **Loans.OriginatingRmLabel** | lookup | `Lookup(Users.FullName via OriginatingRm)` |
| **Loans.UnderwriterIsAdmin** | lookup | `Lookup(Users.IsAdmin via Underwriter)` |
| **Loans.IsFunded** | formula | `UnderwritingStage = "Funded"` |
| **Loans.IsClassifiedAsset** | formula | `RiskRating >= 7` |
| **Loans.DscrInBand** | formula | `Coalesce(Dscr, 0) >= 1.20` |
| **Loans.LtvInBand** | formula | `Coalesce(Ltv, 0) <= 0.80` |
| **Loans.SegregationOfDutiesOk** | formula | `Not(OriginatingRm = Underwriter)` |
| **Loans.CountOfCovenants** | rollup | `Count(Covenants via Loan)` |
| **Loans.CountOfBreachedCovenants** | rollup | `Count(Covenants via Loan)` |
| **Loans.CountOfRiskRatingHistory** | rollup | `Count(RiskRatingHistory via Loan)` |
| **Loans.CountOfDocuments** | rollup | `Count(Documents via Loan)` |
| **Loans.HasBreachedCovenant** | formula | `CountOfBreachedCovenants > 0` |
| **Loans.OnWatchlist** | formula | `Or(IsClassifiedAsset, HasBreachedCovenant)` |
| **Loans.HealthScore** | formula | `If(DscrInBand, 1, 0) + If(LtvInBand, 1, 0) + If(IsClassifiedAsset, 0, 1) + If(HasBreachedCovenant, 0, 1)` |
| **Covenants.Name** | formula | `Loan & "-" & Replace(Lower(CovenantType), " ", "-")` |
| **Covenants.LoanLabel** | lookup | `Lookup(Loans.LoanNumber via Loan)` |
| **Covenants.LoanBusiness** | lookup | `Lookup(Loans.Business via Loan)` |
| **Covenants.IsBreached** | formula | `Status = "Breached"` |
| **Covenants.HasActiveWaiver** | formula | `Not(Coalesce(CurrentWaiverThrough, "") = "")` |
| **RiskRatingHistory.Name** | formula | `Loan & "-" & Text(EffectiveDate, "yyyy-mm-dd") & "-grade-" & Text(NewGrade, "0")` |
| **RiskRatingHistory.LoanLabel** | lookup | `Lookup(Loans.LoanNumber via Loan)` |
| **RiskRatingHistory.ChangedByUserLabel** | lookup | `Lookup(Users.FullName via ChangedByUser)` |
| **RiskRatingHistory.GradeDelta** | formula | `NewGrade - Coalesce(PriorGrade, NewGrade)` |
| **RiskRatingHistory.IsDowngrade** | formula | `GradeDelta > 0` |
| **RiskRatingHistory.IsInitialRating** | formula | `Coalesce(PriorGrade, 0) = 0` |
| **RiskRatingHistory.CrossedClassifiedThreshold** | formula | `And(Coalesce(PriorGrade, 0) < 7, NewGrade >= 7)` |
| **Documents.Name** | formula | `Replace(Replace(Lower(Filename), " ", "-"), ".", "-")` |
| **Documents.BusinessLabel** | lookup | `Lookup(Businesses.LegalName via Business)` |
| **Documents.LoanLabel** | lookup | `Lookup(Loans.LoanNumber via Loan)` |
| **Documents.UploadedByUserLabel** | lookup | `Lookup(Users.FullName via UploadedByUser)` |
| **Documents.AttachedTo** | formula | `If(Not(Coalesce(Loan, "") = ""), "Loan", If(Not(Coalesce(Business, "") = ""), "Business", "Orphan"))` |
| **Documents.FromCustomerPortal** | formula | `UploadedVia = "BusinessClientPortal"` |
| **Interactions.Name** | formula | `Business & "-" & Text(InteractionDate, "yyyy-mm-dd") & "-" & Lower(InteractionType) & "-" & Replace(Lower(Subject), " ", "-")` |
| **Interactions.BusinessLabel** | lookup | `Lookup(Businesses.LegalName via Business)` |
| **Interactions.UserLabel** | lookup | `Lookup(Users.FullName via User)` |
| **Interactions.IsSystemEvent** | formula | `InteractionType = "SystemEvent"` |
| **Interactions.IsTask** | formula | `InteractionType = "Task"` |
| **Interactions.FromCustomer** | formula | `Source = "BusinessClientPortal"` |
| **Interactions.IsCovenantEvent** | formula | `And(IsSystemEvent, Not(Iferror(Find("covenant", Lower(Subject)), 0) = 0))` |

---

_This document is rendered in **RuleSpeak®**, the declarative business-rule
notation created by **Ronald G. Ross**, and follows the conventions of
**SBVR** (Semantics of Business Vocabulary and Business Rules). With thanks to
Ronald G. Ross for RuleSpeak and his foundational work on business rules —
[www.RonRoss.info](https://www.RonRoss.info)._
