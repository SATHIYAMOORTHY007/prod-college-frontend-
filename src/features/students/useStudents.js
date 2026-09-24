import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { studentApi } from '../../services/studentApi'

export const studentKeys = {
  all: ['students'],
  list: (params) => ['students', 'list', params],
  detail: (id) => ['students', 'detail', id],
  me: ['students', 'me'],
}

/** keepPreviousData keeps the current page visible while the next one loads (no table flicker). */
export function useStudents(params) {
  return useQuery({
    queryKey: studentKeys.list(params),
    queryFn: () => studentApi.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useMyStudentProfile() {
  return useQuery({ queryKey: studentKeys.me, queryFn: studentApi.me })
}

export function useSaveStudent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }) => (id ? studentApi.update(id, payload) : studentApi.create(payload)),
    // Field errors are shown inline in the form instead of as a toast.
    meta: { silentError: true },
    onSuccess: (student, variables) => {
      toast.success(variables.id ? `${student.name} updated` : `${student.name} added`)
      queryClient.invalidateQueries({ queryKey: studentKeys.all })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeactivateStudent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => studentApi.remove(id),
    onSuccess: () => {
      toast.success('Student deactivated')
      queryClient.invalidateQueries({ queryKey: studentKeys.all })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
