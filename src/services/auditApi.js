import { apiClient, cleanParams, unwrap } from './apiClient'

export const auditApi = {
  list: (params) => unwrap(apiClient.get('/audit-logs', { params: cleanParams(params) })),
}
