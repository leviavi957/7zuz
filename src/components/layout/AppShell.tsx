import { Outlet, useLocation } from 'react-router-dom'
import { BackgroundShapes } from '@/components/shared/BackgroundShapes'
import { usePersistentFlag } from '@/hooks/usePersistentState'
import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function AppShell() {
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = usePersistentFlag(
    'sidebar-collapsed',
    () => window.innerWidth < 1024,
  )

  return (
    <div className="relative isolate flex min-h-svh bg-background">
      <BackgroundShapes />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main
          key={pathname}
          className="mx-auto w-full max-w-6xl flex-1 p-4 pb-28 duration-(--motion-slow) ease-calm animate-in fade-in slide-in-from-bottom-2 md:p-8 md:pb-10"
        >
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
