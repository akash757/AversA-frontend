export const DASHBOARD_HOME_ROUTE = "/dashboard";

export const ROLES = {
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  PRODUCT_MANAGER: "product_manager",
  PROJECT_MANAGER: "project_manager",
  DEVELOPER: "developer",
  DESIGNER: "designer",
  QA: "qa",
  SALES: "sales",
  DEVOPS: "devops",
  CLIENT: "client",
};

export const PERMISSIONS = {
  VIEW_DASHBOARD: "view:dashboard",
  VIEW_PROJECTS: "view:projects",
  VIEW_MEETINGS: "view:meetings",
  VIEW_USERS: "view:users",
  MANAGE_USERS: "manage:users",
  MANAGE_SETTINGS: "manage:settings",
  MANAGE_ORGANIZATIONS: "manage:organizations",
};

const ALL_PERMISSIONS = Object.values(PERMISSIONS);

export const ROLE_PERMISSIONS = {
  [ROLES.SUPERADMIN]: ALL_PERMISSIONS,
  [ROLES.ADMIN]: ALL_PERMISSIONS.filter((p) => p !== PERMISSIONS.MANAGE_ORGANIZATIONS),
  [ROLES.PRODUCT_MANAGER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.VIEW_MEETINGS,
    PERMISSIONS.VIEW_USERS,
  ],
  [ROLES.PROJECT_MANAGER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.VIEW_MEETINGS,
    PERMISSIONS.VIEW_USERS,
  ],
  [ROLES.DEVELOPER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.VIEW_MEETINGS,
  ],
  [ROLES.DESIGNER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.VIEW_MEETINGS,
  ],
  [ROLES.QA]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.VIEW_MEETINGS,
  ],
  [ROLES.SALES]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.VIEW_MEETINGS,
  ],
  [ROLES.DEVOPS]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.VIEW_MEETINGS,
    PERMISSIONS.MANAGE_SETTINGS,
  ],
  [ROLES.CLIENT]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.VIEW_MEETINGS,
  ],
};

export const DASHBOARD_MENU_ITEMS = [
  { label: "Dashboard", href: "/dashboard", permission: PERMISSIONS.VIEW_DASHBOARD },
  { label: "Projects", href: "/projects", permission: PERMISSIONS.VIEW_PROJECTS },
  { label: "Meetings", href: "/meetings", permission: PERMISSIONS.VIEW_MEETINGS },
  { label: "Team", href: "/users", permission: PERMISSIONS.VIEW_USERS },
  {
    label: "Organizations",
    href: "/organizations",
    permission: PERMISSIONS.MANAGE_ORGANIZATIONS,
  },
  { label: "Settings", href: "/settings/profile", permission: PERMISSIONS.MANAGE_SETTINGS },
];

const ROUTE_RULES = [
  { prefix: "/dashboard", permission: PERMISSIONS.VIEW_DASHBOARD },
  { prefix: "/projects", permission: PERMISSIONS.VIEW_PROJECTS },
  { prefix: "/meetings", permission: PERMISSIONS.VIEW_MEETINGS },
  { prefix: "/users", permission: PERMISSIONS.VIEW_USERS },
  { prefix: "/organizations", permission: PERMISSIONS.MANAGE_ORGANIZATIONS },
  { prefix: "/settings/profile", permission: PERMISSIONS.VIEW_DASHBOARD },
  { prefix: "/settings", permission: PERMISSIONS.MANAGE_SETTINGS },
];

export function hasPermission(role, permission) {
  if (!role) {
    return false;
  }

  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export function getMenuForRole(role) {
  return DASHBOARD_MENU_ITEMS.filter((item) => hasPermission(role, item.permission));
}

export function canAccessRoute(role, pathname) {
  const matchedRule = ROUTE_RULES.find((rule) => pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`));

  if (!matchedRule) {
    return true;
  }

  return hasPermission(role, matchedRule.permission);
}

export const ROLE_HOME_ROUTES = {
  [ROLES.SUPERADMIN]: "/dashboard",
  [ROLES.ADMIN]: "/dashboard",
  [ROLES.PRODUCT_MANAGER]: "/dashboard",
  [ROLES.PROJECT_MANAGER]: "/dashboard",
  [ROLES.DEVELOPER]: "/dashboard",
  [ROLES.DESIGNER]: "/dashboard",
  [ROLES.QA]: "/dashboard",
  [ROLES.SALES]: "/dashboard",
  [ROLES.DEVOPS]: "/dashboard",
  [ROLES.CLIENT]: "/dashboard",
};

export function getDashboardHomeRoute(role) {
  if (!role) {
    return DASHBOARD_HOME_ROUTE;
  }
  return ROLE_HOME_ROUTES[role] || DASHBOARD_HOME_ROUTE;
}
