//V5
import React from "react";
import ReactDOM from "react-dom";
import { ShieldCheck, X } from "lucide-react";

type RoleAccess = {
  module_id: string;
  create?: boolean;
  edit?: boolean;
  view?: boolean;
  delete?: boolean;
  transfer?: boolean;
  export?: boolean;
};

const MODULE_LABEL: Record<string, string> = {
  "data-dashboard": "Dashboard Admin",
  "admin-dashboard": "Admin Dashboard",
  settings: "Settings",
  "user-management": "User Management",
  "dashboard-branch-manager": "Dashboard Branch Manager",
  "dashboard-team-leader": "Dashboard Team Lead",
  "dashboard-tso": "Dashboard TSO",
  "dashboard-manager": "Dashboard Manager",
  "customer-master": "Customer Master",
  "employee-management": "Employee Management",
  "loan-evaluator": "Business Rule Engine",
  "lead-management": "Lead Management",
  "activity-tracker-management": "Activity Tracker",
  "master-configuration": "Master Configuration",
  "rules-management": "Product Rules",
  "support-ticket": "Support Ticket",
  banks: "Banks",
  products: "Products",
  companies: "Companies",
  cities: "Cities",
  "company-categories": "Company Categories",
};

const PERM_KEYS: (keyof RoleAccess)[] = [
  "create", "edit", "view", "delete", "transfer", "export",
];
const PERM_LABELS = ["Create", "Edit", "View", "Delete", "Transfer", "Export"];

const ANIM_MS = 340;
const MAX_BLUR = 6; // px — full blur when sheet is fully open
const SHEET_HEIGHT_ESTIMATE = 500; // px — used to normalise drag ratio

// ─── Permissions Table ─────────────────────────────────────────────────────
const PermissionsTable: React.FC<{ access: RoleAccess[] }> = ({ access }) => (
  <div className="overflow-auto">
    <table className="w-full min-w-[440px]">
      <thead>
        <tr>
          <th
            className="sticky top-0 z-10 text-left px-4 py-3
              text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide
              bg-gray-50 dark:bg-gray-800/80
              border-b border-gray-200 dark:border-gray-700"
            style={{ fontSize: "clamp(0.85rem, 2vw, 0.95rem)" }}
          >
            Module
          </th>
          {PERM_LABELS.map((l) => (
            <th
              key={l}
              className="sticky top-0 z-10 text-center px-2 py-3
                text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap
                bg-gray-50 dark:bg-gray-800/80
                border-b border-gray-200 dark:border-gray-700"
              style={{ fontSize: "clamp(0.85rem, 2vw, 0.95rem)" }}
            >
              {l}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
        {access.map((ra, i) => (
          <tr
            key={ra.module_id + i}
            className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
          >
            <td
              className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100 whitespace-nowrap"
              style={{ fontSize: "clamp(1rem, 2.5vw, 1.15rem)" }}
            >
              {MODULE_LABEL[ra.module_id] ?? ra.module_id}
            </td>
            {PERM_KEYS.map((key) => {
              const on = !!ra[key];
              return (
                <td key={String(key)} className="px-2 py-3 text-center">
                  <span
                    className={`inline-flex items-center justify-center rounded-full font-bold
                      ${on
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400"
                        : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
                      }`}
                    style={{
                      width: "1.8rem",
                      height: "1.8rem",
                      fontSize: "clamp(0.8rem, 1.8vw, 0.9rem)",
                    }}
                  >
                    {on ? "✓" : "–"}
                  </span>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── Bottom Sheet ──────────────────────────────────────────────────────────
interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  access: RoleAccess[];
}

type Phase = "idle" | "entering" | "open" | "leaving";

const BottomSheet: React.FC<BottomSheetProps> = ({ open, onClose, access }) => {
  const [phase, setPhase] = React.useState<Phase>("idle");
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  // ── Single numeric "progress" value drives EVERYTHING visual ─────────
  // 0 = fully hidden (sheet at bottom, backdrop transparent, blur 0)
  // 1 = fully open   (sheet at top,   backdrop opaque,      blur MAX)
  // During CSS-animated open/close this is set to 1 or 0 and the CSS
  // transition handles the interpolation.
  // During drag this is computed directly from dragOffset so blur/opacity
  // track the finger in real time with NO transition lag.
  const [progress, setProgress] = React.useState(0);

  // Raw pixel offset from drag — kept separate so we can do math on it
  const dragOffset = React.useRef(0);
  const [dragOffsetState, setDragOffsetState] = React.useState(0); // for sheet transform
  const isDragging = React.useRef(false);
  const dragStartY = React.useRef(0);
  const sheetRef = React.useRef<HTMLDivElement>(null);
  const CLOSE_THRESHOLD = 120;

  const clearAllTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const after = (ms: number, fn: () => void) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  };

  // ── Phase machine (same as before) ───────────────────────────────────
  React.useEffect(() => {
    clearAllTimers();
    if (open) {
      if (phase === "idle") {
        setProgress(0);
        setPhase("entering");
        after(20, () => {
          setPhase("open");
          setProgress(1); // triggers CSS transition from 0→1
        });
      } else if (phase === "leaving") {
        setPhase("open");
        setProgress(1);
      }
      document.body.style.overflow = "hidden";
    } else {
      if (phase === "open" || phase === "entering") {
        setProgress(0); // triggers CSS transition from 1→0
        setPhase("leaving");
        after(ANIM_MS + 20, () => setPhase("idle"));
      }
      document.body.style.overflow = "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  React.useEffect(
    () => () => { clearAllTimers(); document.body.style.overflow = ""; },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // ── Derived backdrop values from progress + drag ──────────────────────
  // When dragging: progress is OVERRIDDEN by live drag ratio so blur/opacity
  // reduce exactly as the sheet moves down — pixel-perfect sync.
  const getSheetHeight = () =>
    sheetRef.current?.offsetHeight ?? SHEET_HEIGHT_ESTIMATE;

  const liveProgress = isDragging.current
    ? Math.max(0, 1 - dragOffset.current / getSheetHeight())
    : progress;

  // Clamp to [0,1]
  const p = Math.min(1, Math.max(0, liveProgress));

  const backdropOpacity = p * 0.52;
  const backdropBlur    = p * MAX_BLUR;

  // ── Touch drag ────────────────────────────────────────────────────────
  const onTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    dragOffset.current = 0;
    isDragging.current = true;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const d = e.touches[0].clientY - dragStartY.current;
    if (d > 0) {
      dragOffset.current = d;
      setDragOffsetState(d);
      // Force re-render so liveProgress recalculates and backdrop updates
      setProgress((prev) => prev); // tiny no-op state poke
    }
  };

  const onTouchEnd = () => {
    isDragging.current = false;
    const offset = dragOffset.current;
    dragOffset.current = 0;
    setDragOffsetState(0);
    if (offset > CLOSE_THRESHOLD) {
      onClose();
    }
    // progress snaps back to 1 (sheet is open), CSS transition handles it
  };

  // ── Mouse drag ────────────────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    dragStartY.current = e.clientY;
    dragOffset.current = 0;
    isDragging.current = true;

    const onMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      const d = ev.clientY - dragStartY.current;
      if (d > 0) {
        dragOffset.current = d;
        setDragOffsetState(d);
        setProgress((prev) => prev);
      }
    };

    const onUp = () => {
      isDragging.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      const offset = dragOffset.current;
      dragOffset.current = 0;
      setDragOffsetState(0);
      if (offset > CLOSE_THRESHOLD) {
        onClose();
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  if (phase === "idle") return null;

  const isOpen = phase === "open";

  return ReactDOM.createPortal(
    <>
      {/* ── Backdrop — blur & opacity track sheet position in real time ── */}
      <div
        onClick={phase === "open" ? onClose : undefined}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          background: "rgba(0,0,0,1)",
          // During drag: NO transition — follows finger instantly
          // During CSS anim: transition handles interpolation
          opacity: backdropOpacity,
          backdropFilter: `blur(${backdropBlur}px)`,
          WebkitBackdropFilter: `blur(${backdropBlur}px)`,
          transition: isDragging.current
            ? "none"
            : `opacity ${ANIM_MS}ms ease, backdrop-filter ${ANIM_MS}ms ease, -webkit-backdrop-filter ${ANIM_MS}ms ease`,
          pointerEvents: phase === "open" ? "auto" : "none",
        }}
      />

      {/* ── Sheet ── */}
      <div
        ref={sheetRef}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          transform: isOpen
            ? `translateY(${dragOffsetState}px)`
            : "translateY(100%)",
          transition: isDragging.current
            ? "none"
            : `transform ${ANIM_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`,
          maxHeight: "82dvh",
          minHeight: "40vh",
          borderRadius: "20px 20px 0 0",
          display: "flex",
          flexDirection: "column",
          userSelect: "none",
          willChange: "transform",
        }}
        className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-2xl"
      >
        {/* Drag Handle */}
        <div
          className="flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing flex-shrink-0"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
        >
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 pb-4 flex-shrink-0
            border-b border-gray-100 dark:border-gray-800"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <p
                className="font-semibold text-gray-900 dark:text-white leading-tight"
                style={{ fontSize: "clamp(1.2rem, 3vw, 1.4rem)" }}
              >
                Permissions Overview
              </p>
              <p
                className="text-gray-400 dark:text-gray-500 leading-tight mt-0.5"
                style={{ fontSize: "clamp(1rem, 2.2vw, 1.1rem)" }}
              >
                {access.length} {access.length === 1 ? "module" : "modules"} configured
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center
              bg-gray-100 dark:bg-gray-800
              text-gray-500 dark:text-gray-400
              hover:bg-gray-200 dark:hover:bg-gray-700
              active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-auto overscroll-contain">
          <PermissionsTable access={access} />
          <div className="h-6" />
        </div>
      </div>
    </>,
    document.body
  );
};

// ─── Trigger Badge ─────────────────────────────────────────────────────────
interface ActionSetBadgeProps {
  access: RoleAccess[];
}

export const ActionSetBadge: React.FC<ActionSetBadgeProps> = ({ access }) => {
  const [sheetOpen, setSheetOpen] = React.useState(false);

  return (
    <>
      <button
        onClick={() => setSheetOpen(true)}
        className="inline-flex items-center gap-1.5 select-none
          rounded-full border px-2.5 py-1 text-xs font-medium
          bg-indigo-50 border-indigo-200 text-indigo-700
          dark:bg-indigo-950/50 dark:border-indigo-800 dark:text-indigo-300
          hover:bg-indigo-100 hover:border-indigo-300
          dark:hover:bg-indigo-900/60 dark:hover:border-indigo-700
          active:scale-95 transition-all duration-150"
      >
        <ShieldCheck className="w-3 h-3 flex-shrink-0" />
        {access.length} {access.length === 1 ? "module" : "modules"}
      </button>

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        access={access}
      />
    </>
  );
};

export default BottomSheet;
