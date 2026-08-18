import axios from 'axios'
import { getUserId, decodeJwtPayload } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_IP || ''

// prefer persisted baseURL from previous login (so reload keeps using server URL)
const SAVED_API_BASE = typeof window !== 'undefined' ? localStorage.getItem('apiBaseURL') : null
const api = axios.create({
  baseURL: SAVED_API_BASE || API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// attach token from localStorage if present
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token')
    const hasToken = !!token
    console.log('[Auth] request start:', {
      url: config.url,
      method: config.method?.toUpperCase(),
      hasToken,
      headers: config.headers,
    })
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('[Auth] JWT decoded payload:', decodeJwtPayload(token))
    }

    // ✅ Add userId as query parameter for GET requests
    if (config.method?.toUpperCase() === 'GET') {
      const userId = getUserId()
      if (userId) {
        config.params = { ...config.params, userId }
        console.log('[Auth] Added userId to query params:', userId)
      }
    }

    // ❌ Removed x-customer-id header - backend doesn't expect it
  } catch (e) {
    console.warn('[Auth] request interceptor error:', e)
  }
  return config
})

// internal refresh token and timer
let _refreshToken = null
let _refreshTimer = null

export function setToken(token, options = {}) {
  if (token) {
    localStorage.setItem('token', token)
    api.defaults.headers.Authorization = `Bearer ${token}`
    console.log('[Auth] token saved and JWT payload:', decodeJwtPayload(token))

    // if login returned a refresh token or server URL, handle them.
    // NOTE: apiBaseURL is intentionally still persisted — unlike userId/customerId it
    // isn't an identity claim (an attacker editing it can't impersonate anyone, only
    // point their own browser at a server they still need valid credentials for), and
    // it genuinely cannot be recovered from the JWT: this backend's token only carries
    // {iss, sub, iat, exp, jti}, never the tenant's URL — that lives solely in this
    // login/refresh HTTP response body. Without persisting it, a reload would fall back
    // to the VITE_API_BASE_URL default, which is a different host for some tenants.
    if (options.refreshToken) {
      _refreshToken = options.refreshToken
      localStorage.setItem('refreshToken', _refreshToken)
      console.log('[Auth] Refresh token stored (valid for 30 days)')
    }
    if (options.baseURL) {
      api.defaults.baseURL = options.baseURL
      localStorage.setItem('apiBaseURL', options.baseURL)
    }

    // proactive refresh timing comes straight from the token's own "exp" claim, so
    // nothing about lifetime needs to be cached separately in localStorage
    scheduleTokenRefreshFromToken(token)
  } else {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    // one-time cleanup of keys older builds of this app used to cache
    localStorage.removeItem('customerId')
    localStorage.removeItem('userId')
    localStorage.removeItem('tokenLifetime')
    localStorage.removeItem('tokenIssuedAt')
    delete api.defaults.headers.Authorization
    _refreshToken = null
    if (_refreshTimer) {
      clearTimeout(_refreshTimer)
      _refreshTimer = null
    }
    console.log('[Auth] Token cleared')
  }
}

function scheduleTokenRefresh(remainingSeconds) {
  if (_refreshTimer) clearTimeout(_refreshTimer)

  // refresh at 80% of the token's remaining lifetime (e.g. ~8 min into a 10 min token)
  const refreshAfter = Math.floor(remainingSeconds * 0.8)
  const ms = Math.max(5000, refreshAfter * 1000)

  console.log('[Auth] Token refresh scheduled:', {
    remainingSec: remainingSeconds,
    refreshAfterSec: refreshAfter,
    refreshAfterMin: Math.round(refreshAfter / 60),
  })

  _refreshTimer = setTimeout(async () => {
    try {
      console.log('[Auth] Automatic token refresh triggered')
      await refreshOrRelogin()
    } catch (e) {
      console.warn('Scheduled token refresh failed:', e)
    }
  }, ms)
}

// (Re-)arms the proactive refresh timer by decoding the token's own "exp" claim —
// this is the ONLY source of truth used, so it behaves identically right after login,
// right after a refresh, and on a page reload with a pre-existing token (main.jsx calls
// this on boot, since it otherwise skips loginViaTelegram entirely when a token already
// exists, which previously meant the timer was never re-armed after reload).
export function scheduleTokenRefreshFromToken(token) {
  if (!token) return

  const payload = decodeJwtPayload(token)
  if (typeof payload?.exp !== 'number') {
    console.warn('[Auth] Token has no "exp" claim — proactive refresh not armed, relying on reactive 401 refresh')
    return
  }

  const remainingSec = payload.exp - Math.floor(Date.now() / 1000)

  if (remainingSec <= 0) {
    console.log('[Auth] Token already expired — refreshing now')
    refreshOrRelogin().catch((e) => console.warn('[Auth] Immediate refresh failed:', e))
    return
  }

  scheduleTokenRefresh(remainingSec)
}

export function scheduleTokenRefreshForExistingToken() {
  scheduleTokenRefreshFromToken(localStorage.getItem('token'))
}

// Browsers throttle (or fully pause) setTimeout timers in background tabs, so the
// proactive refresh armed above can fire very late — or never — while the Telegram
// WebView is backgrounded (user switched to another chat/app, which is extremely common
// mid-session for a Mini App). Re-checking whenever the tab regains visibility closes
// that gap instead of relying purely on the timer.
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return
    const token = localStorage.getItem('token')
    if (!token) return
    console.log('[Auth] Tab became visible — re-checking token freshness')
    scheduleTokenRefreshFromToken(token)
  })
}

export default api

// Logs in through our own /api/login serverless function instead of calling the backend
// directly. The backend's Basic Auth credentials never reach the browser — they live only
// in the function's server-side env vars — and the function independently verifies
// Telegram's signed initData before it will mint a token for the userId inside it, so a
// spoofed userId can't be used to impersonate another account.
// NOTE: this requires the Vercel function to actually be running — `npm run dev` alone
// (plain Vite) does not serve /api/*; use `vercel dev` locally, or test against a real
// Vercel deployment.
//
// Deduplicated the same way as refreshTokenRequest — if a refresh genuinely fails for two
// concurrent callers (e.g. the scheduled proactive refresh and a reactive 401 both firing
// around the same idle-too-long moment), both would otherwise fall back to loginViaTelegram
// at once, sending two concurrent logins for no reason.
let _loginPromise = null

export function loginViaTelegram() {
  if (_loginPromise) return _loginPromise

  _loginPromise = (async () => {
    const initData = window?.Telegram?.WebApp?.initData
    if (!initData) throw new Error('Telegram initData mavjud emas')

    const res = await axios.post('/api/login', { initData })
    console.log('[Auth] login response:', res?.data)
    const content = res?.data?.data?.content || {}
    const token = content?.accesToken || res?.data?.token || res?.data?.accessToken
    const refresh = content?.refreshToken || res?.data?.refreshToken
    const baseURL = content?.URL || undefined
    if (baseURL) api.defaults.baseURL = baseURL
    if (token) {
      console.log('[Auth] login JWT payload:', decodeJwtPayload(token))
      setToken(token, { refreshToken: refresh, baseURL })
    }
    return { token, refresh, baseURL }
  })()

  _loginPromise.finally(() => {
    _loginPromise = null
  })

  return _loginPromise
}

// Attempt to refresh using stored refresh token. Endpoint path configurable via env `VITE_REFRESH_PATH` (default '/refresh')
//
// Deduplicated on purpose: on boot with a long-expired token, the proactive refresh
// (scheduleTokenRefreshFromToken) and the reactive 401 refresh (response interceptor,
// triggered by whatever request the freshly-mounted page fires first) can both start
// within milliseconds of each other, both reading the same (old) refreshToken. If the
// backend rotates/invalidates refresh tokens on use, whichever of the two loses the race
// gets rejected — and since that loser's failure handler calls setToken(null), it wipes
// out the token the winner had just successfully written, leaving the app with no token
// and no refreshToken until the next full reopen. Sharing one in-flight promise means
// only one network call ever happens per expiry, and every caller sees the same outcome.
let _refreshPromise = null

export function refreshTokenRequest() {
  if (_refreshPromise) return _refreshPromise

  _refreshPromise = (async () => {
    const refreshPath = import.meta.env.VITE_REFRESH_PATH || '/refresh'
    const refreshToken = _refreshToken || localStorage.getItem('refreshToken')
    if (!refreshToken) throw new Error('No refresh token available')

    console.log('[Auth] Attempting to refresh access token...')
    const res = await api.post(refreshPath, { refreshToken })
    console.log('[Auth] refresh response:', res?.data)
    const content = res?.data?.data?.content || {}
    const token = content?.accesToken || res?.data?.accessToken || res?.data?.token
    const refresh = content?.refreshToken || res?.data?.refreshToken
    if (token) {
      console.log('[Auth] ✅ Access token refreshed successfully')
      console.log('[Auth] refreshed JWT payload:', decodeJwtPayload(token))
      setToken(token, { refreshToken: refresh })
    }
    return { token, refresh }
  })()

  _refreshPromise.finally(() => {
    _refreshPromise = null
  })

  return _refreshPromise
}

// Tries a token refresh first; if that genuinely fails (refresh token expired, revoked,
// or otherwise rejected by the backend — not just the race handled above), falls back to
// a brand new Telegram login instead of giving up. Telegram's initData is available at
// any point in the session regardless of how long it's been idle, so there's no need to
// make the user close and reopen the app to recover — without this fallback, any real
// refresh failure left the app stuck with no token and no way to get a new one until the
// next full reopen (main.jsx only calls loginViaTelegram at boot).
async function refreshOrRelogin() {
  try {
    return await refreshTokenRequest()
  } catch (refreshErr) {
    console.warn('[Auth] Refresh failed, attempting a fresh Telegram login instead:', refreshErr)
    try {
      return await loginViaTelegram()
    } catch (loginErr) {
      console.warn('[Auth] Fresh login also failed:', loginErr)
      setToken(null)
      throw loginErr
    }
  }
}

// Response interceptor to try refresh (falling back to a fresh login) on 401, and retry
// the original request once
api.interceptors.response.use(
  res => {
    console.log('[Auth] response:', {
      url: res.config?.url,
      method: res.config?.method?.toUpperCase(),
      status: res.status,
      data: res.data,
    })
    return res
  },
  async err => {
    console.error('[Auth] response error:', {
      url: err?.config?.url,
      method: err?.config?.method?.toUpperCase(),
      status: err?.response?.status,
      data: err?.response?.data,
    })

    if (err.response && err.response.status === 402) {
      console.warn('[Auth] Payment required by backend. This is not a JWT/auth expiry issue.')
      return Promise.reject(err)
    }

    const originalReq = err.config
    if (err.response && err.response.status === 401 && !originalReq._retry) {
      originalReq._retry = true
      try {
        await refreshOrRelogin()
        return api(originalReq)
      } catch (refreshErr) {
        // refreshOrRelogin() already cleared the token on total failure
        return Promise.reject(refreshErr)
      }
    }
    return Promise.reject(err)
  }
)
