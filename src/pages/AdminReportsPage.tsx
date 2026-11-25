import {
  Download,
  Eye,
  FileText,
  Inbox,
  Send,
  ShieldAlert,
} from 'lucide-react'
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { useSearchParams } from 'react-router-dom'
import { OrgWorkoutsLineChart, OrgWeekdayBarChart } from '@/components/org/OrgCharts'
import { OrgKpiCards } from '@/components/org/OrgKpiCards'
import { OrgPrivacyEmpty } from '@/components/org/OrgPrivacyEmpty'
import { OrgTrendCard } from '@/components/org/OrgTrendCard'
import { AuthField } from '@/components/auth/AuthField'
import { SegmentedControl } from '@/components/auth/SegmentedControl'
import { Card, CardHeader } from '@/components/shared/Card'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { Skeleton } from '@/components/shared/Skeleton'
import { Switch } from '@/components/shared/Switch'
import { Button } from '@/components/ui/button'
import { downloadReportCsv } from '@/lib/reportCsv'
import { showToast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import {
  ORG_PRIVACY_MIN_USERS,
  getOrgStats,
  type OrgPeriod,
  type OrgStats,
} from '@/mocks/orgStats'
import {
  ALL_REPORT_SECTIONS,
  REPORT_SECTIONS,
  createDraft,
  defaultTitle,
  defaultTrainerNotes,
  formatPeriodLabel,
  getSchedule,
  listOrganizations,
  listReports,
  periodToOrgStatsDays,
  sendReport,
  setSchedule,
  statusLabel,
  type ReportOrganization,
  type ReportPeriod,
  type ReportPeriodPreset,
  type ReportSectionId,
  type ReportType,
  type ReportWriteInput,
  type ScheduleCadence,
  type TrainerReport,
  ReportPrivacyError,
} from '@/mocks/reports'

type PageStatus = 'loading' | 'ready' | 'empty' | 'error'

function formatDate(iso: string): string {
  const day = iso.slice(0, 10)
  const [year, month, dayNum] = day.split('-')
  if (!year || !month || !dayNum) return day
  return `${Number(dayNum)}.${Number(month)}.${year}`
}

function metricsFromStats(stats: OrgStats) {
  if (!stats.kpis) return undefined
  return {
    workoutsCompleted: stats.kpis.workoutsCompleted,
    participationPercent: Math.round(stats.kpis.participationRate * 100),
    averageEffort: stats.kpis.averageEffort,
    completionPercent: Math.round(stats.kpis.completionRate * 100),
  }
}

function summaryFromStats(stats: OrgStats, reportType: ReportType): string {
  if (stats.insufficientData || !stats.kpis) {
    return 'סיכום אנונימי — הנתונים המספריים מוסתרים לפי מדיניות הפרטיות.'
  }
  const kind =
    reportType === 'weekly' ? 'שבועי' : reportType === 'monthly' ? 'חודשי' : 'מותאם'
  return `סיכום ${kind} אנונימי: ${stats.kpis.workoutsCompleted} אימונים, השתתפות ${Math.round(stats.kpis.participationRate * 100)}%, מאמץ ממוצע ${stats.kpis.averageEffort}.`
}

function ReportsSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="טוען דוחות" className="flex flex-col gap-5">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-5 lg:grid-cols-2">
        <Skeleton className="h-[32rem] rounded-3xl" />
        <Skeleton className="h-[32rem] rounded-3xl" />
      </div>
      <Skeleton className="h-48 rounded-3xl" />
    </div>
  )
}

function ConfirmSendDialog({
  title,
  recipientName,
  recipientEmail,
  orgName,
  periodLabel,
  busy,
  onCancel,
  onConfirm,
}: {
  title: string
  recipientName: string
  recipientEmail: string
  orgName: string
  periodLabel: string
  busy: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  const titleId = useId()
  const descriptionId = useId()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previous = document.activeElement
    confirmRef.current?.focus()
    return () => {
      if (previous instanceof HTMLElement) previous.focus()
    }
  }, [])

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && !busy) {
      event.stopPropagation()
      onCancel()
    }
    if (event.key === 'Tab') {
      event.preventDefault()
      const next = document.activeElement === cancelRef.current ? confirmRef : cancelRef
      next.current?.focus()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-scrim p-4"
      onKeyDown={onKeyDown}
      onMouseDown={busy ? undefined : onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="w-full max-w-md rounded-3xl border bg-card p-6 text-card-foreground shadow-lift"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="text-xl">
          לשלוח את הדוח ל-HR?
        </h2>
        <p id={descriptionId} className="mt-2 text-muted-foreground">
          יישלח הדוח &quot;{title}&quot; עבור {orgName} ({periodLabel}) אל {recipientName} בכתובת{' '}
          <span dir="ltr" className="inline-block">
            {recipientEmail}
          </span>
          . בגרסת הדמה השליחה מדומה בלבד.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
          <Button
            ref={confirmRef}
            type="button"
            variant="brand"
            onClick={onConfirm}
            disabled={busy}
            className="sm:flex-1"
          >
            <Send />
            {busy ? 'שולח…' : 'אישור שליחה'}
          </Button>
          <Button
            ref={cancelRef}
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={busy}
            className="sm:flex-1"
          >
            ביטול
          </Button>
        </div>
      </div>
    </div>
  )
}

function ReportDetailDialog({
  report,
  onClose,
}: {
  report: TrainerReport
  onClose: () => void
}) {
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previous = document.activeElement
    closeRef.current?.focus()
    return () => {
      if (previous instanceof HTMLElement) previous.focus()
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-scrim p-4"
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose()
      }}
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[min(90svh,40rem)] w-full max-w-lg flex-col overflow-hidden rounded-3xl border bg-card text-card-foreground shadow-lift"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="overflow-y-auto p-6">
          <h2 id={titleId} className="text-xl">
            {report.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {report.orgName} · {formatPeriodLabel(report.period)} · {statusLabel(report.status)}
          </p>
          <p className="mt-4">{report.summary}</p>
          {report.trainerNotes ? (
            <div className="mt-4 rounded-2xl bg-sage p-4">
              <p className="text-sm font-medium">הערות המאמן</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                {report.trainerNotes}
              </p>
            </div>
          ) : null}
          {report.metrics ? (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              <li className="rounded-2xl border p-3 text-sm">
                אימונים: <span className="numeral font-medium">{report.metrics.workoutsCompleted}</span>
              </li>
              <li className="rounded-2xl border p-3 text-sm">
                השתתפות:{' '}
                <span className="numeral font-medium">{report.metrics.participationPercent}%</span>
              </li>
              <li className="rounded-2xl border p-3 text-sm">
                מאמץ: <span className="numeral font-medium">{report.metrics.averageEffort}</span>
              </li>
              <li className="rounded-2xl border p-3 text-sm">
                השלמה:{' '}
                <span className="numeral font-medium">{report.metrics.completionPercent}%</span>
              </li>
            </ul>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 border-t p-4 sm:flex-row-reverse">
          {report.status !== 'draft' ? (
            <Button
              type="button"
              variant="outline"
              className="sm:flex-1"
              onClick={() => downloadReportCsv(report)}
            >
              <Download />
              הורדה
            </Button>
          ) : null}
          <Button ref={closeRef} type="button" className="sm:flex-1" onClick={onClose}>
            סגירה
          </Button>
        </div>
      </div>
    </div>
  )
}

function SectionToggle({
  id,
  label,
  checked,
  onChange,
}: {
  id: ReportSectionId
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  const inputId = useId()
  return (
    <label
      htmlFor={inputId}
      className="flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl border border-input bg-card px-3 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring"
    >
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-5 shrink-0 rounded border-input accent-brand-graphic"
        data-section={id}
      />
      <span className="text-sm">{label}</span>
    </label>
  )
}

export default function AdminReportsPage() {
  const [params, setParams] = useSearchParams()
  const forced = params.get('state')

  const [bootStatus, setBootStatus] = useState<PageStatus>('loading')
  const [orgs, setOrgs] = useState<ReportOrganization[]>([])
  const [history, setHistory] = useState<TrainerReport[]>([])
  const [orgId, setOrgId] = useState('org-demo')
  const [periodKind, setPeriodKind] = useState<'preset' | 'custom'>('preset')
  const [presetDays, setPresetDays] = useState<ReportPeriodPreset>(30)
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [reportType, setReportType] = useState<ReportType>('monthly')
  const [sections, setSections] = useState<ReportSectionId[]>(ALL_REPORT_SECTIONS)
  const [title, setTitle] = useState('')
  const [titleTouched, setTitleTouched] = useState(false)
  const [notes, setNotes] = useState('')
  const [notesTouched, setNotesTouched] = useState(false)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [preview, setPreview] = useState<OrgStats | null>(null)
  const [previewLoading, setPreviewLoading] = useState(true)
  const [scheduleEnabled, setScheduleEnabled] = useState(false)
  const [scheduleCadence, setScheduleCadence] = useState<ScheduleCadence>('weekly')
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [viewing, setViewing] = useState<TrainerReport | null>(null)
  const [historyTick, setHistoryTick] = useState(0)

  const selectedOrg = useMemo(
    () => orgs.find((org) => org.id === orgId) ?? orgs[0],
    [orgs, orgId],
  )

  const period: ReportPeriod = useMemo(() => {
    if (periodKind === 'custom' && customFrom && customTo) {
      return { kind: 'custom', from: customFrom, to: customTo }
    }
    return { kind: 'preset', days: presetDays }
  }, [periodKind, presetDays, customFrom, customTo])

  const privacyBlocked = Boolean(
    selectedOrg && selectedOrg.registeredUsers < ORG_PRIVACY_MIN_USERS,
  )

  const effectiveTitle =
    titleTouched && title.trim()
      ? title
      : selectedOrg
        ? defaultTitle(reportType, selectedOrg.name)
        : title

  const effectiveNotes =
    notesTouched && notes.trim() ? notes : defaultTrainerNotes(reportType)

  const reloadHistory = useCallback(() => {
    setHistoryTick((value) => value + 1)
  }, [])

  useEffect(() => {
    if (forced === 'loading' || forced === 'error' || forced === 'empty') return
    let cancelled = false
    setBootStatus('loading')
    listOrganizations()
      .then((list) => {
        if (cancelled) return
        setOrgs(list)
        const first = list[0]
        if (first) {
          setOrgId(first.id)
          setRecipientEmail(first.hr.email)
          setTitle(defaultTitle('monthly', first.name))
          setNotes(defaultTrainerNotes('monthly'))
        }
        setBootStatus(list.length === 0 ? 'empty' : 'ready')
      })
      .catch(() => {
        if (!cancelled) setBootStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [forced])

  useEffect(() => {
    if (forced === 'loading' || forced === 'error' || forced === 'empty') return
    if (bootStatus !== 'ready') return
    let cancelled = false
    listReports()
      .then((items) => {
        if (!cancelled) setHistory(items)
      })
      .catch(() => {
        /* history failure stays soft; form still usable */
      })
    return () => {
      cancelled = true
    }
  }, [bootStatus, forced, historyTick])

  useEffect(() => {
    if (!selectedOrg) return
    setRecipientEmail(selectedOrg.hr.email)
    if (!titleTouched) setTitle(defaultTitle(reportType, selectedOrg.name))
    getSchedule(selectedOrg.id).then((schedule) => {
      setScheduleEnabled(schedule.enabled)
      setScheduleCadence(schedule.cadence)
    })
  }, [selectedOrg, reportType, titleTouched])

  useEffect(() => {
    if (!notesTouched) setNotes(defaultTrainerNotes(reportType))
    if (selectedOrg && !titleTouched) setTitle(defaultTitle(reportType, selectedOrg.name))
  }, [reportType, notesTouched, titleTouched, selectedOrg])

  useEffect(() => {
    if (bootStatus !== 'ready' || !orgId) return
    let cancelled = false
    setPreviewLoading(true)
    const days = periodToOrgStatsDays(period) as OrgPeriod
    getOrgStats(orgId, days).then((stats) => {
      if (cancelled) return
      setPreview(stats)
      setPreviewLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [bootStatus, orgId, period])

  const buildInput = (): ReportWriteInput | null => {
    if (!selectedOrg) return null
    return {
      orgId: selectedOrg.id,
      title: effectiveTitle,
      trainerNotes: effectiveNotes,
      reportType,
      period,
      sections,
      recipient: {
        name: selectedOrg.hr.name,
        email: recipientEmail.trim() || selectedOrg.hr.email,
      },
      metrics: preview ? metricsFromStats(preview) : undefined,
      summary: preview
        ? summaryFromStats(preview, reportType)
        : 'סיכום אנונימי של פעילות הארגון.',
    }
  }

  const onSaveDraft = async () => {
    const input = buildInput()
    if (!input || busy) return
    setBusy(true)
    try {
      await createDraft(input)
      showToast({ title: 'הטיוטה נשמרה' })
      reloadHistory()
    } catch {
      showToast({ title: 'שמירת הטיוטה נכשלה' })
    } finally {
      setBusy(false)
    }
  }

  const onConfirmSend = async () => {
    const input = buildInput()
    if (!input || busy) return
    setBusy(true)
    try {
      await sendReport(input)
      showToast({
        title: 'הדוח נשלח (דמה)',
        message: 'הדוח יופיע בלוח הבקרה של ה-HR.',
      })
      setConfirming(false)
      reloadHistory()
    } catch (error) {
      if (error instanceof ReportPrivacyError) {
        showToast({ title: 'לא ניתן לשלוח', message: error.message })
      } else {
        showToast({ title: 'השליחה נכשלה' })
      }
    } finally {
      setBusy(false)
    }
  }

  const onScheduleChange = async (enabled: boolean, cadence: ScheduleCadence) => {
    if (!selectedOrg) return
    setScheduleEnabled(enabled)
    setScheduleCadence(cadence)
    try {
      await setSchedule(selectedOrg.id, { enabled, cadence })
      showToast({
        title: enabled ? 'התזמון נשמר (דמה)' : 'התזמון בוטל',
        message: 'בגרסת הדמה התזמון נשמר אך אינו מבוצע בפועל.',
      })
    } catch {
      showToast({ title: 'שמירת התזמון נכשלה' })
    }
  }

  const toggleSection = (id: ReportSectionId, checked: boolean) => {
    setSections((current) => {
      if (checked) return current.includes(id) ? current : [...current, id]
      return current.filter((item) => item !== id)
    })
  }

  if (forced === 'loading' || bootStatus === 'loading') return <ReportsSkeleton />
  if (forced === 'error' || bootStatus === 'error') {
    return (
      <ErrorState
        onRetry={() => {
          setParams((current) => {
            const next = new URLSearchParams(current)
            next.delete('state')
            return next
          })
          setBootStatus('loading')
          void listOrganizations()
            .then((list) => {
              setOrgs(list)
              setBootStatus(list.length === 0 ? 'empty' : 'ready')
            })
            .catch(() => setBootStatus('error'))
        }}
      />
    )
  }
  if (forced === 'empty' || bootStatus === 'empty' || !selectedOrg) {
    return (
      <EmptyState
        icon={Inbox}
        title="אין ארגונים"
        description="לא נמצאו ארגונים להכנת דוח."
      />
    )
  }

  const showKpis =
    sections.includes('kpis') ||
    sections.includes('participation') ||
    sections.includes('averageEffort')
  const statsPeriod = periodToOrgStatsDays(period) as OrgPeriod

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl md:text-4xl">דוחות לארגון</h2>
        <p className="text-muted-foreground">
          הכינו סיכום אנונימי ושלחו למנהל/ת ה-HR של הארגון.
        </p>
        <Card tone="sage" className="text-sm text-muted-foreground">
          בגרסת הדמה השליחה מדומה. בגרסה המלאה תישלח הודעת מייל ל-HR.
        </Card>
      </header>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <Card className="flex flex-col gap-5">
          <CardHeader title="דוח חדש" description="בחרו ארגון, תקופה וסעיפים להכללה." />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="report-org" className="text-sm font-medium">
              ארגון
            </label>
            <select
              id="report-org"
              value={orgId}
              onChange={(event) => {
                setOrgId(event.target.value)
                setTitleTouched(false)
                setNotesTouched(false)
              }}
              className="h-11 appearance-none rounded-2xl border border-input bg-card px-4 text-base shadow-soft outline-none focus-visible:ring-3 focus-visible:ring-ring"
            >
              {orgs.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium">תקופה</p>
            <SegmentedControl
              label="סוג תקופה"
              value={periodKind}
              options={[
                { value: 'preset', label: 'מוגדרת מראש' },
                { value: 'custom', label: 'טווח מותאם' },
              ]}
              onChange={setPeriodKind}
            />
            {periodKind === 'preset' ? (
              <SegmentedControl
                label="מספר ימים"
                value={String(presetDays) as `${ReportPeriodPreset}`}
                options={[
                  { value: '7', label: '7 ימים' },
                  { value: '30', label: '30 ימים' },
                  { value: '90', label: '90 ימים' },
                ]}
                onChange={(value) => setPresetDays(Number(value) as ReportPeriodPreset)}
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <AuthField
                  label="מתאריך"
                  type="date"
                  value={customFrom}
                  onChange={(event) => setCustomFrom(event.target.value)}
                />
                <AuthField
                  label="עד תאריך"
                  type="date"
                  value={customTo}
                  onChange={(event) => setCustomTo(event.target.value)}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium">סוג דוח</p>
            <SegmentedControl
              label="סוג דוח"
              value={reportType}
              options={[
                { value: 'weekly', label: 'סיכום שבועי' },
                { value: 'monthly', label: 'סיכום חודשי' },
                { value: 'custom', label: 'מותאם' },
              ]}
              onChange={setReportType}
            />
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium">סעיפים להכללה</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {REPORT_SECTIONS.map((section) => (
                <SectionToggle
                  key={section.id}
                  id={section.id}
                  label={section.label}
                  checked={sections.includes(section.id)}
                  onChange={(checked) => toggleSection(section.id, checked)}
                />
              ))}
            </div>
          </fieldset>

          <AuthField
            label="כותרת"
            value={effectiveTitle}
            onChange={(event) => {
              setTitleTouched(true)
              setTitle(event.target.value)
            }}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="trainer-notes" className="text-sm font-medium">
              הערות המאמן
            </label>
            <textarea
              id="trainer-notes"
              rows={4}
              value={effectiveNotes}
              onChange={(event) => {
                setNotesTouched(true)
                setNotes(event.target.value)
              }}
              className="min-h-28 w-full rounded-2xl border border-input bg-card px-4 py-3 text-base shadow-soft outline-none focus-visible:ring-3 focus-visible:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium">נמען</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex min-h-11 items-center rounded-full bg-brand-soft px-4 text-sm font-medium text-brand-ink">
                {selectedOrg.hr.name}
              </span>
            </div>
            <AuthField
              label="אימייל הנמען"
              type="email"
              ltr
              value={recipientEmail}
              onChange={(event) => setRecipientEmail(event.target.value)}
              hint="ניתן לערוך את הכתובת לפני השליחה."
            />
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-dashed p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">שליחה אוטומטית שבועית/חודשית</p>
                <p className="text-sm text-muted-foreground">
                  נשמר לדמה בלבד — לא מבוצע בפועל בגרסה זו.
                </p>
              </div>
              <Switch
                label="הפעלת שליחה אוטומטית"
                checked={scheduleEnabled}
                onChange={(checked) => void onScheduleChange(checked, scheduleCadence)}
              />
            </div>
            {scheduleEnabled ? (
              <SegmentedControl
                label="תדירות שליחה"
                value={scheduleCadence}
                options={[
                  { value: 'weekly', label: 'שבועית' },
                  { value: 'monthly', label: 'חודשית' },
                ]}
                onChange={(value) => void onScheduleChange(true, value)}
              />
            ) : null}
          </div>

          {privacyBlocked ? (
            <div
              role="status"
              className="flex gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm"
            >
              <ShieldAlert className="size-5 shrink-0 text-destructive" aria-hidden="true" />
              <p>
                לא ניתן לשלוח דוח לארגון זה: רשומים פחות מ-{ORG_PRIVACY_MIN_USERS} משתמשים (
                {selectedOrg.registeredUsers}). השליחה חסומה כדי לשמור על פרטיות.
              </p>
            </div>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <Button
              type="button"
              variant="brand"
              className="sm:flex-1"
              disabled={privacyBlocked || busy}
              onClick={() => setConfirming(true)}
            >
              <Send />
              שליחה ל-HR
            </Button>
            <Button
              type="button"
              variant="outline"
              className="sm:flex-1"
              disabled={busy}
              onClick={() => void onSaveDraft()}
            >
              <FileText />
              שמירה כטיוטה
            </Button>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <CardHeader
            title="תצוגה מקדימה חיה"
            description="מבוסס על אותם נתונים מצטברים כמו לוח ה-HR."
            className="mb-0"
          />
          {previewLoading || !preview ? (
            <div role="status" aria-busy="true" aria-label="טוען תצוגה מקדימה" className="flex flex-col gap-4">
              <Skeleton className="h-28 rounded-3xl" />
              <Skeleton className="h-64 rounded-3xl" />
            </div>
          ) : preview.insufficientData ? (
            <OrgPrivacyEmpty />
          ) : (
            <div className="flex flex-col gap-4">
              {showKpis && preview.kpis ? <OrgKpiCards kpis={preview.kpis} /> : null}
              {sections.includes('workoutsOverTime') ? (
                <OrgWorkoutsLineChart data={preview.workoutsOverTime} />
              ) : null}
              {sections.includes('trend') && preview.trend ? (
                <OrgTrendCard trend={preview.trend} period={statsPeriod} />
              ) : null}
              {sections.includes('weekday') ? (
                <OrgWeekdayBarChart data={preview.workoutsByWeekday} />
              ) : null}
              {!showKpis &&
              !sections.includes('workoutsOverTime') &&
              !sections.includes('trend') &&
              !sections.includes('weekday') ? (
                <EmptyState
                  icon={FileText}
                  title="לא נבחרו סעיפים"
                  description="סמנו לפחות סעיף אחד כדי לראות תצוגה מקדימה."
                />
              ) : null}
            </div>
          )}
        </div>
      </div>

      <section aria-labelledby="report-history-heading" className="flex flex-col gap-4">
        <div>
          <h2 id="report-history-heading" className="text-lg">
            היסטוריית דוחות
          </h2>
          <p className="text-sm text-muted-foreground">טיוטות ודוחות שנשלחו</p>
        </div>

        {history.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="אין דוחות עדיין"
            description="שמרו טיוטה או שלחו דוח כדי לראות אותו כאן."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {history.map((report) => (
              <li key={report.id}>
                <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{report.title}</p>
                      <span
                        className={cn(
                          'inline-flex min-h-8 items-center rounded-full px-3 text-xs font-medium',
                          report.status === 'draft' && 'bg-muted text-muted-foreground',
                          report.status === 'sent' && 'bg-brand-soft text-brand-ink',
                          report.status === 'read' && 'bg-sage text-sage-ink',
                        )}
                      >
                        {statusLabel(report.status)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {report.orgName}
                      {' · '}
                      {formatPeriodLabel(report.period)}
                      {' · '}
                      <time dateTime={report.updatedAt}>{formatDate(report.updatedAt)}</time>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 self-start sm:self-center">
                    <Button type="button" variant="outline" onClick={() => setViewing(report)}>
                      <Eye />
                      צפייה
                    </Button>
                    {report.status !== 'draft' ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => downloadReportCsv(report)}
                      >
                        <Download />
                        CSV
                      </Button>
                    ) : null}
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      {confirming ? (
        <ConfirmSendDialog
          title={effectiveTitle}
          recipientName={selectedOrg.hr.name}
          recipientEmail={recipientEmail.trim() || selectedOrg.hr.email}
          orgName={selectedOrg.name}
          periodLabel={formatPeriodLabel(period)}
          busy={busy}
          onCancel={() => setConfirming(false)}
          onConfirm={() => void onConfirmSend()}
        />
      ) : null}

      {viewing ? <ReportDetailDialog report={viewing} onClose={() => setViewing(null)} /> : null}
    </div>
  )
}
