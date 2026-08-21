// Parses the free-form "text for web app" field (typed in 1C, see the "Форма констант →
// Мобильный" tab) into renderable blocks for the home page.
//
// Convention for whoever edits that field in 1C:
//   - a blank line separates paragraphs
//   - a line starting with 📍 becomes an address row (location icon)
//   - a line starting with 📞 or ☎️ becomes a phone row (phone icon)
//   - a line starting with 🕗, 🕒, 🕐 or ⏰ becomes a working-hours row (calendar icon)
// Emoji can be typed straight into the 1C field with the OS emoji picker (Win+.),
// no markup/HTML needed.
const ICON_MARKERS = [
  { type: 'location', icons: ['📍', '🏠'] },
  { type: 'phone', icons: ['📞', '☎️', '☎', '📱'] },
  { type: 'schedule', icons: ['🕗', '🕒', '🕐', '⏰', '🗓️', '🗓', '📅'] },
]

export function parseHomeText(raw) {
  if (!raw || typeof raw !== 'string') return []

  const blocks = []
  let paragraphLines = []

  const flushParagraph = () => {
    if (paragraphLines.length) {
      blocks.push({ type: 'paragraph', text: paragraphLines.join(' ') })
      paragraphLines = []
    }
  }

  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim()

    if (!line) {
      flushParagraph()
      continue
    }

    const marker = ICON_MARKERS.find((m) => m.icons.some((icon) => line.startsWith(icon)))
    if (marker) {
      flushParagraph()
      const icon = marker.icons.find((i) => line.startsWith(i))
      blocks.push({ type: marker.type, text: line.slice(icon.length).trim() })
      continue
    }

    paragraphLines.push(line)
  }
  flushParagraph()

  return blocks
}
