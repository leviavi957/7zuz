import {
  CODE_ALPHABET,
  DEMO_CODE_USERS,
  DEMO_EMAIL_USERS,
  DEMO_GOOGLE_USER,
  type DemoEmailUser,
} from '@/mocks/auth'

export type Role = 'employee' | 'org_manager' | 'trainer' | 'team'
export type LoginType = 'email' | 'code'

/** Roles that train (workouts, health/PROMIS onboarding). Code users are `team`. */
export function isTrainingRole(role: Role | null | undefined): boolean {
  return role === 'employee' || role === 'team'
}

/** Workouts list/detail/player: employees, team, and trainers (preview). */
export function canAccessWorkouts(role: Role | null | undefined): boolean {
  return isTrainingRole(role) || role === 'trainer'
}

/** Trainer opens workouts in preview — no questionnaire, feedback, or session save. */
export function isTrainerPreview(role: Role | null | undefined): boolean {
  return role === 'trainer'
}

/** Landing path after auth for the role (trainer uses /org until /admin exists). */
export function roleHomePath(role: Role | null | undefined): string {
  if (role === 'org_manager' || role === 'trainer') return '/org'
  return '/'
}

export interface Session {
  userId: string
  role: Role
  loginType: LoginType
  displayName: string
}

export type AuthErrorCode = 'invalid_credentials' | 'locked' | 'validation'

export class AuthError extends Error {
  readonly code: AuthErrorCode

  constructor(code: AuthErrorCode, message: string) {
    super(message)
    this.name = 'AuthError'
    this.code = code
  }
}

const SESSION_KEY = '7zuz.session'
const USERS_KEY = '7zuz.registeredUsers'
const FAIL_KEY = '7zuz.authFailCount'
const LOCK_KEY = '7zuz.authLockedUntil'
const LATENCY_MS = 450
const MAX_FAILURES = 5
const LOCKOUT_MS = 60_000

type Listener = () => void
const listeners = new Set<Listener>()

function emit() {
  listeners.forEach((listener) => listener())
}

/** Subscribe to session changes (for React). */
export function subscribeAuth(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function delay(ms = LATENCY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isRole(value: unknown): value is Role {
  return value === 'employee' || value === 'org_manager' || value === 'trainer' || value === 'team'
}

function isLoginType(value: unknown): value is LoginType {
  return value === 'email' || value === 'code'
}

function isSession(value: unknown): value is Session {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item.userId === 'string' &&
    isRole(item.role) &&
    isLoginType(item.loginType) &&
    typeof item.displayName === 'string'
  )
}

/** Cached so useSyncExternalStore getSnapshot returns a stable reference. */
let cachedSessionRaw: string | null | undefined
let cachedSession: Session | null = null

function readSession(): Session | null {
  const raw = localStorage.getItem(SESSION_KEY)
  if (raw === cachedSessionRaw) return cachedSession
  cachedSessionRaw = raw
  try {
    const parsed: unknown = JSON.parse(raw ?? 'null')
    cachedSession = isSession(parsed) ? parsed : null
  } catch {
    cachedSession = null
  }
  return cachedSession
}

function writeSession(session: Session | null): void {
  if (session) {
    const raw = JSON.stringify(session)
    localStorage.setItem(SESSION_KEY, raw)
    cachedSessionRaw = raw
    cachedSession = session
  } else {
    localStorage.removeItem(SESSION_KEY)
    cachedSessionRaw = null
    cachedSession = null
  }
  emit()
}

interface RegisteredUser {
  id: string
  email: string
  password: string
  displayName: string
  role: Role
}

function isRegisteredUser(value: unknown): value is RegisteredUser {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.email === 'string' &&
    typeof item.password === 'string' &&
    typeof item.displayName === 'string' &&
    isRole(item.role)
  )
}

function readRegistered(): RegisteredUser[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter(isRegisteredUser) : []
  } catch {
    return []
  }
}

function writeRegistered(users: RegisteredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function findEmailUser(email: string): DemoEmailUser | RegisteredUser | undefined {
  const normalized = email.trim().toLowerCase()
  const demo = DEMO_EMAIL_USERS.find((user) => user.email === normalized)
  if (demo) return demo
  return readRegistered().find((user) => user.email === normalized)
}

function failCount(): number {
  const raw = localStorage.getItem(FAIL_KEY)
  const count = raw === null ? 0 : Number(raw)
  return Number.isFinite(count) ? count : 0
}

function setFailCount(count: number): void {
  localStorage.setItem(FAIL_KEY, String(count))
}

function lockedUntil(): number {
  const raw = localStorage.getItem(LOCK_KEY)
  const until = raw === null ? 0 : Number(raw)
  return Number.isFinite(until) ? until : 0
}

export function lockoutMessage(seconds: number): string {
  return `נסו שוב בעוד ${seconds} שניות`
}

/** Remaining lockout seconds; clears an expired lock and resets the fail counter. */
export function getLockoutRemainingSeconds(): number {
  const until = lockedUntil()
  if (until <= 0) return 0
  const remainingMs = until - Date.now()
  if (remainingMs <= 0) {
    clearFailures()
    return 0
  }
  return Math.ceil(remainingMs / 1000)
}

export function isAuthLocked(): boolean {
  return getLockoutRemainingSeconds() > 0
}

function assertNotLocked(): void {
  const seconds = getLockoutRemainingSeconds()
  if (seconds > 0) {
    throw new AuthError('locked', lockoutMessage(seconds))
  }
}

function recordFailure(): never {
  const next = failCount() + 1
  setFailCount(next)
  if (next >= MAX_FAILURES) {
    localStorage.setItem(LOCK_KEY, String(Date.now() + LOCKOUT_MS))
    throw new AuthError('locked', lockoutMessage(getLockoutRemainingSeconds()))
  }
  throw new AuthError('invalid_credentials', 'פרטי ההתחברות שגויים')
}

function clearFailures(): void {
  localStorage.removeItem(FAIL_KEY)
  localStorage.removeItem(LOCK_KEY)
}

/** Sync read for React subscriptions. Prefer getSession() in async flows. */
export function getSessionSnapshot(): Session | null {
  return readSession()
}

export async function getSession(): Promise<Session | null> {
  await delay(120)
  return readSession()
}

export async function signInWithEmail(email: string, password: string): Promise<Session> {
  await delay()
  assertNotLocked()
  const user = findEmailUser(email)
  if (!user || user.password !== password) recordFailure()
  clearFailures()
  const session: Session = {
    userId: user.id,
    role: user.role,
    loginType: 'email',
    displayName: user.displayName,
  }
  writeSession(session)
  return session
}

/** Normalize a typed code to 8 uppercase alphabet chars (strips hyphen/spaces). */
export function normalizeCode(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .split('')
    .filter((char) => CODE_ALPHABET.includes(char))
    .join('')
    .slice(0, 8)
}

/** Format 8 chars as XXXX-XXXX for display. */
export function formatCodeDisplay(raw: string): string {
  const normalized = normalizeCode(raw)
  if (normalized.length <= 4) return normalized
  return `${normalized.slice(0, 4)}-${normalized.slice(4)}`
}

export function isValidCode(raw: string): boolean {
  const normalized = normalizeCode(raw)
  return normalized.length === 8 && [...normalized].every((char) => CODE_ALPHABET.includes(char))
}

export async function signInWithCode(code: string): Promise<Session> {
  await delay()
  assertNotLocked()
  const normalized = normalizeCode(code)
  if (normalized.length !== 8) {
    throw new AuthError('validation', 'יש להזין קוד בן 8 תווים')
  }
  const user = DEMO_CODE_USERS.find((entry) => entry.code === normalized)
  if (!user) recordFailure()
  clearFailures()
  const session: Session = {
    userId: user.id,
    role: user.role,
    loginType: 'code',
    displayName: 'משתתף/ת',
  }
  writeSession(session)
  return session
}

export async function signInWithGoogle(): Promise<Session> {
  await delay()
  assertNotLocked()
  clearFailures()
  const session: Session = {
    userId: DEMO_GOOGLE_USER.id,
    role: DEMO_GOOGLE_USER.role,
    loginType: 'email',
    displayName: DEMO_GOOGLE_USER.displayName,
  }
  writeSession(session)
  return session
}

export async function register(input: {
  fullName: string
  email: string
  password: string
}): Promise<Session> {
  await delay()
  const email = input.email.trim().toLowerCase()
  if (findEmailUser(email)) {
    throw new AuthError('validation', 'לא ניתן להשלים את ההרשמה עם הפרטים האלה')
  }
  const user: RegisteredUser = {
    id: crypto.randomUUID(),
    email,
    password: input.password,
    displayName: input.fullName.trim(),
    role: 'employee',
  }
  writeRegistered([...readRegistered(), user])
  clearFailures()
  const session: Session = {
    userId: user.id,
    role: user.role,
    loginType: 'email',
    displayName: user.displayName,
  }
  writeSession(session)
  return session
}

/** Always resolves. Never reveals whether the email exists. */
export async function requestPasswordReset(_email: string): Promise<void> {
  await delay()
}

export async function signOut(): Promise<void> {
  await delay(80)
  writeSession(null)
}

/** Label shown in the user chip — code users never show an email. */
export function sessionChipLabel(session: Session): string {
  if (session.loginType === 'code') return 'משתתף/ת'
  return session.displayName
}
