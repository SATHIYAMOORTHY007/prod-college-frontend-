import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { resultApi } from '../../services/resultApi'
import { examKeys } from '../exams/useExams'

export const resultKeys = {
  all: ['results'],
  list: (params) => ['results', 'list', params],
  detail: (id) => ['results', 'detail', id],
}

const ACTION_MESSAGES = {
  submit: 'Submitted for approval',
  approve: 'Result approved',
  reject: 'Sent back to the examiner',
  publish: 'Result published to the student',
}

export function useResults(params) {
  return useQuery({ queryKey: resultKeys.list(params), queryFn: () => resultApi.list(params), placeholderData: keepPreviousData })
}

export function useResult(id) {
  return useQuery({ queryKey: resultKeys.detail(id), queryFn: () => resultApi.get(id), enabled: Boolean(id) })
}

/** Anything that changes a result also changes rosters, dashboards and notifications. */
function useInvalidateResultData() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: resultKeys.all })
    queryClient.invalidateQueries({ queryKey: examKeys.all })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }
}

/** Create a draft or update draft marks. */
export function useSaveMarks() {
  const invalidate = useInvalidateResultData()
  return useMutation({
    mutationFn: ({ resultId, exam, student, marks }) =>
      resultId ? resultApi.updateMarks(resultId, marks) : resultApi.create({ exam, student, marks }),
    onSuccess: invalidate,
  })
}

export function useResultTransition() {
  const invalidate = useInvalidateResultData()
  return useMutation({
    mutationFn: ({ id, action, note }) => resultApi.transition(id, action, note),
    onSuccess: (_, { action }) => {
      toast.success(ACTION_MESSAGES[action])
      invalidate()
    },
  })
}

export function useBulkResultTransition() {
  const invalidate = useInvalidateResultData()
  return useMutation({
    mutationFn: ({ action, ids, note }) => resultApi.bulkTransition(action, ids, note),
    onSuccess: ({ succeeded, failed }) => {
      if (succeeded.length) toast.success(`${succeeded.length} result${succeeded.length > 1 ? 's' : ''} updated`)
      if (failed.length) toast.error(`${failed.length} could not be updated: ${failed[0].message}`)
      invalidate()
    },
  })
}
