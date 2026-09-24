import { apiClient, cleanParams, unwrap } from './apiClient'

export const userApi = {
  list: (params) => unwrap(apiClient.get('/users', { params: cleanParams(params) })),
  create: (payload) => unwrap(apiClient.post('/users', payload)),
  update: (id, payload) => unwrap(apiClient.patch(`/users/${id}`, payload)),
  deactivate: (id) => unwrap(apiClient.delete(`/users/${id}`)),
}
