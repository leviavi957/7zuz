import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { ReminderDraft } from '@/hooks/useReminders'
import { DEFAULT_TIME, WORKDAYS, type Reminder } from '@/lib/reminders'
import { TimePicker } from '@/components/shared/TimePicker'
import { DayPicker } from './DayPicker'

interface ReminderFormProps {
  reminder?: Reminder
  onSave: (draft: ReminderDraft) => void
  onDelete?: () => void
}

function ReminderForm({ reminder, onSave, onDelete }: ReminderFormProps) {
  const [time, setTime] = useState<string | null>(reminder?.time ?? DEFAULT_TIME)
  const [days, setDays] = useState(reminder?.days ?? WORKDAYS)
  const valid = time !== null && days.length > 0

  return (
    <>
      <div className="flex flex-col gap-5 px-4">
        <TimePicker label="שעה" defaultValue={reminder?.time ?? DEFAULT_TIME} onChange={setTime} />
        <div className="flex flex-col gap-2">
          <span className="font-medium">ימים</span>
          <DayPicker value={days} onChange={setDays} />
          {days.length === 0 ? (
            <p role="alert" className="text-sm text-destructive">
              בחרו לפחות יום אחד.
            </p>
          ) : null}
        </div>
      </div>
      <SheetFooter className="pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button variant="brand" size="lg" disabled={!valid} onClick={() => time !== null && onSave({ time, days })}>
          שמירה
        </Button>
        {onDelete ? (
          <Button variant="destructive" size="lg" onClick={onDelete}>
            מחיקת התזכורת
          </Button>
        ) : null}
      </SheetFooter>
    </>
  )
}

interface ReminderSheetProps {
  open: boolean
  /** Reminder being edited; omit to create a new one. */
  reminder?: Reminder
  onClose: () => void
  onSave: (draft: ReminderDraft) => void
  onDelete: (id: string) => void
}

/** Bottom sheet for adding or editing one reminder. */
export function ReminderSheet({ open, reminder, onClose, onSave, onDelete }: ReminderSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(next) => (next ? undefined : onClose())}>
      <SheetContent side="bottom" className="mx-auto max-w-lg rounded-t-3xl">
        <SheetHeader>
          <SheetTitle className="text-xl">{reminder ? 'עריכת תזכורת' : 'תזכורת חדשה'}</SheetTitle>
          <SheetDescription>מתי להזכיר לכם לזוז?</SheetDescription>
        </SheetHeader>
        <ReminderForm
          reminder={reminder}
          onSave={onSave}
          onDelete={reminder ? () => onDelete(reminder.id) : undefined}
        />
      </SheetContent>
    </Sheet>
  )
}
