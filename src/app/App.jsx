import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import AppRoutes from '../routes/AppRoutes'
import { refreshSession } from '../store/actions/authActions'

const TOAST_OPTIONS = {
  duration: 3500,
  style: {
    borderRadius: '12px',
    padding: '10px 14px',
    fontSize: '0.875rem',
    color: '#0f172a',
    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12)',
    border: '1px solid #e6e8ef',
  },
  success: { iconTheme: { primary: '#059669', secondary: '#fff' } },
  error: { iconTheme: { primary: '#dc2626', secondary: '#fff' }, duration: 5000 },
}

function App() {
  const dispatch = useDispatch()

  // The access token lives in memory only, so on every page load the
  // httpOnly refresh cookie is exchanged for a new session.
  useEffect(() => {
    dispatch(refreshSession())
  }, [dispatch])

  return (
    <>
      <AppRoutes />
      <Toaster position="top-right" toastOptions={TOAST_OPTIONS} />
    </>
  )
}

export default App
