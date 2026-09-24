import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Modal, Select } from '../../components/ui'
import { EXAM_TYPE_OPTIONS } from '../../constants/semesters'
import { toDateInputValue } from '../../utils/format'
import { useCourseOptions, useSemesterOptions, useSubjects } from '../courses/useCourses'
import { useExaminerOptions } from '../users/useUsers'
import { useSaveExam } from './useExams'

const objectId = (message) => z.string().regex(/^[a-f\d]{24}$/i, message)

const examSchema = z
  .object({
    name: z.string().trim().min(3, 'Name must be at least 3 characters').max(150),
    type: z.enum(['INTERNAL', 'SEMESTER', 'PRACTICAL'], { error: 'Select a type' }),
    course: objectId('Select a course'),
    semester: z.coerce.number().int().min(1, 'Select a semester').max(8),
    subjects: z.array(z.string()).min(1, 'Select at least one subject'),
    examiner: objectId('Assign an examiner'),
    startDate: z.string().min(1, 'Pick a start date'),
    endDate: z.string().min(1, 'Pick an end date'),
  })
  .refine((data) => data.endDate >= data.startDate, { message: 'End date must be on or after the start date', path: ['endDate'] })

function ExamFormModal({ exam, onClose }) {
  const open = exam !== null
  const isEdit = Boolean(exam?.id)
  const save = useSaveExam()
  const { options: courseOptions } = useCourseOptions()
  const { options: examinerOptions } = useExaminerOptions(open)

  const { register, handleSubmit, reset, watch, setValue, control, formState: { errors } } = useForm({ resolver: zodResolver(examSchema) })

  useEffect(() => {
    if (!open) return
    reset({
      name: exam?.name ?? '',
      type: exam?.type ?? 'INTERNAL',
      course: exam?.course?.id ?? '',
      semester: exam?.semester ? String(exam.semester) : '',
      subjects: exam?.subjects?.map((s) => s.id ?? s) ?? [],
      examiner: exam?.examiner?.id ?? '',
      startDate: exam?.startDate ? toDateInputValue(exam.startDate) : '',
      endDate: exam?.endDate ? toDateInputValue(exam.endDate) : '',
    })
  }, [open, exam, reset])

  const course = watch('course')
  const semester = watch('semester')
  const semesterOptions = useSemesterOptions(course)
  const { data: subjects = [], isFetching: subjectsLoading } = useSubjects(course || undefined, semester || undefined)

  // Date inputs are calendar days in the user's timezone: the exam runs from the
  // start of the first day to the end of the last day, local time.
  const onSubmit = (values) =>
    save.mutate(
      {
        id: exam?.id,
        ...values,
        startDate: new Date(`${values.startDate}T00:00:00`).toISOString(),
        endDate: new Date(`${values.endDate}T23:59:59`).toISOString(),
      },
      { onSuccess: onClose },
    )

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isEdit ? 'Edit exam' : 'Schedule exam'}
      description="Students of the course and semester are notified when an exam is scheduled."
      closeDisabled={save.isPending}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="exam-form" loading={save.isPending}>{isEdit ? 'Save changes' : 'Schedule exam'}</Button>
        </>
      }
    >
      <form id="exam-form" className="row g-3" noValidate onSubmit={handleSubmit(onSubmit)}>
        <Input containerClassName="col-md-8" label="Exam name" required placeholder="CSE Sem 3 — Internal Assessment 2" error={errors.name?.message} {...register('name')} />
        <Select containerClassName="col-md-4" label="Type" required options={EXAM_TYPE_OPTIONS} error={errors.type?.message} {...register('type')} />
        <Select
          containerClassName="col-md-8"
          label="Course"
          required
          placeholder="Select a course"
          options={courseOptions}
          error={errors.course?.message}
          {...register('course', { onChange: () => setValue('subjects', []) })}
        />
        <Select
          containerClassName="col-md-4"
          label="Semester"
          required
          placeholder="Select…"
          options={semesterOptions}
          error={errors.semester?.message}
          {...register('semester', { onChange: () => setValue('subjects', []) })}
        />

        <div className="col-12">
          <label className="form-label">
            Subjects <span className="text-danger">*</span>
          </label>
          <Controller
            control={control}
            name="subjects"
            render={({ field }) =>
              !course || !semester ? (
                <div className="form-hint">Choose a course and semester to see its subjects.</div>
              ) : subjectsLoading ? (
                <div className="form-hint">Loading subjects…</div>
              ) : subjects.length === 0 ? (
                <div className="form-hint">No subjects are defined for this semester yet.</div>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {subjects.map((subject) => {
                    const checked = field.value?.includes(subject.id)
                    return (
                      <label key={subject.id} className={`btn btn-sm ${checked ? 'btn-primary' : 'btn-secondary'}`}>
                        <input
                          type="checkbox"
                          className="d-none"
                          checked={checked}
                          onChange={() =>
                            field.onChange(checked ? field.value.filter((id) => id !== subject.id) : [...(field.value ?? []), subject.id])
                          }
                        />
                        {subject.code} · {subject.name}
                      </label>
                    )
                  })}
                </div>
              )
            }
          />
          {errors.subjects && <div className="invalid-feedback d-block">{errors.subjects.message}</div>}
        </div>

        <Select containerClassName="col-md-6" label="Examiner" required placeholder="Assign an examiner" options={examinerOptions} error={errors.examiner?.message} {...register('examiner')} />
        <Input containerClassName="col-md-3" type="date" label="Starts" required error={errors.startDate?.message} {...register('startDate')} />
        <Input containerClassName="col-md-3" type="date" label="Ends" required error={errors.endDate?.message} {...register('endDate')} />
      </form>
    </Modal>
  )
}

export default ExamFormModal
