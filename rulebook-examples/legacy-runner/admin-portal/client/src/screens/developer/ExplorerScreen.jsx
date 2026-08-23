// Effortless Explorer  (DOMAIN_UX_VISION.md §2)
// =============================================================================
// Left rail: DAG-shaped tree from /api/explorer/tree (top-level entities,
// each expandable to its child entities via inbound FKs).
// Right pane: /api/explorer/node — list view (odd-length path) or instance
// view (even-length path). Schema rides in the same payload as data so the
// column headers ARE the schema (hover for type/formula/description).
// URL encoding is §2.6: /<Entity>/<Name>/<ChildEntity>/<Name>... where the
// "id" segments are the entity's Name field (ERB closed-platform convention).

import { Fragment, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { makeDomainApi } from "../../lib/api.js";
import { toast } from "../../lib/toast.js";
import ScreenHeader from "../../components/ScreenHeader.jsx";

function parsePathSegments(wildcard) {
  if (!wildcard) return [];
  return wildcard.split("/").filter(Boolean).map(decodeURIComponent);
}

function encodePathSegments(segments) {
  return segments.map(encodeURIComponent).join("/");
}

function formatCell(v) {
  if (v === null || v === undefined || v === "") return <span className="muted">∅</span>;
  if (typeof v === "boolean") return v ? "✓" : "✗";
  if (typeof v === "object") return <span className="mono small">{JSON.stringify(v)}</span>;
  return String(v);
}

// Every sub-component in this screen needs a domain-scoped api. They're all
// rendered inside the developer/:domain route, so useParams() resolves the
// active slug. Keeps the api wiring colocated with the component instead of
// threading an `api` prop through every render site.
function useExplorerApi() {
  const { domain } = useParams();
  return useMemo(() => makeDomainApi(domain), [domain]);
}

export default function ExplorerScreen({ screen, me }) {
  const navigate = useNavigate();
  const params   = useParams();
  const { domain } = params;
  const wildcard = params["*"] || "";
  const pathSegments = useMemo(() => parsePathSegments(wildcard), [wildcard]);
  const canEdit = !!me?.role?.CanEditRulebook;
  const api = useMemo(() => makeDomainApi(domain), [domain]);

  const [tree, setTree]         = useState(null);
  const [node, setNode]         = useState(null);
  const [nodeError, setNodeError] = useState(null);
  const [nodeLoading, setNodeLoading] = useState(false);
  const [page, setPage]         = useState(0);
  const [treeError, setTreeError] = useState(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [rebuildId, setRebuildId] = useState(null);
  const refreshNode = () => setRefreshTick((t) => t + 1);
  const refreshAll = () => {
    setRefreshTick((t) => t + 1);
    api.get(`/api/explorer/tree?domain=${encodeURIComponent(domain)}&maxDepth=1`)
      .then(setTree).catch(() => {});
  };

  const triggerRebuild = async () => {
    try {
      const r = await api.post("/api/explorer/rebuild");
      setRebuildId(r.rebuildId);
    } catch (e) {
      toast(`Rebuild failed to start: ${e.message}`, "error");
    }
  };

  // Load tree on domain change
  useEffect(() => {
    setTree(null);
    setTreeError(null);
    api.get(`/api/explorer/tree?domain=${encodeURIComponent(domain)}&maxDepth=1`)
      .then(setTree)
      .catch((e) => { setTreeError(e.message); toast(e.message, "error"); });
  }, [domain]);

  // Load node on path change. Reset paging when path changes.
  useEffect(() => {
    setPage(0);
  }, [wildcard]);

  useEffect(() => {
    setNode(null);
    setNodeError(null);
    if (pathSegments.length === 0) return;
    setNodeLoading(true);
    const qs = new URLSearchParams({
      domain,
      path: pathSegments.map(encodeURIComponent).join("/"),
      page: String(page),
      pageSize: "50",
    });
    api.get(`/api/explorer/node?${qs.toString()}`)
      .then((r) => { setNode(r); })
      .catch((e) => { setNodeError(e.message); })
      .finally(() => setNodeLoading(false));
  }, [wildcard, page, domain, refreshTick]); // eslint-disable-line react-hooks/exhaustive-deps

  const goTo = (segments) => {
    const tail = encodePathSegments(segments);
    navigate(tail ? `/developer/${domain}/explorer/${tail}` : `/developer/${domain}/explorer`);
  };

  return (
    <>
      <ScreenHeader screen={screen} />
      <div className="story-banner" style={{ borderLeftColor: "#6ea8fe" }}>
        Walk the DAG for <b>{domain}</b>. Click an entity to list its rows; click a
        row to see its instance + children.
      </div>

      {treeError && (
        <div className="story-banner" style={{ borderLeftColor: "var(--bad)" }}>
          {treeError}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Breadcrumbs domain={domain} segments={pathSegments} onCrumb={goTo} />
        </div>
        {canEdit && (
          <button
            className="btn secondary"
            onClick={triggerRebuild}
            title="Run 'effortless build' and tail the output"
            style={{ whiteSpace: "nowrap" }}
          >
            ↻ Rebuild
          </button>
        )}
      </div>

      {rebuildId && (
        <RebuildOverlay
          rebuildId={rebuildId}
          domain={domain}
          canEdit={canEdit}
          onClose={() => setRebuildId(null)}
          onSuccess={() => { setRebuildId(null); refreshAll(); }}
          onReverted={() => { setRebuildId(null); refreshAll(); }}
        />
      )}

      <div className="split">
        <div className="list-panel">
          {!tree && !treeError && <div className="muted small">Loading tree…</div>}
          {tree && tree.topLevel.length === 0 && (
            <div className="muted small">No entities in this rulebook.</div>
          )}
          {tree && tree.topLevel.map((n) => (
            <InstanceTreeNode
              key={n.entity + "@" + refreshTick}
              domain={domain}
              path={[n.entity]}
              kind="entity"
              label={n.entity}
              meta={`${n.rowCount} ${n.rowCount === 1 ? "row" : "rows"}`}
              important={n.important}
              currentUrlPath={pathSegments}
              onNavigate={goTo}
              depth={0}
            />
          ))}
          {canEdit && tree && (
            <NewEntityButton
              onCreated={(rebuildId) => setRebuildId(rebuildId)}
            />
          )}
        </div>

        <div className="detail-panel">
          <RightPane
            domain={domain}
            pathSegments={pathSegments}
            node={node}
            nodeError={nodeError}
            nodeLoading={nodeLoading}
            page={page}
            setPage={setPage}
            goTo={goTo}
            canEdit={canEdit}
            refreshNode={refreshNode}
            startRebuild={(id) => setRebuildId(id)}
            rulebookRevision={tree?.rulebookRevision || null}
          />
        </div>
      </div>
    </>
  );
}

function Breadcrumbs({ domain, segments, onCrumb }) {
  if (segments.length === 0) return null;
  return (
    <div className="muted small" style={{ marginTop: 8, marginBottom: 8 }}>
      <span className="clickable" onClick={() => onCrumb([])}>/explorer</span>
      {segments.map((s, i) => (
        <span key={i}>
          {" / "}
          <span
            className={i % 2 === 0 ? "mono clickable" : "clickable"}
            onClick={() => onCrumb(segments.slice(0, i + 1))}
          >
            {s}
          </span>
        </span>
      ))}
    </div>
  );
}

// =============================================================================
// InstanceTreeNode  (DOMAIN_UX_VISION.md §2.1)
// =============================================================================
// Recursive lazy-loading tree node. Each node knows its own URL path. Three
// kinds drive a single alternation:
//
//   entity      (e.g. /Customers)            expand → fetch /node → rows
//                                                                   become instance children
//   instance    (e.g. /Customers/jane-smith) expand → fetch /node → tabs
//                                                                   become collection children
//   collection  (e.g. .../jane/Orders)        expand → fetch /node → rows
//                                                                   become instance children
//
// Auto-expands itself when the current URL path extends this node's path,
// so deep-links round-trip: paste /explorer/Customers/jane/Orders/1042 and
// the tree walks itself open along the way.

function InstanceTreeNode({ domain, path, kind, label, meta, important, currentUrlPath, onNavigate, depth }) {
  const api = useExplorerApi();
  const pathKey = path.join("/");
  const isOnUrlPath =
    path.length <= currentUrlPath.length &&
    path.every((seg, i) => String(seg) === String(currentUrlPath[i]));
  const isSelected = isOnUrlPath && path.length === currentUrlPath.length;
  const shouldAutoExpand = isOnUrlPath && path.length < currentUrlPath.length;

  const [expanded, setExpanded] = useState(shouldAutoExpand);
  const [children, setChildren] = useState(null);   // null = not yet fetched
  const [loading, setLoading]   = useState(false);
  const [err, setErr]           = useState(null);

  // Re-auto-expand when the URL changes to extend this node's path.
  useEffect(() => {
    if (shouldAutoExpand && !expanded) setExpanded(true);
  }, [currentUrlPath.join("/")]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lazy-load children when expanded and we don't have them yet.
  useEffect(() => {
    if (!expanded || children !== null || loading) return;
    setLoading(true);
    const qs = new URLSearchParams({
      domain,
      path: path.map(encodeURIComponent).join("/"),
      pageSize: "500",
    });
    api.get(`/api/explorer/node?${qs.toString()}`)
      .then((r) => {
        if (r.kind === "list") {
          // Rows → instance children. Use Name as the URL id per §2.6;
          // skip rows missing Name (they can't round-trip through the URL)
          // and render a placeholder so the user sees the gap loudly.
          const kids = (r.rows || []).map((row, i) => {
            const name = row.Name;
            if (!name) {
              return {
                path: path,                   // can't extend; renders disabled
                kind: "instance",
                label: `(row ${i} — missing Name)`,
                disabled: true,
              };
            }
            return {
              path: [...path, String(name)],
              kind: "instance",
              label: String(name),
            };
          });
          setChildren(kids);
        } else if (r.kind === "instance") {
          // Tabs → collection children, each pointing at a child entity
          // scoped under this instance.
          const kids = (r.tabs || []).map((t, i) => ({
            path: [...path, t.entity],
            kind: "collection",
            label: t.entity,
            meta: `via ${t.viaFk} · ${t.rowCount} ${t.rowCount === 1 ? "row" : "rows"}`,
            viaFk: t.viaFk,
          }));
          setChildren(kids);
        } else {
          setChildren([]);
        }
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [expanded]); // eslint-disable-line react-hooks/exhaustive-deps

  const canExpand = !path[0]?.disabled; // top-level always expandable; child .disabled marker blocks
  const expandSymbol = loading ? "…" : (expanded ? "▾" : "▸");

  // Visual differentiation by kind. Entity rows (top-level) are bold; instance
  // rows use a colored ID-style label; collection rows are muted mono.
  const labelEl = (() => {
    if (kind === "entity") {
      return (
        <span className="name">
          {important && <span style={{ color: "var(--warn)", marginRight: 4 }}>★</span>}
          {label}
        </span>
      );
    }
    if (kind === "instance") {
      return (
        <span className="name mono" style={{ color: isSelected ? "var(--accent)" : undefined }}>
          {label}
        </span>
      );
    }
    // collection
    return (
      <span className="name mono" style={{ fontSize: 12, color: "var(--muted)" }}>
        {label}
      </span>
    );
  })();

  return (
    <div>
      <div
        className={`list-item ${isSelected ? "active" : ""}`}
        onClick={() => onNavigate(path)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          paddingLeft: depth > 0 ? 4 + depth * 12 : undefined,
        }}
      >
        <span
          onClick={(e) => { e.stopPropagation(); if (canExpand) setExpanded((v) => !v); }}
          style={{
            width: 14, textAlign: "center",
            cursor: canExpand ? "pointer" : "default",
            opacity: canExpand ? 1 : 0.25, userSelect: "none",
          }}
          title={expanded ? "Collapse" : "Expand"}
        >
          {expandSymbol}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          {labelEl}
          {meta && <div className="meta">{meta}</div>}
        </div>
      </div>

      {expanded && (
        <div>
          {err && (
            <div className="muted small" style={{ paddingLeft: 16 + depth * 12, color: "var(--bad)" }}>
              {err}
            </div>
          )}
          {!err && children && children.length === 0 && (
            <div className="muted small" style={{ paddingLeft: 16 + depth * 12 }}>
              (empty)
            </div>
          )}
          {!err && children && children.map((c, i) => (
            c.disabled ? (
              <div
                key={i}
                className="list-item muted small"
                style={{ paddingLeft: 4 + (depth + 1) * 12, opacity: 0.6 }}
              >
                · {c.label}
              </div>
            ) : (
              <InstanceTreeNode
                key={c.path.join("/")}
                domain={domain}
                path={c.path}
                kind={c.kind}
                label={c.label}
                meta={c.meta}
                currentUrlPath={currentUrlPath}
                onNavigate={onNavigate}
                depth={depth + 1}
              />
            )
          ))}
        </div>
      )}
    </div>
  );
}

function RightPane({ domain, pathSegments, node, nodeError, nodeLoading, page, setPage, goTo, canEdit, refreshNode, startRebuild, rulebookRevision }) {
  if (pathSegments.length === 0) {
    return (
      <div className="muted">
        <p>Select an entity from the left to start walking the DAG.</p>
        {rulebookRevision && (
          <p className="small">
            Rulebook revision: <span className="mono">{rulebookRevision}</span>
          </p>
        )}
      </div>
    );
  }
  if (nodeError) {
    return (
      <div className="story-banner" style={{ borderLeftColor: "var(--bad)" }}>
        {nodeError}
      </div>
    );
  }
  if (nodeLoading || !node) {
    return <div className="muted small">Loading…</div>;
  }
  if (node.kind === "list") {
    return <ListView node={node} page={page} setPage={setPage} pathSegments={pathSegments} goTo={goTo} canEdit={canEdit} refreshNode={refreshNode} startRebuild={startRebuild} />;
  }
  if (node.kind === "instance") {
    return <InstanceView domain={domain} node={node} pathSegments={pathSegments} goTo={goTo} canEdit={canEdit} refreshNode={refreshNode} startRebuild={startRebuild} />;
  }
  return <div className="muted small">Unknown node kind: {node.kind}</div>;
}

// Fields the server's classifyFieldsForWrite() will accept. Mirror that
// logic here so the client doesn't try to PATCH read-only fields.
function isWritableField(f) {
  if (!f) return false;
  if (f.type === "raw") return true;
  if (f.type === "relationship") {
    // Forward side only (heuristic mirrors server: no prefersSingleRecordLink=false).
    return f.prefersSingleRecordLink !== false;
  }
  return false;
}

function coerceValueForType(raw, datatype) {
  if (raw === "" || raw === null || raw === undefined) return null;
  if (datatype === "integer") {
    const n = parseInt(raw, 10);
    return Number.isNaN(n) ? raw : n;
  }
  if (datatype === "number" || datatype === "decimal" || datatype === "float") {
    const n = parseFloat(raw);
    return Number.isNaN(n) ? raw : n;
  }
  if (datatype === "boolean") {
    if (typeof raw === "boolean") return raw;
    return /^(true|yes|1)$/i.test(String(raw).trim());
  }
  return String(raw);
}

// =============================================================================
// SchemaEditor  (DOMAIN_UX_VISION.md §2.3 schema-detail strip)
// =============================================================================
// One panel that drops down from a column header (ListView) or from clicking
// the type column of a field row (InstanceView). Shows the field's full
// schema and lets the user edit it. Saves issue PATCH /api/explorer/schema
// with a /<Entity>/schema/<idx>/<key> pointer per property, which kicks off
// a rebuild (the parent opens RebuildOverlay via startRebuild).

const SCHEMA_TYPE_OPTIONS  = ["raw", "calculated", "lookup", "aggregation", "relationship"];
const SCHEMA_DTYPE_OPTIONS = ["string", "integer", "number", "decimal", "boolean", "date", "datetime"];

function SchemaEditor({ entity, fieldIndex, field, canEdit, onClose, startRebuild, onSavedNoRebuild }) {
  const api = useExplorerApi();
  const [draft, setDraft] = useState(() => ({
    name:             field.name || "",
    type:             field.type || "raw",
    datatype:         field.datatype || "string",
    nullable:         field.nullable !== false,
    important:        !!field.important,
    Description:      field.Description || "",
    formula:          field.formula || "",
    explanation_rich: field.explanation_rich || "",
    RelatedTo:        field.RelatedTo || "",
  }));
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState(null);

  const isDirty = (key) => {
    const cur = key in field ? field[key] : (typeof draft[key] === "boolean" ? false : "");
    return String(draft[key]) !== String(cur);
  };
  const anyDirty = Object.keys(draft).some(isDirty);

  const save = async () => {
    setBusy(true); setErr(null);
    try {
      // One PATCH per dirty property. Each emits a rebuildId; we open
      // the overlay for the LAST one (they all queue rebuilds; the latest
      // is the most useful to tail).
      let lastRebuildId = null;
      for (const key of Object.keys(draft)) {
        if (!isDirty(key)) continue;
        // For boolean false on `important`, we still want to send false
        // (not skip) so the rulebook reflects the toggle off.
        const value = draft[key];
        const r = await api.patch("/api/explorer/schema", {
          pointer: `/${entity}/schema/${fieldIndex}/${key}`,
          value,
        });
        lastRebuildId = r.rebuildId;
      }
      if (lastRebuildId && startRebuild) startRebuild(lastRebuildId);
      else if (onSavedNoRebuild) onSavedNoRebuild();
      onClose();
    } catch (e) {
      setErr({ message: e.message, transpilerOutput: e.transpilerOutput || null });
    } finally { setBusy(false); }
  };

  const field_ = (label, key, control) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
      <label className="muted small" style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {label}
        {isDirty(key) && <span style={{ color: "var(--warn)" }}>•</span>}
      </label>
      {control}
    </div>
  );

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        padding: 12,
        background: "var(--panel-2)",
        border: "1px solid var(--border)",
        borderRadius: 6,
        marginTop: 6,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
        <strong className="mono small">{entity}.{field.name}</strong>
        <span className="muted small" style={{ marginLeft: 8 }}>schema editor · /{entity}/schema/{fieldIndex}</span>
        <span style={{ flex: 1 }} />
        <button className="btn secondary" onClick={onClose} style={{ padding: "2px 8px" }}>×</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
        {field_("name", "name",
          <input type="text" disabled={!canEdit || true /* renames are risky; v1 read-only */}
                 value={draft.name}
                 onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                 style={{ width: "100%" }} />)}
        {field_("type", "type",
          <select disabled={!canEdit} value={draft.type}
                  onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))}
                  style={{ width: "100%" }}>
            {SCHEMA_TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>)}
        {field_("datatype", "datatype",
          <select disabled={!canEdit} value={draft.datatype}
                  onChange={(e) => setDraft((d) => ({ ...d, datatype: e.target.value }))}
                  style={{ width: "100%" }}>
            {SCHEMA_DTYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>)}
        {field_("nullable", "nullable",
          <input type="checkbox" disabled={!canEdit} checked={draft.nullable}
                 onChange={(e) => setDraft((d) => ({ ...d, nullable: e.target.checked }))} />)}
        {field_("important", "important",
          <input type="checkbox" disabled={!canEdit} checked={draft.important}
                 onChange={(e) => setDraft((d) => ({ ...d, important: e.target.checked }))} />)}
        {(draft.type === "relationship" || draft.type === "lookup" || draft.RelatedTo) &&
          field_("RelatedTo", "RelatedTo",
            <input type="text" disabled={!canEdit} value={draft.RelatedTo}
                   onChange={(e) => setDraft((d) => ({ ...d, RelatedTo: e.target.value }))}
                   style={{ width: "100%" }} />)}
      </div>

      {(draft.type === "calculated" || draft.type === "lookup" || draft.type === "aggregation" || draft.formula) && (
        <div style={{ marginTop: 10 }}>
          {field_("formula", "formula",
            <textarea disabled={!canEdit} rows={2}
                      value={draft.formula}
                      onChange={(e) => setDraft((d) => ({ ...d, formula: e.target.value }))}
                      className="mono small"
                      style={{ width: "100%", fontFamily: "var(--mono)" }} />)}
        </div>
      )}

      <div style={{ marginTop: 10 }}>
        {field_("Description", "Description",
          <textarea disabled={!canEdit} rows={2}
                    value={draft.Description}
                    onChange={(e) => setDraft((d) => ({ ...d, Description: e.target.value }))}
                    style={{ width: "100%" }} />)}
      </div>

      <div style={{ marginTop: 10 }}>
        {field_("explanation_rich", "explanation_rich",
          <textarea disabled={!canEdit} rows={3}
                    value={draft.explanation_rich}
                    onChange={(e) => setDraft((d) => ({ ...d, explanation_rich: e.target.value }))}
                    style={{ width: "100%" }} />)}
      </div>

      {err && (
        <div className="story-banner" style={{ borderLeftColor: "var(--bad)", marginTop: 8 }}>
          <div>{typeof err === "string" ? err : err.message}</div>
          {err && typeof err === "object" && err.transpilerOutput && (
            <details style={{ marginTop: 6 }}>
              <summary className="muted small" style={{ cursor: "pointer" }}>transpiler output</summary>
              <pre className="mono small" style={{ whiteSpace: "pre-wrap", marginTop: 4, maxHeight: 240, overflow: "auto" }}>
                {err.transpilerOutput}
              </pre>
            </details>
          )}
          <div className="muted small" style={{ marginTop: 6 }}>
            Nothing was saved — the rulebook on disk is unchanged.
          </div>
        </div>
      )}

      {canEdit && (
        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <button className="btn" disabled={!anyDirty || busy} onClick={save}>
            {busy ? "Validating + saving…" : anyDirty ? "Save (validate, then rebuild)" : "Save"}
          </button>
          <span className="muted small" style={{ alignSelf: "center" }}>
            Saves PATCH /api/explorer/schema per dirty property and tails the rebuild.
          </span>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// EntityHeaderEditor  (DOMAIN_UX_VISION.md §2.7)
// =============================================================================
// Renders above the list-view rows for unscoped entity nodes. Edits the
// entity's Description and `important` flag, and offers a Delete button.
// Each save uses the same PATCH /api/explorer/schema pointer surface; delete
// uses DELETE /api/explorer/schema?entity=...

function EntityHeaderEditor({ entity, canEdit, startRebuild, refreshNode, afterDelete }) {
  const api = useExplorerApi();
  const [desc, setDesc] = useState(null);
  const [important, setImportant] = useState(null);
  const [origDesc, setOrigDesc] = useState("");
  const [origImportant, setOrigImportant] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState(null);
  const [open, setOpen] = useState(false);

  // Lazy-fetch the entity's current Description + important when expanded
  // (the /node payload doesn't carry these — they're entity-level, not
  // schema-array entries).
  useEffect(() => {
    if (!open || desc !== null) return;
    api.get(`/api/rulebook/entities/${encodeURIComponent(entity)}`)
      .then((e) => {
        setOrigDesc(e.Description || "");
        setOrigImportant(!!e.important);
        setDesc(e.Description || "");
        setImportant(!!e.important);
      })
      .catch((e) => setErr(e.message));
  }, [open, entity]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset on entity change.
  useEffect(() => {
    setDesc(null); setImportant(null); setOpen(false); setErr(null);
  }, [entity]);

  const isDirty = desc !== null && (desc !== origDesc || important !== origImportant);

  const save = async () => {
    setBusy(true); setErr(null);
    try {
      let lastRebuildId = null;
      if (desc !== origDesc) {
        const r = await api.patch("/api/explorer/schema", {
          pointer: `/${entity}/Description`, value: desc,
        });
        lastRebuildId = r.rebuildId;
      }
      if (important !== origImportant) {
        const r = await api.patch("/api/explorer/schema", {
          pointer: `/${entity}/important`, value: important,
        });
        lastRebuildId = r.rebuildId;
      }
      if (lastRebuildId && startRebuild) startRebuild(lastRebuildId);
      else if (refreshNode) refreshNode();
      setOrigDesc(desc); setOrigImportant(important);
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  const del = async () => {
    if (!window.confirm(`Delete entity ${entity} (drops the entire table + all rows)?`)) return;
    setBusy(true); setErr(null);
    try {
      const r = await api.del(`/api/explorer/schema?entity=${encodeURIComponent(entity)}`);
      if (r.rebuildId && startRebuild) startRebuild(r.rebuildId);
      afterDelete();
    } catch (e) {
      if (e.referrers) {
        setErr(`${e.message}\n` + e.referrers.map((r) => `  • ${r.entity}.${r.viaFk}`).join("\n"));
      } else {
        setErr(e.message);
      }
    } finally { setBusy(false); }
  };

  return (
    <div style={{ marginBottom: 12 }}>
      <button
        className="btn secondary"
        style={{ padding: "2px 8px", fontSize: 12 }}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "× Close entity edit" : "✎ Edit entity (Description / important / delete)"}
      </button>
      {open && (
        <div
          style={{
            marginTop: 8, padding: 10,
            background: "var(--panel-2)",
            border: "1px solid var(--border)", borderRadius: 6,
          }}
        >
          {err && (
            <div className="story-banner" style={{ borderLeftColor: "var(--bad)", whiteSpace: "pre-wrap" }}>
              {err}
            </div>
          )}
          {desc === null && <div className="muted small">Loading…</div>}
          {desc !== null && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label className="muted small">
                  Description{desc !== origDesc && <span style={{ color: "var(--warn)", marginLeft: 4 }}>•</span>}
                </label>
                <textarea
                  rows={2}
                  disabled={!canEdit}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  style={{ width: "100%" }}
                />
                <label className="small">
                  <input
                    type="checkbox"
                    disabled={!canEdit}
                    checked={important}
                    onChange={(e) => setImportant(e.target.checked)}
                    style={{ marginRight: 6 }}
                  />
                  important
                  {important !== origImportant && <span style={{ color: "var(--warn)", marginLeft: 4 }}>•</span>}
                </label>
              </div>
              {canEdit && (
                <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                  <button className="btn" disabled={!isDirty || busy} onClick={save}>
                    {busy ? "Saving…" : isDirty ? "Save (triggers rebuild)" : "Save"}
                  </button>
                  <button
                    className="btn secondary"
                    style={{ marginLeft: "auto", color: "var(--bad)" }}
                    disabled={busy}
                    onClick={del}
                  >
                    Delete entity…
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// NewEntityButton  (DOMAIN_UX_VISION.md §2.7 entity create)
// =============================================================================
// "+ New entity" at the bottom of the left rail. Opens an inline form;
// submit issues PATCH /api/explorer/schema with the root pointer "/" and a
// minimal { name, definition: { Description, important, schema: [...] } }
// body. Server creates the entity, kicks off a rebuild, returns rebuildId.

function NewEntityButton({ onCreated }) {
  const api = useExplorerApi();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [pkName, setPkName] = useState("Id");
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState(null);

  const submit = async () => {
    setBusy(true); setErr(null);
    try {
      if (!name) throw new Error("entity name is required");
      // Minimal valid entity per ERB conventions: a PK + a Name field. The
      // user can grow the schema from the column-header strip after the
      // rebuild lands. Naming the PK <Name>Id matches the transpiler's
      // toSnakeCase target (Name → name_id) and the spec §2.6 default.
      const pk = pkName || `${name}Id`;
      const definition = {
        Description: desc || "",
        important: false,
        schema: [
          { name: pk,     datatype: "string", type: "raw", nullable: false, isPk: true },
          { name: "Name", datatype: "string", type: "raw", nullable: false },
        ],
        data: [],
      };
      const r = await api.patch("/api/explorer/schema", {
        pointer: "/",
        value: { name, definition },
      });
      toast(`Created entity ${name}`);
      onCreated(r.rebuildId);
      setOpen(false); setName(""); setDesc(""); setPkName("Id");
    } catch (e) {
      setErr(e.message);
    } finally { setBusy(false); }
  };

  if (!open) {
    return (
      <div style={{ paddingTop: 8 }}>
        <button
          className="btn secondary"
          style={{ width: "100%", padding: "6px 8px", fontSize: 12 }}
          onClick={() => setOpen(true)}
        >
          + New entity
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: 8, padding: 10,
        background: "var(--panel-2)",
        border: "1px solid var(--border)", borderRadius: 6,
      }}
    >
      <div className="small" style={{ fontWeight: 600, marginBottom: 6 }}>New entity</div>
      <label className="muted small">Entity name (PascalCase)</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Customers"
        style={{ width: "100%", marginBottom: 6 }}
      />
      <label className="muted small">PK field name</label>
      <input
        type="text"
        value={pkName}
        onChange={(e) => setPkName(e.target.value)}
        placeholder={`${name || "Entity"}Id`}
        style={{ width: "100%", marginBottom: 6 }}
      />
      <label className="muted small">Description</label>
      <textarea
        rows={2}
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        style={{ width: "100%", marginBottom: 6 }}
      />
      {err && (
        <div className="story-banner" style={{ borderLeftColor: "var(--bad)", marginBottom: 6 }}>
          {err}
        </div>
      )}
      <div style={{ display: "flex", gap: 6 }}>
        <button className="btn" disabled={busy || !name} onClick={submit}>
          {busy ? "Creating…" : "Create (triggers rebuild)"}
        </button>
        <button className="btn secondary" disabled={busy} onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function FieldInput({ field, value, onChange }) {
  if (field.datatype === "boolean") {
    return (
      <input
        type="checkbox"
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
      />
    );
  }
  if (field.datatype === "integer" || field.datatype === "number" || field.datatype === "decimal" || field.datatype === "float") {
    return (
      <input
        type="number"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%" }}
      />
    );
  }
  if (field.datatype === "datetime" || field.datatype === "date") {
    return (
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.datatype === "date" ? "YYYY-MM-DD" : "YYYY-MM-DDTHH:MM:SSZ"}
        style={{ width: "100%" }}
      />
    );
  }
  return (
    <input
      type="text"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: "100%" }}
    />
  );
}

function SchemaHeaderCell({ field, onDoubleClick, isOpen }) {
  // The column header IS the schema entry per §2.3. Hover reveals the full
  // type / formula / description; double-click expands into the schema-
  // detail strip below (handled by the parent table).
  const parts = [];
  if (field.type) parts.push(`type: ${field.type}`);
  if (field.datatype) parts.push(`datatype: ${field.datatype}`);
  if (field.formula) parts.push(`formula: ${field.formula}`);
  if (field.Description) parts.push(`\n${field.Description}`);
  if (field.RelatedTo) parts.push(`→ ${field.RelatedTo}`);
  return (
    <th
      title={parts.join("  ·  ") + "\n\n(double-click to edit schema)"}
      onDoubleClick={onDoubleClick}
      style={{ cursor: "pointer", background: isOpen ? "var(--panel-2)" : undefined }}
    >
      <div>{field.name} {isOpen && <span className="muted small">▾</span>}</div>
      <div className="muted small" style={{ fontWeight: 400 }}>
        {field.type === "raw" ? field.datatype : field.type}
      </div>
    </th>
  );
}

function ListView({ node, page, setPage, pathSegments, goTo, canEdit, refreshNode, startRebuild }) {
  const cols = node.schema || [];
  const rows = node.rows || [];
  const totalPages = Math.max(1, Math.ceil((node.totalCount || 0) / (node.pageSize || 50)));
  const [showNewRow, setShowNewRow] = useState(false);
  const [openSchemaField, setOpenSchemaField] = useState(null); // field name or null
  // Close the schema strip when the user navigates to a different node.
  useEffect(() => { setOpenSchemaField(null); setShowNewRow(false); }, [node.entity, node.scopedBy?.id]);
  const openSchemaIdx = openSchemaField
    ? cols.findIndex((c) => c.name === openSchemaField)
    : -1;

  return (
    <>
      <h3 className="mono" style={{ marginTop: 0 }}>
        {node.entity}
        <span className="muted small" style={{ marginLeft: 8, fontWeight: 400 }}>
          {node.totalCount} {node.totalCount === 1 ? "row" : "rows"}
          {node.scopedBy && (
            <> · scoped by {node.scopedBy.entity}{" "}
              <span className="mono">{node.scopedBy.id}</span>{" "}
              via <span className="mono">{node.scopedBy.viaFk}</span>
            </>
          )}
        </span>
        {canEdit && (
          <button
            className="btn secondary"
            style={{ marginLeft: 12 }}
            onClick={() => setShowNewRow((v) => !v)}
          >
            {showNewRow ? "× Cancel" : "+ New row"}
          </button>
        )}
      </h3>

      {/* Entity-level edit panel: Description + important toggle + delete.
          Hidden for scoped lists since they're a slice of the entity, not
          the entity itself. */}
      {!node.scopedBy && (
        <EntityHeaderEditor
          entity={node.entity}
          canEdit={canEdit}
          startRebuild={startRebuild}
          refreshNode={refreshNode}
          afterDelete={() => goTo([])}
        />
      )}

      {showNewRow && canEdit && (
        <NewRowForm
          entity={node.entity}
          schema={cols}
          scopedBy={node.scopedBy}
          onCreated={() => { setShowNewRow(false); refreshNode(); }}
          onCancel={() => setShowNewRow(false)}
        />
      )}

      <div style={{ overflowX: "auto" }}>
        <table className="grid">
          <thead>
            <tr>{cols.map((c) => (
              <SchemaHeaderCell
                key={c.name}
                field={c}
                isOpen={openSchemaField === c.name}
                onDoubleClick={() =>
                  setOpenSchemaField((cur) => cur === c.name ? null : c.name)
                }
              />
            ))}</tr>
            {openSchemaIdx >= 0 && (
              <tr>
                <td colSpan={cols.length} style={{ padding: 0, background: "var(--panel-2)" }}>
                  <SchemaEditor
                    entity={node.entity}
                    fieldIndex={openSchemaIdx}
                    field={cols[openSchemaIdx]}
                    canEdit={canEdit}
                    onClose={() => setOpenSchemaField(null)}
                    startRebuild={startRebuild}
                    onSavedNoRebuild={refreshNode}
                  />
                </td>
              </tr>
            )}
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={cols.length} className="muted small">No rows.</td></tr>
            )}
            {rows.map((row, i) => (
              <tr
                key={i}
                className="clickable"
                onClick={() => goTo([...pathSegments, String(row.Name ?? "")])}
                title={`Open ${node.entity} / ${row.Name}`}
              >
                {cols.map((c) => <td key={c.name}>{formatCell(row[c.name])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="muted small" style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
          <button className="btn secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>
            ← Prev
          </button>
          <span>Page {page + 1} of {totalPages}</span>
          <button className="btn secondary" disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>
            Next →
          </button>
        </div>
      )}
    </>
  );
}

function NewRowForm({ entity, schema, scopedBy, onCreated, onCancel }) {
  const api = useExplorerApi();
  const writable = schema.filter(isWritableField);
  // Pre-seed the FK field if the URL ancestry implies one (e.g. creating a
  // Project under /Employees/Sarah Chen pre-fills ApprovedBy = sarah-chen).
  const [values, setValues] = useState(() => {
    const init = {};
    if (scopedBy?.viaFk) {
      // We have the parent's URL Name but not its PK value. Leave empty for
      // now — user supplies it (or a future server response can supply it).
      init[scopedBy.viaFk] = "";
    }
    return init;
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState(null);

  const submit = async () => {
    setBusy(true); setErr(null);
    try {
      const payload = {};
      for (const f of writable) {
        const v = values[f.name];
        if (v === undefined) continue;
        payload[f.name] = coerceValueForType(v, f.datatype);
      }
      await api.post(`/api/explorer/instance/${encodeURIComponent(entity)}`, payload);
      toast(`Created ${entity}/${payload.Name}`);
      onCreated();
    } catch (e) {
      setErr(e.message);
    } finally { setBusy(false); }
  };

  return (
    <div className="card" style={{ padding: 12, marginBottom: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
        {writable.map((f) => (
          <div key={f.name}>
            <label className="muted small" style={{ display: "block", marginBottom: 2 }}>
              {f.name}
              {f.nullable === false && <span style={{ color: "var(--bad)" }}> *</span>}
              {f.datatype && <span style={{ marginLeft: 4 }}>({f.datatype})</span>}
            </label>
            <FieldInput
              field={f}
              value={values[f.name]}
              onChange={(v) => setValues((s) => ({ ...s, [f.name]: v }))}
            />
          </div>
        ))}
      </div>
      {err && (
        <div className="story-banner" style={{ borderLeftColor: "var(--bad)", marginTop: 8 }}>{err}</div>
      )}
      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
        <button className="btn" disabled={busy} onClick={submit}>
          {busy ? "Creating…" : "Create"}
        </button>
        <button className="btn secondary" disabled={busy} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function InstanceView({ domain, node, pathSegments, goTo, canEdit, refreshNode, startRebuild }) {
  const api = useExplorerApi();
  const cols = node.schema || [];
  const row  = node.row || {};
  // Dirty map: only fields the user actually changed. Sending the unchanged
  // ones too would pass the server's classifier but is wasted writes.
  const [dirty, setDirty] = useState({});
  const [busy, setBusy]   = useState(false);
  const [err, setErr]     = useState(null);
  const [openCell, setOpenCell] = useState(null);   // field name showing provenance
  const [openSchema, setOpenSchema] = useState(null); // field name showing schema editor

  // Reset dirty state + close any open provenance/schema when the underlying
  // row changes (navigated to a new instance, or refreshed post-save).
  useEffect(() => {
    setDirty({}); setErr(null); setOpenCell(null); setOpenSchema(null);
  }, [node]);

  const isDirty = Object.keys(dirty).length > 0;

  const setField = (field, raw, datatype) => {
    setDirty((d) => ({ ...d, [field]: coerceValueForType(raw, datatype) }));
  };

  const save = async () => {
    setBusy(true); setErr(null);
    try {
      await api.patch(
        `/api/explorer/instance/${encodeURIComponent(node.entity)}/${encodeURIComponent(node.id)}`,
        dirty
      );
      toast("Saved (Postgres + rulebook JSON).");
      refreshNode();
    } catch (e) {
      setErr(e.message);
    } finally { setBusy(false); }
  };

  const del = async () => {
    if (!window.confirm(`Delete ${node.entity} / ${node.id}?`)) return;
    setBusy(true); setErr(null);
    try {
      await api.del(
        `/api/explorer/instance/${encodeURIComponent(node.entity)}/${encodeURIComponent(node.id)}`
      );
      toast(`Deleted ${node.entity}/${node.id}.`);
      goTo(pathSegments.slice(0, -1)); // back to the parent list
    } catch (e) {
      // Server returns 409 with referrer list when cascade is needed.
      if (e.referrers) {
        const yes = window.confirm(
          `${node.entity}/${node.id} has ${e.referrers.length} FK referrer(s). Cascade?`
        );
        if (yes) {
          try {
            await api.del(
              `/api/explorer/instance/${encodeURIComponent(node.entity)}/${encodeURIComponent(node.id)}?cascade=true`
            );
            toast(`Deleted ${node.entity}/${node.id} and ${e.referrers.length} referrer(s).`);
            goTo(pathSegments.slice(0, -1));
            return;
          } catch (e2) { setErr(e2.message); }
        }
      } else {
        setErr(e.message);
      }
    } finally { setBusy(false); }
  };

  return (
    <>
      <h3 className="mono" style={{ marginTop: 0 }}>
        {node.entity} / <span style={{ color: "var(--accent)" }}>{node.id}</span>
        <span className="muted small" style={{ marginLeft: 8, fontWeight: 400 }}>
          {node.pk} = <span className="mono">{String(node.pkValue ?? "")}</span>
        </span>
      </h3>

      {canEdit && (
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button className="btn" disabled={!isDirty || busy} onClick={save}>
            {busy ? "Saving…" : isDirty ? `Save ${Object.keys(dirty).length} change(s)` : "Save"}
          </button>
          {isDirty && (
            <button className="btn secondary" disabled={busy} onClick={() => setDirty({})}>
              Reset
            </button>
          )}
          <button className="btn secondary" style={{ marginLeft: "auto", color: "var(--bad)" }} disabled={busy} onClick={del}>
            Delete row…
          </button>
        </div>
      )}

      {err && (
        <div className="story-banner" style={{ borderLeftColor: "var(--bad)" }}>{err}</div>
      )}

      {node.tabs && node.tabs.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {node.tabs.map((t, i) => (
            <button
              key={`${t.entity}/${t.viaFk}/${i}`}
              className="btn secondary"
              onClick={() => goTo([...pathSegments, t.entity])}
              title={`${t.entity}.${t.viaFk} → ${node.entity}`}
            >
              {t.entity}
              <span className="muted small" style={{ marginLeft: 6 }}>
                {t.rowCount}
              </span>
            </button>
          ))}
        </div>
      )}

      <table className="grid">
        <thead><tr><th>field</th><th>type</th><th>value</th></tr></thead>
        <tbody>
          {cols.map((c, idx) => {
            const writable = canEdit && isWritableField(c);
            const liveValue = c.name in dirty ? dirty[c.name] : row[c.name];
            // A cell has provenance to show whenever its field isn't plain
            // raw — calculated/lookup/aggregation/relationship all have a
            // story (formula text, target row, dependencies). Raw cells
            // skip the click target to keep the surface clean.
            const hasProvenance = c.type && c.type !== "raw";
            const schemaOpen = openSchema === c.name;
            return (
              <Fragment key={c.name}>
                <tr>
                  <td>
                    <div>
                      {c.name}
                      {c.name in dirty && (
                        <span className="muted small" style={{ marginLeft: 6, color: "var(--warn)" }}>•</span>
                      )}
                    </div>
                    {c.Description && (
                      <div className="muted small">{c.Description}</div>
                    )}
                  </td>
                  <td
                    className="clickable"
                    onClick={() => setOpenSchema((cur) => cur === c.name ? null : c.name)}
                    title="Click to edit this field's schema (PATCH /api/explorer/schema)"
                    style={{ background: schemaOpen ? "var(--panel-2)" : undefined }}
                  >
                    <span className="tag">{c.type || ""}</span>
                    {c.datatype && c.type === "raw" && (
                      <span className="muted small" style={{ marginLeft: 6 }}>{c.datatype}</span>
                    )}
                    {schemaOpen && <span className="muted small" style={{ marginLeft: 6 }}>▾</span>}
                  </td>
                  <td
                    className={hasProvenance ? "clickable" : ""}
                    onClick={hasProvenance ? () => setOpenCell((cur) => cur === c.name ? null : c.name) : undefined}
                    title={
                      c.formula
                        ? (hasProvenance ? `${c.formula}\n\n(click for provenance)` : c.formula)
                        : (hasProvenance ? "Click to see how this was computed" : undefined)
                    }
                  >
                    {writable
                      ? <FieldInput field={c} value={liveValue} onChange={(v) => setField(c.name, v, c.datatype)} />
                      : formatCell(row[c.name])}
                    {hasProvenance && openCell === c.name && (
                      <CellProvenance
                        domain={domain}
                        entity={node.entity}
                        id={node.id}
                        field={c.name}
                        onClose={() => setOpenCell(null)}
                        onNavigate={(segments) => { setOpenCell(null); goTo(segments); }}
                      />
                    )}
                  </td>
                </tr>
                {schemaOpen && (
                  <tr>
                    <td colSpan={3} style={{ padding: 0, background: "var(--panel-2)" }}>
                      <SchemaEditor
                        entity={node.entity}
                        fieldIndex={idx}
                        field={c}
                        canEdit={canEdit}
                        onClose={() => setOpenSchema(null)}
                        startRebuild={startRebuild}
                        onSavedNoRebuild={refreshNode}
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

function CellProvenance({ domain, entity, id, field, onClose, onNavigate }) {
  const api = useExplorerApi();
  const [data, setData] = useState(null);
  const [err, setErr]   = useState(null);
  useEffect(() => {
    setData(null); setErr(null);
    const qs = new URLSearchParams({
      domain, entity, id, field,
    });
    api.get(`/api/explorer/cell?${qs.toString()}`)
      .then(setData)
      .catch((e) => setErr(e.message));
  }, [domain, entity, id, field]);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        marginTop: 8,
        padding: 10,
        background: "var(--panel-2)",
        border: "1px solid var(--border)",
        borderRadius: 6,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong className="mono small">{entity}.{field}</strong>
        <button className="btn secondary" onClick={onClose} style={{ padding: "2px 8px" }}>×</button>
      </div>
      {err && <div className="story-banner" style={{ borderLeftColor: "var(--bad)", marginTop: 6 }}>{err}</div>}
      {!data && !err && <div className="muted small" style={{ marginTop: 6 }}>Loading…</div>}
      {data && (
        <>
          <div className="muted small" style={{ marginTop: 6 }}>
            kind: <span className="tag">{data.kind}</span>
            {" · value: "}<span className="mono">{formatCell(data.value)}</span>
          </div>
          {data.formula && (
            <div className="mono small" style={{ marginTop: 6, padding: 6, background: "var(--panel)", borderRadius: 4 }}>
              {data.formula}
            </div>
          )}
          {data.explanation_rich && (
            <div
              className="small"
              style={{ marginTop: 6 }}
              dangerouslySetInnerHTML={{ __html: data.explanation_rich }}
            />
          )}
          {data.inputs && data.inputs.length > 0 && (
            <>
              <div className="muted small" style={{ marginTop: 8, fontWeight: 600 }}>Inputs</div>
              <ul style={{ margin: "4px 0 0 0", padding: "0 0 0 18px" }}>
                {data.inputs.map((inp, i) => (
                  <li key={i} className="small" style={{ marginTop: 2 }}>
                    {inp.entity ? (
                      <>
                        <span
                          className="mono clickable"
                          onClick={() => onNavigate([inp.entity, inp.id ?? ""])}
                          title={`Open ${inp.entity}/${inp.id || "…"}`}
                        >
                          {inp.entity}
                        </span>
                        {inp.id && (
                          <>
                            {" / "}
                            <span
                              className="mono clickable"
                              onClick={() => onNavigate([inp.entity, inp.id])}
                            >
                              {inp.id}
                            </span>
                          </>
                        )}
                        {inp.field && <>{"."}<span className="mono">{inp.field}</span></>}
                      </>
                    ) : (
                      <span className="mono">{inp.field}</span>
                    )}
                    {" · "}
                    <span className="tag" style={{ fontSize: 10 }}>{inp.kind}</span>
                    {inp.value !== undefined && (
                      <> {" = "}<span className="mono">{formatCell(inp.value)}</span></>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}

// =============================================================================
// RebuildOverlay  (DOMAIN_UX_VISION.md §2.7 + step 8)
// =============================================================================
// Opens when a /api/explorer/rebuild call (or a schema PATCH) returns a
// rebuildId. Tails the SSE stream emitted by /api/explorer/rebuild/:id/stream
// — each phase event becomes a line in a live log; on "done" the parent
// refreshes (tree + node); on "error" we leave the overlay open so the user
// can read the failure and decide how to recover.
//
// Per §2.8 decision 3, no auto-rollback. The recovery affordance is a copy-
// able `git checkout` command — explicit user action, never silent.

function RebuildOverlay({ rebuildId, domain, canEdit, onClose, onSuccess, onReverted }) {
  const api = useExplorerApi();
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("pending");
  const [doneData, setDoneData] = useState(null);
  const [errData, setErrData] = useState(null);
  const [diff, setDiff] = useState(null);          // { diff, dirty } once fetched
  const [diffErr, setDiffErr] = useState(null);
  const [reverting, setReverting] = useState(false);

  useEffect(() => {
    if (!rebuildId) return;
    const es = new EventSource(`/api/explorer/rebuild/${encodeURIComponent(rebuildId)}/stream`);
    es.addEventListener("phase", (e) => {
      try {
        const data = JSON.parse(e.data);
        setEvents((evs) => [...evs, { kind: "phase", data, t: Date.now() }]);
        setStatus("running");
      } catch {}
    });
    es.addEventListener("done", (e) => {
      try {
        const data = JSON.parse(e.data);
        setDoneData(data);
        setStatus("done");
      } catch {}
      es.close();
    });
    es.addEventListener("error", (e) => {
      // SSE 'error' events come in two flavors: server-emitted JSON (the
      // build failed loudly) and transport-level errors (network drop).
      // Differentiate by whether e.data is set.
      if (e.data) {
        try {
          const data = JSON.parse(e.data);
          setErrData(data);
          setStatus("error");
        } catch {
          setErrData({ msg: "stream parse error" });
          setStatus("error");
        }
      } else if (es.readyState === EventSource.CLOSED) {
        // Connection closed — if we haven't set done/error yet, leave the
        // overlay alone; the user can close manually.
      }
    });
    return () => es.close();
  }, [rebuildId]);

  // When the build succeeds, give the user one beat to see the green
  // "done" line, then let the parent refresh and close.
  useEffect(() => {
    if (status === "done") {
      const t = setTimeout(onSuccess, 600);
      return () => clearTimeout(t);
    }
  }, [status, onSuccess]);

  // When the build fails, fetch the rulebook's live git diff so the user
  // can see exactly what edit triggered the failure (per §2.8 decision 3).
  useEffect(() => {
    if (status !== "error") return;
    setDiff(null);
    setDiffErr(null);
    api.get(`/api/explorer/rulebook-diff?domain=${encodeURIComponent(domain || "")}`)
      .then((r) => setDiff(r))
      .catch((e) => setDiffErr(e.message));
  }, [status, domain]);

  const revertRulebook = async () => {
    if (reverting) return;
    if (!window.confirm(
      "Revert the rulebook to the last committed git state? " +
      "This discards the schema edit that triggered the failed rebuild."
    )) return;
    setReverting(true);
    try {
      await api.post("/api/explorer/rulebook-revert", { domain });
      toast("Rulebook reverted via git checkout.", "info");
      onReverted ? onReverted() : onClose();
    } catch (e) {
      toast(`Revert failed: ${e.message}`, "error");
    } finally {
      setReverting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
      onClick={status === "error" || status === "done" ? onClose : undefined}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--panel)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          width: "min(720px, 100%)",
          maxHeight: "80vh",
          display: "flex", flexDirection: "column",
        }}
      >
        <div style={{ padding: 12, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <strong>
            {status === "pending" && "Starting rebuild…"}
            {status === "running" && "Rebuilding…"}
            {status === "done"    && "Rebuild complete"}
            {status === "error"   && "Rebuild failed"}
          </strong>
          <span className="mono small muted">{rebuildId}</span>
          <span style={{ flex: 1 }} />
          {(status === "done" || status === "error") && (
            <button className="btn secondary" onClick={onClose}>Close</button>
          )}
        </div>

        <div
          className="mono small"
          style={{ padding: 12, overflowY: "auto", flex: 1, background: "var(--panel-2)" }}
        >
          {events.length === 0 && status === "pending" && (
            <div className="muted">Connecting to stream…</div>
          )}
          {events.map((e, i) => (
            <div key={i} style={{ marginBottom: 2 }}>
              <span className="muted">[{e.data.phase}]</span> {e.data.msg}
            </div>
          ))}
          {status === "done" && doneData && (
            <div style={{ color: "var(--good)", marginTop: 6 }}>
              ✓ done in {doneData.durationMs}ms
            </div>
          )}
          {status === "error" && errData && (
            <div style={{ color: "var(--bad)", marginTop: 6 }}>
              <div>✗ [{errData.phase || "?"}] {errData.code}: {errData.msg}</div>
              {Array.isArray(errData.mismatches) && errData.mismatches.length > 0 && (
                <table style={{ marginTop: 8, fontSize: "0.85em", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left",  padding: "2px 8px" }}>Entity</th>
                      <th style={{ textAlign: "right", padding: "2px 8px" }}>DB rows</th>
                      <th style={{ textAlign: "right", padding: "2px 8px" }}>Rulebook rows</th>
                      <th style={{ textAlign: "left",  padding: "2px 8px" }}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errData.mismatches.map((m, i) => (
                      <tr key={i}>
                        <td style={{ padding: "2px 8px" }}>{m.entity}</td>
                        <td style={{ padding: "2px 8px", textAlign: "right" }}>{m.db ?? "—"}</td>
                        <td style={{ padding: "2px 8px", textAlign: "right" }}>{m.rulebook ?? "—"}</td>
                        <td style={{ padding: "2px 8px" }}>{m.error || ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {status === "error" && (
          <div style={{ padding: 12, borderTop: "1px solid var(--border)" }}>
            <div className="small" style={{ marginBottom: 8 }}>
              Per §2.8 decision 3, failed rebuilds aren't auto-rolled back —
              the rulebook JSON keeps the edit that triggered this failure.
            </div>

            {diff === null && !diffErr && (
              <div className="muted small">Loading rulebook diff…</div>
            )}
            {diffErr && (
              <div className="small" style={{ color: "var(--bad)" }}>diff load failed: {diffErr}</div>
            )}
            {diff && diff.dirty === false && (
              <div className="muted small">
                No uncommitted changes in <span className="mono">{diff.path}</span> —
                the failure was already on the committed rulebook.
              </div>
            )}
            {diff && diff.dirty && (
              <>
                <div className="small muted" style={{ marginBottom: 4 }}>
                  Uncommitted changes in <span className="mono">{diff.path}</span>:
                </div>
                <pre
                  className="mono small"
                  style={{
                    padding: 8, background: "var(--panel-2)",
                    border: "1px solid var(--border)", borderRadius: 4,
                    margin: 0, marginBottom: 8, maxHeight: 200, overflow: "auto",
                  }}
                >{diff.diff}</pre>
              </>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                className="btn"
                disabled={!canEdit || reverting || !diff || !diff.dirty}
                onClick={revertRulebook}
                title={!canEdit
                  ? "You don't have edit permission"
                  : !diff || !diff.dirty
                    ? "No uncommitted rulebook changes to revert"
                    : "Runs `git checkout` against the rulebook — explicit, never silent"}
              >
                {reverting ? "Reverting…" : "Revert via git checkout"}
              </button>
              <button className="btn secondary" onClick={onClose}>
                Leave it (I'll fix the rows myself)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
