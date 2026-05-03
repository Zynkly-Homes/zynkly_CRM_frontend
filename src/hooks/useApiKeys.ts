
import { useState } from 'react';
import { apiKeysService } from '../services/apiKeys';
import { showToast } from '../atoms/MyToast';

/**
 * Local shapes used by frontend table
 */
export interface FrontendApiKey {
  apiKeyId: string;
  plainKey?: string; // plain key returned by server list (if backend returns it)
  label: string;
  businessId: string;
  scopes: string[];
  active: boolean;
  expiresAt?: string;
  usageCount?: number;
  quota?: number;
  quotaWindowDays?: number;
  createdAt?: string;
}

/**
 * Hook to manage API Keys list / create
 */
export const useApiKeys = () => {
  const [apiKeys, setApiKeys] = useState<FrontendApiKey[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // metadata for pagination (optional)
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchApiKeys = async (p = page, l = limit) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiKeysService.listApiKeys(p, l);

      // backend returns { items: [...], total, page, limit, totalPages }
      const items = Array.isArray(data?.items) ? data.items : [];

      // map to FrontendApiKey shape expected by AdvancedTable / page
      const mapped: FrontendApiKey[] = items.map((it: any) => ({
        apiKeyId: it.apiKeyId || it._id || String(it.apiKeyId || it._id || ''),
        plainKey: it.plainKey || it.plainKey === '' ? it.plainKey : it.plainKey ?? '',
        label: it.label || '',
        businessId: it.businessId || it.business || '',
        scopes: Array.isArray(it.scopes) ? it.scopes : [],
        active: typeof it.active === 'boolean' ? it.active : true,
        expiresAt: it.expiresAt ? new Date(it.expiresAt).toISOString() : undefined,
        usageCount: typeof it.usageCount === 'number' ? it.usageCount : it.usage || 0,
        quota: typeof it.quota === 'number' ? it.quota : it.limit || 0,
        quotaWindowDays: typeof it.quotaWindowDays === 'number' ? it.quotaWindowDays : it.quotaWindowDays ?? undefined,
        createdAt: it.createdAt ? new Date(it.createdAt).toISOString() : undefined,
      }));

      setApiKeys(mapped);

      // pagination metadata (if the backend sends)
      setTotal(typeof data?.total === 'number' ? data.total : mapped.length);
      setPage(typeof data?.page === 'number' ? data.page : p);
      setLimit(typeof data?.limit === 'number' ? data.limit : l);
      setTotalPages(typeof data?.totalPages === 'number' ? data.totalPages : Math.ceil((data?.total || mapped.length) / l) || 1);
      return mapped;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch API keys';
      setError(String(msg));
      showToast.error(String(msg));
      setApiKeys([]); // clear on error so table shows empty state
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createApiKey = async (payload: {
    label: string;
    businessId: string;
    scopes?: string[];
    expiresAt?: string;
    quota?: number;
    quotaWindowDays?: number;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiKeysService.createApiKey(payload);
      // server returns plainKey + apiKey metadata (as you showed)
      const plainKey = res?.plainKey ?? null;

      // If server returns created doc then we can optionally add it to current list
      const created = {
        apiKeyId: res.apiKeyId || res.apiKeyId || (res.apiKeyDoc?._id ? String(res.apiKeyDoc._id) : undefined) || '',
        plainKey: plainKey || '',
        label: res.label || (res.apiKeyDoc?.label ?? payload.label),
        businessId: res.businessId || (res.apiKeyDoc?.businessId ?? payload.businessId),
        scopes: res.scopes || (res.apiKeyDoc?.scopes ?? payload.scopes ?? []),
        active: typeof res.active === 'boolean' ? res.active : true,
        expiresAt: res.expiresAt ? new Date(res.expiresAt).toISOString() : (res.apiKeyDoc?.expiresAt ? new Date(res.apiKeyDoc.expiresAt).toISOString() : undefined),
        usageCount: typeof res.usageCount === 'number' ? res.usageCount : 0,
        quota: typeof res.quota === 'number' ? res.quota : payload.quota ?? 0,
        quotaWindowDays: typeof res.quotaWindowDays === 'number' ? res.quotaWindowDays : payload.quotaWindowDays ?? 0,
        createdAt: res.createdAt ? new Date(res.createdAt).toISOString() : undefined,
      } as FrontendApiKey;

      // Prepend the new key to the list so table shows it immediately
      setApiKeys(prev => [created, ...prev]);

      showToast.success('API key created');
      return res; // return full server response (contains plainKey)
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create API key';
      setError(String(msg));
      showToast.error(String(msg));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteApiKey = async (apiKeyId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // if you add server endpoint, call it here. For now just remove locally.
      // await apiKeysService.revokeApiKey(apiKeyId);
      setApiKeys(prev => prev.filter(k => k.apiKeyId !== apiKeyId));
      showToast.success('API key removed (local)');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete API key';
      setError(String(msg));
      showToast.error(String(msg));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    apiKeys,
    isLoading,
    error,
    page,
    limit,
    total,
    totalPages,
    fetchApiKeys,
    createApiKey,
    deleteApiKey,
    setPage,
    setLimit,
  };
};

export default useApiKeys;
