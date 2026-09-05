// index.js — Express API for the Causal Autoimmune Architecture admin app.
//
// ============================================================================
//  WHAT THIS APP IS (see project CLAUDE.md "What this app actually IS")
// ============================================================================
//  Not a CRUD UI. A diagnostic inference engine validated by a witnessed test
//  harness, whose payoff is a doctor-style writeup per patient, derived from
//  raw facts alone.
//
//   - GET /api/harness          runs the WHOLE witnessed suite and returns the
//                               category -> test -> pass/fail+witness tree. The
//                               browser renders THIS as the home screen.
//   - GET /api/diagnosis/:id    the REAL PAYOFF — a doctor-style diagnosis
//                               report (Markdown) for one patient, derived from
//                               vw_* . Works today because the model is already
//                               solved in Postgres.
//
// ============================================================================
//  RED-GREEN CONTRACT (Loop 0.5 — Test Harness First)
// ============================================================================
//  The harness (tests/harness/) asserts the ENTIRE IsClinicallyActionable DAG
//  for all 7 oracle patients BY HITTING THIS API. The inference-surface
//  endpoints below are wired progressively; any still returning 501 show as RED
//  ("not surfaced") in the harness. As each is wired to read vw_*, its tests go
//  GREEN. That progression — red -> green — IS the build-out the user watches.
//
//  Inference-surface endpoints (and the loop that turns each green):
//    Loop 1  GET /api/cohort                      (keystone list)
//    Loop 1  GET /api/predictions/:id             (full prediction panel)
//    Loop 3  GET /api/mechanisms/:id              (mechanism node)
//    Loop 3  GET /api/mechanisms/:id/evidence     (evidence leaves)
//    Loop 3  GET /api/mechanisms/:id/replications (transport atoms)
//    Loop 3  GET /api/mechanisms/:id/controls     (anti-spurious atoms)
//    Loop 3  GET /api/predictions/:id/calibration (calibration atoms)
//    Loop 3  GET /api/individuals/:id             (per-person rollup)
//    Loop 3  GET /api/variants/:id                (variant candidacy)
// ============================================================================

import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { query, pool } from './db.js';
import { runHarness, groupByCategory } from '../tests/harness/check-engine.js';
import { buildDiagnosis, renderMarkdown, buildWitness } from './diagnosis.js';
import { ingestIntake, IntakeError } from './intake.js';
import { router as routingRouter } from './routes/routing.js';
import { router as stateMachineRouter } from './routes/state-machines.js';
import { router as loopsRouter } from './routes/loops.js';
import { router as exportRouter } from './routes/export.js';
import { router as snapshotRouter } from './routes/snapshot.js';
import { router as owlRouter } from './routes/owl.js';

export const app = express();
app.use(express.json());

// ---- small helpers for the inference surface (read vw_*; project rule) -------
// one(view, idCol): serve a single row by id, 404 if missing.
const one = (view, idCol) => async (req, res) => {
  try {
    const rows = await query(`SELECT * FROM ${view} WHERE ${idCol} = $1`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'not_found', id: req.params.id });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: String(err) }); }
};
// many(view, fkCol, orderCol): serve all rows whose FK column == :id.
const many = (view, fkCol, orderCol) => async (req, res) => {
  try {
    const order = orderCol ? ` ORDER BY ${orderCol}` : '';
    res.json(await query(`SELECT * FROM ${view} WHERE ${fkCol} = $1${order}`, [req.params.id]));
  } catch (err) { res.status(500).json({ error: String(err) }); }
};

// ---- Health -----------------------------------------------------------------
app.get('/api/health', async (_req, res) => {
  try {
    const rows = await query('SELECT 1 AS ok');
    res.json({ ok: rows[0]?.ok === 1, service: 'causal-autoimmune-admin' });
  } catch (err) {
    res.status(503).json({ ok: false, error: String(err) });
  }
});

// ---- THE HOME SCREEN: run the witnessed harness against THIS server ---------
// Self-hosted: we run the engine against our own listening origin so the tree
// reflects exactly what the app surfaces right now (red where 501, green where
// wired). Result: { summary, categories:[{category, level, pass, total, items}] }.
//
// The engine serially self-fetches ~300 endpoints, so a cold run is ~15s. The
// underlying vw_* data only changes on `effortless build`, so we memoize the
// result with a short TTL: the home screen + the Full-chain diagnosis tab both
// become instant after the first load. Bust it with `?fresh=1`.
let _harnessCache = null; // { at: epochMs, payload }
const HARNESS_TTL_MS = 60_000;
async function getHarness(base, fresh) {
  if (!fresh && _harnessCache && Date.now() - _harnessCache.at < HARNESS_TTL_MS) {
    return _harnessCache.payload;
  }
  const { checks, summary } = await runHarness(base);
  const payload = { summary, categories: groupByCategory(checks) };
  _harnessCache = { at: Date.now(), payload };
  return payload;
}

app.get('/api/harness', async (req, res) => {
  try {
    const base = `http://127.0.0.1:${req.socket.localPort}`;
    res.json(await getHarness(base, req.query.fresh === '1'));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ---- THE PAYOFF: a doctor-style diagnosis report for one patient ------------
app.get('/api/diagnosis/:id', async (req, res) => {
  try {
    const d = await buildDiagnosis(req.params.id);
    if (!d) return res.status(404).json({ error: 'not_found', id: req.params.id });
    const markdown = renderMarkdown(d);
    if (req.query.format === 'json') return res.json({ id: req.params.id, derived: d.p, markdown });
    res.type('text/markdown').send(markdown);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// THE 3-PANEL WITNESS — case text → extracted facts (w/ provenance) → verdict.
// Powers the interactive witness tab; the extraction is checkable against the
// case text independently of the derived conclusion.
app.get('/api/witness/:id', async (req, res) => {
  try {
    const w = await buildWitness(req.params.id);
    if (!w) return res.status(404).json({ error: 'not_found', id: req.params.id });
    res.json(w);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// List patients available for diagnosis (always works — reads vw_*).
app.get('/api/patients', async (_req, res) => {
  try {
    const rows = await query(
      'SELECT individual_prediction_id, individual, individual_ancestry_label, is_ancestry_holdout FROM vw_individual_predictions ORDER BY individual_prediction_id',
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ---------------------------------------------------------------------------
//  INFERENCE SURFACE — wired to vw_* (project rule: read views, never base).
//  These are what the witnessed harness asserts against. Each serves the
//  deterministic derived value for one DAG node so its tests go GREEN.
// ---------------------------------------------------------------------------

// Keystone level — cohort list + full prediction panel.
app.get('/api/cohort', async (_req, res) => {
  try {
    res.json(await query('SELECT * FROM vw_individual_predictions ORDER BY individual_prediction_id'));
  } catch (err) { res.status(500).json({ error: String(err) }); }
});
app.get('/api/predictions/:id', one('vw_individual_predictions', 'individual_prediction_id'));

// v2 COHORT DISCOVERY — the cohort-level disease-state surface. One row per
// individual (all 9, incl. the progression-demo patients H/I that have no
// prediction), joining the derived disease state to the latest serology trend
// (the scatter inputs) and to the prediction's keystone + treatment line where
// one exists. This is the data behind the Cohort Discovery board: discovery is a
// CORPUS-level act, so this endpoint is the population view v1 never had.
app.get('/api/cohort-individuals', async (_req, res) => {
  try {
    const rows = await query(`
      SELECT i.individual_id,
             i.given_name, i.family_name, i.ancestry_label, i.is_ancestry_absent_from_training,
             i.nephritis_progression_state_key, i.latest_sledai_score, i.activity_tier,
             i.is_disease_progressing, i.target_pathway,
             i.count_pre_nephritic_signature_panels, i.is_in_pre_nephritic_signature_cluster,
             i.signature_strength,
             s.anti_ds_dna_trend, s.complement_trend,
             p.individual_prediction_id, p.is_clinically_actionable, p.deciding_gate,
             p.recommended_treatment_line, p.treatment_line_deciding_factor,
             p.progression_vs_actionability_disagree
      FROM vw_individuals i
      LEFT JOIN LATERAL (
        SELECT anti_ds_dna_trend, complement_trend
        FROM vw_serology_observations s2
        WHERE s2.individual = i.individual_id
        ORDER BY s2.sequence_index DESC LIMIT 1
      ) s ON TRUE
      LEFT JOIN vw_individual_predictions p ON p.individual = i.individual_id
      ORDER BY i.individual_id`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

// The MARQUEE walk: each case's ordered path through the diagnosis-lifecycle machine,
// ending at its deciding terminal. Anchors the case-by-case "upside-down" presentation.
app.get('/api/predictions/:id/lifecycle', async (req, res) => {
  try {
    const pred = (await query(
      'SELECT individual_prediction_id, lifecycle_state_key, is_clinically_actionable FROM vw_individual_predictions WHERE individual_prediction_id = $1',
      [req.params.id],
    ))[0];
    if (!pred) return res.status(404).json({ error: 'not_found', id: req.params.id });
    const instances = await query(
      `SELECT state_key, entered_at, exited_at, sequence_index::int AS sequence_index,
              is_current, entered_via_transition, prior_instance
       FROM vw_subject_state_instances
       WHERE subject_table_name = 'IndividualPredictions' AND subject_id = $1
       ORDER BY sequence_index`,
      [req.params.id],
    );
    const transitions = await query(
      `SELECT from_state_key, to_state_key, transition_at, triggered_by_role, reason
       FROM vw_state_transitions
       WHERE subject_table_name = 'IndividualPredictions' AND subject_id = $1
       ORDER BY transition_at`,
      [req.params.id],
    );
    res.json({
      prediction: req.params.id,
      states: instances.map((i) => i.state_key),
      current: pred.lifecycle_state_key,
      terminal: instances.length ? instances[instances.length - 1].state_key : null,
      is_clinically_actionable: pred.is_clinically_actionable,
      instances,
      transitions,
    });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

// Mechanism node + its leaf atoms.
app.get('/api/mechanisms/:id', one('vw_causal_mechanisms', 'causal_mechanism_id'));
app.get('/api/mechanisms/:id/evidence', many('vw_evidence_items', 'causal_mechanism', 'evidence_item_id'));
app.get('/api/mechanisms/:id/replications', many('vw_cohort_replications', 'causal_mechanism', 'cohort_replication_id'));
app.get('/api/mechanisms/:id/controls', many('vw_negative_control_tests', 'causal_mechanism', 'negative_control_test_id'));

// Calibration atoms (per prediction).
app.get('/api/predictions/:id/calibration', many('vw_calibration_bins', 'individual_prediction', 'calibration_bin_id'));

// Per-person rollup + variant candidacy.
//
// The intake workspace addresses a patient by its route :caseId, which is the
// individual_id (e.g. 'ind-a-reyes') in the nav but the slug (e.g. 'reyes-ana')
// in every entity row's own relative_path. So an individual is resolvable by
// EITHER — resolveIndividualId() normalizes both to the canonical individual_id
// before any child-list lookup, so a link from anywhere lands on the same case.
async function resolveIndividualId(idOrSlug) {
  if (!idOrSlug) return null;
  const rows = await query(
    'SELECT individual_id FROM vw_individuals WHERE individual_id = $1 OR slug = $1 LIMIT 1',
    [idOrSlug],
  );
  return rows.length ? rows[0].individual_id : null;
}

app.get('/api/individuals/:id', async (req, res) => {
  try {
    const indId = await resolveIndividualId(req.params.id);
    if (!indId) return res.status(404).json({ error: 'not_found', id: req.params.id });
    const rows = await query('SELECT * FROM vw_individuals WHERE individual_id = $1', [indId]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

// v2 DISEASE-STATE SIMULATOR — an individual's walk through the lupus-nephritis
// progression machine: the bitemporal occupancy chain + the derived current state.
// Mirrors /predictions/:id/lifecycle but for the DISEASE course (subject = Individual),
// whose current state is derived purely from raw serology leaves. This is the layer the
// v1 audit said didn't exist: not "is the evidence actionable" but "is the disease
// progressing" — and how long it has been in each state (DwellDays).
app.get('/api/individuals/:id/progression', async (req, res) => {
  try {
    const indId = await resolveIndividualId(req.params.id);
    if (!indId) return res.status(404).json({ error: 'not_found', id: req.params.id });
    const ind = (await query(
      `SELECT individual_id, nephritis_progression_state_key, latest_sledai_score,
              activity_tier, is_disease_progressing, target_pathway
       FROM vw_individuals WHERE individual_id = $1`, [indId]))[0];
    const instances = await query(
      `SELECT state_key, entered_at, exited_at, sequence_index::int AS sequence_index,
              dwell_days, is_long_dwell, is_current, entered_via_transition, prior_instance
       FROM vw_subject_state_instances
       WHERE state_machine = 'lupus-nephritis-progression' AND subject_id = $1
       ORDER BY sequence_index`, [indId]);
    const transitions = await query(
      `SELECT from_state_key, to_state_key, transition_at, triggered_by_role, reason
       FROM vw_state_transitions
       WHERE state_machine = 'lupus-nephritis-progression' AND subject_id = $1
       ORDER BY transition_at`, [indId]);
    // the RAW serology leaves that DROVE each derived state — the provenance the
    // witness model demands: the panel numbers are checkable independently of the
    // state the model derived from them.
    const serology = await query(
      `SELECT serology_observation_id, observed_at, sequence_index::int AS sequence_index,
              anti_ds_dna_iu, complement_c3, complement_c4, proteinuria_g_per_day,
              egfr_ml_min, has_active_urinary_sediment, anti_ds_dna_trend, complement_trend,
              sledai_score, progression_state_key
       FROM vw_serology_observations WHERE individual = $1 ORDER BY sequence_index`, [indId]);
    res.json({
      individual: indId,
      states: instances.map((i) => i.state_key),
      current: ind?.nephritis_progression_state_key ?? null,
      terminal: instances.length ? instances[instances.length - 1].state_key : null,
      latest_sledai_score: ind?.latest_sledai_score ?? null,
      activity_tier: ind?.activity_tier ?? null,
      is_disease_progressing: ind?.is_disease_progressing ?? null,
      target_pathway: ind?.target_pathway ?? null,
      instances,
      transitions,
      serology,
    });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

// An individual's leaf observation tables, each id-or-slug addressable. These
// back the intake workspace's Variants / Assays panes (raw facts only — the
// derived candidacy/quality flags ride along from the view).
const childList = (view, orderCol) => async (req, res) => {
  try {
    const indId = await resolveIndividualId(req.params.id);
    if (!indId) return res.status(404).json({ error: 'not_found', id: req.params.id });
    const order = orderCol ? ` ORDER BY ${orderCol}` : '';
    res.json(await query(`SELECT * FROM ${view} WHERE individual = $1${order}`, [indId]));
  } catch (err) { res.status(500).json({ error: String(err) }); }
};
app.get('/api/individuals/:id/variants', childList('vw_genomic_variants', 'genomic_variant_id'));
app.get('/api/individuals/:id/assays', childList('vw_omics_assays', 'omics_assay_id'));
app.get('/api/variants/:id', one('vw_genomic_variants', 'genomic_variant_id'));

// ---------------------------------------------------------------------------
//  WRITE PATH (Loop 3) — raw facts in -> derived diagnosis out.
//  POST /api/intake accepts ONLY raw leaf observations, writes them to the
//  base tables in one transaction, then re-reads the DERIVED panel from vw_*.
//  The conclusion (keystone/gates/DecidingGate/diagnosis) is never entered —
//  the response computes it downstream of the leaves. This is the knob payoff.
// ---------------------------------------------------------------------------
app.post('/api/intake', async (req, res) => {
  try {
    const result = await ingestIntake(req.body);
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof IntakeError) return res.status(400).json({ error: 'invalid_intake', detail: err.message });
    res.status(500).json({ error: String(err) });
  }
});

// Cleanup counterpart — intake is create-only, so demo patients are removed via
// this. Deletes the individual and every child row keyed off its id namespace
// (slug == individual_id minus the 'ind-' prefix). Base-table writes only.
app.delete('/api/individuals/:id', async (req, res) => {
  const indId = req.params.id;
  const slug = indId.replace(/^ind-/, '');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const found = await client.query('SELECT 1 FROM individuals WHERE individual_id = $1', [indId]);
    if (!found.rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'not_found', id: indId }); }
    // children first (no FK constraints enforced in demo, but order is honest)
    await client.query('DELETE FROM calibration_bins WHERE calibration_bin_id LIKE $1', [`cb-${slug}-%`]);
    await client.query('DELETE FROM individual_predictions WHERE individual = $1', [indId]);
    await client.query('DELETE FROM evidence_items WHERE evidence_item_id LIKE $1', [`ev-${slug}-%`]);
    await client.query('DELETE FROM cohort_replications WHERE cohort_replication_id LIKE $1', [`rep-${slug}-%`]);
    await client.query('DELETE FROM negative_control_tests WHERE negative_control_test_id LIKE $1', [`nct-${slug}-%`]);
    await client.query('DELETE FROM intervention_targets WHERE intervention_target_id LIKE $1', [`it-${slug}-%`]);
    await client.query('DELETE FROM causal_mechanisms WHERE individual = $1', [indId]);
    await client.query('DELETE FROM omics_assays WHERE individual = $1', [indId]);
    await client.query('DELETE FROM genomic_variants WHERE individual = $1', [indId]);
    await client.query('DELETE FROM individuals WHERE individual_id = $1', [indId]);
    await client.query('COMMIT');
    res.json({ deleted: indId });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: String(err) });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
//  ROUTING & NAVIGATION + STATE MACHINE surfaces (the new admin tooling).
// ---------------------------------------------------------------------------
app.use('/api/routing', routingRouter);
app.use('/api/state-machines', stateMachineRouter);
app.use('/api/effortless-loops', loopsRouter);
app.use('/api/owl', owlRouter);
app.use('/api', exportRouter); // GET /api/export.xlsx
app.use('/api', snapshotRouter); // POST /api/snapshot-to-rulebook[?mode=replace]

// ---------------------------------------------------------------------------
//  STATIC SPA (production / container) — serve the built React client.
//  In local dev, Vite (:6348) serves the SPA and proxies /api here, so this
//  block is inert (dist/ usually absent / unused). In the Docker image the
//  client is pre-built to admin-app/dist and THIS server is the only origin:
//  it serves the SPA + the explainer-dag assets + the /api surface on one
//  port. Registered AFTER every /api route so the API always wins; the
//  catch-all only handles non-/api GETs (client-side routing → index.html).
// ---------------------------------------------------------------------------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../dist');
if (existsSync(path.join(DIST_DIR, 'index.html'))) {
  app.use(express.static(DIST_DIR));
  app.get(/^\/(?!api\/).*/, (_req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

// ---- start only when run directly (not when imported by the harness) -------
const PORT = process.env.PORT || 4173;
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  app.listen(PORT, () => {
    console.log(`[admin-app] API listening on http://localhost:${PORT}`);
    console.log(`[admin-app] Home screen = the witnessed harness:  GET /api/harness`);
    console.log(`[admin-app] Diagnosis payoff:                     GET /api/diagnosis/pred-a`);
    console.log('[admin-app] Inference surface is RED (501) — turns green as it is wired.');
  });
}
