import { useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const USERNAME = import.meta.env.VITE_API_USERNAME;
const PASSWORD = import.meta.env.VITE_API_PASSWORD;

export default function useOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createOrder = async (orderData) => {
    setLoading(true);
    setError(null);
    console.log(orderData);
    
    try {
      const res = await axios.post(`${API_BASE_URL}/order`, orderData, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: {
          "Content-Type": "application/json",
        },
      });
      return res.data;
    } catch (err) {
      console.error("❌ useOrder error:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createOrder, loading, error };
}
