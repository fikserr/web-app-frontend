// shared JWT payload decoder — used by api.js and useOrder.jsx to avoid re-implementing base64url decoding
export function decodeJwtPayload(token) {
  if (!token) return {}
  try {
    const parts = token.split('.')
    if (parts.length < 2) return {}

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const binary = atob(padded)

    const bytes = Uint8Array.from(binary, ch => ch.charCodeAt(0))
    const jsonStr = new TextDecoder('utf-8').decode(bytes)
    return JSON.parse(jsonStr)
  } catch {
    return {}
  }
}

// small helper to centralize Telegram initData access
export function getTelegramUser() {
  try {
    return window?.Telegram?.WebApp?.initDataUnsafe?.user || null
  } catch {
    return null
  }
}

// userId is never persisted anywhere — always read live from Telegram's WebApp SDK
// so a device/browser can't be made to impersonate another account by editing localStorage
export function getUserId() {
  const tg = getTelegramUser()
  if (tg && tg.id) return String(tg.id)
  return null
}

// contractor (customer) id lives inside the JWT's "jti" claim (as a JSON string) —
// decoded on demand every time instead of being cached in localStorage
export function getContractorId() {
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

  const contractor = jti?.customer || jti?.contractor || payload?.contractor || payload?.customer || payload?.client
  const id = contractor?.id || contractor?.Id || contractor?.ID
  return id ? String(id) : null
}

export function getTokenContractor() {
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

  const customer = jti?.customer || jti?.contractor || payload?.customer || payload?.contractor || payload?.client
  const id = customer?.id || customer?.Id || customer?.ID || ''
  const name = customer?.name || customer?.Name || customer?.fullName || 'Kundalik'

  return {
    id: id ? String(id) : '',
    name,
  }
}

export function getTokenStock() {
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

  const stock = jti?.stock || payload?.stock || payload?.warehouse || payload?.sklad
  const id = stock?.id || stock?.Id || stock?.ID || ''
  const name = stock?.name || stock?.Name || stock?.fullName || 'Asosiy sklad'

  return {
    id: id ? String(id) : '',
    name,
  }
}

export default { getTelegramUser, getUserId, getContractorId, getTokenContractor }
