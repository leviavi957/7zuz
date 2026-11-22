import { Eye, EyeOff } from 'lucide-react'
import { useState, type ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import { AuthField } from './AuthField'

type PasswordFieldProps = Omit<ComponentProps<typeof AuthField>, 'type' | 'endAdornment' | 'ltr'> & {
  autoComplete: ComponentProps<'input'>['autoComplete']
}

export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <AuthField
      {...props}
      ltr
      type={visible ? 'text' : 'password'}
      endAdornment={
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={visible ? 'הסתרת סיסמה' : 'הצגת סיסמה'}
          aria-pressed={visible}
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? <EyeOff /> : <Eye />}
        </Button>
      }
    />
  )
}
