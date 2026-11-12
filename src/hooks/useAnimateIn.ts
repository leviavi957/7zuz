import { useEffect, useState } from 'react'

/** Flips to true one frame after mount, so fills can transition in exactly once. */
export function useAnimateIn(): boolean {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return ready
}
