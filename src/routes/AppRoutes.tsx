import React, { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "../hooks/useAuth";
import { DashboardLayout } from "../templates/DashboardLayout";
import { selectAccessData } from "../store/slices/accessSlice";
import { LoaderOverlay } from "../atoms/LoaderOverlay";

// ── Lazy-loaded pages ──────────────────────────────────────────────────────
const LoginPage          = lazy(() => import("../pages/LoginPage").then(m => ({ default: m.LoginPage })));
const ForgotPasswordPage = lazy(() => import("../pages/ForgotPasswordPage"));
const CreatePasswordPage = lazy(() => import("../pages/CreatePasswordPage"));
const DashboardPage      = lazy(() => import("../pages/dashboard-admin/DashboardPage").then(m => ({ default: m.DashboardPage })));
const SettingConfig      = lazy(() => import("../pages/setting-config"));
const ApiKeyPage         = lazy(() => import("../pages/setting-config/ApiKeyPage"));
const BookingPage        = lazy(() => import("../pages/booking-management"));
const Course             = lazy(() => import("../pages/Course"));
const NotFoundPage       = lazy(() => import("../pages/NotFoundPage"));

const PageLoader = () => <LoaderOverlay show />;

// ── ProtectedRoute ─────────────────────────────────────────────────────────
const ProtectedRoute: React.FC<{ children: React.ReactNode; moduleId?: string }> = ({ children, moduleId }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const access = useSelector((s: any) => selectAccessData(s));
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const mode = searchParams.get("mode");

  if (isLoading) return <LoaderOverlay show />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (moduleId) {
    const moduleAccess = access[moduleId] || {};
    if (!moduleAccess.view) return <Navigate to="/no-access" replace />;

    if (moduleId === "rules-management" && mode) {
      if (mode === "edit" && !moduleAccess.edit) {
        return <Navigate to={`/rules-management?bank_id=${searchParams.get("bank_id") || ""}&product_id=${searchParams.get("product_id") || ""}&mode=view`} replace />;
      }
      if (mode === "create" && !moduleAccess.create) {
        return <Navigate to={`/rules-management?bank_id=${searchParams.get("bank_id") || ""}&product_id=${searchParams.get("product_id") || ""}&mode=view`} replace />;
      }
    }
  }

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
  const user   = useSelector((s: any) => s.user?.userData || s.user);
  const access = useSelector((s: any) => selectAccessData(s));

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { navigate("/login", { replace: true }); return; }

    const norm: Record<string, any> = {};
    Object.keys(access || {}).forEach(key => {
      norm[key.replace(/-/g, "").replace(/_/g, "").toLowerCase()] = access[key];
    });

    const roleName = (user?.role_name || user?.role || user?.user_name || "").toLowerCase();

    if      (norm["dashboardxyz"]?.view)           navigate("/dashboard-xyz",            { replace: true });
    else if (norm["dashboardadmin"]?.view)          navigate("/dashboard-admin",          { replace: true });
    else if (norm["dashboardtso"]?.view)            navigate("/dashboard-tso",            { replace: true });
    else if (norm["dashboardmanager"]?.view)        navigate("/dashboard-manager",        { replace: true });
    else if (norm["dashboardteamleader"]?.view)     navigate("/dashboard-team-leader",    { replace: true });
    else if (norm["dashboardbranchmanager"]?.view)  navigate("/dashboard-branch-manager", { replace: true });
    else if (norm["usermanagement"]?.view)          navigate("/setting-config/user-management",    { replace: true });
    else if (norm["rolemanagement"]?.view)          navigate("/setting-config/role-management",    { replace: true });
    else if (norm["modulemanagement"]?.view)        navigate("/setting-config/module-management",  { replace: true });
    else if (norm["apikeymangement"]?.view)         navigate("/setting-config/api-key-management", { replace: true });
    else {
      if      (roleName.includes("tso"))                                    navigate("/dashboard-tso",          { replace: true });
      else if (roleName.includes("team") && roleName.includes("leader"))    navigate("/dashboard-team-leader",  { replace: true });
      else if (roleName.includes("manager"))                                 navigate("/dashboard-manager",      { replace: true });
      else                                                                   navigate("/setting-config/user-management", { replace: true });
    }
  }, [isAuthenticated, isLoading, user, access, navigate]);

  return null;
};

// ── Layout helper ──────────────────────────────────────────────────────────
const InLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DashboardLayout>{children}</DashboardLayout>
);

// ── AppRoutes ──────────────────────────────────────────────────────────────
export const AppRoutes: React.FC = () => {
  return (
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
  );
};
