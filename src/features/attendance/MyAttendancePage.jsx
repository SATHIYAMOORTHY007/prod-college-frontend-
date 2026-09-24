import { AlertTriangle, CalendarCheck, CalendarX2, Percent } from 'lucide-react'
import { DataTable, ErrorState, KpiCard, LoadingState, PageHeader, Pagination, Select, StatusBadge } from '../../components/ui'
import { useListParams } from '../../hooks/useListParams'
import { formatDate, formatPercent } from '../../utils/format'
import { useAttendanceRecords, useAttendanceSummary } from './useAttendance'

const THRESHOLD = 75

function barColor(percentage) {
  if (percentage < THRESHOLD) return 'var(--cp-danger)'
  if (percentage < 85) return '#d97706'
  return 'var(--cp-success)'
}

function MyAttendancePage() {
  const { params, setParams } = useListParams({ sortBy: 'date', sortOrder: 'desc' })
  const summary = useAttendanceSummary()
  const records = useAttendanceRecords(params)

  if (summary.isLoading) return <LoadingState />
  if (summary.error) return <ErrorState error={summary.error} onRetry={summary.refetch} />

  const { overall, subjects } = summary.data
  const lowSubjects = subjects.filter((s) => s.percentage < THRESHOLD)

  return (
    <>
      <PageHeader title="My attendance" subtitle={`You need at least ${THRESHOLD}% in every subject to sit the end-semester exam.`} />

      <div className="kpi-grid">
        <KpiCard label="Overall attendance" value={formatPercent(overall.percentage)} icon={Percent} tone={overall.percentage < THRESHOLD ? 'rose' : 'green'} />
        <KpiCard label="Classes attended" value={overall.present} icon={CalendarCheck} tone="indigo" hint={`of ${overall.total} classes`} />
        <KpiCard label="Classes missed" value={overall.absent} icon={CalendarX2} tone="amber" />
      </div>

      {lowSubjects.length > 0 && (
        <div className="alert tone-rose border-0 d-flex gap-2 align-items-center" style={{ borderRadius: 12 }}>
          <AlertTriangle size={18} />
          Below {THRESHOLD}% in {lowSubjects.map((s) => s.subjectCode).join(', ')}.
        </div>
      )}

      <div className="row g-3">
        <div className="col-lg-5">
          <div className="surface h-100">
            <div className="surface-header">
              <h3 className="surface-title">By subject</h3>
            </div>
            <ul className="list-unstyled mb-0">
              {subjects.map((subject) => (
                <li key={subject.subjectId} className="px-3 py-3 border-bottom">
                  <div className="d-flex justify-content-between mb-1">
                    <span>
                      <span className="fw-semibold">{subject.subjectCode}</span>{' '}
                      <span className="text-muted-cp small">{subject.subjectName}</span>
                    </span>
                    <span className="fw-semibold tabular">{formatPercent(subject.percentage)}</span>
                  </div>
                  <div className="progress-thin">
                    <span style={{ width: `${subject.percentage}%`, background: barColor(subject.percentage) }} />
                  </div>
                  <div className="small text-soft mt-1">
                    {subject.present} of {subject.total} classes
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="col-lg-7">
          <div className="surface">
            <div className="table-toolbar">
              <h3 className="surface-title me-auto">Daily record</h3>
              <Select
                placeholder="All subjects"
                options={subjects.map((s) => ({ value: s.subjectId, label: s.subjectCode }))}
                value={params.subject ?? ''}
                onChange={(e) => setParams({ subject: e.target.value })}
              />
              <Select
                placeholder="Any status"
                options={[
                  { value: 'PRESENT', label: 'Present' },
                  { value: 'ABSENT', label: 'Absent' },
                ]}
                value={params.status ?? ''}
                onChange={(e) => setParams({ status: e.target.value })}
              />
            </div>
            <DataTable
              columns={[
                { key: 'date', header: 'Date', render: (r) => formatDate(r.date) },
                { key: 'subject', header: 'Subject', render: (r) => `${r.subject?.code} · ${r.subject?.name}` },
                { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
              ]}
              rows={records.data?.items}
              isLoading={records.isLoading}
              error={records.error}
            />
            <Pagination pagination={records.data?.pagination} onPageChange={(page) => setParams({ page })} />
          </div>
        </div>
      </div>
    </>
  )
}

export default MyAttendancePage
