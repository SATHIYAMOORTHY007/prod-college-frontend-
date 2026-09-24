import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'

/** Normalised error thrown by every API call, whatever went wrong. */
export class ApiError extends Error {
  constructor({ message, status = 0, code = 'UNKNOWN_ERROR', errors = [], requestId }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.errors = errors
    this.requestId = requestId
  }
}

const baseConfig = {
  baseURL: API_BASE_URL,
  withCredentials: true, // sends the httpOnly refresh cookie to /auth endpoints
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
}

export const apiClient = axios.create(baseConfig)

// A bare instance for the refresh call itself, so its 401 can never
// re-enter the refresh interceptor and loop.
export const refreshClient = axios.create(baseConfig)

/**
 * The store is injected at startup instead of imported, which keeps
 * services free of a circular dependency on Redux.
 */
const authHandlers = {
  getAccessToken: () => null,
  onTokenRefreshed: () => {},
  onSessionExpired: () => {},
}

export function configureAuthHandlers(handlers) {
  Object.assign(authHandlers, handlers)
}

export function toApiError(error) {
  if (error instanceof ApiError) return error
  if (error?.response) {
    const { status, data, headers } = error.response
    return new ApiError({
      status,
      code: data?.code || `HTTP_${status}`,
      message: data?.message || 'Request failed',
      errors: data?.errors || [],
      requestId: headers?.['x-request-id'],
    })
  }
  if (error?.code === 'ECONNABORTED') {
    return new ApiError({ code: 'TIMEOUT', message: 'The server took too long to respond. Please try again.' })
  }
  return new ApiError({ code: 'NETWORK_ERROR', message: 'Cannot reach the server. Check your connection and try again.' })
}

// ---------- token refresh (single flight) ----------

let refreshPromise = null

/**
 * Exchanges the refresh cookie for a new access token.
 * While a refresh is in flight, every caller receives the same promise:
 * that shared promise *is* the queue of waiting requests, and it
 * guarantees the rotating refresh token is only ever used once.
 *
 * @returns {Promise<{ accessToken: string, user: object }>}
 */
export function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post('/auth/refresh')
      .then((response) => {
        const session = response.data.data
        authHandlers.onTokenRefreshed(session) // once per refresh, not once per waiting request
        return session
      })
      .catch((error) => {
        throw toApiError(error)
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

const NO_REFRESH_PATHS = ['/auth/login', '/auth/refresh', '/auth/logout', '/auth/forgot-password', '/auth/reset-password']

apiClient.interceptors.request.use((config) => {
  const token = authHandlers.getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const isAuthEndpoint = NO_REFRESH_PATHS.some((path) => original?.url?.startsWith(path))
    const shouldRefresh =
      error.response?.status === 401 &&
      original &&
      !original._retried && // never retry the same request twice
      !isAuthEndpoint &&
      authHandlers.getAccessToken() // only when the user was signed in

    if (!shouldRefresh) return Promise.reject(toApiError(error))

    original._retried = true
    try {
      const session = await refreshSession()
      original.headers.Authorization = `Bearer ${session.accessToken}`
      return apiClient(original)
    } catch (refreshError) {
      authHandlers.onSessionExpired()
      return Promise.reject(toApiError(refreshError))
    }
  },
)

/** Unwraps the `{ success, message, data }` envelope. */
export const unwrap = (promise) => promise.then((response) => response.data.data)

/** Drops empty filter values so they are not sent as `?search=`. */
export function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  )
}
