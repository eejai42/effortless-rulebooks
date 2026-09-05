# Expense Approval

An expense approval tool for small teams. Employees submit expense reports made up of line items; totals and approval status update automatically as data changes; managers see a real-time queue of reports that need action.

Reports that exceed an employee's budget limit and haven't been approved yet are flagged for escalation — no manual tracking required. Changing a single line-item amount is enough to flip a report's over-budget and escalation state on the next view.

## How it works

When an employee adds or edits a line item, the report total updates automatically. If that total exceeds the employee's budget limit, the report is marked "over budget." A report that is both over budget and not yet approved appears in the manager's escalation queue. Approving the report clears the escalation flag immediately.

## Quick start

Requires local Postgres reachable as `postgres@localhost:5432`.

```bash
./start.sh build   # regenerate SQL + explainer module from the schema definition
./start.sh db      # drop + recreate the expense_approval_demo database with seed data
./start.sh all     # start server (:3033) + web (:5176) together
```

Open <http://localhost:5176>.

## Dev login

| Email | Role | What they see |
|---|---|---|
| `alice@example.com` | employee | Submits reports, edits line-item amounts |
| `dave@example.com` | employee | Another submitter with a tighter budget |
| `bob@example.com` | manager | Approves or rejects pending reports |
| `carol@example.com` | finance | Read-only view across all reports + Excel export |

Login is a click — no passwords. Stub auth only (see Known limitations).

## Try this (60-second walkthrough)

1. Sign in as **Alice (employee)** and open **My Reports**.
2. Click into **NYC Client Visit** — the total shows $695, which is over Alice's $500 budget. Notice the "Escalated: Yes" badge.
3. Click any calculated value (e.g. Total or the Escalation badge) — notice the **Explain** toggle in the top-right. Turn it on, then click a value to open the inference graph and trace it back to raw line items.
4. Click a line-item amount to edit it — change the Client Dinner amount to `$10` and save. The report total drops, and the over-budget flag clears.
5. Sign out and sign in as **Bob (manager)**. Open **Pending Approvals** and click Alice's NYC Client Visit report. Click **Approve**.
6. Sign back in as **Alice** and check the report — the status shows "approved" and the escalation flag is gone.
7. Sign in as **Carol (finance)** and click **Export to Excel** — you'll get a spreadsheet with both the Reports sheet and Line Items sheet, with escalated rows highlighted in orange.

## Repo layout

```
effortless-rulebook/effortless-rulebook.json    # schema + business rules (single source of truth)
postgres/                                       # generated SQL — do not edit directly
server/                                         # Express API (port 3033)
  src/index.ts                                  # all routes, auth middleware, Excel export
web/                                            # Vite + React SPA (port 5176)
  src/explainer-dag/                            # generated inference visualizer
  src/pages/                                    # employee / manager / finance pages
start.sh                                        # launcher: build | db | server | web | all
```

## Modifying this app

To add a field, change a threshold, or add a new entity:

1. Edit `effortless-rulebook/effortless-rulebook.json` — add or change the field definition.
2. Run `./start.sh build` — the SQL and explainer module regenerate automatically.
3. Run `./start.sh db` — the database is dropped and recreated with the new schema and seed data.
4. If the new field needs a UI editor or new display, update `server/src/index.ts` and the relevant page in `web/src/pages/`.

Most field-only changes (new thresholds, new flags, new calculated values) need no UI work — the existing views just pick them up.

## What to add next

1. **Round totals to 2 decimal places** — ensure all dollar amounts display consistently as `$0.00`. [no UI change needed]
2. **Category drop-down on line items** — each item gets a category (travel, meals, supplies, other). The report detail page shows a breakdown by category. [adds a field / editor]
3. **Days open counter** — reports show how many calendar days they've been waiting for approval. The manager queue can be sorted by age. [adds a field / display]
4. **SLA flag** — reports pending for more than 5 days are automatically highlighted in the approval queue. [no UI change needed]
5. **Auto-approve small reports** — reports under $50 are approved automatically, skipping manager review. [no UI change needed]
6. **YTD spend per employee** — each employee's profile shows total approved spend for the current year, so managers can spot patterns. [adds a display]
7. **Budget utilization gauge** — a percentage bar on the employee profile shows how much of the annual budget has been used. [adds a display]
8. **Department entity** — employees belong to departments; a new Departments page shows total spend per department. [adds a page]
9. **Approver name on report cards** — the reports list shows who approved (or reviewed) each report without needing to open it. [no UI change needed]
10. **Rejection reason** — managers can enter a reason when rejecting; the submitter sees it on their report. [adds a field / editor]

## Known limitations

- Login is a click on a name — no passwords, no sessions. Header-based auth only.
- No row-level security policies (server connects as superuser).
- Carol's finance role is read-only by design; the report detail page is manager/employee only.
- No automated tests; smoke tests are manual.

---

## How This Was Built *(developer reference)*

The schema, calculated fields, SQL views, seed data, and the React inference visualizer are all generated from a single JSON file: `effortless-rulebook/effortless-rulebook.json`. This file is the hub; everything else is regenerated from it via `./start.sh build`.

The rulebook defines a DAG of inference:

```
FirstName + LastName  →  EmployeeName            (1st-order calc)
ExpenseItems.Amount   →  TotalAmount             (aggregation)
TotalAmount + EmployeeBudgetLimit  →  IsOverBudget    (2nd-order flag)
ApprovalStatus        →  IsApproved              (1st-order flag)
IsOverBudget + IsApproved  →  RequiresEscalation (3rd-order flag)
```

The build pipeline:

1. `rulebook-to-postgres` transpiler — reads the JSON, generates `postgres/00-05` SQL files (tables, functions, views)
2. `init-db.sh` — drops and recreates the Postgres database, applies all SQL, inserts seed data
3. `rulebook-to-react-explainer-dag` transpiler — generates `web/src/explainer-dag/` (the clickable inference graph module)

Stack: Express + pg (server), Vite + React + React Router (web), ExcelJS (Excel export), Effortless CLI (build pipeline).

---

## Local transpiler bus (`localhost:4242`)

> **All 13 local transpilers live on `localhost:4242`.** Start the bus with
> `./start.sh` from `rulebook-examples/legacy-runner/ssotme-proxy/` (it is being
> separated into its own project; see the root rulebook's `LegacyRunnerCapabilities`).
> The ssotme-proxy then exposes every repo-local transpiler —
> `postgres-calculated-to-rulebook`, `rulebook-to-python`, `rulebook-to-golang`,
> `rulebook-to-cobol`, `rulebook-to-owl`, and more — as first-class `ssotme://`
> routes any `effortless build` can call.
