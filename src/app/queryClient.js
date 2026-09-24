import { MutationCache, QueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

/**
 * Server state lives here, never in Redux.
 *
 * - Queries are cached for 30s, so moving between pages feels instant.
 * - 4xx errors are not retried (they will not fix themselves).
 * - Every failed mutation shows a toast with the backend message, so
 *   feature code only needs to handle the success path.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => error?.status >= 500 || error?.status === 0 ? failureCount < 2 : false,
    },
  },
  mutationCache: new MutationCache({
    onError: (error, variables, context, mutation) => {
      if (mutation.meta?.silentError) return
      toast.error(error?.message || 'Something went wrong')
    },
  }),
})
