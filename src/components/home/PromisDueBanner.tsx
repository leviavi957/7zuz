import { ClipboardList } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/ui/button'
import { usePromis } from '@/hooks/usePromis'
import { useSession } from '@/hooks/useSession'
import { isTrainingRole } from '@/lib/auth'

/**
 * Gentle Home reminder when a monthly PROMIS fill is due. Never a blocking
 * popup. Hidden for non-training roles, while loading, on error, or when not due.
 */
export function PromisDueBanner() {
  const session = useSession()
  const { status, due, latest } = usePromis()
  if (!isTrainingRole(session?.role) || status !== 'ready' || !due) return null

  return (
    <Card tone="brand" className="flex flex-wrap items-center gap-3 p-4 md:p-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-card text-brand-ink">
        <ClipboardList className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium">זמן לעדכן את שאלון איכות החיים</p>
        <p className="text-sm text-muted-foreground">
          {latest
            ? 'עבר חודש מהמילוי האחרון. חמש שאלות קצרות, בלי לחץ.'
            : 'עדיין לא מילאתם את השאלון. חמש שאלות קצרות, בלי לחץ.'}
        </p>
      </div>
      <Button variant="brand" render={<Link to="/questionnaires?fill=promis" />}>
        מילוי עכשיו
      </Button>
    </Card>
  )
}
