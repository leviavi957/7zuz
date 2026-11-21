/** A recurring "time to move" reminder. */
export interface Reminder {
  id: string
  /** 24h "HH:mm". */
  time: string
  /** Days of the week, 0 = Sunday. */
  days: number[]
  enabled: boolean
  /** ISO time of the last notification, so one reminder fires once per day. */
  lastFiredAt?: string
}

export const DAYS: { value: number; short: string; long: string }[] = [
  { value: 0, short: 'א׳', long: 'ראשון' },
  { value: 1, short: 'ב׳', long: 'שני' },
  { value: 2, short: 'ג׳', long: 'שלישי' },
  { value: 3, short: 'ד׳', long: 'רביעי' },
  { value: 4, short: 'ה׳', long: 'חמישי' },
  { value: 5, short: 'ו׳', long: 'שישי' },
  { value: 6, short: 'ש׳', long: 'שבת' },
]

/** The Israeli work week: Sunday to Thursday. Friday is optional, Saturday is off by default. */
export const WORKDAYS = [0, 1, 2, 3, 4]
const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6]

/** One-tap starter set for people who do not want to configure anything. */
export const RECOMMENDED_TIMES = ['10:30', '13:30', '16:00']

export const DEFAULT_TIME = '10:00'

const STORAGE_KEY = '7zuz.reminders'

function sameDays(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((day) => b.includes(day))
}

export function formatDays(days: number[]): string {
  if (sameDays(days, EVERY_DAY)) return 'כל יום'
  if (sameDays(days, WORKDAYS)) return 'ימי עבודה (א׳–ה׳)'
  return DAYS.filter(({ value }) => days.includes(value))
    .map(({ short }) => short)
    .join(', ')
}

export function sortReminders(reminders: Reminder[]): Reminder[] {
  return [...reminders].sort((a, b) => a.time.localeCompare(b.time))
}

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

function isReminder(value: unknown): value is Reminder {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.time === 'string' &&
    TIME_PATTERN.test(item.time) &&
    typeof item.enabled === 'boolean' &&
    (item.lastFiredAt === undefined || typeof item.lastFiredAt === 'string') &&
    Array.isArray(item.days) &&
    item.days.every((day) => typeof day === 'number')
  )
}

/** Stored reminders; anything unreadable counts as "none yet". */
export function loadReminders(): Reminder[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter(isReminder) : []
  } catch {
    return []
  }
}

export function saveReminders(reminders: Reminder[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders))
}

/** A reminder still fires this long after its time (background tabs run timers late). */
export const CATCH_UP_WINDOW_MINUTES = 10

function scheduledToday(reminder: Reminder, now: Date): Date | null {
  const [hours, minutes] = reminder.time.split(':').map(Number)
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null
  const scheduled = new Date(now)
  scheduled.setHours(hours, minutes, 0, 0)
  return scheduled
}

function firedToday(reminder: Reminder, now: Date): boolean {
  return (
    reminder.lastFiredAt !== undefined &&
    new Date(reminder.lastFiredAt).toDateString() === now.toDateString()
  )
}

/**
 * Due when enabled, active today, its time has passed by no more than the
 * catch-up window, and it has not already fired today.
 */
export function isDue(reminder: Reminder, now: Date): boolean {
  if (!reminder.enabled || !reminder.days.includes(now.getDay()) || firedToday(reminder, now)) {
    return false
  }
  const scheduled = scheduledToday(reminder, now)
  if (!scheduled) return false
  const lateMs = now.getTime() - scheduled.getTime()
  return lateMs >= 0 && lateMs <= CATCH_UP_WINDOW_MINUTES * 60_000
}
export interface NextReminder {
  reminder: Reminder
  /** The moment it will fire. */
  at: Date
  /** 0 = today, 1 = tomorrow, and so on (at most 7). */
  dayOffset: number
}

/**
 * The upcoming reminder after `now`: among enabled reminders, the earliest
 * time on one of their active days within the next week. `null` when none.
 */
export function getNextReminder(reminders: Reminder[], now: Date): NextReminder | null {
  let best: NextReminder | null = null
  for (let dayOffset = 0; dayOffset <= 7; dayOffset += 1) {
    const day = new Date(now)
    day.setDate(day.getDate() + dayOffset)
    for (const reminder of reminders) {
      if (!reminder.enabled || !reminder.days.includes(day.getDay())) continue
      const at = scheduledToday(reminder, day)
      if (!at || at.getTime() <= now.getTime()) continue
      if (!best || at.getTime() < best.at.getTime()) best = { reminder, at, dayOffset }
    }
    // Days are visited in order, so the first day with a match holds the earliest one.
    if (best) return best
  }
  return null
}

/** "היום", "מחר" or "ביום ראשון", plus the 24-hour "HH:mm" time. */
export function describeNextReminder({ at, dayOffset, reminder }: NextReminder): {
  day: string
  time: string
} {
  const weekday = DAYS.find(({ value }) => value === at.getDay())?.long ?? ''
  const day = dayOffset === 0 ? 'היום' : dayOffset === 1 ? 'מחר' : `ביום ${weekday}`
  return { day, time: reminder.time }
}