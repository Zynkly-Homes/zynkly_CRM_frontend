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