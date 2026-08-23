// Thin client for the effortless-rulebook-editor generated API.
//
// Contract (see GET /api/docs):
//  - Reads return snake_case column names. Writes must use the rulebook's
//    PascalCase field names (fields[].name from a GET /api/tables/:table).
//  - Calculated / lookup / aggregation fields are READ-ONLY — never send them
//    on a write, never recompute them here. Render exactly what the view returns.
//  - Numeric/decimal values arrive as JSON strings; callers coerce with Number().
//  - CORS is open; call the API directly, no proxy.

export const API_BASE = 'http://localhost:42451'

export interface FieldDef {
  name: string
  datatype: string
  type: 'raw' | 'calculated' | 'lookup' | 'relationship' | 'aggregation'
  nullable?: boolean
  Description?: string
  RelatedTo?: string
  isReversed?: boolean
  formula?: string
}

export interface FkFieldDef {
  field: string
  relatedTo: string
}

export interface TableResponse {
  table: string
  fields: FieldDef[]
  fkFields: FkFieldDef[]
  pkField: string
  rows: Array<Record<string, unknown>>
}

export interface RowResponse {
  table: string
  fields: FieldDef[]
  fkFields: FkFieldDef[]
  pkField: string
  row: Record<string, unknown>
}

class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers || {}),
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}) as Record<string, unknown>)
    const message =
      (body as { message?: string; error?: string }).message ||
      (body as { message?: string; error?: string }).error ||
      `${res.status} ${res.statusText}`
    throw new ApiError(res.status, message)
  }
  return res.json() as Promise<T>
}

/** Fetch an entire table: schema + fk info + all rows. */
export function fetchTable(table: string, filter?: string): Promise<TableResponse> {
  const qs = filter ? `?filter=${encodeURIComponent(filter)}` : ''
  return req<TableResponse>(`/api/tables/${table}${qs}`)
}

/** Fetch one row by primary key. */
export function fetchRow(table: string, rowId: string): Promise<RowResponse> {
  return req<RowResponse>(`/api/tables/${table}/rows/${encodeURIComponent(rowId)}`)
}

/** Fetch rows of `table` whose `fkField` equals `value` — the FK-filtered sub-list pattern. */
export async function fetchRelated(
  table: string,
  fkField: string,
  value: string,
): Promise<TableResponse> {
  return fetchTable(table, `${fkField}:eq:${value}`)
}

/** PATCH raw fields on a row. `patch` keys must be PascalCase raw field names. */
export function patchRow(
  table: string,
  rowId: string,
  patch: Record<string, unknown>,
): Promise<RowResponse> {
  return req<RowResponse>(`/api/tables/${table}/rows/${encodeURIComponent(rowId)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
}

export function createRow(
  table: string,
  body: Record<string, unknown>,
): Promise<RowResponse> {
  return req<RowResponse>(`/api/tables/${table}/rows`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function deleteRow(table: string, rowId: string): Promise<{ ok: boolean }> {
  return req<{ ok: boolean }>(`/api/tables/${table}/rows/${encodeURIComponent(rowId)}`, {
    method: 'DELETE',
  })
}

export { ApiError }
