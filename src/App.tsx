import React from "react";
import { AppRoutes } from "./routes/AppRoutes";
import { ToastifynewToaster } from './atoms/ToastifynewToaster';
import ScrollToTop from "./atoms/ScrollToTop";
import ApiKeyModal from "./atoms/ApiKeyModal";

function App() {
  return (
    <div className="App">
      <AppRoutes />
      <ScrollToTop />
      <ToastifynewToaster />
      <ApiKeyModal />
    </div>
  );
}

export default App;
