import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  Bell,
  BookOpen,
  Building2,
  CalendarCheck,
  CalendarClock,
  ClipboardCheck,
  ClipboardList,
  FileCheck2,
  GraduationCap,
  Hourglass,
  Percent,
  Send,
  UserCog,
} from 'lucide-react'
import { ErrorState, KpiCard, PageHeader } from '../../components/ui'
import { ROLES } from '../../constants/roles'
import { ROUTES } from '../../constants/routes'
import { selectCurrentUser } from '../../store/selectors/authSelectors'
import { firstName, formatPercent, formatRelative } from '../../utils/format'
import { useDashboard } from './useDashboard'
import { CHART_COLORS, ChartCard, DonutChart, SimpleBarChart } from './charts'
import UpcomingExams from './UpcomingExams'

const STATUS_COLORS = {
  DRAFT: CHART_COLORS.slate,
  SUBMITTED: CHART_COLORS.amber,
  APPROVED: CHART_COLORS.sky,
  PUBLISHED: CHART_COLORS.green,
}

const statusSlices = (counts = {}) =>
  Object.entries(STATUS_COLORS).map(([status, color]) => ({
    name: status.charAt(0) + status.slice(1).toLowerCase(),
    value: counts[status] ?? 0,
    color,
  }))

const attendanceColor = (row) =>
  row.percentage < 75 ? CHART_COLORS.rose : row.percentage < 85 ? CHART_COLORS.amber : CHART_COLORS.green

/** "CSE Sem 3 — Internal Assessment 1" → "CSE Sem 3 IA 1" so axis labels fit. */
const shortExamName = (name) =>
  name.replace('Internal Assessment', 'IA').replace('End Semester Examination', 'End Sem').replace(' — ', ' ')

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function KpiGrid({ items, isLoading }) {
  return (
    <div className="kpi-grid">
      {items.map((item) => (
        <KpiCard key={item.label} {...item} isLoading={isLoading} />
      ))}
    </div>
  )
}

function AdminDashboard({ data, isLoading }) {
  const k = data?.kpis ?? {}
  return (
    <>
      <KpiGrid
        isLoading={isLoading}
        items={[
          { label: 'Total students', value: k.totalStudents, icon: GraduationCap, tone: 'indigo' },
          { label: 'Examiners', value: k.totalExaminers, icon: UserCog, tone: 'sky' },
          { label: 'Departments', value: k.departments, icon: Building2, tone: 'amber' },
          { label: 'Active courses', value: k.activeCourses, icon: BookOpen, tone: 'green' },
          { label: 'Upcoming exams', value: k.upcomingExams, icon: CalendarClock, tone: 'rose' },
        ]}
      />
      <div className="row g-3">
        <div className="col-lg-7">
          <ChartCard title="Students by department" subtitle="Active enrolments">
            <SimpleBarChart
              data={data?.charts.studentsPerDepartment}
              xKey="department"
              bars={[{ key: 'students', name: 'Students' }]}
            />
          </ChartCard>
        </div>
        <div className="col-lg-5">
          <UpcomingExams exams={data?.upcomingExams} />
        </div>
      </div>
    </>
  )
}

function PrincipalDashboard({ data, isLoading }) {
  const k = data?.kpis ?? {}
  return (
    <>
      <KpiGrid
        isLoading={isLoading}
        items={[
          { label: 'Total students', value: k.totalStudents, icon: GraduationCap, tone: 'indigo' },
          {
            label: 'Attendance',
            value: formatPercent(k.attendancePercentage),
            icon: CalendarCheck,
            tone: 'green',
            hint: 'All recorded classes',
          },
          {
            label: 'Pass rate',
            value: formatPercent(k.passPercentage),
            icon: Percent,
            tone: 'sky',
            hint: 'Approved & published results',
          },
          { label: 'Pending approvals', value: k.pendingApprovals, icon: Hourglass, tone: 'amber' },
          { label: 'Upcoming exams', value: k.upcomingExams, icon: CalendarClock, tone: 'rose' },
        ]}
      />
      {k.pendingApprovals > 0 && (
        <div className="alert d-flex align-items-center justify-content-between tone-amber border-0 mb-3" style={{ borderRadius: 12 }}>
          <span>
            <strong>{k.pendingApprovals}</strong> result{k.pendingApprovals === 1 ? ' is' : 's are'} waiting for your
            approval.
          </span>
          <Link to={`${ROUTES.RESULTS}?status=SUBMITTED`} className="btn btn-sm btn-secondary">
            Review now
          </Link>
        </div>
      )}
      <div className="row g-3">
        <div className="col-lg-4">
          <ChartCard title="Result pipeline" subtitle="Results by workflow stage">
            <DonutChart data={statusSlices(data?.charts.resultStatus)} />
          </ChartCard>
        </div>
        <div className="col-lg-4">
          <ChartCard title="Pass rate by department" subtitle="Finalised results">
            <SimpleBarChart
              data={data?.charts.passRateByDepartment}
              xKey="department"
              bars={[{ key: 'passPercentage', name: 'Pass rate', color: CHART_COLORS.green }]}
              yDomain={[0, 100]}
              unit="%"
            />
          </ChartCard>
        </div>
        <div className="col-lg-4">
          <UpcomingExams exams={data?.upcomingExams} />
        </div>
      </div>
    </>
  )
}

function ExaminerDashboard({ data, isLoading }) {
  const k = data?.kpis ?? {}
  return (
    <>
      <KpiGrid
        isLoading={isLoading}
        items={[
          { label: 'Assigned exams', value: k.assignedExams, icon: ClipboardList, tone: 'indigo' },
          { label: 'Pending marks', value: k.pendingMarks, icon: Hourglass, tone: 'amber', hint: 'Students without marks' },
          { label: 'Drafts', value: k.draftResults, icon: FileCheck2, tone: 'slate', hint: 'Not yet submitted' },
          { label: 'Submitted', value: k.submittedResults, icon: Send, tone: 'sky', hint: 'Awaiting approval' },
        ]}
      />
      <div className="row g-3">
        <div className="col-lg-7">
          <ChartCard title="Marks entry progress" subtitle="Students with marks vs. enrolled, per exam">
            <SimpleBarChart
              data={data?.charts.examProgress?.map((row) => ({ ...row, exam: shortExamName(row.exam) }))}
              xKey="exam"
              bars={[
                { key: 'enrolled', name: 'Enrolled', color: CHART_COLORS.primarySoft },
                { key: 'entered', name: 'Marks entered', color: CHART_COLORS.primary },
              ]}
            />
          </ChartCard>
        </div>
        <div className="col-lg-5">
          <UpcomingExams exams={data?.upcomingExams} />
        </div>
      </div>
    </>
  )
}

function StudentDashboard({ data, isLoading }) {
  const k = data?.kpis ?? {}
  const lowAttendance = k.attendancePercentage !== null && k.attendancePercentage < 75
  return (
    <>
      <KpiGrid
        isLoading={isLoading}
        items={[
          {
            label: 'Attendance',
            value: formatPercent(k.attendancePercentage),
            icon: CalendarCheck,
            tone: lowAttendance ? 'rose' : 'green',
            hint: 'Minimum required: 75%',
          },
          { label: 'Upcoming exams', value: k.upcomingExams, icon: CalendarClock, tone: 'indigo' },
          { label: 'Published results', value: k.publishedResults, icon: ClipboardCheck, tone: 'sky' },
          { label: 'Unread notifications', value: k.unreadNotifications, icon: Bell, tone: 'amber' },
        ]}
      />
      <div className="row g-3">
        <div className="col-lg-7">
          <ChartCard title="Attendance by subject" subtitle="Current semester · below 75% is highlighted">
            <SimpleBarChart
              data={data?.charts.attendanceBySubject}
              xKey="subjectCode"
              bars={[{ key: 'percentage', name: 'Attendance' }]}
              yDomain={[0, 100]}
              unit="%"
              colorFor={attendanceColor}
            />
          </ChartCard>
        </div>
        <div className="col-lg-5 d-flex flex-column gap-3">
          <UpcomingExams exams={data?.upcomingExams} />
          <div className="surface">
            <div className="surface-header">
              <h3 className="surface-title">Recent notifications</h3>
              <Link to={ROUTES.NOTIFICATIONS} className="small fw-semibold text-decoration-none">
                View all
              </Link>
            </div>
            <ul className="list-unstyled mb-0">
              {(data?.recentNotifications ?? []).slice(0, 3).map((notification) => (
                <li key={notification.id} className="px-3 py-2 border-bottom">
                  <div className="fw-semibold small">{notification.title}</div>
                  <div className="small text-muted-cp">{notification.message}</div>
                  <div className="text-soft" style={{ fontSize: '0.72rem' }}>
                    {formatRelative(notification.createdAt)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

const DASHBOARDS = {
  [ROLES.ADMIN]: { component: AdminDashboard, subtitle: 'An overview of the whole college.' },
  [ROLES.PRINCIPAL]: { component: PrincipalDashboard, subtitle: 'Academic performance and pending decisions.' },
  [ROLES.EXAMINER]: { component: ExaminerDashboard, subtitle: 'Your exams and marks entry progress.' },
  [ROLES.STUDENT]: { component: StudentDashboard, subtitle: 'Your attendance, exams and results at a glance.' },
}

function DashboardPage() {
  const user = useSelector(selectCurrentUser)
  const { data, isLoading, error, refetch } = useDashboard()
  const { component: RoleDashboard, subtitle } = DASHBOARDS[user.role]

  return (
    <>
      <PageHeader title={`${greeting()}, ${firstName(user.name)}`} subtitle={subtitle} />
      {error ? (
        <div className="surface">
          <ErrorState error={error} onRetry={refetch} />
        </div>
      ) : (
        <RoleDashboard data={data} isLoading={isLoading} />
      )}
    </>
  )
}

export default DashboardPage
