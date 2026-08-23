import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useRowData } from '../api/useTable'
import { fetchRelated } from '../api/client'
import { useEffect } from 'react'
import { formatUsd, formatValue } from '../lib/format'
import StatusBadge from '../components/StatusBadge'
import type { TableResponse } from '../api/client'

function useRelated(table: string, fkField: string, citationId: string | undefined) {
  const [data, setData] = useState<TableResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (!citationId) return
    let cancelled = false
    setLoading(true)
    fetchRelated(table, fkField, citationId)
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
  }, [table, fkField, citationId])
  return { data, loading, error }
}

type Tab = 'hearings' | 'payments' | 'events'

export default function CitationDetailPage() {
  const { citationId } = useParams()
  const { data, loading, error, refetch } = useRowData('Citations', citationId)
  const [tab, setTab] = useState<Tab>('hearings')

  const hearings = useRelated('Hearings', 'Citation', citationId)
  const payments = useRelated('Payments', 'Citation', citationId)
  const events = useRelated('CaseEvents', 'Citation', citationId)

  if (loading) return <div className="page-loading">Loading citation…</div>
  if (error) return <div className="page-error">Failed to load citation {citationId}: {error}</div>
  if (!data) return null

  const row = data.row

  return (
    <div className="citation-detail">
      <div className="detail-page-head">
        <h1>Citation {String(row.citation_number)}</h1>
        <div className="citation-actions">
          <Link to={`/citations/${citationId}/contest`} className="btn btn-secondary">Contest</Link>
          <Link to={`/citations/${citationId}/pay`} className="btn btn-primary">Pay</Link>
        </div>
      </div>

      <div className="status-track-row">
        <div className="status-track">
          <div className="status-track-label">Citation Status</div>
          <StatusBadge value={row.citation_status} />
        </div>
        <div className="status-track">
          <div className="status-track-label">Contest Status</div>
          <StatusBadge value={row.contest_status} />
        </div>
        <div className="status-track">
          <div className="status-track-label">Payment Status</div>
          <StatusBadge value={row.payment_status} />
        </div>
        <div className="status-track">
          <div className="status-track-label">Effective Points</div>
          <div className="status-track-number">{formatValue(row.effective_points, 'integer')}</div>
        </div>
      </div>

      <section className="citation-summary-grid">
        <div className="detail-row"><div className="detail-label">Driver</div><div className="detail-value"><Link to={`/drivers/${row.driver}`}>{String(row.driver_label ?? '—')}</Link></div></div>
        <div className="detail-row"><div className="detail-label">Violation</div><div className="detail-value"><Link to={`/violation-types/${row.violation_type}`}>{String(row.violation_label ?? '—')}</Link></div></div>
        <div className="detail-row"><div className="detail-label">Jurisdiction</div><div className="detail-value"><Link to={`/jurisdictions/${row.jurisdiction}`}>{String(row.jurisdiction_label ?? '—')}</Link></div></div>
        <div className="detail-row"><div className="detail-label">Issued On</div><div className="detail-value">{formatValue(row.issued_on, 'date')}</div></div>
        <div className="detail-row"><div className="detail-label">Base Fine</div><div className="detail-value">{formatUsd(row.base_fine_usd)}</div></div>
        <div className="detail-row"><div className="detail-label">Amount Due</div><div className="detail-value">{formatUsd(row.amount_due_usd)}</div></div>
        <div className="detail-row"><div className="detail-label">Response Due Date</div><div className="detail-value">{formatValue(row.response_due_date, 'date')}</div></div>
        <div className="detail-row"><div className="detail-label">Payment Due Date</div><div className="detail-value">{formatValue(row.payment_due_date, 'date')}</div></div>
        <div className="detail-row"><div className="detail-label">Is Response Overdue</div><div className="detail-value">{formatValue(row.is_response_overdue)}</div></div>
        <div className="detail-row"><div className="detail-label">Is Payment Late</div><div className="detail-value">{formatValue(row.is_payment_late)}</div></div>
        <div className="detail-row"><div className="detail-label">Is In Collections</div><div className="detail-value">{formatValue(row.is_in_collections)}</div></div>
        <div className="detail-row"><div className="detail-label">Is Dismissed</div><div className="detail-value">{formatValue(row.is_dismissed)}</div></div>
        <div className="detail-row"><div className="detail-label">Is Guilty</div><div className="detail-value">{formatValue(row.is_guilty)}</div></div>
        <div className="detail-row"><div className="detail-label">Count of Hearings</div><div className="detail-value">{formatValue(row.count_of_hearings, 'integer')}</div></div>
        <div className="detail-row"><div className="detail-label">Latest Hearing Outcome</div><div className="detail-value">{formatValue(row.latest_hearing_outcome)}</div></div>
      </section>

      <div className="tab-bar">
        <button className={tab === 'hearings' ? 'tab active' : 'tab'} onClick={() => setTab('hearings')}>
          Hearings ({hearings.data?.rows.length ?? '…'})
        </button>
        <button className={tab === 'payments' ? 'tab active' : 'tab'} onClick={() => setTab('payments')}>
          Payments ({payments.data?.rows.length ?? '…'})
        </button>
        <button className={tab === 'events' ? 'tab active' : 'tab'} onClick={() => setTab('events')}>
          Case Events ({events.data?.rows.length ?? '…'})
        </button>
      </div>

      {tab === 'hearings' && (
        <div className="table-scroll">
          <table>
            <thead><tr><th>Hearing #</th><th>Requested</th><th>Scheduled</th><th>Outcome</th><th>Notes</th></tr></thead>
            <tbody>
              {hearings.loading && <tr><td colSpan={5} className="empty-cell">Loading…</td></tr>}
              {hearings.error && <tr><td colSpan={5} className="empty-cell">Error: {hearings.error}</td></tr>}
              {hearings.data?.rows.length === 0 && <tr><td colSpan={5} className="empty-cell">No hearings.</td></tr>}
              {hearings.data?.rows.map((r) => (
                <tr key={String(r.hearing_id)}>
                  <td>{String(r.hearing_number)}</td>
                  <td>{formatValue(r.requested_on, 'date')}</td>
                  <td>{formatValue(r.scheduled_for, 'date')}</td>
                  <td><StatusBadge value={r.outcome} /></td>
                  <td className="notes-cell">{String(r.notes ?? '—')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'payments' && (
        <div className="table-scroll">
          <table>
            <thead><tr><th>Payment #</th><th>Paid On</th><th>Amount</th><th>Method</th></tr></thead>
            <tbody>
              {payments.loading && <tr><td colSpan={4} className="empty-cell">Loading…</td></tr>}
              {payments.error && <tr><td colSpan={4} className="empty-cell">Error: {payments.error}</td></tr>}
              {payments.data?.rows.length === 0 && <tr><td colSpan={4} className="empty-cell">No payments.</td></tr>}
              {payments.data?.rows.map((r) => (
                <tr key={String(r.payment_id)}>
                  <td>{String(r.payment_number)}</td>
                  <td>{formatValue(r.paid_on, 'date')}</td>
                  <td>{formatUsd(r.amount_usd)}</td>
                  <td>{String(r.method ?? '—')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'events' && (
        <div className="table-scroll">
          <table>
            <thead><tr><th>Event #</th><th>Occurred</th><th>Track</th><th>From</th><th>To</th><th>Note</th></tr></thead>
            <tbody>
              {events.loading && <tr><td colSpan={6} className="empty-cell">Loading…</td></tr>}
              {events.error && <tr><td colSpan={6} className="empty-cell">Error: {events.error}</td></tr>}
              {events.data?.rows.length === 0 && <tr><td colSpan={6} className="empty-cell">No case events.</td></tr>}
              {events.data?.rows.map((r) => (
                <tr key={String(r.case_event_id)}>
                  <td>{String(r.event_number)}</td>
                  <td>{formatValue(r.occurred_on, 'date')}</td>
                  <td>{String(r.track ?? '—')}</td>
                  <td>{String(r.from_state ?? '—')}</td>
                  <td>{String(r.to_state ?? '—')}</td>
                  <td className="notes-cell">{String(r.note ?? '—')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button className="btn btn-link" onClick={refetch}>Refresh</button>
    </div>
  )
}
