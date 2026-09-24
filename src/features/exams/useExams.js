import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { examApi } from '../../services/examApi'

export const examKeys = {
  all: ['exams'],
  list: (params) => ['exams', 'list', params],
  detail: (id) => ['exams', 'detail', id],
  roster: (id) => ['exams', 'roster', id],
}

export function useExams(params) {
  return useQuery({ queryKey: examKeys.list(params), queryFn: () => examApi.list(params), placeholderData: keepPreviousData })
}

export function useExamRoster(examId) {
  return useQuery({ queryKey: examKeys.roster(examId), queryFn: () => examApi.roster(examId), enabled: Boolean(examId) })
}

export function useSaveExam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }) => (id ? examApi.update(id, payload) : examApi.create(payload)),
    onSuccess: (exam, variables) => {
      toast.success(variables.id ? 'Exam updated' : `${exam.name} scheduled`)
      queryClient.invalidateQueries({ queryKey: examKeys.all })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteExam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => examApi.remove(id),
    onSuccess: () => {
      toast.success('Exam deleted')
      queryClient.invalidateQueries({ queryKey: examKeys.all })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
