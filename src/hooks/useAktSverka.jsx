import { useState, useEffect } from "react";

function useAktSverka(userId, startDate, endDate) {
  const [akt, setAkt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const username = "Direktor";
  const password = "1122";

  useEffect(() => {
    if (!userId || !startDate || !endDate) return;

    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const signal = controller.signal;

    const authHeader = "Basic " + btoa(`${username}:${password}`);

    fetch(
      `${API_BASE_URL}/akt/sverka?userId=${userId}&startDate=${encodeURIComponent(
        startDate
      )}&endDate=${encodeURIComponent(endDate)}`,
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
        return res.json(); // JSON formatda
      })
      .then((json) => {
        setAkt(json);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [userId, startDate, endDate]);

  return { akt, loading, error };
}

export default useAktSverka;
