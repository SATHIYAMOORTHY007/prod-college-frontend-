import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Layers, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button, ConfirmDialog, DataTable, Input, Modal, PageHeader, Pagination, SearchInput, Select, StatusBadge } from '../../components/ui'
import { PERMISSIONS } from '../../constants/roles'
import { useListParams } from '../../hooks/useListParams'
import { usePermission } from '../../hooks/usePermission'
import { useDepartmentOptions } from '../departments/useDepartments'
import { useCourses, useDeleteCourse, useSaveCourse } from './useCourses'
import SubjectsModal from './SubjectsModal'

const courseSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(150),
  code: z.string().trim().regex(/^[A-Za-z0-9-]{2,20}$/, 'Code must be 2–20 letters, digits or dashes'),
  department: z.string().regex(/^[a-f\d]{24}$/i, 'Select a department'),
  totalSemesters: z.coerce.number().int().min(1).max(8),
  isActive: z.boolean(),
})

function CourseFormModal({ course, onClose }) {
  const open = course !== null
  const save = useSaveCourse()
  const { options: departmentOptions } = useDepartmentOptions()
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(courseSchema) })

  useEffect(() => {
    if (open) {
      reset({
        name: course?.name ?? '',
        code: course?.code ?? '',
        department: course?.department?.id ?? '',
        totalSemesters: String(course?.totalSemesters ?? 8),
        isActive: course?.isActive ?? true,
      })
    }
  }, [open, course, reset])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={course?.id ? 'Edit course' : 'Add course'}
      closeDisabled={save.isPending}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="course-form" loading={save.isPending}>Save</Button>
        </>
      }
    >
      <form
        id="course-form"
        className="row g-3"
        noValidate
        onSubmit={handleSubmit((values) => save.mutate({ id: course?.id, ...values, code: values.code.toUpperCase() }, { onSuccess: onClose }))}
      >
        <Input containerClassName="col-12" label="Course name" required error={errors.name?.message} {...register('name')} />
        <Input containerClassName="col-md-6" label="Code" required placeholder="BE-CSE" error={errors.code?.message} {...register('code')} />
        <Input containerClassName="col-md-6" label="Number of semesters" inputMode="numeric" required hint="e.g. 8 for a 4-year B.E., 4 for an M.E." error={errors.totalSemesters?.message} {...register('totalSemesters')} />
        <Select containerClassName="col-12" label="Department" required placeholder="Select a department" options={departmentOptions} error={errors.department?.message} {...register('department')} />
        <div className="col-12 form-check form-switch ms-2">
          <input id="course-active" type="checkbox" className="form-check-input" {...register('isActive')} />
          <label htmlFor="course-active" className="form-check-label">Accepting students (active)</label>
        </div>
      </form>
    </Modal>
  )
}

function CoursesPage() {
  const can = usePermission()
  const canManage = can(PERMISSIONS.ACADEMICS_MANAGE)
  const { params, setParams } = useListParams({ sortBy: 'code', sortOrder: 'asc' })
  const { data, isLoading, error, refetch } = useCourses(params)
  const { options: departmentOptions } = useDepartmentOptions()
  const remove = useDeleteCourse()
  const [editing, setEditing] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [subjectsFor, setSubjectsFor] = useState(null)

  const columns = [
    { key: 'code', header: 'Code', sortable: true, render: (c) => <span className="fw-semibold">{c.code}</span> },
    { key: 'name', header: 'Course', sortable: true, render: (c) => <span className="cell-primary">{c.name}</span> },
    { key: 'department', header: 'Department', render: (c) => c.department?.name },
    {
      key: 'totalSemesters',
      header: 'Duration',
      render: (c) => (
        <span className="text-nowrap">
          {c.totalSemesters} semesters <span className="text-soft">· {c.totalSemesters / 2} yrs</span>
        </span>
      ),
    },
    { key: 'isActive', header: 'Status', render: (c) => <StatusBadge status={c.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-end text-nowrap',
      render: (course) => (
        <div className="d-inline-flex gap-1">
          <Button variant="secondary" size="sm" icon={Layers} onClick={() => setSubjectsFor(course)}>
            Subjects
          </Button>
          {canManage && (
            <>
              <Button variant="ghost" size="sm" iconOnly icon={Pencil} onClick={() => setEditing(course)} aria-label={`Edit ${course.name}`} />
              <Button variant="ghost" size="sm" iconOnly icon={Trash2} onClick={() => setToDelete(course)} aria-label={`Delete ${course.name}`} />
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Courses & subjects"
        subtitle="Programmes offered and the subjects taught each semester."
        actions={canManage && <Button icon={Plus} onClick={() => setEditing({})}>Add course</Button>}
      />
      <div className="surface">
        <div className="table-toolbar">
          <SearchInput className="search" value={params.search ?? ''} onSearch={(search) => setParams({ search })} placeholder="Search course name or code" />
          <Select placeholder="All departments" options={departmentOptions} value={params.department ?? ''} onChange={(e) => setParams({ department: e.target.value })} />
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

      <CourseFormModal course={editing} onClose={() => setEditing(null)} />
      <SubjectsModal course={subjectsFor} canManage={canManage} onClose={() => setSubjectsFor(null)} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete course?"
        message={`${toDelete?.code} will be deleted with its subjects. Courses with students or exams cannot be deleted — mark them inactive instead.`}
        confirmLabel="Delete"
        loading={remove.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => remove.mutate(toDelete.id, { onSettled: () => setToDelete(null) })}
      />
    </>
  )
}

export default CoursesPage
