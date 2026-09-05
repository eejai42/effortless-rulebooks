# Client & Invoice Tracker

A small full-stack app for running a client-work billing business end to end:
clients, categories, statuses, products, inventory, invoices, line items,
payments, approvals, and the users who sign off on them. It is the demo
vehicle for the **Effortless Rulebook (ERB)** pipeline — the schema, formulas,
and seed data live in Airtable, get compiled into PostgreSQL, and the app is
a thin Node+React layer over the generated views.

Current release: **v6** (see [v6_SPECIFICATION.md](v6_SPECIFICATION.md)).

---

## 1. Narrative summary of the platform

### What it is

A single-tenant internal tool for the back office of a small B2B-ish
business. Someone maintains a roster of **clients**, sells them
**products**, issues **invoices**, collects **payments**, reconciles
**inventory**, and routes new clients through an **approval** workflow
handled by a small team of **app users** (Admin / Manager / Customer).

### Who it serves

Two roles are modeled implicitly (there is no auth yet — see §4.7):

- An **operator** who creates clients, writes invoices, records payments,
  and adjusts stock levels.
- An **approver** (an AppUser with a role) who signs off on new clients
  before they become billable.

### Why it exists

The interesting part of this repo isn't the app — it's how the app gets
*built*. The Airtable base `appeUOAaOIdoqPSx3` is the single source of
truth for every table, field, formula, lookup, rollup, and seed row. A two-
stage pipeline transpiles that base into normalized JSON and then into
PostgreSQL DDL, SQL functions, and views. The app only ever talks to the
generated `vw_*` views — so anything the business expresses in Airtable
(a new formula, a new rollup, a relabel) propagates into the UI without
anyone writing a migration.

### The build loop ("Effortless loop")

```
edit Airtable  →  effortless build (rulebook)  →  effortless build (postgres)
                                                        │
                                                        ▼
                                                  init-db.sh
                                                        │
                                                        ▼
                                         new columns appear in vw_*
                                                        │
                                                        ▼
                                    app code consumes new columns
```

Everything under `effortless-rulebook/` and `postgres/*.sql` is generated.
`start.sh` runs the whole loop from a clean clone and brings the app up.

### Version history at a glance

| Version | Theme                                    | Notable shift                                       |
|---------|------------------------------------------|-----------------------------------------------------|
| v1      | Scaffold                                 | First Airtable → Postgres → app walk-through         |
| v2      | Statuses as first-class entity           | `is_stopped` became a derived rollup, not a flag     |
| v3      | Full operations model                    | Products, invoices (then called Orders), payments    |
| v4      | Rename pass                              | Customers→Clients, Orders→Invoices; behavior frozen  |
| v5      | (implicit) Categories + inventory + calc fields | ClientCategories, InventoryAdjustments, Profit/Margin/IsVIP/IsBigOrder — shipped without a spec |
| **v6**  | **Alignment release**                    | App catches up to the rulebook: AppUsers, ClientApprovals, and every v5 calc field get first-class UI |

See the `vN_SPECIFICATION.md` files for each release's intent.

### Design philosophy

- **Calculated fields live in the DB, not the app.** `IsVIP`, `IsBigOrder`,
  `Margin`, `COGS`, `LastInvoice`, `IsPaidInFull` — all computed as SQL
  functions and exposed as view columns. The frontend reads them; it does
  not recompute them.
- **The UI speaks business vocabulary, not table vocabulary.** Column
  headers are "Invoice #", "Last Invoice", "Big Orders" — not
  `invoice_number`, `last_invoice_timestamp`, `count_of_big_invoices`. The
  rename from v4 exists for exactly this reason.
- **Append-only where audit matters.** Inventory levels aren't stored;
  they're summed from `InventoryAdjustments`. You can't erase history —
  you can only post a correcting adjustment.
- **Delete policies are DB-enforced.** The API surfaces 409 errors; the
  actual refuse-to-delete logic lives in generated SQL.

---

## 2. Mock data and scenarios

`postgres/05-insert-data.sql` is generated from Airtable rows. It's small
on purpose — enough to exercise every feature, few enough to reason about
by hand.

### 2.1 Cardinality at a glance

| Entity               | Count | Notes                                          |
|----------------------|-------|------------------------------------------------|
| Clients              | 5     | 2 stopped, 3 active                            |
| ClientCategories     | 3     | Active (5% off), Gold (15% off), Prospect (0%) |
| Statuses             | 7     | 3 blocking, 4 non-blocking                     |
| AppUsers             | 3     | one each of Admin / Manager / Customer         |
| ClientApprovals      | 3     | 2 approved, 1 pending                          |
| Products             | 8     | 7 active, 1 discontinued; 2 active high-margin |
| Invoices             | 7     | mix of paid/partial/unpaid/returned; 3 big     |
| InvoiceLineItems     | ~15   | multiple lines per invoice, mixed discounts    |
| Payments             | 10    | Completed / Failed / Pending / Refunded        |
| InventoryAdjustments | 9     | opening balances + corrections + damages       |

### 2.2 Client roster

| Client         | Company               | Category | Status    | Stopped | Exercises…                                     |
|----------------|-----------------------|----------|-----------|---------|------------------------------------------------|
| Alice Johnson  | Northwind Traders     | Active   | Pending   | yes     | Blocking status → client is stopped            |
| Bob            | Launchpad LLC         | Active   | On-Hold   | yes     | Second stopped persona; category discount      |
| Brian Lee      | Contoso Manufacturing | Prospect | New       | no      | No discount (prospect), pending approval queue |
| Carla Smith    | Bluewave Logistics    | Active   | Delayed   | no      | Non-blocking status stays active               |
| Caroline       | Solo Studio           | Gold     | Delayed   | no      | 15% Gold-tier discount; highest-value persona  |

### 2.3 Product catalog

Eight SKUs spanning a cheap commodity (`CABLE-USB-C`, $12, 72% margin) up
to premium gear (`GADGET-200`, $89). Notable rows:

- **CABLE-USB-C, CASE-LEATHER, HUB-7PORT** — margin > 65% → `IsHighMargin = true`
- **CASE-LEATHER** — `is_active = false`, so it's flagged high-margin but excluded from dashboard counts
- **CASE-LEATHER** — stock is 0 (discontinued); other SKUs stocked between 75 and 1241 units
- **STAND-ALU** — 58% margin, just below the high-margin threshold (serves as a boundary case)

### 2.4 Invoice scenarios

The 7 invoices cover, at minimum, one of each of:

- **Paid in full** — `is_paid_in_full = true`, `amount_due = 0`
- **Partial** — e.g. Alice's invoice #1010 with $4,795.05 paid on $5,595.05 total
- **Unpaid / New** — invoice exists, no completed payment
- **Returned** — status = `Returned`, triggers different UI tag
- **Big order** — `sub_total > 350` → `is_big_order = true` (3 of the 7 qualify)
- **Tax math** — every invoice uses a non-zero tax rate; the view computes `tax_amount`, `invoice_total`, `amount_due`

### 2.5 Payment scenarios

All five `payment_status` values are represented:

- `Completed` — counts toward `total_paid`
- `Failed` — present on the ledger but contributes $0
- `Pending` — same, awaits confirmation
- `Refunded` — reduces `completed_amount` for the invoice
- `Cancelled` — informational only

This is the key thing to look at in the view layer: `total_paid` is a sum
of only `Completed` payments, not all payments. The UI badges this
distinction (`PayBadge` Paid / Partial / Unpaid).

### 2.6 Inventory adjustment scenarios

The 9 adjustments demonstrate the append-only model:

- **Opening balances** — auto-posted on product creation (`reason =
  "Opening balance"`)
- **Restocks** — positive quantities after supplier delivery
- **Damages / Shrinkage** — negative quantities (`AdjustmentType = Damage`
  or `Shrinkage`)
- **Corrections** — small +/- adjustments for cycle counts

`vw_products.stock_quantity` is `SUM(quantity)` over these rows. Delete an
adjustment and the stock level recomputes — no separate `stock` column to
get out of sync.

### 2.7 Approval scenarios

The 3 approvals exercise every state of the `is_approved` flip:

- `alice-johnson-apvd` — approved by EJ Alexandra (Admin) → `APPROVED`
- `brian-lee-apvd`     — approved by EJ Alexandra → `APPROVED`
- `brian-lee-pend`     — unassigned, `approved_by = null` → `PENDING`

Brian Lee has two approvals (one of each state), which is useful for the
client-detail page's "N pending" badge.

### 2.8 Status distribution

| Sort | Status      | Blocking? | Seeded clients |
|------|-------------|-----------|----------------|
| 1    | New         | no        | Brian Lee      |
| 2    | Processing  | no        | —              |
| 3    | In-Review   | **yes**   | —              |
| 4    | Pending     | **yes**   | Alice Johnson  |
| 5    | On-Hold     | **yes**   | Bob            |
| 6    | Delayed     | no        | Carla, Caroline |
| 7    | Cancelled   | no        | —              |

Two clients sit on blocking statuses → `total_stopped_clients = 2` on the
dashboard.

### 2.9 What the seed doesn't cover

Being explicit about gaps so future test additions are obvious:

- No VIP client in the seed — `IsVIP` requires both `AverageOrderValue >
  500` AND `HastRecentInvoices = true`; the rollup chain currently
  evaluates the two VIP-eligible clients to NULL rather than true, so
  `vip_clients = 0` on the dashboard. The UI path still renders the badge
  if the calc ever turns on.
- No client with zero invoices (every client has at least one).
- No invoice with zero line items (every invoice has totals).
- No multi-user approval chain (each approval is single-assignee).
- No seeded role other than the 3 AppUsers shown.

---

## 3. Navigation and architecture of the app

### 3.1 Top-level navigation

```
Clients · Categories · Statuses · Products · Inventory · Invoices · Payments · Approvals · Users
```

The order reflects information density: **Clients** is the landing page
because it's where most daily work starts; **Approvals** and **Users**
live at the end because they're workflow support.

### 3.2 Route map

| Path                     | Component                      | Purpose                                              | Primary view                  |
|--------------------------|--------------------------------|------------------------------------------------------|-------------------------------|
| `/`                      | `ClientListPage` + `Summary`   | Dashboard + client roster                            | `vw_clients`                  |
| `/clients/:id`           | `ClientDetailPage`             | One client + invoices + approvals                    | `vw_clients`                  |
| `/client-categories`     | `ClientCategoryListPage`       | Category CRUD with discount tiers                    | `vw_client_categories`        |
| `/statuses`              | `StatusListPage`               | Status CRUD with client counts                       | `vw_statuses`                 |
| `/statuses/:id`          | `StatusDetailPage`             | One status + its clients                             | `vw_statuses` + `vw_clients`  |
| `/products`              | `ProductListPage`              | Catalog with margin column                           | `vw_products`                 |
| `/products/:id`          | `ProductDetailPage`            | Product + line-item history + adjustment log         | `vw_products`                 |
| `/inventory`             | `InventoryPage`                | All inventory adjustments, filter by product         | `vw_inventory_adjustments`    |
| `/invoices`              | `InvoiceListPage`              | Invoice roster with paid / due / big-order flags     | `vw_invoices`                 |
| `/invoices/:id`          | `InvoiceDetailPage`            | One invoice + lines + payments, all inline editable  | `vw_invoices` + children      |
| `/payments`              | `PaymentsListPage`             | Flat payment ledger across all invoices              | `vw_payments`                 |
| `/approvals`             | `ApprovalsPage`                | Approval queue with All/Pending/Approved tabs        | `vw_client_approvals`         |
| `/app-users`             | `AppUsersPage`                 | AppUsers CRUD with approval counts                   | `vw_app_users`                |

### 3.3 List → Detail pattern

Every core entity uses the same pattern:

1. List page with a prominent **+ Add** button and a table of rows
2. Each row links to a Detail page via the primary key
3. Detail page shows the record in a "view" state with **Edit** / **Delete**
4. Inline form replaces the view when Edit is clicked
5. Delete opens a confirm modal; if the DB refuses (409), the modal shows
   the server's reason instead of succeeding

The pattern is most visible in `ClientDetailPage` and `InvoiceDetailPage`.

### 3.4 Drill-down chains

```
Client ──┬──► Invoice ──┬──► Line item ──► Product ──► Adjustment log
         │              └──► Payment
         └──► Approval ──► AppUser
```

Every link points at a real route — you can ride this chain from the
Clients dashboard to the adjustment log of the product on a specific line
item of an invoice the client owes you money for. That's the whole
information architecture in one sentence.

### 3.5 Summary dashboard rows

The Summary component on `/` has three rows of stat cards, each trying to
answer a specific question:

1. **Row 1 — "How big is the business?"**
   Total Clients · Stopped Clients · Total Invoices · Active / Total Products
2. **Row 2 — "Is money flowing?"**
   Total Revenue · Outstanding · Total Payments
3. **Row 3 — "Where is attention needed?"** *(new in v6)*
   VIP Clients · Big Orders · High-Margin Products · Pending Approvals

Below the cards, three distribution cards break down Client Statuses,
Invoice Statuses, and Payment Statuses — useful when the stat cards
prompt a follow-up question.

### 3.6 Inline-form-modal UI pattern

Three interaction patterns across the app:

- **Inline replace** — the view region swaps to a form in place (detail
  pages' Edit button, line-item editing, payment editing)
- **Modal** — used for destructive actions (delete confirm) and for
  structurally-separate actions (add approval from a client detail page)
- **Table-row expansion** — used for inline edit on line items and
  payments, so the surrounding context stays visible

Delete conflicts (e.g., "can't delete client — 2 invoices reference it")
surface their message inside the same modal, replacing the confirmation
copy.

### 3.7 Frontend shape

- [frontend/src/App.jsx](frontend/src/App.jsx) — one `<Routes>`, no layouts
- [frontend/src/components/Nav.jsx](frontend/src/components/Nav.jsx) — one bar, one `NavLink` per route
- [frontend/src/components/api.js](frontend/src/components/api.js) — **the only place that talks HTTP**; every page imports from here
- Page components own all of their own state — no Redux, no context, no
  TanStack Query; just `useState` + `useEffect`
- Styling is inline per-element (no CSS framework). It is deliberately
  unambitious — the point of this repo isn't the UI

### 3.8 Backend shape

- [backend/server.js](backend/server.js) — single file, one Express app
- `pg.Pool` connection against `DATABASE_URL`
- **Reads** hit `vw_*` views directly; pages that need multiple related
  rows (e.g. client → invoices + approvals) fire parallel queries and
  merge server-side
- **Writes** go to base tables (`clients`, `invoices`, ...) inside
  transactions where cascading integrity matters (e.g. client status
  change needs to sync `statuses.clients`; invoice delete cascades to
  payments + line items)
- `slugify()` generates human-readable primary keys (e.g.
  `alice-johnson-1010`, `ej-ssot-me-admin`) so URLs are readable

### 3.9 Data flow

```
Airtable ──► effortless-rulebook.json ──► postgres/*.sql ──► init-db.sh
    │                                                             │
    │                                                             ▼
    │                                                      PostgreSQL
    │                                                        │
    ▼                                                        ▼
[user of the app]  ◄──────  React + Vite (frontend/)  ◄──  Express (backend/)
```

### 3.10 Error conventions

| Status | Meaning                                    | UI behavior                              |
|--------|--------------------------------------------|------------------------------------------|
| 400    | Missing/invalid body fields                | Inline form-level error                  |
| 404    | Not found                                  | Page shows "Not found" state             |
| 409    | Conflict — delete refused by FK / policy   | Confirm modal shows server message       |
| 500    | Internal (logged on server)                | Generic alert / error banner             |

---

## 4. Other technical specification details

### 4.1 The Effortless build pipeline

Two transpilers wired up in [effortless.json](effortless.json):

| Transpiler             | Input                                | Output                                        |
|------------------------|--------------------------------------|-----------------------------------------------|
| `airtable-to-rulebook` | Airtable base `appeUOAaOIdoqPSx3`    | [effortless-rulebook/effortless-rulebook.json](effortless-rulebook/) |
| `rulebook-to-postgres` | `effortless-rulebook.json`           | [postgres/](postgres/) SQL files              |

Generated artifacts:

- `00-bootstrap.sql` — extensions, roles, search_path
- `01-drop-and-create-tables.sql` — base tables + constraints
- `02-create-functions.sql` — one SQL function per calculated / aggregation
  / lookup field
- `03-create-views.sql` — one `vw_*` view per table, layering in calc
  fields
- `04-create-policies.sql` — RLS policies (currently permissive — see §4.7)
- `05-insert-data.sql` — seed rows exported from Airtable
- `function-overrides/*.sql` — hand-written overrides (see §4.4)
- `XXb-customize-*.sql` — hand-written customizations (see §4.5)
- `init-db.sh` — the executor that runs the whole stack in order

### 4.2 Database naming conventions

| Airtable            | Postgres               |
|---------------------|------------------------|
| Table `Foo`         | base table `foo`, view `vw_foo` |
| Field `MyField`     | column `my_field`      |
| Primary key         | `foo_id` (text, slugified) |
| Relationship field  | FK column + reverse rollup text column |
| Calculated field    | column in view, fed by SQL function `calc_foo_my_field(foo_id)` |
| Aggregation field   | same shape, but aggregates over related rows |
| Lookup field        | same shape, pulls a scalar through a FK |

All names are snake_case on the SQL side; PascalCase on the Airtable side;
the rename is mechanical and deterministic.

### 4.3 Calculated / aggregation / lookup translation

Airtable formulas are translated to Postgres expressions where possible.
When translation fails (e.g. `DATEADD(..., 'days', ...)` — Postgres has no
`'days'` interval literal in the expected form), the generator emits:

```sql
SELECT /* WARNING: Formula translation failed: ... */ NULL::boolean;
```

…and the field evaluates to NULL in the view. This is why `IsVIP` is
currently NULL for the VIP-eligible clients in the seed: its dependency
`HastRecentInvoices` transpiles to a stub.

The app code treats these NULLs gracefully — the badge renders if the
value is truthy, and doesn't render if it's NULL.

### 4.4 `function-overrides/`

Some `calc_*` functions need human intervention. Current overrides:

| File                                   | Why                                                                 |
|----------------------------------------|---------------------------------------------------------------------|
| `calc_clients_last_invoice.sql`        | Generator emits `SUM(order_date::numeric)` — wants `MAX(order_date)` |
| `calc_invoices_last_payment_date.sql`  | Same story for payments                                              |
| `calc_orders_item_count.sql`           | Legacy v3 override; kept for historical correctness                  |
| `calc_orders_payment_count.sql`        | Same                                                                 |
| `calc_orders_last_payment_date.sql`    | Same                                                                 |

`init-db.sh` runs every file in `function-overrides/*.sql` last, with
**`ON_ERROR_STOP` off** — if an override targets a function that no longer
exists after a rename, the script warns but keeps going.

### 4.5 `XXb-customize-*.sql`

Sibling files to every generated SQL file:

```
01-drop-and-create-tables.sql      → 01b-customize-schema.sql
02-create-functions.sql            → 02b-customize-functions.sql
03-create-views.sql                → 03b-customize-views.sql
04-create-policies.sql             → 04b-customize-policies.sql
05-insert-data.sql                 → 05b-customize-data.sql
```

Each runs immediately after its generated counterpart. They're for
project-specific additions (an extra index, a one-off patch view). None
are populated in v6 — they exist as escape hatches.

### 4.6 Preserved quirks

- **`hast_recent_invoices`** — the Airtable field is mis-spelled
  ("Hast" instead of "Has"). The typo is preserved end-to-end so the
  rulebook stays the source of truth.
- **`client_categorie_id`** — auto-singularized wrong. Same story.
- **`vw_customers`** — leftover v3 view that `init-db.sh` still creates
  because the generator sees `Customers` referenced somewhere. Harmless;
  unused by the app.
- These could be fixed with a rulebook-level rename, but v6 is an alignment
  release — any rulebook change is scoped to a future version.

### 4.7 Security model

There is **none**. `postgres/04-create-policies.sql` generates RLS
policies but they are not wired to any auth context. The backend runs as
`postgres` and serves every request without a user concept.

Implications:

- Anyone who can reach the frontend can perform any action
- AppUsers exist as data ("who approved this client") not as principals
  ("who is logged in right now")
- This is acceptable for the demo's purpose (exercising the pipeline);
  not acceptable for any deployment beyond localhost

A future v7 might add Passport + session-backed roles, but that's out of
scope for v6.

### 4.8 Environment & ops

| Thing          | Default                                                            |
|----------------|--------------------------------------------------------------------|
| Backend port   | 3001 (override with `PORT=…`)                                      |
| Frontend port  | 3000 (Vite dev server; `vite build` outputs to `frontend/dist/`)   |
| `DATABASE_URL` | `postgresql://postgres@localhost:5432/2026-04-20-1700-effortless`  |
| Prereqs        | Node 18+, PostgreSQL 14+, effortless CLI with an `airtable` login  |
| One-shot boot  | `./start.sh` — rebuilds SQL, re-inits DB, installs deps, runs both |

`start.sh` will kill anything already listening on 3000/3001 before
starting (deliberate — the repo expects to be run locally, not coexist
with other dev servers).

### 4.9 Known gotchas

- **SUM on a timestamp** — see §4.4; if a new `Last*Date` aggregation
  appears after a rulebook change, it needs an override
- **`slugify()` strips dots** — `user@example.com` becomes
  `user-examplecom` in the generated id, not `user-example-com`. Not a
  bug; just a thing to know when URL-hand-crafting an id
- **Cascade deletes** — deleting an invoice removes its payments and line
  items; deleting a client requires its invoices be gone first; deleting
  a product requires no line items reference it
- **Stock is derived** — `stock_quantity` is a SUM, not a column. Never
  UPDATE it directly; post an `inventory_adjustment` instead
- **`init-db.sh` is destructive** — it drops and recreates the database.
  Do not run it on data you care about

### 4.10 Testing

There is no automated test suite. Testing is manual:

- Smoke test: `./start.sh`, open `http://localhost:3000`, confirm the
  Summary dashboard renders
- API smoke: `curl http://localhost:3001/api/summary` — should include
  `vip_clients`, `big_orders`, `high_margin_products`, `pending_approvals`
- DB smoke: `psql … -c "\dv vw_*"` — should list 13 views (11 domain
  + 2 ERB system)

A future release should add integration tests that hit the API against a
fresh init-db; that work is not scoped yet.

### 4.11 Future work (v7 candidates)

- **Auth** — real sessions, AppUser as principal, RLS policies wired up
- **Approval routing** — multi-step approval chains, rejection state,
  notifications
- **Rulebook typo fixes** — `HasRecentInvoices`, `ClientCategoryId`,
  retire `vw_customers`
- **Soft-delete** — currently deletes are hard and cascading; an audit
  mode would help
- **Per-user dashboards** — show an approver only their assigned queue
- **Reporting** — time-series revenue, cohort retention, inventory aging

---

## Repository layout

| Path                                                              | Purpose                                           |
|-------------------------------------------------------------------|---------------------------------------------------|
| [effortless.json](effortless.json)                                | ERB project config: base id, transpilers          |
| [effortless-rulebook/](effortless-rulebook/)                      | Generated rulebook (overwritten by build)         |
| [postgres/](postgres/)                                            | Generated SQL + customize hooks + `init-db.sh`    |
| [postgres/function-overrides/](postgres/function-overrides/)      | Hand-written SQL function overrides               |
| [backend/](backend/)                                              | Node/Express API                                  |
| [frontend/](frontend/)                                            | Vite + React UI                                   |
| [start.sh](start.sh)                                              | End-to-end boot                                   |
| [v1_SPECIFICATION.md](v1_SPECIFICATION.md)…[v6_SPECIFICATION.md](v6_SPECIFICATION.md) | Versioned product specs  |
| [CLAUDE.md](CLAUDE.md)                                            | Project rules for humans and agents               |

---

## Hard rules (project-specific)

From [CLAUDE.md](CLAUDE.md):

- **Do not modify Airtable** — it is the source of truth; the pipeline is one-way
- **Do not hand-write DDL.** Schema comes from `effortless build`; tweaks
  go in `XXb-customize-*` files or `function-overrides/`
- **Read from `vw_*` views, never from base tables**
- **Don't leave background processes running** when a task is done

---

## Quick start

```bash
./start.sh
```

Open http://localhost:3000.
