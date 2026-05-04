import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Settings } from "lucide-react";
import { useSelector } from "react-redux";
import { selectAccessData } from "../../store/slices/accessSlice";
import UserManagementList from "../user-management/UserManagementList";
import RoleManagement from "../user-management/RoleManagement";
import ModuleManagement from "./ModuleManagement";
import { COLORS } from "../../theme/colors";

const TABS = [
  { label: "User Management",   path: "/setting-config/user-management",   moduleKey: "user_management"   },
  { label: "Role Management",   path: "/setting-config/role-management",   moduleKey: "role_management"   },
  { label: "Module Management", path: "/setting-config/module-management", moduleKey: "module_management" },
] as const;

type TabLabel = typeof TABS[number]["label"];

function getActiveLabel(pathname: string): TabLabel {
  if (pathname.includes("role-management"))   return "Role Management";
  if (pathname.includes("module-management")) return "Module Management";
  return "User Management";
}

const SettingConfig: React.FC = () => {
  const navigate     = useNavigate();
  const { pathname } = useLocation();
  const access       = useSelector(selectAccessData) as Record<string, { view?: boolean; edit?: boolean }> | null;

  const activeLabel = getActiveLabel(pathname);

  const visibleTabs = TABS.filter((t) =>
    Boolean(access?.[t.moduleKey]?.view || access?.[t.moduleKey]?.edit)
  );

  return (
    <div className="globalPadding">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
          <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{activeLabel}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your {activeLabel.toLowerCase()} and configurations
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 mb-4">
        {visibleTabs.map((tab) => {
          const isActive = activeLabel === tab.label;
          const activeStyle: React.CSSProperties | undefined = isActive
            ? ({ "--primary": COLORS.primary.DEFAULT } as React.CSSProperties)
            : undefined;
          return (
            <button
              key={tab.label}
              onClick={() => navigate(tab.path)}
              style={activeStyle}
              className={
                isActive
                  ? "px-4 py-2 text-sm font-semibold border-b-2 border-[var(--primary)] text-[var(--primary)]"
                  : "px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeLabel === "User Management"   && <UserManagementList />}
      {activeLabel === "Role Management"   && <RoleManagement />}
      {activeLabel === "Module Management" && <ModuleManagement />}
    </div>
  );
};

export default SettingConfig;
