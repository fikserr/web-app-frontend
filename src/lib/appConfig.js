import api from './api'

// Historical fallback used across the app (useOrder.jsx's old hardcoded default) for
// whenever the real rate hasn't loaded from the backend yet.
const DEFAULT_USD_RATE = 12200

// Module-level singleton: GET /config is fetched once and shared by every consumer
// (price conversion in pricing.js, the home page title/text, useOrder.jsx's rate field)
// instead of every caller re-fetching it. Components that need to react to it loading
// (see useAppConfig.js) subscribe via `listeners`.
let cache = null
let inFlightPromise = null
const listeners = new Set()

function normalizeRates(content) {
  const rates = {}
  for (const value of Object.values(content || {})) {
    if (value && typeof value === 'object' && 'rate' in value) {
      const name = String(value.name || '').trim().toUpperCase()
      if (name) rates[name] = Number(value.rate) || (name === 'UZS' ? 1 : DEFAULT_USD_RATE)
    }
  }
  return rates
}

function notify() {
  listeners.forEach((fn) => fn(cache))
}

export function fetchAppConfig() {
  if (inFlightPromise) return inFlightPromise

  inFlightPromise = api
    .get('/config')
    .then((res) => {
      const content = res.data?.data?.content || {}
      cache = {
        title: content.title || '',
        text: content.text || '',
        registered: !!content.registered,
        rates: normalizeRates(content),
      }
      return cache
    })
    .catch((err) => {
      console.warn('[Config] /config fetch failed:', err)
      // keep whatever we had before (or null) so callers fall back to defaults
      return cache
    })
    .finally(() => {
      inFlightPromise = null
      notify()
    })

  return inFlightPromise
}

export function getAppConfig() {
  return cache
}

export function getUsdToUzsRate() {
  return cache?.rates?.USD || DEFAULT_USD_RATE
}

export function subscribeAppConfig(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
