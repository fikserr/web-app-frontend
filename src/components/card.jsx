import React, { useState, useEffect } from "react"
import axios from "axios"
import { Skeleton } from "./ui/skeleton"

const Card = ({ product, userId, loading }) => {
  const [counts, setCounts] = useState({})
  const API_URL = import.meta.env.VITE_API_URL

  const productKey = product.Id
  const productInCart = counts[productKey]

  // Basketni bir marta fetch qilish
  useEffect(() => {
    const fetchBasket = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/basket/${userId}`)
        if (res.data.ok) {
          const snapshot = {}
          res.data.basket.forEach(i => {
            snapshot[i.product_id] = {
              ...product,
              count: i.quantity,
            }
          })
          setCounts(prev => ({ ...prev, ...snapshot }))
        }
      } catch (err) {
        console.error("Basket fetch error", err)
      }
    }

    if (userId) fetchBasket()
  }, [userId])

  // Laravel Echo listener (real-time yangilanish uchun)

  const apiUpdate = async body => {
    try {
      const res = await axios.post(`${API_URL}/api/basket/update`, body)
      return res.data
    } catch (err) {
      console.error("API error", err.response?.data || err.message)
      throw err
    }
  }

  const handleAction = async action => {
    const body = {
      user_id: String(userId),
      product_id: String(product.Id),
      measure_id: String(product.measures[0]?.Id || ""),
      action,
      price: Number(product.prices?.[0]?.price || 0),
      name: product.name,
      image: product.imageUrl || null,
    }

    try {
      const data = await apiUpdate(body)
      if (data.ok) {
        setCounts(prev => {
          const existing = prev[productKey]
          if (action === "plus") {
            return {
              ...prev,
              [productKey]: {
                ...product,
                count: existing ? existing.count + 1 : 1,
              },
            }
          } else {
            if (existing && existing.count > 1) {
              return {
                ...prev,
                [productKey]: { ...product, count: existing.count - 1 },
              }
            } else {
              const updated = { ...prev }
              delete updated[productKey]
              return updated
            }
          }
        })
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSetQuantity = async value => {
    const qty = Number(value)
    if (Number.isNaN(qty) || qty < 0) return

    const body = {
      user_id: String(userId),
      product_id: String(product.Id),
      measure_id: String(product.measures[0]?.Id || ""),
      quantity: qty,
      price: Number(product.prices?.[0]?.price || 0),
      name: product.name,
      image: product.imageUrl || null,
    }

    try {
      const data = await apiUpdate(body)
      if (data.ok) {
        setCounts(prev => {
          const updated = { ...prev }
          if (qty <= 0) {
            delete updated[productKey]
            return updated
          }
          updated[productKey] = { ...product, count: qty }
          return updated
        })
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div
      key={productKey}
      className="flex flex-col justify-between border rounded-lg overflow-hidden p-2"
    >
      {loading ? (
        <Skeleton className="h-[125px] w-[250px] rounded-xl" />
      ) : (
        <img
          src={product.imageUrl || "../assets/no-photo.jpg"}
          alt={product.name}
          className="w-full h-36 object-cover rounded-xl"
        />
      )}

      <div>
        {loading ? (
          <>
            <Skeleton className="h-4 w-3/4 mt-2" />
            <Skeleton className="h-4 w-1/2 mt-1" />
          </>
        ) : (
          <h3 className="text-sm font-semibold mt-2">{product.name}</h3>
        )}
      </div>

      <div className="pt-2">
        {loading ? (
          <Skeleton className="h-4 w-1/3" />
        ) : (
          <p className="text-xs font-bold">
            {product.prices?.[0]?.price} {product.prices?.[0]?.currencyname}
          </p>
        )}

        {!loading &&
          (productInCart ? (
            <div className="flex justify-between items-center gap-2 mt-2">
              <button
                onClick={() => handleAction("minus")}
                className="px-3 py-1 bg-[rgb(22,113,98)] rounded text-base text-white"
              >
                −
              </button>

              <input
                type="number"
                min="0"
                value={productInCart.count}
                onChange={e => {
                  const v = e.target.value
                  setCounts(prev => ({
                    ...prev,
                    [productKey]: { ...product, count: Number(v) },
                  }))
                }}
                onBlur={e => handleSetQuantity(e.target.value)}
                className="w-16 text-center border rounded py-1"
              />

              <button
                onClick={() => handleAction("plus")}
                className="px-3 py-1 bg-[rgb(22,113,98)] rounded text-white"
              >
                +
              </button>
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                onClick={() => handleAction("plus")}
                className="px-3 py-1 mt-2 bg-[rgb(22,113,98)] rounded text-white"
              >
                +
              </button>
            </div>
          ))}
      </div>
    </div>
  )
}

export default Card
