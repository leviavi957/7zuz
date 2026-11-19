import { useCallback, useEffect, useState, type RefObject } from 'react'

/** Fullscreen for one element. Only ever entered from an explicit `toggle` call. */
export function useFullscreen(ref: RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const supported = typeof document !== 'undefined' && document.fullscreenEnabled

  useEffect(() => {
    const sync = () => setIsFullscreen(document.fullscreenElement === ref.current)
    document.addEventListener('fullscreenchange', sync)
    return () => {
      document.removeEventListener('fullscreenchange', sync)
      if (document.fullscreenElement) void document.exitFullscreen()
    }
  }, [ref])

  const toggle = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void ref.current?.requestFullscreen()
  }, [ref])

  return { isFullscreen, supported, toggle }
}
