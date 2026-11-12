import { Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <EmptyState
      icon={Compass}
      title="העמוד לא נמצא"
      description="הכתובת שחיפשתם לא קיימת."
      action={<Button render={<Link to="/" />}>חזרה לבית</Button>}
    />
  )
}
