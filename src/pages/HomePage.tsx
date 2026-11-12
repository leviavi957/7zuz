import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-bold">7ZUZ</h1>
      <p className="text-muted-foreground">אפליקציית מיקרו-אימונים לעבודה</p>
      <Button className="min-h-11" render={<Link to="/" />}>מתחילים</Button>
    </main>
  )
}
