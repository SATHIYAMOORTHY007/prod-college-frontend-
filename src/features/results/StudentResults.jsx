import { ClipboardCheck } from 'lucide-react'
import { EmptyState, ErrorState, LoadingState, StatusBadge } from '../../components/ui'
import { formatDate, formatPercent } from '../../utils/format'
import MarksTable from './MarksTable'
import { useResults } from './useResults'

/** Student view: the API only ever returns this student's PUBLISHED results. */
function StudentResults() {
  const { data, isLoading, error, refetch } = useResults({ limit: 50, sortBy: 'updatedAt', sortOrder: 'desc' })

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (!data.items.length) {
    return (
      <div className="surface">
        <EmptyState icon={ClipboardCheck} title="No published results yet" message="Results appear here once the principal publishes them." />
      </div>
    )
  }

  return (
    <div className="row g-3">
      {data.items.map((result) => (
        <div key={result.id} className="col-xl-8">
          <div className="surface h-100">
            <div className="surface-header">
              <div>
                <h3 className="surface-title">{result.exam.name}</h3>
                <div className="small text-muted-cp">
                  Semester {result.semester} · published {formatDate(result.publishedAt)} · {result.totalScore} out of {result.totalMaxMarks} ({formatPercent(result.percentage)})
                </div>
              </div>
              <StatusBadge status={result.passed ? 'PASS' : 'FAIL'} label={result.passed ? 'Passed' : 'Failed'} />
            </div>
            <div className="surface-body pt-2">
              <MarksTable result={result} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StudentResults
