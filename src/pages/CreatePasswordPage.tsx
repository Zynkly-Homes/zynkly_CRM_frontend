// import React, { useDebugValue, useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { Formik, Form as FormikForm } from "formik";
// import * as yup from "yup";
// import { MyInput } from "../atoms/MyInput";
// import { MyButton } from "../atoms/MyButton";
// import { FormGroup } from "../molecules/FormGroup";
// import { Loader } from "../atoms/Loader";
// import PasswordStrengthIndicator from "../atoms/PasswordStrengthIndicator";
// import { postData } from "../services/crmServices";
// import { Eye, EyeOff, Lock } from "lucide-react";
// import { AuthLayout } from "../../src/templates/AuthLayout";
// // import { showToast } from "../atoms/MyToast";
// // import { MyToaster } from "../atoms/MyToast";
// import { showToastnew } from "../../src/services/toastifynewService/toastifynewService";
// // import { ToastifynewToaster } from "../atoms/ToastifynewToaster";

// const validationSchema = yup.object().shape({
//   password: yup
//     .string()
//     .min(8, "Password must be at least 8 characters")
//     .matches(
//       /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
//       "Please use upper, lower, number & special char"
//     )
//     .required("Password is required"),
//   confirmPassword: yup
//     .string()
//     .oneOf([yup.ref("password"), ""], "Passwords must match")
//     .required("Confirm Password is required"),
// });

// interface CreatePasswordPageProps {
//   type: "create" | "reset";
// }

// const CreatePasswordPage: React.FC<CreatePasswordPageProps> = ({ type }) => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const params = new URLSearchParams(location.search);
//   const userId = params.get("user_id") || undefined;
//   const token = params.get("token") || undefined;
//   const expiryParam = params.get("expiry");
//   const expiry = expiryParam ? new Date(expiryParam) : null;

//   const [validLink, setValidLink] = useState<boolean | null>(null);

//   useEffect(() => {
//     if (!userId || !token || !expiry) {
//       setValidLink(false);
//       return;
//     }
//     const now = new Date();
//     setValidLink(now < expiry);
//   }, [userId, token, expiry]);

//   if (validLink === null) {
//     return (
//       <AuthLayout>
//         <div className="flex justify-center items-center h-64">
//           <Loader />
//         </div>
//       </AuthLayout>
//     );
//   }

//   return (
//     <AuthLayout>

//       {/* <ToastifynewToaster /> */}
//       <div className="w-full max-w-[460px]">
//         {validLink ? (
//           <PasswordForm
//             type={type}
//             userId={userId!}
//             token={token!}
//             expiry={expiry!}
//             navigate={navigate}
//           />
//         ) : (
//           <div className="text-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-8 shadow-sm">
//             <div className="mb-8 text-center">
//               <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
//                 Link Expired or Invalid
//               </h2>
//               <p className="text-sm text-gray-600 dark:text-gray-400">
//                 This password {type === "create" ? "creation" : "reset"} link is invalid or has expired.
//                 Please {type === "create" ? "ask the admin to resend the link" : "generate a new link"}.
//               </p>
//             </div>

//             <div className="mt-6">
//               <MyButton variant="primary" onClick={() => navigate("/auth/login")}>
//                 Back to Login
//               </MyButton>
//             </div>
//           </div>
//         )}
//       </div>
//     </AuthLayout>
//   );
// };

// type PasswordFormProps = {
//   type: "create" | "reset";
//   userId: string;
//   token: string;
//   expiry: Date;
//   navigate: ReturnType<typeof useNavigate>;
// };

// const PasswordForm: React.FC<PasswordFormProps> = ({
//   type,
//   userId,
//   token,
//   expiry,
//   navigate,
// }) => {
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirm, setShowConfirm] = useState(false);

//   const initialValues = { password: "", confirmPassword: "" };

//   // Dynamic content based on type
//   const handleSubmit = async (
//   values: typeof initialValues,
//   { setSubmitting }: any
// ) => {
//   try {
//     let endpoint: string;
//     let params: any;

//     if (type === "create") {
//       // For create password (new user)
//       endpoint = "crmAuth/createPassword";
//       params = {
//         user_id: userId,
//         expiry: expiry.toISOString(),
//         token,
//         password: values.password,
//       };
//     } else {
//       // For reset password (existing user)
//       endpoint = "crmAuth/changePassword";
//       params = {
//         id: userId,
//         password: values.password,
//       };
//     }

//     const res = await postData({
//       endpoint,
//       params,
//       data: {},
//     });

//     console.log("Full Response:", res); // Debug ke liye

//     //  FIXED: Proper condition check
//     if (res?.status === 200 || res?.data?.status === true) {
//       const successMessage = res?.data?.message || 
//         (type === "create" 
//           ? "Password created successfully..." 
//           : "Password reset successfully...");

//       console.log("Toast Message:", successMessage); // Debug ke liye

//       showToastnew.success(successMessage);
//       setTimeout(() => navigate("/auth/login"), 4000);
//     } else {
//       // Agar status 200 nahi hai ya status false hai
//       const errorMessage = res?.data?.message || `Failed to ${type} password`;
//       throw new Error(errorMessage);
//     }
//   } catch (err: any) {
//     console.error("Error:", err);
//     const msg = err?.response?.data?.message || err?.message || "Something went wrong";
//     showToastnew.error(msg);
//   } finally {
//     setSubmitting(false);
//   }
// };
//   const title = type === "create" ? "Create Password" : "Reset Password";
//   const description = type === "create"
//     ? "Enter a new password to create the password of your account. We'll ask for this password whenever you login."
//     : "Enter a new password to reset the password of your account. We'll ask for this password whenever you login.";

//   const buttonText = type === "create" ? "Create Password" : "Reset Password";

//   return (
//     <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-8 shadow-sm">
//       <div className="mb-8 text-center md:text-left">
//         <h2 className="text-3xl font-extrabold tracking-tight text-gray-700 dark:text-white mb-2">
//           {title}
//         </h2>
//         <p className="text-sm text-gray-600 dark:text-gray-400">
//           {description}
//         </p>
//       </div>

//       <div className="mt-6">
//         <Formik
//           initialValues={initialValues}
//           validationSchema={validationSchema}
//           onSubmit={handleSubmit}
//         >
//           {({ values, touched, errors, setFieldValue, isSubmitting, isValid, dirty }) => (
//             <FormikForm>
//               <FormGroup>
//                 <MyInput
//                   name="password"
//                   type={showPassword ? "text" : "password"}
//                   label="Enter Password"
//                   placeholder="Enter your password"
//                   value={values.password}
//                   onChange={(e: any) => setFieldValue("password", e.target.value)}
//                   error={touched.password ? errors.password : undefined}
//                   leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
//                   rightIcon={
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword((s) => !s)}
//                       className="focus:outline-none text-gray-400 hover:text-gray-600 transition-colors"
//                     >
//                       {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//                     </button>
//                   }
//                 />

//                 <MyInput
//                   name="confirmPassword"
//                   type={showConfirm ? "text" : "password"}
//                   label="Confirm Password"
//                   placeholder="Confirm your password"
//                   value={values.confirmPassword}
//                   onChange={(e: any) => setFieldValue("confirmPassword", e.target.value)}
//                   error={touched.confirmPassword ? errors.confirmPassword : undefined}
//                   leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
//                   rightIcon={
//                     <button
//                       type="button"
//                       onClick={() => setShowConfirm((s) => !s)}
//                       className="focus:outline-none text-gray-400 hover:text-gray-600 transition-colors"
//                     >
//                       {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//                     </button>
//                   }
//                 />

//                 {/* Password Rules Indicator */}
//                 <PasswordStrengthIndicator password={values.password} />

//                 <MyButton
//                   type="submit"
//                   className="w-full h-12 mt-6"
//                   isLoading={isSubmitting}
//                   disabled={!isValid || !dirty}
//                 >
//                   {buttonText}
//                 </MyButton>
//               </FormGroup>
//             </FormikForm>
//           )}
//         </Formik>
//       </div>
//     </div>
//   );
// };

// export default CreatePasswordPage;







import React, { useDebugValue, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Formik, Form as FormikForm } from "formik";
import * as yup from "yup";
import { MyInput } from "../atoms/MyInput";
import { MyButton } from "../atoms/MyButton";
import { FormGroup } from "../molecules/FormGroup";
import { Loader } from "../atoms/Loader";
import PasswordStrengthIndicator from "../atoms/PasswordStrengthIndicator";
import { postData } from "../services/crmServices";
import { Eye, EyeOff, Lock } from "lucide-react";
import { AuthLayout } from "../../src/templates/AuthLayout";
// import { showToast } from "../atoms/MyToast";
// import { MyToaster } from "../atoms/MyToast";
import { showToastnew } from "../../src/services/toastifynewService/toastifynewService";
// import { ToastifynewToaster } from "../atoms/ToastifynewToaster";

const validationSchema = yup.object().shape({
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
      "Please use upper, lower, number & special char"
    )
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), ""], "Passwords must match")
    .required("Confirm Password is required"),
});

interface CreatePasswordPageProps {
  type: "create" | "reset";
}

const CreatePasswordPage: React.FC<CreatePasswordPageProps> = ({ type }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const userId = params.get("user_id") || undefined;
  const token = params.get("token") || undefined;
  const expiryParam = params.get("expiry");
  const expiry = expiryParam ? new Date(expiryParam) : null;

  const [validLink, setValidLink] = useState<boolean | null>(null);

  useEffect(() => {
    if (!userId || !token || !expiry) {
      setValidLink(false);
      return;
    }
    const now = new Date();
    setValidLink(now < expiry);
  }, [userId, token, expiry]);

  if (validLink === null) {
    return (
      <AuthLayout>
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>

      {/* <ToastifynewToaster /> */}
      <div className="w-full max-w-[460px]">
        {validLink ? (
          <PasswordForm
            type={type}
            userId={userId!}
            token={token!}
            expiry={expiry!}
            navigate={navigate}
          />
        ) : (
          <div className="text-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-8 shadow-sm">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
                Link Expired or Invalid
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This password {type === "create" ? "creation" : "reset"} link is invalid or has expired.
                Please {type === "create" ? "ask the admin to resend the link" : "generate a new link"}.
              </p>
            </div>

            <div className="mt-6">
              <MyButton variant="primary" onClick={() => navigate("/auth/login")}>
                Back to Login
              </MyButton>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

type PasswordFormProps = {
  type: "create" | "reset";
  userId: string;
  token: string;
  expiry: Date;
  navigate: ReturnType<typeof useNavigate>;
};

const PasswordForm: React.FC<PasswordFormProps> = ({
  type,
  userId,
  token,
  expiry,
  navigate,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const initialValues = { password: "", confirmPassword: "" };

  // Dynamic content based on type
  // const handleSubmit = async (
  //   values: typeof initialValues,
  //   { setSubmitting }: any
  // ) => {
  //   try {
  //     let endpoint: string;
  //     let params: any;

  //     if (type === "create") {
  //       // For create password (new user)
  //       endpoint = "crmAuth/createPassword";
  //       params = {
  //         user_id: userId,
  //         expiry: expiry.toISOString(),
  //         token,
  //         password: values.password,
  //       };
  //     } else {
  //       // For reset password (existing user)
  //       endpoint = "crmAuth/changePassword";
  //       params = {
  //         id: userId,
  //         password: values.password,
  //       };
  //     }

  //     const res = await postData({
  //       endpoint,
  //       params,
  //       data: {},
  //     });

  //     console.log("Full Response:", res); // Debug ke liye

  //     //  FIXED: Proper condition check
  //     if (res?.status === 200 || res?.data?.status === true) {
  //       const successMessage = res?.data?.message ||
  //         (type === "create"
  //           ? "Password created successfully..."
  //           : "Password reset successfully...");

  //       console.log("Toast Message:", successMessage); // Debug ke liye

  //       showToastnew.success(successMessage);
  //       setTimeout(() => navigate("/auth/login"), 4000);
  //     } else {
  //       // Agar status 200 nahi hai ya status false hai
  //       const errorMessage = res?.data?.message || `Failed to ${type} password`;
  //       throw new Error(errorMessage);
  //     }
  //   } catch (err: any) {
  //     console.error("Error:", err);
  //     const msg = err?.response?.data?.message || err?.message || "Something went wrong";
  //     showToastnew.error(msg);
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };


  const handleSubmit = async (
  values: typeof initialValues,
  { setSubmitting }: any
) => {
  try {
    console.log("🚀 API Request Triggered");
    console.log("Payload:", values);

    let endpoint: string;
    let params: any;

    if (type === "create") {
      endpoint = "crmAuth/createPassword";
      params = {
        user_id: userId,
        expiry: expiry.toISOString(),
        token,
        password: values.password,
      };
    } else {
      endpoint = "crmAuth/changePassword";
      params = {
        id: userId,
        password: values.password,
      };
    }

    console.log("➡ Endpoint:", endpoint);
    console.log("➡ Params:", params);

    // debugger; // Stops execution here when devtools open

    const res = await postData({
      endpoint,
      params,
      data: {},
    });

    console.log("⬅ Full API Response:", res);
    //  debugger;

   
    

    // if (res?.status === 200  || res?.data?.status === true) {
    if (res?.data?.data?.status === true) {

      const successMessage =
        res?.data?.message ||
        (type === "create"
          ? "Password created successfully..."
          : "Password reset successfully...");

          console.log("inside");
          

      showToastnew.success(successMessage);

      console.log("⏳ Redirecting in 10 seconds...");
      setTimeout(() => navigate("/auth/login"), 10000);
    } else {
      
       console.log("res?.data?.message---",res?.data?.message);
        // setTimeout(() => navigate("/auth/login"), 10000);
      throw new Error(res?.data?.message || "Failed to process password");
      
    }

  }
   catch (err: any) {
    //  debugger;
    console.error("❌ API ERROR:", err);

    // If axios interceptor triggered a 401
    //  debugger;
    if (err?.response?.status === 401) {
      console.log("⚠️ 401 INTERCEPTOR TRIGGERED — NOT FROM THIS COMPONENT");
    }
//  debugger;
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      "Something went wrong";
//  debugger;
    showToastnew.error(msg);
  } finally {
    setSubmitting(false);
  }
};
//  debugger;
  const title = type === "create" ? "Create Password" : "Reset Password";
  const description = type === "create"
    ? "Enter a new password to create the password of your account. We'll ask for this password whenever you login."
    : "Enter a new password to reset the password of your account. We'll ask for this password whenever you login.";

  const buttonText = type === "create" ? "Create Password" : "Reset Password";

  return (
    // <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-8 shadow-sm">
    <div>
      <div className="mb-8 text-center md:text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-700 dark:text-white mb-2">
          {title}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>

      <div className="mt-6">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, touched, errors, setFieldValue, isSubmitting, isValid, dirty }) => (
            <FormikForm>
              <FormGroup>
                <MyInput
                  name="password"
                  type={showPassword ? "text" : "password"}
                  label="Enter Password"
                  placeholder="Enter your password"
                  value={values.password}
                  onChange={(e: any) => setFieldValue("password", e.target.value)}
                  error={touched.password ? errors.password : undefined}
                  leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="focus:outline-none text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  }
                />

                <MyInput
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={values.confirmPassword}
                  onChange={(e: any) => setFieldValue("confirmPassword", e.target.value)}
                  error={touched.confirmPassword ? errors.confirmPassword : undefined}
                  leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirm((s) => !s)}
                      className="focus:outline-none text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  }
                />

                {/* Password Rules Indicator */}
                <PasswordStrengthIndicator password={values.password} />

                <MyButton
                  type="submit"
                  className="w-full h-12 mt-6"
                  isLoading={isSubmitting}
                  disabled={!isValid || !dirty}
                >
                  {buttonText}
                </MyButton>
              </FormGroup>
            </FormikForm>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CreatePasswordPage;