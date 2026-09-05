import express from 'express';
import cors from 'cors';
import path from 'path';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'url';
import { query, withRollbackTransaction } from './db.js';
import { buildSummaryPdf } from './export-summary-pdf.js';
import { buildDetailsPdf } from './export-details-pdf.js';
import { exportXlsx } from './export-xlsx.js';
import { getConformanceState, startConformanceRun } from './conformance.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

app.use(cors());
app.use(express.json());

type AsyncRoute = express.RequestHandler;
function patchAsyncRouting(application: express.Application) {
  (['get', 'post', 'put', 'delete', 'patch'] as const).forEach(method => {
    const register = application[method].bind(application);
    application[method] = ((path: string, ...handlers: AsyncRoute[]) => {
      register(
        path,
        ...handlers.map(
          handler =>
            ((req, res, next) =>
              Promise.resolve(handler(req, res, next)).catch(next)) as AsyncRoute,
        ),
      );
    }) as typeof application[typeof method];
  });
}
patchAsyncRouting(app);

// --- Studies ---

app.get('/api/studies', async (_req, res) => {
  const rows = await query('SELECT * FROM vw_studies ORDER BY study_id');
  res.json(rows);
});

app.get('/api/studies/:id', async (req, res) => {
  const rows = await query(
    'SELECT * FROM vw_studies WHERE study_id = $1',
    [req.params.id]
  );
  if (!rows.length) { res.status(404).json({ error: 'not found' }); return; }
  res.json(rows[0]);
});

// --- Strata ---

app.get('/api/strata', async (req, res) => {
  const { study } = req.query;
  if (study) {
    const rows = await query(
      'SELECT * FROM vw_strata WHERE study = $1 ORDER BY stratum_id',
      [study]
    );
    res.json(rows);
  } else {
    const rows = await query('SELECT * FROM vw_strata ORDER BY stratum_id');
    res.json(rows);
  }
});

// --- Stratum summaries ---

app.get('/api/stratum-summaries', async (req, res) => {
  const { study } = req.query;
  if (study) {
    const rows = await query(
      'SELECT * FROM vw_stratum_summaries WHERE study = $1 ORDER BY stratum_summary_id',
      [study]
    );
    res.json(rows);
  } else {
    const rows = await query(
      'SELECT * FROM vw_stratum_summaries ORDER BY stratum_summary_id'
    );
    res.json(rows);
  }
});

// --- Treatment rankings ---

app.get('/api/treatment-rankings', async (req, res) => {
  const { study } = req.query;
  if (study) {
    const rows = await query(
      'SELECT * FROM vw_treatment_rankings WHERE study = $1 ORDER BY treatment_ranking_id',
      [study]
    );
    res.json(rows);
  } else {
    const rows = await query(
      'SELECT * FROM vw_treatment_rankings ORDER BY treatment_ranking_id'
    );
    res.json(rows);
  }
});

// --- Case cells (raw leaves — read from view) ---

app.get('/api/case-cells', async (req, res) => {
  const { study } = req.query;
  if (!study || typeof study !== 'string') {
    res.status(400).json({ error: 'study query param required' });
    return;
  }
  const rows = await query(
    `SELECT case_cell_id, study, stratum_label, treatment_label, successes, cases,
            cell_success_rate, total_cases_for_treatment, treatment_exposure_fraction
     FROM vw_case_cells
     WHERE study = $1
     ORDER BY stratum_label, treatment_label`,
    [study]
  );
  res.json(rows);
});

// --- Sandbox what-if (transactional: mutate case_cells, read views, rollback) ---

interface SandboxCellInput {
  stratum_label: string;
  treatment_label: string;
  successes: number;
  cases: number;
}

app.post('/api/sandbox/evaluate', async (req, res) => {
  const { study, cells } = req.body as { study?: string; cells?: SandboxCellInput[] };
  if (!study || !Array.isArray(cells) || cells.length === 0) {
    res.status(400).json({ error: 'study and cells[] required' });
    return;
  }

  for (const cell of cells) {
    if (
      typeof cell.stratum_label !== 'string' ||
      typeof cell.treatment_label !== 'string' ||
      typeof cell.successes !== 'number' ||
      typeof cell.cases !== 'number' ||
      cell.cases < 0 ||
      cell.successes < 0 ||
      cell.successes > cell.cases
    ) {
      res.status(400).json({ error: 'invalid cell payload' });
      return;
    }
  }

  try {
    const result = await withRollbackTransaction(async (client) => {
      for (const cell of cells) {
        const updated = await client.query(
          `UPDATE case_cells
           SET successes = $1, cases = $2
           WHERE study = $3 AND stratum_label = $4 AND treatment_label = $5`,
          [cell.successes, cell.cases, study, cell.stratum_label, cell.treatment_label]
        );
        if (updated.rowCount === 0) {
          throw new Error(
            `no case cell for study=${study} stratum=${cell.stratum_label} treatment=${cell.treatment_label}`
          );
        }
      }

      const rankingRes = await client.query(
        'SELECT * FROM vw_treatment_rankings WHERE study = $1 LIMIT 1',
        [study]
      );
      const summariesRes = await client.query(
        'SELECT * FROM vw_stratum_summaries WHERE study = $1 ORDER BY stratum_summary_id',
        [study]
      );
      const cellsRes = await client.query(
        `SELECT case_cell_id, study, stratum_label, treatment_label, successes, cases,
                cell_success_rate
         FROM vw_case_cells
         WHERE study = $1
         ORDER BY stratum_label, treatment_label`,
        [study]
      );

      return {
        ranking: rankingRes.rows[0] ?? null,
        summaries: summariesRes.rows,
        cells: cellsRes.rows,
      };
    });

    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(400).json({ error: message });
  }
});

// --- Treatments ---

app.get('/api/treatments', async (req, res) => {
  const { study } = req.query;
  if (study) {
    const rows = await query(
      'SELECT * FROM vw_treatments WHERE study = $1 ORDER BY treatment_id',
      [study]
    );
    res.json(rows);
  } else {
    const rows = await query('SELECT * FROM vw_treatments ORDER BY treatment_id');
    res.json(rows);
  }
});

// --- Model summary ---

app.get('/api/model-summary', async (_req, res) => {
  const rows = await query('SELECT * FROM vw_model_summary LIMIT 1');
  res.json(rows[0] ?? null);
});

// --- UI screens / components (from rulebook) ---

app.get('/api/ui-screens', async (_req, res) => {
  const rows = await query('SELECT * FROM vw_ui_screens ORDER BY ui_screen_id');
  res.json(rows);
});

app.get('/api/ui-components', async (_req, res) => {
  const rows = await query('SELECT * FROM vw_ui_components ORDER BY ui_component_id');
  res.json(rows);
});

// --- Methodology / Conclusions ---

app.get('/api/methodology', async (_req, res) => {
  const rows = await query('SELECT * FROM vw_methodology ORDER BY methodology_id');
  res.json(rows);
});

app.get('/api/conclusions', async (_req, res) => {
  const rows = await query('SELECT * FROM vw_conclusions ORDER BY conclusion_id');
  res.json(rows);
});

app.get('/api/discovery-hypotheses', async (_req, res) => {
  const rows = await query(
    'SELECT * FROM vw_discovery_hypotheses ORDER BY hypothesis_id'
  );
  res.json(rows);
});

app.get('/api/discovery-findings', async (_req, res) => {
  const rows = await query(
    'SELECT * FROM vw_discovery_findings ORDER BY hypothesis_id'
  );
  res.json(rows);
});

app.get('/api/invariant-checks', async (_req, res) => {
  const rows = await query(
    `SELECT invariant_check_id, name, natural_language, source_table,
            pass_count, fail_count, is_green, status_label, severity,
            protects_conclusion
     FROM vw_invariant_checks
     ORDER BY invariant_check_id`
  );
  res.json(rows);
});

// --- Allocation sweep ---

app.get('/api/sweep', async (req, res) => {
  const { study } = req.query;
  if (study) {
    const rows = await query(
      'SELECT * FROM vw_allocation_sweep WHERE study_id = $1 ORDER BY alloc_fraction_a',
      [study]
    );
    res.json(rows);
  } else {
    const rows = await query('SELECT * FROM vw_allocation_sweep ORDER BY study_id, alloc_fraction_a');
    res.json(rows);
  }
});

app.get('/api/sweep-summary', async (_req, res) => {
  const rows = await query(
    'SELECT * FROM vw_sweep_study_summary ORDER BY sweep_study_id'
  );
  res.json(rows);
});

// --- Synthetic phase diagram (loop-50) ---

app.get('/api/synthetic-phase', async (_req, res) => {
  const rows = await query(
    'SELECT phase_id, param_stratum_fraction, param_stratum_gap1, param_stratum_gap2, param_allocation_bias, phase_signed_pooled_gap, phase_corrected_gap, phase_allocation_distortion, phase_distortion_type, phase_is_sign_flip, phase_reversal_intensity FROM vw_synthetic_phase ORDER BY phase_id'
  );
  res.json(rows);
});

app.get('/api/phase-diagram-summary', async (_req, res) => {
  const rows = await query('SELECT * FROM vw_phase_diagram_summary LIMIT 1');
  res.json(rows[0] ?? null);
});

// --- Import catalog (loops 51-54) ---

app.get('/api/corpus-catalog-summary', async (_req, res) => {
  const rows = await query('SELECT * FROM vw_corpus_catalog_summary LIMIT 1');
  res.json(rows[0] ?? null);
});

app.get('/api/candidate-study-catalog', async (_req, res) => {
  const rows = await query(
    'SELECT * FROM vw_candidate_study_catalog ORDER BY priority, proposed_study_id'
  );
  res.json(rows);
});

app.get('/api/domain-expansion-targets', async (_req, res) => {
  const rows = await query(
    'SELECT * FROM vw_domain_expansion_targets ORDER BY domain'
  );
  res.json(rows);
});

app.get('/api/study-import-template', async (_req, res) => {
  const rows = await query(
    'SELECT template_step_id, sort_order, target_table, row_description, required_fields, mechanical_check FROM vw_study_import_template ORDER BY sort_order'
  );
  res.json(rows);
});

// --- Effortless loops (build history + forward plan) ---

app.get('/api/loops', async (_req, res) => {
  const rows = await query(
    `SELECT loop_id, name, title, status, new_concept, domain_question,
            mock_data_note, next_suggestion, tradition_id,
            commit_hash, commit_short, commit_date, commit_message, git_tag
     FROM vw_loops
     ORDER BY loop_id`
  );
  res.json(rows);
});

// --- OWL-SHACL conformance (on-demand; not part of effortless build) ---

app.get('/api/conformance/status', (_req, res) => {
  res.json(getConformanceState());
});

app.post('/api/conformance/run', (_req, res) => {
  try {
    const started = startConformanceRun();
    res.status(202).json(started);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(409).json({ error: message });
  }
});

// --- PDF summary export (conclusions + findings, not full rulebook) ---

app.get('/api/export/xlsx', async (_req, res) => {
  try {
    await exportXlsx(res);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[export/xlsx]', message);
    res.status(500).json({ error: message });
  }
});

app.get('/api/export/summary-pdf', async (_req, res) => {
  try {
    const pdf = await buildSummaryPdf();
    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="simpsons-paradox-summary-${stamp}.pdf"`,
    );
    res.send(pdf);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[export/summary-pdf]', message);
    res.status(500).json({ error: message });
  }
});

app.get('/api/export/details-pdf', async (_req, res) => {
  try {
    const pdf = await buildDetailsPdf();
    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="simpsons-paradox-details-${stamp}.pdf"`,
    );
    res.send(pdf);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[export/details-pdf]', message);
    res.status(500).json({ error: message });
  }
});

// Serve the standalone explorer HTML from the project root
const projectRoot = path.resolve(__dirname, '../..');
const rulespeakDir = path.join(projectRoot, 'rulespeak');
const rulespeakPdfScript = path.join(rulespeakDir, 'generate-rulespeak-pdf.sh');

app.get('/simpsons-paradox-explorer.html', (_req, res) => {
  res.sendFile(path.join(projectRoot, 'simpsons-paradox-explorer.html'));
});

app.get('/simpsons-paradox-summary.pdf', (_req, res) => {
  const pdfPath = path.join(projectRoot, 'simpsons-paradox-summary.pdf');
  res.sendFile(pdfPath, (err) => {
    if (err) {
      res.status(404).json({
        error:
          'simpsons-paradox-summary.pdf not found — run ./effortless-postgres/init-db.sh after effortless build',
      });
    }
  });
});

app.get('/simpsons-paradox-details.pdf', (_req, res) => {
  const pdfPath = path.join(projectRoot, 'simpsons-paradox-details.pdf');
  res.sendFile(pdfPath, (err) => {
    if (err) {
      res.status(404).json({
        error:
          'simpsons-paradox-details.pdf not found — run ./effortless-postgres/init-db.sh after effortless build',
      });
    }
  });
});

app.get('/rulespeak/rulespeak.pdf', (_req, res) => {
  const pdfPath = path.join(rulespeakDir, 'rulespeak.pdf');
  if (existsSync(pdfPath)) {
    res.sendFile(pdfPath);
    return;
  }
  const child = spawn(rulespeakPdfScript, [], { cwd: rulespeakDir });
  let stderr = '';
  child.stderr.on('data', (d) => { stderr += d.toString(); });
  child.on('error', (err) => {
    res.status(500).json({ error: String(err) });
  });
  child.on('close', (code) => {
    if (code !== 0 || !existsSync(pdfPath)) {
      res.status(500).json({
        error: stderr.trim() || `rulespeak PDF generation failed (exit ${code})`,
      });
      return;
    }
    res.sendFile(pdfPath);
  });
});

app.use('/rulespeak', express.static(rulespeakDir));

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error('[api]', message);
  if (!res.headersSent) {
    res.status(500).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`[simpsons-paradox api] http://localhost:${PORT}`);
});
