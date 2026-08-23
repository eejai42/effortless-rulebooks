import { HashRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { usePortal } from "./hooks/usePortal.js";
import { PortalContext } from "./lib/portalContext.jsx";
import S from "./lib/screenHost.jsx";
import CommandPalette from "./components/CommandPalette.jsx";

import RolePickerScreen from "./screens/RolePickerScreen.jsx";
import ViewerLayout    from "./layouts/ViewerLayout.jsx";
import DeveloperLayout from "./layouts/DeveloperLayout.jsx";
import AdminLayout     from "./layouts/AdminLayout.jsx";

// Viewer screens
import ViewerHomeScreen           from "./screens/viewer/ViewerHomeScreen.jsx";
import ViewerDomainsScreen        from "./screens/viewer/ViewerDomainsScreen.jsx";
import ViewerDomainOverviewScreen from "./screens/viewer/ViewerDomainOverviewScreen.jsx";
import ViewerCommentsScreen       from "./screens/viewer/ViewerCommentsScreen.jsx";

// Developer screens (existing + new)
import DeveloperHomeScreen    from "./screens/developer/DeveloperHomeScreen.jsx";
import DeveloperDomainsScreen from "./screens/developer/DeveloperDomainsScreen.jsx";
import DeveloperDomainScreen  from "./screens/developer/DeveloperDomainScreen.jsx";
import ExplorerScreen         from "./screens/developer/ExplorerScreen.jsx";
import EntitiesScreen         from "./screens/developer/EntitiesScreen.jsx";
import FormulasScreen         from "./screens/developer/FormulasScreen.jsx";
import RelationshipsScreen    from "./screens/developer/RelationshipsScreen.jsx";
import SampleDataScreen       from "./screens/developer/SampleDataScreen.jsx";
import SubstratesScreen       from "./screens/developer/SubstratesScreen.jsx";
import TestsScreen            from "./screens/developer/TestsScreen.jsx";
import SpokesScreen           from "./screens/developer/SpokesScreen.jsx";
import { TechFilesScreen, TechJsonScreen, TechResetScreen, TechProxyScreen }
  from "./screens/developer/TechScreens.jsx";

// Admin screens
import AdminHomeScreen     from "./screens/admin/AdminHomeScreen.jsx";
import AdminBuildsScreen   from "./screens/admin/AdminBuildsScreen.jsx";
import UsersScreen         from "./screens/admin/UsersScreen.jsx";
import RolesScreen         from "./screens/admin/RolesScreen.jsx";
import PermissionsScreen   from "./screens/admin/PermissionsScreen.jsx";
import NavigationScreen    from "./screens/admin/NavigationScreen.jsx";
import ScreensAdminScreen  from "./screens/admin/ScreensAdminScreen.jsx";

// Reused for viewer-side flavours + features
import FlavorsScreen   from "./screens/main/FlavorsScreen.jsx";
import FeaturesScreen  from "./screens/main/FeaturesScreen.jsx";

// Docs
import DocsHomeScreen    from "./screens/docs/DocsHomeScreen.jsx";
import FramingScreen     from "./screens/docs/FramingScreen.jsx";
import MethodologyScreen from "./screens/docs/MethodologyScreen.jsx";
import FieldTypesScreen  from "./screens/docs/FieldTypesScreen.jsx";
import GlossaryScreen    from "./screens/docs/GlossaryScreen.jsx";

const PORTAL_REQUIRED = ["UserRoles", "AppUsers", "AppPermissions", "AppNavigation", "AppScreens"];

function PortalSetupNeeded({ projectRulebook, reload }) {
  const missing = PORTAL_REQUIRED.filter(
    (t) => !projectRulebook?.[t] || !Array.isArray(projectRulebook[t].data) || !projectRulebook[t].data.length
  );
  return (
    <div style={{ padding: 32, maxWidth: 820, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1 style={{ marginTop: 0 }}>⚠ ERB Admin Portal — setup needed</h1>
      <p>The portal requires portal-config tables in the <strong>PROJECT</strong> rulebook. Missing:</p>
      <ul>{missing.map((t) => <li key={t}><code>{t}</code></li>)}</ul>
      <button onClick={reload}>↻ Reload</button>
    </div>
  );
}

// Per DOMAIN_UX_VISION.md §2.4 — /entities and /data collapse into /explorer.
// Keep them as redirects so existing deep links (Cmd-K matches, bookmarks,
// reception-desk row clicks from before the §2.6 fix) still resolve.
function RedirectToExplorer() {
  const { domain } = useParams();
  return <Navigate to={`/developer/${domain}/explorer`} replace />;
}

function DocsRoutes() {
  return (
    <Routes>
      <Route path="/"               element={<S comp={DocsHomeScreen} />} />
      <Route path="/framing"        element={<S comp={FramingScreen} />} />
      <Route path="/methodology"    element={<S comp={MethodologyScreen} />} />
      <Route path="/field-types"    element={<S comp={FieldTypesScreen} />} />
      <Route path="/glossary"       element={<S comp={GlossaryScreen} />} />
    </Routes>
  );
}

// Picks the layout that matches the current user's role. Used by /docs/*
// so a developer clicking a Reference link doesn't get swapped into viewer
// chrome (which is why the sidebar appeared to "flicker" mid-session).
function CurrentRoleLayout({ projectRulebook, me }) {
  const role = (projectRulebook?.UserRoles?.data || []).find((r) => r.RoleId === me?.RoleId);
  if (role?.AccessLevel === "full-admin") return <AdminLayout />;
  if (role?.CanEditRulebook)              return <DeveloperLayout />;
  return <ViewerLayout />;
}

function Portal() {
  const portal = usePortal();
  const { me, projectRulebook } = portal;

  if (!projectRulebook || !me) {
    return <div style={{ padding: 30 }}>Loading ERB Admin Portal…</div>;
  }

  const broken = PORTAL_REQUIRED.some(
    (t) => !projectRulebook[t] || !Array.isArray(projectRulebook[t].data) || !projectRulebook[t].data.length
  );
  if (broken || me.error) {
    return <PortalSetupNeeded projectRulebook={projectRulebook} reload={portal.reload} />;
  }

  return (
    <PortalContext.Provider value={portal}>
      <CommandPalette rulebook={null} projects={portal.projects} activeDomain={null} />
      <Routes>
        {/* Root: role picker */}
        <Route path="/" element={<RolePickerScreen {...portal} />} />

        {/* Viewer tree */}
        <Route path="/viewer" element={<ViewerLayout />}>
          <Route index                           element={<S comp={ViewerHomeScreen} />} />
          <Route path="domains"                  element={<S comp={ViewerDomainsScreen} />} />
          <Route path="flavors"                  element={<S comp={FlavorsScreen} />} />
          <Route path="features"                 element={<S comp={FeaturesScreen} />} />
          <Route path=":domain"                  element={<S comp={ViewerDomainOverviewScreen} />} />
          <Route path=":domain/entities"         element={<S comp={EntitiesScreen} readOnly />} />
          <Route path=":domain/formulas"         element={<S comp={FormulasScreen} readOnly />} />
          <Route path=":domain/relationships"    element={<S comp={RelationshipsScreen} readOnly />} />
          <Route path=":domain/data"             element={<S comp={SampleDataScreen} readOnly />} />
          <Route path=":domain/tests"            element={<S comp={TestsScreen} readOnly />} />
          <Route path=":domain/comments"         element={<S comp={ViewerCommentsScreen} />} />
        </Route>

        {/* Developer tree — :domain required for most pages */}
        <Route path="/developer" element={<DeveloperLayout />}>
          <Route index                           element={<S comp={DeveloperHomeScreen} />} />
          <Route path="domains"                  element={<S comp={DeveloperDomainsScreen} />} />
          <Route path=":domain"                  element={<S comp={DeveloperDomainScreen} />} />
          <Route path=":domain/entities"         element={<RedirectToExplorer />} />
          <Route path=":domain/formulas"         element={<S comp={FormulasScreen} />} />
          <Route path=":domain/relationships"    element={<S comp={RelationshipsScreen} />} />
          <Route path=":domain/data"             element={<RedirectToExplorer />} />
          <Route path=":domain/substrates"       element={<S comp={SubstratesScreen} />} />
          <Route path=":domain/tests"            element={<S comp={TestsScreen} />} />
          <Route path=":domain/spokes"           element={<S comp={SpokesScreen} />} />
          <Route path=":domain/files"            element={<S comp={TechFilesScreen} />} />
          <Route path=":domain/explorer/*"       element={<S comp={ExplorerScreen} />} />
          <Route path=":domain/rulebook-json"    element={<S comp={TechJsonScreen} />} />
          <Route path=":domain/reset"            element={<S comp={TechResetScreen} />} />
        </Route>

        {/* Admin tree — no :domain ever */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index                  element={<S comp={AdminHomeScreen} />} />
          <Route path="users"           element={<S comp={UsersScreen} />} />
          <Route path="roles"           element={<S comp={RolesScreen} />} />
          <Route path="permissions"     element={<S comp={PermissionsScreen} />} />
          <Route path="nav"             element={<S comp={NavigationScreen} />} />
          <Route path="screens"         element={<S comp={ScreensAdminScreen} />} />
          <Route path="builds"          element={<S comp={AdminBuildsScreen} />} />
          <Route path="proxy"           element={<S comp={TechProxyScreen} />} />
        </Route>

        {/* Shared docs — rendered inside whichever layout matches the user's
            role so the sidebar doesn't flip to viewer chrome mid-session. */}
        <Route path="/docs/*" element={<CurrentRoleLayout projectRulebook={projectRulebook} me={me} />}>
          <Route index                   element={<S comp={DocsHomeScreen} />} />
          <Route path="framing"          element={<S comp={FramingScreen} />} />
          <Route path="methodology"      element={<S comp={MethodologyScreen} />} />
          <Route path="field-types"      element={<S comp={FieldTypesScreen} />} />
          <Route path="glossary"         element={<S comp={GlossaryScreen} />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PortalContext.Provider>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Portal />
    </HashRouter>
  );
}
