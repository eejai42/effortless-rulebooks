<!-- GENERATED FILE — DO NOT EDIT. -->
<!-- Source: effortless-platform/effortless-rulebook/effortless-rulebook.json (table: `RulebookFlavors`) -->
<!-- Regenerate with: cd effortless-platform && effortless build -->

# Rulebook Flavors

Classification of each demo rulebook under rulebook-examples/. Lets the UI group projects by what they're TEACHING — a tutorial ladder is a different beast from a computation-heavy ontology. Density numbers come from a static analysis of each rulebook (calculated/aggregation/lookup counts).

| Project | Name | Flavor | Complexity | Entities | Calcs | Aggs | Lookups | Focus | Answer Key For |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| acme-corporation | ACME Corporation | crud-template | basic | 5 | 1 | 2 | 10 | Classic relational CRUD template — clients, projects, employees, roles. The 'starter sized' demo for new authors. | postgres,entity-framework |
| acme-llc | ACME, LLC | tutorial-ladder | minimal | 3 | 3 | 0 | 0 | Smallest viable rulebook with a calculated field — the 'Hello, formulas' tutorial. | — |
| customer-fullname | Customer FullName | tutorial-ladder | minimal | 1 | 2 | 0 | 0 | One entity, one calculated field (CONCAT(First, ' ', Last)). The 'absolute minimum' demo — proves the toolchain end-to-end with no relationships. | — |
| effortless-rulebooks | ERB Self-Describing Rulebook | meta-rulebook | advanced | 9 | 0 | 0 | 0 | The rulebook that describes the ERB project itself (sibling of this platform rulebook). Demonstrates eating-the-dog-food — meta over business data. | — |
| is-everything-a-language | Is Everything a Language? | graph-ontology | advanced | 3 | 8 | 0 | 0 | Heavy formulas evaluating linguistic / semiotic candidates. Shows that the substrate equality claim holds even for non-CRUD ontologies. | owl,python |
| talisman-advanced | Talisman: Advanced | computation-heavy | advanced | 10 | 8 | 1 | 2 | Workflow/approval ontology with intermediate computed fields. Demonstrates multi-step derivation across entities. | postgres |
| talisman-basic | Talisman: Basic | tutorial-ladder | basic | 9 | 7 | 1 | 0 | Same workflow concepts as advanced but without cross-entity lookups — useful for stepping authors up the formula ladder. | — |
| star-trek | Star Trek | aggregation-heavy | advanced | 10 | 9 | 5 | 12 | Aggregations over nested relationships (avg rating per episode, per season, per series). The canonical aggregation demo. | postgres,xlsx |
| community-event-planner | Community Event Planner | aggregation-heavy | basic | 6 | 19 | 4 | 9 | Auto-discovered demo. Replace this stub with a one-line description of what community-event-planner is designed to teach. | — |
| customer-crm | Customer CRM | aggregation-heavy | advanced | 7 | 20 | 11 | 21 | Auto-discovered demo. Replace this stub with a one-line description of what customer-crm is designed to teach. | — |
| effortless-banking | Effortless Banking | aggregation-heavy | advanced | 10 | 46 | 17 | 17 | Auto-discovered demo. Replace this stub with a one-line description of what effortless-banking is designed to teach. | — |
| fantasy-football | Fantasy Football | aggregation-heavy | basic | 6 | 13 | 5 | 15 | Auto-discovered demo. Replace this stub with a one-line description of what fantasy-football is designed to teach. | — |
| guessing-game | Guessing Game | aggregation-heavy | minimal | 2 | 5 | 4 | 6 | Auto-discovered demo. Replace this stub with a one-line description of what guessing-game is designed to teach. | — |
| gym-trainer-invoicing | Gym Trainer Invoicing | aggregation-heavy | basic | 5 | 14 | 8 | 11 | Auto-discovered demo. Replace this stub with a one-line description of what gym-trainer-invoicing is designed to teach. | — |
| intelligence-taxonomy | Taxonomy of Intelligence | crud-template | minimal | 3 | 5 | 2 | 4 | Auto-discovered demo. Replace this stub with a one-line description of what intelligence-taxonomy is designed to teach. | — |
| job-search-rag | Job Search RAG | aggregation-heavy | advanced | 10 | 4 | 6 | 10 | Auto-discovered demo. Replace this stub with a one-line description of what job-search-rag is designed to teach. | — |
| mechanical-kitchen-timer | Mechanical Kitchen Timer | aggregation-heavy | advanced | 26 | 33 | 42 | 22 | Auto-discovered demo. Replace this stub with a one-line description of what mechanical-kitchen-timer is designed to teach. | — |
| product-inventory | Product Inventory | computation-heavy | minimal | 3 | 6 | 1 | 3 | Auto-discovered demo. Replace this stub with a one-line description of what product-inventory is designed to teach. | — |
| therapist-helper-portal | Therapist Helper Portal | aggregation-heavy | basic | 5 | 12 | 11 | 10 | Auto-discovered demo. Replace this stub with a one-line description of what therapist-helper-portal is designed to teach. | — |
| nakedclaude-v2 | NakedClaude (v2) | crud-template | minimal | 3 | 5 | 0 | 3 | Auto-discovered demo. Replace this stub with a one-line description of what nakedclaude-v2 is designed to teach. | — |
| nakedclaude-v3 | NakedClaude (v3) | aggregation-heavy | advanced | 8 | 22 | 7 | 9 | Auto-discovered demo. Replace this stub with a one-line description of what nakedclaude-v3 is designed to teach. | — |
| wedding-seating-optimizer | Wedding Seating Optimizer | aggregation-heavy | basic | 4 | 16 | 9 | 7 | Auto-discovered demo. Replace this stub with a one-line description of what wedding-seating-optimizer is designed to teach. | — |
| expense-approval | Expense Approval | crud-template | minimal | 3 | 4 | 1 | 2 | Auto-discovered demo. Replace this stub with a one-line description of what expense-approval is designed to teach. | — |
| nakedclaude-v1 | NakedClaude (v1) | tutorial-ladder | minimal | 1 | 1 | 0 | 0 | Auto-discovered demo. Replace this stub with a one-line description of what nakedclaude-v1 is designed to teach. | — |
| nakedclaude-v4 | NakedClaude (v4) | aggregation-heavy | advanced | 15 | 30 | 13 | 43 | Auto-discovered demo. Replace this stub with a one-line description of what nakedclaude-v4 is designed to teach. | — |
| volunteer-shift-scheduler | Volunteer Shift Scheduler | aggregation-heavy | basic | 4 | 6 | 6 | 4 | Auto-discovered demo. Replace this stub with a one-line description of what volunteer-shift-scheduler is designed to teach. | — |
| planar-unit-discovery | planar-unit-discovery | aggregation-heavy | advanced | 36 | 110 | 33 | 49 | Auto-discovered demo. Replace this stub with a one-line description of what planar-unit-discovery is designed to teach. | — |
