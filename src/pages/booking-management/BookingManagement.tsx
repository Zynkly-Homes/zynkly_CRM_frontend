import React, { useCallback, useMemo, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { selectAccessToken } from "../../store/slices/authSlice";
import {
  ListFilter,
  Upload,
  Plus,
} from "lucide-react";
import { CustomDatagrid, type GridColumn } from "../../atoms/CustomDatagrid";
import { showToastnew } from "../../services/toastifynewService/toastifynewService";
import { getData, deleteData } from "../../services/crmServices";
import { emitNavDone } from "../../atoms/NavigationProgress";
import { selectApiKey, openApiKeyModal } from "../../store/slices/apiKeySlice";
import { selectAccessData } from "../../store/slices/accessSlice";
import { useLocalStorageState } from "../../hooks/useLocalStorageState";
import type { RootState } from "../../store";
import CreateBookingModal, {
  PACKAGE_FETCH_PAGE, PAYMENT_METHOD_FETCH_PAGE, PAYMENT_STATUS_FETCH_PAGE,
  makeHouseHelperFetchPage,
} from "./CreateBookingModal";
import BookingDetailPage from "./BookingDetailPage";
import BookingEditPage from "./BookingEditPage";
import {
  CleanButton,
  CleanSearchBar,
  CleanFilterPanel,
  CleanFilterChips,
  type SelectOption,
  type FilterFieldConfig,
} from "../../atoms/my_clean_code_atoms";

// ── Types ──────────────────────────────────────────────────────────────────────

type BookingStatus =
  | "ongoing"
  | "completed"
  | "cancelled_via_user"
  | "cancelled_by_admin_crm";
type BookingVia = "app" | "website" | "laptop" | "whatsapp_to_crm" | "call";

interface CancellationLogEntry {
  booking_status?: string;
  cancelled_by?:   string;
  cancelled_at?:   string;
}

interface BookingApiItem {
  _id: string;
  reference_id: string;
  branch?: string;
  user_name?: string;
  user_id?: string;
  user_phone?: string;
  address?: string;
  live_location_url?: string;
  booking_via: BookingVia;
  booking_created_date_and_time?: string;
  booking_status: BookingStatus;
  package_name?: string;
  cleaner_id?: string;
  cleaner_name?: string;
  cleaner_mobile_number?: string;
  house_helper_name?: string;
  cancellation_log?: CancellationLogEntry[];
  cancellation_reason?: string;
  payment_method?: string;
  payment_amount?: number;
  payment_status?: string;
  is_active: boolean;
  is_delete?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface BookingsApiResponse {
  success: boolean;
  message: string;
  data: {
    data: BookingApiItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ── Static maps ────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<BookingStatus, React.CSSProperties> = {
  ongoing:              { background: "var(--badge-amber-bg)",  color: "var(--badge-amber-text)" },
  completed:            { background: "var(--badge-green-bg)",  color: "var(--badge-green-text)" },
  cancelled_via_user:   { background: "var(--badge-red-bg)",    color: "var(--badge-red-text)"   },
  cancelled_by_admin_crm: { background: "var(--badge-red-bg)", color: "var(--badge-red-text)"   },
};

const STATUS_LABEL: Record<BookingStatus, string> = {
  ongoing:              "Ongoing",
  completed:            "Completed",
  cancelled_via_user:   "Cancelled (User)",
  cancelled_by_admin_crm: "Cancelled (Admin)",
};

const VIA_STYLE: Record<BookingVia, React.CSSProperties> = {
  app:            { background: "var(--badge-purple-bg)", color: "var(--badge-purple-text)" },
  website:        { background: "var(--badge-blue-bg)",   color: "var(--badge-blue-text)"   },
  laptop:         { background: "var(--badge-gray-bg)",   color: "var(--badge-gray-text)"   },
  whatsapp_to_crm:{ background: "var(--badge-green-bg)",  color: "var(--badge-green-text)"  },
  call:           { background: "var(--badge-orange-bg)", color: "var(--badge-orange-text)" },
};

const VIA_LABEL: Record<BookingVia, string> = {
  app: "App", website: "Website", laptop: "Laptop",
  whatsapp_to_crm: "WhatsApp", call: "Call",
};

const STATUS_OPTIONS: SelectOption[] = [
  { value: "ongoing",              label: "Ongoing" },
  { value: "completed",            label: "Completed" },
  { value: "cancelled_via_user",   label: "Cancelled (User)" },
  { value: "cancelled_by_admin_crm", label: "Cancelled (Admin)" },
];
const VIA_OPTIONS: SelectOption[] = [
  { value: "app",             label: "App" },
  { value: "website",         label: "Website" },
  { value: "laptop",          label: "Laptop" },
  { value: "whatsapp_to_crm", label: "WhatsApp" },
  { value: "call",            label: "Call" },
];

const SORT_OPTIONS: SelectOption[] = [
  { value: "latest_updated",  label: "Latest Updated"  },
  { value: "oldest_updated",  label: "Oldest Updated"  },
  { value: "latest_created",  label: "Latest Created"  },
  { value: "oldest_created",  label: "Oldest Created"  },
];

const PAYMENT_STATUS_STYLE: Record<string, React.CSSProperties> = {
  paid:      { background: "var(--badge-green-bg)",  color: "var(--badge-green-text)"  },
  pending:   { background: "var(--badge-amber-bg)",  color: "var(--badge-amber-text)"  },
  cancelled: { background: "var(--badge-red-bg)",    color: "var(--badge-red-text)"    },
};

const PAYMENT_METHOD_STYLE: Record<string, React.CSSProperties> = {
  online: { background: "var(--badge-blue-bg)",   color: "var(--badge-blue-text)"   },
  cash:   { background: "var(--badge-gray-bg)",   color: "var(--badge-gray-text)"   },
};

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ── Inline badge helpers ───────────────────────────────────────────────────────

const pillStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center",
  padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 500,
};

const StatusBadge: React.FC<{ status: BookingStatus }> = ({ status }) => (
  <span style={{ ...pillStyle, ...STATUS_STYLE[status] }}>{STATUS_LABEL[status] ?? status}</span>
);

const ViaBadge: React.FC<{ via: BookingVia }> = ({ via }) => (
  <span style={{ ...pillStyle, ...VIA_STYLE[via] }}>{VIA_LABEL[via] ?? via}</span>
);

// ── Columns ───────────────────────────────────────────────────────────────────

const COLUMNS: GridColumn<BookingApiItem>[] = [
  {
    field: "reference_id",
    headerName: "Reference ID",
    minWidth: 155,
    renderCell: ({ row }) => (
      <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, background: "var(--dt-header)", color: "var(--dt-text)", padding: "2px 7px", borderRadius: 5 }}>
        {row.reference_id}
      </span>
    ),
  },
  {
    field: "user_name",
    headerName: "Customer",
    minWidth: 180,
    sortable: true,
    renderCell: ({ row }) => (
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: "var(--dt-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {row.user_name || "—"}
        </p>
        <p style={{ margin: 0, fontSize: 11, color: "var(--dt-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {row.user_phone || ""}
        </p>
      </div>
    ),
  },
  {
    field: "address",
    headerName: "Address",
    minWidth: 200,
    renderCell: ({ row }) => (
      <span style={{ fontSize: 12, color: "var(--dt-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {row.address || "—"}
      </span>
    ),
  },
  {
    field: "branch",
    headerName: "Branch",
    minWidth: 130,
    sortable: true,
    renderCell: ({ row }) => (
      <span style={{ fontSize: 12, color: "var(--dt-dim)" }}>{row.branch || "—"}</span>
    ),
  },
  {
    field: "booking_via",
    headerName: "Via",
    minWidth: 110,
    renderCell: ({ row }) => <ViaBadge via={row.booking_via} />,
  },
  {
    field: "booking_status",
    headerName: "Status",
    minWidth: 160,
    renderCell: ({ row }) => <StatusBadge status={row.booking_status} />,
  },
  {
    field: "package_name",
    headerName: "Package",
    minWidth: 140,
    renderCell: ({ row }) => (
      <span style={{ fontSize: 12, color: "var(--dt-dim)" }}>{row.package_name || "—"}</span>
    ),
  },
  {
    field: "cleaner_name",
    headerName: "House Helper",
    minWidth: 170,
    renderCell: ({ row }) => {
      const name = row.cleaner_name || row.house_helper_name;
      if (!name || name === "N/A") return <span style={{ fontSize: 12, color: "var(--dt-muted)" }}>—</span>;
      return (
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: "var(--dt-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {name}
          </p>
          {row.cleaner_mobile_number && (
            <p style={{ margin: 0, fontSize: 11, color: "var(--dt-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {row.cleaner_mobile_number}
            </p>
          )}
        </div>
      );
    },
  },
  {
    field: "payment_method",
    headerName: "Pay Method",
    minWidth: 120,
    renderCell: ({ row }) => row.payment_method ? (
      <span style={{ ...pillStyle, ...(PAYMENT_METHOD_STYLE[row.payment_method] ?? {}) }}>
        {row.payment_method.charAt(0).toUpperCase() + row.payment_method.slice(1)}
      </span>
    ) : <span style={{ fontSize: 12, color: "var(--dt-muted)" }}>—</span>,
  },
  {
    field: "payment_amount",
    headerName: "Amount",
    minWidth: 110,
    renderCell: ({ row }) => (
      <span style={{ fontSize: 12, color: "var(--dt-text)", fontWeight: 500 }}>
        {row.payment_amount != null ? `₹${row.payment_amount.toLocaleString("en-IN")}` : "—"}
      </span>
    ),
  },
  {
    field: "payment_status",
    headerName: "Pay Status",
    minWidth: 130,
    renderCell: ({ row }) => row.payment_status ? (
      <span style={{ ...pillStyle, ...(PAYMENT_STATUS_STYLE[row.payment_status] ?? {}) }}>
        {row.payment_status.charAt(0).toUpperCase() + row.payment_status.slice(1)}
      </span>
    ) : <span style={{ fontSize: 12, color: "var(--dt-muted)" }}>—</span>,
  },
  {
    field: "createdAt",
    headerName: "Created",
    minWidth: 120,
    renderCell: ({ row }) => (
      <span style={{ fontSize: 12, color: "var(--dt-muted)" }}>
        {row.createdAt ? formatShortDate(row.createdAt) : "—"}
      </span>
    ),
  },
];

// ── Types ──────────────────────────────────────────────────────────────────────

interface Filters {
  sort_by:        string;
  booking_status: string;
  booking_via:    string;
  branch:         string;
  payment_status: string;
  payment_method: string;
  cleaner_id:     string;
  package_name:   string;
  date_from:      string;
  date_to:        string;
  updated_from:   string;
  updated_to:     string;
  is_active:      string;
  is_delete:      string;
}

const EMPTY: Filters = {
  sort_by: "",
  booking_status: "", booking_via: "", branch: "",
  payment_status: "", payment_method: "", cleaner_id: "",
  package_name: "",
  date_from: "", date_to: "", updated_from: "", updated_to: "",
  is_active: "", is_delete: "",
};

const FILTERS_STORAGE_KEY = "booking-management:filters";

// ── Component ──────────────────────────────────────────────────────────────────

const BookingManagement: React.FC = () => {
  const token = useSelector(selectAccessToken);
  const dispatch = useDispatch();
  const apiKey = useSelector((s: RootState) => selectApiKey(s));
  const access = useSelector((s: RootState) => selectAccessData(s));
  const perms = (access?.["booking_management"] ?? {}) as Record<string, boolean>;
  const [searchParams, setSearchParams] = useSearchParams();

  const [data, setData] = React.useState<BookingApiItem[]>([]);
  // Persisted so a page refresh doesn't wipe out applied filters.
  const [filters, setFilters] = useLocalStorageState<Filters>(FILTERS_STORAGE_KEY, EMPTY);
  const [search,          setSearch]          = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(false);
  const [showModal,      setShowModal]      = React.useState(false);
  const [viewedBooking,  setViewedBooking]  = React.useState<BookingApiItem | null>(null);
  const [viewLoading,    setViewLoading]    = React.useState(false);

  const [showFilterPanel, setShowFilterPanel] = React.useState(false);
  const [cleanerLabel, setCleanerLabel] = React.useState<string | undefined>(undefined);
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLSpanElement>(null);

  const pageRef      = useRef(1);
  const fetchAbortRef = useRef<AbortController | null>(null);
  const PER_PAGE = 200;

  // Search only runs on Enter (or clearing the box) — not live/debounced —
  // per request: typing shouldn't fire an API call on every keystroke.
  const handleSearchEnter = useCallback((value: string) => setDebouncedSearch(value.trim()), []);

  const setFilter = useCallback(
    (key: string, val: string, option?: SelectOption | null) => {
      setFilters((f) => ({ ...f, [key]: val }));
      if (key === "cleaner_id") setCleanerLabel(option?.label);
    },
    [setFilters],
  );

  const clearAllFilters = useCallback(() => { setFilters(EMPTY); setCleanerLabel(undefined); }, [setFilters]);

  const removeFilters = useCallback((keys: string[]) => {
    setFilters((f) => {
      const next = { ...f };
      keys.forEach((k) => { (next as Record<string, string>)[k] = ""; });
      return next;
    });
    if (keys.includes("cleaner_id")) setCleanerLabel(undefined);
  }, [setFilters]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const cleanerFetchPage = useMemo(() => makeHouseHelperFetchPage(token), [token]);

  const FILTER_FIELDS = useMemo<FilterFieldConfig[]>(() => [
    { type: "select",       key: "sort_by",        label: "Sort By", options: SORT_OPTIONS, placeholder: "Default order" },
    { type: "select",       key: "booking_status", label: "Status", options: STATUS_OPTIONS, placeholder: "All statuses" },
    { type: "select",       key: "booking_via",    label: "Source", options: VIA_OPTIONS,    placeholder: "All sources"  },
    { type: "text",         key: "branch",         label: "Branch",         placeholder: "Branch name…" },
    { type: "async-select", key: "payment_status", label: "Payment Status", fetchPage: PAYMENT_STATUS_FETCH_PAGE },
    { type: "async-select", key: "payment_method", label: "Payment Method", fetchPage: PAYMENT_METHOD_FETCH_PAGE },
    { type: "async-select", key: "cleaner_id",     label: "House Helper", fetchPage: cleanerFetchPage, placeholder: "Select house helper…", searchPlaceholder: "Search by name, ID or mobile…" },
    { type: "async-select", key: "package_name",   label: "Package",      fetchPage: PACKAGE_FETCH_PAGE, placeholder: "Select package…" },
    { type: "date-range",   fromKey: "date_from",    toKey: "date_to",    label: "Created Date" },
    { type: "date-range",   fromKey: "updated_from", toKey: "updated_to", label: "Updated Date" },
    { type: "boolean",      key: "is_active", label: "Active Only",  trueLabel: "Active only", falseLabel: "Include inactive" },
    { type: "boolean",      key: "is_delete", label: "Deleted",      trueLabel: "Show deleted", falseLabel: "Hide deleted" },
  ], [cleanerFetchPage]);

  const buildParams = useCallback(
    (page: number) => ({
      page,
      limit: PER_PAGE,
      search:         debouncedSearch || undefined,
      sort_by:        filters.sort_by || undefined,
      booking_status: filters.booking_status || undefined,
      booking_via:    filters.booking_via || undefined,
      branch:         filters.branch || undefined,
      payment_status: filters.payment_status || undefined,
      payment_method: filters.payment_method || undefined,
      cleaner_id:     filters.cleaner_id || undefined,
      package_name:   filters.package_name || undefined,
      date_from:      filters.date_from || undefined,
      date_to:        filters.date_to || undefined,
      updated_from:   filters.updated_from || undefined,
      updated_to:     filters.updated_to || undefined,
      is_active:      filters.is_active || undefined,
      is_delete:      filters.is_delete || undefined,
    }),
    [debouncedSearch, filters],
  );

  const fetchPage = useCallback(
    async (page: number, append: boolean) => {
      if (!apiKey) { dispatch(openApiKeyModal(false)); return; }

      // Abort the previous non-append fetch so stale responses never overwrite
      // newer results (rapid typing / rapid F5 race condition).
      let signal: AbortSignal | undefined;
      if (!append) {
        fetchAbortRef.current?.abort();
        fetchAbortRef.current = new AbortController();
        signal = fetchAbortRef.current.signal;
      }

      append ? setLoadingMore(true) : setLoading(true);
      try {
        const res = await getData<BookingsApiResponse>({
          endpoint: "bookings",
          token: token,
          instance: "identity",
          params: buildParams(page),
          signal,
        });
        const items = res.data.data;
        setData((prev) => (append ? [...prev, ...items] : items));
        setTotal(res.data.total);
        setHasMore(page < res.data.totalPages);
        pageRef.current = page;
      } catch (err: unknown) {
        // A newer request aborted this one — silently ignore, don't show error
        const name = (err as any)?.name ?? (err as any)?.code;
        if (name === "AbortError" || name === "CanceledError" || (err as any)?.message === "canceled") return;
        showToastnew.error("Failed to fetch bookings");
      } finally {
        // Skip clearing loading state for aborted requests — the newer request
        // is still in-flight and owns the loading state.
        if (!signal?.aborted) {
          append ? setLoadingMore(false) : setLoading(false);
          if (!append) requestAnimationFrame(() => requestAnimationFrame(() => emitNavDone()));
        }
      }
    },
    [apiKey, token, buildParams, dispatch],
  );

  useEffect(() => {
    pageRef.current = 1;
    setData([]);
    fetchPage(1, false);
  }, [fetchPage]);

  const handleLoadMore = useCallback(() => fetchPage(pageRef.current + 1, true), [fetchPage]);
  const handleRefresh  = useCallback(() => { pageRef.current = 1; setData([]); fetchPage(1, false); }, [fetchPage]);

  // ── Create modal open/close (Create remains modal-based) ─────────────────
  const openCreateModal  = useCallback(() => setShowModal(true), []);
  const closeCreateModal = useCallback(() => setShowModal(false), []);

  // ── Full-page view/edit navigation ────────────────────────────────────────
  // View:  ?bookingId=<reference_id>
  // Edit:  ?bookingId=<reference_id>&mode=edit
  const openView = useCallback((row: BookingApiItem) => {
    const params = new URLSearchParams(searchParams);
    params.set("bookingId", row.reference_id);
    params.delete("mode");
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const openEdit = useCallback((row: BookingApiItem) => {
    const params = new URLSearchParams(searchParams);
    params.set("bookingId", row.reference_id);
    params.set("mode", "edit");
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const closeView = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.delete("bookingId");
    params.delete("mode");
    setSearchParams(params, { replace: true });
    setViewedBooking(null);
  }, [searchParams, setSearchParams]);

  const backToView = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.delete("mode");
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleEditFromView = useCallback(() => {
    if (!viewedBooking) return;
    openEdit(viewedBooking);
  }, [viewedBooking, openEdit]);

  const handleSaved = useCallback((updated: Record<string, unknown>) => {
    setViewedBooking((prev) => (prev ? { ...prev, ...updated } as BookingApiItem : prev));
    handleRefresh();
    backToView();
  }, [handleRefresh, backToView]);

  // Restore the viewed booking from the URL (deep-link / refresh support).
  useEffect(() => {
    const bookingId = searchParams.get("bookingId");
    if (!bookingId) { if (viewedBooking) setViewedBooking(null); return; }
    if (viewedBooking && (viewedBooking.reference_id === bookingId || viewedBooking._id === bookingId)) return;

    const local = data.find((d) => d.reference_id === bookingId || d._id === bookingId);
    if (local) { setViewedBooking(local); return; }
    if (!apiKey) return;

    setViewLoading(true);
    getData<BookingsApiResponse>({
      endpoint: "bookings", token: token ?? undefined, instance: "identity",
      params: { search: bookingId, limit: 5 },
    })
      .then((res) => {
        const match = res.data.data.find((d) => d.reference_id === bookingId || d._id === bookingId);
        if (match) setViewedBooking(match);
        else showToastnew.error("Booking not found for the link");
      })
      .catch(() => showToastnew.error("Failed to load booking"))
      .finally(() => setViewLoading(false));
  }, [searchParams, data, apiKey, token, viewedBooking]);

  const handleDelete = useCallback(async (row: BookingApiItem) => {
    await deleteData({ endpoint: `bookings/${row._id}`, token: token, instance: "identity" });
    showToastnew.success("Booking deleted");
    handleRefresh();
  }, [token, handleRefresh]);

  const handleBulkDelete = useCallback(async (ids: (string | number)[]) => {
    await Promise.all(
      ids.map((id) => deleteData({ endpoint: `bookings/${id}`, token: token, instance: "identity" }))
    );
    showToastnew.success(`${ids.length} booking${ids.length > 1 ? "s" : ""} deleted`);
    handleRefresh();
  }, [token, handleRefresh]);

  // ── Full-page booking view/edit ───────────────────────────────────────────
  // ?bookingId=<reference_id>            → view page
  // ?bookingId=<reference_id>&mode=edit  → edit page
  const viewingBookingId = searchParams.get("bookingId");
  const isEditMode       = searchParams.get("mode") === "edit";

  if (viewingBookingId) {
    if (!viewedBooking || viewLoading) {
      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--fi-muted)", fontSize: 13 }}>
          Loading booking…
        </div>
      );
    }
    if (isEditMode) {
      return (
        <BookingEditPage
          data={viewedBooking}
          onBack={backToView}
          onSaved={handleSaved}
        />
      );
    }
    return (
      <BookingDetailPage
        data={viewedBooking}
        onBack={closeView}
        onEdit={perms.update !== false ? handleEditFromView : undefined}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "var(--dt-bg)" }}>

      {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
      <div style={{
        display:      "flex",
        alignItems:   "center",
        gap:          6,
        padding:      "7px 12px",
        borderBottom: "1px solid var(--fi-border)",
        flexShrink:   0,
        flexWrap:     "wrap",
        background:   "var(--fi-bg)",
      }}>

        {/* Search — only fires on Enter, not live */}
        <CleanSearchBar
          value={search}
          onChange={setSearch}
          onEnter={handleSearchEnter}
          placeholder="Search reference, name, phone… (press Enter)"
          width={260}
          accent
        />

        {/* Filter */}
        <div style={{ position: "relative" }} ref={filterPanelRef}>
          <span ref={filterButtonRef} style={{ display: "inline-flex" }}>
            <CleanButton
              variant="outline"
              size="sm"
              iconLeft={<ListFilter style={{ width: 13, height: 13 }} />}
              badge={activeFilterCount > 0 ? activeFilterCount : undefined}
              onClick={() => setShowFilterPanel((v) => !v)}
              style={activeFilterCount > 0
                ? { borderColor: "var(--badge-blue-text)", color: "var(--badge-blue-text)", boxShadow: "0 0 0 1px var(--badge-blue-text) inset" }
                : { color: "var(--badge-blue-text)" }}
            >
              Filter
            </CleanButton>
          </span>

          <CleanFilterPanel
            variant="drawer"
            isOpen={showFilterPanel}
            onClose={() => setShowFilterPanel(false)}
            fields={FILTER_FIELDS}
            values={filters}
            onChange={setFilter}
            onClear={clearAllFilters}
            activeCount={activeFilterCount}
            triggerRef={filterButtonRef}
          />
        </div>

        {/* Export */}
        <CleanButton
          variant="outline"
          size="sm"
          iconLeft={<Upload style={{ width: 13, height: 13 }} />}
          title="Export bookings"
        >
          Export
        </CleanButton>

        <div style={{ flex: 1 }} />

        {/* Create */}
        {perms.create !== false && (
          <CleanButton
            variant="primary"
            size="sm"
            iconLeft={<Plus style={{ width: 13, height: 13 }} />}
            onClick={openCreateModal}
          >
            Create Booking
          </CleanButton>
        )}
      </div>

      {/* ── Active filter chips ────────────────────────────────────────────────── */}
      {activeFilterCount > 0 && (
        <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--fi-border)", background: "var(--fi-bg)" }}>
          <CleanFilterChips
            fields={FILTER_FIELDS}
            values={filters}
            onRemove={removeFilters}
            onClearAll={clearAllFilters}
            displayValues={cleanerLabel ? { cleaner_id: cleanerLabel } : undefined}
          />
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <CustomDatagrid<BookingApiItem>
          rows={data}
          columns={COLUMNS}
          getRowId={(row) => row._id}
          isLoading={loading}
          totalItems={total}
          onScrollPagination
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onRefresh={handleRefresh}
          emptyStateImage="/icons/no-booking-found.png"
          emptyStateTitle="No bookings found"
          emptyStateSubtitle="Try adjusting your search or filters"
          // ── Selection + bulk delete ──────────────────────────────────────
          selectable={perms.delete !== false}
          onBulkDelete={perms.delete !== false ? handleBulkDelete : undefined}
          bulkDeleteLabel="Delete selected bookings — this cannot be undone"
          // ── Row actions ──────────────────────────────────────────────────
          onRowClick={openView}
          onView={openView}
          onEdit={perms.update !== false ? openEdit : undefined}
          onDelete={perms.delete !== false ? handleDelete : undefined}
          deleteConfirmTitle="Delete booking?"
          deleteConfirmDescription="This will permanently remove the booking record. This action cannot be undone."
        />
      </div>

      {showModal && (
        <CreateBookingModal
          isOpen={showModal}
          onClose={closeCreateModal}
          onCreated={() => { closeCreateModal(); handleRefresh(); }}
          mode="create"
        />
      )}
    </div>
  );
};

export default BookingManagement;
