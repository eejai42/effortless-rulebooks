# Expense Approval — Effortless Project

<!-- rulebook-authoritative-banner -->
## Authoritative Source: `effortless-rulebook/expense-approval-rulebook.json` is HEAD

For this project, **`effortless-rulebook/expense-approval-rulebook.json` is the single, authoritative source of truth.** Edit it directly. All other artifacts (Postgres SQL, optional substrates) are mechanically derived from it via `effortless build`.

### ERB-only — no Airtable wiring

This project has **no Airtable base and no `airtabletorulebook` transpiler**. The JSON is the only source. There is no pull, no push, no sync, no upstream. Do not add Airtable wiring here without explicit user consent.

### Never silently revert `expense-approval-rulebook.json`

**Treat `effortless-rulebook/expense-approval-rulebook.json` as sacred.** It contains human-authored business rules and CANNOT be casually overwritten. Before running any command that could touch this file — `effortless build`, any sync script, any `git checkout`/`git restore` against it — first run `git status` / `git diff` on it.

- If the file has uncommitted changes that you (the agent) did NOT just make this turn, **stop**. Ask the user before proceeding.
- It is only acceptable to let a regeneration touch this file when you are certain the *only* uncommitted edits in it are ones you just made in the current turn.

There is no upstream to "restore from." The JSON is the upstream.
<!-- /rulebook-authoritative-banner -->

This folder is a **self-contained Effortless Rulebook (ERB) project**. The rulebook is the single source of truth. All other artifacts (Postgres, substrates) are mechanically derived from it.

## What This Demonstrates

- **3rd-order cascade**: raw line-item amounts → report total (aggregation) → over-budget flag (calculated) + approval status → escalation flag (calculated). Edit one line-item amount and the cascade propagates on the next page read.
- **Relationship + lookup + aggregation**: ExpenseItems → ExpenseReports → Employees, with `EmployeeBudgetLimit` looked up via INDEX/MATCH and `TotalAmount` aggregated via SUMIFS.
- **Role-based seed data**: four employees (employee/manager/finance) with distinct budgets, ready for stub-auth dev login.

## Rulebook

**Location:** `effortless-rulebook/expense-approval-rulebook.json`

**Entities:**
- `Employees` — submitters and reviewers. Has `BudgetLimit` for over-budget detection.
- `ExpenseReports` — one submission. Includes calculated `TotalAmount`, `IsOverBudget`, `IsApproved`, `RequiresEscalation`.
- `ExpenseItems` — individual line items belonging to a report.

**Sample data:** "NYC Client Visit" — Alice (employee, $500 budget), 3 line items totaling $695, pending. Demonstrates the escalation cascade out of the box.

## Editing

Edit `effortless-rulebook/expense-approval-rulebook.json` directly, then rebuild:

```bash
effortless build
```

## Building

```bash
effortless build
```

This runs:
1. `rulebook-to-postgres` — generates `postgres/00-05` SQL files and `reset-rulebook-db.sh`.
2. `execute -exec ./reset-rulebook-db.sh` — drops + recreates `erb_expense_approval`, applies all SQL, loads seed data.

## Database

Per the ERB naming convention: `erb_<project_dir_with_underscores>` = `erb_expense_approval`.

Configured via `effortless.env` (gitignored). On a fresh clone:

```bash
cp effortless.env.example effortless.env
```

## Key Files

| File | Purpose |
|------|---------|
| `effortless.json` | Project config + transpiler settings |
| `CLAUDE.md` | This file |
| `effortless-rulebook/expense-approval-rulebook.json` | The rulebook (SSoT) |
| `effortless.env.example` | Committed canonical env (DATABASE_URL) |
| `effortless.env` | Local env (gitignored) |
| `postgres/` | Generated SQL + reset-rulebook-db.sh |
| `README.md` | Narrative documentation for the full app |

---

**The rulebook is the specification. Everything else is derived.**
