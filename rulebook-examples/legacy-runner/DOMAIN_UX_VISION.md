# Domain UX Vision — what's left

> Living plan for the Effortless admin portal. The reception desk, picker,
> rich-text editor, command palette, time-travel scrubber, tour mode, three
> responsive breakpoints, per-user state, and rules-glow shipped in earlier
> sessions. This document is the **remainder** — open work only.
>
> **Core behavior first. UI polish last.**

---

## What already shipped (do not re-plan)

**Picker** — gallery of motif-banded trailers reading the rulebook's
`__meta__` table (rows for `tagline`, `motif`, `motif_palette`,
`signature_rows`); three picker chips above the
gallery (*Last visited* / *New since you were here* / *Bootstrap a new
one*).

**Reception desk** — motif hero band with logo, slug, name, tagline,
substrate witness chips, and the "Take the tour" button. Below: the
`description_rich` paragraph, telemetry strip, `journal_seed` blockquote,
use-cases panel on the right. Horizontal scrollers per `important: true`
entity (only `important_fields` shown). Rules-that-matter panel with
click-to-expand `explanation_rich` + formula + worked example.

**Cross-cutting** — Cmd-K command palette; inline rich-text editor
(pencil-toggle, `PATCH /api/rulebook/text` with strict path allow-list);
time-travel scrubber driven by `git log` of the rulebook JSON, sticky
amber `Viewing state as of …` banner, pencils disabled in past mode;
rules-panel rows pulse green for 60s after the rulebook's most recent
commit; 90-second tour mode walking important items in page order;
three responsive breakpoints (≤640 phone / 641–1024 tablet / ≥1025
desktop). Per-user / per-domain state persists in
`portal_user_domain_state`.

Every `<project>-rulebook.json` in `rulebook-examples/` carries a
`__meta__` table. The platform rulebook carries one too. Authoring
coverage is **complete** — see the `__meta__` doctrine in
[CLAUDE.md](CLAUDE.md). If you find a rulebook without `__meta__`, that
is a bug to file against that specific rulebook, not a typical state
to plan around.

---

## 1. Reference: ACME Corporation data

Source: [rulebook-examples/acme-corporation/effortless-rulebook/acme-corporation-rulebook.json](rulebook-examples/acme-corporation/effortless-rulebook/acme-corporation-rulebook.json)

- Five entities: `Client` (3 rows), `Projects` (3), `Employees` (3),
  `Roles` (3), `TypesOfProject` (4).
- Business story: a small professional-services shop. Some project types
  (Compliance, ClientFacing) require manager sign-off; only employees in
  manager roles can approve. The DAG wires that workflow.
- `__meta__` table fully authored — this is the **reference rulebook**. Match
  this shape when authoring `__meta__` rows for other demos.

---

## 2. Effortless Explorer — status as of 2026-05-28

The §2.1–§2.7 spec (left nav, right pane, schema-as-metadata, routes,
two-layer model, URL encoding, backend API) is **largely implemented**.
The full original spec text is preserved verbatim in **[Appendix A](#appendix-a-original-21-27-spec-preserved-now-built)**
at the bottom of this doc so a fresh agent can read the exact wire
contracts and design intent. The summary below is what's built, where,
and what the *remaining gap* is.

### Built (mechanics — see Appendix A for the spec text)

| Spec                                                                              | Where it lives                                                                                                                              |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| §2.1 Recursive instance tree (entity → instances → child collections → instances) | `InstanceTreeNode` — [ExplorerScreen.jsx:225](effortless-platform/admin-portal/client/src/screens/developer/ExplorerScreen.jsx#L225)         |
| §2.2 Right-pane header + tabs derived from FKs                                    | `InstanceView` — ExplorerScreen.jsx ~845                                                                                                    |
| §2.3 Column-header IS schema entry (hover · dblclick · cell-click → provenance)   | `SchemaHeaderCell` / `SchemaEditor` / `CellProvenance` — ExplorerScreen.jsx:649 / 457 / ~695                                                 |
| §2.4 Single `/explorer` route; `/data`+`/entities` redirect; AppNav collapsed     | App.jsx:141-149; project rulebook `AppNavigation.nav-026`                                                                                   |
| §2.5 Two-layer model + write-through (Postgres + rulebook JSON in one TXN)        | `writeThrough` — [server.js:641](effortless-platform/admin-portal/server.js#L641)                                                            |
| §2.6 Friendly Name-only URLs; no PK fallback; fail loudly on collisions           | `parsePathSegments` / `goTo` — ExplorerScreen.jsx:17                                                                                        |
| §2.7 `GET /tree`, `/node`, `/cell`; instance `PATCH`/`POST`/`DELETE`              | server.js:1234, 1279, 1456, 1638, 1723, 1816                                                                                                |
| §2.7 `PATCH /schema` + `POST /rebuild` + SSE (`effortless_build` → SQL bootstrap → `verify`) | `startRebuildJob` / `verifyRowCounts` — [server.js:1988](effortless-platform/admin-portal/server.js#L1988)                                  |
| §2.8.3 failed-rebuild surface: live `git diff` + clickable revert                 | `/api/explorer/rulebook-{diff,revert}` — server.js ~2296; `RebuildOverlay` — ExplorerScreen.jsx:1148                                          |

### Still open in §2 — Explorer **feel** (the real gap)

The mechanics work. The *experience* still reads as
"list-of-entities-with-tables" on first landing, not "walkable DAG."
The DAG-walk only emerges after the user discovers the small `▸`
chevron, clicks an instance, and *then* clicks a tab — a 3-step
descent path that doesn't shout at you. Closing this is polish, not
architecture:

1. **Default landing invites descent.** Entity-level list (right pane
   after clicking a top-level entity) should make the `Name` column
   look like a link, surface inline relationship chips on each row
   (*"→ 4 Orders · 2 Addresses"* — already derivable from `/api/explorer/tree`),
   and carry an empty-state hint: *"click any row to descend into its
   DAG."*
2. **Tree chevron is too quiet.** The `▸` is the entire discovery
   affordance for the DAG walk. Make it bigger and louder, auto-expand
   the first `important: true` entity on mount, and add a hover-preview
   of the first 3 instances of a collapsed entity.
3. **Instance-view tabs need to read as navigation, not metadata.**
   The FK-derived tabs (`Orders`, `Addresses`, …) on `InstanceView`
   exist and round-trip through the URL, but they look like section
   labels. Style them as breadcrumb-extending pills with row counts.
4. **Reception-desk row-click deep-links** route to
   `/explorer/<Entity>/<Name>` correctly; verify the tree auto-expands
   the path on landing (`shouldAutoExpand` at ExplorerScreen.jsx:231
   intends to — needs eyes-on-glass).

None of these touch §2.7 or the rebuild machinery. Each is a focused
edit inside `ExplorerScreen.jsx`. **A new session should start here.**

### 2.8 Decisions (locked 2026-05-27)

All seven were walked one-by-one and locked. Notes preserve intent so a
fresh agent doesn't re-litigate. Where the answer overrode the original
recommendation, the override is called out.

1. **Snapshot before every schema PATCH? — NO** *(override).*
   No `<domain>-rulebook.snapshot.json` sidecar files. Git history is
   the rollback path. The "revert" button in the failed-rebuild UI
   runs `git checkout -- <rulebook.json>` on explicit user click —
   never silent (see [CLAUDE.md](CLAUDE.md) "Never silently revert
   a rulebook JSON").

2. **Sync or async rebuild response? — Async + SSE.**
   PATCH returns immediately with `{ rebuildId, status: "pending",
   streamUrl }`. Client opens SSE stream and tails phase events.
   Matches the live-build pattern in §3.5.

3. **What does a failed rebuild leave behind? — Leave it broken,
   surface the diff loudly.**
   Don't auto-rollback. Show the rulebook git-diff that triggered the
   rebuild, the failing row(s), and two buttons: "Revert via
   `git checkout`" (explicit user click) or "Edit the failing rows."
   Matches the "no silent fallbacks" doctrine in [CLAUDE.md](CLAUDE.md).

4. **Locking model during rebuild? — NO LOCK** *(override).*
   The `effortless` CLI (ssotme:// client) handles its own locking.
   Do **not** add advisory locks, mutexes, "rebuild in progress"
   gates, cache layers, or fallback paths on top of it. If a write
   races a rebuild, the underlying tool fails loudly and the user
   sees the real error. This is the *no locks / no caches / no
   fallbacks* doctrine in [CLAUDE.md](CLAUDE.md) (sibling of "Avoid
   Silent Fallbacks") — load-bearing for this project.

5. **Cell-provenance: runtime vs cached? — Runtime.**
   `GET /api/explorer/cell` walks the formula tree on demand. No
   pre-computed index, no cache layer between requests and the
   rulebook JSON. Depth is single-digit; round-trip dominates.

6. **Path-encoding stability when `Name` gets renamed? — Friendly
   Name-only URLs, no PK fallback** *(override — removed the
   fallback).*
   This is a closed-platform demo; every entity has a
   unique-within-entity Name by construction. URLs use Name. On
   rename PATCH, the handler returns the new URL in `Location:` so
   the client rewrites history (normal post-mutation routing, not a
   fallback). On a Name collision: fail loudly. No `?byPk` escape
   hatch.

7. **Where the code lives? — `effortless-platform/admin-portal/server.js`**
   (new fenced section). Reuse the existing rulebook load/write
   helpers, the write-through transaction helper, and the SSE
   plumbing planned for the Effortless Tools tree (§3.5 — same
   pattern, different domain).

### 2.9 Out of scope for v1

- **Full sort/filter/group/facet on list nodes** — the §2.1
  "FUTURE SELF HINT" callout. v1 ships paging + simple
  field-equality filter.
- **Bulk edits** — single-row mutations only. Bulk-import /
  CSV-paste is a later API.
- **Schema diff visualization** — the rebuild SSE reports phases,
  not a structured before/after schema diff. v2.
- **Cross-domain Explorer** — one domain at a time per URL. Domain
  switch is the existing picker, not a tree-walk operation.
- **Time-travel inside the Explorer** — the existing scrubber works
  against the rulebook git history. The Explorer reads through the
  scrubber's current state but doesn't get its own time controls.

### 2.10 Execution shape

This is a single connected pass, not a multi-PR plan. The spec above
is detailed enough to flow through end-to-end. Commit at natural
breakpoints — each endpoint, each route migration, each client
component — so commits stay reviewable, and re-read this doc at each
commit to catch plan-drift. **If the plan changes mid-stream, stop and
update the doc before continuing.**

This is a localhost-only demo. The editor DB (`erb_<domain>`) is
mechanically derived from the rulebook JSON and can be dropped and
rebuilt at will. The only non-ephemeral artifact is **git history** —
so the discipline is *tidy commits*. Nothing else can be broken in a
way that matters.

Suggested natural ordering (not rigid — adjust as the work reveals):

1. Route consolidation + AppNavigation collapse (`/data` and
   `/entities` redirect to `/explorer`).
2. `GET /api/explorer/tree` + left-nav component.
3. `GET /api/explorer/node` + right-pane grid with column-header-as-schema.
4. Reception-desk scroller row clicks → `/explorer/<exact node>` deep links.
5. `PATCH/POST/DELETE /api/explorer/instance/*` (write-through; no lock).
6. `GET /api/explorer/cell` + click-cell-for-provenance UI.
7. `PATCH /api/explorer/schema` + `POST /api/explorer/rebuild` + SSE stream.
8. "Rebuilding…" overlay + failed-rebuild diff surface + git-checkout button.

---

## 3. TOP PRIORITY — rewrite Effortless Tools as a folder/tool tree

> **This is the next session's job.** Everything depends on §3: it's
> the only surface where the project's actual build/orchestration
> lifecycle is visible to the user, and it subsumes the orphaned
> "Orchestration" tab (§3.7). §2 mechanics are built (see §2 status
> + Appendix A); §4 items are smaller individual wins that can land
> opportunistically while §3 is in flight.
>
> **Reusable from §2 backend work** (don't reinvent these):
> SSE job plumbing (`startRebuildJob` / `broadcastJobEvent` / `phase`
> / `finishJob` at server.js:1957–1980), the spawn-and-stream-stdout
> pattern (server.js:2003–2034 for `effortless build` — same shape
> works for any per-tool run), `writeThrough` for `effortless.json`
> edits, the `requireEditor` middleware, and `portal_audit_log` for
> tool-run audit. §3.6's endpoint list maps onto these almost 1:1.

The current Effortless Tools page does **three things badly**:

1. **The "Build all" button is one opaque switch.** No live progress, no
   per-tool status, no way to see what's running or what's stuck.
2. **The "installed substrates" list is the same ~10 entries regardless
   of the project.** It does not reflect what's actually in `effortless.json` —
   ACME LLC has all 10 installed and looks the same as a project with
   two installed. The page is lying about installation state.
3. **The tool detail panel summary is generic and unhelpful**, and the
   floating "Available to add" cards at the bottom have no clear
   relationship to anything above them.

**This page should be a projection of the on-disk project, not a
floating dashboard.**

### 3.1 Left rail — folder/tool tree

The left rail mirrors the project's actual folder structure under the
active domain root (`rulebook-examples/<domain>/`, or
`effortless-platform/` for the project rulebook). Folders that contain
Effortless tools list those tools as inline children. Folders that
don't still appear in the tree but have no children.

```
acme-llc/
├ effortless-rulebook/                 (the hub — the SSoT JSON)
├ docs/
│  ├ effortless-rulebook/
│  │  └ • airtable-to-rulebook        (input spoke)
│  ├ english/
│  │  └ • rulebook-to-english
│  └ testing/
│     └ • rulebook-to-test-suite
├ execution-substrates/
│  ├ • rulebook-to-postgres
│  ├ • rulebook-to-python
│  ├ • rulebook-to-excel
│  ├ • rulebook-to-owl
│  ├ • rulebook-to-golang
│  ├ • rulebook-to-csv
│  ├ • rulebook-to-uml
│  ├ • rulebook-to-cobol
│  ├ • rulebook-to-binary
│  └ +                                (add another tool here)
└ +                                   (add a tool at the project root)
```

**Why the split.** `execution-substrates/` are runtime targets —
substitutable backends that must compute identical answers from the
same rulebook. `docs/` is the *spec apparatus*: input spokes write
*into* the hub, English narratives explain it, and the test suite is
the conformance contract every substrate is graded against. None of
those are substrates and they don't belong next to COBOL and CSV.
Tests still produce domain-specific *artifacts* (acme's answer keys
differ from star-trek's), but the category is "spec," not "runtime."

The tools listed inline come from **the `effortless.json` files**
discovered at each level of the tree — `effortless.json` is a hierarchy,
based on which folder it lives in. ACME LLC has 10 substrates because
ACME LLC's `effortless.json` (and its subfolders') list 10 tools. A
project with two tools shows two. Never default to a hard-coded ~10.

### 3.2 `+` to add a tool

Every folder ends with a `+` row. Clicking opens the catalog currently
floating at the bottom of the page (repurposed) — the filtered list of
*tools available to this folder* that aren't yet installed. Choose one,
it gets written into the folder's `effortless.json`, and the tool appears
under that folder in the tree.

### 3.3 Tool detail (main panel)

Clicking a tool node shows:

- **Tool metadata** — name, description, source URL (`ssotme://…` or
  `http://localhost:4242/…`), version, what dialect it emits.
- **Inputs** — the input files it reads, with paths resolved relative
  to the project (typically the rulebook JSON; sometimes testing
  fixtures or templates).
- **Outputs** — the output files it writes, with the actual generated
  paths.
- **Parameters** — exactly the flag set declared in `effortless.json`
  for this entry (`-i`, `-o`, additional `-p` args).
- **▶ Run** — runs this one tool. Live stdout streams below the panel
  while it runs; exit code + duration shown when it finishes.

This replaces the current "shitty summary" with the only summary that
matters: *what does this tool read, what does it write, what flags
control it, and what happens when I run it right now.*

### 3.4 Docs-folder tools get bespoke routes and pages

The generic tool-detail panel in §3.3 is the right home for
**execution-substrate** tools — they're commodity targets that differ
only in dialect, and an auto-summarized "reads X, writes Y, run flags
Z" panel says everything worth saying. **Docs-folder tools are
different.** `airtable-to-rulebook` (input spoke), `rulebook-to-english`,
and `rulebook-to-test-suite` are *platform-level*: there's exactly one
of each across the whole repo, each one encodes a load-bearing
decision about how the methodology works, and each one deserves
hand-authored explanation — not metadata.

Each docs-folder tool gets:

- **Its own route**:
  - `/developer/:domain/docs/input-spokes/airtable-to-rulebook`
  - `/developer/:domain/docs/english`
  - `/developer/:domain/docs/testing`
  Top-level (project-rulebook) equivalents under `/platform/docs/…`.
- **A bespoke page** — hand-authored TSX (or Markdown rendered through
  a TSX shell) living in the repo, e.g. under
  `effortless-platform/admin-portal/client/src/pages/docs/<tool>/`.
  Non-generated content, versioned with the codebase. Each page
  explains what *this specific tool* does, why it exists, the
  protocol it implements, what it reads/writes, and how to use it.
  These are the canonical "what is the test suite, conceptually?"
  / "what is an input spoke, conceptually?" pages.
- **A DALL-E-generated hero image** per tool — cartoon style,
  consistent palette across the set (matching the previous cartoon
  set used in this project). The image lives next to the page
  (`docs/<tool>/hero.png`). The same image renders as the tool's
  icon in the left rail so the three are instantly distinguishable.
- **The standard run controls** at the bottom of the page (`▶ Run` +
  live stdout tail, exit code, duration) — so the bespoke page is also
  the operational home for the tool, not just a documentation surface.
  Clicking the tool in the left rail lands on this page; there is no
  separate "tool panel" for the docs-folder tools.

The principle: tests, input spokes, and English aren't fungible with
COBOL and CSV. They're the *frame* the substrates are evaluated
inside. The UI should reflect that with dedicated, non-generated
content per tool — not a generic detail panel parameterized by the
tool's name.

### 3.5 Folder-level Run, root-level Run

Clicking a **folder** (not a tool) shows a folder detail panel with a
single **▶ Run all** button. It runs every tool under that folder in
order, with the same live tail.

Clicking the **project root** shows a project detail panel with **▶ Run
all** that runs everything under the project. This replaces the current
global "Build all" button.

### 3.6 Backend work

- `GET /api/effortless-tools/tree` — walks the active project's folder
  structure, parses each `effortless.json` it encounters, returns
  `{ folders: [{ path, tools: [...] }, ...] }`. Each tool entry has
  `name`, `installUrl`, `inputs`, `outputs`, `params`, plus a stable
  `id` for routing.
- `GET /api/effortless-tools/catalog?folder=<path>` — the "available to
  add" list filtered to tools sensible for that folder.
- `POST /api/effortless-tools/install` — writes a new entry into the
  appropriate `effortless.json`; refreshes the tree.
- `POST /api/effortless-tools/run` — body
  `{ scope: "tool"|"folder"|"root", id: ... }` → spawns the process
  scoped to that subset, returns a `runId`.
- `GET /api/effortless-tools/run/:runId` — Server-Sent-Events stdout
  stream so the UI can tail the build live without polling.

### 3.7 No more separate "Orchestration" tab

This design subsumes the previously planned dedicated Orchestration
tab. Tools have per-tool Run buttons, folders have Run-all buttons, the
project root has Run-everything, and every run streams its output
live. There's no orchestration concept left orphaned without a home.

---

## 4. Other open priorities

Listed core-behavior-first. UI polish is at the bottom (§4.5 onward).

### 4.1 Fix the `last_seen_rulebook_revision` auto-clear bug

Today every domain visit stamps `last_seen_rulebook_revision` to the
current revision immediately. So the moment a user opens a domain whose
rulebook changed, the "New since you were here" picker chip clears
before they've read why they were notified.

Fix: split the visit-stamp from the seen-stamp. Visiting writes only
`last_route` + `last_visited_at`. The revision is stamped when:
- The user clicks "Mark as seen" on the welcome-back diff, OR
- They dismiss the welcome-back banner, OR
- ~30 seconds elapse on the page suggesting they've had time to read.

This is a correctness bug, not a feature.

### 4.2 Substrate witness panel — inline, not navigate-away

The hero substrate chips currently navigate to Effortless Tools. The
vision wants them to **expand inline** into a panel showing the *same
question* answered in each substrate's dialect — *"how many projects
are awaiting approval?"* as a SQL query, a Python expression, an OWL
axiom, all returning the same number. This is where the
"substrate-independent" claim becomes *felt*.

v1: hand-authored `witness_sample` per substrate in the `substrates`
row of the rulebook's `__meta__` table. v2: live-execute against each
substrate.

### 4.3 Welcome-back journal diff

Today `last_seen_rulebook_revision` is recorded but never displayed.
The journal area only shows `journal_seed`.

Target: when the user lands on a domain whose current revision differs
from their last-seen revision, the journal shows the **real diff** —
*"Since your last visit on Tuesday, two new projects were added, the
approval rule's `explanation_rich` was rewritten, and three calculated
fields fired."* Server endpoint `GET /api/rulebook/diff?from=<sha>`
returns a structured diff (entities changed, rows added/removed, rules
touched). Fall back to `journal_seed` only when there's no diff.

### 4.4 customer-fullname — restore or retire

[customer-fullname-rulebook.json](rulebook-examples/customer-fullname/effortless-rulebook/customer-fullname-rulebook.json)
is `{}` (3 bytes) at HEAD. The previous incarnation at commit `2ab5b78`
had a real `Customers` table with the `FirstName / LastName / FullName`
calculated field. Two options:

1. **Restore** from `2ab5b78` (or re-author using ACME's `Client.FullName`
   as reference), then author the `__meta__` table.
2. **Retire** — remove the directory, delist from the picker; the
   minimal-calculated-field demo lives in `acme-corporation`'s
   `Client.FullName` already.

Decision blocks one demo and shouldn't block anything else.

---

### UI polish (below the core-behavior line)

### 4.5 Viewer surface parity

Viewer routes (`/viewer`, `/viewer/domains`, `/viewer/:domain`) still
use the old `.cards` grid and the pre-reception-desk overview screen.
Wire them to use `DomainTile` + `PickerChips` (viewer accent color), and
swap the overview screen for a read-only reception desk
(`canEdit={false}`, no scrubber, no Effortless Tools link in the footer,
comments panel in its place). Components already accept `canEdit`.

### 4.6 Bootstrap inline form (replace the instructions panel)

The picker's "Bootstrap a new one" chip expands today to an instructions
panel. Replace with an **inline form**: name, slug, motif, starter
template, one-line tagline. Submit creates
`rulebook-examples/<slug>/effortless-rulebook/<slug>-rulebook.json`,
registers in `RulebookFlavors`, navigates to the new domain's reception
desk. `POST /api/projects/bootstrap` does the filesystem work; no
`effortless build` runs until the user fires one from the new Effortless
Tools tree.

### 4.7 Tour mode rewind step

Tour mode currently walks use cases → entities → rules → substrates →
closer. Add a step that rewinds the TimeScrubber to the oldest commit,
holds one beat to show the rule resolving against historical state,
then snaps back to "now" before the closer. The time-travel claim
becomes *felt* without the user having to discover the scrubber on
their own.

---

## 5. The test (unchanged)

When the user closes the tab, they should be able to describe ACME
Corporation to a colleague in one sentence. If they can't, the page
failed.

The harder test: if the user opens *any two domains* and they feel the
same, the page failed.

This passes for every demo rulebook in the repo. The `__meta__`
table — the load-bearing input for this test — is authored in every
`<project>-rulebook.json` under `rulebook-examples/`.

---

## 6. Honest shortcuts already in production

Called out so they aren't filed as bugs:

- **Time-travel scrubber** rewinds by git commit, not arbitrary
  timestamp. No per-cell history exists.
- **Rules glow** marks all important rules with the rulebook's
  most-recent commit timestamp because there's no per-rule fire
  telemetry yet. The pulse is real, the per-rule attribution is
  approximate.

Both are documented at the source. Replacing either with proper
bitemporal / event-stream infrastructure is a future project.

---

## Appendix A: Original §2.1–§2.7 spec (preserved, now built)

> Preserved verbatim from the pre-build version of this doc. The
> mechanics described below are all implemented — see the status table
> in §2 for the file:line evidence. A fresh agent reads this to
> understand the exact wire contracts and design intent before
> touching the Explorer.

### A.2.1 Left nav: the actual DAG, walkable

A tree representing real instances and their relationships — for an
order-processing domain:

```
Businesses                          ← top-level node, all businesses
├ Acme Corp
│  ├ Customers                      ← Acme's customers
│  │  ├ Jane Smith
│  │  │  ├ Orders
│  │  │  │  ├ Order #1042
│  │  │  │  │  └ Invoices
│  │  │  │  │     └ INV-2026-0117
│  │  │  │  └ Order #1051
│  │  │  └ Addresses
│  │  └ Bob Lee
│  │     └ …
│  └ Projects
│     └ …
└ Globex
   └ …
Customers                           ← top-level node, no filter: all customers across all businesses
Invoices                            ← top-level node, no filter: every invoice in the DAG
Orders                              ← same
```

Top-level nodes appear for **every entity** (an unfiltered view of that
entity across the whole DAG), AND as **nested children** wherever the
DAG places them (a business's customers, a customer's orders, an order's
invoices, …). Clicking any node — at any depth — lets the user
interactively explore that slice of the DAG.

> **FUTURE SELF HINT — list-node UX.** When the selected node is a list
> (e.g. *Customers under Acme Corp*, or the top-level unfiltered
> *Customers*), the right pane should eventually grow full
> sort / filter / group / facet behavior — the planned long-term UX for
> any list view in the explorer. Not now. Capturing it here so we don't
> re-discover it later; the minimum to ship the Explorer is a usable
> grid with the schema visible.

### A.2.2 Right pane: entity header + DAG tabs

Clicking a **specific entity instance** (e.g. *Jane Smith*, or *Order
#1042*) shows a header for that entity, with **tabs underneath** that
navigate to the different sub-elements in the DAG for this row — Orders,
Invoices, Addresses, etc. The tabs are derived from the rulebook (the
relationships hanging off this entity), not hand-authored.

### A.2.3 Schema and data shown as combined metadata

The right pane is not "data grid with a separate schema sidebar." It's a
single surface where the column header **is** the schema entry: hover to
reveal the field's type / formula / description; double-click to expand
the column into a schema-detail strip; click a cell to see provenance
(raw input vs. lookup vs. calculated, and the formula that produced it).
Many UX models can hang off this — the principle is *schema and data
are the same metadata, surfaced together*, not two separate views the
user has to switch between.

### A.2.4 Routes & consolidation

- `/developer/:domain/explorer` is the single home. `/data` and
  `/entities` redirect here.
- `/explorer` — root node selected; nothing on the right yet (or the
  domain overview).
- `/explorer/:path` — `path` encodes the DAG walk
  (`businesses/acme-corp/customers/jane-smith/orders/1042`). Both list
  nodes and instance nodes round-trip through the URL so reception-desk
  scrollers and Cmd-K row matches deep-link to the exact node.
- AppNavigation in the project rulebook surfaces a single **Explorer**
  entry; the old "Entities" / "Data" / "Explorer" entries collapse into
  it.

### A.2.5 The two-layer model the API hangs off

The Explorer reads and writes against **two stores with two roles**:

| Layer  | Lives in                       | Owns                                            | Edit lifecycle           |
| ------ | ------------------------------ | ----------------------------------------------- | ------------------------ |
| Schema | `<domain>-rulebook.json`       | Entities, fields, formulas, FK relationships    | Edit → trigger rebuild   |
| Data   | Editor Postgres (`erb_<domain>`) | Live business rows                            | Edit → write-through     |

Rule of thumb: if the URL path encodes a row, it's data work and hits
Postgres. If the URL encodes a column header or formula, it's schema
work and hits the rulebook JSON.

**Rebuild contract.** Editing the rulebook schema means the generated
SQL changes. The editor Postgres DB is therefore **derived** — it can
be dropped at any moment and rebuilt from the rulebook because the
rulebook's `data` arrays are the durable SSoT for the rows too. The
rebuild is mechanical:

1. Server PATCHes the rulebook JSON.
2. Server runs `effortless build` from inside the project — regenerates the `00-create-tables.sql` / `02-populate-data.sql` (etc.) files.
3. Server drops `erb_<domain>`, recreates it, executes the generated SQL in order. The rulebook's `data` arrays are the seed — so the rebuilt DB IS "what it was moments before, but with the new model."
4. Server verifies row counts, unfreezes the UI.

**Write-through invariant.** For data edits: write to Postgres **and**
to the corresponding `data` array inside the rulebook JSON, in one
transaction. This is the existing portal pattern (see the platform
rulebook's `WriteThroughInvariant` table). The Explorer's data-mutation
endpoints reuse it.

### A.2.6 URL path encoding (precise)

The Explorer's URL is a literal DAG walk. The React router parses it;
the server's `/api/explorer/node` endpoint accepts the same string.

```
/explorer                                                                ← root
/explorer/<Domain>                                                       ← domain overview
/explorer/<Domain>/<Entity>                                              ← unfiltered list of every Entity row
/explorer/<Domain>/<Entity>/<id>                                         ← one instance
/explorer/<Domain>/<Entity>/<id>/<ChildEntity>                           ← list of children scoped under the parent
/explorer/<Domain>/<Entity>/<id>/<ChildEntity>/<childId>/<Grandchild>... ← deeper
```

Encoding rules:

- Segments after `<Domain>` alternate **entity name** → **instance id** → **entity name** → **instance id** → …
- Entity names are PascalCase, exactly as they appear in the rulebook.
- Instance ids are the value of the entity's `Name` field (ERB
  convention — every entity has a unique-within-entity Name). Name
  collisions fail loudly per the no-fallbacks doctrine in
  [CLAUDE.md](CLAUDE.md); there is no `?byPk` escape hatch. This is a
  closed-platform demo — Name uniqueness is by construction.
- **Odd number** of post-domain segments → **list node**.
- **Even number** → **instance node**.

Round-trips: any node can be bookmarked, linked from Cmd-K, deep-linked
from a reception-desk scroller, opened in a new tab.

### A.2.7 Backend API endpoints

#### `GET /api/explorer/tree?domain=<slug>&maxDepth=<n>` — drives the left nav

Response:

```json
{
  "domain": "acme-corporation",
  "rulebookRevision": "39c2a5b...",
  "topLevel": [
    {
      "entity": "Client",
      "rowCount": 3,
      "important": true,
      "children": [
        { "entity": "Projects", "rowCount": 6, "viaFk": "ClientId" }
      ]
    }
  ]
}
```

`topLevel` is every entity in the rulebook. `children[].viaFk` names
the FK column that scopes the child under the parent. `maxDepth`
(default `1`) caps lazy expansion.

#### `GET /api/explorer/node?path=<encoded>&page=<n>&pageSize=<n>` — the workhorse

Returns one of two shapes based on path parity (odd = list, even = instance).

**List node** (odd-length path):

```json
{
  "kind": "list",
  "entity": "Customers",
  "scopedBy": { "Business": "acme-corp" },
  "schema": [
    { "name": "Name",     "datatype": "string", "type": "raw",        "isPk": true },
    { "name": "FullName", "datatype": "string", "type": "calculated", "formula": "=CONCAT(...)" }
  ],
  "rows": [ { "Name": "jane-smith", "FullName": "Jane Smith" } ],
  "totalCount": 47, "page": 0, "pageSize": 50
}
```

**Instance node** (even-length path):

```json
{
  "kind": "instance",
  "entity": "Customers",
  "id": "jane-smith",
  "schema": [ "...same shape..." ],
  "row": { "Name": "jane-smith", "...": "..." },
  "tabs": [
    { "entity": "Orders", "viaFk": "CustomerId", "rowCount": 4 }
  ]
}
```

`schema` rides in the same payload as `rows`/`row` — they are not two
separate fetches (§A.2.3).

#### `GET /api/explorer/cell?domain=&entity=&id=&field=` — provenance

```json
{
  "value": "Jane Smith",
  "kind": "calculated",
  "formula": "=CONCAT({FirstName}, ' ', {LastName})",
  "inputs": [
    { "field": "FirstName", "kind": "raw", "value": "Jane" },
    { "field": "LastName",  "kind": "raw", "value": "Smith" }
  ],
  "explanation_rich": "<p>The customer's full name, derived...</p>"
}
```

`kind` ∈ `raw | lookup | calculated | aggregation`. For lookups:
`inputs[].entity`/`inputs[].id` identify the target row. For
aggregations: `inputs[]` is the contributing rows.

#### `PATCH /api/explorer/instance/:entity/:id` — data-row edit (no rebuild)

Body `{ "field1": "newValue", ... }`. Validates against schema, runs
TXN on `erb_<domain>` UPDATE + rulebook JSON mutate, commits both or
ROLLBACK pg if rulebook write fails. Returns updated row.

#### `POST /api/explorer/instance/:entity` — insert (no rebuild)

Full row payload, raw + forward-FK fields only. Same transactional
shape as PATCH.

#### `DELETE /api/explorer/instance/:entity/:id?cascade=<bool>`

`cascade=false` (default): returns 409 + referrer list if any FK
referrers exist. `cascade=true`: walks forward FKs and deletes
referrers first (bounded recursion).

#### `PATCH /api/explorer/schema` — **triggers a rebuild**

```json
{ "pointer": "/Customers/schema/3", "value": { "name": "Phone", "datatype": "string", "type": "raw" } }
```

`pointer` is RFC-6901. Allow-list:
- `/<Entity>/schema`, `/<Entity>/schema/<i>`, `/<Entity>/schema/<i>/<key>`
- `/<Entity>/Description`, `/<Entity>/important`
- Entity create: pointer `/`, body `{ name, definition }`
- Entity delete: separate `DELETE /api/explorer/schema?entity=<name>`

Returns immediately with `{ rebuildId, status: "pending", streamUrl }`.

#### `POST /api/explorer/rebuild` — manual rebuild

Same response shape; no schema change. For recovery / after a direct
JSON edit.

#### `GET /api/explorer/rebuild/:id/stream` — SSE

```
event: phase   data: {"phase":"effortless_build","msg":"regenerating SQL"}
event: phase   data: {"phase":"create","msg":"01-drop-and-create-tables.sql"}
event: phase   data: {"phase":"populate","msg":"05-insert-data.sql"}
event: phase   data: {"phase":"constraints","msg":"99-fk-constraints.sql"}
event: phase   data: {"phase":"verify","msg":"row counts match (1842 rows)"}
event: done    data: {"durationMs": 4732, "rowsLoaded": 1842}
```

On error:

```
event: error   data: {"phase":"verify","code":"VERIFY_FAILED",
                      "msg":"row-count verify failed (2 mismatches)",
                      "mismatches":[{"entity":"Customers","db":3,"rulebook":5}]}
```

A failed rebuild **does not auto-revert** (§2.8 decision 3). The user
sees the error, the live `git diff` of the rulebook JSON
(`GET /api/explorer/rulebook-diff`), and a "Revert via git checkout"
button (`POST /api/explorer/rulebook-revert`) that runs explicitly,
never silently — per CLAUDE.md "Never silently revert a rulebook JSON."
