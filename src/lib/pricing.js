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
// (see lib/appConfig.js) so the customer still SEES a UZS price everywhere in the UI.
//
// The return value has two parts:
//   - price/oldPrice/currency: always UZS — what to *display* to the customer.
//   - order: what to actually *submit* in the order payload. For a real UZS entry this is
//     identical to the display value. For a USD-only product it's the ORIGINAL USD price
//     with the real USD currency.id — never the converted UZS number with a fabricated
//     empty id. The backend rejects an empty/invalid currency.id (400, "currency.id" —
//     it validates against its own currency catalog), and it already receives the live
//     UZS↔USD rate as the order's top-level `rate` field (see useOrder.jsx), so it does
//     the USD→UZS conversion itself server-side from the real USD line.
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

    const value = {
      price: Number(chosen?.price ?? 0),
      oldPrice: Number(chosen?.oldPrice ?? chosen?.price ?? 0),
      currency: {
        id: chosen?.currency?.id || chosen?.currency?.Id || '',
        name: chosen?.currency?.name || chosen?.currency?.Name || 'UZS',
      },
    }
    return { ...value, order: value }
  }

  // No UZS entry at all for this product — fall back to a USD entry. Displayed to the
  // customer converted to UZS, but submitted to the backend as the real USD line.
  const usdEntries = entries.filter(isUSD)
  const usdPick = pickForPriceType(usdEntries)

  if (usdPick) {
    const { entry: chosen } = usdPick
    const rate = getUsdToUzsRate()
    const usdPrice = Number(chosen?.price ?? 0)
    const usdOldPrice = Number(chosen?.oldPrice ?? chosen?.price ?? 0)
    console.info('[Pricing] UZS narx yo\'q, USD narxdan hisoblandi', {
      productId: product?.id || product?.Id,
      usdPrice,
      rate,
    })

    return {
      price: Math.round(usdPrice * rate),
      oldPrice: Math.round(usdOldPrice * rate),
      currency: { id: '', name: 'UZS' },
      order: {
        price: usdPrice,
        oldPrice: usdOldPrice,
        currency: {
          id: chosen?.currency?.id || chosen?.currency?.Id || '',
          name: chosen?.currency?.name || chosen?.currency?.Name || 'USD',
        },
      },
    }
  }

  const empty = { price: null, oldPrice: null, currency: { id: '', name: 'UZS' } }
  return { ...empty, order: empty }
}
