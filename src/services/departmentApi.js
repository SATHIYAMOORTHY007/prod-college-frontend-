import { apiClient, unwrap } from './apiClient'

export const departmentApi = {
  list: () => unwrap(apiClient.get('/departments')),
  create: (payload) => unwrap(apiClient.post('/departments', payload)),
  update: (id, payload) => unwrap(apiClient.patch(`/departments/${id}`, payload)),
  remove: (id) => unwrap(apiClient.delete(`/departments/${id}`)),
}
