import React from 'react'
import { createRoot } from 'react-dom/client'
import Root from './router'
import './index.css'
import { loginViaTelegram, scheduleTokenRefreshForExistingToken } from './lib/api'
import { fetchAppConfig } from './lib/appConfig'

// Telegram WebApp tayyor bo'lishini va userId mavjudligini kutish — userId hech qachon
// localStorage'ga saqlanmaydi, faqat Telegramning o'zidan olinadi (device/hacked localStorage
// orqali boshqa foydalanuvchi nomidan kirib bo'lmasligi uchun)
function waitForTelegramUserId(maxAttempts = 10, delayMs = 100) {
  return new Promise((resolve) => {
    let attempts = 0

    function check() {
      attempts++
      const tg = window?.Telegram?.WebApp
      const userId = tg?.initDataUnsafe?.user?.id

      if (userId) {
        console.log('[Boot] Telegram userId topildi:', userId, 'urinish:', attempts)
        resolve(String(userId))
        return
      }

      if (attempts >= maxAttempts) {
        console.warn('[Boot] Telegram userId topilmadi')
        resolve(null)
        return
      }

      setTimeout(check, delayMs)
    }

    check()
  })
}

async function boot() {
  try {
    // Telegram WebApp'ni birinchi bo'lib tayyorlash
    if (window?.Telegram?.WebApp) {
      window.Telegram.WebApp.ready()
      window.Telegram.WebApp.expand()
    }

    const existingToken = localStorage.getItem('token')

    if (existingToken) {
      console.log('[Boot] Existing token found, keeping it for this session')
      scheduleTokenRefreshForExistingToken()
    } else {
      console.log('[Boot] No token found; attempting fresh login flow')
    }

    const resolvedUserId = await waitForTelegramUserId()
    console.log('[Boot] Resolved userId:', resolvedUserId)

    if (!resolvedUserId) {
      console.error('[Boot] Telegram userId topilmadi — login o\'tkazib yuborildi')
    } else if (!existingToken) {
      const res = await loginViaTelegram()
      if (res?.token) {
        console.log('[Boot] ✅ Fresh login successful')
      }
    }
  } catch (e) {
    console.warn('Auto-login failed:', e)
  }

  // Warm the /config cache (USD→UZS rate + home page title/text) in the background —
  // pricing.js and the home page read from this shared cache, but first paint shouldn't
  // wait on it.
  fetchAppConfig().catch(() => {})

  createRoot(document.getElementById('root')).render(
    <Root />
  )
}

boot()
