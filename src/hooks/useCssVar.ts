import { useEffect, useState } from 'react'

/**
 * Live CSS custom-property value from `:root`, updating when theme or
 * `data-brand` (Preview as company) changes.
 */
export function useCssVar(name: string, fallback = ''): string {
  const [value, setValue] = useState(fallback)

  useEffect(() => {
    const root = document.documentElement

    const read = () => {
      const next = getComputedStyle(root).getPropertyValue(name).trim()
      setValue(next || fallback)
    }

    read()
    const observer = new MutationObserver(read)
    observer.observe(root, { attributes: true, attributeFilter: ['class', 'data-brand', 'style'] })
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener('change', read)
    return () => {
      observer.disconnect()
      media.removeEventListener('change', read)
    }
  }, [name, fallback])

  return value
}
