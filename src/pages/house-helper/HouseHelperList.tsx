import React, { useCallback, useRef, useMemo } from "react";
import { selectAccessToken } from "../../store/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { ListFilter, Plus, AlertTriangle } from "lucide-react";
import { CustomDatagrid, type GridColumn } from "../../atoms/CustomDatagrid";
import { showToastnew } from "../../services/toastifynewService/toastifynewService";
import { getData, patchData, deleteData } from "../../services/crmServices";
import { fetchSWR, invalidatePrefix, cacheKey } from "../../lib/queryCache";
import { emitNavDone } from "../../atoms/NavigationProgress";
import { selectApiKey, openApiKeyModal } from "../../store/slices/apiKeySlice";
import { selectAccessData } from "../../store/slices/accessSlice";
import type { RootState } from "../../store";
import HouseHelperForm from "./HouseHelperForm";
import HouseHelperViewModal from "./HouseHelperViewModal";
import {
  CleanButton, CleanSearchBar, CleanAsyncSelect, staticOptionsFetchPage, CleanModal, type SelectOption,
} from "../../atoms/my_clean_code_atoms";

const HOUSE_HELPER_FORM_ID = "house-helper-form";
const ENDPOINT = "cleaner-bookings";

// ── Types ──────────────────────────────────────────────────────────────────

interface PaymentApiEntry {
  amount_paid?:    number;
  date?:           string;
  description?:    string;
  status?:         string;
  payment_method?: string;
}

interface HouseHelperApiItem {
  _id:            string;
  reference_id:   string;
  cleaner_name:   string;
  cleaner_id?:    string;
  mobile_number:  string;
  address?:       string;
  joined_at?:     string;
  is_active:      boolean;
  is_delete?:     boolean;
  payments?:      PaymentApiEntry[];
  createdAt?:     string;
}

interface HouseHelperApiResponse {
  success: boolean; message: string;
  data: { data: HouseHelperApiItem[]; total: number; page: number; limit: number; totalPages: number };
}

type StatusState = { isOpen: boolean; id: string; name: string; is_active: boolean };

function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  const e = err as { error?: { response?: { data?: { message?: string } } }; message?: string };
  return e?.error?.response?.data?.message ?? e?.message ?? "Operation failed";
}

// ── Status badge ───────────────────────────────────────────────────────────

function StatusBadge({ is_active }: { is_active: boolean }) {
  return (
    <span style={{
      padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 600,
      background: is_active ? "var(--badge-green-bg)" : "var(--badge-red-bg)",
      color:      is_active ? "var(--badge-green-text)" : "var(--badge-red-text)",
    }}>
      {is_active ? "Active" : "Inactive"}
    </span>
  );
}

// ── Statics ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: SelectOption[] = [
  { value: "true",  label: "Active"   },
  { value: "false", label: "Inactive" },
];

const DELETED_OPTIONS: SelectOption[] = [
  { value: "false", label: "Hide deleted" },
  { value: "true",  label: "Show deleted" },
];

const STATUS_FETCH_PAGE  = staticOptionsFetchPage(STATUS_OPTIONS);
const DELETED_FETCH_PAGE = staticOptionsFetchPage(DELETED_OPTIONS);

const panelStyle: React.CSSProperties = {
  position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 50,
  background: "var(--fi-bg-panel)", border: "1px solid var(--fi-border)",
  borderRadius: "var(--fi-radius)", boxShadow: "0 4px 20px rgba(0,0,0,0.10)", padding: 12,
};

const CLOSE_STATUS: StatusState = { isOpen: false, id: "", name: "", is_active: true };
const PER_PAGE = 25;

// ── Component ──────────────────────────────────────────────────────────────

const HouseHelperList: React.FC = () => {
  const token    = useSelector(selectAccessToken);
  const dispatch = useDispatch();
  const apiKey   = useSelector(selectApiKey);
  const access   = useSelector((s: RootState) => selectAccessData(s));
  const perms    = (access?.["house_helper"] ?? {}) as Record<string, boolean>;
  const [searchParams, setSearchParams] = useSearchParams();

  const [data,            setData]            = React.useState<HouseHelperApiItem[]>([]);
  const [viewItem,        setViewItem]        = React.useState<HouseHelperApiItem | null>(null);
  const [viewLoading,     setViewLoading]     = React.useState(false);
  const [search,          setSearch]          = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [statusFilter,    setStatusFilter]    = React.useState("");
  const [showDeleted,     setShowDeleted]     = React.useState("false");
  const [total,           setTotal]           = React.useState(0);
  const [loading,         setLoading]         = React.useState(false);
  const [loadingMore,     setLoadingMore]     = React.useState(false);
  const [hasMore,         setHasMore]         = React.useState(false);
  const [showModal,       setShowModal]       = React.useState(false);
  const [editItem,        setEditItem]        = React.useState<HouseHelperApiItem | null>(null);
  const [statusModal,     setStatusModal]     = React.useState<StatusState>(CLOSE_STATUS);
  const [statusLoading,   setStatusLoading]   = React.useState(false);
  const [showFilterPanel, setShowFilterPanel] = React.useState(false);
  const [formSubmitting,  setFormSubmitting]  = React.useState(false);

  const pageRef        = useRef(1);
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const formResetRef   = useRef<(() => void) | null>(null);

  React.useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(id);
  }, [search]);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(e.target as Node))
        setShowFilterPanel(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const buildParams = useCallback(
    (page: number) => ({
      page, limit: PER_PAGE,
      search:    debouncedSearch || undefined,
      is_active: statusFilter    || undefined,
      is_delete: showDeleted === "true" ? "true" : undefined,
    }),
    [debouncedSearch, statusFilter, showDeleted],
  );

  const fetchPage = useCallback(
    async (page: number, append: boolean) => {
      if (!apiKey) { dispatch(openApiKeyModal(false)); return; }
      append ? setLoadingMore(true) : setLoading(true);
      try {
        const params = buildParams(page);
        const key    = cacheKey(ENDPOINT, params as Record<string, unknown>);

        const tok = token ?? undefined;
        const res = append || page > 1
          ? await getData<HouseHelperApiResponse>({ endpoint: ENDPOINT, token: tok, instance: "identity", params })
          : await fetchSWR<HouseHelperApiResponse>(
              key,
              () => getData<HouseHelperApiResponse>({ endpoint: ENDPOINT, token: tok, instance: "identity", params }),
              30_000, 60_000,
              (fresh) => {
                setData(fresh.data.data);
                setTotal(fresh.data.total);
                setHasMore(1 < fresh.data.totalPages);
              },
            );

        setData((prev) => (append ? [...prev, ...res.data.data] : res.data.data));
        setTotal(res.data.total);
        setHasMore(page < res.data.totalPages);
        pageRef.current = page;
      } catch { showToastnew.error("Failed to fetch house helpers"); }
      finally   { append ? setLoadingMore(false) : setLoading(false); if (!append) requestAnimationFrame(() => requestAnimationFrame(() => emitNavDone())); }
    },
    [apiKey, token, buildParams, dispatch],
  );

  React.useEffect(() => { pageRef.current = 1; setData([]); fetchPage(1, false); }, [fetchPage]);

  const handleLoadMore = useCallback(() => fetchPage(pageRef.current + 1, true), [fetchPage]);
  const handleRefresh  = useCallback(() => { invalidatePrefix(ENDPOINT); pageRef.current = 1; setData([]); fetchPage(1, false); }, [fetchPage]);

  const openView = useCallback((row: HouseHelperApiItem) => {
    setViewItem(row);
    const params = new URLSearchParams(searchParams);
    params.set("cleanerId", row.cleaner_id || row.reference_id);
    setSearchParams(params, { replace: false });
  }, [searchParams, setSearchParams]);

  const closeView = useCallback(() => {
    setViewItem(null);
    const params = new URLSearchParams(searchParams);
    params.delete("cleanerId");
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleViewToEdit = useCallback(() => {
    if (!viewItem) return;
    setEditItem(viewItem);
    closeView();
    setShowModal(true);
  }, [viewItem, closeView]);

  // Restore the viewed record from the URL (deep-link / refresh support).
  React.useEffect(() => {
    const cleanerId = searchParams.get("cleanerId");
    if (!cleanerId || viewItem) return;

    const local = data.find((d) => d.cleaner_id === cleanerId || d.reference_id === cleanerId);
    if (local) { setViewItem(local); return; }
    if (!apiKey) return;

    setViewLoading(true);
    getData<HouseHelperApiResponse>({
      endpoint: ENDPOINT, token: token ?? undefined, instance: "identity",
      params: { search: cleanerId, limit: 5 },
    })
      .then((res) => {
        const match = res.data.data.find((d) => d.cleaner_id === cleanerId || d.reference_id === cleanerId);
        if (match) setViewItem(match);
        else showToastnew.error("House helper not found for the link");
      })
      .catch(() => showToastnew.error("Failed to load house helper"))
      .finally(() => setViewLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, data, apiKey, token]);

  const handleEdit   = useCallback((row: HouseHelperApiItem) => { setEditItem(row); setShowModal(true); }, []);
  const handleDelete = useCallback(async (row: HouseHelperApiItem) => {
    await deleteData({ endpoint: `${ENDPOINT}/${row._id}`, token: token, instance: "identity" });
    showToastnew.success("House helper deleted");
    handleRefresh();
  }, [token, handleRefresh]);

  const handleBulkDelete = useCallback(async (ids: (string | number)[]) => {
    await Promise.all(ids.map((id) => deleteData({ endpoint: `${ENDPOINT}/${id}`, token: token, instance: "identity" })));
    showToastnew.success(`${ids.length} house helper${ids.length > 1 ? "s" : ""} deleted`);
    handleRefresh();
  }, [token, handleRefresh]);

  const handleStatusToggle = async () => {
    if (!statusModal.id) return;
    setStatusLoading(true);
    try {
      await patchData({
        endpoint: `${ENDPOINT}/${statusModal.id}`, token: token, instance: "identity",
        data: { is_active: !statusModal.is_active },
      });
      showToastnew.success(statusModal.is_active ? "House helper deactivated" : "House helper activated");
      setStatusModal(CLOSE_STATUS);
      handleRefresh();
    } catch (err: unknown) { showToastnew.error(extractErrorMessage(err)); }
    finally { setStatusLoading(false); }
  };

  const closeCreateModal = () => { setShowModal(false); setEditItem(null); setFormSubmitting(false); };

  const activeFilterCount = (statusFilter ? 1 : 0) + (showDeleted === "true" ? 1 : 0);

  const columns = useMemo<GridColumn<HouseHelperApiItem>[]>(() => [
    {
      field: "reference_id", headerName: "Reference ID", minWidth: 150,
      renderCell: ({ row }) => (
        <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, background: "var(--dt-header)", color: "var(--dt-text)", padding: "2px 7px", borderRadius: 5 }}>
          {row.reference_id}
        </span>
      ),
    },
    { field: "cleaner_name", headerName: "Cleaner Name", minWidth: 180, sortable: true },
    {
      field: "cleaner_id", headerName: "Cleaner ID", minWidth: 130,
      renderCell: ({ value }) => <span style={{ fontSize: 12, color: "var(--dt-dim)" }}>{(value as string) || "—"}</span>,
    },
    { field: "mobile_number", headerName: "Mobile Number", minWidth: 150 },
    {
      field: "address", headerName: "Address", minWidth: 180,
      renderCell: ({ row }) => (
        <span style={{ fontSize: 12, color: "var(--dt-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {row.address || "—"}
        </span>
      ),
    },
    {
      field: "payments", headerName: "Payments", minWidth: 100,
      renderCell: ({ row }) => (
        <span style={{ fontSize: 12, color: "var(--dt-dim)" }}>{row.payments?.length ?? 0}</span>
      ),
    },
    {
      field: "is_active", headerName: "Status", minWidth: 120,
      renderCell: ({ row }) => (
        <button
          type="button"
          onClick={() => setStatusModal({ isOpen: true, id: row._id, name: row.cleaner_name, is_active: row.is_active })}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
          title={row.is_active ? "Click to deactivate" : "Click to activate"}
        >
          <StatusBadge is_active={row.is_active} />
        </button>
      ),
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "var(--dt-bg)" }}>

      {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "7px 12px", borderBottom: "1px solid var(--fi-border)",
        flexShrink: 0, flexWrap: "wrap", background: "var(--fi-bg)",
      }}>
        <CleanSearchBar
          value={search}
          onChange={(v) => setSearch(v)}
          placeholder="Search by name, cleaner ID, mobile or reference"
          width={280}
        />

        <div style={{ position: "relative" }} ref={filterPanelRef}>
          <CleanButton
            variant="outline" size="sm"
            iconLeft={<ListFilter style={{ width: 13, height: 13 }} />}
            badge={activeFilterCount > 0 ? activeFilterCount : undefined}
            onClick={() => setShowFilterPanel((v) => !v)}
            style={activeFilterCount > 0 ? { borderColor: "var(--fi-border-focus)" } : undefined}
          >
            Filter
          </CleanButton>

          {showFilterPanel && (
            <div style={{ ...panelStyle, minWidth: 220, display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--fi-muted)" }}>
                Filters
              </span>
              <CleanAsyncSelect
                label="Status"
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
                fetchPage={STATUS_FETCH_PAGE}
                placeholder="All statuses"
                clearable
              />
              <CleanAsyncSelect
                label="Deleted records"
                value={showDeleted}
                onChange={(value) => setShowDeleted(value)}
                fetchPage={DELETED_FETCH_PAGE}
              />
              {activeFilterCount > 0 && (
                <CleanButton variant="danger" size="xs" onClick={() => { setStatusFilter(""); setShowDeleted("false"); }} style={{ width: "100%" }}>
                  Clear filters
                </CleanButton>
              )}
            </div>
          )}
        </div>

        <div style={{ flex: 1 }} />

        {perms.create && (
          <CleanButton
            variant="primary" size="sm"
            iconLeft={<Plus style={{ width: 13, height: 13 }} />}
            onClick={() => { setEditItem(null); setShowModal(true); }}
          >
            Create House Helper
          </CleanButton>
        )}
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <CustomDatagrid<HouseHelperApiItem>
          rows={data}
          columns={columns}
          getRowId={(row) => row._id}
          isLoading={loading}
          totalItems={total}
          onScrollPagination
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onRefresh={handleRefresh}
          selectable={perms.delete}
          onBulkDelete={perms.delete ? handleBulkDelete : undefined}
          bulkDeleteLabel="Delete selected house helpers — this cannot be undone"
          onRowClick={openView}
          onView={openView}
          onEdit={perms.edit ? handleEdit : undefined}
          onDelete={perms.delete ? handleDelete : undefined}
          deleteConfirmTitle="Delete house helper?"
          deleteConfirmDescription="This will soft-delete the record. It can be restored from the API if needed."
        />
      </div>

      {/* ── View modal ────────────────────────────────────────────────────────── */}
      <HouseHelperViewModal
        isOpen={!!viewItem || viewLoading}
        onClose={closeView}
        onEdit={perms.edit ? handleViewToEdit : undefined}
        data={viewItem}
      />

      {/* ── Create / Edit modal ───────────────────────────────────────────────── */}
      <CleanModal
        isOpen={showModal}
        onClose={closeCreateModal}
        title={editItem ? "Edit House Helper" : "Create House Helper"}
        subtitle={editItem ? "Update house helper details" : "Add a new house helper record"}
        maxWidth={620}
        expandable={false}
        zIndex={99999}
        footer={
          <>
            <CleanButton
              type="button"
              variant="outline"
              size="sm"
              disabled={formSubmitting}
              onClick={() => formResetRef.current?.()}
            >
              Reset
            </CleanButton>
            <CleanButton
              type="submit"
              form={HOUSE_HELPER_FORM_ID}
              variant="primary"
              size="sm"
              loading={formSubmitting}
            >
              {editItem ? "Update" : "Create"}
            </CleanButton>
          </>
        }
      >
        <HouseHelperForm
          formId={HOUSE_HELPER_FORM_ID}
          token={token}
          initialValues={editItem ?? undefined}
          onSuccess={() => { closeCreateModal(); handleRefresh(); }}
          onSubmittingChange={setFormSubmitting}
          onResetReady={(fn) => { formResetRef.current = fn; }}
        />
      </CleanModal>

      {/* ── Status toggle modal ───────────────────────────────────────────────── */}
      <CleanModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal(CLOSE_STATUS)}
        maxWidth={400}
        expandable={false}
        zIndex={99999}
        closeOnBackdrop={!statusLoading}
        footer={
          <>
            <span />
            <div style={{ display: "flex", gap: 8 }}>
              <CleanButton variant="outline" size="sm" onClick={() => setStatusModal(CLOSE_STATUS)} disabled={statusLoading}>
                Cancel
              </CleanButton>
              <CleanButton variant="primary" size="sm" onClick={handleStatusToggle} loading={statusLoading}>
                {statusModal.is_active ? "Deactivate" : "Activate"}
              </CleanButton>
            </div>
          </>
        }
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <AlertTriangle style={{ width: 20, height: 20, color: "#f59e0b", flexShrink: 0 }} />
          <div>
            <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 600, color: "var(--fi-text)" }}>
              {statusModal.is_active ? "Deactivate" : "Activate"} House Helper
            </p>
            <p style={{ margin: 0, fontSize: 13, color: "var(--fi-muted)", lineHeight: 1.5 }}>
              Are you sure you want to {statusModal.is_active ? "deactivate" : "activate"}{" "}
              <strong>{statusModal.name}</strong>?
            </p>
          </div>
        </div>
      </CleanModal>
    </div>
  );
};

export default HouseHelperList;
