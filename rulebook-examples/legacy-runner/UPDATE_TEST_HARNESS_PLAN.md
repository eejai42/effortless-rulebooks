# UPDATE_TEST_HARNESS_PLAN.md

Replace the CLI-first `./start.sh` with a **repo-wide Example Explorer + Admin Portal**, and demote the existing CLI menu to `./cli-test-harness.sh`. The portal becomes the front door for browsing every example and toy, and for doing everything the CLI does **except anything Airtable** — this is a rulebook-only world now.

> **North star.** Each example (and toy) is now its own standalone, at-scale demonstration of how ERB works. The portal is an *example finder* first (Amazon-style faceted browse, per-example icons + markdown, consistent header, sortable/groupable dashboard) and a *CLI-parity admin* second (build / rebuild / clean / report per example, no Airtable). No mention of Airtable, base IDs, or PATs anywhere in the portal — not in UI, not in copy, not in routes.

---

## Ground truth this plan is built on (verified in-repo)

- **`./start.sh`** parses `--portal|--cli|--ci|--no-open|--port=N` and today **defaults to the CLI menu** (`orchestration/orchestrate.sh`); `--portal` dispatches to `run-web-portal.sh`.
- **`run-web-portal.sh`** kills + boots two processes: **ssotme-proxy on :4242** (Python, `effortless-platform/ssotme-proxy/server.py`) and the **admin portal on :7777** (Express, `effortless-platform/admin-portal/server.js`), builds the React/Vite client to `client/web/`, opens the browser. This is the infra we reuse.
- **Admin portal** = Express `server.js` (3654 lines) + **React 19 + Vite + React-Router v7** client. It already: reads the platform rulebook *and* per-domain rulebooks (two categorically separate reads), lists projects (`/api/projects`), serves logos, exports XLSX, does write-through PATCH/POST to entities, and has a git-history scrubber. **It contains no Airtable code today** — Airtable is CLI-only. Good: nothing to strip from the portal, only to *keep out*.
- **ssotme-proxy path restriction (BLOCKER):** `server.py` `resolve_request()` rejects any build whose cwd is not under `rulebook-examples/` — **`toy-rulebooks/` fails the `relative_to()` check**. Since the portal must run admin/build actions across **both** catalogs, this must be widened (Loop 4).
- **CLI menu options** (`orchestrate.sh`): `[B]UILD`, numbered single-transpiler runs, `[V]IEW`, `[W]EB`, `[P]ICK`, `[N]EW`, **`[I]MPORT` (Airtable — base-manager.py, PAT, baseId)**, `[C]LEAN`, `[D]EV-OPS`, `[A]LL-DOMAINS`, `[Q]UIT`. Only `[I]` and the Airtable bits of `[D]` are Airtable-coupled.
- **Metadata surface for facets/cards** lives in each rulebook's **`__meta__` table** (typed key/value rows): `tagline`, `motif`, `motif_palette {primary,accent,ink}`, `description_rich` (markdown), `use_cases[]`, `signature_rows[]`, `journal_seed`, `substrates[] {key,important,chip_label}`, plus domain-specific keys. Field-type counts (raw/calc/lookup/agg/relationship) and state-machine presence are computable from the schema. Per-example `effortless.json` `ProjectTranspilers` is the authoritative "tools used" list.
- **Existing catalog:** `docs/derived/domains.md` is generated from the platform rulebook's `RulebookDomains` table (26 rows: `DomainName`, `RelativePath`, `ComplexityLevel`, `TableCount`, `KeyFeatures`, `Purpose`, `ParentDomainId`, `ProgressionNote`). The explorer's catalog should **reconcile with / supersede** this, not fork from it.
- **Inventory today:** ~12 functional examples + ~22 functional toys. Known non-domains to exclude from the denominator (per CLAUDE.md): `volunteer-shift-scheduler-demo/`, `naked-claude-vs-effortless-claude/`. A couple of dirs (`naive-set-theory`, `veritasium-power-laws-and-fractals`) currently lack a functional rulebook — the indexer must **fail loud / mark clearly**, never silently skip.

---

## Architecture decision (locked)

- **Reuse the existing admin-portal** (Express :7777 + React/Vite). The Example Explorer becomes its **new landing page** (`/`). No new server, no second SPA. This keeps ERB dog-fooding its own portal.
- **Explorer + admin actions ship together** (not explorer-only). Per-example Build/Rebuild/Clean/Report actions stream output over SSE from day one, shelling to the *same* pipeline the CLI uses.
- **All four facet groups** are in scope: Domain shape · Substrates/tools · Theme/category · Maturity/depth.
- **CLI is preserved, not deleted** — moved verbatim (minus Airtable) to `./cli-test-harness.sh`, still driving `orchestrate.sh`, now aware of both catalogs.

### Target process model

```
./start.sh                     # NEW default = boot the portal (was: CLI menu)
  ├─ kills :4242 and :7777 (clean restart — start.sh's job, no kill ritual)
  ├─ boots ssotme-proxy        :4242   (widened to accept toy-rulebooks/ too)
  └─ boots admin-portal        :7777
        server.js  ── GET /api/catalog        → indexed examples+toys (facets baked in)
                   ── GET /api/catalog/facets  → facet vocabulary + counts
                   ── GET /api/example/:slug    → detail payload (meta, transpilers, links)
                   ── POST /api/example/:slug/build|rebuild|clean  → SSE stream (CLI parity)
                   ── (existing) rulebook read / write-through / history — unchanged
        client/    ── /            Example Finder (left facet rail + card grid + sort/group)
                   ── /e/:slug      Example detail (markdown, icon, transpiler chips, actions)
                   ── consistent <PortalHeader/> on every route
                   ── ZERO Airtable references

./cli-test-harness.sh          # the OLD CLI menu, minus [I]MPORT and Airtable dev-ops
```

`./start.sh --cli` remains a convenience alias that execs `./cli-test-harness.sh` (so muscle memory + `README`/skills that say "start.sh --cli" keep working).

---

## The Example Finder (the centerpiece)

**Left rail — faceted filter (Amazon-style), four groups:**

1. **Catalog** (radio, not checkbox): **Examples (default)** · Toys · Both. This is the top-of-rail toggle you asked for — defaults to examples.
2. **Domain shape** (checkbox, AND across, OR within): Tables `1–5 / 6–15 / 16–30 / 30+` · Has state machine(s) · Has aggregations · Has lookups · Has recursive/closure formula.
3. **Substrates / tools used** (checkbox): postgres · owl · cobol · xlsx · explain-dag · rulespeak · python · golang · entity-framework · … — vocabulary derived from the union of every `effortless.json` `ProjectTranspilers` (normalized) so the list is never hand-maintained.
4. **Theme / category** (checkbox): business · science · math · philosophy · games · workflow — from a `category` meta key (added where missing) with `motif` as a secondary tag; drives the card icon.
5. **Maturity / depth** (checkbox): Full example · Toy · Has web app · Conformance all-green · Depth minimal→deep.

Each facet value shows a **live count**; selecting narrows the grid; counts recompute against the current selection (standard faceted-search behavior). A "Clear all" + the active-filter chips row sits above the grid.

**Main pane — dashboard:**
- **Card grid**, one card per example: motif-tinted header (`motif_palette`), category **icon**, `DomainName`, `tagline`, complexity badge, table count, and up to 3 "important" substrate chips. Markdown is *not* rendered on cards (keep them scannable) — it lives on the detail page.
- **Sort**: name · table count · complexity · recently built. **Group by**: none · category · complexity · catalog.
- **Search box**: fuzzy over name + tagline + tables.

**Detail page (`/e/:slug`):**
- Header band (motif colors + icon + name + complexity/table-count).
- `description_rich` rendered as **markdown** (this is the "definitely markdown" requirement).
- Sections: Key Features · Use Cases (`use_cases`) · Signature Rows · Entity/DAG diagram (from README or computed) · **Substrates & tools** (chips from `ProjectTranspilers`) · Quick Links (README, rulebook.json, effortless.json, rulespeak/, web/ if present).
- **Admin action bar** (CLI parity, no Airtable): **Build** · **Rebuild** · **Clean** · **View Report** — each streams live output via SSE into a console drawer.
- Sidebar: progression (`ParentDomainId` + `ProgressionNote`), metadata (`journal_seed`, `dag_depth`), and the resolved per-example transpiler list.

**Explicitly NOT a CRUD view.** The finder and detail pages are curated, iconographic, narrative. The existing entity-editor CRUD screens remain reachable (for admin work) but are **not** the front door and are not what "explore the repo" surfaces.

---

## The catalog index (data contract)

A single indexer produces the payload the finder consumes. **Live-computed from the SSoT on request** (the rulebooks + `effortless.json` + filesystem are the source of truth — do not hand-maintain a parallel catalog, and do not cache without an invalidation contract; if perf ever bites, materialize it as a first-class platform-rulebook table, not a sidecar).

Per-example record:

```jsonc
{
  "slug": "traffic-ticket-contest",
  "catalog": "examples",                    // examples | toys
  "name": "Traffic Ticket Contest",
  "tagline": "...",                          // __meta__.tagline
  "category": "workflow",                    // __meta__.category (added where missing)
  "motif": "legal-pad",
  "motifPalette": { "primary": "...", "accent": "...", "ink": "..." },
  "tableCount": 55,
  "fieldTypes": { "raw": 689, "calc": 146, "lookup": 43, "agg": 21, "rel": 86 },
  "hasStateMachine": true,
  "hasAggregations": true,
  "hasClosure": false,                       // detected via formula self-reference scan
  "substrates": ["postgres","python","golang","explain-dag","rulespeak"], // from ProjectTranspilers
  "importantSubstrates": ["postgres","python"],  // __meta__.substrates important=true
  "hasWebApp": false,
  "hasRulespeak": true,
  "conformance": "green|red|unknown",        // from testing/_substrate_results.json if present
  "links": { "readme": "...", "rulebook": "...", "effortlessJson": "...", "rulespeak": "..." },
  "descriptionRich": "…markdown…",
  "useCases": ["..."],
  "signatureRows": [{ "entity": "...", "ids": ["..."] }],
  "progression": { "parent": "...", "note": "..." }
}
```

**Fail-loud rules:** a directory that looks like a domain but has no functional rulebook is emitted with `status:"broken"` and a reason — never dropped. Excluded non-domains (`*-demo`, `naked-claude-vs-effortless-claude`) are omitted by an explicit allow-rule, not by accident.

---

## Loops

### Loop 1 — Catalog indexer + `/api/catalog` + `/api/catalog/facets`
- Add an indexer module in `server.js` (or `admin-portal/lib/catalog.js`) that walks `rulebook-examples/*` and `toy-rulebooks/*`, reads each `__meta__` (via the existing typed-row → object fold, `rulebookMeta.js`), computes field-type counts + state-machine + closure flags from the schema, and reads `ProjectTranspilers`.
- Reconcile against the platform rulebook's `RulebookDomains` rows (complexity, progression) — that table stays the SSoT for those columns.
- Emit facet vocabulary + counts.
- **Exit check:** `curl :7777/api/catalog` returns every functional example+toy with correct table counts (cross-check the 5 headline domains: 38/29→current/22/55/3), broken dirs flagged, no Airtable keys anywhere.

### Loop 2 — Example Finder UI (left rail + card grid + sort/group/search)
- New landing route `/` with `<FacetRail/>`, `<CardGrid/>`, `<SortGroupBar/>`, `<SearchBox/>`, catalog toggle defaulting to **Examples**.
- Consistent `<PortalHeader/>` on all routes.
- Cards use `motif_palette` + category icon; chips for important substrates.
- **Exit check:** selecting "Has state machine(s)" narrows to traffic-ticket-contest et al.; toggling to Toys shows acme-llc/star-trek; counts recompute; zero Airtable strings in the built bundle (`grep -ri airtable client/web` → nothing).

### Loop 3 — Example detail page (`/e/:slug`) with markdown + links
- Render `description_rich` as markdown; sections + sidebar per the spec above; deep-links to README/rulebook/effortless.json/rulespeak/web.
- **Exit check:** every example resolves; markdown renders; links open; a broken domain shows its failure reason, not a blank page.

### Loop 4 — Widen ssotme-proxy to accept `toy-rulebooks/` (unblocks admin actions on toys)
- In `server.py` `resolve_request()`, accept cwd under **either** `rulebook-examples/` **or** `toy-rulebooks/` (compute the domain from whichever root matches; keep the fail-loud error for anything under neither).
- **Exit check:** an `effortless build` invoked from `toy-rulebooks/acme-llc/<substrate>/` succeeds through the proxy (this is exactly what broke acme-llc's live conformance earlier).

### Loop 5 — Admin action bar (Build / Rebuild / Clean / Report) over SSE — CLI parity, no Airtable
- `POST /api/example/:slug/build|rebuild|clean` shell to the same pipeline `orchestrate.sh` uses (set `ERB_DOMAIN=<slug>`, run from the domain dir), streaming stdout to the client over SSE; **Report** opens the domain's `orchestration-report.html`.
- Reuse the existing XLSX export route.
- **Exit check:** clicking Build on acme-llc streams a green run end-to-end (requires Loop 4); no route, param, or log line references Airtable/PAT/baseId.

### Loop 6 — `start.sh` flip + `cli-test-harness.sh` creation
- `git mv`-style extract the CLI path: new `./cli-test-harness.sh` = today's default CLI behavior, **with `[I]MPORT` removed** and the Airtable items dropped from `[D]EV-OPS`; menu now lists toys + examples in the new format.
- Rewrite `./start.sh` so its **default** boots the portal (current `--portal` path); keep `--cli` as an alias that execs `cli-test-harness.sh`; preserve `--no-open`, `--port=N`, `--ci`.
- `orchestrate.sh` `[W]EB` option: point at the new portal (or remove, since portal is now the default entry).
- **Exit check:** `./start.sh` opens the Example Finder; `./start.sh --cli` opens the (Airtable-free) menu; restart works via the single command (start.sh already kills ports — no kill ritual added).

### Loop 7 — Docs + skills sweep
- Update root `README.md`, each example README's footer if needed, and any skill/CLAUDE.md line that says "start.sh launches the CLI" to reflect "start.sh launches the Example Explorer; `--cli` for the harness."
- Ensure no doc in the portal's surface mentions Airtable onboarding.

---

## Later loops (explicitly deferred — as you flagged)

- **L8 — "Effortless tools used" analytics:** promote the transpiler-usage rollup to a first-class facet + a cross-example matrix ("which examples exercise `rulebook-to-owl`?"), sourced from `ProjectTranspilers`, enumerable and searchable.
- **L9 — Conformance surfacing:** per-example green/red badge wired to live `testing/_substrate_results.json`, plus a repo-wide conformance heat-grid (depends on Loop 4 making toy builds actually pass).
- **L10 — `[N]EW` example wizard in the portal:** create a blank rulebook-only example (no Airtable path), scaffolding `effortless.json` with the standard transpilers incl. `rulebooktorulespeak`.
- **L11 — Category/motif authoring UI:** edit `__meta__` presentation keys (tagline/category/motif) through write-through so cards are tunable without hand-editing JSON.

---

## Guardrails carried from CLAUDE.md

- **No Airtable, anywhere in the portal.** No baseId, no PAT, no `airtabletorulebook` route, no "import from Airtable" copy. The CLI harness also loses `[I]MPORT`.
- **The view/SSoT is the contract.** The indexer reads `__meta__` + schema + `effortless.json`; it does not re-derive calc values or invent metadata. Broken/missing rulebooks fail loud with the exact path.
- **No bespoke cache.** Catalog is computed live from the SSoT. Materialize only if measured perf pain justifies it — and then as a first-class platform-rulebook table, not a sidecar JSON.
- **`start.sh` is the restart story.** It kills its ports and boots; never add a kill-then-start ritual or tell the user to `kill <pid>`.
- **Project vs. demo split respected.** Portal config comes from the platform rulebook; per-example domain data from that example's rulebook. Two reads, never merged.

---

## Open questions to resolve before Loop 2

1. **Category source:** add a `category` key to each `__meta__` (business/science/math/philosophy/games/workflow), or derive category from existing `motif` + `RulebookDomains.ComplexityLevel`? (Recommend: add `category` — explicit beats inferred, and it's a one-time write-through.)
2. **Closure/recursive detection:** exact heuristic for `hasClosure` (formula referencing its own table transitively) — cheap scan now, or defer the facet to L8 alongside the tools matrix?
3. **Toy vs example denominator:** confirm the exact exclude-list (`*-demo`, `naked-claude-vs-effortless-claude`) so counts on the dashboard match the catalog doctrine.
