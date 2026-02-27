import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import * as studentApi from '../api/student'
import * as companyApi from '../api/company'

export function useNotifications() {
    const { user } = useAuth()
    const queryClient = useQueryClient()

    const { data, isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            if (!user) return { notifications: [] }
            if (user.role === 'student') {
                const res = await studentApi.getNotifications()
                return res.data
            }
            if (user.role === 'company') {
                const res = await companyApi.getNotifications()
                return res.data
            }
            return { notifications: [] }
        },
        enabled: !!user,
        refetchInterval: 30000,
    })

    const markRead = useMutation({
        mutationFn: (id) => studentApi.markNotificationRead(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    })

    const notifications = data?.notifications || []
    const unreadCount = notifications.filter((n) => !n.read).length

    return { notifications, unreadCount, isLoading, markRead: markRead.mutate }
}
