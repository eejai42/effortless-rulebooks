import { useState } from "react";
import { Outlet } from "react-router-dom";
import RoleTopBar from "./RoleTopBar.jsx";
import RoleSidebar from "./RoleSidebar.jsx";
import Toast from "../components/Toast.jsx";
import { usePortalCtx } from "../lib/portalContext.jsx";

const ACCENT = "#7280ad";

export default function ViewerLayout() {
  const { projectRulebook, projects, me, reload } = usePortalCtx();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="role-shell viewer-shell">
      <RoleTopBar
        mode="viewer"
        accent={ACCENT}
        label="Viewer"
        icon="Eye"
        domainOptional
        me={me}
        projects={projects}
        reload={reload}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />
      <div className="layout">
        <RoleSidebar
          area="viewer"
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
