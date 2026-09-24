import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { dashboardApi } from '../../services/dashboardApi'
import { selectCurrentUser } from '../../store/selectors/authSelectors'

/** Keyed by user so switching accounts never shows another user's numbers. */
export function useDashboard() {
  const user = useSelector(selectCurrentUser)
  return useQuery({
    queryKey: ['dashboard', user?.id],
    queryFn: dashboardApi.get,
    enabled: Boolean(user),
    staleTime: 60 * 1000,
  })
}
