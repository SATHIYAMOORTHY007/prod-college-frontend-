import { AlertCircle, Inbox } from 'lucide-react'
import Button from './Button'

export function LoadingState({ label = 'Loading…', rows = 0 }) {
  if (rows > 0) {
    return (
      <div className="p-3" aria-busy="true" aria-label={label}>
        {Array.from({ length: rows }, (_, index) => (
          <span key={index} className="skeleton my-3" style={{ width: `${90 - (index % 3) * 15}%` }} />
        ))}
      </div>
    )
  }
  return (
    <div className="state-block" role="status">
      <span className="spinner-border text-primary" aria-hidden="true" />
      <div className="mt-2">{label}</div>
    </div>
  )
}

export function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', message, action }) {
  return (
    <div className="state-block">
      <div className="state-icon tone-slate">
        <Icon size={24} />
      </div>
      <div className="state-title">{title}</div>
      {message && <p className="mb-0">{message}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}

export function ErrorState({ title = 'Something went wrong', error, onRetry }) {
  return (
    <div className="state-block" role="alert">
      <div className="state-icon tone-rose">
        <AlertCircle size={24} />
      </div>
      <div className="state-title">{title}</div>
      <p className="mb-0">{error?.message || 'Please try again.'}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
