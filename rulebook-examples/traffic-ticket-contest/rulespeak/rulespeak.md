# 📘 traffic-ticket-contest — RuleSpeak®

_A production-grade ERB platform (admin/state-machine/jurisdiction/routing/feature-catalog machinery, extracted from the industrial-ui-services portal) with traffic-ticket contest as the example domain. The platform tables carry the full production conventions; tickets are one domain riding on top._

> Declarative business rules rendered from the rulebook. Every statement
> below expresses truth in the business domain — it is neither a procedure
> nor an imperative. The rulebook's formulas are the single source of truth;
> this document is their plain-language reading.

## 1 Business Vocabulary

| Term | Description | Narrative Comment |
|------|-------------|-------------------|
| **Business Rule** | A business rule is identified by its name and is related to optionally a business rule category (its category). | — |
| Name | Computed as the lower-cased rule code with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | _Logical key — lowercased rule code._ |
| Rule Code | A defined attribute. | _Stable rule identifier (R1, R2, ... R38)._ |
| Title | A defined attribute. | _Short title of the rule._ |
| Category | A defined attribute. | _FK to BusinessRuleCategories — the category bucket this rule belongs to (ROUTING \| hard-stop \| soft-flag \| high-risk \| SCORING \| DECISION \| REVIEW \| SUBMISSION \| data-integrity)._ |
| Sort Order | A defined attribute. | _Display order of the rule within its category (drag/drop sortable)._ |
| Description | A defined attribute. | _Full rule statement from the platform narrative._ |
| Schema Location | A defined attribute. | _Where the rule is enforced in the schema (table.field or formula reference)._ |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **Business Rule Category** | A business rule category is identified by its name. | — |
| Name | The same as its business rule category ID. | _Echoes BusinessRuleCategoryId._ |
| Title | A defined attribute. | _Human-readable category title shown on the category card._ |
| Description | A defined attribute. | _What this category groups._ |
| Sort Order | A defined attribute. | _Display order of the category card on the Business Rules page (drag/drop sortable)._ |
| Business Rules | A defined attribute. | _Reverse: business rules in this category._ |
| Rule Count | The number of the business rule category's rules. | _Count of BusinessRules in this category._ |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **Glossary Category** | A glossary category is identified by its name. | — |
| Name | The same as its glossary category ID. | _Echoes GlossaryCategoryId._ |
| Title | A defined attribute. | _Human-readable category title shown on the category card._ |
| Description | A defined attribute. | _What this category groups._ |
| Sort Order | A defined attribute. | _Display order of the category card on the Glossary page (drag/drop sortable)._ |
| Glossary Terms | A defined attribute. | _Reverse: glossary terms in this category._ |
| Term Count | The number of the glossary category's terms. | _Count of GlossaryTerms in this category._ |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **Glossary Term** | A glossary term is identified by its name and is related to optionally a glossary category (its category). | — |
| Name | Computed as the lower-cased term with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | _Logical key — lowercased dash-form of the term._ |
| Term | A defined attribute. | _The glossary term as it appears in user-facing copy._ |
| Category | A defined attribute. | _FK to GlossaryCategories — the category bucket this term belongs to (PEOPLE \| LEGAL \| LIFECYCLE \| ALLEGATION \| EVIDENCE \| SCORING \| DECISION \| SYSTEM \| ANALYTICS)._ |
| Sort Order | A defined attribute. | _Display order of the term within its category (drag/drop sortable)._ |
| Definition | A defined attribute. | _Canonical definition from the glossary._ |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **Role** | A role is identified by its name. | — |
| Name | The same as its role ID. | _Echoes RoleId._ |
| Title | A defined attribute. | _Human-readable role title._ |
| Description | A defined attribute. | _What this role does / who holds it._ |
| Default CRUD | A defined attribute. | _Role-level baseline CRUD grant (contains C/R/U/D). Table/Field perms inherit from this when NULL. e.g. Admin=CRUD._ |
| Order Index | A defined attribute. | _Sort order (REP=1 .. ADMIN=4)._ |
| Is Admin Equivalent | True when an empty string. | _TRUE when this role gets admin-level nav visibility (ADMIN and OPERATIONS)._ |
| Is Redacted Role | True when an empty string. | _DEFAULT redaction posture for this role. TRUE = a "redacted role": by default it gets NO CRUD on any field that has a "<Field>Redacted" sibling (e.g. SSN is denied when SSNRedacted exists). Flows down to every table; override per table+role via ERBTables.{Role}IsRedacted._ |
| App Users | A defined attribute. | _Reverse: app users holding this role._ |
| App User Count | The number of the role's app users. | _Count of AppUsers with this role._ |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **Audit Log Entry** | An audit log entry is identified by its name and is related to optionally a citation and optionally an app user (its actor). | — |
| Name | Computed as the lower-cased “audit-”, followed by the citation, followed by a hyphen, followed by the timestamp formatted as “YYYY-MM-DDTHH-mm-ss”, followed by a hyphen, followed by the action type with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | _Logical key._ |
| Citation | A defined attribute. | _FK to the Citation this audit entry concerns._ |
| Actor | A defined attribute. | _FK to the AppUser who performed the action._ |
| Timestamp | A defined attribute. | _When the action occurred._ |
| Action Type | A defined attribute. | _STATUS_CHANGE \| field-edit \| OVERRIDE \| review-decision \| recommendation-change \| SUBMISSION \| hard-stop-block._ |
| From Value | A defined attribute. | _Previous value (if applicable)._ |
| To Value | A defined attribute. | _New value (if applicable)._ |
| Reason | A defined attribute. | _Reason text — required for OVERRIDE._ |
| Is Override Action | True when the action type, followed by an empty string is “override”. | _Calculated flag — TRUE when this audit log entry represents a manager override action (vs a routine action)._ |
| Entry Age Hours | Computed as the number of hours from the timestamp to the current date and time. ⚠︎ mechanical <!-- rulespeak:reword --> | _Calculated — hours elapsed since EntryTimestamp. Used to age audit log entries._ |
| Source | A defined attribute. | _Origin of the action, e.g. UI / API / IMPORT / PORTAL / SYSTEM._ |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **Platform Naviation** | A platform naviation is identified by its name and is related to optionally an ERB package. | — |
| Name | Computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | — |
| Display Name | A defined attribute. | — |
| Route | A defined attribute. | — |
| Description | A defined attribute. | — |
| Sort Order | A defined attribute. | — |
| Parent Route Key | A defined attribute. | _Route key of parent nav node (empty for top-level)_ |
| Route Key | A defined attribute. | _Stable dot-delimited slug, e.g. checklists.score_ |
| Nav Level | A defined attribute. | _Hierarchy level_ |
| Role Visibility | A defined attribute. | _Comma-separated canonical roles that can see this nav item. Tokens: REP / MANAGER / OPERATIONS / ADMIN (uppercase). ADMIN visibility implies OPERATIONS._ |
| Primary Table | A defined attribute. | _Backing table name_ |
| ERB Package | A defined attribute. | _FK -> ERBPackages.ERBPackageId. The package that owns this route._ |
| Package is Active | True when the linked ERB package is active. | _Lookup: ERBPackage.IsActive — is this route's owning package enabled? UI hides the route when false._ |
| Package is Licensed | True when the linked ERB package is licensed. | _Lookup: ERBPackage.IsLicensed — is this route's owning package licensed? UI hides the route from non-Effortless users when false._ |
| Primary View | A defined attribute. | _Backing vw_* view_ |
| Business Rule Refs | A defined attribute. | _CSV of rule codes shown on this route_ |
| Build Phase | A defined attribute. | _Build order phase 1-7_ |
| Status | A defined attribute. | _Implementation status_ |
| Is Licensed | True when an empty string. | _This route's own licensing flag. When false, the route is hidden from non-Effortless users regardless of its package (used to fence off the Effortless Elements admin tooling). Blank/true = licensed._ |
| Requires Claim Context | True when an empty string. | _True if route needs an active claim/checklist context_ |
| Pin to Top | True when an empty string. | _Pin this route to the very top of its nav level, before SortOrder_ |
| Is Dynamic | True when an empty string. | _True if path contains :params_ |
| Icon Hint | A defined attribute. | _Optional icon name for UI_ |
| Admin CRUD | A defined attribute. | _Admin CRUD grant for this route (contains C/R/U/D). NULL/empty = role cannot access this route. Seeded from RoleVisibility._ |
| Manager CRUD | A defined attribute. | _Manager CRUD grant for this route (contains C/R/U/D). NULL/empty = role cannot access this route. Seeded from RoleVisibility._ |
| Representative CRUD | A defined attribute. | _Representative CRUD grant for this route (contains C/R/U/D). NULL/empty = role cannot access this route. Seeded from RoleVisibility._ |
| External Llm CRUD | A defined attribute. | _External LLM CRUD grant for this route (contains C/R/U/D). NULL/empty = role cannot access this route. Seeded from RoleVisibility._ |
| Admin Can Create | True when the admin CRUD mentions “C”. | _Derived: AdminCRUD contains 'C' (BLANK when AdminCRUD is NULL)._ |
| Admin Can Read | True when the admin CRUD mentions “R”. | _Derived: AdminCRUD contains 'R' (BLANK when AdminCRUD is NULL)._ |
| Admin Can Update | True when the admin CRUD mentions “U”. | _Derived: AdminCRUD contains 'U' (BLANK when AdminCRUD is NULL)._ |
| Admin Can Delete | True when the admin CRUD mentions “D”. | _Derived: AdminCRUD contains 'D' (BLANK when AdminCRUD is NULL)._ |
| Manager Can Create | True when the manager CRUD mentions “C”. | _Derived: ManagerCRUD contains 'C' (BLANK when ManagerCRUD is NULL)._ |
| Manager Can Read | True when the manager CRUD mentions “R”. | _Derived: ManagerCRUD contains 'R' (BLANK when ManagerCRUD is NULL)._ |
| Manager Can Update | True when the manager CRUD mentions “U”. | _Derived: ManagerCRUD contains 'U' (BLANK when ManagerCRUD is NULL)._ |
| Manager Can Delete | True when the manager CRUD mentions “D”. | _Derived: ManagerCRUD contains 'D' (BLANK when ManagerCRUD is NULL)._ |
| Representative Can Create | True when the representative CRUD mentions “C”. | _Derived: RepresentativeCRUD contains 'C' (BLANK when RepresentativeCRUD is NULL)._ |
| Representative Can Read | True when the representative CRUD mentions “R”. | _Derived: RepresentativeCRUD contains 'R' (BLANK when RepresentativeCRUD is NULL)._ |
| Representative Can Update | True when the representative CRUD mentions “U”. | _Derived: RepresentativeCRUD contains 'U' (BLANK when RepresentativeCRUD is NULL)._ |
| Representative Can Delete | True when the representative CRUD mentions “D”. | _Derived: RepresentativeCRUD contains 'D' (BLANK when RepresentativeCRUD is NULL)._ |
| External Llm Can Create | True when the external llm CRUD mentions “C”. | _Derived: External LLMCRUD contains 'C' (BLANK when External LLMCRUD is NULL)._ |
| External Llm Can Read | True when the external llm CRUD mentions “R”. | _Derived: External LLMCRUD contains 'R' (BLANK when External LLMCRUD is NULL)._ |
| External Llm Can Update | True when the external llm CRUD mentions “U”. | _Derived: External LLMCRUD contains 'U' (BLANK when External LLMCRUD is NULL)._ |
| External Llm Can Delete | True when the external llm CRUD mentions “D”. | _Derived: External LLMCRUD contains 'D' (BLANK when External LLMCRUD is NULL)._ |
| Depth | Determined by priority: 0 if the parent route key is blank; in all other cases, the length of the route key minus the length of the route key with every a period replaced by an empty string. ⚠︎ mechanical <!-- rulespeak:reword --> | _Calculated — nesting depth in the menu tree. 0 = top-level (no parent); otherwise the number of dot-segments in the dotted RouteKey above the root (e.g. 'library.rules.detail' = 2). Drives N-deep indentation._ |
| Full Path | The same as its route. | _Calculated — canonical role-agnostic URL path (equals Route). The SPA renders this under each permitted role as /:role + FullPath and resolves it only when that role's *CanRead is true; the role is an implicit prefix, never stored on the row._ |
| Handler Base Name | Computed as the route key with every a period replaced by a space with every a hyphen replaced by a space. ⚠︎ mechanical <!-- rulespeak:reword --> | _Calculated — space-delimited form of the dotted RouteKey (dots and hyphens become spaces), e.g. 'library rules detail'. The client PascalCases this and prefixes the viewer role to derive the handler component deterministically: {Role} + PascalCase(HandlerBaseName) -> e.g. AdminLibraryRulesDetail, RepresentativeLibraryRulesDetail. No per-role handler is stored; edge cases get their own single-role route row instead._ |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **Jurisdiction** | A jurisdiction is identified by its name and is related to optionally another jurisdiction (its parent jurisdiction); optionally another jurisdiction (its child jurisdictions); and optionally a jurisdiction source document (its source documents). | — |
| Name | Computed as the lower-cased state, followed by “-us”. | — |
| State | A defined attribute. | — |
| Notes | A defined attribute. | — |
| Jurisdiction Type | A defined attribute. | — |
| Code | A defined attribute. | _Short human code for the jurisdiction, e.g. 'CA-LA', 'NY-NYC', 'TX-AUS'._ |
| Display Name | A defined attribute. | _Full readable jurisdiction name, e.g. 'Los Angeles County, California'._ |
| Days to Respond | A defined attribute. | _Number of days after issuance the driver has to respond (pay or request a hearing) before default judgment._ |
| Days to Pay After Ruling | A defined attribute. | _Number of days after a guilty ruling (or after issuance if not contested) the fine is due before it is late._ |
| Late Penalty Pct | A defined attribute. | _Percentage surcharge added to the assessed amount once a payment is late (e.g. 0.25 = 25%)._ |
| Days Late to Collections | A defined attribute. | _Number of days a payment may remain late before it is referred to collections._ |
| Point Suspension Threshold | A defined attribute. | _Total active license points at or above which a driver's license is suspended in this jurisdiction._ |
| Point Warning Threshold | A defined attribute. | _Total active license points at or above which a driver receives an advisory warning (below suspension)._ |
| Traffic School Point Cap | A defined attribute. | _Maximum violation points for which traffic school is offered as a points-reducing option in this jurisdiction._ |
| Parent Jurisdiction | A defined attribute. | _The parent jurisdiction in the hierarchy (e.g., US for California). Empty for root jurisdictions like countries._ |
| Parent Jurisdiction Name | Taken from the linked parent jurisdiction. | — |
| Child Jurisdictions | A defined attribute. | _The child jurisdictions under this parent (e.g., all 50 states roll up to US)._ |
| Jurisdiction Rules | A defined attribute. | — |
| Is Root Jurisdiction | True when the parent jurisdiction is blank. | — |
| Child Jurisdiction Count | The number of jurisdictions related to the jurisdiction. | — |
| Relative Path | Computed as “/library/jurisdictions/”, followed by the jurisdiction ID. | _Concrete relative URL for this jurisdiction's explorer/detail page. Self-contained (no route-table lookup) so it is always populated. Anywhere a jurisdiction is referenced, link to this path._ |
| Rule Count | The number of jurisdiction rules related to the jurisdiction. | _How many JurisdictionRules belong to this jurisdiction (drives the explorer badges)._ |
| Source Documents | A defined attribute. | _Source documents (e.g. Appeal Board Decision PDFs) downloaded for this jurisdiction; rules are extracted from them._ |
| Source Document Count | The number of jurisdiction source documents related to the jurisdiction. | — |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **ERB Version** | An ERB version is identified by its name. | — |
| Name | A defined attribute. | _Logical key for this ERB version row (Airtable primary field)._ |
| Base ID | A defined attribute. | _Airtable base ID this version snapshot belongs to._ |
| Version | A defined attribute. | _Semantic version string for this ERB rulebook snapshot (e.g. 1.4.2)._ |
| Message | A defined attribute. | _Short commit-style message describing what changed in this version._ |
| Notes | A defined attribute. | _Long-form release notes for this version._ |
| Commit Date | A defined attribute. | _Date this version was committed/published._ |
| Is Published | True when an empty string. | _TRUE when this version has been published (vs draft)._ |
| Author | A defined attribute. | — |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **ERB Customization** | An ERB customization is identified by its name. | — |
| Name | A defined attribute. | _Logical key for this ERB customization row (Airtable primary field)._ |
| Title | A defined attribute. | _Human-readable title for this customization._ |
| SQL Code | A defined attribute. | _SQL code body to be injected into the corresponding *b-customize-* file during effortless build._ |
| SQL Target | A defined attribute. | _Which generated SQL stage this customization targets (e.g. functions, views, policies, data)._ |
| Customization Type | A defined attribute. | _Type of customization (e.g. function, view, trigger, policy) — drives where it lands in the generated stage._ |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **Jurisdiction Source Document** | A jurisdiction source document is identified by its name and is related to optionally a jurisdiction. | — |
| Name | Computed as the lower-cased title with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | — |
| Title | A defined attribute. | — |
| Jurisdiction | A defined attribute. | _The jurisdiction this source document belongs to._ |
| Doc Type | A defined attribute. | _Kind of document, e.g. appeal-board-decision, statute, ordinance, regulation, guidance._ |
| Relative File Path | A defined attribute. | _Local (git-ignored) path to the downloaded file under git-ignored-examples/jurisdiction-rules/. NOT a web route — the on-disk source artifact._ |
| Source URL | A defined attribute. | _Original URL the document was downloaded from (the FTP / appeal-board source)._ |
| Extracted Text | A defined attribute. | _Full or excerpted text extracted from the document, used as raw material for the AI rule distillation._ |
| Notes | A defined attribute. | — |
| Jurisdiction Rules | A defined attribute. | _Rules extracted from this document._ |
| Jurisdiction Name | Taken from the linked jurisdiction. | — |
| Relative Path | Computed as “/library/jurisdiction-docs/”, followed by the jurisdiction source document ID. | _Concrete relative URL for this document's detail page in the portal._ |
| Rule Count | The number of jurisdiction rules related to the jurisdiction source document. | — |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **Jurisdiction Rule** | A jurisdiction rule is identified by its name and is related to optionally a platform naviation (its route); optionally a jurisdiction source document (its source document); and optionally a jurisdiction. | — |
| Name | Computed as the lower-cased rule number with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | — |
| Route | A defined attribute. | _Platform route this JurisdictionRules row navigates to. Defaults to the "rule-detail" detail route; its template feeds RelativePath._ |
| Route Path | Taken from the linked route. | _The route template (with :params) pulled from the linked PlatformNaviation route._ |
| Relative Path | Computed as “/library/jurisdiction-rules/”, followed by the jurisdiction rule ID. | _Concrete relative URL for this rule's detail page. Self-contained (dedicated /library/jurisdiction-rules/ space) so it never collides with the business-rule library at /library/rules. Anywhere a jurisdiction rule is referenced, link to this path._ |
| Rule Number | A defined attribute. | — |
| Title | A defined attribute. | — |
| Description | A defined attribute. | — |
| Category | A defined attribute. | — |
| Effective Date | A defined attribute. | — |
| Citation URL | A defined attribute. | — |
| Ai Version | A defined attribute. | _The AI-distilled 'traffic-ticket-contest version' of this rule: a compact, plain-language restatement of exactly what this rule means for an unemployment claim. This is the context injected when the rule is invoked, so only this (not the full statute / source PDF) need be included in a claim's prompt._ |
| Ai Version Updated At | A defined attribute. | _When AiVersion was last generated or approved._ |
| Ai Version Model | A defined attribute. | _Provenance: the model / author that produced the current AiVersion (e.g. a model slug, or 'human')._ |
| Source Document | A defined attribute. | _The source document (e.g. Appeal Board Decision PDF) this rule was extracted from._ |
| Jurisdiction | A defined attribute. | — |
| Jurisdiction Name | Taken from the linked jurisdiction. | — |
| Jurisdiction Type | Taken from the linked jurisdiction. | — |
| Is Federal | True when the jurisdiction type is “Country”. | — |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **App User** | An app user is identified by its name and is related to optionally a role. | — |
| Name | A defined attribute. | — |
| Name Redacted | The same as its name. | _Redacted (masked) view of Name. Redacted roles read this instead of Name._ |
| Email Address | A defined attribute. | — |
| Email Address Redacted | The same as its email address. | _Redacted (masked) view of EmailAddress. Redacted roles read this instead of EmailAddress._ |
| Is Effortless Employee | True when an empty string. | _When true, this user is EffortlessAPI staff and can see UNLICENSED surfaces (Effortless Elements admin tooling, the hearing module, any IsLicensed=false package/route). Everyone else only sees licensed surfaces. Enforced in the app layer today; re-enforced by RLS later._ |
| Role | A defined attribute. | _Enum: REP / MANAGER / OPERATIONS / ADMIN. REP=line claims rep; MANAGER=team lead/supervisor; OPERATIONS=back-office (admin-equivalent visibility); ADMIN=system administrator._ |
| Role Title | Taken from the linked role. | _Lookup: Role.Title._ |
| Role Description | Taken from the linked role. | _Lookup: Role.Description._ |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **Magic Link Config** | A magic link config is identified by its name. | — |
| Name | A defined attribute. | — |
| Enabled | True when an empty string. | — |
| Tenant ID | A defined attribute. | — |
| Public Key Pem | A defined attribute. | — |
| User Table Name | A defined attribute. | — |
| Email Field | A defined attribute. | — |
| Role Field | A defined attribute. | — |
| Is Active Field | A defined attribute. | — |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **Site Branding** | A site branding is identified by its name. | — |
| Name | The same as its site branding ID. | _Echoes SiteBrandingId._ |
| Company Name | A defined attribute. | _Full company / brand name (og:site_name)._ |
| Short Name | A defined attribute. | _Short application name (meta application-name)._ |
| Brand Abbreviation | A defined attribute. | _Short brand mark shown in the sidebar / compact spaces (logo wordmark)._ |
| Site Title | A defined attribute. | _Document <title> / og:title._ |
| Meta Description | A defined attribute. | _Meta description / og:description._ |
| Tagline | A defined attribute. | _Primary marketing headline / hero tagline._ |
| Sub Tagline | A defined attribute. | _Secondary supporting tagline._ |
| Website URL | A defined attribute. | _Canonical marketing site URL (rel=canonical / og:url)._ |
| Logo URL | A defined attribute. | _Primary logo image URL._ |
| Favicon URL | A defined attribute. | _Favicon (32x32) URL._ |
| Apple Touch Icon URL | A defined attribute. | _Apple touch icon (180x180) URL._ |
| Og Image URL | A defined attribute. | _Open Graph / social share image URL._ |
| Og Type | A defined attribute. | _Open Graph type (e.g. website)._ |
| Og Locale | A defined attribute. | _Open Graph locale (e.g. en_US)._ |
| Twitter Card | A defined attribute. | _Twitter card type (e.g. summary_large_image)._ |
| Primary Color | A defined attribute. | _Primary brand / accent color (hex)._ |
| Secondary Color | A defined attribute. | _Secondary brand color used for headers/footers (hex)._ |
| Accent Color | A defined attribute. | _Tertiary accent color used in gradients (hex)._ |
| Text Color | A defined attribute. | _Default body text color (hex)._ |
| Background Color | A defined attribute. | _Default page background color (hex)._ |
| Tile Color | A defined attribute. | _MS application tile color (hex)._ |
| Contact Email | A defined attribute. | _Public contact email._ |
| Contact Phone | A defined attribute. | _Public contact phone._ |
| Address Line1 | A defined attribute. | _Street address line._ |
| City | A defined attribute. | _City._ |
| State Region | A defined attribute. | _State / region code._ |
| Postal Code | A defined attribute. | _Postal / ZIP code._ |
| Linked in URL | A defined attribute. | _LinkedIn company page URL._ |
| You Tube URL | A defined attribute. | _YouTube channel URL._ |
| Copyright | A defined attribute. | _Footer copyright line._ |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **Reference Document** | A reference document is identified by its name and is related to optionally a jurisdiction. | — |
| Name | The same as its reference document ID. | _Echoes ReferenceDocumentId._ |
| Library | A defined attribute. | _Enum: interpretation-series / appeal-board-decisions._ |
| Series Number | A defined attribute. | _Interpretation-series number or decision number._ |
| Title | A defined attribute. | _Title of the reference document._ |
| Reference State | A defined attribute. | _US state the reference applies to (2-letter)._ |
| Jurisdiction | A defined attribute. | _Optional FK → Jurisdictions.JurisdictionId._ |
| File Name | A defined attribute. | _Source filename._ |
| Citation URL | A defined attribute. | _Canonical citation URL, if published._ |
| Is Appeal Board Decision | True when the library is “appeal-board-decisions”. | _TRUE when Library = appeal-board-decisions._ |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **State Machine** | A state machine is identified by its name and is related to optionally an ERB package. | — |
| Name | The same as its state machine ID. | _Echoes StateMachineId._ |
| Title | A defined attribute. | _Human-readable machine title._ |
| Description | A defined attribute. | _What this machine governs and its high-level flow._ |
| Subject Table Name | A defined attribute. | _Convention string naming the entity table this machine governs (e.g. 'Citations'). NOT a relationship FK._ |
| Subject State Column | A defined attribute. | _Name of the raw column on the subject that holds its current state (e.g. 'ChecklistStatus', 'CurrentStateKey')._ |
| ERB Package | A defined attribute. | _FK -> ERBPackages.ERBPackageId. The package that owns this state machine._ |
| Package is Active | True when the linked ERB package is active. | _Lookup: ERBPackage.IsActive — is this machine's owning package enabled? UI hides the machine when false._ |
| Machine States | A defined attribute. | _Reverse: legal states of this machine._ |
| State Transition Rules | A defined attribute. | _Reverse: legal edges of this machine._ |
| State Transitions | A defined attribute. | _Reverse: instance transition log rows for this machine._ |
| State Count | The number of the state machine's states. | _Count of MachineStates in this machine._ |
| Transition Rule Count | The number of the state machine's transition rules. | _Count of StateTransitionRules in this machine._ |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **Machine State** | A machine state is identified by its name and is related to a state machine; optionally a state transition rule (its from transition rules); and optionally a state transition rule (its to transition rules). | — |
| Name | The same as its machine state ID. | _Echoes MachineStateId._ |
| State Machine | A defined attribute. | _FK -> StateMachines.StateMachineId._ |
| State Key | A defined attribute. | _Bare value as stored in the subject's current-state column, e.g. 'DRAFT'._ |
| Title | A defined attribute. | _Human-readable state title._ |
| Order Index | A defined attribute. | _Sort order of this state within the machine._ |
| Is Initial | True when an empty string. | _TRUE if this is the machine's entry state._ |
| Is Terminal | True when an empty string. | _TRUE if this is a terminal/end state._ |
| From Transition Rules | A defined attribute. | _Reverse: rules whose FromState is this state._ |
| To Transition Rules | A defined attribute. | _Reverse: rules whose ToState is this state._ |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **State Transition Rule** | A state transition rule is identified by its name and is related to a state machine; a machine state (its from state); and a machine state (its to state). | — |
| Name | The same as its state transition rule ID. | _Echoes StateTransitionRuleId._ |
| State Machine | A defined attribute. | _FK -> StateMachines.StateMachineId._ |
| From State | A defined attribute. | _FK -> MachineStates.MachineStateId._ |
| To State | A defined attribute. | _FK -> MachineStates.MachineStateId._ |
| Guard Description | A defined attribute. | _Prose guard citing existing R-codes (e.g. 'R4: requires SeparationType + PrimaryAllegation'). Does NOT reimplement rule logic._ |
| Rule Refs | A defined attribute. | _CSV of BusinessRule codes the guard enforces._ |
| Trigger Endpoint | A defined attribute. | _APIEndpoints id whose action fires this transition._ |
| Triggered by Role | A defined attribute. | _Role that fires this edge. Enum: REP / MANAGER / CLIENT / state-agency / ocr-job / ai-step / EY_BATCH / SYSTEM._ |
| From State Key | Taken from the linked from state. | _Lookup: FromState.StateKey._ |
| To State Key | Taken from the linked to state. | _Lookup: ToState.StateKey._ |
| Is Forward Edge | True when it is not the case that the to state key is “draft”. | _TRUE when ToState is not the machine's initial state._ |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **State Transition** | A state transition is identified by its name and is related to a state machine and optionally an app user (its triggered by). | — |
| Name | The same as its state transition ID. | _Echoes StateTransitionId._ |
| State Machine | A defined attribute. | _FK -> StateMachines.StateMachineId._ |
| Subject Table Name | A defined attribute. | _Polymorphic pointer: name of the subject's table (raw string, NOT a relationship)._ |
| Subject ID | A defined attribute. | _Polymorphic pointer: id of the subject row (raw string, NOT a relationship)._ |
| From State Key | A defined attribute. | _Bare from-state value (mirror of today's FromStage). Null on the initial creation transition._ |
| To State Key | A defined attribute. | _Bare to-state value (mirror of today's ToStage)._ |
| Transition At | A defined attribute. | _When the transition occurred._ |
| Triggered by | A defined attribute. | _FK -> AppUsers.AppUserId — the actor when a human. Null for system/automated transitions._ |
| Triggered by Role | A defined attribute. | _Role that fired this transition. Enum: REP / MANAGER / CLIENT / state-agency / ocr-job / ai-step / EY_BATCH / SYSTEM._ |
| Reason | A defined attribute. | _Why the transition happened (free text; carries old Notes/Reason)._ |
| Is Forward | True when all of the following hold: it is not the case that the to state key is “draft”; it is not the case that the to state key is “new”; it is not the case that the to state key is “pending”; it is not the case that the to state key is “open”; and it is not the case that the to state key is “issued”. | _Generalizes the old =NOT(ToStage="DRAFT"): TRUE when ToStateKey is not the machine's initial state._ |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **Work Queue Item** | A work queue item is identified by its name and is related to optionally an app user (its assigned to). | — |
| Name | The same as its work queue item ID. | _Echoes WorkQueueItemId._ |
| Subject Table Name | A defined attribute. | _Polymorphic pointer: subject's table name (raw string, NOT a relationship)._ |
| Subject ID | A defined attribute. | _Polymorphic pointer: subject row id (raw string, NOT a relationship)._ |
| Item Type | A defined attribute. | _What kind of work this is. Enum: sides-response / benefit-charge / DETERMINATION / document-ocr / CHECKLIST / hearing-prep._ |
| Current State Key | A defined attribute. | _Current (non-terminal) state of the subject, copied from its state column._ |
| Due Date | A defined attribute. | _Due date carried from the subject (e.g. Citations.PaymentDueDate, Citations.ResponseDueDate)._ |
| Due in Days | Computed as the number of days from today's date to the due date. ⚠︎ mechanical <!-- rulespeak:reword --> | _Calculated — days until DueDate (negative when overdue)._ |
| Assigned to | A defined attribute. | _FK -> AppUsers.AppUserId — the AppUser who owns this work item._ |
| Is Overdue | True when the due in days is less than 0. | _TRUE when DueInDays < 0._ |
| Urgency Bucket | Determined by priority: “follow-up” if the due in days is blank; “urgent” if the due in days is at most 0; “due-3-days” if the due in days is at most 3; in all other cases, “upcoming”. | _URGENT (overdue or due today) / DUE_3_DAYS / UPCOMING / FOLLOW_UP (no due date)._ |
| Is Urgent | True when the urgency bucket is “urgent”. | _TRUE when UrgencyBucket = URGENT._ |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **Ai Model** | An ai model is identified by its name. | — |
| Name | The same as its ai model ID. | _Echoes AiModelId._ |
| Title | A defined attribute. | _Human-readable model name._ |
| Provider | A defined attribute. | _Provider/vendor key (lower-kebab): openai / anthropic / google / erb-internal._ |
| Description | A defined attribute. | _What the model is and when the assistant uses it._ |
| Is Internal | True when an empty string. | _TRUE for ERB-owned/self-hosted models (vs a third-party API)._ |
| Is Active | True when an empty string. | _Whether this model is currently selectable by the assistant._ |
| Context Window Tokens | A defined attribute. | _Max context window in tokens (reference only)._ |
| Model Pricing Versions | A defined attribute. | _Reverse: pricing versions for this model._ |
| Assistant Turns | A defined attribute. | _Reverse: assistant turns served by this model._ |
| Pricing Version Count | The number of model pricing versions related to the ai model. | _Count of pricing versions on this model._ |
| Turn Count | The number of assistant turns related to the ai model. | _Count of assistant turns served by this model._ |
| Total Cost | The total total cost across the assistant turns related to the ai model. | _Rollup — total USD spend across all turns served by this model._ |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **Model Pricing Version** | A model pricing version is identified by its name and is related to an ai model. | — |
| Name | The same as its model pricing version ID. | _Echoes ModelPricingVersionId._ |
| Ai Model | A defined attribute. | _FK -> AiModels.AiModelId._ |
| Label | A defined attribute. | _Human-readable label for this pricing era._ |
| Currency | A defined attribute. | _ISO currency code (lower-kebab), e.g. 'usd'._ |
| Input Price Per M Tok | A defined attribute. | _Price per 1,000,000 NON-cached input tokens._ |
| Cached Input Price Per M Tok | A defined attribute. | _Price per 1,000,000 cached input tokens (prompt-cache reads). 0 if unsupported._ |
| Output Price Per M Tok | A defined attribute. | _Price per 1,000,000 output (completion) tokens._ |
| Effective Date | A defined attribute. | _Date this pricing took effect (date-only business date)._ |
| Is Active | True when an empty string. | _TRUE for the currently-billing version of this model; superseded versions are FALSE._ |
| Notes | A defined attribute. | _Free text — source/announcement of this pricing._ |
| Ai Model Title | Taken from the linked ai model. | _Lookup: AiModel.Title._ |
| Assistant Turns | A defined attribute. | _Reverse: assistant turns priced with this version._ |
| Turn Count | The number of assistant turns related to the model pricing version. | _Count of assistant turns priced with this version._ |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **Assistant Turn** | An assistant turn is identified by its name and is related to optionally a citation; an ai model; and a model pricing version. | — |
| Name | The same as its assistant turn ID. | _Echoes AssistantTurnId._ |
| Created At | A defined attribute. | _When the turn was submitted (ISO timestamp)._ |
| Current State Key | A defined attribute. | _Final state of the chat-agent machine for this turn: 'responding' (success) or 'failed'. Bare StateKey value._ |
| Question Kind | A defined attribute. | _Classifier branch: rulebook / company / claim._ |
| Route Path | A defined attribute. | _Concrete app path the turn was active on, e.g. '/claims/zamora-thiago-2026-01-30'._ |
| Route Key | A defined attribute. | _PlatformNaviation route_key in scope when known (raw string, not an FK — concrete instance paths need not match a nav row)._ |
| Citation | A defined attribute. | _FK to the Citation this assistant turn concerns._ |
| App User ID | A defined attribute. | _App user who asked (raw id; linked logically)._ |
| Ai Model | A defined attribute. | _FK -> AiModels.AiModelId — model that answered._ |
| Model Pricing Version | A defined attribute. | _FK -> ModelPricingVersions.ModelPricingVersionId — the exact pricing version used to bill this turn (snapshotted so historical cost is stable even after prices change)._ |
| User Message | A defined attribute. | _The user's question text for this turn._ |
| Assistant Reply | A defined attribute. | _The assistant's reply text._ |
| Raw Exchange | A defined attribute. | _Full request/response metadata as raw JSON (messages, system-prompt kind, usage block, finish reason, latency)._ |
| Input Tokens | A defined attribute. | _Total prompt/input tokens (including any cached)._ |
| Cached Input Tokens | A defined attribute. | _Portion of input tokens served from prompt cache (billed at the cached rate)._ |
| Output Tokens | A defined attribute. | _Completion/output tokens._ |
| Total Tokens | Computed as the input tokens plus the output tokens. | _Input + output tokens._ |
| Billable Input Tokens | Computed as the input tokens minus the cached input tokens. | _Non-cached input tokens = InputTokens - CachedInputTokens._ |
| Ai Model Title | Taken from the linked ai model. | _Lookup: AiModel.Title._ |
| Input Price Per M Tok | Taken from the linked model pricing version. | _Lookup: ModelPricingVersion.InputPricePerMTok._ |
| Cached Input Price Per M Tok | Taken from the linked model pricing version. | _Lookup: ModelPricingVersion.CachedInputPricePerMTok._ |
| Output Price Per M Tok | Taken from the linked model pricing version. | _Lookup: ModelPricingVersion.OutputPricePerMTok._ |
| Input Cost | Computed as the billable input tokens times the input price per m tok plus the cached input tokens times the cached input price per m tok divided by 1000000. | _USD cost of input: (BillableInputTokens × InputPrice + CachedInputTokens × CachedInputPrice) / 1,000,000._ |
| Output Cost | Computed as the output tokens times the output price per m tok divided by 1000000. | _USD cost of output: OutputTokens × OutputPrice / 1,000,000._ |
| Total Cost | Computed as the input cost plus the output cost. | _Total USD cost for this turn = InputCost + OutputCost. Rolls up to Client and Claim._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **Platform** | A platform is identified by its name. | — |
| Name | The same as its platform ID. | _Echoes PlatformId._ |
| Title | A defined attribute. | _Human-readable platform name._ |
| Description | A defined attribute. | _What this platform is, in prose._ |
| Sort Order | A defined attribute. | _Display order._ |
| Is Active | True when an empty string. | _Master switch for the platform._ |
| ERB Tables | A defined attribute. | _Reverse link to ERBTables — tables belonging to this platform (1->many)._ |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **ERB Package** | An ERB package is identified by its name. | — |
| Name | The same as its ERB package ID. | _Echoes ERBPackageId._ |
| Title | A defined attribute. | _Human-readable package name._ |
| Description | A defined attribute. | _What this package/product module does, in prose._ |
| Status | A defined attribute. | _Lifecycle: SHIPPED / in-progress / PLANNED / DEPRECATED._ |
| Is Active | True when an empty string. | _Master switch. When false, every table/field/route owned by this package reports PackageIsActive=false and the UI hides it pervasively (rows stay in the DB)._ |
| Is Licensed | True when an empty string. | _Licensing master switch. When false, every route owned by this package reports PackageIsLicensed=false and is hidden from non-Effortless users (rows stay in the DB; Effortless staff still see them). Separate axis from IsActive._ |
| Sort Order | A defined attribute. | _Display order in a generated spec / nav._ |
| Is Key | True when an empty string. | _Star flag — marks the headline packages so users can focus on the top platform capabilities amid the long tail. Blank/false = ordinary packages._ |
| Source Text | A defined attribute. | _Supporting/original source text (markdown) describing the package._ |
| Source Files | A defined attribute. | _Comma-separated repo-relative path(s) of the source document(s)._ |
| ERB Features | A defined attribute. | _Reverse link to ERBFeatures — child feature rows belonging to this package (1->many)._ |
| ERB Tables | A defined attribute. | _Reverse link to ERBTables — tables belonging to this package (1->many)._ |
| Platform Naviation | A defined attribute. | _Reverse link to PlatformNaviation — routes belonging to this package (1->many)._ |
| State Machines | A defined attribute. | _Reverse link to StateMachines — state machines belonging to this package (1->many)._ |
| Feature Count | Computed as the count of the ERB features. | _Count of child ERBFeatures rows._ |
| Shipped Feature Count | The number of the ERB package's ERB features that have a status of “shipped”. | _Count of child features with Status = SHIPPED._ |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **ERB Feature Status** | An ERB feature status is identified by its name. | — |
| Name | The same as its ERB feature status ID. | _Echoes ERBFeatureStatusId._ |
| Title | A defined attribute. | _Human-readable status title._ |
| Description | A defined attribute. | _What this status means._ |
| Order Index | A defined attribute. | _Lifecycle sort order._ |
| Is Active | True when an empty string. | _TRUE if features in this status are part of the official, shared project view. DESIGNED=false (design-only, hidden from the everyone-sees rulebook)._ |
| Is Terminal | True when an empty string. | _TRUE for end-of-life statuses (SHIPPED, DEFERRED)._ |
| ERB Features | A defined attribute. | _Reverse: features in this status._ |
| Feature Count | The number of the ERB feature status's features. | _Count of ERBFeatures in this status._ |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **ERB Feature Category** | An ERB feature category is identified by its name. | — |
| Name | The same as its ERB feature category ID. | _Echoes ERBFeatureCategoryId._ |
| Title | A defined attribute. | _Human-readable category title shown on the category filter / card._ |
| Description | A defined attribute. | _What kind of features this category groups._ |
| Icon | A defined attribute. | _Optional emoji/glyph used as a compact visual marker for the category in the UI._ |
| Sort Order | A defined attribute. | _Display order of the category in filters and grouped views._ |
| ERB Features | A defined attribute. | _Reverse: features in this category._ |
| Feature Count | The number of the ERB feature category's features. | _Count of ERBFeatures in this category._ |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **ERB Feature** | An ERB feature is identified by its name and is related to optionally a platform naviation (its route); an ERB package; optionally an ERB feature category (its category); and optionally an ERB feature status (its status). | — |
| Name | The same as its ERB feature ID. | _Echoes ERBFeatureId._ |
| Route | A defined attribute. | _Platform route this ERBFeatures row navigates to. Defaults to the "feature-detail" detail route; its template feeds RelativePath._ |
| Route Path | Taken from the linked route. | _The route template (with :params) pulled from the linked PlatformNaviation route._ |
| Relative Path | Computed as the route path with every “:featureId” replaced by the ERB feature ID. | _Concrete relative URL for this row — the route template with its :param(s) substituted by this row's own id(s)._ |
| ERB Package | A defined attribute. | _FK -> ERBPackages.ERBPackageId. The package this feature belongs to (many features -> one package)._ |
| Is Licensed | True when an empty string. | _This feature's own licensing flag. When false, the feature is hidden from non-Effortless users regardless of its package (used to fence off Effortless Elements tooling features). Blank/true = licensed._ |
| Package is Licensed | True when the linked ERB package is licensed. | _Lookup: ERBPackage.IsLicensed — is this feature's owning package licensed? UI hides the feature from non-Effortless users when false._ |
| Title | A defined attribute. | _Human-readable feature name._ |
| Description | A defined attribute. | _What the feature does, in prose._ |
| Category | A defined attribute. | _FK to ERBFeatureCategories — the cross-package functional category this feature belongs to (intake / scoring / module / validation / review / output / extraction / prep / dashboard / integration / data-model / platform / devops)._ |
| Category Title | Taken from the linked category. | _Lookup: Category.Title — human-readable category name._ |
| Status | A defined attribute. | _FK to ERBFeatureStatuses — feature lifecycle status._ |
| Status Title | Taken from the linked status. | _Lookup: Status.Title._ |
| Status Description | Taken from the linked status. | _Lookup: Status.Description._ |
| Status is Active | True when the linked status is active. | _Lookup: Status.IsActive — whether this feature is part of the official shared view._ |
| Sort Order | A defined attribute. | _Display order within the package._ |
| Is Key | True when an empty string. | _Star flag — marks the headline features so users can focus on the top platform capabilities amid the long tail. Blank/false = ordinary features._ |
| Rule Refs | A defined attribute. | _Comma-separated BusinessRules.RuleCode refs (R1..R38) this feature implements, if any._ |
| Source Text | A defined attribute. | _Original / supporting source text (markdown) that describes this feature._ |
| Source Files | A defined attribute. | _Comma-separated repo-relative path(s) of the source document(s)._ |
| Image URL | A defined attribute. | _Repo-relative path to a cartoon illustration of this feature (generated, 300x300 PNG under assets/feature-images/)._ |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **ERB Table** | An ERB table is identified by its name and is related to an ERB package and a platform. | — |
| Name | The same as its ERB table ID. | _Echoes ERBTableId._ |
| Table Name | A defined attribute. | _Table name._ |
| Description | A defined attribute. | _Table description (copied from the rulebook; refreshed additively by build)._ |
| ERB Package | A defined attribute. | _FK -> ERBPackages.ERBPackageId. The package that owns this table._ |
| Platform | A defined attribute. | _FK -> Platforms.PlatformId. The platform this table belongs to._ |
| Package is Active | True when the linked ERB package is active. | _Lookup: ERBPackage.IsActive — is this table's owning package enabled?_ |
| Is Licensed | True when an empty string. | _This table's own licensing flag. When false, the table is hidden from non-Effortless users regardless of its package (used to fence off Effortless Elements meta/catalog tables). Blank/true = licensed._ |
| Package is Licensed | True when the linked ERB package is licensed. | _Lookup: ERBPackage.IsLicensed — is this table's owning package licensed? UI hides the table from non-Effortless users when false._ |
| Field Count | A defined attribute. | _Number of fields (refreshed by build)._ |
| Is Catalog | True when an empty string. | _TRUE for the meta/catalog tables themselves._ |
| Admin CRUD | A defined attribute. | _Admin CRUD grant for this table (contains C/R/U/D). NULL inherits Roles.DefaultCRUD for Admin._ |
| Admin WHERE | A defined attribute. | _Admin row-access policy (SQL WHERE fragment) limiting which rows of this table Admin may see. NULL = no row restriction. Source for the RLS plan._ |
| Manager CRUD | A defined attribute. | _Manager CRUD grant for this table (contains C/R/U/D). NULL inherits Roles.DefaultCRUD for Manager._ |
| Manager WHERE | A defined attribute. | _Manager row-access policy (SQL WHERE fragment) limiting which rows of this table Manager may see. NULL = no row restriction. Source for the RLS plan._ |
| Representative CRUD | A defined attribute. | _Representative CRUD grant for this table (contains C/R/U/D). NULL inherits Roles.DefaultCRUD for Representative._ |
| Representative WHERE | A defined attribute. | _Representative row-access policy (SQL WHERE fragment) limiting which rows of this table Representative may see. NULL = no row restriction. Source for the RLS plan._ |
| External Llm CRUD | A defined attribute. | _External LLM CRUD grant for this table (contains C/R/U/D). NULL inherits Roles.DefaultCRUD for External LLM._ |
| External Llm WHERE | A defined attribute. | _External LLM row-access policy (SQL WHERE fragment) limiting which rows of this table External LLM may see. NULL = no row restriction. Source for the RLS plan._ |
| Admin Can Create | True when the admin CRUD mentions “C”. | _Derived: AdminCRUD contains 'C' (BLANK when AdminCRUD is NULL = inherits role default)._ |
| Admin Can Read | True when the admin CRUD mentions “R”. | _Derived: AdminCRUD contains 'R' (BLANK when AdminCRUD is NULL = inherits role default)._ |
| Admin Can Update | True when the admin CRUD mentions “U”. | _Derived: AdminCRUD contains 'U' (BLANK when AdminCRUD is NULL = inherits role default)._ |
| Admin Can Delete | True when the admin CRUD mentions “D”. | _Derived: AdminCRUD contains 'D' (BLANK when AdminCRUD is NULL = inherits role default)._ |
| Manager Can Create | True when the manager CRUD mentions “C”. | _Derived: ManagerCRUD contains 'C' (BLANK when ManagerCRUD is NULL = inherits role default)._ |
| Manager Can Read | True when the manager CRUD mentions “R”. | _Derived: ManagerCRUD contains 'R' (BLANK when ManagerCRUD is NULL = inherits role default)._ |
| Manager Can Update | True when the manager CRUD mentions “U”. | _Derived: ManagerCRUD contains 'U' (BLANK when ManagerCRUD is NULL = inherits role default)._ |
| Manager Can Delete | True when the manager CRUD mentions “D”. | _Derived: ManagerCRUD contains 'D' (BLANK when ManagerCRUD is NULL = inherits role default)._ |
| Representative Can Create | True when the representative CRUD mentions “C”. | _Derived: RepresentativeCRUD contains 'C' (BLANK when RepresentativeCRUD is NULL = inherits role default)._ |
| Representative Can Read | True when the representative CRUD mentions “R”. | _Derived: RepresentativeCRUD contains 'R' (BLANK when RepresentativeCRUD is NULL = inherits role default)._ |
| Representative Can Update | True when the representative CRUD mentions “U”. | _Derived: RepresentativeCRUD contains 'U' (BLANK when RepresentativeCRUD is NULL = inherits role default)._ |
| Representative Can Delete | True when the representative CRUD mentions “D”. | _Derived: RepresentativeCRUD contains 'D' (BLANK when RepresentativeCRUD is NULL = inherits role default)._ |
| External Llm Can Create | True when the external llm CRUD mentions “C”. | _Derived: External LLMCRUD contains 'C' (BLANK when External LLMCRUD is NULL = inherits role default)._ |
| External Llm Can Read | True when the external llm CRUD mentions “R”. | _Derived: External LLMCRUD contains 'R' (BLANK when External LLMCRUD is NULL = inherits role default)._ |
| External Llm Can Update | True when the external llm CRUD mentions “U”. | _Derived: External LLMCRUD contains 'U' (BLANK when External LLMCRUD is NULL = inherits role default)._ |
| External Llm Can Delete | True when the external llm CRUD mentions “D”. | _Derived: External LLMCRUD contains 'D' (BLANK when External LLMCRUD is NULL = inherits role default)._ |
| Admin is Redacted | True when an empty string. | _Per-table redaction override for Admin. NULL = inherit Roles.IsRedactedRole. TRUE/FALSE explicitly sets whether this role is redacted FOR THIS TABLE (drives the default field access on "<Field>Redacted"-paired fields)._ |
| Manager is Redacted | True when an empty string. | _Per-table redaction override for Manager. NULL = inherit Roles.IsRedactedRole. TRUE/FALSE explicitly sets whether this role is redacted FOR THIS TABLE (drives the default field access on "<Field>Redacted"-paired fields)._ |
| Representative is Redacted | True when an empty string. | _Per-table redaction override for Representative. NULL = inherit Roles.IsRedactedRole. TRUE/FALSE explicitly sets whether this role is redacted FOR THIS TABLE (drives the default field access on "<Field>Redacted"-paired fields)._ |
| External Llm is Redacted | True when an empty string. | _Per-table redaction override for External LLM. NULL = inherit Roles.IsRedactedRole. TRUE/FALSE explicitly sets whether this role is redacted FOR THIS TABLE (drives the default field access on "<Field>Redacted"-paired fields)._ |
| ERB Fields | A defined attribute. | _Reverse: fields belonging to this table._ |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **ERB Field** | An ERB field is identified by its name and is related to an ERB table. | — |
| Name | The same as its ERB field ID. | _Echoes ERBFieldId._ |
| ERB Table | A defined attribute. | _FK to ERBTables — the field's table._ |
| Table Package is Active | True when the linked ERB table is active. | _Lookup: ERBTable.PackageIsActive — is the package owning this field's table enabled? (field inherits its table's package)._ |
| Field Name | A defined attribute. | _Field name._ |
| Field Type | A defined attribute. | _raw / calculated / lookup / relationship / aggregation._ |
| Datatype | A defined attribute. | _Field datatype._ |
| Description | A defined attribute. | _Field description (refreshed additively by build)._ |
| Is Calculated | True when at least one of the following holds: the field type is “calculated”; the field type is “lookup”; or the field type is “aggregation”. | _TRUE for calculated/lookup/aggregation (read-only at the data layer)._ |
| Admin CRUD | A defined attribute. | _Admin CRUD grant for this field (contains C/R/U/D). NULL inherits ERBTables.AdminCRUD._ |
| Manager CRUD | A defined attribute. | _Manager CRUD grant for this field (contains C/R/U/D). NULL inherits ERBTables.ManagerCRUD._ |
| Representative CRUD | A defined attribute. | _Representative CRUD grant for this field (contains C/R/U/D). NULL inherits ERBTables.RepresentativeCRUD._ |
| External Llm CRUD | A defined attribute. | _External LLM CRUD grant for this field (contains C/R/U/D). NULL inherits ERBTables.External LLMCRUD._ |
| Admin Can Create | True when the admin CRUD mentions “C”. | _Derived: AdminCRUD contains 'C' (BLANK when NULL = inherits table/role)._ |
| Admin Can Read | True when the admin CRUD mentions “R”. | _Derived: AdminCRUD contains 'R' (BLANK when NULL = inherits table/role)._ |
| Admin Can Update | True when the admin CRUD mentions “U”. | _Derived: AdminCRUD contains 'U' (BLANK when NULL = inherits table/role)._ |
| Admin Can Delete | True when the admin CRUD mentions “D”. | _Derived: AdminCRUD contains 'D' (BLANK when NULL = inherits table/role)._ |
| Manager Can Create | True when the manager CRUD mentions “C”. | _Derived: ManagerCRUD contains 'C' (BLANK when NULL = inherits table/role)._ |
| Manager Can Read | True when the manager CRUD mentions “R”. | _Derived: ManagerCRUD contains 'R' (BLANK when NULL = inherits table/role)._ |
| Manager Can Update | True when the manager CRUD mentions “U”. | _Derived: ManagerCRUD contains 'U' (BLANK when NULL = inherits table/role)._ |
| Manager Can Delete | True when the manager CRUD mentions “D”. | _Derived: ManagerCRUD contains 'D' (BLANK when NULL = inherits table/role)._ |
| Representative Can Create | True when the representative CRUD mentions “C”. | _Derived: RepresentativeCRUD contains 'C' (BLANK when NULL = inherits table/role)._ |
| Representative Can Read | True when the representative CRUD mentions “R”. | _Derived: RepresentativeCRUD contains 'R' (BLANK when NULL = inherits table/role)._ |
| Representative Can Update | True when the representative CRUD mentions “U”. | _Derived: RepresentativeCRUD contains 'U' (BLANK when NULL = inherits table/role)._ |
| Representative Can Delete | True when the representative CRUD mentions “D”. | _Derived: RepresentativeCRUD contains 'D' (BLANK when NULL = inherits table/role)._ |
| External Llm Can Create | True when the external llm CRUD mentions “C”. | _Derived: External LLMCRUD contains 'C' (BLANK when NULL = inherits table/role)._ |
| External Llm Can Read | True when the external llm CRUD mentions “R”. | _Derived: External LLMCRUD contains 'R' (BLANK when NULL = inherits table/role)._ |
| External Llm Can Update | True when the external llm CRUD mentions “U”. | _Derived: External LLMCRUD contains 'U' (BLANK when NULL = inherits table/role)._ |
| External Llm Can Delete | True when the external llm CRUD mentions “D”. | _Derived: External LLMCRUD contains 'D' (BLANK when NULL = inherits table/role)._ |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **API Endpoint** | An API endpoint is identified by its name. | — |
| Name | The same as its API endpoint ID. | _Echoes APIEndpointId._ |
| Title | A defined attribute. | _Human-readable endpoint name._ |
| Description | A defined attribute. | _What the endpoint does._ |
| Http Method | A defined attribute. | _GET / POST / PUT / PATCH / DELETE._ |
| Path | A defined attribute. | _URL path, e.g. '/api/checklists/:id/run-analysis'._ |
| Endpoint Type | A defined attribute. | _ACTION / RPC / REPORT / WEBHOOK / BATCH — distinguishes from standard CRUD._ |
| Subject Table Name | A defined attribute. | _Primary table this endpoint acts on (raw string convention; may be blank for cross-table actions)._ |
| Role Visibility | A defined attribute. | _Comma-separated canonical roles allowed to call this endpoint (Admin / Manager / Representative / Operations)._ |
| Where Clause | A defined attribute. | _Optional row-access policy applied to the endpoint's subject, mirroring ERBTables.{Role}WHERE._ |
| Triggers State Machine | A defined attribute. | _StateMachineId this endpoint can advance, if any (convention string)._ |
| Status | A defined attribute. | _Lifecycle status (mirrors ERBFeatureStatuses keys). DESIGNED for not-yet-built._ |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **Subject State Instance** | A subject state instance is identified by its name and is related to a state machine; optionally another subject state instance (its prior instance); and optionally a state transition (its entered via transition). | — |
| Name | The same as its subject state instance ID. | _Echoes SubjectStateInstanceId._ |
| State Machine | A defined attribute. | _FK -> StateMachines.StateMachineId._ |
| Subject Table Name | A defined attribute. | _Polymorphic table name, e.g. Citations or Hearings._ |
| Subject ID | A defined attribute. | _Polymorphic PK of the subject row._ |
| State Key | A defined attribute. | _The machine state entered by this occupancy record._ |
| Entered At | A defined attribute. | _Timestamp when this state was entered._ |
| Exited At | A defined attribute. | _Timestamp when the subject left this state. NULL while current._ |
| Sequence Index | A defined attribute. | _1-based position on this subject's path through the machine._ |
| Prior Instance | A defined attribute. | _Self-FK -> SubjectStateInstances.SubjectStateInstanceId — the previous occupancy in this subject's chain. NULL for the initial state._ |
| Entered Via Transition | A defined attribute. | _FK -> StateTransitions.StateTransitionId — the edge event that created this occupancy._ |
| Is Current | True when the exited at is blank. | _TRUE when ExitedAt IS NULL — this is the subject's active state._ |
| Has Complete Lineage | True when the sequence index is at least 1. | _TRUE when the PriorInstance chain walks back to SequenceIndex=1 (the initial state occupancy). Validates lineage completeness._ |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **Violation Type** | A violation type is identified by its name and is related to a jurisdiction. | — |
| Name | Computed as the lower-cased code with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | _Kebab-cased PK derived from the violation code (e.g. 'CVC-22350' -> 'cvc-22350')._ |
| Is Mock Data | True when an empty string. | _TRUE for seed/demo rows; distinguishes mock data from real records._ |
| Code | A defined attribute. | _Statute/vehicle-code reference for the violation, e.g. 'CVC-22350'._ |
| Jurisdiction | A defined attribute. | _FK to the Jurisdiction whose rules govern this violation type._ |
| Jurisdiction Label | The display name of the violation type's jurisdiction. | _Display name of the governing jurisdiction._ |
| Description | A defined attribute. | _Plain-English description of the violation, e.g. 'Unsafe speed for conditions'._ |
| Base Fine USD | A defined attribute. | _Base fine amount in USD for this violation before any penalties or reductions._ |
| Points | A defined attribute. | _License points assessed for a conviction of this violation._ |
| Traffic School Point Cap | Taken from the linked jurisdiction. | _The governing jurisdiction's traffic-school point cap, looked up from Jurisdictions._ |
| Is School Eligible by Cap | True when the points is at most the traffic school point cap. | _Whether this violation's points fall at or below the jurisdiction's traffic-school point cap (jurisdiction rule applied to the violation)._ |
| Citations | A defined attribute. | _Reverse FK: citations issued for this violation type._ |
| Count of Citations | The number of citations related to the violation type. | _Number of citations issued for this violation type._ |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **Driver** | A driver is identified by its name and is related to a jurisdiction (its home jurisdiction). | — |
| Name | Computed as the lower-cased license number with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | _Kebab-cased PK derived from the license number (e.g. 'D1234567' -> 'd1234567')._ |
| Is Mock Data | True when an empty string. | _TRUE for seed/demo rows; distinguishes mock data from real records._ |
| License Number | A defined attribute. | _Driver's license number; the natural identifier for the driver._ |
| First Name | A defined attribute. | _Driver's first name._ |
| Last Name | A defined attribute. | _Driver's last name._ |
| Full Name | Computed as the last name, followed by a comma followed by a space, followed by the first name. | _Display name, last-comma-first._ |
| Home Jurisdiction | A defined attribute. | _FK to the Jurisdiction that issued the driver's license (governs point/suspension rules for the driver)._ |
| Home Jurisdiction Label | The display name of the driver's home jurisdiction. | _Display name of the driver's home jurisdiction._ |
| Suspension Threshold | The point suspension threshold of the driver's home jurisdiction. | _Point-suspension threshold pulled from the driver's home jurisdiction._ |
| Warning Threshold | The point warning threshold of the driver's home jurisdiction. | _Point-warning threshold pulled from the driver's home jurisdiction._ |
| Citations | A defined attribute. | _Reverse FK: citations issued to this driver._ |
| Count of Citations | The number of citations related to the driver. | _Number of citations issued to this driver._ |
| Active Points | The total effective points across the citations related to the driver. | _Sum of license points across this driver's citations that resulted in a conviction (guilty/unpaid-default) and are still point-active._ |
| License Status | Determined by priority: “Suspended” if the active points is at least the suspension threshold; “Warning” if the active points is at least the warning threshold; in all other cases, “Valid”. | _License-points state machine for the driver: Suspended at/above the suspension threshold, Warning at/above the warning threshold, otherwise Valid._ |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **Citation** | A citation is identified by its name and is related to a driver; a violation type; and a jurisdiction. | — |
| Name | Computed as the lower-cased citation number with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | _Kebab-cased PK derived from the citation number (e.g. 'TC-2026-0001' -> 'tc-2026-0001')._ |
| Is Mock Data | True when an empty string. | _TRUE for seed/demo rows; distinguishes mock data from real records._ |
| Citation Number | A defined attribute. | _Human citation/ticket number printed on the ticket._ |
| Driver | A defined attribute. | _FK to the cited Driver._ |
| Driver Label | The full name of the citation's driver. | _Display name of the cited driver._ |
| Violation Type | A defined attribute. | _FK to the cited ViolationType._ |
| Violation Label | The description of the citation's violation type. | _Description of the cited violation._ |
| Jurisdiction | A defined attribute. | _FK to the Jurisdiction in which the citation was issued (governs deadlines, penalties, points)._ |
| Jurisdiction Label | The display name of the citation's jurisdiction. | _Display name of the issuing jurisdiction._ |
| Base Fine USD | Taken from the linked violation type. | _Base fine for the cited violation, pulled from the ViolationType._ |
| Violation Points | Taken from the linked violation type. | _License points for the cited violation, pulled from the ViolationType._ |
| Issued on | A defined attribute. | _Date the citation was issued to the driver._ |
| As of Date | A defined attribute. | _The 'today' reference date used to evaluate deadlines for this citation (lets seed data exercise overdue/late states deterministically)._ |
| Responded on | A defined attribute. | _Date the driver responded (paid or requested a hearing). Null if no response yet._ |
| Contest Requested | True when an empty string. | _Whether the driver elected to contest the citation (request a hearing) rather than pay._ |
| Paid on | A defined attribute. | _Date the fine was paid in full. Null if not yet paid._ |
| Amount Paid USD | A defined attribute. | _Total amount the driver has paid against this citation. Null/0 if nothing paid._ |
| Days to Respond | Taken from the linked jurisdiction. | _Response window in days, pulled from the issuing jurisdiction._ |
| Days to Pay After Ruling | Taken from the linked jurisdiction. | _Days-to-pay window, pulled from the issuing jurisdiction._ |
| Late Penalty Pct | Taken from the linked jurisdiction. | _Late-penalty percentage, pulled from the issuing jurisdiction._ |
| Days Late to Collections | Taken from the linked jurisdiction. | _Days-late-to-collections window, pulled from the issuing jurisdiction._ |
| Response Due Date | Computed as the issued on plus the days to respond. | _Deadline to respond: IssuedOn + the jurisdiction's response window._ |
| Days Until Response Due | Computed as the number of days from the as of date to the response due date. | _Days remaining (negative if overdue) until the response deadline, measured from AsOfDate._ |
| Is Response Overdue | True when all of the following hold: the responded on is blank and the as of date is greater than the response due date. | _True when no response was filed and the response deadline has passed as of AsOfDate._ |
| Count of Hearings | The number of hearings related to the citation. | _Number of hearing records attached to this citation._ |
| Latest Hearing Outcome | The largest outcome across the hearings related to the citation. | _Outcome of the most recent hearing for this citation (Pending if a hearing exists but has no outcome; blank if no hearing)._ |
| Contest Status | Determined by priority: “NotContested” if the contest requested flag is not set; “HearingRequested” if the count of hearings is 0; “Scheduled” if at least one of the following holds: the latest hearing outcome is “Pending” or the latest hearing outcome is blank; in all other cases, “Heard”. | _Contest/Hearing state machine: NotContested when the driver did not elect to contest; otherwise HearingRequested -> Scheduled -> Heard, reflected from the latest hearing's outcome._ |
| Is Dismissed | True when the latest hearing outcome is “Dismissed”. | _True when the latest hearing outcome dismissed the citation._ |
| Is Guilty | True when at least one of the following holds: the latest hearing outcome is “Guilty”; the latest hearing outcome is “Upheld”; or all of the following hold: the response overdue flag is set and the contest requested flag is not set. | _True when the driver is liable: either found guilty/upheld at hearing, or defaulted by missing the response deadline without contesting._ |
| Amount Due USD | Determined by priority: 0 if the dismissed flag is set; the base fine USD times 1 plus the late penalty pct if the payment late flag is set; in all other cases, the base fine USD. | _Amount currently owed: 0 if dismissed; otherwise the base fine plus the jurisdiction's late penalty if the payment is late._ |
| Payment Due Date | Computed as the response due date interpreted as a date plus the days to pay after ruling. | _Date the fine is due: the later anchor (response deadline) plus the jurisdiction's days-to-pay window._ |
| Is Payment Late | True when all of the following hold: the guilty flag is set; the paid on is blank; and the as of date is greater than the payment due date. | _True when the driver is liable, has not paid in full, and the payment due date has passed as of AsOfDate._ |
| Is in Collections | True when all of the following hold: the payment late flag is set and the as of date is greater than the payment due date interpreted as a date plus the days late to collections. | _True when a late payment has remained unpaid past the jurisdiction's collections window._ |
| Payment Status | Determined by priority: “NotOwed” if the dismissed flag is set; “Paid” if the paid on has a value; “Collections” if the in collections flag is set; “Late” if the payment late flag is set; “Due” if the guilty flag is set; in all other cases, “Pending”. | _Payment/Penalty state machine: NotOwed (dismissed) -> Paid -> Collections -> Late -> Due. Evaluated in priority order._ |
| Effective Points | Determined by priority: the violation points if all of the following hold: the guilty flag is set and the dismissed flag is not set; in all other cases, 0. | _License points this citation actually contributes to the driver: the violation's points if the driver is liable and not dismissed, otherwise 0. Drives the driver's ActivePoints rollup._ |
| Citation Status | Determined by priority: “Closed” if at least one of the following holds: the paid on has a value or the dismissed flag is set; “Adjudicated” if at least one of the following holds: the latest hearing outcome is “Guilty”; the latest hearing outcome is “Upheld”; or all of the following hold: the response overdue flag is set and the contest requested flag is not set; “InContest” if all of the following hold: the contest requested flag is set and the count of hearings is greater than 0; “Responded” if the responded on has a value; in all other cases, “Issued”. | _Citation lifecycle state machine: Issued -> Responded -> InContest -> Adjudicated -> Closed. The top-level status synthesizing the other tracks._ |
| Hearings | A defined attribute. | _Reverse FK: hearing records for this citation._ |
| Payments | A defined attribute. | _Reverse FK: payment records for this citation._ |
| Case Events | A defined attribute. | _Reverse FK: append-only case-event log entries for this citation._ |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **Hearing** | A hearing is identified by its name and is related to a citation. | — |
| Name | Computed as the lower-cased hearing number with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | _Kebab-cased PK derived from the hearing reference number._ |
| Is Mock Data | True when an empty string. | _TRUE for seed/demo rows; distinguishes mock data from real records._ |
| Hearing Number | A defined attribute. | _Human hearing reference number._ |
| Citation | A defined attribute. | _FK to the Citation being contested at this hearing._ |
| Citation Label | The citation number of the hearing's citation. | _Citation number this hearing concerns._ |
| Requested on | A defined attribute. | _Date the hearing was requested by the driver._ |
| Scheduled for | A defined attribute. | _Date the hearing is scheduled for. Null if requested but not yet scheduled._ |
| Outcome | A defined attribute. | _Outcome of the hearing: 'Pending' (scheduled, not yet heard), 'Dismissed', 'Guilty', 'Upheld', or 'Reduced'. Null if not yet scheduled._ |
| Notes | A defined attribute. | _Free-text notes from the hearing._ |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **Payment** | A payment is identified by its name and is related to a citation. | — |
| Name | Computed as the lower-cased payment number with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | _Kebab-cased PK derived from the payment reference number._ |
| Is Mock Data | True when an empty string. | _TRUE for seed/demo rows; distinguishes mock data from real records._ |
| Payment Number | A defined attribute. | _Human payment reference number._ |
| Citation | A defined attribute. | _FK to the Citation this payment is applied to._ |
| Citation Label | The citation number of the payment's citation. | _Citation number this payment concerns._ |
| Paid on | A defined attribute. | _Date the payment was made._ |
| Amount USD | A defined attribute. | _Amount of the payment in USD._ |
| Method | A defined attribute. | _Payment method, e.g. 'card', 'check', 'cash', 'online'._ |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **Case Event** | A case event is identified by its name and is related to a citation. | — |
| Name | Computed as the lower-cased event number with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> | _Kebab-cased PK derived from the event reference number._ |
| Is Mock Data | True when an empty string. | _TRUE for seed/demo rows; distinguishes mock data from real records._ |
| Event Number | A defined attribute. | _Human event reference number (sortable, e.g. 'EV-2026-0001')._ |
| Citation | A defined attribute. | _FK to the Citation this event belongs to._ |
| Citation Label | The citation number of the case event's citation. | _Citation number this event concerns._ |
| Occurred on | A defined attribute. | _Date the event occurred._ |
| Track | A defined attribute. | _Which state machine this transition belongs to: 'Citation', 'Contest', 'Payment', or 'License'._ |
| From State | A defined attribute. | _Prior state on the track (null for the initial event)._ |
| To State | A defined attribute. | _New state on the track after this transition._ |
| Note | A defined attribute. | _Free-text note describing the transition._ |
| Created At | A defined attribute. | _Audit: when this row was first inserted. Auto-stamped by the audit trigger (now() on INSERT); immutable thereafter._ |
| Created by | A defined attribute. | _Audit: the OWNER — the JWT user (auth.email()) who created this row. Auto-stamped on INSERT; immutable thereafter. NULL for build-time seed rows (no signed-in user)._ |
| Modified At | A defined attribute. | _Audit: when this row was last written. Auto-stamped by the audit trigger (now() on every INSERT/UPDATE)._ |
| Modified by | A defined attribute. | _Audit: the JWT user (auth.email()) who last wrote this row. Auto-stamped on every INSERT/UPDATE._ |
| Modified by Model | A defined attribute. | _Audit: the AI model credited on the last save when an LLM made/assisted the change (e.g. "gpt-4o"). NULL for plain human writes. Read from the app.modified_by_model session GUC by the audit trigger. The owner (CreatedBy/ModifiedBy) is always the human JWT user, never a model._ |
| **Test Category** | A test category is identified by its name. | — |
| Name | The same as its test category ID. | _Echoes TestCategoryId._ |
| Title | A defined attribute. | _Human-readable category title._ |
| Description | A defined attribute. | _What this category groups._ |
| Order Index | A defined attribute. | _Display order._ |
| Created At | A defined attribute. | _Audit: created timestamp._ |
| Created by | A defined attribute. | _Audit: created by._ |
| Modified At | A defined attribute. | _Audit: modified timestamp._ |
| Modified by | A defined attribute. | _Audit: modified by._ |
| **Test Surface** | A test surface is identified by its name. | — |
| Name | The same as its test surface ID. | _Echoes TestSurfaceId._ |
| Title | A defined attribute. | _Surface title._ |
| Description | A defined attribute. | _What this surface tests._ |
| Layer | A defined attribute. | _Layer: db \| view \| api \| ui \| rules._ |
| Order Index | A defined attribute. | _Display order._ |
| Created At | A defined attribute. | _Audit: created timestamp._ |
| Created by | A defined attribute. | _Audit: created by._ |
| Modified At | A defined attribute. | _Audit: modified timestamp._ |
| Modified by | A defined attribute. | _Audit: modified by._ |
| **Test Technology** | A test technology is identified by its name. | — |
| Name | The same as its test technology ID. | _Echoes TestTechnologyId._ |
| Title | A defined attribute. | _Technology title._ |
| Description | A defined attribute. | _What runner/tooling this is._ |
| Runner Kind | A defined attribute. | _Runner: sql \| vitest \| playwright \| manual._ |
| Is Implemented | True when an empty string. | _Whether a runner exists yet._ |
| Created At | A defined attribute. | _Audit: created timestamp._ |
| Created by | A defined attribute. | _Audit: created by._ |
| Modified At | A defined attribute. | _Audit: modified timestamp._ |
| Modified by | A defined attribute. | _Audit: modified by._ |
| **Test Case** | A test case is identified by its name. | — |
| Name | The same as its test case ID. | _Echoes TestCaseId._ |
| Title | A defined attribute. | _Test case title._ |
| Description | A defined attribute. | _Given/when/then summary._ |
| Test Category | A defined attribute. | _FK -> TestCategory._ |
| Test Surface | A defined attribute. | _FK -> TestSurface._ |
| Test Technology | A defined attribute. | _FK -> TestTechnology._ |
| Target Feature | A defined attribute. | _ERBFeatures id this case verifies (if any)._ |
| Target Endpoint | A defined attribute. | _APIEndpoints id this case exercises (if any)._ |
| Target Table | A defined attribute. | _Table/view this case reads (if any)._ |
| Target Transition | A defined attribute. | _StateTransitionRules id this case exercises (if any)._ |
| Business Rule Refs | A defined attribute. | _CSV of BusinessRule codes this case proves._ |
| Severity | A defined attribute. | _critical \| high \| medium \| low._ |
| Is Enabled | True when an empty string. | _Whether the case is active._ |
| Order Index | A defined attribute. | _Display order._ |
| Expectation Count | The number of the test case's expectations. | _Count of child TestExpectations._ |
| Created At | A defined attribute. | _Audit: created timestamp._ |
| Created by | A defined attribute. | _Audit: created by._ |
| Modified At | A defined attribute. | _Audit: modified timestamp._ |
| Modified by | A defined attribute. | _Audit: modified by._ |
| **Test Expectation** | A test expectation is identified by its name. | — |
| Name | The same as its test expectation ID. | _Echoes TestExpectationId._ |
| Test Case | A defined attribute. | _FK -> TestCase._ |
| Kind | A defined attribute. | _status \| view-value \| state \| permission \| http._ |
| Selector | A defined attribute. | _What is being checked (column, path, field)._ |
| Operator | A defined attribute. | _equals \| contains \| gte \| lte \| is-null \| not-null._ |
| Expected Value | A defined attribute. | _The expected value/outcome._ |
| Order Index | A defined attribute. | _Display order._ |
| Created At | A defined attribute. | _Audit: created timestamp._ |
| Created by | A defined attribute. | _Audit: created by._ |
| Modified At | A defined attribute. | _Audit: modified timestamp._ |
| Modified by | A defined attribute. | _Audit: modified by._ |
| **Test Run** | A test run is identified by its name. | — |
| Name | The same as its test run ID. | _Echoes TestRunId._ |
| Suite Selector | A defined attribute. | _Which suite/filter ran._ |
| Triggered by Role | A defined attribute. | _Role that triggered the run._ |
| Started At | A defined attribute. | _Run start._ |
| Finished At | A defined attribute. | _Run finish._ |
| Status | A defined attribute. | _running \| passed \| failed \| errored._ |
| Created At | A defined attribute. | _Audit: created timestamp._ |
| Created by | A defined attribute. | _Audit: created by._ |
| Modified At | A defined attribute. | _Audit: modified timestamp._ |
| Modified by | A defined attribute. | _Audit: modified by._ |
| **Test Result** | A test result is identified by its name. | — |
| Name | The same as its test result ID. | _Echoes TestResultId._ |
| Test Run | A defined attribute. | _FK -> TestRun._ |
| Test Case | A defined attribute. | _FK -> TestCase._ |
| Status | A defined attribute. | _passed \| failed \| not-implemented \| errored \| skipped._ |
| Message | A defined attribute. | _Result summary._ |
| Actual Value | A defined attribute. | _Observed value._ |
| Created At | A defined attribute. | _Audit: created timestamp._ |
| Created by | A defined attribute. | _Audit: created by._ |
| Modified At | A defined attribute. | _Audit: modified timestamp._ |
| Modified by | A defined attribute. | _Audit: modified by._ |
| **Test Result Assertion** | A test result assertion is identified by its name. | — |
| Name | The same as its test result assertion ID. | _Echoes TestResultAssertionId._ |
| Test Result | A defined attribute. | _FK -> TestResult._ |
| Expectation Kind | A defined attribute. | _Mirrors TestExpectation.Kind._ |
| Selector | A defined attribute. | _What was checked._ |
| Expected Value | A defined attribute. | _Expected._ |
| Actual Value | A defined attribute. | _Actual._ |
| Passed | True when an empty string. | _Whether this assertion passed._ |
| Created At | A defined attribute. | _Audit: created timestamp._ |
| Created by | A defined attribute. | _Audit: created by._ |
| Modified At | A defined attribute. | _Audit: modified timestamp._ |
| Modified by | A defined attribute. | _Audit: modified by._ |
| **Screen Layout** | A screen layout is identified by its name and is related to optionally a platform naviation (its nav). | — |
| Name | The same as its screen layout ID. | _Echoes ScreenLayoutId._ |
| Nav | A defined attribute. | _FK -> PlatformNaviation (by nav PK)._ |
| Title | A defined attribute. | _Screen title._ |
| Layout Kind | A defined attribute. | _list \| detail \| split \| dashboard \| wizard \| form._ |
| Primary Table | A defined attribute. | _The table/view this screen is built on._ |
| Primary View | A defined attribute. | _The vw_* the screen reads._ |
| Role Visibility | A defined attribute. | _CSV of roles that can see this screen._ |
| Empty State Text | A defined attribute. | _Message shown when there are no rows._ |
| Order Index | A defined attribute. | _Display order._ |
| Created At | A defined attribute. | _Audit: created timestamp._ |
| Created by | A defined attribute. | _Audit: created by._ |
| Modified At | A defined attribute. | _Audit: modified timestamp._ |
| Modified by | A defined attribute. | _Audit: modified by._ |
| **Screen Section** | A screen section is identified by its name and is related to optionally a screen layout. | — |
| Name | The same as its screen section ID. | _Echoes ScreenSectionId._ |
| Screen Layout | A defined attribute. | _FK -> ScreenLayouts._ |
| Title | A defined attribute. | _Section heading._ |
| Section Kind | A defined attribute. | _summary \| fields \| related \| actions \| timeline \| chart._ |
| Related Table | A defined attribute. | _For related sections: the child table shown._ |
| Order Index | A defined attribute. | _Order within the screen._ |
| Created At | A defined attribute. | _Audit: created timestamp._ |
| Created by | A defined attribute. | _Audit: created by._ |
| Modified At | A defined attribute. | _Audit: modified timestamp._ |
| Modified by | A defined attribute. | _Audit: modified by._ |
| **Field Display Hint** | A field display hint is identified by its name and is related to optionally an ERB table. | — |
| Name | The same as its field display hint ID. | _Echoes FieldDisplayHintId._ |
| ERB Table | A defined attribute. | _FK -> ERBTables._ |
| Field Name | A defined attribute. | _The field this hint styles._ |
| Label | A defined attribute. | _Human label for the field._ |
| Widget | A defined attribute. | _text \| number \| select \| date \| currency \| badge \| toggle \| textarea \| fk-link._ |
| Format | A defined attribute. | _Optional format (e.g. USD, YYYY-MM-DD, points)._ |
| Column Order | A defined attribute. | _Order in list/grid views._ |
| Is Sortable | True when an empty string. | _Sortable in list views._ |
| Is Filterable | True when an empty string. | _Filterable in list views._ |
| Is Searchable | True when an empty string. | _Included in free-text search._ |
| Show in List | True when an empty string. | _Visible in the list/grid view._ |
| Show in Detail | True when an empty string. | _Visible in the detail view._ |
| Redact for External Llm | True when an empty string. | _Masked for the external-llm role (PII)._ |
| Created At | A defined attribute. | _Audit: created timestamp._ |
| Created by | A defined attribute. | _Audit: created by._ |
| Modified At | A defined attribute. | _Audit: modified timestamp._ |
| Modified by | A defined attribute. | _Audit: modified by._ |
| **Fee Schedule** | A fee schedule is identified by its name and is related to optionally a jurisdiction and optionally a violation type. | — |
| Name | The same as its fee schedule ID. | _Echoes FeeScheduleId._ |
| Jurisdiction | A defined attribute. | _FK -> Jurisdictions._ |
| Violation Type | A defined attribute. | _FK -> ViolationTypes._ |
| Base Fine USD | A defined attribute. | _Base fine before surcharges._ |
| Surcharge Pct | A defined attribute. | _Jurisdiction surcharge percentage._ |
| Effective on | A defined attribute. | _Date this schedule took effect._ |
| Created At | A defined attribute. | _Audit._ |
| Created by | A defined attribute. | _Audit._ |
| Modified At | A defined attribute. | _Audit._ |
| Modified by | A defined attribute. | _Audit._ |
| **Deadline Rule** | A deadline rule is identified by its name and is related to optionally a jurisdiction. | — |
| Name | The same as its deadline rule ID. | _Echoes DeadlineRuleId._ |
| Jurisdiction | A defined attribute. | _FK -> Jurisdictions._ |
| Kind | A defined attribute. | _contest \| payment \| appeal._ |
| Window Days | A defined attribute. | _Days from issuance to the deadline._ |
| Late Penalty USD | A defined attribute. | _Flat penalty when missed._ |
| Description | A defined attribute. | _Plain-language rule._ |
| Created At | A defined attribute. | _Audit._ |
| Created by | A defined attribute. | _Audit._ |
| Modified At | A defined attribute. | _Audit._ |
| Modified by | A defined attribute. | _Audit._ |
| **Contest Ground** | A contest ground is identified by its name and is related to optionally a violation type. | — |
| Name | The same as its contest ground ID. | _Echoes ContestGroundId._ |
| Violation Type | A defined attribute. | _FK -> ViolationTypes._ |
| Title | A defined attribute. | _Short name of the legal ground._ |
| Description | A defined attribute. | _When this ground applies._ |
| Evidence Hint | A defined attribute. | _Evidence that supports this ground._ |
| Order Index | A defined attribute. | _Display order._ |
| Created At | A defined attribute. | _Audit._ |
| Created by | A defined attribute. | _Audit._ |
| Modified At | A defined attribute. | _Audit._ |
| Modified by | A defined attribute. | _Audit._ |
| **Driver License Point** | A driver license point is identified by its name and is related to optionally a driver and optionally a citation. | — |
| Name | The same as its driver license point ID. | _Echoes DriverLicensePointId._ |
| Driver | A defined attribute. | _FK -> Drivers._ |
| Citation | A defined attribute. | _FK -> Citations._ |
| Points | A defined attribute. | _Points assessed for this citation._ |
| Assessed on | A defined attribute. | _Date assessed._ |
| Reversed on | A defined attribute. | _Date reversed (if dismissed)._ |
| Is Active | True when an empty string. | _Whether the points currently count._ |
| Created At | A defined attribute. | _Audit._ |
| Created by | A defined attribute. | _Audit._ |
| Modified At | A defined attribute. | _Audit._ |
| Modified by | A defined attribute. | _Audit._ |
| **Build Phas** | A build phas is identified by its name. | — |
| Name | The same as its build phase ID. | _Echoes BuildPhaseId._ |
| Phase Number | A defined attribute. | _Integer that matches PlatformNaviation.BuildPhase._ |
| Title | A defined attribute. | _Phase name._ |
| Description | A defined attribute. | _What is built in this phase._ |
| Created At | A defined attribute. | _Audit._ |
| Created by | A defined attribute. | _Audit._ |
| Modified At | A defined attribute. | _Audit._ |
| Modified by | A defined attribute. | _Audit._ |

## 2 Fact Types

- a **business rule** may reference one **business rule category**
- a **glossary term** may reference one **glossary category**
- an **audit log entry** may reference one **citation**
- an **audit log entry** may reference one **app user**
- a **platform naviation** may reference one **ERB package**
- a **jurisdiction** may reference one **jurisdiction**
- a **jurisdiction** may reference one **jurisdiction source document**
- a **jurisdiction source document** may reference one **jurisdiction**
- a **jurisdiction rule** may reference one **platform naviation**
- a **jurisdiction rule** may reference one **jurisdiction source document**
- a **jurisdiction rule** may reference one **jurisdiction**
- an **app user** may reference one **role**
- a **reference document** may reference one **jurisdiction**
- a **state machine** may reference one **ERB package**
- a **machine state** references exactly one **state machine**
- a **machine state** may reference one **state transition rule**
- a **state transition rule** references exactly one **state machine**
- a **state transition rule** references exactly one **machine state**
- a **state transition** references exactly one **state machine**
- a **state transition** may reference one **app user**
- a **work queue item** may reference one **app user**
- a **model pricing version** references exactly one **ai model**
- an **assistant turn** may reference one **citation**
- an **assistant turn** references exactly one **ai model**
- an **assistant turn** references exactly one **model pricing version**
- an **ERB feature** may reference one **platform naviation**
- an **ERB feature** references exactly one **ERB package**
- an **ERB feature** may reference one **ERB feature category**
- an **ERB feature** may reference one **ERB feature status**
- an **ERB table** references exactly one **ERB package**
- an **ERB table** references exactly one **platform**
- an **ERB field** references exactly one **ERB table**
- a **subject state instance** references exactly one **state machine**
- a **subject state instance** may reference one **subject state instance**
- a **subject state instance** may reference one **state transition**
- a **violation type** references exactly one **jurisdiction**
- a **driver** references exactly one **jurisdiction**
- a **citation** references exactly one **driver**
- a **citation** references exactly one **violation type**
- a **citation** references exactly one **jurisdiction**
- a **hearing** references exactly one **citation**
- a **payment** references exactly one **citation**
- a **case event** references exactly one **citation**
- a **screen layout** may reference one **platform naviation**
- a **screen section** may reference one **screen layout**
- a **field display hint** may reference one **ERB table**
- a **fee schedule** may reference one **jurisdiction**
- a **fee schedule** may reference one **violation type**
- a **deadline rule** may reference one **jurisdiction**
- a **contest ground** may reference one **violation type**
- a **driver license point** may reference one **driver**
- a **driver license point** may reference one **citation**

## 3 Operative Rules

_Operative rules state what the business **obliges**, **prohibits**, or
advises (**should**). Structural rules come from required fields and foreign keys;
semantic rules come from the Constraints table, each keyed on a boolean the rulebook
already computes (cross-referenced as DR-N in the Definitional Rules below)._

### Structural Constraints (from the schema)

- A platform naviation **must** record whether it is licensed.
- A jurisdiction **must** have a code, a display name, a days to respond, a days to pay after ruling, a late penalty pct, a days late to collections, a point suspension threshold, a point warning threshold, and a traffic school point cap.
- An app user **must** record whether it is an effortless employee.
- A reference document **must** have a library.
- A state machine **must** have a subject table name and a subject state column.
- A machine state **must** reference exactly one state machine.
- A machine state **must** have a state key.
- A state transition rule **must** reference exactly one state machine.
- A state transition rule **must** reference exactly one machine state as its from state.
- A state transition rule **must** reference exactly one machine state as its to state.
- A state transition **must** reference exactly one state machine.
- A state transition **must** have a subject table name, a subject ID, and a to state key.
- A work queue item **must** have a subject table name, a subject ID, an item type, and a current state key.
- An ai model **must** record whether it is active.
- A model pricing version **must** reference exactly one ai model.
- A model pricing version **must** record whether it is active.
- An assistant turn **must** reference exactly one ai model.
- An assistant turn **must** reference exactly one model pricing version.
- A platform **must** record whether it is active.
- An ERB package **must** record whether it is active, whether it is licensed, and whether it is a key.
- An ERB feature **must** reference exactly one ERB package.
- An ERB feature **must** record whether it is licensed and whether it is a key.
- An ERB table **must** reference exactly one ERB package.
- An ERB table **must** reference exactly one platform.
- An ERB table **must** have a table name, and record whether it is licensed.
- An ERB field **must** reference exactly one ERB table.
- An ERB field **must** have a field name.
- An API endpoint **must** have a path.
- A subject state instance **must** reference exactly one state machine.
- A subject state instance **must** have a subject table name, a subject ID, a state key, and a sequence index.
- A violation type **must** reference exactly one jurisdiction.
- A violation type **must** have a code, a description, a base fine USD, and a points.
- A driver **must** reference exactly one jurisdiction as its home jurisdiction.
- A driver **must** have a license number, a first name, and a last name.
- A citation **must** reference exactly one driver.
- A citation **must** reference exactly one violation type.
- A citation **must** reference exactly one jurisdiction.
- A citation **must** have a citation number, an issued on, and an as of date, and record whether it is contest requested.
- A hearing **must** reference exactly one citation.
- A hearing **must** have a hearing number and a requested on.
- A payment **must** reference exactly one citation.
- A payment **must** have a payment number, a paid on, an amount USD, and a method.
- A case event **must** reference exactly one citation.
- A case event **must** have an event number, an occurred on, a track, and a to state.

## 4 Definitional Rules

_All statements express truth in the business domain; they are neither
procedures nor imperatives. "iff" is avoided in favor of "only if" so a
one-directional necessity is not mistaken for an equivalence. A
**⚠︎ mechanical** chip marks a rule whose deterministic wording is faithful
but clunky — a flag for an optional downstream reword pass, not a defect._

| ID | Declarative rule |
|----|------------------|
| **DR-1 Name** | A business rule's name is computed as the lower-cased rule code with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-2 Name** | A business rule category's name is the same as its business rule category ID. |
| **DR-3 Rule Count** | A business rule category's rule count is the number of the business rule category's rules. |
| **DR-4 Name** | A glossary category's name is the same as its glossary category ID. |
| **DR-5 Term Count** | A glossary category's term count is the number of the glossary category's terms. |
| **DR-6 Name** | A glossary term's name is computed as the lower-cased term with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-7 Name** | A role's name is the same as its role ID. |
| **DR-8 App User Count** | A role's app user count is the number of the role's app users. |
| **DR-9 Name** | An audit log entry's name is computed as the lower-cased “audit-”, followed by the citation, followed by a hyphen, followed by the timestamp formatted as “YYYY-MM-DDTHH-mm-ss”, followed by a hyphen, followed by the action type with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-10 Is Override Action** | An audit log entry is considered an override action if the action type, followed by an empty string is “override”. |
| **DR-11 Entry Age Hours** | An audit log entry's entry age hours is computed as the number of hours from the timestamp to the current date and time. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-12 Name** | A platform naviation's name is computed as the lower-cased display name with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-13 Package is Active** | A platform naviation's package is active when the linked ERB package is active. |
| **DR-14 Package is Licensed** | A platform naviation's package is licensed when the linked ERB package is licensed. |
| **DR-15 Admin Can Create** | A platform naviation is flagged admin can create if the admin CRUD mentions “C”. |
| **DR-16 Admin Can Read** | A platform naviation is flagged admin can read if the admin CRUD mentions “R”. |
| **DR-17 Admin Can Update** | A platform naviation is flagged admin can update if the admin CRUD mentions “U”. |
| **DR-18 Admin Can Delete** | A platform naviation is flagged admin can delete if the admin CRUD mentions “D”. |
| **DR-19 Manager Can Create** | A platform naviation is flagged manager can create if the manager CRUD mentions “C”. |
| **DR-20 Manager Can Read** | A platform naviation is flagged manager can read if the manager CRUD mentions “R”. |
| **DR-21 Manager Can Update** | A platform naviation is flagged manager can update if the manager CRUD mentions “U”. |
| **DR-22 Manager Can Delete** | A platform naviation is flagged manager can delete if the manager CRUD mentions “D”. |
| **DR-23 Representative Can Create** | A platform naviation is flagged representative can create if the representative CRUD mentions “C”. |
| **DR-24 Representative Can Read** | A platform naviation is flagged representative can read if the representative CRUD mentions “R”. |
| **DR-25 Representative Can Update** | A platform naviation is flagged representative can update if the representative CRUD mentions “U”. |
| **DR-26 Representative Can Delete** | A platform naviation is flagged representative can delete if the representative CRUD mentions “D”. |
| **DR-27 External Llm Can Create** | A platform naviation is flagged external llm can create if the external llm CRUD mentions “C”. |
| **DR-28 External Llm Can Read** | A platform naviation is flagged external llm can read if the external llm CRUD mentions “R”. |
| **DR-29 External Llm Can Update** | A platform naviation is flagged external llm can update if the external llm CRUD mentions “U”. |
| **DR-30 External Llm Can Delete** | A platform naviation is flagged external llm can delete if the external llm CRUD mentions “D”. |
| **DR-31 Depth** | The platform naviation's depth is determined by the following priority:<br>1. 0, if the parent route key is blank;<br>2. in all other cases, the length of the route key minus the length of the route key with every a period replaced by an empty string. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-32 Full Path** | A platform naviation's full path is the same as its route. |
| **DR-33 Handler Base Name** | A platform naviation's handler base name is computed as the route key with every a period replaced by a space with every a hyphen replaced by a space. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-34 Name** | A jurisdiction's name is computed as the lower-cased state, followed by “-us”. |
| **DR-35 Parent Jurisdiction Name** | A jurisdiction's parent jurisdiction name — taken from the linked parent jurisdiction. |
| **DR-36 Is Root Jurisdiction** | A jurisdiction is considered a root jurisdiction if the parent jurisdiction is blank. |
| **DR-37 Child Jurisdiction Count** | A jurisdiction's child jurisdiction count is the number of jurisdictions related to the jurisdiction. |
| **DR-38 Relative Path** | A jurisdiction's relative path is computed as “/library/jurisdictions/”, followed by the jurisdiction ID. |
| **DR-39 Rule Count** | A jurisdiction's rule count is the number of jurisdiction rules related to the jurisdiction. |
| **DR-40 Source Document Count** | A jurisdiction's source document count is the number of jurisdiction source documents related to the jurisdiction. |
| **DR-41 Name** | A jurisdiction source document's name is computed as the lower-cased title with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-42 Jurisdiction Name** | A jurisdiction source document's jurisdiction name — taken from the linked jurisdiction. |
| **DR-43 Relative Path** | A jurisdiction source document's relative path is computed as “/library/jurisdiction-docs/”, followed by the jurisdiction source document ID. |
| **DR-44 Rule Count** | A jurisdiction source document's rule count is the number of jurisdiction rules related to the jurisdiction source document. |
| **DR-45 Name** | A jurisdiction rule's name is computed as the lower-cased rule number with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-46 Route Path** | A jurisdiction rule's route path — taken from the linked route. |
| **DR-47 Relative Path** | A jurisdiction rule's relative path is computed as “/library/jurisdiction-rules/”, followed by the jurisdiction rule ID. |
| **DR-48 Jurisdiction Name** | A jurisdiction rule's jurisdiction name — taken from the linked jurisdiction. |
| **DR-49 Jurisdiction Type** | A jurisdiction rule's jurisdiction type — taken from the linked jurisdiction. |
| **DR-50 Is Federal** | A jurisdiction rule is considered a federal if the jurisdiction type is “Country”. |
| **DR-51 Name Redacted** | An app user's name redacted is the same as its name. |
| **DR-52 Email Address Redacted** | An app user's email address redacted is the same as its email address. |
| **DR-53 Role Title** | An app user's role title — taken from the linked role. |
| **DR-54 Role Description** | An app user's role description — taken from the linked role. |
| **DR-55 Name** | A site branding's name is the same as its site branding ID. |
| **DR-56 Name** | A reference document's name is the same as its reference document ID. |
| **DR-57 Is Appeal Board Decision** | A reference document is considered an appeal board decision if the library is “appeal-board-decisions”. |
| **DR-58 Name** | A state machine's name is the same as its state machine ID. |
| **DR-59 Package is Active** | A state machine's package is active when the linked ERB package is active. |
| **DR-60 State Count** | A state machine's state count is the number of the state machine's states. |
| **DR-61 Transition Rule Count** | A state machine's transition rule count is the number of the state machine's transition rules. |
| **DR-62 Name** | A machine state's name is the same as its machine state ID. |
| **DR-63 Name** | A state transition rule's name is the same as its state transition rule ID. |
| **DR-64 From State Key** | A state transition rule's from state key — taken from the linked from state. |
| **DR-65 To State Key** | A state transition rule's to state key — taken from the linked to state. |
| **DR-66 Is Forward Edge** | A state transition rule is considered a forward edge if it is not the case that the to state key is “draft”. |
| **DR-67 Name** | A state transition's name is the same as its state transition ID. |
| **DR-68 Is Forward** | A state transition is considered a forward if all of the following hold: it is not the case that the to state key is “draft”; it is not the case that the to state key is “new”; it is not the case that the to state key is “pending”; it is not the case that the to state key is “open”; and it is not the case that the to state key is “issued”. |
| **DR-69 Name** | A work queue item's name is the same as its work queue item ID. |
| **DR-70 Due in Days** | A work queue item's due in days is computed as the number of days from today's date to the due date. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-71 Is Overdue** | A work queue item is considered an overdue if the due in days is less than 0. |
| **DR-72 Urgency Bucket** | The work queue item's urgency bucket is determined by the following priority:<br>1. “follow-up”, if the due in days is blank;<br>2. “urgent”, if the due in days is at most 0;<br>3. “due-3-days”, if the due in days is at most 3;<br>4. in all other cases, “upcoming”. |
| **DR-73 Is Urgent** | A work queue item is considered an urgent if the urgency bucket is “urgent”. |
| **DR-74 Name** | An ai model's name is the same as its ai model ID. |
| **DR-75 Pricing Version Count** | An ai model's pricing version count is the number of model pricing versions related to the ai model. |
| **DR-76 Turn Count** | An ai model's turn count is the number of assistant turns related to the ai model. |
| **DR-77 Total Cost** | An ai model's total cost is the total total cost across the assistant turns related to the ai model. |
| **DR-78 Name** | A model pricing version's name is the same as its model pricing version ID. |
| **DR-79 Ai Model Title** | A model pricing version's ai model title — taken from the linked ai model. |
| **DR-80 Turn Count** | A model pricing version's turn count is the number of assistant turns related to the model pricing version. |
| **DR-81 Name** | An assistant turn's name is the same as its assistant turn ID. |
| **DR-82 Total Tokens** | An assistant turn's total tokens is computed as the input tokens plus the output tokens. |
| **DR-83 Billable Input Tokens** | An assistant turn's billable input tokens is computed as the input tokens minus the cached input tokens. |
| **DR-84 Ai Model Title** | An assistant turn's ai model title — taken from the linked ai model. |
| **DR-85 Input Price Per M Tok** | An assistant turn's input price per m tok — taken from the linked model pricing version. |
| **DR-86 Cached Input Price Per M Tok** | An assistant turn's cached input price per m tok — taken from the linked model pricing version. |
| **DR-87 Output Price Per M Tok** | An assistant turn's output price per m tok — taken from the linked model pricing version. |
| **DR-88 Input Cost** | An assistant turn's input cost is computed as the billable input tokens times the input price per m tok plus the cached input tokens times the cached input price per m tok divided by 1000000. |
| **DR-89 Output Cost** | An assistant turn's output cost is computed as the output tokens times the output price per m tok divided by 1000000. |
| **DR-90 Total Cost** | An assistant turn's total cost is computed as the input cost plus the output cost. |
| **DR-91 Name** | A platform's name is the same as its platform ID. |
| **DR-92 Name** | An ERB package's name is the same as its ERB package ID. |
| **DR-93 Feature Count** | An ERB package's feature count is computed as the count of the ERB features. |
| **DR-94 Shipped Feature Count** | An ERB package's shipped feature count is the number of the ERB package's ERB features that have a status of “shipped”. |
| **DR-95 Name** | An ERB feature status's name is the same as its ERB feature status ID. |
| **DR-96 Feature Count** | An ERB feature status's feature count is the number of the ERB feature status's features. |
| **DR-97 Name** | An ERB feature category's name is the same as its ERB feature category ID. |
| **DR-98 Feature Count** | An ERB feature category's feature count is the number of the ERB feature category's features. |
| **DR-99 Name** | An ERB feature's name is the same as its ERB feature ID. |
| **DR-100 Route Path** | An ERB feature's route path — taken from the linked route. |
| **DR-101 Relative Path** | An ERB feature's relative path is computed as the route path with every “:featureId” replaced by the ERB feature ID. |
| **DR-102 Package is Licensed** | An ERB feature's package is licensed when the linked ERB package is licensed. |
| **DR-103 Category Title** | An ERB feature's category title — taken from the linked category. |
| **DR-104 Status Title** | An ERB feature's status title — taken from the linked status. |
| **DR-105 Status Description** | An ERB feature's status description — taken from the linked status. |
| **DR-106 Status is Active** | An ERB feature's status is active when the linked status is active. |
| **DR-107 Name** | An ERB table's name is the same as its ERB table ID. |
| **DR-108 Package is Active** | An ERB table's package is active when the linked ERB package is active. |
| **DR-109 Package is Licensed** | An ERB table's package is licensed when the linked ERB package is licensed. |
| **DR-110 Admin Can Create** | An ERB table is flagged admin can create if the admin CRUD mentions “C”. |
| **DR-111 Admin Can Read** | An ERB table is flagged admin can read if the admin CRUD mentions “R”. |
| **DR-112 Admin Can Update** | An ERB table is flagged admin can update if the admin CRUD mentions “U”. |
| **DR-113 Admin Can Delete** | An ERB table is flagged admin can delete if the admin CRUD mentions “D”. |
| **DR-114 Manager Can Create** | An ERB table is flagged manager can create if the manager CRUD mentions “C”. |
| **DR-115 Manager Can Read** | An ERB table is flagged manager can read if the manager CRUD mentions “R”. |
| **DR-116 Manager Can Update** | An ERB table is flagged manager can update if the manager CRUD mentions “U”. |
| **DR-117 Manager Can Delete** | An ERB table is flagged manager can delete if the manager CRUD mentions “D”. |
| **DR-118 Representative Can Create** | An ERB table is flagged representative can create if the representative CRUD mentions “C”. |
| **DR-119 Representative Can Read** | An ERB table is flagged representative can read if the representative CRUD mentions “R”. |
| **DR-120 Representative Can Update** | An ERB table is flagged representative can update if the representative CRUD mentions “U”. |
| **DR-121 Representative Can Delete** | An ERB table is flagged representative can delete if the representative CRUD mentions “D”. |
| **DR-122 External Llm Can Create** | An ERB table is flagged external llm can create if the external llm CRUD mentions “C”. |
| **DR-123 External Llm Can Read** | An ERB table is flagged external llm can read if the external llm CRUD mentions “R”. |
| **DR-124 External Llm Can Update** | An ERB table is flagged external llm can update if the external llm CRUD mentions “U”. |
| **DR-125 External Llm Can Delete** | An ERB table is flagged external llm can delete if the external llm CRUD mentions “D”. |
| **DR-126 Name** | An ERB field's name is the same as its ERB field ID. |
| **DR-127 Table Package is Active** | An ERB field's table package is active when the linked ERB table is active. |
| **DR-128 Is Calculated** | An ERB field is considered calculated if at least one of the following holds: the field type is “calculated”; the field type is “lookup”; or the field type is “aggregation”. |
| **DR-129 Admin Can Create** | An ERB field is flagged admin can create if the admin CRUD mentions “C”. |
| **DR-130 Admin Can Read** | An ERB field is flagged admin can read if the admin CRUD mentions “R”. |
| **DR-131 Admin Can Update** | An ERB field is flagged admin can update if the admin CRUD mentions “U”. |
| **DR-132 Admin Can Delete** | An ERB field is flagged admin can delete if the admin CRUD mentions “D”. |
| **DR-133 Manager Can Create** | An ERB field is flagged manager can create if the manager CRUD mentions “C”. |
| **DR-134 Manager Can Read** | An ERB field is flagged manager can read if the manager CRUD mentions “R”. |
| **DR-135 Manager Can Update** | An ERB field is flagged manager can update if the manager CRUD mentions “U”. |
| **DR-136 Manager Can Delete** | An ERB field is flagged manager can delete if the manager CRUD mentions “D”. |
| **DR-137 Representative Can Create** | An ERB field is flagged representative can create if the representative CRUD mentions “C”. |
| **DR-138 Representative Can Read** | An ERB field is flagged representative can read if the representative CRUD mentions “R”. |
| **DR-139 Representative Can Update** | An ERB field is flagged representative can update if the representative CRUD mentions “U”. |
| **DR-140 Representative Can Delete** | An ERB field is flagged representative can delete if the representative CRUD mentions “D”. |
| **DR-141 External Llm Can Create** | An ERB field is flagged external llm can create if the external llm CRUD mentions “C”. |
| **DR-142 External Llm Can Read** | An ERB field is flagged external llm can read if the external llm CRUD mentions “R”. |
| **DR-143 External Llm Can Update** | An ERB field is flagged external llm can update if the external llm CRUD mentions “U”. |
| **DR-144 External Llm Can Delete** | An ERB field is flagged external llm can delete if the external llm CRUD mentions “D”. |
| **DR-145 Name** | An API endpoint's name is the same as its API endpoint ID. |
| **DR-146 Name** | A subject state instance's name is the same as its subject state instance ID. |
| **DR-147 Is Current** | A subject state instance is considered a current if the exited at is blank. |
| **DR-148 Has Complete Lineage** | A subject state instance is considered to have a complete lineage if the sequence index is at least 1. |
| **DR-149 Name** | A violation type's name is computed as the lower-cased code with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-150 Jurisdiction Label** | A violation type's jurisdiction label is the display name of the violation type's jurisdiction. |
| **DR-151 Traffic School Point Cap** | A violation type's traffic school point cap — taken from the linked jurisdiction. |
| **DR-152 Is School Eligible by Cap** | A violation type is considered a school eligible by cap if the points is at most the traffic school point cap. |
| **DR-153 Count of Citations** | A violation type's count of citations is the number of citations related to the violation type. |
| **DR-154 Name** | A driver's name is computed as the lower-cased license number with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-155 Full Name** | A driver's full name is computed as the last name, followed by a comma followed by a space, followed by the first name. |
| **DR-156 Home Jurisdiction Label** | A driver's home jurisdiction label is the display name of the driver's home jurisdiction. |
| **DR-157 Suspension Threshold** | A driver's suspension threshold is the point suspension threshold of the driver's home jurisdiction. |
| **DR-158 Warning Threshold** | A driver's warning threshold is the point warning threshold of the driver's home jurisdiction. |
| **DR-159 Count of Citations** | A driver's count of citations is the number of citations related to the driver. |
| **DR-160 Active Points** | A driver's active points is the total effective points across the citations related to the driver. |
| **DR-161 License Status** | The driver's license status is determined by the following priority:<br>1. “Suspended”, if the active points is at least the suspension threshold;<br>2. “Warning”, if the active points is at least the warning threshold;<br>3. in all other cases, “Valid”. |
| **DR-162 Name** | A citation's name is computed as the lower-cased citation number with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-163 Driver Label** | A citation's driver label is the full name of the citation's driver. |
| **DR-164 Violation Label** | A citation's violation label is the description of the citation's violation type. |
| **DR-165 Jurisdiction Label** | A citation's jurisdiction label is the display name of the citation's jurisdiction. |
| **DR-166 Base Fine USD** | A citation's base fine USD — taken from the linked violation type. |
| **DR-167 Violation Points** | A citation's violation points — taken from the linked violation type. |
| **DR-168 Days to Respond** | A citation's days to respond — taken from the linked jurisdiction. |
| **DR-169 Days to Pay After Ruling** | A citation's days to pay after ruling — taken from the linked jurisdiction. |
| **DR-170 Late Penalty Pct** | A citation's late penalty pct — taken from the linked jurisdiction. |
| **DR-171 Days Late to Collections** | A citation's days late to collections — taken from the linked jurisdiction. |
| **DR-172 Response Due Date** | A citation's response due date is computed as the issued on plus the days to respond. |
| **DR-173 Days Until Response Due** | A citation's days until response due is computed as the number of days from the as of date to the response due date. |
| **DR-174 Is Response Overdue** | A citation is considered a response overdue if all of the following hold: the responded on is blank and the as of date is greater than the response due date. |
| **DR-175 Count of Hearings** | A citation's count of hearings is the number of hearings related to the citation. |
| **DR-176 Latest Hearing Outcome** | A citation's latest hearing outcome is the largest outcome across the hearings related to the citation. |
| **DR-177 Contest Status** | The citation's contest status is determined by the following priority:<br>1. “NotContested”, if the contest requested flag is not set;<br>2. “HearingRequested”, if the count of hearings is 0;<br>3. “Scheduled”, if at least one of the following holds: the latest hearing outcome is “Pending” or the latest hearing outcome is blank;<br>4. in all other cases, “Heard”. |
| **DR-178 Is Dismissed** | A citation is considered dismissed if the latest hearing outcome is “Dismissed”. |
| **DR-179 Is Guilty** | A citation is considered a guilty if at least one of the following holds: the latest hearing outcome is “Guilty”; the latest hearing outcome is “Upheld”; or all of the following hold: the response overdue flag is set and the contest requested flag is not set. |
| **DR-180 Amount Due USD** | The citation's amount due USD is determined by the following priority:<br>1. 0, if the dismissed flag is set;<br>2. the base fine USD times 1 plus the late penalty pct, if the payment late flag is set;<br>3. in all other cases, the base fine USD. |
| **DR-181 Payment Due Date** | A citation's payment due date is computed as the response due date interpreted as a date plus the days to pay after ruling. |
| **DR-182 Is Payment Late** | A citation is considered a payment late if all of the following hold: the guilty flag is set; the paid on is blank; and the as of date is greater than the payment due date. |
| **DR-183 Is in Collections** | A citation is considered in-collections if all of the following hold: the payment late flag is set and the as of date is greater than the payment due date interpreted as a date plus the days late to collections. |
| **DR-184 Payment Status** | The citation's payment status is determined by the following priority:<br>1. “NotOwed”, if the dismissed flag is set;<br>2. “Paid”, if the paid on has a value;<br>3. “Collections”, if the in collections flag is set;<br>4. “Late”, if the payment late flag is set;<br>5. “Due”, if the guilty flag is set;<br>6. in all other cases, “Pending”. |
| **DR-185 Effective Points** | The citation's effective points is determined by the following priority:<br>1. the violation points, if all of the following hold: the guilty flag is set and the dismissed flag is not set;<br>2. in all other cases, 0. |
| **DR-186 Citation Status** | The citation's citation status is determined by the following priority:<br>1. “Closed”, if at least one of the following holds: the paid on has a value or the dismissed flag is set;<br>2. “Adjudicated”, if at least one of the following holds: the latest hearing outcome is “Guilty”; the latest hearing outcome is “Upheld”; or all of the following hold: the response overdue flag is set and the contest requested flag is not set;<br>3. “InContest”, if all of the following hold: the contest requested flag is set and the count of hearings is greater than 0;<br>4. “Responded”, if the responded on has a value;<br>5. in all other cases, “Issued”. |
| **DR-187 Name** | A hearing's name is computed as the lower-cased hearing number with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-188 Citation Label** | A hearing's citation label is the citation number of the hearing's citation. |
| **DR-189 Name** | A payment's name is computed as the lower-cased payment number with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-190 Citation Label** | A payment's citation label is the citation number of the payment's citation. |
| **DR-191 Name** | A case event's name is computed as the lower-cased event number with every a space replaced by a hyphen. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-192 Citation Label** | A case event's citation label is the citation number of the case event's citation. |
| **DR-193 Name** | A test category's name is the same as its test category ID. |
| **DR-194 Name** | A test surface's name is the same as its test surface ID. |
| **DR-195 Name** | A test technology's name is the same as its test technology ID. |
| **DR-196 Name** | A test case's name is the same as its test case ID. |
| **DR-197 Expectation Count** | A test case's expectation count is the number of the test case's expectations. |
| **DR-198 Name** | A test expectation's name is the same as its test expectation ID. |
| **DR-199 Name** | A test run's name is the same as its test run ID. |
| **DR-200 Name** | A test result's name is the same as its test result ID. |
| **DR-201 Name** | A test result assertion's name is the same as its test result assertion ID. |
| **DR-202 Name** | A screen layout's name is the same as its screen layout ID. |
| **DR-203 Name** | A screen section's name is the same as its screen section ID. |
| **DR-204 Name** | A field display hint's name is the same as its field display hint ID. |
| **DR-205 Name** | A fee schedule's name is the same as its fee schedule ID. |
| **DR-206 Name** | A deadline rule's name is the same as its deadline rule ID. |
| **DR-207 Name** | A contest ground's name is the same as its contest ground ID. |
| **DR-208 Name** | A driver license point's name is the same as its driver license point ID. |
| **DR-209 Name** | A build phas's name is the same as its build phase ID. |

## 5 Traceability to Schema

_The expression column is the rule's definition in RuleSpeak® notation —
the same logic the rulebook stores, written for a business reader._

| Schema element | Kind | Expression |
|----------------|------|------------|
| **BusinessRules.Name** | formula | `Lower(Replace(RuleCode, " ", "-"))` |
| **BusinessRuleCategories.Name** | formula | `BusinessRuleCategoryId` |
| **BusinessRuleCategories.RuleCount** | rollup | — |
| **GlossaryCategories.Name** | formula | `GlossaryCategoryId` |
| **GlossaryCategories.TermCount** | rollup | — |
| **GlossaryTerms.Name** | formula | `Lower(Replace(Term, " ", "-"))` |
| **Roles.Name** | formula | `RoleId` |
| **Roles.AppUserCount** | rollup | — |
| **AuditLogEntries.Name** | formula | `Lower(Replace("audit-" & Citation & "-" & DatetimeFormat(Timestamp, "YYYY-MM-DDTHH-mm-ss") & "-" & ActionType, " ", "-"))` |
| **AuditLogEntries.IsOverrideAction** | formula | `If(Lower(ActionType & "") = "override", True(), False())` |
| **AuditLogEntries.EntryAgeHours** | formula | `DaysBetween(Now(), Timestamp)` |
| **PlatformNaviation.Name** | formula | `Replace(Lower(DisplayName), " ", "-")` |
| **PlatformNaviation.PackageIsActive** | lookup | `Lookup(ERBPackages.IsActive via ERBPackage)` |
| **PlatformNaviation.PackageIsLicensed** | lookup | `Lookup(ERBPackages.IsLicensed via ERBPackage)` |
| **PlatformNaviation.AdminCanCreate** | formula | `If(AdminCRUD = Blank(), Blank(), Not(Iserror(Find("C", AdminCRUD))))` |
| **PlatformNaviation.AdminCanRead** | formula | `If(AdminCRUD = Blank(), Blank(), Not(Iserror(Find("R", AdminCRUD))))` |
| **PlatformNaviation.AdminCanUpdate** | formula | `If(AdminCRUD = Blank(), Blank(), Not(Iserror(Find("U", AdminCRUD))))` |
| **PlatformNaviation.AdminCanDelete** | formula | `If(AdminCRUD = Blank(), Blank(), Not(Iserror(Find("D", AdminCRUD))))` |
| **PlatformNaviation.ManagerCanCreate** | formula | `If(ManagerCRUD = Blank(), Blank(), Not(Iserror(Find("C", ManagerCRUD))))` |
| **PlatformNaviation.ManagerCanRead** | formula | `If(ManagerCRUD = Blank(), Blank(), Not(Iserror(Find("R", ManagerCRUD))))` |
| **PlatformNaviation.ManagerCanUpdate** | formula | `If(ManagerCRUD = Blank(), Blank(), Not(Iserror(Find("U", ManagerCRUD))))` |
| **PlatformNaviation.ManagerCanDelete** | formula | `If(ManagerCRUD = Blank(), Blank(), Not(Iserror(Find("D", ManagerCRUD))))` |
| **PlatformNaviation.RepresentativeCanCreate** | formula | `If(RepresentativeCRUD = Blank(), Blank(), Not(Iserror(Find("C", RepresentativeCRUD))))` |
| **PlatformNaviation.RepresentativeCanRead** | formula | `If(RepresentativeCRUD = Blank(), Blank(), Not(Iserror(Find("R", RepresentativeCRUD))))` |
| **PlatformNaviation.RepresentativeCanUpdate** | formula | `If(RepresentativeCRUD = Blank(), Blank(), Not(Iserror(Find("U", RepresentativeCRUD))))` |
| **PlatformNaviation.RepresentativeCanDelete** | formula | `If(RepresentativeCRUD = Blank(), Blank(), Not(Iserror(Find("D", RepresentativeCRUD))))` |
| **PlatformNaviation.ExternalLlmCanCreate** | formula | `If(ExternalLlmCRUD = Blank(), Blank(), Not(Iserror(Find("C", ExternalLlmCRUD))))` |
| **PlatformNaviation.ExternalLlmCanRead** | formula | `If(ExternalLlmCRUD = Blank(), Blank(), Not(Iserror(Find("R", ExternalLlmCRUD))))` |
| **PlatformNaviation.ExternalLlmCanUpdate** | formula | `If(ExternalLlmCRUD = Blank(), Blank(), Not(Iserror(Find("U", ExternalLlmCRUD))))` |
| **PlatformNaviation.ExternalLlmCanDelete** | formula | `If(ExternalLlmCRUD = Blank(), Blank(), Not(Iserror(Find("D", ExternalLlmCRUD))))` |
| **PlatformNaviation.Depth** | formula | `If(ParentRouteKey = Blank(), 0, Len(RouteKey) - Len(Replace(RouteKey, ".", "")))` |
| **PlatformNaviation.FullPath** | formula | `Route` |
| **PlatformNaviation.HandlerBaseName** | formula | `Replace(Replace(RouteKey, ".", " "), "-", " ")` |
| **Jurisdictions.Name** | formula | `Lower(State) & "-us"` |
| **Jurisdictions.ParentJurisdictionName** | lookup | `Lookup(Jurisdictions.Name via ParentJurisdiction)` |
| **Jurisdictions.IsRootJurisdiction** | formula | `If(ParentJurisdiction = Blank(), True(), False())` |
| **Jurisdictions.ChildJurisdictionCount** | rollup | `Count(Jurisdictions via ParentJurisdiction)` |
| **Jurisdictions.RelativePath** | formula | `"/library/jurisdictions/" & JurisdictionId` |
| **Jurisdictions.RuleCount** | rollup | `Count(JurisdictionRules via Jurisdiction)` |
| **Jurisdictions.SourceDocumentCount** | rollup | `Count(JurisdictionSourceDocuments via Jurisdiction)` |
| **JurisdictionSourceDocuments.Name** | formula | `Replace(Lower(Title), " ", "-")` |
| **JurisdictionSourceDocuments.JurisdictionName** | lookup | `Lookup(Jurisdictions.Name via Jurisdiction)` |
| **JurisdictionSourceDocuments.RelativePath** | formula | `"/library/jurisdiction-docs/" & JurisdictionSourceDocumentId` |
| **JurisdictionSourceDocuments.RuleCount** | rollup | `Count(JurisdictionRules via SourceDocument)` |
| **JurisdictionRules.Name** | formula | `Replace(Lower(RuleNumber), " ", "-")` |
| **JurisdictionRules.RoutePath** | lookup | `Lookup(PlatformNaviation.Route via Route)` |
| **JurisdictionRules.RelativePath** | formula | `"/library/jurisdiction-rules/" & JurisdictionRuleId` |
| **JurisdictionRules.JurisdictionName** | lookup | `Lookup(Jurisdictions.Name via Jurisdiction)` |
| **JurisdictionRules.JurisdictionType** | lookup | `Lookup(Jurisdictions.JurisdictionType via Jurisdiction)` |
| **JurisdictionRules.IsFederal** | formula | `If(JurisdictionType = "Country", True(), False())` |
| **AppUsers.NameRedacted** | formula | `Name` |
| **AppUsers.EmailAddressRedacted** | formula | `EmailAddress` |
| **AppUsers.RoleTitle** | lookup | `Lookup(Roles.Title via Role)` |
| **AppUsers.RoleDescription** | lookup | `Lookup(Roles.Description via Role)` |
| **SiteBranding.Name** | formula | `SiteBrandingId` |
| **ReferenceDocuments.Name** | formula | `ReferenceDocumentId` |
| **ReferenceDocuments.IsAppealBoardDecision** | formula | `Library = "appeal-board-decisions"` |
| **StateMachines.Name** | formula | `StateMachineId` |
| **StateMachines.PackageIsActive** | lookup | `Lookup(ERBPackages.IsActive via ERBPackage)` |
| **StateMachines.StateCount** | rollup | — |
| **StateMachines.TransitionRuleCount** | rollup | — |
| **MachineStates.Name** | formula | `MachineStateId` |
| **StateTransitionRules.Name** | formula | `StateTransitionRuleId` |
| **StateTransitionRules.FromStateKey** | lookup | `Lookup(MachineStates.StateKey via FromState)` |
| **StateTransitionRules.ToStateKey** | lookup | `Lookup(MachineStates.StateKey via ToState)` |
| **StateTransitionRules.IsForwardEdge** | formula | `Not(ToStateKey = "draft")` |
| **StateTransitions.Name** | formula | `StateTransitionId` |
| **StateTransitions.IsForward** | formula | `And(Not(ToStateKey = "draft"), Not(ToStateKey = "new"), Not(ToStateKey = "pending"), Not(ToStateKey = "open"), Not(ToStateKey = "issued"))` |
| **WorkQueueItems.Name** | formula | `WorkQueueItemId` |
| **WorkQueueItems.DueInDays** | formula | `DaysBetween(DueDate, Today())` |
| **WorkQueueItems.IsOverdue** | formula | `If(DueInDays = Blank(), False(), DueInDays < 0)` |
| **WorkQueueItems.UrgencyBucket** | formula | `If(DueInDays = Blank(), "follow-up", If(DueInDays <= 0, "urgent", If(DueInDays <= 3, "due-3-days", "upcoming")))` |
| **WorkQueueItems.IsUrgent** | formula | `UrgencyBucket = "urgent"` |
| **AiModels.Name** | formula | `AiModelId` |
| **AiModels.PricingVersionCount** | rollup | `Count(ModelPricingVersions via AiModel)` |
| **AiModels.TurnCount** | rollup | `Count(AssistantTurns via AiModel)` |
| **AiModels.TotalCost** | rollup | `Sum(AssistantTurns.TotalCost via AiModel)` |
| **ModelPricingVersions.Name** | formula | `ModelPricingVersionId` |
| **ModelPricingVersions.AiModelTitle** | lookup | `Lookup(AiModels.Title via AiModel)` |
| **ModelPricingVersions.TurnCount** | rollup | `Count(AssistantTurns via ModelPricingVersion)` |
| **AssistantTurns.Name** | formula | `AssistantTurnId` |
| **AssistantTurns.TotalTokens** | formula | `InputTokens + OutputTokens` |
| **AssistantTurns.BillableInputTokens** | formula | `InputTokens - CachedInputTokens` |
| **AssistantTurns.AiModelTitle** | lookup | `Lookup(AiModels.Title via AiModel)` |
| **AssistantTurns.InputPricePerMTok** | lookup | `Lookup(ModelPricingVersions.InputPricePerMTok via ModelPricingVersion)` |
| **AssistantTurns.CachedInputPricePerMTok** | lookup | `Lookup(ModelPricingVersions.CachedInputPricePerMTok via ModelPricingVersion)` |
| **AssistantTurns.OutputPricePerMTok** | lookup | `Lookup(ModelPricingVersions.OutputPricePerMTok via ModelPricingVersion)` |
| **AssistantTurns.InputCost** | formula | `BillableInputTokens * InputPricePerMTok + CachedInputTokens * CachedInputPricePerMTok / 1000000` |
| **AssistantTurns.OutputCost** | formula | `OutputTokens * OutputPricePerMTok / 1000000` |
| **AssistantTurns.TotalCost** | formula | `InputCost + OutputCost` |
| **Platforms.Name** | formula | `PlatformId` |
| **ERBPackages.Name** | formula | `ERBPackageId` |
| **ERBPackages.FeatureCount** | formula | `Count(ERBFeatures)` |
| **ERBPackages.ShippedFeatureCount** | formula | `Count(ERBFeatures via Status)` |
| **ERBFeatureStatuses.Name** | formula | `ERBFeatureStatusId` |
| **ERBFeatureStatuses.FeatureCount** | rollup | — |
| **ERBFeatureCategories.Name** | formula | `ERBFeatureCategoryId` |
| **ERBFeatureCategories.FeatureCount** | rollup | — |
| **ERBFeatures.Name** | formula | `ERBFeatureId` |
| **ERBFeatures.RoutePath** | lookup | `Lookup(PlatformNaviation.Route via Route)` |
| **ERBFeatures.RelativePath** | formula | `Replace(RoutePath, ":featureId", ERBFeatureId)` |
| **ERBFeatures.PackageIsLicensed** | lookup | `Lookup(ERBPackages.IsLicensed via ERBPackage)` |
| **ERBFeatures.CategoryTitle** | lookup | `Lookup(ERBFeatureCategories.Title via Category)` |
| **ERBFeatures.StatusTitle** | lookup | `Lookup(ERBFeatureStatuses.Title via Status)` |
| **ERBFeatures.StatusDescription** | lookup | `Lookup(ERBFeatureStatuses.Description via Status)` |
| **ERBFeatures.StatusIsActive** | lookup | `Lookup(ERBFeatureStatuses.IsActive via Status)` |
| **ERBTables.Name** | formula | `ERBTableId` |
| **ERBTables.PackageIsActive** | lookup | `Lookup(ERBPackages.IsActive via ERBPackage)` |
| **ERBTables.PackageIsLicensed** | lookup | `Lookup(ERBPackages.IsLicensed via ERBPackage)` |
| **ERBTables.AdminCanCreate** | formula | `If(AdminCRUD = Blank(), Blank(), Not(Iserror(Find("C", AdminCRUD))))` |
| **ERBTables.AdminCanRead** | formula | `If(AdminCRUD = Blank(), Blank(), Not(Iserror(Find("R", AdminCRUD))))` |
| **ERBTables.AdminCanUpdate** | formula | `If(AdminCRUD = Blank(), Blank(), Not(Iserror(Find("U", AdminCRUD))))` |
| **ERBTables.AdminCanDelete** | formula | `If(AdminCRUD = Blank(), Blank(), Not(Iserror(Find("D", AdminCRUD))))` |
| **ERBTables.ManagerCanCreate** | formula | `If(ManagerCRUD = Blank(), Blank(), Not(Iserror(Find("C", ManagerCRUD))))` |
| **ERBTables.ManagerCanRead** | formula | `If(ManagerCRUD = Blank(), Blank(), Not(Iserror(Find("R", ManagerCRUD))))` |
| **ERBTables.ManagerCanUpdate** | formula | `If(ManagerCRUD = Blank(), Blank(), Not(Iserror(Find("U", ManagerCRUD))))` |
| **ERBTables.ManagerCanDelete** | formula | `If(ManagerCRUD = Blank(), Blank(), Not(Iserror(Find("D", ManagerCRUD))))` |
| **ERBTables.RepresentativeCanCreate** | formula | `If(RepresentativeCRUD = Blank(), Blank(), Not(Iserror(Find("C", RepresentativeCRUD))))` |
| **ERBTables.RepresentativeCanRead** | formula | `If(RepresentativeCRUD = Blank(), Blank(), Not(Iserror(Find("R", RepresentativeCRUD))))` |
| **ERBTables.RepresentativeCanUpdate** | formula | `If(RepresentativeCRUD = Blank(), Blank(), Not(Iserror(Find("U", RepresentativeCRUD))))` |
| **ERBTables.RepresentativeCanDelete** | formula | `If(RepresentativeCRUD = Blank(), Blank(), Not(Iserror(Find("D", RepresentativeCRUD))))` |
| **ERBTables.ExternalLlmCanCreate** | formula | `If(ExternalLlmCRUD = Blank(), Blank(), Not(Iserror(Find("C", ExternalLlmCRUD))))` |
| **ERBTables.ExternalLlmCanRead** | formula | `If(ExternalLlmCRUD = Blank(), Blank(), Not(Iserror(Find("R", ExternalLlmCRUD))))` |
| **ERBTables.ExternalLlmCanUpdate** | formula | `If(ExternalLlmCRUD = Blank(), Blank(), Not(Iserror(Find("U", ExternalLlmCRUD))))` |
| **ERBTables.ExternalLlmCanDelete** | formula | `If(ExternalLlmCRUD = Blank(), Blank(), Not(Iserror(Find("D", ExternalLlmCRUD))))` |
| **ERBFields.Name** | formula | `ERBFieldId` |
| **ERBFields.TablePackageIsActive** | lookup | `Lookup(ERBTables.PackageIsActive via ERBTable)` |
| **ERBFields.IsCalculated** | formula | `Or(FieldType = "calculated", FieldType = "lookup", FieldType = "aggregation")` |
| **ERBFields.AdminCanCreate** | formula | `If(AdminCRUD = Blank(), Blank(), Not(Iserror(Find("C", AdminCRUD))))` |
| **ERBFields.AdminCanRead** | formula | `If(AdminCRUD = Blank(), Blank(), Not(Iserror(Find("R", AdminCRUD))))` |
| **ERBFields.AdminCanUpdate** | formula | `If(AdminCRUD = Blank(), Blank(), Not(Iserror(Find("U", AdminCRUD))))` |
| **ERBFields.AdminCanDelete** | formula | `If(AdminCRUD = Blank(), Blank(), Not(Iserror(Find("D", AdminCRUD))))` |
| **ERBFields.ManagerCanCreate** | formula | `If(ManagerCRUD = Blank(), Blank(), Not(Iserror(Find("C", ManagerCRUD))))` |
| **ERBFields.ManagerCanRead** | formula | `If(ManagerCRUD = Blank(), Blank(), Not(Iserror(Find("R", ManagerCRUD))))` |
| **ERBFields.ManagerCanUpdate** | formula | `If(ManagerCRUD = Blank(), Blank(), Not(Iserror(Find("U", ManagerCRUD))))` |
| **ERBFields.ManagerCanDelete** | formula | `If(ManagerCRUD = Blank(), Blank(), Not(Iserror(Find("D", ManagerCRUD))))` |
| **ERBFields.RepresentativeCanCreate** | formula | `If(RepresentativeCRUD = Blank(), Blank(), Not(Iserror(Find("C", RepresentativeCRUD))))` |
| **ERBFields.RepresentativeCanRead** | formula | `If(RepresentativeCRUD = Blank(), Blank(), Not(Iserror(Find("R", RepresentativeCRUD))))` |
| **ERBFields.RepresentativeCanUpdate** | formula | `If(RepresentativeCRUD = Blank(), Blank(), Not(Iserror(Find("U", RepresentativeCRUD))))` |
| **ERBFields.RepresentativeCanDelete** | formula | `If(RepresentativeCRUD = Blank(), Blank(), Not(Iserror(Find("D", RepresentativeCRUD))))` |
| **ERBFields.ExternalLlmCanCreate** | formula | `If(ExternalLlmCRUD = Blank(), Blank(), Not(Iserror(Find("C", ExternalLlmCRUD))))` |
| **ERBFields.ExternalLlmCanRead** | formula | `If(ExternalLlmCRUD = Blank(), Blank(), Not(Iserror(Find("R", ExternalLlmCRUD))))` |
| **ERBFields.ExternalLlmCanUpdate** | formula | `If(ExternalLlmCRUD = Blank(), Blank(), Not(Iserror(Find("U", ExternalLlmCRUD))))` |
| **ERBFields.ExternalLlmCanDelete** | formula | `If(ExternalLlmCRUD = Blank(), Blank(), Not(Iserror(Find("D", ExternalLlmCRUD))))` |
| **APIEndpoints.Name** | formula | `APIEndpointId` |
| **SubjectStateInstances.Name** | formula | `SubjectStateInstanceId` |
| **SubjectStateInstances.IsCurrent** | formula | `Isblank(ExitedAt)` |
| **SubjectStateInstances.HasCompleteLineage** | formula | `SequenceIndex >= 1` |
| **ViolationTypes.Name** | formula | `Replace(Lower(Code), " ", "-")` |
| **ViolationTypes.JurisdictionLabel** | lookup | `Lookup(Jurisdictions.DisplayName via Jurisdiction)` |
| **ViolationTypes.TrafficSchoolPointCap** | lookup | `Lookup(Jurisdictions.TrafficSchoolPointCap via Jurisdiction)` |
| **ViolationTypes.IsSchoolEligibleByCap** | formula | `If(Points <= TrafficSchoolPointCap, TRUE, FALSE)` |
| **ViolationTypes.CountOfCitations** | rollup | `Count(Citations via ViolationType)` |
| **Drivers.Name** | formula | `Replace(Lower(LicenseNumber), " ", "-")` |
| **Drivers.FullName** | formula | `LastName & ", " & FirstName` |
| **Drivers.HomeJurisdictionLabel** | lookup | `Lookup(Jurisdictions.DisplayName via HomeJurisdiction)` |
| **Drivers.SuspensionThreshold** | lookup | `Lookup(Jurisdictions.PointSuspensionThreshold via HomeJurisdiction)` |
| **Drivers.WarningThreshold** | lookup | `Lookup(Jurisdictions.PointWarningThreshold via HomeJurisdiction)` |
| **Drivers.CountOfCitations** | rollup | `Count(Citations via Driver)` |
| **Drivers.ActivePoints** | rollup | `Sum(Citations.EffectivePoints via Driver)` |
| **Drivers.LicenseStatus** | formula | `If(ActivePoints >= SuspensionThreshold, "Suspended", If(ActivePoints >= WarningThreshold, "Warning", "Valid"))` |
| **Citations.Name** | formula | `Replace(Lower(CitationNumber), " ", "-")` |
| **Citations.DriverLabel** | lookup | `Lookup(Drivers.FullName via Driver)` |
| **Citations.ViolationLabel** | lookup | `Lookup(ViolationTypes.Description via ViolationType)` |
| **Citations.JurisdictionLabel** | lookup | `Lookup(Jurisdictions.DisplayName via Jurisdiction)` |
| **Citations.BaseFineUsd** | lookup | `Lookup(ViolationTypes.BaseFineUsd via ViolationType)` |
| **Citations.ViolationPoints** | lookup | `Lookup(ViolationTypes.Points via ViolationType)` |
| **Citations.DaysToRespond** | lookup | `Lookup(Jurisdictions.DaysToRespond via Jurisdiction)` |
| **Citations.DaysToPayAfterRuling** | lookup | `Lookup(Jurisdictions.DaysToPayAfterRuling via Jurisdiction)` |
| **Citations.LatePenaltyPct** | lookup | `Lookup(Jurisdictions.LatePenaltyPct via Jurisdiction)` |
| **Citations.DaysLateToCollections** | lookup | `Lookup(Jurisdictions.DaysLateToCollections via Jurisdiction)` |
| **Citations.ResponseDueDate** | formula | `IssuedOn + DaysToRespond` |
| **Citations.DaysUntilResponseDue** | formula | `Days(ResponseDueDate, AsOfDate)` |
| **Citations.IsResponseOverdue** | formula | `If(And(Isblank(RespondedOn), AsOfDate > ResponseDueDate), TRUE, FALSE)` |
| **Citations.CountOfHearings** | rollup | `Count(Hearings via Citation)` |
| **Citations.LatestHearingOutcome** | rollup | `Max(Hearings.Outcome via Citation)` |
| **Citations.ContestStatus** | formula | `If(Not(ContestRequested), "NotContested", If(CountOfHearings = 0, "HearingRequested", If(Or(LatestHearingOutcome = "Pending", Isblank(LatestHearingOutcome)), "Scheduled", "Heard")))` |
| **Citations.IsDismissed** | formula | `If(LatestHearingOutcome = "Dismissed", TRUE, FALSE)` |
| **Citations.IsGuilty** | formula | `If(Or(LatestHearingOutcome = "Guilty", LatestHearingOutcome = "Upheld", And(IsResponseOverdue, Not(ContestRequested))), TRUE, FALSE)` |
| **Citations.AmountDueUsd** | formula | `If(IsDismissed, 0, If(IsPaymentLate, BaseFineUsd * 1 + LatePenaltyPct, BaseFineUsd))` |
| **Citations.PaymentDueDate** | formula | `Datevalue(ResponseDueDate) + DaysToPayAfterRuling` |
| **Citations.IsPaymentLate** | formula | `If(And(IsGuilty, Isblank(PaidOn), AsOfDate > PaymentDueDate), TRUE, FALSE)` |
| **Citations.IsInCollections** | formula | `If(And(IsPaymentLate, AsOfDate > Datevalue(PaymentDueDate) + DaysLateToCollections), TRUE, FALSE)` |
| **Citations.PaymentStatus** | formula | `If(IsDismissed, "NotOwed", If(Not(Isblank(PaidOn)), "Paid", If(IsInCollections, "Collections", If(IsPaymentLate, "Late", If(IsGuilty, "Due", "Pending")))))` |
| **Citations.EffectivePoints** | formula | `If(And(IsGuilty, Not(IsDismissed)), ViolationPoints, 0)` |
| **Citations.CitationStatus** | formula | `If(Or(Not(Isblank(PaidOn)), IsDismissed), "Closed", If(Or(LatestHearingOutcome = "Guilty", LatestHearingOutcome = "Upheld", And(IsResponseOverdue, Not(ContestRequested))), "Adjudicated", If(And(ContestRequested, CountOfHearings > 0), "InContest", If(Not(Isblank(RespondedOn)), "Responded", "Issued"))))` |
| **Hearings.Name** | formula | `Replace(Lower(HearingNumber), " ", "-")` |
| **Hearings.CitationLabel** | lookup | `Lookup(Citations.CitationNumber via Citation)` |
| **Payments.Name** | formula | `Replace(Lower(PaymentNumber), " ", "-")` |
| **Payments.CitationLabel** | lookup | `Lookup(Citations.CitationNumber via Citation)` |
| **CaseEvents.Name** | formula | `Replace(Lower(EventNumber), " ", "-")` |
| **CaseEvents.CitationLabel** | lookup | `Lookup(Citations.CitationNumber via Citation)` |
| **TestCategory.Name** | formula | `TestCategoryId` |
| **TestSurface.Name** | formula | `TestSurfaceId` |
| **TestTechnology.Name** | formula | `TestTechnologyId` |
| **TestCase.Name** | formula | `TestCaseId` |
| **TestCase.ExpectationCount** | rollup | `Count(TestExpectation.TestCase = TestCaseId)` |
| **TestExpectation.Name** | formula | `TestExpectationId` |
| **TestRun.Name** | formula | `TestRunId` |
| **TestResult.Name** | formula | `TestResultId` |
| **TestResultAssertion.Name** | formula | `TestResultAssertionId` |
| **ScreenLayouts.Name** | formula | `ScreenLayoutId` |
| **ScreenSections.Name** | formula | `ScreenSectionId` |
| **FieldDisplayHints.Name** | formula | `FieldDisplayHintId` |
| **FeeSchedules.Name** | formula | `FeeScheduleId` |
| **DeadlineRules.Name** | formula | `DeadlineRuleId` |
| **ContestGrounds.Name** | formula | `ContestGroundId` |
| **DriverLicensePoints.Name** | formula | `DriverLicensePointId` |
| **BuildPhases.Name** | formula | `BuildPhaseId` |

---

_This document is rendered in **RuleSpeak®**, the declarative business-rule
notation created by **Ronald G. Ross**, and follows the conventions of
**SBVR** (Semantics of Business Vocabulary and Business Rules). With thanks to
Ronald G. Ross for RuleSpeak® and his foundational work on business rules —
[www.RonRoss.info](https://www.RonRoss.info)._
