import { useAuthContext } from "@/providers/AuthProvider";
import { getDashboardHomeRoute } from "@/lib/auth/dashboard-config";

const ROUTE_MAP = {
  superadmin: getDashboardHomeRoute(),
  admin: getDashboardHomeRoute(),
  developer: getDashboardHomeRoute(),
  product_manager: getDashboardHomeRoute(),
  project_manager: getDashboardHomeRoute(),
  qa: getDashboardHomeRoute(),
  sales: getDashboardHomeRoute(),
  devops: getDashboardHomeRoute(),
  client: getDashboardHomeRoute(),
};

/**
 * useAuth — hook that consumes the global AuthProvider state.
 *
 * Returns:
 *   user       – user object or null
 *   loading    – true while checking auth
 *   isLoggedIn – boolean shorthand
 *   handleLogout – clears tokens and redirects to /login
 *   dashboardPath – role-based dashboard path for the user
 */
export function useAuth() {
  const { user, loading, isLoggedIn, handleLogout, login } = useAuthContext();

  const dashboardPath = (() => {
    if (!user) return "/login";
    if (user.status === "pending") return "/pending-approval";
    return getDashboardHomeRoute(user.role);
  })();

  return {
    user,
    loading,
    isLoggedIn,
    handleLogout,
    login,
    dashboardPath,
  };
}
