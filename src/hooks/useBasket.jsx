import { useState, useEffect } from "react";

const STORAGE_KEY = "basket_counts";

const useBasket = () => {
  const [basket, setBasket] = useState([]);

  useEffect(() => {
    const getBasket = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setBasket(Object.values(parsed)); // object → array
        } catch (e) {
          console.error("❌ Basket parse error:", e);
          setBasket([]);
        }
      } else {
        setBasket([]);
      }
    };

    getBasket();

    // localStorage o‘zgarishini kuzatish
    window.addEventListener("storage", getBasket);
    return () => window.removeEventListener("storage", getBasket);
  }, []);

  // ✅ Basketni tozalash funksiyasi
  const clearBasket = () => {
    localStorage.removeItem(STORAGE_KEY);
    setBasket([]);
  };

  // ⬅️ Shu yerda qaytarasiz
  return { basket, setBasket, clearBasket };
};

export default useBasket;
