import type { WorkoutFeedback } from '@/lib/feedback'

const LATENCY_MS = 600

/**
 * Mock feedback endpoint. Pass `fail` (the page uses `?state=submit-error`)
 * to simulate a network error; otherwise it resolves after a short delay.
 */
export function submitFeedback(_feedback: WorkoutFeedback, fail = false): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => (fail ? reject(new Error('submit failed')) : resolve()), LATENCY_MS)
  })
}
