<!-- GENERATED FILE — DO NOT EDIT. -->
<!-- Source: effortless-platform/effortless-rulebook/effortless-rulebook.json (table: `RulebookDomains`) -->
<!-- Regenerate with: cd effortless-platform && effortless build -->

# Rulebook Domains

Customer ontologies: each domain has its own rulebook + substrate generation. Domains form a TREE — ParentDomainId links a more-elaborate domain back to the simpler one it grew out of (e.g. Talisman ADVANCED ← Talisman BASIC). The UI uses this to present related rulebooks as a set rather than a flat list, and to drive 'next step in the progression' navigation.

## Customer FullName

_complexity: minimal · tables: 2_

Hello World: demonstrates basic schema and calculated field (CONCAT formula)

**Key features.** string concatenation

_Rulebook path:_ `toy-rulebooks/customer-fullname/effortless-rulebook/customer-fullname-rulebook.json`

## StarTrek

_complexity: moderate · tables: 11_

Media catalog: TV shows, seasons, episodes; demonstrates polymorphism

**Key features.** hierarchical rollups, polymorphic foreign keys

_Rulebook path:_ `toy-rulebooks/star-trek/effortless-rulebook/star-trek-rulebook.json`

## Is Everything a Language?

_complexity: philosophical · tables: 4_

Formal argument modeling: demonstrates schema expressivity for abstract domains

**Key features.** 8-predicate AND logic, meta-ontology

_Rulebook path:_ `rulebook-examples/is-everything-a-language/effortless-rulebook/is-everything-a-language-rulebook.json`

## ACME Corporation

_complexity: advanced · tables: 6_

Enterprise demo: ACME Corp operations

**Key features.** Hub promotion candidate; demonstrates rulebook-first workflow

_Rulebook path:_ `toy-rulebooks/acme-corporation/effortless-rulebook/acme-corporation-rulebook.json`

## ACME LLC

_complexity: advanced · tables: 4_

Enterprise demo: ACME LLC operations

**Key features.** Hub promotion candidate; demonstrates rulebook-first workflow

_Rulebook path:_ `toy-rulebooks/acme-llc/effortless-rulebook/acme-llc-rulebook.json`

## Guessing Game

_complexity: minimal · tables: 3_

Number-guessing game tracking guesses, hints, and best-score records per player.

**Key features.** relationships, calculated fields, lookups, aggregations, IF/AND/OR logic

_Rulebook path:_ `toy-rulebooks/guessing-game/effortless-rulebook/guessing-game-rulebook.json`

## NakedClaude v1

_complexity: minimal · tables: 2_

Rulebook generated from Airtable base 'v1: NakedClaude Demo'.

**Key features.** calculated fields, IF/AND/OR logic

_Rulebook path:_ `toy-rulebooks/nakedclaude-v1/effortless-rulebook/nakedclaude-v1-rulebook.json`

## NakedClaude v2

_complexity: moderate · tables: 4_

Rulebook generated from Airtable base 'v2: NakedClaude Demo'.

**Key features.** relationships, calculated fields, lookups, IF/AND/OR logic

_Rulebook path:_ `toy-rulebooks/nakedclaude-v2/effortless-rulebook/nakedclaude-v2-rulebook.json`

## NakedClaude v3

_complexity: moderate · tables: 9_

Rulebook generated from Airtable base 'v3: NakedClaude Demo'.

**Key features.** relationships, calculated fields, lookups, aggregations, IF/AND/OR logic

_Rulebook path:_ `toy-rulebooks/nakedclaude-v3/effortless-rulebook/nakedclaude-v3-rulebook.json`

## NakedClaude v4

_complexity: advanced · tables: 16_

Rulebook generated from Airtable base 'v4: NakedClaude Demo'.

**Key features.** relationships, calculated fields, lookups, aggregations, IF/AND/OR logic

_Rulebook path:_ `toy-rulebooks/nakedclaude-v4/effortless-rulebook/nakedclaude-v4-rulebook.json`

## Product Inventory

_complexity: moderate · tables: 4_

Products with transactions adjusting quantities and low-stock alerts.

**Key features.** relationships, calculated fields, lookups, aggregations, IF/AND/OR logic

_Rulebook path:_ `toy-rulebooks/product-inventory/effortless-rulebook/product-inventory-rulebook.json`

## Expense Approval

_complexity: moderate · tables: 4_

Employees submit line-item reports; totals, over-budget, and escalation flags cascade automatically.

**Key features.** relationships, calculated fields, lookups, aggregations, IF/AND/OR logic

_Rulebook path:_ `toy-rulebooks/expense-approval/effortless-rulebook/expense-approval-rulebook.json`

## Volunteer Shift Scheduler

_complexity: moderate · tables: 5_

Coverage status, volunteer load (under/ok/over), and event-level A–F staffing grade all fall out automatically.

**Key features.** relationships, calculated fields, lookups, aggregations, IF/AND/OR logic

_Rulebook path:_ `toy-rulebooks/volunteer-shift-scheduler/effortless-rulebook/volunteer-shift-scheduler-rulebook.json`

## Wedding Seating Optimizer

_complexity: moderate · tables: 5_

Seating plan as a DAG — per-table happiness, capacity flags, per-guest satisfaction recompute on every move.

**Key features.** relationships, calculated fields, lookups, aggregations, IF/AND/OR logic

_Rulebook path:_ `toy-rulebooks/wedding-seating-optimizer/effortless-rulebook/wedding-seating-optimizer-rulebook.json`

## Gym Trainer Invoicing

_complexity: moderate · tables: 6_

Sessions roll up into invoices; invoices roll up into client outstanding balances.

**Key features.** relationships, calculated fields, lookups, aggregations, IF/AND/OR logic

_Rulebook path:_ `toy-rulebooks/gym-trainer-invoicing/effortless-rulebook/gym-trainer-invoicing-rulebook.json`

## Therapist Helper Portal

_complexity: moderate · tables: 6_

Sessions and treatment progress: GoalUpdate → Goal.ProgressPct → Client.IsAtRisk three-hop DAG.

**Key features.** relationships, calculated fields, lookups, aggregations, IF/AND/OR logic

_Rulebook path:_ `toy-rulebooks/therapist-helper-portal/effortless-rulebook/therapist-helper-portal-rulebook.json`

## Community Event Planner

_complexity: moderate · tables: 7_

Venues, events, speakers, attendees with capacity, scheduling, and attendance-forecast cascades.

**Key features.** relationships, calculated fields, lookups, aggregations, IF/AND/OR logic

_Rulebook path:_ `toy-rulebooks/community-event-planner/effortless-rulebook/community-event-planner-rulebook.json`

## Customer CRM

_complexity: advanced · tables: 8_

Fighter-jet FCS sales pipeline rolling revenue up by order, FCS variant, and jet model.

**Key features.** relationships, calculated fields, lookups, aggregations, IF/AND/OR logic

_Rulebook path:_ `toy-rulebooks/customer-crm/effortless-rulebook/customer-crm-rulebook.json`

## Fantasy Football

_complexity: advanced · tables: 7_

Multi-hop DAG: raw player stats → roster aggregations → matchup scoring → standings & seeding.

**Key features.** relationships, calculated fields, lookups, aggregations, IF/AND/OR logic

_Rulebook path:_ `toy-rulebooks/fantasy-football/effortless-rulebook/fantasy-football-rulebook.json`

## Taxonomy of Intelligence

_complexity: philosophical · tables: 4_

Classifies intelligences (humans, animals, AI) by per-capability assessments through a multi-hop DAG.

**Key features.** relationships, calculated fields, lookups, aggregations, IF/AND/OR logic

_Rulebook path:_ `rulebook-examples/intelligence-taxonomy/effortless-rulebook/intelligence-taxonomy-rulebook.json`

## Job Search RAG

_complexity: advanced · tables: 11_

Local LLM + RAG pipeline filtering jobs across boards using semantic search.

**Key features.** relationships, calculated fields, lookups, aggregations, IF/AND/OR logic

_Rulebook path:_ `toy-rulebooks/job-search-rag/effortless-rulebook/job-search-rag-rulebook.json`

## Effortless Banking

_complexity: advanced · tables: 12_

Community-bank commercial RM platform — loans, deposits, covenants, BSA/AML.

**Key features.** relationships, calculated fields, lookups, aggregations, IF/AND/OR logic

_Rulebook path:_ `rulebook-examples/effortless-banking/effortless-rulebook/effortless-banking-rulebook.json`

## Mechanical Kitchen Timer

_complexity: advanced · tables: 27_

Five-part mechanical timer modeled with every README noun as a table — a hardware-ontology stress test.

**Key features.** relationships, calculated fields, lookups, aggregations, IF/AND/OR logic

_Rulebook path:_ `toy-rulebooks/mechanical-kitchen-timer/effortless-rulebook/mechanical-kitchen-timer-rulebook.json`

## Effortless Math

_complexity: advanced · tables: 16_

Executable theorem network — Fermat's Last Theorem as flagship consumer over seven imported provider theorems; a certificate/status ledger for a proof network, not a prover.

**Key features.** provider/consumer theorem contracts, non-boolean proof-status ledger, trust-boundary DAG, versioned certificates, bitemporal witness/provenance

_Rulebook path:_ `rulebook-examples/effortless-math/effortless-rulebook/effortless-math-rulebook.json`

## Causal Autoimmune Architecture

_complexity: advanced · tables: 39_

Systems-medicine ontology: causal chains in autoimmune architecture with OWL + Postgres substrates and a German rulespeak track.

_Rulebook path:_ `rulebook-examples/causal-autoimmune-architecture/effortless-rulebook/effortless-rulebook.json`

## Effortless Rulebooks

_complexity: intermediate · tables: 10_

Early self-describing demo of the repo itself; superseded by this platform meta-rulebook.

_Rulebook path:_ `rulebook-examples/effortless-rulebooks/effortless-rulebook/effortless-rulesbooks-rulebook.json`

## Naive Set Theory

_complexity: basic · tables: 7_

Bootstrap-stage set-theory ontology (vocabulary/glossary/narrative only).

_Rulebook path:_ `rulebook-examples/naive-set-theory/effortless-rulebook.json`

## Planar Unit Discovery

_complexity: advanced · tables: 37_

Geometric unit-discovery ontology skeleton with Leopold-loop notes.

_Rulebook path:_ `rulebook-examples/planar-unit-discovery/effortless-rulebook/planar-unit-discovery-rulebook.json`

## Procedural Knowledge Ontology

_complexity: flagship · tables: 85_

Largest rulebook in the repo: procedural knowledge with a 5-role console and an RLS access-control layer.

_Rulebook path:_ `rulebook-examples/procedural-knowledge-ontology/effortless-rulebook/procedural-knowledge-ontology-rulebook.json`

## Ross Style Business Rules

_complexity: basic · tables: 5_

Ross-style declarative business-rule patterns rendered via rulespeak.

_Rulebook path:_ `rulebook-examples/ross-style-business-rules/effortless-rulebook/ross-style-business-rules-rulebook.json`

## Simpsons Paradox

_complexity: advanced · tables: 40_

Simpson's-paradox statistics ontology with OWL conformance and PDF outputs.

_Rulebook path:_ `rulebook-examples/simpsons-paradox/effortless-rulebook/simpsons-paradox-rulebook.json`

## Talismans Special Solutions

_complexity: advanced · tables: 23_

Talisman-series ontology: CQ scoreboard, org-chart escalation, reasoner-vs-postgres triangle.

_Rulebook path:_ `rulebook-examples/talismans-special-solutions/effortless-rulebook/talismans-special-solutions-rulebook.json`

## Tiling The Plane

_complexity: intermediate · tables: 9_

Wallpaper-group tiling ontology with viewer app.

_Rulebook path:_ `rulebook-examples/tiling-the-plane/effortless-rulebook/tiling-the-plane-rulebook.json`

## Traffic Ticket Contest

_complexity: flagship · tables: 56_

Traffic-ticket contest domain: 56 tables, 4 state machines, 194 tests, portal app scaffolding.

_Rulebook path:_ `rulebook-examples/traffic-ticket-contest/effortless-rulebook/traffic-ticket-contest-rulebook.json`

## Veritasium Power Laws And Fractals

_complexity: basic · tables: 7_

Power-law/fractal physics model with golang+python substrates (pre-standard layout).

_Rulebook path:_ `rulebook-examples/veritasium-power-laws-and-fractals/ssot/ERB_veritasium-power-laws-and-fractals.json`

## Lazr Coulombs Law

_complexity: intermediate · tables: 11_

Coulomb's-law physics toy (currently a nested git repo, postgres only).

_Rulebook path:_ `toy-rulebooks/lazr-coulombs-law/effortless-rulebook/effortless-rulebook.json`

## Naked Claude Vs Effortless Claude

_complexity: n/a · tables: 0_

Experiment tree comparing LLM output with and without ERB grounding. Intentional exception: not an ontology, carries no rulebook.

## Turek Hitchens

_complexity: intermediate · tables: 11_

Turek/Hitchens debate-mapping ontology (bootstrap-stage).

_Rulebook path:_ `toy-rulebooks/turek-hitchens/effortless-rulebook/effortless-rulebook.json`

## Volunteer Shift Scheduler Demo

_complexity: n/a · tables: 0_

Demo-app scaffold consuming volunteer-shift-scheduler's rulebook. Intentional exception: carries no rulebook of its own.

