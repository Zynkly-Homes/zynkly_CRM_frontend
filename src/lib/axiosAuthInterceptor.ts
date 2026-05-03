import type { AxiosInstance, AxiosError } from "axios";

const LOGIN_PATH = "/login";

function logUnauthorize() {
  console.log("aunautorise");
}

function clearClientAuthState() {
  try {
    // remove localStorage keys actually used by your app
    localStorage.removeItem("auth_token");        // <- match TOKEN_KEY
    localStorage.removeItem("auth_user_storage"); // <- match USER_KEY
    localStorage.removeItem("countdownStartTime");

    // remove cookies: try both document.cookie & react-cookie removal on app logout
    document.cookie = "t=; Max-Age=0; path=/;";        // token cookie
    document.cookie = "auth_user=; Max-Age=0; path=/;";
    document.cookie = "uid=; Max-Age=0; path=/;";
    document.cookie = "email=; Max-Age=0; path=/;";
  } catch (e) {
    // ignore
  }
}

function redirectToLogin() {
  try {
    window.location.replace(LOGIN_PATH);
  } catch (e) {
    window.location.href = LOGIN_PATH;
  }
}

export function attachAuthInterceptor(instance: AxiosInstance) {
  instance.interceptors.response.use(
    resp => resp,
    (error: AxiosError) => {
      if (!error.response) return Promise.reject(error);

      const status = error.response.status;

      if (status === 401) {
        try {
          const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
          if (!currentPath.startsWith(LOGIN_PATH)) {
            logUnauthorize();
            clearClientAuthState();
            redirectToLogin();
          }
        } catch (e) {
          logUnauthorize();
          clearClientAuthState();
          redirectToLogin();
        }
        return Promise.reject(error);
      }

      return Promise.reject(error);
    }
  );
}
