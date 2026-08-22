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
        // shown to the customer everywhere in the basket UI — always UZS
        price: displayPrice.price,
        oldPrice: displayPrice.oldPrice,
        currencyName: displayPrice.currency.name,
        currencyId: displayPrice.currency.id,
        // what actually gets submitted in the order payload — for a USD-only product
        // this is the real USD price + currency.id, not the UZS number shown above (see
        // lib/pricing.js: an empty/fabricated currency.id gets rejected by the backend)
        orderPrice: displayPrice.order.price,
        orderOldPrice: displayPrice.order.oldPrice,
        orderCurrencyName: displayPrice.order.currency.name,
        orderCurrencyId: displayPrice.order.currency.id,
        name: product.name,
        image: product.imageUrl || null,
      };
      return updated;
    });
  };

  return { counts, updateQuantity };
};

export default useAddBasket;
