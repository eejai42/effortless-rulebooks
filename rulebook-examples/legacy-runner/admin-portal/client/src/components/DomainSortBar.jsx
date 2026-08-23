import { DOMAIN_SORT_MODES } from "../lib/timeSince.js";

export default function DomainSortBar({ mode, onChange }) {
  return (
    <div className="domain-sort-bar" style={{
      display: "flex", alignItems: "center", gap: 8,
      margin: "8px 0 16px", flexWrap: "wrap", fontSize: 13,
    }}>
      <span style={{ opacity: 0.7 }}>Sort:</span>
      {DOMAIN_SORT_MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onChange(m.id)}
          className={`domain-sort-pill${mode === m.id ? " active" : ""}`}
          style={{
            padding: "4px 10px",
            borderRadius: 999,
            border: "1px solid " + (mode === m.id ? "#b48cff" : "#3a3a4a"),
            background: mode === m.id ? "rgba(180,140,255,0.18)" : "transparent",
            color: mode === m.id ? "#e9dfff" : "#bcbccc",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
