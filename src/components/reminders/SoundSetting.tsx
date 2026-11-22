import { useState } from 'react'
import { Card } from '@/components/shared/Card'
import { Switch } from '@/components/shared/Switch'
import { isReminderSoundOn, setReminderSoundOn } from '@/lib/reminderSound'

/** "Sound on reminders" toggle, saved per user and on by default. */
export function SoundSetting() {
  const [on, setOn] = useState(isReminderSoundOn)

  const update = (next: boolean) => {
    setReminderSoundOn(next)
    setOn(next)
  }

  return (
    <Card padded={false} className="flex items-center gap-3 px-5 py-2">
      <div className="min-w-0 flex-1">
        <p className="font-medium">צליל בתזכורת</p>
        <p className="text-sm text-muted-foreground">צליל עדין כשהתזכורת מופיעה והלשונית פתוחה.</p>
      </div>
      <Switch checked={on} onChange={update} label={`צליל בתזכורת ${on ? 'פעיל' : 'כבוי'}`} />
    </Card>
  )
}
