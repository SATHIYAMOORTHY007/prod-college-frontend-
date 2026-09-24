import { apiClient, cleanParams, unwrap } from './apiClient'

export const examApi = {
  list: (params) => unwrap(apiClient.get('/exams', { params: cleanParams(params) })),
  get: (id) => unwrap(apiClient.get(`/exams/${id}`)),
  roster: (id) => unwrap(apiClient.get(`/exams/${id}/roster`)),
  create: (payload) => unwrap(apiClient.post('/exams', payload)),
  update: (id, payload) => unwrap(apiClient.patch(`/exams/${id}`, payload)),
  remove: (id) => unwrap(apiClient.delete(`/exams/${id}`)),
}
