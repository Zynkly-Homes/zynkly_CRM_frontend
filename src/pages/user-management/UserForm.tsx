import React, { useMemo } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { MyInput } from "../../atoms/MyInput";
import { MyButton } from "../../atoms/MyButton";
import { MyDropdown } from "../../atoms/MyDropdown";
import { showToastnew } from "../../services/toastifynewService/toastifynewService";
import { getData, postData, patchData } from "../../services/crmServices";

// ---- Types ----

interface RoleOption { label: string; value: string }

interface RolesApiItem { _id: string; role_name: string }
interface RolesApiData { data: RolesApiItem[]; total: number }
interface RolesApiResponse { success: boolean; data: RolesApiData }

type UserFormValues = {
  name: string;
  email: string;
  mobile_no: string;
  password: string;
  role_id: string;
};

type UserFormProps = {
  token?: string;
  initialValues?: {
    _id?: string;
    name: string;
    email: string;
    mobile_no?: string;
    role_id?: string;
  };
  onSuccess: () => void;
};

// ---- Helpers ----

function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  const e = err as { error?: { response?: { data?: { message?: string } } }; message?: string };
  return e?.error?.response?.data?.message ?? e?.message ?? "Operation failed";
}

async function fetchRolesOptions(token?: string): Promise<RoleOption[]> {
  const res = await getData<RolesApiResponse>({
    endpoint: "roles",
    token,
    instance: "identity",
    params: { page: 1, limit: 100 },
  });
  return res.data.data.map((r) => ({ label: r.role_name, value: r._id }));
}

// ---- Component ----

const UserForm: React.FC<UserFormProps> = ({ token, initialValues, onSuccess }) => {
  const isEdit = !!initialValues?._id;
  const [roles, setRoles] = React.useState<RoleOption[]>([]);
  const [loadingRoles, setLoadingRoles] = React.useState(true);

  React.useEffect(() => {
    setLoadingRoles(true);
    fetchRolesOptions(token)
      .then(setRoles)
      .catch(() => showToastnew.error("Failed to load roles"))
      .finally(() => setLoadingRoles(false));
  }, [token]);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        name: Yup.string().trim().required("Name is required"),
        email: Yup.string().email("Invalid email address").required("Email is required"),
        mobile_no: Yup.string(),
        password: isEdit
          ? Yup.string()
          : Yup.string().required("Password is required").min(6, "Minimum 6 characters"),
        role_id: Yup.string().required("Role is required"),
      }),
    [isEdit]
  );

  const initialFormValues: UserFormValues = {
    name: initialValues?.name ?? "",
    email: initialValues?.email ?? "",
    mobile_no: initialValues?.mobile_no ?? "",
    password: "",
    role_id: initialValues?.role_id ?? "",
  };

  const handleSubmit = async (values: UserFormValues, { setSubmitting, resetForm }: { setSubmitting: (b: boolean) => void; resetForm: () => void }) => {
    try {
      if (isEdit) {
        await patchData({
          endpoint: `users/${initialValues!._id}`,
          token,
          instance: "identity",
          data: {
            username: values.name.trim(),
            email: values.email.toLowerCase().trim(),
            mobile_no: values.mobile_no.trim(),
            role_id: values.role_id,
          },
        });
        showToastnew.success("User updated successfully");
      } else {
        await postData({
          endpoint: "users",
          token,
          instance: "identity",
          data: {
            username: values.name.trim(),
            email: values.email.toLowerCase().trim(),
            mobile_no: values.mobile_no.trim(),
            password: values.password,
            role_id: values.role_id,
          },
        });
        showToastnew.success("User created successfully");
        resetForm();
      }
      onSuccess();
    } catch (err: unknown) {
      showToastnew.error(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialFormValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={handleSubmit}
    >
      {({ values, errors, touched, handleChange, handleBlur, isSubmitting, setFieldValue, resetForm }) => (
        <Form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MyInput
              label="Name"
              placeholder="Enter full name"
              name="name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.name ? errors.name : ""}
              required
            />

            <MyInput
              label="Email"
              type="email"
              placeholder="Enter email"
              name="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email ? errors.email : ""}
              required
              disabled={isEdit}
            />

            <MyInput
              label="Mobile No"
              placeholder="+91XXXXXXXXXX"
              name="mobile_no"
              value={values.mobile_no}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.mobile_no ? errors.mobile_no : ""}
            />

            {!isEdit && (
              <MyInput
                label="Password"
                type="password"
                placeholder="Enter password"
                name="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password ? errors.password : ""}
                required
              />
            )}

            <MyDropdown
              label="Role"
              name="role_id"
              value={values.role_id}
              options={roles}
              onChange={(value) => setFieldValue("role_id", value)}
              placeholder={loadingRoles ? "Loading roles..." : "Select Role"}
              error={touched.role_id ? errors.role_id : ""}
              disabled={loadingRoles}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <MyButton type="submit" variant="primary" isLoading={isSubmitting} disabled={loadingRoles}>
              {isEdit ? "Update User" : "Create User"}
            </MyButton>
            <MyButton type="button" variant="outline" onClick={() => resetForm()} disabled={isSubmitting}>
              Reset
            </MyButton>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default UserForm;
