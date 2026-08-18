import { useState, useEffect } from "react";
import api from "../lib/api";

function useBalance(userId) {
  const [balance, setBalance] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const signal = controller.signal;

    api
      .get(`/balance`, { params: { userId }, signal })
      .then((res) => setBalance(res.data?.data?.trim() || ""))
      .catch((err) => {
        if (err.name !== "CanceledError") setError(err);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [userId]);

  return { balance, loading, error };
}

export default useBalance;
