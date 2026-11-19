import { Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

/**
 * One-tap start. Sticky above the bottom nav on phones; inline and prominent
 * from tablet width up.
 */
export function StartBar({ workoutId }: { workoutId: string }) {
  return (
    <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-20 border-t bg-background p-3 md:static md:z-auto md:border-0 md:bg-transparent md:p-0">
      <Button
        variant="brand"
        size="lg"
        className="h-14 w-full text-lg md:max-w-sm"
        render={<Link to={`/workouts/${workoutId}/play`} />}
      >
        <Play />
        התחלת אימון
      </Button>
      <p className="mt-2 text-xs text-muted-foreground">
        האימון מתאים למי שמילא את שאלון הבריאות. במקרה של כאב או סחרחורת, הפסק.
      </p>
    </div>
  )
}
