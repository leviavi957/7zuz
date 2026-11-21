import { Card } from '@/components/shared/Card'
import { Switch } from '@/components/shared/Switch'
import { usePersistentFlag } from '@/hooks/usePersistentState'
import { REMINDER_SOUND_KEY } from '@/lib/reminderSound'

/** "Sound on reminders" toggle, saved in settings and on by default. */
export function SoundSetting() {
  const [on, setOn] = usePersistentFlag(REMINDER_SOUND_KEY, () => true)

  return (
    <Card padded={false} className="flex items-center gap-3 px-5 py-2">
      <div className="min-w-0 flex-1">
        <p className="font-medium">צליל בתזכורת</p>
        <p className="text-sm text-muted-foreground">צליל עדין כשהתזכורת מופיעה והלשונית פתוחה.</p>
      </div>
      <Switch checked={on} onChange={setOn} label={`צליל בתזכורת ${on ? 'פעיל' : 'כבוי'}`} />
    </Card>
  )
}
