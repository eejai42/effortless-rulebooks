import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const services = [
  {
    name: "Generated rulebook editor",
    description: "Inspect and edit the governing root rulebook.",
    href: "http://localhost:42442",
  },
  {
    name: "Generated API documentation",
    description: "Discover the live, view-backed API contract.",
    href: "http://localhost:42441/api/docs",
  },
  {
    name: "Generated API view health",
    description: "Confirm that every modeled view is available.",
    href: "http://localhost:42441/api/view-health",
  },
];

function App() {
  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Effortless Rulebooks</p>
        <h1>Root explorer launch shell</h1>
        <p className="summary">
          The repository entry point is running. This Phase 2 shell starts the
          generated editor and its view-backed API without depending on the
          legacy runner.
        </p>
      </section>

      <section aria-labelledby="services-heading">
        <h2 id="services-heading">Root services</h2>
        <div className="services">
          {services.map((service) => (
            <a className="service" href={service.href} key={service.name}>
              <span>{service.name}</span>
              <small>{service.description}</small>
            </a>
          ))}
        </div>
      </section>

      <p className="phase-note">
        Explorer navigation and domain routes are intentionally reserved for
        Phase 3.
      </p>
    </main>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
