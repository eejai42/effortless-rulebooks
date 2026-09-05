import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './components/DownloadMenu.css';
import { Shell } from './components/Shell';
import { OverviewView } from './views/OverviewView';
import { StratumView } from './views/StratumView';
import { WeightsView } from './views/WeightsView';
import { SandboxView } from './views/SandboxView';
import { ModelSummaryView } from './views/ModelSummaryView';
import { AllocationSweepView } from './views/AllocationSweepView';
import { PhaseDiagramView } from './views/PhaseDiagramView';
import { ImportCatalogView } from './views/ImportCatalogView';
import { InstrumentDashboardView } from './views/InstrumentDashboardView';
import { ConclusionsAdminView } from './views/ConclusionsAdminView';
import { DiscoveryView } from './views/DiscoveryView';
import { EffortlessLoopsView } from './views/EffortlessLoopsView';
import {
  DagFieldPage,
  DagIndexPage,
  DagShell,
  DagTablePage,
  DagToggle,
  ExplainerEnhance,
  RouteDagScan,
  useExplainerRouting,
} from './explainer-bridge';

function AppRoutes() {
  const { pathname } = useLocation();
  useExplainerRouting();
  return (
    <>
      <ExplainerEnhance />
      <RouteDagScan pathname={pathname} />
      <Routes>
        <Route path="/" element={<Shell />}>
          <Route index element={<Navigate to="/overview" replace />} />
          <Route path="conclusions" element={<ConclusionsAdminView />} />
          <Route path="discovery" element={<DiscoveryView />} />
          <Route path="overview" element={<OverviewView />} />
          <Route path="stratum" element={<StratumView />} />
          <Route path="weights" element={<WeightsView />} />
          <Route path="sandbox" element={<SandboxView />} />
          <Route path="model" element={<ModelSummaryView />} />
          <Route path="sweep" element={<AllocationSweepView />} />
          <Route path="phase" element={<PhaseDiagramView />} />
          <Route path="instrument" element={<InstrumentDashboardView />} />
          <Route path="loops" element={<EffortlessLoopsView />} />
          <Route path="catalog" element={<ImportCatalogView />} />
        </Route>
        <Route path="/dag" element={<DagShell />}>
          <Route index element={<DagIndexPage />} />
          <Route path=":table" element={<DagTablePage />} />
          <Route path=":table/:field" element={<DagFieldPage />} />
        </Route>
      </Routes>
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
