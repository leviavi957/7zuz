import type { LucideIcon } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'

export default function PlaceholderPage({ icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <EmptyState
      icon={icon}
      title={title}
      description="המסך הזה יגיע בקרוב. התשתית והעיצוב כבר מוכנים."
    />
  )
}
