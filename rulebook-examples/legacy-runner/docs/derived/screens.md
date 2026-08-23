<!-- GENERATED FILE — DO NOT EDIT. -->
<!-- Source: effortless-platform/effortless-rulebook/effortless-rulebook.json (table: `AppScreens`) -->
<!-- Regenerate with: cd effortless-platform && effortless build -->

# Admin Portal Screens

Every screen in the admin portal. Each screen names the entities it reads/writes, the role it requires, and the story it tells.

| ID | Path | Title | Min Role |
| --- | --- | --- | --- |
| screen-role-picker | / | Choose Role | — |
| screen-viewer-home | /viewer | Viewer Home | role-viewer |
| screen-viewer-domains | /viewer/domains | Browse Domains | role-viewer |
| screen-viewer-flavors | /viewer/flavors | Project Flavours | role-viewer |
| screen-viewer-features | /viewer/features | Platform Features | role-viewer |
| screen-viewer-domain | /viewer/:domain | Domain Overview | role-viewer |
| screen-viewer-entities | /viewer/:domain/entities | Entities | role-viewer |
| screen-viewer-formulas | /viewer/:domain/formulas | Formulas | role-viewer |
| screen-viewer-relations | /viewer/:domain/relationships | Relationships | role-viewer |
| screen-viewer-data | /viewer/:domain/data | Sample Data | role-viewer |
| screen-viewer-tests | /viewer/:domain/tests | Tests | role-viewer |
| screen-viewer-comments | /viewer/:domain/comments | Comments | role-viewer |
| screen-dev-home | /developer | Developer Home | role-developer |
| screen-dev-domains | /developer/domains | Pick Domain | role-developer |
| screen-dev-domain | /developer/:domain | Domain Landing | role-developer |
| screen-dev-formulas | /developer/:domain/formulas | Formulas | role-developer |
| screen-dev-relations | /developer/:domain/relationships | Relationships | role-developer |
| screen-dev-substrates | /developer/:domain/substrates | Effortless Tools | role-developer |
| screen-dev-tests | /developer/:domain/tests | Tests | role-developer |
| screen-dev-spokes | /developer/:domain/spokes | Input Spokes | role-developer |
| screen-dev-files | /developer/:domain/files | Files | role-developer |
| screen-dev-explorer | /developer/:domain/explorer | Explorer | role-developer |
| screen-dev-rulebook-json | /developer/:domain/rulebook-json | Rulebook JSON | role-developer |
| screen-dev-reset | /developer/:domain/reset | App & Data Tools | role-developer |
| screen-admin-home | /admin | Admin Home | role-admin |
| screen-admin-users | /admin/users | Users | role-admin |
| screen-admin-roles | /admin/roles | Roles | role-admin |
| screen-admin-perms | /admin/permissions | Permissions | role-admin |
| screen-admin-nav | /admin/nav | Navigation | role-admin |
| screen-admin-screens | /admin/screens | Screens | role-admin |
| screen-admin-builds | /admin/builds | Builds | role-admin |
| screen-admin-proxy | /admin/proxy | Proxy | role-admin |
| screen-docs-home | /docs | Docs Home | role-viewer |
| screen-docs-framing | /docs/framing | Framing | role-viewer |
| screen-docs-methodology | /docs/methodology | Methodology | role-viewer |
| screen-docs-field-types | /docs/field-types | Field Types | role-viewer |
| screen-docs-glossary | /docs/glossary | Glossary | role-viewer |

## Story

