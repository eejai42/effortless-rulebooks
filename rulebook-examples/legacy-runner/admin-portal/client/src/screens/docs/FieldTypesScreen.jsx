import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ScreenHeader from "../../components/ScreenHeader.jsx";

export default function FieldTypesScreen({ screen, projectRulebook }) {
  const navigate   = useNavigate();
  const [params]   = useSearchParams();
  const fieldTypes = projectRulebook?.FieldTypeTaxonomy?.data || [];
  const [selectedId, setSelectedId] = useState(params.get("type") || fieldTypes[0]?.TypeName);

  useEffect(() => {
    const p = params.get("type");
    if (p) setSelectedId(p);
  }, [params]);

  const selected = fieldTypes.find((f) => f.TypeName === selectedId);

  return (
    <>
      <ScreenHeader screen={screen || { Title: "Field Types", Story: "The ERB field-type taxonomy. Every field in every rulebook has one of these types." }} />
      <div className="split">
        <div className="list-panel">
          {fieldTypes.map((ft) => (
            <div key={ft.TypeId || ft.TypeName}
                 className={`list-item ${ft.TypeName === selectedId ? "active" : ""}`}
                 onClick={() => { setSelectedId(ft.TypeName); navigate(`/docs/field-types?type=${encodeURIComponent(ft.TypeName)}`); }}>
              <div className="name"><span className="tag">{ft.TypeName}</span></div>
              <div className="meta">{ft.Intent}</div>
            </div>
          ))}
        </div>
        <div className="detail-panel">
          {selected ? (
            <>
              <h3 style={{ marginTop: 0 }}><span className="tag">{selected.TypeName}</span></h3>
              <div className="kv">
                <div className="k">Intent</div>            <div className="v">{selected.Intent}</div>
                <div className="k">Storage mode</div>      <div className="v"><span className="pill">{selected.StorageMode}</span></div>
                <div className="k">Read-only in UI</div>   <div className="v">{selected.ReadOnlyInUi ? "yes" : "no"}</div>
                <div className="k">Expressive tier</div>   <div className="v"><span className="pill">{selected.ExpressiveTier}</span></div>
                <div className="k">Example formula</div>   <div className="v mono">{selected.ExampleFormula || "—"}</div>
              </div>
            </>
          ) : <div className="muted">Select a field type.</div>}
        </div>
      </div>
    </>
  );
}
