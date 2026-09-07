# Admin Portal — Restructure Plan

> **Status:** shipped on branch `refactor-rulebook-as-hub` in four commits:
> 1. Rulebook trim — UserRoles 5→3, AppNavigation/Screens/Permissions/ClickTargets rewritten.
> 2. Three layouts + role picker + new App.jsx route tree.
> 3. Substrates absorbs AddTool; dead screens removed; demo admin user added.
> 4. Mobile pass (375px topbar + sidebar drawer + 44px tap targets).
>
> Verified live in headless Chrome:
> - `/` renders three role cards (Viewer / Developer / Admin)
> - `/viewer/:domain` shows read-only chrome with domain switcher in topbar
> - `/developer/:domain` shows the full domain workspace (Author / Build / Inspect groups)
> - `/admin` shows platform config + devops (no domain anywhere)
> - Switching to `user-admin` populates the admin sidebar fully
> - Combined Explorer reads `erb_acme_corporation` and lists 13 tables
>
> Known follow-ups: route guards (a developer hitting `/admin/...` directly still renders the admin layout, just with an empty role-gated sidebar), and a dedicated raw `effortless.json` editor section on Substrates.

## Mental model

- **Three roles**, each with its own route tree. Roles are a formal table in the project rulebook (`UserRoles`, trimmed to three rows).
- **Viewer** — read-only browser. Reviewing (comments) folded in.
- **Developer** — per-domain rulebook authoring, builds, tests, SQL/data explorer. Domain is part of the URL.
- **Admin** — platform config (users, roles, nav, screens) + devops (cross-domain build monitoring, proxy health). No domain segment ever.
- `/` is the role picker. After picking, the user lands in that role's tree and never sees the other roles' chrome.
- Each tree gets its own `<Layout>` (header + sidebar). Shared *components* (entity grid, SQL box, docs renderer) get reused; shared *chrome* does not.

## Before coding

- Invoke a UI/UX skill/agent for a per-role design spec (header, sidebar, mobile breakpoints). Confirm with user before implementing.

## Old URLs

Break them. The site is hours old.

---

## Routes

### `/` — Role picker
- Three cards from `UserRoles`: Viewer, Developer, Admin.
- Click → `/:role/`. Role persists in localStorage (fake login).

### Viewer tree — `/viewer/...`
| Route | Page |
|-------|------|
| `/viewer/` | Viewer dashboard: recent domains, links into docs |
| `/viewer/domains` | Browse all domains |
| `/viewer/:domain/` | Domain overview (read-only) |
| `/viewer/:domain/entities` | Read-only entity browser |
| `/viewer/:domain/formulas` | Read-only formula list |
| `/viewer/:domain/relationships` | FK graph |
| `/viewer/:domain/data` | Sample data grid |
| `/viewer/:domain/tests` | Test report (read-only) |
| `/viewer/:domain/comments` | Review comments (reviewer role folded in) |
| `/viewer/docs/*` | Docs (framing, methodology, field types, glossary) |

No domain switcher in header on `/viewer/` or `/viewer/docs/*`. Domain switcher appears only on `/viewer/:domain/*`.

### Developer tree — `/developer/...`
| Route | Page |
|-------|------|
| `/developer/` | Developer dashboard. Forces domain pick if none active. |
| `/developer/domains` | Domain picker |
| `/developer/:domain/` | Domain landing |
| `/developer/:domain/entities` | Entity editor |
| `/developer/:domain/formulas` | Formula list |
| `/developer/:domain/relationships` | FK graph |
| `/developer/:domain/data` | Sample data editor |
| `/developer/:domain/substrates` | `effortless.json` editor (installed + catalog from `AddToolCatalog`) |
| `/developer/:domain/builds` | Run / monitor `effortless build` |
| `/developer/:domain/tests` | Conformance matrix |
| `/developer/:domain/spokes` | Input spokes (Airtable, OWL) |
| `/developer/:domain/files` | Filesystem tree for `rulebook-examples/<domain>/` |
| `/developer/:domain/explorer` | **Combined SQL + data explorer.** Table list, row counts, query box. |
| `/developer/:domain/rulebook-json` | Raw JSON view |
| `/developer/:domain/reset` | Clear local edit state for this domain |
| `/developer/docs/*` | Docs (shared content, dev-flavored entry points) |

Domain switcher is **always** visible on `/developer/:domain/*`, since domain is required.

### Admin tree — `/admin/...`
| Route | Page |
|-------|------|
| `/admin/` | Admin dashboard: counts (users, roles, screens), recent platform activity |
| `/admin/users` | CRUD `AppUsers` |
| `/admin/roles` | CRUD `UserRoles` (tagline, color, description) |
| `/admin/permissions` | `AppPermissions` |
| `/admin/nav` | `AppNavigation` |
| `/admin/screens` | `AppScreens` |
| `/admin/builds` | Cross-domain build status (devops) |
| `/admin/proxy` | localhost:4242 health |
| `/admin/docs/*` | Docs (shared) |

No domain segment, ever. No domain switcher in header.

---

## Work items

### 1 — Trim `UserRoles` in the project rulebook
- Three rows: Viewer, Developer, Admin. Each: tagline, accent color, description.
- Edit `effortless-platform/effortless-rulebook/effortless-rulebook.json` directly (rulebook is HEAD). `git diff` first to confirm no unrelated edits, then `effortless build` from `./effortless-platform/`.

### 2 — Role picker at `/`
- Three cards from `UserRoles`. Click → `/:role/`. localStorage persistence.

### 3 — Three layouts
- `ViewerLayout`, `DeveloperLayout`, `AdminLayout`. Each owns its own `<TopBar>` and `<Sidebar>`.
- Sidebar items per layout — no cross-role nav.
- NavArea headers in sidebars: non-clickable `<div>` dividers.

### 4 — Developer's domain-aware header
- Layout: `ERB · Developer · **DOMAIN NAME (large)** · [switcher] · breadcrumb`.
- Switcher swaps only `:domain`, preserves the remainder of the path.
- Renders only on `/developer/:domain/*`. On `/developer/` and `/developer/domains`, no domain in header.

### 5 — Viewer's optional-domain header
- On `/viewer/` and `/viewer/docs/*`: `ERB · Viewer · [browse domains]`.
- On `/viewer/:domain/*`: domain prominent + switcher, same as Developer's.

### 6 — Admin's domain-free header
- `ERB · Admin`. No domain anything.

### 7 — Substrates page (Developer)
- Reads `rulebook-examples/<domain>/effortless.json`.
- Section A: installed transpilers (disable / remove).
- Section B: catalog from `AddToolCatalog` excluding installed; click → write to `effortless.json`.
- Delete `/developer/tools/add` + `AddToolScreen.jsx`.

### 8 — Combined Explorer (Developer)
- Merges the old data explorer with the SQL query box on one page.
- Left: table list with row counts. Right: query editor (free-form SQL against `erb_<domain>`).
- Pre-baked queries (top-N, recent rows) as quick actions.

### 9 — Framing dedup
- Single docs entry per role's `/docs/framing`. Delete any duplicates in dev/admin trees.

### 10 — Tag/flavor trim
- Drop `RulebookTags` with zero `FlavorTags` joins.
- Drop `FlavorTags` whose Flavor has no matching `RulebookDomains` row.

### 11 — Tech Tools split
- Old `/developer/tech/*` → `Files`, `Explorer` (combined), `Rulebook JSON`, `Reset`.
- `Proxy` moves to Admin (`/admin/proxy`) — it's platform infrastructure, not domain-specific.

### 12 — Mobile pass (per layout)
- 375px test. Each layout:
  - Sidebar → drawer behind hamburger; closes on nav.
  - TopBar collapses to: hamburger · (role-specific compact label) · avatar.
  - Domain switcher (where present) moves into drawer.
  - Tables wrap in `overflow-x: auto`; no horizontal page scroll.
  - Card grids → single column.
  - Modals → full-screen sheets.
  - Form inputs min height 44px.

---

## Files to touch

| File | Change |
|------|--------|
| `effortless-platform/effortless-rulebook/effortless-rulebook.json` | Trim `UserRoles` to 3; update `AppNavigation`/`AppScreens`; trim tags/flavors; update `ClickTargets` |
| `client/src/App.jsx` | Three sibling route trees (`/viewer/*`, `/developer/*`, `/admin/*`) + role picker at `/` |
| `client/src/layouts/ViewerLayout.jsx` | **New** |
| `client/src/layouts/DeveloperLayout.jsx` | **New** |
| `client/src/layouts/AdminLayout.jsx` | **New** |
| `client/src/screens/role-picker/RolePickerScreen.jsx` | **New** |
| `client/src/screens/viewer/` | Viewer dashboard + domain picker + read-only views |
| `client/src/screens/developer/SubstratesScreen.jsx` | Absorb AddTool catalog |
| `client/src/screens/developer/ExplorerScreen.jsx` | **New** (merged SQL + data explorer) |
| `client/src/screens/developer/AddToolScreen.jsx` | **Delete** |
| `client/src/screens/developer/TechScreens.jsx` | Split into Files / Rulebook JSON / Reset; Proxy moves to admin |
| `client/src/screens/admin/` | Admin dashboard, builds (cross-domain), proxy |
| `client/src/components/Sidebar.jsx` | Deleted or reduced to a shared primitive; each layout has its own |
| `client/src/components/TopBar.jsx` | Same — each layout has its own header; primitive only if shared |
| `client/src/hooks/usePortal.js` | Role state; active domain derived from URL params |
| `client/src/lib/nav.js` | Nav definitions grouped by role; no cross-role visibility |
| `client/src/index.css` / `App.css` | Mobile breakpoints (375 / 768), drawer styles, 44px tap targets |
| `effortless-platform/admin-portal/server.js` | `GET/PUT /api/domains/:domain/effortless`, `GET /api/domains/:domain/files`, `GET/POST /api/domains/:domain/db/*` (explorer) |

## Verify before reporting done
- Walk each role tree end-to-end at desktop width.
- Resize to 375px and re-walk.
- Confirm no role's chrome leaks into another role's pages.
- Confirm domain switcher appears *only* on routes with a `:domain` segment.
