import React, { useState } from "react";

const Card = ({ product }) => {
  const [counts, setCounts] = useState({});
  const productInCart = counts[product.id];
  const handleAdd = (product) => {
    setCounts((prev) => {
      const existing = prev[product.id];
      return {
        ...prev,
        [product.id]: {
          ...product,
          count: existing ? existing.count + 1 : 1,
        },
      };
    });
  };

  // Basketdan kamaytirish
  const handleRemove = (productId) => {
    setCounts((prev) => {
      const updated = { ...prev };
      if (updated[productId].count > 1) {
        updated[productId].count -= 1;
      } else {
        delete updated[productId];
      }
      return updated;
    });
  };
  return (
    <div
      key={product.id}
      className="flex flex-col content-center justify-between border rounded-lg overflow-hidden"
    >
      <div className="">
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
            <button onClick={() => handleRemove(product.id)} className="px-3">
              −
            </button>
            <span>{productInCart.count}</span>
            <button onClick={() => handleAdd(product)} className="px-3">
              +
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleAdd(product)}
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
