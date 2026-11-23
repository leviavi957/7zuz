import { readUserJson, writeUserJson } from '@/lib/userStorage'

/**
 * Per-user workout sessions (`7zuz.<userId>.sessions`).
 * A backend can replace these functions later; screens talk only to this API.
 */
const SUFFIX = 'sessions'
const LATENCY_MS = 400

export interface WorkoutSession {
  id: string
  workoutId: string
  /** ISO timestamp. */
  completedAt: string
  minutes: number
}

export interface SessionSummary {
  totalWorkouts: number
  totalMinutes: number
  /** Consecutive local days ending today or yesterday. */
  streak: number
  lastWorkoutAt: string | null
}

function isSession(value: unknown): value is WorkoutSession {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.workoutId === 'string' &&
    typeof item.completedAt === 'string' &&
    typeof item.minutes === 'number' &&
    Number.isFinite(item.minutes)
  )
}

function read(): WorkoutSession[] {
  const parsed = readUserJson<unknown>(SUFFIX, [])
  return Array.isArray(parsed) ? parsed.filter(isSession) : []
}

export function listSessions(): Promise<WorkoutSession[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(read()), LATENCY_MS)
  })
}

/** Append one finished workout for the signed-in user. No-op when signed out. */
export function recordSession(input: Omit<WorkoutSession, 'id'>): Promise<void> {
  const entry: WorkoutSession = {
    id: crypto.randomUUID(),
    workoutId: input.workoutId,
    completedAt: input.completedAt,
    minutes: Math.max(0, Math.round(input.minutes)),
  }
  writeUserJson(SUFFIX, [...read(), entry])
  return Promise.resolve()
}

function localDayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function sessionDay(iso: string): string | null {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return localDayKey(date)
}

function currentStreak(days: Set<string>, now: Date): number {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const start = days.has(localDayKey(today)) ? today : days.has(localDayKey(yesterday)) ? yesterday : null
  if (!start) return 0

  let streak = 0
  const cursor = new Date(start)
  while (days.has(localDayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function summarizeSessions(sessions: WorkoutSession[], now = new Date()): SessionSummary {
  const days = new Set<string>()
  let totalMinutes = 0
  let lastWorkoutAt: string | null = null

  for (const session of sessions) {
    totalMinutes += Math.max(0, session.minutes)
    const day = sessionDay(session.completedAt)
    if (day) days.add(day)
    if (!lastWorkoutAt || session.completedAt > lastWorkoutAt) lastWorkoutAt = session.completedAt
  }

  return {
    totalWorkouts: sessions.length,
    totalMinutes,
    streak: currentStreak(days, now),
    lastWorkoutAt,
  }
}
