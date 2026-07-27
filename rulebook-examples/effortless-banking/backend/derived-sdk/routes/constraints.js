import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM vw_constraints ORDER BY name ASC');
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM vw_constraints WHERE constraint_id = $1', [req.params.id]);
    r.rows.length ? res.json(r.rows[0]) : res.sendStatus(404);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { constraint_key, entity, predicate, deontic, severity, message, rule_group, source_citation, rule_speak_override, is_active } = req.body;
    const r = await pool.query(
      'INSERT INTO constraints (constraint_key, entity, predicate, deontic, severity, message, rule_group, source_citation, rule_speak_override, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [constraint_key, entity, predicate, deontic, severity, message, rule_group, source_citation, rule_speak_override, is_active]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { constraint_key, entity, predicate, deontic, severity, message, rule_group, source_citation, rule_speak_override, is_active } = req.body;
    const r = await pool.query(
      'UPDATE constraints SET constraint_key = $1, entity = $2, predicate = $3, deontic = $4, severity = $5, message = $6, rule_group = $7, source_citation = $8, rule_speak_override = $9, is_active = $10 WHERE constraint_id = $11 RETURNING *',
      [constraint_key, entity, predicate, deontic, severity, message, rule_group, source_citation, rule_speak_override, is_active, req.params.id]
    );
    r.rows.length ? res.json(r.rows[0]) : res.sendStatus(404);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM constraints WHERE constraint_id = $1', [req.params.id]);
    res.sendStatus(204);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
