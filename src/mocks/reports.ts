/**
 * Trainer → HR reports (aggregated, anonymous). localStorage-backed mock.
 * Swap this module for a real API later. Never stores names of employees,
 * personal codes, or individual session rows — only org-level aggregates.
 */

import {
  ORG_PRIVACY_MIN_USERS,
  type OrgReportMetrics,
} from '@/mocks/orgStats'

const STORAGE_KEY = '7zuz.reports'
const SCHEDULE_KEY = '7zuz.reportSchedules'
const LATENCY_MS = 420

export type ReportStatus = 'draft' | 'sent' | 'read'
export type ReportType = 'weekly' | 'monthly' | 'custom'
export type ScheduleCadence = 'weekly' | 'monthly'

export type ReportSectionId =
  | 'kpis'
  | 'workoutsOverTime'
  | 'weekday'
  | 'trend'
  | 'participation'
  | 'averageEffort'

export const REPORT_SECTIONS: { id: ReportSectionId; label: string }[] = [
  { id: 'kpis', label: 'מדדי ביצוע (KPI)' },
  { id: 'workoutsOverTime', label: 'אימונים לאורך זמן' },
  { id: 'weekday', label: 'תרשים לפי יום בשבוע' },
  { id: 'trend', label: 'מגמה' },
  { id: 'participation', label: 'השתתפות' },
  { id: 'averageEffort', label: 'מאמץ ממוצע' },
]

export const ALL_REPORT_SECTIONS: ReportSectionId[] = REPORT_SECTIONS.map((s) => s.id)

export type ReportPeriodPreset = 7 | 30 | 90

export type ReportPeriod =
  | { kind: 'preset'; days: ReportPeriodPreset }
  | { kind: 'custom'; from: string; to: string }

export interface ReportRecipient {
  name: string
  email: string
}

export interface ReportOrganization {
  id: string
  name: string
  logoInitials: string
  registeredUsers: number
  hr: ReportRecipient
}

export interface TrainerReport {
  id: string
  orgId: string
  orgName: string
  title: string
  trainerNotes: string
  reportType: ReportType
  period: ReportPeriod
  sections: ReportSectionId[]
  recipient: ReportRecipient
  status: ReportStatus
  /** ISO timestamp. */
  createdAt: string
  /** ISO timestamp. */
  updatedAt: string
  /** ISO timestamp when sent. */
  sentAt?: string
  /** ISO timestamp when HR opened it. */
  readAt?: string
  /** Anonymous aggregates snapshot; omitted below privacy threshold. */
  metrics?: OrgReportMetrics
  summary: string
}

export interface ReportSchedule {
  orgId: string
  enabled: boolean
  cadence: ScheduleCadence
}

export interface ReportWriteInput {
  orgId: string
  title: string
  trainerNotes: string
  reportType: ReportType
  period: ReportPeriod
  sections: ReportSectionId[]
  recipient: ReportRecipient
  metrics?: OrgReportMetrics
  summary: string
  /** Update an existing draft when set. */
  id?: string
}

export class ReportPrivacyError extends Error {
  readonly minUsers = ORG_PRIVACY_MIN_USERS

  constructor() {
    super(
      `לא ניתן לשלוח דוח כאשר בארגון פחות מ-${ORG_PRIVACY_MIN_USERS} משתמשים רשומים.`,
    )
    this.name = 'ReportPrivacyError'
  }
}

export const REPORT_ORGS: ReportOrganization[] = [
  {
    id: 'org-demo',
    name: 'אקווה טק',
    logoInitials: 'אט',
    registeredUsers: 28,
    hr: { name: 'נועה כהן', email: 'manager@7zuz.co' },
  },
  {
    id: 'org-small',
    name: 'סטודיו נגה',
    logoInitials: 'סנ',
    registeredUsers: 3,
    hr: { name: 'יעל לוי', email: 'hr.small@7zuz.co' },
  },
]

function delay(ms = LATENCY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isPeriod(value: unknown): value is ReportPeriod {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  if (item.kind === 'preset') {
    return item.days === 7 || item.days === 30 || item.days === 90
  }
  if (item.kind === 'custom') {
    return typeof item.from === 'string' && typeof item.to === 'string'
  }
  return false
}

function isRecipient(value: unknown): value is ReportRecipient {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return typeof item.name === 'string' && typeof item.email === 'string'
}

function isMetrics(value: unknown): value is OrgReportMetrics {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item.workoutsCompleted === 'number' &&
    typeof item.participationPercent === 'number' &&
    typeof item.averageEffort === 'number' &&
    typeof item.completionPercent === 'number'
  )
}

function isSectionId(value: unknown): value is ReportSectionId {
  return (
    value === 'kpis' ||
    value === 'workoutsOverTime' ||
    value === 'weekday' ||
    value === 'trend' ||
    value === 'participation' ||
    value === 'averageEffort'
  )
}

function isReport(value: unknown): value is TrainerReport {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.orgId === 'string' &&
    typeof item.orgName === 'string' &&
    typeof item.title === 'string' &&
    typeof item.trainerNotes === 'string' &&
    (item.reportType === 'weekly' ||
      item.reportType === 'monthly' ||
      item.reportType === 'custom') &&
    isPeriod(item.period) &&
    Array.isArray(item.sections) &&
    item.sections.every(isSectionId) &&
    isRecipient(item.recipient) &&
    (item.status === 'draft' || item.status === 'sent' || item.status === 'read') &&
    typeof item.createdAt === 'string' &&
    typeof item.updatedAt === 'string' &&
    typeof item.summary === 'string' &&
    (item.metrics === undefined || isMetrics(item.metrics))
  )
}

function isSchedule(value: unknown): value is ReportSchedule {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item.orgId === 'string' &&
    typeof item.enabled === 'boolean' &&
    (item.cadence === 'weekly' || item.cadence === 'monthly')
  )
}

function seedReports(): TrainerReport[] {
  return [
    {
      id: 'rep-1',
      orgId: 'org-demo',
      orgName: 'אקווה טק',
      title: 'סיכום חודשי — אוקטובר',
      trainerNotes: 'החודש נרשמה השתתפות יציבה. מומלץ להמשיך לעודד אימונים בימי א׳ וג׳.',
      reportType: 'monthly',
      period: { kind: 'preset', days: 30 },
      sections: ALL_REPORT_SECTIONS,
      recipient: { ...REPORT_ORGS[0].hr },
      status: 'sent',
      createdAt: '2025-11-02T09:00:00.000Z',
      updatedAt: '2025-11-02T09:00:00.000Z',
      sentAt: '2025-11-02T09:00:00.000Z',
      summary: 'סיכום אנונימי של השתתפות ומאמץ ממוצע לחודש שעבר.',
      metrics: {
        workoutsCompleted: 186,
        participationPercent: 64,
        averageEffort: 3.1,
        completionPercent: 78,
      },
    },
    {
      id: 'rep-2',
      orgId: 'org-demo',
      orgName: 'אקווה טק',
      title: 'דוח רבעוני — רבעון 3',
      trainerNotes: 'מגמת עלייה קלה בהשלמת אימונים. כדאי לשקול תזכורות נוספות בימי ה׳.',
      reportType: 'custom',
      period: { kind: 'preset', days: 90 },
      sections: ALL_REPORT_SECTIONS,
      recipient: { ...REPORT_ORGS[0].hr },
      status: 'sent',
      createdAt: '2025-10-05T08:30:00.000Z',
      updatedAt: '2025-10-05T08:30:00.000Z',
      sentAt: '2025-10-05T08:30:00.000Z',
      summary: 'מגמות השתתפות לפי ימי השבוע, ללא פרטים אישיים.',
      metrics: {
        workoutsCompleted: 540,
        participationPercent: 71,
        averageEffort: 3.4,
        completionPercent: 82,
      },
    },
    {
      id: 'rep-3',
      orgId: 'org-demo',
      orgName: 'אקווה טק',
      title: 'עדכון קצר — שבוע 42',
      trainerNotes: 'שבוע שקט יחסית. אין חריגות במדדים המסוכמים.',
      reportType: 'weekly',
      period: { kind: 'preset', days: 7 },
      sections: ['kpis', 'participation', 'averageEffort'],
      recipient: { ...REPORT_ORGS[0].hr },
      status: 'sent',
      createdAt: '2025-10-20T11:15:00.000Z',
      updatedAt: '2025-10-20T11:15:00.000Z',
      sentAt: '2025-10-20T11:15:00.000Z',
      summary: 'תמצית שבועית של אימונים שהושלמו ושיעור השלמה.',
      metrics: {
        workoutsCompleted: 47,
        participationPercent: 58,
        averageEffort: 2.9,
        completionPercent: 74,
      },
    },
  ]
}

function readReports(): TrainerReport[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw === null) {
    const seeded = seedReports()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
    return seeded
  }
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isReport) : seedReports()
  } catch {
    return seedReports()
  }
}

function writeReports(reports: TrainerReport[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
}

function readSchedules(): ReportSchedule[] {
  const raw = localStorage.getItem(SCHEDULE_KEY)
  if (raw === null) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isSchedule) : []
  } catch {
    return []
  }
}

function writeSchedules(schedules: ReportSchedule[]): void {
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedules))
}

export function getReportOrganization(orgId: string): ReportOrganization | undefined {
  return REPORT_ORGS.find((org) => org.id === orgId)
}

export async function listOrganizations(): Promise<ReportOrganization[]> {
  await delay()
  return REPORT_ORGS.map((org) => ({
    ...org,
    hr: { ...org.hr },
  }))
}

export function formatPeriodLabel(period: ReportPeriod): string {
  if (period.kind === 'preset') return `${period.days} ימים אחרונים`
  const from = period.from.split('-').reverse().join('.')
  const to = period.to.split('-').reverse().join('.')
  return `${from}–${to}`
}

export function defaultTitle(reportType: ReportType, orgName: string): string {
  if (reportType === 'weekly') return `סיכום שבועי — ${orgName}`
  if (reportType === 'monthly') return `סיכום חודשי — ${orgName}`
  return `דוח מותאם — ${orgName}`
}

export function defaultTrainerNotes(reportType: ReportType): string {
  if (reportType === 'weekly') {
    return 'סיכום שבועי אנונימי של פעילות הארגון. המדדים להלן מבוססים על נתונים מצטברים בלבד.'
  }
  if (reportType === 'monthly') {
    return 'סיכום חודשי אנונימי. מומלץ לעבור על המגמות ועל ימי השיא כדי לתכנן תזכורות.'
  }
  return 'דוח מותאם אישית לארגון. כל הנתונים מסוכמים ואנונימיים.'
}

export function statusLabel(status: ReportStatus): string {
  if (status === 'draft') return 'טיוטה'
  if (status === 'sent') return 'נשלח'
  return 'נקרא על ידי HR'
}

/** Map a custom range to the closest getOrgStats period. */
export function periodToOrgStatsDays(period: ReportPeriod): ReportPeriodPreset {
  if (period.kind === 'preset') return period.days
  const from = new Date(period.from)
  const to = new Date(period.to)
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 30
  const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1)
  if (days <= 7) return 7
  if (days <= 30) return 30
  return 90
}

export interface ListReportsFilter {
  /** Limit to one organization. */
  orgId?: string
  /**
   * HR view: only sent/read reports for the org (no drafts).
   * Trainer view (default): drafts + sent + read.
   */
  forHr?: boolean
}

export async function listReports(filter: ListReportsFilter = {}): Promise<TrainerReport[]> {
  await delay()
  let reports = readReports()
  if (filter.orgId) {
    reports = reports.filter((report) => report.orgId === filter.orgId)
  }
  if (filter.forHr) {
    reports = reports.filter((report) => report.status === 'sent' || report.status === 'read')
  }
  return reports
    .slice()
    .sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : b.updatedAt < a.updatedAt ? -1 : 0))
}

function findOrg(orgId: string): ReportOrganization {
  const org = getReportOrganization(orgId)
  if (!org) throw new Error('ארגון לא נמצא')
  return org
}

function assertCanSend(org: ReportOrganization): void {
  if (org.registeredUsers < ORG_PRIVACY_MIN_USERS) {
    throw new ReportPrivacyError()
  }
}

function buildReport(
  input: ReportWriteInput,
  status: ReportStatus,
  existing?: TrainerReport,
): TrainerReport {
  const org = findOrg(input.orgId)
  const now = new Date().toISOString()
  const id = existing?.id ?? input.id ?? crypto.randomUUID()
  const metrics =
    org.registeredUsers < ORG_PRIVACY_MIN_USERS ? undefined : input.metrics

  return {
    id,
    orgId: org.id,
    orgName: org.name,
    title: input.title.trim() || defaultTitle(input.reportType, org.name),
    trainerNotes: input.trainerNotes.trim(),
    reportType: input.reportType,
    period: input.period,
    sections: input.sections.length > 0 ? input.sections : ALL_REPORT_SECTIONS,
    recipient: {
      name: input.recipient.name.trim() || org.hr.name,
      email: input.recipient.email.trim() || org.hr.email,
    },
    status,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    sentAt: status === 'draft' ? existing?.sentAt : existing?.sentAt ?? now,
    readAt: status === 'read' ? existing?.readAt : undefined,
    metrics,
    summary: input.summary.trim() || 'סיכום אנונימי של פעילות הארגון.',
  }
}

export async function createDraft(input: ReportWriteInput): Promise<TrainerReport> {
  await delay()
  const reports = readReports()
  const existing = input.id ? reports.find((r) => r.id === input.id && r.status === 'draft') : undefined
  const draft = buildReport(input, 'draft', existing)
  const next = existing
    ? reports.map((r) => (r.id === draft.id ? draft : r))
    : [draft, ...reports]
  writeReports(next)
  return draft
}

export async function sendReport(input: ReportWriteInput): Promise<TrainerReport> {
  await delay()
  const org = findOrg(input.orgId)
  assertCanSend(org)

  const reports = readReports()
  const existing = input.id ? reports.find((r) => r.id === input.id) : undefined
  const sent = buildReport(input, 'sent', existing ? { ...existing, readAt: undefined } : undefined)
  sent.sentAt = new Date().toISOString()
  sent.readAt = undefined

  const next = existing
    ? reports.map((r) => (r.id === sent.id ? sent : r))
    : [sent, ...reports]
  writeReports(next)
  return sent
}

/** HR opens a sent report → trainer sees "נקרא על ידי HR". */
export async function markRead(id: string): Promise<TrainerReport | null> {
  await delay(180)
  const reports = readReports()
  const index = reports.findIndex((r) => r.id === id)
  if (index < 0) return null
  const current = reports[index]
  if (current.status === 'draft') return current
  if (current.status === 'read') return current

  const updated: TrainerReport = {
    ...current,
    status: 'read',
    readAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const next = reports.slice()
  next[index] = updated
  writeReports(next)
  return updated
}

export async function getSchedule(orgId: string): Promise<ReportSchedule> {
  await delay(200)
  const found = readSchedules().find((s) => s.orgId === orgId)
  return found ?? { orgId, enabled: false, cadence: 'weekly' }
}

export async function setSchedule(
  orgId: string,
  patch: Pick<ReportSchedule, 'enabled' | 'cadence'>,
): Promise<ReportSchedule> {
  await delay(200)
  const schedules = readSchedules()
  const nextEntry: ReportSchedule = {
    orgId,
    enabled: patch.enabled,
    cadence: patch.cadence,
  }
  const index = schedules.findIndex((s) => s.orgId === orgId)
  if (index >= 0) schedules[index] = nextEntry
  else schedules.push(nextEntry)
  writeSchedules(schedules)
  return nextEntry
}
