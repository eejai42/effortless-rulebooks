import { useNavigate } from "react-router-dom";
import ScreenHeader from "../../components/ScreenHeader.jsx";

export default function RelationshipsScreen({ screen, rulebook }) {
  const navigate = useNavigate();

  // Detect FK relationships by:
  // 1. Fields with type "relationship" or "lookup" that have an FK target (name ends in Id or has Description "FK to X")
  // 2. Fields whose name ends in "Id" and that name (minus "Id") matches another entity key
  const entityNames = new Set(
    Object.keys(rulebook || {}).filter(
      (k) => !k.startsWith("$") && !k.startsWith("_") && rulebook[k]?.schema
    )
  );

  const edges = [];
  for (const [name, value] of Object.entries(rulebook || {})) {
    if (!value || typeof value !== "object" || !Array.isArray(value.schema)) continue;
    for (const f of value.schema) {
      // FK from Description "FK to TableName"
      const descMatch = (f.Description || "").match(/FK\s+to\s+(\w+)/i);
      if (descMatch) {
        edges.push({ from: name, field: f.name, to: descMatch[1], how: "Description" });
        continue;
      }
      // FK from field name ending in Id matching another entity
      if (f.type === "raw" && f.name.endsWith("Id")) {
        const candidate = f.name.slice(0, -2); // strip Id
        if (entityNames.has(candidate)) {
          edges.push({ from: name, field: f.name, to: candidate, how: "name-convention" });
        }
      }
      // FK from type "relationship"
      if (f.type === "relationship" && f.relatedEntity) {
        edges.push({ from: name, field: f.name, to: f.relatedEntity, how: "type=relationship" });
      }
    }
  }

  // Group by source entity
  const byEntity = {};
  for (const e of edges) {
    (byEntity[e.from] = byEntity[e.from] || []).push(e);
  }

  return (
    <>
      <ScreenHeader screen={screen} />
      {edges.length === 0 ? (
        <p className="muted">No FK relationships detected. Relationships are found via Description "FK to TableName", field names ending in Id matching an entity, or type="relationship" fields.</p>
      ) : (
        <table className="grid">
          <thead><tr><th>from entity</th><th>FK field</th><th>to entity</th><th>detected via</th></tr></thead>
          <tbody>
            {edges.map((e, i) => (
              <tr key={i}>
                <td className="clickable" onClick={() => navigate(`/developer/rulebook/entities?entity=${encodeURIComponent(e.from)}`)}>
                  {e.from}
                </td>
                <td className="mono">{e.field}</td>
                <td className="clickable" onClick={() => navigate(`/developer/rulebook/entities?entity=${encodeURIComponent(e.to)}`)}>
                  {e.to}
                </td>
                <td className="muted small">{e.how}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h4 style={{ marginTop: 24 }}>Adjacency summary</h4>
      <div className="cards" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
        {Object.entries(byEntity).map(([entity, rels]) => (
          <div key={entity} className="card">
            <h3 className="clickable" onClick={() => navigate(`/developer/rulebook/entities?entity=${encodeURIComponent(entity)}`)}>{entity}</h3>
            <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
              {rels.map((r, i) => (
                <li key={i} style={{ fontSize: 12 }}>
                  <span className="mono">{r.field}</span>
                  {" → "}
                  <span className="clickable"
                        onClick={() => navigate(`/developer/rulebook/entities?entity=${encodeURIComponent(r.to)}`)}>
                    {r.to}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
