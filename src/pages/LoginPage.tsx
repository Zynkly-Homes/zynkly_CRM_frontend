// //17-10-2025 needs() otp wala kr rahe ok
// import React, { useEffect, useState } from "react";
// import { AuthLayout } from "../templates/AuthLayout";
// import { LoginForm } from "../organisms/LoginForm";
// import { OTPForm } from "../organisms/OTPForm";
// import { useAuth } from "../hooks/useAuth";

// export const LoginPage: React.FC = () => {
//   const { needsOTP, clearNeedsOTP } = useAuth(); // NEW: use clearNeedsOTP
//   const [showOTP, setShowOTP] = useState(false);
//   const [email, setEmail] = useState("");
//   const [userId, setUserId] = useState("");

//   // NEW: clear any stale OTP state when the LoginPage mounts
//   // Reason: If needsOTP was set earlier and user navigates back to /login,
//   // we don't want OTP form to show unless it's a fresh login attempt.
//   useEffect(() => {
//     clearNeedsOTP();
//   }, [clearNeedsOTP]);

//   useEffect(() => {
//     if (needsOTP?.email && needsOTP?.user_id) {
//       setEmail(needsOTP.email);
//       setUserId(needsOTP.user_id);
//       setShowOTP(true);
//     } else {
//       setShowOTP(false);
//       setEmail("");
//       setUserId("");
//     }
//   }, [needsOTP]);

//   const handleBack = () => {
//     // NEW: ensure OTP state is cleared when user hits back from OTP form
//     clearNeedsOTP();
//     setShowOTP(false);
//     setEmail("");
//     setUserId("");
//   };

//   return (
//     <AuthLayout>
//       <>
//         {showOTP ? <OTPForm email={email} userId={userId} onBack={handleBack} /> : <LoginForm />}
//       </>
//     </AuthLayout>
//   );
// };

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AuthLayout } from "../templates/AuthLayout";
import { LoginForm } from "../organisms/LoginForm";
import { clearApiKey } from "../store/slices/apiKeySlice";

export const LoginPage: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearApiKey());
  }, [dispatch]);

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
};