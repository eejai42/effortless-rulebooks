<!-- DERIVED ARTIFACT — DO NOT EDIT BY HAND -->
<!-- Source: https://raw.githubusercontent.com/EffortlessAPI/effortless-skills/main/skills/effortless-progress-report/SKILL.md -->
<!-- Mirrored by: docs/skills/clone-skills.sh -->
<!-- Update: cd effortless-platform && effortless clone-skills -->

---
name: effortless-progress-report
description: >
  Use when a project needs to say WHERE IT STANDS and WHAT IT COSTS from its own
  rulebook — a delivery report, a status report, a priced plan, a scope
  selector, a client-facing proposal, or a "what's left / what's accepted"
  roll-up. Installs `rulebook-to-progress-report`, which turns
  `effortless-rulebook.json` into one self-contained interactive HTML report
  plus a standalone narrative, with every figure derived rather than typed.

  Also use when a rulebook does NOT yet carry a delivery spine and the user
  wants one — this skill adds `UserStories`, `AcceptanceCriteria`, `BuildPhases`,
  `EffortClasses`, `DeliveryDisciplines` and friends to an existing rulebook so
  the project can manage its own status in its own single source of truth.

  Triggers: "generate a progress report", "delivery report", "status report from
  the rulebook", "rulebook-to-progress-report", "how far along is this project",
  "what's accepted so far", "priced plan", "build a proposal from the rulebook",
  "scope selector", "add user stories to the rulebook", "add acceptance criteria",
  "track delivery in the rulebook", "what's left to build".

  **Scope (load gate):** Effortless projects — project root has `effortless.json`
  and a rulebook hub. Does not require Airtable or Postgres.
audience: customer
---

# Effortless Progress Report — the rulebook says where the project stands

`rulebook-to-progress-report` turns `effortless-rulebook.json` into a delivery
report: **one self-contained HTML file** carrying the argument for the delivery
approach, the full priced plan, and a scope selector a reader can drive — turning
user stories on and off and watching every figure, the prose included, re-derive.

## The idea, in one paragraph

A status document is the artifact most likely to be wrong. It is written once
from figures true on the day, and then the plan changes; next quarter's version
still claims four phases after the plan has five. That is not carelessness — it
is what happens whenever a document is a **copy** of a model rather than a
**view** of one.

So: **project status is not a document you write. It is data you keep in the
rulebook, and the report is a projection of it** — exactly like the database,
the API and the security model. Change a story's phase, tick an acceptance
criterion, move a price, and every figure in the report says something different
on the next build. There is no second copy to keep in step.

That is why this skill is mostly about **the rulebook**, not about the tool. The
tool is twelve lines of `effortless.json`. The work is getting delivery status
into the single source of truth where it belongs.

---

## 1. Does this rulebook already have a delivery spine?

```bash
python3 - <<'PY'
import json
d = json.load(open("effortless-rulebook/effortless-rulebook.json"))
need = ["UserStories","AcceptanceCriteria","BuildPhases","ERBFeatures",
        "ERBFeatureCategories","ERBPackages","EffortClasses","DeliveryDisciplines"]
for t in need:
    n = len(d.get(t, {}).get("data", []))
    print(f"{'OK ' if n else 'MISSING'}  {t:22} {n} rows")
PY
```

- **All eight present** → go to step 2.
- **Some missing** → go to §"Adding a delivery spine" below, then step 2.

---

## 2. Install

```bash
mkdir -p progress-report
cd progress-report
effortless -install rulebook-to-progress-report -i ../effortless-rulebook/effortless-rulebook.json
cd ..
```

Expected `ProjectTranspilers` entry in `effortless.json`:

```json
{
  "IsSSoTTranspiler": false,
  "Name": "rulebooktoprogressreport",
  "RelativePath": "/progress-report",
  "CommandLine": "rulebook-to-progress-report -i ../effortless-rulebook/effortless-rulebook.json",
  "IsDisabled": false,
  "Description": "Delivery report — status, scope and price, derived from the rulebook."
}
```

## 3. Build

```bash
effortless build
```

| File | Purpose |
|---|---|
| `progress-report/progress-report.html` | The interactive report — hand this to a reader |
| `progress-report/narrative.html` | The argument alone, led by the current bid |
| `progress-report/report-summary.md` | **Read this first.** Headline figures, and which sections still speak in the tool's generic voice |

## 4. Report back

Tell the user the path to `progress-report/progress-report.html`, the headline
figures from `report-summary.md`, and — if any sections are still generic — that
adding `ProposalSections` rows will put the argument in their own words.

---

## Adding a delivery spine to a rulebook that has none

This is the substance of the skill. The eight tables are a **delivery model**,
not report decoration: they are how a project keeps its own status.

Add them to the rulebook the same way you add anything else — edit the JSON, or
use the rulebook editor. **Never generate the rulebook from a script**; it is the
source of truth, not a build artifact.

### The shape

```
ERBPackages          a body of work someone would buy or schedule as a unit
 └ ERBFeatureCategories   an epic
    └ ERBFeatures         a capability
       └ UserStories      THE ATOM — the thing a reader selects
          └ AcceptanceCriteria   what "done" means, one row per criterion

BuildPhases          a price and a date. Stories are assigned to one.
EffortClasses        complexity bands. A story's band × its criteria = its price share.
DeliveryDisciplines  how every price divides (Build 70% / Assurance 30%, …)
```

### Minimum viable spine

One row per table generates a report. Copy this, then grow it:

```json
{
  "ERBPackages": { "data": [
    { "ERBPackageId": "core", "Title": "Core platform",
      "PrimaryPhase": "phase-1", "SortOrder": 1 } ] },

  "ERBFeatureCategories": { "data": [
    { "ERBFeatureCategoryId": "accounts", "Title": "Accounts",
      "ERBPackage": "core", "SortOrder": 1 } ] },

  "ERBFeatures": { "data": [
    { "ERBFeatureId": "signin", "Category": "accounts", "ERBPackage": "core" } ] },

  "EffortClasses": { "data": [
    { "EffortClassId": "G1", "Title": "Routine",   "ComplexityWeight": 1,   "SortOrder": 1 },
    { "EffortClassId": "G2", "Title": "Involved",  "ComplexityWeight": 1.6, "SortOrder": 2 },
    { "EffortClassId": "G3", "Title": "Demanding", "ComplexityWeight": 2.5, "SortOrder": 3 } ] },

  "DeliveryDisciplines": { "data": [
    { "DeliveryDisciplineId": "build",  "Title": "Build",     "SharePercent": 70,
      "Description": "Modelling and generation", "ClientVisible": true, "SortOrder": 1 },
    { "DeliveryDisciplineId": "assure", "Title": "Assurance", "SharePercent": 30,
      "Description": "Testing and acceptance",   "ClientVisible": true, "SortOrder": 2 } ] },

  "BuildPhases": { "data": [
    { "BuildPhaseId": "phase-1", "PhaseNumber": 1,
      "Title": "Phase 1 — Core platform", "QuotedPrice": 120000,
      "DurationMonths": 3, "PhaseKind": "fixed-price", "IsCurrentBid": true } ] },

  "UserStories": { "data": [
    { "UserStoryId": "acc-01", "ReqId": "ACC-01",
      "StoryText": "As a user I can sign in so that my work is mine.",
      "BuildPhase": "phase-1", "Epic": "accounts", "Feature": "signin",
      "EffortClass": "G1" } ] },

  "AcceptanceCriteria": { "data": [
    { "AcceptanceCriterionId": "acc-01-a", "UserStory": "acc-01",
      "Criterion": "A valid email and password signs the user in.",
      "SortOrder": 1 } ] }
}
```

### Five things to get right

1. **`UserStories.Epic` is read directly**, not inferred through `Feature`. Set
   both `Epic` and `Feature` on every story.
2. **Name the most demanding effort class `G3`.** `{hardStories}` and the
   client-side code both look for that exact literal. Name it something else and
   the figure is `0` everywhere — quietly, with no error.
3. **Client-visible `SharePercent` must sum to 100.** Every price divides by
   these; otherwise the parts stop adding back to the total.
4. **No `ComplexityWeight` may be `0`.** Pricing is `criteria × weight`; a zero
   band prices its stories at $0.
5. **Exactly one phase carries `IsCurrentBid`.** It is the phase the document is
   asking for, and `{bid.*}` resolves to it.

### Then make the dependency graph real

`UserStories.DependsOnStory` names the one story that must be accepted first.
It drives the whole scope cascade: removing a story removes everything
transitively downstream, adding one pulls in its whole ancestor chain. Must be
acyclic.

Without it the report still generates — the scope selector just has nothing to
cascade, so removing a story removes only that story.

### Register nothing in `ERBTables`

`ProposalSections`, `DeliveryDisciplines` and `EffortClasses` are **meta
tables**: they drive this document only. Leaving them out of `ERBTables` is how
a rulebook marks a table as never generated into the database or the security
model. Do not add them there.

---

## Keeping status current

Once the spine exists, "where does the project stand?" is a rulebook edit, and
the report follows on the next build:

| To record | Set |
|---|---|
| A criterion is signed off | `AcceptanceCriteria.IsAccepted` (+ `AcceptedBy`, `AcceptedAt`) |
| A task's progress | `ImplementationTasks.DevProgressPercent` |
| Work is waiting on the client | `UserStories.Roadblock` → a `Roadblocks` row |
| A blocker cleared | `Roadblocks.IsResolved` — it drops out of the report entirely |
| Scope moved between phases | `UserStories.BuildPhase` |
| The bid moved on | `BuildPhases.IsCurrentBid` |

`{accepted}`, `{acceptedPct}`, `{roadblocks}` and the per-phase figures all
re-derive. Nothing else has to be touched.

---

## Making the argument yours

The shipped narrative is a real argument for rulebook-first delivery, and it is
deliberately impersonal: **no numbers, no domain nouns.** `report-summary.md`
names the sections still running on it.

Add `ProposalSections` rows to speak in the project's own voice:

```json
{ "ProposalSectionId": "ps-01",
  "SectionKey": "security",
  "Mode": "append",
  "Body": "For a platform handling {rules} regulated business rules across {roles} roles, that matters more than usual.",
  "SortOrder": 1,
  "ClientVisible": true }
```

- **`SectionKey`** — one of `what-this-is`, `cost-curve`, `mechanism`, `cadence`,
  `explainability`, `security`, `lock-in`, `outcome`, plus the three shell keys
  `masthead`, `thesis`, `terms`.
- **`Mode`** — `append` (default), `prepend`, or `replace`.
- **`Body`** — `**bold**`, `*italic*`, and any `{placeholder}`.

**An unknown placeholder fails the build**, naming the section and listing every
valid key — rather than printing a literal `{brace}` in front of a client.

Put in a `ProposalSections` row anything **specific to the project** and anything
the **rulebook cannot evidence**. A retrospective judgement ("16 of the 25 proved
easier than expected") reads as a *measurement* when written in the same voice as
a derived figure — it belongs here, where it reads as the judgement it is.

Full placeholder list and every field: **[REFERENCE.md](REFERENCE.md)**.

---

## When it refuses

The tool emits `error.txt` instead of a report rather than publishing a wrong
number. Each message names the fix:

| Message | Fix |
|---|---|
| *missing N required table(s)* | Add them — see "Adding a delivery spine" |
| *ComplexityWeight of 0* | Give the band a weight, or move its stories |
| *shares sum to N%, not 100%* | Fix `DeliveryDisciplines.SharePercent` |
| *quoted at N but carries no units of work* | The phase has no stories, or its stories have no criteria |
| *N acceptance criteria have no text* | A field name changed — the tool reads `Criterion` |
| *more than one BuildPhase carries IsCurrentBid* | Exactly one |
| *unknown placeholder(s)* | Correct the token; the message lists every valid key |
| *carries no Effortless tables* | The request envelope arrived instead of the rulebook — check `-i` points at the rulebook |

---

## Do not

- **Do not put hours, team size, headcount or FTE counts in the output.** Effort
  is modelled in a rulebook as an internal feasibility instrument — "is this date
  achievable at the assumed throughput?" — and it is not a staffing commitment.
  The model layer does not carry it at all. What is committed to a reader is the
  **acceptance criteria and the date**, never the means. Where a client-facing
  figure needs a magnitude, use the acceptance-criteria count.
- **Do not derive price from hours.** `QuotedPrice` and `DurationMonths` are RAW
  inputs — a commercial judgement about what the delivered thing is worth on a
  calendar. Re-deriving price from effort will not reconcile, and reconciling it
  re-imports the hourly model this approach exists to reject.
- **Do not hand-edit the generated HTML.** It is regenerated on every build. If a
  number belongs in the prose it is a `{placeholder}`; if prose belongs in the
  document it is a `ProposalSections` row.
- **Do not write a status document alongside the rulebook.** That is the second
  copy this tool exists to eliminate.
- **Do not register the meta tables in `ERBTables`.**

---

## Related skills

| Skill | When |
|---|---|
| `effortless-schema` | the JSON structure of a rulebook table you are adding |
| `effortless-conventions` | PK / FK / DAG naming rules for new tables |
| `effortless-rulebook-editor` | edit the spine in a browser instead of the JSON |
| `effortless-rulespeak` | the same rulebook as plain-English business rules |
| `effortless-pipeline` | `effortless.json` and how the build resolves transpilers |
