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
