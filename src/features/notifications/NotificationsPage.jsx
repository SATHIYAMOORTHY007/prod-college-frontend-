import { Link } from 'react-router-dom'
import { Bell, CalendarClock, CheckCheck, ClipboardCheck, MessageSquareWarning } from 'lucide-react'
import { Button, EmptyState, ErrorState, LoadingState, PageHeader, Pagination } from '../../components/ui'
import { useListParams } from '../../hooks/useListParams'
import { formatDateTime, formatRelative } from '../../utils/format'
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from './useNotifications'

const TYPE_ICONS = {
  RESULT_PUBLISHED: { icon: ClipboardCheck, tone: 'tone-green' },
  RESULT_REJECTED: { icon: MessageSquareWarning, tone: 'tone-amber' },
  EXAM_SCHEDULED: { icon: CalendarClock, tone: 'tone-indigo' },
  GENERAL: { icon: Bell, tone: 'tone-slate' },
}

function NotificationsPage() {
  const { params, setParams } = useListParams()
  const { data, isLoading, error, refetch } = useNotifications(params)
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()
  const unreadOnly = params.unreadOnly === 'true'

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle={data ? `${data.unreadCount} unread` : undefined}
        actions={
          data?.unreadCount > 0 && (
            <Button variant="secondary" icon={CheckCheck} onClick={() => markAllRead.mutate()} loading={markAllRead.isPending}>
              Mark all as read
            </Button>
          )
        }
      />
      <div className="surface">
        <div className="table-toolbar">
          <div className="btn-group">
            <button type="button" className={`btn btn-sm ${!unreadOnly ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setParams({ unreadOnly: '' })}>
              All
            </button>
            <button type="button" className={`btn btn-sm ${unreadOnly ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setParams({ unreadOnly: 'true' })}>
              Unread
            </button>
          </div>
        </div>
        {isLoading ? (
          <LoadingState rows={5} />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !data.items.length ? (
          <EmptyState icon={Bell} title="You’re all caught up" message="New notifications will appear here." />
        ) : (
          <ul className="list-unstyled mb-0">
            {data.items.map((notification) => {
              const { icon: Icon, tone } = TYPE_ICONS[notification.type] ?? TYPE_ICONS.GENERAL
              const unread = !notification.readAt
              return (
                <li key={notification.id} className="d-flex gap-3 px-3 py-3 border-bottom" style={unread ? { background: '#fafaff' } : undefined}>
                  <div className={`kpi-icon ${tone}`} style={{ width: 40, height: 40 }}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-semibold">{notification.title}</span>
                      {unread && <span className="rounded-circle" style={{ width: 8, height: 8, background: 'var(--cp-primary)' }} aria-label="Unread" />}
                    </div>
                    <div className="text-muted-cp">{notification.message}</div>
                    <div className="small text-soft" title={formatDateTime(notification.createdAt)}>
                      {formatRelative(notification.createdAt)}
                      {notification.link && (
                        <>
                          {' · '}
                          <Link to={notification.link} className="text-decoration-none">
                            Open
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                  {unread && (
                    <Button variant="ghost" size="sm" onClick={() => markRead.mutate(notification.id)}>
                      Mark read
                    </Button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
        <Pagination pagination={data?.pagination} onPageChange={(page) => setParams({ page })} />
      </div>
    </>
  )
}

export default NotificationsPage
