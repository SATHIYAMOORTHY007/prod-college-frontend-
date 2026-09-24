import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { departmentApi } from '../../services/departmentApi'

export const departmentKeys = { all: ['departments'] }

/** Reference data: changes rarely, so it is cached for 5 minutes. */
export function useDepartments() {
  return useQuery({ queryKey: departmentKeys.all, queryFn: departmentApi.list, staleTime: 5 * 60 * 1000 })
}

export function useDepartmentOptions() {
  const { data = [], ...rest } = useDepartments()
  return { options: data.map((d) => ({ value: d.id, label: `${d.code} — ${d.name}` })), ...rest }
}

export function useSaveDepartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }) => (id ? departmentApi.update(id, payload) : departmentApi.create(payload)),
    onSuccess: (_, variables) => {
      toast.success(variables.id ? 'Department updated' : 'Department created')
      queryClient.invalidateQueries({ queryKey: departmentKeys.all })
    },
  })
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => departmentApi.remove(id),
    onSuccess: () => {
      toast.success('Department deleted')
      queryClient.invalidateQueries({ queryKey: departmentKeys.all })
    },
  })
}
