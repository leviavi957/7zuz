import { Download, FileText } from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { downloadFile } from '@/lib/downloadFile'
import type { OrgReport } from '@/mocks/orgStats'

function formatReportDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  if (!year || !month || !day) return iso
  return `${Number(day)}.${Number(month)}.${year}`
}

function csvCell(value: string | number): string {
  const text = String(value)
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

/** Anonymous aggregates only — never names, emails, or codes. */
function reportCsv(report: OrgReport): string {
  const rows: (string | number)[][] = [
    ['דוח', report.title],
    ['תאריך', report.date],
    ['סיכום', report.summary],
  ]
  if (report.metrics) {
    rows.push(
      ['אימונים שהושלמו', report.metrics.workoutsCompleted],
      ['שיעור השתתפות', `${report.metrics.participationPercent}%`],
      ['מאמץ ממוצע', report.metrics.averageEffort],
      ['שיעור השלמה', `${report.metrics.completionPercent}%`],
    )
  } else {
    rows.push(['הערה', 'הנתונים המספריים מוסתרים לפי מדיניות הפרטיות'])
  }
  return rows.map((row) => row.map((cell) => csvCell(cell)).join(',')).join('\r\n')
}

function reportFilename(report: OrgReport): string {
  const safe = report.title.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim() || report.id
  return `${safe}-${report.date}.csv`
}

function downloadReport(report: OrgReport): void {
  // Mock action: a client-side CSV of this report's anonymous aggregates. No server.
  const blob = new Blob([`\uFEFF${reportCsv(report)}`], { type: 'text/csv;charset=utf-8' })
  downloadFile(reportFilename(report), blob)
}

interface OrgReportsProps {
  reports: OrgReport[]
}

export function OrgReports({ reports }: OrgReportsProps) {
  return (
    <section aria-labelledby="org-reports-heading" className="flex flex-col gap-4">
      <div>
        <h2 id="org-reports-heading" className="text-lg">
          דוחות
        </h2>
        <p className="text-sm text-muted-foreground">דוחות שהמאמן/ת שלח/ה לארגון</p>
      </div>

      {reports.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="אין דוחות עדיין"
          description="כשתישלח דוחות מהמאמן/ת, הם יופיעו כאן."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {reports.map((report) => (
            <li key={report.id}>
              <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium">{report.title}</p>
                  <p className="text-sm text-muted-foreground">
                    <time dateTime={report.date}>{formatReportDate(report.date)}</time>
                    {' · '}
                    {report.summary}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0 self-start sm:self-center"
                  onClick={() => downloadReport(report)}
                >
                  <Download />
                  הורדה
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
