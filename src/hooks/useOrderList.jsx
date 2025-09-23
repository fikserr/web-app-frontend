// hooks/useOrderList.js
import { useState, useEffect } from "react";

function useOrderList(userId, page = 1, pageSize = 5) {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const username = "Direktor";
  const password = "1122";

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const signal = controller.signal;

    const authHeader = "Basic " + btoa(`${username}:${password}`);

    fetch(
      `${API_BASE_URL}/order?page=${page}&pageSize=${pageSize}&userId=${userId}`,
      {
        method: "GET",
        signal,
        headers: {
          Authorization: authHeader,
        },
      }
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        setOrders(json.data || []);

        // Laravel API meta moslashtirish
        if (json.meta) {
          setMeta({
            currentPage: json.meta.current_page || 1,
            lastPage: json.meta.last_page || 1,
            total: json.meta.total || 0,
          });
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message || "Xatolik yuz berdi");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [userId, page, pageSize]);

  return { orders, meta, loading, error };
}

export default useOrderList;
