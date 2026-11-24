import { useCallback, useEffect, useReducer, useRef } from 'react'
import { getTotalSeconds, type TimelineStep } from '@/lib/workoutTimeline'

const TICK_MS = 100

interface State {
  index: number
  /** Seconds elapsed inside the current step. */
  elapsed: number
  finished: boolean
}

type Action =
  | { type: 'tick'; seconds: number }
  | { type: 'next' }
  | { type: 'previous' }

function createReducer(steps: TimelineStep[]) {
  const last = steps.length - 1

  return (state: State, action: Action): State => {
    if (state.finished) return state

    switch (action.type) {
      case 'tick': {
        let { index, elapsed } = state
        elapsed += action.seconds
        while (elapsed >= steps[index].durationSeconds) {
          if (index === last) return { index, elapsed: steps[index].durationSeconds, finished: true }
          elapsed -= steps[index].durationSeconds
          index += 1
        }
        return { index, elapsed, finished: false }
      }
      case 'next':
        return state.index === last
          ? { ...state, finished: true }
          : { index: state.index + 1, elapsed: 0, finished: false }
      case 'previous':
        return { index: Math.max(state.index - 1, 0), elapsed: 0, finished: false }
    }
  }
}

interface Options {
  steps: TimelineStep[]
  /** Speed multiplier; scales the timer. */
  rate: number
  running: boolean
  onFinish: () => void
}

/** Drives the timeline clock: current step, time in step and overall progress. */
export function useWorkoutPlayback({ steps, rate, running, onFinish }: Options) {
  const [state, dispatch] = useReducer(createReducer(steps), { index: 0, elapsed: 0, finished: false })
  const onFinishRef = useRef(onFinish)

  useEffect(() => {
    onFinishRef.current = onFinish
  }, [onFinish])

  useEffect(() => {
    if (!running || state.finished) return
    let last = performance.now()
    const id = setInterval(() => {
      const now = performance.now()
      dispatch({ type: 'tick', seconds: ((now - last) / 1000) * rate })
      last = now
    }, TICK_MS)
    return () => clearInterval(id)
  }, [running, state.finished, rate])

  useEffect(() => {
    if (state.finished) onFinishRef.current()
  }, [state.finished])

  const next = useCallback(() => dispatch({ type: 'next' }), [])
  const previous = useCallback(() => dispatch({ type: 'previous' }), [])

  const step = steps[state.index]
  const total = getTotalSeconds(steps)
  const doneBefore = steps.slice(0, state.index).reduce((sum, s) => sum + s.durationSeconds, 0)
  const overallElapsed = state.finished ? total : Math.min(doneBefore + state.elapsed, total)

  const remaining = Math.max(step.durationSeconds - state.elapsed, 0)

  return {
    index: state.index,
    step,
    /** Fractional seconds left in the step (rate-aware). */
    remaining,
    remainingSeconds: Math.max(Math.ceil(remaining), 0),
    overallElapsed,
    total,
    finished: state.finished,
    completion: total > 0 ? Math.min(Math.round((overallElapsed / total) * 100), 100) : 0,
    next,
    previous,
  }
}
