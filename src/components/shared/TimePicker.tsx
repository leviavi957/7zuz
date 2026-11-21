import { useEffect, useId, useRef, useState, type ChangeEvent, type KeyboardEvent, type RefObject } from 'react'
import { cn } from '@/lib/utils'

interface TimePickerProps {
  /** Starting 24h "HH:mm". The picker keeps its own typing state after that. */
  defaultValue: string
  /** The complete "HH:mm", or `null` while the typed time is incomplete or invalid. */
  onChange: (value: string | null) => void
  /** Visible label of the whole field. */
  label: string
}

type Unit = 'hours' | 'minutes'

const MAX: Record<Unit, number> = { hours: 23, minutes: 59 }
const ERRORS: Record<Unit, string> = {
  hours: 'שעות: הזינו מספר בין 00 ל-23.',
  minutes: 'דקות: הזינו מספר בין 00 ל-59.',
}

const pad = (text: string) => text.padStart(2, '0')

function isValid(text: string, unit: Unit): boolean {
  return text !== '' && Number(text) <= MAX[unit]
}

interface UnitInputProps {
  label: string
  value: string
  invalid: boolean
  errorId: string
  inputRef: RefObject<HTMLInputElement | null>
  onType: (event: ChangeEvent<HTMLInputElement>) => void
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  onBlur: () => void
}

function UnitInput({ label, value, invalid, errorId, inputRef, onType, onKeyDown, onBlur }: UnitInputProps) {
  const id = useId()

  return (
    <div className="flex-1">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        maxLength={2}
        placeholder="00"
        value={value}
        aria-invalid={invalid}
        aria-describedby={invalid ? errorId : undefined}
        onChange={onType}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        onFocus={(event) => event.target.select()}
        className={cn(
          'numeral h-14 w-full rounded-2xl border bg-card px-2 text-center text-3xl text-foreground outline-none placeholder:text-muted-foreground/60 focus-visible:ring-3 focus-visible:ring-ring',
          invalid ? 'border-destructive' : 'border-input',
        )}
      />
    </div>
  )
}

/**
 * Typed 24-hour time "HH:MM": two numeric fields. Any exact minute works.
 * Digits are padded when leaving a field, hours move on to minutes after two
 * digits, and ArrowUp / ArrowDown step the value. No AM/PM, and the digits stay
 * left-to-right in the RTL layout.
 */
export function TimePicker({ defaultValue, onChange, label }: TimePickerProps) {
  const labelId = useId()
  const errorId = useId()
  const [start] = useState(() => defaultValue.split(':'))
  const [hours, setHours] = useState(start[0] ?? '')
  const [minutes, setMinutes] = useState(start[1] ?? '')
  const hoursRef = useRef<HTMLInputElement>(null)
  const minutesRef = useRef<HTMLInputElement>(null)

  const hoursOk = isValid(hours, 'hours')
  const minutesOk = isValid(minutes, 'minutes')
  const error = !hoursOk && hours !== '' ? ERRORS.hours : !minutesOk && minutes !== '' ? ERRORS.minutes : null
  const incomplete = hours === '' || minutes === ''

  useEffect(() => {
    onChange(hoursOk && minutesOk ? `${pad(hours)}:${pad(minutes)}` : null)
  }, [hours, minutes, hoursOk, minutesOk, onChange])

  const typed = (unit: Unit) => (event: ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 2)
    if (unit === 'hours') {
      setHours(digits)
      if (digits.length === 2 && isValid(digits, 'hours')) minutesRef.current?.focus()
    } else {
      setMinutes(digits)
    }
  }

  const step = (unit: Unit, direction: 1 | -1) => {
    const size = MAX[unit] + 1
    const current = Number(unit === 'hours' ? hours : minutes)
    const base = Number.isFinite(current) ? Math.min(current, MAX[unit]) : 0
    const next = pad(String((base + direction + size) % size))
    if (unit === 'hours') setHours(next)
    else setMinutes(next)
  }

  const keyDown = (unit: Unit) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
      step(unit, event.key === 'ArrowUp' ? 1 : -1)
    }
    // Backspace in an empty minutes field goes back to the hours.
    if (event.key === 'Backspace' && unit === 'minutes' && minutes === '') hoursRef.current?.focus()
  }

  const padOnLeave = (unit: Unit) => () => {
    if (unit === 'hours' && hours.length === 1) setHours(pad(hours))
    if (unit === 'minutes' && minutes.length === 1) setMinutes(pad(minutes))
  }

  return (
    <div role="group" aria-labelledby={labelId} className="flex flex-col gap-2">
      <span id={labelId} className="font-medium">
        {label}
      </span>
      <div dir="ltr" className="flex items-center gap-2">
        <UnitInput
          label="שעות"
          value={hours}
          invalid={!hoursOk && hours !== ''}
          errorId={errorId}
          inputRef={hoursRef}
          onType={typed('hours')}
          onKeyDown={keyDown('hours')}
          onBlur={padOnLeave('hours')}
        />
        <span className="numeral text-3xl text-muted-foreground" aria-hidden="true">
          :
        </span>
        <UnitInput
          label="דקות"
          value={minutes}
          invalid={!minutesOk && minutes !== ''}
          errorId={errorId}
          inputRef={minutesRef}
          onType={typed('minutes')}
          onKeyDown={keyDown('minutes')}
          onBlur={padOnLeave('minutes')}
        />
      </div>
      <p id={errorId} role="alert" className="min-h-5 text-sm text-destructive">
        {error ?? (incomplete ? 'הזינו שעה ודקות, לדוגמה 10:59.' : '')}
      </p>
    </div>
  )
}
