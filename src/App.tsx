import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { NAV_ITEMS } from '@/components/layout/nav-items'
import { OnboardingGuard } from '@/components/onboarding/OnboardingGuard'
import { Toaster } from '@/components/shared/Toaster'
import { NotificationNavigation } from '@/components/reminders/NotificationNavigation'
import { ReminderScheduler } from '@/components/reminders/ReminderScheduler'
import DesignPage from '@/pages/DesignPage'
import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'
import OnboardingPage from '@/pages/OnboardingPage'
import PlaceholderPage from '@/pages/PlaceholderPage'
import QuestionnairesPage from '@/pages/QuestionnairesPage'
import RemindersPage from '@/pages/RemindersPage'
import WorkoutDetailPage from '@/pages/WorkoutDetailPage'
import WorkoutFeedbackPage from '@/pages/WorkoutFeedbackPage'
import WorkoutPlayerPage from '@/pages/WorkoutPlayerPage'
import WorkoutsPage from '@/pages/WorkoutsPage'
import { ThemeProvider } from '@/theme/ThemeProvider'

const PLACEHOLDER_ITEMS = NAV_ITEMS.filter(
  (item) =>
    item.to !== '/' &&
    item.to !== '/workouts' &&
    item.to !== '/reminders' &&
    item.to !== '/questionnaires',
)

export default function App() {
  return (
    <ThemeProvider>
      <ReminderScheduler />
      <Toaster />
      <BrowserRouter>
        <OnboardingGuard>
          <NotificationNavigation />
          <Routes>
            <Route path="onboarding" element={<OnboardingPage />} />
            {/* The player is full-screen, so it lives outside the app shell. */}
            <Route path="workouts/:id/play" element={<WorkoutPlayerPage />} />
            <Route element={<AppShell />}>
              <Route index element={<HomePage />} />
              <Route path="workouts" element={<WorkoutsPage />} />
              <Route path="workouts/:id" element={<WorkoutDetailPage />} />
              <Route path="workouts/:id/feedback" element={<WorkoutFeedbackPage />} />
              <Route path="reminders" element={<RemindersPage />} />
              <Route path="questionnaires" element={<QuestionnairesPage />} />
              {PLACEHOLDER_ITEMS.map(({ to, icon, label }) => (
                <Route key={to} path={to} element={<PlaceholderPage icon={icon} title={label} />} />
              ))}
              <Route path="design" element={<DesignPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </OnboardingGuard>
      </BrowserRouter>
    </ThemeProvider>
  )
}
