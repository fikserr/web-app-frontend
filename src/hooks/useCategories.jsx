import { useEffect, useState } from "react";
import axios from "axios";

export default function useCategories(page = 1, pageSize = 10) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`https://telegram-web-app-backend.laravel.cloud/api/categories`, {
        params: { page, pageSize },
      })
      .then((res) => {
        setCategories(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [page, pageSize]);

  return { categories, loading, error };
}
