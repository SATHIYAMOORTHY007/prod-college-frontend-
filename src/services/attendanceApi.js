import { apiClient, cleanParams, unwrap } from './apiClient'

export const attendanceApi = {
  list: (params) => unwrap(apiClient.get('/attendance', { params: cleanParams(params) })),
  summary: (params) => unwrap(apiClient.get('/attendance/summary', { params: cleanParams(params) })),
  sheet: (params) => unwrap(apiClient.get('/attendance/sheet', { params: cleanParams(params) })),
  mark: (payload) => unwrap(apiClient.post('/attendance', payload)),
}
