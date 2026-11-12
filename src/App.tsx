import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { NAV_ITEMS } from '@/components/layout/nav-items'
import DesignPage from '@/pages/DesignPage'
import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'
import PlaceholderPage from '@/pages/PlaceholderPage'
import { ThemeProvider } from '@/theme/ThemeProvider'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            {NAV_ITEMS.filter((item) => item.to !== '/').map(({ to, icon, label }) => (
              <Route key={to} path={to} element={<PlaceholderPage icon={icon} title={label} />} />
            ))}
            <Route path="design" element={<DesignPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
