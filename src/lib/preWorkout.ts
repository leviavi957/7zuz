import { acceptanceStore, type Acceptance } from '@/lib/acceptanceStore'

/**
 * Current version of the questionnaire and declaration wording. Raise it when
 * the wording changes in substance: everyone is then asked again.
 */
export const QUESTIONNAIRE_VERSION = 1

/** An acceptance older than this many days has to be given again. */
export const ACCEPTANCE_MAX_AGE_DAYS = 90

const DAY_MS = 24 * 60 * 60 * 1000

/** True when the stored acceptance is for the current version and recent enough. */
export function isAcceptanceValid(acceptance: Acceptance | null, now: Date = new Date()): boolean {
  if (!acceptance || acceptance.version < QUESTIONNAIRE_VERSION) return false
  const age = now.getTime() - new Date(acceptance.acceptedAt).getTime()
  // An unreadable or future timestamp is not trusted.
  return Number.isFinite(age) && age >= 0 && age <= ACCEPTANCE_MAX_AGE_DAYS * DAY_MS
}

/** Whether the questionnaire must be shown before the next workout. */
export async function needsQuestionnaire(): Promise<boolean> {
  return !isAcceptanceValid(await acceptanceStore.get())
}

/** Records an acceptance of the current questionnaire version, as of now. */
export async function recordAcceptance(): Promise<void> {
  await acceptanceStore.save({ acceptedAt: new Date().toISOString(), version: QUESTIONNAIRE_VERSION })
}
