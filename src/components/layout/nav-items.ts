import {
  Building2,
  ClipboardList,
  Dumbbell,
  House,
  User,
  Bell,
  type LucideIcon,
} from 'lucide-react'
import type { Role } from '@/lib/auth'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  /** Shown in the mobile bottom bar (the rest go to the "More" sheet). */
  primary: boolean
}

/** Full employee / team navigation. */
export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'בית', icon: House, primary: true },
  { to: '/workouts', label: 'אימונים', icon: Dumbbell, primary: true },
  { to: '/reminders', label: 'תזכורות', icon: Bell, primary: true },
  { to: '/profile', label: 'פרופיל', icon: User, primary: true },
  { to: '/questionnaires', label: 'שאלונים', icon: ClipboardList, primary: false },
]

const TRAINER_NAV: NavItem[] = [
  { to: '/org', label: 'לוח בקרה', icon: Building2, primary: true },
  { to: '/workouts', label: 'אימונים', icon: Dumbbell, primary: true },
]

const ORG_MANAGER_NAV: NavItem[] = [
  { to: '/org', label: 'לוח בקרה', icon: Building2, primary: true },
]

/** Role-aware navigation — single source of truth for sidebar, bottom nav, More. */
export function getNavItemsForRole(role: Role | null | undefined): NavItem[] {
  if (role === 'org_manager') return ORG_MANAGER_NAV
  if (role === 'trainer') return TRAINER_NAV
  return NAV_ITEMS
}

const EXTRA_TITLES: Record<string, string> = {
  '/design': 'מערכת עיצוב',
  '/onboarding': 'ברוכים הבאים',
  '/org': 'לוח בקרה',
  '/admin': 'ניהול',
}

export function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/org')) return EXTRA_TITLES['/org']
  const match = NAV_ITEMS.find((item) =>
    item.to === '/' ? pathname === '/' : pathname.startsWith(item.to),
  )
  return match?.label ?? EXTRA_TITLES[pathname] ?? '7ZUZ'
}
