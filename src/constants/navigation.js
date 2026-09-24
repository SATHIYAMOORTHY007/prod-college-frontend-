import {
  LayoutDashboard,
  UserRound,
  GraduationCap,
  Users,
  Building2,
  BookOpen,
  CalendarClock,
  ClipboardCheck,
  CalendarCheck,
  Bell,
  ScrollText,
} from 'lucide-react'
import { ROLES } from './roles'
import { ROUTES } from './routes'

const { ADMIN, PRINCIPAL, EXAMINER, STUDENT } = ROLES

/**
 * Sidebar items per role. Labels change with context ("My Results" for a
 * student, "Result Approvals" for the principal) while pointing at the same
 * page, whose data the backend scopes to the caller.
 */
export const NAVIGATION = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard, roles: [ADMIN, PRINCIPAL, EXAMINER, STUDENT] },
  { to: ROUTES.PROFILE, label: 'My Profile', icon: UserRound, roles: [STUDENT] },
  { to: ROUTES.STUDENTS, label: 'Students', icon: GraduationCap, roles: [ADMIN, PRINCIPAL, EXAMINER] },
  { to: ROUTES.STAFF, label: 'Staff', icon: Users, roles: [ADMIN, PRINCIPAL] },
  { to: ROUTES.DEPARTMENTS, label: 'Departments', icon: Building2, roles: [ADMIN, PRINCIPAL] },
  { to: ROUTES.COURSES, label: 'Courses & Subjects', icon: BookOpen, roles: [ADMIN, PRINCIPAL] },
  { to: ROUTES.EXAMS, label: 'Exams', icon: CalendarClock, roles: [ADMIN, PRINCIPAL, EXAMINER, STUDENT], labelFor: { EXAMINER: 'My Exams', STUDENT: 'My Exams' } },
  { to: ROUTES.RESULTS, label: 'Results', icon: ClipboardCheck, roles: [ADMIN, PRINCIPAL, EXAMINER, STUDENT], labelFor: { PRINCIPAL: 'Result Approvals', STUDENT: 'My Results' } },
  { to: ROUTES.MARK_ATTENDANCE, label: 'Mark Attendance', icon: CalendarCheck, roles: [EXAMINER, ADMIN] },
  { to: ROUTES.ATTENDANCE, label: 'My Attendance', icon: CalendarCheck, roles: [STUDENT] },
  { to: ROUTES.NOTIFICATIONS, label: 'Notifications', icon: Bell, roles: [ADMIN, PRINCIPAL, EXAMINER, STUDENT] },
  { to: ROUTES.AUDIT_LOGS, label: 'Audit Logs', icon: ScrollText, roles: [ADMIN, PRINCIPAL] },
]

export function navigationFor(role) {
  return NAVIGATION.filter((item) => item.roles.includes(role)).map((item) => ({
    ...item,
    label: item.labelFor?.[role] ?? item.label,
  }))
}
