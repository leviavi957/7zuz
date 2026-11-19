import { Dumbbell, House, RotateCcw } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { CompletionSummary } from '@/components/feedback/CompletionSummary'
import { FeedbackForm } from '@/components/feedback/FeedbackForm'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { Skeleton } from '@/components/shared/Skeleton'
import { Button } from '@/components/ui/button'
import { getCompletionStats } from '@/lib/completionStats'
import type { WorkoutFeedback } from '@/lib/feedback'
import { submitFeedback } from '@/mocks/submitFeedback'
import { useMockWorkout } from '@/mocks/useMockWorkout'
import { getWorkoutSteps } from '@/mocks/workoutSteps'
import type { Workout } from '@/mocks/workouts'

function FeedbackSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="טוען סיכום" className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <Skeleton className="h-96 rounded-3xl" />
      <Skeleton className="h-72 rounded-3xl" />
    </div>
  )
}

function parseCompletion(raw: string | null): number {
  const value = Number.parseInt(raw ?? '', 10)
  return Number.isNaN(value) ? 0 : Math.min(Math.max(value, 0), 100)
}

function FeedbackScreen({ workout, completion }: { workout: Workout; completion: number }) {
  const [params] = useSearchParams()
  const stats = useMemo(
    () => getCompletionStats(getWorkoutSteps(workout), completion),
    [workout, completion],
  )
  // ?state=submit-error simulates a failed send.
  const failSubmit = params.get('state') === 'submit-error'
  const onSubmit = (feedback: WorkoutFeedback) => submitFeedback(feedback, failSubmit)

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <CompletionSummary workoutTitle={workout.title} completion={completion} stats={stats} />
      <FeedbackForm workoutId={workout.id} completion={completion} onSubmit={onSubmit} />

      <nav aria-label="המשך" className="flex flex-col gap-2 sm:flex-row">
        <Button variant="brand" size="lg" className="h-14 flex-1 text-lg" render={<Link to="/workouts" />}>
          <Dumbbell />
          לאימון נוסף
        </Button>
        {completion < 100 ? (
          <Button
            variant="outline"
            size="lg"
            className="h-14 flex-1"
            render={<Link to={`/workouts/${workout.id}/play`} replace />}
          >
            <RotateCcw />
            להתחיל מחדש
          </Button>
        ) : null}
        <Button variant="ghost" size="lg" className="h-14 flex-1" render={<Link to="/" />}>
          <House />
          חזרה לבית
        </Button>
      </nav>
    </div>
  )
}

export default function WorkoutFeedbackPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { status, workout, retry } = useMockWorkout(id)

  if (status === 'loading') return <FeedbackSkeleton />

  if (status === 'error') {
    return <ErrorState onRetry={retry} className="mx-auto max-w-2xl" />
  }

  if (status === 'notFound' || !workout) {
    return (
      <EmptyState
        icon={Dumbbell}
        title="האימון לא נמצא"
        description="אי אפשר להציג סיכום לאימון שלא קיים."
        action={
          <Button variant="outline" render={<Link to="/workouts" />}>
            חזרה לאימונים
          </Button>
        }
      />
    )
  }

  return <FeedbackScreen workout={workout} completion={parseCompletion(params.get('completion'))} />
}
