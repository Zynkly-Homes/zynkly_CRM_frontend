import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { CookiesProvider } from "react-cookie";
import { Provider } from "react-redux";

import App from "./App";
import { store } from "./store";
import { AuthProvider } from "./context/AuthContext";
import Errorboundary from "./services/errorBoundarry";
import "./index.css";

// ── PWA Service Worker registration ────────────────────────────────────────
// Only registered in production builds (Vite sets import.meta.env.PROD).
// In development the SW is skipped so HMR works normally.
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        // Check for SW updates every 60 minutes
        setInterval(() => reg.update(), 60 * 60 * 1000);
      })
      .catch((err) => console.warn("[SW] registration failed:", err));
  });
}


// Define your routes (simple wrapper for now, can be expanded)
const router = createBrowserRouter([
  {
    path: "*",
    element: (
      <CookiesProvider>
        <Provider store={store}>
          <Errorboundary fallback="Something Went Wrong">
            <AuthProvider>
              <App />
            </AuthProvider>
          </Errorboundary>
        </Provider>
      </CookiesProvider>
    ),
  },
]);

createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  <RouterProvider router={router} />
  // </React.StrictMode>
);