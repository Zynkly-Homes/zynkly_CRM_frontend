import axios, { AxiosInstance } from "axios";
import { attachAuthInterceptor } from "../../lib/axiosAuthInterceptor";


const identityBaseURL = (import.meta.env.VITE_IDENTITY_API_URL as string | undefined) ?? "";

if (!identityBaseURL) {
  // eslint-disable-next-line no-console
  console.warn("VITE_IDENTITY_API_URL is not set");
}

const identityInstance: AxiosInstance = axios.create({
  baseURL: identityBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

attachAuthInterceptor(identityInstance);

export default identityInstance;
