import { Download, Eye, FileText } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { Card } from '@/components/shared/Card'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { Skeleton } from '@/components/shared/Skeleton'
import { Button } from '@/components/ui/button'
import { downloadReportCsv } from '@/lib/reportCsv'
import {
  formatPeriodLabel,
  listReports,
  markRead,
  statusLabel,
  type TrainerReport,
} from '@/mocks/reports'

function formatReportDate(iso: string): string {
  const day = iso.slice(0, 10)
  const [year, month, dayNum] = day.split('-')
  if (!year || !month || !dayNum) return day
  return `${Number(dayNum)}.${Number(month)}.${year}`
}

function ReportViewDialog({
  report,
  onClose,
}: {
  report: TrainerReport
  onClose: () => void
}) {
  const titleId = useId()
  const descriptionId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previous = document.activeElement
    closeRef.current?.focus()
    return () => {
      if (previous instanceof HTMLElement) previous.focus()
    }
  }, [])

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-scrim p-4"
      onKeyDown={onKeyDown}
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="flex max-h-[min(90svh,40rem)] w-full max-w-lg flex-col overflow-hidden rounded-3xl border bg-card text-card-foreground shadow-lift"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="overflow-y-auto p-6">
          <h2 id={titleId} className="text-xl">
            {report.title}
          </h2>
          <p id={descriptionId} className="mt-1 text-sm text-muted-foreground">
            {formatPeriodLabel(report.period)}
            {' · '}
            <time dateTime={report.updatedAt}>{formatReportDate(report.updatedAt)}</time>
            {' · '}
            {statusLabel(report.status)}
          </p>
          <p className="mt-4 text-foreground">{report.summary}</p>
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
              <li className="rounded-2xl border p-3">
                <p className="text-sm text-muted-foreground">אימונים שהושלמו</p>
                <p className="numeral text-xl font-medium">{report.metrics.workoutsCompleted}</p>
              </li>
              <li className="rounded-2xl border p-3">
                <p className="text-sm text-muted-foreground">שיעור השתתפות</p>
                <p className="numeral text-xl font-medium">{report.metrics.participationPercent}%</p>
              </li>
              <li className="rounded-2xl border p-3">
                <p className="text-sm text-muted-foreground">מאמץ ממוצע</p>
                <p className="numeral text-xl font-medium">{report.metrics.averageEffort}</p>
              </li>
              <li className="rounded-2xl border p-3">
                <p className="text-sm text-muted-foreground">שיעור השלמה</p>
                <p className="numeral text-xl font-medium">{report.metrics.completionPercent}%</p>
              </li>
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              הנתונים המספריים מוסתרים לפי מדיניות הפרטיות.
            </p>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            הדוח מכיל נתונים מצטברים ואנונימיים בלבד — ללא שמות, אימיילים או קודים אישיים.
          </p>
        </div>
        <div className="flex flex-col gap-2 border-t p-4 sm:flex-row-reverse">
          <Button
            type="button"
            variant="outline"
            className="sm:flex-1"
            onClick={() => downloadReportCsv(report)}
          >
            <Download />
            הורדה
          </Button>
          <Button ref={closeRef} type="button" className="sm:flex-1" onClick={onClose}>
            סגירה
          </Button>
        </div>
      </div>
    </div>
  )
}

interface OrgReportsProps {
  orgId: string
}

export function OrgReports({ orgId }: OrgReportsProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [reports, setReports] = useState<TrainerReport[]>([])
  const [viewing, setViewing] = useState<TrainerReport | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    listReports({ orgId, forHr: true })
      .then((items) => {
        if (cancelled) return
        setReports(items)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [orgId, tick])

  const openReport = useCallback(async (report: TrainerReport) => {
    setViewing(report)
    if (report.status === 'sent') {
      const updated = await markRead(report.id)
      if (updated) {
        setReports((current) => current.map((item) => (item.id === updated.id ? updated : item)))
        setViewing(updated)
      }
    }
  }, [])

  return (
    <section aria-labelledby="org-reports-heading" className="flex flex-col gap-4">
      <div>
        <h2 id="org-reports-heading" className="text-lg">
          דוחות
        </h2>
        <p className="text-sm text-muted-foreground">דוחות שהמאמן/ת שלח/ה לארגון</p>
      </div>

      {status === 'loading' ? (
        <div role="status" aria-busy="true" aria-label="טוען דוחות" className="flex flex-col gap-3">
          {Array.from({ length: 2 }, (_, i) => (
            <Skeleton key={i} className="h-24 rounded-3xl" />
          ))}
        </div>
      ) : null}

      {status === 'error' ? (
        <ErrorState onRetry={() => setTick((value) => value + 1)} />
      ) : null}

      {status === 'ready' && reports.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="אין דוחות עדיין"
          description="כשתישלח דוחות מהמאמן/ת, הם יופיעו כאן."
        />
      ) : null}

      {status === 'ready' && reports.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {reports.map((report) => (
            <li key={report.id}>
              <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium">{report.title}</p>
                  <p className="text-sm text-muted-foreground">
                    <time dateTime={report.updatedAt}>{formatReportDate(report.updatedAt)}</time>
                    {' · '}
                    {report.summary}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 self-start sm:self-center">
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => void openReport(report)}
                  >
                    <Eye />
                    צפייה
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => downloadReportCsv(report)}
                  >
                    <Download />
                    הורדה
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      ) : null}

      {viewing ? <ReportViewDialog report={viewing} onClose={() => setViewing(null)} /> : null}
    </section>
  )
}
