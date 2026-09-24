import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Button, Input, Modal, Select } from '../../components/ui'
import { ROLE_LABELS, STAFF_ROLES } from '../../constants/roles'
import { applyServerFieldErrors } from '../../utils/errors'
import { passwordRule } from '../auth/schemas'
import { useDepartmentOptions } from '../departments/useDepartments'
import { useSaveUser } from './useUsers'

const ROLE_OPTIONS = STAFF_ROLES.map((role) => ({ value: role, label: ROLE_LABELS[role] }))

const baseFields = {
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  role: z.enum(STAFF_ROLES, { error: 'Select a role' }),
  department: z.string(),
  phone: z
    .string()
    .trim()
    .refine((value) => value === '' || /^[6-9]\d{9}$/.test(value), 'Enter a valid 10-digit mobile number'),
}
const createSchema = z.object({ ...baseFields, email: z.string().trim().email('Enter a valid email address'), password: passwordRule })
const updateSchema = z.object({ ...baseFields, status: z.enum(['ACTIVE', 'INACTIVE']) })

function UserFormModal({ open, user, onClose }) {
  const isEdit = Boolean(user)
  const saveUser = useSaveUser()
  const { options: departmentOptions } = useDepartmentOptions()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(isEdit ? updateSchema : createSchema) })

  useEffect(() => {
    if (!open) return
    reset(
      isEdit
        ? { name: user.name, role: user.role, department: user.department?.id ?? '', phone: user.phone ?? '', status: user.status }
        : { name: '', email: '', password: '', role: 'EXAMINER', department: '', phone: '' },
    )
  }, [open, user, isEdit, reset])

  const onSubmit = (values) => {
    const payload = { ...values, department: values.department || (isEdit ? null : undefined) }
    if (!payload.phone) delete payload.phone
    if (payload.department === undefined) delete payload.department
    saveUser.mutate(
      { id: user?.id, ...payload },
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
      title={isEdit ? 'Edit staff member' : 'Add staff member'}
      description={isEdit ? user.email : 'Principals, examiners and administrators sign in with their email.'}
      closeDisabled={saveUser.isPending}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saveUser.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="user-form" loading={saveUser.isPending}>
            {isEdit ? 'Save changes' : 'Create account'}
          </Button>
        </>
      }
    >
      <form id="user-form" onSubmit={handleSubmit(onSubmit)} noValidate className="row g-3">
        <Input containerClassName="col-12" label="Full name" required error={errors.name?.message} {...register('name')} />
        {!isEdit && (
          <>
            <Input containerClassName="col-md-6" label="Email" type="email" required error={errors.email?.message} {...register('email')} />
            <Input
              containerClassName="col-md-6"
              label="Initial password"
              type="password"
              autoComplete="new-password"
              required
              error={errors.password?.message}
              {...register('password')}
            />
          </>
        )}
        <Select containerClassName="col-md-6" label="Role" required options={ROLE_OPTIONS} error={errors.role?.message} {...register('role')} />
        <Select containerClassName="col-md-6" label="Department" placeholder="None" options={departmentOptions} {...register('department')} />
        <Input containerClassName="col-md-6" label="Phone" inputMode="numeric" error={errors.phone?.message} {...register('phone')} />
        {isEdit && (
          <Select
            containerClassName="col-md-6"
            label="Status"
            options={[
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
            ]}
            {...register('status')}
          />
        )}
      </form>
    </Modal>
  )
}

export default UserFormModal
