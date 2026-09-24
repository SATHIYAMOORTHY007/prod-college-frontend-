import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/theme.css'

import App from './app/App'
import ReduxProvider from './app/providers/ReduxProvider'
import QueryProvider from './app/providers/QueryProvider'
import RouterProvider from './app/providers/RouterProvider'
import { setupApiAuth } from './app/setupApiAuth'
import { store } from './store'

setupApiAuth(store)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ReduxProvider store={store}>
      <QueryProvider>
        <RouterProvider>
          <App />
        </RouterProvider>
      </QueryProvider>
    </ReduxProvider>
  </StrictMode>,
)
