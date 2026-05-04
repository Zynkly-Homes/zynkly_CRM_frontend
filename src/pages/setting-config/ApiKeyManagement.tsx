import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useCookies } from "react-cookie";
import { Edit, Trash2 } from "lucide-react";
import { AdvancedTable } from "../../atoms/AdvancedTable";
import { MyButton } from "../../atoms/MyButton";
import { MyInput } from "../../atoms/MyInput";
import DeleteModal from "../../atoms/DeleteModal";
import { showToastnew } from "../../services/toastifynewService/toastifynewService";
import { getData, deleteData } from "../../services/crmServices";
import { selectApiKey, openApiKeyModal } from "../../store/slices/apiKeySlice";
import { selectAccessData } from "../../store/slices/accessSlice";
import { scrollToTop } from "../../utils/scrollToTop";
import type { RootState } from "../../store";
import ApiKeyForm from "./ApiKeyForm";

// ---- Types ----

interface ApiKeyApiItem {
  _id: string;
  name: string;
  key?: string;
  is_active: boolean;
  usage_limit?: number;
  usage_count?: number;
  expires_at?: string;
  created_by?: string;
  createdAt?: string;
}

interface ApiKeysApiResponse {
  success: boolean;
  message: string;
  data: {
    data: ApiKeyApiItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type ApiKeyItem = {
  _id: string;
  name: string;
  is_active: boolean;
  usage_limit?: number;
  usage_count?: number;
  expires_at?: string;
  createdAt?: string;
};

type DeleteModalState = { isOpen: boolean; id: string | null; name: string };

// ---- Helpers ----

function mapApiKey(k: ApiKeyApiItem): ApiKeyItem {
  return {
    _id: k._id,
    name: k.name,
    is_active: k.is_active,
    usage_limit: k.usage_limit,
    usage_count: k.usage_count,
    expires_at: k.expires_at,
    createdAt: k.createdAt,
  };
}

function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  const e = err as { error?: { response?: { data?: { message?: string } } }; message?: string };
  return e?.error?.response?.data?.message ?? e?.message ?? "Operation failed";
}

function StatusBadge({ is_active }: { is_active: boolean }) {
  const cls = is_active
    ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300"
    : "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {is_active ? "Active" : "Inactive"}
    </span>
  );
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const CLOSE_DELETE: DeleteModalState = { isOpen: false, id: null, name: "" };

// ---- Component ----

const ApiKeyManagement: React.FC = () => {
  const [cookies] = useCookies(["t"]);
  const dispatch   = useDispatch();
  const apiKey     = useSelector((s: RootState) => selectApiKey(s));
  const access     = useSelector((s: RootState) => selectAccessData(s));
  const perms      = (access?.["api_key_management"] ?? {}) as Record<string, boolean>;

  const [data, setData]               = React.useState<ApiKeyItem[]>([]);
  const [search, setSearch]           = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [page, setPage]               = React.useState(1);
  const [perPage, setPerPage]         = React.useState(25);
  const [total, setTotal]             = React.useState(0);
  const [loading, setLoading]         = React.useState(false);
  const [showForm, setShowForm]       = React.useState(false);
  const [editItem, setEditItem]       = React.useState<ApiKeyItem | null>(null);
  const [deleteModal, setDeleteModal] = React.useState<DeleteModalState>(CLOSE_DELETE);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  React.useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(id);
  }, [search]);

  const fetchList = React.useCallback(async () => {
    if (!apiKey) { dispatch(openApiKeyModal(false)); return; }
    setLoading(true);
    try {
      const res = await getData<ApiKeysApiResponse>({
        endpoint: "api-keys",
        token: cookies.t,
        instance: "identity",
        params: { page, limit: perPage, search: debouncedSearch },
      });
      setData(res.data.data.map(mapApiKey));
      setTotal(res.data.total);
    } catch {
      showToastnew.error("Failed to fetch API keys");
    } finally {
      setLoading(false);
    }
  }, [apiKey, cookies.t, debouncedSearch, page, perPage, dispatch]);

  React.useEffect(() => { fetchList(); }, [fetchList]);

  const handleRowAction = (action: string, row: ApiKeyItem) => {
    if (action === "edit")   { scrollToTop(); setEditItem(row); setShowForm(true); }
    if (action === "delete") { setDeleteModal({ isOpen: true, id: row._id, name: row.name }); }
  };

  const handleDeactivate = async () => {
    if (!deleteModal.id) return;
    setDeleteLoading(true);
    try {
      await deleteData({ endpoint: `api-keys/${deleteModal.id}`, token: cookies.t, instance: "identity" });
      showToastnew.success("API key deactivated");
      setDeleteModal(CLOSE_DELETE);
      await fetchList();
    } catch (err: unknown) {
      showToastnew.error(extractErrorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = React.useMemo(() => {
    const base: {
      key: string;
      label: string;
      sortable: boolean;
      render?: (v: unknown, row: ApiKeyItem) => React.ReactNode;
    }[] = [
      { key: "name", label: "Name", sortable: true },
      {
        key: "is_active",
        label: "Status",
        sortable: false,
        render: (_: unknown, row: ApiKeyItem) => <StatusBadge is_active={row.is_active} />,
      },
      {
        key: "usage_count",
        label: "Usage",
        sortable: false,
        render: (_: unknown, row: ApiKeyItem) => (
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {row.usage_count ?? 0}
            {row.usage_limit != null ? ` / ${row.usage_limit}` : ""}
          </span>
        ),
      },
      {
        key: "expires_at",
        label: "Expires",
        sortable: false,
        render: (_: unknown, row: ApiKeyItem) => (
          <span className="text-sm text-gray-600 dark:text-gray-400">{formatDate(row.expires_at)}</span>
        ),
      },
      {
        key: "createdAt",
        label: "Created",
        sortable: false,
        render: (_: unknown, row: ApiKeyItem) => (
          <span className="text-sm text-gray-500 dark:text-gray-500">{formatDate(row.createdAt)}</span>
        ),
      },
    ];

    if (perms.edit || perms.delete) {
      base.push({
        key: "actions",
        label: "Actions",
        sortable: false,
        render: (_: unknown, row: ApiKeyItem) => (
          <div className="flex items-center gap-1">
            {perms.edit && (
              <button
                title="Edit"
                onClick={() => handleRowAction("edit", row)}
                className="p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
                aria-label={`Edit ${row.name}`}
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
            )}
            {perms.delete && (
              <button
                title="Deactivate"
                onClick={() => handleRowAction("delete", row)}
                className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-950/40 transition-colors"
                aria-label={`Deactivate ${row.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ),
      });
    }

    return base;
  }, [perms]);

  return (
    <div className="w-full max-w-full">
      {showForm && (
        <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
          <div className="flex items-start justify-between px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {editItem ? "Edit API Key" : "Create API Key"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {editItem ? "Update key settings" : "Keys are shown only once at creation"}
              </p>
            </div>
            <MyButton
              variant="outline"
              onClick={() => { setShowForm(false); setEditItem(null); }}
              className="!px-3 !py-1.5 text-xs flex-shrink-0 ml-4"
            >
              Close
            </MyButton>
          </div>
          <div className="px-4 sm:px-6 py-5">
            <ApiKeyForm
              token={cookies.t}
              initialValues={editItem ?? undefined}
              onSuccess={() => { setEditItem(null); setShowForm(false); fetchList(); }}
              onCreated={() => { fetchList(); }}
            />
          </div>
        </div>
      )}

      <AdvancedTable
        data={data}
        columns={columns}
        actions={[]}
        onRowAction={handleRowAction}
        pagination={{ total, page, perPage, onPageChange: setPage, onPerPageChange: setPerPage }}
        showBuiltinSearch={false}
        title={null}
        loading={loading}
        leftToolbar={
          <MyInput
            placeholder="Search API key by name"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full sm:w-72"
          />
        }
        rightToolbar={
          !showForm && perms.create ? (
            <MyButton
              variant="primary"
              onClick={() => { setEditItem(null); setShowForm(true); }}
              className="w-full sm:w-auto whitespace-nowrap"
            >
              Create API Key
            </MyButton>
          ) : undefined
        }
      />

      <DeleteModal
        isActive={deleteModal.isOpen}
        id={deleteModal.id ?? ""}
        name={deleteModal.name}
        title="API Key"
        onClose={() => setDeleteModal(CLOSE_DELETE)}
        onClick={handleDeactivate}
        loading={deleteLoading}
      />
    </div>
  );
};

export default ApiKeyManagement;
