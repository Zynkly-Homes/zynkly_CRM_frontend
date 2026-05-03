// //10-nov-2025
// //with filter ok.
// //raback internally
import React from "react";
import { AdvancedTable } from "../../atoms/AdvancedTable";
import { Modal } from "../../molecules/Modal";
import { MyButton } from "../../atoms/MyButton";
import { MyInput } from "../../atoms/MyInput";
import { showToastnew } from "../../services/toastifynewService/toastifynewService";
import { useCookies } from "react-cookie";
import { useSelector } from "react-redux";
import { getData, patchData, deleteData } from "../../services/crmServices";
import UserForm from "./UserForm";
import DeleteModal from "../../atoms/DeleteModal";
import { Edit, Trash2, Power, Send, X, Filter } from "lucide-react";
import { selectAccessData } from "../../store/slices/accessSlice";
import { MultiSelectFilter } from "../../atoms/MultiSelectFilter";
import { MyDropdown } from "../../atoms/MyDropdown";
import { scrollToTop } from "../../utils/scrollToTop";


type UserItem = {
  _id: string;
  name: string;
  email: string;
  role_name?: string;
  role_id?: string;
  // status: "Active" | "Inactive" | "Pending" | "Cancelled" | "Password Not set" | null;
  status: "active" | "Active" | "inactive" | "InActive" | "pending" | "Pending" | "Password Not set" | "Cancelled" | null;

};

const StatusBadge: React.FC<{ status: UserItem["status"] }> = ({ status }) => {
  if (!status) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
        —
      </span>
    );
  }

  switch (status) {
    case "active":
    case "Active":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          Active
        </span>
      );
    case "inactive":
    case "InActive":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          Inactive
        </span>
      );
    case "pending":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          Pending
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
          {String(status)}
        </span>
      );
  }
};

const UserManagementList: React.FC = () => {
  const [cookies] = useCookies(["t"]);
  const [data, setData] = React.useState<UserItem[]>([]);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(25);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);
  const [editItem, setEditItem] = React.useState<UserItem | null>(null);
  const [deleteModal, setDeleteModal] = React.useState<{ isOpen: boolean; id: string | null; name: string }>({
    isOpen: false,
    id: null,
    name: "",
  });
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [statusModal, setStatusModal] = React.useState<{ isOpen: boolean; id: string; name: string; is_active: boolean }>({
    isOpen: false,
    id: "",
    name: "",
    is_active: true,
  });
  const [statusLoading, setStatusLoading] = React.useState(false);
  const [invitedIds, setInvitedIds] = React.useState<Set<string>>(new Set());
  const [inviteLoadingIds, setInviteLoadingIds] = React.useState<Set<string>>(new Set());

  // Filter states
  const [showFilters, setShowFilters] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<string[]>([]);
  const [roleFilter, setRoleFilter] = React.useState<string>("");
  const [hasActiveFilters, setHasActiveFilters] = React.useState(false);

  // Get logged-in user's permissions
  const access = useSelector((s: any) => selectAccessData(s));
  const userManagementPermissions = access?.["user-management"] || {};

  // Status options for filter
  const statusOptions = [
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
    { label: "Pending", value: "Pending" },
    { label: "Cancelled", value: "Cancelled" },
    { label: "Password Not Set", value: "Password Not set" },
  ];

  React.useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(id);
  }, [search]);

  // Track active filters
  React.useEffect(() => {
    const active = statusFilter.length > 0 || roleFilter !== "";
    setHasActiveFilters(active);
  }, [statusFilter, roleFilter]);

  const fetchList = React.useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        search: debouncedSearch,
        page,
        limit: perPage,
      };

      // Add status filter if selected
      if (statusFilter.length > 0) {
        params.status = statusFilter.join(',');
      }

      // Add role filter if selected
      if (roleFilter) {
        params.userRole = roleFilter;
      }

      const res = await getData<any>({
        endpoint: "crmAuth/getAllUsers",
        token: cookies.t,
        params: params,
      });

      const payload: any[] = res?.userdata ?? res?.data?.userdata ?? [];
      const pageInfo = res?.pageDetails ?? res?.data?.pageDetails;

      const rows: UserItem[] = payload.map((user: any) => ({
        _id: user._id ?? user.id,
        name: user.name,
        email: user.email,
        role_name: user.role_name,
        role_id: user.role_id,
        status: user.status ?? null,
      }));

      setData(rows);
      setTotal(pageInfo?.totalCount ?? rows.length);
    } catch (e) {
      console.error(e);
      showToastnew.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [cookies.t, debouncedSearch, page, perPage, statusFilter, roleFilter]);

  React.useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleRowAction = async (action: string, row: UserItem) => {
    if (action === "edit") {
      // const mainScroller = document.querySelector('main') as HTMLElement;
      // if (mainScroller) {
      //   mainScroller.scrollTo({ top: 0, behavior: 'smooth' });
      // }
      scrollToTop();
      setEditItem(row);
      setShowForm(true);
      return;
    }
    if (action === "delete") {
      setDeleteModal({ isOpen: true, id: row._id, name: row.name });
      return;
    }
    if (action === "toggle") {
      setStatusModal({
        isOpen: true,
        id: row._id,
        name: row.name,
        is_active: row.status === "active",
      });
      return;
    }
    if (action === "resendInvite") {
      await handleResendInvite(row);
      return;
    }
    if (action === "cancelInvite") {
      await handleCancelInvite(row);
      return;
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setDeleteLoading(true);

    try {
      const res: any = await deleteData({
        endpoint: "crmAuth/deleteUser",
        token: cookies.t,
        params: { id: deleteModal.id },
      });

      // Success toast from backend response
      const successMsg = res?.data?.message || "User deleted successfully...";
      showToastnew.success(successMsg);

      await fetchList();
      setDeleteModal({ isOpen: false, id: null, name: "" });
    } catch (e: any) {
      console.error("Delete error:", e);

      // Error toast from backend
      const errorMsg =
        e?.error?.response?.data?.error ||
        "Failed to delete user.....";

      console.log("error msg", e?.error?.response?.data?.error);

      showToastnew.error(errorMsg);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleConfirmStatusToggle = async () => {
    if (!statusModal.id) return;
    setStatusLoading(true);
    try {
      const newStatus = statusModal.is_active ? "inactive" : "active";
      await patchData({
        endpoint: "crmAuth/updateStatus",
        token: cookies.t,
        data: { id: statusModal.id, status: newStatus },
      });
      showToastnew.success(newStatus === "active" ? "User Activated Successfully" : "User Deactivated Successfully");
      setStatusModal({ isOpen: false, id: "", name: "", is_active: true });
      await fetchList();
    } catch (e: any) {
      console.error("Status toggle error:", e);
      showToastnew.error(e?.data?.message || e?.message || "Status update failed");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleResendInvite = async (row: UserItem) => {
    if (!row._id) return;
    setInviteLoadingIds((s) => new Set(s).add(row._id));
    try {
      await getData({
        endpoint: "crmAuth/resendInvite",
        token: cookies.t,
        params: { email: row.email, id: row._id },
      });
      showToastnew.success("Invite sent successfully");
      setInvitedIds((s) => new Set(s).add(row._id));
      await fetchList();
    } catch (err: any) {
      console.error("resendInvite error:", err);
      showToastnew.error(err?.data?.message || err?.message || "Failed to send invite");
    } finally {
      setInviteLoadingIds((s) => {
        const copy = new Set(s);
        copy.delete(row._id);
        return copy;
      });
    }
  };

  const handleCancelInvite = async (row: UserItem) => {
    if (!row._id) return;
    setInviteLoadingIds((s) => new Set(s).add(row._id));
    try {
      await getData({
        endpoint: "crmAuth/cancelInvite",
        token: cookies.t,
        params: { email: row.email, id: row._id },
      });
      showToastnew.success("Invite cancelled");
      setInvitedIds((s) => {
        const copy = new Set(s);
        copy.delete(row._id);
        return copy;
      });
      await fetchList();
    } catch (err: any) {
      console.error("cancelInvite error:", err);
      showToastnew.error(err?.data?.message || err?.message || "Failed to cancel invite");
    } finally {
      setInviteLoadingIds((s) => {
        const copy = new Set(s);
        copy.delete(row._id);
        return copy;
      });
    }
  };

  const clearAllFilters = () => {
    setStatusFilter([]);
    setRoleFilter("");
    setShowFilters(false);
  };

  const columns = React.useMemo(
    () => {
      const baseColumns = [
        {
          key: "name",
          label: "User Name",
          sortable: true,
        },
        {
          key: "email",
          label: "Email",
          sortable: true,
        },
        {
          key: "role_name",
          label: "Role",
          sortable: true,
          render: (value: string) => value || "—",
        },
        // {
        //   key: "status",
        //   label: "Status",
        //   sortable: true,
        //   render: (value: UserItem["status"], row: UserItem) => <StatusBadge status={value} />,
        // },


        {
          key: "status",
          label: "Status",
          sortable: true,

          render: (value: any, row: UserItem) => {
            const statusValue = row.status || "unknown";
            console.log("statusV : ", statusValue);

            const statusClass =
              statusValue === "Active" || statusValue === "active"
                ? "bg-green-100 text-green-800 border border-green-200"
                : statusValue === "Password Not set"
                  ? "bg-purple-100 text-purple-800 border border-purple-200"
                  : statusValue === "inactive" || statusValue === "InActive"
                    ? "bg-red-100 text-red-800 border border-red-200"


                    : statusValue === "pending" || statusValue === "Pending"
                      ? "bg-yellow-100 text-red-800 border border-yellow-200"

                      // : statusValue === "Cancelled"
                      //   ? "bg-red-800 text-white border border-red-900" //  Deep red styling
                      //   : "bg-gray-100 text-gray-800 border border-gray-200";
                      : statusValue === "Cancelled"
                        ? "bg-red-100 text-red-800 border border-red-200"
                        : "bg-gray-100 text-gray-800 border border-gray-200";


            return (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-full ${statusClass}`}>
                {/* {statusValue.toUpperCase()} */}
                {statusValue.charAt(0).toUpperCase() + statusValue.slice(1).toLowerCase()}
              </span>
            );
          },
        }
      ];

      // Add Actions column only if at least one action is permitted
      if (userManagementPermissions.edit || userManagementPermissions.delete || userManagementPermissions.create) {
        baseColumns.push({
          key: "actions",
          label: "Actions",
          sortable: false,
          render: (_: any, row: UserItem) => {
            const isInvited = invitedIds.has(row._id);
            const isInviteLoading = inviteLoadingIds.has(row._id);

            return (
              <div className="flex items-center space-x-2">
                {userManagementPermissions.edit && (
                  <button
                    title="Edit"
                    onClick={() => handleRowAction("edit", row)}
                    className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label={`Edit ${row.name}`}
                  >
                    <Edit className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </button>
                )}
                {userManagementPermissions.edit && (
                  <button
                    title={row.status === "active" ? "Deactivate" : "Activate"}
                    onClick={() => handleRowAction("toggle", row)}
                    className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label={`${row.status === "active" ? "Deactivate" : "Activate"} ${row.name}`}
                  >
                    <Power className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </button>
                )}
                {userManagementPermissions.delete && (
                  <button
                    title="Delete"
                    onClick={() => handleRowAction("delete", row)}
                    className="p-2 rounded hover:bg-red-50 dark:hover:bg-red-900"
                    aria-label={`Delete ${row.name}`}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                )}
                {userManagementPermissions.create && row.status === "Cancelled" && (
                  <button
                    title="Send Invite"
                    onClick={() => handleResendInvite(row)}
                    className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    disabled={isInviteLoading}
                    aria-label={`Send invite to ${row.email}`}
                  >
                    {isInviteLoading ? (
                      <span className="inline-block w-4 h-4 animate-spin border-2 border-current rounded-full" />
                    ) : (
                      <Send className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                    )}
                  </button>
                )}
                {userManagementPermissions.create && row.status === "Pending" && (
                  <button
                    title="Cancel Invite"
                    onClick={() => handleCancelInvite(row)}
                    className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    disabled={isInviteLoading}
                    aria-label={`Cancel invite to ${row.email}`}
                  >
                    {isInviteLoading ? (
                      <span className="inline-block w-4 h-4 animate-spin border-2 border-current rounded-full" />
                    ) : (
                      <X className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    )}
                  </button>
                )}
                {userManagementPermissions.create && row.status === "Password Not set" && (
                  <>
                    {!isInvited ? (
                      <button
                        title="Send Invite"
                        onClick={() => handleResendInvite(row)}
                        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                        disabled={isInviteLoading}
                        aria-label={`Send invite to ${row.email}`}
                      >
                        {isInviteLoading ? (
                          <span className="inline-block w-4 h-4 animate-spin border-2 border-current rounded-full" />
                        ) : (
                          <Send className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                        )}
                      </button>
                    ) : (
                      <button
                        title="Cancel Invite"
                        onClick={() => handleCancelInvite(row)}
                        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                        disabled={isInviteLoading}
                        aria-label={`Cancel invite to ${row.email}`}
                      >
                        {isInviteLoading ? (
                          <span className="inline-block w-4 h-4 animate-spin border-2 border-current rounded-full" />
                        ) : (
                          <X className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          },
        });
      }

      return baseColumns;
    },
    [invitedIds, inviteLoadingIds, userManagementPermissions]
  );

  return (
    <>
      {showForm && userManagementPermissions.create && (
        <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 finbros-gradient dark:bg-gray-900 dark:bg-none">
          <div className="flex items-start justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{editItem ? "Edit User" : "Create User"}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{editItem ? "Update user details" : "Add new user"}</p>
            </div>
            <MyButton
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setEditItem(null);
              }}
              className="!px-3 !py-2"
            >
              Close Form
            </MyButton>
          </div>
          <div className="px-8 py-8">
            <UserForm
              token={cookies.t}
              initialValues={editItem || undefined}
              onSuccess={() => {
                setEditItem(null);
                setShowForm(false);
                fetchList();
              }}
            />
          </div>
        </div>
      )}

      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
              {hasActiveFilters && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                  Active
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <MyButton
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Clear All
                </MyButton>
              )}
              <MyButton
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Hide Filters
              </MyButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <MultiSelectFilter
                options={statusOptions}
                selectedValues={statusFilter}
                onChange={setStatusFilter}
                placeholder="Select status..."
                singleSelect={true}
              />
            </div>

            {/* Role Filter */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role
              </label>
              <MyDropdown
                value={roleFilter}
                onChange={setRoleFilter}
                placeholder="Select role"
                required={false}
                fetchOptions={async (page, limit, search) => {
                  try {
                    const res = await getData({
                      endpoint: "role/getAllRoles",
                      token: cookies.t,
                      params: {
                        page,
                        limit,
                        search: search || "",
                      },
                    });

                    const rolesData = res?.data?.roles?.map((role: any) => ({
                      label: role.name,
                      value: role._id || role.id,
                    })) || [];

                    return {
                      options: rolesData,
                      pagination: {
                        total: res?.data?.pagination?.total || rolesData.length,
                        page: res?.data?.pagination?.page || page,
                        limit,
                        totalPages: res?.data?.pagination?.totalPages || 1,
                      },
                    };
                  } catch (error) {
                    console.error("Error fetching paginated roles:", error);
                    return {
                      options: [],
                      pagination: { total: 0, page, limit, totalPages: 0 },
                    };
                  }
                }}
                fetchSingle={async (id) => {
                  try {
                    if (!id) return { label: "", value: "" };
                    const res = await getData({
                      endpoint: "role/getRoleById",
                      token: cookies.t,
                      params: { id },
                    });
                    const role = res?.data?.role;
                    return role ? { label: role.name, value: role._id || role.id } : { label: "", value: "" };
                  } catch (error) {
                    console.error("Error fetching single role:", error);
                    return { label: "", value: "" };
                  }
                }}
              />
            </div> */}
            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role
              </label>
              <MyDropdown
                value={roleFilter}
                onChange={setRoleFilter}
                placeholder="Select role"
                required={false}
                fetchOptions={async (page, limit, search) => {
                  try {
                    const res = await getData({
                      endpoint: "role/getAllRoles",
                      token: cookies.t,
                      params: {
                        page,
                        limit,
                        search: search || "",
                      },
                    });

                    // Updated: Use userdata array and role_name with id
                    const rolesData = res?.data?.userdata?.map((role: any) => ({
                      label: role.role_name, // Use role_name from API
                      value: role.id, // Use id from API
                    })) || [];

                    return {
                      options: rolesData,
                      pagination: {
                        total: res?.data?.pagination?.total || rolesData.length,
                        page: res?.data?.pagination?.page || page,
                        limit,
                        totalPages: res?.data?.pagination?.totalPages || 1,
                      },
                    };
                  } catch (error) {
                    console.error("Error fetching paginated roles:", error);
                    return {
                      options: [],
                      pagination: { total: 0, page, limit, totalPages: 0 },
                    };
                  }
                }}
                fetchSingle={async (id) => {
                  try {
                    if (!id) return { label: "", value: "" };
                    const res = await getData({
                      endpoint: "role/getRoleById",
                      token: cookies.t,
                      params: { id },
                    });
                    const role = res?.data?.role;
                    return role ? { label: role.role_name, value: role.id } : { label: "", value: "" };
                  } catch (error) {
                    console.error("Error fetching single role:", error);
                    return { label: "", value: "" };
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <AdvancedTable
          data={data}
          columns={columns}
          actions={[]}
          onRowAction={handleRowAction}
          pagination={{
            total,
            page,
            perPage,
            onPageChange: setPage,
            onPerPageChange: setPerPage,
          }}
          showBuiltinSearch={false}
          title={null}
          loading={loading}
          leftToolbar={
            <div className="flex items-center space-x-4">
              <MyInput
                placeholder="Search users by name, email or role"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                // className="w-56 sm:w-64"
                 className="w-full sm:w-[360px]"
              />
            </div>
          }
          rightToolbar={
            <div className="flex items-center space-x-4">
              {/* Filter Toggle Button */}
              <MyButton
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                className="whitespace-nowrap"
              >
                <div className="flex items-center gap-2">
                  
                <Filter className="h-4 w-4" />
                {hasActiveFilters && (
                  <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {statusFilter.length + (roleFilter ? 1 : 0)}
                  </span>
                )}
                </div>
              </MyButton>

              {!showForm && userManagementPermissions.create && (
                <MyButton
                  variant="primary"
                  onClick={() => {
                    setEditItem(null);
                    setShowForm(true);
                  }}
                >
                  Create New User
                </MyButton>
              )}
            </div>
          }
        />
           <AdvancedTable
          data={data}
          columns={columns}
          actions={[]}
          onRowAction={handleRowAction}
          pagination={{
            total,
            page,
            perPage,
            onPageChange: setPage,
            onPerPageChange: setPerPage,
          }}
          showBuiltinSearch={false}
          title={null}
          loading={loading}
          leftToolbar={
            <div className="flex items-center space-x-4">
              <MyInput
                placeholder="Search users by name, email or role"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                // className="w-56 sm:w-64"
                 className="w-full sm:w-[360px]"
              />
            </div>
          }
          rightToolbar={
            <div className="flex items-center space-x-4">
              {/* Filter Toggle Button */}
              <MyButton
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                className="whitespace-nowrap"
              >
                <div className="flex items-center gap-2">
                  
                <Filter className="h-4 w-4" />
                {hasActiveFilters && (
                  <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {statusFilter.length + (roleFilter ? 1 : 0)}
                  </span>
                )}
                </div>
              </MyButton>

              {!showForm && userManagementPermissions.create && (
                <MyButton
                  variant="primary"
                  onClick={() => {
                    setEditItem(null);
                    setShowForm(true);
                  }}
                >
                  Create New User
                </MyButton>
              )}
            </div>
          }
        />
      </div>


      {/* <button
        className="fixed bottom-6 right-6 z-50 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all hover:scale-110"
        onClick={() => {
          // This works in Finbros CRM (tested pattern)
          const mainScroller = document.querySelector('main')
            || document.querySelector('.h-screen.overflow-y-auto')
            || document.querySelector('#root > div') // fallback
            || document.body;
            
          mainScroller?.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        aria-label="Scroll to top"
      >
        ↑
      </button> */}


      <Modal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, id: "", name: "", is_active: true })}
        title={statusModal.is_active ? "Deactivate User" : "Activate User"}
        size="sm"
        showCloseButton={true}

      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Are you sure you want to {statusModal.is_active ? "deactivate" : "activate"} <strong>{statusModal.name}</strong>?
          </p>
          <div className="flex justify-end gap-3">
            <MyButton
              variant="outline"
              onClick={() => setStatusModal({ isOpen: false, id: "", name: "", is_active: true })}
              disabled={statusLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </MyButton>
            <MyButton
              variant="primary"
              onClick={handleConfirmStatusToggle}
              isLoading={statusLoading}
              className="w-full sm:w-auto"
            >
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
        onClose={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
        onClick={handleDelete}
        loading={deleteLoading}
      />
    </>
  );
};

export default UserManagementList;
