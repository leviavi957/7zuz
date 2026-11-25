/**
 * Aggregated org HR stats. Returns numbers only — no names, emails or codes.
 * Swap this module for server-side aggregate queries later.
 */

/** Minimum registered users required before any numeric breakdown is shown. */
export const ORG_PRIVACY_MIN_USERS = 5

export type OrgPeriod = 7 | 30 | 90

export const ORG_PERIODS: OrgPeriod[] = [7, 30, 90]

export interface OrgOrganization {
  id: string
  name: string
  /** Short mark shown as the org logo (no personal identifiers). */
  logoInitials: string
}

/** Anonymous report figures. Omitted when the org is below the privacy threshold. */
export interface OrgReportMetrics {
  workoutsCompleted: number
  /** Whole percent, 0–100. */
  participationPercent: number
  averageEffort: number
  /** Whole percent, 0–100. */
  completionPercent: number
}

export interface OrgTimePoint {
  date: string
  label: string
  count: number
}

export interface OrgWeekdayPoint {
  /** 0 = Sunday … 6 = Saturday (Israeli week start). */
  weekday: number
  label: string
  count: number
}

export interface OrgTrend {
  /** Workouts in the selected period minus the previous equal-length period. */
  delta: number
  /** Relative change vs previous period; null when previous was zero. */
  deltaPercent: number | null
  direction: 'up' | 'down' | 'flat'
}

export interface OrgKpis {
  workoutsCompleted: number
  /** Active users in the period / registered users (0–1). */
  participationRate: number
  /** Mean effort 1–5. */
  averageEffort: number
  /** Completed / (completed + partial) in the period (0–1). */
  completionRate: number
}

export interface OrgStats {
  organization: OrgOrganization
  period: OrgPeriod
  registeredUsers: number
  /** True when registeredUsers < ORG_PRIVACY_MIN_USERS — no numeric breakdown. */
  insufficientData: boolean
  kpis: OrgKpis | null
  workoutsOverTime: OrgTimePoint[]
  workoutsByWeekday: OrgWeekdayPoint[]
  trend: OrgTrend | null
}

const WEEKDAY_LABELS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'] as const
const LATENCY_MS = 420
const HISTORY_DAYS = 180

const DEFAULT_ORG_ID = 'org-demo'
const SMALL_ORG_ID = 'org-small'

interface DaySeed {
  completed: number
  partial: number
  activeUsers: number
  effortSum: number
  effortCount: number
}

interface OrgSeed {
  organization: OrgOrganization
  registeredUsers: number
  /** Oldest → newest, length HISTORY_DAYS. */
  days: DaySeed[]
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function buildDays(seed: number, registeredUsers: number, intensity: number): DaySeed[] {
  const rand = mulberry32(seed)
  const days: DaySeed[] = []
  for (let i = 0; i < HISTORY_DAYS; i++) {
    const weekday = (i + 3) % 7 // arbitrary offset; real weekday applied at aggregate time
    const weekendFactor = weekday === 5 || weekday === 6 ? 0.35 : 1
    const wave = 0.75 + 0.35 * Math.sin(i / 9)
    const base = registeredUsers * intensity * weekendFactor * wave
    const completed = Math.max(0, Math.round(base * (0.55 + rand() * 0.45)))
    const partial = Math.max(0, Math.round(completed * (0.12 + rand() * 0.25)))
    const activeUsers = Math.min(
      registeredUsers,
      Math.max(0, Math.round(completed * (0.7 + rand() * 0.35))),
    )
    const effortCount = completed + Math.round(partial * 0.5)
    const effortSum = effortCount * (2.6 + rand() * 1.6)
    days.push({ completed, partial, activeUsers, effortSum, effortCount })
  }
  return days
}

const DEMO_ORG: OrgSeed = {
  organization: {
    id: DEFAULT_ORG_ID,
    name: 'אקווה טק',
    logoInitials: 'אט',
  },
  registeredUsers: 28,
  days: buildDays(20241122, 28, 0.22),
}

const SMALL_ORG: OrgSeed = {
  organization: {
    id: SMALL_ORG_ID,
    name: 'סטודיו נגה',
    logoInitials: 'סנ',
  },
  registeredUsers: 3,
  days: buildDays(77, 3, 0.4),
}

const ORGS: Record<string, OrgSeed> = {
  [DEFAULT_ORG_ID]: DEMO_ORG,
  [SMALL_ORG_ID]: SMALL_ORG,
}

/** Resolve demo org id from a query value (`small` → privacy demo). */
export function resolveOrgId(queryOrg: string | null | undefined): string {
  if (queryOrg === 'small' || queryOrg === SMALL_ORG_ID) return SMALL_ORG_ID
  return DEFAULT_ORG_ID
}

function delay(ms = LATENCY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function formatIsoDay(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatShortLabel(date: Date): string {
  return `${date.getDate()}.${date.getMonth() + 1}`
}

function sliceWindow(days: DaySeed[], period: OrgPeriod, offsetPeriods: number): DaySeed[] {
  const end = days.length - offsetPeriods * period
  const start = end - period
  if (start < 0 || end <= 0) return []
  return days.slice(start, end)
}

function sumCompleted(days: DaySeed[]): number {
  return days.reduce((sum, day) => sum + day.completed, 0)
}

function buildTrend(current: number, previous: number): OrgTrend {
  const delta = current - previous
  const direction: OrgTrend['direction'] =
    delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'
  const deltaPercent =
    previous === 0 ? (current === 0 ? 0 : null) : Math.round((delta / previous) * 100)
  return { delta, deltaPercent, direction }
}

function emptyKpis(): OrgKpis {
  return {
    workoutsCompleted: 0,
    participationRate: 0,
    averageEffort: 0,
    completionRate: 0,
  }
}

/**
 * Aggregated org stats for a period. Never includes personal identifiers.
 * When registered users are below {@link ORG_PRIVACY_MIN_USERS}, numeric fields are null/empty.
 */
export async function getOrgStats(orgId: string, period: OrgPeriod): Promise<OrgStats> {
  await delay()
  const seed = ORGS[orgId] ?? DEMO_ORG
  const organization = seed.organization
  const registeredUsers = seed.registeredUsers

  if (registeredUsers < ORG_PRIVACY_MIN_USERS) {
    return {
      organization,
      period,
      registeredUsers,
      insufficientData: true,
      kpis: null,
      workoutsOverTime: [],
      workoutsByWeekday: [],
      trend: null,
    }
  }

  const currentDays = sliceWindow(seed.days, period, 0)
  const previousDays = sliceWindow(seed.days, period, 1)
  const completed = sumCompleted(currentDays)
  const partial = currentDays.reduce((sum, day) => sum + day.partial, 0)
  const activeUniqueApprox = Math.min(
    registeredUsers,
    Math.round(
      currentDays.reduce((sum, day) => sum + day.activeUsers, 0) / Math.max(period * 0.35, 1),
    ),
  )
  const effortCount = currentDays.reduce((sum, day) => sum + day.effortCount, 0)
  const effortSum = currentDays.reduce((sum, day) => sum + day.effortSum, 0)
  const totalAttempts = completed + partial

  const kpis: OrgKpis = {
    workoutsCompleted: completed,
    participationRate: registeredUsers === 0 ? 0 : activeUniqueApprox / registeredUsers,
    averageEffort: effortCount === 0 ? 0 : Math.round((effortSum / effortCount) * 10) / 10,
    completionRate: totalAttempts === 0 ? 0 : completed / totalAttempts,
  }

  const today = startOfDay(new Date())
  const workoutsOverTime: OrgTimePoint[] = currentDays.map((day, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (period - 1 - index))
    return {
      date: formatIsoDay(date),
      label: formatShortLabel(date),
      count: day.completed,
    }
  })

  const weekdayTotals = Array.from({ length: 7 }, () => 0)
  currentDays.forEach((day, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (period - 1 - index))
    weekdayTotals[date.getDay()] += day.completed
  })

  const workoutsByWeekday: OrgWeekdayPoint[] = WEEKDAY_LABELS.map((label, weekday) => ({
    weekday,
    label,
    count: weekdayTotals[weekday],
  }))

  return {
    organization,
    period,
    registeredUsers,
    insufficientData: false,
    kpis: currentDays.length === 0 ? emptyKpis() : kpis,
    workoutsOverTime,
    workoutsByWeekday,
    trend: buildTrend(completed, sumCompleted(previousDays)),
  }
}
