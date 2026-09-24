import { describe, expect, it } from 'vitest'
import reducer, { initialState, sessionExpired, tokenRefreshed } from './authSlice'
import { login, logout, refreshSession } from '../actions/authActions'
import { selectHasPermission, selectIsAuthenticated, selectUserRole } from '../selectors/authSelectors'

const user = { id: '1', name: 'Dr. R. Venkatesan', role: 'PRINCIPAL', permissions: ['results:approve'] }
const session = { accessToken: 'access-1', user }

describe('authSlice', () => {
  it('login: pending → fulfilled stores the session', () => {
    let state = reducer(initialState, login.pending('req', {}))
    expect(state).toMatchObject({ loginStatus: 'loading', loading: true, error: null })

    state = reducer(state, login.fulfilled(session, 'req', {}))
    expect(state).toMatchObject({
      loginStatus: 'succeeded',
      loading: false,
      isAuthenticated: true,
      accessToken: 'access-1',
      user,
    })
  })

  it('login: rejected keeps the user signed out with the API message', () => {
    const payload = { message: 'Invalid username or password', code: 'INVALID_CREDENTIALS', status: 401 }
    const state = reducer(initialState, login.rejected(null, 'req', {}, payload))

    expect(state).toMatchObject({
      loginStatus: 'failed',
      isAuthenticated: false,
      error: 'Invalid username or password',
      errorCode: 'INVALID_CREDENTIALS',
      statusCode: 401,
    })
  })

  it('never stores the password that was submitted', () => {
    const state = reducer(initialState, login.fulfilled(session, 'req', { identifier: 'x', password: 'secret' }))
    expect(JSON.stringify(state)).not.toContain('secret')
  })

  it('logout clears everything but stays initialised', () => {
    const signedIn = reducer(initialState, login.fulfilled(session, 'req', {}))
    const state = reducer(signedIn, logout.fulfilled(undefined, 'req'))

    expect(state).toMatchObject({ isAuthenticated: false, user: null, accessToken: null, initialized: true })
  })

  it('a failed startup refresh just means "not signed in"', () => {
    const state = reducer(initialState, refreshSession.rejected(null, 'req', undefined, { code: 'INVALID_REFRESH_TOKEN' }))
    expect(state).toMatchObject({ initialized: true, isAuthenticated: false, error: null })
  })

  it('tokenRefreshed swaps in the new access token', () => {
    const signedIn = reducer(initialState, login.fulfilled(session, 'req', {}))
    const state = reducer(signedIn, tokenRefreshed({ accessToken: 'access-2', user }))
    expect(state.accessToken).toBe('access-2')
  })

  it('sessionExpired signs the user out with a message', () => {
    const signedIn = reducer(initialState, login.fulfilled(session, 'req', {}))
    const state = reducer(signedIn, sessionExpired())
    expect(state).toMatchObject({ isAuthenticated: false, accessToken: null, errorCode: 'SESSION_EXPIRED' })
  })
})

describe('auth selectors', () => {
  it('derive role, auth flag and permissions', () => {
    const state = { auth: reducer(initialState, login.fulfilled(session, 'req', {})) }
    expect(selectIsAuthenticated(state)).toBe(true)
    expect(selectUserRole(state)).toBe('PRINCIPAL')
    expect(selectHasPermission('results:approve')(state)).toBe(true)
    expect(selectHasPermission('users:manage')(state)).toBe(false)
  })
})
