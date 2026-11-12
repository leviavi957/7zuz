import { Bell, Dumbbell, Play, Quote } from 'lucide-react'
import { BackgroundShapes } from '@/components/shared/BackgroundShapes'
import { Badge } from '@/components/shared/Badge'
import { Card, CardHeader } from '@/components/shared/Card'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { Heatmap } from '@/components/shared/Heatmap'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { ProgressRing } from '@/components/shared/ProgressRing'
import { Skeleton } from '@/components/shared/Skeleton'
import { TodayProgress } from '@/components/shared/TodayProgress'
import { Button } from '@/components/ui/button'
import type { HomeData } from '@/mocks/home'
import { useMockHome } from '@/mocks/useMockHome'

function HomeSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="טוען" className="flex flex-col gap-5">
      <Skeleton className="h-9 w-56" />
      <Card className="grid gap-6 md:grid-cols-[18rem_1fr] md:items-center">
        <Skeleton className="mx-auto size-56 rounded-full md:size-72" />
        <div className="flex flex-col gap-5">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3 w-full rounded-full" />
          <Skeleton className="h-3 w-full rounded-full" />
          <Skeleton className="h-11 w-40 rounded-full" />
        </div>
      </Card>
      <div className="grid gap-5 md:grid-cols-2">
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-32 rounded-3xl" />
      </div>
      <Skeleton className="h-52 rounded-3xl" />
    </div>
  )
}

function Hero({ data }: { data: HomeData }) {
  const remaining = Math.max(data.weekGoal - data.weekDone, 0)

  return (
    <Card className="relative isolate overflow-hidden p-5 md:p-8">
      <BackgroundShapes />
      <div className="grid gap-6 md:grid-cols-[18rem_1fr] md:items-center md:gap-10">
        <ProgressRing
          value={data.weekDone}
          max={data.weekGoal}
          label="אימונים השבוע"
          caption="אימונים השבוע"
          className="mx-auto w-48 md:w-72"
        />
        <div className="flex flex-col gap-5">
          <div>
            <h2 className="text-2xl md:text-3xl">השבוע שלך בתנועה</h2>
            <p className="text-muted-foreground">
              {remaining > 0 ? `עוד ${remaining} אימונים ליעד השבועי` : 'הגעת ליעד השבועי. כל הכבוד!'}
            </p>
          </div>
          <ProgressBar
            label="רצף ימים"
            valueText={`${data.streak} ימים ברצף`}
            value={data.streak}
            max={data.streakDays}
            segments={data.streakDays}
          />
          <ProgressBar
            label="היעד החודשי"
            valueText={`${data.monthDone} מתוך ${data.monthGoal}`}
            value={data.monthDone}
            max={data.monthGoal}
            tone="primary"
          />
          <Button variant="brand" size="lg" className="self-start">
            <Play />
            התחלת אימון
          </Button>
        </div>
      </div>
    </Card>
  )
}

function HomeContent({ data }: { data: HomeData }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-muted-foreground">הנה השבוע שלך, בקצרה</p>
        <h2 className="text-3xl md:text-4xl">בוקר טוב, {data.name}</h2>
      </div>

      <Hero data={data} />

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="flex flex-col justify-between gap-4">
          <TodayProgress done={data.todayDone} total={data.todayTotal} />
          <Badge variant="brand" className="self-start">
            <Bell className="size-3.5" aria-hidden="true" />
            התזכורת הבאה {data.nextReminder}
          </Badge>
        </Card>
        <Card tone="sage" className="flex flex-col gap-3">
          <Quote className="size-6 text-sage-ink" aria-hidden="true" />
          <p className="text-lg font-medium">{data.tip}</p>
        </Card>
      </div>

      <Card>
        <CardHeader title="12 שבועות אחרונים" description="כל ריבוע הוא יום של פעילות" />
        <Heatmap
          levels={data.heat}
          todayIndex={data.todayIndex}
          label="מפת פעילות של 12 השבועות האחרונים. היום מסומן בצבע המותג."
        />
      </Card>
    </div>
  )
}

export default function HomePage() {
  const { status, data, retry } = useMockHome()

  if (status === 'loading') return <HomeSkeleton />
  if (status === 'error') return <ErrorState onRetry={retry} />
  if (status === 'empty') {
    return (
      <EmptyState
        icon={Dumbbell}
        title="עוד לא התחלת להתאמן"
        description="האימון הראשון לוקח שתי דקות. אחריו תראו כאן את ההתקדמות שלכם."
        action={
          <Button variant="brand" size="lg">
            <Play />
            התחלת אימון ראשון
          </Button>
        }
      />
    )
  }
  return <HomeContent data={data} />
}
