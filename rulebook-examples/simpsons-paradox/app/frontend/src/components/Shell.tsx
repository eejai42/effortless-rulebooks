import { NavLink, Outlet } from 'react-router-dom';
import { DagToggle } from '../explainer-bridge';
import { DownloadMenu } from './DownloadMenu';
import './Shell.css';
import './DownloadMenu.css';

export function Shell() {
  return (
    <div className="shell">
      <nav className="sidebar">
        <div className="sidebar-title">
          <span className="sidebar-logo">∫</span>
          Simpson's Paradox
        </div>
        <NavLink to="/discovery" className={({ isActive }) => isActive ? 'nav-item nav-item-priority active' : 'nav-item nav-item-priority'}>
          Discovery Research
        </NavLink>
        <NavLink to="/conclusions" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Conclusions &amp; Findings
        </NavLink>
        <NavLink to="/overview" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Study Overview
        </NavLink>
        <NavLink to="/stratum" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Stratum Breakdown
        </NavLink>
        <NavLink to="/weights" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Allocation Weights
        </NavLink>
        <NavLink to="/sandbox" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Interactive Sandbox
        </NavLink>
        <NavLink to="/model" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Model Summary
        </NavLink>
        <NavLink to="/sweep" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Allocation Sweep
        </NavLink>
        <NavLink to="/phase" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Phase Diagram
        </NavLink>
        <NavLink to="/catalog" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Import Backlog
        </NavLink>
        <NavLink to="/instrument" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Instrument Dashboard
        </NavLink>
        <NavLink to="/loops" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Effortless Loops
        </NavLink>
      </nav>
      <div className="main-column">
        <header className="app-topbar">
          <DownloadMenu />
          <DagToggle />
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
