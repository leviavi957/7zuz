import { Ellipsis } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from './nav-items'

const tabClasses =
  'flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl text-xs text-muted-foreground'

/** "More" tab for the mobile bottom bar; lists the non-primary destinations. */
export function MoreSheet() {
  const extraItems = NAV_ITEMS.filter((item) => !item.primary)

  return (
    <Sheet>
      <SheetTrigger className={cn(tabClasses, 'outline-none focus-visible:ring-2 focus-visible:ring-ring')}>
        <Ellipsis className="size-6" aria-hidden="true" />
        <span>עוד</span>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl pb-[env(safe-area-inset-bottom)]">
        <SheetHeader>
          <SheetTitle>עוד</SheetTitle>
          <SheetDescription>מסכים נוספים באפליקציה</SheetDescription>
        </SheetHeader>
        <nav aria-label="עוד" className="flex flex-col gap-1 px-3 pb-4">
          {extraItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className="flex min-h-12 items-center gap-3 rounded-2xl px-3 text-base hover:bg-accent"
            >
              <Icon className="size-5" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
