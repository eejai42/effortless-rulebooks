import { Routes, Route, Navigate } from 'react-router-dom'
import { NavProvider, useNav } from './api/NavContext'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import GenericListPage from './pages/GenericListPage'
import GenericDetailPage from './pages/GenericDetailPage'
import DashboardPage from './pages/DashboardPage'
import CitationDetailPage from './pages/CitationDetailPage'
import ContestCitationPage from './pages/ContestCitationPage'
import PayCitationPage from './pages/PayCitationPage'

// Routes with a bespoke component instead of the generic list/detail pages.
const BESPOKE: Record<string, React.ComponentType> = {
  '/dashboard': DashboardPage,
  '/citations/:citationId': CitationDetailPage,
  '/citations/:citationId/contest': ContestCitationPage,
  '/citations/:citationId/pay': PayCitationPage,
}

function paramNameFromRoute(route: string): string | null {
  const seg = route.split('/').filter(Boolean).find((s) => s.startsWith(':'))
  return seg ? seg.slice(1) : null
}

function AppShell() {
  const { loading, error, tree, flat } = useNav()

  if (loading) {
    return (
      <div className="boot-loading">
        <div>Loading navigation…</div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="boot-error">
        <h1>Failed to load navigation</h1>
        <p>
          <code>GET /api/tables/PlatformNaviation</code> failed: {error}
        </p>
        <p className="muted">
          The app's router and sidebar are built entirely from this table — without it
          there is nothing to route to. Confirm the backend at
          {' '}<code>http://localhost:42451</code> is running and healthy.
        </p>
      </div>
    )
  }

  const firstTopRoute = tree.find((n) => n.nav_level === 'top')?.route ?? '/dashboard'

  return (
    <div className="shell">
      <Sidebar tree={tree} />
      <div className="main-col">
        <TopBar />
        <main className="content">
          <Routes>
            <Route path="/" element={<Navigate to={firstTopRoute} replace />} />
            {flat.map((navRow) => {
              if (!navRow.route) return null
              const Bespoke = BESPOKE[navRow.route]
              if (Bespoke) {
                return <Route key={navRow.route} path={navRow.route} element={<Bespoke />} />
              }
              const paramName = paramNameFromRoute(navRow.route)
              if (paramName && navRow.primary_table) {
                return (
                  <Route
                    key={navRow.route}
                    path={navRow.route}
                    element={<GenericDetailPage table={navRow.primary_table} paramName={paramName} />}
                  />
                )
              }
              if (navRow.primary_table) {
                return (
                  <Route
                    key={navRow.route}
                    path={navRow.route}
                    element={<GenericListPage table={navRow.primary_table} primaryView={navRow.primary_view ?? undefined} />}
                  />
                )
              }
              return null
            })}
            <Route
              path="*"
              element={
                <div className="page-error">
                  <h1>Not found</h1>
                  <p>No PlatformNaviation route matches this URL.</p>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <NavProvider>
      <AppShell />
    </NavProvider>
  )
}
