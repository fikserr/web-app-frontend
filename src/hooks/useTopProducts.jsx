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
        const rawProducts = res.data?.data?.content || [];
        // this endpoint doesn't return the flat "imageUrl" field the other product
        // endpoints (e.g. /catalogs/products/full) do and Card.jsx reads — normalize
        // whichever shape it actually sends (imagesUrl, or an images[] array) into that
        // same field so Card renders the photo instead of falling back to the placeholder
        const productsData = rawProducts.map((item) => ({
          ...item,
          imageUrl:
            item.imageUrl ||
            item.imagesUrl ||
            (Array.isArray(item.images) && (item.images[0]?.url || item.images[0])) ||
            null,
        }));
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
