import { BookOpen, Building2, CalendarDays, Hash, Mail, Phone, UserRound, Users } from 'lucide-react'
import { ErrorState, LoadingState, PageHeader, StatusBadge } from '../../components/ui'
import { formatDate, initials, titleCase } from '../../utils/format'
import { useMyStudentProfile } from './useStudents'

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="col-sm-6 col-lg-4">
      <div className="d-flex gap-3 align-items-start p-3 rounded-3" style={{ background: '#f8fafc' }}>
        <div className="kpi-icon tone-indigo" style={{ width: 38, height: 38 }}>
          <Icon size={17} />
        </div>
        <div className="min-w-0">
          <div className="small text-muted-cp">{label}</div>
          <div className="fw-semibold text-truncate">{value || '—'}</div>
        </div>
      </div>
    </div>
  )
}

function StudentProfilePage() {
  const { data: student, isLoading, error, refetch } = useMyStudentProfile()

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState error={error} onRetry={refetch} />

  return (
    <>
      <PageHeader title="My profile" subtitle="Your academic record at ABC College of Engineering." />
      <div className="surface mb-3">
        <div className="surface-body d-flex align-items-center gap-3 flex-wrap">
          <span className="avatar avatar-lg">{initials(student.name)}</span>
          <div>
            <h2 className="h4 mb-1">{student.name}</h2>
            <div className="text-muted-cp">
              {student.course.name} · Semester {student.semester}
            </div>
          </div>
          <div className="ms-auto">
            <StatusBadge status={student.status} />
          </div>
        </div>
      </div>
      <div className="surface">
        <div className="surface-header">
          <h3 className="surface-title">Details</h3>
          <span className="small text-soft">Contact the office to correct any detail.</span>
        </div>
        <div className="surface-body">
          <div className="row g-3">
            <Detail icon={Hash} label="Roll number" value={student.rollNo} />
            <Detail icon={Building2} label="Department" value={student.department.name} />
            <Detail icon={BookOpen} label="Course" value={`${student.course.code} — ${student.course.name}`} />
            <Detail icon={Users} label="Semester / Section" value={`${student.semester} / ${student.section}`} />
            <Detail icon={UserRound} label="Gender" value={titleCase(student.gender)} />
            <Detail icon={CalendarDays} label="Batch (admission year)" value={student.admissionYear} />
            <Detail icon={Mail} label="Email" value={student.email} />
            <Detail icon={Phone} label="Phone" value={student.phone} />
            <Detail icon={CalendarDays} label="Date of birth" value={formatDate(student.dateOfBirth)} />
          </div>
        </div>
      </div>
    </>
  )
}

export default StudentProfilePage
