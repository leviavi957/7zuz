/** A recurring "time to move" reminder. */
export interface Reminder {
  id: string
  /** 24h "HH:mm". */
  time: string
  /** Days of the week, 0 = Sunday. */
  days: number[]
  enabled: boolean
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

function isReminder(value: unknown): value is Reminder {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.time === 'string' &&
    typeof item.enabled === 'boolean' &&
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

export function formatClock(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function isDue(reminder: Reminder, now: Date): boolean {
  return (
    reminder.enabled && reminder.days.includes(now.getDay()) && reminder.time === formatClock(now)
  )
}
