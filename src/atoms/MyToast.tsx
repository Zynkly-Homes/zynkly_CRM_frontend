import { showToastnew } from "../services/toastifynewService/toastifynewService";

export const showToast = {
  success: (msg: string) => showToastnew.success(msg),
  error: (msg: string) => showToastnew.error(msg),
  warning: (msg: string) => showToastnew.warning(msg),
  info: (msg: string) => showToastnew.info(msg),
};

export const MyToaster = () => null;
