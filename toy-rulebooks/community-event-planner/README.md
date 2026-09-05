# Community Event Planner

> **Project type:** Effortless demo app (rulebook-first Postgres POC). Schema, Effortless loops, new pages, and mock data follow the `effortless-demo-app` skill.

This project demonstrates the Effortless Rulebook (ERB) methodology with a community event management system. Real-world calculated fields cascade through multiple hops: raw event/venue/speaker data → venue capacity constraints → speaker availability windows → event scheduling conflicts → attendee capacity forecasts.

## Overview

A multi-hop calculated-field DAG showcasing:

- **Raw Tables**: Events, Venues, Speakers, Attendees, Bookings
- **Calculated Fields**: Available capacity, booking conflicts, speaker workload, event duration validation, attendee count projections
- **Aggregations**: Total speakers per event, total attendees per venue on a date, event conflict detection
- **Real-time Constraints**: Overbooking prevention, speaker double-booking, venue capacity enforcement

Every cell in the UI is wrapped in `<DagCell>` so you can click any value and see exactly how it was derived—from raw inputs through lookups, calculations, and aggregations.

## Stack

- **Database**: Postgres (`community_events`)
- **Server**: Express + pg + tsx on port **3045**
- **Web**: Vite + React + React Router on port **5188** (proxies `/api` → 3045)
- **Schema**: ERB rulebook-first (Path B, Postgres-native)
- **DAG UI**: React Explainer with `<DagCell>` on every calculated field

## Getting started

### Quick start

```bash
./start.sh all
```

This starts the server (**http://localhost:3045**) and web app (**http://localhost:5188**) in one command.

### Dev login

Demo accounts seeded in the database:

| Email | Role | Description |
|-------|------|-------------|
| admin@events.local | Admin | Full access; can create/edit events, venues, speakers |
| organizer@events.local | Event Organizer | Can create and manage their own events |
| speaker@events.local | Speaker | Can view assigned talks and availability windows |
| attendee@events.local | Attendee | Can browse events and RSVP |

Use the login picker on the home page to switch roles.

## Key features

### 1. Venue & Capacity Management
- Venues have fixed capacity (e.g., 150 seats)
- Each event booking reserves capacity for a given date/time
- Calculated field: **Available Capacity** = Total Capacity − Sum of Current Bookings on that date
- Overbooking is prevented at the application layer (rulebook enforces capacity > 0)

### 2. Speaker Scheduling & Conflict Detection
- Each speaker has availability windows (e.g., weekends only, 6pm–9pm)
- Events require multiple speakers (many-to-many: Events ↔ Speakers via Assignments)
- Calculated field: **Speaker Conflicts** = Speakers assigned to overlapping time slots on the same day
- Calculated field: **Speaker Workload** = Count of assigned talks per speaker (alerts on > 3 talks/week)

### 3. Event Scheduling & Validation
- Events have a venue, date, start time, and duration
- Calculated field: **Venue Conflicts** = Count of other events at the same venue within 30 minutes (before/after)
- Calculated field: **Total Speakers** = Count of speaker assignments (event cannot proceed if 0)
- Calculated field: **Event Status** = "Ready to Publish" if Venue Conflicts = 0 AND All Speakers Available AND Venue Has Capacity

### 4. Attendee Management & Forecasting
- Attendees RSVP to events (many-to-many via RSVPs table)
- Calculated field: **Expected Attendees** = Count of "confirmed" RSVPs
- Calculated field: **Capacity Headroom** = Available Capacity − Expected Attendees (alerts if negative)
- Calculated field: **No-Show Risk** = Expected Attendees × Historical No-Show Rate (cohort-based)
- Calculated field: **Recommended Overbooking Factor** = (Capacity Headroom / Expected Attendees) × 1.2 (if headroom allows)

### 5. Dashboard & Real-time Alerts
- **Event Calendar**: Color-coded by status (ready, conflicts, understaffed, at-capacity)
- **Venue Heat Map**: Shows daily occupancy and conflict flags
- **Speaker Schedule**: Week view with workload indicators
- **Attendee Trending**: Projected attendance vs. historical baseline

## DAG shape

This demo favors **width over depth**:

```
Raw Inputs
├─ Venues (capacity, location)
├─ Events (date, time, duration, venue_id)
├─ Speakers (availability_window)
├─ Speaker Assignments (event_id, speaker_id)
├─ Attendees (rsvp status)
└─ RSVPs (event_id, attendee_id, status)

Tier 1: Lookups & Simple Calculations
├─ Available Capacity (venue capacity − booked for date)
├─ Speaker Availability Match (assignment's speaker available at event time?)
├─ Venue Conflict Check (overlapping events at same venue)
├─ Expected Attendees (count confirmed RSVPs)
└─ Total Speakers Assigned (count assignments for event)

Tier 2: Multi-field Aggregations
├─ Event Status (ready? = no conflicts + all speakers available + has capacity)
├─ Speaker Workload (count talks/week, alerts on > 3)
├─ Capacity Headroom (available − expected, alerts if negative)
└─ No-Show Risk Projection (expected × historical rate)

Tier 3: Business Logic & Recommendations
└─ Recommended Overbooking (if headroom safe, suggest gentle overbook)
```

The UI exercises every tier: click any cell to see its formula, inputs, and derived values.

## Key files

- **effortless-rulebook/effortless-rulebook.json** — All business logic (venues, events, capacity, conflicts, speaker workload, etc.). Edit this to change the schema and calculations.
- **web/src/pages/** — Event, venue, speaker, and attendee views. Each uses `<DagCell>` to show where numbers come from.
- **postgres/** — Generated from the rulebook. Don't edit directly; I regenerate it when the rulebook changes.

## How the app works

The app is a living rulebook. All the business logic — venue capacity, speaker scheduling, conflict detection, attendee forecasting — is in **effortless-rulebook.json**.

**The Effortless loop** is how changes flow:
1. Tell me what to add or change (e.g., "add a field to track no-show risk")
2. I update the rulebook, regenerate the database schema, and update the UI
3. You test it and see it working
4. One commit

You don't touch SQL, database migrations, or generated code—just describe what you want the app to do, and I handle the rest.

## Why Effortless?

This demo shows why Effortless shines for event management:

- **Rulebook is authoritative**: Every business rule (capacity, conflicts, workload) lives in one place. Change it once, all reports and alerts update automatically.
- **Calculated fields cascade**: Raw data → lookups → 1st-order calcs → aggregations → business logic, all in the rulebook. No hand-written ETL or stale caches.
- **DAG visibility**: The React explainer lets stakeholders *see* how a recommendation was derived—builds trust in the system.
- **Rapid iteration**: Add a field, rebuild, deploy. No need to design tables, write queries, or coordinate schema changes across services.

---

**Ready to run?** Start with `./start.sh all`, then visit **http://localhost:5188** and log in as `admin@events.local`.

---

## Local transpiler bus (`localhost:4242`)

> **All 13 local transpilers live on `localhost:4242`.** Start the bus with
> `./start.sh` from `rulebook-examples/legacy-runner/ssotme-proxy/` (it is being
> separated into its own project; see the root rulebook's `LegacyRunnerCapabilities`).
> The ssotme-proxy then exposes every repo-local transpiler —
> `postgres-calculated-to-rulebook`, `rulebook-to-python`, `rulebook-to-golang`,
> `rulebook-to-cobol`, `rulebook-to-owl`, and more — as first-class `ssotme://`
> routes any `effortless build` can call.
