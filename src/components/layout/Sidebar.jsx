import { NavLink } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { GraduationCap } from 'lucide-react'
import { navigationFor } from '../../constants/navigation'
import { ROLE_LABELS } from '../../constants/roles'
import { ROUTES } from '../../constants/routes'
import { selectUserRole } from '../../store/selectors/authSelectors'
import { closeMobileSidebar } from '../../store/slices/uiSlice'

function Sidebar() {
  const role = useSelector(selectUserRole)
  const dispatch = useDispatch()
  const items = navigationFor(role)

  return (
    <>
      <aside className="sidebar" aria-label="Main navigation">
        <NavLink to={ROUTES.DASHBOARD} className="sidebar-brand">
          <span className="brand-mark">
            <GraduationCap size={20} />
          </span>
          <span className="brand-text">
            <div className="brand-name">College Portal</div>
            <div className="brand-sub">{ROLE_LABELS[role]} workspace</div>
          </span>
        </NavLink>

        <div className="sidebar-section">Menu</div>
        <ul className="sidebar-nav">
          {items.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === ROUTES.ATTENDANCE}
                className="sidebar-link"
                title={label}
                onClick={() => dispatch(closeMobileSidebar())}
              >
                <Icon size={19} />
                <span className="sidebar-label">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <span className="sidebar-footer-text">Academic year 2026–27</span>
        </div>
      </aside>
      <div className="sidebar-backdrop" onClick={() => dispatch(closeMobileSidebar())} aria-hidden="true" />
    </>
  )
}

export default Sidebar
