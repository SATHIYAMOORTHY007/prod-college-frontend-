import { apiClient, cleanParams, unwrap } from './apiClient'

export const notificationApi = {
  list: (params) => unwrap(apiClient.get('/notifications', { params: cleanParams(params) })),
  markRead: (id) => unwrap(apiClient.patch(`/notifications/${id}/read`)),
  markAllRead: () => unwrap(apiClient.patch('/notifications/read-all')),
}
