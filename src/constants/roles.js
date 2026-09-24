export const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  PRINCIPAL: 'PRINCIPAL',
  EXAMINER: 'EXAMINER',
  STUDENT: 'STUDENT',
})

export const ROLE_LABELS = {
  ADMIN: 'Administrator',
  PRINCIPAL: 'Principal',
  EXAMINER: 'Examiner',
  STUDENT: 'Student',
}

export const STAFF_ROLES = [ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.EXAMINER]

/** Mirrors the backend permission names. The backend stays the source of truth. */
export const PERMISSIONS = Object.freeze({
  USERS_VIEW: 'users:view',
  USERS_MANAGE: 'users:manage',
  STUDENTS_VIEW: 'students:view',
  STUDENTS_CREATE: 'students:create',
  STUDENTS_UPDATE: 'students:update',
  STUDENTS_DELETE: 'students:delete',
  ACADEMICS_VIEW: 'academics:view',
  ACADEMICS_MANAGE: 'academics:manage',
  EXAMS_VIEW: 'exams:view',
  EXAMS_MANAGE: 'exams:manage',
  RESULTS_VIEW: 'results:view',
  RESULTS_CREATE: 'results:create',
  RESULTS_SUBMIT: 'results:submit',
  RESULTS_APPROVE: 'results:approve',
  RESULTS_PUBLISH: 'results:publish',
  ATTENDANCE_VIEW: 'attendance:view',
  ATTENDANCE_CREATE: 'attendance:create',
  AUDIT_VIEW: 'audit:view',
})
