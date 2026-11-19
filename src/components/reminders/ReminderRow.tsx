import { ChevronLeft } from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { Skeleton } from '@/components/shared/Skeleton'
import { Switch } from '@/components/shared/Switch'
import { formatDays, type Reminder } from '@/lib/reminders'
import { cn } from '@/lib/utils'

interface ReminderRowProps {
  reminder: Reminder
  onEdit: () => void
  onToggle: (enabled: boolean) => void
}

/** Time and days (tap to edit) with an on/off switch. */
export function ReminderRow({ reminder, onEdit, onToggle }: ReminderRowProps) {
  const summary = formatDays(reminder.days)

  return (
    <Card padded={false} className="flex items-center gap-2 ps-5 pe-3">
      <button
        type="button"
        onClick={onEdit}
        aria-label={`עריכת תזכורת ${reminder.time}, ${summary}`}
        className="flex min-h-20 flex-1 items-center gap-3 rounded-2xl text-start outline-none focus-visible:ring-3 focus-visible:ring-ring"
      >
        <span
          dir="ltr"
          className={cn(
            'numeral text-4xl transition-opacity duration-(--motion-base)',
            !reminder.enabled && 'opacity-40',
          )}
        >
          {reminder.time}
        </span>
        <span className={cn('text-muted-foreground', !reminder.enabled && 'opacity-60')}>
          {summary}
        </span>
        <ChevronLeft className="ms-auto size-5 text-muted-foreground" aria-hidden="true" />
      </button>
      <Switch
        checked={reminder.enabled}
        onChange={onToggle}
        label={`תזכורת ${reminder.time} ${reminder.enabled ? 'פעילה' : 'כבויה'}`}
      />
    </Card>
  )
}

export function ReminderRowSkeleton() {
  return <Skeleton className="h-20 rounded-3xl" />
}
