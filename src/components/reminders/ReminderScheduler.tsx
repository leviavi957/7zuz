import { useEffect } from 'react'
import { isDue, loadReminders, saveReminders } from '@/lib/reminders'

const CHECK_EVERY_MS = 15_000

/**
 * Shows a notification for every due reminder. It only runs while the app is
 * open in the browser (there is no background service yet). Background tabs
 * throttle timers, so the check also runs when the tab becomes visible or
 * focused, and a reminder still fires within its catch-up window. Renders
 * nothing.
 */
export function ReminderScheduler() {
  useEffect(() => {
    const check = () => {
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
      const now = new Date()
      const reminders = loadReminders()
      const due = reminders.filter((reminder) => isDue(reminder, now))
      if (due.length === 0) return

      // Remember before notifying: reloads and other tabs read the same record.
      const firedAt = now.toISOString()
      saveReminders(
        reminders.map((reminder) => (due.includes(reminder) ? { ...reminder, lastFiredAt: firedAt } : reminder)),
      )
      for (const reminder of due) {
        new Notification('זמן לזוז', {
          body: 'שתי דקות של תנועה, וחוזרים לעבודה רעננים.',
          icon: '/favicon.svg',
          tag: reminder.id,
        })
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') check()
    }

    check()
    const id = setInterval(check, CHECK_EVERY_MS)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('focus', check)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('focus', check)
    }
  }, [])

  return null
}
