/**
 * Shared AudioContext for workout bells (and music ducking). Created/resumed
 * inside a user gesture (התחלת אימון / questionnaire confirm) so it is not
 * stuck suspended after navigation into the Player.
 */

let shared: AudioContext | null = null

export function getPlayerAudioContext(): AudioContext {
  if (!shared || shared.state === 'closed') {
    shared = new AudioContext()
  }
  return shared
}

/** Call synchronously inside a click/tap that starts the player. */
export function resumePlayerAudio(): void {
  try {
    void getPlayerAudioContext().resume()
  } catch {
    // Audio is optional.
  }
}
