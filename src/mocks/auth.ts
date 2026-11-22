import type { Role } from '@/lib/auth'

/**
 * Demo accounts (password for all emails: Demo1234!):
 * - demo@7zuz.co → employee
 * - trainer@7zuz.co → trainer (can open /admin and /org)
 * - manager@7zuz.co → org_manager (HR dashboard at /org)
 *
 * Demo personal codes (case-insensitive; display as XXXX-XXXX):
 * - ABCD-2345 → team participant
 * - WXYZ-7892 → team participant
 */

/** Alphabet without 0/O, 1/I/L — case-insensitive codes. */
export const CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'

export interface DemoEmailUser {
  id: string
  email: string
  password: string
  displayName: string
  role: Role
}

export interface DemoCodeUser {
  id: string
  /** Normalized uppercase 8 chars, no hyphen. */
  code: string
  role: Role
}

export const DEMO_EMAIL_USERS: DemoEmailUser[] = [
  {
    id: 'user-demo',
    email: 'demo@7zuz.co',
    password: 'Demo1234!',
    displayName: 'דמו עובד/ת',
    role: 'employee',
  },
  {
    id: 'user-trainer',
    email: 'trainer@7zuz.co',
    password: 'Demo1234!',
    displayName: 'דמו מאמן/ת',
    role: 'trainer',
  },
  {
    id: 'user-manager',
    email: 'manager@7zuz.co',
    password: 'Demo1234!',
    displayName: 'דמו מנהל/ת',
    role: 'org_manager',
  },
]

export const DEMO_CODE_USERS: DemoCodeUser[] = [
  { id: 'code-abcd', code: 'ABCD2345', role: 'team' },
  { id: 'code-wxyz', code: 'WXYZ7892', role: 'team' },
]

export const DEMO_GOOGLE_USER: DemoEmailUser = {
  id: 'user-google',
  email: 'google.demo@7zuz.co',
  password: '',
  displayName: 'דמו Google',
  role: 'employee',
}
