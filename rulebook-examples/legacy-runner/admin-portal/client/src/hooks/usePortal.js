import { useState, useEffect, useCallback } from "react";
import { api, makeDomainApi } from "../lib/api.js";
import { toast } from "../lib/toast.js";

// Top-level portal state: identity, portal config (project rulebook),
// per-user domain-state. Per-domain *demo* rulebooks are fetched on demand
// by `useDomainRulebook(domain)` since the app has no global "active domain".
export function usePortal() {
  const [me, setMe]                           = useState(null);
  const [projectRulebook, setProjectRulebook] = useState(null);
  const [projects, setProjects]               = useState({ projects: [] });
  const [domainState, setDomainState]         = useState({ states: [], currentRevisions: {} });

  const reload = useCallback(async () => {
    try {
      const [m, prb, pj, ds] = await Promise.all([
        api.get("/api/me"),
        api.get("/api/project-rulebook"),
        api.get("/api/projects"),
        api.get("/api/portal/me/domain-state").catch(() => ({ states: [], currentRevisions: {} })),
      ]);
      setMe(m);
      setProjectRulebook(prb);
      setProjects(pj);
      setDomainState(ds);
    } catch (e) {
      toast("Failed to load portal: " + e.message, "error");
    }
  }, []);

  const reloadDomainState = useCallback(async () => {
    try {
      const ds = await api.get("/api/portal/me/domain-state");
      setDomainState(ds);
    } catch { /* non-fatal */ }
  }, []);

  // Cheap refetch of /api/projects only — used by the domain pickers to pick
  // up freshly-bumped folder mtimes after opening a domain. Doesn't touch
  // the (much heavier) project rulebook or identity.
  const reloadProjects = useCallback(async () => {
    try {
      const pj = await api.get("/api/projects");
      setProjects(pj);
    } catch { /* non-fatal */ }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return { me, projectRulebook, projects, domainState, reload, reloadDomainState, reloadProjects };
}

// Fetch the rulebook for a specific demo domain. Returns `null` until loaded
// (or while `domain` is null). Re-fetches when `domain` changes.
export function useDomainRulebook(domain) {
  const [rulebook, setRulebook] = useState(null);
  useEffect(() => {
    if (!domain) { setRulebook(null); return; }
    let cancelled = false;
    const dApi = makeDomainApi(domain);
    dApi.get("/api/rulebook")
      .then((rb) => { if (!cancelled) setRulebook(rb); })
      .catch((e) => { if (!cancelled) { setRulebook(null); toast(`Could not load rulebook for ${domain}: ${e.message}`, "error"); } });
    return () => { cancelled = true; };
  }, [domain]);
  return rulebook;
}
