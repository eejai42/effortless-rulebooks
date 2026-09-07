# ACME Corporation Ontology

**A comprehensive business process and inventory management system.**

This ontology models a multi-department enterprise with clients, orders, inventory, and fulfillment workflows—demonstrating real-world Effortless Rulebook (ERB) patterns at scale.

---

## What This Models

### Core Domain

- **Clients**: Customer entities with contact info, locations, credit status
- **Orders**: Purchase orders from clients (date-stamped, total-derived)
- **Line Items**: Order detail lines (quantity, unit price, extended total)
- **Inventory**: Stock-keeping units (SKUs) with stock levels, reorder points, suppliers
- **Fulfillment**: Shipments fulfilling orders (partial or complete)
- **Suppliers**: Vendor relationships for restocking

### Business Logic

- **Order Status**: Derived from fulfillment completeness (Open → Partial → Complete)
- **Stock Levels**: Inventory updated by receipts and shipments (with reorder alerts)
- **Order Totals**: Extended from line items; taxes and shipping computed
- **Fulfillment Completeness**: % of order quantity shipped
- **Supplier Performance**: Delivery time tracking, quality metrics

---

## Tables

| Table | Purpose | Key Calculated Fields |
|-------|---------|----------------------|
| **Clients** | Customer master | `Name` (composite), `Status` (credit check) |
| **Orders** | Purchase orders | `OrderNumber`, `OrderDate`, `OrderTotal` (sum of line items), `Status` (derived from fulfillment) |
| **LineItems** | Order detail | `ExtendedPrice` (qty × unit_price), `Description` |
| **Inventory** | Stock keeping | `SKU`, `OnHand`, `Reorder?` (boolean), `ReorderPoint`, `SupplierCost` |
| **Fulfillment** | Shipments | `ShipDate`, `TrackingNumber`, `QuantityShipped`, `Status` |
| **Suppliers** | Vendors | `SupplierName`, `AvgDeliveryDays`, `Quality` (rated) |

---

## Example Formulas

### Order.OrderNumber (Name / PK)
```
"ORD-" & TEXT(OrderDate, "YYYYMMDD") & "-" & ClientId
```
Generates unique, human-readable order IDs like `ORD-20260514-C001`.

### Order.OrderTotal (Aggregation)
```
SUM(LineItems.ExtendedPrice WHERE LineItems.Order == Orders.Name)
```
Rolls up line-item totals automatically.

### Order.Status (Conditional)
```
IF(FulfillmentComplete == 100%, "Complete",
   IF(FulfillmentComplete > 0, "Partial",
      "Open"))
```
Dynamically reflects fulfillment state.

### Inventory.Reorder? (Boolean)
```
OnHand <= ReorderPoint
```
Flags items needing restocking.

---

## Use Cases

### Procurement

- Create an order for a client → system generates `OrderNumber`
- Add line items → `OrderTotal` auto-computes
- Monitor fulfillment progress → `Status` updates as shipments arrive
- See reorder flags → purchase from supplier

### Inventory Management

- Receive inventory → `OnHand` increases
- Ship from inventory → `OnHand` decreases
- Check reorder alerts → `Reorder?` shows which SKUs need restocking
- Track supplier performance → `AvgDeliveryDays` informs supplier selection

### Reporting

- Order status dashboard: How many orders are Open/Partial/Complete?
- Inventory dashboard: Which SKUs are low stock?
- Client summary: Total order value per client, credit status
- Supplier scorecard: Delivery time, quality, cost

---

## Conformance Testing

This ontology includes seed data for 5 representative clients, 20 orders (with varying fulfillment states), and 30 SKUs. Conformance tests verify that:

- Postgres (SQL views + aggregations)
- Python (dataclasses + computed properties)
- Go (structs + business logic)
- Excel/CSV exports
- OWL ontology

...all compute identical `Order.Status`, `Order.OrderTotal`, and `Inventory.Reorder?` for the same input data.

---

## Design Patterns

### **Composite PKs as Formulas**
Order IDs are not surrogate keys; they're generated formulas combining date and client ID. This makes orders naturally sortable and human-readable.

### **Aggregations from Related Records**
Order total is not stored—it's computed dynamically from `LineItems`. If a line changes, the total updates automatically.

### **Status Derivation**
Order status isn't a data field; it's a calculated formula based on fulfillment percentage. No need to update it explicitly.

### **Reorder Logic in the Rulebook**
Instead of imperative code ("check stock levels and create a purchase order"), the rulebook expresses the rule: `OnHand <= ReorderPoint`. Systems consuming the rulebook (Postgres view, Python, Excel export) all enforce this uniformly.

---

## Editing

### From Airtable

Edit the schema or data in the connected Airtable base (base ID: `appzkcmBFPWFGBtRo`), then:

```bash
effortless airtabletorulebook
effortless build
```

### Directly

Edit `effortless-rulebook/acme-corporation-rulebook.json`, then:

```bash
effortless build
```

---

## References

- **ERB Methodology**: See the parent `effortless-rulebooks/README.md`
- **This Project's Rulebook**: `effortless-rulebook/acme-corporation-rulebook.json`
- **Generated Postgres**: `execution-substrates/postgres/`
- **Test Results**: Run `./start.sh` to see conformance report

---

**The rulebook is the specification. Everything else is mechanically derived.**

---

## Local transpiler bus (`localhost:4242`)

> **All 13 local transpilers live on `localhost:4242`.** Start the bus with
> `./start.sh` from `ssotme-proxy/` at the repo root (it is root
> infrastructure again — see the root rulebook's `LegacyRunnerCapabilities`).
> The ssotme-proxy then exposes every repo-local transpiler —
> `postgres-calculated-to-rulebook`, `rulebook-to-python`, `rulebook-to-golang`,
> `rulebook-to-cobol`, `rulebook-to-owl`, and more — as first-class `ssotme://`
> routes any `effortless build` can call.
