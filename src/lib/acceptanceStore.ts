import { readUserJson, writeUserJson } from '@/lib/userStorage'

/** A recorded acceptance of the health questionnaire and declaration. */
export interface Acceptance {
  /** ISO timestamp of the moment the user accepted. */
  acceptedAt: string
  /** The questionnaire version that was accepted. */
  version: number
}

/**
 * Where acceptances are kept. The API is async on purpose: swap this
 * implementation for a database-backed one later without touching callers.
 */
export interface AcceptanceStore {
  get(): Promise<Acceptance | null>
  save(acceptance: Acceptance): Promise<void>
}

const SUFFIX = 'healthAcceptance'

function isAcceptance(value: unknown): value is Acceptance {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return typeof item.acceptedAt === 'string' && typeof item.version === 'number'
}

export const acceptanceStore: AcceptanceStore = {
  async get() {
    const parsed = readUserJson<unknown>(SUFFIX, null)
    return isAcceptance(parsed) ? parsed : null
  },
  async save(acceptance) {
    writeUserJson(SUFFIX, acceptance)
  },
}
