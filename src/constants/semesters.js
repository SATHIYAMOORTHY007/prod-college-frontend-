export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8]

export const SEMESTER_OPTIONS = SEMESTERS.map((value) => ({ value: String(value), label: `Semester ${value}` }))

/** Semesters 1…N for a course (N comes from the course, e.g. 8 for B.E., 4 for M.E.). */
export function semesterOptionsFor(totalSemesters = SEMESTERS.length) {
  return SEMESTER_OPTIONS.slice(0, totalSemesters)
}

export const SECTIONS = ['A', 'B', 'C', 'D']
export const SECTION_OPTIONS = SECTIONS.map((value) => ({ value, label: `Section ${value}` }))

export const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
]

export const EXAM_TYPE_OPTIONS = [
  { value: 'INTERNAL', label: 'Internal assessment' },
  { value: 'SEMESTER', label: 'End semester' },
  { value: 'PRACTICAL', label: 'Practical' },
]

export const RESULT_STATUS = Object.freeze({
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  PUBLISHED: 'PUBLISHED',
})
