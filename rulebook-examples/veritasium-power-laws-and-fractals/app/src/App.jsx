import { useEffect, useMemo, useState } from 'react';

// Every value shown here is read from a vw_* view through the API. Nothing is
// derived in the browser: nulls render as "—".

async function fetchJson(url) {
  const r = await fetch(url);
  let body;
  try {
    body = await r.json();
  } catch {
    throw new Error(`${url} returned ${r.status} with a non-JSON body`);
  }
  if (!r.ok) throw new Error(body.error || `${url} returned ${r.status}`);
  return body;
}

const NUMERIC = /^-?\d+(\.\d+)?$/;

function fmt(v) {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'boolean') return v ? '✓' : '✗';
  if (typeof v === 'number' || (typeof v === 'string' && NUMERIC.test(v))) {
    const n = Number(v);
    if (Number.isInteger(n)) return String(n);
    return n.toFixed(4).replace(/\.?0+$/, '');
  }
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

function Cell({ value }) {
  const text = fmt(value);
  const raw = value === null || value === undefined ? '' : String(value);
  return (
    <td className={text === '—' ? 'null' : ''} title={raw}>
      {text}
    </td>
  );
}

function ViewTable({ data, highlight, small }) {
  if (!data) return null;
  return (
    <div className="table-wrap">
      <table className={`grid ${small ? 'small' : ''}`}>
        <thead>
          <tr>{data.columns.map((c) => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {data.rows.map((row, i) => (
            <tr key={i} className={highlight && highlight(row) ? 'hl' : ''}>
              {data.columns.map((c) => <Cell key={c} value={row[c]} />)}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="meta">{data.rows.length} row(s)</div>
    </div>
  );
}

function ErrorBox({ error }) {
  if (!error) return null;
  return <div className="error">Error: {error}</div>;
}

// ---------------------------------------------------------------------------
// Log–log scatter. Points are vw_scales / vw_observed_scales rows exactly as the
// views give them (log_scale, log_measure). The theoretical line uses the
// view's theoretical_log_log_slope anchored at the iteration-0 ideal point; the
// fitted line uses vw_inference_runs.fitted_slope / fitted_intercept when the
// view has both. Regime bands come from vw_scale_regimes.
// ---------------------------------------------------------------------------
function LogLogChart({ scales, observed, run, regimes }) {
  const W = 640;
  const H = 400;
  const M = { top: 20, right: 20, bottom: 44, left: 56 };

  const num = (v) => (v === null || v === undefined ? null : Number(v));

  const ideal = scales
    .map((r) => ({ x: num(r.log_scale), y: num(r.log_measure), projected: r.is_projected, id: r.scale_id }))
    .filter((p) => p.x !== null && p.y !== null);
  const obs = observed
    .map((r) => ({ x: num(r.log_scale), y: num(r.log_measure), outlier: r.is_outlier, id: r.observed_scale_id }))
    .filter((p) => p.x !== null && p.y !== null);

  const pts = [...ideal, ...obs];
  if (pts.length === 0) return <p className="muted">The views expose no plottable (log_scale, log_measure) rows for this system.</p>;

  const anchor = scales.find((r) => Number(r.iteration) === 0) || scales[0];
  const theoSlope = anchor ? num(anchor.theoretical_log_log_slope) : null;
  const anchorX = anchor ? num(anchor.log_scale) : null;
  const anchorY = anchor ? num(anchor.log_measure) : null;

  const fitSlope = run ? num(run.fitted_slope) : null;
  const fitIntercept = run ? num(run.fitted_intercept) : null;

  let xMin = Math.min(...pts.map((p) => p.x));
  let xMax = Math.max(...pts.map((p) => p.x));
  let yMin = Math.min(...pts.map((p) => p.y));
  let yMax = Math.max(...pts.map((p) => p.y));
  const lineYs = [];
  if (theoSlope !== null && anchorX !== null && anchorY !== null) {
    lineYs.push(anchorY + theoSlope * (xMin - anchorX), anchorY + theoSlope * (xMax - anchorX));
  }
  if (fitSlope !== null && fitIntercept !== null) {
    lineYs.push(fitIntercept + fitSlope * xMin, fitIntercept + fitSlope * xMax);
  }
  yMin = Math.min(yMin, ...lineYs);
  yMax = Math.max(yMax, ...lineYs);
  const padX = (xMax - xMin || 1) * 0.08;
  const padY = (yMax - yMin || 1) * 0.08;
  xMin -= padX; xMax += padX; yMin -= padY; yMax += padY;

  const sx = (x) => M.left + ((x - xMin) / (xMax - xMin)) * (W - M.left - M.right);
  const sy = (y) => H - M.bottom - ((y - yMin) / (yMax - yMin)) * (H - M.top - M.bottom);

  const ticks = (lo, hi, n) => {
    const step = (hi - lo) / n;
    return Array.from({ length: n + 1 }, (_, i) => lo + i * step);
  };

  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="log-log scatter">
      <rect x={M.left} y={M.top} width={W - M.left - M.right} height={H - M.top - M.bottom} className="plot-bg" />
      {regimes.map((rg) => {
        const a = num(rg.min_log_scale);
        const b = num(rg.max_log_scale);
        if (a === null || b === null) return null;
        const x0 = Math.max(M.left, Math.min(sx(a), sx(b)));
        const x1 = Math.min(W - M.right, Math.max(sx(a), sx(b)));
        if (x1 <= x0) return null;
        return (
          <g key={rg.regime_id}>
            <rect x={x0} y={M.top} width={x1 - x0} height={H - M.top - M.bottom} className="regime" />
            <text x={x0 + 4} y={M.top + 12} className="regime-label">{rg.regime_type}</text>
          </g>
        );
      })}
      {ticks(xMin, xMax, 6).map((t, i) => (
        <g key={`x${i}`}>
          <line x1={sx(t)} x2={sx(t)} y1={M.top} y2={H - M.bottom} className="gridline" />
          <text x={sx(t)} y={H - M.bottom + 16} className="tick" textAnchor="middle">{t.toFixed(2)}</text>
        </g>
      ))}
      {ticks(yMin, yMax, 6).map((t, i) => (
        <g key={`y${i}`}>
          <line x1={M.left} x2={W - M.right} y1={sy(t)} y2={sy(t)} className="gridline" />
          <text x={M.left - 6} y={sy(t) + 4} className="tick" textAnchor="end">{t.toFixed(2)}</text>
        </g>
      ))}
      <text x={(M.left + W - M.right) / 2} y={H - 8} className="axis-label" textAnchor="middle">log_scale</text>
      <text x={14} y={(M.top + H - M.bottom) / 2} className="axis-label" textAnchor="middle" transform={`rotate(-90 14 ${(M.top + H - M.bottom) / 2})`}>log_measure</text>

      {theoSlope !== null && anchorX !== null && anchorY !== null && (
        <line
          x1={sx(xMin)} y1={sy(anchorY + theoSlope * (xMin - anchorX))}
          x2={sx(xMax)} y2={sy(anchorY + theoSlope * (xMax - anchorX))}
          className="theo-line"
        />
      )}
      {fitSlope !== null && fitIntercept !== null && (
        <line
          x1={sx(xMin)} y1={sy(fitIntercept + fitSlope * xMin)}
          x2={sx(xMax)} y2={sy(fitIntercept + fitSlope * xMax)}
          className="fit-line"
        />
      )}
      {obs.map((p) => (
        <g key={p.id} transform={`translate(${sx(p.x)} ${sy(p.y)})`}>
          <title>{`${p.id}: (${p.x}, ${p.y})${p.outlier === true ? ' outlier' : ''}`}</title>
          <path d="M-5 -5 L5 5 M-5 5 L5 -5" className={`obs ${p.outlier === true ? 'outlier' : ''}`} />
        </g>
      ))}
      {ideal.map((p) => (
        <circle key={p.id} cx={sx(p.x)} cy={sy(p.y)} r={5} className={`ideal ${p.projected ? 'projected' : ''}`}>
          <title>{`${p.id}: (${p.x}, ${p.y})${p.projected ? ' projected' : ''}`}</title>
        </circle>
      ))}
    </svg>
  );
}

function Legend({ hasFit }) {
  return (
    <div className="legend">
      <span><i className="sw ideal" /> vw_scales (ideal)</span>
      <span><i className="sw ideal projected" /> vw_scales (is_projected)</span>
      <span><i className="sw obs" /> vw_observed_scales</span>
      <span><i className="sw theo" /> theoretical_log_log_slope</span>
      <span><i className={`sw fit ${hasFit ? '' : 'off'}`} /> fitted_slope / fitted_intercept {hasFit ? '' : '(view has no intercept — not drawn)'}</span>
      <span><i className="sw regime" /> vw_scale_regimes</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Domain screen
// ---------------------------------------------------------------------------
function SystemsScreen() {
  const [systems, setSystems] = useState(null);
  const [stats, setStats] = useState(null);
  const [runs, setRuns] = useState(null);
  const [regimes, setRegimes] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [scales, setScales] = useState(null);
  const [observed, setObserved] = useState(null);
  const [detailError, setDetailError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetchJson('/api/systems'),
      fetchJson('/api/system-stats'),
      fetchJson('/api/views/vw_inference_runs'),
      fetchJson('/api/views/vw_scale_regimes'),
    ])
      .then(([s, st, r, rg]) => {
        setSystems(s); setStats(st); setRuns(r); setRegimes(rg);
        if (s.rows.length > 0) setSelected(s.rows[0].system_id);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setScales(null); setObserved(null); setDetailError(null);
    Promise.all([
      fetchJson(`/api/systems/${encodeURIComponent(selected)}/scales`),
      fetchJson(`/api/systems/${encodeURIComponent(selected)}/observed-scales`),
    ])
      .then(([sc, ob]) => { setScales(sc); setObserved(ob); })
      .catch((e) => setDetailError(e.message));
  }, [selected]);

  const statsBySystem = useMemo(() => {
    const m = new Map();
    (stats?.rows || []).forEach((r) => m.set(r.system, r));
    return m;
  }, [stats]);
  const runBySystem = useMemo(() => {
    const m = new Map();
    (runs?.rows || []).forEach((r) => { if (!m.has(r.system)) m.set(r.system, r); });
    return m;
  }, [runs]);

  if (error) return <ErrorBox error={error} />;
  if (!systems) return <p className="muted">Loading views…</p>;

  const system = systems.rows.find((r) => r.system_id === selected);
  const stat = system ? statsBySystem.get(system.system_id) : null;
  const run = system ? runBySystem.get(system.system_id) : null;
  const systemRegimes = (regimes?.rows || []).filter((r) => r.system === selected);
  const hasFit = !!(run && run.fitted_slope !== null && run.fitted_intercept !== null);

  return (
    <>
      <section>
        <h2>Systems gallery <span className="src">vw_systems · vw_system_stats · vw_inference_runs</span></h2>
        <p className="lede">
          Fractal dimension and log–log slope are different columns. <code>fractal_dimension</code> is a property of the
          object; <code>theoretical_log_log_slope</code> is what a straight line in log–log space should show;
          <code>empirical_log_log_slope</code> is what the data did show. Pick a system to see its scales plotted.
        </p>
        <div className="gallery">
          {systems.rows.map((s) => {
            const st = statsBySystem.get(s.system_id);
            const rn = runBySystem.get(s.system_id);
            return (
              <button
                key={s.system_id}
                className={`card ${s.system_id === selected ? 'active' : ''}`}
                onClick={() => setSelected(s.system_id)}
              >
                <div className="card-head">
                  <span className="card-title">{fmt(s.display_name)}</span>
                  <span className={`badge ${s.class}`}>{fmt(s.class)}</span>
                </div>
                <div className="card-measure">{fmt(s.measure_name)}</div>
                <dl className="kv">
                  <dt>fractal_dimension</dt><dd>{fmt(s.fractal_dimension)}</dd>
                  <dt>theoretical_log_log_slope</dt><dd>{fmt(s.theoretical_log_log_slope)}</dd>
                  <dt>empirical_log_log_slope</dt><dd>{fmt(st ? st.empirical_log_log_slope : null)}</dd>
                  <dt>fitted_slope (run)</dt><dd>{fmt(rn ? rn.fitted_slope : null)}</dd>
                  <dt>r2 (run)</dt><dd>{fmt(rn ? rn.r2 : null)}</dd>
                  <dt>is_high_quality_fit</dt><dd>{fmt(s.is_high_quality_fit)}</dd>
                </dl>
              </button>
            );
          })}
        </div>
      </section>

      {system && (
        <section className="detail">
          <h2>{fmt(system.display_name)} <span className="src">{system.system_id}</span></h2>
          <div className="detail-grid">
            <div className="chart-col">
              <h3>Log–log plot <span className="src">vw_scales · vw_observed_scales · vw_scale_regimes</span></h3>
              <ErrorBox error={detailError} />
              {!detailError && (!scales || !observed) && <p className="muted">Loading scales…</p>}
              {scales && observed && (
                <>
                  <LogLogChart scales={scales.rows} observed={observed.rows} run={run} regimes={systemRegimes} />
                  <Legend hasFit={hasFit} />
                </>
              )}
            </div>
            <div className="facts-col">
              <h3>vw_systems</h3>
              <table className="facts">
                <tbody>
                  {Object.keys(system).map((k) => (
                    <tr key={k}><th>{k}</th><Cell value={system[k]} /></tr>
                  ))}
                </tbody>
              </table>
              <h3>vw_system_stats</h3>
              {stat ? (
                <table className="facts">
                  <tbody>
                    {Object.keys(stat).map((k) => (
                      <tr key={k}><th>{k}</th><Cell value={stat[k]} /></tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="muted">vw_system_stats has no row for {system.system_id}.</p>
              )}
            </div>
          </div>

          <h3>Scales <span className="src">vw_scales WHERE system = {system.system_id}</span></h3>
          <ViewTable data={scales} small />
          <h3>Observed scales <span className="src">vw_observed_scales WHERE system = {system.system_id}</span></h3>
          <ViewTable data={observed} small />
        </section>
      )}

      <section>
        <h2>Inference runs <span className="src">vw_inference_runs</span></h2>
        <ViewTable data={runs} small highlight={(r) => r.system === selected} />
      </section>
      <section>
        <h2>Scale regimes <span className="src">vw_scale_regimes</span></h2>
        <ViewTable data={regimes} small highlight={(r) => r.system === selected} />
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------
// All views browser
// ---------------------------------------------------------------------------
function ViewsScreen() {
  const [views, setViews] = useState([]);
  const [selected, setSelected] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJson('/api/views').then(setViews).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true); setError(null); setData(null);
    fetchJson(`/api/views/${selected}`)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selected]);

  return (
    <section className="browser">
      <div className="view-list">
        {views.map((v) => (
          <button key={v} className={`pill ${v === selected ? 'active' : ''}`} onClick={() => setSelected(v)}>{v}</button>
        ))}
      </div>
      {!selected && !error && <p className="muted">Select a view to see its columns and rows.</p>}
      <ErrorBox error={error} />
      {loading && <p className="muted">Loading…</p>}
      {selected && !loading && !error && <h2>{selected}</h2>}
      <ViewTable data={data} />
    </section>
  );
}

export default function App() {
  const [tab, setTab] = useState('systems');
  return (
    <div className="app">
      <header className="top">
        <div>
          <h1>Power Laws &amp; Fractals</h1>
          <p className="tagline">Veritasium's cast of scaling systems, read from the rulebook's Postgres views.</p>
        </div>
        <nav className="tabs">
          <button className={tab === 'systems' ? 'active' : ''} onClick={() => setTab('systems')}>Systems</button>
          <button className={tab === 'views' ? 'active' : ''} onClick={() => setTab('views')}>All views</button>
        </nav>
      </header>
      <main>{tab === 'systems' ? <SystemsScreen /> : <ViewsScreen />}</main>
    </div>
  );
}
