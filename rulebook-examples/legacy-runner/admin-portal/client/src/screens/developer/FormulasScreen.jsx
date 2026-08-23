import { useNavigate } from "react-router-dom";
import ScreenHeader from "../../components/ScreenHeader.jsx";

export default function FormulasScreen({ screen, rulebook }) {
  const navigate = useNavigate();
  const rows = [];
  for (const [name, value] of Object.entries(rulebook || {})) {
    if (!value || typeof value !== "object" || !Array.isArray(value.schema)) continue;
    for (const f of value.schema) {
      if (f.type && f.type !== "raw") {
        rows.push({ entity: name, field: f.name, type: f.type, datatype: f.datatype,
                    formula: f.formula || f.Formula || "", desc: f.Description || "" });
      }
    }
  }

  return (
    <>
      <ScreenHeader screen={screen} />
      <table className="grid">
        <thead>
          <tr><th>entity</th><th>field</th><th>type</th><th>datatype</th><th>formula</th><th>description</th></tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={6} className="muted">No calculated fields in this rulebook.</td></tr>
            : rows.map((r, i) => (
                <tr key={i}>
                  <td className="clickable" onClick={() => navigate(`/developer/rulebook/entities?entity=${encodeURIComponent(r.entity)}`)}>{r.entity}</td>
                  <td>{r.field}</td>
                  <td>
                    <span className="tag clickable"
                          onClick={() => navigate(`/docs/field-types?type=${encodeURIComponent(r.type)}`)}>
                      {r.type}
                    </span>
                  </td>
                  <td>{r.datatype}</td>
                  <td className="mono">{r.formula}</td>
                  <td>{r.desc}</td>
                </tr>
              ))
          }
        </tbody>
      </table>
    </>
  );
}
