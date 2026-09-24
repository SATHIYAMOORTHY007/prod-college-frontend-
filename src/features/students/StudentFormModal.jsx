import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input, Modal, Select } from '../../components/ui'
import { GENDER_OPTIONS, SECTION_OPTIONS } from '../../constants/semesters'
import { applyServerFieldErrors } from '../../utils/errors'
import { useDepartmentOptions } from '../departments/useDepartments'
import { useCourseOptions, useSemesterOptions } from '../courses/useCourses'
import { createStudentSchema, toStudentPayload, updateStudentSchema } from './schemas'
import { useSaveStudent } from './useStudents'
import toast from 'react-hot-toast'

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  password: '',
  rollNo: '',
  department: '',
  course: '',
  semester: '',
  section: '',
  gender: '',
  admissionYear: String(new Date().getFullYear()),
}

function toFormValues(student) {
  if (!student) return EMPTY
  return {
    name: student.name,
    email: student.email,
    phone: student.phone ?? '',
    rollNo: student.rollNo,
    department: student.department.id,
    course: student.course.id,
    semester: String(student.semester),
    section: student.section,
    gender: student.gender,
    admissionYear: String(student.admissionYear),
  }
}

function StudentFormModal({ open, student, onClose }) {
  const isEdit = Boolean(student)
  const saveStudent = useSaveStudent()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(isEdit ? updateStudentSchema : createStudentSchema), defaultValues: EMPTY })

  useEffect(() => {
    if (open) reset(toFormValues(student))
  }, [open, student, reset])

  const department = watch('department')
  const semesterOptions = useSemesterOptions(watch('course'))
  const { options: departmentOptions } = useDepartmentOptions()
  const { options: courseOptions, isFetching: coursesLoading } = useCourseOptions(department || undefined)

  const onSubmit = (values) => {
    saveStudent.mutate(
      { id: student?.id, ...toStudentPayload(values) },
      {
        onSuccess: onClose,
        onError: (error) => {
          if (!applyServerFieldErrors(error, setError)) toast.error(error.message)
        },
      },
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isEdit ? 'Edit student' : 'Add student'}
      description={isEdit ? `Update ${student.name}’s details.` : 'Create the student account and academic profile.'}
      closeDisabled={saveStudent.isPending}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saveStudent.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="student-form" loading={saveStudent.isPending}>
            {isEdit ? 'Save changes' : 'Create student'}
          </Button>
        </>
      }
    >
      <form id="student-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <h3 className="h6 text-muted-cp text-uppercase small mb-3">Personal</h3>
        <div className="row g-3 mb-4">
          <Input containerClassName="col-md-6" label="Full name" required error={errors.name?.message} {...register('name')} />
          <Input containerClassName="col-md-6" label="Email" type="email" required error={errors.email?.message} {...register('email')} />
          <Input containerClassName="col-md-4" label="Phone" inputMode="numeric" placeholder="10-digit mobile" error={errors.phone?.message} {...register('phone')} />
          <Select containerClassName="col-md-4" label="Gender" required placeholder="Select…" options={GENDER_OPTIONS} error={errors.gender?.message} {...register('gender')} />
          {!isEdit && (
            <Input
              containerClassName="col-md-4"
              label="Initial password"
              type="password"
              autoComplete="new-password"
              required
              hint="Min. 8 characters, a letter and a number"
              error={errors.password?.message}
              {...register('password')}
            />
          )}
        </div>

        <h3 className="h6 text-muted-cp text-uppercase small mb-3">Academic</h3>
        <div className="row g-3">
          <Input containerClassName="col-md-4" label="Roll number" required placeholder="24CSE001" error={errors.rollNo?.message} {...register('rollNo')} />
          <Select
            containerClassName="col-md-8"
            label="Department"
            required
            placeholder="Select a department"
            options={departmentOptions}
            error={errors.department?.message}
            {...register('department', { onChange: () => setValue('course', '') })}
          />
          <Select
            containerClassName="col-md-6"
            label="Course"
            required
            placeholder={department ? (coursesLoading ? 'Loading…' : 'Select a course') : 'Select a department first'}
            options={courseOptions}
            disabled={!department}
            error={errors.course?.message}
            {...register('course')}
          />
          <Select containerClassName="col-md-2" label="Semester" required placeholder="—" options={semesterOptions.map((o) => ({ ...o, label: o.value }))} error={errors.semester?.message} {...register('semester')} />
          <Select containerClassName="col-md-2" label="Section" required placeholder="—" options={SECTION_OPTIONS.map((o) => ({ ...o, label: o.value }))} error={errors.section?.message} {...register('section')} />
          <Input containerClassName="col-md-2" label="Batch" inputMode="numeric" required error={errors.admissionYear?.message} {...register('admissionYear')} />
        </div>
      </form>
    </Modal>
  )
}

export default StudentFormModal
