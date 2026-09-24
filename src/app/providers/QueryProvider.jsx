import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient as defaultClient } from '../queryClient'

function QueryProvider({ client = defaultClient, children }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

export default QueryProvider
