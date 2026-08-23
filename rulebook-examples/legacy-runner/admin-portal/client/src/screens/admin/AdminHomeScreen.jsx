import { useNavigate } from "react-router-dom";
import ScreenHeader from "../../components/ScreenHeader.jsx";

export default function AdminHomeScreen({ screen, projectRulebook, projects }) {
  const navigate = useNavigate();
  const users   = projectRulebook?.AppUsers?.data || [];
  const roles   = projectRulebook?.UserRoles?.data || [];
  const perms   = projectRulebook?.AppPermissions?.data || [];
  const screens = projectRulebook?.AppScreens?.data || [];
  const navigation = projectRulebook?.AppNavigation?.data || [];
  const domains = projects?.projects || [];

  const platformCards = [
    { label: "Users",        count: users.length,      to: "/admin/users" },
    { label: "Roles",        count: roles.length,      to: "/admin/roles" },
    { label: "Permissions",  count: perms.length,      to: "/admin/permissions" },
    { label: "Screens",      count: screens.length,    to: "/admin/screens" },
    { label: "Nav items",    count: navigation.length, to: "/admin/nav" },
    { label: "Domains",      count: domains.length,    to: "/admin/builds" },
  ];

  return (
    <>
      <ScreenHeader screen={screen} />
      <div className="story-banner" style={{ borderLeftColor: "#f3b03e" }}>
        Platform configuration and devops. <span className="muted">No domain context — admin is platform-wide.</span>
      </div>

      <h3 className="muted small" style={{ marginTop: 24 }}>PLATFORM CONFIG</h3>
      <div className="cards">
        {platformCards.map((c) => (
          <div key={c.label} className="card clickable" onClick={() => navigate(c.to)}>
            <h3>{c.label}</h3>
            <div className="big">{c.count}</div>
          </div>
        ))}
      </div>

      <h3 className="muted small" style={{ marginTop: 32 }}>DEVOPS</h3>
      <div className="cards">
        <div className="card clickable" onClick={() => navigate("/admin/builds")}>
          <h3>Builds</h3>
          <div className="sub">Cross-domain build status</div>
        </div>
        <div className="card clickable" onClick={() => navigate("/admin/proxy")}>
          <h3>Proxy</h3>
          <div className="sub">ssotme-proxy on :4242</div>
        </div>
      </div>
    </>
  );
}
