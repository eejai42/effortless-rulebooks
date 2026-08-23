export default function TagChip({ tag }) {
  if (!tag) return null;
  return (
    <span
      className="tag-chip"
      style={{ background: tag.Color || "#333", color: "#fff" }}
      title={tag.Description || tag.Label}
    >
      {tag.Emoji} {tag.Label}
    </span>
  );
}

// Helper: join FlavorTags → RulebookTags for a given FlavorId
export function tagsForFlavor(flavorId, flavorTags, rulebookTags) {
  const tagIds = (flavorTags || [])
    .filter((ft) => ft.Flavor === flavorId)
    .map((ft) => ft.Tag);
  return tagIds
    .map((id) => (rulebookTags || []).find((t) => t.TagId === id))
    .filter(Boolean);
}
