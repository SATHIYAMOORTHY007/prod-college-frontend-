/**
 * Redux actions must be serialisable, so thunks reject with a plain
 * object instead of the ApiError instance.
 */
export function serializeError(error) {
  return {
    message: error?.message || 'Something went wrong',
    status: error?.status ?? 0,
    code: error?.code || 'UNKNOWN_ERROR',
    errors: error?.errors || [],
  }
}

/** Copies backend field errors ({ field, message }) onto a react-hook-form form. */
export function applyServerFieldErrors(error, setError) {
  let applied = false
  for (const { field, message } of error?.errors || []) {
    if (field) {
      setError(field, { type: 'server', message })
      applied = true
    }
  }
  return applied
}
