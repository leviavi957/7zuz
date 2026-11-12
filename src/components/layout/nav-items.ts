import { ClipboardList, Dumbbell, House, User, Bell, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  /** Shown in the mobile bottom bar (the rest go to the "More" sheet). */
  primary: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'בית', icon: House, primary: true },
  { to: '/workouts', label: 'אימונים', icon: Dumbbell, primary: true },
  { to: '/reminders', label: 'תזכורות', icon: Bell, primary: true },
  { to: '/profile', label: 'פרופיל', icon: User, primary: true },
  { to: '/questionnaires', label: 'שאלונים', icon: ClipboardList, primary: false },
]

const EXTRA_TITLES: Record<string, string> = {
  '/design': 'מערכת עיצוב',
}

export function getPageTitle(pathname: string): string {
  const match = NAV_ITEMS.find((item) =>
    item.to === '/' ? pathname === '/' : pathname.startsWith(item.to),
  )
  return match?.label ?? EXTRA_TITLES[pathname] ?? '7ZUZ'
}
