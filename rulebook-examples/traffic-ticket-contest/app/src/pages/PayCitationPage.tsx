import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useRowData } from '../api/useTable'
import { patchRow, ApiError } from '../api/client'
import { formatUsd } from '../lib/format'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function PayCitationPage() {
  const { citationId } = useParams()
  const navigate = useNavigate()
  const { data, loading, error } = useRowData('Citations', citationId)
  const [paidOn, setPaidOn] = useState(todayIso())
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  if (loading) return <div className="page-loading">Loading citation…</div>
  if (error) return <div className="page-error">Failed to load citation {citationId}: {error}</div>
  if (!data || !citationId) return null

  const row = data.row
  const amountDue = row.amount_due_usd ? Number(row.amount_due_usd) : null

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)
    const n = Number(amount)
    if (!amount || Number.isNaN(n) || n <= 0) {
      setSubmitError('Enter a valid payment amount.')
      setSubmitting(false)
      return
    }
    try {
      await patchRow('Citations', citationId!, {
        PaidOn: paidOn,
        AmountPaidUsd: n,
      })
      navigate(`/citations/${citationId}`)
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="action-page">
      <h1>Pay Citation {String(row.citation_number)}</h1>
      <p className="muted">
        Amount currently due: <strong>{formatUsd(amountDue)}</strong>. This form writes the
        raw <code>PaidOn</code> / <code>AmountPaidUsd</code> fields; <code>PaymentStatus</code>,
        {' '}<code>IsPaymentLate</code>, and <code>IsInCollections</code> recompute from those.
      </p>
      <form onSubmit={onSubmit} className="action-form">
        {submitError && <div className="error">{submitError}</div>}
        <label className="form-field">
          <span>Paid On</span>
          <input type="date" value={paidOn} onChange={(e) => setPaidOn(e.target.value)} required />
        </label>
        <label className="form-field">
          <span>Amount Paid (USD)</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={amountDue !== null ? amountDue.toFixed(2) : '0.00'}
            required
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Record Payment'}
        </button>
      </form>
      <Link to={`/citations/${citationId}`} className="btn btn-link">Back to citation</Link>
    </div>
  )
}
