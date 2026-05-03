import React from "react";
import ReactDOM from "react-dom";
import { X } from "lucide-react";
import { Z_INDEX, TRANSITIONS } from "../../constants";
import { UserProfileProps } from "../../types";
import UserProfile from "./UserProfile";

interface MobilePanelProps extends Omit<UserProfileProps, "isCollapsed"> {
  expanded: boolean;
  onClose: () => void;
  children: React.ReactNode; // rendered NavList
}

// ── MobilePanelHeader ──────────────────────────────────────────────────────
const MobilePanelHeader: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-white/[0.07]">
    {/* <img src={finbrosLogoLight} alt="FinBros Logo" className="w-40 h-12 object-contain block dark:hidden" /> */}
    {/* <img src={finbrosLogoDark}  alt="FinBros Logo" className="w-40 h-12 object-contain hidden dark:block" /> */}
    <button
      onClick={onClose}
      aria-label="Close menu"
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
    >
      <X className="h-5 w-5 text-gray-700 dark:text-gray-200" />
    </button>
  </div>
);

// ── MobilePanel ────────────────────────────────────────────────────────────
const MobilePanel: React.FC<MobilePanelProps> = ({
  expanded,
  onClose,
  children,
  ...profileProps
}) => {
  if (typeof document === "undefined") return null;

  const panel = (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: Z_INDEX.BACKDROP,
          opacity: expanded ? 1 : 0,
          pointerEvents: expanded ? "auto" : "none",
          transition: TRANSITIONS.OPACITY,
          
        }}
      />

      {/* Slide panel */}
      <div
        className="fixed top-0 left-0 h-full w-80 bg-white dark:bg-[var(--sc-dark-bg-sidebar)] border-r border-gray-200 dark:border-white/[0.07]"
        style={{
          minHeight: "100dvh",
          zIndex: Z_INDEX.SIDEBAR,
          transform: expanded ? "translateX(0)" : "translateX(-100%)",
          transition: TRANSITIONS.MOBILE,
          willChange: "transform",
        }}
      >
        <div className="flex flex-col h-full">
          <MobilePanelHeader onClose={onClose} />

          <nav className="mt-2 flex-1 overflow-auto">
            <ul className="space-y-1 px-3 pb-4">{children}</ul>
          </nav>

          <UserProfile isCollapsed={false} {...profileProps} />
        </div>
      </div>
    </>
  );

  return ReactDOM.createPortal(panel, document.body);
};

export default MobilePanel;