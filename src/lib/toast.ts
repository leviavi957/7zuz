export interface Toast {
  id: number
  title: string
  message?: string
}

type Listener = () => void

let toasts: Toast[] = []
let nextId = 1
const listeners = new Set<Listener>()

function emit(next: Toast[]) {
  toasts = next
  listeners.forEach((listener) => listener())
}

/** Shows an in-page message. Returns its id. */
export function showToast(toast: Omit<Toast, 'id'>): number {
  const id = nextId
  nextId += 1
  emit([...toasts, { ...toast, id }])
  return id
}

export function dismissToast(id: number): void {
  emit(toasts.filter((toast) => toast.id !== id))
}

export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getToasts(): Toast[] {
  return toasts
}
