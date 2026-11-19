import { useEffect } from 'react'
import { formatClock, isDue, loadReminders } from '@/lib/reminders'

const CHECK_EVERY_MS = 15_000

/**
 * Shows a notification when a reminder is due. It only runs while the app is
 * open in the browser (there is no background service yet). Renders nothing.
 */
export function ReminderScheduler() {
  useEffect(() => {
    const fired = new Set<string>()

    const check = () => {
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
      const now = new Date()
      for (const reminder of loadReminders()) {
        const key = `${reminder.id}-${now.toDateString()}-${formatClock(now)}`
        if (!isDue(reminder, now) || fired.has(key)) continue
        fired.add(key)
        new Notification('זמן לזוז', {
          body: 'שתי דקות של תנועה, וחוזרים לעבודה רעננים.',
          icon: '/favicon.svg',
          tag: reminder.id,
        })
      }
    }

    check()
    const id = setInterval(check, CHECK_EVERY_MS)
    return () => clearInterval(id)
  }, [])

  return null
}
