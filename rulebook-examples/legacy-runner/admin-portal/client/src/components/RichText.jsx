// Tiny markdown-flavored renderer for the rulebook's *_rich fields.
// Supports: paragraphs (blank-line separated), **bold**, *italic*, `inline code`.
// Deliberately small — bigger than this and we should pull a real library.
// Editing happens elsewhere; this is read-only render.

export default function RichText({ text, className = "" }) {
  if (!text || typeof text !== "string") return null;
  const paragraphs = text.split(/\n\s*\n/);
  return (
    <div className={`rich-text ${className}`}>
      {paragraphs.map((p, i) => (
        <p key={i}>{renderInline(p)}</p>
      ))}
    </div>
  );
}

export function RichInline({ text }) {
  if (!text || typeof text !== "string") return null;
  return <span className="rich-text rich-inline">{renderInline(text)}</span>;
}

// Tokenize **bold**, *italic*, `code` in a single pass. Order matters: we
// match the longest delimiters first (**) so they aren't eaten by *italic*.
function renderInline(text) {
  const out = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let m;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) out.push(<strong key={key++}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("*")) out.push(<em key={key++}>{tok.slice(1, -1)}</em>);
    else if (tok.startsWith("`")) out.push(<code key={key++}>{tok.slice(1, -1)}</code>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
