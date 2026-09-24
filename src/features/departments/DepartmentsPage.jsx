import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button, ConfirmDialog, EmptyState, ErrorState, Input, LoadingState, Modal, PageHeader } from '../../components/ui'
import { PERMISSIONS } from '../../constants/roles'
import { usePermission } from '../../hooks/usePermission'
import { useDeleteDepartment, useDepartments, useSaveDepartment } from './useDepartments'

const schema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  code: z.string().trim().regex(/^[A-Za-z]{2,10}$/, 'Code must be 2–10 letters'),
  description: z.string().trim().max(500),
})

function DepartmentFormModal({ department, onClose }) {
  const open = department !== null
  const save = useSaveDepartment()
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open) reset({ name: department?.name ?? '', code: department?.code ?? '', description: department?.description ?? '' })
  }, [open, department, reset])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={department?.id ? 'Edit department' : 'Add department'}
      closeDisabled={save.isPending}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="department-form" loading={save.isPending}>Save</Button>
        </>
      }
    >
      <form
        id="department-form"
        className="row g-3"
        noValidate
        onSubmit={handleSubmit((values) => save.mutate({ id: department?.id, ...values, code: values.code.toUpperCase() }, { onSuccess: onClose }))}
      >
        <Input containerClassName="col-md-8" label="Name" required error={errors.name?.message} {...register('name')} />
        <Input containerClassName="col-md-4" label="Code" required placeholder="CSE" error={errors.code?.message} {...register('code')} />
        <Input containerClassName="col-12" as="textarea" rows={3} label="Description" error={errors.description?.message} {...register('description')} />
      </form>
    </Modal>
  )
}

function DepartmentsPage() {
  const can = usePermission()
  const canManage = can(PERMISSIONS.ACADEMICS_MANAGE)
  const { data: departments, isLoading, error, refetch } = useDepartments()
  const remove = useDeleteDepartment()
  const [editing, setEditing] = useState(null)
  const [toDelete, setToDelete] = useState(null)

  return (
    <>
      <PageHeader
        title="Departments"
        subtitle="Academic departments and their size."
        actions={canManage && <Button icon={Plus} onClick={() => setEditing({})}>Add department</Button>}
      />

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !departments.length ? (
        <div className="surface"><EmptyState icon={Building2} title="No departments yet" /></div>
      ) : (
        <div className="row g-3">
          {departments.map((department) => (
            <div key={department.id} className="col-md-6 col-xl-4">
              <div className="surface h-100 d-flex flex-column">
                <div className="surface-body flex-grow-1">
                  <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                    <div className="kpi-icon tone-indigo"><Building2 size={20} /></div>
                    {canManage && (
                      <div className="d-flex gap-1">
                        <Button variant="ghost" size="sm" iconOnly icon={Pencil} onClick={() => setEditing(department)} aria-label={`Edit ${department.name}`} />
                        <Button variant="ghost" size="sm" iconOnly icon={Trash2} onClick={() => setToDelete(department)} aria-label={`Delete ${department.name}`} />
                      </div>
                    )}
                  </div>
                  <div className="small fw-semibold text-muted-cp">{department.code}</div>
                  <h3 className="h6 mb-1">{department.name}</h3>
                  <p className="small text-muted-cp mb-0">{department.description}</p>
                </div>
                <div className="d-flex border-top">
                  <div className="flex-fill p-3 text-center border-end">
                    <div className="kpi-value" style={{ fontSize: '1.25rem' }}>{department.courseCount}</div>
                    <div className="small text-muted-cp">Courses</div>
                  </div>
                  <div className="flex-fill p-3 text-center">
                    <div className="kpi-value" style={{ fontSize: '1.25rem' }}>{department.studentCount}</div>
                    <div className="small text-muted-cp">Students</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <DepartmentFormModal department={editing} onClose={() => setEditing(null)} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete department?"
        message={`${toDelete?.name} will be removed. Departments that still have courses cannot be deleted.`}
        confirmLabel="Delete"
        loading={remove.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => remove.mutate(toDelete.id, { onSettled: () => setToDelete(null) })}
      />
    </>
  )
}

export default DepartmentsPage
