import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useRowData } from '../api/useTable'
import { patchRow, ApiError } from '../api/client'

export default function ContestCitationPage() {
  const { citationId } = useParams()
  const navigate = useNavigate()
  const { data, loading, error } = useRowData('Citations', citationId)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  if (loading) return <div className="page-loading">Loading citation…</div>
  if (error) return <div className="page-error">Failed to load citation {citationId}: {error}</div>
  if (!data || !citationId) return null

  const row = data.row
  const alreadyContested = row.contest_requested === true

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)
    try {
      await patchRow('Citations', citationId!, { ContestRequested: true })
      navigate(`/citations/${citationId}`)
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="action-page">
      <h1>Contest Citation {String(row.citation_number)}</h1>
      <p className="muted">
        Requesting a contest sets <code>ContestRequested</code> on the citation. The
        rulebook's <code>ContestStatus</code> / <code>CitationStatus</code> calculated
        fields recompute from this raw flag — nothing else needs to change client-side.
      </p>
      {alreadyContested ? (
        <div className="notice">This citation is already marked as contested.</div>
      ) : (
        <form onSubmit={onSubmit} className="action-form">
          {submitError && <div className="error">{submitError}</div>}
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Confirm Contest Request'}
          </button>
        </form>
      )}
      <Link to={`/citations/${citationId}`} className="btn btn-link">Back to citation</Link>
    </div>
  )
}
