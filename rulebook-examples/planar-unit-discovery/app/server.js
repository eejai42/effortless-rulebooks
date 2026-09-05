import express from 'express';
import pg from 'pg';

const { Pool } = pg;

// The database name is derived from the project slug (planar-unit-discovery),
// so this default is the deterministically-correct value; env vars only override.
const DATABASE = process.env.PGDATABASE || 'erb_planar_unit_discovery';

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: DATABASE,
  port: Number(process.env.PGPORT || 5432),
});

const app = express();

const VIEW_NAME = /^vw_[a-z0-9_]+$/;

// The view IS the contract: this app reads vw_* views only. Every column a
// screen shows is a column the rulebook-to-postgres transpiler emitted; nothing
// is recomputed here. If the database or a view is unavailable, the failure is
// returned as a 500 naming exactly what was expected.
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
        error: `No vw_* views found in database ${DATABASE}; expected the rulebook-to-postgres output (postgres/03-create-views.sql) to be loaded.`,
      });
    }
    res.json(rows.map((r) => r.table_name));
  } catch (e) {
    res.status(500).json({ error: `database ${DATABASE} unavailable: ${e.message}` });
  }
});

async function selectView(name, where, params) {
  const sql = `SELECT * FROM "${name}"${where ? ` WHERE ${where}` : ''}`;
  const { rows, fields } = await pool.query(sql, params);
  return { columns: fields.map((f) => f.name), rows };
}

function viewError(res, name, e) {
  res.status(500).json({
    error: `view ${name} in database ${DATABASE} failed: ${e.message}`,
    detail: e.internalQuery || e.where || null,
  });
}

app.get('/api/views/:name', async (req, res) => {
  const { name } = req.params;
  if (!VIEW_NAME.test(name)) {
    return res.status(400).json({ error: `invalid view name "${name}"; expected ^vw_[a-z0-9_]+$` });
  }
  try {
    res.json(await selectView(name));
  } catch (e) {
    viewError(res, name, e);
  }
});

// Domain routes: one view filtered by a PK / FK, always parameterised.
const FILTERS = {
  'construction-instances-by-family': ['vw_construction_instances', 'construction_family'],
  'prime-ideals-by-number-field': ['vw_prime_ideals', 'number_field'],
  'short-vectors-by-lattice': ['vw_short_vectors', 'minkowski_lattice'],
  'planar-projections-by-lattice': ['vw_planar_projections', 'source_lattice'],
  'projected-short-vectors-by-projection': ['vw_projected_short_vectors', 'planar_projection'],
  'proof-obligations-by-bound': ['vw_proof_obligations', 'parent_bound'],
  'citation-links-by-citing-source': ['vw_citation_links', 'citing_source'],
};

app.get('/api/domain/:filter/:id', async (req, res) => {
  const spec = FILTERS[req.params.filter];
  if (!spec) {
    return res.status(400).json({ error: `unknown domain filter "${req.params.filter}"; expected one of ${Object.keys(FILTERS).join(', ')}` });
  }
  const [view, column] = spec;
  try {
    res.json(await selectView(view, `"${column}" = $1`, [req.params.id]));
  } catch (e) {
    viewError(res, view, e);
  }
});

const PORT = Number(process.env.PORT || 43303);
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT} (database ${DATABASE})`);
});
