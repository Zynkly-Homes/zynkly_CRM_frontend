import type { AxiosInstance, AxiosRequestConfig } from "axios";
import breinstance from "./breinstance";
import crminstance from "./axios";
import identityInstance from "./identityinstance";

/** Which backend to call */
export type InstanceKey = "bre" | "crm" | "identity" | undefined;

/** Common request options */
export interface RequestOptions<TBody = unknown, TParams = Record<string, unknown>> {
  endpoint: string;
  data?: TBody;
  params?: TParams;
  token?: string;
  instance?: InstanceKey;
  extraHeaders?: Record<string, string>;
   signal?: AbortSignal;
}

/** Legacy shape used by some callers */
export interface WrappedResult<T> {
  data: T;
  isLoading: false;
}

function resolveInstance(key?: InstanceKey): AxiosInstance {
  if (key === "bre") return breinstance;
  if (key === "identity") return identityInstance;
  // default to crm
  return crminstance;
}

function authHeader(token?: string) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** POST JSON, returns { data, isLoading:false } (kept for compatibility) */
export async function postData<T = any>(opts: RequestOptions): Promise<WrappedResult<T>> {
  const { endpoint, data, params, token, instance, extraHeaders } = opts;
  try {
    const api = resolveInstance(instance);
    const res = await api.post<T>(endpoint, data ?? {}, {
      params,
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
        ...(extraHeaders ?? {}),
      },
    });
    return { data: res.data, isLoading: false };
  } catch (error) {
    // keep previous throw shape
    // eslint-disable-next-line no-console
    console.error("Error posting data:", error);
    throw { error, isLoading: false };
  }
}

/** POST multipart/form-data, returns { data, isLoading:false } */
export async function postFormData<T = any>(opts: RequestOptions<FormData>): Promise<WrappedResult<T>> {
  const { endpoint, data, params, token, instance } = opts;
  try {
    const api = resolveInstance(instance);
    const res = await api.post<T>(endpoint, data ?? new FormData(), {
      params,
      headers: {
        "Content-Type": "multipart/form-data",
        ...authHeader(token),
      },
    });
    return { data: res.data, isLoading: false };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error posting form data:", error);
    throw { error, isLoading: false };
  }
}

/**
 * POST request that expects binary response (Blob/ArrayBuffer).
 * Note: your old JS had headers inside the body—fixed here.
 */
export async function postBinaryData(
  opts: Omit<RequestOptions, "data"> & { responseType?: "blob" | "arraybuffer" }
): Promise<Blob | ArrayBuffer | null> {
  const { endpoint, params, token, instance, extraHeaders, responseType = "blob" } = opts;

  try {
    const api = resolveInstance(instance);
    const config: AxiosRequestConfig = {
      params,
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
        ...(extraHeaders ?? {}),
      },
      responseType,
    };
    const res = await api.post(endpoint, null, config);
    return res?.data ?? null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching binary data:", error);
    return null;
  }
}

/** DELETE JSON, returns { data, isLoading:false } */
export async function deleteData<T = any>(opts: RequestOptions): Promise<WrappedResult<T>> {
  const { endpoint, params, token, instance } = opts;
  try {
    const api = resolveInstance(instance);
    const res = await api.delete<T>(endpoint, {
      params,
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
      },
    });
    return { data: res.data, isLoading: false };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error deleting data:", error);
    throw { error, isLoading: false };
  }
}

/** PATCH JSON, returns backend payload directly (compat) */
export async function patchData<T = any>(opts: RequestOptions): Promise<T> {
  const { endpoint, data, params, token, instance } = opts;
  try {
    const api = resolveInstance(instance);
    const res = await api.patch<T>(endpoint, data ?? {}, {
      params,
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
      },
    });
    return res.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error patching data:", error);
    throw error;
  }
}

/** PUT JSON, returns backend payload directly (compat) */
export async function putData<T = any>(opts: RequestOptions): Promise<T> {
  const { endpoint, data, params, token, instance } = opts;
  try {
    const api = resolveInstance(instance);
    const res = await api.put<T>(endpoint, data ?? {}, {
      params,
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
      },
    });
    return res.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error putting data:", error);
    throw error;
  }
}

/** PATCH multipart/form-data, returns backend payload directly (compat) */
export async function patchFormData<T = any>(opts: RequestOptions<FormData>): Promise<T> {
  const { endpoint, data, params, token, instance } = opts;
  try {
    const api = resolveInstance(instance);
    const res = await api.patch<T>(endpoint, data ?? new FormData(), {
      params,
      headers: {
        "Content-Type": "multipart/form-data",
        ...authHeader(token),
      },
    });
    return res.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error patching form data:", error);
    throw error;
  }
}

/** GET JSON, returns backend payload directly (compat) */
export async function getData<T = any>(opts: Omit<RequestOptions, "data">): Promise<T> {
  const { endpoint, params, token, instance,signal } = opts;
  const api = resolveInstance(instance);

  try {
    const res = await api.get<T>(endpoint, {
      params,
      signal,
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
      },
      
    });
    return res.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error getting data:", error);
    throw error;
  }
}

// re-export upload helpers for same import path compatibility
export * from "./upload";
