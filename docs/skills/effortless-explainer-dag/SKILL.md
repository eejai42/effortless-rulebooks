<!-- DERIVED ARTIFACT — DO NOT EDIT BY HAND -->
<!-- Source: https://raw.githubusercontent.com/effortlessapi/effortless-claude/main/skills/effortless-explainer-dag/SKILL.md -->
<!-- Mirrored by: docs/skills/clone-skills.sh -->
<!-- Update: cd effortless-platform && effortless clone-skills -->

---
name: effortless-explainer-dag
description: >
  Use when adding the Explainer DAG to any Effortless project — a
  generated, embedded visualization of the rulebook's calculated-field
  DAG that lets users click any cell/field and see exactly how it was
  derived (raw inputs → lookups → calcs → aggregations), with RuleSpeak®
  prose baked in at transpile time. Works in React, Vue, plain HTML,
  Flask/Jinja, HTMX, etc. via the portable `rulebook-to-explainer-dag`
  transpiler (vanilla JS + CSS, no React dependency).

  Triggers: "add the explainer dag", "wire up the explainer", "install the
  effortless explainer dag", "show the DAG in the UI", "rulebook-to-explainer-dag",
  "explain a calculated field visually", "make calculated fields clickable",
  "data-er-dag", "explainer DAG".

  **Scope (load gate):** Loads **on demand only** — when the user explicitly
  wants in-app field provenance / DAG visualization. **Not** part of the default
  demo/POC bootstrap (that uses `rulebook-to-rulespeak` via effortless-rulespeak).
  Effortless projects with a web UI (any stack). Does not require Airtable.
  **This is the ONLY skill for explainer DAG work.** Do not load
  `effortless-react-explainer-dag` (deprecated — wrong transpiler, wrong
  integration model).
audience: customer
---

# Effortless Explainer DAG — one-prompt integration playbook

> **On-demand, not default.** Demo/POC apps install `rulebook-to-rulespeak`
> instead (see **effortless-rulespeak**). Load this skill only when the user
> asks for clickable in-app field provenance or DAG pages.

Portable inference visualizer generated from `effortless-rulebook.json`.
Users hover a derived cell for RuleSpeak® + upstream chips, double-click
(or follow a link) for the full field DAG page. **Purely additive** — mark
cells with `data-er-dag`, mount scripts + routes, done.

> **Deprecated:** `rulebook-to-react-explainer-dag` and `<DagCell>` are
> superseded. Remove that transpiler from `effortless.json` if present.
> Use `rulebook-to-explainer-dag` + `data-er-dag` instead.

## Agent hard rules — do NOT roll your own

Read this section before writing any app code. The transpiler output is the
UI; the host only serves files and pastes one snippet.

**Do:**

1. `effortless -install rulebook-to-explainer-dag` (registers transpiler in `effortless.json`)
2. `effortless build` or `./start.sh build` — **hosted transpiler only**
3. Serve `/rulebook-explainer-dag/*` as static files from generated output
4. Copy `integrate/snippet.html` into the host layout (link + scripts + init)
5. Route `/dag/*` to the tool's own `pages/*.html` **or** use `mode: "modal"`
6. Mark derived display cells: `data-er-dag="Table.Field"` (PascalCase)
7. After dynamic DOM updates (HTMX, React lists): one call to `enhanceCells()`

**Do NOT create or document any of the following:**

| Forbidden | Why |
|-----------|-----|
| Local transpiler dev server (port 30071, `run-local-tool.sh`) | Not part of integration; use `effortless build` |
| Environment variables for the explainer | Not required |
| `explainer-host.js`, `explainer-bridge.js` (except React §4) | Use `integrate/snippet.html` + inline init |
| Custom Jinja/HTML shell wrapping DAG pages (`dag_shell.html`) | Tool ships self-contained `pages/*.html` + `dag.css` |
| CSS overrides for `.dag-cell`, `.dag-hovercard`, etc. | Use generated `dag.css` only |
| Patch scripts for generated `explainer-dag.js` | Fix the transpiler version; don't patch in app repos |
| Reimplementing hover cards, toggles, or DAG page renderers | All live in `explainer-dag.js` |

**Before writing host code:** open the generated
`rulebook-explainer-dag/integrate/snippet.html` and
`integrate/README.md`. If your plan deviates from those files, stop.

**Host code budget:** static mount + snippet paste + routes (if `path` mode) +
`data-er-dag` markers + (optional) one inline `enhanceCells` hook. ~30 lines
max outside the generated folder.

## One-prompt execution order

Do these steps **in order** without pausing to redesign. Adapt paths
(`web/public`, rulebook filename) to the project; keep the sequence.

1. Install transpiler + add `ProjectTranspilers` entry → run build
2. Serve generated static assets from the web root
3. Load the five JS/CSS files + call `EffortlessExplainer.init()`
4. Add DAG routes (or hash/modal equivalent)
5. Mount the ƒ-glyph toggle in the shell/header
6. Mark every derived display cell with `data-er-dag="Table.Field"`
7. Re-run `enhanceCells()` after React/Vue renders dynamic lists
8. Smoke-test: toggle, hover, double-click, upstream navigation, back

---

## 1. Transpiler

**Name:** `rulebook-to-explainer-dag` (pure JS; no React codegen)

**Install** (once per project, from repo root or any subdir):

```bash
effortless -install rulebook-to-explainer-dag
```

**Add to `effortless.json`** — append **after** postgres transpilers /
`init-db.sh` (codegen only, no DB side-effects):

```json
{
  "IsSSoTTranspiler": false,
  "Name": "rulebooktoexplainerdag",
  "RelativePath": "/web/public",
  "CommandLine": "rulebook-to-explainer-dag -i ../../effortless-rulebook/effortless-rulebook.json -o rulebook-explainer-dag",
  "IsDisabled": false
}
```

Adjust `-i` to your rulebook path and `RelativePath` so output lands
where the web server serves static files:

| Web stack | Typical `RelativePath` | Served at |
|-----------|---------------------|-----------|
| Vite (`web/public/`) | `/web/public` | `/rulebook-explainer-dag/*` |
| CRA / static `public/` | `/public` | same |
| Express static root | `/server/public` or `/` | configure static mount |

**Build:**

```bash
./start.sh build
# or: effortless build
```

Verify output exists, e.g. `web/public/rulebook-explainer-dag/`.

### Generated output (`rulebook-explainer-dag/`)

| File | Purpose |
|------|---------|
| `embedded-graph.js` | Baked rulebook + RuleSpeak® fields/obligations |
| `dag-resolver.js` | DAG resolution (`EffortlessDagResolver`) |
| `routing.js` | hash / path / modal / callback routing |
| `explainer-dag.js` | Init, cell enhancement, page renderers |
| `dag.css` | Styles (cells, hover cards, pages, modal) |
| `graph.json` | Raw rulebook export (debug) |
| `pages/*.html` | Standalone shells (optional; SPAs use JS API) |
| `integrate/snippet.html` | Copy-paste reference |

After **any** rulebook edit, re-run build — `embedded-graph.js` is
baked at transpile time; dev-server HMR will **not** refresh it.

---

## 2. Load assets in the host

### Vite / React (`web/index.html`, before `</body>`)

```html
<link rel="stylesheet" href="/rulebook-explainer-dag/dag.css">
<script src="/rulebook-explainer-dag/embedded-graph.js"></script>
<script src="/rulebook-explainer-dag/dag-resolver.js"></script>
<script src="/rulebook-explainer-dag/routing.js"></script>
<script src="/rulebook-explainer-dag/explainer-dag.js"></script>
```

### Plain HTML / Jinja / EJS

Copy `integrate/snippet.html` into your layout. Same five files + init
block.

---

## 3. Init — pick a routing mode

```javascript
EffortlessExplainer.init({ /* options */ });
```

| Mode | When to use |
|------|-------------|
| **`callback`** | **React, Vue, Svelte SPAs** — host router owns URLs |
| `path` | Multi-page apps / server-rendered routes with full reload |
| `hash` | Static sites, zero server routing (`#/dag/Table/Field`) |
| `modal` | HTMX / Jinja — overlay, URL unchanged |
| `htmx` | Set `htmxFieldUrl` template for HTMX navigation |

Common options:

- `mountToggle: "#effortless-dag-toggle"` — selector or element for ƒ
  glyph on/off (persisted in `localStorage`)
- `enhance: false` in SPAs — call `enhanceCells()` yourself after render
  (see §6)
- `routing: { navigate, navigateTable, fieldHref, tableHref, onBack, onHome }`
  — required for **`callback`** mode

---

## 4. React / Vite integration (canonical demo path)

Create `web/src/explainer-bridge.tsx`:

```tsx
import { useEffect, useLayoutEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

declare global {
  interface Window {
    EffortlessExplainer: {
      init: (opts: Record<string, unknown>) => { enhanceCells: (r?: ParentNode) => void };
      renderFieldPage: (el: HTMLElement, table: string, field: string) => void;
      renderTablePage: (el: HTMLElement, table: string) => void;
      renderTablesIndex: (el: HTMLElement) => void;
      enhanceCells: (root?: ParentNode) => void;
    };
  }
}

let dagInited = false;

/** Call once inside <BrowserRouter> (e.g. App layout). */
export function useExplainerRouting() {
  const navigate = useNavigate();
  useEffect(() => {
    if (dagInited || !window.EffortlessExplainer) return;
    dagInited = true;
    window.EffortlessExplainer.init({
      mode: "callback",
      enhance: false,
      mountToggle: "#effortless-dag-toggle",
      routing: {
        navigate: (t, f) => navigate(`/dag/${encodeURIComponent(t)}/${encodeURIComponent(f)}`),
        navigateTable: (t) => navigate(`/dag/${encodeURIComponent(t)}`),
        fieldHref: (t, f) => `/dag/${encodeURIComponent(t)}/${encodeURIComponent(f)}`,
        tableHref: (t) => `/dag/${encodeURIComponent(t)}`,
        onBack: () => navigate(-1),
        onHome: () => navigate("/"),
      },
    });
  }, [navigate]);
}

function useDagRenderer(render: (el: HTMLElement) => void, deps: unknown[]) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) render(ref.current);
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return ref;
}

export function DagIndexPage() {
  const ref = useDagRenderer((el) => window.EffortlessExplainer.renderTablesIndex(el), []);
  return <div ref={ref} />;
}

export function DagTablePage() {
  const { table = "" } = useParams();
  const t = decodeURIComponent(table);
  const ref = useDagRenderer((el) => window.EffortlessExplainer.renderTablePage(el, t), [t]);
  return <div ref={ref} />;
}

export function DagFieldPage() {
  const { table = "", field = "" } = useParams();
  const t = decodeURIComponent(table);
  const f = decodeURIComponent(field);
  const ref = useDagRenderer((el) => window.EffortlessExplainer.renderFieldPage(el, t, f), [t, f]);
  return <div ref={ref} />;
}

/** Re-scan for data-er-dag after React paints lists/forms. */
export function ExplainerEnhance({ root }: { root?: HTMLElement | null }) {
  useLayoutEffect(() => {
    window.EffortlessExplainer?.enhanceCells(root ?? document);
  });
  return null;
}
```

### `App.tsx` — routes + init

```tsx
import { DagFieldPage, DagIndexPage, DagTablePage, ExplainerEnhance, useExplainerRouting } from "./explainer-bridge";

function App() {
  useExplainerRouting();
  return (
    <>
      <ExplainerEnhance />
      <Routes>
        {/* …existing routes… */}
        <Route path="/dag" element={<DagIndexPage />} />
        <Route path="/dag/:table" element={<DagTablePage />} />
        <Route path="/dag/:table/:field" element={<DagFieldPage />} />
      </Routes>
    </>
  );
}
```

Place `/dag/*` routes **before** any `*` catch-all redirect.

### `Shell.tsx` — toggle mount

```tsx
<div id="effortless-dag-toggle" style={{ display: "flex", justifyContent: "flex-end" }} />
```

---

## 5. Mark derived cells (`data-er-dag`)

Replace old `<DagCell table="…" field="…">` with a plain wrapper:

```tsx
<td>
  <span data-er-dag="Invoices.ClientName">{i.client_name}</span>
</td>
<td>
  <span data-er-dag="Invoices.TotalDue">{money(i.total_due)}</span>
</td>
```

```html
<!-- plain HTML / Jinja -->
<td><span data-er-dag="Plots.YieldPercent">{{ plot.yield_percent }}</span></td>
```

**Rules:**

| Show value | Wrap? | `data-er-dag` |
|------------|-------|---------------|
| calculated / lookup / aggregation | yes | `Table.Field` (PascalCase) |
| `Name` PK (calculated formula) | yes | `Table.Name` |
| raw editable `<input>` | **no** | — |
| relationship FK display | no | resolver skips these |

- `Table` = PascalCase rulebook table name
- `Field` = PascalCase rulebook field name (not snake_case view column)
- Wrong casing → badge silently skipped; verify against rulebook JSON

**Interaction:** hover ƒ badge → RuleSpeak® hover card; double-click cell
→ full DAG page; badge links respect `callback`/`path`/`hash` routing.

---

## 6. Dynamic lists (React / Vue)

`init({ enhance: true })` only scans the DOM once. After fetch/render:

```tsx
useLayoutEffect(() => {
  window.EffortlessExplainer?.enhanceCells(listRef.current ?? document);
}, [rows]);
```

Or mount `<ExplainerEnhance root={listRef.current} />` at page level.

---

## 7. Non-React hosts (quick paths)

### Hash routing (static site)

```javascript
EffortlessExplainer.init({
  mode: "hash",
  mountToggle: "#effortless-dag-toggle",
});
```

Add `<div id="effortless-explainer-outlet"></div>` on your DAG page shell;
`renderFromHash()` runs automatically when the outlet exists.

### Path + server routes (Flask, Rails, Express templates)

Serve `pages/index.html`, `pages/table.html`, `pages/field.html` at
`/dag`, `/dag/:table`, `/dag/:table/:field`, **or** one template with
`<div id="effortless-explainer-outlet">` + `mode: "path"`.

### Modal (URL unchanged)

```javascript
EffortlessExplainer.init({ mode: "modal", mountToggle: "#explainer-toggle-mount" });
```

Double-click / navigate opens `#effortless-explainer-modal` overlay.

### FastAPI + Jinja + HTMX (server-rendered)

Minimal host wiring — no custom JS modules:

1. Static mount: `/rulebook-explainer-dag` → generated `rulebook-explainer-dag/`
2. Paste `integrate/snippet.html` into `base.html` (when user is logged in)
3. **Path mode** (full DAG pages at `/dag/Table/Field`):
   - Serve the tool's `pages/field.html` at `/dag`, `/dag/{table}`, `/dag/{table}/{field}`
   - Add `<base href="/rulebook-explainer-dag/pages/">` so relative `../dag.css` resolves
   - Do **not** wrap in app header/styles — the page is tool HTML + `dag.css` only
4. **Modal mode** (simpler — no `/dag` routes): use `mode: "modal"` in init
5. HTMX row swaps: one inline listener — `EffortlessExplainer.enhanceCells(e.detail.target)`

---

## 8. Verify

After build + web restart:

1. [ ] `/rulebook-explainer-dag/embedded-graph.js` loads (network tab)
2. [ ] ƒ toggle appears; toggling hides/shows cell badges
3. [ ] Derived cell → hover shows RuleSpeak® + upstream chips
4. [ ] Double-click → `/dag/Table/Field` with formula, inputs, leaves,
       downstream
5. [ ] Click upstream chip → navigates to that field's DAG
6. [ ] Back returns to previous view
7. [ ] Edit rulebook → rebuild → embedded graph reflects change

---

## 9. Pitfalls

1. **Stale embedded graph** — must `./start.sh build` after rulebook
   edits; restarting Vite alone is not enough.

2. **PascalCase mismatch** — `data-er-dag="invoices.totalDue"` silently
   does nothing.

3. **Raw inputs wrapped** — clutters forms; raw fields have no graph.

4. **Route order** — `/dag/*` before `*` catch-all.

5. **SPA without callback mode** — `path` mode + client router won't
   re-render on navigation (no `popstate` listener). Use **`callback`**
   + `renderFieldPage` route components (§4).

6. **Overflow clipping hover cards** — hover cards use `position: fixed`;
   avoid `overflow: hidden` on immediate cell wrappers.

7. **Old transpiler left installed** — remove `rulebook-to-react-explainer-dag`
   from `effortless.json` and delete stale `web/src/explainer-dag/` if
   migrating.

---

## Minimal checklist

- [ ] `effortless -install rulebook-to-explainer-dag`
- [ ] `ProjectTranspilers` entry; build emits `web/public/rulebook-explainer-dag/`
- [ ] Five assets linked in `index.html` (or server layout)
- [ ] `EffortlessExplainer.init()` with correct `mode`
- [ ] DAG routes (or hash/modal outlet)
- [ ] `#effortless-dag-toggle` mounted
- [ ] All derived displays use `data-er-dag="Table.Field"`
- [ ] `enhanceCells()` after dynamic renders
- [ ] Smoke test passes (§8)
