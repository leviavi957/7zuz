import { useEffect } from 'react'

interface Shortcuts {
  togglePlay: () => void
  /** Arrow keys follow reading direction: in RTL, left = next, right = previous. */
  next: () => void
  previous: () => void
  toggleFullscreen?: () => void
  openExit: () => void
  /** Called for every handled key, e.g. to reveal the controls. */
  onActivity: () => void
}

const NATIVE_KEY_TARGETS = new Set(['BUTTON', 'INPUT', 'SELECT', 'A'])

/** Space, arrows, F and Esc. Disabled while a dialog owns the keyboard. */
export function usePlayerShortcuts(shortcuts: Shortcuts, enabled: boolean) {
  const { togglePlay, next, previous, toggleFullscreen, openExit, onActivity } = shortcuts

  useEffect(() => {
    if (!enabled) return

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      const onNativeControl = NATIVE_KEY_TARGETS.has(target.tagName)
      onActivity()

      switch (event.key) {
        case ' ':
          if (onNativeControl) return
          event.preventDefault()
          togglePlay()
          break
        case 'ArrowLeft':
          if (target.tagName === 'INPUT') return
          next()
          break
        case 'ArrowRight':
          if (target.tagName === 'INPUT') return
          previous()
          break
        case 'f':
        case 'F':
          toggleFullscreen?.()
          break
        case 'Escape':
          openExit()
          break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled, togglePlay, next, previous, toggleFullscreen, openExit, onActivity])
}
