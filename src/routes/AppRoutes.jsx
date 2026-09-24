import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ROLES } from '../constants/roles'
import { ROUTES } from '../constants/routes'
import AuthLayout from '../layouts/AuthLayout'
import PortalLayout from '../layouts/PortalLayout'
import { EmptyState, LoadingState } from '../components/ui'
import ProtectedRoute from './ProtectedRoute'
import RoleRoute from './RoleRoute'
import GuestRoute from './GuestRoute'

// Each page is its own chunk, so users only download the screens their role can open.
const LoginPage = lazy(() => import('../features/auth/LoginPage'))
const ForgotPasswordPage = lazy(() => import('../features/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('../features/auth/ResetPasswordPage'))
const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'))
const StudentProfilePage = lazy(() => import('../features/students/StudentProfilePage'))
const StudentsPage = lazy(() => import('../features/students/StudentsPage'))
const StaffPage = lazy(() => import('../features/users/StaffPage'))
const DepartmentsPage = lazy(() => import('../features/departments/DepartmentsPage'))
const CoursesPage = lazy(() => import('../features/courses/CoursesPage'))
const ExamsPage = lazy(() => import('../features/exams/ExamsPage'))
const ExamMarksPage = lazy(() => import('../features/exams/ExamMarksPage'))
const ResultsPage = lazy(() => import('../features/results/ResultsPage'))
const MarkAttendancePage = lazy(() => import('../features/attendance/MarkAttendancePage'))
const MyAttendancePage = lazy(() => import('../features/attendance/MyAttendancePage'))
const NotificationsPage = lazy(() => import('../features/notifications/NotificationsPage'))
const AuditLogsPage = lazy(() => import('../features/audit/AuditLogsPage'))

const { ADMIN, PRINCIPAL, EXAMINER, STUDENT } = ROLES

function NotFound() {
  return (
    <div className="surface">
      <EmptyState title="Page not found" message="The page you are looking for does not exist." />
    </div>
  )
}

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingState label="Loading…" />}>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          </Route>
        </Route>
        {/* Reachable while signed in too: the link arrives by email. */}
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<PortalLayout />}>
            <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
            <Route path={ROUTES.EXAMS} element={<ExamsPage />} />
            <Route path={ROUTES.RESULTS} element={<ResultsPage />} />

            <Route element={<RoleRoute roles={[STUDENT]} />}>
              <Route path={ROUTES.PROFILE} element={<StudentProfilePage />} />
              <Route path={ROUTES.ATTENDANCE} element={<MyAttendancePage />} />
            </Route>

            <Route element={<RoleRoute roles={[ADMIN, PRINCIPAL, EXAMINER]} />}>
              <Route path={ROUTES.STUDENTS} element={<StudentsPage />} />
            </Route>

            <Route element={<RoleRoute roles={[ADMIN, PRINCIPAL]} />}>
              <Route path={ROUTES.STAFF} element={<StaffPage />} />
              <Route path={ROUTES.DEPARTMENTS} element={<DepartmentsPage />} />
              <Route path={ROUTES.COURSES} element={<CoursesPage />} />
              <Route path={ROUTES.AUDIT_LOGS} element={<AuditLogsPage />} />
            </Route>

            {/* Admin can step in for an absent examiner. */}
            <Route element={<RoleRoute roles={[EXAMINER, ADMIN]} />}>
              <Route path={ROUTES.EXAM_MARKS} element={<ExamMarksPage />} />
              <Route path={ROUTES.MARK_ATTENDANCE} element={<MarkAttendancePage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}

export default AppRoutes
