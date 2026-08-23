import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ScreenHeader from "../../components/ScreenHeader.jsx";

export default function RolesScreen({ screen, projectRulebook, query }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const roles   = projectRulebook?.UserRoles?.data || [];
  const users   = projectRulebook?.AppUsers?.data || [];
  const screens = projectRulebook?.AppScreens?.data || [];
  const hints   = projectRulebook?.RoleScreenHints?.data || [];

  const [selectedId, setSelectedId] = useState(params.get("role") || roles[0]?.RoleId);
  useEffect(() => {
    const p = params.get("role");
    if (p) setSelectedId(p);
  }, [params]);

  const sel = roles.find((r) => r.RoleId === selectedId) || roles[0];
  const usersForRole = users.filter((u) => u.RoleId === sel?.RoleId);
  const hintsForRole = hints.filter((h) => h.RoleId === sel?.RoleId);
  const landing = screens.find((s) => s.ScreenId === sel?.LandingScreenId);

  return (
    <>
      <ScreenHeader screen={screen} />
      <div className="split">
        <div className="list-panel">
          {roles.map((r) => (
            <div key={r.RoleId}
                 className={`list-item ${r.RoleId === sel?.RoleId ? "active" : ""}`}
                 onClick={() => { setSelectedId(r.RoleId); navigate(`/admin/users/roles?role=${encodeURIComponent(r.RoleId)}`); }}>
              <div className="name">
                <span className="pill" style={{ background: r.ColorTheme || "#333", color: "#fff" }}>{r.Name}</span>
              </div>
              <div className="meta">{r.Persona || ""}</div>
            </div>
          ))}
        </div>
        <div className="detail-panel">
          {sel ? (
            <>
              <h3 style={{ marginTop: 0 }}>
                <span className="pill" style={{ background: sel.ColorTheme || "#333", color: "#fff" }}>{sel.Name}</span>
              </h3>
              {sel.Tagline && <div className="story-banner" style={{ borderLeftColor: sel.ColorTheme || "#888" }}>{sel.Tagline}</div>}
              <div className="kv">
                <div className="k">Persona</div>          <div className="v">{sel.Persona || "—"}</div>
                <div className="k">Primary concerns</div> <div className="v">{sel.PrimaryConcerns || "—"}</div>
                <div className="k">Access level</div>     <div className="v"><span className="pill">{sel.AccessLevel}</span></div>
                <div className="k">Lands on</div>         <div className="v">
                  {landing
                    ? <span className="clickable" onClick={() => navigate(landing.Path)}>{landing.Title}</span>
                    : "—"}
                </div>
                <div className="k">Capabilities</div>     <div className="v">
                  {sel.CanEditRulebook    && <span className="pill good" style={{ marginRight: 4 }}>edit rulebook</span>}
                  {sel.CanRunBuilds       && <span className="pill good" style={{ marginRight: 4 }}>run builds</span>}
                  {sel.CanManageUsers     && <span className="pill good" style={{ marginRight: 4 }}>manage users</span>}
                  {sel.CanAccessTechTools && <span className="pill good" style={{ marginRight: 4 }}>tech tools</span>}
                  {sel.CanSwitchProjects  && <span className="pill" style={{ marginRight: 4 }}>switch projects</span>}
                </div>
              </div>
              <p style={{ marginTop: 14 }}>{sel.Description}</p>

              <h4>Users with this role ({usersForRole.length})</h4>
              {usersForRole.length ? (
                <ul>
                  {usersForRole.map((u) => (
                    <li key={u.UserId} className="clickable"
                        onClick={() => navigate(`/admin/users?user=${encodeURIComponent(u.UserId)}`)}>
                      {u.DisplayName} ({u.Email}){u.IsDefault ? " — default" : ""}
                    </li>
                  ))}
                </ul>
              ) : <div className="muted">No users assigned.</div>}

              {hintsForRole.length > 0 && (
                <>
                  <h4>Bespoke screen hints</h4>
                  <table className="grid">
                    <thead><tr><th>screen</th><th>emphasis</th><th>primary actions</th><th>hints</th></tr></thead>
                    <tbody>
                      {hintsForRole.map((h) => {
                        const sc = screens.find((s) => s.ScreenId === h.ScreenId);
                        return (
                          <tr key={h.HintId}>
                            <td className="clickable" onClick={() => sc && navigate(sc.Path)}>{sc?.Title || h.ScreenId}</td>
                            <td>{h.Emphasis}</td>
                            <td>{h.PrimaryActions || "—"}</td>
                            <td style={{ maxWidth: 400 }}>{h.ImplementationHints}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </>
              )}
            </>
          ) : <div className="muted">No role selected.</div>}
        </div>
      </div>
    </>
  );
}
