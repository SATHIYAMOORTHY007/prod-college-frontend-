import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { selectPermissionSet } from '../store/selectors/authSelectors'

/**
 * UI-level permission check, used only to hide controls the user cannot
 * use. Every action is still authorised by the backend.
 */
export function usePermission() {
  const permissions = useSelector(selectPermissionSet)
  return useCallback((permission) => permissions.has(permission), [permissions])
}
