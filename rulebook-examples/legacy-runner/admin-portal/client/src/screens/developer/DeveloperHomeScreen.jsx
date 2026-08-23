import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ScreenHeader from "../../components/ScreenHeader.jsx";
import DomainTile from "../../components/DomainTile.jsx";
import DomainSortBar from "../../components/DomainSortBar.jsx";
import PickerChips from "../../components/PickerChips.jsx";
import { sortDomains, formatTimeSince } from "../../lib/timeSince.js";

const SORT_KEY = "erb.domainPickerSort";

export default function DeveloperHomeScreen({ screen, projects, projectRulebook, domainState, reloadProjects }) {
  const navigate = useNavigate();
  const role     = (projectRulebook?.UserRoles?.data || []).find((r) => r.RoleId === "role-developer");

  // Refetch /api/projects on mount so a domain we just opened (and whose
  // folder we just touched) shows up at the top in "recently opened" sort.
  useEffect(() => { reloadProjects?.(); }, [reloadProjects]);

  const allDomains = (projects?.projects || []).filter((d) => d.id !== "__top__");
  const platform   = (projects?.projects || []).find((d) => d.id === "__top__");

  const [sortMode, setSortMode] = useState(
    () => localStorage.getItem(SORT_KEY) || "mtime-desc"
  );
  const onChangeSort = (m) => {
    setSortMode(m);
    try { localStorage.setItem(SORT_KEY, m); } catch { /* no-op */ }
  };
  const domains = sortDomains(allDomains, sortMode);

  return (
    <>
      <ScreenHeader screen={screen} />
      {role?.Tagline && (
        <div className="story-banner" style={{ borderLeftColor: role.ColorTheme }}>
          <b>{role.Name}:</b> {role.Tagline}
        </div>
      )}

      <PickerChips domainState={domainState} domains={domains} areaPath="/developer" />

      <h3 className="muted small" style={{ marginTop: 24 }}>PICK A DOMAIN TO WORK ON</h3>
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

      {platform && (
        <>
          <h3 className="muted small" style={{ marginTop: 32 }}>OR EDIT THE PLATFORM</h3>
          <div className="domain-gallery">
            <DomainTile
              d={platform}
              sinceLabel={formatTimeSince(platform.lastModified)}
              accentColor="#6ea8fe"
              onClick={() => navigate(`/developer/${platform.id}`)}
            />
          </div>
        </>
      )}
    </>
  );
}
