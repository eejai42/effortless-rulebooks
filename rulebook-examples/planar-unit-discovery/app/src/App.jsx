import { useEffect, useState } from 'react';

// Every value on every screen is a column of a vw_* view. Nothing is derived
// here: the only client-side work is grouping rows by the FK values the views
// already carry and laying them out.

async function getJson(url) {
  const r = await fetch(url);
  const body = await r.json();
  if (!r.ok) throw new Error(body.error || `${url} failed with HTTP ${r.status}`);
  return body;
}

function useJson(url) {
  const [state, setState] = useState({ loading: true, data: null, error: null });
  useEffect(() => {
    if (!url) return;
    let alive = true;
    setState({ loading: true, data: null, error: null });
    getJson(url)
      .then((data) => alive && setState({ loading: false, data, error: null }))
      .catch((e) => alive && setState({ loading: false, data: null, error: e.message }));
    return () => { alive = false; };
  }, [url]);
  return state;
}

const useView = (name) => useJson(`/api/views/${name}`);

function fmt(v) {
  if (v === null || v === undefined || v === '') return '—';
  if (v === true) return '✓';
  if (v === false) return '✗';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

function cellClass(v) {
  if (v === true) return 'yes';
  if (v === false) return 'no';
  if (v === null || v === undefined || v === '') return 'null';
  return '';
}

function ErrorBox({ error }) {
  return <div className="error"><strong>Error:</strong> {error}</div>;
}

// Renders a view. `columns` picks and orders columns from the view's own
// column list; omitted means all columns in view order.
function Grid({ state, columns, pk, onSelect, selected, empty = 'No rows.' }) {
  if (state.loading) return <div className="loading">Loading…</div>;
  if (state.error) return <ErrorBox error={state.error} />;
  const { data } = state;
  const cols = columns || data.columns;
  if (data.rows.length === 0) return <div className="loading">{empty}</div>;
  return (
    <div className="table-wrap">
      <table className="grid">
        <thead>
          <tr>{cols.map((c) => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {data.rows.map((row, i) => {
            const key = pk ? row[pk] : i;
            return (
              <tr
                key={key}
                className={(onSelect ? 'clickable ' : '') + (selected === key ? 'selected' : '')}
                onClick={onSelect ? () => onSelect(key) : undefined}
              >
                {cols.map((c) => (
                  <td key={c} className={cellClass(row[c])} title={typeof row[c] === 'string' ? row[c] : undefined}>
                    {fmt(row[c])}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="meta">{data.rows.length} row(s) from the view</div>
    </div>
  );
}

function Section({ title, view, children }) {
  return (
    <section className="card">
      <header className="card-head">
        <h2>{title}</h2>
        {view && <code className="view-tag">{view}</code>}
      </header>
      {children}
    </section>
  );
}

// ---------------------------------------------------------------- Ledger

function Ledger() {
  const theorems = useView('vw_theorems');
  const lemmas = useView('vw_lemmas');
  const conjectures = useView('vw_conjectures');
  return (
    <>
      <p className="lede">
        The territory, not the trail: each theorem, lemma and conjecture is a row, and its status columns
        (proven, anchored, audited, currently valid) are formulas the rulebook computed — read straight from the view.
      </p>
      <Section title="Theorems" view="vw_theorems">
        <Grid
          state={theorems}
          pk="theorem_id"
          columns={[
            'theorem_id', 'display_name', 'is_proven', 'is_anchor', 'anchored_lower_bound', 'anchored_bound_exponent',
            'claimed_exponent', 'anchor_matches_bound_exponent', 'anchored_bound_is_superlinear',
            'anchored_bound_is_algebraically_anchored', 'algebraic_chain_closed', 'anchored_bound_open_obligation_count',
            'anchored_bound_all_obligations_satisfied', 'fully_audited_and_closed', 'is_unit_distance_theorem',
            'valid_from', 'valid_to', 'is_currently_valid', 'is_historically_anchored', 'is_audited_and_closed',
            'proof_citation', 'statement_text',
          ]}
        />
      </Section>
      <Section title="Lemmas" view="vw_lemmas">
        <Grid
          state={lemmas}
          pk="lemma_id"
          columns={[
            'lemma_id', 'label', 'source_reference', 'feeds_object_table', 'feeds_object_id', 'is_loaded',
            'is_load_bearing', 'obligation_count', 'valid_from', 'valid_to', 'is_currently_valid', 'statement_text',
          ]}
        />
      </Section>
      <Section title="Conjectures" view="vw_conjectures">
        <Grid
          state={conjectures}
          pk="conjecture_id"
          columns={[
            'conjecture_id', 'display_name', 'target_function', 'conjectured_exponent', 'is_conjectural_upper_bound',
            'is_conjectural_lower_bound', 'proposed_by', 'is_resolved', 'resolved_as', 'is_still_open',
            'related_theorem', 'is_currently_valid', 'statement_text',
          ]}
        />
      </Section>
    </>
  );
}

// ---------------------------------------------------------------- Timeline

function Timeline() {
  const bounds = useView('vw_asymptotic_lower_bounds');
  const snapshots = useView('vw_temporal_snapshots');
  const validity = useView('vw_lower_bound_validity_at_snapshot');

  const anyError = bounds.error || snapshots.error || validity.error;
  const ready = bounds.data && snapshots.data && validity.data;

  let grid = null;
  if (ready) {
    const boundRows = [...bounds.data.rows].sort((a, b) => Number(a.exponent) - Number(b.exponent));
    const snapRows = [...snapshots.data.rows].sort((a, b) => String(a.snapshot_date).localeCompare(String(b.snapshot_date)));
    // The validity view carries one row per (bound, snapshot); index it by those FK values.
    const byKey = new Map();
    for (const v of validity.data.rows) byKey.set(`${v.asymptotic_lower_bound}|${v.temporal_snapshot}`, v);
    grid = (
      <div className="table-wrap">
        <table className="grid matrix">
          <thead>
            <tr>
              <th>snapshot</th>
              <th>snapshot_date</th>
              {boundRows.map((b) => (
                <th key={b.asymptotic_lower_bound_id} title={b.display_name || b.name}>
                  {b.asymptotic_lower_bound_id}<br /><span className="sub">n^{fmt(b.exponent)}</span>
                </th>
              ))}
              <th>valid_lower_bound_count_at_this_moment</th>
              <th>best_known_lower_bound_exponent_at_this_moment</th>
              <th>pending_but_valid_by_date_count</th>
              <th>bounds_validated_or_retracted_this_moment</th>
            </tr>
          </thead>
          <tbody>
            {snapRows.map((s) => (
              <tr key={s.temporal_snapshot_id}>
                <td title={s.description}>{s.label}<br /><span className="sub">{s.temporal_snapshot_id}</span></td>
                <td>{fmt(s.snapshot_date)}</td>
                {boundRows.map((b) => {
                  const v = byKey.get(`${b.asymptotic_lower_bound_id}|${s.temporal_snapshot_id}`);
                  const val = v ? v.is_valid_at_this_snapshot : null;
                  return (
                    <td key={b.asymptotic_lower_bound_id} className={`center ${cellClass(val)}`}
                      title={v ? `${v.lower_bound_validity_at_snapshot_id}: valid ${fmt(v.bound_valid_from)} → ${fmt(v.bound_valid_to)}; curator-confirmed ${fmt(v.is_curator_confirmed_at_this_snapshot)}` : 'no LowerBoundValidityAtSnapshot row'}>
                      {fmt(val)}
                    </td>
                  );
                })}
                <td className="center">{fmt(s.valid_lower_bound_count_at_this_moment)}</td>
                <td className="center">{fmt(s.best_known_lower_bound_exponent_at_this_moment)}</td>
                <td className="center">{fmt(s.pending_but_valid_by_date_count)}</td>
                <td className="center">{fmt(s.bounds_validated_or_retracted_this_moment)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="meta">
          {snapRows.length} snapshot(s) × {boundRows.length} bound(s); each cell is
          <code> vw_lower_bound_validity_at_snapshot.is_valid_at_this_snapshot</code> for that (bound, snapshot) row.
        </div>
      </div>
    );
  }

  return (
    <>
      <p className="lede">
        Lower bounds on u(n) as they were believed at each moment. Rows are <code>TemporalSnapshots</code>, columns are
        <code> AsymptoticLowerBounds</code> ordered by exponent, and every cell is the validity the rulebook computed for that pair.
      </p>
      <Section title="Validity at each snapshot" view="vw_lower_bound_validity_at_snapshot">
        {anyError && (
          <>
            {bounds.error && <ErrorBox error={bounds.error} />}
            {snapshots.error && <ErrorBox error={snapshots.error} />}
            {validity.error && <ErrorBox error={validity.error} />}
          </>
        )}
        {!anyError && !ready && <div className="loading">Loading…</div>}
        {grid}
      </Section>
      <Section title="Asymptotic lower bounds" view="vw_asymptotic_lower_bounds">
        <Grid
          state={bounds}
          pk="asymptotic_lower_bound_id"
          columns={[
            'asymptotic_lower_bound_id', 'display_name', 'exponent', 'coefficient', 'is_explicit', 'is_superlinear',
            'exceeds_trivial_linear_bound', 'proof_pathway', 'is_algebraic_tower_proof', 'is_combinatorial_proof',
            'is_auditable_via_its_pathway', 'witness_source_family', 'witnessed_by_max_density_exponent', 'witness_consistent',
            'witness_family_is_algebraic', 'is_algebraically_anchored', 'obligation_count', 'satisfied_obligation_count',
            'open_obligation_count', 'all_obligations_satisfied', 'valid_from', 'valid_to', 'is_currently_valid',
            'source_citation', 'statement_text',
          ]}
        />
      </Section>
      <Section title="Temporal snapshots" view="vw_temporal_snapshots">
        <Grid
          state={snapshots}
          pk="temporal_snapshot_id"
          columns={[
            'temporal_snapshot_id', 'label', 'snapshot_date', 'is_historical', 'anchoring_source_reference',
            'valid_lower_bound_count_at_this_moment', 'best_known_lower_bound_exponent_at_this_moment',
            'curator_confirmed_best_known_lower_bound_exponent_at_this_momen', 'pending_but_valid_by_date_count',
            'bounds_validated_or_retracted_this_moment', 'description',
          ]}
        />
      </Section>
    </>
  );
}

// ---------------------------------------------------------------- Constructions

function Constructions() {
  const families = useView('vw_construction_families');
  const [familyId, setFamilyId] = useState(null);

  useEffect(() => {
    if (!familyId && families.data && families.data.rows.length) {
      setFamilyId(families.data.rows[0].construction_family_id);
    }
  }, [families.data, familyId]);

  const family = families.data && families.data.rows.find((r) => r.construction_family_id === familyId);
  const fieldId = family ? family.source_number_field : null;
  const latticeId = family ? family.source_minkowski_lattice : null;

  const instances = useJson(familyId ? `/api/domain/construction-instances-by-family/${encodeURIComponent(familyId)}` : null);
  const numberFields = useView('vw_number_fields');
  const lattices = useView('vw_minkowski_lattices');
  const primeIdeals = useJson(fieldId ? `/api/domain/prime-ideals-by-number-field/${encodeURIComponent(fieldId)}` : null);
  const shortVectors = useJson(latticeId ? `/api/domain/short-vectors-by-lattice/${encodeURIComponent(latticeId)}` : null);
  const projections = useJson(latticeId ? `/api/domain/planar-projections-by-lattice/${encodeURIComponent(latticeId)}` : null);
  const [projectionId, setProjectionId] = useState(null);
  const projected = useJson(projectionId ? `/api/domain/projected-short-vectors-by-projection/${encodeURIComponent(projectionId)}` : null);

  const pick = (state, pk, id) => {
    if (!state.data) return state;
    return { ...state, data: { columns: state.data.columns, rows: state.data.rows.filter((r) => r[pk] === id) } };
  };

  return (
    <>
      <p className="lede">
        A construction family names a number field, its Minkowski lattice, the short vectors of that lattice and the
        planar projections that turn them into unit-distance vectors. Select a family to follow the chain.
      </p>
      <Section title="Construction families" view="vw_construction_families">
        <Grid
          state={families}
          pk="construction_family_id"
          onSelect={setFamilyId}
          selected={familyId}
          columns={[
            'construction_family_id', 'display_name', 'source_number_field', 'source_minkowski_lattice', 'instance_count',
            'source_field_satisfies_golod_shafarevich', 'source_lattice_is_load_bearing', 'is_algebraic_construction',
            'description_of_nth_member',
          ]}
        />
      </Section>
      {familyId && (
        <>
          <Section title={`Instances of ${familyId}`} view="vw_construction_instances">
            <Grid
              state={instances}
              pk="construction_instance_id"
              empty="This family has no ConstructionInstances rows."
              columns={[
                'construction_instance_id', 'param_n', 'point_set', 'point_count', 'edge_count', 'density_exponent_estimate',
                'param_n_matches_point_count', 'family_is_algebraic', 'is_explicit_superlinear', 'is_algebraic_superlinear_witness',
              ]}
            />
          </Section>
          <div className="chain">
            <Section title={`Number field ${fmt(fieldId)}`} view="vw_number_fields">
              {fieldId ? (
                <Grid
                  state={pick(numberFields, 'number_field_id', fieldId)}
                  columns={[
                    'number_field_id', 'display_name', 'defining_polynomial', 'degree', 'discriminant', 'class_number',
                    'signature_real_embeddings', 'signature_complex_embeddings', 'ambient_lattice_dimension', 'is_totally_real',
                    'is_totally_complex', 'is_pid', 'small_norm_prime_ideal_count', 'golod_shafarevich_passing_count',
                    'satisfies_golod_shafarevich', 'is_algebraic_source_candidate', 'field_embedding_count',
                    'field_embedding_count_matches_signature',
                  ]}
                />
              ) : <div className="loading">This family has no source_number_field.</div>}
            </Section>
            {fieldId && (
              <Section title={`Prime ideals of ${fieldId}`} view="vw_prime_ideals">
                <Grid state={primeIdeals} empty="No PrimeIdeals rows for this field." />
              </Section>
            )}
            <Section title={`Minkowski lattice ${fmt(latticeId)}`} view="vw_minkowski_lattices">
              {latticeId ? (
                <Grid
                  state={pick(lattices, 'minkowski_lattice_id', latticeId)}
                  columns={[
                    'minkowski_lattice_id', 'number_field', 'dimension', 'field_discriminant', 'determinant', 'determinant_squared',
                    'absolute_field_discriminant', 'determinant_squared_equals_discriminant', 'short_vector_threshold_squared',
                    'short_vector_count', 'source_field_degree', 'source_field_satisfies_golod_shafarevich',
                    'source_field_is_algebraic_source_candidate', 'projection_count', 'has_any_planar_projection',
                    'is_load_bearing_for_unit_distance_construction', 'gram_matrix_json',
                  ]}
                />
              ) : <div className="loading">This family has no source_minkowski_lattice.</div>}
            </Section>
            {latticeId && (
              <>
                <Section title={`Short vectors of ${latticeId}`} view="vw_short_vectors">
                  <Grid
                    state={shortVectors}
                    empty="No ShortVectors rows for this lattice."
                    columns={['short_vector_id', 'coords_json', 'norm_squared', 'threshold_squared', 'is_short', 'description']}
                  />
                </Section>
                <Section title={`Planar projections of ${latticeId}`} view="vw_planar_projections">
                  <Grid
                    state={projections}
                    pk="planar_projection_id"
                    onSelect={setProjectionId}
                    selected={projectionId}
                    empty="No PlanarProjections rows for this lattice."
                    columns={[
                      'planar_projection_id', 'display_name', 'target_context', 'projection_kind', 'scaling_factor',
                      'rotation_degrees', 'is_scaling_preserving', 'is_isometric', 'preserves_unit_distance',
                      'projected_short_vector_count', 'unit_distance_vector_count', 'unit_distance_vector_yield',
                      'source_lattice_is_load_bearing',
                    ]}
                  />
                </Section>
                {projectionId && (
                  <Section title={`Projected short vectors of ${projectionId}`} view="vw_projected_short_vectors">
                    <Grid
                      state={projected}
                      empty="No ProjectedShortVectors rows for this projection."
                      columns={[
                        'projected_short_vector_id', 'short_vector', 'projected_x', 'projected_y', 'projected_norm_squared',
                        'source_norm_squared', 'source_is_short', 'unit_tolerance', 'distance_squared_from_unit',
                        'projects_to_unit_distance_vector', 'is_valid_witness', 'norm_preserved_under_projection',
                      ]}
                    />
                  </Section>
                )}
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}

// ---------------------------------------------------------------- Checklists

function Checklist({ state, pk, title, doneColumn, columns }) {
  if (state.loading) return <div className="loading">Loading…</div>;
  if (state.error) return <ErrorBox error={state.error} />;
  return (
    <ul className="checklist">
      {state.data.rows.map((row) => (
        <li key={row[pk]} className={cellClass(row[doneColumn])}>
          <span className="mark">{fmt(row[doneColumn])}</span>
          <div className="check-body">
            <div className="check-title">{title(row)}</div>
            <dl>
              {columns.map((c) => (
                <div key={c}><dt>{c}</dt><dd className={cellClass(row[c])}>{fmt(row[c])}</dd></div>
              ))}
            </dl>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Checklists() {
  const obligations = useView('vw_proof_obligations');
  const answerKey = useView('vw_answer_key');
  return (
    <>
      <p className="lede">
        What still has to be shown, and what the rulebook already checks. <code>is_satisfied</code> and
        <code> is_currently_matched</code> are view columns, not a tally.
      </p>
      <div className="two-col">
        <Section title="Proof obligations" view="vw_proof_obligations">
          <Checklist
            state={obligations}
            pk="proof_obligation_id"
            doneColumn="is_satisfied"
            title={(r) => `${r.proof_obligation_id} — ${fmt(r.obligation_kind)} for ${fmt(r.parent_bound)}`}
            columns={[
              'required_lemma', 'is_necessary', 'is_lemma_loaded', 'is_lemma_load_bearing', 'bound_claimed_exponent',
              'is_currently_open', 'is_currently_valid', 'description',
            ]}
          />
        </Section>
        <Section title="Answer key" view="vw_answer_key">
          <Checklist
            state={answerKey}
            pk="answer_key_id"
            doneColumn="is_currently_matched"
            title={(r) => `${r.answer_key_id} — ${fmt(r.target_table)}.${fmt(r.target_field)} @ ${fmt(r.target_row_id)}`}
            columns={[
              'data_type', 'expected_string', 'expected_number', 'expected_boolean', 'tolerance', 'gate_level',
              'is_blocking', 'is_currently_valid', 'description',
            ]}
          />
        </Section>
      </div>
    </>
  );
}

// ---------------------------------------------------------------- Sources

function Sources() {
  const sources = useView('vw_source_references');
  const [sourceId, setSourceId] = useState(null);
  const links = useJson(sourceId ? `/api/domain/citation-links-by-citing-source/${encodeURIComponent(sourceId)}` : null);
  const allLinks = useView('vw_citation_links');
  return (
    <>
      <p className="lede">
        The literature the discovery stands on. Select a source to see what it cites and how (improves, depends-on, context).
      </p>
      <Section title="Source references" view="vw_source_references">
        <Grid
          state={sources}
          pk="source_reference_id"
          onSelect={setSourceId}
          selected={sourceId}
          columns={[
            'source_reference_id', 'short_label', 'year', 'is_arxiv', 'is_published', 'lemma_count',
            'outbound_citation_count', 'inbound_citation_count', 'is_currently_valid', 'url', 'full_citation',
          ]}
        />
      </Section>
      <Section title={sourceId ? `Citations made by ${sourceId}` : 'All citation links'} view="vw_citation_links">
        <Grid
          state={sourceId ? links : allLinks}
          pk="citation_link_id"
          empty="This source has no outbound CitationLinks rows."
          columns={[
            'citation_link_id', 'citing_source', 'cited_source', 'citation_kind', 'is_load_bearing', 'is_dependency',
            'is_improvement', 'citing_year', 'cited_year', 'is_currently_valid', 'description',
          ]}
        />
      </Section>
    </>
  );
}

// ---------------------------------------------------------------- All views

function AllViews() {
  const views = useJson('/api/views');
  const [selected, setSelected] = useState(null);
  const data = useJson(selected ? `/api/views/${selected}` : null);
  return (
    <div className="browser">
      <aside className="view-list">
        {views.loading && <div className="loading">Loading…</div>}
        {views.error && <ErrorBox error={views.error} />}
        {views.data && (
          <ul>
            {views.data.map((v) => (
              <li key={v} className={v === selected ? 'active' : ''} onClick={() => setSelected(v)}>{v}</li>
            ))}
          </ul>
        )}
      </aside>
      <div className="view-body">
        {!selected && <p className="lede">Select a view to see every column and row it exposes.</p>}
        {selected && (
          <Section title={selected} view={selected}>
            <Grid state={data} />
          </Section>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Shell

const TABS = [
  ['ledger', 'Ledger', Ledger],
  ['timeline', 'Bounds timeline', Timeline],
  ['constructions', 'Constructions', Constructions],
  ['checklists', 'Checklists', Checklists],
  ['sources', 'Sources', Sources],
  ['views', 'All views', AllViews],
];

export default function App() {
  const [tab, setTab] = useState('ledger');
  const Active = TABS.find(([id]) => id === tab)[2];
  return (
    <div className="app">
      <header className="masthead">
        <div>
          <h1>Planar Unit-Distance Discovery</h1>
          <p>Ledger of theorems, bounds, constructions and sources — every value read from a <code>vw_*</code> view of <code>erb_planar_unit_discovery</code>.</p>
        </div>
        <nav className="tabs">
          {TABS.map(([id, label]) => (
            <button key={id} className={id === tab ? 'active' : ''} onClick={() => setTab(id)}>{label}</button>
          ))}
        </nav>
      </header>
      <main className="content">
        <Active />
      </main>
    </div>
  );
}
