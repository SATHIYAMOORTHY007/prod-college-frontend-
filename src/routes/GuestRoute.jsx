import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ROUTES } from '../constants/routes'
import { selectAuthInitialized, selectIsAuthenticated } from '../store/selectors/authSelectors'
import { LoadingState } from '../components/ui'

/** Login / forgot-password pages: signed-in users go straight to the dashboard. */
function GuestRoute() {
  const initialized = useSelector(selectAuthInitialized)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  if (!initialized) return <LoadingState label="Loading…" />
  if (isAuthenticated) return <Navigate to={ROUTES.DASHBOARD} replace />
  return <Outlet />
}

export default GuestRoute
