import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationApi } from '../../services/notificationApi'

export const notificationKeys = {
  all: ['notifications'],
  list: (params) => ['notifications', 'list', params],
  preview: ['notifications', 'preview'],
}

export function useNotifications(params) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationApi.list(params),
    placeholderData: keepPreviousData,
  })
}

/** Topbar bell: latest few + unread count, refreshed every minute. */
export function useNotificationPreview() {
  return useQuery({
    queryKey: notificationKeys.preview,
    queryFn: () => notificationApi.list({ limit: 5 }),
    refetchInterval: 60 * 1000,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => notificationApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  })
}
