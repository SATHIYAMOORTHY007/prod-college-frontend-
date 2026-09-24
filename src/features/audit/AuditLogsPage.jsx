import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { DataTable, Input, PageHeader, Pagination, Select, StatusBadge } from '../../components/ui'
import { ROLE_LABELS } from '../../constants/roles'
import { useListParams } from '../../hooks/useListParams'
import { auditApi } from '../../services/auditApi'
import { formatDateTime } from '../../utils/format'

const ACTION_GROUPS = {
  Results: ['MARKS_ENTERED', 'MARKS_UPDATED', 'RESULT_SUBMITTED', 'RESULT_APPROVED', 'RESULT_REJECTED', 'RESULT_PUBLISHED'],
  Students: ['STUDENT_CREATED', 'STUDENT_UPDATED', 'STUDENT_DELETED'],
  Users: ['USER_LOGIN', 'USER_CREATED', 'USER_UPDATED', 'USER_ROLE_CHANGED', 'USER_DEACTIVATED', 'PASSWORD_RESET'],
  Academics: ['DEPARTMENT_CREATED', 'COURSE_CREATED', 'COURSE_UPDATED', 'SUBJECT_CREATED', 'EXAM_CREATED', 'EXAM_UPDATED', 'EXAM_DELETED'],
  Attendance: ['ATTENDANCE_MARKED'],
}
const ACTION_OPTIONS = Object.values(ACTION_GROUPS)
  .flat()
  .map((action) => ({ value: action, label: action.replaceAll('_', ' ').toLowerCase() }))
const ENTITY_OPTIONS = ['Result', 'Student', 'User', 'Exam', 'Course', 'Subject', 'Department', 'Attendance'].map((e) => ({ value: e, label: e }))

const ACTION_TONE = (action) =>
  action.endsWith('DELETED') || action.endsWith('REJECTED') || action.endsWith('DEACTIVATED')
    ? 'tone-rose'
    : action.endsWith('PUBLISHED') || action.endsWith('APPROVED')
      ? 'tone-green'
      : action.endsWith('CREATED')
        ? 'tone-indigo'
        : 'tone-slate'

/** Compact one-line summary of the metadata stored with each entry. */
function describeMetadata(metadata = {}) {
  const summary = summarize(metadata)
  return metadata.adminOverride ? `${summary} · ⚠ admin override` : summary
}

function summarize(metadata) {
  if (metadata.from && metadata.to && typeof metadata.from === 'string') return `${metadata.from} → ${metadata.to}${metadata.note ? ` — “${metadata.note}”` : ''}`
  if (metadata.changes) return `Changed: ${Object.keys(metadata.changes).join(', ')}`
  if (metadata.before && metadata.after) return 'Marks corrected'
  return Object.entries(metadata)
    .filter(([key, value]) => typeof value !== 'object' && key !== 'adminOverride')
    .slice(0, 3)
    .map(([key, value]) => `${key}: ${value}`)
    .join(' · ')
}

function AuditLogsPage() {
  const { params, setParams } = useListParams()
  const apiParams = {
    ...params,
    from: params.from ? new Date(`${params.from}T00:00:00`).toISOString() : undefined,
    to: params.to ? new Date(`${params.to}T23:59:59`).toISOString() : undefined,
  }
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['audit-logs', apiParams],
    queryFn: () => auditApi.list(apiParams),
    placeholderData: keepPreviousData,
  })

  return (
    <>
      <PageHeader title="Audit logs" subtitle="An append-only record of who changed what, and when." />
      <div className="surface">
        <div className="table-toolbar">
          <Select placeholder="All actions" options={ACTION_OPTIONS} value={params.action ?? ''} onChange={(e) => setParams({ action: e.target.value })} className="text-capitalize" />
          <Select placeholder="All entities" options={ENTITY_OPTIONS} value={params.entity ?? ''} onChange={(e) => setParams({ entity: e.target.value })} />
          <Input type="date" aria-label="From date" value={params.from ?? ''} onChange={(e) => setParams({ from: e.target.value })} />
          <Input type="date" aria-label="To date" value={params.to ?? ''} onChange={(e) => setParams({ to: e.target.value })} />
        </div>
        <DataTable
          columns={[
            { key: 'timestamp', header: 'When', render: (log) => <span className="text-nowrap">{formatDateTime(log.timestamp)}</span> },
            {
              key: 'actor',
              header: 'Actor',
              render: (log) => (
                <>
                  <div className="cell-primary">{log.actor?.name ?? 'System'}</div>
                  <div className="cell-secondary">{ROLE_LABELS[log.actorRole] ?? log.actorRole}</div>
                </>
              ),
            },
            {
              key: 'action',
              header: 'Action',
              render: (log) => <span className={`status-badge no-dot ${ACTION_TONE(log.action)}`}>{log.action.replaceAll('_', ' ')}</span>,
            },
            { key: 'entity', header: 'Entity', render: (log) => <StatusBadge status="INACTIVE" label={log.entity} dot={false} /> },
            { key: 'metadata', header: 'Details', render: (log) => <span className="small text-muted-cp">{describeMetadata(log.metadata)}</span> },
            { key: 'requestId', header: 'Request', render: (log) => <code className="small text-soft">{log.requestId?.slice(0, 8)}</code> },
          ]}
          rows={data?.items}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
        />
        <Pagination pagination={data?.pagination} onPageChange={(page) => setParams({ page })} />
      </div>
    </>
  )
}

export default AuditLogsPage
