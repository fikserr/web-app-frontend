import { useEffect, useState } from "react";
import axios from "axios";
import { ca } from "date-fns/locale/ca";

export default function useCategories(userId, page = 1, pageSize = 10) {
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const username = "Direktor";
  const password = "1122";

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    console.log(categories);

    axios
      .get(`${API_BASE_URL}/category`, {
        params: { page, pageSize, userId },
        auth: { username, password },
      })
      .then((res) => {
        setCategories(res.data?.data || []); // faqat massiv
        setMeta(res.data?.meta || null); // meta alohida
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [userId, page, pageSize]);

  return { categories, meta, loading, error };
}
