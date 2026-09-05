import express from 'express';
import pg from 'pg';

const { Pool } = pg;

// The default database name is derived from the project slug (the SSoT), so it
// is a deterministic default, not a fallback. Env vars only override it.
const DATABASE = process.env.PGDATABASE || 'erb_is_everything_a_language';

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: DATABASE,
  port: Number(process.env.PGPORT || 5432),
});

const app = express();

const VIEW_NAME = /^vw_[a-z0-9_]+$/;

// Sorted list of vw_* views. The app reads ONLY views (they carry the
// calculated/lookup columns). No views == the postgres build never loaded.
app.get('/api/views', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'public' AND table_name LIKE 'vw\\_%'
      ORDER BY table_name
    `);
    if (rows.length === 0) {
      return res.status(500).json({
        error: `No vw_* views found in database ${DATABASE}. Expected vw_language_candidates and vw_is_everything_a_language from the rulebook-to-postgres build.`,
      });
    }
    res.json(rows.map(r => r.table_name));
  } catch (e) {
    res.status(500).json({ error: `database ${DATABASE}: ${e.message}` });
  }
});

// Every row of one view, exactly as the view computes it.
app.get('/api/views/:name', async (req, res) => {
  const { name } = req.params;
  if (!VIEW_NAME.test(name)) {
    return res.status(400).json({ error: `invalid view name "${name}"; expected ^vw_[a-z0-9_]+$` });
  }
  try {
    const { rows, fields } = await pool.query(`SELECT * FROM "${name}"`);
    res.json({ columns: fields.map(f => f.name), rows });
  } catch (e) {
    res.status(500).json({ error: `SELECT * FROM "${name}" in database ${DATABASE}: ${e.message}` });
  }
});

// One language candidate by primary key.
app.get('/api/candidates/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM "vw_language_candidates" WHERE language_candidate_id = $1',
      [req.params.id],
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: `no row in vw_language_candidates with language_candidate_id = ${req.params.id}` });
    }
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: `vw_language_candidates in database ${DATABASE}: ${e.message}` });
  }
});

const PORT = Number(process.env.PORT || 43301);
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT} (database ${DATABASE})`);
});
