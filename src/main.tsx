import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CookiesProvider } from "react-cookie";
import { Provider } from "react-redux";

import App from "./App";
import { store } from "./store";
import { AuthProvider } from "./context/AuthContext";
import Errorboundary from "./services/errorBoundarry";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
    <BrowserRouter>
      <CookiesProvider>
        <Provider store={store}>
          <Errorboundary fallback="Something Went Wrong">
            <AuthProvider>
              <App />
            </AuthProvider>
          </Errorboundary>
        </Provider>
      </CookiesProvider>
    </BrowserRouter>
  // </React.StrictMode>
);