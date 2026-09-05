# Product Inventory

Real-time inventory tracking with transaction-based quantity cascades. Watch how transaction quantities automatically flow up to product inventory balances, and threshold flags flip when stock drops below reorder levels.

## What is this?

A working demo of the **Effortless Rulebook methodology** — a declarative, spreadsheet-inspired approach where schema is your source of truth. All calculated fields (Amount, CurrentQuantity, IsLowStock) are derived from raw inputs via a DAG that's visible in the UI. Transactions adjust quantities → product balances update → low-stock alerts fire — all atomic and verifiable.

## Quick start

1. Start everything:
   ```bash
   ./start.sh all
   ```
   This boots Postgres, the Express server, and the Vite dev server in parallel.

2. Open `http://localhost:5175` in your browser

3. Sign in as **warehouse@example.com** (Warehouse Manager) to see full functionality

## Dev login

| Email | Role | Access |
|-------|------|--------|
| warehouse@example.com | Warehouse Manager | Full access: dashboard, products, transactions |
| manager@example.com | Manager | View-only dashboard |
| accountant@example.com | Accountant | View-only dashboard |

## The inference chain — 2-hop DAG

```
Raw inputs:
  Transaction.Quantity (user-editable)
  Product.UnitPrice (user-editable)

1st hop (Lookup):
  Transaction.ProductUnitPrice = lookup on Product.UnitPrice via FK

2nd hop (Calculation):
  Transaction.Amount = Quantity × ProductUnitPrice

3rd hop (Aggregation):
  Product.CurrentQuantity = SUM(Transactions.Quantity WHERE Product)

4th hop (Threshold):
  Product.IsLowStock = CurrentQuantity < ReorderLevel
```

**Try this walkthrough:**
1. Log in as warehouse@example.com
2. Go to Dashboard — note that all 4 products show IsLowStock = true (quantities are below reorder levels)
3. Go to Products → click **Edit** on WIDGET-A
4. Change the **Reorder Level** from 50 to 35
5. Click **Save** → the badge on the dashboard should flip from "⚠️ Low Stock" to "✓ OK"
6. Go to Transactions and **Record Transaction** → add 50 units of WIDGET-A (any positive number)
7. Watch the **Amount** calc (Quantity × UnitPrice) fill in automatically
8. Submit → go back to Dashboard
9. WIDGET-A's **Total Value** and **Current Qty** and **Status** all updated in one atomic cascade

## Architecture

- **DB:** Postgres with `vw_*` views for every entity (include calculated fields + lookups)
- **Server:** Express + pg pool, single-file TypeScript
- **Web:** Vite + React + React Router, role-based route guards
- **Auth:** Stub `X-User-Email` header; dev login page picks from seeded identities

## Making changes

### Add a calculated field

1. Edit `effortless-rulebook/effortless-rulebook.json` — add the field to its table's schema
2. `./start.sh build` — regenerates `postgres/0*.sql` from the rulebook
3. `./start.sh db` — drops and re-inits the database with new schema
4. The web app auto-refreshes; views read the new column

### Add a new entity

1. Add a table to `effortless-rulebook/effortless-rulebook.json` with its schema and seed data
2. `./start.sh build` then `./start.sh db`
3. Add a route + page to the web app (use Products.tsx as a template)
4. Add a nav item in Shell.tsx

## What you should notice

- **Atomicity:** Edit a product price or reorder level → the dashboard updates in one HTTP round-trip. No race conditions, no stale reads.
- **DAG visibility:** Every calculated cell has a clear lineage (raw → lookup → calc → agg → threshold). No hidden side effects.
- **Role-based UI:** Placeholder roles see a stub page. Only Warehouse Manager sees editable forms. Routes use `<Navigate>` to enforce this.
- **Deep routing:** F5 on any route re-renders the same page. No "landing on a 404 because the state didn't hydrate."
- **Seed data flexes thresholds:** All products start with CurrentQuantity < ReorderLevel, so the low-stock badge works out of the box.

## Known limitations

- No persistent user accounts — only dev login (stub `X-User-Email` header)
- No RLS (role-based database access control) — server enforces role checks
- Manager and Accountant roles are placeholders (routes guard access, but no real logic yet)
- No tests (smoke tests only)
- No custom claims or magic-links

## Next 10 Effortless Loops

Pick one (or several in order) to extend the demo. Each is one coherent feature—edit rulebook, run build, maybe add UI.

1. **Round LineTotal to 2 decimals** — change the formula in the rulebook to use ROUND(). [rulebook-only]

2. **Add a UnitCost field to Products** — new raw field for cost-of-goods-sold tracking, affects margin calculations. [rulebook + UI]

3. **Flag transactions with high total value** — add IsLargeTransaction = Amount > 500 threshold on Transactions. [rulebook-only]

4. **Add a Discount entity** — new table with percent applied per Order, creates a second-order calc cascade. [rulebook + UI]

5. **Track transaction history per product** — add a running balance column showing cumulative quantity over time. [rulebook-only]

6. **Add a SalesRep role** — can only see transactions for products they manage; UI shows role-filtered list. [rulebook + UI]

7. **Flag overstocked items** — add IsOverstocked = CurrentQuantity > ReorderLevel * 3 to Products. [rulebook-only]

8. **Add a WarehouseLocation entity** — products can be in multiple locations, transactions specify location, rollup quantity per location. [rulebook + UI]

9. **Snapshot transaction totals by date** — daily rollup view showing how much volume was transacted each day. [rulebook-only]

10. **Add a Notes/Comments thread on Products** — secondary entity with one-to-many relationship, shows latest notes in product card. [rulebook + UI]

---

Built with the **Effortless Rulebook methodology** — schema-first, spreadsheet-inspired, SQL-generated.

For more: `https://github.com/effortlessapi/effortless-rulebook`

---

## Local transpiler bus (`localhost:4242`)

> **All 13 local transpilers live on `localhost:4242`.** Start the bus with
> `./start.sh` from `rulebook-examples/legacy-runner/ssotme-proxy/` (it is being
> separated into its own project; see the root rulebook's `LegacyRunnerCapabilities`).
> The ssotme-proxy then exposes every repo-local transpiler —
> `postgres-calculated-to-rulebook`, `rulebook-to-python`, `rulebook-to-golang`,
> `rulebook-to-cobol`, `rulebook-to-owl`, and more — as first-class `ssotme://`
> routes any `effortless build` can call.
