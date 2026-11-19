import { Bell, Plus, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { NotificationBanner } from '@/components/reminders/NotificationBanner'
import { ReminderRow, ReminderRowSkeleton } from '@/components/reminders/ReminderRow'
import { ReminderSheet } from '@/components/reminders/ReminderSheet'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
import { useNotificationPermission } from '@/hooks/useNotificationPermission'
import { useReminders, type ReminderDraft } from '@/hooks/useReminders'

/** `null` = closed, `'new'` = creating, otherwise the id being edited. */
type SheetTarget = null | 'new' | string

export default function RemindersPage() {
  const { status, reminders, add, addRecommended, update, remove, retry } = useReminders()
  const { access, request } = useNotificationPermission()
  const [sheet, setSheet] = useState<SheetTarget>(null)

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
            התזכורות מופיעות כל עוד האפליקציה פתוחה בדפדפן.
          </p>
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
