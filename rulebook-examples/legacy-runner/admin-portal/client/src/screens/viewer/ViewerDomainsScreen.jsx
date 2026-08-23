import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ScreenHeader from "../../components/ScreenHeader.jsx";
import DomainSortBar from "../../components/DomainSortBar.jsx";
import { sortDomains, formatTimeSince } from "../../lib/timeSince.js";

const SORT_KEY = "erb.domainPickerSort";

export default function ViewerDomainsScreen({ screen, projects, reloadProjects }) {
  const navigate = useNavigate();
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
    </>
  );
}
