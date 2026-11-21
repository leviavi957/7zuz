import { useCallback, useEffect, useState } from 'react'

export type NotificationAccess = 'unsupported' | NotificationPermission

function currentAccess(): NotificationAccess {
  return typeof Notification === 'undefined' ? 'unsupported' : Notification.permission
}

/**
 * Browser notification permission. `request` must be called from a user tap.
 * The value is re-read on focus, since it can change in the browser settings.
 */
export function useNotificationPermission() {
  const [access, setAccess] = useState<NotificationAccess>(currentAccess)

  useEffect(() => {
    const refresh = () => setAccess(currentAccess())
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [])

  const request = useCallback(async () => {
    if (typeof Notification === 'undefined') return
    setAccess(await Notification.requestPermission())
  }, [])

  return { access, request }
}
