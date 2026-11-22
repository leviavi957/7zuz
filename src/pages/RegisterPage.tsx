import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthField } from '@/components/auth/AuthField'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { PasswordField } from '@/components/auth/PasswordField'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/ui/button'
import { AuthError, register, signInWithGoogle } from '@/lib/auth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const next: Record<string, string> = {}
    if (!fullName.trim()) next.fullName = 'יש להזין שם מלא'
    if (!email.trim()) next.email = 'יש להזין אימייל'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'כתובת האימייל אינה תקינה'
    if (!password) next.password = 'יש להזין סיסמה'
    else if (password.length < 8) next.password = 'הסיסמה חייבת להכיל לפחות 8 תווים'
    if (!confirm) next.confirm = 'יש לאשר את הסיסמה'
    else if (confirm !== password) next.confirm = 'הסיסמאות אינן תואמות'
    if (!accepted) next.accepted = 'יש לאשר את התנאים ומדיניות הפרטיות'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onAuthError = (error: unknown) => {
    if (error instanceof AuthError) {
      setFormError(error.message)
      return
    }
    setFormError('לא הצלחנו להשלים את ההרשמה. נסו שוב.')
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError('')
    if (!validate()) return
    setLoading(true)
    try {
      await register({ fullName, email, password })
      navigate('/onboarding', { replace: true })
    } catch (error) {
      onAuthError(error)
    } finally {
      setLoading(false)
    }
  }

  const google = async () => {
    setFormError('')
    setLoading(true)
    try {
      await signInWithGoogle()
      navigate('/onboarding', { replace: true })
    } catch (error) {
      onAuthError(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="הרשמה" description="יצירת חשבון חדש ב-7ZUZ">
      <Card className="flex flex-col gap-5">
        {formError ? (
          <p role="alert" className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {formError}
          </p>
        ) : null}

        <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
          <AuthField
            label="שם מלא"
            name="name"
            autoComplete="name"
            value={fullName}
            error={errors.fullName}
            disabled={loading}
            onChange={(event) => setFullName(event.target.value)}
          />
          <AuthField
            label="אימייל"
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            ltr
            value={email}
            error={errors.email}
            disabled={loading}
            onChange={(event) => setEmail(event.target.value)}
          />
          <PasswordField
            label="סיסמה"
            name="password"
            autoComplete="new-password"
            value={password}
            error={errors.password}
            disabled={loading}
            onChange={(event) => setPassword(event.target.value)}
          />
          <PasswordField
            label="אימות סיסמה"
            name="confirm-password"
            autoComplete="new-password"
            value={confirm}
            error={errors.confirm}
            disabled={loading}
            onChange={(event) => setConfirm(event.target.value)}
          />

          <label className="flex min-h-11 cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={accepted}
              disabled={loading}
              onChange={(event) => setAccepted(event.target.checked)}
              className="mt-0.5 size-6 shrink-0 accent-brand-graphic"
            />
            <span className="text-sm">
              אני מסכים/ה ל
              <a href="#terms" className="mx-1 font-medium text-brand-ink underline underline-offset-4 hover:no-underline">
                תנאי השימוש
              </a>
              ול
              <a href="#privacy" className="mx-1 font-medium text-brand-ink underline underline-offset-4 hover:no-underline">
                מדיניות הפרטיות
              </a>
            </span>
          </label>
          {errors.accepted ? (
            <p role="alert" className="-mt-2 text-sm text-destructive">
              {errors.accepted}
            </p>
          ) : null}

          <Button type="submit" variant="brand" size="lg" className="w-full" disabled={loading}>
            {loading ? 'נרשמים…' : 'הרשמה'}
          </Button>
          <GoogleButton onClick={google} disabled={loading} />
          <p className="text-center text-sm text-muted-foreground">
            כבר יש לכם חשבון?{' '}
            <Link to="/login" className="font-medium text-brand-ink underline underline-offset-4 hover:no-underline">
              כניסה
            </Link>
          </p>
        </form>
      </Card>
    </AuthLayout>
  )
}
