import { Button } from '@/components/ui/button'

interface GoogleButtonProps {
  onClick: () => void
  disabled?: boolean
  label?: string
}

export function GoogleButton({
  onClick,
  disabled,
  label = 'המשך עם Google',
}: GoogleButtonProps) {
  return (
    <Button type="button" variant="outline" size="lg" className="w-full" disabled={disabled} onClick={onClick}>
      <GoogleMark />
      {label}
    </Button>
  )
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
      <path
        fill="currentColor"
        d="M21.6 12.23c0-.68-.06-1.33-.17-1.96H12v3.71h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.89-1.74 2.98-4.3 2.98-7.27Z"
        opacity=".9"
      />
      <path
        fill="currentColor"
        d="M12 22c2.7 0 4.96-.89 6.61-2.5l-3.24-2.5c-.9.6-2.05.96-3.37.96-2.59 0-4.78-1.75-5.56-4.1H3.1v2.58A10 10 0 0 0 12 22Z"
        opacity=".75"
      />
      <path
        fill="currentColor"
        d="M6.44 13.86A6 6 0 0 1 6.13 12c0-.65.11-1.28.31-1.86V7.56H3.1A10 10 0 0 0 2 12c0 1.61.39 3.14 1.1 4.44l3.34-2.58Z"
        opacity=".6"
      />
      <path
        fill="currentColor"
        d="M12 5.98c1.47 0 2.79.5 3.82 1.5l2.86-2.86C16.95 2.99 14.7 2 12 2A10 10 0 0 0 3.1 7.56l3.34 2.58C7.22 7.73 9.41 5.98 12 5.98Z"
        opacity=".8"
      />
    </svg>
  )
}
