import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import { formatRelative } from '../../utils/format'
import { useClickOutside } from '../../hooks/useClickOutside'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationPreview,
} from '../../features/notifications/useNotifications'

function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const close = useCallback(() => setOpen(false), [])
  useClickOutside(ref, close, open)

  const { data } = useNotificationPreview()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()
  const unread = data?.unreadCount ?? 0

  return (
    <div className="position-relative" ref={ref}>
      <button
        type="button"
        className="btn btn-ghost btn-icon position-relative"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        aria-expanded={open}
      >
        <Bell size={19} />
        {unread > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.62rem' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="dropdown-panel" style={{ width: 340 }}>
          <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
            <strong>Notifications</strong>
            {unread > 0 && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
                Mark all read
              </button>
            )}
          </div>
          {data?.items?.length ? (
            data.items.map((notification) => (
              <button
                key={notification.id}
                type="button"
                className="dropdown-item-cp align-items-start"
                onClick={() => !notification.readAt && markRead.mutate(notification.id)}
              >
                <span
                  className="mt-1 rounded-circle flex-shrink-0"
                  style={{ width: 8, height: 8, background: notification.readAt ? 'transparent' : 'var(--cp-primary)' }}
                />
                <span className="min-w-0">
                  <span className="d-block fw-semibold">{notification.title}</span>
                  <span className="d-block text-muted-cp small text-truncate" style={{ maxWidth: 260 }}>
                    {notification.message}
                  </span>
                  <span className="d-block text-soft" style={{ fontSize: '0.72rem' }}>
                    {formatRelative(notification.createdAt)}
                  </span>
                </span>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-muted-cp small">You’re all caught up.</div>
          )}
          <Link to={ROUTES.NOTIFICATIONS} className="dropdown-item-cp justify-content-center border-top fw-semibold" onClick={close}>
            View all
          </Link>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
