import { memo, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button, ConfirmDialog, EmptyState, ErrorState, LoadingState, PageHeader, StatusBadge } from '../../components/ui'
import { ROUTES } from '../../constants/routes'
import { formatDate, formatPercent } from '../../utils/format'
import { useBulkResultTransition, useResultTransition, useSaveMarks } from '../results/useResults'
import { RESULT_ACTIONS, isSentBack, nextStep } from '../results/resultWorkflow'
import { useExamRoster } from './useExams'

/** Client-side check mirroring the server rules; the server re-validates everything. */
function validateScores(subjects, scores) {
  for (const subject of subjects) {
    const raw = scores[subject.id]
    if (raw === '' || raw === undefined) return `Enter marks for ${subject.code}`
    const value = Number(raw)
    if (!Number.isFinite(value) || value < 0 || value > subject.maxMarks) {
      return `${subject.code}: marks must be between 0 and ${subject.maxMarks}`
    }
  }
  return null
}

/**
 * One student's row. Its inputs are local state, so typing re-renders
 * only this row, not the whole class list.
 */
const MarksRow = memo(function MarksRow({ exam, student, onRequestSubmit }) {
  const { result } = student
  const initial = useMemo(
    () => Object.fromEntries(exam.subjects.map((s) => [s.id, result?.marks.find((m) => m.subject === s.id)?.score ?? ''])),
    [exam.subjects, result],
  )
  const [scores, setScores] = useState(initial)
  const saveMarks = useSaveMarks()

  const editable = !result || result.status === 'DRAFT'
  const dirty = exam.subjects.some((s) => String(scores[s.id]) !== String(initial[s.id]))
  const total = exam.subjects.reduce((sum, s) => sum + (Number(scores[s.id]) || 0), 0)
  const max = exam.subjects.reduce((sum, s) => sum + s.maxMarks, 0)

  const save = () => {
    const problem = validateScores(exam.subjects, scores)
    if (problem) return toast.error(`${student.rollNo}: ${problem}`)
    saveMarks.mutate(
      {
        resultId: result?.id,
        exam: exam.id,
        student: student.id,
        marks: exam.subjects.map((s) => ({ subject: s.id, score: Number(scores[s.id]) })),
      },
      { onSuccess: () => toast.success(`Saved marks for ${student.rollNo}`) },
    )
  }

  return (
    <tr>
      <td>
        <div className="cell-primary tabular">{student.rollNo}</div>
        <div className="cell-secondary">{student.name}</div>
      </td>
      {exam.subjects.map((subject) => (
        <td key={subject.id} className="text-center">
          <input
            type="number"
            min={0}
            max={subject.maxMarks}
            inputMode="numeric"
            className={`form-control form-control-sm marks-input mx-auto ${
              scores[subject.id] !== '' && Number(scores[subject.id]) < subject.passMarks ? 'text-danger fw-semibold' : ''
            }`}
            value={scores[subject.id]}
            disabled={!editable}
            onChange={(event) => setScores((current) => ({ ...current, [subject.id]: event.target.value }))}
            aria-label={`${subject.code} marks for ${student.rollNo}`}
          />
        </td>
      ))}
      <td className="text-center tabular">
        <div className="fw-semibold">
          {total}/{max}
        </div>
        <div className="cell-secondary">{result ? formatPercent(result.percentage) : '—'}</div>
      </td>
      <td style={{ maxWidth: 220 }}>
        {!result ? (
          <StatusBadge status="DRAFT" label="Not entered" />
        ) : isSentBack(result) ? (
          <>
            <StatusBadge status="SENT_BACK" label="Sent back" />
            <div className="small text-danger mt-1" title={result.reviewNote}>
              “{result.reviewNote}”
            </div>
          </>
        ) : (
          <StatusBadge status={result.status} />
        )}
      </td>
      <td className="text-end text-nowrap">
        {editable ? (
          <div className="d-inline-flex gap-1">
            <Button size="sm" variant="secondary" icon={Save} onClick={save} loading={saveMarks.isPending} disabled={!dirty && Boolean(result)}>
              {result ? 'Save' : 'Save draft'}
            </Button>
            {result && (
              <Button
                size="sm"
                icon={Send}
                onClick={() => onRequestSubmit(student)}
                disabled={dirty}
                title={dirty ? 'Save your changes before submitting' : 'Send to the principal for approval'}
              >
                Submit
              </Button>
            )}
          </div>
        ) : (
          <span className="small text-muted-cp" title="Submitted marks are locked unless the principal sends them back.">
            Locked · {nextStep(result).label}
          </span>
        )}
      </td>
    </tr>
  )
})

function ExamMarksPage() {
  const { examId } = useParams()
  const { data, isLoading, error, refetch } = useExamRoster(examId)
  const bulk = useBulkResultTransition()
  const transition = useResultTransition()
  const [confirmSubmitAll, setConfirmSubmitAll] = useState(false)
  const [submitting, setSubmitting] = useState(null) // student whose result is being submitted

  if (isLoading) return <LoadingState label="Loading class list…" />
  if (error) return <ErrorState error={error} onRetry={refetch} />

  const { exam, students } = data
  const drafts = students.filter((s) => s.result?.status === 'DRAFT')
  const sentBack = students.filter((s) => isSentBack(s.result))
  const entered = students.filter((s) => s.result).length
  const notStarted = new Date(exam.startDate) > new Date()

  return (
    <>
      <nav aria-label="Breadcrumb" className="small mb-2 d-flex align-items-center gap-1">
        <Link to={ROUTES.EXAMS} className="fw-semibold text-decoration-none d-inline-flex align-items-center gap-1">
          <ArrowLeft size={15} /> My exams
        </Link>
        <span className="text-soft">/ Marks entry</span>
      </nav>
      <PageHeader
        title={exam.name}
        subtitle={`${exam.course.code} · Semester ${exam.semester} · ${formatDate(exam.startDate)} – ${formatDate(exam.endDate)}`}
        actions={
          drafts.length > 0 && (
            <Button icon={Send} onClick={() => setConfirmSubmitAll(true)}>
              Submit {drafts.length} draft{drafts.length > 1 ? 's' : ''}
            </Button>
          )
        }
      />

      {sentBack.length > 0 && (
        <div className="alert tone-rose border-0 mb-3" style={{ borderRadius: 12 }}>
          <strong>{sentBack.length} result{sentBack.length > 1 ? 's were' : ' was'} sent back by the principal.</strong> Read the note in the Status column, correct the marks, save, then submit again.
        </div>
      )}

      <div className="surface mb-3">
        <div className="surface-body d-flex flex-wrap gap-4 align-items-center">
          <div>
            <div className="small text-muted-cp">Marks entered</div>
            <div className="fw-semibold">
              {entered} of {students.length} students
            </div>
          </div>
          <div className="flex-grow-1" style={{ maxWidth: 360 }}>
            <div className="progress-thin">
              <span style={{ width: `${students.length ? (entered / students.length) * 100 : 0}%`, background: 'var(--cp-primary)' }} />
            </div>
          </div>
          <div className="small text-muted-cp">
            <strong>1.</strong> Enter marks and <strong>Save draft</strong> · <strong>2.</strong> <strong>Submit</strong> to the principal · Submitted marks stay locked unless the principal sends them back.
          </div>
        </div>
      </div>

      <div className="surface">
        {notStarted ? (
          <EmptyState title="This exam hasn’t started yet" message="Marks can be entered once the exam begins." />
        ) : students.length === 0 ? (
          <EmptyState title="No students enrolled" message="No active students in this course and semester." />
        ) : (
          <div className="table-responsive">
            <table className="table data-table align-middle">
              <thead>
                <tr>
                  <th>Student</th>
                  {exam.subjects.map((subject) => (
                    <th key={subject.id} className="text-center" title={subject.name}>
                      {subject.code}
                      <div className="text-soft" style={{ textTransform: 'none', letterSpacing: 0 }}>
                        out of {subject.maxMarks} · pass {subject.passMarks}
                      </div>
                    </th>
                  ))}
                  <th className="text-center">Total</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <MarksRow key={`${student.id}-${student.result?.status ?? 'new'}`} exam={exam} student={student} onRequestSubmit={setSubmitting} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(submitting)}
        tone="primary"
        title={`Submit marks for ${submitting?.rollNo ?? ''}?`}
        message={RESULT_ACTIONS.submit.confirm.message}
        confirmLabel="Submit"
        loading={transition.isPending}
        onCancel={() => setSubmitting(null)}
        onConfirm={() => transition.mutate({ id: submitting.result.id, action: 'submit' }, { onSettled: () => setSubmitting(null) })}
      />
      <ConfirmDialog
        open={confirmSubmitAll}
        tone="primary"
        title="Submit all drafts?"
        message={`${drafts.length} result${drafts.length > 1 ? 's' : ''} will be sent to the principal for approval and locked for editing.`}
        confirmLabel="Submit all"
        loading={bulk.isPending}
        onCancel={() => setConfirmSubmitAll(false)}
        onConfirm={() =>
          bulk.mutate({ action: 'submit', ids: drafts.map((s) => s.result.id) }, { onSettled: () => setConfirmSubmitAll(false) })
        }
      />
    </>
  )
}

export default ExamMarksPage
