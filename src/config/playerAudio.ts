/**
 * Tunable player-audio: boxing-bell synthesis and music ducking.
 * Gain values are Web Audio units (bells go through the master limiter).
 */

/** Prefer this file when it exists; otherwise the synthesized ring is used. */
export const BELL_SRC = '/audio/bell.mp3'

/** Music level while ducked / during rest, as a fraction of the user's volume. */
export const REST_MUSIC_LEVEL = 0.25

/** Start easing the music down this many ms before a work-end / finish bell. */
export const DUCK_LEAD_MS = 1000

/** Ease music down to REST_MUSIC_LEVEL over this many ms. */
export const DUCK_DOWN_MS = 700

/** Ease music back to the user's volume after a rest-end / start bell. */
export const RESTORE_MS = 1500

/** Gap between boxing-bell strikes. */
export const STRIKE_SPACING_MS = 200

/** Number of strikes in one ring. */
export const STRIKE_COUNT = 3

/** Exponential ring-out of each strike (normal cues). */
export const RING_OUT_MS = 1500

/** Longer ring-out for the finish bell. */
export const FINISH_RING_OUT_MS = 2200

/** Peak gain for a strike (before the master limiter). */
export const BELL_GAIN = 0.62

/** Delay after playback is running before the start bell. */
export const START_BELL_DELAY_MS = 250
