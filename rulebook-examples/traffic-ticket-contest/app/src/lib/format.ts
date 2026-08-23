// Presentation-only helpers. None of these compute business logic — they only
// format values the API already returned (numeric-as-string coercion, date
// display, snake_case -> Title Case labels). See CLAUDE.md "The view IS the
// contract" — nothing here re-derives a calculated/lookup/aggregation value.

export function titleCase(snake: string): string {
  return snake
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function formatValue(value: unknown, datatype?: string): string {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (datatype === 'date' || datatype === 'datetime') {
    const d = new Date(String(value))
    if (Number.isNaN(d.getTime())) return String(value)
    return datatype === 'date'
      ? d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
      : d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  }
  if (datatype === 'number' || datatype === 'decimal' || datatype === 'integer') {
    const n = Number(value)
    if (Number.isNaN(n)) return String(value)
    return datatype === 'decimal' ? n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : n.toLocaleString()
  }
  return String(value)
}

export function formatUsd(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  const n = Number(value)
  if (Number.isNaN(n)) return String(value)
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
}

/** snake_case field key -> the datatype declared in fields[], for formatting. */
export function datatypeFor(fields: Array<{ name: string; datatype: string }>, snakeKey: string): string | undefined {
  const pascal = snakeKey
    .split('_')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('')
  return fields.find((f) => f.name === pascal)?.datatype
}

/** PascalCase rulebook field name -> snake_case row key (for reading a row by field def). */
export function toSnake(pascal: string): string {
  return pascal.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/([A-Z])([A-Z][a-z])/g, '$1_$2').toLowerCase()
}
