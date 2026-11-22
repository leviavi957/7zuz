import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { Card } from '@/components/shared/Card'
import type { OrgPeriod, OrgTrend } from '@/mocks/orgStats'

interface OrgTrendCardProps {
  trend: OrgTrend
  period: OrgPeriod
}

function trendCopy(trend: OrgTrend, period: OrgPeriod): string {
  const absDelta = Math.abs(trend.delta)
  const countPart =
    trend.direction === 'flat'
      ? 'אותו מספר אימונים'
      : trend.direction === 'up'
        ? `${absDelta} אימונים יותר`
        : `${absDelta} אימונים פחות`

  if (trend.deltaPercent === null) {
    return `${countPart} לעומת ${period} הימים הקודמים`
  }

  const percentPart =
    trend.direction === 'flat'
      ? 'ללא שינוי באחוזים'
      : `${Math.abs(trend.deltaPercent)}%`

  if (trend.direction === 'flat') {
    return `${countPart} לעומת ${period} הימים הקודמים (${percentPart})`
  }

  return `${countPart} (${percentPart}) לעומת ${period} הימים הקודמים`
}

export function OrgTrendCard({ trend, period }: OrgTrendCardProps) {
  const Icon =
    trend.direction === 'up' ? TrendingUp : trend.direction === 'down' ? TrendingDown : Minus

  return (
    <Card className="flex h-full flex-col justify-between gap-4">
      <div>
        <p className="text-sm text-muted-foreground">השוואה לתקופה הקודמת</p>
        <h3 className="mt-1 text-lg">מגמה</h3>
      </div>
      <div className="flex items-end gap-3">
        <span
          className="flex size-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"
          aria-hidden="true"
        >
          <Icon className="size-5" />
        </span>
        <p className="text-base leading-snug text-foreground">{trendCopy(trend, period)}</p>
      </div>
    </Card>
  )
}
