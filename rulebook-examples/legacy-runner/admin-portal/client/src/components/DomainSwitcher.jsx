import { useEffect, useRef, useState } from "react";
import * as Icons from "lucide-react";

export default function DomainSwitcher({ projects, activeId, onPick }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef(null);
  const searchRef = useRef(null);

  const all    = projects || [];
  const active = all.find((p) => p.id === activeId);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    // Focus the search box when opening
    setTimeout(() => searchRef.current?.focus(), 0);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const q = query.trim().toLowerCase();
  const filtered = all.filter((p) => {
    if (!q) return true;
    const hay = `${p.id} ${p.displayName || ""} ${p.name || ""} ${p.tagline || ""} ${p.description || ""}`.toLowerCase();
    return hay.includes(q);
  });

  const pick = (id) => {
    setOpen(false);
    setQuery("");
    if (id !== activeId) onPick(id);
  };

  return (
    <div className="domain-switcher-wrap" ref={wrapRef}>
      <button
        type="button"
        className="domain-switcher-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="Switch domain"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {active?.logoUrl ? (
          <img
            src={active.logoUrl}
            alt=""
            className="domain-switcher-btn-logo"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        ) : (
          <span className="domain-switcher-btn-logo placeholder">
            <Icons.Box size={14} />
          </span>
        )}
        <Icons.ChevronDown size={14} className="domain-switcher-caret" />
      </button>

      {open && (
        <div className="domain-switcher-menu" role="listbox">
          <div className="domain-switcher-search">
            <Icons.Search size={14} className="domain-switcher-search-icon" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Filter domains…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="domain-switcher-list">
            {filtered.length === 0 && (
              <div className="domain-switcher-empty">No matches</div>
            )}
            {filtered.map((p) => (
              <button
                type="button"
                key={p.id}
                role="option"
                aria-selected={p.id === activeId}
                className={`domain-switcher-item${p.id === activeId ? " active" : ""}`}
                onClick={() => pick(p.id)}
              >
                {p.logoUrl ? (
                  <img
                    src={p.logoUrl}
                    alt=""
                    className="domain-switcher-item-logo"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <span className="domain-switcher-item-logo placeholder">
                    <Icons.Box size={12} />
                  </span>
                )}
                <span className="domain-switcher-item-name">
                  {p.displayName || p.name || p.id}
                </span>
                {p.id === activeId && (
                  <Icons.Check size={14} className="domain-switcher-item-check" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
