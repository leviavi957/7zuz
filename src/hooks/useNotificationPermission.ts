import { useCallback, useState } from 'react'

export type NotificationAccess = 'unsupported' | NotificationPermission

function currentAccess(): NotificationAccess {
  return typeof Notification === 'undefined' ? 'unsupported' : Notification.permission
}

/** Browser notification permission. `request` must be called from a user tap. */
export function useNotificationPermission() {
  const [access, setAccess] = useState<NotificationAccess>(currentAccess)

  const request = useCallback(async () => {
    if (typeof Notification === 'undefined') return
    setAccess(await Notification.requestPermission())
  }, [])

  return { access, request }
}
