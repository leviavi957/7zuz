import { OPEN_URL_EVENT, reminderTargetUrl } from '@/lib/notificationTarget'
import { playChime } from '@/lib/reminderSound'
import { showToast } from '@/lib/toast'

const TITLE = 'זמן לזוז'
const BODY = 'שתי דקות של תנועה, וחוזרים לעבודה רעננים.'
const ICON = '/favicon.svg'
const START_LABEL = 'התחלת אימון'

/**
 * Shows the system notification. A service worker registration is the more
 * reliable route; without one, fall back to `new Notification`. The tag is
 * stable per reminder, so the same reminder never stacks up.
 */
async function showSystemNotification(tag: string): Promise<void> {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
  const url = reminderTargetUrl()
  const options: NotificationOptions = { body: BODY, icon: ICON, tag, silent: false, data: { url } }

  try {
    const registration = await navigator.serviceWorker?.getRegistration()
    if (registration?.active) {
      // Action buttons exist only on service worker notifications.
      const withActions = { ...options, actions: [{ action: 'start', title: START_LABEL }] }
      await registration.showNotification(TITLE, withActions)
      return
    }
  } catch {
    // Fall through to the plain notification.
  }

  const notification = new Notification(TITLE, options)
  notification.onclick = () => {
    window.focus()
    window.dispatchEvent(new CustomEvent(OPEN_URL_EVENT, { detail: url }))
    notification.close()
  }
}

/**
 * Tells the user it is time to move: always an in-page toast (the OS may
 * suppress system notifications), a soft chime when the tab is visible, and a
 * system notification when allowed.
 */
export function announceReminder(tag: string): void {
  showToast({ title: TITLE, message: BODY })
  playChime()
  void showSystemNotification(tag)
}

export type TestResult = 'sent' | 'default' | 'denied' | 'unsupported'

/** Whether a test can run now, or why not. */
export function checkTestAccess(): TestResult {
  if (typeof Notification === 'undefined') return 'unsupported'
  return Notification.permission === 'granted' ? 'sent' : Notification.permission
}
