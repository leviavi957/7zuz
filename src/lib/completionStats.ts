import { getTotalSeconds, type TimelineStep } from './workoutTimeline'

export interface CompletionStats {
  minutes: number
  /** Exercises that were started. */
  exercises: number
  /** Sets that were finished. */
  sets: number
}

/** What the user actually did, derived from the same timeline the player used. */
export function getCompletionStats(steps: TimelineStep[], completion: number): CompletionStats {
  const elapsed = (getTotalSeconds(steps) * completion) / 100
  const started = new Set<number>()
  let sets = 0
  let cursor = 0

  for (const step of steps) {
    if (cursor >= elapsed) break
    if (step.kind === 'work') {
      started.add(step.itemIndex)
      if (cursor + step.durationSeconds <= elapsed + 0.5) sets += 1
    }
    cursor += step.durationSeconds
  }

  return {
    minutes: elapsed > 0 ? Math.max(1, Math.round(elapsed / 60)) : 0,
    exercises: started.size,
    sets,
  }
}
