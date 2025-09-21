import { useState, useEffect } from "react";

function useBalance(userId) {
  const [balance, setBalance] = useState("");
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

    fetch(`${API_BASE_URL}/balance?userId=${userId}`, {
      method: "GET",
      signal,
      headers: {
        Authorization: authHeader,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json(); // JSON formatda olish
      })
      .then((json) => {
        setBalance(json.data?.trim() || ""); // faqat data ni saqlaymiz
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [userId]);

  return { balance, loading, error };
}

export default useBalance;
