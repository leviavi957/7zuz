import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAppPath, OPEN_URL_EVENT, OPEN_URL_MESSAGE } from '@/lib/notificationTarget'

/**
 * Opens the page a clicked notification points to, using the router. Mounted
 * once at the root. Renders nothing.
 */
export function NotificationNavigation() {
  const navigate = useNavigate()

  useEffect(() => {
    const open = (url: unknown) => {
      if (isAppPath(url)) navigate(url)
    }
    const onWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === OPEN_URL_MESSAGE) open(event.data.url)
    }
    const onFallbackClick = (event: Event) => open((event as CustomEvent).detail)

    navigator.serviceWorker?.addEventListener('message', onWorkerMessage)
    window.addEventListener(OPEN_URL_EVENT, onFallbackClick)
    return () => {
      navigator.serviceWorker?.removeEventListener('message', onWorkerMessage)
      window.removeEventListener(OPEN_URL_EVENT, onFallbackClick)
    }
  }, [navigate])

  return null
}
