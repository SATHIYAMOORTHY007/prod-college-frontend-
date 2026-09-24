import { createSelector } from '@reduxjs/toolkit'

export const selectAuth = (state) => state.auth
export const selectCurrentUser = (state) => state.auth.user
export const selectUserRole = (state) => state.auth.user?.role ?? null
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectAuthInitialized = (state) => state.auth.initialized
export const selectAccessToken = (state) => state.auth.accessToken
export const selectAuthLoading = (state) => state.auth.loginStatus === 'loading'
export const selectAuthError = (state) => state.auth.error

const EMPTY = []
export const selectPermissions = (state) => state.auth.user?.permissions ?? EMPTY

/** Memoised Set so permission checks are O(1) and components do not re-render needlessly. */
export const selectPermissionSet = createSelector([selectPermissions], (permissions) => new Set(permissions))

export const selectHasPermission = (permission) => (state) => selectPermissionSet(state).has(permission)
