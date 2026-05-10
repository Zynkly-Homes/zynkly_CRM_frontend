import React, { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "../hooks/useAuth";
import { DashboardLayout } from "../templates/DashboardLayout";
import { selectAccessData } from "../store/slices/accessSlice";
import { LoaderOverlay } from "../atoms/LoaderOverlay";
import { NavigationProgress } from "../atoms/NavigationProgress";

// ── Lazy-loaded pages ──────────────────────────────────────────────────────
const LoginPage          = lazy(() => import("../pages/LoginPage").then(m => ({ default: m.LoginPage })));
const ForgotPasswordPage = lazy(() => import("../pages/ForgotPasswordPage"));
const CreatePasswordPage = lazy(() => import("../pages/CreatePasswordPage"));
const DashboardPage      = lazy(() => import("../pages/dashboard-admin/DashboardPage").then(m => ({ default: m.DashboardPage })));
const SettingConfig      = lazy(() => import("../pages/setting-config"));
const ApiKeyPage         = lazy(() => import("../pages/setting-config/ApiKeyPage"));
const BookingPage        = lazy(() => import("../pages/booking-management"));
const AdminDashboard     = lazy(() => import("../pages/dashboard/admin-dashboard/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const ManagerDashboard   = lazy(() => import("../pages/dashboard/manager-dashboard/ManagerDashboard").then(m => ({ default: m.ManagerDashboard })));
const Course             = lazy(() => import("../pages/Course"));
const NotFoundPage       = lazy(() => import("../pages/NotFoundPage"));

const PageLoader = () => <LoaderOverlay show />;

// ── Helpers ────────────────────────────────────────────────────────────────

function rolePermitted(user: any, allowed: string[]): boolean {
  const role = (user?.role_name || "").toLowerCase();
  return allowed.some(r => role.includes(r.toLowerCase()));
}

function dashboardForRole(roleName: string): string {
  const role = (roleName || "").toLowerCase();
  if (role.includes("super"))   return "/dashboard/admin";
  if (role.includes("manager")) return "/dashboard/manager";
  return "/booking-management";
}

// ── ProtectedRoute ─────────────────────────────────────────────────────────
const ProtectedRoute: React.FC<{
  children:     React.ReactNode;
  moduleId?:    string;
  roleAllowed?: string[];
}> = ({ children, moduleId, roleAllowed }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const access = useSelector((s: any) => selectAccessData(s));
  const user   = useSelector((s: any) => s.user?.userData || s.user);

  if (isLoading)       return <LoaderOverlay show />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roleAllowed && !rolePermitted(user, roleAllowed)) return <Navigate to="/" replace />;
  if (moduleId && !access[moduleId]?.view) return <Navigate to="/no-access" replace />;

  return <>{children}</>;
};

// ── PublicRoute ────────────────────────────────────────────────────────────
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (!isLoading && isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// ── RedirectToHome ─────────────────────────────────────────────────────────
const RedirectToHome: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const user = useSelector((s: any) => s.user?.userData || s.user);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { navigate("/login", { replace: true }); return; }
    navigate(dashboardForRole(user?.role_name), { replace: true });
  }, [isAuthenticated, isLoading, user?.role_name, navigate]);

  return null;
};

// ── Layout helper ──────────────────────────────────────────────────────────
const InLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DashboardLayout>{children}</DashboardLayout>
);

// ── AppRoutes ──────────────────────────────────────────────────────────────
export const AppRoutes: React.FC = () => {
  return (
    <>
      <NavigationProgress />
      <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/login"               element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/forgot-password"     element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
        <Route path="auth/create-password" element={<PublicRoute><CreatePasswordPage type="create" /></PublicRoute>} />
        <Route path="auth/reset-password"  element={<PublicRoute><CreatePasswordPage type="reset" /></PublicRoute>} />
        <Route path="/c"                   element={<Course />} />

        {/* Root redirect */}
        <Route path="/" element={<ProtectedRoute><RedirectToHome /></ProtectedRoute>} />

        {/* Dashboards */}
        <Route path="/dashboard-admin"          element={<ProtectedRoute moduleId="data-dashboard"><DashboardPage /></ProtectedRoute>} />
        <Route path="/dashboard-tso"            element={<ProtectedRoute moduleId="dashboard-tso"><DashboardPage /></ProtectedRoute>} />
        <Route path="/dashboard-manager"        element={<ProtectedRoute moduleId="dashboard-manager"><DashboardPage /></ProtectedRoute>} />
        <Route path="/dashboard-team-leader"    element={<ProtectedRoute moduleId="dashboard-team-leader"><DashboardPage /></ProtectedRoute>} />
        <Route path="/dashboard-branch-manager" element={<ProtectedRoute moduleId="dashboard-branch-manager"><DashboardPage /></ProtectedRoute>} />
        <Route path="/dashboard-xyz"            element={<ProtectedRoute moduleId="dashboard-xyz"><DashboardPage /></ProtectedRoute>} />
        <Route path="/help-chat"                element={<ProtectedRoute><DashboardLayout><DashboardPage /></DashboardLayout></ProtectedRoute>} />

        {/* Settings & Config — URM group (user/role/module) + API Key */}
        <Route
          path="/setting-config/user-management"
          element={
            <ProtectedRoute moduleId="user_management">
              <InLayout><SettingConfig /></InLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/setting-config/role-management"
          element={
            <ProtectedRoute moduleId="role_management">
              <InLayout><SettingConfig /></InLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/setting-config/module-management"
          element={
            <ProtectedRoute moduleId="module_management">
              <InLayout><SettingConfig /></InLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/setting-config/api-key-management"
          element={
            <ProtectedRoute moduleId="api_key_management">
              <InLayout><ApiKeyPage /></InLayout>
            </ProtectedRoute>
          }
        />

        {/* New Dashboard pages */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute roleAllowed={["super"]}>
              <InLayout><AdminDashboard /></InLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/manager"
          element={
            <ProtectedRoute roleAllowed={["manager"]}>
              <InLayout><ManagerDashboard /></InLayout>
            </ProtectedRoute>
          }
        />

        {/* Booking Management */}
        <Route
          path="/booking-management"
          element={
            <ProtectedRoute moduleId="booking_management">
              <InLayout><BookingPage /></InLayout>
            </ProtectedRoute>
          }
        />

        {/* Legacy redirect */}
        <Route path="/user-management" element={<Navigate to="/setting-config/user-management" replace />} />

        {/* No Access */}
        <Route
          path="/no-access"
          element={
            <ProtectedRoute>
              <InLayout>
                <div className="text-center py-16">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Access</h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    You do not have permission to access this page. Please contact your administrator.
                  </p>
                </div>
              </InLayout>
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<InLayout><NotFoundPage /></InLayout>} />
      </Routes>
      </Suspense>
    </>
  );
};
