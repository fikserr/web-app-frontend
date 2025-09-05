import { useState, useEffect } from "react";
import axios from "axios";

const useProducts = (categoryId, page = 1, pageSize = 10) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
    console.log(categoryId, page, pageSize);
    
  useEffect(() => {
    if (!categoryId) return; // kategoriya tanlanmasa hech narsa chaqirmaydi

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get("https://telegram-web-app-backend.laravel.cloud/api/products", {
          params: { categoryId, page, pageSize }, // ✅ dynamic params
        });
        setProducts(response.data);
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
