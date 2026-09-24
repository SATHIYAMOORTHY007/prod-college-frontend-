import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient, configureAuthHandlers, refreshClient } from './apiClient'

/** Fake transport: lets each test decide how the "server" answers. */
function respond(config, status, data) {
  const response = { status, data, headers: {}, config, statusText: String(status) }
  if (status >= 400) {
    const error = new Error(`Request failed with status ${status}`)
    error.config = config
    error.response = response
    return Promise.reject(error)
  }
  return Promise.resolve(response)
}

let accessToken
let handlers

beforeEach(() => {
  accessToken = 'expired-token'
  handlers = {
    getAccessToken: () => accessToken,
    onTokenRefreshed: vi.fn((session) => {
      accessToken = session.accessToken
    }),
    onSessionExpired: vi.fn(),
  }
  configureAuthHandlers(handlers)
})

afterEach(() => {
  delete apiClient.defaults.adapter
  delete refreshClient.defaults.adapter
})

describe('apiClient token refresh', () => {
  it('refreshes once for concurrent 401s, then retries every request with the new token', async () => {
    const refreshCalls = vi.fn()
    refreshClient.defaults.adapter = (config) => {
      refreshCalls()
      return new Promise((resolve) =>
        setTimeout(() => resolve(respond(config, 200, { data: { accessToken: 'fresh-token', user: { id: '1' } } })), 10),
      )
    }
    apiClient.defaults.adapter = (config) =>
      config.headers.Authorization === 'Bearer fresh-token'
        ? respond(config, 200, { data: { url: config.url } })
        : respond(config, 401, { code: 'TOKEN_EXPIRED', message: 'Access token expired' })

    const results = await Promise.all([apiClient.get('/students'), apiClient.get('/exams'), apiClient.get('/results')])

    expect(refreshCalls).toHaveBeenCalledTimes(1)
    expect(results.map((r) => r.data.data.url)).toEqual(['/students', '/exams', '/results'])
    expect(handlers.onTokenRefreshed).toHaveBeenCalledTimes(1)
  })

  it('signs the user out and rejects queued requests when refresh fails', async () => {
    refreshClient.defaults.adapter = (config) => respond(config, 401, { code: 'INVALID_REFRESH_TOKEN', message: 'Session expired' })
    apiClient.defaults.adapter = (config) => respond(config, 401, { code: 'TOKEN_EXPIRED', message: 'Access token expired' })

    const outcomes = await Promise.allSettled([apiClient.get('/students'), apiClient.get('/exams')])

    expect(outcomes.every((o) => o.status === 'rejected')).toBe(true)
    expect(outcomes[0].reason).toMatchObject({ name: 'ApiError', code: 'INVALID_REFRESH_TOKEN' })
    expect(handlers.onSessionExpired).toHaveBeenCalled()
  })

  it('does not retry the same request twice (no refresh loop)', async () => {
    const refreshCalls = vi.fn()
    refreshClient.defaults.adapter = (config) => {
      refreshCalls()
      return respond(config, 200, { data: { accessToken: 'still-rejected', user: {} } })
    }
    const apiCalls = vi.fn()
    apiClient.defaults.adapter = (config) => {
      apiCalls()
      return respond(config, 401, { code: 'TOKEN_REVOKED', message: 'Revoked' })
    }

    await expect(apiClient.get('/students')).rejects.toMatchObject({ status: 401, code: 'TOKEN_REVOKED' })
    expect(refreshCalls).toHaveBeenCalledTimes(1)
    expect(apiCalls).toHaveBeenCalledTimes(2) // original + one retry
  })

  it('never tries to refresh for a failed login', async () => {
    const refreshCalls = vi.fn()
    refreshClient.defaults.adapter = (config) => {
      refreshCalls()
      return respond(config, 200, {})
    }
    apiClient.defaults.adapter = (config) => respond(config, 401, { code: 'INVALID_CREDENTIALS', message: 'Invalid username or password' })

    await expect(apiClient.post('/auth/login', {})).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' })
    expect(refreshCalls).not.toHaveBeenCalled()
  })

  it('normalises network failures into a readable ApiError', async () => {
    apiClient.defaults.adapter = () => Promise.reject(Object.assign(new Error('Network Error'), { code: 'ERR_NETWORK' }))
    await expect(apiClient.get('/students')).rejects.toMatchObject({ code: 'NETWORK_ERROR', status: 0 })
  })
})
