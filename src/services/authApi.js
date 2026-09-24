import { apiClient, refreshSession, unwrap } from './apiClient'

export const authApi = {
  /** @param {{ identifier: string, password: string }} credentials */
  login: (credentials) => unwrap(apiClient.post('/auth/login', credentials)),
  logout: () => unwrap(apiClient.post('/auth/logout')),
  refresh: () => refreshSession(),
  me: () => unwrap(apiClient.get('/auth/me')),
  forgotPassword: ({ email }) => apiClient.post('/auth/forgot-password', { email }).then((res) => res.data),
  resetPassword: (payload) => apiClient.post('/auth/reset-password', payload).then((res) => res.data),
}
