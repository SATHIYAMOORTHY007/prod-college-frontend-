import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { userApi } from '../../services/userApi'

export const userKeys = {
  all: ['users'],
  list: (params) => ['users', 'list', params],
  examiners: ['users', 'examiners'],
}

export function useUsers(params) {
  return useQuery({ queryKey: userKeys.list(params), queryFn: () => userApi.list(params), placeholderData: keepPreviousData })
}

/** Active examiners for assignment dropdowns. */
export function useExaminerOptions(enabled = true) {
  const query = useQuery({
    queryKey: userKeys.examiners,
    queryFn: () => userApi.list({ role: 'EXAMINER', status: 'ACTIVE', limit: 100, sortBy: 'name', sortOrder: 'asc' }),
    staleTime: 5 * 60 * 1000,
    enabled,
  })
  return { ...query, options: (query.data?.items ?? []).map((u) => ({ value: u.id, label: u.name })) }
}

export function useSaveUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }) => (id ? userApi.update(id, payload) : userApi.create(payload)),
    meta: { silentError: true },
    onSuccess: (user, variables) => {
      toast.success(variables.id ? `${user.name} updated` : `${user.name} added`)
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

export function useDeactivateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => userApi.deactivate(id),
    onSuccess: () => {
      toast.success('Account deactivated')
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}
