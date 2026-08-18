import { useEffect, useState, useCallback } from "react";
import api from "../lib/api";

export default function useProducts({
  page = 1,
  pageSize = 10,
  userId,
  categoryId,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registered, setRegistered] = useState(false);
  // using centralized api client

  const fetchProducts = useCallback(
    async (signal) => {
      if (!userId || !categoryId) return; // ❌ keraksiz requestni to‘xtatamiz
      setLoading(true);
      try {
        const res = await api.get(`/catalogs/products/full`, {
          params: {
            page,
            pageSize,
            sortBy: 'code',
            sortOrder: 'desc',
            search: '',
            parent: '',
            includeParents: false,
            userId,
            ids: '',
            categoriyIds: categoryId,
          },
          signal,
        });
        console.log('[Products] API Response:', res.data);
        setRegistered(res.data?.data?.registered || false);
        const productsData = res.data?.data?.content || [];
        console.log('[Products] Extracted products:', productsData);
        setProducts(productsData);
        setError(null);
      } catch (err) {
        if (err.name !== "CanceledError") {
          setError(err.message);
          console.error('[Products] Fetch error:', err);
        }
        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    [page, pageSize, userId, categoryId]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal);

    return () => controller.abort(); // ✅ eski requestni to‘xtatish
  }, [fetchProducts]);

  return { products, loading, error , registered };
}
