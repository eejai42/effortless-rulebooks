// Every read goes through the generated, view-backed API (GET /api/tables/:table),
// which serves vw_<table> rows. Calculated columns are rendered, never recomputed.

const cache = new Map();

export class ApiError extends Error {
  constructor(message, { status, table } = {}) {
    super(message);
    this.status = status;
    this.table = table;
  }
}

export async function fetchTable(table) {
  if (cache.has(table)) return cache.get(table);
  const promise = (async () => {
    const response = await fetch(`/api/tables/${table}`);
    if (!response.ok) {
      cache.delete(table);
      throw new ApiError(`GET /api/tables/${table} failed with HTTP ${response.status}`, {
        status: response.status,
        table,
      });
    }
    const body = await response.json();
    if (!Array.isArray(body.rows) || !Array.isArray(body.fields) || !body.pkField) {
      cache.delete(table);
      throw new ApiError(`GET /api/tables/${table} returned an unexpected shape (expected fields[], pkField, rows[])`, { table });
    }
    return body;
  })();
  cache.set(table, promise);
  return promise;
}

export async function fetchRows(table) {
  return (await fetchTable(table)).rows;
}

export async function fetchOne(table, pkColumn, value) {
  const rows = await fetchRows(table);
  const matches = rows.filter((row) => String(row[pkColumn]) === String(value));
  if (matches.length !== 1) {
    throw new ApiError(
      `${table}: expected exactly one row with ${pkColumn} = ${JSON.stringify(value)}, found ${matches.length}`,
      { table },
    );
  }
  return matches[0];
}

export async function fetchDocs() {
  const response = await fetch("/api/docs");
  if (!response.ok) throw new ApiError(`GET /api/docs failed with HTTP ${response.status}`, { status: response.status });
  return response.json();
}

export async function fetchViewHealth() {
  const response = await fetch("/api/view-health");
  if (!response.ok) throw new ApiError(`GET /api/view-health failed with HTTP ${response.status}`, { status: response.status });
  return response.json();
}

// Ask the explorer's own dev server to probe a modeled localhost URL.
export async function probe(url) {
  const response = await fetch(`/__probe?url=${encodeURIComponent(url)}`);
  const body = await response.json();
  if (!response.ok) throw new ApiError(body.error || `probe failed with HTTP ${response.status}`, { status: response.status });
  return body;
}

// Postgres numerics arrive as strings; coerce only for display.
export function num(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

// Reverse-relationship columns arrive as "id-a, id-b" strings.
export function idList(value) {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
