import { Dumbbell } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { WORKOUTS } from '@/mocks/workouts'

export default function WorkoutDetailPage() {
  const { id } = useParams()
  const workout = WORKOUTS.find((w) => w.id === id)

  return (
    <EmptyState
      icon={Dumbbell}
      title={workout?.title ?? 'האימון לא נמצא'}
      description={workout ? 'מסך האימון יגיע בקרוב.' : 'האימון שחיפשתם לא קיים.'}
      action={
        <Button variant="outline" render={<Link to="/workouts" />}>
          חזרה לאימונים
        </Button>
      }
    />
  )
}
