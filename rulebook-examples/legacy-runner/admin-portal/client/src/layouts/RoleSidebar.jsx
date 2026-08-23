import { useLocation, useNavigate, useParams } from "react-router-dom";
import * as Icons from "lucide-react";
import { useState } from "react";
import { usePortalCtx } from "../lib/portalContext.jsx";

function NavIcon({ name }) {
  const I = Icons[name] || Icons.Circle;
  return <I size={15} />;
}

function resolvePath(template, params) {
  if (!template) return null;
  let unresolved = false;
  const out = template.replace(/:(\w+)/g, (_, k) => {
    if (params[k] == null) { unresolved = true; return ":" + k; }
    return encodeURIComponent(params[k]);
  });
  return unresolved ? null : out;
}

// Shared sidebar primitive. `area` is the NavArea the layout owns
// (viewer | developer | admin). Docs is always appended at the bottom.
//
// Role-based hiding intentionally disabled — see CLAUDE.md notes from the
// "Developer role required" pass. The UI shows everything; the server no
// longer refuses on role.
export default function RoleSidebar({ area, accent, projectRulebook, me, mobileOpen, onCloseMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const params   = useParams();
  const [collapsed, setCollapsed] = useState({});

  const { projects } = usePortalCtx();
  const activeDomain  = params.domain || null;
  const activeProject = (projects?.projects || []).find((p) => p.id === activeDomain) || null;

  // Resolve :domain even when the URL doesn't have it yet, so the "current
  // domain" group always renders with working links. Other route params still
  // come from `useParams`.
  const resolveParams = { ...params, domain: params.domain || activeDomain };

  const nav     = (projectRulebook?.AppNavigation?.data || []).slice().sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0));
  const screens = projectRulebook?.AppScreens?.data || [];

  const screenPath = (sid) => screens.find((s) => s.ScreenId === sid)?.Path || null;

  const owned = nav.filter((n) => n.NavArea === area);
  const docs  = nav.filter((n) => n.NavArea === "docs");

  const renderSection = (items) => {
    const top = items.filter((n) => !n.ParentNavId);
    return top.map((n) => {
      const template = n.ScreenId ? screenPath(n.ScreenId) : null;
      const target   = resolvePath(template, resolveParams);

      const kids = items.filter((c) => c.ParentNavId === n.NavId);
      const isGroup = !n.ScreenId && kids.length > 0;

      // "Current Domain" group: substitute the live domain name when we have
      // one. Falls back to the rulebook-supplied label when no domain is
      // active yet.
      const isCurrentDomainGroup = isGroup && /current domain/i.test(n.Label || "");
      const groupLabel = isCurrentDomainGroup && activeProject
        ? (activeProject.displayName || activeProject.name || activeDomain)
        : n.Label;

      const isCollapsed = collapsed[n.NavId];
      const isActive = template && location.pathname === target;

      const goto = (p) => {
        if (!p) return;
        navigate(p);
        onCloseMobile && onCloseMobile();
      };

      return (
        <div key={n.NavId}>
          <div
            className={`nav-item ${isActive ? "active" : ""} ${isGroup ? "group-header" : ""}`}
            onClick={() => {
              if (isGroup) setCollapsed({ ...collapsed, [n.NavId]: !isCollapsed });
              else goto(target);
            }}
          >
            <NavIcon name={n.Icon || "Circle"} />
            <span>{groupLabel}</span>
            {isGroup && (
              <span style={{ marginLeft: "auto", color: "var(--muted)" }}>
                {isCollapsed ? "▸" : "▾"}
              </span>
            )}
          </div>
          {isGroup && !isCollapsed && kids.map((c) => {
            const cTpl  = screenPath(c.ScreenId);
            const cPath = resolvePath(cTpl, resolveParams);
            const cActive = cPath && location.pathname === cPath;
            return (
              <div
                key={c.NavId}
                className={`nav-item child ${cActive ? "active" : ""} ${cPath ? "" : "disabled"}`}
                onClick={() => goto(cPath)}
              >
                <NavIcon name={c.Icon || "Circle"} />
                <span>{c.Label}</span>
              </div>
            );
          })}
        </div>
      );
    });
  };

  const logoUrl = activeProject?.logoUrl || null;
  const logoLabel = activeProject?.displayName || activeProject?.name || activeDomain || "";

  return (
    <>
      <div className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-area-strip" style={{ background: accent }} />

        <div className="sidebar-owned">
          {renderSection(owned)}
        </div>

        {activeProject && (
          <div className="sidebar-domain-card" title={logoLabel}>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt=""
                className="sidebar-domain-card-logo"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            ) : (
              <span className="sidebar-domain-card-logo placeholder">
                <Icons.Box size={28} />
              </span>
            )}
            <span className="sidebar-domain-card-label">{logoLabel}</span>
          </div>
        )}

        <div className="sidebar-bottom">
          {docs.length > 0 && (
            <>
              <div className="sidebar-divider">Reference</div>
              {renderSection(docs)}
            </>
          )}
          <div className="sidebar-footer">
            <span className="muted">rulebook is HEAD</span>
          </div>
        </div>
      </div>
      {mobileOpen && <div className="sidebar-scrim" onClick={onCloseMobile} />}
    </>
  );
}
