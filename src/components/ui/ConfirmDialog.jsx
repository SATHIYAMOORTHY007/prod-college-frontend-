import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'

function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  loading = false,
  onConfirm,
  onCancel,
  children,
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      closeDisabled={loading}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="d-flex gap-3">
        <div className={`state-icon m-0 ${tone === 'danger' ? 'tone-rose' : 'tone-indigo'}`} style={{ width: 40, height: 40 }}>
          <AlertTriangle size={20} />
        </div>
        <div className="flex-grow-1">
          <p className="mb-0 text-muted-cp">{message}</p>
          {children}
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
