import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ClipboardPen, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button, ConfirmDialog, DataTable, PageHeader, Pagination, SearchInput, Select, StatusBadge } from '../../components/ui'
import { PERMISSIONS, ROLES } from '../../constants/roles'
import { examMarksPath } from '../../constants/routes'
import { EXAM_TYPE_OPTIONS } from '../../constants/semesters'
import { useListParams } from '../../hooks/useListParams'
import { usePermission } from '../../hooks/usePermission'
import { selectUserRole } from '../../store/selectors/authSelectors'
import { formatDate } from '../../utils/format'
import { useCourseOptions, useSemesterOptions } from '../courses/useCourses'
import { useDeleteExam, useExams } from './useExams'
import ExamFormModal from './ExamFormModal'

function examTiming(exam) {
  const now = Date.now()
  if (new Date(exam.startDate).getTime() > now) return { label: 'Upcoming', status: 'UPCOMING' }
  if (new Date(exam.endDate).getTime() + 86400000 > now) return { label: 'In progress', status: 'IN_PROGRESS' }
  return { label: 'Completed', status: 'COMPLETED' }
}

function ExamsPage() {
  const role = useSelector(selectUserRole)
  const can = usePermission()
  const canManage = can(PERMISSIONS.EXAMS_MANAGE)
  const canEnterMarks = can(PERMISSIONS.RESULTS_CREATE)
  const isStaffView = role !== ROLES.STUDENT && role !== ROLES.EXAMINER

  const { params, setParams } = useListParams()
  const { data, isLoading, error, refetch } = useExams(params)
  const { options: courseOptions } = useCourseOptions()
  const semesterOptions = useSemesterOptions(params.course)
  const remove = useDeleteExam()
  const [editing, setEditing] = useState(null)
  const [toDelete, setToDelete] = useState(null)

  const columns = [
    {
      key: 'name',
      header: 'Exam',
      sortable: true,
      render: (exam) => (
        <>
          <div className="cell-primary">{exam.name}</div>
          <div className="cell-secondary">
            {exam.course?.code} · Semester {exam.semester}
          </div>
        </>
      ),
    },
    { key: 'type', header: 'Type', render: (exam) => <StatusBadge status={exam.type} dot={false} /> },
    {
      key: 'startDate',
      header: 'Dates',
      sortable: true,
      render: (exam) => (
        <span className="text-nowrap">
          {formatDate(exam.startDate)} – {formatDate(exam.endDate)}
        </span>
      ),
    },
    ...(role !== ROLES.EXAMINER ? [{ key: 'examiner', header: 'Examiner', render: (exam) => exam.examiner?.name }] : []),
    {
      key: 'timing',
      header: 'Status',
      render: (exam) => {
        const timing = examTiming(exam)
        return <StatusBadge status={timing.status} label={timing.label} />
      },
    },
  ]

  if (canManage || canEnterMarks) {
    columns.push({
      key: 'actions',
      header: '',
      className: 'text-end text-nowrap',
      render: (exam) => (
        <div className="d-inline-flex gap-1">
          {canEnterMarks &&
            (examTiming(exam).status === 'UPCOMING' ? (
              <span className="small text-muted-cp me-1" title="Marks can be entered once the exam starts">
                Marks open {formatDate(exam.startDate)}
              </span>
            ) : (
              <Link to={examMarksPath(exam.id)} className="btn btn-sm btn-primary">
                <ClipboardPen size={15} /> Enter marks
              </Link>
            ))}
          {canManage && (
            <>
              <Button variant="ghost" size="sm" iconOnly icon={Pencil} onClick={() => setEditing(exam)} aria-label={`Edit ${exam.name}`} />
              <Button variant="ghost" size="sm" iconOnly icon={Trash2} onClick={() => setToDelete(exam)} aria-label={`Delete ${exam.name}`} />
            </>
          )}
        </div>
      ),
    })
  }

  return (
    <>
      <PageHeader
        title={role === ROLES.EXAMINER || role === ROLES.STUDENT ? 'My exams' : 'Exams'}
        subtitle={
          role === ROLES.STUDENT
            ? 'Exams scheduled for your course and semester.'
            : role === ROLES.EXAMINER
              ? 'Exams you are assigned to. Enter marks once an exam has started.'
              : 'Schedule exams and assign examiners.'
        }
        actions={canManage && <Button icon={Plus} onClick={() => setEditing({})}>Schedule exam</Button>}
      />
      <div className="surface">
        <div className="table-toolbar">
          <SearchInput className="search" value={params.search ?? ''} onSearch={(search) => setParams({ search })} placeholder="Search exams" />
          {isStaffView && (
            <>
              <Select placeholder="All courses" options={courseOptions} value={params.course ?? ''} onChange={(e) => setParams({ course: e.target.value })} />
              <Select placeholder="All semesters" options={semesterOptions} value={params.semester ?? ''} onChange={(e) => setParams({ semester: e.target.value })} />
            </>
          )}
          <Select placeholder="All types" options={EXAM_TYPE_OPTIONS} value={params.type ?? ''} onChange={(e) => setParams({ type: e.target.value })} />
          <div className="form-check form-switch ms-1">
            <input
              id="upcoming-only"
              type="checkbox"
              className="form-check-input"
              checked={params.upcoming === 'true'}
              onChange={(e) => setParams({ upcoming: e.target.checked ? 'true' : '' })}
            />
            <label htmlFor="upcoming-only" className="form-check-label small">Upcoming only</label>
          </div>
        </div>
        <DataTable
          columns={columns}
          rows={data?.items}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          sort={{ sortBy: params.sortBy, sortOrder: params.sortOrder }}
          onSortChange={(sortBy, sortOrder) => setParams({ sortBy, sortOrder })}
        />
        <Pagination pagination={data?.pagination} onPageChange={(page) => setParams({ page })} />
      </div>

      <ExamFormModal exam={editing} onClose={() => setEditing(null)} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete exam?"
        message={`${toDelete?.name} will be removed. Exams that already have marks cannot be deleted.`}
        confirmLabel="Delete"
        loading={remove.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => remove.mutate(toDelete.id, { onSettled: () => setToDelete(null) })}
      />
    </>
  )
}

export default ExamsPage
