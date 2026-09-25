import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ArrowRight, LogIn } from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import { selectAuthInitialized, selectIsAuthenticated } from '../../store/selectors/authSelectors'

/**
 * The one link every "Login" button on the homepage uses. Signed-in
 * visitors get "Go to Portal" instead; the dashboard picks the role view
 * from the server-issued session, never from the URL.
 */
function PortalCta({ className = 'btn btn-primary', loginLabel = 'Login to Portal', showIcon = true, onClick }) {
  const initialized = useSelector(selectAuthInitialized)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const signedIn = initialized && isAuthenticated

  return (
    <Link to={signedIn ? ROUTES.DASHBOARD : ROUTES.LOGIN} className={className} onClick={onClick}>
      {showIcon && !signedIn && <LogIn size={17} aria-hidden="true" />}
      {signedIn ? 'Go to Portal' : loginLabel}
      {showIcon && signedIn && <ArrowRight size={17} aria-hidden="true" />}
    </Link>
  )
}

export default PortalCta
