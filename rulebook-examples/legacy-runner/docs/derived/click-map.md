<!-- GENERATED FILE — DO NOT EDIT. -->
<!-- Source: effortless-platform/effortless-rulebook/effortless-rulebook.json (table: `ClickTargets`) -->
<!-- Regenerate with: cd effortless-platform && effortless build -->

# Click Targets

Canonical in-app navigation affordances. Every clickable element in the portal should be listed here with where the click goes. Two agents implementing different screens would both consult this table to wire up cross-screen jumps. NOT the Explain-DAG — this is page-to-page navigation: 'Orders: 5' is clickable and goes to a page filtered to those 5 orders. NOT documentation-style 'learn more' links.

| ID | From Kind | From Context | To Path | Filter | Story |
| --- | --- | --- | --- | --- | --- |
| click-001 | count-number | home-card:entities | /developer/:domain/entities | — | Click 'Entities: N' on Home → /rulebook/entities (the list of all N). |
| click-002 | count-number | home-card:substrates | /developer/:domain/substrates | — | Click 'Substrates: N' on Home → /substrates. |
| click-003 | count-number | home-card:spokes | /developer/:domain/spokes | — | Click 'Input spokes: N' on Home → /spokes. |
| click-004 | count-number | home-card:tests-passing | /developer/:domain/tests | status=passing | Click 'Tests passing: X/Y' on Home → /tests with passing filter. |
| click-005 | count-number | home-card:tests-failing | /developer/:domain/tests | status=failing | Click the failing-count chip on Home → /tests filtered to failing rows. |
| click-006 | entity-row | entities-list | /developer/:domain/entities/:entity | — | Click an entity in the left list → the entity's own page (it already happens via setSelected — should also become a URL). |
| click-007 | field-row | entity-detail:schema-table | /developer/:domain/entities/:entity | field=:field | Click a field row in the schema grid → the same entity page but with that field expanded / scrolled to. |
| click-008 | fk-value | entity-detail:sample-data | /rulebook/entities/:targetEntity | row=:fkValue | Click an FK lookup value in sample data (e.g. CustomerId='cust-007') → /rulebook/entities/Customers?row=cust-007. The OTHER side of the relationship. |
| click-009 | formula-cell | entity-detail:schema-table | /developer/:domain/formulas | entity=:entity&field=:field | Click a formula expression in the schema grid → /rulebook/formulas filtered to that formula. |
| click-010 | formula-cell | formulas-list | /developer/:domain/entities/:entity | field=:field | Click a formula row in the formulas list → the entity page with that field highlighted. |
| click-011 | substrate-row | substrates-list | /substrates/:substrateId | — | Click a substrate in the list → its detail page (we use ?selected today; should become a route). |
| click-012 | substrate-row | tests-matrix:column-header | /substrates/:substrateId | — | Click a substrate column header on the Tests matrix → that substrate's page. |
| click-013 | test-cell | tests-matrix | /tests/:testId | substrate=:substrateId | Click a cell in the conformance matrix → the test detail showing input/expected/actual for that substrate. |
| click-014 | role-pill | users-list | /admin/roles | role=:roleId | Click a role pill anywhere → /users/roles focused on that role. |
| click-015 | role-pill | topbar:current-user | /admin/roles | role=:roleId | Click your own role pill in the top bar → see what that role gets / who else has it. |
| click-016 | user-row | roles-detail | /admin/users | user=:userId | Click a user listed under a role → /users with that user selected. |
| click-017 | nav-card | framing-list | /docs/framing | invariant=:invariantId | Click a FramingInvariant card → its detail (WrongFraming vs CorrectFraming side-by-side). |
| click-018 | axiom-link | framing-detail | /docs/framing | axiom=:axiomId&tab=axioms | Click the violated-axiom pill on a FramingInvariant detail → the Axioms tab focused on that axiom. |
| click-019 | flavor-tag | topbar:project-switcher | /viewer/flavors | flavor=:flavor | Click the flavour tag next to a project name → /projects/flavors filtered to that flavour. |
| click-020 | flavor-tag | flavors-grid:card | /viewer/flavors | flavor=:flavor | Click a flavour card on the Flavours screen → drill in to that flavour's projects. |
| click-021 | framing-invariant | test-detail:explain | /docs/framing | invariant=:invariantId | From a failing test's detail, click the 'most-likely framing-invariant' suggestion → that invariant's page. |
| click-022 | spoke-row | spokes-list | /spokes/:spokeId | — | Click a spoke card → its detail (recent pulls / last error). |
| click-023 | tool-row | add-tool:catalog | /substrates/:substrateId | — | Click an already-installed tool in the Add Tool catalog → that substrate's detail page. |
| click-024 | process-row | tech-proxy:routes-list | /substrates/:substrateId | viaProxy=:proxyRoute | Click a proxy route on Tech → ssotme-proxy → the substrate that route corresponds to. |
| click-025 | field-type-tag | schema-grid | /docs/framing | tab=field-types&type=:typeName | Click a field's type tag ('calculated', 'aggregation', etc.) → FieldTypeTaxonomy explanation for that type. |
