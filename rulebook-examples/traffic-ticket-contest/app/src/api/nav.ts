// Navigation is derived live from PlatformNaviation — never hand-authored.
// See CLAUDE.md: "Build the app's router and left-nav sidebar FROM THIS DATA."

import { fetchTable } from './client'

export interface NavRow {
  platform_naviation_id: string
  display_name: string | null
  route: string | null
  description: string | null
  sort_order: number | null
  parent_route_key: string | null
  route_key: string | null
  nav_level: string | null // 'top' | 'sub'
  primary_table: string | null
  primary_view: string | null
  icon_hint: string | null
  admin_crud: string | null
  manager_crud: string | null
  representative_crud: string | null
  external_llm_crud: string | null
}

export interface NavNode extends NavRow {
  children: NavNode[]
}

/** Fetch all 40 PlatformNaviation rows and build the top/sub tree by route_key/parent_route_key. */
export async function fetchNavTree(): Promise<NavNode[]> {
  const { rows } = await fetchTable('PlatformNaviation')
  const navRows = rows as unknown as NavRow[]

  const byKey = new Map<string, NavNode>()
  for (const r of navRows) {
    byKey.set(r.route_key ?? r.platform_naviation_id, { ...r, children: [] })
  }

  // Nav is a shallow N-level tree in practice (top -> sub -> sub-of-sub, e.g.
  // citations.contest/citations.pay parent to the sub-node citations.detail,
  // and admin.feature-detail parents to the sub-node admin.features). A row's
  // parent may be ANY other row, not just a top-level one, so attach by
  // parent_route_key generically rather than assuming a fixed 2-level shape.
  const roots: NavNode[] = []
  for (const node of byKey.values()) {
    const parentKey = node.parent_route_key
    const parent = parentKey ? byKey.get(parentKey) : undefined
    if (parent && parent !== node) {
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  }

  const bySort = (a: NavNode, b: NavNode) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  roots.sort(bySort)
  for (const node of byKey.values()) node.children.sort(bySort)

  return roots
}

/** Flatten the tree back to a plain list — used to register every React Router route. */
export function flattenNav(tree: NavNode[]): NavRow[] {
  const out: NavRow[] = []
  const walk = (nodes: NavNode[]) => {
    for (const n of nodes) {
      out.push(n)
      walk(n.children)
    }
  }
  walk(tree)
  return out
}
