// routes/loops.js — Effortless-loop editor surface.
//
// Reads vw_effortless_loops (carries derived completedness / is_in_current_plan),
// writes the effortless_loops BASE table (project rule). status_badge / status_line
// are RAW presentation columns, so we recompute them server-side from status on
// write to keep the regenerated plan in sync.
//
// ROUND-TRIP CAVEAT: edits land in the Postgres base table, but `effortless build`
// reseeds the DB from the rulebook hub — so base-table edits are overwritten on
// the next rebuild unless a reverse-sync (DB -> rulebook) step exists. The
// regenerate-plan action reflects the RULEBOOK's current EffortlessLoops rows, not
// unsaved DB edits. The UI surfaces this. (Same caveat applies to routing edits.)
import express from 'express';
import { exec } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { query } from '../db.js';

export const router = express.Router();

// Project root = three levels up from this file (server/routes -> server -> admin-app -> project).
const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

const BADGE = { done: '[DONE]', next: '[NEXT]', planned: '[PLANNED]', backlog: '[BACKLOG]' };

// GET /api/effortless-loops — read the derived view.
router.get('/', async (_req, res) => {
  try {
    const rows = await query(
      `SELECT effortless_loop_id, loop_number, title, goal, status, rule_commit_msg, state_commit_msg,
              sort_order, status_badge, status_line, completedness, is_in_current_plan
       FROM vw_effortless_loops ORDER BY sort_order`,
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

// PUT /api/effortless-loops/:id — write the base table; recompute status_badge/status_line.
router.put('/:id', async (req, res) => {
  const allowed = ['loop_number', 'title', 'goal', 'status', 'rule_commit_msg', 'state_commit_msg', 'sort_order'];
  const body = { ...req.body };
  try {
    if ('status' in body || 'rule_commit_msg' in body || 'state_commit_msg' in body) {
      const cur = (await query('SELECT * FROM effortless_loops WHERE effortless_loop_id = $1', [req.params.id]))[0];
      if (!cur) return res.status(404).json({ error: 'not_found', id: req.params.id });
      const status = body.status ?? cur.status;
      const rule = body.rule_commit_msg ?? cur.rule_commit_msg;
      const state = body.state_commit_msg ?? cur.state_commit_msg;
      body.status_badge = BADGE[status] || `[${String(status).toUpperCase()}]`;
      if (status === 'done' || status === 'next') {
        const parts = [];
        if (rule) parts.push('rule `' + rule + '`');
        if (state) parts.push('state `' + state + '`');
        body.status_line = parts.length ? ' - ' + parts.join('; ') : '';
      } else {
        body.status_line = '';
      }
      allowed.push('status_badge', 'status_line');
    }
    const sets = [], vals = [];
    for (const k of allowed) if (k in body) { vals.push(body[k]); sets.push(`${k} = $${vals.length}`); }
    if (!sets.length) return res.status(400).json({ error: 'no editable fields supplied' });
    vals.push(req.params.id);
    const rows = await query(
      `UPDATE effortless_loops SET ${sets.join(', ')} WHERE effortless_loop_id = $${vals.length} RETURNING effortless_loop_id`,
      vals,
    );
    if (!rows.length) return res.status(404).json({ error: 'not_found', id: req.params.id });
    res.json({ ok: true, id: rows[0].effortless_loop_id });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

// POST /api/effortless-loops/regenerate-plan — `effortless build` regenerates the
// derived plan from the rulebook hub. Guarded against concurrent runs.
let regenInFlight = false;
router.post('/regenerate-plan', (_req, res) => {
  if (regenInFlight) return res.status(409).json({ error: 'a regenerate is already running' });
  regenInFlight = true;
  exec('effortless build', { cwd: PROJECT_ROOT, timeout: 180000, maxBuffer: 8 * 1024 * 1024 }, (err, stdout, stderr) => {
    regenInFlight = false;
    const tail = (s) => String(s || '').split('\n').slice(-12).join('\n');
    if (err) return res.status(500).json({ ok: false, error: String(err), stderr: tail(stderr), stdout: tail(stdout) });
    res.json({ ok: true, stdout: tail(stdout) });
  });
});
