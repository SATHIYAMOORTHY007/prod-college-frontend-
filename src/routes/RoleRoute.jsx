import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ShieldAlert } from 'lucide-react'
import { selectUserRole } from '../store/selectors/authSelectors'
import { EmptyState } from '../components/ui'

/**
 * Renders child routes only for the listed roles.
 * @param {{ roles: string[] }} props
 */
function RoleRoute({ roles }) {
  const role = useSelector(selectUserRole)

  if (!roles.includes(role)) {
    return (
      <div className="surface">
        <EmptyState
          icon={ShieldAlert}
          title="You don’t have access to this page"
          message="If you think this is a mistake, contact the college administrator."
        />
      </div>
    )
  }

  return <Outlet />
}

export default RoleRoute
