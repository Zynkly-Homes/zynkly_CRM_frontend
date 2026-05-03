import React from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { COLORS } from "../../../../theme/colors";

interface SidebarLogoProps {
  isCollapsed: boolean;
  isHovered?: boolean;
  onCollapse: () => void;
  onExpand: () => void;
}

const SidebarLogo: React.FC<SidebarLogoProps> = ({ isCollapsed, isHovered, onCollapse, onExpand }) => {
  if (isCollapsed) {
    return (
      <div className="pt-4 pb-3 flex justify-center">
        <button
          onClick={onExpand}
          aria-label="Expand sidebar"
          className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-150 hover:bg-gray-100 dark:hover:bg-slate-800"
        >
          {isHovered ? (
            <PanelLeftOpen className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <span
              style={{ backgroundColor: COLORS.primary.DEFAULT }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm select-none"
            >
              N
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between pt-4 pb-2 px-3">
      <div className="flex items-center">
        {/* w-10 matches icon container width so N aligns with nav icons */}
        <div className="w-10 flex items-center justify-center flex-shrink-0">
          <div
            style={{ backgroundColor: COLORS.primary.DEFAULT }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm select-none"
          >
            N
          </div>
        </div>
        <span className="text-base font-bold tracking-tight text-gray-800 dark:text-white/90 leading-none">
          New Platform
        </span>
      </div>
      <button
        onClick={onCollapse}
        aria-label="Collapse sidebar"
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-150 flex-shrink-0"
      >
        <PanelLeftClose className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </button>
    </div>
  );
};

export default SidebarLogo;
