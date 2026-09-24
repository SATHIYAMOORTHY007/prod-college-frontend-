import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Eye } from 'lucide-react'
import { Button, ConfirmDialog, DataTable, EmptyState, PageHeader, Pagination, Select, StatusBadge } from '../../components/ui'
import { PERMISSIONS, ROLES } from '../../constants/roles'
import { useListParams } from '../../hooks/useListParams'
import { usePermission } from '../../hooks/usePermission'
import { selectUserRole } from '../../store/selectors/authSelectors'
import { formatPercent } from '../../utils/format'
import { useCourseOptions, useSemesterOptions } from '../courses/useCourses'
import { useBulkResultTransition, useResults } from './useResults'
import ResultDetailModal from './ResultDetailModal'
import RejectNoteModal from './RejectNoteModal'
import StudentResults from './StudentResults'
import { RESULT_ACTIONS, availableActions, isSentBack, nextStep } from './resultWorkflow'

const STATUS_TABS = [
  { value: 'ALL', label: 'All' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Awaiting approval' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'PUBLISHED', label: 'Published' },
]

const WORKFLOW_GUIDE = [
  { step: 'Draft', who: 'Examiner', text: 'enters marks and submits' },
  { step: 'Submitted', who: 'Principal', text: 'approves or sends back' },
  { step: 'Approved', who: 'Principal', text: 'publishes the result' },
  { step: 'Published', who: 'Student', text: 'is notified and can view it' },
]

function WorkflowGuide() {
  return (
    <div className="surface mb-3">
      <div className="d-flex flex-wrap">
        {WORKFLOW_GUIDE.map((item, index) => (
          <div key={item.step} className="flex-fill px-3 py-2 d-flex align-items-center gap-2" style={{ minWidth: 200 }}>
            <span className="avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>{index + 1}</span>
            <div className="small">
              <div className="fw-semibold">{item.step}</div>
              <div className="text-muted-cp">
                <strong>{item.who}</strong> {item.text}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const SUBTITLES = {
  [ROLES.PRINCIPAL]: 'Review submitted marks, approve or send them back, then publish approved results to students.',
  [ROLES.EXAMINER]: 'Results for the exams assigned to you. Enter and submit marks from My Exams → Marks.',
  [ROLES.ADMIN]:
    'Every result in the college. You can submit, approve, send back or publish on behalf of an unavailable examiner or principal — each action is recorded as an admin override.',
}

function StaffResults() {
  const role = useSelector(selectUserRole)
  const can = usePermission()
  const isPrincipal = can(PERMISSIONS.RESULTS_APPROVE)

  const { params, setParams } = useListParams({ status: isPrincipal ? 'SUBMITTED' : 'ALL', sortBy: 'updatedAt', sortOrder: 'desc' })
  const apiParams = { ...params, status: params.status === 'ALL' ? undefined : params.status }
  const { data, isLoading, isFetching, error, refetch } = useResults(apiParams)
  const { options: courseOptions } = useCourseOptions()
  const semesterOptions = useSemesterOptions(params.course)
  const bulk = useBulkResultTransition()

  const [selected, setSelected] = useState(new Set())
  const [viewing, setViewing] = useState(null)
  const [rejecting, setRejecting] = useState(false)
  const [confirmBulk, setConfirmBulk] = useState(null) // 'approve' | 'publish'

  const changeParams = (updates) => {
    setSelected(new Set())
    setParams(updates)
  }

  const runBulk = (action, note) =>
    bulk.mutate(
      { action, ids: [...selected], note },
      {
        onSuccess: () => {
          setSelected(new Set())
          setRejecting(false)
          setConfirmBulk(null)
        },
      },
    )

  const bulkMode = params.status === 'SUBMITTED' ? 'review' : params.status === 'APPROVED' ? 'publish' : null
  const selectable = isPrincipal && Boolean(bulkMode)

  const columns = [
    {
      key: 'student',
      header: 'Student',
      render: (r) => (
        <>
          <div className="cell-primary">{r.student?.name}</div>
          <div className="cell-secondary">
            {r.course?.code} · Semester {r.semester}
          </div>
        </>
      ),
    },
    { key: 'exam', header: 'Exam', render: (r) => r.exam?.name },
    {
      key: 'percentage',
      header: 'Score',
      sortable: true,
      render: (r) => (
        <span className="tabular text-nowrap">
          <strong>{r.totalScore}</strong>/{r.totalMaxMarks} <span className="text-muted-cp">({formatPercent(r.percentage)})</span>
        </span>
      ),
    },
    { key: 'passed', header: 'Outcome', render: (r) => <StatusBadge status={r.passed ? 'PASS' : 'FAIL'} dot={false} /> },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (isSentBack(r) ? <StatusBadge status="SENT_BACK" label="Sent back" /> : <StatusBadge status={r.status} />),
    },
    {
      key: 'next',
      header: 'Next step',
      render: (r) => <span className={`small ${nextStep(r).owner ? '' : 'text-muted-cp'}`}>{nextStep(r).label}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-end',
      render: (r) => {
        const actionable = availableActions(r.status, can).length > 0
        return (
          <Button variant={actionable ? 'primary' : 'ghost'} size="sm" icon={Eye} onClick={() => setViewing(r.id)}>
            {actionable ? 'Review' : 'View'}
          </Button>
        )
      },
    },
  ]

  return (
    <>
      <PageHeader title={role === ROLES.PRINCIPAL ? 'Result approvals' : 'Results'} subtitle={SUBTITLES[role]} />
      <WorkflowGuide />

      <ul className="nav nav-pills gap-1 mb-3">
        {STATUS_TABS.map((tab) => (
          <li key={tab.value} className="nav-item">
            <button
              type="button"
              className={`btn btn-sm ${params.status === tab.value ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => changeParams({ status: tab.value })}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="surface">
        <div className="table-toolbar">
          <Select placeholder="All courses" options={courseOptions} value={params.course ?? ''} onChange={(e) => changeParams({ course: e.target.value })} />
          <Select placeholder="All semesters" options={semesterOptions} value={params.semester ?? ''} onChange={(e) => changeParams({ semester: e.target.value })} />
          {isFetching && !isLoading && <span className="spinner-border spinner-border-sm text-primary" aria-label="Updating" />}

          {selectable && (
            <div className="ms-auto d-flex align-items-center gap-2">
              {selected.size === 0 ? (
                <span className="small text-muted-cp">Tick results to {bulkMode === 'review' ? 'approve or send back' : 'publish'} them together.</span>
              ) : (
                <>
                  <span className="small text-muted-cp">{selected.size} selected</span>
                  {bulkMode === 'review' ? (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => setRejecting(true)} disabled={bulk.isPending}>
                        Send back
                      </Button>
                      <Button size="sm" variant="success" onClick={() => setConfirmBulk('approve')}>
                        Approve selected
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" onClick={() => setConfirmBulk('publish')}>
                      Publish selected
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <DataTable
          columns={columns}
          rows={data?.items}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          sort={{ sortBy: params.sortBy, sortOrder: params.sortOrder }}
          onSortChange={(sortBy, sortOrder) => changeParams({ sortBy, sortOrder })}
          selectable={selectable}
          selectedIds={selected}
          onSelectionChange={setSelected}
          empty={
            <EmptyState
              title={params.status === 'SUBMITTED' ? 'Nothing waiting for approval' : 'No results here'}
              message={
                params.status === 'SUBMITTED'
                  ? 'Results appear here when an examiner submits marks.'
                  : 'Try another status tab or clear the filters.'
              }
            />
          }
        />
        <Pagination pagination={data?.pagination} onPageChange={(page) => setParams({ page })} />
      </div>

      <ResultDetailModal resultId={viewing} onClose={() => setViewing(null)} />
      <RejectNoteModal open={rejecting} count={selected.size} loading={bulk.isPending} onCancel={() => setRejecting(false)} onConfirm={(note) => runBulk('reject', note)} />
      <ConfirmDialog
        open={Boolean(confirmBulk)}
        tone="primary"
        title={confirmBulk === 'publish' ? `Publish ${selected.size} result(s)?` : `Approve ${selected.size} result(s)?`}
        message={confirmBulk ? RESULT_ACTIONS[confirmBulk].confirm.message : ''}
        confirmLabel={confirmBulk === 'publish' ? 'Publish' : 'Approve'}
        loading={bulk.isPending}
        onCancel={() => setConfirmBulk(null)}
        onConfirm={() => runBulk(confirmBulk)}
      />
    </>
  )
}

function ResultsPage() {
  const role = useSelector(selectUserRole)
  if (role === ROLES.STUDENT) {
    return (
      <>
        <PageHeader title="My results" subtitle="Published results for your exams." />
        <StudentResults />
      </>
    )
  }
  return <StaffResults />
}

export default ResultsPage
