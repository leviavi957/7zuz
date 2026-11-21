import { getTodaysWorkoutId } from '@/mocks/todaysWorkout'

/** Message type the service worker sends when a notification is clicked. */
export const OPEN_URL_MESSAGE = 'open-url'

/** Window event used when the plain `Notification` fallback is clicked (no service worker). */
export const OPEN_URL_EVENT = '7zuz:open-url'

/** Where a reminder notification leads: the player of today's workout. */
export function reminderTargetUrl(): string {
  return `/workouts/${getTodaysWorkoutId()}/play?from=reminder`
}

/** Only in-app paths may be navigated to from a notification. */
export function isAppPath(url: unknown): url is string {
  return typeof url === 'string' && url.startsWith('/') && !url.startsWith('//')
}
