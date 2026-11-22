import type { ReactNode } from 'react'
import { BrandPreview } from '@/components/demo/BrandPreview'
import { BackgroundShapes } from '@/components/shared/BackgroundShapes'
import { BasadMark } from '@/components/shared/BasadMark'
import { Logo } from '@/components/layout/Logo'
import { ThemeToggle } from '@/theme/ThemeToggle'

interface AuthLayoutProps {
  title: string
  description?: string
  children: ReactNode
}

/** Shared chrome for login / register / forgot-password (outside the app shell). */
export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <div className="relative isolate flex min-h-svh flex-col bg-background">
      <BackgroundShapes />
      <BasadMark className="absolute start-4 top-3 z-10" />
      <div className="absolute end-3 top-2 z-10 flex items-center gap-1">
        <BrandPreview />
        <ThemeToggle />
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-16">
        <header className="flex flex-col items-start gap-4">
          <Logo />
          <div>
            <h1 className="text-3xl">{title}</h1>
            {description ? <p className="mt-1 text-muted-foreground">{description}</p> : null}
          </div>
        </header>
        {children}
      </div>
    </div>
  )
}
