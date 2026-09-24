import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * Keeps list state (page, search, filters, sort) in the URL, so a filtered
 * page can be bookmarked, shared and survives a reload. Any change other
 * than the page itself resets to page 1.
 *
 * @param {Record<string, string|number>} defaults
 */
export function useListParams(defaults = {}) {
  const [searchParams, setSearchParams] = useSearchParams()

  const params = useMemo(() => {
    const values = { page: 1, limit: 10, ...defaults }
    for (const [key, value] of searchParams.entries()) values[key] = value
    values.page = Number(values.page) || 1
    values.limit = Number(values.limit) || 10
    return values
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const setParams = useCallback(
    (updates) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          for (const [key, value] of Object.entries(updates)) {
            if (value === undefined || value === null || value === '') next.delete(key)
            else next.set(key, String(value))
          }
          if (!('page' in updates)) next.delete('page')
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const resetParams = useCallback(() => setSearchParams({}, { replace: true }), [setSearchParams])

  return { params, setParams, resetParams }
}
