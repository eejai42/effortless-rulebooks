import { useState } from "react";
import ScreenHeader from "../../components/ScreenHeader.jsx";

function formatCell(v) {
  if (v === null || v === undefined) return <span className="muted">∅</span>;
  if (typeof v === "boolean") return v ? "✓" : "✗";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export default function SampleDataScreen({ screen, rulebook }) {
  const entities = Object.entries(rulebook || {}).filter(
    ([k, v]) => !k.startsWith("$") && !k.startsWith("_") && v?.schema
  );
  const [pick, setPick] = useState(entities[0]?.[0] || "");
  const ent = pick ? rulebook[pick] : null;

  return (
    <>
      <ScreenHeader screen={screen} />
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
        <label>Entity:</label>
        <select value={pick} onChange={(e) => setPick(e.target.value)} style={{ width: 280 }}>
          {entities.map(([k]) => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>
      {ent?.data?.length ? (
        <div style={{ overflowX: "auto" }}>
          <table className="grid">
            <thead><tr>{Object.keys(ent.data[0]).map((k) => <th key={k}>{k}</th>)}</tr></thead>
            <tbody>
              {ent.data.map((row, i) => (
                <tr key={i}>{Object.keys(ent.data[0]).map((k) => <td key={k}>{formatCell(row[k])}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <div className="muted">No sample data for this entity.</div>}
    </>
  );
}
