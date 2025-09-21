import React from "react"
import NoImage from "../assets/no-photo.jpg"
import { Skeleton } from "./ui/skeleton"

const Card = ({ product, productInCart, onUpdate, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col justify-between border rounded-lg overflow-hidden p-2">
        <Skeleton className="h-36 w-full rounded-xl" />
        <div>
          <Skeleton className="h-4 w-3/4 mt-2" />
          <Skeleton className="h-4 w-1/2 mt-1" />
        </div>
        <div className="pt-2">
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
    )
  }
  console.log(productInCart);
  
  return (
    <div className="flex flex-col justify-between border rounded-lg overflow-hidden p-2">
      <img
        src={product.imageUrl || NoImage}
        alt={product.name}
        className="w-full h-36 object-cover rounded-xl"
      />

      <div>
        <h3 className="text-sm font-semibold mt-2">{product.name}</h3>
      </div>

      <div className="pt-2">
        <p className="text-xs font-bold">
          {product.prices?.[0]?.price} {product.prices?.[0]?.currencyname}
        </p>

        {productInCart ? (
          <div className="flex justify-between items-center gap-2 mt-2">
            <button
              onClick={() => onUpdate(product, productInCart.count - 1)}
              className="px-3 py-1 bg-[rgb(22,113,98)] rounded text-base text-white"
            >
              −
            </button>

            <input
              type="number"
              min="0"
              value={productInCart.count}
              onChange={(e) => onUpdate(product, Number(e.target.value))}
              className="w-16 text-center border rounded py-1 dark:text-white dark:bg-gray-800"
            />

            <button
              onClick={() => onUpdate(product, productInCart.count + 1)}
              className="px-3 py-1 bg-[rgb(22,113,98)] rounded text-white"
            >
              +
            </button>
          </div>
        ) : (
          <div className="flex justify-end">
            <button
              onClick={() => onUpdate(product, 1)}
              className="px-3 py-1 mt-2 bg-[rgb(22,113,98)] rounded text-white"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Card
