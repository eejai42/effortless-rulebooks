# Customer CRM

A minimal Effortless CRM POC. The whole app — schema, calculated
fields, SQL views, seed data, and the in-app inference visualizer —
is generated from a single source of truth: [effortless-rulebook/effortless-rulebook.json](effortless-rulebook/effortless-rulebook.json).

The app is a small list of customers with a detail page. Each customer
has a `FirstName`, `LastName`, `Email`, and a `FullName` that is
**not stored** — it's derived on every read from
`CONCAT(FirstName, " ", LastName)` by a Postgres view generated from
the rulebook.

## The DAG (one hop, on purpose)

```
FirstName ─┐
            ├──▶  FullName = CONCAT(FirstName, " ", LastName)
LastName  ─┘
```

This demo starts with a single 1-hop inference so the Effortless loop is
obvious. The **Next 10 Loops** section below lays out concrete next
turns that grow the DAG into 2- and 3-hop chains.

## Quick start

Requires local Postgres reachable as `postgres@localhost:5432`.

```bash
./start.sh build   # regenerate postgres/ + explainer DAG from the rulebook
./start.sh db      # drop + recreate the customer_crm_demo database
./start.sh all     # run server (:3032) + web (:5175) together
```

Open <http://localhost:5175> and pick an identity.

## Dev login

| Email                | Role   | Notes                            |
|----------------------|--------|----------------------------------|
| `alice@example.com`  | admin  | Fully-wired primary role         |
| `bob@example.com`    | viewer | Placeholder page describing role |

The login picker is fed by `GET /api/dev-users`, which reads from
the `vw_users` view. The "auth" is just an `X-User-Email` header
the SPA attaches to every request — fine for a demo, not for
production.

## Try this (60-second walkthrough)

1. Sign in as **Alice (admin)**.
2. Open **Customers** in the sidebar and click any row (e.g. Ada Lovelace).
3. In the top-right, toggle **Explain** on. Notice the calculated
   "Full name" cell gets a clickable affordance.
4. Click the calculated Full name to open `/dag/Customers/FullName` —
   the inference graph for that field, rendered straight from the
   rulebook. Click `FirstName` or `LastName` to see they're raw inputs.
5. Hit Back, change "Ada" to "Augusta" in the First name field, hit
   Save. The Full name re-derives to "Augusta Lovelace" on the next
   read — because nobody stored it.

## Repo layout

```
effortless-rulebook/effortless-rulebook.json    # single source of truth
postgres/                                       # generated SQL (00-05, reset-rulebook-db.sh)
server/                                         # Express API
web/                                            # Vite + React SPA
  src/explainer-dag/                            # generated explainer module
start.sh                                        # interactive launcher
```

## The Effortless loop

Every change is the same three-step turn:

1. **Edit the rule.** Change `effortless-rulebook.json`.
2. **Rebuild.** `./start.sh build` regenerates `postgres/` and the
   explainer module. `./start.sh db` re-applies the schema and seed.
3. **Consume.** The SPA already reads `vw_*` views — most rulebook-only
   changes need zero UI edits.

## Next 10 Effortless loops

Pick one (or several, in order) and we'll crank through it. Each is
one coherent Effortless loop → one commit.

1. **Initials calc** — add `Initials = LEFT(FirstName,1) & LEFT(LastName,1)` to Customers. UI shows it as a small avatar. [rulebook + UI]
2. **NameLength flag** — add `IsLongName = LEN(FullName) > 20`, color long names in the list. [rulebook-only + tiny UI]
3. **Domain extraction** — add `EmailDomain = MID(Email, FIND("@", Email)+1, 999)` on Customers, show as a column. [rulebook-only]
4. **Domain rollup** — add a `Domains` entity keyed by domain, with `CustomerCount = COUNTIFS(Customers!{{EmailDomain}}, {{Name}})`. New page lists domains. [rulebook + UI]
5. **Tag entity** — add a `Tags` table and a `Tag` FK on Customers, with a `TagLabel` lookup. Editable in the detail page. [rulebook + UI]
6. **Status enum** — add `Status` raw field (`prospect|active|inactive`) and `IsActive = {{Status}}="active"`. Filter the list. [rulebook + UI]
7. **Created/UpdatedAt** — add `CreatedAt` raw timestamp + `AgeInDays` calc. Sort by age. [rulebook + UI]
8. **Per-domain tier** — on Domains, `Tier = IF({{CustomerCount}}>3, "gold", IF({{CustomerCount}}>1, "silver", "bronze"))`. 2nd-order calc. [rulebook-only]
9. **Customer tier lookup** — on Customers, `Tier` lookup through `EmailDomain → Domains.Tier`. 3rd-order chain. Show as a badge. [rulebook + UI]
10. **Notes entity** — add a `Notes` table with FK to Customer + an aggregation on Customers `NoteCount`. Editor on detail page. [rulebook + UI]

Tell me which loop(s) to run next.

## Known limitations

- Stub `X-User-Email` auth — no passwords, no sessions.
- No RLS policies (the server connects as superuser).
- The `viewer` role has only a placeholder page by design.
- No automated tests; the smoke test is manual.

---

## Local transpiler bus (`localhost:4242`)

> **All 13 local transpilers live on `localhost:4242`.** Start the bus with
> `./start.sh` from `ssotme-proxy/` at the repo root (it is root
> infrastructure again — see the root rulebook's `LegacyRunnerCapabilities`).
> The ssotme-proxy then exposes every repo-local transpiler —
> `postgres-calculated-to-rulebook`, `rulebook-to-python`, `rulebook-to-golang`,
> `rulebook-to-cobol`, `rulebook-to-owl`, and more — as first-class `ssotme://`
> routes any `effortless build` can call.
