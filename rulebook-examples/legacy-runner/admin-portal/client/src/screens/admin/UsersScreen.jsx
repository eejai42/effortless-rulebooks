import { useState, useEffect } from "react";
import { api } from "../../lib/api.js";
import { toast } from "../../lib/toast.js";
import ScreenHeader from "../../components/ScreenHeader.jsx";
import InlineGrid from "../../components/InlineGrid.jsx";

export default function UsersScreen({ screen, me, reload }) {
  const canManage = me?.role?.CanManageUsers;
  const [data, setData] = useState({ users: [], roles: [] });

  const load = () => api.get("/api/users").then(setData);
  useEffect(() => { load(); }, []);

  const roleOptions = data.roles.map((r) => ({ value: r.RoleId, label: r.Name }));

  const cols = [
    { key: "UserId",      label: "User ID",      readOnly: true },
    { key: "Email",       label: "Email",        readOnly: !canManage },
    { key: "DisplayName", label: "Display Name", readOnly: !canManage },
    { key: "RoleId",      label: "Role",         readOnly: !canManage, options: roleOptions,
      render: (v) => {
        const r = data.roles.find((x) => x.RoleId === v);
        return r ? <span className="pill" style={{ background: r.ColorTheme || "#333", color: "#fff" }}>{r.Name}</span> : v;
      }},
    { key: "IsDefault",   label: "Default",      readOnly: true, render: (v) => v ? "✓" : "" },
    { key: "Notes",       label: "Notes",        readOnly: !canManage },
  ];

  const onSave = async (ri, col, value) => {
    const user = data.users[ri];
    // Only partial update supported via POST for now — show a toast for unsupported fields
    toast(`Updating ${col} on ${user.UserId}…`);
    // TODO: add PATCH /api/users/:id endpoint; for now re-fetch
    await load();
  };

  const onAdd = async (newRow) => {
    if (!newRow.UserId || !newRow.Email || !newRow.RoleId) {
      toast("UserId, Email and Role are required", "error"); return;
    }
    await api.post("/api/users", {
      userId: newRow.UserId, email: newRow.Email,
      displayName: newRow.DisplayName || newRow.Email, roleId: newRow.RoleId,
    });
    toast("User added (write-through)");
    await load(); reload?.();
  };

  return (
    <>
      <ScreenHeader screen={screen} />
      <InlineGrid
        cols={cols}
        rows={data.users}
        onSave={canManage ? onSave : null}
        onAdd={canManage ? onAdd : null}
        addDefaults={{ UserId: "", Email: "", DisplayName: "", RoleId: data.roles[0]?.RoleId || "", IsDefault: false, Notes: "" }}
      />
    </>
  );
}
