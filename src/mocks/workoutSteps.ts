import { expandItems, getTotalSeconds, type TimelineStep } from '@/lib/workoutTimeline'
import { getExercise } from './exercises'
import type { Workout } from './workouts'

/** The one place a workout is expanded, so every screen gets the same timeline. */
export function getWorkoutSteps(workout: Pick<Workout, 'items'>): TimelineStep[] {
  return expandItems(workout.items, getExercise)
}

export function getWorkoutSeconds(workout: Pick<Workout, 'items'>): number {
  return getTotalSeconds(getWorkoutSteps(workout))
}
