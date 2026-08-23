<!-- GENERATED FILE — DO NOT EDIT. -->
<!-- Source: effortless-platform/effortless-rulebook/effortless-rulebook.json (table: `AppNavigation`) -->
<!-- Regenerate with: cd effortless-platform && effortless build -->

# Admin Portal Navigation

Primary navigation tree for the admin portal. Drives the left sidebar. Each node has a role gate and a target screen. This is the developer's narrative through a rulebook project.

- **Home** → `screen-viewer-home` _(min role: role-viewer)_
- **Home** → `screen-dev-home` _(min role: role-developer)_
- **Home** → `screen-admin-home` _(min role: role-admin)_
- **Docs** _(min role: role-viewer)_
  - **Framing** → `screen-docs-framing` _(min role: role-viewer)_
  - **Methodology** → `screen-docs-methodology` _(min role: role-viewer)_
  - **Field Types** → `screen-docs-field-types` _(min role: role-viewer)_
  - **Glossary** → `screen-docs-glossary` _(min role: role-viewer)_
- **Browse Domains** → `screen-viewer-domains` _(min role: role-viewer)_
- **Pick Domain** → `screen-dev-domains` _(min role: role-developer)_
- **Platform** _(min role: role-admin)_
  - **Users** → `screen-admin-users` _(min role: role-admin)_
  - **Roles** → `screen-admin-roles` _(min role: role-admin)_
  - **Permissions** → `screen-admin-perms` _(min role: role-admin)_
  - **Navigation** → `screen-admin-nav` _(min role: role-admin)_
  - **Screens** → `screen-admin-screens` _(min role: role-admin)_
- **Flavours** → `screen-viewer-flavors` _(min role: role-viewer)_
- **Current Domain** _(min role: role-developer)_
  - **Overview** → `screen-dev-domain` _(min role: role-developer)_
  - **Explorer** → `screen-dev-explorer` _(min role: role-developer)_
  - **Formulas** → `screen-dev-formulas` _(min role: role-developer)_
  - **Relationships** → `screen-dev-relations` _(min role: role-developer)_
  - **Effortless Tools** → `screen-dev-substrates` _(min role: role-developer)_
  - **Tests** → `screen-dev-tests` _(min role: role-developer)_
  - **Input Spokes** → `screen-dev-spokes` _(min role: role-developer)_
  - **Files** → `screen-dev-files` _(min role: role-developer)_
  - **Rulebook JSON** → `screen-dev-rulebook-json` _(min role: role-developer)_
  - **App & Data Tools** → `screen-dev-reset` _(min role: role-developer)_
- **Platform Features** → `screen-viewer-features` _(min role: role-viewer)_
- **Current Domain** _(min role: role-viewer)_
  - **Overview** → `screen-viewer-domain` _(min role: role-viewer)_
  - **Entities** → `screen-viewer-entities` _(min role: role-viewer)_
  - **Formulas** → `screen-viewer-formulas` _(min role: role-viewer)_
  - **Relationships** → `screen-viewer-relations` _(min role: role-viewer)_
  - **Sample Data** → `screen-viewer-data` _(min role: role-viewer)_
  - **Tests** → `screen-viewer-tests` _(min role: role-viewer)_
  - **Comments** → `screen-viewer-comments` _(min role: role-viewer)_
- **DevOps** _(min role: role-admin)_
  - **Builds** → `screen-admin-builds` _(min role: role-admin)_
  - **Proxy** → `screen-admin-proxy` _(min role: role-admin)_

