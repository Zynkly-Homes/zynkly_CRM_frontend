import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { postData } from "../../../services/crmServices";
import { STORAGE_KEYS, COOKIE_KEYS } from "../constants";

interface UseAuthReturn {
  showLogoutModal: boolean;
  handleLogoutClick: () => void;
  handleCancelLogout: () => void;
  handleLogout: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const navigate = useNavigate();
  const [cookies, , removeCookie] = useCookies([...COOKIE_KEYS]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = useCallback(() => setShowLogoutModal(true), []);
  const handleCancelLogout = useCallback(() => setShowLogoutModal(false), []);

  const handleLogout = useCallback(async () => {
    try {
      const token = cookies?.t ? String(cookies.t) : null;
      if (token) await postData<any>({ endpoint: "crmAuth/logout", token });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Clear all local storage keys
      Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));

      // Clear all cookies
      COOKIE_KEYS.forEach((key) => removeCookie(key, { path: "/" }));

      setShowLogoutModal(false);
      navigate("/login", { replace: true });
    }
  }, [navigate, removeCookie, cookies?.t]);

  return {
    showLogoutModal,
    handleLogoutClick,
    handleCancelLogout,
    handleLogout,
  };
};