import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useNav } from '../api/NavContext'
import { useTableData } from '../api/useTable'
import { detailLink } from '../api/detailRoutes'
import { formatValue, toSnake } from '../lib/format'
import type { FieldDef } from '../api/client'
import StatusBadge from '../components/StatusBadge'

// Field names whose values are long/free-text and clutter a list view — shown
// only on the detail page, never as a default list column.
const LONG_TEXT_HINT = /notes?$|description|extracted_text|source_text|guard_description|change_note|rationale$/i
const STATUS_HINT = /status$/i
const AUDIT_FIELDS = new Set([
  'CreatedAt', 'CreatedBy', 'ModifiedAt', 'ModifiedBy', 'ModifiedByModel', 'IsMockData',
])

function defaultColumns(fields: FieldDef[], pkField: string): FieldDef[] {
  return fields.filter((f) => {
    if (f.name === pkField) return false
    if (AUDIT_FIELDS.has(f.name)) return false
    if (f.type === 'relationship' && f.isReversed !== false && !f.RelatedTo) return false
    // Reverse-relationship collections (Hearings/Payments/CaseEvents on Citations,
    // etc.) are shown as counts elsewhere, not as a raw list column.
    if (f.type === 'relationship') return false
    if (LONG_TEXT_HINT.test(f.name)) return false
    return true
  }).slice(0, 8) // keep list views scannable; full detail lives on the detail page
}

export default function GenericListPage({ table, primaryView }: { table: string; primaryView?: string }) {
  const params = useParams()
  const { detailRoutes } = useNav()
  const { data, loading, error } = useTableData(table)
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [search, setSearch] = useState('')

  const columns = useMemo(() => {
    if (!data) return []
    return defaultColumns(data.fields, data.pkField)
  }, [data])

  const rows = useMemo(() => {
    if (!data) return []
    let r = data.rows
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      r = r.filter((row) => Object.values(row).some((v) => v !== null && String(v).toLowerCase().includes(q)))
    }
    if (sortField) {
      r = [...r].sort((a, b) => {
        const av = a[sortField]
        const bv = b[sortField]
        if (av === bv) return 0
        if (av === null || av === undefined) return 1
        if (bv === null || bv === undefined) return -1
        const an = Number(av)
        const bn = Number(bv)
        const bothNumeric = !Number.isNaN(an) && !Number.isNaN(bn) && av !== '' && bv !== ''
        const cmp = bothNumeric ? an - bn : String(av).localeCompare(String(bv))
        return sortDir === 'asc' ? cmp : -cmp
      })
    }
    return r
  }, [data, search, sortField, sortDir])

  if (loading) return <div className="page-loading">Loading {table}…</div>
  if (error) return <div className="page-error">Failed to load {table}: {error}</div>
  if (!data) return null

  const pkField = data.pkField
  const pkSnake = toSnake(pkField)

  function toggleSort(fieldName: string) {
    const snake = toSnake(fieldName)
    if (sortField === snake) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(snake)
      setSortDir('asc')
    }
  }

  return (
    <div className="list-page">
      <div className="list-page-head">
        <h1>{table}{primaryView ? <span className="view-tag"> · {primaryView}</span> : null}</h1>
        <input
          type="search"
          placeholder={`Search ${table}…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="list-search"
        />
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {columns.map((f) => (
                <th key={f.name} onClick={() => toggleSort(f.name)} className="sortable">
                  {f.name}
                  {sortField === toSnake(f.name) ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const pkValue = String(row[pkSnake] ?? '')
              const link = detailLink(detailRoutes, table, pkValue)
              return (
                <tr key={pkValue}>
                  {columns.map((f, idx) => {
                    const snakeKey = toSnake(f.name)
                    const value = row[snakeKey]
                    const isFirst = idx === 0
                    const cellContent = STATUS_HINT.test(f.name) ? (
                      <StatusBadge value={value} />
                    ) : (
                      formatValue(value, f.datatype)
                    )
                    if (isFirst && link) {
                      return (
                        <td key={f.name}>
                          <Link to={link} className="row-link">
                            {cellContent}
                          </Link>
                        </td>
                      )
                    }
                    return <td key={f.name}>{cellContent}</td>
                  })}
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="empty-cell">No rows.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="list-page-footer muted">
        {rows.length} of {data.rows.length} row{data.rows.length === 1 ? '' : 's'}
        {params.table ? '' : ''}
      </div>
    </div>
  )
}
