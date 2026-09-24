import { useEffect, useState } from 'react'
import { Button, Input, Modal } from '../../components/ui'

/** Collects the mandatory note when a principal sends results back. */
function RejectNoteModal({ open, count = 1, loading, onCancel, onConfirm }) {
  const [note, setNote] = useState('')
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (open) {
      setNote('')
      setTouched(false)
    }
  }, [open])

  const error = touched && !note.trim() ? 'Tell the examiner what needs to change' : undefined

  return (
    <Modal
      open={open}
      onClose={onCancel}
      size="sm"
      title={count > 1 ? `Send ${count} results back` : 'Send result back'}
      description="The examiner will be notified and the marks unlocked for correction."
      closeDisabled={loading}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={loading}
            onClick={() => {
              setTouched(true)
              if (note.trim()) onConfirm(note.trim())
            }}
          >
            Send back
          </Button>
        </>
      }
    >
      <Input as="textarea" rows={4} label="Note for the examiner" required maxLength={500} value={note} error={error} onChange={(e) => setNote(e.target.value)} />
    </Modal>
  )
}

export default RejectNoteModal
