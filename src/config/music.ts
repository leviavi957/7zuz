/**
 * Background music for the whole app: one fixed track, the same in every
 * workout. The file must be a licensed or royalty-free track provided by the
 * client (never an unlicensed download). Later the trainer panel should make
 * this configurable; a workout may also override it with its own `musicSrc`.
 * Leave `src` empty (or the file missing) and the music toggle is disabled.
 */
export const MUSIC = {
  src: '/audio/background.mp3',
  fadeInMs: 1500,
  fadeOutMs: 800,
  /** Short fade when resuming after a pause or turning the music back on. */
  resumeFadeMs: 300,
  /** Volume multiplier while the tab is hidden. */
  hiddenVolumeFactor: 0.5,
  defaultVolume: 60,
} as const
