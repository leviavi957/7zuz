import { ChevronRight, Clock, Dumbbell } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge, type BadgeVariant } from '@/components/shared/Badge'
import { Card } from '@/components/shared/Card'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { Skeleton } from '@/components/shared/Skeleton'
import { Button } from '@/components/ui/button'
import { StartBar } from '@/components/workouts/StartBar'
import { WorkoutStructure } from '@/components/workouts/WorkoutStructure'
import { WorkoutThumbnail } from '@/components/workouts/WorkoutThumbnail'
import { formatMinutes, getTotalSeconds } from '@/lib/workoutTimeline'
import { useMockWorkout } from '@/mocks/useMockWorkout'
import { getWorkoutSteps } from '@/mocks/workoutSteps'
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  type Workout,
  type WorkoutDifficulty,
} from '@/mocks/workouts'

const difficultyVariant: Record<WorkoutDifficulty, BadgeVariant> = {
  easy: 'sage',
  medium: 'brand',
  hard: 'solid',
}

function BackLink() {
  return (
    <Link
      to="/workouts"
      className="inline-flex min-h-11 items-center gap-1 self-start rounded-full pe-3 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring"
    >
      <ChevronRight className="size-5" aria-hidden="true" />
      חזרה לאימונים
    </Link>
  )
}

function DetailSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="טוען אימון" className="flex flex-col gap-5">
      <Skeleton className="h-6 w-36" />
      <div className="overflow-hidden rounded-3xl border bg-card shadow-soft">
        <Skeleton className="h-44 rounded-none" />
        <div className="flex flex-col gap-3 p-6">
          <Skeleton className="h-6 w-40 rounded-full" />
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
      <Skeleton className="h-20 rounded-3xl" />
    </div>
  )
}

function WorkoutDetail({ workout }: { workout: Workout }) {
  const steps = useMemo(() => getWorkoutSteps(workout), [workout])
  const minutes = formatMinutes(getTotalSeconds(steps))

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 pb-28 md:pb-0">
      <BackLink />

      <Card padded={false} className="overflow-hidden">
        <WorkoutThumbnail category={workout.category} className="h-44 md:h-56" />
        <div className="flex flex-col gap-4 p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={difficultyVariant[workout.difficulty]}>
              {DIFFICULTY_LABELS[workout.difficulty]}
            </Badge>
            <Badge>{CATEGORY_LABELS[workout.category]}</Badge>
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl">{workout.title}</h2>
            <p className="mt-1 text-muted-foreground">{workout.description}</p>
          </div>
          <p className="flex items-center gap-2 text-lg font-medium">
            <Clock className="size-5 text-brand-ink" aria-hidden="true" />
            {minutes} דק&apos;
          </p>
          <StartBar workoutId={workout.id} />
        </div>
      </Card>

      <WorkoutStructure steps={steps} />
    </div>
  )
}

export default function WorkoutDetailPage() {
  const { id } = useParams()
  const { status, workout, retry } = useMockWorkout(id)

  if (status === 'loading') return <DetailSkeleton />

  if (status === 'error') {
    return (
      <div className="flex flex-col gap-4">
        <BackLink />
        <ErrorState onRetry={retry} />
      </div>
    )
  }

  if (status === 'notFound' || !workout) {
    return (
      <EmptyState
        icon={Dumbbell}
        title="האימון לא נמצא"
        description="האימון שחיפשתם לא קיים או הוסר."
        action={
          <Button variant="outline" render={<Link to="/workouts" />}>
            חזרה לאימונים
          </Button>
        }
      />
    )
  }

  return <WorkoutDetail workout={workout} />
}
