import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AuthField } from '@/components/auth/AuthField'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/ui/button'
import { requestPasswordReset } from '@/lib/auth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const nextError = !email.trim()
      ? 'יש להזין אימייל'
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ? 'כתובת האימייל אינה תקינה'
        : ''
    setEmailError(nextError)
    if (nextError) return

    setLoading(true)
    try {
      await requestPasswordReset(email.trim())
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="איפוס סיסמה" description="נשלח קישור איפוס אם החשבון קיים">
      <Card className="flex flex-col gap-5">
        {sent ? (
          <div className="flex flex-col gap-4" role="status">
            <p className="text-muted-foreground">
              אם קיים חשבון עם הכתובת שציינתם, נשלח אליה קישור לאיפוס הסיסמה. בדקו גם את תיקיית הספאם.
            </p>
            <Button variant="brand" size="lg" className="w-full" render={<Link to="/login" />}>
              חזרה לכניסה
            </Button>
          </div>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
            <AuthField
              label="אימייל"
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              ltr
              value={email}
              error={emailError}
              disabled={loading}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Button type="submit" variant="brand" size="lg" className="w-full" disabled={loading}>
              {loading ? 'שולחים…' : 'שליחת קישור'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              <Link to="/login" className="font-medium text-brand-ink underline underline-offset-4 hover:no-underline">
                חזרה לכניסה
              </Link>
            </p>
          </form>
        )}
      </Card>
    </AuthLayout>
  )
}
