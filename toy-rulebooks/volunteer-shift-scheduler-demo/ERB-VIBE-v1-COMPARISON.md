# ERB vs Vibe — Volunteer Shift Scheduler Demo

Two builds of the same app, same README, same model (Opus 4.7, 1M context), back-to-back sessions in Claude Code. One was vibe-coded full-stack. One was built with the Effortless Rulebook (ERB) methodology — rulebook as SSoT, generated SQL, views-only reads. Neither saw the other's code.

This is the story of those two turns and what they tell us.

---

## The numbers

| | VIBE-HIGH-v1 | ERB / main |
|---|---|---|
| Session cost | **$34.10** | **$42.27** |
| Total tokens | 10,863,100 | 13,455,602 |
| Input | 181 | 172 |
| Output | 173,098 | 213,968 |
| Cache creation | 294,398 | 368,572 |
| Cache read | 10,396,423 | 12,872,890 |

ERB cost **~24% more** in tokens and dollars. Most of that lives in cache reads (`$1.50/M` × 12.87M = ~$19) — i.e. longer conversation × larger context, not per-turn extravagance. The instruction "use less effort" lowered per-step effort but extended wall-clock turns, and cache-read volume scales with both.

Two independent sessions, not a split conversation. The $8.17 delta is just `42.27 − 34.10`, nothing more.

---

## The setup

Both runs started from the same `VOLUNTEER-SHIFT-SCHEDULER-SPEC.md`. The ERB run did **not** see VIBE-HIGH-v1. It started from the same blank slate the vibe run had.

Vibe was told: build it. Coordinator + volunteer + viewer roles. Coverage grades. Skill matching. Reliability weighting.

ERB was told: build it, but use the rulebook-first ERB pipeline — rulebook → generated SQL → views-only reads.

Both produced a running Express + Vite SPA backed by Postgres. They diverged sharply in shape.

---

## What VIBE-HIGH-v1 produced

Hand-rolled, vibe-coded full-stack. ~2,620 LOC.

**Data model** (`db/schema.sql` 58 LOC + `db/seed.sql` 87 LOC + `server/compute.js` 353 LOC of derivation logic):
- 6 tables: `events`, `skills`, `volunteers`, `volunteer_skills` (real M:N), `shifts`, `assignments`
- Real timestamps (`starts_at` / `ends_at`), real `event_date`, FK cascades, CHECK constraints
- ~14 derived fields computed in JS at request time
- Composite weighted grade: `0.6·coverage + 0.3·reliability + 0.1·skill_match` → A–F
- Per-volunteer-per-event load bands (Under / Target / Over)

**UI** (`web/src/pages/*`, ~852 LOC, JSX):
- Dashboard with grade-colored event cards + new-event dialog
- EventDetail (249 LOC): stats, edit, delete, create-shift dialog
- ShiftDetail (180 LOC): assign / unassign / edit / delete
- Volunteers (165 LOC): full CRUD + per-volunteer skill picker (M:N)
- **VolunteerHome**: real "my assigned shifts" view for the volunteer role
- ViewerStub for the viewer role
- All three roles actually wired in `App.jsx:112-145`

**Bonus**: `/api/schema.xlsx` exports the schema as an Excel workbook via ExcelJS.

**Explain feature**: 69-LOC `ExplainOverlay.jsx`. Click a derived cell, see the formula and the contributing input refs. Refs are clickable for one-hop drill-up. Hand-rolled, string-keyed, but it works.

---

## What ERB / main produced

Rulebook-first. ~4,796 LOC total — but ~1,700 of that is the generic `explainer-dag/` library (reusable across projects) and ~830 is generated SQL.

**Data model** (`effortless-rulebook.json` 114 LOC + generated `postgres/00-05*.sql` 829 LOC):
- 5 tables: `Users`, `Events`, `Volunteers`, `Shifts`, `Assignments`
- **No skills table** — skills are a CSV string on volunteers, single `RequiredSkill` string on shifts
- **No timestamps** — `DayLabel` / `ClockLabel` are free text
- ~13 derived fields, fully declarative: 5 aggregations, 8 lookups, 7 calcs
- `StaffingGrade` is degenerate: fill-rate bands only, ignores reliability and skill match
- All reads via `vw_*` views; writes only on raw base columns; PL/pgSQL calc functions (`02-create-functions.sql`, 365 LOC, generated)

**UI** (`web/src/pages/*`, ~462 LOC, TypeScript + generated types):
- Dashboard, Events, EventDetail, Shifts, ShiftDetail, Volunteers, VolunteerDetail
- **Coordinator-only**. PATCH endpoints exist; no create/delete UI for events / shifts / volunteers.
- **Volunteer role → `Placeholder.tsx` (16 LOC)**: "sign out and pick the coordinator identity"
- **Viewer role → same Placeholder**

**Explain feature — this is the payoff**:
- Every calculated cell is a `DagCell` with hover-card showing the Excel-style formula + type badges
- `/dag/:table/:field` renders the **full inference graph** back to raw inputs, with formulas rendered to English
- Generic — works on any ERB project, not bespoke to this domain

---

## Side-by-side: what each one actually does

### VIBE-HIGH-v1 features
**Coordinator**: full CRUD on events, shifts, volunteers, skills, M:N skill assignment, assign/unassign, dashboard with letter grades, per-event understaffed/overstaffed counts, per-event avg reliability + skill-match avg, per-volunteer-per-event load status, Excel schema export.
**Volunteer**: VolunteerHome with *my* assigned shifts.
**Viewer**: read-only stub.
**Cross-cutting**: real timestamp math, skills as first-class entity, reliability-weighted composite grade, ExplainOverlay with clickable refs, three roles wired.

### ERB features
**Coordinator**: edit events / shifts / volunteers (PATCH only, no create/delete UI), assign/unassign, per-shift coverage + status, per-event fill-rate + staffing grade, per-volunteer load + assigned-hours + assigned-shift-count, per-assignment skill-match (CSV `FIND`).
**Volunteer**: placeholder.
**Viewer**: placeholder.
**Cross-cutting**: declarative rulebook SSoT (114 LOC drives 829 LOC of generated SQL), full DAG explainability page, regenerable DB (`./start.sh build` drops + recreates), header-based identity, TypeScript front-to-back.

---

## What each one is missing

**Missing on VIBE-HIGH-v1**: declarative source of truth (rule change = edit two files + reason about side effects), generated SQL, type-checked schema, true DAG visualization page, regenerable DB. The composite grade formula is buried in 353 lines of JS.

**Missing on ERB**: skills as an entity (it's a CSV string), real timestamps / event dates, reliability-weighted grading, per-event hours target, create/delete UI for events / shifts / volunteers, working volunteer page, working viewer page, Excel export.

Roughly: vibe is missing **substrate**; ERB is missing **content**.

---

## The honest verdict for a Tuesday demo

**If the pitch is "look how much app you get in an hour":** vibe wins. More entities modelled faithfully, full CRUD, three working roles, Excel export.

**If the pitch is "click any number on the page and see exactly how it was derived back to raw inputs":** ERB wins, and it's not close. The `/dag/Events/StaffingGrade` page is the methodology's whole reason for existing, and vibe can't match it without spending another week building one — by hand, per-project, brittle.

You paid 25% more and got a more rigorous **substrate** but a thinner **product**.

---

## The honest verdict for a 3-month project

**ERB. Not close.**

The 1-hour snapshot is the wrong frame. At hour 1, vibe looks ahead because it spent its tokens on app surface. By hour 40, the lines cross — ERB's surface catches up fast because the substrate generates most of it, while vibe's substrate debt compounds. By hour 200 (3 months), it's not a contest.

Every feature vibe currently has *over* ERB — skills as an entity, timestamps, weighted grade, full CRUD, volunteer/viewer pages — is a few hours of rulebook + UI work on the ERB side:
- Add `Skills` table to the rulebook → regenerate → done.
- Change `StaffingGrade` from `IF(FillRate...)` bands to the weighted formula → one cell edit → regenerate → done.
- Add `StartsAt` / `EndsAt` columns → regenerate → done.

Every methodology advantage ERB has over vibe — declarative SSoT, generated SQL, full DAG explainability, type-checked schema, regenerable DB — is **weeks of retrofit** on the vibe side. And the result would be ERB, rebuilt by hand, worse.

By month 2, stakeholder demos start asking "why is this volunteer's load Over?" — ERB answers natively in the browser with the DAG view. Vibe answers by you reading JS in front of them.

By month 3, vibe's `compute.js` is 1,500 lines of tangled derivation logic, the schema has drifted from what the code assumes, and every new calculated field is another hand-rolled function with no visibility. ERB's rulebook is still ~250 lines and every derived field is still one click from its inference chain.

The 25% premium at hour 1 buys you a substrate that pays itself back every Effortless loop after.

---

## What this run actually showed

This wasn't a contrived comparison. It was two real Claude sessions, same model, same spec, ~24% cost delta, run hours apart. The vibe run produced a more feature-complete demo. The ERB run produced a thinner demo on a substrate that scales.

That's the methodology's pitch in one experiment: **the rulebook-first approach loses the first hour and wins every hour after**. If your project is throwaway, vibe ships faster. If your project has a month 3, ERB is the only one of these two still standing.

The DAG page is the receipt. It's the thing you can't fake with cleverness or tokens — it requires the substrate. Everything else about the ERB version is replaceable. The DAG page is the proof that derivations are not opinion.
