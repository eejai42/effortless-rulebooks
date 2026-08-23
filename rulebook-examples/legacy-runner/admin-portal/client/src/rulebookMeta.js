// Project-level metadata for a rulebook now lives in a `__meta__` table with
// a typed-row schema:
//   { MetaKey, Name, ValueType: 'string'|'object'|'array', StringValue, JsonValue }
// `metaAsObject(rb)` projects that table back to the flat {key: value}
// dictionary the rest of the UI was built around, so call sites can keep
// reading `meta.tagline`, `meta.use_cases`, `meta.substrates`, etc.
export const META_TABLE_NAME = "__meta__";

export function metaAsObject(rb) {
  const tbl = rb && rb[META_TABLE_NAME];
  if (!tbl || !Array.isArray(tbl.data)) return {};
  const out = {};
  for (const row of tbl.data) {
    if (!row || typeof row !== "object") continue;
    const key = row.MetaKey;
    if (typeof key !== "string" || !key) continue;
    if (row.ValueType === "string") {
      out[key] = row.StringValue == null ? "" : row.StringValue;
    } else if (row.ValueType === "object" || row.ValueType === "array") {
      if (typeof row.JsonValue === "string" && row.JsonValue.length) {
        try { out[key] = JSON.parse(row.JsonValue); }
        catch (e) { /* leave undefined — bad JSON in storage is loud at write time */ }
      }
    }
  }
  return out;
}
