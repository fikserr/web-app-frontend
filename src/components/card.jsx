import React, { useState, useEffect } from "react";
import axios from "axios";

const Card = ({ product, userId }) => {
  const [counts, setCounts] = useState({});
    const API_URL = import.meta.env.VITE_API_URL; // ✅ env-dan olyapti
  useEffect(() => {
    const fetchBasket = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/basket/${userId}`);
        if (res.data.ok) {
          const snapshot = {};
          res.data.basket.forEach(i => {
            snapshot[i.product_id] = {
              ...product,
              count: i.quantity
            };
          });
          setCounts(prev => ({ ...prev, ...snapshot }));
        }
      } catch (err) {
        console.error("Basket fetch error", err);
      }
    };

    if (userId) fetchBasket();
  }, [userId]);

  const productKey = product.Id;
  const productInCart = counts[productKey];

  // API yuboruvchi funksiya
  const apiUpdate = async (body) => {
    try {
      const res = await axios.post(`${API_URL}/api/basket/update`, body);
      return res.data;
    } catch (err) {
      console.error("API error", err.response?.data || err.message);
      throw err;
    }
  };

  // plus/minus tugmalari uchun
  const handleAction = async (action) => {
    console.log(product.measures[0]?.Id);
    
    const body = {
      user_id: String(userId),
      product_id: String(product.Id),
      measure_id: String(product.measures[0]?.Id || ""),
      action,
      price: Number(product.prices?.[0]?.price || 0),
      name: product.name, // ✅ qo‘shildi
      image: product.imageUrl || null, // ✅ qo‘shildi
    };

    try {
      const data = await apiUpdate(body);
      if (data.ok) {
        setCounts(prev => {
          const existing = prev[productKey];
          if (action === "plus") {
            return {
              ...prev,
              [productKey]: { ...product, count: existing ? existing.count + 1 : 1 }
            };
          } else {
            if (existing && existing.count > 1) {
              return { ...prev, [productKey]: { ...product, count: existing.count - 1 } };
            } else {
              const updated = { ...prev };
              delete updated[productKey];
              return updated;
            }
          }
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // input orqali aniq sonni kiritish
  const handleSetQuantity = async (value) => {
    const qty = Number(value);
    if (Number.isNaN(qty) || qty < 0) return;

    const body = {
      user_id: String(userId),
      product_id: String(product.Id),
      measure_id: String(product.measures[0]?.Id || ""),
      quantity: qty,
      price: Number(product.prices?.[0]?.price || 0),
      name: product.name, // ✅ qo‘shildi
      image: product.imageUrl || null, // ✅ qo‘shildi
    };

    try {
      const data = await apiUpdate(body);
      if (data.ok) {
        setCounts(prev => {
          const updated = { ...prev };
          if (qty <= 0) {
            delete updated[productKey];
            return updated;
          }
          updated[productKey] = { ...product, count: qty };
          return updated;
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div key={productKey} className="flex flex-col justify-between border rounded-lg overflow-hidden p-2">
      <div className="">
        <img
          src={product.imageUrl || "/src/assets/no-photo.jpg"}
          alt={product.name}
          className="w-full h-36 object-cover rounded-xl"
        />
        <h3 className="text-sm font-semibold mt-2">{product.name}</h3>
      </div>

      <div className="pt-2">
        <p className="text-xs font-bold">
          {product.prices?.[0]?.price} {product.prices?.[0]?.currencyname}
        </p>

        {productInCart ? (
          <div className="flex justify-between items-center gap-2 mt-2">
            <button onClick={() => handleAction("minus")} className="px-3 py-1 bg-[rgb(22,113,98)] rounded text-base text-white">−</button>

            <input
              type="number"
              min="0"
              value={productInCart.count}
              onChange={(e) => {
                const v = e.target.value;
                setCounts(prev => ({ ...prev, [productKey]: { ...product, count: Number(v) } }));
              }}
              onBlur={(e) => handleSetQuantity(e.target.value)}
              className="w-16 text-center border rounded py-1"
            />

            <button onClick={() => handleAction("plus")} className="px-3 py-1 bg-[rgb(22,113,98)] rounded  text-white">+</button>
          </div>
        ) : (
          <div className="flex justify-end">
            
            <button onClick={() => handleAction("plus")} className="px-3 py-1 mt-2 bg-[rgb(22,113,98)] py-1 rounded text-white">+</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
