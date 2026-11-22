import { useSyncExternalStore } from 'react'
import { getSessionSnapshot, subscribeAuth, type Session } from '@/lib/auth'

/** Live session from the mock auth store. */
export function useSession(): Session | null {
  return useSyncExternalStore(subscribeAuth, getSessionSnapshot, () => null)
}
