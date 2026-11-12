import { PanelRightClose, PanelRightOpen } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Logo } from './Logo'
import { NAV_ITEMS } from './nav-items'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-svh shrink-0 flex-col border-e bg-sidebar p-3 transition-[width] duration-(--motion-slow) ease-calm md:flex',
        collapsed ? 'w-[4.75rem]' : 'w-64',
      )}
    >
      <div className={cn('flex items-center py-2', collapsed ? 'justify-center' : 'px-2')}>
        <Logo compact={collapsed} />
      </div>

      <nav aria-label="ניווט ראשי" className="mt-6 flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            title={collapsed ? label : undefined}
            aria-label={collapsed ? label : undefined}
            className={({ isActive }) =>
              cn(
                'relative flex min-h-11 items-center gap-3 rounded-2xl px-3 text-base transition-colors duration-(--motion-base) hover:bg-accent',
                collapsed && 'justify-center px-0',
                isActive
                  ? 'bg-secondary font-medium text-secondary-foreground after:absolute after:inset-y-3 after:end-0 after:w-1 after:rounded-full after:bg-brand-graphic'
                  : 'text-muted-foreground hover:text-foreground',
              )
            }
          >
            <Icon className="size-5 shrink-0" aria-hidden="true" />
            {collapsed ? null : <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <Button
        variant="ghost"
        size={collapsed ? 'icon' : 'default'}
        onClick={onToggle}
        aria-expanded={!collapsed}
        aria-label={collapsed ? 'הרחבת תפריט' : 'כיווץ תפריט'}
        className={cn('justify-start text-muted-foreground', collapsed && 'self-center')}
      >
        {collapsed ? <PanelRightOpen /> : <PanelRightClose />}
        {collapsed ? null : <span>כיווץ</span>}
      </Button>
    </aside>
  )
}
