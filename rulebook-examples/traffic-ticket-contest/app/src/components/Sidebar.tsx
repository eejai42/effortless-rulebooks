import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import type { NavNode } from '../api/nav'
import Icon from './Icon'

// Only top-level items and their direct `sub` children render in the sidebar.
// Deeper nesting (e.g. citations.contest under citations.detail, or
// admin.feature-detail under admin.features) is still registered as routes —
// those are action/detail pages reached by clicking a row, not sidebar links.
function isSidebarVisible(node: NavNode): boolean {
  return node.nav_level === 'top' || node.nav_level === 'sub'
}

function SidebarSection({ node }: { node: NavNode }) {
  const [open, setOpen] = useState(true)
  const subChildren = node.children.filter((c) => c.nav_level === 'sub')
  const hasChildren = subChildren.length > 0

  return (
    <div className="nav-section">
      <div className="nav-top-row">
        <NavLink
          to={node.route ?? '#'}
          end
          className={({ isActive }) => 'nav-top-link' + (isActive ? ' active' : '')}
        >
          <Icon hint={node.icon_hint} />
          <span>{node.display_name}</span>
        </NavLink>
        {hasChildren && (
          <button
            type="button"
            className="nav-toggle"
            aria-label={open ? 'Collapse' : 'Expand'}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? '▾' : '▸'}
          </button>
        )}
      </div>
      {hasChildren && open && (
        <ul className="nav-sub-list">
          {subChildren.map((child) => (
            <li key={child.platform_naviation_id}>
              <NavLink
                to={child.route ?? '#'}
                className={({ isActive }) => 'nav-sub-link' + (isActive ? ' active' : '')}
              >
                {child.display_name}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function Sidebar({ tree }: { tree: NavNode[] }) {
  const topNodes = tree.filter(isSidebarVisible)
  return (
    <nav className="sidebar" aria-label="Primary">
      <div className="sidebar-brand">
        <span className="sidebar-brand-icon">🚦</span>
        <span className="sidebar-brand-text">Traffic Ticket Contest</span>
      </div>
      <div className="sidebar-scroll">
        {topNodes.map((node) => (
          <SidebarSection key={node.platform_naviation_id} node={node} />
        ))}
      </div>
    </nav>
  )
}
