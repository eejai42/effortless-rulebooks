import { useLocation, useParams } from "react-router-dom";
import { usePortalCtx } from "./portalContext.jsx";
import { useDomainRulebook } from "../hooks/usePortal.js";

// Match a screen template like "/developer/:domain/entities" to a concrete pathname.
function matchScreenTemplate(template, pathname) {
  if (!template) return false;
  const parts = template.split("/");
  const segs  = pathname.split("/");
  if (parts.length !== segs.length) return false;
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].startsWith(":")) continue;
    if (parts[i] !== segs[i]) return false;
  }
  return true;
}

// Helper used in route elements:
//   <Route path="entities" element={<S comp={EntitiesScreen} />} />
export default function S({ comp: Comp, ...extra }) {
  const ctx       = usePortalCtx();
  const location  = useLocation();
  const params    = useParams();
  const domain    = params.domain || null;
  const rulebook  = useDomainRulebook(domain);
  const screens   = ctx.projectRulebook?.AppScreens?.data || [];
  const screen    = screens.find((s) => matchScreenTemplate(s.Path, location.pathname));
  return <Comp {...ctx} rulebook={rulebook} screen={screen} domain={domain} {...extra} />;
}
