import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button, Input } from '../../components/ui'
import { ROUTES } from '../../constants/routes'
import { login } from '../../store/actions/authActions'
import { clearAuthMessages } from '../../store/slices/authSlice'
import { selectAuthError, selectAuthLoading } from '../../store/selectors/authSelectors'
import { firstName } from '../../utils/format'
import { loginSchema } from './schemas'

// Demo accounts are shown in development, and in production only for a
// public portfolio demo that opts in with VITE_SHOW_DEMO_ACCOUNTS=true.
const DEMO_ACCOUNTS = import.meta.env.DEV || import.meta.env.VITE_SHOW_DEMO_ACCOUNTS === 'true'
  ? [
      { role: 'Admin', identifier: 'admin@college.edu', password: 'Admin@123' },
      { role: 'Principal', identifier: 'principal@college.edu', password: 'Principal@123' },
      { role: 'Examiner', identifier: 'priya.raman@college.edu', password: 'Examiner@123' },
      { role: 'Student', identifier: '24CSE001', password: 'Student@123' },
    ]
  : []

function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const loading = useSelector(selectAuthLoading)
  const error = useSelector(selectAuthError)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { identifier: '', password: '' } })

  useEffect(() => () => dispatch(clearAuthMessages()), [dispatch])

  const onSubmit = async (values) => {
    const action = await dispatch(login(values))
    if (login.fulfilled.match(action)) {
      toast.success(`Welcome back, ${firstName(action.payload.user.name)}!`)
      navigate(location.state?.from?.pathname || ROUTES.DASHBOARD, { replace: true })
    }
  }

  const fillDemo = (account) => {
    setValue('identifier', account.identifier, { shouldValidate: true })
    setValue('password', account.password, { shouldValidate: true })
  }

  return (
    <>
      <h2>Welcome back</h2>
      <p className="text-muted-cp mb-4">Sign in with your college email or roll number.</p>

      {error && (
        <div className="alert alert-danger py-2 small" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="d-grid gap-3">
        <Input
          label="Email or roll number"
          autoComplete="username"
          placeholder="you@college.edu or 24CSE001"
          error={errors.identifier?.message}
          {...register('identifier')}
        />
        <div>
          <div className="d-flex justify-content-between">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <Link to={ROUTES.FORGOT_PASSWORD} className="small fw-semibold text-decoration-none">
              Forgot password?
            </Link>
          </div>
          <div className="position-relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <button
              type="button"
              className="btn btn-ghost btn-icon position-absolute end-0 me-1"
              style={{ top: 4 }}
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <Button type="submit" loading={loading} icon={LogIn} className="w-100 py-2 mt-1">
          Sign in
        </Button>
      </form>

      {DEMO_ACCOUNTS.length > 0 && (
        <div className="demo-accounts">
          <div className="small fw-semibold mb-1" style={{ color: 'var(--cp-primary-600)' }}>
            Demo accounts — click to fill
          </div>
          {DEMO_ACCOUNTS.map((account) => (
            <button key={account.role} type="button" className="demo-account" onClick={() => fillDemo(account)}>
              <span className="fw-semibold">{account.role}</span>
              <span className="text-muted-cp">{account.identifier}</span>
            </button>
          ))}
        </div>
      )}
    </>
  )
}

export default LoginPage
