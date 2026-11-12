import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { MoreSheet } from './MoreSheet'
import { NAV_ITEMS } from './nav-items'

export function BottomNav() {
  return (
    <nav
      aria-label="ניווט ראשי"
      className="fixed inset-x-0 bottom-0 z-30 border-t bg-card px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden"
    >
      <div className="flex items-stretch gap-1">
        {NAV_ITEMS.filter((item) => item.primary).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl text-xs transition-colors duration-(--motion-base)',
                isActive ? 'bg-secondary font-medium text-secondary-foreground' : 'text-muted-foreground',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="size-6" aria-hidden="true" />
                <span>{label}</span>
                <span
                  aria-hidden="true"
                  className={cn('h-0.5 w-5 rounded-full', isActive ? 'bg-brand-graphic' : 'bg-transparent')}
                />
              </>
            )}
          </NavLink>
        ))}
        <MoreSheet />
      </div>
    </nav>
  )
}
