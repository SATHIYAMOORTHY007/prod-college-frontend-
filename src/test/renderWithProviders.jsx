import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { setupStore } from '../store'
import { initialState as authInitialState } from '../store/slices/authSlice'

export const signedInAs = (role, permissions = []) => ({
  auth: {
    ...authInitialState,
    initialized: true,
    isAuthenticated: true,
    accessToken: 'test-token',
    user: { id: 'u1', name: 'Test User', email: 'test@college.edu', role, permissions },
  },
})

/** Renders with a fresh store, query client and router, like the real app. */
export function renderWithProviders(ui, { preloadedState, route = '/', store = setupStore(preloadedState) } = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const result = render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </QueryClientProvider>
    </Provider>,
  )
  return { store, ...result }
}
