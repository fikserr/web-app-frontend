import { useState, useEffect } from "react";
import axios from "axios";

const useBasket = (userId) => {
  const [basket, setBasket] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL; // ✅ env-dan olyapti
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchBasket = async () => {
      try {
        console.log("Fetching basket for userId:", userId);

        const response = await axios.get(
          `{API_URL}api/basket/${userId}`,
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            timeout: 10000
          }
        );

        console.log("Response data:", response.data.basket);

        if (response.data.ok) {
          setBasket(response.data.basket); // data.basket ni olish kerak
        } else {
          setError("Savatni olishda xatolik");
        }
      } catch (err) {
        console.error("Error fetching basket:", err);
        setError(err.response?.data?.message || err.message || "Server xatosi");
      } finally {
        setLoading(false);
      }
    };

    fetchBasket();
  }, [userId]);

  return { basket, loading, error, setBasket };
};

export default useBasket;