import { forwardRef, useId } from 'react'

/**
 * Labelled input with inline error. Works with react-hook-form's
 * register() because the ref is forwarded to the <input>.
 */
const Input = forwardRef(function Input(
  { label, error, hint, id, className = '', containerClassName = '', as = 'input', required, ...rest },
  ref,
) {
  const autoId = useId()
  const inputId = id || autoId
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
  const Component = as

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      <Component
        ref={ref}
        id={inputId}
        className={`form-control ${error ? 'is-invalid' : ''} ${className}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {error ? (
        <div id={`${inputId}-error`} className="invalid-feedback d-block">
          {error}
        </div>
      ) : (
        hint && (
          <div id={`${inputId}-hint`} className="form-hint">
            {hint}
          </div>
        )
      )}
    </div>
  )
})

export default Input
