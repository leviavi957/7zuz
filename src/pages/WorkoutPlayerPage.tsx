import { Dumbbell } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { WorkoutPlayer } from '@/components/player/WorkoutPlayer'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { Skeleton } from '@/components/shared/Skeleton'
import { Button } from '@/components/ui/button'
import { useMockWorkout } from '@/mocks/useMockWorkout'

function PlayerFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-y-auto bg-background p-4">
      <div className="flex w-full max-w-md flex-col gap-4">{children}</div>
    </div>
  )
}

export default function WorkoutPlayerPage() {
  const { id } = useParams()
  const { status, workout, retry } = useMockWorkout(id)
  const back = (
    <Button variant="outline" render={<Link to={`/workouts/${id ?? ''}`} />}>
      חזרה לאימון
    </Button>
  )

  if (status === 'loading') {
    return (
      <PlayerFrame>
        <div role="status" aria-busy="true" aria-label="טוען אימון" className="flex flex-col items-center gap-4">
          <Skeleton className="size-40 rounded-full" />
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-14 w-full rounded-3xl" />
        </div>
      </PlayerFrame>
    )
  }

  if (status === 'error') {
    return (
      <PlayerFrame>
        <ErrorState onRetry={retry} />
        {back}
      </PlayerFrame>
    )
  }

  if (status === 'notFound' || !workout) {
    return (
      <PlayerFrame>
        <EmptyState
          icon={Dumbbell}
          title="האימון לא נמצא"
          action={
            <Button variant="outline" render={<Link to="/workouts" />}>
              חזרה לאימונים
            </Button>
          }
        />
      </PlayerFrame>
    )
  }

  return <WorkoutPlayer workout={workout} />
}
