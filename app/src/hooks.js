import { useEffect, useState } from "react";

// Load one or more tables; the component renders loading / error / data.
// Errors are surfaced, never swallowed into an empty default.
// Bump `version` after a write (see api.invalidate) to re-read from the views.
export function useTables(tables, loader, version = 0) {
  const [state, setState] = useState({ status: "loading", data: null, error: null });
  const key = `${tables.join("|")}#${version}`;
  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading", data: null, error: null });
    loader()
      .then((data) => {
        if (!cancelled) setState({ status: "ready", data, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ status: "error", data: null, error });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return state;
}
