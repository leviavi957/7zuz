import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DUCK_LEAD_MS,
  START_BELL_DELAY_MS,
} from '@/config/playerAudio'
import {
  bellStrikesMs,
  playFinishBell,
  playRestEndBell,
  playStartBell,
  playWorkEndBell,
  prefetchBellFile,
} from '@/lib/bellSounds'
import { isPlayerBellOn, setPlayerBellOn } from '@/lib/playerBell'
import { resumePlayerAudio } from '@/lib/playerAudioContext'
import type { TimelineStep } from '@/lib/workoutTimeline'

interface Options {
  steps: TimelineStep[]
  index: number
  /** Fractional seconds left in the current step (rate-aware). */
  remaining: number
  finished: boolean
  /** False while paused, exit dialog open, or buffering. */
  running: boolean
  duckDown?: () => void
  restoreUp?: () => void
}

/**
 * Bell cues + music ducking driven by the step timeline.
 * Boxing-ring bell at start, work→rest, rest→work, and finish (longer ring).
 */
export function usePlayerCues({
  steps,
  index,
  remaining,
  finished,
  running,
  duckDown,
  restoreUp,
}: Options) {
  const [enabled, setEnabledState] = useState(isPlayerBellOn)
  const prevIndexRef = useRef(index)
  const startBellPlayedRef = useRef(false)
  const finishPlayedRef = useRef(false)
  /** Step id for which the pre-bell duck has already started. */
  const duckedStepRef = useRef<string | null>(null)
  const skipRef = useRef(false)
  const restoreTimerRef = useRef<number | undefined>(undefined)
  const duckDownRef = useRef(duckDown)
  const restoreUpRef = useRef(restoreUp)
  duckDownRef.current = duckDown
  restoreUpRef.current = restoreUp

  const clearRestoreTimer = useCallback(() => {
    if (restoreTimerRef.current !== undefined) {
      window.clearTimeout(restoreTimerRef.current)
      restoreTimerRef.current = undefined
    }
  }, [])

  const scheduleRestore = useCallback(() => {
    clearRestoreTimer()
    restoreTimerRef.current = window.setTimeout(() => {
      restoreTimerRef.current = undefined
      restoreUpRef.current?.()
    }, bellStrikesMs())
  }, [clearRestoreTimer])

  const ring = useCallback((play: () => number) => {
    resumePlayerAudio()
    return play()
  }, [])

  useEffect(() => {
    prefetchBellFile()
    return () => clearRestoreTimer()
  }, [clearRestoreTimer])

  // Fallback: unlock audio on the first tap inside the player.
  useEffect(() => {
    const unlock = () => {
      resumePlayerAudio()
      prefetchBellFile()
    }
    document.addEventListener('pointerdown', unlock, { once: true })
    document.addEventListener('keydown', unlock, { once: true })
    return () => {
      document.removeEventListener('pointerdown', unlock)
      document.removeEventListener('keydown', unlock)
    }
  }, [])

  // Start bell: duck, ring, then restore after the strikes.
  useEffect(() => {
    if (!running || startBellPlayedRef.current) return
    if (!enabled) {
      startBellPlayedRef.current = true
      return
    }
    const id = window.setTimeout(() => {
      if (startBellPlayedRef.current) return
      startBellPlayedRef.current = true
      duckDownRef.current?.()
      ring(playStartBell)
      scheduleRestore()
    }, START_BELL_DELAY_MS)
    return () => window.clearTimeout(id)
  }, [running, enabled, ring, scheduleRestore])

  // Lead-in duck: 1s of real remaining time before a work-end / finish bell.
  useEffect(() => {
    const step = steps[index]
    if (!step || step.kind !== 'work' || !enabled || !running || finished) return

    const leadSec = DUCK_LEAD_MS / 1000
    const shortStep = step.durationSeconds <= leadSec
    const inLeadWindow = remaining > 0 && remaining <= leadSec

    if (!shortStep && !inLeadWindow) return
    if (duckedStepRef.current === step.id) return

    duckedStepRef.current = step.id
    duckDownRef.current?.()
  }, [steps, index, remaining, enabled, running, finished])

  const setEnabled = useCallback((next: boolean) => {
    setPlayerBellOn(next)
    setEnabledState(next)
  }, [])

  const toggle = useCallback(() => setEnabled(!enabled), [enabled, setEnabled])

  const markSkip = useCallback(() => {
    skipRef.current = true
  }, [])

  // Step transitions.
  useEffect(() => {
    const prev = prevIndexRef.current
    const wasSkip = skipRef.current
    if (wasSkip) skipRef.current = false

    const advanced = index !== prev || finished
    if (!advanced) {
      return
    }

    const prevStep = steps[prev]
    const nextStep = steps[index]
    const live = enabled && running

    if (!wasSkip && live && prevStep) {
      if (prevStep.kind === 'work' && finished && !finishPlayedRef.current) {
        finishPlayedRef.current = true
        clearRestoreTimer()
        ring(playFinishBell)
        // Stay low through the finish; leave/unmount restores.
      } else if (prevStep.kind === 'work' && nextStep?.kind === 'rest') {
        clearRestoreTimer()
        // Music should already be ducked from the lead-in; keep it low for the rest.
        if (duckedStepRef.current !== prevStep.id) duckDownRef.current?.()
        ring(playWorkEndBell)
      } else if (prevStep.kind === 'rest' && nextStep?.kind === 'work' && !finished) {
        clearRestoreTimer()
        ring(playRestEndBell)
        scheduleRestore()
      }
    } else if (wasSkip && live) {
      // Skipped step: no bell. Align duck with where we landed.
      clearRestoreTimer()
      if (nextStep?.kind === 'rest') duckDownRef.current?.()
      else if (nextStep?.kind === 'work' && !finished) restoreUpRef.current?.()
    }

    if (nextStep?.kind === 'work') duckedStepRef.current = null
    prevIndexRef.current = index
  }, [index, finished, steps, enabled, running, ring, scheduleRestore, clearRestoreTimer])

  return { enabled, toggle, markSkip }
}
