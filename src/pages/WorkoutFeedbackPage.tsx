import { PartyPopper } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'

export default function WorkoutFeedbackPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const raw = Number.parseInt(params.get('completion') ?? '', 10)
  const completion = Number.isNaN(raw) ? 0 : Math.min(Math.max(raw, 0), 100)

  return (
    <EmptyState
      icon={PartyPopper}
      title={completion === 100 ? 'כל הכבוד, סיימתם!' : `השלמתם ${completion}% מהאימון`}
      description="מסך המשוב יגיע בקרוב."
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <Button render={<Link to="/workouts" />}>חזרה לאימונים</Button>
          <Button variant="outline" render={<Link to={`/workouts/${id ?? ''}`} />}>
            לאימון
          </Button>
        </div>
      }
    />
  )
}
