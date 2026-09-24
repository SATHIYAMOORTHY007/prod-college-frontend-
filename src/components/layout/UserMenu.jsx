import { useCallback, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import { ROLE_LABELS } from '../../constants/roles'
import { ROUTES } from '../../constants/routes'
import { logout } from '../../store/actions/authActions'
import { selectCurrentUser } from '../../store/selectors/authSelectors'
import { useClickOutside } from '../../hooks/useClickOutside'
import { initials } from '../../utils/format'

function UserMenu() {
  const user = useSelector(selectCurrentUser)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const close = useCallback(() => setOpen(false), [])
  useClickOutside(ref, close, open)

  const handleLogout = async () => {
    await dispatch(logout())
    toast.success('Signed out')
    navigate(ROUTES.LOGIN, { replace: true })
  }

  return (
    <div className="position-relative" ref={ref}>
      <button
        type="button"
        className="btn btn-ghost d-flex align-items-center gap-2 px-2"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="avatar">{initials(user?.name)}</span>
        <span className="d-none d-md-block text-start lh-sm">
          <span className="d-block fw-semibold text-body">{user?.name}</span>
          <span className="d-block small text-muted-cp">{ROLE_LABELS[user?.role]}</span>
        </span>
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="dropdown-panel" role="menu">
          <div className="px-3 py-3 border-bottom">
            <div className="fw-semibold">{user?.name}</div>
            <div className="small text-muted-cp text-truncate">{user?.email}</div>
          </div>
          <button type="button" className="dropdown-item-cp text-danger" role="menuitem" onClick={handleLogout}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      )}
    </div>
  )
}

export default UserMenu
