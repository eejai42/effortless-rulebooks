import ScreenHeader from "../../components/ScreenHeader.jsx";
import { AREAS } from "../../lib/nav.js";

export default function NavigationScreen({ screen, projectRulebook }) {
  const nav     = (projectRulebook?.AppNavigation?.data || []).slice().sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0));
  const screens = projectRulebook?.AppScreens?.data || [];

  return (
    <>
      <ScreenHeader screen={screen || { Title: "Navigation", Story: "All sidebar nav items defined in the rulebook. NavArea determines which section they appear in." }} />
      <table className="grid">
        <thead>
          <tr><th>NavId</th><th>Area</th><th>Label</th><th>Icon</th><th>Parent</th><th>Screen → Path</th><th>MinRole</th><th>Order</th></tr>
        </thead>
        <tbody>
          {nav.map((n) => {
            const sc = screens.find((s) => s.ScreenId === n.ScreenId);
            const areaMeta = AREAS[n.NavArea] || {};
            return (
              <tr key={n.NavId}>
                <td className="mono">{n.NavId}</td>
                <td>
                  <span className="pill" style={{ background: areaMeta.color || "#333", color: "#0a0f1c" }}>
                    {n.NavArea || "main"}
                  </span>
                </td>
                <td>{n.Label}</td>
                <td className="mono">{n.Icon || ""}</td>
                <td className="mono muted">{n.ParentNavId || ""}</td>
                <td className="mono">{sc ? sc.Path : <span className="muted">—</span>}</td>
                <td className="mono muted small">{n.MinRoleId || ""}</td>
                <td>{n.Order}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
