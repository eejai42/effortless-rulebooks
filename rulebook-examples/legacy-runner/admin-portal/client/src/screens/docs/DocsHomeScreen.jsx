import { useNavigate } from "react-router-dom";

export default function DocsHomeScreen({ projectRulebook }) {
  const navigate = useNavigate();
  const invariants = projectRulebook?.FramingInvariants?.data || [];
  const axioms     = projectRulebook?.OntologyAxioms?.data || [];
  const fieldTypes = projectRulebook?.FieldTypeTaxonomy?.data || [];
  const glossary   = projectRulebook?.Glossary?.data || [];

  const sections = [
    { label: "Framing Invariants", count: invariants.length, path: "/docs/framing",     desc: "Mistakes to avoid — wrong vs right framing, severity, and the axiom each protects.", icon: "🚫" },
    { label: "Ontology Axioms",    count: axioms.length,     path: "/docs/methodology", desc: "Positive-form load-bearing claims. If any is dropped, the methodology no longer holds.", icon: "🔬" },
    { label: "Field Types",        count: fieldTypes.length, path: "/docs/field-types", desc: "Taxonomy of ERB field types: raw, calculated, aggregation, lookup, relationship.", icon: "🧩" },
    { label: "Glossary",           count: glossary.length,   path: "/docs/glossary",    desc: "Term definitions used consistently across the rulebook and documentation.", icon: "📚" },
  ];

  return (
    <>
      <h2 className="h1">Docs</h2>
      <div className="story-banner">
        Reference documentation for ERB methodology — framing invariants, ontology axioms, field-type taxonomy, and glossary.
        All content is authored in the project rulebook and rendered here.
      </div>
      <div className="cards">
        {sections.map((s) => (
          <div key={s.path} className="card clickable" onClick={() => navigate(s.path)}>
            <h3>{s.icon} {s.label}</h3>
            <div className="big">{s.count}</div>
            <div className="sub">{s.desc}</div>
          </div>
        ))}
      </div>
    </>
  );
}
