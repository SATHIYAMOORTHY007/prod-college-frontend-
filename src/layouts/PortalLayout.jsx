import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from '../components/layout/Sidebar'
import Topbar from '../components/layout/Topbar'
import { LoadingState } from '../components/ui'
import { selectMobileSidebarOpen, selectSidebarCollapsed } from '../store/selectors/uiSelectors'

function PortalLayout() {
  const collapsed = useSelector(selectSidebarCollapsed)
  const mobileOpen = useSelector(selectMobileSidebarOpen)

  return (
    <div className={`portal ${collapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'is-mobile-open' : ''}`}>
      <Sidebar />
      <div className="portal-main">
        <Topbar />
        <main className="portal-content">
          <Suspense fallback={<LoadingState label="Loading page…" />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

export default PortalLayout
