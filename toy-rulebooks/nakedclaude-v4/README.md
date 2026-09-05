# NakedClaude (v4)
$84.91
$120.14 - Upgrade misstep - ignore $35 since last token checkin
$124.22 - It restred from git rather than rebuilding as requested.   $40 since last actual work.

An end-to-end demonstration of the **Effortless Rulebook (ERB)** pipeline:
schema is authored in Airtable, pulled into a JSON rulebook, transpiled
into Postgres DDL/views/functions, loaded into a local database, and
consumed by a small Node/Express storefront and admin UI — with no
hand-written ORM layer in between.

## Narrative platform description

The app is a **lightweight B2B storefront and back-office** for a small
gadget/accessory shop. It is split into two surfaces that share the same
Postgres database:

1. **Shop** ([`/shop`](app/shop.js)) — a customer-facing flow: browse
   products, add to a session cart, check out as a new or existing
   client, and manage your account (orders, payments, profile).
2. **Admin tables** ([`/t/<view>`](app/server.js)) — a generic CRUD
   inspector over every table in the rulebook (clients, invoices, line
   items, payments, products, statuses, client categories, plus the ERB
   metadata tables).

The whole platform is a working illustration of the ERB philosophy:
the *rulebook is the source of truth*. The Postgres schema, calculated
fields (e.g. invoice totals, client recency flags), and read-only `vw_*`
views are all generated. The application reads from those views and
writes to base tables — it never recomputes business rules in code.

### The domain model

```
client_categories ──┐         states ── addresses ── types_of_addresses
                    ▼              │
              ┌── clients ─────────┘
              │     │       │
              ▼     ▼       ▼
          statuses  │   invoices ── invoice_line_items ── products
                    │       │
                    │       ▼
                    │   payments
```

- **Clients** belong to a **client category** (which carries a discount
  rate) and have a workflow **status**.
- **Addresses** belong to a client and are typed (billing / shipping)
  via **types_of_addresses**. Each address references a **state**, and
  the state carries a `tax_rate` that flows through to invoices.
- **Invoices** (called "orders" in the shop UI) belong to a client and
  contain **invoice line items**, each pointing at a product and a
  quantity. The invoice's `tax_rate` is a **lookup** through the client's
  billing address → state → `tax_rate`, so changing a state's rate
  recomputes every affected invoice on next read.
- **Payments** are recorded against an invoice and roll up into the
  invoice's `amount_paid` / `amount_due` calculated fields.
- **Statuses** is a shared lookup with `is_blocking` and `sort_order`
  semantics so workflow gates can be expressed in data, not code.

## Mock data / scenarios

The seed loaded by [postgres/05-insert-data.sql](postgres/05-insert-data.sql)
is intentionally small so you can trace any value end-to-end:

| Table              | Rows | Examples                                                        |
|--------------------|------|-----------------------------------------------------------------|
| `client_categories`| 3    | Prospect (0%), Active (5%), Gold (15%)                          |
| `statuses`         | 7    | New, Pending, In-Review, Processing, On-Hold, Delayed, Cancelled|
| `clients`          | 5    | Alice Johnson, Bob, Brian Lee, Carla Smith, Caroline            |
| `products`         | 8    | Standard/Deluxe Widget, Pocket/Pro Gadget, 7-Port USB Hub, USB-C Cable, Aluminum Stand, Leather Case |
| `invoices`         | 7    | mix of placed/in-flight invoices spanning the seeded clients    |
| `invoice_line_items`| 18  | distributed across the 7 invoices                               |
| `payments`         | 9    | partial and full payments to exercise `amount_due` rollups      |
| `states`           | 50   | US states with per-state `tax_rate` (drives invoice tax)        |
| `types_of_addresses`| 2   | Billing, Shipping (with `is_billing_address`/`is_shipping_address` flags) |
| `addresses`        | n    | Per-client addresses tied to a state and address type           |

Scenarios this dataset covers out of the box:

- A **brand-new visitor** can land on `/shop`, add a Pocket Gadget and a
  USB-C Cable to their cart, and check out as a *new* client — the
  checkout transaction creates the `clients`, `invoices`, and
  `invoice_line_items` rows in a single DB transaction.
- An **existing client** (e.g. Alice Johnson) can be selected from the
  account picker, view their order history with running totals, and
  record a payment against an open invoice — exercising the
  `calc_orders_payment_count`, `calc_orders_last_payment_date`, and
  invoice-balance calculations.
- A back-office user can browse `/` to see row counts per table, drill
  into `/t/vw_invoices`, and edit an invoice or line item directly —
  the calculated fields recompute on read because the UI reads from
  `vw_*` views.
- The seeded statuses and discount-bearing categories let you observe
  how workflow state and pricing tiers propagate through to
  invoice-level calculations without any application logic.

## Technical specification

### Stack

- **Schema authoring:** Airtable base `appeUOAaOIdoqPSx3` (see
  [effortless.json](effortless.json)).
- **Pipeline:** `effortless build` runs three transpilers in order:
  1. `airtable-to-rulebook` → [effortless-rulebook/effortless-rulebook.json](effortless-rulebook/effortless-rulebook.json)
  2. `rulebook-to-postgres` → numbered SQL files under [postgres/](postgres/)
  3. `execute` → [postgres/init-db.sh](postgres/init-db.sh) (drops and rebuilds the local DB)
- **Database:** local Postgres database `v3_nakedclaude_demo`.
- **App runtime:** Node.js + Express 4, EJS templates, `pg` for SQL,
  `express-session` for cart/account state.

### Repository layout

```
effortless.json                      # pipeline config (baseId, transpilers)
effortless-rulebook/
  effortless-rulebook.json           # rulebook (generated from Airtable)
postgres/
  00-bootstrap.sql                   # generated
  01-drop-and-create-tables.sql      # generated
  01b-customize-schema.sql           # hand-authored overrides
  02-create-functions.sql            # generated
  02b-customize-functions.sql        # hand-authored overrides
  03-create-views.sql                # generated vw_* views
  03b-customize-views.sql            # hand-authored overrides
  04-create-policies.sql             # generated
  04b-customize-policies.sql         # hand-authored overrides
  05-insert-data.sql                 # generated seed
  05b-customize-data.sql             # hand-authored seed extras
  function-overrides/                # per-function SQL overrides
  init-db.sh                         # drops & re-applies all of the above
app/
  server.js                          # Express bootstrap + admin CRUD
  shop.js                            # /shop router (catalog, cart, checkout, account)
  views/                             # EJS templates (table.ejs, form.ejs, shop/*)
  public/                            # static CSS
start.sh                             # boots app on $API_PORT (default 3011)
```

### Running it

```bash
./start.sh
```

[start.sh](start.sh):

1. Allocates ports (`API_PORT=3011`, `UI_PORT=3012`) and persists them
   to `.run/ports.env`.
2. Kills any lingering processes on those ports.
3. `npm install`s on first run.
4. Boots `node server.js` in the background, logging to `.run/app.log`
   and writing the PID to `.run/app.pid`.
5. Polls `http://localhost:$API_PORT/` until ready, then prints the URL.

The app expects the local database to already exist; rebuild it from
the rulebook with `effortless build`.

### Database contract

The application **reads exclusively from `vw_*` views** and **writes to
the underlying base tables**. This is the ERB convention: views project
calculated fields (`invoice_total`, `amount_paid`, `amount_due`,
`item_count`, `last_payment_date`, `has_recent_invoices`, etc.), and
writes go to the raw tables so the calculated fields recompute on the
next read.

Notable calculated fields (overrides under
[postgres/function-overrides/](postgres/function-overrides/)):

- `calc_orders_item_count` — sum of line-item quantities per invoice.
- `calc_orders_payment_count` — number of payments per invoice.
- `calc_orders_last_payment_date` — most recent payment timestamp.
- `calc_clients_hast_recent_invoices` — boolean flag indicating whether
  the client has placed an invoice in the recent window.
- `clients.billing_address_state_tax_rate` — lookup that walks
  `clients → addresses → states.tax_rate` for the client's billing
  address.
- `invoices.tax_rate` — lookup that pulls
  `clients.billing_address_state_tax_rate` for the invoice's client, so
  invoice tax is *never* hand-entered: edit the state's `tax_rate` (or
  the client's billing address) and every downstream `tax_amount` /
  `invoice_total` / `amount_due` recomputes on read.

Primary keys are text-typed and prefixed by table (`client_…`,
`invoice_…`, `invoice_line_item_…`, `payment_…`); the application
generates them with `crypto.randomBytes(6).toString('hex')`.

### HTTP surface

#### Admin CRUD (generic over the rulebook)

| Route                          | Method   | Purpose                                |
|--------------------------------|----------|----------------------------------------|
| `/`                            | GET      | Index — table list with row counts     |
| `/t/:view`                     | GET      | List up to 500 rows from a `vw_*` view |
| `/t/:view/new`                 | GET/POST | Create a new row                       |
| `/t/:view/:id/edit`            | GET/POST | Edit an existing row                   |
| `/t/:view/:id/delete`          | POST     | Delete a row                           |

The CRUD layer is driven by a single `TABLES` array in
[server.js](app/server.js) that maps each rulebook table to its view,
primary key, and field types (`text`, `textarea`, `number`, `bool`,
`datetime`, `fk:<table>`). `fk:` fields are rendered as a `<select>`
populated by `fkOptions()` reading the referenced view.

#### Shop (`/shop`)

| Route                                            | Purpose                                         |
|--------------------------------------------------|-------------------------------------------------|
| `GET /shop`                                      | Home — top 6 in-stock featured products         |
| `GET /shop/products?q=&in_stock=1`               | Catalog with text search + in-stock filter      |
| `GET /shop/products/:id`                         | Product detail                                  |
| `POST /shop/cart/add`                            | Add product (qty) to session cart               |
| `POST /shop/cart/update`                         | Change qty (0 removes)                          |
| `POST /shop/cart/clear`                          | Empty cart                                      |
| `GET /shop/cart`                                 | Hydrated cart with line totals                  |
| `GET /shop/checkout`                             | Checkout form (customer picker + addresses)     |
| `POST /shop/checkout`                            | Transactionally creates client (if new), invoice, line items |
| `GET /shop/account`                              | Account picker over all clients                 |
| `POST /shop/account/switch`                      | Set `session.activeCustomerId`                  |
| `GET /shop/account/:cid`                         | Overview: last 5 orders, lifetime value, open balance |
| `GET /shop/account/:cid/orders`                  | Full order history                              |
| `GET /shop/account/:cid/orders/:oid`             | Order detail with line items + payments         |
| `POST /shop/account/:cid/orders/:oid/pay`        | Record a payment against an invoice             |
| `GET /shop/account/:cid/payments`                | Payment history across all the client's invoices|
| `GET /shop/account/:cid/profile`                 | Editable profile form + address book            |
| `POST /shop/account/:cid/profile`                | Save profile updates                            |
| `POST /shop/account/:cid/addresses`              | Create a new address for the client             |
| `POST /shop/account/:cid/addresses/:aid`         | Update an address                               |
| `POST /shop/account/:cid/addresses/:aid/delete`  | Delete an address                               |
| `GET /shop/states`                               | List of states with editable per-state tax rates|
| `POST /shop/states/:sid`                         | Update a state's `tax_rate` (re-rates invoices) |

#### Cart / session model

- The cart is held in `req.session.cart` as `[{ productId, qty }]`.
- `hydrateCart()` joins the cart against `vw_products` to compute
  `lineTotal` and `subTotal` at render time.
- Tax is **not** captured at checkout. `invoices.tax_rate` is a lookup
  through the client's billing address → state → `tax_rate`, so the
  effective rate is whatever the client's billing-address state says it
  is at read time. Editing a state's rate at `/shop/states` re-rates
  every invoice for clients in that state.
- After a successful checkout the cart is cleared and
  `session.activeCustomerId` is set to the (new or chosen) client, so
  the user lands on their order detail page.

#### Checkout transaction

`POST /shop/checkout` opens a single Postgres transaction that:

1. If `customer_mode === 'new'`, inserts a new `clients` row.
2. Inserts an `invoices` row with a generated `invoice_number`
   (`ORD-` + last 7 digits of `Date.now()`), `order_status='placed'`,
   and the captured shipping/billing addresses. The tax rate is **not**
   written — `invoices.tax_rate` is a lookup that resolves through the
   client's billing-address state on read.
3. Inserts one `invoice_line_items` row per cart entry, numbered
   sequentially.
4. `COMMIT`s and clears the cart, or `ROLLBACK`s on any error.

#### Payments

`POST /shop/account/:cid/orders/:oid/pay` validates `amount > 0` and
inserts a single `payments` row with method (default `card`), a
generated `payment_number` (`PAY-…`), and `payment_status='completed'`.
The invoice's `amount_paid` / `amount_due` reflect this on the next
read because they're calculated fields exposed by `vw_invoices`.

### Build discipline

Per [CLAUDE.md](CLAUDE.md), every `effortless build` is bracketed by:
clean working tree → run build → commit the generated diff before any
hand edits. The hand-authored `*b-customize-*.sql` files and
[function-overrides/](postgres/function-overrides/) are the only
sanctioned places for SQL that survives a regenerate.

---

## Local transpiler bus (`localhost:4242`)

> **All 13 local transpilers live on `localhost:4242`.** Start the bus with
> `./start.sh` from `rulebook-examples/legacy-runner/ssotme-proxy/` (it is being
> separated into its own project; see the root rulebook's `LegacyRunnerCapabilities`).
> The ssotme-proxy then exposes every repo-local transpiler —
> `postgres-calculated-to-rulebook`, `rulebook-to-python`, `rulebook-to-golang`,
> `rulebook-to-cobol`, `rulebook-to-owl`, and more — as first-class `ssotme://`
> routes any `effortless build` can call.
