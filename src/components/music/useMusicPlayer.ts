import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { MUSIC } from '@/config/music'
import { usePersistentFlag, usePersistentNumber } from '@/hooks/usePersistentState'

const FADE_STEP_MS = 40

/** Linear volume fade. Uses a timer (not rAF) so it also finishes in a hidden tab. */
function fadeAudio(audio: HTMLAudioElement, target: number, ms: number, onDone?: () => void) {
  const from = audio.volume
  const startedAt = performance.now()
  const id = setInterval(() => {
    const progress = Math.min((performance.now() - startedAt) / ms, 1)
    audio.volume = Math.min(Math.max(from + (target - from) * progress, 0), 1)
    if (progress === 1) {
      clearInterval(id)
      onDone?.()
    }
  }, FADE_STEP_MS)
  return () => clearInterval(id)
}

function subscribeVisibility(onChange: () => void) {
  document.addEventListener('visibilitychange', onChange)
  return () => document.removeEventListener('visibilitychange', onChange)
}
const isTabHidden = () => document.visibilityState === 'hidden'

export interface MusicPlayer {
  /** False when there is no track or the file could not be loaded. */
  available: boolean
  enabled: boolean
  /** 0-100. */
  volume: number
  /** True when the browser blocked autoplay: start then needs a tap. */
  blocked: boolean
  /** Retries playback from a user gesture. */
  start: () => void
  toggle: () => void
  setVolume: (volume: number) => void
}

interface Options {
  /** Track to play: a workout's own `musicSrc`, else the app-wide one. */
  src?: string
  /** True while the workout is running (not paused, no dialog open). */
  playing: boolean
}

/**
 * Looping background music for the player. It starts when the player opens
 * (the user's tap on "התחלת אימון" counts as the required gesture), follows
 * the workout's play/pause, and fades out when the player is left.
 */
export function useMusicPlayer({ src = MUSIC.src, playing }: Options): MusicPlayer {
  const [enabled, setEnabled] = usePersistentFlag('7zuz.music.enabled', () => true)
  const [volume, setVolume] = usePersistentNumber('7zuz.music.volume', MUSIC.defaultVolume)
  const [failedSrc, setFailedSrc] = useState<string>()
  const [gestureRetry, setGestureRetry] = useState(0)
  const [blocked, setBlocked] = useState(false)
  const hidden = useSyncExternalStore(subscribeVisibility, isTabHidden)

  const available = Boolean(src) && failedSrc !== src
  const audioRef = useRef<HTMLAudioElement>(null)
  const cancelFadeRef = useRef<() => void>(undefined)
  const startedRef = useRef(false)

  // The audio element lives as long as the track; leaving the player fades it out.
  useEffect(() => {
    if (!src) return
    const audio = new Audio(src)
    audio.loop = true
    audio.preload = 'auto'
    audio.volume = 0
    audio.addEventListener('error', () => setFailedSrc(src))
    audioRef.current = audio
    startedRef.current = false

    return () => {
      cancelFadeRef.current?.()
      audioRef.current = null
      if (audio.paused) return
      fadeAudio(audio, 0, MUSIC.fadeOutMs, () => audio.pause())
    }
  }, [src])

  const level = (volume / 100) * (hidden ? MUSIC.hiddenVolumeFactor : 1)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !available) return

    if (!enabled || !playing) {
      cancelFadeRef.current?.()
      audio.pause()
      return
    }

    if (!audio.paused) {
      cancelFadeRef.current?.()
      cancelFadeRef.current = fadeAudio(audio, level, 150)
      return
    }

    const fadeMs = startedRef.current ? MUSIC.resumeFadeMs : MUSIC.fadeInMs
    audio.volume = 0
    audio
      .play()
      .then(() => {
        startedRef.current = true
        setBlocked(false)
        cancelFadeRef.current?.()
        cancelFadeRef.current = fadeAudio(audio, level, fadeMs)
      })
      .catch((error: unknown) => {
        // Autoplay was blocked (for example a direct page load): retry on the next gesture.
        if (error instanceof DOMException && error.name === 'NotAllowedError') {
          setBlocked(true)
          const retry = () => setGestureRetry((count) => count + 1)
          document.addEventListener('pointerdown', retry, { once: true })
          document.addEventListener('keydown', retry, { once: true })
        }
      })
  }, [available, enabled, playing, level, src, gestureRetry])

  const toggle = useCallback(() => setEnabled(!enabled), [enabled, setEnabled])

  const start = useCallback(() => setGestureRetry((count) => count + 1), [])

  return { available, enabled, volume, blocked, start, toggle, setVolume }
}
