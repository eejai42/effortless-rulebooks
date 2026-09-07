# Therapist Helper Portal

A small POC for a private-practice therapist's daily helper app. Therapists track their clients, the goals each client is working on, and the sessions where progress is recorded. The portal rolls everything up into a single dashboard so the therapist can spot at a glance who's on track and who's at risk — without having to flip through individual notes.

The app is built **rulebook-first**: every entity, every calculated field, and every "at risk" rule is defined once in [effortless-rulebook/effortless-rulebook.json](effortless-rulebook/effortless-rulebook.json). The Postgres schema, views, and seed data under [postgres/](postgres/) are generated from that rulebook. The Express server reads from `vw_*` views and writes back to base tables — no business logic in application code.

## The 3-hop DAG

The "at risk" badge on a client is the tip of a 3-hop inference chain. Edit any raw field at the bottom of the chain and the badge updates on the next read:

```
GoalUpdate.ScoreAchieved (raw, editable)
        ↓ AVERAGEIFS per Goal
Goal.AvgScoreAchieved (1st-order aggregation)
        ↓ ÷ TargetScore × 100
Goal.ProgressPct (2nd-order calculated)
        ↓ ≥ 70?                ↓ AVERAGEIFS per Client
Goal.IsOnTrack           Client.AvgGoalProgress (2nd-order)
                                ↓                  ↑ AVERAGEIFS Sessions.MoodRating
                         Client.IsAtRisk = AvgMoodRating < 5 OR AvgGoalProgress < 50
                         (3rd-order calculated)
```

## Quick start

Prereqs: local Postgres running, `effortless` CLI installed.

```bash
./start.sh build   # regenerate postgres/ from the rulebook
./start.sh db      # drop+create the DB and load seed data
./start.sh all     # boot server (:3032) + web (:5175)
```

Open <http://localhost:5175>.

## Dev login

No password — pick any identity on the login screen.

| Email | Role | What you'll see |
|---|---|---|
| `tess@example.com` | therapist | **Fully wired.** Dashboard, clients, sessions, goals. Edit raw fields. |
| `rob@example.com` | therapist | Same as above, scoped to Rob's clients (Casey, Drew). |
| `sue@example.com` | supervisor | Placeholder page describing the intended supervisor view. |
| `client@example.com` | client | Placeholder page describing the intended client view. |

## Try this — watch the DAG cascade

1. Log in as **Dr. Tess Brennan**. The dashboard shows **Blair Morgan** flagged "At risk" (mood 4.0, progress 50.0%).
2. Click into Blair Morgan → find **Stabilize daily mood** (currently behind, ~33%). Bump its `TargetScore` from 8 down to 4, click Save. ProgressPct jumps to ~67%, **Avg progress %** at the top of the page recomputes, but Blair is still At Risk (mood is still 4).
3. Scroll to the **Sessions** table. Bump the mood rating on each of Blair's three sessions to **7**, saving each. The page recomputes after each save — once average mood crosses 5 *and* progress is above 50%, the "At risk" badge flips to "On track". Hop back to the Dashboard to confirm the rollup updated too.

Every number that changed in steps 2 and 3 is a generated SQL view column — there is no recomputation code in the app. Postgres re-evaluates the formulas on read.

## Repo layout

- [effortless-rulebook/effortless-rulebook.json](effortless-rulebook/effortless-rulebook.json) — single source of truth
- [postgres/](postgres/) — generated SQL (`00-05`) plus `*b-customize-*.sql` for hand-written extensions
- [server/](server/) — Express + TypeScript API
- [web/](web/) — Vite + React + React Router SPA

## The Effortless loop

Each change is one turn of the loop:

1. Edit `effortless-rulebook/effortless-rulebook.json` (the rule).
2. `./start.sh build` (regenerate `postgres/`).
3. `./start.sh db` (drop+recreate the DB with new schema and seed data).
4. The app picks up new columns automatically because it reads `vw_*` views — usually no UI change needed.

## Next 10 Effortless loops

A menu of obvious next turns. Some are pure rulebook changes (the UI keeps working unchanged because the new/changed column rides along through `vw_*`); some need a small UI addition. Pick any one — or all in order — and ask for it.

1. **Round ProgressPct to 1 decimal** — wrap the formula in `ROUND(..., 1)`. `[rulebook-only]`
2. **Add a `RiskReason` calculated field on Clients** — derive a short string like "low mood" / "low progress" / "both" so the dashboard can show *why* a client is flagged. `[rulebook-only]`
3. **Add a `GoalPriority` enum on Goals** (low/med/high) and a `HighPriorityProgress` rollup so therapists can see how the top-priority goals are tracking separately. `[rulebook + UI]`
4. **Lower the at-risk thresholds** for a stricter alert (mood < 6 OR progress < 60). `[rulebook-only]`
5. **Add `SessionsLast30Days` aggregation on Clients** — count of sessions whose label is within the last 30 days, plus a `NeedsCheckIn` calc when it drops to 0. `[rulebook-only]`
6. **Add `ClientStreak` (consecutive sessions where mood ≥ previous)** — needs a window-function calc. `[rulebook-only]`
7. **Add a `Note` entity** for free-form supervision notes attached to a session, with an aggregation counting notes per client. `[rulebook + UI]`
8. **Add `GoalCategory` lookup table** (anxiety / depression / habits / etc.) and surface category-level rollups on the dashboard. `[rulebook + UI]`
9. **Add `Risk Reviewed` boolean on Clients** with a date stamp, and a "Mark reviewed" button on the dashboard for any at-risk client. `[rulebook + UI]`
10. **Add a `Homework` entity** (per goal, per session) with a `CompletionRate` aggregation feeding into a new `EngagementScore` calc on Clients. `[rulebook + UI]`

## Known limitations

- Stub auth via `X-User-Email` — **not** production-ready.
- No RLS policies; server connects as `postgres`.
- Supervisor and client roles are labeled placeholders.
- No tests — manual smoke test only.
- `SessionLabel` is declared `string` in the rulebook but the generator coerces it to `DATE` (the `*Label`/`*Date` token heuristic fires). The UI just shows the date portion.
- FK convention: each entity's first raw field is `<Table>Id`, which the transpiler uses as the literal PK column. FK columns hold those Id values, so all rulebook lookups (single-hop and chained, like `GoalUpdates.GoalClientTherapist`) resolve in the generated `vw_*` views with no hand-rolled SQL.

---

## Local transpiler bus (`localhost:4242`)

> **All 13 local transpilers live on `localhost:4242`.** Start the bus with
> `./start.sh` from `ssotme-proxy/` at the repo root (it is root
> infrastructure again — see the root rulebook's `LegacyRunnerCapabilities`).
> The ssotme-proxy then exposes every repo-local transpiler —
> `postgres-calculated-to-rulebook`, `rulebook-to-python`, `rulebook-to-golang`,
> `rulebook-to-cobol`, `rulebook-to-owl`, and more — as first-class `ssotme://`
> routes any `effortless build` can call.
