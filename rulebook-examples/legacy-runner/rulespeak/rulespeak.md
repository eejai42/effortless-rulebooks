# 📘 Legacy Runner — RuleSpeak®

_The legacy orchestration runner: admin portal, ssotme-proxy transpiler bus, execution substrates, substrate contract and conformance evaluation, portal navigation/screens/APIs/permissions. One ordinary rulebook-examples project._

> Declarative business rules rendered from the rulebook. Every statement
> below expresses truth in the business domain — it is neither a procedure
> nor an imperative. The rulebook's formulas are the single source of truth;
> this document is their plain-language reading.

## 1 Business Vocabulary

| Term | Description | Narrative Comment |
|------|-------------|-------------------|
| **Project Metadata** | Project overview | — |
| Name | A defined attribute. | _Effortlessly Invariant Rulesbooks (ERB)_ |
| Purpose | A defined attribute. | _Host a catalog of independent Effortless projects (rulebook-examples/<project>/), each a self-contained rulebook that fully captures one domain and selects the subset of platform substrates it needs. The platform proves that a rulebook is a complete spec: given just the rulebook, any frontier LLM can answer any question about the domain or produce a faithful implementation in any language / platform._ |
| Architecture | A defined attribute. | _Catalog of N independent Effortless projects under rulebook-examples/. Each project's rulebook JSON is its own hub / durable SSoT, with input spokes (Airtable, LLM edits, admin portal) and a project-chosen subset of the platform's 15 substrates as output spokes. The platform itself is one such project (effortless-platform/) describing ERB._ |
| Entry Point | A defined attribute. | _./start.sh boots the admin portal (web UI) — local dev experience for any rulebook project_ |
| Portal URL | A defined attribute. | _http://localhost:7777 — admin portal served by run-web-portal.sh_ |
| Proxy URL | A defined attribute. | _http://localhost:4242 — ssotme-proxy serving substrate transpilers as HTTP routes_ |
| Repository Root | A defined attribute. | _effortlessly-invariant-rulesbooks/_ |
| Execution Substrates | A defined attribute. | _Reverse relationship: all ExecutionSubstrates rows of this project._ |
| Substrate Count | The number of execution substrates related to the project metadata. | _Order 1. Number of execution substrates._ |
| Fully Expressive Substrate Count | The total fully expressive flag across the execution substrates related to the project metadata. | _Order 2. Substrates with Expressive = full._ |
| Peer Complete Substrate Count | The total peer complete flag across the execution substrates related to the project metadata. | _Order 3. Substrates that are fully expressive and answer-key eligible._ |
| Ready Substrate Count | The total ready flag across the execution substrates related to the project metadata. | _Order 5. Substrates that are peer-complete, bus-reachable and cataloged._ |
| Peer Complete Percent | Determined by priority: 0 if the substrate count is 0; in all other cases, 100 times the peer complete substrate count divided by the substrate count rounded to 0 decimal place(s). | _Order 4. Percent of substrates that are peer-complete._ |
| **Execution Substrate** | Runtime environments that execute business rules derived from the rulebook | — |
| Name | A defined attribute. | _Human-readable substrate name_ |
| Technology | A defined attribute. | _Language/platform (PostgreSQL, Python, Go, Excel, OWL, PlantUML, etc.)_ |
| Relative Path | A defined attribute. | _Path within repo: execution-substrates/{technology}/_ |
| Injector Script | A defined attribute. | _Code generation script: inject-into-{technology}.py_ |
| Test Script | A defined attribute. | _Conformance test script: take-test.py_ |
| Transpiler Source | A defined attribute. | _licensed-effortless-tool \| local-injector \| external. WHO BUILT THE GENERATOR — provenance, not trustworthiness. Replaces the old IsProduction column. See FramingInvariants.framing-003._ |
| Maturity | A defined attribute. | _prototype \| demonstrating \| reference-quality — how complete THIS substrate's implementation is. Independent of TranspilerSource._ |
| Expressive Completeness | A defined attribute. | _full \| partial-aggregation \| partial-formula \| shape-only — which formula classes this substrate can faithfully evaluate. A factual property of the substrate engine._ |
| Can Be Answer Key | True when an empty string. | _Can serve as the oracle (SSoT) in a conformance run if the user designates it. True for any substrate whose output is fully witnessable. NOT an authority ranking — see ax-002._ |
| Determinism | A defined attribute. | _deterministic \| stochastic \| externally-influenced — pure-function reproducibility class of the substrate_ |
| Runtime Kind | A defined attribute. | _database \| spreadsheet \| binary \| text-emit \| graph \| docs — what kind of artifact this substrate produces / runs as_ |
| Status | A defined attribute. | _Operational status (active, proof-of-concept, deprecated). Lifecycle, not trustworthiness._ |
| Description | A defined attribute. | _Purpose and capabilities_ |
| Catalog Tools | A defined attribute. | _Reverse relationship: AddToolCatalog rows whose SubstrateId points here._ |
| Proxy Routes | A defined attribute. | _Reverse relationship: SsotmeProxy rows whose SubstrateId points here._ |
| Tradeoffs | A defined attribute. | _Reverse relationship: SubstrateTradeoffs rows whose SubstrateId points here._ |
| Project | A defined attribute. | _FK to ProjectMetadata — roots this catalog row to the platform row so repo-wide rollups exist on one dashboard record._ |
| Is Fully Expressive | True when the expressive completeness is “full”. | _Order 1. Substrate expresses every formula type (Expressive = full)._ |
| Fully Expressive Flag | Determined by priority: 1 if the expressive completeness is “full”; in all other cases, 0. | _Order 1. 1 when fully expressive — rollup carrier._ |
| Is Reference Quality | True when the maturity is “reference-quality”. | _Order 1. Maturity is reference-quality._ |
| Tradeoff Count | The number of substrate tradeoffs related to the execution substrate. | _Order 1. Tradeoff rows recorded for this substrate._ |
| Proxy Route Count | The number of ssotme proxy related to the execution substrate. | _Order 1. ssotme-proxy routes that produce this substrate._ |
| Catalog Tool Count | The number of add tool catalog related to the execution substrate. | _Order 1. Add-tool catalog entries targeting this substrate._ |
| Is Peer Complete | True when all of the following hold: the fully expressive flag is set and the can be answer key flag is set. | _Order 2. Fully expressive and eligible as an answer key — a peer-complete substrate._ |
| Peer Complete Flag | Determined by priority: 1 if all of the following hold: the fully expressive flag is set and the can be answer key flag is set; in all other cases, 0. | _Order 2. 1 when peer-complete — rollup carrier._ |
| Has Proxy Route | True when the proxy route count is greater than 0. | _Order 2. Reachable through the local transpiler bus._ |
| Is Cataloged | True when the catalog tool count is greater than 0. | _Order 2. Installable from the add-tool catalog._ |
| Is Bus Reachable Peer | True when all of the following hold: the peer complete flag is set and the proxy route flag is set. | _Order 3. Peer-complete and reachable on the local bus._ |
| Is Installable Peer | True when all of the following hold: the peer complete flag is set and the cataloged flag is set. | _Order 3. Peer-complete and installable from the catalog._ |
| Readiness Score | Computed as the count of the following that hold: the peer complete flag is set; the proxy route flag is set; and the cataloged flag is set. | _Order 3. Peer-complete + bus route + catalog entry (0-3)._ |
| Readiness Band | Determined by priority: “ready” if the readiness score is 3; “partial” if the readiness score is at least 1; in all other cases, “absent”. | _Order 4. ready / partial / absent._ |
| Ready Flag | Determined by priority: 1 if the readiness score is 3; in all other cases, 0. | _Order 4. 1 when ready — rollup carrier._ |
| Is Showcase Substrate | True when all of the following hold: the readiness band is “ready” and the reference quality flag is set. | _Order 5. Ready on every axis and reference-quality._ |
| **Orchestration Component** | Central orchestration logic that coordinates rulebook loading, injection, and testing | — |
| Name | A defined attribute. | — |
| File Path | A defined attribute. | _Relative path from repo root_ |
| Language | A defined attribute. | — |
| Purpose | A defined attribute. | — |
| Dependencies | A defined attribute. | _Comma-separated list of other components_ |
| Dependency Count | Determined by priority: 0 if the dependencies is blank; in all other cases, the length of the dependencies minus the length of the dependencies with every a comma replaced by an empty string plus 1. ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 1. Number of comma-separated dependencies listed (lossy parse of the Dependencies string)._ |
| Is Shell Script | True when the language is “Bash”. | _Order 1. Component is a Bash script._ |
| Dependency Band | Determined by priority: “leaf” if the dependency count is 0; “light” if the dependency count is at most 2; in all other cases, “heavy”. | _Order 2. leaf / light / heavy by dependency count._ |
| Is Heavy Shell | True when all of the following hold: the shell script flag is set and the dependency band is “heavy”. | _Order 3. Bash script with a heavy dependency fan-in._ |
| Review Priority | Determined by priority: “review” if the heavy shell flag is set; “watch” if the dependency band is “heavy”; in all other cases, “ok”. | _Order 4. review / watch / ok._ |
| Needs Review | True when the review priority is “review”. | _Order 5. Flagged for dependency review._ |
| **Ssotme Proxy** | Local HTTP transpiler server on localhost:4242. Each transpiler is an HTTP route; injectors are the route bodies. Used by `effortless build` to call substrate generators uniformly. | — |
| Name | The same as its route. | _Order 1. Display alias (calculated). Order 1._ |
| Route | A defined attribute. | _POST /{route-name}_ |
| Substrate ID | A defined attribute. | _FK to ExecutionSubstrates.SubstrateId_ |
| Injector Script | A defined attribute. | _Backing script that the route runs; null for upstream Effortless tools (e.g. airtable-to-rulebook)_ |
| Description | A defined attribute. | — |
| Http Method | Computed as the first the position of a space within the route minus 1 character(s) of the route. ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 1. HTTP verb parsed from the Route string._ |
| Route Path | Computed as the position of a space within the route plus 1 character(s) of the route starting at position 200. ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 1. Path portion of the Route string._ |
| Has Substrate | True when the substrate ID has a value. | _Order 1. Route is bound to an execution substrate._ |
| Is Post | True when the http method is “POST”. | _Order 2. Route is invoked with POST._ |
| Route Slug | Computed as the route path with every a slash replaced by an empty string. | _Order 2. Transpiler name (path without the leading slash)._ |
| Substrate is Fully Expressive | True when the linked substrate ID is fully expressive. | _Order 2. Whether the bound substrate is fully expressive._ |
| Is Full Bus Route | True when all of the following hold: the substrate flag is set and the substrate is fully expressive (a missing value counts as false). ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 3. Route produces a fully expressive substrate._ |
| Is Post Spoke | True when all of the following hold: the post flag is set and the substrate flag is not set. | _Order 3. POST route that is a hub spoke rather than a substrate._ |
| Route Class | Determined by priority: “full-substrate” if the full bus route flag is set; “partial-substrate” if the substrate flag is set; “spoke” if the post spoke flag is set; in all other cases, “other”. | _Order 4. full-substrate / partial-substrate / spoke / other._ |
| Is Bus Headline | True when the route class is “full-substrate”. | _Order 5. A route worth listing first in the bus section._ |
| **Testing Framework** | Conformance testing: prove all substrates compute identically | — |
| Name | A defined attribute. | — |
| File Path | A defined attribute. | — |
| Purpose | A defined attribute. | — |
| Scope | A defined attribute. | _global (all substrates) or per-substrate_ |
| Is Global | True when the scope is “global”. | _Order 1. Scope is global (not per-domain)._ |
| Is Glob Pattern | True when the length of the file path (a missing value counts as an empty string) is not the length of the file path (a missing value counts as an empty string) with every “*” replaced by an empty string. ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 1. FilePath is a glob rather than a single file._ |
| Is Global Glob | True when all of the following hold: the global flag is set and the glob pattern flag is set. | _Order 2. Global-scope component matched by glob._ |
| Scope Label | Determined by priority: “global-glob” if the global glob flag is set; “global-file” if the global flag is set; in all other cases, “domain”. | _Order 3. global-glob / global-file / domain._ |
| Is Domain Agnostic | True when the scope label is not “domain”. | _Order 4. Not bound to a single domain._ |
| Agnostic Label | Determined by priority: “domain-agnostic” if the domain agnostic flag is set; in all other cases, “domain-bound”. | _Order 5. domain-agnostic / domain-bound._ |
| **Core Data Flow** | End-to-end flows from rulebook to execution and testing | — |
| Name | A defined attribute. | — |
| Steps | A defined attribute. | _Pipe-delimited sequence of steps_ |
| Triggers | A defined attribute. | _When this flow runs_ |
| Outputs | A defined attribute. | _Artifacts produced_ |
| Invariant | A defined attribute. | _Hard rule the flow must preserve (e.g. write-through, SSoT precedence)_ |
| Step Count | Determined by priority: 0 if the steps is blank; in all other cases, the length of the steps minus the length of the steps with every “|” replaced by an empty string plus 1. ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 1. Number of pipe-separated steps._ |
| Has Invariant | True when the invariant has a value. | _Order 1. Flow states an invariant it preserves._ |
| Is Multi Step | True when the step count is greater than 1. | _Order 2. Flow has more than one step._ |
| Is Invariant Backed | True when all of the following hold: the invariant flag is set and the step count is greater than 0. | _Order 2. Has steps and states the invariant they preserve._ |
| Flow Maturity | Determined by priority: “pipeline” if the multi step flag is set, in all other cases “atomic” if the invariant backed flag is set; in all other cases, “undocumented”. | _Order 3. pipeline / atomic / undocumented._ |
| Is Pipeline | True when the flow maturity is “pipeline”. | _Order 4. Multi-step, invariant-backed flow._ |
| Flow Label | Determined by priority: the name, followed by “ [pipeline]” if the pipeline flag is set; in all other cases, the name. | _Order 5. Display label marking pipelines._ |
| **Project Configuration** | Configuration files and their purposes | — |
| Name | The same as its file name. | _Order 1. Display alias (calculated). Order 1._ |
| File Name | A defined attribute. | — |
| File Path | A defined attribute. | — |
| Format | A defined attribute. | — |
| Purpose | A defined attribute. | — |
| Maintained by | A defined attribute. | _human (manual edits) or tool (auto-generated)_ |
| Is Human Maintained | True when the maintained by is “human”. | _Order 1. File is hand-maintained rather than generated._ |
| Is JSON | True when the format is “JSON”. | _Order 1. File format is JSON._ |
| Is Human JSON | True when all of the following hold: the human maintained flag is set and the JSON flag is set. | _Order 2. Hand-maintained JSON config (the kind that drifts)._ |
| Drift Risk | Determined by priority: “high” if the human JSON flag is set; “medium” if the human maintained flag is set; in all other cases, “low”. | _Order 3. Likelihood the file drifts from the rulebook._ |
| Needs Guard | True when the drift risk is “high”. | _Order 4. Hand-maintained JSON that deserves a build-time validator._ |
| Guard Label | Determined by priority: “guard: validate on build” if the needs guard flag is set; in all other cases, “no guard needed”. | _Order 5. Recommended guard for the file._ |
| **Dependency** | External tools and their roles | — |
| Name | A defined attribute. | — |
| Version | A defined attribute. | — |
| Type | A defined attribute. | _Language, tool, service, or external API_ |
| Purpose | A defined attribute. | — |
| Required | True when an empty string. | — |
| Is Language | True when the type is “Language”. | _Order 1. Dependency is a language runtime._ |
| Required Flag | Determined by priority: 1 if the required flag is set; in all other cases, 0. | _Order 1. 1 when required — rollup carrier._ |
| Is Required Language | True when all of the following hold: the language flag is set and the required flag is set. | _Order 2. A language runtime the repo cannot run without._ |
| Criticality | Determined by priority: “core” if the required language flag is set; “required” if the required flag is set; in all other cases, “optional”. | _Order 3. core / required / optional._ |
| Is Core | True when the criticality is “core”. | _Order 4. Required language runtime._ |
| Bootstrap Tier | Determined by priority: “tier-0” if the core flag is set; “tier-1” if the required flag is set; in all other cases, “tier-2”. | _Order 5. tier-0 / tier-1 / tier-2 install order._ |
| **App User** | Default users for local development and conformance testing. Lives in the rulebook so it travels with the project; production deployments should overlay these with a real identity provider. | — |
| Name | The same as its display name. | _Order 1. Display alias (calculated). Order 1._ |
| Email | A defined attribute. | _Login identifier (no password in dev mode; presence in this list = authorized)_ |
| Display Name | A defined attribute. | — |
| Role ID | A defined attribute. | _FK to UserRoles.RoleId (Viewer or Developer)_ |
| Is Default | True when an empty string. | _True for the user the portal auto-selects on first boot_ |
| Notes | A defined attribute. | — |
| Email Domain | Computed as the position of “@” within the email plus 1 character(s) of the email starting at position 200. ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 1. Domain part of the email address._ |
| Role Name | Taken from the linked role ID. | _Order 1. Display name of the user's role._ |
| Role Access Level | Taken from the linked role ID. | _Order 1. Access level of the user's role._ |
| Is Placeholder Account | True when the email domain is “example.com”. | _Order 2. Email uses the example.com placeholder domain._ |
| Role Capability Score | Taken from the linked role ID. | _Order 2. Capability score of the user's role._ |
| Is Placeholder Power | True when all of the following hold: the placeholder account flag is set and the role capability score (a missing value counts as 0) is at least 4. | _Order 3. Placeholder account holding a power role._ |
| Account Risk | Determined by priority: “placeholder-power” if the placeholder power flag is set; “placeholder” if the placeholder account flag is set; in all other cases, “named”. | _Order 4. placeholder-power / placeholder / named._ |
| Needs Rotation | True when the account risk is “placeholder-power”. | _Order 5. Placeholder credentials on a power role should be replaced before exposure._ |
| **User Role** | Admin portal access tiers. Each role is a PERSONA with its own landing screen, tagline, and bespoke screen overrides (see RoleScreenHints). NOT a CRUD form — every role gets a UX shaped for what that person actually cares about. Also drives RLS policies that Postgres applies to portal writes. | — |
| Name | A defined attribute. | — |
| Persona | A defined attribute. | _One-line description of WHO this role is — the kind of person who logs in as this role_ |
| Tagline | A defined attribute. | _Short motto shown on the role's landing screen — sets the mood_ |
| Primary Concerns | A defined attribute. | _What this role spends time on. Comma-separated, used by the home screen to bubble these things up._ |
| Landing Screen ID | A defined attribute. | _Soft reference to AppScreens.ScreenId (the screen this role lands on after login). Deliberately NOT a relationship: AppScreens.MinRoleId already points AppScreens -> UserRoles, and a FK here would create a table-level cycle. The portal resolves it at read time._ |
| Color Theme | A defined attribute. | _CSS accent colour for the role's pill / chrome — quick visual identity_ |
| Access Level | A defined attribute. | _read \| write \| full-admin_ |
| Can Edit Rulebook | True when an empty string. | — |
| Can Run Builds | True when an empty string. | — |
| Can Access Tech Tools | True when an empty string. | _Tech Tools nest = raw Postgres explorer, ssotme-proxy logs, conformance internals_ |
| Can Switch Projects | True when an empty string. | — |
| Can Manage Users | True when an empty string. | — |
| Description | A defined attribute. | — |
| App Users | A defined attribute. | _Reverse relationship: AppUsers rows whose RoleId points here._ |
| App Permissions | A defined attribute. | _Reverse relationship: AppPermissions rows whose RoleId points here._ |
| Nav Nodes | A defined attribute. | _Reverse relationship: AppNavigation rows whose MinRoleId points here._ |
| App Screens | A defined attribute. | _Reverse relationship: AppScreens rows whose MinRoleId points here._ |
| User Count | The number of app users related to the user role. | _Order 1. Users assigned this role._ |
| Permission Count | The number of app permissions related to the user role. | _Order 1. Permission rows for this role._ |
| Screen Count | The number of app screens related to the user role. | _Order 1. Screens whose minimum role is this one._ |
| Nav Node Count | The number of app navigation related to the user role. | _Order 1. Navigation nodes gated at this role._ |
| Capability Score | Computed as the count of the following that hold: the can edit rulebook flag is set; the can run builds flag is set; the can access tech tools flag is set; the can switch projects flag is set; and the can manage users flag is set. | _Order 1. Count of the five Can* capabilities granted (0-5)._ |
| Has Users | True when the user count is greater than 0. | _Order 2. At least one user holds the role._ |
| Is Power Role | True when the capability score is at least 4. | _Order 2. Grants four or more of the five capabilities._ |
| Surface Count | Computed as the screen count plus the nav node count. | _Order 2. Screens plus nav nodes gated at this role._ |
| Unreachable Screen Count | The total unreachable flag across the app screens related to the user role. | _Order 3. Screens at this role no nav node opens._ |
| Is Active Power Role | True when all of the following hold: the power role flag is set and the users flag is set. | _Order 3. Power role with at least one holder._ |
| Reachability Percent | Determined by priority: 0 if the screen count is 0; in all other cases, 100 times the screen count minus the unreachable screen count divided by the screen count rounded to 0 decimal place(s). | _Order 4. Percent of this role's screens opened by some nav node._ |
| Is Fully Reachable | True when the reachability percent is 100. | _Order 5. Every screen at this role is opened by some nav node._ |
| Role Health | Determined by priority: “complete” if the reachability percent is 100; “mostly-reachable” if the reachability percent is at least 50; in all other cases, “gaps”. | _Order 5. complete / mostly-reachable / gaps._ |
| **App Permission** | RLS-style policy table: declarative per-role allow/deny on portal API endpoints and on Postgres tables. Generated into Postgres on portal bootstrap as RLS policies. | — |
| Name | Computed as the role ID, followed by “:”, followed by the resource, followed by “:”, followed by the action. | _Order 1. Display alias (calculated). Order 1._ |
| Role ID | A defined attribute. | _FK to UserRoles.RoleId_ |
| Resource | A defined attribute. | _Logical resource: rulebook.entity, rulebook.field, rulebook.formula, build, test, users, tech-tools.postgres, tech-tools.proxy_ |
| Action | A defined attribute. | _read \| create \| update \| delete \| execute_ |
| Allow | True when an empty string. | — |
| RLS Predicate | A defined attribute. | _Postgres RLS USING clause (when applicable); null for endpoint-only checks_ |
| Is Write | True when the action is not “read”. | _Order 1. Permission is for a non-read action._ |
| Is Row Scoped | True when all of the following hold: the RLS predicate has a value and the RLS predicate (a missing value counts as an empty string) is not “true”. | _Order 1. Carries a real RLS predicate (not blank, not the trivial true)._ |
| Allow Flag | Determined by priority: 1 if the allow flag is set; in all other cases, 0. | _Order 1. 1 when allowed — rollup carrier._ |
| Role Name | Taken from the linked role ID. | _Order 1. Display name of the role._ |
| Is Scoped Write | True when all of the following hold: the write flag is set and the row scoped flag is set. | _Order 2. Write permission constrained by an RLS predicate._ |
| Role Capability Score | Taken from the linked role ID. | _Order 2. Capability score of the role._ |
| Is Power Scoped Write | True when all of the following hold: the scoped write flag is set and the role capability score (a missing value counts as 0) is at least 4. | _Order 3. RLS-scoped write held by a power role._ |
| Permission Kind | Determined by priority: “scoped-write” if the scoped write flag is set; “open-write” if the write flag is set; in all other cases, “read”. | _Order 3. scoped-write / open-write / read._ |
| Governance Flag | Determined by priority: “rls-power” if the power scoped write flag is set; in all other cases, the permission kind. | _Order 4. rls-power or the permission kind._ |
| Is High Governance | True when the governance flag is “rls-power”. | _Order 5. RLS-scoped write on a power role — audit first._ |
| **App Navigation** | Primary navigation tree for the admin portal. Drives the left sidebar. Each node has a role gate and a target screen. This is the developer's narrative through a rulebook project. | — |
| Name | The same as its label. | _Order 1. Display alias (calculated). Order 1._ |
| Parent Nav ID | A defined attribute. | _FK to AppNavigation.NavId; null for top-level nodes_ |
| Label | A defined attribute. | — |
| Icon | A defined attribute. | _Lucide icon name_ |
| Screen ID | A defined attribute. | _FK to AppScreens.ScreenId; null for grouping-only nodes_ |
| Min Role ID | A defined attribute. | _FK to UserRoles.RoleId — minimum role required to see this node_ |
| Order | A defined attribute. | — |
| Story Beat | A defined attribute. | _What this node teaches the developer in the rulebook narrative_ |
| Nav Area | A defined attribute. | _Persona/area bucket: main (everyone), admin (CRUD ops), developer (build/test/tech), docs (educational/training). Drives sidebar section grouping and route prefix._ |
| Child Nav Nodes | A defined attribute. | _Reverse relationship: AppNavigation rows whose ParentNavId points here._ |
| Is Top Level | True when the parent nav ID is blank. | _Order 1. Node has no parent._ |
| Is Group Only | True when the screen ID is blank. | _Order 1. Node groups children and opens no screen._ |
| Child Count | The number of app navigation related to the app navigation. | _Order 1. Child navigation nodes._ |
| Screen Path | Taken from the linked screen ID. | _Order 1. Path of the screen this node opens._ |
| Is Leaf | True when the child count is 0. | _Order 2. Node has no children._ |
| Screen Depth | The path depth of the app navigation's screen ID. | _Order 2. Path depth of the opened screen._ |
| Parent is Top Level | True when the linked parent nav ID is a top level. | _Order 2. Whether the parent node is top-level._ |
| Is Second Level | True when all of the following hold: the top level flag is not set and the parent is top level (a missing value counts as false). ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 3. Direct child of a top-level node._ |
| Is Deep Leaf | True when all of the following hold: the leaf flag is set and the screen depth (a missing value counts as 0) is at least 3. | _Order 3. Leaf node opening a screen three or more levels deep._ |
| Nav Tier | Determined by priority: “root” if the top level flag is set; “section” if the second level flag is set; in all other cases, “leaf”. | _Order 4. root / section / leaf._ |
| Nav Label | Determined by priority: the nav tier, followed by “:deep-leaf” if the deep leaf flag is set; in all other cases, the nav tier. | _Order 5. Tier label marking deep leaves._ |
| **App Screen** | Every screen in the admin portal. Each screen names the entities it reads/writes, the role it requires, and the story it tells. | — |
| Name | The same as its title. | _Order 1. Display alias (calculated). Order 1._ |
| Path | A defined attribute. | _React Router path_ |
| Title | A defined attribute. | — |
| Reads Entities | A defined attribute. | _Comma-separated rulebook entities the screen reads_ |
| Writes Entities | A defined attribute. | _Comma-separated rulebook entities the screen mutates (developer-only)_ |
| Min Role ID | A defined attribute. | — |
| Layout | A defined attribute. | _split-detail \| list \| grid \| dashboard \| editor_ |
| Primary Action | A defined attribute. | — |
| Story | A defined attribute. | _What the developer learns / does on this screen_ |
| Nav Area | A defined attribute. | _Which persona area this screen belongs to. Drives route prefix and sidebar section._ |
| Description | A defined attribute. | _Free-text annotation for this row._ |
| Nav Nodes | A defined attribute. | _Reverse relationship: AppNavigation rows whose ScreenId points here._ |
| Path Depth | Computed as the length of the path minus the length of the path with every a slash replaced by an empty string. ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 1. Number of / separators in Path._ |
| Is Parameterized | True when the length of the path (a missing value counts as an empty string) is not the length of the path (a missing value counts as an empty string) with every “:” replaced by an empty string. ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 1. Path carries a :param segment._ |
| Nav Node Count | The number of app navigation related to the app screen. | _Order 1. Navigation nodes that open this screen._ |
| Min Role Name | Taken from the linked min role ID. | _Order 1. Display name of the minimum role._ |
| Is Reachable | True when the nav node count is greater than 0. | _Order 2. Some navigation node opens this screen._ |
| Unreachable Flag | Determined by priority: 1 if the nav node count is 0; in all other cases, 0. | _Order 2. 1 when no nav node opens it — rollup carrier._ |
| Role Reachability | The reachability percent of the app screen's min role ID. | _Order 5. Reachability of the screen's minimum role._ |
| Reachability State | Determined by priority: “deep-linked” if the parameterized flag is set, in all other cases “navigable” if the reachable flag is set; in all other cases, “orphan”. | _Order 3. deep-linked / navigable / orphan._ |
| Role Unreachable Count | The unreachable screen count of the app screen's min role ID. | _Order 4. Unreachable screens at the screen's minimum role._ |
| **App AP i** | Admin portal HTTP API surface. Express routes mounted by the portal backend. | — |
| Name | Computed as the method, followed by a space, followed by the path. | _Order 1. Display alias (calculated). Order 1._ |
| Method | A defined attribute. | — |
| Path | A defined attribute. | — |
| Resource | A defined attribute. | _Logical resource for permission check (matches AppPermissions.Resource)_ |
| Action | A defined attribute. | — |
| Writes Through | True when an empty string. | _True if the endpoint must write to BOTH Postgres and the rulebook JSON_ |
| Description | A defined attribute. | — |
| Is Mutation | True when the method is not “GET”. | _Order 1. Non-GET endpoint._ |
| Path Depth | Computed as the length of the path minus the length of the path with every a slash replaced by an empty string. ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 1. Number of / separators in Path._ |
| Is Parameterized | True when the length of the path (a missing value counts as an empty string) is not the length of the path (a missing value counts as an empty string) with every “:” replaced by an empty string. ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 1. Path carries a :param segment._ |
| Is Deep Mutation | True when all of the following hold: the mutation flag is set and the parameterized flag is set. | _Order 2. Mutation addressed to a specific resource id._ |
| Is Write Through Mutation | True when all of the following hold: the mutation flag is set and the writes through flag is set. | _Order 2. Mutation that writes through to the rulebook._ |
| Risk Class | Determined by priority: “targeted-write-through” if the deep mutation flag is set, in all other cases “bulk-write-through” if the write through mutation flag is set; “local-write” if the mutation flag is set; in all other cases, “read”. | _Order 3. Write-through risk classification._ |
| Is Bulk Write Through | True when the risk class is “bulk-write-through”. | _Order 4. Un-targeted mutation that writes through to the rulebook._ |
| Is Audit Target | True when all of the following hold: the bulk write through flag is set and the parameterized flag is not set. | _Order 5. Bulk write-through with no resource id — first audit target._ |
| **Add Tool Catalog** | Tools the developer can install into the active project via the Add Tool screen. Same catalog the `effortless -install` CLI consumes; the portal is just a thin UI over the CLI so behaviour stays canonical. | — |
| Name | A defined attribute. | — |
| Category | A defined attribute. | _substrate \| spoke-input \| spoke-output \| docs_ |
| Source | A defined attribute. | _local-proxy \| effortless-registry_ |
| Install URL | A defined attribute. | _URL passed to `effortless -install`_ |
| Output Path | A defined attribute. | _Default RelativePath under the project (e.g. /python, /golang)_ |
| Substrate ID | A defined attribute. | _FK to ExecutionSubstrates for code-gen tools_ |
| Description | A defined attribute. | — |
| Is Local Proxy | True when the source is “local-proxy”. | _Order 1. Tool is served by the local ssotme-proxy._ |
| Substrate Name | Taken from the linked substrate ID. | _Order 1. Name of the target substrate._ |
| Substrate Maturity | Taken from the linked substrate ID. | _Order 1. Maturity of the target substrate._ |
| Is Proxy Backed Reference | True when all of the following hold: the local proxy flag is set and the substrate maturity is “reference-quality”. | _Order 2. Local-proxy tool whose substrate is reference-quality._ |
| Substrate is Fully Expressive | True when the linked substrate ID is fully expressive. | _Order 2. Whether the substrate is fully expressive._ |
| Substrate is Peer Complete | True when the linked substrate ID is a peer complete. | _Order 3. Whether the substrate is peer-complete._ |
| Is Peer Complete Tool | True when all of the following hold: the substrate is fully expressive (a missing value counts as false) and the proxy backed reference flag is set. ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 3. Local-proxy tool for a fully expressive reference substrate._ |
| Tool Tier | Determined by priority: “tier-1” if the peer complete tool flag is set; “tier-2” if the substrate is peer complete (a missing value counts as false); in all other cases, “tier-3”. ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 4. tier-1 / tier-2 / tier-3._ |
| Is Recommended Install | True when all of the following hold: the tool tier is “tier-1” and the local proxy flag is set. | _Order 5. Tier-1 tool served by the local bus._ |
| **Build Pipeline** | The effortless.json contract that both the admin portal and the CLI consume. There is ONE pipeline definition per project; both surfaces are thin wrappers around `effortless build` so they stay in lockstep. | — |
| Name | The same as its aspect. | _Order 1. Display alias (calculated). Order 1._ |
| Aspect | A defined attribute. | — |
| Portal Location | A defined attribute. | _Where in the portal this aspect surfaces_ |
| Cli Equivalent | A defined attribute. | — |
| Authority | A defined attribute. | _File or system that holds the canonical state_ |
| Has Cli Equivalent | True when the cli equivalent has a value. | _Order 1. A CLI equivalent is documented for this portal aspect._ |
| Is Project Scoped | True when the length of the authority (a missing value counts as an empty string) is not the length of the authority (a missing value counts as an empty string) with every “{active-project}” replaced by an empty string. ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 1. Authority is resolved per active project._ |
| Is Cli Parity Gap | True when the cli equivalent flag is not set. | _Order 2. Portal-only aspect with no CLI equivalent (a PortalCliParity violation)._ |
| Is Scoped With Cli | True when all of the following hold: the project scoped flag is set and the cli equivalent flag is set. | _Order 2. Project-scoped and mirrored on the CLI._ |
| Parity State | Determined by priority: “portal-only” if the cli parity gap flag is set; “scoped-parity” if the scoped with cli flag is set; in all other cases, “global-parity”. | _Order 3. portal-only / scoped-parity / global-parity._ |
| Is Parity Violation | True when the parity state is “portal-only”. | _Order 4. Breaks the PortalCliParity claim._ |
| Parity Flag | Determined by priority: 0 if the parity violation flag is set; in all other cases, 1. | _Order 5. 1 when portal and CLI agree — rollup carrier._ |
| **Admin Portal Runtime** | Runtime processes that ./start.sh boots and supervises. | — |
| Name | A defined attribute. | — |
| Command | A defined attribute. | — |
| Port | A defined attribute. | — |
| Depends on | A defined attribute. | — |
| Auto Restart | True when an empty string. | — |
| Purpose | A defined attribute. | — |
| Has Dependency | True when the depends on has a value. | _Order 1. Process depends on another process._ |
| Dependency Count | Determined by priority: 0 if the depends on is blank; in all other cases, the length of the depends on minus the length of the depends on with every a comma replaced by an empty string plus 1. ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 1. Number of comma-separated processes it depends on._ |
| Is Root Process | True when the dependency flag is not set. | _Order 2. Starts without depending on another process._ |
| Is Resilient Leaf | True when all of the following hold: the auto restart flag is set and the dependency count is 0. | _Order 2. Auto-restarting and dependency-free._ |
| Process Role | Determined by priority: “resilient-root” if the auto restart flag is set, in all other cases “fragile-root” if the root process flag is set; in all other cases, “dependent”. | _Order 3. resilient-root / fragile-root / dependent._ |
| Is Fragile Root | True when the process role is “fragile-root”. | _Order 4. Root process without auto-restart._ |
| Is Supervised Root | True when all of the following hold: the fragile root flag is not set and the root process flag is set. | _Order 5. Root process that restarts itself._ |
| **Role Screen Hint** | Per-(role, screen) bespoke UX overrides. The base AppScreens row says WHAT the screen is; this table says HOW IT SHOULD FEEL FOR THIS ROLE. The hints are intentionally prescriptive enough that two different agents implementing the screen for the same role would land on the same flow. NOTE: role/screen ids predate the current 3-role model; reconciliation is an open finding (cr-15). | — |
| Name | Computed as the role ID, followed by “@”, followed by the screen ID. | _Order 1. Display alias (calculated). Order 1._ |
| Role ID | A defined attribute. | _Soft reference to UserRoles.RoleId. Kept raw: these hints were authored against an earlier five-persona / unprefixed-screen vocabulary (role-author, role-reviewer, role-ops, screen-home ...) that the current UserRoles/AppScreens rows do not contain. See ConsistencyFindings cr-15._ |
| Screen ID | A defined attribute. | _Soft reference to AppScreens.ScreenId. Kept raw: these hints were authored against an earlier five-persona / unprefixed-screen vocabulary (role-author, role-reviewer, role-ops, screen-home ...) that the current UserRoles/AppScreens rows do not contain. See ConsistencyFindings cr-15._ |
| Layout | A defined attribute. | _Override AppScreens.Layout for this role (e.g. Reviewer sees Tests as 'matrix-first', Ops sees Builds as 'last-build-banner')_ |
| Emphasis | A defined attribute. | _What this role wants to see first when they land here — the dominant visual element_ |
| Hide | A defined attribute. | _Comma-separated list of UI elements this role should not see on this screen_ |
| Primary Actions | A defined attribute. | _Comma-separated, the buttons that should be prominent for this role_ |
| Implementation Hints | A defined attribute. | _Prescriptive description of the screen for this role. Detailed enough that two agents building it would land on the same flow._ |
| Hidden Action Count | Determined by priority: 0 if the hide is blank; in all other cases, the length of the hide minus the length of the hide with every a comma replaced by an empty string plus 1. ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 1. Actions hidden for this role/screen._ |
| Primary Action Count | Determined by priority: 0 if the primary actions is blank; in all other cases, the length of the primary actions minus the length of the primary actions with every a comma replaced by an empty string plus 1. ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 1. Primary actions surfaced._ |
| Is Dashboard Layout | True when the layout is “dashboard”. | _Order 1. Layout hint is dashboard._ |
| Action Surface Count | Computed as the hidden action count plus the primary action count. | _Order 2. Total actions the hint governs._ |
| Is Restrictive Hint | True when the hidden action count is greater than the primary action count. | _Order 2. Hides more than it surfaces._ |
| Hint Style | Determined by priority: “restrictive” if the restrictive hint flag is set; “neutral” if the action surface count is 0; in all other cases, “additive”. | _Order 3. restrictive / neutral / additive._ |
| Is Restrictive Dashboard | True when all of the following hold: the hint style is “restrictive” and the dashboard layout flag is set. | _Order 4. Dashboard that hides more than it shows._ |
| Hint Priority | Determined by priority: “high” if the restrictive dashboard flag is set; in all other cases, “normal”. | _Order 5. high / normal._ |
| **Click Target** | Canonical in-app navigation affordances. Every clickable element in the portal should be listed here with where the click goes. Two agents implementing different screens would both consult this table to wire up cross-screen jumps. NOT the Explain-DAG — this is page-to-page navigation: 'Orders: 5' is clickable and goes to a page filtered to those 5 orders. NOT documentation-style 'learn more' links. | — |
| Name | Computed as the from context, followed by “ -> ”, followed by the to path. | _Order 1. Display alias (calculated). Order 1._ |
| From Kind | A defined attribute. | _What you're clicking on — entity-row,field-row,formula-cell,substrate-row,test-cell,role-pill,user-row,nav-card,count-number,fk-value,flavor-tag,framing-invariant,axiom_ |
| From Context | A defined attribute. | _Where this click affordance lives — e.g. 'home-card:substrates' or 'entity-detail:fk-field'_ |
| To Path | A defined attribute. | _React-router-style path, with :param tokens that the caller fills in. e.g. /rulebook/entities/:entity?field=:field_ |
| Filter | A defined attribute. | _Query-string filter the target page should pre-apply_ |
| Story | A defined attribute. | _Plain-English: 'Click Orders: 5 → see those 5 orders'. Anchor for implementer._ |
| Is Domain Scoped | True when the length of the to path (a missing value counts as an empty string) is not the length of the to path (a missing value counts as an empty string) with every “:domain” replaced by an empty string. ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 1. Target path is parameterized by domain._ |
| Has Filter | True when the filter has a value. | _Order 1. Click applies a filter on arrival._ |
| Target Depth | Computed as the length of the to path minus the length of the to path with every a slash replaced by an empty string. ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 1. Number of / separators in the target path._ |
| Is Filtered Domain Jump | True when all of the following hold: the domain scoped flag is set and the filter flag is set. | _Order 2. Domain-scoped jump that also filters._ |
| Is Deep Target | True when the target depth is at least 3. | _Order 2. Lands three or more path levels deep._ |
| Jump Class | Determined by priority: “filtered-domain” if the filtered domain jump flag is set; “deep” if the deep target flag is set; “domain” if the domain scoped flag is set; in all other cases, “global”. | _Order 3. filtered-domain / deep / domain / global._ |
| Is Precision Jump | True when the jump class is “filtered-domain”. | _Order 4. Domain-scoped and filtered on arrival._ |
| Is Showcase Jump | True when all of the following hold: the precision jump flag is set and the deep target flag is set. | _Order 5. Precision jump landing deep in the app._ |
| **Substrate Contract Phas** | The three-phase contract every execution substrate implements. Inject is structural (schema → SDK), Execute is functional (compute), Grade is comparison. All three are 100% domain-agnostic — they translate whatever the rulebook defines without knowing what it means. Together with EvaluationSteps (the substeps within each phase) and EvaluationArtifacts (the JSON files that flow between phases), this forms the full evaluation subgraph: Phase → Steps → Artifacts. | — |
| Order | A defined attribute. | — |
| Name | A defined attribute. | — |
| Domain Agnostic | True when an empty string. | _Whether this phase's code is generic across all rulebooks. All three are true by design._ |
| Input | A defined attribute. | — |
| Output | A defined attribute. | — |
| Script Pattern | A defined attribute. | _Filename pattern under each execution-substrates/<technology>/ folder._ |
| Description | A defined attribute. | — |
| Why Domain Agnostic | A defined attribute. | _Explains how this phase remains generic — i.e. what it must NOT contain._ |
| Input Artifact ID | A defined attribute. | _FK to EvaluationArtifacts.ArtifactId — the canonical input artifact this phase consumes. [Soft reference to EvaluationArtifacts.ArtifactId; kept raw because EvaluationArtifacts.Produced/ConsumedByPhaseId already point artifacts -> phases and a FK here would create a table-level cycle.]_ |
| Output Artifact ID | A defined attribute. | _FK to EvaluationArtifacts.ArtifactId — the canonical output artifact this phase produces. [Soft reference to EvaluationArtifacts.ArtifactId; kept raw because EvaluationArtifacts.Produced/ConsumedByPhaseId already point artifacts -> phases and a FK here would create a table-level cycle.]_ |
| Failure Mode | A defined attribute. | _What going wrong in this phase actually looks like — e.g. injector emits a domain word, execute calls a hand-written helper, grader hides field-level disagreement._ |
| Evaluation Steps | A defined attribute. | _Reverse relationship: EvaluationSteps rows whose PhaseId points here._ |
| Produced Artifacts | A defined attribute. | _Reverse relationship: EvaluationArtifacts rows whose ProducedByPhaseId points here._ |
| Consumed Artifacts | A defined attribute. | _Reverse relationship: EvaluationArtifacts rows whose ConsumedByPhaseId points here._ |
| Step Count | The number of evaluation steps related to the substrate contract phas. | _Order 1. Evaluation steps in this phase._ |
| Produced Artifact Count | The number of evaluation artifacts related to the substrate contract phas. | _Order 1. Artifacts produced by this phase._ |
| Consumed Artifact Count | The number of evaluation artifacts related to the substrate contract phas. | _Order 1. Artifacts consumed by this phase._ |
| Is First Phase | True when the order is 1. | _Order 1. First phase of the contract._ |
| Is Productive | True when the produced artifact count is greater than 0. | _Order 2. Produces at least one artifact._ |
| Artifact Throughput | Computed as the produced artifact count plus the consumed artifact count. | _Order 2. Artifacts touched by the phase._ |
| Has Steps | True when the step count is greater than 0. | _Order 2. Phase is decomposed into evaluation steps._ |
| Is Fully Modeled | True when all of the following hold: the productive flag is set and the steps flag is set. | _Order 3. Produces artifacts and is decomposed into steps._ |
| Throughput Per Step | Determined by priority: 0 if the step count is 0; in all other cases, the artifact throughput divided by the step count rounded to 2 decimal place(s). | _Order 3. Artifacts touched per step._ |
| Phase Health | Determined by priority: “dense” if the throughput per step is at least 1, in all other cases “modeled” if the fully modeled flag is set; in all other cases, “sparse”. | _Order 4. dense / modeled / sparse._ |
| Is Dense Phase | True when the phase health is “dense”. | _Order 5. Fully modeled with at least one artifact per step._ |
| **Evaluation Step** | Substeps within each SubstrateContractPhase. Inject, Execute, and Grade each decompose into a small number of concrete substeps the orchestrator executes in order. This is the layer below SubstrateContractPhases — it answers 'what specifically happens inside phase-execute?' Used by the admin portal's Tests screen to render the actual stages a substrate run goes through. | — |
| Phase ID | A defined attribute. | _FK to SubstrateContractPhases.PhaseId._ |
| Order | A defined attribute. | _Order within the parent phase._ |
| Name | A defined attribute. | — |
| Description | A defined attribute. | — |
| Mechanism | A defined attribute. | _The actual code path — script file, function, or pipeline stage._ |
| Invariant | A defined attribute. | _A rule this step must preserve to remain domain-agnostic / conformance-preserving._ |
| Phase Name | Taken from the linked phase ID. | _Order 1. Name of the owning phase._ |
| Phase Order | Taken from the linked phase ID. | _Order 1. Order of the owning phase._ |
| Is First Step | True when the order is 1. | _Order 1. First step within its phase._ |
| Phase Step Count | Taken from the linked phase ID. | _Order 2. How many steps the owning phase has._ |
| Is in First Phase | True when the phase order is 1. | _Order 2. Belongs to the first contract phase._ |
| Is Last Step | True when the order is the phase step count (a missing value counts as 0). | _Order 3. Final step of its phase._ |
| Position Percent | Determined by priority: 0 if the phase step count (a missing value counts as 0) is 0; in all other cases, 100 times the order divided by the phase step count rounded to 0 decimal place(s). | _Order 3. Position within the phase as a percent._ |
| Step Role | Determined by priority: “entry” if the first step flag is set; “exit” if the last step flag is set; in all other cases, “middle”. | _Order 4. entry / exit / middle._ |
| Is Boundary Step | True when the step role is not “middle”. | _Order 5. Entry or exit step of its phase._ |
| **Evaluation Artifact** | The JSON / Markdown files that flow between SubstrateContractPhases. Each artifact is a contract: a file with a known schema produced by one phase and consumed by the next. This table is the artifact registry — what each file IS, where it lives, who writes it, who reads it. Together with SubstrateContractPhases.InputArtifactId/OutputArtifactId, this gives the evaluation pipeline a fully-witnessed data-flow graph. | — |
| Name | A defined attribute. | — |
| Format | A defined attribute. | _json \| markdown \| html \| binary \| source-tree_ |
| Path Pattern | A defined attribute. | _Where the artifact lives on disk, with <placeholders> for variable parts._ |
| Produced by Phase ID | A defined attribute. | _FK to SubstrateContractPhases.PhaseId — the phase that writes this artifact. Null for inputs that come from outside the evaluation pipeline (e.g. the rulebook itself)._ |
| Consumed by Phase ID | A defined attribute. | _FK to SubstrateContractPhases.PhaseId — the phase that reads this artifact. Null for terminal outputs (e.g. the human-facing report)._ |
| Derived From | A defined attribute. | _Plain-text description of how this artifact is derived — important for proving no substrate is privileged._ |
| Description | A defined attribute. | — |
| Is Source Artifact | True when the produced by phase ID is blank. | _Order 1. Not produced by any phase (an input to the contract)._ |
| Is JSON | True when the format is “json”. | _Order 1. Artifact format is JSON._ |
| Producer Phase Name | Taken from the linked produced by phase ID. | _Order 1. Producing phase name._ |
| Consumer Phase Name | Taken from the linked consumed by phase ID. | _Order 1. Consuming phase name._ |
| Producer Step Count | Taken from the linked produced by phase ID. | _Order 2. Steps in the producing phase._ |
| Is JSON Source | True when all of the following hold: the source artifact flag is set and the JSON flag is set. | _Order 2. A JSON input to the contract._ |
| Producer is Productive | True when the linked produced by phase ID is productive. | _Order 3. Whether the producing phase is productive._ |
| Is Pipeline Handoff | True when all of the following hold: the JSON source flag is not set and the producer step count (a missing value counts as 0) is greater than 0. | _Order 3. Produced by a decomposed phase and passed onward._ |
| Artifact Role | Determined by priority: “seed” if the JSON source flag is set; “handoff” if the pipeline handoff flag is set; in all other cases, “terminal”. | _Order 4. seed / handoff / terminal._ |
| Is Seed Artifact | True when the artifact role is “seed”. | _Order 5. JSON input that seeds the contract._ |
| **Substrate Tradeoff Dimension** | The fixed taxonomy of dimensions used to characterize every substrate. Pro/con statements in SubstrateTradeoffs are scoped to one of these dimensions, so substrates can be compared apples-to-apples (e.g. 'who's fastest?' = filter SubstrateTradeoffs by DimensionId=dim-speed). Adding a dimension here means committing to fill it in for every substrate. | — |
| Name | A defined attribute. | — |
| Description | A defined attribute. | — |
| Order | A defined attribute. | _Display order in UI._ |
| Tradeoffs | A defined attribute. | _Reverse relationship: SubstrateTradeoffs rows whose DimensionId points here._ |
| Tradeoff Count | The number of substrate tradeoffs related to the substrate tradeoff dimension. | _Order 1. Tradeoff rows on this dimension._ |
| Has Tradeoffs | True when the tradeoff count is greater than 0. | _Order 2. At least one substrate is assessed on this dimension._ |
| Fully Expressive Tradeoff Count | The total substrate full flag across the substrate tradeoffs related to the substrate tradeoff dimension. | _Order 3. Tradeoffs on this dimension from fully expressive substrates._ |
| Full Coverage Percent | Determined by priority: 0 if the tradeoff count is 0; in all other cases, 100 times the fully expressive tradeoff count divided by the tradeoff count rounded to 0 decimal place(s). | _Order 4. Percent of tradeoffs on this dimension from fully expressive substrates._ |
| Is Fully Covered | True when the full coverage percent is 100. | _Order 5. Only fully expressive substrates are assessed here._ |
| **Substrate Tradeoff** | Per-(Substrate × Dimension) Pro/Con/Note. The same fixed dimension set (see SubstrateTradeoffDimensions) is applied to every substrate, so 'why pick Postgres over Python?' or 'why does English cost so much?' is answerable by filtering this table. NOT a ranking — see ax-002 (no privileged substrate). Each row records a factual property along one comparable axis. | — |
| Name | Computed as the substrate ID, followed by “:”, followed by the dimension ID. | _Order 1. Display alias (calculated). Order 1._ |
| Substrate ID | A defined attribute. | _FK to ExecutionSubstrates.SubstrateId._ |
| Dimension ID | A defined attribute. | _FK to SubstrateTradeoffDimensions.DimensionId._ |
| Pro | A defined attribute. | _What this substrate does WELL along this dimension. Null if neutral or weak._ |
| Con | A defined attribute. | _What this substrate does POORLY along this dimension. Null if neutral or strong._ |
| Note | A defined attribute. | _Additional context — e.g. quantitative observation, edge case, source of measurement._ |
| Substrate Name | Taken from the linked substrate ID. | _Order 1. Substrate name._ |
| Dimension Name | Taken from the linked dimension ID. | _Order 1. Dimension name._ |
| Dimension Order | Taken from the linked dimension ID. | _Order 1. Dimension display order._ |
| Has Note | True when the note has a value. | _Order 1. A qualifying note is recorded._ |
| Substrate is Fully Expressive | True when the linked substrate ID is fully expressive. | _Order 2. Whether the substrate is fully expressive._ |
| Substrate Full Flag | The fully expressive flag of the substrate tradeoff's substrate ID. | _Order 2. 1 when the substrate is fully expressive — rollup carrier._ |
| Dimension Tradeoff Count | Taken from the linked dimension ID. | _Order 2. How many tradeoffs share this dimension._ |
| Is Full Substrate Noted | True when all of the following hold: the substrate is fully expressive (a missing value counts as false) and the note flag is set. ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 3. Fully expressive substrate with a qualifying note._ |
| Dimension Full Count | The fully expressive tradeoff count of the substrate tradeoff's dimension ID. | _Order 4. Fully expressive entries sharing this dimension._ |
| Is Dominant Dimension Entry | True when all of the following hold: the substrate is fully expressive (a missing value counts as false) and the dimension full count (a missing value counts as 0) is at least 5. ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 5. Fully expressive entry on a dimension dominated by fully expressive substrates._ |
| **Fuzzy Grading Provider** | LLM providers usable for fuzzy grading of the English substrate — the ONLY non-deterministic substrate. All other substrates execute formulas deterministically; English requires an LLM to interpret prose into computed values. Use low temperature (0.1) for repeatability. | — |
| Name | A defined attribute. | — |
| Model | A defined attribute. | — |
| Env Var | A defined attribute. | _Environment variable holding the API key. Null for local providers._ |
| Determinism | A defined attribute. | _'non-deterministic' for all LLMs; low temperature reduces variance but does not eliminate it._ |
| Typical Accuracy | A defined attribute. | _Observed conformance on the English substrate against deterministic answer keys._ |
| Speed Relative to Deterministic | A defined attribute. | _Order-of-magnitude slowdown vs. a deterministic substrate like Python or Postgres._ |
| Local Runtime | True when an empty string. | _True if runnable without network._ |
| Notes | A defined attribute. | — |
| Is Deterministic | True when the determinism is “deterministic”. | _Order 1. Provider grades deterministically._ |
| Requires API Key | True when the env var has a value. | _Order 1. Provider needs an API key from the environment._ |
| Is Local Deterministic | True when all of the following hold: the local runtime flag is set and the deterministic flag is set. | _Order 2. Runs locally and deterministically._ |
| Is Cloud Keyed | True when all of the following hold: the local runtime flag is not set and the requires API key flag is set. | _Order 2. Remote provider gated by an API key._ |
| Provider Class | Determined by priority: “local-deterministic” if the local deterministic flag is set; “cloud-llm” if the cloud keyed flag is set; in all other cases, “other”. | _Order 3. local-deterministic / cloud-llm / other._ |
| Is Preferred Provider | True when the provider class is “local-deterministic”. | _Order 4. Local and deterministic — the preferred grader._ |
| Provider Label | Determined by priority: the name, followed by “ (preferred)” if the preferred provider flag is set; in all other cases, the name. | _Order 5. Display label marking the preferred grader._ |
| **Write Through Invariant** | The portal-vs-rulebook write-through invariant: Postgres is the live editor, JSON is the durable SSoT, every save writes to both. | — |
| Name | A defined attribute. | _Identifier for this narrative entry (single-row tables use 'primary')._ |
| Description | A defined attribute. | _The full narrative content for this concept._ |
| Description Length | Computed as the length of the description. | _Order 1. Character length of the narrative text._ |
| Is Substantive | True when the description length is at least 200. | _Order 2. Narrative is at least 200 characters (not a placeholder)._ |
| Narrative State | Determined by priority: “ready” if the substantive flag is set; in all other cases, “stub”. | _Order 3. ready / stub._ |
| Is Ready | True when the narrative state is “ready”. | _Order 4. Narrative is ready for publication._ |
| Section Label | Determined by priority: the name, followed by “ (ready)” if the ready flag is set; in all other cases, the name, followed by “ (stub)”. | _Order 5. Display label with readiness._ |
| **Portal Cli Parity** | The portal and the `./start.sh --cli` interface are peer interfaces to the same effortless.json pipeline; portal behaviour cannot drift from CLI behaviour. | — |
| Name | A defined attribute. | _Identifier for this narrative entry (single-row tables use 'primary')._ |
| Description | A defined attribute. | _The full narrative content for this concept._ |
| Description Length | Computed as the length of the description. | _Order 1. Character length of the narrative text._ |
| Is Substantive | True when the description length is at least 200. | _Order 2. Narrative is at least 200 characters (not a placeholder)._ |
| Narrative State | Determined by priority: “ready” if the substantive flag is set; in all other cases, “stub”. | _Order 3. ready / stub._ |
| Is Ready | True when the narrative state is “ready”. | _Order 4. Narrative is ready for publication._ |
| Section Label | Determined by priority: the name, followed by “ (ready)” if the ready flag is set; in all other cases, the name, followed by “ (stub)”. | _Order 5. Display label with readiness._ |
| **Bootstrap Story** | The cold-start story: from `git clone` to a running portal with a default user landing on Home. | — |
| Name | A defined attribute. | _Identifier for this narrative entry (single-row tables use 'primary')._ |
| Description | A defined attribute. | _The full narrative content for this concept._ |
| Description Length | Computed as the length of the description. | _Order 1. Character length of the narrative text._ |
| Is Substantive | True when the description length is at least 200. | _Order 2. Narrative is at least 200 characters (not a placeholder)._ |
| Narrative State | Determined by priority: “ready” if the substantive flag is set; in all other cases, “stub”. | _Order 3. ready / stub._ |
| Is Ready | True when the narrative state is “ready”. | _Order 4. Narrative is ready for publication._ |
| Section Label | Determined by priority: the name, followed by “ (ready)” if the ready flag is set; in all other cases, the name, followed by “ (stub)”. | _Order 5. Display label with readiness._ |
| **Developer Journey** | The intended developer path through the portal: Home → project → Rulebook → Substrates → Builds → Tests → Input Spokes → Users. | — |
| Name | A defined attribute. | _Identifier for this narrative entry (single-row tables use 'primary')._ |
| Description | A defined attribute. | _The full narrative content for this concept._ |
| Description Length | Computed as the length of the description. | _Order 1. Character length of the narrative text._ |
| Is Substantive | True when the description length is at least 200. | _Order 2. Narrative is at least 200 characters (not a placeholder)._ |
| Narrative State | Determined by priority: “ready” if the substantive flag is set; in all other cases, “stub”. | _Order 3. ready / stub._ |
| Is Ready | True when the narrative state is “ready”. | _Order 4. Narrative is ready for publication._ |
| Section Label | Determined by priority: the name, followed by “ (ready)” if the ready flag is set; in all other cases, the name, followed by “ (stub)”. | _Order 5. Display label with readiness._ |
| **Resilience Claim** | The resilience claim: dropping the Postgres editor at any time is safe, because `./start.sh` rebuilds it from JSON. | — |
| Name | A defined attribute. | _Identifier for this narrative entry (single-row tables use 'primary')._ |
| Description | A defined attribute. | _The full narrative content for this concept._ |
| Description Length | Computed as the length of the description. | _Order 1. Character length of the narrative text._ |
| Is Substantive | True when the description length is at least 200. | _Order 2. Narrative is at least 200 characters (not a placeholder)._ |
| Narrative State | Determined by priority: “ready” if the substantive flag is set; in all other cases, “stub”. | _Order 3. ready / stub._ |
| Is Ready | True when the narrative state is “ready”. | _Order 4. Narrative is ready for publication._ |
| Section Label | Determined by priority: the name, followed by “ (ready)” if the ready flag is set; in all other cases, the name, followed by “ (stub)”. | _Order 5. Display label with readiness._ |

## 2 Fact Types

- an **execution substrate** may reference one **add tool catalog**
- an **execution substrate** may reference one **ssotme proxy**
- an **execution substrate** may reference one **substrate tradeoff**
- an **execution substrate** references exactly one **project metadata**
- a **ssotme proxy** may reference one **execution substrate**
- an **app user** references exactly one **user role**
- a **user role** may reference one **app navigation**
- an **app permission** references exactly one **user role**
- an **app navigation** may reference one **app navigation**
- an **app navigation** may reference one **app screen**
- an **app navigation** references exactly one **user role**
- an **app screen** may reference one **user role**
- an **app screen** may reference one **app navigation**
- an **add tool catalog** may reference one **execution substrate**
- a **substrate contract phas** may reference one **evaluation artifact**
- an **evaluation step** references exactly one **substrate contract phas**
- an **evaluation artifact** may reference one **substrate contract phas**
- a **substrate tradeoff dimension** may reference one **substrate tradeoff**
- a **substrate tradeoff** references exactly one **execution substrate**
- a **substrate tradeoff** references exactly one **substrate tradeoff dimension**

## 3 Operative Rules

_Operative rules state what the business **obliges**, **prohibits**, or
advises (**should**). Structural rules come from required fields and foreign keys;
semantic rules come from the Constraints table, each keyed on a boolean the rulebook
already computes (cross-referenced as DR-N in the Definitional Rules below)._

### Structural Constraints (from the schema)

- A project metadata **must** have a name and a purpose.
- An execution substrate **must** reference exactly one project metadata as its project.
- An execution substrate **must** have a name, a technology, a relative path, an injector script, a transpiler source, a maturity, an expressive completeness, a determinism, and a runtime kind, and record whether it can be answer key.
- An orchestration component **must** have a name, a file path, a language, and a purpose.
- A ssotme proxy **must** have a route and a description.
- A testing framework **must** have a name, a file path, and a purpose.
- A core data flow **must** have a name and a steps.
- A project configuration **must** have a file name, a file path, a format, and a purpose.
- A dependency **must** have a name, a type, and a purpose, and record whether it is required.
- An app user **must** reference exactly one user role as its role ID.
- An app user **must** have an email and a display name, and record whether it is a default.
- A user role **must** have a name and an access level, and record whether it can edit rulebook, whether it can run builds, whether it can access tech tools, whether it can switch projects, and whether it can manage users.
- An app permission **must** reference exactly one user role as its role ID.
- An app permission **must** have a resource and an action, and record whether it is allow.
- An app navigation **must** reference exactly one user role as its min role ID.
- An app navigation **must** have a label and an order.
- An app screen **must** have a path and a title.
- An app AP i **must** have a method, a path, a resource, an action, and a description, and record whether it is writes through.
- An add tool catalog **must** have a name, a category, a source, an install URL, and a description.
- A build pipeline **must** have an aspect and an authority.
- An admin portal runtime **must** have a name, a command, and a purpose, and record whether it is auto restart.
- A role screen hint **must** have a role ID, a screen ID, an emphasis, and an implementation hints.
- A click target **must** have a from kind, a from context, a to path, and a story.
- A substrate contract phas **must** have an order, a name, an input, an output, and a description, and record whether it is domain agnostic.
- An evaluation step **must** reference exactly one substrate contract phas as its phase ID.
- An evaluation step **must** have an order, a name, and a description.
- An evaluation artifact **must** have a name, a format, a path pattern, and a description.
- A substrate tradeoff dimension **must** have a name, a description, and an order.
- A substrate tradeoff **must** reference exactly one execution substrate as its substrate ID.
- A substrate tradeoff **must** reference exactly one substrate tradeoff dimension as its dimension ID.
- A fuzzy grading provider **must** have a name, a model, and a determinism, and record whether it is local runtime.
- A write through invariant **must** have a name and a description.
- A portal cli parity **must** have a name and a description.
- A bootstrap story **must** have a name and a description.
- A developer journey **must** have a name and a description.
- A resilience claim **must** have a name and a description.

## 4 Definitional Rules

_All statements express truth in the business domain; they are neither
procedures nor imperatives. "iff" is avoided in favor of "only if" so a
one-directional necessity is not mistaken for an equivalence. A
**⚠︎ mechanical** chip marks a rule whose deterministic wording is faithful
but clunky — a flag for an optional downstream reword pass, not a defect._

| ID | Declarative rule |
|----|------------------|
| **DR-1 Substrate Count** | A project metadata's substrate count is the number of execution substrates related to the project metadata. |
| **DR-2 Fully Expressive Substrate Count** | A project metadata's fully expressive substrate count is the total fully expressive flag across the execution substrates related to the project metadata. |
| **DR-3 Peer Complete Substrate Count** | A project metadata's peer complete substrate count is the total peer complete flag across the execution substrates related to the project metadata. |
| **DR-4 Ready Substrate Count** | A project metadata's ready substrate count is the total ready flag across the execution substrates related to the project metadata. |
| **DR-5 Peer Complete Percent** | The project metadata's peer complete percent is determined by the following priority:<br>1. 0, if the substrate count is 0;<br>2. in all other cases, 100 times the peer complete substrate count divided by the substrate count rounded to 0 decimal place(s). |
| **DR-6 Is Fully Expressive** | An execution substrate is considered fully-expressive if the expressive completeness is “full”. |
| **DR-7 Fully Expressive Flag** | The execution substrate's fully expressive flag is determined by the following priority:<br>1. 1, if the expressive completeness is “full”;<br>2. in all other cases, 0. |
| **DR-8 Is Reference Quality** | An execution substrate is considered a reference quality if the maturity is “reference-quality”. |
| **DR-9 Tradeoff Count** | An execution substrate's tradeoff count is the number of substrate tradeoffs related to the execution substrate. |
| **DR-10 Proxy Route Count** | An execution substrate's proxy route count is the number of ssotme proxy related to the execution substrate. |
| **DR-11 Catalog Tool Count** | An execution substrate's catalog tool count is the number of add tool catalog related to the execution substrate. |
| **DR-12 Is Peer Complete** | An execution substrate is considered a peer complete if all of the following hold: the fully expressive flag is set and the can be answer key flag is set. |
| **DR-13 Peer Complete Flag** | The execution substrate's peer complete flag is determined by the following priority:<br>1. 1, if all of the following hold: the fully expressive flag is set and the can be answer key flag is set;<br>2. in all other cases, 0. |
| **DR-14 Has Proxy Route** | An execution substrate is considered to have a proxy route if the proxy route count is greater than 0. |
| **DR-15 Is Cataloged** | An execution substrate is considered cataloged if the catalog tool count is greater than 0. |
| **DR-16 Is Bus Reachable Peer** | An execution substrate is considered a bus reachable peer if all of the following hold: the peer complete flag is set and the proxy route flag is set. |
| **DR-17 Is Installable Peer** | An execution substrate is considered an installable peer if all of the following hold: the peer complete flag is set and the cataloged flag is set. |
| **DR-18 Readiness Score** | An execution substrate's readiness score is computed as the count of the following that hold: the peer complete flag is set; the proxy route flag is set; and the cataloged flag is set. |
| **DR-19 Readiness Band** | The execution substrate's readiness band is determined by the following priority:<br>1. “ready”, if the readiness score is 3;<br>2. “partial”, if the readiness score is at least 1;<br>3. in all other cases, “absent”. |
| **DR-20 Ready Flag** | The execution substrate's ready flag is determined by the following priority:<br>1. 1, if the readiness score is 3;<br>2. in all other cases, 0. |
| **DR-21 Is Showcase Substrate** | An execution substrate is considered a showcase substrate if all of the following hold: the readiness band is “ready” and the reference quality flag is set. |
| **DR-22 Dependency Count** | The orchestration component's dependency count is determined by the following priority:<br>1. 0, if the dependencies is blank;<br>2. in all other cases, the length of the dependencies minus the length of the dependencies with every a comma replaced by an empty string plus 1. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-23 Is Shell Script** | An orchestration component is considered a shell script if the language is “Bash”. |
| **DR-24 Dependency Band** | The orchestration component's dependency band is determined by the following priority:<br>1. “leaf”, if the dependency count is 0;<br>2. “light”, if the dependency count is at most 2;<br>3. in all other cases, “heavy”. |
| **DR-25 Is Heavy Shell** | An orchestration component is considered a heavy shell if all of the following hold: the shell script flag is set and the dependency band is “heavy”. |
| **DR-26 Review Priority** | The orchestration component's review priority is determined by the following priority:<br>1. “review”, if the heavy shell flag is set;<br>2. “watch”, if the dependency band is “heavy”;<br>3. in all other cases, “ok”. |
| **DR-27 Needs Review** | An orchestration component is considered to need a review if the review priority is “review”. |
| **DR-28 Name** | A ssotme proxy's name is the same as its route. |
| **DR-29 Http Method** | A ssotme proxy's http method is computed as the first the position of a space within the route minus 1 character(s) of the route. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-30 Route Path** | A ssotme proxy's route path is computed as the position of a space within the route plus 1 character(s) of the route starting at position 200. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-31 Has Substrate** | A ssotme proxy is considered to have a substrate if the substrate ID has a value. |
| **DR-32 Is Post** | A ssotme proxy is considered a post if the http method is “POST”. |
| **DR-33 Route Slug** | A ssotme proxy's route slug is computed as the route path with every a slash replaced by an empty string. |
| **DR-34 Substrate is Fully Expressive** | A ssotme proxy's substrate is fully expressive when the linked substrate ID is fully expressive. |
| **DR-35 Is Full Bus Route** | A ssotme proxy is considered a full bus route if all of the following hold: the substrate flag is set and the substrate is fully expressive (a missing value counts as false). ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-36 Is Post Spoke** | A ssotme proxy is considered a post spoke if all of the following hold: the post flag is set and the substrate flag is not set. |
| **DR-37 Route Class** | The ssotme proxy's route class is determined by the following priority:<br>1. “full-substrate”, if the full bus route flag is set;<br>2. “partial-substrate”, if the substrate flag is set;<br>3. “spoke”, if the post spoke flag is set;<br>4. in all other cases, “other”. |
| **DR-38 Is Bus Headline** | A ssotme proxy is considered a bus headline if the route class is “full-substrate”. |
| **DR-39 Is Global** | A testing framework is considered a global if the scope is “global”. |
| **DR-40 Is Glob Pattern** | A testing framework is considered a glob pattern if the length of the file path (a missing value counts as an empty string) is not the length of the file path (a missing value counts as an empty string) with every “*” replaced by an empty string. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-41 Is Global Glob** | A testing framework is considered a global glob if all of the following hold: the global flag is set and the glob pattern flag is set. |
| **DR-42 Scope Label** | The testing framework's scope label is determined by the following priority:<br>1. “global-glob”, if the global glob flag is set;<br>2. “global-file”, if the global flag is set;<br>3. in all other cases, “domain”. |
| **DR-43 Is Domain Agnostic** | A testing framework is considered domain-agnostic if the scope label is not “domain”. |
| **DR-44 Agnostic Label** | The testing framework's agnostic label is determined by the following priority:<br>1. “domain-agnostic”, if the domain agnostic flag is set;<br>2. in all other cases, “domain-bound”. |
| **DR-45 Step Count** | The core data flow's step count is determined by the following priority:<br>1. 0, if the steps is blank;<br>2. in all other cases, the length of the steps minus the length of the steps with every “|” replaced by an empty string plus 1. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-46 Has Invariant** | A core data flow is considered to have an invariant if the invariant has a value. |
| **DR-47 Is Multi Step** | A core data flow is considered a multi step if the step count is greater than 1. |
| **DR-48 Is Invariant Backed** | A core data flow is considered invariant-backed if all of the following hold: the invariant flag is set and the step count is greater than 0. |
| **DR-49 Flow Maturity** | The core data flow's flow maturity is determined by the following priority:<br>1. “pipeline” if the multi step flag is set, in all other cases “atomic”, if the invariant backed flag is set;<br>2. in all other cases, “undocumented”. |
| **DR-50 Is Pipeline** | A core data flow is considered a pipeline if the flow maturity is “pipeline”. |
| **DR-51 Flow Label** | The core data flow's flow label is determined by the following priority:<br>1. the name, followed by “ [pipeline]”, if the pipeline flag is set;<br>2. in all other cases, the name. |
| **DR-52 Name** | A project configuration's name is the same as its file name. |
| **DR-53 Is Human Maintained** | A project configuration is considered human-maintained if the maintained by is “human”. |
| **DR-54 Is JSON** | A project configuration is considered a JSON if the format is “JSON”. |
| **DR-55 Is Human JSON** | A project configuration is considered a human JSON if all of the following hold: the human maintained flag is set and the JSON flag is set. |
| **DR-56 Drift Risk** | The project configuration's drift risk is determined by the following priority:<br>1. “high”, if the human JSON flag is set;<br>2. “medium”, if the human maintained flag is set;<br>3. in all other cases, “low”. |
| **DR-57 Needs Guard** | A project configuration is considered to need a guard if the drift risk is “high”. |
| **DR-58 Guard Label** | The project configuration's guard label is determined by the following priority:<br>1. “guard: validate on build”, if the needs guard flag is set;<br>2. in all other cases, “no guard needed”. |
| **DR-59 Is Language** | A dependency is considered a language if the type is “Language”. |
| **DR-60 Required Flag** | The dependency's required flag is determined by the following priority:<br>1. 1, if the required flag is set;<br>2. in all other cases, 0. |
| **DR-61 Is Required Language** | A dependency is considered a required language if all of the following hold: the language flag is set and the required flag is set. |
| **DR-62 Criticality** | The dependency's criticality is determined by the following priority:<br>1. “core”, if the required language flag is set;<br>2. “required”, if the required flag is set;<br>3. in all other cases, “optional”. |
| **DR-63 Is Core** | A dependency is considered a core if the criticality is “core”. |
| **DR-64 Bootstrap Tier** | The dependency's bootstrap tier is determined by the following priority:<br>1. “tier-0”, if the core flag is set;<br>2. “tier-1”, if the required flag is set;<br>3. in all other cases, “tier-2”. |
| **DR-65 Name** | An app user's name is the same as its display name. |
| **DR-66 Email Domain** | An app user's email domain is computed as the position of “@” within the email plus 1 character(s) of the email starting at position 200. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-67 Role Name** | An app user's role name — taken from the linked role ID. |
| **DR-68 Role Access Level** | An app user's role access level — taken from the linked role ID. |
| **DR-69 Is Placeholder Account** | An app user is considered a placeholder account if the email domain is “example.com”. |
| **DR-70 Role Capability Score** | An app user's role capability score — taken from the linked role ID. |
| **DR-71 Is Placeholder Power** | An app user is considered a placeholder power if all of the following hold: the placeholder account flag is set and the role capability score (a missing value counts as 0) is at least 4. |
| **DR-72 Account Risk** | The app user's account risk is determined by the following priority:<br>1. “placeholder-power”, if the placeholder power flag is set;<br>2. “placeholder”, if the placeholder account flag is set;<br>3. in all other cases, “named”. |
| **DR-73 Needs Rotation** | An app user is considered to need a rotation if the account risk is “placeholder-power”. |
| **DR-74 User Count** | A user role's user count is the number of app users related to the user role. |
| **DR-75 Permission Count** | A user role's permission count is the number of app permissions related to the user role. |
| **DR-76 Screen Count** | A user role's screen count is the number of app screens related to the user role. |
| **DR-77 Nav Node Count** | A user role's nav node count is the number of app navigation related to the user role. |
| **DR-78 Capability Score** | A user role's capability score is computed as the count of the following that hold: the can edit rulebook flag is set; the can run builds flag is set; the can access tech tools flag is set; the can switch projects flag is set; and the can manage users flag is set. |
| **DR-79 Has Users** | A user role is considered to have an users if the user count is greater than 0. |
| **DR-80 Is Power Role** | A user role is considered a power role if the capability score is at least 4. |
| **DR-81 Surface Count** | A user role's surface count is computed as the screen count plus the nav node count. |
| **DR-82 Unreachable Screen Count** | A user role's unreachable screen count is the total unreachable flag across the app screens related to the user role. |
| **DR-83 Is Active Power Role** | A user role is considered an active power role if all of the following hold: the power role flag is set and the users flag is set. |
| **DR-84 Reachability Percent** | The user role's reachability percent is determined by the following priority:<br>1. 0, if the screen count is 0;<br>2. in all other cases, 100 times the screen count minus the unreachable screen count divided by the screen count rounded to 0 decimal place(s). |
| **DR-85 Is Fully Reachable** | A user role is considered fully-reachable if the reachability percent is 100. |
| **DR-86 Role Health** | The user role's role health is determined by the following priority:<br>1. “complete”, if the reachability percent is 100;<br>2. “mostly-reachable”, if the reachability percent is at least 50;<br>3. in all other cases, “gaps”. |
| **DR-87 Name** | An app permission's name is computed as the role ID, followed by “:”, followed by the resource, followed by “:”, followed by the action. |
| **DR-88 Is Write** | An app permission is considered a write if the action is not “read”. |
| **DR-89 Is Row Scoped** | An app permission is considered row-scoped if all of the following hold: the RLS predicate has a value and the RLS predicate (a missing value counts as an empty string) is not “true”. |
| **DR-90 Allow Flag** | The app permission's allow flag is determined by the following priority:<br>1. 1, if the allow flag is set;<br>2. in all other cases, 0. |
| **DR-91 Role Name** | An app permission's role name — taken from the linked role ID. |
| **DR-92 Is Scoped Write** | An app permission is considered a scoped write if all of the following hold: the write flag is set and the row scoped flag is set. |
| **DR-93 Role Capability Score** | An app permission's role capability score — taken from the linked role ID. |
| **DR-94 Is Power Scoped Write** | An app permission is considered a power scoped write if all of the following hold: the scoped write flag is set and the role capability score (a missing value counts as 0) is at least 4. |
| **DR-95 Permission Kind** | The app permission's permission kind is determined by the following priority:<br>1. “scoped-write”, if the scoped write flag is set;<br>2. “open-write”, if the write flag is set;<br>3. in all other cases, “read”. |
| **DR-96 Governance Flag** | The app permission's governance flag is determined by the following priority:<br>1. “rls-power”, if the power scoped write flag is set;<br>2. in all other cases, the permission kind. |
| **DR-97 Is High Governance** | An app permission is considered a high governance if the governance flag is “rls-power”. |
| **DR-98 Name** | An app navigation's name is the same as its label. |
| **DR-99 Is Top Level** | An app navigation is considered a top level if the parent nav ID is blank. |
| **DR-100 Is Group Only** | An app navigation is considered a group only if the screen ID is blank. |
| **DR-101 Child Count** | An app navigation's child count is the number of app navigation related to the app navigation. |
| **DR-102 Screen Path** | An app navigation's screen path — taken from the linked screen ID. |
| **DR-103 Is Leaf** | An app navigation is considered a leaf if the child count is 0. |
| **DR-104 Screen Depth** | An app navigation's screen depth is the path depth of the app navigation's screen ID. |
| **DR-105 Parent is Top Level** | An app navigation's parent is top level when the linked parent nav ID is a top level. |
| **DR-106 Is Second Level** | An app navigation is considered a second level if all of the following hold: the top level flag is not set and the parent is top level (a missing value counts as false). ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-107 Is Deep Leaf** | An app navigation is considered a deep leaf if all of the following hold: the leaf flag is set and the screen depth (a missing value counts as 0) is at least 3. |
| **DR-108 Nav Tier** | The app navigation's nav tier is determined by the following priority:<br>1. “root”, if the top level flag is set;<br>2. “section”, if the second level flag is set;<br>3. in all other cases, “leaf”. |
| **DR-109 Nav Label** | The app navigation's nav label is determined by the following priority:<br>1. the nav tier, followed by “:deep-leaf”, if the deep leaf flag is set;<br>2. in all other cases, the nav tier. |
| **DR-110 Name** | An app screen's name is the same as its title. |
| **DR-111 Path Depth** | An app screen's path depth is computed as the length of the path minus the length of the path with every a slash replaced by an empty string. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-112 Is Parameterized** | An app screen is considered parameterized if the length of the path (a missing value counts as an empty string) is not the length of the path (a missing value counts as an empty string) with every “:” replaced by an empty string. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-113 Nav Node Count** | An app screen's nav node count is the number of app navigation related to the app screen. |
| **DR-114 Min Role Name** | An app screen's min role name — taken from the linked min role ID. |
| **DR-115 Is Reachable** | An app screen is considered reachable if the nav node count is greater than 0. |
| **DR-116 Unreachable Flag** | The app screen's unreachable flag is determined by the following priority:<br>1. 1, if the nav node count is 0;<br>2. in all other cases, 0. |
| **DR-117 Role Reachability** | An app screen's role reachability is the reachability percent of the app screen's min role ID. |
| **DR-118 Reachability State** | The app screen's reachability state is determined by the following priority:<br>1. “deep-linked” if the parameterized flag is set, in all other cases “navigable”, if the reachable flag is set;<br>2. in all other cases, “orphan”. |
| **DR-119 Role Unreachable Count** | An app screen's role unreachable count is the unreachable screen count of the app screen's min role ID. |
| **DR-120 Name** | An app AP i's name is computed as the method, followed by a space, followed by the path. |
| **DR-121 Is Mutation** | An app AP i is considered a mutation if the method is not “GET”. |
| **DR-122 Path Depth** | An app AP i's path depth is computed as the length of the path minus the length of the path with every a slash replaced by an empty string. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-123 Is Parameterized** | An app AP i is considered parameterized if the length of the path (a missing value counts as an empty string) is not the length of the path (a missing value counts as an empty string) with every “:” replaced by an empty string. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-124 Is Deep Mutation** | An app AP i is considered a deep mutation if all of the following hold: the mutation flag is set and the parameterized flag is set. |
| **DR-125 Is Write Through Mutation** | An app AP i is considered a write through mutation if all of the following hold: the mutation flag is set and the writes through flag is set. |
| **DR-126 Risk Class** | The app AP i's risk class is determined by the following priority:<br>1. “targeted-write-through” if the deep mutation flag is set, in all other cases “bulk-write-through”, if the write through mutation flag is set;<br>2. “local-write”, if the mutation flag is set;<br>3. in all other cases, “read”. |
| **DR-127 Is Bulk Write Through** | An app AP i is considered a bulk write through if the risk class is “bulk-write-through”. |
| **DR-128 Is Audit Target** | An app AP i is considered an audit target if all of the following hold: the bulk write through flag is set and the parameterized flag is not set. |
| **DR-129 Is Local Proxy** | An add tool catalog is considered a local proxy if the source is “local-proxy”. |
| **DR-130 Substrate Name** | An add tool catalog's substrate name — taken from the linked substrate ID. |
| **DR-131 Substrate Maturity** | An add tool catalog's substrate maturity — taken from the linked substrate ID. |
| **DR-132 Is Proxy Backed Reference** | An add tool catalog is considered a proxy backed reference if all of the following hold: the local proxy flag is set and the substrate maturity is “reference-quality”. |
| **DR-133 Substrate is Fully Expressive** | An add tool catalog's substrate is fully expressive when the linked substrate ID is fully expressive. |
| **DR-134 Substrate is Peer Complete** | An add tool catalog's substrate is peer complete when the linked substrate ID is a peer complete. |
| **DR-135 Is Peer Complete Tool** | An add tool catalog is considered a peer complete tool if all of the following hold: the substrate is fully expressive (a missing value counts as false) and the proxy backed reference flag is set. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-136 Tool Tier** | The add tool catalog's tool tier is determined by the following priority:<br>1. “tier-1”, if the peer complete tool flag is set;<br>2. “tier-2”, if the substrate is peer complete (a missing value counts as false);<br>3. in all other cases, “tier-3”. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-137 Is Recommended Install** | An add tool catalog is considered a recommended install if all of the following hold: the tool tier is “tier-1” and the local proxy flag is set. |
| **DR-138 Name** | A build pipeline's name is the same as its aspect. |
| **DR-139 Has Cli Equivalent** | A build pipeline is considered to have a cli equivalent if the cli equivalent has a value. |
| **DR-140 Is Project Scoped** | A build pipeline is considered project-scoped if the length of the authority (a missing value counts as an empty string) is not the length of the authority (a missing value counts as an empty string) with every “{active-project}” replaced by an empty string. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-141 Is Cli Parity Gap** | A build pipeline is considered a cli parity gap if the cli equivalent flag is not set. |
| **DR-142 Is Scoped With Cli** | A build pipeline is considered a scoped with cli if all of the following hold: the project scoped flag is set and the cli equivalent flag is set. |
| **DR-143 Parity State** | The build pipeline's parity state is determined by the following priority:<br>1. “portal-only”, if the cli parity gap flag is set;<br>2. “scoped-parity”, if the scoped with cli flag is set;<br>3. in all other cases, “global-parity”. |
| **DR-144 Is Parity Violation** | A build pipeline is considered a parity violation if the parity state is “portal-only”. |
| **DR-145 Parity Flag** | The build pipeline's parity flag is determined by the following priority:<br>1. 0, if the parity violation flag is set;<br>2. in all other cases, 1. |
| **DR-146 Has Dependency** | An admin portal runtime is considered to have a dependency if the depends on has a value. |
| **DR-147 Dependency Count** | The admin portal runtime's dependency count is determined by the following priority:<br>1. 0, if the depends on is blank;<br>2. in all other cases, the length of the depends on minus the length of the depends on with every a comma replaced by an empty string plus 1. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-148 Is Root Process** | An admin portal runtime is considered a root process if the dependency flag is not set. |
| **DR-149 Is Resilient Leaf** | An admin portal runtime is considered a resilient leaf if all of the following hold: the auto restart flag is set and the dependency count is 0. |
| **DR-150 Process Role** | The admin portal runtime's process role is determined by the following priority:<br>1. “resilient-root” if the auto restart flag is set, in all other cases “fragile-root”, if the root process flag is set;<br>2. in all other cases, “dependent”. |
| **DR-151 Is Fragile Root** | An admin portal runtime is considered a fragile root if the process role is “fragile-root”. |
| **DR-152 Is Supervised Root** | An admin portal runtime is considered a supervised root if all of the following hold: the fragile root flag is not set and the root process flag is set. |
| **DR-153 Name** | A role screen hint's name is computed as the role ID, followed by “@”, followed by the screen ID. |
| **DR-154 Hidden Action Count** | The role screen hint's hidden action count is determined by the following priority:<br>1. 0, if the hide is blank;<br>2. in all other cases, the length of the hide minus the length of the hide with every a comma replaced by an empty string plus 1. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-155 Primary Action Count** | The role screen hint's primary action count is determined by the following priority:<br>1. 0, if the primary actions is blank;<br>2. in all other cases, the length of the primary actions minus the length of the primary actions with every a comma replaced by an empty string plus 1. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-156 Is Dashboard Layout** | A role screen hint is considered a dashboard layout if the layout is “dashboard”. |
| **DR-157 Action Surface Count** | A role screen hint's action surface count is computed as the hidden action count plus the primary action count. |
| **DR-158 Is Restrictive Hint** | A role screen hint is considered a restrictive hint if the hidden action count is greater than the primary action count. |
| **DR-159 Hint Style** | The role screen hint's hint style is determined by the following priority:<br>1. “restrictive”, if the restrictive hint flag is set;<br>2. “neutral”, if the action surface count is 0;<br>3. in all other cases, “additive”. |
| **DR-160 Is Restrictive Dashboard** | A role screen hint is considered a restrictive dashboard if all of the following hold: the hint style is “restrictive” and the dashboard layout flag is set. |
| **DR-161 Hint Priority** | The role screen hint's hint priority is determined by the following priority:<br>1. “high”, if the restrictive dashboard flag is set;<br>2. in all other cases, “normal”. |
| **DR-162 Name** | A click target's name is computed as the from context, followed by “ -> ”, followed by the to path. |
| **DR-163 Is Domain Scoped** | A click target is considered domain-scoped if the length of the to path (a missing value counts as an empty string) is not the length of the to path (a missing value counts as an empty string) with every “:domain” replaced by an empty string. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-164 Has Filter** | A click target is considered to have a filter if the filter has a value. |
| **DR-165 Target Depth** | A click target's target depth is computed as the length of the to path minus the length of the to path with every a slash replaced by an empty string. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-166 Is Filtered Domain Jump** | A click target is considered a filtered domain jump if all of the following hold: the domain scoped flag is set and the filter flag is set. |
| **DR-167 Is Deep Target** | A click target is considered a deep target if the target depth is at least 3. |
| **DR-168 Jump Class** | The click target's jump class is determined by the following priority:<br>1. “filtered-domain”, if the filtered domain jump flag is set;<br>2. “deep”, if the deep target flag is set;<br>3. “domain”, if the domain scoped flag is set;<br>4. in all other cases, “global”. |
| **DR-169 Is Precision Jump** | A click target is considered a precision jump if the jump class is “filtered-domain”. |
| **DR-170 Is Showcase Jump** | A click target is considered a showcase jump if all of the following hold: the precision jump flag is set and the deep target flag is set. |
| **DR-171 Step Count** | A substrate contract phas's step count is the number of evaluation steps related to the substrate contract phas. |
| **DR-172 Produced Artifact Count** | A substrate contract phas's produced artifact count is the number of evaluation artifacts related to the substrate contract phas. |
| **DR-173 Consumed Artifact Count** | A substrate contract phas's consumed artifact count is the number of evaluation artifacts related to the substrate contract phas. |
| **DR-174 Is First Phase** | A substrate contract phas is considered a first phase if the order is 1. |
| **DR-175 Is Productive** | A substrate contract phas is considered productive if the produced artifact count is greater than 0. |
| **DR-176 Artifact Throughput** | A substrate contract phas's artifact throughput is computed as the produced artifact count plus the consumed artifact count. |
| **DR-177 Has Steps** | A substrate contract phas is considered to have a steps if the step count is greater than 0. |
| **DR-178 Is Fully Modeled** | A substrate contract phas is considered fully-modeled if all of the following hold: the productive flag is set and the steps flag is set. |
| **DR-179 Throughput Per Step** | The substrate contract phas's throughput per step is determined by the following priority:<br>1. 0, if the step count is 0;<br>2. in all other cases, the artifact throughput divided by the step count rounded to 2 decimal place(s). |
| **DR-180 Phase Health** | The substrate contract phas's phase health is determined by the following priority:<br>1. “dense” if the throughput per step is at least 1, in all other cases “modeled”, if the fully modeled flag is set;<br>2. in all other cases, “sparse”. |
| **DR-181 Is Dense Phase** | A substrate contract phas is considered a dense phase if the phase health is “dense”. |
| **DR-182 Phase Name** | An evaluation step's phase name — taken from the linked phase ID. |
| **DR-183 Phase Order** | An evaluation step's phase order — taken from the linked phase ID. |
| **DR-184 Is First Step** | An evaluation step is considered a first step if the order is 1. |
| **DR-185 Phase Step Count** | An evaluation step's phase step count — taken from the linked phase ID. |
| **DR-186 Is in First Phase** | An evaluation step is considered in-first-phase if the phase order is 1. |
| **DR-187 Is Last Step** | An evaluation step is considered a last step if the order is the phase step count (a missing value counts as 0). |
| **DR-188 Position Percent** | The evaluation step's position percent is determined by the following priority:<br>1. 0, if the phase step count (a missing value counts as 0) is 0;<br>2. in all other cases, 100 times the order divided by the phase step count rounded to 0 decimal place(s). |
| **DR-189 Step Role** | The evaluation step's step role is determined by the following priority:<br>1. “entry”, if the first step flag is set;<br>2. “exit”, if the last step flag is set;<br>3. in all other cases, “middle”. |
| **DR-190 Is Boundary Step** | An evaluation step is considered a boundary step if the step role is not “middle”. |
| **DR-191 Is Source Artifact** | An evaluation artifact is considered a source artifact if the produced by phase ID is blank. |
| **DR-192 Is JSON** | An evaluation artifact is considered a JSON if the format is “json”. |
| **DR-193 Producer Phase Name** | An evaluation artifact's producer phase name — taken from the linked produced by phase ID. |
| **DR-194 Consumer Phase Name** | An evaluation artifact's consumer phase name — taken from the linked consumed by phase ID. |
| **DR-195 Producer Step Count** | An evaluation artifact's producer step count — taken from the linked produced by phase ID. |
| **DR-196 Is JSON Source** | An evaluation artifact is considered a JSON source if all of the following hold: the source artifact flag is set and the JSON flag is set. |
| **DR-197 Producer is Productive** | An evaluation artifact's producer is productive when the linked produced by phase ID is productive. |
| **DR-198 Is Pipeline Handoff** | An evaluation artifact is considered a pipeline handoff if all of the following hold: the JSON source flag is not set and the producer step count (a missing value counts as 0) is greater than 0. |
| **DR-199 Artifact Role** | The evaluation artifact's artifact role is determined by the following priority:<br>1. “seed”, if the JSON source flag is set;<br>2. “handoff”, if the pipeline handoff flag is set;<br>3. in all other cases, “terminal”. |
| **DR-200 Is Seed Artifact** | An evaluation artifact is considered a seed artifact if the artifact role is “seed”. |
| **DR-201 Tradeoff Count** | A substrate tradeoff dimension's tradeoff count is the number of substrate tradeoffs related to the substrate tradeoff dimension. |
| **DR-202 Has Tradeoffs** | A substrate tradeoff dimension is considered to have a tradeoffs if the tradeoff count is greater than 0. |
| **DR-203 Fully Expressive Tradeoff Count** | A substrate tradeoff dimension's fully expressive tradeoff count is the total substrate full flag across the substrate tradeoffs related to the substrate tradeoff dimension. |
| **DR-204 Full Coverage Percent** | The substrate tradeoff dimension's full coverage percent is determined by the following priority:<br>1. 0, if the tradeoff count is 0;<br>2. in all other cases, 100 times the fully expressive tradeoff count divided by the tradeoff count rounded to 0 decimal place(s). |
| **DR-205 Is Fully Covered** | A substrate tradeoff dimension is considered fully-covered if the full coverage percent is 100. |
| **DR-206 Name** | A substrate tradeoff's name is computed as the substrate ID, followed by “:”, followed by the dimension ID. |
| **DR-207 Substrate Name** | A substrate tradeoff's substrate name — taken from the linked substrate ID. |
| **DR-208 Dimension Name** | A substrate tradeoff's dimension name — taken from the linked dimension ID. |
| **DR-209 Dimension Order** | A substrate tradeoff's dimension order — taken from the linked dimension ID. |
| **DR-210 Has Note** | A substrate tradeoff is considered to have a note if the note has a value. |
| **DR-211 Substrate is Fully Expressive** | A substrate tradeoff's substrate is fully expressive when the linked substrate ID is fully expressive. |
| **DR-212 Substrate Full Flag** | A substrate tradeoff's substrate full flag is the fully expressive flag of the substrate tradeoff's substrate ID. |
| **DR-213 Dimension Tradeoff Count** | A substrate tradeoff's dimension tradeoff count — taken from the linked dimension ID. |
| **DR-214 Is Full Substrate Noted** | A substrate tradeoff is considered full-substrate-noted if all of the following hold: the substrate is fully expressive (a missing value counts as false) and the note flag is set. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-215 Dimension Full Count** | A substrate tradeoff's dimension full count is the fully expressive tradeoff count of the substrate tradeoff's dimension ID. |
| **DR-216 Is Dominant Dimension Entry** | A substrate tradeoff is considered a dominant dimension entry if all of the following hold: the substrate is fully expressive (a missing value counts as false) and the dimension full count (a missing value counts as 0) is at least 5. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-217 Is Deterministic** | A fuzzy grading provider is considered deterministic if the determinism is “deterministic”. |
| **DR-218 Requires API Key** | A fuzzy grading provider is considered to require an API key if the env var has a value. |
| **DR-219 Is Local Deterministic** | A fuzzy grading provider is considered local-deterministic if all of the following hold: the local runtime flag is set and the deterministic flag is set. |
| **DR-220 Is Cloud Keyed** | A fuzzy grading provider is considered cloud-keyed if all of the following hold: the local runtime flag is not set and the requires API key flag is set. |
| **DR-221 Provider Class** | The fuzzy grading provider's provider class is determined by the following priority:<br>1. “local-deterministic”, if the local deterministic flag is set;<br>2. “cloud-llm”, if the cloud keyed flag is set;<br>3. in all other cases, “other”. |
| **DR-222 Is Preferred Provider** | A fuzzy grading provider is considered a preferred provider if the provider class is “local-deterministic”. |
| **DR-223 Provider Label** | The fuzzy grading provider's provider label is determined by the following priority:<br>1. the name, followed by “ (preferred)”, if the preferred provider flag is set;<br>2. in all other cases, the name. |
| **DR-224 Description Length** | A write through invariant's description length is computed as the length of the description. |
| **DR-225 Is Substantive** | A write through invariant is considered substantive if the description length is at least 200. |
| **DR-226 Narrative State** | The write through invariant's narrative state is determined by the following priority:<br>1. “ready”, if the substantive flag is set;<br>2. in all other cases, “stub”. |
| **DR-227 Is Ready** | A write through invariant is considered a ready if the narrative state is “ready”. |
| **DR-228 Section Label** | The write through invariant's section label is determined by the following priority:<br>1. the name, followed by “ (ready)”, if the ready flag is set;<br>2. in all other cases, the name, followed by “ (stub)”. |
| **DR-229 Description Length** | A portal cli parity's description length is computed as the length of the description. |
| **DR-230 Is Substantive** | A portal cli parity is considered substantive if the description length is at least 200. |
| **DR-231 Narrative State** | The portal cli parity's narrative state is determined by the following priority:<br>1. “ready”, if the substantive flag is set;<br>2. in all other cases, “stub”. |
| **DR-232 Is Ready** | A portal cli parity is considered a ready if the narrative state is “ready”. |
| **DR-233 Section Label** | The portal cli parity's section label is determined by the following priority:<br>1. the name, followed by “ (ready)”, if the ready flag is set;<br>2. in all other cases, the name, followed by “ (stub)”. |
| **DR-234 Description Length** | A bootstrap story's description length is computed as the length of the description. |
| **DR-235 Is Substantive** | A bootstrap story is considered substantive if the description length is at least 200. |
| **DR-236 Narrative State** | The bootstrap story's narrative state is determined by the following priority:<br>1. “ready”, if the substantive flag is set;<br>2. in all other cases, “stub”. |
| **DR-237 Is Ready** | A bootstrap story is considered a ready if the narrative state is “ready”. |
| **DR-238 Section Label** | The bootstrap story's section label is determined by the following priority:<br>1. the name, followed by “ (ready)”, if the ready flag is set;<br>2. in all other cases, the name, followed by “ (stub)”. |
| **DR-239 Description Length** | A developer journey's description length is computed as the length of the description. |
| **DR-240 Is Substantive** | A developer journey is considered substantive if the description length is at least 200. |
| **DR-241 Narrative State** | The developer journey's narrative state is determined by the following priority:<br>1. “ready”, if the substantive flag is set;<br>2. in all other cases, “stub”. |
| **DR-242 Is Ready** | A developer journey is considered a ready if the narrative state is “ready”. |
| **DR-243 Section Label** | The developer journey's section label is determined by the following priority:<br>1. the name, followed by “ (ready)”, if the ready flag is set;<br>2. in all other cases, the name, followed by “ (stub)”. |
| **DR-244 Description Length** | A resilience claim's description length is computed as the length of the description. |
| **DR-245 Is Substantive** | A resilience claim is considered substantive if the description length is at least 200. |
| **DR-246 Narrative State** | The resilience claim's narrative state is determined by the following priority:<br>1. “ready”, if the substantive flag is set;<br>2. in all other cases, “stub”. |
| **DR-247 Is Ready** | A resilience claim is considered a ready if the narrative state is “ready”. |
| **DR-248 Section Label** | The resilience claim's section label is determined by the following priority:<br>1. the name, followed by “ (ready)”, if the ready flag is set;<br>2. in all other cases, the name, followed by “ (stub)”. |

## 5 Traceability to Schema

_The expression column is the rule's definition in RuleSpeak® notation —
the same logic the rulebook stores, written for a business reader._

| Schema element | Kind | Expression |
|----------------|------|------------|
| **ProjectMetadata.SubstrateCount** | rollup | `Count(ExecutionSubstrates via Project)` |
| **ProjectMetadata.FullyExpressiveSubstrateCount** | rollup | `Sum(ExecutionSubstrates.FullyExpressiveFlag via Project)` |
| **ProjectMetadata.PeerCompleteSubstrateCount** | rollup | `Sum(ExecutionSubstrates.PeerCompleteFlag via Project)` |
| **ProjectMetadata.ReadySubstrateCount** | rollup | `Sum(ExecutionSubstrates.ReadyFlag via Project)` |
| **ProjectMetadata.PeerCompletePercent** | formula | `If(SubstrateCount = 0, 0, Round(100 * PeerCompleteSubstrateCount / SubstrateCount, 0))` |
| **ExecutionSubstrates.IsFullyExpressive** | formula | `ExpressiveCompleteness = "full"` |
| **ExecutionSubstrates.FullyExpressiveFlag** | formula | `If(ExpressiveCompleteness = "full", 1, 0)` |
| **ExecutionSubstrates.IsReferenceQuality** | formula | `Maturity = "reference-quality"` |
| **ExecutionSubstrates.TradeoffCount** | rollup | `Count(SubstrateTradeoffs via SubstrateId)` |
| **ExecutionSubstrates.ProxyRouteCount** | rollup | `Count(SsotmeProxy via SubstrateId)` |
| **ExecutionSubstrates.CatalogToolCount** | rollup | `Count(AddToolCatalog via SubstrateId)` |
| **ExecutionSubstrates.IsPeerComplete** | formula | `And(IsFullyExpressive, CanBeAnswerKey)` |
| **ExecutionSubstrates.PeerCompleteFlag** | formula | `If(And(IsFullyExpressive, CanBeAnswerKey), 1, 0)` |
| **ExecutionSubstrates.HasProxyRoute** | formula | `ProxyRouteCount > 0` |
| **ExecutionSubstrates.IsCataloged** | formula | `CatalogToolCount > 0` |
| **ExecutionSubstrates.IsBusReachablePeer** | formula | `And(IsPeerComplete, HasProxyRoute)` |
| **ExecutionSubstrates.IsInstallablePeer** | formula | `And(IsPeerComplete, IsCataloged)` |
| **ExecutionSubstrates.ReadinessScore** | formula | `If(IsPeerComplete, 1, 0) + If(HasProxyRoute, 1, 0) + If(IsCataloged, 1, 0)` |
| **ExecutionSubstrates.ReadinessBand** | formula | `If(ReadinessScore = 3, "ready", If(ReadinessScore >= 1, "partial", "absent"))` |
| **ExecutionSubstrates.ReadyFlag** | formula | `If(ReadinessScore = 3, 1, 0)` |
| **ExecutionSubstrates.IsShowcaseSubstrate** | formula | `And(ReadinessBand = "ready", IsReferenceQuality)` |
| **OrchestrationComponents.DependencyCount** | formula | `If(Dependencies = "", 0, Len(Dependencies) - Len(Replace(Dependencies, ",", "")) + 1)` |
| **OrchestrationComponents.IsShellScript** | formula | `Language = "Bash"` |
| **OrchestrationComponents.DependencyBand** | formula | `If(DependencyCount = 0, "leaf", If(DependencyCount <= 2, "light", "heavy"))` |
| **OrchestrationComponents.IsHeavyShell** | formula | `And(IsShellScript, DependencyBand = "heavy")` |
| **OrchestrationComponents.ReviewPriority** | formula | `If(IsHeavyShell, "review", If(DependencyBand = "heavy", "watch", "ok"))` |
| **OrchestrationComponents.NeedsReview** | formula | `ReviewPriority = "review"` |
| **SsotmeProxy.Name** | formula | `Route` |
| **SsotmeProxy.HttpMethod** | formula | `Left(Route, Find(" ", Route) - 1)` |
| **SsotmeProxy.RoutePath** | formula | `Mid(Route, Find(" ", Route) + 1, 200)` |
| **SsotmeProxy.HasSubstrate** | formula | `SubstrateId <> ""` |
| **SsotmeProxy.IsPost** | formula | `HttpMethod = "POST"` |
| **SsotmeProxy.RouteSlug** | formula | `Replace(RoutePath, "/", "")` |
| **SsotmeProxy.SubstrateIsFullyExpressive** | lookup | `Lookup(ExecutionSubstrates.IsFullyExpressive via SubstrateId)` |
| **SsotmeProxy.IsFullBusRoute** | formula | `And(HasSubstrate, Coalesce(SubstrateIsFullyExpressive, False()))` |
| **SsotmeProxy.IsPostSpoke** | formula | `And(IsPost, Not(HasSubstrate))` |
| **SsotmeProxy.RouteClass** | formula | `If(IsFullBusRoute, "full-substrate", If(HasSubstrate, "partial-substrate", If(IsPostSpoke, "spoke", "other")))` |
| **SsotmeProxy.IsBusHeadline** | formula | `RouteClass = "full-substrate"` |
| **TestingFramework.IsGlobal** | formula | `Scope = "global"` |
| **TestingFramework.IsGlobPattern** | formula | `Len(Coalesce(FilePath, "")) <> Len(Replace(Coalesce(FilePath, ""), "*", ""))` |
| **TestingFramework.IsGlobalGlob** | formula | `And(IsGlobal, IsGlobPattern)` |
| **TestingFramework.ScopeLabel** | formula | `If(IsGlobalGlob, "global-glob", If(IsGlobal, "global-file", "domain"))` |
| **TestingFramework.IsDomainAgnostic** | formula | `ScopeLabel <> "domain"` |
| **TestingFramework.AgnosticLabel** | formula | `If(IsDomainAgnostic, "domain-agnostic", "domain-bound")` |
| **CoreDataFlows.StepCount** | formula | `If(Steps = "", 0, Len(Steps) - Len(Replace(Steps, "\|", "")) + 1)` |
| **CoreDataFlows.HasInvariant** | formula | `Invariant <> ""` |
| **CoreDataFlows.IsMultiStep** | formula | `StepCount > 1` |
| **CoreDataFlows.IsInvariantBacked** | formula | `And(HasInvariant, StepCount > 0)` |
| **CoreDataFlows.FlowMaturity** | formula | `If(IsInvariantBacked, If(IsMultiStep, "pipeline", "atomic"), "undocumented")` |
| **CoreDataFlows.IsPipeline** | formula | `FlowMaturity = "pipeline"` |
| **CoreDataFlows.FlowLabel** | formula | `If(IsPipeline, Concat(Name, " [pipeline]"), Name)` |
| **ProjectConfiguration.Name** | formula | `FileName` |
| **ProjectConfiguration.IsHumanMaintained** | formula | `MaintainedBy = "human"` |
| **ProjectConfiguration.IsJson** | formula | `Format = "JSON"` |
| **ProjectConfiguration.IsHumanJson** | formula | `And(IsHumanMaintained, IsJson)` |
| **ProjectConfiguration.DriftRisk** | formula | `If(IsHumanJson, "high", If(IsHumanMaintained, "medium", "low"))` |
| **ProjectConfiguration.NeedsGuard** | formula | `DriftRisk = "high"` |
| **ProjectConfiguration.GuardLabel** | formula | `If(NeedsGuard, "guard: validate on build", "no guard needed")` |
| **Dependencies.IsLanguage** | formula | `Type = "Language"` |
| **Dependencies.RequiredFlag** | formula | `If(Required, 1, 0)` |
| **Dependencies.IsRequiredLanguage** | formula | `And(IsLanguage, Required)` |
| **Dependencies.Criticality** | formula | `If(IsRequiredLanguage, "core", If(Required, "required", "optional"))` |
| **Dependencies.IsCore** | formula | `Criticality = "core"` |
| **Dependencies.BootstrapTier** | formula | `If(IsCore, "tier-0", If(Required, "tier-1", "tier-2"))` |
| **AppUsers.Name** | formula | `DisplayName` |
| **AppUsers.EmailDomain** | formula | `Mid(Email, Find("@", Email) + 1, 200)` |
| **AppUsers.RoleName** | lookup | `Lookup(UserRoles.Name via RoleId)` |
| **AppUsers.RoleAccessLevel** | lookup | `Lookup(UserRoles.AccessLevel via RoleId)` |
| **AppUsers.IsPlaceholderAccount** | formula | `EmailDomain = "example.com"` |
| **AppUsers.RoleCapabilityScore** | lookup | `Lookup(UserRoles.CapabilityScore via RoleId)` |
| **AppUsers.IsPlaceholderPower** | formula | `And(IsPlaceholderAccount, Coalesce(RoleCapabilityScore, 0) >= 4)` |
| **AppUsers.AccountRisk** | formula | `If(IsPlaceholderPower, "placeholder-power", If(IsPlaceholderAccount, "placeholder", "named"))` |
| **AppUsers.NeedsRotation** | formula | `AccountRisk = "placeholder-power"` |
| **UserRoles.UserCount** | rollup | `Count(AppUsers via RoleId)` |
| **UserRoles.PermissionCount** | rollup | `Count(AppPermissions via RoleId)` |
| **UserRoles.ScreenCount** | rollup | `Count(AppScreens via MinRoleId)` |
| **UserRoles.NavNodeCount** | rollup | `Count(AppNavigation via MinRoleId)` |
| **UserRoles.CapabilityScore** | formula | `If(CanEditRulebook, 1, 0) + If(CanRunBuilds, 1, 0) + If(CanAccessTechTools, 1, 0) + If(CanSwitchProjects, 1, 0) + If(CanManageUsers, 1, 0)` |
| **UserRoles.HasUsers** | formula | `UserCount > 0` |
| **UserRoles.IsPowerRole** | formula | `CapabilityScore >= 4` |
| **UserRoles.SurfaceCount** | formula | `ScreenCount + NavNodeCount` |
| **UserRoles.UnreachableScreenCount** | rollup | `Sum(AppScreens.UnreachableFlag via MinRoleId)` |
| **UserRoles.IsActivePowerRole** | formula | `And(IsPowerRole, HasUsers)` |
| **UserRoles.ReachabilityPercent** | formula | `If(ScreenCount = 0, 0, Round(100 * ScreenCount - UnreachableScreenCount / ScreenCount, 0))` |
| **UserRoles.IsFullyReachable** | formula | `ReachabilityPercent = 100` |
| **UserRoles.RoleHealth** | formula | `If(ReachabilityPercent = 100, "complete", If(ReachabilityPercent >= 50, "mostly-reachable", "gaps"))` |
| **AppPermissions.Name** | formula | `Concat(RoleId, ":", Resource, ":", Action)` |
| **AppPermissions.IsWrite** | formula | `Action <> "read"` |
| **AppPermissions.IsRowScoped** | formula | `And(RlsPredicate <> "", Coalesce(RlsPredicate, "") <> "true")` |
| **AppPermissions.AllowFlag** | formula | `If(Allow, 1, 0)` |
| **AppPermissions.RoleName** | lookup | `Lookup(UserRoles.Name via RoleId)` |
| **AppPermissions.IsScopedWrite** | formula | `And(IsWrite, IsRowScoped)` |
| **AppPermissions.RoleCapabilityScore** | lookup | `Lookup(UserRoles.CapabilityScore via RoleId)` |
| **AppPermissions.IsPowerScopedWrite** | formula | `And(IsScopedWrite, Coalesce(RoleCapabilityScore, 0) >= 4)` |
| **AppPermissions.PermissionKind** | formula | `If(IsScopedWrite, "scoped-write", If(IsWrite, "open-write", "read"))` |
| **AppPermissions.GovernanceFlag** | formula | `If(IsPowerScopedWrite, "rls-power", PermissionKind)` |
| **AppPermissions.IsHighGovernance** | formula | `GovernanceFlag = "rls-power"` |
| **AppNavigation.Name** | formula | `Label` |
| **AppNavigation.IsTopLevel** | formula | `ParentNavId = ""` |
| **AppNavigation.IsGroupOnly** | formula | `ScreenId = ""` |
| **AppNavigation.ChildCount** | rollup | `Count(AppNavigation via ParentNavId)` |
| **AppNavigation.ScreenPath** | lookup | `Lookup(AppScreens.Path via ScreenId)` |
| **AppNavigation.IsLeaf** | formula | `ChildCount = 0` |
| **AppNavigation.ScreenDepth** | lookup | `Lookup(AppScreens.PathDepth via ScreenId)` |
| **AppNavigation.ParentIsTopLevel** | lookup | `Lookup(AppNavigation.IsTopLevel via ParentNavId)` |
| **AppNavigation.IsSecondLevel** | formula | `And(Not(IsTopLevel), Coalesce(ParentIsTopLevel, False()))` |
| **AppNavigation.IsDeepLeaf** | formula | `And(IsLeaf, Coalesce(ScreenDepth, 0) >= 3)` |
| **AppNavigation.NavTier** | formula | `If(IsTopLevel, "root", If(IsSecondLevel, "section", "leaf"))` |
| **AppNavigation.NavLabel** | formula | `If(IsDeepLeaf, Concat(NavTier, ":deep-leaf"), NavTier)` |
| **AppScreens.Name** | formula | `Title` |
| **AppScreens.PathDepth** | formula | `Len(Path) - Len(Replace(Path, "/", ""))` |
| **AppScreens.IsParameterized** | formula | `Len(Coalesce(Path, "")) <> Len(Replace(Coalesce(Path, ""), ":", ""))` |
| **AppScreens.NavNodeCount** | rollup | `Count(AppNavigation via ScreenId)` |
| **AppScreens.MinRoleName** | lookup | `Lookup(UserRoles.Name via MinRoleId)` |
| **AppScreens.IsReachable** | formula | `NavNodeCount > 0` |
| **AppScreens.UnreachableFlag** | formula | `If(NavNodeCount = 0, 1, 0)` |
| **AppScreens.RoleReachability** | lookup | `Lookup(UserRoles.ReachabilityPercent via MinRoleId)` |
| **AppScreens.ReachabilityState** | formula | `If(IsReachable, If(IsParameterized, "deep-linked", "navigable"), "orphan")` |
| **AppScreens.RoleUnreachableCount** | lookup | `Lookup(UserRoles.UnreachableScreenCount via MinRoleId)` |
| **AppAPIs.Name** | formula | `Concat(Method, " ", Path)` |
| **AppAPIs.IsMutation** | formula | `Method <> "GET"` |
| **AppAPIs.PathDepth** | formula | `Len(Path) - Len(Replace(Path, "/", ""))` |
| **AppAPIs.IsParameterized** | formula | `Len(Coalesce(Path, "")) <> Len(Replace(Coalesce(Path, ""), ":", ""))` |
| **AppAPIs.IsDeepMutation** | formula | `And(IsMutation, IsParameterized)` |
| **AppAPIs.IsWriteThroughMutation** | formula | `And(IsMutation, WritesThrough)` |
| **AppAPIs.RiskClass** | formula | `If(IsWriteThroughMutation, If(IsDeepMutation, "targeted-write-through", "bulk-write-through"), If(IsMutation, "local-write", "read"))` |
| **AppAPIs.IsBulkWriteThrough** | formula | `RiskClass = "bulk-write-through"` |
| **AppAPIs.IsAuditTarget** | formula | `And(IsBulkWriteThrough, Not(IsParameterized))` |
| **AddToolCatalog.IsLocalProxy** | formula | `Source = "local-proxy"` |
| **AddToolCatalog.SubstrateName** | lookup | `Lookup(ExecutionSubstrates.Name via SubstrateId)` |
| **AddToolCatalog.SubstrateMaturity** | lookup | `Lookup(ExecutionSubstrates.Maturity via SubstrateId)` |
| **AddToolCatalog.IsProxyBackedReference** | formula | `And(IsLocalProxy, SubstrateMaturity = "reference-quality")` |
| **AddToolCatalog.SubstrateIsFullyExpressive** | lookup | `Lookup(ExecutionSubstrates.IsFullyExpressive via SubstrateId)` |
| **AddToolCatalog.SubstrateIsPeerComplete** | lookup | `Lookup(ExecutionSubstrates.IsPeerComplete via SubstrateId)` |
| **AddToolCatalog.IsPeerCompleteTool** | formula | `And(Coalesce(SubstrateIsFullyExpressive, False()), IsProxyBackedReference)` |
| **AddToolCatalog.ToolTier** | formula | `If(IsPeerCompleteTool, "tier-1", If(Coalesce(SubstrateIsPeerComplete, False()), "tier-2", "tier-3"))` |
| **AddToolCatalog.IsRecommendedInstall** | formula | `And(ToolTier = "tier-1", IsLocalProxy)` |
| **BuildPipeline.Name** | formula | `Aspect` |
| **BuildPipeline.HasCliEquivalent** | formula | `CliEquivalent <> ""` |
| **BuildPipeline.IsProjectScoped** | formula | `Len(Coalesce(Authority, "")) <> Len(Replace(Coalesce(Authority, ""), "{active-project}", ""))` |
| **BuildPipeline.IsCliParityGap** | formula | `Not(HasCliEquivalent)` |
| **BuildPipeline.IsScopedWithCli** | formula | `And(IsProjectScoped, HasCliEquivalent)` |
| **BuildPipeline.ParityState** | formula | `If(IsCliParityGap, "portal-only", If(IsScopedWithCli, "scoped-parity", "global-parity"))` |
| **BuildPipeline.IsParityViolation** | formula | `ParityState = "portal-only"` |
| **BuildPipeline.ParityFlag** | formula | `If(IsParityViolation, 0, 1)` |
| **AdminPortalRuntime.HasDependency** | formula | `DependsOn <> ""` |
| **AdminPortalRuntime.DependencyCount** | formula | `If(DependsOn = "", 0, Len(DependsOn) - Len(Replace(DependsOn, ",", "")) + 1)` |
| **AdminPortalRuntime.IsRootProcess** | formula | `Not(HasDependency)` |
| **AdminPortalRuntime.IsResilientLeaf** | formula | `And(AutoRestart, DependencyCount = 0)` |
| **AdminPortalRuntime.ProcessRole** | formula | `If(IsRootProcess, If(AutoRestart, "resilient-root", "fragile-root"), "dependent")` |
| **AdminPortalRuntime.IsFragileRoot** | formula | `ProcessRole = "fragile-root"` |
| **AdminPortalRuntime.IsSupervisedRoot** | formula | `And(Not(IsFragileRoot), IsRootProcess)` |
| **RoleScreenHints.Name** | formula | `Concat(RoleId, "@", ScreenId)` |
| **RoleScreenHints.HiddenActionCount** | formula | `If(Hide = "", 0, Len(Hide) - Len(Replace(Hide, ",", "")) + 1)` |
| **RoleScreenHints.PrimaryActionCount** | formula | `If(PrimaryActions = "", 0, Len(PrimaryActions) - Len(Replace(PrimaryActions, ",", "")) + 1)` |
| **RoleScreenHints.IsDashboardLayout** | formula | `Layout = "dashboard"` |
| **RoleScreenHints.ActionSurfaceCount** | formula | `HiddenActionCount + PrimaryActionCount` |
| **RoleScreenHints.IsRestrictiveHint** | formula | `HiddenActionCount > PrimaryActionCount` |
| **RoleScreenHints.HintStyle** | formula | `If(IsRestrictiveHint, "restrictive", If(ActionSurfaceCount = 0, "neutral", "additive"))` |
| **RoleScreenHints.IsRestrictiveDashboard** | formula | `And(HintStyle = "restrictive", IsDashboardLayout)` |
| **RoleScreenHints.HintPriority** | formula | `If(IsRestrictiveDashboard, "high", "normal")` |
| **ClickTargets.Name** | formula | `Concat(FromContext, " -> ", ToPath)` |
| **ClickTargets.IsDomainScoped** | formula | `Len(Coalesce(ToPath, "")) <> Len(Replace(Coalesce(ToPath, ""), ":domain", ""))` |
| **ClickTargets.HasFilter** | formula | `Filter <> ""` |
| **ClickTargets.TargetDepth** | formula | `Len(ToPath) - Len(Replace(ToPath, "/", ""))` |
| **ClickTargets.IsFilteredDomainJump** | formula | `And(IsDomainScoped, HasFilter)` |
| **ClickTargets.IsDeepTarget** | formula | `TargetDepth >= 3` |
| **ClickTargets.JumpClass** | formula | `If(IsFilteredDomainJump, "filtered-domain", If(IsDeepTarget, "deep", If(IsDomainScoped, "domain", "global")))` |
| **ClickTargets.IsPrecisionJump** | formula | `JumpClass = "filtered-domain"` |
| **ClickTargets.IsShowcaseJump** | formula | `And(IsPrecisionJump, IsDeepTarget)` |
| **SubstrateContractPhases.StepCount** | rollup | `Count(EvaluationSteps via PhaseId)` |
| **SubstrateContractPhases.ProducedArtifactCount** | rollup | `Count(EvaluationArtifacts via ProducedByPhaseId)` |
| **SubstrateContractPhases.ConsumedArtifactCount** | rollup | `Count(EvaluationArtifacts via ConsumedByPhaseId)` |
| **SubstrateContractPhases.IsFirstPhase** | formula | `Order = 1` |
| **SubstrateContractPhases.IsProductive** | formula | `ProducedArtifactCount > 0` |
| **SubstrateContractPhases.ArtifactThroughput** | formula | `ProducedArtifactCount + ConsumedArtifactCount` |
| **SubstrateContractPhases.HasSteps** | formula | `StepCount > 0` |
| **SubstrateContractPhases.IsFullyModeled** | formula | `And(IsProductive, HasSteps)` |
| **SubstrateContractPhases.ThroughputPerStep** | formula | `If(StepCount = 0, 0, Round(ArtifactThroughput / StepCount, 2))` |
| **SubstrateContractPhases.PhaseHealth** | formula | `If(IsFullyModeled, If(ThroughputPerStep >= 1, "dense", "modeled"), "sparse")` |
| **SubstrateContractPhases.IsDensePhase** | formula | `PhaseHealth = "dense"` |
| **EvaluationSteps.PhaseName** | lookup | `Lookup(SubstrateContractPhases.Name via PhaseId)` |
| **EvaluationSteps.PhaseOrder** | lookup | `Lookup(SubstrateContractPhases.Order via PhaseId)` |
| **EvaluationSteps.IsFirstStep** | formula | `Order = 1` |
| **EvaluationSteps.PhaseStepCount** | lookup | `Lookup(SubstrateContractPhases.StepCount via PhaseId)` |
| **EvaluationSteps.IsInFirstPhase** | formula | `PhaseOrder = 1` |
| **EvaluationSteps.IsLastStep** | formula | `Order = Coalesce(PhaseStepCount, 0)` |
| **EvaluationSteps.PositionPercent** | formula | `If(Coalesce(PhaseStepCount, 0) = 0, 0, Round(100 * Order / PhaseStepCount, 0))` |
| **EvaluationSteps.StepRole** | formula | `If(IsFirstStep, "entry", If(IsLastStep, "exit", "middle"))` |
| **EvaluationSteps.IsBoundaryStep** | formula | `StepRole <> "middle"` |
| **EvaluationArtifacts.IsSourceArtifact** | formula | `ProducedByPhaseId = ""` |
| **EvaluationArtifacts.IsJson** | formula | `Format = "json"` |
| **EvaluationArtifacts.ProducerPhaseName** | lookup | `Lookup(SubstrateContractPhases.Name via ProducedByPhaseId)` |
| **EvaluationArtifacts.ConsumerPhaseName** | lookup | `Lookup(SubstrateContractPhases.Name via ConsumedByPhaseId)` |
| **EvaluationArtifacts.ProducerStepCount** | lookup | `Lookup(SubstrateContractPhases.StepCount via ProducedByPhaseId)` |
| **EvaluationArtifacts.IsJsonSource** | formula | `And(IsSourceArtifact, IsJson)` |
| **EvaluationArtifacts.ProducerIsProductive** | lookup | `Lookup(SubstrateContractPhases.IsProductive via ProducedByPhaseId)` |
| **EvaluationArtifacts.IsPipelineHandoff** | formula | `And(Not(IsJsonSource), Coalesce(ProducerStepCount, 0) > 0)` |
| **EvaluationArtifacts.ArtifactRole** | formula | `If(IsJsonSource, "seed", If(IsPipelineHandoff, "handoff", "terminal"))` |
| **EvaluationArtifacts.IsSeedArtifact** | formula | `ArtifactRole = "seed"` |
| **SubstrateTradeoffDimensions.TradeoffCount** | rollup | `Count(SubstrateTradeoffs via DimensionId)` |
| **SubstrateTradeoffDimensions.HasTradeoffs** | formula | `TradeoffCount > 0` |
| **SubstrateTradeoffDimensions.FullyExpressiveTradeoffCount** | rollup | `Sum(SubstrateTradeoffs.SubstrateFullFlag via DimensionId)` |
| **SubstrateTradeoffDimensions.FullCoveragePercent** | formula | `If(TradeoffCount = 0, 0, Round(100 * FullyExpressiveTradeoffCount / TradeoffCount, 0))` |
| **SubstrateTradeoffDimensions.IsFullyCovered** | formula | `FullCoveragePercent = 100` |
| **SubstrateTradeoffs.Name** | formula | `Concat(SubstrateId, ":", DimensionId)` |
| **SubstrateTradeoffs.SubstrateName** | lookup | `Lookup(ExecutionSubstrates.Name via SubstrateId)` |
| **SubstrateTradeoffs.DimensionName** | lookup | `Lookup(SubstrateTradeoffDimensions.Name via DimensionId)` |
| **SubstrateTradeoffs.DimensionOrder** | lookup | `Lookup(SubstrateTradeoffDimensions.Order via DimensionId)` |
| **SubstrateTradeoffs.HasNote** | formula | `Note <> ""` |
| **SubstrateTradeoffs.SubstrateIsFullyExpressive** | lookup | `Lookup(ExecutionSubstrates.IsFullyExpressive via SubstrateId)` |
| **SubstrateTradeoffs.SubstrateFullFlag** | lookup | `Lookup(ExecutionSubstrates.FullyExpressiveFlag via SubstrateId)` |
| **SubstrateTradeoffs.DimensionTradeoffCount** | lookup | `Lookup(SubstrateTradeoffDimensions.TradeoffCount via DimensionId)` |
| **SubstrateTradeoffs.IsFullSubstrateNoted** | formula | `And(Coalesce(SubstrateIsFullyExpressive, False()), HasNote)` |
| **SubstrateTradeoffs.DimensionFullCount** | lookup | `Lookup(SubstrateTradeoffDimensions.FullyExpressiveTradeoffCount via DimensionId)` |
| **SubstrateTradeoffs.IsDominantDimensionEntry** | formula | `And(Coalesce(SubstrateIsFullyExpressive, False()), Coalesce(DimensionFullCount, 0) >= 5)` |
| **FuzzyGradingProviders.IsDeterministic** | formula | `Determinism = "deterministic"` |
| **FuzzyGradingProviders.RequiresApiKey** | formula | `EnvVar <> ""` |
| **FuzzyGradingProviders.IsLocalDeterministic** | formula | `And(LocalRuntime, IsDeterministic)` |
| **FuzzyGradingProviders.IsCloudKeyed** | formula | `And(Not(LocalRuntime), RequiresApiKey)` |
| **FuzzyGradingProviders.ProviderClass** | formula | `If(IsLocalDeterministic, "local-deterministic", If(IsCloudKeyed, "cloud-llm", "other"))` |
| **FuzzyGradingProviders.IsPreferredProvider** | formula | `ProviderClass = "local-deterministic"` |
| **FuzzyGradingProviders.ProviderLabel** | formula | `If(IsPreferredProvider, Concat(Name, " (preferred)"), Name)` |
| **WriteThroughInvariant.DescriptionLength** | formula | `Len(Description)` |
| **WriteThroughInvariant.IsSubstantive** | formula | `DescriptionLength >= 200` |
| **WriteThroughInvariant.NarrativeState** | formula | `If(IsSubstantive, "ready", "stub")` |
| **WriteThroughInvariant.IsReady** | formula | `NarrativeState = "ready"` |
| **WriteThroughInvariant.SectionLabel** | formula | `If(IsReady, Concat(Name, " (ready)"), Concat(Name, " (stub)"))` |
| **PortalCliParity.DescriptionLength** | formula | `Len(Description)` |
| **PortalCliParity.IsSubstantive** | formula | `DescriptionLength >= 200` |
| **PortalCliParity.NarrativeState** | formula | `If(IsSubstantive, "ready", "stub")` |
| **PortalCliParity.IsReady** | formula | `NarrativeState = "ready"` |
| **PortalCliParity.SectionLabel** | formula | `If(IsReady, Concat(Name, " (ready)"), Concat(Name, " (stub)"))` |
| **BootstrapStory.DescriptionLength** | formula | `Len(Description)` |
| **BootstrapStory.IsSubstantive** | formula | `DescriptionLength >= 200` |
| **BootstrapStory.NarrativeState** | formula | `If(IsSubstantive, "ready", "stub")` |
| **BootstrapStory.IsReady** | formula | `NarrativeState = "ready"` |
| **BootstrapStory.SectionLabel** | formula | `If(IsReady, Concat(Name, " (ready)"), Concat(Name, " (stub)"))` |
| **DeveloperJourney.DescriptionLength** | formula | `Len(Description)` |
| **DeveloperJourney.IsSubstantive** | formula | `DescriptionLength >= 200` |
| **DeveloperJourney.NarrativeState** | formula | `If(IsSubstantive, "ready", "stub")` |
| **DeveloperJourney.IsReady** | formula | `NarrativeState = "ready"` |
| **DeveloperJourney.SectionLabel** | formula | `If(IsReady, Concat(Name, " (ready)"), Concat(Name, " (stub)"))` |
| **ResilienceClaim.DescriptionLength** | formula | `Len(Description)` |
| **ResilienceClaim.IsSubstantive** | formula | `DescriptionLength >= 200` |
| **ResilienceClaim.NarrativeState** | formula | `If(IsSubstantive, "ready", "stub")` |
| **ResilienceClaim.IsReady** | formula | `NarrativeState = "ready"` |
| **ResilienceClaim.SectionLabel** | formula | `If(IsReady, Concat(Name, " (ready)"), Concat(Name, " (stub)"))` |

---

_This document is rendered in **RuleSpeak®**, the declarative business-rule
notation created by **Ronald G. Ross**, and follows the conventions of
**SBVR** (Semantics of Business Vocabulary and Business Rules). With thanks to
Ronald G. Ross for RuleSpeak® and his foundational work on business rules —
[www.RonRoss.info](https://www.RonRoss.info)._
