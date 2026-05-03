import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { selectAccessData } from "../../store/slices/accessSlice";
import { selectUserData } from "../../store/slices/userSlice";

import WarningModal from "../../atoms/WarningModal";

import { useSidebar }    from "./hooks/useSidebar";
import { useDarkMode }   from "./hooks/useDarkMode";
import { useAuth }       from "./hooks/useAuth";
import { useNavigation } from "./hooks/useNavigation";

import SidebarLogo from "./useMemo/components/SidebarLogo";
import NavList     from "./useMemo/components/NavList";
import UserProfile from "./useMemo/components/UserProfile";
import MobilePanel from "./useMemo/components/MobilePanel";
import { SidebarProps, UserProfileProps } from "./types";

export const Sidebar: React.FC<SidebarProps> = ({ collapsed: collapsedProp, onCollapsedChange }) => {
  const navigate = useNavigate();
  const accessData    = useSelector((s: any) => selectAccessData(s));
  const userDataRedux = useSelector(selectUserData);

  const userName  = userDataRedux?.user_name  || "User";
  const userEmail = userDataRedux?.user_email || "";

  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { showLogoutModal, handleLogoutClick, handleCancelLogout, handleLogout } = useAuth();
  const { collapsed, isMobile, mobileExpanded, openItems, setCollapsed, setMobileExpanded, toggleAccordion, onNavClick } =
    useSidebar({ collapsedProp, onCollapsedChange });

  const navigation = useNavigation(accessData);

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  // Track hover on the entire collapsed sidebar
  const [sidebarHovered, setSidebarHovered] = useState(false);

  const handleProfileClick = useCallback(() => {
    navigate("/profile");
    setProfileDropdownOpen(false);
    onNavClick();
  }, [navigate, onNavClick]);

  const profileProps: Omit<UserProfileProps, "isCollapsed"> = {
    userName,
    userEmail,
    isDarkMode,
    profileDropdownOpen,
    onToggleDropdown : () => setProfileDropdownOpen((o) => !o),
    onToggleDarkMode : toggleDarkMode,
    onProfileClick   : handleProfileClick,
    onLogoutClick    : handleLogoutClick,
  };

  const navListProps = {
    items      : navigation,
    isCollapsed: collapsed,
    openItems,
    onNavClick,
    onToggle   : toggleAccordion,
  };

  return (
    <>
      <WarningModal
        isActive={showLogoutModal}
        title="Confirm Logout"
        description="Are you sure you want to logout from your account?"
        onClose={handleCancelLogout}
        onProceed={handleLogout}
      />

      {/* ── Desktop sidebar ── */}
      {!isMobile && (
        <aside
          className="h-full w-full bg-white dark:bg-[var(--sc-dark-bg-sidebar)]"
          onMouseEnter={() => collapsed && setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
        >
          <div className="flex flex-col h-full">
            <SidebarLogo
              isCollapsed={collapsed}
              isHovered={sidebarHovered}
              onCollapse={() => setCollapsed(true)}
              onExpand={() => { setCollapsed(false); setSidebarHovered(false); }}
            />

            {/* ul has NO padding — nav items own their own px-3 */}
            <nav className="mt-2 flex-1 overflow-auto sc-scrollbar">
              <ul className="space-y-1">
                <NavList {...navListProps} />
              </ul>
            </nav>

            <UserProfile isCollapsed={collapsed} {...profileProps} />
          </div>
        </aside>
      )}

      {/* ── Mobile slide panel (portal) ── */}
      {isMobile && (
        <MobilePanel
          expanded={mobileExpanded}
          onClose={() => setMobileExpanded(false)}
          {...profileProps}
        >
          <NavList {...navListProps} />
        </MobilePanel>
      )}
    </>
  );
};

export default Sidebar;
