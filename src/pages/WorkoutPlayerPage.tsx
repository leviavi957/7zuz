import { Dumbbell } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PreWorkoutDialog } from '@/components/preworkout/PreWorkoutDialog'
import { WorkoutPlayer } from '@/components/player/WorkoutPlayer'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { BackgroundShapes } from '@/components/shared/BackgroundShapes'
import { BasadMark } from '@/components/shared/BasadMark'
import { Skeleton } from '@/components/shared/Skeleton'
import { Button } from '@/components/ui/button'
import { useSession } from '@/hooks/useSession'
import { isTrainerPreview } from '@/lib/auth'
import { needsQuestionnaire } from '@/lib/preWorkout'
import { useMockWorkout } from '@/mocks/useMockWorkout'

function PlayerFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-y-auto bg-background p-4">
      <BasadMark className="absolute start-4 top-3" />
      <div className="flex w-full max-w-md flex-col gap-4">{children}</div>
    </div>
  )
}

export default function WorkoutPlayerPage() {
  const { id } = useParams()
  const { status, workout, retry } = useMockWorkout(id)
  const navigate = useNavigate()
  const session = useSession()
  const preview = isTrainerPreview(session?.role)
  // The workout starts only once the health check is passed: still valid, or just completed.
  const [gate, setGate] = useState<'checking' | 'required' | 'passed'>('checking')

  useEffect(() => {
    let cancelled = false
    needsQuestionnaire()
      .catch(() => true)
      .then((needed) => {
        if (!cancelled) setGate(needed ? 'required' : 'passed')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const back = (
    <Button variant="outline" render={<Link to={`/workouts/${id ?? ''}`} />}>
      חזרה לאימון
    </Button>
  )

  if (status === 'loading' || gate === 'checking') {
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

  if (gate === 'required') {
    return (
      <div className="fixed inset-0 isolate bg-background">
        <BackgroundShapes />
        <BasadMark className="absolute start-4 top-3" />
        <PreWorkoutDialog
          workoutTitle={workout.title}
          onCancel={() => navigate(`/workouts/${workout.id}`, { replace: true })}
          onComplete={() => setGate('passed')}
        />
      </div>
    )
  }

  return <WorkoutPlayer workout={workout} preview={preview} />
}
