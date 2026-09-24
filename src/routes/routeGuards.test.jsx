import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import RoleRoute from './RoleRoute'
import { initialState as authInitialState } from '../store/slices/authSlice'
import { renderWithProviders, signedInAs } from '../test/renderWithProviders'

function renderRoutes(preloadedState, route = '/students') {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<div>Login page</div>} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<div>Dashboard</div>} />
        <Route element={<RoleRoute roles={['ADMIN', 'PRINCIPAL']} />}>
          <Route path="/students" element={<div>Students list</div>} />
        </Route>
      </Route>
    </Routes>,
    { preloadedState, route },
  )
}

describe('ProtectedRoute', () => {
  it('waits for the session restore before deciding', () => {
    renderRoutes({ auth: { ...authInitialState, initialized: false } })
    expect(screen.getByText(/restoring your session/i)).toBeInTheDocument()
    expect(screen.queryByText('Login page')).not.toBeInTheDocument()
  })

  it('redirects signed-out users to the login page', () => {
    renderRoutes({ auth: { ...authInitialState, initialized: true } })
    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  it('renders the page for signed-in users', () => {
    renderRoutes(signedInAs('STUDENT'), '/dashboard')
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})

describe('RoleRoute', () => {
  it('allows listed roles', () => {
    renderRoutes(signedInAs('PRINCIPAL'))
    expect(screen.getByText('Students list')).toBeInTheDocument()
  })

  it('shows an access-denied state to other roles', () => {
    renderRoutes(signedInAs('STUDENT'))
    expect(screen.queryByText('Students list')).not.toBeInTheDocument()
    expect(screen.getByText(/don’t have access/i)).toBeInTheDocument()
  })
})
