import { forwardRef } from 'react'

/**
 * @param {{ variant?: 'primary'|'secondary'|'ghost'|'danger'|'success', size?: 'sm'|'md',
 *   loading?: boolean, icon?: import('react').ComponentType, iconOnly?: boolean }} props
 */
const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, icon: Icon, iconOnly = false, className = '', children, disabled, type = 'button', ...rest },
  ref,
) {
  const classes = ['btn', `btn-${variant}`, size === 'sm' && 'btn-sm', iconOnly && 'btn-icon', className]
    .filter(Boolean)
    .join(' ')

  return (
    <button ref={ref} type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading ? (
        <span className="spinner-border spinner-border-sm" aria-hidden="true" />
      ) : (
        Icon && <Icon size={size === 'sm' ? 15 : 17} aria-hidden="true" />
      )}
      {children}
    </button>
  )
})

export default Button
