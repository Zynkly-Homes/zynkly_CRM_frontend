import React from "react";
import { createPortal } from "react-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const ToastifynewToaster: React.FC = () =>
  createPortal(
    <ToastContainer
      position="top-right"
      autoClose={4000}
      hideProgressBar
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss={false}
      draggable
      pauseOnHover
      style={{ zIndex: 999999 }}
    />,
    document.body,
  ) as React.ReactElement;
