import { apiClient, unwrap } from './apiClient'

export const dashboardApi = {
  get: () => unwrap(apiClient.get('/dashboard')),
}
