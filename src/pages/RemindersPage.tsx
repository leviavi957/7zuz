import { Bell, Plus, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { NotificationBanner } from '@/components/reminders/NotificationBanner'
import { NotificationHelp } from '@/components/reminders/NotificationHelp'
import { SoundSetting } from '@/components/reminders/SoundSetting'
import { TestNotifications } from '@/components/reminders/TestNotifications'
import { ReminderRow, ReminderRowSkeleton } from '@/components/reminders/ReminderRow'
import { ReminderSheet } from '@/components/reminders/ReminderSheet'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
import { useNotificationPermission } from '@/hooks/useNotificationPermission'
import { useNextReminder } from '@/hooks/useNextReminder'
import { useReminders, type ReminderDraft } from '@/hooks/useReminders'
import { describeNextReminder, type NextReminder } from '@/lib/reminders'

/** `null` = closed, `'new'` = creating, otherwise the id being edited. */
type SheetTarget = null | 'new' | string

function NextReminderLine({ next }: { next: NextReminder }) {
  const { day, time } = describeNextReminder(next)
  return (
    <p className="flex items-center gap-2 font-medium">
      <Bell className="size-5 text-brand-ink" aria-hidden="true" />
      <span>
        התזכורת הבאה: {day}{' '}
        <span dir="ltr" className="numeral inline-block">
          {time}
        </span>
      </span>
    </p>
  )
}

export default function RemindersPage() {
  const { status, reminders, add, addRecommended, update, remove, retry } = useReminders()
  const { access, request } = useNotificationPermission()
  const [sheet, setSheet] = useState<SheetTarget>(null)

  const next = useNextReminder(reminders)
  const editing = reminders.find((item) => item.id === sheet)
  const close = () => setSheet(null)

  const save = (draft: ReminderDraft) => {
    if (editing) update(editing.id, draft)
    else add(draft)
    close()
  }

  const onDelete = (id: string) => {
    remove(id)
    close()
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-3xl md:text-4xl">תזכורות</h2>
          <p className="text-muted-foreground">הפסקות תנועה קצרות לאורך יום העבודה.</p>
        </div>
        {status === 'ready' && reminders.length > 0 ? (
          <Button variant="brand" onClick={() => setSheet('new')}>
            <Plus />
            תזכורת חדשה
          </Button>
        ) : null}
      </header>

      {status === 'error' ? (
        <ErrorState onRetry={retry} />
      ) : (
        <>
          <NotificationBanner access={access} onEnable={request} />

          {status === 'ready' && next ? <NextReminderLine next={next} /> : null}

          {status === 'loading' ? (
            <div role="status" aria-busy="true" aria-label="טוען תזכורות" className="flex flex-col gap-3">
              <ReminderRowSkeleton />
              <ReminderRowSkeleton />
              <ReminderRowSkeleton />
            </div>
          ) : reminders.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="אין תזכורות עדיין"
              description="התחילו בסט מומלץ של שלוש הפסקות ביום, או הגדירו שעה משלכם."
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Button variant="brand" onClick={addRecommended}>
                    <Sparkles />
                    הוספת סט מומלץ
                  </Button>
                  <Button variant="outline" onClick={() => setSheet('new')}>
                    <Plus />
                    תזכורת חדשה
                  </Button>
                </div>
              }
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {reminders.map((reminder) => (
                <li key={reminder.id}>
                  <ReminderRow
                    reminder={reminder}
                    onEdit={() => setSheet(reminder.id)}
                    onToggle={(enabled) => update(reminder.id, { enabled })}
                  />
                </li>
              ))}
            </ul>
          )}

          <p className="text-sm text-muted-foreground">
            התזכורות מופיעות כל עוד האפליקציה פתוחה בדפדפן, גם בלשונית אחרת. ההתראה והצליל תלויים
            בהגדרות ההתראות של המכשיר.
          </p>
          <SoundSetting />
          <TestNotifications request={request} />
          <NotificationHelp />
        </>
      )}

      <ReminderSheet
        open={sheet !== null}
        reminder={editing}
        onClose={close}
        onSave={save}
        onDelete={onDelete}
      />
    </div>
  )
}
