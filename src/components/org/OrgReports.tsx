import { Download, FileText } from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import type { OrgReport } from '@/mocks/orgStats'

function formatReportDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  if (!year || !month || !day) return iso
  return `${Number(day)}.${Number(month)}.${year}`
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
                  disabled
                  aria-disabled="true"
                  title="הורדה תהיה זמינה בהמשך"
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
