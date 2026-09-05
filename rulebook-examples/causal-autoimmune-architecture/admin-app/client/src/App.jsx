// App.jsx — the admin shell, now URL-DRIVEN. The URL is the source of truth for
// what's on screen; React never holds a "selected page" that isn't in the URL.
//   path  -> which nav route / which THING (matched against the rulebook's
//            RoutingAndNavigation route templates via routeMatch.js)
//   ?role -> which role tree is shown (shareable: a link carries its role)
//   ?tab / ?panel -> tab + open leaf-popover (handled inside the pages)
//
// The witnessed harness, the diagnosis, and the marquee Case Walk are each just
// a route. Every entity row elsewhere links to its own RelativePath, so any
// piece of the puzzle is reachable by link alone — no click-click-click.
import React, { useEffect, useState } from 'react';
import { C, useFetch, send } from './ui.jsx';
import { useLocation, useQueryParam, Link } from './router.jsx';
import { matchNavRoute, matchTemplate, segs, isParamSeg } from './routeMatch.js';
import {
  HarnessView, DiagnosisView, CaseWalk, StateMachineView, RoutingEditor, LoopsEditor, ExplainerView, OwlView, CaseDetail,
  IntakeWorkspace,
} from './pages.jsx';

const ROLES = [
  { key: 'diagnosing-doctor', label: 'Diagnosing Doctor' },
  { key: 'intake-clinician', label: 'Intake Clinician' },
  { key: 'admin', label: 'Admin' },
];

function HealthPill() {
  const { data } = useFetch('/api/health');
  return data?.ok ? <span style={{ color: C.pass }}>· API up</span> : <span style={{ color: C.fail }}>· API unreachable</span>;
}

// route_key -> content component. A page receives { node, params, role } so it
// can read the captured URL params (e.g. params.predictionId). The diagnosis
// case routes (and their sub-routes) all resolve to CaseDetail, which keys off
// the matched route_key to decide which sub-pane to open.
const PAGES = {
  'admin.harness': () => <HarnessView />,
  'admin.cohort': () => <CaseWalk />,
  'admin.routing': ({ role }) => <RoutingEditor role={role} />,
  'admin.state-machine': () => <StateMachineView />,
  'admin.explainer': () => <ExplainerView />,
  'admin.owl': () => <OwlView />,
  'admin.loops': () => <LoopsEditor />,
  'diagnosis': () => <DiagnosisView />,
  'diagnosis.case': ({ params, node }) => <CaseDetail predId={params.predictionId} routeKey={node.route_key} />,
  'intake': () => <DiagnosisView />,
  'intake.new-patient': ({ params, node }) => <IntakeWorkspace caseId={params.caseId} routeKey={node.route_key} />,
};
// every diagnosis.case.* sub-route renders CaseDetail (it picks the pane from route_key)
const CASE_SUB = ['evidence', 'mechanism', 'replication', 'controls', 'calibration', 'gates', 'keystone', 'report'];
for (const s of CASE_SUB) {
  PAGES[`diagnosis.case.${s}`] = ({ params, node }) => <CaseDetail predId={params.predictionId} routeKey={node.route_key} />;
}
// every intake.new-patient.* sub-route renders IntakeWorkspace (it picks the pane from route_key/?tab)
const INTAKE_SUB = ['observations', 'variants', 'assays', 'submit'];
for (const s of INTAKE_SUB) {
  PAGES[`intake.new-patient.${s}`] = ({ params, node }) => <IntakeWorkspace caseId={params.caseId} routeKey={node.route_key} />;
}

function PlaceholderPage({ node }) {
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>{node.display_name}</h2>
      <p style={{ color: C.sub, fontSize: 13 }}>{node.description}</p>
      <div style={{ border: `1px dashed ${C.border}`, borderRadius: 8, padding: 16, color: C.sub, fontSize: 13 }}>
        Route <code>{node.route}</code> · backing view <code>{node.primary_view || '—'}</code>.
        <br />This nav node is wired; its dedicated page is part of the ongoing build-out.
      </div>
    </div>
  );
}

// Parse a /dag/* URL into { table?, field? } or null if it isn't a DAG path.
//   /dag                      -> {}            (tables index)
//   /dag/Individuals          -> { table }     (one table's fields)
//   /dag/Individuals/Slug     -> { table, field } (one field's full DAG)
export function parseDagPath(path) {
  if (path !== '/dag' && !path.startsWith('/dag/')) return null;
  const rest = path.slice('/dag'.length).replace(/^\//, '');
  if (!rest) return {};
  const [table, field] = rest.split('/').map((s) => decodeURIComponent(s));
  return field ? { table, field } : { table };
}

// DagOutlet — renders the generated Explainer DAG page (index / table / field)
// into a host div via the bundle's render API. Callback-mode init wires the
// page's internal links back through our router, so navigation stays in-app.
function DagOutlet({ dag }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const ex = window.EffortlessExplainer;
    const el = ref.current;
    if (!ex || !el) return;
    el.innerHTML = '';
    if (dag.field) ex.renderFieldPage(el, dag.table, dag.field);
    else if (dag.table) ex.renderTablePage(el, dag.table);
    else ex.renderTablesIndex(el);
  }, [dag.table, dag.field]);
  return (
    <div>
      <div style={{ marginBottom: 10, fontSize: 13 }}>
        <Link to="/cohort" query={{ role: 'admin' }} style={{ color: C.accent }}>← back to the app</Link>
        <span style={{ color: C.sub }}>{'  ·  '}</span>
        <Link to="/dag" style={{ color: C.accent }}>DAG home (all tables)</Link>
      </div>
      <div ref={ref} className="dag-embedded-host" />
    </div>
  );
}

// Flatten the tree so the left nav can render indented rows in order.
function flatten(tree, depth = 0, out = []) {
  for (const n of tree) { out.push({ ...n, depth }); if (n.children?.length) flatten(n.children, depth + 1, out); }
  return out;
}

// A nav row's concrete href. If its template has :params, fill them from the
// current match (so the active branch keeps its id) or from `defaults` (so a
// fresh click on a parameterized top-level route still lands somewhere real).
function navHref(node, captured, defaults) {
  const tmpl = node.route || '/';
  if (!tmpl.includes('/:')) return tmpl;
  const params = { ...defaults, ...captured };
  // if any param is still unknown, leave the literal prefix (drop the rest) so
  // the link is at least valid rather than containing a raw ":param".
  const parts = segs(tmpl);
  const out = [];
  for (const p of parts) {
    if (isParamSeg(p)) {
      const v = params[p.slice(1)];
      if (v == null) break; // stop at the first unresolved param
      out.push(v);
    } else out.push(p);
  }
  return '/' + out.join('/');
}

// The left-nav target for a node: { to (path), query, tab }.
// Special case: the diagnosis.case.* rows are TABS of one case, not separate
// pages. They link to the current case's path (predictionId from the active
// match or default) and tweak ONLY ?tab — so clicking a tab in the left nav
// keeps you on the same case, exactly like the in-page tab strip. Every other
// node clears ?tab (it's meaningless outside a case) and links to its own path.
function navTarget(node, captured, defaults, role) {
  const m = /^diagnosis\.case\.(.+)$/.exec(node.route_key);
  if (m) {
    const tab = m[1];
    const predictionId = captured.predictionId ?? defaults.predictionId;
    return { to: predictionId ? `/diagnosis/case/${predictionId}` : navHref(node, captured, defaults), query: { role, tab }, tab };
  }
  return { to: navHref(node, captured, defaults), query: { role }, tab: null };
}

// "Save to rulebook" — the reverse-sync trigger, pinned in the left nav.
function SaveToRulebook() {
  const [busy, setBusy] = useState(false);
  const [replace, setReplace] = useState(false);
  const [msg, setMsg] = useState(null);

  async function save() {
    if (replace && !window.confirm(
      'Full overwrite: each table’s rulebook rows are REBUILT from the live database. '
      + 'Rows deleted in the DB will be removed from the rulebook too. Continue?')) return;
    setBusy(true); setMsg(null);
    try {
      const r = await send(`/api/snapshot-to-rulebook${replace ? '?mode=replace' : ''}`, 'POST');
      const s = r.summary || {};
      const n = replace ? `${s.replaced ?? 0} rows written`
        : `${s.updated ?? 0} updated, ${s.added ?? 0} added`;
      setMsg(`Saved to rulebook (${r.mode}): ${n}.`);
    } catch (e) {
      setMsg('Save failed: ' + e.message);
    }
    setBusy(false);
  }

  return (
    <div style={{ borderTop: `1px solid ${C.border}`, padding: '10px 12px' }}>
      <button onClick={save} disabled={busy}
        title="Write the live DB's current raw + computed values back into effortless-rulebook.json"
        style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: 'none', background: C.accent, color: '#fff', cursor: busy ? 'default' : 'pointer', fontSize: 13, fontWeight: 600 }}>
        {busy ? 'Saving…' : '⇡ Save to rulebook'}
      </button>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 11, color: C.sub, cursor: 'pointer' }}>
        <input type="checkbox" checked={replace} onChange={(e) => setReplace(e.target.checked)} />
        full overwrite (replace, not merge)
      </label>
      {msg && <div style={{ fontSize: 11, marginTop: 6, color: msg.startsWith('Save failed') ? C.fail : C.pass }}>{msg}</div>}
    </div>
  );
}

// Breadcrumbs — the parent chain of the matched node, each a Link, so every
// detail page is framed within its primary parent. Built from the flat rows by
// walking parent_route_key up from the active node.
function Breadcrumbs({ rows, activeNode, captured, defaults, role }) {
  if (!activeNode) return null;
  const byKey = Object.fromEntries(rows.map((r) => [r.route_key, r]));
  const chain = [];
  let n = activeNode;
  const guard = new Set();
  while (n && !guard.has(n.route_key)) {
    chain.unshift(n);
    guard.add(n.route_key);
    n = n.parent_route_key ? byKey[n.parent_route_key] : null;
  }
  if (chain.length < 2) return null;
  return (
    <div style={{ fontSize: 12.5, color: C.sub, marginBottom: 12 }}>
      {chain.map((c, i) => (
        <React.Fragment key={c.route_key}>
          {i > 0 ? <span style={{ margin: '0 6px', color: C.border }}>›</span> : null}
          {i === chain.length - 1
            ? <span style={{ color: C.ink, fontWeight: 600 }}>{c.display_name}</span>
            : <Link to={navHref(c, captured, defaults)} query={{ role }} style={{ color: C.accent }}>{c.display_name}</Link>}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function App() {
  const { path, navigate } = useLocation();
  const [role, setRole] = useQueryParam('role', 'admin');
  const { data, loading } = useFetch(`/api/routing/tree?role=${role}`, [role]);
  const rows = data?.tree ? flatten(data.tree) : [];

  // Default param fills so a click on a parameterized top-level route still
  // lands on a real thing (first patient). predictionId / caseId both default
  // to the first patient's id / individual.
  const { data: patients } = useFetch('/api/patients');
  const first = Array.isArray(patients) && patients.length ? patients[0] : null;
  const defaults = first ? { predictionId: first.individual_prediction_id, caseId: first.individual } : {};

  // Resolve the active node + captured params straight from the URL.
  const matched = matchNavRoute(rows, path);
  const captured = matched ? (matchTemplateSafe(matched.route, path) || {}) : {};
  const activeNode = matched;
  // The active tab lives in ?tab (only meaningful on a case). '' = Case-walk.
  const [activeTab] = useQueryParam('tab', '');

  // The Explainer DAG owns the /dag/* URL space (its own pages, rendered by the
  // generated bundle). These are NOT in the rulebook's RoutingAndNavigation tree,
  // so they must be recognized here — otherwise the "land somewhere real" effect
  // below would bounce every /dag link back home (the redirect-to-cohort bug).
  const dag = parseDagPath(path);

  // Land somewhere real for "/" (and whenever the path matches no route yet) —
  // but never hijack a /dag/* URL (the explainer renders those itself).
  useEffect(() => {
    if (loading || !rows.length) return;
    if (matched || dag) return;
    const home = role === 'admin' ? 'admin.cohort'
      : role === 'intake-clinician' ? 'intake.new-patient' : 'diagnosis.case';
    const node = rows.find((r) => r.route_key === home) || rows[0];
    if (node) navigate({ path: navHref(node, {}, defaults), query: { role } }, { replace: true });
  }, [loading, rows.length, matched, dag, role, defaults.predictionId]); // eslint-disable-line

  // Init the explainer in CALLBACK mode so DAG navigation goes through OUR router
  // (navigate) and stays in-app, instead of modal mode whose internal /dag links
  // escaped to raw URLs and got bounced home. Done once, here, because callback
  // mode needs the live `navigate`. Mount the ƒ toggle into the pinned slot too.
  useEffect(() => {
    const ex = window.EffortlessExplainer;
    if (!ex?.init) return;
    if (!ex.__erInited) {
      ex.init({
        mode: 'callback',
        enhance: false, // we drive enhanceCells ourselves (MutationObserver below)
        routing: {
          navigate: (t, f) => navigate({ path: `/dag/${encodeURIComponent(t)}/${encodeURIComponent(f)}` }),
          navigateTable: (t) => navigate({ path: `/dag/${encodeURIComponent(t)}` }),
          fieldHref: (t, f) => `/dag/${encodeURIComponent(t)}/${encodeURIComponent(f)}`,
          tableHref: (t) => `/dag/${encodeURIComponent(t)}`,
          onBack: () => window.history.back(),
          onHome: () => navigate({ path: '/dag' }),
        },
      });
      ex.__erInited = true;
    }
    const mount = document.getElementById('explainer-toggle-mount');
    if (mount && ex.mountToggle && mount.childElementCount === 0) ex.mountToggle(mount);
  }, [loading, navigate]);

  // Re-scan for data-er-dag cells whenever the DOM changes. The explainer's init()
  // enhances the DOM only ONCE at page load; in a SPA the real cells render later —
  // and on data-heavy pages (the cohort board, leaf tables) they mount only after an
  // async fetch resolves, at an unpredictable time. A single delayed pass misses
  // those. A debounced MutationObserver on <body> re-enhances after every render/
  // fetch, so badges appear on every page no matter when its rows arrive.
  // enhanceCells is idempotent (it flags each cell data-er-enhanced and skips it),
  // so re-running on every mutation is cheap. (Our own badge inserts are class-marked
  // and already-enhanced, so they don't cause an observer feedback loop.)
  useEffect(() => {
    const ex = window.EffortlessExplainer;
    if (!ex?.enhanceCells) return;
    let raf = 0;
    const scan = () => { ex.enhanceCells(document); };
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = 0; scan(); });
    };
    scan(); // immediate first pass
    const obs = new MutationObserver(schedule);
    obs.observe(document.body, { childList: true, subtree: true });
    return () => { obs.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, []);

  // Also kick a scan on every navigation, in case a route swaps content without a
  // body mutation the observer would otherwise coalesce away.
  useEffect(() => {
    window.EffortlessExplainer?.enhanceCells?.(document);
  }, [path, activeNode?.route_key, loading]);

  const PageFn = activeNode && PAGES[activeNode.route_key];

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: C.ink, minHeight: '100vh' }}>
      <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '12px 20px', borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
        <div>
          <Link to="/" query={{ role }}><strong style={{ fontSize: 18 }}>Causal Autoimmune Architecture</strong></Link>{' '}
          <small style={{ color: C.sub }}><HealthPill /></small>
          <div style={{ color: C.fail, fontWeight: 600, fontSize: 12 }}>Demonstration of inference structure, not validated clinical decision support.</div>
        </div>
      </header>

      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {/* LEFT NAV — a fixed-height STICKY sidebar: the link list scrolls inside it
            (flex:1 + overflowY:auto), while the footer (Save + the ƒ provenance
            toggle) stays pinned to the bottom of the VIEWPORT and never falls below
            the fold. (Was minHeight:100vh in normal flow, which pushed the toggle
            off-screen on normal-height windows.) */}
        <nav style={{ width: 250, flexShrink: 0, borderRight: `1px solid ${C.border}`, background: '#fafafa', height: 'calc(100vh - 61px)', position: 'sticky', top: 61, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
            <label style={{ display: 'block', fontSize: 12, color: C.sub, padding: '0 2px 10px' }}>
              Role
              <select value={role} onChange={(e) => setRole(e.target.value)}
                style={{ display: 'block', width: '100%', marginTop: 4, fontSize: 13, padding: '5px 6px', borderRadius: 6, border: `1px solid ${C.border}`, background: '#fff' }}>
                {ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
              </select>
            </label>
            {loading ? <p style={{ color: C.sub, fontSize: 13 }}>Loading nav…</p> : rows.map((n) => {
              const tgt = navTarget(n, captured, defaults, role);
              // active highlight: a case-tab row is active when its ?tab matches;
              // every other row is active when it's the matched node AND no tab is
              // overriding it (so the bare Case node de-highlights once a tab is on).
              const onCase = activeNode && activeNode.route_key.startsWith('diagnosis.case');
              const active = tgt.tab != null
                ? (onCase && activeTab === tgt.tab)
                : (activeNode && n.route_key === activeNode.route_key
                  && !(n.route_key === 'diagnosis.case' && activeTab));
              const onActiveBranch = activeNode && (activeNode.route_key === n.route_key || activeNode.route_key.startsWith(n.route_key + '.'));
              const isTop = n.depth === 0;
              return (
                <Link key={n.routing_and_navigation_id}
                  to={tgt.to} query={tgt.query}
                  style={{ display: 'block' }} title={n.route}>
                  <div style={{
                    padding: '6px 10px', marginLeft: n.depth * 12, borderRadius: 6, cursor: 'pointer',
                    fontWeight: isTop ? 700 : 500, fontSize: isTop ? 14 : 13,
                    color: active ? '#fff' : onActiveBranch ? C.ink : isTop ? C.ink : C.sub,
                    background: active ? C.accent : onActiveBranch ? C.bgAccent : 'transparent', margin: '1px 0',
                  }}>
                    {n.display_name}
                  </div>
                </Link>
              );
            })}
          </div>
          <div style={{ flexShrink: 0 }}>
            <SaveToRulebook />
            <div style={{ borderTop: `1px solid ${C.border}`, padding: '10px 12px', display: 'flex', alignItems: 'center', background: '#fafafa' }}>
              <span id="explainer-toggle-mount" />
            </div>
          </div>
        </nav>

        {/* CONTENT */}
        <main style={{ flex: 1, padding: '20px 28px', maxWidth: 1000 }}>
          {dag
            ? <DagOutlet dag={dag} />
            : <>
                <Breadcrumbs rows={rows} activeNode={activeNode} captured={captured} defaults={defaults} role={role} />
                {!activeNode ? <p style={{ color: C.sub }}>Resolving route…</p>
                  : PageFn ? PageFn({ node: activeNode, params: captured, role })
                    : <PlaceholderPage node={activeNode} />}
              </>}
        </main>
      </div>
    </div>
  );
}

// matchTemplate from routeMatch.js, but null-safe for missing templates.
function matchTemplateSafe(tmpl, path) {
  if (!tmpl) return null;
  return matchTemplate(tmpl, path);
}
