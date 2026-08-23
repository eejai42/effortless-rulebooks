import { useNavigate } from "react-router-dom";
import ScreenHeader from "../../components/ScreenHeader.jsx";
import { AREAS } from "../../lib/nav.js";

export default function ScreensAdminScreen({ screen, projectRulebook }) {
  const navigate = useNavigate();
  const screens = projectRulebook?.AppScreens?.data || [];

  return (
    <>
      <ScreenHeader screen={screen || { Title: "Screens", Story: "All screen definitions from the project rulebook." }} />
      <table className="grid">
        <thead>
          <tr><th>ScreenId</th><th>Area</th><th>Title</th><th>Path</th><th>Layout</th><th>MinRole</th></tr>
        </thead>
        <tbody>
          {screens.map((s) => {
            const areaMeta = AREAS[s.NavArea] || {};
            return (
              <tr key={s.ScreenId} className="clickable" onClick={() => navigate(s.Path)}>
                <td className="mono">{s.ScreenId}</td>
                <td>
                  <span className="pill" style={{ background: areaMeta.color || "#333", color: "#0a0f1c" }}>
                    {s.NavArea || "main"}
                  </span>
                </td>
                <td>{s.Title}</td>
                <td className="mono">{s.Path}</td>
                <td><span className="tag">{s.Layout}</span></td>
                <td className="mono muted small">{s.MinRoleId || ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
