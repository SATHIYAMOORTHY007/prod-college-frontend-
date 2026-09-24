import { createAsyncThunk } from '@reduxjs/toolkit'
import { authApi } from '../../services/authApi'
import { serializeError } from '../../utils/errors'

export const forgotPassword = createAsyncThunk('forgotPassword/request', async ({ email }, { rejectWithValue }) => {
  try {
    const response = await authApi.forgotPassword({ email })
    return response.message
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

/**
 * The reset token is passed straight from the URL to the API and is
 * never written to the store.
 */
export const resetPassword = createAsyncThunk(
  'forgotPassword/reset',
  async ({ token, password, confirmPassword }, { rejectWithValue }) => {
    try {
      const response = await authApi.resetPassword({ token, password, confirmPassword })
      return response.message
    } catch (error) {
      return rejectWithValue(serializeError(error))
    }
  },
)
