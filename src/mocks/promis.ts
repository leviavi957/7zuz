import type { PromisAnswers, PromisEntry, PromisRound } from '@/lib/promis'
import { scorePromis } from '@/lib/promis'

const STORAGE_KEY = '7zuz.promis'
const LATENCY_MS = 400

function isEntry(value: unknown): value is PromisEntry {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    (item.round === 'baseline' || item.round === 'monthly') &&
    typeof item.total === 'number' &&
    typeof item.createdAt === 'string' &&
    typeof item.answers === 'object' &&
    item.answers !== null
  )
}

function read(): PromisEntry[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter(isEntry) : []
  } catch {
    return []
  }
}

function write(entries: PromisEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

/**
 * Mock PROMIS store. A backend can replace these later without touching the
 * screens. Pass `fail` (pages use `?state=error`) to simulate a network error.
 */
export function listPromis(fail = false): Promise<PromisEntry[]> {
  return new Promise((resolve, reject) => {
    setTimeout(() => (fail ? reject(new Error('list failed')) : resolve(read())), LATENCY_MS)
  })
}

export function savePromis(
  input: { round: PromisRound; answers: PromisAnswers },
  fail = false,
): Promise<PromisEntry> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (fail) {
        reject(new Error('save failed'))
        return
      }
      const entry: PromisEntry = {
        id: crypto.randomUUID(),
        round: input.round,
        answers: input.answers,
        total: scorePromis(input.answers),
        createdAt: new Date().toISOString(),
      }
      write([...read(), entry])
      resolve(entry)
    }, LATENCY_MS)
  })
}
