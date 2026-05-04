import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { MyInput } from "../../atoms/MyInput";
import { MyButton } from "../../atoms/MyButton";
import { showToastnew } from "../../services/toastifynewService/toastifynewService";
import { postData, patchData, getData } from "../../services/crmServices";
import { Check } from "lucide-react";
import { COLORS } from "../../theme/colors";
import { useCookies } from "react-cookie";

type ModuleAccess = {
  module_id: string;
  label: string;
  create?: boolean;
  edit?: boolean;
  view?: boolean;
  delete?: boolean;
  transfer?: boolean;
  export?: boolean;
};

type ModuleFromAPI = {
  _id: string;
  module_id: string;
  module_name: string;
  is_active?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type RoleFormProps = {
  token?: string;
  initialValues?: { _id?: string; role_name?: string; role_access?: any[] };
  onSuccess: () => void;
};

/** Checkbox-looking button: proper a11y + keyboard + focus ring */
const PermCheckbox: React.FC<{
  checked: boolean;
  onToggle: () => void;
  ariaLabel?: string;
}> = ({ checked, onToggle, ariaLabel }) => {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onToggle();
        }
      }}
      style={
        checked
          ? {
              backgroundColor: COLORS.primary.DEFAULT,
              borderColor: COLORS.primary.DEFAULT,
            }
          : undefined
      }
      className={[
        "h-5 w-5 rounded-md border transition-all",
        "flex items-center justify-center",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        checked
          ? "text-white"
          : "border-gray-300 bg-transparent dark:border-gray-600",
        !checked && "hover:bg-gray-100 dark:hover:bg-gray-700",
      ].join(" ")}
    >
      {checked && <Check className="h-3.5 w-3.5 text-white" />}
    </button>
  );
};

const RoleForm: React.FC<RoleFormProps> = ({ token, initialValues, onSuccess }) => {
  const [cookies] = useCookies(["t"]);
  const [modules, setModules] = React.useState<ModuleFromAPI[]>([]);
  const [loadingModules, setLoadingModules] = React.useState(true);

  // Fetch modules from identity API
  React.useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoadingModules(true);
        const response = await getData<{
          success: boolean;
          data: { data: ModuleFromAPI[]; total: number };
        }>({
          endpoint: "modules",
          token: cookies.t || token,
          instance: "identity",
          params: { page: 1, limit: 100 },
        });
        setModules(response?.data?.data ?? []);
      } catch {
        showToastnew.error("Failed to load modules");
        setModules([]);
      } finally {
        setLoadingModules(false);
      }
    };

    fetchModules();
  }, [cookies.t, token]);

  const validationSchema = Yup.object({
    role_name: Yup.string().trim().required("Role name is required"),
    role_access: Yup.array()
      .test(
        "at-least-one-permission",
        "At least one permission must be selected",
        (modulesArray: any[] | undefined) => {
          if (!modulesArray) return false;
          return modulesArray.some((m) =>
            m.create ||
            m.edit ||
            m.view ||
            m.delete ||
            m.transfer ||
            m.export
          );
        }
      ),
  });

  const prepareInitial = () => {
    const roleName = initialValues?.role_name ?? "";
    
    // If we have modules loaded from API
    if (modules.length > 0) {
      const roleAccess =
        initialValues?.role_access && initialValues.role_access.length > 0
          ? modules.map((m) => ({
              module_id: m.module_id,
              label: m.module_name,
              ...(initialValues.role_access?.find((r: { module_id: string }) => r.module_id === m.module_id) || {}),
            }))
          : modules.map((m) => ({
              module_id: m.module_id,
              label: m.module_name,
            }));
      return { role_name: roleName, role_access: roleAccess };
    }
    
    // Fallback if no modules loaded
    return { role_name: roleName, role_access: [] };
  };

  const handleCreate = async (values: any, helpers: any) => {
    const { setSubmitting, resetForm } = helpers;
    try {
      const payload = {
        role_name: values.role_name.trim(),
        role_access: values.role_access.map((r: any) => ({
          module_id: r.module_id,
          create: !!r.create,
          edit: !!r.edit,
          view: !!r.view,
          delete: !!r.delete,
          transfer: !!r.transfer,
          export: !!r.export,
        })),
      };
      const res = await postData({ endpoint: "roles", token: cookies.t || token, instance: "identity", data: payload });
      showToastnew.success("Role Created Successfully");
      resetForm();
      onSuccess();
      return res;
    } catch (err: any) {
      console.log("msg : -", err?.error?.response?.data?.error);
      showToastnew.error(err?.error?.response?.data?.error || "Failed to save role");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (values: any, helpers: any) => {
    const { setSubmitting } = helpers;
    try {
      const payload = {
        role_name: values.role_name.trim(),
        role_access: values.role_access.map((r: any) => ({
          module_id: r.module_id,
          create: !!r.create,
          edit: !!r.edit,
          view: !!r.view,
          delete: !!r.delete,
          transfer: !!r.transfer,
          export: !!r.export,
        })),
      };
      // await patchData({
      //   endpoint: "role/updateRole",
      //   token: cookies.t || token,
      //   params: { id: initialValues?._id },
      //   data: payload,
      // });
      
      await patchData({
        endpoint: `roles/${initialValues?._id}`,
        token: cookies.t || token,
        instance: "identity",
        data: payload,
      });
      showToastnew.success("Role Saved Successfully");
      onSuccess();
    } catch (err: any) {
      showToastnew.error(err?.data?.message || "Failed to update role");
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading state while fetching modules
  if (loadingModules) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500 dark:text-gray-400">Loading modules...</div>
      </div>
    );
  }

  // Show message if no modules found
  if (modules.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No modules available</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          Please contact administrator to add modules
        </p>
      </div>
    );
  }

  return (
    <Formik
      initialValues={prepareInitial()}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async (values, helpers) => {
        if (initialValues?._id) {
          await handleEdit(values, helpers);
        } else {
          await handleCreate(values, helpers);
        }
      }}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        isSubmitting,
        setFieldValue,
        resetForm,
      }) => {
        const togglePermission = (moduleId: string, field: keyof ModuleAccess) => {
          const next = (values.role_access || []).map((m: ModuleAccess) =>
            m.module_id === moduleId ? { ...m, [field]: !m[field] } : m
          );
          setFieldValue("role_access", next);
        };

        return (
          <Form autoComplete="off" className="space-y-4">
            <div className="w-full md:w-1/2 lg:w-1/3">
              <MyInput
                label="Role Name"
                placeholder="Enter Role Name"
                name="role_name"
                value={values.role_name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.role_name ? (errors.role_name as string) : ""}
              />
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-gray-700">
                      Module
                    </th>
                    {["Create", "Edit", "View", "Delete", "Transfer", "Export"].map((label) => (
                      <th
                        key={label}
                        className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {(values.role_access || []).map((m: ModuleAccess) => (
                    <tr
                      key={m.module_id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-4 py-2.5 text-sm text-gray-900 dark:text-gray-200 font-medium sticky left-0 bg-white dark:bg-gray-900">
                        {m.label}
                      </td>

                      {(["create", "edit", "view", "delete", "transfer", "export"] as (keyof ModuleAccess)[]).map((f) => (
                        <td key={f} className="px-4 py-2.5">
                          <div className="flex items-center justify-center">
                            <PermCheckbox
                              checked={!!m[f]}
                              onToggle={() => togglePermission(m.module_id, f)}
                              ariaLabel={`${m.label} ${f}`}
                            />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {errors.role_access && (
              <p className="text-red-500 text-sm">
                {String(errors.role_access)}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <MyButton type="submit" variant="primary" isLoading={isSubmitting}>
                {initialValues?._id ? "Update Role" : "Create Role"}
              </MyButton>
              <MyButton
                type="button"
                variant="outline"
                onClick={() => resetForm()}
                disabled={isSubmitting}
              >
                Reset
              </MyButton>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default RoleForm;
