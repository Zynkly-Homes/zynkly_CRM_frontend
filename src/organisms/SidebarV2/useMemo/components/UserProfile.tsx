import React from "react";
import { ChevronDown, Sun, Moon, User, LogOut } from "lucide-react";
import { clsx } from "clsx";
import { COLORS } from "../../../../theme/colors";
import { UserProfileProps } from "../../types";

// ── Avatar initials helper ─────────────────────────────────────────────────
const getInitials = (name: string): string =>
  name
    .split(" ")
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

// ── Avatar ─────────────────────────────────────────────────────────────────
const Avatar: React.FC<{ name: string }> = ({ name }) => (
  <div className="relative shrink-0">
    <div
      style={{ backgroundColor: COLORS.primary.DEFAULT }}
      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm"
    >
      {getInitials(name)}
    </div>
    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
  </div>
);

// ── ThemeToggle ────────────────────────────────────────────────────────────
const ThemeToggle: React.FC<{ isDarkMode: boolean; onToggle: () => void }> = ({
  isDarkMode,
  onToggle,
}) => (
  <div className="px-4 py-3 border-b border-gray-100 dark:border-white/[0.07]">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Theme</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {isDarkMode ? "Dark mode" : "Light mode"}
        </p>
      </div>
      <button
        onClick={onToggle}
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        className="relative inline-flex items-center rounded-full p-1 transition-all duration-300 ml-3"
      >
        <div className="relative w-12 h-6 rounded-full bg-gradient-to-b from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] border border-gray-300 dark:border-white/[0.07] transition-all duration-300">
          <div className={clsx("absolute left-1 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center transition-opacity duration-300", isDarkMode ? "opacity-0" : "opacity-100")}>
            <Sun className="h-3 w-3 text-yellow-600" />
          </div>
          <div className={clsx("absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center transition-opacity duration-300", isDarkMode ? "opacity-100" : "opacity-0")}>
            <Moon className="h-3 w-3 text-gray-300" />
          </div>
          <div className={clsx("absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full transition-all duration-300 bg-gradient-to-b from-white to-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.2)] border border-gray-300", isDarkMode ? "translate-x-6" : "translate-x-1")}>
            <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-white/50" />
          </div>
        </div>
      </button>
    </div>
  </div>
);

// ── ProfileDropdown ────────────────────────────────────────────────────────
const ProfileDropdown: React.FC<{
  userName: string;
  userEmail: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onProfileClick: () => void;
  onLogoutClick: () => void;
}> = ({ userName, userEmail, isDarkMode, onToggleDarkMode, onProfileClick, onLogoutClick }) => (
  <div className="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-[var(--sc-dark-bg-elevated)] rounded-lg shadow-xl border border-gray-200 dark:border-white/[0.07] py-2 z-50">
    {/* User info */}
    <div className="px-4 py-3 border-b border-gray-100 dark:border-white/[0.07]">
      <p className="text-sm font-medium text-gray-900 dark:text-white">{userName}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
    </div>

    {/* Theme */}
    <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleDarkMode} />

    {/* Profile */}
    <button
      onClick={onProfileClick}
      className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/60 transition-colors"
    >
      <User className="h-4 w-4 mr-3" />
      My Profile
    </button>

    {/* Logout */}
    <div className="border-t border-gray-100 dark:border-white/[0.07] mt-1 pt-1">
      <button
        onClick={onLogoutClick}
        className="flex items-center w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        <LogOut className="h-4 w-4 mr-3" />
        Sign out
      </button>
    </div>
  </div>
);

// ── UserProfile ────────────────────────────────────────────────────────────
const UserProfile: React.FC<UserProfileProps> = ({
  isCollapsed = false,
  userName,
  userEmail,
  isDarkMode,
  profileDropdownOpen,
  onToggleDropdown,
  onToggleDarkMode,
  onProfileClick,
  onLogoutClick,
}) => (
  <div className="relative border-t border-gray-200 dark:border-white/[0.07] p-2">
    <button
      onClick={onToggleDropdown}
      className={clsx(
        "flex items-center w-full rounded-lg transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-slate-700/60 h-12 px-2",
        isCollapsed && "justify-center"
      )}
    >
      <div className={clsx("flex items-center", !isCollapsed && "space-x-3 w-full")}>
        <Avatar name={userName} />
        {!isCollapsed && (
          <>
            <p className="flex-1 min-w-0 text-sm font-medium text-gray-900 dark:text-white truncate text-left">
              {userName}
            </p>
            <ChevronDown
              className={clsx(
                "h-4 w-4 text-gray-400 transition-transform duration-200",
                profileDropdownOpen && "rotate-180"
              )}
            />
          </>
        )}
      </div>
    </button>

    {profileDropdownOpen && !isCollapsed && (
      <ProfileDropdown
        userName={userName}
        userEmail={userEmail}
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
        onProfileClick={onProfileClick}
        onLogoutClick={onLogoutClick}
      />
    )}
  </div>
);

export default UserProfile;