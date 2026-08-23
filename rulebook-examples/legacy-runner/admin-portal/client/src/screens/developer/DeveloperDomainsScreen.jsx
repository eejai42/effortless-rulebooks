import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ScreenHeader from "../../components/ScreenHeader.jsx";
import DomainTile from "../../components/DomainTile.jsx";
import DomainSortBar from "../../components/DomainSortBar.jsx";
import { sortDomains, formatTimeSince } from "../../lib/timeSince.js";

const SORT_KEY = "erb.domainPickerSort";

export default function DeveloperDomainsScreen({ screen, projects, reloadProjects }) {
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
      <div className="domain-gallery">
        {domains.map((d) => (
          <DomainTile
            key={d.id}
            d={d}
            sinceLabel={formatTimeSince(d.lastModified)}
            accentColor="#b48cff"
            onClick={() => navigate(`/developer/${d.id}`)}
          />
        ))}
      </div>
    </>
  );
}
