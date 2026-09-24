import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { courseApi } from '../../services/courseApi'
import { departmentKeys } from '../departments/useDepartments'
import { semesterOptionsFor } from '../../constants/semesters'

export const courseKeys = {
  all: ['courses'],
  list: (params) => ['courses', 'list', params],
  options: (department) => ['courses', 'options', department ?? 'all'],
  subjects: (courseId, semester) => ['courses', courseId, 'subjects', semester ?? 'all'],
}

export function useCourses(params) {
  return useQuery({ queryKey: courseKeys.list(params), queryFn: () => courseApi.list(params), placeholderData: keepPreviousData })
}

/** Dropdown options, optionally limited to one department. */
export function useCourseOptions(department) {
  const query = useQuery({
    queryKey: courseKeys.options(department),
    queryFn: () => courseApi.list({ department, limit: 100, isActive: true }),
    staleTime: 5 * 60 * 1000,
  })
  const courses = query.data?.items ?? []
  return {
    ...query,
    courses,
    options: courses.map((c) => ({ value: c.id, label: `${c.code} — ${c.name}` })),
  }
}

/** Semester choices for a course, from its configured length (1…totalSemesters). */
export function useSemesterOptions(courseId) {
  const { courses } = useCourseOptions()
  const course = courses.find((c) => c.id === courseId)
  return semesterOptionsFor(course?.totalSemesters)
}

export function useSubjects(courseId, semester) {
  return useQuery({
    queryKey: courseKeys.subjects(courseId, semester),
    queryFn: () => courseApi.listSubjects(courseId, { semester }),
    enabled: Boolean(courseId),
    staleTime: 5 * 60 * 1000,
  })
}

function useInvalidateCourses() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: courseKeys.all })
    queryClient.invalidateQueries({ queryKey: departmentKeys.all }) // course counts
  }
}

export function useSaveCourse() {
  const invalidate = useInvalidateCourses()
  return useMutation({
    mutationFn: ({ id, ...payload }) => (id ? courseApi.update(id, payload) : courseApi.create(payload)),
    onSuccess: (_, variables) => {
      toast.success(variables.id ? 'Course updated' : 'Course created')
      invalidate()
    },
  })
}

export function useDeleteCourse() {
  const invalidate = useInvalidateCourses()
  return useMutation({
    mutationFn: (id) => courseApi.remove(id),
    onSuccess: () => {
      toast.success('Course deleted')
      invalidate()
    },
  })
}

export function useSaveSubject(courseId) {
  const invalidate = useInvalidateCourses()
  return useMutation({
    mutationFn: ({ id, ...payload }) =>
      id ? courseApi.updateSubject(courseId, id, payload) : courseApi.createSubject(courseId, payload),
    onSuccess: (_, variables) => {
      toast.success(variables.id ? 'Subject updated' : 'Subject added')
      invalidate()
    },
  })
}

export function useDeleteSubject(courseId) {
  const invalidate = useInvalidateCourses()
  return useMutation({
    mutationFn: (subjectId) => courseApi.removeSubject(courseId, subjectId),
    onSuccess: () => {
      toast.success('Subject deleted')
      invalidate()
    },
  })
}
