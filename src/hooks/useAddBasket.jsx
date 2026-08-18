import { useState, useEffect } from "react";

const STORAGE_KEY = "basket_counts";

const useAddBasket = () => {
  const [counts, setCounts] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  // counts o‘zgarsa localStorage’ga yoziladi
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
  }, [counts]);

  const updateQuantity = (product, qty) => {
    const productId = product.id; // 🔑 endi id ishlatyapmiz

    setCounts((prev) => {
      const updated = { ...prev };
      if (qty <= 0) {
        delete updated[productId];
        return updated;
      }
      updated[productId] = {
        ...product,
        productId,
        count: qty,
        price: Number(product.prices?.[0]?.price || 0),
        currencyName: product.prices?.[0]?.currency?.name || 'USD',
        name: product.name,
        image: product.imageUrl || null,
      };
      return updated;
    });
  };

  return { counts, updateQuantity };
};

export default useAddBasket;
