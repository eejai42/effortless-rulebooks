# Taxonomy of Intelligence

A minimal Effortless POC that explores the question *what would a proper taxonomy of intelligence look like?* The app classifies four very different agents — a human, an octopus, an LLM, and a pocket calculator — by aggregating their per-capability scores through a three-hop calculated-field DAG, and lets a researcher edit any raw score live to watch the taxonomic class flip.

The point isn't the answer (any one definition of intelligence is contestable). The point is that the rules of the taxonomy live in **one place** — the rulebook — and the entire schema, server, and explainer are derived from it. Change a weight, change a threshold, add a capability, and the whole DAG re-derives itself on the next build. That's the Effortless cascade in miniature.

## The DAG

Three entities, three hops:

| Hop | Where it lives | Field | How it's derived |
|-----|----------------|-------|------------------|
| L0 raw | `Assessments` | `RawScore` | user-editable, 0–100 |
| L0 raw | `Capabilities` | `Weight`, `Tier` | user-editable on Capabilities |
| **L1 calc** | `Assessments` | `WeightedScore` | `RawScore × CapabilityWeight` (`Weight` pulled via FK lookup) |
| **L2 agg** | `Intelligences` | `TotalWeightedScore` | `SUMIFS(WeightedScore by Intelligence)` |
| **L3 calc** | `Intelligences` | `TaxonomyClass` | `IF(Total≥350, "Generalist", IF(Total≥220, "Broad", "Narrow"))` |

Each row in the seed data is designed to land in a different bucket:

| Intelligence | Substrate | Total | Class |
|--------------|-----------|-------|-------|
| human        | biological | 395.5 | Generalist |
| octopus      | biological | 339.5 | Broad |
| gpt-5        | digital    | 326.5 | Broad |
| calculator   | digital    | 183.5 | Narrow |

## Quick start

```bash
./start.sh           # interactive launcher (all/server/web/db/db-reset/build)
./start.sh all       # build → apply db → start server + web
```

First-time setup boots a Postgres database called `mark_acosta_demo`. Override
with `DB_NAME`, `DATABASE_URL`, `SERVER_PORT`, or `WEB_PORT` env vars if needed.

The app runs at:

- web (Vite): http://localhost:5175
- server (Express): http://localhost:3032
- db: `postgresql://postgres@localhost:5432/mark_acosta_demo`

## Dev login

Stub auth: pick an identity on the login screen, no password. The email is
stored in `localStorage` and sent as `X-User-Email` on every request.

| Email                | Role         | What you see |
|----------------------|--------------|--------------|
| alice@example.com    | researcher   | **fully-wired primary role** — dashboard, intelligences, capabilities, editable assessments matrix |
| bob@example.com      | reviewer     | placeholder landing page describing what reviewers would see |
| carol@example.com    | public       | placeholder landing page describing the public view |

## Try this

The fastest way to feel the cascade:

1. Sign in as **alice@example.com** (researcher).
2. Open **Assessments** in the sidebar — you see the full 4×4 matrix.
3. Find the `calculator` row. Its `creativity` score is **0**; total is **183.5**; class is **Narrow**.
4. Click into the `creativity` cell on the calculator row, type **95**, press Enter.
5. The cell's `= 142.5` (the new WeightedScore) appears immediately, the **Total** column on the right re-rolls up to **326.0**, and the **Class** badge flips from `Narrow` to `Broad`.
6. Open the **DAG toggle** at the top-right; click the new class badge to see the full inference graph from raw score → weighted → total → class.
7. Either revert the score or run `./start.sh db-reset` to return to the seed data.

That single edit cascades through three layers without you writing any SQL,
any glue code, or any cache invalidation. The view re-derives every read.

## Repo layout

```
effortless.json                  pipeline config (rulebook-to-postgres + explainer-dag)
effortless-rulebook/
  effortless-rulebook.json       the single source of truth
postgres/                        GENERATED — schema, functions, views, seed SQL, init-db.sh
server/                          Express + pg API (hand-written)
  src/index.ts                   all routes (CRUD on capabilities/intelligences/assessments)
web/                             Vite + React SPA (hand-written)
  src/
    App.tsx                      router + auth gate + DAG provider
    Shell.tsx                    sidebar nav + DAG toggle
    Login.tsx                    dev-user picker
    pages/                       Dashboard, Intelligences, IntelligenceDetail, Capabilities, AssessmentsMatrix, Placeholder
    explainer-dag/               GENERATED — React Explainer DAG module (embedded rulebook)
start.sh                         interactive launcher
CLAUDE.md                        conventions for future Claude sessions
```

## Doing a Leopold loop

The whole point of this scaffold is that you can crank the loop:

```
edit  effortless-rulebook/effortless-rulebook.json
run   ./start.sh build         # regenerate postgres/ + explainer-dag/
run   ./start.sh db            # apply schema/data updates in place
                                # (or ./start.sh db-reset to truncate + reseed)
```

Then the running web app picks up the new columns on the next read.
**Do not** edit anything under `postgres/` or `web/src/explainer-dag/` by
hand — the next build will stomp it.

## Next 10 Leopold loops

You've turned the loop once (the initial scaffold). Here are ten concrete
next turns, smallest to largest, mixing rulebook-only changes that flow
through the existing UI with rulebook+UI changes that introduce new
concepts:

1. **Round `WeightedScore` to 1 decimal** — change the formula to
   `=ROUND({{RawScore}}*{{CapabilityWeight}}, 1)`. *[rulebook-only — no UI change needed]*
2. **Tighten the `Generalist` threshold** — change `350` to `380` in
   `TaxonomyClass`. Watch which intelligences shift class. *[rulebook-only]*
3. **Add an `IsGeneralist` boolean on Intelligences** —
   `={{TaxonomyClass}}="Generalist"`. *[rulebook-only — appears as a new column on `vw_intelligences`]*
4. **Add `FoundationalScore` aggregation** — sum WeightedScore only where
   the capability's tier is foundational. *[rulebook-only — needs a Tier-filtered SUMIFS]*
5. **Split into `FoundationalScore` / `CompositeScore` / `EmergentScore`** —
   three parallel aggregations. *[rulebook-only]*
6. **Add a `HasEmergentCapability` boolean on Intelligences** —
   true if any of its emergent-tier assessments scores ≥ 50. *[rulebook-only]*
7. **Add a 5th capability `tool-use`** (composite, weight 1.2) plus four
   new Assessment rows. The matrix grows a column automatically. *[rulebook-only — schema unchanged, just more data]*
8. **Add a `Notes` raw field on Assessments** — string, nullable. Wire an
   editor in the matrix or detail page. *[rulebook + UI — new editor column]*
9. **Show the per-tier breakdown on IntelligenceDetail** — once loop #5
   has landed, render `FoundationalScore` / `CompositeScore` / `EmergentScore`
   as three sub-stats with their own `<DagCell>` wrappers. *[rulebook + UI — UI consumes the new columns]*
10. **Add a `TaxonomyClasses` reference table** — entity with threshold
    rows; refactor `TaxonomyClass` to derive from lookups instead of inline
    IFs. *[rulebook + UI — biggest refactor; teaches the FK/lookup pattern from the bottom up]*

Pick one (or several in order) and we'll crank the loop.

## Known limitations

- **Stub auth.** `X-User-Email` header is trusted; no passwords, no JWT, no RLS. Replace with magic-links + RLS for any non-toy use.
- **Two placeholder roles.** Reviewer / public roles land on a labeled stub page.
- **No tests.** Smoke-tested manually.
- **FK constraints skipped.** `99-fk-constraints.sql` is not applied — fine for a demo where the rulebook controls all inserts; flip `EFFORTLESS_ENFORCE_FKS=true` to opt in.
- **The taxonomy is intentionally simple.** Three buckets and one weighted sum is not "a proper taxonomy of intelligence" — it's the smallest model that lets the DAG turn. Loops 1–10 above show how to make it richer without writing any glue code.

---

## Local transpiler bus (`localhost:4242`)

> **All 13 local transpilers live on `localhost:4242`.** Start the bus with
> `./start.sh` from `rulebook-examples/legacy-runner/ssotme-proxy/` (it is being
> separated into its own project; see the root rulebook's `LegacyRunnerCapabilities`).
> The ssotme-proxy then exposes every repo-local transpiler —
> `postgres-calculated-to-rulebook`, `rulebook-to-python`, `rulebook-to-golang`,
> `rulebook-to-cobol`, `rulebook-to-owl`, and more — as first-class `ssotme://`
> routes any `effortless build` can call.
