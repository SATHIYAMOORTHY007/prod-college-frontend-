import { createSlice } from '@reduxjs/toolkit'
import { fetchCurrentUser, login, logout, refreshSession } from '../actions/authActions'

/**
 * Client-side authentication state.
 * - accessToken is kept in memory only (never localStorage), so it does not survive
 *   XSS-readable storage or a reload; the refresh cookie restores it.
 * - The refresh token never reaches JavaScript at all (httpOnly cookie).
 * - Passwords are never stored.
 */
export const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  /** true once the startup session-restore attempt has finished */
  initialized: false,

  loginStatus: 'idle', // idle | loading | succeeded | failed
  logoutStatus: 'idle',
  refreshStatus: 'idle',

  loading: false,
  error: null,
  errorCode: null,
  statusCode: null,
  successMsg: null,
}

function setSession(state, { accessToken, user }) {
  state.accessToken = accessToken
  state.user = user
  state.isAuthenticated = true
  state.initialized = true
}

function signedOutState(extra = {}) {
  return { ...initialState, initialized: true, ...extra }
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Dispatched by the Axios interceptor after a silent refresh. */
    tokenRefreshed(state, action) {
      setSession(state, action.payload)
      state.refreshStatus = 'succeeded'
    },
    /** Dispatched by the Axios interceptor when refresh fails. */
    sessionExpired() {
      return signedOutState({
        error: 'Your session has expired. Please sign in again.',
        errorCode: 'SESSION_EXPIRED',
        statusCode: 401,
      })
    },
    clearAuthMessages(state) {
      state.error = null
      state.errorCode = null
      state.statusCode = null
      state.successMsg = null
    },
  },
  extraReducers: (builder) => {
    builder
      // ---- login ----
      .addCase(login.pending, (state) => {
        state.loginStatus = 'loading'
        state.loading = true
        state.error = null
        state.errorCode = null
        state.statusCode = null
        state.successMsg = null
      })
      .addCase(login.fulfilled, (state, action) => {
        setSession(state, action.payload)
        state.loginStatus = 'succeeded'
        state.loading = false
        state.statusCode = 200
        state.successMsg = `Welcome back, ${action.payload.user.name}`
      })
      .addCase(login.rejected, (state, action) => {
        state.loginStatus = 'failed'
        state.loading = false
        state.error = action.payload?.message ?? 'Unable to sign in'
        state.errorCode = action.payload?.code ?? null
        state.statusCode = action.payload?.status ?? null
      })

      // ---- logout ----
      .addCase(logout.pending, (state) => {
        state.logoutStatus = 'loading'
      })
      .addCase(logout.fulfilled, () => signedOutState({ logoutStatus: 'succeeded' }))
      .addCase(logout.rejected, () => signedOutState({ logoutStatus: 'failed' }))

      // ---- restore session on startup ----
      .addCase(refreshSession.pending, (state) => {
        state.refreshStatus = 'loading'
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        setSession(state, action.payload)
        state.refreshStatus = 'succeeded'
      })
      .addCase(refreshSession.rejected, (state) => {
        // Not signed in (or cookie expired) — a normal outcome, not an error to show.
        state.refreshStatus = 'failed'
        state.initialized = true
        state.isAuthenticated = false
        state.user = null
        state.accessToken = null
      })

      // ---- current user ----
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.user
      })
  },
})

export const { tokenRefreshed, sessionExpired, clearAuthMessages } = authSlice.actions
export default authSlice.reducer
