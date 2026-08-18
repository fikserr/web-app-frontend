import { useEffect, useState } from "react";
import api from "../lib/api";
// import { ca } from "date-fns/locale/ca";

export default function useCategories(userId, page = 1, pageSize = 10) {
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    const controller = new AbortController();
    api
      .get('/catalogs/categories/images', {
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
        },
        signal: controller.signal,
      })
      .then((res) => {
        const rows = res.data?.content || res.data?.data?.content || res.data?.items || []
        setCategories(rows)
        setMeta(res.data?.meta || res.data?.data?.meta || null)
        setLoading(false)
        setRegistered(res.data?.registered || res.data?.data?.registered || false)
      })
      .catch((err) => {
        if (err.name !== "CanceledError") {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => controller.abort();
  }, [userId, page, pageSize])

  return { categories, meta, loading, error , registered };
}
