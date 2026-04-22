import { useEffect, useState, useCallback } from "react";
import axios from "axios";

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
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // 🔑 Login parolni .env dan olamiz
  const USERNAME = import.meta.env.VITE_API_USERNAME;
  const PASSWORD = import.meta.env.VITE_API_PASSWORD;

  const fetchProducts = useCallback(
    async (signal) => {
      if (!userId || !categoryId) return; // ❌ keraksiz requestni to‘xtatamiz
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/product`, {
          params: { page, pageSize, userId, categoryId },
          signal,
          auth: {
            username: USERNAME,
            password: PASSWORD,
          },
        });
        setRegistered(res.data?.registered || false);
        setProducts(res.data?.data || []);
        setError(null);
      } catch (err) {
        if (err.name !== "CanceledError") {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    },
    [API_BASE_URL, USERNAME, PASSWORD, page, pageSize, userId, categoryId]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal);

    return () => controller.abort(); // ✅ eski requestni to‘xtatish
  }, [fetchProducts]);

  return { products, loading, error , registered };
}
