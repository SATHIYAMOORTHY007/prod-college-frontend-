import { useState } from 'react'
import { Pencil, Plus, UserMinus, X } from 'lucide-react'
import {
  Button,
  ConfirmDialog,
  DataTable,
  PageHeader,
  Pagination,
  SearchInput,
  Select,
  StatusBadge,
} from '../../components/ui'
import { PERMISSIONS } from '../../constants/roles'
import { SECTION_OPTIONS } from '../../constants/semesters'
import { useListParams } from '../../hooks/useListParams'
import { usePermission } from '../../hooks/usePermission'
import { initials } from '../../utils/format'
import { useDepartmentOptions } from '../departments/useDepartments'
import { useCourseOptions, useSemesterOptions } from '../courses/useCourses'
import { useDeactivateStudent, useStudents } from './useStudents'
import StudentFormModal from './StudentFormModal'

function StudentsPage() {
  const can = usePermission()
  const { params, setParams, resetParams } = useListParams({ sortBy: 'rollNo', sortOrder: 'asc' })
  const { data, isLoading, isFetching, error, refetch } = useStudents(params)
  const { options: departmentOptions } = useDepartmentOptions()
  const { options: courseOptions } = useCourseOptions(params.department)
  const semesterOptions = useSemesterOptions(params.course)
  const deactivate = useDeactivateStudent()

  const [editing, setEditing] = useState(null) // null = closed, {} = new, student = edit
  const [toDeactivate, setToDeactivate] = useState(null)

  const hasFilters = Boolean(params.search || params.department || params.course || params.semester || params.section)
  const canEdit = can(PERMISSIONS.STUDENTS_UPDATE)
  const canDelete = can(PERMISSIONS.STUDENTS_DELETE)

  const columns = [
    {
      key: 'name',
      header: 'Student',
      sortable: true,
      render: (student) => (
        <div className="d-flex align-items-center gap-2">
          <span className="avatar">{initials(student.name)}</span>
          <div className="min-w-0">
            <div className="cell-primary text-truncate">{student.name}</div>
            <div className="cell-secondary text-truncate">{student.email}</div>
          </div>
        </div>
      ),
    },
    { key: 'rollNo', header: 'Roll no.', sortable: true, render: (s) => <span className="fw-semibold tabular">{s.rollNo}</span> },
    {
      key: 'course',
      header: 'Course',
      render: (s) => (
        <>
          <div>{s.course.code}</div>
          <div className="cell-secondary">{s.department.name}</div>
        </>
      ),
    },
    {
      key: 'semester',
      header: 'Semester',
      sortable: true,
      render: (s) => (
        <>
          <div>Semester {s.semester} · Sec {s.section}</div>
          <div className="cell-secondary">Batch {s.admissionYear}</div>
        </>
      ),
    },
    { key: 'status', header: 'Status', render: (s) => <StatusBadge status={s.status} /> },
  ]

  if (canEdit || canDelete) {
    columns.push({
      key: 'actions',
      header: '',
      className: 'text-end',
      render: (student) => (
        <div className="d-inline-flex gap-1">
          {canEdit && (
            <Button variant="ghost" size="sm" iconOnly icon={Pencil} onClick={() => setEditing(student)} aria-label={`Edit ${student.name}`} />
          )}
          {canDelete && student.status === 'ACTIVE' && (
            <Button variant="ghost" size="sm" iconOnly icon={UserMinus} onClick={() => setToDeactivate(student)} aria-label={`Deactivate ${student.name}`} />
          )}
        </div>
      ),
    })
  }

  return (
    <>
      <PageHeader
        title="Students"
        subtitle="Search, filter and manage enrolled students."
        actions={
          can(PERMISSIONS.STUDENTS_CREATE) && (
            <Button icon={Plus} onClick={() => setEditing({})}>
              Add student
            </Button>
          )
        }
      />

      <div className="surface">
        <div className="table-toolbar">
          <SearchInput
            className="search"
            value={params.search ?? ''}
            onSearch={(search) => setParams({ search })}
            placeholder="Search name, email or roll no."
          />
          <Select
            placeholder="All departments"
            options={departmentOptions}
            value={params.department ?? ''}
            onChange={(e) => setParams({ department: e.target.value, course: '' })}
          />
          <Select
            placeholder="All courses"
            options={courseOptions}
            value={params.course ?? ''}
            onChange={(e) => setParams({ course: e.target.value })}
          />
          <Select placeholder="All semesters" options={semesterOptions} value={params.semester ?? ''} onChange={(e) => setParams({ semester: e.target.value })} />
          <Select placeholder="All sections" options={SECTION_OPTIONS} value={params.section ?? ''} onChange={(e) => setParams({ section: e.target.value })} />
          {hasFilters && (
            <Button variant="ghost" size="sm" icon={X} onClick={resetParams}>
              Clear
            </Button>
          )}
          {isFetching && !isLoading && <span className="spinner-border spinner-border-sm text-primary ms-auto" aria-label="Updating" />}
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

      <StudentFormModal open={editing !== null} student={editing?.id ? editing : null} onClose={() => setEditing(null)} />

      <ConfirmDialog
        open={Boolean(toDeactivate)}
        title="Deactivate student?"
        message={`${toDeactivate?.name} (${toDeactivate?.rollNo}) will no longer be able to sign in. Their results and attendance are kept.`}
        confirmLabel="Deactivate"
        loading={deactivate.isPending}
        onCancel={() => setToDeactivate(null)}
        onConfirm={() => deactivate.mutate(toDeactivate.id, { onSuccess: () => setToDeactivate(null) })}
      />
    </>
  )
}

export default StudentsPage
