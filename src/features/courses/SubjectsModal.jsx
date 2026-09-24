import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'
import { Button, ConfirmDialog, DataTable, Input, Modal, Select } from '../../components/ui'
import { SEMESTER_OPTIONS } from '../../constants/semesters'
import { useDeleteSubject, useSaveSubject, useSubjects } from './useCourses'

const subjectSchema = z
  .object({
    code: z.string().trim().regex(/^[A-Za-z0-9-]{2,20}$/, 'Code must be 2–20 letters or digits'),
    name: z.string().trim().min(2, 'Name is required').max(150),
    semester: z.coerce.number().int().min(1, 'Select a semester').max(8),
    credits: z.coerce.number().int().min(1).max(10),
    maxMarks: z.coerce.number().int().min(1).max(200),
    passMarks: z.coerce.number().int().min(0).max(200),
  })
  .refine((data) => data.passMarks <= data.maxMarks, { message: 'Cannot exceed max marks', path: ['passMarks'] })

const DEFAULTS = { code: '', name: '', semester: '', credits: '4', maxMarks: '100', passMarks: '40' }

function SubjectsModal({ course, canManage, onClose }) {
  const { data: subjects, isLoading } = useSubjects(course?.id)
  const save = useSaveSubject(course?.id)
  const remove = useDeleteSubject(course?.id)
  const [toDelete, setToDelete] = useState(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(subjectSchema), defaultValues: DEFAULTS })

  const semesterOptions = SEMESTER_OPTIONS.filter((option) => Number(option.value) <= (course?.totalSemesters ?? 8))

  const columns = [
    { key: 'code', header: 'Code', render: (s) => <span className="fw-semibold">{s.code}</span> },
    { key: 'name', header: 'Subject' },
    { key: 'semester', header: 'Semester', render: (s) => `Semester ${s.semester}` },
    { key: 'credits', header: 'Credits' },
    { key: 'marks', header: 'Pass / Max', render: (s) => `${s.passMarks} / ${s.maxMarks}` },
  ]
  if (canManage) {
    columns.push({
      key: 'actions',
      header: '',
      className: 'text-end',
      render: (s) => <Button variant="ghost" size="sm" iconOnly icon={Trash2} onClick={() => setToDelete(s)} aria-label={`Delete ${s.name}`} />,
    })
  }

  return (
    <Modal open={Boolean(course)} onClose={onClose} size="lg" title={`Subjects — ${course?.code ?? ''}`} description={course && `${course.name} · Semesters 1–${course.totalSemesters}`}>
      {canManage && (
        <form
          className="row g-2 align-items-end mb-3 p-3 rounded-3"
          style={{ background: '#f8fafc' }}
          noValidate
          onSubmit={handleSubmit((values) => save.mutate({ ...values, code: values.code.toUpperCase() }, { onSuccess: () => reset(DEFAULTS) }))}
        >
          <Input containerClassName="col-md-2" label="Code" error={errors.code?.message} {...register('code')} />
          <Input containerClassName="col-md-4" label="Name" error={errors.name?.message} {...register('name')} />
          <Select containerClassName="col-md-2" label="Semester" placeholder="—" options={semesterOptions} error={errors.semester?.message} {...register('semester')} />
          <Input containerClassName="col-md-1" label="Credits" inputMode="numeric" error={errors.credits?.message} {...register('credits')} />
          <Input containerClassName="col-md-1" label="Pass" inputMode="numeric" error={errors.passMarks?.message} {...register('passMarks')} />
          <Input containerClassName="col-md-1" label="Max" inputMode="numeric" error={errors.maxMarks?.message} {...register('maxMarks')} />
          <div className="col-md-1">
            <Button type="submit" iconOnly icon={Plus} loading={save.isPending} aria-label="Add subject" className="w-100" />
          </div>
        </form>
      )}
      <div className="border rounded-3 overflow-hidden">
        <DataTable columns={columns} rows={subjects} isLoading={isLoading} />
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete subject?"
        message={`${toDelete?.code} — ${toDelete?.name} will be removed. Subjects used by an exam cannot be deleted.`}
        confirmLabel="Delete"
        loading={remove.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => remove.mutate(toDelete.id, { onSettled: () => setToDelete(null) })}
      />
    </Modal>
  )
}

export default SubjectsModal
