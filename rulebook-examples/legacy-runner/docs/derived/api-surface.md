<!-- GENERATED FILE — DO NOT EDIT. -->
<!-- Source: effortless-platform/effortless-rulebook/effortless-rulebook.json (table: `AppAPIs`) -->
<!-- Regenerate with: cd effortless-platform && effortless build -->

# Admin Portal API Surface

Admin portal HTTP API surface. Express routes mounted by the portal backend.

| Method | Path | Resource | Action | Writes Through | Description |
| --- | --- | --- | --- | --- | --- |
| GET | /api/me | users | read | — | Current user + role + permissions |
| GET | /api/projects | rulebook.entity | read | — | List rulebook projects (rulebook-examples/* + this top-level rulebook) |
| GET | /api/projects/:id | rulebook.entity | read | — | Project summary: rulebook stats, substrates, last build |
| POST | /api/projects/:id/activate | rulebook.entity | execute | — | Set active-domain pointer; rehydrate editor Postgres |
| GET | /api/rulebook | rulebook.entity | read | — | Whole active rulebook (entities + meta) |
| GET | /api/rulebook/entities | rulebook.entity | read | — | List entities in active rulebook |
| GET | /api/rulebook/entities/:name | rulebook.entity | read | — | One entity with full schema + sample data |
| PATCH | /api/rulebook/entities/:name | rulebook.entity | update | ✓ | Update entity description / schema / sample row. Write-through: Postgres + JSON in same txn. |
| POST | /api/rulebook/entities | rulebook.entity | create | ✓ | Add a new entity. Write-through. |
| DELETE | /api/rulebook/entities/:name | rulebook.entity | delete | ✓ | Remove entity. Write-through. |
| PATCH | /api/rulebook/entities/:name/fields/:fieldName | rulebook.field | update | ✓ | Update field (datatype, formula, nullable, description). Write-through. |
| GET | /api/substrates | rulebook.entity | read | — | List substrates for active project + generated file index |
| POST | /api/substrates/:name/build | build | execute | — | Trigger rebuild for one substrate via ssotme-proxy |
| POST | /api/build/all | build | execute | — | Rebuild every substrate in active project |
| GET | /api/tests | test | read | — | Conformance matrix + last run |
| POST | /api/tests/run | test | execute | — | Run all substrate tests, return matrix |
| GET | /api/spokes | rulebook.entity | read | — | List input spokes for active project |
| POST | /api/spokes/:id/pull | build | execute | — | Pull from a spoke (e.g. Airtable). Writes into rulebook JSON via flow-003. |
| GET | /api/users | users | read | — | AppUsers from active rulebook |
| POST | /api/users | users | create | ✓ | Add user. Write-through into rulebook AppUsers. |
| PATCH | /api/users/:id | users | update | ✓ | Update user role/email/displayName. Write-through. |
| DELETE | /api/users/:id | users | delete | ✓ | Remove user. Write-through. |
| GET | /api/tech/postgres/tables | tech-tools.postgres | read | — | List editor-DB tables |
| POST | /api/tech/postgres/query | tech-tools.postgres | execute | — | Run arbitrary SQL (developer-only) |
| GET | /api/tech/proxy/status | tech-tools.proxy | read | — | Mirror of localhost:4242/ping + recent call log |
| POST | /api/tech/reset | tech-tools.postgres | execute | — | Drop editor DB; rerun flow-005 to rebuild from rulebook JSON |
| GET | /api/tech/rulebook-json | rulebook.entity | read | — | Raw current effortless-rulebook.json |
| PUT | /api/tech/rulebook-json | rulebook.entity | update | ✓ | Write raw JSON. Re-validates, rehydrates Postgres editor. |
| GET | /api/tools/catalog | rulebook.entity | read | — | Available transpilers to add to active project. Sources: localhost:4242/ping (local) + Effortless registry. Drives the Add Tool screen. |
| GET | /api/tools/installed | rulebook.entity | read | — | Currently installed transpilers from active project's effortless.json (ProjectTranspilers array). |
| POST | /api/tools/install | build | execute | — | Add a tool to the active project: shells out to `effortless -install <proxy-url> -i <rulebook>`. Same CLI path the orchestrator uses — guarantees portal/CLI parity. |
| POST | /api/tools/:name/disable | build | execute | — | Toggle IsDisabled on a ProjectTranspilers entry. |
| DELETE | /api/tools/:name | build | execute | — | Remove a tool from active project's effortless.json. |
| GET | /api/features | rulebook.entity | read | — | List all PlatformFeatures from the platform rulebook, grouped by Tier (headline \| additional) and sorted by Priority. Each row includes the computed IsReadmeStub flag. |
| GET | /api/features/:id | rulebook.entity | read | — | One feature with full detail: summary, README file path, README on-disk content (resolved at request time), related axiom row (joined), and IsReadmeStub. |
| PATCH | /api/features/:id | rulebook.entity | update | ✓ | Update a PlatformFeatures row (Name, OneLineSummary, Tier, Priority, ReadmeFilePath, ReadmeStubContent, Status, RelatedAxiomId). Write-through into rulebook JSON. Does NOT write the on-disk README file — that's hand-maintained but must conform to this row. |
