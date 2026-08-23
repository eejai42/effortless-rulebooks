const base = async (method, path, body, asText = false) => {
  const opts = {
    method,
    headers: body != null ? { "Content-Type": asText ? "text/plain" : "application/json" } : {},
    body: body != null ? (asText ? body : JSON.stringify(body)) : undefined,
  };
  const r = await fetch(path, opts);
  if (!r.ok) {
    const text = await r.text().catch(() => r.statusText);
    // The server returns JSON errors of shape { error, ...extras } (e.g.
    // { error, referrers } for cascade-required deletes). Surface the
    // human-readable `error` as the Error message and hoist extras to
    // top-level properties so callers can branch on them (e.g.
    // `if (e.referrers) ...`).
    let parsed = null;
    try { parsed = JSON.parse(text); } catch {}
    const msg = (parsed && parsed.error) || text || `${r.status} ${path}`;
    const err = new Error(msg);
    err.status = r.status;
    if (parsed && typeof parsed === "object") {
      for (const [k, v] of Object.entries(parsed)) {
        if (k !== "error" && !(k in err)) err[k] = v;
      }
    }
    throw err;
  }
  if (asText) return r.text();
  return r.json();
};

export const api = {
  get:   (path)             => base("GET",    path),
  post:  (path, body)       => base("POST",   path, body),
  patch: (path, body)       => base("PATCH",  path, body),
  put:   (path, body, txt)  => base("PUT",    path, body, txt),
  del:   (path)             => base("DELETE", path),
};

// Append `?domain=<slug>` to a path, preserving any existing query string and
// fragment. Does nothing when `domain` is falsy. Use this for any call to an
// endpoint that requires a domain (the server returns 400 if it's missing).
export function withDomain(path, domain) {
  if (!domain) return path;
  const [base, hash = ""] = String(path).split("#");
  const sep = base.includes("?") ? "&" : "?";
  // Don't double-append if the path already carries a domain param.
  if (/[?&]domain=/.test(base)) return path;
  const out = `${base}${sep}domain=${encodeURIComponent(domain)}`;
  return hash ? `${out}#${hash}` : out;
}

// `domainApi` is `api` with `?domain=` auto-appended to every path. For methods
// that take a body, the body is also extended with `{ domain }` so endpoints
// that read from req.body work the same as ones that read from req.query.
export function makeDomainApi(domain) {
  const wrap = (path) => withDomain(path, domain);
  const withDomainBody = (body) => {
    if (body == null) return { domain };
    if (typeof body !== "object" || Array.isArray(body)) return body;
    return { domain, ...body };
  };
  return {
    get:   (path)             => api.get(wrap(path)),
    post:  (path, body)       => api.post(wrap(path), withDomainBody(body)),
    patch: (path, body)       => api.patch(wrap(path), withDomainBody(body)),
    put:   (path, body, txt)  => api.put(wrap(path), txt ? body : withDomainBody(body), txt),
    del:   (path)             => api.del(wrap(path)),
  };
}
