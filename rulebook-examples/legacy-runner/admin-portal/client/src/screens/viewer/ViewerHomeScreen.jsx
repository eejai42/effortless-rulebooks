import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import ScreenHeader from "../../components/ScreenHeader.jsx";
import DomainSortBar from "../../components/DomainSortBar.jsx";
import { sortDomains, formatTimeSince } from "../../lib/timeSince.js";

const SORT_KEY = "erb.domainPickerSort";

export default function ViewerHomeScreen({ screen, projectRulebook, projects, me, reloadProjects }) {
  const navigate  = useNavigate();
  const role      = (projectRulebook?.UserRoles?.data || []).find((r) => r.RoleId === "role-viewer");
  useEffect(() => { reloadProjects?.(); }, [reloadProjects]);

  const [sortMode, setSortMode] = useState(
    () => localStorage.getItem(SORT_KEY) || "mtime-desc"
  );
  const onChangeSort = (m) => {
    setSortMode(m);
    try { localStorage.setItem(SORT_KEY, m); } catch { /* no-op */ }
  };
  const domains = sortDomains(projects?.projects || [], sortMode);

  return (
    <>
      <ScreenHeader screen={screen} />
      {role?.Tagline && (
        <div className="story-banner" style={{ borderLeftColor: role.ColorTheme }}>
          <b>{role.Name}:</b> {role.Tagline}
        </div>
      )}

      <h3 className="muted small" style={{ marginTop: 24 }}>READ A DOMAIN</h3>
      <DomainSortBar mode={sortMode} onChange={onChangeSort} />
      <div className="cards">
        {domains.map((d) => (
          <div
            key={d.id}
            className="card clickable domain-card"
            onClick={() => navigate(`/viewer/${d.id}`)}
          >
            {d.logoUrl && (
              <img
                src={d.logoUrl}
                alt=""
                className="domain-card-logo"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            )}
            <div className="domain-card-text">
              <h3 style={{ color: "#7280ad" }}>{d.id}</h3>
              <div className="big" style={{ fontSize: 16 }}>{d.name}</div>
              <div className="sub">{d.description || "—"}</div>
              <div className="sub" style={{ opacity: 0.6, fontSize: 12, marginTop: 4 }}>
                {formatTimeSince(d.lastModified)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <h3 className="muted small" style={{ marginTop: 32 }}>EXPLORE THE PLATFORM</h3>
      <div className="cards">
        <div className="card clickable" onClick={() => navigate("/viewer/features")}>
          <h3>Platform Features</h3>
          <div className="sub">What ERB can do</div>
        </div>
        <div className="card clickable" onClick={() => navigate("/viewer/flavors")}>
          <h3>Project Flavors</h3>
          <div className="sub">Demos by tag</div>
        </div>
        <div className="card clickable" onClick={() => navigate("/docs")}>
          <h3>Docs</h3>
          <div className="sub">Framing, methodology, field types</div>
        </div>
      </div>
    </>
  );
}
