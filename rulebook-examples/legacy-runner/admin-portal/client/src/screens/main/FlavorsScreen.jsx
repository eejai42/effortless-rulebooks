import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ScreenHeader from "../../components/ScreenHeader.jsx";
import TagChip, { tagsForFlavor } from "../../components/TagChip.jsx";

export default function FlavorsScreen({ screen, projectRulebook }) {
  const navigate   = useNavigate();
  const flavors      = projectRulebook?.RulebookFlavors?.data || [];
  const flavorTags   = projectRulebook?.FlavorTags?.data || [];
  const rulebookTags = projectRulebook?.RulebookTags?.data || [];

  // Active tag filters: Set of TagIds that must ALL be present
  const [activeFilters, setActiveFilters] = useState(new Set());

  const categories = [...new Set(rulebookTags.map((t) => t.Category))].sort();

  const toggleFilter = (tagId) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      next.has(tagId) ? next.delete(tagId) : next.add(tagId);
      return next;
    });
  };

  const filtered = flavors.filter((f) => {
    if (activeFilters.size === 0) return true;
    const myTagIds = new Set(
      (flavorTags || []).filter((ft) => ft.Flavor === f.FlavorId).map((ft) => ft.Tag)
    );
    return [...activeFilters].every((id) => myTagIds.has(id));
  });

  const switchProject = (slug) => {
    navigate(`/developer/${encodeURIComponent(slug)}`);
  };

  return (
    <>
      <ScreenHeader screen={screen} />

      {/* Tag filter panel */}
      <div className="filter-panel">
        {categories.map((cat) => {
          const catTags = rulebookTags.filter((t) => t.Category === cat);
          return (
            <div key={cat} className="filter-group">
              <span className="filter-label">{cat}:</span>
              {catTags.map((t) => (
                <button key={t.TagId}
                  className={`tag-filter-btn ${activeFilters.has(t.TagId) ? "active" : ""}`}
                  style={{ borderColor: t.Color, color: activeFilters.has(t.TagId) ? "#fff" : t.Color,
                           background: activeFilters.has(t.TagId) ? t.Color : "transparent" }}
                  onClick={() => toggleFilter(t.TagId)}>
                  {t.Emoji} {t.Label}
                </button>
              ))}
            </div>
          );
        })}
        {activeFilters.size > 0 && (
          <div className="filter-group">
            <button className="btn secondary" onClick={() => setActiveFilters(new Set())}>
              Clear filters ({activeFilters.size})
            </button>
            <span className="muted small">{filtered.length} of {flavors.length} shown</span>
          </div>
        )}
      </div>

      {/* Flavor cards */}
      <div className="cards" style={{ marginTop: 16 }}>
        {filtered.map((f) => {
          const tags = tagsForFlavor(f.FlavorId, flavorTags, rulebookTags);
          const logoUrl = `/api/projects/${encodeURIComponent(f.ProjectSlug)}/logo.png`;
          return (
            <div key={f.FlavorId} className="card flavor-card">
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <img
                  src={logoUrl}
                  alt=""
                  onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
                  style={{
                    width: 56, height: 56, borderRadius: 10, objectFit: "cover",
                    flexShrink: 0, background: "#f6f4ef",
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
                    {tags.map((t) => <TagChip key={t.TagId} tag={t} />)}
                  </div>
                  <div className="big clickable" style={{ fontSize: 15 }}
                       onClick={() => switchProject(f.ProjectSlug)}>
                    {f.DisplayName}
                  </div>
                  <div className="sub">{f.Tagline || f.LearningFocus}</div>
                </div>
              </div>
              <div className="muted small" style={{ marginTop: 10 }}>
                {f.EntityCount}e · {f.CalculatedCount}c · {f.AggregationCount}a · {f.LookupCount}l
                &ensp;<span className="pill">{f.Complexity}</span>
              </div>
              {f.GoodAnswerKeyFor && (
                <div className="muted small">Answer key for: <span className="mono">{f.GoodAnswerKeyFor}</span></div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
