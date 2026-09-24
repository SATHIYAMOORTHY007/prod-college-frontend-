import { createSlice } from '@reduxjs/toolkit'
import { forgotPassword, resetPassword } from '../actions/forgotPasswordActions'

const initialState = {
  forgotStatus: 'idle', // idle | loading | succeeded | failed
  resetStatus: 'idle',
  loading: false,
  message: null,
  error: null,
  errors: [], // field-level errors from the API
}

const forgotPasswordSlice = createSlice({
  name: 'forgotPassword',
  initialState,
  reducers: {
    resetForgotPasswordState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(forgotPassword.pending, (state) => {
        Object.assign(state, initialState, { forgotStatus: 'loading', loading: true })
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.forgotStatus = 'succeeded'
        state.loading = false
        state.message = action.payload
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.forgotStatus = 'failed'
        state.loading = false
        state.error = action.payload?.message ?? 'Could not send the reset link'
        state.errors = action.payload?.errors ?? []
      })
      .addCase(resetPassword.pending, (state) => {
        Object.assign(state, initialState, { resetStatus: 'loading', loading: true })
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.resetStatus = 'succeeded'
        state.loading = false
        state.message = action.payload
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetStatus = 'failed'
        state.loading = false
        state.error = action.payload?.message ?? 'Could not reset the password'
        state.errors = action.payload?.errors ?? []
      })
  },
})

export const { resetForgotPasswordState } = forgotPasswordSlice.actions
export default forgotPasswordSlice.reducer
