import { useEffect, useState } from "react";
import axios from "axios";

export default function useCategories(page = 1, pageSize = 10) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL; // ✅ env-dan olyapti
  console.log(API_URL);
  
  useEffect(() => {
    setLoading(true);
    axios
      .get(`https://771950ba5357.ngrok-free.app/api/categories`, {
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
