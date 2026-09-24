import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

/**
 * Accessible modal: rendered in a portal, closes on Escape / backdrop
 * click, locks body scroll and moves focus into the dialog.
 */
function Modal({ open, onClose, title, description, size = 'md', footer, footerClassName = '', children, closeDisabled = false }) {
  const titleId = useId()
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const previouslyFocused = document.activeElement

    const focusable = dialogRef.current?.querySelector('input, select, textarea, button:not([data-close])')
    ;(focusable || dialogRef.current)?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !closeDisabled) onClose()
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [open, onClose, closeDisabled])

  if (!open) return null

  return createPortal(
    <div
      className="cp-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !closeDisabled) onClose()
      }}
    >
      <div ref={dialogRef} className={`cp-modal cp-modal-${size}`} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <div className="cp-modal-header">
          <div>
            <h2 id={titleId} className="cp-modal-title">
              {title}
            </h2>
            {description && <p className="cp-modal-description">{description}</p>}
          </div>
          <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} disabled={closeDisabled} aria-label="Close" data-close>
            <X size={18} />
          </button>
        </div>
        <div className="cp-modal-body">{children}</div>
        {footer && <div className={`cp-modal-footer ${footerClassName}`}>{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

export default Modal
