import { BellRing, Timer } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { NotificationAccess } from '@/hooks/useNotificationPermission'
import { announceReminder, checkTestAccess, type TestResult } from '@/lib/announceReminder'

const DELAY_SECONDS = 10
const TICK_MS = 250

const PROBLEMS: Record<Exclude<TestResult, 'sent'>, string> = {
  default: 'לא אישרתם התראות, ולכן אי אפשר לשלוח התראת בדיקה. לחצו על ״אפשר״ ונסו שוב.',
  denied: 'ההתראות חסומות בדפדפן. אפשר להפעיל אותן בהגדרות האתר ואז לנסות שוב.',
  unsupported: 'הדפדפן הזה לא תומך בהתראות, ולכן אי אפשר לשלוח בדיקה.',
}

/**
 * Two ways to try a notification: right now, or after a short countdown so the
 * app can be moved to a background tab first.
 */
export function TestNotifications({ request }: { request: () => Promise<NotificationAccess> }) {
  const [problem, setProblem] = useState<string | null>(null)
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const timers = useRef<{ tick?: number; fire?: number }>({})

  const stopTimers = () => {
    window.clearInterval(timers.current.tick)
    window.clearTimeout(timers.current.fire)
  }

  useEffect(() => stopTimers, [])

  /** True when notifications are allowed; otherwise explains why not. */
  const ensureAccess = async (): Promise<boolean> => {
    let result = checkTestAccess()
    // The tap is the user gesture the browser needs to show its permission prompt.
    if (result === 'default' && (await request()) === 'granted') result = 'sent'
    setProblem(result === 'sent' ? null : PROBLEMS[result])
    return result === 'sent'
  }

  const sendNow = async () => {
    if (await ensureAccess()) announceReminder('test')
  }

  const sendDelayed = async () => {
    if (!(await ensureAccess())) return
    stopTimers()
    const endsAt = Date.now() + DELAY_SECONDS * 1000
    setSecondsLeft(DELAY_SECONDS)
    // Background tabs slow timers down, so the countdown reads the clock instead of counting ticks.
    timers.current.tick = window.setInterval(
      () => setSecondsLeft(Math.max(Math.ceil((endsAt - Date.now()) / 1000), 0)),
      TICK_MS,
    )
    timers.current.fire = window.setTimeout(() => {
      stopTimers()
      setSecondsLeft(null)
      announceReminder('test')
    }, DELAY_SECONDS * 1000)
  }

  const counting = secondsLeft !== null

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={sendNow}>
          <BellRing />
          שלח התראת בדיקה
        </Button>
        <Button variant="outline" disabled={counting} onClick={sendDelayed}>
          <Timer />
          {counting ? 'ההתראה בדרך…' : `בדיקה בעוד ${DELAY_SECONDS} שניות`}
        </Button>
      </div>

      {counting ? (
        <div role="status" className="flex items-center gap-3 rounded-2xl bg-brand-soft px-4 py-3 text-brand-ink">
          <span className="numeral text-4xl" aria-hidden="true">
            {secondsLeft}
          </span>
          <p>ההתראה תגיע בעוד {DELAY_SECONDS} שניות מרגע הלחיצה. עבור ללשונית אחרת וחכה.</p>
        </div>
      ) : null}

      {problem ? (
        <p role="status" className="text-sm text-destructive">
          {problem}
        </p>
      ) : null}
    </div>
  )
}
