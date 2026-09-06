import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Link } from "react-router-dom";
import "./styles.css";
import Shell from "./Shell.jsx";
import { Home, GettingStarted, AboutRulebook } from "./pages/Home.jsx";
import { Concepts, ConceptDetail, Skills, SkillDetail } from "./pages/Learn.jsx";
import { Projects, ProjectDetail } from "./pages/Projects.jsx";
import { Consistency, ProgressPage } from "./pages/Health.jsx";
import { Conformance } from "./pages/Conformance.jsx";
import { Tools } from "./pages/Tools.jsx";

// Route paths mirror MobileRoutes.Path in the root rulebook; MobileRoutes.Screen
// names the component here. Keep the two in step: a route added below without a
// rulebook row (or vice versa) is a consistency gap, not a convenience.
const router = createBrowserRouter([
  {
    path: "/",
    element: <Shell />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Home /> },
      { path: "getting-started", element: <GettingStarted /> },
      { path: "about-the-rulebook", element: <AboutRulebook /> },
      { path: "concepts", element: <Concepts /> },
      { path: "concepts/:concept", element: <ConceptDetail /> },
      { path: "skills", element: <Skills /> },
      { path: "skills/:skill", element: <SkillDetail /> },
      { path: "projects", element: <Projects mode="all" /> },
      { path: "toys", element: <Projects mode="toys" /> },
      { path: "examples", element: <Projects mode="examples" /> },
      { path: "projects/:slug", element: <ProjectDetail /> },
      { path: "consistency", element: <Consistency /> },
      { path: "progress", element: <ProgressPage /> },
      { path: "conformance", element: <Conformance /> },
      { path: "tools", element: <Tools /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

function NotFound() {
  return (
    <section className="hero compact">
      <p className="eyebrow">Not found</p>
      <h1>No route here</h1>
      <p className="summary">
        This path is not one of the routes modeled in the root rulebook. <Link to="/">Back to the overview.</Link>
      </p>
    </section>
  );
}

function RouteError() {
  return (
    <main className="content">
      <div className="panel error" role="alert">
        <h3>The explorer hit an error rendering this route</h3>
        <p>Check the browser console for the stack trace. <a href="/">Reload the overview.</a></p>
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
