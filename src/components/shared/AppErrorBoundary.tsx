import { Component, type ErrorInfo, type ReactNode } from 'react'
import { RotateCw, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/** Root boundary: calm Hebrew fallback instead of a blank screen. */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('AppErrorBoundary', error, info.componentStack)
  }

  private reload = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-svh items-center justify-center bg-background p-6">
        <div
          role="alert"
          className="flex w-full max-w-md flex-col items-center gap-4 rounded-3xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center"
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <TriangleAlert className="size-7" aria-hidden="true" />
          </span>
          <h1 className="text-2xl">משהו השתבש</h1>
          <p className="text-muted-foreground">
            לא הצלחנו להציג את המסך. אפשר לטעון מחדש ולהמשיך.
          </p>
          <Button variant="brand" size="lg" onClick={this.reload}>
            <RotateCw />
            טעינה מחדש
          </Button>
        </div>
      </div>
    )
  }
}
