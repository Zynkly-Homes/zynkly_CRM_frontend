import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useCookies } from "react-cookie";
import { Edit, Trash2, Power } from "lucide-react";
import { AdvancedTable } from "../../atoms/AdvancedTable";
import { MyButton } from "../../atoms/MyButton";
import { MyInput } from "../../atoms/MyInput";
import DeleteModal from "../../atoms/DeleteModal";
import { Modal } from "../../molecules/Modal";
import { showToastnew } from "../../services/toastifynewService/toastifynewService";
import { getData, deleteData, patchData } from "../../services/crmServices";
import { selectApiKey, openApiKeyModal } from "../../store/slices/apiKeySlice";
import { selectAccessData } from "../../store/slices/accessSlice";
import { scrollToTop } from "../../utils/scrollToTop";
import type { RootState } from "../../store";
import ModuleForm from "./ModuleForm";

// ---- Types ----

interface ModuleApiItem {
  _id: string;
  module_id: string;
  module_name: string;
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ModulesApiResponse {
  success: boolean;
  message: string;
  data: {
    data: ModuleApiItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

type ModuleItem = {
  _id: string;
  module_id: string;
  module_name: string;
  is_active: boolean;
};

type DeleteModalState = { isOpen: boolean; id: string | null; name: string };
type StatusModalState = { isOpen: boolean; id: string; name: string; is_active: boolean };

// ---- Helpers ----

function mapModule(m: ModuleApiItem): ModuleItem {
  return { _id: m._id, module_id: m.module_id, module_name: m.module_name, is_active: m.is_active };
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

const CLOSE_DELETE: DeleteModalState = { isOpen: false, id: null, name: "" };
const CLOSE_STATUS: StatusModalState = { isOpen: false, id: "", name: "", is_active: true };

// ---- Component ----

const ModuleManagement: React.FC = () => {
  const [cookies] = useCookies(["t"]);
  const dispatch   = useDispatch();
  const apiKey     = useSelector((s: RootState) => selectApiKey(s));
  const access     = useSelector((s: RootState) => selectAccessData(s));
  const perms      = (access?.["module_management"] ?? {}) as Record<string, boolean>;

  const [data, setData]               = React.useState<ModuleItem[]>([]);
  const [search, setSearch]           = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [page, setPage]               = React.useState(1);
  const [perPage, setPerPage]         = React.useState(25);
  const [total, setTotal]             = React.useState(0);
  const [loading, setLoading]         = React.useState(false);
  const [showForm, setShowForm]       = React.useState(false);
  const [editItem, setEditItem]       = React.useState<ModuleItem | null>(null);
  const [deleteModal, setDeleteModal] = React.useState<DeleteModalState>(CLOSE_DELETE);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [statusModal, setStatusModal] = React.useState<StatusModalState>(CLOSE_STATUS);
  const [statusLoading, setStatusLoading] = React.useState(false);

  React.useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(id);
  }, [search]);

  const fetchList = React.useCallback(async () => {
    if (!apiKey) { dispatch(openApiKeyModal(false)); return; }
    setLoading(true);
    try {
      const res = await getData<ModulesApiResponse>({
        endpoint: "modules",
        token: cookies.t,
        instance: "identity",
        params: { page, limit: perPage, search: debouncedSearch },
      });
      setData(res.data.data.map(mapModule));
      setTotal(res.data.total);
    } catch {
      showToastnew.error("Failed to fetch modules");
    } finally {
      setLoading(false);
    }
  }, [apiKey, cookies.t, debouncedSearch, page, perPage, dispatch]);

  React.useEffect(() => { fetchList(); }, [fetchList]);

  const handleRowAction = (action: string, row: ModuleItem) => {
    if (action === "edit")   { scrollToTop(); setEditItem(row); setShowForm(true); }
    if (action === "delete") { setDeleteModal({ isOpen: true, id: row._id, name: row.module_name }); }
    if (action === "toggle") { setStatusModal({ isOpen: true, id: row._id, name: row.module_name, is_active: row.is_active }); }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setDeleteLoading(true);
    try {
      await deleteData({ endpoint: `modules/${deleteModal.id}`, token: cookies.t, instance: "identity" });
      showToastnew.success("Module deleted successfully");
      setDeleteModal(CLOSE_DELETE);
      await fetchList();
    } catch (err: unknown) {
      showToastnew.error(extractErrorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!statusModal.id) return;
    setStatusLoading(true);
    try {
      await patchData({
        endpoint: `modules/${statusModal.id}`,
        token: cookies.t,
        instance: "identity",
        data: { is_active: !statusModal.is_active },
      });
      showToastnew.success(statusModal.is_active ? "Module deactivated" : "Module activated");
      setStatusModal(CLOSE_STATUS);
      await fetchList();
    } catch (err: unknown) {
      showToastnew.error(extractErrorMessage(err));
    } finally {
      setStatusLoading(false);
    }
  };

  const columns = React.useMemo(() => {
    const base: {
      key: string;
      label: string;
      sortable: boolean;
      render?: (v: unknown, row: ModuleItem) => React.ReactNode;
    }[] = [
      {
        key: "module_id",
        label: "Module ID (Slug)",
        sortable: true,
        render: (_: unknown, row: ModuleItem) => (
          <span className="font-mono text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
            {row.module_id}
          </span>
        ),
      },
      { key: "module_name", label: "Module Name", sortable: true },
      {
        key: "is_active",
        label: "Status",
        sortable: false,
        render: (_: unknown, row: ModuleItem) => <StatusBadge is_active={row.is_active} />,
      },
    ];

    if (perms.edit || perms.delete) {
      base.push({
        key: "actions",
        label: "Actions",
        sortable: false,
        render: (_: unknown, row: ModuleItem) => (
          <div className="flex items-center gap-1">
            {perms.edit && (
              <button
                title="Edit"
                onClick={() => handleRowAction("edit", row)}
                className="p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
                aria-label={`Edit ${row.module_name}`}
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
            )}
            {perms.edit && (
              <button
                title={row.is_active ? "Deactivate" : "Activate"}
                onClick={() => handleRowAction("toggle", row)}
                className="p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
                aria-label={`Toggle ${row.module_name}`}
              >
                <Power className="h-3.5 w-3.5" />
              </button>
            )}
            {perms.delete && (
              <button
                title="Delete"
                onClick={() => handleRowAction("delete", row)}
                className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-950/40 transition-colors"
                aria-label={`Delete ${row.module_name}`}
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
                {editItem ? "Edit Module" : "Create Module"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {editItem ? "Update module name or status" : "Define a new permission module"}
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
            <ModuleForm
              token={cookies.t}
              initialValues={editItem ?? undefined}
              onSuccess={() => { setEditItem(null); setShowForm(false); fetchList(); }}
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
            placeholder="Search module by name or ID"
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
              Create Module
            </MyButton>
          ) : undefined
        }
      />

      <Modal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal(CLOSE_STATUS)}
        title={statusModal.is_active ? "Deactivate Module" : "Activate Module"}
        size="sm"
        showCloseButton
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Are you sure you want to {statusModal.is_active ? "deactivate" : "activate"}{" "}
            <strong>{statusModal.name}</strong>?
          </p>
          <div className="flex justify-end gap-3">
            <MyButton variant="outline" onClick={() => setStatusModal(CLOSE_STATUS)} disabled={statusLoading}>
              Cancel
            </MyButton>
            <MyButton variant="primary" onClick={handleStatusToggle} isLoading={statusLoading}>
              {statusModal.is_active ? "Deactivate" : "Activate"}
            </MyButton>
          </div>
        </div>
      </Modal>

      <DeleteModal
        isActive={deleteModal.isOpen}
        id={deleteModal.id ?? ""}
        name={deleteModal.name}
        title="Module"
        onClose={() => setDeleteModal(CLOSE_DELETE)}
        onClick={handleDelete}
        loading={deleteLoading}
      />
    </div>
  );
};

export default ModuleManagement;
