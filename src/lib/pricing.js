import { decodeJwtPayload } from './auth'

// customer's assigned price tier (chakana/ulgurji/...) — decoded live from the JWT's
// "jti" claim each time, same pattern as getContractorId() in auth.js
export function getPriceTypeId() {
  const token = localStorage.getItem('token') || ''
  const payload = decodeJwtPayload(token)

  let jti = payload?.jti
  if (typeof jti === 'string') {
    try {
      jti = JSON.parse(jti)
    } catch {
      jti = null
    }
  }

  const priceType = jti?.priceType || payload?.priceType
  return priceType?.id || priceType?.Id || priceType?.ID || null
}

function isUZS(entry) {
  const currency = entry?.currency || entry?.Currency
  const name = String(currency?.name || currency?.Name || '').trim().toUpperCase()
  return name === 'UZS' || name === "SO'M" || name === 'SOM' || name === 'СУМ'
}

function priceTypeIdOf(entry) {
  const priceType = entry?.priceType || entry?.priceTypeInfo || entry?.type || entry?.Type
  return (
    priceType?.id ||
    priceType?.Id ||
    priceType?.ID ||
    entry?.priceTypeId ||
    entry?.priceType_id ||
    null
  )
}

// Picks the price entry matching (a) the customer's assigned price tier — chakana vs
// ulgurji — and (b) UZS currency only. USD-denominated entries are never returned:
// this app only ever shows/charges UZS to the customer.
//
// price/oldPrice are `null` (not 0) when no UZS entry exists — a product genuinely
// priceless in UZS is not the same as one priced at zero, so callers must render that
// as "Narx belgilanmagan" rather than "0 so'm".
export function resolveDisplayPrice(product) {
  const entries = Array.isArray(product?.prices) ? product.prices : []
  const uzsEntries = entries.filter(isUZS)

  if (!uzsEntries.length) {
    return { price: null, oldPrice: null, currency: { id: '', name: 'UZS' } }
  }

  const priceTypeId = getPriceTypeId()
  const matched = priceTypeId ? uzsEntries.find((entry) => priceTypeIdOf(entry) === priceTypeId) : null
  const chosen = matched || uzsEntries[0]

  if (!matched && priceTypeId) {
    console.warn('[Pricing] Mijozning priceType\'iga mos UZS narx topilmadi, birinchi UZS narx ishlatildi', {
      productId: product?.id || product?.Id,
      expectedPriceTypeId: priceTypeId,
      availablePriceTypeIds: uzsEntries.map(priceTypeIdOf),
    })
  }

  return {
    price: Number(chosen?.price ?? 0),
    oldPrice: Number(chosen?.oldPrice ?? chosen?.price ?? 0),
    currency: {
      id: chosen?.currency?.id || chosen?.currency?.Id || '',
      name: chosen?.currency?.name || chosen?.currency?.Name || 'UZS',
    },
  }
}
