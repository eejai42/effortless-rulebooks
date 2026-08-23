import ScreenHeader from "../../components/ScreenHeader.jsx";

export default function PermissionsScreen({ screen, projectRulebook }) {
  const perms = projectRulebook?.AppPermissions?.data || [];
  const roles = projectRulebook?.UserRoles?.data || [];

  return (
    <>
      <ScreenHeader screen={screen || { Title: "Permissions", Story: "Resource / action / role permission matrix. Read-only — edit the project rulebook JSON directly to change permissions." }} />
      <table className="grid">
        <thead>
          <tr><th>Role</th><th>Resource</th><th>Action</th><th>Allow</th><th>RLS predicate</th></tr>
        </thead>
        <tbody>
          {perms.map((p, i) => {
            const role = roles.find((r) => r.RoleId === p.RoleId);
            return (
              <tr key={i}>
                <td>
                  {role
                    ? <span className="pill" style={{ background: role.ColorTheme || "#333", color: "#fff" }}>{role.Name}</span>
                    : p.RoleId}
                </td>
                <td className="mono">{p.Resource}</td>
                <td className="mono">{p.Action}</td>
                <td>{p.Allow ? <span className="pill good">allow</span> : <span className="pill warn">deny</span>}</td>
                <td className="mono muted small">{p.RlsPredicate || ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
