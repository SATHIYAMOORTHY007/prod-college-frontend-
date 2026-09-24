export const ROUTES = Object.freeze({
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  STUDENTS: '/students',
  STAFF: '/staff',
  DEPARTMENTS: '/departments',
  COURSES: '/courses',
  EXAMS: '/exams',
  EXAM_MARKS: '/exams/:examId/marks',
  RESULTS: '/results',
  ATTENDANCE: '/attendance',
  MARK_ATTENDANCE: '/attendance/mark',
  NOTIFICATIONS: '/notifications',
  AUDIT_LOGS: '/audit-logs',
  FORBIDDEN: '/403',
})

export const examMarksPath = (examId) => `/exams/${examId}/marks`
