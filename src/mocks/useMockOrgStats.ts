import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  getOrgStats,
  resolveOrgId,
  type OrgPeriod,
  type OrgStats,
} from './orgStats'

export type OrgStatsStatus = 'loading' | 'ready' | 'empty' | 'error'

/**
 * Loads aggregated org stats. Query:
 * - `?org=small` → privacy-threshold demo org
 * - `?state=loading|empty|error` → forced UI states
 */
export function useMockOrgStats(period: OrgPeriod): {
  status: OrgStatsStatus
  data: OrgStats | null
  retry: () => void
} {
  const [params, setParams] = useSearchParams()
  const [data, setData] = useState<OrgStats | null>(null)
  const [tick, setTick] = useState(0)
  const forced = params.get('state')
  const orgId = resolveOrgId(params.get('org'))

  useEffect(() => {
    if (forced === 'loading' || forced === 'error' || forced === 'empty') return

    let cancelled = false
    getOrgStats(orgId, period).then((stats) => {
      if (!cancelled) setData(stats)
    })
    return () => {
      cancelled = true
    }
  }, [orgId, period, forced, tick])

  const retry = useCallback(() => {
    setParams((current) => {
      const next = new URLSearchParams(current)
      next.delete('state')
      return next
    })
    setTick((value) => value + 1)
  }, [setParams])

  const dataFresh =
    data !== null && data.period === period && data.organization.id === orgId

  let status: OrgStatsStatus = 'loading'
  if (forced === 'error') status = 'error'
  else if (forced === 'empty') status = 'empty'
  else if (forced === 'loading') status = 'loading'
  else if (dataFresh) status = 'ready'

  return { status, data: dataFresh ? data : null, retry }
}
