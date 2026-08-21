import { useEffect, useState, useCallback } from "react";
import api from "../lib/api";

export default function useTopProducts({ userId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registered, setRegistered] = useState(false);

  const fetchTopProducts = useCallback(
    async (signal) => {
      if (!userId) return;
      setLoading(true);
      try {
        const res = await api.get(`/catalogs/topProducts`, {
          params: { userId },
          signal,
        });
        console.log('[TopProducts] API Response:', res.data);
        setRegistered(res.data?.data?.registered || false);
        const productsData = res.data?.data?.content || [];
        setProducts(productsData);
        setError(null);
      } catch (err) {
        if (err.name !== "CanceledError") {
          setError(err.message);
          console.error('[TopProducts] Fetch error:', err);
        }
        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchTopProducts(controller.signal);

    return () => controller.abort();
  }, [fetchTopProducts]);

  return { products, loading, error, registered };
}
