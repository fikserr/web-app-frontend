import { useState, useEffect } from "react"
import axios from "axios"

const useAddBasket = (userId) => {
  const [counts, setCounts] = useState({})
  const API_URL = import.meta.env.VITE_API_URL

  // Basketni fetch qilish
  useEffect(() => {
    if (!userId) return

    const fetchBasket = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/basket/${userId}`)
        if (res.data.ok) {
          const snapshot = {}
          res.data.basket.forEach(i => {
            snapshot[i.product_id] = {
              measureId: i.measure_id,
              productId: i.product_id,
              count: i.quantity,
              name: i.name,
              image: i.image,
              price: i.price,
            }
          })
          setCounts(snapshot)
        }
      } catch (err) {
        console.error("Basket fetch error", err)
      }
    }

    fetchBasket()
  }, [userId])

  const apiUpdate = async (body) => {
    const res = await axios.post(`${API_URL}/api/basket/update`, body)
    return res.data
  }

  const updateQuantity = async (product, qty) => {
    if (!userId) return

    const productId = product.Id
    const prevCounts = { ...counts } // rollback uchun eski qiymatni saqlab qo‘yamiz

    // ✅ Optimistic update: UI darhol yangilanadi
    setCounts(prev => {
      const updated = { ...prev }
      if (qty <= 0) {
        delete updated[productId]
        return updated
      }
      updated[productId] = { ...product, count: qty }
      return updated
    })

    // 🔄 API chaqirish
    try {
      const body = {
        user_id: String(userId),
        product_id: String(productId),
        measure_id: String(product.measures?.[0]?.Id),
        quantity: qty,
        price: Number(product.prices?.[0]?.price || 0),
        name: product.name,
        image: product.imageUrl || null,
      }
      const data = await apiUpdate(body)
      if (!data.ok) {
        throw new Error("API error")
      }
    } catch (err) {
      console.error("Update error", err)
      // ❌ API xato bo‘lsa rollback qilamiz
      setCounts(prevCounts)
    }
  }

  return { counts, updateQuantity }
}

export default useAddBasket
