import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { postData } from "../services/crmServices";
import { showToastnew } from "../../src/services/toastifynewService/toastifynewService";

import { useDispatch } from "react-redux";
import { setUserData, clearUserData } from "../store/slices/userSlice";

// ✅ NEW IMPORT (ADD KIYA)
import { setAccessData, clearAccessData } from "../store/slices/accessSlice";

// -------- Types --------
type User = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
} | null;

type LoginBody = {
  email?: string;
  mobile?: string;
  password: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User;
  token: string | null;
  login: (body: LoginBody) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const USER_KEY = "auth_user_storage";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const [cookies, setCookie, removeCookie] = useCookies(["t", "auth_user"]);

  const dispatch = useDispatch();

  const [token, setToken] = useState<string | null>(
    () => (cookies?.t ? String(cookies.t) : null)
  );

  const [user, setUser] = useState<User>(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const cookieTok = cookies?.t ? String(cookies.t) : null;
    if (cookieTok !== token) {
      setToken(cookieTok);
    }
  }, [cookies?.t]);

  // ================= LOGIN =================
  const login = useCallback(
    async ({ email, mobile, password }: LoginBody) => {
      setIsLoading(true);
      try {
        const { data: resultData } = await postData<any>({
          endpoint: "admin/login",

          data: {
            email: email ? email.toLowerCase() : undefined,
            mobile,
            password,
          },

          params: {},
          instance: "crm",
        });

        if (!resultData?.token) {
          throw new Error(resultData?.message || "Login failed");
        }

        const tok = resultData.token;

        // ✅ SAVE TOKEN
        setCookie("t", tok, {
          path: "/",
          sameSite: "lax",
        });

        setToken(tok);

        // ================= OLD CODE (KEEPED) =================
        const userData = {
          email: email || "",
          role: "admin",
        };

        setUser(userData);
        localStorage.setItem("auth_user_storage", JSON.stringify(userData));

        dispatch(
          setUserData({
            token: tok,
            user_name: email,
            role_id: "admin",
          })
        );
        // ====================================================

        // ================= NEW UPDATED LOGIC 🔥 =================
        const userFromAPI = resultData.data;

        // overwrite local user (better data)
        setUser(userFromAPI);
        localStorage.setItem(
          "auth_user_storage",
          JSON.stringify(userFromAPI)
        );

        // ✅ Redux user (correct data)
        dispatch(
          setUserData({
            token: tok,
            user_id: userFromAPI.id,
            user_name: userFromAPI.name,
            user_email: userFromAPI.email,
            role_name: userFromAPI.role,
            role_id: userFromAPI.role_id,
          })
        );

        // ✅ 🔥 ACCESS STORE
        const accessOutput = userFromAPI.role_access.reduce(
          (acc: any, curr: any) => {
            const key = curr.module_id.toLowerCase();

            acc[key] = {
              create: curr.create,
              edit: curr.edit,
              view: curr.view,
              delete: curr.delete,
              export: curr.export,
              transfer: curr.transfer,
            };

            return acc;
          },
          {}
        );

        dispatch(setAccessData(accessOutput));
        // =======================================================

        showToastnew.success(resultData?.message || "Login successful");

        // 🔥 UPDATED REDIRECT
        navigate("/", { replace: true });

      } catch (err: any) {
        const msg =
          err?.error?.response?.data?.message ||
          err?.message ||
          "Login failed";

        showToastnew.error(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setCookie, dispatch, navigate]
  );

  // ================= LOGOUT =================
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentToken = cookies?.t ? String(cookies.t) : null;

      if (currentToken) {
        try {
          await postData<any>({
            endpoint: "crmAuth/logout",
            data: null,
            params: {},
            instance: "crm",
            headers: {
              Authorization: `Bearer ${currentToken}`,
            },
          });
        } catch (err) {
          console.log("Logout API failed, continuing...");
        }
      }
    } finally {
      localStorage.removeItem(USER_KEY);
      setUser(null);

      // ✅ CLEAR REDUX
      dispatch(clearUserData());
      dispatch(clearAccessData());

      removeCookie("t", { path: "/" });
      removeCookie("auth_user", { path: "/" });

      setToken(null);
      setIsLoading(false);

      navigate("/login", { replace: true });
    }
  }, [navigate, removeCookie, dispatch, cookies?.t]);

  const getEffectiveToken = () => {
    return cookies?.t ? String(cookies.t) : null;
  };

  const value = useMemo<AuthContextType>(
    () => ({
      isAuthenticated: !!getEffectiveToken(),
      isLoading,
      user,
      token: getEffectiveToken(),
      login,
      logout,
    }),
    [isLoading, user, login, logout, cookies?.t]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
};