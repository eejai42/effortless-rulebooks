# Volunteer Shift Scheduler — Effortless Project (ERB sibling)

<!-- rulebook-authoritative-banner -->
## Authoritative Source: `effortless-rulebook/volunteer-shift-scheduler-rulebook.json` is HEAD

For this project, **`effortless-rulebook/volunteer-shift-scheduler-rulebook.json` is the single, authoritative source of truth.** Edit it directly. All other artifacts (Postgres SQL, optional substrates) are mechanically derived from it via `effortless build`.

### ERB-only — no Airtable wiring

This project has **no Airtable base and no `airtabletorulebook` transpiler**. The JSON is the only source. There is no pull, no push, no sync, no upstream.

### Never silently revert the rulebook JSON

**Treat `effortless-rulebook/volunteer-shift-scheduler-rulebook.json` as sacred.** Before running any command that could touch it — `effortless build`, any sync script, any `git checkout`/`git restore` against it — first run `git status` / `git diff` on it.
<!-- /rulebook-authoritative-banner -->

## Why this exists alongside `volunteer-shift-scheduler-demo/`

The sibling folder `../volunteer-shift-scheduler-demo/` is intentionally a **Naked-Claude** project — generated without a rulebook as the source of truth, kept as a comparison reference. See `../volunteer-shift-scheduler-demo/README.SHAPE-NOTE.md`.

**This** folder is the **ERB version** of the same domain: same intent, same spec (`../volunteer-shift-scheduler-demo/VOLUNTEER-SHIFT-SCHEDULER-SPEC.md`), but built rulebook-first. The two folders are kept side-by-side so you can compare the approaches.

## What This Demonstrates

The "live cascade" the spec calls out:

```
Volunteers.ReliabilityScore + MaxHours  →  (raw)
Shifts.NeededCount + DurationHours      →  (raw)
Assignments (Volunteer → Shift)         →  (raw FK rows)

Assignments → Shifts.FilledCount         (COUNTIFS aggregation)
FilledCount + NeededCount → Shifts.CoverageStatus  (calculated: under/covered/over)

Assignments → Volunteers.AssignedHours   (SUMIFS aggregation through ShiftDurationHours lookup)
AssignedHours + MaxHours → Volunteers.LoadStatus  (calculated: under/ok/over)

Shifts → Events.TotalSlotsNeeded + TotalSlotsFilled  (aggregations)
TotalSlotsFilled / TotalSlotsNeeded → Events.CoveragePercent  (calculated)
CoveragePercent → Events.StaffingGrade  (calculated: A/B/C/D/F)
```

Edit a single raw value (add an Assignment, change a NeededCount, raise a MaxHours) → the cascade reaches the event grade on the next view.

## Entities

- `Events` — top-level container (festival, food bank, conference).
- `Shifts` — time blocks within an event with a needed-count and required skill.
- `Volunteers` — people available to be slotted.
- `Assignments` — join table between Volunteers and Shifts (ERB doesn't allow many-to-many directly).

## Editing

Edit `effortless-rulebook/volunteer-shift-scheduler-rulebook.json` directly, then:

```bash
effortless build
```

## Building

```bash
effortless build
```

Runs:
1. `rulebook-to-postgres` — generates `postgres/00-05` SQL files and `reset-rulebook-db.sh`.
2. `execute -exec ./reset-rulebook-db.sh` — drops + recreates `erb_volunteer_shift_scheduler`, applies all SQL, loads seed.

## Database

Per the ERB naming convention: `erb_<project_dir_with_underscores>` = `erb_volunteer_shift_scheduler`.

Configured via `effortless.env` (gitignored). On a fresh clone:

```bash
cp effortless.env.example effortless.env
```

## Key Files

| File | Purpose |
|------|---------|
| `effortless.json` | Project config + transpiler settings |
| `CLAUDE.md` | This file |
| `effortless-rulebook/volunteer-shift-scheduler-rulebook.json` | The rulebook (SSoT) |
| `effortless.env.example` | Committed canonical env (DATABASE_URL) |
| `effortless.env` | Local env (gitignored) |
| `postgres/` | Generated SQL + reset-rulebook-db.sh |

---

**The rulebook is the specification. Everything else is derived.**
