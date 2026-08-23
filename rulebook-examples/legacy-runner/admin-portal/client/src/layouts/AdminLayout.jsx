import { useState } from "react";
import { Outlet } from "react-router-dom";
import RoleTopBar from "./RoleTopBar.jsx";
import RoleSidebar from "./RoleSidebar.jsx";
import Toast from "../components/Toast.jsx";
import { usePortalCtx } from "../lib/portalContext.jsx";

const ACCENT = "#f3b03e";

export default function AdminLayout() {
  const { projectRulebook, projects, me, reload } = usePortalCtx();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="role-shell admin-shell">
      <RoleTopBar
        mode="admin"
        accent={ACCENT}
        label="Admin"
        icon="Shield"
        me={me}
        projects={projects}
        reload={reload}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />
      <div className="layout">
        <RoleSidebar
          area="admin"
          accent={ACCENT}
          projectRulebook={projectRulebook}
          me={me}
          mobileOpen={sidebarOpen}
          onCloseMobile={() => setSidebarOpen(false)}
        />
        <div className="main">
          <Outlet />
        </div>
      </div>
      <Toast />
    </div>
  );
}
