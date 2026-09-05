# Wedding Seating Optimizer

An Effortless ERB demo that turns "where do we sit Aunt Carol" into a
calculated-field DAG. The coordinator drags guests between tables; per-table
happiness, capacity flags, per-guest satisfaction, must-not violations, and a
global plan score all recompute through the inference graph. Click any number
in the UI to open the Explainer DAG and see exactly which guests, relationships,
and weights produced it.

The point is not that the app is smart — there's no solver. The point is that
every number is a *derived* fact, and the derivation is the artifact.

## Quick start

```bash
./start.sh        # boot server (:3045) + web (:5188)
```

Open <http://localhost:5188>, pick the coordinator login, edit a guest.

Other subcommands:

```bash
./start.sh server # just the API
./start.sh web    # just the SPA
./start.sh db     # drop + re-init the local DB
./start.sh build  # effortless build (regenerate SQL + reset DB)
```

## Dev login

| Email             | Role        | Notes                                           |
|-------------------|-------------|-------------------------------------------------|
| coord@wed.test    | coordinator | Fully wired — dashboard, edit guests, edit relationships |
| bride@wed.test    | bride       | Placeholder view + read-only seating chart      |
| groom@wed.test    | groom       | Placeholder view + read-only seating chart      |

## The DAG

Raw editable fields drive a multi-hop chain. Edit a guest's `assigned_table`
and watch the cascade:

1. **`Guests.AssignedTable`** (raw FK, editable)
2. **`Relationships.GuestATable` / `GuestBTable`** (lookups through the GuestA/B FKs)
3. **`Relationships.SameTable`** (calc) → **`SeatedTable`** (calc) → **`EffectiveScore`** (calc) → **`IsMustNotViolation`** (calc) → **`ViolationFlag`** (calc)
4. **`Tables.HeadCount`** / **`RawHappiness`** / **`ViolationCount`** (aggregations)
5. **`Tables.OverCapacity`** / **`Happiness`** / **`Grade`** (calculated, 2nd/3rd order)
6. **`Guests.SatisfactionA`** / **`SatisfactionB`** (aggregations) → **`Satisfaction`** / **`Mood`** (calc)

Every cell in the UI is wrapped in `<DagCell>`. Hover for a peek; click for the
full inference graph rendered from `effortless-rulebook.json`.

## Try this

Sign in as **coord@wed.test**, then:

1. Open the **Dashboard**. Note `Must-not violations: 0` and `Total happiness: 176`.
2. Open **Guests**. Find *Drew Hart (the ex)*. The dropdown shows them at "Plus Ones".
3. Change their table to **Head Table**. The page reloads in place.
4. Back to the **Dashboard**:
   - `Must-not violations` flips to **1**
   - `Total happiness` drops to **106** (penalty for the must-not pair co-seated)
   - `Satisfied pairs` drops from `20 / 20` to `18 / 20`
   - Head Table's grade flips to **Conflict**
5. Click the `Must-not violations` number to open the DAG and trace why.
6. Move Drew back to "Plus Ones" — every number snaps back.

You just exercised raw → lookup → 1st-order calc → 2nd-order calc → 3rd-order
aggregation, with no application logic involved. The rulebook is the program.

## Repo layout

```
effortless-rulebook/
  effortless-rulebook.json   # the single source of truth
effortless.json              # transpiler pipeline config
postgres/                    # GENERATED — SQL, init script, manifest
  init-db.sh
  00-bootstrap.sql … 05b-customize-data.sql
server/                      # Express + pg API
  src/index.ts               # vw_* reads, base-table PATCH writes
web/                         # Vite + React SPA
  src/
    App.tsx                  # routes (coordinator vs placeholder)
    Login.tsx Shell.tsx
    pages/                   # Dashboard, Tables, TableDetail, Guests, GuestDetail, Relationships, Placeholder
    explainer-dag/           # GENERATED — clickable DAG widget
start.sh                     # interactive launcher
```

## The Effortless loop

To change anything: edit `effortless-rulebook/effortless-rulebook.json`, then:

```bash
./start.sh build
```

`effortless build` regenerates `postgres/` from the rulebook, then drops +
re-inits the local DB. App code reads `vw_*` views (with calculated columns) and
writes only raw columns on base tables keyed by `<table>_id` — so most rulebook
changes need zero code changes.

## Next 10 Effortless loops

Pick any of these to crank a turn. The order roughly goes from smallest blast
radius to largest.

1. **Round happiness to whole numbers consistently** — currently per-table happiness
   is integer but `total_happiness` from the server is a string. Add a `ROUND` in
   the `Tables.Happiness` formula or in the server projection. *[rulebook-only — no UI change needed]*
2. **Side-imbalance penalty** — penalize tables where bride/groom-side counts
   are wildly skewed. Add `Tables.SideSkew` (aggregation: |bride count − groom
   count|) and subtract it from `Happiness`. *[rulebook-only — no UI change needed]*
3. **Language-island penalty** — penalize tables where only one guest speaks
   the dominant table language. Add `Tables.LangIsland` (calc + agg) and fold
   into `Happiness`. *[rulebook-only — no UI change needed]*
4. **Dietary-clash penalty** — a kosher guest at a table with no other kosher
   guest is lonely; track it via `Tables.KosherSolo` etc. *[rulebook-only — no UI change needed]*
5. **Per-guest "ideal seatmates" count** — calc field `Guests.IdealSeatmates` =
   how many of their positive-affinity peers are at their table. Show on the
   guest detail page. *[rulebook + UI — adds one column to GuestDetail]*
6. **Adjustable must-not penalty constant** — currently hard-coded `-50` in
   `EffectiveScore`. Add a `Settings` entity (single row) with `MustNotPenalty`
   and reference it. Editable from a new Settings page. *[rulebook + UI — new entity + page]*
7. **Multiple plans** — promote the implicit single plan to a real `Plans`
   entity. Each Plan owns its own Tables and assignments; switch between
   "bride's plan" and "groom's plan". *[rulebook + UI — new entity + plan switcher]*
8. **Table leaderboard with rank** — add `Tables.HappinessRank` (calc using
   `RANK`-style aggregation if supported; otherwise emit it server-side) and
   render the dashboard sorted by rank with medals for top 3. *[rulebook + UI — sort + render]*
9. **Suggested swap** — for any must-not violation, compute a candidate
   `Relationships.SuggestedReceivingTable` (the most under-capacity table whose
   current happiness would gain the most). One-click "Apply suggestion" button. *[rulebook + UI — new calc + new button]*
10. **Drag-and-drop seating chart** — replace the per-row dropdown with a
    visual grid where each table is a card and guests are draggable chips.
    Same single-column write underneath. *[rulebook + UI — large UI change, zero rulebook change]*

## Known limitations (POC scope)

- Stub auth via `X-User-Email` header — no passwords, no RLS.
- Server connects as `postgres` superuser.
- No solver. The DAG scores; humans move guests.
- No tests. Manual smoke testing via the "Try this" walkthrough.
- Single shared plan — no per-user editable plans yet (see Effortless loop #7).
- Bride/groom roles are placeholder pages.
- FK constraints are skipped (`99-fk-constraints.sql`) — fine for a demo, would
  be enabled in production.

---

## Local transpiler bus (`localhost:4242`)

> **All 13 local transpilers live on `localhost:4242`.** Start the bus with
> `./start.sh` from `rulebook-examples/legacy-runner/ssotme-proxy/` (it is being
> separated into its own project; see the root rulebook's `LegacyRunnerCapabilities`).
> The ssotme-proxy then exposes every repo-local transpiler —
> `postgres-calculated-to-rulebook`, `rulebook-to-python`, `rulebook-to-golang`,
> `rulebook-to-cobol`, `rulebook-to-owl`, and more — as first-class `ssotme://`
> routes any `effortless build` can call.
