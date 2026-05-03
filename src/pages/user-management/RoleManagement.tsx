// import React from "react";
// import { MyInput } from "../../../atoms/MyInput";
// import { MyButton } from "../../../atoms/MyButton";
// import { AdvancedTable } from "../../../atoms/AdvancedTable";
// import DeleteModal from "../../../atoms/DeleteModal";
// import { showToastnew } from "../../../../src/services/toastifynewService/toastifynewService";
// import { useCookies } from "react-cookie";
// import { useSelector } from "react-redux";
// import { getData, deleteData } from "../../../services/crmServices";
// import RoleForm from "./RoleForm";
// import { Edit, Trash2 } from "lucide-react";
// import { selectAccessData } from "../../../store/slices/accessSlice";
// import { useAtom } from "jotai";
// import { dateRangeAtom, timeRangeAtom } from "../../../atoms/DateRnagepicker/dateRangeAtom";
// import { scrollToTop } from "../../../utils/scrollToTop";
// import { ActionSetBadge } from "./Permissionsbottomsheet";

// type RoleAccess = {
//   module_id: string;
//   create?: boolean;
//   edit?: boolean;
//   view?: boolean;
//   delete?: boolean;
//   transfer?: boolean;
//   export?: boolean;
// };

// type RoleItem = {
//   _id: string;
//   role_name: string;
//   role_access?: RoleAccess[] | null;
// };

// const RoleManagement: React.FC = () => {
//   const [cookies] = useCookies(["t"]);
//   const [data, setData] = React.useState<RoleItem[]>([]);
//   const [search, setSearch] = React.useState("");
//   const [debouncedSearch, setDebouncedSearch] = React.useState("");
//   const [page, setPage] = React.useState(1);
//   const [perPage, setPerPage] = React.useState(25);
//   const [total, setTotal] = React.useState(0);
//   const [loading, setLoading] = React.useState(false);
//   const [showForm, setShowForm] = React.useState(false);
//   const [editItem, setEditItem] = React.useState<RoleItem | null>(null);
//   const [deleteModal, setDeleteModal] = React.useState<{
//     isOpen: boolean;
//     id: string | null;
//     name: string;
//   }>({ isOpen: false, id: null, name: "" });
//   const [deleteLoading, setDeleteLoading] = React.useState(false);

//   const [dateRange] = useAtom(dateRangeAtom);
//   const [timeRange] = useAtom(timeRangeAtom);
//   const access = useSelector((s: any) => selectAccessData(s));
//   const roleManagementPermissions = access?.["user-management"] || {};

//   React.useEffect(() => {
//     const id = setTimeout(() => setDebouncedSearch(search.trim()), 350);
//     return () => clearTimeout(id);
//   }, [search]);

//   const fetchList = React.useCallback(async () => {
//     setLoading(true);
//     try {
//       const params: any = { search: debouncedSearch, page, limit: perPage };
//       if (timeRange === "custom" && dateRange.from && dateRange.to) {
//         params.start_date = dateRange.from.toISOString();
//         params.end_date = dateRange.to.toISOString();
//       }
//       const res = await getData<any>({
//         endpoint: "role/getAllRoles",
//         token: cookies.t,
//         params,
//       });
//       const payload: any[] = res?.userdata ?? res?.data?.userdata ?? res?.data ?? [];
//       const pageInfo = res?.pageDetails ?? res?.data?.pageDetails;
//       const rows: RoleItem[] = payload.map((r: any) => ({
//         _id: r._id ?? r.id,
//         role_name: r.role_name,
//         role_access: r.role_access ?? null,
//       }));
//       setData(rows);
//       setTotal(pageInfo?.totalCount ?? rows.length);
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setLoading(false);
//     }
//   }, [cookies.t, debouncedSearch, page, perPage]);

//   React.useEffect(() => { fetchList(); }, [fetchList]);

//   const handleRowAction = (action: string, row: RoleItem) => {
//     if (action === "edit") { scrollToTop(); setEditItem(row); setShowForm(true); }
//     if (action === "delete") { setDeleteModal({ isOpen: true, id: row._id, name: row.role_name }); }
//   };

//   const columns = React.useMemo(() => {
//     const base: any[] = [
//       {
//         key: "role_name",
//         label: "Role",
//         sortable: true,
//         render: (_: any, row: RoleItem) => (
//           <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
//             {row.role_name}
//           </span>
//         ),
//       },
//       {
//         key: "role_access",
//         label: "Action Set",
//         sortable: false,
//         render: (_: any, row: RoleItem) => {
//           const list = row.role_access || [];
//           return list.length === 0 ? (
//             <span className="text-xs text-gray-400 dark:text-gray-600">—</span>
//           ) : (
//             <ActionSetBadge access={list} />
//           );
//         },
//       },
//     ];

//     if (roleManagementPermissions.edit || roleManagementPermissions.delete) {
//       base.push({
//         key: "actions",
//         label: "Actions",
//         sortable: false,
//         render: (_: any, row: RoleItem) => (
//           <div className="flex items-center gap-1">
//             {roleManagementPermissions.edit && (
//               <button
//                 title="Edit"
//                 onClick={() => handleRowAction("edit", row)}
//                 className="p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100
//                   dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
//                 aria-label={`Edit ${row.role_name}`}
//               >
//                 <Edit className="h-3.5 w-3.5" />
//               </button>
//             )}
//             {roleManagementPermissions.delete && (
//               <button
//                 title="Delete"
//                 onClick={() => handleRowAction("delete", row)}
//                 className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50
//                   dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-950/40 transition-colors"
//                 aria-label={`Delete ${row.role_name}`}
//               >
//                 <Trash2 className="h-3.5 w-3.5" />
//               </button>
//             )}
//           </div>
//         ),
//       });
//     }
//     return base;
//   }, [roleManagementPermissions]);

//   const handleDelete = async () => {
//     if (!deleteModal.id) return;
//     setDeleteLoading(true);
//     try {
//       const res: any = await deleteData({
//         endpoint: "role/delete",
//         token: cookies.t,
//         params: { role_id: deleteModal.id },
//       });
//       showToastnew.success(res?.data?.message || "Role deleted successfully");
//       await fetchList();
//       setDeleteModal({ isOpen: false, id: null, name: "" });
//     } catch (e: any) {
//       showToastnew.error(e?.error?.response?.data?.error || "Failed to delete role");
//     } finally {
//       setDeleteLoading(false);
//     }
//   };

//   return (
//     <div className="w-full max-w-full">
//       {showForm && roleManagementPermissions.create && (
//         <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-xl
//           bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
//           <div className="flex items-start justify-between px-4 sm:px-6 py-4
//             border-b border-gray-100 dark:border-gray-800">
//             <div>
//               <h3 className="text-base font-semibold text-gray-900 dark:text-white">
//                 {editItem ? "Edit Role" : "Create Role"}
//               </h3>
//               <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
//                 Set role name and module permissions
//               </p>
//             </div>
//             <MyButton
//               variant="outline"
//               onClick={() => { setShowForm(false); setEditItem(null); }}
//               className="!px-3 !py-1.5 text-xs flex-shrink-0 ml-4"
//             >
//               Close
//             </MyButton>
//           </div>
//           <div className="px-4 sm:px-6 py-5">
//             <RoleForm
//               token={cookies.t}
//               initialValues={editItem || undefined}
//               onSuccess={() => {
//                 setEditItem(null);
//                 setShowForm(false);
//                 fetchList();
//               }}
//             />
//           </div>
//         </div>
//       )}

//       <AdvancedTable
//         data={data}
//         columns={columns}
//         actions={[]}
//         onRowAction={handleRowAction}
//         pagination={{ total, page, perPage, onPageChange: setPage, onPerPageChange: setPerPage }}
//         showBuiltinSearch={false}
//         title={null}
//         leftToolbar={
//           <MyInput
//             placeholder="Search role by name"
//             value={search}
//             onChange={(e) => { setSearch(e.target.value); setPage(1); }}
//             className="w-full sm:w-72"
//           />
//         }
//         loading={loading}
//         rightToolbar={
//           // !showForm && roleManagementPermissions.create ? (
//             <MyButton
//               variant="primary"
//               onClick={() => { setEditItem(null); setShowForm(true); }}
//               className="w-full sm:w-auto whitespace-nowrap"
//             >
//               Create New Role
//             </MyButton>
//           // ) : undefined
//         }
//       />

//       <DeleteModal
//         isActive={deleteModal.isOpen}
//         id={deleteModal.id ?? ""}
//         name={deleteModal.name}
//         title="Role"
//         onClose={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
//         onClick={handleDelete}
//         loading={deleteLoading}
//       />
//     </div>
//   );
// };

// export default RoleManagement;






//v2 removet roleManagementPermissions and related conditions
import React from "react";
import { MyInput } from "../../atoms/MyInput";
import { MyButton } from "../../atoms/MyButton";
import { AdvancedTable } from "../../atoms/AdvancedTable";
import DeleteModal from "../../atoms/DeleteModal";
import { showToastnew } from "../../services/toastifynewService/toastifynewService";
import { useCookies } from "react-cookie";
import { getData, deleteData } from "../../services/crmServices";
import RoleForm from "./RoleForm";
import { Edit, Trash2 } from "lucide-react";
import { scrollToTop } from "../../utils/scrollToTop";
import { ActionSetBadge } from "./Permissionsbottomsheet";

type RoleAccess = {
  module_id: string;
  create?: boolean;
  edit?: boolean;
  view?: boolean;
  delete?: boolean;
  transfer?: boolean;
  export?: boolean;
};

type RoleItem = {
  _id: string;
  role_name: string;
  role_access?: RoleAccess[] | null;
};

const RoleManagement: React.FC = () => {
  const [cookies] = useCookies(["t"]);
  const [data, setData] = React.useState<RoleItem[]>([]);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(25);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);
  const [editItem, setEditItem] = React.useState<RoleItem | null>(null);
  const [deleteModal, setDeleteModal] = React.useState<{
    isOpen: boolean;
    id: string | null;
    name: string;
  }>({ isOpen: false, id: null, name: "" });
  const [deleteLoading, setDeleteLoading] = React.useState(false);


  React.useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(id);
  }, [search]);

  const fetchList = React.useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { search: debouncedSearch, page, limit: perPage };
      const res = await getData<any>({
        endpoint: "role/getAllRoles",
        token: cookies.t,
        params,
      });
      const payload: any[] = res?.userdata ?? res?.data?.userdata ?? res?.data ?? [];
      const pageInfo = res?.pageDetails ?? res?.data?.pageDetails;
      const rows: RoleItem[] = payload.map((r: any) => ({
        _id: r._id ?? r.id,
        role_name: r.role_name,
        role_access: r.role_access ?? null,
      }));
      setData(rows);
      setTotal(pageInfo?.totalCount ?? rows.length);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [cookies.t, debouncedSearch, page, perPage]);

  React.useEffect(() => { fetchList(); }, [fetchList]);

  const handleRowAction = (action: string, row: RoleItem) => {
    if (action === "edit") { scrollToTop(); setEditItem(row); setShowForm(true); }
    if (action === "delete") { setDeleteModal({ isOpen: true, id: row._id, name: row.role_name }); }
  };

  const columns = React.useMemo(() => {
    const base: any[] = [
      {
        key: "role_name",
        label: "Role",
        sortable: true,
        render: (_: any, row: RoleItem) => (
          <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
            {row.role_name}
          </span>
        ),
      },
      {
        key: "role_access",
        label: "Action Set",
        sortable: false,
        render: (_: any, row: RoleItem) => {
          const list = row.role_access || [];
          return list.length === 0 ? (
            <span className="text-xs text-gray-400 dark:text-gray-600">—</span>
          ) : (
            <ActionSetBadge access={list} />
          );
        },
      },
    ];

    // if (roleManagementPermissions.edit || roleManagementPermissions.delete) {
      base.push({
        key: "actions",
        label: "Actions",
        sortable: false,
        render: (_: any, row: RoleItem) => (
          <div className="flex items-center gap-1">
            {/* {roleManagementPermissions.edit && ( */}
              <button
                title="Edit"
                onClick={() => handleRowAction("edit", row)}
                className="p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100
                  dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
                aria-label={`Edit ${row.role_name}`}
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
            {/* )} */}
            {/* {roleManagementPermissions.delete && ( */}
              <button
                title="Delete"
                onClick={() => handleRowAction("delete", row)}
                className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50
                  dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-950/40 transition-colors"
                aria-label={`Delete ${row.role_name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            {/* )} */}
          </div>
        ),
      });
    // }
    return base;
  }, []); // Removed roleManagementPermissions dependency

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setDeleteLoading(true);
    try {
      const res: any = await deleteData({
        endpoint: "role/delete",
        token: cookies.t,
        params: { role_id: deleteModal.id },
      });
      showToastnew.success(res?.data?.message || "Role deleted successfully");
      await fetchList();
      setDeleteModal({ isOpen: false, id: null, name: "" });
    } catch (e: any) {
      showToastnew.error(e?.error?.response?.data?.error || "Failed to delete role");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="w-full max-w-full">
      {showForm && ( // Removed roleManagementPermissions.create condition
        <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-xl
          bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
          <div className="flex items-start justify-between px-4 sm:px-6 py-4
            border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {editItem ? "Edit Role" : "Create Role"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Set role name and module permissions
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
            <RoleForm
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

      <AdvancedTable
        data={data}
        columns={columns}
        actions={[]}
        onRowAction={handleRowAction}
        pagination={{ total, page, perPage, onPageChange: setPage, onPerPageChange: setPerPage }}
        showBuiltinSearch={false}
        title={null}
        leftToolbar={
          <MyInput
            placeholder="Search role by name"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full sm:w-72"
          />
        }
        loading={loading}
        rightToolbar={
          // !showForm && roleManagementPermissions.create ? (
            <MyButton
              variant="primary"
              onClick={() => { setEditItem(null); setShowForm(true); }}
              className="w-full sm:w-auto whitespace-nowrap"
            >
              Create New Role
            </MyButton>
          // ) : undefined
        }
      />

      <DeleteModal
        isActive={deleteModal.isOpen}
        id={deleteModal.id ?? ""}
        name={deleteModal.name}
        title="Role"
        onClose={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
        onClick={handleDelete}
        loading={deleteLoading}
      />
    </div>
  );
};

export default RoleManagement;