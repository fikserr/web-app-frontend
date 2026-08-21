import { decodeJwtPayload } from './auth'
import { getUsdToUzsRate } from './appConfig'

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

function currencyNameOf(entry) {
  const currency = entry?.currency || entry?.Currency
  return String(currency?.name || currency?.Name || '').trim().toUpperCase()
}

function isUZS(entry) {
  const name = currencyNameOf(entry)
  return name === 'UZS' || name === "SO'M" || name === 'SOM' || name === 'СУМ'
}

function isUSD(entry) {
  const name = currencyNameOf(entry)
  return name === 'USD' || name === '$'
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
// ulgurji — and (b) UZS currency, when a UZS entry exists for this product. Some
// products in 1C only ever get a USD price typed in (no UZS entry at all) — for those,
// this converts the matching USD entry to UZS using the live rate from /config
// (see lib/appConfig.js) so the customer still sees, and is charged, a UZS price.
// The returned currency is always UZS either way — the customer never sees or is
// charged in USD.
//
// price/oldPrice are `null` (not 0) only when the product has neither a UZS nor a USD
// entry at all — genuinely priceless, not the same as priced at zero — so callers must
// render that as "Narx belgilanmagan" rather than "0 so'm".
export function resolveDisplayPrice(product) {
  const entries = Array.isArray(product?.prices) ? product.prices : []
  const priceTypeId = getPriceTypeId()

  const pickForPriceType = (pool) => {
    if (!pool.length) return null
    const matched = priceTypeId ? pool.find((entry) => priceTypeIdOf(entry) === priceTypeId) : null
    return { entry: matched || pool[0], matched: Boolean(matched) }
  }

  const uzsEntries = entries.filter(isUZS)
  const uzsPick = pickForPriceType(uzsEntries)

  if (uzsPick) {
    const { entry: chosen, matched } = uzsPick
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

  // No UZS entry at all for this product — fall back to a USD entry, converted.
  const usdEntries = entries.filter(isUSD)
  const usdPick = pickForPriceType(usdEntries)

  if (usdPick) {
    const { entry: chosen } = usdPick
    const rate = getUsdToUzsRate()
    console.info('[Pricing] UZS narx yo\'q, USD narxdan hisoblandi', {
      productId: product?.id || product?.Id,
      usdPrice: chosen?.price,
      rate,
    })

    return {
      price: Math.round(Number(chosen?.price ?? 0) * rate),
      oldPrice: Math.round(Number(chosen?.oldPrice ?? chosen?.price ?? 0) * rate),
      currency: { id: '', name: 'UZS' },
    }
  }

  return { price: null, oldPrice: null, currency: { id: '', name: 'UZS' } }
}
