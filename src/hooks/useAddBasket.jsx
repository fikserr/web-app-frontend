import { useState, useEffect } from "react";
import axios from "axios";

const useAddBasket = (userId) => {
  const [counts, setCounts] = useState({});
  const API_URL = import.meta.env.VITE_API_URL;

  // Basketni fetch qilish
  useEffect(() => {
    if (!userId) return;

    const fetchBasket = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/basket/${userId}`);
        if (res.data.ok) {
          const snapshot = {};
          res.data.basket.forEach((i) => {
            snapshot[i.product_id] = {
              measureId: i.measure_id,
              productId: i.product_id,
              count: i.quantity,
              name: i.name,
              image: i.image,
              price: i.price,
            };
          });
          setCounts(snapshot);
        }
      } catch (err) {
        console.error("Basket fetch error", err);
      }
    };

    fetchBasket();
  }, [userId]);

  const apiUpdate = async (body) => {
    const res = await axios.post(`${API_URL}/api/basket/update`, body);
    return res.data;
  };

  const updateQuantity = async (product, qty) => {
    if (!userId) return;

    const productId = product.product_id || product.productId;
    const prevCounts = { ...counts };

    setCounts((prev) => {
      const updated = { ...prev };
      if (qty <= 0) {
        delete updated[productId];
        return updated;
      }
      updated[productId] = { ...product, count: qty };
      return updated;
    });

    try {
      const body = {
        user_id: String(userId),
        product_id: String(productId),
        measure_id: product.measure_id || product.measureId,
        quantity: qty,
        price: Number(product.price || 0),
        name: product.name,
        image: product.image || null,
      };
      const data = await apiUpdate(body);
      if (!data.ok) {
        throw new Error("API error");
      }
    } catch (err) {
      console.error("Update error", err);
      setCounts(prevCounts); // rollback
    }
  };

  return { counts, updateQuantity };
};

export default useAddBasket;
