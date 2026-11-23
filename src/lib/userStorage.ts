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

function userPrefix(): string | null {
  const session = getSessionSnapshot()
  if (!session) return null
  return `7zuz.${session.userId}.`
}

/** Every namespaced mock entry for the signed-in user, keyed by suffix. */
export function readUserEntries(): Record<string, unknown> {
  const prefix = userPrefix()
  if (!prefix) return {}
  const entries: Record<string, unknown> = {}
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)
    if (!key?.startsWith(prefix)) continue
    const raw = localStorage.getItem(key)
    if (raw === null) continue
    try {
      entries[key.slice(prefix.length)] = JSON.parse(raw) as unknown
    } catch {
      entries[key.slice(prefix.length)] = raw
    }
  }
  return entries
}

/** Removes namespaced mock keys for the signed-in user. Global theme and session stay. */
export function clearUserEntries(): void {
  const prefix = userPrefix()
  if (!prefix) return
  const keys: string[] = []
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)
    if (key?.startsWith(prefix)) keys.push(key)
  }
  for (const key of keys) localStorage.removeItem(key)
}
