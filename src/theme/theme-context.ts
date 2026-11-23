import { createContext, useContext } from 'react'

export type Theme = 'light' | 'dark'
export type ThemePreference = 'light' | 'dark' | 'system'

export interface ThemeContextValue {
  /** Appearance currently applied (system resolved to light or dark). */
  theme: Theme
  preference: ThemePreference
  setPreference: (preference: ThemePreference) => void
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
