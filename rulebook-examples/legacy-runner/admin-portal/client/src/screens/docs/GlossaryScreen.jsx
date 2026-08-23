import { useState } from "react";
import ScreenHeader from "../../components/ScreenHeader.jsx";

export default function GlossaryScreen({ screen, projectRulebook }) {
  const glossary = projectRulebook?.Glossary?.data || [];
  const [search, setSearch] = useState("");

  const filtered = glossary.filter((g) =>
    !search || g.Term?.toLowerCase().includes(search.toLowerCase()) || g.Definition?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <ScreenHeader screen={screen || { Title: "Glossary", Story: "Term definitions used consistently across the rulebook and documentation." }} />
      <div style={{ marginBottom: 12 }}>
        <input placeholder="Search terms…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 300 }} />
      </div>
      {filtered.length === 0 ? (
        <p className="muted">{glossary.length === 0 ? "No Glossary table found in this rulebook." : "No matches."}</p>
      ) : (
        <table className="grid">
          <thead><tr><th>Term</th><th>Definition</th><th>Category</th></tr></thead>
          <tbody>
            {filtered.map((g, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{g.Term}</td>
                <td>{g.Definition}</td>
                <td><span className="tag">{g.Category || ""}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
