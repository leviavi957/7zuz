import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Visibility that fades out after `delayMs` without activity.
 * `reveal` shows it and restarts the timer; `toggle` is for a tap.
 * While `locked` (e.g. a dialog is open) it never hides.
 */
export function useAutoHide(delayMs: number, locked: boolean) {
  const [visible, setVisible] = useState(true)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const lockedRef = useRef(locked)

  const startTimer = useCallback(() => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      if (!lockedRef.current) setVisible(false)
    }, delayMs)
  }, [delayMs])

  const reveal = useCallback(() => {
    setVisible(true)
    startTimer()
  }, [startTimer])

  const toggle = useCallback(() => {
    if (visible) {
      clearTimeout(timer.current)
      setVisible(false)
    } else {
      reveal()
    }
  }, [visible, reveal])

  useEffect(() => {
    lockedRef.current = locked
    if (!locked) startTimer()
    return () => clearTimeout(timer.current)
  }, [locked, startTimer])

  return { visible: visible || locked, reveal, toggle }
}
