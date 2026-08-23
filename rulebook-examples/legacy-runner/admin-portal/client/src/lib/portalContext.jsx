import { createContext, useContext } from "react";

export const PortalContext = createContext(null);

export function usePortalCtx() {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error("usePortalCtx must be used inside <PortalContext.Provider>");
  return ctx;
}
