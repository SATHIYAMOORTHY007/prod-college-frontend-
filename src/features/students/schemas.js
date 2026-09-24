import { z } from 'zod'
import { passwordRule } from '../auth/schemas'

const objectId = (message) => z.string().regex(/^[a-f\d]{24}$/i, message)
const optionalPhone = z
  .string()
  .trim()
  .refine((value) => value === '' || /^[6-9]\d{9}$/.test(value), 'Enter a valid 10-digit mobile number')

const currentYear = new Date().getFullYear()

const baseFields = {
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Enter a valid email address'),
  phone: optionalPhone,
  rollNo: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9]{4,20}$/, 'Roll number must be 4–20 letters or digits'),
  department: objectId('Select a department'),
  course: objectId('Select a course'),
  semester: z.coerce.number({ error: 'Select a semester' }).int().min(1, 'Select a semester').max(8),
  section: z.enum(['A', 'B', 'C', 'D'], { error: 'Select a section' }),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], { error: 'Select a gender' }),
  admissionYear: z.coerce
    .number({ error: 'Enter the admission year' })
    .int()
    .min(2000, 'Year must be 2000 or later')
    .max(currentYear + 1, `Year cannot be after ${currentYear + 1}`),
}

export const createStudentSchema = z.object({ ...baseFields, password: passwordRule })
export const updateStudentSchema = z.object(baseFields)

/** Drops empty optional fields so they are not sent as "". */
export function toStudentPayload(values) {
  const payload = { ...values, rollNo: values.rollNo.toUpperCase() }
  if (!payload.phone) delete payload.phone
  return payload
}
