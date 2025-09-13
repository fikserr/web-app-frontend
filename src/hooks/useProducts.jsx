import { useState, useEffect } from "react";
import axios from "axios";

const useProducts = (categoryId, page = 1, pageSize = 10) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL; // ✅ env-dan olyapti 
  useEffect(() => {
    if (!categoryId) return; // kategoriya tanlanmasa hech narsa chaqirmaydi

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/products`, {
          params: { categoryId, page, pageSize }, // ✅ dynamic params
        });
        setProducts(response.data.data || []);
      } catch (err) {
        setError(err.message || "Xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, page, pageSize]);

  return { products, loading, error };
};

export default useProducts;
