import { Calendar, Clock, Dumbbell, Download, Flame, LogOut, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { SegmentedControl } from '@/components/auth/SegmentedControl'
import { SoundSetting } from '@/components/reminders/SoundSetting'
import { Badge } from '@/components/shared/Badge'
import { Card, CardHeader } from '@/components/shared/Card'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { Skeleton } from '@/components/shared/Skeleton'
import { Button } from '@/components/ui/button'
import { AuthField } from '@/components/auth/AuthField'
import { useSession } from '@/hooks/useSession'
import {
  accountEmail,
  AuthError,
  signOut,
  updateDisplayName,
  type Session,
} from '@/lib/auth'
import { downloadFile } from '@/lib/downloadFile'
import { formatHebrewDate } from '@/lib/promis'
import { showToast } from '@/lib/toast'
import { clearUserEntries, readUserEntries } from '@/lib/userStorage'
import {
  listSessions,
  summarizeSessions,
  type SessionSummary,
  type WorkoutSession,
} from '@/mocks/sessions'
import { useTheme, type ThemePreference } from '@/theme/theme-context'

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'בהיר' },
  { value: 'dark', label: 'כהה' },
  { value: 'system', label: 'לפי המערכת' },
]

function fileDate(date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function roleLabel(session: Session): string {
  if (session.loginType === 'code' || session.role === 'team') return 'משתתף/ת'
  return 'עובד/ת'
}

function loginLabel(session: Session): string {
  return session.loginType === 'code' ? 'כניסה עם קוד' : 'כניסה עם אימייל'
}

const IDENTIFYING_KEYS = new Set([
  'displayName',
  'email',
  'userId',
  'name',
  'fullName',
  'code',
  'password',
])

/** Drops names, emails, codes and ids from stored records. */
function stripIdentifiers(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripIdentifiers)
  if (value !== null && typeof value === 'object') {
    const next: Record<string, unknown> = {}
    for (const [key, item] of Object.entries(value)) {
      if (IDENTIFYING_KEYS.has(key)) continue
      next[key] = stripIdentifiers(item)
    }
    return next
  }
  return value
}

function exportPayload(session: Session) {
  if (session.loginType === 'code') {
    return {
      role: session.role,
      loginType: session.loginType,
      data: stripIdentifiers(readUserEntries()),
    }
  }
  const email = accountEmail(session)
  return {
    exportedAt: new Date().toISOString(),
    role: session.role,
    loginType: session.loginType,
    displayName: session.displayName,
    ...(email ? { email } : {}),
    data: readUserEntries(),
  }
}

function useWorkoutSummary() {
  const [params, setParams] = useSearchParams()
  const forced = params.get('state')
  const [sessions, setSessions] = useState<WorkoutSession[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (forced === 'loading' || forced === 'error') return
    let cancelled = false
    listSessions()
      .then((rows) => {
        if (!cancelled) setSessions(rows)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [forced, attempt])

  const retry = useCallback(() => {
    setFailed(false)
    setSessions(null)
    setParams({}, { replace: true })
    setAttempt((value) => value + 1)
  }, [setParams])

  if (forced === 'loading') return { status: 'loading' as const, summary: null, retry }
  if (forced === 'error' || failed) return { status: 'error' as const, summary: null, retry }
  if (sessions === null) return { status: 'loading' as const, summary: null, retry }
  return { status: 'ready' as const, summary: summarizeSessions(sessions), retry }
}

function ProfileSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="טוען פרופיל" className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-44 rounded-3xl" />
      <Skeleton className="h-40 rounded-3xl" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-3xl" />
        <Skeleton className="h-72 rounded-3xl" />
      </div>
    </div>
  )
}

function CodeIdentity() {
  return (
    <Card tone="brand">
      <p className="text-sm text-muted-foreground">כניסה עם קוד</p>
      <p className="mt-1 text-2xl font-medium">משתתף/ת</p>
    </Card>
  )
}

function EmailIdentity({ session }: { session: Session }) {
  const [name, setName] = useState(session.displayName)
  const [nameError, setNameError] = useState<string>()
  const [saving, setSaving] = useState(false)
  const email = accountEmail(session)

  const save = async (event: FormEvent) => {
    event.preventDefault()
    const trimmed = name.trim()
    setName(trimmed)
    setNameError(undefined)
    setSaving(true)
    try {
      await updateDisplayName(trimmed)
      showToast({ title: 'השם נשמר' })
    } catch (error) {
      setNameError(error instanceof AuthError ? error.message : 'לא הצלחנו לשמור את השם')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card tone="brand">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="solid">{roleLabel(session)}</Badge>
        <span className="text-sm text-muted-foreground">{loginLabel(session)}</span>
      </div>
      <form onSubmit={(event) => void save(event)} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <AuthField
            label="שם תצוגה"
            value={name}
            maxLength={40}
            autoComplete="nickname"
            error={nameError}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <Button type="submit" variant="brand" disabled={saving} aria-busy={saving}>
          {saving ? 'שומר…' : 'שמירה'}
        </Button>
      </form>
      {email ? (
        <div className="mt-4">
          <AuthField label="אימייל" value={email} readOnly ltr />
        </div>
      ) : null}
    </Card>
  )
}

function Summary({ summary }: { summary: SessionSummary }) {
  if (summary.totalWorkouts === 0) {
    return (
      <section aria-labelledby="profile-summary-heading" className="flex flex-col gap-3">
        <h2 id="profile-summary-heading" className="text-lg">
          סיכום אישי
        </h2>
        <EmptyState
          icon={Dumbbell}
          title="עדיין אין אימונים"
          description="אחרי האימון הראשון יופיעו כאן מספר האימונים, הדקות, הרצף והתאריך האחרון."
        />
      </section>
    )
  }

  const last = summary.lastWorkoutAt ? formatHebrewDate(summary.lastWorkoutAt) : '—'
  const stats = [
    { label: 'סה״כ אימונים', value: String(summary.totalWorkouts), icon: Dumbbell },
    { label: 'סה״כ דקות', value: String(summary.totalMinutes), icon: Clock },
    { label: 'רצף נוכחי', value: String(summary.streak), icon: Flame, hint: 'ימים' },
    { label: 'אימון אחרון', value: last, icon: Calendar, text: true },
  ]

  return (
    <section aria-labelledby="profile-summary-heading" className="flex flex-col gap-3">
      <h2 id="profile-summary-heading" className="text-lg">
        סיכום אישי
      </h2>
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, hint, text }) => (
          <li key={label}>
            <Card className="flex h-full flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">{label}</p>
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
              </div>
              <p className={text ? 'text-lg font-medium' : 'numeral text-3xl'}>
                {value}
                {hint ? (
                  <span className="ms-2 text-sm font-normal text-muted-foreground">{hint}</span>
                ) : null}
              </p>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Settings() {
  const { preference, setPreference } = useTheme()

  return (
    <section aria-labelledby="profile-settings-heading" className="flex flex-col gap-3">
      <h2 id="profile-settings-heading" className="text-lg">
        הגדרות
      </h2>
      <Card>
        <CardHeader title="ערכת נושא" description="בהיר, כהה, או לפי המכשיר." />
        <SegmentedControl
          label="ערכת נושא"
          value={preference}
          onChange={setPreference}
          options={THEME_OPTIONS}
        />
      </Card>
      <SoundSetting />
      <Card className="flex flex-col gap-3">
        <p className="font-medium">עוד</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" render={<Link to="/reminders" />}>
            תזכורות
          </Button>
          <Button variant="outline" render={<Link to="/questionnaires" />}>
            שאלונים
          </Button>
        </div>
      </Card>
    </section>
  )
}

function ConfirmDialog({
  busy,
  onCancel,
  onConfirm,
}: {
  busy: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  const titleId = useId()
  const descriptionId = useId()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previous = document.activeElement
    cancelRef.current?.focus()
    return () => {
      if (previous instanceof HTMLElement) previous.focus()
    }
  }, [])

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && !busy) {
      event.stopPropagation()
      onCancel()
    }
    if (event.key === 'Tab') {
      event.preventDefault()
      const next = document.activeElement === cancelRef.current ? confirmRef : cancelRef
      next.current?.focus()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-scrim p-4"
      onKeyDown={onKeyDown}
      onMouseDown={busy ? undefined : onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="w-full max-w-md rounded-3xl border bg-card p-6 text-card-foreground shadow-lift"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="text-xl">
          למחוק את הנתונים שלי?
        </h2>
        <p id={descriptionId} className="mt-2 text-muted-foreground">
          הנתונים השמורים במכשיר עבור החשבון הזה יימחקו, ואז תצאו מהמערכת.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
          <Button ref={cancelRef} type="button" onClick={onCancel} disabled={busy} className="sm:flex-1">
            ביטול
          </Button>
          <Button
            ref={confirmRef}
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={busy}
            className="sm:flex-1"
          >
            <Trash2 />
            {busy ? 'מוחק…' : 'מחיקה'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function Privacy({ session }: { session: Session }) {
  const navigate = useNavigate()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [leaving, setLeaving] = useState(false)

  const download = () => {
    // Mock action: builds a JSON file in the browser from this user's mock data. No server.
    try {
      const blob = new Blob([JSON.stringify(exportPayload(session), null, 2)], {
        type: 'application/json',
      })
      downloadFile(`7zuz-data-${fileDate()}.json`, blob)
      showToast({ title: 'הנתונים ירדו' })
    } catch {
      showToast({ title: 'ההורדה לא הצליחה' })
    }
  }

  const removeData = async () => {
    // Mock action: clears this user's local mock data, then signs out. No server.
    setDeleting(true)
    try {
      clearUserEntries()
      await signOut()
      navigate('/login', { replace: true })
    } finally {
      setDeleting(false)
    }
  }

  const leave = async () => {
    if (leaving) return
    setLeaving(true)
    try {
      await signOut()
      navigate('/login', { replace: true })
    } finally {
      setLeaving(false)
    }
  }

  return (
    <section aria-labelledby="profile-privacy-heading" className="flex flex-col gap-3">
      <h2 id="profile-privacy-heading" className="text-lg">
        פרטיות ונתונים
      </h2>
      <Card className="flex flex-col gap-4">
        <CardHeader title="מה נשמר ומי רואה" className="mb-0" />
        <p className="text-muted-foreground">
          האימונים, התזכורות והשאלונים נשמרים במכשיר הזה. משאבי אנוש רואים רק סיכומים אנונימיים, בלי
          שמות או כתובות אימייל. המאמן/ת יכול/ה לראות את ההתקדמות האישית.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button type="button" variant="outline" onClick={download}>
            <Download />
            הורדת הנתונים שלי
          </Button>
          <Button type="button" variant="destructive" onClick={() => setConfirming(true)}>
            <Trash2 />
            מחיקת הנתונים שלי
          </Button>
        </div>
      </Card>
      <Button type="button" variant="outline" className="self-start" disabled={leaving} onClick={() => void leave()}>
        <LogOut />
        יציאה
      </Button>
      {confirming ? (
        <ConfirmDialog
          busy={deleting}
          onCancel={() => setConfirming(false)}
          onConfirm={() => void removeData()}
        />
      ) : null}
    </section>
  )
}

function ProfileContent({ session, summary }: { session: Session; summary: SessionSummary }) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header>
        <h2 className="text-3xl md:text-4xl">פרופיל</h2>
        <p className="text-muted-foreground">החשבון, הסיכום וההגדרות.</p>
      </header>
      {session.loginType === 'code' ? <CodeIdentity /> : <EmailIdentity session={session} />}
      <Summary summary={summary} />
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <Settings />
        <Privacy session={session} />
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const session = useSession()
  const { status, summary, retry } = useWorkoutSummary()

  if (!session) return null
  if (status === 'loading') return <ProfileSkeleton />
  if (status === 'error' || !summary) return <ErrorState onRetry={retry} />
  return <ProfileContent session={session} summary={summary} />
}
