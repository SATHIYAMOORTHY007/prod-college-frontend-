import { useDispatch, useSelector } from 'react-redux'
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { selectSidebarCollapsed } from '../../store/selectors/uiSelectors'
import { toggleMobileSidebar, toggleSidebar } from '../../store/slices/uiSlice'
import NotificationBell from './NotificationBell'
import UserMenu from './UserMenu'

function Topbar() {
  const dispatch = useDispatch()
  const collapsed = useSelector(selectSidebarCollapsed)

  return (
    <header className="topbar">
      <button type="button" className="btn btn-ghost btn-icon d-lg-none" onClick={() => dispatch(toggleMobileSidebar())} aria-label="Open menu">
        <Menu size={20} />
      </button>
      <button
        type="button"
        className="btn btn-ghost btn-icon d-none d-lg-inline-flex"
        onClick={() => dispatch(toggleSidebar())}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
      </button>
      <span className="topbar-title d-none d-sm-inline">ABC College of Engineering</span>

      <div className="ms-auto d-flex align-items-center gap-2">
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  )
}

export default Topbar
