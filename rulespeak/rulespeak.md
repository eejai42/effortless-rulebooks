# 📘 Effortless Rulebooks — RuleSpeak®

_The repo-governing rulebook: every governed project including the root, witnessed canonical project slots, consistency rules and findings, the delivery programme, the Claude skill catalog and routing graph, the root explorer plan, and legacy-runner retirement._

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
| Rulebook Domains | A defined attribute. | _Reverse relationship: all RulebookDomains rows of this project._ |
| Claude Skills | A defined attribute. | _Reverse relationship: all ClaudeSkills rows of this project._ |
| Build Phases | A defined attribute. | _Reverse relationship: delivery phases of this project._ |
| ERB Packages | A defined attribute. | _Reverse relationship: capability packages of this project._ |
| Consistency Rules | A defined attribute. | _Reverse relationship: consistency rules of this project._ |
| Mobile Nav Tabs | A defined attribute. | _Reverse relationship: mobile tabs of this project._ |
| Domain Count | The number of rulebook domains related to the project metadata. | _Order 1. Number of project containers (RulebookDomains rows) in the repo._ |
| Skill Count | The number of claude skills related to the project metadata. | _Order 1. Number of Claude skills in the catalog (including deprecated)._ |
| Consistency Rule Count | The number of consistency rules related to the project metadata. | _Order 1. Number of consistency rules governing the repo._ |
| Phase Count | The number of build phases related to the project metadata. | _Order 1. Number of delivery phases in the programme._ |
| Toy Domain Count | The total toy flag across the rulebook domains related to the project metadata. | _Order 2. Domains under toy-rulebooks/._ |
| Deprecated Skill Count | The total deprecated flag across the claude skills related to the project metadata. | _Order 2. Deprecated skills still modeled._ |
| Priced Phase Count | The total priced flag across the build phases related to the project metadata. | _Order 2. Phases carrying a quoted price._ |
| Story Total | The total story count across the build phases related to the project metadata. | _Order 2. All user stories across phases._ |
| Open Finding Total | The total open finding count across the consistency rules related to the project metadata. | _Order 3. Open consistency findings across every rule._ |
| Isolated Skill Count | The total isolated flag across the claude skills related to the project metadata. | _Order 3. Skills with no routing edges._ |
| Done Story Total | The total done story count across the build phases related to the project metadata. | _Order 3. Stories asserted done across all phases._ |
| Toy Share | Determined by priority: 0 if the domain count is 0; in all other cases, 100 times the toy domain count divided by the domain count rounded to 0 decimal place(s). | _Order 3. Percent of containers that are toys._ |
| Clean Domain Count | The total clean flag across the rulebook domains related to the project metadata. | _Order 4. Domains with zero open findings._ |
| Satisfied Rule Count | The total satisfied flag across the consistency rules related to the project metadata. | _Order 4. Rules with zero open findings._ |
| Cardless Domain Count | The total needs flavor flag across the rulebook domains related to the project metadata. | _Order 4. Real projects missing a flavor card._ |
| Weighted Done Total | The total weighted done sum across the build phases related to the project metadata. | _Order 4. Effort weight earned by done stories across the programme._ |
| Avg Phase Done Percent | The average done percent across the build phases related to the project metadata. | _Order 4. Mean of per-phase done percentages._ |
| Consistency Percent | Determined by priority: 0 if the domain count is 0; in all other cases, 100 times the clean domain count divided by the domain count rounded to 0 decimal place(s). | _Order 5. Percent of containers with zero open findings — the headline repo-health number._ |
| Rule Compliance Percent | Determined by priority: 0 if the consistency rule count is 0; in all other cases, 100 times the satisfied rule count divided by the consistency rule count rounded to 0 decimal place(s). | _Order 5. Percent of consistency rules fully satisfied._ |
| Shippable Tab Count | The total shippable flag across the mobile nav tabs related to the project metadata. | _Order 5. Mobile tabs whose every route is built._ |
| Healthy Skill Count | The total healthy flag across the claude skills related to the project metadata. | _Order 5. Skill catalog entries that are neither isolated nor deprecated-but-routed._ |
| Programme Progress Percent | The average weighted done percent across the build phases related to the project metadata. | _Order 5. Mean effort-weighted done percent across phases._ |
| Is Repo Consistent | True when the clean domain count is the domain count. | _Order 5. Every container is clean — the programme's exit condition._ |
| Project Layout Slots | A defined attribute. | _Reverse relationship: canonical project-shape slots._ |
| Layout Slot Count | The number of project layout slots related to the project metadata. | _Order 1. Slots in the canonical project shape._ |
| Fully Implemented Count | The total fully implemented flag across the rulebook domains related to the project metadata. | _Order 5. Governed projects that fill the full implementation contract._ |
| **Ontology Axiom** | Positive-form invariants the project is built on. These are the load-bearing claims; if any one is dropped, the methodology no longer holds. FramingInvariants are mistakes that violate these axioms. | — |
| Name | The same as its short name. | _Order 1. Display alias (calculated). Order 1._ |
| Short Name | A defined attribute. | — |
| Statement | A defined attribute. | _The axiom in one sentence_ |
| Why | A defined attribute. | _What collapses if you give this up_ |
| Implication | A defined attribute. | _Concrete consequence for how the project is built / discussed_ |
| Status | A defined attribute. | _active \| revising \| retired_ |
| Framing Invariants | A defined attribute. | _Reverse relationship: FramingInvariants rows whose ViolatedAxiomId points here._ |
| Platform Features | A defined attribute. | _Reverse relationship: PlatformFeatures rows whose RelatedAxiomId points here._ |
| Invariant Count | The number of framing invariants related to the ontology axiom. | _Order 1. Framing invariants that cite this axiom as the one violated._ |
| Feature Count | The number of platform features related to the ontology axiom. | _Order 1. Platform features that operationalize this axiom._ |
| Is Active | True when the status is “active”. | _Order 1. The axiom is currently in force._ |
| Critical Invariant Count | The total critical flag across the framing invariants related to the ontology axiom. | _Order 2. Critical framing invariants protecting this axiom._ |
| Shipped Feature Count | The total shipped flag across the platform features related to the ontology axiom. | _Order 2. Shipped features operationalizing this axiom._ |
| Is Load Bearing | True when at least one of the following holds: the invariant count is greater than 0 or the feature count is greater than 0. | _Order 2. Something in the repo depends on this axiom explicitly._ |
| Is Well Guarded | True when all of the following hold: the load bearing flag is set and the critical invariant count is greater than 0. | _Order 3. Load-bearing and protected by at least one critical framing invariant._ |
| Guard Ratio | Determined by priority: 0 if the invariant count is 0; in all other cases, the critical invariant count divided by the invariant count rounded to 2 decimal place(s). | _Order 3. Share of its invariants that are critical._ |
| Guard State | Determined by priority: “guarded” if the well guarded flag is set; “exposed” if the load bearing flag is set; in all other cases, “dormant”. | _Order 4. guarded / exposed / dormant._ |
| Is Exposed Foundation | True when the guard state is “exposed”. | _Order 5. Load-bearing but unguarded by any critical invariant._ |
| **Framing Invariant** | Mistakes-to-avoid catalog. Each row is one wrong framing that has been caught and corrected, paired with the right framing and the axiom it violates. The portal surfaces these so future agents (and humans) can be re-grounded without rediscovering them. | — |
| Name | A defined attribute. | _Short title for grouping / display_ |
| Category | A defined attribute. | _substrate-equality \| ssot-locality \| hub-spoke-topology \| category-error \| fail-loud \| role-confusion \| naming \| project-catalog \| build-semantics \| dialect-binding_ |
| Wrong Framing | A defined attribute. | _The mistake verbatim_ |
| Correct Framing | A defined attribute. | _The right framing_ |
| Why | A defined attribute. | _The reasoning that anchors it_ |
| Violated Axiom ID | A defined attribute. | _FK to OntologyAxioms.AxiomId — which axiom the wrong framing violates_ |
| Severity | A defined attribute. | _critical \| important \| nuance_ |
| Example Context | A defined attribute. | _Where this came up — useful so future agents can recognise the situation_ |
| Status | A defined attribute. | _active \| retired_ |
| Is Critical | True when the severity is “critical”. | _Order 1. Severity is critical._ |
| Critical Flag | Determined by priority: 1 if the severity is “critical”; in all other cases, 0. | _Order 1. 1 when critical, else 0 — rollup carrier for per-axiom critical counts._ |
| Axiom Short Name | Taken from the linked violated axiom ID. | _Order 1. Short name of the violated axiom._ |
| Axiom is Active | True when the linked violated axiom ID is active. | _Order 2. Whether the violated axiom is still in force._ |
| Is Active Critical | True when all of the following hold: the critical flag is set and the status is “active”. | _Order 2. Critical and currently enforced._ |
| Is Enforceable | True when all of the following hold: the active critical flag is set and the axiom is active (a missing value counts as false). ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 3. Active, critical, and its axiom is still in force._ |
| Axiom is Load Bearing | True when the linked violated axiom ID is load bearing. | _Order 3. Whether the violated axiom is load-bearing._ |
| Enforcement State | Determined by priority: “enforced” if the enforceable flag is set; “advisory” if the axiom is load bearing (a missing value counts as false); in all other cases, “orphan”. ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 4. enforced / advisory / orphan._ |
| Needs Attention | True when the enforcement state is “orphan”. | _Order 5. Cites an axiom nothing else depends on._ |
| **Platform Feature** | The catalog of distinctive features the ERB platform offers. The rulebook is the formal SSoT for this list; the repo's README and per-feature README files MUST conform to these rows. Each feature has a one-line summary (the elevator pitch), a Tier (headline vs additional), a Priority (sort order within tier), and a ReadmeFilePath (where the long-form explanation lives — even if it's still a stub). IsReadmeStub is calculated so 'which READMEs are still missing' is a queryable fact, not a tribal one. Many features reference an OntologyAxiom — that's the axiom the feature operationalizes. | — |
| Name | A defined attribute. | _Full feature name as it appears in headings_ |
| Short Name | A defined attribute. | _Short identifier for cross-references (e.g. 'ADP', 'Hub-and-Spoke')_ |
| Tier | A defined attribute. | _headline \| additional — drives the two README sections_ |
| Priority | A defined attribute. | _Sort order within tier (lower = higher up)_ |
| One Line Summary | A defined attribute. | _The elevator pitch — one sentence, no clauses about hypotheticals_ |
| Readme File Path | A defined attribute. | _Path to the per-feature README, relative to repo root. Hand-maintained but MUST conform to this row._ |
| Readme Stub Content | A defined attribute. | _The placeholder one-sentence body that ships in the README until it's fleshed out. Lets us hand-maintain READMEs while keeping the rulebook authoritative for the seed content._ |
| Readme Length | A defined attribute. | _Best-known character count of the README file on disk. Populated by a tooling pass; null means 'not yet measured'. Used to compute IsReadmeStub._ |
| Related Axiom ID | A defined attribute. | _FK to OntologyAxioms.AxiomId — the axiom this feature operationalizes (if any)_ |
| Status | A defined attribute. | _shipped \| partial \| planned — current implementation status_ |
| Is Readme Stub | True when the readme length (a missing value counts as 0) is less than 400. | _Order 1. True if the README is still a placeholder (ReadmeLength null or < 400 chars). Makes missing READMEs a first-class query._ |
| Is Headline | True when the tier is “headline”. | _Order 1. Feature sits in the headline tier._ |
| Is Shipped | True when the status is “shipped”. | _Order 1. Feature status is shipped._ |
| Shipped Flag | Determined by priority: 1 if the status is “shipped”; in all other cases, 0. | _Order 1. 1 when shipped, else 0 — rollup carrier._ |
| Axiom Short Name | Taken from the linked related axiom ID. | _Order 1. Short name of the related axiom._ |
| Needs Readme Work | True when all of the following hold: the shipped flag is set and the readme stub flag is set. | _Order 2. Shipped but its README is still a stub._ |
| Axiom Invariant Count | Taken from the linked related axiom ID. | _Order 2. How many framing invariants guard the related axiom._ |
| Axiom is Load Bearing | True when the linked related axiom ID is load bearing. | _Order 3. Whether the related axiom is load-bearing._ |
| Is Headline Gap | True when all of the following hold: the headline flag is set and the needs readme work flag is set. | _Order 3. Headline feature whose README still needs work._ |
| Doc State | Determined by priority: “headline-gap” if the headline gap flag is set; “gap” if the needs readme work flag is set; “documented” if the shipped flag is set; in all other cases, “pending”. | _Order 4. headline-gap / gap / documented / pending._ |
| Is Axiom Backed | True when all of the following hold: the axiom is load bearing (a missing value counts as false) and the shipped flag is set. ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 4. Shipped and tied to a load-bearing axiom._ |
| Is Showcase Feature | True when all of the following hold: the axiom backed flag is set and the doc state is “documented”. | _Order 5. Shipped, documented and axiom-backed._ |
| **Rulebook Source Spoke** | Peer input spokes that can write into effortless-rulebook.json. The rulebook JSON is the durable SSoT; these are interchangeable sources. | — |
| Name | A defined attribute. | — |
| Kind | A defined attribute. | _airtable \| admin-portal \| llm-direct \| manual-json \| reverse-sync_ |
| Direction | A defined attribute. | _input (writes into rulebook) \| output (reads from rulebook) \| bidirectional_ |
| Required | True when an empty string. | _False for all input spokes — any one is sufficient, none is required_ |
| Purpose | A defined attribute. | — |
| Authority | A defined attribute. | _On conflict, the rulebook JSON wins; spokes are the editors, not the SSoT_ |
| Is Bidirectional | True when the direction is “bidirectional”. | _Order 1. Spoke both reads and writes the hub._ |
| Is Optional | True when the required flag is not set. | _Order 1. Spoke is optional for a working project._ |
| Is Optional Bidirectional | True when all of the following hold: the optional flag is set and the bidirectional flag is set. | _Order 2. An optional editing surface that also writes back._ |
| Spoke Kind | Determined by priority: “editing-surface” if the optional bidirectional flag is set; “required-sync” if the bidirectional flag is set; in all other cases, “one-way”. | _Order 3. editing-surface / required-sync / one-way._ |
| Is Advertised Surface | True when all of the following hold: the spoke kind is “editing-surface” and the required flag is not set. | _Order 4. Optional editing surface the docs may advertise._ |
| Surface Label | Determined by priority: the name, followed by “ (optional surface)” if the advertised surface flag is set; in all other cases, the name. | _Order 5. Display label noting optional editing surfaces._ |
| **Rulebook Domain** | Customer ontologies: each domain has its own rulebook + substrate generation. Domains form a TREE — ParentDomainId links a more-elaborate domain back to the simpler one it grew out of (e.g. Talisman ADVANCED ← Talisman BASIC). The UI uses this to present related rulebooks as a set rather than a flat list, and to drive 'next step in the progression' navigation. | — |
| Area | A defined attribute. | _Witnessed physical container: root, rulebook-examples, or toy-rulebooks. Classification is derived separately._ |
| Is Intentional Exception | True when an empty string. | _True only for the two doctrine-sanctioned containers that deliberately carry no rulebook (naked-claude-vs-effortless-claude, volunteer-shift-scheduler-demo)._ |
| Name | The same as its domain name. | _Order 1. Display alias (calculated). Order 1._ |
| Domain Name | A defined attribute. | — |
| Relative Path | A defined attribute. | _rulebook-examples/{domain}/ — each domain is a self-contained Effortless project_ |
| Rulebook Path | A defined attribute. | _Path to effortless-rulebook.json within domain_ |
| Complexity Level | A defined attribute. | _minimal, moderate, advanced, or philosophical_ |
| Table Count | A defined attribute. | — |
| Key Features | A defined attribute. | _Comma-separated: string concat, relationships, aggregations, IF logic, meta-ontology, etc._ |
| Purpose | A defined attribute. | — |
| Parent Domain ID | A defined attribute. | _FK to RulebookDomains.DomainId — the simpler domain this one was derived from / builds on. Null for root-level demos (independent starting points). Lets the UI present rulebooks as a tree of related domains._ |
| Progression Note | A defined attribute. | _One sentence describing what this domain ADDS over its parent — the specific concept the progression is meant to demonstrate at this step._ |
| Child Domains | A defined attribute. | _Reverse relationship: RulebookDomains rows whose ParentDomainId points here._ |
| Demo Narratives | A defined attribute. | _Reverse relationship: DemoNarratives rows whose RelatedDomainId points here._ |
| Flavor Cards | A defined attribute. | _Reverse relationship: flavor cards describing this domain._ |
| Project | A defined attribute. | _FK to ProjectMetadata — roots this catalog row to the platform row so repo-wide rollups exist on one dashboard record._ |
| Consistency Findings | A defined attribute. | _Reverse relationship: findings against this domain._ |
| Slug | Computed as 8 character(s) of the domain ID starting at position 200. | _Order 1. Directory slug parsed from the slug-keyed DomainId (domain-<slug>)._ |
| Is Toy | True when the area is “toy-rulebooks”. | _Order 1. Lives under toy-rulebooks/._ |
| Toy Flag | Determined by priority: 1 if the area is “toy-rulebooks”; in all other cases, 0. | _Order 1. 1 for toys — rollup carrier._ |
| Has Rulebook | True when the rulebook path has a value. | _Order 1. A rulebook file exists for this container._ |
| Finding Count | The number of consistency findings related to the rulebook domain. | _Order 1. Consistency findings ever recorded against this domain (any status)._ |
| Flavor Card Count | The number of rulebook flavors related to the rulebook domain. | _Order 1. Flavor cards describing this domain._ |
| Child Domain Count | The number of rulebook domains related to the rulebook domain. | _Order 1. Domains that name this one as progression parent._ |
| Expected Rulebook Path | Computed as the relative path, followed by “effortless-rulebook/”, followed by the slug, followed by “-rulebook.json”. | _Order 2. Where the rulebook should live under the canonical layout._ |
| Open Finding Count | The total open flag across the consistency findings related to the rulebook domain. | _Order 2. Open findings against this domain._ |
| Has Flavor Card | True when the flavor card count is greater than 0. | _Order 2. At least one flavor card describes this domain._ |
| Is Progression Root | True when all of the following hold: the parent domain ID is blank and the child domain count is greater than 0. | _Order 2. Root of a progression tree._ |
| Is Standard Layout | True when at least one of the following holds: the rulebook path (a missing value counts as an empty string) is the expected rulebook path or the rulebook path (a missing value counts as an empty string) is the relative path, followed by “effortless-rulebook/effortless-rulebook.json”. | _Order 3. Rulebook sits in effortless-rulebook/ under either accepted filename._ |
| Is Fully Consistent | True when the open finding count is 0. | _Order 3. No open consistency findings._ |
| Clean Flag | Determined by priority: 1 if the open finding count is 0; in all other cases, 0. | _Order 3. 1 when fully consistent — rollup carrier._ |
| Consistency Grade | Determined by priority: “clean” if the open finding count is 0; “minor” if the open finding count is at most 2; in all other cases, “major”. | _Order 3. clean / minor / major by open findings._ |
| Needs Flavor Card | True when all of the following hold: the area is not “root”; the intentional exception flag is not set; and the flavor card flag is not set. | _Order 3. Real project with no catalog card._ |
| Needs Flavor Flag | Determined by priority: 1 if all of the following hold: the area is not “root”; the intentional exception flag is not set; and the flavor card flag is not set; in all other cases, 0. | _Order 3. 1 when a card is missing — rollup carrier._ |
| Layout Flag | Determined by priority: 1 if the standard layout flag is set; in all other cases, 0. | _Order 4. 1 when the rulebook is at the canonical path — rollup carrier._ |
| Conformance Score | Computed as the count of the following that hold: the fully consistent flag is set; the standard layout flag is set; the flavor card flag is set; and the rulebook flag is set. | _Order 4. Consistent + canonical layout + flavor card + rulebook present (0-4)._ |
| Is Showcase Ready | True when all of the following hold: the fully consistent flag is set; the standard layout flag is set; and the toy flag is not set. | _Order 4. A clean, canonical, non-toy demo fit for the front page._ |
| Conformance Band | Determined by priority: “exemplary” if the conformance score is 4; “acceptable” if the conformance score is at least 2; in all other cases, “needs-work”. | _Order 5. exemplary / acceptable / needs-work._ |
| Showcase Flag | Determined by priority: 1 if the showcase ready flag is set; in all other cases, 0. | _Order 5. 1 when showcase-ready — rollup carrier._ |
| Slot Witnesses | A defined attribute. | _Reverse relationship: canonical slot witnesses for this project._ |
| Slot Witness Count | The number of project slot witnesses related to the rulebook domain. | _Order 1. Canonical slots scanned for this project._ |
| Present Slot Count | The total present flag across the project slot witnesses related to the rulebook domain. | _Order 2. Canonical slots this project currently fills._ |
| Implementation Gap Count | The total implementation gap flag across the project slot witnesses related to the rulebook domain. | _Order 3. Slots absent from a fully implemented root/example contract._ |
| Universal Gap Count | The total universal gap flag across the project slot witnesses related to the rulebook domain. | _Order 3. Universal project slots currently absent._ |
| Slot Coverage Percent | Determined by priority: 0 if the slot witness count is 0; in all other cases, 100 times the present slot count divided by the slot witness count rounded to 0 decimal place(s). | _Order 3. Percent of all canonical slots currently filled._ |
| Required Slot Count | The total required here flag across the project slot witnesses related to the rulebook domain. | _Order 4. Slots required for this project's physical area._ |
| Required Present Count | The total required present flag across the project slot witnesses related to the rulebook domain. | _Order 4. Required-here slots currently present._ |
| Required Gap Count | The total gap flag across the project slot witnesses related to the rulebook domain. | _Order 4. Required-here slots currently absent._ |
| Is Fully Implemented | True when all of the following hold: the implementation gap count is 0 and the intentional exception flag is not set. | _Order 4. The root/example-complete contract is fully witnessed._ |
| Is Toy by Coverage | True when all of the following hold: the area is not “root”; the intentional exception flag is not set; and the slot coverage percent is less than 60. | _Order 4. Implements less than 60 percent of the full canonical shape._ |
| Fully Implemented Flag | Determined by priority: 1 if all of the following hold: the implementation gap count is 0 and the intentional exception flag is not set; in all other cases, 0. | _Order 4. 1 when fully implemented._ |
| Required Slot Coverage Percent | Determined by priority: 100 if the required slot count is 0; in all other cases, 100 times the required present count divided by the required slot count rounded to 0 decimal place(s). | _Order 5. Percent of slots required for this physical area that are present._ |
| Expected Area | Determined by priority: “root” if the area is “root”; “toy-rulebooks” if the toy by coverage flag is set; in all other cases, “rulebook-examples”. | _Order 5. Folder implied by root/toy/example readiness._ |
| Is Misfiled | True when all of the following hold: the intentional exception flag is not set; the area is not “root”; and at least one of the following holds: all of the following hold: the toy by coverage flag is set and the area is not “toy-rulebooks” or all of the following hold: the toy by coverage flag is not set and the area is not “rulebook-examples”. | _Order 5. Physical folder disagrees with the witnessed classification._ |
| Readiness State | Determined by priority: “intentional-exception” if the intentional exception flag is set; “root-ready” if the fully implemented flag is set, in all other cases “root-incomplete” if the area is “root”; “toy” if the toy by coverage flag is set; “example-ready” if the fully implemented flag is set; in all other cases, “example-incomplete”. | _Order 5. intentional-exception \| root-ready \| root-incomplete \| toy \| example-ready \| example-incomplete._ |
| Launch Profiles | A defined attribute. | _Reverse relationship: explicit launch instructions for this governed row._ |
| **Project Launch Profile** | One explicit launch contract for every governed project or intentional container. | — |
| Domain | A defined attribute. | _FK to the governed repository project._ |
| Working Directory | A defined attribute. | _Exact repository-relative working directory._ |
| Start Command | A defined attribute. | _Exact command a visitor runs from WorkingDirectory._ |
| Experience Description | A defined attribute. | _What the launch command starts._ |
| Prerequisite Notes | A defined attribute. | _Explicit setup or dependency requirements._ |
| Experience Kind | A defined attribute. | _web \| editor \| rulespeak \| rulebook \| cli._ |
| Is Start Required | True when an empty string. | _False only for intentional non-project containers._ |
| Requires Local URL | True when an empty string. | _Whether this experience must expose a localhost URL._ |
| Name | Computed as the domain, followed by “ launch”. | _Order 1. Human display alias._ |
| Local Services | A defined attribute. | _Reverse relationship: localhost services started by this profile._ |
| Primary Service Count | The total is primary flag across the project local services related to the project launch profile. | _Order 1. Number of services marked primary._ |
| Service Count | The number of project local services related to the project launch profile. | _Order 1. Number of modeled localhost services._ |
| Has Complete Instructions | True when all of the following hold: the working directory has a value; the start command has a value; and the experience description has a value. | _Order 1. Working directory, command, and experience are explicit._ |
| Has Primary Service | True when the primary service count is 1. | _Order 2. Exactly one local service is primary._ |
| Is Launch Contract Complete | True when all of the following hold: the complete instructions flag is set and at least one of the following holds: the requires local URL flag is not set or the primary service flag is set. | _Order 3. Instructions are complete and URL-bearing experiences have one primary service._ |
| **Project Local Service** | Explicit localhost services and health endpoints owned by project launch profiles. | — |
| Launch Profile | A defined attribute. | _FK to the launch profile that owns this service._ |
| Service Role | A defined attribute. | _primary \| editor-ui \| editor-api._ |
| Local URL | A defined attribute. | _Explicit localhost URL exposed by the service._ |
| Health URL | A defined attribute. | _Explicit localhost URL used to confirm reachability._ |
| Sort Order | A defined attribute. | _Display order within the launch profile._ |
| Is Primary Flag | A defined attribute. | _1 only for the profile's primary visitor experience._ |
| Name | Computed as the launch profile, followed by a space, followed by the service role. | _Order 1. Human display alias._ |
| Has Health URL | True when the health URL has a value. | _Order 1. A health URL is explicitly modeled._ |
| Is Http Service | True when at least one of the following holds: the first 7 character(s) of the local URL is “http://” or the first 8 character(s) of the local URL is “https://”. | _Order 1. The service uses local HTTP._ |
| Is Complete | True when all of the following hold: the local URL has a value and the health URL has a value. | _Order 1. Both launch and health URLs are explicit._ |
| **Rulebook Flavor** | Classification of each demo rulebook under rulebook-examples/. Lets the UI group projects by what they're TEACHING — a tutorial ladder is a different beast from a computation-heavy ontology. Density numbers come from a static analysis of each rulebook (calculated/aggregation/lookup counts). | — |
| Name | The same as its display name. | _Order 1. Display alias (calculated). Order 1._ |
| Sort Order | A defined attribute. | _Ascending integer; drives default display order in the portal. Lower = shown first. Tutorial-ladder projects sort before demos; demos before meta/graph._ |
| Project Slug | A defined attribute. | _Folder under rulebook-examples/ — also the active-domain.txt value_ |
| Domain | A defined attribute. | _FK to RulebookDomains — the project directory this flavor card describes._ |
| Display Name | A defined attribute. | — |
| Tagline | A defined attribute. | _One-sentence (~120 chars) summary used in the admin UI and as the rulebook Description._ |
| Logo Path | A defined attribute. | _Repo-relative path to the demo's effortless-logo.png (300x300, cartoon style)._ |
| Flavor | A defined attribute. | _crud-template \| computation-heavy \| aggregation-heavy \| graph-ontology \| meta-rulebook \| tutorial-ladder_ |
| Complexity | A defined attribute. | _minimal \| basic \| advanced_ |
| Entity Count | A defined attribute. | — |
| Calculated Count | A defined attribute. | _Number of calculated fields_ |
| Aggregation Count | A defined attribute. | — |
| Lookup Count | A defined attribute. | — |
| Learning Focus | A defined attribute. | _What this demo is designed to teach_ |
| Good Answer Key for | A defined attribute. | _Substrate(s) this demo makes a particularly good answer-key witness for — when applicable_ |
| Flavor Tags | A defined attribute. | _Reverse relationship: FlavorTags rows whose Flavor points here._ |
| Derived Field Count | Computed as the calculated count plus the aggregation count plus the lookup count. | _Order 1. Calculated + aggregation + lookup fields._ |
| Has Domain | True when the domain has a value. | _Order 1. Card is linked to an existing project directory._ |
| Tag Count | The number of flavor tags related to the rulebook flavor. | _Order 1. Tags attached to this card._ |
| Answer Key Target Count | Determined by priority: 0 if the good answer key for is blank; in all other cases, the length of the good answer key for minus the length of the good answer key for with every a comma replaced by an empty string plus 1. ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 1. Substrates listed as good answer keys._ |
| Domain Area | Taken from the linked domain. | _Order 1. Area of the linked domain._ |
| Derived Ratio | Determined by priority: 0 if the entity count is 0; in all other cases, the derived field count divided by the entity count rounded to 2 decimal place(s). | _Order 2. Derived fields per entity._ |
| Is Tagged | True when the tag count is greater than 0. | _Order 2. Card carries at least one tag._ |
| Is Toy Flavor | True when the domain area is “toy-rulebooks”. | _Order 2. Linked domain is a toy._ |
| Domain Finding Count | Taken from the linked domain. | _Order 2. Findings recorded against the linked domain._ |
| Domain Open Finding Count | Taken from the linked domain. | _Order 3. Open findings on the linked domain._ |
| Is Dense Derivation | True when the derived ratio is at least 1. | _Order 3. At least one derived field per entity._ |
| Is Catalog Complete | True when all of the following hold: the domain flag is set and the tagged flag is set. | _Order 3. Linked to a real domain and tagged._ |
| Domain is Consistent | True when the rulebook flavor's domain is a fully consistent. | _Order 4. Whether the linked domain has no open findings._ |
| Domain is Standard Layout | True when the linked domain is a standard layout. | _Order 4. Whether the linked domain's rulebook is at the canonical path._ |
| Is Showcase Card | True when all of the following hold: the catalog complete flag is set and the domain open finding count (a missing value counts as 1) is 0. | _Order 4. Complete card whose domain has no open findings._ |
| Is Catalog Ready | True when all of the following hold: the showcase card flag is set and the domain is consistent (a missing value counts as false). ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 5. Card and domain are both clean — safe to feature._ |
| Domain Conformance Score | Taken from the linked domain. | _Order 5. Conformance score of the linked domain._ |
| **Field Type Taxonomy** | Names every field-type the rulebook supports, with intent and example formula shape. Lets the UI explain what makes a calculated field different from a lookup field from an aggregation, instead of just showing a type tag. | — |
| Name | The same as its type name. | _Order 1. Display alias (calculated). Order 1._ |
| Type Name | A defined attribute. | _The string that appears in schema[].type_ |
| Intent | A defined attribute. | _What this type is FOR — one sentence_ |
| Example Formula | A defined attribute. | _A representative formula or definition shape_ |
| Storage Mode | A defined attribute. | _stored \| derived-at-read \| derived-at-write — where this field's value lives_ |
| Read Only in Ui | True when an empty string. | _True if the portal should never let users edit this field's value directly_ |
| Expressive Tier | A defined attribute. | _Which substrate ExpressiveCompleteness tier is required to faithfully evaluate this — full \| partial-formula \| partial-aggregation \| shape-only_ |
| Is Stored | True when the storage mode is “stored”. | _Order 1. Field type is stored in the base table._ |
| Is Fully Expressive Tier | True when the expressive tier is “full”. | _Order 1. Field type belongs to the full expressive tier._ |
| Is Stored and Editable | True when all of the following hold: the stored flag is set and the read only in ui flag is not set. | _Order 2. Stored and user-editable in the UI._ |
| Tier Label | Determined by priority: “input” if the stored and editable flag is set; “derived-full” if the fully expressive tier flag is set; in all other cases, “derived-partial”. | _Order 3. input / derived-full / derived-partial._ |
| Is Input Tier | True when the tier label is “input”. | _Order 4. User-entered field type._ |
| Ui Hint | Determined by priority: “editable” if the input tier flag is set; in all other cases, “read-only”. | _Order 5. editable / read-only._ |
| **Formula Dialect** | Catalog of formula dialects that a rulebook can declare. Per-rulebook formula dialect is headline feature #6: each demo rulebook names which dialect it speaks (in _meta.formulaDialect), and substrates honor that declaration. The platform rulebook does not enumerate which functions a dialect supports — that lives in each demo rulebook's own formula definitions. This catalog only registers the dialects themselves. | — |
| Name | A defined attribute. | — |
| Origin | A defined attribute. | _Where the dialect's surface syntax comes from (Excel, Airtable, etc.)._ |
| Field Ref Syntax | A defined attribute. | _How a rulebook formula references another field._ |
| String Concat | A defined attribute. | _How strings are concatenated in this dialect._ |
| Case Sensitive | True when an empty string. | — |
| Example Formula | A defined attribute. | — |
| Primary Substrates | A defined attribute. | _Substrates that have the richest support for this dialect._ |
| Status | A defined attribute. | _active \| experimental \| deprecated_ |
| Notes | A defined attribute. | — |
| Is Active | True when the status is “active”. | _Order 1. Dialect is active._ |
| Primary Substrate Count | Determined by priority: 0 if the primary substrates is blank; in all other cases, the length of the primary substrates minus the length of the primary substrates with every a comma replaced by an empty string plus 1. ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 1. Substrates listed as primary for this dialect._ |
| Is Active Multi Substrate | True when all of the following hold: the active flag is set and the primary substrate count is greater than 1. | _Order 2. Active dialect spanning several substrates._ |
| Dialect Role | Determined by priority: “primary” if the active multi substrate flag is set; “niche” if the active flag is set; in all other cases, “retired”. | _Order 3. primary / niche / retired._ |
| Is Primary Dialect | True when the dialect role is “primary”. | _Order 4. Active dialect spanning several substrates._ |
| Dialect Label | Determined by priority: the name, followed by “ (primary)” if the primary dialect flag is set; in all other cases, the name. | _Order 5. Display label marking the primary dialect._ |
| **Demo Narrative** | Curated narratives that demonstrate ERB capabilities in motion: substrates 'follow along' as the rulebook changes. Two narrative styles coexist: (1) commit-sequence narratives (legacy) where a single demo rulebook evolves over commits; (2) cross-rulebook narratives (current) where the same demo is observed across DIFFERENT rulebooks side-by-side. Cross-rulebook supersedes commit-sequence because RulebookDomains now form a tree (ParentDomainId) — the progression is data, not git history. | — |
| Name | Computed as the narrative name, followed by “ / ”, followed by the step name. | _Order 1. Display alias (calculated). Order 1._ |
| Order | A defined attribute. | _Order within the narrative sequence._ |
| Narrative Name | A defined attribute. | _Name of the overall narrative this step belongs to._ |
| Step Name | A defined attribute. | — |
| Related Domain ID | A defined attribute. | _FK to RulebookDomains.DomainId, when this step uses a specific demo rulebook._ |
| What Happens | A defined attribute. | — |
| Key Lesson | A defined attribute. | — |
| Observed Cost | A defined attribute. | _Per-substrate cost observation (e.g. 'OWL 10s, English 5min')._ |
| Narrative Style | A defined attribute. | _commit-sequence (legacy) \| cross-rulebook (current) — how the steps are realized at demo time._ |
| Status | A defined attribute. | _active \| deprecated. Deprecated narratives are preserved for historical context but should not be used for new demos._ |
| Superseded by | A defined attribute. | _Name of the narrative that supersedes this one. Lossy soft reference: NarrativeName is shared by all step rows of a narrative, so this cannot be a single-row FK without a Narratives header table (future junction candidate)._ |
| Is Deprecated | True when the status is “deprecated”. | _Order 1. Narrative step is deprecated._ |
| Is Superseded | True when the superseded by has a value. | _Order 1. A successor narrative is named._ |
| Domain Name | Taken from the linked related domain ID. | _Order 1. Name of the related domain._ |
| Is Retired | True when at least one of the following holds: the deprecated flag is set or the superseded flag is set. | _Order 2. Deprecated or superseded._ |
| Domain is Toy | True when the linked related domain ID is a toy. | _Order 2. Whether the related domain is a toy._ |
| Is Retired Toy Story | True when all of the following hold: the retired flag is set and the domain is toy (a missing value counts as false). ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 3. Retired narrative about a toy._ |
| Is Live Story | True when all of the following hold: the retired flag is not set and the related domain ID has a value. | _Order 3. Current narrative bound to an existing domain._ |
| Story State | Determined by priority: “live” if the live story flag is set; “retired-toy” if the retired toy story flag is set; in all other cases, “retired”. | _Order 4. live / retired-toy / retired._ |
| Is Current Story | True when the story state is “live”. | _Order 5. Narrative still tells a current story._ |
| **Glossary** | Authoritative glossary for the ERB platform. Every term used in orchestration code, docs, the admin portal UI, or rulebook tables appears here EXACTLY ONCE, with a definition AND an ImplementedAs pointer back into this rulebook (or to source files when the implementation is code rather than data). If a term appears in repo prose but has no row here, that's a documentation bug. If a term has a row here but no ImplementedAs target, that's an architecture bug — every concept should be data, code, or a value. | — |
| Name | The same as its term. | _Order 1. Display alias (calculated). Order 1._ |
| Term | A defined attribute. | _The canonical word/phrase as it appears in code and docs._ |
| Category | A defined attribute. | _concept \| role \| artifact \| phase \| substrate \| dimension \| pattern \| tool \| location \| invariant — what KIND of thing this term refers to._ |
| Definition | A defined attribute. | _One precise sentence. Do not restate the term itself._ |
| Implemented As | A defined attribute. | _Pointer to where this term is realized: 'table:X', 'column:X.Y', 'value:X.Y=Z', 'file:path/to/file', or 'axiom:axiom-id'. The promise is that a reader can follow this pointer and find the concept's actual realization._ |
| Aliases | A defined attribute. | _Comma-separated other names that should resolve to this term. The canonical spelling is in Term; aliases redirect to it._ |
| Notes | A defined attribute. | — |
| Alias Count | Determined by priority: 0 if the aliases is blank; in all other cases, the length of the aliases minus the length of the aliases with every a comma replaced by an empty string plus 1. ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 1. Number of aliases listed._ |
| Has Implementation | True when the implemented as has a value. | _Order 1. Term points at a concrete implementation._ |
| Implementation Kind | Determined by priority: an empty string if the length of the implemented as (a missing value counts as an empty string) is the length of the implemented as (a missing value counts as an empty string) with every “:” replaced by an empty string; in all other cases, the first the position of “:” within the implemented as minus 1 character(s) of the implemented as. ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 1. Prefix of ImplementedAs before the colon (file, table, script ...); blank when none._ |
| Is File Backed | True when the implementation kind is “file”. | _Order 2. Implemented as a file path._ |
| Is Rich Term | True when all of the following hold: the alias count is greater than 0 and the implementation flag is set. | _Order 2. Has aliases and an implementation pointer._ |
| Term Quality | Determined by priority: “anchored” if the file backed flag is set, in all other cases “rich” if the rich term flag is set; “implemented” if the implementation flag is set; in all other cases, “definition-only”. | _Order 3. anchored / rich / implemented / definition-only._ |
| Is Anchored | True when the term quality is “anchored”. | _Order 4. Rich term anchored to a file._ |
| Glossary Tier | Determined by priority: “tier-1” if the anchored flag is set; “tier-2” if the term quality is “rich”; in all other cases, “tier-3”. | _Order 5. tier-1 / tier-2 / tier-3._ |
| **Rulebook Tag** | Tag catalog for RulebookFlavors. Each tag has a color and emoji so it renders as a visible chip in the portal. Tags are flexible attributes — a flavor can have many tags. Browse/filter the flavors grid by any combination of tags. | — |
| Name | The same as its label. | _Order 1. Display alias (calculated). Order 1._ |
| Label | A defined attribute. | _Short human-readable label shown as the chip text._ |
| Category | A defined attribute. | _source \| substrate \| purpose \| complexity \| feature \| flavor — groups tags in the filter panel._ |
| Color | A defined attribute. | _Hex color for the chip background, e.g. #18BFFF._ |
| Emoji | A defined attribute. | _Emoji or icon character shown as the leading icon on the chip._ |
| Description | A defined attribute. | _One sentence: what this tag means and when to apply it._ |
| Flavor Tags | A defined attribute. | _Reverse relationship: FlavorTags rows whose Tag points here._ |
| Usage Count | The number of flavor tags related to the rulebook tag. | _Order 1. Flavor cards carrying this tag._ |
| Is Source Tag | True when the category is “source”. | _Order 1. Tag describes the rulebook's source spoke._ |
| Is Unused | True when the usage count is 0. | _Order 2. No flavor card uses this tag._ |
| Unused Flag | Determined by priority: 1 if the usage count is 0; in all other cases, 0. | _Order 2. 1 when unused — rollup carrier._ |
| Tag Health | Determined by priority: “unused” if the unused flag is set; “common” if the usage count is at least 5; in all other cases, “rare”. | _Order 3. unused / common / rare._ |
| Is Retirement Candidate | True when the tag health is “unused”. | _Order 4. No card uses the tag._ |
| Tag Action | Determined by priority: “retire” if the retirement candidate flag is set; in all other cases, “keep”. | _Order 5. retire / keep._ |
| **Flavor Tag** | Junction table linking RulebookFlavors to RulebookTags (many-to-many via junction). A flavor can have any number of tags; a tag can apply to any number of flavors. The portal renders each flavor's tags as colored chip rows in the grid and uses them to drive the filter panel. | — |
| Name | Computed as the flavor, followed by “:”, followed by the tag. | _Order 1. Display alias (calculated). Order 1._ |
| Flavor | A defined attribute. | _FK to RulebookFlavors.FlavorId._ |
| Tag | A defined attribute. | _FK to RulebookTags.TagId._ |
| Tag Label | Taken from the linked tag. | _Order 1. Label of the tag._ |
| Tag Category | Taken from the linked tag. | _Order 1. Category of the tag._ |
| Flavor Display Name | Taken from the linked flavor. | _Order 1. Display name of the flavor card._ |
| Is Source Tagging | True when the tag category is “source”. | _Order 2. Tag records the source spoke._ |
| Flavor Tag Count | Taken from the linked flavor. | _Order 2. How many tags the card carries in total._ |
| Is Sole Tag | True when the flavor tag count (a missing value counts as 0) is 1. | _Order 3. The only tag on its card._ |
| Tag Share | Determined by priority: 0 if the flavor tag count (a missing value counts as 0) is 0; in all other cases, 100 divided by the flavor tag count rounded to 0 decimal place(s). | _Order 3. Percent of the card's tag weight this tag holds._ |
| Is Defining Tag | True when all of the following hold: the sole tag flag is set and the source tagging flag is set. | _Order 4. Sole tag on the card and it names the source spoke._ |
| Tag Weight | Determined by priority: 2 if the defining tag flag is set; in all other cases, 1. | _Order 5. Defining tags weigh double in card summaries._ |
| **Claude Skill** | The catalog of Claude Code skills that make up the effortless-claude skill set. Each skill is a loadable instruction set that pre-teaches Claude everything it needs to work in an ERB project — naming conventions, pipeline mechanics, formula semantics, etc. Skills are the answer to the LLM learning-curve problem: instead of every user teaching Claude from scratch, the learning is encoded once and loaded on demand. LocalMirrorPath is a derived artifact: clone-skills.sh pulls a live copy of each skill from the source repo so the docs/skills/ mirror stays current. | — |
| Name | A defined attribute. | _Skill directory name, matches the slash command without the leading /_ |
| Slash Command | Computed as a slash, followed by the name. | _Order 1. The slash command users invoke, e.g. /effortless-cmcc_ |
| Category | A defined attribute. | _theory \| modeling \| pipeline \| setup \| tooling \| data \| ecosystem \| features_ |
| Load Gate | A defined attribute. | _When this skill may load: effortless-project (dual-marker gate), explicit-request, evaluative-question, entry-point (may also load to create the marker), or proactive._ |
| Is Entry Point | True when an empty string. | _True for skills allowed to load outside a marked Effortless project because their job is to create or manage the tooling itself._ |
| Status | A defined attribute. | _active or deprecated. Deprecated skills remain modeled so the catalog explains what replaced them._ |
| One Line Summary | A defined attribute. | _One sentence describing when to use this skill_ |
| Audience | A defined attribute. | _customer \| general — who this skill is written for_ |
| Local Mirror Path | Computed as “docs/skills/”, followed by the name, followed by “/SKILL.md”. | _Order 1. Path to the derived local mirror of this skill. Generated by clone-skills.sh; DO NOT EDIT by hand._ |
| Clone URL | A defined attribute. | _Raw GitHub URL from which clone-skills.sh pulls a fresh copy of this skill_ |
| Highlight in Readme | True when an empty string. | _True if this skill should appear in the README skills highlights table — the ones most directly relevant to building with this repo_ |
| Project | A defined attribute. | _FK to ProjectMetadata — roots this catalog row to the platform row so repo-wide rollups exist on one dashboard record._ |
| Outbound Routes | A defined attribute. | _Reverse relationship: routes leaving this skill._ |
| Inbound Routes | A defined attribute. | _Reverse relationship: routes arriving at this skill._ |
| Is Deprecated | True when the status is “deprecated”. | _Order 1. Skill is deprecated._ |
| Deprecated Flag | Determined by priority: 1 if the status is “deprecated”; in all other cases, 0. | _Order 1. 1 when deprecated — rollup carrier._ |
| Outbound Route Count | The number of skill routes related to the claude skill. | _Order 1. Routes leaving this skill._ |
| Inbound Route Count | The number of skill routes related to the claude skill. | _Order 1. Routes arriving at this skill._ |
| Is Customer Facing | True when the audience is “customer”. | _Order 1. Audience is customer._ |
| Is Isolated | True when all of the following hold: the outbound route count is 0 and the inbound route count is 0. | _Order 2. No routing edge touches this skill._ |
| Isolated Flag | Determined by priority: 1 if all of the following hold: the outbound route count is 0 and the inbound route count is 0; in all other cases, 0. | _Order 2. 1 when isolated — rollup carrier._ |
| Is Hub | True when the outbound route count is at least 5. | _Order 2. Routes to five or more skills._ |
| Route Degree | Computed as the outbound route count plus the inbound route count. | _Order 2. Total routing edges._ |
| Skill Role | Determined by priority: “isolated” if the isolated flag is set; “hub” if the hub flag is set; “leaf” if the inbound route count is greater than 0; in all other cases, “source”. | _Order 3. isolated / hub / leaf / source._ |
| Is Live Hub | True when all of the following hold: the hub flag is set and the deprecated flag is not set. | _Order 3. Active hub skill._ |
| Is Deprecated But Routed | True when all of the following hold: the deprecated flag is set and the route degree is greater than 0. | _Order 3. Deprecated yet still wired into the routing graph._ |
| Catalog State | Determined by priority: “deprecated-routed” if the deprecated but routed flag is set; “hub” if the live hub flag is set; in all other cases, the skill role. | _Order 4. deprecated-routed / hub / role._ |
| Healthy Flag | Determined by priority: 0 if at least one of the following holds: the deprecated but routed flag is set or the isolated flag is set; in all other cases, 1. | _Order 4. 1 when the catalog entry is healthy — rollup carrier._ |
| Needs Catalog Action | True when the healthy flag is 0. | _Order 5. Isolated or deprecated-but-routed — needs a catalog decision._ |
| Catalog Label | Computed as the name, followed by “ [”, followed by the catalog state, followed by “]”. | _Order 5. Display label with catalog state._ |
| **Build Phas** | Delivery phases of the repo-consistency programme. Contract table for rulebook-to-progress-report. QuotedPrice values are illustrative planning weights, not invoices. | — |
| Name | The same as its title. | _Order 1. Display alias (calculated). Order 1._ |
| Phase Number | A defined attribute. | _Ordinal position of the phase in the programme._ |
| Title | A defined attribute. | _Human title of the phase._ |
| Quoted Price | A defined attribute. | _Illustrative planning weight in currency units. Progress-report contract: any phase carrying a price must contain stories that carry criteria._ |
| Duration Months | A defined attribute. | _Planned duration in months._ |
| Phase Kind | A defined attribute. | _fixed-price \| priced-option. Progress-report mirrors IsInBaseBid/IsFixedPrice from this._ |
| Is Current Bid | True when an empty string. | _Exactly one phase carries TRUE (progress-report hard requirement)._ |
| Summary | A defined attribute. | _One-paragraph scope of the phase._ |
| Project | A defined attribute. | _FK to ProjectMetadata — roots the phase to the platform dashboard row._ |
| ERB Packages | A defined attribute. | _Reverse relationship: packages landing primarily in this phase._ |
| User Stories | A defined attribute. | _Reverse relationship: stories scheduled in this phase._ |
| Story Count | The number of user stories related to the build phas. | _Order 1. Stories scheduled in this phase._ |
| Package Count | The number of ERB packages related to the build phas. | _Order 1. Packages landing primarily in this phase._ |
| Is Priced | True when the quoted price (a missing value counts as 0) is greater than 0. | _Order 1. Phase carries a quoted price._ |
| Priced Flag | Determined by priority: 1 if the quoted price (a missing value counts as 0) is greater than 0; in all other cases, 0. | _Order 1. 1 when priced — rollup carrier._ |
| Is Fixed Price | True when the phase kind is “fixed-price”. | _Order 1. Phase kind is fixed-price._ |
| Done Story Count | The total done flag across the user stories related to the build phas. | _Order 2. Stories asserted done in this phase._ |
| Effort Weight Sum | The total effort weight across the user stories related to the build phas. | _Order 2. Sum of effort weights of the phase's stories._ |
| Has Stories | True when the story count is greater than 0. | _Order 2. Phase has at least one story._ |
| Done Percent | Determined by priority: 0 if the story count is 0; in all other cases, 100 times the done story count divided by the story count rounded to 0 decimal place(s). | _Order 3. Percent of stories asserted done._ |
| Weighted Done Sum | The total weighted done across the user stories related to the build phas. | _Order 3. Effort weight earned by done stories._ |
| Is Priced With Stories | True when all of the following hold: the priced flag is set and the stories flag is set. | _Order 3. Priced phase that carries stories (progress-report guard)._ |
| Weighted Done Percent | Determined by priority: 0 if the effort weight sum is 0; in all other cases, 100 times the weighted done sum divided by the effort weight sum rounded to 0 decimal place(s). | _Order 4. Effort-weighted percent of the phase asserted done._ |
| Avg Story Progress | The average derived progress percent across the user stories related to the build phas. | _Order 4. Mean criteria-derived progress of the phase's stories._ |
| Is Contract Safe | True when at least one of the following holds: the priced flag is not set or the priced with stories flag is set. | _Order 4. Will not trip the progress-report priced-phase refusal._ |
| Phase State | Determined by priority: “complete” if the weighted done percent is 100; “in-progress” if the weighted done percent is greater than 0; “bid” if the current bid flag is set; in all other cases, “planned”. | _Order 5. complete / in-progress / bid / planned._ |
| Is Report Safe | True when all of the following hold: the contract safe flag is set and the stories flag is set. | _Order 5. Passes every progress-report phase guard._ |
| **Effort Class** | Effort/complexity classes for user stories (progress-report contract; the most demanding class must be literally named G3). | — |
| Name | The same as its title. | _Order 1. Display alias (calculated). Order 1._ |
| Title | A defined attribute. | _Human label of the class._ |
| Complexity Weight | A defined attribute. | _Non-zero weight used in effort-weighted rollups (progress-report hard requirement)._ |
| Sort Order | A defined attribute. | _Ascending complexity order._ |
| User Stories | A defined attribute. | _Reverse relationship: stories in this effort class._ |
| Story Count | The number of user stories related to the effort class. | _Order 1. Stories in this effort class._ |
| Weighted Story Load | Computed as the story count times the complexity weight. | _Order 2. Story count times complexity weight._ |
| Is Heavy Load | True when the weighted story load is at least 20. | _Order 3. Weighted load of 20 or more._ |
| Load Band | Determined by priority: “heavy” if the heavy load flag is set; in all other cases, “light”. | _Order 4. heavy / light._ |
| Class Label | Computed as the title, followed by “ (”, followed by the load band, followed by “)”. | _Order 5. Display label with load band._ |
| **Delivery Discipline** | Delivery disciplines splitting programme effort. Client-visible SharePercent must sum to 100 (progress-report hard requirement). | — |
| Name | The same as its title. | _Order 1. Display alias (calculated). Order 1._ |
| Title | A defined attribute. | _Discipline label._ |
| Share Percent | A defined attribute. | _Share of total effort. Client-visible rows sum to exactly 100._ |
| Description | A defined attribute. | _What work belongs to this discipline._ |
| Client Visible | True when an empty string. | _Included in the client-facing 100% split._ |
| Sort Order | A defined attribute. | _Display order._ |
| Visible Share | Determined by priority: the share percent if the client visible flag is set; in all other cases, 0. | _Order 1. SharePercent when client-visible, else 0 (the client split must sum to 100)._ |
| Is Major Discipline | True when the share percent is at least 20. | _Order 1. Discipline takes at least a fifth of effort._ |
| Is Visible Major | True when all of the following hold: the client visible flag is set and the major discipline flag is set. | _Order 2. Client-visible and major._ |
| Discipline Tier | Determined by priority: “major” if the visible major flag is set; “minor” if the client visible flag is set; in all other cases, “internal”. | _Order 3. major / minor / internal._ |
| Is Client Headline | True when the discipline tier is “major”. | _Order 4. Major client-visible discipline._ |
| Discipline Label | Determined by priority: the title, followed by “ *” if the client headline flag is set; in all other cases, the title. | _Order 5. Display label starring headline disciplines._ |
| **ERB Package** | Capability packages of the platform programme (progress-report contract). | — |
| Name | The same as its title. | _Order 1. Display alias (calculated). Order 1._ |
| Title | A defined attribute. | _Package title._ |
| Primary Phase | A defined attribute. | _FK to BuildPhases — the phase where the bulk of this package lands._ |
| Sort Order | A defined attribute. | _Display order._ |
| Summary | A defined attribute. | _What the package delivers._ |
| Project | A defined attribute. | _FK to ProjectMetadata._ |
| ERB Feature Categories | A defined attribute. | _Reverse relationship: epics in this package._ |
| ERB Features | A defined attribute. | _Reverse relationship: features in this package._ |
| Category Count | The number of ERB feature categories related to the ERB package. | _Order 1. Epics in this package._ |
| Feature Count | The number of ERB features related to the ERB package. | _Order 1. Features in this package._ |
| Phase Title | Taken from the linked primary phase. | _Order 1. Title of the primary phase._ |
| Phase Number | Taken from the linked primary phase. | _Order 1. Number of the primary phase._ |
| Story Count | The total story count across the ERB features related to the ERB package. | _Order 2. Stories across the package's features._ |
| Phase is Priced | True when the linked primary phase is priced. | _Order 2. Whether the primary phase is priced._ |
| Done Story Count | The total done story count across the ERB features related to the ERB package. | _Order 3. Done stories across the package's features._ |
| Is Priced Package | True when all of the following hold: the phase is priced (a missing value counts as false) and the story count is greater than 0. ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 3. Lands in a priced phase and has stories._ |
| Done Percent | Determined by priority: 0 if the story count is 0; in all other cases, 100 times the done story count divided by the story count rounded to 0 decimal place(s). | _Order 4. Percent of the package's stories asserted done._ |
| Avg Feature Done Percent | The average done percent across the ERB features related to the ERB package. | _Order 4. Mean of feature done percentages._ |
| Is Complete | True when the done percent is 100. | _Order 5. Every story in the package is done._ |
| Package State | Determined by priority: “complete” if the done percent is 100; “in-progress” if the avg feature done percent (a missing value counts as 0) is greater than 0; in all other cases, “planned”. | _Order 5. complete / in-progress / planned._ |
| **ERB Feature Category** | Feature categories (epics) of the programme (progress-report contract). | — |
| Name | The same as its title. | _Order 1. Display alias (calculated). Order 1._ |
| Title | A defined attribute. | _Epic title._ |
| ERB Package | A defined attribute. | _FK to ERBPackages._ |
| Sort Order | A defined attribute. | _Display order._ |
| Summary | A defined attribute. | _Scope of the epic._ |
| ERB Features | A defined attribute. | _Reverse relationship: features in this epic._ |
| User Stories | A defined attribute. | _Reverse relationship: stories under this epic._ |
| Feature Count | The number of ERB features related to the ERB feature category. | _Order 1. Features in this epic._ |
| Story Count | The number of user stories related to the ERB feature category. | _Order 1. Stories under this epic._ |
| Package Title | Taken from the linked ERB package. | _Order 1. Title of the owning package._ |
| Has Stories | True when the story count is greater than 0. | _Order 2. Epic has at least one story._ |
| Package Feature Count | Taken from the linked ERB package. | _Order 2. Features in the owning package._ |
| Feature Done Story Count | The total done story count across the ERB features related to the ERB feature category. | _Order 3. Done stories across the epic's features._ |
| Share of Package Features | Determined by priority: 0 if the package feature count is 0; in all other cases, 100 times the feature count divided by the package feature count rounded to 0 decimal place(s). | _Order 3. Percent of the package's features in this epic._ |
| Done Percent | Determined by priority: 0 if the story count is 0; in all other cases, 100 times the feature done story count divided by the story count rounded to 0 decimal place(s). | _Order 4. Percent of the epic's stories asserted done._ |
| Avg Story Progress | The average derived progress percent across the user stories related to the ERB feature category. | _Order 4. Mean criteria-derived progress of the epic's stories._ |
| Epic State | Determined by priority: “complete” if the done percent is 100; “in-progress” if the avg story progress (a missing value counts as 0) is greater than 0; in all other cases, “planned”. | _Order 5. complete / in-progress / planned._ |
| **ERB Feature** | Individual features of the programme (progress-report contract). | — |
| Name | The same as its title. | _Order 1. Display alias (calculated). Order 1._ |
| Title | A defined attribute. | _Feature title._ |
| Category | A defined attribute. | _FK to ERBFeatureCategories (the epic)._ |
| ERB Package | A defined attribute. | _FK to ERBPackages. Redundant one-hop copy of the epic's package so package rollups stay 1-hop (SDLAF flattening)._ |
| Summary | A defined attribute. | _What the feature delivers._ |
| User Stories | A defined attribute. | _Reverse relationship: stories delivering this feature._ |
| Story Count | The number of user stories related to the ERB feature. | _Order 1. Stories delivering this feature._ |
| Category Title | Taken from the linked category. | _Order 1. Title of the epic._ |
| Package Title | Taken from the linked ERB package. | _Order 1. Title of the package._ |
| Done Story Count | The total done flag across the user stories related to the ERB feature. | _Order 2. Stories asserted done for this feature._ |
| Has Stories | True when the story count is greater than 0. | _Order 2. Feature has at least one story._ |
| Category Story Count | Taken from the linked category. | _Order 2. Stories under the owning epic._ |
| Done Percent | Determined by priority: 0 if the story count is 0; in all other cases, 100 times the done story count divided by the story count rounded to 0 decimal place(s). | _Order 3. Percent of stories asserted done._ |
| Share of Epic Stories | Determined by priority: 0 if the category story count is 0; in all other cases, 100 times the story count divided by the category story count rounded to 0 decimal place(s). | _Order 3. Percent of the epic's stories in this feature._ |
| Avg Story Progress | The average derived progress percent across the user stories related to the ERB feature. | _Order 4. Mean criteria-derived progress of the feature's stories._ |
| Is Complete | True when the done percent is 100. | _Order 4. Every story asserted done._ |
| Feature State | Determined by priority: “complete” if the complete flag is set; “in-progress” if the avg story progress (a missing value counts as 0) is greater than 0; in all other cases, “planned”. | _Order 5. complete / in-progress / planned._ |
| **User Story** | User stories of the repo-consistency programme (progress-report contract). | — |
| Name | The same as its req ID. | _Order 1. Display alias (calculated). Order 1._ |
| Req ID | A defined attribute. | _Requirement code shown in the report (US-001 ...)._ |
| Story Text | A defined attribute. | _As a <persona>, I want <capability>, so <outcome>._ |
| Build Phase | A defined attribute. | _FK to BuildPhases._ |
| Epic | A defined attribute. | _FK to ERBFeatureCategories. Read directly by the report (not inferred via Feature)._ |
| Feature | A defined attribute. | _FK to ERBFeatures._ |
| Effort Class | A defined attribute. | _FK to EffortClasses (G1/G2/G3)._ |
| Status | A defined attribute. | _todo \| in-progress \| done (asserted by the team)._ |
| Dev Progress Percent | A defined attribute. | _Asserted developer progress 0-100 (read by the progress-report tool)._ |
| Acceptance Criteria | A defined attribute. | _Reverse relationship: criteria of this story._ |
| Criterion Count | The number of acceptance criteria related to the user story. | _Order 1. Acceptance criteria attached._ |
| Is Done | True when the status is “done”. | _Order 1. Team asserts the story is done._ |
| Done Flag | Determined by priority: 1 if the status is “done”; in all other cases, 0. | _Order 1. 1 when done — rollup carrier._ |
| Effort Weight | The complexity weight of the user story's effort class. | _Order 1. Complexity weight of the effort class._ |
| Phase Number | Taken from the linked build phase. | _Order 1. Number of the scheduled phase._ |
| Feature Title | Taken from the linked feature. | _Order 1. Title of the feature._ |
| Met Criterion Count | The total met flag across the acceptance criteria related to the user story. | _Order 2. Acceptance criteria currently met._ |
| Has Criteria | True when the criterion count is greater than 0. | _Order 2. Story carries acceptance criteria._ |
| Weighted Done | Computed as the done flag times the effort weight. | _Order 2. Effort weight earned if done, else 0._ |
| Derived Progress Percent | Determined by priority: 100 times the met criterion count divided by the criterion count rounded to 0 decimal place(s) if the criteria flag is set; in all other cases, the dev progress percent. | _Order 3. Progress derived from met criteria; falls back to the asserted percent only when a story has no criteria._ |
| Is Acceptance Complete | True when all of the following hold: the criteria flag is set and the met criterion count is the criterion count. | _Order 3. Every criterion is met._ |
| Has Status Drift | True when all of the following hold: the done flag is set and the met criterion count is not the criterion count. | _Order 3. Asserted done while criteria remain unmet._ |
| Weighted Progress | Computed as the derived progress percent times the effort weight (a missing value counts as 0). | _Order 4. Derived progress times effort weight._ |
| Progress State | Determined by priority: “drift” if the status drift flag is set; “accepted” if the acceptance complete flag is set; “in-flight” if the derived progress percent is greater than 0; in all other cases, “not-started”. | _Order 4. drift / accepted / in-flight / not-started._ |
| Priority Band | Determined by priority: “fix-first” if the progress state is “drift”; “continue” if the progress state is “in-flight”; in all other cases, “queue”. | _Order 5. fix-first / continue / queue._ |
| Report Label | Computed as the req ID, followed by a space, followed by the progress state. | _Order 5. Display label with progress state._ |
| **Acceptance Criteria** | Acceptance criteria per user story (progress-report contract). | — |
| Name | The same as its acceptance criterion ID. | _Order 1. Display alias (calculated). Order 1._ |
| User Story | A defined attribute. | _FK to UserStories._ |
| Criterion | A defined attribute. | _Testable statement that must hold for the story to be accepted._ |
| Is Met | True when an empty string. | _Witnessed: the criterion currently holds._ |
| Met Flag | Determined by priority: 1 if the met flag is set; in all other cases, 0. | _Order 1. 1 when met — rollup carrier._ |
| Story Req ID | Taken from the linked user story. | _Order 1. ReqId of the owning story._ |
| Story Status | Taken from the linked user story. | _Order 1. Asserted status of the owning story._ |
| Story is Done | True when the acceptance criteria's user story is a done. | _Order 2. Whether the owning story is asserted done._ |
| Story Criterion Count | Taken from the linked user story. | _Order 2. Sibling criteria count._ |
| Is Inconsistent With Story | True when all of the following hold: the story is done (a missing value counts as false) and the met flag is not set. ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 3. Story says done but this criterion is not met._ |
| Share of Story | Determined by priority: 0 if the story criterion count (a missing value counts as 0) is 0; in all other cases, 100 divided by the story criterion count rounded to 0 decimal place(s). | _Order 3. Percent of the story this criterion represents._ |
| Story Derived Progress | The derived progress percent of the acceptance criteria's user story. | _Order 4. Criteria-derived progress of the owning story._ |
| Criterion State | Determined by priority: “contradicts-story” if the inconsistent with story flag is set; “met” if the met flag is set; in all other cases, “pending”. | _Order 4. contradicts-story / met / pending._ |
| Needs Review | True when the criterion state is “contradicts-story”. | _Order 5. Contradicts the story's asserted status._ |
| Story is Ahead of Criterion | True when all of the following hold: the met flag is not set and the story derived progress (a missing value counts as 0) is at least 50. | _Order 5. Story is over half done while this criterion is still pending._ |
| **Consistency Rule** | Repo-wide consistency invariants as data. Each row is a checkable rule with a fix playbook; ConsistencyFindings rows are its violations. | — |
| Name | The same as its rule code. | _Order 1. Display alias (calculated). Order 1._ |
| Rule Code | A defined attribute. | _Short slug code of the rule._ |
| Severity | A defined attribute. | _critical \| major \| minor._ |
| Scope | A defined attribute. | _demo (per project directory) \| repo (whole repository)._ |
| Statement | A defined attribute. | _The invariant in one sentence._ |
| Check Mechanism | A defined attribute. | _How the rule is verified (shell/jq sketch or derived-field reference)._ |
| Fix Playbook | A defined attribute. | _How to bring a violating project into conformance._ |
| Source Doctrine | A defined attribute. | _Where the rule is stated (CLAUDE.md section or skill)._ |
| Project | A defined attribute. | _FK to ProjectMetadata._ |
| Consistency Findings | A defined attribute. | _Reverse relationship: findings of this rule._ |
| Finding Count | The number of consistency findings related to the consistency rule. | _Order 1. Findings recorded under this rule (any status)._ |
| Is Critical | True when the severity is “critical”. | _Order 1. Severity is critical._ |
| Is Repo Scope | True when the scope is not “demo”. | _Order 1. Rule applies to the repo/platform rather than per demo._ |
| Open Finding Count | The total open flag across the consistency findings related to the consistency rule. | _Order 2. Open findings under this rule._ |
| Has Findings | True when the finding count is greater than 0. | _Order 2. Rule has ever been violated._ |
| Is Satisfied | True when the open finding count is 0. | _Order 3. No open findings under this rule._ |
| Satisfied Flag | Determined by priority: 1 if the open finding count is 0; in all other cases, 0. | _Order 3. 1 when satisfied — rollup carrier._ |
| Accepted or Fixed Count | Computed as the finding count minus the open finding count. | _Order 3. Findings that are fixed or accepted exceptions._ |
| Open Critical Flag | Determined by priority: 1 if all of the following hold: the critical flag is set and the open finding count is greater than 0; in all other cases, 0. | _Order 3. 1 when a critical rule has open findings._ |
| Rule State | Determined by priority: “satisfied” if the satisfied flag is set; “critical-open” if the open critical flag is 1; in all other cases, “open”. | _Order 4. satisfied / critical-open / open._ |
| Resolution Percent | Determined by priority: 100 if the finding count is 0; in all other cases, 100 times the accepted or fixed count divided by the finding count rounded to 0 decimal place(s). | _Order 4. Percent of findings resolved (fixed or accepted)._ |
| Rule Label | Computed as the rule code, followed by “ [”, followed by the rule state, followed by “]”. | _Order 5. Display label with rule state._ |
| Is Sweep Priority | True when all of the following hold: the rule state is not “satisfied” and the resolution percent is less than 50. | _Order 5. Unsatisfied and less than half resolved — sweep here first._ |
| **Consistency Finding** | Witnessed violations of ConsistencyRules, one row per (domain, rule) occurrence. This is the sweep work queue. | — |
| Name | Computed as the domain (a missing value counts as “repo”), followed by “ x ”, followed by the rule. ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 1. Display alias (calculated). Order 1._ |
| Rule | A defined attribute. | _FK to ConsistencyRules._ |
| Domain | A defined attribute. | _FK to RulebookDomains; null for repo-scope findings._ |
| Detail | A defined attribute. | _What exactly was observed._ |
| Status | A defined attribute. | _open \| fixed \| accepted-exception._ |
| Detected on | A defined attribute. | _ISO date the finding was witnessed._ |
| Is Open | True when the status is “open”. | _Order 1. Finding is still open._ |
| Open Flag | Determined by priority: 1 if the status is “open”; in all other cases, 0. | _Order 1. 1 when open — rollup carrier._ |
| Is Repo Scope | True when the domain is blank. | _Order 1. Finding is not tied to a single domain._ |
| Rule Severity | Taken from the linked rule. | _Order 1. Severity of the violated rule._ |
| Rule Code | Taken from the linked rule. | _Order 1. Code of the violated rule._ |
| Domain Name | Taken from the linked domain. | _Order 1. Name of the domain (blank for repo scope)._ |
| Is Open Critical | True when all of the following hold: the open flag is set and the rule severity is “critical”. | _Order 2. Open and critical._ |
| Domain Finding Count | Taken from the linked domain. | _Order 2. Total findings on the same domain._ |
| Rule Finding Count | Taken from the linked rule. | _Order 2. Total findings under the same rule._ |
| Domain Open Finding Count | Taken from the linked domain. | _Order 3. Open findings on the same domain._ |
| Rule Open Finding Count | Taken from the linked rule. | _Order 3. Open findings under the same rule._ |
| Is Sole Finding on Domain | True when the domain finding count (a missing value counts as 0) is 1. | _Order 3. The only finding ever recorded on its domain._ |
| Is Sole Blocker | True when all of the following hold: the open flag is set and the domain open finding count (a missing value counts as 0) is 1. | _Order 4. The one open finding keeping its domain from clean._ |
| Rule is Satisfied | True when the linked rule is satisfied. | _Order 4. Whether the rule is now fully satisfied._ |
| Domain Grade | The consistency grade of the consistency finding's domain. | _Order 4. Consistency grade of the domain._ |
| Priority | Determined by priority: “P1” if the open critical flag is set; “P2” if the sole blocker flag is set; “P3” if the open flag is set; in all other cases, “closed”. | _Order 5. P1 / P2 / P3 / closed._ |
| Is Last Mile | True when all of the following hold: the sole blocker flag is set and the domain grade (a missing value counts as an empty string) is “minor”. | _Order 5. Fixing this one finding makes its domain clean._ |
| **Mobile Nav Tab** | Primary navigation groups of the root explorer (app/). Rendered as a top navigation bar at desktop width and a bottom tab bar at phone width; each group roots a MobileRoutes subtree. The table name is historical: there is no separate /m mobile shell. | — |
| Name | The same as its label. | _Order 1. Display alias (calculated). Order 1._ |
| Label | A defined attribute. | _Tab label._ |
| Icon | A defined attribute. | _Icon name from the lucide icon set._ |
| Root Path | A defined attribute. | _Path of the group's root route._ |
| Sort Order | A defined attribute. | _Left-to-right order in the navigation bar._ |
| Purpose | A defined attribute. | _What the navigation group is for._ |
| Project | A defined attribute. | _FK to ProjectMetadata._ |
| Mobile Routes | A defined attribute. | _Reverse relationship: routes under this navigation group._ |
| Route Count | The number of mobile routes related to the mobile nav tab. | _Order 1. Routes under this tab._ |
| Unbuilt Route Count | The total unbuilt flag across the mobile routes related to the mobile nav tab. | _Order 2. Routes under this tab with no screen yet._ |
| Has Routes | True when the route count is greater than 0. | _Order 2. Tab roots at least one route._ |
| Build Coverage Percent | Determined by priority: 0 if the route count is 0; in all other cases, 100 times the route count minus the unbuilt route count divided by the route count rounded to 0 decimal place(s). | _Order 3. Percent of routes backed by an existing screen._ |
| Is Plan Only | True when all of the following hold: the routes flag is set and the unbuilt route count is the route count. | _Order 3. Every route is still unbuilt._ |
| Is Shippable | True when the build coverage percent is 100. | _Order 4. Every route has a screen._ |
| Shippable Flag | Determined by priority: 1 if the build coverage percent is 100; in all other cases, 0. | _Order 4. 1 when shippable — rollup carrier._ |
| Tab State | Determined by priority: “shippable” if the shippable flag is set; “plan-only” if the plan only flag is set; in all other cases, “partial”. | _Order 5. shippable / plan-only / partial._ |
| **Mobile Route** | Route surface of the root explorer (PLATFORM-EXPLORER-PLAN.md §3): deep-linkable routes under each navigation group. Screen names the React component (pages/<File>.jsx:<Export> under app/src/) that implements the route and stays blank until it exists, so the derived unbuilt counts are the Phase 3 build backlog. | — |
| Name | The same as its path. | _Order 1. Display alias (calculated). Order 1._ |
| Path | A defined attribute. | _Route path; :param segments mark detail routes._ |
| Title | A defined attribute. | _Screen title shown in the app bar._ |
| Tab | A defined attribute. | _FK to MobileNavTabs — the navigation group that owns this route._ |
| Parent Route | A defined attribute. | _FK to MobileRoutes — the breadcrumb parent; null for a group's root and for sibling lists._ |
| Screen | A defined attribute. | _React component implementing this route, as pages/<File>.jsx:<Export> under app/src/; blank until built._ |
| Route Kind | A defined attribute. | _dashboard \| list \| detail \| action \| settings._ |
| Sort Order | A defined attribute. | _Order within the tab._ |
| Reads Entities | A defined attribute. | _Comma list of tables the route reads (through vw_ views)._ |
| Description | A defined attribute. | _What the route shows._ |
| Child Routes | A defined attribute. | _Reverse relationship: routes whose back button returns here._ |
| Depth | Determined by priority: 0 if the path is a slash; in all other cases, the length of the path minus the length of the path with every a slash replaced by an empty string. ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 1. Number of path segments; the root path / is depth 0._ |
| Is Detail | True when the length of the path is not the length of the path with every “:” replaced by an empty string. ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 1. Route carries a :param (detail route)._ |
| Has Screen | True when the screen has a value. | _Order 1. Route is implemented by a React component._ |
| Unbuilt Flag | Determined by priority: 1 if the screen is blank; in all other cases, 0. | _Order 1. 1 when no component exists yet — rollup carrier for the Phase 3 backlog._ |
| Child Route Count | The number of mobile routes related to the mobile route. | _Order 1. Routes whose back button returns here._ |
| Tab Label | Taken from the linked tab. | _Order 1. Label of the owning tab._ |
| Entity Count | Determined by priority: 0 if the reads entities is blank; in all other cases, the length of the reads entities minus the length of the reads entities with every a comma replaced by an empty string plus 1. ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 1. Number of tables the route reads._ |
| Parent Depth | Taken from the linked parent route. | _Order 2. Depth of the parent route._ |
| Is Leaf Route | True when the child route count is 0. | _Order 2. No route returns to this one._ |
| Tab Route Count | Taken from the linked tab. | _Order 2. Routes in the owning tab._ |
| Is Depth Consistent | True when the depth is at most 1 if the parent route is blank, in all other cases the depth is the parent depth plus 1. | _Order 3. A route without a parent is at most one segment deep; a child is exactly one segment deeper than its parent._ |
| Tab Unbuilt Count | The unbuilt route count of the mobile route's tab. | _Order 3. Unbuilt routes in the owning tab._ |
| Share of Tab | Determined by priority: 0 if the tab route count (a missing value counts as 0) is 0; in all other cases, 100 divided by the tab route count rounded to 0 decimal place(s). | _Order 3. Percent of the tab this route represents._ |
| Tab Coverage Percent | The build coverage percent of the mobile route's tab. | _Order 4. Build coverage of the owning tab._ |
| Route State | Determined by priority: “misparented” if the depth consistent flag is not set; “built” if the screen flag is set; in all other cases, “planned”. | _Order 4. misparented / built / planned._ |
| Is on Shippable Tab | True when the tab coverage percent (a missing value counts as 0) is 100. | _Order 5. Owning tab is fully built._ |
| Route Label | Computed as the path, followed by “ [”, followed by the route state, followed by “]”. | _Order 5. Display label with route state._ |
| **Skill Route** | Directed edges of the skill meta-conversation: which skill routes to which, and why (orchestrator routing table + see-also cross-references). | — |
| Name | Computed as the from skill, followed by “ -> ”, followed by the to skill. | _Order 1. Display alias (calculated). Order 1._ |
| From Skill | A defined attribute. | _FK to ClaudeSkills — the skill that routes._ |
| To Skill | A defined attribute. | _FK to ClaudeSkills — the skill routed to._ |
| Route Reason | A defined attribute. | _Why the routing exists, as stated in the source skill._ |
| From Status | Taken from the linked from skill. | _Order 1. Status of the routing skill._ |
| To Status | Taken from the linked to skill. | _Order 1. Status of the routed-to skill._ |
| Is Orchestrator Route | True when the from skill is “effortless-orchestrator”. | _Order 1. Edge comes from the orchestrator routing table._ |
| Is Deprecated Target | True when the to status is “deprecated”. | _Order 2. Routes to a deprecated skill._ |
| To Inbound Count | The inbound route count of the skill route's to skill. | _Order 2. Inbound degree of the target skill._ |
| From Outbound Count | The outbound route count of the skill route's from skill. | _Order 2. Outbound degree of the source skill._ |
| Is Hub Edge | True when the from outbound count (a missing value counts as 0) is at least 5. | _Order 3. Leaves a hub skill._ |
| Is Into Leaf | True when the to inbound count (a missing value counts as 0) is 1. | _Order 3. The only edge into its target._ |
| Is Stale | True when at least one of the following holds: the deprecated target flag is set or the from status is “deprecated”. | _Order 3. Touches a deprecated skill at either end._ |
| Edge Class | Determined by priority: “stale” if the stale flag is set; “hub-to-leaf” if the into leaf flag is set, in all other cases “hub-fanout” if the hub edge flag is set; in all other cases, “peer”. | _Order 4. stale / hub-to-leaf / hub-fanout / peer._ |
| Route Label | Computed as the from skill, followed by “ -> ”, followed by the to skill, followed by “ [”, followed by the edge class, followed by “]”. | _Order 5. Display label with edge class._ |
| **Project Layout Slot** | The canonical root/example/toy project shape as first-class, scan-witnessed data. | — |
| Name | The same as its title. | _Order 1. Human display alias._ |
| Title | A defined attribute. | _Human label of the slot._ |
| Kind | A defined attribute. | _file \| directory \| executable \| manifest \| rulebook \| rulebook-table \| readme-final-section \| transpiler \| init-db \| one-of-directories \| start-script-syntax \| start-script-restart \| start-script-urls \| start-script-health._ |
| Pattern | A defined attribute. | _The exact path or manifest condition checked._ |
| Required for Root | True when an empty string. | _The repository root must fill this slot._ |
| Required for Example | True when an empty string. | _A fully implemented example must fill this slot._ |
| Required for Toy | True when an empty string. | _Every governed toy must fill this universal slot._ |
| Description | A defined attribute. | _Why the slot exists._ |
| Project | A defined attribute. | _FK to the root ProjectMetadata row._ |
| Witnesses | A defined attribute. | _Reverse relationship: project scans of this slot._ |
| Witness Count | The number of project slot witnesses related to the project layout slot. | _Order 1. Projects scanned for this slot._ |
| Present Count | The total present flag across the project slot witnesses related to the project layout slot. | _Order 2. Projects that currently fill this slot._ |
| Implementation Gap Count | The total implementation gap flag across the project slot witnesses related to the project layout slot. | _Order 3. Projects missing this slot when required for full implementation._ |
| Coverage Percent | Determined by priority: 0 if the witness count is 0; in all other cases, 100 times the present count divided by the witness count rounded to 0 decimal place(s). | _Order 3. Percent of scanned projects that fill this slot._ |
| Is Universally Filled | True when the coverage percent is 100. | _Order 4. Every scanned project fills this slot._ |
| Slot Health | Determined by priority: “clean” if the implementation gap count is 0; “few-gaps” if the implementation gap count is at most 3; in all other cases, “widespread”. | _Order 4. clean \| few-gaps \| widespread._ |
| Slot Label | Computed as the title, followed by “ [”, followed by the slot health, followed by “]”. | _Order 5. Display label with current health._ |
| **Project Slot Witness** | Strict filesystem/manifest witnesses for every governed project x canonical slot. Refresh with scripts/scan-project-slots.py. | — |
| Name | The same as its project slot witness ID. | _Order 1. Display alias._ |
| Domain | A defined attribute. | _FK to the governed project row._ |
| Slot | A defined attribute. | _FK to the canonical layout slot._ |
| Is Present | True when an empty string. | _The strict scan currently passes this slot._ |
| Witnessed Path | A defined attribute. | _The matched repository-relative path or transpiler Name._ |
| Witnessed Detail | A defined attribute. | _Exact observed success or failure._ |
| Witnessed on | A defined attribute. | _ISO date of the scan._ |
| Present Flag | Determined by priority: 1 if the present flag is set; in all other cases, 0. | _Order 1. 1 when present._ |
| Slot Required for Root | True when the linked slot is required for root. | _Order 1. Whether the slot is required of the repository root._ |
| Slot Required for Example | True when the linked slot is required for example. | _Order 1. Whether the slot is required for full example implementation._ |
| Slot Required for Toy | True when the linked slot is required for toy. | _Order 1. Whether the slot is universal for toys._ |
| Domain Area | Taken from the linked domain. | _Order 1. Physical project area._ |
| Domain is Exception | True when the project slot witness's domain is an intentional exception. | _Order 1. Whether the row is a doctrine-sanctioned non-project container._ |
| Is Required Here | True when all of the following hold: it is not the case that the domain is exception (a missing value counts as false) and at least one of the following holds: all of the following hold: the domain area is “root” and the slot required for root (a missing value counts as false); all of the following hold: the domain area is “rulebook-examples” and the slot required for example (a missing value counts as false); or all of the following hold: the domain area is “toy-rulebooks” and the slot required for toy (a missing value counts as false). ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 2. The slot is required for this row's physical area._ |
| Implementation Gap Flag | Determined by priority: 1 if all of the following hold: the present flag is not set; it is not the case that the domain is exception (a missing value counts as false); and at least one of the following holds: all of the following hold: the domain area is “root” and the slot required for root (a missing value counts as false) or all of the following hold: the domain area is not “root” and the slot required for example (a missing value counts as false); in all other cases, 0. ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 2. 1 when this absence prevents full implementation._ |
| Universal Gap Flag | Determined by priority: 1 if all of the following hold: the present flag is not set; it is not the case that the domain is exception (a missing value counts as false); and the slot required for toy (a missing value counts as false); in all other cases, 0. ⚠︎ mechanical <!-- rulespeak:reword --> | _Order 2. 1 when a universal slot is absent._ |
| Is Gap | True when all of the following hold: the present flag is not set and the required here flag is set. | _Order 3. Required here and absent._ |
| Gap Flag | Determined by priority: 1 if all of the following hold: the present flag is not set and the required here flag is set; in all other cases, 0. | _Order 3. 1 when this required-here slot is absent._ |
| Required Here Flag | Determined by priority: 1 if the required here flag is set; in all other cases, 0. | _Order 3. 1 when this slot is required here._ |
| Required Present Flag | Determined by priority: 1 if all of the following hold: the present flag is set and the required here flag is set; in all other cases, 0. | _Order 3. 1 when a required-here slot is present._ |
| Witness State | Determined by priority: “gap” if the gap flag is set; “filled” if the present flag is set; in all other cases, “optional-empty”. | _Order 4. gap \| filled \| optional-empty._ |
| Is Blocking Gap | True when the witness state is “gap”. | _Order 5. A current required-here conformance blocker._ |
| **CMCC Summary** | One-line CMCC framing for the platform rulebook itself: what it is, what it generates, and what conformance it claims. | — |
| Name | A defined attribute. | _Identifier for this narrative entry (single-row tables use 'primary')._ |
| Description | A defined attribute. | _The full narrative content for this concept._ |
| Description Length | Computed as the length of the description. | _Order 1. Character length of the narrative text._ |
| Is Substantive | True when the description length is at least 200. | _Order 2. Narrative is at least 200 characters (not a placeholder)._ |
| Narrative State | Determined by priority: “ready” if the substantive flag is set; in all other cases, “stub”. | _Order 3. ready / stub._ |
| Is Ready | True when the narrative state is “ready”. | _Order 4. Narrative is ready for publication._ |
| Section Label | Determined by priority: the name, followed by “ (ready)” if the ready flag is set; in all other cases, the name, followed by “ (stub)”. | _Order 5. Display label with readiness._ |
| **Project Goal** | The primary goal of the platform: the load-bearing claim the project is built to demonstrate. | — |
| Name | A defined attribute. | _Identifier for this narrative entry (single-row tables use 'primary')._ |
| Description | A defined attribute. | _The full narrative content for this concept._ |
| Description Length | Computed as the length of the description. | _Order 1. Character length of the narrative text._ |
| Is Substantive | True when the description length is at least 200. | _Order 2. Narrative is at least 200 characters (not a placeholder)._ |
| Narrative State | Determined by priority: “ready” if the substantive flag is set; in all other cases, “stub”. | _Order 3. ready / stub._ |
| Is Ready | True when the narrative state is “ready”. | _Order 4. Narrative is ready for publication._ |
| Section Label | Determined by priority: the name, followed by “ (ready)” if the ready flag is set; in all other cases, the name, followed by “ (stub)”. | _Order 5. Display label with readiness._ |
| **Architectural Highlight** | The architectural pattern that makes the platform work: input spokes write to the rulebook, output spokes read from it, conformance binds them. | — |
| Name | A defined attribute. | _Identifier for this narrative entry (single-row tables use 'primary')._ |
| Description | A defined attribute. | _The full narrative content for this concept._ |
| Description Length | Computed as the length of the description. | _Order 1. Character length of the narrative text._ |
| Is Substantive | True when the description length is at least 200. | _Order 2. Narrative is at least 200 characters (not a placeholder)._ |
| Narrative State | Determined by priority: “ready” if the substantive flag is set; in all other cases, “stub”. | _Order 3. ready / stub._ |
| Is Ready | True when the narrative state is “ready”. | _Order 4. Narrative is ready for publication._ |
| Section Label | Determined by priority: the name, followed by “ (ready)” if the ready flag is set; in all other cases, the name, followed by “ (stub)”. | _Order 5. Display label with readiness._ |

## 2 Fact Types

- a **framing invariant** may reference one **ontology axiom**
- a **platform feature** may reference one **ontology axiom**
- a **rulebook domain** may reference one **rulebook domain**
- a **rulebook domain** may reference one **rulebook flavor**
- a **rulebook domain** references exactly one **project metadata**
- a **rulebook domain** may reference one **project slot witness**
- a **rulebook domain** may reference one **project launch profile**
- a **project launch profile** references exactly one **rulebook domain**
- a **project launch profile** may reference one **project local service**
- a **project local service** references exactly one **project launch profile**
- a **rulebook flavor** may reference one **rulebook domain**
- a **demo narrative** may reference one **rulebook domain**
- a **flavor tag** references exactly one **rulebook flavor**
- a **flavor tag** references exactly one **rulebook tag**
- a **claude skill** references exactly one **project metadata**
- a **claude skill** may reference one **skill route**
- a **build phas** references exactly one **project metadata**
- an **ERB package** may reference one **build phas**
- an **ERB package** references exactly one **project metadata**
- an **ERB feature category** references exactly one **ERB package**
- an **ERB feature** references exactly one **ERB feature category**
- an **ERB feature** references exactly one **ERB package**
- a **user story** references exactly one **build phas**
- a **user story** references exactly one **ERB feature category**
- a **user story** references exactly one **ERB feature**
- a **user story** references exactly one **effort class**
- an **acceptance criteria** references exactly one **user story**
- a **consistency rule** references exactly one **project metadata**
- a **consistency finding** references exactly one **consistency rule**
- a **consistency finding** may reference one **rulebook domain**
- a **mobile nav tab** references exactly one **project metadata**
- a **mobile route** references exactly one **mobile nav tab**
- a **mobile route** may reference one **mobile route**
- a **skill route** references exactly one **claude skill**
- a **project layout slot** references exactly one **project metadata**
- a **project layout slot** may reference one **project slot witness**
- a **project slot witness** references exactly one **rulebook domain**
- a **project slot witness** references exactly one **project layout slot**

## 3 Operative Rules

_Operative rules state what the business **obliges**, **prohibits**, or
advises (**should**). Structural rules come from required fields and foreign keys;
semantic rules come from the Constraints table, each keyed on a boolean the rulebook
already computes (cross-referenced as DR-N in the Definitional Rules below)._

### Structural Constraints (from the schema)

- A project metadata **must** have a name and a purpose.
- An ontology axiom **must** have a short name, a statement, a why, and a status.
- A framing invariant **must** have a name, a category, a wrong framing, a correct framing, a why, a severity, and a status.
- A platform feature **must** have a name, a short name, a tier, a priority, a one line summary, a readme file path, a readme stub content, and a status.
- A rulebook source spoke **must** have a name, a kind, a direction, and a purpose, and record whether it is required.
- A rulebook domain **must** reference exactly one project metadata as its project.
- A rulebook domain **must** have an area, a domain name, a relative path, and a rulebook path, and record whether it is an intentional exception.
- A project launch profile **must** reference exactly one rulebook domain as its domain.
- A project launch profile **must** have a working directory, a start command, an experience description, a prerequisite notes, and an experience kind, and record whether it is start required and whether it requires local URL.
- A project local service **must** reference exactly one project launch profile as its launch profile.
- A project local service **must** have a service role, a local URL, a health URL, a sort order, and an is primary flag.
- A rulebook flavor **must** have a sort order, a project slug, a display name, a tagline, a logo path, a flavor, a complexity, an entity count, a calculated count, an aggregation count, a lookup count, and a learning focus.
- A field type taxonomy **must** have a type name, an intent, a storage mode, and an expressive tier, and record whether it is read only in ui.
- A formula dialect **must** have a name, an origin, a field ref syntax, a string concat, and a status, and record whether it is case sensitive.
- A demo narrative **must** have an order, a narrative name, a step name, a what happens, and a key lesson.
- A glossary **must** have a term, a category, a definition, and an implemented as.
- A rulebook tag **must** have a label, a category, a color, an emoji, and a description.
- A flavor tag **must** reference exactly one rulebook flavor as its flavor.
- A flavor tag **must** reference exactly one rulebook tag as its tag.
- A claude skill **must** reference exactly one project metadata as its project.
- A claude skill **must** have a name, a category, a load gate, a status, a one line summary, an audience, and a clone URL, and record whether it is an entry point and whether it is highlight in readme.
- A build phas **must** reference exactly one project metadata as its project.
- A build phas **must** have a phase number, a title, and a phase kind, and record whether it is a current bid.
- An effort class **must** have a title, a complexity weight, and a sort order.
- A delivery discipline **must** have a title, a share percent, and a sort order, and record whether it is client visible.
- An ERB package **must** reference exactly one project metadata as its project.
- An ERB package **must** have a title and a sort order.
- An ERB feature category **must** reference exactly one ERB package.
- An ERB feature category **must** have a title and a sort order.
- An ERB feature **must** reference exactly one ERB feature category as its category.
- An ERB feature **must** reference exactly one ERB package.
- An ERB feature **must** have a title.
- A user story **must** reference exactly one build phas as its build phase.
- A user story **must** reference exactly one ERB feature category as its epic.
- A user story **must** reference exactly one ERB feature as its feature.
- A user story **must** reference exactly one effort class.
- A user story **must** have a req ID, a story text, a status, and a dev progress percent.
- An acceptance criteria **must** reference exactly one user story.
- An acceptance criteria **must** have a criterion, and record whether it is a met.
- A consistency rule **must** reference exactly one project metadata as its project.
- A consistency rule **must** have a rule code, a severity, a scope, and a statement.
- A consistency finding **must** reference exactly one consistency rule as its rule.
- A consistency finding **must** have a detail, a status, and a detected on.
- A mobile nav tab **must** reference exactly one project metadata as its project.
- A mobile nav tab **must** have a label, an icon, a root path, and a sort order.
- A mobile route **must** reference exactly one mobile nav tab as its tab.
- A mobile route **must** have a path, a title, a route kind, and a sort order.
- A skill route **must** reference exactly one claude skill as its from skill.
- A skill route **must** reference exactly one claude skill as its to skill.
- A project layout slot **must** reference exactly one project metadata as its project.
- A project layout slot **must** have a title, a kind, a pattern, and a description, and record whether it is required for root, whether it is required for example, and whether it is required for toy.
- A project slot witness **must** reference exactly one rulebook domain as its domain.
- A project slot witness **must** reference exactly one project layout slot as its slot.
- A project slot witness **must** have a witnessed detail and a witnessed on, and record whether it is a present.
- A CMCC summary **must** have a name and a description.
- A project goal **must** have a name and a description.
- An architectural highlight **must** have a name and a description.

## 4 Definitional Rules

_All statements express truth in the business domain; they are neither
procedures nor imperatives. "iff" is avoided in favor of "only if" so a
one-directional necessity is not mistaken for an equivalence. A
**⚠︎ mechanical** chip marks a rule whose deterministic wording is faithful
but clunky — a flag for an optional downstream reword pass, not a defect._

| ID | Declarative rule |
|----|------------------|
| **DR-1 Domain Count** | A project metadata's domain count is the number of rulebook domains related to the project metadata. |
| **DR-2 Skill Count** | A project metadata's skill count is the number of claude skills related to the project metadata. |
| **DR-3 Consistency Rule Count** | A project metadata's consistency rule count is the number of consistency rules related to the project metadata. |
| **DR-4 Phase Count** | A project metadata's phase count is the number of build phases related to the project metadata. |
| **DR-5 Toy Domain Count** | A project metadata's toy domain count is the total toy flag across the rulebook domains related to the project metadata. |
| **DR-6 Deprecated Skill Count** | A project metadata's deprecated skill count is the total deprecated flag across the claude skills related to the project metadata. |
| **DR-7 Priced Phase Count** | A project metadata's priced phase count is the total priced flag across the build phases related to the project metadata. |
| **DR-8 Story Total** | A project metadata's story total is the total story count across the build phases related to the project metadata. |
| **DR-9 Open Finding Total** | A project metadata's open finding total is the total open finding count across the consistency rules related to the project metadata. |
| **DR-10 Isolated Skill Count** | A project metadata's isolated skill count is the total isolated flag across the claude skills related to the project metadata. |
| **DR-11 Done Story Total** | A project metadata's done story total is the total done story count across the build phases related to the project metadata. |
| **DR-12 Toy Share** | The project metadata's toy share is determined by the following priority:<br>1. 0, if the domain count is 0;<br>2. in all other cases, 100 times the toy domain count divided by the domain count rounded to 0 decimal place(s). |
| **DR-13 Clean Domain Count** | A project metadata's clean domain count is the total clean flag across the rulebook domains related to the project metadata. |
| **DR-14 Satisfied Rule Count** | A project metadata's satisfied rule count is the total satisfied flag across the consistency rules related to the project metadata. |
| **DR-15 Cardless Domain Count** | A project metadata's cardless domain count is the total needs flavor flag across the rulebook domains related to the project metadata. |
| **DR-16 Weighted Done Total** | A project metadata's weighted done total is the total weighted done sum across the build phases related to the project metadata. |
| **DR-17 Avg Phase Done Percent** | A project metadata's avg phase done percent is the average done percent across the build phases related to the project metadata. |
| **DR-18 Consistency Percent** | The project metadata's consistency percent is determined by the following priority:<br>1. 0, if the domain count is 0;<br>2. in all other cases, 100 times the clean domain count divided by the domain count rounded to 0 decimal place(s). |
| **DR-19 Rule Compliance Percent** | The project metadata's rule compliance percent is determined by the following priority:<br>1. 0, if the consistency rule count is 0;<br>2. in all other cases, 100 times the satisfied rule count divided by the consistency rule count rounded to 0 decimal place(s). |
| **DR-20 Shippable Tab Count** | A project metadata's shippable tab count is the total shippable flag across the mobile nav tabs related to the project metadata. |
| **DR-21 Healthy Skill Count** | A project metadata's healthy skill count is the total healthy flag across the claude skills related to the project metadata. |
| **DR-22 Programme Progress Percent** | A project metadata's programme progress percent is the average weighted done percent across the build phases related to the project metadata. |
| **DR-23 Is Repo Consistent** | A project metadata is considered a repo consistent if the clean domain count is the domain count. |
| **DR-24 Layout Slot Count** | A project metadata's layout slot count is the number of project layout slots related to the project metadata. |
| **DR-25 Fully Implemented Count** | A project metadata's fully implemented count is the total fully implemented flag across the rulebook domains related to the project metadata. |
| **DR-26 Name** | An ontology axiom's name is the same as its short name. |
| **DR-27 Invariant Count** | An ontology axiom's invariant count is the number of framing invariants related to the ontology axiom. |
| **DR-28 Feature Count** | An ontology axiom's feature count is the number of platform features related to the ontology axiom. |
| **DR-29 Is Active** | An ontology axiom is considered active if the status is “active”. |
| **DR-30 Critical Invariant Count** | An ontology axiom's critical invariant count is the total critical flag across the framing invariants related to the ontology axiom. |
| **DR-31 Shipped Feature Count** | An ontology axiom's shipped feature count is the total shipped flag across the platform features related to the ontology axiom. |
| **DR-32 Is Load Bearing** | An ontology axiom is considered load-bearing if at least one of the following holds: the invariant count is greater than 0 or the feature count is greater than 0. |
| **DR-33 Is Well Guarded** | An ontology axiom is considered well-guarded if all of the following hold: the load bearing flag is set and the critical invariant count is greater than 0. |
| **DR-34 Guard Ratio** | The ontology axiom's guard ratio is determined by the following priority:<br>1. 0, if the invariant count is 0;<br>2. in all other cases, the critical invariant count divided by the invariant count rounded to 2 decimal place(s). |
| **DR-35 Guard State** | The ontology axiom's guard state is determined by the following priority:<br>1. “guarded”, if the well guarded flag is set;<br>2. “exposed”, if the load bearing flag is set;<br>3. in all other cases, “dormant”. |
| **DR-36 Is Exposed Foundation** | An ontology axiom is considered an exposed foundation if the guard state is “exposed”. |
| **DR-37 Is Critical** | A framing invariant is considered a critical if the severity is “critical”. |
| **DR-38 Critical Flag** | The framing invariant's critical flag is determined by the following priority:<br>1. 1, if the severity is “critical”;<br>2. in all other cases, 0. |
| **DR-39 Axiom Short Name** | A framing invariant's axiom short name — taken from the linked violated axiom ID. |
| **DR-40 Axiom is Active** | A framing invariant's axiom is active when the linked violated axiom ID is active. |
| **DR-41 Is Active Critical** | A framing invariant is considered an active critical if all of the following hold: the critical flag is set and the status is “active”. |
| **DR-42 Is Enforceable** | A framing invariant is considered enforceable if all of the following hold: the active critical flag is set and the axiom is active (a missing value counts as false). ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-43 Axiom is Load Bearing** | A framing invariant's axiom is load bearing when the linked violated axiom ID is load bearing. |
| **DR-44 Enforcement State** | The framing invariant's enforcement state is determined by the following priority:<br>1. “enforced”, if the enforceable flag is set;<br>2. “advisory”, if the axiom is load bearing (a missing value counts as false);<br>3. in all other cases, “orphan”. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-45 Needs Attention** | A framing invariant is considered to need an attention if the enforcement state is “orphan”. |
| **DR-46 Is Readme Stub** | A platform feature is considered a readme stub if the readme length (a missing value counts as 0) is less than 400. |
| **DR-47 Is Headline** | A platform feature is considered a headline if the tier is “headline”. |
| **DR-48 Is Shipped** | A platform feature is considered shipped if the status is “shipped”. |
| **DR-49 Shipped Flag** | The platform feature's shipped flag is determined by the following priority:<br>1. 1, if the status is “shipped”;<br>2. in all other cases, 0. |
| **DR-50 Axiom Short Name** | A platform feature's axiom short name — taken from the linked related axiom ID. |
| **DR-51 Needs Readme Work** | A platform feature is considered to need a readme work if all of the following hold: the shipped flag is set and the readme stub flag is set. |
| **DR-52 Axiom Invariant Count** | A platform feature's axiom invariant count — taken from the linked related axiom ID. |
| **DR-53 Axiom is Load Bearing** | A platform feature's axiom is load bearing when the linked related axiom ID is load bearing. |
| **DR-54 Is Headline Gap** | A platform feature is considered a headline gap if all of the following hold: the headline flag is set and the needs readme work flag is set. |
| **DR-55 Doc State** | The platform feature's doc state is determined by the following priority:<br>1. “headline-gap”, if the headline gap flag is set;<br>2. “gap”, if the needs readme work flag is set;<br>3. “documented”, if the shipped flag is set;<br>4. in all other cases, “pending”. |
| **DR-56 Is Axiom Backed** | A platform feature is considered axiom-backed if all of the following hold: the axiom is load bearing (a missing value counts as false) and the shipped flag is set. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-57 Is Showcase Feature** | A platform feature is considered a showcase feature if all of the following hold: the axiom backed flag is set and the doc state is “documented”. |
| **DR-58 Is Bidirectional** | A rulebook source spoke is considered a bidirectional if the direction is “bidirectional”. |
| **DR-59 Is Optional** | A rulebook source spoke is considered an optional if the required flag is not set. |
| **DR-60 Is Optional Bidirectional** | A rulebook source spoke is considered an optional bidirectional if all of the following hold: the optional flag is set and the bidirectional flag is set. |
| **DR-61 Spoke Kind** | The rulebook source spoke's spoke kind is determined by the following priority:<br>1. “editing-surface”, if the optional bidirectional flag is set;<br>2. “required-sync”, if the bidirectional flag is set;<br>3. in all other cases, “one-way”. |
| **DR-62 Is Advertised Surface** | A rulebook source spoke is considered an advertised surface if all of the following hold: the spoke kind is “editing-surface” and the required flag is not set. |
| **DR-63 Surface Label** | The rulebook source spoke's surface label is determined by the following priority:<br>1. the name, followed by “ (optional surface)”, if the advertised surface flag is set;<br>2. in all other cases, the name. |
| **DR-64 Name** | A rulebook domain's name is the same as its domain name. |
| **DR-65 Slug** | A rulebook domain's slug is computed as 8 character(s) of the domain ID starting at position 200. |
| **DR-66 Is Toy** | A rulebook domain is considered a toy if the area is “toy-rulebooks”. |
| **DR-67 Toy Flag** | The rulebook domain's toy flag is determined by the following priority:<br>1. 1, if the area is “toy-rulebooks”;<br>2. in all other cases, 0. |
| **DR-68 Has Rulebook** | A rulebook domain is considered to have a rulebook if the rulebook path has a value. |
| **DR-69 Finding Count** | A rulebook domain's finding count is the number of consistency findings related to the rulebook domain. |
| **DR-70 Flavor Card Count** | A rulebook domain's flavor card count is the number of rulebook flavors related to the rulebook domain. |
| **DR-71 Child Domain Count** | A rulebook domain's child domain count is the number of rulebook domains related to the rulebook domain. |
| **DR-72 Expected Rulebook Path** | A rulebook domain's expected rulebook path is computed as the relative path, followed by “effortless-rulebook/”, followed by the slug, followed by “-rulebook.json”. |
| **DR-73 Open Finding Count** | A rulebook domain's open finding count is the total open flag across the consistency findings related to the rulebook domain. |
| **DR-74 Has Flavor Card** | A rulebook domain is considered to have a flavor card if the flavor card count is greater than 0. |
| **DR-75 Is Progression Root** | A rulebook domain is considered a progression root if all of the following hold: the parent domain ID is blank and the child domain count is greater than 0. |
| **DR-76 Is Standard Layout** | A rulebook domain is considered a standard layout if at least one of the following holds: the rulebook path (a missing value counts as an empty string) is the expected rulebook path or the rulebook path (a missing value counts as an empty string) is the relative path, followed by “effortless-rulebook/effortless-rulebook.json”. |
| **DR-77 Is Fully Consistent** | A rulebook domain is considered a fully consistent if the open finding count is 0. |
| **DR-78 Clean Flag** | The rulebook domain's clean flag is determined by the following priority:<br>1. 1, if the open finding count is 0;<br>2. in all other cases, 0. |
| **DR-79 Consistency Grade** | The rulebook domain's consistency grade is determined by the following priority:<br>1. “clean”, if the open finding count is 0;<br>2. “minor”, if the open finding count is at most 2;<br>3. in all other cases, “major”. |
| **DR-80 Needs Flavor Card** | A rulebook domain is considered to need a flavor card if all of the following hold: the area is not “root”; the intentional exception flag is not set; and the flavor card flag is not set. |
| **DR-81 Needs Flavor Flag** | The rulebook domain's needs flavor flag is determined by the following priority:<br>1. 1, if all of the following hold: the area is not “root”; the intentional exception flag is not set; and the flavor card flag is not set;<br>2. in all other cases, 0. |
| **DR-82 Layout Flag** | The rulebook domain's layout flag is determined by the following priority:<br>1. 1, if the standard layout flag is set;<br>2. in all other cases, 0. |
| **DR-83 Conformance Score** | A rulebook domain's conformance score is computed as the count of the following that hold: the fully consistent flag is set; the standard layout flag is set; the flavor card flag is set; and the rulebook flag is set. |
| **DR-84 Is Showcase Ready** | A rulebook domain is considered a showcase ready if all of the following hold: the fully consistent flag is set; the standard layout flag is set; and the toy flag is not set. |
| **DR-85 Conformance Band** | The rulebook domain's conformance band is determined by the following priority:<br>1. “exemplary”, if the conformance score is 4;<br>2. “acceptable”, if the conformance score is at least 2;<br>3. in all other cases, “needs-work”. |
| **DR-86 Showcase Flag** | The rulebook domain's showcase flag is determined by the following priority:<br>1. 1, if the showcase ready flag is set;<br>2. in all other cases, 0. |
| **DR-87 Slot Witness Count** | A rulebook domain's slot witness count is the number of project slot witnesses related to the rulebook domain. |
| **DR-88 Present Slot Count** | A rulebook domain's present slot count is the total present flag across the project slot witnesses related to the rulebook domain. |
| **DR-89 Implementation Gap Count** | A rulebook domain's implementation gap count is the total implementation gap flag across the project slot witnesses related to the rulebook domain. |
| **DR-90 Universal Gap Count** | A rulebook domain's universal gap count is the total universal gap flag across the project slot witnesses related to the rulebook domain. |
| **DR-91 Slot Coverage Percent** | The rulebook domain's slot coverage percent is determined by the following priority:<br>1. 0, if the slot witness count is 0;<br>2. in all other cases, 100 times the present slot count divided by the slot witness count rounded to 0 decimal place(s). |
| **DR-92 Required Slot Count** | A rulebook domain's required slot count is the total required here flag across the project slot witnesses related to the rulebook domain. |
| **DR-93 Required Present Count** | A rulebook domain's required present count is the total required present flag across the project slot witnesses related to the rulebook domain. |
| **DR-94 Required Gap Count** | A rulebook domain's required gap count is the total gap flag across the project slot witnesses related to the rulebook domain. |
| **DR-95 Is Fully Implemented** | A rulebook domain is considered fully-implemented if all of the following hold: the implementation gap count is 0 and the intentional exception flag is not set. |
| **DR-96 Is Toy by Coverage** | A rulebook domain is considered a toy by coverage if all of the following hold: the area is not “root”; the intentional exception flag is not set; and the slot coverage percent is less than 60. |
| **DR-97 Fully Implemented Flag** | The rulebook domain's fully implemented flag is determined by the following priority:<br>1. 1, if all of the following hold: the implementation gap count is 0 and the intentional exception flag is not set;<br>2. in all other cases, 0. |
| **DR-98 Required Slot Coverage Percent** | The rulebook domain's required slot coverage percent is determined by the following priority:<br>1. 100, if the required slot count is 0;<br>2. in all other cases, 100 times the required present count divided by the required slot count rounded to 0 decimal place(s). |
| **DR-99 Expected Area** | The rulebook domain's expected area is determined by the following priority:<br>1. “root”, if the area is “root”;<br>2. “toy-rulebooks”, if the toy by coverage flag is set;<br>3. in all other cases, “rulebook-examples”. |
| **DR-100 Is Misfiled** | A rulebook domain is considered misfiled if all of the following hold: the intentional exception flag is not set; the area is not “root”; and at least one of the following holds: all of the following hold: the toy by coverage flag is set and the area is not “toy-rulebooks” or all of the following hold: the toy by coverage flag is not set and the area is not “rulebook-examples”. |
| **DR-101 Readiness State** | The rulebook domain's readiness state is determined by the following priority:<br>1. “intentional-exception”, if the intentional exception flag is set;<br>2. “root-ready” if the fully implemented flag is set, in all other cases “root-incomplete”, if the area is “root”;<br>3. “toy”, if the toy by coverage flag is set;<br>4. “example-ready”, if the fully implemented flag is set;<br>5. in all other cases, “example-incomplete”. |
| **DR-102 Name** | A project launch profile's name is computed as the domain, followed by “ launch”. |
| **DR-103 Primary Service Count** | A project launch profile's primary service count is the total is primary flag across the project local services related to the project launch profile. |
| **DR-104 Service Count** | A project launch profile's service count is the number of project local services related to the project launch profile. |
| **DR-105 Has Complete Instructions** | A project launch profile is considered to have a complete instructions if all of the following hold: the working directory has a value; the start command has a value; and the experience description has a value. |
| **DR-106 Has Primary Service** | A project launch profile is considered to have a primary service if the primary service count is 1. |
| **DR-107 Is Launch Contract Complete** | A project launch profile is considered a launch contract complete if all of the following hold: the complete instructions flag is set and at least one of the following holds: the requires local URL flag is not set or the primary service flag is set. |
| **DR-108 Name** | A project local service's name is computed as the launch profile, followed by a space, followed by the service role. |
| **DR-109 Has Health URL** | A project local service is considered to have a health URL if the health URL has a value. |
| **DR-110 Is Http Service** | A project local service is considered a http service if at least one of the following holds: the first 7 character(s) of the local URL is “http://” or the first 8 character(s) of the local URL is “https://”. |
| **DR-111 Is Complete** | A project local service is considered a complete if all of the following hold: the local URL has a value and the health URL has a value. |
| **DR-112 Name** | A rulebook flavor's name is the same as its display name. |
| **DR-113 Derived Field Count** | A rulebook flavor's derived field count is computed as the calculated count plus the aggregation count plus the lookup count. |
| **DR-114 Has Domain** | A rulebook flavor is considered to have a domain if the domain has a value. |
| **DR-115 Tag Count** | A rulebook flavor's tag count is the number of flavor tags related to the rulebook flavor. |
| **DR-116 Answer Key Target Count** | The rulebook flavor's answer key target count is determined by the following priority:<br>1. 0, if the good answer key for is blank;<br>2. in all other cases, the length of the good answer key for minus the length of the good answer key for with every a comma replaced by an empty string plus 1. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-117 Domain Area** | A rulebook flavor's domain area — taken from the linked domain. |
| **DR-118 Derived Ratio** | The rulebook flavor's derived ratio is determined by the following priority:<br>1. 0, if the entity count is 0;<br>2. in all other cases, the derived field count divided by the entity count rounded to 2 decimal place(s). |
| **DR-119 Is Tagged** | A rulebook flavor is considered tagged if the tag count is greater than 0. |
| **DR-120 Is Toy Flavor** | A rulebook flavor is considered a toy flavor if the domain area is “toy-rulebooks”. |
| **DR-121 Domain Finding Count** | A rulebook flavor's domain finding count — taken from the linked domain. |
| **DR-122 Domain Open Finding Count** | A rulebook flavor's domain open finding count — taken from the linked domain. |
| **DR-123 Is Dense Derivation** | A rulebook flavor is considered a dense derivation if the derived ratio is at least 1. |
| **DR-124 Is Catalog Complete** | A rulebook flavor is considered a catalog complete if all of the following hold: the domain flag is set and the tagged flag is set. |
| **DR-125 Domain is Consistent** | A rulebook flavor's domain is consistent is true when the rulebook flavor's domain is a fully consistent. |
| **DR-126 Domain is Standard Layout** | A rulebook flavor's domain is standard layout when the linked domain is a standard layout. |
| **DR-127 Is Showcase Card** | A rulebook flavor is considered a showcase card if all of the following hold: the catalog complete flag is set and the domain open finding count (a missing value counts as 1) is 0. |
| **DR-128 Is Catalog Ready** | A rulebook flavor is considered a catalog ready if all of the following hold: the showcase card flag is set and the domain is consistent (a missing value counts as false). ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-129 Domain Conformance Score** | A rulebook flavor's domain conformance score — taken from the linked domain. |
| **DR-130 Name** | A field type taxonomy's name is the same as its type name. |
| **DR-131 Is Stored** | A field type taxonomy is considered stored if the storage mode is “stored”. |
| **DR-132 Is Fully Expressive Tier** | A field type taxonomy is considered a fully expressive tier if the expressive tier is “full”. |
| **DR-133 Is Stored and Editable** | A field type taxonomy is considered stored-and-editable if all of the following hold: the stored flag is set and the read only in ui flag is not set. |
| **DR-134 Tier Label** | The field type taxonomy's tier label is determined by the following priority:<br>1. “input”, if the stored and editable flag is set;<br>2. “derived-full”, if the fully expressive tier flag is set;<br>3. in all other cases, “derived-partial”. |
| **DR-135 Is Input Tier** | A field type taxonomy is considered an input tier if the tier label is “input”. |
| **DR-136 Ui Hint** | The field type taxonomy's ui hint is determined by the following priority:<br>1. “editable”, if the input tier flag is set;<br>2. in all other cases, “read-only”. |
| **DR-137 Is Active** | A formula dialect is considered active if the status is “active”. |
| **DR-138 Primary Substrate Count** | The formula dialect's primary substrate count is determined by the following priority:<br>1. 0, if the primary substrates is blank;<br>2. in all other cases, the length of the primary substrates minus the length of the primary substrates with every a comma replaced by an empty string plus 1. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-139 Is Active Multi Substrate** | A formula dialect is considered an active multi substrate if all of the following hold: the active flag is set and the primary substrate count is greater than 1. |
| **DR-140 Dialect Role** | The formula dialect's dialect role is determined by the following priority:<br>1. “primary”, if the active multi substrate flag is set;<br>2. “niche”, if the active flag is set;<br>3. in all other cases, “retired”. |
| **DR-141 Is Primary Dialect** | A formula dialect is considered a primary dialect if the dialect role is “primary”. |
| **DR-142 Dialect Label** | The formula dialect's dialect label is determined by the following priority:<br>1. the name, followed by “ (primary)”, if the primary dialect flag is set;<br>2. in all other cases, the name. |
| **DR-143 Name** | A demo narrative's name is computed as the narrative name, followed by “ / ”, followed by the step name. |
| **DR-144 Is Deprecated** | A demo narrative is considered deprecated if the status is “deprecated”. |
| **DR-145 Is Superseded** | A demo narrative is considered superseded if the superseded by has a value. |
| **DR-146 Domain Name** | A demo narrative's domain name — taken from the linked related domain ID. |
| **DR-147 Is Retired** | A demo narrative is considered retired if at least one of the following holds: the deprecated flag is set or the superseded flag is set. |
| **DR-148 Domain is Toy** | A demo narrative's domain is toy when the linked related domain ID is a toy. |
| **DR-149 Is Retired Toy Story** | A demo narrative is considered a retired toy story if all of the following hold: the retired flag is set and the domain is toy (a missing value counts as false). ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-150 Is Live Story** | A demo narrative is considered a live story if all of the following hold: the retired flag is not set and the related domain ID has a value. |
| **DR-151 Story State** | The demo narrative's story state is determined by the following priority:<br>1. “live”, if the live story flag is set;<br>2. “retired-toy”, if the retired toy story flag is set;<br>3. in all other cases, “retired”. |
| **DR-152 Is Current Story** | A demo narrative is considered a current story if the story state is “live”. |
| **DR-153 Name** | A glossary's name is the same as its term. |
| **DR-154 Alias Count** | The glossary's alias count is determined by the following priority:<br>1. 0, if the aliases is blank;<br>2. in all other cases, the length of the aliases minus the length of the aliases with every a comma replaced by an empty string plus 1. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-155 Has Implementation** | A glossary is considered to have an implementation if the implemented as has a value. |
| **DR-156 Implementation Kind** | The glossary's implementation kind is determined by the following priority:<br>1. an empty string, if the length of the implemented as (a missing value counts as an empty string) is the length of the implemented as (a missing value counts as an empty string) with every “:” replaced by an empty string;<br>2. in all other cases, the first the position of “:” within the implemented as minus 1 character(s) of the implemented as. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-157 Is File Backed** | A glossary is considered file-backed if the implementation kind is “file”. |
| **DR-158 Is Rich Term** | A glossary is considered a rich term if all of the following hold: the alias count is greater than 0 and the implementation flag is set. |
| **DR-159 Term Quality** | The glossary's term quality is determined by the following priority:<br>1. “anchored” if the file backed flag is set, in all other cases “rich”, if the rich term flag is set;<br>2. “implemented”, if the implementation flag is set;<br>3. in all other cases, “definition-only”. |
| **DR-160 Is Anchored** | A glossary is considered anchored if the term quality is “anchored”. |
| **DR-161 Glossary Tier** | The glossary's glossary tier is determined by the following priority:<br>1. “tier-1”, if the anchored flag is set;<br>2. “tier-2”, if the term quality is “rich”;<br>3. in all other cases, “tier-3”. |
| **DR-162 Name** | A rulebook tag's name is the same as its label. |
| **DR-163 Usage Count** | A rulebook tag's usage count is the number of flavor tags related to the rulebook tag. |
| **DR-164 Is Source Tag** | A rulebook tag is considered a source tag if the category is “source”. |
| **DR-165 Is Unused** | A rulebook tag is considered unused if the usage count is 0. |
| **DR-166 Unused Flag** | The rulebook tag's unused flag is determined by the following priority:<br>1. 1, if the usage count is 0;<br>2. in all other cases, 0. |
| **DR-167 Tag Health** | The rulebook tag's tag health is determined by the following priority:<br>1. “unused”, if the unused flag is set;<br>2. “common”, if the usage count is at least 5;<br>3. in all other cases, “rare”. |
| **DR-168 Is Retirement Candidate** | A rulebook tag is considered a retirement candidate if the tag health is “unused”. |
| **DR-169 Tag Action** | The rulebook tag's tag action is determined by the following priority:<br>1. “retire”, if the retirement candidate flag is set;<br>2. in all other cases, “keep”. |
| **DR-170 Name** | A flavor tag's name is computed as the flavor, followed by “:”, followed by the tag. |
| **DR-171 Tag Label** | A flavor tag's tag label — taken from the linked tag. |
| **DR-172 Tag Category** | A flavor tag's tag category — taken from the linked tag. |
| **DR-173 Flavor Display Name** | A flavor tag's flavor display name — taken from the linked flavor. |
| **DR-174 Is Source Tagging** | A flavor tag is considered source-tagging if the tag category is “source”. |
| **DR-175 Flavor Tag Count** | A flavor tag's flavor tag count — taken from the linked flavor. |
| **DR-176 Is Sole Tag** | A flavor tag is considered a sole tag if the flavor tag count (a missing value counts as 0) is 1. |
| **DR-177 Tag Share** | The flavor tag's tag share is determined by the following priority:<br>1. 0, if the flavor tag count (a missing value counts as 0) is 0;<br>2. in all other cases, 100 divided by the flavor tag count rounded to 0 decimal place(s). |
| **DR-178 Is Defining Tag** | A flavor tag is considered a defining tag if all of the following hold: the sole tag flag is set and the source tagging flag is set. |
| **DR-179 Tag Weight** | The flavor tag's tag weight is determined by the following priority:<br>1. 2, if the defining tag flag is set;<br>2. in all other cases, 1. |
| **DR-180 Slash Command** | A claude skill's slash command is computed as a slash, followed by the name. |
| **DR-181 Local Mirror Path** | A claude skill's local mirror path is computed as “docs/skills/”, followed by the name, followed by “/SKILL.md”. |
| **DR-182 Is Deprecated** | A claude skill is considered deprecated if the status is “deprecated”. |
| **DR-183 Deprecated Flag** | The claude skill's deprecated flag is determined by the following priority:<br>1. 1, if the status is “deprecated”;<br>2. in all other cases, 0. |
| **DR-184 Outbound Route Count** | A claude skill's outbound route count is the number of skill routes related to the claude skill. |
| **DR-185 Inbound Route Count** | A claude skill's inbound route count is the number of skill routes related to the claude skill. |
| **DR-186 Is Customer Facing** | A claude skill is considered customer-facing if the audience is “customer”. |
| **DR-187 Is Isolated** | A claude skill is considered isolated if all of the following hold: the outbound route count is 0 and the inbound route count is 0. |
| **DR-188 Isolated Flag** | The claude skill's isolated flag is determined by the following priority:<br>1. 1, if all of the following hold: the outbound route count is 0 and the inbound route count is 0;<br>2. in all other cases, 0. |
| **DR-189 Is Hub** | A claude skill is considered a hub if the outbound route count is at least 5. |
| **DR-190 Route Degree** | A claude skill's route degree is computed as the outbound route count plus the inbound route count. |
| **DR-191 Skill Role** | The claude skill's skill role is determined by the following priority:<br>1. “isolated”, if the isolated flag is set;<br>2. “hub”, if the hub flag is set;<br>3. “leaf”, if the inbound route count is greater than 0;<br>4. in all other cases, “source”. |
| **DR-192 Is Live Hub** | A claude skill is considered a live hub if all of the following hold: the hub flag is set and the deprecated flag is not set. |
| **DR-193 Is Deprecated But Routed** | A claude skill is considered deprecated-but-routed if all of the following hold: the deprecated flag is set and the route degree is greater than 0. |
| **DR-194 Catalog State** | The claude skill's catalog state is determined by the following priority:<br>1. “deprecated-routed”, if the deprecated but routed flag is set;<br>2. “hub”, if the live hub flag is set;<br>3. in all other cases, the skill role. |
| **DR-195 Healthy Flag** | The claude skill's healthy flag is determined by the following priority:<br>1. 0, if at least one of the following holds: the deprecated but routed flag is set or the isolated flag is set;<br>2. in all other cases, 1. |
| **DR-196 Needs Catalog Action** | A claude skill is considered to need a catalog action if the healthy flag is 0. |
| **DR-197 Catalog Label** | A claude skill's catalog label is computed as the name, followed by “ [”, followed by the catalog state, followed by “]”. |
| **DR-198 Name** | A build phas's name is the same as its title. |
| **DR-199 Story Count** | A build phas's story count is the number of user stories related to the build phas. |
| **DR-200 Package Count** | A build phas's package count is the number of ERB packages related to the build phas. |
| **DR-201 Is Priced** | A build phas is considered priced if the quoted price (a missing value counts as 0) is greater than 0. |
| **DR-202 Priced Flag** | The build phas's priced flag is determined by the following priority:<br>1. 1, if the quoted price (a missing value counts as 0) is greater than 0;<br>2. in all other cases, 0. |
| **DR-203 Is Fixed Price** | A build phas is considered a fixed price if the phase kind is “fixed-price”. |
| **DR-204 Done Story Count** | A build phas's done story count is the total done flag across the user stories related to the build phas. |
| **DR-205 Effort Weight Sum** | A build phas's effort weight sum is the total effort weight across the user stories related to the build phas. |
| **DR-206 Has Stories** | A build phas is considered to have a stories if the story count is greater than 0. |
| **DR-207 Done Percent** | The build phas's done percent is determined by the following priority:<br>1. 0, if the story count is 0;<br>2. in all other cases, 100 times the done story count divided by the story count rounded to 0 decimal place(s). |
| **DR-208 Weighted Done Sum** | A build phas's weighted done sum is the total weighted done across the user stories related to the build phas. |
| **DR-209 Is Priced With Stories** | A build phas is considered a priced with stories if all of the following hold: the priced flag is set and the stories flag is set. |
| **DR-210 Weighted Done Percent** | The build phas's weighted done percent is determined by the following priority:<br>1. 0, if the effort weight sum is 0;<br>2. in all other cases, 100 times the weighted done sum divided by the effort weight sum rounded to 0 decimal place(s). |
| **DR-211 Avg Story Progress** | A build phas's avg story progress is the average derived progress percent across the user stories related to the build phas. |
| **DR-212 Is Contract Safe** | A build phas is considered a contract safe if at least one of the following holds: the priced flag is not set or the priced with stories flag is set. |
| **DR-213 Phase State** | The build phas's phase state is determined by the following priority:<br>1. “complete”, if the weighted done percent is 100;<br>2. “in-progress”, if the weighted done percent is greater than 0;<br>3. “bid”, if the current bid flag is set;<br>4. in all other cases, “planned”. |
| **DR-214 Is Report Safe** | A build phas is considered a report safe if all of the following hold: the contract safe flag is set and the stories flag is set. |
| **DR-215 Name** | An effort class's name is the same as its title. |
| **DR-216 Story Count** | An effort class's story count is the number of user stories related to the effort class. |
| **DR-217 Weighted Story Load** | An effort class's weighted story load is computed as the story count times the complexity weight. |
| **DR-218 Is Heavy Load** | An effort class is considered a heavy load if the weighted story load is at least 20. |
| **DR-219 Load Band** | The effort class's load band is determined by the following priority:<br>1. “heavy”, if the heavy load flag is set;<br>2. in all other cases, “light”. |
| **DR-220 Class Label** | An effort class's class label is computed as the title, followed by “ (”, followed by the load band, followed by “)”. |
| **DR-221 Name** | A delivery discipline's name is the same as its title. |
| **DR-222 Visible Share** | The delivery discipline's visible share is determined by the following priority:<br>1. the share percent, if the client visible flag is set;<br>2. in all other cases, 0. |
| **DR-223 Is Major Discipline** | A delivery discipline is considered a major discipline if the share percent is at least 20. |
| **DR-224 Is Visible Major** | A delivery discipline is considered a visible major if all of the following hold: the client visible flag is set and the major discipline flag is set. |
| **DR-225 Discipline Tier** | The delivery discipline's discipline tier is determined by the following priority:<br>1. “major”, if the visible major flag is set;<br>2. “minor”, if the client visible flag is set;<br>3. in all other cases, “internal”. |
| **DR-226 Is Client Headline** | A delivery discipline is considered a client headline if the discipline tier is “major”. |
| **DR-227 Discipline Label** | The delivery discipline's discipline label is determined by the following priority:<br>1. the title, followed by “ *”, if the client headline flag is set;<br>2. in all other cases, the title. |
| **DR-228 Name** | An ERB package's name is the same as its title. |
| **DR-229 Category Count** | An ERB package's category count is the number of ERB feature categories related to the ERB package. |
| **DR-230 Feature Count** | An ERB package's feature count is the number of ERB features related to the ERB package. |
| **DR-231 Phase Title** | An ERB package's phase title — taken from the linked primary phase. |
| **DR-232 Phase Number** | An ERB package's phase number — taken from the linked primary phase. |
| **DR-233 Story Count** | An ERB package's story count is the total story count across the ERB features related to the ERB package. |
| **DR-234 Phase is Priced** | An ERB package's phase is priced when the linked primary phase is priced. |
| **DR-235 Done Story Count** | An ERB package's done story count is the total done story count across the ERB features related to the ERB package. |
| **DR-236 Is Priced Package** | An ERB package is considered a priced package if all of the following hold: the phase is priced (a missing value counts as false) and the story count is greater than 0. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-237 Done Percent** | The ERB package's done percent is determined by the following priority:<br>1. 0, if the story count is 0;<br>2. in all other cases, 100 times the done story count divided by the story count rounded to 0 decimal place(s). |
| **DR-238 Avg Feature Done Percent** | An ERB package's avg feature done percent is the average done percent across the ERB features related to the ERB package. |
| **DR-239 Is Complete** | An ERB package is considered a complete if the done percent is 100. |
| **DR-240 Package State** | The ERB package's package state is determined by the following priority:<br>1. “complete”, if the done percent is 100;<br>2. “in-progress”, if the avg feature done percent (a missing value counts as 0) is greater than 0;<br>3. in all other cases, “planned”. |
| **DR-241 Name** | An ERB feature category's name is the same as its title. |
| **DR-242 Feature Count** | An ERB feature category's feature count is the number of ERB features related to the ERB feature category. |
| **DR-243 Story Count** | An ERB feature category's story count is the number of user stories related to the ERB feature category. |
| **DR-244 Package Title** | An ERB feature category's package title — taken from the linked ERB package. |
| **DR-245 Has Stories** | An ERB feature category is considered to have a stories if the story count is greater than 0. |
| **DR-246 Package Feature Count** | An ERB feature category's package feature count — taken from the linked ERB package. |
| **DR-247 Feature Done Story Count** | An ERB feature category's feature done story count is the total done story count across the ERB features related to the ERB feature category. |
| **DR-248 Share of Package Features** | The ERB feature category's share of package features is determined by the following priority:<br>1. 0, if the package feature count is 0;<br>2. in all other cases, 100 times the feature count divided by the package feature count rounded to 0 decimal place(s). |
| **DR-249 Done Percent** | The ERB feature category's done percent is determined by the following priority:<br>1. 0, if the story count is 0;<br>2. in all other cases, 100 times the feature done story count divided by the story count rounded to 0 decimal place(s). |
| **DR-250 Avg Story Progress** | An ERB feature category's avg story progress is the average derived progress percent across the user stories related to the ERB feature category. |
| **DR-251 Epic State** | The ERB feature category's epic state is determined by the following priority:<br>1. “complete”, if the done percent is 100;<br>2. “in-progress”, if the avg story progress (a missing value counts as 0) is greater than 0;<br>3. in all other cases, “planned”. |
| **DR-252 Name** | An ERB feature's name is the same as its title. |
| **DR-253 Story Count** | An ERB feature's story count is the number of user stories related to the ERB feature. |
| **DR-254 Category Title** | An ERB feature's category title — taken from the linked category. |
| **DR-255 Package Title** | An ERB feature's package title — taken from the linked ERB package. |
| **DR-256 Done Story Count** | An ERB feature's done story count is the total done flag across the user stories related to the ERB feature. |
| **DR-257 Has Stories** | An ERB feature is considered to have a stories if the story count is greater than 0. |
| **DR-258 Category Story Count** | An ERB feature's category story count — taken from the linked category. |
| **DR-259 Done Percent** | The ERB feature's done percent is determined by the following priority:<br>1. 0, if the story count is 0;<br>2. in all other cases, 100 times the done story count divided by the story count rounded to 0 decimal place(s). |
| **DR-260 Share of Epic Stories** | The ERB feature's share of epic stories is determined by the following priority:<br>1. 0, if the category story count is 0;<br>2. in all other cases, 100 times the story count divided by the category story count rounded to 0 decimal place(s). |
| **DR-261 Avg Story Progress** | An ERB feature's avg story progress is the average derived progress percent across the user stories related to the ERB feature. |
| **DR-262 Is Complete** | An ERB feature is considered a complete if the done percent is 100. |
| **DR-263 Feature State** | The ERB feature's feature state is determined by the following priority:<br>1. “complete”, if the complete flag is set;<br>2. “in-progress”, if the avg story progress (a missing value counts as 0) is greater than 0;<br>3. in all other cases, “planned”. |
| **DR-264 Name** | A user story's name is the same as its req ID. |
| **DR-265 Criterion Count** | A user story's criterion count is the number of acceptance criteria related to the user story. |
| **DR-266 Is Done** | A user story is considered a done if the status is “done”. |
| **DR-267 Done Flag** | The user story's done flag is determined by the following priority:<br>1. 1, if the status is “done”;<br>2. in all other cases, 0. |
| **DR-268 Effort Weight** | A user story's effort weight is the complexity weight of the user story's effort class. |
| **DR-269 Phase Number** | A user story's phase number — taken from the linked build phase. |
| **DR-270 Feature Title** | A user story's feature title — taken from the linked feature. |
| **DR-271 Met Criterion Count** | A user story's met criterion count is the total met flag across the acceptance criteria related to the user story. |
| **DR-272 Has Criteria** | A user story is considered to have a criteria if the criterion count is greater than 0. |
| **DR-273 Weighted Done** | A user story's weighted done is computed as the done flag times the effort weight. |
| **DR-274 Derived Progress Percent** | The user story's derived progress percent is determined by the following priority:<br>1. 100 times the met criterion count divided by the criterion count rounded to 0 decimal place(s), if the criteria flag is set;<br>2. in all other cases, the dev progress percent. |
| **DR-275 Is Acceptance Complete** | A user story is considered an acceptance complete if all of the following hold: the criteria flag is set and the met criterion count is the criterion count. |
| **DR-276 Has Status Drift** | A user story is considered to have a status drift if all of the following hold: the done flag is set and the met criterion count is not the criterion count. |
| **DR-277 Weighted Progress** | A user story's weighted progress is computed as the derived progress percent times the effort weight (a missing value counts as 0). |
| **DR-278 Progress State** | The user story's progress state is determined by the following priority:<br>1. “drift”, if the status drift flag is set;<br>2. “accepted”, if the acceptance complete flag is set;<br>3. “in-flight”, if the derived progress percent is greater than 0;<br>4. in all other cases, “not-started”. |
| **DR-279 Priority Band** | The user story's priority band is determined by the following priority:<br>1. “fix-first”, if the progress state is “drift”;<br>2. “continue”, if the progress state is “in-flight”;<br>3. in all other cases, “queue”. |
| **DR-280 Report Label** | A user story's report label is computed as the req ID, followed by a space, followed by the progress state. |
| **DR-281 Name** | An acceptance criteria's name is the same as its acceptance criterion ID. |
| **DR-282 Met Flag** | The acceptance criteria's met flag is determined by the following priority:<br>1. 1, if the met flag is set;<br>2. in all other cases, 0. |
| **DR-283 Story Req ID** | An acceptance criteria's story req ID — taken from the linked user story. |
| **DR-284 Story Status** | An acceptance criteria's story status — taken from the linked user story. |
| **DR-285 Story is Done** | An acceptance criteria's story is done is true when the acceptance criteria's user story is a done. |
| **DR-286 Story Criterion Count** | An acceptance criteria's story criterion count — taken from the linked user story. |
| **DR-287 Is Inconsistent With Story** | An acceptance criteria is considered an inconsistent with story if all of the following hold: the story is done (a missing value counts as false) and the met flag is not set. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-288 Share of Story** | The acceptance criteria's share of story is determined by the following priority:<br>1. 0, if the story criterion count (a missing value counts as 0) is 0;<br>2. in all other cases, 100 divided by the story criterion count rounded to 0 decimal place(s). |
| **DR-289 Story Derived Progress** | An acceptance criteria's story derived progress is the derived progress percent of the acceptance criteria's user story. |
| **DR-290 Criterion State** | The acceptance criteria's criterion state is determined by the following priority:<br>1. “contradicts-story”, if the inconsistent with story flag is set;<br>2. “met”, if the met flag is set;<br>3. in all other cases, “pending”. |
| **DR-291 Needs Review** | An acceptance criteria is considered to need a review if the criterion state is “contradicts-story”. |
| **DR-292 Story is Ahead of Criterion** | An acceptance criteria is flagged story is ahead of criterion if all of the following hold: the met flag is not set and the story derived progress (a missing value counts as 0) is at least 50. |
| **DR-293 Name** | A consistency rule's name is the same as its rule code. |
| **DR-294 Finding Count** | A consistency rule's finding count is the number of consistency findings related to the consistency rule. |
| **DR-295 Is Critical** | A consistency rule is considered a critical if the severity is “critical”. |
| **DR-296 Is Repo Scope** | A consistency rule is considered a repo scope if the scope is not “demo”. |
| **DR-297 Open Finding Count** | A consistency rule's open finding count is the total open flag across the consistency findings related to the consistency rule. |
| **DR-298 Has Findings** | A consistency rule is considered to have a findings if the finding count is greater than 0. |
| **DR-299 Is Satisfied** | A consistency rule is considered satisfied if the open finding count is 0. |
| **DR-300 Satisfied Flag** | The consistency rule's satisfied flag is determined by the following priority:<br>1. 1, if the open finding count is 0;<br>2. in all other cases, 0. |
| **DR-301 Accepted or Fixed Count** | A consistency rule's accepted or fixed count is computed as the finding count minus the open finding count. |
| **DR-302 Open Critical Flag** | The consistency rule's open critical flag is determined by the following priority:<br>1. 1, if all of the following hold: the critical flag is set and the open finding count is greater than 0;<br>2. in all other cases, 0. |
| **DR-303 Rule State** | The consistency rule's rule state is determined by the following priority:<br>1. “satisfied”, if the satisfied flag is set;<br>2. “critical-open”, if the open critical flag is 1;<br>3. in all other cases, “open”. |
| **DR-304 Resolution Percent** | The consistency rule's resolution percent is determined by the following priority:<br>1. 100, if the finding count is 0;<br>2. in all other cases, 100 times the accepted or fixed count divided by the finding count rounded to 0 decimal place(s). |
| **DR-305 Rule Label** | A consistency rule's rule label is computed as the rule code, followed by “ [”, followed by the rule state, followed by “]”. |
| **DR-306 Is Sweep Priority** | A consistency rule is considered a sweep priority if all of the following hold: the rule state is not “satisfied” and the resolution percent is less than 50. |
| **DR-307 Name** | A consistency finding's name is computed as the domain (a missing value counts as “repo”), followed by “ x ”, followed by the rule. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-308 Is Open** | A consistency finding is considered open if the status is “open”. |
| **DR-309 Open Flag** | The consistency finding's open flag is determined by the following priority:<br>1. 1, if the status is “open”;<br>2. in all other cases, 0. |
| **DR-310 Is Repo Scope** | A consistency finding is considered a repo scope if the domain is blank. |
| **DR-311 Rule Severity** | A consistency finding's rule severity — taken from the linked rule. |
| **DR-312 Rule Code** | A consistency finding's rule code — taken from the linked rule. |
| **DR-313 Domain Name** | A consistency finding's domain name — taken from the linked domain. |
| **DR-314 Is Open Critical** | A consistency finding is considered an open critical if all of the following hold: the open flag is set and the rule severity is “critical”. |
| **DR-315 Domain Finding Count** | A consistency finding's domain finding count — taken from the linked domain. |
| **DR-316 Rule Finding Count** | A consistency finding's rule finding count — taken from the linked rule. |
| **DR-317 Domain Open Finding Count** | A consistency finding's domain open finding count — taken from the linked domain. |
| **DR-318 Rule Open Finding Count** | A consistency finding's rule open finding count — taken from the linked rule. |
| **DR-319 Is Sole Finding on Domain** | A consistency finding is considered a sole finding on domain if the domain finding count (a missing value counts as 0) is 1. |
| **DR-320 Is Sole Blocker** | A consistency finding is considered a sole blocker if all of the following hold: the open flag is set and the domain open finding count (a missing value counts as 0) is 1. |
| **DR-321 Rule is Satisfied** | A consistency finding's rule is satisfied when the linked rule is satisfied. |
| **DR-322 Domain Grade** | A consistency finding's domain grade is the consistency grade of the consistency finding's domain. |
| **DR-323 Priority** | The consistency finding's priority is determined by the following priority:<br>1. “P1”, if the open critical flag is set;<br>2. “P2”, if the sole blocker flag is set;<br>3. “P3”, if the open flag is set;<br>4. in all other cases, “closed”. |
| **DR-324 Is Last Mile** | A consistency finding is considered a last mile if all of the following hold: the sole blocker flag is set and the domain grade (a missing value counts as an empty string) is “minor”. |
| **DR-325 Name** | A mobile nav tab's name is the same as its label. |
| **DR-326 Route Count** | A mobile nav tab's route count is the number of mobile routes related to the mobile nav tab. |
| **DR-327 Unbuilt Route Count** | A mobile nav tab's unbuilt route count is the total unbuilt flag across the mobile routes related to the mobile nav tab. |
| **DR-328 Has Routes** | A mobile nav tab is considered to have a routes if the route count is greater than 0. |
| **DR-329 Build Coverage Percent** | The mobile nav tab's build coverage percent is determined by the following priority:<br>1. 0, if the route count is 0;<br>2. in all other cases, 100 times the route count minus the unbuilt route count divided by the route count rounded to 0 decimal place(s). |
| **DR-330 Is Plan Only** | A mobile nav tab is considered a plan only if all of the following hold: the routes flag is set and the unbuilt route count is the route count. |
| **DR-331 Is Shippable** | A mobile nav tab is considered shippable if the build coverage percent is 100. |
| **DR-332 Shippable Flag** | The mobile nav tab's shippable flag is determined by the following priority:<br>1. 1, if the build coverage percent is 100;<br>2. in all other cases, 0. |
| **DR-333 Tab State** | The mobile nav tab's tab state is determined by the following priority:<br>1. “shippable”, if the shippable flag is set;<br>2. “plan-only”, if the plan only flag is set;<br>3. in all other cases, “partial”. |
| **DR-334 Name** | A mobile route's name is the same as its path. |
| **DR-335 Depth** | The mobile route's depth is determined by the following priority:<br>1. 0, if the path is a slash;<br>2. in all other cases, the length of the path minus the length of the path with every a slash replaced by an empty string. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-336 Is Detail** | A mobile route is considered a detail if the length of the path is not the length of the path with every “:” replaced by an empty string. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-337 Has Screen** | A mobile route is considered to have a screen if the screen has a value. |
| **DR-338 Unbuilt Flag** | The mobile route's unbuilt flag is determined by the following priority:<br>1. 1, if the screen is blank;<br>2. in all other cases, 0. |
| **DR-339 Child Route Count** | A mobile route's child route count is the number of mobile routes related to the mobile route. |
| **DR-340 Tab Label** | A mobile route's tab label — taken from the linked tab. |
| **DR-341 Entity Count** | The mobile route's entity count is determined by the following priority:<br>1. 0, if the reads entities is blank;<br>2. in all other cases, the length of the reads entities minus the length of the reads entities with every a comma replaced by an empty string plus 1. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-342 Parent Depth** | A mobile route's parent depth — taken from the linked parent route. |
| **DR-343 Is Leaf Route** | A mobile route is considered a leaf route if the child route count is 0. |
| **DR-344 Tab Route Count** | A mobile route's tab route count — taken from the linked tab. |
| **DR-345 Is Depth Consistent** | A mobile route is considered a depth consistent if the depth is at most 1 if the parent route is blank, in all other cases the depth is the parent depth plus 1. |
| **DR-346 Tab Unbuilt Count** | A mobile route's tab unbuilt count is the unbuilt route count of the mobile route's tab. |
| **DR-347 Share of Tab** | The mobile route's share of tab is determined by the following priority:<br>1. 0, if the tab route count (a missing value counts as 0) is 0;<br>2. in all other cases, 100 divided by the tab route count rounded to 0 decimal place(s). |
| **DR-348 Tab Coverage Percent** | A mobile route's tab coverage percent is the build coverage percent of the mobile route's tab. |
| **DR-349 Route State** | The mobile route's route state is determined by the following priority:<br>1. “misparented”, if the depth consistent flag is not set;<br>2. “built”, if the screen flag is set;<br>3. in all other cases, “planned”. |
| **DR-350 Is on Shippable Tab** | A mobile route is considered on-shippable-tab if the tab coverage percent (a missing value counts as 0) is 100. |
| **DR-351 Route Label** | A mobile route's route label is computed as the path, followed by “ [”, followed by the route state, followed by “]”. |
| **DR-352 Name** | A skill route's name is computed as the from skill, followed by “ -> ”, followed by the to skill. |
| **DR-353 From Status** | A skill route's from status — taken from the linked from skill. |
| **DR-354 To Status** | A skill route's to status — taken from the linked to skill. |
| **DR-355 Is Orchestrator Route** | A skill route is considered an orchestrator route if the from skill is “effortless-orchestrator”. |
| **DR-356 Is Deprecated Target** | A skill route is considered a deprecated target if the to status is “deprecated”. |
| **DR-357 To Inbound Count** | A skill route's to inbound count is the inbound route count of the skill route's to skill. |
| **DR-358 From Outbound Count** | A skill route's from outbound count is the outbound route count of the skill route's from skill. |
| **DR-359 Is Hub Edge** | A skill route is considered a hub edge if the from outbound count (a missing value counts as 0) is at least 5. |
| **DR-360 Is Into Leaf** | A skill route is considered an into leaf if the to inbound count (a missing value counts as 0) is 1. |
| **DR-361 Is Stale** | A skill route is considered a stale if at least one of the following holds: the deprecated target flag is set or the from status is “deprecated”. |
| **DR-362 Edge Class** | The skill route's edge class is determined by the following priority:<br>1. “stale”, if the stale flag is set;<br>2. “hub-to-leaf” if the into leaf flag is set, in all other cases “hub-fanout”, if the hub edge flag is set;<br>3. in all other cases, “peer”. |
| **DR-363 Route Label** | A skill route's route label is computed as the from skill, followed by “ -> ”, followed by the to skill, followed by “ [”, followed by the edge class, followed by “]”. |
| **DR-364 Name** | A project layout slot's name is the same as its title. |
| **DR-365 Witness Count** | A project layout slot's witness count is the number of project slot witnesses related to the project layout slot. |
| **DR-366 Present Count** | A project layout slot's present count is the total present flag across the project slot witnesses related to the project layout slot. |
| **DR-367 Implementation Gap Count** | A project layout slot's implementation gap count is the total implementation gap flag across the project slot witnesses related to the project layout slot. |
| **DR-368 Coverage Percent** | The project layout slot's coverage percent is determined by the following priority:<br>1. 0, if the witness count is 0;<br>2. in all other cases, 100 times the present count divided by the witness count rounded to 0 decimal place(s). |
| **DR-369 Is Universally Filled** | A project layout slot is considered universally-filled if the coverage percent is 100. |
| **DR-370 Slot Health** | The project layout slot's slot health is determined by the following priority:<br>1. “clean”, if the implementation gap count is 0;<br>2. “few-gaps”, if the implementation gap count is at most 3;<br>3. in all other cases, “widespread”. |
| **DR-371 Slot Label** | A project layout slot's slot label is computed as the title, followed by “ [”, followed by the slot health, followed by “]”. |
| **DR-372 Name** | A project slot witness's name is the same as its project slot witness ID. |
| **DR-373 Present Flag** | The project slot witness's present flag is determined by the following priority:<br>1. 1, if the present flag is set;<br>2. in all other cases, 0. |
| **DR-374 Slot Required for Root** | A project slot witness's slot required for root when the linked slot is required for root. |
| **DR-375 Slot Required for Example** | A project slot witness's slot required for example when the linked slot is required for example. |
| **DR-376 Slot Required for Toy** | A project slot witness's slot required for toy when the linked slot is required for toy. |
| **DR-377 Domain Area** | A project slot witness's domain area — taken from the linked domain. |
| **DR-378 Domain is Exception** | A project slot witness's domain is exception is true when the project slot witness's domain is an intentional exception. |
| **DR-379 Is Required Here** | A project slot witness is considered a required here if all of the following hold: it is not the case that the domain is exception (a missing value counts as false) and at least one of the following holds: all of the following hold: the domain area is “root” and the slot required for root (a missing value counts as false); all of the following hold: the domain area is “rulebook-examples” and the slot required for example (a missing value counts as false); or all of the following hold: the domain area is “toy-rulebooks” and the slot required for toy (a missing value counts as false). ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-380 Implementation Gap Flag** | The project slot witness's implementation gap flag is determined by the following priority:<br>1. 1, if all of the following hold: the present flag is not set; it is not the case that the domain is exception (a missing value counts as false); and at least one of the following holds: all of the following hold: the domain area is “root” and the slot required for root (a missing value counts as false) or all of the following hold: the domain area is not “root” and the slot required for example (a missing value counts as false);<br>2. in all other cases, 0. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-381 Universal Gap Flag** | The project slot witness's universal gap flag is determined by the following priority:<br>1. 1, if all of the following hold: the present flag is not set; it is not the case that the domain is exception (a missing value counts as false); and the slot required for toy (a missing value counts as false);<br>2. in all other cases, 0. ⚠︎ mechanical <!-- rulespeak:reword --> |
| **DR-382 Is Gap** | A project slot witness is considered a gap if all of the following hold: the present flag is not set and the required here flag is set. |
| **DR-383 Gap Flag** | The project slot witness's gap flag is determined by the following priority:<br>1. 1, if all of the following hold: the present flag is not set and the required here flag is set;<br>2. in all other cases, 0. |
| **DR-384 Required Here Flag** | The project slot witness's required here flag is determined by the following priority:<br>1. 1, if the required here flag is set;<br>2. in all other cases, 0. |
| **DR-385 Required Present Flag** | The project slot witness's required present flag is determined by the following priority:<br>1. 1, if all of the following hold: the present flag is set and the required here flag is set;<br>2. in all other cases, 0. |
| **DR-386 Witness State** | The project slot witness's witness state is determined by the following priority:<br>1. “gap”, if the gap flag is set;<br>2. “filled”, if the present flag is set;<br>3. in all other cases, “optional-empty”. |
| **DR-387 Is Blocking Gap** | A project slot witness is considered a blocking gap if the witness state is “gap”. |
| **DR-388 Description Length** | A CMCC summary's description length is computed as the length of the description. |
| **DR-389 Is Substantive** | A CMCC summary is considered substantive if the description length is at least 200. |
| **DR-390 Narrative State** | The CMCC summary's narrative state is determined by the following priority:<br>1. “ready”, if the substantive flag is set;<br>2. in all other cases, “stub”. |
| **DR-391 Is Ready** | A CMCC summary is considered a ready if the narrative state is “ready”. |
| **DR-392 Section Label** | The CMCC summary's section label is determined by the following priority:<br>1. the name, followed by “ (ready)”, if the ready flag is set;<br>2. in all other cases, the name, followed by “ (stub)”. |
| **DR-393 Description Length** | A project goal's description length is computed as the length of the description. |
| **DR-394 Is Substantive** | A project goal is considered substantive if the description length is at least 200. |
| **DR-395 Narrative State** | The project goal's narrative state is determined by the following priority:<br>1. “ready”, if the substantive flag is set;<br>2. in all other cases, “stub”. |
| **DR-396 Is Ready** | A project goal is considered a ready if the narrative state is “ready”. |
| **DR-397 Section Label** | The project goal's section label is determined by the following priority:<br>1. the name, followed by “ (ready)”, if the ready flag is set;<br>2. in all other cases, the name, followed by “ (stub)”. |
| **DR-398 Description Length** | An architectural highlight's description length is computed as the length of the description. |
| **DR-399 Is Substantive** | An architectural highlight is considered substantive if the description length is at least 200. |
| **DR-400 Narrative State** | The architectural highlight's narrative state is determined by the following priority:<br>1. “ready”, if the substantive flag is set;<br>2. in all other cases, “stub”. |
| **DR-401 Is Ready** | An architectural highlight is considered a ready if the narrative state is “ready”. |
| **DR-402 Section Label** | The architectural highlight's section label is determined by the following priority:<br>1. the name, followed by “ (ready)”, if the ready flag is set;<br>2. in all other cases, the name, followed by “ (stub)”. |

## 5 Traceability to Schema

_The expression column is the rule's definition in RuleSpeak® notation —
the same logic the rulebook stores, written for a business reader._

| Schema element | Kind | Expression |
|----------------|------|------------|
| **ProjectMetadata.DomainCount** | rollup | `Count(RulebookDomains via Project)` |
| **ProjectMetadata.SkillCount** | rollup | `Count(ClaudeSkills via Project)` |
| **ProjectMetadata.ConsistencyRuleCount** | rollup | `Count(ConsistencyRules via Project)` |
| **ProjectMetadata.PhaseCount** | rollup | `Count(BuildPhases via Project)` |
| **ProjectMetadata.ToyDomainCount** | rollup | `Sum(RulebookDomains.ToyFlag via Project)` |
| **ProjectMetadata.DeprecatedSkillCount** | rollup | `Sum(ClaudeSkills.DeprecatedFlag via Project)` |
| **ProjectMetadata.PricedPhaseCount** | rollup | `Sum(BuildPhases.PricedFlag via Project)` |
| **ProjectMetadata.StoryTotal** | rollup | `Sum(BuildPhases.StoryCount via Project)` |
| **ProjectMetadata.OpenFindingTotal** | rollup | `Sum(ConsistencyRules.OpenFindingCount via Project)` |
| **ProjectMetadata.IsolatedSkillCount** | rollup | `Sum(ClaudeSkills.IsolatedFlag via Project)` |
| **ProjectMetadata.DoneStoryTotal** | rollup | `Sum(BuildPhases.DoneStoryCount via Project)` |
| **ProjectMetadata.ToyShare** | formula | `If(DomainCount = 0, 0, Round(100 * ToyDomainCount / DomainCount, 0))` |
| **ProjectMetadata.CleanDomainCount** | rollup | `Sum(RulebookDomains.CleanFlag via Project)` |
| **ProjectMetadata.SatisfiedRuleCount** | rollup | `Sum(ConsistencyRules.SatisfiedFlag via Project)` |
| **ProjectMetadata.CardlessDomainCount** | rollup | `Sum(RulebookDomains.NeedsFlavorFlag via Project)` |
| **ProjectMetadata.WeightedDoneTotal** | rollup | `Sum(BuildPhases.WeightedDoneSum via Project)` |
| **ProjectMetadata.AvgPhaseDonePercent** | rollup | `Average(BuildPhases.DonePercent via Project)` |
| **ProjectMetadata.ConsistencyPercent** | formula | `If(DomainCount = 0, 0, Round(100 * CleanDomainCount / DomainCount, 0))` |
| **ProjectMetadata.RuleCompliancePercent** | formula | `If(ConsistencyRuleCount = 0, 0, Round(100 * SatisfiedRuleCount / ConsistencyRuleCount, 0))` |
| **ProjectMetadata.ShippableTabCount** | rollup | `Sum(MobileNavTabs.ShippableFlag via Project)` |
| **ProjectMetadata.HealthySkillCount** | rollup | `Sum(ClaudeSkills.HealthyFlag via Project)` |
| **ProjectMetadata.ProgrammeProgressPercent** | rollup | `Average(BuildPhases.WeightedDonePercent via Project)` |
| **ProjectMetadata.IsRepoConsistent** | formula | `CleanDomainCount = DomainCount` |
| **ProjectMetadata.LayoutSlotCount** | rollup | `Count(ProjectLayoutSlots via Project)` |
| **ProjectMetadata.FullyImplementedCount** | rollup | `Sum(RulebookDomains.FullyImplementedFlag via Project)` |
| **OntologyAxioms.Name** | formula | `ShortName` |
| **OntologyAxioms.InvariantCount** | rollup | `Count(FramingInvariants via ViolatedAxiomId)` |
| **OntologyAxioms.FeatureCount** | rollup | `Count(PlatformFeatures via RelatedAxiomId)` |
| **OntologyAxioms.IsActive** | formula | `Status = "active"` |
| **OntologyAxioms.CriticalInvariantCount** | rollup | `Sum(FramingInvariants.CriticalFlag via ViolatedAxiomId)` |
| **OntologyAxioms.ShippedFeatureCount** | rollup | `Sum(PlatformFeatures.ShippedFlag via RelatedAxiomId)` |
| **OntologyAxioms.IsLoadBearing** | formula | `Or(InvariantCount > 0, FeatureCount > 0)` |
| **OntologyAxioms.IsWellGuarded** | formula | `And(IsLoadBearing, CriticalInvariantCount > 0)` |
| **OntologyAxioms.GuardRatio** | formula | `If(InvariantCount = 0, 0, Round(CriticalInvariantCount / InvariantCount, 2))` |
| **OntologyAxioms.GuardState** | formula | `If(IsWellGuarded, "guarded", If(IsLoadBearing, "exposed", "dormant"))` |
| **OntologyAxioms.IsExposedFoundation** | formula | `GuardState = "exposed"` |
| **FramingInvariants.IsCritical** | formula | `Severity = "critical"` |
| **FramingInvariants.CriticalFlag** | formula | `If(Severity = "critical", 1, 0)` |
| **FramingInvariants.AxiomShortName** | lookup | `Lookup(OntologyAxioms.ShortName via ViolatedAxiomId)` |
| **FramingInvariants.AxiomIsActive** | lookup | `Lookup(OntologyAxioms.IsActive via ViolatedAxiomId)` |
| **FramingInvariants.IsActiveCritical** | formula | `And(IsCritical, Status = "active")` |
| **FramingInvariants.IsEnforceable** | formula | `And(IsActiveCritical, Coalesce(AxiomIsActive, False()))` |
| **FramingInvariants.AxiomIsLoadBearing** | lookup | `Lookup(OntologyAxioms.IsLoadBearing via ViolatedAxiomId)` |
| **FramingInvariants.EnforcementState** | formula | `If(IsEnforceable, "enforced", If(Coalesce(AxiomIsLoadBearing, False()), "advisory", "orphan"))` |
| **FramingInvariants.NeedsAttention** | formula | `EnforcementState = "orphan"` |
| **PlatformFeatures.IsReadmeStub** | formula | `Coalesce(ReadmeLength, 0) < 400` |
| **PlatformFeatures.IsHeadline** | formula | `Tier = "headline"` |
| **PlatformFeatures.IsShipped** | formula | `Status = "shipped"` |
| **PlatformFeatures.ShippedFlag** | formula | `If(Status = "shipped", 1, 0)` |
| **PlatformFeatures.AxiomShortName** | lookup | `Lookup(OntologyAxioms.ShortName via RelatedAxiomId)` |
| **PlatformFeatures.NeedsReadmeWork** | formula | `And(IsShipped, IsReadmeStub)` |
| **PlatformFeatures.AxiomInvariantCount** | lookup | `Lookup(OntologyAxioms.InvariantCount via RelatedAxiomId)` |
| **PlatformFeatures.AxiomIsLoadBearing** | lookup | `Lookup(OntologyAxioms.IsLoadBearing via RelatedAxiomId)` |
| **PlatformFeatures.IsHeadlineGap** | formula | `And(IsHeadline, NeedsReadmeWork)` |
| **PlatformFeatures.DocState** | formula | `If(IsHeadlineGap, "headline-gap", If(NeedsReadmeWork, "gap", If(IsShipped, "documented", "pending")))` |
| **PlatformFeatures.IsAxiomBacked** | formula | `And(Coalesce(AxiomIsLoadBearing, False()), IsShipped)` |
| **PlatformFeatures.IsShowcaseFeature** | formula | `And(IsAxiomBacked, DocState = "documented")` |
| **RulebookSourceSpokes.IsBidirectional** | formula | `Direction = "bidirectional"` |
| **RulebookSourceSpokes.IsOptional** | formula | `Not(Required)` |
| **RulebookSourceSpokes.IsOptionalBidirectional** | formula | `And(IsOptional, IsBidirectional)` |
| **RulebookSourceSpokes.SpokeKind** | formula | `If(IsOptionalBidirectional, "editing-surface", If(IsBidirectional, "required-sync", "one-way"))` |
| **RulebookSourceSpokes.IsAdvertisedSurface** | formula | `And(SpokeKind = "editing-surface", Not(Required))` |
| **RulebookSourceSpokes.SurfaceLabel** | formula | `If(IsAdvertisedSurface, Concat(Name, " (optional surface)"), Name)` |
| **RulebookDomains.Name** | formula | `DomainName` |
| **RulebookDomains.Slug** | formula | `Mid(DomainId, 8, 200)` |
| **RulebookDomains.IsToy** | formula | `Area = "toy-rulebooks"` |
| **RulebookDomains.ToyFlag** | formula | `If(Area = "toy-rulebooks", 1, 0)` |
| **RulebookDomains.HasRulebook** | formula | `RulebookPath <> ""` |
| **RulebookDomains.FindingCount** | rollup | `Count(ConsistencyFindings via Domain)` |
| **RulebookDomains.FlavorCardCount** | rollup | `Count(RulebookFlavors via Domain)` |
| **RulebookDomains.ChildDomainCount** | rollup | `Count(RulebookDomains via ParentDomainId)` |
| **RulebookDomains.ExpectedRulebookPath** | formula | `Concat(RelativePath, "effortless-rulebook/", Slug, "-rulebook.json")` |
| **RulebookDomains.OpenFindingCount** | rollup | `Sum(ConsistencyFindings.OpenFlag via Domain)` |
| **RulebookDomains.HasFlavorCard** | formula | `FlavorCardCount > 0` |
| **RulebookDomains.IsProgressionRoot** | formula | `And(ParentDomainId = "", ChildDomainCount > 0)` |
| **RulebookDomains.IsStandardLayout** | formula | `Or(Coalesce(RulebookPath, "") = ExpectedRulebookPath, Coalesce(RulebookPath, "") = Concat(RelativePath, "effortless-rulebook/effortless-rulebook.json"))` |
| **RulebookDomains.IsFullyConsistent** | formula | `OpenFindingCount = 0` |
| **RulebookDomains.CleanFlag** | formula | `If(OpenFindingCount = 0, 1, 0)` |
| **RulebookDomains.ConsistencyGrade** | formula | `If(OpenFindingCount = 0, "clean", If(OpenFindingCount <= 2, "minor", "major"))` |
| **RulebookDomains.NeedsFlavorCard** | formula | `And(Area <> "root", Not(IsIntentionalException), Not(HasFlavorCard))` |
| **RulebookDomains.NeedsFlavorFlag** | formula | `If(And(Area <> "root", Not(IsIntentionalException), Not(HasFlavorCard)), 1, 0)` |
| **RulebookDomains.LayoutFlag** | formula | `If(IsStandardLayout, 1, 0)` |
| **RulebookDomains.ConformanceScore** | formula | `If(IsFullyConsistent, 1, 0) + If(IsStandardLayout, 1, 0) + If(HasFlavorCard, 1, 0) + If(HasRulebook, 1, 0)` |
| **RulebookDomains.IsShowcaseReady** | formula | `And(IsFullyConsistent, IsStandardLayout, Not(IsToy))` |
| **RulebookDomains.ConformanceBand** | formula | `If(ConformanceScore = 4, "exemplary", If(ConformanceScore >= 2, "acceptable", "needs-work"))` |
| **RulebookDomains.ShowcaseFlag** | formula | `If(IsShowcaseReady, 1, 0)` |
| **RulebookDomains.SlotWitnessCount** | rollup | `Count(ProjectSlotWitnesses via Domain)` |
| **RulebookDomains.PresentSlotCount** | rollup | `Sum(ProjectSlotWitnesses.PresentFlag via Domain)` |
| **RulebookDomains.ImplementationGapCount** | rollup | `Sum(ProjectSlotWitnesses.ImplementationGapFlag via Domain)` |
| **RulebookDomains.UniversalGapCount** | rollup | `Sum(ProjectSlotWitnesses.UniversalGapFlag via Domain)` |
| **RulebookDomains.SlotCoveragePercent** | formula | `If(SlotWitnessCount = 0, 0, Round(100 * PresentSlotCount / SlotWitnessCount, 0))` |
| **RulebookDomains.RequiredSlotCount** | rollup | `Sum(ProjectSlotWitnesses.RequiredHereFlag via Domain)` |
| **RulebookDomains.RequiredPresentCount** | rollup | `Sum(ProjectSlotWitnesses.RequiredPresentFlag via Domain)` |
| **RulebookDomains.RequiredGapCount** | rollup | `Sum(ProjectSlotWitnesses.GapFlag via Domain)` |
| **RulebookDomains.IsFullyImplemented** | formula | `And(ImplementationGapCount = 0, Not(IsIntentionalException))` |
| **RulebookDomains.IsToyByCoverage** | formula | `And(Area <> "root", Not(IsIntentionalException), SlotCoveragePercent < 60)` |
| **RulebookDomains.FullyImplementedFlag** | formula | `If(And(ImplementationGapCount = 0, Not(IsIntentionalException)), 1, 0)` |
| **RulebookDomains.RequiredSlotCoveragePercent** | formula | `If(RequiredSlotCount = 0, 100, Round(100 * RequiredPresentCount / RequiredSlotCount, 0))` |
| **RulebookDomains.ExpectedArea** | formula | `If(Area = "root", "root", If(IsToyByCoverage, "toy-rulebooks", "rulebook-examples"))` |
| **RulebookDomains.IsMisfiled** | formula | `And(Not(IsIntentionalException), Area <> "root", Or(And(IsToyByCoverage, Area <> "toy-rulebooks"), And(Not(IsToyByCoverage), Area <> "rulebook-examples")))` |
| **RulebookDomains.ReadinessState** | formula | `If(IsIntentionalException, "intentional-exception", If(Area = "root", If(IsFullyImplemented, "root-ready", "root-incomplete"), If(IsToyByCoverage, "toy", If(IsFullyImplemented, "example-ready", "example-incomplete"))))` |
| **ProjectLaunchProfiles.Name** | formula | `Concat(Domain, " launch")` |
| **ProjectLaunchProfiles.PrimaryServiceCount** | rollup | `Sum(ProjectLocalServices.IsPrimaryFlag via LaunchProfile)` |
| **ProjectLaunchProfiles.ServiceCount** | rollup | `Count(ProjectLocalServices via LaunchProfile)` |
| **ProjectLaunchProfiles.HasCompleteInstructions** | formula | `And(WorkingDirectory <> "", StartCommand <> "", ExperienceDescription <> "")` |
| **ProjectLaunchProfiles.HasPrimaryService** | formula | `PrimaryServiceCount = 1` |
| **ProjectLaunchProfiles.IsLaunchContractComplete** | formula | `And(HasCompleteInstructions, Or(Not(RequiresLocalUrl), HasPrimaryService))` |
| **ProjectLocalServices.Name** | formula | `Concat(LaunchProfile, " ", ServiceRole)` |
| **ProjectLocalServices.HasHealthUrl** | formula | `HealthUrl <> ""` |
| **ProjectLocalServices.IsHttpService** | formula | `Or(Left(LocalUrl, 7) = "http://", Left(LocalUrl, 8) = "https://")` |
| **ProjectLocalServices.IsComplete** | formula | `And(LocalUrl <> "", HealthUrl <> "")` |
| **RulebookFlavors.Name** | formula | `DisplayName` |
| **RulebookFlavors.DerivedFieldCount** | formula | `CalculatedCount + AggregationCount + LookupCount` |
| **RulebookFlavors.HasDomain** | formula | `Domain <> ""` |
| **RulebookFlavors.TagCount** | rollup | `Count(FlavorTags via Flavor)` |
| **RulebookFlavors.AnswerKeyTargetCount** | formula | `If(GoodAnswerKeyFor = "", 0, Len(GoodAnswerKeyFor) - Len(Replace(GoodAnswerKeyFor, ",", "")) + 1)` |
| **RulebookFlavors.DomainArea** | lookup | `Lookup(RulebookDomains.Area via Domain)` |
| **RulebookFlavors.DerivedRatio** | formula | `If(EntityCount = 0, 0, Round(DerivedFieldCount / EntityCount, 2))` |
| **RulebookFlavors.IsTagged** | formula | `TagCount > 0` |
| **RulebookFlavors.IsToyFlavor** | formula | `DomainArea = "toy-rulebooks"` |
| **RulebookFlavors.DomainFindingCount** | lookup | `Lookup(RulebookDomains.FindingCount via Domain)` |
| **RulebookFlavors.DomainOpenFindingCount** | lookup | `Lookup(RulebookDomains.OpenFindingCount via Domain)` |
| **RulebookFlavors.IsDenseDerivation** | formula | `DerivedRatio >= 1` |
| **RulebookFlavors.IsCatalogComplete** | formula | `And(HasDomain, IsTagged)` |
| **RulebookFlavors.DomainIsConsistent** | lookup | `Lookup(RulebookDomains.IsFullyConsistent via Domain)` |
| **RulebookFlavors.DomainIsStandardLayout** | lookup | `Lookup(RulebookDomains.IsStandardLayout via Domain)` |
| **RulebookFlavors.IsShowcaseCard** | formula | `And(IsCatalogComplete, Coalesce(DomainOpenFindingCount, 1) = 0)` |
| **RulebookFlavors.IsCatalogReady** | formula | `And(IsShowcaseCard, Coalesce(DomainIsConsistent, False()))` |
| **RulebookFlavors.DomainConformanceScore** | lookup | `Lookup(RulebookDomains.ConformanceScore via Domain)` |
| **FieldTypeTaxonomy.Name** | formula | `TypeName` |
| **FieldTypeTaxonomy.IsStored** | formula | `StorageMode = "stored"` |
| **FieldTypeTaxonomy.IsFullyExpressiveTier** | formula | `ExpressiveTier = "full"` |
| **FieldTypeTaxonomy.IsStoredAndEditable** | formula | `And(IsStored, Not(ReadOnlyInUi))` |
| **FieldTypeTaxonomy.TierLabel** | formula | `If(IsStoredAndEditable, "input", If(IsFullyExpressiveTier, "derived-full", "derived-partial"))` |
| **FieldTypeTaxonomy.IsInputTier** | formula | `TierLabel = "input"` |
| **FieldTypeTaxonomy.UiHint** | formula | `If(IsInputTier, "editable", "read-only")` |
| **FormulaDialects.IsActive** | formula | `Status = "active"` |
| **FormulaDialects.PrimarySubstrateCount** | formula | `If(PrimarySubstrates = "", 0, Len(PrimarySubstrates) - Len(Replace(PrimarySubstrates, ",", "")) + 1)` |
| **FormulaDialects.IsActiveMultiSubstrate** | formula | `And(IsActive, PrimarySubstrateCount > 1)` |
| **FormulaDialects.DialectRole** | formula | `If(IsActiveMultiSubstrate, "primary", If(IsActive, "niche", "retired"))` |
| **FormulaDialects.IsPrimaryDialect** | formula | `DialectRole = "primary"` |
| **FormulaDialects.DialectLabel** | formula | `If(IsPrimaryDialect, Concat(Name, " (primary)"), Name)` |
| **DemoNarratives.Name** | formula | `Concat(NarrativeName, " / ", StepName)` |
| **DemoNarratives.IsDeprecated** | formula | `Status = "deprecated"` |
| **DemoNarratives.IsSuperseded** | formula | `SupersededBy <> ""` |
| **DemoNarratives.DomainName** | lookup | `Lookup(RulebookDomains.DomainName via RelatedDomainId)` |
| **DemoNarratives.IsRetired** | formula | `Or(IsDeprecated, IsSuperseded)` |
| **DemoNarratives.DomainIsToy** | lookup | `Lookup(RulebookDomains.IsToy via RelatedDomainId)` |
| **DemoNarratives.IsRetiredToyStory** | formula | `And(IsRetired, Coalesce(DomainIsToy, False()))` |
| **DemoNarratives.IsLiveStory** | formula | `And(Not(IsRetired), RelatedDomainId <> "")` |
| **DemoNarratives.StoryState** | formula | `If(IsLiveStory, "live", If(IsRetiredToyStory, "retired-toy", "retired"))` |
| **DemoNarratives.IsCurrentStory** | formula | `StoryState = "live"` |
| **Glossary.Name** | formula | `Term` |
| **Glossary.AliasCount** | formula | `If(Aliases = "", 0, Len(Aliases) - Len(Replace(Aliases, ",", "")) + 1)` |
| **Glossary.HasImplementation** | formula | `ImplementedAs <> ""` |
| **Glossary.ImplementationKind** | formula | `If(Len(Coalesce(ImplementedAs, "")) = Len(Replace(Coalesce(ImplementedAs, ""), ":", "")), "", Left(ImplementedAs, Find(":", ImplementedAs) - 1))` |
| **Glossary.IsFileBacked** | formula | `ImplementationKind = "file"` |
| **Glossary.IsRichTerm** | formula | `And(AliasCount > 0, HasImplementation)` |
| **Glossary.TermQuality** | formula | `If(IsRichTerm, If(IsFileBacked, "anchored", "rich"), If(HasImplementation, "implemented", "definition-only"))` |
| **Glossary.IsAnchored** | formula | `TermQuality = "anchored"` |
| **Glossary.GlossaryTier** | formula | `If(IsAnchored, "tier-1", If(TermQuality = "rich", "tier-2", "tier-3"))` |
| **RulebookTags.Name** | formula | `Label` |
| **RulebookTags.UsageCount** | rollup | `Count(FlavorTags via Tag)` |
| **RulebookTags.IsSourceTag** | formula | `Category = "source"` |
| **RulebookTags.IsUnused** | formula | `UsageCount = 0` |
| **RulebookTags.UnusedFlag** | formula | `If(UsageCount = 0, 1, 0)` |
| **RulebookTags.TagHealth** | formula | `If(IsUnused, "unused", If(UsageCount >= 5, "common", "rare"))` |
| **RulebookTags.IsRetirementCandidate** | formula | `TagHealth = "unused"` |
| **RulebookTags.TagAction** | formula | `If(IsRetirementCandidate, "retire", "keep")` |
| **FlavorTags.Name** | formula | `Concat(Flavor, ":", Tag)` |
| **FlavorTags.TagLabel** | lookup | `Lookup(RulebookTags.Label via Tag)` |
| **FlavorTags.TagCategory** | lookup | `Lookup(RulebookTags.Category via Tag)` |
| **FlavorTags.FlavorDisplayName** | lookup | `Lookup(RulebookFlavors.DisplayName via Flavor)` |
| **FlavorTags.IsSourceTagging** | formula | `TagCategory = "source"` |
| **FlavorTags.FlavorTagCount** | lookup | `Lookup(RulebookFlavors.TagCount via Flavor)` |
| **FlavorTags.IsSoleTag** | formula | `Coalesce(FlavorTagCount, 0) = 1` |
| **FlavorTags.TagShare** | formula | `If(Coalesce(FlavorTagCount, 0) = 0, 0, Round(100 / FlavorTagCount, 0))` |
| **FlavorTags.IsDefiningTag** | formula | `And(IsSoleTag, IsSourceTagging)` |
| **FlavorTags.TagWeight** | formula | `If(IsDefiningTag, 2, 1)` |
| **ClaudeSkills.SlashCommand** | formula | `Concat("/", Name)` |
| **ClaudeSkills.LocalMirrorPath** | formula | `Concat("docs/skills/", Name, "/SKILL.md")` |
| **ClaudeSkills.IsDeprecated** | formula | `Status = "deprecated"` |
| **ClaudeSkills.DeprecatedFlag** | formula | `If(Status = "deprecated", 1, 0)` |
| **ClaudeSkills.OutboundRouteCount** | rollup | `Count(SkillRoutes via FromSkill)` |
| **ClaudeSkills.InboundRouteCount** | rollup | `Count(SkillRoutes via ToSkill)` |
| **ClaudeSkills.IsCustomerFacing** | formula | `Audience = "customer"` |
| **ClaudeSkills.IsIsolated** | formula | `And(OutboundRouteCount = 0, InboundRouteCount = 0)` |
| **ClaudeSkills.IsolatedFlag** | formula | `If(And(OutboundRouteCount = 0, InboundRouteCount = 0), 1, 0)` |
| **ClaudeSkills.IsHub** | formula | `OutboundRouteCount >= 5` |
| **ClaudeSkills.RouteDegree** | formula | `OutboundRouteCount + InboundRouteCount` |
| **ClaudeSkills.SkillRole** | formula | `If(IsIsolated, "isolated", If(IsHub, "hub", If(InboundRouteCount > 0, "leaf", "source")))` |
| **ClaudeSkills.IsLiveHub** | formula | `And(IsHub, Not(IsDeprecated))` |
| **ClaudeSkills.IsDeprecatedButRouted** | formula | `And(IsDeprecated, RouteDegree > 0)` |
| **ClaudeSkills.CatalogState** | formula | `If(IsDeprecatedButRouted, "deprecated-routed", If(IsLiveHub, "hub", SkillRole))` |
| **ClaudeSkills.HealthyFlag** | formula | `If(Or(IsDeprecatedButRouted, IsIsolated), 0, 1)` |
| **ClaudeSkills.NeedsCatalogAction** | formula | `HealthyFlag = 0` |
| **ClaudeSkills.CatalogLabel** | formula | `Concat(Name, " [", CatalogState, "]")` |
| **BuildPhases.Name** | formula | `Title` |
| **BuildPhases.StoryCount** | rollup | `Count(UserStories via BuildPhase)` |
| **BuildPhases.PackageCount** | rollup | `Count(ERBPackages via PrimaryPhase)` |
| **BuildPhases.IsPriced** | formula | `Coalesce(QuotedPrice, 0) > 0` |
| **BuildPhases.PricedFlag** | formula | `If(Coalesce(QuotedPrice, 0) > 0, 1, 0)` |
| **BuildPhases.IsFixedPrice** | formula | `PhaseKind = "fixed-price"` |
| **BuildPhases.DoneStoryCount** | rollup | `Sum(UserStories.DoneFlag via BuildPhase)` |
| **BuildPhases.EffortWeightSum** | rollup | `Sum(UserStories.EffortWeight via BuildPhase)` |
| **BuildPhases.HasStories** | formula | `StoryCount > 0` |
| **BuildPhases.DonePercent** | formula | `If(StoryCount = 0, 0, Round(100 * DoneStoryCount / StoryCount, 0))` |
| **BuildPhases.WeightedDoneSum** | rollup | `Sum(UserStories.WeightedDone via BuildPhase)` |
| **BuildPhases.IsPricedWithStories** | formula | `And(IsPriced, HasStories)` |
| **BuildPhases.WeightedDonePercent** | formula | `If(EffortWeightSum = 0, 0, Round(100 * WeightedDoneSum / EffortWeightSum, 0))` |
| **BuildPhases.AvgStoryProgress** | rollup | `Average(UserStories.DerivedProgressPercent via BuildPhase)` |
| **BuildPhases.IsContractSafe** | formula | `Or(Not(IsPriced), IsPricedWithStories)` |
| **BuildPhases.PhaseState** | formula | `If(WeightedDonePercent = 100, "complete", If(WeightedDonePercent > 0, "in-progress", If(IsCurrentBid, "bid", "planned")))` |
| **BuildPhases.IsReportSafe** | formula | `And(IsContractSafe, HasStories)` |
| **EffortClasses.Name** | formula | `Title` |
| **EffortClasses.StoryCount** | rollup | `Count(UserStories via EffortClass)` |
| **EffortClasses.WeightedStoryLoad** | formula | `StoryCount * ComplexityWeight` |
| **EffortClasses.IsHeavyLoad** | formula | `WeightedStoryLoad >= 20` |
| **EffortClasses.LoadBand** | formula | `If(IsHeavyLoad, "heavy", "light")` |
| **EffortClasses.ClassLabel** | formula | `Concat(Title, " (", LoadBand, ")")` |
| **DeliveryDisciplines.Name** | formula | `Title` |
| **DeliveryDisciplines.VisibleShare** | formula | `If(ClientVisible, SharePercent, 0)` |
| **DeliveryDisciplines.IsMajorDiscipline** | formula | `SharePercent >= 20` |
| **DeliveryDisciplines.IsVisibleMajor** | formula | `And(ClientVisible, IsMajorDiscipline)` |
| **DeliveryDisciplines.DisciplineTier** | formula | `If(IsVisibleMajor, "major", If(ClientVisible, "minor", "internal"))` |
| **DeliveryDisciplines.IsClientHeadline** | formula | `DisciplineTier = "major"` |
| **DeliveryDisciplines.DisciplineLabel** | formula | `If(IsClientHeadline, Concat(Title, " *"), Title)` |
| **ERBPackages.Name** | formula | `Title` |
| **ERBPackages.CategoryCount** | rollup | `Count(ERBFeatureCategories via ERBPackage)` |
| **ERBPackages.FeatureCount** | rollup | `Count(ERBFeatures via ERBPackage)` |
| **ERBPackages.PhaseTitle** | lookup | `Lookup(BuildPhases.Title via PrimaryPhase)` |
| **ERBPackages.PhaseNumber** | lookup | `Lookup(BuildPhases.PhaseNumber via PrimaryPhase)` |
| **ERBPackages.StoryCount** | rollup | `Sum(ERBFeatures.StoryCount via ERBPackage)` |
| **ERBPackages.PhaseIsPriced** | lookup | `Lookup(BuildPhases.IsPriced via PrimaryPhase)` |
| **ERBPackages.DoneStoryCount** | rollup | `Sum(ERBFeatures.DoneStoryCount via ERBPackage)` |
| **ERBPackages.IsPricedPackage** | formula | `And(Coalesce(PhaseIsPriced, False()), StoryCount > 0)` |
| **ERBPackages.DonePercent** | formula | `If(StoryCount = 0, 0, Round(100 * DoneStoryCount / StoryCount, 0))` |
| **ERBPackages.AvgFeatureDonePercent** | rollup | `Average(ERBFeatures.DonePercent via ERBPackage)` |
| **ERBPackages.IsComplete** | formula | `DonePercent = 100` |
| **ERBPackages.PackageState** | formula | `If(DonePercent = 100, "complete", If(Coalesce(AvgFeatureDonePercent, 0) > 0, "in-progress", "planned"))` |
| **ERBFeatureCategories.Name** | formula | `Title` |
| **ERBFeatureCategories.FeatureCount** | rollup | `Count(ERBFeatures via Category)` |
| **ERBFeatureCategories.StoryCount** | rollup | `Count(UserStories via Epic)` |
| **ERBFeatureCategories.PackageTitle** | lookup | `Lookup(ERBPackages.Title via ERBPackage)` |
| **ERBFeatureCategories.HasStories** | formula | `StoryCount > 0` |
| **ERBFeatureCategories.PackageFeatureCount** | lookup | `Lookup(ERBPackages.FeatureCount via ERBPackage)` |
| **ERBFeatureCategories.FeatureDoneStoryCount** | rollup | `Sum(ERBFeatures.DoneStoryCount via Category)` |
| **ERBFeatureCategories.ShareOfPackageFeatures** | formula | `If(PackageFeatureCount = 0, 0, Round(100 * FeatureCount / PackageFeatureCount, 0))` |
| **ERBFeatureCategories.DonePercent** | formula | `If(StoryCount = 0, 0, Round(100 * FeatureDoneStoryCount / StoryCount, 0))` |
| **ERBFeatureCategories.AvgStoryProgress** | rollup | `Average(UserStories.DerivedProgressPercent via Epic)` |
| **ERBFeatureCategories.EpicState** | formula | `If(DonePercent = 100, "complete", If(Coalesce(AvgStoryProgress, 0) > 0, "in-progress", "planned"))` |
| **ERBFeatures.Name** | formula | `Title` |
| **ERBFeatures.StoryCount** | rollup | `Count(UserStories via Feature)` |
| **ERBFeatures.CategoryTitle** | lookup | `Lookup(ERBFeatureCategories.Title via Category)` |
| **ERBFeatures.PackageTitle** | lookup | `Lookup(ERBPackages.Title via ERBPackage)` |
| **ERBFeatures.DoneStoryCount** | rollup | `Sum(UserStories.DoneFlag via Feature)` |
| **ERBFeatures.HasStories** | formula | `StoryCount > 0` |
| **ERBFeatures.CategoryStoryCount** | lookup | `Lookup(ERBFeatureCategories.StoryCount via Category)` |
| **ERBFeatures.DonePercent** | formula | `If(StoryCount = 0, 0, Round(100 * DoneStoryCount / StoryCount, 0))` |
| **ERBFeatures.ShareOfEpicStories** | formula | `If(CategoryStoryCount = 0, 0, Round(100 * StoryCount / CategoryStoryCount, 0))` |
| **ERBFeatures.AvgStoryProgress** | rollup | `Average(UserStories.DerivedProgressPercent via Feature)` |
| **ERBFeatures.IsComplete** | formula | `DonePercent = 100` |
| **ERBFeatures.FeatureState** | formula | `If(IsComplete, "complete", If(Coalesce(AvgStoryProgress, 0) > 0, "in-progress", "planned"))` |
| **UserStories.Name** | formula | `ReqId` |
| **UserStories.CriterionCount** | rollup | `Count(AcceptanceCriteria via UserStory)` |
| **UserStories.IsDone** | formula | `Status = "done"` |
| **UserStories.DoneFlag** | formula | `If(Status = "done", 1, 0)` |
| **UserStories.EffortWeight** | lookup | `Lookup(EffortClasses.ComplexityWeight via EffortClass)` |
| **UserStories.PhaseNumber** | lookup | `Lookup(BuildPhases.PhaseNumber via BuildPhase)` |
| **UserStories.FeatureTitle** | lookup | `Lookup(ERBFeatures.Title via Feature)` |
| **UserStories.MetCriterionCount** | rollup | `Sum(AcceptanceCriteria.MetFlag via UserStory)` |
| **UserStories.HasCriteria** | formula | `CriterionCount > 0` |
| **UserStories.WeightedDone** | formula | `DoneFlag * EffortWeight` |
| **UserStories.DerivedProgressPercent** | formula | `If(HasCriteria, Round(100 * MetCriterionCount / CriterionCount, 0), DevProgressPercent)` |
| **UserStories.IsAcceptanceComplete** | formula | `And(HasCriteria, MetCriterionCount = CriterionCount)` |
| **UserStories.HasStatusDrift** | formula | `And(IsDone, MetCriterionCount <> CriterionCount)` |
| **UserStories.WeightedProgress** | formula | `DerivedProgressPercent * Coalesce(EffortWeight, 0)` |
| **UserStories.ProgressState** | formula | `If(HasStatusDrift, "drift", If(IsAcceptanceComplete, "accepted", If(DerivedProgressPercent > 0, "in-flight", "not-started")))` |
| **UserStories.PriorityBand** | formula | `If(ProgressState = "drift", "fix-first", If(ProgressState = "in-flight", "continue", "queue"))` |
| **UserStories.ReportLabel** | formula | `Concat(ReqId, " ", ProgressState)` |
| **AcceptanceCriteria.Name** | formula | `AcceptanceCriterionId` |
| **AcceptanceCriteria.MetFlag** | formula | `If(IsMet, 1, 0)` |
| **AcceptanceCriteria.StoryReqId** | lookup | `Lookup(UserStories.ReqId via UserStory)` |
| **AcceptanceCriteria.StoryStatus** | lookup | `Lookup(UserStories.Status via UserStory)` |
| **AcceptanceCriteria.StoryIsDone** | lookup | `Lookup(UserStories.IsDone via UserStory)` |
| **AcceptanceCriteria.StoryCriterionCount** | lookup | `Lookup(UserStories.CriterionCount via UserStory)` |
| **AcceptanceCriteria.IsInconsistentWithStory** | formula | `And(Coalesce(StoryIsDone, False()), Not(IsMet))` |
| **AcceptanceCriteria.ShareOfStory** | formula | `If(Coalesce(StoryCriterionCount, 0) = 0, 0, Round(100 / StoryCriterionCount, 0))` |
| **AcceptanceCriteria.StoryDerivedProgress** | lookup | `Lookup(UserStories.DerivedProgressPercent via UserStory)` |
| **AcceptanceCriteria.CriterionState** | formula | `If(IsInconsistentWithStory, "contradicts-story", If(IsMet, "met", "pending"))` |
| **AcceptanceCriteria.NeedsReview** | formula | `CriterionState = "contradicts-story"` |
| **AcceptanceCriteria.StoryIsAheadOfCriterion** | formula | `And(Not(IsMet), Coalesce(StoryDerivedProgress, 0) >= 50)` |
| **ConsistencyRules.Name** | formula | `RuleCode` |
| **ConsistencyRules.FindingCount** | rollup | `Count(ConsistencyFindings via Rule)` |
| **ConsistencyRules.IsCritical** | formula | `Severity = "critical"` |
| **ConsistencyRules.IsRepoScope** | formula | `Scope <> "demo"` |
| **ConsistencyRules.OpenFindingCount** | rollup | `Sum(ConsistencyFindings.OpenFlag via Rule)` |
| **ConsistencyRules.HasFindings** | formula | `FindingCount > 0` |
| **ConsistencyRules.IsSatisfied** | formula | `OpenFindingCount = 0` |
| **ConsistencyRules.SatisfiedFlag** | formula | `If(OpenFindingCount = 0, 1, 0)` |
| **ConsistencyRules.AcceptedOrFixedCount** | formula | `FindingCount - OpenFindingCount` |
| **ConsistencyRules.OpenCriticalFlag** | formula | `If(And(IsCritical, OpenFindingCount > 0), 1, 0)` |
| **ConsistencyRules.RuleState** | formula | `If(IsSatisfied, "satisfied", If(OpenCriticalFlag = 1, "critical-open", "open"))` |
| **ConsistencyRules.ResolutionPercent** | formula | `If(FindingCount = 0, 100, Round(100 * AcceptedOrFixedCount / FindingCount, 0))` |
| **ConsistencyRules.RuleLabel** | formula | `Concat(RuleCode, " [", RuleState, "]")` |
| **ConsistencyRules.IsSweepPriority** | formula | `And(RuleState <> "satisfied", ResolutionPercent < 50)` |
| **ConsistencyFindings.Name** | formula | `Concat(Coalesce(Domain, "repo"), " x ", Rule)` |
| **ConsistencyFindings.IsOpen** | formula | `Status = "open"` |
| **ConsistencyFindings.OpenFlag** | formula | `If(Status = "open", 1, 0)` |
| **ConsistencyFindings.IsRepoScope** | formula | `Domain = ""` |
| **ConsistencyFindings.RuleSeverity** | lookup | `Lookup(ConsistencyRules.Severity via Rule)` |
| **ConsistencyFindings.RuleCode** | lookup | `Lookup(ConsistencyRules.RuleCode via Rule)` |
| **ConsistencyFindings.DomainName** | lookup | `Lookup(RulebookDomains.DomainName via Domain)` |
| **ConsistencyFindings.IsOpenCritical** | formula | `And(IsOpen, RuleSeverity = "critical")` |
| **ConsistencyFindings.DomainFindingCount** | lookup | `Lookup(RulebookDomains.FindingCount via Domain)` |
| **ConsistencyFindings.RuleFindingCount** | lookup | `Lookup(ConsistencyRules.FindingCount via Rule)` |
| **ConsistencyFindings.DomainOpenFindingCount** | lookup | `Lookup(RulebookDomains.OpenFindingCount via Domain)` |
| **ConsistencyFindings.RuleOpenFindingCount** | lookup | `Lookup(ConsistencyRules.OpenFindingCount via Rule)` |
| **ConsistencyFindings.IsSoleFindingOnDomain** | formula | `Coalesce(DomainFindingCount, 0) = 1` |
| **ConsistencyFindings.IsSoleBlocker** | formula | `And(IsOpen, Coalesce(DomainOpenFindingCount, 0) = 1)` |
| **ConsistencyFindings.RuleIsSatisfied** | lookup | `Lookup(ConsistencyRules.IsSatisfied via Rule)` |
| **ConsistencyFindings.DomainGrade** | lookup | `Lookup(RulebookDomains.ConsistencyGrade via Domain)` |
| **ConsistencyFindings.Priority** | formula | `If(IsOpenCritical, "P1", If(IsSoleBlocker, "P2", If(IsOpen, "P3", "closed")))` |
| **ConsistencyFindings.IsLastMile** | formula | `And(IsSoleBlocker, Coalesce(DomainGrade, "") = "minor")` |
| **MobileNavTabs.Name** | formula | `Label` |
| **MobileNavTabs.RouteCount** | rollup | `Count(MobileRoutes via Tab)` |
| **MobileNavTabs.UnbuiltRouteCount** | rollup | `Sum(MobileRoutes.UnbuiltFlag via Tab)` |
| **MobileNavTabs.HasRoutes** | formula | `RouteCount > 0` |
| **MobileNavTabs.BuildCoveragePercent** | formula | `If(RouteCount = 0, 0, Round(100 * RouteCount - UnbuiltRouteCount / RouteCount, 0))` |
| **MobileNavTabs.IsPlanOnly** | formula | `And(HasRoutes, UnbuiltRouteCount = RouteCount)` |
| **MobileNavTabs.IsShippable** | formula | `BuildCoveragePercent = 100` |
| **MobileNavTabs.ShippableFlag** | formula | `If(BuildCoveragePercent = 100, 1, 0)` |
| **MobileNavTabs.TabState** | formula | `If(IsShippable, "shippable", If(IsPlanOnly, "plan-only", "partial"))` |
| **MobileRoutes.Name** | formula | `Path` |
| **MobileRoutes.Depth** | formula | `If(Path = "/", 0, Len(Path) - Len(Replace(Path, "/", "")))` |
| **MobileRoutes.IsDetail** | formula | `Len(Path) <> Len(Replace(Path, ":", ""))` |
| **MobileRoutes.HasScreen** | formula | `Screen <> ""` |
| **MobileRoutes.UnbuiltFlag** | formula | `If(Screen = "", 1, 0)` |
| **MobileRoutes.ChildRouteCount** | rollup | `Count(MobileRoutes via ParentRoute)` |
| **MobileRoutes.TabLabel** | lookup | `Lookup(MobileNavTabs.Label via Tab)` |
| **MobileRoutes.EntityCount** | formula | `If(ReadsEntities = "", 0, Len(ReadsEntities) - Len(Replace(ReadsEntities, ",", "")) + 1)` |
| **MobileRoutes.ParentDepth** | lookup | `Lookup(MobileRoutes.Depth via ParentRoute)` |
| **MobileRoutes.IsLeafRoute** | formula | `ChildRouteCount = 0` |
| **MobileRoutes.TabRouteCount** | lookup | `Lookup(MobileNavTabs.RouteCount via Tab)` |
| **MobileRoutes.IsDepthConsistent** | formula | `If(ParentRoute = "", Depth <= 1, Depth = ParentDepth + 1)` |
| **MobileRoutes.TabUnbuiltCount** | lookup | `Lookup(MobileNavTabs.UnbuiltRouteCount via Tab)` |
| **MobileRoutes.ShareOfTab** | formula | `If(Coalesce(TabRouteCount, 0) = 0, 0, Round(100 / TabRouteCount, 0))` |
| **MobileRoutes.TabCoveragePercent** | lookup | `Lookup(MobileNavTabs.BuildCoveragePercent via Tab)` |
| **MobileRoutes.RouteState** | formula | `If(Not(IsDepthConsistent), "misparented", If(HasScreen, "built", "planned"))` |
| **MobileRoutes.IsOnShippableTab** | formula | `Coalesce(TabCoveragePercent, 0) = 100` |
| **MobileRoutes.RouteLabel** | formula | `Concat(Path, " [", RouteState, "]")` |
| **SkillRoutes.Name** | formula | `Concat(FromSkill, " -> ", ToSkill)` |
| **SkillRoutes.FromStatus** | lookup | `Lookup(ClaudeSkills.Status via FromSkill)` |
| **SkillRoutes.ToStatus** | lookup | `Lookup(ClaudeSkills.Status via ToSkill)` |
| **SkillRoutes.IsOrchestratorRoute** | formula | `FromSkill = "effortless-orchestrator"` |
| **SkillRoutes.IsDeprecatedTarget** | formula | `ToStatus = "deprecated"` |
| **SkillRoutes.ToInboundCount** | lookup | `Lookup(ClaudeSkills.InboundRouteCount via ToSkill)` |
| **SkillRoutes.FromOutboundCount** | lookup | `Lookup(ClaudeSkills.OutboundRouteCount via FromSkill)` |
| **SkillRoutes.IsHubEdge** | formula | `Coalesce(FromOutboundCount, 0) >= 5` |
| **SkillRoutes.IsIntoLeaf** | formula | `Coalesce(ToInboundCount, 0) = 1` |
| **SkillRoutes.IsStale** | formula | `Or(IsDeprecatedTarget, FromStatus = "deprecated")` |
| **SkillRoutes.EdgeClass** | formula | `If(IsStale, "stale", If(IsHubEdge, If(IsIntoLeaf, "hub-to-leaf", "hub-fanout"), "peer"))` |
| **SkillRoutes.RouteLabel** | formula | `Concat(FromSkill, " -> ", ToSkill, " [", EdgeClass, "]")` |
| **ProjectLayoutSlots.Name** | formula | `Title` |
| **ProjectLayoutSlots.WitnessCount** | rollup | `Count(ProjectSlotWitnesses via Slot)` |
| **ProjectLayoutSlots.PresentCount** | rollup | `Sum(ProjectSlotWitnesses.PresentFlag via Slot)` |
| **ProjectLayoutSlots.ImplementationGapCount** | rollup | `Sum(ProjectSlotWitnesses.ImplementationGapFlag via Slot)` |
| **ProjectLayoutSlots.CoveragePercent** | formula | `If(WitnessCount = 0, 0, Round(100 * PresentCount / WitnessCount, 0))` |
| **ProjectLayoutSlots.IsUniversallyFilled** | formula | `CoveragePercent = 100` |
| **ProjectLayoutSlots.SlotHealth** | formula | `If(ImplementationGapCount = 0, "clean", If(ImplementationGapCount <= 3, "few-gaps", "widespread"))` |
| **ProjectLayoutSlots.SlotLabel** | formula | `Concat(Title, " [", SlotHealth, "]")` |
| **ProjectSlotWitnesses.Name** | formula | `ProjectSlotWitnessId` |
| **ProjectSlotWitnesses.PresentFlag** | formula | `If(IsPresent, 1, 0)` |
| **ProjectSlotWitnesses.SlotRequiredForRoot** | lookup | `Lookup(ProjectLayoutSlots.RequiredForRoot via Slot)` |
| **ProjectSlotWitnesses.SlotRequiredForExample** | lookup | `Lookup(ProjectLayoutSlots.RequiredForExample via Slot)` |
| **ProjectSlotWitnesses.SlotRequiredForToy** | lookup | `Lookup(ProjectLayoutSlots.RequiredForToy via Slot)` |
| **ProjectSlotWitnesses.DomainArea** | lookup | `Lookup(RulebookDomains.Area via Domain)` |
| **ProjectSlotWitnesses.DomainIsException** | lookup | `Lookup(RulebookDomains.IsIntentionalException via Domain)` |
| **ProjectSlotWitnesses.IsRequiredHere** | formula | `And(Not(Coalesce(DomainIsException, False())), Or(And(DomainArea = "root", Coalesce(SlotRequiredForRoot, False())), And(DomainArea = "rulebook-examples", Coalesce(SlotRequiredForExample, False())), And(DomainArea = "toy-rulebooks", Coalesce(SlotRequiredForToy, False()))))` |
| **ProjectSlotWitnesses.ImplementationGapFlag** | formula | `If(And(Not(IsPresent), Not(Coalesce(DomainIsException, False())), Or(And(DomainArea = "root", Coalesce(SlotRequiredForRoot, False())), And(DomainArea <> "root", Coalesce(SlotRequiredForExample, False())))), 1, 0)` |
| **ProjectSlotWitnesses.UniversalGapFlag** | formula | `If(And(Not(IsPresent), Not(Coalesce(DomainIsException, False())), Coalesce(SlotRequiredForToy, False())), 1, 0)` |
| **ProjectSlotWitnesses.IsGap** | formula | `And(Not(IsPresent), IsRequiredHere)` |
| **ProjectSlotWitnesses.GapFlag** | formula | `If(And(Not(IsPresent), IsRequiredHere), 1, 0)` |
| **ProjectSlotWitnesses.RequiredHereFlag** | formula | `If(IsRequiredHere, 1, 0)` |
| **ProjectSlotWitnesses.RequiredPresentFlag** | formula | `If(And(IsPresent, IsRequiredHere), 1, 0)` |
| **ProjectSlotWitnesses.WitnessState** | formula | `If(IsGap, "gap", If(IsPresent, "filled", "optional-empty"))` |
| **ProjectSlotWitnesses.IsBlockingGap** | formula | `WitnessState = "gap"` |
| **CMCCSummary.DescriptionLength** | formula | `Len(Description)` |
| **CMCCSummary.IsSubstantive** | formula | `DescriptionLength >= 200` |
| **CMCCSummary.NarrativeState** | formula | `If(IsSubstantive, "ready", "stub")` |
| **CMCCSummary.IsReady** | formula | `NarrativeState = "ready"` |
| **CMCCSummary.SectionLabel** | formula | `If(IsReady, Concat(Name, " (ready)"), Concat(Name, " (stub)"))` |
| **ProjectGoal.DescriptionLength** | formula | `Len(Description)` |
| **ProjectGoal.IsSubstantive** | formula | `DescriptionLength >= 200` |
| **ProjectGoal.NarrativeState** | formula | `If(IsSubstantive, "ready", "stub")` |
| **ProjectGoal.IsReady** | formula | `NarrativeState = "ready"` |
| **ProjectGoal.SectionLabel** | formula | `If(IsReady, Concat(Name, " (ready)"), Concat(Name, " (stub)"))` |
| **ArchitecturalHighlight.DescriptionLength** | formula | `Len(Description)` |
| **ArchitecturalHighlight.IsSubstantive** | formula | `DescriptionLength >= 200` |
| **ArchitecturalHighlight.NarrativeState** | formula | `If(IsSubstantive, "ready", "stub")` |
| **ArchitecturalHighlight.IsReady** | formula | `NarrativeState = "ready"` |
| **ArchitecturalHighlight.SectionLabel** | formula | `If(IsReady, Concat(Name, " (ready)"), Concat(Name, " (stub)"))` |

---

_This document is rendered in **RuleSpeak®**, the declarative business-rule
notation created by **Ronald G. Ross**, and follows the conventions of
**SBVR** (Semantics of Business Vocabulary and Business Rules). With thanks to
Ronald G. Ross for RuleSpeak® and his foundational work on business rules —
[www.RonRoss.info](https://www.RonRoss.info)._
