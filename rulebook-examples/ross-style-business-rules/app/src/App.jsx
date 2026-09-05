import { useEffect, useState } from 'react';

const TABS = [
  { id: 'claims', label: 'Claims desk' },
  { id: 'vw_policies', label: 'Policies' },
  { id: 'vw_claimants', label: 'Claimants' },
  { id: 'vw_incidents', label: 'Incidents' },
  { id: 'all', label: 'All views' },
];

// Fetch JSON; a non-2xx response is an error carrying the API's exact message.
async function getJson(url) {
  const r = await fetch(url);
  const body = await r.json();
  if (!r.ok) throw new Error(body.error || `${url} → HTTP ${r.status}`);
  return body;
}

export function formatCell(v) {
  if (v === null || v === undefined || v === '') return '—';
  if (v === true) return '✓';
  if (v === false) return '✗';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

export default function App() {
  const [tab, setTab] = useState('claims');
  return (
    <div className="app">
      <header className="masthead">
        <h1>Ross-style Claims Desk</h1>
        <p>
          Every verdict below is a column of <code>vw_claims</code>, computed in Postgres from the
          rulebook's formulas. The rule wording beside each verdict is the field's RuleSpeak
          description from the hub.
        </p>
      </header>
      <nav className="tabs" aria-label="Sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={t.id === tab ? 'tab active' : 'tab'}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <main className="main">
        {tab === 'claims' && <ClaimsDesk />}
        {tab.startsWith('vw_') && <ViewTable name={tab} key={tab} />}
        {tab === 'all' && <AllViews />}
      </main>
    </div>
  );
}

function ErrorBox({ error }) {
  return (
    <div className="error" role="alert">
      <strong>Error:</strong> {error}
    </div>
  );
}

function ClaimsDesk() {
  const [rules, setRules] = useState(null);
  const [claims, setClaims] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getJson('/api/rules'), getJson('/api/views/vw_claims')])
      .then(([r, c]) => {
        setRules(r);
        setClaims(c);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorBox error={error} />;
  if (!rules || !claims) return <p className="muted">Loading claims from vw_claims…</p>;

  const ruleByColumn = Object.fromEntries(rules.map((r) => [r.column, r]));
  const verdictRules = rules.filter((r) => r.type !== 'raw' && r.name !== 'Name');

  return (
    <section>
      <h2 className="section-title">
        {claims.rows.length} claim{claims.rows.length === 1 ? '' : 's'} on the desk
      </h2>
      <div className="cards">
        {claims.rows.map((row) => (
          <ClaimCard key={row.claim_id} row={row} rules={verdictRules} ruleByColumn={ruleByColumn} />
        ))}
      </div>
    </section>
  );
}

function Verdict({ value, label }) {
  const cls = value === true ? 'verdict yes' : value === false ? 'verdict no' : 'verdict none';
  return (
    <span className={cls}>
      <span className="verdict-mark">{formatCell(value)}</span> {label}
    </span>
  );
}

function ClaimCard({ row, rules, ruleByColumn }) {
  const desc = (col) => ruleByColumn[col]?.description || '';
  return (
    <article className="card">
      <header className="card-head">
        <h3>{formatCell(row.name)}</h3>
        <div className="verdicts">
          <Verdict value={row.is_valid} label="valid" />
          <Verdict value={row.is_approvable} label="approvable" />
        </div>
      </header>
      <dl className="facts">
        <div>
          <dt title={desc('incident')}>Incident</dt>
          <dd>{formatCell(row.incident)}</dd>
        </div>
        <div>
          <dt title={desc('incident_claimant')}>Incident claimant</dt>
          <dd>{formatCell(row.incident_claimant)}</dd>
        </div>
        <div>
          <dt title={desc('additional_claimant')}>Additional claimant</dt>
          <dd>{formatCell(row.additional_claimant)}</dd>
        </div>
        <div>
          <dt title={desc('claimant_of_record')}>Claimant of record</dt>
          <dd>{formatCell(row.claimant_of_record)}</dd>
        </div>
        <div>
          <dt title={desc('is_flagged_for_review')}>Flagged for review</dt>
          <dd>{formatCell(row.is_flagged_for_review)}</dd>
        </div>
      </dl>
      <div className="deciding">
        <div>
          <span className="deciding-label">Validity:</span> {formatCell(row.validity_deciding_factor)}
        </div>
        <div>
          <span className="deciding-label">Approvability:</span> {formatCell(row.approvability_deciding_factor)}
        </div>
      </div>
      <details className="rules">
        <summary>Every rule verdict ({rules.length} derived columns)</summary>
        <ul className="rule-list">
          {rules.map((r) => (
            <li key={r.column} className="rule">
              <div className="rule-head">
                <span className={`rule-value ${typeof row[r.column] === 'boolean' ? (row[r.column] ? 'yes' : 'no') : ''}`}>
                  {formatCell(row[r.column])}
                </span>
                <code className="rule-name">{r.name}</code>
                <span className="rule-type">{r.type}</span>
              </div>
              <p className="rule-desc">{r.description}</p>
              {r.formula && <code className="rule-formula">{r.formula}</code>}
            </li>
          ))}
        </ul>
      </details>
    </article>
  );
}

function ViewTable({ name }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setData(null);
    setError(null);
    getJson(`/api/views/${name}`).then(setData).catch((e) => setError(e.message));
  }, [name]);

  if (error) return <ErrorBox error={error} />;
  if (!data) return <p className="muted">Loading {name}…</p>;
  return (
    <section>
      <h2 className="section-title">
        <code>{name}</code> · {data.rows.length} row{data.rows.length === 1 ? '' : 's'}
      </h2>
      <div className="grid-wrap">
        <table className="grid">
          <thead>
            <tr>
              {data.columns.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, i) => (
              <tr key={i}>
                {data.columns.map((c) => (
                  <td key={c} className={typeof row[c] === 'boolean' ? (row[c] ? 'yes' : 'no') : ''}>
                    {formatCell(row[c])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AllViews() {
  const [views, setViews] = useState(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getJson('/api/views').then(setViews).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorBox error={error} />;
  if (!views) return <p className="muted">Loading view list…</p>;
  return (
    <section className="browser">
      <ul className="view-list">
        {views.map((v) => (
          <li key={v}>
            <button type="button" className={v === selected ? 'view-btn active' : 'view-btn'} onClick={() => setSelected(v)}>
              {v}
            </button>
          </li>
        ))}
      </ul>
      <div className="browser-main">
        {selected ? <ViewTable name={selected} key={selected} /> : <p className="muted">Select a view to browse its columns and rows.</p>}
      </div>
    </section>
  );
}
