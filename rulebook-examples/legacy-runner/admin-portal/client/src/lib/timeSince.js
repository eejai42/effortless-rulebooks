// Human-readable "time since" for a ms-since-epoch timestamp.
// Used by domain pickers to annotate each tile with how long since the
// folder was last touched (opened, built, edited).
export function formatTimeSince(ms) {
  if (!ms || typeof ms !== "number") return "never";
  const diff = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (diff < 60)        return `${diff}s ago`;
  if (diff < 3600)      return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)     return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800)    return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 2592000)   return `${Math.floor(diff / 604800)}w ago`;
  if (diff < 31536000)  return `${Math.floor(diff / 2592000)}mo ago`;
  return `${Math.floor(diff / 31536000)}y ago`;
}

export const DOMAIN_SORT_MODES = [
  { id: "mtime-desc", label: "Recently opened" },
  { id: "name-asc",   label: "A → Z" },
  { id: "mtime-asc",  label: "Least recent" },
  { id: "name-desc",  label: "Z → A" },
];

export function sortDomains(domains, mode) {
  const arr = [...(domains || [])];
  const byName = (a, b) => String(a.displayName || a.name || a.id).localeCompare(String(b.displayName || b.name || b.id));
  const byMtime = (a, b) => (a.lastModified || 0) - (b.lastModified || 0);
  switch (mode) {
    case "mtime-asc":  return arr.sort((a, b) => byMtime(a, b) || byName(a, b));
    case "name-asc":   return arr.sort(byName);
    case "name-desc":  return arr.sort((a, b) => -byName(a, b));
    case "mtime-desc":
    default:           return arr.sort((a, b) => byMtime(b, a) || byName(a, b));
  }
}
