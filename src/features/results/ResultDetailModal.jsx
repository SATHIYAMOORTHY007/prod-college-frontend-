import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Check, Info, MessageSquareWarning, ShieldAlert } from 'lucide-react'
import { Button, LoadingState, Modal } from '../../components/ui'
import { ROLES } from '../../constants/roles'
import { usePermission } from '../../hooks/usePermission'
import { selectUserRole } from '../../store/selectors/authSelectors'
import { formatDateTime } from '../../utils/format'
import { RESULT_ACTIONS, STATUS_STEPS, availableActions, isSentBack, nextStep } from './resultWorkflow'
import { useResult, useResultTransition } from './useResults'
import ResultActions from './ResultActions'
import MarksTable from './MarksTable'

const YOUR_TURN = {
  DRAFT: 'Check the marks, then submit them to the principal.',
  SUBMITTED: 'Review the marks, then approve them or send them back to the examiner.',
  APPROVED: 'Publish the result to notify the student and make it visible to them.',
}

function Timeline({ result }) {
  const reached = STATUS_STEPS.indexOf(result.status)
  const details = {
    DRAFT: result.enteredBy && `by ${result.enteredBy.name}`,
    SUBMITTED: result.submittedAt && formatDateTime(result.submittedAt),
    APPROVED: result.approvedAt && `${result.approvedBy?.name ?? ''} · ${formatDateTime(result.approvedAt)}`,
    PUBLISHED: result.publishedAt && `${result.publishedBy?.name ?? ''} · ${formatDateTime(result.publishedAt)}`,
  }
  return (
    <ol className="list-unstyled d-flex gap-2 mb-3">
      {STATUS_STEPS.map((step, index) => (
        <li key={step} className="flex-fill min-w-0">
          <div className="progress-thin mb-1">
            <span style={{ width: index <= reached ? '100%' : 0, background: 'var(--cp-primary)' }} />
          </div>
          <div className={`small fw-semibold d-flex align-items-center gap-1 ${index <= reached ? '' : 'text-soft'}`}>
            {index <= reached && <Check size={13} />} {step.charAt(0) + step.slice(1).toLowerCase()}
          </div>
          <div className="text-soft text-truncate" style={{ fontSize: '0.7rem' }}>
            {index <= reached ? details[step] : ''}
          </div>
        </li>
      ))}
    </ol>
  )
}

/** One banner that answers "what happens now, and is it me?". */
function StatusBanner({ result, yourTurn, isAdmin }) {
  const sentBack = isSentBack(result)
  const tone = sentBack ? 'tone-amber' : 'tone-sky'
  const Icon = sentBack ? MessageSquareWarning : Info

  return (
    <div className={`alert ${tone} border-0 d-flex gap-2 small mb-3`} style={{ borderRadius: 10 }}>
      <Icon size={18} className="flex-shrink-0" />
      <div>
        {sentBack && (
          <div className="mb-1">
            <strong>Sent back by the principal:</strong> “{result.reviewNote}”
          </div>
        )}
        {yourTurn ? (
          <>
            <strong>Your turn:</strong> {YOUR_TURN[result.status]}
          </>
        ) : (
          <>
            <strong>Next step:</strong> {nextStep(result).message}
          </>
        )}
        {yourTurn && isAdmin && (
          <div className="mt-1 d-flex align-items-center gap-1 text-danger">
            <ShieldAlert size={14} /> Acting as administrator on behalf of the {result.status === 'DRAFT' ? 'examiner' : 'principal'} —
            recorded in the audit log.
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * The whole review happens in this one dialog: confirmations and the
 * send-back note replace the footer instead of opening another popup.
 */
function ResultDetailModal({ resultId, onClose }) {
  const { data: result, isLoading } = useResult(resultId)
  const transition = useResultTransition()
  const can = usePermission()
  const isAdmin = useSelector(selectUserRole) === ROLES.ADMIN

  const [pending, setPending] = useState(null) // action awaiting confirmation or a note
  const [note, setNote] = useState('')
  const [noteError, setNoteError] = useState(null)

  // Reset the footer whenever a different result is opened.
  useEffect(() => {
    setPending(null)
    setNote('')
    setNoteError(null)
  }, [resultId])

  const actions = result ? availableActions(result.status, can) : []
  const busy = transition.isPending

  const run = (action) => {
    if (action === 'reject' && !note.trim()) {
      setNoteError('Tell the examiner what needs to change')
      return
    }
    transition.mutate(
      { id: result.id, action, note: action === 'reject' ? note.trim() : undefined },
      {
        onSuccess: () => {
          setPending(null)
          setNote('')
          if (action === 'reject') onClose()
        },
      },
    )
  }

  const cancel = () => {
    setPending(null)
    setNoteError(null)
  }

  let footer = null
  let stacked = false
  if (result && pending === 'reject') {
    stacked = true
    footer = (
      <>
        <label htmlFor="send-back-note" className="form-label">
          What should the examiner fix? <span className="text-danger">*</span>
        </label>
        <textarea
          id="send-back-note"
          className={`form-control ${noteError ? 'is-invalid' : ''}`}
          rows={2}
          maxLength={500}
          autoFocus
          placeholder="e.g. CS502 marks look too high — please re-check the answer sheet."
          value={note}
          onChange={(event) => {
            setNote(event.target.value)
            setNoteError(null)
          }}
        />
        {noteError && <div className="invalid-feedback d-block">{noteError}</div>}
        <div className="d-flex justify-content-between align-items-center mt-2">
          <span className="small text-muted-cp">The examiner is notified and the marks unlock for correction.</span>
          <div className="d-flex gap-2">
            <Button variant="secondary" onClick={cancel} disabled={busy}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => run('reject')} loading={busy}>
              Send back
            </Button>
          </div>
        </div>
      </>
    )
  } else if (result && pending) {
    const { confirm } = RESULT_ACTIONS[pending]
    stacked = true
    footer = (
      <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
        <div className="small">
          <div className="fw-semibold">{confirm.title}</div>
          <div className="text-muted-cp">{confirm.message}</div>
        </div>
        <div className="d-flex gap-2 flex-shrink-0 ms-auto">
          <Button variant="secondary" onClick={cancel} disabled={busy}>
            Cancel
          </Button>
          <Button variant={RESULT_ACTIONS[pending].variant} onClick={() => run(pending)} loading={busy}>
            Yes, {confirm.cta.toLowerCase()}
          </Button>
        </div>
      </div>
    )
  } else if (result) {
    footer = (
      <>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <ResultActions result={result} size="md" onAction={setPending} />
      </>
    )
  }

  return (
    <Modal
      open={Boolean(resultId)}
      onClose={onClose}
      size="md"
      title={result?.exam?.name ?? 'Result'}
      description={result && `${result.student?.name} · ${result.course?.code} · Semester ${result.semester}`}
      footer={footer}
      footerClassName={stacked ? 'is-stacked' : ''}
      closeDisabled={busy}
    >
      {isLoading || !result ? (
        <LoadingState />
      ) : (
        <>
          <Timeline result={result} />
          <StatusBanner result={result} yourTurn={actions.length > 0} isAdmin={isAdmin} />

          <MarksTable result={result} />
        </>
      )}
    </Modal>
  )
}

export default ResultDetailModal
