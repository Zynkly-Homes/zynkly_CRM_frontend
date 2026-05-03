// BRE axios instance
// import axios, { AxiosInstance } from "axios";

// const BREbaseURL = import.meta.env.VITE_BRE_API_URL as string | undefined;

// if (!BREbaseURL) {
//   // eslint-disable-next-line no-console
//   console.warn("VITE_BRE_API_URL is not set");
// }

// const breinstance: AxiosInstance = axios.create({
//   baseURL: BREbaseURL ?? "",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// export default breinstance;





// //401 8-0ct
// // src/lib/breinstance.ts  (BRE axios instance)

import axios, { AxiosInstance } from "axios";
import { attachAuthInterceptor } from "../../lib/axiosAuthInterceptor";

const BREbaseURL = (import.meta.env.VITE_BRE_API_URL as string | undefined) ?? "";

if (!BREbaseURL) {
  // eslint-disable-next-line no-console
  console.warn("VITE_BRE_API_URL is not set");
}

const breinstance: AxiosInstance = axios.create({
  baseURL: BREbaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

attachAuthInterceptor(breinstance);

export default breinstance;
