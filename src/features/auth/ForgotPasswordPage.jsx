import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { ArrowLeft, MailCheck, Send } from 'lucide-react'
import { Button, Input } from '../../components/ui'
import { ROUTES } from '../../constants/routes'
import { forgotPassword } from '../../store/actions/forgotPasswordActions'
import { resetForgotPasswordState } from '../../store/slices/forgotPasswordSlice'
import { forgotPasswordSchema } from './schemas'

function ForgotPasswordPage() {
  const dispatch = useDispatch()
  const { forgotStatus, loading, message, error } = useSelector((state) => state.forgotPassword)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: '' } })

  useEffect(() => () => dispatch(resetForgotPasswordState()), [dispatch])

  if (forgotStatus === 'succeeded') {
    return (
      <div className="text-center">
        <div className="state-icon tone-green mb-3">
          <MailCheck size={26} />
        </div>
        <h2>Check your inbox</h2>
        <p className="text-muted-cp">{message}</p>
        <p className="small text-soft">
          Sent to <strong>{getValues('email')}</strong>. The link expires in 15 minutes.
        </p>
        <Link to={ROUTES.LOGIN} className="btn btn-secondary mt-2">
          <ArrowLeft size={16} /> Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <>
      <Link to={ROUTES.LOGIN} className="small fw-semibold text-decoration-none d-inline-flex align-items-center gap-1 mb-4">
        <ArrowLeft size={15} /> Back to sign in
      </Link>
      <h2>Forgot your password?</h2>
      <p className="text-muted-cp mb-4">Enter the email on your account and we’ll send you a reset link.</p>

      {error && <div className="alert alert-danger py-2 small">{error}</div>}

      <form onSubmit={handleSubmit((values) => dispatch(forgotPassword(values)))} noValidate className="d-grid gap-3">
        <Input label="Email address" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Button type="submit" loading={loading} icon={Send} className="w-100 py-2">
          Send reset link
        </Button>
      </form>
    </>
  )
}

export default ForgotPasswordPage
