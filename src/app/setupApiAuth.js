import toast from 'react-hot-toast'
import { configureAuthHandlers } from '../services/apiClient'
import { sessionExpired, tokenRefreshed } from '../store/slices/authSlice'
import { queryClient } from './queryClient'

/**
 * Connects the Axios client to Redux: the client reads the in-memory
 * access token from the store and reports refreshes / expiry back to it.
 */
export function setupApiAuth(store) {
  configureAuthHandlers({
    getAccessToken: () => store.getState().auth.accessToken,
    onTokenRefreshed: (session) => store.dispatch(tokenRefreshed(session)),
    onSessionExpired: () => {
      if (!store.getState().auth.isAuthenticated) return
      store.dispatch(sessionExpired())
      queryClient.clear()
      toast.error('Your session has expired. Please sign in again.', { id: 'session-expired' })
    },
  })
}
