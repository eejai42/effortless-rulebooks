const BASE = '/api';

async function jsonFetch(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

export const api = {
  users: {
    list: () => jsonFetch('/users'),
    get: (id) => jsonFetch(`/users/${id}`),
    create: (body) => jsonFetch('/users', { method: 'POST', body }),
    update: (id, body) => jsonFetch(`/users/${id}`, { method: 'PUT', body }),
    remove: (id) => jsonFetch(`/users/${id}`, { method: 'DELETE' }),
  },
  businesses: {
    list: () => jsonFetch('/businesses'),
    get: (id) => jsonFetch(`/businesses/${id}`),
    create: (body) => jsonFetch('/businesses', { method: 'POST', body }),
    update: (id, body) => jsonFetch(`/businesses/${id}`, { method: 'PUT', body }),
    remove: (id) => jsonFetch(`/businesses/${id}`, { method: 'DELETE' }),
  },
  beneficial_owners: {
    list: () => jsonFetch('/beneficial_owners'),
    get: (id) => jsonFetch(`/beneficial_owners/${id}`),
    create: (body) => jsonFetch('/beneficial_owners', { method: 'POST', body }),
    update: (id, body) => jsonFetch(`/beneficial_owners/${id}`, { method: 'PUT', body }),
    remove: (id) => jsonFetch(`/beneficial_owners/${id}`, { method: 'DELETE' }),
  },
  contacts: {
    list: () => jsonFetch('/contacts'),
    get: (id) => jsonFetch(`/contacts/${id}`),
    create: (body) => jsonFetch('/contacts', { method: 'POST', body }),
    update: (id, body) => jsonFetch(`/contacts/${id}`, { method: 'PUT', body }),
    remove: (id) => jsonFetch(`/contacts/${id}`, { method: 'DELETE' }),
  },
  accounts: {
    list: () => jsonFetch('/accounts'),
    get: (id) => jsonFetch(`/accounts/${id}`),
    create: (body) => jsonFetch('/accounts', { method: 'POST', body }),
    update: (id, body) => jsonFetch(`/accounts/${id}`, { method: 'PUT', body }),
    remove: (id) => jsonFetch(`/accounts/${id}`, { method: 'DELETE' }),
  },
  loans: {
    list: () => jsonFetch('/loans'),
    get: (id) => jsonFetch(`/loans/${id}`),
    create: (body) => jsonFetch('/loans', { method: 'POST', body }),
    update: (id, body) => jsonFetch(`/loans/${id}`, { method: 'PUT', body }),
    remove: (id) => jsonFetch(`/loans/${id}`, { method: 'DELETE' }),
  },
  covenants: {
    list: () => jsonFetch('/covenants'),
    get: (id) => jsonFetch(`/covenants/${id}`),
    create: (body) => jsonFetch('/covenants', { method: 'POST', body }),
    update: (id, body) => jsonFetch(`/covenants/${id}`, { method: 'PUT', body }),
    remove: (id) => jsonFetch(`/covenants/${id}`, { method: 'DELETE' }),
  },
  risk_rating_history: {
    list: () => jsonFetch('/risk_rating_history'),
    get: (id) => jsonFetch(`/risk_rating_history/${id}`),
    create: (body) => jsonFetch('/risk_rating_history', { method: 'POST', body }),
    update: (id, body) => jsonFetch(`/risk_rating_history/${id}`, { method: 'PUT', body }),
    remove: (id) => jsonFetch(`/risk_rating_history/${id}`, { method: 'DELETE' }),
  },
  documents: {
    list: () => jsonFetch('/documents'),
    get: (id) => jsonFetch(`/documents/${id}`),
    create: (body) => jsonFetch('/documents', { method: 'POST', body }),
    update: (id, body) => jsonFetch(`/documents/${id}`, { method: 'PUT', body }),
    remove: (id) => jsonFetch(`/documents/${id}`, { method: 'DELETE' }),
  },
  interactions: {
    list: () => jsonFetch('/interactions'),
    get: (id) => jsonFetch(`/interactions/${id}`),
    create: (body) => jsonFetch('/interactions', { method: 'POST', body }),
    update: (id, body) => jsonFetch(`/interactions/${id}`, { method: 'PUT', body }),
    remove: (id) => jsonFetch(`/interactions/${id}`, { method: 'DELETE' }),
  },
  constraints: {
    list: () => jsonFetch('/constraints'),
    get: (id) => jsonFetch(`/constraints/${id}`),
    create: (body) => jsonFetch('/constraints', { method: 'POST', body }),
    update: (id, body) => jsonFetch(`/constraints/${id}`, { method: 'PUT', body }),
    remove: (id) => jsonFetch(`/constraints/${id}`, { method: 'DELETE' }),
  },
  __meta__: {
    list: () => jsonFetch('/__meta__'),
    get: (id) => jsonFetch(`/__meta__/${id}`),
    create: (body) => jsonFetch('/__meta__', { method: 'POST', body }),
    update: (id, body) => jsonFetch(`/__meta__/${id}`, { method: 'PUT', body }),
    remove: (id) => jsonFetch(`/__meta__/${id}`, { method: 'DELETE' }),
  },
};
