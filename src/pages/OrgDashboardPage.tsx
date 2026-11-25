import { BarChart3, Inbox } from 'lucide-react'
import { useState } from 'react'
import { OrgWorkoutsLineChart, OrgWeekdayBarChart } from '@/components/org/OrgCharts'
import { OrgHeader } from '@/components/org/OrgHeader'
import { OrgKpiCards } from '@/components/org/OrgKpiCards'
import { OrgPrivacyEmpty } from '@/components/org/OrgPrivacyEmpty'
import { OrgReports } from '@/components/org/OrgReports'
import { OrgTrendCard } from '@/components/org/OrgTrendCard'
import { Card } from '@/components/shared/Card'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { Skeleton } from '@/components/shared/Skeleton'
import { useMockOrgStats } from '@/mocks/useMockOrgStats'
import type { OrgPeriod, OrgStats } from '@/mocks/orgStats'

function OrgSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="טוען לוח בקרה" className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="size-14 rounded-2xl" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-48" />
          </div>
        </div>
        <Skeleton className="h-12 w-full rounded-2xl md:max-w-sm" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-28 rounded-3xl" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <Skeleton className="h-80 rounded-3xl" />
        <Skeleton className="h-80 rounded-3xl" />
      </div>
      <Skeleton className="h-72 rounded-3xl" />
    </div>
  )
}

function OrgDashboardContent({ data, period, onPeriodChange }: {
  data: OrgStats
  period: OrgPeriod
  onPeriodChange: (period: OrgPeriod) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <OrgHeader
        organization={data.organization}
        period={period}
        onPeriodChange={onPeriodChange}
      />

      {data.insufficientData ? (
        <OrgPrivacyEmpty />
      ) : data.kpis ? (
        <>
          <OrgKpiCards kpis={data.kpis} />
          <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
            <OrgWorkoutsLineChart data={data.workoutsOverTime} />
            {data.trend ? <OrgTrendCard trend={data.trend} period={period} /> : null}
          </div>
          <OrgWeekdayBarChart data={data.workoutsByWeekday} />
        </>
      ) : null}

      <OrgReports orgId={data.organization.id} />

      <Card tone="sage" className="text-sm text-muted-foreground">
        הנתונים בלוח זה אנונימיים ומסוכמים בלבד. לא מוצגים שמות, כתובות אימייל או קודים אישיים.
      </Card>
    </div>
  )
}

export default function OrgDashboardPage() {
  const [period, setPeriod] = useState<OrgPeriod>(30)
  const { status, data, retry } = useMockOrgStats(period)

  if (status === 'loading') return <OrgSkeleton />
  if (status === 'error') return <ErrorState onRetry={retry} />
  if (status === 'empty') {
    return (
      <EmptyState
        icon={Inbox}
        title="אין נתונים להצגה"
        description="לא נמצאו נתונים מצטברים לתקופה שנבחרה."
      />
    )
  }
  if (!data) {
    return (
      <EmptyState
        icon={BarChart3}
        title="אין נתונים להצגה"
        description="לא הצלחנו להציג את לוח הבקרה כרגע."
      />
    )
  }

  return (
    <OrgDashboardContent data={data} period={period} onPeriodChange={setPeriod} />
  )
}
