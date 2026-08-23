import { Link, useParams } from 'react-router-dom'
import { useNav } from '../api/NavContext'
import { useRowData } from '../api/useTable'
import { detailLink } from '../api/detailRoutes'
import { formatValue, toSnake } from '../lib/format'
import type { FieldDef } from '../api/client'
import StatusBadge from '../components/StatusBadge'

const STATUS_HINT = /status$/i

const GROUP_LABEL: Record<FieldDef['type'], string> = {
  raw: 'Fields',
  lookup: 'Lookups',
  calculated: 'Calculated',
  aggregation: 'Aggregations',
  relationship: 'Relationships',
}
const GROUP_ORDER: FieldDef['type'][] = ['raw', 'lookup', 'calculated', 'aggregation', 'relationship']

function FieldRow({
  field,
  value,
  detailRoutes,
}: {
  field: FieldDef
  value: unknown
  detailRoutes: ReturnType<typeof useNav>['detailRoutes']
}) {
  const isFk = field.type === 'relationship' && field.RelatedTo
  const link = isFk ? detailLink(detailRoutes, field.RelatedTo!, value ? String(value) : null) : null
  return (
    <div className="detail-row">
      <div className="detail-label">{field.name}</div>
      <div className="detail-value">
        {STATUS_HINT.test(field.name) ? (
          <StatusBadge value={value} />
        ) : link ? (
          <Link to={link}>{formatValue(value, field.datatype)}</Link>
        ) : (
          formatValue(value, field.datatype)
        )}
      </div>
    </div>
  )
}

export default function GenericDetailPage({ table, paramName }: { table: string; paramName: string }) {
  const params = useParams()
  const rowId = params[paramName]
  const { detailRoutes } = useNav()
  const { data, loading, error } = useRowData(table, rowId)

  if (loading) return <div className="page-loading">Loading {table} record…</div>
  if (error) return <div className="page-error">Failed to load {table}/{rowId}: {error}</div>
  if (!data) return null

  const { fields, row, pkField } = data
  const nameField = fields.find((f) => f.name === 'Name')
  const title = nameField ? String(row[toSnake('Name')] ?? rowId) : String(row[toSnake(pkField)] ?? rowId)

  return (
    <div className="detail-page">
      <div className="detail-page-head">
        <h1>{table} · {title}</h1>
      </div>
      {GROUP_ORDER.map((groupType) => {
        const groupFields = fields.filter((f) => f.type === groupType && f.name !== pkField)
        if (groupFields.length === 0) return null
        return (
          <section key={groupType} className="detail-group">
            <h2>{GROUP_LABEL[groupType]}</h2>
            <div className="detail-grid">
              {groupFields.map((f) => (
                <FieldRow
                  key={f.name}
                  field={f}
                  value={row[toSnake(f.name)]}
                  detailRoutes={detailRoutes}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
