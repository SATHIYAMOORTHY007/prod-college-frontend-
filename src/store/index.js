import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import forgotPasswordReducer from './slices/forgotPasswordSlice'
import uiReducer from './slices/uiSlice'
import { writePreference } from '../utils/storage'

export const rootReducer = {
  auth: authReducer,
  forgotPassword: forgotPasswordReducer,
  ui: uiReducer,
}

/** Factory so tests can create an isolated store with preloaded state. */
export function setupStore(preloadedState) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    devTools: import.meta.env.DEV,
  })
}

export const store = setupStore()

// Persist the one UI preference worth keeping between visits.
let lastCollapsed = store.getState().ui.sidebarCollapsed
store.subscribe(() => {
  const { sidebarCollapsed } = store.getState().ui
  if (sidebarCollapsed !== lastCollapsed) {
    lastCollapsed = sidebarCollapsed
    writePreference('sidebarCollapsed', sidebarCollapsed)
  }
})
