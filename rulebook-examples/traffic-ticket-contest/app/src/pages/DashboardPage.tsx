import { Link } from 'react-router-dom'
import { useTableData } from '../api/useTable'
import { formatUsd } from '../lib/format'

// This page only COUNTS/SUMS values the Citations/Hearings/Payments views
// already computed (is_response_overdue, citation_status, amount_due_usd, …).
// It never re-derives a business rule client-side — every predicate below
// reads a boolean/enum the rulebook already resolved.

function Card({ label, value, tone, to }: { label: string; value: string | number; tone?: string; to?: string }) {
  const inner = (
    <div className={`stat-card ${tone ?? ''}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
  return to ? <Link to={to} className="stat-card-link">{inner}</Link> : inner
}

export default function DashboardPage() {
  const citations = useTableData('Citations')
  const hearings = useTableData('Hearings')
  const payments = useTableData('Payments')

  if (citations.loading || hearings.loading || payments.loading) {
    return <div className="page-loading">Loading dashboard…</div>
  }
  if (citations.error) return <div className="page-error">Failed to load Citations: {citations.error}</div>
  if (hearings.error) return <div className="page-error">Failed to load Hearings: {hearings.error}</div>
  if (payments.error) return <div className="page-error">Failed to load Payments: {payments.error}</div>

  const cRows = citations.data?.rows ?? []
  const hRows = hearings.data?.rows ?? []

  const openCitations = cRows.filter((r) => r.citation_status !== 'Dismissed' && r.citation_status !== 'Closed')
  const overdueResponses = cRows.filter((r) => r.is_response_overdue === true)
  const inCollections = cRows.filter((r) => r.is_in_collections === true)
  const paymentsDue = cRows.filter((r) => r.payment_status === 'Due' || r.payment_status === 'Overdue')
  const totalDue = cRows.reduce((sum, r) => sum + (r.amount_due_usd ? Number(r.amount_due_usd) : 0), 0)
  const upcomingHearings = hRows.filter((r) => {
    if (!r.scheduled_for) return false
    const d = new Date(String(r.scheduled_for))
    return d.getTime() >= Date.now()
  })
  const pendingHearings = hRows.filter((r) => r.outcome === 'Pending')
  const contestedCitations = cRows.filter((r) => r.contest_requested === true)

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      <div className="stat-grid">
        <Card label="Total Citations" value={cRows.length} to="/citations" />
        <Card label="Open Citations" value={openCitations.length} to="/citations" />
        <Card label="Response Overdue" value={overdueResponses.length} tone="stat-warn" to="/citations" />
        <Card label="Contested" value={contestedCitations.length} to="/citations" />
        <Card label="In Collections" value={inCollections.length} tone="stat-danger" to="/citations" />
        <Card label="Payments Due" value={paymentsDue.length} tone="stat-warn" to="/payments" />
        <Card label="Total Amount Due" value={formatUsd(totalDue)} tone="stat-money" to="/citations" />
        <Card label="Upcoming Hearings" value={upcomingHearings.length} to="/hearings" />
        <Card label="Pending Hearings" value={pendingHearings.length} to="/hearings" />
      </div>

      <section className="dashboard-section">
        <h2>Citations Needing a Response</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Citation #</th>
                <th>Driver</th>
                <th>Violation</th>
                <th>Response Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {overdueResponses.length === 0 && (
                <tr><td colSpan={5} className="empty-cell">No overdue responses.</td></tr>
              )}
              {overdueResponses.map((r) => (
                <tr key={String(r.citation_id)}>
                  <td><Link to={`/citations/${r.citation_id}`}>{String(r.citation_number)}</Link></td>
                  <td>{String(r.driver_label ?? '—')}</td>
                  <td>{String(r.violation_label ?? '—')}</td>
                  <td>{r.response_due_date ? new Date(String(r.response_due_date)).toLocaleDateString() : '—'}</td>
                  <td>{String(r.citation_status ?? '—')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
