import { useEffect } from 'react'
import { announceReminder } from '@/lib/announceReminder'
import { getSessionSnapshot, isTrainingRole } from '@/lib/auth'
import { isDue, loadReminders, saveReminders } from '@/lib/reminders'

const CHECK_EVERY_MS = 15_000

/**
 * Announces every due reminder for training roles only. Renders nothing.
 */
export function ReminderScheduler() {
  useEffect(() => {
    const check = () => {
      if (!isTrainingRole(getSessionSnapshot()?.role)) return

      const now = new Date()
      const reminders = loadReminders()
      const due = reminders.filter((reminder) => isDue(reminder, now))
      if (due.length === 0) return

      // Remember before notifying: reloads and other tabs read the same record.
      const firedAt = now.toISOString()
      saveReminders(
        reminders.map((reminder) => (due.includes(reminder) ? { ...reminder, lastFiredAt: firedAt } : reminder)),
      )
      for (const reminder of due) announceReminder(`reminder-${reminder.id}`)
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
