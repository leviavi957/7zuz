import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { WORKOUTS, type Workout } from './workouts'

export type WorkoutStatus = 'loading' | 'ready' | 'error' | 'notFound'

/**
 * Mock single-workout source. `?state=loading|error` forces those states.
 * `retry` clears the forced state.
 */
export function useMockWorkout(id: string | undefined): {
  status: WorkoutStatus
  workout: Workout | undefined
  retry: () => void
} {
  const [params, setParams] = useSearchParams()
  const [loaded, setLoaded] = useState(false)
  const forced = params.get('state')

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const retry = useCallback(() => setParams({}), [setParams])

  const workout = WORKOUTS.find((w) => w.id === id)
  let status: WorkoutStatus = workout ? 'ready' : 'notFound'
  if (forced === 'error') status = 'error'
  else if (forced === 'loading' || !loaded) status = 'loading'

  return { status, workout, retry }
}
