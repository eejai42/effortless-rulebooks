import express from 'express';
import pg from 'pg';

const { Pool } = pg;

// Database default is derived from the SSoT: project slug naive-set-theory -> erb_naive_set_theory.
const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'erb_naive_set_theory',
  port: Number(process.env.PGPORT || 5432),
});

const app = express();
const VIEW_NAME = /^vw_[a-z0-9_]+$/;

// The view IS the contract: the app reads ONLY vw_* views. If there are none,
// the rulebook-to-postgres build has not been loaded into this database.
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
        error: `No vw_* views found in database ${pool.options.database}. Run ./init-db.sh to load postgres/*.sql.`,
      });
    }
    res.json(rows.map(r => r.table_name));
  } catch (e) {
    res.status(500).json({ error: `database ${pool.options.database} unreachable: ${e.message}` });
  }
});

app.get('/api/views/:name', async (req, res) => {
  const { name } = req.params;
  if (!VIEW_NAME.test(name)) {
    return res.status(400).json({ error: `invalid view name "${name}"; expected ^vw_[a-z0-9_]+$` });
  }
  try {
    const { rows, fields } = await pool.query(`SELECT * FROM "${name}"`);
    res.json({ columns: fields.map(f => f.name), rows });
  } catch (e) {
    res.status(500).json({ error: `SELECT * FROM "${name}" failed: ${e.message}` });
  }
});

// Domain route: one membership fact with its fixed-point evaluation steps.
app.get('/api/membership-facts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const fact = await pool.query('SELECT * FROM vw_membership_facts WHERE membership_fact_id = $1', [id]);
    if (fact.rows.length === 0) {
      return res.status(404).json({ error: `no row in vw_membership_facts with membership_fact_id = ${id}` });
    }
    const steps = await pool.query(
      'SELECT * FROM vw_evaluation_steps WHERE membership_fact = $1 ORDER BY step_order',
      [id]
    );
    res.json({ fact: fact.rows[0], steps: steps.rows });
  } catch (e) {
    res.status(500).json({ error: `vw_membership_facts / vw_evaluation_steps query failed: ${e.message}` });
  }
});

const PORT = Number(process.env.PORT || 43302);
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT} (database ${pool.options.database})`);
});
