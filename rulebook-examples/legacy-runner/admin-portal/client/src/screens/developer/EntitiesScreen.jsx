import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { makeDomainApi } from "../../lib/api.js";
import { toast } from "../../lib/toast.js";
import ScreenHeader from "../../components/ScreenHeader.jsx";

function formatCell(v) {
  if (v === null || v === undefined) return <span className="muted">∅</span>;
  if (typeof v === "boolean") return v ? "✓" : "✗";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export default function EntitiesScreen({ screen, rulebook, me }) {
  const navigate = useNavigate();
  const { domain } = useParams();
  const api = useMemo(() => makeDomainApi(domain), [domain]);
  const canEdit  = me?.role?.CanEditRulebook;
  const [entities, setEntities] = useState([]);
  const [selected, setSelected] = useState(null);
  const [entity, setEntity]     = useState(null);
  const [editingDesc, setEditingDesc] = useState("");

  useEffect(() => {
    if (!domain) return;
    api.get("/api/rulebook/entities").then((es) => {
      setEntities(es);
      if (es.length && !selected) setSelected(es[0].name);
    });
  }, [rulebook, domain]);

  useEffect(() => {
    if (!selected || !domain) return;
    api.get(`/api/rulebook/entities/${encodeURIComponent(selected)}`).then((e) => {
      setEntity(e); setEditingDesc(e.Description || "");
    });
  }, [selected, domain]);

  const saveDesc = async () => {
    try {
      await api.patch(`/api/rulebook/entities/${encodeURIComponent(selected)}`, { description: editingDesc });
      toast("Saved (Postgres + rulebook JSON).");
    } catch (e) { toast(e.message, "error"); }
  };

  return (
    <>
      <ScreenHeader screen={screen} />
      <div className="split">
        <div className="list-panel">
          {entities.map((e) => (
            <div key={e.name}
                 className={`list-item ${e.name === selected ? "active" : ""}`}
                 onClick={() => setSelected(e.name)}>
              <div className="name">{e.name}</div>
              <div className="meta">{e.fieldCount} fields · {e.rowCount} rows</div>
            </div>
          ))}
        </div>
        <div className="detail-panel">
          {entity ? (
            <>
              <h3 className="mono" style={{ marginTop: 0 }}>{entity.name}</h3>
              <div className="kv">
                <div className="k">Description</div>
                <div className="v">
                  <textarea rows={2} disabled={!canEdit} value={editingDesc}
                    onChange={(e) => setEditingDesc(e.target.value)} />
                  {canEdit && (
                    <div style={{ marginTop: 6 }}>
                      <button className="btn" onClick={saveDesc}>Save (write-through)</button>
                    </div>
                  )}
                </div>
                <div className="k">Fields</div>  <div className="v">{(entity.schema || []).length}</div>
                <div className="k">Rows</div>    <div className="v">{(entity.data || []).length}</div>
              </div>

              <h4>Schema</h4>
              <table className="grid">
                <thead><tr><th>name</th><th>type</th><th>datatype</th><th>nullable</th><th>description</th></tr></thead>
                <tbody>
                  {(entity.schema || []).map((f) => (
                    <tr key={f.name}>
                      <td>{f.name}</td>
                      <td>
                        {f.type
                          ? <span className="tag clickable"
                              onClick={() => navigate(`/docs/field-types?type=${encodeURIComponent(f.type)}`)}>
                              {f.type}
                            </span>
                          : ""}
                      </td>
                      <td>{f.datatype || ""}</td>
                      <td>{String(f.nullable ?? "")}</td>
                      <td>{f.Description || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {entity.data?.length > 0 && (
                <>
                  <h4>Sample data ({entity.data.length} rows)</h4>
                  <div style={{ overflowX: "auto" }}>
                    <table className="grid">
                      <thead><tr>{Object.keys(entity.data[0]).map((k) => <th key={k}>{k}</th>)}</tr></thead>
                      <tbody>
                        {entity.data.slice(0, 30).map((row, i) => (
                          <tr key={i}>
                            {Object.keys(entity.data[0]).map((k) => (
                              <td key={k}>{formatCell(row[k])}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {entity.data.length > 30 && <div className="muted small">…showing 30 of {entity.data.length}</div>}
                  </div>
                </>
              )}
            </>
          ) : <div className="muted">Select an entity</div>}
        </div>
      </div>
    </>
  );
}
