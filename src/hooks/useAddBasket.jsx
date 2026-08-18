import { useState, useEffect } from "react";
import { resolveDisplayPrice } from "../lib/pricing";

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
      const displayPrice = resolveDisplayPrice(product);
      updated[productId] = {
        ...product,
        productId,
        count: qty,
        price: displayPrice.price,
        oldPrice: displayPrice.oldPrice,
        currencyName: displayPrice.currency.name,
        currencyId: displayPrice.currency.id,
        name: product.name,
        image: product.imageUrl || null,
      };
      return updated;
    });
  };

  return { counts, updateQuantity };
};

export default useAddBasket;
