import type { WorkoutFeedback } from '@/lib/feedback'

const LATENCY_MS = 600
const STORAGE_KEY = '7zuz.feedback'

interface StoredFeedback extends WorkoutFeedback {
  submittedAt: string
}

function readStored(): StoredFeedback[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? (parsed as StoredFeedback[]) : []
  } catch {
    return []
  }
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...readStored(), entry]))
      resolve()
    }, LATENCY_MS)
  })
}
