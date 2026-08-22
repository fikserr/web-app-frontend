import { useEffect, useState } from 'react'
import { getUserId } from '../lib/auth'

// getUserId() reads live from Telegram's WebApp SDK (initDataUnsafe.user.id), which can
// take a little time — sometimes over a second — to populate after the SDK script itself
// has loaded, especially on a cold app open. Pages that called getUserId() directly at
// render time got stuck on that first null: since the value was never held in React
// state, nothing re-rendered them once Telegram's data actually arrived, so their
// userId-gated fetches (categories, products, orders, ...) never fired until something
// else (typically a manual page reload, which re-mounts everything) happened to run them
// again. This hook polls until a userId shows up and holds it in state, so consumers
// reactively re-render — and their effects re-fetch — the moment it becomes available.
export default function useTelegramUserId() {
  const [userId, setUserId] = useState(() => getUserId())

  useEffect(() => {
    if (userId) return

    let cancelled = false
    let attempts = 0
    const maxAttempts = 50 // ~50 * 200ms = 10s

    const timer = setInterval(() => {
      if (cancelled) return
      attempts++

      const id = getUserId()
      if (id) {
        setUserId(id)
        clearInterval(timer)
        return
      }

      if (attempts >= maxAttempts) {
        clearInterval(timer)
      }
    }, 200)

    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [userId])

  return userId
}
