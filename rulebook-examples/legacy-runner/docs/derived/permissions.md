<!-- GENERATED FILE — DO NOT EDIT. -->
<!-- Source: effortless-platform/effortless-rulebook/effortless-rulebook.json (table: `AppPermissions`) -->
<!-- Regenerate with: cd effortless-platform && effortless build -->

# Permissions

RLS-style policy table: declarative per-role allow/deny on portal API endpoints and on Postgres tables. Generated into Postgres on portal bootstrap as RLS policies.

## Role: Developer

_Edit the rulebook. Build. Confirm._

| Resource | Action | Allow | RLS Predicate |
| --- | --- | --- | --- |
| rulebook.entity | read | ✓ | true |
| rulebook.entity | create | ✓ | true |
| rulebook.entity | update | ✓ | true |
| rulebook.entity | delete | ✓ | true |
| rulebook.field | update | ✓ | true |
| rulebook.formula | update | ✓ | true |
| build | execute | ✓ | — |
| test | execute | ✓ | — |
| tech-tools.postgres | read | ✓ | true |
| tech-tools.postgres | execute | ✓ | true |
| tech-tools.proxy | read | ✓ | true |
| users | create | ✓ | true |
| users | update | ✓ | true |
| users | delete | ✓ | true |

## Role: Viewer

_See the whole project. Comment when you must._

| Resource | Action | Allow | RLS Predicate |
| --- | --- | --- | --- |
| rulebook.entity | read | ✓ | true |
| rulebook.entity | update | — | false |
| rulebook.field | read | ✓ | true |
| rulebook.formula | read | ✓ | true |
| build | execute | — | — |
| test | read | ✓ | true |
| test | execute | — | — |
| tech-tools.postgres | read | — | — |
| users | read | ✓ | true |
| users | update | — | false |

