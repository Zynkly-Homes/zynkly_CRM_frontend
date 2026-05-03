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
const UserManagement     = lazy(() => import("../pages/user-management"));
const Course             = lazy(() => import("../pages/Course"));
const NotFoundPage       = lazy(() => import("../pages/NotFoundPage"));

const PageLoader = () => <LoaderOverlay show />;

// ── ProtectedRoute ─────────────────────────────────────────────────────────
const ProtectedRoute: React.FC<{ children: React.ReactNode; moduleId?: string }> = ({ children, moduleId }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const access = useSelector((s: any) => selectAccessData(s));
  const location = useLocation();
  const navigate = useNavigate();

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
  const user = useSelector((s: any) => s.user?.userData || s.user);
  const access = useSelector((s: any) => selectAccessData(s));

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    const normalizedAccess: Record<string, any> = {};
    Object.keys(access || {}).forEach(key => {
      normalizedAccess[key.replace(/-/g, "").toLowerCase()] = access[key];
    });

    const roleName = (user?.role_name || user?.role || user?.role_id || user?.user_name || "").toLowerCase();

    if (normalizedAccess["dashboardxyz"]?.view) {
      navigate("/dashboard-xyz", { replace: true });
    } else if (normalizedAccess["dashboardadmin"]?.view) {
      navigate("/dashboard-admin", { replace: true });
    } else if (normalizedAccess["dashboardtso"]?.view) {
      navigate("/dashboard-tso", { replace: true });
    } else if (normalizedAccess["dashboardmanager"]?.view) {
      navigate("/dashboard-manager", { replace: true });
    } else if (normalizedAccess["dashboardteamleader"]?.view) {
      navigate("/dashboard-team-leader", { replace: true });
    } else if (normalizedAccess["dashboardbranchmanager"]?.view) {
      navigate("/dashboard-branch-manager", { replace: true });
    } else {
      if (roleName.includes("tso")) {
        navigate("/dashboard-tso", { replace: true });
      } else if (roleName.includes("team") && roleName.includes("leader")) {
        navigate("/dashboard-team-leader", { replace: true });
      } else if (roleName.includes("manager")) {
        navigate("/dashboard-manager", { replace: true });
      } else {
        navigate("/dashboard-admin", { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, user, access, navigate]);

  return null;
};

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

        {/* Dashboard */}
        <Route path="/dashboard-admin"          element={<ProtectedRoute moduleId="data-dashboard"><DashboardPage /></ProtectedRoute>} />
        <Route path="/dashboard-tso"            element={<ProtectedRoute moduleId="dashboard-tso"><DashboardPage /></ProtectedRoute>} />
        <Route path="/dashboard-manager"        element={<ProtectedRoute moduleId="dashboard-manager"><DashboardPage /></ProtectedRoute>} />
        <Route path="/dashboard-team-leader"    element={<ProtectedRoute moduleId="dashboard-team-leader"><DashboardPage /></ProtectedRoute>} />
        <Route path="/dashboard-branch-manager" element={<ProtectedRoute moduleId="dashboard-branch-manager"><DashboardPage /></ProtectedRoute>} />
        <Route path="/dashboard-xyz"            element={<ProtectedRoute moduleId="dashboard-xyz"><DashboardPage /></ProtectedRoute>} />
        <Route path="/help-chat"                element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

        {/* User Management */}
        <Route
          path="/user-management"
          element={
            <DashboardLayout>
              <UserManagement />
            </DashboardLayout>
          }
        />

        {/* No Access */}
        <Route
          path="/no-access"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <div className="text-center py-10">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">No Access</h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    You do not have permission to access this page. Please contact your administrator.
                  </p>
                </div>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<DashboardLayout><NotFoundPage /></DashboardLayout>} />
      </Routes>
    </Suspense>
  );
};
