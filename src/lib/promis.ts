import { PROMIS_QUESTIONS } from '@/content/promisCopy'

/** Days between a completed PROMIS and the next gentle reminder. */
export const PROMIS_INTERVAL_DAYS = 30

const DAY_MS = 24 * 60 * 60 * 1000

export type PromisRound = 'baseline' | 'monthly'

export type PromisAnswers = Record<string, number>

export interface PromisEntry {
  id: string
  round: PromisRound
  answers: PromisAnswers
  /** Sum of the five ratings, 5–25. */
  total: number
  createdAt: string
}

export function scorePromis(answers: PromisAnswers): number {
  return PROMIS_QUESTIONS.reduce((sum, { id }) => sum + (answers[id] ?? 0), 0)
}

export function isPromisComplete(answers: PromisAnswers): boolean {
  return PROMIS_QUESTIONS.every(({ id }) => {
    const value = answers[id]
    return typeof value === 'number' && value >= 1 && value <= 5
  })
}

export function nextPromisRound(entries: PromisEntry[]): PromisRound {
  return entries.length === 0 ? 'baseline' : 'monthly'
}

/** The most recent entry, or `null` when none exist. */
export function latestPromis(entries: PromisEntry[]): PromisEntry | null {
  if (entries.length === 0) return null
  return [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null
}

/**
 * Due when there is no entry yet, or the latest one is older than
 * `PROMIS_INTERVAL_DAYS`.
 */
export function isPromisDue(entries: PromisEntry[], now: Date = new Date()): boolean {
  const latest = latestPromis(entries)
  if (!latest) return true
  const age = now.getTime() - new Date(latest.createdAt).getTime()
  return !Number.isFinite(age) || age < 0 || age >= PROMIS_INTERVAL_DAYS * DAY_MS
}

/** The first day the next monthly fill is suggested. `null` when none yet. */
export function nextPromisDueAt(entries: PromisEntry[]): Date | null {
  const latest = latestPromis(entries)
  if (!latest) return null
  return new Date(new Date(latest.createdAt).getTime() + PROMIS_INTERVAL_DAYS * DAY_MS)
}

export function formatHebrewDate(iso: string): string {
  return new Intl.DateTimeFormat('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso))
}
