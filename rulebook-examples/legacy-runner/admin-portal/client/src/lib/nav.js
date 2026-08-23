// Display metadata for NavArea values. Used by Admin's Navigation/Screens grids.
export const AREAS = {
  root:      { label: "Root",      color: "#9aa1ad", icon: "Home" },
  viewer:    { label: "Viewer",    color: "#7280ad", icon: "Eye" },
  developer: { label: "Developer", color: "#b48cff", icon: "Wrench" },
  admin:     { label: "Admin",     color: "#f3b03e", icon: "Shield" },
  docs:      { label: "Docs",      color: "#4ade80", icon: "BookOpen" },
};

// Role tier comparison. Used by RoleSidebar to gate items via AppNavigation.MinRoleId.
export function roleMeetsMin(myRole, minRoleId, roles) {
  const min = roles.find((r) => r.RoleId === minRoleId);
  if (!min) return true;
  const tier = { read: 0, write: 1, "full-admin": 2 };
  const mine = tier[myRole?.AccessLevel] ?? 0;
  const req  = tier[min?.AccessLevel]    ?? 0;
  return mine >= req;
}
