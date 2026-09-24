import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ROUTES } from '../constants/routes'
import { selectAuthInitialized, selectIsAuthenticated } from '../store/selectors/authSelectors'
import { LoadingState } from '../components/ui'

/**
 * Waits for the startup session restore, then only renders child routes
 * for signed-in users. This is a UX guard; the API enforces access itself.
 */
function ProtectedRoute() {
  const initialized = useSelector(selectAuthInitialized)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const location = useLocation()

  if (!initialized) {
    return (
      <div className="min-vh-100 d-grid place-items-center">
        <LoadingState label="Restoring your session…" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />
  }

  return <Outlet />
}

export default ProtectedRoute
