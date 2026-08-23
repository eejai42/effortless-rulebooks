import { useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import { api } from "../lib/api.js";
import { toast } from "../lib/toast.js";

const ROLE_ICON = {
  "role-viewer":    "Eye",
  "role-developer": "Wrench",
  "role-admin":     "Shield",
};

const ROLE_LANDING = {
  "role-viewer":    "/viewer",
  "role-developer": "/developer",
  "role-admin":     "/admin",
};

export default function RolePickerScreen({ projectRulebook, reload, me }) {
  const navigate = useNavigate();
  const roles = (projectRulebook?.UserRoles?.data || []);

  const pick = async (role) => {
    // Find a user with this role (fake-login: dev only) and switch into them
    const users = await api.get("/api/users").catch(() => ({ users: [] }));
    const target = (users.users || []).find((u) => u.RoleId === role.RoleId);
    if (!target) {
      toast(`No demo user is assigned to ${role.Name}`, "error");
      return;
    }
    try {
      await api.post("/api/me/switch", { userId: target.UserId });
      localStorage.setItem("erb.role", role.RoleId);
      await reload();
      navigate(ROLE_LANDING[role.RoleId] || "/");
    } catch (e) {
      toast("Switch failed: " + e.message, "error");
    }
  };

  return (
    <div className="role-picker">
      <div className="rp-hero">
        <div className="rp-brand">ERB</div>
        <div className="rp-sub">Effortlessly Invariant Rulesbooks</div>
        <h1 className="rp-title">Who are you, today?</h1>
        <p className="rp-lede">Each role has its own workspace. Pick one to begin.</p>
      </div>
      <div className="rp-cards">
        {roles.map((r) => {
          const Icon = Icons[ROLE_ICON[r.RoleId]] || Icons.Circle;
          return (
            <button
              key={r.RoleId}
              className="rp-card"
              style={{ borderColor: r.ColorTheme || "#444" }}
              onClick={() => pick(r)}
            >
              <div className="rp-card-icon" style={{ background: r.ColorTheme }}>
                <Icon size={28} />
              </div>
              <div className="rp-card-name">{r.Name}</div>
              <div className="rp-card-tagline">{r.Tagline}</div>
              <div className="rp-card-desc">{r.Description}</div>
              <div className="rp-card-cta" style={{ color: r.ColorTheme }}>
                Enter as {r.Name} →
              </div>
            </button>
          );
        })}
      </div>
      <div className="rp-foot">
        {me?.UserId && <span>Currently signed in as <strong>{me.DisplayName}</strong> · </span>}
        <span className="muted">Roles come from <code>UserRoles</code> in the project rulebook.</span>
      </div>
    </div>
  );
}
