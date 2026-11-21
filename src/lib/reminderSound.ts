/** localStorage key of the "reminder sound" setting. On unless explicitly switched off. */
export const REMINDER_SOUND_KEY = '7zuz.reminderSound'

const CHIME_SRC = '/audio/reminder-chime.wav'
const CHIME_VOLUME = 0.5

export function isReminderSoundOn(): boolean {
  return localStorage.getItem(REMINDER_SOUND_KEY) !== 'false'
}

/** Placeholder tone, used only when the chime file cannot be loaded. */
function playTone(): void {
  try {
    const context = new AudioContext()
    const gain = context.createGain()
    gain.connect(context.destination)
    gain.gain.setValueAtTime(0.0001, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.2, context.currentTime + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 1)
    for (const [index, frequency] of [659.25, 880].entries()) {
      const oscillator = context.createOscillator()
      oscillator.frequency.value = frequency
      oscillator.connect(gain)
      oscillator.start(context.currentTime + index * 0.25)
      oscillator.stop(context.currentTime + 1)
    }
    window.setTimeout(() => void context.close(), 1500)
  } catch {
    // Sound is a nicety: never let it break a reminder.
  }
}

/**
 * Plays a short, soft chime when the setting is on and the tab is visible.
 * With the tab hidden the operating system decides how the notification
 * sounds, so nothing is forced here. Browser autoplay rules may block it: that
 * fails silently.
 */
export function playChime(): void {
  if (!isReminderSoundOn() || document.visibilityState !== 'visible') return
  try {
    const audio = new Audio(CHIME_SRC)
    audio.volume = CHIME_VOLUME
    audio.addEventListener('error', playTone, { once: true })
    audio.play().catch(() => undefined)
  } catch {
    // Same as above.
  }
}
