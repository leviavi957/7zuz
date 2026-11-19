import { BellOff, BellRing, Info } from 'lucide-react'
import type { ReactNode } from 'react'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/ui/button'
import type { NotificationAccess } from '@/hooks/useNotificationPermission'

interface NotificationBannerProps {
  access: NotificationAccess
  onEnable: () => void
}

function Banner({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <Card tone="brand" className="flex flex-wrap items-center gap-3 p-4 md:p-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-card text-brand-ink">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
      {action}
    </Card>
  )
}

/** Explains and requests notification access; hidden once it is granted. */
export function NotificationBanner({ access, onEnable }: NotificationBannerProps) {
  if (access === 'granted') return null

  if (access === 'default') {
    return (
      <Banner
        icon={<BellRing className="size-5" aria-hidden="true" />}
        title="אפשרו התראות"
        text="בלי אישור, לא נוכל להציג את התזכורות."
        action={
          <Button variant="brand" onClick={onEnable}>
            אפשר
          </Button>
        }
      />
    )
  }

  if (access === 'denied') {
    return (
      <Banner
        icon={<BellOff className="size-5" aria-hidden="true" />}
        title="ההתראות חסומות"
        text="אפשר להפעיל אותן בהגדרות האתר בדפדפן ואז לרענן את הדף."
      />
    )
  }

  return (
    <Banner
      icon={<Info className="size-5" aria-hidden="true" />}
      title="הדפדפן לא תומך בהתראות"
      text="אפשר לשמור תזכורות, אבל לא נוכל להציג אותן בדפדפן הזה."
    />
  )
}
