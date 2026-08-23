import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { fetchNavTree, flattenNav, type NavNode, type NavRow } from './nav'
import { buildDetailRouteMap, type DetailRouteInfo } from './detailRoutes'

interface NavContextValue {
  loading: boolean
  error: string | null
  tree: NavNode[]
  flat: NavRow[]
  detailRoutes: Map<string, DetailRouteInfo>
}

const NavContext = createContext<NavContextValue | null>(null)

export function NavProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NavContextValue>({
    loading: true,
    error: null,
    tree: [],
    flat: [],
    detailRoutes: new Map(),
  })

  useEffect(() => {
    let cancelled = false
    fetchNavTree()
      .then((tree) => {
        if (cancelled) return
        const flat = flattenNav(tree)
        setState({ loading: false, error: null, tree, flat, detailRoutes: buildDetailRouteMap(flat) })
      })
      .catch((err: Error) => {
        if (cancelled) return
        setState((s) => ({ ...s, loading: false, error: err.message }))
      })
    return () => {
      cancelled = true
    }
  }, [])

  return <NavContext.Provider value={state}>{children}</NavContext.Provider>
}

export function useNav(): NavContextValue {
  const ctx = useContext(NavContext)
  if (!ctx) throw new Error('useNav must be used within NavProvider')
  return ctx
}
