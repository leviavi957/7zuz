/**
 * Boxing-ring bell for workout cues (Web Audio). Prefer BELL_SRC when the
 * file loads; otherwise synthesize three metallic strikes through the limiter.
 */

import {
  BELL_GAIN,
  BELL_SRC,
  FINISH_RING_OUT_MS,
  RING_OUT_MS,
  STRIKE_COUNT,
  STRIKE_SPACING_MS,
} from '@/config/playerAudio'
import { getPlayerAudioContext } from '@/lib/playerAudioContext'

const FUNDAMENTAL_HZ = 900
/** Inharmonic metallic partials relative to the fundamental. */
const PARTIAL_RATIOS = [1, 2.76, 5.4, 8.9] as const
const PARTIAL_GAINS = [1, 0.55, 0.28, 0.14] as const

let limiter: DynamicsCompressorNode | null = null
let shelf: BiquadFilterNode | null = null
/** Decoded file buffer; `undefined` until the first load attempt finishes. */
let fileBuffer: AudioBuffer | null | undefined
let fileLoad: Promise<AudioBuffer | null> | null = null

function getBellBus(context: AudioContext): AudioNode {
  if (!limiter || limiter.context !== context) {
    shelf = context.createBiquadFilter()
    shelf.type = 'highshelf'
    shelf.frequency.value = 3200
    shelf.gain.value = 5

    limiter = context.createDynamicsCompressor()
    limiter.threshold.value = -18
    limiter.knee.value = 10
    limiter.ratio.value = 6
    limiter.attack.value = 0.003
    limiter.release.value = 0.2

    shelf.connect(limiter)
    limiter.connect(context.destination)
  }
  return shelf!
}

function strikeDurationMs(finish: boolean): number {
  const ring = finish ? FINISH_RING_OUT_MS : RING_OUT_MS
  return (STRIKE_COUNT - 1) * STRIKE_SPACING_MS + ring
}

/** Time from first strike to the last strike onset (when restore may begin). */
export function bellStrikesMs(): number {
  return (STRIKE_COUNT - 1) * STRIKE_SPACING_MS
}

export function bellDurationMs(finish = false): number {
  return strikeDurationMs(finish)
}

function playNoiseClang(
  context: AudioContext,
  destination: AudioNode,
  when: number,
  peak: number,
) {
  const duration = 0.035
  const frames = Math.max(1, Math.floor(context.sampleRate * duration))
  const buffer = context.createBuffer(1, frames, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < frames; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames)
  }
  const source = context.createBufferSource()
  source.buffer = buffer
  const filter = context.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 4500
  filter.Q.value = 0.7
  const gain = context.createGain()
  gain.gain.setValueAtTime(peak * 0.45, when)
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration)
  source.connect(filter)
  filter.connect(gain)
  gain.connect(destination)
  source.start(when)
  source.stop(when + duration)
}

function playMetallicStrike(
  context: AudioContext,
  destination: AudioNode,
  when: number,
  ringOut: number,
  peak: number,
) {
  playNoiseClang(context, destination, when, peak)

  PARTIAL_RATIOS.forEach((ratio, index) => {
    const oscillator = context.createOscillator()
    oscillator.type = 'sine'
    oscillator.frequency.value = FUNDAMENTAL_HZ * ratio
    const gain = context.createGain()
    const level = peak * PARTIAL_GAINS[index]
    gain.gain.setValueAtTime(0.0001, when)
    gain.gain.exponentialRampToValueAtTime(Math.max(level, 0.0001), when + 0.004)
    gain.gain.exponentialRampToValueAtTime(0.0001, when + ringOut)
    oscillator.connect(gain)
    gain.connect(destination)
    oscillator.start(when)
    oscillator.stop(when + ringOut + 0.02)
  })
}

function playSynthesizedBell(finish: boolean): number {
  const context = getPlayerAudioContext()
  const bus = getBellBus(context)
  const now = context.currentTime
  const ringOut = (finish ? FINISH_RING_OUT_MS : RING_OUT_MS) / 1000
  const spacing = STRIKE_SPACING_MS / 1000
  const peak = finish ? BELL_GAIN * 0.9 : BELL_GAIN

  for (let strike = 0; strike < STRIKE_COUNT; strike += 1) {
    playMetallicStrike(context, bus, now + strike * spacing, ringOut, peak)
  }
  return strikeDurationMs(finish)
}

async function loadBellFile(): Promise<AudioBuffer | null> {
  if (fileBuffer !== undefined) return fileBuffer
  if (fileLoad) return fileLoad
  if (!BELL_SRC) {
    fileBuffer = null
    return null
  }
  fileLoad = (async () => {
    try {
      const response = await fetch(BELL_SRC)
      if (!response.ok) {
        fileBuffer = null
        return null
      }
      const context = getPlayerAudioContext()
      fileBuffer = await context.decodeAudioData(await response.arrayBuffer())
      return fileBuffer
    } catch {
      fileBuffer = null
      return null
    } finally {
      fileLoad = null
    }
  })()
  return fileLoad
}

/** Kick off a background load so the first ring can use the file when present. */
export function prefetchBellFile(): void {
  void loadBellFile()
}

function playFileBell(buffer: AudioBuffer, finish: boolean): number {
  const context = getPlayerAudioContext()
  const bus = getBellBus(context)
  const source = context.createBufferSource()
  source.buffer = buffer
  const gain = context.createGain()
  gain.gain.value = finish ? BELL_GAIN * 0.9 : BELL_GAIN
  source.connect(gain)
  gain.connect(bus)
  source.start()
  const durationMs = Math.max(buffer.duration * 1000, strikeDurationMs(finish))
  return finish ? Math.max(durationMs, FINISH_RING_OUT_MS) : durationMs
}

/**
 * One boxing-ring cue. Returns total audible duration in ms.
 * Uses BELL_SRC when already decoded; otherwise synthesizes.
 */
export function playBoxingBell(finish = false): number {
  try {
    if (fileBuffer) return playFileBell(fileBuffer, finish)
    void loadBellFile()
    return playSynthesizedBell(finish)
  } catch {
    return strikeDurationMs(finish)
  }
}

export function playStartBell(): number {
  return playBoxingBell(false)
}

export function playWorkEndBell(): number {
  return playBoxingBell(false)
}

export function playRestEndBell(): number {
  return playBoxingBell(false)
}

export function playFinishBell(): number {
  return playBoxingBell(true)
}
