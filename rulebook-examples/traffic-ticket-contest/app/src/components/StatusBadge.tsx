// Generic status -> color mapping. Purely presentational: the STATUS VALUE
// itself always comes from a calculated field the API already returned
// (CitationStatus, ContestStatus, PaymentStatus, ...) — this component never
// decides what the status IS, only what color to paint a known value.
const GREEN = new Set(['dismissed', 'paid', 'closed', 'resolved', 'active', 'won', 'reduced', 'shipped'])
const RED = new Set(['overdue', 'collections', 'in_collections', 'guilty', 'late', 'delinquent', 'denied', 'failed'])
const YELLOW = new Set(['pending', 'due', 'contested', 'awaiting', 'scheduled', 'in_progress', 'planned'])
const TEAL = new Set(['adjudicated', 'upheld', 'reviewed'])

function bucket(raw: string): string {
  const key = raw.trim().toLowerCase().replace(/\s+/g, '_')
  if (GREEN.has(key)) return 'badge-green'
  if (RED.has(key)) return 'badge-red'
  if (YELLOW.has(key)) return 'badge-yellow'
  if (TEAL.has(key)) return 'badge-teal'
  return 'badge-neutral'
}

export default function StatusBadge({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === '') {
    return <span className="badge badge-neutral">—</span>
  }
  if (typeof value === 'boolean') {
    return <span className={`badge ${value ? 'badge-red' : 'badge-green'}`}>{value ? 'Yes' : 'No'}</span>
  }
  const s = String(value)
  return <span className={`badge ${bucket(s)}`}>{s.replace(/_/g, ' ')}</span>
}
