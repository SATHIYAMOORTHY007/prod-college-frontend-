import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button, Input } from '../../components/ui'
import { ROUTES } from '../../constants/routes'
import { resetPassword } from '../../store/actions/forgotPasswordActions'
import { resetForgotPasswordState } from '../../store/slices/forgotPasswordSlice'
import { applyServerFieldErrors } from '../../utils/errors'
import { resetPasswordSchema } from './schemas'

function ResetPasswordPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { loading, error } = useSelector((state) => state.forgotPassword)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(resetPasswordSchema), defaultValues: { password: '', confirmPassword: '' } })

  useEffect(() => () => dispatch(resetForgotPasswordState()), [dispatch])

  const onSubmit = async (values) => {
    const action = await dispatch(resetPassword({ token, ...values }))
    if (resetPassword.fulfilled.match(action)) {
      toast.success('Password updated. Please sign in.')
      navigate(ROUTES.LOGIN, { replace: true })
    } else {
      applyServerFieldErrors(action.payload, setError)
    }
  }

  if (!token) {
    return (
      <>
        <h2>Invalid reset link</h2>
        <p className="text-muted-cp">This link is missing its token. Request a new one.</p>
        <Link to={ROUTES.FORGOT_PASSWORD} className="btn btn-primary">
          Request new link
        </Link>
      </>
    )
  }

  return (
    <>
      <h2>Choose a new password</h2>
      <p className="text-muted-cp mb-4">At least 8 characters, with a letter and a number.</p>

      {error && (
        <div className="alert alert-danger py-2 small">
          {error}{' '}
          <Link to={ROUTES.FORGOT_PASSWORD} className="alert-link">
            Request a new link
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="d-grid gap-3">
        <Input label="New password" type="password" autoComplete="new-password" error={errors.password?.message} {...register('password')} />
        <Input
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" loading={loading} icon={KeyRound} className="w-100 py-2">
          Update password
        </Button>
      </form>
    </>
  )
}

export default ResetPasswordPage
