import { forwardRef, useId } from 'react'

/**
 * @param {{ options: Array<{ value: string, label: string }>, placeholder?: string, label?: string, error?: string }} props
 */
const Select = forwardRef(function Select(
  { label, error, options = [], placeholder, id, className = '', containerClassName = '', required, ...rest },
  ref,
) {
  const autoId = useId()
  const selectId = id || autoId

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`form-select ${error ? 'is-invalid' : ''} ${className}`}
        aria-invalid={error ? 'true' : undefined}
        aria-label={label ? undefined : placeholder}
        {...rest}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  )
})

export default Select
