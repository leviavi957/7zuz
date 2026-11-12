import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from './theme-context'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={isDark ? 'מעבר למצב בהיר' : 'מעבר למצב כהה'}
      aria-pressed={isDark}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  )
}
