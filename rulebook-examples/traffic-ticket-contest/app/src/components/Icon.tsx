// Minimal icon_hint -> emoji mapping so the sidebar has visual texture without
// pulling in an icon library. icon_hint values come from PlatformNaviation;
// anything unmapped falls back to a generic bullet (never invents a false claim
// about what the row IS — it's just a rendering fallback for a decorative glyph).
const ICONS: Record<string, string> = {
  dashboard: '📊',
  gauge: '📊',
  ticket: '🎫',
  citation: '🎫',
  gavel: '⚖️',
  hearing: '⚖️',
  cash: '💵',
  payment: '💵',
  dollar: '💵',
  user: '👤',
  users: '👥',
  driver: '🚗',
  map: '🗺️',
  jurisdiction: '🗺️',
  queue: '📋',
  list: '📋',
  chat: '💬',
  assistant: '🤖',
  robot: '🤖',
  book: '📖',
  library: '📖',
  settings: '⚙️',
  admin: '⚙️',
  gear: '⚙️',
  shield: '🛡️',
  warning: '⚠️',
  alert: '🚦',
  event: '🗓️',
  calendar: '🗓️',
  route: '🧭',
  table: '🗂️',
  field: '🔡',
  key: '🔑',
  lock: '🔒',
  version: '🏷️',
  build: '🏗️',
  pipeline: '🏗️',
  audit: '📜',
  log: '📜',
  brand: '🎨',
  state: '🔀',
  machine: '🔀',
  api: '🔌',
  endpoint: '🔌',
  feature: '✨',
  package: '📦',
  violation: '🚨',
  document: '📄',
  glossary: '🔤',
  rule: '📏',
}

export default function Icon({ hint }: { hint?: string | null }) {
  const key = (hint || '').trim().toLowerCase()
  const glyph = ICONS[key] || '•'
  return (
    <span aria-hidden="true" className="nav-icon">
      {glyph}
    </span>
  )
}
