import { NavLink, Outlet, useLocation } from "react-router-dom";
import { fetchRows } from "./api.js";
import { useTables } from "./hooks.js";
import { Async } from "./components.jsx";

// Navigation is data: MobileNavTabs (groups) and MobileRoutes (routes) come from
// the rulebook through the generated views. The shell renders a top bar at desktop
// width and a bottom tab bar at phone width from the same rows.
export default function Shell() {
  const nav = useTables(["MobileNavTabs", "MobileRoutes"], async () => {
    const [tabs, routes] = await Promise.all([fetchRows("MobileNavTabs"), fetchRows("MobileRoutes")]);
    return {
      tabs: [...tabs].sort((a, b) => Number(a.sort_order) - Number(b.sort_order)),
      routes,
    };
  });
  const location = useLocation();

  return (
    <div className="shell">
      <header className="topbar">
        <NavLink to="/" className="brand">
          <span className="brand-mark">ERB</span>
          <span>Effortless Rulebooks</span>
        </NavLink>
        <Async state={nav} what="navigation">
          {({ tabs, routes }) => <NavGroups tabs={tabs} routes={routes} pathname={location.pathname} className="topnav" />}
        </Async>
      </header>

      <main className="content">
        <Outlet />
      </main>

      <footer className="footer">
        <span>
          Every fact on these pages is a column of a generated <code>vw_*</code> view. Nothing is
          recomputed here.
        </span>
        <span>
          <a href="http://localhost:42442" target="_blank" rel="noreferrer">
            Rulebook editor
          </a>
          {" · "}
          <a href="http://localhost:42441/api/docs" target="_blank" rel="noreferrer">
            API docs
          </a>
          {" · "}
          <a href="/generated/rulespeak/rulespeak.html" target="_blank" rel="noreferrer">
            RuleSpeak
          </a>
          {" · "}
          <a href="/generated/progress-report/progress-report.html" target="_blank" rel="noreferrer">
            Progress report
          </a>
        </span>
      </footer>

      {nav.status === "ready" && (
        <NavGroups tabs={nav.data.tabs} routes={nav.data.routes} pathname={location.pathname} className="tabbar" />
      )}
    </div>
  );
}

// A group is active when the current path is one of its routes (matching :params).
function routeMatches(path, pathname) {
  if (path === "/") return pathname === "/";
  const pattern = new RegExp("^" + path.replace(/:[^/]+/g, "[^/]+") + "/?$");
  return pattern.test(pathname);
}

function NavGroups({ tabs, routes, pathname, className }) {
  return (
    <nav className={className} aria-label="Primary">
      {tabs.map((tab) => {
        const own = routes.filter((r) => r.tab === tab.mobile_nav_tab_id);
        const active = own.some((r) => routeMatches(r.path, pathname));
        return (
          <NavLink
            key={tab.mobile_nav_tab_id}
            to={tab.root_path}
            className={() => (active ? "navlink active" : "navlink")}
            title={tab.purpose}
          >
            <Icon name={tab.icon} />
            <span>{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

// Minimal inline icons keyed by the lucide names modeled in MobileNavTabs.Icon.
function Icon({ name }) {
  const paths = {
    Home: "M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-6H9v6H5a2 2 0 0 1-2-2z",
    BookOpen: "M2 4h7a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H2zM22 4h-7a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h7z",
    FolderTree: "M3 3h6l2 2h4v5H3zM3 14h6l2 2h4v5H3zM15 8h6M15 19h6",
    Activity: "M22 12h-4l-3 9L9 3l-3 9H2",
    Wrench: "M14.7 6.3a4 4 0 0 0 5 5L22 9l-3-3-2.7 2.7-1.3-1.3L17.7 4.7l-3-3zM3 21l8.5-8.5",
  };
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name] || "M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20z"} />
    </svg>
  );
}
