import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  isPromisDue,
  latestPromis,
  nextPromisDueAt,
  nextPromisRound,
  type PromisEntry,
  type PromisRound,
} from '@/lib/promis'
import { listPromis } from '@/mocks/promis'

export type PromisStatus = 'loading' | 'ready' | 'error'

export interface PromisSummary {
  status: PromisStatus
  entries: PromisEntry[]
  latest: PromisEntry | null
  due: boolean
  nextDueAt: Date | null
  nextRound: PromisRound
  retry: () => void
  refresh: () => void
}

/**
 * PROMIS entries from the mock store. `?state=loading|error` previews those
 * states; `retry` clears the forced state.
 */
export function usePromis(): PromisSummary {
  const [params, setParams] = useSearchParams()
  const [requestId, setRequestId] = useState(0)
  const [result, setResult] = useState<{
    requestId: number
    entries: PromisEntry[]
    failed: boolean
  } | null>(null)
  const forced = params.get('state')

  useEffect(() => {
    let cancelled = false
    listPromis(forced === 'error')
      .then((entries) => {
        if (!cancelled) setResult({ requestId, entries, failed: false })
      })
      .catch(() => {
        if (!cancelled) setResult({ requestId, entries: [], failed: true })
      })
    return () => {
      cancelled = true
    }
  }, [forced, requestId])

  const retry = useCallback(() => {
    setParams({})
    setRequestId((value) => value + 1)
  }, [setParams])

  const refresh = useCallback(() => setRequestId((value) => value + 1), [])

  const loaded = result?.requestId === requestId
  const entries = loaded ? result.entries : []
  const failed = loaded ? result.failed : false

  let status: PromisStatus = 'ready'
  if (forced === 'error' || failed) status = 'error'
  else if (forced === 'loading' || !loaded) status = 'loading'

  return {
    status,
    entries,
    latest: latestPromis(entries),
    due: isPromisDue(entries),
    nextDueAt: nextPromisDueAt(entries),
    nextRound: nextPromisRound(entries),
    retry,
    refresh,
  }
}
