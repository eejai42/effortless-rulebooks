// Maps a table name -> the nav route pattern (with a :param placeholder) that
// shows that table's detail view, so generic list/detail pages can turn a raw
// FK/PK value into a clickable link. Derived by scanning PlatformNaviation for
// any route containing a `:param` segment and recording its primary_table —
// NOT a hand-authored guess: it's built from the same SSoT as everything else.

import type { NavRow } from './nav'

export interface DetailRouteInfo {
  pattern: string // e.g. '/citations/:citationId'
  paramName: string // e.g. 'citationId'
}

/** table name -> detail route info, built from any PlatformNaviation row whose route has exactly one :param and no further static suffix segments beyond it (a true "detail" page, not an action sub-page like .../contest). */
export function buildDetailRouteMap(rows: NavRow[]): Map<string, DetailRouteInfo> {
  const map = new Map<string, DetailRouteInfo>()
  for (const r of rows) {
    if (!r.route || !r.primary_table) continue
    const segments = r.route.split('/').filter(Boolean)
    const paramSegments = segments.filter((s) => s.startsWith(':'))
    if (paramSegments.length !== 1) continue
    // Detail pages end in the param (e.g. /citations/:citationId). Action
    // pages have a static segment AFTER the param (e.g. .../contest) — skip those.
    if (!segments[segments.length - 1].startsWith(':')) continue
    const paramName = paramSegments[0].slice(1)
    // Prefer the first match per table (list/detail pairs are 1:1 in this nav).
    if (!map.has(r.primary_table)) {
      map.set(r.primary_table, { pattern: r.route, paramName })
    }
  }
  return map
}

/** Build a concrete link for a given table + row id, or null if no detail route exists for that table. */
export function detailLink(
  routeMap: Map<string, DetailRouteInfo>,
  table: string,
  rowId: string | null | undefined,
): string | null {
  if (!rowId) return null
  const info = routeMap.get(table)
  if (!info) return null
  return info.pattern.replace(/:[^/]+/, encodeURIComponent(rowId))
}
