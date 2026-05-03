
import { useCallback, useEffect, useState } from "react";
import { shortenerService, ShortListQuery, ShortUrlItem } from "../services/shortener";
import { showToast } from "../atoms/MyToast";

export const useShortener = () => {
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [items, setItems] = useState<ShortUrlItem[]>([]);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState<ShortListQuery>({
    q: "",
    ownerId: "",
    campaignId: "",
    active: undefined,
    from: undefined,
    to: undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    limit: 10,
  });

  const fetchShortUrls = useCallback(async (override?: Partial<ShortListQuery>) => {
    setLoading(true);
    try {
      const query = { ...filters, ...override };
      const res = await shortenerService.getShortUrls(query);
      if (Array.isArray(res as any)) {
        setItems(res as any);
        setTotal((res as any).length);
      } else {
        setItems(res.items);
        setTotal(res.total);
      }
    } catch (e: any) {
      showToast.error(e?.response?.data?.message || "Failed to load URLs");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const deleteShortUrl = useCallback(async (id: string) => {
    await shortenerService.deleteShortUrl(id);
  }, []);

  // ✅ NEW: create
  const createShortUrl = useCallback(
    async (payload: {
      destination: string;
      meta?: Record<string, any>;
      ownerId?: string;
      ttlSeconds?: number;
      preferredLength?: number;
    }, apiKey?: string) => {
      setCreating(true);
      try {
        const res = await shortenerService.createShortUrl(payload, apiKey);
        // re-fetch list after create
        await fetchShortUrls({ page: 1 });
        return res;
      } catch (e: any) {
        // bubble up with message so UI toast show kar sake
        const msg = e?.response?.data?.message || "Create failed";
        throw new Error(msg);
      } finally {
        setCreating(false);
      }
    },
    [fetchShortUrls]
  );

  const setPage = (page: number) => setFilters((f) => ({ ...f, page }));
  const setLimit = (limit: number) => setFilters((f) => ({ ...f, limit, page: 1 }));
  const setSort = (sortBy?: string, sortOrder?: "asc" | "desc") =>
    setFilters((f) => ({ ...f, sortBy, sortOrder, page: 1 }));
  const updateFilters = (patch: Partial<ShortListQuery>) =>
    setFilters((f) => ({ ...f, ...patch, page: 1 }));

  return {
    // data
    shortUrls: items,
    total,
    // loading flags
    loading,
    isLoading: creating,        // <-- ShortenerForm is using this
    // actions
    fetchShortUrls,
    deleteShortUrl,
    createShortUrl,            // <-- expose for the form
    // filters
    filters,
    updateFilters,
    setPage,
    setLimit,
    setSort,
  };
};
