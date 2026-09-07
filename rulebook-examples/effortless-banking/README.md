# Effortless Banking

Community-bank Small Business Banking Client Manager demo, built as an
**Effortless Rulebook (ERB)** project. The hand-authored
[`effortless-rulebook/effortless-banking-rulebook.json`](effortless-rulebook/effortless-banking-rulebook.json)
is the single source of truth; `effortless build` regenerates Postgres
schema, functions, views, and seed data under [`postgres/`](postgres/)
and rebuilds the local DB via `reset-rulebook-db.sh`.

The platform models a commercial RM workflow that competes on relationship
depth: loan origination from inquiry through underwriting, committee
approval, closing, and funding; post-funding servicing, covenant
monitoring, risk-grade migration, and the document vault — with the four
surfaces (RM dashboard, branch portal, business-client portal, admin
console) all reading from the same DAG.

## Tables

- **Users** — Bank employees: RMs, underwriters, branch bankers, admins.
- **Businesses** — Small-business customers and prospects.
- **BeneficialOwners** — 25%+ owners and control persons (FinCEN CDD).
- **Contacts** — Non-owner officers, signers, AP clerks.
- **Accounts** — Deposit accounts (checking, savings, MM).
- **Loans** — Credit facilities from inquiry through payoff.
- **Covenants** — Recurring loan conditions tested on a tickler schedule.
- **RiskRatingHistory** — Time-series of risk-grade changes per loan.
- **Documents** — DocumentVault files attached to a Business or Loan.
- **Interactions** — Unified activity-log stream (notes, calls, tasks, system events).

## Layout

- [`effortless-rulebook/`](effortless-rulebook/) — the SSoT rulebook JSON
- [`postgres/`](postgres/) — generated SQL (`0*.sql`), `reset-rulebook-db.sh`, `*b-customize-*` seams
- [`bootstrap/`](bootstrap/) — narrative, glossary, vocabulary, diagrams, mock data
- [`effortless.json`](effortless.json) — build pipeline configuration

## Working on this project

```bash
effortless build   # regen SQL + drop + rebuild the local DB
psql -d first_valley_bank -c "\dv vw_*"
```

Schema changes go through the rulebook → `effortless build`. **No
migrations, no `ALTER TABLE`** — the DB is regenerated from scratch each
build. See [`CLAUDE.md`](CLAUDE.md) for full conventions.

---

## Local transpiler bus (`localhost:4242`)

> **All 13 local transpilers live on `localhost:4242`.** Start the bus with
> `./start.sh` from `ssotme-proxy/` at the repo root (it is root
> infrastructure again — see the root rulebook's `LegacyRunnerCapabilities`).
> The ssotme-proxy then exposes every repo-local transpiler —
> `postgres-calculated-to-rulebook`, `rulebook-to-python`, `rulebook-to-golang`,
> `rulebook-to-cobol`, `rulebook-to-owl`, and more — as first-class `ssotme://`
> routes any `effortless build` can call.
