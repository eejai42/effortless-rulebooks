# Traffic-Ticket Contest

A deliberately **universally-understood** case-management domain: a driver gets a traffic
ticket, and may pay it or contest it at a hearing. Everybody already knows this flow, so
the interesting part is fully visible — it's all in the rules.

Underneath the familiar story sit **four state machines** and a **multi-jurisdiction rules
engine**, all expressed declaratively in the rulebook (the single source of truth).

## The four state machines (all computed, never stored-and-mutated)

Each is a **calculated field on `Citations`**, derived from raw facts + child events +
the issuing jurisdiction's rules. They are always correct because they are re-derived on
every read — there is no status column to drift.

| Track | Field | States |
|---|---|---|
| Citation lifecycle | `CitationStatus` | Issued → Responded → InContest → Adjudicated → Closed |
| Contest / Hearing | `ContestStatus` | NotContested \| HearingRequested → Scheduled → Heard |
| Payment / Penalty | `PaymentStatus` | Pending → Due → Late → Collections \| Paid \| NotOwed |
| License points | `LicenseStatus` (on `Drivers`) | Valid → Warning → Suspended |

## The rules engine: regulations are data, not code

The `Jurisdictions` table makes every regulatory knob a **row**, not a hardcoded constant:

- `DaysToRespond` — response window before default judgment
- `DaysToPayAfterRuling`, `LatePenaltyPct`, `DaysLateToCollections` — payment/penalty rules
- `PointWarningThreshold`, `PointSuspensionThreshold` — license-points consequences
- `TrafficSchoolPointCap` — eligibility for points reduction

Change a jurisdiction's `DaysToRespond` and **every citation under it re-derives its
`ResponseDueDate`, `IsResponseOverdue`, and downstream statuses** — with no application
code and no migration. That is the whole point: the formula is the source of truth, and
the substrate (Postgres view, Python, Go, …) just projects it.

## Tables (a DAG — 1-to-many only)

```
Jurisdictions ─┬─▶ ViolationTypes ─┐
               └─▶ Citations ◀──────┴─ (also ◀─ Drivers)
                      ├─▶ Hearings
                      ├─▶ Payments
                      └─▶ CaseEvents   (append-only event log)
```

- **`Jurisdictions`** — the rules source (deadlines, fines, penalties, point thresholds).
- **`ViolationTypes`** — catalog: base fine, points, school-eligibility (FK → Jurisdiction).
- **`Drivers`** — the cited party; rolls up `ActivePoints` → `LicenseStatus`.
- **`Citations`** — the case hub; derives all four status tracks from facts + rules.
- **`Hearings`** — contest-track events; the latest outcome drives `ContestStatus`/liability.
- **`Payments`** — payment-track records.
- **`CaseEvents`** — append-only log mirroring each transition (audit trail alongside the
  computed current state).

## Seed data exercises every branch

The seed citations are dated against an explicit `AsOfDate` so the demo deterministically
shows: an unanswered ticket drifting overdue, a contested ticket awaiting a scheduled
hearing, a contested ticket dismissed at hearing, a defaulted (uncontested + overdue)
ticket going Late/Collections, a paid-and-closed ticket, and a fresh ticket still within
its response window — across three jurisdictions with different rules.

## Build

```bash
effortless build
```

See `CLAUDE.md` for the full editing/building/testing workflow. The rulebook is the
specification; everything else is derived.

---

## Local transpiler bus (`localhost:4242`)

> **All 13 local transpilers live on `localhost:4242`.** Start the bus with
> `./start.sh` from `rulebook-examples/legacy-runner/ssotme-proxy/` (it is being
> separated into its own project; see the root rulebook's `LegacyRunnerCapabilities`).
> The ssotme-proxy then exposes every repo-local transpiler —
> `postgres-calculated-to-rulebook`, `rulebook-to-python`, `rulebook-to-golang`,
> `rulebook-to-cobol`, `rulebook-to-owl`, and more — as first-class `ssotme://`
> routes any `effortless build` can call.
