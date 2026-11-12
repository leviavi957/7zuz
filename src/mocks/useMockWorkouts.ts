import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { WORKOUTS, type Workout } from './workouts'

export type WorkoutsStatus = 'loading' | 'ready' | 'error'

/**
 * Mock data source. Add `?state=loading|empty|error` to the URL to preview
 * each state; otherwise it shows a short skeleton and then the data.
 * `retry` clears the forced state.
 */
export function useMockWorkouts(): {
  status: WorkoutsStatus
  workouts: Workout[]
  retry: () => void
} {
  const [params, setParams] = useSearchParams()
  const [loaded, setLoaded] = useState(false)
  const forced = params.get('state')

  useEffect(() => {
    const id = setTimeout(() => setLoaded(true), 500)
    return () => clearTimeout(id)
  }, [])

  const retry = useCallback(() => setParams({}), [setParams])

  let status: WorkoutsStatus = 'ready'
  if (forced === 'error') status = 'error'
  else if (forced === 'loading' || !loaded) status = 'loading'

  return { status, workouts: forced === 'empty' ? [] : WORKOUTS, retry }
}
