import { useState, useEffect } from "react";
import { registerToast } from "../lib/toast.js";

export default function Toast() {
  const [t, setT] = useState(null);
  useEffect(() => {
    registerToast(setT);
    return () => registerToast(null);
  }, []);
  if (!t) return null;
  return (
    <div className={`toast ${t.kind || ""}`}>{t.message}</div>
  );
}
