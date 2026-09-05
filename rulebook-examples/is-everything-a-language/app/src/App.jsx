import { useEffect, useMemo, useState } from 'react';

// Every value on screen comes straight out of a vw_* view column. Nothing is
// recomputed here: verdicts, predicates text, failure text and the
// open/closed-world conflict are all columns of vw_language_candidates.

const CANDIDATES_VIEW = 'vw_language_candidates';
const ARGUMENT_VIEW = 'vw_is_everything_a_language';

// The eight criteria that the rulebook's PredictedAnswer formula combines.
// The last two are required to be FALSE for a language (rendered as "must not").
const CRITERIA = [
  { col: 'has_syntax', label: 'Has syntax' },
  { col: 'is_parsed', label: 'Is parsed' },
  { col: 'is_description_of', label: 'Is description of' },
  { col: 'has_linear_decoding_pressure', label: 'Linear decoding pressure' },
  { col: 'resolves_to_an_ast', label: 'Resolves to an AST' },
  { col: 'is_stable_ontology_reference', label: 'Stable ontology reference' },
  { col: 'can_be_held', label: 'Can be held', negated: true },
  { col: 'has_identity', label: 'Has identity', negated: true },
];

// Other observed / derived columns shown in the card's detail strip.
const EXTRA = [
  { col: 'has_grammar', label: 'Has grammar' },
  { col: 'is_live_ontology_editor', label: 'Live ontology editor' },
  { col: 'is_open_world', label: 'Open world' },
  { col: 'is_closed_world', label: 'Closed world' },
  { col: 'is_open_closed_world_conflicted', label: 'OWA/CWA conflicted' },
  { col: 'distance_from_concept', label: 'Distance from concept' },
  { col: 'relationship_to_concept', label: 'Relationship to concept' },
  { col: 'dimensionality_while_editing', label: 'Dimensionality while editing' },
  { col: 'model_object_facility_layer', label: 'MOF layer' },
];

async function fetchJson(url) {
  const r = await fetch(url);
  const body = await r.json();
  if (!r.ok || body.error) throw new Error(body.error || `${url} returned HTTP ${r.status}`);
  return body;
}

function formatCell(v) {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'boolean') return v ? '✓' : '✗';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

export default function App() {
  const [tab, setTab] = useState('board');
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <h1>Is Everything a Language?</h1>
          <p className="sub">A classification board read live from the rulebook's Postgres views.</p>
        </div>
        <nav className="tabs">
          <button className={tab === 'board' ? 'active' : ''} onClick={() => setTab('board')}>Classification board</button>
          <button className={tab === 'views' ? 'active' : ''} onClick={() => setTab('views')}>All views</button>
        </nav>
      </header>
      {tab === 'board' ? <Board /> : <ViewBrowser />}
    </div>
  );
}

/* ---------------------------------------------------------------- board */

function Board() {
  const [candidates, setCandidates] = useState(null);
  const [argument, setArgument] = useState(null);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('all');
  const [onlyFails, setOnlyFails] = useState(false);
  const [focus, setFocus] = useState(null);

  useEffect(() => {
    Promise.all([fetchJson(`/api/views/${CANDIDATES_VIEW}`), fetchJson(`/api/views/${ARGUMENT_VIEW}`)])
      .then(([c, a]) => { setCandidates(c); setArgument(a); })
      .catch(e => setError(e.message));
  }, []);

  const sorted = useMemo(() => {
    if (!candidates) return [];
    return [...candidates.rows].sort((a, b) => {
      const sa = a.sort_order ?? Number.MAX_SAFE_INTEGER;
      const sb = b.sort_order ?? Number.MAX_SAFE_INTEGER;
      if (sa !== sb) return sa - sb;
      return String(a.name).localeCompare(String(b.name));
    });
  }, [candidates]);

  const categories = useMemo(() => {
    const set = new Set(sorted.map(r => r.category).filter(Boolean));
    return [...set].sort();
  }, [sorted]);

  const visible = sorted.filter(r =>
    (category === 'all' || r.category === category) &&
    (!onlyFails || (r.prediction_fail !== null && r.prediction_fail !== '')),
  );

  if (error) return <div className="error">Error: {error}</div>;
  if (!candidates || !argument) return <div className="loading">Loading views…</div>;

  return (
    <div className="board">
      <ArgumentPanel rows={argument.rows} focus={focus} setFocus={setFocus} />

      <section className="candidates">
        <div className="toolbar">
          <label>
            Category
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="all">All categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="check">
            <input type="checkbox" checked={onlyFails} onChange={e => setOnlyFails(e.target.checked)} />
            Only where the rulebook disagrees with the Family Feud answer
          </label>
        </div>

        <div className="legend">
          <span><b className="pill yes">✓</b> criterion satisfied</span>
          <span><b className="pill no">✗</b> not satisfied</span>
          <span><b className="pill neg">¬</b> must be false for a language</span>
        </div>

        <div className="cards">
          {visible.map(row => (
            <CandidateCard
              key={row.language_candidate_id}
              row={row}
              focused={focus === row.name}
              onFocus={() => setFocus(focus === row.name ? null : row.name)}
            />
          ))}
          {visible.length === 0 && <p className="empty">No candidates match this filter.</p>}
        </div>
      </section>
    </div>
  );
}

function CandidateCard({ row, focused, onFocus }) {
  const fail = row.prediction_fail !== null && row.prediction_fail !== '';
  return (
    <article className={`card ${fail ? 'fail' : ''} ${focused ? 'focused' : ''}`} onClick={onFocus}>
      <header className="card-head">
        <div>
          <div className="category">{formatCell(row.category)}</div>
          <h3>{formatCell(row.name)}</h3>
          <div className="question">{formatCell(row.question)}</div>
        </div>
        <div className="verdicts">
          <Verdict label="Family Feud says" value={row.is_language} />
          <Verdict label="Rulebook predicts" value={row.predicted_answer} />
        </div>
      </header>

      <ul className="criteria">
        {CRITERIA.map(c => (
          <li key={c.col} className={boolClass(row[c.col])} title={`${c.col} = ${formatCell(row[c.col])}`}>
            {c.negated && <span className="neg-mark">¬</span>}
            <span className="mark">{formatCell(row[c.col])}</span>
            <span>{c.label}</span>
          </li>
        ))}
      </ul>

      <p className="predicates">{formatCell(row.prediction_predicates)}</p>

      {fail && <p className="fail-text">{row.prediction_fail}</p>}

      <dl className="extra">
        {EXTRA.map(e => (
          <div key={e.col}>
            <dt>{e.label}</dt>
            <dd className={typeof row[e.col] === 'boolean' ? boolClass(row[e.col]) : ''}>{formatCell(row[e.col])}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function boolClass(v) {
  if (v === true) return 'yes';
  if (v === false) return 'no';
  return 'null';
}

function Verdict({ label, value }) {
  return (
    <div className={`verdict ${boolClass(value)}`}>
      <span className="v-label">{label}</span>
      <span className="v-value">{value === null || value === undefined ? '—' : value ? 'Yes' : 'No'}</span>
    </div>
  );
}

/* ------------------------------------------------------- argument panel */

function ArgumentPanel({ rows, focus, setFocus }) {
  const sorted = [...rows].sort((a, b) =>
    String(a.is_everything_a_language_id).localeCompare(String(b.is_everything_a_language_id)));

  // Group by argument_name, preserving first-seen order.
  const groups = [];
  for (const r of sorted) {
    let g = groups.find(x => x.name === r.argument_name);
    if (!g) { g = { name: r.argument_name, steps: [] }; groups.push(g); }
    g.steps.push(r);
  }

  return (
    <aside className="argument">
      <h2>The argument</h2>
      <p className="hint">
        Rows of <code>vw_is_everything_a_language</code>. Steps that cite a candidate highlight its card.
      </p>
      {groups.map(g => (
        <section key={g.name} className="arg-group">
          <h3>{formatCell(g.name)}</h3>
          <ol>
            {g.steps.map(s => {
              const linked = s.related_candidate_name && s.related_candidate_name !== '';
              const active = linked && focus === s.related_candidate_name;
              return (
                <li key={s.is_everything_a_language_id} className={`step ${active ? 'active' : ''}`}>
                  <div className="step-meta">
                    <span className="step-id">{formatCell(s.name)}</span>
                    <span className="step-cat">{formatCell(s.argument_category)}</span>
                    <span className="step-type">{formatCell(s.step_type)}</span>
                  </div>
                  <p className="statement">{formatCell(s.statement)}</p>
                  {s.formalization && <pre className="formal">{s.formalization}</pre>}
                  {linked && (
                    <button className="link-btn" onClick={() => setFocus(active ? null : s.related_candidate_name)}>
                      ↳ {s.related_candidate_name}
                    </button>
                  )}
                  {s.evidence_from_rulebook && <p className="evidence"><b>Evidence:</b> {s.evidence_from_rulebook}</p>}
                  {s.notes && <p className="notes">{s.notes}</p>}
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </aside>
  );
}

/* --------------------------------------------------------- view browser */

function ViewBrowser() {
  const [views, setViews] = useState([]);
  const [selected, setSelected] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJson('/api/views').then(setViews).catch(e => setError(e.message));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    setError(null);
    setData(null);
    fetchJson(`/api/views/${selected}`)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [selected]);

  return (
    <div className="browser">
      <aside className="sidebar">
        <h2>Views</h2>
        <ul>
          {views.map(v => (
            <li key={v} className={v === selected ? 'active' : ''} onClick={() => setSelected(v)}>{v}</li>
          ))}
        </ul>
      </aside>
      <main className="main">
        <h2 className="mono">{selected || 'Select a view'}</h2>
        {error && <div className="error">Error: {error}</div>}
        {loading && <div className="loading">Loading…</div>}
        {!loading && data && (
          <div className="grid-wrap">
            <table className="grid">
              <thead>
                <tr>{data.columns.map(c => <th key={c}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {data.rows.map((row, i) => (
                  <tr key={i}>
                    {data.columns.map(c => <td key={c}>{formatCell(row[c])}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="meta">{data.rows.length} row(s)</div>
          </div>
        )}
        {!selected && !error && <p>Pick a view on the left to see its columns and rows exactly as Postgres computes them.</p>}
      </main>
    </div>
  );
}
