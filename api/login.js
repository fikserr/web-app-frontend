import crypto from 'node:crypto'

// Validates Telegram's signed initData per the official Mini Apps algorithm:
// https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
// Returns the verified Telegram user object, or null if the signature/freshness check fails.
function verifyTelegramInitData(initData, botToken) {
  const params = new URLSearchParams(initData)
  const hash = params.get('hash')
  if (!hash) return null

  params.delete('hash')
  const pairs = []
  for (const [key, value] of params.entries()) {
    pairs.push(`${key}=${value}`)
  }
  pairs.sort()
  const dataCheckString = pairs.join('\n')

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest()
  const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

  const computedBuf = Buffer.from(computedHash, 'hex')
  const receivedBuf = Buffer.from(hash, 'hex')
  const validSignature =
    computedBuf.length === receivedBuf.length && crypto.timingSafeEqual(computedBuf, receivedBuf)

  if (!validSignature) return null

  // reject stale/replayed initData
  const authDate = Number(params.get('auth_date'))
  const MAX_AGE_SECONDS = 24 * 60 * 60
  if (!authDate || Date.now() / 1000 - authDate > MAX_AGE_SECONDS) {
    return null
  }

  const userRaw = params.get('user')
  if (!userRaw) return null

  try {
    return JSON.parse(userRaw)
  } catch {
    return null
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const apiUsername = process.env.API_USERNAME
  const apiPassword = process.env.API_PASSWORD
  const apiLoginId = process.env.API_LOGIN_ID
  const apiBaseURL = process.env.API_BASE_URL

  if (!botToken || !apiUsername || !apiPassword || !apiLoginId || !apiBaseURL) {
    console.error('[api/login] Missing required server env vars (TELEGRAM_BOT_TOKEN/API_USERNAME/API_PASSWORD/API_LOGIN_ID/API_BASE_URL)')
    res.status(500).json({ error: 'Server misconfigured' })
    return
  }

  const { initData } = req.body || {}
  if (!initData || typeof initData !== 'string') {
    res.status(400).json({ error: 'initData required' })
    return
  }

  const user = verifyTelegramInitData(initData, botToken)
  if (!user || !user.id) {
    res.status(401).json({ error: 'Invalid Telegram signature' })
    return
  }

  const basic = Buffer.from(`${apiUsername}:${apiPassword}`).toString('base64')

  try {
    const backendRes = await fetch(`${apiBaseURL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${basic}`,
      },
      body: JSON.stringify({ id: apiLoginId, userId: String(user.id) }),
    })

    // pass the backend's own response shape straight through — the frontend already
    // knows how to parse it (see loginViaTelegram in src/lib/api.js)
    const data = await backendRes.json()
    res.status(backendRes.status).json(data)
  } catch (e) {
    console.error('[api/login] backend login failed:', e)
    res.status(502).json({ error: 'Backend login failed' })
  }
}
