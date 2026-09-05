// API for the veritasium-power-laws-and-fractals app.
//
// The view IS the contract: every route reads a vw_* view emitted by
// rulebook-to-postgres. Nothing here recomputes a derived value. Failures are
// returned as 500 with the exact thing that was expected; there are no
// fallbacks to base tables or empty lists.
import express from 'express';
import pg from 'pg';

const { Pool } = pg;

// The default database name is derived from the project slug (the SSoT), so it
// is a deterministic default, not a fallback. The env vars only override it.
const DATABASE = process.env.PGDATABASE || 'erb_veritasium_power_laws_and_fractals';

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: DATABASE,
  port: Number(process.env.PGPORT || 5432),
});

const app = express();

const VIEW_NAME = /^vw_[a-z0-9_]+$/;

function fail(res, e, expected) {
  res.status(500).json({ error: `${expected}: ${e.message}` });
}

async function selectView(sql, params = []) {
  const { rows, fields } = await pool.query(sql, params);
  return { columns: fields.map((f) => f.name), rows };
}

// Sorted list of vw_* views in the database. 500 if there are none.
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
        error: `expected vw_* views in database ${DATABASE}; found none (rulebook-to-postgres output has not been loaded)`,
      });
    }
    res.json(rows.map((r) => r.table_name));
  } catch (e) {
    fail(res, e, `expected to list vw_* views in database ${DATABASE}`);
  }
});

// Every column and row of one view.
app.get('/api/views/:name', async (req, res) => {
  const { name } = req.params;
  if (!VIEW_NAME.test(name)) {
    return res.status(400).json({ error: `invalid view name "${name}"; expected ^vw_[a-z0-9_]+$` });
  }
  try {
    res.json(await selectView(`SELECT * FROM "${name}"`));
  } catch (e) {
    fail(res, e, `expected SELECT * FROM ${name} in database ${DATABASE} to succeed`);
  }
});

// Domain routes. Each one is a single view, optionally filtered by a PK/FK.

app.get('/api/systems', async (_req, res) => {
  try {
    res.json(await selectView('SELECT * FROM vw_systems ORDER BY system_id'));
  } catch (e) {
    fail(res, e, `expected vw_systems in database ${DATABASE}`);
  }
});

app.get('/api/system-stats', async (_req, res) => {
  try {
    res.json(await selectView('SELECT * FROM vw_system_stats ORDER BY system_stats_id'));
  } catch (e) {
    fail(res, e, `expected vw_system_stats in database ${DATABASE}`);
  }
});

app.get('/api/systems/:id/scales', async (req, res) => {
  try {
    res.json(await selectView(
      'SELECT * FROM vw_scales WHERE system = $1 ORDER BY iteration',
      [req.params.id],
    ));
  } catch (e) {
    fail(res, e, `expected vw_scales rows for system ${req.params.id} in database ${DATABASE}`);
  }
});

app.get('/api/systems/:id/observed-scales', async (req, res) => {
  try {
    res.json(await selectView(
      'SELECT * FROM vw_observed_scales WHERE system = $1 ORDER BY iteration',
      [req.params.id],
    ));
  } catch (e) {
    fail(res, e, `expected vw_observed_scales rows for system ${req.params.id} in database ${DATABASE}`);
  }
});

const PORT = Number(process.env.PORT || 43305);
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT} (database ${DATABASE})`);
});
