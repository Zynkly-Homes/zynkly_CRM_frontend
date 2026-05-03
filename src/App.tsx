import React from "react";
import { AppRoutes } from "./routes/AppRoutes";
import { ToastifynewToaster } from './atoms/ToastifynewToaster';
import ScrollToTop from "./atoms/ScrollToTop";


function App() {
  return (
    <div className="App">
      <AppRoutes />
      <ScrollToTop />
      <ToastifynewToaster />
    </div>
  );
}

export default App;
