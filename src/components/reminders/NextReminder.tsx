import { Bell, BellPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useNextReminder } from '@/hooks/useNextReminder'
import { describeNextReminder } from '@/lib/reminders'

/** Home card content: the next reminder, or a calm prompt to set one up. */
export function NextReminder() {
  const next = useNextReminder()

  if (!next) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-muted-foreground">
          <Bell className="size-5 shrink-0" aria-hidden="true" />
          אין תזכורות פעילות
        </p>
        <Button variant="outline" size="sm" render={<Link to="/reminders" />}>
          <BellPlus />
          הגדרת תזכורת
        </Button>
      </div>
    )
  }

  const { day, time } = describeNextReminder(next)

  return (
    <Link
      to="/reminders"
      className="flex min-h-11 items-center gap-3 rounded-2xl bg-brand-soft px-4 py-2 text-brand-ink outline-none focus-visible:ring-3 focus-visible:ring-ring"
    >
      <Bell className="size-5 shrink-0" aria-hidden="true" />
      <span className="flex flex-col leading-tight">
        <span className="text-sm">התזכורת הבאה</span>
        <span className="font-medium">
          {day}{' '}
          <span dir="ltr" className="numeral inline-block">
            {time}
          </span>
        </span>
      </span>
    </Link>
  )
}
