import { useCallback, useState } from 'react'

/** Boolean state mirrored to localStorage. `fallback` is used when nothing is stored. */
export function usePersistentFlag(
  key: string,
  fallback: () => boolean,
): [boolean, (next: boolean) => void] {
  const [value, setValue] = useState<boolean>(() => {
    const stored = localStorage.getItem(key)
    return stored === null ? fallback() : stored === 'true'
  })

  const update = useCallback(
    (next: boolean) => {
      setValue(next)
      localStorage.setItem(key, String(next))
    },
    [key],
  )

  return [value, update]
}

/** Number state mirrored to localStorage. `fallback` is used when nothing valid is stored. */
export function usePersistentNumber(
  key: string,
  fallback: number,
): [number, (next: number) => void] {
  const [value, setValue] = useState<number>(() => {
    const stored = Number(localStorage.getItem(key))
    return localStorage.getItem(key) === null || Number.isNaN(stored) ? fallback : stored
  })

  const update = useCallback(
    (next: number) => {
      setValue(next)
      localStorage.setItem(key, String(next))
    },
    [key],
  )

  return [value, update]
}
