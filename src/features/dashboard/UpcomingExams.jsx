import { Link } from 'react-router-dom'
import { CalendarClock } from 'lucide-react'
import { EmptyState, StatusBadge } from '../../components/ui'
import { ROUTES } from '../../constants/routes'
import { formatDate } from '../../utils/format'

function daysUntil(date) {
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return `In ${days} days`
}

function UpcomingExams({ exams = [] }) {
  return (
    <div className="surface h-100">
      <div className="surface-header">
        <h3 className="surface-title">Upcoming exams</h3>
        <Link to={`${ROUTES.EXAMS}?upcoming=true`} className="small fw-semibold text-decoration-none">
          View all
        </Link>
      </div>
      {exams.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No upcoming exams" />
      ) : (
        <ul className="list-unstyled mb-0">
          {exams.map((exam) => (
            <li key={exam.id} className="d-flex align-items-center gap-3 px-3 py-3 border-bottom">
              <div className="kpi-icon tone-indigo" style={{ width: 40, height: 40 }}>
                <CalendarClock size={18} />
              </div>
              <div className="min-w-0 flex-grow-1">
                <div className="fw-semibold text-truncate">{exam.name}</div>
                <div className="small text-muted-cp">
                  {exam.course?.code} · {formatDate(exam.startDate)}
                </div>
              </div>
              <div className="text-end">
                <StatusBadge status={exam.type} dot={false} />
                <div className="small text-soft mt-1">{daysUntil(exam.startDate)}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default UpcomingExams
