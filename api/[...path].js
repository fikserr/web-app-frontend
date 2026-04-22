export default async function handler(req, res) {
  const segments = req.query.path
  const targetPath = Array.isArray(segments) ? segments.join('/') : segments || ''

  const query = { ...req.query }
  delete query.path
  const qs = new URLSearchParams(query).toString()

  const targetUrl = `https://shopick.inmind.uz/WEB_PROSYS_BOT/hs/web.app/${targetPath}${qs ? '?' + qs : ''}`

  const credentials = Buffer.from(
    `${process.env.VITE_API_USERNAME}:${process.env.VITE_API_PASSWORD}`
  ).toString('base64')

  const fetchOptions = {
    method: req.method,
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
  }

  if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
    fetchOptions.body = JSON.stringify(req.body)
  }

  const response = await fetch(targetUrl, fetchOptions)
  const data = await response.json()

  res.status(response.status).json(data)
}
