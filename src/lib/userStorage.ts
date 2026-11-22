import { getSessionSnapshot } from '@/lib/auth'

/**
 * Per-user mock localStorage key: `7zuz.<userId>.<suffix>`.
 * Returns null when nobody is signed in (callers treat that as empty).
 */
export function userStorageKey(suffix: string): string | null {
  const session = getSessionSnapshot()
  if (!session) return null
  return `7zuz.${session.userId}.${suffix}`
}

export function readUserItem(suffix: string): string | null {
  const key = userStorageKey(suffix)
  return key ? localStorage.getItem(key) : null
}

export function writeUserItem(suffix: string, value: string): void {
  const key = userStorageKey(suffix)
  if (!key) return
  localStorage.setItem(key, value)
}

export function readUserJson<T>(suffix: string, fallback: T): T {
  const raw = readUserItem(suffix)
  if (raw === null) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeUserJson(suffix: string, value: unknown): void {
  const key = userStorageKey(suffix)
  if (!key) return
  localStorage.setItem(key, JSON.stringify(value))
}
