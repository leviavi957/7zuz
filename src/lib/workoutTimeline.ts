/**
 * Workout structure model. A workout is an ordered list of items that
 * reference library exercises by id. `expandItems` turns it into one flat
 * timeline of work and rest steps; the detail screen and the player both
 * use it, so they always agree.
 */

import type { WorkoutCategory } from '@/mocks/workouts'

/** A ready-made clip of an avatar performing one exercise. */
export interface Exercise {
  id: string
  name: string
  description: string
  category: WorkoutCategory
  /** Silent clip. Optional until real videos exist. */
  videoSrc?: string
  posterSrc?: string
  defaultDurationSeconds: number
}

/** Used when an item omits `restSeconds`. */
export const DEFAULT_REST_SECONDS = 10

export interface WorkoutItem {
  exerciseId: string
  /** Length of one set. Falls back to the exercise's default. */
  durationSeconds?: number
  sets: number
  /** Rest after each set (also before the next exercise). Defaults to 10. */
  restSeconds?: number
}

export type ExerciseLookup = (id: string) => Exercise | undefined

/** What a step needs from its exercise (a missing exercise gets a stand-in). */
export type StepExercise = Pick<Exercise, 'id' | 'name' | 'videoSrc' | 'posterSrc'> & {
  category?: WorkoutCategory
}

export type StepKind = 'work' | 'rest'

export interface TimelineStep {
  id: string
  kind: StepKind
  /** For a rest step: the exercise that comes next. */
  exercise: StepExercise
  durationSeconds: number
  itemIndex: number
  /** 1-based. For a rest step: the upcoming set. */
  setNumber: number
  totalSets: number
}

export const MISSING_EXERCISE_NAME = 'תרגיל לא זמין'
export const FALLBACK_STEP_SECONDS = 30

function resolveItem(item: WorkoutItem, lookup: ExerciseLookup) {
  const found = lookup(item.exerciseId)
  const exercise: StepExercise = found
    ? {
        id: found.id,
        name: found.name,
        videoSrc: found.videoSrc,
        posterSrc: found.posterSrc,
        category: found.category,
      }
    : { id: item.exerciseId, name: MISSING_EXERCISE_NAME }

  return {
    exercise,
    durationSeconds:
      item.durationSeconds ?? found?.defaultDurationSeconds ?? FALLBACK_STEP_SECONDS,
  }
}

/** Flat, ordered timeline: work, rest, work, rest... (no trailing rest). */
export function expandItems(items: WorkoutItem[], lookup: ExerciseLookup): TimelineStep[] {
  const steps: TimelineStep[] = []

  items.forEach((item, itemIndex) => {
    const { exercise, durationSeconds } = resolveItem(item, lookup)

    const restSeconds = item.restSeconds ?? DEFAULT_REST_SECONDS

    for (let set = 1; set <= item.sets; set += 1) {
      const base = { exercise, itemIndex, setNumber: set, totalSets: item.sets }
      steps.push({ ...base, id: `${itemIndex}-${set}-work`, kind: 'work', durationSeconds })
      if (restSeconds > 0) {
        steps.push({
          ...base,
          id: `${itemIndex}-${set}-rest`,
          kind: 'rest',
          durationSeconds: restSeconds,
        })
      }
    }
  })

  if (steps.at(-1)?.kind === 'rest') steps.pop()

  // A rest step describes what is coming up next.
  return steps.map((step, i) => {
    const upcoming = steps[i + 1]
    if (step.kind !== 'rest' || !upcoming) return step
    return {
      ...step,
      exercise: upcoming.exercise,
      itemIndex: upcoming.itemIndex,
      setNumber: upcoming.setNumber,
      totalSets: upcoming.totalSets,
    }
  })
}

export function getTotalSeconds(steps: TimelineStep[]): number {
  return steps.reduce((sum, step) => sum + step.durationSeconds, 0)
}

export function findNextWorkStep(steps: TimelineStep[], index: number): TimelineStep | undefined {
  return steps.slice(index + 1).find((step) => step.kind === 'work')
}

export interface ItemSummary {
  exercise: StepExercise
  sets: number
  workSeconds: number
  /** Rest after each set; 0 when there is none. */
  restSeconds: number
  /** True when a rest separates this exercise from the next one. */
  restAfter: boolean
}

/** One row per workout item, derived from the timeline (for display). */
export function summarizeTimeline(steps: TimelineStep[]): ItemSummary[] {
  const rows: ItemSummary[] = []

  steps.forEach((step, i) => {
    if (step.kind === 'work') {
      const row = rows[step.itemIndex]
      if (row) row.sets += 1
      else
        rows[step.itemIndex] = {
          exercise: step.exercise,
          sets: 1,
          workSeconds: step.durationSeconds,
          restSeconds: 0,
          restAfter: false,
        }
      return
    }
    // A rest belongs to the exercise that precedes it.
    const previous = steps[i - 1]
    const row = rows[previous.itemIndex]
    row.restSeconds = step.durationSeconds
    if (steps[i + 1].itemIndex !== previous.itemIndex) row.restAfter = true
  })

  return rows
}

export function formatMinutes(seconds: number): number {
  return Math.max(1, Math.round(seconds / 60))
}

export function formatSeconds(seconds: number): string {
  if (seconds >= 60 && seconds % 60 === 0) {
    const minutes = seconds / 60
    return minutes === 1 ? 'דקה' : `${minutes} דקות`
  }
  return `${seconds} שניות`
}
