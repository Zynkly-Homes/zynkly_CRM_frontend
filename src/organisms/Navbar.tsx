
import React from 'react';
import { Bell, Settings, User, Moon, Sun, LogOut, Menu } from 'lucide-react';
import { MyButton } from '../atoms/MyButton';
import { useAuth } from '../hooks/useAuth';
import { useDarkMode } from '../hooks/useDarkMode';
// import finbrosLogoLight from "../assets/images/finbroseLogoNewLightMood2.png";
// import finbrosLogoDark from "../assets/images/finbroseLogoNewDarkMood2.png";


export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  // const { isDarkMode, toggleDarkMode } = useDarkMode();

  const toggleMobileSidebar = () => {
    try {
      console.log('[Navbar] dispatching uttm-toggle-sidebar event');
      window.dispatchEvent(new CustomEvent('uttm-toggle-sidebar', { detail: { ts: Date.now() } }));

      try {
        localStorage.setItem('uttm_toggle_sidebar_timestamp', String(Date.now()));
      } catch (e) {
        // ignore storage failures
      }
    } catch (err) {
      console.error('[Navbar] error dispatching toggle event', err);
    }
  };

  return (
    <nav className="bg-white dark:bg-black  border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="relative flex items-center justify-between">

        {/* Left - Hamburger (mobile only) */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={toggleMobileSidebar}
            aria-label="Open menu"
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu className="h-6 w-6 text-gray-700 dark:text-gray-200" />
          </button>
        </div>

        {/* Center - Logo (mobile only) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:hidden pointer-events-none">
          {/* Light mode logo - shown by default + hidden in dark */}
          {/* <img
            src={finbrosLogoLight}
            alt="Finbrose Logo"
            className="w-40 h-10 object-contain dark:hidden"
          /> */}

          {/* Dark mode logo - hidden by default + shown only in dark */}
          {/* <img
            src={finbrosLogoDark}
            alt="Finbrose Logo Dark"
            className="w-40 h-10 object-contain hidden dark:block"
          /> */}
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4 ml-auto">
          {/* commented buttons... */}

          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;