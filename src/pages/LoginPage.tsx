import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthField } from '@/components/auth/AuthField'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { resolvePostAuthPath } from '@/components/auth/AuthGuard'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { PasswordField } from '@/components/auth/PasswordField'
import { SegmentedControl } from '@/components/auth/SegmentedControl'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/ui/button'
import {
  AuthError,
  formatCodeDisplay,
  getLockoutRemainingSeconds,
  isValidCode,
  lockoutMessage,
  normalizeCode,
  signInWithCode,
  signInWithEmail,
  signInWithGoogle,
} from '@/lib/auth'

type Mode = 'email' | 'code'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? null

  const [mode, setMode] = useState<Mode>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [codeError, setCodeError] = useState('')
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)
  const [lockSeconds, setLockSeconds] = useState(() => getLockoutRemainingSeconds())

  useEffect(() => {
    const tick = () => setLockSeconds(getLockoutRemainingSeconds())
    tick()
    const id = window.setInterval(tick, 250)
    return () => window.clearInterval(id)
  }, [])

  const locked = lockSeconds > 0
  const busy = loading || locked

  const finish = async () => {
    const path = await resolvePostAuthPath(from)
    navigate(path, { replace: true })
  }

  const onAuthError = (error: unknown) => {
    if (error instanceof AuthError) {
      if (error.code === 'locked') {
        setLockSeconds(getLockoutRemainingSeconds())
        setFormError('')
        return
      }
      setFormError(error.message)
      return
    }
    setFormError('פרטי ההתחברות שגויים')
  }

  const submitEmail = async (event: FormEvent) => {
    event.preventDefault()
    if (locked) return
    setFormError('')
    const nextEmailError = !email.trim()
      ? 'יש להזין אימייל'
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ? 'כתובת האימייל אינה תקינה'
        : ''
    const nextPasswordError = !password ? 'יש להזין סיסמה' : ''
    setEmailError(nextEmailError)
    setPasswordError(nextPasswordError)
    if (nextEmailError || nextPasswordError) return

    setLoading(true)
    try {
      await signInWithEmail(email.trim(), password)
      await finish()
    } catch (error) {
      onAuthError(error)
    } finally {
      setLoading(false)
    }
  }

  const submitCode = async (event: FormEvent) => {
    event.preventDefault()
    if (locked) return
    setFormError('')
    if (!isValidCode(code)) {
      setCodeError('יש להזין קוד בן 8 תווים בפורמט XXXX-XXXX')
      return
    }
    setCodeError('')
    setLoading(true)
    try {
      await signInWithCode(code)
      await finish()
    } catch (error) {
      onAuthError(error)
    } finally {
      setLoading(false)
    }
  }

  const google = async () => {
    if (locked) return
    setFormError('')
    setLoading(true)
    try {
      await signInWithGoogle()
      await finish()
    } catch (error) {
      onAuthError(error)
    } finally {
      setLoading(false)
    }
  }

  const lockBanner = locked ? (
    <p role="alert" className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
      {lockoutMessage(lockSeconds)}
    </p>
  ) : formError ? (
    <p role="alert" className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
      {formError}
    </p>
  ) : null

  return (
    <AuthLayout title="כניסה" description="ברוכים השבים ל-7ZUZ">
      <Card className="flex flex-col gap-5">
        <SegmentedControl
          label="אופן כניסה"
          value={mode}
          onChange={(next) => {
            setMode(next)
            setFormError('')
          }}
          options={[
            { value: 'email', label: 'אימייל' },
            { value: 'code', label: 'כניסה עם קוד' },
          ]}
        />

        {lockBanner}

        {mode === 'email' ? (
          <form className="flex flex-col gap-4" onSubmit={submitEmail} noValidate>
            <AuthField
              label="אימייל"
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              ltr
              value={email}
              error={emailError}
              disabled={busy}
              onChange={(event) => setEmail(event.target.value)}
            />
            <PasswordField
              label="סיסמה"
              name="password"
              autoComplete="current-password"
              value={password}
              error={passwordError}
              disabled={busy}
              onChange={(event) => setPassword(event.target.value)}
            />
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="inline-flex min-h-11 items-center text-sm font-medium text-brand-ink underline underline-offset-4 hover:no-underline"
              >
                שכחתי סיסמה
              </Link>
            </div>
            <Button type="submit" variant="brand" size="lg" className="w-full" disabled={busy}>
              {loading ? 'מתחברים…' : 'כניסה'}
            </Button>
            <GoogleButton onClick={google} disabled={busy} />
            <p className="text-center text-sm text-muted-foreground">
              אין לכם חשבון?{' '}
              <Link to="/register" className="font-medium text-brand-ink underline underline-offset-4 hover:no-underline">
                הרשמה
              </Link>
            </p>
          </form>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={submitCode} noValidate>
            <AuthField
              label="קוד אישי"
              name="code"
              autoComplete="one-time-code"
              inputMode="text"
              ltr
              spellCheck={false}
              value={formatCodeDisplay(code)}
              error={codeError}
              hint="הקוד בן 8 תווים שקיבלתם מהארגון, בפורמט XXXX-XXXX."
              disabled={busy}
              onChange={(event) => setCode(normalizeCode(event.target.value))}
              placeholder="XXXX-XXXX"
              maxLength={9}
            />
            <Button type="submit" variant="brand" size="lg" className="w-full" disabled={busy}>
              {loading ? 'מתחברים…' : 'כניסה'}
            </Button>
          </form>
        )}
      </Card>
    </AuthLayout>
  )
}
