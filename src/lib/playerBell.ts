import { readUserItem, writeUserItem } from '@/lib/userStorage'

const SUFFIX = 'playerBell'

/** Per-user workout-player bell toggle. On by default. */
export function isPlayerBellOn(): boolean {
  return readUserItem(SUFFIX) !== 'false'
}

export function setPlayerBellOn(on: boolean): void {
  writeUserItem(SUFFIX, String(on))
}
