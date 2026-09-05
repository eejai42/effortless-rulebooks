import express from 'express';
import pg from 'pg';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const { Pool } = pg;

// Deterministic default derived from the SSoT: the project slug
// `ross-style-business-rules` → database `erb_ross_style_business_rules`.
// Env vars only override it.
const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'erb_ross_style_business_rules',
  port: Number(process.env.PGPORT || 5432),
});

const here = path.dirname(fileURLToPath(import.meta.url));
const HUB = path.resolve(here, '..', 'effortless-rulebook', 'ross-style-business-rules-rulebook.json');

const app = express();

// The view IS the contract: the app reads only vw_* views. If none exist the
// rulebook-to-postgres artifacts have not been loaded — fail loudly.
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
        error: `No vw_* views found in database ${pool.options.database}. Load postgres/*.sql via ./init-db.sh first.`,
      });
    }
    res.json(rows.map((r) => r.table_name));
  } catch (e) {
    res.status(500).json({ error: `database ${pool.options.database}: ${e.message}` });
  }
});

app.get('/api/views/:name', async (req, res) => {
  const { name } = req.params;
  if (!/^vw_[a-z0-9_]+$/.test(name)) {
    return res.status(400).json({ error: `invalid view name "${name}" — expected ^vw_[a-z0-9_]+$` });
  }
  try {
    const { rows, fields } = await pool.query(`SELECT * FROM "${name}"`);
    res.json({ columns: fields.map((f) => f.name), rows });
  } catch (e) {
    res.status(500).json({ error: `SELECT * FROM "${name}" failed: ${e.message}` });
  }
});

// One claim by PK, from the view (no recomputation in app code).
app.get('/api/claims/:claimId', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM vw_claims WHERE claim_id = $1', [req.params.claimId]);
    if (rows.length === 0) return res.status(404).json({ error: `no row in vw_claims with claim_id = ${req.params.claimId}` });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: `SELECT * FROM vw_claims WHERE claim_id = $1 failed: ${e.message}` });
  }
});

// Rule statements: the schema `Description` of every Claims field in the hub.
// This is metadata about the rules (the RuleSpeak wording), not a derived
// value, so reading the rulebook file for it is fine. Column names are the
// snake_case form the generated view uses.
const toColumn = (fieldName) => fieldName.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();

app.get('/api/rules', async (_req, res) => {
  try {
    const hub = JSON.parse(await readFile(HUB, 'utf8'));
    const table = hub.Claims;
    if (!table || !Array.isArray(table.schema)) {
      return res.status(500).json({ error: `hub ${HUB} has no Claims.schema array` });
    }
    res.json(
      table.schema.map((f) => ({
        name: f.name,
        column: toColumn(f.name),
        type: f.type,
        datatype: f.datatype,
        description: f.Description || '',
        formula: f.formula || null,
      }))
    );
  } catch (e) {
    res.status(500).json({ error: `reading hub ${HUB} failed: ${e.message}` });
  }
});

const PORT = Number(process.env.PORT || 43304);
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT} (database ${pool.options.database})`);
});
