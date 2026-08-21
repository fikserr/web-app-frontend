import { useEffect, useState } from 'react'
import { fetchAppConfig, getAppConfig, subscribeAppConfig } from '../lib/appConfig'

// Subscribes to the shared /config cache (see lib/appConfig.js). Also used by
// components that don't render title/text but need a re-render once the USD→UZS
// rate arrives (card.jsx, detail.jsx) so prices computed from resolveDisplayPrice
// pick up the live rate instead of staying stuck on the fallback default.
export default function useAppConfig() {
  const [config, setConfig] = useState(getAppConfig())

  useEffect(() => {
    const unsubscribe = subscribeAppConfig(setConfig)
    if (!getAppConfig()) fetchAppConfig()
    return unsubscribe
  }, [])

  return { config, loading: !config }
}
