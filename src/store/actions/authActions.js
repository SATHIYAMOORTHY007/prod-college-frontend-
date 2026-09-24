import { createAsyncThunk } from '@reduxjs/toolkit'
import { authApi } from '../../services/authApi'
import { queryClient } from '../../app/queryClient'
import { serializeError } from '../../utils/errors'

/**
 * Async auth actions. Each thunk dispatches pending → fulfilled | rejected,
 * the Redux Toolkit equivalent of LoginRequest → LoginSuccess | LoginFail.
 */

/** @param {{ identifier: string, password: string }} credentials */
export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    return await authApi.login(credentials) // { accessToken, user }
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

/**
 * Always clears the local session, even if the server call fails
 * (e.g. offline): the user asked to sign out.
 */
export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await authApi.logout()
  } catch {
    // ignored on purpose, see above
  } finally {
    queryClient.clear() // drop every cached response that belonged to this user
  }
})

/**
 * Restores the session on page load. The access token only lives in
 * memory, so after a reload the httpOnly refresh cookie is exchanged
 * for a new one.
 */
export const refreshSession = createAsyncThunk('auth/refresh', async (_, { rejectWithValue }) => {
  try {
    return await authApi.refresh()
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  try {
    return await authApi.me() // { user }
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})
