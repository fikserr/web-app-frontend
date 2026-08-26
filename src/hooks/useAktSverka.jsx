import { useState, useEffect } from "react";
import api from "../lib/api";
import { getContractorId } from "../lib/auth";

function useAktSverka(userId, startDate, endDate) {
  const [akt, setAkt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registered, setRegistered] = useState(false);


  useEffect(() => {
    if (!userId || !startDate || !endDate) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const signal = controller.signal;

    const contractorId = getContractorId();

    api
      .get(`/aktSverka`, {
        params: { userId, startDate, endDate, contractorId: contractorId || undefined },
        signal,
      })
      .then((res) => {
        setAkt(res.data);
        setRegistered(res.data?.registered || res.data?.data?.registered || false);
      })
      .catch((err) => {
        if (err.name !== "CanceledError") setError(err);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [userId, startDate, endDate]);

  return { akt, loading, error, registered };
}

export default useAktSverka;
