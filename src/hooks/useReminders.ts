import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  loadReminders,
  RECOMMENDED_TIMES,
  saveReminders,
  sortReminders,
  WORKDAYS,
  type Reminder,
} from '@/lib/reminders'

export type RemindersStatus = 'loading' | 'ready' | 'error'

export type ReminderDraft = Pick<Reminder, 'time' | 'days'>

/**
 * Reminders kept in localStorage (a backend can replace this later).
 * `?state=loading|empty|error` previews those states; `retry` clears it.
 */
export function useReminders() {
  const [params, setParams] = useSearchParams()
  const [reminders, setReminders] = useState<Reminder[]>(loadReminders)
  const [loaded, setLoaded] = useState(false)
  const forced = params.get('state')

  useEffect(() => {
    const id = setTimeout(() => setLoaded(true), 400)
    return () => clearTimeout(id)
  }, [])

  const commit = useCallback((update: (current: Reminder[]) => Reminder[]) => {
    setReminders((current) => {
      const next = sortReminders(update(current))
      saveReminders(next)
      return next
    })
  }, [])

  const add = useCallback(
    (draft: ReminderDraft) =>
      commit((current) => [...current, { ...draft, id: crypto.randomUUID(), enabled: true }]),
    [commit],
  )

  const addRecommended = useCallback(
    () =>
      commit((current) => [
        ...current,
        ...RECOMMENDED_TIMES.map((time) => ({
          id: crypto.randomUUID(),
          time,
          days: WORKDAYS,
          enabled: true,
        })),
      ]),
    [commit],
  )

  const update = useCallback(
    (id: string, changes: Partial<Omit<Reminder, 'id'>>) =>
      commit((current) => current.map((item) => (item.id === id ? { ...item, ...changes } : item))),
    [commit],
  )

  const remove = useCallback(
    (id: string) => commit((current) => current.filter((item) => item.id !== id)),
    [commit],
  )

  const retry = useCallback(() => setParams({}), [setParams])

  let status: RemindersStatus = 'ready'
  if (forced === 'error') status = 'error'
  else if (forced === 'loading' || !loaded) status = 'loading'

  return {
    status,
    reminders: forced === 'empty' ? [] : reminders,
    add,
    addRecommended,
    update,
    remove,
    retry,
  }
}
