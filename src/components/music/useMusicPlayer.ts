import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { MUSIC } from '@/config/music'
import { DUCK_DOWN_MS, RESTORE_MS, REST_MUSIC_LEVEL } from '@/config/playerAudio'
import { usePersistentFlag, usePersistentNumber } from '@/hooks/usePersistentState'
import { getPlayerAudioContext, resumePlayerAudio } from '@/lib/playerAudioContext'

const FADE_STEP_MS = 40

/** Linear volume fade on the element. Uses a timer so it finishes in a hidden tab. */
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
  /** Ease music down to REST_MUSIC_LEVEL (no-op when music is off). */
  duckDown: () => void
  /** Ease music back to the user's full level. */
  restoreUp: () => void
}

interface Options {
  /** Track to play: a workout's own `musicSrc`, else the app-wide one. */
  src?: string
  /** True while the workout is running (not paused, no dialog open). */
  playing: boolean
}

/**
 * Looping background music for the player. Ducking uses a GainNode on the
 * shared AudioContext so the track never stops or restarts — only its level moves.
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
  const duckGainRef = useRef<GainNode | null>(null)
  const cancelFadeRef = useRef<() => void>(undefined)
  const startedRef = useRef(false)
  const enabledRef = useRef(enabled)
  const playingRef = useRef(playing)
  enabledRef.current = enabled
  playingRef.current = playing

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

    let source: MediaElementAudioSourceNode | null = null
    let duckGain: GainNode | null = null
    try {
      const context = getPlayerAudioContext()
      source = context.createMediaElementSource(audio)
      duckGain = context.createGain()
      duckGain.gain.value = 1
      source.connect(duckGain)
      duckGain.connect(context.destination)
      duckGainRef.current = duckGain
    } catch {
      duckGainRef.current = null
    }

    return () => {
      cancelFadeRef.current?.()
      audioRef.current = null
      duckGainRef.current = null
      try {
        duckGain?.disconnect()
        source?.disconnect()
      } catch {
        // Already disconnected.
      }
      if (audio.paused) return
      fadeAudio(audio, 0, MUSIC.fadeOutMs, () => audio.pause())
    }
  }, [src])

  const level = (volume / 100) * (hidden ? MUSIC.hiddenVolumeFactor : 1)

  const rampDuck = useCallback((target: number, ms: number) => {
    const gain = duckGainRef.current
    if (!gain) return
    try {
      const context = getPlayerAudioContext()
      const now = context.currentTime
      const seconds = Math.max(ms, 1) / 1000
      gain.gain.cancelScheduledValues(now)
      gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), now)
      gain.gain.linearRampToValueAtTime(Math.max(target, 0.0001), now + seconds)
    } catch {
      // Ducking is optional.
    }
  }, [])

  // When music is off or paused, clear any duck so resume starts clean.
  useEffect(() => {
    if (!enabled || !playing) rampDuck(1, RESTORE_MS)
  }, [enabled, playing, rampDuck])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !available) return

    if (!enabled || !playing) {
      cancelFadeRef.current?.()
      audio.pause()
      return
    }

    resumePlayerAudio()

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

  const duckDown = useCallback(() => {
    if (!enabledRef.current || !playingRef.current) return
    rampDuck(REST_MUSIC_LEVEL, DUCK_DOWN_MS)
  }, [rampDuck])

  const restoreUp = useCallback(() => {
    if (!enabledRef.current) return
    rampDuck(1, RESTORE_MS)
  }, [rampDuck])

  return { available, enabled, volume, blocked, start, toggle, setVolume, duckDown, restoreUp }
}
