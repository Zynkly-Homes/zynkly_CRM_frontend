import type { AxiosInstance, AxiosError } from "axios";
import { store } from "../store";
import { clearUserData } from "../store/slices/userSlice";
import { clearAccessData } from "../store/slices/accessSlice";
import { clearApiKey } from "../store/slices/apiKeySlice";

const LOGIN_PATH = "/login";

export function clearClientAuthState() {
  try {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user_storage");
    localStorage.removeItem("countdownStartTime");
    document.cookie = "t=; Max-Age=0; path=/;";
    document.cookie = "auth_user=; Max-Age=0; path=/;";
    document.cookie = "uid=; Max-Age=0; path=/;";
    document.cookie = "email=; Max-Age=0; path=/;";
  } catch {
    // ignore DOM errors
  }
}

export function clearReduxAuthState() {
  store.dispatch(clearUserData());
  store.dispatch(clearAccessData());
  store.dispatch(clearApiKey());
}

export function redirectToLogin() {
  try {
    window.location.replace(LOGIN_PATH);
  } catch {
    window.location.href = LOGIN_PATH;
  }
}

export function attachAuthInterceptor(instance: AxiosInstance) {
  instance.interceptors.response.use(
    (resp) => resp,
    (error: AxiosError) => {
      if (!error.response) return Promise.reject(error);

      if (error.response.status === 401) {
        const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
        if (!currentPath.startsWith(LOGIN_PATH)) {
          clearClientAuthState();
          clearReduxAuthState();
          redirectToLogin();
        }
      }

      return Promise.reject(error);
    }
  );
}
