import { useNavigate, useParams } from "react-router-dom";
import ScreenHeader from "../../components/ScreenHeader.jsx";

export default function ViewerDomainOverviewScreen({ screen, rulebook, projects }) {
  const navigate = useNavigate();
  const { domain } = useParams();
  const dom = (projects?.projects || []).find((p) => p.id === domain);

  const tables = Object.keys(rulebook || {}).filter(
    (k) => !k.startsWith("$") && !k.startsWith("_") && rulebook[k]?.schema,
  );

  const counts = {
    Tables: tables.length,
    "Tests": (rulebook?.ConformanceTests?.data || []).length || "—",
  };

  const links = [
    { label: "Entities",      to: `/viewer/${domain}/entities` },
    { label: "Formulas",      to: `/viewer/${domain}/formulas` },
    { label: "Relationships", to: `/viewer/${domain}/relationships` },
    { label: "Sample Data",   to: `/viewer/${domain}/data` },
    { label: "Tests",         to: `/viewer/${domain}/tests` },
    { label: "Comments",      to: `/viewer/${domain}/comments` },
  ];

  return (
    <>
      <ScreenHeader screen={screen} />
      <div className="story-banner" style={{ borderLeftColor: "#7280ad", display: "flex", alignItems: "center", gap: 12 }}>
        {dom?.logoUrl && (
          <img
            src={dom.logoUrl}
            alt=""
            style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
          />
        )}
        <div>
          <b>{dom?.displayName || dom?.name || domain}</b> — {dom?.tagline || dom?.description || "read-only view"}
        </div>
      </div>

      <div className="cards">
        {Object.entries(counts).map(([k, v]) => (
          <div key={k} className="card">
            <h3>{k}</h3>
            <div className="big">{v}</div>
          </div>
        ))}
      </div>

      <h3 className="muted small" style={{ marginTop: 24 }}>BROWSE</h3>
      <div className="cards">
        {links.map((l) => (
          <div key={l.to} className="card clickable" onClick={() => navigate(l.to)}>
            <div className="big" style={{ fontSize: 16 }}>{l.label}</div>
          </div>
        ))}
      </div>
    </>
  );
}
