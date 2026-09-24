import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { attendanceApi } from '../../services/attendanceApi'

export const attendanceKeys = {
  all: ['attendance'],
  sheet: (params) => ['attendance', 'sheet', params],
  summary: (params) => ['attendance', 'summary', params],
  list: (params) => ['attendance', 'list', params],
}

export function useAttendanceSheet(params) {
  return useQuery({
    queryKey: attendanceKeys.sheet(params),
    queryFn: () => attendanceApi.sheet(params),
    enabled: Boolean(params.subject && params.date),
  })
}

export function useAttendanceSummary(params = {}) {
  return useQuery({ queryKey: attendanceKeys.summary(params), queryFn: () => attendanceApi.summary(params) })
}

export function useAttendanceRecords(params) {
  return useQuery({ queryKey: attendanceKeys.list(params), queryFn: () => attendanceApi.list(params), placeholderData: keepPreviousData })
}

export function useMarkAttendance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: attendanceApi.mark,
    onSuccess: (summary) => {
      toast.success(`Attendance saved — ${summary.present} present, ${summary.absent} absent`)
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
