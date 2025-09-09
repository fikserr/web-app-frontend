import React, { useState } from "react";
import axios from "axios";

const Card = ({ product }) => {
  const [counts, setCounts] = useState({});

  const productInCart = counts[product.id];

  // serverga update yuborish
  const updateBasket = async (product, action) => {
    console.log(action);
    
    try {
      const res = await axios.post("https://605638c33f72.ngrok-free.app/api/basket/update", {
        userId: 339299758,
        productId: product.id,
        measureId: product.measureId, // product ichida measureId bo‘lishi kerak
        action: action,
        price: product.prices[0]?.price,
      });

      if (res.data.ok) {
        setCounts((prev) => {
          const existing = prev[product.id];
          if (action === "plus") {
            return {
              ...prev,
              [product.id]: {
                ...product,
                count: existing ? existing.count + 1 : 1,
              },
            };
          } else if (action === "minus") {
            if (existing && existing.count > 1) {
              return {
                ...prev,
                [product.id]: {
                  ...product,
                  count: existing.count - 1,
                },
              };
            } else {
              const updated = { ...prev };
              delete updated[product.id];
              return updated;
            }
          }
          return prev;
        });
      }
    } catch (err) {
      console.error("Basket update error", err);
    }
  };

  return (
    <div
      key={product.id}
      className="flex flex-col content-center justify-between border rounded-lg overflow-hidden"
    >
      <div>
        <img
          src={product.imageUrl || "/src/assets/no-photo.jpg"}
          alt={product.name}
          className="w-full h-44 sm:w-44 sm:h-44 lg:w-48 lg:h-48 object-cover"
        />
        <h3 className="text-base font-semibold p-2">{product.name}</h3>
      </div>

      <div className="p-2">
        <p className="text-lg font-bold">
          {product.prices[0]?.price} {product.prices[0]?.currencyname}
        </p>

        {productInCart ? (
          <div className="flex justify-between items-center bg-[rgb(22,113,98)] text-white py-1 rounded mt-1 w-full text-xl">
            <button onClick={() => updateBasket(product, "minus")} className="px-3">
              −
            </button>
            <span>{productInCart.count}</span>
            <button onClick={() => updateBasket(product, "plus")} className="px-3">
              +
            </button>
          </div>
        ) : (
          <button
            onClick={() => updateBasket(product, "plus")}
            className=" bg-[rgb(22,113,98)] text-white py-1 rounded mt-1 w-full text-xl"
          >
            +
          </button>
        )}
      </div>
    </div>
  );
};

export default Card;
