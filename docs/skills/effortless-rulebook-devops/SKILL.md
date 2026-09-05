<!-- DERIVED ARTIFACT — DO NOT EDIT BY HAND -->
<!-- Source: https://raw.githubusercontent.com/effortlessapi/effortless-claude/main/skills/effortless-rulebook-devops/SKILL.md -->
<!-- Mirrored by: docs/skills/clone-skills.sh -->
<!-- Update: cd effortless-platform && effortless clone-skills -->

---
name: effortless-rulebook-devops
description: >
  Best-practice dev-ops for an Effortless Rulebook (ERB) project: a rulebook-first
  pipeline promoted across up to **four tiers** — **dev** and **staging** on
  localhost (always fake/mock data), **beta/UAT** and **production** on a live
  remote server — governed by ONE migration ledger, a version that is always
  **derived** (never stored), and two independent axes (**DB migration version**
  + **code build**). Ships a **Deployment Management** admin console (the migration
  × environment matrix, drift/version grading, ERBVersions changelog, and the whole
  action rail), an environment/DB switcher, and the guardrails that keep staging &
  production reachable ONLY through ledger-tracked migrations. Triggers: "set up
  rulebook dev-ops", "deployment management page", "dev/staging/beta/production
  model", "promote a release", "cut a version / take a code snapshot", "migration
  matrix", "derive a migration from the diff", "environment switcher", "000-seed
  migration", "push code to production".

  This skill is HEAVY and meant to be invoked ONCE per project to scaffold the whole
  model; afterwards the project's Deployment Management page + the day-to-day
  promotion protocol drive it. Most projects use only 2 or 3 tiers — the model
  scales down cleanly (see §1).

  **Scope (load gate):** Effortless projects only — project root must contain
  `effortless.json` AND a CLAUDE.md identifying the project as ERB methodology.
  This skill DOES manage remote environments (beta/production on a live box) as a
  first-class concern; it also supports an all-localhost rehearsal posture for
  projects that have not gone remote yet (see §2). Do NOT load for non-ERB projects.
audience: customer
---

# Effortless Rulebook Dev-Ops — best practices

**One ledger. One direction. Two axes. Up to four tiers.**

This is the canonical dev-ops model for a rulebook-first ERB project. It makes the
whole lifecycle — from a rule change in the rulebook, to a rebuilt dev DB, to a
hand-derived migration, to a promoted release on a live production box — **real,
visible on one admin page, and impossible to fake.**

> **The one sentence to remember:** the **rulebook → dev** hop is a *generated
> mirror* (drop + reseed), and **dev → staging → beta → production** is a chain of
> *additive, human/agent-authored migrations* over *one derived ledger*. Nothing is
> ever auto-synced between two live databases, and staging/beta/production are
> **only ever** moved by a migration.

> **The second sentence, which halves the work:** a migration carries **only
> table and column changes**. Views, `calc_*` functions, RLS policies and role
> schemas are *derived* — they hold no data, they are a pure function of the
> rulebook, and the rulebook ships in the same commit. So they are **dropped and
> recreated from the rulebook on every promotion**, in every tier including
> production, by one generated script (`update-effortless-schema.sql`).
>
> Hand-migrating a view is not merely redundant — it is the largest single source
> of promotion failures. A migration full of `DROP VIEW` / `CREATE VIEW` DDL is
> doing by hand, fallibly, once per release, what one generated script does
> correctly every time. **If your migration contains view or function DDL, delete
> it and re-run the derived-layer script instead.**

Everything below is a consequence of that sentence.

---

## 0. The spine (read this first — every rule descends from it)

```
   ┌──────────────── RULEBOOK  (HEAD, in git) ────────────────┐
   │  effortless-rulebook.json  +  admin portal (MOCK data)   │
   └───────────┬──────────────────────────────────────────────┘
               │  effortless build → reset-rulebook-db.sh
               │  LOCALHOST ONLY · DROP + RESEED · "the effortless loop"
               │  (dev's rulebook-owned config = the rulebook, row-for-row)
               ▼
        ┌───────────┐   derive     ┌───────────┐   apply     ┌──────────┐   apply    ┌────────────┐
        │    DEV     │  migration   │  STAGING  │  migration  │ BETA/UAT │  migration │ PRODUCTION │
        │ localhost  │ ───────────► │ localhost │ ──────────► │  remote  │ ─────────► │   remote   │
        │ mock data  │              │ mock data │             │ prod copy│            │ LIVE data  │
        │  = HEAD     │             │ migs only │             │ migs only│            │ migs only  │
        └───────────┘               └───────────┘             └──────────┘            └────────────┘
        reset-rulebook-db.sh        tables never dropped      tables never dropped    tables never dropped
        (the loop)                  own DB, dev's code         own DB + own code       own DB + own code

        Every tier, every promotion, also runs update-effortless-schema.sql:
        views / calc_* / RLS / role schemas are DROPPED + RECREATED from the
        rulebook. Only TABLES are migrated. Derived objects are never migrated.

        ◄──────────── restore (refresh a soak env from prod) ─────────────
        prod → beta/UAT is EXPECTED; prod → staging is allowed. Never the reverse.
```

Two things travel down this chain, and they are **independent axes**:

- **DB migration version** — how far the *database schema/config* has been promoted
  (the ledger).
- **Code build** — which *app build* is running against that database (a git sha).

A tier can be current on one axis and behind on the other. The Deployment
Management page shows **both, side by side, for every tier** (§6, §7).

---

## 1. The four tiers (and scaling down to 2 or 3)

| Tier | Where | Data | DB moved by | Code |
|---|---|---|---|---|
| **dev** | localhost | **mock/fake**, a live mirror of the rulebook | `init-db.sh` (DROP + reseed) — **never migrations** | HEAD (`BUILD_INFO.sha`) |
| **staging** | localhost | **mock/fake** | `apply.sh` (ledger migrations) **only** | = HEAD **by construction** (it's dev's code pointed at the staging DB — no separate deploy) |
| **beta / UAT** *(optional)* | **remote** live server | usually a **stale copy of production** (restored periodically) | `apply.sh` **on the box** | its **own deployed build** |
| **production** | **remote** live server | the **live** system, real data | `apply.sh` **on the box** | its **own deployed build** |

**Most projects do not need all four.** The invariants are identical at any count —
you are only adding columns to the same matrix:

- **2 tiers — dev + staging (all localhost).** Rehearse the entire promotion loop
  locally before you ever stand up a remote. This is the right *starting posture*
  (§2).
- **3 tiers — dev + staging + production.** One remote. Staging is the localhost
  rehearsal; production is the live box. No soak tier.
- **4 tiers — add beta/UAT.** A remote soak environment between staging and
  production, typically a recent restore of production, where real-shaped data
  meets the next release before it goes live.

Design the page and scripts for four; **light up only the tiers a project actually
has.** Adding a tier later is a config change (a new env entry + connection), not a
rearchitecture.

---

## 2. Two deployment postures — pick per project, no single right answer

Present **both** to the user and let the situation decide; neither is "correct."

- **Posture A — localhost rehearsal first.** dev + staging (and even a stand-in
  "production") all on localhost. You prove the loop — derive a migration, apply to
  staging, watch it go green, promote — **without a remote existing yet**. When the
  project graduates, "production" simply becomes a real remote connection string +
  the remote plumbing in §8; *nothing about the loop changes.* Best for new
  projects, demos, and de-risking before infra exists.

- **Posture B — remote from the start.** dev + staging on localhost, beta/production
  on a live box, wired for SSH-tunnelled apply + code push from day one. Best when
  the remote already exists and real promotion is the daily reality.

The agent chooses based on whether a remote box exists yet. The skill scaffolds the
same artifacts either way; Posture A just leaves the remote connection strings
pointing at local stand-ins until you flip them.

---

## 3. The invariants (these never bend — they are why the model is trustworthy)

1. **`init-db.sh` only ever touches `dev`, only on localhost.** It DROPs and reseeds
   from the rulebook. It must **hard-refuse any non-localhost host** and any DB name
   that is not the dev DB. Staging, beta, and production are **never** init-db'd —
   not even locally, not ever.

2. **Staging, beta, and production move ONLY by `migrations/apply.sh`** — ledger-
   tracked in each env's own `public.schema_migrations`, run-once-each, applied in
   lexical order. **The SAME runner and SAME migration files** target a local staging
   DB or a remote production box. There is **no other write path** into these
   environments — no admin "Save to staging", no ad-hoc SQL, no auto-sync. (§4.)

3. **dev = HEAD, always, by construction.** HEAD is the **newest migration FOLDER on
   disk** (`postgres/migrations/<NNNN>-*/`). The folders in git ARE the ledger and dev
   physically holds every one, so dev = HEAD by definition. **HEAD is NOT derived from
   the rulebook `promotion_migrations` catalog** — that catalog is a *mirror* of the
   folders (it carries per-migration metadata: idempotency, refresh-file, kind) and it
   can LAG the folders. Deriving HEAD from the mirror is the "dev behind staging" bug:
   a migration folder gets created on disk and applied to staging, but its catalog row
   is never added to the rulebook, so a catalog-derived HEAD freezes one release behind
   while staging reads the newer id from its own `schema_migrations`. **Register every
   migration in the rulebook so the catalog mirrors the folders** — a folder with **no
   catalog row is a broken build, surfaced LOUDLY, never hidden** (and it still counts
   toward HEAD, because HEAD reads the folders, not the mirror).

4. **The version is DERIVED from the ledger on every read — never stored as
   authority.** HEAD = the newest migration **folder on disk**; an env's version = the
   newest migration in *its own* `schema_migrations`. The `promotion_migrations`
   catalog and each env's `schema_migrations` are read/asserted **against the folders**,
   never treated as the authority for what migrations *exist*. Any *stored copy* of "the
   version" — `project_meta`, an `erb_versions` number, **or the catalog table used as
   the HEAD authority** — is exactly what drifts (the frozen-HEAD bug reappears wherever
   a hand-maintained copy shadows the folders). `erb_versions` is a **human changelog
   only** (release label + message); a missing row degrades to the migration id, never a
   stale number.

5. **Monotonic order: dev ≥ staging ≥ beta ≥ production, always.** You cannot promote
   what is not already upstream. "Staging behind while production is ahead" is
   *impossible*; the snapshot emits an **`orderViolation`** and the page shows a loud
   alert instead of two contradictory cards.

6. **dev is a MIRROR, not a database you curate.** After `init-db`, dev's rulebook-
   owned config equals the rulebook **row-for-row, field-for-field** — insert
   missing, update differing, **delete** orphaned. If dev ever contradicts the
   rulebook, that is a *pipeline bug*; fix the pipeline, never hand-patch dev.

7. **Operational data never rides the rails.** Claims, documents, blobs, hydrated
   checklists, assistant turns, imported corpora as *operational rows* — never
   written back to the rulebook, and **never** included in a promotion migration.
   Migrations carry **schema + config/reference data only**.

8. **The Deployment Management page runs from `dev` only.** Its dev-only endpoints
   are inert/404 when the running copy is a deployed remote. dev is the *cockpit*;
   it reaches out to the other tiers to inspect and promote them (§7).

---

## 4. THE ONLY WAY staging/beta/production change is a migration

This is the load-bearing rule of the whole model, so it gets its own section.

> **Staging, beta, and production are updated by migrations — full stop.** They are
> **viewed, managed, and driven** through the admin portal's Deployment Management
> page, but the *only mutation* that ever reaches them is a ledger-tracked
> `apply.sh` migration. There is **no** "Save to staging DB" / "Save to production
> DB" direct-write anywhere. If you find one, delete it.

The admin portal's relationship to each tier:

- **Pointed at dev** → edits write to the dev DB (fast working copy), and **SAVE**
  exports them back into `effortless-rulebook.json`, then `effortless build` +
  `init-db` rebuilds dev from the now-updated rulebook. Rulebook is HEAD again.
- **Pointed at staging / beta / production** → the portal is **read-and-drive only**:
  you can *inspect* the tier, *see* its version and drift, and *trigger a migration
  or a code push* against it — but you cannot type a value into a grid and have it
  land in that database. The write path is the ledger, or nothing.

### Deriving a migration: diff to DISCOVER, author to DERIVE

Auto-diffing is a perfectly good way to *find out what changed* — **use it.** What
you must never do is *ship the diff as the migration.*

> **The diff proposes; you dispose.** Run a schema/config diff between dev and the
> target (or `git diff` the generated SQL, diff the rulebook JSON, `\d`/`\dv`, count
> config rows). Read it. Understand every hunk. Then **hand-derive** an `up.sql`
> that is *intentional, idempotent, correctly ordered, self-registering, and scoped
> to schema + config only.* The migration is a **derived artifact reviewed by a
> human or agent**, not a raw machine dump. Whether the delta was auto-detected or
> spotted by eye is irrelevant — the authored `up.sql` is what matters.

The canonical create-a-migration flow:

1. **Rulebook + dev.** Make the change in `effortless-rulebook.json` (SSoT);
   `effortless build` + `init-db` so **dev mirrors it** (dev = HEAD).
2. **Discover the delta.** Diff dev ↔ the target *live, right now* (schema fingerprint,
   `pg_dump --schema-only` side-by-side, config-table row counts, rulebook JSON
   diff, git diff of generated `00–05*.sql`). Auto-diff freely — it is an **input**.
3. **Derive the `up.sql` by hand** into `postgres/migrations/<NNNN>-<slug>/up.sql`:
   schema DDL, config/reference `INSERT … ON CONFLICT DO UPDATE` + targeted
   `DELETE`, RLS + grants, `security_invoker` options, comments — **idempotent**, and
   **operational data excluded**.
4. **Register in the rulebook ledger — SAME step as creating the folder, never a
   later cleanup (this is what advances dev/HEAD).**
   The instant a migration folder exists on disk it **MUST** have a matching
   `PromotionMigrations` row in `effortless-rulebook.json`. A folder without its
   rulebook row is a bug, full stop — **the rulebook is the SSoT and it can never be
   missing a migration that lives in its own tree.** So `cut-version.sh` writes the
   row for you (via `register-promotion-migration.mjs`); if you hand-author a folder,
   add the row in the *same* edit. Then `effortless build` + `init-db` so dev's
   `promotion_migrations` catalog mirrors the folder. **Registering in the rulebook is
   the ONLY thing that puts the migration in dev's catalog.** Do not confuse it with
   the `up.sql`'s own `promotion_migrations` INSERT: that self-register runs **only on
   `apply`** (staging/beta/production) — dev is *never* applied-to, so the up.sql
   INSERT never reaches dev. Also stamp an `erb_versions` changelog row (label +
   message).

   > **The Deployment page NEVER authors the rulebook.** It *reads* the ledger to
   > grade envs; it does not enumerate folders and back-fill missing
   > `PromotionMigrations` rows, and it must never offer to. A folder-without-a-row is
   > surfaced as a **broken build** so a human/agent fixes it *at the source* (add the
   > rulebook row + rebuild) — because the fix is "put it in the SSoT," and only the
   > migration author knows the metadata (kind, idempotency, description). Building
   > reconcile-into-the-rulebook logic into the page re-introduces exactly the
   > second-source-of-truth the ledger model exists to kill. **If a migration is on
   > disk but not in the rulebook, add it to the rulebook — do not teach the page to
   > paper over it.**
5. **Promote.** `apply.sh staging` → run tests → (only when explicitly asked, and
   only after staging is green) `apply.sh beta` / `apply.sh production`.

### The three data classes — keep them apart

| Class | Example | Path to dev | Path to staging/beta/prod |
|---|---|---|---|
| **Rulebook config** | nav, roles, permissions, fields, state machines, glossary, models | generated seed (`05-insert-data.sql`) → dev | **hand-authored config upserts/deletes in a migration** |
| **Deliberately-omitted datasets** | large reference corpora, pre-hydrated fixtures | **data-injection migrations** re-applied to dev | included **only if** that dataset is meant to exist on the target |
| **Operational data** | live claims, documents, blobs, assistant turns | never seeded; imported at runtime | **never** — stays as-is on the target |

**Never put a rulebook-owned config table into a data-injection migration**, and
**never** put operational data into any migration. Config = rulebook → seed → dev;
promotion = hand-authored migration.

---

## 5. The `000-seed-rulebook` genesis migration (generated ONCE)

`migrations/000-seed-rulebook/up.sql` is the **one-time genesis**: the entire
init-db schema stack (tables, views, functions, RLS, grants — schema, not
operational rows), written idempotently, so an empty database + `000-seed` + every
later migration replays to the current dev schema. This is what lets a brand-new
staging/beta/production be **built from nothing** by the same `apply.sh` runner.

> **Generate it once, then never regenerate it.** From genesis forward, *every* delta
> between dev and a downstream tier — whether auto-detected or noticed by a human or
> AI agent — is handled by a **new additive migration**, never by re-dumping dev over
> the seed. There is no "rebaseline the seed" step; a regenerated frozen snapshot is
> the drift anti-pattern this whole model exists to prevent. `000-seed` is history;
> `0001`, `0002`, … are the future.

Verify the guarantee right after generating it: apply the ledger to a fresh empty
scratch DB and confirm its **canonical schema hash** equals dev's (§6). If that
passes, "build any tier from nothing by replaying migrations" holds.

---

## 6. The Deployment Management page (the crown jewel — full spec)

This page is the reason the model is *usable*. Build it thoughtfully; a lot of the
value of this skill is here. It is the **single console** for the entire deploy
lifecycle. (Formerly you might have called it a "database manager" — **Deployment
Management** is the right name: it manages *deployments*, of which DB migrations are
one axis and code builds the other.)

> **The layout is a ROW OF ENVIRONMENT CARDS — not a bare table.** The primary
> view is one **card per tier** (dev · staging · [beta] · production), each with
> both version axes, a drift-colored progress bar, a reachability-first status
> block, and its own action buttons (Bring to HEAD · Drift report · Run tests ·
> Push code). The migration×env *table* is **secondary** — put it in a
> collapsible "Details" section **below** the cards. A page that renders only the
> flat matrix table is the failure mode this skill exists to prevent (it looks
> like a 1990s admin screen). **Copy `reference/devops.css` verbatim and import
> it** — a card layout with no stylesheet still looks unfinished. The real
> `EnvCard` component + page shell + CSS are in `reference/templates.md` →
> "Client — the layout is THREE ENV CARDS." Build to that, out of the gate.

### 6.1 Purpose & motivation (why it exists)

- **Make promotion legible.** At a glance: what version is dev, staging, beta, prod
  on — on *both* axes — and exactly what a "promote" or "push code" will do next.
- **One source of truth, zero reconciliation.** Everything on the page is
  **computed from the ledger** on every read. There is no second "version" state to
  keep in sync, because a stored copy is what drifts.
- **Turn "drift" into a first-class, visible signal**, not a surprise you discover in
  production.
- **Encode the guardrails in the UI** so the safe path is the easy path: you
  physically cannot promote to production before staging is green, and the page tells
  you the exact shas a code push will move.

### 6.2 The one-ledger principle (non-negotiable)

The page has exactly **one** source of truth: the **migration ledger** — the
`postgres/migrations/<NNNN>-<slug>/` **folders** (which define HEAD) plus each
environment's own `public.schema_migrations` (which define that env's version).
**Everything displayed is derived from the folders + each env's `schema_migrations`.**
The `promotion_migrations` **catalog table is a metadata MIRROR of the folders**
(idempotency / refresh-file / kind), **not a second ledger** — the page must enumerate
the folders and LEFT-JOIN the catalog for metadata, never *list the catalog and stat
the folders*, or a folder with no catalog row goes invisible and HEAD freezes behind an
env that applied it. Do **not** introduce a stored version/`project_meta`/`erb_versions`
/`promotion_migrations`-catalog-**as-authority**; that is the frozen-HEAD bug. A folder
lacking a catalog row is flagged as a **broken build**; `erb_versions` is a human
changelog (label + message) shown alongside, never the authority.

### 6.3 Two axes, shown side by side, for every tier

Each environment card shows **both**:

- **DB migration version** — the newest migration id in that env's
  `schema_migrations`. dev = HEAD by construction.
- **Code build** — which app build is running:
  - **dev** = HEAD (`BUILD_INFO.sha`).
  - **staging** = HEAD **by construction** (staging has no separate deploy — it is
    dev's code pointed at the staging DB via the switcher).
  - **beta / production** = the **remote box's own running sha**, read from the box's
    build-stamp health endpoint. The build stamp is process-global, so read it via the
    reachable route; **unreachable → `unknown`, never a guess.**

**"Push code" ≠ "run a migration."** They are separate buttons because they are
separate axes. Pushing code (rsync working tree → box, install, build, restart)
advances a remote's **code** toward HEAD; it does **not** touch the database. The
button must state the exact shas it will move (`prodSha → headSha`).

### 6.4 The migration × environment matrix

- **Rows** = migrations oldest → newest. **Columns** = dev (HEAD) · staging · beta ·
  production (only the tiers that exist).
- **Cells** = `✅ applied · ⏳ pending · ⬜ not-built · ⚠ drift`.
- The **pending cells in the production column are literally "what a promotion will
  do"** — that is the page's most important teaching moment.
- Read each env's ledger from its **own** `schema_migrations`. **Never send a
  connection string to the browser** — the endpoint ships booleans, timestamps, and
  short shas only.

### 6.5 Monotonic invariant, enforced visibly

The page asserts **dev ≥ staging ≥ beta ≥ production**. If the snapshot ever computes
a downstream tier ahead of an upstream one, it emits `orderViolation` and the page
renders a **loud, blocking alert** — never two contradictory cards. **This includes any
env ahead of HEAD** (e.g. staging applied a migration whose folder dev's catalog lacks)
— check the whole chain `dev(HEAD) ≥ staging ≥ …`, not just `staging ≥ production`.
Because HEAD is disk-authoritative (§3, §6.2), "ahead of HEAD" should be impossible in
practice — every applied migration is a folder dev holds — so if it *does* fire, the
real fault is usually a folder missing its catalog row (broken build): surface **that**,
loudly, alongside the order alert. Promotion actions that would violate monotonicity are
disabled with an explanation.

### 6.6 Grading: fast signal always, deep check on demand — symmetric across tiers

- **Fast signal (routine matrix):** ledger position **+ a canonical schema
  fingerprint** — computed for **every** tier the same way (dev, staging, beta,
  production). The ledger says "the file ran"; the fingerprint says "the schema
  actually matches." Prefer the fingerprint where they disagree.
- **Deep check (on-demand "Drift report"):** a full `pg_dump` + config-data
  comparison, run for **both/all** targets when the user asks. **Never grade one tier
  deep and another cheap** — symmetry is what makes the matrix trustworthy.
- Use an **order-independent canonical schema hash** (normalize the dump: sort
  objects, strip volatile noise) — a raw `pg_dump` md5 reports false drift purely from
  statement ordering. If dev deliberately lacks certain constraints (e.g. few FKs),
  HEAD lacks them too — canonicalization must reflect dev's real shape, not an
  idealized one.

### 6.7 The action rail (every button, what it does, its guard)

| Action | What it does | Guard |
|---|---|---|
| **Take Snapshot / Cut Version** | Mints a new **ERBVersions** row labelled from the **most recent git commit message**, and scaffolds the next `migrations/<NNNN>-<slug>/` folder (empty `up.sql` for the agent to fill). See §7. | dev only |
| **Derive migration** | Runs a **read-only** dev↔target diff and opens the derived `up.sql` for authoring/review (diff proposes, you dispose — §4). Never writes the migration silently. | dev only |
| **Apply to staging** | `apply.sh staging` — runs the pending migrations against the localhost staging DB. | dev only |
| **Run tests** | Runs the conformance/UI suite against a chosen tier; the result gates promotion. | dev only |
| **Promote to beta / production** | `apply.sh` against the remote box (SSH-tunnelled). | **Requires staging green** + monotonic order; prints command + checklist; explicit confirm |
| **Push code** | `deploy-prod.sh code` — rsync working tree → box, install, build, restart. Moves the **code** axis only. | states exact `remoteSha → headSha`; explicit confirm |
| **Drift report** | On-demand deep pg_dump/config comparison for a tier (§6.6). | dev only |
| **Restore soak env** | Refresh **beta/UAT from a production snapshot** (expected, routine — §8). Restoring prod → staging is allowed too. | never the reverse; explicit confirm |

Promotion to a remote is **never a careless one-click**: it prints the exact command
and a checklist, and requires an all-green staging run first. Build the muscle memory
so the day you promote to a live box, it is routine.

### 6.8 Data contract & security

- The `/matrix` endpoint returns **only** environment names, applied/pending
  booleans, timestamps, short shas, and grade strings — **never** a connection
  string. Switching/reaching tiers happens **server-side**, from dev.
- All mutating dev-ops endpoints are **dev-only** (`404` when the running copy is a
  deployed remote) and admin-gated.

### 6.9 Requirements checklist (build to this)

- [ ] **Layout is a row of env CARDS** (not a bare table), styled with
      `reference/devops.css`; the matrix table is collapsed into "Details" below.
- [ ] One ledger; **version derived on every read**, never stored as authority.
- [ ] **HEAD = newest migration FOLDER on disk.** Enumerate the folders and LEFT-JOIN
      the `promotion_migrations` catalog for metadata (never list the catalog and stat
      the folders). A folder with **no catalog row** is flagged as a **broken build**,
      never dropped — and it still counts toward HEAD.
- [ ] **Both axes** (DB version + code build) shown per tier.
- [ ] Migration × env **matrix** with applied/pending/not-built/drift cells.
- [ ] **Monotonic** dev ≥ staging ≥ beta ≥ production, with a loud `orderViolation`.
- [ ] **Fast signal for all tiers**; **deep Drift report on demand** for all tiers.
- [ ] **Canonical, order-independent** schema fingerprint.
- [ ] Remote code build read from the **box's own health stamp**; unreachable →
      `unknown`.
- [ ] Full **action rail** (§6.7), each with its guard.
- [ ] **No connection strings to the browser**; all dev-ops endpoints **dev-only**.
- [ ] **No direct write to staging/beta/production anywhere** — migrations only.
- [ ] "Push code" clearly separated from "run migration," stating exact shas.
- [ ] Only the tiers a project actually has are lit up (§1 scaling).

---

## 7. Versions (ERBVersions) + "Take Snapshot"

**ERBVersions is a human changelog, never the version authority** (§3, invariant 4).
Each row is one cut release: a label, a message, and the migration it produced.

- **Create versions from the Deployment Management page** via a **"Take Snapshot" /
  "Cut Version"** action. It:
  1. Reads the **most recent git commit message** as the default version message
     (editable before confirming).
  2. Stamps a new `erb_versions` row (label + message + the migration id + build
     stamp + dev schema fingerprint at cut time).
  3. Scaffolds the next `migrations/<NNNN>-<slug>/` folder with an **empty `up.sql`**
     for the agent/human to fill (never an auto-diff dump).
- A missing `erb_versions` row must **degrade gracefully** to the migration id — it is
  a label, not authority. Never let its absence freeze or fabricate a version number.

Suggested schema (keep it in the migration-tracked DBs so each tier carries its own
changelog, or a dedicated `devops` schema — pick one, be consistent):
`erb_version_id, version, commit_message, migration_id, rulebook_build,
dev_schema_hash, created_at, created_by`.

---

## 8. The environment switcher / DB picker + remote reach

A small floating control (bottom-left), **rendered only on the localhost dev build**,
that re-points the running app at a chosen environment's database and **tints the
header per stage** so the active tier is unmissable (dev = green, staging = amber,
beta = blue, production = red).

### 8.1 Who can reach whom (case-specific, but the defaults)

| From ↓ / reach → | dev | staging | beta/UAT | production |
|---|---|---|---|---|
| **dev** (localhost cockpit) | ✅ | ✅ | usually ✅ | usually ✅ (read/diff) |
| **production** (isolated) | ❌ | ❌ | ❌ | ✅ self only |

- **Deployment Management runs from dev only.** dev is the cockpit; it reaches out.
- **dev usually can reach every remote** — it needs to `pg_dump`/diff them to figure
  out **what migrations the stack still needs** (this reach is read-oriented; the
  *write* to a remote is always an `apply.sh` migration, never a picker write).
- **production is isolated** — it cannot reach back into the others.
- **staging and beta/UAT reachability is case-specific** — wire per project.
- Remote reach is typically via an **SSH tunnel** established from dev.

### 8.2 Guards

- The switcher and all `/api/dev/*` endpoints are **inert/absent** unless the running
  copy is the localhost dev build.
- Switching happens **server-side**; the browser never receives a connection string.
- Pointing the app at a remote is for **inspection and driving migrations/code
  pushes** — never for typing edits into staging/beta/production (§4).

### 8.3 Remote operations (beta / production on a live box)

- **Apply a migration on the box:** rsync `postgres/migrations/` to the box, run
  `apply.sh` **on the box** (over SSH/tunnel). Same runner, same files as local
  staging.
- **Push code:** `deploy-prod.sh code` — rsync working tree → box, install deps,
  build the frontend, restart backend + reload the web server. **Code axis only.**
- **Refresh a soak env:** restoring **production → beta/UAT is expected** and routine
  (that is what keeps UAT a realistic, near-production rehearsal). Restoring
  production → staging is allowed. **Never** promote data the reverse direction, and
  never `init-db` a remote.
- **Read a remote's running build** from its own health stamp; unreachable →
  `unknown`.

### 8.4 Worked example — dev/staging/prod on `bases.effortlessapi.com` (no SSH box)

A proven concrete substrate for the remote tiers when you **don't want to stand up
your own Postgres box**: give each environment its **own bases base**. This keeps the
whole model (one ledger, `apply.sh`, derived versions) but replaces "SSH into a live
box" with "connect to a bases DB." (See the `effortless-bases` skill for the API.)

1. **One empty base per environment** — `source:"empty"` is DEPLOYED now, so no
   Airtable / PAT is needed:
   ```bash
   for ENV in dev staging prod; do
     curl -sS -X POST "$BASES/bases/register" -H "Authorization: Bearer $JWT" \
       -H 'Content-Type: application/json' \
       -d "{\"source\":\"empty\",\"displayName\":\"myapp-$ENV\",\"createERBTables\":false}"
   done
   ```
2. **Provision + get admin creds per base** — `POST .../auth/apply-privileges-template`
   (`returnCredentials:true`) creates the DB roles and hands back the connection string.
3. **Apply schema** — the same `rulebook-to-postgres` generated SQL (dev) / ledger
   `apply.sh` migrations (staging/prod) target each base's admin connection string.
   `init-db.sh` still only ever touches **dev** (§3); staging/prod bases move by
   migration only.
4. **Runtime env switch is server-side.** Keep a **server-side env registry** — a
   gitignored secrets file **or** an injected env var — keyed by env name (`dev` /
   `staging` / `prod` → that base's connection string). The app sends the *active env
   name* as a **request header**; the server resolves it to a connection string. **The
   browser never sees a connection string** (same rule as §8.2).
5. **PROD gets magic-links auth (RLS); dev/staging stay open.** Wire production's base
   with `setup-trusted-tenants` + RLS policies per **Learning 1 / `effortless-bases`**;
   leave dev and staging unauthenticated for fast iteration.
6. **Production ships as a Control Plane scale-to-zero workload** (`minScale:0`,
   `scaleToZeroDelay:3600`) — the prod app spins down when idle and cold-starts on
   demand, since its state lives in the bases DB, not in the workload.

> This is Posture B (§2) with bases as the "live box." Nothing about the ledger, the
> derived-version rule, or the Deployment Management page changes — only *where the
> remote tiers physically live*.

---

## 9. Test harness = the green-light gate

Wire the conformance/UI suite so it runs against **any tier from the same panel**, and
make an all-green **staging** run the gate for promotion:

- **dev** → green (it's HEAD).
- **staging** → for a DB-change release, **fails predictably before** the migration,
  **green after** applying it. That legible gap is the model proving itself.
- **beta/production** → still failing until the migration is promoted; green after.
- **Only an all-green staging run unlocks "Promote to production."** Surface the
  latest run per tier on the matrix so it doubles as a health monitor.

Prefer the ERB conformance suite emitted from the rulebook `_meta` as the backbone;
add UI smoke tests on top.

---

## 10. Guardrails (do not weaken a single layer)

- **`init-db.sh` is dev-only and localhost-only**, and DROPs — it must hard-refuse any
  non-localhost host and any non-dev DB name. It **never** appears in a deploy/CI/
  remote path. If it does, that is a bug.
- **Staging/beta/production move ONLY through `apply.sh`.** No direct writes, no
  auto-sync, no picker edits — migrations or nothing (§4).
- **Version is derived, never stored as authority** (§3). No `project_meta`/
  `erb_versions`-as-truth.
- **Monotonic dev ≥ staging ≥ beta ≥ production** — surface `orderViolation` loudly.
- **Grade all tiers symmetrically**; canonical order-independent schema hash.
- **No connection strings to the browser; dev-ops endpoints dev-only.**
- **Operational data never rides a migration or the rulebook.**
- **`000-seed` is generated once and never regenerated** — deltas become new
  migrations (§5).
- **Diff to discover, author to derive** — never ship a raw diff as the migration
  (§4).
- **Don't hand-edit generated `00–05*.sql`** — the rulebook is HEAD; edit
  `effortless-rulebook.json` and rebuild.
- **Agents execute the promotion protocol silently** — assess → author → apply to
  staging → test → (on explicit ask) production. Report outcomes (migration id, delta,
  test result); do not dump bash recipes at the user.

---

## 11. Seed your project CLAUDE.md with these invariants

Much of this model's safety comes from the invariants being written into the
**project's CLAUDE.md**, so every future session (human or agent) inherits them. When
scaffolding this skill into a project, propose adding a **"Dev-Ops"** section to the
project CLAUDE.md covering, at minimum:

- The **tier list** for *this* project (2, 3, or 4) and each tier's data nature +
  connection.
- **`init-db.sh` is dev-only/localhost-only and destructive** (DROP + reseed from the
  rulebook); it takes a pre-drop snapshot; it never touches a remote.
- **Staging/beta/production change ONLY by `apply.sh` migrations** — no direct writes,
  no auto-sync, no picker edits.
- **Migrations are hand-derived and reviewed** (diff to discover, author to derive);
  the forbidden auto-*generators* if any exist in the repo are listed as ❌ do-not-use.
- **Version is derived from the ledger**, never stored; `erb_versions` is a changelog
  only.
- **Two axes** (DB version + code build) and that **"push code" ≠ "run a migration."**
- **Monotonic** dev ≥ staging ≥ beta ≥ production.
- **The three data classes** (config / injected datasets / operational) and which path
  each takes.
- The **remote box** coordinates + the `deploy-prod.sh` / tunnel entry points, if any.

If the project already documents these, leave them; if a rule here is missing or
weaker in the project CLAUDE.md, **offer** the addition (don't silently rewrite it).

---

## 12. When to run this / preconditions

Run once, early, on an ERB + Postgres project. Confirm before heavy work:

- `effortless.json` + ERB CLAUDE.md + `effortless-rulebook.json` present.
- `effortless build` works and produces `00–05*.sql` + `init-db.sh`. (If not, run
  **effortless-setup-postgres** first.)
- Local Postgres reachable; you know the dev `DATABASE_URL`.
- Decide the **posture** (§2) and **tier count** (§1) with the user.
- If a remote is in play, you have box coordinates + SSH/tunnel access.

Then walk the phases as checkpoints: show the user what you're about to do, do it,
confirm it worked, move on. See `reference/templates.md` for copy-pasteable skeletons
of every script, endpoint, and UI piece.

---

## 13. What this skill creates (artifact map)

```
scripts/devops/
  _lib.sh                  # host guards (assert_localhost for dev/staging), PG_BIN, env URLs
  00-create-local-envs.sh  # create <db>_staging locally (NEVER init-db's it)
  cut-version.sh           # Take Snapshot: erb_versions row (git msg) + scaffold NNNN/up.sql
                           #   AND auto-registers the PromotionMigrations rulebook row via
                           #   register-promotion-migration.mjs — a folder is NEVER cut without
                           #   its rulebook ledger row. Then build + init-db seeds it into dev.
  register-promotion-migration.mjs  # upsert ONE PromotionMigrations row into the rulebook
                           #   (SSoT). The ONLY sanctioned way a folder→rulebook row is added;
                           #   the Deployment page never does this.
  analyze-diff.sh          # READ-ONLY dev↔target schema/config diff — discovery aid
  canonicalize-schema.py   # order-independent schema fingerprint
  apply.sh (wrapper)       # thin wrapper over migrations/apply.sh per target (local or remote)
  run-tests.sh <env>       # conformance + UI tests against one tier (the green gate)
  ensure-remote-tunnel.sh  # SSH tunnel to the beta/production box (remote postures)
  restore-soak-env.sh      # refresh beta/UAT from a production snapshot (expected)
  deploy-remote-code.sh    # rsync working tree → box, build, restart (code axis only)
migrations/
  000-seed-rulebook/up.sql # FULL init-db schema stack, idempotent — generated ONCE
  NNNN-<slug>/up.sql       # hand-derived additive migrations (self-registering)
  apply.sh                 # the one true runner (ledger-tracked, local or on-box)
backend/src/lib/devops/
  erb-version.ts           # env version DERIVED from the ledger (never stored)
  code-version.ts          # code-build axis (BUILD_INFO.sha; remote read from health stamp)
  env-registry.ts          # tier → connection resolution (server-side only)
app/admin/
  Deployment Management page  # two-axis cards + matrix + drift/version + action rail
  Versions view               # ERBVersions changelog
  environment switcher        # bottom-left, localhost-dev-only, per-stage header tint
server
  /api/admin/deployment/matrix # cross-tier ledger + canonical fingerprint (booleans/shas only)
  /api/dev/devops/*            # dev-only actions (switch, diff, apply, push-code, test, drift)
```

(`erb_versions` + `schema_migrations` live in the DBs, not the file tree.)

---

## 14. Relationship to other skills

- **effortless-loop** — the rulebook→build→consume cycle this page visualizes.
- **effortless-setup-postgres** — run first if the project has no dev DB yet.
- **effortless-sql / effortless-diagnostics** — view-reads, drift, and DAG health that
  back the matrix's canonical-fingerprint / `⚠ drift` signal.
- **effortless-magic-links** — the auth layer the admin portal and remote boxes sit
  behind.

See `reference/templates.md` for the script/endpoint/UI skeletons referenced above.
Treat them as starting points to refine per project.
