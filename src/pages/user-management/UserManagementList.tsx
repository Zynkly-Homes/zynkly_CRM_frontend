import React from "react";
import { AdvancedTable } from "../../atoms/AdvancedTable";
import { Modal } from "../../molecules/Modal";
import { MyButton } from "../../atoms/MyButton";
import { MyInput } from "../../atoms/MyInput";
import { showToastnew } from "../../services/toastifynewService/toastifynewService";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import { getData, patchData, deleteData } from "../../services/crmServices";
import UserForm from "./UserForm";
import DeleteModal from "../../atoms/DeleteModal";
import { Edit, Trash2, Power } from "lucide-react";
import { selectAccessData } from "../../store/slices/accessSlice";
import { selectApiKey, openApiKeyModal } from "../../store/slices/apiKeySlice";
import { scrollToTop } from "../../utils/scrollToTop";
import type { RootState } from "../../store";

// ---- Types ----

interface UserApiItem {
  _id: string;
  username: string;
  email: string;
  mobile_no: string;
  role_id: string;
  is_active: boolean;
  role?: { _id: string; role_name: string };
}

interface UsersApiData {
  data: UserApiItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UsersApiResponse {
  success: boolean;
  message: string;
  data: UsersApiData;
}

type UserItem = {
  _id: string;
  name: string;
  email: string;
  mobile_no?: string;
  role_name?: string;
  role_id?: string;
  is_active: boolean;
};

type DeleteModalState = { isOpen: boolean; id: string | null; name: string };
type StatusModalState = { isOpen: boolean; id: string; name: string; is_active: boolean };

// ---- Pure helpers ----

function mapUser(u: UserApiItem): UserItem {
  return {
    _id: u._id,
    name: u.username,
    email: u.email,
    mobile_no: u.mobile_no,
    role_name: u.role?.role_name,
    role_id: u.role_id,
    is_active: u.is_active,
  };
}

function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  const e = err as { error?: { response?: { data?: { message?: string } } }; message?: string };
  return e?.error?.response?.data?.message ?? e?.message ?? "Operation failed";
}

function StatusBadge({ is_active }: { is_active: boolean }) {
  const cls = is_active
    ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200"
    : "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {is_active ? "Active" : "Inactive"}
    </span>
  );
}

// ---- Component ----

const CLOSE_DELETE = { isOpen: false, id: null, name: "" } satisfies DeleteModalState;
const CLOSE_STATUS = { isOpen: false, id: "", name: "", is_active: true } satisfies StatusModalState;

const UserManagementList: React.FC = () => {
  const [cookies] = useCookies(["t"]);
  const dispatch = useDispatch();
  const apiKey = useSelector(selectApiKey);
  const access = useSelector((s: RootState) => selectAccessData(s));
  const perms = access?.["user_management"] ?? {};

  const [data, setData] = React.useState<UserItem[]>([]);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(25);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);
  const [editItem, setEditItem] = React.useState<UserItem | null>(null);
  const [deleteModal, setDeleteModal] = React.useState<DeleteModalState>(CLOSE_DELETE);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [statusModal, setStatusModal] = React.useState<StatusModalState>(CLOSE_STATUS);
  const [statusLoading, setStatusLoading] = React.useState(false);

  React.useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(id);
  }, [search]);

  const fetchList = React.useCallback(async () => {
    if (!apiKey) {
      dispatch(openApiKeyModal(false));
      return;
    }
    setLoading(true);
    try {
      const res = await getData<UsersApiResponse>({
        endpoint: "users",
        token: cookies.t,
        instance: "identity",
        params: { page, limit: perPage, search: debouncedSearch },
      });
      setData(res.data.data.map(mapUser));
      setTotal(res.data.total);
    } catch {
      showToastnew.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [apiKey, cookies.t, debouncedSearch, page, perPage, dispatch]);

  React.useEffect(() => { fetchList(); }, [fetchList]);

  const handleRowAction = (action: string, row: UserItem) => {
    if (action === "edit") { scrollToTop(); setEditItem(row); setShowForm(true); }
    if (action === "delete") { setDeleteModal({ isOpen: true, id: row._id, name: row.name }); }
    if (action === "toggle") { setStatusModal({ isOpen: true, id: row._id, name: row.name, is_active: row.is_active }); }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setDeleteLoading(true);
    try {
      await deleteData({ endpoint: `users/${deleteModal.id}`, token: cookies.t, instance: "identity" });
      showToastnew.success("User deleted successfully");
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
        endpoint: `users/${statusModal.id}`,
        token: cookies.t,
        instance: "identity",
        data: { is_active: !statusModal.is_active },
      });
      const msg = statusModal.is_active ? "User deactivated" : "User activated";
      showToastnew.success(msg);
      setStatusModal(CLOSE_STATUS);
      await fetchList();
    } catch (err: unknown) {
      showToastnew.error(extractErrorMessage(err));
    } finally {
      setStatusLoading(false);
    }
  };

  const columns = React.useMemo(() => {
    const base = [
      { key: "name", label: "User Name", sortable: true },
      { key: "email", label: "Email", sortable: true },
      {
        key: "role_name",
        label: "Role",
        sortable: true,
        render: (value: string) => value || "—",
      },
      {
        key: "is_active",
        label: "Status",
        sortable: true,
        render: (_: unknown, row: UserItem) => <StatusBadge is_active={row.is_active} />,
      },
    ];

    if (perms.edit || perms.delete) {
      base.push({
        key: "actions",
        label: "Actions",
        sortable: false,
        render: (_: unknown, row: UserItem) => (
          <div className="flex items-center space-x-2">
            {perms.edit && (
              <button
                title="Edit"
                onClick={() => handleRowAction("edit", row)}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label={`Edit ${row.name}`}
              >
                <Edit className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </button>
            )}
            {perms.edit && (
              <button
                title={row.is_active ? "Deactivate" : "Activate"}
                onClick={() => handleRowAction("toggle", row)}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label={`Toggle ${row.name}`}
              >
                <Power className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </button>
            )}
            {perms.delete && (
              <button
                title="Delete"
                onClick={() => handleRowAction("delete", row)}
                className="p-2 rounded hover:bg-red-50 dark:hover:bg-red-900"
                aria-label={`Delete ${row.name}`}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </button>
            )}
          </div>
        ),
      });
    }

    return base;
  }, [perms]);

  return (
    <>
      {showForm && perms.create && (
        <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
          <div className="flex items-start justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editItem ? "Edit User" : "Create User"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {editItem ? "Update user details" : "Add new user"}
              </p>
            </div>
            <MyButton
              variant="outline"
              onClick={() => { setShowForm(false); setEditItem(null); }}
              className="!px-3 !py-2"
            >
              Close Form
            </MyButton>
          </div>
          <div className="px-8 py-8">
            <UserForm
              token={cookies.t}
              initialValues={editItem ?? undefined}
              onSuccess={() => { setEditItem(null); setShowForm(false); fetchList(); }}
            />
          </div>
        </div>
      )}

      <div className="mt-6">
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
              placeholder="Search users by name or email"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full sm:w-[360px]"
            />
          }
          rightToolbar={
            !showForm && perms.create ? (
              <MyButton
                variant="primary"
                onClick={() => { setEditItem(null); setShowForm(true); }}
              >
                Create New User
              </MyButton>
            ) : undefined
          }
        />
      </div>

      <Modal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal(CLOSE_STATUS)}
        title={statusModal.is_active ? "Deactivate User" : "Activate User"}
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
        title="User"
        onClose={() => setDeleteModal(CLOSE_DELETE)}
        onClick={handleDelete}
        loading={deleteLoading}
      />
    </>
  );
};

export default UserManagementList;
