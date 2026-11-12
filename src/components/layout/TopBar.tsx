import { useLocation } from 'react-router-dom'
import { BrandPreview } from '@/components/demo/BrandPreview'
import { ThemeToggle } from '@/theme/ThemeToggle'
import { Logo } from './Logo'
import { getPageTitle } from './nav-items'

export function TopBar() {
  const { pathname } = useLocation()

  return (
    <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-3 border-b bg-background/95 px-4 md:px-8">
      <div className="flex items-center gap-3">
        <Logo compact className="md:hidden" />
        <h1 className="text-xl md:text-2xl">{getPageTitle(pathname)}</h1>
      </div>
      <div className="flex items-center gap-1">
        <BrandPreview />
        <ThemeToggle />
      </div>
    </header>
  )
}
