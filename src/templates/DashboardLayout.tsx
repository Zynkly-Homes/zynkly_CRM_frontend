
// import React, { useEffect, useState } from "react";
// import { Navbar } from "../organisms/Navbar";
// // import { Sidebar } from "../organisms/Sidebar/Sidebar";
// import Sidebar from "@/organisms/SidebarV2"
// import { useDarkMode } from "../hooks/useDarkMode";
// import dashboardBgImage from "../assets/images/arteffectsf.png";
// import leftBgImage from "../assets/images/arteffectso.png";

// const STORAGE_KEY = "uttm_sidebar_collapsed_v4";
// const SIDEBAR_WIDTH = 260; // px — must match w-64 in Sidebar.tsx
// const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";
// const DURATION = "200ms";

// const useIsMobileOrTablet = () => {
//   const [isMobile, setIsMobile] = useState(() =>
//     typeof window !== "undefined" ? window.innerWidth < 1024 : false
//   );
//   useEffect(() => {
//     const handle = () => setIsMobile(window.innerWidth < 1024);
//     window.addEventListener("resize", handle);
//     return () => window.removeEventListener("resize", handle);
//   }, []);
//   return isMobile;
// };

// interface DashboardLayoutProps {
//   children: React.ReactNode;
// }

// export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
//   useDarkMode();
//   const isMobileOrTablet = useIsMobileOrTablet();

//   const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
//     try {
//       return localStorage.getItem(STORAGE_KEY) === "true";
//     } catch {
//       return false;
//     }
//   });

//   // Keep localStorage in sync
//   useEffect(() => {
//     try {
//       localStorage.setItem(STORAGE_KEY, String(sidebarCollapsed));
//     } catch { /* ignore */ }
//   }, [sidebarCollapsed]);

//   // ── Listen for external collapse toggles from the Sidebar's own button ──────
//   // Sidebar writes to localStorage too; catch that so both stay in sync.
//   useEffect(() => {
//     const onStorage = (e: StorageEvent) => {
//       if (e.key === STORAGE_KEY && e.newValue !== null) {
//         setSidebarCollapsed(e.newValue === "true");
//       }
//     };
//     window.addEventListener("storage", onStorage);
//     return () => window.removeEventListener("storage", onStorage);
//   }, []);

//   // ── Derive the left offset ───────────────────────────────────────────────
//   // On mobile the sidebar is a portal overlay → no offset needed.
//   // On desktop: 256px when open, 0 when collapsed.
//   const contentMargin = isMobileOrTablet ? 0 : sidebarCollapsed ? 96 : SIDEBAR_WIDTH;

//   return (
//     // <div className="h-screen finbros-gradient dark:bg-gray-900 dark:bg-none relative overflow-hidden">
//    <div className="h-screen bg-white dark:bg-black">

//       {/* ── Fixed sidebar (renders itself as position:fixed internally) ── */}
//       <Sidebar
//         collapsed={sidebarCollapsed}
//         onCollapsedChange={setSidebarCollapsed}
//       />

//       {/* ── Main content — shifts in sync with sidebar ── */}
//       <div
//         className="flex flex-col h-full overflow-hidden relative z-10"
//         style={{
//           marginLeft: contentMargin,
//           transition: `margin-left ${DURATION} ${EASE}`,
//         }}
//       >
//         {/* Navbar → Mobile & Tablet only */}
//         {isMobileOrTablet && <Navbar />}

//         <main className="flex-1 overflow-auto">
//           {children}
//         </main>
//       </div>

//       {/* ── Decorative background images (desktop + light mode only) ── */}
//       {/* <div className="hidden lg:block dark:hidden absolute top-0 left-0 h-full w-[25%] z-0 pointer-events-none">
//         <img
//           src={leftBgImage}
//           alt=""
//           aria-hidden="true"
//           className="w-full h-full object-cover scale-y-[-1]"
//         />
//       </div> */}
//       {/* <div className="hidden lg:block dark:hidden absolute top-0 right-0 h-full w-[35%] z-0 pointer-events-none">
//         <img
//           src={dashboardBgImage}
//           alt=""
//           aria-hidden="true"
//           className="w-full h-full object-cover"
//         />
//       </div> */}
//     </div>
//   );
// };

//v2
import React, { useEffect, useState } from "react";
import { Flag, FileText, Clock, Star, Zap } from "lucide-react";
import { Navbar } from "../organisms/Navbar";
import Sidebar from "@/organisms/SidebarV2";
import { useDarkMode } from "../hooks/useDarkMode";

const STORAGE_KEY = "uttm_sidebar_collapsed_v4";
const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 64;
const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

const PILL_ITEMS = [
  { icon: <Flag size={11} />,     label: "Priority"      },
  { icon: <Zap size={11} />,      label: "Quick Actions" },
  { icon: <Clock size={11} />,    label: "Recent"        },
  { icon: <Star size={11} />,     label: "Favorites"     },
  { icon: <FileText size={11} />, label: "Draft"         },
  { icon: <FileText size={11} />, label: "Draft"         },
];

const PillBar: React.FC<{ isDarkMode: boolean; position: "top" | "bottom" }> = ({
  isDarkMode,
  position,
}) => (
  <div
    style={{
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: "0 12px",
      height: "36px",
      [position === "top" ? "borderBottom" : "borderTop"]: isDarkMode
        ? "1px solid rgba(255,255,255,0.06)"
        : "1px solid var(--sc-light-border)",
      backgroundColor: isDarkMode ? "#0f0f0f" : "var(--sc-light-bg-surface)",
      overflowX: "auto",
      overflowY: "hidden",
      scrollbarWidth: "none",
    }}
  >
    {PILL_ITEMS.map((item, i) => (
      <button
        key={i}
        aria-label={item.label}
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: "5px",
          padding: "3px 10px",
          borderRadius: "5px",
          border: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid var(--sc-light-border)",
          backgroundColor: isDarkMode ? "#1e1e1e" : "var(--sc-light-bg-card)",
          color: isDarkMode ? "rgba(255,255,255,0.55)" : "#6b7280",
          fontSize: "11px",
          cursor: "pointer",
          whiteSpace: "nowrap",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = isDarkMode ? "#2a2a2a" : "#f3f4f6";
          e.currentTarget.style.color = isDarkMode ? "rgba(255,255,255,0.85)" : "#111827";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = isDarkMode ? "#1e1e1e" : "var(--sc-light-bg-card)";
          e.currentTarget.style.color = isDarkMode ? "rgba(255,255,255,0.55)" : "#6b7280";
        }}
      >
        {item.icon}
        {item.label}
      </button>
    ))}
  </div>
);
const DURATION = "200ms";

const useIsMobileOrTablet = () => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 1024 : false
  );
  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);
  return isMobile;
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { isDarkMode } = useDarkMode();
  const isMobileOrTablet = useIsMobileOrTablet();

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  // Keep localStorage in sync
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(sidebarCollapsed));
    } catch { /* ignore */ }
  }, [sidebarCollapsed]);

  // Sync if sidebar toggles itself (cross-tab / internal button)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue !== null) {
        setSidebarCollapsed(e.newValue === "true");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Spacer width that pushes content aside (sidebar is position:fixed, not in flow)
  const spacerWidth = isMobileOrTablet
    ? 0
    : sidebarCollapsed
    ? SIDEBAR_COLLAPSED_WIDTH
    : SIDEBAR_WIDTH;

  return (
    <div
      style={{
        height: "100dvh",
        width: "100%",
        overflow: "hidden",
        backgroundColor: isDarkMode ? "#1e1e1e" : "var(--sc-light-bg-shell)",
        display: "flex",
        gap: "6px",
        padding: "6px",
        boxSizing: "border-box",
      }}
    >
      {/* ── Sidebar card ─────────────────────────────────────────────────── */}
      {!isMobileOrTablet && (
        <div
          style={{
            flexShrink: 0,
            width: sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
            overflow: "hidden",
            borderRadius: "5px",
            border: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid var(--sc-light-border)",
            backgroundColor: isDarkMode ? "#1e1e1e" : "var(--sc-light-bg-card)",
            transition: `width ${DURATION} ${EASE}`,
          }}
        >
          <Sidebar
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
          />
        </div>
      )}

      {/* Mobile: sidebar renders as portal overlay */}
      {isMobileOrTablet && (
        <Sidebar
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
      )}

      {/* ── Right panel shell ────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* Navbar — mobile & tablet only */}
        {isMobileOrTablet && <Navbar />}

        {/* ── Content card ─────────────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRadius: "5px",
            backgroundColor: isDarkMode ? "#141414" : "var(--sc-light-bg-card)",
            border: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid var(--sc-light-border)",
          }}
        >
          {/* ── Top pill bar ─────────────────────────────────────────────── */}
          <PillBar isDarkMode={isDarkMode} position="top" />

          {/* ── Scrollable content — ONLY this scrolls ─────────────────── */}
          <main
            className="sc-scrollbar"
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ flex: 1, padding: "24px", minHeight: "100%", boxSizing: "border-box" }}>
              {children}
            </div>
          </main>

          {/* ── Bottom pill bar ───────────────────────────────────────────── */}
          <PillBar isDarkMode={isDarkMode} position="bottom" />
        </div>
      </div>
    </div>
  );
};