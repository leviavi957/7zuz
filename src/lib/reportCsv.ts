import { downloadFile } from '@/lib/downloadFile'
import {
  formatPeriodLabel,
  type TrainerReport,
} from '@/mocks/reports'

function csvCell(value: string | number): string {
  const text = String(value)
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

/** Anonymous aggregates only — never names of employees, emails of participants, or codes. */
export function reportCsv(report: TrainerReport): string {
  const rows: (string | number)[][] = [
    ['דוח', report.title],
    ['ארגון', report.orgName],
    ['תקופה', formatPeriodLabel(report.period)],
    ['תאריך עדכון', report.updatedAt.slice(0, 10)],
    ['סיכום', report.summary],
  ]
  if (report.trainerNotes) {
    rows.push(['הערות המאמן', report.trainerNotes])
  }
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

function reportFilename(report: TrainerReport): string {
  const safe = report.title.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim() || report.id
  const day = report.sentAt?.slice(0, 10) ?? report.updatedAt.slice(0, 10)
  return `${safe}-${day}.csv`
}

/** Client-side CSV download of anonymous aggregates. */
export function downloadReportCsv(report: TrainerReport): void {
  const blob = new Blob([`\uFEFF${reportCsv(report)}`], { type: 'text/csv;charset=utf-8' })
  downloadFile(reportFilename(report), blob)
}
