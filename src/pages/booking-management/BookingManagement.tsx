import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useCookies } from "react-cookie";
import { CalendarRange, Filter, X } from "lucide-react";
import { AdvancedTable } from "../../atoms/AdvancedTable";
import { MyButton } from "../../atoms/MyButton";
import { MyInput } from "../../atoms/MyInput";
import { showToastnew } from "../../services/toastifynewService/toastifynewService";
import { getData } from "../../services/crmServices";
import { selectApiKey, openApiKeyModal } from "../../store/slices/apiKeySlice";
import { selectAccessData } from "../../store/slices/accessSlice";
import type { RootState } from "../../store";
import CreateBookingModal from "./CreateBookingModal";

// ── Types ──────────────────────────────────────────────────────────────────

type BookingStatus = "ongoing" | "completed" | "cancelled_via_user" | "cancelled_by_admin_crm";
type BookingVia    = "app" | "website" | "laptop" | "whatsapp_to_crm" | "call";

interface BookingApiItem {
  _id: string;
  reference_id: string;
  branch?: string;
  user_name?: string;
  user_phone?: string;
  address?: string;
  booking_via: BookingVia;
  booking_status: BookingStatus;
  booking_created_date_and_time?: string;
  is_active: boolean;
  createdAt?: string;
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

// ── Badge helpers ──────────────────────────────────────────────────────────

const STATUS_STYLE: Record<BookingStatus, string> = {
  ongoing:               "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300",
  completed:             "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300",
  cancelled_via_user:    "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300",
  cancelled_by_admin_crm:"bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300",
};

const STATUS_LABEL: Record<BookingStatus, string> = {
  ongoing:               "Ongoing",
  completed:             "Completed",
  cancelled_via_user:    "Cancelled (User)",
  cancelled_by_admin_crm:"Cancelled (Admin)",
};

const VIA_STYLE: Record<BookingVia, string> = {
  app:            "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  website:        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  laptop:         "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  whatsapp_to_crm:"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  call:           "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
};

const VIA_LABEL: Record<BookingVia, string> = {
  app: "App", website: "Website", laptop: "Laptop",
  whatsapp_to_crm: "WhatsApp", call: "Call",
};

function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLE[status] ?? ""}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function ViaBadge({ via }: { via: BookingVia }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${VIA_STYLE[via] ?? ""}`}>
      {VIA_LABEL[via] ?? via}
    </span>
  );
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Filter state ───────────────────────────────────────────────────────────

interface Filters {
  search:         string;
  booking_status: string;
  booking_via:    string;
  branch:         string;
  date_from:      string;
  date_to:        string;
}

const EMPTY_FILTERS: Filters = {
  search: "", booking_status: "", booking_via: "", branch: "", date_from: "", date_to: "",
};

const STATUS_OPTIONS: BookingStatus[] = ["ongoing", "completed", "cancelled_via_user", "cancelled_by_admin_crm"];
const VIA_OPTIONS:    BookingVia[]    = ["app", "website", "laptop", "whatsapp_to_crm", "call"];

const selectCls =
  "px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 transition-colors";

// ── Component ──────────────────────────────────────────────────────────────

const BookingManagement: React.FC = () => {
  const [cookies] = useCookies(["t"]);
  const dispatch   = useDispatch();
  const apiKey     = useSelector((s: RootState) => selectApiKey(s));
  const access     = useSelector((s: RootState) => selectAccessData(s));
  const perms      = (access?.["booking_management"] ?? {}) as Record<string, boolean>;

  const [data, setData]           = React.useState<BookingApiItem[]>([]);
  const [filters, setFilters]     = React.useState<Filters>(EMPTY_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [page, setPage]           = React.useState(1);
  const [perPage, setPerPage]     = React.useState(25);
  const [total, setTotal]         = React.useState(0);
  const [loading, setLoading]     = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);

  React.useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(filters.search.trim()), 350);
    return () => clearTimeout(id);
  }, [filters.search]);

  const setFilter = <K extends keyof Filters>(key: K, val: string) => {
    setFilters((f) => ({ ...f, [key]: val }));
    setPage(1);
  };

  const clearFilters = () => { setFilters(EMPTY_FILTERS); setPage(1); };
  const hasActiveFilters = Object.values(filters).some(Boolean);

  const fetchList = React.useCallback(async () => {
    if (!apiKey) { dispatch(openApiKeyModal(false)); return; }
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        page, limit: perPage,
        search: debouncedSearch || undefined,
        booking_status: filters.booking_status || undefined,
        booking_via:    filters.booking_via    || undefined,
        branch:         filters.branch         || undefined,
        date_from:      filters.date_from      || undefined,
        date_to:        filters.date_to        || undefined,
      };
      const res = await getData<BookingsApiResponse>({
        endpoint: "bookings",
        token: cookies.t,
        instance: "identity",
        params,
      });
      setData(res.data.data);
      setTotal(res.data.total);
    } catch {
      showToastnew.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  }, [apiKey, cookies.t, debouncedSearch, filters.booking_status, filters.booking_via, filters.branch, filters.date_from, filters.date_to, page, perPage, dispatch]);

  React.useEffect(() => { fetchList(); }, [fetchList]);

  const columns = React.useMemo(() => [
    {
      key: "reference_id",
      label: "Reference ID",
      sortable: false,
      render: (_: unknown, row: BookingApiItem) => (
        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded">
          {row.reference_id}
        </span>
      ),
    },
    {
      key: "user_name",
      label: "Customer",
      sortable: true,
      render: (_: unknown, row: BookingApiItem) => (
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{row.user_name || "—"}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{row.user_phone || ""}</p>
        </div>
      ),
    },
    {
      key: "address",
      label: "Address",
      sortable: false,
      render: (_: unknown, row: BookingApiItem) => (
        <span className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1">{row.address || "—"}</span>
      ),
    },
    {
      key: "branch",
      label: "Branch",
      sortable: true,
      render: (_: unknown, row: BookingApiItem) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">{row.branch || "—"}</span>
      ),
    },
    {
      key: "booking_via",
      label: "Via",
      sortable: false,
      render: (_: unknown, row: BookingApiItem) => <ViaBadge via={row.booking_via} />,
    },
    {
      key: "booking_status",
      label: "Status",
      sortable: false,
      render: (_: unknown, row: BookingApiItem) => <StatusBadge status={row.booking_status} />,
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: false,
      render: (_: unknown, row: BookingApiItem) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(row.createdAt)}</span>
      ),
    },
  ], []);

  return (
    <div className="w-full max-w-full">
      {/* Filter bar */}
      <div className="mb-3 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <MyInput
            placeholder="Search reference, name, phone…"
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            className="w-full sm:w-72"
          />
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors ${
              hasActiveFilters
                ? "border-gray-500 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 bg-gray-600 dark:bg-gray-300 text-white dark:text-gray-900 text-xs rounded-full px-1.5">
                {Object.values(filters).filter(Boolean).length}
              </span>
            )}
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}
          <div className="ml-auto">
            {perms.create !== false && (
              <MyButton variant="primary" onClick={() => setShowModal(true)}>
                Create Booking
              </MyButton>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <select
              value={filters.booking_status}
              onChange={(e) => setFilter("booking_status", e.target.value)}
              className={selectCls}
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>

            <select
              value={filters.booking_via}
              onChange={(e) => setFilter("booking_via", e.target.value)}
              className={selectCls}
            >
              <option value="">All Sources</option>
              {VIA_OPTIONS.map((v) => <option key={v} value={v}>{VIA_LABEL[v]}</option>)}
            </select>

            <input
              type="text"
              value={filters.branch}
              onChange={(e) => setFilter("branch", e.target.value)}
              placeholder="Branch…"
              className={`${selectCls} w-36`}
            />

            <div className="flex items-center gap-1.5">
              <CalendarRange className="h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilter("date_from", e.target.value)}
                className={`${selectCls} w-36`}
              />
              <span className="text-gray-400 text-xs">to</span>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilter("date_to", e.target.value)}
                className={`${selectCls} w-36`}
              />
            </div>
          </div>
        )}
      </div>

      <AdvancedTable
        data={data}
        columns={columns}
        actions={[]}
        onRowAction={() => {}}
        pagination={{ total, page, perPage, onPageChange: setPage, onPerPageChange: setPerPage }}
        showBuiltinSearch={false}
        title={null}
        loading={loading}
      />

      {showModal && (
        <CreateBookingModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); fetchList(); }}
        />
      )}
    </div>
  );
};

export default BookingManagement;
