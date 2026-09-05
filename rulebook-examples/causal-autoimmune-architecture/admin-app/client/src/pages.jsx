// pages.jsx — the content panes for the admin shell.
//   HarnessView      the witnessed inference harness (red/green tree)
//   DiagnosisView    the doctor-style per-patient writeup (the payoff)
//   CaseWalk         the MARQUEE: each case walked up the DAG to its diagnosis
//   StateMachineView the diagnosis-lifecycle viewer (states, edges, walks)
//   RoutingEditor    the role-based navigation editor (RoutingAndNavigation)
//   LoopsEditor    the Effortless-loop editor + regenerate-plan
import React, { useEffect, useState } from 'react';
import { C, useFetch, send, Markdown } from './ui.jsx';
import { Link, useQueryParam, useLocation } from './router.jsx';

const STATUS_LABEL = { pass: '✓ green', fail: '✗ FAIL', not_surfaced: '○ not surfaced (501)' };

// Shared value formatter (booleans, nulls, arrays → display strings).
const fmtVal = (v) => (v === true ? 'true' : v === false ? 'false' : v == null ? '—' : Array.isArray(v) ? `[${v.join(', ')}]` : String(v));

// ===========================================================================
//  VISUAL PRIMITIVES — purely presentational. They re-render the SAME raw
//  numbers (no fabrication, no transformation of the data) as little gauges so
//  the leaf tables read like a lab report rather than a spreadsheet. Every
//  primitive takes a value and a scale and draws a proportional bar/marker; the
//  exact number is always still printed alongside.
// ===========================================================================

const num = (v) => (v == null || v === '' || Number.isNaN(Number(v)) ? null : Number(v));
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const lerpColor = (t) => {
  // red(0) → amber(0.5) → green(1), for "good"-scaled meters
  const stops = [[192, 40, 45], [176, 106, 0], [10, 125, 40]];
  const seg = t < 0.5 ? 0 : 1;
  const f = t < 0.5 ? t / 0.5 : (t - 0.5) / 0.5;
  const [a, b] = [stops[seg], stops[seg + 1]];
  const c = a.map((x, i) => Math.round(x + (b[i] - x) * f));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
};

// A horizontal proportional bar. `frac` in [0,1]; `color` optional (else inked).
function Bar({ frac, color, width = 70, title }) {
  const f = clamp01(frac);
  return (
    <span title={title} style={{ display: 'inline-block', width, height: 8, background: '#eee', borderRadius: 4, overflow: 'hidden', verticalAlign: 'middle' }}>
      <span style={{ display: 'block', width: `${f * 100}%`, height: '100%', background: color || C.accent }} />
    </span>
  );
}

// Numeric value + its proportional bar, side by side. `max` sets the scale;
// `good` (optional) means "bigger is better" → color ramps red→green.
function MeterCell({ value, max, good, suffix = '', digits = 2 }) {
  const v = num(value);
  if (v == null) return <span style={{ color: C.sub }}>—</span>;
  const frac = max ? clamp01(v / max) : 0;
  const color = good ? lerpColor(frac) : C.accent;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
      <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12.5, minWidth: 34, textAlign: 'right' }}>{v.toFixed(digits)}{suffix}</span>
      <Bar frac={frac} color={color} title={`${v}${suffix} of ${max}${suffix}`} />
    </span>
  );
}

// A Z-statistic gauge: marks where z sits on a 0..6 scale, with the 1.96
// significance threshold drawn in. Green right of threshold, red left.
function ZGauge({ z, threshold = 1.96, max = 6 }) {
  const v = num(z);
  if (v == null) return <span style={{ color: C.sub }}>—</span>;
  const pos = clamp01(v / max);
  const thr = clamp01(threshold / max);
  const ok = v >= threshold;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
      <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12.5, minWidth: 28, textAlign: 'right', color: ok ? C.pass : C.fail, fontWeight: 700 }}>{v.toFixed(2)}</span>
      <span style={{ position: 'relative', display: 'inline-block', width: 80, height: 9, background: '#eee', borderRadius: 4, verticalAlign: 'middle' }}>
        <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${thr * 100}%`, background: C.bgFail, borderRadius: '4px 0 0 4px' }} />
        <span style={{ position: 'absolute', left: `${thr * 100}%`, top: -2, bottom: -2, width: 2, background: C.sub }} title={`z=${threshold}`} />
        <span style={{ position: 'absolute', left: `calc(${pos * 100}% - 4px)`, top: -2, width: 8, height: 13, borderRadius: 2, background: ok ? C.pass : C.fail, border: '1px solid #fff' }} />
      </span>
    </span>
  );
}

// A p-value scale (log-ish): smaller is "more significant". We draw on a
// -log10(p) axis up to p=0.001, with the 0.05 line marked. Green = significant.
function PValueScale({ p, alpha = 0.05 }) {
  const v = num(p);
  if (v == null) return <span style={{ color: C.sub }}>—</span>;
  const axis = (x) => clamp01(-Math.log10(Math.max(x, 1e-4)) / 4); // 0 at p=1, 1 at p=1e-4
  const pos = axis(v);
  const thr = axis(alpha);
  const sig = v < alpha;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
      <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12.5, minWidth: 36, textAlign: 'right', color: sig ? C.pass : C.fail, fontWeight: 600 }}>{v}</span>
      <span style={{ position: 'relative', display: 'inline-block', width: 80, height: 9, background: '#eee', borderRadius: 4, verticalAlign: 'middle' }}>
        <span style={{ position: 'absolute', left: `${thr * 100}%`, top: -2, bottom: -2, width: 2, background: C.sub }} title={`α=${alpha}`} />
        <span style={{ position: 'absolute', left: `calc(${pos * 100}% - 4px)`, top: -2, width: 8, height: 13, borderRadius: 2, background: sig ? C.pass : C.fail, border: '1px solid #fff' }} />
      </span>
    </span>
  );
}

// A signed-effect chip: shows + / − direction with a directional color, value
// printed. Used for replication effect signs and permutation effects.
function SignChip({ sign, value }) {
  const s = num(sign);
  const up = s != null ? s > 0 : null;
  const txt = up == null ? '·' : up ? '▲ +' : '▼ −';
  const col = up == null ? C.sub : up ? C.pass : C.fail;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'ui-monospace, monospace', fontSize: 12.5, color: col, fontWeight: 700 }}>
      {txt}{value != null ? <span style={{ color: C.ink, fontWeight: 400 }}>{value}</span> : null}
    </span>
  );
}

// A yes/no pill — green check / red cross — for boolean leaf verdicts.
function BoolPill({ value, yes = 'yes', no = 'no' }) {
  const t = value === true || value === 'true';
  const f = value === false || value === 'false';
  const col = t ? C.pass : f ? C.fail : C.sub;
  const bg = t ? C.bgPass : f ? C.bgFail : '#f4f4f4';
  return (
    <span style={{ display: 'inline-block', padding: '1px 8px', borderRadius: 10, background: bg, color: col, fontSize: 11.5, fontWeight: 700, border: `1px solid ${col}22` }}>
      {t ? `✓ ${yes}` : f ? `✗ ${no}` : '—'}
    </span>
  );
}

// An ancestry chip — small colored token so a list of ancestries reads at a
// glance. Color is a stable hash of the label (presentational only).
const ANCESTRY_COLORS = {
  'European': '#3b6fb0', 'East Asian': '#9a4fb0', 'African': '#b06a00',
  'West African': '#b06a00', 'Indigenous American': '#0a7d6a', 'South Asian': '#b04f7a',
};
function AncestryChip({ label }) {
  if (!label) return <span style={{ color: C.sub }}>—</span>;
  const col = ANCESTRY_COLORS[label] || C.sub;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
      <span style={{ width: 8, height: 8, borderRadius: 4, background: col, display: 'inline-block' }} />
      {label}
    </span>
  );
}

// A calibration point: predicted band vs observed rate as two stacked mini-bars,
// so over/under-calibration is visible (the closer the two bars, the better).
function CalibCell({ predicted, observed }) {
  const pv = num(predicted), ov = num(observed);
  if (pv == null || ov == null) return <span style={{ color: C.sub }}>—</span>;
  const gap = Math.abs(pv - ov);
  const col = lerpColor(clamp01(1 - gap / 0.2)); // within 0.2 → green
  return (
    <span style={{ display: 'inline-block', verticalAlign: 'middle' }} title={`predicted ${pv} vs observed ${ov} (Δ${gap.toFixed(2)})`}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ display: 'inline-block', position: 'relative', width: 70, height: 12 }}>
          <span style={{ position: 'absolute', top: 0, left: 0, height: 5, width: `${clamp01(pv) * 100}%`, background: C.accent, borderRadius: 3 }} />
          <span style={{ position: 'absolute', bottom: 0, left: 0, height: 5, width: `${clamp01(ov) * 100}%`, background: col, borderRadius: 3 }} />
        </span>
        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11.5, color: C.sub }}>Δ{gap.toFixed(2)}</span>
      </span>
    </span>
  );
}

// A patient chip rendered as a real Link to that case's route. Used wherever a
// cohort is shown so every patient is reachable by URL (no click-to-select).
// THE ONE VARIABLE THIS CONTROLS IS THE CASE: each chip rewrites ONLY the path
// (the predictionId) and preserves the rest of the URL — including ?tab — so
// switching patients keeps you on the same tab. `keepQuery` is the current
// query (URLSearchParams) to carry across.
function PatientChips({ list, predId, keepQuery }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
      {list.map((p) => {
        const active = predId === p.individual_prediction_id;
        return (
          <Link key={p.individual_prediction_id}
            to={`/diagnosis/case/${p.individual_prediction_id}`}
            query={keepQuery}
            title={`${p.individual_ancestry_label}${p.is_ancestry_holdout ? ', holdout' : ''}`}
            style={{
              padding: '6px 10px', borderRadius: 6, border: `1px solid ${active ? C.ink : C.border}`,
              background: active ? '#222' : '#fff', color: active ? '#fff' : C.ink, fontSize: 13,
            }}>
            {p.individual}
          </Link>
        );
      })}
    </div>
  );
}

// ===========================================================================
//  HARNESS
// ===========================================================================
function SummaryBar({ summary }) {
  if (!summary) return null;
  const { total, pass, fail, not_surfaced } = summary;
  const pct = total ? Math.round((pass / total) * 100) : 0;
  return (
    <div style={{ margin: '0.5rem 0 1.25rem' }}>
      <div style={{ fontSize: 18, fontWeight: 700 }}>
        {pass}/{total} green <span style={{ color: C.sub, fontWeight: 400 }}>({pct}%)</span>
      </div>
      <div style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', border: `1px solid ${C.border}`, marginTop: 6 }}>
        <div style={{ width: `${(pass / total) * 100}%`, background: C.pass }} />
        <div style={{ width: `${(fail / total) * 100}%`, background: C.fail }} />
        <div style={{ width: `${(not_surfaced / total) * 100}%`, background: C.not_surfaced }} />
      </div>
    </div>
  );
}

function CheckRow({ c }) {
  const color = C[c.status];
  const bg = c.status === 'pass' ? C.bgPass : c.status === 'fail' ? C.bgFail : C.bgNot;
  return (
    <div style={{ borderLeft: `3px solid ${color}`, background: bg, padding: '6px 10px', margin: '4px 0', borderRadius: 4 }}>
      <div style={{ fontWeight: 600, color: C.ink }}>
        <span style={{ color, fontFamily: 'monospace' }}>{STATUS_LABEL[c.status]}</span> &nbsp;{c.label}
      </div>
      <div style={{ fontSize: 12.5, color: C.sub, marginTop: 2 }}><em>witness:</em> {c.witness}</div>
      {c.detail ? <div style={{ fontSize: 12, color: c.status === 'fail' ? C.fail : C.sub, marginTop: 2, fontFamily: 'monospace' }}>{c.detail}</div> : null}
    </div>
  );
}

function Category({ cat, open, onToggle }) {
  const allGreen = cat.pass === cat.total;
  return (
    <section style={{ border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 10, overflow: 'hidden' }}>
      <header onClick={onToggle} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#fafafa', userSelect: 'none' }}>
        <span style={{ fontWeight: 700 }}>{open ? '▾' : '▸'} {cat.category}</span>
        <span style={{ fontFamily: 'monospace', color: allGreen ? C.pass : cat.pass > 0 ? C.not_surfaced : C.fail }}>{cat.pass}/{cat.total}</span>
      </header>
      {open ? <div style={{ padding: '4px 12px 10px' }}>{cat.items.map((c, i) => <CheckRow key={i} c={c} />)}</div> : null}
    </section>
  );
}

export function HarnessView() {
  const { loading, data, error } = useFetch('/api/harness');
  const [open, setOpen] = useState({});
  if (loading) return <p>Running the witnessed inference harness…</p>;
  if (error) return <p style={{ color: C.fail }}>Harness unavailable: {error}</p>;
  const cats = data?.categories || [];
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Witnessed Inference Harness</h2>
      <SummaryBar summary={data?.summary} />
      <p style={{ color: C.sub, fontSize: 13 }}>
        Each test asserts one node of the IsClinicallyActionable DAG by hitting the app's own API. As the model is built out, these turn green.
      </p>
      {cats.map((cat) => (
        <Category key={cat.category} cat={cat} open={!!open[cat.category]} onToggle={() => setOpen((o) => ({ ...o, [cat.category]: !o[cat.category] }))} />
      ))}
    </div>
  );
}

// ===========================================================================
//  DIAGNOSIS — host with two tabs:
//    "Full chain"  the interactive inference graph (every value → ground truth)
//    "Summary"     the doctor-style Markdown writeup (the PDF-able artifact)
//  The patient selector is shared; both tabs render the SAME selected patient.
// ===========================================================================
// DiagnosisView — the /diagnosis index: the cohort, each patient a Link to its
// own case route. (Selecting a patient is navigation, not local state.)
export function DiagnosisView() {
  const { data: patients } = useFetch('/api/patients');
  const list = Array.isArray(patients) ? patients : [];
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Patient Diagnosis — cohort</h2>
      <p style={{ color: C.sub, fontSize: 13 }}>
        Each patient below is a real, linkable thing. Open one to walk its case up the inference DAG —
        every conclusion is <strong>derived</strong> from raw observations, none entered by hand.
      </p>

      {/* Corpus-level entry point — the v2 surface where disease-state patterns emerge
          ACROSS the cohort (vs the per-patient cases below). */}
      <Link to="/cohort" query={{ panel: 'map' }}
        style={{ display: 'block', border: `1px solid ${C.accent}`, borderRadius: 10, padding: '14px 18px',
          background: C.bgAccent, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: C.accent }}>▦ Cohort discovery →</div>
            <div style={{ color: C.sub, fontSize: 12.5, marginTop: 3, maxWidth: 640 }}>
              See the whole cohort at once: the disease-state map, the emergent serology signature,
              the disease-vs-evidence disagreement board, and treatment-line distribution. Discovery is
              a <strong>corpus-level</strong> act — this is the layer above the per-patient cases.
            </div>
          </div>
          <span style={{ color: C.accent, fontSize: 22 }}>›</span>
        </div>
      </Link>
      {!list.length ? <p style={{ color: C.sub }}>Loading patients…</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
          {list.map((p) => (
            <Link key={p.individual_prediction_id} to={`/diagnosis/case/${p.individual_prediction_id}`}
              style={{ display: 'block', border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 14px', background: '#fff' }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{p.individual}</div>
              <div style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>
                <span data-er-dag="IndividualPredictions.IndividualAncestryLabel">{p.individual_ancestry_label}</span>{p.is_ancestry_holdout ? <span data-er-dag="IndividualPredictions.IsAncestryHoldout"> · holdout ancestry</span> : ''}
              </div>
              <div style={{ color: C.accent, fontSize: 12, marginTop: 6 }}>open case ›</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// The /diagnosis/case/:predictionId tabs. The tab is the ?tab query param — NOT
// a path segment — so the case (path) and the tab (query) are independent
// variables: switching cases keeps the tab, switching tabs keeps the case.
// '' is the default "Case walk" tab (no ?tab in the URL).
const CASE_TABS = [
  ['', 'Case walk'],
  ['witness', '3-panel witness'],
  ['progression', 'Disease course'],
  ['treatment-line', 'Treatment line'],
  ['all', 'All'],
  ['report', 'Summary writeup'],
  ['evidence', 'Evidence'],
  ['mechanism', 'Mechanism'],
  ['replication', 'Replication'],
  ['controls', 'Controls'],
  ['calibration', 'Calibration'],
  ['gates', 'Gates'],
  ['keystone', 'Full chain'],
];

// CaseDetail — the canonical URL-driven case page.
//   PATH  decides the CASE      (/diagnosis/case/:predictionId)  ← case number IS the route
//   ?tab  decides the SUB-PANE  (?tab=evidence)                  ← one variable per click
// `routeKey` is only a fallback: a deep link to the legacy path form
// (/diagnosis/case/pred-a/evidence) still opens, seeding ?tab from the route_key.
export function CaseDetail({ predId, routeKey }) {
  const { data: patients } = useFetch('/api/patients');
  const { query } = useLocation();
  const list = Array.isArray(patients) ? patients : [];
  const patient = list.find((p) => p.individual_prediction_id === predId);

  // tab comes from ?tab; fall back to a legacy path sub-route (routeKey) so old
  // bookmarks keep working. '' means the default Case-walk tab.
  const fromRouteKey = (routeKey || 'diagnosis.case').replace(/^diagnosis\.case\.?/, '');
  const sub = query.has('tab') ? query.get('tab') : fromRouteKey;

  // A tab link tweaks ONLY ?tab — the path (the case) is left untouched. Default
  // tab ('') drops the param entirely so the URL stays clean.
  const tabQuery = (k) => {
    const next = new URLSearchParams(query);
    if (k) next.set('tab', k); else next.delete('tab');
    return next;
  };

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>
        Case — {patient ? patient.individual : predId}
        {patient ? <span style={{ color: C.sub, fontWeight: 400, fontSize: 14 }}> · <span data-er-dag="IndividualPredictions.IndividualAncestryLabel">{patient.individual_ancestry_label}</span>{patient.is_ancestry_holdout ? <span data-er-dag="IndividualPredictions.IsAncestryHoldout">, holdout</span> : ''}</span> : null}
      </h2>
      {/* patient picker — each chip tweaks ONLY the case (path), keeping ?tab */}
      <PatientChips list={list} predId={predId} keepQuery={query} />

      {/* tab strip — each tab tweaks ONLY ?tab (path/case preserved) */}
      <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${C.border}`, marginBottom: 14, flexWrap: 'wrap' }}>
        {CASE_TABS.map(([k, lbl]) => {
          const active = sub === k;
          return (
            <Link key={k || 'walk'} to={`/diagnosis/case/${predId}`} query={tabQuery(k)}
              style={{ padding: '7px 14px', borderBottom: `2px solid ${active ? C.accent : 'transparent'}`, color: active ? C.ink : C.sub, fontWeight: active ? 700 : 500, fontSize: 14 }}>
              {lbl}
            </Link>
          );
        })}
      </div>

      {!predId ? <p style={{ color: C.sub }}>No case selected.</p> : <CasePane predId={predId} sub={sub} patient={patient} />}
    </div>
  );
}

// Which pane to render for a given sub-route. Reuses the existing renderers
// where they already exist (walk, full chain, summary); the leaf-list sub-routes
// render a focused list whose rows pop a URL-addressable detail panel.
function CasePane({ predId, sub, patient }) {
  switch (sub) {
    case '': return <CaseWalkBody predId={predId} />;
    case 'witness': return <WitnessView predId={predId} />;
    case 'progression': return <ProgressionPane predId={predId} patient={patient} />;
    case 'treatment-line': return <TreatmentLinePane predId={predId} patient={patient} />;
    case 'keystone': return <DiagnosisChain predId={predId} patient={patient} />;
    case 'report': return <DiagnosisSummary predId={predId} />;
    case 'all':
    case 'evidence':
    case 'mechanism':
    case 'replication':
    case 'controls':
    case 'calibration':
    case 'gates':
      return <LeafPane predId={predId} sub={sub} patient={patient} />;
    default: return <CaseWalkBody predId={predId} />;
  }
}

// ===========================================================================
//  v2 PER-PATIENT PANES — the disease-state simulator, per case.
// ===========================================================================

// "Disease course" tab — the patient's walk through the lupus-nephritis machine
// (bitemporal occupancy) ABOVE the raw serology panels that drove it. The two
// halves are independently checkable: the serology numbers (leaves) vs the state
// the model derived (the witness contract, now for disease state).
function ProgressionPane({ predId, patient }) {
  const indId = patient?.individual;
  const { data, loading, error } = useFetch(indId ? `/api/individuals/${indId}/progression` : '/api/health', [indId]);
  if (!indId) return <p style={{ color: C.sub }}>No case selected.</p>;
  if (loading) return <p style={{ color: C.sub }}>Deriving disease course…</p>;
  if (error || !data || data.error) return <p style={{ color: C.fail }}>{error || 'Could not load progression.'}</p>;
  // the fetch may still hold the /api/health fallback shape between renders — wait
  // for the real progression payload (has instances/serology) before drilling in.
  if (!Array.isArray(data.instances) || !Array.isArray(data.serology)) return <p style={{ color: C.sub }}>Deriving disease course…</p>;

  const cur = data.current;
  return (
    <div>
      <p style={{ color: C.sub, fontSize: 13, marginTop: 0, maxWidth: 760 }}>
        The disease as a <strong>state machine</strong>: current state is <strong>derived</strong>
        from the raw serology panels below — never set. <em>How long</em> in each state is the
        bitemporal dwell. The panels are the LLM/lab’s input; the state is the model’s.
      </p>

      {/* the state timeline */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, margin: '6px 0 14px' }}>
        {data.instances.map((occ, i) => (
          <React.Fragment key={occ.sequence_index}>
            {i > 0 && <span style={{ color: C.sub }}>→</span>}
            <div title={`entered ${String(occ.entered_at).slice(0, 10)}${occ.exited_at ? `, exited ${String(occ.exited_at).slice(0, 10)}` : ' (current)'}`}
              style={{ padding: '6px 11px', borderRadius: 7, fontSize: 12.5, fontWeight: occ.is_current ? 700 : 500,
                background: occ.is_current ? stateColor(occ.state_key) : '#f0f0f0',
                color: occ.is_current ? '#fff' : C.ink, border: `1px solid ${occ.is_current ? stateColor(occ.state_key) : C.border}` }}>
              {stateLbl(occ.state_key)}
              <span style={{ fontWeight: 400, opacity: 0.85, fontSize: 11 }}> · {occ.dwell_days}d</span>
            </div>
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 18, fontSize: 13, marginBottom: 16 }}>
        <span>Current: <strong data-er-dag="Individuals.NephritisProgressionStateKey" style={{ color: stateColor(cur) }}>{stateLbl(cur)}</strong></span>
        <span>SLEDAI: <strong data-er-dag="Individuals.LatestSledaiScore" style={{ color: data.latest_sledai_score >= 12 ? C.fail : C.ink }}>{data.latest_sledai_score}</strong> (<span data-er-dag="Individuals.ActivityTier">{data.activity_tier}</span>)</span>
        <span>Progressing: <span data-er-dag="Individuals.IsDiseaseProgressing"><BoolPill value={data.is_disease_progressing} yes="yes" no="no" /></span></span>
      </div>

      {/* the raw serology leaves — the provenance */}
      <h3 style={{ fontSize: 15, margin: '4px 0 6px' }}>Serology panels (raw leaves)</h3>
      <p style={{ color: C.sub, fontSize: 12, margin: '0 0 8px' }}>Each panel’s implied state is derived from these numbers alone — check them independently of the verdict.</p>
      <table style={{ borderCollapse: 'collapse', fontSize: 12.5 }}>
        <thead>
          <tr>{['Date', 'anti-dsDNA', 'C3', 'C4', 'proteinuria', 'sediment', 'dsDNA trend', 'complement trend', 'SLEDAI', '⇒ state'].map((h) => (
            <th key={h} style={{ textAlign: 'left', padding: '4px 9px', borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.sub }}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {data.serology.map((s) => (
            <tr key={s.serology_observation_id}>
              <td style={{ padding: '4px 9px' }}>{String(s.observed_at).slice(0, 10)}</td>
              <td style={{ padding: '4px 9px' }}>{s.anti_ds_dna_iu}</td>
              <td style={{ padding: '4px 9px' }}>{s.complement_c3}</td>
              <td style={{ padding: '4px 9px' }}>{s.complement_c4}</td>
              <td style={{ padding: '4px 9px' }}>{s.proteinuria_g_per_day}</td>
              <td style={{ padding: '4px 9px' }}>{s.has_active_urinary_sediment ? 'active' : '—'}</td>
              <td style={{ padding: '4px 9px', color: s.anti_ds_dna_trend === 'Rising' ? C.fail : C.sub }}><span data-er-dag="SerologyObservations.AntiDsDnaTrend">{s.anti_ds_dna_trend}</span></td>
              <td style={{ padding: '4px 9px', color: s.complement_trend === 'Falling' ? C.fail : C.sub }}><span data-er-dag="SerologyObservations.ComplementTrend">{s.complement_trend}</span></td>
              <td style={{ padding: '4px 9px' }}><span data-er-dag="SerologyObservations.SledaiScore">{s.sledai_score}</span></td>
              <td style={{ padding: '4px 9px' }}>
                <span data-er-dag="SerologyObservations.ProgressionStateKey" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 2, background: stateColor(s.progression_state_key) }} />
                  {stateLbl(s.progression_state_key)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// "Treatment line" tab — the derived recommendation + single deciding factor,
// with the two upstream inputs (mechanism pathway + disease state) shown as the
// cells it derives from. The audit's MMF/belimumab/anifrolumab example, per case.
function TreatmentLinePane({ predId }) {
  const { data: p, loading, error } = useFetch(predId ? `/api/predictions/${predId}` : '/api/health', [predId]);
  if (loading) return <p style={{ color: C.sub }}>Deriving treatment line…</p>;
  if (error || !p || p.error) return <p style={{ color: C.fail }}>{error || 'Could not load.'}</p>;
  if (!('recommended_treatment_line' in p)) return <p style={{ color: C.sub }}>Deriving treatment line…</p>;
  const disagree = p.progression_vs_actionability_disagree;
  return (
    <div>
      <p style={{ color: C.sub, fontSize: 13, marginTop: 0, maxWidth: 760 }}>
        The recommended treatment line is <strong>derived</strong> from two upstream cells: the
        confirmed mechanism’s <strong>target pathway</strong> and the patient’s <strong>disease
        state</strong> (active nephritis overrides to induction). It names a single deciding reason.
      </p>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 10, flexWrap: 'wrap', margin: '10px 0 16px' }}>
        <InputCell label="Mechanism confirmed?" value={p.rests_on_confirmed_mechanism ? 'yes' : 'no'} good={p.rests_on_confirmed_mechanism} dag="IndividualPredictions.RestsOnConfirmedMechanism" />
        <InputCell label="Target pathway" value={p.individual_target_pathway || '—'} dag="IndividualPredictions.IndividualTargetPathway" />
        <InputCell label="Disease state" value={stateLbl(p.individual_progression_state_key)} color={stateColor(p.individual_progression_state_key)} dag="IndividualPredictions.IndividualProgressionStateKey" />
        <span style={{ alignSelf: 'center', color: C.sub, fontSize: 18 }}>⇒</span>
        <div style={{ padding: '12px 16px', borderRadius: 8, background: C.bgAccent, border: `1px solid ${C.accent}` }}>
          <div style={{ fontSize: 11, color: C.sub }}>Recommended line</div>
          <div style={{ fontWeight: 800, fontSize: 16, color: C.accent }}>
            <span data-er-dag="IndividualPredictions.RecommendedTreatmentLine">{p.recommended_treatment_line}</span>
          </div>
          <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>deciding factor:{' '}
            <span data-er-dag="IndividualPredictions.TreatmentLineDecidingFactor"><strong>{p.treatment_line_deciding_factor}</strong></span>
          </div>
        </div>
      </div>
      {disagree && (
        <div style={{ background: C.bgFail, border: `1px solid ${C.fail}`, borderRadius: 8, padding: '10px 14px', maxWidth: 760 }}>
          <strong style={{ color: C.fail }}>⚠ Disease–evidence disagreement.</strong>
          <span style={{ fontSize: 13, color: C.ink }}> The disease is progressing and warrants attention, but the
            causal-mechanism prediction is <strong>not clinically actionable</strong> ({p.deciding_gate}) — do not use it
            to choose targeted therapy. The induction recommendation reflects the disease state, not a validated mechanism.</span>
        </div>
      )}
    </div>
  );
}

function InputCell({ label, value, good, color, dag }) {
  // `dag` (PascalCase "Table.Field") marks this value as a derived cell so the
  // Effortless Explainer attaches its ƒ provenance badge when the toggle is on.
  const valEl = dag
    ? <span data-er-dag={dag}>{value}</span>
    : value;
  return (
    <div style={{ padding: '10px 14px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#fbfbfb', minWidth: 110 }}>
      <div style={{ fontSize: 11, color: C.sub }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 14, color: color || (good === false ? C.fail : C.ink) }}>{valEl}</div>
    </div>
  );
}

// ===========================================================================
//  LEAF PANES — the deep diagnosis.case.* sub-routes. Each shows a focused list
//  of leaf rows for the case; clicking a row opens a URL-addressable detail
//  DRAWER (?panel=<sub>:<id>) instead of navigating, per the "leaves pop,
//  entities navigate" rule. The drawer is in the query string, so F5 (and a
//  shared link) reopens the exact same leaf.
// ===========================================================================
const mechOf = (predId) => `cm-${predId.split('-')[1]}`; // pred-a -> cm-a (oracle convention)

// Per sub-route: how to fetch the list, the row id field, the title, and which
// columns to show. endpoint() takes the predId.
// Per-column `render(row)` functions turn the raw value into a visual primitive
// (gauge/bar/chip). They render the SAME number the cell would otherwise print —
// nothing is invented — just drawn proportionally. Absent `render` → plain value.
const LEAF_CONFIG = {
  evidence: {
    title: 'Qualified evidence', noun: 'evidence item', idField: 'evidence_item_id',
    endpoint: (p) => `/api/mechanisms/${mechOf(p)}/evidence`,
    cols: [
      ['evidence_item_id', 'ID'],
      ['represents_assay_modality', 'Modality'],
      ['effect_size', 'Effect', (r) => <MeterCell value={r.effect_size} max={1} good />],
      ['standard_error', 'SE', (r) => <MeterCell value={r.standard_error} max={0.5} />],
      ['z_stat', 'Z (≥1.96)', (r) => <span data-er-dag="EvidenceItems.ZStat"><ZGauge z={r.z_stat} /></span>],
      ['is_qualified_evidence', 'Qualified', (r) => <span data-er-dag="EvidenceItems.IsQualifiedEvidence"><BoolPill value={r.is_qualified_evidence} yes="qualified" no="weak" /></span>],
    ],
  },
  replication: {
    title: 'Cross-cohort replication', noun: 'replication', idField: 'cohort_replication_id',
    endpoint: (p) => `/api/mechanisms/${mechOf(p)}/replications`,
    cols: [
      ['cohort_replication_id', 'ID'],
      ['replication_ancestry_label', 'Ancestry', (r) => <AncestryChip label={r.replication_ancestry_label} />],
      ['replication_effect_sign', 'Direction', (r) => <SignChip sign={r.replication_effect_sign} />],
      ['replication_p_value', 'p (<0.05)', (r) => <PValueScale p={r.replication_p_value} />],
      ['is_cross_ancestry_concordant', 'Concordant', (r) => <span data-er-dag="CohortReplications.IsCrossAncestryConcordant"><BoolPill value={r.is_cross_ancestry_concordant} yes="concordant" no="discordant" /></span>],
    ],
  },
  controls: {
    title: 'Negative controls', noun: 'control test', idField: 'negative_control_test_id',
    endpoint: (p) => `/api/mechanisms/${mechOf(p)}/controls`,
    cols: [
      ['negative_control_test_id', 'ID'],
      ['test_kind', 'Kind'],
      ['permutation_effect_size', 'Permuted effect', (r) => <MeterCell value={r.permutation_effect_size} max={Math.max(0.6, num(r.null_threshold) * 2 || 0.6)} digits={2} />],
      ['null_threshold', 'Null thresh', (r) => <MeterCell value={r.null_threshold} max={Math.max(0.6, num(r.null_threshold) * 2 || 0.6)} digits={2} />],
      ['is_survived', 'Survives', (r) => <span data-er-dag="NegativeControlTests.IsSurvived"><BoolPill value={r.is_survived} yes="survives" no="fails" /></span>],
    ],
  },
  calibration: {
    title: 'Calibration bins', noun: 'calibration bin', idField: 'calibration_bin_id',
    endpoint: (p) => `/api/predictions/${p}/calibration`,
    cols: [
      ['calibration_bin_id', 'ID'],
      ['predicted_probability_band', 'Pred vs Observed', (r) => <CalibCell predicted={r.predicted_probability_band} observed={r.observed_event_rate} />],
      ['coverage_count', 'Coverage (≥20)', (r) => <MeterCell value={r.coverage_count} max={40} good digits={0} />],
      ['is_well_calibrated_bin', 'Well-calibrated', (r) => <span data-er-dag="CalibrationBins.IsWellCalibratedBin"><BoolPill value={r.is_well_calibrated_bin} yes="calibrated" no="under-covered" /></span>],
    ],
  },
};

// The four keystone gates — the SAME four the oracle/harness assert (see
// tests/oracle/dag-oracle.js GATES and tests/harness/check-engine.js L6). The
// keystone is the AND of all four. Earlier this pane listed the wrong set
// (rests_on_confirmed_mechanism + the keystone itself), which disagreed with the
// Full-chain tab. These are the real gates, read straight off the prediction row.
//   value:  the field on the prediction (boolean, except predicted_value)
//   ok(p):  is this gate SATISFIED for this patient (the clinical question)
const KEYSTONE_GATES = [
  { key: 'is_high_confidence_prediction', label: 'High-confidence prediction', dag: 'IndividualPredictions.IsHighConfidencePrediction',
    blurb: 'Calibrated AND not spurious.', ok: (p) => p.is_high_confidence_prediction === true },
  { key: 'is_falsifiability_backed', label: 'Falsifiability-backed', dag: 'IndividualPredictions.IsFalsifiabilityBacked',
    blurb: 'Rests on ≥1 experimentally-falsifiable confirmed node.', ok: (p) => p.is_falsifiability_backed === true },
  { key: 'is_ancestry_transport_safe', label: 'Ancestry transport safe', dag: 'IndividualPredictions.IsAncestryTransportSafe',
    blurb: 'Holdout ancestries need measured transport; in-training is vacuously safe.', ok: (p) => p.is_ancestry_transport_safe === true },
  { key: 'predicted_value', label: 'Predicted value > 0', dag: 'IndividualPredictions.PredictedValue',
    blurb: 'A non-null derived risk magnitude — the prediction has signal.', ok: (p) => Number(p.predicted_value) > 0 },
];

// The gates sub-route: the four keystone gates, read straight off the prediction.
// Each chip is GREEN when the gate is satisfied, RED when it is not — the
// clinical reading. The keystone (shown last) is the AND of the four. The
// Full-chain tab answers a DIFFERENT question (did the model DERIVE each gate
// correctly?), so a correctly-derived `false` is "pass" there but RED here — the
// two are now reconciled by saying so explicitly.
function GatesPane({ predId }) {
  const { data, loading, error } = useFetch(`/api/predictions/${predId}`, [predId]);
  if (loading) return <p style={{ color: C.sub }}>Loading gates…</p>;
  if (error) return <p style={{ color: C.fail }}>{error}</p>;
  const p = data && !data.error ? data : {};
  const satisfied = KEYSTONE_GATES.map((g) => g.ok(p));
  const passCount = satisfied.filter(Boolean).length;
  const keystone = p.is_clinically_actionable === true;
  const decidingIdx = satisfied.findIndex((s) => !s); // first failing gate
  return (
    <div>
      <p style={{ color: C.sub, fontSize: 13, marginTop: 0 }}>
        The keystone is the AND of these four gates — <strong>{passCount}/4 satisfied</strong> for this patient.
        A chip is <span style={{ color: C.pass, fontWeight: 600 }}>green</span> when the gate is met,{' '}
        <span style={{ color: C.fail, fontWeight: 600 }}>red</span> when it blocks the conclusion. Each is itself
        derived — open the full chain to see how. <em style={{ color: C.sub }}>(The Full-chain tab marks a gate green
        when the model derived it <u>correctly</u>, not when it is satisfied — so a correct&nbsp;<code>false</code> is
        green there but red here.)</em>
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8, marginBottom: 12 }}>
        {KEYSTONE_GATES.map((g, i) => (
          <GateCard key={g.key} label={g.label} blurb={g.blurb} satisfied={satisfied[i]} dag={g.dag}
            value={g.key === 'predicted_value' ? p.predicted_value : p[g.key]}
            deciding={!keystone && i === decidingIdx} />
        ))}
      </div>
      {/* the keystone, derived from the four above */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8,
        background: keystone ? C.bgPass : C.bgFail, border: `1px solid ${keystone ? C.pass : C.fail}` }}>
        <span style={{ fontSize: 18 }}>{keystone ? '✅' : '⛔'}</span>
        <div>
          <div style={{ fontWeight: 700, color: keystone ? C.pass : C.fail }}>
            Keystone — clinically actionable:{' '}
            <span data-er-dag="IndividualPredictions.IsClinicallyActionable">{keystone ? 'true' : 'false'}</span>
          </div>
          <div style={{ fontSize: 12.5, color: C.sub }}>
            {keystone ? 'All four gates satisfied.' : <>
              {`${4 - passCount} of 4 gates block the conclusion`} — deciding gate:{' '}
              <span data-er-dag="IndividualPredictions.DecidingGate"><strong>{p.deciding_gate}</strong></span>.
            </>}
          </div>
        </div>
      </div>

      {/* SECOND PREDICTION (Loop 4): severity, grounded in ClinicalPhenotypes and
          chained to the SAME mechanism gates. Read off the same prediction row.
          Independent of the onset keystone above — pred-b diverges (onset false,
          severity true) precisely because the mechanism is confirmed. */}
      {p.severity_tier != null && (() => {
        const sevOk = p.is_severity_actionable === true;
        return (
          <div style={{ marginTop: 14 }}>
            <p style={{ color: C.sub, fontSize: 13, margin: '0 0 6px' }}>
              <strong>Second prediction — severity.</strong> Grounded in <code>ClinicalPhenotypes.SeverityScore</code>{' '}
              and gated on the same mechanism gates (rests-on-confirmed-mechanism ∧ not-spurious), so a high severity
              number alone is never actionable on a debunked mechanism. <em>It is independent of the onset keystone above.</em>
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8,
              background: sevOk ? C.bgPass : C.bgFail, border: `1px solid ${sevOk ? C.pass : C.fail}` }}>
              <span style={{ fontSize: 18 }}>{sevOk ? '✅' : '⛔'}</span>
              <div>
                <div style={{ fontWeight: 700, color: sevOk ? C.pass : C.fail }}>
                  Severity — actionable: <span data-er-dag="IndividualPredictions.IsSeverityActionable">{sevOk ? 'true' : 'false'}</span>
                  {' · '}<span data-er-dag="IndividualPredictions.SeverityTier" style={{ color: C.ink }}>{p.severity_tier}</span>
                  {' '}<span style={{ fontFamily: 'ui-monospace, monospace', color: C.sub }}>(max <span data-er-dag="IndividualPredictions.IndividualMaxSeverityScore">{p.individual_max_severity_score}</span>)</span>
                </div>
                <div style={{ fontSize: 12.5, color: C.sub }}>
                  Deciding factor: <code data-er-dag="IndividualPredictions.SeverityDecidingFactor">{p.severity_deciding_factor}</code>
                  {sevOk && !keystone ? ' — actionable even though the onset prediction is not.' : ''}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* THIRD PREDICTION (Loop 5): treatment response, grounded in a MECHANISM
          MATCH (the treatment's target mechanism must be a confirmed causal node)
          AND an effective therapy. Read off the same prediction row; independent of
          onset and severity — pred-b diverges (onset false, treatment-response true). */}
      {p.treatment_response_deciding_factor != null && (() => {
        const txOk = p.is_treatment_response_actionable === true;
        return (
          <div style={{ marginTop: 14 }}>
            <p style={{ color: C.sub, fontSize: 13, margin: '0 0 6px' }}>
              <strong>Third prediction — treatment response.</strong> Grounded in a <em>mechanism match</em>: the
              treatment's target mechanism must be a <code>confirmed causal node</code> and the therapy must be
              effective (Complete/Partial, not adverse). <em>Independent of the onset keystone and severity above.</em>
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8,
              background: txOk ? C.bgPass : C.bgFail, border: `1px solid ${txOk ? C.pass : C.fail}` }}>
              <span style={{ fontSize: 18 }}>{txOk ? '✅' : '⛔'}</span>
              <div>
                <div style={{ fontWeight: 700, color: txOk ? C.pass : C.fail }}>
                  Treatment response — actionable: <span data-er-dag="IndividualPredictions.IsTreatmentResponseActionable">{txOk ? 'true' : 'false'}</span>
                </div>
                <div style={{ fontSize: 12.5, color: C.sub }}>
                  Deciding factor: <code data-er-dag="IndividualPredictions.TreatmentResponseDecidingFactor">{p.treatment_response_deciding_factor}</code>
                  {txOk && !keystone ? ' — actionable even though the onset prediction is not.' : ''}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// A single gate as a card: green/red by satisfaction, with the field value, a
// one-line meaning, and (for the deciding gate) a "◀ deciding" marker.
function GateCard({ label, blurb, value, satisfied, deciding, dag }) {
  const col = satisfied ? C.pass : C.fail;
  const bg = satisfied ? C.bgPass : C.bgFail;
  const show = typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(3)) : fmtVal(value);
  // The gate's derived value carries the ƒ provenance badge (each gate is a
  // calculated field on IndividualPredictions). Hover/click reveals its derivation.
  const valEl = dag ? <span data-er-dag={dag}>{show}</span> : show;
  return (
    <div style={{ border: `1px solid ${deciding ? col : C.border}`, borderLeft: `4px solid ${col}`, borderRadius: 7, background: bg, padding: '9px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: C.ink }}>{label}</span>
        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12.5, color: col, fontWeight: 700 }}>{valEl}</span>
      </div>
      <div style={{ fontSize: 11.5, color: C.sub, marginTop: 3, lineHeight: 1.35 }}>{blurb}</div>
      {deciding ? <div style={{ fontSize: 11, color: col, fontWeight: 700, marginTop: 4 }}>◀ deciding gate</div> : null}
    </div>
  );
}

function LeafPane({ predId, sub, patient }) {
  const [panel, setPanel] = useQueryParam('panel');
  if (sub === 'all') return <AllPane predId={predId} patient={patient} panel={panel} setPanel={setPanel} />;
  if (sub === 'gates') return <GatesPane predId={predId} />;
  if (sub === 'mechanism') return <MechanismPane predId={predId} />;
  const cfg = LEAF_CONFIG[sub];
  return <LeafList predId={predId} sub={sub} cfg={cfg} panel={panel} setPanel={setPanel} />;
}

// AllPane — the unified "everything on one page" view. It stacks every leaf
// surface for the case (gates + keystone, mechanism verdict, then the four
// atom tables) so a single scroll shows the whole case, each section rendered
// with the same rich per-type visualizations the individual tabs use. The
// ?panel drawer is shared, so clicking any row here behaves exactly as on its
// own tab. Nothing is re-derived — it's a layout over the existing panes.
function AllSection({ title, anchor, blurb, children }) {
  return (
    <section id={anchor} style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', marginBottom: 14, background: '#fff', scrollMarginTop: 12 }}>
      <h3 style={{ margin: '0 0 2px', fontSize: 16 }}>{title}</h3>
      {blurb ? <p style={{ color: C.sub, fontSize: 12.5, margin: '0 0 10px' }}>{blurb}</p> : null}
      {children}
    </section>
  );
}

function AllPane({ predId, patient, panel, setPanel }) {
  const SECTIONS = [
    { key: 'gates', title: 'Gates & keystone', anchor: 'sec-gates' },
    { key: 'mechanism', title: 'Mechanism node', anchor: 'sec-mechanism' },
    { key: 'evidence', title: 'Qualified evidence', anchor: 'sec-evidence' },
    { key: 'replication', title: 'Cross-cohort replication', anchor: 'sec-replication' },
    { key: 'controls', title: 'Negative controls', anchor: 'sec-controls' },
    { key: 'calibration', title: 'Calibration bins', anchor: 'sec-calibration' },
  ];
  return (
    <div>
      <p style={{ color: C.sub, fontSize: 13, marginTop: 0 }}>
        The whole case on one page — gates, mechanism verdict, and every leaf observation, each drawn the way its
        own tab draws it. Jump to a section, or scroll the full picture. Clicking any row opens its detail drawer.
      </p>
      {/* in-page jump nav */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {SECTIONS.map((s) => (
          <a key={s.key} href={`#${s.anchor}`}
            style={{ fontSize: 12, padding: '3px 10px', borderRadius: 12, border: `1px solid ${C.border}`, color: C.accent, background: C.bgAccent, textDecoration: 'none' }}>
            {s.title}
          </a>
        ))}
      </div>

      <AllSection title="Gates & keystone" anchor="sec-gates"
        blurb="The four gates the keystone ANDs — green when satisfied, red when blocking.">
        <GatesPane predId={predId} />
      </AllSection>

      <AllSection title="Mechanism node" anchor="sec-mechanism">
        <MechanismPane predId={predId} hideHeading />
      </AllSection>

      {['evidence', 'replication', 'controls', 'calibration'].map((sub) => {
        const cfg = LEAF_CONFIG[sub];
        const anchor = `sec-${sub}`;
        return (
          <AllSection key={sub} title={cfg.title} anchor={anchor}>
            <LeafList predId={predId} sub={sub} cfg={cfg} panel={panel} setPanel={setPanel} hideHeading />
          </AllSection>
        );
      })}
    </div>
  );
}

function LeafList({ predId, sub, cfg, panel, setPanel, hideHeading }) {
  const { data, loading, error } = useFetch(cfg.endpoint(predId), [predId]);
  const rows = Array.isArray(data) ? data : [];
  const openId = panel && panel.startsWith(`${sub}:`) ? panel.slice(sub.length + 1) : null;
  const openRow = rows.find((r) => String(r[cfg.idField]) === openId);
  return (
    <div>
      {hideHeading
        ? <p style={{ color: C.sub, fontSize: 12, marginTop: 0 }}>{rows.length} {cfg.noun}{rows.length === 1 ? '' : 's'} · click a row for detail.</p>
        : <>
            <h3 style={{ marginTop: 0 }}>{cfg.title} <span style={{ color: C.sub, fontWeight: 400, fontSize: 13 }}>({rows.length})</span></h3>
            <p style={{ color: C.sub, fontSize: 12.5, marginTop: 0 }}>Click any {cfg.noun} to open its detail — it stays in the URL, so a refresh (or a shared link) reopens the same one.</p>
          </>}
      {loading ? <p style={{ color: C.sub }}>Loading…</p> : error ? <p style={{ color: C.fail }}>{error}</p> : !rows.length ? <p style={{ color: C.sub }}>No rows.</p> : (
        <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%' }}>
          <thead><tr>{cfg.cols.map(([, h]) => <th key={h} style={{ border: `1px solid ${C.border}`, padding: '4px 8px', background: '#f5f5f5', textAlign: 'left' }}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((r) => {
              const id = String(r[cfg.idField]);
              const isOpen = id === openId;
              return (
                <tr key={id} onClick={() => setPanel(isOpen ? null : `${sub}:${id}`)}
                  style={{ cursor: 'pointer', background: isOpen ? C.bgAccent : 'transparent' }}>
                  {cfg.cols.map(([k, , render]) => <td key={k} style={{ border: `1px solid ${C.border}`, padding: '5px 8px', fontFamily: /id$/.test(k) ? 'ui-monospace, monospace' : 'inherit', whiteSpace: 'nowrap' }}>{render ? render(r) : fmtVal(r[k])}</td>)}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {openRow ? <LeafDrawer title={`${cfg.noun} · ${openId}`} row={openRow} onClose={() => setPanel(null)} /> : null}
    </div>
  );
}

// The URL-addressable detail drawer for one leaf row. Every field is shown
// (the leaf IS the bottom of the spreadsheet — every number visible & editable
// later). Closing clears ?panel. relative_path, if present, is shown as the
// row's own canonical URL.
function LeafDrawer({ title, row, onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', display: 'flex', justifyContent: 'flex-end', zIndex: 50 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 420, maxWidth: '90vw', height: '100%', background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)', overflowY: 'auto', padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <h3 style={{ margin: 0, fontSize: 15 }}>{title}</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18, color: C.sub }}>×</button>
        </div>
        {row.relative_path ? (
          <div style={{ fontSize: 11, color: C.sub, marginBottom: 10, wordBreak: 'break-all' }}>
            canonical path: <code>{row.relative_path}</code>
          </div>
        ) : null}
        <table style={{ borderCollapse: 'collapse', fontSize: 12.5, width: '100%' }}>
          <tbody>
            {Object.entries(row).map(([k, v]) => (
              <tr key={k}>
                <td style={{ padding: '3px 10px 3px 0', color: C.sub, verticalAlign: 'top', whiteSpace: 'nowrap' }}>{k}</td>
                <td style={{ padding: '3px 0', fontFamily: 'ui-monospace, monospace' }}>{fmtVal(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// MechanismPane — the mechanism node for this case (the cm-X rollup + verdict).
function MechanismPane({ predId, hideHeading }) {
  const mech = mechOf(predId);
  const { data, loading, error } = useFetch(`/api/mechanisms/${mech}`, [mech]);
  if (loading) return <p style={{ color: C.sub }}>Loading mechanism…</p>;
  if (error) return <p style={{ color: C.fail }}>{error}</p>;
  const row = data && !data.error ? data : {};
  const SHOW = [
    ['causal_mechanism_id', 'Mechanism'],
    ['count_qualified_evidence', 'Qualified evidence', 'CausalMechanisms.CountQualifiedEvidence'],
    ['replicates_across_cohorts', 'Replicates', 'CausalMechanisms.ReplicatesAcrossCohorts'],
    ['survives_negative_controls', 'Survives controls', 'CausalMechanisms.SurvivesNegativeControls'],
    ['is_spurious_derived', 'Spurious', 'CausalMechanisms.IsSpuriousDerived'],
    ['is_causal_architecture_node', 'Confirmed node', 'CausalMechanisms.IsCausalArchitectureNode'],
    ['is_ancestry_transportable', 'Transportable', 'CausalMechanisms.IsAncestryTransportable'],
  ];
  return (
    <div>
      {!hideHeading ? <h3 style={{ marginTop: 0 }}>Mechanism node</h3> : null}
      <p style={{ color: C.sub, fontSize: 12.5, marginTop: 0 }}>
        Aggregations over this mechanism's atoms decide whether it is a real causal-architecture node.
        Drill into <Link to={`/diagnosis/case/${predId}`} query={{ tab: 'evidence' }} style={{ color: C.accent }}>evidence</Link>,{' '}
        <Link to={`/diagnosis/case/${predId}`} query={{ tab: 'replication' }} style={{ color: C.accent }}>replication</Link>, or{' '}
        <Link to={`/diagnosis/case/${predId}`} query={{ tab: 'controls' }} style={{ color: C.accent }}>controls</Link>.
      </p>
      <div>{SHOW.map(([k, lbl, dag]) => <GateChip key={k} label={lbl} value={row[k]} dag={dag} />)}</div>
    </div>
  );
}

// ===========================================================================
//  WITNESS — the three independently-checkable panels (the anti-laundering
//  proof made interactive). Panel 1 = the case text the LLM was handed.
//  Panel 2 = every leaf fact extracted from it, each with the literal span it
//  came from. Panel 3 = the deterministic verdict + four gates. Hovering a
//  fact lights up its source span in Panel 1: a human checks the EXTRACTION
//  (2 ↔ 1) separately from trusting the DERIVATION (3). That separation is the
//  whole point — it is what a "hallucination laundered through a deterministic
//  function" cannot survive.
// ===========================================================================

// Split `text` around the first occurrence of `quote` and wrap the match in a
// <mark>. Matching is whitespace-insensitive (the stored quote collapsed its
// newlines) so it still lands even if the narrative wraps differently.
function highlightNarrative(text, quote) {
  if (!quote) return text;
  // Build a regex that treats any run of whitespace in the quote as \s+.
  const esc = quote.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  let re;
  try { re = new RegExp(esc); } catch { return text; }
  const m = re.exec(text);
  if (!m) return text;
  const before = text.slice(0, m.index);
  const hit = text.slice(m.index, m.index + m[0].length);
  const after = text.slice(m.index + m[0].length);
  return (<>
    {before}
    <mark style={{ background: '#fde68a', borderRadius: 3, padding: '1px 2px', boxShadow: '0 0 0 1px #f59e0b55' }}>{hit}</mark>
    {after}
  </>);
}

const WITNESS_GROUPS = [
  ['variant', 'Variant'], ['evidence', 'Evidence assays'], ['replication', 'Cross-cohort replication'],
  ['control', 'Negative controls'], ['calibration', 'Calibration bins'],
];

function WitnessView({ predId }) {
  const { loading, data, error } = useFetch(`/api/witness/${predId}`, [predId]);
  const [active, setActive] = useState(null); // the focused fact id

  if (loading) return <p style={{ color: C.sub }}>Loading the witness…</p>;
  if (error) return <p style={{ color: C.fail }}>{error}</p>;
  if (!data || data.error) return <p style={{ color: C.fail }}>{data?.error || 'no witness'}</p>;

  const { panel1, panel2, panel3 } = data;
  const activeFact = panel2.find((f) => f.id === active);
  const actionable = panel3.isClinicallyActionable;

  return (
    <div>
      <p style={{ color: C.sub, fontSize: 12.5, marginTop: 0, lineHeight: 1.5 }}>
        Three independently-checkable panels. <strong>Hover any fact</strong> in panel 2 to see the exact span of the
        case text (panel 1) it was extracted from. You verify the <em>extraction</em> here — the <em>derivation</em>
        {' '}(panel 3) is checkable on its own. The two never have to be trusted together.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1fr) minmax(0,0.9fr)', gap: 14, alignItems: 'start' }}>

        {/* PANEL 1 — the input case text */}
        <section style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 14px', background: '#fff' }}>
          <h4 style={{ margin: '0 0 4px', fontSize: 13 }}>1 · Presenting case <span style={{ color: C.sub, fontWeight: 400 }}>(LLM input)</span></h4>
          <div style={{ fontSize: 11.5, color: C.sub, marginBottom: 8 }}>
            {panel1.individual} · {panel1.ancestry}{panel1.isHoldout ? ' · holdout' : ''}
          </div>
          <div style={{ fontSize: 13.5, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
            {activeFact ? highlightNarrative(panel1.narrative || '', activeFact.sourceQuote) : (panel1.narrative || '— no case narrative —')}
          </div>
        </section>

        {/* PANEL 2 — the extracted leaf facts, each a pointer back into panel 1 */}
        <section style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 14px', background: '#fff' }}>
          <h4 style={{ margin: '0 0 8px', fontSize: 13 }}>2 · Extracted facts <span style={{ color: C.sub, fontWeight: 400 }}>(the LLM's only job)</span></h4>
          {WITNESS_GROUPS.map(([g, gl]) => {
            const items = panel2.filter((f) => f.group === g);
            if (!items.length) return null;
            return (
              <div key={g} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, color: C.sub, marginBottom: 3 }}>{gl}</div>
                {items.map((f) => {
                  const on = f.id === active;
                  return (
                    <div key={f.id}
                      onMouseEnter={() => setActive(f.id)} onMouseLeave={() => setActive(null)}
                      onClick={() => setActive(on ? null : f.id)}
                      style={{ cursor: 'pointer', padding: '5px 8px', borderRadius: 6, marginBottom: 3,
                        background: on ? '#fffbeb' : '#fafafa', border: `1px solid ${on ? '#f59e0b' : C.border}` }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>
                        {f.label}{f.isSynthetic ? <span title="synthetic leaf (LLM-produced lab value)"> 🧪</span> : null}
                      </div>
                      <div style={{ fontSize: 12, fontFamily: 'ui-monospace, monospace', color: C.ink }}>{f.value}</div>
                      {f.sourceQuote
                        ? <div style={{ fontSize: 11.5, color: on ? '#92400e' : C.sub, marginTop: 2 }}>↳ “{f.sourceQuote}”</div>
                        : <div style={{ fontSize: 11.5, color: C.fail, marginTop: 2 }}>↳ no source quote</div>}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </section>

        {/* PANEL 3 — the deterministic verdict + the four gates */}
        <section style={{ border: `1px solid ${actionable ? C.pass : C.fail}`, borderRadius: 8, padding: '12px 14px', background: '#fff' }}>
          <h4 style={{ margin: '0 0 8px', fontSize: 13 }}>3 · Derived verdict <span style={{ color: C.sub, fontWeight: 400 }}>(deterministic)</span></h4>
          <div style={{ fontSize: 15, fontWeight: 700, color: actionable ? C.pass : C.fail, marginBottom: 6 }}>
            IsClinicallyActionable: <span data-er-dag="IndividualPredictions.IsClinicallyActionable">{actionable ? '✅ TRUE' : '⛔ FALSE'}</span>
          </div>
          <div style={{ fontSize: 11.5, color: C.sub, marginBottom: 8 }}>Tier: <span data-er-dag="IndividualPredictions.PatientStratificationTier">{panel3.stratificationTier || '—'}</span></div>
          <div style={{ marginBottom: 8 }}>
            {panel3.gates.map((gt, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'baseline', fontSize: 12, marginBottom: 3 }}>
                <span style={{ color: gt.pass === true ? C.pass : gt.pass === false ? C.fail : C.sub, fontWeight: 700 }}>
                  {gt.pass === true ? 'PASS' : gt.pass === false ? 'FAIL' : 'n/a'}
                </span>
                <span>{gt.label} <span style={{ color: C.sub }}>· {gt.detail}</span></span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12.5, lineHeight: 1.5, background: actionable ? C.bgPass : C.bgFail, border: `1px solid ${C.border}`, borderRadius: 6, padding: '8px 10px' }}>
            {/* deciding reason carries markdown bold — render inline via Markdown */}
            <Markdown source={panel3.decidingReason} />
          </div>
        </section>
      </div>
    </div>
  );
}

// --- the doctor-style Markdown writeup (the original payoff, kept as a tab) ---
function DiagnosisSummary({ predId }) {
  const { loading, data: md, error } = useFetch(`/api/diagnosis/${predId}`, [predId]);
  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <a href={`/api/diagnosis/${predId}`} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>open raw markdown ↗</a>
      </div>
      {loading ? <p>Deriving diagnosis…</p> : error ? <p style={{ color: C.fail }}>{error}</p> : (
        <div style={{ background: '#fbfbfb', border: `1px solid ${C.border}`, borderRadius: 8, padding: '4px 20px 16px' }}>
          {typeof md === 'string' ? <Markdown source={md} /> : <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(md, null, 2)}</pre>}
        </div>
      )}
    </div>
  );
}

// ===========================================================================
//  DIAGNOSIS — FULL CHAIN (interactive)
//  Consumes the SAME witnessed checks the harness runs (GET /api/harness),
//  filtered to one patient, laid out top-down by DAG level: conclusion first,
//  then gates → prediction scalars → individual → mechanism → atoms → variant.
//  Each node is an expandable card exposing the derivation (witness), the
//  derived value (expected/actual), and the endpoint it was read from — so
//  every value is drillable down to ground truth. No Markdown/Handlebars/HTML
//  generation: it renders the live inference graph directly.
// ===========================================================================

// DAG levels, conclusion-first. Each maps a harness `level` number to a heading
// + one-line "what this layer means" blurb.
const CHAIN_LEVELS = [
  { level: 7, key: 'keystone', title: 'Conclusion — IsClinicallyActionable', blurb: 'The keystone. Everything below resolves into this one derived boolean.', match: (c) => c.level === 7 },
  { level: 6, key: 'gates', title: 'The four gates', blurb: 'The keystone ANDs these four. Exactly one is the deciding gate for a non-actionable case.' },
  { level: 5, key: 'prediction', title: 'Prediction scalars', blurb: 'Per-prediction derivations: causal mass, predicted value, calibration, leakage/transport flags.' },
  { level: 4, key: 'individual', title: 'Individual rollups', blurb: 'Counts over this patient’s mechanisms: confirmed nodes, cross-ancestry nodes, observation flags.' },
  { level: 3, key: 'mechanism', title: 'Mechanism — aggregations & node verdict', blurb: 'Aggregations over the mechanism’s atoms up to IsCausalArchitectureNode and transportability.' },
  { level: 1, key: 'atoms', title: 'Atoms — evidence / replication / control / calibration', blurb: 'Per-row leaf derivations: ZStat qualification, concordance, control survival, bin calibration.' },
  { level: 0, key: 'variant', title: 'Variant — IsCausalCandidate', blurb: 'The bottom of the chain: raw allele frequency + ASE ⇒ candidate causal variant. Ground truth.' },
];

// Which patient does a check belong to? The endpoint always carries one of the
// patient's ids (pred-X / cm-X / ind-X-…). Routing nav-tree checks (by role) are
// not per-patient inference and are excluded.
function checkBelongsToPatient(c, p) {
  if (!p) return false;
  const letter = p.individual_prediction_id.split('-')[1]; // pred-a -> a
  // every entity id for this patient carries the letter: pred-a / cm-a / var-a-… / ind-a-…
  const ids = [p.individual_prediction_id, `cm-${letter}`, `var-${letter}-`, p.individual];
  const hay = `${c.endpoint || ''} ${c.label || ''}`;
  return ids.some((id) => hay.includes(id));
}

function statusDot(status) {
  const color = status === 'pass' ? C.pass : status === 'fail' ? C.fail : C.not_surfaced;
  return <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: 5, background: color, marginRight: 8, flex: '0 0 auto' }} />;
}

// One node card: collapsed shows field = value + status; expanded reveals the
// derivation (witness), expected vs actual, and the source endpoint (provenance).
function ChainNode({ c }) {
  const [open, setOpen] = useState(false);
  const mismatch = c.status === 'fail';
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 7, marginBottom: 6, background: '#fff', overflow: 'hidden' }}>
      <button onClick={() => setOpen((o) => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', cursor: 'pointer', border: 'none', background: 'none', textAlign: 'left' }}>
        {statusDot(c.status)}
        <code style={{ fontSize: 12.5, color: C.ink, fontFamily: 'ui-monospace, monospace' }}>{c.field}</code>
        <span style={{ color: C.sub, margin: '0 6px' }}>=</span>
        <strong style={{ fontSize: 13, color: mismatch ? C.fail : C.ink }}>{fmtVal(c.actual != null || c.status === 'pass' ? c.actual : c.expected)}</strong>
        <span style={{ flex: 1 }} />
        <span style={{ color: C.sub, fontSize: 12 }}>{c.label}</span>
        <span style={{ color: C.sub, fontSize: 11, marginLeft: 8 }}>{open ? '▾' : '▸'}</span>
      </button>
      {open ? (
        <div style={{ padding: '0 14px 12px 29px', fontSize: 13 }}>
          <div style={{ color: C.ink, lineHeight: 1.5, marginBottom: 8 }}>
            <span style={{ color: C.sub, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4 }}>How it’s derived</span>
            <div style={{ marginTop: 2 }}>{c.witness || '(no witness recorded)'}</div>
          </div>
          <table style={{ borderCollapse: 'collapse', fontSize: 12.5 }}>
            <tbody>
              <tr><td style={{ color: C.sub, padding: '2px 12px 2px 0' }}>derived value</td><td><strong>{fmtVal(c.actual)}</strong></td></tr>
              <tr><td style={{ color: C.sub, padding: '2px 12px 2px 0' }}>oracle expects</td><td>{fmtVal(c.expected)}</td></tr>
              <tr><td style={{ color: C.sub, padding: '2px 12px 2px 0', verticalAlign: 'top' }}>read from</td>
                <td><a href={c.endpoint} target="_blank" rel="noreferrer" style={{ color: C.accent, fontFamily: 'ui-monospace, monospace' }}>{c.endpoint} ↗</a>
                  <span style={{ color: C.sub }}> · field <code>{c.field}</code></span></td></tr>
              {c.detail ? <tr><td style={{ color: C.fail, padding: '2px 12px 2px 0' }}>note</td><td style={{ color: C.fail }}>{c.detail}</td></tr> : null}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function ChainLevel({ def, items }) {
  const [collapsed, setCollapsed] = useState(false);
  const pass = items.filter((i) => i.status === 'pass').length;
  return (
    <section style={{ marginBottom: 18 }}>
      <button onClick={() => setCollapsed((v) => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'baseline', gap: 10, cursor: 'pointer', border: 'none', background: 'none', padding: 0, textAlign: 'left', marginBottom: 6 }}>
        <span style={{ color: C.sub, fontSize: 12 }}>{collapsed ? '▸' : '▾'}</span>
        <h3 style={{ margin: 0, fontSize: 16 }}>{def.title}</h3>
        <span style={{ fontSize: 12, color: pass === items.length ? C.pass : C.fail, fontWeight: 700 }}>{pass}/{items.length}</span>
        <span style={{ flex: 1 }} />
      </button>
      <div style={{ color: C.sub, fontSize: 12.5, marginBottom: 8, paddingLeft: 22 }}>{def.blurb}</div>
      {!collapsed ? <div style={{ paddingLeft: 22 }}>{items.map((c, i) => <ChainNode key={`${c.endpoint}:${c.field}:${i}`} c={c} />)}</div> : null}
    </section>
  );
}

function DiagnosisChain({ predId, patient }) {
  const { loading, data, error } = useFetch('/api/harness');
  // elapsed counter so a cold harness run (first load, ~15s) reads as "working", not "hung".
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!loading) return undefined;
    setElapsed(0);
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [loading]);
  if (loading) return (
    <div style={{ color: C.sub }}>
      <p style={{ margin: '4px 0' }}>Running the witnessed inference harness — deriving every node from ground truth…</p>
      <p style={{ fontSize: 12.5, margin: 0 }}>First load runs all 303 checks (~15s); subsequent loads are cached and instant. Elapsed: {elapsed}s</p>
    </div>
  );
  if (error) return <p style={{ color: C.fail }}>{error}</p>;
  const all = Array.isArray(data?.categories) ? data.categories.flatMap((cat) => cat.items) : [];
  const mine = all.filter((c) => checkBelongsToPatient(c, patient));

  // bucket by DAG level using CHAIN_LEVELS (conclusion-first)
  const byLevel = CHAIN_LEVELS.map((def) => ({ def, items: mine.filter((c) => c.level === def.level) })).filter((b) => b.items.length);
  const keystone = mine.find((c) => c.field === 'is_clinically_actionable');
  const actionable = keystone?.actual === true;

  return (
    <div>
      {/* the conclusion banner — the same derived boolean, front and center */}
      {keystone ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 8, marginBottom: 16, background: actionable ? C.bgPass : C.bgFail, border: `1px solid ${actionable ? C.pass : C.fail}` }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: actionable ? C.pass : C.fail }}>
            <span data-er-dag="IndividualPredictions.IsClinicallyActionable">{actionable ? '✅ Clinically actionable' : '⛔ Not clinically actionable'}</span>
          </div>
          <div style={{ color: C.sub, fontSize: 12.5, flex: 1 }}>{keystone.witness}</div>
        </div>
      ) : null}
      <p style={{ color: C.sub, fontSize: 12.5, marginTop: 0 }}>
        {mine.length} derived nodes for this patient, from the keystone down to ground-truth observations.
        Click any node to see its derivation and the endpoint it was read from.
      </p>
      {byLevel.map(({ def, items }) => <ChainLevel key={def.key} def={def} items={items} />)}
      {!byLevel.length ? <p style={{ color: C.sub }}>No chain nodes matched this patient.</p> : null}
    </div>
  );
}

// ===========================================================================
//  CASE WALK — the marquee "upside-down reasoning" presentation.
//  Walk each case's facts up the DAG, level by level, anchored on the
//  lifecycle state machine, until the diagnosis reveals itself.
// ===========================================================================
const LEVELS = [
  { state: 'Intake', title: 'Intake — raw facts', endpoint: (p) => `/api/individuals/${p.individual}`,
    fields: [['ancestry_label', 'Ancestry'], ['age_years', 'Age'], ['is_ancestry_absent_from_training', 'Holdout ancestry'], ['has_cryptic_relatedness_flag', 'Cryptic relatedness']],
    blurb: 'The clinician transcribes the presenting facts. Nothing is inferred yet.' },
  { state: 'EvidenceAssessed', title: 'Evidence assessed', endpoint: (p) => `/api/individuals/${p.individual}/variants`,
    fields: [['allele_frequency', 'Allele freq'], ['is_rare_variant', 'Rare variant', 'GenomicVariants.IsRareVariant'], ['has_allele_specific_expression', 'ASE'], ['is_causal_candidate', 'Causal candidate', 'GenomicVariants.IsCausalCandidate']],
    blurb: 'The variant is a candidate; per-evidence ZStats qualify the signal.' },
  { state: 'MechanismConfirmed', title: 'Mechanism confirmed?', endpoint: (p) => `/api/mechanisms/${p.mechanism}`,
    fields: [['count_qualified_evidence', 'Qualified evidence', 'CausalMechanisms.CountQualifiedEvidence'], ['replicates_across_cohorts', 'Replicates', 'CausalMechanisms.ReplicatesAcrossCohorts'], ['survives_negative_controls', 'Survives controls', 'CausalMechanisms.SurvivesNegativeControls'], ['is_spurious_derived', 'Spurious', 'CausalMechanisms.IsSpuriousDerived'], ['is_causal_architecture_node', 'Confirmed node', 'CausalMechanisms.IsCausalArchitectureNode']],
    blurb: 'Aggregations decide whether this mechanism is a real causal-architecture node or spurious.' },
  { state: 'CalibrationChecked', title: 'Calibration checked', endpoint: (p) => `/api/predictions/${p.prediction}`,
    fields: [['count_well_calibrated_bins', 'Well-calibrated bins', 'IndividualPredictions.CountWellCalibratedBins'], ['calibrated_uncertainty', 'Calibrated uncertainty', 'IndividualPredictions.CalibratedUncertainty'], ['is_high_confidence_prediction', 'High confidence', 'IndividualPredictions.IsHighConfidencePrediction']],
    blurb: 'Reliability-bin coverage gates whether the prediction is trustworthy.' },
  { state: 'TransportChecked', title: 'Ancestry transport checked', endpoint: (p) => `/api/predictions/${p.prediction}`,
    fields: [['individual_cross_ancestry_node_count', 'Cross-ancestry nodes', 'IndividualPredictions.IndividualCrossAncestryNodeCount'], ['is_transportable_to_absent_ancestry', 'Transportable', 'IndividualPredictions.IsTransportableToAbsentAncestry'], ['is_ancestry_transport_safe', 'Transport safe', 'IndividualPredictions.IsAncestryTransportSafe']],
    blurb: 'For held-out ancestries, the effect must be measured across ancestries — not assumed.' },
];

function GateChip({ label, value, dag }) {
  const truthy = value === true || value === 'true';
  const falsy = value === false || value === 'false';
  const col = truthy ? C.pass : falsy ? C.fail : C.sub;
  const bg = truthy ? C.bgPass : falsy ? C.bgFail : '#f4f4f4';
  const show = typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(3)) : String(value);
  const showEl = dag ? <span data-er-dag={dag}><strong>{show}</strong></span> : <strong>{show}</strong>;
  return (
    <span style={{ display: 'inline-block', margin: '3px 6px 3px 0', padding: '3px 9px', borderRadius: 12, background: bg, color: col, border: `1px solid ${C.border}`, fontSize: 12.5 }}>
      {label}: {showEl}
    </span>
  );
}

function WalkStep({ level, patient, reached, isDeciding, drillTo, drillTab }) {
  const { data } = useFetch(level.endpoint(patient), [patient.prediction, patient.individual]);
  // Endpoints return either a single derived row or a list (e.g. an individual's
  // variants); the walk shows the first qualifying row in either case.
  const resolved = Array.isArray(data) ? data[0] : data;
  const row = resolved && !resolved.error ? resolved : {};
  const dim = !reached;
  const Title = (
    <>
      {level.title} <span style={{ color: C.sub, fontWeight: 400, fontFamily: 'monospace', fontSize: 12 }}>· {level.state}</span>
    </>
  );
  return (
    <div style={{ position: 'relative', paddingLeft: 26, marginBottom: 14, opacity: dim ? 0.4 : 1 }}>
      <div style={{ position: 'absolute', left: 0, top: 2, width: 14, height: 14, borderRadius: 7, background: reached ? (isDeciding ? C.accent : C.pass) : '#ccc', border: '2px solid #fff', boxShadow: `0 0 0 1px ${C.border}` }} />
      {/* connector line */}
      <div style={{ position: 'absolute', left: 6, top: 16, bottom: -14, width: 2, background: C.border }} />
      <div style={{ fontWeight: 700, fontSize: 14 }}>
        {drillTo ? <Link to={drillTo} query={drillTab ? { tab: drillTab } : undefined} style={{ color: C.ink, borderBottom: `1px dotted ${C.sub}` }}>{Title}</Link> : Title}
        {isDeciding ? <span style={{ marginLeft: 8, color: C.accent, fontSize: 12, fontWeight: 700 }}>◀ deciding step</span> : null}
        {drillTo ? <span style={{ marginLeft: 8, color: C.accent, fontSize: 12 }}>drill in ›</span> : null}
      </div>
      <div style={{ fontSize: 12.5, color: C.sub, margin: '2px 0 4px' }}>{level.blurb}</div>
      <div>{level.fields.map(([k, lbl, dag]) => <GateChip key={k} label={lbl} value={row[k]} dag={dag} />)}</div>
    </div>
  );
}

// ===========================================================================
//  v2 COHORT DISCOVERY — the corpus-level surface. v1 = per-patient adjudication;
//  v2 adds the population view where disease-state patterns EMERGE across the
//  whole cohort. Four panels (?panel): the disease-state map, the emergent
//  serology-signature scatter, the disagreement board, the treatment-line
//  distribution. Every value is a DERIVED field read from /api/cohort-individuals
//  (and the harness asserts each one green) — nothing is recomputed here.
// ===========================================================================

// The nephritis-progression states, ordered, with a severity ramp colour. Shared
// by the map, scatter, and chips so the whole board reads one visual language.
const NEPHRITIS_STATES = [
  ['PresymptomaticAutoimmunity', 'Presymptomatic', '#8a8f98'],
  ['SerologicActive', 'Serologic-active', '#caa53d'],
  ['EarlyNephritis', 'Early nephritis', '#d98033'],
  ['RenalFlareRisk', 'Renal-flare risk', '#c85a2b'],
  ['BiopsyIndicated', 'Biopsy-indicated', '#c0282d'],
];
const STATE_META = Object.fromEntries(NEPHRITIS_STATES.map(([k, lbl, col], i) => [k, { lbl, col, order: i }]));
const stateColor = (k) => STATE_META[k]?.col || C.sub;
const stateLbl = (k) => STATE_META[k]?.lbl || k;
const personName = (r) => `${r.given_name} ${r.family_name}`;

const COHORT_PANELS = [
  ['map', 'Disease-state map'],
  ['signature', 'Emergent signature'],
  ['disagreement', 'Disagreement board'],
  ['treatment', 'Treatment lines'],
];

export function CohortDiscovery() {
  const { data, loading, error } = useFetch('/api/cohort-individuals');
  const [panel, setPanel] = useQueryParam('panel', 'map');
  const rows = Array.isArray(data) ? data : [];

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Cohort discovery</h2>
      <p style={{ color: C.sub, fontSize: 13, marginTop: 0, maxWidth: 760 }}>
        v1 answered <em>“is this prediction actionable?”</em> one patient at a time. This is the
        layer above it: the <strong>whole cohort</strong> at once, where disease-state patterns
        emerge across people — because discovery is a corpus-level act, never a single chart. Every
        cell is a <strong>derived</strong> field (green in the harness); nothing is computed here.
      </p>

      <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${C.border}`, marginBottom: 16, flexWrap: 'wrap' }}>
        {COHORT_PANELS.map(([k, lbl]) => {
          const active = panel === k;
          return (
            <button key={k} onClick={() => setPanel(k)}
              style={{ padding: '7px 14px', border: 'none', background: 'transparent', cursor: 'pointer',
                borderBottom: `2px solid ${active ? C.accent : 'transparent'}`, color: active ? C.ink : C.sub,
                fontWeight: active ? 700 : 500, fontSize: 14 }}>
              {lbl}
            </button>
          );
        })}
      </div>

      {loading ? <p style={{ color: C.sub }}>Loading cohort…</p>
        : error ? <p style={{ color: C.fail }}>{error}</p>
          : panel === 'signature' ? <SignaturePanel rows={rows} />
            : panel === 'disagreement' ? <DisagreementPanel rows={rows} />
              : panel === 'treatment' ? <TreatmentLinePanel rows={rows} />
                : <DiseaseStateMap rows={rows} />}
    </div>
  );
}

// 1a — DISEASE-STATE COHORT MAP. Rows = individuals, columns = the ordered
// nephritis states. The current state is the filled cell; reads like a population
// moving through disease space.
function DiseaseStateMap({ rows }) {
  return (
    <div>
      <p style={{ color: C.sub, fontSize: 13, marginTop: 0 }}>
        Each row is a patient; the filled cell is their <strong>current derived state</strong>
        (from raw serology). The cluster that has crossed into nephritis is visible at a glance.
      </p>
      <table style={{ borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '6px 10px', borderBottom: `1px solid ${C.border}` }}>Patient</th>
            {NEPHRITIS_STATES.map(([k, lbl]) => (
              <th key={k} style={{ padding: '6px 8px', borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.sub, fontWeight: 600 }}>{lbl}</th>
            ))}
            <th style={{ padding: '6px 10px', borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.sub }}>SLEDAI · tier</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const curOrder = STATE_META[r.nephritis_progression_state_key]?.order ?? 0;
            return (
              <tr key={r.individual_id}>
                <td style={{ padding: '5px 10px', whiteSpace: 'nowrap' }}>
                  {r.individual_prediction_id
                    ? <Link to={`/diagnosis/case/${r.individual_prediction_id}`} query={{ tab: 'progression' }} style={{ color: C.accent }}>{personName(r)}</Link>
                    : <span>{personName(r)}</span>}
                  <span style={{ color: C.sub, fontSize: 11 }}> · {r.ancestry_label}</span>
                </td>
                {NEPHRITIS_STATES.map(([k], i) => {
                  const isCur = r.nephritis_progression_state_key === k;
                  const passed = i <= curOrder;
                  return (
                    <td key={k} style={{ padding: '4px 6px', textAlign: 'center' }}>
                      <div {...(isCur ? { 'data-er-dag': 'Individuals.NephritisProgressionStateKey' } : {})}
                        title={isCur ? `current: ${stateLbl(k)}` : ''}
                        style={{ width: 18, height: 18, margin: '0 auto', borderRadius: 4,
                          background: isCur ? stateColor(k) : passed ? '#e8e8e8' : 'transparent',
                          border: isCur ? `2px solid ${stateColor(k)}` : `1px solid ${C.border}`,
                          boxShadow: isCur ? `0 0 0 2px ${stateColor(k)}33` : 'none' }} />
                    </td>
                  );
                })}
                <td style={{ padding: '5px 10px', whiteSpace: 'nowrap', color: C.sub }}>
                  <strong data-er-dag="Individuals.LatestSledaiScore" style={{ color: r.latest_sledai_score >= 12 ? C.fail : C.ink }}>{r.latest_sledai_score}</strong> · <span data-er-dag="Individuals.ActivityTier">{r.activity_tier}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// 1b — EMERGENT SIGNATURE. A plain-SVG scatter: x = anti-dsDNA trend, y =
// complement trend, colour = derived state, radius = SLEDAI. The rising-dsDNA +
// falling-complement quadrant lights up with the nephritis cases — the SHAPE of
// how the hypothesis "this serology signature precedes renal involvement" would
// be discovered across a cohort. (Synthetic data — a demonstration, not a finding.)
const TREND_X = { Falling: 0, Stable: 1, Rising: 2 };
const TREND_Y = { Rising: 0, Stable: 1, Falling: 2 }; // falling complement = lower = "worse" = bottom
// Stable, deterministic hash → [0,1). Seeds per-point jitter so the cloud looks
// organic (not snapped to a 3×3 grid) yet never moves between renders.
function seededUnit(seed) {
  let h = 2166136261 >>> 0;
  const s = String(seed);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  // xorshift the hash a couple times so adjacent ids don't produce adjacent values
  h ^= h << 13; h >>>= 0; h ^= h >> 17; h ^= h << 5; h >>>= 0;
  return (h % 100000) / 100000;
}
// The pre-nephritic signature cluster is a DERIVED field, not a colour we paint:
// is_in_pre_nephritic_signature_cluster / signature_strength come straight from
// vw_individuals (rising-dsDNA + falling-complement panels rolled up per patient).
const SIG_CLUSTER = '#7b2d8e'; // the cluster halo colour (distinct from state colours)

function SignaturePanel({ rows }) {
  const W = 600, H = 400, padL = 96, padB = 64, padT = 28, padR = 64;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const clusterRows = rows.filter((r) => r.is_in_pre_nephritic_signature_cluster);
  const clusterN = clusterRows.length;
  // The discovery's headline check: does cluster membership track the disease?
  const clusterProgressing = clusterRows.filter((r) => r.is_disease_progressing || r.nephritis_progression_state_key === 'SerologicActive').length;
  // Inset the three category anchors away from the plot edges so the outermost
  // clusters (Rising / Falling corners) have room to jitter without clipping.
  const inset = 0.16; // fraction of a half-axis pulled in from each edge
  const frac = (i) => inset + (i / 2) * (1 - 2 * inset); // 0→inset, 1→0.5, 2→1-inset
  const xAt = (t) => padL + frac(TREND_X[t] ?? 1) * plotW;
  const yAt = (t) => padT + frac(TREND_Y[t] ?? 1) * plotH;
  const rAt = (s) => 6 + Math.sqrt(s || 0) * 3;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  return (
    <div>
      <p style={{ color: C.sub, fontSize: 13, marginTop: 0, maxWidth: 780 }}>
        Each point is a patient at their latest serology panel: <strong>x = anti-dsDNA trend</strong>,
        <strong> y = complement trend</strong>, colour = derived nephritis state, size = SLEDAI.
        The <strong style={{ color: SIG_CLUSTER }}>purple halo</strong> marks the
        <strong> derived pre-nephritic signature cluster</strong> — a patient whose own raw serology
        series ever showed rising-dsDNA + falling-complement (<code>is_in_pre_nephritic_signature_cluster</code>,
        ring thickness = <code>signature_strength</code>). It is a <em>derived field</em>, not a label
        anyone assigned.
      </p>
      <p style={{ fontSize: 12.5, marginTop: -4, color: C.ink, background: '#f6eefa', border: `1px solid ${SIG_CLUSTER}33`, borderRadius: 6, padding: '6px 10px', maxWidth: 780 }}>
        <strong>The corpus-level finding:</strong> {clusterN} of {rows.length} patients are in the
        signature cluster, and <strong>{clusterProgressing}/{clusterN}</strong> of them are active or
        progressing to nephritis — while every patient <em>outside</em> the cluster is quiescent
        presymptomatic. The signature emerges from the population's raw series and tracks the disease;
        no single chart could surface it.
      </p>
      <svg width={W} height={H} style={{ border: `1px solid ${C.border}`, borderRadius: 8, background: '#fcfcfc' }}>
        {/* quadrant shading: bottom-right = the "worsening" corner (Stable anchor → plot edge) */}
        <rect x={xAt('Stable')} y={yAt('Stable')} width={padL + plotW - xAt('Stable')} height={padT + plotH - yAt('Stable')} fill="#fdeaea" opacity={0.6} />
        {/* axes */}
        <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke={C.border} />
        <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke={C.border} />
        {['Falling', 'Stable', 'Rising'].map((t) => (
          <text key={t} x={xAt(t)} y={padT + plotH + 18} textAnchor="middle" fontSize={11} fill={C.sub}>{t}</text>
        ))}
        <text x={padL + plotW / 2} y={H - 8} textAnchor="middle" fontSize={11} fill={C.ink}>anti-dsDNA trend →</text>
        {['Rising', 'Stable', 'Falling'].map((t) => (
          <text key={t} x={padL - 8} y={yAt(t) + 4} textAnchor="end" fontSize={11} fill={C.sub}>{t}</text>
        ))}
        <text x={16} y={padT + plotH / 2} textAnchor="middle" fontSize={11} fill={C.ink}
          transform={`rotate(-90 16 ${padT + plotH / 2})`}>complement trend ↓</text>
        {/* scatter co-located points with stable, seeded jitter so the cloud reads
            organic (not snapped to a grid) while staying inside the plot. A faint
            ring-fan keeps dense quadrants legible; jitter rides on top of it. */}
        {rows.map((r) => {
          const key = `${r.anti_ds_dna_trend}|${r.complement_trend}`;
          const peers = rows.filter((x) => `${x.anti_ds_dna_trend}|${x.complement_trend}` === key);
          const pos = peers.findIndex((x) => x.individual_id === r.individual_id);
          const n = peers.length;
          // base ring spreads a crowded quadrant; seeded jitter perturbs each point
          // so co-located patients never land on a perfect circle.
          const ang = n > 1 ? (pos / n) * 2 * Math.PI : 0;
          const ring = n > 1 ? 22 + n * 2.5 : 0;
          const u1 = seededUnit(r.individual_id), u2 = seededUnit(`${r.individual_id}#y`);
          const jamp = 18; // jitter amplitude (px)
          const jx = Math.cos(ang) * ring + (u1 - 0.5) * 2 * jamp;
          const jy = Math.sin(ang) * ring + (u2 - 0.5) * 2 * jamp;
          const rr = rAt(r.latest_sledai_score);
          // clamp so the circle AND its label stay inside the canvas
          const cx = clamp(xAt(r.anti_ds_dna_trend) + jx, padL + rr, padL + plotW - rr);
          const cy = clamp(yAt(r.complement_trend) + jy, padT + rr + 12, padT + plotH - rr);
          // DERIVED cluster halo: dashed purple ring around members, thicker for
          // higher signature_strength. Drawn behind the state circle.
          const inCluster = r.is_in_pre_nephritic_signature_cluster;
          const strength = r.signature_strength || 0;
          return (
            <g key={r.individual_id}>
              {inCluster ? (
                <circle data-er-dag="Individuals.IsInPreNephriticSignatureCluster" cx={cx} cy={cy} r={rr + 4 + strength * 2} fill="none"
                  stroke={SIG_CLUSTER} strokeWidth={1 + strength} strokeDasharray="3 2" opacity={0.9}>
                  <title>{personName(r)} · in pre-nephritic signature cluster · strength {strength} ({r.count_pre_nephritic_signature_panels} signature panel{r.count_pre_nephritic_signature_panels === 1 ? '' : 's'})</title>
                </circle>
              ) : null}
              <circle data-er-dag="Individuals.NephritisProgressionStateKey" cx={cx} cy={cy} r={rr} fill={stateColor(r.nephritis_progression_state_key)}
                fillOpacity={0.65} stroke={stateColor(r.nephritis_progression_state_key)} strokeWidth={1.5}>
                <title>{personName(r)} · {stateLbl(r.nephritis_progression_state_key)} · SLEDAI {r.latest_sledai_score}{inCluster ? ` · signature cluster (strength ${strength})` : ''}</title>
              </circle>
              <text x={clamp(cx, padL + 18, padL + plotW - 18)} y={cy - rr - 3} textAnchor="middle" fontSize={10} fill={C.ink}>
                {r.family_name}
              </text>
            </g>
          );
        })}
      </svg>
      <StateLegend />
      <p style={{ color: C.fail, fontSize: 11.5, marginTop: 8, fontWeight: 600 }}>
        Synthetic, transparent data. This is a demonstration of the SHAPE of corpus-level discovery,
        not a clinical finding.
      </p>
    </div>
  );
}

function StateLegend() {
  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 10 }}>
      {NEPHRITIS_STATES.map(([k, lbl, col]) => (
        <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: C.sub }}>
          <span style={{ width: 11, height: 11, borderRadius: 3, background: col, display: 'inline-block' }} /> {lbl}
        </span>
      ))}
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: C.sub }}>
        <span style={{ width: 13, height: 13, borderRadius: '50%', border: `2px dashed ${SIG_CLUSTER}`, display: 'inline-block' }} /> pre-nephritic signature cluster (derived)
      </span>
    </div>
  );
}

// 1c — DISAGREEMENT BOARD. The centerpiece: "is the disease progressing?"
// (simulator) vs "is the prediction actionable?" (gate), side by side, with the
// disagreeing row lit. Diego is the lit cell — progressing yet not actionable.
function DisagreementPanel({ rows }) {
  const withPred = rows.filter((r) => r.individual_prediction_id);
  return (
    <div>
      <p style={{ color: C.sub, fontSize: 13, marginTop: 0, maxWidth: 780 }}>
        Two independent verdicts per patient. <strong>“Progressing?”</strong> is the disease-state
        simulator; <strong>“Actionable?”</strong> is the v1 evidence gate. Where they
        <strong> disagree</strong>, the row is lit — proof the two layers are independent. A pure
        evidence gate could never flag a patient who is clearly worsening yet whose prediction is
        untrustworthy.
      </p>
      <table style={{ borderCollapse: 'collapse', fontSize: 13, minWidth: 620 }}>
        <thead>
          <tr>
            {['Patient', 'Disease state', 'Progressing?', 'Actionable?', 'Deciding gate', 'Disagree'].map((h) => (
              <th key={h} style={{ textAlign: 'left', padding: '6px 12px', borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.sub }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {withPred.map((r) => {
            const lit = r.progression_vs_actionability_disagree;
            return (
              <tr key={r.individual_id} style={{ background: lit ? C.bgFail : 'transparent' }}>
                <td style={{ padding: '6px 12px', whiteSpace: 'nowrap' }}>
                  <Link to={`/diagnosis/case/${r.individual_prediction_id}`} query={{ tab: 'progression' }} style={{ color: C.accent, fontWeight: lit ? 700 : 500 }}>{personName(r)}</Link>
                </td>
                <td style={{ padding: '6px 12px' }}>
                  <span data-er-dag="Individuals.NephritisProgressionStateKey" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: stateColor(r.nephritis_progression_state_key) }} />
                    {stateLbl(r.nephritis_progression_state_key)}
                  </span>
                </td>
                <td style={{ padding: '6px 12px' }}><span data-er-dag="Individuals.IsDiseaseProgressing"><BoolPill value={r.is_disease_progressing} yes="progressing" no="stable" /></span></td>
                <td style={{ padding: '6px 12px' }}><span data-er-dag="IndividualPredictions.IsClinicallyActionable"><BoolPill value={r.is_clinically_actionable} yes="actionable" no="not actionable" /></span></td>
                <td style={{ padding: '6px 12px', color: C.sub, fontSize: 12 }}><span data-er-dag="IndividualPredictions.DecidingGate">{r.deciding_gate}</span></td>
                <td style={{ padding: '6px 12px', fontWeight: 700, color: lit ? C.fail : C.sub }}>{lit ? '⚠ DISAGREE' : '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p style={{ color: C.sub, fontSize: 12.5, marginTop: 12, maxWidth: 780 }}>
        Read the lit row as: <em>“this patient is clearly progressing toward a renal flare and needs
        attention — but our causal-mechanism prediction is not trustworthy enough (cryptic
        relatedness) to choose a targeted therapy.”</em> Only a system with both layers can say that.
      </p>
    </div>
  );
}

// 1d — TREATMENT-LINE DISTRIBUTION. Confirmed-mechanism pathway → recommended
// line, grouped, each patient drillable to the deciding factor.
function TreatmentLinePanel({ rows }) {
  const withPred = rows.filter((r) => r.individual_prediction_id);
  const groups = {};
  for (const r of withPred) {
    const line = r.recommended_treatment_line || '—';
    (groups[line] || (groups[line] = [])).push(r);
  }
  const order = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length);
  const lineColor = (line) => line.includes('Mycophenolate') ? '#c0282d'
    : line.includes('Anifrolumab') ? '#1f5fae' : line.includes('Belimumab') ? '#7a3da9'
      : line.includes('Secukinumab') ? '#0a7d28' : '#8a8f98';
  return (
    <div>
      <p style={{ color: C.sub, fontSize: 13, marginTop: 0, maxWidth: 780 }}>
        The recommended treatment line per patient — <strong>derived</strong> from the confirmed
        mechanism’s target pathway and the disease state (active nephritis overrides to induction).
        Each is a single deciding reason, not a label.
      </p>
      {order.map((line) => (
        <div key={line} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ width: 11, height: 11, borderRadius: 3, background: lineColor(line) }} />
            <strong data-er-dag="IndividualPredictions.RecommendedTreatmentLine" style={{ fontSize: 13.5 }}>{line}</strong>
            <span style={{ color: C.sub, fontSize: 12 }}>· {groups[line].length}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingLeft: 19 }}>
            {groups[line].map((r) => (
              <Link key={r.individual_id} to={`/diagnosis/case/${r.individual_prediction_id}`} query={{ tab: 'treatment-line' }}
                title={`${r.treatment_line_deciding_factor} · pathway ${r.target_pathway || '—'}`}
                style={{ fontSize: 12, padding: '3px 9px', borderRadius: 12, border: `1px solid ${lineColor(line)}`, color: lineColor(line), background: '#fff' }}>
                {personName(r)} <span data-er-dag="IndividualPredictions.TreatmentLineDecidingFactor" style={{ color: C.sub }}>· {r.treatment_line_deciding_factor}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// CaseWalk — the admin.cohort entry point: now the Cohort Discovery board (the
// corpus-level surface). The per-case walk lives in CaseWalkBody, reused by
// CaseDetail's default pane.
export function CaseWalk() {
  return <CohortDiscovery />;
}

// Each walk level can deep-link to the matching case sub-route, so the walk
// itself is clickable down to its evidence / mechanism / calibration panes.
const LEVEL_SUBROUTE = {
  Intake: null,
  EvidenceAssessed: 'evidence',
  MechanismConfirmed: 'mechanism',
  CalibrationChecked: 'calibration',
  TransportChecked: 'replication',
};

// CaseWalkBody — the upside-down reasoning walk for ONE case (predId from URL).
// No patient picker / header here: those belong to CaseDetail.
export function CaseWalkBody({ predId }) {
  const { data: lc } = useFetch(predId ? `/api/predictions/${predId}/lifecycle` : '/api/health', [predId]);
  const { data: pred } = useFetch(predId ? `/api/predictions/${predId}` : '/api/health', [predId]);
  const { data: dx, loading: dxLoading, error: dxError } = useFetch(predId ? `/api/diagnosis/${predId}` : '/api/health', [predId]);
  if (!pred || pred.error) return <p style={{ color: C.sub }}>Loading case…</p>;

  const ctx = {
    prediction: predId,
    individual: pred.individual,
    mechanism: `cm-${predId.split('-')[1]}`,  // pred-a -> cm-a (oracle convention)
  };
  const visited = new Set(lc?.states || []);
  const terminal = lc?.terminal;
  const actionable = lc?.is_clinically_actionable;

  return (
    <div>
      <p style={{ color: C.sub, fontSize: 13, marginTop: 0 }}>
        An upside-down reasoning model: start from the raw facts, climb the deterministic DAG one level at a time,
        and watch the case branch at its single deciding gate until the conclusion reveals itself.
        <br />Each level links to its detail pane — click any to drill in.
      </p>

      <div style={{ marginTop: 8 }}>
        {LEVELS.map((lvl, i) => {
          const reached = visited.has(lvl.state);
          // the deciding step is the LAST non-terminal level the case reached
          const nextState = LEVELS[i + 1]?.state;
          const isDeciding = reached && (terminal === 'NotActionable') && (!visited.has(nextState) && nextState !== undefined ? !visited.has(nextState) : false) && lc?.states?.[lc.states.length - 2] === lvl.state;
          const sub = LEVEL_SUBROUTE[lvl.state];
          return <WalkStep key={lvl.state} level={lvl} patient={ctx} reached={reached} isDeciding={isDeciding}
            drillTo={sub ? `/diagnosis/case/${predId}` : null} drillTab={sub} />;
        })}
        {/* terminal verdict */}
        <div style={{ paddingLeft: 26, position: 'relative', marginTop: 4 }}>
          <div style={{ position: 'absolute', left: 0, top: 4, width: 16, height: 16, borderRadius: 8, background: actionable ? C.pass : C.fail, border: '2px solid #fff', boxShadow: `0 0 0 1px ${C.border}` }} />
          <div style={{ display: 'inline-block', padding: '10px 16px', borderRadius: 8, background: actionable ? C.bgPass : C.bgFail, border: `1px solid ${actionable ? C.pass : C.fail}` }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: actionable ? C.pass : C.fail }}>
              <span data-er-dag="IndividualPredictions.IsClinicallyActionable">{terminal === 'Actionable' ? 'Clinically actionable' : 'Not clinically actionable'}</span>
            </div>
            <div style={{ fontSize: 12.5, color: C.sub, marginTop: 2 }}>
              IsClinicallyActionable = <span data-er-dag="IndividualPredictions.IsClinicallyActionable">{String(actionable)}</span> · lifecycle terminal = <span data-er-dag="IndividualPredictions.LifecycleStateKey">{terminal}</span>
            </div>
          </div>
        </div>

        {/* the payoff: the full diagnosis writeup, rendered inline as pretty markdown */}
        <div style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>Diagnosis writeup</h3>
            <a href={`/api/diagnosis/${predId}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: C.sub }}>open raw markdown ↗</a>
          </div>
          {dxLoading ? <p style={{ color: C.sub }}>Deriving diagnosis…</p>
            : dxError ? <p style={{ color: C.fail }}>{dxError}</p>
            : (
              <div style={{ background: '#fbfbfb', border: `1px solid ${C.border}`, borderRadius: 8, padding: '4px 20px 16px' }}>
                {typeof dx === 'string' ? <Markdown source={dx} /> : <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(dx, null, 2)}</pre>}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
//  STATE MACHINE VIEWER — every machine on the polymorphic substrate, picked by
//  ?machine. Both diagnosis-lifecycle AND lupus-nephritis-progression render
//  here from the same generic /api/state-machines endpoints; nothing is
//  hardcoded to one machine. Current state is DERIVED (IsCurrent occupancy).
// ===========================================================================

// Terminal-state colour: the diagnosis-lifecycle machine ends in an explicit
// pass/fail (Actionable / NotActionable); a progression machine ends in a
// "worst" clinical state (BiopsyIndicated). Treat a known-good terminal as pass,
// otherwise terminal = the alarm colour, non-terminal = accent.
const GOOD_TERMINAL = new Set(['Actionable']);
const stateBorder = (s) => s.is_terminal ? (GOOD_TERMINAL.has(s.state_key) ? C.pass : C.fail) : C.accent;
const toStateColor = (k) => k === 'Actionable' ? C.pass : (k === 'NotActionable' || k === 'BiopsyIndicated') ? C.fail : C.ink;

export function StateMachineView() {
  const { data: machines, loading: lLoad } = useFetch('/api/state-machines');
  const list = Array.isArray(machines) ? machines : [];
  const [picked, setPicked] = useQueryParam('machine', null);
  const machineId = picked || list[0]?.state_machine_id || 'diagnosis-lifecycle';
  const { data, loading, error } = useFetch(`/api/state-machines/${machineId}`, [machineId]);

  const { machine, states = [], rules = [], transitions = [] } = data || {};

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>State machines</h2>
      <p style={{ color: C.sub, fontSize: 13, marginTop: 0 }}>
        Each is a state machine on the polymorphic substrate; the current state is <strong>DERIVED</strong>
        from raw leaves (an occupancy / <code>IsCurrent</code> field), never entered.
      </p>

      {/* machine picker — every machine in vw_state_machines */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {lLoad ? <span style={{ color: C.sub, fontSize: 13 }}>Loading machines…</span> : list.map((m) => {
          const active = m.state_machine_id === machineId;
          return (
            <button key={m.state_machine_id} onClick={() => setPicked(m.state_machine_id)}
              style={{ padding: '6px 13px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                border: `1px solid ${active ? C.accent : C.border}`, fontWeight: active ? 700 : 500,
                background: active ? C.bgAccent : '#fff', color: active ? C.accent : C.ink }}>
              {m.title || m.state_machine_id}
              <span style={{ color: C.sub, fontSize: 11 }}> · <span data-er-dag="StateMachines.StateCount">{m.state_count}</span> states</span>
            </button>
          );
        })}
      </div>

      {loading ? <p style={{ color: C.sub }}>Loading {machineId}…</p>
        : error ? <p style={{ color: C.fail }}>{error}</p>
          : (
            <>
              <h3 style={{ marginBottom: 4 }}>{machine?.title || machineId}</h3>
              <p style={{ color: C.sub, fontSize: 13, marginTop: 0 }}>{machine?.description}</p>
              <p style={{ color: C.sub, fontSize: 12 }}>Subject: <code>{machine?.subject_table_name}.{machine?.subject_state_column}</code> — the current state is DERIVED, never entered.</p>

              <h3>States</h3>
              <p style={{ color: C.sub, fontSize: 12, marginTop: -6 }}>
                Each state shows its <strong>live cohort occupancy</strong> — how many subjects are
                <em> currently</em> in that state (DERIVED from the <code>IsCurrent</code> occupancy chain,
                never entered). The number is the disease-state simulator's admin witness.
              </p>
              <div style={{ display: 'flex', alignItems: 'stretch', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                {states.map((s, i) => (
                  <React.Fragment key={s.state_key}>
                    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, border: `2px solid ${stateBorder(s)}`, background: s.is_initial ? C.bgAccent : '#fff', fontWeight: 600, fontSize: 13 }}>
                      <span>
                        {s.title || s.state_key}
                        {s.is_initial ? <span style={{ color: C.sub, fontSize: 10 }}> ▸start</span> : null}
                        {s.is_terminal ? <span style={{ color: C.sub, fontSize: 10 }}> ◼end</span> : null}
                      </span>
                      {/* per-state cohort-occupancy strip: current (filled) vs ever (faint) */}
                      <span title={`${s.current_occupancy} currently here · ${s.ever_occupancy} ever passed through`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700,
                          color: s.current_occupancy > 0 ? stateBorder(s) : C.sub }}>
                        <span style={{ display: 'inline-block', minWidth: 18, textAlign: 'center', padding: '1px 6px', borderRadius: 999,
                          background: s.current_occupancy > 0 ? stateBorder(s) : '#eee', color: s.current_occupancy > 0 ? '#fff' : C.sub }}>
                          {s.current_occupancy ?? 0}
                        </span>
                        <span style={{ color: C.sub, fontWeight: 400 }}>now</span>
                        {s.ever_occupancy > s.current_occupancy ? (
                          <span style={{ color: C.sub, fontWeight: 400 }}>· {s.ever_occupancy} ever</span>
                        ) : null}
                      </span>
                    </span>
                    {i < states.length - 1 && !s.is_terminal ? <span style={{ color: C.sub, alignSelf: 'center' }}>→</span> : null}
                  </React.Fragment>
                ))}
              </div>

              <h3>Transition rules ({rules.length})</h3>
              <table style={{ borderCollapse: 'collapse', fontSize: 13, marginBottom: 16 }}>
                <thead><tr>{['From', 'To', 'Guard (raw leaf)', 'Role'].map((h) => <th key={h} style={{ border: `1px solid ${C.border}`, padding: '4px 10px', background: '#f5f5f5', textAlign: 'left' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {rules.map((r) => (
                    <tr key={r.state_transition_rule_id}>
                      <td style={{ border: `1px solid ${C.border}`, padding: '4px 10px' }}><span data-er-dag="StateTransitionRules.FromStateKey">{r.from_state_key}</span></td>
                      <td style={{ border: `1px solid ${C.border}`, padding: '4px 10px', color: toStateColor(r.to_state_key) }}><span data-er-dag="StateTransitionRules.ToStateKey">{r.to_state_key}</span></td>
                      <td style={{ border: `1px solid ${C.border}`, padding: '4px 10px', color: C.sub }}>{r.guard_description}</td>
                      <td style={{ border: `1px solid ${C.border}`, padding: '4px 10px', fontFamily: 'monospace', fontSize: 12 }}>{r.triggered_by_role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3>Recent transitions ({transitions.length})</h3>
              <div style={{ maxHeight: 280, overflow: 'auto', border: `1px solid ${C.border}`, borderRadius: 6 }}>
                <table style={{ borderCollapse: 'collapse', fontSize: 12.5, width: '100%' }}>
                  <thead><tr>{['Subject', 'From', 'To', 'Reason'].map((h) => <th key={h} style={{ border: `1px solid ${C.border}`, padding: '4px 8px', background: '#f5f5f5', textAlign: 'left', position: 'sticky', top: 0 }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {transitions.map((t) => (
                      <tr key={t.state_transition_id || `${t.subject_id}-${t.to_state_key}`}>
                        <td style={{ border: `1px solid ${C.border}`, padding: '4px 8px', fontFamily: 'monospace' }}>{t.subject_id}</td>
                        <td style={{ border: `1px solid ${C.border}`, padding: '4px 8px' }}>{t.from_state_key || '—'}</td>
                        <td style={{ border: `1px solid ${C.border}`, padding: '4px 8px', color: toStateColor(t.to_state_key) }}>{t.to_state_key}</td>
                        <td style={{ border: `1px solid ${C.border}`, padding: '4px 8px', color: C.sub }}>{t.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
    </div>
  );
}

// ===========================================================================
//  ROUTING EDITOR — view the role nav trees; edit a route row.
// ===========================================================================
export function RoutingEditor({ role }) {
  const [reload, setReload] = useState(0);
  const { data, loading, error } = useFetch(`/api/routing/tree?role=${role}`, [role, reload]);
  const [edit, setEdit] = useState(null); // the row being edited
  const [saving, setSaving] = useState(false);

  const renderNode = (n, depth) => (
    <div key={n.routing_and_navigation_id}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', marginLeft: depth * 18, borderRadius: 4, cursor: 'pointer', background: edit?.routing_and_navigation_id === n.routing_and_navigation_id ? C.bgAccent : 'transparent' }}
        onClick={() => setEdit({ ...n })}>
        <span style={{ color: C.sub }}>{n.children?.length ? '▾' : '·'}</span>
        <span style={{ fontWeight: 600, fontSize: 13 }}>{n.display_name}</span>
        <code style={{ fontSize: 11, color: C.sub }}>{n.route}</code>
      </div>
      {(n.children || []).map((c) => renderNode(c, depth + 1))}
    </div>
  );

  async function save() {
    setSaving(true);
    try {
      await send(`/api/routing/${edit.routing_and_navigation_id}`, 'PUT', {
        display_name: edit.display_name, route: edit.route, description: edit.description,
        sort_order: Number(edit.sort_order), role_visibility: edit.role_visibility, icon_hint: edit.icon_hint,
      });
      setReload((x) => x + 1);
    } catch (e) { alert('Save failed: ' + e.message); }
    setSaving(false);
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Routing &amp; Navigation</h2>
      <p style={{ color: C.sub, fontSize: 13 }}>
        Role-based navigation. Each route is a template (<code>/intake/new-patient/:caseId</code>); every entity row carries a
        <code> RelativePath</code> that fills in its own id. Editing the <em>{role}</em> tree.
      </p>
      <p style={{ color: C.not_surfaced, fontSize: 12 }}>
        ⚠ Edits write the Postgres base table; <code>effortless build</code> reseeds from the rulebook hub, so unsaved-to-rulebook edits are overwritten on rebuild.
      </p>
      {loading ? <p>Loading…</p> : error ? <p style={{ color: C.fail }}>{error}</p> : (
        <div style={{ display: 'flex', gap: 18 }}>
          <div style={{ flex: '1 1 50%', border: `1px solid ${C.border}`, borderRadius: 8, padding: 10 }}>
            {(data?.tree || []).map((n) => renderNode(n, 0))}
          </div>
          <div style={{ flex: '1 1 50%' }}>
            {edit ? (
              <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: 14 }}>
                <h3 style={{ marginTop: 0 }}>Edit route</h3>
                {[['display_name', 'Display name'], ['route', 'Route template'], ['description', 'Description'], ['sort_order', 'Sort order'], ['role_visibility', 'Role visibility (CSV)'], ['icon_hint', 'Icon']].map(([k, lbl]) => (
                  <label key={k} style={{ display: 'block', marginBottom: 8, fontSize: 12.5 }}>
                    <div style={{ color: C.sub }}>{lbl}</div>
                    <input value={edit[k] ?? ''} onChange={(e) => setEdit({ ...edit, [k]: e.target.value })} style={{ width: '100%', padding: '5px 8px', border: `1px solid ${C.border}`, borderRadius: 4 }} />
                  </label>
                ))}
                <button onClick={save} disabled={saving} style={{ padding: '7px 14px', borderRadius: 6, border: 'none', background: C.accent, color: '#fff', cursor: 'pointer' }}>{saving ? 'Saving…' : 'Save'}</button>
              </div>
            ) : <p style={{ color: C.sub }}>Select a route to edit.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// ===========================================================================
//  LOOPS EDITOR — edit loop status/goal; regenerate the derived plan.
// ===========================================================================
export function LoopsEditor() {
  const [reload, setReload] = useState(0);
  const { data, loading, error } = useFetch('/api/effortless-loops', [reload]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const loops = Array.isArray(data) ? data : [];

  async function setStatus(id, status) {
    try { await send(`/api/effortless-loops/${id}`, 'PUT', { status }); setReload((x) => x + 1); }
    catch (e) { alert('Save failed: ' + e.message); }
  }
  async function regenerate() {
    setBusy(true); setMsg(null);
    try { const r = await send('/api/effortless-loops/regenerate-plan', 'POST'); setMsg('Plan regenerated.'); }
    catch (e) { setMsg('Regenerate failed: ' + e.message); }
    setBusy(false);
  }
  const STATUSES = ['done', 'next', 'planned', 'backlog'];

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Effortless Loops</h2>
      <p style={{ color: C.sub, fontSize: 13 }}>The CHANGE-RULE → REBUILD → CONSUME loop log. Status drives the generated plan badges.</p>
      <p style={{ color: C.not_surfaced, fontSize: 12 }}>⚠ Edits write the base table; “Regenerate plan” reflects the rulebook rows, not unsaved DB edits.</p>
      <button onClick={regenerate} disabled={busy} style={{ padding: '7px 14px', borderRadius: 6, border: 'none', background: C.accent, color: '#fff', cursor: 'pointer', marginBottom: 12 }}>
        {busy ? 'Regenerating…' : 'Regenerate plan (effortless build)'}
      </button>
      {msg ? <span style={{ marginLeft: 10, fontSize: 13, color: msg.startsWith('Plan') ? C.pass : C.fail }}>{msg}</span> : null}
      {loading ? <p>Loading…</p> : error ? <p style={{ color: C.fail }}>{error}</p> : (
        <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%' }}>
          <thead><tr>{['#', 'Title', 'Status', 'Set'].map((h) => <th key={h} style={{ border: `1px solid ${C.border}`, padding: '4px 8px', background: '#f5f5f5', textAlign: 'left' }}>{h}</th>)}</tr></thead>
          <tbody>
            {loops.map((l) => (
              <tr key={l.effortless_loop_id}>
                <td style={{ border: `1px solid ${C.border}`, padding: '4px 8px' }}>{l.loop_number}</td>
                <td style={{ border: `1px solid ${C.border}`, padding: '4px 8px' }}>{l.title}<div style={{ color: C.sub, fontSize: 11 }}>{l.goal}</div></td>
                <td style={{ border: `1px solid ${C.border}`, padding: '4px 8px', fontFamily: 'monospace' }}>{l.status_badge} {l.status}</td>
                <td style={{ border: `1px solid ${C.border}`, padding: '4px 8px' }}>
                  <select value={l.status} onChange={(e) => setStatus(l.effortless_loop_id, e.target.value)} style={{ fontSize: 12 }}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ===========================================================================
//  EXPLAINER DAG + EXCEL EXPORT — the two "central" Effortless tools.
//  The explainer-dag bundle (generated to /public/rulebook-explainer-dag) makes
//  every derived field clickable to show its provenance. Excel export streams
//  one sheet per table via the rulebook-to-xlsx transpiler.
// ===========================================================================
export function ExplainerView() {
  const [exporting, setExporting] = React.useState(false);
  async function exportXlsx() {
    setExporting(true);
    try {
      const r = await fetch('/api/export.xlsx');
      if (!r.ok) throw new Error('export failed: ' + r.status);
      const blob = await r.blob();
      const a = document.createElement('a');
      const url = URL.createObjectURL(blob);
      a.href = url; a.download = 'causal-autoimmune-export.xlsx'; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { alert(String(e)); }
    setExporting(false);
  }
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Model export &amp; full DAG</h2>
      <p style={{ color: C.sub, fontSize: 13 }}>
        The <strong>Explainer DAG</strong> is not a page you visit — it is live across the whole app: turn on the{' '}
        <strong>ƒ provenance toggle</strong> (pinned at the bottom-left of the nav) and every derived value on every screen
        grows a badge you can hover (RuleSpeak + upstream inputs) or click (its full derivation). This page holds only the two
        whole-model utilities: a one-click <strong>Excel export</strong> of every table including all calculated columns, and a
        link to the standalone DAG browser.
      </p>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 18 }}>
        <button onClick={exportXlsx} disabled={exporting}
          style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: C.accent, color: '#fff', cursor: 'pointer' }}>
          {exporting ? 'Exporting…' : '⬇ Export model to Excel'}
        </button>
        <a href="/rulebook-explainer-dag/pages/index.html" target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>
          open the standalone Explainer DAG browser ↗
        </a>
      </div>

      <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, fontSize: 13, color: C.sub }}>
        <strong style={{ color: C.ink }}>Where to see it:</strong> open any patient&rsquo;s keystone / gates / treatment-line
        view with the ƒ toggle on — the verdict, each gate, the lifecycle state, the deciding factor and the recommended
        treatment line all carry provenance badges that bottom out in the raw observed leaves.
      </div>
    </div>
  );
}

// ===========================================================================
//  OWL SUBSTRATE — cross-substrate conformance (inference kind #7).
//
//  The SAME state-machine reachability is computed two independent ways: a
//  recursive Postgres view (vw_state_transition_rules_closure) and an OWL-RL
//  deductive closure over an owl:TransitiveProperty (run by owl/reason.py).
//  Agreement is the receipt.
//
//  The closure is fundamentally a DIRECTED GRAPH per state machine. Rendering it
//  as a flat 32-row table buries that structure. Instead we draw, per machine:
//    1. a left-to-right STATE CHAIN — the asserted hop-1 edges are the solid
//       backbone; inferred long-range reachability is drawn as arcs ABOVE the
//       chain (so "what was declared" vs "what the closure derived" is visible
//       at a glance, and the keystone intake→actionable arc pops out).
//    2. a REACHABILITY MATRIX — from × to grid, each cell colored asserted /
//       inferred / unreachable. The whole closure on one screen, legibly.
//  The raw row table is preserved in a collapsible <details>.
// ===========================================================================

// Order the states of one machine into a chain by topological depth: a state's
// depth is the longest asserted-edge path that reaches it from a source. Pure
// presentation — derived only from the asserted (hop-1) edges in the closure.
function orderMachineStates(rows) {
  const states = new Set();
  const assertedEdges = []; // [from, to]
  for (const r of rows) {
    states.add(r.from_state); states.add(r.to_state);
    if (!r.is_inferred && r.hop_distance === 1) assertedEdges.push([r.from_state, r.to_state]);
  }
  const succ = new Map(); // from -> [to]
  const indeg = new Map();
  for (const s of states) { succ.set(s, []); indeg.set(s, 0); }
  for (const [f, t] of assertedEdges) { succ.get(f).push(t); indeg.set(t, indeg.get(t) + 1); }
  // Longest-path depth via Kahn-style relaxation (graph is a DAG by construction).
  const depth = new Map([...states].map((s) => [s, 0]));
  const queue = [...states].filter((s) => indeg.get(s) === 0);
  const seen = new Map(indeg);
  while (queue.length) {
    const s = queue.shift();
    for (const t of succ.get(s)) {
      if (depth.get(t) < depth.get(s) + 1) depth.set(t, depth.get(s) + 1);
      seen.set(t, seen.get(t) - 1);
      if (seen.get(t) === 0) queue.push(t);
    }
  }
  return [...states].sort((a, b) => (depth.get(a) - depth.get(b)) || a.localeCompare(b));
}

// One machine drawn as a backbone chain + inferred reachability arcs above it.
function MachineFlow({ machine, rows }) {
  const order = orderMachineStates(rows);
  const idx = new Map(order.map((s, i) => [s, i]));
  const COL = 132, NODE_H = 30, PAD_X = 14, ARC_STEP = 17, TOP_PAD = 22;
  // Headroom for the tallest inferred arc so its curve + "hop n" label aren't clipped.
  const maxSpan = Math.max(0, ...rows.filter((r) => r.is_inferred)
    .map((r) => Math.abs((idx.get(r.to_state) ?? 0) - (idx.get(r.from_state) ?? 0))));
  const BASE_Y = TOP_PAD + Math.min(150, 26 + Math.max(0, maxSpan - 2) * ARC_STEP + 16);
  const width = PAD_X * 2 + (order.length - 1) * COL + 130;
  const nodeX = (s) => PAD_X + idx.get(s) * COL;
  const nodeCx = (s) => nodeX(s) + 56; // center x of a ~112-wide pill

  const asserted = rows.filter((r) => !r.is_inferred && r.hop_distance === 1);
  const inferred = rows.filter((r) => r.is_inferred);
  // Stack inferred arcs by span length so longer reaches sit higher and don't overlap.
  const arcs = inferred
    .map((r) => ({ ...r, span: Math.abs((idx.get(r.to_state) ?? 0) - (idx.get(r.from_state) ?? 0)) }))
    .sort((a, b) => a.span - b.span);

  return (
    <div style={{ overflowX: 'auto', border: `1px solid ${C.border}`, borderRadius: 10, padding: '4px 0 0', background: '#fff' }}>
      <div style={{ fontWeight: 700, fontSize: 13, padding: '8px 14px 2px', color: C.ink }}>
        {machine}
        <span style={{ fontWeight: 400, color: C.sub, fontSize: 12 }}>
          {'  '}— {order.length} states · {asserted.length} asserted edges · {inferred.length} inferred reaches
        </span>
      </div>
      <svg width={width} height={BASE_Y + NODE_H + 14} style={{ display: 'block' }}>
        <defs>
          <marker id="arrA" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
            <path d="M0,0 L7,3 L0,6 Z" fill={C.sub} />
          </marker>
          <marker id="arrI" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
            <path d="M0,0 L7,3 L0,6 Z" fill={C.accent} />
          </marker>
        </defs>

        {/* Inferred reachability arcs, drawn above the backbone. */}
        {arcs.map((r, i) => {
          const x1 = nodeCx(r.from_state), x2 = nodeCx(r.to_state);
          const lift = Math.min(BASE_Y - TOP_PAD, 26 + (r.span - 2) * ARC_STEP + (i % 2) * 8);
          const top = BASE_Y - lift;
          const keystone = r.hop_distance >= 4; // long-range, the headline reaches
          return (
            <g key={`arc-${i}`}>
              <path
                d={`M ${x1} ${BASE_Y} C ${x1} ${top}, ${x2} ${top}, ${x2} ${BASE_Y}`}
                fill="none" stroke={C.accent} strokeWidth={keystone ? 2 : 1}
                strokeDasharray={keystone ? 'none' : '4 3'} opacity={keystone ? 0.95 : 0.5}
                markerEnd="url(#arrI)"
              />
              {keystone && (
                <text x={(x1 + x2) / 2} y={top - 4} textAnchor="middle" fontSize="10.5"
                  fontWeight="700" fill={C.accent}>hop {r.hop_distance}</text>
              )}
            </g>
          );
        })}

        {/* Asserted backbone edges. */}
        {asserted.map((r, i) => {
          const x1 = nodeX(r.from_state) + 112, x2 = nodeX(r.to_state);
          const adjacent = (idx.get(r.to_state) - idx.get(r.from_state)) === 1;
          // Adjacent edges run straight along the backbone; skip-edges dip slightly below.
          const dip = adjacent ? 0 : 22;
          return (
            <path key={`edge-${i}`}
              d={adjacent
                ? `M ${x1} ${BASE_Y} L ${x2} ${BASE_Y}`
                : `M ${nodeCx(r.from_state)} ${BASE_Y + NODE_H / 2} C ${nodeCx(r.from_state)} ${BASE_Y + dip + 14}, ${nodeCx(r.to_state)} ${BASE_Y + dip + 14}, ${nodeCx(r.to_state)} ${BASE_Y + NODE_H / 2}`}
              fill="none" stroke={C.sub} strokeWidth={1.5} markerEnd="url(#arrA)" opacity={0.85} />
          );
        })}

        {/* State nodes. */}
        {order.map((s) => {
          const x = nodeX(s);
          const terminal = !rows.some((r) => r.from_state === s && !r.is_inferred && r.hop_distance === 1);
          return (
            <g key={s}>
              <rect x={x} y={BASE_Y - NODE_H / 2} width={112} height={NODE_H} rx={7}
                fill={terminal ? C.bgAccent : '#f6f8fb'} stroke={terminal ? C.accent : C.border}
                strokeWidth={terminal ? 1.5 : 1} />
              <text x={x + 56} y={BASE_Y + 4} textAnchor="middle" fontSize="11.5"
                fontWeight={terminal ? 700 : 500} fill={C.ink}>{s}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// The from × to reachability matrix for one machine.
function ReachMatrix({ machine, rows }) {
  const order = orderMachineStates(rows);
  const cell = new Map(); // "from to" -> row
  for (const r of rows) cell.set(`${r.from_state} ${r.to_state}`, r);
  const short = (s) => s.length > 9 ? s.slice(0, 8) + '…' : s;
  const th = { padding: '3px 6px', fontSize: 10.5, color: C.sub, fontWeight: 600, whiteSpace: 'nowrap' };
  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ fontWeight: 700, fontSize: 12.5, margin: '10px 0 4px', color: C.ink }}>{machine}</div>
      <table style={{ borderCollapse: 'collapse', fontSize: 11 }}>
        <thead>
          <tr>
            <th style={{ ...th, textAlign: 'right' }}>from ↓ / to →</th>
            {order.map((t) => <th key={t} style={{ ...th, textAlign: 'center' }} title={t}>{short(t)}</th>)}
          </tr>
        </thead>
        <tbody>
          {order.map((f) => (
            <tr key={f}>
              <td style={{ ...th, textAlign: 'right' }} title={f}>{short(f)}</td>
              {order.map((t) => {
                const r = cell.get(`${f} ${t}`);
                const bg = !r ? 'transparent' : r.is_inferred ? C.bgAccent : C.bgPass;
                const fg = !r ? C.border : r.is_inferred ? C.accent : C.pass;
                const mark = f === t ? '·' : !r ? '' : r.is_inferred ? r.hop_distance : '●';
                return (
                  <td key={t} title={r ? `${f} → ${t}: hop ${r.hop_distance}, ${r.is_inferred ? 'inferred' : 'asserted'}` : `${f} → ${t}: unreachable`}
                    style={{ width: 26, height: 24, textAlign: 'center', border: `1px solid ${C.border}`,
                      background: f === t ? '#f4f4f4' : bg, color: fg, fontWeight: 700,
                      fontFamily: 'ui-monospace, monospace' }}>{mark}</td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// What's actually going on — answers "what is this doing / how does it use the
// reasoner / how do the substrates line up". Kept as plain prose + the two REAL
// artifacts (the recursive SQL view and the OWL axiom) so the page is
// self-explanatory, not just a green checkmark.
function OwlExplainer({ counts, pass }) {
  const codeBox = { background: '#0f1117', color: '#cbd5e1', padding: '10px 12px', borderRadius: 8,
    fontSize: 11.5, lineHeight: 1.5, overflowX: 'auto', margin: 0, fontFamily: 'ui-monospace, monospace' };
  const card = { flex: '1 1 320px', minWidth: 300, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px', background: '#fff' };
  const kbd = { background: '#eef1f5', borderRadius: 4, padding: '0 5px', fontFamily: 'ui-monospace, monospace', fontSize: '0.92em' };
  return (
    <details open style={{ margin: '0 0 18px', border: `1px solid ${C.border}`, borderRadius: 12, background: '#fafbfd' }}>
      <summary style={{ cursor: 'pointer', fontSize: 14, fontWeight: 700, color: C.ink, padding: '12px 16px' }}>
        What is this page actually doing?
      </summary>
      <div style={{ padding: '0 16px 16px' }}>
        <p style={{ color: C.ink, fontSize: 13, maxWidth: 880, marginTop: 0 }}>
          The state machines (diagnosis-lifecycle, lupus-nephritis-progression) are declared in the rulebook with only the
          <strong> short, adjacent edges</strong> — <span style={kbd}>intake → evidenceassessed</span>,{' '}
          <span style={kbd}>evidenceassessed → mechanismconfirmed</span>, and so on. Nobody ever wrote down{' '}
          <span style={kbd}>intake → actionable</span>. The interesting question — <em>"which states can ultimately reach
          which?"</em> — is the <strong>transitive closure</strong> of those edges. This page proves that closure is computed{' '}
          <strong>the same way in two unrelated engines</strong>, from one declaration, with nothing hand-typed.
        </p>

        {/* The three-stage flow: one model -> two substrates -> diff. */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch', gap: 10, margin: '10px 0 14px' }}>
          <div style={{ ...card, background: C.bgAccent, flexBasis: 240 }}>
            <div style={{ fontWeight: 700, fontSize: 12.5, color: C.accent }}>① ONE declared model</div>
            <div style={{ fontSize: 12, color: C.sub, marginTop: 4 }}>
              The rulebook's <span style={kbd}>StateTransitionRules</span> — {counts ? counts.owlAsserted : 14} asserted{' '}
              <span style={kbd}>FromState → ToState</span> edges. The single source of truth. <code>effortless build</code>{' '}
              projects it to <em>both</em> substrates below.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', color: C.sub, fontSize: 20 }}>→</div>
          <div style={card}>
            <div style={{ fontWeight: 700, fontSize: 12.5, color: C.ink }}>② Postgres closes it</div>
            <div style={{ fontSize: 12, color: C.sub, marginTop: 4 }}>
              <code>rulebook-to-postgres</code> emits a <strong>WITH RECURSIVE</strong> view that walks the edges and
              accumulates every reachable pair. Served as <span style={kbd}>vw_state_transition_rules_closure</span>.
            </div>
          </div>
          <div style={card}>
            <div style={{ fontWeight: 700, fontSize: 12.5, color: C.ink }}>② OWL-RL closes it</div>
            <div style={{ fontSize: 12, color: C.sub, marginTop: 4 }}>
              <code>rulebook-to-owl</code> emits the SAME edges as a <strong>TransitiveProperty</strong>. An off-the-shelf
              reasoner (<code>owlrl</code>, run by <span style={kbd}>owl/reason.py</span>) deduces every reachable pair on its own.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', color: C.sub, fontSize: 20 }}>→</div>
          <div style={{ ...card, background: pass ? C.bgPass : C.bgFail, flexBasis: 230 }}>
            <div style={{ fontWeight: 700, fontSize: 12.5, color: pass ? C.pass : C.fail }}>③ Diff the two sets</div>
            <div style={{ fontSize: 12, color: C.sub, marginTop: 4 }}>
              <span style={kbd}>owl/reason.py</span> compares the two reachability sets. <strong>Set equality is the
              receipt</strong> — {counts ? `${counts.owlTotal} pairs, identical` : 'identical sets'}. Exit 0 iff they agree.
            </div>
          </div>
        </div>

        {/* The two REAL artifacts, side by side: same reasoning, two languages. */}
        <p style={{ fontSize: 12.5, color: C.ink, margin: '6px 0 6px', fontWeight: 600 }}>
          Why does this matter? Because the reachability is <em>not</em> SQL-specific — it falls out of the model itself.
          Here is the exact same rule expressed twice:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ flex: '1 1 360px', minWidth: 320 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: C.sub, marginBottom: 4 }}>
              Postgres — recursive walk (generated)
            </div>
            <pre style={codeBox}>{`WITH RECURSIVE closure AS (
  -- base: the asserted edges (hop 1)
  SELECT from_id, to_id, 1 AS hop ...
  UNION ALL
  -- step: extend each path by one edge,
  --       skip visited nodes (cycle-safe)
  SELECT cl.from_id, e.to_id, cl.hop+1 ...
  FROM closure cl JOIN edges e
    ON e.from_id = cl.to_id
)`}</pre>
          </div>
          <div style={{ flex: '1 1 360px', minWidth: 320 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: C.sub, marginBottom: 4 }}>
              OWL — one axiom, the reasoner does the rest (generated)
            </div>
            <pre style={codeBox}>{`# the edge relation is declared transitive:
effortless-ntwf:progression
    a owl:ObjectProperty , owl:TransitiveProperty .

# then ONLY the asserted edges are stated:
:intake          :progression :evidenceassessed .
:evidenceassessed :progression :mechanismconfirmed .
# … owlrl deduces intake→actionable itself.`}</pre>
          </div>
        </div>
        <p style={{ fontSize: 12, color: C.sub, margin: '8px 0 0' }}>
          <strong>How they line up with the rulebook:</strong> both blocks are <em>generated</em> from the one{' '}
          <span style={kbd}>StateTransitionRules</span> table on every <code>effortless build</code> — the SQL by{' '}
          <code>rulebook-to-postgres</code>, the TTL by <code>rulebook-to-owl</code>. Neither closure is authored by hand;
          editing an edge in the rulebook changes <em>both</em>, and this receipt re-checks that they still agree.{' '}
          <strong>Worked example:</strong> <span style={kbd}>intake → actionable</span> appears in neither table, yet both
          engines derive it at <strong>hop 5</strong> (intake → evidenceassessed → mechanismconfirmed → calibrationchecked →
          transportchecked → actionable). It shows up below as an <span style={{ color: C.accent, fontWeight: 700 }}>inferred</span> arc.
        </p>
      </div>
    </details>
  );
}

export function OwlView() {
  const { data: conf, loading: cl } = useFetch('/api/owl/conformance');
  const { data: clo, loading: ll } = useFetch('/api/owl/closure');
  const pass = conf?.pass === true;

  // Group the flat closure rows by machine for the per-machine visualizations.
  const byMachine = {};
  for (const r of (clo?.pairs || [])) (byMachine[r.machine] ||= []).push(r);
  const machines = Object.keys(byMachine).sort();

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>OWL substrate — cross-substrate conformance</h2>
      <p style={{ color: C.sub, fontSize: 13, maxWidth: 820 }}>
        Inference kind #7. The disease/diagnosis state machines store only sparse <code>FromState → ToState</code>{' '}
        edges. The full <strong>reachability ordering</strong> (including never-asserted long-range pairs like{' '}
        <code>intake → actionable</code>) is computed two independent ways and checked for agreement: a recursive
        <strong> Postgres</strong> view, and an <strong>OWL-RL</strong> deductive closure over an{' '}
        <code>owl:TransitiveProperty</code> (run by <code>owl/reason.py</code>). The reasoning is substrate-independent —
        not SQL-specific. <strong>Agreement is the receipt.</strong>
      </p>

      {/* The live PASS/FAIL receipt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10,
        background: cl ? '#f4f4f4' : pass ? C.bgPass : C.bgFail, border: `1px solid ${cl ? C.border : pass ? C.pass : C.fail}`, marginBottom: 16 }}>
        <span style={{ fontSize: 22 }}>{cl ? '⏳' : pass ? '✅' : '⛔'}</span>
        <div>
          <div style={{ fontWeight: 700, color: cl ? C.sub : pass ? C.pass : C.fail }}>
            {cl ? 'Running the OWL-RL reasoner…' : pass ? 'CONFORMANCE PASS — the two substrates agree exactly'
              : 'CONFORMANCE FAIL — the substrates disagree'}
          </div>
          {conf?.counts && (
            <div style={{ fontSize: 12.5, color: C.sub, marginTop: 2 }}>
              OWL-RL closure = {conf.counts.owlTotal} pairs · Postgres closure = {conf.counts.pgTotal} pairs ·{' '}
              {conf.counts.owlAsserted} asserted + {conf.counts.owlInferred} inferred.
              {conf.headlinePairPresent ? ' Long-range intake → actionable (hop 5) present in both.' : ''}
            </div>
          )}
        </div>
      </div>

      {/* What is actually happening — the three questions this page must answer. */}
      <OwlExplainer counts={conf?.counts} pass={pass} />

      {/* Legend for the diagrams below. */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', fontSize: 12, color: C.sub, margin: '0 0 10px' }}>
        <span style={{ fontWeight: 700, color: C.ink }}>Reachability</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <svg width="34" height="10"><line x1="0" y1="5" x2="28" y2="5" stroke={C.sub} strokeWidth="1.5" /><path d="M28,2 L34,5 L28,8 Z" fill={C.sub} /></svg>
          asserted edge (declared, hop&nbsp;1)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <svg width="34" height="10"><line x1="0" y1="5" x2="30" y2="5" stroke={C.accent} strokeWidth="1.5" strokeDasharray="4 3" /></svg>
          inferred reach (derived by the closure)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: C.bgAccent, border: `1.5px solid ${C.accent}`, display: 'inline-block' }} />
          terminal / keystone state
        </span>
      </div>

      {/* Per-machine flow diagrams — the asserted backbone + inferred arcs. */}
      {ll ? <p style={{ color: C.sub }}>Loading closure…</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {machines.map((m) => <MachineFlow key={m} machine={m} rows={byMachine[m]} />)}
        </div>
      )}

      {/* Per-machine reachability matrices. */}
      {!ll && machines.length > 0 && (
        <details open style={{ marginTop: 18 }}>
          <summary style={{ cursor: 'pointer', fontSize: 13.5, fontWeight: 700, color: C.ink }}>
            Reachability matrix
            {clo?.counts && <span style={{ fontWeight: 400, color: C.sub, fontSize: 12.5 }}>
              {'  '}— {clo.counts.total} pairs · {clo.counts.asserted} asserted · {clo.counts.inferred} inferred · max hop {clo.counts.maxHop}</span>}
          </summary>
          <p style={{ color: C.sub, fontSize: 12, margin: '6px 0 8px' }}>
            <span style={{ color: C.pass, fontWeight: 700 }}>●</span> = asserted edge ·{' '}
            <span style={{ color: C.accent, fontWeight: 700 }}>n</span> = inferred reach at hop <em>n</em> ·{' '}
            blank = unreachable. Read a cell as <em>from-row → to-column</em>.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28 }}>
            {machines.map((m) => <ReachMatrix key={m} machine={m} rows={byMachine[m]} />)}
          </div>
        </details>
      )}

      {/* The raw closure row table, tucked away for anyone who wants the rows. */}
      <details style={{ marginTop: 14 }}>
        <summary style={{ cursor: 'pointer', fontSize: 13, color: C.accent }}>Show the raw closure rows ({clo?.counts?.total ?? 0})</summary>
        <div style={{ maxHeight: 360, overflow: 'auto', border: `1px solid ${C.border}`, borderRadius: 8, marginTop: 8 }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: '#fafafa', textAlign: 'left' }}>
                <th style={{ padding: '6px 10px', position: 'sticky', top: 0, background: '#fafafa' }}>Machine</th>
                <th style={{ padding: '6px 10px', position: 'sticky', top: 0, background: '#fafafa' }}>From</th>
                <th style={{ padding: '6px 10px', position: 'sticky', top: 0, background: '#fafafa' }}>→ To</th>
                <th style={{ padding: '6px 10px', position: 'sticky', top: 0, background: '#fafafa' }}>Hop</th>
                <th style={{ padding: '6px 10px', position: 'sticky', top: 0, background: '#fafafa' }}>Kind</th>
              </tr>
            </thead>
            <tbody>
              {(clo?.pairs || []).map((r, i) => (
                <tr key={i} style={{ background: r.is_inferred ? C.bgAccent : 'transparent', borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: '5px 10px', color: C.sub }}>{r.machine}</td>
                  <td style={{ padding: '5px 10px' }}>{r.from_state}</td>
                  <td style={{ padding: '5px 10px' }}>{r.to_state}</td>
                  <td style={{ padding: '5px 10px', fontFamily: 'ui-monospace, monospace' }}>{r.hop_distance}</td>
                  <td style={{ padding: '5px 10px', fontWeight: 600, color: r.is_inferred ? C.accent : C.sub }}>
                    {r.is_inferred ? 'inferred' : 'asserted'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <details style={{ marginTop: 14 }}>
        <summary style={{ cursor: 'pointer', fontSize: 13, color: C.accent }}>Show the raw reasoner output (owl/reason.py)</summary>
        <pre style={{ background: '#0f1117', color: '#cbd5e1', padding: 12, borderRadius: 8, fontSize: 11.5, overflow: 'auto', marginTop: 8 }}>
          {conf?.raw || '(run pending)'}
        </pre>
        <div style={{ fontSize: 12, color: C.sub }}>
          Generated ontology: <code>owl/src/ontology.owl</code> · <code>owl/src/individuals.ttl</code> ·{' '}
          <code>owl/src/rules.shacl.ttl</code>. Receipt gate runs on every <code>effortless build</code>.
        </div>
      </details>
    </div>
  );
}

// ===========================================================================
//  INTAKE WORKSPACE — the /intake/new-patient/:caseId pages.
//
//  This is the LEAF/OBSERVATION end of the model (the project's "intake clerk +
//  lab" surface). It surfaces EXACTLY the two things the LLM/human may produce —
//  interpreted intake facts and synthetic-but-transparent test results — as
//  editable rows, and nothing above them. The conclusion is never shown here;
//  it lives in /diagnosis. The four tabs map 1:1 to the rulebook nav nodes:
//    Observations   the individual's raw intake facts + case narrative (vw_individuals)
//    Variants       the candidate genomic variants            (vw_genomic_variants)
//    Assays         the omics assays / quality leaves          (vw_omics_assays)
//    Submit Case    the raw-facts-in → derived-diagnosis-out form (POST /api/intake)
//
//  :caseId is resolved id-or-slug by the server, so a link from anywhere (nav
//  uses individual_id; entity relative_paths use the slug) lands here.
// ===========================================================================

const INTAKE_TABS = [
  ['observations', 'Observations'],
  ['variants', 'Variants'],
  ['assays', 'Assays'],
  ['submit', 'Submit Case'],
];

// IntakeWorkspace — the shell. Path = which patient (:caseId). ?tab = which of
// the four sub-panes. Submit-case is patient-independent (it CREATES one), so it
// renders without needing a resolved patient.
export function IntakeWorkspace({ caseId, routeKey }) {
  const { query } = useLocation();
  const { data: patients } = useFetch('/api/patients');
  const list = Array.isArray(patients) ? patients : [];

  // sub from ?tab; fall back to the route_key's trailing segment so the legacy
  // path form (/intake/new-patient/:caseId/variants) still opens that pane.
  const fromRouteKey = (routeKey || 'intake.new-patient').replace(/^intake\.new-patient\.?/, '');
  const sub = query.has('tab') ? query.get('tab') : (fromRouteKey || 'observations');

  const tabQuery = (k) => {
    const next = new URLSearchParams(query);
    if (k && k !== 'observations') next.set('tab', k); else next.delete('tab');
    return next;
  };

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Intake — new patient</h2>
      <p style={{ color: C.sub, fontSize: 13, marginTop: 0 }}>
        The <strong>leaf layer</strong>: raw intake facts and synthetic-but-transparent test results — the only two
        things the LLM/human produces. Everything above these (gates, keystone, the diagnosis) is{' '}
        <strong>derived</strong> and lives under{' '}
        <Link to="/diagnosis" query={{ role: 'diagnosing-doctor' }} style={{ color: C.accent }}>Diagnosis</Link>.
      </p>

      {/* Which case these leaves belong to. Each chip rewrites ONLY the path,
          keeping ?tab — so switching patients keeps you on the same sub-pane.
          (Submit Case ignores it — it creates a brand-new patient.) */}
      {sub !== 'submit' && list.length ? (
        <IntakePatientChips list={list} caseId={caseId} keepQuery={query} />
      ) : null}

      <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${C.border}`, marginBottom: 14, flexWrap: 'wrap' }}>
        {INTAKE_TABS.map(([k, lbl]) => {
          const active = sub === k;
          return (
            <Link key={k} to={`/intake/new-patient/${caseId || ''}`} query={tabQuery(k)}
              style={{ padding: '7px 14px', borderBottom: `2px solid ${active ? C.accent : 'transparent'}`, color: active ? C.ink : C.sub, fontWeight: active ? 700 : 500, fontSize: 14 }}>
              {lbl}
            </Link>
          );
        })}
      </div>

      <IntakePane sub={sub} caseId={caseId} />
    </div>
  );
}

// Patient chips that link to the INTAKE route (not the diagnosis route), keying
// the path off caseId (individual id-or-slug). Active when this chip's id OR
// slug matches the current :caseId.
function IntakePatientChips({ list, caseId, keepQuery }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
      {list.map((p) => {
        const active = caseId === p.individual || caseId === p.slug;
        return (
          <Link key={p.individual}
            to={`/intake/new-patient/${p.individual}`}
            query={keepQuery}
            title={`${p.individual_ancestry_label}${p.is_ancestry_holdout ? ', holdout' : ''}`}
            style={{
              padding: '6px 10px', borderRadius: 6, border: `1px solid ${active ? C.ink : C.border}`,
              background: active ? '#222' : '#fff', color: active ? '#fff' : C.ink, fontSize: 13,
            }}>
            {p.individual}
          </Link>
        );
      })}
    </div>
  );
}

function IntakePane({ sub, caseId }) {
  switch (sub) {
    case 'variants': return <IntakeLeafList caseId={caseId} cfg={INTAKE_LEAF_CONFIG.variants} sub="variants" />;
    case 'assays': return <IntakeLeafList caseId={caseId} cfg={INTAKE_LEAF_CONFIG.assays} sub="assays" />;
    case 'submit': return <SubmitCase />;
    case 'observations':
    default: return <ObservationsPane caseId={caseId} />;
  }
}

// ---- Observations: the individual's raw intake facts + case narrative --------
// The "history → raw observation rows" layer: who the patient is and the facts
// a clinician records. The derived rollups (burden score, confirmed-node counts)
// are shown muted, clearly marked as computed-downstream, not entered here.
function ObservationsPane({ caseId }) {
  const { data, loading, error } = useFetch(caseId ? `/api/individuals/${caseId}` : null, [caseId]);
  if (!caseId) return <p style={{ color: C.sub }}>No patient selected.</p>;
  if (loading) return <p style={{ color: C.sub }}>Loading observations…</p>;
  if (error) return <p style={{ color: C.fail }}>{error}</p>;
  const r = data && !data.error ? data : null;
  if (!r) return <p style={{ color: C.sub }}>No individual found for “{caseId}”.</p>;

  // Raw intake facts (the LLM/human leaf layer) vs derived rollups (computed by
  // the views downstream — shown for context, never editable here).
  const RAW = [
    ['name', 'Patient'],
    ['ancestry_label', 'Ancestry', (v) => <AncestryChip label={v} />],
    ['age_years', 'Age (years)'],
    ['enrollment_date', 'Enrolled', (v) => (v ? String(v).slice(0, 10) : '—')],
    ['federated_dataset_node_label', 'Federated node'],
    ['is_ancestry_absent_from_training', 'Ancestry absent from training', (v) => <BoolPill value={v} yes="absent (holdout)" no="in training" />],
    ['has_cryptic_relatedness_flag', 'Cryptic-relatedness flag', (v) => <BoolPill value={v} yes="flagged" no="clean" />],
  ];
  const DERIVED = [
    ['count_of_genomic_variants', 'Candidate variants', null, 'Individuals.CountOfGenomicVariants'],
    ['count_of_causal_mechanisms', 'Mechanisms', null, 'Individuals.CountOfCausalMechanisms'],
    ['rare_variant_burden_score', 'Rare-variant burden', (v) => <MeterCell value={v} max={0.1} good digits={3} />, 'Individuals.RareVariantBurdenScore'],
    ['count_confirmed_causal_nodes', 'Confirmed causal nodes', null, 'Individuals.CountConfirmedCausalNodes'],
    ['has_high_severity_phenotype', 'High-severity phenotype', (v) => <BoolPill value={v} yes="present" no="none" />, 'Individuals.HasHighSeverityPhenotype'],
  ];

  return (
    <div>
      <FactTable title="Raw intake facts" blurb="What the intake clerk records — the leaf layer. These are the editable knobs (interpreted by the LLM/human from the case)." rows={RAW} src={r} />
      {r.case_narrative ? (
        <section style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', marginBottom: 14, background: '#fff' }}>
          <h3 style={{ margin: '0 0 6px', fontSize: 15 }}>Case narrative</h3>
          <p style={{ color: C.sub, fontSize: 12, margin: '0 0 8px' }}>The presenting story the leaf facts were read from — the provenance every extracted fact points back into.</p>
          <p style={{ fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>{r.case_narrative}</p>
        </section>
      ) : null}
      <FactTable title="Derived rollups" muted blurb="Computed downstream by the views (not entered here) — shown for context only." rows={DERIVED} src={r} />
      <div style={{ fontSize: 12.5, color: C.sub, marginTop: 4 }}>
        Drill into this patient's leaves:{' '}
        <Link to={`/intake/new-patient/${caseId}`} query={{ tab: 'variants' }} style={{ color: C.accent }}>variants</Link>
        {' · '}
        <Link to={`/intake/new-patient/${caseId}`} query={{ tab: 'assays' }} style={{ color: C.accent }}>assays</Link>
        {' — or see the '}
        <Link to={`/diagnosis/case/pred-${r.slug}`} query={{ role: 'diagnosing-doctor' }} style={{ color: C.accent }}>derived diagnosis ›</Link>
      </div>
    </div>
  );
}

// A label/value fact table — the spreadsheet-row look used across the intake
// panes. `rows` is [[key, label, render?]]; `render(value, row)` is optional.
function FactTable({ title, blurb, rows, src, muted }) {
  return (
    <section style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', marginBottom: 14, background: muted ? '#fafafa' : '#fff' }}>
      <h3 style={{ margin: '0 0 2px', fontSize: 15, color: muted ? C.sub : C.ink }}>{title}</h3>
      {blurb ? <p style={{ color: C.sub, fontSize: 12, margin: '0 0 10px' }}>{blurb}</p> : null}
      <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%' }}>
        <tbody>
          {rows.map(([k, lbl, render, dag]) => {
            const cell = render ? render(src[k], src) : fmtVal(src[k]);
            return (
              <tr key={k}>
                <td style={{ padding: '4px 14px 4px 0', color: C.sub, verticalAlign: 'top', whiteSpace: 'nowrap', width: 1 }}>{lbl}</td>
                <td style={{ padding: '4px 0' }}>{dag ? <span data-er-dag={dag}>{cell}</span> : cell}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

// ---- Variants / Assays: the leaf lists (reuse the LeafDrawer pattern) --------
// Same look as the diagnosis leaf tables, but scoped to the individual (caseId)
// rather than a mechanism, and addressing rows by ?panel so a refresh / shared
// link reopens the same leaf.
const INTAKE_LEAF_CONFIG = {
  variants: {
    title: 'Candidate genomic variants', noun: 'variant', idField: 'genomic_variant_id',
    endpoint: (c) => `/api/individuals/${c}/variants`,
    cols: [
      ['genomic_variant_id', 'ID'],
      ['variant_label', 'Variant'],
      ['variant_type_label', 'Type', (r) => <span data-er-dag="GenomicVariants.VariantTypeLabel">{fmtVal(r.variant_type_label)}</span>],
      ['allele_frequency', 'Allele freq', (r) => <MeterCell value={r.allele_frequency} max={0.5} digits={3} />],
      ['is_rare_variant', 'Rare', (r) => <span data-er-dag="GenomicVariants.IsRareVariant"><BoolPill value={r.is_rare_variant} yes="rare" no="common" /></span>],
      ['has_allele_specific_expression', 'ASE', (r) => <BoolPill value={r.has_allele_specific_expression} yes="present" no="absent" />],
      ['is_causal_candidate', 'Candidate', (r) => <span data-er-dag="GenomicVariants.IsCausalCandidate"><BoolPill value={r.is_causal_candidate} yes="candidate" no="no" /></span>],
    ],
  },
  assays: {
    title: 'Omics assays', noun: 'assay', idField: 'omics_assay_id',
    endpoint: (c) => `/api/individuals/${c}/assays`,
    cols: [
      ['omics_assay_id', 'ID'],
      ['modality_label', 'Modality', (r) => <span data-er-dag="OmicsAssays.ModalityLabel">{fmtVal(r.modality_label)}</span>],
      ['tissue_label', 'Tissue', (r) => <span data-er-dag="OmicsAssays.TissueLabel">{fmtVal(r.tissue_label)}</span>],
      ['batch_id', 'Batch'],
      ['measurement_error_score', 'Meas. error', (r) => <MeterCell value={r.measurement_error_score} max={0.3} digits={3} />],
      ['has_batch_effect_risk', 'Batch risk', (r) => <span data-er-dag="OmicsAssays.HasBatchEffectRisk"><BoolPill value={r.has_batch_effect_risk} yes="at risk" no="clean" /></span>],
      ['is_high_quality_assay', 'Quality', (r) => <span data-er-dag="OmicsAssays.IsHighQualityAssay"><BoolPill value={r.is_high_quality_assay} yes="high" no="low" /></span>],
    ],
  },
};

function IntakeLeafList({ caseId, cfg, sub }) {
  const [panel, setPanel] = useQueryParam('panel');
  const { data, loading, error } = useFetch(caseId ? cfg.endpoint(caseId) : null, [caseId]);
  const rows = Array.isArray(data) ? data : [];
  const openId = panel && panel.startsWith(`${sub}:`) ? panel.slice(sub.length + 1) : null;
  const openRow = rows.find((r) => String(r[cfg.idField]) === openId);
  if (!caseId) return <p style={{ color: C.sub }}>No patient selected.</p>;
  return (
    <div>
      <h3 style={{ marginTop: 0 }}>{cfg.title} <span style={{ color: C.sub, fontWeight: 400, fontSize: 13 }}>({rows.length})</span></h3>
      <p style={{ color: C.sub, fontSize: 12.5, marginTop: 0 }}>
        Raw leaf rows for this patient. Click any {cfg.noun} to open its full detail — it stays in the URL, so a refresh
        (or a shared link) reopens the same one. The bold columns are <strong>derived</strong> (computed by the views);
        the rest are raw intake values.
      </p>
      {loading ? <p style={{ color: C.sub }}>Loading…</p> : error ? <p style={{ color: C.fail }}>{error}</p> : !rows.length ? <p style={{ color: C.sub }}>No rows.</p> : (
        <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%' }}>
          <thead><tr>{cfg.cols.map(([, h]) => <th key={h} style={{ border: `1px solid ${C.border}`, padding: '4px 8px', background: '#f5f5f5', textAlign: 'left' }}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((r) => {
              const id = String(r[cfg.idField]);
              const isOpen = id === openId;
              return (
                <tr key={id} onClick={() => setPanel(isOpen ? null : `${sub}:${id}`)}
                  style={{ cursor: 'pointer', background: isOpen ? C.bgAccent : 'transparent' }}>
                  {cfg.cols.map(([k, , render]) => <td key={k} style={{ border: `1px solid ${C.border}`, padding: '5px 8px', fontFamily: /id$/.test(k) ? 'ui-monospace, monospace' : 'inherit', whiteSpace: 'nowrap' }}>{render ? render(r) : fmtVal(r[k])}</td>)}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {openRow ? <LeafDrawer title={`${cfg.noun} · ${openId}`} row={openRow} onClose={() => setPanel(null)} /> : null}
    </div>
  );
}

// ===========================================================================
//  SUBMIT CASE — the write path made interactive. The form collects ONLY raw
//  leaf observations (the exact intake contract in server/intake.js), POSTs
//  /api/intake, and shows the DERIVED panel + diagnosis the server computes
//  downstream. The conclusion is never an input — that's the whole point.
//  It is prefilled with a worked example so a single click demonstrates the
//  raw-facts-in → diagnosis-out round trip; every field is editable.
// ===========================================================================

// A minimal, valid worked example (mirrors an oracle-style positive case). All
// values here are RAW leaves — nothing derived. Editing any of them and
// resubmitting is the "nudge a knob" demonstration.
const SAMPLE_INTAKE = {
  given_name: 'Jordan', family_name: 'Demo',
  ancestry_label: 'European', federated_dataset: 'fed-europe',
  age_years: '41', enrollment_date: '2024-02-01',
  is_ancestry_absent_from_training: false, has_cryptic_relatedness_flag: false,
  variant_type: 'regulatory', allele_frequency: '0.007', has_allele_specific_expression: true,
  mechanism_type: 'cis-regulatory', has_pleiotropy: false,
  autoimmune_disease: 'sle', prediction_type: 'onset-risk',
  // child rows as compact editable JSON (raw leaves only)
  assays: JSON.stringify([
    { omics_modality: 'rna-seq', tissue: 'blood', batch_id: 'b1', measurement_error_score: 0.05, has_cell_state_specific_effect: true },
    { omics_modality: 'atac-seq', tissue: 'blood', batch_id: 'b1', measurement_error_score: 0.06 },
  ], null, 2),
  evidence: JSON.stringify([
    { omics_assay_ref: 'a0', effect_size: 0.91, standard_error: 0.20, is_adjusted_for_ancestry_pcs: true, is_adjusted_for_batch: true },
    { omics_assay_ref: 'a1', effect_size: 0.73, standard_error: 0.19, is_cross_modality: true, is_adjusted_for_ancestry_pcs: true, is_adjusted_for_batch: true },
  ], null, 2),
  replications: JSON.stringify([
    { replication_ancestry_label: 'East Asian', replication_effect_sign: 1, replication_p_value: 0.004 },
    { replication_ancestry_label: 'African', replication_effect_sign: 1, replication_p_value: 0.013 },
  ], null, 2),
  controls: JSON.stringify([
    { test_kind: 'permutation', permutation_effect_size: 0.012, null_threshold: 0.1 },
    { test_kind: 'permutation', permutation_effect_size: 0.028, null_threshold: 0.1 },
  ], null, 2),
  interventionTargets: JSON.stringify([
    { target_label: 'anti-IFNAR1', therapy_class: 'biologic', is_validated: true },
  ], null, 2),
  calibration: JSON.stringify([
    { predicted_probability_band: 0.1, observed_event_rate: 0.09, coverage_count: 31 },
    { predicted_probability_band: 0.9, observed_event_rate: 0.88, coverage_count: 29 },
  ], null, 2),
};

function fieldStyle(extra = {}) {
  return { width: '100%', boxSizing: 'border-box', padding: '6px 8px', borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: 'inherit', ...extra };
}

function SubmitCase() {
  const [f, setF] = useState(SAMPLE_INTAKE);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);
  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setF((p) => ({ ...p, [k]: v }));
  };

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr(null); setResult(null);
    // Build the intake payload from the raw fields. The JSON textareas are the
    // child-row arrays; parse them here so a typo fails loudly before the POST.
    let payload;
    try {
      const num0 = (v) => (v === '' || v == null ? undefined : Number(v));
      payload = {
        individual: {
          given_name: f.given_name, family_name: f.family_name,
          ancestry_label: f.ancestry_label, federated_dataset: f.federated_dataset,
          age_years: num0(f.age_years), enrollment_date: f.enrollment_date || undefined,
          is_ancestry_absent_from_training: !!f.is_ancestry_absent_from_training,
          has_cryptic_relatedness_flag: !!f.has_cryptic_relatedness_flag,
        },
        variant: {
          variant_type: f.variant_type, allele_frequency: num0(f.allele_frequency),
          has_allele_specific_expression: !!f.has_allele_specific_expression,
        },
        mechanism: { mechanism_type: f.mechanism_type, has_pleiotropy: !!f.has_pleiotropy },
        prediction: { autoimmune_disease: f.autoimmune_disease, prediction_type: f.prediction_type },
        assays: JSON.parse(f.assays || '[]'),
        evidence: JSON.parse(f.evidence || '[]'),
        replications: JSON.parse(f.replications || '[]'),
        controls: JSON.parse(f.controls || '[]'),
        interventionTargets: JSON.parse(f.interventionTargets || '[]'),
        calibration: JSON.parse(f.calibration || '[]'),
      };
    } catch (parseErr) {
      setErr('One of the JSON sections is malformed: ' + parseErr.message);
      setBusy(false);
      return;
    }
    try {
      const r = await send('/api/intake', 'POST', payload);
      setResult(r);
    } catch (e2) {
      // server returns {error, detail} — surface the detail (it names the knob).
      let msg = e2.message;
      try { const j = JSON.parse(msg); msg = j.detail || j.error || msg; } catch { /* plain */ }
      setErr(msg);
    }
    setBusy(false);
  }

  const txt = (k, label, ph) => (
    <label style={{ display: 'block', fontSize: 12, color: C.sub }}>
      {label}
      <input value={f[k] ?? ''} onChange={set(k)} placeholder={ph} style={fieldStyle({ marginTop: 3 })} />
    </label>
  );
  const chk = (k, label) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: C.ink, padding: '4px 0' }}>
      <input type="checkbox" checked={!!f[k]} onChange={set(k)} />
      {label}
    </label>
  );
  const jsonArea = (k, label, blurb) => (
    <label style={{ display: 'block', fontSize: 12, color: C.sub, marginTop: 10 }}>
      {label}{blurb ? <span style={{ fontWeight: 400 }}> — {blurb}</span> : null}
      <textarea value={f[k] ?? ''} onChange={set(k)} rows={Math.min(12, (f[k] || '').split('\n').length + 1)}
        spellCheck={false} style={fieldStyle({ marginTop: 3, fontFamily: 'ui-monospace, monospace', fontSize: 12, lineHeight: 1.4, resize: 'vertical' })} />
    </label>
  );

  // After a successful submit, show the DERIVED result — the keystone, deciding
  // gate, and the doctor-style writeup. None of it was an input.
  if (result) {
    const p = result.prediction || {};
    return (
      <div>
        <div style={{ border: `1px solid ${C.pass}`, background: C.bgPass, borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
          <h3 style={{ margin: '0 0 6px', fontSize: 16, color: C.pass }}>Case ingested — diagnosis derived</h3>
          <p style={{ fontSize: 13, margin: '0 0 8px' }}>
            Only raw leaves were sent. The conclusion below was computed downstream by the views — never entered.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <GateChip label="Clinically actionable" value={p.is_clinically_actionable} dag="IndividualPredictions.IsClinicallyActionable" />
            {p.deciding_gate != null ? <GateChip label="Deciding gate" value={p.deciding_gate} dag="IndividualPredictions.DecidingGate" /> : null}
            {p.lifecycle_state_key != null ? <GateChip label="Lifecycle state" value={p.lifecycle_state_key} dag="IndividualPredictions.LifecycleStateKey" /> : null}
          </div>
          <div style={{ marginTop: 10, display: 'flex', gap: 14, fontSize: 13 }}>
            <Link to={`/diagnosis/case/${result.predictionId}`} query={{ role: 'diagnosing-doctor' }} style={{ color: C.accent, fontWeight: 600 }}>
              open the full derived case ›
            </Link>
            <button onClick={() => { setResult(null); }} style={{ border: 'none', background: 'none', color: C.accent, cursor: 'pointer', fontSize: 13 }}>
              ← submit another
            </button>
          </div>
        </div>
        {result.diagnosisMarkdown ? (
          <section style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 20px', background: '#fff' }}>
            <Markdown source={result.diagnosisMarkdown} />
          </section>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <p style={{ color: C.sub, fontSize: 13, marginTop: 0 }}>
        Enter <strong>raw leaf observations only</strong> — the two things the LLM/human produces: interpreted intake
        facts and synthetic-but-transparent test results. On submit, the server writes the leaves and re-reads the{' '}
        <strong>derived</strong> keystone + diagnosis from the views. The conclusion is never an input. The form is
        prefilled with a worked example; edit any knob and resubmit.
      </p>

      <section style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', marginBottom: 14, background: '#fff' }}>
        <h3 style={{ margin: '0 0 10px', fontSize: 15 }}>Individual — intake facts</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {txt('given_name', 'Given name')}
          {txt('family_name', 'Family name')}
          {txt('ancestry_label', 'Ancestry label')}
          {txt('federated_dataset', 'Federated dataset')}
          {txt('age_years', 'Age (years)')}
          {txt('enrollment_date', 'Enrollment date', 'YYYY-MM-DD')}
        </div>
        <div style={{ marginTop: 6 }}>
          {chk('is_ancestry_absent_from_training', 'Ancestry absent from training (gates ancestry-transport)')}
          {chk('has_cryptic_relatedness_flag', 'Cryptic-relatedness flag (gates the anti-spurious branch)')}
        </div>
      </section>

      <section style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', marginBottom: 14, background: '#fff' }}>
        <h3 style={{ margin: '0 0 10px', fontSize: 15 }}>Variant · Mechanism · Prediction</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {txt('variant_type', 'Variant type')}
          {txt('allele_frequency', 'Allele frequency')}
          {txt('mechanism_type', 'Mechanism type')}
          {txt('autoimmune_disease', 'Autoimmune disease')}
          {txt('prediction_type', 'Prediction type')}
        </div>
        <div style={{ marginTop: 6 }}>
          {chk('has_allele_specific_expression', 'Variant has allele-specific expression')}
          {chk('has_pleiotropy', 'Mechanism has pleiotropy')}
        </div>
      </section>

      <section style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', marginBottom: 14, background: '#fff' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 15 }}>Test-result leaves</h3>
        <p style={{ color: C.sub, fontSize: 12, margin: '0 0 4px' }}>
          The synthetic-but-transparent measurements, as raw-leaf JSON arrays. Evidence rows reference an assay by{' '}
          <code>omics_assay_ref</code> (<code>"a0"</code>, <code>"a1"</code>, … or a modality). Replications, controls,
          intervention targets, and calibration are optional — their absence has derived consequences (e.g. no target →
          not falsifiable).
        </p>
        {jsonArea('assays', 'Assays', 'quality leaves: modality, tissue, measurement_error_score, batch')}
        {jsonArea('evidence', 'Evidence', 'effect_size + standard_error → the Z-stat leaves')}
        {jsonArea('replications', 'Replications', 'sign + p-value per ancestry cohort')}
        {jsonArea('controls', 'Negative controls', 'permutation_effect_size vs null_threshold')}
        {jsonArea('interventionTargets', 'Intervention targets', 'druggability → falsifiability')}
        {jsonArea('calibration', 'Calibration bins', 'predicted band vs observed rate, coverage')}
      </section>

      {err ? (
        <div style={{ border: `1px solid ${C.fail}`, background: C.bgFail, color: C.fail, borderRadius: 8, padding: '10px 12px', marginBottom: 12, fontSize: 13 }}>
          {err}
        </div>
      ) : null}

      <button type="submit" disabled={busy}
        style={{ padding: '9px 20px', borderRadius: 6, border: 'none', background: C.accent, color: '#fff', cursor: busy ? 'default' : 'pointer', fontSize: 14, fontWeight: 600 }}>
        {busy ? 'Ingesting…' : 'Submit case → derive diagnosis'}
      </button>
    </form>
  );
}
