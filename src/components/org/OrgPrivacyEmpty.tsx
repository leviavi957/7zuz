import { Shield } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { ORG_PRIVACY_MIN_USERS } from '@/mocks/orgStats'

export function OrgPrivacyEmpty() {
  return (
    <EmptyState
      icon={Shield}
      title="אין מספיק נתונים להצגה"
      description={`כדי לשמור על פרטיות המשתתפים, פירוט מספרי מוצג רק כאשר בקבוצה רשומים לפחות ${ORG_PRIVACY_MIN_USERS} משתמשים.`}
    />
  )
}
