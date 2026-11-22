import type { WorkoutFeedback } from '@/lib/feedback'
import { readUserJson, writeUserJson } from '@/lib/userStorage'

const LATENCY_MS = 600
const SUFFIX = 'feedback'

interface StoredFeedback extends WorkoutFeedback {
  submittedAt: string
}

function readStored(): StoredFeedback[] {
  const parsed = readUserJson<unknown>(SUFFIX, [])
  return Array.isArray(parsed) ? (parsed as StoredFeedback[]) : []
}

/**
 * Mock feedback endpoint: after a short delay the result is kept in
 * localStorage (a backend replaces this later). Pass `fail` (the page uses
 * `?state=submit-error`) to simulate a network error; nothing is saved then.
 */
export function submitFeedback(feedback: WorkoutFeedback, fail = false): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (fail) {
        reject(new Error('submit failed'))
        return
      }
      const entry: StoredFeedback = { ...feedback, submittedAt: new Date().toISOString() }
      writeUserJson(SUFFIX, [...readStored(), entry])
      resolve()
    }, LATENCY_MS)
  })
}
