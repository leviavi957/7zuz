import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { HOME_DATA, type HomeData } from './home'

export type HomeStatus = 'loading' | 'ready' | 'empty' | 'error'

/**
 * Mock data source. Add `?state=loading|empty|error` to the URL to preview
 * each state; otherwise it shows a short skeleton and then the data.
 */
export function useMockHome(): { status: HomeStatus; data: HomeData; retry: () => void } {
  const [params, setParams] = useSearchParams()
  const [loaded, setLoaded] = useState(false)
  const forced = params.get('state')

  useEffect(() => {
    const id = setTimeout(() => setLoaded(true), 500)
    return () => clearTimeout(id)
  }, [])

  const retry = useCallback(() => setParams({}), [setParams])

  let status: HomeStatus = 'ready'
  if (forced === 'error') status = 'error'
  else if (forced === 'empty') status = 'empty'
  else if (forced === 'loading' || !loaded) status = 'loading'

  return { status, data: HOME_DATA, retry }
}
