# Gym Trainer Invoicing — Effortless Demo

A personal-trainer invoicing POC. **Trainers log sessions with their clients;
sessions roll up into invoices; invoices roll up into per-client outstanding
balances and overdue flags.** Built rulebook-first on Effortless: the entire
business logic — every total, tax, balance, "is paid?" and "is overdue?" — is
declared once in `effortless-rulebook/effortless-rulebook.json` and projected
into Postgres views. The Express + React app reads those views and only
writes raw input fields back.

## The DAG (what makes this an interesting demo)

```
Sessions.DurationHours  (raw, editable)
Sessions.RateOverride   (raw, editable)
Trainers.HourlyRate     (raw, editable)
        │
        ▼  (lookup via Client → Trainer)
Sessions.EffectiveRate  = override > 0 ? override : trainer hourly rate
Sessions.LineTotal      = EffectiveRate * DurationHours
        │
        ▼  (aggregation: SUMIFS by Invoice)
Invoices.Subtotal
Invoices.TaxAmount      = Subtotal * TaxRate
Invoices.Total          = Subtotal + Tax − Discount
Invoices.Balance        = Total − PaidAmount
Invoices.IsPaid         = Balance ≤ 0
Invoices.IsOverdue      = !IsPaid AND DueDate < NOW()
Invoices.Status         = Paid | Open | Overdue
        │
        ▼  (aggregation: SUMIFS / COUNTIFS by Client)
Clients.OutstandingBalance
Clients.OverdueCount
Clients.Status          = Overdue | Has Balance | Paid Up
```

Five hops from a raw `DurationHours` to a client's `Status`. Edit any raw
field and the chain re-runs — there is no app-side rollup code anywhere.

## Quick start

```bash
./start.sh            # boots server (:3032) + web (:5175)
# → open http://localhost:5175
```

Other subcommands:

```bash
./start.sh server     # just the server
./start.sh web        # just the web
./start.sh db         # drop + re-init the Postgres DB from generated SQL
./start.sh build      # effortless build (regenerates SQL + resets DB)
```

Requires a local Postgres running as user `postgres` on `localhost:5432`.

## Dev login

Stub auth: pick an identity on the login screen, the email is sent as
`X-User-Email` on every API call. No password.

| Email             | Role    | Notes                                      |
| ----------------- | ------- | ------------------------------------------ |
| alex@gym.test     | trainer | **Primary role — fully wired.** 2 clients. |
| jamie@gym.test    | trainer | Other trainer.                             |
| sam@example.com   | client  | Placeholder view.                          |
| robin@example.com | client  | Placeholder view.                          |
| admin@gym.test    | admin   | Placeholder view.                          |

## Try this — the "watch the DAG" walkthrough

1. Sign in as **alex@gym.test** (trainer). Note Sam's status is **Overdue**
   and outstanding balance is around **$585**.
2. Open Sam's invoice **INV-002** (`/invoices/inv-002`). Note Subtotal,
   Tax, Total, and Balance — all calculated, none stored.
3. Click **Edit invoice** → set **Paid amount** to the Total → **Save**.
   The same page now shows `Balance: $0.00` and `Status: Paid`.
4. Go back to the dashboard. Sam's outstanding balance dropped by ~$282
   and their overdue count is now 1 instead of 2. Nothing else was
   updated by hand — the rollup chain re-ran from one raw field.
5. Open **Sessions**, edit one of Sam's sessions, change **Hours** from
   1.0 to 5.0 → **Save**. INV-001's Subtotal, Tax, Total, and Balance
   all shift, and Sam's dashboard tile follows.

## Repo layout

```
effortless-rulebook/effortless-rulebook.json   # SSoT — the rulebook
postgres/                                       # generated SQL + reset-rulebook-db.sh
server/src/index.ts                             # Express API; reads vw_* views,
                                                #   writes raw columns only
web/src/                                        # Vite + React + React Router
effortless.json                                 # build pipeline
start.sh                                        # interactive launcher
```

## The Effortless loop (changing the rules)

This is the whole point: **you don't write code to change behavior, you
change the rule.**

1. Edit `effortless-rulebook/effortless-rulebook.json` — add a field,
   change a formula, tweak a threshold.
2. Run `./start.sh build` — Effortless regenerates `postgres/` and
   `./start.sh db` drops + re-inits the DB.
3. The app, reading from `vw_*` views, immediately reflects the new rule.

No migrations. No ORM. No "now go update the React code to call the new
rollup." The rule moves; everything downstream follows.

## Known limitations (it's a demo)

- Stub auth (`X-User-Email` header). No magic-links, no JWTs, no RLS.
- Server connects as superuser; access control is enforced in the
  Express handlers, not in Postgres.
- Client + admin roles are **placeholder pages** — only the trainer
  role is fully wired in this POC.
- No tests; this is a walkthrough demo.
- The trainer-level rollup `TotalSessions` aggregates through a
  *lookup* (Session.Trainer comes from Client.Trainer), which the
  current generator under-counts. The trainer page doesn't lean on it
  for the demo; per-client and per-invoice rollups (the main chain)
  are correct.

---

## Local transpiler bus (`localhost:4242`)

> **All 13 local transpilers live on `localhost:4242`.** Start the bus with
> `./start.sh` from `ssotme-proxy/` at the repo root (it is root
> infrastructure again — see the root rulebook's `LegacyRunnerCapabilities`).
> The ssotme-proxy then exposes every repo-local transpiler —
> `postgres-calculated-to-rulebook`, `rulebook-to-python`, `rulebook-to-golang`,
> `rulebook-to-cobol`, `rulebook-to-owl`, and more — as first-class `ssotme://`
> routes any `effortless build` can call.
