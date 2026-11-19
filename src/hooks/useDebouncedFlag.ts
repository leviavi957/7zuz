import { useEffect, useState } from 'react'

/** Becomes true only after `value` has stayed true for `delayMs`; false immediately. */
export function useDebouncedFlag(value: boolean, delayMs: number): boolean {
  const [elapsed, setElapsed] = useState(false)

  useEffect(() => {
    if (!value) return
    const id = setTimeout(() => setElapsed(true), delayMs)
    return () => {
      clearTimeout(id)
      setElapsed(false)
    }
  }, [value, delayMs])

  return value && elapsed
}
