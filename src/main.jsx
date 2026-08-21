import React from 'react'
import { createRoot } from 'react-dom/client'
import Root from './router'
import './index.css'
import { loginViaTelegram, scheduleTokenRefreshForExistingToken } from './lib/api'
import { fetchAppConfig } from './lib/appConfig'

// Telegram WebApp tayyor bo'lishini kutish — loginViaTelegram() faqat xom `initData`
// satridan foydalanadi, shuning uchun aynan shuni kutamiz (avval `initDataUnsafe.user.id`
// — parse qilingan qulaylik uchun maydon — kutilardi, bu esa sekinroq qurilmalarda/WebView
// sovuq ochilishida `initData`ning o'zidan ancha kech to'ldirilishi mumkin edi va login
// keraksiz o'tkazib yuborilardi). userId hech qachon localStorage'ga saqlanmaydi, faqat
// Telegramning o'zidan olinadi (device/hacked localStorage orqali boshqa foydalanuvchi
// nomidan kirib bo'lmasligi uchun).
function waitForTelegramReady(maxAttempts = 30, delayMs = 100) {
  return new Promise((resolve) => {
    let attempts = 0

    function check() {
      attempts++
      const tg = window?.Telegram?.WebApp

      if (tg?.initData) {
        console.log('[Boot] Telegram initData tayyor, urinish:', attempts, 'userId:', tg?.initDataUnsafe?.user?.id)
        resolve(true)
        return
      }

      if (attempts >= maxAttempts) {
        console.warn('[Boot] Telegram initData topilmadi,', attempts, 'urinishdan keyin')
        resolve(false)
        return
      }

      setTimeout(check, delayMs)
    }

    check()
  })
}

// Ehtiyot chorasi: agar boot() dastlabki urinishda token ola olmasa (masalan, Telegram
// initData yuqoridagi byudjetdan ham kechroq tayyor bo'lsa, yoki /api/login sovuq
// ishga tushish/tarmoq xatosi tufayli birinchi safar muvaffaqiyatsiz tugasa), ilova
// "ro'yxatdan o'tmagan" holatda tokensiz doim qolib ketmasin — fonda tinimsiz login
// urinib turadi va muvaffaqiyatli bo'lsa, allaqachon (tokensiz) yuklangan sahifalarni
// to'g'ri holatga qaytarish uchun BIR MARTA avtomatik reload qiladi — bu foydalanuvchi
// qo'lda reload qilganda nima bo'lsa, xuddi o'shani o'zi avtomatik bajaradi.
function scheduleAuthRecovery() {
  if (localStorage.getItem('token')) return
  if (sessionStorage.getItem('authRecoveryReloaded')) return

  let attempts = 0
  const maxAttempts = 30 // ~30 * 500ms = 15s qo'shimcha byudjet
  const timer = setInterval(async () => {
    attempts++

    if (localStorage.getItem('token')) {
      clearInterval(timer)
      return
    }

    const tg = window?.Telegram?.WebApp
    if (tg?.initData) {
      try {
        const res = await loginViaTelegram()
        if (res?.token) {
          clearInterval(timer)
          sessionStorage.setItem('authRecoveryReloaded', '1')
          console.log('[Boot] Kechikkan login muvaffaqiyatli — sahifa bir marta qayta yuklanmoqda')
          window.location.reload()
          return
        }
      } catch (e) {
        console.warn('[Boot] Kechikkan login urinishi muvaffaqiyatsiz, qayta urinib ko\'riladi:', e)
      }
    }

    if (attempts >= maxAttempts) {
      clearInterval(timer)
      console.warn('[Boot] Auth recovery', attempts, 'urinishdan keyin to\'xtatildi')
    }
  }, 500)
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

    const telegramReady = await waitForTelegramReady()

    if (!telegramReady) {
      console.error('[Boot] Telegram initData topilmadi — login o\'tkazib yuborildi')
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

  // Safety net for the (rare) case the above still didn't get a token in time — see
  // scheduleAuthRecovery's comment.
  scheduleAuthRecovery()

  createRoot(document.getElementById('root')).render(
    <Root />
  )
}

boot()
