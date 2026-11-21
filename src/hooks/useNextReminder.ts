import { useEffect, useMemo, useState } from 'react'
import { getNextReminder, loadReminders, type NextReminder, type Reminder } from '@/lib/reminders'

const REFRESH_EVERY_MS = 30_000

/**
 * The next upcoming reminder, kept fresh while the screen is open. Pass the
 * reminders a screen already holds; without them the saved ones are read.
 */
export function useNextReminder(reminders?: Reminder[]): NextReminder | null {
  const [now, setNow] = useState(() => new Date())
  const [saved, setSaved] = useState(loadReminders)

  useEffect(() => {
    const refresh = () => {
      setNow(new Date())
      setSaved(loadReminders())
    }
    const id = setInterval(refresh, REFRESH_EVERY_MS)
    window.addEventListener('focus', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      clearInterval(id)
      window.removeEventListener('focus', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  return useMemo(() => getNextReminder(reminders ?? saved, now), [reminders, saved, now])
}
