import { ChevronDown } from 'lucide-react'
import { Card } from '@/components/shared/Card'

const CHECKS = [
  {
    title: 'התראות מותרות לאתר',
    text: 'בהגדרות האתר בדפדפן, ודאו שהתראות מוגדרות כ״מותר״ לאתר הזה.',
  },
  {
    title: 'התראות מערכת ומצב ריכוז',
    text: 'בהגדרות מערכת ההפעלה, ודאו שהתראות הדפדפן פעילות ושמצב ״נא לא להפריע״ או מצב ריכוז כבוי.',
  },
  {
    title: 'הלשונית נשארת פתוחה',
    text: 'התזכורות פועלות רק כשהאפליקציה פתוחה בדפדפן. סגירה של הלשונית או של הדפדפן עוצרת אותן.',
  },
]

/** Collapsible troubleshooting for "I did not get a notification". */
export function NotificationHelp() {
  return (
    <Card padded={false}>
      <details className="group">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 rounded-3xl px-5 font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
          לא קיבלתי התראה?
          <ChevronDown
            className="size-5 text-muted-foreground transition-transform duration-(--motion-base) group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <div className="flex flex-col gap-4 px-5 pb-5">
          <ol className="flex flex-col gap-3">
            {CHECKS.map(({ title, text }, index) => (
              <li key={title} className="flex gap-3">
                <span className="numeral flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm text-brand-ink">
                  {index + 1}
                </span>
                <p>
                  <span className="font-medium">{title}.</span>{' '}
                  <span className="text-muted-foreground">{text}</span>
                </p>
              </li>
            ))}
          </ol>
          <p className="text-sm text-muted-foreground">
            תזכורות כשהדפדפן סגור יגיעו בגרסה מאוחרת יותר.
          </p>
        </div>
      </details>
    </Card>
  )
}
