import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import RichText, { RichInline } from "./RichText.jsx";
import { makeDomainApi } from "../lib/api.js";
import { toast } from "../lib/toast.js";

// Inline editor for a *_rich text field inside the active rulebook.
//
// Reads `text` for the rendered view; on edit, shows a textarea. Save calls
// PATCH /api/rulebook/text with { path, value }. On 200, calls `onSaved(value)`
// so the parent screen can update its in-memory copy of the rulebook (or
// trigger a portal reload).
//
// `inline` toggles between block (paragraph) and inline (span) rendering so
// the same component works for description_rich AND single-line tagline-style
// fields.

export default function EditableRich({
  text,
  path,
  onSaved,
  canEdit = true,
  inline = false,
  placeholder = "— not authored yet —",
  className = "",
}) {
  const { domain } = useParams();
  const api = useMemo(() => makeDomainApi(domain), [domain]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text || "");
  const [busy, setBusy] = useState(false);

  const startEdit = () => {
    setDraft(text || "");
    setEditing(true);
  };

  const save = async () => {
    setBusy(true);
    try {
      const r = await api.patch("/api/rulebook/text", { path, value: draft });
      if (r?.ok) {
        toast("Saved", "ok");
        if (onSaved) onSaved(draft, r.rulebook);
        setEditing(false);
      } else {
        toast("Save failed: " + (r?.error || "unknown"), "error");
      }
    } catch (e) {
      toast("Save failed: " + e.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const cancel = () => {
    setDraft(text || "");
    setEditing(false);
  };

  if (editing) {
    return (
      <div className={`editable-rich editing ${className}`}>
        <textarea
          className="editable-rich-textarea"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
          rows={inline ? 2 : 6}
        />
        <div className="editable-rich-actions">
          <button className="btn btn-sm" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</button>
          <button className="btn btn-sm btn-ghost" onClick={cancel} disabled={busy}>Cancel</button>
          <span className="muted small editable-rich-hint">
            <code>**bold**</code> · <code>*italic*</code> · <code>`code`</code>
          </span>
        </div>
      </div>
    );
  }

  const empty = !text || !text.trim();
  const view = inline ? <RichInline text={text} /> : <RichText text={text} />;
  return (
    <span className={`editable-rich ${inline ? "inline" : "block"} ${empty ? "empty" : ""} ${className}`}>
      {empty ? <span className="muted">{placeholder}</span> : view}
      {canEdit && (
        <button
          className="editable-rich-pencil"
          onClick={startEdit}
          title="Edit"
          aria-label="Edit"
        >
          ✎
        </button>
      )}
    </span>
  );
}
