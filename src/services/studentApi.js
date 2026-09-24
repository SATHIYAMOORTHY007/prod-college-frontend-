import { apiClient, cleanParams, unwrap } from './apiClient'

export const studentApi = {
  list: (params) => unwrap(apiClient.get('/students', { params: cleanParams(params) })),
  get: (id) => unwrap(apiClient.get(`/students/${id}`)),
  me: () => unwrap(apiClient.get('/students/me')),
  create: (payload) => unwrap(apiClient.post('/students', payload)),
  update: (id, payload) => unwrap(apiClient.patch(`/students/${id}`, payload)),
  remove: (id) => unwrap(apiClient.delete(`/students/${id}`)),
}
