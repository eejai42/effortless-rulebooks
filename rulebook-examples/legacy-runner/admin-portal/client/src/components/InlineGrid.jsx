import { useState } from "react";

// Generic inline-editable grid. cols = [{key, label, type?, options?}]
// rows = array of objects. onSave(rowIndex, key, value) => Promise
// onDelete(rowIndex) => Promise. onAdd(newRow) => Promise.
export default function InlineGrid({ cols, rows, onSave, onDelete, onAdd, addDefaults = {} }) {
  const [editing, setEditing] = useState(null); // { row, col }
  const [draft, setDraft]     = useState("");
  const [adding, setAdding]   = useState(false);
  const [newRow, setNewRow]   = useState(addDefaults);
  const [busy, setBusy]       = useState(false);

  const startEdit = (ri, col, currentVal) => {
    setEditing({ row: ri, col: col.key });
    setDraft(currentVal ?? "");
  };

  const commitEdit = async () => {
    if (!editing) return;
    try {
      setBusy(true);
      await onSave?.(editing.row, editing.col, draft);
    } finally {
      setBusy(false);
      setEditing(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") setEditing(null);
  };

  const doAdd = async () => {
    try {
      setBusy(true);
      await onAdd?.(newRow);
      setNewRow(addDefaults);
      setAdding(false);
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async (ri) => {
    if (!confirm("Delete this row?")) return;
    try {
      setBusy(true);
      await onDelete?.(ri);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="inline-grid-wrap">
      <table className="grid">
        <thead>
          <tr>
            {cols.map((c) => <th key={c.key}>{c.label}</th>)}
            {(onDelete || onSave) && <th style={{ width: 60 }}></th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {cols.map((col) => {
                const isEditing = editing?.row === ri && editing?.col === col.key;
                const val = row[col.key];
                return (
                  <td key={col.key}
                      onClick={() => !col.readOnly && onSave && startEdit(ri, col, val)}
                      style={{ cursor: col.readOnly || !onSave ? "default" : "pointer" }}
                      title={col.readOnly ? "" : "Click to edit"}>
                    {isEditing ? (
                      col.options ? (
                        <select value={draft} autoFocus
                          onChange={(e) => setDraft(e.target.value)}
                          onBlur={commitEdit}
                          onKeyDown={handleKeyDown}>
                          {col.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      ) : (
                        <input value={draft} autoFocus disabled={busy}
                          onChange={(e) => setDraft(e.target.value)}
                          onBlur={commitEdit}
                          onKeyDown={handleKeyDown}
                          style={{ width: "100%" }} />
                      )
                    ) : (
                      col.render ? col.render(val, row) : formatCell(val)
                    )}
                  </td>
                );
              })}
              {(onDelete || onSave) && (
                <td>
                  {onDelete && (
                    <button className="btn-icon danger" onClick={() => doDelete(ri)} disabled={busy} title="Delete">✕</button>
                  )}
                </td>
              )}
            </tr>
          ))}
          {adding && (
            <tr className="add-row">
              {cols.map((col) => (
                <td key={col.key}>
                  {col.readOnly ? null : col.options ? (
                    <select value={newRow[col.key] ?? ""}
                      onChange={(e) => setNewRow({ ...newRow, [col.key]: e.target.value })}>
                      {col.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <input value={newRow[col.key] ?? ""}
                      onChange={(e) => setNewRow({ ...newRow, [col.key]: e.target.value })}
                      placeholder={col.label} />
                  )}
                </td>
              ))}
              <td>
                <button className="btn" onClick={doAdd} disabled={busy}>✓</button>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {onAdd && (
        <div style={{ marginTop: 10 }}>
          {adding
            ? <button className="btn secondary" onClick={() => setAdding(false)}>Cancel</button>
            : <button className="btn secondary" onClick={() => setAdding(true)}>+ Add row</button>}
        </div>
      )}
    </div>
  );
}

function formatCell(v) {
  if (v === null || v === undefined) return <span className="muted">—</span>;
  if (typeof v === "boolean") return v ? "✓" : "✗";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
