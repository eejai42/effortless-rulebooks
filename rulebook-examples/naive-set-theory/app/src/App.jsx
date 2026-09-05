import { useEffect, useState } from 'react';

// Every value on screen comes straight from a vw_* view column. Nothing is
// recomputed here: no counts, no formula evaluation, no fallbacks.

function fmt(v) {
  if (v === null || v === undefined) return '—';
  if (v === true) return '✓';
  if (v === false) return '✗';
  return String(v);
}

async function getJson(url) {
  const r = await fetch(url);
  const body = await r.json();
  if (!r.ok) throw new Error(body.error || `${url} -> HTTP ${r.status}`);
  return body;
}

function useView(name) {
  const [state, setState] = useState({ data: null, error: null });
  useEffect(() => {
    let live = true;
    getJson(`/api/views/${name}`)
      .then(d => live && setState({ data: d, error: null }))
      .catch(e => live && setState({ data: null, error: e.message }));
    return () => { live = false; };
  }, [name]);
  return state;
}

function ErrorBox({ error }) {
  return <div className="error">Error: {error}</div>;
}

function Section({ id, title, view, children }) {
  return (
    <section className="card" id={id}>
      <header className="card-head">
        <h2>{title}</h2>
        <code className="view-tag">{view}</code>
      </header>
      {children}
    </section>
  );
}

function ViewTable({ columns, rows, rowKey, rowClass }) {
  return (
    <div className="grid-wrap">
      <table className="grid">
        <thead>
          <tr>{columns.map(c => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={rowKey ? row[rowKey] : i} className={rowClass ? rowClass(row) : ''}>
              {columns.map(c => <td key={c}>{fmt(row[c])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* 1. Sets ---------------------------------------------------------------- */
function SetsSection({ sets }) {
  const cols = ['label', 'set_id', 'condition_expression', 'is_self_referential',
    'is_russell_set', 'count_of_memberships', 'count_of_null_memberships'];
  return (
    <Section id="sets" title="1 · The sets under discussion" view="vw_sets">
      <p className="lede">
        Eight sets, each defined by its membership condition φ. The derived columns
        (<code>is_russell_set</code>, the two counts) are computed by the view.
        Only one set carries an ungrounded membership.
      </p>
      <ViewTable
        columns={cols}
        rows={sets.rows}
        rowKey="set_id"
        rowClass={r => (r.is_russell_set ? 'row-russell' : '')}
      />
    </Section>
  );
}

/* 2. Membership matrix ---------------------------------------------------- */
function MembershipMatrix({ sets, facts, truthValues }) {
  const [selectedId, setSelectedId] = useState('russell-set-in-russell-set');
  const [detail, setDetail] = useState({ data: null, error: null });

  useEffect(() => {
    if (!selectedId) return;
    let live = true;
    getJson(`/api/membership-facts/${encodeURIComponent(selectedId)}`)
      .then(d => live && setDetail({ data: d, error: null }))
      .catch(e => live && setDetail({ data: null, error: e.message }));
    return () => { live = false; };
  }, [selectedId]);

  const setRows = sets.rows;
  const factAt = (element, container) =>
    facts.rows.find(f => f.element === element && f.container === container);

  const cellClass = f => {
    if (!f) return 'cell-none';
    if (f.is_null) return 'cell-null';
    return f.membership_value === 'true' ? 'cell-true' : 'cell-false';
  };

  const d = detail.data;
  return (
    <Section id="membership" title="2 · Membership matrix (element ∈ container)" view="vw_membership_facts">
      <p className="lede">
        Rows are candidate elements, columns are containers. Each filled cell is one
        recorded membership fact showing its <code>membership_value_symbol</code>.
        Empty cells have no recorded fact. The single <strong>N</strong> cell is the
        Russell fact <code>R ∈ R</code>, which the view flags <code>is_null = ✓</code>.
        Click any filled cell for its row.
      </p>
      <div className="legend">
        {truthValues.rows.map(tv => (
          <span key={tv.truth_value_id} className={`chip chip-${tv.truth_value_id}`}>
            <b>{fmt(tv.symbol)}</b> {fmt(tv.glyph)} {fmt(tv.name)}
            <span className="chip-count">×{fmt(tv.count_of_facts)}</span>
          </span>
        ))}
      </div>
      <div className="grid-wrap">
        <table className="matrix">
          <thead>
            <tr>
              <th className="corner">element ↓ / container →</th>
              {setRows.map(s => <th key={s.set_id} title={s.set_id}>{fmt(s.label)}</th>)}
            </tr>
          </thead>
          <tbody>
            {setRows.map(el => (
              <tr key={el.set_id}>
                <th title={el.set_id}>{fmt(el.label)}</th>
                {setRows.map(co => {
                  const f = factAt(el.set_id, co.set_id);
                  const sel = f && f.membership_fact_id === selectedId;
                  return (
                    <td
                      key={co.set_id}
                      className={`${cellClass(f)}${sel ? ' cell-selected' : ''}`}
                      title={f ? f.name : `${el.set_id} in ${co.set_id}: no recorded fact`}
                      onClick={f ? () => setSelectedId(f.membership_fact_id) : undefined}
                    >
                      {f ? fmt(f.membership_value_symbol) : '·'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="fact-detail">
        {detail.error && <ErrorBox error={detail.error} />}
        {d && (
          <>
            <h3>
              {fmt(d.fact.name)}{' '}
              <span className={`chip chip-${d.fact.membership_value}`}>
                {fmt(d.fact.membership_value_symbol)} · {fmt(d.fact.membership_value)}
              </span>
            </h3>
            <dl className="kv">
              <dt>membership_fact_id</dt><dd>{fmt(d.fact.membership_fact_id)}</dd>
              <dt>container_label</dt><dd>{fmt(d.fact.container_label)}</dd>
              <dt>is_bivalent</dt><dd>{fmt(d.fact.is_bivalent)}</dd>
              <dt>is_null</dt><dd>{fmt(d.fact.is_null)}</dd>
              <dt>is_grounded</dt><dd>{fmt(d.fact.is_grounded)}</dd>
              <dt>count_of_evaluation_steps</dt><dd>{fmt(d.fact.count_of_evaluation_steps)}</dd>
            </dl>
            {d.steps.length > 0 && (
              <ViewTable
                columns={['step_order', 'name', 'trial_value', 'resulting_value', 'is_stable', 'outcome']}
                rows={d.steps}
                rowKey="evaluation_step_id"
                rowClass={r => (r.is_stable ? 'row-stable' : 'row-contradiction')}
              />
            )}
          </>
        )}
      </div>

      <details className="raw">
        <summary>All {facts.rows.length} membership fact rows</summary>
        <ViewTable
          columns={['name', 'element', 'container', 'container_label', 'membership_value',
            'membership_value_symbol', 'is_bivalent', 'is_null', 'is_grounded', 'count_of_evaluation_steps']}
          rows={facts.rows}
          rowKey="membership_fact_id"
          rowClass={r => (r.is_null ? 'row-russell' : '')}
        />
      </details>
    </Section>
  );
}

/* 3. Strong Kleene truth tables ------------------------------------------ */
function TruthTables({ connectives, ttRows, truthValues }) {
  // Axis order is the view's own Strong Kleene rank (true=1, null=0, false=-1).
  const axis = [...truthValues.rows].sort((a, b) => b.rank - a.rank);
  const byId = Object.fromEntries(truthValues.rows.map(tv => [tv.truth_value_id, tv]));

  return (
    <Section id="kleene" title="3 · Strong Kleene truth tables" view="vw_truth_table_rows">
      <p className="lede">
        One table per connective, rendered from the 21 rows of{' '}
        <code>vw_truth_table_rows</code>. The <code>kleene_rule</code> column of{' '}
        <code>vw_connectives</code> names the rule each table follows.
      </p>
      <div className="tt-row">
        {connectives.rows.map(c => {
          const rows = ttRows.rows.filter(r => r.connective === c.connective_id);
          const cell = (l, r) => rows.find(x => x.left_input === l && (c.arity === 1 || x.right_input === r));
          return (
            <div className="tt" key={c.connective_id}>
              <h3>
                <span className="tt-symbol">{fmt(c.symbol)}</span> {fmt(c.name)}
                <small> · {fmt(c.kleene_rule)} · {fmt(c.count_of_truth_table_rows)} rows</small>
              </h3>
              <table className="kleene">
                <thead>
                  <tr>
                    <th>{fmt(c.symbol)}</th>
                    {c.arity === 1
                      ? <th>output</th>
                      : axis.map(tv => <th key={tv.truth_value_id}>{fmt(tv.symbol)}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {axis.map(l => (
                    <tr key={l.truth_value_id}>
                      <th>{fmt(l.symbol)}</th>
                      {(c.arity === 1 ? [null] : axis).map((r, i) => {
                        const x = cell(l.truth_value_id, r && r.truth_value_id);
                        const out = x ? byId[x.output] : null;
                        return (
                          <td key={i} className={x ? `cell-${x.output}` : 'cell-none'} title={x ? x.name : ''}>
                            {x ? fmt(x.output_symbol) : '—'}
                            {out && <span className="glyph">{fmt(out.glyph)}</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* 4. Rules ---------------------------------------------------------------- */
function RulesSection({ rules }) {
  const ordered = [...rules.rows].sort((a, b) => a.rule_number - b.rule_number);
  return (
    <Section id="rules" title="4 · The twelve rules" view="vw_set_rules">
      <p className="lede">
        Eleven classical rules of naive set theory (<code>is_classical = ✓</code>) plus the
        one the theory never wrote down, flagged by the view as{' '}
        <code>is_the_missing_rule</code>.
      </p>
      <ol className="rules">
        {ordered.map(r => (
          <li key={r.set_rule_id} className={r.is_the_missing_rule ? 'rule-missing' : ''}>
            <div className="rule-head">
              <span className="rule-num">{fmt(r.name)}</span>
              <strong>{fmt(r.title)}</strong>
              {r.is_the_missing_rule && <span className="badge">the missing rule</span>}
              {r.is_classical && <span className="badge badge-muted">classical</span>}
            </div>
            <p>{fmt(r.statement)}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* 5. Evaluation walk-through --------------------------------------------- */
function EvaluationSection({ steps, facts }) {
  const ordered = [...steps.rows].sort((a, b) => a.step_order - b.step_order);
  const factName = id => {
    const f = facts.rows.find(x => x.membership_fact_id === id);
    return f ? f.name : id;
  };
  return (
    <Section id="evaluation" title="5 · Fixed-point evaluation of R ∈ R" view="vw_evaluation_steps">
      <p className="lede">
        Each trial assumes a value for <code>R ∈ R</code>, feeds it through φ = ¬(R ∈ R),
        and records what comes back. The view marks a trial <code>is_stable</code> when it
        reproduces itself. True and false each contradict themselves; only NULL is a
        fixed point, so Rule 12 assigns <code>R ∈ R = NULL</code>.
      </p>
      <ol className="steps">
        {ordered.map(s => (
          <li key={s.evaluation_step_id} className={s.is_stable ? 'row-stable' : 'row-contradiction'}>
            <div className="step-order">{fmt(s.step_order)}</div>
            <div className="step-body">
              <div className="step-title">
                <strong>{fmt(s.name)}</strong>
                <span className="muted"> on {factName(s.membership_fact)}</span>
              </div>
              <div className="step-flow">
                <span className={`chip chip-${s.trial_value}`}>assume {fmt(s.trial_value)}</span>
                <span className="arrow">→ φ →</span>
                <span className={`chip chip-${s.resulting_value}`}>yields {fmt(s.resulting_value)}</span>
                <span className="arrow">⇒</span>
                <span className="outcome">{fmt(s.outcome)} · is_stable {fmt(s.is_stable)}</span>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* Domain screen ----------------------------------------------------------- */
function DomainScreen() {
  const sets = useView('vw_sets');
  const facts = useView('vw_membership_facts');
  const truthValues = useView('vw_truth_values');
  const connectives = useView('vw_connectives');
  const ttRows = useView('vw_truth_table_rows');
  const rules = useView('vw_set_rules');
  const steps = useView('vw_evaluation_steps');

  const all = { sets, facts, truthValues, connectives, ttRows, rules, steps };
  const errors = Object.entries(all).filter(([, s]) => s.error);
  if (errors.length) {
    return <div>{errors.map(([k, s]) => <ErrorBox key={k} error={s.error} />)}</div>;
  }
  if (Object.values(all).some(s => !s.data)) return <div className="loading">Loading views…</div>;

  return (
    <>
      <SetsSection sets={sets.data} />
      <MembershipMatrix sets={sets.data} facts={facts.data} truthValues={truthValues.data} />
      <TruthTables connectives={connectives.data} ttRows={ttRows.data} truthValues={truthValues.data} />
      <RulesSection rules={rules.data} />
      <EvaluationSection steps={steps.data} facts={facts.data} />
    </>
  );
}

/* All-views browser ------------------------------------------------------- */
function ViewsBrowser() {
  const [views, setViews] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    getJson('/api/views').then(setViews).catch(e => setError(e.message));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setData(null);
    getJson(`/api/views/${selected}`).then(setData).catch(e => setError(e.message));
  }, [selected]);

  return (
    <div className="browser">
      <aside className="sidebar">
        <h2>Views</h2>
        {error && <ErrorBox error={error} />}
        <ul>
          {(views || []).map(v => (
            <li key={v} className={v === selected ? 'active' : ''} onClick={() => setSelected(v)}>{v}</li>
          ))}
        </ul>
      </aside>
      <div className="browser-main">
        <h2>{selected || 'Pick a view'}</h2>
        {selected && !data && !error && <div className="loading">Loading…</div>}
        {data && (
          <>
            <p className="muted">{data.rows.length} rows · {data.columns.length} columns</p>
            <ViewTable columns={data.columns} rows={data.rows} />
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState('story');
  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>Naive Set Theory</h1>
          <p className="subtitle">Three-valued (Strong Kleene) membership · Russell's paradox as one ungrounded fact</p>
        </div>
        <nav className="tabs">
          <button className={tab === 'story' ? 'active' : ''} onClick={() => setTab('story')}>Explorer</button>
          <button className={tab === 'views' ? 'active' : ''} onClick={() => setTab('views')}>All views</button>
        </nav>
      </header>
      <main className="main">
        {tab === 'story' ? <DomainScreen /> : <ViewsBrowser />}
      </main>
      <footer className="foot">
        Every value shown is a column of a <code>vw_*</code> view in <code>erb_naive_set_theory</code>. The view is the contract.
      </footer>
    </div>
  );
}
