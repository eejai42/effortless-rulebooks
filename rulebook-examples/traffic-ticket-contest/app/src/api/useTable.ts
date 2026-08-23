import { useEffect, useState } from 'react'
import { fetchTable, fetchRow, type TableResponse, type RowResponse } from './client'

export function useTableData(table: string, filter?: string) {
  const [data, setData] = useState<TableResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchTable(table, filter)
      .then((res) => {
        if (!cancelled) {
          setData(res)
          setLoading(false)
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [table, filter, refreshKey])

  return { data, loading, error, refetch: () => setRefreshKey((k) => k + 1) }
}

export function useRowData(table: string, rowId: string | undefined) {
  const [data, setData] = useState<RowResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!rowId) return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchRow(table, rowId)
      .then((res) => {
        if (!cancelled) {
          setData(res)
          setLoading(false)
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [table, rowId, refreshKey])

  return { data, loading, error, refetch: () => setRefreshKey((k) => k + 1) }
}
